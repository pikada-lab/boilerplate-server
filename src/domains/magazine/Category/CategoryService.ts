import { CategoryAbout, CategoryLike } from "./Category";
import { CategoryRepository } from "./CategoryRepository";

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async init() { }
  async order(pair: number[]) {
    const command = [];
    for (let [order, id] of pair.entries()) {
      const category = this.categoryRepository.getOne(id);
      category.setOrder(order);
      command.push(this.categoryRepository.save(category));
    }
    await Promise.all(command);
    return true;
  }

  async add(category: CategoryLike) {
    return await this.categoryRepository.create(category);
  }

  async edit(id: number, categoryAbout: CategoryAbout) {
    const category = this.categoryRepository.getOne(id);
    category.edit(categoryAbout.name, categoryAbout.about);
    return await this.categoryRepository.save(category);
  }

  async publish(id: number) {
    const category = this.categoryRepository.getOne(id);
    category.publish();
    return await this.categoryRepository.save(category);
  }

  async unpublish(id: number) {
    const category = this.categoryRepository.getOne(id);
    category.unpublish();
    return await this.categoryRepository.save(category);
  }

  async delete(id: number) {
    return await this.categoryRepository.delete(id);
  }


}
