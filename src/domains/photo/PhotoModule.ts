import { DataAccessService } from "../../utilites";
import { MobilenetService } from "../../utilites/MobilenetService";
import { ServerController } from "../../utilites/ServerController";
import { YCService } from "../../utilites/YCService";
import { UserFacade } from "../user/UserFacade";
import { AlbumComponent } from "./album/AlbumComponent";
import { ImageService } from "./photo/ImageService";
import { PhotoComponent } from "./photo/PhotoComponent";
import { PresenterComponent } from "./presenters/PresenterComponent";
import { RestComponent } from "./rest/RestComponent";

export class PhotoModule {
  private rest: RestComponent;
  private imageService: ImageService;
  private photoComponent: PhotoComponent;
  private presenter: PresenterComponent;
  private albumComponent: AlbumComponent;
  constructor(das: DataAccessService, server: ServerController, yc: YCService, userFacade: UserFacade) {
    const mobilenet = new MobilenetService();
    this.imageService = new ImageService();
    this.photoComponent = new PhotoComponent(das, this.imageService, yc, mobilenet);
    this.albumComponent = new AlbumComponent(das, this.photoComponent);
    this.presenter = new PresenterComponent(this.imageService, this.photoComponent.getRepository(), userFacade);
    this.rest = new RestComponent(server, this.photoComponent, this.albumComponent, this.presenter, yc, mobilenet);
  }

  async init() {
    await this.imageService.init();
    await this.photoComponent.init();
    await this.albumComponent.init();
    await this.rest.init();
  }
}
