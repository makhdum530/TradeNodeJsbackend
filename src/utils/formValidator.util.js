const fvNumber = (req, res, key) => {
  const value = req.body[key] || req.query[key] || req.params[key];

  if (!value) throw new Error(`${key} is required.`);
  if (!/^\d+$/.test(value)) throw new Error(`${key} must be a number.`);

  return value;
};

const fvString = (req, res, key) => {
  const value = req.body[key] || req.query[key] || req.params[key];

  if (!value) throw new Error(`${key} is required.`);
  if (typeof value !== "string") throw new Error(`${key} must be a string.`);

  return value;
};
