const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getAlldepartments = async () => {
  return await prisma.department.findMany();
}

exports.createDepartment = async (data) => {
  return await prisma.department.create({
    data: {
      name: data.name.trim(),
      code: data.code?.trim().toUpperCase() || null,
    },
  });
};

exports.updateDepartment = async (id, data) => {
  return await prisma.department.update({
    where: { id: parseInt(id) },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.code !== undefined && {
        code: data.code?.trim().toUpperCase() || null,
      }),
    },
  });
};

exports.deleteDepartment = async (id) => {
  return await prisma.department.delete({
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
 