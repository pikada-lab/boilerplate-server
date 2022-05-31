import { DataAccessService } from "../../../utilites";
import { MobilenetService } from "../../../utilites/MobilenetService";
import { YCService } from "../../../utilites/YCService";
import { UserFacade } from "../../user/UserFacade";
import { ImageService } from "./ImageService";
import { MetaService } from "./MetaService";
import { PhotoFactory } from "./PhotoFactory";
import { PhotoReposiory, PhotoReposioryExport } from "./PhotoRepository";
import { PhotoService } from "./PhotoService";

export class PhotoComponent {
  private repository: PhotoReposiory;
  private meta: MetaService;
  private service: PhotoService;
  constructor(das: DataAccessService, imageService: ImageService, yc: YCService, mobile: MobilenetService, userFacade: UserFacade) {
    this.repository = new PhotoReposiory(das);
    this.meta = new MetaService(yc, mobile);
    this.service = new PhotoService(this.repository, this.meta, imageService, userFacade);
    
    das.setFactory("Photo", PhotoFactory);
  }

  async init() {
    await this.repository.init();
    await this.meta.init();
    await this.service.init();
  }

  getService() {
    return this.service;
  }

  getRepository(): PhotoReposioryExport {
    return this.repository;
  }
}
