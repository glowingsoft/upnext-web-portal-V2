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

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { usePathname, useRouter } from 'src/routes/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import { paths } from 'src/routes/paths';
import { useGetBookingsCalendarQuery } from 'src/store/Reducer/bookings-api';
import { normalizeBookings } from 'src/sections/active-sections/sessions-view/utils/booking-normalizer';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import StatusTabsFilter from 'src/components/filters/status-tabs-filter';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { fCurrency } from 'src/utils/format-number';
import { CalendarDayPanel, personLabel } from '../calendar-day-panel';
import { CalendarToolbar } from '../calendar-toolbar';
import { useCalendar } from '../hooks/use-calendar';
import { StyledCalendar } from '../styles';
import {
  BOOKING_STATUS_COLOR,
  BOOKING_STATUS_LABEL_COLOR,
  formatBookingTimeRange,
  mapBookingsToCalendarEvents,
} from '../utils/map-bookings-to-events';


const FULLCALENDAR_LOCALES = [arSaLocale, esLocale, frLocale, ptBrLocale, viLocale, zhCnLocale];
const FULLCALENDAR_LOCALE_CODE = { ar: 'ar-sa', es: 'es', fr: 'fr', pt: 'pt-br', vi: 'vi', cn: 'zh-cn', ht: 'fr' };

function getRangeForView(viewType) {
  if (viewType === 'dayGridMonth') return 'monthly';
  if (viewType === 'timeGridDay') return 'today';
  return 'weekly';
}

const LEGEND_STATUSES = ['requested', 'scheduled', 'ongoing', 'completed', 'expired', 'canceled'];
const CLOSED_STATUSES = ['canceled', 'expired'];

const DayCellContext = createContext({ compact: false, dotsByDay: {} });

function DayCell({ date, text }) {
  const { compact, dotsByDay } = useContext(DayCellContext);
  const dots = compact ? dotsByDay[dayjs(date).format('YYYY-MM-DD')] || [] : [];

  return (
    <Box
      component="span"
      sx={compact ? { width: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' } : { display: 'inline' }}
    >
      <span>{text}</span>
      {compact && (
        <Box component="span" sx={{ height: 5, display: 'flex', gap: '2px' }}>
          {dots.slice(0, 3).map((color, index) => (
            <Box key={index} component="span" sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: color }} />
          ))}
        </Box>
      )}
    </Box>
  );
}

const renderDayCell = (arg) => <DayCell date={arg.date} text={arg.dayNumberText} />;

function getToolbarTitle(view, date, visibleRange) {
  if (view === 'dayGridMonth') return dayjs(date).format('MMMM YYYY');
  if (view === 'timeGridDay') return dayjs(date).format('dddd, MMM D, YYYY');

  const start = dayjs(visibleRange?.start || date);
  const end = visibleRange?.end ? dayjs(visibleRange.end).subtract(1, 'day') : start.add(6, 'day');
  if (start.month() === end.month()) return `${start.format('MMM D')} – ${end.format('D, YYYY')}`;
  return `${start.format('MMM D')} – ${end.format('MMM D, YYYY')}`;
}

