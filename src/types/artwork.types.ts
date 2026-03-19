export const ArtworkType = {
  DIGITAL: 'Digital',
  PHYSICAL: 'Physical',
} as const;

export type ArtworkType = (typeof ArtworkType)[keyof typeof ArtworkType];

export const Visibility = {
  PUBLIC: 'Public',
  PRIVATE: 'Private',
} as const;

export type Visibility = (typeof Visibility)[keyof typeof Visibility];

export const ARTWORK_TECHNIQUES = [
  'Acrylic Painting',
  'Oil Painting',
  'Watercolor',
  'Gouache',
  'Tempera',
  'Encaustic',
  'Spray Paint',
  'Airbrush',
  'Alcohol Ink',
  'Pencil Drawing',
  'Colored Pencil',
  'Graphite',
  'Charcoal',
  'Ink',
  'Ink Wash',
  'Marker',
  'Crayon',
  'Chalk',
  'Ballpoint Pen',
  'Scratchboard',
  'Watercolor Pencil',
  'Engraving',
  'Etching',
  'Drypoint',
  'Mezzotint',
  'Lithography',
  'Linocut',
  'Woodcut',
  'Screen Printing',
  'Monotype',
  'Monoprint',
  'Sculpture',
  'Clay Modeling',
  'Ceramics',
  'Bronze Casting',
  'Marble Sculpture',
  'Mosaic',
  'Glass Art',
  'Resin Art',
  'Assemblage',
  'Mixed Media',
  'Photography',
  'Film Photography',
  'Digital Photography',
  'Macro Photography',
  'Long Exposure',
  'Digital Illustration',
  'Digital Painting',
  'Digital Collage',
  'Photobashing',
  'Pixel Art',
  'Vector Art',
  '3D Modeling',
  '3D Sculpting',
  '3D Rendering',
  'Procedural Art',
  'Generative Art',
  'AI Art',
] as const;

export const ARTWORK_GENRES = [
  'Renaissance',
  'Baroque',
  'Romanticism',
  'Realism',
  'Impressionism',
  'Expressionism',
  'Cubism',
  'Art Nouveau',
  'Art Deco',
  'Contemporary',
  'Conceptual Art',
  'Hyperrealism',
  'Neo-Expressionism',
  'Lowbrow',
  'Abstract',
  'Figurative',
  'Portrait',
  'Landscape',
  'Seascape',
  'Cityscape',
  'Still Life',
  'Genre Scene',
  'Narrative',
  'Historical',
  'Mythological',
  'Religious',
  'Political',
  'Social Commentary',
  'Dark Art',
  'Gothic',
  'Minimalist',
  'Surreal',
  'Nature',
  'Botanical',
  'Floral',
  'Animal',
  'Wildlife',
  'Maritime',
  'Space',
  'Vehicle',
  'Automotive',
  'Military',
  'Sports',
  'Food Art',
  'Illustration',
  'Editorial',
  "Children's Illustration",
  'Book Cover',
  'Game Art',
  'Matte Painting',
  'Character Design',
  'Concept Art',
  'Fan Art',
  'Pop Culture',
  'Street Photography',
  'Fine Art Photography',
  'Fashion',
  'Documentary',
  'Environmental',
  'Industrial',
  'Street',
  'Urban',
] as const;

export type ArtworkTechnique = (typeof ARTWORK_TECHNIQUES)[number];
export type ArtworkGenre = (typeof ARTWORK_GENRES)[number];

export interface ArtworkImage {
  id: number;
  key: string;
  url?: string;
  provider: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Artwork {
  id: number;
  type: ArtworkType;
  title: string;
  description?: string;
  year?: number;
  country?: string;
  technique?: ArtworkTechnique[];
  genre?: ArtworkGenre[];
  physicalHeight?: number;
  physicalWidth?: number;
  physicalDepth?: number;
  digitalHeight?: number;
  digitalWidth?: number;
  fileSize?: number;
  materials?: string;
  tools?: string;
  tags?: string[];
  visibility: Visibility;
  images: ArtworkImage[];
  collection?: {
    id: number;
    name: string;
    description?: string;
    visibility: Visibility;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface ArtworkPaginatedResponse {
  artworks: Artwork[];
  pagination: Pagination;
}

export interface ArtworkCardFramesData {
  id: number;
  title: string;
  imageUrl: string;
  width: number;
  height: number;
}

export interface ArtworkFilters extends Pagination {
  search?: string;
  type?: ArtworkType;
  technique?: ArtworkTechnique[];
  genre?: ArtworkGenre[];
  country?: string;
  yearMin?: number;
  yearMax?: number;
}
