import { useQuery } from '@tanstack/react-query';
import { getAllData } from '../api/data';
import { DropdownOption } from '../../components/shared/CustomDropDown';

interface MasterData {
  categories: DropdownOption[];
  brands: DropdownOption[];
  cities: DropdownOption[];
}

/**
 * Custom hook to fetch and cache master data (categories, brands, cities)
 * This data is cached for 30 minutes and shared across all screens
 */
export const useMasterData = () => {
  return useQuery<MasterData>({
    queryKey: ['masterData'],
    queryFn: getAllData,
    staleTime: 1000 * 60 * 30, // 30 minutes - data is considered fresh
    gcTime: 1000 * 60 * 60, // 1 hour - keep in cache
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on component mount if data is already cached
    refetchOnReconnect: true, // Refetch when internet reconnects
  });
};

/**
 * Hook to get only categories
 */
export const useCategories = () => {
  const { data, isLoading, error } = useMasterData();
  return {
    categories: data?.categories || [],
    isLoading,
    error,
  };
};

/**
 * Hook to get only brands
 */
export const useBrands = () => {
  const { data, isLoading, error } = useMasterData();
  return {
    brands: data?.brands || [],
    isLoading,
    error,
  };
};

/**
 * Hook to get only cities
 */
export const useCities = () => {
  const { data, isLoading, error } = useMasterData();
  return {
    cities: data?.cities || [],
    isLoading,
    error,
  };
};

