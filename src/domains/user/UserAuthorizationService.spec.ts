import { ConfigService } from "../../utilites/ConfigService";
import { MemoryDataAccessService } from "../../utilites/MemoryDataAccessService";
import { FakeMailPort } from "../ports/FakeMailPort";
import { contactFactory } from "./ContactFactory";
import { ContactsRepository } from "./ContactsRepository";
import { TwoFactorFactory } from "./TwoFactorFactory";
import { TwoFactorRepository } from "./TwoFactorRepository";
import { FakeMMUserAuthorizationService } from "./UserAuthorizationService";
import { userFactory } from "./UserFactory";
import { FakeMMUserRepository } from "./UserRepository";
import { UserVerifyRepository } from "./UserVerefyReposiotry";
import { UserVerefyForMailStrategy } from "./UserVerefyStrategy";
import { UserVerifyRecordFactory } from "./UserVerifyRecordFactory";

var expect = require("chai").expect;

const config = new ConfigService();
const das = new MemoryDataAccessService();
const repo = new ContactsRepository(das);
const verify = new UserVerifyRepository(das);
das.setFactory("Users", userFactory(repo));
das.setFactory("Contacts", contactFactory);
das.setFactory("VerifyRecord", UserVerifyRecordFactory);
das.setFactory("TwoFactorSecrets", TwoFactorFactory);
const tfaRepo = new TwoFactorRepository(das);

const repository = new FakeMMUserRepository(das);

const mailPort = new FakeMailPort(config, true);
const verifyStrategy = new UserVerefyForMailStrategy(
  mailPort,
  repository,
  verify
);
const authorizationService = new FakeMMUserAuthorizationService(
  repository,
  verifyStrategy,
  {} as any,
);
describe("UserAuthorizationService", () => {
  describe("tryToRemindUsersAccess", () => {
    it("success login", async () => {
      await config.init();
      await repo.init();
      await repository.init();
      await mailPort.init();
      const user = await repository.create({
        login: "info@pikada-lab.ru",
        sol: "",
        hash: "",
      });
      await authorizationService.tryToRemindUsersAccess("info@pikada-lab.ru");
    });
  });
});
