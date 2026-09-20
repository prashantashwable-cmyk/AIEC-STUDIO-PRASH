import React, { useState, useEffect } from 'react';
import { User, TechnicianJob, MaterialUsageLogItem } from '../types';
import { DbManager } from '../lib/db';
import { 
  ClipboardList, ArrowLeft, CheckCircle2, AlertTriangle, Plus, 
  RefreshCw, FileCheck, Layers, Sparkles, Box, Edit2, ShieldCheck
} from 'lucide-react';
import { Card, Button } from './Common';

interface MaterialUsageLoggingScreenProps {
  user: User;
  jobId: string;
  onBack: () => void;
}

export const MaterialUsageLoggingScreen: React.FC<MaterialUsageLoggingScreenProps> = ({
  user,
  jobId,
  onBack
}) => {
  const [job, setJob] = useState<TechnicianJob | null>(null);
  const [materials, setMaterials] = useState<MaterialUsageLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit item modal state
  const [editingItem, setEditingItem] = useState<MaterialUsageLogItem | null>(null);
  const [usedQtyInput, setUsedQtyInput] = useState<number>(0);
  const [serialInput, setSerialInput] = useState<string>('');
  const [deviationReasonInput, setDeviationReasonInput] = useState<MaterialUsageLogItem['deviationReason']>('site_custom_bracket_added');
  const [returnPoolInput, setReturnPoolInput] = useState<boolean>(false);

  // Add new part modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartCategory, setNewPartCategory] = useState<MaterialUsageLogItem['partCategory']>('Fasteners & Consumables');
  const [newPlannedQty, setNewPlannedQty] = useState(1);
  const [newUsedQty, setNewUsedQty] = useState(1);
  const [newUnit, setNewUnit] = useState('Pieces');

  // Confirmation state
  const [isSignoffComplete, setIsSignoffComplete] = useState(false);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const foundJob = DbManager.getTechnicianJobById(jobId);
      const list = DbManager.getMaterialUsageLogs(jobId);
      setJob(foundJob || null);
      setMaterials(list);
      setIsLoading(false);
    }, 300);
  };

  const handleOpenEdit = (item: MaterialUsageLogItem) => {
    setEditingItem(item);
    setUsedQtyInput(item.usedQuantity);
    setSerialInput(item.serialOrBatchNumber);
    setDeviationReasonInput(item.deviationReason || 'site_custom_bracket_added');
    setReturnPoolInput(item.returnToReusablePool);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    const hasDev = usedQtyInput !== editingItem.plannedQuantity;

    const updated: MaterialUsageLogItem = {
      ...editingItem,
      usedQuantity: usedQtyInput,
      serialOrBatchNumber: serialInput.trim() || 'NOT_LEGIBLE',
      hasDeviation: hasDev,
      deviationReason: hasDev ? deviationReasonInput : undefined,
      returnToReusablePool: returnPoolInput,
      loggedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
    };

    DbManager.updateMaterialUsageLog(updated);
    setEditingItem(null);
    loadData();
  };

  const handleAddNewItem = () => {
    if (!newPartName.trim()) return;

    const newItem: MaterialUsageLogItem = {
      id: 'mat_custom_' + Date.now(),
      jobId,
      partName: newPartName.trim(),
      partCategory: newPartCategory,
      plannedQuantity: newPlannedQty,
      usedQuantity: newUsedQty,
      unit: newUnit,
      serialOrBatchNumber: 'SN-FIELD-' + Math.floor(Math.random() * 8999 + 1000),
      hasDeviation: newUsedQty !== newPlannedQty,
      returnToReusablePool: false,
      loggedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
    };

    DbManager.addMaterialUsageLog(newItem);
    setShowAddModal(false);
    setNewPartName('');
    loadData();
  };

  const handleFinalSignoff = () => {
    setIsSignoffComplete(true);
  };

  if (isLoading || !job) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-[var(--color-border)] opacity-30 rounded w-1/3"></div>
        <div className="h-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl"></div>
      </div>
    );
  }

  const deviationCount = materials.filter(m => m.hasDeviation).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to SOP Hub
        </button>

        <Button
          variant="outline"
          onClick={() => setShowAddModal(true)}
          className="text-xs py-1.5 px-3 flex items-center gap-1 border-antiquegold/40 text-antiquegold"
        >
          <Plus className="w-3.5 h-3.5" /> Log Additional Material
        </Button>
      </div>

      {/* Screen Title */}
      <Card className="p-5 border border-[var(--color-accent-primary)]/30 bg-[var(--color-surface)] rounded-2xl space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
          <div>
            <div className="text-xs font-mono text-antiquegold uppercase font-bold tracking-wider flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4" /> As-Installed Bill of Materials (BOM)
            </div>
            <h1 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mt-0.5">
              Material Usage Logging & Reconciliation
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Site: <strong className="text-[var(--color-text-primary)]">{job.customerName}</strong> • Serial Number Traceability for Warranty
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-[var(--color-text-secondary)] font-mono block">BOM Deviations</span>
            <span className="text-xl font-serif font-bold font-mono text-amber-600">
              {deviationCount} Items Flagged
            </span>
          </div>
        </div>

        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          Log actual installed quantities against original delivery BOM. Serial/batch numbers logged here form the permanent digital warranty record for this customer's installation.
        </p>
      </Card>

      {/* Material Log Items Table / Cards */}
      <div className="space-y-3">
        {materials.map((item) => (
          <Card
            key={item.id}
            className={`p-4 border rounded-2xl space-y-3 transition-all ${
              item.hasDeviation 
                ? 'border-amber-500/40 bg-amber-500/5' 
                : 'border-[var(--color-border)] bg-[var(--color-surface)]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-antiquegold tracking-wider block">
                  {item.partCategory}
                </span>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                  {item.partName}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)] font-mono">
                  <span>Serial/Batch: <strong className="text-[var(--color-text-primary)]">{item.serialOrBatchNumber}</strong></span>
                  {item.returnToReusablePool && (
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded font-bold">
                      Returned to Tech Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-mono">
                  Planned: <span className="font-bold">{item.plannedQuantity} {item.unit}</span>
                </div>
                <div className="text-sm font-serif font-bold font-mono text-antiquegold mt-0.5">
                  Used: {item.usedQuantity} {item.unit}
                </div>
              </div>
            </div>

            {/* Deviation Callout if applicable */}
            {item.hasDeviation && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold block">BOM Quantity Deviation:</span>
                  <span>Reason: {item.deviationReason?.replace(/_/g, ' ')}</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 rounded font-mono">
                  {item.usedQuantity > item.plannedQuantity ? `+${item.usedQuantity - item.plannedQuantity}` : `${item.usedQuantity - item.plannedQuantity}`} {item.unit}
                </span>
              </div>
            )}

            {/* Item Action Footer */}
            <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
                {item.loggedAt ? `Logged at ${item.loggedAt}` : 'Pre-loaded from delivery note'}
              </span>

              <Button
                variant="outline"
                onClick={() => handleOpenEdit(item)}
                className="text-xs py-1 px-3 flex items-center gap-1 border-[var(--color-border)]"
              >
                <Edit2 className="w-3 h-3 text-antiquegold" /> Edit Usage / Serial
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Final Confirmation Banner */}
      <Card className="p-5 border border-emerald-500/30 bg-emerald-500/5 rounded-2xl space-y-3 text-center">
        {isSignoffComplete ? (
          <div className="space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
              Material Reconciliation Signed-Off!
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Digital warranty record updated in AIEC Central System.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
              Confirm Final Installed Material Sign-off
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">
              Verify all used parts and batch serial numbers before submitting for QC warranty filing.
            </p>
            <Button
              onClick={handleFinalSignoff}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 shadow-md"
            >
              Sign-Off Installed Material BOM
            </Button>
          </div>
        )}
      </Card>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-2xl">
            <h3 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
              Edit Usage Log: {editingItem.partName}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[var(--color-text-primary)] block mb-1">
                  Actual Quantity Used ({editingItem.unit}):
                </label>
                <input
                  type="number"
                  min={0}
                  value={usedQtyInput}
                  onChange={(e) => setUsedQtyInput(Number(e.target.value))}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--color-text-primary)] block mb-1">
                  Serial / Batch Number (Enter 'NOT_LEGIBLE' if damaged):
                </label>
                <input
                  type="text"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)]"
                />
              </div>

              {usedQtyInput !== editingItem.plannedQuantity && (
                <div>
                  <label className="font-semibold text-[var(--color-text-primary)] block mb-1">
                    Deviation Reason:
                  </label>
                  <select
                    value={deviationReasonInput}
                    onChange={(e) => setDeviationReasonInput(e.target.value as any)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)]"
                  >
                    <option value="defective_replaced_from_spare">Defective part replaced from spare</option>
                    <option value="site_custom_bracket_added">Site custom bracket added</option>
                    <option value="spare_tech_stock_used">Spare tech general stock used</option>
                    <option value="extra_length_required">Extra length required</option>
                    <option value="not_required">Not required on site layout</option>
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[var(--color-text-primary)] pt-1">
                <input
                  type="checkbox"
                  checked={returnPoolInput}
                  onChange={(e) => setReturnPoolInput(e.target.checked)}
                  className="rounded border-[var(--color-border)] text-antiquegold"
                />
                <span>Return leftover unused quantity to technician spare pool</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingItem(null)} className="text-xs">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="bg-antiquegold text-white text-xs">
                Save Usage Details
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add New Part Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-2xl">
            <h3 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
              Log Additional Field Material
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[var(--color-text-primary)] block mb-1">Part / Material Name:</label>
                <input
                  type="text"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  placeholder="E.g., M10 Anchor Shield Bolt or Cable Tray Extension..."
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2 text-xs text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--color-text-primary)] block mb-1">Category:</label>
                <select
                  value={newPartCategory}
                  onChange={(e) => setNewPartCategory(e.target.value as any)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2 text-xs text-[var(--color-text-primary)]"
                >
                  <option value="Guide Rails & Brackets">Guide Rails & Brackets</option>
                  <option value="Machine & Traction">Machine & Traction</option>
                  <option value="Control Panel & Cables">Control Panel & Cables</option>
                  <option value="Cabin & Fixtures">Cabin & Fixtures</option>
                  <option value="Doors & Hardware">Doors & Hardware</option>
                  <option value="Fasteners & Consumables">Fasteners & Consumables</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[var(--color-text-primary)] block mb-1">Quantity Used:</label>
                  <input
                    type="number"
                    min={1}
                    value={newUsedQty}
                    onChange={(e) => setNewUsedQty(Number(e.target.value))}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2 text-xs text-[var(--color-text-primary)]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--color-text-primary)] block mb-1">Unit:</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2 text-xs text-[var(--color-text-primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button onClick={handleAddNewItem} disabled={!newPartName.trim()} className="bg-antiquegold text-white text-xs">
                Add to Installed BOM
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};