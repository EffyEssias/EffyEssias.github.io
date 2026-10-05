# Effy! Portfolio

A multi-page static portfolio prepared for GitHub Pages. It uses plain HTML, CSS and JavaScript; no build step is required. `portfolio.html` lists the projects, and each project has its own page under `projects/`. `blog.html` is for personal stories and `dev-logs.html` is for work-in-progress updates. The `assets/reference/` folder contains local copies of images served by the existing Framer portfolio, including the rainbow banner, Effy logo, Paint window and sample project images.

## Run locally

Open `index.html` in a browser, or run a local static server from this folder (for example `python -m http.server 8000`). Then visit `/portfolio.html` to browse the project list.

## Site name and web address

You can choose the name visitors see in the page titles and headings in the HTML files, and replace the EFFY! logo image if you want different branding. The default GitHub Pages address follows your GitHub username and repository name:

- For a root address like `https://YOUR-USERNAME.github.io/`, name the repository `YOUR-USERNAME.github.io`.
- For a repository with another name, the address will look like `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.
- To use a custom address such as `yourname.com`, you need to own that domain and configure it in GitHub Pages.

## Publish with GitHub Pages

1. Create a GitHub repository. A public repository is the simplest option for a free GitHub Pages site.
2. Upload **the contents of this folder** to the repository root, including `index.html`, the other `.html` files, `assets/`, and `projects/`.
3. Open the repository's **Settings → Pages** page.
4. Under **Build and deployment**, choose **Deploy from a branch**, select your publishing branch (usually `main`) and the `/(root)` folder, then save.
5. Wait for the Pages deployment to finish. The Pages settings page will show the published address.

GitHub's [Pages quickstart](https://docs.github.com/en/pages/quickstart) and [publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) show the current GitHub interface.

## Swap in your high-resolution artwork

Replace the corresponding images under `assets/reference/` with your preferred higher-resolution versions, keeping the same filenames, or add new images under `assets/` and update the image paths in the HTML files. Edit project names, descriptions, image galleries and social links in `index.html`, `portfolio.html` and `projects/` before publishing.

## Edit the site yourself

You can edit these files with VS Code, Notepad, or another text editor. This is plain HTML and CSS, so save a file and refresh the browser to see the change.

- `index.html` — homepage and the smaller featured-project cards.
- `portfolio.html` — the full project gallery.
- `blog.html` — blog stories and inspirations.
- `dev-logs.html` — dated progress notes and works in progress.
- `journal.css` — styles for the Blog and Dev Logs pages and their home-page cards.
- `projects.css` — layout and interactions shared by the gallery and project pages.
- `styles.css` and `assets.css` — the site's general look and local image styling.
- `projects/` — one HTML page per project.
- `assets/` — images used by the site, including `about-portrait.jpg` for the circular About portrait.

### Add a project

1. Make a folder such as `assets/my-project/` and put the project's images in it.
2. Copy `projects/lemon-town.html` to `projects/my-project.html`.
3. In the copy, change the page `<title>`, the project heading and text, and the hero image path. Use a unique page class on `<main>`, such as `class="project-detail project-my-project"`.
4. In `portfolio.html`, copy an existing project card and change its link to `projects/my-project.html`, its image, alt text, name and year. Copy the same card to the featured-project grid in `index.html` if you want it on the home page too.
5. Update the previous/next project links at the bottom of the new detail page.

### Add more images to a project

On the project's page, add image elements inside its `.detail-gallery` container. The existing images there open in the enlarged viewer when clicked.

```html
<div class="detail-gallery">
  <img src="../assets/my-project/scene.webp" alt="A colorful scene from My Project" />
  <img src="../assets/my-project/character.webp" alt="My Project character model" />
</div>
```

Use short filenames and write useful `alt` text. Keep the `../` at the start of image paths on pages inside `projects/`.

### Give one project its own look

The unique class on that page lets you style it without changing the other project pages. Add rules at the end of `projects.css`:

```css
.project-my-project .detail-cover {
  background: #d8ff00;
  min-height: 520px;
}

.project-my-project .detail-title {
  color: #f24884;
}
```

Change the class in both places to match your project page's own class. Edit shared rules without the `.project-my-project` prefix to change every project page.

## Image and button interaction

Text grows with a springy motion when hovered or pressed. Buttons and links pop larger; images zoom as you hover. On a project detail page, click or keyboard-activate an image to open the full-screen viewer. Use its arrows or left/right keys to move through that project's images; press Escape or click outside to close. Project-card clicks still open the project page.
