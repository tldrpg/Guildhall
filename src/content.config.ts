import { defineCollection } from 'astro:content';
// Re-exporting `z` from `astro:content` is deprecated in Astro 7.
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { i18nLoader } from '@astrojs/starlight/loaders';

// Docs stay in `docs/` at the repo root so the markdown keeps rendering on
// GitHub. Starlight's own `docsLoader()` is hardcoded to `src/content/docs`,
// so we point Astro's glob loader at the real location instead.
export const collections = {
    docs: defineCollection({
        // `docs/plans/` holds internal roadmaps, not published pages — keep it out
        // of the collection or every plan would ship as a page on the site.
        loader: glob({ base: './docs', pattern: ['**/[^_]*.{md,mdx}', '!plans/**'] }),
        schema: docsSchema({
            extend: z.object({
                // Marks the page that renders the FAQ list, so the head can emit
                // FAQPage structured data for it.
                faq: z.boolean().optional(),
            }),
        }),
    }),
    // Lets src/content/i18n/ru.json override individual built-in UI strings
    // (e.g. the "edit this page" label) without translating the whole locale.
    i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
