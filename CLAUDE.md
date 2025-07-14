# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Architecture Overview

This is a Next.js 15 application using the App Router with TypeScript and Tailwind CSS. The project is configured with shadcn/ui components and follows modern React patterns.

### Key Structure

- **App Router**: Uses Next.js App Router architecture with `app/` directory
- **Styling**: Tailwind CSS with CSS variables for theming, configured for both light and dark modes
- **Component System**: Set up for shadcn/ui components with aliases configured in `components.json`
- **Fonts**: Uses Geist font family (sans and mono variants) via `next/font/google`

### Path Aliases

The project uses TypeScript path mapping configured in both `tsconfig.json` and `components.json`:
- `@/*` maps to the root directory
- `@/components` for components
- `@/lib` for utilities
- `@/hooks` for custom hooks
- `@/components/ui` for UI components

### Utility Functions

- `lib/utils.ts` contains the `cn()` function for combining Tailwind classes using `clsx` and `tailwind-merge`

## Code Conventions

- TypeScript strict mode enabled
- ESLint configured with Next.js and TypeScript rules
- Components use functional syntax with proper TypeScript typing
- Tailwind CSS with CSS-in-JS patterns for dynamic styling
- shadcn/ui component library integration ready
- Always use descriptive variable names