import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import { 
  MapPin, Camera, Bell, Shield, CheckCircle2, AlertTriangle, 
  Settings, Sparkles, HelpCircle, ArrowRight, Eye, RefreshCw, 
  Smartphone, Compass, Lock, XCircle, Globe
} from 'lucide-react';

interface PermissionsPrimerProps {
  user: User;
  onComplete: (updatedUser: User) => void;
  onSkip?: () => void;
}

// Complete local translation dictionary for English, Marathi, and Hindi
const translations = {
  en: {
    protocol: "PRIVACY & SYSTEM PROTOCOLS",
    title: "System Access Guide",
    subtitle: "Configure device integrations to unlock full logistics, mapping, and verification pipelines.",
    sandboxHeader: "Iframe Sandbox Controls",
    sandboxSimulate: "Simulate OS Responses",
    sandboxDesc: "Since browser privacy rules frequently block native device prompts inside sandboxed iframes, use these buttons to test the application's response states:",
    grantAll: "✓ Grant All",
    denyAll: "❌ Deny All (Degraded)",
    neverAskSimulate: "Simulate 'Never Ask Again'",
    enableNeverAsk: "Enable 'Never Ask Again'",
    locTitle: "Device Location Services",
    locDesc: "Required to verify regional site surveys, map installation coordinates, and route engineer support vehicles efficiently to your build site.",
    locDegraded: "Degraded Mode: Navigation maps will require manual coordinate inputs.",
    camTitle: "Device Camera Verification",
    camDesc: "Used by surveyors to capture shaft structural dimensions, and by technicians to upload photo evidence for Quality Control checklist validations.",
    camDegraded: "Degraded Mode: Proof of work photo submissions will be locked.",
    notTitle: "Instant Push Notifications",
    notDesc: "Ensures you receive immediate alerts when QC inspections clear, installment payments unlock, or dispatch requests update.",
    notDegraded: "Degraded Mode: You must manually check the dashboard to follow build progression.",
    blockBtn: "Block",
    authBtn: "Authorize",
    degradedWarning: "Some device channels are currently declined. You can still use the portal in a degraded mode, or authorize them from your browser/device application settings.",
    redirectTitle: "Redirecting to OS Settings",
    redirectDesc: "Due to a persistent \"Never ask again\" flag set on this device, we cannot show native dialogs. Please grant Location, Camera, or Notifications permission manually in your Android/iOS settings panel:",
    simulateToggle: "Simulate Settings Toggle (Grant)",
    laterBtn: "Configure permissions later",
    authChannels: "Authorized Channels",
    enableSequence: "Enable All Sequence",
    completeSetup: "Complete Setup",
    profile: "PROFILE"
  },
  mr: {
    protocol: "गोपनीयता आणि प्रणाली नियम",
    title: "प्रणाली प्रवेश मार्गदर्शक",
    subtitle: "पूर्ण वाहतूक, नकाशे आणि पडताळणी प्रवाह सुरू करण्यासाठी डिव्हाइस परवानग्या सेट करा.",
    sandboxHeader: "आयफ्रेम सँडबॉक्स नियंत्रणे",
    sandboxSimulate: "OS प्रतिसादांचे सिम्युलेशन",
    sandboxDesc: "सँडबॉक्स आयफ्रेममध्ये ब्राउझर गोपनीयतेमुळे प्रत्यक्ष डिव्हाइस प्रॉम्प्ट्स ब्लॉक होऊ शकतात, म्हणून चाचणीसाठी खालील बटणे वापरा:",
    grantAll: "✓ सर्व मंजूर करा",
    denyAll: "❌ सर्व नाकारा (मर्यादित)",
    neverAskSimulate: "'पुन्हा विचारू नका' सिम्युलेट करा",
    enableNeverAsk: "'पुन्हा विचारू नका' सुरू करा",
    locTitle: "डिव्हाइस स्थान सेवा (GPS)",
    locDesc: "प्रादेशिक साइट सर्वेक्षणांची पडताळणी करण्यासाठी, लिफ्ट इंस्टॉलेशनचे नकाशे तयार करण्यासाठी आणि तंत्रज्ञांच्या वाहनांना कार्यक्षमतेने मार्ग दाखवण्यासाठी आवश्यक आहे.",
    locDegraded: "मर्यादित मोड: नेव्हिगेशन नकाशांसाठी मॅन्युअल इनपुट आवश्यक असेल.",
    camTitle: "डिव्हाइस कॅमेरा पडताळणी",
    camDesc: "लिफ्टच्या शाफ्टचे आकारमान कॅप्चर करण्यासाठी आणि गुणवत्ता नियंत्रण (QC) तपासणीसाठी फोटो पुरावे अपलोड करण्यासाठी आवश्यक आहे.",
    camDegraded: "मर्यादित मोड: कामाचा पुरावा फोटो सबमिट करणे लॉक केले जाईल.",
    notTitle: "त्वरित पुश सूचना (Notifications)",
    notDesc: "गुणवत्ता नियंत्रण मंजूर झाल्यावर, हप्ते पेमेंट अनलॉक झाल्यावर किंवा नवीन कामाचे अपडेट मिळाल्यावर त्वरित सूचना मिळणे सुनिश्चित करते.",
    notDegraded: "मर्यादित मोड: अपडेट्स पाहण्यासाठी तुम्हाला मॅन्युअली डॅशबोर्ड तपासावा लागेल.",
    blockBtn: "नाकारा",
    authBtn: "परवानगी द्या",
    degradedWarning: "काही परवानग्या सध्या नाकारल्या आहेत. तुम्ही तरीही मर्यादित स्वरूपात पोर्टल वापरू शकता, किंवा ब्राउझर/डिव्हाइस सेटिंग्जमधून परवानगी देऊ शकता.",
    redirectTitle: "OS सेटिंग्जवर रिडायरेक्ट करत आहे",
    redirectDesc: "डिव्हाइसवर 'पुन्हा विचारू नका' पर्याय निवडल्यामुळे, आम्ही सिस्टीम डायलॉग दाखवू शकत नाही. कृपया आपल्या अँड्रॉइड/आयओएस सेटिंग्ज पॅनेलमधून मॅन्युअली परवानगी द्या:",
    simulateToggle: "सेटिंग्ज टॉगल सिम्युलेट करा (मंजूर)",
    laterBtn: "परवानग्या नंतर सेट करा",
    authChannels: "मंजूर परवानग्या",
    enableSequence: "सर्व एकत्र मंजूर करा",
    completeSetup: "सेटअप पूर्ण करा",
    profile: "प्रोफाइल"
  },
  hi: {
    protocol: "गोपनीयता और सिस्टम प्रोटोकॉल",
    title: "सिस्टम एक्सेस गाइड",
    subtitle: "पूर्ण लॉजिस्टिक्स, मैपिंग और सत्यापन प्रवाह को अनलॉक करने के लिए डिवाइस अनुमतियां सेट करें।",
    sandboxHeader: "आईफ्रेम सैंडबॉक्स नियंत्रण",
    sandboxSimulate: "OS प्रतिक्रियाओं का सिमुलेशन",
    sandboxDesc: "सैंडबॉक्स आईफ्रेम में ब्राउज़र गोपनीयता के कारण वास्तविक डिवाइस प्रॉम्प्ट ब्लॉक हो सकते हैं, इसलिए परीक्षण के लिए नीचे दिए गए बटन का उपयोग करें:",
    grantAll: "✓ सभी स्वीकृत करें",
    denyAll: "❌ सभी अस्वीकार (सीमित)",
    neverAskSimulate: "'फिर कभी न पूछें' सिम्युलेट करें",
    enableNeverAsk: "'फिर कभी न पूछें' सक्षम करें",
    locTitle: "डिवाइस स्थान सेवा (GPS)",
    locDesc: "क्षेत्रीय साइट सर्वेक्षणों को सत्यापित करने, लिफ्ट इंस्टॉलेशन के नक्शे तैयार करने और इंजीनियर वाहनों को कुशलतापूर्वक मार्ग दिखाने के लिए आवश्यक है।",
    locDegraded: "सीमित मोड: नेविगेशन मानचित्रों के लिए मैन्युअल इनपुट की आवश्यकता होगी।",
    camTitle: "डिवाइस कैमरा सत्यापन",
    camDesc: "लिफ्ट शाफ्ट के संरचनात्मक आयामों को कैप्चर करने और गुणवत्ता नियंत्रण (QC) जांच के लिए फोटो प्रमाण अपलोड करने के लिए आवश्यक है।",
    camDegraded: "सीमित मोड: काम का प्रमाण फोटो सबमिट करना लॉक रहेगा।",
    notTitle: "त्वरित पुश सूचना (Notifications)",
    notDesc: "गुणवत्ता नियंत्रण स्वीकृत होने, किश्तों का भुगतान अनलॉक होने या नए काम के अपडेट मिलने पर त्वरित अलर्ट सुनिश्चित करता है।",
    notDegraded: "सीमित मोड: अपडेट देखने के लिए आपको मैन्युअल रूप से डैशबोर्ड की जांच करनी होगी।",
    blockBtn: "अस्वीकार",
    authBtn: "स्वीकृत करें",
    degradedWarning: "कुछ अनुमतियां वर्तमान में अस्वीकार कर दी गई हैं। आप फिर भी सीमित रूप में पोर्टल का उपयोग कर सकते हैं, या ब्राउज़र/डिवाइस सेटिंग्स से अनुमति दे सकते हैं।",
    redirectTitle: "OS सेटिंग्स पर रिडायरेक्ट किया जा रहा है",
    redirectDesc: "डिवाइस पर 'फिर कभी न पूछें' विकल्प चुनने के कारण, हम सिस्टम डायलॉग नहीं दिखा सकते। कृपया अपने एंड्रॉइड/आईओएस सेटिंग्स पैनल से मैनुअल रूप से अनुमति दें:",
    simulateToggle: "सेटिंग्स टॉगल सिम्युलेट करें (स्वीकृत)",
    laterBtn: "अनुमतियां बाद में सेट करें",
    authChannels: "स्वीकृत अनुमतियां",
    enableSequence: "सभी एक साथ स्वीकृत करें",
    completeSetup: "सेटअप पूर्ण करें",
    profile: "प्रोफ़ाइल"
  }
};

