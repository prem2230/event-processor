export interface UserDocument {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  passwordHash: string;
  passwordSalt: string;
  status: "ACTIVE" | "LOCKED";
  createdAt: Date;
  updatedAt: Date;
}
