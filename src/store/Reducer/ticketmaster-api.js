import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';
import { mapTicketmasterEvent } from 'src/sections/active-sections/events-view/events-data';

// Ticketmaster is a public third-party API, not our own backend — it gets its own createApi
// instance with a plain fetchBaseQuery pointed at Ticketmaster's host, instead of
// createCustomFetchBaseQuery() (which is wired for our backend's auth/refresh-token flow).
export const ticketmasterApi = createApi({
  reducerPath: 'ticketmasterApi',
  baseQuery: fetchBaseQuery({ baseUrl: CONFIG.ticketmaster.apiUrl }),
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: ({
        page = 0,
        size = 20,
        keyword,
        latlong,
        radius,
        unit,
        classificationName,
        startDateTime,
        endDateTime,
        sort,
      } = {}) => ({
        url: 'events.json',
        params: {
          apikey: CONFIG.ticketmaster.apiKey,
          page,
          size,
          ...(keyword ? { keyword } : {}),
          ...(latlong ? { latlong } : {}),
          ...(radius ? { radius } : {}),
          ...(unit ? { unit } : {}),
          ...(classificationName ? { classificationName } : {}),
          ...(startDateTime ? { startDateTime } : {}),
          ...(endDateTime ? { endDateTime } : {}),
          ...(sort ? { sort } : {}),
        },
      }),
      transformResponse: (response) => ({
        events: (response?._embedded?.events || []).map(mapTicketmasterEvent),
        page: response?.page || { number: 0, size: 0, totalElements: 0, totalPages: 0 },
      }),
    }),

    getEventById: builder.query({
      query: (id) => ({
        url: `events/${id}.json`,
        params: { apikey: CONFIG.ticketmaster.apiKey },
      }),
      transformResponse: (response) => mapTicketmasterEvent(response),
    }),
  }),
});

export const { useGetEventsQuery, useGetEventByIdQuery } = ticketmasterApi;
