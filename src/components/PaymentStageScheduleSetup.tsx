import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Shield,
  FileText,
  Plus,
  Trash2,
  Sliders,
  DollarSign,
  ArrowRight,
  Eye,
  Edit3,
  RefreshCw,
  Clock,
  Landmark,
  Building,
  Check,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Split,
  Download,
  Send,
  Lock,
  Layers
} from 'lucide-react';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';
import { DbManager } from '../lib/db';
import { User, Deal, Payment } from '../types';

interface PaymentStageScheduleSetupProps {
  user: User;
  onNavigateToReminders?: () => void;
  onNavigateToEscalations?: () => void;
}

export interface PaymentStageItem {
  id: string;
  sequenceOrder: number;
  stageName: string;
  percentage: number;
  amount: number;
  dueTrigger:
    | 'contract_signing'
    | 'material_dispatch'
    | 'scaffolding_ready'
    | 'erection_completion'
    | 'electrical_hookup'
    | 'license_handover'
    | 'fixed_date';
  offsetDays: number;
  estimatedDueDate: string;
  fixedDate?: string;
  status: 'unpaid' | 'pending' | 'paid';
  paidAt?: string;
  receiptNo?: string;
  notes?: string;
}

// Translations
const localizations = {
  en: {
    title: "Payment Stage Schedule Setup",
    subtitle: "Configure and lock stage-wise billing triggers, milestone dependencies, and payment amounts for automated invoicing & overdue escalations.",
    selectDealLabel: "Active Deal Context",
    lockedDealTerms: "Locked in Deal Terms Finalization",
    agreedPrice: "Total Agreed Deal Value",
    presetsTitle: "Standard Schedule Presets",
    presetStandard: "4-Stage Standard (30/40/20/10)",
    presetCommercial: "3-Stage Express (40/50/10)",
    presetHighRise: "5-Stage High-Rise (20/30/25/15/10)",
    presetCustom: "Custom Milestone Structure",
    presetBG: "Bank Guarantee (BG/LC) Commercial",
    reconciliationTitle: "Schedule Reconciliation Engine",
    reconciledStatus: "RECONCILED — Exact Match (100.0%)",
    unreconciledStatus: "UNRECONCILED — Amount Mismatch",
    autoBalanceBtn: "Auto-Balance Last Stage",
    tabSetup: "Schedule Setup & Rules",
    tabPreview: "Customer Portal Preview",
    stageSequence: "Sequence",
    stageName: "Stage Name & Description",
    stageWeight: "Weight (%)",
    stageAmountLabel: "Amount (₹)",
    triggerLabel: "Milestone Trigger",
    offsetDaysLabel: "Offset (Days)",
    dueDateLabel: "Calculated Due Date",
    actions: "Actions",
    addStageBtn: "Add Payment Stage",
    splitStageBtn: "Split Stage",
    deleteStageBtn: "Remove Stage",
    simTitle: "Milestone Shift Auto-Simulator",
    simDesc: "Test how milestone delays automatically adjust payment due dates without triggering false overdue flags.",
    bgToggleTitle: "Bank Guarantee / Letter of Credit (LC) Option",
    bgDesc: "Flag schedule for Admin Direct Oversight for large commercial / infrastructure projects.",
    bgBankName: "Issuing Bank Name",
    bgRefNo: "BG / LC Reference Number",
    bgAmount: "Security Guarantee Value (₹)",
    bgExpiry: "Guarantee Expiry Date",
    activateBtn: "Activate & Sync Payment Engine",
    saveDraftBtn: "Save Working Draft",
    resetBtn: "Reset to Deal Default",
    draftSavedMsg: "Draft saved locally",
    activatedSuccessMsg: "Payment Stage Schedule Activated! Automated Payment Reminder Engine & Overdue Escalation Desk are now synced.",
    customerPreviewHeader: "Payment Schedule & Milestone Timeline",
    customerPreviewSubtitle: "Transparent milestone-linked payment terms as visible in customer mobile portal.",
    triggerSign: "Immediate on Contract Signing",
    triggerMaterial: "On Material Dispatch & Site Arrival",
    triggerScaffold: "On Shaft Scaffolding & Site Clearance",
    triggerErection: "On Mechanical Rail & Machine Erection",
    triggerElectrical: "On Controller Wiring & Motor Test",
    triggerLicense: "On PWD Safety License & Handover",
    triggerFixed: "Fixed Calendar Date",
    payNowBtn: "Pay Now via UPI / NEFT",
    downloadPDF: "Download Payment Schedule PDF"
  },
  hi: {
    title: "भुगतान चरण अनुसूची सेटअप",
    subtitle: "स्वचालित चालान और अतिदेय वृद्धि के लिए चरण-वार बिलिंग ट्रिगर, मील का पत्थर निर्भरता और भुगतान राशि कॉन्फ़िगर करें।",
    selectDealLabel: "सक्रिय सौदा संदर्भ",
    lockedDealTerms: "सौदा शर्तों में लॉक किया गया",
    agreedPrice: "कुल सहमत सौदा मूल्य",
    presetsTitle: "मानक अनुसूची प्रीसेट",
    presetStandard: "4-चरण मानक (30/40/20/10)",
    presetCommercial: "3-चरण एक्सप्रेस (40/50/10)",
    presetHighRise: "5-चरण हाई-राइज (20/30/25/15/10)",
    presetCustom: "कस्टम मील का पत्थर संरचना",
    presetBG: "बैंक गारंटी (BG/LC) वाणिज्यिक",
    reconciliationTitle: "अनुसूची समाधान इंजन",
    reconciledStatus: "समाधान किया गया — सटीक मिलान (100.0%)",
    unreconciledStatus: "असंतुलित — राशि बेमेल",
    autoBalanceBtn: "अंतिम चरण ऑटो-बैलेंस करें",
    tabSetup: "अनुसूची सेटअप और नियम",
    tabPreview: "ग्राहक पोर्टल पूर्वावलोकन",
    stageSequence: "अनुक्रम",
    stageName: "चरण का नाम और विवरण",
    stageWeight: "भार (%)",
    stageAmountLabel: "राशि (₹)",
    triggerLabel: "मील का पत्थर ट्रिगर",
    offsetDaysLabel: "ऑफ़सेट (दिन)",
    dueDateLabel: "गणित नियत तिथि",
    actions: "कार्रवाई",
    addStageBtn: "भुगतान चरण जोड़ें",
    splitStageBtn: "चरण विभाजित करें",
    deleteStageBtn: "चरण हटाएं",
    simTitle: "मील का पत्थर बदलाव सिम्युलेटर",
    simDesc: "परीक्षण करें कि कैसे मील का पत्थर विलंब स्वचालित रूप से भुगतान नियत तिथियों को समायोजित करते हैं।",
    bgToggleTitle: "बैंक गारंटी / साख पत्र (LC) विकल्प",
    bgDesc: "बड़ी वाणिज्यिक परियोजनाओं के लिए व्यवस्थापक प्रत्यक्ष निगरानी ध्वज।",
    bgBankName: "जारीकर्ता बैंक का नाम",
    bgRefNo: "बीजी/एलसी संदर्भ संख्या",
    bgAmount: "सुरक्षा गारंटी मूल्य (₹)",
    bgExpiry: "गारंटी समाप्ति तिथि",
    activateBtn: "सक्रिय करें और सिंक करें",
    saveDraftBtn: "ड्राफ्ट सहेजें",
    resetBtn: "रीसेट करें",
    draftSavedMsg: "ड्राफ्ट स्थानीय रूप से सहेजा गया",
    activatedSuccessMsg: "भुगतान अनुसूची सक्रिय! स्वचालित अनुस्मारक इंजन और अतिदेय डेस्क सिंक हो गए हैं।",
    customerPreviewHeader: "भुगतान अनुसूची और मील का पत्थर समयरेखा",
    customerPreviewSubtitle: "ग्राहक मोबाइल पोर्टल में दिखाई देने वाली पारदर्शी मील का पत्थर-जुड़ी शर्तें।",
    triggerSign: "अनुबंध हस्ताक्षर पर तुरंत",
    triggerMaterial: "सामग्री प्रेषण और साइट पर आगमन पर",
    triggerScaffold: "शाफ्ट पाड़ और साइट निकासी पर",
    triggerErection: "यांत्रिक रेल और मशीन निर्माण पर",
    triggerElectrical: "नियंत्रक वायरिंग और मोटर परीक्षण पर",
    triggerLicense: "पीडब्ल्यूडी सुरक्षा लाइसेंस और सौंपने पर",
    triggerFixed: "निश्चित कैलेंडर तिथि",
    payNowBtn: "यूपीआई / एनईएफटी के माध्यम से भुगतान करें",
    downloadPDF: "अनुसूची पीडीएफ डाउनलोड करें"
  },
  mr: {
    title: "पेमेंट टप्पे वेळापत्रक सेटअप",
    subtitle: "स्वयंचलित इनव्हॉइस आणि थकीत वाढीसाठी टप्प्यानुसार बिलिंग ट्रिगर्स, मायलस्टोन अवलंबित्व आणि पेमेंट रक्कमेची रचना करा.",
    selectDealLabel: "सक्रिय करार संदर्भ",
    lockedDealTerms: "करार अटींमध्ये निश्चित केले गेले",
    agreedPrice: "एकूण मान्य करार मूल्य",
    presetsTitle: "मानक वेळापत्रक प्रीसेट",
    presetStandard: "४-टप्पा मानक (३०/४०/२०/१०)",
    presetCommercial: "३-टप्पा एक्सप्रेस (४०/५०/१०)",
    presetHighRise: "५-टप्पा हाय-राइज (२०/३०/२५/१५/१०)",
    presetCustom: "कस्टम मायलस्टोन रचना",
    presetBG: "बँक गॅरंटी (BG/LC) कमर्शियल",
    reconciliationTitle: "वेळापत्रक मेळ इंजिन",
    reconciledStatus: "मेळ बसला — तंतोतंत जुळणी (१००.०%)",
    unreconciledStatus: "असंतुलित — रकमेचा फरक",
    autoBalanceBtn: "शेवटचा टप्पा ऑटो-बॅलन्स करा",
    tabSetup: "वेळापत्रक रचना आणि नियम",
    tabPreview: "ग्राहक पोर्टल पूर्वावलोकन",
    stageSequence: "अनुक्रम",
    stageName: "टप्प्याचे नाव व तपशील",
    stageWeight: "भार (%)",
    stageAmountLabel: "रक्कम (₹)",
    triggerLabel: "मायलस्टोन ट्रिगर",
    offsetDaysLabel: "कालावधी फरक (दिवस)",
    dueDateLabel: "अंदाजित देय तारीख",
    actions: "कृती",
    addStageBtn: "पेमेंट टप्पा जोडा",
    splitStageBtn: "टप्पा विभाजित करा",
    deleteStageBtn: "टप्पा काढून टाका",
    simTitle: "मायलस्टोन शिफ्ट सिम्युलेटर",
    simDesc: "मायलस्टोन उशिरा झाल्यास पेमेंट देय तारखा कशा स्वयंचलितपणे बदलतात ते तपासा.",
    bgToggleTitle: "बँक गॅरंटी / एलसी पर्याय",
    bgDesc: "मोठ्या व्यावसायिक प्रकल्पांसाठी ॲडमिन थेट देखरेख ध्वज.",
    bgBankName: "बँकेचे नाव",
    bgRefNo: "BG/LC संदर्भ क्रमांक",
    bgAmount: "सुरक्षा गॅरंटी मूल्य (₹)",
    bgExpiry: "गॅरंटी मुदत संपण्याची तारीख",
    activateBtn: "सक्रिय आणि सिंक करा",
    saveDraftBtn: "मसुदा जतन करा",
    resetBtn: "रीसेट करा",
    draftSavedMsg: "मसुदा स्थानिकरित्या जतन केला",
    activatedSuccessMsg: "पेमेंट वेळापत्रक सक्रिय! स्वयंचलित रिमायंडर इंजिन आणि थकीत डेस्क सिंक झाले आहेत.",
    customerPreviewHeader: "पेमेंट वेळापत्रक आणि टप्पे समयरेखा",
    customerPreviewSubtitle: "ग्राहक मोबाईल पोर्टलवर दिसणाऱ्या पारदर्शक अटी.",
    triggerSign: "करार स्वाक्षरीवर त्वरित",
    triggerMaterial: "साहित्य डिस्पॅच व साइटवर पोहोचल्यावर",
    triggerScaffold: "शाफ्ट उभारणी व साइट मोकळी झाल्यावर",
    triggerErection: "यांत्रिक उभारणी पूर्ण झाल्यावर",
    triggerElectrical: "इलेक्ट्रिकल वायरिंग व मोटर चाचणीवर",
    triggerLicense: "परवाना व अंतिम हस्तांतरणावर",
    triggerFixed: "निश्चित तारीख",
    payNowBtn: "UPI / NEFT द्वारे भरा",
    downloadPDF: "वेळापत्रक PDF डाउनलोड करा"
  }
};

