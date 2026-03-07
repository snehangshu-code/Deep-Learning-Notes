# How to Add New Notes

This guide explains how to add new study notes to your Deep Learning knowledge website.

## Steps

### 1. Create or prepare your HTML file

Your notes should be self-contained HTML files (with their own `<style>` and `<script>` tags inline). This is how all existing notes are structured.

### 2. Place the file in the `public/notes/` directory

```
public/
└── notes/
    ├── welcome.html
    ├── RNN_Notes.html
    ├── RNN_Forward_Prop_Interactive.html
    ├── rnn_diagram.html
    └── YOUR_NEW_NOTE.html    ← add here
```

### 3. Register the note in `main.js`

Open `main.js` and add a new entry to the `NOTES` array:

```js
{
  id: 'your-note-id',        // unique URL-friendly identifier
  title: 'Your Note Title',  // shown in sidebar
  file: 'YOUR_NEW_NOTE.html',// filename in public/notes/
  category: 'LSTM',          // category for sidebar grouping
  icon: '🔒',                // emoji icon shown before title
  description: 'Brief description of the note content',
  tags: ['lstm', 'gates'],   // search keywords
},
```

**Available categories** (new ones auto-appear):
- `Basics`, `RNN`, `LSTM`, `CNN`, `Transformers`, `Optimization`, `Advanced`

### 4. Verify locally

```bash
npm run dev
```

Open the browser and verify:
- The new note appears in the sidebar under the correct category
- Clicking it loads the content properly
- Search finds it by title, description, or tags

### 5. Build and deploy

```bash
npm run build
```

The `dist/` folder is ready to deploy to any static hosting provider.

---

## Deployment Options

### GitHub Pages
1. Push the `dist/` folder to a `gh-pages` branch
2. Or use GitHub Actions to automate builds

### Vercel
1. Connect your repo to Vercel
2. Build command: `npm run build`
3. Output directory: `dist`

### Netlify
1. Connect your repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

---

## Tips

- **Category colors**: Each category gets an automatic color dot. To customize, edit `CATEGORY_META` in `main.js`.
- **Note order**: Notes appear in the sidebar in the same order as the `NOTES` array.
- **Self-contained HTML**: Keep styles and scripts inline in your HTML files to ensure they render correctly in the iframe.
- **Images**: If your notes reference images, place them in `public/notes/images/` and use relative paths.
