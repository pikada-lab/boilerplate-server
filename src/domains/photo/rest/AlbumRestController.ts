import {
  RestAuthorizationRequest,
  RestFileRequest,
  RestRequest,
  ServerController,
} from "../../../utilites/ServerController";
import { AlbumComponent } from "../album/AlbumComponent";
import { AlbumUploadService } from "../album/AlbumUploadService";
import { PhotoComponent } from "../photo/PhotoComponent";
import { PhotoReposioryExport } from "../photo/PhotoRepository";
import { PhotoService } from "../photo/PhotoService";
import { AlbumPresenter } from "../presenters/AlbumPresenter";
import { AlbumExportRepository } from "/var/www/fake-mm/source2/server/src/domains/photo/album/AlbumRepository";
import { AlbumService } from "/var/www/fake-mm/source2/server/src/domains/photo/album/AlbumService";

export class AlbumRestController {
  private albumService: AlbumService;
  private albumRepository: AlbumExportRepository;
  private uploadAlbumService: AlbumUploadService;
  private photoService: PhotoService;
  private photoRepository: PhotoReposioryExport;
  constructor(
    private server: ServerController,
    albumComponent: AlbumComponent,
    photoComponent: PhotoComponent,
    private albumPresenter: AlbumPresenter
  ) {
    this.albumService = albumComponent.getService();
    this.albumRepository = albumComponent.getRepository();
    this.uploadAlbumService = albumComponent.getUploadService();
    this.photoService = photoComponent.getService();
    this.photoRepository = photoComponent.getRepository();
  }

  async init() {
    this.setRequestController();
    this.setCommandController();
  }

  private setRequestController() {
    this.server.getAuth("/v1/album/", (req) => this.getAll(req));
    this.server.getAuth("/v1/album/:id", (req) => this.getOne(req));
    this.server.getAuth("/v1/album/author/:id", (req) => this.getByUser(req));
    this.server.getAuth("/v1/album/author/iam", (req) => this.getByOwner(req));
  }

  private async getByOwner(req: RestAuthorizationRequest & RestRequest) {
    const albums = this.albumRepository.getByUser(+req.payload.id);
    return this.albumPresenter.mapFullAlbum(albums);
  }
  private async getByUser(req: RestAuthorizationRequest & RestRequest) {
    const albums = this.albumRepository.getByUser(+req.params.id);
    return this.albumPresenter.mapFullAlbum(albums);
  }

  private async getAll(req: RestAuthorizationRequest & RestRequest) {
    const albums = this.albumRepository.getAll();
    return this.albumPresenter.mapFullAlbum(albums);
  }

  private async getOne(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.params.id;
    const album = this.albumRepository.getOne(id);
    return this.albumPresenter.getFullAlbum(album);
  }

  setCommandController() {
    this.server.postAuth("/v1/album/", (req) => this.add(req));
    this.server.deleteAuth("/v1/album/:id", (req) => this.delete(req));
    this.server.patchAuth("/v1/album/:id", (req) => this.editMeta(req));
    this.server.patchAuth("/v1/album/author/:id", (req) => this.changeAuthor(req));
    this.server.uploadAuth("/v1/album/:id", (req) => this.uploadPhoto(req));
    this.server.deleteAuth("/v1/album/photo/:photoId", (req) => this.deletePhoto(req));
    this.server.patchAuth("/v1/album/:id/sort", (req) => this.sortImage(req));
    this.server.patchAuth("/v1/album/:id/ban", (req) => this.ban(req));
    this.server.patchAuth("/v1/album/:id/unban", (req) => this.unban(req));
  }

  private getIdWithInitiator(req: RestAuthorizationRequest & RestRequest) {
    const idWithInitiator = {
      id: +req.params?.id,
      initiator: +req.payload?.id,
    };

    if (!idWithInitiator.id) throw new Error("No id");
    if (!idWithInitiator.initiator) throw new Error("No user id");

    return idWithInitiator;
  }
  private getInitiator(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.payload?.id;
    if (!id) throw new Error("No user id");
    return id;
  }

  private async add(req: RestAuthorizationRequest & RestRequest) {
    const initiator = this.getInitiator(req);
    const meta = req.body;
    const album = await this.albumService.create(initiator, meta);
    return this.albumPresenter.getFullAlbum(album);
  }

  private async delete(req: RestAuthorizationRequest & RestRequest) {
    const { id, initiator } = this.getIdWithInitiator(req);
    return await this.uploadAlbumService.removeAlbum(id, initiator);
  }

  private async editMeta(req: RestAuthorizationRequest & RestRequest) {
    const { id, initiator } = this.getIdWithInitiator(req);
    const meta = req.body;
    const album = await this.albumService.edit(id, initiator, meta);
    return this.albumPresenter.getFullAlbum(album);
  }

  private async uploadPhoto(req: RestAuthorizationRequest & RestRequest & RestFileRequest) {
    const { id, initiator } = this.getIdWithInitiator(req);
    const file = (req.raw as any).files.image;
    const buff = Buffer.from(file.data);
    const album = await this.uploadAlbumService.addPhotoToAlbum(id, buff, initiator);
    return this.albumPresenter.getFullAlbum(album);
  }

  private async deletePhoto(req: RestAuthorizationRequest & RestRequest) {
    const initiator = this.getInitiator(req);
    const photoId = +req.params.photoId;
    if (!photoId) throw new Error("No photoId");
    const photo = this.photoRepository.getOne(photoId);
    const albumId = photo.getAlbum();
    if (!albumId) {
      console.log("REMOVE SINGLE PHOTO");
      return await this.photoService.remove(photoId, initiator);
    }
    console.log("REMOVE ALBUMs PHOTO");
    return await this.uploadAlbumService.removeImageInAlbum(albumId, photoId, initiator);
  }

  private async sortImage(req: RestAuthorizationRequest & RestRequest) {
    const { id, initiator } = this.getIdWithInitiator(req);
    return await this.uploadAlbumService.resort(id, req.body as any as number[], initiator);
  }

  private async ban(req: RestAuthorizationRequest & RestRequest) {
    const { id, initiator } = this.getIdWithInitiator(req);
    const album = await this.albumService.bun(id, initiator);
    return this.albumPresenter.getFullAlbum(album);
  }

  private async unban(req: RestAuthorizationRequest & RestRequest) {
    const { id, initiator } = this.getIdWithInitiator(req);
    const album = await this.albumService.unban(id, initiator);
    return this.albumPresenter.getFullAlbum(album);
  }

  private async changeAuthor(req: RestAuthorizationRequest & RestRequest) {
    const { id, initiator } = this.getIdWithInitiator(req);
    const owner = +req.body.owner;
    const album = await this.albumService.setOwner(id, initiator, owner);
    return this.albumPresenter.getFullAlbum(album);
  }
  
}
