# Развёртывание

База знаний собирается Astro Starlight и живёт на `https://longstoryshort.app/doc/`.
Приложение и документация деплоятся независимо друг от друга.

| | Приложение | База знаний |
|---|---|---|
| Репозиторий | `tldrpg/storyview` | `tldrpg/Guildhall` |
| Стек | Gatsby | Astro Starlight |
| Каталог на сервере | `/var/www/longstoryshort.app` | `/var/www/lss-doc/doc` |
| Триггер | тег | пуш в `master` |

Каталоги разделены намеренно: деплой приложения выполняет `rsync --delete` в свой
корень и стирал бы документацию при каждом релизе.

## Порядок переезда

Шаг 1 обязан уехать на прод **до** того, как дока начнёт отдаваться Astro.

**1. Service worker (в репозитории storyview)**

`gatsby-plugin-offline` регистрирует service worker со скоупом `/`, то есть он
контролирует и `/doc/`. Это сделано намеренно и остаётся как есть: документация
кешируется вместе с приложением и работает офлайн.

Оболочка приложения вместо доки не подставится — навигационный обработчик в `sw.js`
уходит в сеть, если для пути нет записи `resources:` в IndexedDB, а для страниц доки
её не будет:

```js
const resources = await idbKeyval.get(`resources:${pathname}`)
if (!resources || !(await caches.match(`/app-<hash>.js`))) {
    return await fetch(event.request)
}
```

Но **поиск сломается**, если ничего не менять. Индекс Pagefind живёт в `/doc/pagefind/`
и устроен так: манифест `pagefind-entry.json` и загрузчик `pagefind.js` имеют
постоянные имена, а файлы индекса — хеш в имени (`ru_183055a.pf_index`), и деплой
удаляет старые через `rsync --delete`. Под текущие правила они попадают так:

| Файл | Правило | Итог |
|---|---|---|
| `pagefind.js`, `pagefind-worker.js` | `/(\.js$\|static\/)/` → `CacheFirst` | замерзает навсегда |
| `pagefind-entry.json` | `…(json\|css…)$` → `StaleWhileRevalidate` | отстаёт на один деплой |
| `*.pf_index`, `*.pf_fragment` | нет правила | сеть |

То есть устаревший манифест будет ссылаться на файлы индекса, которых на сервере
уже нет. Поэтому в `gatsby-config.js` в начало `runtimeCaching` — **первым правилом**,
до `/\/iframe\//` — нужно добавить:

```js
{
    // The docs search index is rebuilt on every docs deploy and its manifest
    // points at content-hashed files that the deploy deletes. Serving any of
    // it from cache breaks search.
    urlPattern: /\/doc\/pagefind\//,
    handler: 'NetworkFirst',
},
```

Выкатить приложение с этим правилом и дать ему разойтись по клиентам.

Осознанный компромисс: сами страницы доки остаются под правилом
`{ urlPattern: /\/$/, handler: 'StaleWhileRevalidate' }`. Это даёт офлайн и быстрые
повторные заходы ценой того, что обновление текста видно со второго открытия.
В момент переезда те, у кого старые страницы доки уже лежат в кеше, один раз увидят
версию с Gatsby — она отрендерится нормально, а фоновое обновление подтянет новую.

**2. Вырезать доку из приложения (в репозитории storyview)**

- удалить `src/doc/` и `src/doc-content.ts`;
- убрать создание страниц `/doc/*` в `gatsby-node.js` (запрос `allMdx` с фильтром
  по `doc/`, `docLayout`, ветку `page.path.match(/doc\//)`);
- удалить `src/layouts/DocLayoutMeta.jsx` и связанные с ним компоненты `src/components/MDX/`,
  если они больше нигде не используются;
- `src/components/AppInstallButton.tsx` больше не используется — см. раздел «PWA».
- положить [`robots.txt`](robots.txt) в `static/` — см. раздел «Поисковая выдача».

**3. Каталог и nginx (на сервере)**

```bash
sudo mkdir -p /var/www/lss-doc/doc
sudo chown -R shakusky:shakusky /var/www/lss-doc
```

Вставить содержимое [`nginx-doc-location.conf`](nginx-doc-location.conf) в
`/etc/nginx/sites-available/longstoryshort.app`, внутрь server-блока с SSL,
перед `location / { ... }`. Затем:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Модификатор `^~` в этом блоке обязателен — подробности в комментариях к конфигу.

**4. Раннер GitHub Actions**

Workflow использует `runs-on: self-hosted`, как и остальные проекты на этом сервере.
Нужен раннер, зарегистрированный на репозиторий `tldrpg/Guildhall` (по образцу
`~/actions-runner-paper`). Токен берётся в *Settings → Actions → Runners →
New self-hosted runner*.