export const PermissionsPrimer: React.FC<PermissionsPrimerProps> = ({ 
  user, 
  onComplete,
  onSkip 
}) => {
  const role = user.role;

  // Language state: defaults to english, easily switchable to Marathi or Hindi
  const [lang, setLang] = useState<'en' | 'mr' | 'hi'>('en');

  // Determine what permissions are actually needed for this role
  const needsCamera = role === 'surveyor' || role === 'technician';
  const needsLocation = true;
  const needsNotifications = true;

  // Permissions state
  const [locStatus, setLocStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [camStatus, setCamStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>(
    needsCamera ? 'prompt' : 'unsupported'
  );
  const [notStatus, setNotStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');

  // Interactive OS Settings popup simulation
  const [showSettingsSimulation, setShowSettingsSimulation] = useState<boolean>(false);
  const [isNeverAskAgainActive, setIsNeverAskAgainActive] = useState<boolean>(false);
  
  // Progress calculations
  const totalRequired = 2 + (needsCamera ? 1 : 0);
  const grantedCount = 
    (locStatus === 'granted' ? 1 : 0) + 
    (camStatus === 'granted' ? 1 : 0) + 
    (notStatus === 'granted' ? 1 : 0);
  
  const completionPercentage = Math.round((grantedCount / totalRequired) * 100);

  // Load translations based on current language
  const t = translations[lang];

  // Auto-fill existing settings if user has them
  useEffect(() => {
    if (user.location_permission_status) setLocStatus(user.location_permission_status);
    if (needsCamera && user.camera_permission_status) setCamStatus(user.camera_permission_status);
    if (user.notification_permission_status) setNotStatus(user.notification_permission_status);
  }, [user, needsCamera]);

  // Handler to request a specific permission
  const triggerPermissionRequest = async (type: 'location' | 'camera' | 'notification', simulatedOutcome?: 'granted' | 'denied') => {
    if (isNeverAskAgainActive) {
      setShowSettingsSimulation(true);
      return;
    }

    if (type === 'location') {
      if (simulatedOutcome) {
        setLocStatus(simulatedOutcome);
        return;
      }
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => setLocStatus('granted'),
          () => setLocStatus('denied'),
          { timeout: 5000 }
        );
      } else {
        setLocStatus('unsupported');
      }
    }

    if (type === 'camera') {
      if (simulatedOutcome) {
        setCamStatus(simulatedOutcome);
        return;
      }
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            setCamStatus('granted');
            stream.getTracks().forEach(track => track.stop());
          })
          .catch(() => {
            setCamStatus('denied');
          });
      } else {
        setCamStatus('unsupported');
      }
    }

    if (type === 'notification') {
      if (simulatedOutcome) {
        setNotStatus(simulatedOutcome);
        return;
      }
      if ('Notification' in window) {
        try {
          const res = await Notification.requestPermission();
          setNotStatus(res === 'granted' ? 'granted' : 'denied');
        } catch {
          setNotStatus('unsupported');
        }
      } else {
        setNotStatus('unsupported');
      }
    }
  };

  // Enable All sequentially
  const handleEnableAll = async () => {
    await triggerPermissionRequest('location');
    if (needsCamera) {
      await triggerPermissionRequest('camera');
    }
    await triggerPermissionRequest('notification');
  };

  // Submit and Save Status
  const handleComplete = () => {
    const updatedUser: User = {
      ...user,
      location_permission_status: locStatus,
      camera_permission_status: camStatus,
      notification_permission_status: notStatus,
      primer_shown_flag: true,
      primer_shown_timestamp: new Date().toISOString()
    };

    DbManager.updateUser(updatedUser);
    onComplete(updatedUser);
  };

  return (
    <div className="w-full max-w-xl bg-[#F8F6F1] rounded-3xl border border-[rgba(184,135,61,0.2)] p-6 md:p-8 space-y-6 shadow-diffuse relative overflow-hidden text-left">
      
      {/* Top Gold Progress indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#edeae2]">
        <div 
          className="h-full bg-antiquegold transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Language Switcher Bar */}
      <div className="flex justify-between items-center bg-white p-2.5 rounded-2xl border border-[rgba(184,135,61,0.12)]">
        <span className="text-[10px] font-mono font-extrabold text-charcoal flex items-center gap-1.5 uppercase">
          <Globe className="w-3.5 h-3.5 text-antiquegold" /> Change Language / भाषा निवडा / भाषा बदलें
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
              lang === 'en' 
                ? 'bg-royalemerald text-white font-extrabold' 
                : 'bg-[#F8F6F1] text-warmgray hover:text-charcoal'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang('mr')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
              lang === 'mr' 
                ? 'bg-royalemerald text-white font-extrabold' 
                : 'bg-[#F8F6F1] text-warmgray hover:text-charcoal'
            }`}
          >
            मराठी
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
              lang === 'hi' 
                ? 'bg-royalemerald text-white font-extrabold' 
                : 'bg-[#F8F6F1] text-warmgray hover:text-charcoal'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e6dfd4] pb-4 pt-1">
        <div>
          <span className="text-[10px] font-mono font-bold text-royalemerald uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-antiquegold" /> {t.protocol}
          </span>
          <h2 className="font-serif text-2xl font-bold text-charcoal">{t.title}</h2>
          <p className="text-xs text-warmgray mt-0.5">{t.subtitle}</p>
        </div>
        <div className="text-right sm:self-end">
          <span className="text-[10px] bg-royalemerald/10 text-royalemerald border border-royalemerald/15 px-3 py-1 rounded-full font-mono font-bold inline-block">
            {role.toUpperCase()} {t.profile}
          </span>
        </div>
      </div>

      {/* Sandbox Toggle Panel */}
      <div className="p-3 bg-white rounded-xl border border-[rgba(184,135,61,0.15)] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-extrabold text-antiquegold tracking-wider uppercase">{t.sandboxHeader}</span>
          <span className="text-[8px] bg-antiquegold/10 text-antiquegold px-1.5 py-0.2 rounded font-bold font-mono">{t.sandboxSimulate}</span>
        </div>
        <p className="text-[10px] text-warmgray">{t.sandboxDesc}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setLocStatus('granted');
              if (needsCamera) setCamStatus('granted');
              setNotStatus('granted');
            }}
            className="px-2 py-1.5 bg-[#0E4B3D]/5 hover:bg-[#0E4B3D]/10 text-royalemerald text-[10px] font-bold rounded-lg cursor-pointer border border-royalemerald/10 text-center"
          >
            {t.grantAll}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setLocStatus('denied');
              if (needsCamera) setCamStatus('denied');
              setNotStatus('denied');
            }}
            className="px-2 py-1.5 bg-error/5 hover:bg-error/10 text-error text-[10px] font-bold rounded-lg cursor-pointer border border-error/10 text-center"
          >
            {t.denyAll}
          </button>

          <button
            type="button"
            onClick={() => setIsNeverAskAgainActive(!isNeverAskAgainActive)}
            className={`px-2 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer border text-center ${
              isNeverAskAgainActive 
                ? 'bg-warning/20 text-warning border-warning/30 font-extrabold' 
                : 'bg-white text-warmgray border-[#e6dfd4] hover:bg-alabaster'
            }`}
          >
            🛡️ {isNeverAskAgainActive ? t.neverAskSimulate : t.enableNeverAsk}
          </button>
        </div>
      </div>

      {/* Permissions List Grid */}
      <div className="space-y-4">
        
        {/* Permission 1: Location Card */}
        {needsLocation && (
          <div className={`p-4 rounded-2xl border transition-all ${
            locStatus === 'granted' 
              ? 'bg-white border-royalemerald/20 shadow-sm' 
              : locStatus === 'denied' 
                ? 'bg-error/5 border-error/20' 
                : 'bg-white border-[#e6dfd4] hover:border-antiquegold/30'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className={`p-2 rounded-xl shrink-0 ${
                locStatus === 'granted' ? 'bg-[#0E4B3D]/10 text-royalemerald' : 'bg-[#B8873D]/10 text-antiquegold'
              }`}>
                <MapPin className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="flex-1 text-left space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">{t.locTitle}</h4>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                    locStatus === 'granted' ? 'bg-success/15 text-success' : locStatus === 'denied' ? 'bg-error/15 text-error' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {locStatus}
                  </span>
                </div>
                <p className="text-[11px] text-warmgray leading-relaxed">
                  {t.locDesc}
                </p>

                {locStatus === 'denied' && (
                  <p className="text-[10px] text-error font-medium mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 
                    <span>{t.locDegraded}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {locStatus !== 'granted' && (
              <div className="mt-3 pt-3 border-t border-[#e6dfd4]/40 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => triggerPermissionRequest('location', 'denied')}
                  className="px-2.5 py-1 text-[10px] font-bold text-warmgray hover:text-charcoal cursor-pointer"
                >
                  {t.blockBtn}
                </button>
                <button
                  type="button"
                  onClick={() => triggerPermissionRequest('location', 'granted')}
                  className="px-3 py-1 bg-royalemerald text-white text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  {t.authBtn}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Permission 2: Camera Card (Hides if customer!) */}
        {needsCamera && (
          <div className={`p-4 rounded-2xl border transition-all ${
            camStatus === 'granted' 
              ? 'bg-white border-royalemerald/20 shadow-sm' 
              : camStatus === 'denied' 
                ? 'bg-error/5 border-error/20' 
                : 'bg-white border-[#e6dfd4] hover:border-antiquegold/30'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className={`p-2 rounded-xl shrink-0 ${
                camStatus === 'granted' ? 'bg-[#0E4B3D]/10 text-royalemerald' : 'bg-[#B8873D]/10 text-antiquegold'
              }`}>
                <Camera className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="flex-1 text-left space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">{t.camTitle}</h4>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                    camStatus === 'granted' ? 'bg-success/15 text-success' : camStatus === 'denied' ? 'bg-error/15 text-error' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {camStatus}
                  </span>
                </div>
                <p className="text-[11px] text-warmgray leading-relaxed">
                  {t.camDesc}
                </p>

                {camStatus === 'denied' && (
                  <p className="text-[10px] text-error font-medium mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 
                    <span>{t.camDegraded}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {camStatus !== 'granted' && (
              <div className="mt-3 pt-3 border-t border-[#e6dfd4]/40 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => triggerPermissionRequest('camera', 'denied')}
                  className="px-2.5 py-1 text-[10px] font-bold text-warmgray hover:text-charcoal cursor-pointer"
                >
                  {t.blockBtn}
                </button>
                <button
                  type="button"
                  onClick={() => triggerPermissionRequest('camera', 'granted')}
                  className="px-3 py-1 bg-royalemerald text-white text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  {t.authBtn}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Permission 3: Notifications Card */}
        {needsNotifications && (
          <div className={`p-4 rounded-2xl border transition-all ${
            notStatus === 'granted' 
              ? 'bg-white border-royalemerald/20 shadow-sm' 
              : notStatus === 'denied' 
                ? 'bg-error/5 border-error/20' 
                : 'bg-white border-[#e6dfd4] hover:border-antiquegold/30'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className={`p-2 rounded-xl shrink-0 ${
                notStatus === 'granted' ? 'bg-[#0E4B3D]/10 text-royalemerald' : 'bg-[#B8873D]/10 text-antiquegold'
              }`}>
                <Bell className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="flex-1 text-left space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">{t.notTitle}</h4>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                    notStatus === 'granted' ? 'bg-success/15 text-success' : notStatus === 'denied' ? 'bg-error/15 text-error' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {notStatus}
                  </span>
                </div>
                <p className="text-[11px] text-warmgray leading-relaxed">
                  {t.notDesc}
                </p>

                {notStatus === 'denied' && (
                  <p className="text-[10px] text-error font-medium mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 
                    <span>{t.notDegraded}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {notStatus !== 'granted' && (
              <div className="mt-3 pt-3 border-t border-[#e6dfd4]/40 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => triggerPermissionRequest('notification', 'denied')}
                  className="px-2.5 py-1 text-[10px] font-bold text-warmgray hover:text-charcoal cursor-pointer"
                >
                  {t.blockBtn}
                </button>
                <button
                  type="button"
                  onClick={() => triggerPermissionRequest('notification', 'granted')}
                  className="px-3 py-1 bg-royalemerald text-white text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  {t.authBtn}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Gentle notice about Location settings if any declined */}
      {(locStatus === 'denied' || camStatus === 'denied' || notStatus === 'denied') && (
        <div className="p-3.5 bg-[#B8873D]/5 border border-[rgba(184,135,61,0.15)] rounded-xl flex items-start gap-2.5 text-xs text-charcoal">
          <HelpCircle className="w-4 h-4 text-antiquegold shrink-0 mt-0.5" />
          <p className="leading-normal">{t.degradedWarning}</p>
        </div>
      )}

      {/* OS Settings Direct Link Simulation Dialog */}
      <AnimatePresence>
        {showSettingsSimulation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-white rounded-2xl border border-warning/30 shadow-lg space-y-3"
          >
            <div className="flex items-center gap-2 text-warning font-bold">
              <Lock className="w-4 h-4 text-antiquegold" />
              <span className="text-xs uppercase tracking-wider font-mono">{t.redirectTitle}</span>
            </div>
            <p className="text-[11px] text-warmgray">{t.redirectDesc}</p>
            <div className="p-2.5 bg-alabaster rounded-xl border font-mono text-[10px] text-warmgray space-y-1">
              <div className="flex justify-between">
                <span>APP PACKAGE:</span>
                <span className="font-bold text-charcoal">com.allindiaelevators.aiec</span>
              </div>
              <div className="flex justify-between">
                <span>STORAGE PERMISSION:</span>
                <span>GRANTED</span>
              </div>
              <div className="flex justify-between">
                <span>LOCATION STATUS:</span>
                <span className="text-error font-bold">DENIED ("NEVER ASK")</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowSettingsSimulation(false)}
                className="px-2.5 py-1 text-[10px] font-bold text-warmgray hover:text-charcoal cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocStatus('granted');
                  if (needsCamera) setCamStatus('granted');
                  setNotStatus('granted');
                  setIsNeverAskAgainActive(false);
                  setShowSettingsSimulation(false);
                }}
                className="px-3 py-1 bg-[#0E4B3D] text-white text-[10px] font-bold rounded-lg cursor-pointer"
              >
                {t.simulateToggle}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action panel */}
      <div className="pt-4 border-t border-[#e6dfd4] flex flex-col sm:flex-row justify-between items-center gap-3">
        
        {/* Skip option */}
        <div className="text-left">
          {onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-bold text-warmgray hover:text-charcoal cursor-pointer hover:underline"
            >
              {t.laterBtn}
            </button>
          ) : (
            <span className="text-[10px] font-mono text-warmgray font-semibold">
              {t.authChannels}: {grantedCount} / {totalRequired}
            </span>
          )}
        </div>

        {/* Main CTA */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          {grantedCount < totalRequired && (
            <button
              type="button"
              onClick={handleEnableAll}
              className="px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.25)] text-charcoal text-xs font-bold rounded-xl hover:bg-[#edeae2] transition-all cursor-pointer text-center"
            >
              {t.enableSequence}
            </button>
          )}

          <button
            type="button"
            onClick={handleComplete}
            className="px-5 py-2.5 bg-royalemerald hover:bg-[#0b3c31] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <span>{t.completeSetup}</span>
            <ArrowRight className="w-4 h-4 text-antiquegold" />
          </button>
        </div>

      </div>

    </div>
  );
};
