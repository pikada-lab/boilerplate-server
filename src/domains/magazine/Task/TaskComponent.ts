
import { DataAccessService } from "../../../utilites";
import { ServerController } from "../../../utilites/ServerController"; 
import { UserFacade } from "../../user/UserFacade"; 
import { FeeFactory } from "./Fee/FeeFactory";
import { FeeRepository } from "./Fee/FeeRepository";
import { FeeService } from "./Fee/FeeService";
import { HistoryFactory } from "./History/HistoryFactory";
import { HistoryRepository } from "./History/HistoryRepository";
import { TaskFactory } from "./TaskFactory";
import { TaskPresenter } from "./TaskPresenter";
import { TaskRepository } from "./TaskRepository";
import { TaskRestController } from "./TaskRestController";
import { TaskService } from "./TaskService";

export class TaskComponent {
  private historyRepository: HistoryRepository;
  private taskRepository: TaskRepository;
  private taskService: TaskService;
  private feeService: FeeService;
  private taskPresenter: TaskPresenter;
  private rest: TaskRestController;
  private feeRepository: FeeRepository;

  constructor(das: DataAccessService, server: ServerController, faced: UserFacade) {
    this.historyRepository = new HistoryRepository(das);
    das.setFactory("TaskHistory", HistoryFactory);
    this.taskRepository = new TaskRepository(das);
    das.setFactory("Task", TaskFactory);
    this.feeRepository = new FeeRepository(das);
    das.setFactory("Fee", FeeFactory);

    this.taskPresenter = new TaskPresenter(this.historyRepository, faced);
    this.feeService = new FeeService(this.historyRepository, faced, this.feeRepository, faced);
    this.taskService = new TaskService(this.taskRepository, this.historyRepository, faced, this.feeService);
    this.rest = new TaskRestController(server, faced, this.taskRepository, this.taskService, this.taskPresenter);
  }

  async init() {
    await this.feeRepository.init();
    await this.historyRepository.init();
    await this.taskRepository.init();
    await this.taskService.init();
    await this.feeService .init();
    await this.rest.init();
  }

  getService() {
    return this.taskService;
  }
}
