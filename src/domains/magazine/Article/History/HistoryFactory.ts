import { BaseArticleHistory } from "./History" 
import { ArticleHistory } from "../..";

export const HistoryFactory = (ref: ArticleHistory) => {
  return new BaseArticleHistory().restore(ref);
}