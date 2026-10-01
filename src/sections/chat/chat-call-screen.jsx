import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function formatDuration(totalSeconds) {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function CallControlButton({ icon, label, danger = false, success = false, active = false, size = 56, onClick }) {
  const bgcolor = danger ? 'error.main' : success ? 'success.main' : active ? 'primary.main' : 'background.paper';
  const hoverBgcolor = danger ? 'error.dark' : success ? 'success.dark' : active ? 'primary.dark' : 'background.neutral';
  const color = danger || success || active ? 'common.white' : 'text.primary';

  return (
    <Stack spacing={1} alignItems="center">
      <IconButton
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          color,
          bgcolor,
          boxShadow: (theme) => theme.customShadows.z8,
          '&:hover': { bgcolor: hoverBgcolor },
        }}
      >
        <Iconify icon={icon} width={Math.round(size * 0.42)} />
      </IconButton>

      <Typography variant="caption" sx={{ color: 'common.white' }}>
        {label}
      </Typography>
    </Stack>
  );
}

export function ChatCallScreen({
  open,
  mode = 'audio',
  phase = 'connected',
  otherUser,
  remoteStream,
  localStream,
  isMuted = false,
  isCameraOff = false,
  errorMessage = '',
  noticeMessage = '',
  onToggleMute,
  onToggleCamera,
  onClose,
  onAccept,
  onDecline,
}) {
  const [elapsed, setElapsed] = useState(0);
  // Some browsers (Safari/iOS reliably, Chrome on a fresh/low-engagement
  // origin) reject unmuted autoplay when play() isn't called synchronously
  // inside a user-gesture handler — which it can't be here, since the stream
  // only exists once WebRTC negotiation finishes, well after the Answer
  // click. When that happens the call looks "Connected" with total silence
  // and no indication why. This flag drives a manual "Tap to enable audio"
  // fallback whose click IS a genuine gesture, guaranteeing playback resumes.
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);
  const previewVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const isIncoming = phase === 'incoming';
  const isOutgoing = phase === 'outgoing';
  const isConnecting = phase === 'connecting';
  const isConnected = phase === 'connected';
  const isBusy = phase === 'busy';
  const isEnded = phase === 'ended';
  const isFailed = phase === 'failed';
  const isWrappingUp = isBusy || isEnded || isFailed;

  // Bind the real remote audio track once the call is connected — this is the
  // actual call audio, independent of the local camera preview below (which
  // only exists for the still-unwired video-mode UI).
  useEffect(() => {
    const audioEl = remoteAudioRef.current;
    if (!audioEl) return;
    if (remoteStream) {
      audioEl.srcObject = remoteStream;
      audioEl
        .play()
        .then(() => setNeedsAudioUnlock(false))
        .catch((err) => {
          console.warn('[ChatCallScreen] remote audio play() blocked, awaiting user gesture:', err);
          setNeedsAudioUnlock(true);
        });
    } else {
      audioEl.srcObject = null;
      setNeedsAudioUnlock(false);
    }
  }, [remoteStream]);

  const handleUnlockAudio = useCallback(() => {
    remoteAudioRef.current
      ?.play()
      .then(() => setNeedsAudioUnlock(false))
      .catch((err) => console.warn('[ChatCallScreen] remote audio play() still blocked after user gesture:', err));
  }, []);

  useEffect(() => {
    if (!open || !isConnected) {
      setElapsed(0);
      return undefined;
    }

    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected, open]);

  // Local preview binds to the real WebRTC local stream (owned by
  // useCallSignaling/WebRTCService) — not a separate getUserMedia call, so
  // what's shown here is exactly what the other party actually receives.
  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video) return;
    if (localStream && localStream.getVideoTracks().length && !isCameraOff) {
      video.srcObject = localStream;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [localStream, isCameraOff]);

  // Remote video — visual only. Audio for both call modes plays through the
  // hidden <audio> element above; this element MUST stay muted or the remote
  // party's audio would play twice (once per element bound to the stream).
  useEffect(() => {
    const video = remoteVideoRef.current;
    if (!video) return;
    if (remoteStream && remoteStream.getVideoTracks().length) {
      video.srcObject = remoteStream;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [remoteStream]);

  const cameraError = mode === 'video' && localStream && !localStream.getVideoTracks().length ? 'Camera unavailable' : '';
  const hasRemoteVideo = mode === 'video' && !!remoteStream?.getVideoTracks().length;

  const title = mode === 'video' ? 'Video call' : 'Audio call';
  const avatarName = otherUser?.name || 'Unknown user';
  const headerStatus = isIncoming
    ? 'Incoming call'
    : isOutgoing
      ? 'Calling'
      : isConnecting
        ? 'Connecting'
        : isBusy
          ? 'Busy'
          : isFailed
            ? 'Connection failed'
            : isEnded
              ? 'Call ended'
              : 'Connected';
  const heroTitle = isIncoming
    ? 'Ready to answer?'
    : isOutgoing
      ? 'Ringing…'
      : isConnecting
        ? 'Connecting…'
        : isBusy
          ? `${avatarName} is busy`
          : isFailed
            ? 'Connection failed'
            : isEnded
              ? 'Call ended'
              : avatarName;
  const heroDescription = isIncoming
    ? `${avatarName} is calling you ${mode === 'video' ? 'with video' : 'right now'}.`
    : isOutgoing
      ? mode === 'video'
        ? 'Starting a secure video call.'
        : 'Starting a secure audio call.'
      : isConnecting
        ? 'Joining the call…'
        : isBusy
          ? `${avatarName} is already on another call.`
          : isFailed
            ? errorMessage || 'Could not establish a connection. Check your network and try again.'
            : isEnded
              ? 'This call has ended.'
              : mode === 'video'
                ? 'Live video call in progress'
                : 'Live audio call in progress';
  const handleDecline = onDecline || onClose;
  const handleAccept = onAccept || (() => {});

  const backdropStyle = useMemo(
    () => ({
      background:
        mode === 'video' ? 'linear-gradient(140deg, #0f172a 0%, #1e293b 45%, #0b1120 100%)' : 'radial-gradient(1200px 620px at 50% 20%, #1f2937 0%, #0b1220 70%, #04070f 100%)',
    }),
    [mode]
  );

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      {/* Not visible — carries the real remote call audio, independent of the UI. */}
      <Box component="audio" ref={remoteAudioRef} autoPlay sx={{ display: 'none' }} />

      <Box
        sx={{
          ...backdropStyle,
          width: 1,
          height: 1,
          display: 'flex',
          flexDirection: 'column',
          color: 'common.white',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: { xs: 2, md: 3 },
            py: mode === 'video' ? 1.25 : { xs: 2, md: 3 },
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.25),
            backdropFilter: 'blur(8px)',
          }}
        >
          {mode === 'video' ? (
            <Stack direction="row" alignItems="baseline" spacing={1.25}>
              <Typography variant="subtitle1">{avatarName}</Typography>
              <Typography variant="caption" sx={{ color: 'grey.300' }}>
                {isConnected ? formatDuration(elapsed) : headerStatus}
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={0.5}>
              <Typography variant="overline" sx={{ letterSpacing: 1.5, color: 'grey.400' }}>
                {title}
              </Typography>
              <Typography variant="h5">{avatarName}</Typography>
              <Typography variant="body2" sx={{ color: 'grey.300' }}>
                {isConnected ? formatDuration(elapsed) : headerStatus}
              </Typography>
            </Stack>
          )}

          {/* <IconButton
            onClick={onClose}
            sx={{
              width: 44,
              height: 44,
              color: 'common.white',
              bgcolor: (theme) => alpha(theme.palette.common.white, 0.16),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.common.white, 0.26),
              },
            }}
          >
            <Iconify icon="mingcute:close-line" width={24} />
          </IconButton> */}
        </Stack>

        {noticeMessage && !isWrappingUp && (
          <Stack sx={{ px: { xs: 2, md: 3 }, pt: 1.5 }}>
            <Paper
              elevation={0}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.16),
                border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              }}
            >
              <Typography variant="caption" sx={{ color: 'warning.light' }}>
                {noticeMessage}
              </Typography>
            </Paper>
          </Stack>
        )}

        {/* display:'flex' here is load-bearing, not decorative: the video frame
            below fills it via `flex: 1 1 auto` rather than `height: 1`
            (percentage height) because percentage heights only resolve when
            every ancestor in the chain has a *definite* height — one link
            being merely flex-stretched isn't enough. Get that chain wrong and
            the <video> silently falls back to its own intrinsic aspect ratio
            (camera resolution) instead of filling the frame — a short,
            "stretched" horizontal band instead of a full-height video. */}
        <Box sx={{ position: 'relative', flex: '1 1 auto', minHeight: 0, display: 'flex', p: { xs: 2, md: 4 } }}>
          {mode === 'video' ? (
            <Box
              sx={{
                position: 'relative',
                flex: '1 1 auto',
                minHeight: 0,
                width: 1,
                borderRadius: { xs: 3, md: 4 },
                overflow: 'hidden',
                bgcolor: '#000',
                border: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
                boxShadow: (theme) => `0 32px 90px ${alpha(theme.palette.common.black, 0.38)}`,
              }}
            >
              {/* Main remote video — full-bleed, edge to edge. The local PIP
                  below floats over it rather than sitting in its own padded
                  pane; a `cover`-filled box only crops badly when the box
                  itself ends up a bad shape, which the flex-chain fix above
                  already addresses — this doesn't need extra padding to look right. */}
              <Box
                ref={remoteVideoRef}
                component="video"
                muted
                playsInline
                autoPlay
                sx={{ display: hasRemoteVideo ? 'block' : 'none', position: 'absolute', inset: 0, width: 1, height: 1, objectFit: 'contain' }}
              />

              {!hasRemoteVideo && (
                <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ position: 'absolute', inset: 0, px: 3, textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center', width: 160, height: 160 }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 8,
                        borderRadius: '50%',
                        border: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
                        background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
                        animation: 'video-call-orbit 3.8s ease-in-out infinite',
                        '@keyframes video-call-orbit': {
                          '0%, 100%': { transform: 'scale(0.96)', opacity: 0.7 },
                          '50%': { transform: 'scale(1.03)', opacity: 1 },
                        },
                      }}
                    />
                    <Avatar
                      src={otherUser?.avatarUrl}
                      alt={avatarName}
                      sx={{ width: 108, height: 108, border: (theme) => `3px solid ${alpha(theme.palette.common.white, 0.18)}` }}
                    />
                  </Box>
                  <Typography variant="h6">{heroTitle}</Typography>
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    {heroDescription}
                  </Typography>
                </Stack>
              )}

              {/* Name label overlay, bottom-left of the main video */}
              {hasRemoteVideo && (
                <Box sx={{ position: 'absolute', left: 16, bottom: 16, px: 1.25, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(0,0,0,0.55)' }}>
                  <Typography variant="caption" sx={{ color: 'common.white', fontWeight: 600 }}>
                    {avatarName}
                  </Typography>
                </Box>
              )}

              {/* Local camera preview — floats over the main video, vertically
                  centered on the right, modest fixed size (not stretched to
                  fill the frame's full height). */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: { xs: 12, md: 24 },
                  transform: 'translateY(-50%)',
                  width: { xs: 120, md: 200 },
                  height: { xs: 90, md: 140 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'rgba(20,20,20,0.9)',
                  border: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  boxShadow: (theme) => `0 12px 30px ${alpha(theme.palette.common.black, 0.5)}`,
                }}
              >
                {localStream?.getVideoTracks().length && !isCameraOff ? (
                  <Box ref={previewVideoRef} component="video" autoPlay muted playsInline sx={{ width: 1, height: 1, objectFit: 'cover', transform: 'scaleX(-1)' }} />
                ) : (
                  <Stack alignItems="center" justifyContent="center" spacing={0.5} sx={{ width: 1, height: 1, px: 1 }}>
                    <Iconify icon="solar:camera-add-bold" width={20} />
                    <Typography variant="caption" sx={{ color: 'grey.400', fontSize: 10, textAlign: 'center' }}>
                      {cameraError || (isCameraOff ? 'Camera off' : 'Starting…')}
                    </Typography>
                  </Stack>
                )}
                <Box sx={{ position: 'absolute', left: 6, bottom: 6, px: 0.75, py: 0.25, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.55)' }}>
                  <Typography variant="caption" sx={{ color: 'common.white', fontSize: 10 }}>
                    You
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Stack alignItems="center" justifyContent="center" sx={{ flex: '1 1 auto', minHeight: 0, width: 1, gap: 3, position: 'relative' }}>
              <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center', width: 220, height: 220 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 10,
                    borderRadius: '50%',
                    border: (theme) => `1px solid ${alpha(theme.palette.success.light, 0.24)}`,
                    bgcolor: (theme) => `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.2)} 0%, transparent 72%)`,
                    animation: 'call-glow 2.4s ease-in-out infinite',
                    '@keyframes call-glow': {
                      '0%, 100%': { transform: 'scale(0.96)', opacity: 0.68 },
                      '50%': { transform: 'scale(1.04)', opacity: 1 },
                    },
                  }}
                />
                <Avatar
                  src={otherUser?.avatarUrl}
                  alt={avatarName}
                  sx={{
                    width: 144,
                    height: 144,
                    boxShadow: (theme) => `0 24px 80px ${alpha(theme.palette.common.black, 0.42)}`,
                  }}
                />
              </Box>

              <Stack spacing={1} alignItems="center" sx={{ maxWidth: 420, textAlign: 'center' }}>
                <Typography variant="overline" sx={{ color: 'success.light', letterSpacing: 1.8 }}>
                  {headerStatus}
                </Typography>
                <Typography variant="h4">{heroTitle}</Typography>
                <Typography variant="body1" sx={{ color: 'grey.300' }}>
                  {heroDescription}
                </Typography>
              </Stack>

              {isConnected && needsAudioUnlock && (
                <Button variant="contained" color="warning" size="small" startIcon={<Iconify icon="solar:volume-loud-bold" />} onClick={handleUnlockAudio}>
                  Tap to enable audio
                </Button>
              )}

              <Stack direction="row" spacing={1} alignItems="flex-end">
                {[20, 36, 14, 30, 24].map((h, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: 8,
                      height: h,
                      borderRadius: 8,
                      bgcolor: 'success.main',
                      animation: 'pulse-bars 1.2s ease-in-out infinite',
                      animationDelay: `${idx * 0.08}s`,
                      '@keyframes pulse-bars': {
                        '0%, 100%': { transform: 'scaleY(0.8)', opacity: 0.55 },
                        '50%': { transform: 'scaleY(1.2)', opacity: 1 },
                      },
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          )}
        </Box>

        <Stack
          spacing={2}
          sx={{
            p: { xs: 2, md: 3 },
            borderTop: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.32),
            backdropFilter: 'blur(10px)',
          }}
        >
          {isWrappingUp ? (
            <Stack spacing={0.75} alignItems="center" sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="subtitle1">
                {isBusy ? `${avatarName} is busy` : isFailed ? errorMessage || 'Connection failed — check your network and try again' : 'Call ended'}
              </Typography>
            </Stack>
          ) : isIncoming ? (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ xs: 4, md: 6 }}>
              <CallControlButton icon="material-symbols:call-end-sharp" label="Decline" danger size={58} onClick={handleDecline} />
              <CallControlButton icon="material-symbols:call-sharp" label="Answer" success size={58} onClick={handleAccept} />
            </Stack>
          ) : (
            <>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ xs: 2, md: 3 }}>
                {isConnected && <CallControlButton icon="material-symbols:mic-off-sharp" label={isMuted ? 'Unmute' : 'Mute'} active={isMuted} onClick={onToggleMute} />}
                {isConnected && mode === 'video' && (
                  <CallControlButton
                    icon={isCameraOff ? 'material-symbols:videocam-off-rounded' : 'material-symbols:videocam-rounded'}
                    label={isCameraOff ? 'Start video' : 'Stop video'}
                    active={isCameraOff}
                    onClick={onToggleCamera}
                  />
                )}
                <CallControlButton icon="material-symbols:call-end-sharp" label={isOutgoing ? 'Cancel' : 'End'} danger onClick={handleDecline} />
              </Stack>
            </>
          )}
        </Stack>
      </Box>
    </Dialog>
  );
}
