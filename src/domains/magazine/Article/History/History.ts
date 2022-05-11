import { ArticleHistory } from "../..";

 

export class BaseArticleHistory {
  private  id?: number;
  private  article!: number;
  private  date!: number;
  private  user!: number;
  private  status!: string;
  private  comment!: string;

  constructor() {}

  getId() {
    return this.id;
  }
  getArticle() {
    return this.article;
  }
  static create(ref: any) {
    if(!ref.date) ref.date = new Date();
    return new BaseArticleHistory().restore(ref);
  }

  setComment(comment: string) {
    this.comment = comment;
  }

  restore(obj: ArticleHistory) {
    this.id = obj.id;
    this.article = obj.article;
    this.date = obj.date;
    this.user = obj.user;
    this.status = obj.status;
    this.comment = obj.comment;
    return this;
  }
 
  toJSON(): ArticleHistory {
    return {
      id: this.id!,
      article: this.article,
      date: this.date,
      user: this.user,
      status: this.status,
      comment: this.comment
    }
  }
}