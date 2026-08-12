import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lead } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import { 
  User as UserIcon, Phone, MapPin, Shield, Check, Lock, 
  KeyRound, Smartphone, MessageSquare, AlertCircle, Sparkles, 
  Compass, ArrowRight, RefreshCw, FileText, CheckCircle, Info
} from 'lucide-react';

interface CustomerQuickSignupProps {
  user: User;
  onComplete: (updatedUser: User) => void;
  onSignOut: () => void;
}

export const CustomerQuickSignup: React.FC<CustomerQuickSignupProps> = ({ 
  user, 
  onComplete, 
  onSignOut 
}) => {
  // Try to find a matching lead by the user's phone number to simulate "auto-created from lead conversion"
  const matchingLead = DbManager.getLeads().find(
    l => l.contactInfo.phone.replace(/\s+/g, '') === user.phone.replace(/\s+/g, '')
  );

  // Form Fields - Pre-filled from matching lead or user base details
  const [customerName, setCustomerName] = useState<string>(
    user.name || (matchingLead ? matchingLead.contactInfo.name : '')
  );
  const [phoneNumber, setPhoneNumber] = useState<string>(
    user.phone || (matchingLead ? matchingLead.contactInfo.phone : '')
  );
  const [siteAddress, setSiteAddress] = useState<string>(
    user.siteAddress || (matchingLead ? matchingLead.buildingInfo.address : '')
  );

  // Login Preferences
  const [loginPreference, setLoginPreference] = useState<'password' | 'otp'>(
    user.loginPreference || 'password'
  );
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Communication & Consent checkboxes
  const [whatsappConsent, setWhatsappConsent] = useState<boolean>(
    user.communicationConsentFlags?.whatsapp ?? true
  );
  const [smsConsent, setSmsConsent] = useState<boolean>(
    user.communicationConsentFlags?.sms ?? true
  );
  const [termsConsent, setTermsConsent] = useState<boolean>(false);

  // Validation feedback
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [draftSavedTime, setDraftSavedTime] = useState<string>('');
  const [simulationAlert, setSimulationAlert] = useState<string | null>(
    matchingLead 
      ? `✓ Lead Match Located: We retrieved your site parameters from Surveyor ${matchingLead.surveyorId === 'amit_sharma' ? 'Amit Sharma' : 'the field agent'}'s survey for "${matchingLead.contactInfo.name}".`
      : '⚠️ Standalone Profile: No prior active construction survey matched this phone number. You can populate details below to create a direct contract.'
  );

  const [validationError, setValidationError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Progress calculations
  const progressPercentage = Math.round(
    ((customerName ? 20 : 0) + 
     (phoneNumber.length >= 10 ? 20 : 0) + 
     (siteAddress ? 20 : 0) + 
     (loginPreference === 'otp' || (password.length >= 6 && password === confirmPassword) ? 20 : 0) + 
     (termsConsent ? 20 : 0))
  );

  // Load draft from localStorage on mount with safety checks
  useEffect(() => {
    const draftKey = `aiec_customer_signup_draft_${user.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        if (d.customerName) setCustomerName(d.customerName);
        if (d.phoneNumber) setPhoneNumber(d.phoneNumber);
        if (d.siteAddress) setSiteAddress(d.siteAddress);
        if (d.loginPreference) setLoginPreference(d.loginPreference);
        if (d.whatsappConsent !== undefined) setWhatsappConsent(d.whatsappConsent);
        if (d.smsConsent !== undefined) setSmsConsent(d.smsConsent);
        if (d.termsConsent !== undefined) setTermsConsent(d.termsConsent);
        
        const dateStr = new Date(d.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setDraftSavedTime(`Draft loaded from ${dateStr}`);
      } catch (e) {
        console.error("Failed to parse customer quick signup draft", e);
      }
    }
  }, [user.id]);

  // Auto-save draft safely on change
  useEffect(() => {
    const draftKey = `aiec_customer_signup_draft_${user.id}`;
    const timer = setTimeout(() => {
      try {
        const draftData = {
          customerName,
          phoneNumber,
          siteAddress,
          loginPreference,
          whatsappConsent,
          smsConsent,
          termsConsent,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(draftKey, JSON.stringify(draftData));
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setDraftSavedTime(`Draft saved at ${nowStr}`);
      } catch (e) {
        console.warn("Unable to save customer signup draft", e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [customerName, phoneNumber, siteAddress, loginPreference, whatsappConsent, smsConsent, termsConsent, user.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    // Reset individual field errors
    setNameError(null);
    setPhoneError(null);
    setAddressError(null);
    setPasswordError(null);

    let hasError = false;
    if (!customerName.trim() || customerName.trim().length < 3) {
      setNameError("Please enter a valid legal name (min 3 characters).");
      hasError = true;
    }
    
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      setPhoneError("Provide a valid 10-digit mobile number.");
      hasError = true;
    }

    if (!siteAddress.trim() || siteAddress.trim().length < 8) {
      setAddressError("Installation site address must be descriptive (min 8 characters).");
      hasError = true;
    }

    if (loginPreference === 'password') {
      if (password.length < 6) {
        setPasswordError("Password must be at least 6 characters for vault security.");
        hasError = true;
      } else if (password !== confirmPassword) {
        setPasswordError("Password credentials do not match.");
        hasError = true;
      }
    }

    if (!termsConsent) {
      setValidationError("You must accept the AIEC elevator procurement and safety protocols.");
      hasError = true;
    }

    if (hasError) return;

    try {
      const existingUsers = DbManager.getUsers();
      const isPhoneDuplicate = existingUsers.some(
        u => u.phone.replace(/\s+/g, '') === cleanPhone && u.id !== user.id
      );

      if (isPhoneDuplicate) {
        setSimulationAlert(`ℹ️ Existing Account Located: Your phone number is already registered in our active ledger. We have linked this new installation project to your current account!`);
      }

      const updatedUser: User = {
        ...user,
        name: customerName,
        phone: phoneNumber,
        siteAddress: siteAddress,
        loginPreference: loginPreference,
        communicationConsentFlags: {
          sms: smsConsent,
          whatsapp: whatsappConsent,
          email: true
        },
        passwordHash: loginPreference === 'password' ? password : undefined,
        onboardingCompleted: true,
        status: 'active' // Clients are instantly activated
      };

      DbManager.updateUser(updatedUser);
      localStorage.removeItem(`aiec_customer_signup_draft_${user.id}`);
      onComplete(updatedUser);
    } catch (err) {
      console.error("Failed to commit final customer onboarding specs:", err);
      setValidationError("Failed to submit client registration profile. Please retry.");
    }
  };

  const triggerDemoLeadSim = (leadId: string) => {
    setValidationError('');
    const selectedLead = DbManager.getLeadById(leadId);
    if (selectedLead) {
      setCustomerName(selectedLead.contactInfo.name);
      setPhoneNumber(selectedLead.contactInfo.phone);
      setSiteAddress(selectedLead.buildingInfo.address);
      setSimulationAlert(`✓ Demo Simulated Lead: Retrieved info from lead "${selectedLead.contactInfo.name}" (${selectedLead.buildingInfo.type} type, ${selectedLead.buildingInfo.floors} floors).`);
      triggerToast(`Loaded credentials for ${selectedLead.contactInfo.name}!`);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-3xl border border-[rgba(184,135,61,0.2)] p-6 md:p-8 space-y-6 shadow-diffuse relative overflow-hidden text-left">
      
      {/* Top golden progress bar indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-alabaster">
        <div 
          className="h-full bg-antiquegold transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

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

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e6dfd4] pb-4 pt-1">
        <div>
          <span className="text-[10px] font-mono font-bold text-royalemerald uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-antiquegold" /> AIEC CLIENT ENGAGEMENT GATEWAY
          </span>
          <h2 className="font-serif text-2xl font-bold text-charcoal">Confirm Your Project Account</h2>
          <p className="text-xs text-warmgray mt-0.5">Your installation portal is pre-configured. Confirm your details to follow the live deployment.</p>
        </div>
        <div className="text-right sm:self-end">
          <span className="text-[9px] bg-royalemerald/10 text-royalemerald border border-royalemerald/15 px-2.5 py-1 rounded-full font-mono font-bold inline-block">
            {draftSavedTime || 'Encrypted active state'}
          </span>
        </div>
      </div>

      {/* Demo helper panel to swap matching leads */}
      <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-extrabold text-antiquegold tracking-wider uppercase">DEMO SIMULATOR LEVER</span>
          <span className="text-[9px] bg-[#B8873D]/10 text-antiquegold px-1.5 py-0.2 rounded-md font-bold">Try Lead Pre-fill</span>
        </div>
        <p className="text-[10px] text-warmgray">Simulate different field survey leads converted by Surveyor Amit Sharma:</p>
        <div className="flex flex-wrap gap-1.5 font-semibold">
          <button
            type="button"
            onClick={() => triggerDemoLeadSim('lead_1')}
            className="px-2.5 py-1 bg-white hover:bg-alabaster border border-[#e6dfd4] text-[10px] text-charcoal rounded-lg cursor-pointer transition-all"
          >
            Deshmukh Arcade (Kothrud)
          </button>
          <button
            type="button"
            onClick={() => triggerDemoLeadSim('lead_2')}
            className="px-2.5 py-1 bg-white hover:bg-alabaster border border-[#e6dfd4] text-[10px] text-charcoal rounded-lg cursor-pointer transition-all"
          >
            Shanti Niwas (Erandwane)
          </button>
          <button
            type="button"
            onClick={() => triggerDemoLeadSim('lead_3')}
            className="px-2.5 py-1 bg-white hover:bg-alabaster border border-[#e6dfd4] text-[10px] text-charcoal rounded-lg cursor-pointer transition-all"
          >
            TechPark 62 (Hinjewadi)
          </button>
        </div>
      </div>

      {simulationAlert && (
        <div className="p-3.5 bg-royalemerald/5 border border-royalemerald/15 rounded-xl text-royalemerald text-xs font-semibold flex gap-2.5 items-start">
          <CheckCircle className="w-4 h-4 shrink-0 text-antiquegold mt-0.5" />
          <span>{simulationAlert}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: CUSTOMER IDENTITY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e6dfd4]/70 pb-1">
            <span className="text-[11px] font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-antiquegold" /> 1. Client Site Identity
            </span>
            <span className="text-[9px] font-mono text-warmgray">PRE-FILLED FROM FIELD SURVEY</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-xs text-left">
              <label className="block font-bold text-charcoal uppercase tracking-wide">Customer Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikas Mehta"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (nameError) setNameError(null);
                    setValidationError('');
                  }}
                  className="w-full pl-9 pr-8 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                />
                <UserIcon className="w-4 h-4 text-warmgray absolute left-3.5 top-3" />
                {customerName.trim().length > 2 && (
                  <Check className="w-4 h-4 text-success absolute right-3 top-3 stroke-[3]" />
                )}
              </div>
              {nameError && <p className="text-[10px] text-error font-bold mt-0.5">{nameError}</p>}
            </div>

            <div className="space-y-1 text-xs text-left">
              <label className="block font-bold text-charcoal uppercase tracking-wide">Registered Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 95555 66666"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (phoneError) setPhoneError(null);
                    setValidationError('');
                  }}
                  className="w-full pl-9 pr-8 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl font-mono font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                />
                <Phone className="w-4 h-4 text-warmgray absolute left-3.5 top-3" />
                {phoneNumber.replace(/\s+/g, '').length >= 10 && (
                  <Check className="w-4 h-4 text-success absolute right-3 top-3 stroke-[3]" />
                )}
              </div>
              {phoneError && <p className="text-[10px] text-error font-bold mt-0.5">{phoneError}</p>}
            </div>
          </div>

          <div className="space-y-1 text-xs text-left">
            <label className="block font-bold text-charcoal uppercase tracking-wide">Installation Site Address</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Plot No. 62, Hinjewadi Phase 1, Pune"
                value={siteAddress}
                onChange={(e) => {
                  setSiteAddress(e.target.value);
                  if (addressError) setAddressError(null);
                  setValidationError('');
                }}
                className="w-full pl-9 pr-8 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl font-semibold text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
              />
              <MapPin className="w-4 h-4 text-warmgray absolute left-3.5 top-3" />
              {siteAddress.trim().length > 10 && (
                <Check className="w-4 h-4 text-success absolute right-3 top-3 stroke-[3]" />
              )}
            </div>
            <p className="text-[9px] text-warmgray font-semibold">Ensure structural parameters and lift coordinates match building site approvals.</p>
            {addressError && <p className="text-[10px] text-error font-bold mt-0.5">{addressError}</p>}
          </div>
        </div>

        {/* SECTION 2: ACCESS & SECURITY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e6dfd4]/70 pb-1">
            <span className="text-[11px] font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-antiquegold" /> 2. Project Portal Access Credentials
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLoginPreference('password')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                loginPreference === 'password'
                  ? 'border-antiquegold bg-[#B8873D]/5 text-charcoal font-bold'
                  : 'border-[#e6dfd4] bg-alabaster/20 text-warmgray'
              }`}
            >
              <KeyRound className={`w-5 h-5 ${loginPreference === 'password' ? 'text-antiquegold' : 'text-warmgray'}`} />
              <div className="text-center">
                <p className="text-xs">Password Vault</p>
                <p className="text-[9px] text-warmgray mt-0.5">Secure static password lock</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLoginPreference('otp')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                loginPreference === 'otp'
                  ? 'border-antiquegold bg-[#B8873D]/5 text-charcoal font-bold'
                  : 'border-[#e6dfd4] bg-alabaster/20 text-warmgray'
              }`}
            >
              <Smartphone className={`w-5 h-5 ${loginPreference === 'otp' ? 'text-antiquegold' : 'text-warmgray'}`} />
              <div className="text-center">
                <p className="text-xs">Passwordless OTP</p>
                <p className="text-[9px] text-warmgray mt-0.5">Instant secure sms code</p>
              </div>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {loginPreference === 'password' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden pt-1"
              >
                <div className="space-y-1 text-xs text-left">
                  <label className="block font-bold text-charcoal uppercase tracking-wide">Setup Account Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(null);
                        setValidationError('');
                      }}
                      className="w-full pl-9 pr-4 py-2 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-charcoal focus:outline-none"
                    />
                    <Lock className="w-3.5 h-3.5 text-warmgray absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="space-y-1 text-xs text-left">
                  <label className="block font-bold text-charcoal uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Repeat account password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError(null);
                        setValidationError('');
                      }}
                      className="w-full pl-9 pr-4 py-2 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-charcoal focus:outline-none"
                    />
                    <Lock className="w-3.5 h-3.5 text-warmgray absolute left-3.5 top-3" />
                  </div>
                </div>
                {passwordError && (
                  <p className="text-[10px] text-error font-bold sm:col-span-2">{passwordError}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 3: CONSENT & ASSURANCE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e6dfd4]/70 pb-1">
            <span className="text-[11px] font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-antiquegold" /> 3. Consent & Project Notifications
            </span>
          </div>

          <div className="space-y-2.5">
            <div 
              onClick={() => {
                setWhatsappConsent(!whatsappConsent);
                setValidationError('');
              }}
              className="p-3 bg-white border border-[#e6dfd4] rounded-xl flex items-start gap-2.5 hover:bg-alabaster/40 cursor-pointer transition-all text-left"
            >
              <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                whatsappConsent ? 'bg-royalemerald border-royalemerald text-white' : 'border-warmgray/45'
              }`}>
                {whatsappConsent && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="text-xs">
                <p className="font-bold text-charcoal">Enable Live WhatsApp Dispatch & Construction Updates</p>
                <p className="text-[10px] text-warmgray mt-0.5">Receive immediate notifications with technician photo-verifications when guide rails or cabins are erected.</p>
              </div>
            </div>

            <div 
              onClick={() => {
                setSmsConsent(!smsConsent);
                setValidationError('');
              }}
              className="p-3 bg-white border border-[#e6dfd4] rounded-xl flex items-start gap-2.5 hover:bg-alabaster/40 cursor-pointer transition-all text-left"
            >
              <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                smsConsent ? 'bg-royalemerald border-royalemerald text-white' : 'border-warmgray/45'
              }`}>
                {smsConsent && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="text-xs">
                <p className="font-bold text-charcoal">Enable SMS Installment & Invoice Notifications</p>
                <p className="text-[10px] text-warmgray mt-0.5">Get safety reminders and links for installment payouts securely to prevent logistics interruptions.</p>
              </div>
            </div>

            <div 
              onClick={() => {
                setTermsConsent(!termsConsent);
                setValidationError('');
              }}
              className="p-3.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.12)] flex items-start gap-2.5 hover:bg-alabaster/60 cursor-pointer transition-all text-left"
            >
              <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                termsConsent ? 'bg-royalemerald border-royalemerald text-white' : 'border-warmgray/45'
              }`}>
                {termsConsent && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="text-xs">
                <p className="font-bold text-charcoal">Accept AIEC Elevator Procurement & Safety Protocols</p>
                <p className="text-[10px] text-warmgray mt-0.5 font-semibold">I verify that the site parameters and contact coordinates retrieved are correct. I authorize Mr. Prashant Wable's engineering team to proceed with shaft deployment tracking.</p>
              </div>
            </div>
          </div>
        </div>

        {validationError && (
          <div className="p-3.5 bg-error/10 border border-error/20 rounded-2xl text-error text-xs font-bold text-left flex gap-2">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Progress Bar Info Box */}
        <div className="bg-alabaster/50 border border-[#e6dfd4]/40 rounded-xl p-3 flex items-center justify-between text-[10px] text-warmgray">
          <span>Client Profiling Progress: <strong>{progressPercentage}%</strong></span>
          <span>Required Compliance Checklist: <strong>100%</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-[#e6dfd4] gap-3">
          <div className="text-left shrink-0">
            <button
              type="button"
              onClick={onSignOut}
              className="text-xs font-bold text-error hover:underline cursor-pointer"
            >
              Cancel / Exit
            </button>
          </div>

          <button
            type="submit"
            disabled={!termsConsent || !customerName.trim() || phoneNumber.replace(/\s+/g, '').length < 10 || !siteAddress.trim() || (loginPreference === 'password' && (password.length < 6 || password !== confirmPassword))}
            className="px-5 py-3 bg-royalemerald hover:bg-[#0b3c31] disabled:bg-warmgray/35 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <CheckCircle className="w-4 h-4 text-antiquegold" />
            <span>Establish Live Project Portal</span>
          </button>
        </div>

      </form>

    </div>
  );
};
