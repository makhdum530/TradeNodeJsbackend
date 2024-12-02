import { NOT_FOUND, SUCCESS } from "./constant.util";

// CREATE
export const handleCreate = (
  res,
  message = "Operation successful.",
  result = null
) => {
  return res.status(SUCCESS).json({
    status: SUCCESS,
    message,
    result,
  });
};

// UPDATE
export const handleUpdate = (
  res,
  message = "Update successful.",
  result = null
) => {
  return res.status(SUCCESS).json({
    status: SUCCESS,
    message,
    result,
  });
};

// SUCCESS - GET
export const handleSuccess = (
  res,
  message = "Data retrieved successfully.",
  result = null
) => {
  return res.status(SUCCESS).json({
    status: SUCCESS,
    message,
    result,
  });
};

// DELET
export const hnaldeDelete = (
  res,
  message = "Deletion successful.",
  result = null
) => {
  return res.status(SUCCESS).json({
    status: SUCCESS,
    message,
    result,
  });
};

// Error Response
export const handleError = (
  res,
  message = "An error occurred.",
  result = null,
  status_code,
  return_status_code
) => {
  return res.status(status_code || NOT_FOUND).json({
    status: return_status_code || NOT_FOUND,
    message,
    result,
  });
};
