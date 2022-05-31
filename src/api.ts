import { MagazineModule } from "./domains/magazine/MagazineModule";
import { PhotoModule } from "./domains/photo/PhotoModule"; 
import { MailFactory } from "./domains/ports/MailFactory";
import { UserModule } from "./domains/user/UserModule";
import { ConfigService } from "./utilites/ConfigService";
import { FileDataAccessService } from "./utilites/FileDataAccessService"; 
import { ServerController } from "./utilites/ServerController";
import { YCService } from "./utilites/YCService";

export class API {
  constructor() {}
  async init() {
    const config = new ConfigService();
    await config.init();

    const yc = new YCService();

    const mailPort = MailFactory(config);
    await mailPort.init();
    
    const server = new ServerController(config); 
    await server.init();
 

    const daService = new FileDataAccessService("../db/");

    const userModule = new UserModule(config, server, daService, mailPort);
    const magazineModule = new MagazineModule(daService, server, userModule.getFacade())
    const photoModule = new PhotoModule(daService, server, yc, userModule.getFacade());
    await userModule.init();
    await magazineModule.init(); 
    await photoModule.init();

    server.listen();
  }
}
