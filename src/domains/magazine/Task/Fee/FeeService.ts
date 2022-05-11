import { RoleChecker } from "../..";
import { MailPort } from "../../../ports/MailPort";
import { AccessItem } from "../../../user/Role/Role";
import { HistoryRepository } from "../History/HistoryRepository";
import { AuthorTask } from "../Task";
import { FeeRepository } from "./FeeRepository";
export interface UserNotification {
  send(userId: number, subject: string, text: string): Promise<boolean>;
}
export class FeeService {
  constructor(
    private historyRepository: HistoryRepository,
    private userNotification: UserNotification,
    private feeRepository: FeeRepository,
    private roleChecker: RoleChecker,
  ) {}

  async init() {}

  /**
   *
   * @param task Задание по которому начисляем гонорар
   * @param comment комментарий
   */
  async pushFeeForTask(task: AuthorTask, comment: string) {
    // Проверка была ли статья уже оплачена через репозиторий
    const isEnd = this.historyRepository
      .getByTask(task.getId()!)
      .find((h) => h.isEnd());
    if (isEnd) return false;
    if (task.getFee() === 0) return true;
    // начисляем есл
    await this.feeRepository.create(task, "");
    // уведомляем
    this.userNotification.send(
      task.getAuthor()!,
      `Вам начислено ${task.getFee()} рублей`,
      `<p>Привет #USER${task.getAuthor()}!</p> <p>Редактор #USER${task.getEditor()} опубликовал вашу статью @ARTICLE${task.getArticle()}, теперь вы можете поделиться ей с друзьями.<p>`
    );
    return true;
  }

  async pay(id: number, initiator: number, comment: string) {
    this.roleChecker.checkUserWithThrow(initiator, AccessItem.CAN_PAY_FEE);
    const fee = this.feeRepository.getOne(id)!;
    fee.pay(comment);
    // нотификация fee.getAuthor()
    return this.feeRepository.save(fee);
  }

  async cancel(id: number, initiator: number, comment: string) {
    this.roleChecker.checkUserWithThrow(initiator, AccessItem.CAN_PAY_FEE);
    const fee = this.feeRepository.getOne(id)!;
    fee.cancel(comment);
    
    // нотификация fee.getAuthor()
    return this.feeRepository.save(fee);
  }

  async setRecipient(id: number, initiator: number, author: number) {

    this.roleChecker.checkUserWithThrow(initiator, AccessItem.CAN_PAY_FEE);
    const fee = this.feeRepository.getOne(id)!;
    fee.setAuthor(author);
    // нотификация fee.getAuthor()
    return this.feeRepository.save(fee);
  }
}
