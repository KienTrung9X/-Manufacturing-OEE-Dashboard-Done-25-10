import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Data and Types
import { 
    getDashboardData, 
    getInitialFilterData, 
    getMachineInfo,
    addErrorReport,
    updateErrorReport,
    addMaintenanceOrder,
    updateMaintenanceOrder,
    addMachine,
    updateMachine,


    addSparePart,
    updateSparePart,
    toggleFlagForOrder,
    getEnrichedSparePartDetails,
    addDefectRecord,
    // FIX: Import LINE_TO_AREA_MAP to resolve 'Cannot find name' error.
    LINE_TO_AREA_MAP,
} from '../services/dataService';
import { DashboardData, EnrichedErrorReport, NewErrorReportData, UpdateErrorData, ErrorReportStatus, NewMaintenanceOrderData, CompleteMaintenanceOrderData, EnrichedDefectRecord, MachineInfo, NewMachineData, SparePart, EnrichedMaintenanceOrder, NewSparePartData, EnrichedMaintenanceSchedule, McPartOrder, EnrichedSparePart, NewDefectData, User, PmType } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

// UI Components
import FilterBar from '../FilterBar';
import KpiCard from './KpiCard';
import OeeGauge from './OeeGauge';
import ProductionLogTable from './ProductionLogTable';
import MachineDetailsModal from './MachineDetailsModal';
import ParetoChart from './ParetoChart';
import SimpleBarChart from '../services/SimpleBarChart';
import TrendChart from '../TrendChart';
import BoxplotChart from './BoxplotChart';
import HeatmapChart from './HeatmapChart';
import Top5Table from './Top5Table';
import StackedBarChart from './StackedBarChart';
import DefectTrendChart from './DefectTrendChart';
import ShopFloorLayout from './ShopFloorLayout';
import HamburgerMenu from './HamburgerMenu';
import HelpModal from './HelpModal';
import DatabaseSchemaPanel from './DatabaseSchemaPanel';
import AiAnalysis from './AiAnalysis';
import ErrorLogTable from './ErrorLogTable';
import MaintenanceDashboard from './MaintenanceDashboard';
import SparePartsInventory from '../SparePartsInventory';
import MaintenanceOrderModal from './MaintenanceOrderModal';
import MachineEditModal from './MachineEditModal';
import SparePartDetailsModal from './SparePartDetailsModal';

import SparePartEditModal from './SparePartEditModal';
// import MaintenanceScheduleView from './MaintenanceSchedule';
import DeploymentChecklistModal from './DeploymentChecklistModal';
import DataEntryModal from './DataEntryModal';
import DefectLogTable from './DefectLogTable';
import BenchmarkDashboard from './BenchmarkDashboard';
import MaintenanceLog from './MaintenanceLog';
import CompleteMaintenanceOrderModal from './CompleteMaintenanceOrderModal';
// FIX: Import missing modal components to resolve 'Cannot find name' errors.
import ErrorReportModal from './ErrorReportModal';
import DefectDetailsModal from './DefectDetailsModal';


// Icons
import { LayoutDashboard, BarChart3, ShieldAlert, AlertTriangle, ListChecks, Database, HelpCircle, PlusCircle, Grid, Wrench, PackageSearch, Sun, Moon, Languages, Loader2, CalendarClock, Truck, CheckCircle, ClipboardList, Package, ListOrdered, LayoutGrid } from 'lucide-react';

type Tab = 'shopFloor' | 'overview' | 'errorLog' | 'maintenance';
type OverviewSubTab = 'summary' | 'performance' | 'quality' | 'downtime' | 'benchmarking';
type MaintenanceSubTab = 'dashboard' | 'mcPartInventory' | 'purchaseOrders' | 'pmSchedule' | 'maintenanceLog';

type ErrorLogSubTab = 'errorReports' | 'defectLog';

// --- START OF IN-FILE PURCHASING COMPONENTS ---

interface McPartPurchaseOrdersProps {
    orders: McPartOrder[];
    t: (key: any) => string;
}

