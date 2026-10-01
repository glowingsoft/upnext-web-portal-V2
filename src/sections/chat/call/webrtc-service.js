import { CONFIG } from 'src/config-global';

// Browser port of the mobile app's webrtcService.ts — signaling helper
// around a single RTCPeerConnection. Audio calling has a mobile (RN)
// counterpart; video is web-only — the mobile app has no camera UI at all.
// No RN/InCallManager/platform branching here: browsers negotiate their own
// audio output device, so the mobile file's CallKit/InCallManager sequencing
// rules don't apply.
//
// TURN is required, not optional: STUN only helps two peers find each other
// when a *direct* path exists between them. The moment either side is behind
// a symmetric NAT / carrier-grade NAT (mobile networks are almost always
// this) or a restrictive firewall, there is no direct path, and without a
// TURN relay the connection silently carries no media even though signaling
// (offer/answer/ICE) completes fine and the UI shows "connected".
//
// Real TURN credentials come from our own backend (GET .../app/webrtc/ice-servers,
// Bearer-authenticated) — see fetchBackendIceServers() below and
// config-global.js for the full resolution order. That endpoint fronts a
// coturn deployment DevOps run on AWS, minting short-lived credentials
// per request rather than exposing a static secret in the client bundle.
// If it's unreachable, this falls back to static creds
// (VITE_TURN_URLS/USERNAME/CREDENTIAL), then to the fully public,
// unauthenticated openrelay.metered.ca relay as a last resort — no uptime
// SLA, shared bandwidth with every other unconfigured app using it. That
// last-resort fallback is exactly what causes "connected but no audio" once
// real users are on separate networks/NATs (it gets rate-limited/blocked
// under real load), so it should never be reached in production.
const FALLBACK_TURN_SERVERS = [
  { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
];

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

const ICE_SERVERS_ENDPOINT = `${import.meta.env.VITE_BASE_URL}/app/webrtc/ice-servers`;
// Guards against a hung/unresponsive backend stalling call setup indefinitely
// — a timeout is itself a failure mode worth handling explicitly, not just
// network errors and bad status codes.
const ICE_SERVERS_FETCH_TIMEOUT_MS = 8000;

// Fetched fresh per-call (not cached across the app's lifetime) since a
// credential minted at page-load could easily have expired by the time a
// call actually starts — the endpoint's response includes a `ttl` (seconds)
// but we don't rely on client-side caching against it, we just ask fresh
// every time, same as the fetch-per-call pattern this replaced.
async function fetchBackendIceServers(accessToken) {
  if (!accessToken) {
    console.warn('[WebRTC] No access token available for ICE servers request — falling back to static config.');
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ICE_SERVERS_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(ICE_SERVERS_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`status ${res.status}`);

    const body = await res.json();
    const iceServers = body?.data?.iceServers;

    if (!Array.isArray(iceServers) || !iceServers.length) throw new Error('empty or malformed response');

    return iceServers;
  } catch (e) {
    const reason = e?.name === 'AbortError' ? `timed out after ${ICE_SERVERS_FETCH_TIMEOUT_MS}ms` : e;
    console.warn('[WebRTC] Backend ICE servers request failed, falling back to static config:', reason);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildStaticIceServers() {
  const { turnUrls, turnUsername, turnCredential } = CONFIG.webrtc;

  if (turnUrls.length && turnUsername && turnCredential) {
    return [...STUN_SERVERS, { urls: turnUrls, username: turnUsername, credential: turnCredential }];
  }

  if (import.meta.env.PROD) {
    // eslint-disable-next-line no-console
    console.warn(
      '[WebRTC] Backend ICE servers unavailable and no static TURN configured (VITE_TURN_URLS/USERNAME/CREDENTIAL) in production — ' +
        'falling back to a free public TURN relay that is not reliable for real traffic. ' +
        'Calls between users on restrictive/symmetric NATs will likely connect with no audio.'
    );
  }

  return [...STUN_SERVERS, ...FALLBACK_TURN_SERVERS];
}

async function getIceServers(accessToken) {
  const fromBackend = await fetchBackendIceServers(accessToken);
  return fromBackend || buildStaticIceServers();
}

// Constrained rather than default/full-res — video relays through TURN cost
// real bandwidth against a limited monthly quota (see config-global.js), and
// a call doesn't need more than this to be usable.
const VIDEO_CONSTRAINTS = { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } };

export class WebRTCService {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.pc = null;
    this.localStream = null;
    this.remoteStream = null;
    this.remoteStreamFired = false;
  }

  async init({ video = false, accessToken } = {}) {
    // getUserMedia is only available in a secure context (HTTPS, or the literal
    // host "localhost"). Testing across two devices via a plain
    // http://<lan-ip>:5173 dev URL does NOT qualify, so this throws here with a
    // clear message instead of navigator.mediaDevices being undefined and
    // failing with an opaque "Cannot read properties of undefined" error.
    if (!window.isSecureContext) {
      throw new Error('Microphone access requires a secure context (HTTPS or localhost). Calling will not work over a plain http:// LAN address — use HTTPS (or a tunnel like ngrok) to test across devices.');
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('This browser does not support calling (getUserMedia unavailable).');
    }

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: video ? VIDEO_CONSTRAINTS : false });
    } catch (e) {
      if (!video) throw e;
      // Camera denied/unavailable shouldn't take the mic down with it — degrade
      // to audio-only instead of failing the whole call. The hook downgrades
      // callMode and shows a non-fatal notice via onVideoUnavailable.
      console.warn('[WebRTC] video getUserMedia failed, falling back to audio-only:', e);
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.callbacks.onVideoUnavailable?.();
    }
    this.localStream.getTracks().forEach((t) => {
      t.enabled = true;
    });

    const iceServers = await getIceServers(accessToken);
    this.pc = new RTCPeerConnection({ iceServers });

    this.localStream.getTracks().forEach((track) => {
      this.pc.addTrack(track, this.localStream);
    });

    // Per-candidate/per-state-change logging was useful while debugging the
    // original "connected but no audio" issue, but at high frequency (video
    // roughly doubles candidate count — one set per m-line) console logging
    // with devtools open is itself a measurable perf cost. Keep only the
    // state transitions that matter for diagnosis, not every intermediate event.
    this.pc.addEventListener('icecandidate', (event) => {
      if (event.candidate) this.callbacks.onIceCandidate(event.candidate);
    });

    this.pc.addEventListener('iceconnectionstatechange', () => {
      if (this.pc?.iceConnectionState === 'connected' || this.pc?.iceConnectionState === 'completed') {
        this.logSelectedCandidatePair();
      }
    });

    this.pc.addEventListener('track', (event) => {
      if (!event.streams?.[0] || this.remoteStreamFired) return;
      this.remoteStreamFired = true;

      const stream = event.streams[0];
      this.remoteStream = stream;
      // Video calls carry both an audio and a video track — enable whatever
      // arrives, not just audio (that was fine while calling was audio-only).
      stream.getTracks().forEach((t) => {
        t.enabled = true;
      });

      this.callbacks.onRemoteStream(stream);
    });

    this.pc.addEventListener('connectionstatechange', () => {
      const state = this.pc?.connectionState;
      console.log('[WebRTC] connectionState:', state);
      if (state) this.callbacks.onConnectionStateChange?.(state);
    });
  }

  // Logs which candidate pair actually got selected (host = direct P2P,
  // srflx = STUN-discovered public address, relay = TURN) — the single most
  // useful fact for diagnosing "connected but no audio".
  async logSelectedCandidatePair() {
    if (!this.pc) return;
    try {
      const stats = await this.pc.getStats();
      stats.forEach((report) => {
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          const local = stats.get(report.localCandidateId);
          const remote = stats.get(report.remoteCandidateId);
          console.log('[WebRTC] selected candidate pair:', {
            localType: local?.candidateType,
            remoteType: remote?.candidateType,
          });
        }
      });
    } catch (e) {
      console.warn('[WebRTC] getStats error:', e);
    }
  }

  async createOffer() {
    if (!this.pc) throw new Error('PeerConnection not initialized');
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(remoteOffer) {
    if (!this.pc) throw new Error('PeerConnection not initialized');
    await this.pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  async setRemoteAnswer(answer) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async addIceCandidate(candidate) {
    if (!this.pc) return;
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.warn('[WebRTC] addIceCandidate error:', e);
    }
  }

  toggleMute(muted) {
    this.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }

  toggleCamera(cameraOff) {
    this.localStream?.getVideoTracks().forEach((t) => {
      t.enabled = !cameraOff;
    });
  }

  cleanup() {
    this.remoteStreamFired = false;
    this.localStream?.getTracks().forEach((t) => {
      t.enabled = false;
      t.stop();
    });
    this.pc?.close();
    this.pc = null;
    this.localStream = null;
    this.remoteStream = null;
  }
}
