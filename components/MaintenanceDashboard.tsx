import React, { useState } from 'react';
import { EnrichedMaintenanceOrder, MaintenanceKpis, SparePart, NewMaintenanceOrderData, MachineMaintenanceStats, DowntimeCauseStats } from '../types';
import KpiCard from './KpiCard';
import { AlertTriangle, PlusCircle, ArrowRightCircle, HardHat, ShoppingCart, Wrench, Calendar, Clock, ChevronDown } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import SimpleBarChart from '../services/SimpleBarChart';
import TrendChart from '../TrendChart';

interface MaintenanceDashboardProps {
  data: {
    kpis: MaintenanceKpis;
    schedule: {
        overdue: EnrichedMaintenanceOrder[];
        dueSoon: EnrichedMaintenanceOrder[];
    },
    lowStockParts: SparePart[];
    machineStats: MachineMaintenanceStats[];
    downtimeAnalysis: DowntimeCauseStats[];
    trend: { date: string, mtbf?: number, mttr?: number }[];
  },
  onOpenModal: (defaults?: Partial<NewMaintenanceOrderData>) => void;
  // FIX: Updated the filter type to match the capitalized values expected by the parent component's state.
  onNavigateToSchedule: (filter: 'Overdue' | 'Due soon' | 'all') => void;
  theme: 'light' | 'dark';
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section>
        <h2 className="text-2xl font-semibold text-cyan-400 mb-4 border-l-4 border-cyan-400 pl-3">{title}</h2>
        {children}
    </section>
);

const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({ data, onOpenModal, onNavigateToSchedule, theme }) => {
    const { t } = useTranslation();
    const { kpis, schedule, machineStats, downtimeAnalysis, trend } = data;

    const MachineStatsTable: React.FC = () => {
        const statusConfig = {
            Alert: {className: 'bg-red-500/20 border-red-500', text: 'text-red-400', label: t('alert')},
            Warning: {className: 'bg-yellow-500/20 border-yellow-500', text: 'text-yellow-400', label: t('warning')},
            Normal: {className: 'bg-green-500/20 border-green-500', text: 'text-green-400', label: t('normal')},
        };
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                             <tr>
                                {['machine', 'status', 'mtbf (h)', 'mttr (min)', 'totalBreakdowns', 'totalDowntime_short'].map(key => (
                                    <th key={key} className="py-2 px-3">{t(key as any)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {machineStats.map(stat => (
                                <tr key={stat.machineId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="py-3 px-3 font-bold text-gray-800 dark:text-white">{stat.machineId}</td>
                                    <td className="py-3 px-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[stat.status].className} ${statusConfig[stat.status].text}`}>
                                            {statusConfig[stat.status].label}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{stat.mtbf.toFixed(1)}</td>
                                    <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{stat.mttr.toFixed(1)}</td>
                                    <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{stat.breakdownCount}</td>
                                    <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{stat.totalDowntime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const DowntimeAnalysisTable: React.FC = () => (
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="py-2 px-3">{t('cause')}</th>
                            <th className="py-2 px-3 text-center">{t('count')}</th>
                            <th className="py-2 px-3 text-right">{t('totalTime')} (min)</th>
                            <th className="py-2 px-3 text-center">{t('mainImpact')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {downtimeAnalysis.map(item => (
                            <tr key={item.reason} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="py-3 px-3 font-semibold text-gray-800 dark:text-white">{item.reason}</td>
                                <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-300">{item.count}</td>
                                <td className="py-3 px-3 text-right">
                                    <span className="font-bold text-lg text-yellow-500 dark:text-yellow-400">{item.totalMinutes.toFixed(0)}</span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                    <span className="font-mono bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-md text-xs">{item.mainMachineImpact}</span>
                                </td>
                            </tr>
                        ))}
                        {downtimeAnalysis.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">
                                    {t('noDowntimeAnalysisData')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const PmTaskList: React.FC<{title: string, tasks: EnrichedMaintenanceOrder[], color: string, onClick: () => void}> = ({ title, tasks, color, onClick }) => (
        <div onClick={onClick} className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 ${color} cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{title} ({tasks.length})</h3>
            {tasks.length > 0 ? (
                <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
                    {tasks.map(task => (
                        <li key={task.id} className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                            <p className="font-bold text-gray-800 dark:text-white">{task.MACHINE_ID}: <span className="font-normal text-gray-600 dark:text-gray-300">{task.task_description}</span></p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('scheduledFor')}: {new Date(task.plan_date).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-gray-500">{t('noUpcomingTasks')}</p>}
        </div>
    );


    return (
        <div className="space-y-8">
            <Section title={t('maintKpis')}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <KpiCard title={t('mtbf')} value={kpis.mtbf} unit=" hours" precision={1} description="Mean Time Between Failures"/>
                    <KpiCard title={t('mttr')} value={kpis.mttr} unit=" min" precision={1} description="Mean Time To Repair"/>
                    <KpiCard title={t('breakdownCount')} value={kpis.breakdownCount} unit="" precision={0} description="Total breakdowns in the period"/>
                </div>
            </Section>

            <Section title={t('mttrTrend')}>
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <TrendChart
                        data={trend}
                        lines={[
                            { dataKey: 'mtbf', stroke: '#22d3ee', name: 'MTBF (h)' },
                            { dataKey: 'mttr', stroke: '#f97316', name: 'MTTR (min)' },
                        ]}
                        theme={theme}
                    />
                 </div>
            </Section>

            <Section title={t('maintenanceKpisByMachine')}>
                <MachineStatsTable />
            </Section>

            <Section title={t('downtimeCauseAnalysis')}>
                <DowntimeAnalysisTable />
            </Section>
            
            <Section title={t('pmTasks')}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FIX: Passed capitalized strings ('Overdue', 'Due soon') to match the expected type. */}
                    <PmTaskList title={t('overdue')} tasks={schedule.overdue} color="border-red-500" onClick={() => onNavigateToSchedule('Overdue')} />
                    <PmTaskList title={t('dueSoon')} tasks={schedule.dueSoon} color="border-yellow-500" onClick={() => onNavigateToSchedule('Due soon')} />
                 </div>
            </Section>
            
        </div>
    );
};

export default MaintenanceDashboard;