import { MobilenetService } from "../../../utilites/MobilenetService";
import { YCService } from "../../../utilites/YCService";

export class MetaService {
  constructor(private readonly yc: YCService, private readonly mobile: MobilenetService) {}
  async init() {}

  async getTag(buff: Buffer) {
    const classes = await this.mobile.classify(buff);
    const tags = classes.filter(r => r.probability > 0.3).map(r => r.className).join(", ");
    if(!tags) throw new Error("we don't know what is it");
    const result = await this.yc.translate("en", "ru", [tags]);
    return result.translations[0].text
  }


  async getModerateInfo(buff: Buffer) { 
    const moderation = await this.yc.moderationImage(buff);
    const isAdult = moderation.properties[0].probability > 0.5;
    const isGruesome = moderation.properties[1].probability > 0.5;
    const isText = moderation.properties[2].probability > 0.5;
    const isWatermarks = moderation.properties[2].probability > 0.5;
    return { isAdult, isGruesome, isText, isWatermarks };
  }

  async moderate(buff: Buffer) {
    const info = await this.getModerateInfo(buff);
    if(info.isAdult) throw new Error("Adult");
    if(info.isGruesome) throw new Error("Gruesome");
    if(info.isWatermarks) throw new Error("Watermarks");
  }
}