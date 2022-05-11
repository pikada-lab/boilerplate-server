import { onInit } from "../../utilites";

export interface User extends UserAuthentication, UserAuthorization {
  remove(): boolean;
  recover(): boolean;
  getId(): number;
  getName(): string;
  getRole(): number;
  getLogin(): string;
  getContacts(): UserContact[];
  getContact(id: number): UserContact | undefined;
  addContact(contact: UserContact): void;
  removeContact(contactId: number): void;
  setSetting(settingDTO: UserSettingDTO): void;
  /**
   * @throws UserDetailsError
   */
  setUserDetail(user: UserDTO): void;
  getUserDetail(): UserDTO;
  toJSON(): UserDAO;
  restore(user: UserDAO): User;

  isTrainee(): boolean;
}

export interface UserDAO
  extends UserDTO,
    UserAuthenticationDTO,
    UserAuthorizationDTO {
  STATUS: "CREATED" | "CHECKED" | "DELETED";
  createAt: number;
  updateAt: number;
}
export interface UserAuthenticationDTO {
  login: string;
  hash: string;
  sol: string;
}

export interface UserAuthorizationDTO {
  role: number;
}

export interface UserSettingDTO {
  firstName: string;
  lastName: string;
  secondName: string;
}
export interface UserDTO extends UserSettingDTO {
  id: number;
  STATUS: string;
  contacts?: UserContactDTO[];
}

export interface UserAuthentication {
  /**
   * @throws AuthenticationError, PasswordError
   */
  checkPassword(password: string): boolean;
  getLogin(): string;
}

export interface UserAuthorization {
  /**
   * @throws PasswordError
   */
  setPasword(password: string): void;
  setRole(roleId: number): void;
  /**
   * @throws LoginError
   */
  setLogin(login: string): void;
  getLogin(): string;
  checkLogin(): void;
}

export enum UserContactType {
  PHONE = 1,
  EMAIL,
  ADDRESS,
  PROFILE, // vk, instagram, facebook, twitter, website
}
export interface UserContactDTO {
  id: number;
  userId: number;
  title: string;
  type: UserContactType;
  value: string;
}
export interface UserContact {
  isDeleted: boolean;

  getId(): number;
  getTitle(): string;
  getContact(): string;
  getType(): UserContactType;
  getUserId(): number;
  toJSON(): UserContactDTO;
  restore(contact: UserContactDTO): UserContact;
}
export interface UserRepository extends onInit {
  /**
   * @throws UserSaveError
   */
  save(User: User): Promise<boolean>;
  create(data: UserAuthenticationDTO): Promise<User>;
  delete(id: number): Promise<boolean>;

  findAll(): Promise<User[]>;
  findOne(id: number): Promise<User>;
  findBySpecification(request: AnyUserSpecification): Promise<User[]>;
  findByRole(roleId: number): Promise<User[]>;

  getAll(): User[];
  getOne(id: number): User;
  getBySpecification(request: AnyUserSpecification): User[];
  getByRole(roleId: number): User[];
  getByLogin(login: string): User;
  hasUserByLogin(login: string): boolean;
}

/** маркирующий интерфейс для запросов по неиндексированным полям пользователя */
export interface AnyUserSpecification {}
