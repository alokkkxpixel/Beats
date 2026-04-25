import { useLocalSearchParams } from "expo-router";
import React from "react";
import CategoriesDetailsPage from "@/components/explore/CategoriesDetailsPage";

const CategoryDetailsScreen = () => {
  const { id, title } = useLocalSearchParams();

  return (
    <CategoriesDetailsPage 
      categoryType={id as string} 
      title={title as string} 
    />
  );
};

export default CategoryDetailsScreen;
