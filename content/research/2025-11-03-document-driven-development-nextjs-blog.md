---
book_reference: true
canonical_url: /blog/2025-11-03-document-driven-development-nextjs-blog
date: 11-03-2025
description: 'A complete guide to Document-Driven Development and AI-assisted coding:
  building a Next.js 16 blog from scratch using plain language prompts, comprehensive
  documentation, and iterative AI collaboration.'
image: /images/1103010.png
layout: post
og:description: Learn how to build production-ready applications using Document-Driven
  Development and AI coding agents. Complete workflow, prompts, and methodology included.
og:image: https://danielkliewer.com/images/1103010.png
og:title: 'Document-Driven Development: Building a Next.js Blog With AI From Start
  to Finish'
og:type: article
og:url: https://danielkliewer.com/blog/document-driven-development-nextjs-blog
tags:
- vibe-coding
- document-driven-development
- next-js
- ai-coding
- software-engineering
- prompt-engineering
- workflow-automation
- developer-productivity
title: 'Document-Driven Development: How I Built a Production Blog Without Writing
  a Single Line of Code By Hand'
twitter:card: summary_large_image
twitter:description: A revolutionary approach to software development using documentation
  as code and AI agents as collaborators. See the complete workflow.
twitter:image: https://danielkliewer.com/images/1103010.png
twitter:title: 'Document-Driven Development: AI-Powered Next.js Blog Creation'
wiki_references: ["ai-agents", "embeddings", "local-inference", "ollama", "prompt-engineering", "python", "rag", "sentence-transformers", "typescript"]
---




# Document-Driven Development: How I Built a Production Blog Without Writing a Single Line of Code By Hand

Look, I need to be honest with you about something that's been weighing on me. The term "vibe coding" makes me want to crawl out of my skin. It sounds like something a trust fund kid would say while sipping a $12 oat milk latte in a WeWork. It's reductive, dismissive, and—worst of all—it's become a slur that scared developers use to look down on anyone who dares to work differently than they do.

But here's the thing I've come to accept: sometimes you have to reclaim the language being used against you. If they're going to call what I do "vibe coding" with contempt in their voices, then fine—I'll own it. Because what they're really afraid of isn't the methodology. What terrifies them is obsolescence.

And I get it. I really do. When your entire professional identity is built on knowing the arcane syntax of seventeen different frameworks, watching someone build the same thing with plain English must feel like watching the ground disappear beneath your feet. But that fear doesn't give anyone the right to gatekeep progress or mock people for using the tools available to them.

So let's talk about what "vibe coding" actually means when you strip away the condescension. To me, it's simple: **using natural language to create functional software without requiring encyclopedic knowledge of implementation details**. It's about focusing on what you want to build rather than memorizing how to build it. It's about making software development accessible to people who have brilliant ideas but don't want to spend six months learning TypeScript before they can create something meaningful.

## The Real Innovation: Document-Driven Development

Here's where things get interesting, and where I think we move beyond the dismissive "vibe coding" label into something with actual intellectual substance. I call my approach **Document-Driven Development**, and it's rooted in a principle that should be obvious but somehow isn't: **if you can't articulate what you're building with clarity and precision, you can't build it well—no matter how much code you write**.

The methodology is straightforward: create comprehensive, interconnected documentation that defines every aspect of your project *before you write a single line of code*. Not skeleton docs. Not placeholder READMEs. I mean real, thoughtful documentation that could guide a human developer or an AI agent through the entire development lifecycle.

I maintain a template repository of documents that serve as the foundation for most projects. You can clone it yourself:

```
git clone https://github.com/kliewerdaniel/workflow.git
```

![Documentation template folder structure](/images/1103001.png)

This isn't just busy work or over-engineering. This is **documentation as architecture**. When you force yourself to think through accessibility standards, security protocols, testing strategies, and deployment procedures before you build anything, you're frontloading the cognitive work that most developers skip until it becomes a crisis.

## The Pre-Prompt Methodology: Teaching AI to Think Like You

