import { ImageService } from "./ImageService";
import { MetaService } from "./MetaService";
import { MetaDescriptionsPhoto, Photo } from "./Photo";
import { PhotoReposiory } from "./PhotoRepository";

export class PhotoService {
  private immediateTags = false;
  private executeTagged = false;
  private moderate = false;
  constructor(private photoRepository: PhotoReposiory, private meta: MetaService, private imageService: ImageService) {}

  async init() {}
  async upload(buffer: Buffer, initiator: number, albumId?: number) {
    const smallBuffer = await this.imageService.getSmallBuffer(buffer);
    console.log("get small buffer", smallBuffer.length);
    if (this.moderate) await this.meta.moderate(smallBuffer);
    console.log("Premoderation executed");
    const photo = await this.add(initiator, albumId);
    console.log("photo aded", photo);
    const { originalPath, sq, el } = await this.imageService.saveNormal(photo.getId(), buffer);
    console.log("image saved", el);
    await this.photoRepository.save(photo.setURL(el));
    console.log("photo saved", el);
    if (this.executeTagged) await this.tagged(photo, smallBuffer);
    return photo;
  }

  async tagged(photo: Photo, smallBuffer: Buffer) {
    if (this.immediateTags) {
      try {
        await this.taskAfterUpload(photo.getId(), smallBuffer);
      } catch (ex) {
        console.log(photo.getId(), ex);
      }
    } else {
      this.taskAfterUpload(photo.getId(), smallBuffer)
        .then(() => console.log(photo.getId(), "task done"))
        .catch((ex) => {
          console.log(photo.getId(), ex);
        });
    }
  }

  async save(id: number, initiator: number, meta: MetaDescriptionsPhoto) {
    const photo = this.photoRepository.getOne(id);
    // if(photo.getUser() != initiator) throw new Error("You can't edit it");
    photo.setMetadata(meta);
    return await this.photoRepository.save(photo);
  }

  async taskAfterUpload(photoID: number, smallBuffer: Buffer) {
    const tags = await this.meta.getTag(smallBuffer);
    console.log("get metatags", tags);
    const photo = this.photoRepository.getOne(photoID);
    photo.setMetadata({ about: tags });
    await this.photoRepository.save(photo);
    console.log("tags saved");
  }

  async add(initiator: number, albumId?: number) {
    if (!initiator) throw new Error("User does not exist");
    const photo = await this.photoRepository.create({
      userId: initiator,
      albumId,
    });
    return photo;
  }

  async remove(id: number, initiator: number) {
    if (!id) throw new Error("Not found id");
    // посчитать сколько ссылок на эту статью в статьях. foto{{id}} и если их 0 то удалить;
    const photo = this.photoRepository.getOne(id);
    await this.imageService.removeNormalImage(id);
    await this.imageService.removeOrigianl(id);
    return await this.photoRepository.delete(id);
  }

  async ban(id: number, initiator: number) {
    const photo = this.photoRepository.getOne(id);
    if (!photo.canBan()) throw new Error("No");
    photo.ban();
    return await this.photoRepository.save(photo);
  }

  async unban(id: number, initiator: number) {
    const photo = this.photoRepository.getOne(id);
    if (!photo.canUnban()) throw new Error("No");
    photo.unban();
    return await this.photoRepository.save(photo);
  }

  async setSort(id: number, index: number, albumId: number) {
    const photo = this.photoRepository.getOne(id);
    if (!photo.isAlbum(albumId)) throw new Error("No");
    photo.setSort(index);
    return await this.photoRepository.save(photo);
  }

  async putToAlbum(albumId: number, id: number, initiator: number) { 
    const photo = this.photoRepository.getOne(id); 
    photo.setAlbum(albumId);
    return await this.photoRepository.save(photo);
  }
}
