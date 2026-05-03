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
    <div className="border-border/80 bg-muted/25 border-b">
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="space-y-2">
          <Label
            htmlFor="cars-search"
            className="text-muted-foreground text-xs font-medium"
          >
            Search inventory
          </Label>
          <div className="relative">
            <SearchIcon
              className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              id="cars-search"
              className="bg-background min-h-10 border-border/80 pl-9 shadow-sm"
              placeholder="Reference #, chassis VIN, or title…"
              value={list.searchInput}
              onChange={(e) =>
                dispatch({ type: "SET_SEARCH_INPUT", payload: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-4">
          <div className="flex min-w-40 flex-1 flex-col gap-1.5 sm:max-w-48">
            <Label
              htmlFor="cars-sort"
              className="text-muted-foreground text-xs font-medium"
            >
              Sort by
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
              className="bg-background min-h-10 min-w-0 border-border/80 shadow-sm"
            >
              <NativeSelectOption value="latest">Latest first</NativeSelectOption>
              <NativeSelectOption value="oldest">Oldest first</NativeSelectOption>
              <NativeSelectOption value="priceAsc">
                Price · low to high
              </NativeSelectOption>
              <NativeSelectOption value="priceDesc">
                Price · high to low
              </NativeSelectOption>
            </NativeSelect>
          </div>
          <div className="flex min-w-40 flex-1 flex-col gap-1.5 sm:max-w-48">
            <Label
              htmlFor="cars-pub-filter"
              className="text-muted-foreground text-xs font-medium"
            >
              Visibility
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
              className="bg-background min-h-10 min-w-0 border-border/80 shadow-sm"
            >
              <NativeSelectOption value="all">All listings</NativeSelectOption>
              <NativeSelectOption value="published">Live only</NativeSelectOption>
              <NativeSelectOption value="unpublished">Hidden only</NativeSelectOption>
            </NativeSelect>
          </div>
          <div className="flex w-full min-w-28 flex-col gap-1.5 sm:w-auto sm:max-w-32">
            <Label
              htmlFor="cars-page-size"
              className="text-muted-foreground text-xs font-medium"
            >
              Per page
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
              className="bg-background min-h-10 border-border/80 shadow-sm"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <NativeSelectOption key={n} value={String(n)}>
                  {n} rows
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>
      </div>
    </div>
  );
}
