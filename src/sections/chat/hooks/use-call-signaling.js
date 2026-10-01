import { useCallback, useEffect, useRef, useState } from 'react';

import { WebRTCService } from '../call/webrtc-service';
import { incomingRingtone, outgoingRingback } from '../call/ringtone';

// ----------------------------------------------------------------------

// Web port of the mobile app's callManager.ts + the call-handling logic
// embedded in its CallScreen/IncomingCallScreen — minus everything native
// (CallKeep, push notifications, navigation retries) that has no browser
// equivalent. Same socket event vocabulary as mobile so the shared backend
// needs no changes: callUser/answerCall/iceCandidate/endCall/rejectCall/
// busyCall (emit) and incomingCall/callAnswered/iceCandidate/callEnded/
// callRejected/callBusy (listen).

// Real (cross-device, cross-NAT) connections commonly flap through
// RTCPeerConnection's 'disconnected' state for a few seconds — from brief
// packet loss, a Wi-Fi roam, etc — before recovering on their own. Treating
// 'disconnected' as instant, permanent failure (as this used to) is why
// calls between two different machines died the moment anything less ideal
// than a same-machine loopback connection was involved. Give it a window to
// self-heal before giving up.
const DISCONNECT_GRACE_MS = 8000;

// Safety net for the case where signaling completes (offer/answer/ICE all
// exchanged) but the connection never actually reaches 'connected' — e.g. a
// TURN relay that is unreachable/overloaded. Without this the call sits in
// "Connecting…" forever with no feedback, which is worse than failing loudly.
const CONNECT_TIMEOUT_MS = 30000;

// TEMPORARY testing override — see CHAT_MODULE.md "Known backend gap". The
// backend currently drops `callType` when relaying callUser → incomingCall,
// so every incoming call looks identical to "callType missing" right now,
// with no way to tell a real audio call from a video one that lost the field
// in transit. Flip this back to 'audio' (or delete it and inline 'audio'
// below) the moment the backend fix ships — leaving it on 'video' after that
// would make real audio-only calls (e.g. anything from the mobile app, which
// never sends callType at all) incorrectly open the callee's camera.
const DEFAULT_CALL_TYPE_WHEN_MISSING = 'video';

