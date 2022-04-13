import { User, UserAuthenticationService, UserRepository } from ".";
import * as jose from "jose";
import { ConfigService } from "../../utilites/ConfigService";
import { LoginError } from "./Error";

export class FakeMMUserAuthenticationService
  implements UserAuthenticationService
{

  constructor(
    private repository: UserRepository,
    private config: ConfigService
  ) {}

  async login(login: string, password: string): Promise<[string, string]> {
    const user = this.repository.getByLogin(login);
    user.checkPassword(password);
    // создаём токен

    // вносим в лог
    return await this.updateTokens(user);
  }
  private async updateTokens(user: User): Promise<[string, string]> {
    const token = await new jose.SignJWT({
      id: user.getId(),
      role: user.getRole(),
    })
      .setProtectedHeader({ alg: "ES256" })
      .setIssuedAt()
      .setIssuer("fake-mm")
      .setAudience("reader")
      .setExpirationTime("2h")
      .sign(this.config.privateKey);
    // создаём рефреш токен

    const refresh = await new jose.SignJWT({
      id: user.getId(),
      login: user.getLogin(),
      refresh: true,
    })
      .setProtectedHeader({ alg: "ES256" })
      .setIssuedAt()
      .setIssuer("fake-mm")
      .setAudience("reader")
      .setExpirationTime("30d")
      .sign(this.config.privateKey);
    // вносим в лог
    return [token, refresh];
  }
  async logout(token: string): Promise<void> {
     // Занести рефреш токен и токен в таблицу блокировки учётных записей

  }
  async refresh(token: string): Promise<[string, string]> {
    const { payload, protectedHeader } = await jose.jwtVerify(
      token,
      this.config.privateKey
    );
    if (!payload.refresh) throw new LoginError("Это не рефреш токен");
    if (!payload.id) throw new LoginError("Это не рефреш токен");
    if (typeof payload.id != "number")
      throw new LoginError("Это не рефреш токен");
    const user = this.repository.getOne(+payload["id"]);
    // вносим в лог
    return await this.updateTokens(user);
  }
  getLog(): Promise<String[]> {
    throw new Error("Method not implemented.");
  }
}
