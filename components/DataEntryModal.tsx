import React, { useState, useMemo, useEffect } from 'react';
import { NewDefectData, MachineInfo, Shift, DefectType, DefectCause, EnrichedDefectRecord } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

interface DataEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewDefectData) => EnrichedDefectRecord;
  allMachines: MachineInfo[];
  allShifts: Shift[];
  allDefectTypes: DefectType[];
  allDefectCauses: DefectCause[];
  currentDate: string;
  onOpenLinkedErrorReport: (fromDefect: EnrichedDefectRecord) => void;
}

const formInputClass = "mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-800 dark:text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed";
const formLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const FormField: React.FC<{ label: string; id: string; required?: boolean; children: React.ReactNode }> = ({ label, id, required, children }) => (
    <div><label htmlFor={id} className={formLabelClass}>{label} {required && <span className="text-red-500">*</span>}</label>{children}</div>
);

const PostSubmissionActions: React.FC<{
    newDefect: EnrichedDefectRecord;
    onClose: () => void;
    onCreateErrorReport: () => void;
}> = ({ newDefect, onClose, onCreateErrorReport }) => {
    const { t } = useTranslation();
    return (
        <div className="p-6 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h3 className="mt-4 text-xl font-semibold text-white">{t('reportCreated')}</h3>
            <p className="mt-2 text-sm text-gray-400">
                {t('defectReportRecorded')} #{newDefect.id}
            </p>
            {newDefect.is_abnormal && (
                 <div className="mt-6 space-y-3 bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-cyan-400">{t('nextAction')}</p>
                    <p className="text-xs text-gray-400">
                        {t('abnormalDefectQuestion')}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                        <button
                            onClick={onCreateErrorReport}
                            className="flex items-center justify-center gap-2 rounded-md bg-yellow-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500"
                        >
                            <AlertTriangle size={16} />
                            {t('createErrorReport')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const DataEntryModal: React.FC<DataEntryModalProps> = ({ isOpen, onClose, onSubmit, allMachines, allShifts, allDefectTypes, allDefectCauses, currentDate, onOpenLinkedErrorReport }) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'form' | 'success'>('form');
    const [submittedDefect, setSubmittedDefect] = useState<EnrichedDefectRecord | null>(null);
    
    const getInitialState = () => ({
        work_date: currentDate,
        machine_id: allMachines[0]?.id || 0,
        shift_id: allShifts[0]?.id || 0,
        defect_type_id: allDefectTypes[0]?.id || 0,
        cause_id: allDefectCauses.find(c => c.category === 'Machine')?.id || 0,
        quantity: '',
        note: '',
        severity: 'Medium' as 'Low' | 'Medium' | 'High',
        status: 'Open' as 'Open' | 'In Progress' | 'Closed',
    });

    const [formData, setFormData] = useState(getInitialState());
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isAbnormal, setIsAbnormal] = useState(true);
    
    // Find "Others" defect type ID
    const othersDefectType = useMemo(() => 
        allDefectTypes.find(d => d.code === 'OTHERS' || d.name.toLowerCase().includes('other')) || allDefectTypes[allDefectTypes.length - 1],
        [allDefectTypes]
    );
    const [error, setError] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);


    useEffect(() => {
        if (isOpen) {
            setView('form');
            setSubmittedDefect(null);
            setFormData(getInitialState());
            setImagePreviews([]);
            setIsAbnormal(true);
            setError('');
            setIsConfirming(false);

        }
    }, [isOpen, allMachines, allShifts, currentDate]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Convert to number if the field is an ID or quantity
        const isNumericField = name.endsWith('_id') || name === 'quantity';
        setFormData(prev => ({ ...prev, [name]: isNumericField ? parseInt(value, 10) : value }));
    };




    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files: File[] = Array.from<File>(e.target.files).slice(0, 3);
            const previews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(previews);
        }
    };

    const handleReview = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.machine_id || !formData.shift_id || !formData.defect_type_id || !formData.cause_id) { setError('Please make a selection for all required fields.'); return; }
        const defectNum = Number(formData.quantity);
        if (isNaN(defectNum) || defectNum <= 0) { setError('Defect quantity must be a positive number.'); return; }
        if (isAbnormal && !formData.note.trim()) { setError('Detailed Description is required for abnormal waste.'); return; }
        setIsConfirming(true);
    };

    const handleFinalSubmit = () => {
        const submissionData: NewDefectData = {
            ...formData,
            quantity: Number(formData.quantity),
            is_abnormal: isAbnormal,
            reporter_id: 1, // Hardcoded admin user
            note: isAbnormal ? formData.note : `Standard loss: ${allDefectTypes.find(d => d.id === formData.defect_type_id)?.name || ''}`,
            severity: isAbnormal ? formData.severity : 'Low',
            status: isAbnormal ? formData.status : 'Closed',
            image_urls: [], // Placeholder
            linked_maintenance_order_id: null,
        };
        const newRecord = onSubmit(submissionData);
        setSubmittedDefect(newRecord);
        setView('success');
    };
    
    if (!isOpen) return null;

    const selectedMachine = allMachines.find(m => m.id === formData.machine_id);
    const selectedDefect = allDefectTypes.find(d => d.id === formData.defect_type_id);
    const selectedCause = allDefectCauses.find(c => c.id === formData.cause_id);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl text-gray-900 dark:text-white animate-fade-in-up flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">
                        {view === 'success' ? t('reportSuccess') : isConfirming ? t('confirmDefectReport') : `${t('reportDefectDetail')} (${isAbnormal ? t('abnormal') : t('standard')})`}
                    </h2>
                    <button onClick={onClose} aria-label="Close modal"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </header>

                {view === 'form' && (
                    <>
                        {isConfirming ? (
                            <main className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
                                <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg space-y-2 text-sm">
                                    <p><strong>{t('category')}:</strong> {isAbnormal ? t('abnormalWaste') : t('standardWaste')}</p>
                                    <p><strong>{t('date')}:</strong> {formData.work_date}</p>
                                    <p><strong>{t('machine')}:</strong> {selectedMachine?.MACHINE_ID} (Line {selectedMachine?.LINE_ID})</p>
                                    <p><strong>{t('defects')}:</strong> {selectedDefect?.name}</p>
                                    <p><strong>{t('quantity')}:</strong> {formData.quantity}</p>
                                    {isAbnormal && <>
                                        <p><strong>{t('description')}:</strong> {formData.note}</p>
                                        <p><strong>{t('rootCause')}:</strong> {selectedCause?.category}</p>
                                    </>}
                                </div>
                            </main>
                        ) : (
                            <form id="data-entry-form" onSubmit={handleReview}>
                                <main className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                    {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-md">{error}</div>}
                                    <fieldset className="border dark:border-gray-600 p-4 rounded-md">
                                        <legend className="px-2 font-semibold text-cyan-400">{t('category')}</legend>
                                        <div className="flex gap-x-6"><input type="radio" id="abnormal" checked={isAbnormal} onChange={() => { setIsAbnormal(true); }} /><label htmlFor="abnormal">{t('abnormal')}</label></div>
                                        <div className="flex gap-x-6"><input type="radio" id="standard" checked={!isAbnormal} onChange={() => { setIsAbnormal(false); setFormData(prev => ({ ...prev, defect_type_id: othersDefectType?.id || prev.defect_type_id })); }} /><label htmlFor="standard">{t('standard')}</label></div>
                                    </fieldset>



                                    {!isAbnormal ? (
                                        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border dark:border-gray-600 p-4 rounded-md">
                                            <legend className="px-2 font-semibold text-cyan-400">{t('standardWaste')} - {t('generalInfo')}</legend>
                                            <FormField label={t('date')} id="work_date" required><input type="date" name="work_date" value={formData.work_date} onChange={handleChange} className={formInputClass} required /></FormField>
                                            <FormField label={t('shift')} id="shift_id" required><select name="shift_id" value={formData.shift_id} onChange={handleChange} className={formInputClass}>{allShifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></FormField>
                                            <FormField label={t('itemCode')} id="machine_id" required><select name="machine_id" value={formData.machine_id} onChange={handleChange} className={formInputClass}>{allMachines.map(m => <option key={m.id} value={m.id}>{m.MACHINE_ID} (Line {m.LINE_ID})</option>)}</select></FormField>
                                            <FormField label={t('defectType')} id="defect_type_id" required><select name="defect_type_id" value={formData.defect_type_id} onChange={handleChange} className={formInputClass}>{allDefectTypes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></FormField>
                                            <FormField label={t('quantity')} id="quantity" required><input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" className={formInputClass} required/></FormField>
                                            <FormField label={t('severity')} id="severity"><select name="severity" value={formData.severity} onChange={handleChange} className={formInputClass}><option>Low</option><option>Medium</option><option>High</option></select></FormField>
                                            <div className="md:col-span-2"><FormField label={t('note')} id="note"><textarea name="note" value={formData.note} onChange={handleChange} rows={2} className={formInputClass} placeholder={t('optionalNote')}></textarea></FormField></div>
                                        </fieldset>
                                    ) : (
                                        <>
                                            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border dark:border-gray-600 p-4 rounded-md">
                                                <legend className="px-2 font-semibold text-cyan-400">{t('generalInfo')}</legend>
                                                <FormField label={t('date')} id="work_date" required><input type="date" name="work_date" value={formData.work_date} onChange={handleChange} className={formInputClass} required /></FormField>
                                                <FormField label={t('shift')} id="shift_id" required><select name="shift_id" value={formData.shift_id} onChange={handleChange} className={formInputClass}>{allShifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></FormField>
                                                <FormField label={t('machine')} id="machine_id" required><select name="machine_id" value={formData.machine_id} onChange={handleChange} className={formInputClass}>{allMachines.map(m => <option key={m.id} value={m.id}>{m.MACHINE_ID} (Line {m.LINE_ID})</option>)}</select></FormField>
                                                <FormField label={t('status')} id="status" required><select name="status" value={formData.status} onChange={handleChange} className={formInputClass}><option>Open</option><option>In Progress</option><option>Closed</option></select></FormField>
                                            </fieldset>
                                            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border dark:border-gray-600 p-4 rounded-md">
                                                <legend className="px-2 font-semibold text-cyan-400">{t('defectInfo')}</legend>
                                                <FormField label={t('defectType')} id="defect_type_id" required><select name="defect_type_id" value={formData.defect_type_id} onChange={handleChange} className={formInputClass}>{allDefectTypes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></FormField>
                                                <FormField label={t('quantity')} id="quantity" required><input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" className={formInputClass} required/></FormField>
                                                <FormField label={t('severity')} id="severity" required><select name="severity" value={formData.severity} onChange={handleChange} className={formInputClass}><option>Low</option><option>Medium</option><option>High</option></select></FormField>
                                                <FormField label={t('rootCause')} id="cause_id" required><select name="cause_id" value={formData.cause_id} onChange={handleChange} className={formInputClass}>{allDefectCauses.map(c => <option key={c.id} value={c.id}>{c.category}</option>)}</select></FormField>
                                                <div className="md:col-span-2"><FormField label={t('detailedDescription')} id="note" required><textarea name="note" value={formData.note} onChange={handleChange} rows={3} className={formInputClass} required></textarea></FormField></div>
                                                <div className="md:col-span-2"><FormField label={t('uploadImages')} id="images"><input type="file" onChange={handleImageChange} className={`${formInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100`} multiple accept="image/png, image/jpeg" /></FormField></div>
                                            </fieldset>
                                        </>
                                    )}
                                </main>
                            </form>
                        )}
                    </>
                )}

                {view === 'success' && submittedDefect && (
                    <PostSubmissionActions 
                        newDefect={submittedDefect}
                        onClose={onClose}
                        onCreateErrorReport={() => onOpenLinkedErrorReport(submittedDefect)}
                    />
                )}

                <footer className="px-6 py-4 bg-gray-900/50 flex justify-end gap-3 mt-auto">
                    {view === 'form' ? (
                        isConfirming ? (
                            <>
                                <button onClick={() => setIsConfirming(false)} className="bg-gray-600 hover:bg-gray-500 font-bold py-2 px-6 rounded-lg">{t('goBack')}</button>
                                <button onClick={handleFinalSubmit} className="bg-cyan-500 hover:bg-cyan-600 font-bold py-2 px-6 rounded-lg">{t('confirm')}</button>
                            </>
                        ) : (
                            <>
                                <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 font-bold py-2 px-6 rounded-lg">{t('cancel')}</button>
                                <button type="submit" form="data-entry-form" className="bg-cyan-500 hover:bg-cyan-600 font-bold py-2 px-6 rounded-lg">{t('review')}</button>
                            </>
                        )
                    ) : (
                         <button onClick={onClose} className="bg-cyan-500 hover:bg-cyan-600 font-bold py-2 px-6 rounded-lg">{t('done')}</button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default DataEntryModal;