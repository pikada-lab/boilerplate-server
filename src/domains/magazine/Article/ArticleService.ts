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

  getOne(id: number) {
    return this.articleRepository.getOne(id);
  }
  getTumbanian() {
    return this.articleRepository.getAll().map((a) => a.tumbanian());
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
    const articleRef = this.articleRepository.getOne(articleId);
    const history = articleRef.publish(initiator);
    const res = await this.articleRepository.save(articleRef);
    await this.historyRepository.create(history);
    if (!res) throw new ArticleError("Не удалось сохранить");

    await this.upgradeTrainee(articleRef.getAuthor()!);
    await this.userFacad.send(
      articleRef.getAuthor()!,
      `Ваша статья опубликована`,
      `<p>Привет @user${articleRef.getAuthor()}</p><p>Ваша статья @article${articleRef.getId()} опубликована.</p>`
    );

    return articleRef;
  }

  private async upgradeTrainee(authorId: number) {
    const countArticles = this.countPublishArticleByAuthor(authorId);
    if (countArticles === 3) {
      await this.userFacad.upgradeTrainee(authorId);
    }
  }
  private countPublishArticleByAuthor(authorId: number) {
    return this.articleRepository.getByAuthor(authorId).length || 0;
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
      `<p>Привет @user${articleRef.getAuthor()}</p><p>Ваша статья @article${articleRef.getId()} была снята с публикации.</p>`
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
