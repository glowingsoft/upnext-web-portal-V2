# Chat Module — Complete Implementation Context

## Status
**Real API wired. Socket.IO integrated. All mock/SWR code removed.**

---

## Architecture

### Data Flow
```
ChatView
├── useGetChatsQuery()          → GET /app/conversations  (sidebar list)
├── useGetMessagesQuery()       → GET /app/conversations/messages  (message thread)
├── useSendMessageMutation()    → POST /app/conversations/message
├── useUpdateChatActionMutation() → PUT /app/conversations/:id (archive/block/report)
└── Socket.IO  wss://dev.coachcritic.com/chat
    ├── chatUpdated  → refetchChats() on sidebar
    └── receiveMessage → append to liveMessages[]
```

---

## Real API Endpoints

| Method | URL | Params / Body |
|---|---|---|
| GET | `/app/conversations` | `page, limit, keyword?, chatState?` |
| GET | `/app/conversations/messages` | `page, limit, conversationId OR objectId` |
| POST | `/app/conversations/message` | body below |
| PUT | `/app/conversations/:id` | `{ action: 'archive' \| 'block' \| 'report' \| 'delete' }` |

**Send message body — existing conversation:**
```json
{ "messageType": "text", "messageContent": "Hello", "conversationType": "direct", "conversationId": "..." }
```

**Send message body — new conversation (from profile page):**
```json
{ "messageType": "text", "messageContent": "Hello", "conversationType": "direct", "participantId": "..." }
```

---

## Real Data Shapes

### Chat list item (`GET /app/conversations`)
```js
{
  conversationId: string,   // MongoDB ObjectId of the conversation
  objectId: string,         // the other user's _id
  chatName: string,         // other user's display name
  chatIcon: string,         // other user's avatar URL
  isOnline: boolean,
  canMessage: boolean,
  unreadCount: number,
  lastMessage: {
    messageContent: string,
    messageType: 'text' | 'image',
    timesince: string,      // ISO date string, used for relative time + sorting
    senderId: string,
    senderName: string,
    mediaUrl?: string,
  }
}
```

### Message (`GET /app/conversations/messages`)
```js
{
  _id: string,
  conversationId: string,
  senderId: string,         // compare with user.basicInfo._id to know if "me"
  messageType: 'text' | 'image',
  messageContent: string,   // text content OR image URL if messageType is image
  mediaUrl: string,         // populated for image/file messages
  status: 'sent' | 'delivered' | 'read',
  readBy: string[],
  isDeleted: boolean,
  createdAt: string,        // ISO date
  timesince: string,        // relative time label
}
```

---

## Socket.IO

**File:** `src/utils/chat-socket.js`

```js
connectChatSocket({ subjectId, objectId })  // subjectId = myId, objectId = other user's _id
disconnectChatSocket()
getChatSocket()
```

**Connection URL:** `wss://dev.coachcritic.com/chat`
**Query params:** `?subjectId=<myId>&objectId=<otherUserId>`

**Events listened:**
- `receiveMessage` → appended to `liveMessages` state in `ChatView`
- `chatUpdated` → triggers `refetchChats()` to refresh sidebar

---

## Calling (Audio + Video)

**Status: real WebRTC audio calling fully wired end-to-end. Video calling is implemented client-side but blocked on a backend change — see "Known backend gap" below; until that lands, video calls appear as audio-only to the callee.**

