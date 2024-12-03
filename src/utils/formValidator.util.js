export const fvEmail = (req, res, key) => {
  const value = req.body[key] || req.query[key] || req.params[key];

  if (!value) throw new Error(`${key} is required.`);

  // Regular expression for validating an email format
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  if (!emailRegex.test(value)) throw new Error(`${key} must be a valid email.`);

  return value;
};

export const fvNumber = (req, res, key) => {
  const value = req.body[key] || req.query[key] || req.params[key];

  if (!value) throw new Error(`${key} is required.`);
  if (!/^\d+$/.test(value)) throw new Error(`${key} must be a number.`);

  return value;
};

export const fvString = (req, res, key) => {
  const value = req.body[key] || req.query[key] || req.params[key];

  if (!value) throw new Error(`${key} is required.`);
  if (typeof value !== "string") throw new Error(`${key} must be a string.`);

  return value;
};
