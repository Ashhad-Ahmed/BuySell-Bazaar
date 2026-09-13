# BuySell Bazaar

A full-stack mobile app for local classifieds — buying and selling — with a React Native client (Android and iOS from one codebase) backed by Firebase and a REST API.

[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-152F54)](#)
[![React Native](https://img.shields.io/badge/React%20Native-0.79-1E5AA8)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-1E5AA8)](#)
[![License](https://img.shields.io/badge/license-Proprietary-lightgrey)](#)

---

## Table of Contents

- [Overview](#overview)
- [Core Concept](#core-concept)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Design](#design)

---

## Overview

BuySell Bazaar is a full-stack mobile marketplace for local buying and selling. Instead of treating listings as one-directional (sellers post, buyers search and hope), the app gives both sides of a transaction equal standing — a buyer can post what they're looking for just as easily as a seller can list what they have.

The app is built around trust as much as convenience: listing photos for items up for sale are captured live through the in-app camera rather than pulled from a gallery, locations are verified before a listing goes live, and sellers can be filtered by rating — all aimed at cutting down on the fake listings and wasted trips that plague open marketplace groups.

## Core Concept

The marketplace is built on two symmetric listing types:

| Type | Meaning | Who posts it |
|---|---|---|
| **Ad** | "I'm selling this." | Sellers list an item for sale, with photos and price. |
| **Demand** | "I'm looking for this." | Buyers post what they want, even before anyone is selling it. |

This lets a transaction start from either direction — a buyer isn't limited to searching and waiting, and a seller can browse open demands to find a buyer directly.

## Features

- **Onboarding & authentication** — guided intro, OTP-verified signup, login, password reset
- **Browse & discover** — category rails, featured ads, keyword search, multi-filter results (including filtering by seller rating)
- **Post an Ad or a Demand** — dedicated flows for each; Ad photos are camera-only to prevent stock or stolen images
- **Listing details** — full detail views for both Ads and Demands, with owner and location context
- **Location verification** — precise location is requested before an Ad is published
- **Real-time chat** — a dedicated, per-listing conversation between buyer and seller, with unread tracking
- **Notifications** — push notifications (Firebase Cloud Messaging) and local notifications (Notifee)
- **Favorites** — save listings to revisit later
- **Account management** — profile, permissions, and settings
- **Featured placement** — sellers can request featured placement for an ad

## Tech Stack

| Layer | Technology |
|---|---|
| App framework | React Native 0.79, React 19, TypeScript |
| Navigation | React Navigation v7 (native stack + bottom tabs), Reanimated, Gesture Handler |
| Server state | TanStack Query, Axios |
| Client state | Zustand, AsyncStorage |
| Backend services | Firebase — Authentication, Firestore, Cloud Messaging, Crashlytics, Analytics, Storage |
| Media & device | react-native-image-picker, react-native-image-crop-picker, react-native-maps, react-native-geolocation-service |
| UI | Linear Gradient, Fast Image, SVG, Bottom Sheet, Modal, Dropdown Picker |
| Tooling | ESLint, Prettier, Jest |

## Project Structure

```
src/
├── screens/          # One folder per app screen (Auth, Home, Chats, PostAdAndDemand, ...)
├── components/        # Shared and screen-specific UI building blocks
├── services/
│   ├── hooks/          # Auth, master data, and chat hooks
│   └── chat/            # Firestore-backed messaging
├── config/
│   ├── navigations/     # AppNavigator, AuthStack, MainTab
│   └── themes/            # Colors, typography, fonts
├── constants/           # App-wide design tokens
├── data/                  # Static fixtures (categories, onboarding content)
└── images/                 # Logo, splash, and banner assets

android/                # Gradle project
ios/                    # Xcode project, CocoaPods
```

## Getting Started

> Make sure you've completed the React Native [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide first.

### 1. Install dependencies

```sh
yarn install
```

### 2. iOS only — install CocoaPods dependencies

```sh
bundle install
bundle exec pod install
```

### 3. Start Metro

```sh
yarn start
```

### 4. Run the app

```sh
yarn android
# or
yarn ios
```

## Available Scripts

| Script | Description |
|---|---|
| `yarn start` | Starts the Metro bundler |
| `yarn android` | Builds and runs the Android app |
| `yarn ios` | Builds and runs the iOS app |
| `yarn lint` | Runs ESLint |
| `yarn test` | Runs the Jest test suite |
