import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from './i18n/LanguageContext';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';

type Shift = 'all' | 'A' | 'B' | 'C';
type DateSelectionMode = 'single' | 'range' | 'last7' | 'lastWeek' | 'last30';
type MachineStatus = 'all' | 'active' | 'inactive';

interface FilterBarProps {
  filters: {
    startDate: string;
    endDate: string;
    area: string;
    shift: Shift;
    mode: DateSelectionMode;
    status: MachineStatus;
  };
  onFilterChange: (newFilters: Partial<FilterBarProps['filters']>) => void;
  onClearFilters: () => void;
  availableAreas: string[];
  thresholds: {
    oee: number;
    availability: number;
    performance: number;
    quality: number;
  };
  onThresholdChange: (newThresholds: Partial<FilterBarProps['thresholds']>) => void;
}

const ThresholdInput: React.FC<{
  label: string;
  id: string;
  value: number;
  onChange: (value: number) => void;
}> = ({ label, id, value, onChange }) => (
    <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}:</label>
        <div className="relative">
            <input
                type="number"
                id={id}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                min="0"
                max="100"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">%</span>
        </div>
    </div>
);

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  availableAreas,
  thresholds,
  onThresholdChange,
}) => {
  const { t } = useTranslation();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters: Partial<FilterBarProps['filters']> = { [name]: value };

    if (filters.mode === 'single') {
        newFilters.endDate = value;
    } else if (name === 'startDate' && new Date(value) > new Date(filters.endDate)) {
        newFilters.endDate = value;
    } else if (name === 'endDate' && new Date(value) < new Date(filters.startDate)) {
        newFilters.startDate = value;
    }
    
    onFilterChange(newFilters);
  };
  
  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const mode = e.target.value as DateSelectionMode;
      const today = new Date();
      let startDate = filters.startDate;
      let endDate = today.toISOString().slice(0, 10);
      
      switch (mode) {
          case 'last7':
              today.setDate(today.getDate() - 6);
              startDate = today.toISOString().slice(0, 10);
              break;
          case 'last30':
              today.setDate(today.getDate() - 29);
              startDate = today.toISOString().slice(0, 10);
              break;
          case 'lastWeek':
              const firstDayOfWeek = today.getDate() - today.getDay();
              const lastDayOfPrevWeek = new Date(today.setDate(firstDayOfWeek - 1));
              const firstDayOfPrevWeek = new Date(new Date(lastDayOfPrevWeek).setDate(lastDayOfPrevWeek.getDate() - 6));
              startDate = firstDayOfPrevWeek.toISOString().slice(0, 10);
              endDate = lastDayOfPrevWeek.toISOString().slice(0, 10);
              break;
          case 'single':
              endDate = startDate;
              break;
          case 'range':
              // keep current dates
              break;
      }

      onFilterChange({ ...filters, startDate, endDate, mode });
  };


  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div>
          <label htmlFor="date-mode-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('dateRange')}</label>
          <select id="date-mode-select" value={filters.mode} onChange={handleModeChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md">
            <option value="single">Single Day</option>
            <option value="range">Date Range</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="lastWeek">Last Week</option>
          </select>
        </div>
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('startDate')}</label>
          <input type="date" id="start-date" name="startDate" value={filters.startDate} onChange={handleDateChange} className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md" />
        </div>
        {filters.mode === 'range' && (
         <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('endDate')}</label>
            <input type="date" id="end-date" name="endDate" value={filters.endDate} onChange={handleDateChange} className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md" />
          </div>
        )}
        <div>
          <label htmlFor="area-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('area')}</label>
          <select id="area-select" value={filters.area} onChange={e => onFilterChange({ area: e.target.value })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md">
            <option value="all">All Areas</option>
            {availableAreas.map(area => <option key={area} value={area}>{area}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="shift-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('shift')}</label>
          <select id="shift-select" value={filters.shift} onChange={e => onFilterChange({ shift: e.target.value as Shift })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md">
            <option value="all">{t('allShifts')}</option>
            <option value="A">{t('shiftA')}</option>
            <option value="B">{t('shiftB')}</option>
            <option value="C">{t('shiftC')}</option>
          </select>
        </div>
        <div className="flex items-end justify-between">
           <button onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="flex items-center gap-1 text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
             <Filter size={14} /> Advanced {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
           </button>
           <button onClick={onClearFilters} className="p-2 text-gray-400 hover:text-red-500" title="Clear Filters"><X size={18}/></button>
        </div>
      </div>
      {isAdvancedOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-in-up">
            <div className="lg:col-span-1">
                <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('machineStatus')}</label>
                <select id="status-select" value={filters.status} onChange={e => onFilterChange({ status: e.target.value as MachineStatus })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md">
                    <option value="all">{t('allStatuses')}</option>
                    <option value="active">{t('active')}</option>
                    <option value="inactive">{t('inactive')}</option>
                </select>
            </div>
            <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                 <ThresholdInput label="OEE Threshold" id="oee-threshold" value={thresholds.oee} onChange={value => onThresholdChange({ oee: value })} />
                <ThresholdInput label="Availability" id="availability-threshold" value={thresholds.availability} onChange={value => onThresholdChange({ availability: value })} />
                <ThresholdInput label="Performance" id="performance-threshold" value={thresholds.performance} onChange={value => onThresholdChange({ performance: value })} />
                <ThresholdInput label="Quality" id="quality-threshold" value={thresholds.quality} onChange={value => onThresholdChange({ quality: value })} />
            </div>
        </div>
      )}
    </div>
  );
};
export default FilterBar;
