# CraftXYZ
# Development Rules

Version 2.0

---

# Coding Style

Write clean code.

Write readable code.

Avoid unnecessary complexity.

Always choose simplicity.

---

# Component Rules

Every component must be a single .jsx file.

Correct

components/

Navbar.jsx

Hero.jsx

Footer.jsx

ProductCard.jsx

CategoryCard.jsx

Button.jsx

Wrong

components/

Navbar/

index.js

Navbar.jsx

Do NOT create folders for every component.

Do NOT create index.js.

---

# Pages

Pages should only combine components.

Wrong

Huge Home.jsx file with 600 lines.

Correct

<Home>

↓

Navbar

↓

Hero

↓

Categories

↓

Products

↓

Footer

---

# Component Size

Maximum

200 lines.

Split large components into smaller ones.

---

# Reusability

Never duplicate code.

If UI repeats twice

↓

Create Component

Example

Button

Card

SectionHeader

Input

Modal

Loader

---

# Imports

Always import directly.

Correct

import Hero from "../components/Hero";

Wrong

import Hero from "../components/Hero/index";

---

# Styling

Tailwind CSS only.

Never use Bootstrap.

Never use Material UI.

Never use CSS frameworks.

---

# React

Use

Functional Components

Hooks

Props

Context API

Never use

Class Components

---

# Folder Rules

Keep folders simple.

Good

components/

pages/

assets/

data/

hooks/

utils/

Bad

components/common/cards/product/ui/base/layout/shared/

Avoid deep nesting.

---

# File Naming

PascalCase

Navbar.jsx

Hero.jsx

ProductCard.jsx

Home.jsx

Cart.jsx

Profile.jsx

---

# Dummy Data

All dummy data belongs inside

src/data/

Never hardcode product information inside components.

---

# Animation

Framer Motion only.

Animations should be subtle.

Hover

Fade

Slide

Scale

---

# Backend Ready

Never hardcode API calls.

Prepare components to later receive data from

Express

MongoDB

Firebase

---

# AI Rules

Whenever creating code

Always check

1 Existing components

2 Existing pages

3 Existing data

Reuse first.

Create new only if necessary.

---

# Final Goal

Every generated code should feel like it was written by one developer.

Consistent.

Clean.

Simple.

Professional.