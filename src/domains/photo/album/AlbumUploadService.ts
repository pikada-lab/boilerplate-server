import { PhotoReposioryExport } from "../photo/PhotoRepository";
import { PhotoService } from "../photo/PhotoService";
import { AlbumRepository } from "./AlbumRepository";

export class AlbumUploadService {
  constructor(
    private albumRepository: AlbumRepository,
    private photoService: PhotoService,
    private photoRepository: PhotoReposioryExport
  ) {}

  async init() {}

  async addPhotoToAlbum(albumId: number, buffer: Buffer, initiator: number) {
    const album = this.albumRepository.getOne(albumId);
    if (!album.isOwner(initiator)) throw new Error("You can't upload photos in an alien album");
    await this.photoService.upload(buffer, initiator, albumId);
    this.albumRepository.save(album.setFull());
    return album;
  }

  async removeAlbum(albumId: number, initiator: number) {
    const album = this.albumRepository.getOne(albumId);
    if (album.isFulled()) throw new Error("Album is not Fulled");
    return await this.albumRepository.delete(albumId);
  }

  async resort(albumId: number, photoIds: number[], initiator: number) {
    for (let [index, id] of Object.entries(photoIds)) {
      await this.photoService.setSort(id, +index, albumId, initiator);
    }
    return true;
  }

  async removeImageInAlbum(albumId: number, photoId: number, initiator: number) {
    const album = this.albumRepository.getOne(albumId);
    const res = await this.photoService.remove(photoId, initiator);
    const photos = this.photoRepository.getByAlbum(albumId);
    if (photos.length === 0) {
      album.setEmpty();
      await this.albumRepository.save(album);
    }
    return res;
  }
}
