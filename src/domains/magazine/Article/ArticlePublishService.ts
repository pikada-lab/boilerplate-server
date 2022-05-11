import { RoleChecker } from ".."; 
import { AccessItem } from "../../user/Role/Role";  
import { TaskService } from "../Task/TaskService";
import { ArticleService } from "./ArticleService";

export class ArticlePublishService {
  constructor(
    private articleService: ArticleService,
    private taskService: TaskService,  
    private userService: RoleChecker
  ) {}

  async init() {
      
  }
  
  async publish(articleId: number, initiator: number) {
    this.userService.checkUserWithThrow(initiator, AccessItem.CAN_PUBLISH_ARTICLE);
    await this.taskService.endByArticleID(articleId, initiator);
    await this.articleService.publish(articleId, initiator);
  }
}
