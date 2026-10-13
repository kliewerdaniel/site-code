---
book_reference: true
categories:
- Vibe Coding
- Next.js
- Web Development
- AI Development
date: 2025-10-20 01:42:44 -0500
description: Master vibe coding to create production-ready Next.js boilerplates. Complete
  step-by-step guide from brainstorming to deployment using AI assistance and structured
  documentation.
layout: post
tags:
- Next.js
- Vibe Coding
- Boilerplate
- AI Development
- React
- TypeScript
- App Router
title: How to Vibe Code a Next.js Boilerplate Repository - Complete Guide 2025
wiki_references: ["mcp", "typescript"]
---

![Image](/images/1020001.png)

# How to Vibe Code a Next.js Boilerplate Repository: Complete Guide

**Vibe coding** revolutionizes software development by combining AI assistance with structured documentation to create production-ready applications efficiently. This comprehensive guide demonstrates how to build a complete Next.js boilerplate using vibe coding techniques, from initial brainstorming to final deployment.

## What is Vibe Coding?

Vibe coding transforms traditional development by leveraging AI tools and systematic documentation to accelerate project creation. Instead of coding line-by-line, developers use AI assistance, structured prompts, and comprehensive documentation to build robust applications quickly and efficiently.

## Assembling Essential Next.js Boilerplate Best Practices

### Standard Operating Procedure

<br>

