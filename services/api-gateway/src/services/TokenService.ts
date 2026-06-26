import jwt, { type JwtPayload } from "jsonwebtoken";
import envConfig from "../config/env";
import type { AuthenticatedUser } from "../interfaces";

class TokenService {
  public static issue(user: AuthenticatedUser): string {
    return jwt.sign(
      { email: user.email },
      envConfig.jwtSecret,
      {
        algorithm: "HS256",
        subject: user.userId,
        issuer: envConfig.jwtIssuer,
        audience: envConfig.jwtAudience,
        expiresIn: envConfig.jwtExpiresInSeconds,
      },
    );
  }

  public static verify(token: string): AuthenticatedUser {
    const payload = jwt.verify(token, envConfig.jwtSecret, {
      algorithms: ["HS256"],
      issuer: envConfig.jwtIssuer,
      audience: envConfig.jwtAudience,
    }) as JwtPayload;

    if (!payload.sub || typeof payload.email !== "string") {
      throw new Error("INVALID_TOKEN_CLAIMS");
    }

    return { userId: payload.sub, email: payload.email };
  }
}

export default TokenService;
