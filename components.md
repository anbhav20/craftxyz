# CraftXYZ
# Components Library

Version: 1.0

---

# Purpose

This document serves as the single source of truth for all reusable UI components in CraftXYZ.

Before creating any new component, the AI must check this document.

If an existing component can be reused, it MUST be reused.

Never duplicate UI.

---

# Component Categories

## Layout Components

AppLayout

MainLayout

AdminLayout

AuthLayout

Container

Section

PageWrapper

ResponsiveGrid

Stack

Flex

Spacer

Divider

Breadcrumb

PageHeader

SectionHeader

Footer

Navbar

Sidebar

Topbar

MobileMenu

---

# Button Components

Button

PrimaryButton

SecondaryButton

OutlineButton

GhostButton

DangerButton

SuccessButton

IconButton

FloatingButton

LoadingButton

BackButton

WishlistButton

CartButton

CheckoutButton

---

# Input Components

Input

Textarea

SearchInput

PasswordInput

NumberInput

PhoneInput

EmailInput

Checkbox

Radio

Select

MultiSelect

DatePicker

FileUploader

ImageUploader

ColorPicker

TagInput

---

# Card Components

Card

ProductCard

CategoryCard

ReviewCard

OrderCard

ProfileCard

AddressCard

StatCard

DashboardCard

CustomerCard

CartCard

WishlistCard

FeatureCard

TestimonialCard

BlogCard

EmptyCard

---

# Product Components

ProductGallery

ProductImage

ProductBadge

ProductPrice

ProductTitle

ProductRating

ProductDescription

ProductActions

ProductSpecs

ProductTabs

RelatedProducts

RecentlyViewed

QuantitySelector

StockIndicator

---

# Navigation Components

Navbar

Sidebar

Breadcrumb

Pagination

SearchBar

CategoryMenu

Dropdown

MegaMenu

NavigationItem

---

# Feedback Components

Toast

Alert

Snackbar

Modal

ConfirmationModal

DeleteModal

SuccessModal

ErrorModal

Loader

Spinner

Skeleton

ProgressBar

EmptyState

ErrorState

---

# Profile Components

Avatar

ProfileHeader

ProfileInfo

AddressList

OrderHistory

WishlistSection

SettingsSection

---

# Admin Components

AdminSidebar

AdminNavbar

DashboardCard

AnalyticsCard

DataTable

TableRow

TableHeader

ActionMenu

StatusBadge

ChartPlaceholder

ImageUploader

ProductForm

OrderTable

CustomerTable

---

# Ecommerce Components

CartSummary

OrderSummary

CheckoutForm

CouponBox

ShippingCard

PaymentCard

InvoiceCard

ReviewForm

RatingStars

---

# Common Components

Logo

Brand

Chip

Badge

Tag

Tooltip

Accordion

Tabs

Carousel

ImageCard

Hero

Newsletter

FAQ

SocialLinks

ThemeSwitcher

LanguageSelector

---

# Component Rules

Every component must:

- Be reusable.
- Accept props.
- Avoid hardcoded data.
- Be responsive.
- Follow the Design System.
- Be documented.
- Support future backend integration.

---

# Naming Convention

Component folders:

ProductCard/

ProductCard.jsx

index.js

Optional:

ProductCardSkeleton.jsx

ProductCard.module.css (only if CSS Modules are ever introduced)

---

# Props Guidelines

Components should receive data through props whenever possible.

Avoid relying on global state unless necessary.

Prefer controlled components for forms.

---

# Reuse Policy

Before creating a new component:

1. Search existing components.
2. Reuse if suitable.
3. Extend with props if needed.
4. Create a new component only when no existing one fits.

---

# Definition of Done

A reusable component is complete when:

- Responsive
- Accessible
- Reusable
- Documented
- Backend-ready
- Matches Design.md
- Matches Rules.md