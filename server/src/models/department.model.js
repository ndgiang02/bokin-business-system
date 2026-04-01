const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getAlldepartments = async () => {
  return await prisma.department.findMany();
}