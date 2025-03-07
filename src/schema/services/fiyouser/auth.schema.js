import { gql } from "apollo-server";
import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";
import {
  createRefreshToken,
  createAccessToken,
  refreshAccessToken,
} from "../../../utils/tokenHandler.js";
import { GraphQLResponse } from "../../../utils/GraphQLResponse.js";
import { validatePayload } from "../../../utils/validatePayload.js";

export const authDefs = gql`
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

  type Status {
    success: Boolean!
    message: String!
  }

  type Headers {
    access_token: String!
    refresh_token: String!
    device_id: String!
  }

  type User {
    id: String!
    username: String!
    avatar: String!
  }

  enum AccountType {
    personal
    creator
    business
  }
`;

export const authResolvers = (fiyouserClient) => ({
  Query: {
    refreshAccessToken: async (_, __, context) => {
      try {
        const refresh_token = context?.headers["refresh_token"];
        const device_id = context?.headers["device_id"];

        validatePayload({ refresh_token, device_id }, [
          "refresh_token",
          "device_id",
        ]);

        const access_token = refreshAccessToken({ refresh_token, device_id });

        if (!access_token) {
          return GraphQLResponse.error("Invalid refresh token.");
        }

        return {
          ...GraphQLResponse.success("Access token refreshed successfully."),
          headers: { access_token, refresh_token, device_id },
        };
      } catch (error) {
        return GraphQLResponse.error(error.message);
      }
    },
  },
  Mutation: {
    registerUser: async (_, { input }) => {
      try {
        const registerUser = promisify(
          fiyouserClient.auth.RegisterUser.bind(fiyouserClient.auth)
        );
        const response = await registerUser(input);

        const parsedResponse = GraphQLResponse.success(response);
        if (!parsedResponse.status.success) return parsedResponse;

        const device_id = uuidv4();
        const refresh_token = await createRefreshToken({
          user_id: parsedResponse.user.id,
          device_id,
          device_name: input.device_name,
        });

        parsedResponse.headers = {
          access_token: await createAccessToken({ refresh_token, device_id }),
          refresh_token,
          device_id,
        };

        return parsedResponse;
      } catch (error) {
        return GraphQLResponse.error(error.message);
      }
    },

    loginUser: async (_, { input }) => {
      try {
        const loginUser = promisify(
          fiyouserClient.auth.LoginUser.bind(fiyouserClient.auth)
        );
        const response = await loginUser(input);

        const parsedResponse = GraphQLResponse.success(response);
        if (!parsedResponse.status.success) return parsedResponse;

        const device_id = uuidv4();
        const refresh_token = await createRefreshToken({
          user_id: parsedResponse.user.id,
          device_id,
          device_name: input.device_name,
        });

        parsedResponse.headers = {
          access_token: await createAccessToken({ refresh_token, device_id }),
          refresh_token,
          device_id,
        };

        return parsedResponse;
      } catch (error) {
        return GraphQLResponse.error(error.message);
      }
    },
  },
});
