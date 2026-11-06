export interface VideoItem {
  id: string;
  title: string;
  videoId: string;
  categoryId: string; 
  thumbnailUrl: string;
  channelName?: string; // नया फील्ड (Optional)
  order: number;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null; 
  isDefault: boolean;
  order: number;
}