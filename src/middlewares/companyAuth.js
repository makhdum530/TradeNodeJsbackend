import { prisma } from "../config/db.js";
import { SESSION_EXPIRED } from "../utils/constant.util.js";
import { decrypt } from "../utils/crypto.util.js";
import { fvEnum, fvString } from "../utils/formValidator.util.js";
import { handleError } from "../utils/handleResponse.util.js";

export const validateCompanyMiddlewareCompanyAuth = async (req, res, next) => {
  try {
    fvString(req, "companyid");
    fvEnum(req, "devicetype", ["ANDROID", "IOS", "WEB"]);
    const companyid = req.headers.companyid; // Encrypted company_id from header
    const devicetype = req.headers.devicetype; // Encrypted company_id from header

    // Decrypt company_id
    const company_id = decrypt(companyid);

    // Fetch company details from the database
    const company = await prisma.company.findFirstOrThrow({
      where: { company_id },
    });

    if (!company || !company.status == "active") {
      return handleError({ res, message: "Invalid or inactive company." });
    }

    // Attach company_id to req for use in controllers
    req.company_id = company_id;
    req.device_type = devicetype;
    req.expiry_minutes = company?.expiry_minutes;

    next();
  } catch (error) {
    next(error);
  }
};

export const validateLoginMiddlewareCompanyAuth = async (req, res, next) => {
  try {
    // Call the company verification middleware as a child function
    await new Promise((resolve, reject) => {
      validateCompanyMiddlewareCompanyAuth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Validate required headers
    fvEnum(req, "devicetype", ["ANDROID", "IOS", "WEB"]);
    fvString(req, "logintoken");
    fvString(req, "userid");

    const devicetype = req.headers.devicetype;
    const logintoken = req.headers.logintoken;
    const company_id = req.company_id; // Assumes company_id is already set by previous middleware (e.g., validateCompanyMiddleware)
    const userid = req.headers.userid; // Assumes company_id is already set by previous middleware (e.g., validateCompanyMiddleware)
    const company_user_id = decrypt(userid);

    // Fetch user details to check user status
    const user = await prisma.company_user.findFirst({
      where: {
        company_user_id,
        company_id,
        status: "active",
      },
    });

    if (!user)
      return handleError({ res, message: "Invalid or inactive user." });

    req.login_user_id = company_user_id;
    req.role_id = Number(user?.role_id);
    
    // Determine the token column based on the device type
    const tokenColumn =
      devicetype === "ANDROID"
        ? "anroid_token"
        : devicetype === "IOS"
        ? "ios_token"
        : "web_token";

    // Fetch the session based on the device type and token
    const session = await prisma.company_session.findFirst({
      where: {
        company_id,
        company_user_id,
        [tokenColumn]: logintoken,
      },
    });

    if (!session) {
      return handleError({
        res,
        message: "Invalid or expired login token.",
        status_code: SESSION_EXPIRED,
        return_status_code: SESSION_EXPIRED,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};
