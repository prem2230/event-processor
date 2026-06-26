import envConfig from "../config/env";
import type { LoginRequest, RegisterUserRequest } from "../interfaces";
import ServiceClient from "./ServiceClient";

export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
}

class UserServiceClient {
  public static register(data: RegisterUserRequest) {
    return ServiceClient.request<UserProfile | { message: string }>(
      envConfig.userServiceUrl,
      "/internal/users",
      { method: "POST", body: JSON.stringify(data) },
    );
  }

  public static verifyCredentials(data: LoginRequest) {
    return ServiceClient.request<UserProfile | { message: string }>(
      envConfig.userServiceUrl,
      "/internal/auth/verify",
      { method: "POST", body: JSON.stringify(data) },
    );
  }

  public static getProfile(userId: string) {
    return ServiceClient.request<UserProfile | { message: string }>(
      envConfig.userServiceUrl,
      "/internal/users/me",
      { method: "GET" },
      userId,
    );
  }
}

export default UserServiceClient;
