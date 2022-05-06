import { buffer } from "stream/consumers";
import { Article } from "..";
import { ImageService } from "../ImageStore";
import { ArticleRepository } from "./ArticleRepository";

export class ArticleService {
  constructor(private articleRepository: ArticleRepository, private imageService: ImageService) {}

  async init() {}

  async create(article: Article) {
    return await this.articleRepository.create(article);
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

  async publish(articleId: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    articleRef.publish();
    return await this.articleRepository.save(articleRef);
  }

  async unpublish(articleId: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    articleRef.unpublish();
    return await this.articleRepository.save(articleRef);
  }

  async archive(articleId: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    articleRef.archive();
    return await this.articleRepository.save(articleRef);
  }

  async unarchive(articleId: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    articleRef.unarchive();
    return await this.articleRepository.save(articleRef);
  }

  async setTask(articleId: number, task: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    articleRef.setTask(task);
    return await this.articleRepository.save(articleRef);
  }

  async removeTask(articleId: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    articleRef.setTask(undefined);
    return await this.articleRepository.save(articleRef);
  }

  async setAuthor(articleId: number, author: number) {
    const articleRef = this.articleRepository.getOne(articleId);
    articleRef.setAuthor(author);
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
