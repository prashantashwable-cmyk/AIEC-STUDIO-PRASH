import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, ShieldCheck, ShieldAlert, AlertTriangle, 
  Building2, Phone, Mail, MapPin, Star, UserPlus, GitMerge, 
  CheckCircle2, XCircle, ChevronRight, Layers, FileText, Lock, Sparkles, RefreshCw
} from 'lucide-react';
import { Card, Button } from './Common';
import { User, Supplier, SupplierCatalogItem } from '../types';
import { DbManager } from '../lib/db';
import { useLanguage } from '../lib/language';

interface SupplierDirectoryProps {
  user: User;
  onNavigateToPoGenerator?: (supplierId?: string) => void;
}

export const SupplierDirectory: React.FC<SupplierDirectoryProps> = ({
  user,
  onNavigateToPoGenerator
}) => {
  const { t } = useLanguage(user);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterKyc, setFilterKyc] = useState<string>('all');

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Modal 1: Quick Invite / Onboarding Wizard
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteStep, setInviteStep] = useState<number>(1);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [newRegion, setNewRegion] = useState('Chakan Industrial Area / Pune');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Traction Drives']);

  // Modal 2: Deactivate / Suspend Supplier
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  // Modal 3: Add Custom Specialty Category
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Modal 4: Merge Duplicate Suppliers
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [canonicalId, setCanonicalId] = useState('');
  const [duplicateId, setDuplicateId] = useState('');

  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const loadData = () => {
    const list = DbManager.getSuppliers();
    setSuppliers(list);
  };

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, [user]);

  // Handle Quick Onboard Submission
  const handleCompleteOnboarding = () => {
    if (!newSupplierName || !newContactPerson || !newPhone) {
      setNotification({ msg: 'Please complete required supplier contact details.', type: 'error' });
      return;
    }

    const id = `sup_${Date.now().toString(36)}`;
    const newSup: Supplier = {
      id,
      name: newSupplierName,
      contactPerson: newContactPerson,
      phone: newPhone,
      email: newEmail || undefined,
      gstin: newGstin || undefined,
      status: 'active',
      kycStatus: 'Verified',
      specialtyCategories: selectedSpecialties,
      regionServed: newRegion,
      performanceScore: 88,
      onboardingProgress: 4,
      activeOrdersCount: 0,
      completedOrdersCount: 0,
      catalog: [
        { itemId: `cat_${Date.now()}_1`, itemName: 'Standard Component Kit', price: 50000, category: selectedSpecialties[0] || 'General' }
      ],
      createdAt: new Date().toISOString()
    };

    DbManager.addSupplier(newSup);
    setShowInviteModal(false);
    resetInviteForm();
    setNotification({ msg: `Supplier "${newSup.name}" onboarded & KYC verified successfully. Enabled for Purchase Orders.`, type: 'success' });
  };

  const resetInviteForm = () => {
    setNewSupplierName('');
    setNewContactPerson('');
    setNewPhone('');
    setNewEmail('');
    setNewGstin('');
    setInviteStep(1);
    setSelectedSpecialties(['Traction Drives']);
  };

  // Handle Suspend Supplier
  const handleConfirmSuspend = () => {
    if (!selectedSupplier) return;
    if (!suspendReason) {
      setNotification({ msg: 'Please state a reason for suspending this supplier.', type: 'error' });
      return;
    }

    const updated: Supplier = {
      ...selectedSupplier,
      status: 'suspended',
      kycStatus: 'Suspended',
      suspensionReason: suspendReason
    };

    DbManager.updateSupplier(updated);
    setShowSuspendModal(false);
    setSelectedSupplier(null);
    setSuspendReason('');
    setNotification({ 
      msg: `🛑 Supplier "${selectedSupplier.name}" suspended. Excluded from new Auto-PO triggers. Active in-flight POs remain monitored.`, 
      type: 'success' 
    });
  };

  // Handle Reactivate Supplier
  const handleReactivate = (sup: Supplier) => {
    const updated: Supplier = {
      ...sup,
      status: 'active',
      kycStatus: 'Verified',
      suspensionReason: undefined
    };
    DbManager.updateSupplier(updated);
    setNotification({ msg: `✅ Supplier "${sup.name}" reactivated and marked KYC Verified for Purchase Orders.`, type: 'success' });
  };

  // Handle Add Custom Specialty
  const handleAddCustomSpecialty = () => {
    if (!customCategoryName || !selectedSupplier) return;

    const updatedCategories = Array.from(new Set([...selectedSupplier.specialtyCategories, customCategoryName]));
    const updated: Supplier = {
      ...selectedSupplier,
      specialtyCategories: updatedCategories
    };

    DbManager.updateSupplier(updated);
    setShowCategoryModal(false);
    setCustomCategoryName('');
    setSelectedSupplier(updated);
    setNotification({ msg: `New specialty category "${customCategoryName}" registered for ${selectedSupplier.name}.`, type: 'success' });
  };

  // Handle Merge Suppliers
  const handleExecuteMerge = () => {
    if (!canonicalId || !duplicateId) {
      setNotification({ msg: 'Please select both canonical and duplicate supplier records to merge.', type: 'error' });
      return;
    }
    if (canonicalId === duplicateId) {
      setNotification({ msg: 'Canonical and duplicate supplier cannot be the same.', type: 'error' });
      return;
    }

    DbManager.mergeSuppliers(canonicalId, duplicateId);
    setShowMergeModal(false);
    setCanonicalId('');
    setDuplicateId('');
    setNotification({ msg: 'Supplier records merged successfully! Order histories consolidated under canonical supplier.', type: 'success' });
  };

  // Extract list of all specialty categories & regions
  const allSpecialties = Array.from(new Set(suppliers.flatMap(s => s.specialtyCategories)));
  const allRegions = Array.from(new Set(suppliers.map(s => s.regionServed)));

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.phone && s.phone.includes(searchQuery)) ||
      (s.gstin && s.gstin.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSpecialty = filterSpecialty === 'all' || s.specialtyCategories.includes(filterSpecialty);
    const matchesRegion = filterRegion === 'all' || s.regionServed === filterRegion;
    const matchesKyc = filterKyc === 'all' || s.kycStatus === filterKyc;

    return matchesSearch && matchesSpecialty && matchesRegion && matchesKyc;
  });

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
          notification.type === 'success' ? 'bg-royalemerald/10 border-royalemerald/30 text-royalemerald' : 'bg-error/10 border-error/30 text-error'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.msg}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-warmgray hover:text-charcoal font-mono">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[rgba(184,135,61,0.2)] shadow-diffuse flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-antiquegold/10 text-antiquegold text-[10px] font-bold tracking-widest uppercase rounded-full font-mono">
              Module 10 • Supplier & Manufacturer Network
            </span>
            <span className="px-2 py-0.5 bg-royalemerald/10 text-royalemerald text-[10px] font-bold rounded-full font-mono">
              KYC Gated Compliance
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
            Supplier Directory & Onboarding
          </h1>
          <p className="text-xs text-warmgray mt-1">
            Asset-light aggregator core: manage qualified component manufacturers, verified drive-type specialties, and real-time performance scores.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="secondary" 
            onClick={() => setShowMergeModal(true)} 
            className="text-xs py-2"
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Merge Duplicates</span>
          </Button>

          <Button 
            variant="emerald" 
            onClick={() => setShowInviteModal(true)} 
            className="text-xs py-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Onboard New Supplier</span>
          </Button>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-warmgray" />
          <input
            type="text"
            placeholder="Search supplier name, contact person, phone number, GSTIN..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl pl-9 pr-4 py-2 text-xs text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-warmgray uppercase mb-1 font-mono">Drive / Specialty Category</label>
            <select
              value={filterSpecialty}
              onChange={e => setFilterSpecialty(e.target.value)}
              className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal font-bold outline-none"
            >
              <option value="all">All Drive Types & Specialties</option>
              {allSpecialties.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-warmgray uppercase mb-1 font-mono">Region Served</label>
            <select
              value={filterRegion}
              onChange={e => setFilterRegion(e.target.value)}
              className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal font-bold outline-none"
            >
              <option value="all">All Regions</option>
              {allRegions.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-warmgray uppercase mb-1 font-mono">KYC Compliance Status</label>
            <select
              value={filterKyc}
              onChange={e => setFilterKyc(e.target.value)}
              className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal font-bold outline-none"
            >
              <option value="all">All KYC Statuses</option>
              <option value="Verified">Verified (PO Eligible)</option>
              <option value="Pending">Pending Audit</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Supplier List */}
      <div className="space-y-4">
        {filteredSuppliers.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <Building2 className="w-10 h-10 text-warmgray mx-auto" />
            <h3 className="font-serif text-lg font-bold text-charcoal">No Matching Suppliers Found</h3>
            <p className="text-xs text-warmgray">Adjust search terms or onboard a new manufacturing partner to populate the directory.</p>
            <Button variant="emerald" onClick={() => setShowInviteModal(true)} className="text-xs">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Onboard New Supplier</span>
            </Button>
          </Card>
        ) : (
          filteredSuppliers.map(sup => {
            const isSuspended = sup.status === 'suspended' || sup.kycStatus === 'Suspended';
            const isVerified = sup.kycStatus === 'Verified';

            return (
              <Card 
                key={sup.id}
                className={`p-6 bg-white border rounded-3xl transition-all shadow-xs space-y-4 ${
                  isSuspended ? 'border-error/30 bg-error/5' : 'border-[rgba(184,135,61,0.2)]'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(184,135,61,0.12)] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-charcoal">{sup.id}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full font-mono uppercase flex items-center gap-1 ${
                        isVerified ? 'bg-royalemerald/15 text-royalemerald' :
                        isSuspended ? 'bg-error/20 text-error' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {isVerified ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        <span>KYC: {sup.kycStatus}</span>
                      </span>

                      {isSuspended && (
                        <span className="px-2 py-0.5 bg-error text-white text-[9px] font-bold rounded-full font-mono uppercase">
                          No New POs Allowed
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-bold text-charcoal mt-1">{sup.name}</h3>
                    <p className="text-xs text-warmgray font-mono flex items-center gap-2 mt-0.5">
                      <span>👤 {sup.contactPerson || 'Key Account Desk'}</span>
                      <span>• 📞 {sup.phone}</span>
                      {sup.gstin && <span>• GST: {sup.gstin}</span>}
                    </p>
                  </div>

                  {/* Performance Score Badge */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.15)] text-center">
                      <p className="text-[9px] text-warmgray font-mono uppercase font-bold">Performance Score</p>
                      <div className="flex items-center justify-center gap-1 text-antiquegold mt-0.5">
                        <Star className="w-4 h-4 fill-antiquegold" />
                        <span className="font-mono text-lg font-extrabold text-charcoal">
                          {sup.performanceScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specialties & Region Tags */}
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-warmgray font-bold font-mono text-[10px] uppercase mr-1">Specialties:</span>
                    {sup.specialtyCategories.map(cat => (
                      <span key={cat} className="px-2.5 py-1 bg-antiquegold/10 text-antiquegold font-bold text-[11px] rounded-lg border border-antiquegold/20">
                        {cat}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSupplier(sup);
                        setShowCategoryModal(true);
                      }}
                      className="px-2 py-1 bg-alabaster hover:bg-antiquegold/10 text-warmgray hover:text-antiquegold font-bold text-[10px] rounded-lg border border-dashed border-[#e6dfd4] transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Category</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-warmgray">
                    <MapPin className="w-3.5 h-3.5 text-royalemerald shrink-0" />
                    <span>Region Served: <strong className="text-charcoal">{sup.regionServed}</strong></span>
                  </div>
                </div>

                {/* Suspension Warning Box */}
                {isSuspended && sup.suspensionReason && (
                  <div className="p-3 bg-error/10 border border-error/20 rounded-2xl text-xs text-error space-y-1">
                    <p className="font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Suspension Order Log:</span>
                    </p>
                    <p className="text-error/90 leading-relaxed">{sup.suspensionReason}</p>
                  </div>
                )}

                {/* Catalog Overview Preview */}
                <div className="p-3 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.1)] text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold text-charcoal">
                    <span className="flex items-center gap-1.5 text-antiquegold">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Component Catalog ({sup.catalog.length} items)</span>
                    </span>
                    <span className="text-warmgray font-mono text-[10px]">
                      Orders: {sup.completedOrdersCount || 0} Delivered • {sup.activeOrdersCount || 0} Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                    {sup.catalog.map(item => (
                      <div key={item.itemId} className="p-2 bg-white rounded-xl border border-[#e6dfd4] flex justify-between items-center">
                        <span className="text-charcoal font-sans truncate pr-2">{item.itemName}</span>
                        <span className="font-bold text-royalemerald">₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-[rgba(184,135,61,0.1)]">
                  {onNavigateToPoGenerator && (
                    <Button
                      variant={isVerified ? "emerald" : "secondary"}
                      disabled={!isVerified}
                      className="text-xs py-2"
                      onClick={() => onNavigateToPoGenerator(sup.id)}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isVerified ? 'Draft Purchase Order' : 'Cannot Draft PO (KYC Pending)'}</span>
                    </Button>
                  )}

                  <div className="flex gap-2">
                    {isSuspended ? (
                      <Button
                        variant="secondary"
                        className="text-xs py-2 bg-royalemerald/10 text-royalemerald hover:bg-royalemerald/20 border-royalemerald/30"
                        onClick={() => handleReactivate(sup)}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reactivate & Restore KYC</span>
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="text-xs py-2 text-error border-error/30 hover:bg-error/10"
                        onClick={() => {
                          setSelectedSupplier(sup);
                          setShowSuspendModal(true);
                        }}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Deactivate / Suspend</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* MODAL 1: ONBOARDING WIZARD (ASCENSION LINE MOTIF) */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-lg w-full bg-white border border-[rgba(184,135,61,0.25)] rounded-3xl space-y-5 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-antiquegold tracking-widest">
                  Ascension Line Onboarding Gate
                </span>
                <h3 className="font-serif text-xl font-bold text-charcoal mt-0.5">
                  Onboard Component Supplier
                </h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-warmgray hover:text-charcoal font-mono">✕</button>
            </div>

            {/* Ascension Line Rail Motif */}
            <div className="relative pl-6 space-y-4 border-l-2 border-antiquegold/30">
              <div className={`relative ${inviteStep >= 1 ? 'text-royalemerald font-bold' : 'text-warmgray'}`}>
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-antiquegold flex items-center justify-center text-[9px]">
                  1
                </span>
                <p className="text-xs">Step 1: Contact & GSTIN Credentials</p>
              </div>

              <div className={`relative ${inviteStep >= 2 ? 'text-royalemerald font-bold' : 'text-warmgray'}`}>
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-antiquegold flex items-center justify-center text-[9px]">
                  2
                </span>
                <p className="text-xs">Step 2: Specialty Drive Categories & Region</p>
              </div>
            </div>

            {/* Form Fields Step 1 */}
            {inviteStep === 1 && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Company / Manufacturer Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Pune Hydraulics & Elevators Ltd"
                    value={newSupplierName}
                    onChange={e => setNewSupplierName(e.target.value)}
                    className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-charcoal mb-1">Contact Person *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kulkarni"
                      value={newContactPerson}
                      onChange={e => setNewContactPerson(e.target.value)}
                      className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal mb-1">Phone Number *</label>
                    <input
                      type="text"
                      placeholder="+91 98220 00000"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-charcoal mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="orders@supplier.co.in"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      placeholder="27AABC1234F1Z0"
                      value={newGstin}
                      onChange={e => setNewGstin(e.target.value)}
                      className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal font-mono uppercase outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button variant="emerald" onClick={() => setInviteStep(2)} className="text-xs">
                    <span>Next: Select Specialties</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Form Fields Step 2 */}
            {inviteStep === 2 && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Region Served *</label>
                  <select
                    value={newRegion}
                    onChange={e => setNewRegion(e.target.value)}
                    className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal font-bold outline-none"
                  >
                    <option value="Chakan Industrial Area / Pune">Chakan Industrial Area / Pune</option>
                    <option value="Bhiwandi Logistics Hub / Mumbai Region">Bhiwandi Logistics Hub / Mumbai Region</option>
                    <option value="PCMC & Pan-Maharashtra">PCMC & Pan-Maharashtra</option>
                    <option value="Hadapsar Industrial Zone, Pune">Hadapsar Industrial Zone, Pune</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Drive & Specialty Categories *</label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      'Traction Drives', 'MRL Gearless Machines', 'VVVF Controllers', 
                      'Hydraulic Drives', 'Vacuum Pneumatic Systems', 'Accessibility Lifts (IS 14671)',
                      'Cabin Frames & Slings', 'Counterweights', 'Door Operators'
                    ].map(cat => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer bg-alabaster p-2 rounded-xl border border-[#e6dfd4]">
                        <input
                          type="checkbox"
                          checked={selectedSpecialties.includes(cat)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedSpecialties([...selectedSpecialties, cat]);
                            } else {
                              setSelectedSpecialties(selectedSpecialties.filter(c => c !== cat));
                            }
                          }}
                          className="rounded border-[#e6dfd4] text-royalemerald focus:ring-royalemerald"
                        />
                        <span className="text-[11px] font-bold text-charcoal">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button variant="secondary" fullWidth onClick={() => setInviteStep(1)}>Back</Button>
                  <Button variant="emerald" fullWidth onClick={handleCompleteOnboarding}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Confirm & Authorize KYC</span>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MODAL 2: SUSPEND SUPPLIER */}
      {showSuspendModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-white border border-error/30 space-y-4 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-2 text-error">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-serif text-lg font-bold">Deactivate / Suspend Supplier</h3>
            </div>

            <p className="text-xs text-warmgray leading-relaxed">
              Suspending <strong className="text-charcoal">{selectedSupplier.name}</strong> immediately excludes them from Auto-PO candidate rules.
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1 text-amber-900">
              <p className="font-bold uppercase font-mono tracking-wider">⚠️ In-Flight PO Rule:</p>
              <p className="text-[11px]">
                Active orders currently in production remain allowed to complete under close Admin monitoring to prevent stranding customer sites.
              </p>
            </div>

            <div>
              <label className="block font-bold text-charcoal text-xs mb-1">Reason for Suspension *</label>
              <textarea
                rows={3}
                placeholder="e.g. Failed QC standards on door sensor tolerances or delivery SLA delays..."
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl p-3 text-xs text-charcoal outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" fullWidth onClick={() => setShowSuspendModal(false)}>Cancel</Button>
              <Button variant="primary" fullWidth onClick={handleConfirmSuspend} className="bg-error text-white hover:bg-error/90">
                Confirm Suspension
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 3: ADD CUSTOM SPECIALTY CATEGORY */}
      {showCategoryModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-white rounded-3xl space-y-4 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-charcoal">Add Custom Specialty Category</h3>
            <p className="text-xs text-warmgray">
              Register a niche drive or component specialty (e.g., Accessibility Lifts per IS 14671) for {selectedSupplier.name}.
            </p>

            <div>
              <label className="block font-bold text-charcoal text-xs mb-1">Specialty Category Name *</label>
              <input
                type="text"
                placeholder="e.g. Accessibility Lifts (IS 14671) or Vacuum Pneumatic Seals"
                value={customCategoryName}
                onChange={e => setCustomCategoryName(e.target.value)}
                className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" fullWidth onClick={() => setShowCategoryModal(false)}>Cancel</Button>
              <Button variant="emerald" fullWidth onClick={handleAddCustomSpecialty}>Add Specialty</Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 4: MERGE DUPLICATE SUPPLIERS */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-lg w-full bg-white rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-antiquegold">
              <GitMerge className="w-6 h-6" />
              <h3 className="font-serif text-lg font-bold text-charcoal">Merge Duplicate Supplier Records</h3>
            </div>

            <p className="text-xs text-warmgray">
              Consolidate duplicate supplier entries. All order history, active POs, and catalogs will be merged into the canonical supplier.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Select Canonical Master Supplier *</label>
                <select
                  value={canonicalId}
                  onChange={e => setCanonicalId(e.target.value)}
                  className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal font-bold outline-none"
                >
                  <option value="">-- Choose Canonical Supplier --</option>
                  {suppliers.filter(s => s.status === 'active').map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Select Duplicate Record to Merge & Inactivate *</label>
                <select
                  value={duplicateId}
                  onChange={e => setDuplicateId(e.target.value)}
                  className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal font-bold outline-none"
                >
                  <option value="">-- Choose Duplicate Supplier --</option>
                  {suppliers.filter(s => s.id !== canonicalId).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" fullWidth onClick={() => setShowMergeModal(false)}>Cancel</Button>
              <Button variant="emerald" fullWidth onClick={handleExecuteMerge}>
                <GitMerge className="w-3.5 h-3.5" />
                <span>Execute Record Merge</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
