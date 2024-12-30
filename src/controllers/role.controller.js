import { prisma } from '../config/db.js';
import { fvString } from '../utils/formValidator.util.js';
import { handleCreate, handleError, handleNoRecordFound, handleSuccess, handleUpdate, hnaldeDelete } from '../utils/handleResponse.util.js';

async function commonValidation(req, res) {
	const { id } = req.params || {};
	const { title, description } = req.body;

	const role_id = req?.params?.id ? BigInt(id) : null;
	fvString(req, 'title');
	description && fvString(req, 'description');

	const existData = await prisma.role.findFirst({
		where: {
			title: title,
			...(role_id && { role_id: { not: role_id } }),
		},
	});

	return { existData };
}

//LIST
export const getAll = async (req, res, next) => {
	try {
		const { order_by, order_by_column, search_keyword } = req.query;

		const skip = req.query.skip ? parseInt(req.query.skip, 10) : undefined;
		const take = req.query.take ? parseInt(req.query.take, 10) : undefined;

		let where = {};

		if (search_keyword) {
			where.OR = [{ title: { contains: search_keyword } }];
		}

		const orderBy = order_by_column && order_by ? { [order_by_column]: order_by.toLowerCase() } : { title: 'asc' };

		const result = await prisma.role.findMany({
			where,
			select: {
				role_id: true,
				title: true,
				description: true,
			},
			skip,
			take,
			orderBy,
		});
		const count = await prisma.role.count({ where });
		return handleSuccess(res, result, count);
	} catch (error) {
		next(error);
	}
};

//CREATE
export const create = async (req, res, next) => {
	try {
		const { title, description } = req.body;

		const { existData } = await commonValidation(req, res);
		if (existData) return handleError({ res, message: 'Title Alreayd Exist' });

		const result = await prisma.role.create({
			data: {
				title,
				description,
			},
		});

		return handleCreate(res, result);
	} catch (error) {
		next(error);
	}
};

//UPDATE
export const update = async (req, res, next) => {
	try {
		const { id } = req.params;

		const { title, description } = req.body;

		const { existData } = await commonValidation(req, res);
		if (existData) return handleError({ res, message: 'Title Alreayd Exist' });

		const result = await prisma.role.update({
			where: {
				role_id: BigInt(id),
			},
			data: {
				title,
				description,
			},
		});

		return handleUpdate(res, result);
	} catch (error) {
		next(error);
	}
};

//REMOVE
export const remove = async (req, res, next) => {
	try {
		const { id } = req.params;

		const result = await prisma.role.delete({
			where: {
				role_id: BigInt(id),
			},
		});

		return result ? hnaldeDelete(res, result) : handleNoRecordFound({ req });
	} catch (error) {
		next(error);
	}
};
