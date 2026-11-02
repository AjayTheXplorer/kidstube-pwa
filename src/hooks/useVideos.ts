import { useState, useEffect } from "react";
import type { VideoItem } from "../types";
import { subscribeToVideos } from "../services/firestoreService";

export const useVideos = (categoryIds: string[]) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Array को स्ट्रिंग में बदलें ताकि useEffect उसमें बदलाव को पहचान सके
  const idsString = categoryIds.join(',');

  useEffect(() => {
    if (!categoryIds || categoryIds.length === 0) {
      setVideos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToVideos(categoryIds, (vids) => {
      setVideos(vids);
      setLoading(false);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsString]);

  return { videos, loading };
};