import { 
  collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc
} from "firebase/firestore";
import { db } from "../firebase";
import type { VideoItem, Category } from "../types";

// --- YouTube URL से ID और Thumbnail निकालना ---
export const extractVideoDetails = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  if (!videoId) return null;
  return {
    videoId,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  };
};

// --- कैटेगरीज़ ---
export const subscribeToCategories = (callback: (categories: Category[]) => void) => {
  const q = query(collection(db, "categories"), orderBy("order", "asc"));
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
    callback(categories);
  });
};

export const addCategoryToDb = async (name: string) => {
  await addDoc(collection(db, "categories"), {
    name,
    isDefault: false,
    order: Date.now()
  });
};

export const setDefaultCategoryInDb = async (categoryName: string) => {
  const docRef = doc(db, "config", "default_category");
  await setDoc(docRef, { name: categoryName }, { merge: true });
};

export const subscribeToDefaultCategory = (callback: (name: string) => void) => {
  const docRef = doc(db, "config", "default_category");
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) callback(docSnap.data().name);
    else callback("Sanskrit");
  });
};

// --- वीडियोज़ ---
export const subscribeToVideos = (category: string, callback: (videos: VideoItem[]) => void) => {
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

export const addVideoToDb = async (url: string, title: string, category: string) => {
  const details = extractVideoDetails(url);
  if (!details) throw new Error("अमान्य YouTube लिंक");

  await addDoc(collection(db, "videos"), {
    title,
    videoId: details.videoId,
    thumbnailUrl: details.thumbnailUrl,
    category,
    order: Date.now()
  });
};