import { useRef, useState, useCallback } from 'react';

import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

export function useCalendar() {
  const calendarRef = useRef(null);

  const smUp = useResponsive('up', 'sm');

  const getCalendarApi = () => calendarRef.current?.getApi?.();

  const [date, setDate] = useState(() => new Date());

  const [openForm, setOpenForm] = useState(false);

  const [selectEventId, setSelectEventId] = useState('');

  const [selectedRange, setSelectedRange] = useState(null);

  const [view, setView] = useState(smUp ? 'dayGridMonth' : 'timeGridDay');

  const onOpenForm = useCallback(() => {
    setOpenForm(true);
  }, []);

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectEventId('');
  }, []);

  const onInitialView = useCallback(() => {
    const calendarApi = getCalendarApi();

    if (!calendarApi) return;

    const newView = smUp ? 'dayGridMonth' : 'timeGridDay';
    calendarApi.changeView(newView);
    setView(newView);
    setDate(calendarApi.getDate());
  }, [smUp]);

  const onChangeView = useCallback((newView) => {
    const calendarApi = getCalendarApi();

    if (!calendarApi) return;

    if (newView === 'dayGridMonth') {
      calendarApi.changeView(newView);
    } else {
      calendarApi.changeView(newView, new Date());
    }

    setView(newView);
    setDate(calendarApi.getDate());
  }, []);

  const onDateToday = useCallback(() => {
    const calendarApi = getCalendarApi();

    if (!calendarApi) return;

    calendarApi.today();
    setDate(calendarApi.getDate());
  }, []);

  const onDatePrev = useCallback(() => {
    const calendarApi = getCalendarApi();

    if (!calendarApi) return;

    calendarApi.prev();
    setDate(calendarApi.getDate());
  }, []);

  const onDateNext = useCallback(() => {
    const calendarApi = getCalendarApi();

    if (!calendarApi) return;

    calendarApi.next();
    setDate(calendarApi.getDate());
  }, []);

  const onDatesSet = useCallback((arg) => {
    setDate(arg.view.calendar.getDate());
    setView(arg.view.type);
  }, []);

  const onSelectRange = useCallback(
    (arg) => {
      const calendarApi = getCalendarApi();

      if (calendarApi) {
        calendarApi.unselect();
      }

      onOpenForm();
      setSelectedRange({ start: arg.startStr, end: arg.endStr });
    },
    [onOpenForm]
  );

  const onClickEvent = useCallback(
    (arg) => {
      const { event } = arg;

      onOpenForm();
      setSelectEventId(event.id);
    },
    [onOpenForm]
  );

  const onResizeEvent = useCallback((arg, updateEvent) => {
    const { event } = arg;

    updateEvent({
      id: event.id,
      allDay: event.allDay,
      start: event.startStr,
      end: event.endStr,
    });
  }, []);

  const onDropEvent = useCallback((arg, updateEvent) => {
    const { event } = arg;

    updateEvent({
      id: event.id,
      allDay: event.allDay,
      start: event.startStr,
      end: event.endStr,
    });
  }, []);

  const onClickEventInFilters = useCallback(
    (eventId) => {
      if (eventId) {
        onOpenForm();
        setSelectEventId(eventId);
      }
    },
    [onOpenForm]
  );

  return {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDatesSet,
    onDropEvent,
    onClickEvent,
    onChangeView,
    onSelectRange,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    //
    onClickEventInFilters,
  };
}
