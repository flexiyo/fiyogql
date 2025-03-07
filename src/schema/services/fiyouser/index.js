import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { authDefs, authResolvers } from "./auth.schema.js";
import { userDefs, userResolvers } from "./user.schema.js";
import { createGrpcClient } from "../../../utils/grpcClient.js";

const fiyouserClient = await createGrpcClient(
  "fiyouser",
  process.env.FIYOUSER_SERVICE_URL || "localhost:8001",
  ["auth.proto", "user.proto"]
);

const wrappedAuthResolvers = authResolvers(fiyouserClient);
const wrappedUserResolvers = userResolvers(fiyouserClient);

export const fiyouserDefs = mergeTypeDefs([authDefs, userDefs]);
export const fiyouserResolvers = mergeResolvers([
  wrappedAuthResolvers,
  wrappedUserResolvers,
]);
