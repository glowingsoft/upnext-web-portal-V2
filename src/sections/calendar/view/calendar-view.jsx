import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import arSaLocale from '@fullcalendar/core/locales/ar-sa';
import esLocale from '@fullcalendar/core/locales/es';
import frLocale from '@fullcalendar/core/locales/fr';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import viLocale from '@fullcalendar/core/locales/vi';
import zhCnLocale from '@fullcalendar/core/locales/zh-cn';

import dayjs from 'dayjs';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useGetBookingsCalendarQuery } from 'src/store/Reducer/bookings-api';
import { formatPaymentStatusLabel, getPaymentStatusColor, normalizeBookings } from 'src/sections/active-sections/sessions-view/utils/booking-normalizer';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import StatusTabsFilter from 'src/components/filters/status-tabs-filter';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { fCurrency } from 'src/utils/format-number';
import { varAlpha } from 'src/theme/styles';

import { CalendarToolbar } from '../calendar-toolbar';
import { useCalendar } from '../hooks/use-calendar';
import { StyledCalendar } from '../styles';
import { BOOKING_STATUS_COLOR, BOOKING_STATUS_LABEL_COLOR, mapBookingsToCalendarEvents } from '../utils/map-bookings-to-events';


const FULLCALENDAR_LOCALES = [arSaLocale, esLocale, frLocale, ptBrLocale, viLocale, zhCnLocale];
const FULLCALENDAR_LOCALE_CODE = { ar: 'ar-sa', es: 'es', fr: 'fr', pt: 'pt-br', vi: 'vi', cn: 'zh-cn', ht: 'fr' };

function getRangeForView(viewType) {
  if (viewType === 'dayGridMonth') return 'monthly';
  if (viewType === 'timeGridDay') return 'today';
  return 'weekly';
}

