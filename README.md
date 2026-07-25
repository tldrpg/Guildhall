# Ратуша

Общая база знаний проектов Long Story Short: заполняемого листа персонажа для D&D 5e,
конструктора листов [Anima](https://anima.longstoryshort.app/) и комнат Vortex.

📖 **Читать: [longstoryshort.app/doc](https://longstoryshort.app/doc/)**

Сайт собирается [Astro Starlight](https://starlight.astro.build/). Разделы трёх продуктов
разведены по «топикам» — у каждого свой сайдбар, но общие поиск, тема и шапка.

## Структура

```
docs/
  index.mdx              → /doc/            База знаний LSS (FAQ)
  main/  character-sheet/  text-editor/
  spells/  integration/  user-guides/  misc/
                         → /doc/<раздел>/<страница>/   топик Long Story Short
  vortex/                → /doc/vortex/...             топик Vortex
  anima/                 → /doc/anima/...              топик Anima
  developers/            → /doc/developers/...         топик Разработчикам
```

Раздел «Разработчикам» — обзорный вход для внешних интеграторов. Справочник по API
живёт в репозитории [tldrpg/lss-vtt-sdk](https://github.com/tldrpg/lss-vtt-sdk) рядом
с кодом и версионируется вместе с ним; сюда он намеренно не копируется.

Пути страниц Long Story Short намеренно совпадают с теми, что были на сайте
до переезда с Gatsby, — проиндексированные URL не меняются.

## Как писать

Обычный markdown (`.md`) или MDX (`.mdx`, если нужны компоненты Starlight).
У каждой страницы фронтматтер с `title` и `description`; заголовок первого уровня
не нужен — Starlight рисует его сам из `title`.

Внутренние ссылки — абсолютным путём от корня сайта, вместе с префиксом `/doc` и
завершающим слешем (иначе nginx отдаст лишний 301):

```markdown
[Поля с формулами](/doc/character-sheet/expression-input/)
[Нотация формул Anima](/doc/anima/notation/)
[Действие по клику](/doc/anima/widgets/#действие-по-клику)
```

Картинки лежат рядом с текстом и подключаются относительным путём — Astro сам их
оптимизирует и переводит в WebP:

```markdown
![Браузерное меню Chrome](./web-app/assets/1.jpg)
```

Новая страница попадает в навигацию только после того, как её добавят в нужный топик
в [`astro.config.mjs`](astro.config.mjs).

### Полезные блоки

| Что нужно | Как |
|---|---|
| Заметка, предупреждение | `:::note`, `:::caution`, `:::tip`, `:::danger` |
| Пример для копирования | обычный fenced code block |
| Карточки, вкладки, шаги | компоненты Starlight — файл должен быть `.mdx` |

## Локальная разработка

```bash
npm install
npm run dev          # http://localhost:4321/doc/
npm run build        # сборка в dist/
npm run check        # типы и диагностика Astro
npm run check:links  # битые внутренние ссылки и якоря (после build)
npm run preview      # посмотреть собранное
```

`check:links` гоняется и в CI: Astro не проверяет ссылки внутри markdown, поэтому
опечатка или переименование страницы иначе всплывут только как 404 на проде.

Пуш в `master` пересобирает и выкладывает сайт — см.
[`.github/workflows/docs-deploy.yml`](.github/workflows/docs-deploy.yml) и
[`deploy/`](deploy/README.md).

## Остались вопросы?

Присоединяйтесь к нашей [Гильдии в Telegram](https://t.me/rpg_guild).
