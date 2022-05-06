import { HistoryRepository } from "../History/HistoryRepository";
import { TaskRepository } from "./TaskRepository";

export class TaskService {
  constructor(
    private taskRepository: TaskRepository, 
    private historyRepository: HistoryRepository
  ) {}

  async init() {

  }

  
}