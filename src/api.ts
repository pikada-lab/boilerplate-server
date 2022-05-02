import { FakeMailPort } from "./domains/ports/FakeMailPort";
import { contactFactory } from "./domains/user/ContactFactory";
import { userFactory } from "./domains/user/UserFactory";
import { UserModule } from "./domains/user/UserModule";
import { ConfigService } from "./utilites/ConfigService";
import { MemoryDataAccessService } from "./utilites/MemoryDataAccessService";
import { ServerController } from "./utilites/ServerController";

export class API {
  constructor() {}
  async init() {
    const config = new ConfigService();
    await config.init();

    const mailPort = new FakeMailPort(config, false);
    const server = new ServerController(config);
    await server.init();

    const daService = new MemoryDataAccessService();

    const userModule = new UserModule(config, server, daService, mailPort);
 

    await mailPort.init();
    await userModule.init();
  }
}