function renderBookingEventContent(arg) {
  const { serviceName, timeSlot, personName, price } = arg.event.extendedProps || {};

  const isMonthView = arg.view.type === 'dayGridMonth';

  const startTime = arg.event.start?.getTime();
  const endTime = arg.event.end?.getTime();
  const durationInMinutes = startTime && endTime ? Math.round((endTime - startTime) / 60000) : null;

  const isShortEvent = !isMonthView && durationInMinutes !== null && durationInMinutes <= 20;

  const displayTitle = serviceName || arg.event.title || 'Booking';

  const tooltipText = [displayTitle, timeSlot, personName, price != null ? fCurrency(price) : null]
    .filter(Boolean)
    .join(' • ');

  if (isShortEvent) {
    return (
      <Tooltip title={tooltipText} placement="top" arrow>
        <Box
          sx={{
            px: 0.75,
            width: 1,
            minHeight: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor', flexShrink: 0 }} />

          <Typography component="span" variant="caption" noWrap sx={{ minWidth: 0, fontSize: 10, lineHeight: 1, fontWeight: 800 }}>
            {[displayTitle, timeSlot, personName].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltipText} placement="top" arrow>
      <Box
        sx={{
          px: isMonthView ? 0.75 : 1,
          py: isMonthView ? 0.35 : 0.6,
          width: 1,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.6}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor', flexShrink: 0 }} />

          <Typography component="div" variant="caption" noWrap sx={{ minWidth: 0, fontWeight: 800, lineHeight: 1.25 }}>
            {displayTitle}
          </Typography>
        </Stack>

        <Typography component="span" variant="caption" noWrap sx={{ mt: 0.2, display: 'block', fontSize: 10, lineHeight: 1.2, opacity: 0.9 }}>
          {timeSlot}
        </Typography>

        {!isMonthView && (
          <Typography component="span" variant="caption" noWrap sx={{ mt: 0.15, display: 'block', fontSize: 10, lineHeight: 1.2, fontWeight: 700, opacity: 0.9 }}>
            {[personName, price != null ? fCurrency(price) : null].filter(Boolean).join(' · ')}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

export function CalendarView() {
  const { t, currentLang } = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const isAdminRoute = pathname.includes('/admin-dashboard');
  const dashboardRoot = isAdminRoute ? paths.adminDashboard.root : paths.dashboard.root;

  const userState = useSelector((state) => state.user);
  const userType = userState?.user?.accountState?.userType ?? userState?.accountState?.userType;
  const isProvider = userType === 'provider' || userType === 'business';

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const {
    calendarRef,
    view,
    date,
    onDatePrev,
    onDateNext,
    onDateToday,
    onChangeView,
    onDatesSet,
    onInitialView,
  } = useCalendar();

  const calendarRange = getRangeForView(view);
  const referenceDate = useMemo(() => dayjs(date).format('YYYY-MM-DD'), [date]);

  const isMonthView = view === 'dayGridMonth';
  const isWeekView = view === 'timeGridWeek';
  const isDayView = view === 'timeGridDay';

  const calendarHeight = isMonthView ? 'auto' : 720;

  const { data, isFetching } = useGetBookingsCalendarQuery({
    range: calendarRange,
    date: referenceDate,
    status: statusFilter,
  });
  const bookings = useMemo(() => normalizeBookings(data?.data || []), [data?.data, currentLang.value]);
  const bookingEvents = useMemo(
    () => mapBookingsToCalendarEvents(bookings, { isProvider }),
    [bookings, isProvider]
  );

  const statusCounts = data?.meta?.statuses || {};
  const totalCount = useMemo(
    () => Object.values(statusCounts).reduce((sum, n) => sum + (Number(n) || 0), 0),
    [statusCounts]
  );

  const selectedDayBookings = useMemo(
    () => bookings.filter((booking) => booking.date && dayjs(booking.date).format('YYYY-MM-DD') === selectedDate),
    [bookings, selectedDate]
  );

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('all'), color: 'default' },
      ...['requested', 'scheduled', 'ongoing', 'completed', 'expired', 'canceled'].map((status) => ({
        value: status,
        label: t(status === 'canceled' ? 'cancelled' : status),
        color: BOOKING_STATUS_LABEL_COLOR[status] || 'default',
      })),
    ],
    [t]
  );

  const getStatusCount = useCallback(
    (status) => (status === 'all' ? totalCount : statusCounts[status] || 0),
    [statusCounts, totalCount]
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      onInitialView();
    });

    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openBookingDetails = useCallback(
    (bookingId) => {
      if (!bookingId) return;

      const detailPath = isAdminRoute
        ? paths.adminDashboard.bookingDetails(bookingId)
        : paths.dashboard.bookingDetails(bookingId);

      router.push(detailPath);
    },
    [isAdminRoute, router]
  );

  // Clicking a booking on the grid doesn't navigate away — it just selects that booking's day
  // and highlights it in the list below; opening the detail page happens from that list instead.
  const handleClickEvent = useCallback((arg) => {
    arg.jsEvent?.preventDefault();

    if (arg.event.start) {
      setSelectedDate(dayjs(arg.event.start).format('YYYY-MM-DD'));
    }
    setSelectedBookingId(arg.event.id);
  }, []);

  const handleDateClick = useCallback((arg) => {
    setSelectedDate(dayjs(arg.date).format('YYYY-MM-DD'));
    setSelectedBookingId(null);
  }, []);

  const handleMoreLinkClick = useCallback((arg) => {
    setSelectedDate(dayjs(arg.date).format('YYYY-MM-DD'));
    setSelectedBookingId(null);
    return true;
  }, []);

  const dayCellClassNames = useCallback(
    (arg) => (dayjs(arg.date).format('YYYY-MM-DD') === selectedDate ? ['upnext-selected-day'] : []),
    [selectedDate]
  );

  const dayHeaderClassNames = useCallback(
    (arg) => (dayjs(arg.date).format('YYYY-MM-DD') === selectedDate ? ['upnext-selected-day'] : []),
    [selectedDate]
  );

  const breadcrumbLinks = useMemo(
    () => [
      { name: t('dashboard'), href: dashboardRoot },
      { name: t('calendar') },
    ],
    [dashboardRoot, t]
  );

  const flexProps = { flex: '1 1 auto', display: 'flex', flexDirection: 'column' };

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={t('calendar')}
        links={breadcrumbLinks}
        sx={{ mb: { xs: 2.5, md: 4 } }}
      />

      <Card
        sx={{
          ...flexProps,
          minHeight: '60vh',
          overflow: 'hidden',
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme) => theme.customShadows?.card,
        }}
      >
        <StatusTabsFilter
          value={statusFilter}
          options={statusOptions}
          onChange={(event, newValue) => setStatusFilter(newValue)}
          getCount={getStatusCount}
        />

        <Box sx={{ height: 3 }}>{isFetching && <LinearProgress sx={{ height: 3 }} />}</Box>

        <StyledCalendar
          sx={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',

            '.fc.fc-media-screen': {
              flex: '1 1 auto',
            },
          }}
        >
          <CalendarToolbar
            date={dayjs(date).format('MMM D, YYYY')}
            view={view}
            loading={isFetching}
            onNextDate={onDateNext}
            onPrevDate={onDatePrev}
            onToday={onDateToday}
            onChangeView={onChangeView}
          />

          {!isFetching && bookingEvents.length === 0 && (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1}
              sx={{
                py: 5,
                minHeight: 160,
                color: 'text.disabled',
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Iconify icon="solar:calendar-mark-bold-duotone" width={44} />

              <Typography variant="subtitle2">{t('noBookingsToDisplay')}</Typography>
            </Stack>
          )}

          <Calendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
            locales={FULLCALENDAR_LOCALES}
            locale={FULLCALENDAR_LOCALE_CODE[currentLang.value] || 'en'}
            initialDate={date}
            initialView={view}
            events={bookingEvents}
            headerToolbar={false}
            weekends
            editable={false}
            droppable={false}
            selectable={false}
            eventStartEditable={false}
            eventDurationEditable={false}
            rerenderDelay={10}
            height={calendarHeight}
            expandRows={isMonthView}
            stickyHeaderDates
            nowIndicator
            allDaySlot
            allDayMaintainDuration
            dayMaxEventRows={isMonthView ? 3 : true}
            moreLinkClick={handleMoreLinkClick}
            eventDisplay="block"
            eventMinHeight={24}
            eventShortHeight={24}
            slotEventOverlap={false}
            slotMinTime="06:00:00"
            slotMaxTime="23:00:00"
            scrollTime="08:00:00"
            scrollTimeReset={false}
            slotDuration="00:30:00"
            slotLabelInterval="01:00"
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
            dayHeaderFormat={
              isMonthView
                ? { weekday: 'short' }
                : {
                    weekday: 'short',
                    month: 'numeric',
                    day: 'numeric',
                  }
            }
            eventClick={handleClickEvent}
            dateClick={handleDateClick}
            dayCellClassNames={dayCellClassNames}
            dayHeaderClassNames={dayHeaderClassNames}
            eventContent={renderBookingEventContent}
            datesSet={onDatesSet}
            noEventsText={t('noBookingsToDisplay')}
          />
        </StyledCalendar>

        <Box sx={{ borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`, p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
            {dayjs(selectedDate).format('dddd, MMM D, YYYY')}
          </Typography>

          {selectedDayBookings.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              {t('noBookingsToDisplay')}
            </Typography>
          ) : (
            <Stack spacing={1}>
              {selectedDayBookings.map((booking) => {
                const isSelected = booking._id === selectedBookingId;
                const isOnsite = booking.deliveryMethod === 'onsite';
                const deliveryIcon = isOnsite ? 'solar:map-point-bold' : 'solar:laptop-bold';
                const durationMins = booking.serviceSummary?.durationMins;
                return (
                <Stack
                  key={booking._id}
                  direction="row"
                  alignItems="flex-start"
                  spacing={1.5}
                  onClick={() => openBookingDetails(booking._id)}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: (theme) => `1px solid ${isSelected ? theme.vars.palette.primary.main : theme.vars.palette.divider}`,
                    borderLeft: (theme) =>
                      `3px solid ${BOOKING_STATUS_COLOR[booking.status] || theme.vars.palette.grey[500]} !important`,
                    bgcolor: isSelected ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.06) : 'transparent',
                    transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
                    },
                  }}
                >
                  <Avatar
                    src={booking.photos?.[0]}
                    variant="rounded"
                    sx={{ width: 44, height: 44, fontSize: 13, flexShrink: 0, bgcolor: 'primary.lighter', color: 'primary.dark' }}
                  >
                    <Iconify icon="solar:box-minimalistic-bold" width={20} />
                  </Avatar>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {booking.serviceName}
                      </Typography>
                      <Tooltip title={t(booking.deliveryMethod, { defaultValue: booking.deliveryMethod })} arrow placement="top">
                        <span style={{ display: 'flex' }}>
                          <Iconify icon={deliveryIcon} width={13} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                        </span>
                      </Tooltip>
                    </Stack>

                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                      {isProvider ? booking.client?.name : booking.providerName}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
                      <Iconify icon="solar:clock-circle-bold" width={12} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap>
                        {[booking.slot, durationMins ? `${durationMins} min` : null].filter(Boolean).join(' · ')}
                      </Typography>
                    </Stack>

                    {isOnsite && booking.venueLocation && (
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
                        <Iconify icon="solar:map-point-bold" width={12} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap>
                          {booking.venueLocation}
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <Label variant="soft" color={BOOKING_STATUS_LABEL_COLOR[booking.status] || 'default'} sx={{ textTransform: 'capitalize' }}>
                      {t(booking.status === 'canceled' ? 'cancelled' : booking.status)}
                    </Label>

                    {booking.paymentStatus && (
                      <Label variant="soft" color={getPaymentStatusColor(booking.paymentStatus)} sx={{ textTransform: 'none' }}>
                        {t(booking.paymentStatus, { defaultValue: formatPaymentStatusLabel(booking.paymentStatus) })}
                      </Label>
                    )}

                    {booking.price != null && (
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {fCurrency(booking.price)}
                      </Typography>
                    )}

                    <Iconify icon="solar:alt-arrow-right-bold" width={16} sx={{ color: 'text.disabled', mt: 0.5 }} />
                  </Stack>
                </Stack>
                );
              })}
            </Stack>
          )}
        </Box>
      </Card>
    </DashboardContent>
  );
}
