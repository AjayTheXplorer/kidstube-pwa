import { 
  collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc
} from "firebase/firestore";
import { db } from "../firebase";
import type { VideoItem, Category } from "../types";

// --- YouTube URL से ID और Thumbnail निकालना (अधिक सुरक्षित) ---
export const extractVideoDetails = (url: string) => {
  // यह रेगुलर एक्सप्रेशन लगभग सभी YouTube URL फॉर्मेट को सपोर्ट करता है
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  
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

// parentId डिफ़ॉल्ट रूप से null रहेगा (यानी मुख्य कैटेगरी)
export const addCategoryToDb = async (name: string, parentId: string | null = null) => {
  await addDoc(collection(db, "categories"), {
    name,
    parentId,
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
    else callback(""); // अगर डिफ़ॉल्ट सेट नहीं है
  });
};

// --- वीडियोज़ (अब यह कैटेगरी आईडीज़ की एक लिस्ट (Array) लेगा) ---
export const subscribeToVideos = (categoryIds: string[], callback: (videos: VideoItem[]) => void) => {
  if (!categoryIds || categoryIds.length === 0) {
    callback([]);
    return () => {}; // खाली अनसब्सक्राइब फंक्शन
  }

  // Firestore में 'in' ऑपरेटर का इस्तेमाल करके एक साथ कई कैटेगरीज़ के वीडियो लाएं
  // ध्यान दें: Firestore 'in' में अधिकतम 10 आइटम्स ही सपोर्ट करता है।
  // फिलहाल हमारे पास 10 से कम सब-कैटेगरीज़ होंगी, तो यह बिल्कुल सही काम करेगा।
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

export const addVideoToDb = async (url: string, title: string, categoryId: string) => {
  const details = extractVideoDetails(url);
  if (!details) throw new Error("अमान्य YouTube लिंक");

  await addDoc(collection(db, "videos"), {
    title,
    videoId: details.videoId,
    thumbnailUrl: details.thumbnailUrl,
    categoryId, // अब ID सेव करेंगे
    order: Date.now()
  });
};