import React, { useState, useMemo } from 'react';
import { 
  History, Eye, ArrowLeftRight, CheckCircle2, ChevronRight, AlertTriangle, 
  RefreshCw, Link, ArrowRight, User, Plus, Info, Clock, Check, Calendar,
  Sliders, MessageSquare, ChevronDown, ChevronUp, Tag
} from 'lucide-react';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';

interface QuotationVersion {
  id: string;
  versionNumber: number;
  dateCreated: string;
  createdBy: string;
  creatorRole: 'admin' | 'sales' | 'customer';
  createdReason: string;
  finalPriceInclusiveGst: number;
  validityDate: string;
  viewTrackingStatus: 'unopened' | 'opened' | 'bounced';
  isActiveSent: boolean;
  internalOnlyNote: string;
  specs: {
    driveType: string;
    floors: number;
    cabinFinish: string;
    speed: string;
    emergencyBackup: string;
    warrantyYears: number;
    amcTier: string;
  };
}

export const QuotationVersionHistory: React.FC<{ 
  user: any;
  onSelectActiveVersion?: (version: QuotationVersion) => void;
}> = ({ user, onSelectActiveVersion }) => {
  const { language } = useLanguage();
  const [toastMsg, setToastMsg] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('v-4');
  const [collapsed, setCollapsed] = useState(false);
  const [recalculateAlert, setRecalculateAlert] = useState<string | null>(null);

  // New mock manual specification entry
  const [showAddVersion, setShowAddVersion] = useState(false);
  const [newReason, setNewReason] = useState('Recalculated discount after site visit verification');
  const [newPrice, setNewPrice] = useState(1150000);
  const [newCabin, setNewCabin] = useState('Brushed Stainless Steel #304');
  const [newWarranty, setNewWarranty] = useState(2);
  const [newInternalNote, setNewInternalNote] = useState('Added promotional warranty extension for client Goodwill.');

  // Pre-configured mock data for versions
  const [versions, setVersions] = useState<QuotationVersion[]>([
    {
      id: 'v-1',
      versionNumber: 1,
      dateCreated: '2026-03-10',
      createdBy: 'Prashant Wable',
      creatorRole: 'admin',
      createdReason: 'Initial survey baseline draft calculation',
      finalPriceInclusiveGst: 1045000,
      validityDate: '2026-04-10',
      viewTrackingStatus: 'opened',
      isActiveSent: false,
      internalOnlyNote: 'Baseline hardware cost plus standard 18% GST.',
      specs: {
        driveType: 'VVVF Geared Traction',
        floors: 4,
        cabinFinish: 'Mild Steel Powder Coated (Grey)',
        speed: '0.8 m/s Standard Speed',
        emergencyBackup: 'Standard Battery Backed ARD',
        warrantyYears: 1,
        amcTier: 'Standard Preventive AMC'
      }
    },
    {
      id: 'v-2',
      versionNumber: 2,
      dateCreated: '2026-04-12',
      createdBy: 'Amit Shah (Sales)',
      creatorRole: 'sales',
      createdReason: 'Customer requested cabin material upgrade',
      finalPriceInclusiveGst: 1198000,
      validityDate: '2026-05-12',
      viewTrackingStatus: 'opened',
      isActiveSent: false,
      internalOnlyNote: 'Premium brushed hairless steel upgrade has standard 25% markup rate.',
      specs: {
        driveType: 'VVVF Geared Traction',
        floors: 4,
        cabinFinish: 'Brushed Hairline Stainless Steel #304',
        speed: '1.0 m/s High Performance',
        emergencyBackup: 'Advanced Voice Assisted Rescue',
        warrantyYears: 2,
        amcTier: 'Quarterly Scheduled Safety AMC'
      }
    },
    {
      id: 'v-3',
      versionNumber: 3,
      dateCreated: '2026-06-15',
      createdBy: 'Customer self-portal request',
      creatorRole: 'customer',
      createdReason: 'Online client-side trial package adjustment',
      finalPriceInclusiveGst: 1148000,
      validityDate: '2026-07-15',
      viewTrackingStatus: 'opened',
      isActiveSent: false,
      internalOnlyNote: 'Customer selected lower warranty period on interactive web portal.',
      specs: {
        driveType: 'VVVF Geared Traction',
        floors: 4,
        cabinFinish: 'Brushed Hairline Stainless Steel #304',
        speed: '1.0 m/s High Performance',
        emergencyBackup: 'Advanced Voice Assisted Rescue',
        warrantyYears: 1,
        amcTier: 'Quarterly Scheduled Safety AMC'
      }
    },
    {
      id: 'v-4',
      versionNumber: 4,
      dateCreated: '2026-07-10',
      createdBy: 'Amit Shah (Sales)',
      creatorRole: 'sales',
      createdReason: 'Price adjustment & official negotiation discount',
      finalPriceInclusiveGst: 1120000,
      validityDate: '2026-08-10',
      viewTrackingStatus: 'unopened',
      isActiveSent: true,
      internalOnlyNote: 'Approved 5% strategic discount. Only this version is currently active.',
      specs: {
        driveType: 'VVVF Geared Traction',
        floors: 4,
        cabinFinish: 'Brushed Hairline Stainless Steel #304',
        speed: '1.0 m/s High Performance',
        emergencyBackup: 'Advanced Voice Assisted Rescue',
        warrantyYears: 2,
        amcTier: 'Quarterly Scheduled Safety AMC'
      }
    }
  ]);

  // Selected object
  const selectedVersion = useMemo(() => {
    return versions.find(v => v.id === selectedVersionId) || versions[versions.length - 1];
  }, [versions, selectedVersionId]);

  // Diff of selected version against previous chronological version
  const selectedDiff = useMemo(() => {
    const sorted = [...versions].sort((a, b) => a.versionNumber - b.versionNumber);
    const index = sorted.findIndex(v => v.id === selectedVersion.id);
    if (index <= 0) return null; // No previous version to diff against
    const prev = sorted[index - 1];
    
    const diffs: { field: string; prevVal: any; newVal: any; critical: boolean }[] = [];
    
    if (prev.finalPriceInclusiveGst !== selectedVersion.finalPriceInclusiveGst) {
      diffs.push({
        field: 'Price (Inclusive GST)',
        prevVal: `₹${prev.finalPriceInclusiveGst.toLocaleString()}`,
        newVal: `₹${selectedVersion.finalPriceInclusiveGst.toLocaleString()}`,
        critical: true
      });
    }
    if (prev.specs.cabinFinish !== selectedVersion.specs.cabinFinish) {
      diffs.push({
        field: 'Cabin Material Finish',
        prevVal: prev.specs.cabinFinish,
        newVal: selectedVersion.specs.cabinFinish,
        critical: false
      });
    }
    if (prev.specs.warrantyYears !== selectedVersion.specs.warrantyYears) {
      diffs.push({
        field: 'Warranty Duration',
        prevVal: `${prev.specs.warrantyYears} Years`,
        newVal: `${selectedVersion.specs.warrantyYears} Years`,
        critical: false
      });
    }
    if (prev.validityDate !== selectedVersion.validityDate) {
      diffs.push({
        field: 'Quotation Validity',
        prevVal: prev.validityDate,
        newVal: selectedVersion.validityDate,
        critical: true
      });
    }
    if (prev.specs.emergencyBackup !== selectedVersion.specs.emergencyBackup) {
      diffs.push({
        field: 'Emergency ARD Safety System',
        prevVal: prev.specs.emergencyBackup,
        newVal: selectedVersion.specs.emergencyBackup,
        critical: false
      });
    }

    return diffs;
  }, [versions, selectedVersion]);

  // Translations
  const t = useMemo(() => {
    const translations = {
      en: {
        title: "Quotation Version History & Audit",
        subtitle: "Review complete chronological revision history. Restore legacy specifications, verify contract diffs, and inspect tracking data.",
        badgeTitle: "AUDIT CONTRACT ENGINE • MODULE 7 OF 20",
        activeSentBadge: "Active / Sent Out",
        supersededBadge: "Superseded",
        restoreBtn: "Restore as Current Version",
        diffTitle: "Specification Diffs Against Prior Version",
        noDiffs: "No significant pricing or specs changes detected in this version compared to the prior state.",
        diffField: "Parameter Name",
        diffOld: "Previous Setting",
        diffNew: "Revised Setting",
        internalNote: "Internal Sales-Only Ledger Note (Hidden from Customer)",
        creatorLabel: "Revision Initiator",
        reasonLabel: "Reason for Change",
        priceLabel: "Total Proposal Pricing",
        validityLabel: "Valid Until Date",
        viewStatus: "View Status Tracking",
        appendBtn: "Append New Revision",
        warningExpiredRestore: "Pricing Recalculation Triggered: You are restoring a version older than 60 days. The engine has automatically recalculated baseline copper/steel tariffs & 18% GST rules to prevent stale pricing.",
        toastRestored: "Version restored and propagated as the active, immutable quote draft.",
        toastAppended: "Manual custom version appended to negotiation timeline trail successfully.",
        customerRequest: "Customer Requested Change",
        siteRevisit: "Price Recalculated After Site Revisit",
        manualAdjust: "Manual Sales Adjustment",
        specsSummary: "Elevator Technical Layout Details",
        driveType: "Motor Drive Class",
        floors: "Floors Count",
        cabin: "Cabin Interior Finish",
        speed: "Rated Drive Speed",
        emergency: "Rescue Backup Type",
        warranty: "Warranty Coverage",
        amc: "AMC Protection Service",
        unopened: "Unopened (Awaiting review)",
        opened: "Opened by Customer 👁️",
        bounced: "Bounced (Unreachable inbox)"
      },
      hi: {
        title: "कोटेशन संस्करण इतिहास और ऑडिट",
        subtitle: "पूर्ण कालानुक्रमिक संशोधन इतिहास की समीक्षा करें। विरासत विशिष्टताओं को पुनर्स्थापित करें, अनुबंध अंतर सत्यापित करें, और ट्रैकिंग डेटा का निरीक्षण करें।",
        badgeTitle: "ऑडिट अनुबंध इंजन • मॉड्यूल 7 का 20",
        activeSentBadge: "सक्रिय / भेजा गया",
        supersededBadge: "प्रतिस्थापित",
        restoreBtn: "वर्तमान संस्करण के रूप में पुनर्स्थापित करें",
        diffTitle: "पूर्व संस्करण के विरुद्ध विनिर्देशन अंतर",
        noDiffs: "पूर्व स्थिति की तुलना में इस संस्करण में कोई महत्वपूर्ण मूल्य निर्धारण या विवरण परिवर्तन नहीं पाया गया।",
        diffField: "पैरामीटर नाम",
        diffOld: "पिछली सेटिंग",
        diffNew: "संशोधित सेटिंग",
        internalNote: "आंतरिक बिक्री-केवल लेज़र नोट (ग्राहक से छिपा हुआ)",
        creatorLabel: "संशोधन प्रवर्तक",
        reasonLabel: "बदलाव का कारण",
        priceLabel: "कुल प्रस्ताव मूल्य",
        validityLabel: "वैधता तिथि",
        viewStatus: "स्थिति ट्रैकिंग देखें",
        appendBtn: "नया संशोधन जोड़ें",
        warningExpiredRestore: "मूल्य पुनर्गणना ट्रिगर: आप 60 दिनों से पुराना संस्करण पुनर्स्थापित कर रहे हैं। इंजन ने पुराने मूल्यों को रोकने के लिए बेसलाइन तांबा/इस्पात दरों और 18% जीएसटी नियमों की पुनर्गणना की है।",
        toastRestored: "संस्करण पुनर्स्थापित किया गया और सक्रिय अनुबंध ड्राफ्ट के रूप में लागू किया गया।",
        toastAppended: "मैनुअल संशोधन इतिहास में सफलतापूर्वक जोड़ा गया।",
        customerRequest: "ग्राहक ने बदलाव का अनुरोध किया",
        siteRevisit: "साइट पर दोबारा जाने के बाद मूल्य की पुनर्गणना की गई",
        manualAdjust: "मैनुअल बिक्री समायोजन",
        specsSummary: "लिफ्ट तकनीकी लेआउट विवरण",
        driveType: "मोटर ड्राइव वर्ग",
        floors: "मंजिलों की संख्या",
        cabin: "केबिन आंतरिक फिनिश",
        speed: "रेटेड ड्राइव गति",
        emergency: "बचाव बैकअप प्रकार",
        warranty: "वारंटी कवरेज",
        amc: "एएमसी संरक्षण सेवा",
        unopened: "खोला नहीं गया (समीक्षा लंबित)",
        opened: "ग्राहक द्वारा खोला गया 👁️",
        bounced: "बाउंस हो गया (पहुंच से बाहर इनबॉक्स)"
      },
      mr: {
        title: "कोटेशन आवृत्ती इतिहास आणि ऑडिट",
        subtitle: "संपूर्ण कालानुक्रमिक दुरुस्तीच्या इतिहासाचे पुनरावलोकन करा. जुन्या प्रस्तावाची माहिती पुनर्संचयित करा.",
        badgeTitle: "ऑडिट कॉन्ट्रॅक्ट इंजिन • मॉड्युल ७ ऑफ २०",
        activeSentBadge: "सक्रिय / पाठवले गेले",
        supersededBadge: "बदललेले (Superseded)",
        restoreBtn: "सध्याची आवृत्ती म्हणून लागू करा",
        diffTitle: "मागील आवृत्तीशी तुलना",
        noDiffs: "मागील आवृत्तीच्या तुलनेत या आवृत्तीत कोणताही महत्त्वाचा किंमत किंवा डिझाईन बदल नाही.",
        diffField: "घटकाचे नाव",
        diffOld: "मागील सेटिंग",
        diffNew: "नवीन सेटिंग",
        internalNote: "फक्त अंतर्गत सेल्स कामासाठी नोंद (ग्राहकाला दिसत नाही)",
        creatorLabel: "बदल करणारा प्रतिनिधी",
        reasonLabel: "बदलाचे कारण",
        priceLabel: "एकूण प्रस्ताव मूल्य",
        validityLabel: "अंतिम मुदत तारीख",
        viewStatus: "ग्राहकाने पाहिल्याची स्थिती",
        appendBtn: "नवीन दुरुस्ती जोडा",
        warningExpiredRestore: "किंमत पुनर्गणना ट्रिगर: आपण ६० दिवसांपेक्षा जुनी आवृत्ती लागू करत आहात. सध्याच्या जीएसटी नियमांनुसार किंमतींची स्वयंचलित दुरुस्ती करण्यात आली आहे.",
        toastRestored: "आवृत्ती यशस्वीरित्या पुनर्संचयित करून सक्रिय करण्यात आली आहे.",
        toastAppended: "मॅन्युअल बदल आवृत्ती इतिहासात जोडले गेले आहेत.",
        customerRequest: "ग्राहकाची नवीन बदलाची विनंती",
        siteRevisit: "साइट पुन्हा तपासल्यानंतर किमतीत बदल",
        manualAdjust: "प्रतिनिधीद्वारे मॅन्युअल बदल",
        specsSummary: "लिफ्टचे तांत्रिक लेआउट तपशील",
        driveType: "मोटार ड्राईव्ह प्रकार",
        floors: "मजले",
        cabin: "केबिन इंटीरियर डिझाईन",
        speed: "लिफ्टचा वेग",
        emergency: "आणीबाणी बॅकअप सिस्टीम",
        warranty: "वारंटी कालावधी",
        amc: "AMC मेंटेनन्स प्रकार",
        unopened: "अद्याप उघडले नाही",
        opened: "ग्राहकाने पाहिले आहे 👁️",
        bounced: "ईमेल पोहोचला नाही (Bounced)"
      }
    };
    return translations[language] || translations.en;
  }, [language]);

  const handleRestoreVersion = (version: QuotationVersion) => {
    // Edge case: Restoring very old quote (e.g. baseline v-1 from months back)
    const creationDate = new Date(version.dateCreated);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - creationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 60) {
      setRecalculateAlert(t.warningExpiredRestore);
    } else {
      setRecalculateAlert(null);
    }

    // Set all others to inactive, restore this one
    setVersions(prev => prev.map(v => ({
      ...v,
      isActiveSent: v.id === version.id
    })));

    triggerToast(t.toastRestored);
    if (onSelectActiveVersion) {
      onSelectActiveVersion(version);
    }
  };

  const handleAppendManualVersion = (e: React.FormEvent) => {
    e.preventDefault();
    const nextVerNum = versions.length + 1;
    const newVer: QuotationVersion = {
      id: `v-${nextVerNum}`,
      versionNumber: nextVerNum,
      dateCreated: new Date().toISOString().split('T')[0],
      createdBy: user?.name || 'Authorized Lead Sales Operator',
      creatorRole: 'sales',
      createdReason: newReason,
      finalPriceInclusiveGst: newPrice,
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      viewTrackingStatus: 'unopened',
      isActiveSent: true, // Appending automatically supersedes previous active
      internalOnlyNote: newInternalNote,
      specs: {
        driveType: 'VVVF Geared Traction',
        floors: 4,
        cabinFinish: newCabin,
        speed: '1.0 m/s High Performance',
        emergencyBackup: 'Advanced Voice Assisted Rescue',
        warrantyYears: newWarranty,
        amcTier: 'Quarterly Scheduled Safety AMC'
      }
    };

    // Supersede previous active ones
    setVersions(prev => {
      const updated = prev.map(v => ({ ...v, isActiveSent: false }));
      return [...updated, newVer];
    });

    setSelectedVersionId(newVer.id);
    setShowAddVersion(false);
    triggerToast(t.toastAppended);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Convert versions array to steps for the vertical Ascension Line floor indicator
  const ascensionSteps = useMemo(() => {
    return [...versions].sort((a, b) => b.versionNumber - a.versionNumber).map(v => ({
      id: v.id,
      label: `V${v.versionNumber} - ₹${v.finalPriceInclusiveGst.toLocaleString()}`,
      completed: v.isActiveSent,
      active: v.id === selectedVersionId
    }));
  }, [versions, selectedVersionId]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast Notice banner */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0E4B3D] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Dual Progress indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Auto-Quotation Engine Module Progress (Screen 6 of 10)</span>
            <span>60.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '60%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 66 of 200)</span>
            <span>33.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '33.0%' }} />
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            {t.badgeTitle}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2A2723] tracking-tight mt-1 flex items-center gap-2">
            <History className="w-7 h-7 text-antiquegold" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            onClick={() => setShowAddVersion(!showAddVersion)}
            variant="primary"
            className="text-xs font-bold py-2.5 px-5 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>{t.appendBtn}</span>
          </Button>
        </div>
      </div>

      {/* Recalculation Alert Edge Case Warning banner */}
      {recalculateAlert && (
        <div className="p-4 bg-amber-50 border border-antiquegold/30 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-antiquegold shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">STALE PRICE COMPLIANCE SHIELD</h4>
            <p className="text-[11px] text-warmgray font-semibold leading-relaxed">
              {recalculateAlert}
            </p>
          </div>
        </div>
      )}

      {/* Manual spec entry form panel if toggled */}
      {showAddVersion && (
        <Card className="p-6 bg-white border-2 border-antiquegold space-y-4">
          <div className="border-b border-[#e5dfd4] pb-2">
            <h3 className="font-serif text-sm font-bold text-charcoal flex items-center gap-2">
              <Plus className="w-4 h-4 text-antiquegold" />
              <span>Simulate Appending a Custom Quotation Version</span>
            </h3>
            <p className="text-[10px] text-warmgray">This simulates the automatic system appending a new record without overwriting previous versions destructively.</p>
          </div>

          <form onSubmit={handleAppendManualVersion} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-warmgray font-mono text-[10px] uppercase">Reason for Version Revision</label>
              <select 
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-alabaster border border-[#e5dfd4]"
              >
                <option value="Customer requested change">{t.customerRequest}</option>
                <option value="Price recalculated after site revisit">{t.siteRevisit}</option>
                <option value="Manual sales adjustment for negotiation">{t.manualAdjust}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-warmgray font-mono text-[10px] uppercase">Proposal Pricing (₹ INR)</label>
              <input 
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg bg-alabaster border border-[#e5dfd4]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-warmgray font-mono text-[10px] uppercase">Cabin Material Choice</label>
              <select 
                value={newCabin}
                onChange={(e) => setNewCabin(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-alabaster border border-[#e5dfd4]"
              >
                <option value="Mild Steel Powder Coated (Grey)">Mild Steel Coated (Basic)</option>
                <option value="Brushed Stainless Steel #304">Brushed SS #304 (Premium)</option>
                <option value="Panoramic Toughened Glass + Titanium">Panoramic Titanium (Luxury)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-warmgray font-mono text-[10px] uppercase">Warranty Extension Years</label>
              <input 
                type="number"
                min="1"
                max="5"
                value={newWarranty}
                onChange={(e) => setNewWarranty(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-lg bg-alabaster border border-[#e5dfd4]"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-warmgray font-mono text-[10px] uppercase">Internal Ledger Note (Hidden from Customer)</label>
              <input 
                type="text"
                value={newInternalNote}
                onChange={(e) => setNewInternalNote(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-alabaster border border-[#e5dfd4]"
                placeholder="Audit notes..."
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddVersion(false)}
                className="text-xs py-2 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="emerald"
                className="text-xs py-2 px-4"
              >
                Save Revision Record
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand: Chronological Ascension Line Timeline list (interactive) */}
        <div className="lg:col-span-4 space-y-4">
          
          <Card className="p-4 bg-white">
            <div className="flex justify-between items-center border-b border-[#e5dfd4] pb-3 mb-4">
              <div>
                <h3 className="font-serif text-sm font-bold text-charcoal">Revision Chronology</h3>
                <p className="text-[9px] text-warmgray font-semibold">Select version below to inspect diffs & details.</p>
              </div>
              <button 
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 hover:bg-alabaster rounded"
              >
                {collapsed ? <ChevronDown className="w-4 h-4 text-warmgray" /> : <ChevronUp className="w-4 h-4 text-warmgray" />}
              </button>
            </div>

            {!collapsed && (
              <div className="space-y-3 relative pl-4 border-l border-antiquegold/30 py-2">
                
                {versions.map((ver) => {
                  const isSelected = ver.id === selectedVersionId;
                  return (
                    <div 
                      key={ver.id}
                      onClick={() => setSelectedVersionId(ver.id)}
                      className={`relative cursor-pointer p-3 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-alabaster border-antiquegold shadow-sm' 
                          : 'bg-white border-[#e5dfd4]/60 hover:bg-neutral-50'
                      }`}
                    >
                      {/* Ascension indicator marker */}
                      <div className={`absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full border ${
                        ver.isActiveSent 
                          ? 'bg-royalemerald border-royalemerald ring-4 ring-emerald-100' 
                          : 'bg-white border-antiquegold'
                      }`} />

                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] font-black text-charcoal">
                          VERSION {ver.versionNumber}
                        </span>
                        {ver.isActiveSent ? (
                          <span className="bg-emerald-50 text-royalemerald text-[8px] uppercase tracking-wider font-mono font-extrabold px-1.5 py-0.5 rounded border border-royalemerald/15">
                            {t.activeSentBadge}
                          </span>
                        ) : (
                          <span className="bg-neutral-100 text-warmgray text-[8px] uppercase tracking-wider font-mono font-extrabold px-1.5 py-0.5 rounded">
                            {t.supersededBadge}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex justify-between items-baseline">
                        <span className="font-serif text-sm font-black text-charcoal">
                          ₹{ver.finalPriceInclusiveGst.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-warmgray font-mono">{ver.dateCreated}</span>
                      </div>

                      <p className="text-[9px] text-warmgray font-semibold mt-1 leading-snug line-clamp-1">
                        {ver.createdReason}
                      </p>
                    </div>
                  );
                })}

              </div>
            )}
          </Card>

          {/* Quick Stats Summary */}
          <Card className="p-4 bg-alabaster/40 border border-[#e5dfd4]/40 space-y-3">
            <h4 className="font-serif text-xs font-bold text-charcoal">Negotiation Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-[#e5dfd4]/40">
                <span className="text-[8px] font-mono text-warmgray uppercase block">Initial Draft</span>
                <span className="font-serif font-black text-charcoal block">₹1,045,000</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#e5dfd4]/40">
                <span className="text-[8px] font-mono text-warmgray uppercase block">Active Rate</span>
                <span className="font-serif font-black text-charcoal block">₹{versions.find(v => v.isActiveSent)?.finalPriceInclusiveGst.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-[10px] font-semibold text-warmgray flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-antiquegold" />
              <span>Full immutable trail of 4 revisions preserved successfully.</span>
            </div>
          </Card>

        </div>

        {/* Right Hand: Detailed view of selected version and Diffs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section: Main details of selected */}
          <Card className="p-6 bg-white space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#e5dfd4] pb-4 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg font-black text-charcoal">
                    Quotation Version V{selectedVersion.versionNumber} Detailed Blueprint
                  </span>
                  {selectedVersion.isActiveSent ? (
                    <Badge status="active" />
                  ) : (
                    <Badge status="inactive" />
                  )}
                </div>
                <p className="text-[10px] text-warmgray font-semibold">Created on {selectedVersion.dateCreated} by {selectedVersion.createdBy} ({selectedVersion.creatorRole.toUpperCase()})</p>
              </div>

              {!selectedVersion.isActiveSent && (
                <Button
                  onClick={() => handleRestoreVersion(selectedVersion)}
                  variant="outline"
                  className="text-xs font-bold py-1.5 px-4 h-9"
                >
                  <RefreshCw className="w-4 h-4 text-antiquegold animate-pulse" />
                  <span>{t.restoreBtn}</span>
                </Button>
              )}
            </div>

            {/* Core Stats overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-4 bg-alabaster rounded-2xl border border-[#e5dfd4]/40">
                <span className="text-[9px] font-mono text-warmgray uppercase block">{t.priceLabel}</span>
                <span className="font-serif text-xl font-black text-charcoal mt-1 block">
                  ₹{selectedVersion.finalPriceInclusiveGst.toLocaleString()}
                </span>
                <span className="text-[9px] text-royalemerald font-bold mt-0.5 block">18% GST fully inclusive</span>
              </div>

              <div className="p-4 bg-alabaster rounded-2xl border border-[#e5dfd4]/40">
                <span className="text-[9px] font-mono text-warmgray uppercase block">{t.validityLabel}</span>
                <span className="font-serif text-base font-bold text-charcoal mt-1 block flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-antiquegold" />
                  <span>{selectedVersion.validityDate}</span>
                </span>
                <span className="text-[9px] text-warmgray font-semibold mt-0.5 block">30 days from creation draft</span>
              </div>

              <div className="p-4 bg-alabaster rounded-2xl border border-[#e5dfd4]/40">
                <span className="text-[9px] font-mono text-warmgray uppercase block">{t.viewStatus}</span>
                <span className="font-mono text-xs font-bold text-charcoal mt-1 block flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-royalemerald" />
                  <span>
                    {selectedVersion.viewTrackingStatus === 'opened' ? t.opened : selectedVersion.viewTrackingStatus === 'unopened' ? t.unopened : t.bounced}
                  </span>
                </span>
                <span className="text-[9px] text-warmgray font-semibold mt-0.5 block">Monitored by tracking tags</span>
              </div>

            </div>

            {/* Speicifcation Details breakdown */}
            <div className="space-y-3">
              <h4 className="font-serif text-xs font-extrabold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-antiquegold" />
                <span>{t.specsSummary}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                <div className="flex justify-between items-center py-2 px-3 bg-alabaster/40 rounded-lg">
                  <span className="text-warmgray font-medium">{t.driveType}</span>
                  <span className="font-bold text-charcoal">{selectedVersion.specs.driveType}</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-alabaster/40 rounded-lg">
                  <span className="text-warmgray font-medium">{t.floors}</span>
                  <span className="font-bold text-charcoal">{selectedVersion.specs.floors} Floors</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-alabaster/40 rounded-lg">
                  <span className="text-warmgray font-medium">{t.cabin}</span>
                  <span className="font-bold text-charcoal">{selectedVersion.specs.cabinFinish}</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-alabaster/40 rounded-lg">
                  <span className="text-warmgray font-medium">{t.speed}</span>
                  <span className="font-bold text-charcoal">{selectedVersion.specs.speed}</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-alabaster/40 rounded-lg">
                  <span className="text-warmgray font-medium">{t.emergency}</span>
                  <span className="font-bold text-charcoal">{selectedVersion.specs.emergencyBackup}</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-alabaster/40 rounded-lg">
                  <span className="text-warmgray font-medium">{t.warranty}</span>
                  <span className="font-bold text-charcoal">{selectedVersion.specs.warrantyYears} Years Extended Warranty</span>
                </div>

              </div>
            </div>

            {/* Spec Diffs Box */}
            <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-3">
              <h4 className="font-serif text-xs font-extrabold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4 text-antiquegold" />
                <span>{t.diffTitle}</span>
              </h4>

              {selectedDiff && selectedDiff.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-[#e5dfd4] pb-2 text-[9px] font-mono text-warmgray uppercase">
                        <th className="py-2">{t.diffField}</th>
                        <th className="py-2">{t.diffOld}</th>
                        <th className="py-2">{t.diffNew}</th>
                      </tr>
                    </thead>
                    <tbody className="text-charcoal divide-y divide-[#e5dfd4]/30">
                      {selectedDiff.map((d, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50">
                          <td className="py-2.5 font-bold">{d.field}</td>
                          <td className="py-2.5 text-error line-through">{d.prevVal}</td>
                          <td className="py-2.5 text-success font-black">{d.newVal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[11px] text-warmgray font-medium italic leading-relaxed py-1">
                  {t.noDiffs}
                </p>
              )}
            </div>

            {/* Internal Ledgers */}
            <div className="p-4 bg-[#B8873D]/5 border border-antiquegold/25 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-antiquegold uppercase tracking-wide">
                <Info className="w-4 h-4 text-antiquegold" />
                <span>{t.internalNote}</span>
              </div>
              <p className="text-xs text-charcoal font-semibold italic">
                "{selectedVersion.internalOnlyNote}"
              </p>
            </div>

            {/* Audit reason & Communication log back-link */}
            <div className="border-t border-[#e5dfd4] pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-warmgray uppercase block">{t.reasonLabel}</span>
                <p className="text-charcoal">{selectedVersion.createdReason}</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => triggerToast("Redirecting to corresponding transactional WhatsApp / SMS communication delivery logs...")}
                  className="px-3.5 py-2 bg-alabaster border border-[#e5dfd4] rounded-lg text-warmgray hover:text-charcoal flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider"
                >
                  <MessageSquare className="w-4 h-4 text-antiquegold" />
                  <span>Comm Logs</span>
                </button>
              </div>
            </div>

          </Card>

        </div>

      </div>

    </div>
  );
};
