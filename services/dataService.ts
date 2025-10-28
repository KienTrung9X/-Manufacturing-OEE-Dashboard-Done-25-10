import { 
    ProductionDaily, DowntimeRecord, DashboardData, DataPoint, TrendData, 
    Top5DefectLine, Top5DowntimeMachine, StackedBarDataPoint, BoxplotDataPoint, 
    HeatmapDataPoint, MachineInfo, DefectAdjustmentLog, MachineStatusData, 
    OeeTarget, User, Shift, DefectType, DefectCause, SparePart,
    ErrorReport, ErrorImage, ErrorHistory, EnrichedErrorReport, NewErrorReportData, UpdateErrorData, ErrorReportStatus,
    DefectRecord, EnrichedDefectRecord, MaintenanceOrder, MaintenancePartUsage, EnrichedMaintenanceOrder, NewMaintenanceOrderData, CauseCategory, NewMachineData, NewDefectData,
    McPartPurchaseRequest, ConsumablePurchaseRequest, PurchaseStatus, NewConsumableRequestData, NewSparePartData, NewMcPartRequestData,
    MaintenanceSchedule, PmPartsTemplate, EnrichedMaintenanceSchedule, McPartOrder,
    MachineMaintenanceStats, DowntimeCauseStats,
    ScatterDataPoint,
    EnrichedSparePart,
    SparePartUsageHistory,
    CompleteMaintenanceOrderData,
    PmType,
    MaintenanceKpis
} from '../types';
import { quantile } from 'simple-statistics';

// --- MASTER DATA MOCKS ---

export let usersData: User[] = [
    { id: 1, username: 'admin', full_name: 'Admin', role: 'Admin' },
    { id: 101, username: 'vhung', full_name: 'Văn Hùng', role: 'Maintenance' },
    { id: 102, username: 'tlan', full_name: 'Thị Lan', role: 'Maintenance' },
    { id: 103, username: 'mtri', full_name: 'Minh Trí', role: 'Maintenance' },
    { id: 201, username: 'operatorA', full_name: 'Operator Ca A', role: 'Operator' },
    { id: 202, username: 'qa_team', full_name: 'QA Team', role: 'QA' },
    { id: 203, username: 'supervisor.b', full_name: 'Supervisor B', role: 'Supervisor' },
];

export let shiftsData: Shift[] = [
    { id: 1, code: 'A', name: 'Ca A (06:00 - 14:00)' },
    { id: 2, code: 'B', name: 'Ca B (14:00 - 22:00)' },
    { id: 3, code: 'C', name: 'Ca C (22:00 - 06:00)' },
];

export let defectTypesData: DefectType[] = [
    { id: 1, code: 'SKIP_STITCH', name: 'Skip stitch' },
    { id: 2, code: 'TAPE_JAM', name: 'Tape jam' },
    { id: 3, code: 'COSMETIC', name: 'Cosmetic' },
    { id: 4, code: 'MISALIGNED', name: 'Misaligned' },
    { id: 5, code: 'PAINT_DRIP', name: 'Paint Drip' },
    { id: 6, code: 'SCRATCH', name: 'Scratch' },
    { id: 7, code: 'PACKAGING', name: 'Packaging' },
    { id: 8, code: 'TRIM', name: 'Material Trim' },
    { id: 9, code: 'SENSOR_ERROR', name: 'Sensor Error'},
];

export let defectCausesData: DefectCause[] = [
    { id: 1, category: 'Man', detail: null },
    { id: 2, category: 'Machine', detail: null },
    { id: 3, category: 'Material', detail: null },
    { id: 4, category: 'Method', detail: null },
    { id: 5, category: 'Environment', detail: null },
];

export const LINE_TO_AREA_MAP: Record<string, string> = {
    '31': 'Area Stamping', '32': 'Area Assembly', '41': 'Area Painting',
    '42': 'Area Painting', '51': 'Area Finishing',
};

export let machineInfoData: MachineInfo[] = [
    { id: 1, MACHINE_ID: 'M01', MACHINE_NAME: 'Assembler Alpha', LINE_ID: '32', IDEAL_CYCLE_TIME: 0.045, DESIGN_SPEED: 22, STATUS: 'active', x: 30, y: 20 },
    { id: 2, MACHINE_ID: 'M02', MACHINE_NAME: 'Assembler Beta', LINE_ID: '32', IDEAL_CYCLE_TIME: 0.045, DESIGN_SPEED: 22, STATUS: 'active', x: 30, y: 60 },
    { id: 3, MACHINE_ID: 'M03', MACHINE_NAME: 'Stamping Press 1', LINE_ID: '31', IDEAL_CYCLE_TIME: 0.06, DESIGN_SPEED: 17, STATUS: 'active', x: 10, y: 30 },
    { id: 4, MACHINE_ID: 'M04', MACHINE_NAME: 'Paint Booth A', LINE_ID: '41', IDEAL_CYCLE_TIME: 0.25, DESIGN_SPEED: 4, STATUS: 'inactive', x: 55, y: 30 },
    { id: 5, MACHINE_ID: 'M05', MACHINE_NAME: 'Paint Booth B', LINE_ID: '42', IDEAL_CYCLE_TIME: 0.24, DESIGN_SPEED: 4, STATUS: 'active', x: 55, y: 70 },
    { id: 6, MACHINE_ID: 'M06', MACHINE_NAME: 'Finishing Line 1', LINE_ID: '51', IDEAL_CYCLE_TIME: 0.08, DESIGN_SPEED: 12, STATUS: 'active', x: 80, y: 50 },
];

