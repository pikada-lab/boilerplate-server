export interface TwoFactorFactoryDAO {
  id: number;
  userId: number;
  secret: number;
  STATUS: "CREATED" | "ENABLED" | "DISABLED";
  staticCodes: string[]
}
