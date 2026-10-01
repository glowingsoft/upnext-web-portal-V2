import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Chats', 'Messages'],
  endpoints: (builder) => ({
    getChats: builder.query({
      query: ({ page = 1, limit = 50, keyword, chatState } = {}) => ({
        url: API_ROUTES.CONVERSATIONS,
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
          ...(chatState ? { chatState } : {}),
        },
      }),
      providesTags: ['Chats'],
    }),

    getMessages: builder.query({
      query: ({ page = 1, limit = 50, conversationId, objectId } = {}) => ({
        url: API_ROUTES.CONVERSATION_MESSAGES,
        method: 'GET',
        params: {
          page,
          limit,
          ...(conversationId ? { conversationId } : {}),
          ...(objectId ? { objectId } : {}),
        },
      }),
      providesTags: (result, error, arg) =>
        [
          arg?.conversationId ? { type: 'Messages', id: arg.conversationId } : null,
          arg?.objectId ? { type: 'Messages', id: arg.objectId } : null,
        ].filter(Boolean),
    }),

    sendMessage: builder.mutation({
      query: ({ messageType = 'text', messageContent, conversationType = 'direct', conversationId, participantId, bookingId, mediaUrl, replyTo }) => ({
        url: API_ROUTES.SEND_MESSAGE,
        method: 'POST',
        body: {
          messageType,
          messageContent,
          conversationType,
          ...(conversationId ? { conversationId } : {}),
          ...(participantId ? { participantId } : {}),
          ...(participantId && bookingId ? { bookingId } : {}),
          ...(mediaUrl ? { mediaUrl } : {}),
          ...(replyTo ? { replyTo } : {}),
        },
      }),

    }),

    updateChatAction: builder.mutation({
      query: ({ conversationId, action }) => ({
        url: API_ROUTES.CONVERSATION_ACTION(conversationId),
        method: 'PUT',
        body: { action },
      }),
      invalidatesTags: ['Chats'],
    }),

    deleteMessage: builder.mutation({
      query: ({ messageId }) => ({
        url: API_ROUTES.DELETE_MESSAGE(messageId),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Messages', id: arg?.conversationId }],
    }),

    deleteChat: builder.mutation({
      query: (conversationId) => ({
        url: API_ROUTES.DELETE_CONVERSATION(conversationId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Chats'],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useUpdateChatActionMutation,
  useDeleteMessageMutation,
  useDeleteChatMutation,
} = chatApi;
