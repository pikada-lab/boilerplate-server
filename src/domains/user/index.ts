export interface User extends UserAuthentication, UserAuthorization{
  getId(): number;
  getName(): string;
  getRole(): number;
  getLogin(): string;
  getContact(type: string): UserContact | undefined;

  /**
   * @throws UserDetailsError
   */
  setUserDetail(user: UserDTO): void;
  getUserDetail(): UserDTO;
  toJSON(): UserDAO;
  restore(user: UserDAO): User;
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

  checkLoginCode?: string;
  checkLoginTTL?: number;
}

export interface UserAuthorizationDTO {
  role: number;
  remindCode?: string;
  remindTTL?: number;
}
export interface UserDTO {
  id: number;
  firstName: string;
  lastName: string;
  secondName: string;
  contacts: UserContactDTO[];
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
   * Возвращает код для восстановления пароля
   * который можно отправить пользователю любым удобным способом
   * и перейдя на страницу с этим кодом в параметрах
   * он сможет восстановить пароль через процедуру
   * UserAuthorizationService.changePassword
   */
  remindPassword(): string;
  /**
   * В случае успеха не вызывает исключение
   * @throws RemindError
   */
  checkRemindCode(code: string): void;
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
  getCheckCode(): string;
  checkLogin(code: string): void;
}

export enum UserContactType {
  PHONE = 1,
  EMAIL,
  ADDRESS,
  PROFILE, // vk, instagram, facebook, twitter, website
}
export interface UserContactDTO {
  userId: number;
  title: string;
  type: UserContactType;
  value: string;
}
export interface UserContact {
  getTitle(): string;
  getContact(): string;
  getType(): UserContactType;
  toJSON(): UserContactDTO;
  restore(contact: UserContactDTO): UserContact;
}

export interface UserRepository {
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
}

/** маркирующий интерфейс для запросов по неиндексированным полям пользователя */
export interface AnyUserSpecification {}

export interface UserSettingService {
  getFullDetailsUser(userId: number): Promise<UserDTO>;
  addContact(userId: number, contact: UserContactDTO): Promise<User>;
}
/** JWT -  */
export type Token = string;
export interface UserAuthenticationService {
  login(login: string, password: string): Promise<[Token, Token]>;
  logout(token: Token): Promise<void>;
  refresh(token: Token): Promise<[Token, Token]>;
  getLog(): Promise<String[]>;
}

export interface UserAuthorizationService {
  create(login: string, password: string): Promise<User>;
  changeRole(login: number, roleId: number): Promise<User>;
  tryToRemindUsersAccess(login: number): Promise<void>;
  changePassword(login: string, password: string): Promise<void>;
  delete(login: string): Promise<boolean>;
  changeLogin(oldLogin: string, newLogin: string): Promise<void>;
}
