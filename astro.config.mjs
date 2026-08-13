// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';

// https://astro.build/config
export default defineConfig({
    site: 'https://longstoryshort.app',
    // Docs live at longstoryshort.app/doc/, alongside the app itself. The existing
    // Long Story Short pages keep their URLs, so nothing indexed has to move.
    base: '/doc',
    // Matches the trailing-slash redirect nginx already enforces for the whole host.
    trailingSlash: 'always',
    integrations: [
        starlight({
            title: 'База знаний',
            description: 'Документация Long Story Short, Anima и Vortex — инструментов для настольных ролевых игр.',
            defaultLocale: 'root',
            locales: {
                root: { label: 'Русский', lang: 'ru' },
            },
            logo: {
                src: './src/assets/lss-logo.png',
                alt: 'Long Story Short',
            },
            favicon: '/favicon.ico',
            head: [
                {
                    tag: 'link',
                    attrs: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
                },
                {
                    // Same origin as the app, so the docs are part of the same installable
                    // PWA — this is what lets the install button on /doc/character-sheet/web-app/
                    // work. Deliberately not prefixed with `base`: the manifest is at the root.
                    tag: 'link',
                    attrs: { rel: 'manifest', href: '/manifest.webmanifest' },
                },
                {
                    tag: 'meta',
                    attrs: { name: 'twitter:card', content: 'summary_large_image' },
                },
                {
                    tag: 'meta',
                    attrs: { property: 'og:image', content: 'https://longstoryshort.app/doc/cover.jpg' },
                },
                {
                    tag: 'meta',
                    attrs: { property: 'og:image:width', content: '1920' },
                },
                {
                    tag: 'meta',
                    attrs: { property: 'og:image:height', content: '960' },
                },
                {
                    tag: 'meta',
                    attrs: { name: 'twitter:image', content: 'https://longstoryshort.app/doc/cover.jpg' },
                },
            ],
            social: [
                { icon: 'telegram', label: 'Гильдия в Telegram', href: 'https://t.me/rpg_guild' },
                { icon: 'github', label: 'GitHub', href: 'https://github.com/tldrpg/Guildhall' },
            ],
            editLink: {
                baseUrl: 'https://github.com/tldrpg/Guildhall/edit/master/',
            },
            lastUpdated: true,
            markdown: {
                // Docs live at the repo root `docs/`, not the default `src/content/docs/`.
                // Starlight's built-in plugins (asides, heading links, etc.) must also
                // process files there so that `:::` directives render correctly.
                processedDirs: ['docs'],
            },
            customCss: ['./src/styles/custom.css'],
            components: {
                // Wraps the default head to append JSON-LD structured data.
                // Note: do not override `Sidebar` here — starlight-sidebar-topics uses that
                // slot for the topic switcher, and a config-level override wins over the
                // plugin's, silently removing it.
                Head: './src/components/Head.astro',
                // Logo mark links to the app itself, the "База знаний" text links to the
                // docs home — two destinations, so the default single <a> won't do.
                SiteTitle: './src/components/SiteTitle.astro',
                // Splash-template pages (the landing page) build their own hero and
                // shouldn't also get the generic page <h1>.
                PageTitle: './src/components/PageTitle.astro',
                // Restyled to match the ProductCard system instead of Starlight's default.
                Pagination: './src/components/Pagination.astro',
            },
            plugins: [
                starlightSidebarTopics([
                    {
                        label: 'Лист персонажа D&D',
                        link: '/character-sheet/',
                        icon: 'open-book',
                        id: 'lss',
                        items: [
                            { slug: 'character-sheet', label: 'Обзор' },
                            { slug: 'main/limits', label: 'Лимиты' },
                            {
                                label: 'Основные возможности',
                                items: [
                                    { slug: 'character-sheet/web-app', label: 'Приложение для Android и iOS' },
                                    { slug: 'character-sheet/print', label: 'Скачать PDF' },
                                    { slug: 'character-sheet/multiclass', label: 'Мультикласс' },
                                    { slug: 'character-sheet/bonuses', label: 'Система бонусов' },
                                    { slug: 'character-sheet/expression-input', label: 'Поля с формулами' },
                                    { slug: 'character-sheet/translations', label: 'Переводы' },
                                ],
                            },
                            {
                                label: 'Текстовый редактор',
                                items: [
                                    { slug: 'text-editor/resource', label: 'Ресурс' },
                                    { slug: 'text-editor/spoiler', label: 'Спойлер' },
                                    { slug: 'text-editor/divider', label: 'Разделитель' },
                                    { slug: 'text-editor/dice-roller', label: 'Формулы и переменные' },
                                ],
                            },
                            {
                                label: 'Заклинания',
                                items: [
                                    { slug: 'spells/srd', label: 'Где остальные?' },
                                    { slug: 'spells/addition', label: 'Добавление собственных' },
                                    { slug: 'spells/cards', label: 'Карточки заклинаний' },
                                ],
                            },
                            {
                                label: 'Интеграции',
                                items: [{ slug: 'integration/owlbear', label: 'Owlbear Rodeo' }],
                            },
                            {
                                label: 'Полезные руководства',
                                items: [
                                    { slug: 'user-guides/social-login', label: 'Соц. вход' },
                                    { slug: 'user-guides/account-migration', label: 'Миграция с Google' },
                                ],
                            },
                            {
                                label: 'Прочее',
                                items: [
                                    { slug: 'misc/character-creation', label: 'Как заполнять лист персонажа?' },
                                    { slug: 'misc/aime', label: 'Приключения в Средиземье' },
                                    { slug: 'misc/adventure-submission', label: 'Предложить приключение' },
                                    { slug: 'misc/links', label: 'Полезные ссылки' },
                                    { slug: 'misc/license', label: 'Лицензия' },
                                ],
                            },
                            {
                                // Пресеты мессенджеров скоро отключат, их заменяет Vortex.
                                // Держим внизу и с бейджем, чтобы никто не начинал с них.
                                label: 'Устаревшее',
                                items: [
                                    {
                                        slug: 'character-sheet/telegram',
                                        label: 'Пресеты Telegram',
                                    },
                                    {
                                        slug: 'character-sheet/discord',
                                        label: 'Пресеты Discord',
                                    },
                                    {
                                        slug: 'character-sheet/advantage-disadvantage',
                                        label: 'Преимущество/Помеха',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        label: 'Anima',
                        link: '/anima/',
                        icon: 'pencil',
                        id: 'anima',
                        items: [
                            { slug: 'anima', label: 'Обзор' },
                            { slug: 'anima/getting-started' },
                            { slug: 'anima/sheets-management' },
                            { slug: 'anima/creating-templates' },
                            {
                                label: 'Виджеты',
                                items: [
                                    { slug: 'anima/widgets' },
                                    { slug: 'anima/widgets/mod' },
                                    { slug: 'anima/widgets/input' },
                                    { slug: 'anima/widgets/label' },
                                    { slug: 'anima/widgets/checkbox' },
                                    { slug: 'anima/widgets/counter' },
                                    { slug: 'anima/widgets/counter-dots' },
                                    { slug: 'anima/widgets/container' },
                                    { slug: 'anima/widgets/styling' },
                                ],
                            },
                            { slug: 'anima/formulas-and-variables' },
                            { slug: 'anima/rolling-dice' },
                            { slug: 'anima/notation' },
                            { slug: 'anima/recipes' },
                            { slug: 'anima/faq' },
                        ],
                    },
                    {
                        label: 'Vortex',
                        link: '/vortex/about/',
                        icon: 'comment',
                        id: 'vortex',
                        items: [
                            { slug: 'vortex/about', label: 'Обзор' },
                            { slug: 'vortex/adding-characters', label: 'Добавление персонажей' },
                            { slug: 'vortex/telegram', label: 'Отправлять броски в Telegram' },
                            { slug: 'vortex/discord', label: 'Отправлять броски в Discord' },
                        ],
                    },
                    {
                        label: 'Разработчикам',
                        link: '/developers/',
                        icon: 'puzzle',
                        id: 'developers',
                        items: [
                            { slug: 'developers', label: 'Обзор' },
                            {
                                label: 'Встраивание листа',
                                items: [
                                    { slug: 'developers/embedding', label: 'Как встроить лист' },
                                    { slug: 'developers/embedding/groups', label: 'Общие права за столом' },
                                    { slug: 'developers/embedding/sdk-guide', label: 'Справочник SDK' },
                                    { slug: 'developers/embedding/bridge', label: 'Мосты для VTT' },
                                    { slug: 'developers/embedding/bridge-guide', label: 'Справочник моста' },
                                ],
                            },
                            { slug: 'developers/datasets', label: 'Датасеты' },
                            { slug: 'developers/characters', label: 'Формат персонажа' },
                            { slug: 'developers/contribute', label: 'Как помочь проекту' },
                        ],
                    },
                ]),
            ],
        }),
    ],
});
