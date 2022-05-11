import { MagazineModule } from "./domains/magazine/MagazineModule";
import { FakeMailPort } from "./domains/ports/FakeMailPort"; 
import { MailFactory } from "./domains/ports/MailFactory";
import { UserModule } from "./domains/user/UserModule";
import { ConfigService } from "./utilites/ConfigService";
import { FileDataAccessService } from "./utilites/FileDataAccessService";
import { MemoryDataAccessService } from "./utilites/MemoryDataAccessService";
import { ServerController } from "./utilites/ServerController";

export class API {
  constructor() {}
  async init() {
    const config = new ConfigService();
    await config.init();

    const mailPort = MailFactory(config);
    await mailPort.init();
    
    const server = new ServerController(config); 
    await server.init();

    const daService = new FileDataAccessService("../db/");

    const userModule = new UserModule(config, server, daService, mailPort);
    const magazineModule = new MagazineModule(daService, server, userModule.getFacade())

    await userModule.init();
    await magazineModule.init(); 

    server.listen();
  }
}
