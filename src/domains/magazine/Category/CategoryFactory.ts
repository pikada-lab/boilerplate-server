import { Category, CategoryLike } from "./Category";

export const CategoryFactory = (category: CategoryLike) => {
  return new Category().restore(category);
}
