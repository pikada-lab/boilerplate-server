import { UserContactType } from ".."; 
import { FakeMMUser } from "./User";

var expect = require("chai").expect;

const user = new FakeMMUser();
user.restore({
  id: 1,
  STATUS: "CREATED",
  firstName: "Anton",
  lastName: "Dzhigurda",
  secondName: "Alex", 
  login: "info@info.ru",
  hash: "",
  sol: "",
  role: 2,
  createAt: 1,
  updateAt: 2,
});
describe("User", () => {
  it("User.constructor", () => {
    const user = new FakeMMUser();
    expect(user.status).to.be.a("string");
    expect(user.status).to.be.equal("CREATED");
  });
  it("User.restore", () => {
    expect(user.getName()).to.be.a("string");
    expect(user.getLogin()).to.be.equal("info@info.ru");
    expect(user.getRole()).to.be.equal(2);
    expect(user.getId()).to.be.equal(1);
  });
  it("User.setLogin", () => {
    user.setLogin("info@fake-mm.ru");
    expect(user.getLogin()).to.be.equal("info@fake-mm.ru");
  }); 
  it("User script with set and check password", () => {
    user.setPasword("4321");
    expect(function () {
      user.checkPassword("1234");
    }).throw("Неправильный пароль");
    expect(function () {
      user.checkPassword("");
    }).throw("Нет пароля");
    expect(function () {
      user.checkPassword(123 as any);
    }).throw("Пароль должен быть строкой");
    expect(function () {
      user.checkPassword("123");
    }).throw("Пароль должен содержать минимум 4 символа");
    expect(user.checkPassword("4321")).to.be.true;
    user.setPasword("1212");
    expect(user.checkPassword("1212")).to.be.true;
    expect(function () {
      user.checkPassword("4321");
    }).throw("Неправильный пароль");
  }); 
  it("User.setRole", () => {
      user.setRole(8);
      expect(user.getRole()).to.be.equal(8)
  })
  it("User.toJSON()", () => { 
      const userDAO = user.toJSON();
      expect(userDAO.id).to.be.equal(1);
      expect(userDAO.firstName).to.be.equal("Anton");
      expect(userDAO.secondName).to.be.equal("Alex");
      expect(userDAO.lastName).to.be.equal("Dzhigurda");
  })
});
