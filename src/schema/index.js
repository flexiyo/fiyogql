import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { fiyouserDefs, fiyouserResolvers } from "./fiyouser/index.js";
import { fiyofeedDefs, fiyofeedResolvers } from "./fiyofeed/index.js";

export const serviceDefs = mergeTypeDefs([fiyouserDefs, fiyofeedDefs]);
export const serviceResolvers = mergeResolvers([
  fiyouserResolvers,
  fiyofeedResolvers,
]);