I am going to start with a brainstorming prompt with just the [Google browser search bar](https://google.com), I don't want to use up any of my free allocation to other models. This still is vibe coding since Google supplies an AI generated answer for free! And some people complain about this free inference they are giving us.

<br>

```
what are the best practices for creating a boilerplate next.js repo that you would want to take into consideration when setting it up for the first time, I want all of the SOP and everything that you would want a senior software engineer to know and tell someone to take into consideration while they are drafting all of the stand operation procedure to be taken into account when drafting this repo
```

<br>



#### <summary>Google's AI Generated Response</summary>
<details>

When establishing a Next.js boilerplate repository, a senior software engineer would advise considering the following best practices and standard operating procedures (SOPs): 

#### Project Structure and Organization: 

• Clear Folder Structure: Establish a logical and consistent file and folder structure (e.g., src/pages, src/components, src/lib, src/styles, src/utils). This enhances navigability and maintainability. 

• Modularity: Design components and utility functions to be modular and reusable, promoting code reusability and reducing redundancy. 
• Co-location: Group related files and components together where it makes sense, improving discoverability and understanding. 

#### Development Tooling and Configuration: 

• TypeScript: Integrate TypeScript for type safety, improved code quality, and better developer experience. 

• ESLint and Prettier: Configure ESLint for code linting and Prettier for consistent code formatting, ensuring adherence to coding standards. 

• Husky and Lint-Staged: Implement pre-commit hooks with Husky and Lint-Staged to automatically run linters and formatters on staged files, preventing inconsistent code from entering the repository.

• Environment Variables: Clearly define and manage environment variables (e.g., API keys, database URLs) for different environments (development, staging, production). 

#### Performance Optimization: 

• SSR, SSG, and ISR: Understand and strategically utilize Server-Side Rendering (SSR), Static Site Generation (SSG), and Incremental Static Regeneration (ISR) based on the content's dynamism and performance requirements. 

• Image Optimization: Integrate Next.js's Image component and optimize image assets for faster loading times. 

• Caching Strategies: Implement effective caching mechanisms (e.g., request memorization, data cache, router cache) to minimize server load and improve user experience. 

#### Testing and Quality Assurance: 

• Testing Framework: Integrate a robust testing framework (e.g., Jest, React Testing Library) and establish a clear testing strategy (unit, integration, end-to-end tests). 

• Code Coverage: Set up code coverage reporting (e.g., Codecov) to monitor and ensure adequate test coverage. 

#### Deployment and CI/CD: 

• Version Control: Utilize Git and establish a clear branching strategy (e.g., Gitflow, GitHub Flow) for managing code versions and collaboration. 

• CI/CD Pipeline: Configure a Continuous Integration/Continuous Deployment (CI/CD) pipeline (e.g., GitHub Actions, Vercel) for automated builds, tests, and deployments. 

#### Documentation and SOPs: 

• README.md: Provide a comprehensive README.md with clear instructions for setup, development, testing, and deployment.

• Contributing Guidelines: Establish clear contributing guidelines for new developers joining the project. 

• Architecture Documentation: Document key architectural decisions and system design. 

#### Security Considerations: 

• Secure API Handling: Implement secure practices for handling API keys, tokens, and sensitive data. 

• Authentication and Authorization: Integrate robust authentication and authorization mechanisms as needed. 

By adhering to these principles and establishing clear SOPs, the Next.js boilerplate will serve as a solid foundation for building scalable, maintainable, and performant applications. 

#### AI responses may include mistakes.
</details>

<br>

### Dependencies


So from this I am going to start compiling together my initial brainstorming prompt. Bascially what I do is collect context from as many sources as I can and I am going to feed all of that to [NotebookLM](https://notebooklm.google.com/) to help us condense some of that information into a more usable prompt.

<br>

I already have a working next.js frontend running right now and I like how it works so one thing I can do to speed this up is to include all the dependencies from the package.json file in my previous version. So that is another piece of context to include which is below.

<br>

```
"dependencies": {
    "@react-three/drei": "^10.7.6",
    "@react-three/fiber": "^9.3.0",
    "@tailwindcss/typography": "^0.5.19",
    "@types/three": "^0.180.0",
    "framer-motion": "^12.23.22",
    "gray-matter": "^4.0.3",
    "next": "15.5.4",
    "next-mdx-remote": "^5.0.0",
    "next-sitemap": "^4.2.3",
    "octokit": "^5.0.3",
    "prismjs": "^1.30.0",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-markdown": "^10.1.0",
    "rehype-prism-plus": "^2.0.1",
    "rehype-raw": "^7.0.0",
    "remark": "^15.0.1",
    "swr": "^2.3.6",
    "three": "^0.180.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/react": "^16.3.0",
    "@types/jest": "^30.0.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.5.4",
    "jest": "^30.1.3",
    "jest-environment-jsdom": "^30.1.2",
    "prettier": "^3.6.2",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
```

<br>


### Optimization

<br>

Another piece is the following prompt I have written in the past to improve the SEO for my site. This is something in the end I would like to have thought of from the beginning so that is why I am including it. Basically you can think of this as assembline all the pieces you would need in order to make this if you were actually coding it.


```
Core Objectives
Add and refine SEO metadata for every page and post.
Improve semantic HTML and add structured data (JSON-LD).
Optimize images, fonts, performance & Core Web Vitals.
Generate and configure sitemap and robots.txt.
Ensure clean URLs, canonical tags, no duplicate content.
Verify improvements via logs, Lighthouse, and automated checks.
Review /pages or /app directory structure.
Detect if using Pages Router or App Router.
Identify blog post generation (Markdown, MDX, CMS, etc.).
Create a TODO.md or SEO_IMPROVEMENT_LOG.md to track progress.
Metadata System Implementation
For Pages Router:
Add/import <Head> from next/head in all pages.
For App Router (Next.js 13+):
Use export const metadata = {} or generateMetadata() for dynamic pages.
Each page must include:
Title (≤ 60 characters, keyword-focused).
Meta description (≤ 160 characters, compelling).
Open Graph tags (og:title, og:description, og:image, og:url).
Twitter Card tags.
<link rel="canonical" href="https://example.com/...">.
For dynamic routes ([slug].tsx), generate metadata from post content.
3. Semantic HTML + Structured Data (JSON-LD)
Replace generic <div>s with semantic elements: <article>, <header>, <nav>, <main>, <footer>, <section>.
Add JSON-LD using <script type="application/ld+json"> for:
Blog posts → "@type": "Article"
Homepage → "@type": "WebSite"
About page → "@type": "Person" or "Organization"
Validate structured data using https://search.google.com/test/rich-results.
4. Image & Media Optimization
Replace all <img> with Next.js <Image />.
Ensure:
alt text is descriptive & keyword-relevant.
Images are automatically responsive and lazy-loaded.
Prefer modern formats like WebP.
5. Performance / Core Web Vitals Enhancements
Use next/font instead of external CSS font imports.
Audit third-party scripts; load via <Script strategy="lazyOnload" /> or afterInteractive.
Remove render-blocking scripts/styles.
Enable Static Site Generation wherever possible.
Use dynamic(() => import(...), { ssr: false }) where interactive-only.
6. Sitemaps, robots.txt, and Crawl Control
Install and configure next-sitemap.
Generate sitemap.xml and robots.txt automatically.
Add canonical base URL in config.
Add noindex to pages like /admin, /dashboard, /drafts.
7. Clean URLs & Avoid Duplicate Content
Ensure URL structure is lowercase, hyphen-separated (/blog/my-post-title).
Add 301 redirect from http → https, and non-www → www or vice versa.
Use canonical tags for paginated or duplicate content.
If pagination exists, add rel="next" and rel="prev".
8. Monitoring & Validation
Add commands to run Lighthouse and output reports to /seo-reports.
Validate metadata output by crawling the site locally.
Fix 404 errors, broken links, missing alt text, wrong status codes.
Log all SEO changes in SEO_IMPROVEMENT_LOG.md.
Be isolated to one logical SEO change.
Final Requirement
When SEO optimization is complete:
Provide a summary of changes.
Provide a checklist of unresolved items.
Do NOT break any existing functionality or styling.
Ensure site builds and deploys successfully.
```

<br>

### Documentation

<br>

Assembling the proper documentation for a project is another essential aspect to this process. So I am going to use [perplexity](https://www.perplexity.ai/) to seach for as many links as I can to include in our [NoteBookLM](https://notebooklm.google.com/) prompt once we eventually get there.

<br>

```
You are an expert internet researcher and software engineer with a lot of experience and you are going to look for all of the documentation that you would want an expert software engineer to have at their disposal while they are coding the absolute best boilerplate next.js repo to be used in the future. I want to use TailwindCSS, I want to use a Shadcn UI component library. 

The only returnable I want from you is a list of URLs of all of this documentation.
```

<br>

From the search I performed I was able to compile the following set of URLs.

<br>

```
# Next.js Documentation

https://nextjs.org/docs

https://nextjs.org/docs/app/getting-started

https://nextjs.org/docs/pages/api-reference/config/typescript

https://www.geeksforgeeks.org/reactjs/next-js-routing/

https://prismic.io/blog/nextjs-13-app-directory

https://nextjs.org/docs/app/getting-started/project-structure

https://nextjs.org/learn/dashboard-app

https://nextjs.org/docs/pages/api-reference/functions/use-router

# TailwindCSS Documentation

https://tailwindcss.com/docs

https://v2.tailwindcss.com/docs

https://www.jetbrains.com/help/webstorm/tailwind-css.html

# Shadcn UI Documentation

https://ui.shadcn.com/docs

https://codeparrot.ai/blogs/shadcn-ui-for-beginners-the-ultimate-guide-and-step-by-step-tutorial

# In-Depth Guides and Tutorials

https://www.contentful.com/blog/next-js-app-directory-guide-tutorial/

https://bugfender.com/blog/nextjs-router/

https://www.frontendeng.dev/blog/26-difference-between-app-and-pages-in-nextjs
```

<br>

## Structured Documentation Creation

### Using AI to Generate Project Documentation

**NotebookLM** serves as an intelligent documentation assistant, synthesizing research into actionable project documentation. The AI generates comprehensive prompts for creating essential project files that establish development standards and architectural guidelines.

### Core Documentation Files

**AI guidelines** establish project standards, mandating Next.js App Router usage, React Server Components, TypeScript integration, and shadcn/ui component implementation. 

**Requirements documentation** defines system prerequisites, core framework specifications, and mandatory features including comprehensive routing capabilities and robust error handling.

**Architecture documentation** outlines system design principles, emphasizing file-system based routing, nested layouts, and parallel rendering capabilities. 

**Implementation guidelines** provide detailed setup instructions for type safety, styling strategies, and routing implementation.

**Standards documentation** establishes coding conventions, file organization principles, and naming conventions.

**Security documentation** outlines authentication strategies, data protection measures, and security best practices.

**Testing documentation** defines testing methodologies, including unit testing, integration testing, and end-to-end testing approaches.

**Deployment documentation** provides comprehensive deployment strategies, including CI/CD pipelines, hosting options, and environment-specific configuration.

## Advanced Development Techniques

### Context Engineering and AI Integration

**Context engineering** involves systematically organizing project information to maximize AI assistance effectiveness. By creating comprehensive documentation before coding, developers establish clear parameters that guide AI-generated implementations.

### Multi-Stage Documentation Process

1. **Context Assembly**: Gather comprehensive information from multiple sources
2. **AI Processing**: Use NotebookLM to synthesize and organize information  
3. **Documentation Generation**: Create structured project documentation
4. **Context Enhancement**: Polish and refine documentation for clarity
5. **Implementation Guidance**: Generate detailed prompts for AI coding assistance

## Key Takeaways and Best Practices

### Vibe Coding Methodology

1. **Comprehensive Research**: Gather extensive context before implementation
2. **Structured Documentation**: Create detailed project specifications
3. **AI-Assisted Development**: Leverage AI tools for code generation
4. **Systematic Implementation**: Follow structured development phases
5. **Thorough Validation**: Test and verify all functionality

### Essential Success Factors

**Context quality** directly impacts AI assistance effectiveness. **Structured documentation** provides clear implementation guidelines. **Systematic phase execution** ensures comprehensive coverage of all requirements.

<br>

![Image](/images/1020002.png)

<br>

Now we can use this as a reference to build the app. If you were a real coder and not just a filthy vibe coder like me then you could use a notebook like that in order to help you along the way and refer back to documention. It really is a helpful tool. Which is why I always try to build my own version of it. You can see my latest vibe coding attempt at it [here.](https://danielkliewer.com/blog/2025-10-19-building-a-local-llm-powered-knowledge-graph)

Let's first draft a prompt to give the notebook to start building the context we need to create for our vibe coding session. Proper preperation of documents is half the battle.

One method I use to feed context to CLIne or whichever vibe coding platform you want to use is to draft a series of files to include in the root. So in this first prompt I am going to generate the prompts needed to start fleshing out these documents.

```
You are the best software engineer who has ever lived and you are going to create the absolute best boilerplate next.js repo you possibly can. I have included all of the information you need to assemble this in this notebook. I want you to crawl through all of the information and help to draft a series of prompts which I can give you in order for you to draft the following documents: 

ai_guidelines.md
This file serves as the central control document

requirements.md
Requirements Analysis

architecture.md
Architecture Design

implementation.md
Implementation Guidelines

testing.md
Testing Approach

security.md
Security Considerations

sop.md (Standard Operating Procedures)
Standard Operating Procedures
```

<br>

<summary>That gives us the following output:</summary>
<details>

This is an excellent starting point for building the ultimate Next.js boilerplate repository. As the expert software engineer, I will draw upon the extensive details provided regarding Next.js App Router conventions, development tooling, performance optimizations, and documentation requirements to draft highly detailed prompts for each required document.

Here are the structured prompts you can use to generate the foundational documentation for your best-in-class Next.js repository:

---

### Prompts for Documentation Generation

#### 1. ai_guidelines.md (Central Control Document)

**Prompt:** Draft the `ai_guidelines.md` file serving as the central control document for the Next.js boilerplate. Specify that the project must strictly use the **Next.js App Router** to leverage modern React features. Mandate the adoption of **React Server Components (RSC)** as the default component type. Integrate **TypeScript** for robust type safety and enforce the use of **Statically Typed Links** by enabling `typedRoutes: true` in `next.config.ts`. Mandate **Tailwind CSS** for styling and the use of **shadcn/ui**. Emphasize that all component integration must follow the **shadcn/ui Open Code philosophy** rather than importing pre-compiled packages. Finally, establish that all future development prompts must strictly adhere to the documented **Project Structure and Organization** best practices, including **colocation** and the use of **private folders (`_folderName`)** for utilities.

#### 2. requirements.md (Requirements Analysis)

**Prompt:** Draft the `requirements.md` file. Detail the fundamental software requirements for this production-ready application, including the prerequisite for **Node.js v18.18.0 or later**. The core application must be built using the **Next.js App Router** to facilitate modern features such as **nested layouts** and the use of **React Server Components**. List mandatory features based on the App Router's design principles:
1. Comprehensive **Routing Capabilities** covering **Static Routes**, **Nested Routes**, **Dynamic Routes (`[segment]`)**, **Catch-All/Optional Catch-All Routes (`[...segment]`/`[[...segment]]`)**, **Parallel Routing (`@folder`)**, and **Route Grouping (`(folder)`)**.
2. Robust **Error Handling** using the dedicated **`error.js`** file for runtime errors, **`loading.js`** for suspense boundaries, and **`not-found.js`** or the **`notFound()` function** for 404 handling.
3. Efficient **Data Fetching** using async React Server Components and server-side `fetch` with support for **caching, revalidation, and request memoization**.
4. Integration of **SEO and Metadata** requirements using the Next.js metadata API.

#### 3. architecture.md (Architecture Design)

**Prompt:** Draft the `architecture.md` file outlining the system design for the boilerplate. Detail the reliance on the **file-system based routing** system of the Next.js App Router, where **directories define routes** and special files like **`page.js`** define page content. Explain how the architecture maximizes **code reusability** through the use of **Nested Layouts (`layout.js`)** and the component architecture. Describe the structural advantages of **Colocation** and the ability to structure paths without affecting the URL using **Route Groups (`(folderName)`)**. Detail the usage of **Parallel Routing (`@slot`)** to render independent pages/components simultaneously within the same layout. Explain the primary data fetching paradigm: utilizing **async React Server Components (RSC)** to fetch data directly, noting that this allows safe performance of sensitive data requests (like database calls) without needing an intermediary API route. Finally, define the backend architecture based on **Next.js Route Handlers (`route.js/.ts`)** for developing API services supporting methods like GET, POST, PUT, DELETE, etc..

#### 4. implementation.md (Implementation Guidelines)

**Prompt:** Draft the `implementation.md` file. Provide detailed guidelines for setting up the codebase and ensuring consistency.
1. **Type Safety:** Enforce the use of **TypeScript** and ensure the inclusion of generated Next.js types in `tsconfig.json`.
2. **Styling and Components:** Define the strategy using the **utility-first philosophy of Tailwind CSS** and mention key styling methods supported (Tailwind CSS, CSS Modules, Global CSS). Detail component implementation using **shadcn/ui** and its approach of providing direct component code for customization.
3. **Routing Implementation:** Instruct developers on navigating using the **`Link` component** for transitions and the **`useRouter` hook** for programmatic navigation. Note that components using hooks like `useRouter` must be declared as **Client Components** using the `'use client'` directive.
4. **State Management:** Outline implementation using the special files: **`loading.js`** (Suspense), **`error.js`** (must be a client component), and **`not-found.js`** (custom 404 page).
5. **SEO/Optimization:** Require using the **`export const metadata = {}` or `generateMetadata()`** convention in the App Router for SEO metadata. Mandate strategic utilization of **SSR, SSG, and ISR**, along with **Image and Font Optimization**.

#### 5. testing.md (Testing Approach)

**Prompt:** Draft the `testing.md` file defining the Quality Assurance strategy. Specify the integration of a robust **testing framework** such as Jest and React Testing Library as development dependencies. Detail the need for a clear testing strategy encompassing **unit, integration, and end-to-end tests**. Establish the mandatory requirement for **Code Coverage reporting** to ensure adequate test coverage is maintained. Ensure the plan requires testing critical Next.js features, including:
1. Functionality of all major route types (Static, Dynamic, Nested, Parallel).
2. Validation of programmatic navigation using the `useRouter` hook methods (`push`, `replace`, `prefetch`).
3. Confirmation that the specialized files, **`error.js` and `not-found.js`**, correctly intercept and display expected errors and 404 states.

#### 6. security.md (Security Considerations)

**Prompt:** Draft the `security.md` file addressing key concerns for a Next.js application. Outline secure practices for **handling API keys, tokens, and sensitive data**. Mandate the clear definition and management of **Environment Variables** for different stages (development, production) using `.env` files. Highlight the security benefit of using **React Server Components (RSC)** for data fetching, as this allows direct, safe execution of sensitive operations (like database queries) on the server, preventing credentials from leaking to the client. Require the integration of robust **Authentication and Authorization mechanisms**, noting that features like NextAuth.js and Middleware are common components for protecting dashboard pages.

#### 7. sop.md (Standard Operating Procedures)

**Prompt:** Draft the `sop.md` (Standard Operating Procedures) file detailing the required operational workflow and code management standards for the project.
1. **Version Control:** Specify the utilization of Git with a clear **branching strategy (e.g., Gitflow or GitHub Flow)**.
2. **Code Quality Enforcement:** Establish the use of **Husky and Lint-Staged** to run linters and formatters (ESLint, Prettier) on staged files **automatically before committing**.
3. **Development Structure:** Enforce adherence to the Next.js **Project Structure**, including the recommendation to use the **optional `src/` directory** to separate application code from configuration files.
4. **Deployment:** Define the **CI/CD Pipeline** using services like GitHub Actions or Vercel for automated builds, testing, and deployment.
5. **Documentation Maintenance:** Stipulate the required project documentation: a comprehensive **README.md**, clear **Contributing Guidelines**, and consistent maintenance of the **Architecture Documentation**.
6. **Next.js Utility Usage:** Document the correct use of navigation elements, specifically reserving the native anchor tag (`<a/>`) for external links, and using the Next.js **`Link` component** for internal application navigation.
</details>

<br>

Now it is as simple as feeding each of these prompts in turn to NotebookLM loaded with our context to draft the accompanying files.

<br>

### ai_guidelines.md

<br>

```
Draft the ai_guidelines.md file serving as the central control document for the Next.js boilerplate. Specify that the project must strictly use the Next.js App Router to leverage modern React features. Mandate the adoption of React Server Components (RSC) as the default component type. Integrate TypeScript for robust type safety and enforce the use of Statically Typed Links by enabling typedRoutes: true in next.config.ts. Mandate Tailwind CSS for styling and the use of shadcn/ui. Emphasize that all component integration must follow the shadcn/ui Open Code philosophy rather than importing pre-compiled packages. Finally, establish that all future development prompts must strictly adhere to the documented Project Structure and Organization best practices, including colocation and the use of private folders (_folderName) for utilities.
```

<br>

<summary>ai_guidelines.md</summary>
<details>

## ai_guidelines.md

# AI Development Guidelines for Next.js Boilerplate

This document serves as the central control mandate for all development work, ensuring consistency, maintainability, and optimal performance of the Next.js boilerplate. All future prompts and development implementations must strictly adhere to these principles.

---

## 1. Core Framework and Routing Mandates

The boilerplate must exclusively utilize the Next.js App Router and leverage modern React features.

### 1.1 App Router Requirement

The project must strictly use the **Next.js App Router**. This is the recommended approach for new projects and offers significant improvements over previous page routers. The App Router leverages the benefits and updates introduced in the latest version of React (React 18 and later), including the use of React canary releases built-in.

### 1.2 Default Component Type: React Server Components (RSC)

**React Server Components (RSC) are mandated as the default component type.** The App directory enforces server-side rendering by default and makes use of RSC.

*   **RSC Benefits:** Each page under a route in the App Router is a ReactJS server component. RSC reduces the amount of client-side code that needs to be loaded, improving application performance.
*   **Data Fetching:** For data fetching, developers should use `fetch` and `async` APIs directly within Server Components. Since RSCs perform requests on the server, sensitive data requests (like database calls) can be performed directly without needing an intermediary API route, as credentials or secrets are not leaked to the client.

## 2. Type Safety and Linking

**TypeScript** must be integrated for robust type safety and improved code quality.

### 2.1 Statically Typed Links

To enhance type safety when navigating between pages and prevent typos and errors when using `next/link`, **Statically Typed Links must be enforced**.

This feature requires enabling `typedRoutes: true` in the Next.js configuration.

**Implementation in `next.config.ts`:**
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    typedRoutes: true, // Mandates statically typed links
}

export default nextConfig
```
When enabled, Next.js validates literal `href` strings and types `next/navigation` methods like `push`, `replace`, and `prefetch` within the App Router.

## 3. Styling and UI Library

### 3.1 Styling with Tailwind CSS

**Tailwind CSS is mandated for all styling needs**. Tailwind CSS uses a utility-first approach, scanning components for class names and generating corresponding styles.

### 3.2 UI Component Strategy: shadcn/ui and Open Code

The UI components must be sourced using **shadcn/ui**.

*   **Open Code Philosophy Mandate:** Component integration **must strictly follow the shadcn/ui Open Code philosophy**. Shadcn/ui is explicitly **not a traditional component library** where pre-compiled packages are imported from NPM.
*   **Integration Method:** Developers must integrate components by obtaining the actual component code, allowing for full transparency and easy customization. This allows developers to directly edit the source code, avoiding the need for wrapping components or writing workarounds to override styles.
*   **Composition:** All components should share a common, composable interface, making them predictable.

## 4. Project Structure and Organization

All future development prompts and implementations must strictly adhere to the documented Project Structure and Organization best practices.

### 4.1 Colocation

**Colocation is mandated** for improved code structure, organization, and developer experience. Related files and components should be grouped together where it makes sense.

*   In the App Router, files can be **safely colocated** inside route segments in the `app` directory without accidentally being routable, as only the content returned by `page.js` or `route.js` is sent to the client.

### 4.2 Private Folders for Utilities

To separate implementation details from the routing logic and organize internal files consistently, the use of **Private Folders is mandated** for utilities, hooks, or shared components.

*   **Naming Convention:** Private folders must be created by prefixing a folder with an underscore: `_folderName`.
*   **Routing Exclusion:** Prefixing a folder with an underscore opts the folder and all its subfolders out of the routing system, signifying it as a private implementation detail.
*   **Use Cases:** These folders are a safe place for non-routable files such as UI utilities (`_components`) or data utilities (`_lib`).

</details>

<br>

### requirements.md

<br>

```
Draft the requirements.md file. Detail the fundamental software requirements for this production-ready application, including the prerequisite for Node.js v18.18.0 or later. The core application must be built using the Next.js App Router to facilitate modern features such as nested layouts and the use of React Server Components. List mandatory features based on the App Router's design principles:

Comprehensive Routing Capabilities covering Static Routes, Nested Routes, Dynamic Routes ([segment]), Catch-All/Optional Catch-All Routes ([...segment]/[[...segment]]), Parallel Routing (@folder), and Route Grouping ((folder)).
Robust Error Handling using the dedicated error.js file for runtime errors, loading.js for suspense boundaries, and not-found.js or the notFound() function for 404 handling.
Efficient Data Fetching using async React Server Components and server-side fetch with support for caching, revalidation, and request memoization.
Integration of SEO and Metadata requirements using the Next.js metadata API.
```

<br>

<summary>requirements.md</summary>
<details>

# requirements.md

## 1. System Prerequisites

To ensure stable development and deployment of the application, the following environment prerequisites must be met:

| Requirement | Details | Source |
| :--- | :--- | :--- |
| **Node.js** | **v18.18.0 or later** must be installed. Next.js installation typically requires Node.js v18.x or above. | |
| **Next.js** | The latest stable version of Next.js should be used, with the **App Router** enabled during project creation. | |
| **Development OS** | Support for macOS, Windows (including WSL), or Linux operating systems. | |

## 2. Core Application Framework

The application must be built as a full-stack web application using the Next.js App Router, leveraging modern React features for optimal performance and structure.

| Requirement | Details | Source |
| :--- | :--- | :--- |
| **Framework** | The core application must exclusively utilize the **Next.js App Router**. The App Router is the recommended approach for new projects, replacing the older Pages Router. | |
| **Component Architecture** | The application must leverage the capabilities of **React Server Components (RSC)**, which the App Router supports. Each route page (`page.js` or `.tsx`) is, by default, a ReactJS server component. | |
| **Layout Management** | The application structure must utilize the App Router's file-system based routing to implement **nested layouts** using the dedicated `layout.js` (or `.tsx`) file convention. Layouts defined at any level wrap their child segments. | |

## 3. Mandatory Features based on App Router Design Principles

### 3.1 Comprehensive Routing Capabilities

The application must demonstrate mastery of the file-system based routing principles of the App Router. Folders define URL segments, and a route becomes public when a `page` or `route` file exists within the directory.

| Feature | Convention/Usage | Source |
| :--- | :--- | :--- |
| **Static Routes** | Defined by directories with known route segment names (e.g., `app/about/page.tsx` results in `/about`). | |
| **Nested Routes** | Created by nesting folders under the `app/` directory (e.g., `app/blog/authors/page.tsx` results in `/blog/authors`). | |
| **Dynamic Routes** | Parameterize segments using square brackets (e.g., `[segment]` or `[slug]`). Values are accessed via the `params` prop in the page component. | |
| **Catch-All Routes** | Defined using `[...segment]`. This matches multiple subsequent route segments (e.g., `/shop/clothing/shirts`). | |
| **Optional Catch-All Routes** | Defined using `[[...segment]]`. This allows matching a variable number of segments, including zero segments (e.g., `/docs` or `/docs/pages`). | |
| **Parallel Routing** | Renders one or more pages in the same layout simultaneously. Named slots are defined using the **`@folder`** convention (e.g., `@growth`) and are received as props in the parent layout. | |
| **Route Grouping** | Used for organizing routes logically without affecting the URL path. Group folders are wrapped in parentheses (e.g., **`(marketing)`**). | |

### 3.2 Robust Error Handling and Suspense Boundaries

The application must implement robust error management using dedicated special files and functions provided by the App Router.

| Feature | Convention/Usage | Source |
| :--- | :--- | :--- |
| **Runtime Error Handling** | Implemented using the dedicated **`error.js`** file within a route segment. The component exported from `error.js` must be a client component (using `'use client'`). | |
| **Loading States / Suspense** | Implemented using the **`loading.js`** file convention in a route segment to display loading UI (skeletons). This file automatically wraps the corresponding page in a `<Suspense>` boundary. | |
| **404 Not Found UI** | A customized 404 page must be implemented using **`not-found.js`** under the `app/` directory to handle any unmatched routes throughout the application. | |
| **Programmatic 404** | The built-in **`notFound()`** function must be used within a route segment to throw the `NEXT_NOT_FOUND` error, which stops the current rendering process and displays the nearest `not-found.js` file. | |

### 3.3 Efficient Data Fetching

Data fetching must prioritize server-side operations using React Server Components to optimize performance and security.

| Feature | Convention/Usage | Source |
| :--- | :--- | :--- |
| **Server Data Fetching** | Data fetching must be performed directly using `async` React Server Components and the native **server-side `fetch`** function. This allows for direct, safe calls to sensitive resources (like databases) without needing an intermediary API route, as requests occur safely on the server. | |
| **Caching Support** | Server-side `fetch` requests must utilize Next.js's built-in caching features, supporting strategies similar to `getStaticProps` (e.g., `cache: 'force-cache'`). | |
| **Revalidation Support** | Fetch requests must support **time-based revalidation** to fetch data at specific intervals (similar to `getStaticProps` with `revalidate` option, e.g., `next: { revalidate: 10 }`). | |
| **Request Memoization** | The application must leverage Next.js's automatic **request memoization** for all `fetch` requests within the component tree, ensuring that duplicate requests for the same data do not incur performance penalties. | |

### 3.4 Integration of SEO and Metadata Requirements

Search Engine Optimization (SEO) must be integrated using the Next.js metadata API conventions specific to the App Router.

| Requirement | Convention/Usage | Source |
| :--- | :--- | :--- |
| **Metadata API** | Metadata requirements must be defined in layouts or pages using the Next.js **`export const metadata = {}`** object or the **`generateMetadata()`** function. | |
| **Mandatory Tags** | Every page must include essential SEO tags: `title` (keyword-focused, $\le$ 60 characters) and `description` (compelling, $\le$ 160 characters). | |
| **Social Sharing** | Implementation must include Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) and Twitter Card tags to optimize content for social sharing. | |
| **Generated Files** | The application structure should account for file conventions for automatic SEO generation, such as `sitemap.xml` or `sitemap.js` (Generated Sitemap), and `robots.txt` or `robots.js` (Generated Robots file). | |


</details>

<br>

### architecture.md

<br>

```
Draft the architecture.md file outlining the system design for the boilerplate. Detail the reliance on the file-system based routing system of the Next.js App Router, where directories define routes and special files like page.js define page content. Explain how the architecture maximizes code reusability through the use of Nested Layouts (layout.js) and the component architecture. Describe the structural advantages of Colocation and the ability to structure paths without affecting the URL using Route Groups ((folderName)). Detail the usage of Parallel Routing (@slot) to render independent pages/components simultaneously within the same layout. Explain the primary data fetching paradigm: utilizing async React Server Components (RSC) to fetch data directly, noting that this allows safe performance of sensitive data requests (like database calls) without needing an intermediary API route. Finally, define the backend architecture based on Next.js Route Handlers (route.js/.ts) for developing API services supporting methods like GET, POST, PUT, DELETE, etc..
```

<br>

<summary>architecture.md</summary>
<details>

## architecture.md

### System Design Overview: Next.js App Router Boilerplate

This boilerplate utilizes the Next.js App Router, which leverages advanced features of React Server Components (RSC) and a powerful file-system based routing system to build scalable, maintainable, and performant full-stack applications.

---

### 1. Routing Architecture

The core routing system is governed by a **file-system based routing** convention housed within the top-level `app/` directory.

*   **Route Definition:** A directory (folder) within `app/` indicates a route or a route segment, and nesting folders creates nested routes. The application's root route (`/`) is defined by the top-level `app/` directory.
*   **Page Content:** The page content for a specific route is defined by the special file named `page.js` (or `.ts`/`.tsx`) located within the corresponding route directory. A route becomes publicly accessible only when a `page.js` or `route.js` file exists within the segment.
*   **Dynamic Routing:** Dynamic route segments are defined using square brackets in the folder name, such as `[name]` or `[slug]`, allowing the creation of routes that match dynamic data.

### 2. Structural Organization and Reusability

The architecture maximizes code organization and reuse through colocation, nested layouts, and route grouping.

#### A. Colocation and Component Architecture
The Next.js App Router improves development experience through **Colocation**, which involves organizing and managing pages alongside other related files (like layouts and components) within the same `app/` directory.

*   **Safety:** While folders define the route structure, a route is not publicly accessible until it contains a `page.js` or `route.js` file. This means that **project files** (such as UI utilities or internal logic) can be **safely colocated** inside route segments in the `app` directory without accidentally becoming routable paths.
*   **Modularity:** The architecture encourages building applications with a **component architecture** that follows a tree hierarchy, promoting modularity and reuse of components and utility functions.

#### B. Nested Layouts (`layout.js`)
The system employs **Nested Layouts** using the special `layout.js` file to maximize code reusability.

*   **Shared UI:** The `layout.js` file is used for defining shared UI (such as headers or navigation) across multiple child routes or segments.
*   **Hierarchy:** Layouts at any level wrap their child segments. Layout components are rendered recursively in nested routes, ensuring that the components of a child route segment are nested inside the components of its parent segment.
*   **Optimization:** During client-side navigation between pages that share a layout, the layout **does not re-render** and remains interactive.

#### C. Route Groups (`(folderName)`)
**Route Groups** allow developers to organize routes logically within the `app/` directory without impacting the resulting URL path.

*   **Structural Advantage:** Route groups are created by wrapping a folder name in parentheses, such as `(marketing)` or `(shop)`. This indicates that the folder is for organizational purposes and should **not be included** in the route's URL path.
*   **Layout Scope:** They are particularly useful for enabling nested layouts, allowing the creation of multiple root layouts or applying a layout to a subset of routes in a common segment.

### 3. Parallel Rendering

The architecture uses **Parallel Routing** to enhance dashboard-like features where independent sections need to render simultaneously.

*   **Simultaneous Rendering:** Parallel Routing allows one or more pages/components to render simultaneously within the same layout.
*   **Named Slots:** Parallel routes are defined using named slots, established with the **`@slot` (or `@folder`) convention** (e.g., `@growth` or `@revenue`).
*   **Integration:** These named slots are automatically received by the parent layout component as props and are rendered within the layout's JSX structure.
*   **Isolation:** Each parallel route can define its own independent loading state (`loading.js`) and error state (`error.js`). Note that these slots are *not* actual route segments and cannot be accessed via a dedicated route path.

### 4. Data Fetching Paradigm

The primary data fetching paradigm relies heavily on React Server Components (RSC).

*   **Server Component Direct Fetching:** The App directory, enforcing server-side rendering by default, supports **async React Server Components** (RSC) which can use `async`/`await` to directly fetch data.
*   **Sensitive Data Requests:** A key benefit is the ability to **safely perform sensitive data requests (like database calls) directly in the component**. Since RSCs execute all data fetching on the server, there is no risk of leaking credentials or secrets, **removing the need for an intermediary API route** for securing data retrieval.
*   **Recommendation:** Next.js recommends fetching all data on the server, either via an RSC or a Route Handler.

### 5. Backend Architecture: Route Handlers

The backend services are developed using **Next.js Route Handlers**.

*   **API Implementation:** Route Handlers implement API services, replacing the older API routes used in the Pages Router.
*   **File Convention:** They are defined by creating a special file named `route.js` (or `.ts`) inside the relevant `app` folder (e.g., `app/api/route.js`).
*   **Supported Methods:** Route Handlers leverage the Request and Response APIs and support standard HTTP methods, including: **GET, POST, PUT, DELETE, PATH, HEAD, and OPTIONS**.

</details>

<br>

### implementation.md

<br>

```
Draft the implementation.md file. Provide detailed guidelines for setting up the codebase and ensuring consistency.

Type Safety: Enforce the use of TypeScript and ensure the inclusion of generated Next.js types in tsconfig.json.
Styling and Components: Define the strategy using the utility-first philosophy of Tailwind CSS and mention key styling methods supported (Tailwind CSS, CSS Modules, Global CSS). Detail component implementation using shadcn/ui and its approach of providing direct component code for customization.
Routing Implementation: Instruct developers on navigating using the Link component for transitions and the useRouter hook for programmatic navigation. Note that components using hooks like useRouter must be declared as Client Components using the 'use client' directive.
State Management: Outline implementation using the special files: loading.js (Suspense), error.js (must be a client component), and not-found.js (custom 404 page).
SEO/Optimization: Require using the export const metadata = {} or generateMetadata() convention in the App Router for SEO metadata. Mandate strategic utilization of SSR, SSG, and ISR, along with Image and Font Optimization.
```

<summary>implementation.md</summary>
<details>

## implementation.md

This document outlines the foundational guidelines and standard operating procedures (SOPs) for setting up and maintaining the Next.js application codebase using the App Router. Adhering to these guidelines ensures code consistency, type safety, performance optimization, and maintainability.

---

### 1. Codebase Setup and Consistency

The project will use the **Next.js App Router** for all new development. The App Router is designed to leverage modern React features, such as Server Components, and provides improved structure and performance.

**Project Organization:**

*   **Structure:** We utilize a logical and consistent file/folder structure. The primary application logic resides within the `app/` directory. We may optionally use a `src/` folder to separate application code from project configuration files.
*   **Colocation:** Favor colocation, grouping related components, logic, and tests within their respective route directories where it makes sense. Files placed within a route segment folder that are not special files (`page.js`, `route.js`, etc.) are safe to be colocated without accidentally becoming routable.
*   **Utility Folders:** Use private folders (prefixed with an underscore, e.g., `_utils`, `_components`) for storing utility functions and shared components, although colocation generally ensures non-routability.

---

### 2. Type Safety and Development Tooling

**Mandate the use of TypeScript** for improved code quality, type safety, and better developer experience.

#### 2.1 TypeScript Configuration

Next.js provides built-in TypeScript support. When configuring or verifying the project setup:

1.  **Enforce TypeScript:** All application files must use `.ts` or `.tsx` extensions.
2.  **Include Generated Next.js Types:** To maintain type validation, especially for features like statically typed links, developers **must ensure the generated Next.js types are included** in the `tsconfig.json` file.
    *   Verify that `.next/types/**/*.ts` is present in the `include` array of `tsconfig.json`:

    ```json
    // tsconfig.json excerpt
    {
      "include": [
        "next-env.d.ts",
        ".next/types/**/*.ts", // This is required for generated types
        "**/*.ts",
        "**/*.tsx"
      ],
      "exclude": ["node_modules"]
    }
    ```

#### 2.2 Tooling

Configure essential tooling such as **ESLint for code linting** and **Prettier for consistent code formatting**.

---

### 3. Styling and Component Implementation

#### 3.1 Styling Strategy

The primary styling strategy is the **utility-first philosophy of Tailwind CSS**. Tailwind CSS works by scanning HTML files and components for class names and generating corresponding styles.

Supported styling methods within the application include:

1.  **Tailwind CSS:** Preferred method using utility classes.
2.  **CSS Modules:** Supported for scoped component styles.
3.  **Global CSS:** Used for defining base styles and configuration.

#### 3.2 Component Implementation (`shadcn/ui`)

We will utilize **shadcn/ui** for high-quality, accessible components.

*   **Open Code Philosophy:** Unlike traditional component libraries installed via NPM, shadcn/ui operates on an **Open Code philosophy**. Developers are handed the **actual component code** (distributed via a CLI).
*   **Customization:** This approach provides **full control** to customize and extend components directly, making it unnecessary to wrap components or write workarounds to override styles.
*   **Composition:** All shadcn/ui components are designed to be composable and share a common, predictable interface, promoting system consistency.
*   **Installation:** Components are added using the command-line tool (`npx shadcn@latest add <component>`).

---

### 4. Routing Implementation

The Next.js App Router uses a file-system-based routing system where folders define URL segments and special files like `page.js` (or `.tsx`) define the page contents.

#### 4.1 Navigation Between Routes

Developers should use the following methods for navigation:

1.  **`Link` Component:** For declarative navigation and smooth client-side transitions, **use the `Link` component** imported from `next/link`. The `Link` component uses the `href` property to specify the navigation route.
2.  **`useRouter` Hook:** Use the `useRouter` hook (from `next/navigation`) for programmatic navigation, such as navigating after a button click or form submission. Programmatic navigation is typically handled using methods like `router.push(url)` or `router.replace(url)`.

#### 4.2 Client Component Directive

**Crucially, any component utilizing React Hooks**, including `useRouter` from `next/navigation`, **must be explicitly declared as a Client Component**.

*   This declaration is achieved by adding the **`'use client'`** directive at the top of the file, before any import statements.

---

### 5. State Management and Error Handling

The App Router provides dedicated special files for managing loading states, errors, and unhandled routes, utilizing React Suspense and Error Boundaries.

| Special File | Purpose | Requirement/Context |
| :--- | :--- | :--- |
| **`loading.js` / `.tsx`** | Shows a loading indicator or skeleton UI for a route segment. | **Automatically wraps the component in a `<Suspense>` boundary**. This UI triggers when an asynchronous request is detected. |
| **`error.js` / `.tsx`** | Catches unexpected runtime errors within a route segment or its children. | The exported React component **must be a Client Component** and include the **`'use client'` directive** at the top. |
| **`not-found.js` / `.tsx`** | Defines a custom UI for unmatched routes, serving as a custom 404 page. | This special file must export a React component. It can also be invoked programmatically using `notFound()`. |

---

### 6. SEO and Performance Optimization

All pages must prioritize SEO and performance optimizations.

#### 6.1 SEO Metadata

In the Next.js App Router, metadata handling utilizes specific conventions.

*   **Requirement:** For defining SEO metadata, developers must use the **`export const metadata = {}`** object or the **`generateMetadata()`** function.
*   **Content:** Each page must include essential metadata such as `title`, `meta description`, Open Graph tags (e.g., `og:title`, `og:image`), and Twitter Card tags.

#### 6.2 Strategic Rendering and Data Fetching

Mandate the strategic utilization of server-side rendering (SSR), static site generation (SSG), and incremental static regeneration (ISR) based on content dynamism.

In the App Router, data fetching uses the standard `fetch` API and Async React Server Components. Next.js manages caching and rendering based on `fetch` options:

| Rendering Type | Next.js App Router Data Fetching equivalent | `fetch` Options |
| :--- | :--- | :--- |
| **Static Site Generation (SSG)** | Cached until manually invalidated (similar to `getStaticProps`). | `cache: 'force-cache'` (default) |
| **Incremental Static Regeneration (ISR)** | Cached with a specific lifetime (similar to `getStaticProps` with `revalidate`). | `next: { revalidate: N }` |
| **Server-Side Rendering (SSR)** | Refetched on every request (similar to `getServerSideProps`). | `cache: 'no-store'` |

#### 6.3 Optimization Assets

*   **Image Optimization:** Developers must integrate the **Next.js Image component** and optimize image assets for faster loading times.
*   **Font Optimization:** Utilize Next.js **Font Optimization** to improve web performance.


</details>


<br>

### testing.md

<br>

```
Draft the testing.md file defining the Quality Assurance strategy. Specify the integration of a robust testing framework such as Jest and React Testing Library as development dependencies. Detail the need for a clear testing strategy encompassing unit, integration, and end-to-end tests. Establish the mandatory requirement for Code Coverage reporting to ensure adequate test coverage is maintained. Ensure the plan requires testing critical Next.js features, including:

Functionality of all major route types (Static, Dynamic, Nested, Parallel).
Validation of programmatic navigation using the useRouter hook methods (push, replace, prefetch).
Confirmation that the specialized files, error.js and not-found.js, correctly intercept and display expected errors and 404 states.
```

<summary>testing.md</summary>
<details>

# testing.md: 

# Quality Assurance Strategy

## 1. Quality Assurance Strategy Overview

The Quality Assurance strategy mandates the integration of robust testing practices throughout the development lifecycle to ensure the scalability, reliability, and maintainability of the Next.js application. This strategy requires a tiered approach to testing, encompassing unit, integration, and end-to-end (E2E) tests.

## 2. Testing Framework and Dependencies

A robust testing framework must be integrated to facilitate comprehensive quality assurance.

### 2.1 Development Dependencies

The following tools shall be included in the project's `devDependencies` to establish a standard testing environment:

| Tool | Purpose | Source Support |
| :--- | :--- | :--- |
| **Jest** | Primary JavaScript testing framework. | Found listed in `devDependencies` as `jest` and related configurations (`@types/jest`, `jest-environment-jsdom`). |
| **React Testing Library (RTL)** | Utility for testing React components, focusing on user experience. | Found listed in `devDependencies` as `@testing-library/react` and `@testing-library/jest-dom`. |

### 2.2 Code Coverage Requirement

It is a **mandatory requirement** to set up and maintain code coverage reporting. Code coverage tracking must be implemented (e.g., using a service like Codecov) to monitor and ensure adequate test coverage is consistently maintained across the application.

## 3. Testing Strategy: Levels of Testing

A clear testing strategy must be established, partitioning testing efforts into three primary categories:

1.  **Unit Tests:** Focus on testing individual components and utility functions in isolation. For Next.js development, this includes ensuring modularity and reusability of components and logic.
2.  **Integration Tests:** Focus on verifying how different parts of the application interact, such as testing data flow between components or verifying component interactions with API mock layers.
3.  **End-to-End (E2E) Tests:** Focus on validating complete user flows from start to finish, simulating a user’s interaction with the entire application.

## 4. Critical Next.js Feature Testing Requirements

Given the reliance on the Next.js App Router, specific testing must be performed to confirm the correct functionality of core routing and error handling conventions.

### 4.1 Route Types Functionality Testing

Testing must confirm the correct behavior and accessibility of all major file-system routing patterns:

| Route Type | Next.js Convention | Testing Requirement | Source Support |
| :--- | :--- | :--- | :--- |
| **Static Routes** | Defined by directories containing a `page.js` or `.tsx` file (e.g., `/app/page.js` or `/app/blog/page.js`). | Validate that standard, non-dynamic paths resolve correctly and display the expected content. | |
| **Dynamic Routes** | Defined using folders enclosed in square brackets (e.g., `[slug]`). | Verify that dynamic segments resolve correctly and that the page component receives the necessary parameters (`params` prop) to render content based on the route segment value. | |
| **Nested Routes** | Created by nesting folders under the `app/` directory (e.g., `app/about/form/page.js`). | Confirm that the nested URL structure is correctly mapped to the corresponding directory structure and that layouts are inherited or scoped correctly. | |
| **Parallel Routes** | Defined using named slots (`@folder` convention) and rendered simultaneously within the parent `layout.js` file. | Verify that pages defined in parallel route slots (`@growth`, `@revenue`) render correctly when accessed via the parent route (e.g., `/dashboard`). Also, confirm that these slots are **not** directly accessible as URL segments (e.g., `/dashboard/@growth` should not be a route). | |

### 4.2 Programmatic Navigation Validation

Tests must validate the functionality of programmatic navigation using the `useRouter` hook, which allows changing routes without the `Link` component:

1.  **`router.push(url)`**: Validate that this method handles client-side transitions and adds a new entry to the browser history stack, as intended for standard navigation.
2.  **`router.replace(url)`**: Validate that this method performs navigation without adding a new entry to the history stack (similar to the `replace` prop on `next/link`), preventing the user from navigating back to the previous page using the browser back button.
3.  **`router.prefetch(url)`**: Validate that this method successfully prefetches the necessary resources for the target URL to ensure faster client-side transitions, particularly useful for non-standard navigations.

### 4.3 Specialized File Functionality Confirmation

Tests must confirm that special Next.js files correctly handle application errors and missing routes, which are critical aspects of error handling:

1.  **`error.js` (Runtime Errors)**: Confirm that the presence of an `error.js` file at a route segment correctly intercepts runtime errors occurring within that segment or its children. Verification must include ensuring the `error.js` component is correctly defined as a client component using the `'use client'` directive.
2.  **`not-found.js` (404/Missing Routes)**: Confirm that `not-found.js` correctly intercepts and displays the expected UI when an unmatched route is visited. Furthermore, tests should confirm that invoking the `notFound()` function programmatically stops rendering the current segment and triggers the nearest `not-found.js` file.

</details>


<br>

### security.md

<br>

```
Draft the security.md file addressing key concerns for a Next.js application. Outline secure practices for handling API keys, tokens, and sensitive data. Mandate the clear definition and management of Environment Variables for different stages (development, production) using .env files. Highlight the security benefit of using React Server Components (RSC) for data fetching, as this allows direct, safe execution of sensitive operations (like database queries) on the server, preventing credentials from leaking to the client. Require the integration of robust Authentication and Authorization mechanisms, noting that features like NextAuth.js and Middleware are common components for protecting dashboard pages.
```

<summary>security.md</summary>
<details>

## `security.md`

This document outlines the mandatory security practices and architecture considerations for securing this Next.js application, focusing on handling sensitive data, environment configuration, and authorization controls.

---

### 1. Handling Sensitive Information

It is mandatory to implement secure practices for handling **API keys, tokens, and sensitive data**. These credentials must never be exposed directly in client-side code, and their storage and access should adhere strictly to the guidelines for environment variables and server-side operations outlined below.

### 2. Environment Variable Management

All sensitive configuration data, such as API keys and database URLs, must be managed using Next.js Environment Variables.

#### Mandates for Environment Variables:

1.  **Clear Definition and Management:** Environment variables (e.g., API keys, database URLs) must be clearly defined and managed.
2.  **Staging Differentiation:** Variables must be segmented based on the application stage (development, staging, production).
3.  **Use of `.env` Files:** Next.js utilizes specific top-level files to define environment variables for different stages:
    *   `.env`: General environment variables.
    *   `.env.local`: Local environment variables.
    *   `.env.production`: Production environment variables.
    *   `.env.development`: Development environment variables.
4.  **Type Safety (Recommended):** If TypeScript is enabled, Next.js can generate types for loaded environment variables during development for improved IntelliSense. Note that types are generated based on variables loaded at development runtime, excluding variables from `.env.production*` files unless the development server is run with `NODE_ENV=production`.

### 3. Leveraging React Server Components (RSC) for Data Security

The Next.js App Router utilizes React Server Components (RSC). This architecture provides a crucial security benefit for data fetching:

*   **Safe Server-Side Execution:** Next.js recommends fetching all data on the server via RSCs or Route Handlers.
*   **Preventing Credential Leakage:** Because **React Server Components (RSC) execute directly on the server**, sensitive operations—such as **direct database calls**—can be safely performed. This prevents **credentials or secrets from leaking to the client**, thereby removing the necessity of using an intermediary API Route (Route Handler) to hide secrets when performing data fetching.
*   **Direct Data Fetching:** RSCs enable developers to use `async/await` and `fetch` directly within the component for data retrieval on the server.

### 4. Authentication and Authorization

The application must integrate robust **Authentication and Authorization** mechanisms to protect specific routes and resources.

#### Requirements:

1.  **Protected Routes:** Features like dashboard pages must be protected by authentication.
2.  **Middleware Integration:** **Middleware** (`middleware.ts`) is a required component for authorization logic. Middleware can inspect incoming requests and implement logic (such as checking for session tokens) before a request is completed.
3.  **Authentication Framework:** Features like **NextAuth.js** are common components used in conjunction with Middleware to enforce protected routes.
4.  **Redirection:** If a user is unauthenticated or unauthorized for a page, they must be programmatically redirected (e.g., using `router.push('/login')`).

</details>

<br>

### sop.md

<br>

```
 Draft the sop.md (Standard Operating Procedures) file detailing the required operational workflow and code management standards for the project.

Version Control: Specify the utilization of Git with a clear branching strategy (e.g., Gitflow or GitHub Flow).
Code Quality Enforcement: Establish the use of Husky and Lint-Staged to run linters and formatters (ESLint, Prettier) on staged files automatically before committing.
Development Structure: Enforce adherence to the Next.js Project Structure, including the recommendation to use the optional src/ directory to separate application code from configuration files.
Deployment: Define the CI/CD Pipeline using services like GitHub Actions or Vercel for automated builds, testing, and deployment.
Documentation Maintenance: Stipulate the required project documentation: a comprehensive README.md, clear Contributing Guidelines, and consistent maintenance of the Architecture Documentation.
Next.js Utility Usage: Document the correct use of navigation elements, specifically reserving the native anchor tag (<a/>) for external links, and using the Next.js Link component for internal application navigation.
```

<summary>sop.md</summary>
<details>

## sop.md: 

# Standard Operating Procedures and Code Management Standards

This document outlines the required operational workflow and code management standards for this project, ensuring consistency, maintainability, and quality across all development phases.

---

### 1. Version Control and Branching Strategy

All source code must be managed using **Git**.

1.1. **Platform:** The official project repository is hosted on GitHub.
1.2. **Branching Strategy:** The project must establish and adhere to a clear branching strategy. Developers must choose and follow either the **Gitflow** or **GitHub Flow** model for managing code versions and collaboration.

### 2. Code Quality Enforcement

To ensure adherence to consistent coding standards and enhance code quality, automated tooling must be configured and enforced.

2.1. **Linters and Formatters:**
*   **ESLint** must be configured for code linting.
*   **Prettier** must be configured for consistent code formatting.

2.2. **Pre-commit Hooks:**
*   **Husky and Lint-Staged** must be implemented to establish pre-commit hooks.
*   These hooks will automatically run configured linters and formatters (ESLint, Prettier) on staged files before a commit is finalized. This process prevents inconsistent or poorly formatted code from entering the repository.

2.3. **Type Safety:**
*   **TypeScript** must be integrated for improved code quality, type safety, and a better developer experience.

### 3. Development Structure

The project structure must adhere to Next.js conventions, prioritizing organization and code discoverability.

3.1. **Next.js App Router Structure:**
*   The project utilizes the Next.js App Router.
*   Routes are determined by directory names, and a route is made publicly accessible when a `page.js` (or `.ts`/`.tsx`) or `route.js` file is added to a route segment.

3.2. **Source Directory (`src/`):**
*   It is highly recommended that the optional **`src/` directory** be used to house the application code (including the `app/` directory).
*   Utilizing the `src/` directory helps separate application code from project configuration files (which typically reside in the root directory).

3.3. **Modularity and Co-location:**
*   Components and utility functions must be designed to be modular and reusable to promote code reusability.
*   Practice **co-location** by grouping related files and components together, especially within route segments in the `app` directory, where non-routable files are safe from public access.

### 4. Deployment

A robust CI/CD pipeline must be configured to automate the process of building, testing, and deploying the application.

4.1. **CI/CD Pipeline Services:**
*   A Continuous Integration/Continuous Deployment (CI/CD) pipeline must be configured using services such as **GitHub Actions** or **Vercel**.
*   This pipeline will ensure automated builds, tests, and deployment.

4.2. **Deployment Platform:**
*   The application should be deployed on Vercel.

### 5. Documentation Maintenance

Comprehensive documentation is required for project maintenance and onboarding new developers.

5.1. **README.md:**
*   A comprehensive `README.md` must be maintained.
*   It must include clear instructions for project setup, development, testing, and deployment.

5.2. **Contributing Guidelines:**
*   Clear **Contributing Guidelines** must be established to streamline the process for new developers joining the project.

5.3. **Architecture Documentation:**
*   Key architectural decisions and system design must be consistently documented.

### 6. Next.js Utility Usage: Navigation Standards

All navigation within the application must follow Next.js best practices for performance and clarity.

6.1. **Internal Navigation:**
*   For navigation **between internal routes or pages** within the Next.js application, developers must use the **Next.js `Link` component** (imported from `next/link`).
*   The `Link` component is the best option for navigating routes, as it enables client-side navigation with built-in optimizations like prefetching.

6.2. **External Navigation:**
*   The native **anchor tag (`<a/>`)** must be reserved exclusively for linking and navigating to a page that is **external** to the application, or for invoking specific non-navigation functions.

6.3. **Programmatic Navigation:**
*   If programmatic route changes are necessary (e.g., triggering navigation upon a button click), the **`useRouter` hook** (from `next/navigation` in the App Router) should be utilized.
*   The `useRouter` hook allows access to methods like `router.push()` to navigate programmatically. Note that `window.location` is better suited for external URLs rather than `router.push`.

</details>


## Polishing the Project Documents

<br>

Now I can simply run a command in your IDE of choice like and copy/paste the contents we have generated:

<br>

```
mkdir docs
touch docs/ai_guidelines.md
touch docs/requirements.md
touch docs/architecture.md
touch docs/implementation.md
touch docs/testing.md
touch docs/security.md
touch docs/sop.md
```

<br>

Now that I have all of these files in our directory and we are in the IDE we can start using CLIne or whichever AI-assistant you are using to help us build out the project.

Before we begin we can give each of these documents a polish by simply editing them all at the same time! That's right, we are going to vibe context engineer, I know context engineering is not just getting together documents to vibe code and that it involves a lot more, but for our purposes that is what I will call it.

First I am going to write a prompt in order to write out prompt for CLIne so that CLIne will go and edit all of our documents.

<br>

```
You are the best software eningeer in the world and your goal is to draft a CLIne prompt which will edit the following documents for the purpose of filling in context for CLIne to later code a project. So the prompt will instruct for a deliverable of another prompt except this one is for CLIne to edit the files which will then fill in the context for the project. Reference https://github.com/kliewerdaniel/workflow.git for the description of what each of the files is meant to be used for.
```

<br>

I used chatGPT for this and got the following prompt which I am feeding to chatGPT again to get our document editing prompt for CLIne.

```
You are a documentation editor and context‐gathering assistant working as part of a structured AI-assisted development workflow.
Your task is to edit, enhance, and fill in missing context across the following markdown files: ai_guidelines.md, requirements.md, architecture.md, implementation.md, testing.md, security.md, and sop.md.

For each file:
	1.	Ensure the purpose of the file is clearly stated (based on the workflow repository’s description).  ￼
	2.	Insert placeholders or tables for project-specific information (project name, domain, stakeholders, personas, technologies, constraints, business objectives, non-functional requirements, security/risk assumptions, deployment environments, KPIs, etc.).
	3.	Ask clarifying questions in the document (via “TODO” or “**?”” markers) where context is missing—so we can later fill them in.
	4.	Ensure each section aligns with standards defined in the standards.md (or if no explicit standards exist yet, create a “Standards” sub-section with prompts for what the standards should cover).
	5.	Cross-link between docs: e.g., link user-stories in requirements.md to components in architecture.md; link testing strategies in testing.md to features in implementation.md; reference deployment pipelines in deployment.md that assume architecture decisions from architecture.md, etc.
	6.	Maintain a consistent flavour and style across all docs: use markdown headings, bullet lists, tables where helpful, and mark items clearly as “Must / Should / Could / Won’t” where applicable.
	7.	Annotate any area that will later require code generation or AI prompt generation (for the later CLine coding phase) — e.g., in prompts.md, add a section “Prompt templates for CLine coding” with placeholders like [COMPONENT_NAME], [API_ENDPOINT], [TEST_SCENARIO], etc.

Deliverable: A single merged prompt (for CLine) that instructs it to perform the editing/enrichment for all the files listed above, with clear ordering, scope, how to handle each file, what to fill in, where to ask questions, and how to prepare the project context so that the next phase (coding) is well-supported.

Important: This prompt is not the coding phase — it’s purely the editing and context-filling phase. It should make clear to CLine the difference, and that once this is done, we will move to code generation.￼

Be concise but thorough in your instruction: define the sequence in which files should be processed (typically: ai_guidelines → requirements → architecture → implementation → testing → security→ sop), how cross-linking is to be done, and what output format (markdown) is expected (overwriting or creating “filled-in” versions, while keeping original commentary sections for later review).

Also instruct CLine to output a summary at the end listing which questions (context gaps) remain unanswered (so we can fill them manually).

Deliver your prompt now.
```

<br>

This is the prompt we will give to CLIne to polish our documents:

<br>

```
✅ CLine Prompt — Documentation Editing & Context Preparation Phase

You are an AI documentation editor and context-gathering assistant working within a structured AI-assisted development workflow.

Your task is to edit, enhance, and fill in context across the following markdown files in this repository:
ai_guidelines.md, requirements.md, architecture.md, implementation.md, testing.md, security.md, and sop.md.

This phase is NOT for coding or implementation. It is only for editing documentation and gathering project context so future prompts can generate code.

⸻

📂 Processing Order

Process the files in this order:
	1.	ai_guidelines.md
	2.	requirements.md
	3.	architecture.md
	4.	implementation.md
	5.	testing.md
	6.	security.md
	7.	sop.md

⸻

📌 For Each File — Apply the Following Instructions

For every file listed above:

✅ 1. Declare Purpose
	•	At the top of each file, clearly state its purpose based on the workflow repository’s intent.

✅ 2. Insert Context Placeholders & Tables

Add missing context using markdown tables or placeholder sections for information such as:

Field	Description
Project Name	TODO:
Domain / Industry	TODO:
Stakeholders	TODO:
Personas / Users	TODO:
Technologies / Frameworks	TODO:
Business Objectives	TODO:
Functional Requirements	TODO:
Non-functional Requirements	TODO:
Constraints	TODO:
Deployment Environments	TODO:
Metrics / KPIs	TODO:
Security / Risk Assumptions	TODO:

✅ 3. Ask Clarifying Questions

Where context is missing, insert in-line prompts using:
	•	TODO:
	•	**?** next to the missing information or unclear sections.

✅ 4. Align with Standards
	•	If standards.md exists, ensure language/structure matches it.
	•	If no standards apply, add a placeholder section:

### Standards Alignment
TODO: Define how this document should follow standards for formatting, naming, architecture, security, testing, and documentation.

✅ 5. Cross-Link Relevant Documentation
	•	In requirements.md, link each user story to system components in architecture.md.
	•	In architecture.md, reference implementation strategy in implementation.md.
	•	In testing.md, link each test scenario to requirements and implemented features.
	•	In security.md, reference risks related to architecture decisions.
	•	In sop.md, reference implementation and deployment flows.

Use relative markdown links, e.g.:
See [Component A](architecture.md#component-a)

✅ 6. Consistent Formatting & Style
	•	Use clear headings (##, ###, etc).
	•	Use bullet points and tables for clarity.
	•	Use MoSCoW format (Must / Should / Could / Won’t) for priority lists.

✅ 7. Mark Sections Needed for Future Code Generation

Add placeholders for future use during coding phase, e.g.:

### Prompt Templates for CLine Coding (To be used later)
- Implement [COMPONENT_NAME] that connects to [API_ENDPOINT]
- Generate unit tests for [FEATURE]
- Create service for [DATA_MODEL]


⸻

📤 Output Requirements
	•	Overwrite each markdown file with the enhanced/document-ready version.
	•	Preserve original content where it is useful, but reorganize for clarity.
	•	Add new sections, tables, placeholders, and TODO questions where needed.
	•	At the end of the process, generate a summary file or console output listing:
	•	All unanswered questions (TODOs / ?)
	•	Files updated
	•	Sections requiring manual input

⸻

⚠️ Reminder

This prompt is only for documentation refinement and context collection. Do not write code or implementation logic yet.
Once documentation is complete, a separate prompt will initiate the coding phase.

⸻

Begin editing the documents now.
Output summaries and unanswered context questions once complete.
```

<br>

I am using vanilla VSCode for this with the CLIne extension using their free access to grok for sesssion.

<br>

![Image](/images/1020003.png)

<br>

The final edited files you can find in the [repo](https://github.com/kliewerdaniel/next.git) under the documents directory. It even was nice enough to output a documentation-summary.md I have included below.

<br>

```
# Documentation Enhancement Summary

This summary provides an overview of the documentation editing and context preparation phase for the Next.js boilerplate project.

## Files Updated

All 7 markdown files in the `docs/` directory have been enhanced with standardized sections, context tables, cross-links, and placeholders for future AI coding prompts:

- ai_guidelines.md
- requirements.md
- architecture.md
- implementation.md
- testing.md
- security.md
- sop.md

## Key Enhancements Applied

### 1. Purpose Declaration
Each file now starts with a clear statement of its purpose in the project workflow.

### 2. Project Context Table
Standardized context tables added to all files with fields like:
- Project Name
- Domain / Industry
- Stakeholders / Personas / Users
- Technologies / Frameworks
- Business Objectives
- Functional / Non-functional Requirements
- Constraints
- Deployment Environments
- Metrics / KPIs
- Security / Risk Assumptions

### 3. Clarifying Questions and Placeholders
Embedded TODO: and ? markers where context needs specification or clarification.

### 4. Standards Alignment Sections
TODO sections added for future definition of how each document follows standards for formatting, naming, architecture, security, testing, and documentation.

### 5. Cross-Linking Documentation
- Requirements links to testing scenarios and implemented features.
- Architecture links to implementation strategies.
- Testing links to requirements and implementation.
- Security links to architecture decisions and SEO practices.
- SOP links to implementation and deployment flows.

### 6. Consistent Formatting
- MoSCoW prioritization in requirements.
- Bullet points and tables for clarity.
- Clear headings and subheadings.

### 7. Future Code Generation Templates
Added "Prompt Templates for CLine Coding" sections with specific prompts for implementing features later, such as:
- Route structures and components
- Authentication and security features
- Testing configurations
- Deployment setups

## Unanswered Questions and TODO Items

### ai_guidelines.md
- Business Objectives: TODO
- Functional Requirements: TODO (in context table)
- Non-functional Requirements: TODO
- Deployment Environments: TODO: Production servers, CI/CD pipelines
- Metrics / KPIs: TODO (in context table)
- Security / Risk Assumptions: TODO (in context table)
- Standards Alignment: TODO: Define how this document should follow standards...

### requirements.md
- Functional Requirements: TODO: Define user stories and features (in context table)
- Metrics / KPIs: TODO: Page load times, error rates (in context table)
- Security / Risk Assumptions: TODO: Secure data handling, authentication needs (in context table)
- Standards Alignment: TODO: Define how this document should follow standards...

### architecture.md
- Standards Alignment: TODO: Define how this document should follow standards...

### implementation.md
- Standards Alignment: TODO: Define how this document should follow standards...

### testing.md
- Standards Alignment: TODO: Define how this document should follow standards...

### security.md
- Standards Alignment: TODO: Define how this document should follow standards...

### sop.md
- Standards Alignment: TODO: Define how this document should follow standards...

## Sections Requiring Manual Input

1. **Standards Definition**: All files have placeholders for defining adherence to external standards (formatting, naming, architecture, security, testing, documentation). If a `standards.md` file exists or will be created, reference it here.

2. **Detailed Functional Requirements**: The requirements.md file has a placeholder for defining specific user stories and features. Manual input needed to expand beyond the current high-level MoSCoW items.

3. **Metrics and KPIs**: Several tables have TODO items for specific measurable goals (e.g., page load times, test coverage percentages, deployment frequency).

4. **Security Risk Assumptions**: TODO items for specific risks and assumptions in requirements, architecture, and other files.

5. **Business Objectives**: Some files have TODO for specific business objectives beyond the generic descriptions.

6. **Deployment Environments**: Specific environments (development, staging, production) need detailed specification.

## Next Steps

Once this documentation phase is complete, a separate coding phase can begin using the AI coding prompts and context established here. The enhanced documentation provides a solid foundation for consistent, standards-aligned development across all project domains: requirements, architecture, implementation, testing, security, and operations.

All documents are now prepared as "document-ready" versions with embedded context and cross-references to ensure future AI-generated code adheres to the established guidelines.
```

<br>

## Drafting the Final CLIne Prompt

<br>

We are getting close to being ready to start coding. 

Now what we need to do is write a prompt which will generate our FINAL prompt to CLIne. With this prompt we are hoping to get this with just one prompt.

For this mega prompt I use Anthropic to draft it. I think they provide the most detail but I can usually only get one good prompt out before it cuts off free access. That is why I don't just use one service but several in order to never have to pay.

I use the app to use Claude and have install a bunch of MCP servers as well as hooked up my github. This allows you to easily reference files.

<br>

![Image](/images/1020004.png)

<br>

Before I ask Claude I am going to formulate the prompt for it carefully and expand on the following prompt with chatGPT.

<br>

```
I want you to write a prompt for an LLM which will generate a prompt for CLIne, take what you know. You are a senior software engineer and you are building a prompt for CLIne. What you are doing is using the context in the docs folder to guide CLIne as it goes along with the coding process. The first thing you should tell CLIne to do is to create a checklist.md file in the docs folder to act as a ledger for CLIne to keep track of its progress but also for observability.

The overall goal for CLIne is to output the absolute very best boilerplate repo for next.js using all of the context in the docs folder. I want you to think of everything CLIne has to offer and to think of all of the intricacies to software development and I want you to know that you have all of the files in the docs folder to help you code this project. This is the CLIne prompt which will build the next.js boilerplate repo as outlined in the docs folder. 
```

<br>

That gives us our prompt to give to Claude. I only expanded it because I usually only get one good generation a day for free wtih Claude and I insiste on not paying.

<br>

```
You are a senior software engineer designing a prompt for CLine to build a Next.js boilerplate repo.

Your goal: produce a single prompt that instructs CLine to:
	1.	Create a new docs/checklist.md inside the docs folder. This file will act as a progress ledger/observability guide for CLine: each major step, sub-task, status, and link back to the docs context must be tracked here.
	2.	Use all of the context found in the existing docs folder (ai_guidelines.md, requirements.md, architecture.md, implementation.md, testing.md, security.md, sop.md, etc) to inform the structure, architecture, tooling, conventions, and deliverables of the boilerplate.
	3.	Produce a Next.js repository incorporating best practices and boilerplate parameters (folder structure, TypeScript support, linting, formatting, CI/CD, testing, deployment, security hardening, observability, performance, etc). Use referenced best-practice sources as guidance.
	4.	Maintain traceability between docs context and code structure: e.g., link from requirements to implemented components, architecture decisions to folder/file naming, testing strategies to code coverage setup, deployment instructions to folder layout.
	5.	Use the checklist.md as a continuous ledger: for each step (init repo, set up TypeScript, set up lint/prettier, create folder structure, create sample component, wiring CI/CD, create tests, set up security config, set up observability/monitoring, create README, etc) mark status (“Not Started / In Progress / Done”), timestamp, docs references, and next actions.
	6.	Ensure the overall boilerplate is absolutely best-in-class: incorporate modern patterns (for example, TypeScript, Next.js App Router or Pages Router as appropriate, modular folder structure, environment management, performance optimization) as hinted by best-practice sources.  ￼
	7.	At the end of the generated prompt, tell CLine explicitly how to output:

	•	Create the docs/checklist.md file and update it as it works.
	•	Commit code / files in the repository according to each checklist entry.
	•	Provide the created boilerplate repo in a zipped format (or push instructions) once checklist is complete.

Important: The prompt you generate for CLine should itself be clear, step-by-step, numbered, and quote placeholders like [PROJECT_NAME], [TECH_STACK], [DEPLOYMENT_TARGET] etc so that the next phase is parameterized. It should define the sequence of tasks CLine must follow, and reference the docs context at each step.

Deliverables:
	•	The prompt that you’ll feed to CLine.
	•	Ensure that prompt tells CLine to create the docs/checklist.md ledger first.
	•	Ensure that prompt defines how the docs folder context influences the code generation.

Remember: This is the prompt-generation phase (you’re generating a prompt for CLine), not the code-generation phase itself.

Output now the full prompt for CLine.
```

Now we have the one and final prompt hopefully for our project. As you can see this prompt does not even have a lot of the details we need to get started since we have supplied all of that in our docs folder.

<summary>Final CLIne Prompt</summary>
<details>

# CLine Prompt: Next.js Boilerplate Repository Creation with Observability Ledger

You are an expert software engineer tasked with creating a production-ready Next.js boilerplate repository. This boilerplate must adhere strictly to all guidelines, requirements, architecture patterns, implementation standards, testing strategies, security practices, and operational procedures documented in the existing `docs/` folder.

## Project Parameters

- **PROJECT_NAME**: `[nextjs-boilerplate]` (replace with actual project name)
- **TECH_STACK**: Next.js (App Router), React 18+, TypeScript, Tailwind CSS, shadcn/ui
- **DEPLOYMENT_TARGET**: `[Vercel]` (replace with target platform)
- **NODE_VERSION**: `v18.18.0` or later
- **REPOSITORY_HOST**: `[GitHub]` (replace with Git hosting platform)

---

## Phase 0: Initialize Observability Ledger (CRITICAL FIRST STEP)

**Before any code generation begins**, you must create `docs/checklist.md` as your progress tracking and observability ledger.

### Step 0.1: Create Checklist Structure

Create `docs/checklist.md` with the following structure:

```markdown
# Next.js Boilerplate - Implementation Checklist & Progress Ledger

## Purpose
This document tracks the implementation progress of the Next.js boilerplate repository, ensuring full traceability between documentation context and actual code deliverables.

## Legend
- ⬜ Not Started
- 🟡 In Progress
- ✅ Done
- ❌ Blocked/Issue

## Progress Overview
| Phase | Status | Progress | Last Updated |
|-------|--------|----------|--------------|
| Phase 0: Ledger Setup | 🟡 | 0% | [TIMESTAMP] |
| Phase 1: Repository Initialization | ⬜ | 0% | - |
| Phase 2: Core Framework Setup | ⬜ | 0% | - |
| Phase 3: Type Safety & Tooling | ⬜ | 0% | - |
| Phase 4: Styling & UI Components | ⬜ | 0% | - |
| Phase 5: Project Structure | ⬜ | 0% | - |
| Phase 6: Routing Implementation | ⬜ | 0% | - |
| Phase 7: Data Fetching & State | ⬜ | 0% | - |
| Phase 8: Testing Infrastructure | ⬜ | 0% | - |
| Phase 9: Security Hardening | ⬜ | 0% | - |
| Phase 10: CI/CD Pipeline | ⬜ | 0% | - |
| Phase 11: Performance & SEO | ⬜ | 0% | - |
| Phase 12: Documentation | ⬜ | 0% | - |
| Phase 13: Final Validation | ⬜ | 0% | - |

---

## Detailed Task Tracking

[Task sections will be populated as you progress through each phase]
```

### Step 0.2: Update Ledger After Each Task

After completing each task in subsequent phases:
1. Update the task status (⬜ → 🟡 → ✅)
2. Add timestamp
3. Link to relevant docs context
4. Note any deviations or decisions made
5. List next actions

**Commit the checklist after every major milestone.**

---

## Phase 1: Repository Initialization

**Docs Context References**: 
- `docs/sop.md` (Section 1: Version Control)
- `docs/requirements.md` (Section 1: System Prerequisites)

### Task 1.1: Initialize Git Repository ⬜

**Action Steps**:
1. Initialize a new Git repository
2. Create `.gitignore` for Next.js (node_modules, .next, .env.local, etc.)
3. Set up initial branch structure (main/develop based on chosen Git Flow strategy)

**Docs Traceability**:
- Reference: `docs/sop.md` - Section 1.2 Branching Strategy
- Requirement: Git-based version control with GitHub hosting

**Checklist Update**:
```markdown
### Task 1.1: Initialize Git Repository ✅
- **Status**: Done
- **Timestamp**: [YYYY-MM-DD HH:MM]
- **Docs Reference**: docs/sop.md#version-control
- **Deliverables**: 
  - ✅ .git folder initialized
  - ✅ .gitignore created
  - ✅ main branch established
- **Commit**: `git commit -m "chore: initialize repository with .gitignore"`
- **Next Action**: Task 1.2
```

### Task 1.2: Initialize Next.js Project ⬜

**Action Steps**:
1. Run `npx create-next-app@latest [PROJECT_NAME]` with following selections:
   - ✅ TypeScript
   - ✅ ESLint
   - ✅ Tailwind CSS
   - ✅ App Router (MANDATORY per docs/ai_guidelines.md Section 1.1)
   - ✅ src/ directory (recommended per docs/sop.md Section 3.2)
   - ❌ Turbopack (optional, evaluate based on stability)
2. Verify Node.js version requirement (v18.18.0+)

**Docs Traceability**:
- Reference: `docs/ai_guidelines.md` - Section 1: Core Framework
- Reference: `docs/requirements.md` - Section 2: Core Application Framework
- Requirement: Exclusive use of App Router

**Checklist Update**: Add completion details, timestamp, commit reference

### Task 1.3: Configure Package.json ⬜

**Action Steps**:
1. Update project metadata (name, version, description, author)
2. Add custom scripts:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint",
       "lint:fix": "next lint --fix",
       "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
       "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage",
       "type-check": "tsc --noEmit",
       "prepare": "husky install"
     }
   }
   ```

**Docs Traceability**:
- Reference: `docs/sop.md` - Section 2: Code Quality Enforcement
- Reference: `docs/testing.md` - Section 2: Testing Framework

**Checklist Update**: Track completion and commit

---

## Phase 2: Core Framework Setup

**Docs Context References**: 
- `docs/ai_guidelines.md` (Section 1.2: RSC Requirement)
- `docs/architecture.md` (Section 1: Routing Architecture)

### Task 2.1: Configure Next.js Config ⬜

**Action Steps**:
1. Create/update `next.config.ts` with mandatory settings:
   ```typescript
   import type { NextConfig } from 'next'

   const nextConfig: NextConfig = {
     typedRoutes: true, // MANDATORY per docs/ai_guidelines.md Section 2.1
     reactStrictMode: true,
     // Add other configuration as needed
   }

   export default nextConfig
   ```

**Docs Traceability**:
- Reference: `docs/ai_guidelines.md` - Section 2.1: Statically Typed Links
- Requirement: `typedRoutes: true` must be enabled

**Checklist Update**: Mark complete with config snippet reference

### Task 2.2: Verify App Router Structure ⬜

**Action Steps**:
1. Confirm `app/` directory exists (or `src/app/` if using src/)
2. Verify default `app/layout.tsx` exists
3. Verify default `app/page.tsx` exists
4. Ensure Server Components are default (no 'use client' in base files)

**Docs Traceability**:
- Reference: `docs/ai_guidelines.md` - Section 1.2: Default Component Type RSC
- Reference: `docs/architecture.md` - Section 1: Routing Architecture
- Requirement: React Server Components as default

**Checklist Update**: Document structure verification

---

## Phase 3: Type Safety & Tooling

**Docs Context References**: 
- `docs/implementation.md` (Section 2: Type Safety)
- `docs/sop.md` (Section 2: Code Quality)

### Task 3.1: Configure TypeScript ⬜

**Action Steps**:
1. Verify/update `tsconfig.json` includes generated Next.js types:
   ```json
   {
     "compilerOptions": {
       "target": "ES2017",
       "lib": ["dom", "dom.iterable", "esnext"],
       "allowJs": true,
       "skipLibCheck": true,
       "strict": true,
       "noEmit": true,
       "esModuleInterop": true,
       "module": "esnext",
       "moduleResolution": "bundler",
       "resolveJsonModule": true,
       "isolatedModules": true,
       "jsx": "preserve",
       "incremental": true,
       "plugins": [{ "name": "next" }],
       "paths": {
         "@/*": ["./src/*"]
       }
     },
     "include": [
       "next-env.d.ts",
       ".next/types/**/*.ts",
       "**/*.ts",
       "**/*.tsx"
     ],
     "exclude": ["node_modules"]
   }
   ```
2. Verify `.next/types/**/*.ts` is in include array

**Docs Traceability**:
- Reference: `docs/implementation.md` - Section 2.1: TypeScript Configuration
- Requirement: Include generated Next.js types for statically typed links

**Checklist Update**: Track TypeScript configuration

### Task 3.2: Configure ESLint ⬜

**Action Steps**:
1. Verify `.eslintrc.json` exists with Next.js defaults
2. Add custom rules if needed:
   ```json
   {
     "extends": ["next/core-web-vitals", "next/typescript"],
     "rules": {
       "@typescript-eslint/no-unused-vars": "error",
       "@typescript-eslint/no-explicit-any": "warn"
     }
   }
   ```

**Docs Traceability**:
- Reference: `docs/implementation.md` - Section 2.2: Tooling
- Reference: `docs/sop.md` - Section 2.1: Linters and Formatters

**Checklist Update**: Document ESLint configuration

### Task 3.3: Configure Prettier ⬜

**Action Steps**:
1. Create `.prettierrc.json`:
   ```json
   {
     "semi": false,
     "trailingComma": "es5",
     "singleQuote": true,
     "tabWidth": 2,
     "useTabs": false,
     "printWidth": 100
   }
   ```
2. Create `.prettierignore`:
   ```
   node_modules
   .next
   out
   public
   ```

**Docs Traceability**:
- Reference: `docs/sop.md` - Section 2.1: Linters and Formatters

**Checklist Update**: Track Prettier setup

### Task 3.4: Setup Husky & Lint-Staged ⬜

**Action Steps**:
1. Install dependencies:
   ```bash
   npm install --save-dev husky lint-staged
   ```
2. Initialize Husky:
   ```bash
   npx husky-init && npm install
   ```
3. Create `.husky/pre-commit`:
   ```bash
   #!/usr/bin/env sh
   . "$(dirname -- "$0")/_/husky.sh"
   npx lint-staged
   ```
4. Add to `package.json`:
   ```json
   {
     "lint-staged": {
       "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
       "*.{json,md}": ["prettier --write"]
     }
   }
   ```

**Docs Traceability**:
- Reference: `docs/sop.md` - Section 2.2: Pre-commit Hooks
- Requirement: Prevent poorly formatted code from entering repository

**Checklist Update**: Document pre-commit hook setup

---

## Phase 4: Styling & UI Components

**Docs Context References**: 
- `docs/ai_guidelines.md` (Section 3: Styling and UI)
- `docs/implementation.md` (Section 3: Styling)

### Task 4.1: Verify Tailwind Configuration ⬜

**Action Steps**:
1. Verify `tailwind.config.ts` exists with proper content paths:
   ```typescript
   import type { Config } from 'tailwindcss'

   const config: Config = {
     content: [
       './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
       './src/components/**/*.{js,ts,jsx,tsx,mdx}',
       './src/app/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   export default config
   ```
2. Verify `app/globals.css` includes Tailwind directives

**Docs Traceability**:
- Reference: `docs/ai_guidelines.md` - Section 3.1: Tailwind CSS Mandate
- Reference: `docs/implementation.md` - Section 3.1: Styling Strategy

**Checklist Update**: Verify Tailwind setup

### Task 4.2: Setup shadcn/ui ⬜

**Action Steps**:
1. Initialize shadcn/ui:
   ```bash
   npx shadcn@latest init
   ```
   - Select style, color scheme, etc.
2. Install initial components for demonstration:
   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add card
   npx shadcn@latest add input
   ```
3. Verify components are copied to `src/components/ui/`

**Docs Traceability**:
- Reference: `docs/ai_guidelines.md` - Section 3.2: Open Code Philosophy
- Reference: `docs/implementation.md` - Section 3.2: Component Implementation
- Requirement: Components must be source code, not NPM packages

**Checklist Update**: Document shadcn/ui integration

### Task 4.3: Create components.json ⬜

**Action Steps**:
1. Verify `components.json` was created during shadcn/ui init
2. Ensure it references correct paths:
   ```json
   {
     "$schema": "https://ui.shadcn.com/schema.json",
     "style": "default",
     "rsc": true,
     "tsx": true,
     "tailwind": {
       "config": "tailwind.config.ts",
       "css": "src/app/globals.css",
       "baseColor": "slate",
       "cssVariables": true
     },
     "aliases": {
       "components": "@/components",
       "utils": "@/lib/utils"
     }
   }
   ```

**Docs Traceability**:
- Reference: `docs/ai_guidelines.md` - Section 3.2: UI Component Strategy

**Checklist Update**: Verify components.json configuration

---

## Phase 5: Project Structure

**Docs Context References**: 
- `docs/ai_guidelines.md` (Section 4: Project Structure)
- `docs/architecture.md` (Section 2: Structural Organization)
- `docs/sop.md` (Section 3: Development Structure)

### Task 5.1: Create Private Folders ⬜

**Action Steps**:
1. Create private utility folders following underscore convention:
   ```
   src/
   ├── app/
   ├── _components/     # Shared non-routable components
   ├── _lib/            # Utility functions
   ├── _utils/          # Helper utilities
   ├── _hooks/          # Custom React hooks
   └── _types/          # TypeScript type definitions
   ```

**Docs Traceability**:
- Reference: `docs/ai_guidelines.md` - Section 4.2: Private Folders
- Requirement: Private folders prefixed with underscore

**Checklist Update**: Document folder structure

### Task 5.2: Create Base App Structure ⬜

**Action Steps**:
1. Create sample route structure demonstrating best practices:
   ```
   src/app/
   ├── layout.tsx           # Root layout
   ├── page.tsx            # Home page
   ├── globals.css         # Global styles
   ├── (marketing)/        # Route group
   │   ├── layout.tsx
   │   └── about/
   │       └── page.tsx
   ├── dashboard/
   │   ├── layout.tsx
   │   ├── page.tsx
   │   ├── @analytics/     # Parallel route slot
   │   │   └── page.tsx
   │   └── @revenue/       # Parallel route slot
   │       └── page.tsx
   ├── blog/
   │   ├── [slug]/         # Dynamic route
   │   │   └── page.tsx
   │   └── page.tsx
   ├── api/
   │   └── hello/
   │       └── route.ts    # Route handler
   ├── loading.tsx         # Root loading UI
   ├── error.tsx          # Root error boundary
   └── not-found.tsx      # Custom 404 page
   ```

**Docs Traceability**:
- Reference: `docs/architecture.md` - Section 1: Routing Architecture
- Reference: `docs/architecture.md` - Section 2: Route Groups & Parallel Routing
- Requirement: Demonstrate all major routing patterns

**Checklist Update**: Track structure creation

### Task 5.3: Create Utility Files ⬜

**Action Steps**:
1. Create `src/_lib/utils.ts` with common utilities:
   ```typescript
   import { type ClassValue, clsx } from 'clsx'
   import { twMerge } from 'tailwind-merge'

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }
   ```
2. Create `src/_types/index.ts` for shared types
3. Create sample custom hooks in `src/_hooks/`

**Docs Traceability**:
- Reference: `docs/ai_guidelines.md` - Section 4.2: Private Folders Use Cases

**Checklist Update**: Document utility file creation

---

## Phase 6: Routing Implementation

**Docs Context References**: 
- `docs/requirements.md` (Section 3: Routing Capabilities)
- `docs/architecture.md` (Section 1: Routing Architecture)
- `docs/implementation.md` (Section 4: Routing Implementation)

### Task 6.1: Implement Root Layout ⬜

**Action Steps**:
1. Update `src/app/layout.tsx` with proper structure:
   ```typescript
   import type { Metadata } from 'next'
   import { Inter } from 'next/font/google'
   import './globals.css'

   const inter = Inter({ subsets: ['latin'] })

   export const metadata: Metadata = {
     title: 'Next.js Boilerplate',
     description: 'Production-ready Next.js boilerplate',
   }

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <html lang="en">
         <body className={inter.className}>{children}</body>
       </html>
     )
   }
   ```

**Docs Traceability**:
- Reference: `docs/architecture.md` - Section 2.B: Nested Layouts
- Requirement: Root layout wraps all pages

**Checklist Update**: Track root layout implementation

### Task 6.2: Implement Static Routes ⬜

**Action Steps**:
1. Create home page (`app/page.tsx`)
2. Create about page (`app/(marketing)/about/page.tsx`)
3. Implement proper Server Components with async data fetching examples

**Docs Traceability**:
- Reference: `docs/requirements.md` - Section 3.1: Static Routes
- Reference: `docs/ai_guidelines.md` - Section 1.2: RSC as Default

**Checklist Update**: Document static route implementation

### Task 6.3: Implement Dynamic Routes ⬜

**Action Steps**:
1. Create `app/blog/[slug]/page.tsx`:
   ```typescript
   interface PageProps {
     params: { slug: string }
   }

   export default async function BlogPost({ params }: PageProps) {
     const { slug } = params
     // Fetch data based on slug
     return <div>Blog Post: {slug}</div>
   }

   export async function generateStaticParams() {
     // Generate static paths
     return [{ slug: 'first-post' }, { slug: 'second-post' }]
   }
   ```

**Docs Traceability**:
- Reference: `docs/requirements.md` - Section 3.1: Dynamic Routes
- Reference: `docs/architecture.md` - Section 1: Dynamic Routing

**Checklist Update**: Track dynamic route creation

### Task 6.4: Implement Parallel Routes ⬜

**Action Steps**:
1. Create dashboard with parallel slots:
   - `app/dashboard/@analytics/page.tsx`
   - `app/dashboard/@revenue/page.tsx`
2. Update `app/dashboard/layout.tsx` to receive slots as props:
   ```typescript
   export default function DashboardLayout({
     children,
     analytics,
     revenue,
   }: {
     children: React.ReactNode
     analytics: React.ReactNode
     revenue: React.ReactNode
   }) {
     return (
       <div>
         <div>{children}</div>
         <div className="grid grid-cols-2 gap-4">
           {analytics}
           {revenue}
         </div>
       </div>
     )
   }
   ```

**Docs Traceability**:
- Reference: `docs/architecture.md` - Section 3: Parallel Rendering
- Reference: `docs/requirements.md` - Section 3.1: Parallel Routing

**Checklist Update**: Document parallel routing implementation

### Task 6.5: Implement Route Groups ⬜

**Action Steps**:
1. Create `app/(marketing)/` folder for marketing pages
2. Add shared layout in `app/(marketing)/layout.tsx`
3. Verify URL paths don't include "(marketing)"

**Docs Traceability**:
- Reference: `docs/architecture.md` - Section 2.C: Route Groups
- Requirement: Parentheses folders excluded from URL path

**Checklist Update**: Track route group setup

### Task 6.6: Implement Navigation Components ⬜

**Action Steps**:
1. Create `src/_components/navigation.tsx`:
   ```typescript
   'use client'
   
   import Link from 'next/link'
   import { useRouter } from 'next/navigation'

   export function Navigation() {
     const router = useRouter()

     return (
       <nav>
         <Link href="/">Home</Link>
         <Link href="/about">About</Link>
         <Link href="/blog">Blog</Link>
         <button onClick={() => router.push('/dashboard')}>
           Dashboard
         </button>
       </nav>
     )
   }
   ```

**Docs Traceability**:
- Reference: `docs/implementation.md` - Section 4.1: Navigation Between Routes
- Reference: `docs/sop.md` - Section 6: Navigation Standards
- Requirement: Use Link for internal, useRouter for programmatic

**Checklist Update**: Document navigation implementation

---

## Phase 7: Data Fetching & State Management

**Docs Context References**: 
- `docs/architecture.md` (Section 4: Data Fetching Paradigm)
- `docs/requirements.md` (Section 3.3: Efficient Data Fetching)
- `docs/implementation.md` (Section 6: Performance Optimization)

### Task 7.1: Implement Server-Side Data Fetching ⬜

**Action Steps**:
1. Create example in `app/blog/page.tsx`:
   ```typescript
   async function getPosts() {
     const res = await fetch('https://api.example.com/posts', {
       cache: 'force-cache', // SSG
       // cache: 'no-store', // SSR
       // next: { revalidate: 60 }, // ISR
     })
     return res.json()
   }

   export default async function BlogPage() {
     const posts = await getPosts()
     return <div>{/* Render posts */}</div>
   }
   ```

**Docs Traceability**:
- Reference: `docs/architecture.md` - Section 4: Server Component Direct Fetching
- Reference: `docs/implementation.md` - Section 6.2: Strategic Rendering
- Requirement: Server-side data fetching in RSC

**Checklist Update**: Track data fetching examples

### Task 7.2: Implement Route Handlers (API Routes) ⬜

**Action Steps**:
1. Create `app/api/hello/route.ts`:
   ```typescript
   import { NextResponse } from 'next/server'

   export async function GET() {
     return NextResponse.json({ message: 'Hello from API' })
   }

   export async function POST(request: Request) {
     const body = await request.json()
     return NextResponse.json({ received: body })
   }
   ```

**Docs Traceability**:
- Reference: `docs/architecture.md` - Section 5: Route Handlers
- Requirement: Support GET, POST, PUT, DELETE methods

**Checklist Update**: Document API route creation

### Task 7.3: Implement Loading & Error States ⬜

**Action Steps**:
1. Create `app/blog/loading.tsx`:
   ```typescript
   export default function Loading() {
     return <div>Loading posts...</div>
   }
   ```
2. Create `app/blog/error.tsx`:
   ```typescript
   'use client'

   export default function Error({
     error,
     reset,
   }: {
     error: Error & { digest?: string }
     reset: () => void
   }) {
     return (
       <div>
         <h2>Something went wrong!</h2>
         <button onClick={() => reset()}>Try again</button>
       </div>
     )
   }
   ```
3. Create `app/not-found.tsx`:
   ```typescript
   export default function NotFound() {
     return <div>404 - Page Not Found</div>
   }
   ```

**Docs Traceability**:
- Reference: `docs/implementation.md` - Section 5: State Management
- Reference: `docs/requirements.md` - Section 3.2: Error Handling
- Requirement: loading.js wraps in Suspense, error.js must be Client Component

**Checklist Update**: Track state management files

---

## Phase 8: Testing Infrastructure

**Docs Context References**: 
- `docs/testing.md` (All sections)
- `docs/requirements.md` (Section 3.2: Error Handling)

### Task 8.1: Install Testing Dependencies ⬜

**Action Steps**:
1. Install Jest and React Testing Library:
   ```bash
   npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
   ```
2. Install additional testing utilities:
   ```bash
   npm install --save-dev @testing-library/react-hooks
   ```

**Docs Traceability**:
- Reference: `docs/testing.md` - Section 2.1: Development Dependencies

**Checklist Update**: Track testing package installation

### Task 8.2: Configure Jest ⬜

**Action Steps**:
1. Create `jest.config.js`:
   ```javascript
   const nextJest = require('next/jest')

   const createJestConfig = nextJest({
     dir: './',
   })

   const customJestConfig = {
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     testEnvironment: 'jest-environment-jsdom',
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/src/$1',
     },
     collectCoverageFrom: [
       'src/**/*.{js,jsx,ts,tsx}',
       '!src/**/*.d.ts',
       '!src/**/*.stories.{js,jsx,ts,tsx}',
       '!src/**/__tests__/**',
     ],
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80,
       },
     },
   }

   module.exports = createJestConfig(customJestConfig)
   ```
2. Create `jest.setup.js`:
   ```javascript
   import '@testing-library/jest-dom'
   ```

**Docs Traceability**:
- Reference: `docs/testing.md` - Section 2.2: Code Coverage Requirement
- Requirement: >80% code coverage

**Checklist Update**: Document Jest configuration

### Task 8.3: Create Sample Tests ⬜

**Action Steps**:
1. Create `src/_components/__tests__/navigation.test.tsx`:
   ```typescript
   import { render, screen } from '@testing-library/react'
   import { Navigation } from '../navigation'

   jest.mock('next/navigation', () => ({
     useRouter: () => ({
       push: jest.fn(),
     }),
   }))

   describe('Navigation', () => {
     it('renders navigation links', () => {
       render(<Navigation />)
       expect(screen.getByText('Home')).toBeInTheDocument()
     })
   })
   ```
2. Create unit tests for utilities
3. Create integration tests for API routes

**Docs Traceability**:
- Reference: `docs/testing.md` - Section 3: Testing Strategy
- Requirement: Unit, Integration, and E2E tests

**Checklist Update**: Track test file creation

### Task 8.4: Create Test for Routing Patterns ⬜

**Action Steps**:
1. Create tests for static routes
2. Create tests for dynamic routes with params
3. Create tests for parallel routes rendering
4. Create tests for error.js and not-found.js

**Docs Traceability**:
- Reference: `docs/testing.md` - Section 4: Critical Next.js Feature Testing
- Requirement: Test all routing conventions

**Checklist Update**: Document routing tests

---

## Phase 9: Security Hardening

**Docs Context References**: 
- `docs/security.md` (All sections)
- `docs/architecture.md` (Section 6: Security Considerations)

### Task 9.1: Setup Environment Variables ⬜

**Action Steps**:
1. Create `.env.example`:
   ```
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/db
   
   # API Keys
   NEXT_PUBLIC_API_URL=https://api.example.com
   API_SECRET_KEY=your-secret-key
   
   # Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   ```
