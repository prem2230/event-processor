export interface UserDocument {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  passwordSalt: string;
  status: "ACTIVE" | "LOCKED";
  createdAt: Date;
  updatedAt: Date;
}
