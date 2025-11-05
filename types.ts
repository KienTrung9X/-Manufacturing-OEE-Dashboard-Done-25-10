// types.ts

// --- MASTER DATA TABLES ---

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'Admin' | 'Supervisor' | 'Operator' | 'QA' | 'Maintenance';
}

export interface Shift {
  id: number;
  code: 'A' | 'B' | 'C';
  name: string;
}

export interface MachineInfo {
  id: number;
  MACHINE_ID: string; // Keep original for display consistency
  MACHINE_NAME: string;
  LINE_ID: string;
  IDEAL_CYCLE_TIME: number; // minutes per unit
  DESIGN_SPEED: number; // units per minute
  STATUS: 'active' | 'inactive';
  x?: number; // X-coordinate percentage for shop floor layout
  y?: number; // Y-coordinate percentage for shop floor layout
}

export interface DefectType {
  id: number;
  code: string;
  name: string;
}

export interface DefectCause {
  id: number;
  category: 'Man' | 'Machine' | 'Material' | 'Method' | 'Environment';
  detail: string | null;
}

// --- CORE DATA TABLES ---

export interface ProductionDaily {
  Prod_ID: number;
  COMP_DAY: string; // YYYY-MM-DD
  LINE_ID: string;
  MACHINE_ID: string;
  ITEM_CODE: string;
  ACT_PRO_QTY: number;
  DEFECT_QTY: number;
  RUN_TIME_MIN: number;
  DOWNTIME_MIN: number;
  IDEAL_CYCLE_TIME: number; // minutes per unit
  OEE: number;
  shift_id: number;
  SHIFT: 'A' | 'B' | 'C'; // Keep for display consistency
  STATUS?: 'active' | 'inactive';
  availability?: number;
  performance?: number;
  quality?: number;
}

export interface DowntimeRecord {
  Downtime_ID: number;
  COMP_DAY: string; // YYYY-MM-DD
  MACHINE_ID: string;
  DOWNTIME_REASON: string;
  DOWNTIME_MIN: number;
  START_TIME: string; // HH:MM
  END_TIME: string; // HH:MM
}

// --- NEW UNIFIED ERROR REPORTING MODULE ---

export type ErrorReportStatus = 'Reported' | 'In Progress' | 'Fixed' | 'Not Machine Issue' | 'Closed';
export type ErrorSeverity = 'Low' | 'Medium' | 'High';
export type CauseCategory = 'Man' | 'Machine' | 'Material' | 'Method' | 'Environment';

export interface ErrorReport {
  id: number;
  reportNo: string; // e.g., ERR20251026-001
  machine_id: number;
  shift_id: number;
  operator_id: number;
  report_time: string; // ISO Date String
  defect_type: string;
  defect_description: string;
  severity: ErrorSeverity;
  status: ErrorReportStatus;
  root_cause: string | null;
  cause_category: CauseCategory | null;
  action_taken: string | null;
  technician_id: number | null;
  fix_time: string | null;
  verify_by: number | null;
  verify_time: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  linked_maintenance_order_id: number | null;
  linked_defect_id: number | null;
}

export interface ErrorImage {
  id: number;
  error_id: number;
  uploaded_by: number;
  role: 'Operator' | 'Maintenance';
  image_url: string;
  description: string | null;
  uploaded_at: string;
}

export interface ErrorHistory {
  id: number;
  error_id: number;
  changed_by: number;
  old_status: ErrorReportStatus | null;
  new_status: ErrorReportStatus;
  note: string | null;
  changed_at: string;
}

// --- MAINTENANCE & SPARE PARTS (Supporting role) ---
export interface SparePart {
    id: number;
    part_code: string;
    name: string;
    location: string;
    available: number; // Qty in main warehouse. "InStock" in PRD.
    in_transit: number; // Qty from open POs. "InTransit" in PRD.
    reserved: number; // Qty issued to maintenance, not yet used. "Reserved" in PRD.
    used_in_period: number; // Qty consumed in current period. "Used" in PRD.
    safety_stock: number;
    reorder_point: number;
    maintenance_interval_days?: number;
    flagged_for_order?: boolean;
    // New fields for enhanced details
    image_url?: string;
    lifespan_days?: number;
    wear_tear_standard?: string;
    replacement_standard?: string;
}

