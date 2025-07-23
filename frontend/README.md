# Frontend (Quasar/Vue.js)

## Overview

This is the frontend client for SignBank, built with Quasar (Vue.js). It provides the user interface for searching, viewing, and managing sign language glossaries.

---

## 🚀 Development Setup

Through docker compose in main folder

---

## 📁 Project Structure

### Pages (`src/pages/`)
Each file in this directory represents a main route/page in the application:
- `SearchPage.vue` – Main search interface
- `GlossPage.vue` – Gloss detail view
- `UserManagementPage.vue` – Admin user management
- `MyRequestsPage.vue` – User’s requests overview
- `CreateGlossRequest.vue` – Form to request a new gloss
- `EditGlossRequest.vue` – Edit an existing gloss request
- `ConfirmRequestsPage.vue` – Confirm pending requests
- `ReviewGlossRequest.vue` – Review a gloss request
- `ViewRequestGlossPage.vue` – View details of a request
- `ErrorNotFound.vue` – 404 error page

### Components (`src/components/`)
Reusable UI building blocks, organized by feature or shared use:

- **GlossDetail/**
  - `GlossDetailComponent.vue` – Main wrapper for gloss details
  - `components/`
    - **DefinitionsComponent/**
      - `DefinitionsComponent.vue`, `CreateDefinitionDialog.vue`, `DefinitionCard.vue`, `DefinitionCardDesktop.vue`, `DefinitionCardMobile.vue`, `DefinitionTranslationsComponent.vue`
    - **ExamplesComponent/**
      - `ExamplesComponent.vue`, `ExampleCardDesktop.vue`, `ExampleCardMobile.vue`
    - Other gloss-related components:  
      `GlossHeader.vue`, `GlossSearch.vue`, `GlossVideoComponent.vue`, `LanguageSelector.vue`, `MainContent.vue`, `MinimalPairCard.vue`, `MinimalPairsList.vue`, `MoreContentComponent.vue`, `RelatedGlossCard.vue`, `RelatedGlosses.vue`, `RelatedGlossesList.vue`, `SenseSelector.vue`, `SenseTranslationsComponent.vue`, `SignFonologyComponent.vue`, `VideosComponent.vue`, `ExampleTranslationsComponent.vue`

- **Search/**
  - `SearchResults.vue`, `SearchFilters.vue`, `types.ts`
  - `components/`
    - `SearchInput.vue`, `ResultCard.vue`, `SearchPhonologyFilters.vue`, `FilterInputs.vue`, `FilterCategories.vue`

- **Shared/**
  - `EditableModule.vue`, `PhonologyFilters.vue`

- **UserManagement/**
  - `UsersTable.vue`, `CreateUserDialog.vue`, `ChangePasswordDialog.vue`, `DeleteUserDialog.vue`, `index.ts`

- Other global components:
  - `HeaderComponent.vue`, `LoadingComponent.vue`, `loginComponent.vue`, `UploadVideoComponent.vue`, `UploadVideoPopup.vue`, `VideoPlayer.vue`, `VideoPlayerPopup.vue`

---

## 🌐 Communication

- Uses Axios to communicate with the backend API.
- Real-time search via Typesense.

---

## 📚 Further Documentation

See the main [README.md](../README.md) for full-stack setup, deployment, and architecture details.
