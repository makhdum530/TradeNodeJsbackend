import { FORBIDDEN } from "../utils/constant.util.js";
import { handleError } from "../utils/handleResponse.util.js";

export const permissionSuperAdmin = () => {
  return (req, res, next) => {
    try {
      const { role_id } = req;

      if (role_id !== 1) {
        return handleError({
          res,
          message: "Access denied. Only Super Admins can perform this action.",
          status_code: FORBIDDEN,
          return_status_code: FORBIDDEN,
        });
      }

      // If role_id is 1, proceed to the next middleware or route handler
      next();
    } catch (error) {
      next(error); // Pass any unexpected errors to the error handler
    }
  };
};
