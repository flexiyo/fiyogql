import { GQLResponse } from "../utils/GQLResponse.js";
import { checkAccessToken } from "../utils/tokenHandler.js";

/**
 * ✅ Middleware to authenticate GraphQL resolvers
 */
export function authenticateResolver(resolver, strict = true) {
  return async (parent, args, context, info) => {
    const access_token = context?.headers["access_token"];
    const device_id = context?.headers["device_id"];

    if (strict || access_token || device_id) {
      if (!access_token || !device_id) {
        return GQLResponse.error("MissingHeadersError");
      }

      const decoded = checkAccessToken({ access_token, device_id });
      if (!decoded) {
        return GQLResponse.error("ATInvalidError");
      }

      return resolver(
        parent,
        { ...args, req_user_id: decoded.user_id },
        context,
        info
      );
    }

    return resolver(parent, args, context, info);
  };
}
