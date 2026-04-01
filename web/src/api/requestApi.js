// requestApi.js - Mock data
export const MOCK_REQUESTS = [
  { id: 1, code: 'YC-2024-001', title: 'Đơn hàng máy CNC X500', client: 'Công ty TNHH Cơ Khí ABC', quantity: 5, amount: 850000000, status: 'pending', priority: 'high', createdBy: 'Phạm Quốc Hùng', createdAt: '2024-03-01', deadline: '2024-04-15', notes: 'Khách hàng cần gấp' },
  { id: 2, code: 'YC-2024-002', title: 'Linh kiện thay thế dây chuyền A', client: 'Tập đoàn XNK Việt Nam', quantity: 20, amount: 320000000, status: 'approved', priority: 'medium', createdBy: 'Phạm Quốc Hùng', createdAt: '2024-03-05', deadline: '2024-04-01', notes: '' },
  { id: 3, code: 'YC-2024-003', title: 'Robot hàn tự động RW200', client: 'Vingroup Manufacturing', quantity: 2, amount: 1200000000, status: 'in_progress', priority: 'high', createdBy: 'Trần Thị Lan', createdAt: '2024-03-08', deadline: '2024-05-30', notes: 'Cần tư vấn kỹ thuật' },
  { id: 4, code: 'YC-2024-004', title: 'Bộ điều khiển PLC Siemens', client: 'Nhà máy Điện tử Bình Dương', quantity: 10, amount: 450000000, status: 'rejected', priority: 'low', createdBy: 'Phạm Quốc Hùng', createdAt: '2024-03-10', deadline: '2024-03-30', notes: 'Hết hàng' },
  { id: 5, code: 'YC-2024-005', title: 'Dây chuyền đóng gói tự động', client: 'Unilever Vietnam', quantity: 1, amount: 2500000000, status: 'pending', priority: 'high', createdBy: 'Trần Thị Lan', createdAt: '2024-03-12', deadline: '2024-06-01', notes: 'Dự án lớn' },
];

export const requestApi = {
  getAll: () => Promise.resolve(MOCK_REQUESTS),
  getById: (id) => Promise.resolve(MOCK_REQUESTS.find(r => r.id === id)),
  create: (data) => Promise.resolve({ ...data, id: Date.now(), code: `YC-2024-00${Date.now()}` }),
  update: (id, data) => Promise.resolve({ id, ...data }),
  delete: (id) => Promise.resolve({ success: true }),
};