import { useState, useEffect } from "react";
import type { Category } from "../types";
import { subscribeToCategories } from "../services/firestoreService";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubCats = subscribeToCategories((cats) => {
      setCategories(cats);
      setLoading(false);
    });
    return () => unsubCats();
  }, []);

  return { categories, loading };
};