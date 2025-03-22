import fs from "fs";
import path from "path";
import axios from "axios";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import dotenv from "dotenv";

dotenv.config();

const PROTO_DIR = path.resolve(process.cwd(), "src/proto");

const BASE_PROTO_URL = "https://fiyoproto.vercel.app";
const GRPC_SECRET = process.env.GRPC_SECRET;

/**
 * Downloads `.proto` files for a service
 * @param {string} serviceName - The service folder
 * @param {string[]} protoFiles - List of proto filenames
 */
const downloadProtoFiles = async (serviceName, protoFiles) => {
  if (!fs.existsSync(PROTO_DIR)) fs.mkdirSync(PROTO_DIR, { recursive: true });

  const serviceDir = path.join(PROTO_DIR, serviceName);
  if (!fs.existsSync(serviceDir)) fs.mkdirSync(serviceDir, { recursive: true });

  for (const file of protoFiles) {
    const filePath = path.join(serviceDir, file);
    const url = `${BASE_PROTO_URL}/${serviceName}/${file}`;

    try {
      const { data } = await axios.get(url, { responseType: "text" });
      fs.writeFileSync(filePath, data);
    } catch (error) {
      console.error(`❌ Failed to download ${file}:`, error.message);
    }
  }
};

/**
 * Loads and initializes gRPC clients with TLS
 * @param {string} serviceName - The service folder
 * @param {string} serviceUrl - The gRPC service URL
 * @param {string[]} protoFiles - List of proto filenames
 * @returns {object} - gRPC clients
 */
export const createGrpcClient = async (serviceName, serviceUrl, protoFiles) => {
  await downloadProtoFiles(serviceName, protoFiles);

  const clients = {};

  const credentials = grpc.credentials.createSsl();
  // const credentials = grpc.credentials.createInsecure();

  for (const file of protoFiles) {
    if (file === "common.proto") continue;

    const protoPath = path.join(PROTO_DIR, serviceName, file);
    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const loadedProto = grpc.loadPackageDefinition(packageDefinition);
    const serviceKey = file.replace(".proto", "");

    if (loadedProto[serviceKey]) {
      const client = new loadedProto[serviceKey][
        `${serviceKey.charAt(0).toUpperCase()}${serviceKey.slice(1)}Service`
      ](serviceUrl, credentials);

      clients[serviceKey] = new Proxy(client, {
        get(target, propKey) {
          const originalMethod = target[propKey];
          if (typeof originalMethod === "function") {
            return (...args) => {
              const metadata = new grpc.Metadata();
              metadata.add("authorization", GRPC_SECRET);
              args.splice(1, 0, metadata);
              return originalMethod.apply(target, args);
            };
          }
          return originalMethod;
        },
      });
    }
  }

  return clients;
};
