import { prisma } from '../config/db.js';
import { decrypt, encrypt } from '../utils/crypto.util.js';
import { fvString } from '../utils/formValidator.util.js';
import { handleCreate, handleError, handleSuccess } from '../utils/handleResponse.util.js';

//UPDATE
export const assignedUser = async (req, res, next) => {
	try {
		const { company_id } = req;
		let { user_id, company_user_id } = req.body;

		fvString(req, 'user_id');
		fvString(req, 'company_user_id');

		user_id = decrypt(user_id);
		company_user_id = decrypt(company_user_id);

		const existData = await prisma.company_user.findFirst({
			where: {
				company_id,
				company_user_id,
			},
			select: {
				first_name: true,
				role: {
					select: {
						role_id: true,
					},
				},
			},
		});
		const manager_role_id = existData?.role?.role_id;
		if (manager_role_id && manager_role_id != 4) handleError({ res, message: `The user ${existData?.first_name} must have the 'Manager' role to assign another user to them.` });

		const result = await prisma.assigned_user.create({
			data: {
				company_id,
				user_id,
				company_user_id,
				created_at: new Date(),
			},
		});
		return handleCreate(res, result);
	} catch (error) {
		next(error);
	}
};

//GET ALL
export const getAll = async (req, res, next) => {
	try {
		const { company_id, role_id, login_user_id } = req;
		let { company_user_id, order_by, order_by_column, search_keyword } = req.query;

		//OWNER
		if (role_id == 1) {
			fvString(req, 'company_user_id');
			company_user_id = decrypt(company_user_id);
		} else if (role_id == 4) {
			//MANAGER
			company_user_id = login_user_id;
		}

		// Parse pagination
		const skip = req.query.skip ? parseInt(req.query.skip, 10) : undefined;
		const take = req.query.take ? parseInt(req.query.take, 10) : undefined;

		const where = {
			company_id,
			company_user_id,
		};

		// Add search keyword filter if provided
		if (search_keyword) {
			where.OR = [
				{
					user: {
						first_name: { contains: search_keyword },
						last_name: { contains: search_keyword },
						email: { contains: search_keyword },
						phone: { contains: search_keyword },
					},
				},
			];
		}

		// Define sorting
		const orderBy = order_by_column && order_by ? { [order_by_column]: order_by.toLowerCase() } : { created_at: 'asc' };

		const result = await prisma.assigned_user.findMany({
			where,
			select: {
				assigned_user_id: true,
				// company_user: {
				// 	select: {
				// 		first_name: true,
				// 		last_name: true,
				// 		email: true,
				// 		phone: true,
				// 		address1: true,
				// 		address2: true,
				// 		zip_code: true,
				// 		country: {
				// 			select: {
				// 				name: true,
				// 			},
				// 		},
				// 		role: {
				// 			select: {
				// 				role_id: true,
				// 				title: true,
				// 			},
				// 		},
				// 	},
				// },
				user: {
					select: {
						profile_filling: true,
						kyc_filling: true,
						kyc_document_title: true,
						kyc_document_media_url: true,
						kyc_video_media_url: true,
						exchange_verify: true,
						user_id: true,
						first_name: true,
						last_name: true,
						email: true,
						phone: true,
						address1: true,
						address2: true,
						zip_code: true,
						country: {
							select: {
								name: true,
							},
						},
						role: {
							select: {
								role_id: true,
								title: true,
							},
						},
					},
				},
			},
			skip,
			take,
			orderBy,
		});

		// Decrypt user_id for each user in the result
		const decryptedResult = result.map((item) => ({
			...item,
			user: {
				...item.user,
				user_id: encrypt(item.user.user_id), // Decrypt the user_id
			},
		}));
		const count = await prisma.assigned_user.count({ where });
		return handleSuccess(res, decryptedResult, count);
	} catch (error) {
		next(error);
	}
};
