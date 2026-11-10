# Souhaib Abdulaal Portfolio

A single-page portfolio (plain HTML, CSS and JavaScript, no build step) with a small dashboard for managing projects.

## The dashboard

Open `/admin` on the deployed site and sign in. From there you can add, edit, reorder and delete projects, upload a cover and extra images, and add links. Every change is saved straight away. You see it on the site immediately in the same browser; visitors see it within 5 minutes.

Each project has a details view on the site. Its address is `/#project-<name>`, so you can link to a project directly.

### One-time setup on Vercel

1. **Storage**: in the Vercel project, open **Storage**, create a **Blob** store with **Public** access and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
2. **Password**: in **Settings → Environment Variables**, add `ADMIN_PASSWORD`. Its value is the password you type at `/admin`. Make it long.
3. **Redeploy**: in **Deployments**, redeploy the latest deployment so the new settings apply.

Until both are set, `/admin` shows these steps and marks which one is missing.

### How it works

- `api/session.js` signs you in and out, `api/projects.js` reads and saves the project list, `api/upload.js` stores images. They are Vercel Functions.
- The project list is one JSON file in the Blob store; images are stored next to it. Images no project uses any more are deleted automatically.
- Until the dashboard has saved once, the site shows the starter projects in `js/content.js`. They also remain as a fallback if the storage cannot be reached.
- Large photos are resized in the browser before upload (the upload limit is about 4 MB per image).

## Edit the rest of the content

Everything else on the page comes from **`js/content.js`**. Change the text between the quotes, save and push.

- In headings, wrap words in `*stars*` to highlight them in the accent colour.
- Photos: put the files in `assets/`, then point `hero.photos` and `about.photo` to them. Portraits look best at 4:5.
- The header's Resume button opens `assets/Souhaib-Abdulaal-CV.pdf`. Replace that file to update the CV.
- The greeting next to the logo cycles through the `greetings` list.
- Links left empty (`""`) show as inactive placeholders while `meta.draft` is `true`, and disappear when it is `false`.
- The page title and description that search engines show are in the `<head>` of `index.html`.

## Run it locally

```bash
npm install
```

```bash
ADMIN_PASSWORD=choose-one npm run dev
```

Then open http://127.0.0.1:3000 (dashboard at `/admin`). Locally, projects and uploads are kept in a `.data` folder instead of Vercel Blob.

## Contact form

Without any setup the form opens the visitor's email app with the message filled in.
To receive messages directly, create a form on Formspree or Web3Forms and set `meta.formEndpoint` (and `meta.formKey` for Web3Forms) in `js/content.js`.

## Files

| Path | What it holds |
| --- | --- |
| `index.html` | Page structure |
| `css/style.css` | Site styles. Colours, fonts and spacing are variables at the top |
| `js/content.js` | Text, links, image paths and the starter projects |
| `js/main.js` | Rendering, animation and interactions |
| `admin/`, `css/admin.css`, `js/admin.js` | The dashboard |
| `api/` | Sign-in, project storage and image upload |
| `scripts/dev-server.js` | Local preview server |
| `assets/` | Images and the CV |

Libraries: GSAP 3.12.5 with ScrollTrigger and Lenis 1.1.14 (loaded from CDNs in `index.html`), and `@vercel/blob` for storage.
