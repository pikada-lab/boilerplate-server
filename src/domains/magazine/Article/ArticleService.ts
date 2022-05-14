import { Article } from "..";
import { AccessItem } from "../../user/Role/Role";
import { UserFacade } from "../../user/UserFacade";
import { ArticleError, TaskError } from "../error";
import { ImageService } from "../ImageStore";
import { TaskService } from "../Task/TaskService";
import { ArticleRepository } from "./ArticleRepository";
import { HistoryRepository } from "./History/HistoryRepository";

export class ArticleService {
  constructor(
    private articleRepository: ArticleRepository,
    private imageService: ImageService,
    private userFacad: UserFacade,
    private historyRepository: HistoryRepository
  ) {}

  async init() {}

  async create(article: Article, initiator: number) {
    // TODO: Нужно добавить редактора на этапе создания, выбор редактора должен как то зависить от пользователя или нагрузки или задания
    const ref = await this.articleRepository.create(article);
    const history = ref.createHistory(initiator);
    await this.historyRepository.create(history);
    return ref;
  }

  getTumbanian() {
    return this.articleRepository.getAll().map((a) => a.tumbanian());
  }

  getOneByTaskId(id: number) {
    return this.articleRepository.getByTask(id);
  }

  async save(article: Article) {
    const articleRef = this.articleRepository.getOne(article.id);
    articleRef.setTitle(article.title);
    articleRef.setDescription(article.description);
    articleRef.setText(article.text);
    articleRef.setKey(article.keywords);

    articleRef.setNick(article.nick);
    articleRef.setPhotographer(article.photographer);
    articleRef.setSource(article.source);

    await this.articleRepository.save(articleRef);
    return articleRef;
  }

  async publish(articleId: number, initiator: number) {
    this.userFacad.checkUserWithThrow(initiator, AccessItem.CAN_PUBLISH_ARTICLE);
    const articleRef = this.articleRepository.getOne(articleId);
    const history = articleRef.publish(initiator);
    const res = await this.articleRepository.save(articleRef);
    await this.historyRepository.create(history);
    if (!res) throw new ArticleError("Не удалось сохранить");
    const articles = this.articleRepository.getByAuthor(articleRef.getAuthor()!);
    // TODO Вынести количество статей для повышения стажёров в настройки сайта
    // СТРАТЕГИЯ
    if (articles.length === 3) {
      await this.userFacad.upgradeTrainee(articleRef.getAuthor()!);
    }
    await this.userFacad.send(
      articleRef.getAuthor()!,
      "Ваша статья опубликована",
      `<p>Привет #USER${articleRef.getAuthor()}</p><p>Ваша статья #ARTICLE${articleRef.getId()} опубликована.</p>`
    );
    return res;
  }

  async unpublish(articleId: number, initiator: number) {
    this.userFacad.checkUserWithThrow(initiator, AccessItem.CAN_PUBLISH_ARTICLE);
    this.userFacad.checkUserWithThrow(initiator, AccessItem.CAN_PUBLISH_ARTICLE);
    const articleRef = this.articleRepository.getOne(articleId);
    const history = articleRef.unpublish(initiator);
    const res = await this.articleRepository.save(articleRef);
    await this.historyRepository.create(history);
    if (!res) throw new ArticleError("Не удалось сохранить");
    await this.userFacad.send(
      articleRef.getAuthor()!,
      "Ваша статья снята с публикации",
      `<p>Привет #USER${articleRef.getAuthor()}</p><p>Ваша статья #ARTICLE${articleRef.getId()} была снята с публикации.</p>`
    );
    return res;
  }

  async archive(articleId: number, initiator: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    const history = articleRef.archive(initiator);
    const res = await this.articleRepository.save(articleRef);
    if (!res) throw new ArticleError("Не удалось сохранить");
    await this.historyRepository.create(history);
    return articleRef;
  }

  async unarchive(articleId: number, initiator: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    const history = articleRef.unarchive(initiator);
    const res = await this.articleRepository.save(articleRef);
    if (!res) throw new ArticleError("Не удалось сохранить");
    await this.historyRepository.create(history);
    return articleRef;
  }

  async canSetTask(articleId: number, task: number, initiator: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    if (articleRef.getAuthor() != initiator && articleRef.getEditor() != initiator && initiator != 1)
      throw new ArticleError("Не позволено");
    if (articleRef.getTask() === task) throw new TaskError("Статья уже закреплена за задачей");
  } 
  
 async getReleasedTask(articleId: number) {
  const articleRef = this.articleRepository.getOne(articleId);
  return articleRef ? articleRef.getTask() : undefined
 }
  async setTask(articleId: number, task: number) {
    const articleRef = this.articleRepository.getOne(articleId); 
    articleRef.setTask(task);
    return await this.articleRepository.save(articleRef);
  }

  async removeTask(articleId: number, initiator: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    if(articleRef.getStatus() != "CREATED") throw new TaskError("Статья уже опубликована");
    articleRef.setTask(undefined);
    return await this.articleRepository.save(articleRef);
  }

  async setAuthor(articleId: number, author: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    articleRef.setAuthor(author);
    return await this.articleRepository.save(articleRef);
  }
  async setEditor(articleId: number, editor: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    articleRef.setEditor(editor);
    return await this.articleRepository.save(articleRef);
  }

  async removeAuthor(articleId: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    articleRef.setAuthor(undefined);
    return await this.articleRepository.save(articleRef);
  }

  async changeCategory(articleId: number, categoryId: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    articleRef.setCategory(categoryId);
    return await this.articleRepository.save(articleRef);
  }

  async uploadPhotoImage(articleId: number, buf: Buffer) {
    const articleRef = this.articleRepository.getOne(articleId);
    const { originalPath, sq, hl, hs, vl, vs } = await this.imageService.saveNormal(articleId, buf);
    articleRef.setImages(sq, hl, hs, vl, vs);
    await this.articleRepository.save(articleRef);
    return { originalPath, sq, hl, hs, vl, vs };
  }

  async uploadExtraLargeImage(articleId: number, buf: Buffer) {
    const articleRef = this.articleRepository.getOne(articleId);
    const { originalPath, el } = await this.imageService.saveCover(articleId, buf);
    articleRef.setCover(el);
    await this.articleRepository.save(articleRef);
    return { el };
  }

  async removeExtraLargeImage(articleId: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    await this.imageService.removeNormalImage(articleId);
    articleRef.setCover();
    return await this.articleRepository.save(articleRef);
  }
}
