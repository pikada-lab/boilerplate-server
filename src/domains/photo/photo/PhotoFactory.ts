import { ArticlePhoto, Photo } from "./Photo";

export const PhotoFactory = (das: ArticlePhoto) => {
  return new Photo().restore(das);
};
