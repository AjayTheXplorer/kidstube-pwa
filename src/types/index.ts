export interface VideoItem {
  id: string;
  title: string;
  videoId: string;
  categoryId: string; // अब हम नाम की जगह ID सेव करेंगे
  thumbnailUrl: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null; // null = मुख्य कैटेगरी, वरना सब-कैटेगरी
  isDefault: boolean;
  order: number;
}