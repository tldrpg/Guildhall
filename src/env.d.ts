/// <reference types="astro/client" />

// SiteTitle.astro mirrors Starlight's own default component, which relies on this
// virtual module. Starlight declares it in an internal .d.ts that isn't part of its
// public exports, so consuming projects don't inherit the ambient type — redeclare
// the same shape here instead of reaching into Starlight's internals.
declare module 'virtual:starlight/user-images' {
    type ImageMetadata = import('astro').ImageMetadata;
    export const logos: {
        dark?: ImageMetadata;
        light?: ImageMetadata;
    };
}
