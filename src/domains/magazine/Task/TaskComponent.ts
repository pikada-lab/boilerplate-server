import { DataAccessService } from "../../../utilites";
import { ServerController } from "../../../utilites/ServerController";
import { RoleChecker } from "../Article/ArticleRestController";
import { HistoryFactory } from "../History/HistoryFactory";
import { HistoryRepository } from "../History/HistoryRepository";

export class TaskComponent {
  private historyRepository: HistoryRepository;

  constructor(das: DataAccessService, server: ServerController, roleChecker: RoleChecker) {
    this.historyRepository = new HistoryRepository(das);
    das.setFactory("History", HistoryFactory);

    
  }


  async init() {
    await this.historyRepository.init();
  }
}
