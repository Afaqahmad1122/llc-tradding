import type { AdminCarsQuery } from "@/lib/api/cars";

import { PAGE_SIZE_OPTIONS } from "./constants";

export type PublishedFilter = "all" | "published" | "unpublished";

export type ListState = {
  page: number;
  pageSize: (typeof PAGE_SIZE_OPTIONS)[number];
  searchInput: string;
  debouncedSearch: string;
  sort: "latest" | "oldest" | "priceAsc" | "priceDesc";
  published: PublishedFilter;
};

export type ListAction =
  | { type: "SET_SEARCH_INPUT"; payload: string }
  | { type: "APPLY_DEBOUNCED_SEARCH"; payload: string }
  | {
      type: "SET_SORT";
      payload: "latest" | "oldest" | "priceAsc" | "priceDesc";
    }
  | { type: "SET_PUBLISHED"; payload: PublishedFilter }
  | { type: "SET_PAGE_SIZE"; payload: (typeof PAGE_SIZE_OPTIONS)[number] }
  | { type: "SET_PAGE"; payload: number };

export const initialListState: ListState = {
  page: 1,
  pageSize: 12,
  searchInput: "",
  debouncedSearch: "",
  sort: "latest",
  published: "all",
};

export function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case "SET_SEARCH_INPUT":
      return { ...state, searchInput: action.payload };
    case "APPLY_DEBOUNCED_SEARCH":
      if (state.debouncedSearch === action.payload) return state;
      return { ...state, debouncedSearch: action.payload, page: 1 };
    case "SET_SORT":
      if (state.sort === action.payload) return state;
      return { ...state, sort: action.payload, page: 1 };
    case "SET_PUBLISHED":
      if (state.published === action.payload) return state;
      return { ...state, published: action.payload, page: 1 };
    case "SET_PAGE_SIZE":
      if (state.pageSize === action.payload) return state;
      return { ...state, pageSize: action.payload, page: 1 };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    default:
      return state;
  }
}

export function buildCarsQuery(list: ListState): AdminCarsQuery {
  const query: AdminCarsQuery = {
    page: list.page,
    pageSize: list.pageSize,
    ...(list.debouncedSearch ? { search: list.debouncedSearch } : {}),
    ...(list.sort !== "latest" ? { sort: list.sort } : {}),
  };
  if (list.published === "published") query.isPublished = true;
  if (list.published === "unpublished") query.isPublished = false;
  return query;
}
