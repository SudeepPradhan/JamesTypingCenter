# WPM Tester

Simple local webpage to measure typing speed (words per minute).

How to use

- Open `index.html` in a browser (double-click or `start index.html` on Windows).
- Start typing in the textarea; the timer begins on the first keystroke.
- Click **Stop** to pause the timer, or **Reset** to clear and start over.

Sample paragraph & share link

- Click **Load Sample** to populate the textarea with a ready paragraph.
- Click **Copy Share Link** to copy a link that includes the sample (`?sample=1`). Anyone who opens that link will see and can type the sample immediately.

Hosting (GitHub Pages)

1. Create a new GitHub repository and push these files.
2. In the repo settings, enable GitHub Pages for the `main` branch (root). Your site will be published at `https://<your-username>.github.io/<repo>/`.
3. Append `?sample=1` to the site URL to create a shareable link that loads the sample paragraph.

Example shareable URL:

`https://<your-username>.github.io/<repo>/?sample=1`

Accuracy

- When you use the sample paragraph (click **Load Sample** or open the site with `?sample=1`), the site compares your typed characters to the sample and reports an accuracy percentage in the stats popup.
- If you type freely without loading the sample, accuracy shows as `N/A` because there is no reference text to compare against.

Files

- `index.html` — main page
- `styles.css` — styling
- `script.js` — timer and WPM logic
