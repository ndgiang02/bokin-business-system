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
      department_id: true,
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
    where: { status: { not: -1 } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      created_at: true,
      department_id: true,
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
      status: { not: -1 }
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

exports.updateUser = async (id, data) => {
  return prisma.user.update({
    where: { id: parseInt(id) },
    data,
    select: {
      id: true,
    },
  });
};

exports.deleteUser = async (id) => {
  return prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      status: -1,
    },
  });
};

exports.emailExists = async (email, excludeId = null) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return false;
  if (excludeId && user.id === parseInt(excludeId)) return false;

  return true;
};

exports.getUserById = async (id) => {
  const user = await prisma.user.findUnique({
     where: {
      id: parseInt(id),
      status: { not: -1 }, 
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      phone: true,
      created_at: true,
      role_id: true,
      department_id: true,
    }
  });

  if (!user) return null;

  return {
    ...user
  };
};