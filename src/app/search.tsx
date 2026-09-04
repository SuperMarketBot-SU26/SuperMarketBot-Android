import SearchScreenMain from '../components/search/SearchScreenMain';

/**
 * Route /search — Màn hình tìm kiếm sản phẩm & công thức nấu ăn.
 * SearchScreenMain tự phân loại intent (sản phẩm vs công thức) thông qua
 * SearchService.classifyIntent() và gọi API Gemini AI động thay vì hardcode.
 */
export default function SearchScreen() {
  return <SearchScreenMain />;
}
