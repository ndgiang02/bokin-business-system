import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import './schedule.css';

const currentDate = new Date();

const year = currentDate.getFullYear();
const month = currentDate.getMonth();

const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const monthNames = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

const getDaysInMonth = () => {
  return new Date(year, month + 1, 0).getDate();
};

const isWorkingDay = (date) => {
  const day = date.getDay();

  // CN nghỉ
  if (day === 0) return false;

  // T2 -> T6 làm
  if (day >= 1 && day <= 5) return true;

  // T7 cách tuần
  if (day === 6) {
    const weekIndex = Math.ceil(date.getDate() / 7);

    return weekIndex % 2 !== 0;
  }

  return false;
};

const generateCalendar = () => {
  const firstDay = new Date(year, month, 1);

  let startDay = firstDay.getDay();

  startDay = startDay === 0 ? 6 : startDay - 1;

  const totalDays = getDaysInMonth();

  const calendar = [];

  // ô trống
  for (let i = 0; i < startDay; i++) {
    calendar.push(null);
  }

  // ngày
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);

    calendar.push({
      day,
      working: isWorkingDay(date),
      today: day === currentDate.getDate(),
    });
  }

  return calendar;
};

const calendarDays = generateCalendar();



export default function SchedulePage() {
  return (
    <div className="schedule-page">
      <div className="calendar-container">
        <div className="calendar-header">
          <div>
            <p className="calendar-title">
              Lịch làm việc {monthNames[month]}/{year}
            </p>

          </div>

        </div>

        <div className="calendar-weekdays">
          {weekdays.map((day) => (
            <div key={day}>
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-grid">
          {calendarDays.map((item, index) => {
            if (!item) {
              return (
                <div
                  key={index}
                  className="calendar-empty"
                />
              );
            }

            const isWeekend =
              new Date(year, month, item.day).getDay() === 0;

            return (
              <div
                key={item.day}
                className={`
                  calendar-cell
                  ${item.working ? 'working' : ''}
                `}
              >
                <div
                  className={`
                    calendar-day-number
                    ${item.today ? 'today' : ''}
                    ${isWeekend ? 'weekend' : ''}
                  `}
                >
                  {item.day}
                </div>

                {item.working && (
                  <div className="work-dot" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}