```bash
mkdir ~/actions-runner-guildhall && cd ~/actions-runner-guildhall
curl -o actions-runner-linux-x64.tar.gz -L <ссылка со страницы регистрации>
tar xzf actions-runner-linux-x64.tar.gz
./config.sh --url https://github.com/tldrpg/Guildhall --token <TOKEN>
sudo ./svc.sh install && sudo ./svc.sh start
```

**5. Редирект со старого адреса Anima (необязательно)**

Если `anima.longstoryshort.app/doc/` где-то уже упоминается, повесить 301
на `https://longstoryshort.app/doc/anima/`.

## Путь деплоя

Workflow берёт каталог из переменной репозитория `DOCS_WWW_PATH`, а если её нет —
использует `/var/www/lss-doc/doc`. Значение обязано начинаться с `/var/www/` —
иначе шаг деплоя падает, не запуская `rsync --delete`.

## Первая выкладка вручную

Чтобы проверить nginx до настройки раннера:

```bash
npm ci && npm run build && npm run check:links
rsync -ahW --no-compress --delete -e "ssh -p 50505" \
    dist/ shakusky@147.45.184.251:/var/www/lss-doc/doc/
```

## Проверка

```bash
# существующие URL Long Story Short не должны сломаться
curl -sI https://longstoryshort.app/doc/character-sheet/bonuses/ | head -1   # 200
curl -sI https://longstoryshort.app/doc/text-editor/dice-roller/ | head -1   # 200
curl -sI https://longstoryshort.app/doc/ | head -1                          # 200

# новые разделы
curl -sI https://longstoryshort.app/doc/anima/notation/ | head -1           # 200
curl -sI https://longstoryshort.app/doc/vortex/about/ | head -1             # 200

# ассеты не перехвачены regex-локациями приложения
curl -s https://longstoryshort.app/doc/ | grep -o '_astro[^"]*\.js' | head -1
curl -sI https://longstoryshort.app/doc/нет-такой-страницы/ | head -1       # 404

# редирект на завершающий слеш
curl -sI https://longstoryshort.app/doc/anima/notation | head -2            # 301
```

Отдельно: выложить приложение и повторно открыть `/doc/` — убедиться, что релиз
storyview не задевает документацию.

## Поисковая выдача

**robots.txt.** Сейчас `https://longstoryshort.app/robots.txt` отдаёт 404 — файла нет.
После переезда сайтмапов станет два: `/sitemap-index.xml` собирает Gatsby, а
`/doc/sitemap-index.xml` — Starlight (49 страниц). На второй ниоткуда не ссылаются,
сам поисковик его не найдёт.

Готовый файл лежит в [`robots.txt`](robots.txt), разместить его нужно в приложении,
в `storyview/static/` — Gatsby копирует `static/` в корень сайта. Из репозитория базы
знаний это сделать нельзя: она раздаётся из `/doc/`, а краулеры читают `robots.txt`
только из корня домена. Класть `robots.txt` в `public/` базы знаний бессмысленно —
он окажется по адресу `/doc/robots.txt`, куда никто не заглядывает.

**Страницы для встраивания.** Маршруты `/iframe/characters/*` предназначены для
показа внутри чужих страниц и дублируют содержимое обычных страниц приложения.
Закрывать их через `Disallow` в `robots.txt` не стоит: это запретит краулерам
загружать iframe и испортит рендеринг страниц тех виртуальных столов, которые
встроили лист. Правильный инструмент — `<meta name="robots" content="noindex">`
на самих iframe-страницах: они останутся доступными для загрузки, но выпадут
из индекса. Это изменение в storyview, к переезду не привязано.

## PWA

Дока лежит на том же origin, что и приложение, поэтому остаётся частью того же PWA:

- в `<head>` каждой страницы подключается `/manifest.webmanifest` приложения
  (см. `head` в `astro.config.mjs`);
- service worker приложения (скоуп `/`) контролирует и страницы доки;
- кнопка установки на `/doc/character-sheet/web-app/` восстановлена как
  [`src/components/InstallButton.astro`](../src/components/InstallButton.astro) —
  ванильный JS на `beforeinstallprompt`, без React и Mantine.

Кнопка сама прячется, если браузер не предлагает установку (уже установлено либо
Safari/iOS, где события нет) — поэтому ручная инструкция на странице остаётся.
Посетителю, попавшему сразу на доку, компонент регистрирует `/sw.js`, если тот ещё
не зарегистрирован: без контролирующего SW браузер не покажет предложение установки.

После выпиливания доки из Gatsby `src/components/AppInstallButton.tsx` в storyview
больше нигде не используется — его можно удалить либо, если кнопка нужна и в самом
приложении, переставить туда (например, в профиль).
