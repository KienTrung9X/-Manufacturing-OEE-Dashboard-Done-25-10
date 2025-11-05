# Project Structure

## Directory Organization

### `/components/` - React Components
Core UI components organized by functionality:
- **Dashboard Components**: `BenchmarkDashboard.tsx`, `ChecklistDashboard.tsx`, `MaintenanceDashboard.tsx`
- **Chart Components**: `BoxplotChart.tsx`, `HeatmapChart.tsx`, `ParetoChart.tsx`, `StackedBarChart.tsx`, `TrendChart.tsx`
- **Modal Components**: `DataEntryModal.tsx`, `DefectDetailsModal.tsx`, `MachineEditModal.tsx`, `MaintenanceOrderModal.tsx`
- **Data Display**: `DefectLogTable.tsx`, `ProductionLogTable.tsx`, `ErrorLogTable.tsx`, `Top5Table.tsx`
- **Layout Components**: `ShopFloorLayout.tsx`, `HamburgerMenu.tsx`, `FilterBar.tsx`
- **KPI Components**: `KpiCard.tsx`, `KpiProgress.tsx`, `OeeGauge.tsx`

### `/services/` - Business Logic
- `dataService.ts` - Data access layer and API integration
- `SimpleBarChart.tsx` - Chart service component

### `/i18n/` - Internationalization
- `locales.ts` - Translation definitions and language resources
- `LanguageContext.tsx` - React context for language management

### Root Level Files
- `App.tsx` - Main application component
- `index.tsx` - Application entry point
- `types.ts` - TypeScript type definitions
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration

## Core Components Relationships

### Main Application Flow
1. `index.tsx` → `App.tsx` (Root component)
2. `App.tsx` integrates dashboard components and layout
3. Dashboard components consume data from `dataService.ts`
4. Modal components handle user interactions and data entry
5. Chart components visualize manufacturing metrics

### Data Architecture
- **Data Service Layer**: Centralized data management in `dataService.ts`
- **Type Safety**: Comprehensive TypeScript definitions in `types.ts`
- **State Management**: React hooks and context for component state
- **Internationalization**: Context-based language switching

## Architectural Patterns
- **Component-Based Architecture**: Modular React components with single responsibilities
- **Service Layer Pattern**: Separation of data logic from UI components
- **Context Pattern**: Used for cross-cutting concerns like internationalization
- **Modal Pattern**: Consistent modal-based user interactions
- **Chart Abstraction**: Reusable chart components built on Recharts library