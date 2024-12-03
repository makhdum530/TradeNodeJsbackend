import { NOT_FOUND, SUCCESS } from "./constant.util.js";

// utils/convertBigInt.util.js
export const convertBigIntToString = (data) =>
  JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

// CREATE
export const handleCreate = (
  res,
  message = "Operation successful.",
  result = null
) => {
  return res.status(SUCCESS).json({
    status: SUCCESS,
    message,
    result: convertBigIntToString(result),
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
    result: convertBigIntToString(result),
  });
};

// SUCCESS - GET
export const handleSuccess = (
  res,
  result = null,
  count = null,
  message = "Data retrieved successfully."
) => {
  return res.status(SUCCESS).json({
    status: SUCCESS,
    message,
    result: convertBigIntToString(result),
    ...(count && { count }),
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
    result: convertBigIntToString(result),
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
    result: convertBigIntToString(result),
  });
};
