# Development Guidelines

## Code Quality Standards

### TypeScript Usage
- **Strict Type Safety**: All components use comprehensive TypeScript interfaces and types
- **Type Definitions**: Centralized type definitions in `types.ts` for consistency
- **Interface Patterns**: Complex interfaces like `DashboardData`, `EnrichedErrorReport`, `MachineInfo` define data contracts
- **Generic Types**: Use of generic types for reusable components and functions

### Import Organization
- **Grouped Imports**: Imports organized in logical groups (React, types, components, icons)
- **Relative Imports**: Consistent use of relative imports with `../` for parent directories
- **Named Imports**: Destructured imports for better tree-shaking and clarity

### Component Structure
- **Functional Components**: All components use React functional components with hooks
- **Props Interfaces**: Every component has a dedicated props interface
- **Default Exports**: Components exported as default with descriptive names

## Architectural Patterns

### State Management
- **useState Hook**: Local component state managed with React useState
- **useEffect Hook**: Side effects and lifecycle management with useEffect
- **useMemo Hook**: Performance optimization with memoized calculations
- **useCallback Hook**: Memoized event handlers to prevent unnecessary re-renders
- **Custom Hooks**: Reusable logic extracted into custom hooks (e.g., `useTranslation`)

### Data Flow Patterns
- **Props Drilling**: Data passed down through component hierarchy via props
- **Event Callbacks**: Parent-child communication through callback functions
- **Service Layer**: Centralized data operations in `dataService.ts`
- **Mock Data Generation**: Comprehensive mock data generation for development

### Component Composition
- **Container Components**: Main components handle state and business logic
- **Presentation Components**: Smaller components focus on UI rendering
- **Modal Components**: Reusable modal pattern for overlays and forms
- **Inline Components**: Complex components define sub-components inline when needed

## UI/UX Standards

### Styling Approach
- **Tailwind CSS**: Utility-first CSS framework for consistent styling
- **Dark Mode Support**: Comprehensive dark/light theme implementation
- **Responsive Design**: Mobile-first responsive design with breakpoint classes
- **Color Consistency**: Consistent color palette using Tailwind color classes

### Interactive Elements
- **Hover States**: Consistent hover effects using `hover:` prefixes
- **Focus States**: Accessibility-focused keyboard navigation with `focus:` classes
- **Transition Effects**: Smooth transitions using `transition-` classes
- **Loading States**: Loading indicators and skeleton states for async operations

### Layout Patterns
- **Grid Layouts**: CSS Grid for complex layouts (`grid-cols-1 lg:grid-cols-2`)
- **Flexbox**: Flexbox for component alignment and distribution
- **Spacing System**: Consistent spacing using Tailwind's spacing scale
- **Container Patterns**: Consistent container styling with padding and margins

## Data Handling

### API Integration
- **Async/Await**: Modern async patterns for data fetching
- **Error Handling**: Comprehensive error handling with try-catch blocks
- **Loading States**: Loading indicators during data operations
- **Data Transformation**: Data enrichment and transformation in service layer

### Form Management
- **Controlled Components**: Form inputs managed through React state
- **Validation**: Client-side validation with error messaging
- **Form Submission**: Consistent form submission patterns with preventDefault
- **Reset Functionality**: Form reset capabilities after successful submission

### Data Structures
- **Immutable Updates**: State updates using spread operators and immutable patterns
- **Array Operations**: Functional array methods (map, filter, reduce) for data manipulation
- **Object Merging**: Consistent object merging patterns for state updates

## Performance Optimization

### React Optimization
- **useMemo**: Expensive calculations memoized to prevent unnecessary recalculations
- **useCallback**: Event handlers memoized to prevent child re-renders
- **Conditional Rendering**: Efficient conditional rendering patterns
- **Key Props**: Proper key props for list rendering optimization

### Bundle Optimization
- **Tree Shaking**: Named imports to enable tree shaking
- **Code Splitting**: Dynamic imports for large components (potential improvement)
- **Asset Optimization**: Optimized image loading and caching strategies

## Internationalization

### Translation System
- **Context Pattern**: Translation context for global language state
- **Key-Value Structure**: Structured translation keys in `locales.ts`
- **Dynamic Content**: Support for dynamic content in translations
- **Fallback Handling**: Graceful fallback for missing translations

### Language Support
- **Multi-language**: English and Vietnamese language support
- **Consistent Keys**: Consistent translation key naming conventions
- **Contextual Translations**: Context-aware translations for different UI sections

## Testing and Quality Assurance

### Code Organization
- **Single Responsibility**: Components follow single responsibility principle
- **Separation of Concerns**: Clear separation between UI, business logic, and data
- **Reusable Components**: Common UI patterns extracted into reusable components
- **Consistent Naming**: Descriptive and consistent naming conventions

### Error Handling
- **Graceful Degradation**: UI gracefully handles missing or invalid data
- **User Feedback**: Clear error messages and user feedback
- **Fallback States**: Fallback UI states for error conditions
- **Validation Messages**: Comprehensive form validation with user-friendly messages

## Development Workflow

### File Organization
- **Feature-based Structure**: Components organized by feature/functionality
- **Shared Components**: Common components in dedicated directories
- **Type Definitions**: Centralized type definitions for consistency
- **Service Layer**: Business logic separated into service files

### Code Consistency
- **Formatting**: Consistent code formatting and indentation
- **Comment Standards**: Meaningful comments for complex logic
- **Variable Naming**: Descriptive variable and function names
- **Component Naming**: PascalCase for components, camelCase for functions