export let sparePartsData: SparePart[] = [
    // Sufficient stock
    { id: 1, part_code: 'FIL-001', name: 'Air Filter', location: 'Aisle 3, Bin 12', 
      available: 15, in_transit: 0, reserved: 2, used_in_period: 8, safety_stock: 8, reorder_point: 10,
      maintenance_interval_days: 30, flagged_for_order: false,
      image_url: 'https://storage.googleapis.com/aistudio-marketplace-llm-provider-images/website_pr_assets_maker-explainer/spare-part-filter.png',
      lifespan_days: 180,
      wear_tear_standard: 'Check for clogging and tears. Airflow reduction > 20% indicates wear.',
      replacement_standard: 'Replace every 6 months or if torn.'
    },
    // Almost out
    { id: 2, part_code: 'BLT-A300', name: 'Belt A300', location: 'Aisle 3, Bin 5', 
      available: 3, in_transit: 0, reserved: 0, used_in_period: 8, safety_stock: 3, reorder_point: 5,
      flagged_for_order: false,
      image_url: 'https://storage.googleapis.com/aistudio-marketplace-llm-provider-images/website_pr_assets_maker-explainer/spare-part-belt.png',
      lifespan_days: 730,
      wear_tear_standard: 'Visible cracks, fraying, or loss of tension.',
      replacement_standard: 'Replace every 24 months or upon visible wear.'
    },
    // Sufficient stock
     { id: 3, part_code: 'BEAR-210', name: 'Ball Bearing 210mm', location: 'Aisle 3, Bin 5',
      available: 50, in_transit: 20, reserved: 5, used_in_period: 15, safety_stock: 15, reorder_point: 20,
      maintenance_interval_days: 365, flagged_for_order: false,
      image_url: 'https://storage.googleapis.com/aistudio-marketplace-llm-provider-images/website_pr_assets_maker-explainer/spare-part-bearing.png'
    },
     // Need to order
    { id: 4, part_code: 'NOZ-PNT-A', name: 'Paint Nozzle Type A', location: 'Aisle 5, Bin 1',
      available: 4, in_transit: 0, reserved: 1, used_in_period: 5, safety_stock: 5, reorder_point: 5,
      flagged_for_order: false,
      image_url: 'https://storage.googleapis.com/aistudio-marketplace-llm-provider-images/website_pr_assets_maker-explainer/spare-part-nozzle.png'
    },
    // From PRD example: "Cần đặt hàng" (Need to order)
    { id: 5, part_code: 'CP-F20005', name: 'Coupling F20005', location: 'Aisle 2, Bin 8', 
      available: 1, in_transit: 1, reserved: 2, used_in_period: 15, safety_stock: 4, reorder_point: 6,
      flagged_for_order: true
    },
    // From PRD example: "Đủ" (Sufficient)
    { id: 6, part_code: 'BRG-6301ZZE', name: 'Bearing 6301ZZE', location: 'Aisle 1, Bin 4', 
      available: 5, in_transit: 2, reserved: 1, used_in_period: 20, safety_stock: 3, reorder_point: 5,
      flagged_for_order: false,
      image_url: 'https://storage.googleapis.com/aistudio-marketplace-llm-provider-images/website_pr_assets_maker-explainer/spare-part-bearing-2.png'
    },
];

export let mcPartOrdersData: McPartOrder[] = [
    { id: 1, area: '312', order_id: 'PO202510A', item_code: 'BRG-6301ZZE', item_name: 'Bearing 6301ZZE', qty_order: 2, order_date: '2025-10-01', expected_date: '2025-10-28', supplier: 'NSK Vietnam', status: 'In Transit' },
    { id: 2, area: '312', order_id: 'PO202510B', item_code: 'BLT-A300', item_name: 'Belt A300', qty_order: 5, order_date: '2025-10-05', expected_date: '2025-10-25', supplier: 'Gates Unitta', status: 'Received' },
    { id: 3, area: '411', order_id: 'PO202510C', item_code: 'NOZ-PNT-A', item_name: 'Paint Nozzle Type A', qty_order: 10, order_date: '2025-09-20', expected_date: '2025-10-15', supplier: 'Graco Inc.', status: 'Delayed' },
];

// --- ADDED MOCK DATA ARRAYS ---
let productionDailyData: ProductionDaily[] = [];
let downtimeRecordsData: DowntimeRecord[] = [];
let errorReportsData: ErrorReport[] = [];
let errorImagesData: ErrorImage[] = [];
let errorHistoryData: ErrorHistory[] = [];
let defectRecordsData: DefectRecord[] = [];
let maintenanceOrdersData: MaintenanceOrder[] = [];
let maintenancePartUsagesData: MaintenancePartUsage[] = [];
let mcPartPurchaseRequestsData: McPartPurchaseRequest[] = [];
let consumablePurchaseRequestsData: ConsumablePurchaseRequest[] = [];
let maintenanceSchedulesData: MaintenanceSchedule[] = [];
let oeeTargetsData: OeeTarget[] = [];
let pmPartsTemplatesData: PmPartsTemplate[] = [];


// --- MOCK DATA GENERATION ---
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

