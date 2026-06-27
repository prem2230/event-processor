export interface ReadinessStatus {
  checks: {
    accountService: boolean;
    kafkaProducer: boolean;
    userService: boolean;
  };
  ready: boolean;
}
