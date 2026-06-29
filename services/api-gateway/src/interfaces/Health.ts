export interface ReadinessStatus {
  checks: {
    accountService: boolean;
    userService: boolean;
  };
  ready: boolean;
}
