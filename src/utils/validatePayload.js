import { GraphQLResponse } from "./GraphQLResponse.js";

export const validatePayload = (fields, requiredFields = []) => {
  for (const field of requiredFields) {
    if (!fields[field]) {
      return GraphQLResponse.error(`${field} is required`);
    }
  }
  return null;
};
