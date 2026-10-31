# Biliz Nguyen — Research Atlas

A living academic research portfolio and learning notebook about **robotics, drone dynamics, reinforcement learning, LiDAR perception, rubber-tree sensing, physics, mathematics and chemistry**.

Unlike a conventional portfolio, this project highlights questions, derivations, hypotheses, reading notes, experimental plans, references and what was learned.

## Run locally

No Node/npm dependencies are needed:

```bash
python -m http.server 8000
```

Open http://localhost:8000.

## Deploy with GitHub Pages

Push all files to the root of `main`. In Settings → Pages, choose **Deploy from a branch**, **main** and **/(root)**. The expected site address is https://biliz-nguyen.github.io/portfolio/.

## Publish a new study note

Create `notes/my-new-note.md`, add its metadata in `data.js` with a matching slug, then commit. The post appears on the homepage and in the searchable knowledge base.

Mark articles clearly as study notes, research directions or actual validated experiments. Do not publish hypothetical metrics as experimental results.

## Repository layout

- `index.html` — academic homepage
- `knowledge.html` — searchable library + topic filters
- `note.html` — reusable note template
- `styles.css` — theme and responsive design
- `app.js` — rendering and search
- `data.js` — note metadata
- `notes/` — Markdown articles

The SVG drone/forest illustration is conceptual, not a real LiDAR scan.
