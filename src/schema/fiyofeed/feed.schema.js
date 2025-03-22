import { gql } from "apollo-server";
import { validatePayload } from "../../utils/validatePayload.js";
import { authenticateResolver } from "../../middlewares/auth.middleware.js";
import { GQLResponse } from "../../utils/GQLResponse.js";
import commonDefs from "./commonDefs.js";

const typeDefs = gql`
  type Query {
    getUserFeed(table_name: TableName!): ContentsResponse!
  }
`;

const resolvers = (fiyofeedClient) => {
  const { feed } = fiyofeedClient;

  const handleRequest = (method) => {
    return authenticateResolver(async (_, args, __, ___) => {
      console.log(args);
      const validationError = validatePayload(args);
      if (validationError) return GQLResponse.error(validationError);

      return new Promise((resolve, reject) => {
        method(args, (error, response) => {
          if (error) return reject(GQLResponse.error(error.message));
          console.log(response);
          resolve(GQLResponse.success(response));
        });
      });
    });
  };

  return {
    Query: {
      getUserFeed: handleRequest(feed.GetUserFeed),
    },
  };
};

export const feedDefs = [commonDefs, typeDefs];
export const feedResolvers = resolvers;
