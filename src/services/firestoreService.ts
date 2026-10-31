import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  doc, 
} from "firebase/firestore";
import { db } from "../firebase";
import type { VideoItem, Category } from "../types";
import { getThumbnailUrl } from "../utils/youtubeParser";

// --- वीडियोज़ के लिए ---
export const subscribeToVideos = (
  category: string, 
  callback: (videos: VideoItem[]) => void
) => {
  const q = query(
    collection(db, "videos"),
    where("category", "==", category),
    orderBy("order", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const videos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as VideoItem[];
    callback(videos);
  });
};

export const addVideoToDb = async (
  title: string, 
  videoId: string, 
  category: string
) => {
  const newVideo = {
    title: title || "Untitled Video",
    videoId,
    category,
    thumbnailUrl: getThumbnailUrl(videoId),
    order: Date.now()
  };
  await addDoc(collection(db, "videos"), newVideo);
};

// --- कैटेगरीज़ के लिए ---
export const subscribeToCategories = (
  callback: (categories: Category[]) => void
) => {
  const q = query(collection(db, "categories"), orderBy("order", "asc"));
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
    callback(categories);
  });
};

export const addCategoryToDb = async (name: string, isDefault: boolean = false) => {
  await addDoc(collection(db, "categories"), {
    name,
    isDefault,
    order: Date.now()
  });
};

// --- डिफ़ॉल्ट कैटेगरी के लिए ---
export const subscribeToDefaultCategory = (
  callback: (defaultCategory: string) => void
) => {
  const docRef = doc(db, "config", "default_category");
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().name);
    } else {
      callback("Sanskrit"); // Fallback
    }
  });
};