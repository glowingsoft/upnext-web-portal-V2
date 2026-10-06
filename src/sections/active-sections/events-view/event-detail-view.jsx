import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import Container from '@mui/material/Container';

import { usePathname, useRouter } from 'src/routes/hooks';

import { useGetEventByIdQuery } from 'src/store/Reducer/ticketmaster-api';
import { EventDetailContent, EventDetailSkeletonContent, EventNotFoundContent } from 'src/sections/event/view/event-detail-view';

import { INITIAL_EVENTS } from './events-data';

// ----------------------------------------------------------------------

const containerSx = { pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto' };

export function EventDetailView() {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = pathname.includes('/admin-dashboard');

  const adminEvent = useMemo(() => (isAdmin ? INITIAL_EVENTS.find((item) => item.id === id) || null : null), [id, isAdmin]);

  const { data: customerEvent, isLoading: customerEventLoading } = useGetEventByIdQuery(id, { skip: isAdmin || !id });

  const event = isAdmin ? adminEvent : customerEvent;
  const handleBack = () => router.back();

  return (
    <Container maxWidth={false} sx={containerSx}>
      {!isAdmin && customerEventLoading && <EventDetailSkeletonContent />}
      {!(!isAdmin && customerEventLoading) && !event && <EventNotFoundContent onBack={handleBack} />}
      {!(!isAdmin && customerEventLoading) && event && <EventDetailContent event={event} onBack={handleBack} stickyTop={96} />}
    </Container>
  );
}
