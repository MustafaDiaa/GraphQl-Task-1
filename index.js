import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { schema as typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Successfully connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }

  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 3000 },
    context: async ({ req }) => {
      const token = req.headers.authorization || "";

      try {
        const decodedUser = await promisify(jwt.verify)(
          token,
          process.env.JWT_SECRET
        );
        return { user: decodedUser };
      } catch {
        return { user: null };
      }
    },
  });

  console.log(`Server is running at: ${url}`);
})();
