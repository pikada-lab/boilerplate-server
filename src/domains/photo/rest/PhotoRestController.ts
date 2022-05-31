import { MobilenetService } from "../../../utilites/MobilenetService";
import {
  RestAuthorizationRequest,
  RestFileRequest,
  RestRequest,
  ServerController,
} from "../../../utilites/ServerController";
import { YCService } from "../../../utilites/YCService";
import { MetaDescriptionsPhoto } from "../photo/Photo";
import { PhotoReposioryExport } from "../photo/PhotoRepository";
import { PhotoService } from "../photo/PhotoService";
import { PhotoPresenter } from "../presenters/PhotoPresenter";

export class PhotoRestController {
  constructor(
    private server: ServerController,
    private photoService: PhotoService,
    private photoRepository: PhotoReposioryExport,
    private photoPresenter: PhotoPresenter,
    private yc: YCService,
    private mobile: MobilenetService
  ) {}

  async init() {
    this.setRequestController();
    this.setCommandController();
  }

  setRequestController() {
    this.server.getAuth("/v1/photo/", async (req) => this.getAll(req));
    this.server.getAuth("/v1/photo/:id", async (req) => this.getOne(req));
    this.server.getAuth("/v1/photo/author/:id", async (req) =>
      this.getByAuthor(req)
    );
    this.server.getAuth("/v1/photo/album/:id", async (req) =>
      this.getByAlbum(req)
    );
  }

  async getAll(req: RestAuthorizationRequest & RestRequest) {
    return this.photoRepository
      .getAll()
      .map((r) => this.photoPresenter.getPhoto(r));
  }
  async getOne(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.params.id;
    const photo = this.photoRepository.getOne(id);
    return this.photoPresenter.getPhoto(photo);
  }

  async getByAuthor(req: RestAuthorizationRequest & RestRequest) {
    const userId = +req.params.id;
    const initiator = +req.payload.id;
    const photo = this.photoRepository.getByUser(userId);
    return this.photoPresenter.mapPhoto(photo);
  }

  async getByAlbum(req: RestAuthorizationRequest & RestRequest) {
    const albumId = +req.params.id;
    const initiator = +req.payload.id;
    const photo = this.photoRepository.getByAlbum(albumId);
    return this.photoPresenter.mapPhoto(photo);
  }

  setCommandController() {
    this.server.uploadAuth("/v1/photo/", async (req) => this.uploadImgae(req));
    this.server.patchAuth("/v1/photo/:id", (req) => this.save(req));
    this.server.patchAuth("/v1/photo/:id/ban", (req) => this.ban(req));
    this.server.patchAuth("/v1/photo/:id/unban", (req) => this.unban(req));
    this.server.deleteAuth("/v1/photo/:id", (req) => this.delete(req));
    this.server.patchAuth("/v1/photo/:id/toalbum", (req) =>
      this.putToAlbum(req)
    );

    this.server.postAuth("/v1/photo/translate", async (req) =>
      this.translate(req)
    );
    this.server.uploadAuth("/v1/photo/moderation", async (req) =>
      this.checkImage(req)
    );
    this.server.uploadAuth("/v1/photo/classify", async (req) =>
      this.classifyImage(req)
    );
    this.server.postAuth("/v1/photo/:id/cdn", (req) => this.sendToCDN(req));
  }

  private async sendToCDN(req: RestAuthorizationRequest & RestRequest) {
    const photo = this.photoRepository.getOne(+req.params.id);
    return await this.yc.uploadToCDN(
      `/images/photo/normal/${photo.getId()}.el.png`,
      `images/photo/normal/${photo.getId()}.el.png`
    );
  }
  private async uploadImgae(
    req: RestAuthorizationRequest & RestRequest & RestFileRequest
  ) {
    const file = (req.raw as any).files.image;
    const buff = Buffer.from(file.data);
    const initiator = +req.payload.id;
    const photo = await this.photoService.upload(buff, initiator);
    return this.photoPresenter.getPhoto(photo);
  }

  private async classifyImage(
    req: RestAuthorizationRequest & RestRequest & RestFileRequest
  ) {
    const file = (req.raw as any).files.image;
    const buff = Buffer.from(file.data);
    const classes = await this.mobile.classify(buff);
    const tags = classes
      .filter((r) => r.probability > 0.3)
      .map((r) => r.className)
      .join(", ");
    if (!tags) throw new Error("we don't know what is it");
    const russianTags = await this.yc.translate("en", "ru", [tags]);
    return russianTags.translations[0].text;
  }

  private async checkImage(
    req: RestAuthorizationRequest & RestRequest & RestFileRequest
  ) {
    const files = (req.raw as any).files.image;
    const buff = Buffer.from(files.data);
    const moderation = await this.yc.moderationImage(buff);
    const isAdult = moderation.properties[0].probability > 0.5;
    const isGruesome = moderation.properties[1].probability > 0.5;
    const isText = moderation.properties[2].probability > 0.5;
    const isWatermarks = moderation.properties[2].probability > 0.5;
    return { isAdult, isGruesome, isText, isWatermarks };
  }
  private async translate(req: RestAuthorizationRequest & RestRequest) {
    const translater = await this.yc.translate("ru", "en", [req.body.name]);
    const result = translater.translations[0];
    return result;
  }

  private async delete(req: RestAuthorizationRequest & RestRequest) {
    throw new Error("DEPRECATED");
  }

  private async save(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.params.id;
    const initiator = +req.payload.id;
    const meta = req.body as MetaDescriptionsPhoto;
    return await this.photoService.save(id, initiator, meta);
  }
  private async ban(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.params.id;
    const initiator = +req.payload.id;
    return await this.photoService.ban(id, initiator);
  }
  private async unban(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.params.id;
    const initiator = +req.payload.id;
    return await this.photoService.unban(id, initiator);
  }
  private async putToAlbum(req: RestAuthorizationRequest & RestRequest) {
    const id = +req.params.id;
    const initiator = +req.payload.id;
    const album = +req.body.albumId;
    return await this.photoService.putToAlbum(album, id, initiator);
  }
}
