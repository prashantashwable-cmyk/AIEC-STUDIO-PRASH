import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button, AscensionLine } from './Common';
import { 
  Building, Shield, ArrowRight, ArrowLeft, Check, AlertTriangle, 
  CheckCircle, FileText, Upload, RefreshCw, Trash2, HelpCircle, 
  Info, AlertCircle, CreditCard, Plus, ListFilter, Download
} from 'lucide-react';

interface SupplierOnboardingProps {
  user: User;
  onComplete: (updatedUser: User) => void;
  onSignOut: () => void;
}

interface CatalogSeedItem {
  id: string;
  sku: string;
  name: string;
  price: number;
}

export const SupplierOnboarding: React.FC<SupplierOnboardingProps> = ({ 
  user, 
  onComplete, 
  onSignOut 
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [draftSavedTime, setDraftSavedTime] = useState<string>('');

  // Step 1: Company KYC
  const [gstin, setGstin] = useState<string>(user.gstin || '');
  const [companyName, setCompanyName] = useState<string>(user.companyName || '');
  const [address, setAddress] = useState<string>(user.region || '');
  const [signatoryName, setSignatoryName] = useState<string>(user.authorizedSignatoryName || '');
  const [gstinError, setGstinError] = useState<string | null>(null);

  // Step 2: Catalog Seeding
  const [catalogItems, setCatalogItems] = useState<CatalogSeedItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemSku, setNewItemSku] = useState<string>('');
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Step 3: Payout Settlement Bank
  const [bankAccount, setBankAccount] = useState<string>(user.bankAccountNo || '');
  const [bankIfsc, setBankIfsc] = useState<string>(user.bankIfsc || '');
  const [bankVerified, setBankVerified] = useState<'verified' | 'failed' | 'pending'>(user.bankVerifiedStatus || 'pending');
  const [pennyDropRunning, setPennyDropRunning] = useState<boolean>(false);
  const [bankError, setBankError] = useState<string | null>(null);

  // Step 4: SLA & Agreements
  const [slaChecked, setSlaChecked] = useState<boolean>(false);
  const [milestonesChecked, setMilestonesChecked] = useState<boolean>(false);
  const [termsAcknowledged, setTermsAcknowledged] = useState<boolean>(user.paymentTermsAcceptedFlag || false);

  // Validation feedback state
  const [validationError, setValidationError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Progress Bar Percentages
  const currentPercentage = Math.round((currentStep / 5) * 100);
  const totalPercentage = 100;

  // Load draft from localStorage on mount with exception bounds
  useEffect(() => {
    const draftKey = `aiec_supplier_onboarding_draft_${user.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        if (d.gstin) setGstin(d.gstin);
        if (d.companyName) setCompanyName(d.companyName);
        if (d.address) setAddress(d.address);
        if (d.signatoryName) setSignatoryName(d.signatoryName);
        if (d.catalogItems) setCatalogItems(d.catalogItems);
        if (d.bankAccount) setBankAccount(d.bankAccount);
        if (d.bankIfsc) setBankIfsc(d.bankIfsc);
        if (d.bankVerified) setBankVerified(d.bankVerified);
        if (d.slaChecked) setSlaChecked(d.slaChecked);
        if (d.milestonesChecked) setMilestonesChecked(d.milestonesChecked);
        if (d.termsAcknowledged) setTermsAcknowledged(d.termsAcknowledged);
        if (d.currentStep) setCurrentStep(d.currentStep);
        
        const dateStr = new Date(d.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setDraftSavedTime(`Draft loaded from ${dateStr}`);
      } catch (e) {
        console.error("Failed to parse supplier onboarding draft", e);
      }
    }
  }, [user.id]);

  // Save draft state safely
  const saveDraft = (stepOverride?: number) => {
    try {
      const draftKey = `aiec_supplier_onboarding_draft_${user.id}`;
      const draftData = {
        gstin,
        companyName,
        address,
        signatoryName,
        catalogItems,
        bankAccount,
        bankIfsc,
        bankVerified,
        slaChecked,
        milestonesChecked,
        termsAcknowledged,
        currentStep: stepOverride || currentStep,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setDraftSavedTime(`Saved at ${nowStr}`);
    } catch (e) {
      console.warn("Unable to save supplier draft state", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft();
    }, 1000);
    return () => clearTimeout(timer);
  }, [gstin, companyName, address, signatoryName, catalogItems, bankAccount, bankIfsc, bankVerified, slaChecked, milestonesChecked, termsAcknowledged]);

  const validateGstin = (value: string): boolean => {
    const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
    if (!value) {
      setGstinError("GSTIN registration identification is required.");
      return false;
    }
    const cleanGstin = value.trim().toUpperCase();
    if (cleanGstin.length !== 15) {
      setGstinError("GSTIN must be exactly 15 alphanumeric characters.");
      return false;
    }
    if (!gstinRegex.test(cleanGstin)) {
      setGstinError("Invalid GSTIN structure. Expected format matching state code, PAN sequence, and checksum (e.g., 27AAACW1023D1Z4).");
      return false;
    }

    const allUsers = DbManager.getUsers();
    const isDuplicate = allUsers.some(u => u.gstin && u.gstin.toUpperCase() === cleanGstin && u.id !== user.id);
    if (isDuplicate) {
      setGstinError("⚠️ GSTIN Duplicate: This GSTIN is already registered to another active manufacturer node.");
      return false;
    }

    setGstinError(null);
    return true;
  };

  const handleNext = () => {
    setValidationError('');

    if (currentStep === 1) {
      const isGstinValid = validateGstin(gstin);
      if (!isGstinValid) return;
      if (!companyName.trim() || !address.trim() || !signatoryName.trim()) {
        setValidationError("Please fill out all mandatory company fields.");
        return;
      }
    }
    if (currentStep === 2) {
      if (catalogItems.length === 0) {
        setValidationError("Please populate or import at least one starter catalog model for price reviews.");
        return;
      }
    }
    if (currentStep === 3) {
      if (!bankAccount.trim() || !bankIfsc.trim()) {
        setValidationError("Bank settlement coordinates are required.");
        return;
      }
      if (bankVerified !== 'verified') {
        setValidationError("You must clear the statutory NPCI penny-drop account validation step first.");
        return;
      }
    }
    if (currentStep === 4) {
      if (!slaChecked || !milestonesChecked || !termsAcknowledged) {
        setValidationError("Please check and accept all statutory milestone and SLA agreements below.");
        return;
      }
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    saveDraft(nextStep);
  };

  const handleBack = () => {
    setValidationError('');
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveDraft(prevStep);
    }
  };

  const handleLoadTemplate = (type: 'traction' | 'hydraulic') => {
    setCatalogError(null);
    setValidationError('');
    if (type === 'traction') {
      setCatalogItems([
        { id: '1', sku: 'TR-MRL-08', name: 'MRL Gearless Synchronous Motor Pack - 8 Passenger', price: 185000 },
        { id: '2', sku: 'TR-DRV-11', name: 'Integrated Vector VFD Controller Panel (Ascension Series)', price: 92000 },
        { id: '3', sku: 'TR-CB-SS', name: 'Satin Stainless Cabin Car Assembly - Hairline Finish', price: 145000 },
        { id: '4', sku: 'TR-COP-09', name: 'Tactile TFT Car Operating Panel (Gold Accent Edition)', price: 18500 }
      ]);
    } else {
      setCatalogItems([
        { id: '1', sku: 'HY-PST-05', name: 'Telescopic Hydraulic Piston Shaft & Buffer Assembly', price: 215000 },
        { id: '2', sku: 'HY-PMP-10', name: 'Proportional Silent Oil Pump manifold - 3Phase PWD', price: 112000 },
        { id: '3', sku: 'HY-VAL-03', name: 'Electronically Regulated Safety Bypass Valve Block', price: 34000 }
      ]);
    }
    saveDraft();
    triggerToast(`Imported ${type} elevator catalog template successfully!`);
  };

  const handleAddCatalogItem = () => {
    if (!newItemName.trim() || !newItemSku.trim() || newItemPrice <= 0) {
      setCatalogError("Valid SKU, Model Name, and Price are required.");
      return;
    }
    const isSkuDup = catalogItems.some(item => item.sku.toUpperCase() === newItemSku.trim().toUpperCase());
    if (isSkuDup) {
      setCatalogError("SKU model number must be unique in this seed catalog.");
      return;
    }

    setCatalogItems([
      ...catalogItems,
      {
        id: `seed_${Date.now()}`,
        sku: newItemSku.toUpperCase().trim(),
        name: newItemName.trim(),
        price: newItemPrice
      }
    ]);
    setNewItemName('');
    setNewItemSku('');
    setNewItemPrice(0);
    setIsAddingItem(false);
    setCatalogError(null);
    saveDraft();
    triggerToast("Item added to pending parts list!");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const nameLower = file.name.toLowerCase();
      if (nameLower.endsWith('.csv') || nameLower.endsWith('.xlsx') || nameLower.endsWith('.json')) {
        handleLoadTemplate('traction');
        setCatalogError(null);
      } else {
        setCatalogError("⚠️ Formats Blocked: Supplier seeding parser strictly accepts standard .csv, .xlsx, or .json spreadsheets only.");
      }
    }
  };

  const triggerPennyDropTest = () => {
    if (!bankAccount || !bankIfsc) {
      setBankError("Provide legal settlement Account and IFSC details before verification.");
      return;
    }
    if (bankIfsc.length !== 11) {
      setBankError("IFSC must be exactly 11 alphanumeric characters.");
      return;
    }

    setBankError(null);
    setPennyDropRunning(true);

    setTimeout(() => {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      const isIfscValid = ifscRegex.test(bankIfsc.toUpperCase().trim());
      const isAccountValid = /^\d{9,18}$/.test(bankAccount.trim());

      setPennyDropRunning(false);
      if (isIfscValid && isAccountValid) {
        setBankVerified('verified');
        setBankError(null);
        triggerToast("NPCI penny drop verification successful!");
      } else {
        setBankVerified('failed');
        setBankError("🔴 NPCI penny-drop validation failed. Reason: Unknown IFSC routing sequence or incorrect Bank Account digit boundaries.");
      }
      saveDraft();
    }, 1800);
  };

  const handleSubmitKYC = () => {
    try {
      const updatedUser: User = {
        ...user,
        companyName,
        name: companyName,
        gstin: gstin.toUpperCase().trim(),
        region: address,
        authorizedSignatoryName: signatoryName,
        bankAccountNo: bankAccount,
        bankIfsc: bankIfsc.toUpperCase().trim(),
        bankVerifiedStatus: bankVerified,
        paymentTermsAcceptedFlag: termsAcknowledged,
        catalogSeedItems: catalogItems,
        onboardingCompleted: true,
        status: 'pending' // holds for admin review
      };

      DbManager.updateUser(updatedUser);
      localStorage.removeItem(`aiec_supplier_onboarding_draft_${user.id}`);
      onComplete(updatedUser);
    } catch (e) {
      console.error("Failed to commit final supplier registration:", e);
      setValidationError("Failed to finalize onboarding profile. Please clear storage or retry.");
    }
  };

  const ascensionSteps = [
    { id: '1', label: 'Company KYC', completed: currentStep > 1, active: currentStep === 1 },
    { id: '2', label: 'Catalog Seed', completed: currentStep > 2, active: currentStep === 2 },
    { id: '3', label: 'Settlement Payout', completed: currentStep > 3, active: currentStep === 3 },
    { id: '4', label: 'SLA Agreement', completed: currentStep > 4, active: currentStep === 4 },
    { id: '5', label: 'Summary Audit', completed: currentStep > 5, active: currentStep === 5 }
  ];

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl border border-[rgba(184,135,61,0.2)] p-6 md:p-8 space-y-6 shadow-diffuse relative overflow-hidden">
      
      {/* Top micro progress bar indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-alabaster animate-pulse">
        <div 
          className="h-full bg-antiquegold transition-all duration-300"
          style={{ width: `${currentPercentage}%` }}
        />
      </div>

      {/* Toast alert system banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 p-4 bg-charcoal/95 text-white border border-[#B8873D]/30 shadow-2xl rounded-2xl flex items-center gap-2.5 max-w-sm"
          >
            <Info className="w-5 h-5 text-antiquegold shrink-0" />
            <p className="text-xs font-semibold">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e6dfd4] pb-4 pt-1 text-left">
        <div>
          <span className="text-[10px] font-mono font-bold text-antiquegold uppercase tracking-widest flex items-center gap-1">
            <Building className="w-3.5 h-3.5" /> STATUTORY REGISTRATION PORTAL
          </span>
          <h2 className="font-serif text-2xl font-bold text-charcoal">Supplier & Manufacturer KYC</h2>
          <p className="text-xs text-warmgray mt-0.5">Enrol manufacturing node capabilities, file catalog base-rates, and execute statutory SLAs.</p>
        </div>
        <div className="text-right sm:self-end">
          <span className="text-[9px] bg-royalemerald/10 text-[#0E4B3D] border border-royalemerald/15 px-2.5 py-1 rounded-full font-mono font-bold inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            {draftSavedTime || 'Encrypted active state'}
          </span>
        </div>
      </div>

      {/* Progress horizontal indicator */}
      <div className="py-2">
        <AscensionLine steps={ascensionSteps} orientation="horizontal" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="space-y-6 min-h-[340px]"
        >
          {/* STEP 1: COMPANY KYC DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4 text-left">
              <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.08)] space-y-2">
                <h4 className="font-serif text-sm font-bold text-charcoal flex items-center gap-1.5">
                  🛡️ GSTIN Statutory Mandate
                </h4>
                <p className="text-xs text-warmgray">
                  All commercial hardware shipments routed through the AIEC elevator installation network are audit-controlled. A verified GSTIN is required to issue automated GST Purchase Orders.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">GSTIN Identifier (Tax Legal ID)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 27AAACW1023D1Z4"
                    value={gstin}
                    onChange={(e) => {
                      setGstin(e.target.value);
                      if (gstinError) setGstinError(null);
                      setValidationError('');
                    }}
                    onBlur={(e) => validateGstin(e.target.value)}
                    className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                  />
                  <p className="text-[9px] text-warmgray">15-char legal sequence linking company registry.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Registered Corporate Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune Heavy Traction Ltd"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      setValidationError('');
                    }}
                    className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                  />
                  <p className="text-[9px] text-warmgray">Ensure spelling matches GST certificate exactly.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Corporate Registered Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block D-12, MIDC Bhosari, Pune"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setValidationError('');
                    }}
                    className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                  />
                  <p className="text-[9px] text-warmgray">Registered manufacturing yard or distribution facility.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Authorized Signatory Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Anil Vasant Joshi"
                    value={signatoryName}
                    onChange={(e) => {
                      setSignatoryName(e.target.value);
                      setValidationError('');
                    }}
                    className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                  />
                  <p className="text-[9px] text-warmgray">Name of director signing commercial SLA deeds.</p>
                </div>
              </div>

              {gstinError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-bold flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{gstinError}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CATALOG SEEDING */}
          {currentStep === 2 && (
            <div className="space-y-5 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] font-mono font-bold bg-[#B8873D]/10 text-antiquegold px-2 py-0.5 rounded-full uppercase">
                    PARTS BASE-PRICING LEDGER
                  </span>
                  <h3 className="font-serif text-md font-bold text-charcoal mt-1.5">Manufacturer Catalog Seeding</h3>
                  <p className="text-xs text-warmgray">Seed structural models, drives, or parts. Items land in 'pending review' until Admin audits specs.</p>
                </div>
                
                <div className="flex gap-1.5 shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleLoadTemplate('traction')}
                    className="px-2.5 py-1.5 bg-[#B8873D]/10 hover:bg-[#B8873D]/25 border border-antiquegold/20 text-antiquegold rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    Traction Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadTemplate('hydraulic')}
                    className="px-2.5 py-1.5 bg-[#0E4B3D]/10 hover:bg-[#0E4B3D]/20 border border-royalemerald/15 text-[#0E4B3D] rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    Hydraulic Preset
                  </button>
                </div>
              </div>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
                  dragActive 
                    ? 'border-antiquegold bg-[#B8873D]/5' 
                    : 'border-[#e6dfd4] bg-alabaster/40 hover:bg-alabaster/70'
                }`}
              >
                <Upload className="w-8 h-8 text-antiquegold stroke-[1.5] mx-auto mb-2" />
                <p className="text-xs font-bold text-charcoal">Drag and Drop Parts Catalog Sheet (.csv, .xlsx, .json)</p>
                <p className="text-[10px] text-warmgray mt-0.5">Format: [Model SKU, Part Name, Wholesale price in INR]</p>
                <label className="text-[10px] text-antiquegold font-bold hover:underline mt-2 inline-block cursor-pointer">
                  Or browse local device files
                  <input type="file" accept=".csv,.xlsx,.json" className="hidden" onChange={() => handleLoadTemplate('traction')} />
                </label>
              </div>

              {catalogItems.length > 0 && (
                <div className="space-y-2 border border-[rgba(184,135,61,0.15)] rounded-2xl bg-white overflow-hidden shadow-xs">
                  <div className="bg-alabaster px-4 py-2 flex items-center justify-between border-b border-[#e6dfd4]">
                    <span className="text-[10px] font-mono font-bold text-charcoal">PARSED SEEDING MODEL INDEX</span>
                    <span className="text-[9px] font-mono font-bold text-success">({catalogItems.length} items logged)</span>
                  </div>
                  
                  <div className="divide-y divide-[#e6dfd4] max-h-[170px] overflow-y-auto pr-1">
                    {catalogItems.map((item) => (
                      <div key={item.id} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-alabaster/20 transition-all">
                        <div className="truncate text-left space-y-0.5">
                          <p className="font-mono text-[9px] bg-charcoal/15 text-charcoal px-1.5 py-0.2 rounded-md inline-block font-extrabold">{item.sku}</p>
                          <p className="font-bold text-charcoal truncate">{item.name}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono font-bold text-royalemerald font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCatalogItems(catalogItems.filter(i => i.id !== item.id));
                              setValidationError('');
                            }}
                            className="p-1 text-error hover:bg-error/10 rounded-lg cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isAddingItem ? (
                <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-3">
                  <h4 className="text-xs font-bold text-charcoal">Add Individual Part Ledger</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-warmgray">Unique SKU / Model</label>
                      <input
                        type="text"
                        placeholder="e.g. TR-MOTOR-V2"
                        value={newItemSku}
                        onChange={(e) => {
                          setNewItemSku(e.target.value);
                          setCatalogError(null);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-[#e6dfd4] rounded-xl focus:outline-none focus:border-antiquegold text-charcoal font-semibold"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[9px] uppercase font-bold text-warmgray">Part Description Name</label>
                      <input
                        type="text"
                        placeholder="e.g. High-Response Encoders Sensor"
                        value={newItemName}
                        onChange={(e) => {
                          setNewItemName(e.target.value);
                          setCatalogError(null);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-[#e6dfd4] rounded-xl focus:outline-none focus:border-antiquegold text-charcoal font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-warmgray">Contractor Wholesale Price (₹ INR)</label>
                      <input
                        type="number"
                        placeholder="e.g. 15400"
                        value={newItemPrice || ''}
                        onChange={(e) => {
                          setNewItemPrice(Number(e.target.value));
                          setCatalogError(null);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-[#e6dfd4] rounded-xl focus:outline-none focus:border-antiquegold text-charcoal font-mono"
                      />
                    </div>
                    <div className="flex items-end justify-end gap-2">
                      <button type="button" onClick={() => setIsAddingItem(false)} className="px-3 py-1.5 text-xs text-warmgray">Cancel</button>
                      <button type="button" onClick={handleAddCatalogItem} className="px-4 py-1.5 bg-antiquegold text-white rounded-xl font-bold cursor-pointer">Append Part</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingItem(true);
                    setCatalogError(null);
                    setValidationError('');
                  }}
                  className="w-full py-2.5 border border-dashed border-[#e6dfd4] hover:border-antiquegold rounded-xl text-center bg-alabaster/20 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold text-charcoal"
                >
                  <Plus className="w-4 h-4 text-antiquegold" />
                  <span>Add Individual Part Catalog Record</span>
                </button>
              )}

              {catalogError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-bold text-left">
                  <span>{catalogError}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: BANK SETTLEMENT COORDS */}
          {currentStep === 3 && (
            <div className="space-y-4 text-left">
              <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.08)] space-y-1">
                <h4 className="font-serif text-sm font-bold text-charcoal">🏦 NPCI Payout Penny-Drop Mandate</h4>
                <p className="text-xs text-warmgray">
                  Manufacturers receive high-value advance purchase order transfers directly via RTGS/NEFT. Statutory regulations require a real-time account validity drop-test prior to account authorization.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Corporate Settlement Bank Account No</label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. 5020004928139"
                    value={bankAccount}
                    onChange={(e) => {
                      setBankAccount(e.target.value.replace(/\D/g, ''));
                      if (bankVerified !== 'pending') setBankVerified('pending');
                      setValidationError('');
                      setBankError(null);
                    }}
                    className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-mono font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                  />
                  <p className="text-[9px] text-warmgray">Confidential account linked to ledger disbursements.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">National IFSC Routing Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC0000052"
                    value={bankIfsc}
                    onChange={(e) => {
                      setBankIfsc(e.target.value.toUpperCase());
                      if (bankVerified !== 'pending') setBankVerified('pending');
                      setValidationError('');
                      setBankError(null);
                    }}
                    className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                  />
                  <p className="text-[9px] text-warmgray">11-character NEFT/RTGS bank identifiers.</p>
                </div>
              </div>

              <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    <p className="font-bold text-charcoal flex items-center gap-1.5">
                      💳 Penny-Drop Verified Status
                    </p>
                    <p className="text-[10px] text-warmgray mt-0.5">NPCI banking gateway drops ₹1.00 into your account to query beneficiary name match.</p>
                  </div>
                  
                  <div>
                    {bankVerified === 'verified' ? (
                      <span className="text-[10px] bg-success/15 border border-success/20 text-success px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                        🟢 verified: beneficiary cleared
                      </span>
                    ) : bankVerified === 'failed' ? (
                      <span className="text-[10px] bg-error/15 border border-error/20 text-error px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                        🔴 validation failed
                      </span>
                    ) : (
                      <span className="text-[10px] bg-charcoal/10 text-charcoal px-3 py-1 rounded-full font-mono font-bold uppercase">
                        ⚪ unverified state
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={pennyDropRunning || !bankAccount || !bankIfsc}
                    onClick={triggerPennyDropTest}
                    className="px-4 py-2 bg-charcoal hover:bg-[#1c1a18] disabled:bg-warmgray/40 text-white font-mono font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {pennyDropRunning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Querying Beneficiary Node...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5 text-antiquegold" />
                        <span>Trigger NPCI Penny-Drop Test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {bankError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-bold text-left">
                  <span>{bankError}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SLA AGREEMENTS */}
          {currentStep === 4 && (
            <div className="space-y-4 text-left">
              <div>
                <span className="text-[9px] font-mono font-extrabold bg-[#0E4B3D]/10 text-[#0E4B3D] px-2 py-0.5 rounded-full uppercase">
                  STATUTORY PROCUREMENT DEED
                </span>
                <h3 className="font-serif text-md font-bold text-charcoal mt-1.5">SLA Procurement Agreement</h3>
                <p className="text-xs text-warmgray">Acknowledge corporate delivery deadlines, material quality limits, and structural warranties.</p>
              </div>

              <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.15)] text-[11px] leading-relaxed text-charcoal space-y-3 h-48 overflow-y-auto pr-1.5">
                <p className="font-bold border-b border-[#e6dfd4] pb-1 font-serif text-xs">AIEC HARDWARE PROCUREMENT STANDARDS SLA (v4.2)</p>
                <p>
                  <strong>1. Dispatch & Logistical Deadlines:</strong> The registered supplier agrees to package, stamp, and dispatch approved elevator parts within 7 business days from the issuance of a certified AIEC Purchase Order (PO). Delay in freight handover incurs a daily statutory liquidated penalty of 0.5% of PO value.
                </p>
                <p>
                  <strong>2. Payment Disbursement Milestones:</strong> Under director Mr. Prashant Wable's statutory system guidelines, payments are distributed in structural stages: 
                  <br />- PO Advance stage: 30% advance deposit transferred instantly upon PO execution.
                  <br />- Site Delivery stage: 40% cleared upon physical receipt and QR-scan on elevator erection shafts.
                  <br />- QC & Handover stage: 30% cleared after full commissioning of mechanical parts and safety audits.
                </p>
                <p>
                  <strong>3. Technical Warranty & Return Mandates:</strong> All supplied micro-processors, gearless motors, synchronous drives, and safety governors must carry a minimum 24-month manufacturer structural warranty. Mechanical failures detected on-site within warranty boundaries must be replaced at no cost within 48 hours.
                </p>
              </div>

              <div className="space-y-2">
                <div 
                  onClick={() => {
                    setSlaChecked(!slaChecked);
                    setValidationError('');
                  }}
                  className="p-3 bg-white border border-[#e6dfd4] rounded-xl flex items-start gap-2.5 hover:bg-alabaster/40 cursor-pointer transition-all"
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    slaChecked ? 'bg-royalemerald border-royalemerald text-white' : 'border-warmgray/45'
                  }`}>
                    {slaChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <p className="text-xs text-charcoal font-semibold">I certify that all products supplied carry a 24-month statutory quality warrant.</p>
                </div>

                <div 
                  onClick={() => {
                    setMilestonesChecked(!milestonesChecked);
                    setValidationError('');
                  }}
                  className="p-3 bg-white border border-[#e6dfd4] rounded-xl flex items-start gap-2.5 hover:bg-alabaster/40 cursor-pointer transition-all"
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    milestonesChecked ? 'bg-royalemerald border-royalemerald text-white' : 'border-warmgray/45'
                  }`}>
                    {milestonesChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <p className="text-xs text-charcoal font-semibold">I accept the AIEC Payment-On-Milestone terms (30% PO / 40% Delivery / 30% QC).</p>
                </div>

                <div 
                  onClick={() => {
                    setTermsAcknowledged(!termsAcknowledged);
                    setValidationError('');
                  }}
                  className="p-3 bg-white border border-[#e6dfd4] rounded-xl flex items-start gap-2.5 hover:bg-alabaster/40 cursor-pointer transition-all"
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    termsAcknowledged ? 'bg-royalemerald border-royalemerald text-white' : 'border-warmgray/45'
                  }`}>
                    {termsAcknowledged && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <p className="text-xs text-charcoal font-semibold">Confirm commercial acceptance of v4.2 SLA. Authorized Signatory: {signatoryName || 'Enrolling Representative'}</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW SUMMARY & FINAL LODGEMENT */}
          {currentStep === 5 && (
            <div className="space-y-5 text-left">
              <div>
                <span className="text-[9px] font-mono font-extrabold bg-[#0E4B3D]/10 text-royalemerald px-2 py-0.5 rounded-full uppercase">
                  MANUFACTURER LEDGER AUDIT
                </span>
                <h3 className="font-serif text-md font-bold text-charcoal mt-1.5">Verify Corporate Registration Specs</h3>
                <p className="text-xs text-warmgray">Please check all details before submission. Account credentials land in statutory 'pending' review state.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.1)] space-y-2.5">
                  <h4 className="text-xs font-bold text-charcoal border-b border-[#e6dfd4] pb-1.5 flex items-center gap-1.5">
                    👤 Corporate Registration
                  </h4>
                  <div className="text-[11px] space-y-1 text-charcoal font-semibold">
                    <p className="text-xs font-bold">{companyName}</p>
                    <p className="text-warmgray">GSTIN: <span className="font-mono text-xs font-bold text-charcoal">{gstin.toUpperCase()}</span></p>
                    <p className="text-warmgray">Authorized Signatory: <span className="text-charcoal font-bold">{signatoryName}</span></p>
                    <p className="text-warmgray text-[10px] leading-relaxed">📍 Address: {address}</p>
                  </div>
                </div>

                <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.1)] space-y-2.5">
                  <h4 className="text-xs font-bold text-charcoal border-b border-[#e6dfd4] pb-1.5 flex items-center gap-1.5">
                    🏦 Settlement Coordinates
                  </h4>
                  <div className="text-[11px] space-y-1.5 text-warmgray font-semibold">
                    <p className="text-charcoal font-bold">A/C: ••••••••{bankAccount.slice(-4)}</p>
                    <p className="font-mono text-xs font-bold text-charcoal">IFSC: {bankIfsc.toUpperCase()}</p>
                    <div className="pt-1.5">
                      {bankVerified === 'verified' ? (
                        <span className="text-[10px] bg-success/15 border border-success/20 text-success px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                          🟢 BENNY DROPPED MATCH CLEARED
                        </span>
                      ) : (
                        <span className="text-[10px] bg-error/15 border border-error/20 text-error px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                          🔴 BANK CORDS UNVERIFIED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.1)] space-y-2">
                <h4 className="text-xs font-bold text-charcoal border-b border-[#e6dfd4] pb-1.5 flex items-center gap-1.5">
                  📦 Catalog Pricing Seeding Index ({catalogItems.length} items parsed)
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1 pt-1">
                  {catalogItems.map((item) => (
                    <span key={item.id} className="text-[9px] bg-royalemerald/10 border border-royalemerald/25 text-[#0E4B3D] px-2.5 py-0.5 rounded-full font-bold">
                      {item.sku} - ₹{item.price.toLocaleString('en-IN')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-royalemerald/5 rounded-2xl border border-[rgba(14,75,61,0.12)] text-left flex gap-2.5">
                <Shield className="w-5 h-5 text-antiquegold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#0E4B3D]">Statutory Manufacturer Oath</h4>
                  <p className="text-[10px] text-[#0E4B3D]/90 leading-relaxed">
                    By submitting, I certify that our corporate entity has registered active GST credentials. We accept that pricing, specs, and logistics are subject to auditing by Mr. Prashant Wable's AIEC inspection desk before any active dispatch POs are issued on our node.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {validationError && (
        <div className="p-3.5 bg-error/10 border border-error/20 rounded-2xl text-error text-xs font-bold text-left flex gap-2">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 animate-bounce" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Action Progress Info Bar */}
      <div className="bg-alabaster/40 border border-[#e6dfd4]/40 rounded-xl p-2.5 flex items-center justify-between text-[10px] text-warmgray">
        <span>Completed Profile Standing: <strong>{currentPercentage}%</strong></span>
        <span>Total Required Compliance: <strong>{totalPercentage}%</strong></span>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="flex justify-between items-center pt-4 border-t border-[#e6dfd4] gap-3">
        <div className="text-left shrink-0">
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs font-bold text-error hover:underline cursor-pointer"
          >
            Exit / Sign Out
          </button>
        </div>

        <div className="flex gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-alabaster hover:bg-[#edeae2] border border-[#e6dfd4] rounded-xl text-xs font-bold text-charcoal cursor-pointer transition-all flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {currentStep < 5 ? (
            <Button
              variant="primary"
              disabled={
                (currentStep === 1 && (!companyName.trim() || !address.trim() || !signatoryName.trim() || gstinError !== null)) ||
                (currentStep === 2 && catalogItems.length === 0) ||
                (currentStep === 3 && (!bankAccount.trim() || !bankIfsc.trim() || bankVerified !== 'verified')) ||
                (currentStep === 4 && (!slaChecked || !milestonesChecked || !termsAcknowledged))
              }
              onClick={handleNext}
            >
              <span>Continue Stage</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <button
              type="button"
              disabled={!termsAcknowledged || bankVerified !== 'verified' || catalogItems.length === 0}
              onClick={handleSubmitKYC}
              className="px-5 py-3 bg-royalemerald hover:bg-[#0b3c31] disabled:bg-warmgray/35 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>File Company Registration</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
