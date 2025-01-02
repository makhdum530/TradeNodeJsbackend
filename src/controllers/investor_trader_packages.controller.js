import { prisma } from '../config/db.js';
import { fvEnum, fvNumber, fvString } from '../utils/formValidator.util.js';
import { handleCreate, handleError, handleNoRecordFound, handleSuccess, handleUpdate, hnaldeDelete } from '../utils/handleResponse.util.js';

async function commonValidation(req, res) {
	const { id } = req.params || {};
	const { role_id, name, min_amount, max_amount, daily_roi, period_days, waiting_period_days, type } = req.body;

	const investor_trader_packages_id = req?.params?.id ? BigInt(id) : null;
	fvNumber(req, 'role_id');
	fvString(req, 'name');
	fvNumber(req, 'min_amount');
	fvNumber(req, 'max_amount');
	fvNumber(req, 'daily_roi');
	fvNumber(req, 'period_days');
	fvNumber(req, 'waiting_period_days');
	fvEnum(req, 'type', ['investor', 'trader']);

	const existData = await prisma.investor_trader_packages.findFirst({
		where: {
			name,
			...(investor_trader_packages_id && { investor_trader_packages_id: { not: investor_trader_packages_id } }),
		},
	});

	return { existData };
}

//LIST
export const getAll = async (req, res, next) => {
	try {
		const { company_id } = req;
		const { role_id, order_by, order_by_column, search_keyword } = req.query;

		const skip = req.query.skip ? parseInt(req.query.skip, 10) : undefined;
		const take = req.query.take ? parseInt(req.query.take, 10) : undefined;

		fvEnum(req, 'role_id',['5','6']);

		let where = {
			company_id,
			role_id,
		};

		if (search_keyword) {
			where.OR = [{ name: { contains: search_keyword } }];
		}

		const orderBy = order_by_column && order_by ? { [order_by_column]: order_by.toLowerCase() } : { created_at: 'asc' };
		const result = await prisma.investor_trader_packages.findMany({
			where,
			select: {
				role: {
					select: {
						role_id: true,
						title: true,
					},
				},
				name: true,
				min_amount: true,
				max_amount: true,
				daily_roi: true,
				period_days: true,
				waiting_period_days: true,
				type: true,
			},
			skip,
			take,
			orderBy,
		});

		const count = await prisma.investor_trader_packages.count({ where });
		return handleSuccess(res, result, count);
	} catch (error) {
		next(error);
	}
};

//CREATE
export const create = async (req, res, next) => {
	try {
		const { company_id } = req;
		const { role_id, name, min_amount, max_amount, daily_roi, period_days, waiting_period_days, type } = req.body;

		const { existData } = await commonValidation(req, res);
		if (existData) return handleError({ res, message: 'Name Alreayd Exist' });

		const result = await prisma.investor_trader_packages.create({
			data: {
				company_id,
				role_id,
				name,
				min_amount,
				max_amount,
				daily_roi,
				period_days,
				waiting_period_days,
				type,
				created_at: new Date(),
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
		const { company_id } = req;
		const { id } = req.params;

		const { role_id, name, min_amount, max_amount, daily_roi, period_days, waiting_period_days, type } = req.body;

		const { existData } = await commonValidation(req, res);
		if (existData) return handleError({ res, message: 'Name Alreayd Exist' });

		const result = await prisma.investor_trader_packages.update({
			where: {
				company_id,
				investor_trader_packages_id: BigInt(id),
			},
			data: {
				role_id,
				name,
				min_amount,
				max_amount,
				daily_roi,
				period_days,
				waiting_period_days,
				type,
				updated_at: new Date(),
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
		const { company_id } = req;
		const { id } = req.params;

		const result = await prisma.investor_trader_packages.delete({
			where: {
				company_id,
				investor_trader_packages_id: BigInt(id),
			},
		});

		return result ? hnaldeDelete(res, result) : handleNoRecordFound({ req });
	} catch (error) {
		next(error);
	}
};
