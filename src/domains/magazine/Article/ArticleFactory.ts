import { Article } from "..";
import { BaseArticle } from "./Article";

export const ArticleFactory = (article: Article) => {
  return new BaseArticle().restore(article);
}