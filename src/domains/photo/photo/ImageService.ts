import { access, mkdir, rm } from "fs/promises";
import { join } from "path";
const sharp = require("sharp");

type prefixType = "sq" | "el";
interface ImageFormat {
  prefix: prefixType;
  width: number;
  height?: number;
}
export class ImageService {
  private path = "./images/photo/";
  private formats: { [key: string]: ImageFormat } = {
    sq: {
      prefix: "sq",
      width: 96,
      height: 96,
    },
    el: {
      prefix: "el",
      width: 824,
    },
  };

  constructor() {}

  async init() {
    try {
      await access(this.path);
    } catch (ex: any) {
      console.log("[X] Ошибка обработки файловой системы ", ex.message);
      await mkdir(this.path, 0o755);
      await mkdir(join(this.path, "original"), 0o755);
      await mkdir(join(this.path, "normal"), 0o755);
    }
  }
  /** Пораждает исключение если нет файла */
  private async hasFile(size: string, file: string) {
    if (!["original", "normal"].includes(size))
      throw new Error("Такой размер не существует, используйте original или normal");
    await access(join(this.path, size, file));
  }

  async getPath(size: string, file: string) {
    await this.hasFile(size, file);
    return join(this.path, size, file);
  }

  getAllPath(photoID: number) {
    return {
      pathTumbanian: join("/images/photo", "normal", `${photoID}.sq.png`),
      pathImage: join("/images/photo", "normal", `${photoID}.el.png`),
      pathOriginal: join("/images/photo", "original", `${photoID}.png`),
    };
  }
  async saveNormal(photoID: number, binary: Buffer) {
    const [originalPath, sq, el] = await Promise.all([
      this.saveOrigianl(photoID, binary),
      this.saveSquareImage(photoID, binary),
      this.saveExtraLargeImage(photoID, binary),
    ]);
    return { originalPath, sq, el };
  }
  private async removeImage(photoID: number, prefix: prefixType) {
    const originalPath = join(this.path, "normal", `${photoID}.${prefix}.png`);
    try {
      await rm(originalPath);
    } catch (ex) {}
  }
  async removeOrigianl(photoID: number) {
    const path = join(this.path, "original", `${photoID}.png`);
    try {
      await rm(path);
    } catch (ex) {}
  }
  async removeNormalImage(photoID: number) {
    await Promise.all([this.removeImage(photoID, "sq"), this.removeImage(photoID, "el")]);
  }

  private async saveOrigianl(photoID: number, binary: Buffer) {
    const path = join(this.path, "original", `${photoID}.png`);
    return new Promise<string>((res, rej) => {
      sharp(binary)
        .png()
        .toFile(join(this.path, "original", `${photoID}.png`), (err: null | any, info: any) => {
          res(path);
        });
    });
  }

  private async saveSquareImage(photoID: number, binary: Buffer) {
    return await this.saveImage(photoID, binary, this.formats["sq"]);
  }
  private async saveExtraLargeImage(photoID: number, binary: Buffer) {
    return await this.saveImage(photoID, binary, this.formats["el"]);
  }

  private async saveImage(photoID: number, binary: Buffer, format: ImageFormat) {
    const path = join(this.path, "normal", `${photoID}.${format.prefix}.png`);
    return new Promise<string>((res, rej) => {
      sharp(binary)
        .resize({
          width: format.width,
          height: format.height,
          fit: sharp.fit.cover,
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(path, (err: null | any, info: any) => {
          res(path);
        });
    });
  }

  public async getSmallBuffer(binary: Buffer) {
    return new Promise<Buffer>((res, rej) => {
  sharp(binary)
        .resize({
          width: 616,
          fit: sharp.fit.cover,
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toBuffer((err: null | any, buffer: Buffer) => {
          if(err) return rej(err);
          res(buffer)
        });
    });
  }
}
