import { User, UserRepository } from ".";
import * as jose from "jose";
import { ConfigService } from "../../utilites/ConfigService";
import { LoginError, TwoFAError, UserError } from "./Error";
import { TokenDecoder } from "../../utilites/TokenDecoder";
import * as QRCode from "qrcode";
import { UserAuthenticationService } from "./services";
import { TwoFactorRepository } from "./2FA/TwoFactorRepository";
import { TwoFactorSecrets } from "./2FA/TwoFactorSecrets";

export class FakeMMUserAuthenticationService
  implements UserAuthenticationService
{
  constructor(
    private repository: UserRepository,
    private twoFactorRepository: TwoFactorRepository,
    private config: ConfigService
  ) {}

  async init() {}

  async login(
    login: string,
    password: string,
    userToken?: string
  ): Promise<[string, string]> {
    const user = this.repository.getByLogin(login);
    user.checkPassword(password);

    if (await this.isTwoFactorAuth(user.getId())) {
      if (!userToken)
        throw new TwoFAError("Нет токена для 2 факторной аутентификации");
      await this.verify2FAToken(user.getId(), userToken!);
    }

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
      role: user.getRole(),
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

  async getPayload(token: string): Promise<any> {
    return await TokenDecoder(token, this.config);
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

  async refreshHard(id: number): Promise<[string, string]> {
    const user = this.repository.getOne(id);
    // вносим в лог
    return await this.updateTokens(user);
  }
  getLog(): Promise<String[]> {
    throw new Error("Method not implemented.");
  }

  async getQRCode(userId: number): Promise<{ qr: string; id: number }> {
    const user = this.repository.getOne(userId);
    const record = this.twoFactorRepository.getRecordsByUserId(userId);
    if (record) {
      if (record.isEnable()) throw new Error("2AE уже включено");
      this.twoFactorRepository.delete(record!.getId()!);
    }
    const TFARecord = TwoFactorSecrets.create(
      userId,
      `Fake-MM (${user.getLogin()})`
    );
    const TFARecordWithID = await this.twoFactorRepository.create(TFARecord);
    return TFARecordWithID.getQR();
  }

  async enable2FA(userId: number, token: string): Promise<void> {
    const record = this.twoFactorRepository.getRecordsByUserId(userId);
    if (!record) throw new UserError("Record doesn't find"); 
    if (!record?.enable(token)) throw new UserError("Token is not matching");
    await this.twoFactorRepository.save(record!);
  }

  async disable2FA(userId: number): Promise<void> {
    const record = this.twoFactorRepository.getRecordsByUserId(userId);
    if (!record) throw new UserError("Нет записей в базе");
    record?.disable();
    await this.twoFactorRepository.save(record!);
  }

  async get2FARestoreCodes(userId: number): Promise<string[]> {
    const record = this.twoFactorRepository.getRecordsByUserId(userId);
    if (!record) throw new UserError("Нет записей в базе");
    return record.getAllCode();
  }

  async isTwoFactorAuth(userId: number): Promise<boolean> {
    const record = this.twoFactorRepository.getRecordsByUserId(userId);
    if (!record) return false;
    return record!.isEnable();
  }

  private verify2FAToken(userId: number, userToken: string): void {
    const record = this.twoFactorRepository.getRecordsByUserId(userId);
    if (!record) throw new LoginError("Access is not allow - 2FA");
    if (record.checkRestoreCode(userToken)) return;
    if (!record.checkCode(userToken))
      throw new LoginError("Access is not allow - 2FA");
  }
}
