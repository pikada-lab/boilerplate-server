
const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
import { node } from '@tensorflow/tfjs-node';

export interface Pair {
  className: string;
  probability: number;
}

export class MobilenetService {
  

  private getTFImage(imageBuffer: Buffer) {
    return  node.decodeImage(imageBuffer);
  }

  async classify(immageBuffer: Buffer): Promise<Pair[]> { 
    if(immageBuffer.length === 0) throw new Error("Image length equal zero");
    const image = this.getTFImage(immageBuffer);
    const mobilenetModel = await mobilenet.load(); 
    return await mobilenetModel.classify(image);
  }
}