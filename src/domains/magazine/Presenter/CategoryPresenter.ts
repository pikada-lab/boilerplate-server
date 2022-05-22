import { Category, CategoryLike } from "../Category/Category";

export class CategoryPresentor {
  constructor() {}

  mapFull(categories: Category[]): CategoryLike[] {
    return categories.map(c => this.full(c));
  }
 
  full(category: Category): CategoryLike {
    return category.toJSON();
  }
}