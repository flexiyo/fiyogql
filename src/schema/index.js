import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { fiyouserDefs, fiyouserResolvers } from "./fiyouser/index.js";

export const serviceDefs = mergeTypeDefs([fiyouserDefs]);
export const serviceResolvers = mergeResolvers([fiyouserResolvers]);
