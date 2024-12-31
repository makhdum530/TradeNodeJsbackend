import { prisma } from '../config/db.js';
import { decrypt } from '../utils/crypto.util.js';
import { fvString } from '../utils/formValidator.util.js';
import { handleCreate, handleError } from '../utils/handleResponse.util.js';

//UPDATE
export const assignedUser = async (req, res, next) => {
	try {
		const { company_id, login_user_id, role_id } = req;
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
		// if (manager_role_id && manager_role_id != 4) handleError({ res, message: `The user ${existData?.first_name} must have the 'Manager' role to assign another user to them.` });

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
