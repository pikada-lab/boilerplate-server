 
import { ImageService } from "../photo/ImageService";
import { Photo } from "../photo/Photo";

export class PhotoPresenter {
  constructor(private image: ImageService ) {}

  getPhoto(photo: Photo) {
    const structure = photo.toJSON();
    const path = this.image.getAllPath(structure.id!);
    return Object.assign(path, structure);
  }

  mapPhoto(photo: Photo[]) {
    return photo.map(r => this.getPhoto(r));
  }
 
}