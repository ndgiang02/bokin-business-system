import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Plus, Users } from 'lucide-react';
import './schedule.css';

const weekDays = [
  { date: '11', day: 'Thứ 2', active: false },
  { date: '12', day: 'Thứ 3', active: true },
  { date: '13', day: 'Thứ 4', active: false },
  { date: '14', day: 'Thứ 5', active: false },
  { date: '15', day: 'Thứ 6', active: false },
  { date: '16', day: 'Thứ 7', active: false },
  { date: '17', day: 'CN', active: false },
];

const scheduleItems = [
  {
    time: '08:00 - 09:30',
    title: 'Họp giao ban đầu ngày',
    team: 'Phòng Kinh Doanh',
    location: 'Phòng họp A',
    color: 'blue',
  },
  {
    time: '10:00 - 11:30',
    title: 'Rà soát yêu cầu sản xuất',
    team: 'Quản lý & Sản xuất',
    location: 'Online',
    color: 'cyan',
  },
  {
    time: '13:30 - 15:00',
    title: 'Phân công công việc mới',
    team: 'Trưởng phòng',
    location: 'Phòng điều phối',
    color: 'purple',
  },
  {
    time: '16:00 - 17:00',
    title: 'Tổng kết tiến độ trong ngày',
    team: 'Toàn bộ nhân sự',
    location: 'Phòng họp B',
    color: 'green',
  },
];

const teamStats = [
  { label: 'Lịch hôm nay', value: '04', hint: '2 cuộc họp quan trọng' },
  { label: 'Nhân sự tham gia', value: '18', hint: '6 phòng ban' },
  { label: 'Giờ còn trống', value: '03', hint: 'Có thể đặt lịch' },
];

export default function SchedulePage() {
  return (
    <div className="schedule-page animate-fade-in">
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">Lịch Làm Việc</h1>
          <p className="page-subtitle">Theo dõi lịch họp, phân công và các khung giờ làm việc trong tuần</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          Thêm lịch
        </button>
      </div>

      <section className="schedule-hero card">
        <div>
          <span className="schedule-kicker">
            <CalendarDays size={15} />
            Tuần này
          </span>
          <h2>11/05 - 17/05/2026</h2>
          <p>Chọn ngày để xem nhanh các lịch làm việc và lịch họp đã được phân công.</p>
        </div>
        <div className="schedule-nav">
          <button className="btn btn-outline btn-icon" aria-label="Tuần trước">
            <ChevronLeft size={16} />
          </button>
          <button className="btn btn-outline btn-icon" aria-label="Tuần sau">
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      <section className="schedule-week-grid">
        {weekDays.map(day => (
          <button key={day.date} className={`schedule-day-card ${day.active ? 'active' : ''}`}>
            <span>{day.day}</span>
            <strong>{day.date}</strong>
          </button>
        ))}
      </section>

      <div className="schedule-content-grid">
        <section className="card schedule-timeline-card">
          <div className="schedule-section-head">
            <div>
              <h3>Lịch trong ngày</h3>
              <p>Thứ 3, 12/05/2026</p>
            </div>
            <span className="badge badge-in_progress">Đang hoạt động</span>
          </div>

          <div className="schedule-timeline">
            {scheduleItems.map(item => (
              <article key={`${item.time}-${item.title}`} className={`schedule-item ${item.color}`}>
                <div className="schedule-time">
                  <Clock size={15} />
                  {item.time}
                </div>
                <div className="schedule-item-body">
                  <h4>{item.title}</h4>
                  <div className="schedule-meta">
                    <span><Users size={14} />{item.team}</span>
                    <span><MapPin size={14} />{item.location}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="schedule-side-panel">
          {teamStats.map(stat => (
            <div className="card schedule-stat-card" key={stat.label}>
              <div className="schedule-stat-value">{stat.value}</div>
              <div>
                <div className="schedule-stat-label">{stat.label}</div>
                <div className="schedule-stat-hint">{stat.hint}</div>
              </div>
            </div>
          ))}

          <div className="card schedule-note-card">
            <h3>Ghi chú nhanh</h3>
            <p>Ưu tiên cập nhật lịch họp và lịch phân công trước 17:00 hằng ngày để các bộ phận chủ động chuẩn bị.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
