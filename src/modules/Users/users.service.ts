import { prisma } from "../../lib/prisma"

const getAllUsers = async () => {
  const result = await prisma.user.findMany()
  return result
}



export const usersService = {
  getAllUsers
}