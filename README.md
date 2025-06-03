# Next.js & HeroUI Template

This is a template for creating applications using Next.js 14 (app directory) and HeroUI (v2).

[Try it on CodeSandbox](https://githubbox.com/heroui-inc/heroui/next-app-template)

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)

## How to Use

### Use the template with create-next-app

To create a new project based on this template using `create-next-app`, run the following command:

```bash
npx create-next-app -e https://github.com/heroui-inc/next-app-template
```

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).

## Legal & Policies

- Privacy Policy: `/privacy`
- Terms of Service: `/terms`
- Cancellation & Refunds: `/cancellation` (new, accessible from footer)
- Please review these pages to understand how user data is handled and the rules for using the service.

## Public Pages

- Privacy Policy: `/privacy`
- Terms of Service: `/terms`
- Cancellation & Refunds: `/cancellation` (new, accessible from footer)

## Features

- Subscription management (Razorpay integration)
  - Plan selection, upgrade, and payment
  - **User-initiated subscription cancellation from Settings page**
  - Backend API integration for Razorpay subscription cancel

## SEO

- Includes `robots.txt` and `sitemap.xml` in `public/` for search engine indexing.
- Open Graph and Twitter Card meta tags are set in `app/layout.tsx` for rich social sharing and SEO.
