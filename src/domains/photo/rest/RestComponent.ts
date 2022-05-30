import { MobilenetService } from "../../../utilites/MobilenetService";
import { ServerController } from "../../../utilites/ServerController";
import { YCService } from "../../../utilites/YCService";
import { AlbumComponent } from "../album/AlbumComponent";
import { PhotoComponent } from "../photo/PhotoComponent";
import { PresenterComponent } from "../presenters/PresenterComponent";
import { AlbumRestController } from "./AlbumRestController";
import { PhotoRestController } from "./PhotoRestController";

export class RestComponent {
  private photoRestController: PhotoRestController;
  private albumRestController: AlbumRestController;
  constructor(
    server: ServerController,
    photo: PhotoComponent,
    album: AlbumComponent,
    presenter: PresenterComponent,
    yc: YCService,
    mobile: MobilenetService
  ) {
    this.photoRestController = new PhotoRestController(
      server,
      photo.getService(),
      photo.getRepository(),
      presenter.getPhotoPresenter(),
      yc,
      mobile
    );
    this.albumRestController = new AlbumRestController(server, album, photo, presenter.getAlbumPresenter());
  }

  async init() {
    await this.photoRestController.init();
    await this.albumRestController.init();
  }
}