export interface MaintenancePartUsage {
    order_id: number;
    part_id: number;
    qty_used: number;
}

export interface MaintenanceOrder {
    id: number;
    machine_id: number;
    type: 'PM' | 'IM'; // Preventive, Improvement
    priority: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'InProgress' | 'Done' | 'Canceled';
    created_by_id: number;
    assigned_to_id: number | null;
    task_description: string;
    downtime_min: number | null;
    plan_date: string;
    actual_start_date: string | null;
    actual_end_date: string | null;
}

// FIX: Add missing checklist-related types
// --- NEW CHECKLIST MODULE TYPES ---
export type ChecklistItemStatus = 'Checked' | 'Unchecked';

export interface ChecklistItemTemplate {
  id: number;
  text: string;
  expected_value: string | null;
}

export interface ChecklistTemplate {
    id: number;
    name: string;
    description: string | null;
    area: string;
    type: 'Daily' | 'Weekly' | 'Monthly' | 'PM';
    items: ChecklistItemTemplate[];
}

export interface ChecklistInstance {
    id: number;
    checklist_template_id: number;
    machine_id: number;
    assigned_to_id: number | null;
    created_at: string; // ISO Date String
    started_at: string | null;
    completed_at: string | null;
    status: 'Pending' | 'In Progress' | 'Completed';
}

export interface ChecklistInstanceItem {
    id: number; // This is the instance item id
    checklist_item_template_id: number; // Link to the template item
    text: string; // Denormalized from template for convenience
    expected_value: string | null; // Denormalized from template
    status: ChecklistItemStatus;
    actual_value: string | null;
    notes: string | null;
}

export interface EnrichedChecklistInstance extends ChecklistInstance {
    template_name: string;
    template_description: string | null;
    MACHINE_ID: string;
    assigned_to_name: string | null;
    items: ChecklistInstanceItem[];
}

// --- NEW PM SCHEDULE TYPES ---
export type PmType = 'PM-1M' | 'PM-12M' | 'PM-24M' | 'PM-36M' | 'PM-48M' | 'PM-60M';
export type PmCycleDays = 30 | 365 | 730 | 1095 | 1460 | 1825;

export interface MaintenanceSchedule {
  id: number;
  machine_id: number;
  pm_type: PmType;
  last_pm_date: string; // YYYY-MM-DD
  cycle_days: PmCycleDays;
}

export interface EnrichedMaintenanceSchedule extends MaintenanceSchedule {
  MACHINE_ID: string;
  MACHINE_NAME: string;
  next_pm_date: string; // YYYY-MM-DD, calculated
  status: 'On schedule' | 'Due soon' | 'Overdue';
}

export interface PmPartsTemplate {
  pm_type: PmType;
  machine_id: number; // Can be specific to machine, or 0 for general
  parts: { part_id: number; qty: number }[];
}


// --- PURCHASING MODULE ---
export type PurchaseStatus = 'Pending' | 'Approved' | 'Ordered' | 'Received';

export interface McPartPurchaseRequest {
  id: number;
  item_code: string;
  item_name: string;
  quantity: number;
  reason: string;
  status: PurchaseStatus;
  request_date: string; // YYYY-MM-DD
}



// New type for MC Part Purchase Orders based on new PRD
export interface McPartOrder {
    id: number;
    order_id: string; // PO number like PO202510A
    item_code: string;
    item_name: string;
    qty_order: number;
    order_date: string; // YYYY-MM-DD
    expected_date: string; // YYYY-MM-DD
    supplier: string;
    status: 'In Transit' | 'Delayed' | 'Received';
    area: string;
}


// --- OEE BENCHMARKING MODULE ---
export interface OeeTarget {
  id: number;
  level: 'Plant' | 'Area' | 'Line' | 'Machine';
  line_id: string | null; // Using string LINE_ID for simplicity with existing filters
  target_oee: number; // 0-1
  target_output: number; // For KpiProgress component
  target_defect_rate: number; // For KpiProgress component
  effective_from: string; // YYYY-MM-DD
  effective_to: string | null;
}

