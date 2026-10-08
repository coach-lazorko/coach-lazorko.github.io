# Ярема Лазорко — кікбоксинг WAKO (Львів)

Static one-page site for GitHub Pages: plain HTML/CSS/JS, no build step.
Style follows the Golden Lion club logo: orange grunge "sun", black kicker silhouette, cream paper background, heavy display type.

```
index.html            page (all text is here, in Ukrainian)
assets/css/style.css  styles (colors are CSS variables at the top)
assets/js/main.js     mobile menu, scroll effects, contact form
assets/img/           logo.jpg, emblem.svg, favicon.svg
.nojekyll             tells GitHub Pages to serve files as-is
```

## Preview locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy to GitHub Pages

```bash
git init && git add . && git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

On GitHub, open **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save. The site will be served at `https://<user>.github.io/<repo>/`.

## Fill in the content

Already filled in: coach name (Ярема Лазорко), Instagram [@coach_lazorko](https://www.instagram.com/coach_lazorko/), Telegram [@Onionmm](https://t.me/Onionmm).

Every remaining spot has a `<!-- TODO -->` comment in `index.html`:

| Placeholder | Replace with |
|---|---|
| `+380000000000` / `+380 00 000 00 00` | phone number (link form / display form) |
| `XX+`, `XXX+`, `XX` in the hero | real stats |
| `--:--` in the schedule | training times |
| "Назва змагань" cards | real competition results |
| Gallery `.ph` placeholders | `<img src="assets/img/photo-1.jpg" alt="...">` inside each `<figure>` |
| Coach photo placeholder | `<img class="coach-photo" src="assets/img/coach.jpg" alt="...">` |

**Logo:** the hero shows the original Golden Lion logo (`assets/img/logo.jpg`). The header, footer and favicon use the simplified `emblem.svg` / `favicon.svg`, because they stay readable at small sizes.

## Contact form

GitHub Pages can't process forms itself, so the form posts to [Formspree](https://formspree.io), which has a free tier:

1. Sign up, create a form, and copy its ID (e.g. `xyzabcd`).
2. In `index.html`, replace `YOUR_FORM_ID` in `action="https://formspree.io/f/YOUR_FORM_ID"`.
3. Submissions will arrive by email. Formspree asks you to confirm the first one.

Until the ID is set, submitting shows a message asking visitors to write in Telegram.

## Map / address

The address is currently **вул. Піша, 1, Львів** (the Golden Lion listing found online). Please verify it. To change it, URL-encode the new address and replace the text after `q=` in the map `<iframe src>` and after `destination=` in the "Маршрут" link. Also update the address text in the contacts list and map card.

## Credits

Kicker silhouette: [game-icons.net](https://game-icons.net) "High kick" (CC BY 3.0). The attribution is in the footer. UI icons: [Lucide](https://lucide.dev) (ISC). Brand icons: [Simple Icons](https://simpleicons.org) (CC0). Fonts: Russo One and Rubik (Google Fonts).