Here's where my process diverges from what most people do when they're just throwing prompts at ChatGPT and hoping for the best. I use what I call **pre-prompt prompting**—essentially, I write a prompt that instructs an LLM how to write the *actual* prompt I'll give to my coding agent.

It sounds meta, and it is, but there's a reason for the extra step. When you ask an LLM to help you craft a better prompt, you're leveraging its training to identify gaps in your thinking, suggest better structure, and anticipate edge cases you haven't considered. You're not just automating code generation; you're automating *requirements analysis*.

Here's the initial pre-prompt I use:

```
You are an expert in document drafting for technical documentation for software engineering. Your job is to build a prompt which I will then give to a coding agent to then iterively go through all of the listed files in the docs folder and construct all of the necessary documentation needed to drive a document driven development cycle of using coding agents to create code. Please instruct the LLM to draft the propmt to be given to the coding agent which will then only edit iterively all of the documents in the docs folder for our purpose.
```

Then I feed it the specific context about what each documentation file should contain. And I'm not going to lie—this part takes work. You need to think through what belongs in `accessibility.md` versus `security.md` versus `ai_guidelines.md`. You need to consider how these documents reference each other, how they'll be maintained, and how they'll guide development decisions six months from now when you've forgotten your original intent.

But that's the point. **Documentation isn't a chore that comes after development. It's the blueprint that makes development possible.**

## The Complete Documentation Blueprint

After iterating on this process across multiple projects, I've developed a comprehensive framework for what should go in each documentation file. I'm including the full boilerplate prompt here because I think transparency matters more than hoarding "trade secrets":

