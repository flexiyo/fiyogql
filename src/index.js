import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { gql } from "apollo-server";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { expressMiddleware } from "@apollo/server/express4";

import { serviceDefs, serviceResolvers } from "./schema/services/index.js";
import { connectDB } from "./db/index.js";

const app = express();
app.use(cors());
app.use(express.json());

const rootDefs = gql`
  type Query {
    health: String
  }
`;

const rootResolvers = {
  Query: {
    health: () => "OK",
  },
};

const typeDefs = mergeTypeDefs([rootDefs, serviceDefs]);
const resolvers = mergeResolvers([rootResolvers, serviceResolvers]);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

(async function startServer() {
  try {
    await server.start();

    app.use(
      "/graphql",
      expressMiddleware(server, {
        context: async ({ req }) => ({
          headers: req.headers,
        }),
      })
    );

    const PORT = process.env.PORT || 8000;
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 GraphQL Server running on PORT: ${PORT}`);
    });
    
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
})();
