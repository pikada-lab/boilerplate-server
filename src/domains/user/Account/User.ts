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
  UserSettingDTO,
} from "..";
import { AuthenticationError, PasswordError } from "../Error";
import { createHash } from "crypto";

export class FakeMMUser implements User, UserAuthorization, UserAuthentication {
  private id!: number;
  private firstName!: string;
  private lastName!: string;
  private secondName!: string;
  private contacts: Map<number, UserContact> = new Map();

  private role!: number;
  private login!: string;
  private hash!: string;
  private sol!: string;

  private STATUS: "CREATED" | "CHECKED" | "DELETED" = "CREATED";
  private createAt!: number;
  private updateAt!: number;

  get status() {
    return this.STATUS;
  }

  isTrainee(): boolean {
    return this.role === 2;
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
  getContacts() {
    return Array.from(this.contacts.values());
  }
  getContact(id: number): UserContact | undefined {
    return this.contacts.get(id);
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

  private getUserDTO(): UserDTO & UserAuthorizationDTO {
    return Object.assign(
      {
        id: this.id,
        STATUS: this.STATUS,
        contacts: this.getContactsList(),
        role: this.role,
      },
      this.getSetting()
    );
  }
  setSetting(dto: UserSettingDTO) {
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
    this.secondName = dto.secondName;
  }
  getSetting(): UserSettingDTO {
    return {
      firstName: this.firstName,
      secondName: this.secondName,
      lastName: this.lastName,
    };
  }

  private getContactsList(): UserContactDTO[] {
    return Array.from(this.contacts.values()).map((r) => r.toJSON());
  }
  setContactList(contacts: UserContact[]) {
    this.contacts = new Map();
    if (!contacts) return;
    for (let contact of contacts) {
      this.contacts.set(contact.getId(), contact);
    }
  }

  addContact(contact: UserContact) {
    this.contacts.set(contact.getId(), contact);
  }
  removeContact(contactId: number) {
    this.contacts.delete(contactId);
  }
  private getUserAuthenticationDTO() {
    return {
      login: this.login,
      hash: this.hash,
      sol: this.sol,
    };
  }
  private getUserAuthorizationDTO() {
    return {
      role: this.role,
    };
  }
  restore(user: UserDAO): User {
    /// TODO: code
    this.id = user.id;
    this.createAt = user.createAt;
    this.updateAt = user.updateAt;
    this.STATUS = user.STATUS;
    this.restoreUser(user);
    this.restoreUserAuthentication(user);
    this.restoreUserAuthorization(user);
    return this;
  }

  private restoreUser(user: UserDTO) {
    this.firstName = user.firstName;
    this.secondName = user.secondName;
    this.lastName = user.lastName;
  }
  private restoreUserAuthentication(user: UserAuthenticationDTO) {
    this.login = user.login;
    this.hash = user.hash;
    this.sol = user.sol;
  }
  private restoreUserAuthorization(user: UserAuthorizationDTO) {
    this.role = user.role;
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

  checkLogin() {
    if (this.STATUS === "CHECKED") return false;
    this.STATUS = "CHECKED";
    return true;
  }

  remove() {
    if (this.STATUS === "DELETED") return false;
    this.STATUS = "DELETED";
    return true;
  }

  recover() {
    if (this.STATUS === "CREATED") return false;
    this.STATUS = "CREATED";
    return true;
  }
}
