import { UserRepository } from "..";
import { CallPort } from "../../ports/CallPort";
import { MailPort } from "../../ports/MailPort";
import { VerifyError } from "../Error";
import { UserVerifyRepository } from "./UserVerefyReposiotry";
import { UserVerifyRecord, VerifyType } from "./UserVerifyRecord";

export interface UserVerefyStrategy {
  sendCode(userId: number, type: VerifyType): Promise<boolean>;
  checkCode(code: string, userId: number, type: VerifyType): Promise<boolean>;
}


/**
 * Восстановление и подтверждение пароля, если у пользователя логин телефон
 */
export class UserVerefyForMobileCallStrategy implements UserVerefyStrategy {
  constructor(
    private callPort: CallPort,
    private userRepository: UserRepository,
    private service: UserVerifyRepository
  ) {}

  async sendCode(userId: number, type: VerifyType): Promise<boolean> {
    const user = this.userRepository.getOne(userId);
    const codeInNumber = await this.callPort.send(user.getLogin());
    const [code, dao] = UserVerifyRecord.createPair(
      type,
      userId,
      codeInNumber.toString()
    );
    const record = await this.service.create(
      new UserVerifyRecord().restore(dao)
    );
    return true;
  }
  async checkCode(code: string, userId: number, type: VerifyType) {
    const records = this.service.getRecordsByUserAndType(type, userId);
    for (let record of records) {
      try {
        record.check(code);
        this.service.delete(record.getId()!);
        return true;
      } catch (ex) {}
    }
    return false;
  }
}

/**
 * Восстановление и подтверждение пароля, если у пользователя логин почта
 */
export class UserVerefyForMailStrategy implements UserVerefyStrategy {
  constructor(
    private mailPort: MailPort,
    private userRepository: UserRepository,
    private service: UserVerifyRepository
  ) {}
  async sendCode(userId: number, type: VerifyType): Promise<boolean> {
    const [code, dao] = UserVerifyRecord.createPair(type, userId);
    const record = await this.service.create(
      new UserVerifyRecord().restore(dao)
    );
    try {
      if (type === VerifyType.REMIND) {
        await this.sendRemindMail(code, userId);
      } else if (type === VerifyType.LOGIN) {
        await this.sendLoginVerifyMail(code, userId);
      } else {
        throw new VerifyError("Неопознаный способ подтверждения");
      }
      return true;
    } catch (ex) {
      await this.service.delete(record.getId()!);
    }
    return false;
  }
  private async sendRemindMail(code: string, userId: number) {
    const user = this.userRepository.getOne(userId);
    await this.sendToMail(
      user.getLogin(),
      "Восстановление доступа к fake-mm.ru",
      "<p>Код восстановления: " +
        code +
        "</p><p>Если это не вы, проигнорируйте это письмо</p>"
    );
  }

  private async sendLoginVerifyMail(code: string, userId: number) {
    const user = this.userRepository.getOne(userId);
    await this.sendToMail(
      user.getLogin(),
      "Подтверждение регистрации на fake-mm.ru",
      "<p>Код подтверждения: " +
        code +
        "</p><p>Если это не вы, проигнорируйте это письмо</p>"
    );
  }

  private async sendToMail(emailLogin: string, subject: string, text: string) {
    this.mailPort.send(emailLogin, subject, text);
  }

  async checkCode(code: string, userId: number, type: VerifyType) {
    const records = this.service.getRecordsByUserAndType(type, userId);
    for (let record of records) {
      try {
        record.check(code);
        this.service.delete(record.getId()!);
        return true;
      } catch (ex) {}
    }
    return false;
  }
}