export function useCallSignaling({ socket, accessToken }) {
  const [callState, setCallState] = useState('idle'); // idle | outgoing | incoming | connecting | connected | ended | busy | failed
  const [peer, setPeer] = useState(null); // { _id, name, avatarUrl } of the other party in the call
  const [callMode, setCallMode] = useState('audio'); // 'audio' | 'video' — set before the call screen even opens
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  // Populated on local setup failure (getUserMedia/secure-context/browser-support
  // errors) so the UI can show the real reason instead of a generic "Connection
  // failed" — those errors happen synchronously, before any network exchange,
  // so a vague message here is actively misleading for debugging.
  const [errorMessage, setErrorMessage] = useState('');
  // Separate from errorMessage: a non-fatal heads-up shown on an otherwise-live
  // call (e.g. camera denied → downgraded to audio-only) rather than a failure.
  const [noticeMessage, setNoticeMessage] = useState('');

  const rtcRef = useRef(null);
  const peerRef = useRef(null);
  const callModeRef = useRef('audio');
  const pendingOfferRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const remoteDescSetRef = useRef(false);
  const callStateRef = useRef('idle');
  const mountedRef = useRef(true);
  const resetTimerRef = useRef(null);
  const disconnectGraceTimerRef = useRef(null);
  const connectTimeoutRef = useRef(null);
  // Tracks whether THIS call ever reached 'connected', so a later failure
  // can be reported honestly as "call ended" (was live, then dropped) vs
  // "connection failed" (never actually established) instead of one vague
  // message for both.
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    callModeRef.current = callMode;
  }, [callMode]);

  useEffect(() => {
    // Reset to true on every (re-)mount — React.StrictMode double-invokes
    // effects once in dev (mount → cleanup → mount), which would otherwise
    // pin this to false forever after the very first mount, silently
    // breaking every mountedRef-gated state update below.
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  // Ring tones follow callState declaratively — incoming plays only while
  // 'incoming' (silenced the instant it's answered/declined/cancelled),
  // ringback plays only while 'outgoing' (silenced once answered/ended/busy).
  useEffect(() => {
    if (callState === 'incoming') incomingRingtone.start();
    else incomingRingtone.stop();

    if (callState === 'outgoing') outgoingRingback.start();
    else outgoingRingback.stop();

    return () => {
      incomingRingtone.stop();
      outgoingRingback.stop();
    };
  }, [callState]);

  const clearDisconnectGrace = useCallback(() => {
    if (disconnectGraceTimerRef.current) {
      clearTimeout(disconnectGraceTimerRef.current);
      disconnectGraceTimerRef.current = null;
    }
  }, []);

  const clearConnectTimeout = useCallback(() => {
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }
  }, []);

  const cleanupCall = useCallback(() => {
    clearDisconnectGrace();
    clearConnectTimeout();
    rtcRef.current?.cleanup();
    rtcRef.current = null;
    pendingCandidatesRef.current = [];
    remoteDescSetRef.current = false;
    pendingOfferRef.current = null;
    hasConnectedRef.current = false;
    setRemoteStream(null);
    setLocalStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setCallMode('audio');
    setNoticeMessage('');
  }, [clearDisconnectGrace, clearConnectTimeout]);

  const scheduleIdleReset = useCallback((delay) => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setCallState('idle');
      setPeer(null);
      peerRef.current = null;
    }, delay);
  }, []);

  const flushPendingCandidates = useCallback(async () => {
    remoteDescSetRef.current = true;
    const queued = pendingCandidatesRef.current;
    pendingCandidatesRef.current = [];
    for (const candidate of queued) {
      // eslint-disable-next-line no-await-in-loop
      await rtcRef.current?.addIceCandidate(candidate);
    }
  }, []);

  // Terminal failure path shared by the disconnect-grace timeout, the
  // connect-establishment timeout, and a hard 'failed'/'closed' PC state.
  // Always tells the peer explicitly (endCall) instead of just going silent
  // locally — otherwise a failure detected on only one side leaves the other
  // side's call screen hanging indefinitely.
  const finalizeCallFailure = useCallback(() => {
    const otherUser = peerRef.current;
    const reachedConnected = hasConnectedRef.current;

    if (socket && otherUser?._id) {
      socket.emit('endCall', { targetUserId: otherUser._id });
    }

    cleanupCall();
    // Honest messaging: a call that was live and then dropped is "ended";
    // a call that never actually established media is a connection "failed"
    // (almost always a TURN/network problem, not a user action) — see
    // ChatCallScreen for the copy shown for each.
    setCallState(reachedConnected ? 'ended' : 'failed');
    scheduleIdleReset(reachedConnected ? 1000 : 2500);
  }, [socket, cleanupCall, scheduleIdleReset]);

  const handleConnectionStateChange = useCallback(
    (state) => {
      if (!mountedRef.current) return;
      if (!['outgoing', 'connecting', 'connected'].includes(callStateRef.current)) return;

      if (state === 'connected') {
        clearDisconnectGrace();
        clearConnectTimeout();
        hasConnectedRef.current = true;
        setCallState('connected');
        return;
      }

      if (state === 'disconnected') {
        if (disconnectGraceTimerRef.current) return; // grace window already running
        disconnectGraceTimerRef.current = setTimeout(() => {
          disconnectGraceTimerRef.current = null;
          if (!mountedRef.current) return;
          if (!['outgoing', 'connecting', 'connected'].includes(callStateRef.current)) return;
          finalizeCallFailure();
        }, DISCONNECT_GRACE_MS);
        return;
      }

      if (state === 'failed' || state === 'closed') {
        finalizeCallFailure();
      }
    },
    [clearDisconnectGrace, clearConnectTimeout, finalizeCallFailure]
  );

  const startConnectTimeout = useCallback(() => {
    clearConnectTimeout();
    connectTimeoutRef.current = setTimeout(() => {
      connectTimeoutRef.current = null;
      if (!mountedRef.current || callStateRef.current === 'connected') return;
      finalizeCallFailure();
    }, CONNECT_TIMEOUT_MS);
  }, [clearConnectTimeout, finalizeCallFailure]);

  // Shared RTCPeerConnection callback wiring for both caller and callee sides
  // (previously duplicated near-verbatim in startCall/acceptCall). Reads the
  // current peer from peerRef rather than closing over a parameter, since
  // it's always constructed right after peerRef is set.
  const buildRtcCallbacks = useCallback(
    () => ({
      onIceCandidate: (candidate) => {
        const otherUser = peerRef.current;
        if (socket && otherUser?._id) socket.emit('iceCandidate', { targetUserId: otherUser._id, candidate });
      },
      onRemoteStream: (stream) => {
        // Only stores the track — call phase is driven exclusively by real
        // RTCPeerConnection connectionState (below), not by ontrack. ontrack
        // fires as soon as SDP negotiation assigns a receiving track, which
        // happens well before ICE/DTLS actually connects. Flipping to
        // "Connected" here (as this used to) is exactly why calls could show
        // "Connected" in production with no audio ever flowing: the UI
        // declared success before the media path existed.
        if (!mountedRef.current) return;
        setRemoteStream(stream);
      },
      onConnectionStateChange: handleConnectionStateChange,
      onVideoUnavailable: () => {
        // Camera was denied/unavailable — WebRTCService already fell back to an
        // audio-only getUserMedia call rather than failing outright. Reflect
        // that downgrade in the UI instead of pretending video is still live.
        if (!mountedRef.current) return;
        setCallMode('audio');
        setNoticeMessage('Camera unavailable — continuing as an audio-only call.');
      },
    }),
    [socket, handleConnectionStateChange]
  );

  const startCall = useCallback(
    async (otherUser, mode = 'audio') => {
      if (!socket || !otherUser?._id || callStateRef.current !== 'idle') return;

      peerRef.current = otherUser;
      callModeRef.current = mode;
      setPeer(otherUser);
      setCallState('outgoing');
      setCallMode(mode);
      setErrorMessage('');
      hasConnectedRef.current = false;

      const rtc = new WebRTCService(buildRtcCallbacks());
      rtcRef.current = rtc;

      try {
        await rtc.init({ video: mode === 'video', accessToken });
        setLocalStream(rtc.localStream);
        const offer = await rtc.createOffer();
        console.log(`[useCallSignaling] emitting callUser with callType=${mode}`);
        socket.emit('callUser', { targetUserId: otherUser._id, offer, callType: mode });
        startConnectTimeout();
      } catch (e) {
        console.error('[useCallSignaling] startCall error:', e);
        // Tell the callee's side to stop ringing instead of leaving it dangling
        // with no idea the caller's mic/WebRTC setup failed.
        socket.emit('endCall', { targetUserId: otherUser._id });
        cleanupCall();
        setCallState('failed');
        setErrorMessage(e?.message || 'Could not start the call.');
        setPeer(null);
        peerRef.current = null;
        scheduleIdleReset(2500);
      }
    },
    [socket, accessToken, cleanupCall, scheduleIdleReset, buildRtcCallbacks, startConnectTimeout]
  );

  const acceptCall = useCallback(async () => {
    if (!socket || callStateRef.current !== 'incoming' || !pendingOfferRef.current) return;
    const otherUser = peerRef.current;
    const offer = pendingOfferRef.current;

    // Leave the incoming (Answer/Decline) UI immediately so the callee sees
    // feedback right away instead of a screen that looks unresponsive while
    // WebRTC negotiates in the background.
    setCallState('connecting');
    setErrorMessage('');
    hasConnectedRef.current = false;

    const rtc = new WebRTCService(buildRtcCallbacks());
    rtcRef.current = rtc;

    try {
      await rtc.init({ video: callModeRef.current === 'video', accessToken });
      setLocalStream(rtc.localStream);
      const answer = await rtc.createAnswer(offer);
      await flushPendingCandidates();
      socket.emit('answerCall', { targetUserId: otherUser._id, answer });
      startConnectTimeout();
    } catch (e) {
      console.error('[useCallSignaling] acceptCall error:', e);
      // Same reasoning as startCall's catch: notify the caller so their
      // screen doesn't sit in "Calling…" forever after our side blew up
      // locally (e.g. mic blocked, insecure context — see webrtc-service.js).
      if (otherUser?._id) socket.emit('endCall', { targetUserId: otherUser._id });
      cleanupCall();
      setCallState('failed');
      setErrorMessage(e?.message || 'Could not answer the call.');
      setPeer(null);
      peerRef.current = null;
      scheduleIdleReset(2500);
    }
  }, [socket, accessToken, cleanupCall, scheduleIdleReset, flushPendingCandidates, buildRtcCallbacks, startConnectTimeout]);

  // Single hang-up action for decline (incoming), cancel (outgoing) and end (connected).
  const hangUp = useCallback(() => {
    const state = callStateRef.current;
    if (state === 'idle' || state === 'ended' || state === 'busy') return;
    const otherUser = peerRef.current;

    if (socket && otherUser?._id) {
      socket.emit(state === 'incoming' ? 'rejectCall' : 'endCall', { targetUserId: otherUser._id });
    }

    cleanupCall();
    setCallState('ended');
    scheduleIdleReset(500);
  }, [socket, cleanupCall, scheduleIdleReset]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      rtcRef.current?.toggleMute(next);
      return next;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    setIsCameraOff((prev) => {
      const next = !prev;
      rtcRef.current?.toggleCamera(next);
      return next;
    });
  }, []);

  // ── Socket listeners ──────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return undefined;

    const onIncomingCall = ({ callerId, callerName, callerAvatar, offer, callType }) => {
      console.log(`[useCallSignaling] incomingCall payload callType=${callType ?? '(missing)'}`);
      if (callStateRef.current !== 'idle') {
        socket.emit('busyCall', { targetUserId: callerId });
        return;
      }
      const otherUser = { _id: callerId, name: callerName || 'Unknown', avatarUrl: callerAvatar || '' };
      const mode = callType === 'video' ? 'video' : callType === 'audio' ? 'audio' : DEFAULT_CALL_TYPE_WHEN_MISSING;
      peerRef.current = otherUser;
      callModeRef.current = mode;
      pendingOfferRef.current = offer;
      setPeer(otherUser);
      setCallMode(mode);
      setErrorMessage('');
      setNoticeMessage('');
      setCallState('incoming');
    };

    const onCallAnswered = async ({ answer }) => {
      if (callStateRef.current !== 'outgoing' || !rtcRef.current) return;
      await rtcRef.current.setRemoteAnswer(answer);
      await flushPendingCandidates();
    };

    const onIceCandidate = async ({ candidate }) => {
      // Candidates can arrive before the callee has even answered — rtcRef.current
      // is still null at that point (no RTCPeerConnection exists until acceptCall
      // runs). Queue in that case too instead of dropping the candidate, otherwise
      // every candidate sent while the call is ringing is lost forever and the
      // connection can end up with no usable candidate pair once finally answered.
      if (rtcRef.current && remoteDescSetRef.current) {
        await rtcRef.current.addIceCandidate(candidate);
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    };

    const onCallEnded = () => {
      if (['idle', 'ended', 'failed'].includes(callStateRef.current)) return;
      cleanupCall();
      setCallState('ended');
      scheduleIdleReset(1000);
    };

    const onCallRejected = () => {
      if (['idle', 'ended', 'failed'].includes(callStateRef.current)) return;
      cleanupCall();
      setCallState('ended');
      scheduleIdleReset(1000);
    };

    const onCallBusy = () => {
      if (callStateRef.current === 'idle') return;
      cleanupCall();
      setCallState('busy');
      scheduleIdleReset(2000);
    };

    // Same account logged into multiple devices, all ringing for the same
    // incoming call — once ONE of them answers, the backend tells the
    // others to stop ringing via this event (same contract the mobile app's
    // IncomingCallScreen already relies on). Deliberately does NOT emit
    // rejectCall here: the call is genuinely active now, just on a sibling
    // device, so rejecting would cancel a call that isn't actually ending —
    // this device just silently drops out of it.
    const onCallAnsweredElsewhere = () => {
      if (callStateRef.current !== 'incoming') return;
      cleanupCall();
      setCallState('idle');
      setPeer(null);
      peerRef.current = null;
    };

    socket.on('incomingCall', onIncomingCall);
    socket.on('callAnswered', onCallAnswered);
    socket.on('iceCandidate', onIceCandidate);
    socket.on('callEnded', onCallEnded);
    socket.on('callRejected', onCallRejected);
    socket.on('callBusy', onCallBusy);
    socket.on('callAnsweredElsewhere', onCallAnsweredElsewhere);

    return () => {
      socket.off('incomingCall', onIncomingCall);
      socket.off('callAnswered', onCallAnswered);
      socket.off('iceCandidate', onIceCandidate);
      socket.off('callEnded', onCallEnded);
      socket.off('callRejected', onCallRejected);
      socket.off('callBusy', onCallBusy);
      socket.off('callAnsweredElsewhere', onCallAnsweredElsewhere);
    };
  }, [socket, cleanupCall, scheduleIdleReset, flushPendingCandidates]);

  // Hang up cleanly if the whole hook unmounts mid-call (e.g. user navigates away).
  useEffect(
    () => () => {
      if (callStateRef.current !== 'idle' && callStateRef.current !== 'ended') {
        const otherUser = peerRef.current;
        if (socket && otherUser?._id) {
          socket.emit(callStateRef.current === 'incoming' ? 'rejectCall' : 'endCall', { targetUserId: otherUser._id });
        }
        rtcRef.current?.cleanup();
      }
    },
    [socket]
  );

  return {
    callState,
    peer,
    callMode,
    remoteStream,
    localStream,
    isMuted,
    isCameraOff,
    errorMessage,
    noticeMessage,
    isCallActive: callState !== 'idle',
    startCall,
    acceptCall,
    hangUp,
    toggleMute,
    toggleCamera,
  };
}
