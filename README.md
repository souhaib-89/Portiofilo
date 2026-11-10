# Souhaib Abdulaal Portfolio

A single-page portfolio built with plain HTML, CSS and JavaScript. There is no build step.

## Edit the content

Everything you read on the page comes from **`js/content.js`**. Change the text between the quotes, save, refresh.

- The text comes from the CV. Lines marked `PLACEHOLDER` are images that still need real files.
- The header's Resume button opens `assets/Souhaib-Abdulaal-CV.pdf`. Replace that file to update the CV.
- In headings, wrap words in `*stars*` to highlight them in the accent colour.
- Photos and screenshots: put the files in `assets/`, then point `hero.photos`, `about.photo` and each project's `image` to them. Portraits look best at 4:5, project covers at 16:10.
- Links left empty (`""`) show as inactive placeholders while `meta.draft` is `true`, and disappear when it is `false`.
- The greeting next to the logo cycles through the `greetings` list. Add, remove or reorder entries there.
- The page title and description that search engines show are in the `<head>` of `index.html`.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Deploy

- **Vercel**: import the folder or repository, choose the "Other" framework preset, leave the build command empty and keep the project root as the output directory.
- **GitHub Pages**: push the folder and enable Pages on the branch root.

## Contact form

Without any setup the form opens the visitor's email app with the message filled in.
To receive messages directly, create a form on Formspree or Web3Forms and set `meta.formEndpoint` (and `meta.formKey` for Web3Forms) in `js/content.js`.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page structure |
| `css/style.css` | All styles. Colours, fonts and spacing are variables at the top |
| `js/content.js` | All text, links and image paths |
| `js/main.js` | Rendering, animation and interactions |
| `assets/` | Images (the current ones are placeholders) |

Libraries are loaded from CDNs in `index.html`: GSAP 3.12.5 with ScrollTrigger, and Lenis 1.1.14 for smooth scrolling.
