import { run } from "mocha";
import { ConfigService } from "../../utilites/ConfigService";
import { MemoryDataAccessService } from "../../utilites/MemoryDataAccessService";
import { contactFactory } from "./ContactFactory";
import { ContactsRepository } from "./ContactsRepository";
import { TwoFactorFactory } from "./TwoFactorFactory";
import { TwoFactorRepository } from "./TwoFactorRepository";
import { FakeMMUserAuthenticationService } from "./UserAuthenticationService";
import { userFactory } from "./UserFactory";
import { FakeMMUserRepository } from "./UserRepository";

var expect = require("chai").expect;
const config = new ConfigService();
const das = new MemoryDataAccessService();
const repo = new ContactsRepository(das);
das.setFactory("Users", userFactory(repo));
das.setFactory("Contacts", contactFactory);
das.setFactory("TwoFactorSecrets", TwoFactorFactory);
const tfaRepo = new TwoFactorRepository(das);
const repository = new FakeMMUserRepository(das);  


describe("UserAuthenticationService", () => {
  describe("login and refresh script", () => {
    it("success login", async () => {  
      await config.init();   
      await repository.init();
      const user = await repository.create({
        login: "anton",
        sol: "",
        hash: "",
      });
      user.setPasword("100011000110");
      await repository.save(user);
       
      const service = new FakeMMUserAuthenticationService(repository, tfaRepo, config);

      const [acc, ref] = await service.login("anton", "100011000110");
      expect(acc).to.be.a("string");
      expect(ref).to.be.a("string");  
      const [acc2, ref2] = await service.refresh(ref);
      expect(acc2).to.be.a("string");
      expect(ref2).to.be.a("string");  
    });
  });
});
