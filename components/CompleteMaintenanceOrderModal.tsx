import React, { useState, useEffect } from 'react';
import { EnrichedMaintenanceOrder, SparePart, CompleteMaintenanceOrderData } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface CompleteMaintenanceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderId: number, data: CompleteMaintenanceOrderData) => void;
  order: EnrichedMaintenanceOrder | null;
  allSpareParts: SparePart[];
}

const formInputClass = "mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-800 dark:text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500";
const formLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const FormField: React.FC<{ label: string; id: string; required?: boolean; children: React.ReactNode }> = ({ label, id, required, children }) => (
    <div><label htmlFor={id} className={formLabelClass}>{label} {required && <span className="text-red-500">*</span>}</label>{children}</div>
);

const CompleteMaintenanceOrderModal: React.FC<CompleteMaintenanceOrderModalProps> = ({ isOpen, onClose, onSubmit, order, allSpareParts }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        downtime_min: 0,
        actual_start_date: new Date().toISOString().slice(0, 10),
        actual_end_date: new Date().toISOString().slice(0, 10),
    });
    const [partsUsed, setPartsUsed] = useState<{ part_id: number | string; qty_used: number }[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && order) {
            setFormData({
                downtime_min: order.downtime_min || 0,
                actual_start_date: order.actual_start_date || new Date().toISOString().slice(0, 10),
                actual_end_date: new Date().toISOString().slice(0, 10),
            });
            // Pre-fill parts from the plan
            setPartsUsed(order.parts_used.length > 0 ? order.parts_used.map(p => ({ part_id: p.part_id, qty_used: p.qty_used })) : [{ part_id: '', qty_used: 1 }]);
            setError('');
        }
    }, [isOpen, order]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'downtime_min' ? Number(value) : value }));
    };

    const handlePartChange = (index: number, field: 'part_id' | 'qty_used', value: string | number) => {
        const newParts = [...partsUsed];
        newParts[index] = { ...newParts[index], [field]: value };
        setPartsUsed(newParts);
    };

    const addPartRow = () => setPartsUsed([...partsUsed, { part_id: '', qty_used: 1 }]);
    const removePartRow = (index: number) => setPartsUsed(partsUsed.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;

        const finalParts = partsUsed
            .filter(p => p.part_id && Number(p.qty_used) > 0)
            .map(p => ({ part_id: Number(p.part_id), qty_used: Number(p.qty_used) }));

        onSubmit(order.id, {
            ...formData,
            parts_used: finalParts,
        });
    };

    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl text-gray-900 dark:text-white animate-fade-in-up flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold">{t('completeOrder')} #{order.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </header>

                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="p-3 bg-gray-700/50 rounded-md">
                            <p><strong>{t('machine')}:</strong> {order.MACHINE_ID}</p>
                            <p><strong>{t('task')}:</strong> {order.task_description}</p>
                        </div>
                        {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-md">{error}</div>}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label={t('actualStartDate')} id="actual_start_date"><input type="date" name="actual_start_date" value={formData.actual_start_date} onChange={handleChange} className={formInputClass} /></FormField>
                            <FormField label={t('actualEndDate')} id="actual_end_date"><input type="date" name="actual_end_date" value={formData.actual_end_date} onChange={handleChange} className={formInputClass} /></FormField>
                            <FormField label={t('actualDowntime')} id="downtime_min"><input type="number" name="downtime_min" value={formData.downtime_min} onChange={handleChange} min="0" className={formInputClass} /></FormField>
                        </div>

                        {/* FIX: Use 'partsUsedTitle' which is a valid translation key, instead of 'partsUsed'. */}
                        <FormField label={t('partsUsedTitle')} id="parts_used">
                            <div className="mt-2 space-y-3 p-3 border dark:border-gray-600 rounded-md">
                                {partsUsed.map((part, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <select value={part.part_id} onChange={(e) => handlePartChange(index, 'part_id', e.target.value)} className={formInputClass + " flex-grow mt-0"}><option value="">{t('selectPart')}</option>{allSpareParts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.part_code}) - {p.available} left</option>)}</select>
                                        <input type="number" min="1" value={part.qty_used} onChange={(e) => handlePartChange(index, 'qty_used', parseInt(e.target.value))} className={formInputClass + " mt-0 w-24"}/>
                                        <button type="button" onClick={() => removePartRow(index)} className="p-2 text-gray-400 hover:text-red-400">&times;</button>
                                    </div>
                                ))}
                                <button type="button" onClick={addPartRow} className="text-sm text-cyan-400 hover:underline">{t('addPart')}</button>
                            </div>
                        </FormField>
                    </main>
                    <footer className="px-6 py-4 bg-gray-900/50 flex justify-end gap-3 mt-auto">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 font-bold py-2 px-6 rounded-lg">{t('cancel')}</button>
                        <button type="submit" className="bg-green-600 hover:bg-green-500 font-bold py-2 px-6 rounded-lg">{t('confirmCompletion')}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default CompleteMaintenanceOrderModal;