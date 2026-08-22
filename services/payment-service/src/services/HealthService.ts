import MongoConnection from "../config/mongo";
export default class HealthService { static getReadiness() { const checks = { mongo: MongoConnection.isReady() }; return { ready: checks.mongo, checks }; } }