const generateMockData = (startDate: string, endDate: string) => {
    productionDailyData = [];
    downtimeRecordsData = [];
    errorReportsData = [];
    errorImagesData = [];
    errorHistoryData = [];
    defectRecordsData = [];
    mcPartPurchaseRequestsData = [];
    consumablePurchaseRequestsData = [];
    maintenanceSchedulesData = [];
    oeeTargetsData = [];
    pmPartsTemplatesData = [];

    let prodId = 1;
    let downtimeId = 1;
    let defectId = 1;

    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        for (const machine of machineInfoData) {
            for (const shift of shiftsData) {
                if (machine.STATUS === 'inactive' && Math.random() > 0.1) continue;

                const runTime = randomBetween(400, 480);
                const downtime = 480 - runTime;
                const totalProduction = Math.round((runTime / machine.IDEAL_CYCLE_TIME) * (0.8 + Math.random() * 0.2));
                const defects = Math.round(totalProduction * (Math.random() * 0.05));
                const actualProduction = totalProduction - defects;
                
                const availability = runTime / 480;
                const performance = (actualProduction * machine.IDEAL_CYCLE_TIME) / runTime;
                const quality = actualProduction / totalProduction;
                const oee = availability * performance * quality;

                productionDailyData.push({
                    Prod_ID: prodId++,
                    COMP_DAY: dateStr,
                    LINE_ID: machine.LINE_ID,
                    MACHINE_ID: machine.MACHINE_ID,
                    ITEM_CODE: `ITEM-${100 + machine.id}`,
                    ACT_PRO_QTY: actualProduction,
                    DEFECT_QTY: defects,
                    RUN_TIME_MIN: runTime,
                    DOWNTIME_MIN: downtime,
                    IDEAL_CYCLE_TIME: machine.IDEAL_CYCLE_TIME,
                    OEE: oee,
                    shift_id: shift.id,
                    SHIFT: shift.code,
                    availability,
                    performance,
                    quality,
                });

                if (downtime > 0) {
                    downtimeRecordsData.push({
                        Downtime_ID: downtimeId++,
                        COMP_DAY: dateStr,
                        MACHINE_ID: machine.MACHINE_ID,
                        DOWNTIME_REASON: ['Setup', 'Mechanical', 'Electrical', 'Waiting'][randomBetween(0,3)],
                        DOWNTIME_MIN: downtime,
                        START_TIME: '08:00',
                        END_TIME: '09:00'
                    });
                }

                if (defects > 0) {
                     defectRecordsData.push({
                        id: defectId++,
                        work_date: dateStr,
                        machine_id: machine.id,
                        shift_id: shift.id,
                        defect_type_id: defectTypesData[randomBetween(0, defectTypesData.length - 1)].id,
                        cause_id: defectCausesData[randomBetween(0, defectCausesData.length - 1)].id,
                        quantity: defects,
                        note: `Found ${defects} defects`,
                        severity: ['Low', 'Medium', 'High'][randomBetween(0,2)] as 'Low' | 'Medium' | 'High',
                        status: 'Closed',
                        is_abnormal: Math.random() > 0.5,
                        reporter_id: usersData.find(u => u.role === 'Operator')?.id || 201,
                        linked_maintenance_order_id: null,
                    });
                }
            }
        }
    }
    
    // Simple mock error reports
    errorReportsData = [
        { id: 1, reportNo: 'ERR-001', machine_id: 1, shift_id: 1, operator_id: 201, report_time: `${startDate}T08:00:00Z`, defect_type: 'Skip stitch', defect_description: 'Machine is skipping stitches', severity: 'Medium', status: 'In Progress', root_cause: null, cause_category: null, action_taken: null, technician_id: 101, fix_time: null, verify_by: null, verify_time: null, note: null, created_at: `${startDate}T08:00:00Z`, updated_at: `${startDate}T09:00:00Z`, linked_maintenance_order_id: null, linked_defect_id: null },
        { id: 2, reportNo: 'ERR-002', machine_id: 3, shift_id: 2, operator_id: 201, report_time: `${endDate}T15:00:00Z`, defect_type: 'Cosmetic', defect_description: 'Scratches on surface', severity: 'Low', status: 'Reported', root_cause: null, cause_category: null, action_taken: null, technician_id: null, fix_time: null, verify_by: null, verify_time: null, note: null, created_at: `${endDate}T15:00:00Z`, updated_at: `${endDate}T15:00:00Z`, linked_maintenance_order_id: null, linked_defect_id: 1 }
    ];
    errorHistoryData = [
        { id: 1, error_id: 1, changed_by: 1, old_status: 'Reported', new_status: 'In Progress', note: 'Technician assigned.', changed_at: `${startDate}T09:00:00Z` }
    ];
    
     // Simple mock maintenance orders - only seed if empty
    if (maintenanceOrdersData.length === 0) {
        maintenanceOrdersData = [
            { id: 1, machine_id: 2, type: 'PM', priority: 'Medium', status: 'Done', created_by_id: 1, assigned_to_id: 101, task_description: 'Monthly lubrication and filter change', downtime_min: 60, plan_date: '2025-10-15', actual_start_date: '2025-10-15', actual_end_date: '2025-10-15' },
            { id: 2, machine_id: 5, type: 'IM', priority: 'High', status: 'Open', created_by_id: 1, assigned_to_id: null, task_description: 'Upgrade nozzle control system', downtime_min: 240, plan_date: '2025-11-05', actual_start_date: null, actual_end_date: null },
            { id: 3, machine_id: 1, type: 'IM', priority: 'High', status: 'Done', created_by_id: 203, assigned_to_id: 102, task_description: 'Replaced worn out A300 belt', downtime_min: 90, plan_date: '2025-10-20', actual_start_date: '2025-10-20', actual_end_date: '2025-10-20'},
        ];
    }

    if (maintenancePartUsagesData.length === 0) {
        maintenancePartUsagesData = [
            { order_id: 1, part_id: 1, qty_used: 1 }, // PM for M02, used 1 Air Filter
            { order_id: 3, part_id: 2, qty_used: 1 }, // IM for M01, used 1 Belt A300
        ];
    }
    
    // PM Schedule Mock Data
    maintenanceSchedulesData = [
        { id: 1, machine_id: 1, pm_type: 'PM-1M', last_pm_date: '2025-10-10', cycle_days: 30 },
        { id: 2, machine_id: 2, pm_type: 'PM-12M', last_pm_date: '2024-11-15', cycle_days: 365 },
        { id: 3, machine_id: 3, pm_type: 'PM-1M', last_pm_date: '2025-09-28', cycle_days: 30 }, // This will be overdue
        { id: 4, machine_id: 5, pm_type: 'PM-12M', last_pm_date: '2024-12-25', cycle_days: 365 },
        { id: 5, machine_id: 1, pm_type: 'PM-12M', last_pm_date: '2025-01-05', cycle_days: 365 }, // On schedule
        { id: 6, machine_id: 6, pm_type: 'PM-1M', last_pm_date: '2025-10-25', cycle_days: 30 }, // Due Soon
    ];
    
    pmPartsTemplatesData = [
        { pm_type: 'PM-1M', machine_id: 1, parts: [{ part_id: 1, qty: 1 }] }, // M01 -> Air Filter
        { pm_type: 'PM-12M', machine_id: 2, parts: [{ part_id: 3, qty: 4 }, {part_id: 2, qty: 1}] }, // M02 -> 4x Bearings, 1x Belt
        { pm_type: 'PM-1M', machine_id: 3, parts: [] }, // M03 -> No parts
        { pm_type: 'PM-12M', machine_id: 5, parts: [{ part_id: 4, qty: 2 }] }, // M05 -> 2x Nozzles
    ];
};

generateMockData('2025-10-26', '2025-10-26'); // Initial data load

// --- HELPER FUNCTIONS ---
// ... (enrichment functions would go here if needed)

// --- EXPORTED API FUNCTIONS ---

export const getInitialFilterData = () => {
  return {
    defaultDate: '2025-10-26',
    defaultArea: 'all',
    availableAreas: [...new Set(Object.values(LINE_TO_AREA_MAP))],
  };
};

export const getMachineInfo = (machineId: string): MachineInfo | null => {
    return machineInfoData.find(m => m.MACHINE_ID === machineId) || null;
}

export const addMachine = (data: NewMachineData) => {
    const newId = Math.max(...machineInfoData.map(m => m.id)) + 1;
    const newMachine: MachineInfo = { id: newId, ...data };
    machineInfoData.push(newMachine);
};

export const updateMachine = (id: number, data: Partial<NewMachineData & {x?: number, y?: number}>) => {
    const index = machineInfoData.findIndex(m => m.id === id);
    if (index !== -1) {
        machineInfoData[index] = { ...machineInfoData[index], ...data };
    }
};

