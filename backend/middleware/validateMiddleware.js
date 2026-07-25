module.exports = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const field in schema) {
      const rules = schema[field];
      const value = req.body[field];

      // Required fields
      if (rules.required && (value === undefined || value === null || value === "")) {
        errors.push(`${field} is required`);
        continue;
      }

      // Type checking
      if (rules.type && value !== undefined && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
      }

      // Min length
      if (rules.minLength && typeof value === "string" && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      // Max length
      if (rules.maxLength && typeof value === "string" && value.length > rules.maxLength) {
        errors.push(`${field} must be under ${rules.maxLength} characters`);
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(", ")}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    next();
  };
};