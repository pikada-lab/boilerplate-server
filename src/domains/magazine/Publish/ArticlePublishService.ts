import { RoleChecker } from "..";
import { AccessItem } from "../../user/Role/Role";
import { ArticleService } from "../Article/ArticleService";
import { TaskRepository } from "../Task/TaskRepository";
import { TaskService } from "../Task/TaskService";

export class ArticlePublishService {
  constructor(
    private articleService: ArticleService,
    private taskRepository: TaskRepository,
    private taskService: TaskService,
    private userService: RoleChecker
  ) {}

  async init() {}

  async publish(articleId: number, initiator: number) {
    this.userService.checkUserWithThrow(initiator, AccessItem.CAN_PUBLISH_ARTICLE);
    this.canArticlePublish(articleId, initiator);
    if (this.taskRepository.hasInArticle(articleId)) {
      const taskId = this.canTaskFinishAndGetTaskID(articleId, initiator);
      const article = await this.publicshArticle(articleId, initiator);
      await this.closeTask(taskId, initiator);
      return article;
    } else {
      return await this.publicshArticle(articleId, initiator);
    }
  }

  private canArticlePublish(articleId: number, initiator: number) {
    const articleBefore = this.articleService.getOne(articleId);
    articleBefore.canPublish(initiator);
  }
  private canTaskFinishAndGetTaskID(articleId: number, initiator: number) {
    const task = this.taskRepository.getByArticle(articleId);
    task.canEnd(initiator);
    return task.getId()!;
  }
  private async publicshArticle(articleId: number, initiator: number) {
    return await this.articleService.publish(articleId, initiator);
  }

  private async closeTask(taskId: number, initiator: number) {
    await this.taskService.end(taskId, initiator);
  }

  async setArticleInTask(articleId: number, taskId: number, initiator: number) {
    if (this.taskRepository.hasInArticle(articleId)) throw new Error("Статья уже закреплена");
    await this.taskService.canSetArticle(taskId, initiator, articleId);
    // const articleFree = this.taskService.getReleasedArticle(taskId);
    // Возможно уведомление отправить
    await this.taskService.setArticle(taskId, initiator, articleId);
    // Возможно уведомление отправить
  }

  async removeArticleInTask(taskId: number, initiator: number) {
    // const articleFree = this.taskService.getReleasedArticle(taskId);
    // Возможно уведомление отправить
    await this.taskService.removeArticle(taskId, initiator);
  }
}
