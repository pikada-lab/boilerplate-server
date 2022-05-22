import { DataAccessService } from "../../../utilites";
import { MagazineError } from "../error";
import { Category, CategoryLike } from "./Category";

export interface CategoryStore {
  findAll(): Promise<Category[]>;
  getAll(): Category[];
  findOne(id: number): Promise<Category>;
  getOne(id: number): Category;
}

export class CategoryRepository implements CategoryStore{
  private index = new Map<number, Category>();
  private indexPrevState = new Map<number, CategoryLike>();

  private table = "Categories";

  constructor(private dataAccessService: DataAccessService) {}

  async init() {
    const cache = await this.dataAccessService.select<Category[]>(this.table);
    cache?.forEach((r) => {
      this.addIndexes(r);
    });
  }

  private addIndexes(category: Category) {
    this.index.set(category.getId(), category);
    this.updateOldState(category);
  }

  private removeIndex(u: Category) {
    this.index.delete(u.getId());
    this.removeItemOldState(u.getId());
  }

  private getOldState(category: Category) {
    return this.indexPrevState.get(category.getId());
  }

  private updateOldState(category: Category) {
    this.indexPrevState.set(category.getId(), category.toJSON());
  }

  private removeItemOldState(categoryId: number) {
    this.indexPrevState.delete(categoryId);
  }

  async save(category: Category): Promise<boolean> {
    this.updateOldState(category);
    return await this.dataAccessService.updateEntity(this.table, category.getId(), category.toJSON());
  }

  async create(data: CategoryLike): Promise<Category> {
    const category = await this.dataAccessService.createEntity<Category>(
      this.table,
      Object.assign(
        Category.create(data),
        {
          updateAt: +new Date(),
          createAt: +new Date(),
        },
        data
      )
    );
    this.addIndexes(category);
    return category;
  }

  async delete(id: number): Promise<boolean> {
    const user = await this.findOne(id);
    const result = await this.dataAccessService.deleteEntity(this.table, id);
    if (result && user) this.removeIndex(user);
    return result;
  }

  async findAll(): Promise<Category[]> {
    return await this.dataAccessService.select(this.table);
  }

  getAll(): Category[] {
    return Array.from(this.index.values());
  }

  async findOne(id: number): Promise<Category> {
    return await this.dataAccessService.select(this.table, id);
  }

  getOne(id: number): Category {
    if (!this.index.has(id)) throw new MagazineError("Нет категории");
    return this.index.get(id)!;
  }
}
