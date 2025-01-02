import crypto from 'crypto';
import moment from 'moment';
import nodemailer from 'nodemailer';
import { prisma } from '../config/db.js';
import { decrypt, encrypt } from '../utils/crypto.util.js';
import { fvEmail, fvNumber, fvPassword, fvString } from '../utils/formValidator.util.js';
import { handleError, handleSuccess, handleUpdate } from '../utils/handleResponse.util.js';
import { FORBIDDEN } from '../utils/constant.util.js';
import { title } from 'process';

// async function saveOtp(params) {
//   const { otp, email } = params;
//   const updatedData = await prisma.otp.update({
//     where: {
//       email,
//     },
//     data: { otp },
//   });
//   if (!updatedData) {
//     await prisma.otp.create({
//       data: { email, otp },
//     });
//   }

//   return true;
// }

export const sendEmailVarificationLink = async (req, res, next) => {
	try {
		const { company_id } = req;
		const { email, password } = req.body;

		fvEmail(req, 'email');
		fvPassword(req, 'password');

		await prisma.$transaction(async (tx) => {
			const existUser = await tx.company_user.findFirst({
				where: {
					company_id,
					email,
				},
			});
			let company_user_id = null;
			if (existUser) {
				company_user_id = existUser?.company_user_id;

				//UPDATE OTP-EXPIRY-MIN
				await tx.company_user.update({
					where: {
						company_id,
						company_user_id,
					},
					data: {
						otp_expiry_time: new Date(),
					},
				});

				if (existUser && existUser?.is_email_verified == 'yes')
					return handleError({
						res,
						message: 'verified user exist with same email',
					});
			}

			if (!existUser) {
				const createdData = await tx.company_user.create({
					data: {
						company_id,
						email,
						password,
						role_id: 3, //default user role
					},
				});
				company_user_id = createdData?.company_user_id;
			}

			const encryptedData = encrypt(company_user_id);
			const verificationLink = `${process.env.API_URL}/verify/${encryptedData}`;

			// Set up nodemailer transporter
			const transporter = nodemailer.createTransport({
				service: 'Gmail', // Replace with your email service
				auth: {
					user: process.env.EMAIL_USERNAME, // Your email address
					pass: process.env.EMAIL_PASSWORD, // Your email password
				},
			});

			// Define the email content
			const mailOptions = {
				from: process.env.EMAIL_USERNAME,
				to: email,
				subject: 'Email Verification',
				text: `Click the link below to verify your email:\n${verificationLink}`,
			};

			// Send the email
			await transporter.sendMail(mailOptions);

			return handleSuccess(res, verificationLink);
		});
	} catch (error) {
		next(error);
	}
};

//VERIFY EMAIL
export const verifyEmail = async (req, res, next) => {
	try {
		const { company_id, expiry_minutes } = req;
		const { id } = req.params;

		fvString(req, 'id');
		const decrypted_company_user_id = decrypt(id);

		const existUser = await prisma.company_user.findFirst({
			where: {
				company_id,
				company_user_id: decrypted_company_user_id,
			},
			select: {
				is_email_verified: true,
				otp_expiry_time: true,
			},
		});
		// Check if email is already verified
		if (existUser?.is_email_verified === 'yes') return handleError({ res, message: 'Email is already verified.' });

		// Check if OTP has expired
		const expiryTime = moment(existUser?.otp_expiry_time).add(expiry_minutes, 'minutes');
		const currentTime = moment();

		if (currentTime.isAfter(expiryTime)) {
			throw new Error('OTP has expired. Please request a new OTP.');
		}

		const result = await prisma.company_user.update({
			where: {
				company_id,
				company_user_id: decrypted_company_user_id,
				// is_email_verified: "no",
			},
			data: {
				is_email_verified: 'yes',
			},
		});

		return handleSuccess(res, result);
	} catch (error) {
		next(error);
	}
};

export const login = async (req, res, next) => {
	try {
		const { company_id, device_type } = req;
		const { email, password, device_id } = req.body;

		const result = await prisma.company_user.findFirst({
			where: {
				company_id,
				email,
				password,
			},
		});
		if (!result) return handleError({ res, message: 'Invalid email or password' });

		// Generate a secure token
		const token = crypto.randomBytes(32).toString('hex');

		// Get current time and set expiry time (1 hour later)
		const expiryTime = new Date(Date.now() + 60 * 60 * 1000);

		// Insert session record based on device type
		const sessionData = {
			company_user_id: result?.company_user_id,
			company_id,
			expires_at: expiryTime,
		};

		// Handle device-specific session insertion
		const deviceFields = {
			ANDROID: {
				token_field: 'anroid_token',
				device_field: 'device_id_android',
				device_type: 'ANDROID',
			},
			IOS: {
				token_field: 'ios_token',
				device_field: 'device_id_ios',
				device_type: 'IOS',
			},
			WEB: {
				token_field: 'web_token',
				device_field: 'device_id_web',
				device_type: 'WEB',
			},
		};

		// Check if the device type is valid
		const deviceConfig = deviceFields[device_type];
		if (!deviceConfig) return handleError({ res, message: 'Invalid device type' });

		// Create session with device-specific data
		await prisma.company_session.create({
			data: {
				...sessionData,
				[deviceConfig.token_field]: token,
				[deviceConfig.device_field]: device_id,
				device_type: deviceConfig.device_type,
			},
		});
		result.company_user_id = encrypt(result?.company_user_id);
		result.login_token = token;

		return handleSuccess(res, result, '', 'Login SuccessFully');
	} catch (error) {
		next(error);
	}
};

