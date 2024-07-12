# Next.js + Contentful + Arboretum starter

This project showcases the integration between [Next.js](https://nextjs.org/), [Contentful](https://www.contentful.com/) and [Arboretum SDK](https://github.com/BrightIT/arboretum-sdk).

## How to use

### Step 1. Create an account and a space on Contentful

First, [create an account on Contentful](https://www.contentful.com/sign-up/).

After creating an account, create a new empty **space**.

### Step 2. Install Arboretum app

The easiest way to get stared is to install [Arboretum app](https://www.bright.global/en/products/arboretum) in yor environment in contentful. By selecting "Automatic" installation mode Arboretum app will take care of all required configuration and will create sample content.

![](./arboretum-app-install-speedx2.gif)

### Step 3. Clone project

```bash
git clone git@github.com:BrightIT/arboretum-nextjs-example.git
cd arboretum-nextjs-example
```

### Step 4. Define .env.local

```bash
ARBORETUM_PREVIEW_REVALIDATE=
ARBORETUM_PUBLISHED_REVALIDATE=

CONTENTFUL_SPACE=
CONTENTFUL_ENVIRONMENT=
CONTENTFUL_CDA_ACCESS_TOKEN=
CONTENTFUL_CPA_ACCESS_TOKEN=
```

### Step 5. Start project
```bash
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.