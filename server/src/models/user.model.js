const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.createUser = async (data) => {

  return prisma.user.create({data});

};

exports.findByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      phone: true,
      created_at: true,
      role: {
        select: { role: true }
      },
      department: {
        select: { name: true }
      }
    }
  });

  if (!user) return null;

  return {
    ...user,
    role: user.role?.role,
    department: user.department?.name
  };
};

exports.getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      created_at: true,
      role: {
        select: { role: true }
      },
      department: {
        select: { name: true }
      }
    }
  });

  if (!users) return null;

  return users.map(user => ({
    ...user,
    role: user.role?.role,
    department: user.department?.name
  }));
};

exports.getUsersDepartment = async (departmentId) => {
  const users = await prisma.user.findMany({
    where: {
      ...(departmentId && { department_id: departmentId }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      created_at: true,
      role: { select: { role: true } },
      department: { select: { name: true } },
    },
  });

  return users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    created_at: user.created_at,
    role: user.role?.role || null,
    department: user.department?.name || null,
  }));
};