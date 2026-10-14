# Ярема Лазорко — кікбоксинг WAKO (Львів)

Односторінковий сайт тренера з адмінкою для редагування вмісту без коду.

---

## Як редагувати сайт (для тренера)

1. Відкрийте **https://coach-lazorko.github.io/admin/**.
2. Натисніть **Sign In Using Access Token**. Перший раз потрібно створити токен:
   - натисніть посилання в підказці (або відкрийте GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token);
   - **Repository access** → *Only select repositories* → `coach-lazorko.github.io`;
   - **Permissions → Contents** → *Read and write*;
   - строк дії — до 1 року; скопіюйте токен і вставте в адмінку.
   Браузер запам’ятає вхід. Токен нікому не передавайте й не входьте в адмінку на чужих комп’ютерах.
   Якщо загубили телефон чи ноутбук — видаліть токен на GitHub (Settings → Developer settings → Fine-grained tokens).
3. Ліворуч оберіть розділ (Контакти, Розклад, Відео, Відгуки…), змініть і натисніть **Save**.
4. Через 1–2 хвилини зміни з’являться на сайті.

Що можна змінити в адмінці: ім’я, телефон, Telegram, Instagram, цифри на головній, адреси залів, текст і фото «Про тренера», групи, розклад (можна окрему таблицю на кожен зал), досягнення, фото галереї, відео, відгуки, часті питання.

**Фото:**
- *Фото тренера:* «Про тренера» → «Фото тренера» → вибрати файл → **Save**. Найкраще вертикальне (4:5).
- *Галерея:* «Галерея (фото)» → **Add** → вибрати фото → (необов’язково) короткий опис → **Save**. Поки немає жодного фото, розділ «Галерея» на сайті прихований.
- Фото з телефона (JPEG, PNG, HEIC з iPhone) автоматично зменшуються до 1600 px і перетворюються на WebP ще до завантаження — сайт залишається швидким.

**Відео:** вставте посилання на YouTube (звичайне відео або Shorts) — воно гратиме прямо на сайті. Посилання на Instagram Reels відкриється в Instagram (Instagram не дає вбудовувати відео акуратно). Можна також завантажити файл `.mp4` у `assets/video/` і вказати шлях `assets/video/назва.mp4`, але великі файли краще викладати на YouTube.

---

## For developers

Static site built by **Jekyll on GitHub Pages** (no build step on your side):

```
index.html            page template (Liquid); all editable content comes from _data/
_data/*.yml           content: settings, about, programs, schedule, achievements,
                      gallery, videos, reviews, faq
_includes/icons.html  SVG icon sprite
admin/                Sveltia CMS (Decap-compatible): index.html + config.yml
assets/css/style.css  styles (colors are CSS variables at the top)
assets/js/main.js     menu, scroll effects, contact form, video cards + popup player
assets/img/           logo.jpg (hero), logo-mark.png (header, footer, favicon), uploads/ (CMS media)
cloudflare/           Worker that sends form applications to Telegram (not published)
```

### Preview locally

The page is a Jekyll template, so open it through Jekyll (Docker, same versions as GitHub Pages):

```bash
docker run --rm -it -p 4000:4000 -v "$PWD":/srv -w /srv ruby:3.3 \
  sh -c "gem install github-pages --no-document && jekyll serve -H 0.0.0.0"
# → http://localhost:4000
```

### Deploy

Repo: **coach-lazorko/coach-lazorko.github.io**, site: **https://coach-lazorko.github.io/**. As a `<user>.github.io` repo it's served at the root of that address.

**Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**, and tick *Enforce HTTPS*. The repo must be **public**, because Pages on a free account only publishes public repos. GitHub builds the Jekyll site on every push, including saves from the admin.

### Admin (Sveltia CMS)

- Sign-in uses a fine-grained personal access token (Contents: read/write), so no OAuth server is needed. For a "Sign in with GitHub" button instead, deploy [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) on Cloudflare Workers and set `backend.base_url` in `admin/config.yml`.
- The admin edits `coach-lazorko/coach-lazorko.github.io` (`backend.repo` in `admin/config.yml`). If the repo is ever renamed or moved, update that line.
- The CMS version is pinned in `admin/index.html`. Bump it to update.
- Edits are commits by the signed-in user. Uploaded images go to `assets/img/uploads/`.

### Contact form → Telegram (Cloudflare Worker)

Applications from the site form go to a small Cloudflare Worker (`cloudflare/form-to-telegram/worker.js`), which sends them to a Telegram bot. It's free (Workers free plan: 100k requests a day) and has no monthly cap. It has a spam trap and only accepts requests from the site's address.

