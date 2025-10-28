import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MachineInfo, MachineStatusData, NewMachineData } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { Plus, Edit, PlayCircle, PauseCircle, AlertTriangle, XCircle, PlusCircle, ZoomIn, ZoomOut } from 'lucide-react';

interface ShopFloorLayoutProps {
    allMachines: MachineInfo[];
    machineStatus: MachineStatusData[];
    onMachineSelect: (machineId: string) => void;
    onAddMachine: (defaults?: Partial<NewMachineData>) => void;
    onEditMachine: (machine: MachineInfo) => void;
    onUpdateMachinePosition: (machineId: number, newPosition: { x: number; y: number }) => void;
    areaMap: Record<string, string>;
    onUpdateAreaName: (oldName: string, newName: string) => void;
    onAddNewAreaSubmit: (areaName: string, lineId: string) => boolean;
    existingAreaNames: string[];
    existingLineIds: string[];
}

// --- START: Add New Area Modal ---
interface AddNewAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (areaName: string, lineId: string) => boolean;
  existingAreaNames: string[];
  existingLineIds: string[];
}

const AddNewAreaModal: React.FC<AddNewAreaModalProps> = ({ isOpen, onClose, onSubmit, existingAreaNames, existingLineIds }) => {
    const { t } = useTranslation();
    const [areaName, setAreaName] = useState('');
    const [lineId, setLineId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAreaName('');
            setLineId('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const trimmedName = areaName.trim();
        const trimmedId = lineId.trim();

        if (!trimmedName || !trimmedId) {
            setError(t('formErrorRequired'));
            return;
        }
        if (existingAreaNames.some(name => name.toLowerCase() === trimmedName.toLowerCase())) {
            setError(`Area name "${trimmedName}" already exists.`);
            return;
        }
        if (existingLineIds.some(id => id.toLowerCase() === trimmedId.toLowerCase())) {
            setError(`Line ID "${trimmedId}" already exists.`);
            return;
        }

        const success = onSubmit(trimmedName, trimmedId);
        if (success) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const formInputClass = "mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-800 dark:text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500";
    const formLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{t('addArea')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4">
                        {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-md text-sm">{error}</div>}
                        <div>
                            <label htmlFor="areaName" className={formLabelClass}>{t('enterNewAreaName')}</label>
                            <input type="text" id="areaName" value={areaName} onChange={e => setAreaName(e.target.value)} className={formInputClass} autoFocus required />
                        </div>
                        <div>
                            <label htmlFor="lineId" className={formLabelClass}>{t('enterNewLineId', {areaName: ''})}</label>
                            <input type="text" id="lineId" value={lineId} onChange={e => setLineId(e.target.value)} className={formInputClass} required />
                        </div>
                    </main>
                    <footer className="px-6 py-4 bg-gray-900/50 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                        <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 font-bold py-2 px-4 rounded-lg">{t('addArea')}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};
// --- END: Add New Area Modal ---


type MergedMachine = MachineInfo & {
    statusData: MachineStatusData;
};

const statusConfig: Record<string, { icon: React.ReactNode; labelKey: string; colorClasses: string; textColorClass: string; animationClass?: string }> = {
    Running: { icon: <PlayCircle size={16} className="text-green-500" />, labelKey: 'running', colorClasses: 'border-green-500/50 bg-green-500/5 dark:bg-green-900/10', textColorClass: 'text-green-500' },
    Stopped: { icon: <PauseCircle size={16} className="text-yellow-500" />, labelKey: 'stopped', colorClasses: 'border-yellow-500/50 bg-yellow-500/5 dark:bg-yellow-900/10', textColorClass: 'text-yellow-500' },
    Error: { icon: <AlertTriangle size={16} className="text-red-500" />, labelKey: 'error', colorClasses: 'border-red-500 bg-red-500/5 dark:bg-red-900/10', textColorClass: 'text-red-500', animationClass: 'animate-error-highlight' },
    Inactive: { icon: <XCircle size={16} className="text-gray-500" />, labelKey: 'inactive', colorClasses: 'border-gray-500/50 bg-gray-500/5 dark:bg-gray-800', textColorClass: 'text-gray-500' },
};

const MachineNode: React.FC<{ 
    machine: MergedMachine; 
    position: { x: number, y: number };
    scale: number;
    onEdit: (machine: MachineInfo) => void;
    onMouseDown: (e: React.MouseEvent, machine: MergedMachine) => void;
}> = ({ machine, position, scale, onEdit, onMouseDown }) => {
    const { t } = useTranslation();
    const config = statusConfig[machine.statusData.status];
    const oee = machine.statusData?.oee;
    const oeePercentage = oee !== null ? (oee * 100).toFixed(1) + '%' : 'N/A';

    return (
        <div
            className="absolute group cursor-grab"
            style={{ 
                top: `${position.y}%`, 
                left: `${position.x}%`,
                transform: `translate(-50%, -50%) scale(${scale})`
            }}
            onMouseDown={(e) => onMouseDown(e, machine)}
        >
            <div
                className={`w-32 h-20 rounded-lg shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-cyan-500 border-2 hover:border-cyan-500 dark:hover:border-cyan-400 ${config.colorClasses} ${config.animationClass || ''}`}
            >
                <div className="flex items-center gap-2">
                    {config.icon}
                    <span className="font-bold text-lg text-gray-800 dark:text-white">{machine.MACHINE_ID}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">OEE: {oeePercentage}</span>
                <span className={`text-xs font-semibold mt-1 ${config.textColorClass}`}>{t(config.labelKey as any)}</span>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 text-center">
                <p className="font-bold">{machine.MACHINE_NAME}</p>
                <p>OEE: {oeePercentage}</p>
                <p>Status: {t(config.labelKey as any)}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
             {/* Edit Button */}
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(machine); }}
                    className="p-2 bg-cyan-500 hover:bg-cyan-600 rounded-full text-white shadow-md"
                    title={t('editMachine')}
                >
                    <Edit size={12} />
                </button>
            </div>
        </div>
    );
};

const EditableAreaHeader: React.FC<{
    areaName: string;
    machineCount: number;
    onUpdate: (oldName: string, newName: string) => void;
    density: number;
    onDensityChange: (density: number) => void;
}> = ({ areaName, machineCount, onUpdate, density, onDensityChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState(areaName);
    const [showSlider, setShowSlider] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    useEffect(() => {
        setDraftName(areaName);
    }, [areaName]);

    const handleSave = () => {
        if (draftName.trim() && draftName !== areaName) {
            onUpdate(areaName, draftName);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        else if (e.key === 'Escape') {
            setDraftName(areaName);
            setIsEditing(false);
        }
    };

    return (
         <div 
            className="flex justify-between items-center group w-full"
            onMouseEnter={() => setShowSlider(true)}
            onMouseLeave={() => setShowSlider(false)}
        >
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input ref={inputRef} type="text" value={draftName} onChange={(e) => setDraftName(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className="font-bold text-lg bg-transparent border-b-2 border-cyan-500 text-gray-800 dark:text-white focus:outline-none"/>
                </div>
            ) : (
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-cyan-500 transition-colors">
                        {areaName} 
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> ({machineCount} {t('machines')})</span>
                    </h3>
                    <Edit size={16} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )}
            <div className={`flex items-center gap-2 text-gray-400 transition-opacity duration-300 ${showSlider || isEditing ? 'opacity-100' : 'opacity-0'}`}>
                <ZoomOut size={16} />
                <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={density}
                    onChange={e => onDensityChange(parseFloat(e.target.value))}
                    className="w-24 cursor-ew-resize"
                    title={`Density: ${density.toFixed(1)}`}
                />
                <ZoomIn size={16} />
            </div>
        </div>
    );
};


const ShopFloorLayout: React.FC<ShopFloorLayoutProps> = ({ allMachines, machineStatus, onMachineSelect, onAddMachine, onEditMachine, onUpdateMachinePosition, areaMap, onUpdateAreaName, onAddNewAreaSubmit, existingAreaNames, existingLineIds }) => {
    const { t } = useTranslation();
    const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
    const [draggedMachine, setDraggedMachine] = useState<{ id: string; offsetX: number; offsetY: number; machineInfo: MergedMachine } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [areaDensity, setAreaDensity] = useState<Record<string, number>>({});
    const layoutRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const isDraggingRef = useRef(false);
    
    useEffect(() => {
        const initialPositions = allMachines.reduce((acc, m) => {
            acc[m.MACHINE_ID] = { x: m.x || 50, y: m.y || 50 };
            return acc;
        }, {} as Record<string, { x: number; y: number }>);
        setPositions(initialPositions);
    }, [allMachines]);
    
    const handleDensityChange = (areaName: string, density: number) => {
        setAreaDensity(prev => ({...prev, [areaName]: density}));
    }

    const handleMouseDown = (e: React.MouseEvent, machine: MergedMachine) => {
        e.preventDefault();
        isDraggingRef.current = false;
        const node = e.currentTarget as HTMLElement;
        const rect = node.getBoundingClientRect();
        
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        setDraggedMachine({ id: machine.MACHINE_ID, offsetX, offsetY, machineInfo: machine });
    };

    const handleMouseMove = (e: React.MouseEvent, area: string) => {
        if (!draggedMachine || !layoutRefs.current[area]) return;
        
        isDraggingRef.current = true;
        const layoutRect = layoutRefs.current[area]!.getBoundingClientRect();

        const density = areaDensity[area] || 1;
        const scale = 1 / density;
        const nodeWidth = 128 * scale;
        const nodeHeight = 80 * scale;

        let newX_px = e.clientX - layoutRect.left - (draggedMachine.offsetX * scale);
        let newY_px = e.clientY - layoutRect.top - (draggedMachine.offsetY * scale);
        
        const newCenterX_px = newX_px + nodeWidth / 2;
        const newCenterY_px = newY_px + nodeHeight / 2;
        
        const newXPercent = (newCenterX_px / layoutRect.width) * 100;
        const newYPercent = (newCenterY_px / layoutRect.height) * 100;

        const clampedX = Math.max(5, Math.min(95, newXPercent));
        const clampedY = Math.max(5, Math.min(95, newYPercent));

        setPositions(prev => ({
            ...prev,
            [draggedMachine.id]: { x: clampedX, y: clampedY }
        }));
    };

    const handleMouseUp = () => {
        if (draggedMachine) {
            if (isDraggingRef.current) {
                const finalPosition = positions[draggedMachine.id];
                if(finalPosition) {
                    onUpdateMachinePosition(draggedMachine.machineInfo.id, finalPosition);
                }
            } else {
                onMachineSelect(draggedMachine.id);
            }
            setDraggedMachine(null);
        }
    };
    
    const machinesByArea = useMemo(() => {
        const statusMap = new Map(machineStatus.map(s => [s.machineId, s]));
        const grouped: Record<string, MergedMachine[]> = Object.fromEntries(
            [...new Set(Object.values(areaMap))].map(name => [name, []])
        );

        for (const machine of allMachines) {
            const area = areaMap[machine.LINE_ID];
            const statusData = statusMap.get(machine.MACHINE_ID) || { machineId: machine.MACHINE_ID, status: 'Inactive', oee: null, lineId: machine.LINE_ID };
            if (area && grouped.hasOwnProperty(area)) {
                grouped[area].push({ ...machine, statusData });
            } else {
                if (!grouped['Unknown Area']) grouped['Unknown Area'] = [];
                grouped['Unknown Area'].push({ ...machine, statusData });
            }
        }
        if (grouped['Unknown Area'] && grouped['Unknown Area'].length === 0) {
            delete grouped['Unknown Area'];
        }
        return grouped;
    }, [allMachines, machineStatus, areaMap]);


    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {Object.entries(machinesByArea).map(([area, machines]: [string, MergedMachine[]]) => {
                const density = areaDensity[area] || 1;
                const scale = 1 / density;
                const containerMinHeight = 300 + machines.length * (15 / density);

                const handleAddMachineInArea = () => {
                    // Find the first lineId associated with this area name
                    const lineIdForArea = Object.keys(areaMap).find(key => areaMap[key] === area);
                    onAddMachine({ LINE_ID: lineIdForArea });
                };

                return (
                    <div key={area} className="min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col shadow-sm">
                        <header className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                           <EditableAreaHeader 
                                areaName={area}
                                machineCount={machines.length}
                                onUpdate={onUpdateAreaName}
                                density={density}
                                onDensityChange={(d) => handleDensityChange(area, d)}
                            />
                        </header>
                        <div 
                            ref={el => { layoutRefs.current[area] = el; }}
                            onMouseMove={(e) => handleMouseMove(e, area)}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            className={`p-4 flex-grow relative bg-dots rounded-b-lg transition-all duration-300 ${draggedMachine ? 'grabbing' : ''}`}
                            style={{ minHeight: `${containerMinHeight}px` }}
                        >
                            {machines.map(machine => {
                                const position = positions[machine.MACHINE_ID];
                                if (!position) return null;
                                return (
                                    <MachineNode
                                        key={machine.MACHINE_ID}
                                        machine={machine}
                                        position={position}
                                        scale={scale}
                                        onEdit={onEditMachine}
                                        onMouseDown={handleMouseDown}
                                    />
                                );
                            })}
                            <button
                                onClick={handleAddMachineInArea}
                                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-cyan-500"
                                title={t('addMachine')}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                );
            })}
             <div className="min-w-0 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center min-h-[400px] hover:border-cyan-500 hover:text-cyan-500 transition-all text-gray-400 dark:text-gray-500">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full h-full flex flex-col items-center justify-center"
                >
                    <PlusCircle size={48} className="mb-4" />
                    <span className="font-bold text-lg">{t('addArea')}</span>
                </button>
            </div>
            
            <AddNewAreaModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(name, id) => {
                    const success = onAddNewAreaSubmit(name, id);
                    if (success) setIsModalOpen(false);
                    return success;
                }}
                existingAreaNames={existingAreaNames}
                existingLineIds={existingLineIds}
            />
        </div>
    );
};

export default ShopFloorLayout;