import { prisma } from "../config/db.js";
import { handleSuccess } from "../utils/handleResponse.util.js";

export const getAll = async (req, res, next) => {
  try {
    const { company_id } = req;
    const { order_by, order_by_column, search_keyword } = req.query;

    // Parse pagination
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : undefined;
    const take = req.query.take ? parseInt(req.query.take, 10) : undefined;

    const where = {
      status: "active",
    };
    // Add search keyword filter if provided
    if (search_keyword) {
      where.OR = [{ name: { contains: search_keyword } }];
    }

    // Define sorting
    const orderBy =
      order_by_column && order_by
        ? { [order_by_column]: order_by.toLowerCase() }
        : { country_id: "asc" };

    const result = await prisma.country.findMany({
      where,
      select: {
        name: true,
        country_id: true,
        phone_code: true,
        code: true,
        currency_symbol: true,
        currency: true,
      },
      skip,
      take,
      orderBy,
    });
    const count = await prisma.country.count({ where });
    return handleSuccess(res, result, count);
  } catch (error) {
    next(error);
  }
};
