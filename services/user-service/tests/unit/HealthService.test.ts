import MongoConnection from "../../src/config/mongo";
import HealthService from "../../src/services/HealthService";

jest.mock("../../src/config/mongo", () => ({
  __esModule: true,
  default: { isReady: jest.fn() },
}));

describe("HealthService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("reports ready when Mongo is connected", () => {
    jest.mocked(MongoConnection.isReady).mockReturnValue(true);

    expect(HealthService.getReadiness()).toEqual({
      ready: true,
      checks: { mongo: true },
    });
  });

  it("reports not ready when Mongo is disconnected", () => {
    jest.mocked(MongoConnection.isReady).mockReturnValue(false);

    expect(HealthService.getReadiness()).toEqual({
      ready: false,
      checks: { mongo: false },
    });
  });
});