1. **Bot:** in Telegram, open [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token. Then open the new bot and press **Start**.
2. **Worker:** [dash.cloudflare.com](https://dash.cloudflare.com) (free account) → **Workers & Pages → Create → Start with Hello World** → name it `lazorko-form` → **Deploy** → **Edit code** → replace everything with `worker.js` → **Deploy**.
   *(Or from a terminal: `cd cloudflare/form-to-telegram && npx wrangler deploy`.)*
3. **Settings → Variables and Secrets:**
   - `TELEGRAM_BOT_TOKEN` (Secret) = the bot token;
   - open the Worker URL in a browser: it lists the chat IDs of everyone who pressed Start → add `TELEGRAM_CHAT_ID` (Secret). Use commas for several recipients, e.g. the coach and a group;
   - `ALLOWED_ORIGINS` (Text) = `https://coach-lazorko.github.io` (add a custom domain here later, comma-separated).
   Opening the Worker URL again should say «✅ Форма працює».
4. Paste the Worker URL (`https://lazorko-form.<account>.workers.dev`) into the admin: **Контакти та налаштування → Адреса форми заявок**.

Until step 4, submitting the form shows a message asking visitors to write in Telegram.

### Visitor statistics (Cloudflare Web Analytics)

Free and unlimited, with no cookies. It shows visits, pages, referrers, countries and devices, but not button clicks.

1. Cloudflare dashboard → **Analytics & Logs → Web Analytics → Add a site** → enter the site's hostname `coach-lazorko.github.io` (or the custom domain later) → choose the **JS snippet** option.
2. Copy the `token` value from the snippet and paste it into the admin: **Контакти та налаштування → Токен Cloudflare Web Analytics**. The script is only included once the token is set.

### Privacy policy

`privacy.html` (in Ukrainian), linked from the form's consent line and the footer. It describes exactly what the site does: the form goes through the Worker to Telegram, Cloudflare Web Analytics (that paragraph only shows once the token is set), GitHub Pages hosting, Google Maps and YouTube embeds. The coach's name and contacts come from `_data/settings.yml`. If you change how data is handled, update the text and the date at the bottom. It's a plain-language template, not legal advice.

### Maps

Each gym in `settings.yml → gyms` gets its own Google Map (embed, no API key) and a route button. If the pin lands in the wrong place, fill in `map_query` with a more precise address.

### Not filled in yet

Not filled in yet: phone, coach photo and own bio, schedule times, achievements (his students' results), gallery, videos, reviews. Empty sections and an empty phone are hidden on the site and appear automatically once added in the admin. Still to set up: the Telegram form Worker and the Cloudflare Web Analytics token.

### Security

- **No server or database.** The site is static files. Whoever controls a GitHub account with write access controls the site, so turn on **2FA** for those GitHub accounts and for the Cloudflare account.
- **Admin token:** fine-grained, this repo only, Contents read/write, expires within a year. It's kept in the browser, so don't use the admin on shared computers, and revoke the token if a device is lost. Any unwanted change can be undone from git history.
- **Admin script** is pinned with Subresource Integrity. When bumping the Sveltia version in `admin/index.html`, recompute the hash:
  `curl -sL https://unpkg.com/@sveltia/cms@<version>/dist/sveltia-cms.js | openssl dgst -sha384 -binary | openssl base64 -A`
- **github.io origin:** all Pages sites of one account share the origin `coach-lazorko.github.io`, so another Pages site on the same account could read the admin token. A custom domain isolates it. Until then, don't host untrusted Pages sites on the owner's account.
- **Never commit secrets.** This repo is public. Bot token and chat ID live only in Cloudflare's Worker secrets. If the bot token leaks, revoke it in @BotFather (`/revoke`).
- **Form Worker:** spam trap, origin check, field and size limits. Scripts can fake the origin, so if spam shows up, add [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) (free). While `TELEGRAM_CHAT_ID` is unset, the Worker URL lists names and IDs of whoever messaged the bot, so finish setup right away.
- **Personal data:** applications (names, phones, children's ages) are stored only in the Telegram chat that receives them. Keep that chat limited to the coach.

## Credits

Logo: Golden Lion artwork provided by the site owner (`logo-mark.png` is the same mark cropped, with a transparent background). UI icons: [Lucide](https://lucide.dev) (ISC). Brand icons: [Simple Icons](https://simpleicons.org) (CC0). Fonts: [Fixel](https://github.com/MacPaw/Fixel) by MacPaw, Kyiv (OFL-1.1), self-hosted in `assets/fonts/`. CMS: [Sveltia CMS](https://github.com/sveltia/sveltia-cms) (MIT).
