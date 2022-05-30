import { readFile } from "fs/promises";
import { join } from "path";
import { HttpClient } from "./HttpClient";
const AWS = require("aws-sdk"),
  zlib = require("zlib"),
  fs = require("fs");
const s3Stream = require("s3-upload-stream")(new AWS.S3());

export interface YCConfig {
  apiKey: string;
  folderId: string;
}
export interface ResponseTranslate {
  translations: { text: string }[];
}
export interface ResponseModeration {
  properties: [
    {
      name: "adult";
      probability: number;
    },
    {
      name: "gruesome";
      probability: number;
    },
    {
      name: "text";
      probability: number;
    },
    {
      name: "watermarks";
      probability: number;
    }
  ];
}
export class YCService {
  private http: HttpClient;
  private folderId: string;
  constructor() {
    this.folderId = process.env.YC_FOLDER_ID!;
    this.http = new HttpClient("Api-Key " + process.env.YC_API_KEY);
    // AWS.config.loadFromPath('./config.json');
  }

  async translate(sourceLanguageCode: string, targetLanguageCode: string, texts: string[]): Promise<ResponseTranslate> {
    const totalLength = this.countLength(texts);
    if (totalLength > 10000) throw new Error("Total length text more 10000 chars");
    const body = {
      folderId: this.folderId,
      texts,
      sourceLanguageCode,
      targetLanguageCode,
    };
    const response = await this.http.post(
      "https://translate.api.cloud.yandex.net/translate/v2/translate",
      JSON.stringify(body)
    );
    return response.data;
  }

  private countLength(texts: string[]) {
    return texts.reduce((acc: number, val: string) => {
      acc += val.length;
      return acc;
    }, 0);
  }

  async moderationImage(buff: Buffer): Promise<ResponseModeration> {
    const body = {
      folderId: "b1grlo5i8647b39dqh4p",
      analyze_specs: [
        {
          content: buff.toString("base64"),
          features: [
            {
              type: "CLASSIFICATION",
              classificationConfig: {
                model: "moderation",
              },
            },
          ],
        },
      ],
    };

    const response = await this.http.post(
      "https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze",
      JSON.stringify(body)
    );
    return response.data.results[0].results[0].classification;
  }

  async uploadToCDN(name: string, filePath: string) {
    const fileBuffer = await readFile(filePath);
    const params = {
      key: name,
      body: fileBuffer,
    };
    console.log("https:/" + join(`/fake-mm.storage.yandexcloud.net/`, name));
    await this.http.put("https:/" + join(`/fake-mm.storage.yandexcloud.net/`, name), fileBuffer, {
      Authorization: "",
    });
  }
}