export const addErrorReport = (data: NewErrorReportData) => {
    const newId = Math.max(0, ...errorReportsData.map(r => r.id)) + 1;
    const now = new Date().toISOString();
    const newReport: ErrorReport = {
        id: newId,
        reportNo: `ERR-${String(newId).padStart(3, '0')}`,
        machine_id: data.machine_id,
        shift_id: data.shift_id,
        operator_id: data.operator_id,
        report_time: now,
        defect_type: data.defect_type,
        defect_description: data.defect_description,
        severity: data.severity,
        status: 'Reported',
        root_cause: null,
        cause_category: null,
        action_taken: null,
        technician_id: null,
        fix_time: null,
        verify_by: null,
        verify_time: null,
        note: null,
        created_at: now,
        updated_at: now,
        linked_maintenance_order_id: data.linked_maintenance_order_id || null,
        linked_defect_id: data.linked_defect_id || null,
    };
    errorReportsData.push(newReport);
    errorHistoryData.push({
        id: Math.random(),
        error_id: newId,
        changed_by: 1,
        old_status: null,
        new_status: 'Reported',
        note: 'Report created.',
        changed_at: now,
    });
};

export const updateErrorReport = (reportId: number, data: UpdateErrorData, newStatus: ErrorReportStatus) => {
    const reportIndex = errorReportsData.findIndex(r => r.id === reportId);
    if (reportIndex !== -1) {
        const now = new Date().toISOString();
        const oldStatus = errorReportsData[reportIndex].status;
        
        errorReportsData[reportIndex] = {
            ...errorReportsData[reportIndex],
            ...data,
            status: newStatus,
            updated_at: now,
        };

        if (newStatus === 'Fixed' || newStatus === 'Not Machine Issue') {
            errorReportsData[reportIndex].fix_time = now;
        }

        if (oldStatus !== newStatus) {
            errorHistoryData.push({
                id: Math.random(),
                error_id: reportId,
                changed_by: 1, // Assume admin
                old_status: oldStatus,
                new_status: newStatus,
                note: `Status updated to ${newStatus}.`,
                changed_at: now,
            });
        }
    }
};

export const addMaintenanceOrder = (data: NewMaintenanceOrderData) => {
    const newId = Math.max(0, ...maintenanceOrdersData.map(o => o.id)) + 1;
    const newOrder: MaintenanceOrder = {
        id: newId,
        machine_id: data.machine_id,
        type: data.type,
        priority: data.priority,
        status: 'Open',
        created_by_id: data.created_by_id,
        assigned_to_id: data.assigned_to_id,
        task_description: data.task_description,
        downtime_min: null,
        plan_date: data.plan_date,
        actual_start_date: null,
        actual_end_date: null,
    };
    maintenanceOrdersData.push(newOrder);

    if (data.parts_used) {
        data.parts_used.forEach(part => {
            maintenancePartUsagesData.push({ order_id: newId, part_id: part.part_id, qty_used: part.qty_used });
        });
    }
};

export const updateMaintenanceOrder = (orderId: number, data: Partial<MaintenanceOrder & { parts_used: { part_id: number; qty_used: number }[] }>) => {
    const index = maintenanceOrdersData.findIndex(o => o.id === orderId);
    if (index !== -1) {
        const existingOrder = maintenanceOrdersData[index];
        maintenanceOrdersData[index] = { ...existingOrder, ...data, status: 'Done' };

        // Update parts usage
        if (data.parts_used) {
            // Remove old usages for this order
            maintenancePartUsagesData = maintenancePartUsagesData.filter(p => p.order_id !== orderId);
            // Add new ones
            data.parts_used.forEach(part => {
                maintenancePartUsagesData.push({ order_id: orderId, part_id: part.part_id, qty_used: part.qty_used });
            });
        }
    }
};

export const addConsumableRequest = (data: NewConsumableRequestData) => {
    const newId = Math.max(0, ...consumablePurchaseRequestsData.map(r => r.id)) + 1;
    consumablePurchaseRequestsData.push({ ...data, id: newId, status: 'Pending' });
};

export const addMcPartRequest = (data: NewMcPartRequestData) => {
    const newId = Math.max(0, ...mcPartPurchaseRequestsData.map(r => r.id)) + 1;
    mcPartPurchaseRequestsData.push({ ...data, id: newId, status: 'Pending', request_date: new Date().toISOString().slice(0, 10) });
};

export const addSparePart = (data: NewSparePartData) => {
    const newId = Math.max(0, ...sparePartsData.map(p => p.id)) + 1;
    sparePartsData.push({ ...data, id: newId, flagged_for_order: false });
};

export const updateSparePart = (id: number, data: Partial<NewSparePartData>) => {
    const index = sparePartsData.findIndex(p => p.id === id);
    if (index !== -1) {
        sparePartsData[index] = { ...sparePartsData[index], ...data };
    }
};

export const toggleFlagForOrder = (partId: number) => {
    const part = sparePartsData.find(p => p.id === partId);
    if (part) {
        part.flagged_for_order = !part.flagged_for_order;
    }
};


export const addDefectRecord = (data: NewDefectData): EnrichedDefectRecord => {
    const newId = Math.max(0, ...defectRecordsData.map(d => d.id)) + 1;
    const newRecord: DefectRecord = { ...data, id: newId };
    defectRecordsData.push(newRecord);

    const machine = machineInfoData.find(m => m.id === data.machine_id)!;
    const shift = shiftsData.find(s => s.id === data.shift_id)!;
    const defectType = defectTypesData.find(dt => dt.id === data.defect_type_id)!;
    const cause = defectCausesData.find(c => c.id === data.cause_id);
    const reporter = usersData.find(u => u.id === data.reporter_id)!;

    return {
        ...newRecord,
        MACHINE_ID: machine.MACHINE_ID,
        SHIFT: shift.code,
        defect_type_name: defectType.name,
        cause_category: cause?.category || null,
        reporter_name: reporter.full_name,
        image_urls: data.image_urls || [],
    };
};

