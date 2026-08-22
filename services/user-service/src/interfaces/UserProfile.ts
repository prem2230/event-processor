export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  status: "ACTIVE" | "LOCKED";
  createdAt: Date;
}
