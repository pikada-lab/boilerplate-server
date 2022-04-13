import { User } from ".";
import { MemoryDataAccessService } from "../../utilites/MemoryDataAccessService";
import { AnyUserSpecification } from "./AnyUserSpecification";
import { userFactory } from "./UserFactory";
import { FakeMMUserRepository } from "./UserRepository";

var expect = require("chai").expect;

describe("UserRepository", () => {
  const das = new MemoryDataAccessService();
  das.setFactory("User", userFactory);
  const repository = new FakeMMUserRepository(das);
  repository.init();
  describe("create user", () => {
    it("user.getid() === 1 && getLogin() === 'any'", (done) => {
      repository
        .create({ login: "info@fake-mm.ru", hash: "", sol: "" })
        .then((user) => {
          expect(user.getId()).to.be.equal(1);
          expect(user.getLogin()).to.be.equal("info@fake-mm.ru");
          return repository.create({
            login: "info@rest.ru",
            hash: "",
            sol: "",
          });
        })
        .then((u) => {
          return repository.create({
            login: "info@pikada-lab.ru",
            hash: "",
            sol: "",
          });
        })
        .then((u) => {
          done();
        })
        .catch((ex) => {
          done(ex);
        });
    });
  });
  describe("select user", () => {
    it("repository.findOne(1)", (done) => {
      repository
        .findOne(1)
        .then((user) => {
          expect(user.getId()).to.be.equal(1);
          expect(user.getLogin()).to.be.equal("info@fake-mm.ru");
          done();
        })
        .catch((ex) => {
          done(ex);
        });
    });
    it("repository.getOne(1)", () => {
      const user = repository.getOne(1)!;
      expect(user).to.be.a("object");
      expect(user.getId()).to.be.equal(1);
      expect(user.getLogin()).to.be.equal("info@fake-mm.ru");
    });
    it("repository.getByRole(1)", () => {
      const user = repository.getByRole(1)!;
      expect(user[0]).to.be.a("object");
      expect(user[0].getId()).to.be.equal(1);
      expect(user[0].getLogin()).to.be.equal("info@fake-mm.ru");
    });
    it("repository.getOne(3)", () => {
      const user = repository.getOne(3)!;
      expect(user).to.be.a("object");
      expect(user.getId()).to.be.equal(3);
      expect(user.getLogin()).to.be.equal("info@pikada-lab.ru");
    });
    it("repository.getBySpecification( {login: info@...})", () => {
      const user = repository.getBySpecification(
        new AnyUserSpecification().where("login").equal("info@fake-mm.ru")
      )!;
      expect(user[0]).to.be.a("object");
      expect(user[0].getId()).to.be.equal(1);
      expect(user[0].getLogin()).to.be.equal("info@fake-mm.ru");
    });
    it("repository.getAll()", () => {
      const user = repository.getAll()!;
      expect(user).to.be.lengthOf(3);
    });
  });
});
