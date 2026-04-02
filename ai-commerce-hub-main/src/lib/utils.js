import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPriceINR(value) {
  return inrFormatter.format(Number(value) || 0);
}
