# Blog CMS

A modern, production-ready blog content management system built with Next.js 15 and deployed on Cloudflare Workers. Features a rich text editor, media management, and a clean admin interface.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/)

## Features

- 🚀 **Modern Stack**: Next.js 15, React 19, TypeScript
- ☁️ **Cloudflare Platform**: Workers, D1 Database, R2 Storage
- ✍️ **Rich Editor**: TipTap editor with image uploads
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔐 **Secure Authentication**: JWT-based admin authentication
- 📊 **Media Management**: Upload and organize images
- 🏷️ **Content Organization**: Tags and categories
- 🌐 **SEO Friendly**: Optimized URLs and meta tags
- 🔧 **Production Ready**: Multiple environments, monitoring, backups

## Getting Started

First, run:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then run the development server (using the package manager of your choice):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Deploying To Production

| Command                           | Action                                       |
| :-------------------------------- | :------------------------------------------- |
| `npm run build`                   | Build your production site                   |
| `npm run preview`                 | Preview your build locally, before deploying |
| `npm run build && npm run deploy` | Deploy your production site to Cloudflare    |
| `npm wrangler tail`               | View real-time logs for all Workers          |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
