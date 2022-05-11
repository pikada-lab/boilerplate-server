import { FakeMailPort } from "./FakeMailPort";
import { NodeMailPort } from "./NodeMailPort";
import { ConfigService } from "../../utilites/ConfigService";
import { MailPort } from "./MailPort";

export const MailFactory = (config: ConfigService): MailPort => {
  if (process.env.MODE === "DEBUG") {
    return new FakeMailPort(config, false);
  }
  if (process.env.MODE === "PROD") {
    return new NodeMailPort(config);
  }
  return new FakeMailPort(config, true);
};
