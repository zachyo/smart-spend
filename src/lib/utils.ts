import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumberShort = (value) => {
  if (value >= 1000000) {
    return `₦${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `₦${(value / 1000).toFixed(0)}k`;
  }
  return `₦${value}`;
};
