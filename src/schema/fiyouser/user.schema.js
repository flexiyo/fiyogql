import { gql } from "apollo-server";
import { parseResolveInfo } from "graphql-parse-resolve-info";
import { authenticateResolver } from "../../middlewares/auth.middleware.js";
import { GQLResponse } from "../../utils/GQLResponse.js";
import { validatePayload } from "../../utils/validatePayload.js";
import commonDefs from "./commonDefs.js";

const typeDefs = gql`
  type Query {
    getUsers(user_ids: [String], offset: Int = 0): UsersResponse!
    searchUsers(query: String!, offset: Int = 0): UsersResponse!
    getUser(username: String!): UserResponse!
  }

  type Mutation {
    updateUser(updated_fields: UpdateUserInput!): UpdateUserResponse!
    deleteUser: StatusResponse!
  }

  input UpdateUserInput {
    full_name: String
    username: String
    account_type: AccountType
    dob: String
    gender: Gender
    profession: String
    bio: BioInput
    avatar: String
    banner: String
  }

  input BioInput {
    text: String
    links: [String]
    track: TrackInput
  }

  input TrackInput {
    id: String
    title: String
    artists: [String]
    link: String
  }

  type UpdateUserResponse {
    status: Status!
    updated_fields: UpdateUserOutput!
  }

  type UpdateUserOutput {
    full_name: String
    username: String
    account_type: AccountType
    dob: String
    gender: Gender
    profession: String
    bio: Bio
    avatar: String
    banner: String
  }
`;

const resolvers = (fiyouserClient) => {
  const { user } = fiyouserClient;

  const handleRequest = (method, strict = true) => {
    return authenticateResolver(async (_, args, __, info) => {
      const validationError = validatePayload(args);
      if (validationError) return GQLResponse.error(validationError);

      const resolveInfo = parseResolveInfo(info);

      let req_fields = resolveInfo?.fieldsByTypeName?.UserResponse?.user
        ?.fieldsByTypeName?.User
        ? Object.keys(
            resolveInfo.fieldsByTypeName.UserResponse.user.fieldsByTypeName.User
          )
        : [];

      return new Promise((resolve, reject) => {
        const requestPayload = req_fields ? { ...args, req_fields } : args;

        method(requestPayload, (error, response) => {
          if (error) return reject(GQLResponse.error(error.message));
          resolve(GQLResponse.success(response));
        });
      });
    }, strict);
  };

  return {
    Query: {
      getUsers: handleRequest(user.GetUsers),
      searchUsers: handleRequest(user.SearchUsers),
      getUser: handleRequest(user.GetUser, false),
    },

    Mutation: {
      updateUser: handleRequest(user.UpdateUser),
      deleteUser: handleRequest(user.DeleteUser),
    },
  };
};

export const userDefs = [commonDefs, typeDefs];
export const userResolvers = resolvers;
