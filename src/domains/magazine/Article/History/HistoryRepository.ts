import { ArticleHistory } from "../..";
import { DataAccessService } from "../../../../utilites";  
import { BaseArticleHistory } from "./History";
export class HistoryRepository {

  private index = new Map<number, BaseArticleHistory>();
  private indexArticle = new Map<number, BaseArticleHistory[]>();
  private table = "ArticleHistory";

  constructor(private dataAccessService: DataAccessService) {}

  async init() {
    const cache = await this.dataAccessService.select<BaseArticleHistory[]>(this.table);
    cache?.forEach((r) => {
      this.addIndexes(r); 
    });
  }
  private addIndexes(u: BaseArticleHistory) {
    this.index.set(u.getId()!, u);
    if(!this.indexArticle.has(u.getArticle())) this.indexArticle.set(u.getArticle(), []);
    this.indexArticle.get(u.getArticle())?.push(u);
  }
  async create(data: ArticleHistory): Promise<BaseArticleHistory> {
    const hisotory = await this.dataAccessService.createEntity<BaseArticleHistory>(
      this.table,
      Object.assign(
        BaseArticleHistory.create(data),
        {
          updateAt: +new Date(),
          createAt: +new Date(),
        },
        data
      )
    );
    this.addIndexes(hisotory); 
    return hisotory;
  }

  getByArticle(id: number) {
    return this.indexArticle.get(id) ?? [];
  }

}