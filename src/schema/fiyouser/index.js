import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { createGrpcClient } from "../../utils/grpcClient.js";
import { authDefs, authResolvers } from "./auth.schema.js";
import { userDefs, userResolvers } from "./user.schema.js";
import { connectionDefs, connectionResolvers } from "./connection.schema.js";

const fiyouserClient = await createGrpcClient(
  "fiyouser",
  process.env.FIYOUSER_SERVICE_URL || "localhost:8001",
  ["common.proto", "auth.proto", "user.proto", "connection.proto"]
);

const modules = [
  { defs: authDefs, resolvers: authResolvers },
  { defs: userDefs, resolvers: userResolvers },
  { defs: connectionDefs, resolvers: connectionResolvers },
];

export const fiyouserDefs = mergeTypeDefs(modules.map((mod) => mod.defs));
export const fiyouserResolvers = mergeResolvers(
  modules.map((mod) => mod.resolvers(fiyouserClient))
);

export const fiyouserHealthCheck = async () => {
  if (!fiyouserClient) throw new Error("gRPC client not ready");

  return new Promise((resolve, reject) => {
    fiyouserClient.auth.ping({}, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};
