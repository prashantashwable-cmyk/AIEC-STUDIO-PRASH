import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button, AscensionLine } from './Common';
import { CameraCapture } from './CameraCapture';
import { 
  Compass, MapPin, Shield, ArrowRight, ArrowLeft, Check, 
  AlertTriangle, CheckCircle, Camera, CreditCard, RefreshCw, 
  Trash2, Sparkles, Building, Info, AlertCircle, FileText
} from 'lucide-react';

interface SurveyorOnboardingProps {
  user: User;
  onComplete: (updatedUser: User) => void;
  onSignOut: () => void;
}

export const SurveyorOnboarding: React.FC<SurveyorOnboardingProps> = ({ 
  user, 
  onComplete, 
  onSignOut 
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [draftSavedTime, setDraftSavedTime] = useState<string>('');

  // Step 1: Personal Details
  const [fullName, setFullName] = useState<string>(user.name || '');
  const [email, setEmail] = useState<string>(user.email || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [isCapturingAvatar, setIsCapturingAvatar] = useState<boolean>(false);

  // Step 2: ID Upload
  const [docType, setDocType] = useState<'aadhaar' | 'pan'>('aadhaar');
  const [idDocPhoto, setIdDocPhoto] = useState<string | null>(user.aadhaarOrPanDoc || null);
  const [isCapturingDoc, setIsCapturingDoc] = useState<boolean>(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [cameraQuality, setCameraQuality] = useState<'normal' | 'blurry' | 'glare' | 'perfect'>('perfect');

  // Step 3: Bank Details
  const [accountHolder, setAccountHolder] = useState<string>(fullName || '');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>(user.bankAccountNo || '');
  const [ifscCode, setIfscCode] = useState<string>(user.bankIfsc || '');
  const [bankVerifiedStatus, setBankVerifiedStatus] = useState<'verified' | 'failed' | 'pending'>(user.bankVerifiedStatus || 'pending');
  const [isVerifyingBank, setIsVerifyingBank] = useState<boolean>(false);
  const [bankVerifyError, setBankVerifyError] = useState<string | null>(null);

  // Step 4: Preferences & Vehicle
  const [preferredZones, setPreferredZones] = useState<string[]>(user.preferredZones || []);
  const [twoWheelerOwned, setTwoWheelerOwned] = useState<boolean>(user.twoWheelerOwned !== undefined ? user.twoWheelerOwned : true);

  // Validation feedback state
  const [validationError, setValidationError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load draft from localstorage on mount with high fault tolerance
  useEffect(() => {
    const draftKey = `aiec_surveyor_onboarding_draft_${user.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        if (d.fullName) setFullName(d.fullName);
        if (d.email) setEmail(d.email);
        if (d.avatarUrl) setAvatarUrl(d.avatarUrl);
        if (d.docType) setDocType(d.docType);
        if (d.idDocPhoto) setIdDocPhoto(d.idDocPhoto);
        if (d.accountHolder) setAccountHolder(d.accountHolder);
        if (d.bankName) setBankName(d.bankName);
        if (d.accountNumber) setAccountNumber(d.accountNumber);
        if (d.ifscCode) setIfscCode(d.ifscCode);
        if (d.bankVerifiedStatus) setBankVerifiedStatus(d.bankVerifiedStatus);
        if (d.preferredZones) setPreferredZones(d.preferredZones);
        if (d.twoWheelerOwned !== undefined) setTwoWheelerOwned(d.twoWheelerOwned);
        if (d.currentStep) setCurrentStep(d.currentStep);
        
        const dateStr = new Date(d.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setDraftSavedTime(`Draft loaded from ${dateStr}`);
      } catch (e) {
        console.error("Failed to parse onboarding draft", e);
      }
    }
  }, [user.id]);

  // Save draft whenever inputs change with safety bounds
  const saveDraft = (stepOverride?: number) => {
    try {
      const draftKey = `aiec_surveyor_onboarding_draft_${user.id}`;
      const draftData = {
        fullName,
        email,
        avatarUrl,
        docType,
        idDocPhoto,
        accountHolder,
        bankName,
        accountNumber,
        ifscCode,
        bankVerifiedStatus,
        preferredZones,
        twoWheelerOwned,
        currentStep: stepOverride || currentStep,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setDraftSavedTime(`Auto-saved at ${nowStr}`);
    } catch (e) {
      console.warn("Unable to save draft state to localStorage", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft();
    }, 1000);
    return () => clearTimeout(timer);
  }, [fullName, email, avatarUrl, docType, idDocPhoto, accountHolder, bankName, accountNumber, ifscCode, bankVerifiedStatus, preferredZones, twoWheelerOwned]);

  // Handle Step Navigation
  const handleNext = () => {
    setValidationError('');
    
    if (currentStep === 1) {
      if (!fullName.trim() || fullName.trim().length < 3) {
        setValidationError("Please enter a valid legal name (min 3 characters).");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email)) {
        setValidationError("Please enter a valid corporate email address.");
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!idDocPhoto) {
        setValidationError("Please capture or upload your ID document to proceed.");
        return;
      }
    }

    if (currentStep === 3) {
      if (!accountNumber || !ifscCode) {
        setValidationError("Please fill out your bank details for commission payouts.");
        return;
      }
      if (bankVerifiedStatus !== 'verified') {
        setValidationError("Please trigger and verify the Penny-Drop verification checklist first.");
        return;
      }
    }

    if (currentStep === 4) {
      if (preferredZones.length === 0) {
        setValidationError("At least one preferred operational zone is mandatory to accept dispatches.");
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

  // Mock document scanning logic
  const handleCaptureDocument = () => {
    setIsCapturingDoc(true);
    setValidationError('');
  };

  const confirmDocumentCapture = () => {
    if (cameraQuality === 'blurry') {
      setValidationError("⚠️ Lens Blur Detected: Camera was unstable. Please wipe the lens, hold steady, and retake in better lighting.");
      return;
    }
    if (cameraQuality === 'glare') {
      setValidationError("⚠️ Glare Detected: Direct reflections on card fields. Shield the card from overhead bulbs or tilt the card slightly away from the light.");
      return;
    }

    const mockDocPic = docType === 'aadhaar' 
      ? 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400' 
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400';

    setIdDocPhoto(mockDocPic);
    setValidationError('');
    setIsCapturingDoc(false);
    saveDraft();
  };

  const isValidIFSC = (code: string) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(code.toUpperCase());
  };

  // Penny-Drop Verification Job Simulation
  const triggerPennyDropVerification = () => {
    if (!accountNumber || !ifscCode) {
      setBankVerifyError("Please enter account number and IFSC code.");
      return;
    }

    if (!isValidIFSC(ifscCode)) {
      setBankVerifyError("Invalid IFSC format. Must be 11 characters (e.g. SBIN0001234).");
      return;
    }

    setIsVerifyingBank(true);
    setBankVerifyError(null);
    setValidationError('');

    setTimeout(() => {
      setIsVerifyingBank(false);
      if (accountNumber.startsWith('0000')) {
        setBankVerifiedStatus('failed');
        setBankVerifyError("⚠️ NPCI penny-drop rejected. Account status check returned: 'Invalid/Blocked Account'. Please verify details.");
      } else {
        setBankVerifiedStatus('verified');
        const bankNameExtracted = ifscCode.toUpperCase().startsWith('SBIN') 
          ? 'State Bank of India' 
          : ifscCode.toUpperCase().startsWith('HDFC') 
            ? 'HDFC Bank Ltd' 
            : 'ICICI Bank Ltd';
        setBankName(bankNameExtracted);
        setBankVerifyError(null);
        triggerToast(`Penny-Drop verification cleared successfully for ${bankNameExtracted}!`);
      }
      saveDraft();
    }, 1800);
  };

  const toggleZone = (zone: string) => {
    setValidationError('');
    if (preferredZones.includes(zone)) {
      setPreferredZones(preferredZones.filter(z => z !== zone));
    } else {
      setPreferredZones([...preferredZones, zone]);
    }
  };

  // Final Submit
  const handleSubmitOnboarding = () => {
    try {
      const updatedUser: User = {
        ...user,
        name: fullName,
        email,
        avatarUrl,
        onboardingCompleted: true,
        aadhaarOrPanDoc: idDocPhoto || undefined,
        bankAccountNo: accountNumber,
        bankIfsc: ifscCode,
        bankName: bankName || 'State Bank of India',
        bankVerifiedStatus: bankVerifiedStatus,
        preferredZones: preferredZones,
        twoWheelerOwned: twoWheelerOwned,
        region: preferredZones[0] || 'Pune Central',
        status: 'pending' // holds for admin audit review
      };

      // Save to centralized database
      DbManager.updateUser(updatedUser);

      // Clean up drafts
      localStorage.removeItem(`aiec_surveyor_onboarding_draft_${user.id}`);

      // Complete flow
      onComplete(updatedUser);
    } catch (e) {
      console.error("Failed to commit final surveyor onboarding ledger:", e);
      setValidationError("Failed to finalize onboarding profile. Please clear browser storage or retry.");
    }
  };

  const zonesList = [
    { id: 'Pune Central', label: 'Pune Central (Kothrud, Erandwane)', spec: 'Highly active residential retrofits' },
    { id: 'Pune North', label: 'Pune North (Pimpri, Chinchwad)', spec: 'Industrial & mid-rise commercial development' },
    { id: 'Pune South', label: 'Pune South (Hadapsar, Katraj)', spec: 'Rapid high-rise residential projects' },
    { id: 'Pune East', label: 'Pune East (Kalyani Nagar, Viman Nagar)', spec: 'Premium residential & corporate hubs' },
    { id: 'Chakan Area', label: 'Chakan Area (Industrial/Manufacturing)', spec: 'Goods elevator requirements & heavy machinery' }
  ];

  const ascensionSteps = [
    { id: '1', label: 'Personal', completed: currentStep > 1, active: currentStep === 1 },
    { id: '2', label: 'ID Scan', completed: currentStep > 2, active: currentStep === 2 },
    { id: '3', label: 'Bank Details', completed: currentStep > 3, active: currentStep === 3 },
    { id: '4', label: 'Area Preference', completed: currentStep > 4, active: currentStep === 4 },
    { id: '5', label: 'Review Info', completed: currentStep > 5, active: currentStep === 5 }
  ];

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl border border-[rgba(184,135,61,0.2)] p-6 md:p-8 space-y-6 shadow-diffuse relative overflow-hidden">
      
      {/* Toast Alert Banner */}
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

      {/* Header Profile Info and Auto Save Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e6dfd4] pb-4 text-left">
        <div>
          <span className="text-[10px] font-mono font-bold text-antiquegold uppercase tracking-widest flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> SECURE ONBOARDING PORTAL
          </span>
          <h2 className="font-serif text-2xl font-bold text-charcoal">Field Surveyor Enrolment</h2>
          <p className="text-xs text-warmgray mt-0.5">Please complete the 4 operational steps to register on the AIEC ledger.</p>
        </div>
        <div className="text-right sm:self-end">
          <span className="text-[9px] bg-royalemerald/10 text-[#0E4B3D] border border-royalemerald/15 px-2.5 py-1 rounded-full font-mono font-bold inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            {draftSavedTime || 'Draft saving active'}
          </span>
        </div>
      </div>

      {/* Progress horizontal Ascension Line tracker */}
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
                <div className="p-1 bg-charcoal rounded-2xl border border-antiquegold/35">
                  <CameraCapture
                    facingMode="user"
                    aspectRatio="square"
                    onCapture={(dataUrl) => {
                      setAvatarUrl(dataUrl);
                      setIsCapturingAvatar(false);
                      saveDraft();
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
                    <h4 className="font-serif text-sm font-bold text-charcoal">Legal Profile Identification</h4>
                    <p className="text-xs text-warmgray">Your profile picture is printed on physical site entrance tags issued by construction managers during elevator shaft mappings.</p>
                    <p className="text-[10px] text-antiquegold font-semibold">Click camera button to take a real photo using your device webcam</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Full Legal Name (Aadhaar Match)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Keshav Sharma"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (!accountHolder) setAccountHolder(e.target.value);
                    }}
                    className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                  />
                  <p className="text-[9px] text-warmgray">Must perfectly match your submitted Aadhaar or PAN ledger.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Verified Contact Number</label>
                  <input
                    type="text"
                    disabled
                    value={user.phone}
                    className="w-full px-4 py-2.5 bg-alabaster/50 border border-[rgba(184,135,61,0.08)] rounded-xl text-xs font-mono font-bold text-warmgray cursor-not-allowed"
                  />
                  <p className="text-[9px] text-success font-semibold">✓ Securely verified via mobile authentication signature</p>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. amit.sharma@aiec-partners.co.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                />
                <p className="text-[9px] text-warmgray">For dispatch schedule updates, mapping certificates, and commission summary receipts.</p>
              </div>

              <div className="p-3 bg-[#0E4B3D]/5 rounded-xl border border-[rgba(14,75,61,0.12)] text-left flex gap-2.5">
                <Info className="w-4 h-4 text-antiquegold shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#0E4B3D] leading-relaxed">
                  <strong>Verification Guard:</strong> Profiles must be physically vetted by Owner <strong>Mr. Prashant Vasant Wable</strong> to confirm territory credentials. Please ensure all names align with bank registers.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: ID PROOF DOCUMENT CAPTURE */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="flex justify-between items-center bg-alabaster p-3 rounded-2xl border border-[rgba(184,135,61,0.1)]">
                <span className="text-xs font-bold text-charcoal">Select Verification Document:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setDocType('aadhaar'); setIdDocPhoto(null); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      docType === 'aadhaar' ? 'bg-antiquegold text-white' : 'bg-white text-warmgray border border-[#e6dfd4]'
                    }`}
                  >
                    Aadhaar Card (12-Digit)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDocType('pan'); setIdDocPhoto(null); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      docType === 'pan' ? 'bg-antiquegold text-white' : 'bg-white text-warmgray border border-[#e6dfd4]'
                    }`}
                  >
                    PAN Card (10-Digit Alphanumeric)
                  </button>
                </div>
              </div>

              {isCapturingDoc ? (
                <div className="space-y-2">
                  <CameraCapture
                    facingMode="environment"
                    aspectRatio="video"
                    onCapture={(dataUrl) => {
                      setIdDocPhoto(dataUrl);
                      setValidationError('');
                      setIsCapturingDoc(false);
                      saveDraft();
                    }}
                    onCancel={() => setIsCapturingDoc(false)}
                  />
                  <div className="p-3 bg-alabaster rounded-xl border border-[#e6dfd4] flex items-center justify-between gap-4 text-left">
                    <div className="text-xs font-bold text-charcoal">Simulate Lens Glare / Blur:</div>
                    <select
                      value={cameraQuality}
                      onChange={(e) => setCameraQuality(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-white border border-[#e6dfd4] rounded-lg text-xs"
                    >
                      <option value="perfect">Perfect Clear Scan</option>
                      <option value="blurry">Unstable Lens Blur</option>
                      <option value="glare">Direct Overhead Bulb Glare</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={confirmDocumentCapture}
                    className="w-full py-2.5 bg-antiquegold text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Confirm Scanned Document Quality Check
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {idDocPhoto ? (
                    <div className="p-4 bg-[#F8F6F1] rounded-2xl border border-[rgba(184,135,61,0.2)] text-left space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-xs font-bold text-charcoal uppercase">
                            Scanned {docType.toUpperCase()} Document Verification
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIdDocPhoto(null)}
                          className="p-1.5 text-error/70 hover:text-error rounded-lg hover:bg-error/10 transition-colors cursor-pointer shrink-0"
                          title="Delete Document Scan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-[#e6dfd4]">
                        <img 
                          src={idDocPhoto} 
                          alt="ID Document Scan" 
                          className="w-36 h-22 rounded-lg border object-cover shadow-sm shrink-0" 
                        />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-charcoal">Scan Signature: OCR_VERIFIED_LEDGER_OK</p>
                          <p className="text-[10px] text-warmgray">Document crop bounding borders analyzed successfully. Optical Character Recognition (OCR) extracted and matched details onto active register.</p>
                          <span className="text-[9px] bg-success/15 border border-success/20 text-success px-2 py-0.5 rounded-full font-mono font-bold block w-fit">
                            🔒 SECURE ENCRYPTED ENVELOPE
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-[#e0dacd] rounded-2xl bg-alabaster/40 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-antiquegold/10 text-antiquegold flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-charcoal">Capture or Upload your {docType.toUpperCase()}</p>
                        <p className="text-xs text-warmgray max-w-sm mx-auto">
                          Requires camera authorization access to scan physical credentials. Ensures GPS coordinates and layout constraints are accurate.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCaptureDocument}
                        className="px-5 py-2.5 bg-charcoal text-white hover:bg-antiquegold rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Open Document Scanning Camera</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: BANK DETAILS FOR COMMISSION PAYOUT */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-antiquegold/10 border border-antiquegold/15 text-left rounded-xl flex gap-2">
                <Info className="w-4.5 h-4.5 text-antiquegold shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#875b1a] leading-relaxed">
                  <strong>Verification Mandate:</strong> Lead mapping payouts are processed via Instant UPI settlement. Active bank IFSC codes are validated against a ₹1.00 NPCI penny-drop verification check before activation.
                </p>
              </div>

              {bankVerifiedStatus === 'failed' && (
                <div className="p-3 bg-error/10 border border-error/25 rounded-xl text-error text-xs font-bold text-left space-y-1">
                  <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide">
                    <AlertTriangle className="w-4.5 h-4.5 text-error shrink-0" />
                    NPCI Bank Verification Unresolved
                  </p>
                  <p className="text-[10px] leading-relaxed font-normal text-error/95">
                    Your penny-drop clearance failed. Please check the account details and re-verify. Payouts will remain locked until verified.
                  </p>
                </div>
              )}

              {bankVerifiedStatus === 'verified' && (
                <div className="p-3 bg-success/10 border border-success/25 rounded-xl text-success text-xs font-bold text-left flex items-start gap-2.5">
                  <CheckCircle className="w-4.5 h-4.5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold uppercase tracking-wider">NPCI PENNY-DROP CONFIRMED</p>
                    <p className="text-[10px] font-normal leading-normal text-success/95 mt-0.5">
                      Clearance Successful. Active beneficiary record linked to bank ledger: <strong className="font-bold">{bankName || 'State Bank of India'}</strong>. UPI commission routers enabled.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Beneficiary Name (Bank Account)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit K Sharma"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                  />
                  <p className="text-[9px] text-warmgray">Must align with legal identification cards.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">IFS Code (Indian Financial System)</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="e.g. SBIN0001234"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal uppercase"
                  />
                  <p className="text-[9px] text-warmgray">11 alphanumeric characters (e.g., SBIN0001234, HDFC0000104)</p>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Bank Account Number</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    required
                    placeholder="Enter savings or current account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                  />
                  <button
                    type="button"
                    disabled={isVerifyingBank || !accountNumber || !ifscCode}
                    onClick={triggerPennyDropVerification}
                    className={`px-4 bg-royalemerald hover:bg-[#0c4337] disabled:bg-warmgray/30 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isVerifyingBank ? 'animate-pulse' : ''
                    }`}
                  >
                    {isVerifyingBank ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Run Penny Drop</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-warmgray">Simulate failure by entering an account number starting with '0000' (e.g. 0000123456).</p>
              </div>
            </div>
          )}

          {/* STEP 4: AREA PREFERENCE & VEHICLE STATUS */}
          {currentStep === 4 && (
            <div className="space-y-5 text-left">
              <div>
                <span className="text-[9px] font-mono font-extrabold bg-antiquegold/15 text-antiquegold px-2 py-0.5 rounded-full uppercase">
                  DISPATCH LOGISTICS PREFERENCES
                </span>
                <h3 className="font-serif text-md font-bold text-charcoal mt-1.5">Select Preferred Operational Zones</h3>
                <p className="text-xs text-warmgray">Which territories will you primarily survey? At least one territory selection is mandatory to activate lead-assignment and route optimization.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {zonesList.map((z) => {
                  const isSelected = preferredZones.includes(z.id);
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => toggleZone(z.id)}
                      className={`w-full p-3 bg-white border rounded-xl flex items-center justify-between text-left transition-all hover:shadow-xs cursor-pointer ${
                        isSelected 
                          ? 'border-antiquegold bg-[#B8873D]/5 ring-1 ring-antiquegold' 
                          : 'border-[rgba(184,135,61,0.12)] hover:bg-alabaster/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-antiquegold border-antiquegold text-white' : 'border-[#e0dacd]'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-charcoal">{z.label}</h4>
                          <p className="text-[10px] text-warmgray">{z.spec}</p>
                        </div>
                      </div>
                      <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-antiquegold' : 'text-warmgray/30'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Vehicle Toggle */}
              <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-left space-y-0.5">
                    <h4 className="font-bold text-xs text-charcoal flex items-center gap-1.5">
                      🏍️ Private Two-Wheeler Vehicle Owned
                    </h4>
                    <p className="text-[10px] text-warmgray">Do you own or have daily active access to a motorcycle/scooter?</p>
                  </div>
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => setTwoWheelerOwned(!twoWheelerOwned)}
                      className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                        twoWheelerOwned ? 'bg-royalemerald' : 'bg-[#e5dfd4]'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-all ${
                        twoWheelerOwned ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                <p className="text-[9px] text-[#875b1a] bg-antiquegold/10 p-2.5 rounded-xl leading-relaxed font-semibold">
                  <strong>Notice:</strong> High-efficiency elevator shaft inspections require rapid travel between site projects. Having a registered two-wheeler is highly recommended for route-optimized assignment routines.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: SUMMARY REVIEW & FINAL LODGING */}
          {currentStep === 5 && (
            <div className="space-y-5 text-left">
              <div>
                <span className="text-[9px] font-mono font-extrabold bg-[#0E4B3D]/10 text-royalemerald px-2 py-0.5 rounded-full uppercase">
                  REGISTRY VERIFICATION AUDIT
                </span>
                <h3 className="font-serif text-md font-bold text-charcoal mt-1.5">Confirm Ledger Records</h3>
                <p className="text-xs text-warmgray">Please review all submitted specifications before final lodgement onto the AIEC master system.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal & ID Card */}
                <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.1)] space-y-3">
                  <h4 className="text-xs font-bold text-charcoal border-b border-[#e6dfd4] pb-1.5 flex items-center gap-1">
                    👤 Profile Details
                  </h4>
                  <div className="flex items-center gap-3">
                    <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-antiquegold shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-charcoal">{fullName}</p>
                      <p className="text-[10px] text-warmgray">{email}</p>
                      <p className="text-[10px] text-warmgray font-mono">{user.phone}</p>
                    </div>
                  </div>
                  <div className="pt-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-success font-bold font-mono">
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span>OCR CARD CAPTURED ({docType.toUpperCase()})</span>
                    </div>
                  </div>
                </div>

                {/* Bank details */}
                <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.1)] space-y-3">
                  <h4 className="text-xs font-bold text-charcoal border-b border-[#e6dfd4] pb-1.5 flex items-center gap-1">
                    🏦 Commission Settlements
                  </h4>
                  <div className="space-y-1 text-[11px] font-mono text-warmgray">
                    <p className="text-charcoal font-bold">{accountHolder}</p>
                    <p>IFSC: {ifscCode}</p>
                    <p>A/C: ••••••{accountNumber.slice(-4) || 'Unrecorded'}</p>
                    <p className="text-xs font-bold text-charcoal mt-1">Bank: {bankName || 'State Bank of India'}</p>
                  </div>
                  <div>
                    {bankVerifiedStatus === 'verified' ? (
                      <span className="text-[9px] bg-success/15 border border-success/20 text-success px-2 py-0.5 rounded-full font-mono font-bold inline-block">
                        🟢 NPCI PENNY-DROP VERIFIED
                      </span>
                    ) : (
                      <span className="text-[9px] bg-error/15 border border-error/20 text-error px-2 py-0.5 rounded-full font-mono font-bold inline-block animate-pulse">
                        ⚠️ COMMISSION PAYOUT REJECTED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Territory Assignments Summary */}
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
                <div className="pt-2 flex items-center justify-between text-[10px] text-warmgray">
                  <span>TWO-WHEELER TRANSPORT:</span>
                  <span className="font-bold text-charcoal">{twoWheelerOwned ? 'Registered Private motorcycle ✓' : 'Public/No Transit'}</span>
                </div>
              </div>

              {/* Security signature block */}
              <div className="p-3.5 bg-royalemerald/5 rounded-2xl border border-[rgba(14,75,61,0.12)] text-left flex gap-2.5">
                <Shield className="w-5 h-5 text-antiquegold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#0E4B3D]">Authorized Ledger Handshake Agreement</h4>
                  <p className="text-[10px] text-[#0E4B3D]/90 leading-relaxed">
                    By submitting, I certify that all mapping documents are authentic. I authorize director Mr. Prashant Vasant Wable to audit my telemetry and geo-signatures during technical site explorations.
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

      {/* Sticky Bottom Actions Bar */}
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
                (currentStep === 2 && !idDocPhoto) ||
                (currentStep === 4 && preferredZones.length === 0)
              }
              onClick={handleNext}
            >
              <span>Continue Step</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitOnboarding}
              className="px-5 py-3 bg-royalemerald hover:bg-[#0b3c31] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Submit for Admin Approval</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
