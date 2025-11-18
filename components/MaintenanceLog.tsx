import React, { useState, useMemo } from 'react';
import { EnrichedMaintenanceOrder, EnrichedErrorReport, User } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { Wrench, AlertTriangle, ChevronDown, Plus, Filter } from 'lucide-react';

interface MaintenanceLogProps {
  maintenanceOrders: EnrichedMaintenanceOrder[];
  errorReports: EnrichedErrorReport[];
  users: User[];
  onCompleteOrder: (order: EnrichedMaintenanceOrder) => void;
  onOpenLogEntryModal: () => void;
}

type MaintenanceEvent = {
    id: string;
    date: string;
    machineId: string;
    type: 'PM' | 'IM' | 'Repair';
    description: string;
    technician: string | null;
    status: string;
    partsUsed: { part_code: string; part_name: string; qty_used: number }[];
};

type SortKey = keyof MaintenanceEvent;
type SortDirection = 'ascending' | 'descending';

const MaintenanceLog: React.FC<MaintenanceLogProps> = ({ maintenanceOrders, errorReports, users, onCompleteOrder, onOpenLogEntryModal }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'PM' | 'IM' | 'Repair'>('all');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [technicianFilter, setTechnicianFilter] = useState('all');
    const [partFilter, setPartFilter] = useState('');
    
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'date', direction: 'descending' });
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    
    const maintenanceTechnicians = useMemo(() => {
        return users.filter(u => u.role === 'Maintenance' || u.role === 'Supervisor' || u.role === 'Admin');
    }, [users]);

    const maintenanceEvents = useMemo((): MaintenanceEvent[] => {
        const orderEvents: MaintenanceEvent[] = maintenanceOrders.map(order => ({
            id: `order-${order.id}`,
            date: order.actual_end_date || order.plan_date,
            machineId: order.MACHINE_ID,
            type: order.type,
            description: order.task_description,
            technician: order.assigned_to_name,
            status: order.status,
            partsUsed: order.parts_used,
        }));

        const repairEvents: MaintenanceEvent[] = errorReports
            .filter(report => report.status === 'Fixed' || report.status === 'Closed' || report.technician_id)
            .map(report => ({
                id: `report-${report.id}`,
                date: report.fix_time || report.updated_at,
                machineId: report.MACHINE_ID,
                type: 'Repair',
                description: report.defect_description,
                technician: report.technician_name,
                status: report.status,
                partsUsed: [], // In a real app, you might link this via linked_maintenance_order_id
            }));

        return [...orderEvents, ...repairEvents];
    }, [maintenanceOrders, errorReports]);

    const filteredAndSortedEvents = useMemo(() => {
        const filtered = maintenanceEvents.filter(event => {
            const machineMatch = searchTerm === '' || event.machineId.toLowerCase().includes(searchTerm.toLowerCase());
            const typeMatch = typeFilter === 'all' || event.type === typeFilter;
            const technicianMatch = technicianFilter === 'all' || event.technician === technicianFilter;
            
            const dateMatch = (!dateFilter.start || new Date(event.date) >= new Date(dateFilter.start)) &&
                              (!dateFilter.end || new Date(event.date) <= new Date(dateFilter.end));

            const partMatch = partFilter === '' || event.partsUsed.some(part => 
                part.part_name.toLowerCase().includes(partFilter.toLowerCase()) || 
                part.part_code.toLowerCase().includes(partFilter.toLowerCase())
            );

            return machineMatch && typeMatch && technicianMatch && dateMatch && partMatch;
        });

        return filtered.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            let comparison = String(aVal).localeCompare(String(bVal));
            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        });
    }, [maintenanceEvents, searchTerm, typeFilter, technicianFilter, dateFilter, partFilter, sortConfig]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setDateFilter({ start: '', end: '' });
        setTechnicianFilter('all');
        setPartFilter('');
        setShowFilters(false);
    };

    const requestSort = (key: SortKey) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
    };
    
    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) return <span className="opacity-20 group-hover:opacity-100">↕</span>;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    const getTypeChip = (type: 'PM' | 'IM' | 'Repair') => {
        const styles = {
            PM: 'bg-blue-900 text-blue-300',
            IM: 'bg-purple-900 text-purple-300',
            Repair: 'bg-yellow-900 text-yellow-300'
        };
        const icons = {
            PM: <Wrench size={12} />,
            IM: <Wrench size={12} />,
            Repair: <AlertTriangle size={12} />
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${styles[type]}`}>
                {icons[type]}
                {t(type as any) || type}
            </span>
        );
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-cyan-400 border-l-4 border-cyan-400 pl-3">{t('maintenanceLog')}</h2>
                <button 
                    onClick={onOpenLogEntryModal}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center gap-2 transition-transform transform hover:scale-105"
                >
                    <Plus size={16} />
                    Nhập Nhật Ký Bảo Trì
                </button>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="mb-4 flex justify-between items-center">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        <Filter size={16} />
                        {showFilters ? 'Ẩn Bộ Lọc' : 'Hiện Bộ Lọc'}
                        <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                
                {showFilters && (
                    <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('searchMachineLine')}</label>
                                <input type="text" placeholder={t('machineId')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('eventType')}</label>
                                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    <option value="all">{t('all')} {t('eventType')}</option>
                                    <option value="PM">{t('pm')}</option>
                                    <option value="IM">{t('IM')}</option>
                                    <option value="Repair">{t('repair')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('technician')}</label>
                                <select value={technicianFilter} onChange={(e) => setTechnicianFilter(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    <option value="all">{t('allTechnicians')}</option>
                                    {maintenanceTechnicians.map(user => <option key={user.id} value={user.full_name}>{user.full_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('dateRange')}</label>
                                <div className="flex items-center gap-2">
                                    <input type="date" value={dateFilter.start} onChange={e => setDateFilter(p => ({...p, start: e.target.value}))} className="flex-1 bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" aria-label={t('startDate')}/>
                                    <span className="text-gray-400">-</span>
                                    <input type="date" value={dateFilter.end} onChange={e => setDateFilter(p => ({...p, end: e.target.value}))} className="flex-1 bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" aria-label={t('endDate')}/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('sparePart')}</label>
                                <input type="text" placeholder={t('searchByPart')} value={partFilter} onChange={(e) => setPartFilter(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleClearFilters} className="text-sm text-cyan-400 hover:underline">{t('clearFilters')}</button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th className="p-3 text-left w-12"></th>
                                <th className="p-3 text-left"><button onClick={() => requestSort('date')} className="group">{t('date')} {getSortIcon('date')}</button></th>
                                <th className="p-3 text-left"><button onClick={() => requestSort('machineId')} className="group">{t('machine')} {getSortIcon('machineId')}</button></th>
                                <th className="p-3 text-left"><button onClick={() => requestSort('type')} className="group">{t('eventType')} {getSortIcon('type')}</button></th>
                                <th className="p-3 text-left">{t('description')}</th>
                                <th className="p-3 text-left"><button onClick={() => requestSort('technician')} className="group">{t('technician')} {getSortIcon('technician')}</button></th>
                                <th className="p-3 text-left"><button onClick={() => requestSort('status')} className="group">{t('status')} {getSortIcon('status')}</button></th>
                                <th className="p-3 text-left">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredAndSortedEvents.map(event => {
                                const isExpanded = expandedRowId === event.id;
                                const isOrder = event.id.startsWith('order-');
                                const canComplete = isOrder && (event.status === 'Open' || event.status === 'InProgress');
                                const originalOrderId = isOrder ? parseInt(event.id.split('-')[1], 10) : null;
                                const originalOrder = originalOrderId ? maintenanceOrders.find(o => o.id === originalOrderId) : null;

                                return (
                                    <React.Fragment key={event.id}>
                                        <tr className="hover:bg-gray-700/50">
                                            <td className="p-3 text-center">
                                                {event.partsUsed.length > 0 && (
                                                    <button onClick={() => setExpandedRowId(isExpanded ? null : event.id)}>
                                                        <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-3 whitespace-nowrap">{new Date(event.date).toLocaleDateString()}</td>
                                            <td className="p-3 font-semibold">{event.machineId}</td>
                                            <td className="p-3">{getTypeChip(event.type)}</td>
                                            <td className="p-3 max-w-sm truncate" title={event.description}>{event.description}</td>
                                            <td className="p-3">{event.technician || 'N/A'}</td>
                                            <td className="p-3">{event.status}</td>
                                            <td className="p-3">
                                                {canComplete && originalOrder && (
                                                    <button
                                                        onClick={() => onCompleteOrder(originalOrder)}
                                                        className="text-sm bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-3 rounded"
                                                    >
                                                        {t('complete')}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-gray-900/50">
                                                <td colSpan={8} className="p-4">
                                                    <div className="pl-16">
                                                        <h4 className="font-semibold text-gray-300 mb-2">{t('partsUsedList')}:</h4>
                                                        {event.partsUsed.length > 0 ? (
                                                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-400">
                                                                {event.partsUsed.map(part => (
                                                                    <li key={part.part_code}>
                                                                        <span className="font-semibold text-gray-300">{part.part_name}</span> ({part.part_code}) - {t('qty')}: {part.qty_used}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 italic">{t('noPartsUsed')}</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredAndSortedEvents.length === 0 && <div className="text-center p-8 text-gray-500">{t('noRecordsMatch')}</div>}
                </div>
            </div>
        </section>
    );
};

export default MaintenanceLog;
