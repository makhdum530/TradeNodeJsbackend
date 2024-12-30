import { NOT_FOUND, SUCCESS } from './constant.util.js';

// utils/convertBigInt.util.js
export const convertBigIntToString = (data) => JSON.parse(JSON.stringify(data, (key, value) => (typeof value === 'bigint' ? value.toString() : value)));

// CREATE
export const handleCreate = (res, result = null, message = 'Operation successful.') => {
	return res.status(SUCCESS).json({
		status: SUCCESS,
		message,
		result: convertBigIntToString(result),
	});
};

// UPDATE
export const handleUpdate = (res, result = null, message = 'Update successful.') => {
	return res.status(SUCCESS).json({
		status: SUCCESS,
		message,
		result: convertBigIntToString(result),
	});
};

// SUCCESS - GET
export const handleSuccess = (res, result = null, count = null, message = 'Data retrieved successfully.') => {
	return res.status(SUCCESS).json({
		status: SUCCESS,
		message,
		result: convertBigIntToString(result),
		...(count && { count }),
	});
};

// DELET
export const hnaldeDelete = (res, result = null, message = 'Deletion successful.') => {
	return res.status(SUCCESS).json({
		status: SUCCESS,
		message,
		result: convertBigIntToString(result),
	});
};

// Error Response
export const handleError = ({ res, result = null, message = 'An error occurred.', status_code, return_status_code }) => {
	return res.status(status_code || NOT_FOUND).json({
		status: return_status_code || NOT_FOUND,
		message,
		result: convertBigIntToString(result),
	});
};

// NO RECORD FOUND
export const handleNoRecordFound = ({ res }) => {
	return res.status(NOT_FOUND).json({
		status: NOT_FOUND,
		message: 'No Record Found',
		result: '',
	});
};
