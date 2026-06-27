import jwt, { type JwtPayload } from "jsonwebtoken";
import envConfig from "../config/env";
import type { AuthenticatedUser, UserProfile } from "../interfaces";
import Logger from "../utils/logger";

class TokenService {
  private static readonly logger = Logger;
  private static readonly envConfig = envConfig;

  public static issueToken(user: UserProfile): string {
    const token = this.issue({
      userId: user.userId,
      email: user.email,
    });
    this.logger.info("Access token issued");
    return token;
  }
  public static issue(user: AuthenticatedUser): string {
    return jwt.sign(
      { email: user.email },
      this.envConfig.jwtSecret,
      {
        algorithm: "HS256",
        subject: user.userId,
        issuer: this.envConfig.jwtIssuer,
        audience: this.envConfig.jwtAudience,
        expiresIn: this.envConfig.jwtExpiresInSeconds,
      },
    );
  }

  public static verify(token: string): AuthenticatedUser {
    const payload = jwt.verify(token, this.envConfig.jwtSecret, {
      algorithms: ["HS256"],
      issuer: this.envConfig.jwtIssuer,
      audience: this.envConfig.jwtAudience,
    }) as JwtPayload;

    if (!payload.sub || typeof payload.email !== "string") {
      throw new Error("INVALID_TOKEN_CLAIMS");
    }

    return { userId: payload.sub, email: payload.email };
  }
}

export default TokenService;
