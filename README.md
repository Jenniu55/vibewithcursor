# Prototyping with Cursor

This is your personal prototyping workspace for the "Prototyping with Cursor" class. Here you can create and organize all your interaction design prototypes using Next.js.

## Getting started

1. Click "Use this template"
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### If you see a 404 on localhost

- **Stop any other dev servers** (close extra terminals or press Ctrl+C where `npm run dev` is running). Only one dev server should be running.
- Do a clean start: delete the `.next` folder, then start the dev server again:
  ```bash
  rm -rf .next
  npm run dev
  ```
  Or use the direct command: `./node_modules/.bin/next dev --hostname 127.0.0.1`
- If the app runs but `npm run dev` says "next: command not found", use: `./node_modules/.bin/next dev --hostname 127.0.0.1`

## Project structure (beginner guide)

This section explains what each part of the project does, in plain language. You don’t need to memorize it—use it as a map when you’re looking for something.

### The big picture

- The project is a **website** that runs on your computer (localhost).
- The **home page** lists all your prototypes. Each prototype is a separate “page” you can click into.
- Everything you edit to change how the site looks and works lives inside the **`app/`** folder.

### What’s in the root folder (next to `app/`)

| File or folder | What it’s for |
|----------------|----------------|
| **`package.json`** | Project settings and list of dependencies (libraries the project uses). The `"scripts"` section is where commands like `npm run dev` are defined. |
| **`next.config.ts`** | Configuration for Next.js (the framework that runs the site). You usually don’t need to change this. |
| **`tsconfig.json`** | Configuration for TypeScript (the language we use for code). You usually don’t need to change this. |
| **`node_modules/`** | All the installed dependencies. Don’t edit this folder; it’s updated when you run `npm install`. |
| **`.next/`** | Temporary build output. Next.js creates this when you run `npm run dev` or `npm run build`. Safe to delete if something seems broken (then run `npm run dev` again). |
| **`README.md`** | This file—instructions and documentation for the project. |

### What’s inside `app/`

This folder defines the **pages** of your site and the **shared layout and styles**.

| File or folder | What it’s for |
|----------------|----------------|
| **`page.tsx`** | The **home page** (the one you see at `http://localhost:3000`). It shows the list of prototype cards. |
| **`layout.tsx`** | The **wrapper around every page**: fonts, metadata (e.g. title in the browser tab), and the basic HTML structure. Changing this affects the whole site. |
| **`fonts.ts`** | Where custom fonts (e.g. Instrument Sans) are set up for the app. |
| **`error.tsx`** | The “Something went wrong” screen if a page crashes. |
| **`not-found.tsx`** | The “Page not found” (404) screen when someone visits a URL that doesn’t exist. |
| **`global-error.tsx`** | A fallback if something goes wrong in the root layout. |
| **`styles/`** | **Global styles**: `globals.css` (resets and variables for the whole site) and `home.module.css` (styles for the home page). |
| **`prototypes/`** | **One folder per prototype.** Each prototype has its own URL and its own `page.tsx` and styles. |

### How URLs match folders

Next.js turns **folder names** into **URL paths**:

- `app/page.tsx` → **`/`** (home)
- `app/prototypes/example/page.tsx` → **`/prototypes/example`**
- `app/prototypes/confetti-button/page.tsx` → **`/prototypes/confetti-button`**

So: **new folder under `app/prototypes/` with a `page.tsx` = new page at `/prototypes/your-folder-name`.**

### What’s inside one prototype (e.g. `app/prototypes/example/`)

| File or folder | What it’s for |
|----------------|----------------|
| **`page.tsx`** | The content and behavior of that prototype (what you see when you open that prototype’s URL). |
| **`styles.module.css`** | Styles used only by that prototype. The “module” means the class names are scoped to this prototype and won’t clash with others. |
| **`images/`** (optional) | Images used only in this prototype. |

### The `_template` folder

- **`app/prototypes/_template/`** is a **starter kit** for new prototypes.
- You **copy** from `_template` into a new folder (e.g. `my-prototype`), then edit the copy.
- Don’t change `_template` itself so it stays a clean starting point.

### Summary in one sentence

**All code lives in `app/`:** `page.tsx` and `layout.tsx` run the site, `styles/` holds shared styles, and each folder under `app/prototypes/` is one prototype with its own `page.tsx` and `styles.module.css`.

## Creating a new prototype

1. Open Composer Agent `(⌘-I)`
2. Type: "Create a prototype for me named `<name>`. "
3. Describe the key features
4. Share any design style preferences

### In case you need the manual way

1. Navigate to the `app/prototypes` directory
2. Create a new folder with your prototype name (e.g., `my-prototype`)
3. Copy the contents of the `_template` folder into your new folder:
   - Copy `page.tsx` - This contains the basic prototype structure
   - Copy `styles.module.css` - This contains the prototype styles
4. Create an `images` folder in your prototype directory for any images you'll use
5. Customize the files:
   - Rename the component in `page.tsx`
   - Update the title and content
   - Modify the styles in `styles.module.css`
   - Add images to your prototype's `images` folder
6. Add your prototype to the home page:
   - Open `app/page.tsx`
   - Find the `prototypes` array at the top of the file
   - Add a new object for your prototype:
     ```typescript
     {
       title: 'My New Prototype',
       description: 'A short description of what this prototype does',
       path: '/prototypes/my-prototype'  // This should match your folder name
     }
     ```
   - Your prototype will automatically appear on the home page

### Example structure
```
app/
├── prototypes/
│   ├── _template/              # Template folder - don't modify!
│   │   ├── page.tsx           # Template component
│   │   └── styles.module.css  # Template styles
│   ├── example/               # Example prototype
│   │   ├── images/           # Prototype-specific images
│   │   │   └── example.jpg
│   │   ├── page.tsx
│   │   └── styles.module.css
│   └── your-prototype/        # Your new prototype
│       ├── images/           # Your prototype's images
│       ├── page.tsx
│       └── styles.module.css
├── components/               # Shared components
└── public/                  # Global static assets only like images
```

## Working with images

Store all images in the `/public` directory using this structure:

```
public/
    prototypes/           # Prototype-specific images
        example/          # Images for the example prototype
        your-prototype/   # Images for your prototype
    shared/              # Shared images used across prototypes
        icons/
        common/
```

## Adding a new component

When asking the Agent to create a new component, use this format:

```
Create a new component named <name> with these specifications:
1. Purpose: [Describe what the component does]
2. Props: [List the props the component should accept]
3. Variants: [List any visual variants needed]
4. States: [List any states like hover, disabled, loading, etc.]
5. Styling: [Describe any specific styling requirements]
6. Behavior: [Describe any interactive behavior]
7. Accessibility: [List any accessibility requirements]
```

Example request:
```
Create a new component named Input with these specifications:
1. Purpose: A text input field for forms
2. Props:
   - label: string
   - placeholder: string
   - error?: string
   - type?: 'text' | 'password' | 'email'
3. Variants:
   - Default
   - With error
4. States:
   - Default
   - Focus
   - Disabled
   - Error
5. Styling:
   - Modern minimal design
   - Subtle border that highlights on focus
   - Error state should show red border
6. Behavior:
   - Show error message below input when error prop is provided
   - Password type should have a show/hide password toggle
7. Accessibility:
   - Label should be properly associated with input
   - Error messages should be announced by screen readers
```