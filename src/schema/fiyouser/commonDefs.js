import { gql } from "apollo-server";

const commonDefs = gql`
  type StatusResponse {
    status: Status!
  }

  type UserResponse {
    status: Status!
    user: User
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
    full_name: String!
    username: String!
    account_type: AccountType!
    dob: String!
    gender: Gender
    profession: String
    bio: Bio!
    avatar: String!
    banner: String!
    posts_count: Int!
    followers_count: Int!
    following_count: Int!
    relation: Relation
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

  type Bio {
    text: String
    links: [String]
    track: Track
  }

  type Track {
    id: String!
    title: String!
    artist: String!
  }

  type Relation {
    follow: Follow
    mate: Mate
  }

  type Follow {
    is_following: Boolean
    is_followed: Boolean
  }

  type Mate {
    are_mates: Boolean
  }
`;

export default commonDefs;
