import { ACTIVITIES } from "@/data/activities";
import { googleMapsUrl } from "@/utils/maps";

const venue = {
  name: "Musée Mécanique",
  address: "Pier 45 & Taylor Street, San Francisco, CA 94133",
  latitude: 37.80925,
  longitude: -122.41579,
};

describe("googleMapsUrl", () => {
  test("uses the Google Maps search URL format", () => {
    expect(googleMapsUrl(venue)).toMatch(
      /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/,
    );
  });

  test("searches for the venue name and address", () => {
    const query = new URL(googleMapsUrl(venue)).searchParams.get("query");
    expect(query).toBe("Musée Mécanique, Pier 45 & Taylor Street, San Francisco, CA 94133");
  });

  test("encodes spaces, & and accents so the query isn't cut off", () => {
    const url = googleMapsUrl(venue);
    expect(url).not.toContain(" ");
    expect(url).toContain("%26"); // &
    expect(url).toContain("Mus%C3%A9e"); // é
  });

  test("works for every activity in the dataset", () => {
    for (const activity of ACTIVITIES) {
      const query = new URL(googleMapsUrl(activity.venue)).searchParams.get("query");
      expect(query).toBe(`${activity.venue.name}, ${activity.venue.address}`);
    }
  });
});
