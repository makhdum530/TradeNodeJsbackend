import { prisma } from "../config/db.js";
import { fvEmail } from "../utils/formValidator.util.js";
import { handleSuccess } from "../utils/handleResponse.util.js";
import nodemailer from "nodemailer";

async function saveOtp(params) {
  const { otp, email } = params;
  const updatedData = await prisma.otp.update({
    where: {
      email,
    },
    data: { otp },
  });
  if (!updatedData) {
    await prisma.otp.create({
      data: { email, otp },
    });
  }

  return true;
}

export const sendEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    fvEmail(req, "email");
    const otp = Math.floor(100000 + Math.random() * 900000);

    await saveOtp({ email, otp }); // Replace with your own function

    // Step 4: Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Replace with your email service
      auth: {
        user: process.env.EMAIL_USERNAME, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password
      },
    });

    // Step 5: Define the email content
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };

    // Step 6: Send the email
    await transporter.sendMail(mailOptions);

    return handleSuccess(req);
    //send email with generated otp
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const {} = req;
    const {} = req.query;

    const where = {
      user_id: 1,
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
