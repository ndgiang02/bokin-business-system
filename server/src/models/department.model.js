const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//exports.getAlldepartments = async () => {
//  return await prisma.department.findMany();
//}

exports.getAlldepartments = async () => {
  const data = await prisma.department.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  return data.map(d => ({
    ...d,
    userCount: d._count.users,
    _count: undefined,
  }));
};

exports.createDepartment = async (data) => {
  return await prisma.department.create({
    data: {
      name: data.name.trim(),
      code: data.code?.trim().toUpperCase() || null,
    },
  });
};

exports.updateDepartment = (id, data) => {
  return prisma.department.update({
    where: { id: parseInt(id) },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.code !== undefined && { code: data.code }),
    },
  });
};

exports.deleteDepartment = (id) => {
  return prisma.department.delete({
    where: { id: parseInt(id) },
  });
};

exports.codeExists = async (code, excludeId = null) => {
  if (!code) return false;

  const dept = await prisma.department.findUnique({
    where: { code },
  });

  if (!dept) return false;
  if (excludeId && dept.id === parseInt(excludeId)) return false;

  return true;
};

exports.getDepartmentById = (id) => {
  return prisma.department.findUnique({
    where: { id: parseInt(id) },
  });
};
 