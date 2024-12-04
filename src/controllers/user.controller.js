import moment from "moment";
import { prisma } from "../config/db.js";
import { decrypt, encrypt } from "../utils/crypto.util.js";
import { fvEmail, fvPassword, fvString } from "../utils/formValidator.util.js";
import { handleError, handleSuccess } from "../utils/handleResponse.util.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

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

    fvEmail(req, "email");
    fvPassword(req, "password");

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

        if (existUser && existUser?.is_email_verified == "yes")
          return handleError({
            res,
            messgae: "verified user exist with same email",
          });
      }

      if (!existUser) {
        const createdData = await tx.user.create({
          data: {
            company_id,
            email,
            password,
          },
        });
        user_id = createdData?.user_id;
      }

      const encryptedData = encrypt(user_id);
      const verificationLink = `${process.env.API_URL}/verify/${encryptedData}`;

      // Set up nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "Gmail", // Replace with your email service
        auth: {
          user: process.env.EMAIL_USERNAME, // Your email address
          pass: process.env.EMAIL_PASSWORD, // Your email password
        },
      });

      // Define the email content
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: "Email Verification",
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

    fvString(req, "id");
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
    if (existUser?.is_email_verified === "yes")
      return handleError({ res, message: "Email is already verified." });

    // Check if OTP has expired
    const expiryTime = moment(existUser?.otp_expiry_time).add(
      expiry_minutes,
      "minutes"
    );
    const currentTime = moment();

    if (currentTime.isAfter(expiryTime)) {
      throw new Error("OTP has expired. Please request a new OTP.");
    }

    const result = await prisma.user.update({
      where: {
        company_id,
        user_id: decrypted_user_id,
        // is_email_verified: "no",
      },
      data: {
        is_email_verified: "yes",
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

    const userData = await prisma.user.findFirst({
      where: {
        company_id,
        email,
        password,
      },
    });
    if (!userData)
      return handleError({ res, message: "Invalid email or password" });

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Get current time and set expiry time (1 hour later)
    const expiryTime = new Date(Date.now() + 60 * 60 * 1000);

    // Insert session record based on device type
    const sessionData = {
      user_id: userData.user_id,
      company_id,
      expires_at: expiryTime,
    };

    // Handle device-specific session insertion
    const deviceFields = {
      ANDROID: {
        token_field: "anroid_token",
        device_field: "device_id_android",
        device_type: "ANDROID",
      },
      IOS: {
        token_field: "ios_token",
        device_field: "device_id_ios",
        device_type: "IOS",
      },
      WEB: {
        token_field: "web_token",
        device_field: "device_id_web",
        device_type: "WEB",
      },
    };

    // Check if the device type is valid
    const deviceConfig = deviceFields[device_type];
    if (!deviceConfig)
      return handleError({ res, message: "Invalid device type" });

    // Create session with device-specific data
    await prisma.session.create({
      data: {
        ...sessionData,
        [deviceConfig.token_field]: token,
        [deviceConfig.device_field]: device_id,
        device_type: deviceConfig.device_type,
      },
    });

    return handleSuccess(res, "", "", "Login SuccessFully");
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { company_id } = req;
    const {} = req.query;

    const where = {
      company_id,
      // user_id: 1,
    };

    const result = await prisma.user.findMany({
      where,
    });
    const count = await prisma.user.count({ where });

    return handleSuccess(res, result, count);
  } catch (error) {
    next(error);
  }
};
