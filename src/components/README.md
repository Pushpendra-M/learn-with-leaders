# Components Structure

This directory contains all reusable React components organized by category.

## Folder Structure

```
components/
├── auth/              # Authentication-related components
│   ├── AuthButton.tsx
│   ├── AuthHeader.tsx
│   ├── AuthLayout.tsx
│   ├── AuthLink.tsx
│   ├── AuthLogo.tsx
│   ├── ErrorMessage.tsx
│   ├── FormInput.tsx
│   ├── SuccessMessage.tsx
│   └── index.ts
│
├── common/            # Common/shared components
│   ├── Loading.tsx
│   ├── MultiSelectAutocomplete.tsx
│   └── index.ts
│
├── modals/            # Modal components
│   ├── CreateAssessmentModal.tsx
│   ├── CreateProgramModal.tsx
│   ├── EditProgramModal.tsx
│   └── index.ts
│
├── routes/            # Route protection components
│   ├── AdminOnlyRoute.tsx
│   ├── ProtectedRoute.tsx
│   └── index.ts
│
├── sections/          # Section components
│   ├── ApplicationsReviewSection.tsx
│   ├── ProgramSubmissionsSection.tsx
│   └── index.ts
│
└── index.ts           # Main export file (exports all subfolders)
```

## Import Patterns

### Direct folder imports (recommended)
```typescript
import Loading from '@/components/common/Loading'
import ProtectedRoute from '@/components/routes/ProtectedRoute'
import CreateProgramModal from '@/components/modals/CreateProgramModal'
import ApplicationsReviewSection from '@/components/sections/ApplicationsReviewSection'
```

### Using subfolder index exports
```typescript
import { Loading, MultiSelectAutocomplete } from '@/components/common'
import { ProtectedRoute, AdminOnlyRoute } from '@/components/routes'
import { CreateProgramModal, EditProgramModal } from '@/components/modals'
import { ApplicationsReviewSection } from '@/components/sections'
```

### Using main index (all components)
```typescript
import { Loading, ProtectedRoute, CreateProgramModal } from '@/components'
```

## Component Categories

### Auth Components (`auth/`)
Components used in authentication flows (signin, signup).

### Common Components (`common/`)
Reusable components used across the application.

### Modal Components (`modals/`)
All modal/dialog components.

### Route Components (`routes/`)
Route protection and navigation components.

### Section Components (`sections/`)
Large section components used in pages.

## Adding New Components

1. **Place component in appropriate subfolder** based on its purpose
2. **Export from subfolder's `index.ts`** for named exports
3. **Import directly from folder path** (e.g., `@/components/common/ComponentName`)
4. **Main `index.ts`** automatically exports all subfolders via `export *`

## Notes

- Root-level re-export files maintain backward compatibility with existing flat imports
- Each subfolder has its own `index.ts` for organized exports
- Main `index.ts` re-exports all subfolders for convenience
- All components use TypeScript and follow consistent naming conventions

