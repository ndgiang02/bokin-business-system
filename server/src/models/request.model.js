import prisma from '../config/prisma.js';

export async function createRequest(data, images = []) {
  return prisma.request.create({
    data: {
      code:         data.code,
      title:        data.title,
      client:       data.client       || '—',
      productTypes: Array.isArray(data.productTypes)
                      ? data.productTypes.join(',')
                      : data.productTypes,
      videoQuality: data.videoQuality || null,
      priority:     data.priority.toUpperCase(),
      deadline:     new Date(data.deadline),
      quantity:     parseInt(data.quantity) || 1,
      notes:        data.notes        || null,
      splitByImage: Boolean(data.splitByImage),
      createdById:  data.createdById,

      images: {
        create: images.map(img => ({
          key:      img.key,
          url:      img.url,
          name:     img.name,
          size:     img.size,
          mimeType: img.mimeType || 'image/jpeg',
        })),
      },
    },
    include: {
      images:    true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}

export async function getRequests(filters = {}, pagination = {}) {
  const { status, priority, createdById, search } = filters;
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const where = {
    ...(status      && { status:      status.toUpperCase() }),
    ...(priority    && { priority:    priority.toUpperCase() }),
    ...(createdById && { createdById: parseInt(createdById) }),
    ...(search      && {
      OR: [
        { code:   { contains: search } },
        { title:  { contains: search } },
        { client: { contains: search } },
      ],
    }),
  };

  const [total, data] = await Promise.all([
    prisma.request.count({ where }),
    prisma.request.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images:    true,
        createdBy: { select: { id: true, name: true, role: true } },
      },
    }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getRequestById(id) {
  return prisma.request.findUnique({
    where:   { id: parseInt(id) },
    include: {
      images:    true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}

export async function updateRequestStatus(id, status) {
  return prisma.request.update({
    where: { id: parseInt(id) },
    data:  { status: status.toUpperCase() },
  });
}

export async function deleteRequest(id) {
  return prisma.request.delete({
    where:   { id: parseInt(id) },
    include: { images: true },
  });
}

export async function getRequestImages(requestId) {
  return prisma.requestImage.findMany({
    where:   { requestId: parseInt(requestId) },
    orderBy: { createdAt: 'asc' },
  });
}