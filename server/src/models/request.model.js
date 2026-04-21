import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllRequests(filters = {}, pagination = {}) {
  const { status, priority, createdByName, search } = filters;
  const { page = 1, limit = 30 } = pagination;
  const skip = (page - 1) * limit;

  const where = {
    ...(status      && { status:      status }),
    ...(priority    && { priority:    priority }),
    ...(createdByName && { created_by_name: createdByName  }),
    ...(search      && {
      OR: [
        { code:   { contains: search } },
        { created_by_name: { contains: search } },

      ],
    }),
  };

  const [total, data] = await Promise.all([
    prisma.request.count({ where }),
    prisma.request.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        code: true,
        status: true,
        priority: true,
        deadline: true,
        created_at: true,
        assigned_to: true,
        created_by_name: true,
         department: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const items = data.map(item => ({
    ...item,
    to_department_name: item.department?.name || null,
  }));

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}


export async function updateRequestStatus(id, status) {
  return prisma.request.update({
    where: { id: parseInt(id) },
    data:  { status: status.toUpperCase() },
  });
}


export async function getRequestImages(requestId) {
  return prisma.requestImage.findMany({
    where:   { requestId: parseInt(requestId) },
    orderBy: { createdAt: 'asc' },
  });
}



///moi

// ── Tạo request + files + assignments
export async function createRequest(data, files = []) {
  return prisma.request.create({
    data: {
      code:         data.code,
      title:        data.title       || `Yêu cầu ${data.code}`,
      product_types: Array.isArray(data.productTypes)
                      ? data.productTypes.join(',')
                      : data.productTypes,
      video_quality: data.videoQuality || null,
      priority:     data.priority,
      deadline:     new Date(data.deadline),
      quantity:     parseInt(data.quantity) || 1,
      notes:        data.notes        || null,
      split_by_image: Boolean(data.splitByImage),
      status:       'pending',
      created_by_id:  data.createdById,
      created_by_name: data.createdByName || 'Nhân viên',
      to_department: data.to_department ? parseInt(data.to_department, 10) : null,

      // Files đính kèm
      files: {
        create: files.map(f => ({
          file_key:      f.key,
          url:      f.url,
          name:     f.name,
          size:     f.size,
          mime_type: f.mimeType,
          file_type: f.fileType,
        })),
      },
    },
    include: {
      files:     true,
    },
  });
}

// ── Lấy danh sách 
export async function getRequests(filters = {}, pagination = {}) {
  const { status, priority, createdById, search } = filters;
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const where = {
    ...(status      && { status }),
    ...(priority    && { priority }),
    ...(createdById && { createdById: parseInt(createdById) }),
    ...(search      && {
      OR: [
        { code:  { contains: search } },
        { title: { contains: search } },
      ],
    }),
  };

  const [total, data] = await Promise.all([
    prisma.request.count({ where }),
    prisma.request.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        files:       { take: 1 },   // thumbnail
        createdBy:   { select: { id: true, name: true, role: true } },
        assignments: {
          include: { user: { select: { id: true, name: true } } },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

   const items = data.map(item => ({
    ...item,
    to_department_name: item.department?.name || null,
  }));

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ── Lấy 1 request ───────────────────────────────────────

export async function getRequestById(id) {
  const data = await prisma.request.findUnique({
    where: { id: parseInt(id) },
    include: {
      files: true,

      department: {
        select: { name: true },
      },

      revisionHistories: {
        orderBy: { created_at: "asc" },
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
        },
      },

      assignments: {
        include: {
          user: {
            select: { id: true, name: true, role: true },
          },
        },
      },
    },
  });

  if (!data) return null;

  return {
    ...data,

    to_department_name: data.department?.name || null,
  };
}

// ── Cập nhật status ──────────────────────────────────────
export async function updateStatus(id, status) {
  return prisma.request.update({
    where: { id: parseInt(id) },
    data:  { status },
  });
}

// ── Revision — thêm lý do + đổi status về in_progress ───

export async function createRevision(requestId, comment, createdById) {
  return prisma.$transaction([
    // Lưu lý do revision
    prisma.revisionHistory.create({
      data: {
        request_id: parseInt(requestId),
        comment,
        created_by_id: parseInt(createdById),
      },
    }),

    // Đổi status về processing
    prisma.request.update({
      where: { id: parseInt(requestId) },
      data: { status: 'processing' },
    }),
  ]);
}

// ── Gán nhân viên SX ─────────────────────────────────────
export async function assignUsers(requestId, userId) {
  // Upsert từng assignment
  return await prisma.request.update({
    where: { id: requestId },
    data: {
      status: 'processing',
      assigned_to: userId,
      updated_at: new Date(),
    }
  });

}


// ── Xóa assignment ────────────────────────────────────────
export async function removeAssignment(requestId, userId) {
  return prisma.requestAssignment.delete({
    where: { requestId_userId: { requestId: parseInt(requestId), userId: parseInt(userId) } },
  });
}

// ── Xóa request + files MinIO ────────────────────────────
export async function deleteRequest(id) {
  return prisma.request.findUnique({
    where:   { id: parseInt(id) },
    include: { files: true },
  });
}

export async function getRequestsHMM(filters = {}, pagination = {}) {
  const {
    status, priority, search,
    createdById,
    viewerRole,        // role của người đang xem
    viewerDeptId,      // department_id của người đang xem
  } = filters;

  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  let where = {};

  if (viewerRole === 'super_admin') {
    // Super admin thấy tất cả
    where = {};

  } else if (['truong_phong'].includes(viewerRole)) {
    where = { fromDepartmentId: viewerDeptId };

  } else if (['nhan_vien'].includes(viewerRole)) {
    where = { createdById: parseInt(createdById) };

  } else {
    where = { createdById: parseInt(createdById) };
  }

  // Phòng được giao (toDepartmentId) chỉ thấy khi approved
  // → thêm điều kiện OR: (fromDept = mình) OR (toDept = mình AND status = approved)
  if (viewerDeptId && !['super_admin'].includes(viewerRole)) {
    where = {
      OR: [
        { from_department: parseInt(viewerDeptId) },
        {
          to_department: parseInt(viewerDeptId),
          status: { in: ['approved', 'in_progress', 'done', 'revision'] },
        },
      ],
    };
  }

  if (status)   where.status   = status;
  if (priority) where.priority = priority;
  if (search) {
    where.AND = [
      ...(where.AND || []),
      { OR: [{ code: { contains: search } }, { title: { contains: search } }] },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.request.count({ where }),
    prisma.request.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        files:          { take: 1 },
        createdBy:      { select: { id: true, name: true, role: true } },
        from_department: { select: { id: true, name: true, code: true } },
        to_department:   { select: { id: true, name: true, code: true } },
        assignments: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}