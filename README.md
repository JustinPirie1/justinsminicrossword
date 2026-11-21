# Justin’s Mini

A mobile-friendly crossword player and constructor. Static HTML, CSS and JavaScript; no dependencies, accounts, database or paid hosting required.

## Run on your Mac

Double-click `crossword.html` for the self-contained version, or serve the source files:

```sh
npm start
```

Then open http://127.0.0.1:4173. Node is needed only for the npm commands; you can also use `python3 -m http.server 4173`.

## Play

Click **Let’s play**, then use the on-screen keyboard or your physical keyboard. Tap a square twice or press Space to switch direction. Arrow keys navigate; Tab and Shift+Tab change clues while the grid has focus. Check a square, word or puzzle; reveal letters; restart; pause the timer; mute the original completion melody. Progress saves on the current browser and device.

## Create

Choose **Create a puzzle**. Set a title and author, and choose 3–15 rows and columns. Resize starts a fresh grid after confirmation. Select **Black squares** to draw blocks; optionally mirror them through the grid’s centre. Select **Letters** to type the solution, or enter each answer in its answer field (the whole answer is selected on focus). Numbering updates automatically. Add every Across and Down clue. Paste emoji or use **Add emoji**. Emoji are supported in clues, titles, names, and answer squares. Use **Emoji square** to insert an emoji into the selected white square, including joined emoji, skin tones and flags. A matching emoji keyboard appears when playing a puzzle that uses emoji answers. The constructor also has an on-screen letter keyboard for phones.

Drafts save in this browser. Export JSON to keep multiple puzzles or a backup; import JSON to edit them again. Test play starts with an empty grid.

**Share puzzle** creates a compressed link containing your puzzle. On a hosted site, send that link to a friend on iPhone: it opens directly into the puzzle without an account. Use Copy link or the device’s share sheet. Localhost and file links only work on your own device, so host the app before sending a puzzle. Answers are included in the link and accessible to a technically curious player; this is a friendly game, not a secure competition. The editor is available to every visitor, with drafts stored separately on each device.

## Build the double-click version

Run `npm run build` after editing the source files. This regenerates `crossword.html` with the CSS, icon, model and app embedded so it can open without a server or internet connection.

## GitHub Pages

The included `.github/workflows/pages.yml` checks the app and deploys the static files on pushes to `main`.

1. Upload all project files to the repository, including `.github/workflows/pages.yml`.
2. In the repository’s **Settings → Pages**, choose **GitHub Actions** as the source.
3. Run the workflow or push a commit to `main`.
4. Use the URL returned by the successful Pages deployment.

GitHub’s free plan requires a public repository for Pages. If you keep this repository private, use a plan that supports private-repository Pages, or host these static files on a service such as Cloudflare Pages instead. The app itself needs no backend.

## Checks

```sh
npm test
node --check app.js
npm run build
```

Ten model tests cover numbering and crossings, rectangular grids and blocks, completion, validation, Unicode/emoji link round-trips, multi-codepoint emoji answer squares, distinct progress for different emoji, connected-grid validation, legacy uncompressed links, and stable clue ownership after renumbering. JavaScript syntax and standalone packaging are checked. Browser and physical iPhone verification could not be performed: the browser connection timed out and the sandbox blocks a local preview server.

## Design and audio

This is an independent project with a Mini-style player, its own Justin’s Mini branding, and an original synthesised completion melody. It includes no New York Times logos, proprietary assets, puzzle content, fonts or recordings. It is not a pixel-identical NYT reproduction.