function renderBookingEventContent(arg) {
  const { serviceName, personName, price } = arg.event.extendedProps || {};
  const timeSlot = formatBookingTimeRange(arg.event.start, arg.event.end);
  const startLabel = arg.event.start ? dayjs(arg.event.start).format('h:mm A') : '';

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
          {isMonthView ? [startLabel, personName].filter(Boolean).join(' · ') : timeSlot}
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
  const [visibleRange, setVisibleRange] = useState(null);
  const [preview, setPreview] = useState(null);

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

  const isPhone = useResponsive('down', 'sm');
  const isCompactMonth = isPhone && isMonthView;

  const calendarHeight = isMonthView ? 'auto' : 720;

  const calendarWrapRef = useRef(null);
  useEffect(() => {
    const node = calendarWrapRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;

    let frame;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => calendarRef.current?.getApi?.().updateSize());
    });
    observer.observe(node);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [calendarRef]);
  const toolbarTitle = getToolbarTitle(view, date, visibleRange);

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

  const todayKey = dayjs().format('YYYY-MM-DD');
  const { data: summaryData } = useGetBookingsCalendarQuery({ range: 'monthly', date: todayKey, status: 'all' });
  const providerSummary = useMemo(() => {
    if (!summaryData) return null;
    const today = normalizeBookings(summaryData.data || []).filter(
      (booking) => booking.date && dayjs(booking.date).format('YYYY-MM-DD') === todayKey && !CLOSED_STATUSES.includes(booking.status)
    ).length;
    return { today, requested: Number(summaryData.meta?.statuses?.requested) || 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryData, todayKey, currentLang.value]);

  const dotsByDay = useMemo(() => {
    const map = {};
    bookingEvents.forEach((event) => {
      const key = dayjs(event.start).format('YYYY-MM-DD');
      (map[key] ||= []).push(event.textColor);
    });
    return map;
  }, [bookingEvents]);

  const dayCellContext = useMemo(() => ({ compact: isCompactMonth, dotsByDay }), [isCompactMonth, dotsByDay]);

  const eventsById = useMemo(() => Object.fromEntries(bookingEvents.map((event) => [event.id, event])), [bookingEvents]);

  const nextEvent = useMemo(() => {
    const dayEnd = dayjs(selectedDate).endOf('day');
    return bookingEvents
      .filter((event) => !CLOSED_STATUSES.includes(event.extendedProps.status) && dayjs(event.start).isAfter(dayEnd))
      .sort((a, b) => new Date(a.start) - new Date(b.start))[0];
  }, [bookingEvents, selectedDate]);

  const previewBooking = preview ? bookings.find((booking) => booking._id === preview.bookingId) : null;
  const previewEvent = preview ? eventsById[preview.bookingId] : null;

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

  const handleClickEvent = useCallback((arg) => {
    arg.jsEvent?.preventDefault();

    if (arg.event.start) {
      setSelectedDate(dayjs(arg.event.start).format('YYYY-MM-DD'));
    }
    setSelectedBookingId(arg.event.id);
    setPreview({ anchorEl: arg.el, bookingId: arg.event.id });
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedDate(dayjs(event.start).format('YYYY-MM-DD'));
    setSelectedBookingId(event.id);
  }, []);

  const handleDatesSet = useCallback(
    (arg) => {
      onDatesSet(arg);
      setVisibleRange({ start: arg.view.currentStart, end: arg.view.currentEnd });
    },
    [onDatesSet]
  );

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

      {providerSummary && (
        <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1, mb: 2, mt: { xs: -1, md: -2 } }}>
          <Label variant="soft" color="primary" startIcon={<Iconify icon="solar:calendar-mark-bold" />} sx={{ height: 28, px: 1.25, textTransform: 'none' }}>
            {providerSummary.today === 0
              ? t(isProvider ? 'noBookingsToday' : 'noAppointmentsTodayShort')
              : t(isProvider ? 'bookingsToday' : 'appointmentsToday', { count: providerSummary.today })}
          </Label>

          {providerSummary.requested > 0 && (
            <Label
              variant="soft"
              color="warning"
              startIcon={<Iconify icon="solar:bell-bing-bold" />}
              onClick={() => setStatusFilter('requested')}
              sx={{ height: 28, px: 1.25, cursor: 'pointer', textTransform: 'none' }}
            >
              {t(isProvider ? 'requestsWaitingForYou' : 'requestsAwaitingConfirmation', { count: providerSummary.requested })}
            </Label>
          )}
        </Stack>
      )}

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

        <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: { xs: 'column', md: 'row' }, minHeight: 0 }}>
          <StyledCalendar
            ref={calendarWrapRef}
            sx={{
              flex: '1 1 auto',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              '.fc.fc-media-screen': { flex: '1 1 auto' },
              ...(isCompactMonth && {
                '& .fc-daygrid-day-frame': { minHeight: 46, cursor: 'pointer' },
                '& .fc-daygrid-day-top': { justifyContent: 'center' },
                '& .fc-daygrid-day-number': { width: 1, padding: '6px 0 0' },
                '& .fc-daygrid-day-events, & .fc-daygrid-day-bg': { display: 'none' },
                '& .fc-col-header-cell': { padding: '6px 0' },
              }),
            }}
          >
            <CalendarToolbar
              date={toolbarTitle}
              view={view}
              loading={isFetching}
              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              onChangeView={onChangeView}
            />

              <DayCellContext.Provider value={dayCellContext}>
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
                  dayCellContent={renderDayCell}
                  moreLinkClick={handleMoreLinkClick}
                  eventDisplay={isCompactMonth ? 'none' : 'block'}
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
                      ? { weekday: isPhone ? 'narrow' : 'short' }
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
                  datesSet={handleDatesSet}
                  noEventsText={t('noBookingsToDisplay')}
                />
              </DayCellContext.Provider>

            <Stack direction="row" flexWrap="wrap" sx={{ px: 2.5, py: 1.5, gap: 2, borderTop: (theme) => `1px solid ${theme.vars.palette.divider}` }}>
              {LEGEND_STATUSES.map((status) => (
                <Stack key={status} direction="row" alignItems="center" spacing={0.75}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: BOOKING_STATUS_COLOR[status] }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t(status === 'canceled' ? 'cancelled' : status)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </StyledCalendar>

          <Box
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 320, lg: 300, xl: 380 },
              borderTop: { xs: (theme) => `1px solid ${theme.vars.palette.divider}`, md: 'none' },
              borderLeft: { md: (theme) => `1px solid ${theme.vars.palette.divider}` },
            }}
          >
            <CalendarDayPanel
              selectedDate={selectedDate}
              bookings={selectedDayBookings}
              eventsById={eventsById}
              selectedBookingId={selectedBookingId}
              isProvider={isProvider}
              nextEvent={nextEvent}
              onOpenBooking={openBookingDetails}
              onSelectEvent={handleSelectEvent}
            />
          </Box>
        </Box>
      </Card>

      <Popover
        open={Boolean(preview && previewBooking)}
        anchorEl={preview?.anchorEl}
        onClose={() => setPreview(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 0.5, p: 2, width: 280 } } }}
      >
        {previewBooking && (
          <Stack spacing={1.25}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, minWidth: 0 }}>
                {previewBooking.serviceName}
              </Typography>
              <Label variant="soft" color={BOOKING_STATUS_LABEL_COLOR[previewBooking.status] || 'default'} sx={{ textTransform: 'capitalize', flexShrink: 0 }}>
                {t(previewBooking.status === 'canceled' ? 'cancelled' : previewBooking.status)}
              </Label>
            </Stack>

            <Stack spacing={0.75}>
              {(isProvider ? previewBooking.client?.name : previewBooking.providerName) && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:user-rounded-bold" width={16} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                  <Typography variant="body2" noWrap>
                    {personLabel(t, isProvider ? previewBooking.client?.name : previewBooking.providerName, isProvider)}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:calendar-mark-bold" width={16} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                <Typography variant="body2">{previewEvent ? dayjs(previewEvent.start).format('ddd, MMM D, YYYY') : ''}</Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                <Typography variant="body2">
                  {previewEvent ? formatBookingTimeRange(previewEvent.start, previewEvent.end) : previewBooking.slot}
                </Typography>
              </Stack>

              {previewBooking.price != null && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:wallet-money-bold" width={16} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {fCurrency(previewBooking.price)}
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Button
              fullWidth
              size="small"
              variant="contained"
              color="primary"
              onClick={() => {
                setPreview(null);
                openBookingDetails(previewBooking._id);
              }}
            >
              {t('viewBooking')}
            </Button>
          </Stack>
        )}
      </Popover>
    </DashboardContent>
  );
}
