import { useLocalSearchParams } from 'expo-router';
import SearchScreenMain from '../components/search/SearchScreenMain';
import RecipeResultScreenMain from '../components/search/RecipeResultScreenMain';

export default function SearchScreen() {
  const { query } = useLocalSearchParams();

  if (query === 'Công thức nấu món canh chua cá ba sa') {
    return <RecipeResultScreenMain />;
  }

  return <SearchScreenMain />;
}
