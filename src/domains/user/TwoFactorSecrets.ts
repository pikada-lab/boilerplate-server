import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import { UserError } from "./Error";

export class TwoFactorSecrets {
  private id?: number;
  private userId!: number;
  private secret!: string;
  private url!: string;

  private STATUS: "CREATED" | "ENABLED" | "DISABLED" = "CREATED";
  private staticCodes: string[] = [];
  constructor() {}
  static COUNT_STATIC_CODE = 12;
  static create(userId: number, name: string): TwoFactorSecrets {
    const secret = speakeasy.generateSecret();

    const url = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: name,
      algorithm: "sha512",
    });

    return new TwoFactorSecrets().restore({
      userId,
      secret: secret.base32,
      url,
      staticCodes: new Array(TwoFactorSecrets.COUNT_STATIC_CODE)
        .fill("")
        .map((r) =>
          Math.round(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, "0")
        ),
    });
  }
  getId() {
    return this.id;
  }

  isEnable() {
    return this.STATUS === "ENABLED";
  }
  getUserId() {
    return this.userId;
  }

  getAllCode() {
    if (!this.isEnable()) throw new UserError("2FA is not allow");
    return this.staticCodes;
  }

  checkRestoreCode(userToken: string) {
    let index = this.staticCodes.findIndex((r) => r === userToken);
    if (!~index) return false;
    this.staticCodes.splice(index, 1);
    return true;
  }
  checkCode(userToken: string) {
    return speakeasy.totp.verify({
      secret: this.secret,
      encoding: "base32",
      token: userToken,
    });
  }
  enable(testToken: string) {
    if (!this.checkCode(testToken)) return false;
    this.STATUS = "ENABLED";
    return true;
  }
  disable() {
    if (!this.isEnable()) return false;
    this.STATUS = "DISABLED";
    return true;
  }

  async getQR(): Promise<{ qr: string; id: number }> {
    return new Promise<{ qr: string; id: number }>((res) => {
      QRCode.toDataURL(this.url, (err: any, url: string) => {
        if (err) throw new UserError("Ошибка генерации QR");
        res({ qr: url, id: this.id! });
      });
    });
  }
  restore(dao: any) {
    this.id = dao.id;
    this.userId = dao.userId;
    this.secret = dao.secret;
    this.STATUS = dao.STATUS;
    this.staticCodes = dao.staticCodes;
    this.url = dao.url;
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      secret: this.secret,
      staticCodes: this.staticCodes,
      url: this.url,
      STATUS: this.STATUS,
    };
  }
}
