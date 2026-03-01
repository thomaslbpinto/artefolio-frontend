import type { ArtworkImage, Visibility } from './artwork.types';

export interface Collection {
  id: number;
  name: string;
  description?: string;
  visibility: Visibility;
  artworks?: {
    id: number;
    images: ArtworkImage[];
  }[];
  createdAt: string;
  updatedAt: string;
}
