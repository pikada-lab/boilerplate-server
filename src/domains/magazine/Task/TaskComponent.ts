import { DataAccessService } from "../../../utilites";
import { UserFacade } from "../../user/UserFacade";
import { FeeComponent } from "../Fee/FeeComponent";
import { HistoryFactory } from "./History/HistoryFactory";
import { HistoryRepository } from "./History/HistoryRepository";
import { TaskFactory } from "./TaskFactory";
import { TaskRepository } from "./TaskRepository";
import { TaskService } from "./TaskService";

export class TaskComponent {
  private historyRepository: HistoryRepository;
  private taskRepository: TaskRepository;
  private taskService: TaskService;

  constructor(das: DataAccessService, faced: UserFacade, fee: FeeComponent) {
    this.historyRepository = new HistoryRepository(das);
    das.setFactory("TaskHistory", HistoryFactory);
    this.taskRepository = new TaskRepository(das);
    das.setFactory("Task", TaskFactory);

    this.taskService = new TaskService(this.taskRepository, this.historyRepository, faced, fee.getService());
  }

  async init() {
    await this.historyRepository.init();
    await this.taskRepository.init();
    await this.taskService.init();
  }

  getService() {
    return this.taskService;
  }
  getRepository() {
    return this.taskRepository;
  }

  getHistory(taskId: number) {
    return this.historyRepository.getByTask(taskId);
  }
}
