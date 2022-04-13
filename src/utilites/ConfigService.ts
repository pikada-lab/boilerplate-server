import { accessSync, mkdirSync, readFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import * as jose from "jose";
import { join } from "path";

export class ConfigService {
  private _privateKey!: jose.KeyLike;
  private _publicKey!: jose.KeyLike;
  private alg = "ES256";
  constructor() {}
  async init() {
    try {
      accessSync("secret");
      accessSync(join("secret", "public.pem"));
      accessSync(join("secret", "private.pem"));
      await this.readKeys();
    } catch (ex) {
        console.log(ex);
      await this.writeKeys();
    }
    const { publicKey, privateKey } = await jose.generateKeyPair(this.alg);
    this._privateKey = privateKey;
    this._publicKey = publicKey;
 
  }
  private async readKeys() {
    const [publicString, privateString] = await Promise.all([
        await readFile(join("secret", "public.pem"), "utf8"),
        await readFile(join("secret", "private.pem"), "utf8")
      ]); 
    this._privateKey =  await jose.importPKCS8(privateString, this.alg); 
    this._publicKey =  await jose.importSPKI(publicString, this.alg);

  }

  private async writeKeys() {
    mkdirSync("secret", {});
    const { publicKey, privateKey } = await jose.generateKeyPair(this.alg);

    this._privateKey = privateKey;
    this._publicKey = publicKey;

    const publicString = await jose.exportSPKI(this._publicKey);
    const privateString = await jose.exportPKCS8(this._privateKey);
    await writeFile(join("secret", "public.pem"), publicString, "utf8");
    await writeFile(join("secret", "private.pem"), privateString, "utf8");
 
  }
  get algorithm() {
      return this.alg;
  }

  get privateKey() {
    return this._privateKey;
  }

  get publicKey() {
    return this._publicKey;
  }
}
