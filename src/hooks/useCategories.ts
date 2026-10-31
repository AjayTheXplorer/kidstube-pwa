import { useState, useEffect } from "react";
import type { Category } from "../types";
import { subscribeToCategories, subscribeToDefaultCategory } from "../services/firestoreService";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // डिफ़ॉल्ट कैटेगरी सुनें
    const unsubDefault = subscribeToDefaultCategory((def) => {
      setDefaultCategory(def);
    });

    // सभी कैटेगरी सुनें
    const unsubCats = subscribeToCategories((cats) => {
      setCategories(cats);
      setLoading(false);
    });

    return () => {
      unsubDefault();
      unsubCats();
    };
  }, []);

  return { categories, defaultCategory, loading };
};