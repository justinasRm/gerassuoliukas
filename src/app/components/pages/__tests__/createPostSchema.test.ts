import { createPostSchema } from "../createPostSchema";

describe("createPostSchema", () => {
  const basePayload = {
    title: "Suoliukas po klevo laja",
    description: "Didelis medinis suoliukas su atlošu ir daugybe šešėlio.",
    photoUrls: ["https://example.com/photo.jpg"],
    location: { lat: 54.687157, lng: 25.279652 },
  };

  it("accepts a valid payload", () => {
    const parsed = createPostSchema.safeParse(basePayload);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual(basePayload);
    }
  });

  it("rejects empty title and description", () => {
    const parsed = createPostSchema.safeParse({
      ...basePayload,
      title: "",
      description: "",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.title).toBeDefined();
      expect(parsed.error.flatten().fieldErrors.description).toBeDefined();
    }
  });

  it("requires at least one photo url", () => {
    const parsed = createPostSchema.safeParse({
      ...basePayload,
      photoUrls: [],
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.photoUrls).toBeDefined();
    }
  });

  it("requires user to pick a map location", () => {
    const parsed = createPostSchema.safeParse({
      ...basePayload,
      location: { lat: 0, lng: 0 },
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.location).toBeDefined();
    }
  });
});
