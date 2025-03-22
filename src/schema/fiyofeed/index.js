import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { createGrpcClient } from "../../utils/grpcClient.js";
import { contentDefs, contentResolvers } from "./content.schema.js";
import { feedDefs, feedResolvers } from "./feed.schema.js";

const fiyofeedClient = await createGrpcClient(
  "fiyofeed",
  "localhost:8002",
  ["common.proto", "feed.proto", "content.proto"]
);

const modules = [
  { defs: contentDefs, resolvers: contentResolvers },
  { defs: feedDefs, resolvers: feedResolvers },
];

export const fiyofeedDefs = mergeTypeDefs(modules.map((mod) => mod.defs));
export const fiyofeedResolvers = mergeResolvers(
  modules.map((mod) => mod.resolvers(fiyofeedClient))
);
