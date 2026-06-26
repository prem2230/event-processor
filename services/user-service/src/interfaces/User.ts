export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface VerifyCredentialsRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: "ACTIVE" | "LOCKED";
  createdAt: Date;
}
