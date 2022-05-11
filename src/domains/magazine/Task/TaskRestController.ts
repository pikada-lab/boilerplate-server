import { RoleChecker } from "..";
import {
  RestAuthorizationRequest,
  RestRequest,
  ServerController,
} from "../../../utilites/ServerController";
import { AccessItem } from "../../user/Role/Role"; 
import { TaskPresenter } from "./TaskPresenter";
import { TaskRepository } from "./TaskRepository";
import { TaskService } from "./TaskService";

export class TaskRestController {
  constructor(
    private server: ServerController,
    private roleChecker: RoleChecker,
    private taskRepository: TaskRepository, 
    private taskService: TaskService,
    private taskPresenter: TaskPresenter
  ) {}

  async init() {
    this.setRequestController();
    this.setCommandController();
  }

  //#region request controls
  private setRequestController() {
    this.server.getAuth("/v1/task/", async (req) => this.getAll(req));
    this.server.getAuth("/v1/task/:id", async (req) => this.getById(req));
    this.server.getAuth("/v1/task/author/:id", async (req) =>
      this.getByAuthorId(req)
    );
    this.server.getAuth("/v1/task/editor/:id", async (req) =>
      this.getByEditorId(req)
    );
    this.server.getAuth("/v1/task/article/:id", async (req) =>
      this.getByArticleId(req)
    );
  }

  async getAll(req: RestRequest & RestAuthorizationRequest) {
    /// req.query
    this.roleChecker.checkUserWithThrow(
      req.payload.id,
      AccessItem.CAN_SEE_TASKS
    );

    const tasks = this.taskRepository
      .getAll()
      .map((t) => this.taskPresenter.forEditor(t));

    return tasks;
  }

  async getById(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params.id;
    this.checkNumber(id);
    this.roleChecker.checkUserWithThrow(
      req.payload.id,
      AccessItem.CAN_SEE_TASKS
    );
    const task = this.taskRepository.getOne(id);
    return this.taskPresenter.forEditor(task);
  }

  async getByAuthorId(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params.id;
    this.checkNumber(id);
    this.roleChecker.checkUserWithThrow(
      req.payload.id,
      AccessItem.CAN_SEE_TASKS
    );
    const tasks = this.taskRepository.getByAuthor(id);
    return this.taskPresenter.forAuthor(tasks);
  }

  async getByEditorId(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params.id;
    this.checkNumber(id);
    this.roleChecker.checkUserWithThrow(
      req.payload.id,
      AccessItem.CAN_SEE_TASKS
    );
    const tasks = this.taskRepository.getByEditor(id);
    return this.taskPresenter.forEditor(tasks);
  }
  async getByArticleId(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params.id;
    this.checkNumber(id);
    this.roleChecker.checkUserWithThrow(
      req.payload.id,
      AccessItem.CAN_SEE_TASKS
    );
    const task = this.taskRepository.getByArticle(id);
    return this.taskPresenter.forEditor(task);
  }
  private checkNumber(num: number) {
    if (+num != num) throw new Error("Номер не число");
    if (num <= 0) throw new Error("Связь меньше или равна нулю");
  }

  private setCommandController() {
    this.server.postAuth("/v1/task/", async (req) => this.create(req));
    this.server.patchAuth("/v1/task/:id", async (req) => this.edit(req));

    this.server.patchAuth("/v1/task/:id/publish", async (req) =>
      this.publish(req)
    );
    this.server.patchAuth("/v1/task/:id/unpublish", async (req) =>
      this.unpublish(req)
    );
    this.server.patchAuth("/v1/task/:id/distribute", async (req) =>
      this.distribute(req)
    );
    this.server.patchAuth("/v1/task/:id/refuse", async (req) =>
      this.refuse(req)
    );
    this.server.patchAuth("/v1/task/:id/sendToResolve", async (req) =>
      this.sendToResolve(req)
    );
    this.server.patchAuth("/v1/task/:id/revision", async (req) =>
      this.revision(req)
    );
    this.server.patchAuth("/v1/task/:id/reject", async (req) =>
      this.reject(req)
    );
    this.server.patchAuth("/v1/task/:id/resolve", async (req) =>
      this.resolve(req)
    );
    // !Первая публикация статьи 
    this.server.patchAuth("/v1/task/:id/cancel", async (req) =>
      this.cancel(req)
    );
    this.server.patchAuth("/v1/task/:id/archive", async (req) =>
      this.archive(req)
    );

    this.server.patchAuth("/v1/task/:id/set/fee", async (req) =>
      this.setFee(req)
    );
    this.server.patchAuth("/v1/task/:id/set/author", async (req) =>
      this.setAuthor(req)
    );
    this.server.patchAuth("/v1/task/:id/set/editor", async (req) =>
      this.setEditor(req)
    );
    this.server.patchAuth("/v1/task/:id/set/article", async (req) =>
      this.setAticle(req)
    );
    this.server.patchAuth("/v1/task/:id/set/dateEnd", async (req) =>
      this.setDateEnd(req)
    );
  }