export const getEnrichedSparePartDetails = (part: SparePart): EnrichedSparePart => {
    const usageHistory: SparePartUsageHistory[] = [];
    const partUsages = maintenancePartUsagesData.filter(usage => usage.part_id === part.id);
    for (const usage of partUsages) {
        const order = maintenanceOrdersData.find(o => o.id === usage.order_id && o.status === 'Done');
        if (order) {
            const machine = machineInfoData.find(m => m.id === order.machine_id);
            if(machine && order.actual_end_date) {
                usageHistory.push({
                    order_id: order.id,
                    MACHINE_ID: machine.MACHINE_ID,
                    completed_at: order.actual_end_date,
                    qty_used: usage.qty_used
                });
            }
        }
    }

    const purchaseHistory = mcPartOrdersData.filter(order => order.item_code === part.part_code);

    return {
        ...part,
        usageHistory: usageHistory.sort((a,b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()),
        purchaseHistory: purchaseHistory.sort((a,b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()),
    };
};


// --- MAIN DATA AGGREGATION FUNCTION ---
export const getDashboardData = async (
    startDate: string,
    endDate: string,
    area: string,
    shift: 'all' | 'A' | 'B' | 'C',
    status: 'all' | 'active' | 'inactive',
): Promise<DashboardData> => {
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // --- Filter Data ---
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const relevantLines = area === 'all' 
        ? [...new Set(machineInfoData.map(m => m.LINE_ID))] 
        : Object.keys(LINE_TO_AREA_MAP).filter(line => LINE_TO_AREA_MAP[line] === area);
        
    const relevantMachines = machineInfoData.filter(m => 
        relevantLines.includes(m.LINE_ID) &&
        (status === 'all' || m.STATUS === status)
    );
    const relevantMachineIds = relevantMachines.map(m => m.MACHINE_ID);

    const filteredProduction = productionDailyData.filter(p => {
        const date = new Date(p.COMP_DAY);
        return date >= start && date <= end &&
               relevantMachineIds.includes(p.MACHINE_ID) &&
               (shift === 'all' || p.SHIFT === shift);
    });
    
    const filteredDowntime = downtimeRecordsData.filter(d => {
       const date = new Date(d.COMP_DAY);
        return date >= start && date <= end &&
               relevantMachineIds.includes(d.MACHINE_ID);
    });

    const masterData = { users: usersData, shifts: shiftsData, defectTypes: defectTypesData, defectCauses: defectCausesData, machines: machineInfoData, spareParts: sparePartsData, pmPartsTemplates: pmPartsTemplatesData };
    
    const allDefectRecords = defectRecordsData.map(d => {
        const machine = masterData.machines.find(m => m.id === d.machine_id)!;
        const shift = masterData.shifts.find(s => s.id === d.shift_id)!;
        const defectType = masterData.defectTypes.find(dt => dt.id === d.defect_type_id)!;
        const cause = masterData.defectCauses.find(c => c.id === d.cause_id);
        const reporter = masterData.users.find(u => u.id === d.reporter_id)!;
        return {
            ...d,
            MACHINE_ID: machine.MACHINE_ID,
            SHIFT: shift.code,
            defect_type_name: defectType.name,
            cause_category: cause?.category || null,
            reporter_name: reporter.full_name,
            image_urls: d.image_urls || [],
        };
    });

    const filteredDefectRecords = allDefectRecords.filter(d => {
        const date = new Date(d.work_date);
        const machine = masterData.machines.find(m => m.id === d.machine_id);
        return date >= start && date <= end &&
               machine && relevantMachineIds.includes(machine.MACHINE_ID) &&
               (shift === 'all' || d.SHIFT === shift);
    });
    
    const allMaintenanceOrders = maintenanceOrdersData.map(order => {
        const parts = maintenancePartUsagesData
            .filter(p => p.order_id === order.id)
            .map(p => {
                const partInfo = masterData.spareParts.find(sp => sp.id === p.part_id);
                return { ...p, part_code: partInfo?.part_code || 'N/A', part_name: partInfo?.name || 'N/A' };
            });
        const machine = masterData.machines.find(m => m.id === order.machine_id);
        const createdBy = masterData.users.find(u => u.id === order.created_by_id);
        const assignedTo = masterData.users.find(u => u.id === order.assigned_to_id);
        return {
            ...order,
            MACHINE_ID: machine?.MACHINE_ID || 'N/A',
            created_by_name: createdBy?.full_name || 'N/A',
            assigned_to_name: assignedTo?.full_name || null,
            parts_used: parts
        };
    });
    
    const allErrorReports = errorReportsData.map(report => {
        const machine = masterData.machines.find(m => m.id === report.machine_id)!;
        const line = masterData.machines.find(m => m.MACHINE_ID === machine.MACHINE_ID)?.LINE_ID || 'N/A';
        const shift = masterData.shifts.find(s => s.id === report.shift_id)!;
        const operator = masterData.users.find(u => u.id === report.operator_id)!;
        const technician = masterData.users.find(u => u.id === report.technician_id);
        const verifier = masterData.users.find(u => u.id === report.verify_by);
        const images = errorImagesData.filter(i => i.error_id === report.id);
        const history = errorHistoryData
            .filter(h => h.error_id === report.id)
            .map(h => ({...h, changed_by_name: masterData.users.find(u => u.id === h.changed_by)?.full_name || 'System' }))
            .sort((a,b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
        
        return {
            ...report,
            MACHINE_ID: machine.MACHINE_ID,
            LINE_ID: line,
            SHIFT_CODE: shift.code,
            operator_name: operator.full_name,
            technician_name: technician?.full_name || null,
            verifier_name: verifier?.full_name || null,
            images,
            history
        };
    });


    // --- Calculations ---

    // --- Summary ---
    const totalProduction = filteredProduction.reduce((sum, p) => sum + p.ACT_PRO_QTY, 0);
    const totalDefects = filteredProduction.reduce((sum, p) => sum + p.DEFECT_QTY, 0);
    const totalDowntime = filteredProduction.reduce((sum, p) => sum + p.DOWNTIME_MIN, 0);
    const totalPlannedTime = filteredProduction.length * 480; // 8 hours * 60 min
    const machineUtilization = totalPlannedTime > 0 ? (totalPlannedTime - totalDowntime) / totalPlannedTime : 0;
    
    const validOeeRecords = filteredProduction.filter(p => p.OEE > 0 && p.OEE <= 1);
    const avgOee = validOeeRecords.length > 0 ? validOeeRecords.reduce((sum, p) => sum + p.OEE, 0) / validOeeRecords.length : 0;
    const avgAvailability = validOeeRecords.length > 0 ? validOeeRecords.reduce((sum, p) => sum + (p.availability ?? 0), 0) / validOeeRecords.length : 0;
    const avgPerformance = validOeeRecords.length > 0 ? validOeeRecords.reduce((sum, p) => sum + (p.performance ?? 0), 0) / validOeeRecords.length : 0;
    const avgQuality = validOeeRecords.length > 0 ? validOeeRecords.reduce((sum, p) => sum + (p.quality ?? 0), 0) / validOeeRecords.length : 0;
    
    const defectRate = (totalProduction + totalDefects) > 0 ? totalDefects / (totalProduction + totalDefects) : 0;

    const productionByLine = relevantLines.map(lineId => {
        const lineProduction = filteredProduction.filter(p => p.LINE_ID === lineId).reduce((sum, p) => sum + p.ACT_PRO_QTY, 0);
        return { name: lineId, value: lineProduction };
    });
    
    const oeeByLine = relevantLines.map(lineId => {
        const lineRecords = validOeeRecords.filter(p => p.LINE_ID === lineId);
        const lineOee = lineRecords.length > 0 ? lineRecords.reduce((sum, p) => sum + p.OEE, 0) / lineRecords.length : 0;
        return { name: lineId, value: lineOee };
    });

    // --- Performance ---
    const sevenDayTrend: TrendData[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayRecords = filteredProduction.filter(p => p.COMP_DAY === dateStr);
        const dayOee = dayRecords.length > 0 ? dayRecords.reduce((sum, p) => sum + p.OEE, 0) / dayRecords.length : null;
        const dayA = dayRecords.length > 0 ? dayRecords.reduce((sum, p) => sum + (p.availability ?? 0), 0) / dayRecords.length : null;
        const dayP = dayRecords.length > 0 ? dayRecords.reduce((sum, p) => sum + (p.performance ?? 0), 0) / dayRecords.length : null;
        const dayQ = dayRecords.length > 0 ? dayRecords.reduce((sum, p) => sum + (p.quality ?? 0), 0) / dayRecords.length : null;
        sevenDayTrend.push({ date: dateStr.slice(5), oee: dayOee, availability: dayA, performance: dayP, quality: dayQ });
    }
    
    const productionBoxplot: BoxplotDataPoint[] = relevantLines.map(lineId => {
        const lineData = filteredProduction.filter(p => p.LINE_ID === lineId).map(p => p.ACT_PRO_QTY);
        if (lineData.length === 0) return { name: lineId, min: 0, q1: 0, median: 0, q3: 0, max: 0 };
        lineData.sort((a,b) => a - b);
        return {
            name: lineId,
            min: Math.min(...lineData),
            q1: quantile(lineData, 0.25),
            median: quantile(lineData, 0.5),
            q3: quantile(lineData, 0.75),
            max: Math.max(...lineData),
        }
    });
    
    const oeeHeatmap: HeatmapDataPoint[] = [];
    relevantLines.forEach(lineId => {
        ['A', 'B', 'C'].forEach(shiftCode => {
            const shiftRecords = validOeeRecords.filter(p => p.LINE_ID === lineId && p.SHIFT === shiftCode);
            const value = shiftRecords.length > 0 ? shiftRecords.reduce((sum, p) => sum + p.OEE, 0) / shiftRecords.length : 0;
            oeeHeatmap.push({ line: lineId, shift: shiftCode, value });
        });
    });

    // --- Quality ---
    const defectsByType: { [key: string]: number } = {};
    filteredDefectRecords.forEach(record => {
        const type = masterData.defectTypes.find(t => t.id === record.defect_type_id);
        const typeName = type ? type.name : 'Unknown';
        defectsByType[typeName] = (defectsByType[typeName] || 0) + record.quantity;
    });

    const defectParetoData = Object.entries(defectsByType)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const totalDefectsPareto = defectParetoData.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;
    const defectPareto = defectParetoData.map(item => {
        cumulative += item.value;
        return {
            ...item,
            cumulative: totalDefectsPareto > 0 ? (cumulative / totalDefectsPareto) * 100 : 0,
        };
    });

    const defectsByRootCause: { [key: string]: number } = {};
    filteredDefectRecords.forEach(record => {
        const cause = masterData.defectCauses.find(c => c.id === record.cause_id);
        const category = cause ? cause.category : 'Unknown';
        defectsByRootCause[category] = (defectsByRootCause[category] || 0) + record.quantity;
    });

    const defectsByCauseForPareto: { [key: string]: number } = {};
    filteredDefectRecords.forEach(record => {
        const cause = masterData.defectCauses.find(c => c.id === record.cause_id);
        const category = cause ? cause.category : 'Unknown';
        defectsByCauseForPareto[category] = (defectsByCauseForPareto[category] || 0) + record.quantity;
    });

    const defectCauseParetoData = Object.entries(defectsByCauseForPareto)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const totalDefectsByCause = defectCauseParetoData.reduce((sum, item) => sum + item.value, 0);
    let cumulativeDefectCause = 0;
    const defectCausePareto = defectCauseParetoData.map(item => {
        cumulativeDefectCause += item.value;
        return {
            ...item,
            cumulative: totalDefectsByCause > 0 ? (cumulativeDefectCause / totalDefectsByCause) * 100 : 0,
        };
    });
    
    const defectTrendData: { [date: string]: { totalDefects: number, totalProduction: number } } = {};
    filteredProduction.forEach(p => {
        if (!defectTrendData[p.COMP_DAY]) {
            defectTrendData[p.COMP_DAY] = { totalDefects: 0, totalProduction: 0 };
        }
        defectTrendData[p.COMP_DAY].totalDefects += p.DEFECT_QTY;
        defectTrendData[p.COMP_DAY].totalProduction += p.ACT_PRO_QTY;
    });

    const defectTrend = Object.entries(defectTrendData)
        .map(([date, values]) => ({
            date: date.slice(5),
            totalDefects: values.totalDefects,
        })).sort((a,b) => a.date.localeCompare(b.date));
        
    const defectRateTrend = Object.entries(defectTrendData)
        .map(([date, values]) => ({
            date: date.slice(5),
            defectRate: (values.totalProduction + values.totalDefects) > 0 ? values.totalDefects / (values.totalProduction + values.totalDefects) : 0,
        })).sort((a,b) => a.date.localeCompare(b.date));
        
    const top5DefectLines: Top5DefectLine[] = relevantLines.map(lineId => {
        const lineRecords = filteredProduction.filter(p => p.LINE_ID === lineId);
        const totalProduction = lineRecords.reduce((sum, p) => sum + p.ACT_PRO_QTY, 0);
        const totalDefects = lineRecords.reduce((sum, p) => sum + p.DEFECT_QTY, 0);
        const defectRate = (totalProduction + totalDefects) > 0 ? totalDefects / (totalProduction + totalDefects) : 0;
        return { lineId, totalProduction, totalDefects, defectRate };
    }).sort((a,b) => b.defectRate - a.defectRate).slice(0, 5);
    
    // --- Downtime ---
    const downtimeByReason: { [key: string]: number } = {};
    filteredDowntime.forEach(record => {
      downtimeByReason[record.DOWNTIME_REASON] = (downtimeByReason[record.DOWNTIME_REASON] || 0) + record.DOWNTIME_MIN;
    });

    const downtimeParetoData = Object.entries(downtimeByReason)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const totalDowntimePareto = downtimeParetoData.reduce((sum, item) => sum + item.value, 0);
    let cumulativeDowntime = 0;
    const downtimePareto = downtimeParetoData.map(item => {
      cumulativeDowntime += item.value;
      return {
        ...item,
        cumulative: totalDowntimePareto > 0 ? (cumulativeDowntime / totalDowntimePareto) * 100 : 0,
      };
    });
    
    const downtimeByDay: { [date: string]: number } = {};
    filteredDowntime.forEach(d => {
        downtimeByDay[d.COMP_DAY] = (downtimeByDay[d.COMP_DAY] || 0) + d.DOWNTIME_MIN;
    });
    const downtimeTrend = Object.entries(downtimeByDay)
        .map(([date, value]) => ({ date: date.slice(5), downtime: value }))
        .sort((a,b) => a.date.localeCompare(b.date));
        
    const top5DowntimeMachines: Top5DowntimeMachine[] = relevantMachineIds.map(machineId => {
        const machineDowntime = filteredDowntime.filter(d => d.MACHINE_ID === machineId).reduce((sum, d) => sum + d.DOWNTIME_MIN, 0);
        return { machineId, totalDowntime: machineDowntime };
    }).sort((a,b) => b.totalDowntime - a.totalDowntime).slice(0, 5);
    
    const downtimeByLineData: { [lineId: string]: { [reason: string]: number } } = {};
    const uniqueDowntimeReasons = [...new Set(filteredDowntime.map(d => d.DOWNTIME_REASON))].sort();
    
    filteredDowntime.forEach(d => {
        const machine = masterData.machines.find(m => m.MACHINE_ID === d.MACHINE_ID);
        if (machine) {
            const lineId = machine.LINE_ID;
            if (!downtimeByLineData[lineId]) downtimeByLineData[lineId] = {};
            downtimeByLineData[lineId][d.DOWNTIME_REASON] = (downtimeByLineData[lineId][d.DOWNTIME_REASON] || 0) + d.DOWNTIME_MIN;
        }
    });
    const downtimeByLine: StackedBarDataPoint[] = relevantLines.map(lineId => {
        const lineData: StackedBarDataPoint = { name: lineId };
        uniqueDowntimeReasons.forEach(reason => {
            lineData[reason] = downtimeByLineData[lineId]?.[reason] || 0;
        });
        return lineData;
    });
    
    const downtimeVsProduction: ScatterDataPoint[] = relevantMachines.map(machine => {
        const production = filteredProduction.filter(p => p.MACHINE_ID === machine.MACHINE_ID).reduce((sum, p) => sum + p.ACT_PRO_QTY, 0);
        const downtime = filteredDowntime.filter(d => d.MACHINE_ID === machine.MACHINE_ID).reduce((sum, d) => sum + d.DOWNTIME_MIN, 0);
        return { production, downtime, machineId: machine.MACHINE_ID, lineId: machine.LINE_ID };
    });

    // --- Maintenance ---
    const machineStats = calculateMachineMaintenanceStats(filteredDowntime, masterData.machines);
    const downtimeAnalysis = analyzeDowntimeCauses(filteredDowntime);
    const maintenanceKpis = calculateOverallMaintenanceKpis(machineStats);
    const maintenanceTrend = calculateMaintenanceTrend(end, filteredDowntime, masterData.machines);

    const today = new Date('2025-10-30'); // Mocked "today" for consistent demo
    const pmSchedule = maintenanceSchedulesData.map(s => {
        const lastPm = new Date(s.last_pm_date);
        const nextPm = new Date(lastPm.setDate(lastPm.getDate() + s.cycle_days));
        const diffDays = (nextPm.getTime() - today.getTime()) / (1000 * 3600 * 24);
        let status: 'On schedule' | 'Due soon' | 'Overdue' = 'On schedule';
        if (diffDays < 0) status = 'Overdue';
        else if (diffDays <= 7) status = 'Due soon';
        
        const machine = masterData.machines.find(m => m.id === s.machine_id);
        return {
            ...s,
            MACHINE_ID: machine?.MACHINE_ID || 'N/A',
            MACHINE_NAME: machine?.MACHINE_NAME || 'N/A',
            next_pm_date: nextPm.toISOString().slice(0, 10),
            status,
        };
    });
    
    // --- Purchasing ---
    // For simplicity, we are not filtering purchase requests by date range in this mock
    const mcPartRequests = [...mcPartPurchaseRequestsData];
    const consumableRequests = [...consumablePurchaseRequestsData];

    // --- Machine Status for Shop Floor ---
    const machineStatus: MachineStatusData[] = machineInfoData.map(m => {
        const latestRecord = filteredProduction
            .filter(p => p.MACHINE_ID === m.MACHINE_ID)
            .sort((a,b) => new Date(b.COMP_DAY).getTime() - new Date(a.COMP_DAY).getTime())[0];
            
        let status: 'Running' | 'Stopped' | 'Error' | 'Inactive' = 'Inactive';
        if (m.STATUS === 'active') {
            const hasRecentError = allErrorReports.some(r => r.MACHINE_ID === m.MACHINE_ID && (r.status === 'Reported' || r.status === 'In Progress'));
            const hasRecentDowntime = filteredDowntime.some(d => d.MACHINE_ID === m.MACHINE_ID && d.DOWNTIME_MIN > 60);

            if (hasRecentError) {
                status = 'Error';
            } else if (hasRecentDowntime) {
                status = 'Stopped';
            } else {
                status = 'Running';
            }
        }
        
        return {
            machineId: m.MACHINE_ID,
            status: status,
            oee: latestRecord ? latestRecord.OEE : null,
            lineId: m.LINE_ID,
        };
    });

    return {
        productionLog: filteredProduction,
        downtimeRecords: filteredDowntime,
        allMachineInfo: machineInfoData,
        errorReports: allErrorReports.filter(r => relevantMachineIds.includes(r.MACHINE_ID)),
        allDefectRecords: allDefectRecords.filter(d => {
            const machine = masterData.machines.find(m => m.id === d.machine_id);
            return machine && relevantMachineIds.includes(machine.MACHINE_ID);
        }),
        maintenanceOrders: allMaintenanceOrders.filter(o => {
            const machine = masterData.machines.find(m => m.id === o.machine_id);
            return machine && relevantMachineIds.includes(machine.MACHINE_ID);
        }),
        availableLines: [...new Set(machineInfoData.map(m => m.LINE_ID))],
        availableMachines: machineInfoData.map(m => m.MACHINE_ID),
        masterData,
        machineStatus,
        summary: {
            totalProduction,
            totalDefects,
            totalDowntime,
            machineUtilization,
            avgOee,
            avgAvailability,
            avgPerformance,
            avgQuality,
            defectRate,
            productionByLine,
            oeeByLine,
        },
        performance: {
            sevenDayTrend,
            productionBoxplot,
            oeeHeatmap,
        },
        quality: {
            defectPareto,
            defectRateTrend,
            defectTrend,
            top5DefectLines,
            defectsByRootCause: Object.entries(defectsByRootCause).map(([name, value]) => ({ name, value })),
            defectCausePareto,
            defectRecordsForPeriod: filteredDefectRecords,
        },
        downtime: {
            downtimePareto,
            downtimeTrend,
            downtimeByCategory: [], // placeholder
            top5DowntimeMachines,
            downtimeByLine,
            uniqueDowntimeReasons,
            downtimeVsProduction,
        },
        maintenance: {
            kpis: maintenanceKpis,
            schedule: {
                overdue: allMaintenanceOrders.filter(o => o.type === 'PM' && o.status === 'Open' && new Date(o.plan_date) < today),
                dueSoon: allMaintenanceOrders.filter(o => o.type === 'PM' && o.status === 'Open' && new Date(o.plan_date) >= today && (new Date(o.plan_date).getTime() - today.getTime()) / (1000*3600*24) <= 7),
            },
            pmSchedule,
            spareParts: sparePartsData,
            lowStockParts: sparePartsData.filter(p => (p.available + p.in_transit) < p.reorder_point),
            mcPartOrders: mcPartOrdersData,
            machineStats,
            downtimeAnalysis,
            trend: maintenanceTrend,
        },
        benchmarking: {
            oeeByLine: oeeByLine,
            targets: [
                { id: 1, level: 'Line', line_id: '31', target_oee: 0.85, target_output: 20000, target_defect_rate: 0.02, effective_from: '2025-01-01', effective_to: null },
                { id: 2, level: 'Line', line_id: '32', target_oee: 0.90, target_output: 45000, target_defect_rate: 0.015, effective_from: '2025-01-01', effective_to: null },
                { id: 3, level: 'Line', line_id: '51', target_oee: 0.88, target_output: 15000, target_defect_rate: 0.025, effective_from: '2025-01-01', effective_to: null },
            ],
        },
        purchasing: {
            mcPartRequests,
            consumableRequests,
        }
    };
};

// --- Maintenance Calculation Helpers ---

function calculateMachineMaintenanceStats(downtimeRecords: DowntimeRecord[], allMachines: MachineInfo[]): MachineMaintenanceStats[] {
    const breakdownReasons = ['Mechanical', 'Electrical'];
    const machineStats: Record<string, { breakdownCount: number, totalDowntime: number }> = {};

    downtimeRecords.forEach(record => {
        if (!machineStats[record.MACHINE_ID]) {
            machineStats[record.MACHINE_ID] = { breakdownCount: 0, totalDowntime: 0 };
        }
        if (breakdownReasons.includes(record.DOWNTIME_REASON)) {
            machineStats[record.MACHINE_ID].breakdownCount++;
        }
        machineStats[record.MACHINE_ID].totalDowntime += record.DOWNTIME_MIN;
    });

    return allMachines.map(machine => {
        const stats = machineStats[machine.MACHINE_ID] || { breakdownCount: 0, totalDowntime: 0 };
        const mttr = stats.breakdownCount > 0 ? stats.totalDowntime / stats.breakdownCount : 0;
        const totalOperatingHours = (20 * 8); // Assuming 20 days, 8 hours/day for simplicity
        const mtbf = stats.breakdownCount > 0 ? (totalOperatingHours - (stats.totalDowntime / 60)) / stats.breakdownCount : totalOperatingHours;

        let status: 'Alert' | 'Warning' | 'Normal' = 'Normal';
        if (mttr > 60 || stats.breakdownCount > 5) {
            status = 'Alert';
        } else if (mttr > 30 || stats.breakdownCount > 2) {
            status = 'Warning';
        }

        return {
            machineId: machine.MACHINE_ID,
            mtbf: mtbf > 0 ? mtbf : 0,
            mttr,
            breakdownCount: stats.breakdownCount,
            totalDowntime: stats.totalDowntime,
            status,
        };
    }).sort((a, b) => b.breakdownCount - a.breakdownCount);
}

function calculateOverallMaintenanceKpis(machineStats: MachineMaintenanceStats[]): MaintenanceKpis {
    const totalBreakdowns = machineStats.reduce((sum, s) => sum + s.breakdownCount, 0);
    const totalDowntime = machineStats.reduce((sum, s) => sum + s.totalDowntime, 0);
    const totalMtbf = machineStats.reduce((sum, s) => sum + s.mtbf, 0);
    
    return {
        mtbf: machineStats.length > 0 ? totalMtbf / machineStats.length : 0,
        mttr: totalBreakdowns > 0 ? totalDowntime / totalBreakdowns : 0,
        breakdownCount: totalBreakdowns,
        topMttrMachines: machineStats.sort((a,b) => b.mttr - a.mttr).slice(0, 5).map(m => ({name: m.machineId, value: m.mttr}))
    };
}

function analyzeDowntimeCauses(downtimeRecords: DowntimeRecord[]): DowntimeCauseStats[] {
    const causeStats: Record<string, { count: number, totalMinutes: number, machineImpact: Record<string, number> }> = {};

    downtimeRecords.forEach(record => {
        if (!causeStats[record.DOWNTIME_REASON]) {
            causeStats[record.DOWNTIME_REASON] = { count: 0, totalMinutes: 0, machineImpact: {} };
        }
        causeStats[record.DOWNTIME_REASON].count++;
        causeStats[record.DOWNTIME_REASON].totalMinutes += record.DOWNTIME_MIN;
        causeStats[record.DOWNTIME_REASON].machineImpact[record.MACHINE_ID] = (causeStats[record.DOWNTIME_REASON].machineImpact[record.MACHINE_ID] || 0) + record.DOWNTIME_MIN;
    });

    return Object.entries(causeStats).map(([reason, stats]) => {
        const mainMachineImpact = Object.entries(stats.machineImpact).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
        return {
            reason,
            ...stats,
            mainMachineImpact
        };
    }).sort((a,b) => b.totalMinutes - a.totalMinutes);
}

function calculateMaintenanceTrend(endDate: Date, downtimeRecords: DowntimeRecord[], allMachines: MachineInfo[]): { date: string, mtbf?: number, mttr?: number }[] {
    const trend: { date: string, mtbf?: number, mttr?: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);

        const dailyDowntime = downtimeRecords.filter(rec => rec.COMP_DAY === dateStr);
        const dailyStats = calculateMachineMaintenanceStats(dailyDowntime, allMachines);
        const dailyKpis = calculateOverallMaintenanceKpis(dailyStats);

        trend.push({
            date: dateStr.slice(5),
            mtbf: dailyKpis.mtbf > 0 ? dailyKpis.mtbf : undefined,
            mttr: dailyKpis.mttr > 0 ? dailyKpis.mttr : undefined,
        });
    }
    return trend;
}