2. Create `.env.local` (gitignored)
3. Document environment variable usage

**Docs Traceability**:
- Reference: `docs/security.md` - Section 2: Environment Variable Management
- Requirement: Segmented by stage, never exposed to client

**Checklist Update**: Track env configuration

### Task 9.2: Create Middleware for Auth ⬜

**Action Steps**:
1. Create `src/middleware.ts`:
   ```typescript
   import { NextResponse } from 'next/server'
   import type { NextRequest } from 'next/server'

   export function middleware(request: NextRequest) {
     // Example: Check for auth token
     const token = request.cookies.get('session')
     
     if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
       return NextResponse.redirect(new URL('/login', request.url))
     }

     return NextResponse.next()
   }
**Docs Traceability**:
- Reference: `docs/security.md` - Section 4: Authentication and Authorization
- Requirement: Middleware for protected routes

**Checklist Update**: Document middleware implementation

### Task 9.3: Implement Server-Side Data Security ⬜

**Action Steps**:
1. Create example server component with secure data fetching:
   ```typescript
   // app/dashboard/page.tsx
   async function getSecureData() {
     // Direct database call - safe in RSC
     const data = await fetch('http://localhost:3000/api/secure', {
       headers: {
         'Authorization': `Bearer ${process.env.API_SECRET_KEY}`
       }
     })
     return data.json()
   }

   export default async function Dashboard() {
     const data = await getSecureData()
     return <div>{/* Render secure data */}</div>
   }
   ```
2. Document RSC security benefits in README

**Docs Traceability**:
- Reference: `docs/security.md` - Section 3: Leveraging RSC for Data Security
- Requirement: Server-side execution prevents credential leakage

**Checklist Update**: Track secure data fetching implementation

### Task 9.4: Add Security Headers ⬜

**Action Steps**:
1. Update `next.config.ts` with security headers:
   ```typescript
   const nextConfig: NextConfig = {
     typedRoutes: true,
     reactStrictMode: true,
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             {
               key: 'X-Frame-Options',
               value: 'DENY',
             },
             {
               key: 'X-Content-Type-Options',
               value: 'nosniff',
             },
             {
               key: 'X-XSS-Protection',
               value: '1; mode=block',
             },
             {
               key: 'Referrer-Policy',
               value: 'strict-origin-when-cross-origin',
             },
           ],
         },
       ]
     },
   }
   ```

**Docs Traceability**:
- Reference: `docs/security.md` - Section 1: Handling Sensitive Information
- Reference: Web security best practices

**Checklist Update**: Document security headers

---

## Phase 10: CI/CD Pipeline

**Docs Context References**: 
- `docs/sop.md` (Section 4: Deployment)
- `docs/requirements.md` (Deployment Environments)

### Task 10.1: Create GitHub Actions Workflow ⬜

**Action Steps**:
1. Create `.github/workflows/ci.yml`:
   ```yaml
   name: CI/CD Pipeline

   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main, develop]

   jobs:
     quality:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Type check
           run: npm run type-check
         
         - name: Lint
           run: npm run lint
         
         - name: Format check
           run: npm run format:check
         
         - name: Run tests
           run: npm run test:coverage
         
         - name: Upload coverage
           uses: codecov/codecov-action@v3
           with:
             files: ./coverage/lcov.info
             flags: unittests
             name: codecov-umbrella

     build:
       needs: quality
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Build application
           run: npm run build
         
         - name: Upload build artifacts
           uses: actions/upload-artifact@v3
           with:
             name: build
             path: .next
   ```

**Docs Traceability**:
- Reference: `docs/sop.md` - Section 4.1: CI/CD Pipeline Services
- Requirement: Automated builds, tests, and deployment

**Checklist Update**: Track CI/CD configuration

### Task 10.2: Configure Vercel Deployment ⬜

**Action Steps**:
1. Create `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "framework": "nextjs",
     "outputDirectory": ".next"
   }
   ```
2. Create deployment documentation in README

**Docs Traceability**:
- Reference: `docs/sop.md` - Section 4.2: Deployment Platform
- Requirement: Deploy on [DEPLOYMENT_TARGET]

**Checklist Update**: Document Vercel configuration

### Task 10.3: Setup Environment Variables for Deployment ⬜

**Action Steps**:
1. Document required environment variables for production
2. Create checklist for Vercel environment variable setup
3. Add deployment verification steps

**Docs Traceability**:
- Reference: `docs/security.md` - Section 2: Environment Variable Management
- Requirement: Production environment variables

**Checklist Update**: Track deployment env setup

---

## Phase 11: Performance & SEO Optimization

**Docs Context References**: 
- `docs/implementation.md` (Section 6: SEO and Performance)
- `docs/requirements.md` (Section 3.4: SEO Integration)

### Task 11.1: Implement SEO Metadata ⬜

**Action Steps**:
1. Update `app/layout.tsx` with comprehensive metadata:
   ```typescript
   import type { Metadata } from 'next'

   export const metadata: Metadata = {
     title: {
       template: '%s | Next.js Boilerplate',
       default: 'Next.js Boilerplate',
     },
     description: 'Production-ready Next.js boilerplate with App Router',
     keywords: ['Next.js', 'React', 'TypeScript', 'Boilerplate'],
     authors: [{ name: 'Your Name' }],
     creator: 'Your Name',
     openGraph: {
       type: 'website',
       locale: 'en_US',
       url: 'https://your-domain.com',
       title: 'Next.js Boilerplate',
       description: 'Production-ready Next.js boilerplate',
       siteName: 'Next.js Boilerplate',
       images: [{
         url: 'https://your-domain.com/og-image.png',
         width: 1200,
         height: 630,
       }],
     },
     twitter: {
       card: 'summary_large_image',
       title: 'Next.js Boilerplate',
       description: 'Production-ready Next.js boilerplate',
       images: ['https://your-domain.com/twitter-image.png'],
     },
     robots: {
       index: true,
       follow: true,
     },
   }
   ```

**Docs Traceability**:
- Reference: `docs/implementation.md` - Section 6.1: SEO Metadata
- Reference: `docs/requirements.md` - Section 3.4: Mandatory Tags
- Requirement: title ≤60 chars, description ≤160 chars, OG tags

**Checklist Update**: Track metadata implementation

### Task 11.2: Create Sitemap and Robots.txt ⬜

**Action Steps**:
1. Create `app/sitemap.ts`:
   ```typescript
   import { MetadataRoute } from 'next'

   export default function sitemap(): MetadataRoute.Sitemap {
     return [
       {
         url: 'https://your-domain.com',
         lastModified: new Date(),
         changeFrequency: 'yearly',
         priority: 1,
       },
       {
         url: 'https://your-domain.com/about',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 0.8,
       },
       {
         url: 'https://your-domain.com/blog',
         lastModified: new Date(),
         changeFrequency: 'weekly',
         priority: 0.5,
       },
     ]
   }
   ```
2. Create `app/robots.ts`:
   ```typescript
   import { MetadataRoute } from 'next'

   export default function robots(): MetadataRoute.Robots {
     return {
       rules: {
         userAgent: '*',
         allow: '/',
         disallow: ['/api/', '/dashboard/'],
       },
       sitemap: 'https://your-domain.com/sitemap.xml',
     }
   }
   ```

**Docs Traceability**:
- Reference: `docs/requirements.md` - Section 3.4: Generated Files
- Requirement: sitemap.xml and robots.txt

**Checklist Update**: Document SEO file generation

### Task 11.3: Optimize Images and Fonts ⬜

**Action Steps**:
1. Create example with Next.js Image component:
   ```typescript
   import Image from 'next/image'

   export function OptimizedImage() {
     return (
       <Image
         src="/example.jpg"
         alt="Example image"
         width={800}
         height={600}
         priority
         placeholder="blur"
       />
     )
   }
   ```
2. Verify font optimization in layout (already using `next/font`)
3. Add image optimization guidelines to README

**Docs Traceability**:
- Reference: `docs/implementation.md` - Section 6.3: Optimization Assets
- Requirement: Next.js Image and Font Optimization

**Checklist Update**: Track asset optimization

### Task 11.4: Configure Caching Strategies ⬜

**Action Steps**:
1. Create examples of different caching strategies:
   ```typescript
   // SSG - Static Site Generation
   async function getStaticData() {
     const res = await fetch('https://api.example.com/data', {
       cache: 'force-cache' // Default
     })
     return res.json()
   }

   // ISR - Incremental Static Regeneration
   async function getRevalidatedData() {
     const res = await fetch('https://api.example.com/data', {
       next: { revalidate: 3600 } // Revalidate every hour
     })
     return res.json()
   }

   // SSR - Server-Side Rendering
   async function getDynamicData() {
     const res = await fetch('https://api.example.com/data', {
       cache: 'no-store' // Always fetch fresh
     })
     return res.json()
   }
   ```
2. Document caching strategies in README

**Docs Traceability**:
- Reference: `docs/implementation.md` - Section 6.2: Strategic Rendering
- Requirement: SSG, ISR, SSR based on content dynamism

**Checklist Update**: Document caching implementation

---

## Phase 12: Documentation

**Docs Context References**: 
- `docs/sop.md` (Section 5: Documentation Maintenance)
- All docs files for context

### Task 12.1: Create Comprehensive README.md ⬜

**Action Steps**:
1. Create `README.md` with following sections:
   ```markdown
   # Next.js Boilerplate

   Production-ready Next.js boilerplate with App Router, TypeScript, Tailwind CSS, and shadcn/ui.

   ## Features

   - ✅ Next.js 14+ with App Router
   - ✅ React 18+ with Server Components
   - ✅ TypeScript with strict mode
   - ✅ Tailwind CSS for styling
   - ✅ shadcn/ui components (Open Code philosophy)
   - ✅ ESLint + Prettier for code quality
   - ✅ Husky + Lint-Staged for pre-commit hooks
   - ✅ Jest + React Testing Library
   - ✅ GitHub Actions CI/CD
   - ✅ Security best practices
   - ✅ SEO optimization

   ## Prerequisites

   - Node.js v18.18.0 or later
   - npm or yarn or pnpm

   ## Getting Started

   ### Installation

   \`\`\`bash
   # Clone repository
   git clone [REPOSITORY_URL]
   cd [PROJECT_NAME]

   # Install dependencies
   npm install

   # Copy environment variables
   cp .env.example .env.local

   # Run development server
   npm run dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser.

   ## Project Structure

   \`\`\`
   src/
   ├── app/                    # Next.js App Router
   │   ├── (marketing)/       # Route group
   │   ├── api/               # API routes
   │   ├── blog/              # Blog pages
   │   ├── dashboard/         # Dashboard with parallel routes
   │   ├── layout.tsx         # Root layout
   │   ├── page.tsx           # Home page
   │   ├── error.tsx          # Error boundary
   │   ├── loading.tsx        # Loading UI
   │   └── not-found.tsx      # 404 page
   ├── _components/           # Shared components
   ├── _lib/                  # Utility functions
   ├── _hooks/                # Custom React hooks
   ├── _types/                # TypeScript types
   └── middleware.ts          # Middleware for auth/routing
   \`\`\`

   ## Available Scripts

   - `npm run dev` - Start development server
   - `npm run build` - Build for production
   - `npm run start` - Start production server
   - `npm run lint` - Run ESLint
   - `npm run lint:fix` - Fix ESLint issues
   - `npm run format` - Format code with Prettier
   - `npm run format:check` - Check code formatting
   - `npm run test` - Run tests
   - `npm run test:watch` - Run tests in watch mode
   - `npm run test:coverage` - Generate coverage report
   - `npm run type-check` - Check TypeScript types

   ## Architecture Highlights

   ### App Router
   - File-system based routing
   - Server Components by default
   - Nested layouts and route groups
   - Parallel routing for dashboards
   - Dynamic routes with `[slug]` convention

   ### Data Fetching
   - Server-side fetching with `fetch` API
   - Caching strategies (SSG, ISR, SSR)
   - Direct database calls in Server Components
   - Route Handlers for API endpoints

   ### Styling
   - Tailwind CSS utility-first approach
   - shadcn/ui components (customizable source code)
   - CSS Modules support
   - Responsive design patterns

   ### Testing
   - Jest for unit testing
   - React Testing Library for component testing
   - Coverage threshold: 80%
   - GitHub Actions for CI/CD

   ### Security
   - Environment variable management
   - Server-side data fetching
   - Middleware for authentication
   - Security headers configured

   ## Environment Variables

   See `.env.example` for required environment variables.

   ## Deployment

   ### Vercel (Recommended)

   1. Push code to GitHub
   2. Import project in Vercel
   3. Configure environment variables
   4. Deploy

   ## Documentation

   Comprehensive documentation available in `docs/`:
   - [AI Guidelines](docs/ai_guidelines.md)
   - [Requirements](docs/requirements.md)
   - [Architecture](docs/architecture.md)
   - [Implementation](docs/implementation.md)
   - [Testing](docs/testing.md)
   - [Security](docs/security.md)
   - [SOP](docs/sop.md)
   - [Checklist](docs/checklist.md)

   ## Contributing

   See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

   ## License

   MIT License - see [LICENSE](LICENSE) for details.
   ```

