import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(
      1,
      "Nu toks geras tas tavo fotografuotas suoliukas (turbūt). Sugalvok jam pavadinimą.",
    )
    .max(100, "Persistengi su tuo pavadinimu, ne? Mažink iki 100 simbolių."),
  description: z
    .string()
    .min(1, "Vargai fotkindamas suoliuką, o aprašyt tingi? Įvesk aprašymą!")
    .max(500, "Leidžiu 500 simbolių. Daugiau neįmanoma. Ir taškas, seni."),
  photoUrls: z
    .array(z.string().url("Kažkas negerai su url..."))
    .min(
      1,
      "Gal tindery be nuotraukų ir praslysi, bet čia ne.\nĮkelk nuotrauką.",
    ),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .refine((data) => data.lat === 0 || data.lng === 0, {
      message: "Kas tau negerai? Pasirink vietą. Kaip kitiem ją rast?",
    }),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;
