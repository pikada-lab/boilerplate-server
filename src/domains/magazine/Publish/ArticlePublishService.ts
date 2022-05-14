import { RoleChecker } from "..";
import { AccessItem } from "../../user/Role/Role";
import { ArticleService } from "../Article/ArticleService";
import { TaskService } from "../Task/TaskService";

export class ArticlePublishService {
  constructor(
    private articleService: ArticleService,
    private taskService: TaskService,
    private userService: RoleChecker
  ) {}

  async init() {}

  async publish(articleId: number, initiator: number) {
    this.userService.checkUserWithThrow(initiator, AccessItem.CAN_PUBLISH_ARTICLE);
    await Promise.all([
      this.taskService.endByArticleID(articleId, initiator),
      this.articleService.publish(articleId, initiator),
    ]);
  }

  async setArticleInTask(articleId: number, taskId: number, initiator: number) {
    await Promise.all([
      this.articleService.canSetTask(articleId, taskId, initiator),
      this.taskService.canSetArticle(taskId, initiator, articleId),
    ]);
    const articleFree = this.taskService.getReleasedArticle(taskId);
    if (articleFree) {
      await this.articleService.removeTask(articleFree, initiator);
    }
    await Promise.all([
      this.taskService.setArticle(taskId, initiator, articleId),
      this.articleService.setTask(articleId, taskId),
    ]);
  }
  async setTaskInArticle(articleId: number, taskId: number, initiator: number) {
    await Promise.all([
      this.articleService.canSetTask(articleId, taskId, initiator),
      this.taskService.canSetArticle(taskId, initiator, articleId),
    ]);
    const taskFree = await this.articleService.getReleasedTask(taskId);
    if (taskFree) {
      await this.taskService.removeArticle(taskFree, initiator);
    }
    await Promise.all([
      this.taskService.setArticle(taskId, initiator, articleId),
      this.articleService.setTask(articleId, taskId),
    ]);
  }

  async removeArticleInTask(taskId: number, initiator: number) {
    const articleFree = this.taskService.getReleasedArticle(taskId);
    if (articleFree) await this.articleService.removeTask(articleFree, initiator);
    await this.taskService.removeArticle(taskId, initiator);
  }
  async removeTaskInArticle(articleId: number, initiator: number) {
    const taskFree = await this.articleService.getReleasedTask(articleId);
    if (taskFree) await this.taskService.removeArticle(taskFree, initiator); 
    await this.articleService.removeTask(articleId, initiator);
  }
}
