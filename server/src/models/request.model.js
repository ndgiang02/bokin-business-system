import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function getAllRequests(filters = {}, pagination = {}) {
  const { status, priority, createdByName, search, department, user_id } = filters;
  const { page = 1, limit = 30 } = pagination;
  const skip = (page - 1) * limit;


  const AND = [];

  if (status) AND.push({ status });
  if (priority) AND.push({ priority });
  if (createdByName) AND.push({ created_by_name: createdByName });

  if (search) {
    AND.push({
      OR: [
        { code: { contains: search, mode: 'insensitive' } },
        { created_by_name: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (department) {
    AND.push({
      OR: [
        {
          from_department: Number(department),
        },

        {
          to_department: Number(department),
          status: {
            in: ['approved', 'processing', 'done', 'revision'],
          },
        },
      ],
    });
  }

  if(user_id) {
    AND.push({
      OR: [
        { created_by_id: Number(user_id) },
        { assigned_to: Number(user_id) },
      ],
    });
  }

  const where = AND.length ? { AND } : {};

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
        title: true,
        status: true,
        priority: true,
        deadline: true,
        created_at: true,
        assigned_to: true,
        created_by_name: true,
        to_department: true,
        from_department: true,
        department: {
          select: {
            name: true,
          },
        }
      },
    })
  ]);

  const items = data.map(item => ({
    ...item,
    to_department_name: item.department?.name || null,
  }));

  return {
    items: items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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

export async function createRequest(data, files = []) {
  return prisma.$transaction(async (tx) => {
    const deptId = Number(data.from_department);

    const counter = await tx.departmentCounter.upsert({
      where: { department_id: deptId },
      update: { current_number: { increment: 1 } },
      create: { department_id: deptId, current_number: 1 },
    });

    const dept = await tx.department.findUnique({
      where: { id: deptId },
      select: { code: true },
    });

    if (!dept) throw new Error('Department not found');

    const code = `${dept.code}_${String(counter.current_number).padStart(5, '0')}`;

    return tx.request.create({
      data: {
        code,
        title: data.title || `Yêu cầu ${code}`,
        product_types: Array.isArray(data.productTypes)
          ? data.productTypes.join(',')
          : data.productTypes,
        video_quality: data.videoQuality || null,
        priority: data.priority,
        deadline: new Date(data.deadline),
        quantity: parseInt(data.quantity) || 1,
        notes: data.notes || null,
        split_by_image: Boolean(data.splitByImage),
        status: 'pending',
        created_by_id: data.createdById ? parseInt(data.createdById) : null,
        created_by_name: data.createdByName || 'Nhân viên',
        to_department: data.to_department ? parseInt(data.to_department) : null,
        from_department: deptId,

        files: {
          create: files.map(f => ({
            file_key: f.key,
            url: f.url,
            name: f.name,
            size: f.size,
            mime_type: f.mimeType,
            file_type: f.fileType,
            uploaded_by: data.createdById ? parseInt(data.createdById) : null,
            category: 'input',
          })),
        },
      },
      include: { files: true },
    });
  });
}



/*
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
      from_department: data.from_department ? parseInt(data.from_department, 10) : null,

      // Files đính kèm
      files: {
        create: files.map(f => ({
          file_key:      f.key,
          url:      f.url,
          name:     f.name,
          size:     f.size,
          mime_type: f.mimeType,
          file_type: f.fileType,
          uploaded_by: data.createdById,
          category: 'input',
        })),
      },
    },
    include: {
      files:     true,
    },
  });
}
  */

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
      data: { status: 'revision' },
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


export async function completeRequest(requestId, userId, notes, files) {
  return prisma.$transaction(async (tx) => {
    await tx.request.update({
      where: { id: parseInt(requestId) },
      data: {
        status: 'done',
        result_notes: notes,
        resolved_to: userId,
        updated_at: new Date(),
      },
    });


    if (files?.length > 0) {
      await tx.requestFile.createMany({
        data: files.map(f => ({
          file_key: f.key,
          request_id: parseInt(requestId),
          name: f.name,
          url: f.url,
          mime_type: f.mimeType,
          size: f.size,
          uploaded_by: userId,
          category: 'output',
          file_type: f.fileType,
        })),
      });
    }

    return tx.request.findUnique({
      where: { id: parseInt(requestId) },
      select: {
        id: true,
        revisionHistories: {
          select: { id: true },
        },
      },
    });
  });
}