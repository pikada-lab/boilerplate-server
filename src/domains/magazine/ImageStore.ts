import { access, mkdir, rm } from "fs/promises";
import { join } from "path";
const sharp = require("sharp");

type prefixType = 'sq' | 'hl' | 'hs' | 'vl' | 'vs' | 'el';
interface ImageFormat {
  prefix: prefixType,
  width: number,
  height: number
}
export class ImageService {
  private path = "./images/";
  private formats: {[key: string]: ImageFormat}  = {
 'sq':   {
      prefix: 'sq',
      width: 96,
      height: 96,
    },
    'hl': {
      prefix: 'hl',
      width: 616,
      height: 411,
    },
    'hs':  {
      prefix: 'hs',
      width: 408,
      height: 272,
    },
    'vl':  {
      prefix: 'vl',
      width: 408,
      height: 611,
    },
    'vs': {
      prefix: 'vs',
      width: 200,
      height: 300,
    },
    'el':  {
      prefix: 'el',
      width: 1920,
      height: 1080,
    }
  };

  constructor() {}
  
  async init() {
    try {
      await access(this.path);
    } catch (ex: any) {
      console.log(ex);
      await mkdir(this.path, 0o755);
      await mkdir(join(this.path, "original"), 0o755);
      await mkdir(join(this.path, "normal"), 0o755);
      console.log("[X] Ошибка обработки файловой системы ", ex.message);
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
  async saveNormal(photoID: number, binary: Buffer) {
    const [originalPath, sq, hl, hs, vl, vs] = await Promise.all([
      this.saveOrigianl(photoID, binary),
      this.saveSquareImage(photoID, binary), 
      this.saveHorizontalLargeImage(photoID, binary), 
      this.saveHorizontalSmallImage(photoID, binary), 
      this.saveVerticalLargeImage(photoID, binary), 
      this.saveVerticalSmallImage(photoID, binary), 
    ]);
    return { originalPath, sq, hl, hs, vl, vs };
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
  async removeExtraLargeImage(photoID: number) {
    await this.removeImage(photoID, 'el');
  }
  async removeNormalImage(photoID: number) {
    await Promise.all([
      this.removeImage(photoID, 'sq'),
      this.removeImage(photoID, 'hl'),
      this.removeImage(photoID, 'hs'),
      this.removeImage(photoID, 'vl'),
      this.removeImage(photoID, 'vs'),
    ]);
  }
  async saveCover(photoID: number, binary: Buffer) {
    const [originalPath, el] = await Promise.all([
      this.saveOrigianl(photoID, binary),
      this.saveExtraLargeImage(photoID, binary),  
    ]);
    return { originalPath, el };
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
    return  await this.saveImage(photoID, binary, this.formats['sq'])
  }

  private async saveHorizontalLargeImage(photoID: number, binary: Buffer) { 
    return  await this.saveImage(photoID, binary, this.formats['hl'])
  }
  private async saveHorizontalSmallImage(photoID: number, binary: Buffer) { 
    return  await this.saveImage(photoID, binary, this.formats['hs'])
  }
  private async saveVerticalLargeImage(photoID: number, binary: Buffer) { 
    return  await this.saveImage(photoID, binary, this.formats['vl'])
  }
  private async saveVerticalSmallImage(photoID: number, binary: Buffer) { 
    return  await this.saveImage(photoID, binary, this.formats['vs'])
  }
  private async saveExtraLargeImage(photoID: number, binary: Buffer) { 
    return  await this.saveImage(photoID, binary, this.formats['el'])
  }
  
  private async saveImage(photoID: number, binary: Buffer, format: ImageFormat  ) {
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
}
