import { 
  collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc, updateDoc, deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import type { VideoItem, Category } from "../types";

export const extractVideoDetails = (url: string) => {
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  
  if (!videoId) return null;
  
  return {
    videoId,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  };
};

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

export const addCategoryToDb = async (name: string, parentId: string | null = null) => {
  await addDoc(collection(db, "categories"), {
    name,
    parentId,
    isDefault: false,
    order: Date.now()
  });
};

export const updateCategoryInDb = async (id: string, newName: string) => {
  const docRef = doc(db, "categories", id);
  await updateDoc(docRef, { name: newName });
};

export const setDefaultCategoryInDb = async (categoryName: string) => {
  const docRef = doc(db, "config", "default_category");
  await setDoc(docRef, { name: categoryName }, { merge: true });
};

export const subscribeToDefaultCategory = (callback: (name: string) => void) => {
  const docRef = doc(db, "config", "default_category");
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) callback(docSnap.data().name);
    else callback(""); 
  });
};

export const subscribeToVideos = (categoryIds: string[], callback: (videos: VideoItem[]) => void) => {
  if (!categoryIds || categoryIds.length === 0) {
    callback([]);
    return () => {}; 
  }

  const q = query(
    collection(db, "videos"),
    where("categoryId", "in", categoryIds.slice(0, 10)), 
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

export const addVideoToDb = async (url: string, title: string, categoryId: string, channelName?: string) => {
  const details = extractVideoDetails(url);
  if (!details) throw new Error("अमान्य YouTube लिंक");

  await addDoc(collection(db, "videos"), {
    title,
    videoId: details.videoId,
    thumbnailUrl: details.thumbnailUrl,
    categoryId,
    channelName: channelName || null, 
    order: Date.now()
  });
};

// यहाँ categoryId अपडेट करने का ऑप्शन जोड़ दिया गया है
export const updateVideoInDb = async (id: string, title: string, channelName: string | undefined, categoryId: string) => {
  const docRef = doc(db, "videos", id);
  await updateDoc(docRef, {
    title,
    channelName: channelName || null,
    categoryId: categoryId 
  });
};

export const deleteVideoFromDb = async (id: string) => {
  const docRef = doc(db, "videos", id);
  await deleteDoc(docRef);
};