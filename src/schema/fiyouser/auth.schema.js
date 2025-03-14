import { gql } from "apollo-server";
import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";
import { parseResolveInfo } from "graphql-parse-resolve-info";
import {
  createRefreshToken,
  createAccessToken,
  refreshAccessToken,
} from "../../utils/tokenHandler.js";
import { GQLResponse } from "../../utils/GQLResponse.js";
import { validatePayload } from "../../utils/validatePayload.js";
import commonDefs from "./commonDefs.js";

const typeDefs = gql`
  type Query {
    refreshAccessToken: HeadersResponse!
  }

  type Mutation {
    registerUser(input: RegisterRequest!): AuthResponse!
    loginUser(input: LoginRequest!): AuthResponse!
  }

  input RegisterRequest {
    full_name: String!
    username: String!
    account_type: AccountType!
    dob: String!
    password: String!
    device_name: String!
  }

  input LoginRequest {
    username: String!
    password: String!
    device_name: String!
  }

  type HeadersResponse {
    status: Status!
    headers: Headers
  }

  type AuthResponse {
    status: Status!
    user: User
    headers: Headers
  }

  type Headers {
    access_token: String!
    refresh_token: String!
    device_id: String!
  }
`;

const resolvers = (fiyouserClient) => {
  const { auth } = fiyouserClient;

  const handleAuthRequest =
    (method) =>
    async (_, { input }, __, info) => {
      try {
        const request = promisify(method.bind(auth));

        const resolveInfo = parseResolveInfo(info);

        let req_fields = resolveInfo?.fieldsByTypeName?.AuthResponse?.user
          ?.fieldsByTypeName?.User
          ? Object.keys(
              resolveInfo.fieldsByTypeName.AuthResponse.user.fieldsByTypeName
                .User
            )
          : [];

        const response = await request({ ...input, req_fields });

        if (!response?.status?.success) {
          return GQLResponse.error(response?.status?.message);
        }

        const { user } = response;
        const device_id = uuidv4();
        const refresh_token = await createRefreshToken({
          user_id: user.id,
          device_id,
          device_name: input.device_name,
        });

        return GQLResponse.success({
          ...response,
          headers: {
            access_token: await createAccessToken({ refresh_token, device_id }),
            refresh_token,
            device_id,
          },
        });
      } catch (error) {
        return GQLResponse.error(error.message);
      }
    };

  return {
    Query: {
      refreshAccessToken: async (_, __, context) => {
        try {
          const { refresh_token, device_id } = context?.headers || {};
          const validationError = validatePayload(context?.headers, [
            "refresh_token",
            "device_id",
          ]);
          if (validationError) return GQLResponse.error(validationError);

          const access_token = await refreshAccessToken({
            refresh_token,
            device_id,
          });

          if (!access_token) {
            return GQLResponse.error("RTInvalidError");
          }

          return {
            ...GQLResponse.success("Access token refreshed successfully."),
            headers: { access_token, refresh_token, device_id },
          };
        } catch (error) {
          return GQLResponse.error(error.message);
        }
      },
    },

    Mutation: {
      registerUser: handleAuthRequest(auth.RegisterUser),
      loginUser: handleAuthRequest(auth.LoginUser),
    },
  };
};

export const authDefs = [commonDefs, typeDefs];
export const authResolvers = resolvers;

