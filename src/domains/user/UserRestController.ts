import { UserRepository } from ".";
import { onInit } from "../../utilites";
import {
  RestAuthorizationRequest,
  RestRequest,
  ServerController,
} from "../../utilites/ServerController";
import { AnyUserSpecification } from "./Account/AnyUserSpecification";
import { LoginError, PasswordError, RemindError, UserError } from "./Error";
import { AccessItem } from "./Role/Role"; 
import { RoleService } from "./Role/RoleService";
import {
  UserAuthenticationService,
  UserAuthorizationService,
  UserSettingService,
} from "./services";

export class UserRestController implements onInit {
  constructor(
    private server: ServerController,
    private repository: UserRepository,
    private userService: UserSettingService,
    private authService: UserAuthorizationService,
    private loginService: UserAuthenticationService,
    private role: RoleService
  ) {}

  async init() {
    this.setRequestController();
    this.setCommandController();
  }

  //#region query zone
  private setRequestController() {
    this.server.getAuth("/v1/user/", async (req) => this.getAllUser(req));
    this.server.getAuth("/v1/user/:id", async (req) => this.getUserById(req));
    this.server.getAuth("/v1/user/me", async (req) => this.getUserByToken(req));
    this.server.getAuth("/v1/user/:id/login", async (req) =>
      this.getLoginById(req)
    );

    this.server.getAuth("/v1/user/2fa/qr", async (req, res) =>
      this.getQRcode(req, res)
    );
    this.server.getAuth("/v1/user/2fa/restoreCodes", async (req, res) =>
      this.get2FARestoreCodes(req, res)
    );
  }

  private async get2FARestoreCodes(
    req: RestRequest & RestAuthorizationRequest,
    res: any
  ) {
    if (!+req.payload.id) {
      throw new UserError("Нет доступа");
    }
    return this.loginService.get2FARestoreCodes(+req.payload.id);
  }

  private async getQRcode(
    req: RestRequest & RestAuthorizationRequest,
    res: any
  ) {
    if (!+req.payload.id) {
      throw new UserError("Нет доступа");
    }
    return this.loginService.getQRCode(+req.payload.id);
  }

  private async getLoginById(req: RestRequest & RestAuthorizationRequest) {
    if (!req.params.id) throw new UserError("Нет номера пользователя");
    if (+req.payload.id != +req.params.id) {
      const admin = this.repository.getOne(+req.payload.id);
      if (![5, 6].includes(admin.getRole())) {
        throw new UserError("Нет прав для редактирования пользователя");
      }
    }
    return await this.authService.getLoginDetails(+req.params.id);
  }

