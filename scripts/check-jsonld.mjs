#!/usr/bin/env node
// Verifies every built page carries parseable JSON-LD with the nodes we expect.
//
// The markup is generated in a head override, so a broken component or a renamed
// Starlight API would silently drop it from all pages at once. Run after `astro build`.

import { readFileSync, globSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

if (!existsSync(DIST)) {
    console.error('dist/ не найден — сначала `npm run build`.');
    process.exit(1);
}

// The 404 page deliberately carries no structured data — it is not a document.
const pages = globSync('**/*.html', { cwd: DIST }).filter((rel) => rel !== '404.html');

let failures = 0;
let faqPages = 0;
let withBreadcrumb = 0;

for (const rel of pages) {
    const html = readFileSync(path.join(DIST, rel), 'utf8');
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

    if (!match) {
        console.error(`НЕТ РАЗМЕТКИ   ${rel}`);
        failures += 1;
        continue;
    }

    let data;
    try {
        data = JSON.parse(match[1]);
    } catch (error) {
        console.error(`НЕВАЛИДНЫЙ JSON ${rel}: ${error.message}`);
        failures += 1;
        continue;
    }

    const graph = data['@graph'];
    if (!Array.isArray(graph) || graph.length === 0) {
        console.error(`ПУСТОЙ ГРАФ    ${rel}`);
        failures += 1;
        continue;
    }

    const types = graph.map((node) => node['@type']);
    for (const required of ['Organization', 'WebSite']) {
        if (!types.includes(required)) {
            console.error(`НЕТ ${required.toUpperCase()}  ${rel}`);
            failures += 1;
        }
    }

    const main = graph.find((node) => node['@type'] === 'TechArticle' || node['@type'] === 'FAQPage');
    if (!main) {
        console.error(`НЕТ СТРАНИЦЫ   ${rel} (ни TechArticle, ни FAQPage)`);
        failures += 1;
    }

    if (types.includes('BreadcrumbList')) withBreadcrumb += 1;

    const faqNode = graph.find((node) => node['@type'] === 'FAQPage');
    if (faqNode) {
        faqPages += 1;
        const questions = faqNode.mainEntity ?? [];
        const visible = (html.match(/<summary/g) ?? []).length;

        if (questions.length === 0) {
            console.error(`ПУСТОЙ FAQ     ${rel}`);
            failures += 1;
        } else if (questions.length !== visible) {
            // Structured data must match what the visitor actually sees.
            console.error(`FAQ РАСХОДИТСЯ ${rel}: в разметке ${questions.length}, на странице ${visible}`);
            failures += 1;
        }
    }
}

console.log(
    `Проверено ${pages.length} страниц: FAQPage — ${faqPages}, с хлебными крошками — ${withBreadcrumb}, ошибок: ${failures}`
);
process.exit(failures > 0 ? 1 : 0);
