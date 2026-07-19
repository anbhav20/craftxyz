# CraftXYZ
# Architecture

Version: 2.0

---

# Project Goal

CraftXYZ is a modern ecommerce website for selling premium 3D printed products.

The project follows a simple, scalable architecture.

Priority:

- Readable code
- Easy navigation
- Reusable components
- Beginner friendly
- Backend ready

---

# Tech Stack

Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- React Router DOM
- React Icons
- Framer Motion

Future Backend

- Node.js
- Express.js
- MongoDB
- Firebase Authentication (Google OAuth)
- Cloudinary
- Razorpay
- Nodemailer

---

# Folder Structure

src/

│

├── assets/
│   ├── images/
│   ├── icons/
│   └── logo/
│
├── components/
│   Navbar.jsx
│   Hero.jsx
│   Button.jsx
│   Footer.jsx
│   ProductCard.jsx
│   CategoryCard.jsx
│   SectionHeader.jsx
│   SearchBar.jsx
│   Loader.jsx
│
├── pages/
│   Home.jsx
│   Products.jsx
│   ProductDetails.jsx
│   Categories.jsx
│   Cart.jsx
│   Wishlist.jsx
│   Checkout.jsx
│   Orders.jsx
│   Profile.jsx
│   Settings.jsx
│   Search.jsx
│   Login.jsx
│   Signup.jsx
│
├── admin/
│   Dashboard.jsx
│   Products.jsx
│   AddProduct.jsx
│   EditProduct.jsx
│   Orders.jsx
│   Customers.jsx
│   Analytics.jsx
│   Settings.jsx
│
├── data/
│   products.js
│   categories.js
│   reviews.js
│
├── hooks/
│
├── context/
│
├── services/
│
├── utils/
│
├── App.jsx
├── main.jsx

---

# Import Strategy

Always use direct imports.

Example

import Navbar from "../components/Navbar";

import Hero from "../components/Hero";

Never create index.js for components.

Never create component folders unless requested.

---

# Component Philosophy

One Component = One File

Example

Navbar.jsx

Hero.jsx

Footer.jsx

ProductCard.jsx

CategoryCard.jsx

Button.jsx

Simple.

Readable.

Reusable.

---

# Page Philosophy

Each page should only assemble components.

Example

Home

↓

Navbar

↓

Hero

↓

Categories

↓

Featured Products

↓

Newsletter

↓

Footer

Pages should never contain large UI.

Move repeated UI into components.

---

# State Management

V1

useState

useEffect

Context API

Future

Redux Toolkit only if project becomes large.

---

# Styling

Tailwind CSS

Component based

Responsive

Dark mode ready

---

# Future Backend

Every component should be designed so data can later come from

Express API

MongoDB

Firebase Authentication

Cloudinary

without changing UI.