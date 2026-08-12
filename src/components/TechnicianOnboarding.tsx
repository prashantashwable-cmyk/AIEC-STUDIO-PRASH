import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button, AscensionLine } from './Common';
import { CameraCapture } from './CameraCapture';
import { 
  Shield, ArrowRight, ArrowLeft, Check, AlertTriangle, 
  CheckCircle, Camera, CreditCard, RefreshCw, Trash2, 
  Info, AlertCircle, FileText, Settings, Award, MapPin
} from 'lucide-react';

interface TechnicianOnboardingProps {
  user: User;
  onComplete: (updatedUser: User) => void;
  onSignOut: () => void;
}

export const TechnicianOnboarding: React.FC<TechnicianOnboardingProps> = ({ 
  user, 
  onComplete, 
  onSignOut 
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [draftSavedTime, setDraftSavedTime] = useState<string>('');

  // Step 1: Personal Details
  const [fullName, setFullName] = useState<string>(user.name || '');
  const [email, setEmail] = useState<string>(user.email || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150');
  const [isCapturingAvatar, setIsCapturingAvatar] = useState<boolean>(false);

  // Step 2: Skills & trade certifications
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user.skillTags || []);
  const [certificates, setCertificates] = useState<{ id: string; type: string; photoUrl: string; language: string; needsTranslationReview: boolean }[]>([]);
  const [isCapturingCert, setIsCapturingCert] = useState<boolean>(false);
  const [certType, setCertType] = useState<string>('Electrical Wireman License');
  const [certLanguage, setCertLanguage] = useState<string>('English');
  const [cameraQuality, setCameraQuality] = useState<'normal' | 'blurry' | 'glare' | 'perfect'>('perfect');

  // Step 3: Liability & Insurance Details
  const [insuranceDoc, setInsuranceDoc] = useState<string | null>(user.liabilityInsuranceDoc || null);
  const [insuranceExpiry, setInsuranceExpiry] = useState<string>(user.insuranceExpiryDate || '');
  const [isCapturingInsurance, setIsCapturingInsurance] = useState<boolean>(false);

  // Step 4: SOP Acknowledgement & Area preferences
  const [preferredZones, setPreferredZones] = useState<string[]>(user.preferredZones || []);
  const [sopAcknowledged, setSopAcknowledged] = useState<boolean>(user.sopAcknowledgedFlag || false);
  const [readSopSteps, setReadSopSteps] = useState<{ id: number; text: string; checked: boolean }[]>([
    { id: 1, text: "Verify shaft clearance and rail brackets alignment with 1mm laser toleration.", checked: false },
    { id: 2, text: "Attach mechanical safety buffers and pit spring assemblies securely before cabin lower-down.", checked: false },
    { id: 3, text: "Execute high-voltage wiring insulation resistance audits (Megger Test > 50 MΩ).", checked: false },
    { id: 4, text: "Calibrate secondary overspeed governors and emergency governor brake pads.", checked: false }
  ]);

  // Validation feedback state
  const [validationError, setValidationError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const skillList = [
    { id: 'Mechanical', desc: 'Cabin rails, counterweights, and structural frame riggings' },
    { id: 'Electrical', desc: 'Microprocessor panels, high-voltage wiring, and sensor loops' },
    { id: 'Hydraulic Systems', desc: 'Piston shafts, oil manifolds, and relief valve settings' },
    { id: 'MRL/Gearless', desc: 'Machine-room-less synchronous motors and encoder feedback' },
    { id: 'Safety & Rescue', desc: 'Governor calibrations, buffer tests, and emergency evacuations' }
  ];

  const zonesList = [
    { id: 'Pune Central', label: 'Pune Central (Kothrud, Erandwane)', spec: 'Premium residential elevator retrofits' },
    { id: 'Pune North', label: 'Pune North (Pimpri, Chinchwad)', spec: 'Industrial heavy duty goods elevators' },
    { id: 'Pune South', label: 'Pune South (Hadapsar, Katraj)', spec: 'High-rise commercial escalators' },
    { id: 'Pune East', label: 'Pune East (Kalyani Nagar, Viman Nagar)', spec: 'Smart home & villa hydraulic gearless lifts' }
  ];

  // Load draft from localstorage on mount with fallback checks
  useEffect(() => {
    const draftKey = `aiec_technician_onboarding_draft_${user.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        if (d.fullName) setFullName(d.fullName);
        if (d.email) setEmail(d.email);
        if (d.avatarUrl) setAvatarUrl(d.avatarUrl);
        if (d.selectedSkills) setSelectedSkills(d.selectedSkills);
        if (d.certificates) setCertificates(d.certificates);
        if (d.insuranceDoc) setInsuranceDoc(d.insuranceDoc);
        if (d.insuranceExpiry) setInsuranceExpiry(d.insuranceExpiry);
        if (d.preferredZones) setPreferredZones(d.preferredZones);
        if (d.sopAcknowledged) setSopAcknowledged(d.sopAcknowledged);
        if (d.readSopSteps) setReadSopSteps(d.readSopSteps);
        if (d.currentStep) setCurrentStep(d.currentStep);
        
        const dateStr = new Date(d.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setDraftSavedTime(`Draft loaded from ${dateStr}`);
      } catch (e) {
        console.error("Failed to parse technician onboarding draft", e);
      }
    }
  }, [user.id]);

  // Save draft state safely
  const saveDraft = (stepOverride?: number) => {
    try {
      const draftKey = `aiec_technician_onboarding_draft_${user.id}`;
      const draftData = {
        fullName,
        email,
        avatarUrl,
        selectedSkills,
        certificates,
        insuranceDoc,
        insuranceExpiry,
        preferredZones,
        sopAcknowledged,
        readSopSteps,
        currentStep: stepOverride || currentStep,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setDraftSavedTime(`Auto-saved at ${nowStr}`);
    } catch (e) {
      console.warn("Unable to write technician draft status", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft();
    }, 1000);
    return () => clearTimeout(timer);
  }, [fullName, email, avatarUrl, selectedSkills, certificates, insuranceDoc, insuranceExpiry, preferredZones, sopAcknowledged, readSopSteps]);

  const handleNext = () => {
    setValidationError('');

    if (currentStep === 1) {
      if (!fullName.trim() || fullName.trim().length < 3) {
        setValidationError("Please enter a valid legal name (min 3 characters).");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email)) {
        setValidationError("Please enter a valid active contact email address.");
        return;
      }
    }

    if (currentStep === 2) {
      if (selectedSkills.length === 0) {
        setValidationError("Please select at least one core skill tag to index your profile.");
        return;
      }
      if (certificates.length === 0) {
        setValidationError("Please scan and submit at least one Trade/Safety trade certificate to continue.");
        return;
      }
    }

    if (currentStep === 3) {
      if (!insuranceDoc) {
        setValidationError("Contractor Liability Insurance Scan is mandatory for high-risk safety clearance.");
        return;
      }
      if (!insuranceExpiry) {
        setValidationError("Please select your liability insurance policy expiration date.");
        return;
      }
    }

    if (currentStep === 4) {
      if (preferredZones.length === 0) {
        setValidationError("At least one preferred operational zone is mandatory for job routing.");
        return;
      }
      const allSopChecked = readSopSteps.every(s => s.checked);
      if (!allSopChecked || !sopAcknowledged) {
        setValidationError("Please read and tick all 4 Safe-Shaft SOP steps below to commit safety alignment.");
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

  const handleCaptureCertificate = (photoUrl: string) => {
    if (cameraQuality === 'blurry') {
      setValidationError("⚠️ Scan blurry. Please wipe your lens and retake in better lighting.");
      return;
    }
    if (cameraQuality === 'glare') {
      setValidationError("⚠️ Direct bulb glare detected on card text. Shield light source and retake.");
      return;
    }

    const isRegional = certLanguage !== 'English';
    setCertificates([
      ...certificates,
      {
        id: `cert_${Date.now()}`,
        type: certType,
        photoUrl: photoUrl,
        language: certLanguage,
        needsTranslationReview: isRegional
      }
    ]);

    setValidationError('');
    setIsCapturingCert(false);
    saveDraft();
    triggerToast(`Certificate scanned successfully under ${certType}!`);
  };

  const removeCertificate = (id: string) => {
    setCertificates(certificates.filter(c => c.id !== id));
    setValidationError('');
  };

  const handleCaptureInsurance = (photoUrl: string) => {
    setInsuranceDoc(photoUrl);
    setValidationError('');
    setIsCapturingInsurance(false);
    saveDraft();
    triggerToast("Contractor liability policy sheet scanned and mapped!");
  };

  const toggleSopStep = (id: number) => {
    setValidationError('');
    const updated = readSopSteps.map(s => s.id === id ? { ...s, checked: !s.checked } : s);
    setReadSopSteps(updated);
    
    const allChecked = updated.every(s => s.checked);
    setSopAcknowledged(allChecked);
  };

  const toggleSkill = (skill: string) => {
    setValidationError('');
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmitOnboarding = () => {
    try {
      let status: 'active' | 'warning' | 'expired' = 'active';
      if (insuranceExpiry) {
        const today = new Date();
        const expiry = new Date(insuranceExpiry);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) {
          status = 'expired';
        } else if (diffDays <= 30) {
          status = 'warning';
        }
      }

      const updatedUser: User = {
        ...user,
        name: fullName,
        email,
        avatarUrl,
        onboardingCompleted: true,
        skillTags: selectedSkills,
        certificateDocs: certificates.map(c => c.photoUrl),
        liabilityInsuranceDoc: insuranceDoc || undefined,
        insuranceExpiryDate: insuranceExpiry,
        insuranceStatus: status,
        sopAcknowledgedFlag: sopAcknowledged,
        preferredZones: preferredZones,
        region: preferredZones[0] || 'Pune Central',
        status: 'pending' // pending administrative audit check
      };

      DbManager.updateUser(updatedUser);
      localStorage.removeItem(`aiec_technician_onboarding_draft_${user.id}`);
      onComplete(updatedUser);
    } catch (e) {
      console.error("Failed to submit technician registration ledger:", e);
      setValidationError("Failed to finalize onboarding profile. Please clear local storage or try again.");
    }
  };

  const ascensionSteps = [
    { id: '1', label: 'Personal', completed: currentStep > 1, active: currentStep === 1 },
    { id: '2', label: 'Trade Skills', completed: currentStep > 2, active: currentStep === 2 },
    { id: '3', label: 'Safety Coverage', completed: currentStep > 3, active: currentStep === 3 },
    { id: '4', label: 'SOP Agreement', completed: currentStep > 4, active: currentStep === 4 },
    { id: '5', label: 'Summary Audit', completed: currentStep > 5, active: currentStep === 5 }
  ];

  const getInsuranceStatusBadge = () => {
    if (!insuranceExpiry) return null;
    const today = new Date();
    const expiry = new Date(insuranceExpiry);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return (
        <span className="text-[10px] bg-error/15 border border-error/25 text-error px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
          🚨 policy lapsed - assignments blocked
        </span>
      );
    } else if (diffDays <= 30) {
      return (
        <span className="text-[10px] bg-error/10 border border-error/20 text-error px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider animate-pulse">
          ⚠️ warning: expires in {diffDays} days
        </span>
      );
    } else {
      return (
        <span className="text-[10px] bg-success/15 border border-success/20 text-success px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
          🟢 Active Insurance Policy Verified
        </span>
      );
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl border border-[rgba(184,135,61,0.2)] p-6 md:p-8 space-y-6 shadow-diffuse relative overflow-hidden">
      
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 p-4 bg-charcoal/95 text-white border border-[#B8873D]/30 shadow-2xl rounded-2xl flex items-center gap-2.5 max-w-sm"
          >
            <Info className="w-5 h-5 text-antiquegold shrink-0 animate-bounce" />
            <p className="text-xs font-semibold">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Profile Title info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e6dfd4] pb-4 text-left">
        <div>
          <span className="text-[10px] font-mono font-bold text-antiquegold uppercase tracking-widest flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> SECURE ONBOARDING PORTAL
          </span>
          <h2 className="font-serif text-2xl font-bold text-charcoal">Technician Credentials Enrolment</h2>
          <p className="text-xs text-warmgray mt-0.5">Validate licenses, electrical safety limits, and liability policies for active job dispatch.</p>
        </div>
        <div className="text-right sm:self-end">
          <span className="text-[9px] bg-royalemerald/10 text-[#0E4B3D] border border-royalemerald/15 px-2.5 py-1 rounded-full font-mono font-bold inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            {draftSavedTime || 'Active state recovery enabled'}
          </span>
        </div>
      </div>

      {/* Horizontal Ascension tracker */}
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
          {/* STEP 1: PERSONAL DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {isCapturingAvatar ? (
                <div className="p-1 bg-charcoal rounded-2xl border border-antiquegold/35 text-left">
                  <CameraCapture
                    facingMode="user"
                    aspectRatio="square"
                    onCapture={(dataUrl) => {
                      setAvatarUrl(dataUrl);
                      setIsCapturingAvatar(false);
                      setValidationError('');
                    }}
                    onCancel={() => setIsCapturingAvatar(false)}
                  />
                </div>
              ) : (
                <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.08)] flex flex-col md:flex-row items-center gap-5">
                  <div className="relative shrink-0">
                    <img 
                      src={avatarUrl} 
                      alt="Applicant Avatar" 
                      className="w-20 h-20 rounded-2xl border-2 border-antiquegold object-cover shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCapturingAvatar(true)}
                      className="absolute -bottom-2 -right-2 bg-charcoal text-white hover:bg-antiquegold p-2 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                      title="Capture Real Portrait"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-left space-y-1">
                    <h4 className="font-serif text-sm font-bold text-charcoal">Licensed Professional Profile</h4>
                    <p className="text-xs text-warmgray">Your credential avatar is linked to active safety logs and site work permits. Must represent your legal status for audit compliance.</p>
                    <p className="text-[10px] text-antiquegold font-semibold">Click camera icon to take a real photo using your device webcam</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Legal Full Name (License Match)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Devendra Patil"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setValidationError('');
                    }}
                    className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                  />
                  <p className="text-[9px] text-warmgray">Ensure spelling matches wireman/trade certification documents.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Verified Dispatch Mobile</label>
                  <input
                    type="text"
                    disabled
                    value={user.phone}
                    className="w-full px-4 py-2.5 bg-alabaster/50 border border-[rgba(184,135,61,0.08)] rounded-xl text-xs font-mono font-bold text-warmgray cursor-not-allowed"
                  />
                  <p className="text-[9px] text-success font-semibold">✓ Verified via device hardware signature</p>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Contact Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.patil@aiec-partners.co.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setValidationError('');
                  }}
                  className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                />
                <p className="text-[9px] text-warmgray">For statutory safety alerts, site schedules, and compliance audit certificates.</p>
              </div>
            </div>
          )}

          {/* STEP 2: SKILLS & CERTIFICATES */}
          {currentStep === 2 && (
            <div className="space-y-5 text-left">
              <div>
                <span className="text-[9px] font-mono font-bold bg-[#B8873D]/10 text-antiquegold px-2 py-0.5 rounded-full uppercase">
                  OPERATIONAL COMPETENCY TAGS
                </span>
                <h3 className="font-serif text-md font-bold text-charcoal mt-1.5">Select Certified Competencies</h3>
                <p className="text-xs text-warmgray">Which mechanical limits can you safely wire, rig, and calibrate? Tags directly filter dispatch options in active elevator project routing.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {skillList.map((sk) => {
                  const isSel = selectedSkills.includes(sk.id);
                  return (
                    <button
                      key={sk.id}
                      type="button"
                      onClick={() => toggleSkill(sk.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSel 
                          ? 'bg-antiquegold text-white shadow-xs' 
                          : 'bg-alabaster text-warmgray border border-[#e6dfd4] hover:bg-[#edeae2]'
                      }`}
                      title={sk.desc}
                    >
                      <span>{sk.id}</span>
                      {isSel && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-[#e6dfd4] pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                    📜 Trade Licenses & Safety Credentials
                  </h4>
                  <span className="text-[9px] text-warmgray font-mono">Requires at least one certificate</span>
                </div>

                {certificates.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {certificates.map((c) => (
                      <div key={c.id} className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2.5 truncate">
                          <img src={c.photoUrl} className="w-10 h-7 object-cover rounded border" />
                          <div className="truncate text-left">
                            <p className="font-bold text-charcoal truncate">{c.type}</p>
                            <p className="text-[10px] text-warmgray flex items-center gap-1.5">
                              <span>Lang: {c.language}</span>
                              {c.needsTranslationReview && (
                                <span className="text-[8px] bg-warning/15 text-antiquegold px-1.5 py-0.2 rounded-full font-mono font-bold uppercase animate-pulse">
                                  Regional (HQ Review Needed)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCertificate(c.id)}
                          className="p-1 text-error hover:bg-error/10 rounded-lg cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isCapturingCert ? (
                  <div className="p-4 bg-charcoal rounded-2xl text-white space-y-4 border border-antiquegold/30">
                    <div className="flex justify-between items-center text-xs font-bold border-b border-white/10 pb-2">
                      <span className="text-[10px] font-mono text-antiquegold">TRADE DOCUMENT LENS RESOLVER</span>
                      <span className="text-white/50 text-[10px]">{certType}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-white/50 font-bold">Credential Category</label>
                        <select
                          value={certType}
                          onChange={(e) => setCertType(e.target.value)}
                          className="w-full px-3 py-2 bg-[#2a2723] border border-white/10 rounded-xl focus:outline-none focus:border-antiquegold text-white text-xs font-semibold"
                        >
                          <option>Electrical Wireman License</option>
                          <option>ITI Elevator Mechanic Certificate</option>
                          <option>High-Rise Safety Training Seal</option>
                          <option>PWD Safety Inspector Permit</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-white/50 font-bold">Language Printed</label>
                        <select
                          value={certLanguage}
                          onChange={(e) => setCertLanguage(e.target.value)}
                          className="w-full px-3 py-2 bg-[#2a2723] border border-white/10 rounded-xl focus:outline-none focus:border-antiquegold text-white text-xs font-semibold"
                        >
                          <option>English</option>
                          <option>Marathi (Regional Language)</option>
                          <option>Hindi (Regional Language)</option>
                          <option>Gujarati (Regional Language)</option>
                        </select>
                      </div>
                    </div>

                    <CameraCapture
                      facingMode="environment"
                      aspectRatio="video"
                      onCapture={handleCaptureCertificate}
                      onCancel={() => setIsCapturingCert(false)}
                    />
                    
                    <div className="p-3 bg-[#2a2723] rounded-xl border border-white/10 flex items-center justify-between text-xs text-left">
                      <span className="font-bold text-white/80">Simulate Camera Quality:</span>
                      <select
                        value={cameraQuality}
                        onChange={(e) => setCameraQuality(e.target.value as any)}
                        className="bg-charcoal px-2.5 py-1.5 border border-white/15 rounded-lg text-white"
                      >
                        <option value="perfect">Perfect Clear Scan</option>
                        <option value="blurry">Unstable Lens Blur</option>
                        <option value="glare">Overhead Glare Spot</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setIsCapturingCert(true); setValidationError(''); }}
                    className="w-full p-4 border-2 border-dashed border-[#e6dfd4] hover:border-antiquegold rounded-2xl text-center bg-alabaster/40 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Camera className="w-5 h-5 text-antiquegold stroke-[1.5]" />
                    <span className="text-xs font-bold text-charcoal">Scan New Trade Credential / Safety Seal</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: LIABILITY & INSURANCE DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-4 text-left">
              <div className="p-3.5 bg-antiquegold/10 border border-antiquegold/15 text-left rounded-xl flex gap-2.5">
                <Info className="w-4.5 h-4.5 text-antiquegold shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#875b1a] leading-relaxed">
                  <strong>Contractor Liability Shield:</strong> AIEC matches independent elevator technical crews with industrial developers. To comply with local labor mandates, all registered crews **must carry their own active liability coverage**.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Policy Certificate Scan</label>
                  {isCapturingInsurance ? (
                    <CameraCapture
                      facingMode="environment"
                      aspectRatio="video"
                      onCapture={handleCaptureInsurance}
                      onCancel={() => setIsCapturingInsurance(false)}
                    />
                  ) : insuranceDoc ? (
                    <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] space-y-2 text-xs relative">
                      <img src={insuranceDoc} className="w-full h-28 object-cover rounded-lg border border-[#e6dfd4]" />
                      <div className="flex justify-between items-center text-[10px] text-warmgray">
                        <span className="text-success font-semibold">✓ Scan Signature: LIABILITY_SHIELD_OK</span>
                        <button type="button" onClick={() => setInsuranceDoc(null)} className="p-1 text-error hover:bg-error/10 rounded-lg cursor-pointer shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setIsCapturingInsurance(true); setValidationError(''); }}
                      className="w-full h-36 border-2 border-dashed border-[#e6dfd4] hover:border-antiquegold rounded-2xl bg-alabaster/40 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Camera className="w-6 h-6 text-antiquegold stroke-[1.5]" />
                      <span className="text-xs font-bold text-charcoal">Scan Contractor Policy Sheet</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Policy Expiration Date</label>
                    <input
                      type="date"
                      required
                      value={insuranceExpiry}
                      onChange={(e) => {
                        setInsuranceExpiry(e.target.value);
                        setValidationError('');
                      }}
                      className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                    />
                    <p className="text-[9px] text-warmgray">System automatically suspends active dispatch jobs if safety policy expires.</p>
                  </div>

                  {insuranceExpiry && (
                    <div className="p-4 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)] space-y-2 text-xs text-left">
                      <p className="font-bold text-charcoal flex items-center gap-1.5">
                        🛡️ Insurance Standing Audit
                      </p>
                      <div className="pt-1 flex flex-wrap gap-2 items-center">
                        {getInsuranceStatusBadge()}
                      </div>
                      <p className="text-[10px] text-warmgray leading-relaxed pt-1 font-semibold">
                        Active crews receive automated push warnings 30 days before their liability policy expires. All dispatch slots are safely blocked if a policy is left to lapse.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SOP ACKNOWLEDGEMENT & TERRITORIES */}
          {currentStep === 4 && (
            <div className="space-y-5 text-left">
              <div>
                <span className="text-[9px] font-mono font-extrabold bg-[#0E4B3D]/10 text-[#0E4B3D] px-2 py-0.5 rounded-full uppercase">
                  DISPATCH AREA & OPERATIONAL SAFETY
                </span>
                <h3 className="font-serif text-md font-bold text-charcoal mt-1.5">Preferred Job Dispatch Zones</h3>
                <p className="text-xs text-warmgray">Which physical development sectors can you serve? Select all applicable zones to unlock assignment matching.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {zonesList.map((z) => {
                  const isSelected = preferredZones.includes(z.id);
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => {
                        setValidationError('');
                        if (preferredZones.includes(z.id)) {
                          setPreferredZones(preferredZones.filter(id => id !== z.id));
                        } else {
                          setPreferredZones([...preferredZones, z.id]);
                        }
                      }}
                      className={`p-3 bg-white border rounded-xl flex items-center justify-between text-left transition-all hover:shadow-xs cursor-pointer ${
                        isSelected 
                          ? 'border-antiquegold bg-[#B8873D]/5 ring-1 ring-antiquegold' 
                          : 'border-[rgba(184,135,61,0.12)] hover:bg-alabaster/40'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-xs text-charcoal">{z.label}</h4>
                        <p className="text-[9px] text-warmgray">{z.spec}</p>
                      </div>
                      <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-antiquegold' : 'text-warmgray/30'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Safe Installation SOP Interactivity */}
              <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-3">
                <div className="border-b border-[#e6dfd4] pb-2">
                  <h4 className="font-serif text-sm font-bold text-charcoal flex items-center gap-1.5">
                    ⚙️ Mandatory Safe Elevator Shaft Installation SOP
                  </h4>
                  <p className="text-[11px] text-warmgray">Under the AIEC contractor charter, you must acknowledge reading and executing the safe installation protocol steps below before final submission approval.</p>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {readSopSteps.map((step) => (
                    <div 
                      key={step.id} 
                      onClick={() => toggleSopStep(step.id)}
                      className="p-2.5 bg-white border border-[#e6dfd4] rounded-xl flex items-start gap-2.5 hover:bg-alabaster/40 cursor-pointer transition-all"
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        step.checked ? 'bg-royalemerald border-royalemerald text-white' : 'border-warmgray/45'
                      }`}>
                        {step.checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <p className="text-[11px] text-charcoal font-semibold">{step.text}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    sopAcknowledged ? 'bg-success text-white' : 'bg-warmgray/15 text-warmgray'
                  }`}>
                    {sopAcknowledged ? '✓' : '⏱'}
                  </div>
                  <p className="text-[10px] font-bold text-charcoal">
                    {sopAcknowledged 
                      ? '✓ All safe-shaft protocol acknowledgements completed successfully.' 
                      : 'Please verify and check all 4 safe-shaft SOP nodes to confirm legal safety compliance.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW SUMMARY & FINAL SUBMISSION */}
          {currentStep === 5 && (
            <div className="space-y-5 text-left">
              <div>
                <span className="text-[9px] font-mono font-extrabold bg-[#0E4B3D]/10 text-royalemerald px-2 py-0.5 rounded-full uppercase">
                  REGISTRY VERIFICATION AUDIT
                </span>
                <h3 className="font-serif text-md font-bold text-charcoal mt-1.5">Verify Technician Registration Specs</h3>
                <p className="text-xs text-warmgray">Please check all trade competencies, insurance standing, and safety acknowledgements before lodging.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.1)] space-y-3">
                  <h4 className="text-xs font-bold text-charcoal border-b border-[#e6dfd4] pb-1.5 flex items-center gap-1">
                    👤 Profile Details
                  </h4>
                  <div className="flex items-center gap-3">
                    <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-antiquegold shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-charcoal">{fullName}</p>
                      <p className="text-[10px] text-warmgray truncate">{email}</p>
                      <p className="text-[10px] text-warmgray font-mono">{user.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedSkills.map(sk => (
                      <span key={sk} className="text-[8px] bg-antiquegold/10 text-[#875b1a] border border-[#B8873D]/20 px-1.5 py-0.5 rounded-full font-bold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.1)] space-y-2.5">
                  <h4 className="text-xs font-bold text-charcoal border-b border-[#e6dfd4] pb-1.5 flex items-center gap-1">
                    🛡️ Safety Coverage Standing
                  </h4>
                  <div className="text-[10px] space-y-1 text-warmgray">
                    <p className="text-charcoal font-bold flex items-center gap-1">
                      <span>Expires:</span>
                      <span className="font-mono">{insuranceExpiry || 'Unrecorded'}</span>
                    </p>
                    <div className="pt-1">
                      {getInsuranceStatusBadge()}
                    </div>
                  </div>
                  <div className="pt-1 text-[9px] text-warmgray">
                    {certificates.length} Trade Certificate(s) scanned & uploaded.
                  </div>
                </div>
              </div>

              <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.1)] space-y-2">
                <h4 className="text-xs font-bold text-charcoal border-b border-[#e6dfd4] pb-1.5 flex items-center gap-1">
                  📍 Requested Territories
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {preferredZones.map((z) => (
                    <span key={z} className="text-[10px] bg-royalemerald/10 border border-royalemerald/25 text-[#0E4B3D] px-2.5 py-1 rounded-full font-bold">
                      📍 {z}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-royalemerald/5 rounded-2xl border border-[rgba(14,75,61,0.12)] text-left flex gap-2.5">
                <Shield className="w-5 h-5 text-antiquegold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#0E4B3D]">Independent Contractor Safety Oath</h4>
                  <p className="text-[10px] text-[#0E4B3D]/90 leading-relaxed">
                    By submitting, I certify that all licenses and liability coverage papers are fully authentic. I understand that failure to carry active insurance, or failure to follow the safe elevator shaft installation SOP steps, results in instant terminal ledger suspension under director Mr. Prashant Wable's safety protocols.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {validationError && (
        <div className="p-3.5 bg-error/10 border border-error/20 rounded-2xl text-error text-xs font-bold text-left flex gap-2">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Actions bottom bar */}
      <div className="flex justify-between items-center pt-4 border-t border-[#e6dfd4] mt-6 gap-3">
        <div className="text-left shrink-0">
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs font-bold text-error hover:underline cursor-pointer"
          >
            Sign Out / Exit
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
                (currentStep === 1 && (!fullName.trim() || !email.trim())) ||
                (currentStep === 2 && (selectedSkills.length === 0 || certificates.length === 0)) ||
                (currentStep === 3 && (!insuranceDoc || !insuranceExpiry)) ||
                (currentStep === 4 && (preferredZones.length === 0 || !sopAcknowledged))
              }
              onClick={handleNext}
            >
              <span>Continue Step</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <button
              type="button"
              disabled={preferredZones.length === 0 || !sopAcknowledged || !insuranceDoc}
              onClick={handleSubmitOnboarding}
              className="px-5 py-3 bg-royalemerald hover:bg-[#0b3c31] disabled:bg-warmgray/35 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Submit Credentials for Review</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
