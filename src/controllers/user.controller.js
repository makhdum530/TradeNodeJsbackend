import crypto from 'crypto';
import moment from 'moment';
import nodemailer from 'nodemailer';
import { prisma } from '../config/db.js';
import { decrypt, encrypt } from '../utils/crypto.util.js';
import { fvEmail, fvNumber, fvPassword, fvString } from '../utils/formValidator.util.js';
import { handleCreate, handleError, handleSuccess, handleUpdate } from '../utils/handleResponse.util.js';
import { FORBIDDEN } from '../utils/constant.util.js';

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

export const register = async (req, res, next) => {
	try {
		const { company_id } = req;
		const { email, password } = req.body;

		fvEmail(req, 'email');
		fvPassword(req, 'password');

		await prisma.$transaction(async (tx) => {
			const existUser = await tx.user.findFirst({
				where: {
					company_id,
					email,
				},
			});
			let user_id = null;
			if (existUser) {
				user_id = existUser?.user_id;

				if (existUser && existUser?.is_email_verified == 'yes')
					return handleError({
						res,
						message: 'verified user exist with same email',
					});

				//UPDATE OTP-EXPIRY-MIN
				await tx.user.update({
					where: {
						company_id,
						user_id,
					},
					data: {
						otp_expiry_time: new Date(),
					},
				});
			}

			if (!existUser) {
				const createdData = await tx.user.create({
					data: {
						company_id,
						email,
						password,
						role_id: 3, //default user role
					},
				});
				user_id = createdData?.user_id;
			}

			const encryptedData = encrypt(user_id);
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

//RESEND EMAIL
export const resendEmail = async (req, res, next) => {
	try {
		const { company_id, login_user_id, login_user_email } = req;

		const encryptedData = encrypt(login_user_id);
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
			to: login_user_email,
			subject: 'Email Verification',
			text: `Click the link below to verify your email:\n${verificationLink}`,
		};

		// Send the email
		await transporter.sendMail(mailOptions);

		return handleSuccess(res, verificationLink);
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
		const decrypted_user_id = decrypt(id);

		const existUser = await prisma.user.findFirst({
			where: {
				company_id,
				user_id: decrypted_user_id,
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
			return handleError({ res, message: 'OTP has expired. Please request a new OTP.' });
		}

		const result = await prisma.user.update({
			where: {
				company_id,
				user_id: decrypted_user_id,
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

		const result = await prisma.user.findFirst({
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
			user_id: result?.user_id,
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
		await prisma.session.create({
			data: {
				...sessionData,
				[deviceConfig.token_field]: token,
				[deviceConfig.device_field]: device_id,
				device_type: deviceConfig.device_type,
			},
		});
		result.user_id = encrypt(result?.user_id);

		return handleSuccess(res, result, '', 'Login SuccessFully');
	} catch (error) {
		next(error);
	}
};

export const getAll = async (req, res, next) => {
	try {
		const { company_id, login_user_id } = req;
		const { order_by, order_by_column, search_keyword, role_id } = req.query;

		// Parse pagination
		const skip = req.query.skip ? parseInt(req.query.skip, 10) : undefined;
		const take = req.query.take ? parseInt(req.query.take, 10) : undefined;

		const where = {
			company_id,
			...(role_id && { role_id }),
		};

		// Add search keyword filter if provided
		if (search_keyword) {
			where.OR = [{ first_name: { contains: search_keyword } }, { last_name: { contains: search_keyword } }, { email: { contains: search_keyword } }, { phone: { contains: search_keyword } }];
		}

		// Define sorting
		const orderBy = order_by_column && order_by ? { [order_by_column]: order_by.toLowerCase() } : { created_at: 'asc' };

		const result = await prisma.user.findMany({
			where,
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
			skip,
			take,
			orderBy,
		});

		const encryptedResult = result?.map((item) => ({
			...item,
			user_id: encrypt(item?.user_id),
		}));
		const count = await prisma.user.count({ where });
		return handleSuccess(res, encryptedResult, count);
	} catch (error) {
		next(error);
	}
};

//CREATE
// export const create = async (req, res, next) => {
// 	try {
// 		const { company_id, login_user_id } = req;
// 		const { first_name, last_name, email, phone, address1, address2, zip_code, country_id, role_id } = req.body;

// 		fvString(req, 'first_name');
// 		last_name && fvString(req, 'last_name');
// 		fvEmail(req, 'email');
// 		fvNumber(req, 'phone');
// 		fvString(req, 'address1');
// 		address2 && fvString(req, 'address2');
// 		fvString(req, 'zip_code');
// 		fvNumber(req, 'country_id');
// 		fvNumber(req, 'role_id');

// 		const existData = await prisma.user.findFirst({
// 			where: {
// 				company_id,
// 				email,
// 			},
// 		});

//     if(existData) handleError({res,message:"Email already taken"})
// 		const result = await prisma.user.create({
// 			data: {
// 				company_id,
// 				role_id,
// 				country_id,
// 				first_name,
// 				last_name,
// 				email,
// 				phone,
// 				address1,
// 				address2,
// 				zip_code,
// 			},
// 		});
// 		return handleCreate(res, result);
// 	} catch (error) {
// 		next(error);
// 	}
// };

//UPDATE
export const update = async (req, res, next) => {
	try {
		const { company_id, login_user_id, role_id } = req;
		const { id } = req.params;
		const decrypted_user_id = decrypt(id);

		const { first_name, last_name, email, phone, address1, address2, zip_code } = req.body;

		fvString(req, 'id');
		fvString(req, 'first_name');
		last_name && fvString(req, 'last_name');
		fvEmail(req, 'email');
		fvNumber(req, 'phone');
		fvString(req, 'address1');
		address2 && fvString(req, 'address2');
		fvString(req, 'zip_code');

		if (role_id != 1 && login_user_id != decrypted_user_id) {
			return handleError({
				res,
				message: 'Access denied. Only Super Admins can perform this action.',
				status_code: FORBIDDEN,
				return_status_code: FORBIDDEN,
			});
		}
		const result = await prisma.user.update({
			where: {
				company_id,
				user_id: decrypted_user_id,
			},
			data: {
				first_name,
				last_name,
				email,
				phone,
				address1,
				address2,
				zip_code: zip_code || null,
				profile_filling: 'yes',
			},
		});
		return handleUpdate(res, result);
	} catch (error) {
		next(error);
	}
};

async function getUserDatailsById({ where }) {
	return await prisma.user.findFirst({
		where,
		select: {
			profile_filling: true,
			kyc_filling: true,
			kyc_document_title: true,
			kyc_document_media_url: true,
			kyc_video_media_url: true,
			exchange_verify: true,
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
	});
}

//GET BY ID
export const getByIdCompanyUser = async (req, res, next) => {
	try {
		const { company_id, login_user_id, role_id } = req;
		const { id } = req.params;

		fvString(req, 'id');
		const decrypted_user_id = decrypt(id);

		const where = {
			company_id,
			user_id: decrypted_user_id,
		};

		const result = await getUserDatailsById({ where });

		return handleSuccess(res, result);
	} catch (error) {
		next(error);
	}
};

//GET BY ID CUSTOMER/USER
export const getByIdUser = async (req, res, next) => {
	try {
		const { company_id, login_user_id, role_id } = req;
		const { id } = req.params;

		fvString(req, 'id');
		const decrypted_user_id = decrypt(id);

		const where = {
			company_id,
			user_id: decrypted_user_id,
		};

		const result = await getUserDatailsById({ where });

		return handleSuccess(res, result);
	} catch (error) {
		next(error);
	}
};