// --- ENRICHED TYPES FOR UI CONSUMPTION ---
export interface EnrichedErrorReport extends ErrorReport {
    MACHINE_ID: string;
    LINE_ID: string;
    SHIFT_CODE: 'A' | 'B' | 'C';
    operator_name: string;
    technician_name: string | null;
    verifier_name: string | null;
    images: ErrorImage[];
    history: (ErrorHistory & { changed_by_name: string })[];
}

export interface EnrichedMaintenanceOrder extends MaintenanceOrder {
    MACHINE_ID: string;
    created_by_name: string;
    assigned_to_name: string | null;
    parts_used: (MaintenancePartUsage & { part_code: string, part_name: string })[];
}

// FIX: Added missing DefectRecord and EnrichedDefectRecord types for legacy defect system
export interface DefectRecord {
    id: number;
    work_date: string;
    machine_id: number;
    shift_id: number;
    defect_type_id: number;
    cause_id: number | null;
    quantity: number;
    note: string | null;
    severity: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'In Progress' | 'Closed';
    is_abnormal: boolean;
    reporter_id: number;
    linked_maintenance_order_id: number | null;
    image_urls?: string[];
}

export interface EnrichedDefectRecord extends DefectRecord {
    MACHINE_ID: string;
    SHIFT: 'A' | 'B' | 'C';
    defect_type_name: string;
    cause_category: CauseCategory | null;
    reporter_name: string;
    image_urls: string[];
}

// New types for enriched Spare Part details
export interface SparePartUsageHistory {
    order_id: number;
    MACHINE_ID: string;
    completed_at: string;
    qty_used: number;
}

export interface EnrichedSparePart extends SparePart {
    usageHistory: SparePartUsageHistory[];
    purchaseHistory: McPartOrder[];
}


// --- FORM SUBMISSION TYPES ---
export interface NewErrorReportData {
    machine_id: number;
    shift_id: number;
    operator_id: number;
    defect_type: string;
    defect_description: string;
    severity: ErrorSeverity;
    images?: { url: string; description: string }[];
    linked_maintenance_order_id?: number | null;
    linked_defect_id?: number | null;
}

export interface UpdateErrorData {
    technician_id?: number;
    root_cause?: string;
    cause_category?: CauseCategory;
    action_taken?: string;
    images?: { url: string; description: string }[];
}

export interface NewMaintenanceOrderData {
    machine_id: number;
    type: 'PM' | 'IM';
    priority: 'Low' | 'Medium' | 'High';
    created_by_id: number;
    assigned_to_id: number | null;
    task_description: string;
    plan_date: string;
    parts_used?: { part_id: number; qty_used: number }[];
}

export interface CompleteMaintenanceOrderData {
    downtime_min: number;
    actual_start_date: string;
    actual_end_date: string;
    parts_used: { part_id: number; qty_used: number }[];
}

export interface NewMachineData {
    MACHINE_ID: string;
    MACHINE_NAME: string;
    LINE_ID: string;
    IDEAL_CYCLE_TIME: number;
    DESIGN_SPEED: number;
    STATUS: 'active' | 'inactive';
}

export interface NewDefectData {
    work_date: string;
    machine_id: number;
    shift_id: number;
    defect_type_id: number;
    cause_id: number;
    quantity: number;
    note: string;
    severity: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'In Progress' | 'Closed';
    is_abnormal: boolean;
    reporter_id: number;
    linked_maintenance_order_id: number | null;
    image_urls?: string[];
}



export interface NewMcPartRequestData {
  item_code: string;
  item_name: string;
  quantity: number;
  reason: string;
}

export interface NewSparePartData {
  part_code: string;
  name: string;
  location: string;
  available: number;
  reorder_point: number;
  safety_stock: number;
  in_transit: number;
  reserved: number;
  used_in_period: number;
  maintenance_interval_days?: number;
  image_url?: string;
  lifespan_days?: number;
  wear_tear_standard?: string;
  replacement_standard?: string;
}

// --- UI & CHARTING TYPES (Re-added) ---
export interface DataPoint {
    name: string;
    value: number;
    [key: string]: any;
}

export interface TrendData {
    date: string;
    [key: string]: number | string | undefined;
}

export interface BoxplotDataPoint {
    name: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
}