Signaling reuses the same chat socket (`src/utils/chat-socket.js`) — no separate connection. Same event vocabulary as the mobile app for audio (shared backend, no backend changes needed there) plus one addition for video (`callType`, ignored by anything that doesn't send it — e.g. mobile — which defaults safely to `'audio'`):

| Direction | Event | Payload |
|---|---|---|
| emit | `callUser` | `{ targetUserId, offer, callType: 'audio' \| 'video' }` |
| emit | `answerCall` | `{ targetUserId, answer }` |
| emit | `iceCandidate` | `{ targetUserId, candidate }` |
| emit | `endCall` | `{ targetUserId }` |
| emit | `rejectCall` | `{ targetUserId }` |
| emit | `busyCall` | `{ targetUserId }` — sent automatically if `incomingCall` arrives while already in a call |
| listen | `incomingCall` | `{ callerId, callerName, callerAvatar, offer, callType? }` |
| listen | `callAnswered` | `{ answer }` |
| listen | `iceCandidate` | `{ candidate }` |
| listen | `callEnded` / `callRejected` / `callBusy` | — |
| listen | `callAnsweredElsewhere` | — same account logged into multiple devices; fires on every other device once one of them answers, so they stop ringing. Same contract mobile's `IncomingCallScreen` already relies on — no backend change needed, just wasn't wired into the web client until now. |

**Files:**
- `src/sections/chat/call/webrtc-service.js` — browser `RTCPeerConnection` wrapper. `init({ video, accessToken })` requests camera+mic together when `video: true`; if the camera specifically is denied/unavailable it falls back to an audio-only `getUserMedia` call instead of failing the whole call (reported via the `onVideoUnavailable` callback). `toggleMute`/`toggleCamera` enable/disable local tracks without renegotiation. TURN credentials come from our own backend (`fetchBackendIceServers()` — see "TURN / ICE servers" below), with `accessToken` required to fetch them.
- `src/sections/chat/hooks/use-call-signaling.js` — owns the call state machine (`idle → outgoing/incoming → connecting → connected → ended/busy/failed → idle`), `callMode` ('audio'|'video', known before the callee even answers), the peer's identity, `localStream`/`remoteStream`, mute/camera toggle state, ICE-candidate queueing (candidates can arrive before the remote description is set), and the socket listeners above. `startCall(otherUser, mode)` now takes a mode param. Takes `accessToken` as a hook param (threaded through to `WebRTCService.init()`), since it's a plain JS class with no Redux access of its own — the token is sourced from `state.user.user.token` in the React layer.
- `src/sections/chat/chat-call-screen.jsx` — UI; takes `remoteStream`/`localStream`/`isMuted`/`isCameraOff`/`onToggleMute`/`onToggleCamera`/`errorMessage`/`noticeMessage` in addition to its existing `open/mode/phase/otherUser/onClose/onAccept/onDecline` props. Renders a hidden `<audio>` element bound to `remoteStream` for real call audio (used in BOTH modes) plus, in video mode, a **muted** `<video>` bound to the same `remoteStream` for the picture — it must stay muted or the remote party's audio plays twice (once per element). Local camera preview binds directly to the real `localStream` from `WebRTCService`, not a separate `getUserMedia` call. When `phase === 'failed'`, shows `errorMessage`; a non-fatal downgrade (e.g. camera denied mid-setup) shows as `noticeMessage` instead without failing the call.
- `src/sections/chat/view/chat-view.jsx` — wires `useCallSignaling` to `ChatHeaderDetail`'s `onStartCall` and to `ChatCallScreen`; passes `accessToken: user?.token` into the hook.

### TURN / ICE servers

`GET {VITE_BASE_URL}/app/webrtc/ice-servers`, Bearer-authenticated with the signed-in user's access token (same auth as every other API call — no special scopes). Fronts a coturn deployment DevOps run on AWS; response:
```json
{ "message": "Ice servers retrieved", "data": { "ttl": 86400, "iceServers": [ /* RTCIceServer[] */ ] } }
```
Fetched fresh on every call start (not cached against `ttl` client-side) — same fetch-per-call pattern as before, simplest way to guarantee the credential hasn't expired by the time a call actually begins. `fetchBackendIceServers()` in `webrtc-service.js` handles every failure mode explicitly: missing token, network failure, non-OK status (401/expired token included), an 8s request timeout (`AbortController`) so a hung backend can't stall call setup indefinitely, and malformed/empty responses — all fall through to the static-TURN env vars, then the public relay, rather than breaking the call. This replaced the temporary Metered.ca integration used during initial development; Metered is no longer used anywhere in this codebase.

### Known debugging traps (hit these while testing across devices)

1. **LAN testing across two machines ("B answers, call instantly ends"):** `getUserMedia` requires a secure context. `https://` or the literal host `localhost` qualify; `http://<lan-ip>:3030` (what `vite --host` serves on a second laptop) does **not**. `WebRTCService.init()` throws synchronously in that case, which the callee's `acceptCall()` catches and turns into an immediate `endCall` — looks like the call died the instant Answer was pressed. Fix: run `npm run dev:host:https` (sets `VITE_DEV_HTTPS=true`, adds `@vitejs/plugin-basic-ssl` to `vite.config.js`) and open `https://<lan-ip>:3030` on both machines, accepting the self-signed cert warning once per device.
2. **Deployed (Vercel) — call connects but no audio flows:** STUN alone (what's configured by default) only helps two peers discover each other for a *direct* connection — it carries no media itself. When no direct path exists (near-guaranteed once two real users are on separate networks/NATs, which is what a Vercel test with two real devices actually exercises), only a TURN *relay* can carry the audio, and without one configured `webrtc-service.js` falls back to the fully public, unauthenticated `openrelay.metered.ca` relay — no SLA, shared quota with every other app that hasn't configured their own — so signaling completes (UI shows "Connected") but media silently doesn't get through.
   - **Fix implemented:** `webrtc-service.js`'s `getIceServers()` fetches TURN credentials from our own backend (see "TURN / ICE servers" above), which fronts a real coturn deployment — no free-tier quota concerns, no third-party dependency. Falls back to static `VITE_TURN_URLS`/`VITE_TURN_USERNAME`/`VITE_TURN_CREDENTIAL` if that's unreachable, then the public relay as a last resort. If audio still doesn't flow, check the console for `[WebRTC] Backend ICE servers request failed...` — that means it fell through to a weaker tier and the reason is logged right there.
3. **Excessive console logging can visibly hang the tab during video calls.** Video roughly doubles ICE candidate volume (two m-lines — audio + video — instead of one), and `webrtc-service.js` used to `console.log` on every single candidate plus every gathering-state change. A burst of dozens-to-hundreds of log lines in quick succession with devtools open is a real, reproducible cause of a tab freezing for several seconds right as candidate gathering kicks off. **Fix implemented:** trimmed to only log state transitions that matter for diagnosis (selected candidate pair on connect), not every intermediate event.

### Known backend gap — `callType` is silently dropped

The `callUser` socket handler does **not** blindly relay the caller's payload to the callee — it looks up the caller's identity server-side and reconstructs a new payload (proven by `callerName`/`callerAvatar` appearing in `incomingCall` even though the caller never sends those two fields). Because of that reconstruction, our `callType` field (added to `callUser`'s emit payload so the callee's screen can show the right mode before answering) is silently dropped in transit, and every incoming call currently looks audio-only to the callee regardless of what the caller actually started.

**Fix needed server-side**, in the `callUser` handler: read `callType` off the incoming payload (default `'audio'` if missing/invalid, for backward compatibility with clients — e.g. mobile — that never send it) and include it unchanged in the `incomingCall` payload emitted to the callee:
```js
io.to(targetSocketId).emit('incomingCall', { callerId, callerName, callerAvatar, offer, callType });
```
No other events need this change, only `callUser` → `incomingCall`. Client-side diagnostic logging already in place to confirm once fixed: `use-call-signaling.js` logs `[useCallSignaling] emitting callUser with callType=...` on send and `[useCallSignaling] incomingCall payload callType=...` on receive — the latter should stop showing `(missing)` once the backend change ships.

**⚠️ Temporary testing override active:** `use-call-signaling.js`'s `DEFAULT_CALL_TYPE_WHEN_MISSING` is currently set to `'video'` (not `'audio'`) so video-mode testing isn't fully blocked on the backend fix — every incoming call with a missing `callType` (i.e. every incoming call right now) opens the callee's screen in video mode. **This must be reverted to `'audio'` once the backend ships the fix above** — left as `'video'`, it would make real audio-only calls (anything from the mobile app, which never sends `callType` at all) incorrectly try to open the callee's camera.

**Socket lifecycle interaction:** the chat socket effect in `chat-view.jsx` normally fully disconnects/reconnects whenever `objectIdParam` changes (switching conversations). This is guarded with an `isCallActiveRef` check so an active call's signaling channel survives a conversation switch — the trade-off is that `receiveMessage`/`chatUpdated` for the newly opened conversation may lag until the socket naturally reconnects after the call ends.

**Caller/callee identity in a call is independent of the open conversation** — an incoming call can arrive while a different (or no) conversation is open, so `ChatCallScreen`'s `otherUser` comes from the call peer (`useCallSignaling`'s `peer`), not from the chat view's `otherUser`.

---

## URL Strategy

| Navigation source | URL params | Messages query |
|---|---|---|
| Sidebar conversation click | `?conversationId=X&objectId=Y` | `{ conversationId: X }` |
| Client profile "Chat" button | `?userId=Y` | `{ objectId: Y }` |

In `ChatView`:
```js
const conversationIdParam = searchParams.get('conversationId') || '';
const objectIdParam = searchParams.get('objectId') || searchParams.get('userId') || '';
```

---

## Component Prop Interfaces (After Rewrite)

### ChatNav
```jsx
<ChatNav
  chats={[]}                   // flat array from API
  loading={bool}
  selectedConversationId={str}
  selectedObjectId={str}
  collapseNav={object}
  onSelectConversation={fn}    // ({ conversationId, objectId }) => void
  isAdmin={bool}
/>
```

### ChatNavItem
```jsx
<ChatNavItem
  chat={chatListItem}          // real API shape
  selected={bool}
  collapse={bool}
  onCloseMobile={fn}
  onSelect={fn}                // ({ conversationId, objectId }) => void
/>
```

### ChatMessageList
```jsx
<ChatMessageList
  messages={[]}                // real message objects (oldest-first for display)
  myId={string}                // user.basicInfo._id
  otherUser={{ _id, name, avatarUrl, isOnline }}
  loading={bool}
/>
```

### ChatMessageItem
```jsx
<ChatMessageItem
  message={messageObject}      // real message shape
  myId={string}
  otherUser={{ name, avatarUrl }}
  onOpenLightbox={fn}
/>
```

### ChatMessageInput
```jsx
<ChatMessageInput
  conversationId={str|null}    // null → new conversation
  objectId={str}               // other user's _id (for participantId)
  disabled={bool}
  onConversationCreated={fn}   // ({ conversationId, objectId }) => void
/>
```

### ChatHeaderDetail
```jsx
<ChatHeaderDetail
  otherUser={{ _id, name, avatarUrl, isOnline }}
  conversationId={str}
  collapseNav={object}
  loading={bool}
  isAdmin={bool}
/>
```

### ChatRoom
```jsx
<ChatRoom
  collapseNav={object}
  otherUser={{ _id, name, avatarUrl, isOnline }}
  messages={[]}
  loading={bool}
/>
```

---

## Key Files

| File | Role |
|---|---|
| `src/store/Reducer/chat-api.js` | RTK Query slice — 4 endpoints |
| `src/store/apiRoutes.js` | `CONVERSATIONS.*` route constants |
| `src/utils/chat-socket.js` | Socket.IO singleton |
| `src/actions/chat.js` | Re-exports RTK hooks + socket utils |
| `src/sections/chat/view/chat-view.jsx` | Root — fetches data, manages socket, owns state |
| `src/sections/chat/chat-nav.jsx` | Sidebar with tabs + search |
| `src/sections/chat/chat-nav-item.jsx` | Single chat row in sidebar |
| `src/sections/chat/hooks/use-nav-item.js` | Derives display fields from real chat item |
| `src/sections/chat/chat-message-list.jsx` | Message thread container |
| `src/sections/chat/chat-message-item.jsx` | Individual message bubble |
| `src/sections/chat/hooks/use-message.js` | Determines if message is "me" |
| `src/sections/chat/chat-message-input.jsx` | Input + send button (RTK mutation) |
| `src/sections/chat/chat-header-detail.jsx` | Top bar with participant info |
| `src/sections/chat/chat-room.jsx` | Right sidebar with avatar + attachments |

---

## User Identity
```js
const { user } = useSelector((state) => state.user);
const myId = user?.basicInfo?._id;     // MongoDB ObjectId — use for senderId comparison
const myName = user?.basicInfo?.name;
const myAvatar = user?.basicInfo?.profileIcon;
const isAdmin = user?.accountState?.userType === 'admin';
```
(All components that previously used `useMockedUser()` now use this pattern.)

---

## What Was Removed
- SWR (`useSWR`, `mutate`) — entire `src/actions/chat.js` SWR implementation
- `enableServer = false` flag
- `useMockedUser()` from all chat components
- Mock API calls to `/api/chat`
- `useGetContacts()` (no separate contacts endpoint — search filters loaded chats)
- `createConversation()` function (replaced by `sendMessage` with `participantId`)

---

## Sent Message Flow (Optimistic UI)
`ChatMessageInput` builds an optimistic message object immediately on send and calls `onMessageSent(msg)` BEFORE the API call resolves. `ChatView` appends it to `liveMessages` state so it appears instantly. The API call runs in background.

## timesince Field
`lastMessage.timesince` from the API is already a human-readable relative string (e.g. "2 hours ago"). It is displayed directly in `ChatNavItem` — do NOT pass it through `fToNow()` which expects a Date object.

## Removed Features
- File attachment (removed from `ChatMessageInput` and `ChatRoom` right sidebar)
- `ChatRoomAttachments` component is no longer used
- `ChatRoomSingle` / `ChatRoomGroup` components no longer used — `ChatRoom` renders avatar + online status directly

## Known Limitations / Next Steps
- Message pagination not yet implemented (currently loads 50 messages per request)
- Tab filtering (archived/blocked/favourites) is client-side; API supports `chatState` param for server-side filtering
- `paths.adminDashboard.clientsDetails` — verify this path exists in `paths.js` before testing admin chat header navigation