**Docs Traceability**:
- Reference: `docs/sop.md` - Section 5.1: README.md
- Requirement: Setup, development, testing, deployment instructions

**Checklist Update**: Track README creation

### Task 12.2: Create CONTRIBUTING.md ⬜

**Action Steps**:
1. Create `CONTRIBUTING.md`:
   ```markdown
   # Contributing Guidelines

   Thank you for considering contributing to this project!

   ## Getting Started

   1. Fork the repository
   2. Clone your fork
   3. Create a feature branch
   4. Make your changes
   5. Run tests and linting
   6. Commit with conventional commits
   7. Push to your fork
   8. Create a Pull Request

   ## Development Workflow

   ### Branching Strategy

   We use [GitHub Flow / Gitflow]:
   - `main` - Production-ready code
   - `develop` - Development branch
   - `feature/*` - Feature branches
   - `fix/*` - Bug fix branches

   ### Commit Messages

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Test additions/changes
   - `chore:` - Maintenance tasks

   ### Code Quality

   - All code must pass ESLint checks
   - All code must be formatted with Prettier
   - All tests must pass
   - Coverage must maintain >80%
   - TypeScript strict mode must pass

   ### Pull Request Process

   1. Update documentation if needed
   2. Add tests for new features
   3. Ensure all checks pass
   4. Request review from maintainers
   5. Address review feedback
   6. Squash commits if requested

   ## Code Style

   - Use TypeScript for all files
   - Follow ESLint configuration
   - Use functional components
   - Prefer Server Components
   - Use 'use client' only when necessary
   - Follow naming conventions in docs/

   ## Testing

   - Write unit tests for utilities
   - Write component tests with RTL
   - Write integration tests for features
   - Maintain coverage above 80%

   ## Questions?

   Open an issue for discussion!
   ```

**Docs Traceability**:
- Reference: `docs/sop.md` - Section 5.2: Contributing Guidelines

**Checklist Update**: Document contributing guidelines

### Task 12.3: Create LICENSE ⬜

**Action Steps**:
1. Create `LICENSE` file (MIT or chosen license)
2. Add copyright information

**Docs Traceability**:
- Reference: Standard open source practices

**Checklist Update**: Track license file

### Task 12.4: Add Inline Code Documentation ⬜

**Action Steps**:
1. Add JSDoc comments to utility functions
2. Add comments explaining complex logic
3. Document component props with TypeScript interfaces
4. Add README files in key directories

**Docs Traceability**:
- Reference: `docs/sop.md` - Section 5.3: Architecture Documentation

**Checklist Update**: Track code documentation

---

## Phase 13: Final Validation & Packaging

**Docs Context References**: 
- All documentation files
- `docs/checklist.md` (self-reference)

### Task 13.1: Run Full Test Suite ⬜

**Action Steps**:
1. Run all commands to verify setup:
   ```bash
   npm run type-check
   npm run lint
   npm run format:check
   npm run test:coverage
   npm run build
   ```
2. Verify all checks pass
3. Document any warnings or issues

**Docs Traceability**:
- Reference: All implementation phases
- Requirement: All quality checks must pass

**Checklist Update**: Track validation results

### Task 13.2: Verify Documentation Completeness ⬜

**Action Steps**:
1. Review all docs files for completeness
2. Verify cross-references work
3. Ensure README accurately reflects implementation
4. Check that checklist.md is up-to-date

**Docs Traceability**:
- Reference: `docs/documentation-summary.md`
- Requirement: Traceability between docs and code

**Checklist Update**: Document verification status

### Task 13.3: Security Audit ⬜

**Action Steps**:
1. Run `npm audit` and address vulnerabilities
2. Verify `.env.example` doesn't contain secrets
3. Verify `.gitignore` excludes sensitive files
4. Check middleware authentication logic
5. Verify security headers in next.config.ts

**Docs Traceability**:
- Reference: `docs/security.md` - All sections
- Requirement: Zero security vulnerabilities

**Checklist Update**: Track security audit

### Task 13.4: Performance Testing ⬜

**Action Steps**:
1. Run Lighthouse audit on built application
2. Verify Core Web Vitals scores
3. Check bundle size with `npm run build`
4. Verify image optimization working
5. Test loading states and error boundaries

**Docs Traceability**:
- Reference: `docs/requirements.md` - Non-functional Requirements
- Reference: `docs/implementation.md` - Section 6: Performance
- Requirement: Load times <2 seconds

**Checklist Update**: Document performance metrics

### Task 13.5: Create Deployment Checklist ⬜

**Action Steps**:
1. Create deployment verification document
2. List all environment variables needed
3. Document deployment steps
4. Create rollback procedures
5. Add monitoring setup instructions

**Docs Traceability**:
- Reference: `docs/sop.md` - Section 4: Deployment

**Checklist Update**: Track deployment documentation

### Task 13.6: Final Checklist Review ⬜

**Action Steps**:
1. Review `docs/checklist.md` for completeness
2. Ensure all tasks are marked ✅ or documented as blocked
3. Add final summary section to checklist
4. Document known issues or future enhancements
5. Add completion timestamp

**Docs Traceability**:
- Reference: This prompt document
- Requirement: Full traceability and observability

**Checklist Update**:
```markdown
## Final Summary

### Completion Status
- Total Tasks: [NUMBER]
- Completed: [NUMBER] ✅
- Blocked: [NUMBER] ❌
- Overall Progress: [PERCENTAGE]%

### Completion Date
[YYYY-MM-DD HH:MM]

### Deliverables Checklist
- ✅ Next.js boilerplate with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS + shadcn/ui
- ✅ ESLint + Prettier + Husky
- ✅ Jest + React Testing Library
- ✅ GitHub Actions CI/CD
- ✅ Environment variable setup
- ✅ Security middleware
- ✅ SEO optimization
- ✅ Comprehensive documentation
- ✅ All tests passing
- ✅ All quality checks passing

### Known Issues
[List any known issues or limitations]

### Future Enhancements
[List potential improvements or features for future versions]

### Traceability Matrix
All requirements from docs/ mapped to implementation:
- ai_guidelines.md → [FILES]
- requirements.md → [FILES]
- architecture.md → [FILES]
- implementation.md → [FILES]
- testing.md → [FILES]
- security.md → [FILES]
- sop.md → [FILES]
```

### Task 13.7: Package Repository ⬜

**Action Steps**:
1. Ensure all files are committed to Git
2. Create final commit: `git commit -m "chore: complete Next.js boilerplate v1.0.0"`
3. Tag release: `git tag v1.0.0`
4. Create repository archive:
   ```bash
   # Option 1: Zip file
   git archive --format=zip --output=nextjs-boilerplate-v1.0.0.zip HEAD
   
   # Option 2: Tarball
   git archive --format=tar.gz --output=nextjs-boilerplate-v1.0.0.tar.gz HEAD
   ```
5. Document push instructions for remote repository

**Docs Traceability**:
- Reference: Final deliverable requirement

**Checklist Update**: Mark packaging complete

---

## Output Instructions for CLine

### Continuous Updates

Throughout the entire process:

1. **Update `docs/checklist.md` after EVERY task completion**
   - Change status from ⬜ to 🟡 when starting
   - Change status from 🟡 to ✅ when complete
   - Add timestamp using format: `YYYY-MM-DD HH:MM`
   - Link to relevant docs context
   - Note any deviations or decisions
   - List next action items

2. **Commit frequently with descriptive messages**
   - Use conventional commit format
   - Commit after each major task or logical grouping
   - Reference checklist task number in commits
   - Example: `feat: implement typed routes configuration (Task 2.1)`

3. **Document decisions and trade-offs**
   - Add comments in code explaining "why" not just "what"
   - Update checklist with rationale for implementation choices
   - Note any deviations from docs guidance

### Final Deliverables

When all phases are complete:

1. **Verify checklist.md is fully updated**
   - All tasks marked with status
   - Final summary section completed
   - Traceability matrix filled out

2. **Create repository archive**
   - Generate zip file: `nextjs-boilerplate-v1.0.0.zip`
   - Include all files except node_modules and .next
   - Ensure .env.example is included, not .env.local

3. **Provide handoff documentation**
   - Output location of zip file
   - Provide instructions for:
     - Extracting archive
     - Installing dependencies
     - Running development server
     - Deploying to production
   - Include link to docs/checklist.md for progress reference

4. **Create summary report**
   ```markdown
   # Next.js Boilerplate - Completion Report

   ## Executive Summary
   Successfully created production-ready Next.js boilerplate following all guidelines from docs/ folder.

   ## Statistics
   - Total Files Created: [NUMBER]
   - Total Lines of Code: [NUMBER]
   - Test Coverage: [PERCENTAGE]%
   - Total Commits: [NUMBER]
   - Time Taken: [DURATION]

   ## Documentation Traceability
   - ai_guidelines.md: [STATUS] - All mandates implemented
   - requirements.md: [STATUS] - All requirements met
   - architecture.md: [STATUS] - Architecture followed
   - implementation.md: [STATUS] - Standards applied
   - testing.md: [STATUS] - Testing complete
   - security.md: [STATUS] - Security hardened
   - sop.md: [STATUS] - SOPs established

   ## Quality Metrics
   - Type Safety: ✅ TypeScript strict mode
   - Code Quality: ✅ ESLint passing
   - Formatting: ✅ Prettier passing
   - Testing: ✅ [COVERAGE]% coverage
   - Build: ✅ Production build successful
   - Security: ✅ No vulnerabilities

   ## Deliverables
   - ✅ Repository: [LOCATION]
   - ✅ Archive: nextjs-boilerplate-v1.0.0.zip
   - ✅ Documentation: docs/
   - ✅ Checklist: docs/checklist.md

   ## Next Steps
   1. Extract archive to desired location
   2. Run `npm install`
   3. Copy `.env.example` to `.env.local`
   4. Run `npm run dev`
   5. Review docs/checklist.md for implementation details
   6. Deploy to [DEPLOYMENT_TARGET]
   ```

---

## Success Criteria

The boilerplate is considered complete when:

- ✅ All 13 phases marked as "Done" in checklist.md
- ✅ All tasks within each phase marked as ✅
- ✅ All quality checks passing (lint, format, type-check, test)
- ✅ Test coverage ≥80%
- ✅ Build successful with no errors
- ✅ Security audit passed with zero vulnerabilities
- ✅ All documentation complete and accurate
- ✅ Full traceability between docs/ and implementation
- ✅ Repository archived and ready for distribution

---

## Important Reminders

1. **ALWAYS update docs/checklist.md first** - This is your source of truth
2. **Reference docs context at every step** - Maintain traceability
3. **Commit frequently** - Small, logical commits with clear messages
4. **Test as you go** - Don't wait until the end to test
5. **Document decisions** - Future you (and others) will thank you
6. **Follow the docs strictly** - They contain all requirements and constraints
7. **Ask for clarification** - If requirements conflict, document and proceed with best judgment

---

Begin with Phase 0: Creating docs/checklist.md, then proceed systematically through each phase. Good luck! 🚀
</details>

<br>

Now you can see why I leave Anthropic for the final draft. There are multiple ways to proceed. The best method is to stop after each phase outlined and test everything. But for today I am going to YOLO through all the phases and see if we got it all in one prompt.

<br>

## Vibe Coding

<br>

![Image](/images/1020005.png)

<br>

![Image](/images/1020006.png)

<br>

![Image](/images/1020007.png)

<br>

![Image](/images/1020008.png)

<br>

### [Link to Repo](https://github.com/kliewerdaniel/next.git)

<br>

Not much effort other than periodically clicking proceed. When most people think about vibe coding they typically think the process begins here but as you can see this is bascially the end. But does it work?

<br>

## Vibe Debugging

<br>

![Image](/images/1020010.png)

<br>

So it runs without errors when I initially start it up. It is functional except for two key part:

No dashboard layout.tsx or page.tsx exists in the dashboard directory. This means the parallel routes (@analytics and @revenue) have content but there's no main dashboard container to display them.

The navigation includes an "/about" link, but there's no corresponding about page or directory in src/app/.

Currently, both pages are incomplete and won't render properly if accessed directly.

Since this is a boilerplate we really don't need all of that since it is pretty simple to expand that functionality if needed or remove it.


## Conclusion: Mastering Vibe Coding for Next.js

Vibe coding represents a paradigm shift in software development, combining human expertise with AI assistance to create production-ready applications efficiently. This methodology proves particularly effective for Next.js boilerplate development, enabling rapid creation of robust, scalable applications.

**Future implementations** can leverage this structured approach to create increasingly sophisticated applications. The combination of comprehensive documentation, AI assistance, and systematic development processes establishes a new standard for efficient software development.

**Ready to start your vibe coding journey?** Begin with thorough research, create comprehensive documentation, and leverage AI tools to accelerate your Next.js development process.


I would call this success. We were able to create a boilerplate Next.JS repo all in one vibe coding prompt.


<br>

### [Link to Repo](https://github.com/kliewerdaniel/next.git)

<br>

![Image](/images/1020011.png)




