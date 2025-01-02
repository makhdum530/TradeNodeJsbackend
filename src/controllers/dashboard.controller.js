import { prisma } from '../config/db.js';
import { handleSuccess } from '../utils/handleResponse.util.js';

//UPDATE
export const dashboard = async (req, res, next) => {
	try {
		const { company_id, login_user_id, role_id } = req;

		let manager = 0;
		let customer = 0;
		if (role_id == 1) {
			//INTERNAL MANAGERS
			manager = await prisma.company_user.count({
				where: {
					company_id,
					role_id: 4,
				},
			});
			//CUSTOMER
			customer = await prisma.user.count({
				where: {
					company_id,
				},
			});
		} else if (role_id == 4) {
			//MANAGER RESPONSE
			manager = await prisma.assigned_user.count({
				where: {
					company_id,
					company_user_id: login_user_id,
				},
			});
		}

		return handleSuccess(res, { manager, customer });
	} catch (error) {
		next(error);
	}
};
