import { UserDTO, UserSettingDTO, User, UserContactDTO, UserContact } from ".";
import { onInit } from "../../utilites";

/** JWT -  */
export type Token = string;

export interface UserSettingService extends onInit {
  getFullDetailsUser(userId: number): Promise<UserDTO>;
  saveSetting(userId: number, user: UserSettingDTO): Promise<User>;

  addContact(userId: number, contact: UserContactDTO): Promise<UserContact>;
  deleteContact(userId: number, contactId: number): Promise<boolean>;
  editContact(userId: number, contact: UserContactDTO): Promise<UserContact>;
}

export interface UserAuthenticationService extends onInit { 
  login(login: string, password: string, token?: string): Promise<[Token, Token]>;
  logout(token: Token): Promise<void>;
  getPayload(token: Token): Promise<any>;
  refresh(token: Token): Promise<[Token, Token]>;
  refreshHard(id: number): Promise<[Token, Token]>;
  getLog(): Promise<String[]>;

  getQRCode(userId: number): Promise<{ qr: string; id: number }>;
  enable2FA(userId: number, token: string): Promise<void>;
  disable2FA(userId: number): Promise<void>; 

  isTwoFactorAuth(userId: number): Promise<boolean>
  get2FARestoreCodes(userId: number):  Promise<string[]>;

}

export interface UserAuthorizationService extends onInit { 
  remindPassword(userId: string, code: string, password: string): Promise<void>;
  verifyLogin(userId: number, code: string): Promise<boolean>;
  create(login: string, password: string): Promise<User>;
  changeRole(userId: number, roleId: number, adminId: number): Promise<User>;
  tryToRemindUsersAccess(login: string): Promise<void>;
  changePassword(userId: number, password: string): Promise<void>;
  delete(userId: number): Promise<boolean>;
  remove(userId: number): Promise<boolean>;
  recover(userId: number): Promise<boolean>;
  changeLogin(userId: number, newLogin: string): Promise<void>;
  getLoginDetails(
    userId: number
  ): Promise<{ login: string; loginType: string }>;
}
