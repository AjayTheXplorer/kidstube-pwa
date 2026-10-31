import { useState, useEffect } from "react";
import type { VideoItem } from "../types";
import { subscribeToVideos } from "../services/firestoreService";

export const useVideos = (category: string) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    setLoading(true);
    const unsubscribe = subscribeToVideos(category, (vids) => {
      setVideos(vids);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [category]);

  return { videos, loading };
};