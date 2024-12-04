export const fvEmail = (req, key) => {
  const value = req.body[key] || req.query[key] || req.params[key];

  if (!value) throw new Error(`${key} is required.`);

  // Regular expression for validating an email format
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  if (!emailRegex.test(value)) throw new Error(`${key} must be a valid email.`);

  return value;
};

export const fvPassword = (req, key) => {
  const value = req.body[key] || req.query[key] || req.params[key];
  if (!value) throw new Error(`${key} is required.`);
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(value)) {
    throw new Error(
      `${key} must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.`
    );
  }
  return value;
};

export const fvNumber = (req, key) => {
  const value = req.body[key] || req.query[key] || req.params[key];

  if (!value) throw new Error(`${key} is required.`);
  if (!/^\d+$/.test(value)) throw new Error(`${key} must be a number.`);

  return value;
};

export const fvString = (req, key) => {
  const value =
    req.body[key] || req.query[key] || req.headers[key] || req.params[key];

  if (!value) throw new Error(`${key} is required.`);
  if (typeof value !== "string") throw new Error(`${key} must be a string.`);

  return value;
};

export const fvEnum = (req, key, allowedValues) => {
  const value =
    req.body[key] || req.query[key] || req.headers[key] || req.params[key];

  if (!value) throw new Error(`${key} is required.`);
  if (typeof value !== "string") throw new Error(`${key} must be a string.`);
  if (!allowedValues.includes(value)) {
    throw new Error(`${key} must be one of [${allowedValues.join(", ")}].`);
  }

  return value;
};