```
You are an expert in document drafting for technical documentation for software engineering. Your job is to build a prompt which I will then give to a coding agent to then iterively go through all of the listed files in the docs folder and construct all of the necessary documentation needed to drive a document driven development cycle of using coding agents to create code. Please instruct the LLM to draft the propmt to be given to the coding agent which will then only edit iterively all of the documents in the docs folder for our purpose.

Below is a complete blueprint explaining how to compose each file, what to include, and why each matters in a professional-grade software engineering process.

The goal is to create a living documentation ecosystem: every file works together, reducing ambiguity and aligning developers, designers, and AI collaborators.


Remember:
	•	Each .md file represents a single domain of truth.
	•	Documents should be interlinked (use relative Markdown links).
	•	Keep them modular — update one file without rewriting the others.
	•	Version control documentation changes like code — documentation is part of the codebase.

⸻

1. README.md — Project Overview and Orientation

Purpose: The entry point for humans and AI systems alike. It provides a high-level summary of what the project is, how to run it, and where to find everything.

Include:
	•	Project name and tagline
	•	Mission statement / goal
	•	System overview diagram
	•	Quick start guide (installation, setup, run)
	•	Directory structure (with descriptions)
	•	Tech stack (languages, frameworks, major dependencies)
	•	Links to all other major documents (architecture, standards, etc.)
	•	Contributor guide (how to fork, branch naming, PR etiquette)
	•	License information

⸻

2. requirements.md — Functional and Non-Functional Specs

Purpose: The contract between stakeholders and developers.

Include:
	•	Functional requirements: each user-facing feature, described in behavior-driven style (Given/When/Then).
	•	Non-functional requirements: performance, scalability, uptime, maintainability.
	•	Constraints: technology limits, APIs, third-party dependencies.
	•	Acceptance criteria per feature.
	•	Priority tags (P0 = critical, P1 = important, etc.)
	•	Future features (optional section for roadmap alignment).

⸻

3. architecture.md — System Design and Technical Blueprint

Purpose: Defines how the system is built, at both macro and micro levels.

Include:
	•	High-level architecture diagram (frontend, backend, DB, external services).
	•	Component breakdown: responsibilities, inputs/outputs, and dependencies.
	•	Data flow diagrams (DFDs or sequence diagrams).
	•	API design overview (link to OpenAPI/Swagger if applicable).
	•	Storage strategy: DB schema, indexes, caching, file storage.
	•	Error handling patterns.
	•	Scaling strategy (horizontal vs vertical).
	•	Change management process (how architecture evolves over time).

⸻

4. implementation.md — Development Details

Purpose: Provides actionable, developer-focused explanations on how architecture translates into code.

Include:
	•	Folder structure rationale.
	•	Class/module conventions (naming, organization).
	•	Dependency injection pattern.
	•	State management strategy.
	•	Configuration files overview.
	•	Environment variables list.
	•	Versioning approach (semantic versioning, changelog link).

⸻

5. standards.md — Coding, Naming, and Style Conventions

Purpose: Prevents chaos. Defines how code, commits, and documentation are written.

Include:
	•	Code style guide: indentation, naming, comments.
	•	Commit message convention (e.g., Conventional Commits).
	•	Branching strategy: main, develop, feature/*, etc.
	•	Documentation standards: how to write and update markdown.
	•	AI-generated code standards: prompts, review process, and approval.
	•	Linter/formatter settings reference (ESLint, Black, Prettier, etc.).
	•	CI/CD formatting enforcement policy.

⸻

6. sop.md — Standard Operating Procedures

Purpose: Describes the step-by-step workflow for recurring engineering tasks.

Include:
	•	Feature development workflow: ticket creation → branch → PR → review → merge → deploy.
	•	Code review checklist.
	•	Release management: version bump → tagging → changelog update.
	•	Incident response: error → alert → triage → resolution → postmortem.
	•	Backup & recovery procedures.
	•	Documentation update policy.
	•	AI usage SOP: when and how AI tools assist, and human verification required.

⸻

7. checklist.md — Quick Verification for Each Stage

Purpose: Provides a concise, repeatable quality assurance tool.

Include:
	•	Pre-commit checklist (lint, tests, docs updated).
	•	Pre-PR checklist (code reviewed, screenshots added).
	•	Pre-deploy checklist (env verified, rollback ready).
	•	Accessibility and SEO verification.
	•	Security scan checklist.
	•	Post-deploy validation checklist.

⸻

8. testing.md — Quality Assurance Strategy

Purpose: Defines the philosophy and specifics behind automated and manual testing.

Include:
	•	Testing strategy overview (unit, integration, E2E, load).
	•	Test pyramid diagram.
	•	Frameworks and tools (pytest, Jest, Cypress, etc.).
	•	Mocking and test data policy.
	•	Coverage standards (e.g., 80% minimum).
	•	Continuous testing setup.
	•	Bug reporting workflow and template.
	•	AI regression testing process (if applicable).

⸻

9. deployment.md — DevOps and Environment Strategy

Purpose: Explains how code moves from dev → staging → production.

Include:
	•	Environments overview (dev/staging/prod).
	•	CI/CD pipeline steps.
	•	Infrastructure diagram (servers, containers, cloud resources).
	•	Secrets management policy.
	•	Rollback plan.
	•	Monitoring & logging strategy.
	•	Performance benchmarks.
	•	Post-deployment verification.

⸻

10. security.md — Secure Development Lifecycle (SDLC)

Purpose: Ensures security is embedded, not bolted on.

Include:
	•	Threat model overview.
	•	Authentication & authorization design.
	•	Encryption practices (data at rest/in transit).
	•	API security best practices.
	•	Dependency vulnerability scanning process.
	•	Access control policies.
	•	Incident response protocol.
	•	Penetration testing schedule.

⸻

11. accessibility.md — Inclusive and Compliant Design

Purpose: Guarantees usability across ability levels.

Include:
	•	Accessibility philosophy (e.g., "Accessible by design").
	•	Compliance standards: WCAG 2.1, ADA, Section 508.
	•	Color contrast, typography, and ARIA guidelines.
	•	Keyboard navigation checklist.
	•	Screen reader testing workflow.
	•	Accessibility audit frequency.
	•	Tool references: Lighthouse, axe-core, etc.

⸻

12. seo.md — Search Engine Optimization Blueprint

Purpose: For web-facing software, ensures visibility and ranking.

Include:
	•	Keyword strategy (linked to product goals).
	•	Content metadata rules: title, description, alt text.
	•	Schema markup usage.
	•	Internal linking standards.
	•	Performance & mobile SEO optimization.
	•	Sitemaps and robots.txt policy.
	•	AI-generated content review checklist (avoid keyword stuffing, ensure readability).

⸻

13. ai_guidelines.md — Responsible and Effective AI Integration

Purpose: Defines how AI is used ethically and consistently in the codebase or workflow.

Include:
	•	AI usage principles (transparency, verification, attribution).
	•	Prompt engineering standards.
	•	Evaluation and bias mitigation process.
	•	Data privacy considerations.
	•	Model selection and retraining strategy.
	•	Human-in-the-loop checkpoints.
	•	Audit logs for AI-generated output.

⸻

14. system_prompt.md — The Canonical Prompt for AI Agents

Purpose: The "personality" and rules of your project's AI assistants (local or remote).

Include:
	•	Project identity and mission.
	•	Role definition (what the AI should and shouldn't do).
	•	Tone, formatting, and output style.
	•	Context injection rules (which docs or repos to reference).
	•	Safety and refusal guidelines.
	•	Update history of prompt iterations.

```