export const getAll = async (req, res, next) => {
	try {
		const { company_id } = req;
		const { order_by, order_by_column, search_keyword } = req.query;

		// Parse pagination
		const skip = req.query.skip ? parseInt(req.query.skip, 10) : undefined;
		const take = req.query.take ? parseInt(req.query.take, 10) : undefined;

		const where = {
			company_id,
		};

		// Add search keyword filter if provided
		if (search_keyword) {
			where.OR = [{ first_name: { contains: search_keyword } }, { last_name: { contains: search_keyword } }, { email: { contains: search_keyword } }, { phone: { contains: search_keyword } }];
		}

		// Define sorting
		const orderBy = order_by_column && order_by ? { [order_by_column]: order_by.toLowerCase() } : { created_at: 'asc' };

		const result = await prisma.company_user.findMany({
			where,
			select: {
				company_user_id: true,
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
			skip,
			take,
			orderBy,
		});

		// Encrypt user IDs
		const encryptedResult = await Promise.all(
			result.map(async (user) => ({
				...user,
				company_user_id: encrypt(user.company_user_id),
			}))
		);

		const count = await prisma.company_user.count({ where });
		return handleSuccess(res, encryptedResult, count);
	} catch (error) {
		next(error);
	}
};

//CREATE
export const create = async (req, res, next) => {
	try {
		const { company_id, login_company_user_id, role_id } = req;

		const { first_name, last_name, email, phone, address1, address2, zip_code, manager_role_id, password } = req.body;

		fvString(req, 'first_name');
		last_name && fvString(req, 'last_name');
		fvEmail(req, 'email');
		fvNumber(req, 'phone');
		fvString(req, 'address1');
		address2 && fvString(req, 'address2');
		fvString(req, 'zip_code');
		fvNumber(req, 'manager_role_id');
		fvString(req, 'password');

		if (role_id != 2) {
			return handleError({
				res,
				message: 'Access denied. Only Admins can perform this action.',
				status_code: FORBIDDEN,
				return_status_code: FORBIDDEN,
			});
		}

		if (manager_role_id != 4) {
			return handleError({
				res,
				message: 'Only Manager Role Accepted.',
				status_code: FORBIDDEN,
				return_status_code: FORBIDDEN,
			});
		}

		const existData = await prisma.company_user.findFirst({
			where: {
				company_id,
				email,
			},
		});
		if (existData) {
			return handleError({
				res,
				message: 'Email Already Exist',
				status_code: FORBIDDEN,
				return_status_code: FORBIDDEN,
			});
		}

		const result = await prisma.company_user.create({
			data: {
				company_id,
				first_name,
				last_name,
				email,
				phone,
				address1,
				address2,
				zip_code: zip_code || null,
				role_id: manager_role_id,
				password,
				created_at: new Date(),
			},
		});
		result.company_user_id = encrypt(result.company_user_id);
		return handleUpdate(res, result);
	} catch (error) {
		next(error);
	}
};

//UPDATE
export const update = async (req, res, next) => {
	try {
		const { company_id, login_company_user_id, role_id } = req;
		const { id } = req.params;
		const { first_name, last_name, email, phone, address1, address2, zip_code } = req.body;

		fvString(req, 'id');
		const decrypted_company_user_id = decrypt(id);

		fvString(req, 'first_name');
		last_name && fvString(req, 'last_name');
		fvEmail(req, 'email');
		fvNumber(req, 'phone');
		fvString(req, 'address1');
		address2 && fvString(req, 'address2');
		fvString(req, 'zip_code');

		if (role_id != 2 && login_company_user_id != decrypted_company_user_id) {
			return handleError({ res, message: 'Access denied. Only Admins can perform this action.', status_code: FORBIDDEN, return_status_code: FORBIDDEN });
		}

		const result = await prisma.company_user.update({
			where: {
				company_id,
				company_user_id: decrypted_company_user_id,
			},
			data: {
				first_name,
				last_name,
				email,
				phone,
				address1,
				address2,
				zip_code: zip_code || null,
			},
		});
		return handleUpdate(res, result);
	} catch (error) {
		next(error);
	}
};

//GET BY ID
export const getById = async (req, res, next) => {
	try {
		const { company_id, login_company_user_id, role_id } = req;
		const { id } = req.params;

		fvString(req, 'id');
		const decrypted_company_user_id = decrypt(id);

		const result = await prisma.company_user.findFirstOrThrow({
			where: {
				company_id,
				company_user_id: decrypted_company_user_id,
			},
			select: {
				is_email_verified: true,
				media_url: true,
				first_name: true,
				last_name: true,
				email: true,
				phone: true,
				address1: true,
				address2: true,
				zip_code: true,
				created_at: true,
				country: {
					select: {
						name: true,
						phone_code: true,
						currency: true,
					},
				},
				role: {
					select: {
						title: true,
					},
				},
			},
		});
		return handleSuccess(res, result);
	} catch (error) {
		next(error);
	}
};
