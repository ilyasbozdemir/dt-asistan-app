import React from "react";
import { DocumentTable } from "./DocumentTable";

export interface PageLimitConfig {
  firstPage: number;
  middle: number;
  lastPage: number;
}

export const DEFAULT_LIMITS: PageLimitConfig = {
  firstPage: 12,
  middle: 18,
  lastPage: 8,
};

export const LANDSCAPE_LIMITS: PageLimitConfig = {
  firstPage: 6,
  middle: 9,
  lastPage: 4,
};

export function paginateData<T>(
  data: T[],
  limits: PageLimitConfig
): T[][] {
  if (data.length === 0) return [[]];

  if (data.length <= limits.lastPage) {
    return [data];
  }

  const pages: T[][] = [];
  let currentIndex = 0;

  let firstPageSize = Math.min(data.length, limits.firstPage);
  
  if (data.length > limits.lastPage && firstPageSize === data.length) {
    const leaveForNext = Math.min(3, limits.lastPage);
    firstPageSize = Math.max(1, data.length - leaveForNext);
  }
  
  pages.push(data.slice(0, firstPageSize));
  currentIndex += firstPageSize;

  while (currentIndex < data.length) {
    const remainingCount = data.length - currentIndex;

    if (remainingCount <= limits.lastPage) {
      pages.push(data.slice(currentIndex));
      break;
    }

    if (remainingCount <= limits.middle) {
      const lastPageCount = Math.min(Math.ceil(remainingCount / 2), limits.lastPage);
      const middlePageCount = remainingCount - lastPageCount;
      
      pages.push(data.slice(currentIndex, currentIndex + middlePageCount));
      pages.push(data.slice(currentIndex + middlePageCount));
      break;
    }

    pages.push(data.slice(currentIndex, currentIndex + limits.middle));
    currentIndex += limits.middle;
  }

  return pages;
}
