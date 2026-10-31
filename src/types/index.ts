export interface VideoItem {
  id: string;
  title: string;
  videoId: string;
  category: string;
  thumbnailUrl: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
  order: number;
}