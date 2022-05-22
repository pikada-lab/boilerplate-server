import { DataAccessService } from "../../../utilites";
import { CategoryFactory } from "./CategoryFactory";
import { CategoryRepository, CategoryStore } from "./CategoryRepository";
import { CategoryService } from "./CategoryService";

export class CategoryComponent {
  categoryRepository: CategoryRepository;
  categoryService: CategoryService;


  constructor(das: DataAccessService) {
    this.categoryRepository = new CategoryRepository(das);
    this.categoryService = new CategoryService(this.categoryRepository);
    das.setFactory("Categories", CategoryFactory);
  }

  async init() {
    await this.categoryRepository.init();
    await this.categoryService.init();
  }


  getCategoryRepository(): CategoryStore {
    return this.categoryRepository;
  }

  getCategoryService() {
    return this.categoryService;
  }
}