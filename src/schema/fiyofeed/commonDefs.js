import { gql } from "apollo-server";

const commonDefs = gql`
  type StatusResponse {
    status: Status!
  }

  type ContentResponse {
    status: Status!
    content: Content
  }

  type ContentsResponse {
    status: Status!
    contents: [Content!]
  }

  enum TableName {
    posts
    clips
  }

  type Status {
    success: Boolean!
    message: String!
  }

  type Content {
    id: String!
    creators: [User!]!
    media_key: String!
    created_at: String!
    caption: String!
    hashtags: [String!]!
    track: Track
    likes_count: Int!
    comments_count: Int!
    shares_count: Int!
  }

  type User {
    id: String!
    full_name: String!
    username: String!
    avatar: String!
  }

  type Track {
    id: String!
    title: String!
    artists: [String!]!
    link: String!
  }
`;

export default commonDefs;