I've saved this as `documentation_prompt.md` in my workflow repository. Feel free to use it, modify it, build on it. That's the whole point.

## Defining the Project: From Constraints to Requirements

Before we can build anything, we need to know what we're building and what limitations we're working within. For this blog rebuild, my constraints were clear:

- Next.js 16 application
- Free deployment on Netlify via GitHub integration
- Tailwind CSS for styling
- shadcn/ui for components

Then came the features—the actual requirements that would define success:

```
Hero on landing page with clean and professional presentation but more creative this time so perhaps an image or video in the background this time.

Links to E-Books

Infinite scroll blog.

Return to top of page button in lower right corner.

Header menu that is responsive in design allowing navigation to the following pages:

About section has an image of the blogger and written description of their life.

Projects section has a list of coding projects from github with categories allowing easy sorting through category buttons allowing the filtering of the projects and only showing those in that category.

Blog section has a search bar at the top allowing semantic search of the blog posts as well as a filtering method allowing the sorting of posts by categories.

The blog section has cards for each post which include a space for the image for the post and other meta data about the article.

Blog post pages will be formatted so that they can be entirely in markdown using markdownify or similar packages or libraries for the frontmatter, or if you know of some other options that would be better.

There should be user interface and user experience considerations taken into the user friendliness of the blog.

Create extensive testing so that we will know it will deploy without error.
```

This is the messy, stream-of-consciousness version. The next step is refining this into something an AI agent can actually work with.

## From Requirements to Refined Specification

I took my rough requirements list and used ChatGPT to help me think through design decisions and translate my half-formed ideas into a coherent project specification. This collaborative brainstorming process is underrated—it's not about the AI doing your thinking for you, it's about using it as a mirror to reflect your ideas back at you in a more structured form.

After several iterations, here's what I ended up with:

```
Project Description

This project is a modern personal portfolio and blog platform built with Next.js 16, designed to showcase the developer's writing, coding projects, and e-books in a professional yet creative way. The landing page will feature a hero section with an interactive 3D background using Three.js, creating an immersive first impression through motion and depth while maintaining fast load performance and accessibility. The visual design will balance artistic creativity with clean, minimalist presentation, ensuring that it feels both innovative and polished across all devices.

A responsive header menu will provide navigation to the primary site sections: Home, About, Projects, and Blog. The About section will include a high-quality image of the blogger alongside a well-crafted biography describing their background, philosophy, and professional journey.

The Projects section will dynamically pull data directly from GitHub's API, automatically updating the displayed list of repositories. Each project will appear as a visually engaging card and support client-side category filtering, allowing visitors to browse projects by language, framework, or topic using intuitive buttons.

The Blog section will feature an infinite scroll interface that delivers a smooth, uninterrupted reading experience. At the top of the blog, a semantic search bar will enable users to perform concept-based queries powered by a local vector search system (Ollama/ChromaDB integration), allowing more intelligent content discovery beyond keyword matching. Visitors will also be able to filter posts by category, ensuring easy navigation through diverse topics. Each blog post will be represented by a card containing a featured image, metadata (author, date, tags), an estimated reading time, and a brief excerpt. A "Return to top" button will persist in the lower-right corner for seamless scrolling navigation.

Individual blog post pages will be written entirely in Markdown, using the MDX format to enable the embedding of React components directly into Markdown content. This ensures maximum flexibility in formatting posts, enabling interactivity and visual variety while maintaining compatibility with the site's SEO structure.

The E-Books section will contain direct links or previews of available e-books authored by the blogger, integration with gumroad sales platform.

From a design and usability perspective, the project will include micro-interactions and animations, such as subtle hover effects on cards and smooth scroll transitions throughout the site. A dark/light mode toggle will allow users to personalize their viewing experience, and all UI components will be designed with strong accessibility compliance, including ARIA roles, descriptive alt text, and full keyboard navigability.

Extensive testing and deployment validation will be implemented through Netlify or Vercel preview environments, combined with Lighthouse audits for accessibility and SEO. In parallel, a Dockerized deployment workflow will ensure reproducible environments and reliable builds. The platform will follow modern best practices in semantic HTML, structured data, meta tags, and Open Graph integration to ensure search optimization and shareability.

The end result will be a high-performance, visually engaging, and intelligently searchable blog ecosystem that reflects the developer's technical expertise, creative sensibility, and commitment to accessibility and user experience.
```

Now we're talking. This isn't just a feature list—it's a vision statement that gives context and rationale for every technical decision.

## Feeding the Documentation to the AI Agent

With both the documentation boilerplate and the project specification ready, it's time to hand everything over to CLIne (or whatever AI coding agent you prefer). The prompt structure is straightforward but deliberate:

![Prompt structure in CLIne](/images/1103002.png)

The initial prompt is simple but sets the tone:

```
You are a world class developer and you are creating a blog that will impress everyone you know. Develop the application as described in the docs folder. Be sure to read each and every document before beginning and formulate a plan of action to be created read and updated as needed. Follow all of the standards and instructions.
```

Notice what I'm doing here: I'm giving the AI agency and identity. "You are a world class developer" isn't just flattery—it's priming. It's setting expectations for the quality of output. And "read each and every document before beginning" forces the agent to engage with the documentation architecture we've built rather than jumping straight to code generation.

## The Iterative Development Process

Here's where patience becomes a virtue. The AI doesn't magically produce perfect code on the first try, and anyone who tells you otherwise is either lying or has extremely low standards.

![Development in progress](/images/1103003.png)

![More development progress](/images/1103004.png)

After the initial build completes, I don't immediately test it. Instead, I use the checklist we defined in our documentation to systematically verify every requirement:

```
Now go through the application and check each item in the checklist.md until all items have been completed if one is not completed then complete it.
```

![Checklist verification](/images/1103005.png)

This step is crucial. You want your testing to be comprehensive *before* you ever run the application locally. Debugging after the fact is reactive. Validating against a checklist before deployment is proactive. The difference matters.

I ended up typing "proceed" maybe thirty times as the AI worked through the checklist. It's tedious, but it's also exactly the kind of tedious work that AI agents excel at—systematically verifying dozens of small details that humans tend to skip because they're boring.

## The First Reality Check

Finally, it's time to see what we've actually built:

![Initial application appearance](/images/1103006.png)

Okay, so it's... basic. Very basic. But does it work? Let's click around and—nope. Only the landing page loads. Every other link leads to a 404.

This is the moment where a lot of people give up on AI-assisted development. They see one failure and conclude the whole approach is fundamentally broken. But here's what they're missing: **this is still faster and more efficient than writing everything by hand**.

