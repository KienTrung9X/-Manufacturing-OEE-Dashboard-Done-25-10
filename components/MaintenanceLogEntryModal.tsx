import React, { useState, useEffect } from 'react';
import { MachineInfo, User, SparePart, EnrichedErrorReport } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { X, Wrench, AlertTriangle } from 'lucide-react';

interface NewMaintenanceLogData {
  machine_id: number;
  type: 'planned' | 'unplanned';
  description: string;
  technician_id: number;
  start_time: string;
  end_time: string;
  parts_used: { part_id: number; qty_used: number; notes: string; images: string[] }[];
  notes: string;
  linked_error_report_id?: number | null;
}

interface MaintenanceLogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewMaintenanceLogData) => void;
  allMachines: MachineInfo[];
  allUsers: User[];
  allSpareParts: SparePart[];
  openErrorReports: EnrichedErrorReport[];
}

const formInputClass = "mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-800 dark:text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500";
const formLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const FormField: React.FC<{ label: string; id: string; required?: boolean; children: React.ReactNode }> = ({ label, id, required, children }) => (
    <div><label htmlFor={id} className={formLabelClass}>{label} {required && <span className="text-red-500">*</span>}</label>{children}</div>
);

const MaintenanceLogEntryModal: React.FC<MaintenanceLogEntryModalProps> = ({ isOpen, onClose, onSubmit, allMachines, allUsers, allSpareParts, openErrorReports }) => {
    const { t } = useTranslation();
    
    const getInitialState = () => ({
        machine_id: allMachines[0]?.id || 0,
        type: 'planned' as 'planned' | 'unplanned',
        description: '',
        technician_id: allUsers.find(u => u.role === 'Maintenance')?.id || 0,
        start_time: '',
        end_time: '',
        parts_used: [] as { part_id: number; qty_used: number; notes: string; images: string[] }[],
        notes: '',
        linked_error_report_id: null,
    });

    const [formData, setFormData] = useState(getInitialState());
    const [error, setError] = useState('');
    const [linkToErrorReport, setLinkToErrorReport] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
            setError('');
            setLinkToErrorReport(false);
        }
    }, [isOpen, allMachines, allUsers]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumericField = name.endsWith('_id');
        setFormData(prev => ({ ...prev, [name]: isNumericField ? parseInt(value, 10) : value }));
        
        // Reset link when changing type
        if (name === 'type') {
            setLinkToErrorReport(false);
            setFormData(prev => ({ ...prev, linked_error_report_id: null }));
        }
        
        // Auto-fill from error report
        if (name === 'linked_error_report_id' && value) {
            const selectedReport = openErrorReports.find(r => r.id === parseInt(value, 10));
            if (selectedReport) {
                setFormData(prev => ({
                    ...prev,
                    machine_id: selectedReport.machine_id,
                    description: `Sửa chữa lỗi: ${selectedReport.defect_description}`,
                    technician_id: selectedReport.technician_id || prev.technician_id
                }));
            }
        }
    };

    const handleAddPart = () => {
        setFormData(prev => ({
            ...prev,
            parts_used: [...prev.parts_used, { part_id: allSpareParts[0]?.id || 0, qty_used: 1, notes: '', images: [] }]
        }));
    };

    const handlePartChange = (index: number, field: 'part_id' | 'qty_used' | 'notes', value: string) => {
        setFormData(prev => ({
            ...prev,
            parts_used: prev.parts_used.map((part, i) => 
                i === index ? { ...part, [field]: ['part_id', 'qty_used'].includes(field) ? parseInt(value, 10) : value } : part
            )
        }));
    };

    const handlePartImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const imageUrls = files.map(file => URL.createObjectURL(file));
            setFormData(prev => ({
                ...prev,
                parts_used: prev.parts_used.map((part, i) => 
                    i === index ? { ...part, images: [...part.images, ...imageUrls] } : part
                )
            }));
        }
    };

    const handleRemovePartImage = (partIndex: number, imageIndex: number) => {
        setFormData(prev => ({
            ...prev,
            parts_used: prev.parts_used.map((part, i) => 
                i === partIndex ? { ...part, images: part.images.filter((_, idx) => idx !== imageIndex) } : part
            )
        }));
    };

    const handleRemovePart = (index: number) => {
        setFormData(prev => ({
            ...prev,
            parts_used: prev.parts_used.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.description.trim()) {
            setError('Mô tả công việc là bắt buộc');
            return;
        }
        if (!formData.start_time || !formData.end_time) {
            setError('Thời gian bắt đầu và kết thúc là bắt buộc');
            return;
        }
        if (new Date(formData.start_time) >= new Date(formData.end_time)) {
            setError('Thời gian kết thúc phải sau thời gian bắt đầu');
            return;
        }

        onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    const maintenanceTechnicians = allUsers.filter(u => u.role === 'Maintenance' || u.role === 'Supervisor');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl text-gray-900 dark:text-white animate-fade-in-up flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Nhập Nhật Ký Bảo Trì</h2>
                    <button onClick={onClose} aria-label="Close modal">
                        <X className="h-6 w-6" />
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-md">{error}</div>}
                        
                        <fieldset className="border dark:border-gray-600 p-4 rounded-md">
                            <legend className="px-2 font-semibold text-cyan-400">Loại Bảo Trì</legend>
                            <div className="flex gap-6 mt-2">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="radio" 
                                        id="planned" 
                                        name="type" 
                                        value="planned" 
                                        checked={formData.type === 'planned'} 
                                        onChange={handleChange}
                                        className="text-cyan-500"
                                    />
                                    <label htmlFor="planned" className="flex items-center gap-2">
                                        <Wrench size={16} className="text-blue-400" />
                                        Bảo Trì Theo Kế Hoạch
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="radio" 
                                        id="unplanned" 
                                        name="type" 
                                        value="unplanned" 
                                        checked={formData.type === 'unplanned'} 
                                        onChange={handleChange}
                                        className="text-cyan-500"
                                    />
                                    <label htmlFor="unplanned" className="flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-red-400" />
                                        Bảo Trì Bất Thường
                                    </label>
                                </div>
                            </div>
                        </fieldset>

                        {formData.type === 'unplanned' && (
                            <div className="p-4 border border-dashed border-gray-600 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <input 
                                        id="link-error-checkbox" 
                                        type="checkbox" 
                                        checked={linkToErrorReport} 
                                        onChange={(e) => {
                                            setLinkToErrorReport(e.target.checked);
                                            if (!e.target.checked) {
                                                setFormData(prev => ({ ...prev, linked_error_report_id: null }));
                                            }
                                        }} 
                                        className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-cyan-500 focus:ring-cyan-600" 
                                    />
                                    <label htmlFor="link-error-checkbox" className="font-semibold text-cyan-400">Liên Kết Với Báo Cáo Lỗi</label>
                                </div>
                                {linkToErrorReport && (
                                    <div className="mt-3 animate-fade-in-up">
                                        <FormField label="Chọn Báo Cáo Lỗi" id="linked_error_report_id">
                                            <select 
                                                name="linked_error_report_id" 
                                                value={formData.linked_error_report_id || ''} 
                                                onChange={handleChange} 
                                                className={formInputClass}
                                            >
                                                <option value="">-- Chọn Báo Cáo Lỗi --</option>
                                                {openErrorReports.map(report => (
                                                    <option key={report.id} value={report.id}>
                                                        #{report.reportNo} - {report.MACHINE_ID}: {report.defect_description.substring(0, 50)}...
                                                    </option>
                                                ))}
                                            </select>
                                        </FormField>
                                    </div>
                                )}
                            </div>
                        )}

                        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border dark:border-gray-600 p-4 rounded-md">
                            <legend className="px-2 font-semibold text-cyan-400">Thông Tin Chung</legend>
                            <FormField label="Máy" id="machine_id" required>
                                <select name="machine_id" value={formData.machine_id} onChange={handleChange} className={formInputClass} required disabled={linkToErrorReport && formData.linked_error_report_id}>
                                    {allMachines.map(m => <option key={m.id} value={m.id}>{m.MACHINE_ID} - {m.MACHINE_NAME}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Kỹ Thuật Viên" id="technician_id" required>
                                <select name="technician_id" value={formData.technician_id} onChange={handleChange} className={formInputClass} required>
                                    {maintenanceTechnicians.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Thời Gian Bắt Đầu" id="start_time" required>
                                <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} className={formInputClass} required />
                            </FormField>
                            <FormField label="Thời Gian Kết Thúc" id="end_time" required>
                                <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} className={formInputClass} required />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Mô Tả Công Việc" id="description" required>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={formInputClass} required placeholder="Mô tả chi tiết công việc bảo trì đã thực hiện..." disabled={linkToErrorReport && formData.linked_error_report_id}></textarea>
                                </FormField>
                            </div>
                        </fieldset>

                        <fieldset className="border dark:border-gray-600 p-4 rounded-md">
                            <legend className="px-2 font-semibold text-cyan-400">Linh Kiện Sử Dụng</legend>
                            <div className="space-y-6">
                                {formData.parts_used.map((part, index) => (
                                    <div key={index} className="border border-gray-600 p-4 rounded-md space-y-3">
                                        <div className="flex gap-3 items-end">
                                            <div className="flex-1">
                                                <label className="block text-sm text-gray-300">Linh Kiện</label>
                                                <select 
                                                    value={part.part_id} 
                                                    onChange={(e) => handlePartChange(index, 'part_id', e.target.value)} 
                                                    className={formInputClass}
                                                >
                                                    {allSpareParts.map(p => <option key={p.id} value={p.id}>{p.part_code} - {p.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-sm text-gray-300">Số Lượng</label>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    value={part.qty_used} 
                                                    onChange={(e) => handlePartChange(index, 'qty_used', e.target.value)} 
                                                    className={formInputClass}
                                                />
                                            </div>

                                            <button 
                                                type="button" 
                                                onClick={() => handleRemovePart(index)} 
                                                className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-md"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-300 mb-1">Ghi Chú Tình Trạng</label>
                                            <textarea 
                                                value={part.notes} 
                                                onChange={(e) => handlePartChange(index, 'notes', e.target.value)} 
                                                className={formInputClass}
                                                rows={2}
                                                placeholder="Mô tả chi tiết tình trạng linh kiện..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-300 mb-1">Ảnh Linh Kiện</label>
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept="image/*" 
                                                onChange={(e) => handlePartImageChange(index, e)} 
                                                className={`${formInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100`}
                                            />
                                            {part.images.length > 0 && (
                                                <div className="mt-2 grid grid-cols-3 gap-2">
                                                    {part.images.map((img, imgIndex) => (
                                                        <div key={imgIndex} className="relative">
                                                            <img src={img} alt={`Part ${index + 1} image ${imgIndex + 1}`} className="w-full h-20 object-cover rounded border" />
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemovePartImage(index, imgIndex)} 
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-red-600"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    onClick={handleAddPart} 
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md"
                                >
                                    + Thêm Linh Kiện
                                </button>
                            </div>
                        </fieldset>

                        <fieldset className="border dark:border-gray-600 p-4 rounded-md">
                            <legend className="px-2 font-semibold text-cyan-400">Ghi Chú</legend>
                            <FormField label="Ghi Chú Thêm" id="notes">
                                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className={formInputClass} placeholder="Ghi chú thêm về quá trình bảo trì..."></textarea>
                            </FormField>
                        </fieldset>
                    </main>

                    <footer className="px-6 py-4 bg-gray-900/50 flex justify-end gap-3 mt-auto">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 font-bold py-2 px-6 rounded-lg">
                            Hủy
                        </button>
                        <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 font-bold py-2 px-6 rounded-lg">
                            Lưu Nhật Ký
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default MaintenanceLogEntryModal;