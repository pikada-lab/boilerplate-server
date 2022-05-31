import { UserPresenter } from "../../user/UserPresenter";
import { ImageService } from "../photo/ImageService";
import { Photo } from "../photo/Photo";

export class PhotoPresenter {
  constructor(private image: ImageService, private user: UserPresenter) {}

  getPhoto(photo: Photo) {
    const structure = photo.toJSON();
    const path = this.image.getAllPath(structure.id!);
    const userRef = structure.userId
      ? this.user.getUserTumbanian(structure.userId)
      : undefined;
    return Object.assign(path, structure, { userRef });
  }

  mapPhoto(photo: Photo[]) {
    return photo.map((r) => this.getPhoto(r));
  }
}