export interface HeatmapDataPoint {
    line: string;
    shift: string;
    value: number;
}

export interface StackedBarDataPoint {
    name: string;
    [key: string]: string | number | undefined;
}

export interface ScatterDataPoint {
    production: number;
    downtime: number;
    machineId: string;
    lineId: string;
}

export interface Top5DefectLine {
    lineId: string;
    totalProduction: number;
    totalDefects: number;
    defectRate: number;
}

export interface Top5DowntimeMachine {
    machineId: string;
    totalDowntime: number;
}

export interface MachineStatusData {
    machineId: string;
    status: 'Running' | 'Stopped' | 'Error' | 'Inactive';
    oee: number | null;
    lineId: string;
}

export interface MachineMaintenanceStats {
    machineId: string;
    mtbf: number;
    mttr: number;
    breakdownCount: number;
    totalDowntime: number;
    status: 'Alert' | 'Warning' | 'Normal';
}

export interface DowntimeCauseStats {
    reason: string;
    count: number;
    totalMinutes: number;
    mainMachineImpact: string;
}

export interface MaintenanceKpis {
    mtbf: number;
    mttr: number;
    breakdownCount: number;
    topMttrMachines: DataPoint[];
}

export interface DefectAdjustmentLog {
    id: number;
    date: string;
    machine: string;
    shift: 'A' | 'B' | 'C';
    defectType: string;
    quantity: number;
}

// --- MAIN DASHBOARD DATA STRUCTURE (Re-added) ---
export interface DashboardData {
    productionLog: ProductionDaily[];
    downtimeRecords: DowntimeRecord[];
    allMachineInfo: MachineInfo[];
    errorReports: EnrichedErrorReport[];
    allDefectRecords: EnrichedDefectRecord[];
    maintenanceOrders: EnrichedMaintenanceOrder[];
    availableLines: string[];
    availableMachines: string[];
    masterData: {
        users: User[];
        shifts: Shift[];
        defectTypes: DefectType[];
        defectCauses: DefectCause[];
        machines: MachineInfo[];
        spareParts: SparePart[];
        pmPartsTemplates: PmPartsTemplate[];
    };
    machineStatus: MachineStatusData[];
    summary: {
        totalProduction: number;
        totalDefects: number;
        totalDowntime: number;
        machineUtilization: number;
        avgOee: number;
        avgAvailability: number;
        avgPerformance: number;
        avgQuality: number;
        defectRate: number;
        productionByLine: DataPoint[];
        oeeByLine: DataPoint[];
        openErrorCount: number;
    };
    performance: {
        sevenDayTrend: TrendData[];
        productionBoxplot: BoxplotDataPoint[];
        oeeHeatmap: HeatmapDataPoint[];
    };
    quality: {
        defectPareto: (DataPoint & { cumulative?: number })[];
        defectRateTrend: TrendData[];
        defectTrend: TrendData[];
        top5DefectLines: Top5DefectLine[];
        defectsByRootCause: DataPoint[];
        defectCausePareto: (DataPoint & { cumulative?: number })[];
        defectRecordsForPeriod: EnrichedDefectRecord[];
    };
    downtime: {
        downtimePareto: (DataPoint & { cumulative?: number })[];
        downtimeTrend: TrendData[];
        downtimeByCategory: DataPoint[];
        top5DowntimeMachines: Top5DowntimeMachine[];
        downtimeByLine: StackedBarDataPoint[];
        uniqueDowntimeReasons: string[];
        downtimeVsProduction: ScatterDataPoint[];
    };
    maintenance: {
        kpis: MaintenanceKpis;
        schedule: {
            overdue: EnrichedMaintenanceOrder[];
            dueSoon: EnrichedMaintenanceOrder[];
        };
        pmSchedule: EnrichedMaintenanceSchedule[];
        spareParts: SparePart[];
        lowStockParts: SparePart[];
        mcPartOrders: McPartOrder[];
        machineStats: MachineMaintenanceStats[];
        downtimeAnalysis: DowntimeCauseStats[];
        trend: TrendData[];
    };
    benchmarking: {
        oeeByLine: DataPoint[];
        targets: OeeTarget[];
    };
    purchasing: {
        mcPartRequests: McPartPurchaseRequest[];
    };
}