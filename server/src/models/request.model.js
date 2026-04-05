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
      },
    }),
  ]);

  return { items: data, total, page, limit, totalPages: Math.ceil(total / limit) };
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
      },
    }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ── Lấy 1 request ────────────────────────────────────────
export async function getRequestById(id) {
  return prisma.request.findUnique({
    where:   { id: parseInt(id) },
    include: {
      files:            true,
      revisionHistories: {
        orderBy:  { created_at: 'asc' },
        include:  { createdBy: { select: { id: true, name: true } } },
      },
      assignments: {
        include: { user: { select: { id: true, name: true, role: true } } },
      },
    },
  });
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