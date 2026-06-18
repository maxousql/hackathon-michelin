'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface RaceDatePickerProps {
  id: string;
  value: string;
  min: string;
  max: string;
  onChange: (value: string) => void;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

const MONTH_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
});

const DISPLAY_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function parseDateValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function formatDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(left: Date, right: Date): boolean {
  return formatDateValue(left) === formatDateValue(right);
}

function isBeforeMonth(left: Date, right: Date): boolean {
  return (
    left.getFullYear() < right.getFullYear() ||
    (left.getFullYear() === right.getFullYear() &&
      left.getMonth() < right.getMonth())
  );
}

function isAfterMonth(left: Date, right: Date): boolean {
  return (
    left.getFullYear() > right.getFullYear() ||
    (left.getFullYear() === right.getFullYear() &&
      left.getMonth() > right.getMonth())
  );
}

function getCalendarDays(monthDate: Date): Date[] {
  const firstDay = startOfMonth(monthDate);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export function RaceDatePicker({
  id,
  value,
  min,
  max,
  onChange,
}: RaceDatePickerProps) {
  const selectedDate = parseDateValue(value);
  const minDate = parseDateValue(min);
  const maxDate = parseDateValue(max);
  const today = useMemo(() => new Date(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down');
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(selectedDate ?? minDate ?? today),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );

  const canGoPrevious = minDate
    ? !isBeforeMonth(
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
        startOfMonth(minDate),
      )
    : true;

  const canGoNext = maxDate
    ? !isAfterMonth(
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
        startOfMonth(maxDate),
      )
    : true;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="ri-date-picker" ref={containerRef}>
      <button
        id={id}
        type="button"
        className="ri-date-trigger"
        onClick={() => {
          const nextSelectedDate = parseDateValue(value);
          const triggerRect = containerRef.current?.getBoundingClientRect();
          if (triggerRect) {
            const calendarHeight = 360;
            const spaceBelow = window.innerHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;
            setOpenDirection(
              spaceBelow < calendarHeight && spaceAbove > spaceBelow
                ? 'up'
                : 'down',
            );
          }
          setVisibleMonth(startOfMonth(nextSelectedDate ?? minDate ?? today));
          setIsOpen((open) => !open);
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <svg
          className="ri-date-trigger-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="ri-date-trigger-text">
          {selectedDate ? DISPLAY_FORMATTER.format(selectedDate) : 'Choisir'}
        </span>
        <svg
          className="ri-date-trigger-chevron"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`ri-date-popover ri-date-popover--${openDirection}`}
          role="dialog"
          aria-label="Choisir la date de course"
        >
          <div className="ri-date-calendar-head">
            <button
              type="button"
              className="ri-date-nav"
              disabled={!canGoPrevious}
              onClick={() =>
                setVisibleMonth(
                  (current) =>
                    new Date(current.getFullYear(), current.getMonth() - 1, 1),
                )
              }
              aria-label="Mois précédent"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <p>{MONTH_FORMATTER.format(visibleMonth)}</p>
            <button
              type="button"
              className="ri-date-nav"
              disabled={!canGoNext}
              onClick={() =>
                setVisibleMonth(
                  (current) =>
                    new Date(current.getFullYear(), current.getMonth() + 1, 1),
                )
              }
              aria-label="Mois suivant"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="ri-date-grid" aria-hidden="true">
            {WEEK_DAYS.map((day) => (
              <span className="ri-date-weekday" key={day}>
                {day}
              </span>
            ))}
          </div>

          <div className="ri-date-grid">
            {calendarDays.map((day) => {
              const valueForDay = formatDateValue(day);
              const isOutsideMonth = day.getMonth() !== visibleMonth.getMonth();
              const isDisabled =
                (minDate && day < minDate) || (maxDate && day > maxDate);
              const isSelected = selectedDate
                ? isSameDay(day, selectedDate)
                : false;
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={valueForDay}
                  type="button"
                  className={[
                    'ri-date-day',
                    isOutsideMonth ? 'ri-date-day--outside' : '',
                    isSelected ? 'ri-date-day--selected' : '',
                    isToday ? 'ri-date-day--today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={Boolean(isDisabled)}
                  onClick={() => {
                    onChange(valueForDay);
                    setIsOpen(false);
                  }}
                  aria-pressed={isSelected}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
