# JARVIS Design System

A futuristic, minimal design system for the JARVIS AI chatbot — inspired by Iron Man HUD interfaces. Built on **Next.js**, **Tailwind CSS v4**, and **shadcn/ui**.

---

## Philosophy

- **Futuristic but minimal** — clean dark surfaces with purposeful accent glows
- **Premium tech feel** — Orbitron headings, Rajdhani body text, Arc Reactor palette
- **shadcn-first** — use shadcn components as-is; only customize colors and add gap-filling custom components

---

## Color Palette (Arc Reactor Theme)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0D0D0D` | Primary background |
| `--card` / Surface | `#1A1A1A` | Cards, panels, inputs |
| `--primary` | `#00B4FF` | Primary accent (Arc Reactor blue) |
| `--secondary` | `#FFD700` | Secondary accent (gold) |
| `--foreground` | `#F5F5F5` | Primary text |
| `--muted-foreground` | `#888888` | Secondary text |
| `--border` | `rgba(0, 180, 255, 0.15)` | Subtle blue-tinted borders |
| `--destructive` | `#FF4444` | Error / destructive actions |
| `--ring` | `#00B4FF` | Focus rings |

Glow shadow: `0 0 30px rgba(0, 180, 255, 0.1)` — available as the `glow-accent` utility class.

All shadcn CSS variables are overridden in `app/globals.css`.

---

## Typography

### Headings — Orbitron (`font-heading`)

Applied automatically to `h1`–`h4` via base styles:

| Element | Classes |
|---------|---------|
| h1 | `text-4xl md:text-5xl font-bold tracking-wider uppercase` |
| h2 | `text-3xl md:text-4xl font-semibold tracking-wide uppercase` |
| h3 | `text-2xl font-semibold tracking-wide uppercase` |
| h4 | `text-xl font-medium tracking-wide` |

### Body — Rajdhani (`font-sans`, default)

| Style | Classes |
|-------|---------|
| Body large | `text-lg leading-relaxed` |
| Body base | `text-base leading-relaxed` |
| Body small | `text-sm leading-relaxed` |
| Caption | `text-xs tracking-wide uppercase` |

---

## Spacing

Use Tailwind's default spacing scale and shadcn component padding/margin patterns. No custom spacing variables.

---

## shadcn/ui Components

Installed and themed (colors only — structure and variants unchanged):

- `Button` — `@/components/ui/button`
- `Input` — `@/components/ui/input`
- `Card` — `@/components/ui/card`
- `Dialog` — `@/components/ui/dialog`
- `ScrollArea` — `@/components/ui/scroll-area`
- `Avatar` — `@/components/ui/avatar`

Add more components with:

```bash
npx shadcn@latest add [component-name]
```

---

## Custom Components

Located in `components/custom/` — only where shadcn has no equivalent:

| Component | File | Description |
|-----------|------|-------------|
| `JarvisLogo` | `jarvis-logo.tsx` | Arc Reactor SVG icon with `pulse-glow` animation |
| `TypingIndicator` | `typing-indicator.tsx` | Three animated dots for AI typing state |
| `StatusDot` | `status-dot.tsx` | Blinking status indicator (`online`, `offline`, `busy`, `typing`) |
| `GlowEffect` | `glow-effect.tsx` | Wrapper applying accent glow shadow |
| `MessageBubble` | `message-bubble.tsx` | Chat bubble for `user`, `assistant`, and `system` roles |

Import from the barrel:

```tsx
import { JarvisLogo, TypingIndicator, StatusDot, GlowEffect, MessageBubble } from "@/components/custom";
```

---

## Animations

Defined in `app/globals.css` and available as Tailwind animation utilities:

| Keyframe | Utility | Usage |
|----------|---------|-------|
| `pulse-glow` | `animate-pulse-glow` | Jarvis logo breathing glow |
| `typing-dot` | `animate-typing-dot` | Typing indicator dots |
| `slide-up` | `animate-slide-up` | New message entrance |
| `blink` | `animate-blink` | Status dot pulse |
| `shimmer` | `shimmer` (utility class) | Loading skeleton shimmer |

---

## Utility Classes

| Class | Effect |
|-------|--------|
| `glow-accent` | Standard Arc Reactor glow shadow |
| `glow-accent-strong` | Stronger glow shadow |
| `text-gradient-primary` | Blue-to-gold gradient text |
| `shimmer` | Animated loading shimmer overlay |

---

## Tailwind Configuration

This project uses **Tailwind CSS v4** with CSS-first configuration in `app/globals.css` (`@theme inline`). A companion `tailwind.config.js` mirrors the theme for reference and tooling compatibility.

Custom theme extensions:

- Colors: `surface`, `accent-blue`, `accent-gold`, `text-secondary`
- Fonts: `font-heading` (Orbitron), `font-sans` (Rajdhani)
- Animations: `pulse-glow`, `typing-dot`, `slide-up`, `blink`, `shimmer`
- Gradient: `bg-gradient-primary`

---

## File Structure

```
app/
  layout.tsx          # Fonts (Orbitron + Rajdhani), dark mode class
  globals.css         # shadcn theme overrides + animations + utilities
  page.tsx            # Design system demo page
components/
  ui/                 # shadcn components (do not modify structure)
  custom/             # JARVIS-specific components
lib/
  utils.ts            # cn() utility
types/
  index.ts            # Shared TypeScript types
tailwind.config.js    # Theme reference (Tailwind v4 uses globals.css)
components.json       # shadcn configuration
DESIGN_SYSTEM.md      # This file
```

---

## Usage Guidelines

1. **Always use shadcn components** for buttons, inputs, cards, dialogs, etc.
2. **Only override colors** — never change shadcn padding, radius, or variant structure.
3. **Use `cn()`** from `@/lib/utils` for conditional class merging.
4. **Use custom components** only for chat-specific UI (bubbles, typing, status).
5. **Apply `dark` class** on `<html>` (already set in layout) for shadcn dark mode tokens.

---

## Running the Demo

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the design system showcase page.
