import { gql } from "apollo-server";
import { parseResolveInfo } from "graphql-parse-resolve-info";
import { authenticateResolver } from "../../middlewares/auth.middleware.js";
import { GQLResponse } from "../../utils/GQLResponse.js";
import { validatePayload } from "../../utils/validatePayload.js";
import commonDefs from "./commonDefs.js";

const typeDefs = gql`
  type Query {
    getUserFollowers(user_id: String!, offset: Int = 0): UsersResponse!
    getUserFollowing(user_id: String!, offset: Int = 0): UsersResponse!
    getPendingFollowRequests(offset: Int = 0): UsersResponse!
    getUserMates(offset: Int = 0): UsersResponse!
    getPendingMateRequests(offset: Int = 0): UsersResponse!
  }

  type Mutation {
    sendFollowRequest(user_id: String!): StatusResponse!
    unsendFollowRequest(user_id: String!): StatusResponse!
    acceptFollowRequest(user_id: String!): StatusResponse!
    rejectFollowRequest(user_id: String!): StatusResponse!

    sendMateRequest(user_id: String!): StatusResponse!
    unsendMateRequest(user_id: String!): StatusResponse!
    acceptMateRequest(user_id: String!): StatusResponse!
    rejectMateRequest(user_id: String!): StatusResponse!
  }
`;

const resolvers = (fiyouserClient) => {
  const { connection } = fiyouserClient;

  const handleRequest = (method) => {
    return authenticateResolver(async (_, args, __, info) => {
      const validationError = validatePayload(args);
      if (validationError) return GQLResponse.error(validationError);

      const resolveInfo = parseResolveInfo(info);

      let req_fields = resolveInfo.fieldsByTypeName?.User
        ? Object.keys(resolveInfo.fieldsByTypeName.User)
        : [];

      return new Promise((resolve, reject) => {
        const requestPayload = req_fields ? { ...args, req_fields } : args;

        method(requestPayload, (error, response) => {
          if (error) return reject(GQLResponse.error(error.message));
          resolve(GQLResponse.success(response));
        });
      });
    });
  };

  return {
    Query: {
      getUserFollowers: handleRequest(connection.GetUserFollowers),
      getUserFollowing: handleRequest(connection.GetUserFollowing),
      getPendingFollowRequests: handleRequest(
        connection.GetPendingFollowRequests
      ),
      getUserMates: handleRequest(connection.GetUserMates),
      getPendingMateRequests: handleRequest(connection.GetPendingMateRequests),
    },

    Mutation: {
      sendFollowRequest: handleRequest(connection.SendFollowRequest),
      unsendFollowRequest: handleRequest(connection.UnsendFollowRequest),
      acceptFollowRequest: handleRequest(connection.AcceptFollowRequest),
      rejectFollowRequest: handleRequest(connection.RejectFollowRequest),

      sendMateRequest: handleRequest(connection.SendMateRequest),
      unsendMateRequest: handleRequest(connection.UnsendMateRequest),
      acceptMateRequest: handleRequest(connection.AcceptMateRequest),
      rejectMateRequest: handleRequest(connection.RejectMateRequest),
    },
  };
};

export const connectionDefs = [commonDefs, typeDefs];
export const connectionResolvers = resolvers;
