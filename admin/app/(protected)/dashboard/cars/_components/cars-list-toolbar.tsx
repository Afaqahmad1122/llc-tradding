"use client";

import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import { PAGE_SIZE_OPTIONS } from "../_lib/constants";
import type { Dispatch } from "react";

import type {
  ListAction,
  ListState,
  PublishedFilter,
} from "../_lib/list-state";

type CarsListToolbarProps = {
  list: ListState;
  dispatch: Dispatch<ListAction>;
};

export function CarsListToolbar({ list, dispatch }: CarsListToolbarProps) {
  return (
    <div className="border-border/70 flex flex-wrap items-start gap-3 border-b p-5">
      <div className="text-muted-foreground flex min-h-9 shrink-0 items-center gap-2">
        <SearchIcon className="size-4" aria-hidden />
        <Label htmlFor="cars-search" className="sr-only">
          Search
        </Label>
      </div>
      <Input
        id="cars-search"
        className="min-w-[220px] flex-1"
        placeholder="Search by reference #, chassis, or title…"
        value={list.searchInput}
        onChange={(e) =>
          dispatch({ type: "SET_SEARCH_INPUT", payload: e.target.value })
        }
      />
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="sr-only" htmlFor="cars-sort">
            Sort
          </Label>
          <NativeSelect
            id="cars-sort"
            value={list.sort}
            onChange={(e) =>
              dispatch({
                type: "SET_SORT",
                payload: e.target.value as ListState["sort"],
              })
            }
            className="min-w-[9.5rem]"
          >
            <NativeSelectOption value="latest">Latest first</NativeSelectOption>
            <NativeSelectOption value="oldest">Oldest first</NativeSelectOption>
            <NativeSelectOption value="priceAsc">
              Price ascending
            </NativeSelectOption>
            <NativeSelectOption value="priceDesc">
              Price descending
            </NativeSelectOption>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="sr-only" htmlFor="cars-pub-filter">
            Published
          </Label>
          <NativeSelect
            id="cars-pub-filter"
            value={list.published}
            onChange={(e) =>
              dispatch({
                type: "SET_PUBLISHED",
                payload: e.target.value as PublishedFilter,
              })
            }
            className="min-w-[9.75rem]"
          >
            <NativeSelectOption value="all">All visibility</NativeSelectOption>
            <NativeSelectOption value="published">Published</NativeSelectOption>
            <NativeSelectOption value="unpublished">Hidden</NativeSelectOption>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="sr-only" htmlFor="cars-page-size">
            Page size
          </Label>
          <NativeSelect
            id="cars-page-size"
            value={String(list.pageSize)}
            onChange={(e) =>
              dispatch({
                type: "SET_PAGE_SIZE",
                payload: Number.parseInt(
                  e.target.value,
                  10,
                ) as (typeof PAGE_SIZE_OPTIONS)[number],
              })
            }
            className="min-w-[5.75rem]"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <NativeSelectOption key={n} value={String(n)}>
                {n}/page
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
    </div>
  );
}
