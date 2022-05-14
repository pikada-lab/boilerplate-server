
import { DataAccessService } from "../../../utilites"; 
import { UserFacade } from "../../user/UserFacade";  
import { FeeFactory } from "./Fee/FeeFactory";
import { FeeRepository } from "./Fee/FeeRepository";
import { FeeService } from "./Fee/FeeService";
import { HistoryFactory } from "./History/HistoryFactory";
import { HistoryRepository } from "./History/HistoryRepository";
import { TaskFactory } from "./TaskFactory"; 
import { TaskRepository } from "./TaskRepository"; 
import { TaskService } from "./TaskService";

export class TaskComponent {
  private historyRepository: HistoryRepository;
  private taskRepository: TaskRepository;
  private taskService: TaskService;
  private feeService: FeeService;  
  private feeRepository: FeeRepository;

  constructor(das: DataAccessService, faced: UserFacade) {
    this.historyRepository = new HistoryRepository(das);
    das.setFactory("TaskHistory", HistoryFactory);
    this.taskRepository = new TaskRepository(das);
    das.setFactory("Task", TaskFactory);
    this.feeRepository = new FeeRepository(das);
    das.setFactory("Fee", FeeFactory);
 
    this.feeService = new FeeService(this.historyRepository, faced, this.feeRepository, faced);
    this.taskService = new TaskService(this.taskRepository, this.historyRepository, faced, this.feeService); 
  }

  async init() {
    await this.feeRepository.init();
    await this.historyRepository.init();
    await this.taskRepository.init();
    await this.taskService.init();
    await this.feeService .init(); 
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
