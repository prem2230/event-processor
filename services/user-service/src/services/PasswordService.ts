import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

class PasswordService {
  public static async hash(password: string): Promise<{
    passwordHash: string;
    passwordSalt: string;
  }> {
    const passwordSalt = randomBytes(16).toString("hex");
    const derived = (await scrypt(password, passwordSalt, 64)) as Buffer;
    return { passwordHash: derived.toString("hex"), passwordSalt };
  }

  public static async verify(
    password: string,
    passwordHash: string,
    passwordSalt: string,
  ): Promise<boolean> {
    const supplied = (await scrypt(password, passwordSalt, 64)) as Buffer;
    const stored = Buffer.from(passwordHash, "hex");
    return (
      stored.length === supplied.length && timingSafeEqual(stored, supplied)
    );
  }
}

export default PasswordService;