When something breaks, you don't throw away the entire codebase and start over. You give the AI feedback and let it fix the issue:

```
The initial page loads, however all of the links lead to a 404. Please go through the application and ensure that all of the links operate as planned.
```

After a few iterations of copy-pasting error messages back into CLIne for debugging:

![Working About page](/images/1103007.png)

![Working Projects page](/images/1103008.png)

![Working Blog page](/images/1103009.png)

Everything works. The routing is functional. The styling is coherent. The components render correctly. And I didn't manually write a single line of code.

## The Finished Product and What Comes Next

The completed repository is available here: [Finished Repo](https://github.com/kliewerdaniel/next16blog.git)

But here's what most people miss about this workflow: **the boilerplate is just the beginning**. The real power of Document-Driven Development isn't in the initial build—it's in what comes after.

Now that I have a working, well-documented foundation, I can experiment freely. I can swap out the Three.js hero for a different animation library. I can redesign the blog cards. I can add new features like newsletter integration or comment sections. And because every modification is backed by comprehensive documentation, I never lose sight of the architectural decisions that make the application work.

This jumping-off point is my favorite part of AI-assisted development. Building the boilerplate can be largely automated. The artistry and skill emerge when you start iterating, experimenting, and pushing the boundaries of what the initial build made possible.

![Document Driven Development](/images/1103011.png)

## Why This Matters Beyond Just Building Blogs

I want to circle back to something I said at the beginning because I think it's easy to miss the forest for the trees when you're neck-deep in implementation details.

The developers who mock "vibe coding" aren't wrong to be skeptical of sloppy, thoughtless prompting that produces garbage code. What they're wrong about is assuming that all AI-assisted development falls into that category. What I've outlined here isn't lazy—it's actually more rigorous than most traditional development workflows.

Think about it: how many developers start a project by writing fourteen different documentation files covering everything from accessibility standards to AI ethics guidelines? How many teams have comprehensive checklists that get verified before deployment? How many codebases have security protocols and testing strategies documented *before* the first line of code is written?

The irony is that Document-Driven Development with AI agents can produce *more* professional, *more* maintainable, *more* thoughtfully designed software than the typical "move fast and break things" approach that dominates startup culture.

But it requires something that traditional developers and AI enthusiasts alike tend to resist: **doing the hard intellectual work upfront**. You can't just vibe your way through this. You have to think deeply about what you're building, articulate it clearly, anticipate edge cases, and create systems for maintaining quality over time.

The AI isn't replacing that cognitive work. It's amplifying it. It's taking your carefully constructed requirements and specifications and translating them into functional code faster than any human could. But garbage documentation produces garbage code, whether a human or an AI is doing the typing.

![Document Driven Development](/images/1103012.png)

## A Different Future

I'll be honest with you: I don't know if I'm right about all of this. I don't know if Document-Driven Development is the future of software engineering or just a temporary adaptation to a specific moment in AI capabilities. I don't know if the developers who hate what I'm doing will eventually come around or if this conflict will only deepen as AI tools become more capable.

What I do know is that software development has always been about abstraction—about finding ways to express complex ideas more simply, more clearly, more efficiently. Assembly language gave way to C. C gave way to Python. Command-line interfaces gave way to graphical user interfaces. Every generation of developers has had to grapple with tools that made their hard-won expertise less essential, and every generation has had to choose between clinging to the old ways or embracing the new.

I choose to embrace it. Not because I think the old ways were wrong, but because I'm more interested in what I can build than in proving I can build it the hard way.

And maybe that's what "vibe coding" should really mean: trusting that the tools are good enough, that your specifications are clear enough, and that the result matters more than the process. It's about having the confidence to define what you want and the humility to let something else help you build it.

I hope to write more about the next phase of this process soon—the part where we start customizing, experimenting, and turning this functional boilerplate into something genuinely unique. That's where the real art emerges. That's where "vibe coding" becomes something worth defending.

Until then, have fun building. And don't let anyone make you feel small for using the tools that work for you.