interface PresetScheduleItem {
  name: string;
  pct: number;
  trigger: PaymentStageItem['dueTrigger'];
  offset: number;
}

// Preset schedules
const PRESET_SCHEDULES: Record<'standard4' | 'commercial3' | 'highrise5', PresetScheduleItem[]> = {
  standard4: [
    { name: 'Booking Advance Payment', pct: 30, trigger: 'contract_signing', offset: 0 },
    { name: 'Material Order & Dispatch Payment', pct: 40, trigger: 'material_dispatch', offset: 0 },
    { name: 'Pre-Installation / Mechanical Erection', pct: 20, trigger: 'erection_completion', offset: 0 },
    { name: 'Final Handover & PWD Safety License', pct: 10, trigger: 'license_handover', offset: 0 }
  ],
  commercial3: [
    { name: 'Initial Contract Advance', pct: 40, trigger: 'contract_signing', offset: 0 },
    { name: 'Equipment Delivery & Mechanical Erection', pct: 50, trigger: 'material_dispatch', offset: 7 },
    { name: 'Final Safety Certification & Commissioning', pct: 10, trigger: 'license_handover', offset: 0 }
  ],
  highrise5: [
    { name: 'Booking & Engineering Advance', pct: 20, trigger: 'contract_signing', offset: 0 },
    { name: 'Material Order & Factory Dispatch', pct: 30, trigger: 'material_dispatch', offset: 0 },
    { name: 'Scaffolding & Guide Rail Erection', pct: 25, trigger: 'erection_completion', offset: 0 },
    { name: 'Cabin Assembly & Controller Wiring', pct: 15, trigger: 'electrical_hookup', offset: 0 },
    { name: 'Final Handover & Statutory Safety Clearance', pct: 10, trigger: 'license_handover', offset: 0 }
  ]
};

