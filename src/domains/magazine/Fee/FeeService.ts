 
import { RoleChecker } from "..";
import { AccessItem } from "../../user/Role/Role"; 
import { AuthorTask } from "../Task/Task";
import { FeeRepository } from "./FeeRepository";
export interface UserNotification {
  send(userId: number, subject: string, text: string): Promise<boolean>;
}
export class FeeService {
  constructor( 
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
    if (task.getFee() === 0) return false; 
    await this.feeRepository.create(task, comment);
    return true;
  }

  async pay(id: number, initiator: number, account: string, comment: string) {
    this.roleChecker.checkUserWithThrow(initiator, AccessItem.CAN_PAY_FEE);
    const fee = this.feeRepository.getOne(id)!;
    fee.setAccount(account);
    fee.pay(comment);
    // нотификация fee.getAuthor()
    return await this.feeRepository.save(fee);
  }

  async cancel(id: number, initiator: number, comment: string) {
    this.roleChecker.checkUserWithThrow(initiator, AccessItem.CAN_PAY_FEE);
    const fee = this.feeRepository.getOne(id)!;
    fee.cancel(comment);
    
    // нотификация fee.getAuthor()
    return await this.feeRepository.save(fee);
  }

  async setRecipient(id: number, initiator: number, author: number) {

    this.roleChecker.checkUserWithThrow(initiator, AccessItem.CAN_PAY_FEE);
    const fee = this.feeRepository.getOne(id)!;
    fee.setAuthor(author);
    // нотификация fee.getAuthor()
    return await this.feeRepository.save(fee);
  }
}
