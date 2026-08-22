export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  address?: string;
  phone?: string;
}
