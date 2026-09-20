import React, { useState, useEffect } from 'react';
import { 
  Settings, Layers, Plus, Trash2, CheckCircle2, History, Eye, Save, 
  FileText, Shield, AlertTriangle, ArrowRight, Sparkles, Clock, Edit2, Camera
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { DeliverySopTemplate, DeliverySopStep, User as UserType } from '../types';

interface Props {
  user: UserType;
}

export const DeliverySopConfigScreen: React.FC<Props> = ({ user }) => {
  const [templates, setTemplates] = useState<DeliverySopTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('cabin_panels');
  const [activeTemplate, setActiveTemplate] = useState<DeliverySopTemplate | null>(null);

  // Edit step state
  const [editingSteps, setEditingSteps] = useState<DeliverySopStep[]>([]);
  const [versionNotes, setVersionNotes] = useState('');
  
  // New step creation state
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepInstruction, setNewStepInstruction] = useState('');
  const [newStepMandatory, setNewStepMandatory] = useState(true);
  const [newStepPhoto, setNewStepPhoto] = useState(true);
  const [newStepSafety, setNewStepSafety] = useState(false);
  const [newStepFragility, setNewStepFragility] = useState(false);

  // Live Technician Preview Modal
  const [showTechPreview, setShowTechPreview] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = DbManager.getDeliverySopTemplates();
    setTemplates(list);

    const match = list.find(t => t.componentCategory === selectedCategory) || list[0];
    if (match) {
      setActiveTemplate(match);
      setEditingSteps([...match.steps]);
    }
  };

  const handleCategorySelect = (catKey: string) => {
    setSelectedCategory(catKey);
    const match = templates.find(t => t.componentCategory === catKey);
    if (match) {
      setActiveTemplate(match);
      setEditingSteps([...match.steps]);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddStep = () => {
    if (!newStepTitle.trim() || !newStepInstruction.trim()) return;

    const newStep: DeliverySopStep = {
      id: `step_custom_${Date.now()}`,
      title: newStepTitle,
      instruction: newStepInstruction,
      isMandatory: newStepMandatory,
      requiresPhoto: newStepPhoto,
      requiresQuantityVerification: true,
      fragilityCheck: newStepFragility,
      safetyCritical: newStepSafety
    };

    setEditingSteps([...editingSteps, newStep]);
    setNewStepTitle('');
    setNewStepInstruction('');
    setShowAddStepModal(false);
    showToast('New verification step added to draft SOP template');
  };

  const handleRemoveStep = (stepId: string) => {
    setEditingSteps(editingSteps.filter(s => s.id !== stepId));
  };

  const handlePublishNewVersion = () => {
    if (!activeTemplate) return;

    const currentMajor = parseFloat(activeTemplate.sopVersion.replace('v', '')) || 2.0;
    const nextVersion = `v${(currentMajor + 0.1).toFixed(1)}`;

    const newVersionRecord = {
      version: nextVersion,
      effectiveDate: new Date().toISOString().split('T')[0],
      changedBy: user.name || 'Mr. Prashant Vasant Wable (Admin)',
      notes: versionNotes || 'Standard operational refinement update.',
      stepsCount: editingSteps.length
    };

    const updatedTemplate: DeliverySopTemplate = {
      ...activeTemplate,
      sopVersion: nextVersion,
      effectiveDate: new Date().toISOString().split('T')[0],
      steps: editingSteps,
      versionHistory: [newVersionRecord, ...activeTemplate.versionHistory],
      updatedAt: new Date().toISOString()
    };

    DbManager.updateDeliverySopTemplate(updatedTemplate);
    loadData();
    setVersionNotes('');
    showToast(`Master SOP Template updated to ${nextVersion} and set active for field technicians!`);
  };

  return (
    <div className="min-h-screen bg-alabaster text-charcoal p-4 md:p-6 pb-28 max-w-5xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-royalemerald text-white px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-antiquegold" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-antiquegold/20 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-antiquegold/10 text-antiquegold border border-antiquegold/20">
              SOP Step #7 • Central SOP Governance
            </span>
            <span className="text-xs text-charcoal/60">Module 11</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-1">
            Master Delivery SOP Checklist Configuration
          </h1>
          <p className="text-sm text-charcoal/70">
            Centrally governed delivery unboxing verification protocols enforced across all field technicians.
          </p>
        </div>

        <button
          onClick={() => setShowTechPreview(true)}
          className="px-4 py-2.5 rounded-xl border border-antiquegold text-charcoal text-xs font-bold hover:bg-antiquegold/10 transition flex items-center space-x-2 self-start md:self-auto"
        >
          <Eye className="w-4 h-4 text-antiquegold" />
          <span>Live Field Technician Preview</span>
        </button>
      </div>

      {/* Category Selection Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'cabin_panels', label: 'Cabin Panels & SS Shells' },
          { key: 'traction_machine', label: 'Traction Motors & Drives' },
          { key: 'control_panels', label: 'Microprocessor Control Panels' },
          { key: 'guide_rails', label: 'Guide Rails & Brackets' },
          { key: 'door_headers', label: 'Auto Door Headers' }
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => handleCategorySelect(cat.key)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition border ${
              selectedCategory === cat.key 
                ? 'bg-royalemerald text-white border-royalemerald shadow-md' 
                : 'bg-white text-charcoal/70 border-antiquegold/20 hover:bg-antiquegold/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {activeTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor Left 2 Cols */}
          <div className="lg:col-span-2 space-y-4">
            {/* Active SOP Template Card */}
            <div className="bg-white rounded-2xl p-5 border border-antiquegold/30 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-antiquegold text-white">
                      ACTIVE {activeTemplate.sopVersion}
                    </span>
                    <span className="text-xs text-charcoal/60">Effective: {activeTemplate.effectiveDate}</span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-charcoal mt-1">
                    {activeTemplate.categoryName}
                  </h2>
                </div>

                <button
                  onClick={() => setShowAddStepModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-antiquegold text-white text-xs font-bold shadow-sm hover:bg-antiquegold/90 transition flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Verification Step</span>
                </button>
              </div>

              <p className="text-xs text-charcoal/70 bg-gray-50 p-3 rounded-xl border border-gray-200">
                {activeTemplate.description}
              </p>

              {/* Steps Reorderable List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider text-charcoal/60">
                  Configured Verification Steps ({editingSteps.length})
                </h3>

                {editingSteps.map((step, idx) => (
                  <div 
                    key={step.id} 
                    className="bg-alabaster/50 border border-antiquegold/20 rounded-2xl p-4 space-y-2 relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-royalemerald/10 text-royalemerald font-mono font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-charcoal text-sm">{step.title}</h4>
                      </div>

                      <div className="flex items-center space-x-1">
                        {step.safetyCritical && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                            SAFETY CRITICAL
                          </span>
                        )}
                        {step.fragilityCheck && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            FRAGILE
                          </span>
                        )}
                        <button
                          onClick={() => handleRemoveStep(step.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                          title="Remove Step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-charcoal/70 pl-8">{step.instruction}</p>

                    <div className="flex flex-wrap items-center gap-3 pl-8 text-[11px] text-charcoal/60 pt-1">
                      <span className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-royalemerald" />
                        <span>{step.isMandatory ? 'Mandatory Step' : 'Optional Check'}</span>
                      </span>
                      {step.requiresPhoto && (
                        <span className="flex items-center space-x-1 text-antiquegold">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Photo Evidence Required</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Version Increment Publish Card */}
              <div className="bg-gradient-to-r from-royalemerald/5 to-antiquegold/5 border border-antiquegold/30 rounded-2xl p-4 space-y-3 pt-4">
                <h4 className="text-xs font-bold text-charcoal flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-antiquegold" />
                  <span>Release New SOP Version Iteration</span>
                </h4>

                <input
                  type="text"
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  placeholder="Enter change justification notes (e.g., Added photo check after lesson learned)..."
                  className="w-full text-xs bg-white border border-gray-300 rounded-xl p-2.5 text-charcoal focus:ring-1 focus:ring-antiquegold"
                />

                <button
                  onClick={handlePublishNewVersion}
                  className="w-full py-2.5 bg-royalemerald hover:bg-royalemerald/90 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4 text-antiquegold" />
                  <span>Publish Updated Version to Field Techs</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Col: Version Audit Trail History */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-antiquegold/20 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
                <History className="w-4 h-4 text-antiquegold" />
                <span>SOP Version Audit History</span>
              </h3>

              <div className="space-y-3">
                {activeTemplate.versionHistory.map((vh, vIdx) => (
                  <div key={vIdx} className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-royalemerald">{vh.version}</span>
                      <span className="text-[10px] font-mono text-gray-500">{vh.effectiveDate}</span>
                    </div>
                    <p className="text-charcoal/80 text-[11px]">{vh.notes}</p>
                    <p className="text-[10px] text-gray-500">By: {vh.changedBy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Step Modal */}
      {showAddStepModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-antiquegold">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal">Add Verification Step to SOP</h3>
              <button onClick={() => setShowAddStepModal(false)} className="text-gray-400 hover:text-charcoal">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Step Title</label>
                <input
                  type="text"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder="e.g. Heidenhain Encoder Seal Tamper Check"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Technician Instructions</label>
                <textarea
                  value={newStepInstruction}
                  onChange={(e) => setNewStepInstruction(e.target.value)}
                  rows={3}
                  placeholder="Clear field instructions on how technician must inspect this item..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStepMandatory}
                    onChange={(e) => setNewStepMandatory(e.target.checked)}
                    className="rounded text-royalemerald focus:ring-royalemerald"
                  />
                  <span>Mandatory Step</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStepPhoto}
                    onChange={(e) => setNewStepPhoto(e.target.checked)}
                    className="rounded text-antiquegold focus:ring-antiquegold"
                  />
                  <span>Require Photo Evidence</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStepSafety}
                    onChange={(e) => setNewStepSafety(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <span>Safety Critical</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStepFragility}
                    onChange={(e) => setNewStepFragility(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-600"
                  />
                  <span>Fragility Check</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => setShowAddStepModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStep}
                className="px-5 py-2 bg-royalemerald text-white rounded-xl text-xs font-bold shadow-md hover:bg-royalemerald/90 flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4 text-antiquegold" />
                <span>Add Step</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Technician Live Preview Modal */}
      {showTechPreview && activeTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-antiquegold">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-antiquegold" />
                <h3 className="font-serif font-bold text-lg text-charcoal">Field Technician View Preview</h3>
              </div>
              <button onClick={() => setShowTechPreview(false)} className="text-gray-400 hover:text-charcoal">✕</button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-royalemerald bg-emerald-100 px-2 py-0.5 rounded">
                SOP VERSION: {activeTemplate.sopVersion}
              </span>
              <h4 className="font-bold text-charcoal text-sm">{activeTemplate.categoryName}</h4>

              <div className="space-y-3 pt-2">
                {editingSteps.map((step, sIdx) => (
                  <div key={step.id} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" disabled className="rounded text-royalemerald" />
                      <span className="font-bold text-xs text-charcoal">{sIdx + 1}. {step.title}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 pl-5">{step.instruction}</p>
                    {step.requiresPhoto && (
                      <div className="pl-5">
                        <button disabled className="px-2.5 py-1 bg-gray-100 border text-gray-500 rounded text-[10px] flex items-center space-x-1">
                          <Camera className="w-3 h-3" />
                          <span>Attach Photo Proof</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowTechPreview(false)}
                className="px-4 py-2 bg-royalemerald text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
