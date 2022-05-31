import { DataAccessService } from "../../../utilites";
import { UserFacade } from "../../user/UserFacade";
import { PhotoComponent } from "../photo/PhotoComponent";
import { AlbumFactory } from "./AlbumFactory";
import { AlbumExportRepository, AlbumRepository } from "./AlbumRepository";
import { AlbumService } from "./AlbumService";
import { AlbumUploadService } from "./AlbumUploadService";

export class AlbumComponent {
  private repository: AlbumRepository;
  private service: AlbumService;
  private uploadService: AlbumUploadService;
 

  constructor(das: DataAccessService, photoComponent: PhotoComponent, userFacade: UserFacade) {
    das.setFactory("Album", AlbumFactory);
    this.repository = new AlbumRepository(das);
    this.service = new AlbumService(this.repository, userFacade);
    this.uploadService = new AlbumUploadService(this.repository, photoComponent.getService(),  photoComponent.getRepository());
  }

  async init() {
    await this.repository.init(); 
    await this.service.init();
    await this.uploadService.init();
  }

  getService() {
    return this.service;
  }

  getRepository(): AlbumExportRepository {
    return this.repository;
  }

  getUploadService() {
    return this.uploadService;
  }
}