  private async getAllUser(req: RestRequest & RestAuthorizationRequest) {
    this.role.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_USERS);
    if (req.query.firstName) {
      const specification = new AnyUserSpecification()
        .where("firstName")
        .like(req.query.firstName);
      return this.repository.getBySpecification(specification);
    } else {
      return this.repository.getAll().map((u) => u.getUserDetail());
    }
  }

  private async getUserById(req: RestRequest) {
    if (!req.params.id) throw new UserError("Нет номера пользователя");
    return this.repository.getOne(+req.params.id).getUserDetail();
  }

  private async getUserByToken(req: RestAuthorizationRequest) {
    console.log(req.payload);
    return this.repository.getOne(+req.payload.id).getUserDetail();
  }
  //#endregion
  //#region Command zone
  private setCommandController() {
    this.server.post("/v1/user/registration", async (req) =>
      this.registration(req)
    );
    this.server.post("/v1/user/login", async (req) => this.login(req));
    this.server.patch("/v1/user/remind/:code", async (req) =>
      this.changeRemindPassword(req)
    );
    this.server.post("/v1/user/remind", async (req) => this.remind(req));
    this.server.deleteAuth("/v1/user/remove", async (req) =>
      this.removeUser(req)
    );
    this.server.postAuth("/v1/user/recover", async (req) =>
      this.recoverUser(req)
    );
    this.server.deleteAuth("/v1/user/delete", async (req) =>
      this.deleteUser(req)
    );
    this.server.patchAuth("/v1/user/password", async (req) =>
      this.changePassword(req)
    );
    this.server.patchAuth("/v1/user/role", async (req) => this.changeRole(req));
    this.server.postAuth("/v1/user/contact", async (req) =>
      this.addContact(req)
    );
    this.server.patchAuth("/v1/user/contact/:id", async (req) =>
      this.editContact(req)
    );
    this.server.post("/v1/user/refresh", async (req) => this.refresh(req));
    this.server.deleteAuth("/v1/user/contact/:id", async (req) =>
      this.deleteContact(req)
    );
    this.server.postAuth("/v1/user/verify/:code", async (req) =>
      this.verifyLogin(req)
    );
    this.server.patchAuth("/v1/user/:id", async (req) =>
      this.saveUserSetting(req)
    );
    this.server.patchAuth("/v1/user/2fa/enable", async (req) =>
      this.enable2FA(req)
    );
    this.server.patchAuth("/v1/user/2fa/disable", async (req) =>
      this.disable2FA(req)
    );
    this.server.getAuth("/v1/user/2fa/chekcEnable", async (req) =>
      this.check2FA(req)
    );
  }

  private async check2FA(req: RestAuthorizationRequest) {
    return this.loginService.isTwoFactorAuth(+req.payload.id);
  }
  private async enable2FA(req: RestRequest & RestAuthorizationRequest) {
    await this.loginService.enable2FA(+req.payload.id, req.body.token);
    return true;
  }
  private async disable2FA(req: RestRequest & RestAuthorizationRequest) {
    await this.loginService.disable2FA(+req.payload.id);
    return true;
  }
  private async verifyLogin(req: RestRequest & RestAuthorizationRequest) {
    const userId = +req.payload.id;
    const code = req.params.code;
    this.checkCode(code);
    return await this.authService.verifyLogin(userId, code);
  }
  private async deleteContact(req: RestRequest & RestAuthorizationRequest) {
    const userId = +req.payload.id;
    const contactId = +req.params.id;
    if (!contactId) throw new UserError("Нет номера контакта");
    const result = await this.userService.deleteContact(userId, contactId);
    return result;
  }
  private async addContact(req: RestRequest & RestAuthorizationRequest) {
    const userId = +req.payload.id;
    const contact = await this.userService.addContact(userId, req.body as any);
    return contact.toJSON();
  }
  private async editContact(req: RestRequest & RestAuthorizationRequest) {
    const userId = +req.payload.id;
    const contact = await this.userService.editContact(
      userId,
      Object.assign(req.body, { id: +req.params.id }) as any
    );
    return contact;
  }

  private async remind(req: RestRequest) {
    try {
      const login = req.body.login;

      this.checkLogin(login);
      this.checkForEnableLogin(login);

      await this.authService.tryToRemindUsersAccess(login);
    } catch (ex) {
      return { ok: false };
    }
    return { ok: true };
  }

  private async changeRemindPassword(req: RestRequest) {
    console.log(req);
    const code = req.params.code;
    const password = req.body.password;
    const userId = req.body.userId;
    this.checkCode(code);
    this.checkPassword(password);

    await this.authService.remindPassword(userId, code, password);
    const user = this.repository.getOne(+userId);
    const [access, refresh] = await this.loginService.login(
      user.getLogin(),
      password
    );
    return {
      user: user.getUserDetail(),
      access,
      refresh,
    };
  }
  private async changePassword(req: RestRequest & RestAuthorizationRequest) {
    const userId = req.payload.id;
    const password = req.body.password;

    this.checkPassword(password);

    await this.authService.changePassword(userId, password);
    return { ok: true };
  }

  private async changeRole(req: RestRequest & RestAuthorizationRequest) {
    const adminId = +req.payload.id;

    const userId = +req.body.userId;
    const roleId = +req.body.roleId;

    const user = await this.authService.changeRole(userId, roleId, adminId);
    const [access, refresh] = await this.loginService.refreshHard(user.getId());
    return {
      user: user.getUserDetail(),
      access,
      refresh,
    };
  }

  private async login(req: RestRequest) {
    const login = req.body.login;
    const password = req.body.password;
    const token = req.body.token;

    this.checkLogin(login);
    this.checkForEnableLogin(login);
    this.checkPassword(password);

    const user = await this.repository.getByLogin(login);
    const [access, refresh] = await this.loginService.login(
      login,
      password,
      token
    );
    return {
      user: user.getUserDetail(),
      access,
      refresh,
    };
  }

  private async refresh(req: RestRequest) {
    const token = req.body?.refresh;
    if (!token) throw new UserError("Нет токена");
    const payload: { id: number } = await this.loginService.getPayload(token);
    const [access, refresh] = await this.loginService.refresh(token);
    const user = this.repository.getOne(payload.id);
    return {
      user: user.getUserDetail(),
      access,
      refresh,
    };
  }

  private async registration(req: RestRequest) {
    const login = req.body.login;
    const password = req.body.password;

    this.checkLogin(login);
    this.checkForUniqueLogin(login);
    this.checkPassword(password);

    const user = await this.authService.create(login, password);
    const [access, refresh] = await this.loginService.login(login, password);
    return {
      user: user.getUserDetail(),
      access,
      refresh,
    };
  }

  private async saveUserSetting(req: RestRequest & RestAuthorizationRequest) {
    if (+req.payload.id != +req.params.id)
      throw new Error("Нет прав для управления другими пользователями");
    return await this.userService.saveSetting(+req.params.id, req.body as any);
  }

  private async removeUser(req: RestRequest & RestAuthorizationRequest) {
    const userId = req.payload.id;
    await this.authService.remove(userId);
    return true;
  }

  private async deleteUser(req: RestRequest & RestAuthorizationRequest) {
    if (req.payload.id === 1) return false;
    const userId = req.payload.id;
    await this.authService.delete(userId);
    return true;
  }

  private async recoverUser(req: RestRequest & RestAuthorizationRequest) {
    const userId = req.payload.id;
    await this.authService.recover(userId);
    return true;
  }

  //#endregion
  //#region Check params
  private checkLogin(login: string) {
    if (!/^(.+?)@(.+?)\.(.{2,})$/.test(login))
      throw new LoginError("Логин должен быть электронной почтой");
  }
  private checkForUniqueLogin(login: string) {
    if (this.repository.hasUserByLogin(login))
      throw new LoginError("Пользователь уже есть");
  }
  private checkForEnableLogin(login: string) {
    if (!this.repository.hasUserByLogin(login))
      throw new LoginError(
        "Пользователь с таким логином ещё не регистрировался"
      );
  }
  private checkPassword(password: string) {
    if (password.length < 6)
      throw new PasswordError("Пароль меньше 6 символов");
  }
  private checkCode(code: string) {
    if (!code) throw new UserError("Нет кода");
    if (code.length < 6) throw new UserError("Код имеет неправильный формат");
  }
  //#endregion
}
