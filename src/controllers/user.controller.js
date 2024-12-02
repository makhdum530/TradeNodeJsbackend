import { Prisma } from "@prisma/client";

export const getAll = async (req, res) => {
  try {
    const users = await Prisma.users.findFirst({
      where: {
        user_id: 1,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
