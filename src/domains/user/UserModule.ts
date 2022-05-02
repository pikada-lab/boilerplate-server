import { UserRepository } from ".";
import { DataAccessService } from "../../utilites";
import { ConfigService } from "../../utilites/ConfigService";
import { ServerController } from "../../utilites/ServerController";
import { MailPort } from "../ports/MailPort";
import { contactFactory } from "./ContactFactory";
import { ContactsRepository } from "./ContactsRepository";
import {
  UserAuthorizationService,
  UserAuthenticationService,
  UserSettingService,
} from "./services";
import { TwoFactorFactory } from "./TwoFactorFactory";
import { TwoFactorRepository } from "./TwoFactorRepository";
import { FakeMMUserAuthenticationService } from "./UserAuthenticationService";
import { FakeMMUserAuthorizationService } from "./UserAuthorizationService";
import { userFactory } from "./UserFactory";
import { FakeMMUserRepository } from "./UserRepository";
import { UserRestController } from "./UserRestController";
import { FakeMMUserSettingService } from "./UserSettingService";
import { UserVerifyRepository } from "./UserVerefyReposiotry";
import {
  UserVerefyForMailStrategy,
  UserVerefyStrategy,
} from "./UserVerefyStrategy";
import { UserVerifyRecordFactory } from "./UserVerifyRecordFactory";

export class UserModule {
  private repository!: UserRepository;
  private userAuthorizationService!: UserAuthorizationService;
  private userAuthenticationService!: UserAuthenticationService;
  private userSettingService!: UserSettingService;
  private userController!: UserRestController;
  private contactsRepository!: ContactsRepository;
  private verifyRepository: UserVerifyRepository;
  private verifyStrategy: UserVerefyStrategy;
  private twoFactorRepository: TwoFactorRepository;
  constructor(
    config: ConfigService,
    server: ServerController,
    dataAccessService: DataAccessService,
    mailPort: MailPort
  ) {
    this.verifyRepository = new UserVerifyRepository(dataAccessService);
    this.repository = new FakeMMUserRepository(dataAccessService);
    this.contactsRepository = new ContactsRepository(dataAccessService);
    this.twoFactorRepository = new TwoFactorRepository(dataAccessService);

    this.verifyStrategy = new UserVerefyForMailStrategy(
      mailPort,
      this.repository,
      this.verifyRepository
    );
    this.userAuthorizationService = new FakeMMUserAuthorizationService(
      this.repository,
      this.verifyStrategy,
      this.contactsRepository
    );
    this.userAuthenticationService = new FakeMMUserAuthenticationService(
      this.repository,
      this.twoFactorRepository,
      config
    );
    this.userSettingService = new FakeMMUserSettingService(
      this.repository,
      this.contactsRepository
    );
    this.userController = new UserRestController(
      server,
      this.repository,
      this.userSettingService,
      this.userAuthorizationService,
      this.userAuthenticationService
    );

    dataAccessService.setFactory("Contacts", contactFactory);
    dataAccessService.setFactory("Users", userFactory(this.contactsRepository));
    dataAccessService.setFactory("VerifyRecord", UserVerifyRecordFactory);
    dataAccessService.setFactory("TwoFactorSecrets", TwoFactorFactory);
  }

  async init() {
    await this.repository.init();
    await this.verifyRepository.init();
    await this.userAuthorizationService.init();
    await this.userAuthenticationService.init();
    await this.userSettingService.init();
    await this.userController.init();
  }
}
