# Hướng dẫn tối ưu hiệu suất App

## Vấn đề hiện tại
App khởi động chậm do:
- Component App.tsx quá lớn (1000+ dòng)
- generateMockData() tạo quá nhiều dữ liệu
- Không có code splitting
- Enrichment data nặng

## Giải pháp nhanh (Áp dụng ngay)

### 1. Giảm dữ liệu mock ban đầu
```typescript
// Trong dataService.ts, dòng ~300
// THAY ĐỔI:
generateMockData('2025-10-26', '2025-10-26'); 
// Chỉ tạo 1 ngày thay vì nhiều ngày
```

### 2. Lazy load các tab
```typescript
// Trong App.tsx, thêm lazy imports
import { lazy, Suspense } from 'react';

const MaintenanceDashboard = lazy(() => import('./MaintenanceDashboard'));
const BenchmarkDashboard = lazy(() => import('./BenchmarkDashboard'));
const AiAnalysis = lazy(() => import('./AiAnalysis'));

// Wrap components với Suspense
<Suspense fallback={<Loader2 className="animate-spin" />}>
  <MaintenanceDashboard ... />
</Suspense>
```

### 3. Tối ưu generateMockData
```typescript
// Giảm số lượng records
const generateMockData = (startDate: string, endDate: string) => {
    // Chỉ tạo data cho máy active
    const activeMachines = machineInfoData.filter(m => m.STATUS === 'active');
    
    // Giảm số ca làm việc nếu không cần thiết
    const shifts = [shiftsData[0]]; // Chỉ ca A
    
    // ... rest of code
};
```

### 4. Memoize enrichment functions
```typescript
// Cache enriched data
const enrichedDataCache = new Map();

export const getDashboardData = async (...) => {
    const cacheKey = `${startDate}-${endDate}-${area}-${shift}`;
    if (enrichedDataCache.has(cacheKey)) {
        return enrichedDataCache.get(cacheKey);
    }
    
    const result = await computeData();
    enrichedDataCache.set(cacheKey, result);
    return result;
};
```

## Giải pháp dài hạn

### 1. Tách App.tsx thành nhiều components nhỏ
- `AppLayout.tsx` - Layout chính
- `TabNavigation.tsx` - Navigation logic
- `ModalManager.tsx` - Quản lý modals

### 2. Sử dụng React.memo cho components nặng
```typescript
export default React.memo(ProductionLogTable);
```

### 3. Virtual scrolling cho tables lớn
- Sử dụng `react-window` hoặc `react-virtual`

### 4. Web Workers cho data processing
- Chuyển generateMockData sang Web Worker

### 5. IndexedDB thay vì in-memory
- Lưu mock data vào IndexedDB
- Chỉ load khi cần

## Đo lường hiệu suất

```typescript
// Thêm vào App.tsx
useEffect(() => {
    const start = performance.now();
    fetchData().then(() => {
        console.log(`Data loaded in ${performance.now() - start}ms`);
    });
}, []);
```

## Kết quả mong đợi
- Giảm thời gian khởi động từ 3-5s xuống < 1s
- Giảm memory usage 50%
- Smooth navigation giữa các tabs
