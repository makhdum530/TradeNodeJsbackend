import { prisma } from "../config/db.js";
import { fvEmail, fvNumber, fvString } from "../utils/formValidator.util.js";
import { handleCreate, handleUpdate } from "../utils/handleResponse.util.js";

//UPDATE
export const update = async (req, res, next) => {
  try {
    const { company_id } = req;
    const { id } = req.params;
    const { name, email, phone, address1, address2, zip_code } = req.body;

    fvString(req, "id");
    fvString(req, "name");
    fvEmail(req, "email");
    fvNumber(req, "phone");
    fvString(req, "address1");
    fvString(req, "address2");
    fvNumber(req, "zip_code");

    const result = await prisma.company.update({
      where: { company_id },
      data: {
        name,
        email,
        phone,
        address1,
        address2,
        zip_code,
      },
    });
    return handleUpdate(res, result);
  } catch (error) {
    next(error);
  }
};
