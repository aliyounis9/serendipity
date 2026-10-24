import type { Activity } from "@/types/activity";

// Google Maps search link. It opens the Maps app on phones
// when it's installed; otherwise, it opens in the browser.
export function googleMapsUrl(venue: Activity["venue"]): string {
  const query = encodeURIComponent(`${venue.name}, ${venue.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
