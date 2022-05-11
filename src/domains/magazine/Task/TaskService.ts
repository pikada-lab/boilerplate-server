import { RoleChecker } from "..";
import { AccessItem } from "../../user/Role/Role"; 
import { TaskError } from "../error";
import { FeeService } from "./Fee/FeeService";
import { HistoryRepository } from "./History/HistoryRepository";
import { AuthorTask } from "./Task";
import { TaskRepository } from "./TaskRepository";

export class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private historyRepository: HistoryRepository,
    private roleChecker: RoleChecker,
    private feeService: FeeService,
  ) {}

  async init() {}

  async create(editor: number) {
    this.roleChecker.checkUserWithThrow(editor, AccessItem.CAN_CREATE_ARTICLE);
    const task = await this.taskRepository.create({ editor });
    await this.historyRepository.create(task.createHistory(editor));
    return task;
  }

  async editDescription(id: number, editor: number, ref: any) {
    const task = this.taskRepository.getOne(id);
    const history = task.setDescription(editor, ref);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  async setFee(id: number, editor: number, feeValue: number) {
    const task = this.taskRepository.getOne(id);
    const history = task.setFee(editor, feeValue);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  async setDateEnd(id: number, editor: number, date: string | number | Date) {
    const task = this.taskRepository.getOne(id);
    const history = task.setDateEnd(editor, date);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  async setAuthor(id: number, initiator: number, author?: number) {
    if (author) this.checkCanUserHaveTask(author);

    const task = this.taskRepository.getOne(id);
    if (task.isBelongAuthor(author!)) {
      throw new TaskError("Автор уже установлен");
    }

    if (initiator !== author) {
      this.checkCanUserPutAuthorInTask(initiator);
      if (!task.isBelongEditor(initiator))
        throw new TaskError(
          "Если автора устанавливает редактор, то редактор должен быть ответственным за это задание"
        );
    }

    task.setAuthor(author);
    await this.taskRepository.save(task);
    await this.historyRepository.create(
      task.createHistory(initiator, "Автор был изменён")
    );
    return task;
  }

  async setArticle(id: number, initiator: number, article?: number) {
    this.roleChecker.checkUserWithThrow(initiator, AccessItem.CAN_SEE_TASKS);
    const task = this.taskRepository.getOne(id);

    if (task.getArticle() === article) {
      throw new TaskError("Статья уже закреплена");
    }

    this.checkCanPinArticle(task, initiator);
    task.setArticle(article);
    await this.taskRepository.save(task);
    await this.historyRepository.create(
      task.createHistory(initiator, "Была закреплена статья")
    );
    return task;
  }

  async changeEditor(id: number, initiator: number, editor?: number) {
    const task = this.taskRepository.getOne(id);
    if (task.getEditor() === editor)
      throw new TaskError("Редактор уже установлен");
    let comment = "";
    if (task.getEditor() === initiator && !editor) {
      comment = await this.removeSelfEditor(task);
    } else if (!editor) {
      comment = await this.removeEditor(task, initiator);
    } else {
      comment = await this.replaceEditor(task, initiator, editor);
    }
    await this.taskRepository.save(task);
    await this.historyRepository.create(task.createHistory(initiator, comment));
    return task;
  }

  /** Редактор задание публикует на стену */
  async publish(id: number, editor: number) {
    const task = this.taskRepository.getOne(id);
    const history = task.publish(editor);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  /** Задание снимается со стены */
  async unpublish(id: number, editor: number) {
    const task = this.taskRepository.getOne(id);
    const history = task.unpublish(editor);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  /** Автор закрепляет задание за собой */
  async distribute(id: number, author: number) {
    this.checkCanUserHaveTask(author);
    const task = this.taskRepository.getOne(id);
    const history = task.distribute(author);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  /** Автор отказывается от статьи */
  async refuse(id: number, author: number) {
    const task = this.taskRepository.getOne(id);
    const history = task.refuse(author);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  /** Автор отправляет статью на проверку */
  async sendToResolve(id: number, author: number) {
    const task = this.taskRepository.getOne(id);
    const history = task.sendToResolve(author);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  /** Автор отзывает статью с проверки */
  async revision(id: number, author: number) {
    const task = this.taskRepository.getOne(id);
    const history = task.revision(author);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  /** Редактор отклоняет статью */
  async reject(id: number, editor: number, comment: string) {
    const task = this.taskRepository.getOne(id);
    const history = task.reject(editor);
    await this.taskRepository.save(task);
    history.comment = comment;
    await this.historyRepository.create(history);
    return task;
  }

  /** Редактор принимает статью  */
  async resolve(id: number, editor: number) {
    const task = this.taskRepository.getOne(id);
    const history = task.resolve(editor);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  /** Статья прикреплённая к заданию была опубликовано, задание считается выполненным */
  async end(id: number, editor: number) {
    //// происходит после поубликации 
    const task = this.taskRepository.getOne(id);
    const history = task.end(editor);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  async endByArticleID(articleId: number, editor: number) {
    const task = this.taskRepository.getByArticle(articleId);
    if(!task) return false;
    await this.end(task.getId()!, editor);
    await this.feeService.pushFeeForTask(task, "");
    return true;
  }

  /** Редактор отменил задание */
  async cancel(id: number, editor: number) {
    const task = this.taskRepository.getOne(id);
    const history = task.cancel(editor);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  /** Редактор отправляет задание в архив */
  async archive(id: number, editor: number) {
    const task = this.taskRepository.getOne(id);
   const history = task.archive(editor);
    await this.taskRepository.save(task);
    await this.historyRepository.create(history);
    return task;
  }

  private async removeSelfEditor(task: AuthorTask) {
    task.setEditor();
    await this.taskRepository.save(task);
    return "Редактор отказался от задачи";
  }

  private async removeEditor(task: AuthorTask, initiator: number) {
    this.checkCanUserPutEditorInTask(initiator);
    task.setEditor();
    return "Ответственный редактор был удалён администрацией";
  }

  private async replaceEditor(
    task: AuthorTask,
    initiator: number,
    editor: number
  ) {
    if (task.getEditor()) this.checkCanUserPutEditorInTask(initiator);
    this.checkCanUserBeEditorInTask(editor);
    task.setEditor(editor);
    return "Задание было переданно другому редактору";
  }

  

  /**
   * Проверяем, можно ли пользователю иметь статьи
   * @param author - автор, который будет исполнять задание
   */
  private checkCanUserHaveTask(author: number) {
    this.roleChecker.checkUserWithThrow(author, AccessItem.CAN_HAVE_TASK);
  }

  /**
   * Проверяем, можно ли пользователю устанавливать автора в статьи
   * @param editor - Редактор, который будет исполнять задание
   */
  private checkCanUserPutAuthorInTask(editor: number) {
    this.roleChecker.checkUserWithThrow(
      editor,
      AccessItem.CAN_PUT_AUTHOR_IN_TASK
    );
  }

  /**
   * Проверяем, можно ли пользователю устанавливать редакторов
   * @param editor - Редактор, который будет исполнять задание
   */
  private checkCanUserPutEditorInTask(editor: number) {
    this.roleChecker.checkUserWithThrow(
      editor,
      AccessItem.CAN_PUT_EDITOR_IN_TASK
    );
  }
  /**
   * Проверяем, можно ли пользователю быть редактором
   * @param editor - Редактор, который будет исполнять задание
   */
  private checkCanUserBeEditorInTask(editor: number) {
    this.roleChecker.checkUserWithThrow(
      editor,
      AccessItem.CAN_BE_EDITOR_IN_TASK
    );
  }

  /**
   * Проверяет, может ли инициатор закрепить статью в задание
   *
   * Это может делать либо автор, либо ответственный редактор
   * @param task Задание
   * @param initiator тот, кто закрепляет статью за заданием
   */
  private checkCanPinArticle(task: AuthorTask, initiator: number) {
    if (task.getAuthor() !== initiator && task.getEditor() !== initiator) {
      throw new TaskError(
        "Не позволено, закреплять статью может только автор или ответственный редактор"
      );
    }
  }
}
