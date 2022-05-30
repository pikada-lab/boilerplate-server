import { Album, AlbumDAO } from "./Album";

export const AlbumFactory = (album: AlbumDAO) => {
  return new Album().restore(album);
}