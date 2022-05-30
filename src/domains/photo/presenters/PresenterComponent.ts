import { ImageService } from "../photo/ImageService";
import { PhotoReposioryExport } from "../photo/PhotoRepository";
import { AlbumPresenter } from "./AlbumPresenter";
import { PhotoPresenter } from "./PhotoPresenter";

export class PresenterComponent {
  
  private photo: PhotoPresenter;
  private album: AlbumPresenter;

  constructor(imageService: ImageService, photoRepository: PhotoReposioryExport) {
    this.photo = new PhotoPresenter(imageService);
    this.album = new AlbumPresenter(photoRepository, this.photo);
  }

  getPhotoPresenter() {
    return this.photo;
  }

  getAlbumPresenter() {
    return this.album;
  }
}