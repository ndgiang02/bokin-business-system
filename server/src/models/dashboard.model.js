import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getStatsDashBoard() {
  const now       = new Date();
  const weekAgo   = new Date(now - 7  * 24 * 60 * 60 * 1000);
  const monthAgo  = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [
    totalRequests,
    requestsThisWeek,
    pendingApprovals,
    approvalsThisWeek,
    totalTasks,
    tasksDoneThisWeek,
    totalMembers,
    membersThisMonth,
    overdueRequests,
    statusGroups
  ] = await Promise.all([
    prisma.request.count(),
    prisma.request.count({ where: { created_at: { gte: weekAgo } } }),

    // Approvals (pending)
    prisma.request.count({ where: { status: 'pending' } }),
    prisma.request.count({
      where: { status: 'pending', created_at: { gte: weekAgo } },
    }),

    // Tasks
    prisma.request.count().catch(() => 0),
    prisma.request.count({
      where: { status: 'done', updated_at: { gte: weekAgo } },
    }).catch(() => 0),

    // Members
    prisma.user.count(),
    prisma.user.count({ where: { created_at: { gte: monthAgo } } }),

    prisma.request.count({
        where: {
            status: { not: 'done' },
            deadline: { lt: now },
        }
    }),

    prisma.request.groupBy({ by: ['status'], _count: { id: true } }),

  ]);

  return {
    requests:  { total: totalRequests,   change: requestsThisWeek },
    approvals: { total: pendingApprovals, change: approvalsThisWeek },
    tasks:     { total: totalTasks,       done: tasksDoneThisWeek },
    members:   { total: totalMembers,     change: membersThisMonth },
    overdue:   { total: overdueRequests },
    statusStats: statusGroups.map(g => ({ status: g.status, count: g._count.id })),
  };
}

export async function getChartDashBoard(months = 6) {
  const results = [];

  for (let i = months - 1; i >= 0; i--) {
    const date  = new Date();
    date.setMonth(date.getMonth() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end   = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const [yeuCau, pheDuyet] = await Promise.all([
      prisma.request.count({
        where: { created_at: { gte: start, lte: end } },
      }),
      prisma.request.count({
        where: {
          status:    { in: ['processing', 'done'] },
          updated_at: { gte: start, lte: end },
        },
      }),
    ]);

    results.push({
      month: `T${date.getMonth() + 1}`,
      yeuCau,
      pheDuyet,
    });
  }

  return results;
}

// 3. Recent requests 
export async function getRecentDashBoard(limit = 5) {
  const rows = await prisma.request.findMany({
    take:    limit,
    orderBy: { created_at: 'desc' },
  });

  return rows.map(r => ({
    id:               r.id,
    code:             r.code,
    title:            r.title,
    status:           r.status.toLowerCase(),
    priority:         r.priority.toLowerCase(),
    deadline:         r.deadline,
    created_at:       r.created_at,
    created_by_name:  r.created_by_name || null,
  }));
}


export async function getUserTaskDashBoard({ from, to } = {}) {
  const now        = new Date();
  const dateFrom   = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1);
  const dateTo     = to   ? new Date(to)   : now;

  const [sanXuatUsers, doneGroups, assignedGroups] = await Promise.all([
    prisma.user.findMany({
      select:  { id: true, name: true },
      orderBy: { name: 'asc' },
    }),

    prisma.request.groupBy({
      by:     ['resolved_to'],
      where:  { status: 'done', updated_at: { gte: dateFrom, lte: dateTo } },
      _count: { id: true },
    }),

    prisma.request.groupBy({
      by:     ['assigned_to'],
      where:  { created_at: { gte: dateFrom, lte: dateTo } },
      _count: { id: true },
    }),
  ]);

  const doneByUser     = Object.fromEntries(doneGroups.map(g     => [g.resolved_to, g._count.id]));
  const assignedByUser = Object.fromEntries(assignedGroups.map(g => [g.assigned_to, g._count.id]));

  return sanXuatUsers.map(u => ({
    user_id:   u.id,
    user_name: u.name,
    assigned:  assignedByUser[u.id] || 0,
    done:      doneByUser[u.id]     || 0,
  }));
}

// ── 4. Activity log 
export async function getActiveDashBoard(limit = 10) {
 const recent = await prisma.request.findMany({
      take:    limit,
      orderBy: { created_at: 'desc' },
    });

    return recent.map(r => ({
      id:         r.id,
      user_name:  r.created_by_name || 'Nhân viên',
      action:     'tạo yêu cầu',
      target:     r.code,
      created_at: r.created_at,
    }));
}