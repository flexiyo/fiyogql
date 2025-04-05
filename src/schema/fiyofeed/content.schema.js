import { gql } from "apollo-server";
import { authenticateResolver } from "../../middlewares/auth.middleware.js";
import { validatePayload } from "../../utils/validatePayload.js";
import { GQLResponse } from "../../utils/GQLResponse.js";
import commonDefs from "./commonDefs.js";

const typeDefs = gql`
  type Query {
    getContent(content_id: String!, table_name: TableName!): ContentResponse!
    getContents(
      content_ids: [String!]!
      table_name: TableName!
    ): ContentsResponse!
  }

  type Mutation {
    createContent(input: CreateContentRequest!): StatusResponse!
    updateContent(
      content_id: String!
      table_name: TableName!
      updated_fields: UpdatedFieldsInput!
    ): UpdateContentResponse!
    deleteContent(content_id: String!, table_name: TableName!): StatusResponse!
  }

  input CreateContentRequest {
    media_key: String!
    collabs: [String!]
    caption: String
    hashtags: [String!]
    track: String
    table_name: TableName!
  }

  type UpdateContentResponse {
    status: Status!
    updated_fields: UpdatedFieldsOutput!
  }

  input UpdatedFieldsInput {
    collabs: [String!]
    caption: String
    hashtags: [String!]
  }

  type UpdatedFieldsOutput {
    collabs: [String!]
    caption: String
    hashtags: [String!]
  }
`;

const resolvers = (fiyofeedClient) => {
  const { content } = fiyofeedClient;

  const handleRequest = (method) => {
    return authenticateResolver(async (_, args, __, ___) => {
      const validationError = validatePayload(args);
      if (validationError) return GQLResponse.error(validationError);

      return new Promise((resolve, reject) => {
        method(args, (error, response) => {
          if (error) return reject(GQLResponse.error(error.message));
          resolve(GQLResponse.success(response));
        });
      });
    });
  };

  return {
    Query: {
      getContent: handleRequest(content.GetContent),
      getContents: handleRequest(content.GetContents),
    },
    Mutation: {
      createContent: handleRequest(content.CreateContent),
      updateContent: handleRequest(content.UpdateContent),
      deleteContent: handleRequest(content.DeleteContent),
    },
  };
};

export const contentDefs = [commonDefs, typeDefs];
export const contentResolvers = resolvers;