const McPartPurchaseOrders: React.FC<McPartPurchaseOrdersProps> = ({ orders, t }) => {
    const getStatusChip = (status: McPartOrder['status']) => {
        const styles: Record<McPartOrder['status'], string> = {
            'In Transit': 'bg-blue-900 text-blue-300',
            'Delayed': 'bg-red-900 text-red-300',
            'Received': 'bg-green-900 text-green-300',
        };
        const icons: Record<McPartOrder['status'], React.ReactNode> = {
            'In Transit': <Truck size={12} className="mr-1.5"/>,
            'Delayed': <AlertTriangle size={12} className="mr-1.5"/>,
            'Received': <CheckCircle size={12} className="mr-1.5"/>,
        };
        const translatedStatus = t(status.replace(/\s/g, '_') as any);
        return (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
                {icons[status]}
                {translatedStatus || status}
            </span>
        );
    };
    
    return (
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4 border-l-4 border-cyan-400 pl-3">{t('purchaseOrders')}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left">{t('area')}</th>
                            <th className="py-3 px-4 text-left">{t('orderId')}</th>
                            <th className="py-3 px-4 text-left">{t('itemName')}</th>
                            <th className="py-3 px-4 text-left">{t('quantity')}</th>
                            <th className="py-3 px-4 text-left">{t('orderDate')}</th>
                            <th className="py-3 px-4 text-left">{t('expectedDate')}</th>
                            <th className="py-3 px-4 text-left">{t('supplier')}</th>
                            <th className="py-3 px-4 text-left">{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {orders.length > 0 ? orders.map(req => (
                            <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="py-3 px-4">{req.area}</td>
                                <td className="py-3 px-4 font-mono">{req.order_id}</td>
                                <td className="py-3 px-4">{req.item_name}</td>
                                <td className="py-3 px-4">{req.qty_order}</td>
                                <td className="py-3 px-4">{req.order_date}</td>
                                <td className="py-3 px-4">{req.expected_date}</td>
                                <td className="py-3 px-4">{req.supplier}</td>
                                <td className="py-3 px-4">{getStatusChip(req.status)}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={8} className="text-center py-8 text-gray-500">{t('noMcPartRequests')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};







// --- END OF IN-FILE PURCHASING COMPONENTS ---

// --- START OF IN-FILE MAINTENANCE SCHEDULE COMPONENT ---

interface MaintenanceScheduleProps {
  schedule: EnrichedMaintenanceSchedule[];
  onCreateWorkOrder: (scheduleItem: EnrichedMaintenanceSchedule) => void;
  initialFilter: 'all' | 'Overdue' | 'Due soon' | 'On schedule';
}

type SortKey = keyof EnrichedMaintenanceSchedule;
type SortDirection = 'ascending' | 'descending';

const MaintenanceScheduleView: React.FC<MaintenanceScheduleProps> = ({ schedule, onCreateWorkOrder, initialFilter }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Overdue' | 'Due soon' | 'On schedule'>(initialFilter);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'next_pm_date', direction: 'ascending' });

    useEffect(() => {
        setStatusFilter(initialFilter);
    }, [initialFilter]);

    const requestSort = (key: SortKey) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
        }));
    };

    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) return <span className="opacity-20 group-hover:opacity-100">↕</span>;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    const filteredAndSortedSchedule = useMemo(() => {
        const filtered = schedule.filter(item =>
            (searchTerm === '' || item.MACHINE_ID.toLowerCase().includes(searchTerm.toLowerCase()) || item.MACHINE_NAME.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (statusFilter === 'all' || item.status === statusFilter)
        );

        return filtered.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            let comparison = 0;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal;
            } else {
                comparison = String(aVal).localeCompare(String(bVal));
            }
            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        });
    }, [schedule, searchTerm, statusFilter, sortConfig]);

    const getStatusChip = (status: 'On schedule' | 'Due soon' | 'Overdue') => {
        const styles: Record<string, string> = {
            'Overdue': 'bg-red-900 text-red-300',
            'Due soon': 'bg-yellow-900 text-yellow-300',
            'On schedule': 'bg-green-900 text-green-300',
        };
        const keyMap = {
            'Overdue': 'overdue',
            'Due soon': 'dueSoon',
            'On schedule': 'onSchedule'
        };
        const translationKey = keyMap[status];
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{t(translationKey as any) || status}</span>;
    };

    const headers: { key: SortKey; label: string }[] = [
        { key: 'MACHINE_ID', label: t('machine') },
        { key: 'pm_type', label: t('pmType') },
        { key: 'last_pm_date', label: t('lastPmDate') },
        { key: 'next_pm_date', label: t('nextPmDate') },
        { key: 'cycle_days', label: t('cycle') },
        { key: 'status', label: t('status') },
    ];

    return (
        <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4 border-l-4 border-cyan-400 pl-3">{t('pmSchedule')}</h2>
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                 <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder={t('searchMachineLine')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                     <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="all">{t('all')} {t('status')}</option>
                        <option value="Overdue">{t('overdue')}</option>
                        <option value="Due soon">{t('dueSoon')}</option>
                        <option value="On schedule">{t('onSchedule')}</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700/50">
                            <tr>
                                {headers.map(header => (
                                     <th key={header.key} className="p-3 text-left">
                                        <button onClick={() => requestSort(header.key)} className="group flex items-center gap-2">
                                            {header.label}
                                            <span className="text-cyan-400">{getSortIcon(header.key)}</span>
                                        </button>
                                    </th>
                                ))}
                                <th className="p-3 text-left">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredAndSortedSchedule.map(item => (
                                <tr key={item.id} className="hover:bg-gray-700/50">
                                    <td className="p-3">
                                        <div className="font-semibold">{item.MACHINE_ID}</div>
                                        <div className="text-xs text-gray-400">{item.MACHINE_NAME}</div>
                                    </td>
                                    <td className="p-3 font-mono">{item.pm_type}</td>
                                    <td className="p-3">{item.last_pm_date}</td>
                                    <td className="p-3 font-semibold">{item.next_pm_date}</td>
                                    <td className="p-3">{item.cycle_days} {t('days')}</td>
                                    <td className="p-3">{getStatusChip(item.status)}</td>
                                    <td className="p-3">
                                        {(item.status === 'Overdue' || item.status === 'Due soon') && (
                                            <button 
                                                onClick={() => onCreateWorkOrder(item)}
                                                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-1.5 px-3 rounded-md flex items-center gap-2"
                                            >
                                                <Wrench size={14} />
                                                {t('createNewOrder')}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredAndSortedSchedule.length === 0 && (
                        <div className="text-center p-8 text-gray-500">{t('noRecordsMatchFilter')}</div>
                    )}
                </div>
            </div>
        </section>
    );
};

// --- END OF IN-FILE MAINTENANCE SCHEDULE COMPONENT ---


const App: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [activeTab, setActiveTab] = useState<Tab>('shopFloor');
  const [activeOverviewSubTab, setActiveOverviewSubTab] = useState<OverviewSubTab>('summary');
  const [activeMaintenanceSubTab, setActiveMaintenanceSubTab] = useState<MaintenanceSubTab>('dashboard');

  const [activeErrorLogSubTab, setActiveErrorLogSubTab] = useState<ErrorLogSubTab>('errorReports');
  const [pmScheduleInitialFilter, setPmScheduleInitialFilter] = useState<'all' | 'Overdue' | 'Due soon' | 'On schedule'>('all');
  const [lineToAreaMap, setLineToAreaMap] = useState(LINE_TO_AREA_MAP);


  // Modal states
  const [isMachineDetailsModalOpen, setIsMachineDetailsModalOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDbSchemaPanelOpen, setIsDbSchemaPanelOpen] = useState(false);
  const [isErrorReportModalOpen, setIsErrorReportModalOpen] = useState(false);
  const [reportToUpdate, setReportToUpdate] = useState<EnrichedErrorReport | null>(null);
  const [isMaintenanceOrderModalOpen, setIsMaintenanceOrderModalOpen] = useState(false);
  const [isMachineEditModalOpen, setIsMachineEditModalOpen] = useState(false);
  const [machineToEdit, setMachineToEdit] = useState<MachineInfo | null>(null);
  const [machineDefaults, setMachineDefaults] = useState<Partial<NewMachineData> | undefined>(undefined);
  const [isSparePartDetailsModalOpen, setIsSparePartDetailsModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);


  const [isSparePartEditModalOpen, setIsSparePartEditModalOpen] = useState(false);
  const [partToEdit, setPartToEdit] = useState<SparePart | null>(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [isDataEntryModalOpen, setIsDataEntryModalOpen] = useState(false);
  const [isDefectDetailsModalOpen, setIsDefectDetailsModalOpen] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<EnrichedDefectRecord | null>(null);
  const [highlightedDefectInLog, setHighlightedDefectInLog] = useState<{ date: string; machineId: string; shift: 'A' | 'B' | 'C' } | null>(null);
  const [isCompleteMaintOrderModalOpen, setIsCompleteMaintOrderModalOpen] = useState(false);
  const [orderToComplete, setOrderToComplete] = useState<EnrichedMaintenanceOrder | null>(null);
  const [maintenanceOrderDefaults, setMaintenanceOrderDefaults] = useState<Partial<NewMaintenanceOrderData> | undefined>(undefined);
  const [errorReportDefaults, setErrorReportDefaults] = useState<Partial<NewErrorReportData> | undefined>(undefined);


  // Initial filters from service
  const initialFilters = useMemo(() => {
    const { defaultDate, defaultArea } = getInitialFilterData();
    return {
      startDate: defaultDate,
      endDate: defaultDate,
      area: defaultArea,
      shift: 'all' as const,
      mode: 'single' as const,
      status: 'all' as const,
    };
  }, []);

  const [filters, setFilters] = useState(initialFilters);
  
  const [thresholds, setThresholds] = useState({
    oee: 80,
    availability: 90,
    performance: 95,
    quality: 99,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getDashboardData(
        filters.startDate,
        filters.endDate,
        filters.area,
        filters.shift,
        filters.status,
      );
      setData(result);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Theme management
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Reset PM schedule filter when navigating away
  useEffect(() => {
    if (activeMaintenanceSubTab !== 'pmSchedule') {
      setPmScheduleInitialFilter('all');
    }
  }, [activeMaintenanceSubTab]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const handleClearFilters = () => {
    setFilters(initialFilters);
  };
  
  const handleThresholdChange = (newThresholds: Partial<typeof thresholds>) => {
      setThresholds(prev => ({ ...prev, ...newThresholds }));
  };

  const handleMachineSelect = (machineId: string) => {
    setSelectedMachineId(machineId);
    setIsMachineDetailsModalOpen(true);
  };
  
  const handleUpdateAreaName = (oldAreaName: string, newAreaName: string) => {
    if (Object.values(lineToAreaMap).includes(newAreaName)) {
        alert(`Area name "${newAreaName}" already exists.`);
        return;
    }
    setLineToAreaMap(prevMap => {
        const newMap = { ...prevMap };
        for (const lineId in newMap) {
            if (newMap[lineId] === oldAreaName) {
                newMap[lineId] = newAreaName;
            }
        }
        return newMap;
    });
};

const handleAddNewAreaSubmit = (newAreaName: string, newLineId: string) => {
    // Validation is handled in the modal, but double-checking here is safe.
    if (Object.values(lineToAreaMap).some(name => name.toLowerCase() === newAreaName.trim().toLowerCase()) || lineToAreaMap[newLineId.trim()]) {
        console.error("Attempted to add duplicate area name or line ID.");
        return false;
    }
    
    // Update the "backend" map in the mock service.
    LINE_TO_AREA_MAP[newLineId.trim()] = newAreaName.trim();

    // Update the local state to trigger a UI refresh.
    setLineToAreaMap(prev => ({
        ...prev,
        [newLineId.trim()]: newAreaName.trim()
    }));
    return true; // Indicate success
};

  // --- START MODAL HANDLERS ---
  const handleOpenUpdateModal = (report: EnrichedErrorReport) => {
    setReportToUpdate(report);
    setIsErrorReportModalOpen(true);
  };
  
  const handleStatusUpdate = (reportId: number, newStatus: ErrorReportStatus) => {
      // In a real app, this would be an API call. Here we simulate it.
      updateErrorReport(reportId, {}, newStatus);
      fetchData(); // Refetch data to update the UI
  };
  
  const handleErrorReportSubmit = (formData: NewErrorReportData) => {
    addErrorReport(formData);
    fetchData(); // Re-fetch to show the new report
    setIsErrorReportModalOpen(false);
  };

  const handleErrorReportUpdate = (reportId: number, updateData: UpdateErrorData, newStatus: ErrorReportStatus) => {
    updateErrorReport(reportId, updateData, newStatus);
    fetchData(); // Re-fetch to show updates
    setIsErrorReportModalOpen(false);
  };
  
  const handleOpenMaintenanceOrderModal = (defaults?: Partial<NewMaintenanceOrderData>) => {
      setMaintenanceOrderDefaults(defaults);
      setIsMaintenanceOrderModalOpen(true);
  };

  const handleMaintenanceOrderSubmit = (formData: NewMaintenanceOrderData) => {
    addMaintenanceOrder(formData);
    fetchData();
    setIsMaintenanceOrderModalOpen(false);
  };
  
  const handleOpenCompleteOrderModal = (order: EnrichedMaintenanceOrder) => {
      setOrderToComplete(order);
      setIsCompleteMaintOrderModalOpen(true);
  };

  const handleCompleteOrderSubmit = (orderId: number, data: CompleteMaintenanceOrderData) => {
    updateMaintenanceOrder(orderId, data);
    fetchData();
    setIsCompleteMaintOrderModalOpen(false);
  };
  
  const handleOpenMachineEditModal = (machine: MachineInfo | null, defaults?: Partial<NewMachineData>) => {
    setMachineToEdit(machine);
    setMachineDefaults(defaults);
    setIsMachineEditModalOpen(true);
  };

  const handleMachineSubmit = (formData: NewMachineData, id: number | null) => {
      if (id) {
          updateMachine(id, formData);
      } else {
          addMachine(formData);
      }
      fetchData();
      setIsMachineEditModalOpen(false);
  };
  
  const handleUpdateMachinePosition = (machineId: number, newPosition: { x: number; y: number }) => {
    updateMachine(machineId, newPosition);
    fetchData();
  };
  
  const handlePartSelect = (part: SparePart) => {
    setSelectedPart(part);
    setIsSparePartDetailsModalOpen(true);
  };
  
  const handleOpenSparePartEditModal = (part: SparePart | null) => {
    setPartToEdit(part);
    setIsSparePartEditModalOpen(true);
  };
  
  const handleSparePartSubmit = (formData: NewSparePartData, id: number | null) => {
      if (id) {
          updateSparePart(id, formData);
      } else {
          addSparePart(formData);
      }
      fetchData();
      setIsSparePartEditModalOpen(false);
  };

  const handleToggleFlagForOrder = (partId: number) => {
      toggleFlagForOrder(partId);
      fetchData();
  };
  

  

  
  const handleDefectRecordSubmit = (formData: NewDefectData): EnrichedDefectRecord => {
    const newRecord = addDefectRecord(formData);
    fetchData();
    // Don't close modal, it handles its own multi-step view.
    return newRecord;
  };
  
  const handleOpenErrorReportFromDefect = (defect: EnrichedDefectRecord) => {
    setIsDataEntryModalOpen(false); // Close the defect modal first
    // Set defaults for the error report modal
    setErrorReportDefaults({
        machine_id: defect.machine_id,
        shift_id: defect.shift_id,
        defect_type: defect.defect_type_name,
        defect_description: defect.note || `Abnormal defect reported: ${defect.defect_type_name}`,
        severity: defect.severity,
        linked_defect_id: defect.id,
        linked_maintenance_order_id: defect.linked_maintenance_order_id,
    });
    // Use a timeout to ensure the state updates and the new modal opens cleanly
    setTimeout(() => setIsErrorReportModalOpen(true), 100);
  };

  const handleNavigateToDefectLog = (date: string, machineId: string, shift: 'A' | 'B' | 'C') => {
    setHighlightedDefectInLog({ date, machineId, shift });
    setActiveTab('errorLog');
    setActiveErrorLogSubTab('defectLog');
  };

  // --- END MODAL HANDLERS ---
  
  const machineDetailsData = useMemo(() => {
    if (!selectedMachineId || !data) return null;
    return {
      machineInfo: data.allMachineInfo.find(m => m.MACHINE_ID === selectedMachineId) || null,
      productionRecord: data.productionLog.find(p => p.MACHINE_ID === selectedMachineId) || null,
      downtimeRecords: data.downtimeRecords.filter(d => d.MACHINE_ID === selectedMachineId),
      errorHistory: data.errorReports.filter(r => r.MACHINE_ID === selectedMachineId),
      maintenanceHistory: data.maintenanceOrders.filter(o => o.MACHINE_ID === selectedMachineId && o.status === 'Done'),
      plannedMaintenance: data.maintenanceOrders.filter(o => o.MACHINE_ID === selectedMachineId && o.status !== 'Done' && o.status !== 'Canceled'),
    };
  }, [selectedMachineId, data]);

  const menuSections = [
    {
      title: t('system'),
      items: [
        { label: t('databaseSchema'), onClick: () => setIsDbSchemaPanelOpen(true), icon: <Database size={16} /> },
        { label: t('helpUserGuide'), onClick: () => setIsHelpModalOpen(true), icon: <HelpCircle size={16} /> },
        { label: t('viewDeploymentChecklist'), onClick: () => setIsChecklistModalOpen(true), icon: <ListChecks size={16} /> },
      ]
    }
  ];

  // Components for tabs
  const TabButton: React.FC<{ tabId: Tab, icon: React.ReactNode, label: string, badge?: number }> = ({ tabId, icon, label, badge }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === tabId
          ? 'bg-cyan-500 text-white shadow-md'
          : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {badge && badge > 0 && (
        <span className="bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse-badge">
          {badge}
        </span>
      )}
    </button>
  );

  const SubTabButton: React.FC<{ tabId: string, currentTab: string, setTab: (id: any) => void, label: string }> = ({ tabId, currentTab, setTab, label }) => (
    <button
      onClick={() => setTab(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        currentTab === tabId
          ? 'bg-cyan-600/20 text-cyan-400'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  );
  
  const enrichedSelectedPart = useMemo(() => {
    if (!selectedPart) return null;
    return getEnrichedSparePartDetails(selectedPart);
  }, [selectedPart]);
  
  const handleCreatePmWorkOrder = (scheduleItem: EnrichedMaintenanceSchedule) => {
      const partsTemplate = data?.masterData.pmPartsTemplates.find(
          t => t.pm_type === scheduleItem.pm_type && (t.machine_id === scheduleItem.machine_id || t.machine_id === 0)
      );
      handleOpenMaintenanceOrderModal({
          machine_id: scheduleItem.machine_id,
          type: 'PM',
          task_description: `PM (${scheduleItem.pm_type}) for ${scheduleItem.MACHINE_ID}`,
          plan_date: scheduleItem.next_pm_date,
          parts_used: partsTemplate?.parts.map(p => ({part_id: p.part_id, qty_used: p.qty}))
      });
  };

  const shouldShowFilterBar = useMemo(() => {
    if (activeTab === 'overview' || activeTab === 'errorLog') {
        return true;
    }
    if (activeTab === 'maintenance') {
        return ['dashboard', 'maintenanceLog'].includes(activeMaintenanceSubTab);
    }
    // 'shopFloor' tab does not need the main filter bar.
    return false;
  }, [activeTab, activeMaintenanceSubTab]);


  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <HamburgerMenu sections={menuSections} />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('dashboardTitle')}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLanguage} className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
            <Languages size={20} />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-white dark:bg-gray-800 p-4 space-y-2 flex-shrink-0 shadow-lg">
          <TabButton tabId="shopFloor" icon={<LayoutGrid size={20} />} label={t('shopFloorTab')} />
          <TabButton tabId="overview" icon={<LayoutDashboard size={20} />} label={t('overviewTab')} />
          <TabButton tabId="errorLog" icon={<ShieldAlert size={20} />} label={t('errorLogTab')} badge={data?.summary.openErrorCount} />
          <TabButton tabId="maintenance" icon={<Wrench size={20} />} label={t('maintenanceTab')} />

        </aside>

        <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
          {shouldShowFilterBar && (
            <FilterBar 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                onClearFilters={handleClearFilters}
                availableAreas={data?.availableLines ? [...new Set(Object.values(lineToAreaMap).filter(Boolean))] : []}
                thresholds={thresholds}
                onThresholdChange={handleThresholdChange}
            />
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
            </div>
          )}
          {error && <div className="text-red-500 text-center">Error: {error}</div>}
          
          {data && !isLoading && (
            <div className="space-y-6">
              {/* Shop Floor Tab */}
              {activeTab === 'shopFloor' && (
                <section>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">{t('shopFloorStatusTitle')}</h2>
                    <ShopFloorLayout 
                        allMachines={data.allMachineInfo} 
                        machineStatus={data.machineStatus}
                        onMachineSelect={handleMachineSelect}
                        onAddMachine={(defaults) => handleOpenMachineEditModal(null, defaults)}
                        onEditMachine={(machine) => handleOpenMachineEditModal(machine)}
                        onUpdateMachinePosition={handleUpdateMachinePosition}
                        areaMap={lineToAreaMap}
                        onUpdateAreaName={handleUpdateAreaName}
                        onAddNewAreaSubmit={handleAddNewAreaSubmit}
                        existingAreaNames={Object.values(lineToAreaMap)}
                        existingLineIds={Object.keys(lineToAreaMap)}
                    />
                </section>
              )}
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                   <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md mb-6 flex items-center justify-start space-x-2">
                        <SubTabButton tabId="summary" currentTab={activeOverviewSubTab} setTab={setActiveOverviewSubTab} label={t('summaryTab')} />
                        <SubTabButton tabId="performance" currentTab={activeOverviewSubTab} setTab={setActiveOverviewSubTab} label={t('performanceTab')} />
                        <SubTabButton tabId="quality" currentTab={activeOverviewSubTab} setTab={setActiveOverviewSubTab} label={t('qualityTab')} />
                        <SubTabButton tabId="downtime" currentTab={activeOverviewSubTab} setTab={setActiveOverviewSubTab} label={t('downtimeTab')} />
                        <SubTabButton tabId="benchmarking" currentTab={activeOverviewSubTab} setTab={setActiveOverviewSubTab} label={t('benchmarkingTab')} />
                   </div>
                   
                   {activeOverviewSubTab === 'summary' && (
                     <div className="space-y-6">
                        <section>
                          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">{t('kpiTitle')}</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <OeeGauge value={data.summary.avgOee} availability={data.summary.avgAvailability} performance={data.summary.avgPerformance} quality={data.summary.avgQuality} theme={theme} oeeThreshold={thresholds.oee} />
                            <KpiCard title={t('totalProduction')} value={data.summary.totalProduction} unit=" units" precision={0} description="Total units produced in the period." />
                            <KpiCard title={t('totalDefects')} value={data.summary.totalDefects} unit=" units" precision={0} description="Total defective units produced." />
                            <KpiCard title={t('totalDowntime')} value={data.summary.totalDowntime} unit=" min" precision={0} description="Total machine downtime in minutes." />
                            <KpiCard title={t('defectRate')} value={data.summary.defectRate} unit="%" precision={2} description="Percentage of defective units." />
                            <KpiCard title={t('machineUtilization')} value={data.summary.machineUtilization} unit="%" precision={1} description="Percentage of planned time machines were running." />
                          </div>
                        </section>
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">{t('productionLogTitle')}</h2>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
                                <ProductionLogTable data={data.productionLog} onMachineSelect={handleMachineSelect} oeeThreshold={thresholds.oee} allDefectTypes={data.masterData.defectTypes} allDefectRecords={data.allDefectRecords} onNavigateToLog={handleNavigateToDefectLog} />
                            </div>
                        </section>
                         <AiAnalysis data={data} filters={filters} />
                     </div>
                   )}
                   
                   {activeOverviewSubTab === 'performance' && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                          <h3 className="text-lg font-semibold mb-4">{t('oeeTrendTitle')}</h3>
                          <TrendChart 
                            data={data.performance.sevenDayTrend}
                            lines={[
                                { dataKey: 'oee', stroke: '#22d3ee', name: 'OEE' },
                                { dataKey: 'availability', stroke: '#818cf8', name: t('availability') },
                                { dataKey: 'performance', stroke: '#f472b6', name: t('performance') },
                                { dataKey: 'quality', stroke: '#34d399', name: t('quality') },
                            ]}
                            isPercentage
                            targetLines={[{ value: thresholds.oee / 100, label: `Target: ${thresholds.oee}%`, stroke: '#f87171' }]}
                            areaLines={['oee']}
                            theme={theme}
                          />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                           <h3 className="text-lg font-semibold mb-4">{t('productionDistributionTitle')}</h3>
                           <BoxplotChart data={data.performance.productionBoxplot} theme={theme} />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                          <h3 className="text-lg font-semibold mb-4">{t('oeeHeatmapTitle')}</h3>
                          <HeatmapChart data={data.performance.oeeHeatmap} theme={theme} />
                        </div>
                     </div>
                   )}
                   
                   {activeOverviewSubTab === 'quality' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-4">{t('defectParetoTitle')}</h3>
                                <ParetoChart data={data.quality.defectPareto} barKey="value" lineKey="cumulative" barColor="#ef4444" lineColor="#f97316" theme={theme} />
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-4">{t('defectsByRootCause')}</h3>
                                <ParetoChart data={data.quality.defectCausePareto} barKey="value" lineKey="cumulative" barColor="#eab308" lineColor="#84cc16" theme={theme} />
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-4">{t('defectCountTrendTitle')}</h3>
                                <DefectTrendChart data={data.quality.defectTrend} theme={theme} />
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-4">{t('defectRateTrendTitle')}</h3>
                                <TrendChart data={data.quality.defectRateTrend} lines={[{ dataKey: 'defectRate', stroke: '#ef4444', name: 'Defect Rate'}]} isPercentage theme={theme} />
                            </div>
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-4">{t('top5DefectsTitle')}</h3>
                                <Top5Table 
                                    headers={[t('line'), 'Total Production', 'Total Defects', 'Defect Rate']} 
                                    data={data.quality.top5DefectLines.map(item => ({
                                        col1: item.lineId,
                                        col2: item.totalProduction.toLocaleString(),
                                        col3: item.totalDefects.toLocaleString(),
                                        col4: `${(item.defectRate * 100).toFixed(2)}%`,
                                    }))} 
                                />
                            </div>
                        </div>
                   )}
                   
                   {activeOverviewSubTab === 'downtime' && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">{t('downtimeParetoTitle')}</h3>
                            <ParetoChart data={data.downtime.downtimePareto} barKey="value" lineKey="cumulative" barColor="#f97316" lineColor="#eab308" theme={theme}/>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">{t('downtimeTrendTitle')}</h3>
                            <TrendChart data={data.downtime.downtimeTrend} lines={[{ dataKey: 'downtime', stroke: '#f97316', name: 'Downtime (min)'}]} theme={theme}/>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                             <h3 className="text-lg font-semibold mb-4">{t('top5DowntimeTitle')}</h3>
                             <Top5Table 
                                headers={[t('machine'), 'Total Downtime (min)']} 
                                data={data.downtime.top5DowntimeMachines.map(item => ({
                                    col1: item.machineId,
                                    col2: item.totalDowntime.toLocaleString()
                                }))} 
                            />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                             <h3 className="text-lg font-semibold mb-4">{t('downtimeByLineTitle')}</h3>
                             <StackedBarChart data={data.downtime.downtimeByLine} keys={data.downtime.uniqueDowntimeReasons} theme={theme} />
                        </div>
                     </div>
                   )}

                   {activeOverviewSubTab === 'benchmarking' && (
                        <BenchmarkDashboard data={data} theme={theme} />
                   )}

                </div>
              )}
              
              {/* Error Log Tab */}
              {activeTab === 'errorLog' && (
                 <section>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md mb-6 flex items-center justify-start space-x-2">
                         <SubTabButton tabId="errorReports" currentTab={activeErrorLogSubTab} setTab={setActiveErrorLogSubTab} label={t('errorReportsSubTab')} />
                         <SubTabButton tabId="defectLog" currentTab={activeErrorLogSubTab} setTab={setActiveErrorLogSubTab} label={t('defectLogTitle')} />
                    </div>
                     {activeErrorLogSubTab === 'errorReports' && (
                        <ErrorLogTable reports={data.errorReports} onOpenUpdateModal={handleOpenUpdateModal} onStatusUpdate={handleStatusUpdate} />
                     )}
                     {activeErrorLogSubTab === 'defectLog' && (
                        <DefectLogTable data={data.allDefectRecords} onViewDetails={(d) => {setSelectedDefect(d); setIsDefectDetailsModalOpen(true);}} highlightedDefect={highlightedDefectInLog} onHighlightComplete={() => setHighlightedDefectInLog(null)} allErrorReports={data.errorReports} onOpenErrorReportFromDefect={handleOpenErrorReportFromDefect} />
                     )}
                 </section>
              )}
              
              {/* Maintenance Tab */}
              {activeTab === 'maintenance' && (
                <div>
                     <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md mb-6 flex items-center justify-start space-x-2">
                        <SubTabButton tabId="dashboard" currentTab={activeMaintenanceSubTab} setTab={setActiveMaintenanceSubTab} label={t('dashboardTitle')} />
                        <SubTabButton tabId="mcPartInventory" currentTab={activeMaintenanceSubTab} setTab={setActiveMaintenanceSubTab} label={t('mcPartInventory')} />
                        <SubTabButton tabId="purchaseOrders" currentTab={activeMaintenanceSubTab} setTab={setActiveMaintenanceSubTab} label={t('purchaseOrders')} />
                        <SubTabButton tabId="pmSchedule" currentTab={activeMaintenanceSubTab} setTab={setActiveMaintenanceSubTab} label={t('pmSchedule')} />
                        <SubTabButton tabId="maintenanceLog" currentTab={activeMaintenanceSubTab} setTab={setActiveMaintenanceSubTab} label={t('maintenanceLog')} />
                    </div>

                    {activeMaintenanceSubTab === 'dashboard' && <MaintenanceDashboard data={data.maintenance} onOpenModal={handleOpenMaintenanceOrderModal} onNavigateToSchedule={(filter) => { setPmScheduleInitialFilter(filter); setActiveMaintenanceSubTab('pmSchedule'); }} theme={theme} />}
                    {activeMaintenanceSubTab === 'mcPartInventory' && <SparePartsInventory parts={data.maintenance.spareParts} onPartSelect={handlePartSelect} onAddNewPart={() => handleOpenSparePartEditModal(null)} onEditPart={handleOpenSparePartEditModal} onToggleFlag={handleToggleFlagForOrder} />}
                    {activeMaintenanceSubTab === 'purchaseOrders' && <McPartPurchaseOrders orders={data.maintenance.mcPartOrders} t={t} />}
                    {activeMaintenanceSubTab === 'pmSchedule' && <MaintenanceScheduleView schedule={data.maintenance.pmSchedule} onCreateWorkOrder={handleCreatePmWorkOrder} initialFilter={pmScheduleInitialFilter} />}
                    {activeMaintenanceSubTab === 'maintenanceLog' && <MaintenanceLog maintenanceOrders={data.maintenanceOrders} errorReports={data.errorReports} users={data.masterData.users} onCompleteOrder={handleOpenCompleteOrderModal} />}

                </div>
              )}
              


            </div>
          )}
          
        </main>
      </div>
      
      {/* --- Modals and Panels --- */}
      {isMachineDetailsModalOpen && machineDetailsData && (
        <MachineDetailsModal
          isOpen={isMachineDetailsModalOpen}
          onClose={() => setIsMachineDetailsModalOpen(false)}
          theme={theme}
          {...machineDetailsData}
        />
      )}
       <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
       <DatabaseSchemaPanel isOpen={isDbSchemaPanelOpen} onClose={() => setIsDbSchemaPanelOpen(false)} />
       <ErrorReportModal
          isOpen={isErrorReportModalOpen}
          onClose={() => {setIsErrorReportModalOpen(false); setReportToUpdate(null); setErrorReportDefaults(undefined);}}
          onSubmit={handleErrorReportSubmit}
          onUpdate={handleErrorReportUpdate}
          reportToUpdate={reportToUpdate}
          masterData={data?.masterData as any}
          openMaintenanceOrders={data?.maintenance.schedule.overdue.concat(data.maintenance.schedule.dueSoon) || []}
          defaults={errorReportDefaults}
       />
       <MaintenanceOrderModal
            isOpen={isMaintenanceOrderModalOpen}
            onClose={() => {setIsMaintenanceOrderModalOpen(false); setMaintenanceOrderDefaults(undefined);}}
            onSubmit={handleMaintenanceOrderSubmit}
            allMachines={data?.masterData.machines || []}
            allUsers={data?.masterData.users || []}
            allDefectCauses={data?.masterData.defectCauses || []}
            openDefects={data?.allDefectRecords.filter(d => d.status === 'Open') || []}
            currentDate={filters.startDate}
            allSpareParts={data?.masterData.spareParts || []}
            defaults={maintenanceOrderDefaults}
       />
        <CompleteMaintenanceOrderModal
            isOpen={isCompleteMaintOrderModalOpen}
            onClose={() => setIsCompleteMaintOrderModalOpen(false)}
            onSubmit={handleCompleteOrderSubmit}
            order={orderToComplete}
            allSpareParts={data?.masterData.spareParts || []}
        />
       <MachineEditModal
            isOpen={isMachineEditModalOpen}
            onClose={() => setIsMachineEditModalOpen(false)}
            onSubmit={handleMachineSubmit}
            machineToEdit={machineToEdit}
            allLines={data?.availableLines || []}
            defaults={machineDefaults}
            areaMap={lineToAreaMap}
       />
        {enrichedSelectedPart && <SparePartDetailsModal isOpen={isSparePartDetailsModalOpen} onClose={() => setIsSparePartDetailsModalOpen(false)} part={enrichedSelectedPart} />}


        <SparePartEditModal isOpen={isSparePartEditModalOpen} onClose={() => setIsSparePartEditModalOpen(false)} onSubmit={handleSparePartSubmit} partToEdit={partToEdit} />
        <DeploymentChecklistModal isOpen={isChecklistModalOpen} onClose={() => setIsChecklistModalOpen(false)} />
        <DataEntryModal 
            isOpen={isDataEntryModalOpen}
            onClose={() => setIsDataEntryModalOpen(false)}
            onSubmit={handleDefectRecordSubmit}
            allMachines={data?.masterData.machines || []}
            allShifts={data?.masterData.shifts || []}
            allDefectTypes={data?.masterData.defectTypes || []}
            allDefectCauses={data?.masterData.defectCauses || []}
            openMaintenanceOrders={data?.maintenanceOrders.filter(o => o.status === 'Open' || o.status === 'InProgress') || []}
            currentDate={filters.startDate}
            onOpenLinkedErrorReport={handleOpenErrorReportFromDefect}
        />
        <DefectDetailsModal 
            isOpen={isDefectDetailsModalOpen}
            onClose={() => setIsDefectDetailsModalOpen(false)}
            defect={selectedDefect}
            onNavigateToLog={handleNavigateToDefectLog}
        />

    </div>
  );
};

export default App;