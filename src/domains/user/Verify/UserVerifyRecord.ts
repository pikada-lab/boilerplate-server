import { createHash } from "crypto";
import { VerifyError } from "../Error";

export enum VerifyType {
  REMIND = 1,
  LOGIN,
}
export interface UserVerifyRecordDAO {
  id?: number;
  type: VerifyType;
  userId: number;
  hash: string;
  sol: string;
  ttl: number;
}
export class UserVerifyRecord {
  private id: number | undefined;
  private type!: VerifyType;
  private userId!: number;
  private hash!: string;
  private sol!: string;
  private ttl!: number;
  constructor() {}

  getId() {
    return this.id;
  }

  getType() {
    return this.type;
  }

  getUser() {
    return this.userId;
  }

  restore(dao: UserVerifyRecordDAO) {
    this.type = dao.type;
    this.id = dao.id ?? undefined;
    this.userId = dao.userId;
    this.hash = dao.hash;
    this.sol = dao.sol;
    this.ttl = dao.ttl;
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      userId: this.userId,
      hash: this.hash,
      ttl: this.ttl,
      sol: this.sol,
    };
  }

  static createPair(
    type: VerifyType,
    userId: number,
    declareCode?: string
  ): [string, UserVerifyRecordDAO] {
    const sol = UserVerifyRecord.createRandomSol();
    const ttl = +new Date() + 24 * 60 * 60 * 1000;
    const code =
      declareCode ??
      Math.round(Math.random() * 999999)
        .toString()
        .padStart(4, "0");
    const hash = UserVerifyRecord.getHash(code, sol);
    const dao = { type, userId, sol, hash, ttl };
    return [code, dao];
  }

  /**
   *
   * @param code - check code;
   * @throw UserVerifyRecord
   * @returns true
   */
  check(code: string) {
    this.checkCode(code);
    this.checkTTL();
    return true;
  }
  private checkCode(code: string) {
    if (UserVerifyRecord.getHash(code, this.sol) !== this.hash)
      throw new VerifyError("Код не совпал");
  }

  private checkTTL() {
    if (+new Date() > this.ttl) throw new VerifyError("Код устарел");
  }

  isExpired() {
    try {
      this.checkTTL();
      return false;
    } catch (ex) {
      return true;
    }
  }

  private static createRandomSol() {
    return Math.round(Math.random() * 0x999)
      .toString(16)
      .padStart(3, "0");
  }

  private static getHash(code: string, sol: string) {
    const fullPassword = code + sol;
    return createHash("sha256").update(fullPassword).digest("hex");
  }
}
