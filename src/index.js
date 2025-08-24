import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { gql } from "apollo-server";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { expressMiddleware } from "@apollo/server/express4";
import dotenv from "dotenv";

import { connectDB } from "./db/index.js";
import { serviceDefs, serviceResolvers } from "./schema/index.js";
import { fiyouserHealthCheck } from "./schema/fiyouser/index.js";

const PORT = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();

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
    await connectDB();

    app.use(
      "/graphql",
      expressMiddleware(server, {
        context: async ({ req }) => ({
          headers: req.headers,
        }),
      })
    );

    app.get("/", (_, res) =>
      res.json({ success: true, message: "fiyogql is online!" })
    );
    
    app.get("/health", (_, res) => {
      await fiyouserHealthCheck();
      res.json({ success: true, message: "OK" });
    });

    app.listen(PORT, () => {
      console.log(`🚀 GraphQL Server running on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
})();