  private async create(req: RestAuthorizationRequest & RestRequest) {
    const editor = +req.payload.id;
    this.checkNumber(editor);
    this.roleChecker.checkUserWithThrow(editor, AccessItem.CAN_CREATE_TASK);
    const task = await this.taskService.create(editor);
    return this.taskPresenter.forEditor(task);
  }

  private async edit(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const task = await this.taskService.editDescription(
      taskId,
      initiator,
      req.body
    );
    return this.taskPresenter.forEditor(task);
  }

  private async publish(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const task = await this.taskService.publish(taskId, initiator);
    return this.taskPresenter.forEditor(task);
  }
  private async unpublish(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const task = await this.taskService.unpublish(taskId, initiator);
    return this.taskPresenter.forEditor(task);
  }
  private async distribute(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const task = await this.taskService.distribute(taskId, initiator);
    return this.taskPresenter.forEditor(task);
  }

  private async refuse(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const task = await this.taskService.refuse(taskId, initiator);
    return this.taskPresenter.forEditor(task);
  }

  private async sendToResolve(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const task = await this.taskService.sendToResolve(taskId, initiator);
    return this.taskPresenter.forEditor(task);
  }

  private async revision(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const task = await this.taskService.revision(taskId, initiator);
    return this.taskPresenter.forEditor(task);
  }

  private async reject(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const comment = req.body?.comment ?? "";
    const task = await this.taskService.reject(taskId, initiator, comment);
    return this.taskPresenter.forEditor(task);
  }

  private async resolve(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const task = await this.taskService.resolve(taskId, initiator);
    return this.taskPresenter.forEditor(task);
  }

  private async cancel(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const task = await this.taskService.cancel(taskId, initiator);
    return this.taskPresenter.forEditor(task);
  }
  private async archive(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const task = await this.taskService.archive(taskId, initiator);
    return this.taskPresenter.forEditor(task);
  }
  private async setFee(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const fee = +(req.body?.fee ?? 0);
    const task = await this.taskService.setFee(taskId, initiator, fee);
    return this.taskPresenter.forEditor(task);
  }
  private async setAuthor(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const author = +req.body?.author || undefined;
    const task = await this.taskService.setAuthor(taskId, initiator, author);
    return this.taskPresenter.forEditor(task);
  }
  private async setEditor(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const editor = +req.body?.editor || undefined;
    const task = await this.taskService.changeEditor(taskId, initiator, editor);
    return this.taskPresenter.forEditor(task);
  }

  private async setAticle(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const article = +req.body?.article || undefined;
    const task = await this.taskService.setArticle(taskId, initiator, article);
    return this.taskPresenter.forEditor(task);
  }
  private async setDateEnd(req: RestAuthorizationRequest & RestRequest) {
    const { initiator, taskId } = this.getInitiatorWithTaskID(req);
    const date = req.body?.dateEnd;
    if(!date) throw new Error("Нет даты");
    const task = await this.taskService.setDateEnd(taskId, initiator, date);
    return this.taskPresenter.forEditor(task);
  }
 
 
  private getInitiatorWithTaskID(req: RestAuthorizationRequest & RestRequest) {
    const initiator = +req.payload.id;
    this.checkNumber(initiator);
    const taskId = +req.params.id;
    this.checkNumber(taskId);
    return { initiator, taskId };
  }
}