export const PaymentStageScheduleSetup: React.FC<PaymentStageScheduleSetupProps> = ({
  user,
  onNavigateToReminders,
  onNavigateToEscalations
}) => {
  const { language } = useLanguage();
  const t = localizations[language as keyof typeof localizations] || localizations.en;

  // Loaded deals from DB
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string>('deal_1');
  const [activeTab, setActiveTab] = useState<'setup' | 'preview'>('setup');

  // Deal context data
  const activeDeal = useMemo(() => {
    return deals.find(d => d.id === selectedDealId) || deals[0] || {
      id: 'deal_1',
      leadId: 'lead_3',
      status: 'closed',
      agreedPrice: 1250000,
      advancePaid: true,
      specs: {
        floors: 8,
        driveType: 'Gearless Traction',
        capacity: '8 Persons (544 kg)',
        cabinStyle: 'Premium Stainless Steel (Hairline Finish)'
      },
      createdAt: '2026-06-28T17:00:00Z'
    };
  }, [deals, selectedDealId]);

  const agreedPrice = activeDeal.agreedPrice || 1250000;

  // Stages State
  const [stages, setStages] = useState<PaymentStageItem[]>([]);
  const [presetType, setPresetType] = useState<'standard4' | 'commercial3' | 'highrise5' | 'custom' | 'bg'>('standard4');

  // Bank Guarantee state
  const [bgRequired, setBgRequired] = useState(false);
  const [bgBankName, setBgBankName] = useState('State Bank of India (Commercial Branch Pune)');
  const [bgRefNo, setBgRefNo] = useState('SBI-BG-2026-99411');
  const [bgAmount, setBgAmount] = useState(375000);
  const [bgExpiry, setBgExpiry] = useState('2027-06-30');

  // Milestone Delay Simulator State
  const [simulatedMaterialShift, setSimulatedMaterialShift] = useState(0);

  // Status & Feedback
  const [isActivated, setIsActivated] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Load initial deals & existing schedule
  useEffect(() => {
    const loadedDeals = DbManager.getDeals();
    if (loadedDeals && loadedDeals.length > 0) {
      setDeals(loadedDeals);
    } else {
      setDeals([
        {
          id: 'deal_1',
          leadId: 'lead_3',
          status: 'closed',
          agreedPrice: 1250000,
          advancePaid: true,
          specs: {
            floors: 8,
            driveType: 'Gearless Traction',
            capacity: '8 Persons (544 kg)',
            cabinStyle: 'Premium Stainless Steel (Hairline Finish)'
          },
          createdAt: '2026-06-28T17:00:00Z'
        }
      ]);
    }
  }, []);

  // Helper to calculate target due date based on trigger & offset
  const calculateDueDate = (trigger: PaymentStageItem['dueTrigger'], offset: number, index: number): string => {
    const baseDate = new Date();
    // Default staggered base offsets for simulation
    let daysToAdd = index * 14 + offset;

    if (trigger === 'contract_signing') daysToAdd = offset;
    if (trigger === 'material_dispatch') daysToAdd = 15 + offset + simulatedMaterialShift;
    if (trigger === 'scaffolding_ready') daysToAdd = 25 + offset;
    if (trigger === 'erection_completion') daysToAdd = 40 + offset + (simulatedMaterialShift > 0 ? simulatedMaterialShift : 0);
    if (trigger === 'electrical_hookup') daysToAdd = 55 + offset;
    if (trigger === 'license_handover') daysToAdd = 70 + offset + (simulatedMaterialShift > 0 ? simulatedMaterialShift : 0);

    baseDate.setDate(baseDate.getDate() + daysToAdd);
    return baseDate.toISOString().split('T')[0];
  };

  // Populate schedule from preset or saved DB payments
  const applyPreset = (type: 'standard4' | 'commercial3' | 'highrise5' | 'custom' | 'bg') => {
    setPresetType(type);
    if (type === 'bg') {
      setBgRequired(true);
    } else {
      setBgRequired(false);
    }

    let presetData = PRESET_SCHEDULES.standard4;
    if (type === 'commercial3') presetData = PRESET_SCHEDULES.commercial3;
    if (type === 'highrise5') presetData = PRESET_SCHEDULES.highrise5;

    const total = agreedPrice;
    const newStages: PaymentStageItem[] = presetData.map((p, idx) => {
      const amt = Math.round((total * p.pct) / 100);
      return {
        id: `stage_${idx + 1}_${Date.now()}`,
        sequenceOrder: idx + 1,
        stageName: p.name,
        percentage: p.pct,
        amount: amt,
        dueTrigger: p.trigger,
        offsetDays: p.offset,
        estimatedDueDate: calculateDueDate(p.trigger, p.offset, idx),
        status: idx === 0 ? 'paid' : idx === 1 ? 'pending' : 'unpaid',
        paidAt: idx === 0 ? '2026-06-29' : undefined,
        receiptNo: idx === 0 ? 'AIEC-REC-2026-081' : undefined
      };
    });

    setStages(newStages);
  };

  // Initialize stages when deal or preset changes
  useEffect(() => {
    // Check if there are existing payments in DbManager for this deal
    const existingPayments = DbManager.getPayments().filter(p => p.dealId === selectedDealId);
    if (existingPayments.length > 0) {
      const mapped: PaymentStageItem[] = existingPayments.map((p, idx) => {
        let pct = 25;
        if (p.stage.includes('30%')) pct = 30;
        else if (p.stage.includes('40%')) pct = 40;
        else if (p.stage.includes('20%')) pct = 20;
        else if (p.stage.includes('10%')) pct = 10;
        else pct = Math.round((p.amount / agreedPrice) * 100);

        return {
          id: p.id || `stage_${idx + 1}`,
          sequenceOrder: idx + 1,
          stageName: p.stage,
          percentage: pct,
          amount: p.amount,
          dueTrigger: idx === 0 ? 'contract_signing' : idx === 1 ? 'material_dispatch' : idx === 2 ? 'erection_completion' : 'license_handover',
          offsetDays: 0,
          estimatedDueDate: p.dueDate || calculateDueDate('contract_signing', 0, idx),
          status: p.status === 'paid' ? 'paid' : p.status === 'pending' ? 'pending' : 'unpaid',
          paidAt: p.paidAt,
          receiptNo: p.paidAt ? `AIEC-REC-2026-08${idx + 1}` : undefined
        };
      });
      setStages(mapped);
    } else {
      applyPreset('standard4');
    }
  }, [selectedDealId, agreedPrice]);

  // Total Reconciliation Calculations
  const sumAmount = useMemo(() => {
    return stages.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [stages]);

  const sumPercentage = useMemo(() => {
    return stages.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);
  }, [stages]);

  const amountDiff = agreedPrice - sumAmount;
  const isReconciled = Math.abs(amountDiff) < 1;

  // Auto-Balance Last Stage
  const handleAutoBalance = () => {
    if (stages.length === 0) return;
    const updated = [...stages];
    const lastIdx = updated.length - 1;
    
    // Sum of all except last
    const sumExceptLast = updated.slice(0, lastIdx).reduce((acc, s) => acc + s.amount, 0);
    const newLastAmount = agreedPrice - sumExceptLast;
    const newLastPct = Math.round(((newLastAmount / agreedPrice) * 100) * 100) / 100;

    updated[lastIdx] = {
      ...updated[lastIdx],
      amount: newLastAmount,
      percentage: newLastPct
    };

    setStages(updated);
    showToast('Auto-balanced last stage to match total deal price.');
  };

  // Stage Property Update Handlers
  const handleStageChange = (id: string, field: keyof PaymentStageItem, value: any) => {
    setStages(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        const updated = { ...s, [field]: value };

        // Auto calculate percentage if amount changes
        if (field === 'amount') {
          const numAmt = Number(value) || 0;
          updated.percentage = Math.round(((numAmt / agreedPrice) * 100) * 100) / 100;
        }

        // Auto calculate amount if percentage changes
        if (field === 'percentage') {
          const numPct = Number(value) || 0;
          updated.amount = Math.round((agreedPrice * numPct) / 100);
        }

        // Recalculate estimated due date if trigger or offset changes
        if (field === 'dueTrigger' || field === 'offsetDays') {
          updated.estimatedDueDate = calculateDueDate(
            field === 'dueTrigger' ? value : s.dueTrigger,
            field === 'offsetDays' ? Number(value) : s.offsetDays,
            s.sequenceOrder - 1
          );
        }

        return updated;
      })
    );
  };

  // Add Custom Stage
  const handleAddStage = () => {
    const nextSeq = stages.length + 1;
    const defaultPct = 10;
    const defaultAmt = Math.round((agreedPrice * defaultPct) / 100);

    const newStage: PaymentStageItem = {
      id: `stage_custom_${Date.now()}`,
      sequenceOrder: nextSeq,
      stageName: `Custom Milestone Stage #${nextSeq}`,
      percentage: defaultPct,
      amount: defaultAmt,
      dueTrigger: 'erection_completion',
      offsetDays: 0,
      estimatedDueDate: calculateDueDate('erection_completion', 0, nextSeq - 1),
      status: 'unpaid'
    };

    setStages([...stages, newStage]);
  };

  // Split Stage
  const handleSplitStage = (id: string) => {
    const targetIdx = stages.findIndex(s => s.id === id);
    if (targetIdx === -1) return;

    const target = stages[targetIdx];
    const halfPct = Math.round((target.percentage / 2) * 10) / 10;
    const halfAmt = Math.round(target.amount / 2);

    const splitA: PaymentStageItem = {
      ...target,
      stageName: `${target.stageName} (Part A)`,
      percentage: halfPct,
      amount: halfAmt
    };

    const splitB: PaymentStageItem = {
      id: `stage_split_${Date.now()}`,
      sequenceOrder: target.sequenceOrder + 1,
      stageName: `${target.stageName} (Part B)`,
      percentage: Math.round((target.percentage - halfPct) * 10) / 10,
      amount: target.amount - halfAmt,
      dueTrigger: target.dueTrigger,
      offsetDays: target.offsetDays + 14,
      estimatedDueDate: calculateDueDate(target.dueTrigger, target.offsetDays + 14, targetIdx + 1),
      status: 'unpaid'
    };

    const newStages = [...stages];
    newStages.splice(targetIdx, 1, splitA, splitB);
    
    // Re-index sequence orders
    const reindexed = newStages.map((s, idx) => ({
      ...s,
      sequenceOrder: idx + 1
    }));

    setStages(reindexed);
    showToast(`Split stage into 2 equal milestone parts.`);
  };

  // Delete Stage
  const handleDeleteStage = (id: string) => {
    if (stages.length <= 1) {
      showToast('At least 1 payment stage is required in the schedule.');
      return;
    }
    const filtered = stages.filter(s => s.id !== id);
    const reindexed = filtered.map((s, idx) => ({
      ...s,
      sequenceOrder: idx + 1
    }));
    setStages(reindexed);
  };

  // Save Working Draft
  const handleSaveDraft = () => {
    localStorage.setItem(`aiec_payment_schedule_draft_${selectedDealId}`, JSON.stringify({
      stages,
      bgRequired,
      bgBankName,
      bgRefNo,
      bgAmount,
      bgExpiry,
      timestamp: new Date().toISOString()
    }));
    showToast(t.draftSavedMsg);
  };

  // Activate & Sync Payment Engine
  const handleActivateSchedule = () => {
    if (!isReconciled) {
      showToast('Cannot activate schedule: total stage amounts must equal total agreed deal price!');
      return;
    }

    // Save to DbManager payments array
    stages.forEach(s => {
      const paymentObj: Payment = {
        id: s.id,
        dealId: selectedDealId,
        stage: s.stageName as any,
        amount: s.amount,
        status: s.status,
        dueDate: s.estimatedDueDate,
        paidAt: s.paidAt
      };
      DbManager.updatePayment(paymentObj);
    });

    setIsActivated(true);
    showToast(t.activatedSuccessMsg);
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 4000);
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Toast Alert */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#0E4B3D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400/30 text-xs font-bold"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Title & Role Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[rgba(184,135,61,0.15)] shadow-diffuse">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-antiquegold/10 text-antiquegold border border-antiquegold/20">
              MODULE 9 • PAYMENTS & FINANCING
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-royalemerald/10 text-royalemerald border border-royalemerald/20">
              ROLE: ADMIN / SALES
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
            <Landmark className="w-6 h-6 text-antiquegold shrink-0" />
            {t.title}
          </h1>
          <p className="text-xs text-warmgray max-w-3xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* View Tab Switcher */}
        <div className="flex items-center gap-1 bg-alabaster p-1.5 rounded-2xl border border-[rgba(184,135,61,0.15)] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'setup'
                ? 'bg-royalemerald text-white shadow-xs'
                : 'text-warmgray hover:text-charcoal'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.tabSetup}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'bg-royalemerald text-white shadow-xs'
                : 'text-warmgray hover:text-charcoal'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.tabPreview}</span>
          </button>
        </div>
      </div>

      {/* Active Deal Context Card */}
      <Card className="p-5 md:p-6 space-y-4 border-l-4 border-l-antiquegold">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e6dfd4] pb-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase font-extrabold text-antiquegold tracking-widest block">
              {t.selectDealLabel}
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedDealId}
                onChange={e => setSelectedDealId(e.target.value)}
                className="bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs font-bold text-charcoal focus:ring-2 focus:ring-antiquegold outline-none cursor-pointer"
              >
                {deals.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.id.toUpperCase()} — {d.specs?.driveType || 'Elevator Project'} (₹{d.agreedPrice.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
              <Badge variant="emerald" className="text-[10px]">
                <Lock className="w-3 h-3 mr-1" />
                {t.lockedDealTerms}
              </Badge>
            </div>
          </div>

          <div className="text-left lg:text-right space-y-1">
            <span className="text-[10px] font-mono text-warmgray uppercase font-extrabold block">
              {t.agreedPrice}
            </span>
            <span className="font-mono text-2xl font-black text-royalemerald tracking-tight">
              ₹ {agreedPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Quick Specs summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-alabaster/60 p-3 rounded-2xl border border-[rgba(184,135,61,0.1)]">
          <div>
            <span className="text-[9px] font-mono text-warmgray block uppercase">CLIENT / SITE</span>
            <span className="font-bold text-charcoal">Deshmukh Arcade, Kothrud</span>
          </div>
          <div>
            <span className="text-[9px] font-mono text-warmgray block uppercase">ELEVATOR TYPE</span>
            <span className="font-bold text-charcoal">{activeDeal.specs?.driveType || 'Gearless Traction'}</span>
          </div>
          <div>
            <span className="text-[9px] font-mono text-warmgray block uppercase">STOPS / CAPACITY</span>
            <span className="font-bold text-charcoal">{activeDeal.specs?.floors || 5} Floors ({activeDeal.specs?.capacity || '6 Pax'})</span>
          </div>
          <div>
            <span className="text-[9px] font-mono text-warmgray block uppercase">DEAL LOCKED BY</span>
            <span className="font-bold text-royalemerald">Mr. Prashant V. Wable</span>
          </div>
        </div>
      </Card>

      {/* SETUP & EDIT SCHEDULE TAB CONTENT */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          {/* Schedule Preset Pickers */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-charcoal flex items-center gap-2">
                <Layers className="w-4 h-4 text-antiquegold" />
                {t.presetsTitle}
              </h3>
              <span className="text-[10px] font-mono text-warmgray">Auto-populates stage percentages</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => applyPreset('standard4')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                  presetType === 'standard4'
                    ? 'bg-royalemerald/10 border-royalemerald text-royalemerald font-bold shadow-xs'
                    : 'bg-white border-[#e6dfd4] text-warmgray hover:border-antiquegold hover:text-charcoal'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t.presetStandard}</span>
                  {presetType === 'standard4' && <Check className="w-4 h-4 text-royalemerald" />}
                </div>
                <p className="text-[10px] opacity-80">30% Advance, 40% Material, 20% Erection, 10% License</p>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('commercial3')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                  presetType === 'commercial3'
                    ? 'bg-royalemerald/10 border-royalemerald text-royalemerald font-bold shadow-xs'
                    : 'bg-white border-[#e6dfd4] text-warmgray hover:border-antiquegold hover:text-charcoal'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t.presetCommercial}</span>
                  {presetType === 'commercial3' && <Check className="w-4 h-4 text-royalemerald" />}
                </div>
                <p className="text-[10px] opacity-80">40% Advance, 50% Material/Erection, 10% Handover</p>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('highrise5')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                  presetType === 'highrise5'
                    ? 'bg-royalemerald/10 border-royalemerald text-royalemerald font-bold shadow-xs'
                    : 'bg-white border-[#e6dfd4] text-warmgray hover:border-antiquegold hover:text-charcoal'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t.presetHighRise}</span>
                  {presetType === 'highrise5' && <Check className="w-4 h-4 text-royalemerald" />}
                </div>
                <p className="text-[10px] opacity-80">5-Stage staggered rollout for tall structures</p>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('bg')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                  presetType === 'bg'
                    ? 'bg-antiquegold/10 border-antiquegold text-antiquegold font-bold shadow-xs'
                    : 'bg-white border-[#e6dfd4] text-warmgray hover:border-antiquegold hover:text-charcoal'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t.presetBG}</span>
                  {presetType === 'bg' && <Check className="w-4 h-4 text-antiquegold" />}
                </div>
                <p className="text-[10px] opacity-80">Bank Guarantee / LC backed commercial structure</p>
              </button>
            </div>
          </Card>

          {/* Real-time Reconciliation Engine Summary Bar */}
          <Card className={`p-4 md:p-5 transition-all ${isReconciled ? 'bg-emerald-50/50 border-emerald-300' : 'bg-red-50/60 border-red-300'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isReconciled ? (
                    <Badge variant="emerald" className="px-3 py-1 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                      {t.reconciledStatus}
                    </Badge>
                  ) : (
                    <Badge variant="error" className="px-3 py-1 text-xs font-bold animate-pulse">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {t.unreconciledStatus}
                    </Badge>
                  )}
                  <span className="text-[11px] font-mono text-warmgray">
                    Sum: {sumPercentage.toFixed(1)}% (₹{sumAmount.toLocaleString('en-IN')} / ₹{agreedPrice.toLocaleString('en-IN')})
                  </span>
                </div>
                {!isReconciled && (
                  <p className="text-xs text-red-700 font-medium">
                    Schedule totals must reconcile exactly to the agreed price before activation. Mismatch: {amountDiff > 0 ? `+₹${amountDiff.toLocaleString('en-IN')}` : `-₹${Math.abs(amountDiff).toLocaleString('en-IN')}`}.
                  </p>
                )}
              </div>

              {!isReconciled && (
                <Button
                  variant="primary"
                  onClick={handleAutoBalance}
                  className="bg-antiquegold hover:bg-[#a07432] text-white text-xs shrink-0 flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {t.autoBalanceBtn}
                </Button>
              )}
            </div>
          </Card>

          {/* Milestone Shift Auto-Simulator Helper */}
          <Card className="p-4 bg-alabaster/80 border border-[rgba(184,135,61,0.15)] space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h4 className="font-serif text-xs font-bold text-charcoal flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-antiquegold" />
                  {t.simTitle}
                </h4>
                <p className="text-[11px] text-warmgray">
                  {t.simDesc}
                </p>
              </div>

              {/* Shift Slider */}
              <div className="flex items-center gap-2 shrink-0 bg-white p-2 rounded-xl border border-[#e6dfd4]">
                <span className="text-[10px] font-mono text-warmgray">Material Dispatch Shift:</span>
                <button
                  type="button"
                  onClick={() => setSimulatedMaterialShift(0)}
                  className={`px-2 py-1 text-[10px] rounded font-bold cursor-pointer ${simulatedMaterialShift === 0 ? 'bg-royalemerald text-white' : 'bg-alabaster text-warmgray'}`}
                >
                  On-Time (+0d)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedMaterialShift(7)}
                  className={`px-2 py-1 text-[10px] rounded font-bold cursor-pointer ${simulatedMaterialShift === 7 ? 'bg-antiquegold text-white' : 'bg-alabaster text-warmgray'}`}
                >
                  Delayed (+7d)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedMaterialShift(14)}
                  className={`px-2 py-1 text-[10px] rounded font-bold cursor-pointer ${simulatedMaterialShift === 14 ? 'bg-red-600 text-white' : 'bg-alabaster text-warmgray'}`}
                >
                  Delayed (+14d)
                </button>
              </div>
            </div>

            {simulatedMaterialShift > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Simulating +{simulatedMaterialShift} days material delivery delay. Subsequent stage target dates automatically shifted forward without flagging the customer as overdue!
                </span>
              </div>
            )}
          </Card>

          {/* Interactive Stage Editor List with Ascension Line Motif */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                <FileText className="w-5 h-5 text-antiquegold" />
                Stage Breakdowns & Trigger Setup
              </h3>
              <Button
                variant="secondary"
                onClick={handleAddStage}
                className="text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.addStageBtn}
              </Button>
            </div>

            <div className="relative pl-6 md:pl-8 space-y-4">
              {/* Vertical Ascension Line */}
              <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gradient-to-b from-antiquegold via-royalemerald to-antiquegold/30" />

              {stages.map((st, idx) => (
                <motion.div
                  key={st.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative"
                >
                  {/* Ascension Node */}
                  <div className="absolute -left-6 md:-left-8 top-6 w-5 h-5 rounded-full bg-white border-2 border-antiquegold flex items-center justify-center text-[10px] font-mono font-bold text-royalemerald shadow-xs">
                    {st.sequenceOrder}
                  </div>

                  <Card className="p-4 md:p-5 space-y-4 hover:border-antiquegold/40 transition-all">
                    {/* Top Row: Stage Header & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e6dfd4]/60 pb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-alabaster border border-[#e6dfd4] text-warmgray">
                          STAGE #{st.sequenceOrder}
                        </span>
                        <input
                          type="text"
                          value={st.stageName}
                          onChange={e => handleStageChange(st.id, 'stageName', e.target.value)}
                          className="flex-1 bg-transparent border-b border-dashed border-[#e6dfd4] focus:border-antiquegold text-sm font-bold text-charcoal outline-none px-1 py-0.5"
                          placeholder="Stage Description"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {st.status === 'paid' ? (
                          <Badge variant="emerald" className="text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> PAID (Receipt #{st.receiptNo || 'REC-881'})
                          </Badge>
                        ) : st.status === 'pending' ? (
                          <Badge variant="warning" className="text-[10px]">
                            <Clock className="w-3 h-3 mr-1" /> DUE NEXT
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px]">UPCOMING</Badge>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSplitStage(st.id)}
                          title={t.splitStageBtn}
                          className="p-1.5 text-warmgray hover:text-royalemerald hover:bg-alabaster rounded-lg transition-all cursor-pointer"
                        >
                          <Split className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStage(st.id)}
                          title={t.deleteStageBtn}
                          className="p-1.5 text-warmgray hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      {/* Weight Percentage */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">
                          {t.stageWeight}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={st.percentage}
                            onChange={e => handleStageChange(st.id, 'percentage', e.target.value)}
                            className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 font-mono font-bold text-charcoal focus:ring-2 focus:ring-antiquegold outline-none"
                          />
                          <span className="absolute right-3 top-2.5 font-mono text-warmgray">%</span>
                        </div>
                      </div>

                      {/* Amount in INR */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">
                          {t.stageAmountLabel}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 font-mono text-warmgray">₹</span>
                          <input
                            type="number"
                            value={st.amount}
                            onChange={e => handleStageChange(st.id, 'amount', e.target.value)}
                            className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl pl-7 pr-3 py-2 font-mono font-bold text-charcoal focus:ring-2 focus:ring-antiquegold outline-none"
                          />
                        </div>
                      </div>

                      {/* Due Trigger Selection */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">
                          {t.triggerLabel}
                        </label>
                        <select
                          value={st.dueTrigger}
                          onChange={e => handleStageChange(st.id, 'dueTrigger', e.target.value)}
                          className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-2.5 py-2 text-xs font-medium text-charcoal focus:ring-2 focus:ring-antiquegold outline-none cursor-pointer"
                        >
                          <option value="contract_signing">{t.triggerSign}</option>
                          <option value="material_dispatch">{t.triggerMaterial}</option>
                          <option value="scaffolding_ready">{t.triggerScaffold}</option>
                          <option value="erection_completion">{t.triggerErection}</option>
                          <option value="electrical_hookup">{t.triggerElectrical}</option>
                          <option value="license_handover">{t.triggerLicense}</option>
                          <option value="fixed_date">{t.triggerFixed}</option>
                        </select>
                      </div>

                      {/* Offset & Calculated Due Date */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">
                          {t.dueDateLabel}
                        </label>
                        <div className="p-2 bg-alabaster rounded-xl border border-[#e6dfd4] flex items-center justify-between">
                          <span className="font-mono font-bold text-royalemerald">
                            {st.estimatedDueDate}
                          </span>
                          <span className="text-[9px] font-mono text-warmgray">
                            +{st.offsetDays}d
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Commercial Bank Guarantee / LC Options */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e6dfd4] pb-3">
              <div className="space-y-0.5">
                <h3 className="font-serif text-sm font-bold text-charcoal flex items-center gap-2">
                  <Shield className="w-4 h-4 text-antiquegold" />
                  {t.bgToggleTitle}
                </h3>
                <p className="text-[11px] text-warmgray">
                  {t.bgDesc}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={bgRequired}
                  onChange={e => setBgRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-antiquegold"></div>
              </label>
            </div>

            {bgRequired && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">
                    {t.bgBankName}
                  </label>
                  <input
                    type="text"
                    value={bgBankName}
                    onChange={e => setBgBankName(e.target.value)}
                    className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal focus:ring-2 focus:ring-antiquegold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">
                    {t.bgRefNo}
                  </label>
                  <input
                    type="text"
                    value={bgRefNo}
                    onChange={e => setBgRefNo(e.target.value)}
                    className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 font-mono text-xs text-charcoal focus:ring-2 focus:ring-antiquegold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">
                    {t.bgAmount}
                  </label>
                  <input
                    type="number"
                    value={bgAmount}
                    onChange={e => setBgAmount(Number(e.target.value))}
                    className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 font-mono text-xs text-charcoal focus:ring-2 focus:ring-antiquegold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">
                    {t.bgExpiry}
                  </label>
                  <input
                    type="date"
                    value={bgExpiry}
                    onChange={e => setBgExpiry(e.target.value)}
                    className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 font-mono text-xs text-charcoal focus:ring-2 focus:ring-antiquegold outline-none"
                  />
                </div>
              </motion.div>
            )}
          </Card>
        </div>
      )}

      {/* CUSTOMER PORTAL PREVIEW TAB CONTENT */}
      {activeTab === 'preview' && (
        <Card className="p-6 md:p-8 space-y-6 bg-white border border-[rgba(184,135,61,0.2)] shadow-xl relative overflow-hidden">
          {/* Top Banner inside Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6dfd4] pb-6">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-antiquegold block">
                CUSTOMER PORTAL VIEW • MOBILE INTERFACE PREVIEW
              </span>
              <h2 className="font-serif text-xl font-bold text-charcoal">
                {t.customerPreviewHeader}
              </h2>
              <p className="text-xs text-warmgray">
                {t.customerPreviewSubtitle}
              </p>
            </div>

            <Button
              variant="secondary"
              className="text-xs flex items-center gap-2 self-start sm:self-auto"
              onClick={() => showToast('Downloading certified payment schedule PDF preview...')}
            >
              <Download className="w-4 h-4 text-antiquegold" />
              {t.downloadPDF}
            </Button>
          </div>

          {/* Investment Progress Bar */}
          <div className="bg-alabaster p-4 rounded-2xl border border-[rgba(184,135,61,0.1)] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-charcoal">Total Investment Schedule</span>
              <span className="font-mono font-bold text-royalemerald">₹{agreedPrice.toLocaleString('en-IN')}</span>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden flex">
              <div className="bg-royalemerald h-full" style={{ width: '30%' }} title="30% Paid Advance" />
              <div className="bg-amber-400 h-full" style={{ width: '40%' }} title="40% Due Next" />
              <div className="bg-gray-300 h-full" style={{ width: '30%' }} title="30% Remaining" />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-warmgray">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-royalemerald inline-block" /> Paid: ₹3,75,000 (30%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Due Next: ₹5,00,000 (40%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Upcoming: ₹3,75,000 (30%)</span>
            </div>
          </div>

          {/* Timeline for Customer */}
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-royalemerald via-amber-400 to-gray-200" />

            {stages.map((st, idx) => (
              <div key={st.id} className="relative flex items-start gap-4">
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  st.status === 'paid' ? 'bg-royalemerald text-white' : st.status === 'pending' ? 'bg-amber-400 text-white animate-pulse' : 'bg-gray-200 text-gray-600'
                }`}>
                  {st.sequenceOrder}
                </div>

                <div className="flex-1 bg-alabaster p-4 rounded-2xl border border-[rgba(184,135,61,0.1)] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-charcoal">{st.stageName}</h4>
                      <p className="text-[10px] text-warmgray font-mono">
                        Trigger: {st.dueTrigger.replace('_', ' ').toUpperCase()} (+{st.offsetDays} days)
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm font-bold text-royalemerald block">
                        ₹{st.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] font-mono text-warmgray">
                        Weight: {st.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#e6dfd4]/60 text-xs">
                    <span className="text-[10px] text-warmgray font-mono">
                      Target Due Date: <strong className="text-charcoal">{st.estimatedDueDate}</strong>
                    </span>

                    {st.status === 'paid' ? (
                      <span className="text-[10px] text-royalemerald font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PAID & RECEIPTED
                      </span>
                    ) : st.status === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => showToast('Simulating customer UPI/NEFT payment flow...')}
                        className="px-3 py-1 bg-royalemerald text-white text-[10px] font-bold rounded-lg hover:bg-emerald-800 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Zap className="w-3 h-3" />
                        {t.payNowBtn}
                      </button>
                    ) : (
                      <span className="text-[10px] text-warmgray italic">Pending Milestone</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[rgba(184,135,61,0.2)] p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-warmgray font-mono">
              Reconciliation: <strong className={isReconciled ? 'text-royalemerald' : 'text-red-600'}>
                {isReconciled ? '100% OK' : 'MISMATCH'}
              </strong>
            </span>

            {isActivated && (
              <Badge variant="emerald" className="text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" /> ACTIVE & SYNCED
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="secondary"
              onClick={() => applyPreset('standard4')}
              className="text-xs px-3 py-2.5"
            >
              {t.resetBtn}
            </Button>

            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              className="text-xs px-3 py-2.5 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              {t.saveDraftBtn}
            </Button>

            <Button
              variant="primary"
              disabled={!isReconciled}
              onClick={handleActivateSchedule}
              className="text-xs px-5 py-2.5 bg-royalemerald hover:bg-emerald-900 text-white font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {t.activateBtn}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStageScheduleSetup;
