import { Status } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"

const getAllUsers = async () => {
  const result = await prisma.user.findMany()
  return result
}




const updateUserStatus = async (status: Status,userId: string) => {
  const result = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      status
    }
  })
  return result
}



export const usersService = {
  getAllUsers,
  updateUserStatus,
};