import { GraphQLResponse } from "../utils/GraphQLResponse.js";
import { checkAccessToken } from "../utils/tokenHandler.js";

/**
 * ✅ Middleware to authenticate GraphQL resolvers
 */
export function authenticateResolver(resolver) {
  return async (parent, args, context, info) => {
    const access_token = context?.headers["access_token"];
    const device_id = context?.headers["device_id"];

    if (!access_token || !device_id) {
      return GraphQLResponse.error(
        "Unauthorized: Missing 'access_token' or 'device_id' header."
      );
    }

    const decoded = checkAccessToken({ access_token, device_id });
    if (!decoded) {
      return GraphQLResponse.error(
        "Unauthorized: Invalid or expired 'access_token'."
      );
    }

    return resolver(
      parent,
      { ...args, req_user_id: decoded.user_id, device_id: decoded.device_id },
      context,
      info
    );
  };
}
