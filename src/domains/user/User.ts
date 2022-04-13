import {
  User,
  UserAuthentication,
  UserAuthenticationDTO,
  UserAuthorization,
  UserAuthorizationDTO,
  UserContact,
  UserContactDTO,
  UserDAO,
  UserDTO,
} from ".";
import {
  AuthenticationError,
  LoginError,
  PasswordError,
  RemindError,
} from "./Error";
import { createHash } from "crypto";
import { BaseUserContact } from "./UserContact";

export class FakeMMUser implements User, UserAuthorization, UserAuthentication {
  private id!: number;
  private firstName!: string;
  private lastName!: string;
  private secondName!: string;
  private contacts: Map<string, UserContact> = new Map();

  private role!: number;
  private login!: string;
  private hash!: string;
  private sol!: string;

  private checkLoginCode?: string;
  private checkLoginTTL: number = 0;

  private remindCode?: string;
  private remindTTL: number = 0;

  private STATUS: "CREATED" | "CHECKED" | "DELETED" = "CREATED";
  private createAt!: number;
  private updateAt!: number;

  get status() {
    return this.STATUS;
  }

  getId(): number {
    return this.id;
  }
  getName(): string {
    return `${this.lastName} ${this.firstName}`;
  }
  getRole(): number {
    return this.role;
  }
  getContact(type: string): UserContact | undefined {
    return this.contacts.get(type);
  }
  setUserDetail(user: UserDTO): void {
    this.restoreUser(user);
  }
  getUserDetail(): UserDTO {
    return this.getUserDTO();
  }
  toJSON(): UserDAO {
    return Object.assign(
      {
        id: this.id,
        STATUS: this.STATUS,
        createAt: this.createAt,
        updateAt: this.updateAt,
      },
      this.getUserDTO(),
      this.getUserAuthenticationDTO(),
      this.getUserAuthorizationDTO()
    );
  }

  private getUserDTO(): UserDTO {
    return {
      id: this.id,
      firstName: this.firstName,
      secondName: this.secondName,
      lastName: this.lastName,
      contacts: this.getContactsList(),
    };
  }

  private getContactsList(): UserContactDTO[] {
    return Array.from(this.contacts.values()).map((r) => r.toJSON());
  }
  private setContactList(contacts: UserContactDTO[]) {
    this.contacts = new Map();
    if(!contacts) return;
    for (let contactDTO of contacts) {
      const contact = BaseUserContact.create(contactDTO);
      this.contacts.set(contact.getTitle(), contact);
    }
  }
  private getUserAuthenticationDTO() {
    return {
      login: this.login,
      hash: this.hash,
      sol: this.sol,
      checkLoginCode: this.checkLoginCode,
      checkLoginTTL: this.checkLoginTTL,
    };
  }
  private getUserAuthorizationDTO() {
    return {
      role: this.role,
      remindCode: this.remindCode,
      remindTTL: this.remindTTL,
    };
  }
  restore(user: UserDAO): User {
    /// TODO: code
    this.id = user.id;
    this.createAt = user.createAt;
    this.updateAt = user.updateAt;
    this.restoreUser(user);
    this.restoreUserAuthentication(user);
    this.restoreUserAuthorization(user);
    return this;
  }

  private restoreUser(user: UserDTO) {
    this.firstName = user.firstName;
    this.secondName = user.secondName;
    this.lastName = user.lastName;
    this.setContactList(user.contacts);
  }
  private restoreUserAuthentication(user: UserAuthenticationDTO) {
    this.login = user.login;
    this.hash = user.hash;
    this.sol = user.sol;
    this.checkLoginCode = user.checkLoginCode;
    this.checkLoginTTL = user.checkLoginTTL ?? 0;
  }
  private restoreUserAuthorization(user: UserAuthorizationDTO) {
    this.role = user.role;
    this.remindCode = user.remindCode;
    this.remindTTL = user.remindTTL ?? 0;
  }
  remindPassword(): string {
    let code = this.getRandomCode();
    this.remindCode = code;
    this.remindTTL = 60 * 60 * 1000 + new Date().valueOf();
    return this.remindCode;
  }
  private getRandomCode() {
    return Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0");
  }
  checkRemindCode(code: string): void {
    const date = new Date().valueOf();
    if (!this.remindCode) throw new RemindError("Код уже применён");
    if (this.remindTTL < date)
      throw new RemindError("Вышло время ожидания");
    if (this.remindCode != code) throw new RemindError("Код не совпал");
    this.remindCode = "";
    this.remindTTL = 0;
  }
  setPasword(password: string): void {
    if (!password) throw new PasswordError("Нет пароля");
    if (typeof password != "string")
      throw new PasswordError("Пароль должен быть строкой");
    if (password.length < 4)
      throw new PasswordError("Пароль должен содержать минимум 4 символа");
    const sol = this.createRandomSol();
    const hash = this.getHash(password, sol);
    this.sol = sol;
    this.hash = hash;
  }
  private createRandomSol() {
    return Math.round(Math.random() * 0x999)
      .toString(16)
      .padStart(3, "0");
  }
  private getHash(password: string, sol: string) {
    const fullPassword = password + sol;
    return createHash("sha256").update(fullPassword).digest("hex");
  }
  setRole(roleId: number): void {
    // Проверка на правильность роли
    this.role = roleId;
    this.updateAt = new Date().valueOf();
  }
  setLogin(login: string): void {
    // Проверка на правильность логина
    if (this.login == login) return;
    this.login = login;
    this.updateAt = new Date().valueOf();
    this.STATUS = "CREATED";
    return;
  }
  getCheckCode() {
    if (this.STATUS === "CHECKED")
      throw new LoginError("Login уже подтверждён");
    this.checkLoginCode = this.getRandomCode();
    this.checkLoginTTL = 60 * 60 * 1000 + new Date().valueOf();
    this.updateAt = new Date().valueOf();
    return this.checkLoginCode;
  }
  getLogin(): string {
    return this.login;
  }
  checkPassword(password: string): boolean {
    if (!password) throw new PasswordError("Нет пароля");
    if (typeof password != "string")
      throw new PasswordError("Пароль должен быть строкой");
    if (password.length < 4)
      throw new PasswordError("Пароль должен содержать минимум 4 символа");

    let checkedhash = this.getHash(password, this.sol);
    if (this.hash != checkedhash)
      throw new AuthenticationError("Неправильный пароль");

    return true;
  }

  checkLogin(code: string) {
    const date = new Date().valueOf();
    if (!code) throw new LoginError("Нет кода для проверки");
    if (!this.checkLoginCode) throw new LoginError("Код не был отправлен");
    if (this.checkLoginTTL < date)
      throw new LoginError("Вышло время подтверждения");
    if (this.checkLoginCode != code) throw new LoginError("Код не совпал");
    this.STATUS = "CHECKED";
    this.checkLoginCode = "";
    this.checkLoginTTL = 0;
  }
}
