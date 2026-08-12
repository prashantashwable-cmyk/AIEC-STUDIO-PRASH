import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Calendar, LayoutGrid, BarChart3, Clock, 
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, 
  AlertTriangle, Download, Mail, Send, Save, Share2, 
  Trash2, RefreshCw, Eye, Info, Check, AlertCircle, FileSpreadsheet,
  Award, TrendingUp
} from 'lucide-react';
import { Card, Button } from './Common';
import { useLanguage } from '../lib/language';
import { User } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';

interface SavedReport {
  id: string;
  name: string;
  metrics: string[];
  dimensions: string[];
  dateRange: string;
  frequency: string;
  deliveryChannel: 'Email' | 'WhatsApp' | 'Both';
  createdAt: string;
}

export const CustomReportBuilder: React.FC<{ user: User }> = ({ user }) => {
  const { language } = useLanguage();
  const isDevanagari = language === 'hi' || language === 'mr';

  // Wizard Steps:
  // Step 1: Base Config & Title
  // Step 2: Choose Metrics & Dimensions (with Compatibility Alerts)
  // Step 3: Date Range & Rolling Logic
  // Step 4: Schedule Frequency & Channels
  // Step 5: Review & Live Preview
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState<number>(1);

  // Form Fields
  const [reportName, setReportName] = useState<string>('Custom Revenue Analysis');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue']);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(['zone']);
  const [dateRange, setDateRange] = useState<string>('last_7_days');
  const [scheduleFrequency, setScheduleFrequency] = useState<string>('weekly');
  const [deliveryChannel, setDeliveryChannel] = useState<'Email' | 'WhatsApp' | 'Both'>('Email');
  const [savedReports, setSavedReports] = useState<SavedReport[]>([
    {
      id: 'REP-001',
      name: 'Weekly Zone Elevator Delivery KPI',
      metrics: ['elevators_delivered', 'safety_score'],
      dimensions: ['zone'],
      dateRange: 'last_7_days',
      frequency: 'weekly',
      deliveryChannel: 'WhatsApp',
      createdAt: '2026-07-02'
    }
  ]);

  // Loading, draft, export, and chart preview states
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showIncompatibilityWarning, setShowIncompatibilityWarning] = useState<boolean>(false);
  const [showWideWarning, setShowWideWarning] = useState<boolean>(false);
  const [isConfigChanged, setIsConfigChanged] = useState<boolean>(false);

  // Translations
  const translations = {
    en: {
      title: "Ad Hoc Custom Report Builder",
      subtitle: "Tailor governed elevator telemetry, financial ledgers, and installer dispatch data into custom reports",
      step1: "Report Identity",
      step2: "Metrics & Slices",
      step3: "Temporal Scope",
      step4: "Delivery Schedule",
      step5: "Review & Generate",
      metricsLabel: "Select Key Metrics (Up to 3)",
      dimensionsLabel: "Select Slice Dimensions (Up to 2)",
      dateRangeLabel: "Temporal Date Window",
      frequencyLabel: "Recurring Delivery Frequency",
      channelLabel: "Auto-Dispatch Channel",
      namePlaceholder: "Enter custom report name...",
      incompatibleWarning: "Incompatible combination detected: Technician Performance Metrics cannot be cross-sliced with Supplier Billing accounts. Chart preview will isolate dimensions to prevent erroneous projections.",
      wideWarning: "High dimensionality warning! Choosing multiple metrics and dimensions will result in a wide table. Exporting to a spreadsheet is recommended.",
      prevBtn: "Back Step",
      nextBtn: "Next Step",
      saveBtn: "Save Report Template",
      exportBtn: "Export Ledger",
      scheduleBtn: "Activate Auto-Schedule",
      livePreview: "Live Data Ledger Preview",
      metrics: {
        revenue: "Gross Revenue (₹)",
        elevators_delivered: "Elevators Installed & Commissioned",
        safety_score: "SOP Safety Audits (Out of 100)",
        installer_speed: "Avg Project Delay (Days)",
        supplier_cost: "Supplier Payout Claims (₹)"
      },
      dimensions: {
        zone: "Regional Operation Zones (Pune)",
        elevator_model: "Elevator Model Tier (Ascension / Alabaster / Heritage)",
        supplier: "B2B Steel & Motor Suppliers",
        technician: "Lead Field Installer Technicians"
      },
      dateRanges: {
        last_7_days: "Last 7 Days (Rolling Window)",
        last_30_days: "Last 30 Days (Rolling Window)",
        custom_quarter: "Current Quarter MTD",
        year_to_date: "Financial Year 2026 YTD"
      },
      frequencies: {
        none: "One-Time Ad Hoc Audit (No scheduling)",
        daily: "Daily Automated Broadcast (08:00 IST)",
        weekly: "Weekly Executive Digest (Every Monday)",
        monthly: "Monthly Audit Ledger (1st of Month)"
      },
      channels: {
        Email: "Admin Registered Email Only",
        WhatsApp: "WhatsApp Automated PDF Dispatch",
        Both: "Dual Channel (Secure Email & SMS link)"
      },
      savedTemplates: "Saved Dashboard Configurations",
      noReports: "No templates saved yet.",
      exportSuccess: "Successfully generated and compiled report layout. Exporting PDF/XLSX to browser downloads.",
      saveSuccess: "Saved template configuration permanently. Auto-run scheduler is now tracking this report.",
      progressTitle: "AD HOC REPORT COMPILATION EFFICIENCY",
      currentProgressLabel: "Steps Completed in Builder Wizard",
      totalProgressLabel: "Total Governed SLA Schedule Health Tracker"
    },
    hi: {
      title: "तदर्थ कस्टम रिपोर्ट निर्माता",
      subtitle: "एलिवेटर टेलीमेट्री, वित्तीय खातों और इंस्टॉलर प्रेषण डेटा को कस्टम रिपोर्ट में अनुकूलित करें",
      step1: "रिपोर्ट पहचान",
      step2: "मेट्रिक्स और स्लाइस",
      step3: "समय सीमा",
      step4: "वितरण अनुसूची",
      step5: "समीक्षा और पूर्वावलोकन",
      metricsLabel: "प्रमुख मेट्रिक्स चुनें (अधिकतम 3)",
      dimensionsLabel: "विभाजन आयाम चुनें (अधिकतम 2)",
      dateRangeLabel: "समय तिथि सीमा",
      frequencyLabel: "आवर्ती वितरण आवृत्ति",
      channelLabel: "स्वचालित वितरण चैनल",
      namePlaceholder: "कस्टम रिपोर्ट का नाम दर्ज करें...",
      incompatibleWarning: "असंगत संयोजन का पता चला: तकनीशियन प्रदर्शन मेट्रिक्स को आपूर्तिकर्ता बिलिंग खातों के साथ साझा नहीं किया जा सकता। त्रुटिपूर्ण डेटा रोकने के लिए आयाम अलग रखे जाएंगे।",
      wideWarning: "उच्च आयाम चेतावनी! कई मेट्रिक्स और आयामों को चुनने से तालिका व्यापक हो जाएगी। स्प्रेडशीट निर्यात की अनुशंसा की जाती है।",
      prevBtn: "पीछे जाएं",
      nextBtn: "अगला कदम",
      saveBtn: "रिपोर्ट टेम्पलेट सहेजें",
      exportBtn: "खाता बही निर्यात करें",
      scheduleBtn: "स्वचालित शेड्यूलिंग सक्रिय करें",
      livePreview: "सक्रिय लाइव डेटा पूर्वावलोकन",
      metrics: {
        revenue: "कुल राजस्व (₹)",
        elevators_delivered: "स्थापित और चालू किए गए एलिवेटर",
        safety_score: "SOP सुरक्षा ऑडिट (100 में से)",
        installer_speed: "औसत परियोजना विलंब (दिन)",
        supplier_cost: "आपूर्तिकर्ता भुगतान दावे (₹)"
      },
      dimensions: {
        zone: "क्षेत्रीय परिचालन क्षेत्र (पुणे)",
        elevator_model: "एलिवेटर मॉडल स्तर (एसेंशन / एलाबास्टर)",
        supplier: "B2B स्टील और मोटर आपूर्तिकर्ता",
        technician: "मुख्य क्षेत्र स्थापना तकनीशियन"
      },
      dateRanges: {
        last_7_days: "पिछले 7 दिन (रोलिंग विंडो)",
        last_30_days: "पिछले 30 दिन (रोलिंग विंडो)",
        custom_quarter: "वर्तमान तिमाही (MTD)",
        year_to_date: "वित्तीय वर्ष 2026 YTD"
      },
      frequencies: {
        none: "एक बार तदर्थ ऑडिट (कोई शेड्यूलिंग नहीं)",
        daily: "दैनिक स्वचालित प्रसारण (08:00 IST)",
        weekly: "साप्ताहिक कार्यकारी सारांश (हर सोमवार)",
        monthly: "मासिक लेखा परीक्षा बही (महीने की 1 तारीख)"
      },
      channels: {
        Email: "केवल व्यवस्थापक ईमेल",
        WhatsApp: "व्हाट्सएप स्वचालित PDF प्रेषण",
        Both: "दोहरा चैनल (सुरक्षित ईमेल और एसएमएस लिंक)"
      },
      savedTemplates: "सहेजे गए रिपोर्ट कॉन्फ़िगरेशन",
      noReports: "अभी तक कोई टेम्पलेट सहेजा नहीं गया है।",
      exportSuccess: "रिपोर्ट लेआउट सफलतापूर्वक तैयार किया गया। ब्राउज़र डाउनलोड में PDF/XLSX निर्यात किया जा रहा है।",
      saveSuccess: "टेम्पलेट कॉन्फ़िगरेशन स्थायी रूप से सहेजा गया। शेड्यूलर अब इस रिपोर्ट को ट्रैक कर रहा है।",
      progressTitle: "कस्टम रिपोर्ट संकलन दक्षता",
      currentProgressLabel: "बिल्डर विज़ार्ड में पूरे किए गए चरण",
      totalProgressLabel: "समग्र आवर्ती अनुसूची स्वास्थ्य दर"
    },
    mr: {
      title: "तदर्थ सानुकूल अहवाल निर्माता",
      subtitle: "लिफ्ट टेलीमेट्री, आर्थिक लेजर आणि फील्ड टीम डेटाचा सानुकूल अहवाल तयार करा",
      step1: "अहवाल ओळख",
      step2: "मेट्रिक्स आणि स्लाइस",
      step3: "वेळ मर्यादा",
      step4: "वितरण वेळापत्रक",
      step5: "पुनरावलोकन आणि पूर्वावलोकन",
      metricsLabel: "मुख्य मेट्रिक्स निवडा (कमाल ३)",
      dimensionsLabel: "तपशील निकष निवडा (कमाल २)",
      dateRangeLabel: "वेळ आणि तारीख मर्यादा",
      frequencyLabel: "नियमित वितरण वारंवारता",
      channelLabel: "स्वयंचलित पाठवण्याचा मार्ग",
      namePlaceholder: "सानुकूल अहवालाचे नाव टाका...",
      incompatibleWarning: "अयोग्य संयोजन आढळले: तंत्रज्ञांच्या कामगिरीचे निकष विक्रेत्यांच्या पेमेंट खात्यांशी लिंक करता येणार नाहीत. चुकीचा अंदाज टाळण्यासाठी डेटा मर्यादित केला आहे.",
      wideWarning: "मोठ्या अहवाल विस्ताराची चेतावणी! एकापेक्षा जास्त मेट्रिक्स आणि श्रेणी निवडल्यामुळे टेबल मोठा होऊ शकतो. स्प्रेडशीट स्वरूपात एक्सपोर्ट करण्याचा सल्ला दिला जातो.",
      prevBtn: "मागे",
      nextBtn: "पुढील पाऊल",
      saveBtn: "अहवाल टेम्पलेट जतन करा",
      exportBtn: "अहवाल एक्सपोर्ट करा",
      scheduleBtn: "स्वयंचलित वेळापत्रक सक्रिय करा",
      livePreview: "थेट डेटा पूर्वावलोकन",
      metrics: {
        revenue: "एकूण महसूल (₹)",
        elevators_delivered: "स्थापित आणि कार्यान्वित केलेल्या लिफ्ट",
        safety_score: "SOP सुरक्षा ऑडिट (१०० पैकी)",
        installer_speed: "सरासरी प्रकल्प विलंब (दिवस)",
        supplier_cost: "विक्रेता थकीत दावे (₹)"
      },
      dimensions: {
        zone: "प्रादेशिक विभाग (पुणे)",
        elevator_model: "लिफ्ट मॉडेल स्तर (असेन्शन / अलाबास्टर / हेरिटेज)",
        supplier: "B2B स्टील आणि मोटर विक्रेते",
        technician: "मुख्य फील्ड तंत्रज्ञ"
      },
      dateRanges: {
        last_7_days: "मागील ७ दिवस (रोलिंग विंडो)",
        last_30_days: "मागील ३० दिवस (रोलिंग विंडो)",
        custom_quarter: "चालू तिमाही (MTD)",
        year_to_date: "आर्थिक वर्ष २०२६ YTD"
      },
      frequencies: {
        none: "एकवेळ तदर्थ अहवाल (वेळापत्रक नाही)",
        daily: "रोजचे स्वयंचलित प्रसारण (सकाळी ८:०० IST)",
        weekly: "साप्ताहिक कार्यकारी अहवाल (दर सोमवारी)",
        monthly: "मासिक लेखापरीक्षण अहवाल (महिन्याच्या १ तारखेला)"
      },
      channels: {
        Email: "नोंदणीकृत ॲडमीन ईमेलवर",
        WhatsApp: "व्हाट्सएप स्वयंचलित PDF अहवाल",
        Both: "दोन्ही मार्ग (सुरक्षित ईमेल आणि एसएमएस लिंक)"
      },
      savedTemplates: "जतन केलेले अहवाल टेम्पलेट्स",
      noReports: "अद्याप कोणताही टेम्पलेट जतन केलेला नाही.",
      exportSuccess: "अहवाल लेआउट यशस्वीरित्या तयार केला आहे. ब्राउझरमध्ये PDF/XLSX एक्सपोर्ट होत आहे.",
      saveSuccess: "टेम्पलेट कायमचे जतन केले गेले. स्वयंचलित शेड्यूलर आता या अहवालाचा मागोवा घेत आहे.",
      progressTitle: "सानुकूल अहवाल संकलन अचूकता",
      currentProgressLabel: "विझार्डमध्ये पूर्ण केलेले टप्पे",
      totalProgressLabel: "एकूण नियमित वितरण शेड्यूल आरोग्य मागोवा"
    }
  };

  const t = translations[language as 'en' | 'mr' | 'hi'] || translations.en;

  // Validation: Check for incompatible combinations (Edge Case)
  // Technician metrics + Supplier dimension = incompatible
  useEffect(() => {
    const hasTechnicianMetric = selectedMetrics.includes('installer_speed') || selectedMetrics.includes('safety_score');
    const hasSupplierDimension = selectedDimensions.includes('supplier');
    const hasSupplierMetric = selectedMetrics.includes('supplier_cost');
    const hasTechnicianDimension = selectedDimensions.includes('technician');

    if ((hasTechnicianMetric && hasSupplierDimension) || (hasSupplierMetric && hasTechnicianDimension)) {
      setShowIncompatibilityWarning(true);
    } else {
      setShowIncompatibilityWarning(false);
    }

    // Wide report warning (Edge Case)
    if (selectedMetrics.length >= 3 && selectedDimensions.length >= 2) {
      setShowWideWarning(true);
    } else {
      setShowWideWarning(false);
    }
  }, [selectedMetrics, selectedDimensions]);

  // Handle step draft saving logic (Business rule: Draft-saves at every step boundary)
  const handleNextStep = () => {
    if (currentStep < 5) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next > maxCompletedStep) {
        setMaxCompletedStep(next);
      }
      // Simulate silent draft save notification in console/state
      console.log(`Draft saved at step ${currentStep} boundary for report: ${reportName}`);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepJump = (step: number) => {
    if (step <= maxCompletedStep) {
      setCurrentStep(step);
    }
  };

  // Toggle helpers
  const toggleMetric = (key: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(m => m !== key);
      }
      if (prev.length >= 3) return prev; // Limit to 3
      return [...prev, key];
    });
  };

  const toggleDimension = (key: string) => {
    setSelectedDimensions(prev => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(d => d !== key);
      }
      if (prev.length >= 2) return prev; // Limit to 2
      return [...prev, key];
    });
  };

  // Execute actions
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(t.exportSuccess);
    }, 1500);
  };

  const handleSaveReport = () => {
    setIsSaving(true);
    setTimeout(() => {
      const newReport: SavedReport = {
        id: `REP-00${savedReports.length + 2}`,
        name: reportName,
        metrics: [...selectedMetrics],
        dimensions: [...selectedDimensions],
        dateRange: dateRange,
        frequency: scheduleFrequency,
        deliveryChannel: deliveryChannel,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setSavedReports(prev => [newReport, ...prev]);
      setIsSaving(false);
      alert(t.saveSuccess);
    }, 1200);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this custom report template?")) {
      setSavedReports(prev => prev.filter(r => r.id !== id));
    }
  };

  // Live Preview Data Generator (Mock Live Data corresponding to user selection)
  const generatePreviewData = () => {
    const dimensionKey = selectedDimensions[0] || 'zone';
    
    // Default zones
    const zones = ['Pune West (Kothrud)', 'Pune East (Hadapsar)', 'Pune North (Chinchwad)', 'Pune South (Katraj)'];
    const models = ['Ascension Elite Heavy Duty', 'Alabaster Smart Passenger', 'Heritage Classic Vintage'];
    const suppliers = ['Bhartia Premium Steel', 'Kirloskar Heavy Motors', 'Ascent Cables Pune'];
    const technicians = ['Amol G. Bhosale', 'Ramesh Patil', 'Sanjay Deshmukh'];

    let dimensionItems = zones;
    if (dimensionKey === 'elevator_model') dimensionItems = models;
    if (dimensionKey === 'supplier') dimensionItems = suppliers;
    if (dimensionKey === 'technician') dimensionItems = technicians;

    return dimensionItems.map((item, index) => {
      const row: any = { name: item };
      if (selectedMetrics.includes('revenue')) {
        row[t.metrics.revenue] = [4800000, 3600000, 5100000, 2900000][index % 4];
      }
      if (selectedMetrics.includes('elevators_delivered')) {
        row[t.metrics.elevators_delivered] = [12, 8, 14, 6][index % 4];
      }
      if (selectedMetrics.includes('safety_score')) {
        row[t.metrics.safety_score] = [98, 95, 94, 99][index % 4];
      }
      if (selectedMetrics.includes('installer_speed')) {
        row[t.metrics.installer_speed] = [1.5, 3.2, 0.8, 4.5][index % 4];
      }
      if (selectedMetrics.includes('supplier_cost')) {
        row[t.metrics.supplier_cost] = [1200000, 850000, 1400000, 600000][index % 4];
      }
      return row;
    });
  };

  const previewData = generatePreviewData();

  // Progress calculations
  const stepsTotal = 5;
  const stepsProgressPercent = Math.round((currentStep / stepsTotal) * 100);

  // MTD SLA Schedule Health metric
  const scheduledCount = savedReports.filter(r => r.frequency !== 'none').length;
  const scheduleSlaPercent = 100; // All active schedules dispatched successfully today

  return (
    <div className="w-full space-y-6 pb-20">

      {/* SCREEN HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-antiquegold rounded-full block" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-charcoal leading-none">
              {t.title}
            </h1>
          </div>
          <p className="text-xs text-warmgray font-medium">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[10px] bg-royalemerald/10 text-royalemerald font-bold border border-royalemerald/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-antiquegold" />
            GOVERNED DATA DICTIONARY ACTIVE
          </span>
        </div>
      </div>

      {/* PROGRESS TRACKER BAR FOR USER INSTRUCTIONS */}
      <Card className="p-4 bg-white border-royalemerald/10">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-royalemerald" />
          <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
            {t.progressTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Active Steps Progress */}
          <div className="space-y-1">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-bold text-warmgray">
                {t.currentProgressLabel} ({currentStep}/{stepsTotal})
              </span>
              <span className="font-mono text-xs font-bold text-royalemerald">
                {stepsProgressPercent}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE6] h-2 rounded-full overflow-hidden p-[1px] border border-[rgba(184,135,61,0.1)]">
              <div 
                style={{ width: `${stepsProgressPercent}%` }}
                className="bg-royalemerald h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* SLA Scheduled Reports Delivery Tracker */}
          <div className="space-y-1">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-bold text-warmgray">
                {t.totalProgressLabel} ({scheduledCount} Active Schedules)
              </span>
              <span className="font-mono text-xs font-bold text-antiquegold">
                {scheduleSlaPercent}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE6] h-2 rounded-full overflow-hidden p-[1px] border border-[rgba(184,135,61,0.1)]">
              <div 
                style={{ width: `${scheduleSlaPercent}%` }}
                className="bg-antiquegold h-full rounded-full"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* HORIZONTAL ASCENSION LINE STEP INDICATOR (Wizard Layout Pattern) */}
      <div className="relative py-2 px-2 bg-white rounded-2xl border border-[rgba(184,135,61,0.1)] shadow-xs">
        {/* Horizontal Connector Line */}
        <div className="absolute left-[10%] right-[10%] top-[25px] h-0.5 bg-[#EFECE6] -z-0" />
        <div 
          className="absolute left-[10%] top-[25px] h-0.5 bg-antiquegold transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (stepsTotal - 1)) * 80}%` }}
        />

        <div className="grid grid-cols-5 relative z-10">
          {[1, 2, 3, 4, 5].map((step) => {
            const isActive = currentStep === step;
            const isCompleted = maxCompletedStep >= step;
            
            let stepLabel = t.step1;
            if (step === 2) stepLabel = t.step2;
            if (step === 3) stepLabel = t.step3;
            if (step === 4) stepLabel = t.step4;
            if (step === 5) stepLabel = t.step5;

            return (
              <div 
                key={step} 
                className="flex flex-col items-center cursor-pointer text-center group"
                onClick={() => handleStepJump(step)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-200 ${
                  isActive 
                    ? 'bg-antiquegold border-antiquegold text-white shadow-xs scale-110' 
                    : isCompleted 
                      ? 'bg-white border-antiquegold text-antiquegold' 
                      : 'bg-white border-warmgray/25 text-warmgray'
                }`}>
                  {isCompleted && step < currentStep ? '✓' : step}
                </div>
                <span className={`text-[9px] font-bold mt-1.5 hidden md:block max-w-[100px] truncate ${
                  isActive ? 'text-antiquegold font-extrabold' : 'text-warmgray group-hover:text-charcoal'
                }`}>
                  {stepLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMPATIBILITY / EXTREME DIMENSIONALITY ALERTS */}
      <AnimatePresence>
        {showIncompatibilityWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-2xl bg-error/10 border border-error/25 text-error text-xs flex gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">
              {t.incompatibleWarning}
            </p>
          </motion.div>
        )}

        {showWideWarning && !showIncompatibilityWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-2xl bg-[#B8873D]/10 border border-[#B8873D]/25 text-charcoal text-xs flex gap-2"
          >
            <Info className="w-4 h-4 text-antiquegold shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">
              {t.wideWarning}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TWO COLUMN GRID (WIZARD CONFIG + LIVE PREVIEW PANEL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* WIZARD FORM PANEL (Col Span 5) */}
        <div className="lg:col-span-5">
          <Card className="p-5 bg-white border-antiquegold/10 min-h-[420px] flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* STEP 1: IDENTITY */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-[rgba(184,135,61,0.1)] pb-2">
                    <span className="text-[10px] text-antiquegold font-extrabold font-mono uppercase">Step 01 / Report Settings</span>
                    <h2 className="font-serif text-lg font-bold text-charcoal">{t.step1}</h2>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-warmgray">Report Template Name</label>
                    <input 
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      className="w-full bg-alabaster text-xs font-bold border border-[rgba(184,135,61,0.15)] rounded-xl px-4 py-3 text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-alabaster border border-[rgba(184,135,61,0.05)] text-xs text-warmgray space-y-1.5 font-medium leading-relaxed">
                    <p className="font-bold text-charcoal flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-antiquegold" />
                      About Saved Configs
                    </p>
                    <p>Templates are personal to your admin account by default but can be run instantly at any time as background tasks. Saved configurations survive browser cache resets.</p>
                  </div>
                </div>
              )}

              {/* STEP 2: METRICS & DIMENSIONS */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-[rgba(184,135,61,0.1)] pb-2">
                    <span className="text-[10px] text-antiquegold font-extrabold font-mono uppercase">Step 02 / Query Data Parameters</span>
                    <h2 className="font-serif text-lg font-bold text-charcoal">{t.step2}</h2>
                  </div>

                  {/* METRICS */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-warmgray block">{t.metricsLabel}</label>
                    <div className="space-y-1.5">
                      {Object.keys(t.metrics).map((key) => {
                        const isSelected = selectedMetrics.includes(key);
                        return (
                          <div 
                            key={key}
                            onClick={() => toggleMetric(key)}
                            className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex justify-between items-center ${
                              isSelected 
                                ? 'bg-antiquegold/10 border-antiquegold text-charcoal' 
                                : 'bg-white border-[rgba(184,135,61,0.1)] hover:bg-alabaster text-warmgray'
                            }`}
                          >
                            <span>{(t.metrics as any)[key]}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-antiquegold" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* DIMENSIONS */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-warmgray block">{t.dimensionsLabel}</label>
                    <div className="space-y-1.5">
                      {Object.keys(t.dimensions).map((key) => {
                        const isSelected = selectedDimensions.includes(key);
                        return (
                          <div 
                            key={key}
                            onClick={() => toggleDimension(key)}
                            className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex justify-between items-center ${
                              isSelected 
                                ? 'bg-royalemerald/10 border-royalemerald text-charcoal' 
                                : 'bg-white border-[rgba(184,135,61,0.1)] hover:bg-alabaster text-warmgray'
                            }`}
                          >
                            <span>{(t.dimensions as any)[key]}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-royalemerald" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: DATE RANGE & ROLLING LOGIC */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-[rgba(184,135,61,0.1)] pb-2">
                    <span className="text-[10px] text-antiquegold font-extrabold font-mono uppercase">Step 03 / Temporal Horizon</span>
                    <h2 className="font-serif text-lg font-bold text-charcoal">{t.step3}</h2>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-warmgray block">{t.dateRangeLabel}</label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.keys(t.dateRanges).map((key) => {
                        const isSelected = dateRange === key;
                        return (
                          <div 
                            key={key}
                            onClick={() => setDateRange(key)}
                            className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-3.5 ${
                              isSelected 
                                ? 'bg-antiquegold/10 border-antiquegold text-charcoal' 
                                : 'bg-white border-[rgba(184,135,61,0.1)] hover:bg-alabaster text-warmgray'
                            }`}
                          >
                            <Calendar className={`w-4 h-4 ${isSelected ? 'text-antiquegold' : 'text-warmgray'}`} />
                            <div className="text-left">
                              <p className="font-bold">{(t.dateRanges as any)[key]}</p>
                              <p className="text-[10px] text-warmgray font-semibold mt-0.5">Dynamic rolling parameter</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: FREQUENCY & DELIVERY CHANNELS */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-[rgba(184,135,61,0.1)] pb-2">
                    <span className="text-[10px] text-antiquegold font-extrabold font-mono uppercase">Step 04 / Auto-Dispatch Triggers</span>
                    <h2 className="font-serif text-lg font-bold text-charcoal">{t.step4}</h2>
                  </div>

                  {/* FREQUENCY */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-warmgray block">{t.frequencyLabel}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(t.frequencies).map((key) => {
                        const isSelected = scheduleFrequency === key;
                        return (
                          <div 
                            key={key}
                            onClick={() => setScheduleFrequency(key)}
                            className={`p-3 rounded-xl border text-xs font-bold cursor-pointer text-center transition-all ${
                              isSelected 
                                ? 'bg-antiquegold/10 border-antiquegold text-charcoal' 
                                : 'bg-white border-[rgba(184,135,61,0.1)] hover:bg-alabaster text-warmgray'
                            }`}
                          >
                            <Clock className={`w-4 h-4 mx-auto mb-1.5 ${isSelected ? 'text-antiquegold' : 'text-warmgray'}`} />
                            <span className="block leading-tight">{(t.frequencies as any)[key]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* CHANNELS */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-warmgray block">{t.channelLabel}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.keys(t.channels).map((key) => {
                        const isSelected = deliveryChannel === key;
                        return (
                          <div 
                            key={key}
                            onClick={() => setDeliveryChannel(key as any)}
                            className={`p-2.5 rounded-xl border text-[10px] font-bold cursor-pointer text-center transition-all ${
                              isSelected 
                                ? 'bg-royalemerald/10 border-royalemerald text-charcoal' 
                                : 'bg-white border-[rgba(184,135,61,0.1)] hover:bg-alabaster text-warmgray'
                            }`}
                          >
                            <span className="block leading-tight">{(t.channels as any)[key]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="border-b border-[rgba(184,135,61,0.1)] pb-2">
                    <span className="text-[10px] text-antiquegold font-extrabold font-mono uppercase">Step 05 / Template Final Review</span>
                    <h2 className="font-serif text-lg font-bold text-charcoal">{t.step5}</h2>
                  </div>

                  <div className="space-y-3 bg-[#FAF9F5] p-4 rounded-xl border border-antiquegold/15 text-xs font-medium text-charcoal">
                    <div className="flex justify-between">
                      <span className="text-warmgray">Report Name:</span>
                      <span className="font-bold text-charcoal">{reportName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-warmgray">Selected Metrics:</span>
                      <span className="font-bold text-charcoal">
                        {selectedMetrics.map(m => (t.metrics as any)[m]).join(', ')}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-warmgray">Slice Dimensions:</span>
                      <span className="font-bold text-royalemerald font-mono">
                        {selectedDimensions.map(d => (t.dimensions as any)[d]).join(' & ')}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-warmgray">Date Window:</span>
                      <span className="font-bold text-antiquegold">
                        {(t.dateRanges as any)[dateRange]}
                      </span>
                    </div>

                    <div className="flex justify-between border-t border-[rgba(184,135,61,0.1)] pt-2 mt-2">
                      <span className="text-warmgray">Delivery Schedule:</span>
                      <span className="font-bold text-charcoal">
                        {(t.frequencies as any)[scheduleFrequency]}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-warmgray">Channel:</span>
                      <span className="font-bold text-charcoal">
                        {(t.channels as any)[deliveryChannel]}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* BACK / NEXT NAVIGATION ACTIONS (Wizard requirement: Back and Next always visible) */}
            <div className="pt-5 border-t border-[rgba(184,135,61,0.08)] flex justify-between gap-3">
              <Button 
                variant="secondary" 
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-1 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {t.prevBtn}
              </Button>

              {currentStep < 5 ? (
                <Button 
                  variant="primary" 
                  onClick={handleNextStep}
                  className="flex items-center gap-1 text-xs"
                >
                  {t.nextBtn}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleSaveReport}
                    disabled={isSaving}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {t.saveBtn}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW CHART & TABLE (Col Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 bg-white border-royalemerald/10 space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[rgba(184,135,61,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-royalemerald" />
                <h3 className="font-serif text-sm font-bold text-charcoal">{t.livePreview}</h3>
              </div>
              <span className="text-[10px] bg-royalemerald/10 text-royalemerald font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Ad Hoc Graph Preview
              </span>
            </div>

            {/* RECHARTS COMPONENT */}
            <div className="h-[240px] w-full">
              {showIncompatibilityWarning ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-alabaster border border-dashed border-error/20 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-error mb-2" />
                  <p className="text-xs font-bold text-charcoal">Compatibility Lock Active</p>
                  <p className="text-[10px] text-warmgray max-w-sm mt-1 leading-normal">Selected dimensions cannot be merged with metrics directly. Adjust metric categories or slices on the left.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={previewData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B8873D" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#B8873D" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE9" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#2A2723" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#2A2723" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #EFECE6', borderRadius: '12px', fontSize: '11px' }} />
                    <Area 
                      type="monotone" 
                      dataKey={Object.keys(previewData[0] || {}).find(k => k !== 'name') || ''} 
                      stroke="#B8873D" 
                      fillOpacity={1} 
                      fill="url(#colorMetric)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* TABULAR VIEW OF LIVE LEDGER (Wizard Layout Requirement) */}
            <div className="overflow-x-auto rounded-xl border border-[rgba(184,135,61,0.08)] bg-[#FAF9F5]">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="bg-alabaster border-b border-[rgba(184,135,61,0.08)] text-[10px] text-warmgray font-bold uppercase tracking-wider">
                    <th className="p-3">Dimension Slices</th>
                    {selectedMetrics.map(m => (
                      <th key={m} className="p-3 text-right">{(t.metrics as any)[m]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(184,135,61,0.05)]">
                  {previewData.map((row, index) => (
                    <tr key={index} className="hover:bg-white/50">
                      <td className="p-3 font-bold text-charcoal">{row.name}</td>
                      {selectedMetrics.map(m => {
                        const cellVal = row[(t.metrics as any)[m]];
                        const formatted = typeof cellVal === 'number' && m.includes('cost') || m.includes('revenue') 
                          ? `₹${cellVal.toLocaleString()}` 
                          : cellVal;
                        return (
                          <td key={m} className="p-3 text-right font-mono font-bold text-charcoal">
                            {formatted ?? '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </Card>
        </div>

      </div>

      {/* SAVED REPORT TEMPLATES GRID */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-bold text-charcoal">{t.savedTemplates}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedReports.length === 0 ? (
            <Card className="col-span-full p-8 text-center text-warmgray border-dashed border border-[rgba(184,135,61,0.15)]">
              {t.noReports}
            </Card>
          ) : (
            savedReports.map((report) => (
              <Card key={report.id} className="p-4 bg-white border-antiquegold/10 space-y-3 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-mono text-[9px] font-bold text-warmgray">{report.id}</span>
                    <span className="bg-royalemerald/10 text-royalemerald text-[8px] font-bold px-1.5 py-0.5 rounded border border-royalemerald/25 uppercase">
                      {report.frequency}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-charcoal leading-tight">
                    {report.name}
                  </h4>

                  <p className="text-[10px] text-warmgray leading-relaxed font-semibold">
                    Metrics: <span className="text-charcoal">{report.metrics.map(m => (t.metrics as any)[m] || m).join(', ')}</span>
                  </p>
                  <p className="text-[10px] text-warmgray leading-relaxed font-semibold">
                    Dimensions: <span className="text-royalemerald font-mono">{report.dimensions.map(d => (t.dimensions as any)[d] || d).join(', ')}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-[rgba(184,135,61,0.05)] flex justify-between items-center">
                  <span className="text-[9px] text-warmgray font-semibold">
                    Route: <span className="font-bold text-charcoal">{report.deliveryChannel}</span>
                  </span>

                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        setReportName(report.name);
                        setSelectedMetrics(report.metrics);
                        setSelectedDimensions(report.dimensions);
                        setDateRange(report.dateRange);
                        setScheduleFrequency(report.frequency);
                        setDeliveryChannel(report.deliveryChannel);
                        setCurrentStep(5);
                        setMaxCompletedStep(5);
                      }}
                      className="p-1 text-royalemerald hover:bg-royalemerald/5 rounded"
                      title="Load Config template"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTemplate(report.id)}
                      className="p-1 text-error hover:bg-error/5 rounded"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
