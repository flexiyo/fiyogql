export const validatePayload = (payload, requiredFields = []) => {
  if (typeof payload !== "object" || payload === null) {
    return "Invalid payload: Expected an object";
  }

  for (const field of requiredFields) {
    if (!payload[field]) {
      return `'${field}' is required.`;
    }
  }

  for (const [key, value] of Object.entries(payload)) {
    const allowFalsyValues = ["offset"];

    const isInvalid =
      !allowFalsyValues.includes(key) &&
      (value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "object" && Object.keys(value).length === 0));

    if (isInvalid) {
      return `'${key}' cannot be empty.`;
    }
  }

  return null;
};
