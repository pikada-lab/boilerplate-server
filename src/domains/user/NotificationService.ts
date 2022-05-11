import { UserRepository } from ".";
import { MailPort } from "../ports/MailPort";

export class NotificationService {
  constructor(private repository: UserRepository, private mailPort: MailPort) {}

  async send(userId: number, subject: string, text: string): Promise<boolean> {
    try {
      const user = this.repository.getOne(userId);
      this.mailPort.send(user.getLogin(), subject, text);
      return true;
    } catch (ex) {
      console.log("Не удалось отправить уведомление на почту ", ex);
      return false;
    }
  }
}
