import { UserFacade } from "../../user/UserFacade";
import { ImageService } from "../photo/ImageService";
import { PhotoReposioryExport } from "../photo/PhotoRepository";
import { AlbumPresenter } from "./AlbumPresenter";
import { PhotoPresenter } from "./PhotoPresenter";

export class PresenterComponent {
  
  private photo: PhotoPresenter;
  private album: AlbumPresenter;

  constructor(imageService: ImageService, photoRepository: PhotoReposioryExport, userFacade: UserFacade) {
    this.photo = new PhotoPresenter(imageService, userFacade.getUserPresenter());
    this.album = new AlbumPresenter(photoRepository, this.photo, userFacade.getUserPresenter());
  }

  getPhotoPresenter() {
    return this.photo;
  }

  getAlbumPresenter() {
    return this.album;
  }
}