import { gql } from "apollo-server";
import { authenticateResolver } from "../../../middlewares/auth.middleware.js";
import { GraphQLResponse } from "../../../utils/GraphQLResponse.js";
import { validatePayload } from "../../../utils/validatePayload.js";

export const userDefs = gql`
  type Query {
    getUsers(user_ids: [String], offset: Int): UsersResponse!
    getUser(username: String!): UserResponse!
    getUserProfile(username: String!): UserResponse!
  }

  type Mutation {
    updateUser(updated_fields: UpdatedFields!): Status!
    deleteUser: Status!
  }

  type UserResponse {
    status: Status!
    user: UserProfile
  }

  type UsersResponse {
    status: Status!
    users: [User!]
  }

  type Status {
    success: Boolean!
    message: String!
  }

  type User {
    id: String!
    username: String!
    avatar: String!
  }

  type UserProfile {
    id: String!
    full_name: String!
    username: String!
    bio: Bio!
    account_type: AccountType!
    dob: String!
    gender: Gender
    profession: String
    avatar: String!
    banner: String!
    followers_count: Int!
    following_count: Int!
    posts_count: Int!
    relation: Relation
  }

  type Bio {
    text: String
    links: [String]
    track: Track
  }

  type Track {
    id: String
    title: String
    artist: String
  }

  type Relation {
    follow: Follow
    mate: Mate
  }

  type Follow {
    follow_status: RelationStatus!
    is_followed: Boolean!
  }

  type Mate {
    mate_status: RelationStatus!
  }

  enum RelationStatus {
    pending
    accepted
  }

  input UpdatedFields {
    full_name: String
    username: String
    bio: String
    account_type: AccountType
    dob: String
    gender: Gender
    profession: String
    avatar: String
    banner: String
  }

  enum AccountType {
    personal
    creator
    business
  }

  enum Gender {
    male
    female
  }
`;

export const userResolvers = (fiyouserClient) => ({
  Query: {
    getUsers: async (_, { user_ids = [], offset = 0 }) => {
      return new Promise((resolve, reject) => {
        fiyouserClient.user.GetUsers(
          { user_ids, offset },
          (error, response) => {
            if (error) {
              reject(GraphQLResponse.error(error.message));
            } else {
              resolve(GraphQLResponse.success(response));
            }
          }
        );
      });
    },

    getUser: async (_, { username }) => {
      validatePayload({ username }, ["username"]);

      return new Promise((resolve, reject) => {
        fiyouserClient.user.GetUser({ username }, (error, response) => {
          if (error) {
            reject(GraphQLResponse.error(error.message));
          } else {
            resolve(GraphQLResponse.success(response));
          }
        });
      });
    },

    getUserProfile: authenticateResolver(
      async (_, { username, req_user_id }) => {
        validatePayload({ username }, ["username"]);

        return new Promise((resolve, reject) => {
          fiyouserClient.user.GetUser(
            { username, req_user_id },
            (error, response) => {
              if (error) {
                reject(GraphQLResponse.error(error.message));
              } else {
                resolve(GraphQLResponse.success(response));
              }
            }
          );
        });
      }
    ),
  },

  Mutation: {
    updateUser: authenticateResolver(
      async (_, { updated_fields, req_user_id }) => {
        validatePayload({ updated_fields }, ["updated_fields"]);

        return new Promise((resolve, reject) => {
          fiyouserClient.user.UpdateUser(
            { user_id: req_user_id, updated_fields },
            (error, response) => {
              if (error) {
                reject(GraphQLResponse.error(error.message));
              } else {
                resolve(GraphQLResponse.success(response));
              }
            }
          );
        });
      }
    ),

    deleteUser: authenticateResolver(async (_, { req_user_id }) => {
      return new Promise((resolve, reject) => {
        fiyouserClient.user.DeleteUser(
          { user_id: req_user_id },
          (error, response) => {
            if (error) {
              reject(GraphQLResponse.error(error.message));
            } else {
              resolve(GraphQLResponse.success(response));
            }
          }
        );
      });
    }),
  },
});
