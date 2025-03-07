import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { sql } from "../db/index.js";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

/**
 * 🆕 Create a New Refresh Token
 */
export async function createRefreshToken({ user_id, device_id, device_name }) {
  const refresh_token = randomBytes(128).toString("hex");

  await sql`
        INSERT INTO tokens (device_id, user_id, refresh_token, device_name, last_used, created_at)
        VALUES (${device_id}, ${user_id}, ${refresh_token}, ${device_name}, NOW(), NOW())
        ON CONFLICT (device_id) DO UPDATE
        SET refresh_token = EXCLUDED.refresh_token, last_used = NOW()
    `;

  return refresh_token;
}

/**
 * 🔑 Create an Access Token
 */
export async function createAccessToken({ refresh_token, device_id }) {
  const result = await sql`
        SELECT user_id, refresh_token FROM tokens
        WHERE device_id = ${device_id}
    `;

  if (!result.length || refresh_token !== result[0].refresh_token) return null;

  const access_token = jwt.sign(
    { user_id: result[0].user_id, device_id },
    SECRET_KEY,
    {
      algorithm: "HS256",
      expiresIn: "30m",
    }
  );

  return access_token;
}

/**
 * ✅ Verify Access Token (HS256)
 */
export function checkAccessToken({ access_token, device_id }) {
  try {
    const decoded = jwt.verify(access_token, SECRET_KEY, {
      algorithms: ["HS256"],
    });

    if (decoded.device_id !== device_id) {
      return null;
    }

    return decoded;
  } catch (error) {
    if (["TokenExpiredError", "JsonWebTokenError"].includes(error.name)) {
      return null;
    }
    console.error("Error in checkAccessToken:", error);
    return null;
  }
}

/**
 * ✅ Refresh Access Token
 */
export async function refreshAccessToken({ refresh_token, device_id }) {
  const access_token = await createAccessToken({ refresh_token, device_id });

  if (!access_token) return null;

  return access_token;
}
