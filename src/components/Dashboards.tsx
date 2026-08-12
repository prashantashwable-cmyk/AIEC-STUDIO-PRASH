import React, { useState, useEffect, useRef } from 'react';
import { User, Lead, Deal, Job, Payment, Supplier, LeadStage } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button, Badge, AscensionLine } from './Common';
import { CameraCapture } from './CameraCapture';
import { GeminiMapsTool, GeminiImageTool } from './GeminiTools';
import { 
  Building, Map, Activity, Users, PlusCircle, CheckSquare, 
  IndianRupee, ChevronRight, MapPin, Truck, AlertTriangle, 
  Settings, Award, Sparkles, UserCheck, CheckCircle, RefreshCw, FileText, Compass, Globe,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar, Filter, Info, Percent, AlertCircle, Phone, Play, Clock, Smile,
  Camera, RotateCcw, Check, Trash2, ShieldCheck, Wifi, WifiOff, Upload, CreditCard, Search, Lock
} from 'lucide-react';
import { useLanguage } from '../lib/language';
import { motion } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';

// Shaft Photo Annotation / Blueprint Sketch tool using HTML5 Canvas
const ShaftSketchpad = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#B8873D'); // Default Gold
  const [brushSize] = useState(3);
  const [bgType, setBgType] = useState<'blueprint' | 'plain' | 'shaft'>('blueprint');

  // Draw grid background on canvas mount or change of background
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, type: 'blueprint' | 'plain' | 'shaft') => {
    ctx.clearRect(0, 0, width, height);
    if (type === 'plain') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    } else if (type === 'blueprint') {
      ctx.fillStyle = '#111827'; // Dark tech blue
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(184, 135, 61, 0.15)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw standard elevator circle outline
      ctx.strokeStyle = 'rgba(184, 135, 61, 0.4)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 60, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = 'rgba(184, 135, 61, 0.7)';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.fillText("ESTIMATED SHAFT OUTLINE (2D PLAN)", 20, 25);
    } else if (type === 'shaft') {
      ctx.fillStyle = '#F4F4F5';
      ctx.fillRect(0, 0, width, height);
      
      // Draw simulated shaft opening
      ctx.strokeStyle = '#2A2723';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 30, width - 80, height - 60);

      // Doors
      ctx.fillStyle = '#E4E4E7';
      ctx.fillRect(80, height - 40, width - 160, 10);
      
      ctx.fillStyle = '#71717A';
      ctx.font = '10px sans-serif';
      ctx.fillText("SHAFT FRONT OPENING PROFILE", 50, 50);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawBackground(ctx, canvas.width, canvas.height, bgType);
    if (value) {
      const img = new Image();
      img.src = value;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [bgType]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawBackground(ctx, canvas.width, canvas.height, bgType);
    onChange('');
  };

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center bg-[#F8F6F1] p-2 rounded-xl border border-[rgba(184,135,61,0.15)] text-xs">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setBgType('blueprint')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${bgType === 'blueprint' ? 'bg-antiquegold text-white' : 'bg-white border text-charcoal hover:bg-white/80'}`}
          >
            Blueprint 2D
          </button>
          <button
            type="button"
            onClick={() => setBgType('shaft')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${bgType === 'shaft' ? 'bg-antiquegold text-white' : 'bg-white border text-charcoal hover:bg-white/80'}`}
          >
            Front Elevation
          </button>
          <button
            type="button"
            onClick={() => setBgType('plain')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${bgType === 'plain' ? 'bg-antiquegold text-white' : 'bg-white border text-charcoal hover:bg-white/80'}`}
          >
            Whiteboard
          </button>
        </div>

        <div className="flex gap-1.5 items-center">
          <span className="text-[10px] font-mono font-bold text-warmgray">COLOR:</span>
          {['#B8873D', '#0E4B3D', '#2A2723', '#EF4444'].map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-4 h-4 rounded-full border shrink-0 transition-all ${color === c ? 'border-antiquegold ring-2 ring-antiquegold/40 scale-110' : 'border-white'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="relative border border-[rgba(184,135,61,0.15)] rounded-2xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-[180px] block cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <button
          type="button"
          onClick={clearCanvas}
          className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-white hover:bg-alabaster text-[9px] text-error border border-[rgba(239,68,68,0.2)] shadow rounded-lg uppercase tracking-wider font-extrabold transition-all"
        >
          Reset Sketch
        </button>
      </div>
    </div>
  );
};

// Trilingual Localization dictionary specifically for the Executive KPI Cockpit
const kpiLocalizations = {
  en: {
    title: "Executive KPI Cockpit",
    subtitle: "Real-Time Enterprise Telemetry & Bottleneck Analysis",
    allTime: "All-Time",
    today: "Today",
    week: "This Week",
    month: "This Month",
    quarter: "This Quarter",
    custom: "Custom Range",
    startDate: "Start Date",
    endDate: "End Date",
    refreshing: "Refreshed live...",
    noDataYet: "No data yet",
    smallSample: "Low base volume",
    lowBaseWarning: "The trend shows a high percentage swing due to small base numbers.",
    customRangeWarning: "Warning: date range crosses fiscal year boundary. Ledger consolidated correctly.",
    thickestPoint: "Thickest Funnel Node",
    thinnestPoint: "Thinnest Bottle-Neck",
    bottleneckDesc: "This stage has the largest percentage drop-off or lowest conversion. Needs immediate management intervention.",
    
    // Cards
    leadsLabel: "Leads Captured",
    conversionLabel: "SOP Win Rate",
    revenueLabel: "Revenue Booked",
    marginLabel: "Gross Margin %",
    installationsLabel: "Active Installs",
    overdueLabel: "Overdue Payments",
    
    // Details Modals
    transactionLedger: "Transaction Level Ledger",
    closeDetails: "Close View",
    leadName: "Lead Name",
    address: "Site Address",
    stage: "Current Stage",
    created: "Captured On",
    dealValue: "Deal Value",
    marginDetails: "Margin Breakdown",
    materialCost: "Material Cost (Est. 62%)",
    commission: "Surveyor Commission",
    techCost: "Technician SOP Wage",
    netProfit: "Net Profit Margin",
    assignedTech: "Assigned Technician",
    completedSteps: "SOP Progression",
    dueDate: "Due Date",
    daysOverdue: "Days Overdue",
    nudgeClient: "Simulate WhatsApp Nudge",
    nudgeSuccess: "WhatsApp payment reminder notification sequence triggered!",
    
    // Funnel Steps
    funnelCaptured: "Leads Logged",
    funnelSurvey: "Site Survey Done",
    funnelQuoted: "Commercial Quote",
    funnelWon: "Deal Signed (Won)",
    funnelAdvance: "Advance Cleared (30%)",
    funnelMaterial: "Material Dispatched (40%)",
    funnelInstallation: "Installation Underway",
    funnelPaid: "Fully Capitalized",

    // New Lead Dialog
    addNewLeadTitle: "Register New Lead Node",
    clientName: "Client Name",
    phoneNumber: "Contact Number",
    buildingAddress: "Site Address",
    totalFloors: "Total Floors",
    propertyType: "Property Type",
    residential: "Residential Structure",
    commercial: "Commercial Structure",
    submitLead: "Provision Lead Node"
  },
  mr: {
    title: "कार्यकारी केपीआय कॉकपीट",
    subtitle: "रिअल-टाइम व्यवसाय विश्लेषण आणि अडथळे तपासणी",
    allTime: "सर्व वेळ",
    today: "आज",
    week: "या आठवड्यात",
    month: "या महिन्यात",
    quarter: "या तिमाहीत",
    custom: "सानुकूल तारीख",
    startDate: "सुरुवात तारीख",
    endDate: "शेवट तारीख",
    refreshing: "थेट अद्यतनित...",
    noDataYet: "अजून माहिती उपलब्ध नाही",
    smallSample: "कमी मूळ संख्या",
    lowBaseWarning: "कमी मूळ संख्येमुळे ट्रेंडमध्ये मोठी टक्केवारी बदल दिसत आहे.",
    customRangeWarning: "तारीख श्रेणी आर्थिक वर्षाची सीमा ओलांडत आहे. लेजर अचूकपणे एकत्रित केले आहे.",
    thickestPoint: "सर्वात मोठा टप्पा (Thickest)",
    thinnestPoint: "सर्वात अरुंद टप्पा (Bottleneck)",
    bottleneckDesc: "या टप्प्यात सर्वात जास्त घट किंवा सर्वात कमी रूपांतरण आहे. त्वरित लक्ष देणे आवश्यक आहे.",
    
    // Cards
    leadsLabel: "लीड्स कॅप्चर केले",
    conversionLabel: "एसओपी यश दर",
    revenueLabel: "एकत्रित महसूल",
    marginLabel: "एकूण नफा टक्केवारी",
    installationsLabel: "सक्रिय इन्स्टॉलेशन्स",
    overdueLabel: "थकीत देयके",
    
    // Details Modals
    transactionLedger: "व्यवहार पातळीवरील लेजर",
    closeDetails: "बंद करा",
    leadName: "ग्राहकाचे नाव",
    address: "साइटचा पत्ता",
    stage: "सध्याचा टप्पा",
    created: "नोंदणी तारीख",
    dealValue: "कराराचे मूल्य",
    marginDetails: "नफा तपशील",
    materialCost: "साहित्य खर्च (अंदाजे ६२%)",
    commission: "सर्वेक्षक कमिशन",
    techCost: "तंत्रज्ञ एसओपी वेतन",
    netProfit: "निव्वळ नफा मार्जिन",
    assignedTech: "नियुक्त तंत्रज्ञ",
    completedSteps: "एसओपी प्रगती",
    dueDate: "देय तारीख",
    daysOverdue: "विलंब दिवस",
    nudgeClient: "व्हॉट्सॲप मेसेज पाठवा",
    nudgeSuccess: "व्हॉट्सॲप पेमेंट रिमाइंडर मेसेज पाठवला आहे!",
    
    // Funnel Steps
    funnelCaptured: "लीड्स नोंदवले",
    funnelSurvey: "साइट सर्वेक्षण पूर्ण",
    funnelQuoted: "कोटेशन पाठवले",
    funnelWon: "करार स्वाक्षरित",
    funnelAdvance: "ॲडव्हान्स जमा (३०%)",
    funnelMaterial: "साहित्य रवाना (४०%)",
    funnelInstallation: "इन्स्टॉलेशन सुरू",
    funnelPaid: "पूर्ण महसूल प्राप्त",

    // New Lead Dialog
    addNewLeadTitle: "नवीन ग्राहक नोंदणी",
    clientName: "ग्राहकाचे नाव",
    phoneNumber: "संपर्क क्रमांक",
    buildingAddress: "पत्ता",
    totalFloors: "एकूण मजले",
    propertyType: "इमारत प्रकार",
    residential: "निवासी",
    commercial: "व्यावसायिक",
    submitLead: "नोंदणी सबमिट करा"
  },
  hi: {
    title: "कार्यकारी केपीआई कॉकपिट",
    subtitle: "वास्तविक समय व्यावसायिक विश्लेषण एवं बाधा निगरानी",
    allTime: "कुल समय",
    today: "आज",
    week: "इस सप्ताह",
    month: "इस महीने",
    quarter: "इस तिमाही",
    custom: "कस्टम तिथि",
    startDate: "आरंभ तिथि",
    endDate: "समाप्ति तिथि",
    refreshing: "सीधा अपडेट...",
    noDataYet: "अभी कोई डेटा उपलब्ध नहीं है",
    smallSample: "कम आधार संख्या",
    lowBaseWarning: "कम आधार संख्या के कारण ट्रेंड में बड़ा उतार-चढ़ाव दिखाई दे रहा है।",
    customRangeWarning: "चेतावनी: तिथि सीमा वित्तीय वर्ष की सीमा को पार कर रही है। बहीखाता सही ढंग से समेकित है।",
    thickestPoint: "सबसे बड़ा चरण (Thickest)",
    thinnestPoint: "सबसे संकीर्ण चरण (Bottleneck)",
    bottleneckDesc: "इस चरण में सबसे अधिक गिरावट या सबसे कम रूपांतरण है। तत्काल ध्यान देने की आवश्यकता है।",
    
    // Cards
    leadsLabel: "लीड्स कैप्चर किए",
    conversionLabel: "एसओपी सफलता दर",
    revenueLabel: "बुक किया गया राजस्व",
    marginLabel: "सकल लाभ मार्जिन",
    installationsLabel: "सक्रिय इंस्टॉलेशन",
    overdueLabel: "अतिदेय भुगतान (Overdue)",
    
    // Details Modals
    transactionLedger: "लेनदेन स्तर का बहीखाता",
    closeDetails: "बंद करें",
    leadName: "ग्राहक का नाम",
    address: "साइट का पता",
    stage: "वर्तमान चरण",
    created: "पंजीकरण तिथि",
    dealValue: "सौदा मूल्य",
    marginDetails: "मार्जिन विवरण",
    materialCost: "सामग्री लागत (अनुमानित 62%)",
    commission: "सर्वेक्षक कमीशन",
    techCost: "तकनीशियन एसओपी वेतन",
    netProfit: "शुद्ध लाभ मार्जिन",
    assignedTech: "नियुक्त तकनीशियन",
    completedSteps: "एसओपी प्रगति",
    dueDate: "देय तिथि",
    daysOverdue: "देरी के दिन",
    nudgeClient: "व्हाट्सएप संदेश भेजें",
    nudgeSuccess: "व्हाट्सएप भुगतान अनुस्मारक अनुक्रम सफलतापूर्वक सक्रिय किया गया!",
    
    // Funnel Steps
    funnelCaptured: "लीड्स पंजीकृत",
    funnelSurvey: "साइट सर्वेक्षण पूर्ण",
    funnelQuoted: "व्यावसायिक कोट",
    funnelWon: "सौदा जीता",
    funnelAdvance: "अग्रिम भुगतान (30%)",
    funnelMaterial: "सामग्री प्रेषित (40%)",
    funnelInstallation: "स्थापना प्रगति पर",
    funnelPaid: "पूर्ण भुगतान प्राप्त",

    // New Lead Dialog
    addNewLeadTitle: "नई लीड पंजीकृत करें",
    clientName: "ग्राहक का नाम",
    phoneNumber: "संपर्क नंबर",
    buildingAddress: "साइट का पता",
    totalFloors: "कुल मंजिल",
    propertyType: "संपत्ति का प्रकार",
    residential: "आवासीय",
    commercial: "व्यावसायिक",
    submitLead: "लीड सबमिट करें"
  }
};

// =========================================================
// 1. ADMIN DASHBOARD (EXECUTIVE KPI COCKPIT)
// =========================================================
export const AdminDashboard: React.FC<{ user: User }> = ({ user }) => {
  const { language } = useLanguage();
  const activeLang: 'en' | 'mr' | 'hi' = (language === 'mr' || language === 'hi' || language === 'en') ? language : 'en';
  const lt = kpiLocalizations[activeLang];

  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  
  // Date-Range Selector State
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'custom'>('month');
  const [customStart, setCustomStart] = useState<string>('2026-06-15');
  const [customEnd, setCustomEnd] = useState<string>('2026-07-15');
  
  // Skeletons/Refresh Indicator State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  
  // Overlay details drawer
  const [activeDetailKpi, setActiveDetailKpi] = useState<'leads' | 'conversion' | 'revenue' | 'margin' | 'installations' | 'overdue' | null>(null);
  const [showAddLead, setShowAddLead] = useState<boolean>(false);
  const [nudgeToast, setNudgeToast] = useState<string>('');

  // Form fields for New Lead
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [floors, setFloors] = useState(4);
  const [buildingType, setBuildingType] = useState<'residential' | 'commercial'>('residential');

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [capturedCoords, setCapturedCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchAdminRealGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCapturedCoords({ latitude, longitude });
        try {
          const response = await fetch(`/api/maps/geocode?lat=${latitude}&lng=${longitude}`);
          if (response.ok) {
            const data = await response.json();
            setAddress(data.address || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
          } else {
            setAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)} (Accuracy: ±${accuracy.toFixed(1)}m)`);
          }
        } catch (err) {
          setAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)} (Accuracy: ±${accuracy.toFixed(1)}m)`);
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        let msg = "Failed to fetch GPS coordinates";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "GPS permission denied. Please allow location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "GPS position unavailable. Ensure device location is enabled.";
        } else if (error.code === error.TIMEOUT) {
          msg = "GPS request timed out. Please try again.";
        }
        setGpsError(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Trigger manual & simulated refresh transitions
  const triggerRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }, 400);
  };

  const refreshData = () => {
    setLeads(DbManager.getLeads());
    setDeals(DbManager.getDeals());
    setPayments(DbManager.getPayments());
    setUsers(DbManager.getUsers());
    setJobs(DbManager.getJobs());
  };

  useEffect(() => {
    refreshData();
    setLastRefreshed(new Date().toLocaleTimeString());
    window.addEventListener('aiec_db_update', refreshData);
    
    // Automated background refresh interval (every 2 minutes)
    const interval = setInterval(() => {
      refreshData();
      setLastRefreshed(new Date().toLocaleTimeString());
    }, 120000);

    return () => {
      window.removeEventListener('aiec_db_update', refreshData);
      clearInterval(interval);
    };
  }, []);

  // Whenever the period or custom range changes, trigger a beautiful load visual
  useEffect(() => {
    triggerRefresh();
  }, [period, customStart, customEnd]);

  // Date Range calculation logic
  const now = new Date('2026-07-09T02:20:27-07:00');

  const getDateRanges = () => {
    let startDate = new Date(now);
    let endDate = new Date(now);

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        startDate = customStart ? new Date(customStart) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate = customEnd ? new Date(customEnd) : new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
    }
    
    // Calculate the length of the period to get previous range boundaries
    const lengthMs = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - lengthMs);

    return { startDate, endDate, prevStartDate, prevEndDate };
  };

  const { startDate, endDate, prevStartDate, prevEndDate } = getDateRanges();

  // Check fiscal boundary crossing
  const isFiscalCrossing = () => {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    if (startYear !== endYear) return true;
    const aprilFirst = new Date(startYear, 3, 1);
    return startDate < aprilFirst && endDate >= aprilFirst;
  };

  // Indian format Lakh/Crore aware helper
  const formatCurrency = (amount: number) => {
    if (amount === 0) return '₹0';
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // ---------------------------------------------------------
  // KPI CALCULATIONS
  // ---------------------------------------------------------

  // 1. Leads
  const leadsInRange = leads.filter(l => {
    const d = new Date(l.createdAt);
    return d >= startDate && d <= endDate;
  });
  const prevLeadsInRange = leads.filter(l => {
    const d = new Date(l.createdAt);
    return d >= prevStartDate && d <= prevEndDate;
  });

  // 2. Win rate / Conversion (based on Leads created in that range that have won)
  const leadsWonInRange = leadsInRange.filter(l => l.stage === 'closed_won' || deals.some(d => d.leadId === l.id));
  const conversionRate = leadsInRange.length > 0 ? (leadsWonInRange.length / leadsInRange.length) * 100 : null;

  const prevLeadsWonInRange = prevLeadsInRange.filter(l => l.stage === 'closed_won' || deals.some(d => d.leadId === l.id));
  const prevConversionRate = prevLeadsInRange.length > 0 ? (prevLeadsWonInRange.length / prevLeadsInRange.length) * 100 : null;

  // 3. Revenue Booked (sum of agreed Prices of deals signed in that range)
  const dealsInRange = deals.filter(d => {
    const dt = new Date(d.createdAt);
    return dt >= startDate && dt <= endDate;
  });
  const prevDealsInRange = deals.filter(d => {
    const dt = new Date(d.createdAt);
    return dt >= prevStartDate && dt <= prevEndDate;
  });
  const revenueBooked = dealsInRange.reduce((sum, d) => sum + d.agreedPrice, 0);
  const prevRevenueBooked = prevDealsInRange.reduce((sum, d) => sum + d.agreedPrice, 0);

  // 4. Gross Margin % (simulated profit margins of won deals in that range)
  // Formula: profit margin = AgreedPrice - MaterialCost (62%) - Surveyor Commission (25,000) - Technician wage (15,000)
  const calculateMargin = (price: number) => {
    const material = price * 0.62;
    const comm = 25000;
    const tech = 15000;
    const profit = price - material - comm - tech;
    return { material, comm, tech, profit, marginPct: (profit / price) * 100 };
  };

  const totalProfitInRange = dealsInRange.reduce((sum, d) => sum + calculateMargin(d.agreedPrice).profit, 0);
  const grossMargin = revenueBooked > 0 ? (totalProfitInRange / revenueBooked) * 100 : null;

  const prevTotalProfitInRange = prevDealsInRange.reduce((sum, d) => sum + calculateMargin(d.agreedPrice).profit, 0);
  const prevGrossMargin = prevRevenueBooked > 0 ? (prevTotalProfitInRange / prevRevenueBooked) * 100 : null;

  // 5. Active Installations (jobs in progress or QC pending during period)
  const installationsInRange = jobs.filter(j => 
    (j.status === 'in_progress' || j.status === 'qc_pending') && 
    (!j.startedAt || new Date(j.startedAt) <= endDate)
  );
  const prevInstallationsInRange = jobs.filter(j => 
    (j.status === 'in_progress' || j.status === 'qc_pending') && 
    (!j.startedAt || new Date(j.startedAt) <= prevEndDate)
  );

  // 6. Overdue Payments (unpaid payments past due dates as of end of period)
  const overduePayments = payments.filter(p => 
    (p.status === 'unpaid' || p.status === 'pending') && 
    new Date(p.dueDate) < endDate
  );
  const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  const prevOverduePayments = payments.filter(p => {
    const isPastDue = new Date(p.dueDate) < prevEndDate;
    const wasUnpaid = p.status === 'unpaid' || p.status === 'pending' || (p.paidAt && new Date(p.paidAt) > prevEndDate);
    return isPastDue && wasUnpaid;
  });
  const prevOverdueAmount = prevOverduePayments.reduce((sum, p) => sum + p.amount, 0);

  // Helper to compute trend percentages and arrow states safely
  const getTrendData = (current: number | null, previous: number | null, isLowerBetter: boolean = false) => {
    if (current === null || previous === null) return { formatted: lt.noDataYet, direction: 'flat' as const, isGood: true, warning: false };
    if (previous === 0 && current === 0) return { formatted: '0%', direction: 'flat' as const, isGood: true, warning: false };
    if (previous === 0) return { formatted: '+100%', direction: 'up' as const, isGood: !isLowerBetter, warning: true };

    const pct = ((current - previous) / previous) * 100;
    const isUp = pct > 0.05;
    const isDown = pct < -0.05;
    
    let direction: 'up' | 'down' | 'flat' = 'flat';
    if (isUp) direction = 'up';
    if (isDown) direction = 'down';

    const isGood = isLowerBetter ? (direction === 'down') : (direction === 'up');

    return {
      formatted: `${direction === 'up' ? '+' : ''}${pct.toFixed(0)}%`,
      direction,
      isGood,
      warning: previous < 3 || current < 3 // High swings from low sample base trigger a warning caveat
    };
  };

  const leadsTrend = getTrendData(leadsInRange.length, prevLeadsInRange.length);
  const conversionTrend = getTrendData(conversionRate, prevConversionRate);
  const revenueTrend = getTrendData(revenueBooked, prevRevenueBooked);
  const marginTrend = getTrendData(grossMargin, prevGrossMargin);
  const installTrend = getTrendData(installationsInRange.length, prevInstallationsInRange.length);
  const overdueTrend = getTrendData(overdueAmount, prevOverdueAmount, true); // Overdue is better when lower

  // ---------------------------------------------------------
  // FUNNEL CALCULATION
  // ---------------------------------------------------------
  const funnelSteps = [
    { 
      label: lt.funnelCaptured, 
      count: leads.length,
      icon: PlusCircle
    },
    { 
      label: lt.funnelSurvey, 
      count: siteVisitsDoneCount(),
      icon: MapPin
    },
    { 
      label: lt.funnelQuoted, 
      count: leads.filter(l => ['quoted', 'negotiating', 'closed_won'].includes(l.stage)).length,
      icon: FileText
    },
    { 
      label: lt.funnelWon, 
      count: deals.length,
      icon: Award
    },
    { 
      label: lt.funnelAdvance, 
      count: payments.filter(p => p.stage.includes('Advance') && p.status === 'paid').length,
      icon: IndianRupee
    },
    { 
      label: lt.funnelMaterial, 
      count: payments.filter(p => p.stage.includes('Material') && p.status === 'paid').length,
      icon: Truck
    },
    { 
      label: lt.funnelInstallation, 
      count: jobs.filter(j => j.status === 'in_progress' || j.status === 'qc_pending').length,
      icon: CheckSquare
    },
    { 
      label: lt.funnelPaid, 
      count: deals.filter(d => {
        const dPayments = payments.filter(p => p.dealId === d.id);
        return dPayments.length > 0 && dPayments.every(p => p.status === 'paid');
      }).length,
      icon: CheckCircle
    }
  ];

  function siteVisitsDoneCount() {
    const visits = DbManager.getSiteVisits();
    return Array.from(new Set(visits.map(v => v.leadId))).length;
  }

  // Find Thickest Funnel Node & Thinnest (Bottleneck)
  const getFunnelMetrics = () => {
    let thickestIdx = 0;
    let maxCount = 0;
    let thinnestIdx = -1;
    let lowestRatio = 1.0; // Perfect 100% conversion is 1.0. We want to find the lowest ratio

    funnelSteps.forEach((step, i) => {
      if (step.count > maxCount) {
        maxCount = step.count;
        thickestIdx = i;
      }

      if (i > 0) {
        const prevCount = funnelSteps[i - 1].count;
        if (prevCount > 0) {
          const ratio = step.count / prevCount;
          if (ratio < lowestRatio && step.count > 0) {
            lowestRatio = ratio;
            thinnestIdx = i;
          }
        }
      }
    });

    return { 
      thickest: funnelSteps[thickestIdx], 
      thinnest: thinnestIdx !== -1 ? funnelSteps[thinnestIdx] : null 
    };
  };

  const { thickest, thinnest } = getFunnelMetrics();

  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !address) return;

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      stage: 'captured',
      surveyorId: 'amit_sharma',
      contactInfo: {
        name: clientName,
        phone: clientPhone,
        email: `${clientName.toLowerCase().replace(/\s+/g, '')}@gmail.com`
      },
      buildingInfo: {
        address,
        floors,
        type: buildingType,
        latitude: capturedCoords ? capturedCoords.latitude : 18.52 + Math.random() * 0.05,
        longitude: capturedCoords ? capturedCoords.longitude : 73.85 + Math.random() * 0.05
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    DbManager.addLead(newLead);
    setClientName('');
    setClientPhone('');
    setAddress('');
    setFloors(4);
    setCapturedCoords(null);
    setGpsError(null);
    setShowAddLead(false);
    triggerRefresh();
  };

  const triggerNudge = (clientPhone: string) => {
    setNudgeToast(lt.nudgeSuccess);
    setTimeout(() => setNudgeToast(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------
          HEADER & REAL-TIME REFRESH METRICS
          --------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[rgba(184,135,61,0.15)] shadow-xs relative overflow-hidden">
        {/* Subtle background graphic for the premium Ascension Line brand */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-antiquegold/5 to-transparent pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-royalemerald animate-ping" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-royalemerald font-extrabold">Enterprise HQ Telemetry</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal mt-1">{lt.title}</h2>
          <p className="text-xs text-warmgray mt-0.5">{lt.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)] text-[10px] font-mono font-bold text-warmgray">
            <Clock className="w-3.5 h-3.5 text-antiquegold" />
            <span>{lastRefreshed ? `Refreshed: ${lastRefreshed}` : lt.refreshing}</span>
          </div>
          <Button variant="secondary" className="p-2 border-[rgba(184,135,61,0.15)] bg-white text-charcoal shadow-xs hover:bg-alabaster" onClick={triggerRefresh}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="primary" className="py-2 px-4 text-xs font-bold bg-[#1a1100] text-[#FFF5C6] hover:bg-[#2e1f02]" onClick={() => setShowAddLead(true)}>
            <PlusCircle className="w-4 h-4" />
            <span>{lt.leadsLabel.split(' ')[0]}</span>
          </Button>
        </div>
      </div>

      {/* ---------------------------------------------------------
          DATE-RANGE SELECTOR BAR WITH FISCAL CROSSING DETECTION
          --------------------------------------------------------- */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-antiquegold" />
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-charcoal">Consolidation Period</h4>
          </div>
          <div className="flex flex-wrap gap-1 bg-alabaster p-1 rounded-2xl border border-[rgba(184,135,61,0.08)]">
            {(['today', 'week', 'month', 'quarter', 'custom'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`py-2 px-3 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                  period === p
                    ? 'bg-antiquegold text-white shadow-xs font-extrabold'
                    : 'text-warmgray hover:text-charcoal'
                }`}
              >
                {p === 'today' ? lt.today : p === 'week' ? lt.week : p === 'month' ? lt.month : p === 'quarter' ? lt.quarter : lt.custom}
              </button>
            ))}
          </div>
        </div>

        {period === 'custom' && (
          <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.08)] grid grid-cols-2 gap-4 max-w-md animate-slideDown">
            <div>
              <label className="block text-[10px] uppercase font-bold text-warmgray mb-1">{lt.startDate}</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-bold font-mono focus:ring-1 focus:ring-antiquegold"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-warmgray mb-1">{lt.endDate}</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-bold font-mono focus:ring-1 focus:ring-antiquegold"
              />
            </div>
          </div>
        )}

        {/* Fiscal Boundary Alert */}
        {isFiscalCrossing() && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-2xl text-[11px] text-charcoal font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-antiquegold animate-pulse" />
            <span>{lt.customRangeWarning}</span>
          </div>
        )}
      </Card>

      {/* ---------------------------------------------------------
          TOP-LINE EXECUTIVE KPI CARDS (6 CARDS WITH TRENDS)
          --------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Leads */}
        <Card 
          onClick={() => setActiveDetailKpi('leads')}
          className="p-5 flex flex-col justify-between min-h-[135px] cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-warmgray block">{lt.leadsLabel}</span>
            <div className="w-7 h-7 rounded-lg bg-antiquegold/10 text-antiquegold flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-serif text-3xl font-bold text-charcoal">{isLoading ? '...' : leadsInRange.length}</h3>
            
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`flex items-center gap-0.5 text-xs font-bold ${leadsTrend.direction === 'flat' ? 'text-warmgray' : leadsTrend.isGood ? 'text-success' : 'text-error'}`}>
                {leadsTrend.direction === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : leadsTrend.direction === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                <span className="font-mono">{leadsTrend.formatted}</span>
              </span>
              {leadsTrend.warning && (
                <span className="text-[9px] font-bold text-antiquegold px-1.5 py-0.2 bg-antiquegold/10 rounded-md" title={lt.lowBaseWarning}>
                  {lt.smallSample}
                </span>
              )}
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-bold text-antiquegold opacity-0 group-hover:opacity-100 transition-opacity">Ledger →</span>
        </Card>

        {/* Card 2: Conversion Rate */}
        <Card 
          onClick={() => setActiveDetailKpi('conversion')}
          className="p-5 flex flex-col justify-between min-h-[135px] cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-warmgray block">{lt.conversionLabel}</span>
            <div className="w-7 h-7 rounded-lg bg-royalemerald/10 text-royalemerald flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-serif text-3xl font-bold text-charcoal">
              {isLoading ? '...' : conversionRate !== null ? `${conversionRate.toFixed(0)}%` : lt.noDataYet}
            </h3>
            
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`flex items-center gap-0.5 text-xs font-bold ${conversionTrend.direction === 'flat' ? 'text-warmgray' : conversionTrend.isGood ? 'text-success' : 'text-error'}`}>
                {conversionTrend.direction === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : conversionTrend.direction === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                <span className="font-mono">{conversionTrend.formatted}</span>
              </span>
              {conversionTrend.warning && conversionRate !== null && (
                <span className="text-[9px] font-bold text-antiquegold px-1.5 py-0.2 bg-antiquegold/10 rounded-md">
                  {lt.smallSample}
                </span>
              )}
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-bold text-antiquegold opacity-0 group-hover:opacity-100 transition-opacity">Ledger →</span>
        </Card>

        {/* Card 3: Revenue Booked */}
        <Card 
          onClick={() => setActiveDetailKpi('revenue')}
          className="p-5 flex flex-col justify-between min-h-[135px] cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-warmgray block">{lt.revenueLabel}</span>
            <div className="w-7 h-7 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-mono text-xl font-extrabold text-charcoal leading-8">
              {isLoading ? '...' : formatCurrency(revenueBooked)}
            </h3>
            
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`flex items-center gap-0.5 text-xs font-bold ${revenueTrend.direction === 'flat' ? 'text-warmgray' : revenueTrend.isGood ? 'text-success' : 'text-error'}`}>
                {revenueTrend.direction === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : revenueTrend.direction === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                <span className="font-mono">{revenueTrend.formatted}</span>
              </span>
              {revenueTrend.warning && revenueBooked > 0 && (
                <span className="text-[9px] font-bold text-antiquegold px-1.5 py-0.2 bg-antiquegold/10 rounded-md">
                  {lt.smallSample}
                </span>
              )}
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-bold text-antiquegold opacity-0 group-hover:opacity-100 transition-opacity">Ledger →</span>
        </Card>

        {/* Card 4: Gross Margin */}
        <Card 
          onClick={() => setActiveDetailKpi('margin')}
          className="p-5 flex flex-col justify-between min-h-[135px] cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-warmgray block">{lt.marginLabel}</span>
            <div className="w-7 h-7 rounded-lg bg-royalemerald/10 text-royalemerald flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-serif text-3xl font-bold text-charcoal">
              {isLoading ? '...' : grossMargin !== null ? `${grossMargin.toFixed(1)}%` : lt.noDataYet}
            </h3>
            
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`flex items-center gap-0.5 text-xs font-bold ${marginTrend.direction === 'flat' ? 'text-warmgray' : marginTrend.isGood ? 'text-success' : 'text-error'}`}>
                {marginTrend.direction === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : marginTrend.direction === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                <span className="font-mono">{marginTrend.formatted}</span>
              </span>
              {marginTrend.warning && grossMargin !== null && (
                <span className="text-[9px] font-bold text-antiquegold px-1.5 py-0.2 bg-antiquegold/10 rounded-md">
                  {lt.smallSample}
                </span>
              )}
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-bold text-antiquegold opacity-0 group-hover:opacity-100 transition-opacity">Ledger →</span>
        </Card>

        {/* Card 5: Active Installations */}
        <Card 
          onClick={() => setActiveDetailKpi('installations')}
          className="p-5 flex flex-col justify-between min-h-[135px] cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-warmgray block">{lt.installationsLabel}</span>
            <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 text-[#B8873D] flex items-center justify-center shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-serif text-3xl font-bold text-charcoal">{isLoading ? '...' : installationsInRange.length}</h3>
            
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`flex items-center gap-0.5 text-xs font-bold ${installTrend.direction === 'flat' ? 'text-warmgray' : installTrend.isGood ? 'text-success' : 'text-error'}`}>
                {installTrend.direction === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : installTrend.direction === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                <span className="font-mono">{installTrend.formatted}</span>
              </span>
              {installTrend.warning && (
                <span className="text-[9px] font-bold text-antiquegold px-1.5 py-0.2 bg-antiquegold/10 rounded-md">
                  {lt.smallSample}
                </span>
              )}
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-bold text-antiquegold opacity-0 group-hover:opacity-100 transition-opacity">Ledger →</span>
        </Card>

        {/* Card 6: Overdue Payments */}
        <Card 
          onClick={() => setActiveDetailKpi('overdue')}
          className="p-5 flex flex-col justify-between min-h-[135px] border-error/20 bg-error/[0.02] cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-error block">{lt.overdueLabel}</span>
            <div className="w-7 h-7 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-mono text-xl font-extrabold text-error leading-8">
              {isLoading ? '...' : formatCurrency(overdueAmount)}
            </h3>
            
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`flex items-center gap-0.5 text-xs font-bold ${overdueTrend.direction === 'flat' ? 'text-warmgray' : overdueTrend.isGood ? 'text-success' : 'text-error'}`}>
                {overdueTrend.direction === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : overdueTrend.direction === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                <span className="font-mono">{overdueTrend.formatted}</span>
              </span>
              {overdueTrend.warning && overdueAmount > 0 && (
                <span className="text-[9px] font-bold text-antiquegold px-1.5 py-0.2 bg-antiquegold/10 rounded-md">
                  {lt.smallSample}
                </span>
              )}
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-bold text-error opacity-0 group-hover:opacity-100 transition-opacity">Ledger →</span>
        </Card>
      </div>

      {/* ---------------------------------------------------------
          COMBINED FUNNEL-TO-CASH VISUALIZATION (THE ASCENSION MOTIF)
          --------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal">Funnel-to-Cash Enterprise Flow</h3>
                <p className="text-xs text-warmgray mt-0.5">Physical lead capture converting into fully capitalized, quality-checked operational revenue.</p>
              </div>
              <Badge status="approved" className="bg-royalemerald/15 text-royalemerald font-bold" />
            </div>

            {/* Vertical Flow with structural Ascension gold rail */}
            <div className="space-y-4 relative pl-8 py-2">
              {/* Vertical Ascension gold rail */}
              <div className="absolute left-3.5 top-5 bottom-5 w-0.5 bg-[rgba(184,135,61,0.15)] flex flex-col justify-between py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-antiquegold -ml-0.5" />
                <div className="w-1.5 h-1.5 rounded-full bg-antiquegold -ml-0.5" />
              </div>

              {funnelSteps.map((step, idx) => {
                const Icon = step.icon;
                const isThickest = thickest && thickest.label === step.label;
                const isThinnest = thinnest && thinnest.label === step.label;
                
                // Calculate percentage relative to total leads
                const totalLeads = funnelSteps[0].count;
                const conversionPct = totalLeads > 0 ? (step.count / totalLeads) * 100 : 0;

                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all ${
                      isThickest 
                        ? 'bg-success/[0.02] border-success/30 shadow-xs' 
                        : isThinnest 
                          ? 'bg-[#B8873D]/5 border-antiquegold/30 shadow-xs ring-1 ring-antiquegold/10' 
                          : 'bg-alabaster/40 border-[rgba(184,135,61,0.08)]'
                    }`}
                  >
                    {/* Circle icon marker on the rail */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 -ml-[27px] transition-all ${
                      isThickest 
                        ? 'bg-success text-white ring-4 ring-success/20' 
                        : isThinnest 
                          ? 'bg-antiquegold text-white ring-4 ring-antiquegold/20 animate-pulse' 
                          : 'bg-white border border-[rgba(184,135,61,0.25)] text-warmgray'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-charcoal flex items-center gap-2">
                          <span>{step.label}</span>
                          {isThickest && (
                            <span className="text-[8px] font-extrabold uppercase font-mono bg-success/15 text-success px-1.5 py-0.2 rounded">
                              Thickest
                            </span>
                          )}
                          {isThinnest && (
                            <span className="text-[8px] font-extrabold uppercase font-mono bg-antiquegold/20 text-antiquegold px-1.5 py-0.2 rounded animate-pulse">
                              Bottleneck
                            </span>
                          )}
                        </h4>
                      </div>

                      {/* Bar graph representing proportion */}
                      <div className="w-full bg-alabaster rounded-full h-2 overflow-hidden border border-dashed border-[#e6dfd4]">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isThickest ? 'bg-success' : isThinnest ? 'bg-antiquegold' : 'bg-warmgray/40'}`} 
                          style={{ width: `${conversionPct}%` }}
                        />
                      </div>

                      <div className="text-right flex items-center justify-end gap-3">
                        <span className="font-mono text-xs font-extrabold text-charcoal">{step.count} items</span>
                        <span className="font-mono text-[10px] text-warmgray bg-white border border-[#e6dfd4] px-1.5 py-0.5 rounded-lg">
                          {conversionPct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Funnel intelligence summary card */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-charcoal">Conversion Insights</h4>
            
            {thickest && (
              <div className="p-4 bg-success/[0.02] border border-success/15 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-[10px] uppercase font-bold text-success">{lt.thickestPoint}</span>
                </div>
                <h4 className="font-serif text-base font-bold text-charcoal">{thickest.label}</h4>
                <p className="text-xs text-warmgray leading-relaxed">
                  The business is thickest at this stage with <span className="font-mono font-bold text-charcoal">{thickest.count}</span> active items, representing a highly successful intake node.
                </p>
              </div>
            )}

            {thinnest ? (
              <div className="p-4 bg-antiquegold/5 border border-antiquegold/25 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-antiquegold animate-ping" />
                  <span className="text-[10px] uppercase font-bold text-antiquegold">{lt.thinnestPoint}</span>
                </div>
                <h4 className="font-serif text-base font-bold text-charcoal">{thinnest.label}</h4>
                <p className="text-xs text-warmgray leading-relaxed">{lt.bottleneckDesc}</p>
              </div>
            ) : (
              <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.08)] text-center text-xs text-warmgray">
                <Smile className="w-6 h-6 text-antiquegold mx-auto mb-1" />
                <span>Funnel conversion is perfectly balanced! No immediate bottleneck detected.</span>
              </div>
            )}
          </Card>

          {/* Secure GenAI Grounding Tools Panel */}
          <GeminiMapsTool />
        </div>
      </div>

      {/* ---------------------------------------------------------
          TRANSACTION LEVEL DETAIL LEDGER OVERLAYS (SLIDE-OVER / MODAL Drawer)
          --------------------------------------------------------- */}
      {activeDetailKpi !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border-l border-[rgba(184,135,61,0.2)] h-full flex flex-col justify-between shadow-2xl animate-slideLeft">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[rgba(184,135,61,0.12)] flex justify-between items-center bg-alabaster/40">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-antiquegold font-extrabold">{lt.transactionLedger}</span>
                <h3 className="font-serif text-xl font-bold text-charcoal mt-1">
                  {activeDetailKpi === 'leads' ? lt.leadsLabel :
                   activeDetailKpi === 'conversion' ? lt.conversionLabel :
                   activeDetailKpi === 'revenue' ? lt.revenueLabel :
                   activeDetailKpi === 'margin' ? lt.marginLabel :
                   activeDetailKpi === 'installations' ? lt.installationsLabel :
                   lt.overdueLabel}
                </h3>
                <p className="text-xs text-warmgray mt-0.5">Filtered by selected range: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => setActiveDetailKpi(null)}
                className="p-2 rounded-xl bg-alabaster text-warmgray hover:text-charcoal cursor-pointer border border-[rgba(184,135,61,0.1)] font-bold text-xs"
              >
                ✕ {lt.closeDetails}
              </button>
            </div>

            {/* Simulated Live Toast Nudge Indicator */}
            {nudgeToast && (
              <div className="mx-6 mt-4 p-3 bg-success/10 border border-success/20 rounded-2xl text-success text-xs font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle className="w-4 h-4" />
                <span>{nudgeToast}</span>
              </div>
            )}

            {/* Modal Scrollable Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* 1. Leads Details List */}
              {activeDetailKpi === 'leads' && (
                <div className="space-y-3">
                  {leadsInRange.length === 0 ? (
                    <p className="text-xs text-warmgray text-center py-10">{lt.noDataYet}</p>
                  ) : (
                    leadsInRange.map((l) => (
                      <div key={l.id} className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.08)] space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-charcoal">{l.contactInfo.name}</h4>
                            <p className="text-xs text-warmgray">{l.buildingInfo.address}</p>
                          </div>
                          <Badge status={l.stage} />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-warmgray pt-2 border-t border-dashed border-[#e6dfd4] font-mono">
                          <span>{lt.created}: {new Date(l.createdAt).toLocaleDateString()}</span>
                          <span>FLOORS: {l.buildingInfo.floors} • {l.buildingInfo.type}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 2. Win rate / Conversion Details List */}
              {activeDetailKpi === 'conversion' && (
                <div className="space-y-3">
                  {leadsInRange.length === 0 ? (
                    <p className="text-xs text-warmgray text-center py-10">{lt.noDataYet}</p>
                  ) : (
                    leadsInRange.map((l) => {
                      const isWon = l.stage === 'closed_won' || deals.some(d => d.leadId === l.id);
                      return (
                        <div key={l.id} className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.08)] flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-sm text-charcoal">{l.contactInfo.name}</h4>
                            <p className="text-xs text-warmgray">{l.buildingInfo.address}</p>
                            <span className="text-[10px] text-warmgray block mt-0.5">Site: {l.buildingInfo.floors} Floors</span>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${isWon ? 'bg-success/15 text-success' : 'bg-warmgray/15 text-warmgray'}`}>
                              {isWon ? 'CLOSED WON' : l.stage.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* 3. Revenue Booked Details List */}
              {activeDetailKpi === 'revenue' && (
                <div className="space-y-3">
                  {dealsInRange.length === 0 ? (
                    <p className="text-xs text-warmgray text-center py-10">{lt.noDataYet}</p>
                  ) : (
                    dealsInRange.map((d) => {
                      const associatedLead = leads.find(l => l.id === d.leadId);
                      return (
                        <div key={d.id} className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.08)] flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-sm text-charcoal">{associatedLead?.contactInfo.name || 'Enterprise Contract'}</h4>
                            <p className="text-xs text-warmgray">{associatedLead?.buildingInfo.address || 'Pune Site'}</p>
                            <span className="text-[10px] font-mono text-warmgray block mt-0.5">SIGNED: {new Date(d.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className="font-mono text-sm font-extrabold text-success">
                            {formatCurrency(d.agreedPrice)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* 4. Gross Margin % Details List */}
              {activeDetailKpi === 'margin' && (
                <div className="space-y-3">
                  {dealsInRange.length === 0 ? (
                    <p className="text-xs text-warmgray text-center py-10">{lt.noDataYet}</p>
                  ) : (
                    dealsInRange.map((d) => {
                      const associatedLead = leads.find(l => l.id === d.leadId);
                      const breakdown = calculateMargin(d.agreedPrice);
                      return (
                        <div key={d.id} className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.08)] space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-sm text-charcoal">{associatedLead?.contactInfo.name || 'Contract'}</h4>
                              <p className="text-xs text-warmgray">{associatedLead?.buildingInfo.address}</p>
                            </div>
                            <span className="font-mono text-xs font-bold text-royalemerald bg-royalemerald/10 px-2.5 py-0.5 rounded-lg">
                              Margin: {breakdown.marginPct.toFixed(1)}%
                            </span>
                          </div>

                          <div className="pt-2 border-t border-dashed border-[#e6dfd4] grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] text-warmgray">
                            <div>
                              <span>{lt.dealValue}</span>
                              <p className="font-bold text-charcoal">{formatCurrency(d.agreedPrice)}</p>
                            </div>
                            <div>
                              <span>{lt.materialCost}</span>
                              <p className="font-bold text-charcoal">{formatCurrency(breakdown.material)}</p>
                            </div>
                            <div>
                              <span>{lt.commission}</span>
                              <p className="font-bold text-charcoal">{formatCurrency(breakdown.comm)}</p>
                            </div>
                            <div>
                              <span>{lt.techCost}</span>
                              <p className="font-bold text-charcoal">{formatCurrency(breakdown.tech)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* 5. Active Installations Details List */}
              {activeDetailKpi === 'installations' && (
                <div className="space-y-3">
                  {installationsInRange.length === 0 ? (
                    <p className="text-xs text-warmgray text-center py-10">{lt.noDataYet}</p>
                  ) : (
                    installationsInRange.map((j) => {
                      const associatedDeal = deals.find(d => d.id === j.dealId);
                      const associatedLead = associatedDeal ? leads.find(l => l.id === associatedDeal.leadId) : null;
                      const completedCount = j.sopSteps.filter(s => s.completed).length;
                      const totalSteps = j.sopSteps.length;
                      const technician = users.find(u => u.id === j.technicianId);

                      return (
                        <div key={j.id} className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.08)] space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-sm text-charcoal">{associatedLead?.contactInfo.name || 'Active Shaft Site'}</h4>
                              <p className="text-xs text-warmgray">{associatedLead?.buildingInfo.address}</p>
                            </div>
                            <Badge status={j.status} />
                          </div>

                          <div className="pt-2 border-t border-dashed border-[#e6dfd4] flex justify-between items-center text-[10px] text-warmgray">
                            <div>
                              <span>{lt.assignedTech}: </span>
                              <span className="font-bold text-charcoal">{technician?.name || 'SOP Engineer'}</span>
                            </div>
                            <div>
                              <span>{lt.completedSteps}: </span>
                              <span className="font-bold font-mono text-antiquegold">{completedCount} of {totalSteps}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* 6. Overdue Payments Details List */}
              {activeDetailKpi === 'overdue' && (
                <div className="space-y-3">
                  {overduePayments.length === 0 ? (
                    <p className="text-xs text-warmgray text-center py-10">{lt.noDataYet}</p>
                  ) : (
                    overduePayments.map((p) => {
                      const associatedDeal = deals.find(d => d.id === p.dealId);
                      const associatedLead = associatedDeal ? leads.find(l => l.id === associatedDeal.leadId) : null;
                      
                      // Calculate days overdue
                      const dueTime = new Date(p.dueDate).getTime();
                      const currTime = now.getTime();
                      const daysOverdue = Math.max(0, Math.floor((currTime - dueTime) / (1000 * 60 * 60 * 24)));

                      return (
                        <div key={p.id} className="p-4 bg-alabaster rounded-2xl border border-error/15 bg-error/[0.01] space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-sm text-charcoal">{associatedLead?.contactInfo.name || 'Installment Pending'}</h4>
                              <p className="text-xs text-warmgray">{p.stage}</p>
                            </div>
                            <span className="font-mono text-sm font-extrabold text-error">
                              {formatCurrency(p.amount)}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-dashed border-[#e6dfd4] flex flex-wrap justify-between items-center gap-2 text-[10px]">
                            <div className="font-mono text-warmgray">
                              <span>{lt.dueDate}: {p.dueDate} </span>
                              <span className="text-error font-bold ml-2">({daysOverdue} {lt.daysOverdue})</span>
                            </div>

                            <button
                              onClick={() => triggerNudge(associatedLead?.contactInfo.phone || '')}
                              className="py-1.5 px-3 rounded-lg bg-antiquegold text-white text-[10px] font-bold shadow-xs hover:bg-opacity-90 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{lt.nudgeClient}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[rgba(184,135,61,0.12)] bg-alabaster/20 flex justify-end">
              <Button variant="secondary" onClick={() => setActiveDetailKpi(null)} className="w-full sm:w-auto">
                {lt.closeDetails}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
          LEGACY ACTIONS & PARTNER LISTS
          --------------------------------------------------------- */}
      {/* Add Lead Dialog Modal */}
      {showAddLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <Card className="w-full max-w-lg p-6 bg-white shadow-2xl relative animate-scaleUp">
            <h3 className="font-serif text-xl font-bold text-charcoal mb-4">{lt.addNewLeadTitle}</h3>
            <form onSubmit={handleAddLeadSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">{lt.clientName}</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Rohan Deshmukh"
                    className="w-full px-3 py-2 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">{lt.phoneNumber}</label>
                  <input
                    type="text"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43214"
                    className="w-full px-3 py-2 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">{lt.buildingAddress}</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street details, Locality, Pune/Mumbai"
                    className="w-full pl-3 pr-32 py-2 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                  />
                  <button
                    type="button"
                    onClick={fetchAdminRealGpsLocation}
                    disabled={gpsLoading}
                    className="absolute right-1.5 px-2.5 py-1.5 bg-charcoal text-white hover:bg-antiquegold disabled:bg-warmgray/50 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                  >
                    <MapPin className={`w-3 h-3 text-antiquegold ${gpsLoading ? 'animate-spin' : ''}`} />
                    <span>{gpsLoading ? 'Pinning...' : 'Pin Live GPS'}</span>
                  </button>
                </div>
                {gpsError && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{gpsError}</span>
                  </p>
                )}
                {capturedCoords && !gpsError && (
                  <p className="text-[10px] text-success mt-1 flex items-center gap-1 font-mono font-bold uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>GPS Locked: Lat {capturedCoords.latitude.toFixed(6)}, Lng {capturedCoords.longitude.toFixed(6)}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">{lt.totalFloors}</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={floors}
                    onChange={(e) => setFloors(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">{lt.propertyType}</label>
                  <select
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-lg text-sm"
                  >
                    <option value="residential">{lt.residential}</option>
                    <option value="commercial">{lt.commercial}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 font-sans">
                <Button variant="secondary" type="button" onClick={() => setShowAddLead(false)}>{lt.closeDetails}</Button>
                <Button variant="primary" type="submit">{lt.submitLead}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Legacy Lead Pipeline stage & Directory lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Lead list pipeline stage monitoring */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                <Activity className="w-5 h-5 text-antiquegold" />
                <span>{lt.leadsLabel} ({leads.length})</span>
              </h3>
              <span className="text-xs font-bold text-warmgray">{leads.length} active sites</span>
            </div>

            <div className="divide-y divide-[rgba(184,135,61,0.1)]">
              {leads.map((lead) => (
                <div key={lead.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-charcoal">{lead.contactInfo.name}</h4>
                      <Badge status={lead.stage} />
                    </div>
                    <p className="text-xs text-warmgray flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-antiquegold" />
                      <span className="truncate max-w-[280px]">{lead.buildingInfo.address}</span>
                    </p>
                    <p className="text-[10px] text-warmgray mt-0.5">
                      Type: {lead.buildingInfo.type} • {lead.buildingInfo.floors} Floors
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-1 bg-alabaster text-warmgray rounded">
                      ID: {lead.id}
                    </span>
                    <ChevronRight className="w-4 h-4 text-warmgray" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Haversine formula for physical distance checks in surveyor lead capture
const getHaversineDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

// =========================================================
// 2. SURVEYOR DASHBOARD
// =========================================================
export const SurveyorDashboard: React.FC<{ user: User }> = ({ user }) => {
  const { language: appLanguage } = useLanguage(user);
  
  // Trilingual Localization for the Surveyor Hub
  const slt = {
    en: {
      fieldPortal: "Field Surveyor Workbench",
      welcomeMsg: "Namaskar",
      authorizedTerritory: "Territory Node",
      commissionActive: "Commission Tracker Active",
      snapshotTitle: "Today's Field Snapshot",
      offlineMode: "Offline Sandbox Active",
      onlineMode: "Cloud Sync Active",
      lastSynced: "Last synced {time} mins ago",
      syncAction: "Sync Ledger Now",
      capturedToday: "Leads Captured Today",
      followupsDue: "Follow-ups Due Today",
      weeklyCommission: "Commission Earned",
      currentRank: "Leaderboard Rank",
      captureLeadCTA: "Capture New Lead 🚀",
      activeTasks: "Assigned Follow-ups",
      todayProgress: "Today's Route Progress",
      totalProgress: "Commission Target Progress",
      weeklyGoalLabel: "Weekly Goal: Capture 6 Leads",
      routeTab: "My Route 🗺️",
      historyTab: "Leads History 🏆",
      commissionTab: "My Commission 💵",
      dashboardTab: "Snapshot 📊",
      rewardsTab: "Rewards & Performance 🏆",
      emptyTitle: "Welcome to the Frontline, {name}!",
      emptyDesc: "No leads registered in your database yet. Walk any active construction high-rise site in Pune and tap below to start turning raw concrete into verified commissions!",
      startFirstLead: "Register Your First Lead Node",
      gpsLockTitle: "GPS Verified Address",
      pinLiveGps: "Pin Live GPS",
      pinning: "Pinning...",
      gpsLocked: "GPS Locked: Lat {lat}, Lng {lng}",
      floors: "Total Shaft Floors",
      propClassification: "Structure Classification",
      resClassification: "Residential High-Rise",
      comClassification: "Commercial Complex",
      ownerBuilderName: "Owner / Builder Name",
      contactNumber: "Primary Contact Phone",
      savingLead: "Provisioning Lead...",
      successCaptured: "Lead captured! Commission Reward of ₹1,500 pending verification.",
      verifyBtn: "Verify & Lock Capture Location",
      kycBlocked: "Commission Disbursements Blocked",
      kycBlockedDesc: "Your bank details have not cleared NPCI penny-drop verification. Commission payouts remain locked until cleared by Mr. Prashant Wable.",
      kycCleared: "Disbursement Channel Verified",
      kycClearedDesc: "NPCI Penny-Drop completed successfully. Your registered bank account is verified to accept direct commission transfers.",
      toggleKycBtn: "Simulate KYC Penny-Drop Approval",
      offlineBarMsg: "Poor site signal detected. Leads captured will be cached locally and synced later.",
      goOnlineBtn: "Go Online / Sync Live",
      goOfflineBtn: "Simulate Signal Drop (Go Offline)",
      addCRMTask: "Simulate CRM Auto-Task",
      adminClosesLead: "Simulate Admin Closing Suresh Patil Lead",
      adminClosesLeadDesc: "Demonstrates CRM auto-removing stale follow-ups when lead is closed by someone else.",
      leadsHistoryTitle: "Your Registered Lead Nodes",
      searchPlaceholder: "Search builders or locations...",
      routeHeader: "Your Optimized Field Sequence",
      routeDescription: "Below is your sequential path for physical inspections, driven by the Ascension Line elevator motif.",
      checkInBtn: "Check In & Verify",
      taskComplete: "Site Inspected Successfully",
      commissionLedgerTitle: "Your Verified Earnings Ledger",
      commissionLedgerSubtitle: "All payouts require NPCI clearance and surveyor physical geo-verification stamps.",
      activeSiteTitle: "Registered Sites",
      ofLabel: "of",
      completedLabel: "completed",
      leadsLabel: "leads",
      duplicateTitle: "Potential Duplicate Lead Warning",
      duplicateDesc: "Satellite coordination check detected an existing lead within your target radius.",
      distanceAway: "located {distance} meters away",
      existingLead: "Existing Registered Lead",
      newLead: "New Proposed Lead",
      overrideCTA: "Override & Submit for Review",
      cancelCTA: "Abandon Proposed Lead",
      overrideReasonLabel: "Justification for Wable Sir's Review",
      overrideReasonPlaceholder: "Explain why this site is separate (e.g., Block B vs Block A, distinct society phase, separate promoter)..."
    },
    hi: {
      fieldPortal: "फील्ड सर्वेक्षक वर्कबेंच",
      welcomeMsg: "नमस्कार",
      authorizedTerritory: "अधिकृत क्षेत्र नोड",
      commissionActive: "कमीशन ट्रैकर सक्रिय",
      snapshotTitle: "आज का फ़ील्ड विवरण",
      offlineMode: "ऑफ़लाइन सैंडबॉक्स सक्रिय",
      onlineMode: "क्लाउड सिंक सक्रिय",
      lastSynced: "अंतिम सिंक {time} मिनट पहले",
      syncAction: "लेजर अभी सिंक करें",
      capturedToday: "आज दर्ज की गई लीड",
      followupsDue: "आज देय फ़ॉलो-अप",
      weeklyCommission: "अर्जित कमीशन",
      currentRank: "लीडरबोर्ड रैंक",
      captureLeadCTA: "नई लीड दर्ज करें 🚀",
      activeTasks: "सौंपे गए फ़ॉलो-अप",
      todayProgress: "आज का मार्ग प्रगति",
      totalProgress: "कमीशन लक्ष्य प्रगति",
      weeklyGoalLabel: "साप्ताहिक लक्ष्य: 6 लीड दर्ज करें",
      routeTab: "मेरा मार्ग 🗺️",
      historyTab: "लीड्स इतिहास 🏆",
      commissionTab: "मेरा कमिशन 💵",
      dashboardTab: "स्नैपशॉट 📊",
      rewardsTab: "प्रदर्शन और पुरस्कार 🏆",
      emptyTitle: "फ़्रंटलाइन पर आपका स्वागत है, {name}!",
      emptyDesc: "आपके डेटाबेस में अभी तक कोई लीड पंजीकृत नहीं है। पुणे में किसी भी सक्रिय निर्माण स्थल पर जाएं और कंक्रीट को सत्यापित कमीशन में बदलना शुरू करने के लिए नीचे टैप करें!",
      startFirstLead: "अपनी पहली लीड पंजीकृत करें",
      gpsLockTitle: "जीपीएस सत्यापित पता",
      pinLiveGps: "लाइव जीपीएस पिन करें",
      pinning: "पिन हो रहा है...",
      gpsLocked: "जीपीएस लॉक: अक्षांश {lat}, रेखांश {lng}",
      floors: "कुल शाफ्ट मंजिल",
      propClassification: "संरचना वर्गीकरण",
      resClassification: "आवासीय हाई-राइज",
      comClassification: "व्यावसायिक परिसर",
      ownerBuilderName: "मालिक / बिल्डर का नाम",
      contactNumber: "प्राथमिक संपर्क फ़ोन",
      savingLead: "लीड दर्ज हो रही है...",
      successCaptured: "लीड सबमिट हो गई! सत्यापन लंबित होने पर ₹1,500 का कमीशन पुरस्कार।",
      verifyBtn: "सत्यापित करें और स्थान लॉक करें",
      kycBlocked: "कमीशन संवितरण अवरुद्ध (Blocked)",
      kycBlockedDesc: "आपके बैंक विवरणों ने एनपीसीआई पेनी-ड्रॉप सत्यापन को पास नहीं किया है। श्री प्रशांत वाबळे द्वारा मंजूरी दिए जाने तक कमीशन भुगतान अवरुद्ध रहेगा।",
      kycCleared: "संवितरण चैनल सत्यापित",
      kycClearedDesc: "एनपीसीआई पेनी-ड्रॉप सफलतापूर्वक पूरा हुआ। आपका पंजीकृत बैंक खाता सीधे कमीशन हस्तांतरण स्वीकार करने के लिए सत्यापित है।",
      toggleKycBtn: "KYC पेनी-ड्रॉप मंजूरी का अनुकरण करें",
      offlineBarMsg: "खराब साइट सिग्नल का पता चला। कैप्चर किए गए लीड्स को स्थानीय रूप से कैश किया जाएगा और बाद में सिंक किया जाएगा।",
      goOnlineBtn: "ऑनलाइन जाएं / लाइव सिंक",
      goOfflineBtn: "सिग्नल ड्रॉप का अनुकरण करें (ऑफलाइन जाएं)",
      addCRMTask: "CRM ऑटो-टास्क का अनुकरण करें",
      adminClosesLead: "सुरेश पाटिल लीड बंद होने का अनुकरण",
      adminClosesLeadDesc: "यह दिखाता है कि जब कोई अन्य लीड बंद कर देता है, तो CRM स्वचालित रूप से बासी फॉलो-अप हटा देता है।",
      leadsHistoryTitle: "आपके पंजीकृत लीड नोड्स",
      searchPlaceholder: "बिल्डर्स या स्थानों की खोज करें...",
      routeHeader: "आपका अनुकूलित फील्ड अनुक्रम",
      routeDescription: "नीचे भौतिक निरीक्षण के लिए आपका अनुक्रमिक मार्ग है, जो एसेंशन लाइन लिफ्ट मोटिफ द्वारा संचालित है।",
      checkInBtn: "चेक इन और सत्यापित करें",
      taskComplete: "SITE का सफलतापूर्वक निरीक्षण किया गया",
      commissionLedgerTitle: "आपका सत्यापित कमाई लेजर",
      commissionLedgerSubtitle: "सभी भुगतानों के लिए एनपीसीआई मंजूरी और सर्वेक्षक भौतिक भू-सत्यापन टिकट की आवश्यकता होती है।",
      activeSiteTitle: "पंजीकृत साइटें",
      ofLabel: "का",
      completedLabel: "पूरा",
      leadsLabel: "लीड्स",
      duplicateTitle: "संभावित डुप्लिकेट लीड चेतावनी",
      duplicateDesc: "सैटेलाइट समन्वय जांच में आपके लक्षित दायरे में एक मौजूदा लीड का पता चला है।",
      distanceAway: "{distance} मीटर की दूरी पर स्थित",
      existingLead: "मौजूदा पंजीकृत लीड",
      newLead: "नया प्रस्तावित लीड",
      overrideCTA: "अधिभावी करें और समीक्षा के लिए सबमिट करें",
      cancelCTA: "प्रस्तावित लीड छोड़ें",
      overrideReasonLabel: "वाबळे सर की समीक्षा के लिए औचित्य",
      overrideReasonPlaceholder: "समझाएं कि यह साइट अलग क्यों है (जैसे, ब्लॉक बी बनाम ब्लॉक ए, अलग सोसायटी चरण, अलग प्रमोटर)..."
    },
    mr: {
      fieldPortal: "फील्ड सर्वेक्षक वर्कबेंच",
      welcomeMsg: "नमस्कार",
      authorizedTerritory: "अधिकृत क्षेत्र नोड",
      commissionActive: "कमिशन ट्रॅकर सक्रिय",
      snapshotTitle: "आजचा फील्ड स्नॅपशॉट",
      offlineMode: "ऑफलाईन सँडबॉक्स सक्रिय",
      onlineMode: "क्लाउड सिंक सक्रिय",
      lastSynced: "शेवटचा सिंक {time} मिनिटांपूर्वी",
      syncAction: "लेजर आता सिंक करा",
      capturedToday: "आज नोंदवलेले लीड्स",
      followupsDue: "आजचे थकीत फॉलो-अप्स",
      weeklyCommission: "मिळवलेले कमिशन",
      currentRank: "लीडरबोर्ड रँक",
      captureLeadCTA: "नवीन लीड नोंदवा 🚀",
      activeTasks: "सोपवलेले फॉलो-अप्स",
      todayProgress: "आजचा मार्ग प्रगती",
      totalProgress: "कमिशन लक्ष्य प्रगती",
      weeklyGoalLabel: "साहित्यिक ध्येय: 6 लीड्स नोंदवा",
      routeTab: "माझा मार्ग 🗺️",
      historyTab: "लीड्स इतिहास 🏆",
      commissionTab: "माझे कमिशन 💵",
      dashboardTab: "स्नॅपशॉट 📊",
      rewardsTab: "कामगिरी आणि पुरस्कार 🏆",
      emptyTitle: "फ्रंटलाइनवर आपले स्वागत आहे, {name}!",
      emptyDesc: "तुमच्या डेटाबेसमध्ये अद्याप कोणतेही लीड्स नोंदवलेले नाहीत. पुण्यातील कोणत्याही बांधकाम साइटवर जा आणि कमिशन मिळवणे सुरू करण्यासाठी खाली टॅप करा!",
      startFirstLead: "तुमचा पहिला लीड नोंदवा",
      gpsLockTitle: "जीपीएस सत्यापित पत्ता",
      pinLiveGps: "थेट जीपीएस पिन करा",
      pinning: "पिन करत आहे...",
      gpsLocked: "जीपीएस लॉक: अक्षांश {lat}, रेखांश {lng}",
      floors: "एकूण लिफ्ट मजले",
      propClassification: "इमारत वर्गीकरण",
      resClassification: "निवासी हाय-राईझ",
      comClassification: "व्यावसायिक संकुल",
      ownerBuilderName: "मालक / बिल्डरचे नाव",
      contactNumber: "प्राथमिक संपर्क फोन",
      savingLead: "लीड नोंदवत आहे...",
      successCaptured: "लीड नोंदवली! पडताळणीनंतर ₹१,५०० चे कमिशन प्रलंबित.",
      verifyBtn: "सत्यापित करा आणि जागा लॉक करा",
      kycBlocked: "कमिशन वितरण अवरोधित (Blocked)",
      kycBlockedDesc: "तुमच्या बँक तपशीलांनी एनपीसीआय पेनी-ड्रॉप पडताळणी पास केलेली नाही. श्री प्रशांत वाबळे यांनी मंजूर करेपर्यंत कमिशनचे पेमेंट ब्लॉक राहील.",
      kycCleared: "वितरण चॅनेल सत्यापित",
      kycClearedDesc: "एनपीसीआय पेनी-ड्रॉप यशस्वीरित्या पूर्ण झाले. तुमचे नोंदणीकृत बँक खाते थेट कमिशन स्वीकारण्यासाठी सत्यापित आहे.",
      toggleKycBtn: "KYC पेनी-ड्रॉप मंजुरीचे अनुकरण करा",
      offlineBarMsg: "साइटवर सिग्नल खराब आहे. नोंदवलेले लीड्स स्थानिक पातळीवर जतन केले जातील आणि नंतर सिंक केले जातील.",
      goOnlineBtn: "ऑनलाइन जा / थेट सिंक",
      goOfflineBtn: "सिग्नल ड्रॉपचे अनुकरण करा (ऑफलाइन जा)",
      addCRMTask: "CRM ऑटो-टास्कचे अनुकरण करा",
      adminClosesLead: "सुरेश पाटील लीड बंद करण्याचे अनुकरण",
      adminClosesLeadDesc: "हे दर्शविते की जेव्हा एखादी लीड दुसऱ्याने बंद केली जाते, तेव्हा CRM स्वयंचलितपणे शिळे फॉलो-अप काढून टाकते.",
      leadsHistoryTitle: "तुमचे नोंदणीकृत लीड नोड्स",
      searchPlaceholder: "बिल्डर्स किंवा जागा शोधा...",
      routeHeader: "तुमचा अनुकूलित फील्ड मार्ग",
      routeDescription: "खालील मार्ग तुमच्या भौतिक तपासणीसाठी अनुकूलित केला आहे, जो एसेंशन लाइन लिफ्ट मार्गदर्शकाद्वारे दर्शविला आहे.",
      checkInBtn: "चेक इन आणि सत्यापित करा",
      taskComplete: "साइटची तपासणी यशस्वीरित्या पूर्ण",
      commissionLedgerTitle: "तुमचे सत्यापित कमिशन खाते",
      commissionLedgerSubtitle: "सर्व पेमेंट वितरणासाठी एनपीसीआय मंजुरी आणि सर्वेक्षक भौतिक भू-पडताळणी आवश्यक आहे.",
      activeSiteTitle: "नोंदणीकृत जागा",
      ofLabel: "पैकी",
      completedLabel: "पूर्ण",
      leadsLabel: "लीड्स",
      duplicateTitle: "संभावित डुप्लिकेट लीड चेतावणी",
      duplicateDesc: "सॅटेलाइट समन्वय तपासणीत तुमच्या लक्ष्यित त्रिज्येमध्ये एक विद्यमान लीड आढळली आहे.",
      distanceAway: "{distance} मीटर अंतरावर स्थित",
      existingLead: "विद्यमान नोंदणीकृत लीड",
      newLead: "नवीन प्रस्तावित लीड",
      overrideCTA: "ओव्हरराइड करा आणि पुनरावलोकनासाठी सबमिट करा",
      cancelCTA: "प्रस्तावित लीड सोडून द्या",
      overrideReasonLabel: "वाबळे सरांच्या पुनरावलोकनासाठी समर्थन",
      overrideReasonPlaceholder: "ही साइट वेगळी का आहे ते स्पष्ट करा (उदा., ब्लॉक बी विरुद्ध ब्लॉक ए, स्वतंत्र सोसायटी टप्पा, स्वतंत्र प्रवर्तक)..."
    }
  };

  const lt = slt[appLanguage] || slt['en'];

  // Database core state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dbUser, setDbUser] = useState<User>(user);
  const [subView, setSubView] = useState<'overview' | 'route' | 'history' | 'commission' | 'rewards'>('overview');
  
  // Surveyor Performance & Rewards State
  const [isContestActive, setIsContestActive] = useState<boolean>(true);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  
  // Offline mode core simulations
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [lastSyncedMinutes, setLastSyncedMinutes] = useState<number>(2);
  const [pendingOfflineLeads, setPendingOfflineLeads] = useState<Lead[]>([]);
  const [syncingIndicator, setSyncingIndicator] = useState<boolean>(false);
  const [cachedStats, setCachedStats] = useState({
    leadsToday: 2,
    followupsDue: 3,
    commissionEarned: 25000,
    rank: 2
  });

  // Lead capture modal state
  const [showCaptureModal, setShowCaptureModal] = useState<boolean>(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactRole, setContactRole] = useState<'owner' | 'contractor' | 'architect' | 'facility_manager' | ''>('');
  const [noDirectContact, setNoDirectContact] = useState<boolean>(false);
  const [contactConsentFlag, setContactConsentFlag] = useState<boolean>(false);
  const [relationshipNote, setRelationshipNote] = useState<string>('');
  const [cardOcrLoading, setCardOcrLoading] = useState<boolean>(false);
  const [duplicatePhoneDetected, setDuplicatePhoneDetected] = useState<boolean>(false);
  const [duplicatePhoneOwner, setDuplicatePhoneOwner] = useState<string>('');
  const [address, setAddress] = useState('');
  const [floors, setFloors] = useState(4);
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('residential');
  const [successMsg, setSuccessMsg] = useState('');

  // GPS verification state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [capturedCoords, setCapturedCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // New Lead Capture Wizard states
  const [captureStep, setCaptureStep] = useState<number>(1);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(4.2); // Default is excellent, can toggle to simulate poor accuracy
  const [manualGpsAdjusted, setManualGpsAdjusted] = useState<boolean>(false);
  const [poorAccuracyWarningDismissed, setPoorAccuracyWarningDismissed] = useState<boolean>(false);
  const [landmarkNote, setLandmarkNote] = useState<string>('');
  const [blockGalleryUploads, setBlockGalleryUploads] = useState<boolean>(true); // For anti-fraud simulation
  const [hasDraftToResume, setHasDraftToResume] = useState<boolean>(false);

  // Building specification variables
  const [constructionStage, setConstructionStage] = useState<'foundation' | 'structure-up' | 'finishing' | 'ready'>('foundation');
  const [isShaftInaccessible, setIsShaftInaccessible] = useState<boolean>(false);
  const [shaftWidthEstimate, setShaftWidthEstimate] = useState<string>('1500');
  const [shaftDepthEstimate, setShaftDepthEstimate] = useState<string>('1500');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [passengerCapacityEstimate, setPassengerCapacityEstimate] = useState<number>(6);
  const [isMixedUse, setIsMixedUse] = useState<boolean>(false);
  const [mixedCategoryDetail, setMixedCategoryDetail] = useState<string>('');
  const [shaftSketchDataUrl, setShaftSketchDataUrl] = useState<string>('');

  // Guided site photos
  const [sitePhotos, setSitePhotos] = useState<{
    front?: { dataUrl: string; timestamp: string; geotag: string; isLive: boolean };
    entrance?: { dataUrl: string; timestamp: string; geotag: string; isLive: boolean };
    landmark?: { dataUrl: string; timestamp: string; geotag: string; isLive: boolean };
  }>({});

  // Active prompt for camera modal overlay
  const [activePhotoPrompt, setActivePhotoPrompt] = useState<'front' | 'entrance' | 'landmark' | null>(null);
  const [photoSourceMode, setPhotoSourceMode] = useState<'live' | 'gallery'>('live');

  // Transmission simulation state
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [transmissionStep, setTransmissionStep] = useState<number>(1);
  const [transmissionProgressCurrent, setTransmissionProgressCurrent] = useState<number>(0);
  const [transmissionProgressTotal, setTransmissionProgressTotal] = useState<number>(0);
  const [transmissionLogs, setTransmissionLogs] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [draftSavedToast, setDraftSavedToast] = useState<boolean>(false);

  // Search/Filters in History View
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'captured' | 'survey_done' | 'quoted' | 'closed_won' | 'closed_lost' | 'merged'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historyPageSize, setHistoryPageSize] = useState<number>(5);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Commission & Incentive local states
  const [disputeModalEntry, setDisputeModalEntry] = useState<any | null>(null);
  const [disputeDescription, setDisputeDescription] = useState<string>('');
  const [disputeCategory, setDisputeCategory] = useState<string>('missing_capture');
  const [disputedEntries, setDisputedEntries] = useState<Record<string, { category: string; notes: string; timestamp: string }>>(() => {
    try {
      const saved = localStorage.getItem('aiec_disputed_commissions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState<string>('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paid' | 'reversed'>('all');
  const [isCommissionLoading, setIsCommissionLoading] = useState<boolean>(false);

  // Daily Route Planner local states
  const [routeStops, setRouteStops] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('aiec_surveyor_route_stops');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'task_suresh_patil',
        type: 'follow_up',
        projectName: 'Shanti Niwas Co-op Housing Society',
        address: 'Shanti Niwas Co-op Housing Society, Erandwane, Pune 411004',
        lat: 18.5112,
        lng: 73.8342,
        dueTimeText: '9:30 AM (In 15 mins)',
        phone: '+91 91234 56789',
        contactName: 'Suresh Patil',
        status: 'pending',
        sequence: 1,
        ruleVersion: 'v2.2'
      },
      {
        id: 'task_rohan_deshmukh',
        type: 'follow_up',
        projectName: 'Plot 45, Deshmukh Arcade',
        address: 'Plot 45, Deshmukh Arcade, Kothrud, Pune, Maharashtra 411038',
        lat: 18.5074,
        lng: 73.8078,
        dueTimeText: '11:45 AM (In 2 hours)',
        phone: '+91 98765 43214',
        contactName: 'Rohan Deshmukh',
        status: 'pending',
        sequence: 2,
        ruleVersion: 'v2.2'
      },
      {
        id: 'stop_exploration_1',
        type: 'exploration',
        projectName: 'Elite Icon Phase 3 (Cold Shaft Opportunity)',
        address: 'Elite Icon Site, near Cummins College, Karve Nagar, Pune 411052',
        lat: 18.4878,
        lng: 73.8185,
        dueTimeText: 'Exploration Spot',
        phone: '',
        contactName: 'Site Supervisor (Walk-in)',
        status: 'pending',
        sequence: 3,
        ruleVersion: 'v2.2'
      },
      {
        id: 'task_karan_malhotra',
        type: 'follow_up',
        projectName: 'Malhotra Heights (Shaft B)',
        address: 'Baner Main Road, opposite Orchid Hotel, Pune 411045',
        lat: 18.5593,
        lng: 73.7797,
        dueTimeText: '2:15 PM (In 5 hours)',
        phone: '+91 98900 12345',
        contactName: 'Karan Malhotra',
        status: 'pending',
        sequence: 4,
        ruleVersion: 'v2.2'
      },
      {
        id: 'stop_exploration_2',
        type: 'exploration',
        projectName: 'Supreme Classic Tower B Construction',
        address: 'Supreme Classic Plot, near High Street, Baner, Pune 411045',
        lat: 18.5638,
        lng: 73.7731,
        dueTimeText: 'Exploration Spot',
        phone: '',
        contactName: 'Developer Office (Walk-in)',
        status: 'pending',
        sequence: 5,
        ruleVersion: 'v2.2'
      }
    ];
  });
  
  const [selectedRouteStop, setSelectedRouteStop] = useState<any | null>(null);
  const [routeSearchQuery, setRouteSearchQuery] = useState<string>('');
  const [routeTypeFilter, setRouteTypeFilter] = useState<'all' | 'follow_up' | 'exploration'>('all');
  const [routeStatusFilter, setRouteStatusFilter] = useState<'all' | 'pending' | 'completed' | 'skipped'>('all');
  const [isRouteRefreshing, setIsRouteRefreshing] = useState<boolean>(false);

  // Follow-up agenda state (dynamic tasks sourced from CRM or Admin)
  const [followupTasks, setFollowupTasks] = useState([
    {
      id: 'task_suresh_patil',
      leadId: 'lead_2',
      contactName: 'Suresh Patil',
      projectName: 'Shanti Niwas Co-op Housing Society',
      phone: '+91 91234 56789',
      address: 'Shanti Niwas Co-op Housing Society, Erandwane, Pune 411004',
      dueTimeText: '9:30 AM (In 15 mins)',
      dueTimeEpoch: Date.now() + 15 * 60 * 1000,
      reason: 'Physical shaft measurements & builder contract negotiation',
      completed: false
    },
    {
      id: 'task_rohan_deshmukh',
      leadId: 'lead_1',
      contactName: 'Rohan Deshmukh',
      projectName: 'Plot 45, Deshmukh Arcade',
      phone: '+91 98765 43214',
      address: 'Plot 45, Deshmukh Arcade, Kothrud, Pune, Maharashtra 411038',
      dueTimeText: '11:45 AM (In 2 hours)',
      dueTimeEpoch: Date.now() + 120 * 60 * 1000,
      reason: 'Commercial quote review & advance payment collection',
      completed: false
    },
    {
      id: 'task_karan_malhotra',
      leadId: 'lead_custom_malhotra',
      contactName: 'Karan Malhotra',
      projectName: 'Malhotra Heights (Shaft B)',
      phone: '+91 98900 12345',
      address: 'Baner Main Road, opposite Orchid Hotel, Pune 411045',
      dueTimeText: '2:15 PM (In 5 hours)',
      dueTimeEpoch: Date.now() + 300 * 60 * 1000,
      reason: 'SOP floor-milestone markings alignment survey',
      completed: false
    }
  ]);

  // Sync overview followupTasks completion with routeStops
  useEffect(() => {
    setRouteStops(prev => {
      let changed = false;
      const next = prev.map(stop => {
        if (stop.type === 'follow_up') {
          const matchedTask = followupTasks.find(t => t.id === stop.id);
          if (matchedTask && matchedTask.completed && stop.status !== 'completed') {
            changed = true;
            return { ...stop, status: 'completed' };
          }
        }
        return stop;
      });
      if (changed) {
        localStorage.setItem('aiec_surveyor_route_stops', JSON.stringify(next));
        return next;
      }
      return prev;
    });
  }, [followupTasks]);

  useEffect(() => {
    setHistoryPage(1);
    setIsHistoryLoading(true);
    const timer = setTimeout(() => {
      setIsHistoryLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, dateFilter, customStartDate, customEndDate, historyPageSize]);

  // Synchronize dynamic lists with LocalStorage DbManager
  const refreshData = () => {
    const list = DbManager.getLeads().filter(l => l.surveyorId === user.id);
    setLeads(list);
    
    // Refresh logged in user KYC state from store in case of outer changes
    const freshestUser = DbManager.getUsers().find(u => u.id === user.id);
    if (freshestUser) {
      setDbUser(freshestUser);
    }
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('aiec_db_update', refreshData);
    
    // Increment simulated offline time
    const interval = setInterval(() => {
      setLastSyncedMinutes(prev => prev + 1);
    }, 60000);

    return () => {
      window.removeEventListener('aiec_db_update', refreshData);
      clearInterval(interval);
    };
  }, []);

  // Check for draft when modal is toggled
  useEffect(() => {
    if (showCaptureModal) {
      const savedDraft = localStorage.getItem('aiec_lead_draft');
      if (savedDraft) {
        setHasDraftToResume(true);
      } else {
        setHasDraftToResume(false);
      }
    }
  }, [showCaptureModal]);

  // Passenger Capacity auto-estimator engine based on floors and usage
  useEffect(() => {
    let suggested = 4;
    if (isMixedUse || propertyType === 'commercial') {
      if (floors <= 4) suggested = 6;
      else if (floors <= 10) suggested = 8;
      else if (floors <= 15) suggested = 10;
      else suggested = 13;
    } else {
      if (floors <= 4) suggested = 4;
      else if (floors <= 10) suggested = 6;
      else suggested = 8;
    }
    setPassengerCapacityEstimate(suggested);
  }, [floors, propertyType, isMixedUse]);

  // Real-time phone de-duplication check
  const checkDuplicatePhone = (phoneNum: string) => {
    const cleanNum = phoneNum.replace(/\D/g, '');
    if (cleanNum.length < 10) {
      setDuplicatePhoneDetected(false);
      setDuplicatePhoneOwner('');
      return;
    }
    
    // Check against current leads in the global offline / online store
    const allLeads = DbManager.getLeads();
    const duplicateLead = allLeads.find(l => {
      if (!l.contactInfo || !l.contactInfo.phone) return false;
      const existingClean = l.contactInfo.phone.replace(/\D/g, '');
      return existingClean.includes(cleanNum) || cleanNum.includes(existingClean);
    });

    if (duplicateLead) {
      setDuplicatePhoneDetected(true);
      setDuplicatePhoneOwner(`${duplicateLead.contactInfo.name} (${duplicateLead.buildingInfo.address || 'Existing Project'})`);
    } else {
      // Also check against users (customers etc)
      const allUsers = DbManager.getUsers();
      const duplicateUser = allUsers.find(u => {
        if (!u.phone) return false;
        const existingClean = u.phone.replace(/\D/g, '');
        return existingClean.includes(cleanNum) || cleanNum.includes(existingClean);
      });
      if (duplicateUser) {
        setDuplicatePhoneDetected(true);
        setDuplicatePhoneOwner(`${duplicateUser.name} (Active Registered Customer)`);
      } else {
        setDuplicatePhoneDetected(false);
        setDuplicatePhoneOwner('');
      }
    }
  };

  // Secure client-side handler for scanning and uploading business cards to server-side Gemini OCR API
  const handleBusinessCardScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCardOcrLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch('/api/gemini/ocr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageBytes: base64String,
            mimeType: file.type
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.name) setClientName(data.name);
          if (data.phone) {
            setClientPhone(data.phone);
            checkDuplicatePhone(data.phone);
          }
          if (data.companyName) setCompanyName(data.companyName);
          if (data.role) setContactRole(data.role);
          setContactConsentFlag(true); // Auto-consent via explicit business card swap
          setRelationshipNote(prev => prev ? prev + `\nParsed from business card scan.` : `Exchanged business card on site survey.`);
          
          saveLeadDraft({
            clientName: data.name,
            clientPhone: data.phone,
            companyName: data.companyName,
            contactRole: data.role,
            contactConsentFlag: true,
            relationshipNote: `Exchanged business card on site survey.`
          });

          setSuccessMsg("Business card processed! Fields populated with Gemini intelligence.");
          setTimeout(() => setSuccessMsg(''), 5000);
        } else {
          console.error("OCR API response non-OK status.");
        }
      } catch (err) {
        console.error("Failed to call Gemini OCR API:", err);
      } finally {
        setCardOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-save draft helper
  const saveLeadDraft = (updates: {
    clientName?: string;
    clientPhone?: string;
    companyName?: string;
    contactRole?: 'owner' | 'contractor' | 'architect' | 'facility_manager' | '';
    noDirectContact?: boolean;
    contactConsentFlag?: boolean;
    relationshipNote?: string;
    address?: string;
    floors?: number;
    propertyType?: 'residential' | 'commercial';
    landmarkNote?: string;
    capturedCoords?: { latitude: number; longitude: number } | null;
    sitePhotos?: any;
    captureStep?: number;
    gpsAccuracy?: number;
    manualGpsAdjusted?: boolean;
    constructionStage?: 'foundation' | 'structure-up' | 'finishing' | 'ready';
    isShaftInaccessible?: boolean;
    shaftWidthEstimate?: string;
    shaftDepthEstimate?: string;
    specialNotes?: string;
    passengerCapacityEstimate?: number;
    isMixedUse?: boolean;
    mixedCategoryDetail?: string;
    shaftSketchDataUrl?: string;
  }) => {
    const current = {
      clientName: updates.clientName !== undefined ? updates.clientName : clientName,
      clientPhone: updates.clientPhone !== undefined ? updates.clientPhone : clientPhone,
      companyName: updates.companyName !== undefined ? updates.companyName : companyName,
      contactRole: updates.contactRole !== undefined ? updates.contactRole : contactRole,
      noDirectContact: updates.noDirectContact !== undefined ? updates.noDirectContact : noDirectContact,
      contactConsentFlag: updates.contactConsentFlag !== undefined ? updates.contactConsentFlag : contactConsentFlag,
      relationshipNote: updates.relationshipNote !== undefined ? updates.relationshipNote : relationshipNote,
      address: updates.address !== undefined ? updates.address : address,
      floors: updates.floors !== undefined ? updates.floors : floors,
      propertyType: updates.propertyType !== undefined ? updates.propertyType : propertyType,
      landmarkNote: updates.landmarkNote !== undefined ? updates.landmarkNote : landmarkNote,
      capturedCoords: updates.capturedCoords !== undefined ? updates.capturedCoords : capturedCoords,
      sitePhotos: updates.sitePhotos !== undefined ? updates.sitePhotos : sitePhotos,
      captureStep: updates.captureStep !== undefined ? updates.captureStep : captureStep,
      gpsAccuracy: updates.gpsAccuracy !== undefined ? updates.gpsAccuracy : gpsAccuracy,
      manualGpsAdjusted: updates.manualGpsAdjusted !== undefined ? updates.manualGpsAdjusted : manualGpsAdjusted,
      constructionStage: updates.constructionStage !== undefined ? updates.constructionStage : constructionStage,
      isShaftInaccessible: updates.isShaftInaccessible !== undefined ? updates.isShaftInaccessible : isShaftInaccessible,
      shaftWidthEstimate: updates.shaftWidthEstimate !== undefined ? updates.shaftWidthEstimate : shaftWidthEstimate,
      shaftDepthEstimate: updates.shaftDepthEstimate !== undefined ? updates.shaftDepthEstimate : shaftDepthEstimate,
      specialNotes: updates.specialNotes !== undefined ? updates.specialNotes : specialNotes,
      passengerCapacityEstimate: updates.passengerCapacityEstimate !== undefined ? updates.passengerCapacityEstimate : passengerCapacityEstimate,
      isMixedUse: updates.isMixedUse !== undefined ? updates.isMixedUse : isMixedUse,
      mixedCategoryDetail: updates.mixedCategoryDetail !== undefined ? updates.mixedCategoryDetail : mixedCategoryDetail,
      shaftSketchDataUrl: updates.shaftSketchDataUrl !== undefined ? updates.shaftSketchDataUrl : shaftSketchDataUrl,
    };
    localStorage.setItem('aiec_lead_draft', JSON.stringify(current));
  };

  const handleResumeDraft = () => {
    const saved = localStorage.getItem('aiec_lead_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.clientName !== undefined) setClientName(parsed.clientName);
        if (parsed.clientPhone !== undefined) {
          setClientPhone(parsed.clientPhone);
          checkDuplicatePhone(parsed.clientPhone);
        }
        if (parsed.companyName !== undefined) setCompanyName(parsed.companyName);
        if (parsed.contactRole !== undefined) setContactRole(parsed.contactRole);
        if (parsed.noDirectContact !== undefined) setNoDirectContact(parsed.noDirectContact);
        if (parsed.contactConsentFlag !== undefined) setContactConsentFlag(parsed.contactConsentFlag);
        if (parsed.relationshipNote !== undefined) setRelationshipNote(parsed.relationshipNote);
        if (parsed.address !== undefined) setAddress(parsed.address);
        if (parsed.floors !== undefined) setFloors(parsed.floors);
        if (parsed.propertyType !== undefined) setPropertyType(parsed.propertyType);
        if (parsed.landmarkNote !== undefined) setLandmarkNote(parsed.landmarkNote);
        if (parsed.capturedCoords !== undefined) setCapturedCoords(parsed.capturedCoords);
        if (parsed.sitePhotos !== undefined) setSitePhotos(parsed.sitePhotos);
        if (parsed.captureStep !== undefined) setCaptureStep(parsed.captureStep);
        if (parsed.gpsAccuracy !== undefined) setGpsAccuracy(parsed.gpsAccuracy);
        if (parsed.manualGpsAdjusted !== undefined) setManualGpsAdjusted(parsed.manualGpsAdjusted);
        if (parsed.constructionStage !== undefined) setConstructionStage(parsed.constructionStage);
        if (parsed.isShaftInaccessible !== undefined) setIsShaftInaccessible(parsed.isShaftInaccessible);
        if (parsed.shaftWidthEstimate !== undefined) setShaftWidthEstimate(parsed.shaftWidthEstimate);
        if (parsed.shaftDepthEstimate !== undefined) setShaftDepthEstimate(parsed.shaftDepthEstimate);
        if (parsed.specialNotes !== undefined) setSpecialNotes(parsed.specialNotes);
        if (parsed.passengerCapacityEstimate !== undefined) setPassengerCapacityEstimate(parsed.passengerCapacityEstimate);
        if (parsed.isMixedUse !== undefined) setIsMixedUse(parsed.isMixedUse);
        if (parsed.mixedCategoryDetail !== undefined) setMixedCategoryDetail(parsed.mixedCategoryDetail);
        if (parsed.shaftSketchDataUrl !== undefined) setShaftSketchDataUrl(parsed.shaftSketchDataUrl);
        setHasDraftToResume(false);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem('aiec_lead_draft');
    setHasDraftToResume(false);
    setClientName('');
    setClientPhone('');
    setCompanyName('');
    setContactRole('');
    setNoDirectContact(false);
    setContactConsentFlag(false);
    setRelationshipNote('');
    setDuplicatePhoneDetected(false);
    setDuplicatePhoneOwner('');
    setAddress('');
    setFloors(4);
    setPropertyType('residential');
    setLandmarkNote('');
    setCapturedCoords(null);
    setSitePhotos({});
    setCaptureStep(1);
    setGpsAccuracy(4.2);
    setManualGpsAdjusted(false);
    setPoorAccuracyWarningDismissed(false);
    setConstructionStage('foundation');
    setIsShaftInaccessible(false);
    setShaftWidthEstimate('1500');
    setShaftDepthEstimate('1500');
    setSpecialNotes('');
    setPassengerCapacityEstimate(6);
    setIsMixedUse(false);
    setMixedCategoryDetail('');
    setShaftSketchDataUrl('');
  };

  // Sync manual triggered animation
  const handleSyncLedger = () => {
    setSyncingIndicator(true);
    setTimeout(() => {
      // Flush offline captured leads to the global database store
      if (pendingOfflineLeads.length > 0) {
        pendingOfflineLeads.forEach(lead => {
          DbManager.addLead(lead);
        });
        setPendingOfflineLeads([]);
      }
      setLastSyncedMinutes(0);
      setSyncingIndicator(false);
      setSuccessMsg("Offline ledger synced successfully with Pune headquarters!");
      setTimeout(() => setSuccessMsg(""), 5000);
      refreshData();
    }, 120000 / 100); // Quick elegant spinner transition (1.2s)
  };

  // Toggle Connection Simulator
  const toggleOfflineMode = (goOffline: boolean) => {
    if (goOffline) {
      setOfflineMode(true);
      setLastSyncedMinutes(0);
    } else {
      setOfflineMode(false);
      handleSyncLedger();
    }
  };

  // GPS locking logic
  const triggerGpsLock = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCapturedCoords({ latitude, longitude });
        try {
          const response = await fetch(`/api/maps/geocode?lat=${latitude}&lng=${longitude}`);
          if (response.ok) {
            const data = await response.json();
            setAddress(data.address || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
          } else {
            setAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)} (Accuracy: ±${accuracy.toFixed(1)}m)`);
          }
        } catch (err) {
          setAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)} (Accuracy: ±${accuracy.toFixed(1)}m)`);
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        let msg = "Failed to fetch GPS coordinates";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "GPS permission denied. Please allow location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "GPS position unavailable. Ensure device location is enabled.";
        } else if (error.code === error.TIMEOUT) {
          msg = "GPS request timed out. Please try again.";
        }
        setGpsError(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Capture Lead Submission (retained fallback)
  const handleCaptureLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !address) return;

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      stage: 'captured',
      surveyorId: user.id,
      contactInfo: {
        name: clientName,
        phone: clientPhone,
        email: `${clientName.toLowerCase().replace(/\s+/g, '')}@gmail.com`
      },
      buildingInfo: {
        address,
        floors,
        type: propertyType,
        latitude: capturedCoords ? capturedCoords.latitude : 18.5204 + Math.random() * 0.04,
        longitude: capturedCoords ? capturedCoords.longitude : 73.8567 + Math.random() * 0.04
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (offlineMode) {
      // Add to cached local list first
      setPendingOfflineLeads(prev => [newLead, ...prev]);
      setSuccessMsg("Saved to Offline Cache! Syncing required to post to CRM.");
    } else {
      DbManager.addLead(newLead);
      setSuccessMsg(lt.successCaptured);
    }

    setTimeout(() => setSuccessMsg(''), 6000);

    // Reset fields
    setClientName('');
    setClientPhone('');
    setAddress('');
    setFloors(4);
    setCapturedCoords(null);
    setGpsError(null);
    setShowCaptureModal(false);
    refreshData();
  };

  // Handle click on the custom Pune site grid map to manually calibrate coordinates
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = x / rect.width;
    const pctY = y / rect.height;
    
    // Map physical grid tap to geographic boundary coordinates around Pune city (18.5204° N, 73.8567° E)
    const mapLat = 18.5204 + (0.5 - pctY) * 0.03;
    const mapLng = 73.8567 + (pctX - 0.5) * 0.03;
    
    setCapturedCoords({ latitude: mapLat, longitude: mapLng });
    setGpsAccuracy(1.2); // Calibration precision error is ±1.2 meters
    setManualGpsAdjusted(true);
    setAddress(`Pune Local Grid (Calibrated: Lat ${mapLat.toFixed(6)}, Lng ${mapLng.toFixed(6)})`);
    
    saveLeadDraft({ 
      capturedCoords: { latitude: mapLat, longitude: mapLng },
      gpsAccuracy: 1.2,
      manualGpsAdjusted: true,
      address: `Pune Local Grid (Calibrated: Lat ${mapLat.toFixed(6)}, Lng ${mapLng.toFixed(6)})`
    });
  };

  // Watermark Burn Utility (burns dynamic field context directly into pixels of captured JPEG files)
  const burnWatermark = (originalDataUrl: string, promptText: string, coords: {latitude: number, longitude: number}, isLive: boolean): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = originalDataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 800;
        canvas.height = img.height || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw the physical photo
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Draw semi-transparent background overlay banner for data-stamping
          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.fillRect(0, canvas.height - 85, canvas.width, 85);
          
          // Solid gold separator line (Ascension Brand Guideline)
          ctx.fillStyle = '#B8873D';
          ctx.fillRect(0, canvas.height - 85, canvas.width, 4);
          
          // Header Text
          ctx.font = 'bold 13px "IBM Plex Mono", monospace';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(`ALL INDIA ELEVATORS CO. • SITE INSPECTION SECURE RECORD`, 20, canvas.height - 58);
          
          // Detail Text
          ctx.font = '12px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#E6DFD4';
          const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
          ctx.fillText(`PROMPT TYPE: ${promptText.toUpperCase()} • DATE/TIME: ${timestamp}`, 20, canvas.height - 38);
          
          // GPS Location Tag + Cryptographic live/archive signal tag
          ctx.font = 'bold 11px "IBM Plex Mono", monospace';
          ctx.fillStyle = isLive ? '#2E9B78' : '#EA580C';
          const sourceText = isLive ? '🟢 SECURE FIELD CAPTURE' : '⚠️ IMPORTED PHOTO (NON-LIVE)';
          ctx.fillText(`GEOTAG: ${coords.latitude.toFixed(6)}° N, ${coords.longitude.toFixed(6)}° E • ${sourceText}`, 20, canvas.height - 18);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => {
        resolve(originalDataUrl);
      };
    });
  };

  // Start the automated secure transmission simulation with the gold Ascension Line elevator motif
  const handleTransmissionStart = () => {
    setIsTransmitting(true);
    setTransmissionStep(1);
    setTransmissionProgressCurrent(0);
    setTransmissionProgressTotal(0);
    setTransmissionLogs([
      "Initializing AI commission pipeline secure socket...",
      "Validating local SQLite/IndexedDB encrypted cache nodes..."
    ]);
    setShowCelebration(false);

    // Stage 1: Local Cache Lock (1s)
    setTimeout(() => {
      setTransmissionProgressCurrent(40);
      setTransmissionLogs(prev => [...prev, "Syncing draft node schema parameters...", "Generating local asymmetric keypair..."]);
    }, 300);

    setTimeout(() => {
      setTransmissionProgressCurrent(80);
      setTransmissionLogs(prev => [...prev, "Locking surveyor signature: AIEC-STAMP-3121..."]);
    }, 600);

    setTimeout(() => {
      setTransmissionStep(2);
      setTransmissionProgressCurrent(0);
      setTransmissionProgressTotal(20);
      setTransmissionLogs(prev => [...prev, "✔ Floor 1 Locked: Local SQLite database cache successfully sealed."]);
    }, 1000);

    // Stage 2: GPS Calibration (1.2s)
    setTimeout(() => {
      setTransmissionProgressCurrent(30);
      setTransmissionLogs(prev => [
        ...prev, 
        `Connecting to satellite verifier...`,
        `Analyzing coordinates: ${capturedCoords?.latitude.toFixed(6)}° N, ${capturedCoords?.longitude.toFixed(6)}° E...`
      ]);
    }, 1200);

    setTimeout(() => {
      setTransmissionProgressCurrent(70);
      setTransmissionLogs(prev => [
        ...prev,
        `Verifying geofence range in Pune Sector matrix (Accuracy ±${gpsAccuracy.toFixed(1)}m)...`
      ]);
    }, 1700);

    setTimeout(() => {
      setTransmissionStep(3);
      setTransmissionProgressCurrent(0);
      setTransmissionProgressTotal(40);
      setTransmissionLogs(prev => [...prev, "✔ Floor 2 Calibrated: Zero-offset geofence anchor validated."]);
    }, 2200);

    // Stage 3: Media Vault Uploads (1.8s)
    setTimeout(() => {
      setTransmissionProgressCurrent(20);
      setTransmissionLogs(prev => [
        ...prev,
        "Scanning site photometrics inside Secure Media Vault...",
        "Processing Facade Profile Image (exterior_facade.jpg)..."
      ]);
    }, 2400);

    setTimeout(() => {
      setTransmissionProgressCurrent(50);
      setTransmissionLogs(prev => [
        ...prev,
        "Processing Shaft Entrance Landing Image (entrance_profile.jpg)..."
      ]);
    }, 2900);

    setTimeout(() => {
      setTransmissionProgressCurrent(85);
      setTransmissionLogs(prev => [
        ...prev,
        "Processing Street Board Landmark Image (landmark_profile.jpg)...",
        "Burning cryptographic watermarks onto image payloads..."
      ]);
    }, 3500);

    setTimeout(() => {
      setTransmissionStep(4);
      setTransmissionProgressCurrent(0);
      setTransmissionProgressTotal(60);
      setTransmissionLogs(prev => [...prev, "✔ Floor 3 Secured: Photometrics and watermarked site proofs uploaded."]);
    }, 4000);

    // Stage 4: Sync to Pune HQ Ledger (1.5s)
    setTimeout(() => {
      setTransmissionProgressCurrent(40);
      setTransmissionLogs(prev => [
        ...prev,
        "Opening encrypted transport tunnel to Pune Regional Office ledger...",
        "Streaming 2D blueprint vector data arrays..."
      ]);
    }, 4200);

    setTimeout(() => {
      setTransmissionProgressCurrent(80);
      setTransmissionLogs(prev => [
        ...prev,
        "Registering pipeline ID with executive surveyor desk...",
        "Setting up automated dispatch cadences..."
      ]);
    }, 4900);

    setTimeout(() => {
      setTransmissionStep(5);
      setTransmissionProgressCurrent(0);
      setTransmissionProgressTotal(80);
      setTransmissionLogs(prev => [...prev, "✔ Floor 4 Synchronized: Record actively mapped to Pune Headquarters Core CRM."]);
    }, 5500);

    // Stage 5: Payout/Ledger Entry (1.2s)
    setTimeout(() => {
      setTransmissionProgressCurrent(50);
      setTransmissionLogs(prev => [
        ...prev,
        "Connecting to SBI direct routing endpoint...",
        "Verifying registered payout details..."
      ]);
    }, 5700);

    setTimeout(() => {
      setTransmissionProgressCurrent(90);
      setTransmissionLogs(prev => [
        ...prev,
        "Initiating ₹1,500 direct-commission credit allocation...",
        "NPCI penny-drop verified successfully."
      ]);
    }, 6200);

    setTimeout(() => {
      setTransmissionProgressCurrent(100);
      setTransmissionProgressTotal(100);
      setTransmissionLogs(prev => [
        ...prev,
        "✔ Floor 5 Transmitted: Commission registered successfully on Ledger!",
        "Secure site node transmission sequence successfully closed."
      ]);
      setShowCelebration(true);
    }, 6700);
  };

  // Submit fully compiled 4-step wizard lead to SQLite/DbManager or offline queue
  const handleWizardSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!clientName || (!clientPhone && !noDirectContact) || !address) return;

    // Map dictionary of keys into array of photos matching schema
    const photosArray = Object.entries(sitePhotos).map(([key, value]: [string, any]) => ({
      prompt: key === 'front' ? 'Exterior Front View' : key === 'entrance' ? 'Main Lobby Entrance' : 'Nearest Landmark',
      dataUrl: value.dataUrl,
      timestamp: value.timestamp,
      geotag: value.geotag,
      isLive: value.isLive
    }));

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      stage: 'captured',
      surveyorId: user.id,
      contactInfo: {
        name: clientName,
        phone: noDirectContact ? "In-Person Visit Only" : clientPhone,
        email: `${clientName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        companyName: companyName || undefined,
        role: contactRole || undefined,
        consentGiven: contactConsentFlag,
        noDirectContact: noDirectContact,
        relationshipNote: relationshipNote || undefined
      },
      buildingInfo: {
        address,
        floors,
        type: isMixedUse ? 'mixed-use' : propertyType,
        latitude: capturedCoords ? capturedCoords.latitude : 18.5204,
        longitude: capturedCoords ? capturedCoords.longitude : 73.8567,
        floor_count: floors,
        usage_type: isMixedUse ? 'mixed-use' : propertyType,
        construction_stage: constructionStage,
        shaft_dimensions_estimate: isShaftInaccessible ? "Inaccessible - early construction stage" : `${shaftWidthEstimate} x ${shaftDepthEstimate} mm`,
        is_shaft_inaccessible: isShaftInaccessible,
        is_mixed_use: isMixedUse,
        mixed_category_detail: isMixedUse ? mixedCategoryDetail : undefined,
        is_unusually_tall: floors >= 20,
        special_notes: specialNotes || undefined,
        passenger_capacity_estimate: passengerCapacityEstimate,
        shaft_sketch_data_url: shaftSketchDataUrl || undefined
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Secure Data Model bindings
      gps_lat_lng: capturedCoords ? `${capturedCoords.latitude.toFixed(6)}, ${capturedCoords.longitude.toFixed(6)}` : undefined,
      gps_accuracy_meters: gpsAccuracy,
      site_photos: photosArray,
      capture_timestamp: new Date().toISOString(),
      nearest_landmark_note: landmarkNote
    };

    if (offlineMode) {
      setPendingOfflineLeads(prev => [newLead, ...prev]);
      setSuccessMsg("Lead saved to offline Pune North Grid ledger!");
    } else {
      DbManager.addLead(newLead);
      setSuccessMsg(lt.successCaptured);
    }

    setTimeout(() => setSuccessMsg(''), 6000);

    // Completely clear draft and state
    localStorage.removeItem('aiec_lead_draft');
    setClientName('');
    setClientPhone('');
    setAddress('');
    setFloors(4);
    setPropertyType('residential');
    setLandmarkNote('');
    setCapturedCoords(null);
    setSitePhotos({});
    setCaptureStep(1);
    setGpsAccuracy(4.2);
    setManualGpsAdjusted(false);
    setPoorAccuracyWarningDismissed(false);
    setGpsError(null);
    setShowCaptureModal(false);
    setIsTransmitting(false);
    setShowCelebration(false);
    setTransmissionStep(1);
    setTransmissionProgressCurrent(0);
    setTransmissionProgressTotal(0);
    setTransmissionLogs([]);
    refreshData();
  };

  // Simulate CRM/Admin activity to add a new follow-up
  const handleSimulateCRMTask = () => {
    const customId = `lead_custom_${Date.now()}`;
    // Register the lead behind this task as well
    const associatedLead: Lead = {
      id: customId,
      stage: 'assigned',
      surveyorId: user.id,
      contactInfo: {
        name: "Abhay Mahajan (Builder)",
        phone: "+91 94220 55667",
        email: "mahajan.abhay@puneinfra.in"
      },
      buildingInfo: {
        address: "Mahajan Pride, Phase 2, Balewadi High Street, Pune 411045",
        floors: 11,
        type: 'residential',
        latitude: 18.5772,
        longitude: 73.7745
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    DbManager.addLead(associatedLead);

    const newTask = {
      id: `task_${Date.now()}`,
      leadId: customId,
      contactName: 'Abhay Mahajan (Builder)',
      projectName: 'Mahajan Pride (Site Inspection)',
      phone: '+91 94220 55667',
      address: 'Mahajan Pride, Phase 2, Balewadi High Street, Pune 411045',
      dueTimeText: 'Immediate Action (Just Assigned)',
      dueTimeEpoch: Date.now() - 5000, // Make it overdue to test order
      reason: 'Urgent concrete landing site inspection requested by Master Admin',
      completed: false
    };

    setFollowupTasks(prev => [newTask, ...prev]);
    setSuccessMsg("CRM Engine triggered! New high-priority task pushed to list.");
    setTimeout(() => setSuccessMsg(""), 5000);
    refreshData();
  };

  // Simulate Admin closing a lead, demonstrating auto-removing stale followups
  const handleAdminClosesSureshPatil = () => {
    // Find Suresh Patil's lead (lead_2) and update its status to closed_won (closed elsewhere)
    const allLeads = DbManager.getLeads();
    const sureshLead = allLeads.find(l => l.id === 'lead_2');
    if (sureshLead) {
      const updatedSuresh = {
        ...sureshLead,
        stage: 'closed_won' as LeadStage,
        commissionEarned: 25000,
        updatedAt: new Date().toISOString()
      };
      DbManager.updateLead(updatedSuresh);
      setSuccessMsg("Admin updated Suresh Patil lead to 'Closed Won'. Stale task removed automatically!");
      setTimeout(() => setSuccessMsg(""), 5000);
      refreshData();
    } else {
      // If suserh lead is missing, just reset DB seeds
      DbManager.resetToSeeds();
      refreshData();
    }
  };

  // Toggle KYC Verification State
  const handleToggleKycClearance = () => {
    const nextStatus = dbUser.bankVerifiedStatus === 'verified' ? 'pending' : 'verified';
    const updated = {
      ...dbUser,
      bankVerifiedStatus: nextStatus as any
    };
    DbManager.updateUser(updated);
    setDbUser(updated);
    setSuccessMsg(`KYC Account verification simulated to ${nextStatus.toUpperCase()}`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Calculate snapshot variables
  const dbLeads = DbManager.getLeads();

  // 1. Leads Captured Today: check if lead was captured today (local date)
  const todayStr = new Date().toISOString().split('T')[0];
  const capturedTodayCount = leads.filter(l => l.createdAt.startsWith(todayStr)).length + pendingOfflineLeads.length;

  // 2. Active follow up tasks: filter out tasks whose leads were closed by Admin/CRM
  const activeTasks = followupTasks.filter(task => {
    const associatedLead = dbLeads.find(l => l.id === task.leadId);
    // If the lead was closed won or closed lost by someone else, auto-remove it!
    if (associatedLead && (associatedLead.stage === 'closed_won' || associatedLead.stage === 'closed_lost')) {
      return false;
    }
    return !task.completed;
  }).sort((a, b) => a.dueTimeEpoch - b.dueTimeEpoch);

  // 3. Weekly commission earned: sum of commissions from closed_won leads of this surveyor
  const commissionEarnedThisWeek = leads.filter(l => l.stage === 'closed_won').reduce((sum, l) => sum + (l.commissionEarned || 25000), 0);

  // 4. Current Rank on leaderboard (calculated dynamically among all surveyors)
  const surveyors = DbManager.getUsers().filter(u => u.role === 'surveyor');
  const surveyorRankings = surveyors.map(s => {
    const sLeads = dbLeads.filter(l => l.surveyorId === s.id);
    const earned = sLeads.filter(l => l.stage === 'closed_won').reduce((sum, l) => sum + (l.commissionEarned || 25000), 0);
    return { surveyorId: s.id, earned };
  }).sort((a, b) => b.earned - a.earned);
  const currentRank = surveyorRankings.findIndex(r => r.surveyorId === user.id) + 1 || 1;

  // Progress Bar Calculations (Adhering to additional instructions: Show each time current % progress bar & total % progress bar)
  // Current progress bar = today's route/task completion percentage
  const totalRouteTasks = routeStops.filter(s => s.status !== 'skipped').length;
  const completedRouteTasks = routeStops.filter(s => s.status === 'completed').length;
  const currentProgressBarPercent = totalRouteTasks > 0 ? Math.round((completedRouteTasks / totalRouteTasks) * 100) : 100;

  // Total progress bar = leads captured toward surveyor's weekly target (goal is 6 leads)
  const weeklyLeadTarget = 6;
  const totalProgressBarPercent = Math.min(100, Math.round((leads.length / weeklyLeadTarget) * 100));

  return (
    <div className="space-y-6">
      
      {/* Dynamic Notification Bar */}
      {successMsg && (
        <div className="p-4 bg-success/15 border border-success/30 rounded-2xl text-success text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-5 h-5 shrink-0 text-success" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* PERSISTENT PROGRESS TELEMETRY BAR DOCK (Current & Total %) */}
      <div className="p-4 bg-[#F8F6F1] rounded-2xl border border-[rgba(184,135,61,0.25)] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-royalemerald animate-pulse shrink-0" />
          <span className="font-bold text-charcoal font-serif text-sm">Pune Field Work Dashboard</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-2 flex-1 md:flex-none bg-white py-1.5 px-3 rounded-lg border border-border">
            <span className="text-[10px] uppercase font-extrabold text-royalemerald shrink-0">Today's Inspection (Current % Progress):</span>
            <div className="w-20 sm:w-24 h-2 bg-[#e5dfd4] rounded-full overflow-hidden shrink-0">
              <div className="h-full bg-royalemerald transition-all duration-500" style={{ width: `${currentProgressBarPercent}%` }} />
            </div>
            <span className="font-mono font-extrabold text-royalemerald shrink-0">{currentProgressBarPercent}%</span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2 flex-1 md:flex-none bg-white py-1.5 px-3 rounded-lg border border-border">
            <span className="text-[10px] uppercase font-extrabold text-antiquegold shrink-0">Weekly Goal (Total % Progress):</span>
            <div className="w-20 sm:w-24 h-2 bg-[#e5dfd4] rounded-full overflow-hidden shrink-0">
              <div className="h-full bg-antiquegold transition-all duration-500" style={{ width: `${totalProgressBarPercent}%` }} />
            </div>
            <span className="font-mono font-extrabold text-antiquegold shrink-0">{totalProgressBarPercent}%</span>
          </div>
        </div>
      </div>

      {/* Online/Offline Banner Status */}
      {offlineMode ? (
        <div className="p-3.5 bg-error/10 border border-error/20 rounded-2xl text-error text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping shrink-0" />
            <p className="font-semibold uppercase tracking-wider">{lt.offlineBarMsg}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="font-mono text-[10px] bg-white/50 border border-error/10 px-2 py-0.5 rounded-md text-error self-center font-bold">
              {lt.lastSynced.replace("{time}", String(lastSyncedMinutes))}
            </span>
            <button
              onClick={() => toggleOfflineMode(false)}
              className="px-2.5 py-1 bg-error text-white font-bold rounded-lg text-[10px] uppercase cursor-pointer hover:bg-opacity-95"
            >
              {lt.goOnlineBtn}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-royalemerald/10 border border-royalemerald/20 rounded-2xl text-royalemerald text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-royalemerald shrink-0" />
            <p className="font-semibold">{lt.onlineMode}</p>
          </div>
          <button
            onClick={() => toggleOfflineMode(true)}
            className="text-[10px] bg-royalemerald/10 border border-royalemerald/25 hover:bg-royalemerald/20 text-royalemerald px-2 py-1 rounded-lg uppercase font-bold cursor-pointer font-mono"
          >
            {lt.goOfflineBtn}
          </button>
        </div>
      )}

      {/* Welcome Bar - Royal Ivory Styled */}
      <div className="p-6 rounded-2xl bg-white border border-border shadow-diffuse flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-antiquegold font-mono">{lt.fieldPortal}</span>
          <h2 className="font-serif text-2xl font-black text-charcoal">{lt.welcomeMsg}, {user.name}</h2>
          <p className="text-xs text-warmgray">
            {lt.authorizedTerritory}: <span className="font-bold text-charcoal">{user.region}</span> • {lt.commissionActive}
          </p>
        </div>
        
        {/* Rapid CTA Box */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setGpsError(null);
              setCapturedCoords(null);
              setShowCaptureModal(true);
            }}
            className="px-5 py-3.5 bg-antiquegold text-white hover:bg-opacity-95 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <PlusCircle className="w-4.5 h-4.5 text-white" />
            <span>{lt.captureLeadCTA}</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------
          REQUIRED PROGRESS BARS: Current % Progress Bar & Total % Progress Bar
          --------------------------------------------------------- */}
      <Card className="p-6 space-y-5">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-charcoal border-b border-[rgba(184,135,61,0.1)] pb-2.5">
          📊 Field Progression Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          
          {/* Current Progress Bar: Today's Route Inspection Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-charcoal flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-royalemerald shrink-0" />
                <span>{lt.todayProgress} (Current % Progress)</span>
              </span>
              <span className="font-mono font-bold text-royalemerald">
                {completedRouteTasks} / {totalRouteTasks} {lt.completedLabel} ({currentProgressBarPercent}%)
              </span>
            </div>
            {/* Horizontal progress bar */}
            <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-border">
              <div 
                className="h-full bg-royalemerald transition-all duration-500 rounded-full"
                style={{ width: `${currentProgressBarPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-warmgray">Status of scheduled visits along today's optimized site inspection path.</p>
          </div>

          {/* Total Progress Bar: Weekly Lead Target / Commission Multiplier Unlock */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-charcoal flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-antiquegold shrink-0" />
                <span>{lt.totalProgress} (Total % Progress)</span>
              </span>
              <span className="font-mono font-bold text-antiquegold">
                {leads.length} / {weeklyLeadTarget} {lt.leadsLabel} ({totalProgressBarPercent}%)
              </span>
            </div>
            {/* Horizontal progress bar */}
            <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-border">
              <div 
                className="h-full bg-antiquegold transition-all duration-500 rounded-full"
                style={{ width: `${totalProgressBarPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-warmgray">{lt.weeklyGoalLabel} to trigger high-volume commission tier bonus.</p>
          </div>

        </div>
      </Card>

      {/* KPI SNAPSHOT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Leads Captured Today */}
        <div 
          onClick={() => setSubView('history')}
          className="p-4 bg-white rounded-2xl border border-border shadow-diffuse space-y-1 hover:border-antiquegold/30 transition-all cursor-pointer active:scale-98"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-warmgray block">{lt.capturedToday}</span>
          <div className="flex justify-between items-baseline">
            <span className="font-mono text-2xl font-extrabold text-charcoal">
              {offlineMode ? cachedStats.leadsToday : capturedTodayCount}
            </span>
            <span className="text-[10px] font-bold text-success flex items-center">
              ▲ 100%
            </span>
          </div>
          <span className="text-[9px] text-warmgray block">Site registrations</span>
        </div>

        {/* Follow-up Tasks Due */}
        <div 
          onClick={() => setSubView('route')}
          className="p-4 bg-white rounded-2xl border border-border shadow-diffuse space-y-1 hover:border-antiquegold/30 transition-all cursor-pointer active:scale-98"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-warmgray block">{lt.followupsDue}</span>
          <div className="flex justify-between items-baseline">
            <span className="font-mono text-2xl font-extrabold text-charcoal">
              {offlineMode ? cachedStats.followupsDue : activeTasks.length}
            </span>
            {activeTasks.length > 0 && (
              <span className="text-[10px] font-bold text-warning flex items-center">
                ● {activeTasks.length} pending
              </span>
            )}
          </div>
          <span className="text-[9px] text-warmgray block">SOP visits due today</span>
        </div>

        {/* Weekly Commission Earned */}
        <div 
          onClick={() => setSubView('commission')}
          className="p-4 bg-white rounded-2xl border border-border shadow-diffuse space-y-1 hover:border-antiquegold/30 transition-all cursor-pointer active:scale-98"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-warmgray block">{lt.weeklyCommission}</span>
          <div className="flex justify-between items-baseline">
            <span className="font-mono text-xl font-black text-royalemerald">
              ₹{(offlineMode ? cachedStats.commissionEarned : commissionEarnedThisWeek).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold text-success">
              +₹25k
            </span>
          </div>
          <span className="text-[9px] text-warmgray block">From won deals ledger</span>
        </div>

        {/* Current Rank on Leaderboard */}
        <div 
          className="p-4 bg-white rounded-2xl border border-border shadow-diffuse space-y-1 hover:border-antiquegold/30 transition-all cursor-pointer active:scale-98"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-warmgray block">{lt.currentRank}</span>
          <div className="flex justify-between items-baseline">
            <span className="font-serif text-2xl font-black text-antiquegold">
              #{offlineMode ? cachedStats.rank : currentRank}
            </span>
            <span className="text-[10px] font-bold text-success">
              🏆 Top 3
            </span>
          </div>
          <span className="text-[9px] text-warmgray block">Of {surveyors.length} field surveyors</span>
        </div>

      </div>

      {/* QUICK VIEW SWITCHER TABS */}
      <div className="flex border-b border-[rgba(184,135,61,0.15)] gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSubView('overview')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
            subView === 'overview'
              ? 'bg-white border-t border-x border-[rgba(184,135,61,0.15)] text-antiquegold border-b border-b-white z-10 font-extrabold'
              : 'text-warmgray hover:text-charcoal'
          }`}
        >
          {lt.dashboardTab}
        </button>
        <button
          onClick={() => setSubView('route')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
            subView === 'route'
              ? 'bg-white border-t border-x border-[rgba(184,135,61,0.15)] text-antiquegold border-b border-b-white z-10 font-extrabold'
              : 'text-warmgray hover:text-charcoal'
          }`}
        >
          {lt.routeTab}
        </button>
        <button
          onClick={() => setSubView('history')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
            subView === 'history'
              ? 'bg-white border-t border-x border-[rgba(184,135,61,0.15)] text-antiquegold border-b border-b-white z-10 font-extrabold'
              : 'text-warmgray hover:text-charcoal'
          }`}
        >
          {lt.historyTab}
        </button>
        <button
          onClick={() => setSubView('commission')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
            subView === 'commission'
              ? 'bg-white border-t border-x border-[rgba(184,135,61,0.15)] text-antiquegold border-b border-b-white z-10 font-extrabold'
              : 'text-warmgray hover:text-charcoal'
          }`}
        >
          {lt.commissionTab}
        </button>
        <button
          onClick={() => setSubView('rewards')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
            subView === 'rewards'
              ? 'bg-white border-t border-x border-[rgba(184,135,61,0.15)] text-antiquegold border-b border-b-white z-10 font-extrabold'
              : 'text-warmgray hover:text-charcoal'
          }`}
        >
          {lt.rewardsTab}
        </button>
      </div>

      {/* ---------------------------------------------------------
          SUB-VIEWS ROUTING
          --------------------------------------------------------- */}
      
      {/* CASE A: If the surveyor has absolute zero leads on the platform (FIRST DAY) */}
      {leads.length === 0 && pendingOfflineLeads.length === 0 && subView === 'overview' ? (
        <Card className="p-8 text-center space-y-5 border-dashed border-2 border-antiquegold/30 bg-white shadow-diffuse max-w-xl mx-auto py-12">
          <div className="w-16 h-16 rounded-full bg-antiquegold/10 flex items-center justify-center mx-auto animate-pulse">
            <Building className="w-8 h-8 text-antiquegold" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-charcoal">
              {lt.emptyTitle.replace("{name}", user.name)}
            </h3>
            <p className="text-xs text-warmgray leading-relaxed max-w-md mx-auto">
              {lt.emptyDesc}
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowCaptureModal(true)}
            className="mx-auto"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>{lt.startFirstLead}</span>
          </Button>
        </Card>
      ) : (
        <>
          {/* VIEW 1: DEFAULT OVERVIEW */}
          {subView === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Follow-up Tasks Agenda */}
              <div className="lg:col-span-2 space-y-6">
                
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(184,135,61,0.1)] pb-4 mb-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                        <Clock className="w-5 h-5 text-antiquegold shrink-0" />
                        <span>{lt.activeTasks} ({activeTasks.length})</span>
                      </h3>
                      <p className="text-xs text-warmgray">Assigned by Pune HQ CRM engine sorted by urgent due timestamps.</p>
                    </div>
                    
                    {/* Sandbox Simulator Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      <button 
                        onClick={handleSimulateCRMTask}
                        className="px-2 py-1 bg-alabaster border border-[rgba(184,135,61,0.15)] hover:bg-[#edeae2] rounded-lg text-[10px] font-bold uppercase text-charcoal cursor-pointer"
                      >
                        ⚡ {lt.addCRMTask}
                      </button>
                      <button 
                        onClick={handleAdminClosesSureshPatil}
                        title={lt.adminClosesLeadDesc}
                        className="px-2 py-1 bg-error/5 border border-error/15 text-error hover:bg-error/10 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                      >
                        ⚠️ {lt.adminClosesLead}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {activeTasks.length === 0 ? (
                      <div className="p-8 text-center bg-alabaster/40 rounded-2xl border border-dashed border-border text-warmgray text-xs space-y-1">
                        <Smile className="w-7 h-7 mx-auto text-antiquegold" />
                        <p className="font-semibold">All follow-ups completed for today!</p>
                        <p className="text-[10px]">No pending inspection tasks assigned. Take coffee and capture some cold leads!</p>
                      </div>
                    ) : (
                      activeTasks.map(task => {
                        const associatedLead = dbLeads.find(l => l.id === task.leadId);
                        const isOverdue = task.dueTimeEpoch < Date.now();
                        return (
                          <div 
                            key={task.id} 
                            className={`p-4 bg-alabaster rounded-2xl border transition-all hover:border-antiquegold/25 relative flex flex-col justify-between gap-3 ${
                              isOverdue ? 'border-error/20 bg-error/[0.01]' : 'border-border'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-bold text-sm text-charcoal">{task.contactName}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    isOverdue ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
                                  }`}>
                                    {isOverdue ? 'OVERDUE' : 'DUE'}
                                  </span>
                                  {associatedLead && (
                                    <span className="px-1.5 py-0.5 bg-royalemerald/10 text-royalemerald rounded text-[9px] uppercase font-bold">
                                      CRM: {associatedLead.stage}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-charcoal font-medium mt-0.5">{task.projectName}</p>
                                <p className="text-xs text-warmgray flex items-center gap-1 mt-1 font-sans">
                                  <MapPin className="w-3.5 h-3.5 text-antiquegold shrink-0" />
                                  <span className="truncate max-w-[280px]">{task.address}</span>
                                </p>
                              </div>
                              <span className="font-mono text-xs font-bold text-charcoal bg-white border border-border px-2 py-1 rounded-lg">
                                {task.dueTimeText}
                              </span>
                            </div>

                            <p className="text-xs italic text-warmgray bg-white/70 p-2.5 rounded-xl border border-border/40">
                              ℹ {task.reason}
                            </p>

                            <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#e6dfd4]">
                              <span className="text-[10px] text-warmgray font-mono">Lead ID: {task.leadId}</span>
                              <button
                                onClick={() => {
                                  // Mark task as completed
                                  setFollowupTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t));
                                  setSuccessMsg(`Task at ${task.projectName} completed!`);
                                  setTimeout(() => setSuccessMsg(""), 4000);
                                  refreshData();
                                }}
                                className="px-3.5 py-1.5 bg-royalemerald text-white hover:bg-opacity-95 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>{lt.checkInBtn}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>

              </div>

              {/* Right Column: Mini Tools & Actions */}
              <div className="space-y-6">
                
                {/* Rapid Capture Card Prompt */}
                <Card className="p-6 bg-gradient-to-br from-white to-[#FAF8F4] text-charcoal space-y-4">
                  <div className="w-10 h-10 rounded-full bg-antiquegold/15 flex items-center justify-center">
                    <Building className="w-5 h-5 text-antiquegold" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-charcoal">Are you standing on-site?</h4>
                    <p className="text-xs text-warmgray mt-1 leading-relaxed">
                      Lock builder records immediately via satellite coordinates to prevent route hijacking and claim your verified commission ledger.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setGpsError(null);
                      setCapturedCoords(null);
                      setShowCaptureModal(true);
                    }}
                    className="w-full py-3 bg-antiquegold text-white text-xs uppercase font-extrabold tracking-wider rounded-xl hover:bg-opacity-95 shadow-sm cursor-pointer"
                  >
                    + {lt.captureLeadCTA}
                  </button>
                </Card>

                {/* Grounding maps tool */}
                <GeminiMapsTool />

              </div>

            </div>
          )}

          {/* VIEW 2: MY ROUTE PATH WITH VERTICAL ASCENSION LINE */}
          {subView === 'route' && (() => {
            const rlt: Record<string, any> = {
              en: {
                title: "Surveyor Daily Route Planner",
                subtitle: "GPS-anchored smart sequencing for Pune North territory site inspections",
                routeIdLabel: "Active Route ID",
                plannedStops: "Planned Stops",
                actualStops: "Stops Completed",
                bountyPotential: "Bounty Est.",
                reorderTip: "Use actions below to reorder or prioritize stops. Skipped/completed stops automatically reflow.",
                skipStop: "Skip Stop",
                restoreStop: "Restore",
                openInMaps: "Directions (GPS Handoff)",
                checkInBtn: "Check In & Capture",
                completed: "Completed",
                skipped: "Skipped",
                pending: "Pending",
                all: "All Stops",
                followUps: "Follow-ups",
                explorations: "Exploration",
                summaryTitle: "Day's Progress Tracker",
                summaryDesc: "Real-time metrics computed against your route plan. Actual surveyor GPS location is the ultimate source of truth.",
                unplannedTitle: "Discovered an Unplanned Site?",
                unplannedDesc: "Excellent! Walk inside, map the shaft, and tap 'Capture New Lead' to claim your direct bounty instantly.",
                optimizeBtn: "Auto-Optimize Route Sequence",
                addExplorationBtn: "Add Discovery Node",
                allStopsDone: "Excellent! You have successfully inspected or resolved all stops in today's route plan.",
                payoutPotential: "Payout Potential",
                gpsCoord: "GPS Alignment",
                estimatedTravelTime: "Est. Travel Time",
                trafficStatus: "Traffic Status",
                searchPlaceholder: "Search stops by address or builder...",
                moveUp: "Move Up",
                moveDown: "Move Down",
                addedExplorationMsg: "Added a new nearby exploration site node to your daily route plan!",
                optimizedMsg: "Route sequence optimized! Priority given to urgent follow-ups, then minimizing travel radius."
              },
              mr: {
                title: "सर्वेक्षक दैनिक मार्ग नियोजन",
                subtitle: "पुणे उत्तर क्षेत्रातील बांधकामांच्या तपासणीसाठी जीपीएस-आधारित स्मार्ट नियोजन",
                routeIdLabel: "सक्रिय मार्ग आयडी",
                plannedStops: "नियोजित थांबे",
                actualStops: "पूर्ण केलेले थांबे",
                bountyPotential: "संभाव्य कमिशन",
                reorderTip: "थांब्यांची प्राधान्य क्रमवारी बदलण्यासाठी खालील क्रिया वापरा. वगळलेल्या थांब्यांनुसार मार्ग स्वयंचलितपणे बदलतो.",
                skipStop: "वगळा",
                restoreStop: "पुन्हा जोडा",
                openInMaps: "जीपीएस नेव्हिगेशन सुरू करा",
                checkInBtn: "चेक इन आणि नोंदणी करा",
                completed: "पूर्ण",
                skipped: "वगळलेले",
                pending: "प्रलंबित",
                all: "सर्व थांबे",
                followUps: "फॉलो-अप्स",
                explorations: "शोध ठिकाणे",
                summaryTitle: "आजचा प्रगती ट्रॅकर",
                summaryDesc: "तुमच्या मार्ग नियोजनाच्या तुलनेत मोजलेली थेट प्रगती. सर्वेक्षकाचे प्रत्यक्ष जीपीएस स्थान हेच अंतिम सत्य आहे.",
                unplannedTitle: "नियोजनाबाहेर नवीन साईट सापडली?",
                unplannedDesc: "छान! साईटवर जा, लिफ्ट शाफ्ट मोजा आणि त्वरित कमिशन मिळवण्यासाठी 'नवीन लीड नोंदवा' वर टॅप करा.",
                optimizeBtn: "मार्ग स्वयंचलित अनुकूलित करा",
                addExplorationBtn: "नवीन शोध ठिकाण जोडा",
                allStopsDone: "उत्कृष्ट! तुम्ही आजच्या नियोजित मार्गावरील सर्व थांबे यशस्वीरीत्या पूर्ण केले आहेत.",
                payoutPotential: "संभाव्य मोबदला",
                gpsCoord: "जीपीएस संरेखन",
                estimatedTravelTime: "अंदाजे प्रवास वेळ",
                trafficStatus: "रहदारीची स्थिती",
                searchPlaceholder: "पत्ता किंवा बिल्डरद्वारे थांबे शोधा...",
                moveUp: "वर सरकवा",
                moveDown: "खाली सरकवा",
                addedExplorationMsg: "तुमच्या दैनिक मार्ग नियोजनात नवीन जवळपासचे शोध ठिकाण जोडले गेले आहे!",
                optimizedMsg: "मार्ग अनुक्रम अनुकूलित! प्रलंबित फॉलो-अप्सना प्राधान्य देऊन प्रवासाचे अंतर कमी केले गेले आहे."
              },
              hi: {
                title: "सर्वेक्षक दैनिक मार्ग योजना",
                subtitle: "पुणे उत्तर क्षेत्र में निर्माण स्थलों के भौतिक निरीक्षण के लिए जीपीएस-आधारित योजना",
                routeIdLabel: "सक्रिय मार्ग आईडी",
                plannedStops: "नियोजित स्टॉप",
                actualStops: "पूर्ण किए गए स्टॉप",
                bountyPotential: "संभावित बोनस",
                reorderTip: "स्टॉप की प्राथमिकता बदलने के लिए नीचे दी गई क्रियाओं का उपयोग करें। छोड़े गए स्टॉप के अनुसार मार्ग स्वतः बदलता है।",
                skipStop: "छोड़ें",
                restoreStop: "पुनर्स्थापित करें",
                openInMaps: "जीपीएस नेविगेशन",
                checkInBtn: "चेक इन और पंजीकरण करें",
                completed: "पूर्ण",
                skipped: "छोड़ दिया",
                pending: "लंबित",
                all: "सभी स्टॉप",
                followUps: "फॉलो-अप",
                explorations: "अन्वेषण स्थल",
                summaryTitle: "दैनिक प्रगति ट्रैकर",
                summaryDesc: "आपकी मार्ग योजना के विरुद्ध मापी गई लाइव प्रगति। सर्वेक्षक का वास्तविक जीपीएस स्थान ही अंतिम सत्य है।",
                unplannedTitle: "मार्ग में कोई अनियोजित साइट मिली?",
                unplannedDesc: "बहुत बढ़िया! साइट के अंदर जाएं, लिफ्ट शाफ्ट मापें और तत्काल कमीशन का दावा करने के लिए 'नई लीड दर्ज करें' पर टैप करें।",
                optimizeBtn: "मार्ग स्वतः अनुकूलित करें",
                addExplorationBtn: "खोज स्थल जोड़ें",
                allStopsDone: "शानदार! आपने आज की योजना के सभी स्टॉप सफलतापूर्वक पूरे कर लिए हैं।",
                payoutPotential: "संभावित आय",
                gpsCoord: "जीपीएस संरेखण",
                estimatedTravelTime: "अनुमानित यात्रा समय",
                trafficStatus: "यातायात की स्थिति",
                searchPlaceholder: "पत्ता या बिल्डर द्वारा खोजें...",
                moveUp: "ऊपर ले जाएं",
                moveDown: "नीचे ले जाएं",
                addedExplorationMsg: "आपकी दैनिक मार्ग योजना में नया खोज स्थल जोड़ा गया है!",
                optimizedMsg: "मार्ग अनुक्रम अनुकूलित! महत्वपूर्ण फॉलो-अप को प्राथमिकता देकर दूरी कम की गई है।"
              }
            };

            const rt = rlt[appLanguage] || rlt['en'];

            // Filter stops based on search query, type, and status filters
            const filteredStops = routeStops.filter(stop => {
              const matchesSearch = 
                stop.projectName.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
                stop.address.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
                (stop.contactName && stop.contactName.toLowerCase().includes(routeSearchQuery.toLowerCase()));
              
              const matchesType = routeTypeFilter === 'all' || stop.type === routeTypeFilter;
              const matchesStatus = routeStatusFilter === 'all' || stop.status === routeStatusFilter;

              return matchesSearch && matchesType && matchesStatus;
            });

            // Count planned and actual
            const plannedCount = routeStops.filter(s => s.status !== 'skipped').length;
            const actualCount = routeStops.filter(s => s.status === 'completed').length;
            const routeBountyTotal = routeStops.reduce((sum, s) => {
              if (s.status === 'skipped') return sum;
              return sum + (s.type === 'follow_up' ? 1500 : 1000);
            }, 0);

            // Reorder stop helper
            const moveStop = (index: number, direction: 'up' | 'down') => {
              const newStops = [...routeStops];
              const targetIndex = direction === 'up' ? index - 1 : index + 1;
              if (targetIndex < 0 || targetIndex >= newStops.length) return;
              
              // Swap
              const temp = newStops[index];
              newStops[index] = newStops[targetIndex];
              newStops[targetIndex] = temp;
              
              // Re-assign sequence numbers
              const updated = newStops.map((stop, idx) => ({ ...stop, sequence: idx + 1 }));
              setRouteStops(updated);
              localStorage.setItem('aiec_surveyor_route_stops', JSON.stringify(updated));
              setSuccessMsg(rt.optimizedMsg);
              setTimeout(() => setSuccessMsg(""), 3000);
            };

            // Toggle skip / restore helper
            const toggleSkipStop = (id: string) => {
              const stop = routeStops.find(s => s.id === id);
              if (!stop) return;
              const nextStatus = stop.status === 'skipped' ? 'pending' : 'skipped';
              
              // Direct state updater
              const updated = routeStops.map(s => s.id === id ? { ...s, status: nextStatus } : s);
              setRouteStops(updated);
              localStorage.setItem('aiec_surveyor_route_stops', JSON.stringify(updated));
              
              const stopObj = routeStops.find(s => s.id === id);
              if (stopObj && stopObj.type === 'follow_up') {
                setFollowupTasks(prev => prev.map(t => t.id === id ? { ...t, completed: (nextStatus as string) === 'completed' } : t));
              }
            };

            // Complete / check-in handler
            const handleCheckInStop = (stop: any) => {
              setClientName(stop.contactName || '');
              setClientPhone(stop.phone || '');
              setAddress(stop.address || '');
              setCapturedCoords({ latitude: stop.lat, longitude: stop.lng });
              setShowCaptureModal(true);

              // Complete status
              const updated = routeStops.map(s => s.id === stop.id ? { ...s, status: 'completed' } : s);
              setRouteStops(updated);
              localStorage.setItem('aiec_surveyor_route_stops', JSON.stringify(updated));
              
              if (stop.type === 'follow_up') {
                setFollowupTasks(prev => prev.map(t => t.id === stop.id ? { ...t, completed: true } : t));
              }
            };

            // Auto-optimize route
            const handleAutoOptimize = () => {
              setIsRouteRefreshing(true);
              setTimeout(() => {
                // Sort by: follow-ups first (sorted by urgency/time), then exploration opportunities
                const followups = [...routeStops].filter(s => s.type === 'follow_up');
                const explorations = [...routeStops].filter(s => s.type === 'exploration');
                const optimized = [...followups, ...explorations].map((stop, idx) => ({
                  ...stop,
                  sequence: idx + 1
                }));
                setRouteStops(optimized);
                localStorage.setItem('aiec_surveyor_route_stops', JSON.stringify(optimized));
                setIsRouteRefreshing(false);
                setSuccessMsg(rt.optimizedMsg);
                setTimeout(() => setSuccessMsg(""), 4000);
              }, 600);
            };

            // Add discovery/exploration stop dynamically
            const handleAddDiscovery = () => {
              const currentCount = routeStops.length;
              const names = [
                "Kumar Primus Commercial Complex",
                "Lunkad Sky Vista Multi-Shaft Tower",
                "Vilas Javdekar Yashone Phase 2",
                "Pharande Spaces Woodsville Block C"
              ];
              const addresses = [
                "Kumar Primus, near Pune Station Road, Shivajinagar, Pune 411005",
                "Lunkad Sky Vista, Viman Nagar, Pune 411014",
                "Yashone Site, Hinjawadi Phase 1, Pune 411057",
                "Woodsville Site, Moshi Spine Road, PCMC, Pune 412105"
              ];
              const lats = [18.5308, 18.5679, 18.5912, 18.6674];
              const lngs = [73.8501, 73.9143, 73.7389, 73.8398];
              
              const index = Math.floor(Math.random() * names.length);
              
              const newStop = {
                id: `stop_exploration_${Date.now()}`,
                type: 'exploration',
                projectName: names[index],
                address: addresses[index],
                lat: lats[index],
                lng: lngs[index],
                dueTimeText: 'Exploration Spot',
                phone: '',
                contactName: 'Site Engineer (Walk-in)',
                status: 'pending',
                sequence: currentCount + 1,
                ruleVersion: 'v2.2'
              };
              
              const updated = [...routeStops, newStop];
              setRouteStops(updated);
              localStorage.setItem('aiec_surveyor_route_stops', JSON.stringify(updated));
              setSuccessMsg(rt.addedExplorationMsg);
              setTimeout(() => setSuccessMsg(""), 3000);
            };

            return (
              <div className="space-y-6">
                
                {/* TOP ROUTE INFO HEADER METRICS */}
                <Card className="p-6 bg-gradient-to-br from-white to-[#FAF8F4] border border-[rgba(184,135,61,0.2)]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[rgba(184,135,61,0.1)] pb-4 mb-5">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-antiquegold font-mono flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-antiquegold shrink-0" />
                        <span>{rt.title}</span>
                      </span>
                      <h3 className="font-serif text-xl font-bold text-charcoal mt-1">
                        {rt.routeIdLabel}: <span className="font-mono font-medium text-antiquegold">ROUTE-2026-07-10-01</span>
                      </h3>
                      <p className="text-xs text-warmgray mt-0.5">{rt.subtitle}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button variant="secondary" onClick={handleAutoOptimize} disabled={isRouteRefreshing} className="py-2 px-3 text-xs">
                        <RefreshCw className={`w-3.5 h-3.5 ${isRouteRefreshing ? 'animate-spin' : ''}`} />
                        <span>{rt.optimizeBtn}</span>
                      </Button>
                      <Button variant="primary" onClick={handleAddDiscovery} className="py-2 px-3 text-xs bg-royalemerald hover:bg-[#0b3c31]">
                        <PlusCircle className="w-3.5 h-3.5 text-white" />
                        <span>{rt.addExplorationBtn}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Route progress stats cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-alabaster rounded-xl border border-border">
                      <span className="text-[10px] text-warmgray font-semibold block uppercase">{rt.plannedStops}</span>
                      <span className="font-mono text-lg font-black text-charcoal">{plannedCount}</span>
                    </div>
                    <div className="p-3 bg-alabaster rounded-xl border border-border">
                      <span className="text-[10px] text-warmgray font-semibold block uppercase">{rt.actualStops}</span>
                      <span className="font-mono text-lg font-black text-royalemerald">{actualCount}</span>
                    </div>
                    <div className="p-3 bg-alabaster rounded-xl border border-border">
                      <span className="text-[10px] text-warmgray font-semibold block uppercase">{rt.bountyPotential}</span>
                      <span className="font-mono text-lg font-black text-[#B8873D]">₹{routeBountyTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-3 bg-alabaster rounded-xl border border-border">
                      <span className="text-[10px] text-warmgray font-semibold block uppercase">Route Complete %</span>
                      <span className="font-mono text-lg font-black text-royalemerald">{currentProgressBarPercent}%</span>
                    </div>
                  </div>

                  {/* Route % Progress Bar */}
                  <div className="space-y-1.5 mt-5 bg-white p-3 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-charcoal flex items-center gap-1">
                        <Compass className="w-4 h-4 text-royalemerald" />
                        <span>Today's active path progression</span>
                      </span>
                      <span className="font-mono font-bold text-royalemerald">{actualCount} / {plannedCount} stops ({currentProgressBarPercent})%</span>
                    </div>
                    <div className="h-2.5 bg-[#e5dfd4] rounded-full overflow-hidden">
                      <div className="h-full bg-royalemerald transition-all duration-500 rounded-full" style={{ width: `${currentProgressBarPercent}%` }} />
                    </div>
                  </div>
                </Card>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* LEFT COLUMN: STEPS SEQUENCE TIMELINE */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                      <div className="border-b border-[rgba(184,135,61,0.1)] pb-4 mb-4">
                        <h4 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-antiquegold shrink-0" />
                          <span>Today's Sequence Path ({filteredStops.length})</span>
                        </h4>
                        <p className="text-xs text-warmgray mt-1">{rt.reorderTip}</p>
                      </div>

                      {/* Filter Toolset */}
                      <div className="flex flex-col sm:flex-row gap-3 mb-5 p-3 bg-alabaster rounded-xl border border-border">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-warmgray" />
                          <input 
                            type="text"
                            placeholder={rt.searchPlaceholder}
                            value={routeSearchQuery}
                            onChange={(e) => setRouteSearchQuery(e.target.value)}
                            className="w-full pl-8.5 pr-3 py-1.5 bg-white border border-border rounded-lg text-xs font-sans text-charcoal focus:outline-none focus:border-antiquegold"
                          />
                        </div>
                        <div className="flex gap-2">
                          <select 
                            value={routeTypeFilter}
                            onChange={(e: any) => setRouteTypeFilter(e.target.value)}
                            className="bg-white border border-border rounded-lg text-xs font-sans text-charcoal py-1.5 px-2.5 focus:outline-none focus:border-antiquegold"
                          >
                            <option value="all">{rt.all}</option>
                            <option value="follow_up">{rt.followUps}</option>
                            <option value="exploration">{rt.explorations}</option>
                          </select>
                          <select 
                            value={routeStatusFilter}
                            onChange={(e: any) => setRouteStatusFilter(e.target.value)}
                            className="bg-white border border-border rounded-lg text-xs font-sans text-charcoal py-1.5 px-2.5 focus:outline-none focus:border-antiquegold"
                          >
                            <option value="all">All States</option>
                            <option value="pending">Pending Only</option>
                            <option value="completed">Completed Only</option>
                            <option value="skipped">Skipped Only</option>
                          </select>
                        </div>
                      </div>

                      {/* Timeline Steps using custom interactive Ascension vertical layout */}
                      <div className="space-y-4 relative">
                        {filteredStops.length === 0 ? (
                          <div className="p-10 text-center bg-alabaster/40 rounded-2xl border border-dashed border-border text-warmgray text-xs space-y-1">
                            <Smile className="w-8 h-8 mx-auto text-antiquegold" />
                            <p className="font-semibold">No stops match your filter criteria.</p>
                            <p className="text-[10px]">Try clearing search words or toggling filters.</p>
                          </div>
                        ) : (
                          filteredStops.map((stop, index) => {
                            const isCompleted = stop.status === 'completed';
                            const isSkipped = stop.status === 'skipped';
                            const isPending = stop.status === 'pending';
                            const isSelected = selectedRouteStop?.id === stop.id;

                            return (
                              <div 
                                key={stop.id}
                                onClick={() => setSelectedRouteStop(stop)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                  isCompleted ? 'bg-success/[0.02] border-success/20' :
                                  isSkipped ? 'bg-gray-50 border-gray-200 opacity-60' :
                                  isSelected ? 'bg-white border-antiquegold shadow-[0_0_12px_rgba(184,135,61,0.15)] ring-1 ring-antiquegold/30' :
                                  'bg-white border-border hover:border-antiquegold/35 hover:shadow-sm'
                                }`}
                              >
                                {/* Left part: Sequence node & Text details */}
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  {/* Golden Ascension motif visual indicator */}
                                  <div className="flex flex-col items-center shrink-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-mono text-sm font-bold ${
                                      isCompleted ? 'bg-success border-success text-white' :
                                      isSkipped ? 'bg-gray-100 border-gray-300 text-gray-400 line-through' :
                                      'bg-white border-antiquegold text-antiquegold'
                                    }`}>
                                      {isCompleted ? '✓' : stop.sequence}
                                    </div>
                                    {index < filteredStops.length - 1 && (
                                      <div className={`w-[2px] h-10 mt-1 ${isCompleted ? 'bg-success' : 'bg-[#e5dfd4]'}`} />
                                    )}
                                  </div>

                                  <div className="space-y-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h5 className={`font-serif text-sm font-bold ${isSkipped ? 'line-through text-gray-400' : 'text-charcoal'}`}>
                                        {stop.projectName}
                                      </h5>
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                                        stop.type === 'follow_up' ? 'bg-royalemerald/10 text-royalemerald' : 'bg-antiquegold/10 text-antiquegold'
                                      }`}>
                                        {stop.type === 'follow_up' ? rt.followUps : rt.explorations}
                                      </span>
                                      {isSkipped && (
                                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded text-[8px] font-bold">
                                          {rt.skipped}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-warmgray flex items-center gap-1 font-sans">
                                      <MapPin className="w-3.5 h-3.5 text-antiquegold shrink-0" />
                                      <span className="truncate max-w-[280px]">{stop.address}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-warmgray pt-0.5">
                                      {stop.contactName && <span>🧑 {stop.contactName}</span>}
                                      {stop.phone && <span>📞 {stop.phone}</span>}
                                      {stop.dueTimeText && <span className="font-mono text-antiquegold bg-alabaster px-1.5 py-0.5 rounded border border-border/40 font-bold">⏳ {stop.dueTimeText}</span>}
                                    </div>
                                  </div>
                                </div>

                                {/* Right part: Stop operations & sequence buttons */}
                                <div className="flex flex-wrap md:flex-nowrap items-center gap-1.5 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                                  {/* Map directional link handoff */}
                                  <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1.5 bg-white border border-[rgba(184,135,61,0.25)] text-antiquegold rounded-lg font-bold hover:bg-alabaster text-[10px] flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Globe className="w-3.5 h-3.5 text-antiquegold" />
                                    <span className="hidden sm:inline">{rt.openInMaps}</span>
                                  </a>

                                  {/* Move up / down priority reordering buttons */}
                                  <button
                                    onClick={() => moveStop(index, 'up')}
                                    disabled={index === 0}
                                    title={rt.moveUp}
                                    className="p-1.5 bg-alabaster border border-border rounded-lg hover:bg-border disabled:opacity-30 disabled:hover:bg-alabaster cursor-pointer font-bold"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() => moveStop(index, 'down')}
                                    disabled={index === filteredStops.length - 1}
                                    title={rt.moveDown}
                                    className="p-1.5 bg-alabaster border border-border rounded-lg hover:bg-border disabled:opacity-30 disabled:hover:bg-alabaster cursor-pointer font-bold"
                                  >
                                    ▼
                                  </button>

                                  {/* Skip/restore button */}
                                  <button
                                    onClick={() => toggleSkipStop(stop.id)}
                                    className={`px-2 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer ${
                                      isSkipped 
                                        ? 'bg-[#EAEAEA] border-gray-300 text-gray-600 hover:bg-gray-200' 
                                        : 'bg-white border-error/20 text-error hover:bg-error/5'
                                    }`}
                                  >
                                    {isSkipped ? rt.restoreStop : rt.skipStop}
                                  </button>

                                  {/* Check In Action Trigger */}
                                  {!isCompleted && !isSkipped && (
                                    <button
                                      onClick={() => handleCheckInStop(stop)}
                                      className="px-3 py-1.5 bg-royalemerald text-white hover:bg-opacity-95 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>{rt.checkInBtn}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </Card>

                    {/* Unplanned lead capture helper */}
                    <Card className="p-6 bg-[#FAF9F5] border border-dashed border-antiquegold/30 space-y-3">
                      <h4 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-antiquegold" />
                        <span>{rt.unplannedTitle}</span>
                      </h4>
                      <p className="text-xs text-warmgray leading-relaxed">
                        {rt.unplannedDesc}
                      </p>
                      <button
                        onClick={() => {
                          setGpsError(null);
                          setCapturedCoords(null);
                          setShowCaptureModal(true);
                        }}
                        className="py-2.5 px-4 bg-antiquegold text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-opacity-95 cursor-pointer shadow-sm"
                      >
                        + Capture Unplanned Site
                      </button>
                    </Card>
                  </div>

                  {/* RIGHT COLUMN: MAP & METRICS SUMMARY */}
                  <div className="space-y-6">
                    
                    {/* INTERACTIVE MAP PANEL (With pins linked to list selection!) */}
                    <Card className="p-5 bg-white space-y-4">
                      <div className="flex justify-between items-center border-b border-border pb-2.5">
                        <h4 className="text-xs uppercase font-extrabold tracking-widest text-charcoal flex items-center gap-1.5">
                          <Map className="w-4 h-4 text-royalemerald" />
                          <span>Pune North Territory Map</span>
                        </h4>
                        <span className="text-[10px] bg-royalemerald/10 text-royalemerald font-mono px-2 py-0.5 rounded font-bold uppercase">LIVE FEED</span>
                      </div>

                      {/* Interactive SVG Connective Map Layer */}
                      <div className="relative w-full h-[320px] bg-[#FAF8F4] rounded-2xl border border-border overflow-hidden">
                        {/* Map Grid Background dots */}
                        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#b8873d_1px,transparent_1px)] [background-size:20px_20px]" />
                        
                        {/* Simulated SVG Connecting Route Path Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                          <g stroke="#B8873D" strokeWidth="2.5" strokeDasharray="5,4" fill="none" opacity="0.65">
                            {(() => {
                              const points: string[] = [];
                              // Generate coords of non-skipped stops
                              routeStops.forEach((stop, idx) => {
                                if (stop.status !== 'skipped') {
                                  // Compute mock positions corresponding to the absolute top/left styles
                                  const topPercent = 30 + idx * 13;
                                  const leftPercent = 22 + idx * 15;
                                  points.push(`${leftPercent}%,${topPercent}%`);
                                }
                              });
                              if (points.length < 2) return null;
                              
                              // Create points coordinate path
                              return (
                                <path 
                                  d={`M ${points.map(p => {
                                    // Estimate pixels since percent values aren't supported directly in SVG path coordinates
                                    const percentX = parseFloat(p.split(',')[0]);
                                    const percentY = parseFloat(p.split(',')[1]);
                                    // Width estimate 280px, Height estimate 320px
                                    return `${(percentX / 100) * 280} ${(percentY / 100) * 320}`;
                                  }).join(' L ')}`}
                                />
                              );
                            })()}
                          </g>
                        </svg>

                        {/* Interactive Pins */}
                        {routeStops.map((stop, idx) => {
                          const isSelected = selectedRouteStop?.id === stop.id;
                          const isCompleted = stop.status === 'completed';
                          const isSkipped = stop.status === 'skipped';
                          
                          // Mock coordinate positioning layout
                          const topVal = 30 + idx * 13;
                          const leftVal = 22 + idx * 15;

                          return (
                            <button
                              key={stop.id}
                              onClick={() => setSelectedRouteStop(stop)}
                              className={`absolute p-2 rounded-xl shadow-md border flex items-center justify-center transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                                isCompleted ? 'bg-success/90 border-success text-white' :
                                isSkipped ? 'bg-gray-300 border-gray-400 text-gray-600 opacity-50 scale-90' :
                                isSelected ? 'bg-antiquegold border-charcoal text-white scale-120 z-20 shadow-lg ring-2 ring-white' :
                                'bg-white border-antiquegold text-charcoal hover:scale-105'
                              }`}
                              style={{
                                top: `${topVal}%`,
                                left: `${leftVal}%`
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="font-mono text-[9px] font-bold">
                                  {isCompleted ? '✓' : isSkipped ? 'S' : stop.sequence}
                                </span>
                              </div>
                            </button>
                          );
                        })}

                        {/* Map HUD Status info overlay */}
                        <div className="absolute bottom-3 left-3 right-3 bg-charcoal/90 text-white font-mono text-[9px] p-2 rounded-xl flex justify-between items-center backdrop-blur-xs">
                          <span>GRID: PUNE_NORTH_Z7</span>
                          <span className="text-antiquegold font-bold uppercase">GPS: Verified Locked</span>
                        </div>
                      </div>

                      {/* Mini Selected Stop Panel */}
                      {selectedRouteStop ? (
                        <div className="p-3 bg-alabaster rounded-xl border border-antiquegold/35 space-y-1.5 animate-fadeIn">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[9px] uppercase font-bold text-antiquegold">Selected Node Details</span>
                            <button 
                              onClick={() => setSelectedRouteStop(null)}
                              className="text-warmgray hover:text-charcoal text-xs font-bold cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                          <h5 className="font-bold text-xs text-charcoal">{selectedRouteStop.projectName}</h5>
                          <p className="text-[10px] text-warmgray line-clamp-1">📍 {selectedRouteStop.address}</p>
                          <div className="flex gap-2 pt-1">
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedRouteStop.address)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-white border border-border rounded text-[9px] text-charcoal font-bold flex items-center gap-1 cursor-pointer hover:bg-alabaster"
                            >
                              🗺️ Direction Intent
                            </a>
                            {selectedRouteStop.status === 'pending' && (
                              <button 
                                onClick={() => handleCheckInStop(selectedRouteStop)}
                                className="px-2 py-1 bg-royalemerald text-white rounded text-[9px] font-bold cursor-pointer hover:bg-opacity-95"
                              >
                                🎯 Complete Node
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 text-center bg-alabaster/40 rounded-xl border border-dashed border-border text-[10px] text-warmgray leading-normal">
                          Tip: Tap any map pin marker to highlight physical location coordinates & launch instant directional intents.
                        </div>
                      )}

                      {/* Map Legends */}
                      <div className="pt-2 flex flex-wrap gap-2 text-[10px] text-warmgray border-t border-border">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-success" />
                          <span>{rt.completed}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#B8873D]" />
                          <span>Pending Followup</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-charcoal" />
                          <span>Discovery Node</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-300" />
                          <span>{rt.skipped}</span>
                        </div>
                      </div>
                    </Card>

                    {/* TARGET END OF DAY SUMMARY PERFORMANCE PANEL */}
                    <Card className="p-5 bg-white space-y-4">
                      <div className="border-b border-border pb-2 flex items-center gap-2">
                        <Award className="w-5 h-5 text-antiquegold shrink-0" />
                        <div>
                          <h4 className="text-xs uppercase font-extrabold tracking-wider text-charcoal">{rt.summaryTitle}</h4>
                          <span className="text-[9px] text-warmgray">Planned stops vs actual checks</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-warmgray leading-relaxed">
                        {rt.summaryDesc}
                      </p>

                      <div className="space-y-3 pt-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span>Planned Stops:</span>
                          <span className="font-bold text-charcoal">{plannedCount}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span>Inspected Nodes:</span>
                          <span className="font-bold text-royalemerald">{actualCount}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span>Skipped Nodes:</span>
                          <span className="font-bold text-warmgray">{routeStops.filter(s => s.status === 'skipped').length}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono pt-2 border-t border-dashed border-border">
                          <span>Resolution Rate:</span>
                          <span className="font-bold text-royalemerald">{currentProgressBarPercent}%</span>
                        </div>
                      </div>

                      {actualCount === plannedCount && plannedCount > 0 ? (
                        <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-success text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                          🏆 {rt.allStopsDone}
                        </div>
                      ) : null}
                    </Card>

                  </div>

                </div>

              </div>
            );
          })()}

          {/* VIEW 3: LEADS HISTORY TABLE */}
          {subView === 'history' && (
            <div className="space-y-6">
              {/* LOCAL TRANSLATION UTILITY */}
              {(() => {
                const hlt = {
                  en: {
                    personalWinRate: "Personal Win Rate",
                    totalCaptures: "Total Captures",
                    wonCommissions: "Won Commissions",
                    pendingAudits: "Pending Audits",
                    activePipeline: "Active Pipeline",
                    estEarnings: "Est. Earnings",
                    searchPlaceholder: "Search client or building...",
                    filterByStage: "Filter by CRM Stage",
                    filterByDate: "Filter by Date Range",
                    allTime: "All Time",
                    today: "Today",
                    last7Days: "Last 7 Days",
                    last30Days: "Last 30 Days",
                    customRange: "Custom Date Range",
                    prevBtn: "Previous",
                    nextBtn: "Next",
                    showingRecords: "Showing {start} to {end} of {total} leads",
                    mergedDuplicate: "Merged Duplicate",
                    originalSpecs: "Original Capture Specs",
                    clientContact: "Client Contact",
                    siteBlueprint: "Shaft & Site Blueprint",
                    watermarkedProofs: "Watermarked Photo Proofs",
                    lockedNotice: "CRM Pipeline Secured: Surveyors can track pipeline progression, but modifying active negotiations or quotes is locked to sales/negotiation teams for security.",
                    emptyTitle: "No Leads Registered",
                    emptyCTA: "Capture Your First Lead Node Now",
                    callClient: "Call Builder",
                    viewJourney: "View Deep Journey"
                  },
                  hi: {
                    personalWinRate: "व्यक्तिगत रूपांतरण दर",
                    totalCaptures: "कुल पंजीकृत लीड",
                    wonCommissions: "सफल कमीशन (Won)",
                    pendingAudits: "लंबित सत्यापन",
                    activePipeline: "सक्रिय पाइपलाइन",
                    estEarnings: "अनुमानित कमाई",
                    searchPlaceholder: "ग्राहक या बिल्डिंग खोजें...",
                    filterByStage: "CRM चरण द्वारा फ़िल्टर",
                    filterByDate: "अवधि द्वारा फ़िल्टर",
                    allTime: "कुल समय",
                    today: "आज",
                    last7Days: "पिछले 7 दिन",
                    last30Days: "पिछले 30 दिन",
                    customRange: "कस्टम तिथि सीमा",
                    prevBtn: "पिछला",
                    nextBtn: "अगला",
                    showingRecords: "{total} लीड्स में से {start} से {end} दिखा रहा है",
                    mergedDuplicate: "डुप्लिकेट में विलय",
                    originalSpecs: "मूल पंजीकरण विनिर्देश",
                    clientContact: "ग्राहक संपर्क विवरण",
                    siteBlueprint: "लिफ्ट शाफ्ट और साइट ब्लूप्रिंट",
                    watermarkedProofs: "वॉटरमार्क किए गए फोटो प्रमाण",
                    lockedNotice: "CRM पाइपलाइन सुरक्षित: सर्वेक्षक पाइपलाइन की प्रगति देख सकते हैं, लेकिन सुरक्षा कारणों से व्यावसायिक वार्ता या कोटेशन में बदलाव केवल सेल्स टीम ही कर सकती है।",
                    emptyTitle: "कोई लीड पंजीकृत नहीं है",
                    emptyCTA: "अपनी पहली लीड अभी पंजीकृत करें",
                    callClient: "कॉल करें",
                    viewJourney: "यात्रा देखें"
                  },
                  mr: {
                    personalWinRate: "व्यक्तिगत रूपांतरण दर",
                    totalCaptures: "एकूण नोंदणीकृत लीड्स",
                    wonCommissions: "यशस्वी कमिशन (Won)",
                    pendingAudits: "प्रलंबित पडताळणी",
                    activePipeline: "सक्रिय पाइपलाईन",
                    estEarnings: "अंदाजे कमाई",
                    searchPlaceholder: "ग्राहक किंवा बिल्डिंग शोधा...",
                    filterByStage: "CRM टप्प्यानुसार फिल्टर",
                    filterByDate: "कालावधीनुसार फिल्टर",
                    allTime: "सर्व वेळ",
                    today: "आज",
                    last7Days: "मागील ७ दिवस",
                    last30Days: "मागील ३० दिवस",
                    customRange: "सानुकूल तारीख श्रेणी",
                    prevBtn: "मागील",
                    nextBtn: "पुढील",
                    showingRecords: "{total} लीड्स पैकी {start} ते {end} दर्शवित आहे",
                    mergedDuplicate: "डुप्लिकेटमध्ये विलीन",
                    originalSpecs: "मूळ नोंदणीचे तपशील",
                    clientContact: "ग्राहक संपर्क तपशील",
                    siteBlueprint: "लिफ्ट शाफ्ट आणि साइट ब्लूप्रिंट",
                    watermarkedProofs: "वॉटरमार्क केलेले फोटो पुरावे",
                    lockedNotice: "CRM पाइपलाईन सुरक्षित: सर्वेक्षक पाइपलाइनची प्रगती पाहू शकतात, परंतु सुरक्षिततेसाठी व्यावसायिक बोलणी किंवा कोटेशन बदलण्याचा अधिकार फक्त सेल्स टीमलाच आहे.",
                    emptyTitle: "कोणतीही लीड नोंदवलेली नाही",
                    emptyCTA: "तुमचा पहिला लीड आता नोंदवा",
                    callClient: "कॉल करा",
                    viewJourney: "प्रगती पहा"
                  }
                };

                const hltActive = hlt[appLanguage] || hlt['en'];

                // DYNAMIC STATISTICS CALCULATIONS
                const totalCaptures = leads.length;
                const wonLeads = leads.filter(l => l.stage === 'closed_won');
                const wonCount = wonLeads.length;
                const activeCount = leads.filter(l => l.stage !== 'closed_won' && l.stage !== 'closed_lost').length;
                const winRate = totalCaptures > 0 ? Math.round((wonCount / totalCaptures) * 100) : 0;
                
                // Calculated Commission Payouts
                const wonCommissionSum = wonLeads.reduce((acc, l) => acc + (l.commissionEarned || 25000), 0);
                const pendingCommissionSum = activeCount * 1500;
                const totalCommissionPreserved = wonCommissionSum + pendingCommissionSum;

                // CRM Stage Translation Mapping
                const stageLabels: Record<string, string> = {
                  captured: appLanguage === 'mr' ? 'नवीन लीड' : appLanguage === 'hi' ? 'नई लीड' : 'New Capture',
                  assigned: appLanguage === 'mr' ? 'सोपवले' : appLanguage === 'hi' ? 'सौंपा गया' : 'Assigned',
                  contacted: appLanguage === 'mr' ? 'संपर्क केला' : appLanguage === 'hi' ? 'संपर्क किया' : 'Contacted',
                  survey_done: appLanguage === 'mr' ? 'सर्वेक्षण पूर्ण' : appLanguage === 'hi' ? 'सर्वेक्षण पूर्ण' : 'Survey Done',
                  quoted: appLanguage === 'mr' ? 'कोटेशन दिले' : appLanguage === 'hi' ? 'कोटेशन दिया' : 'Quoted',
                  negotiating: appLanguage === 'mr' ? 'चर्चा सुरू' : appLanguage === 'hi' ? 'वार्तालाप' : 'Negotiating',
                  closed_won: appLanguage === 'mr' ? 'यशस्वी करार' : appLanguage === 'hi' ? 'सफल सौदा' : 'Closed Won',
                  closed_lost: appLanguage === 'mr' ? 'बंद / अयशस्वी' : appLanguage === 'hi' ? 'अस्वीकृत' : 'Closed Lost',
                };

                // STICKY FILTER LOGIC & COMPOSITION
                const getFilteredLeads = () => {
                  return leads.filter(l => {
                    // 1. Search filter
                    const clientName = l.contactInfo?.name || '';
                    const addressStr = l.buildingInfo?.address || '';
                    const landmarkStr = l.nearest_landmark_note || '';
                    const matchesSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                          addressStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                          landmarkStr.toLowerCase().includes(searchQuery.toLowerCase());

                    // 2. Stage filter
                    let matchesStage = false;
                    if (statusFilter === 'all') {
                      matchesStage = true;
                    } else if (statusFilter === 'merged') {
                      matchesStage = !!l.is_duplicate_flagged;
                    } else {
                      matchesStage = l.stage === statusFilter && !l.is_duplicate_flagged;
                    }

                    // 3. Date range filter
                    let matchesDate = true;
                    const lDate = new Date(l.createdAt).getTime();
                    const nowLimit = Date.now();
                    if (dateFilter === 'today') {
                      const todayStart = new Date();
                      todayStart.setHours(0, 0, 0, 0);
                      matchesDate = lDate >= todayStart.getTime();
                    } else if (dateFilter === 'week') {
                      matchesDate = lDate >= nowLimit - 7 * 24 * 60 * 60 * 1000;
                    } else if (dateFilter === 'month') {
                      matchesDate = lDate >= nowLimit - 30 * 24 * 60 * 60 * 1000;
                    } else if (dateFilter === 'custom') {
                      if (customStartDate) {
                        const sD = new Date(customStartDate);
                        sD.setHours(0, 0, 0, 0);
                        matchesDate = matchesDate && lDate >= sD.getTime();
                      }
                      if (customEndDate) {
                        const eD = new Date(customEndDate);
                        eD.setHours(23, 59, 59, 999);
                        matchesDate = matchesDate && lDate <= eD.getTime();
                      }
                    }

                    return matchesSearch && matchesStage && matchesDate;
                  });
                };

                const filtered = getFilteredLeads().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                
                // Pagination limits
                const totalFiltered = filtered.length;
                const totalPages = Math.ceil(totalFiltered / historyPageSize) || 1;
                const displayStart = totalFiltered > 0 ? (historyPage - 1) * historyPageSize + 1 : 0;
                const displayEnd = Math.min(historyPage * historyPageSize, totalFiltered);
                const pageItems = filtered.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize);

                return (
                  <div className="space-y-6">
                    {/* Progress indicator percentage */}
                    <div className="flex justify-between text-xs items-center px-1">
                      <span className="text-warmgray font-mono">Current workbench progress bar</span>
                      <span className="text-antiquegold font-mono font-bold">100% (History Dashboard ready)</span>
                    </div>

                    {/* 1. PERSONAL CONVERSION COCKPIT SUMMARY PANEL */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      
                      {/* Personal Win Rate Meter */}
                      <Card className="p-5 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-white to-[#FAF9F5] hover:border-antiquegold/35 transition-all">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-extrabold tracking-widest text-warmgray font-sans">{hltActive.personalWinRate}</span>
                          <div className="w-8 h-8 rounded-full bg-antiquegold/10 text-antiquegold flex items-center justify-center font-bold">
                            🏆
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="font-serif text-3xl font-black text-charcoal">{winRate}%</span>
                          <div className="flex-1 bg-border/40 h-2.5 rounded-full overflow-hidden border border-dashed border-[#e6dfd4] max-w-[80px]">
                            <div className="h-full bg-antiquegold" style={{ width: `${winRate}%` }} />
                          </div>
                        </div>
                        <span className="text-[10px] text-warmgray font-sans mt-1">Pune HQ verified metric</span>
                      </Card>

                      {/* Total Captures */}
                      <Card className="p-5 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-white to-[#FAF9F5] hover:border-antiquegold/35 transition-all">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-extrabold tracking-widest text-warmgray font-sans">{hltActive.totalCaptures}</span>
                          <Building className="w-4 h-4 text-antiquegold" />
                        </div>
                        <div className="mt-2">
                          <span className="font-mono text-3xl font-black text-charcoal">{totalCaptures}</span>
                          <span className="text-xs text-warmgray ml-1.5">Sites Logged</span>
                        </div>
                        <span className="text-[10px] text-warmgray font-sans mt-1">Physical GPS anchors locked</span>
                      </Card>

                      {/* Won Commissions (Closed Won) */}
                      <Card className="p-5 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-white to-[#FAF9F5] hover:border-antiquegold/35 transition-all">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-extrabold tracking-widest text-royalemerald font-sans">{hltActive.wonCommissions}</span>
                          <div className="w-6 h-6 rounded-lg bg-royalemerald/10 text-royalemerald flex items-center justify-center font-bold">
                            ₹
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="font-mono text-2xl font-black text-royalemerald">₹{wonCommissionSum.toLocaleString('en-IN')}</span>
                          <div className="text-[10px] font-bold text-success mt-0.5">🟢 NPCI Cleared • SBI</div>
                        </div>
                        <span className="text-[9px] text-warmgray font-mono">From {wonCount} successfully closed won contracts</span>
                      </Card>

                      {/* Active Pipeline & Est Earnings */}
                      <Card className="p-5 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-white to-[#FAF9F5] hover:border-antiquegold/35 transition-all">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-extrabold tracking-widest text-warmgray font-sans">{hltActive.activePipeline}</span>
                          <Activity className="w-4 h-4 text-warning" />
                        </div>
                        <div className="mt-2">
                          <span className="font-mono text-xl font-bold text-charcoal">{activeCount} Pending Verification</span>
                          <p className="text-[10px] text-antiquegold font-bold font-mono mt-0.5">Est. Payouts: +₹{pendingCommissionSum.toLocaleString('en-IN')}</p>
                        </div>
                        <span className="text-[9px] text-warmgray font-sans">Accumulating on active sites</span>
                      </Card>
                    </div>

                    {/* 2. STICKY SEARCH & FILTER DECK */}
                    <Card className="p-5 sticky top-0 bg-white/95 backdrop-blur-md z-20 border border-[rgba(184,135,61,0.2)] shadow-md space-y-4">
                      {/* Search & Date Filter Choice */}
                      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                        {/* Search Input Box */}
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 left-3 flex items-center pl-0.5 text-warmgray pointer-events-none">
                            <Search className="w-4 h-4 text-warmgray shrink-0" />
                          </span>
                          <input
                            type="text"
                            placeholder={hltActive.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs text-charcoal placeholder:text-warmgray focus:ring-1 focus:ring-antiquegold focus:outline-none"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute inset-y-0 right-3 flex items-center text-warmgray hover:text-charcoal font-bold text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Date Preset Filter Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-charcoal whitespace-nowrap hidden sm:inline flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-antiquegold shrink-0" />
                            <span>{hltActive.filterByDate}:</span>
                          </span>
                          <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value as any)}
                            className="bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-xs px-3 py-2.5 text-charcoal font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-antiquegold"
                          >
                            <option value="all">{hltActive.allTime}</option>
                            <option value="today">{hltActive.today}</option>
                            <option value="week">{hltActive.last7Days}</option>
                            <option value="month">{hltActive.last30Days}</option>
                            <option value="custom">{hltActive.customRange}</option>
                          </select>
                        </div>
                      </div>

                      {/* Custom Calendars (Conditionally Visible) */}
                      {dateFilter === 'custom' && (
                        <div className="grid grid-cols-2 gap-3 p-3.5 bg-alabaster/60 rounded-xl border border-dashed border-[#e6dfd4] animate-fadeIn">
                          <div>
                            <label className="block text-[10px] font-bold text-warmgray uppercase mb-1">Start Date</label>
                            <input
                              type="date"
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-[rgba(184,135,61,0.15)] rounded-lg text-xs text-charcoal"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-warmgray uppercase mb-1">End Date</label>
                            <input
                              type="date"
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-[rgba(184,135,61,0.15)] rounded-lg text-xs text-charcoal"
                            />
                          </div>
                        </div>
                      )}

                      {/* CRM Stage Horizontal Filter Rail */}
                      <div className="space-y-1.5 pt-1 border-t border-[rgba(184,135,61,0.08)]">
                        <span className="text-[10px] font-bold text-warmgray uppercase tracking-widest block">{hltActive.filterByStage}</span>
                        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 max-h-[75px]">
                          <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg border transition-all cursor-pointer ${
                              statusFilter === 'all'
                                ? 'bg-antiquegold border-antiquegold text-white font-extrabold'
                                : 'bg-alabaster/40 border-border text-charcoal hover:bg-alabaster'
                            }`}
                          >
                            All ({leads.length})
                          </button>
                          {(['captured', 'contacted', 'survey_done', 'quoted', 'negotiating', 'closed_won', 'closed_lost'] as const).map(f => {
                            const count = leads.filter(l => l.stage === f && !l.is_duplicate_flagged).length;
                            return (
                              <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg border transition-all cursor-pointer ${
                                  statusFilter === f
                                    ? 'bg-antiquegold border-antiquegold text-white font-extrabold'
                                    : 'bg-alabaster/40 border-border text-charcoal hover:bg-alabaster'
                                }`}
                              >
                                {stageLabels[f] || f} ({count})
                              </button>
                            );
                          })}
                          {/* Merged duplicates dedicated stage choice */}
                          <button
                            onClick={() => setStatusFilter('merged')}
                            className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg border transition-all cursor-pointer ${
                              statusFilter === 'merged'
                                ? 'bg-indigo-600 border-indigo-600 text-white font-extrabold'
                                : 'bg-alabaster/40 border-border text-charcoal hover:bg-alabaster'
                            }`}
                          >
                            {hltActive.mergedDuplicate} ({leads.filter(l => l.is_duplicate_flagged).length})
                          </button>
                        </div>
                      </div>
                    </Card>

                    {/* 3. HISTORICAL LIST / WORKBENCH RECORDS */}
                    {isHistoryLoading ? (
                      /* SKELETON ROW SHIMMER PLACEHOLDERS */
                      <div className="space-y-4">
                        {[1, 2, 3].map(n => (
                          <div key={n} className="p-5 bg-white rounded-2xl border border-border/60 animate-pulse space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-alabaster" />
                                <div className="space-y-2">
                                  <div className="h-3 w-40 bg-alabaster rounded" />
                                  <div className="h-2 w-24 bg-alabaster rounded" />
                                </div>
                              </div>
                              <div className="h-5 w-20 bg-alabaster rounded-full" />
                            </div>
                            <div className="pt-2 border-t border-dashed border-[#e6dfd4] flex justify-between">
                              <div className="h-3 w-32 bg-alabaster rounded" />
                              <div className="h-3 w-16 bg-alabaster rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : pageItems.length === 0 ? (
                      /* CARE EMPTY STATE DESIGN */
                      <Card className="p-12 text-center border-dashed border-2 border-antiquegold/30 bg-white shadow-diffuse max-w-lg mx-auto space-y-4">
                        <div className="w-16 h-16 rounded-full bg-antiquegold/10 flex items-center justify-center mx-auto">
                          <Search className="w-8 h-8 text-antiquegold" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-serif text-lg font-bold text-charcoal">{hltActive.emptyTitle}</h3>
                          <p className="text-xs text-warmgray leading-relaxed">
                            No records match your active query filters or date range. Reset filters or walk Pune properties to captured new builder accounts.
                          </p>
                        </div>
                        <Button 
                          variant="primary" 
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                            setDateFilter('all');
                            setShowCaptureModal(true);
                          }}
                          className="mx-auto"
                        >
                          <PlusCircle className="w-4 h-4 text-white" />
                          <span>{hltActive.emptyCTA}</span>
                        </Button>
                      </Card>
                    ) : (
                      /* HIGH-FIDELITY CHRONOLOGICAL ROW LIST WITH SWIPE-ACTION CAPABILITY */
                      <div className="space-y-4">
                        {pageItems.map(l => {
                          const isWon = l.stage === 'closed_won';
                          const isMerged = !!l.is_duplicate_flagged;
                          const hasPhoto = l.site_photos && l.site_photos.length > 0;
                          
                          return (
                            <div key={l.id} className="relative group">
                              {/* Row Card styled in Premium Alabaster */}
                              <Card 
                                onClick={() => setSelectedLead(l)}
                                className={`p-4 bg-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 border border-[rgba(184,135,61,0.12)] cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                  isMerged ? 'border-dashed border-indigo-200 bg-indigo-[0.01]' : ''
                                }`}
                              >
                                {/* Left Section: Row Anatomy leading marker */}
                                <div className="flex items-center gap-3.5">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                                    isWon 
                                      ? 'bg-royalemerald/10 border-royalemerald/25 text-royalemerald' 
                                      : isMerged 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                                        : 'bg-antiquegold/10 border-antiquegold/25 text-antiquegold'
                                  }`}>
                                    {isWon ? (
                                      <Award className="w-5 h-5" />
                                    ) : isMerged ? (
                                      <Compass className="w-5 h-5" />
                                    ) : (
                                      <Building className="w-5 h-5" />
                                    )}
                                  </div>

                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-serif text-sm font-black text-charcoal">{l.contactInfo?.name || 'Rohan Deshmukh'}</h4>
                                      <span className="text-[10px] font-mono text-warmgray">ID: {l.id}</span>
                                    </div>
                                    <p className="text-xs text-charcoal font-semibold">{l.buildingInfo?.address}</p>
                                    <p className="text-[10px] text-warmgray flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-antiquegold" />
                                      <span className="font-mono text-warmgray">{l.buildingInfo?.floors} FLOORS • {l.buildingInfo?.type?.toUpperCase()}</span>
                                    </p>
                                  </div>
                                </div>

                                {/* Right Section: Status badge & Commissions */}
                                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3.5 md:pt-0 border-dashed border-[#e6dfd4]">
                                  {/* Mobile Swipe-action Simulated Buttons */}
                                  <div className="flex gap-1.5">
                                    <a
                                      href={`tel:${l.contactInfo?.phone}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="px-2.5 py-1.5 bg-alabaster hover:bg-border/20 text-charcoal border border-border rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1 cursor-pointer"
                                    >
                                      <Phone className="w-3 h-3 text-antiquegold shrink-0" />
                                      <span>Call</span>
                                    </a>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLead(l);
                                      }}
                                      className="px-2.5 py-1.5 bg-antiquegold/10 hover:bg-antiquegold/15 text-antiquegold border border-antiquegold/20 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1 cursor-pointer"
                                    >
                                      <Compass className="w-3 h-3 shrink-0" />
                                      <span>SOP Path</span>
                                    </button>
                                  </div>

                                  <div className="text-right flex flex-col items-end">
                                    {isMerged ? (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-100 text-indigo-700 border border-indigo-200">
                                        Merged
                                      </span>
                                    ) : (
                                      <Badge status={l.stage} />
                                    )}

                                    <div className="font-mono text-[10px] font-bold text-warmgray mt-1 flex items-center gap-1">
                                      {isWon ? (
                                        <span className="text-royalemerald font-black">₹{(l.commissionEarned || 25000).toLocaleString('en-IN')} NPCI Approved</span>
                                      ) : isMerged ? (
                                        <span className="text-indigo-600 font-bold">₹1,500 Preserved</span>
                                      ) : (
                                        <span className="text-antiquegold font-bold">₹1,500 Pending verification</span>
                                      )}
                                    </div>
                                    <span className="text-[9px] text-warmgray block">{new Date(l.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 4. PAGINATION PANEL */}
                    {totalFiltered > 0 && (
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-[rgba(184,135,61,0.08)]">
                        <span className="text-xs text-warmgray font-sans">
                          {hltActive.showingRecords
                            .replace("{start}", displayStart.toString())
                            .replace("{end}", displayEnd.toString())
                            .replace("{total}", totalFiltered.toString())}
                        </span>

                        <div className="flex gap-2 items-center">
                          {/* Page Size selector */}
                          <div className="flex items-center gap-1.5 text-xs text-warmgray">
                            <span className="hidden sm:inline">Rows:</span>
                            <select
                              value={historyPageSize}
                              onChange={(e) => setHistoryPageSize(parseInt(e.target.value))}
                              className="bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-lg text-xs px-2 py-1 text-charcoal font-semibold cursor-pointer"
                            >
                              <option value="5">5</option>
                              <option value="10">10</option>
                              <option value="25">25</option>
                            </select>
                          </div>

                          <div className="flex gap-1">
                            <button
                              disabled={historyPage === 1}
                              onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                              className="px-3 py-1.5 bg-white border border-border text-charcoal hover:bg-alabaster text-xs font-bold rounded-lg disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                            >
                              ← {hltActive.prevBtn}
                            </button>
                            <span className="px-3 py-1.5 bg-alabaster border border-[rgba(184,135,61,0.15)] text-charcoal text-xs font-mono font-bold rounded-lg">
                              {historyPage} / {totalPages}
                            </span>
                            <button
                              disabled={historyPage === totalPages}
                              onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                              className="px-3 py-1.5 bg-white border border-border text-charcoal hover:bg-alabaster text-xs font-bold rounded-lg disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                            >
                              {hltActive.nextBtn} →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 5. INTERACTIVE LEAD JOURNEY POP-UP DETAIL DRAWER */}
                    {selectedLead && (
                      <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex justify-end animate-fadeIn">
                        <div className="w-full max-w-2xl bg-white border-l border-[rgba(184,135,61,0.25)] h-full flex flex-col justify-between shadow-2xl animate-slideLeft overflow-y-auto">
                          
                          {/* Drawer Header */}
                          <div className="p-6 border-b border-[rgba(184,135,61,0.15)] flex justify-between items-center bg-[#F8F6F1]">
                            <div>
                              <span className="text-[10px] uppercase font-mono tracking-widest text-antiquegold font-extrabold">{hltActive.originalSpecs}</span>
                              <h3 className="font-serif text-xl font-black text-charcoal mt-1">
                                {selectedLead.contactInfo?.name || 'Site Lead Details'}
                              </h3>
                              <p className="text-xs text-warmgray mt-0.5">Lead Captured on {new Date(selectedLead.createdAt).toLocaleString()}</p>
                            </div>
                            <button 
                              onClick={() => setSelectedLead(null)}
                              className="p-2.5 rounded-xl bg-white text-warmgray hover:text-charcoal cursor-pointer border border-[rgba(184,135,61,0.15)] font-bold text-xs"
                            >
                              ✕ Close
                            </button>
                          </div>

                          {/* Drawer Content */}
                          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                            
                            {/* CRM READ-ONLY NOTICE BLOCK */}
                            <div className="p-4 bg-antiquegold/5 border border-antiquegold/25 rounded-2xl flex gap-3">
                              <Lock className="w-5 h-5 text-antiquegold shrink-0 mt-0.5" />
                              <p className="text-xs text-charcoal font-medium leading-relaxed">
                                {hltActive.lockedNotice}
                              </p>
                            </div>

                            {/* PIPELINE JOURNEY (THE SIGNATURE ASCENSION LINE MOTIF) */}
                            <div className="space-y-4">
                              <h4 className="text-xs font-extrabold uppercase tracking-widest text-charcoal flex items-center gap-2">
                                <Activity className="w-4 h-4 text-antiquegold shrink-0" />
                                <span>Physical-to-Commercial SOP Progression</span>
                              </h4>
                              
                              {(() => {
                                const activeStage = selectedLead.stage;
                                const stagesOrder: { id: string; label: string; completed: boolean; active: boolean }[] = [
                                  { id: 'captured', label: '1. Captured', completed: true, active: activeStage === 'captured' },
                                  { id: 'assigned', label: '2. Assigned', completed: ['assigned', 'contacted', 'survey_done', 'quoted', 'negotiating', 'closed_won'].includes(activeStage), active: activeStage === 'assigned' },
                                  { id: 'contacted', label: '3. Contacted', completed: ['contacted', 'survey_done', 'quoted', 'negotiating', 'closed_won'].includes(activeStage), active: activeStage === 'contacted' },
                                  { id: 'survey_done', label: '4. Survey Done', completed: ['survey_done', 'quoted', 'negotiating', 'closed_won'].includes(activeStage), active: activeStage === 'survey_done' },
                                  { id: 'quoted', label: '5. Quoted', completed: ['quoted', 'negotiating', 'closed_won'].includes(activeStage), active: activeStage === 'quoted' },
                                  { id: 'negotiating', label: '6. Negotiating', completed: ['negotiating', 'closed_won'].includes(activeStage), active: activeStage === 'negotiating' },
                                  { id: 'closed_won', label: '7. Closed Won', completed: activeStage === 'closed_won', active: activeStage === 'closed_won' }
                                ];

                                if (activeStage === 'closed_lost') {
                                  stagesOrder.push({ id: 'closed_lost', label: 'Failed / Closed Lost', completed: true, active: true });
                                }

                                return (
                                  <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.08)]">
                                    <AscensionLine steps={stagesOrder} />
                                  </div>
                                );
                              })()}
                            </div>

                            {/* MERGED STATUS DETAILS (IF APPLICABLE) */}
                            {selectedLead.is_duplicate_flagged && (
                              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs uppercase tracking-wider">
                                  <Compass className="w-4 h-4 text-indigo-600 shrink-0" />
                                  <span>Merged Duplicate Lead Record</span>
                                </div>
                                <p className="text-xs text-indigo-950 font-medium">
                                  This property was matched with an existing site registry within close GPS proximity ({selectedLead.duplicate_distance_meters?.toFixed(1) || '12.4'} meters). 
                                  Wable Sir has merged this node into active Project <span className="font-mono font-bold text-indigo-700">#{selectedLead.duplicate_of_lead_id || 'PROJ-0912'}</span>.
                                  Your surveyor lead capture bounty of <span className="font-bold">₹1,500</span> is securely preserved inside your ledger!
                                </p>
                              </div>
                            )}

                            {/* CLIENT DETAILS */}
                            <div className="space-y-3.5">
                              <h4 className="text-xs font-extrabold uppercase tracking-widest text-charcoal">{hltActive.clientContact}</h4>
                              <div className="p-4 bg-alabaster rounded-xl border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-warmgray block">Primary Name:</span>
                                  <span className="font-bold text-charcoal block">{selectedLead.contactInfo?.name || 'Rohan Deshmukh'}</span>
                                </div>
                                <div>
                                  <span className="text-warmgray block">Phone:</span>
                                  <span className="font-bold font-mono text-charcoal block">{selectedLead.contactInfo?.phone}</span>
                                </div>
                                <div>
                                  <span className="text-warmgray block">Email:</span>
                                  <span className="font-medium text-charcoal block">{selectedLead.contactInfo?.email || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-warmgray block">Role Type:</span>
                                  <span className="font-bold uppercase text-charcoal block text-[10px]">{selectedLead.contactInfo?.role || 'N/A'}</span>
                                </div>
                                <div className="sm:col-span-2">
                                  <span className="text-warmgray block">Relationship Note / Intake Commentary:</span>
                                  <p className="text-xs italic text-charcoal mt-1 bg-white p-2.5 rounded-lg border border-border/40">
                                    "{selectedLead.contactInfo?.relationshipNote || 'No relationship details entered.'}"
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* PROPERTY & BUILDING SPECS */}
                            <div className="space-y-3.5">
                              <h4 className="text-xs font-extrabold uppercase tracking-widest text-charcoal">Structural Parameters & Shaft Specs</h4>
                              <div className="p-4 bg-alabaster rounded-xl border border-border/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="text-warmgray block">Address:</span>
                                  <span className="font-bold text-charcoal block truncate max-w-[150px]" title={selectedLead.buildingInfo?.address}>
                                    {selectedLead.buildingInfo?.address}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-warmgray block">Total Floors:</span>
                                  <span className="font-bold text-charcoal block">{selectedLead.buildingInfo?.floors} Floors</span>
                                </div>
                                <div>
                                  <span className="text-warmgray block">Structure:</span>
                                  <span className="font-bold text-charcoal block capitalize">{selectedLead.buildingInfo?.type}</span>
                                </div>
                                <div>
                                  <span className="text-warmgray block">Drive Type Estimate:</span>
                                  <span className="font-bold text-charcoal block capitalize">{selectedLead.buildingInfo?.driveType || 'MRL Traction'}</span>
                                </div>
                                <div>
                                  <span className="text-warmgray block">Shaft Dimensions:</span>
                                  <span className="font-bold font-mono text-charcoal block">{selectedLead.buildingInfo?.shaft_dimensions_estimate || '1500 x 1500 mm'}</span>
                                </div>
                                <div>
                                  <span className="text-warmgray block">Passenger Cap:</span>
                                  <span className="font-bold text-charcoal block">{selectedLead.buildingInfo?.passenger_capacity_estimate || 6} Persons</span>
                                </div>
                                {selectedLead.buildingInfo?.is_shaft_inaccessible && (
                                  <div className="col-span-2 sm:col-span-3 bg-error/5 border border-error/15 p-2.5 rounded-lg text-error flex gap-2">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>Shaft was marked as physical inaccessible during capture. Temporary dimensions estimated from outer masonry check.</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* SKETCH BLUEPRINT */}
                            {selectedLead.buildingInfo?.shaft_sketch_data_url && (
                              <div className="space-y-3.5">
                                <h4 className="text-xs font-extrabold uppercase tracking-widest text-charcoal">{hltActive.siteBlueprint}</h4>
                                <div className="bg-charcoal p-3.5 rounded-2xl border border-[rgba(184,135,61,0.25)] flex flex-col items-center">
                                  <img 
                                    src={selectedLead.buildingInfo.shaft_sketch_data_url} 
                                    alt="Shaft blueprint" 
                                    className="max-h-[220px] object-contain rounded-lg border border-antiquegold/10 bg-black/40" 
                                  />
                                  <span className="text-[9px] font-mono text-antiquegold mt-2.5 tracking-wider uppercase">SECURE 2D ELEVATION BLUEPRINT NODE</span>
                                </div>
                              </div>
                            )}

                            {/* PHOTO WATERMARKED PROOFS */}
                            {selectedLead.site_photos && selectedLead.site_photos.length > 0 && (
                              <div className="space-y-3.5">
                                <h4 className="text-xs font-extrabold uppercase tracking-widest text-charcoal">{hltActive.watermarkedProofs}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {selectedLead.site_photos.map((ph, pIdx) => (
                                    <div key={pIdx} className="bg-white p-2.5 rounded-xl border border-border shadow-sm space-y-2">
                                      <div className="relative w-full h-[140px] bg-alabaster rounded-lg overflow-hidden border border-border">
                                        <img src={ph.dataUrl} className="w-full h-full object-cover" alt={ph.prompt} />
                                        <span className="absolute bottom-2 left-2 bg-charcoal/80 text-white font-mono text-[8px] px-2 py-0.5 rounded uppercase tracking-wider">
                                          {ph.prompt}
                                        </span>
                                      </div>
                                      <div className="text-[9px] font-mono text-warmgray space-y-1 pr-1">
                                        <p className="font-extrabold text-charcoal uppercase">{ph.prompt} Site Proof</p>
                                        <p className="font-bold flex items-center gap-1">
                                          {ph.isLive ? (
                                            <span className="text-royalemerald">🟢 SECURE LIVE CAPTURE</span>
                                          ) : (
                                            <span className="text-warning">⚠️ ARCHIVE IMPORT</span>
                                          )}
                                        </p>
                                        <p className="truncate">Timestamp: {ph.timestamp}</p>
                                        <p className="truncate">Geotag: {ph.geotag || selectedLead.gps_lat_lng || '18.5204° N, 73.8567° E'}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* GPS VERIFIED COORDINATES */}
                            {selectedLead.gps_lat_lng && (
                              <div className="p-3.5 bg-alabaster/60 border border-border rounded-xl text-[10px] font-mono text-warmgray space-y-1">
                                <div className="flex justify-between">
                                  <span>GPS COORDINATES:</span>
                                  <span className="font-bold text-charcoal">{selectedLead.gps_lat_lng}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>RADAR ACCURACY:</span>
                                  <span className="font-bold text-royalemerald">±{selectedLead.gps_accuracy_meters?.toFixed(1) || '4.2'} meters</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>NEAREST SITE LANDMARK:</span>
                                  <span className="font-bold text-charcoal">"{selectedLead.nearest_landmark_note || 'N/A'}"</span>
                                </div>
                              </div>
                            )}

                          </div>

                          {/* Drawer Footer */}
                          <div className="p-6 border-t border-[rgba(184,135,61,0.12)] bg-[#FAF9F5] flex justify-end gap-3">
                            <a
                              href={`tel:${selectedLead.contactInfo?.phone}`}
                              className="px-5 py-3 rounded-xl border border-[rgba(184,135,61,0.3)] bg-white text-charcoal hover:bg-alabaster font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                            >
                              <Phone className="w-4 h-4 text-antiquegold" />
                              <span>{hltActive.callClient}</span>
                            </a>
                            <Button variant="secondary" onClick={() => setSelectedLead(null)}>
                              Close View
                            </Button>
                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW 4: COMMISSION LEDGER & KYC STATUS */}
          {subView === 'commission' && (() => {
            // Trilingual localized labels
            const clt = {
              en: {
                title: "Commission & Incentive Hub",
                subtitle: "Real-time ledger of your physical and commercial performance bonuses",
                nextPayout: "Next Scheduled Payout Date",
                periodComparison: "Monthly Trend Overview",
                currentPeriod: "This Period (July 2026)",
                lastPeriod: "Last Period (June 2026)",
                pendingQueue: "Admin Audit Queue",
                totalPaid: "Direct Bank Disbursed",
                trendText: "vs last month",
                ledgerTitle: "Bonus & Bounty Events Ledger",
                ledgerSubtitle: "Live mirror of Admin Payout Queue and automated NPCI disbursements",
                all: "All Events",
                pending: "Pending",
                approved: "Approved",
                paid: "Paid",
                reversed: "Reversed / Revoked",
                rulesTitle: "Active Incentive Scheme & Rules",
                rulesSubtitle: "Admin Rules Engine - Version 2.2 (July 2026)",
                rule1Title: "1. Unique Lead Capture (₹1,500)",
                rule1Desc: "Earned for each distinct, GPS-anchored physical building shaft mapped in Pune North.",
                rule2Title: "2. Deal Conversion Bonus (₹25,000)",
                rule2Desc: "Earned as soon as Sales signs contract and captures the 30% advance payment.",
                rule3Title: "3. Volume Accelerator (1.2x)",
                rule3Desc: "Triggers a 1.2x multiplier on all July captures if weekly progress reaches 100%.",
                rule4Title: "4. Anti-Fraud & Reversal Policy",
                rule4Desc: "If a deal collapses or is flagged as fake during on-site audit, bounty is reversed transparently.",
                raiseDispute: "Raise Query",
                disputeActive: "Dispute Pending",
                disputeModalTitle: "Dispute Commission Entry",
                disputeModalDesc: "Pre-attached transaction: {id} for {project}",
                disputeCategory: "Dispute Reason / Category",
                disputeExplain: "State your justification for Mr. Prashant Wable's review",
                disputePlaceholder: "Explain why this commission is disputed (e.g. deal signed last week, incorrect rule applied)...",
                disputeSuccess: "Dispute successfully filed. Pre-attached ticket routed to Admin Payout queue.",
                submitDispute: "Submit Dispute Ticket",
                cancel: "Cancel",
                searchLedger: "Search ledger entries...",
                emptyLedger: "No commission events match the selected filters."
              },
              hi: {
                title: "कमीशन और प्रोत्साहन हब",
                subtitle: "आपके भौतिक और व्यावसायिक प्रदर्शन बोनस का रीयल-टाइम लेजर",
                nextPayout: "अगली अनुसूचित भुगतान तिथि",
                periodComparison: "मासिक रुझान अवलोकन",
                currentPeriod: "यह अवधि (जुलाई 2026)",
                lastPeriod: "पिछली अवधि (जून 2026)",
                pendingQueue: "व्यवस्थापक ऑडिट कतार",
                totalPaid: "सीधे बैंक में संवितरित",
                trendText: "पिछले महीने की तुलना में",
                ledgerTitle: "बोनस और इनाम इवेंट लेजर",
                ledgerSubtitle: "व्यवस्थापक भुगतान कतार और स्वचालित एनपीसीआई संवितरण का लाइव दर्पण",
                all: "सभी कार्यक्रम",
                pending: "लंबित",
                approved: "मंजूर",
                paid: "भुगतान किया गया",
                reversed: "रिवर्स / वापस लिया गया",
                rulesTitle: "सक्रिय प्रोत्साहन योजना और नियम",
                rulesSubtitle: "एडमिन रूल्स इंजन - संस्करण 2.2 (जुलाई 2026)",
                rule1Title: "1. विशिष्ट लीड कैप्चर (₹1,500)",
                rule1Desc: "पुणे उत्तर में मैप किए गए प्रत्येक विशिष्ट, जीपीएस-एंकर भौतिक भवन शाफ्ट के लिए अर्जित।",
                rule2Title: "2. डील कन्वर्शन बोनस (₹25,000)",
                rule2Desc: "जैसे ही सेल्स अनुबंध पर हस्ताक्षर करती है और 30% अग्रिम भुगतान प्राप्त करती है, अर्जित किया जाता है।",
                rule3Title: "3. वॉल्यूम एक्सेलेरेटर (1.2x)",
                rule3Desc: "यदि साप्ताहिक प्रगति 100% तक पहुँच जाती है तो सभी जुलाई कैप्चर पर 1.2x गुणक लागू होता है।",
                rule4Title: "4. धोखाधड़ी विरोधी और प्रतिवर्तन नीति",
                rule4Desc: "यदि कोई डील विफल हो जाती है या ऑन-साइट ऑडिट के दौरान फर्जी पाई जाती है, तो इनाम वापस ले लिया जाता है।",
                raiseDispute: "विवाद उठाएं",
                disputeActive: "विवाद लंबित",
                disputeModalTitle: "कमीशन प्रविष्टि पर विवाद करें",
                disputeModalDesc: "पूर्व-संलग्न लेनदेन: {project} के लिए {id}",
                disputeCategory: "विवाद का कारण / श्रेणी",
                disputeExplain: "श्री प्रशांत वाबळे की समीक्षा के लिए अपना औचित्य बताएं",
                disputePlaceholder: "समझाएं कि इस कमीशन पर विवाद क्यों है (उदा. अनुबंध पर पिछले सप्ताह हस्ताक्षर किए गए थे, गलत नियम लागू हुआ)...",
                disputeSuccess: "विवाद सफलतापूर्वक दर्ज किया गया। टिकट व्यवस्थापक भुगतान कतार में भेज दिया गया है।",
                submitDispute: "विवाद टिकट सबमिट करें",
                cancel: "रद्द करें",
                searchLedger: "लेजर प्रविष्टियों की खोज करें...",
                emptyLedger: "चयनित फिल्टर से मेल खाने वाला कोई कमीशन इवेंट नहीं मिला।"
              },
              mr: {
                title: "कमिशन आणि प्रोत्साहन केंद्र",
                subtitle: "तुमच्या भौतिक आणि व्यावसायिक कामगिरी बोनसचे रिअल-टाइम लेजर",
                nextPayout: "पुढील अनुसूचित पेमेंट तारीख",
                periodComparison: "मासिक ट्रेंड विहंगावलोकन",
                currentPeriod: "चालू कालावधी (जुलै २०२६)",
                lastPeriod: "मागील कालावधी (जून २०२६)",
                pendingQueue: "अ‍ॅडमीन ऑडिट रांग",
                totalPaid: "थेट बँक खात्यात जमा",
                trendText: "मागील महिन्याच्या तुलनेत",
                ledgerTitle: "बोनस आणि कमिशन इव्हेंट लेजर",
                ledgerSubtitle: "अ‍ॅडमिन पेमेंट रांग आणि स्वयंचलित एनपीसीआय वितरणाचा थेट आरसा",
                all: "सर्व इव्हेंट्स",
                pending: "प्रलंबित",
                approved: "मंजूर",
                paid: "जमा झालेले",
                reversed: "रद्द / मागे घेतलेले",
                rulesTitle: "सक्रिय प्रोत्साहन योजना आणि नियम",
                rulesSubtitle: "अ‍ॅडमिन रूल्स इंजिन - आवृत्ती २.२ (जुलै २०२६)",
                rule1Title: "१. युनिक लीड नोंदणी (₹१,५००)",
                rule1Desc: "पुणे उत्तर विभागात नोंदवलेल्या प्रत्येक स्वतंत्र, जीपीएस-अँकर भौतिक लिफ्ट शाफ्टसाठी.",
                rule2Title: "२. डील कन्वर्शन बोनस (₹२५,०००)",
                rule2Desc: "सेल्स टीमने करार स्वाक्षरी करून ३०% अ‍ॅडव्हान्स पेमेंट मिळवल्यावर लगेच जमा होणार.",
                rule3Title: "३. वॉल्यूम अ‍ॅक्सिलेरेटर (१.२x)",
                rule3Desc: "साप्ताहिक प्रगती १००% गाठल्यास सर्व जुलै नोंदणीवर १.२x गुणाकार मिळतो.",
                rule4Title: "४. अँटी-फ्रॉड आणि रिव्हर्सल पॉलिसी",
                rule4Desc: "जर डील रद्द झाली किंवा ऑन-साइट ऑडिटमध्ये बनावट आढळल्यास, मिळालेले कमिशन पारदर्शकपणे वजा केले जाते.",
                raiseDispute: "तक्रार नोंदवा",
                disputeActive: "तक्रार प्रलंबित",
                disputeModalTitle: "कमिशन इव्हेंटवर तक्रार नोंदवा",
                disputeModalDesc: "संलग्न व्यवहार: {project} साठी {id}",
                disputeCategory: "तक्रारीचे कारण / श्रेणी",
                disputeExplain: "प्रशांत वाबळे सरांच्या पुनरावलोकनासाठी तुमचे स्पष्टीकरण लिहा",
                disputePlaceholder: "या कमिशनबाबत काय अडचण आहे ते स्पष्ट करा (उदा. करार मागच्या आठवड्यात झाला होता, चुकीचा नियम लागू झाला)...",
                disputeSuccess: "तक्रार यशस्वीरित्या दाखल केली. तिकीट अ‍ॅडमिन पेमेंट विभागाकडे पाठवले गेले आहे.",
                submitDispute: "तक्रार तिकीट सबमिट करा",
                cancel: "रद्द करा",
                searchLedger: "नोंद वहीत शोधा...",
                emptyLedger: "निवडलेल्या फिल्टरशी जुळणारा कोणताही कमिशन इव्हेंट सापडला नाही."
              }
            };

            const cLang = appLanguage === 'mr' ? 'mr' : appLanguage === 'hi' ? 'hi' : 'en';
            const ct = clt[cLang];

            // Generate ledger entries dynamically from current leads + static seeds
            const rawEntries = [
              // Lead capture and conversions sourced from active leads
              ...leads.flatMap((l) => {
                const results: any[] = [];
                const isMerged = !!l.is_duplicate_flagged;
                
                // 1. Capture Bounty
                results.push({
                  id: `comm-cap-${l.id.slice(0, 8)}`,
                  leadId: l.id,
                  projectName: l.buildingInfo?.address || l.contactInfo?.name || "Pune Project Site",
                  type: "lead_capture",
                  amount: 1500,
                  status: isMerged ? "approved" : (l.stage === "captured" ? "pending" : "approved"),
                  date: new Date(l.createdAt).toLocaleDateString(cLang === 'en' ? 'en-US' : 'mr-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }),
                  payoutDate: "July 15, 2026",
                  ruleVersion: "v2.2 (July 2026)"
                });

                // 2. Closed Won Conversion Bounty
                if (l.stage === 'closed_won') {
                  results.push({
                    id: `comm-conv-${l.id.slice(0, 8)}`,
                    leadId: l.id,
                    projectName: l.buildingInfo?.address || l.contactInfo?.name || "Pune Project Site",
                    type: "lead_conversion",
                    amount: l.commissionEarned || 25000,
                    status: "paid",
                    date: new Date(new Date(l.createdAt).getTime() + 4 * 24 * 3600 * 1000).toLocaleDateString(cLang === 'en' ? 'en-US' : 'mr-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }),
                    payoutDate: "June 30, 2026",
                    ruleVersion: "v2.2 (July 2026)"
                  });
                }
                return results;
              }),

              // Historical Seeds including transparent reversals & contest milestones
              {
                id: "comm-contest-june",
                projectName: cLang === 'mr' ? "पुणे उत्तर ग्रिड वेगवान धाव (जूनमध्ये १० नोंदण्या)" : cLang === 'hi' ? "पुणे उत्तर ग्रिड स्पीड रन (जून में १० पंजीकरण)" : "Pune North Grid Speed Run (10 Captures in June)",
                type: "milestone_bonus",
                amount: 5000,
                status: "paid",
                date: "Jun 25, 2026",
                payoutDate: "June 30, 2026",
                ruleVersion: "v2.1 (June 2026)"
              },
              {
                id: "comm-rev-kothrud",
                projectName: cLang === 'mr' ? "कोथरूड प्लाझा टप्पा २ (रद्द व्यवहार: करार रद्द)" : cLang === 'hi' ? "कोथरुड प्लाजा चरण २ (रद्द सौदा: अनुबंध रद्द)" : "Kothrud Plaza Phase 2 (Reversal: Deal Cancelled)",
                type: "reversal",
                amount: -1500,
                status: "reversed",
                date: "Jun 18, 2026",
                payoutDate: "June 30, 2026",
                ruleVersion: "v2.1 (June 2026)"
              },
              {
                id: "comm-seed-cap-old",
                projectName: "Bhosari Industrial Block C",
                type: "lead_capture",
                amount: 1500,
                status: "paid",
                date: "Jun 10, 2026",
                payoutDate: "June 15, 2026",
                ruleVersion: "v2.1 (June 2026)"
              }
            ];

            // Apply Search and Tab Filters to the ledger
            const filteredEntries = rawEntries.filter((entry) => {
              const query = ledgerSearchQuery.toLowerCase();
              const matchesSearch = 
                entry.id.toLowerCase().includes(query) ||
                entry.projectName.toLowerCase().includes(query) ||
                entry.type.toLowerCase().includes(query);

              if (!matchesSearch) return false;

              if (ledgerStatusFilter === 'all') return true;
              return entry.status === ledgerStatusFilter;
            });

            // Calculate Period Aggregations dynamically
            const thisPeriodTotal = rawEntries
              .filter(e => e.date.includes('Jul') || e.date.includes('जुलै') || e.date.includes('जुलाई'))
              .reduce((acc, e) => acc + e.amount, 0);

            const lastPeriodTotal = rawEntries
              .filter(e => e.date.includes('Jun') || e.date.includes('जून'))
              .reduce((acc, e) => acc + e.amount, 0);

            const pendingApprovalTotal = rawEntries
              .filter(e => e.status === 'pending' || e.status === 'approved')
              .reduce((acc, e) => acc + e.amount, 0);

            const paidDisbursementTotal = rawEntries
              .filter(e => e.status === 'paid')
              .reduce((acc, e) => acc + e.amount, 0);

            // Compute Trend indicators
            const trendIndicatorDiff = thisPeriodTotal - lastPeriodTotal;
            const trendPct = lastPeriodTotal > 0 ? Math.round((trendIndicatorDiff / lastPeriodTotal) * 100) : 0;

            // Trigger mock Refresh pull
            const triggerMockRefresh = () => {
              setIsCommissionLoading(true);
              setTimeout(() => {
                setIsCommissionLoading(false);
              }, 650);
            };

            const handleFileDispute = (e: React.FormEvent) => {
              e.preventDefault();
              if (!disputeDescription.trim()) return;

              const ticketId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
              const updatedDisputes = {
                ...disputedEntries,
                [disputeModalEntry.id]: {
                  category: disputeCategory,
                  notes: disputeDescription,
                  timestamp: new Date().toLocaleString()
                }
              };
              setDisputedEntries(updatedDisputes);
              localStorage.setItem('aiec_disputed_commissions', JSON.stringify(updatedDisputes));
              
              setSuccessMsg(`${ct.disputeSuccess} (Ticket: ${ticketId})`);
              setDisputeModalEntry(null);
              setDisputeDescription('');
              setTimeout(() => setSuccessMsg(""), 5000);
            };

            return (
              <div className="space-y-6">
                
                {/* TOP HEADER & REFRESH ACTION */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-border shadow-diffuse">
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl font-black text-charcoal flex items-center gap-2">
                      <IndianRupee className="w-5.5 h-5.5 text-antiquegold" />
                      <span>{ct.title}</span>
                    </h3>
                    <p className="text-xs text-warmgray">{ct.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={triggerMockRefresh}
                      disabled={isCommissionLoading}
                      className="px-4 py-2 bg-alabaster hover:bg-[#edeae2] rounded-xl border border-[rgba(184,135,61,0.2)] text-charcoal text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-antiquegold ${isCommissionLoading ? 'animate-spin' : ''}`} />
                      <span>{isCommissionLoading ? "Syncing..." : "Sync Ledger"}</span>
                    </button>
                    <span className="text-[10px] bg-royalemerald/10 text-royalemerald font-bold font-mono px-2.5 py-1 rounded-md uppercase">
                      Live Portal
                    </span>
                  </div>
                </div>

                {/* THE 4 KPI SNAPSHOT CARDS WITH INTERACTIVE LEDGER FILTER TRIGGERS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* KPI 1: This Period (July) */}
                  <div 
                    onClick={() => {
                      setLedgerStatusFilter('all');
                      setLedgerSearchQuery('');
                    }}
                    className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer active:scale-98 relative ${
                      ledgerStatusFilter === 'all' && ledgerSearchQuery === '' ? 'border-antiquegold ring-1 ring-antiquegold/30' : 'border-border hover:border-antiquegold/35'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-warmgray block">
                      {ct.currentPeriod}
                    </span>
                    <div className="flex justify-between items-baseline mt-1.5">
                      <span className="font-mono text-xl sm:text-2xl font-black text-charcoal">
                        ₹{thisPeriodTotal.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${trendPct >= 0 ? 'text-success' : 'text-error'}`}>
                        {trendPct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trendPct}%
                      </span>
                    </div>
                    <span className="text-[9px] text-warmgray block mt-1">
                      {ct.trendText} (June)
                    </span>
                  </div>

                  {/* KPI 2: Last Period (June) */}
                  <div 
                    onClick={() => {
                      setLedgerStatusFilter('paid');
                    }}
                    className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer active:scale-98 relative ${
                      ledgerStatusFilter === 'paid' ? 'border-antiquegold ring-1 ring-antiquegold/30' : 'border-border hover:border-antiquegold/35'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-warmgray block">
                      {ct.lastPeriod}
                    </span>
                    <div className="flex justify-between items-baseline mt-1.5">
                      <span className="font-mono text-xl sm:text-2xl font-black text-warmgray">
                        ₹{lastPeriodTotal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] bg-royalemerald/10 text-royalemerald font-bold px-1.5 py-0.5 rounded uppercase">
                        Settled
                      </span>
                    </div>
                    <span className="text-[9px] text-warmgray block mt-1">
                      Cleared to bank account
                    </span>
                  </div>

                  {/* KPI 3: Pending Approval */}
                  <div 
                    onClick={() => {
                      setLedgerStatusFilter('approved');
                    }}
                    className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer active:scale-98 relative ${
                      ledgerStatusFilter === 'approved' ? 'border-antiquegold ring-1 ring-antiquegold/30' : 'border-border hover:border-antiquegold/35'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-warmgray block">
                      {ct.pendingQueue}
                    </span>
                    <div className="flex justify-between items-baseline mt-1.5">
                      <span className="font-mono text-xl sm:text-2xl font-black text-antiquegold">
                        ₹{pendingApprovalTotal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] bg-warning/15 text-warning font-extrabold px-1.5 py-0.5 rounded uppercase">
                        Auditing
                      </span>
                    </div>
                    <span className="text-[9px] text-warmgray block mt-1">
                      Awaiting Wable Sir lock
                    </span>
                  </div>

                  {/* KPI 4: Total Paid Out */}
                  <div 
                    onClick={() => {
                      setLedgerStatusFilter('paid');
                    }}
                    className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer active:scale-98 relative ${
                      ledgerStatusFilter === 'paid' ? 'border-antiquegold ring-1 ring-antiquegold/30' : 'border-border hover:border-antiquegold/35'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-warmgray block">
                      {ct.totalPaid}
                    </span>
                    <div className="flex justify-between items-baseline mt-1.5">
                      <span className="font-mono text-xl sm:text-2xl font-black text-royalemerald">
                        ₹{paidDisbursementTotal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] bg-success/15 text-success font-extrabold px-1.5 py-0.5 rounded uppercase">
                        NPCI Clean
                      </span>
                    </div>
                    <span className="text-[9px] text-warmgray block mt-1">
                      Direct deposit active
                    </span>
                  </div>

                </div>

                {/* MAIN CONTENT BLOCK - TWO COLUMNS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* LEFT COLUMN (col-span-2): LEDGER ENGINE */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    <Card className="p-6 space-y-5">
                      
                      {/* Search and Category Filter Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(184,135,61,0.1)] pb-4">
                        <div>
                          <h4 className="font-serif text-lg font-bold text-charcoal">{ct.ledgerTitle}</h4>
                          <p className="text-[11px] text-warmgray">{ct.ledgerSubtitle}</p>
                        </div>
                        <div className="relative w-full sm:w-60">
                          <Search className="w-4 h-4 text-warmgray absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={ledgerSearchQuery}
                            onChange={(e) => setLedgerSearchQuery(e.target.value)}
                            placeholder={ct.searchLedger}
                            className="w-full pl-9 pr-4 py-2 bg-alabaster rounded-xl text-xs border border-border focus:outline-none focus:border-antiquegold text-charcoal font-sans"
                          />
                        </div>
                      </div>

                      {/* Filter Pills */}
                      <div className="flex flex-wrap gap-2">
                        {(['all', 'pending', 'approved', 'paid', 'reversed'] as const).map((status) => {
                          const labels = {
                            all: ct.all,
                            pending: ct.pending,
                            approved: ct.approved,
                            paid: ct.paid,
                            reversed: ct.reversed
                          };
                          return (
                            <button
                              key={status}
                              onClick={() => setLedgerStatusFilter(status)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                ledgerStatusFilter === status
                                  ? 'bg-antiquegold text-white shadow-sm'
                                  : 'bg-alabaster text-warmgray hover:text-charcoal border border-border'
                              }`}
                            >
                              {labels[status]}
                            </button>
                          );
                        })}
                      </div>

                      {/* LEDGER ENTRIES LISTING */}
                      <div className="space-y-4">
                        {isCommissionLoading ? (
                          // Skeleton Loading placeholders
                          Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-2xl border border-border animate-pulse space-y-3">
                              <div className="flex justify-between">
                                <div className="space-y-2 w-2/3">
                                  <div className="h-3 bg-alabaster rounded w-1/3" />
                                  <div className="h-4 bg-alabaster rounded w-3/4" />
                                  <div className="h-3 bg-alabaster rounded w-1/2" />
                                </div>
                                <div className="space-y-2 w-1/4 text-right">
                                  <div className="h-4 bg-alabaster rounded w-1/2 ml-auto" />
                                  <div className="h-3 bg-alabaster rounded w-2/3 ml-auto" />
                                </div>
                              </div>
                            </div>
                          ))
                        ) : filteredEntries.length === 0 ? (
                          <div className="p-10 text-center bg-alabaster/40 rounded-2xl border border-dashed border-border text-warmgray text-xs space-y-1.5">
                            <Info className="w-6 h-6 mx-auto text-antiquegold/60" />
                            <p className="font-bold">{ct.emptyLedger}</p>
                          </div>
                        ) : (
                          filteredEntries.map((entry) => {
                            const isDisputed = !!disputedEntries[entry.id];
                            const disputeDetails = disputedEntries[entry.id];

                            return (
                              <div 
                                key={entry.id}
                                className={`p-4 bg-white rounded-2xl border hover:border-antiquegold/25 transition-all shadow-sm space-y-3.5 relative ${
                                  entry.status === 'reversed' ? 'bg-error/[0.01] border-error/15' : 'border-border'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div className="space-y-1.5 max-w-[70%]">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      {/* Entry Type Badge */}
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                                        entry.type === 'lead_capture' ? 'bg-antiquegold/10 text-antiquegold' :
                                        entry.type === 'lead_conversion' ? 'bg-royalemerald/10 text-royalemerald' :
                                        entry.type === 'milestone_bonus' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                        'bg-error/10 text-error'
                                      }`}>
                                        {entry.type === 'lead_capture' ? "Capture Bounty" :
                                         entry.type === 'lead_conversion' ? "Deal Closer" :
                                         entry.type === 'milestone_bonus' ? "Milestone Reward" :
                                         "Reversal Deduct"}
                                      </span>

                                      {/* Rule Version Badge */}
                                      <span className="text-[9px] font-mono text-warmgray">
                                        Rule: {entry.ruleVersion}
                                      </span>
                                    </div>

                                    <h5 className="font-bold text-sm text-charcoal leading-tight">
                                      {entry.projectName}
                                    </h5>
                                    
                                    <div className="flex items-center gap-2 text-[10px] text-warmgray">
                                      <span className="font-mono">{entry.date}</span>
                                      <span>•</span>
                                      <span>ID: <strong className="font-mono text-charcoal">{entry.id}</strong></span>
                                    </div>
                                  </div>

                                  <div className="text-right flex flex-col items-end gap-1 font-mono">
                                    {/* Amount Display */}
                                    <span className={`text-sm sm:text-base font-black ${
                                      entry.amount >= 0 ? 'text-royalemerald' : 'text-error'
                                    }`}>
                                      {entry.amount >= 0 ? '+' : ''}₹{entry.amount.toLocaleString('en-IN')}
                                    </span>

                                    {/* Status Badge */}
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                      entry.status === 'pending' ? 'bg-warning/10 text-warning' :
                                      entry.status === 'approved' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                      entry.status === 'paid' ? 'bg-success/10 text-success' :
                                      'bg-error/10 text-error'
                                    }`}>
                                      {entry.status === 'pending' ? "Pending Audit" :
                                       entry.status === 'approved' ? "Approved" :
                                       entry.status === 'paid' ? "Paid" :
                                       "Reversed"}
                                    </span>
                                  </div>
                                </div>

                                {/* Custom dispute details if filed */}
                                {isDisputed && (
                                  <div className="p-3 bg-warning/5 border border-warning/20 rounded-xl space-y-1">
                                    <div className="flex items-center gap-1.5 text-warning font-extrabold text-[9px] uppercase tracking-wider">
                                      <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0" />
                                      <span>{ct.disputeActive}</span>
                                      <span className="text-warmgray lowercase normal-case font-mono">({disputeDetails.timestamp})</span>
                                    </div>
                                    <p className="text-[10px] italic text-charcoal leading-relaxed">
                                      "{disputeDetails.notes}"
                                    </p>
                                  </div>
                                )}

                                {/* Card Actions Footer */}
                                <div className="pt-2.5 border-t border-dashed border-[#e6dfd4] flex items-center justify-between gap-4">
                                  <span className="text-[9px] text-warmgray font-sans">
                                    Estimated Payout: <strong className="font-mono text-charcoal">{entry.payoutDate}</strong>
                                  </span>
                                  
                                  {!isDisputed && entry.status !== 'reversed' && (
                                    <button
                                      onClick={() => {
                                        setDisputeModalEntry(entry);
                                        setDisputeCategory(entry.type === 'lead_capture' ? 'missing_capture' : 'underpaid_conversion');
                                      }}
                                      className="px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-antiquegold hover:text-white hover:bg-antiquegold rounded-md border border-[rgba(184,135,61,0.25)] bg-white transition-all cursor-pointer"
                                    >
                                      {ct.raiseDispute}
                                    </button>
                                  )}
                                </div>

                              </div>
                            );
                          })
                        )}
                      </div>

                    </Card>

                  </div>

                  {/* RIGHT COLUMN (col-span-1): ACTIVE RULES, PAYOUT SCHEDULE, KYC */}
                  <div className="space-y-6">

                    {/* PAYOUT MILESTONE PROGRESSION TRACK (Vertical Ascension Line motif) */}
                    <Card className="p-6 space-y-4">
                      <div className="border-b border-[rgba(184,135,61,0.1)] pb-3">
                        <span className="text-[9px] uppercase font-mono tracking-widest text-antiquegold font-extrabold block">
                          NPCI ACH DISBURSEMENT CYCLE
                        </span>
                        <h4 className="font-serif text-md font-bold text-charcoal mt-1">
                          {ct.nextPayout}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-2 bg-royalemerald/15 text-royalemerald font-mono font-extrabold text-xs px-2.5 py-1 rounded-md w-max">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>July 15, 2026</span>
                        </div>
                      </div>

                      {/* Vertical sequence representational track */}
                      <div className="pl-1 py-1">
                        <AscensionLine 
                          orientation="vertical"
                          steps={[
                            { id: "kyc_ok", label: "Stage 1: KYC Bank Registry Clearance", completed: dbUser.bankVerifiedStatus === 'verified', active: dbUser.bankVerifiedStatus === 'verified' },
                            { id: "audit_ok", label: "Stage 2: Bi-Weekly Admin Audit Loop", completed: true, active: false },
                            { id: "disb_pending", label: "Stage 3: Automated NPCI Fund Release", completed: false, active: true }
                          ]}
                        />
                      </div>

                      <p className="text-[10px] text-warmgray italic leading-relaxed text-center">
                        Ascension Line represents current payout pipeline. All milestones must glow green to clear disbursements automatically.
                      </p>
                    </Card>

                    {/* ACTIVE REVENUE rules SCHEME (v2.2) */}
                    <Card className="p-6 space-y-4">
                      <div className="border-b border-[rgba(184,135,61,0.1)] pb-3">
                        <h4 className="font-serif text-md font-bold text-charcoal">
                          {ct.rulesTitle}
                        </h4>
                        <p className="text-[10px] text-warmgray font-mono mt-0.5">
                          {ct.rulesSubtitle}
                        </p>
                      </div>

                      <div className="space-y-4 text-xs font-sans">
                        
                        {/* Rule 1 */}
                        <div className="space-y-1 p-2 rounded-xl hover:bg-alabaster/40 transition-all">
                          <h5 className="font-extrabold text-charcoal flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-antiquegold shrink-0" />
                            <span>{ct.rule1Title}</span>
                          </h5>
                          <p className="text-warmgray text-[10px] leading-relaxed pl-3">
                            {ct.rule1Desc}
                          </p>
                        </div>

                        {/* Rule 2 */}
                        <div className="space-y-1 p-2 rounded-xl hover:bg-alabaster/40 transition-all">
                          <h5 className="font-extrabold text-charcoal flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-royalemerald shrink-0" />
                            <span>{ct.rule2Title}</span>
                          </h5>
                          <p className="text-warmgray text-[10px] leading-relaxed pl-3">
                            {ct.rule2Desc}
                          </p>
                        </div>

                        {/* Rule 3 */}
                        <div className="space-y-1 p-2 rounded-xl hover:bg-alabaster/40 transition-all">
                          <h5 className="font-extrabold text-indigo-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                            <span>{ct.rule3Title}</span>
                          </h5>
                          <p className="text-warmgray text-[10px] leading-relaxed pl-3">
                            {ct.rule3Desc}
                          </p>
                        </div>

                        {/* Rule 4 */}
                        <div className="space-y-1 p-2 rounded-xl hover:bg-alabaster/40 transition-all">
                          <h5 className="font-extrabold text-error flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                            <span>{ct.rule4Title}</span>
                          </h5>
                          <p className="text-warmgray text-[10px] leading-relaxed pl-3">
                            {ct.rule4Desc}
                          </p>
                        </div>

                      </div>
                    </Card>

                    {/* NPCI KYC CONTROL BLOCK */}
                    <Card className="p-6 space-y-4">
                      <h4 className="text-xs uppercase font-extrabold tracking-widest text-charcoal">NPCI KYC Registry</h4>
                      
                      {dbUser.bankVerifiedStatus !== 'verified' ? (
                        <div className="p-4 bg-error/10 border border-error/20 rounded-2xl space-y-3">
                          <div className="flex gap-2.5">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-error mt-0.5" />
                            <h4 className="font-bold text-xs uppercase tracking-wider text-error">{lt.kycBlocked}</h4>
                          </div>
                          <p className="text-xs text-error/95 leading-relaxed font-sans">
                            {lt.kycBlockedDesc}
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-success/10 border border-success/20 rounded-2xl space-y-3">
                          <div className="flex gap-2.5">
                            <CheckCircle className="w-5 h-5 shrink-0 text-success mt-0.5" />
                            <h4 className="font-bold text-xs uppercase tracking-wider text-success">{lt.kycCleared}</h4>
                          </div>
                          <p className="text-xs text-success/95 leading-relaxed font-sans">
                            {lt.kycClearedDesc}
                          </p>
                        </div>
                      )}

                      {/* Interactive Button to toggle KYC verification status */}
                      <button
                        onClick={handleToggleKycClearance}
                        className="w-full py-2.5 bg-charcoal text-white hover:bg-antiquegold transition-all text-xs font-bold uppercase rounded-xl tracking-wide cursor-pointer"
                      >
                        🔄 {lt.toggleKycBtn}
                      </button>

                      <div className="pt-2 border-t border-[rgba(184,135,61,0.1)] text-[11px] text-warmgray space-y-1.5 font-sans">
                        <div className="flex justify-between">
                          <span>KYC Verification ID:</span>
                          <span className="font-mono text-charcoal font-bold">NPCI-0912-332A</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Penny-Drop Stamp:</span>
                          <span className="font-mono text-charcoal font-bold">SUCCESS (₹1.00)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Linked Account:</span>
                          <span className="font-mono text-charcoal font-bold">SBI ****4321</span>
                        </div>
                      </div>
                    </Card>

                  </div>

                </div>

                {/* DISPUTE SUBMISSION MODAL/DRAWER */}
                {disputeModalEntry && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <Card className="w-full max-w-lg bg-white shadow-2xl relative border border-[rgba(184,135,61,0.25)] overflow-hidden">
                      
                      <div className="p-5 border-b border-[rgba(184,135,61,0.12)] bg-[#F8F6F1] flex justify-between items-center">
                        <h4 className="font-serif text-lg font-bold text-charcoal">
                          {ct.disputeModalTitle}
                        </h4>
                        <button
                          onClick={() => setDisputeModalEntry(null)}
                          className="p-1 text-warmgray hover:text-charcoal font-bold text-sm cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleFileDispute} className="p-5 space-y-4 text-xs">
                        
                        {/* Selected Transaction Metadata box */}
                        <div className="p-3.5 bg-alabaster rounded-xl border border-border space-y-1">
                          <p className="text-warmgray uppercase tracking-widest text-[8px] font-mono">Pre-attached Transaction Node</p>
                          <p className="font-bold text-charcoal">{disputeModalEntry.projectName}</p>
                          <div className="flex justify-between font-mono text-[10px] text-warmgray pt-1">
                            <span>ID: {disputeModalEntry.id}</span>
                            <span>Amount: ₹{disputeModalEntry.amount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Category Selector */}
                        <div className="space-y-1.5">
                          <label className="font-bold text-charcoal block">
                            {ct.disputeCategory}
                          </label>
                          <select
                            value={disputeCategory}
                            onChange={(e) => setDisputeCategory(e.target.value)}
                            className="w-full p-2.5 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-antiquegold text-charcoal font-sans"
                          >
                            <option value="missing_capture">Missing Unique Lead Capture Bounty (₹1,500)</option>
                            <option value="underpaid_conversion">Underpaid / Missing Deal Closer Bonus (₹25,000)</option>
                            <option value="incorrect_multiplier">Incorrect July Accelerator Multiplier Applied</option>
                            <option value="status_mismatch">Administrative Status Dispute (Marked Reversed incorrectly)</option>
                          </select>
                        </div>

                        {/* Description rationale */}
                        <div className="space-y-1.5">
                          <label className="font-bold text-charcoal block">
                            {ct.disputeExplain}
                          </label>
                          <textarea
                            required
                            rows={4}
                            value={disputeDescription}
                            onChange={(e) => setDisputeDescription(e.target.value)}
                            placeholder={ct.disputePlaceholder}
                            className="w-full p-3 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-antiquegold text-charcoal font-sans resize-none"
                          />
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-[rgba(184,135,61,0.1)] flex justify-end gap-3.5">
                          <button
                            type="button"
                            onClick={() => setDisputeModalEntry(null)}
                            className="px-4 py-2 text-warmgray hover:text-charcoal font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                          >
                            {ct.cancel}
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-antiquegold text-white rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-opacity-95 shadow-sm cursor-pointer transition-all active:scale-95"
                          >
                            {ct.submitDispute}
                          </button>
                        </div>

                      </form>

                    </Card>
                  </div>
                )}

              </div>
            );
          })()}

          {/* VIEW 5: SURVEYOR PERFORMANCE & REWARDS */}
          {subView === 'rewards' && (() => {
            // Multi-language translation support
            const rlt = {
              en: {
                title: "Performance, Standings & Badges",
                subtitle: "Elevate your field results, claim top spots on active contests, and earn prestigious surveyor merit badges.",
                accuracyTitle: "Avg. Verification Accuracy",
                leadsTitle: "Leads Captured (Monthly)",
                efficiencyTitle: "Average Conversion Time",
                accuracyUnit: "% Accuracy",
                leadsUnit: "leads",
                efficiencyUnit: "days",
                trendWeekly: "leads/week",
                accuracyWeekly: "geo-verification accuracy",
                activeContestHeader: "🏆 Active Contest: Monsoon Lead-Slam 2026",
                noContestHeader: "🏆 Contests & Milestones",
                rewardStakeLabel: "🎁 Reward at Stake:",
                contestRulesLabel: "Contest Rules:",
                contestTimeLabel: "Timeline:",
                rewardsBadgeSheetTitle: "Ruleset Config Engine",
                rulesetVersion: "Ruleset Engine Code:",
                validatedBy: "Validated & certified by AIEC Rules Engine on",
                verifiedUnder: "Qualified under Ruleset",
                backwardsCompatNote: "Backwards compatibility preserved under v2.2 legacy protocols.",
                earnedOn: "Qualified:",
                statusEarned: "Earned",
                statusInProgress: "In Progress",
                simulateActiveContest: "Active Contest running",
                simulateInactiveContest: "No Active Contest",
                simulationConsole: "SIMULATOR SYSTEM PANEL",
                unlockedBadgeText: "Click any badge card to review its verified audit rules, qualification history, and backwards compatibility settings.",
                nextMilestoneTitle: "Your Ascension Milestone Path",
                nextMilestoneDesc: "Track your long-term physical inspection volume achievements."
              },
              hi: {
                title: "प्रदर्शन, रैंकिंग और बैज",
                subtitle: "अपने फील्ड परिणामों को बढ़ाएं, सक्रिय प्रतियोगिताओं में शीर्ष स्थान प्राप्त करें, और प्रतिष्ठित सर्वेक्षक योग्यता बैज अर्जित करें।",
                accuracyTitle: "औसत भू-सत्यापन सटीकता",
                leadsTitle: "दर्ज की गई लीड (मासिक)",
                efficiencyTitle: "औसत रूपांतरण समय",
                accuracyUnit: "% सटीकता",
                leadsUnit: "लीड्स",
                efficiencyUnit: "दिन",
                trendWeekly: "लीड प्रति सप्ताह",
                accuracyWeekly: "भू-सत्यापन सटीकता",
                activeContestHeader: "🏆 सक्रिय प्रतियोगिता: मानसून लीड-स्लैम 2026",
                noContestHeader: "🏆 प्रतियोगिताएं और मील के पत्थर",
                rewardStakeLabel: "🎁 दांव पर इनाम:",
                contestRulesLabel: "प्रतियोगिता के नियम:",
                contestTimeLabel: "समय सीमा:",
                rewardsBadgeSheetTitle: "नियम पुस्तिका इंजन",
                rulesetVersion: "नियम पुस्तिका कोड:",
                validatedBy: "AIEC नियम इंजन द्वारा सत्यापित",
                verifiedUnder: "इस नियम पुस्तिका के अंतर्गत योग्यता:",
                backwardsCompatNote: "पुराने संस्करणों के साथ अनुकूलता v2.2 नियमों के अंतर्गत सुरक्षित है।",
                earnedOn: "अर्जित तिथि:",
                statusEarned: "अर्जित",
                statusInProgress: "प्रगति पर",
                simulateActiveContest: "सक्रिय प्रतियोगिता सिम्युलेटर",
                simulateInactiveContest: "कोई सक्रिय प्रतियोगिता नहीं",
                simulationConsole: "सिम्युलेटर सिस्टम पैनल",
                unlockedBadgeText: "इसके सत्यापित ऑडिट नियमों, पात्रता इतिहास और बैकवर्ड कम्पैटिबिलिटी सेटिंग्स की समीक्षा करने के लिए किसी भी बैज कार्ड पर टैप करें।",
                nextMilestoneTitle: "आपका आरोहण मील का पत्थर मार्ग",
                nextMilestoneDesc: "अपनी दीर्घकालिक भौतिक निरीक्षण मात्रा उपलब्धियों को ट्रैक करें।"
              },
              mr: {
                title: "कामगिरी, क्रमवारी आणि बॅजेस",
                subtitle: "तुमची मैदानी कामगिरी उंचावा, सक्रिय स्पर्धांमध्ये अव्वल स्थान मिळवा आणि प्रतिष्ठित सर्वेक्षक गुणवत्ता बॅजेस मिळवा.",
                accuracyTitle: "सरासरी भू-पडताळणी अचूकता",
                leadsTitle: "नोंदवलेले लीड्स (मासिक)",
                efficiencyTitle: "सरासरी रूपांतरण वेळ",
                accuracyUnit: "% अचूकता",
                leadsUnit: "लीड्स",
                efficiencyUnit: "दिवस",
                trendWeekly: "लीड प्रति आठवडा",
                accuracyWeekly: "भू-पडताळणी अचूकता",
                activeContestHeader: "🏆 सक्रिय स्पर्धा: मान्सून लीड-स्लॅम २०२६",
                noContestHeader: "🏆 स्पर्धा आणि टप्पे",
                rewardStakeLabel: "🎁 मिळणारे बक्षीस:",
                contestRulesLabel: "स्पर्धेचे नियम:",
                contestTimeLabel: "कालावधी:",
                rewardsBadgeSheetTitle: "नियम पुस्तिका इंजिन",
                rulesetVersion: "नियम पुस्तिका कोड:",
                validatedBy: "AIEC नियम इंजिनद्वारे सत्यापित",
                verifiedUnder: "या नियमांतर्गत पात्रता मिळाली:",
                backwardsCompatNote: "मागील नियमांशी सुसंगतता v2.2 नियमांनुसार सुरक्षित ठेवली आहे.",
                earnedOn: "पात्रता दिनांक:",
                statusEarned: "मिळवला",
                statusInProgress: "प्रगतीपथावर",
                simulateActiveContest: "सक्रिय स्पर्धा सिम्युलेटर",
                simulateInactiveContest: "सध्या कोणतीही स्पर्धा नाही",
                simulationConsole: "सिम्युलेटर सिस्टम पॅनेल",
                unlockedBadgeText: "ऑडिट नियम, पात्रता इतिहास आणि बॅकवर्ड सुसंगतता तपशीलांचे पुनरावलोकन करण्यासाठी कोणत्याही बॅज कार्डवर टॅप करा.",
                nextMilestoneTitle: "तुमचा आरोहण टप्पा मार्ग",
                nextMilestoneDesc: "तुमच्या दीर्घकालीन भौतिक तपासणी कामगिरीचा मागोवा घ्या."
              }
            };

            const rLang = appLanguage === 'mr' ? 'mr' : appLanguage === 'hi' ? 'hi' : 'en';
            const rt = rlt[rLang];

            // 1. Chart trend data
            const trendData = [
              { name: 'Apr', leads: 12, accuracy: 98.0, conversion: 16 },
              { name: 'May', leads: 18, accuracy: 99.2, conversion: 15 },
              { name: 'Jun', leads: 24, accuracy: 100.0, conversion: 14 },
              { name: 'Jul', leads: 28, accuracy: 100.0, conversion: 13 }
            ];

            // 2. Leaderboard data (Monsoon Lead-Slam)
            const standings = [
              { rank: 1, name: "Aniket Shinde", leads: 32, trend: "+12% vs last week", isTop: true, isUser: false },
              { rank: 2, name: "You", leads: 28, trend: "+8% vs last week", isTop: true, isUser: true },
              { rank: 3, name: "Sanjay Deshpande", leads: 27, trend: "+15% vs last week", isTop: true, isUser: false },
              { rank: 4, name: "Rahul Gaikwad", leads: 22, trend: "+5% vs last week", isTop: false, isUser: false },
              { rank: 5, name: "Pooja Patil", leads: 19, trend: "+2% vs last week", isTop: false, isUser: false }
            ];

            // Highlight logged-in user if name matches or replace rank 2 name dynamically
            const processedStandings = standings.map(s => {
              if (s.isUser) {
                return { ...s, name: `${dbUser.name || user.name || "Ankit"} (You)` };
              }
              return s;
            });

            // 3. Central Badges definitions with historic qualifier info & backwards compatibility criteria
            const badges = [
              {
                id: 'badge_frontline',
                name: rLang === 'mr' ? 'फ्रंटलाईन पायोनियर' : rLang === 'hi' ? 'फ्रंटलाइन पायनियर' : 'Frontline Pioneer',
                desc: rLang === 'mr' ? 'पुणे उत्तर भागात पहिले १० सत्यापित हाय-राईझ लीड नोंदवले.' : rLang === 'hi' ? 'पुणे उत्तर में पहले 10 सत्यापित हाई-राइज लीड दर्ज किए।' : 'Captured first 10 verified high-rise lead nodes in Pune North.',
                icon: Sparkles,
                iconColor: "text-amber-500",
                bgColor: "bg-amber-50 border-amber-200",
                status: "earned",
                earnedDate: "June 10, 2026",
                rulesetCode: "REF-REWARDS-F10",
                rulesetDetails: rLang === 'mr' ? "१० भौगोलिकदृष्ट्या विखुरलेल्या युनिक कमर्शियल किंवा रेसिडेन्शिअल इमारतींचा यशस्वी शाफ्ट सर्व्हे आणि जीपीएस-अँकर पडताळणी." : rLang === 'hi' ? "10 भौगोलिक रूप से अलग अद्वितीय वाणिज्यिक या आवासीय इमारतों का सफल भौतिक शाफ्ट सर्वेक्षण और जीपीएस-एंकर सत्यापन।" : "Successful physical shaft survey and GPS-anchor verification of 10 separate buildings.",
                rulesetVersion: "v2.1",
                compatibilityNote: rLang === 'mr' ? "v2.1 नियमांतर्गत मंजूर, v2.2 मध्ये पूर्णतः सुसंगत आणि समाविष्ट." : rLang === 'hi' ? "v2.1 नियमों के तहत अनुमोदित, v2.2 में पूरी तरह से सुसंगत और शामिल।" : "Approved under v2.1 ruleset, fully compliant and grandfathered into v2.2 layout."
              },
              {
                id: 'badge_geo',
                name: rLang === 'mr' ? 'लेझर आय जिओ-व्हेरिफिकेटर' : rLang === 'hi' ? 'लेजर आई जियो-वेरीफिकेटर' : 'Laser Eye Geo-Verificator',
                desc: rLang === 'mr' ? 'सलग २ महिने १००% अचूक जीपीएस पडताळणी राखली.' : rLang === 'hi' ? 'लगातार 2 महीनों तक 100% सटीक जीपीएस सत्यापन बनाए रखा।' : 'Maintained 100% accurate coordinate validation with zero GPS adjustments for 2 consecutive months.',
                icon: ShieldCheck,
                iconColor: "text-royalemerald",
                bgColor: "bg-emerald-50 border-emerald-200",
                status: "earned",
                earnedDate: "June 30, 2026",
                rulesetCode: "REF-REWARDS-GEO",
                rulesetDetails: rLang === 'mr' ? "कमीशन मंजूरीसाठी कोणतेही त्रुटी सुधारणे किंवा मॅन्युअल जीपीएस बदल न करता १००% अचूक लोकेशन ऑडिट." : rLang === 'hi' ? "कमीशन अनुमोदन के लिए बिना किसी त्रुटि सुधार या मैन्युअल जीपीएस समायोजन के 100% सटीक लाइव लोकेशन ऑडिट।" : "100% accurate live location audit with zero manual overrides or error corrections for commission approvals.",
                rulesetVersion: "v2.1",
                compatibilityNote: rLang === 'mr' ? "v2.1 नियमांनुसार प्रमाणित, v2.2 मधील कठोर मानकांशी सुसंगत." : rLang === 'hi' ? "v2.1 नियमों के अनुसार प्रमाणित, v2.2 के कड़े मानकों के साथ सुसंगत।" : "Certified under v2.1 ruleset, fully compliant with v2.2 anti-fraud constraints."
              },
              {
                id: 'badge_shaft',
                name: rLang === 'mr' ? 'लिफ्ट शाफ्ट आर्किटेक्ट' : rLang === 'hi' ? 'लिफ्ट शाफ्ट आर्किटेक्ट' : 'Shaft Architect',
                desc: rLang === 'mr' ? 'कॅनव्हास टूलचा वापर करून २० अचूक २D लिफ्ट रेखाचित्रे काढली.' : rLang === 'hi' ? 'कैंवस टूल का उपयोग करके 20 सटीक 2D लिफ्ट रेखाचित्र तैयार किए।' : 'Completed 20 detailed hand-drawn 2D elevator shaft blueprints using on-site sketch tool.',
                icon: Building,
                iconColor: "text-indigo-600",
                bgColor: "bg-indigo-50 border-indigo-200",
                status: "earned",
                earnedDate: "July 02, 2026",
                rulesetCode: "REF-REWARDS-ARC",
                rulesetDetails: rLang === 'mr' ? "२० स्वतंत्र ऑन-साइट शाफ्टचे अचूक परिमाण रेखाचित्र, ज्यात दरवाजा रुंदी आणि काउंटरवेटेस क्लिअरन्स अचूकपणे रेखाटले गेले आहे." : rLang === 'hi' ? "20 व्यक्तिगत ऑन-साइट शाफ्ट का सटीक आयाम रेखाचित्र, जिसमें दरवाजे की चौड़ाई और काउंटरवेट स्पेस क्लीयरेंस स्पष्ट रूप से दर्शाया गया है।" : "Precise dimensional drawings of 20 distinct shaft structures, detailing door width and counterweight clearances.",
                rulesetVersion: "v2.2",
                compatibilityNote: rLang === 'mr' ? "जुलै २०२६ च्या सुधारित नियमांनुसार थेट पात्र." : rLang === 'hi' ? "जुलाई 2026 के संशोधित नियमों के तहत सीधे पात्र।" : "Directly qualified under July 2026 newly updated specifications ruleset."
              },
              {
                id: 'badge_nodup',
                name: rLang === 'mr' ? 'झिरो फ्लॅग्ड डुप्लिकेट्स' : rLang === 'hi' ? 'शून्य फ्लैग्ड डुप्लीकेट्स' : 'Zero Flagged Duplicates',
                desc: rLang === 'mr' ? 'सलग ३ महिने अ‍ॅडमीन किंवा वाबळे सरांकडून कोणतीही डुप्लिकेट नोंदणी नाकारली गेली नाही.' : rLang === 'hi' ? 'लगातार 3 महीनों तक एडमिन या वाबळे सर द्वारा कोई डुप्लिकेट प्रविष्टि खारिज नहीं की गई।' : 'Completed 3 consecutive months of physical surveys with zero duplicate override rejections from admin.',
                icon: CheckCircle,
                iconColor: "text-blue-600",
                bgColor: "bg-blue-50 border-blue-200",
                status: "earned",
                earnedDate: "July 05, 2026",
                rulesetCode: "REF-REWARDS-DUP",
                rulesetDetails: rLang === 'mr' ? "सलग ९० दिवस १०० मीटरच्या परिघात कोणत्याही अस्तित्वातील लीडवर चुकीची नोंदणी न करण्याचा स्वच्छ इतिहास." : rLang === 'hi' ? "लगातार 90 दिनों तक 100 मीटर के दायरे में किसी भी मौजूदा लीड पर अनधिकृत ओवरराइड न करने का स्वच्छ इतिहास।" : "Clean physical inspection history without unauthorized overlaps or radius errors within 100m for 90 days.",
                rulesetVersion: "v2.1",
                compatibilityNote: rLang === 'mr' ? "v2.1 नुसार पडताळणी, v2.2 ऑडिट पॉलिसीशी सुसंगत." : rLang === 'hi' ? "v2.1 के अनुसार सत्यापित, v2.2 ऑडिट नीति के साथ पूरी तरह से सुसंगत।" : "Verified under v2.1 compliance parameters, fully compliant with v2.2 audit policies."
              },
              {
                id: 'badge_gladiator',
                name: rLang === 'mr' ? 'मान्सून ग्लॅडिएटर' : rLang === 'hi' ? 'मानसून ग्लैडिएटर' : 'Monsoon Gladiator',
                desc: rLang === 'mr' ? 'पावसाळ्यात नियोजित साप्ताहिक मार्गावरील सर्व तपासण्या पूर्ण करणे.' : rLang === 'hi' ? 'बारिश के मौसम में साप्ताहिक नियोजित मार्ग की सभी भौतिक जांच पूरी करना।' : 'Complete 100% of your assigned weekly route sequence stops during the rainy season.',
                icon: Clock,
                iconColor: "text-error",
                bgColor: "bg-red-50 border-red-100",
                status: "in_progress",
                earnedDate: "Active Target",
                rulesetCode: "REF-REWARDS-GLD",
                rulesetDetails: rLang === 'mr' ? "मार्ग नियोजकातील थकीत किंवा फॉलो-अप्स विनाविलंब आणि १००% पूर्ण करणे." : rLang === 'hi' ? "मार्ग नियोजक में असाइन किए गए सभी साप्ताहिक फॉलो-अप्स को बिना किसी देरी के 100% पूरा करना।" : "100% timely check-ins on all weekly assigned route sequence nodes on the live route planner map.",
                rulesetVersion: "v2.2",
                compatibilityNote: rLang === 'mr' ? "सध्या ८५% पूर्ण - पात्रतेसाठी आणखी ५ साईट भेटी आवश्यक." : rLang === 'hi' ? "वर्तमान में 85% पूरा - योग्यता के लिए 5 और साइट विज़िट आवश्यक।" : "Currently 85% complete - 5 more on-site geo-inspections required to qualify."
              }
            ];

            // 4. Milestone Steps
            const milestoneSteps = [
              { id: 'm1', label: rLang === 'mr' ? "फ्रंटलाईन पायनियर (१० लीड्स)" : rLang === 'hi' ? "फ्रंटलाइन पायनियर (10 लीड्स)" : "Frontline Pioneer (10 Leads)", completed: true, active: false },
              { id: 'm2', label: rLang === 'mr' ? "हाफ-सेंच्युरी स्पार्क (२५ लीड्स)" : rLang === 'hi' ? "हाफ-सेंच्युरी स्पार्क (25 लीड्स)" : "Half-Century Spark (25 Leads)", completed: true, active: false },
              { id: 'm3', label: rLang === 'mr' ? "साईट सॉव्हरेन (५० लीड्स) - सध्या २८/५०" : rLang === 'hi' ? "साइट सॉवरेन (50 लीड्स) - वर्तमान में 28/50" : "Site Sovereign (50 Leads) - Current 28/50", completed: false, active: true },
              { id: 'm4', label: rLang === 'mr' ? "लिफ्ट लिजंड (१०० लीड्स)" : rLang === 'hi' ? "लिफ्ट लीजेंड (100 लीड्स)" : "Elevator Legend (100 Leads)", completed: false, active: false }
            ];

            return (
              <div className="space-y-8 animate-fadeIn text-charcoal font-sans">
                
                {/* SIMULATOR TOGGLE PANEL */}
                <div className="p-4 bg-alabaster border border-[rgba(184,135,61,0.25)] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-antiquegold tracking-widest uppercase block">
                      🛠️ {rt.simulationConsole}
                    </span>
                    <p className="text-[10px] text-warmgray mt-0.5">
                      Toggle simulator state to test how the screen adapts when there are no active company contests.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setIsContestActive(true)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isContestActive 
                          ? 'bg-antiquegold text-white shadow-sm' 
                          : 'bg-white border border-border text-warmgray hover:text-charcoal'
                      }`}
                    >
                      🟢 {rt.simulateActiveContest}
                    </button>
                    <button
                      onClick={() => setIsContestActive(false)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        !isContestActive 
                          ? 'bg-charcoal text-white shadow-sm' 
                          : 'bg-white border border-border text-warmgray hover:text-charcoal'
                      }`}
                    >
                      🔴 {rt.simulateInactiveContest}
                    </button>
                  </div>
                </div>

                {/* HEADER BLOCK */}
                <div className="border-b border-[rgba(184,135,61,0.12)] pb-5">
                  <h3 className="font-serif text-2xl font-black text-charcoal tracking-tight">
                    {rt.title}
                  </h3>
                  <p className="text-xs text-warmgray mt-1 max-w-2xl leading-relaxed">
                    {rt.subtitle}
                  </p>
                </div>

                {/* PERFORMANCE METRICS & CHARTS GRID */}
                <div className="space-y-6">
                  
                  {/* Stat Boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-5 flex items-center gap-4 hoverEffect">
                      <div className="w-12 h-12 rounded-xl bg-royalemerald/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6 text-royalemerald" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-warmgray tracking-wider block">{rt.accuracyTitle}</span>
                        <h4 className="text-xl font-bold text-charcoal font-serif mt-0.5">99.4%</h4>
                        <span className="inline-flex items-center gap-1 text-[9px] text-success font-semibold mt-1 bg-success/10 px-1.5 py-0.5 rounded-md">
                          <TrendingUp className="w-2.5 h-2.5" />
                          <span>{rt.accuracyUnit}</span>
                        </span>
                      </div>
                    </Card>

                    <Card className="p-5 flex items-center gap-4 hoverEffect">
                      <div className="w-12 h-12 rounded-xl bg-antiquegold/10 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6 text-antiquegold" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-warmgray tracking-wider block">{rt.leadsTitle}</span>
                        <h4 className="text-xl font-bold text-charcoal font-serif mt-0.5">28</h4>
                        <span className="inline-flex items-center gap-1 text-[9px] text-antiquegold font-semibold mt-1 bg-antiquegold/10 px-1.5 py-0.5 rounded-md">
                          <TrendingUp className="w-2.5 h-2.5" />
                          <span>+4 {rt.leadsUnit}</span>
                        </span>
                      </div>
                    </Card>

                    <Card className="p-5 flex items-center gap-4 hoverEffect">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-warmgray tracking-wider block">{rt.efficiencyTitle}</span>
                        <h4 className="text-xl font-bold text-charcoal font-serif mt-0.5">13</h4>
                        <span className="inline-flex items-center gap-1 text-[9px] text-indigo-700 font-semibold mt-1 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                          <TrendingDown className="w-2.5 h-2.5" />
                          <span>-3 {rt.efficiencyUnit}</span>
                        </span>
                      </div>
                    </Card>
                  </div>

                  {/* Recharts Graphical Panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    
                    {/* Leads Captured Trend */}
                    <Card className="p-5 space-y-4">
                      <div>
                        <h4 className="text-xs uppercase font-extrabold tracking-widest text-charcoal">Physical Inspection Yield</h4>
                        <p className="text-[10px] text-warmgray mt-0.5">Total unique elevator shafts geo-mapped & approved monthly</p>
                      </div>
                      <div className="h-[220px] w-full font-mono text-[10px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#B8873D" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#B8873D" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(184,135,61,0.08)" />
                            <XAxis dataKey="name" stroke="#877e74" />
                            <YAxis stroke="#877e74" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#2A2723', border: 'none', borderRadius: '8px', color: '#FFFFFF' }}
                              labelStyle={{ fontWeight: 'bold', color: '#B8873D' }}
                            />
                            <Area type="monotone" dataKey="leads" stroke="#B8873D" strokeWidth={2.5} fillOpacity={1} fill="url(#goldGradient)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    {/* Geo-Accuracy Trend */}
                    <Card className="p-5 space-y-4">
                      <div>
                        <h4 className="text-xs uppercase font-extrabold tracking-widest text-charcoal">Sate-Lock Accuracy</h4>
                        <p className="text-[10px] text-warmgray mt-0.5">Physical GPS verification validation rate vs flagged entries</p>
                      </div>
                      <div className="h-[220px] w-full font-mono text-[10px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(14,75,61,0.08)" />
                            <XAxis dataKey="name" stroke="#877e74" />
                            <YAxis stroke="#877e74" domain={[90, 100]} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#2A2723', border: 'none', borderRadius: '8px', color: '#FFFFFF' }}
                              labelStyle={{ fontWeight: 'bold', color: '#0E4B3D' }}
                            />
                            <Bar dataKey="accuracy" fill="#0E4B3D" radius={[4, 4, 0, 0]} maxBarSize={30} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                  </div>

                </div>

                {/* CONTEST STANDING ROW */}
                {isContestActive ? (
                  <Card className="p-6 border border-antiquegold/30 relative overflow-hidden shadow-md">
                    {/* Visual subtle crown background pattern watermark */}
                    <div className="absolute right-4 top-4 text-[70px] opacity-[0.03] select-none pointer-events-none font-serif">
                      👑
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-antiquegold/10 text-antiquegold flex items-center justify-center shrink-0 mt-0.5">
                        <Award className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div className="space-y-4 w-full">
                        <div>
                          <h4 className="font-serif text-lg font-black text-charcoal flex items-center gap-2 flex-wrap">
                            <span>{rt.activeContestHeader}</span>
                            <span className="text-[10px] bg-red-100 text-error font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0">
                              Live
                            </span>
                          </h4>
                          <p className="text-xs text-warmgray mt-0.5 leading-relaxed">
                            {rt.contestTimeLabel} <span className="font-semibold text-charcoal">July 1 – July 31, 2026</span> • <span className="font-semibold text-charcoal">Pune North Zone Division</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[rgba(184,135,61,0.1)] text-xs">
                          <div className="space-y-1">
                            <span className="font-mono font-bold uppercase text-[9px] tracking-wider text-antiquegold block">
                              {rt.rewardStakeLabel}
                            </span>
                            <p className="font-bold text-charcoal font-sans leading-relaxed">
                              ⚡ TVS iQube S Electric Scooter or cash buyout of ₹1,25,000 in direct bank clearance!
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="font-mono font-bold uppercase text-[9px] tracking-wider text-warmgray block">
                              {rt.contestRulesLabel}
                            </span>
                            <p className="text-warmgray leading-relaxed font-sans">
                              First field surveyor to capture 35 verified unique elevator shafts with zero flagged duplications by Wable Sir.
                            </p>
                          </div>
                        </div>

                        {/* Leaderboard Table */}
                        <div className="pt-4 space-y-2">
                          <span className="font-mono font-bold uppercase text-[9px] tracking-wider text-warmgray block">
                            Zone Leaderboard Standings
                          </span>

                          <div className="border border-[rgba(184,135,61,0.12)] rounded-xl overflow-hidden divide-y divide-[rgba(184,135,61,0.08)] bg-white">
                            {processedStandings.map((row) => {
                              return (
                                <div 
                                  key={row.rank}
                                  className={`flex items-center justify-between p-3 transition-all ${
                                    row.isUser 
                                      ? 'bg-antiquegold/10 font-bold border-l-4 border-l-antiquegold' 
                                      : 'hover:bg-alabaster/40'
                                  } ${row.rank <= 3 && !row.isUser ? 'bg-[#FDFCF9]/30' : ''}`}
                                >
                                  {/* Left side: Rank + Name */}
                                  <div className="flex items-center gap-3">
                                    <span className={`font-serif text-lg font-black w-6 text-center ${
                                      row.rank === 1 ? 'text-amber-500' :
                                      row.rank === 2 ? 'text-charcoal' :
                                      row.rank === 3 ? 'text-amber-700' : 'text-warmgray'
                                    }`}>
                                      {row.rank}
                                    </span>
                                    
                                    <div className="w-8 h-8 rounded-full bg-alabaster border border-[rgba(184,135,61,0.15)] flex items-center justify-center font-bold text-charcoal uppercase text-xs">
                                      {row.name.charAt(0)}
                                    </div>

                                    <div className="flex flex-col">
                                      <span className={`text-xs ${row.isUser ? 'text-charcoal font-extrabold' : 'text-charcoal'}`}>
                                        {row.name}
                                      </span>
                                      <span className="text-[9px] text-warmgray font-mono">{row.trend}</span>
                                    </div>
                                  </div>

                                  {/* Right side: Score */}
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm text-charcoal font-extrabold">
                                      {row.leads}
                                    </span>
                                    <span className="text-[10px] text-warmgray font-sans">leads</span>
                                    
                                    {row.rank === 1 && (
                                      <span className="text-sm shrink-0" title="Leading">👑</span>
                                    )}
                                    {row.isUser && (
                                      <span className="text-[8px] uppercase tracking-wider bg-antiquegold text-white px-1.5 py-0.5 rounded-md font-extrabold font-mono shrink-0 ml-1">
                                        You
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </div>
                  </Card>
                ) : (
                  /* NO ACTIVE CONTEST GRACEFUL STATE */
                  <Card className="p-6 border border-dashed border-[rgba(184,135,61,0.25)] relative overflow-hidden bg-white hoverEffect">
                    <div className="flex flex-col items-center text-center p-6 space-y-4 max-w-xl mx-auto">
                      <div className="w-14 h-14 rounded-full bg-alabaster border border-[rgba(184,135,61,0.15)] flex items-center justify-center text-antiquegold shrink-0">
                        <Calendar className="w-6 h-6 text-antiquegold" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-base font-extrabold text-charcoal">
                          No Contest Currently Active
                        </h4>
                        <p className="text-xs text-warmgray leading-relaxed max-w-md">
                          No competitions are active this week. Take this period to focus on absolute data quality and complete outstanding physical drafts. Your outstanding June run (Rank #2 in Maharashtra Region) remains the benchmark!
                        </p>
                      </div>

                      {/* Personal Best Stat Nodes */}
                      <div className="w-full pt-4 border-t border-[rgba(184,135,61,0.1)] grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2.5 bg-alabaster rounded-xl">
                          <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-warmgray block">Max Streak</span>
                          <span className="font-bold text-charcoal text-xs">14 Days</span>
                        </div>
                        <div className="p-2.5 bg-alabaster rounded-xl">
                          <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-warmgray block">Max Yield/Day</span>
                          <span className="font-bold text-charcoal text-xs">5 Leads</span>
                        </div>
                        <div className="p-2.5 bg-alabaster rounded-xl">
                          <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-warmgray block">Career Earnings</span>
                          <span className="font-mono font-bold text-charcoal text-xs">₹1.42L</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* BADGES GRID */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs uppercase font-extrabold tracking-widest text-charcoal">Verified Merit Badges</h4>
                    <p className="text-[10px] text-warmgray mt-0.5">{rt.unlockedBadgeText}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {badges.map((b) => {
                      const BIcon = b.icon;
                      return (
                        <div 
                          key={b.id}
                          onClick={() => setSelectedBadge(b)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none text-xs flex flex-col justify-between h-40 hover:scale-[1.02] hover:shadow-md ${
                            b.status === 'earned' 
                              ? 'bg-white border-[rgba(184,135,61,0.18)] hover:border-[rgba(184,135,61,0.35)]' 
                              : 'bg-alabaster/40 border-dashed border-border text-warmgray'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start">
                              <div className={`p-2 rounded-xl ${b.status === 'earned' ? 'bg-alabaster' : 'bg-white'} shrink-0`}>
                                <BIcon className={`w-5 h-5 ${b.status === 'earned' ? b.iconColor : 'text-warmgray/60'}`} />
                              </div>
                              
                              <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                b.status === 'earned' 
                                  ? 'bg-success/10 text-success' 
                                  : 'bg-amber-100 text-antiquegold'
                              }`}>
                                {b.status === 'earned' ? rt.statusEarned : rt.statusInProgress}
                              </span>
                            </div>

                            <h5 className="font-extrabold text-charcoal text-xs pt-1 line-clamp-1">{b.name}</h5>
                            <p className="text-warmgray text-[10px] leading-snug line-clamp-2">{b.desc}</p>
                          </div>

                          <div className="pt-2 border-t border-border/10 flex justify-between items-center text-[9px] font-mono text-warmgray">
                            <span>Code: {b.rulesetCode}</span>
                            {b.status === 'earned' && (
                              <span className="font-semibold text-charcoal">{b.earnedDate}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* NEXT MILESTONE ROAD - ASCENSION LINE */}
                <Card className="p-6 space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs uppercase font-extrabold tracking-widest text-charcoal">{rt.nextMilestoneTitle}</h4>
                      <p className="text-[10px] text-warmgray mt-0.5">{rt.nextMilestoneDesc}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-warmgray uppercase font-bold tracking-wider block">Current Volume</span>
                      <span className="font-serif text-lg font-black text-charcoal">28 / 50 Leads</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <AscensionLine 
                      orientation="vertical"
                      steps={milestoneSteps}
                    />
                  </div>
                </Card>

                {/* CENTRAL BADGE RULES SHEET SIDE-MODAL */}
                {selectedBadge && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <Card className="w-full max-w-md bg-white shadow-2xl relative border border-[rgba(184,135,61,0.25)] overflow-hidden">
                      
                      {/* Title Bar */}
                      <div className="p-5 border-b border-[rgba(184,135,61,0.12)] bg-[#F8F6F1] flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <selectedBadge.icon className={`w-5 h-5 ${selectedBadge.iconColor}`} />
                          <h4 className="font-serif text-base font-bold text-charcoal">
                            {selectedBadge.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => setSelectedBadge(null)}
                          className="p-1 text-warmgray hover:text-charcoal font-bold text-sm cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Rules Details */}
                      <div className="p-5 space-y-4 text-xs font-sans">
                        
                        {/* Badge Meta Tag Box */}
                        <div className="p-3.5 bg-alabaster rounded-xl border border-border space-y-2">
                          <div className="flex justify-between text-[8px] font-mono text-warmgray uppercase tracking-widest">
                            <span>{rt.rewardsBadgeSheetTitle}</span>
                            <span className="font-bold text-antiquegold">{selectedBadge.rulesetCode}</span>
                          </div>
                          
                          <div className="flex justify-between font-mono text-[10px] text-warmgray">
                            <span>{rt.rulesetVersion}</span>
                            <span className="font-bold text-charcoal">{selectedBadge.rulesetVersion}</span>
                          </div>

                          <div className="flex justify-between font-mono text-[10px] text-warmgray">
                            <span>{rt.earnedOn}</span>
                            <span className="font-bold text-charcoal">{selectedBadge.earnedDate}</span>
                          </div>
                        </div>

                        {/* Central Verification Text block */}
                        <div className="space-y-1.5">
                          <span className="font-mono font-bold uppercase text-[9px] tracking-wider text-warmgray block">
                            Verified Audit Criteria
                          </span>
                          <p className="text-xs text-charcoal leading-relaxed font-sans bg-alabaster/30 p-3 rounded-xl border border-border/20">
                            {selectedBadge.rulesetDetails}
                          </p>
                          <p className="text-[10px] text-success italic mt-1 leading-normal pl-1">
                            ✓ {rt.validatedBy} {rLang === 'mr' || rLang === 'hi' ? 'नियम इंजिनद्वारे.' : 'Rules Engine.'}
                          </p>
                        </div>

                        {/* Compatibility Notes */}
                        <div className="pt-3 border-t border-[rgba(184,135,61,0.1)] space-y-1 text-[10px]">
                          <span className="font-mono font-bold uppercase text-[9px] tracking-wider text-warmgray block">
                            Backwards Compatibility & Alignment
                          </span>
                          <p className="text-warmgray leading-relaxed">
                            {selectedBadge.compatibilityNote}
                          </p>
                          <p className="text-warmgray/80 text-[9px] pt-1">
                            {rt.backwardsCompatNote}
                          </p>
                        </div>

                        {/* Close action */}
                        <div className="pt-3 border-t border-[rgba(184,135,61,0.1)] flex justify-end">
                          <button
                            onClick={() => setSelectedBadge(null)}
                            className="px-5 py-2 bg-charcoal text-white rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-opacity-95 shadow-sm cursor-pointer transition-all active:scale-95"
                          >
                            Got It
                          </button>
                        </div>

                      </div>

                    </Card>
                  </div>
                )}

              </div>
            );
          })()}
        </>
      )}

      {/* ---------------------------------------------------------
          NEW LEAD CAPTURE — COMPREHENSIVE 4-STEP WIZARD
          --------------------------------------------------------- */}
      {showCaptureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
          <Card className="w-full max-w-2xl bg-white shadow-2xl relative animate-scaleUp my-8 overflow-hidden border border-[rgba(184,135,61,0.25)]">
            
            {/* Close button */}
            <button 
              type="button"
              onClick={() => {
                if (clientName || clientPhone || Object.keys(sitePhotos).length > 0) {
                  if (confirm("Close lead capture wizard? Unsaved changes will be stored as a local draft node.")) {
                    setShowCaptureModal(false);
                  }
                } else {
                  setShowCaptureModal(false);
                }
              }}
              className="absolute top-4 right-4 p-2 text-warmgray hover:text-charcoal bg-alabaster hover:bg-border/20 rounded-full font-bold cursor-pointer z-10"
            >
              ✕
            </button>

            {/* Stepper Header */}
            <div className="p-6 bg-[#F8F6F1] border-b border-[rgba(184,135,61,0.15)]">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold text-antiquegold tracking-widest block">
                    SURVEYOR SECURE CAPTURE PROTOCOL • STEP {captureStep} OF 5
                  </span>
                  <h3 className="font-serif text-xl font-black text-charcoal mt-1">
                    {captureStep === 1 && "Client & Contact Registry"}
                    {captureStep === 2 && "Building & Shaft Specs"}
                    {captureStep === 3 && "GPS Grounding Calibration"}
                    {captureStep === 4 && "Guided Site Photo Survey"}
                    {captureStep === 5 && "Lead Transmission Ledger"}
                  </h3>
                </div>
                
                {/* Visual Ascension Line Steps */}
                <div className="flex gap-1 items-center shrink-0">
                  {[1, 2, 3, 4, 5].map(idx => (
                    <div key={idx} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          // Allow jumping back to visited steps
                          if (idx < captureStep) {
                            setCaptureStep(idx);
                            saveLeadDraft({ captureStep: idx });
                          }
                        }}
                        disabled={idx > captureStep}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                          captureStep === idx 
                            ? 'bg-antiquegold text-white ring-4 ring-antiquegold/20' 
                            : captureStep > idx 
                              ? 'bg-royalemerald text-white cursor-pointer' 
                              : 'bg-white border border-border text-warmgray opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {captureStep > idx ? <Check className="w-3.5 h-3.5" /> : idx}
                      </button>
                      {idx < 5 && (
                        <div className={`w-3 sm:w-5 h-[2px] ${captureStep > idx ? 'bg-royalemerald' : 'bg-[#e5dfd4]'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress bar info */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[rgba(184,135,61,0.08)]">
                <div>
                  <div className="flex items-center justify-between text-[9px] text-warmgray font-mono font-bold uppercase">
                    <span>CURRENT LEAD FORM PROGRESS:</span>
                    <span className="font-bold text-antiquegold">{Math.round(((captureStep - 1) / 4) * 100)}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#e5dfd4] rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-antiquegold transition-all duration-300" style={{ width: `${Math.round(((captureStep - 1) / 4) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[9px] text-warmgray font-mono font-bold uppercase">
                    <span>TOTAL WEEKLY TARGET PROGRESS:</span>
                    <span className="font-bold text-royalemerald">{Math.min(100, Math.round((leads.length / 6) * 100))}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#e5dfd4] rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-royalemerald transition-all duration-300" style={{ width: `${Math.min(100, Math.round((leads.length / 6) * 100))}%` }} />
                  </div>
                  <div className="text-[8px] font-mono font-bold text-royalemerald text-right mt-0.5 uppercase tracking-wide">
                    {leads.length} of 6 Leads secured for Pune Region
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
              
              {/* ---------------------------------------------------------
                  STEP 1: BUILDER & OWNER DETAILS CAPTURE
                  --------------------------------------------------------- */}
              {captureStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  
                  {/* Resume Draft Banner */}
                  {hasDraftToResume && (
                    <div className="p-4 bg-antiquegold/10 border border-antiquegold/35 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <p className="font-serif text-sm font-bold text-charcoal flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-antiquegold" />
                          <span>Unsaved Lead Draft Preserved</span>
                        </p>
                        <p className="text-[11px] text-warmgray">We recovered a partial survey session in this browser cache.</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                           type="button"
                           onClick={handleResumeDraft}
                           className="flex-1 sm:flex-none px-3 py-1.5 bg-antiquegold text-white text-[11px] font-bold rounded-lg hover:bg-opacity-95 cursor-pointer transition-all active:scale-95"
                        >
                          Resume Draft
                        </button>
                        <button
                           type="button"
                           onClick={handleClearDraft}
                           className="flex-1 sm:flex-none px-3 py-1.5 bg-alabaster border border-border text-warmgray text-[11px] font-bold rounded-lg hover:text-charcoal cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Premium Business Card OCR Hub */}
                  <div className="p-5 bg-gradient-to-br from-[#FDFCF7] to-alabaster border border-antiquegold/25 rounded-2xl relative overflow-hidden shadow-sm">
                    {/* Gold line accent (Ascension motif) */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-antiquegold" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-bold text-charcoal flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-antiquegold animate-pulse" />
                          <span>Instant AI Business Card Scan</span>
                        </h4>
                        <p className="text-[11px] text-warmgray">
                          Upload or snap a business card photo to auto-populate all field details with server-side Gemini intelligence.
                        </p>
                      </div>
                      
                      <div className="relative shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBusinessCardScan}
                          className="hidden"
                          id="business-card-upload-input"
                          disabled={cardOcrLoading}
                        />
                        <label
                          htmlFor="business-card-upload-input"
                          className={`px-4 py-2 bg-charcoal text-white hover:bg-charcoal/90 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer inline-flex items-center gap-2 border border-antiquegold/30 shadow-md transition-all active:scale-95 ${cardOcrLoading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <CreditCard className="w-3.5 h-3.5 text-antiquegold" />
                          <span>{cardOcrLoading ? 'Scanning Card...' : 'Scan Business Card'}</span>
                        </label>
                      </div>
                    </div>

                    {/* Laser Scan Animation Overlay */}
                    {cardOcrLoading && (
                      <div className="absolute inset-0 bg-charcoal/90 flex flex-col items-center justify-center text-white z-20 transition-all">
                        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                          {/* Moving Gold Laser Line */}
                          <div className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-antiquegold to-transparent top-0 animate-bounce shadow-[0_0_15px_#B8873D]" style={{ animationDuration: '2.5s' }} />
                          
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-antiquegold border-t-transparent rounded-full animate-spin" />
                            <p className="font-mono text-xs tracking-wider text-[#E6DFD4]">
                              RUNNING SECURE GEMINI 2.5 OCR EXTRACTION...
                            </p>
                          </div>
                          <p className="text-[10px] text-warmgray mt-2 font-serif italic text-center max-w-xs">
                            Analyzing text density, layout coordinates, and contact titles on-device.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Owner Builder Name */}
                    <div>
                      <label className="text-xs font-extrabold text-charcoal mb-1.5 flex justify-between items-center">
                        <span>Owner / Builder Full Name <span className="text-error">*</span></span>
                        {clientName.trim().length >= 3 && (
                          <span className="text-success text-[10px] font-mono font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Valid
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => {
                          setClientName(e.target.value);
                          saveLeadDraft({ clientName: e.target.value });
                        }}
                        placeholder="e.g. Abhay Mahajan"
                        className="w-full px-4 py-2.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                      />
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="text-xs font-extrabold text-charcoal mb-1.5 flex justify-between items-center">
                        <span>Company / Builder Enterprise Name <span className="text-warmgray font-normal">(Optional)</span></span>
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          saveLeadDraft({ companyName: e.target.value });
                        }}
                        placeholder="e.g. Mahajan Infra Projects"
                        className="w-full px-4 py-2.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                      />
                    </div>

                    {/* Contact Phone Number */}
                    <div>
                      <label className="text-xs font-extrabold text-charcoal mb-1.5 flex justify-between items-center">
                        <span>Primary Contact Phone {!noDirectContact && <span className="text-error">*</span>}</span>
                        {!noDirectContact && ( /^[6-9]\d{9}$/.test(clientPhone.trim()) || clientPhone.replace(/\s+/g, '').length >= 10 ) && (
                          <span className="text-success text-[10px] font-mono font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Valid India Number
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required={!noDirectContact}
                        disabled={noDirectContact}
                        value={noDirectContact ? '' : clientPhone}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClientPhone(val);
                          checkDuplicatePhone(val);
                          saveLeadDraft({ clientPhone: val });
                        }}
                        placeholder={noDirectContact ? 'Declined Phone Number' : 'e.g. 9823055667'}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold ${noDirectContact ? 'bg-warmgray/10 border-dashed border-gray-300 opacity-60 cursor-not-allowed' : 'bg-alabaster border-[rgba(184,135,61,0.15)]'}`}
                      />
                    </div>

                    {/* Role Selection Dropdown */}
                    <div>
                      <label className="text-xs font-extrabold text-charcoal mb-1.5 flex justify-between items-center">
                        <span>Contact Role / Designation <span className="text-error">*</span></span>
                        {contactRole && (
                          <span className="text-success text-[10px] font-mono font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Configured
                          </span>
                        )}
                      </label>
                      <select
                        required
                        value={contactRole}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setContactRole(val);
                          saveLeadDraft({ contactRole: val });
                        }}
                        className="w-full px-4 py-2.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                      >
                        <option value="">-- Choose Designation --</option>
                        <option value="owner">Society Owner / Proprietor</option>
                        <option value="contractor">Civil Contractor / Builder</option>
                        <option value="architect">Project Architect / Designer</option>
                        <option value="facility_manager">Society Chairman / Facility Manager</option>
                      </select>
                    </div>

                    {/* Real-time deduplication warning block */}
                    {duplicatePhoneDetected && !noDirectContact && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 animate-fadeIn sm:col-span-2">
                        <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold font-serif">⚠️ Repeat Client Phone Detected</p>
                          <p className="text-[11px] leading-relaxed text-amber-700/90">
                            This number is already registered under: <span className="font-bold underline">{duplicatePhoneOwner}</span>. Continuing will record this as a duplicate contact and flag the pipeline.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Optional contact decline flag */}
                    <div className="flex items-start gap-2.5 sm:col-span-2 mt-1">
                      <input
                        type="checkbox"
                        id="noDirectContact"
                        checked={noDirectContact}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setNoDirectContact(val);
                          if (val) {
                            setClientPhone('');
                            setDuplicatePhoneDetected(false);
                            setDuplicatePhoneOwner('');
                          }
                          saveLeadDraft({ noDirectContact: val, clientPhone: val ? '' : clientPhone });
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-antiquegold focus:ring-antiquegold mt-0.5 cursor-pointer"
                      />
                      <label htmlFor="noDirectContact" className="text-xs text-warmgray select-none cursor-pointer">
                        Contact declines to provide immediate phone details (In-Person site visits & local correspondence only)
                      </label>
                    </div>
                  </div>



                  {/* Survey Context / Relationship Note */}
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1.5">Surveyor Context / Relationship Notes</label>
                    <textarea
                      value={relationshipNote}
                      onChange={(e) => {
                        setRelationshipNote(e.target.value);
                        saveLeadDraft({ relationshipNote: e.target.value });
                      }}
                      placeholder="e.g. Met at site office, has ongoing high-rise commercial structures in Pune North. Prefers traction lift."
                      className="w-full px-4 py-2.5 h-16 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold resize-none text-xs"
                    />
                    <p className="text-[10px] text-warmgray mt-1">This context note will be forwarded directly to the Pune Regional CRM Pipeline.</p>
                  </div>

                  {/* Nearest Landmark Note */}
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1.5 font-serif font-black uppercase text-charcoal">Nearest Landmark Note</label>
                    <textarea
                      value={landmarkNote}
                      onChange={(e) => {
                        setLandmarkNote(e.target.value);
                        saveLeadDraft({ landmarkNote: e.target.value });
                      }}
                      placeholder="e.g. Behind Balaji Mandir, opposite Pune Metro Pillar 124, Kothrud"
                      className="w-full px-4 py-2.5 h-16 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold resize-none text-xs"
                    />
                    <p className="text-[10px] text-warmgray mt-1">This landmark string is crucial for offline technical engineers dispatch mapping.</p>
                  </div>

                  {/* Mandatory Communication Compliance Consent Block */}
                  <div className="p-4 bg-gradient-to-r from-alabaster to-transparent border border-[rgba(184,135,61,0.15)] rounded-2xl space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="contactConsentFlag"
                        checked={contactConsentFlag}
                        onChange={(e) => {
                          setContactConsentFlag(e.target.checked);
                          saveLeadDraft({ contactConsentFlag: e.target.checked });
                        }}
                        className="w-4.5 h-4.5 rounded border-gray-300 text-antiquegold focus:ring-antiquegold mt-0.5 cursor-pointer"
                      />
                      <label htmlFor="contactConsentFlag" className="text-[11px] font-bold text-charcoal leading-relaxed cursor-pointer select-none">
                        I confirm that the builder/owner has given explicit communication consent to be contacted regarding All India Elevators technical proposals, product updates, and scheduling. <span className="text-error">*</span>
                      </label>
                    </div>
                    {!contactConsentFlag && (
                      <div className="p-2.5 bg-error/5 border border-error/20 rounded-xl text-[10px] text-error flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>CRM COMPLIANCE REQUIREMENT: Lead node cannot advance to the CRM pipeline without explicit client communication consent.</span>
                      </div>
                    )}
                  </div>

                  {/* Action row step 1 */}
                  <div className="pt-4 border-t border-[rgba(184,135,61,0.1)] flex justify-end">
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => {
                        setCaptureStep(2);
                        saveLeadDraft({ captureStep: 2 });
                      }}
                      disabled={clientName.trim().length < 3 || (!noDirectContact && clientPhone.trim().length < 10) || !contactRole || !contactConsentFlag}
                      className="px-6 py-3 font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <span>Configure Shaft Specs</span>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </Button>
                  </div>

                </div>
              )}

              {/* ---------------------------------------------------------
                  STEP 2: BUILDING SPECIFICATIONS & SHAFT SELECTION
                  --------------------------------------------------------- */}
              {captureStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Step 2 Intro */}
                  <div className="p-4 bg-white border border-[rgba(184,135,61,0.15)] rounded-2xl space-y-1">
                    <span className="text-[9px] font-mono uppercase text-antiquegold font-extrabold tracking-widest block">Core Specifications Node</span>
                    <p className="font-serif text-sm font-bold text-charcoal">Building Specifications & Lift Shaft Sizing</p>
                    <p className="text-[11px] text-warmgray leading-relaxed">
                      Please record exact heights, usage parameters, and physical shaft bounds. These details feed directly into the Auto-Quotation Engine and surveyor lead commissions.
                    </p>
                  </div>

                  {/* Section 1: Height & Usage Classification */}
                  <div className="bg-alabaster/40 p-4 rounded-2xl border border-[rgba(184,135,61,0.08)] space-y-3.5">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-charcoal font-serif">1. Building Sizing & Property Usage</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Floors count */}
                      <div>
                        <label className="block text-xs font-bold text-charcoal mb-1.5 flex justify-between items-center">
                          <span>Total Shaft Floors *</span>
                          <span className="text-[10px] font-mono text-warmgray">Range: 2 - 35 Floors</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="2"
                          max="35"
                          value={floors}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 2;
                            setFloors(val);
                            saveLeadDraft({ floors: val });
                          }}
                          className="w-full px-4 py-2.5 bg-white rounded-xl border border-[rgba(184,135,61,0.15)] text-sm text-charcoal font-mono font-bold focus:outline-none focus:ring-1 focus:ring-antiquegold"
                        />
                      </div>

                      {/* Property Type Classification */}
                      <div>
                        <label className="block text-xs font-bold text-charcoal mb-1.5">Property Usage Base *</label>
                        <select
                          value={propertyType}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setPropertyType(val);
                            saveLeadDraft({ propertyType: val });
                          }}
                          className="w-full px-4 py-2.5 bg-white rounded-xl border border-[rgba(184,135,61,0.15)] text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                        >
                          <option value="residential">Residential High-Rise</option>
                          <option value="commercial">Commercial Office Complex</option>
                          <option value="institutional">Institutional / Hospital</option>
                        </select>
                      </div>
                    </div>

                    {/* Unusually Tall Building Warning (>20 floors) */}
                    {floors >= 20 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-2.5 text-xs animate-fadeIn">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold font-serif">⚠️ High-Rise Special Project Category</p>
                          <p className="text-[10px] text-amber-700/90 leading-relaxed">
                            This building height ({floors} floors) exceeds 20 levels. Due to high aerodynamic hoistway forces and premium speed profiles, this lead will bypass the automated pricing engine and route directly to Mr. Prashant Wable's engineering review desk for custom structural analysis.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mixed-Use Toggle & Custom description */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isMixedUseCheckbox"
                          checked={isMixedUse}
                          onChange={(e) => {
                            setIsMixedUse(e.target.checked);
                            saveLeadDraft({ isMixedUse: e.target.checked });
                          }}
                          className="w-4 h-4 rounded text-antiquegold focus:ring-antiquegold cursor-pointer"
                        />
                        <label htmlFor="isMixedUseCheckbox" className="text-xs font-bold text-charcoal select-none cursor-pointer">
                          This is a Mixed-Use Building (Multiple structure classifications)
                        </label>
                      </div>

                      {isMixedUse && (
                        <div className="mt-2.5 animate-fadeIn">
                          <label className="block text-[11px] font-bold text-warmgray mb-1">Specify Mixed-Use Category Details *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ground Floor retail, upper 4 floors residential apartments"
                            value={mixedCategoryDetail}
                            onChange={(e) => {
                              setMixedCategoryDetail(e.target.value);
                              saveLeadDraft({ mixedCategoryDetail: e.target.value });
                            }}
                            className="w-full px-3.5 py-2 bg-white rounded-xl border border-[rgba(184,135,61,0.15)] text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 2: Construction Stage Selector */}
                  <div className="bg-alabaster/40 p-4 rounded-2xl border border-[rgba(184,135,61,0.08)] space-y-3">
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-charcoal font-serif">2. physical Construction Stage *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'foundation', label: 'Foundation Stage', desc: 'Shaft inaccessible' },
                        { id: 'structure-up', label: 'Structure-Up', desc: 'Slabs & columns cast' },
                        { id: 'finishing', label: 'Finishing Phase', desc: 'Plaster & brickwork' },
                        { id: 'ready', label: 'Ready / Fit-out', desc: 'SOP physical layout' }
                      ].map(stage => (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => {
                            setConstructionStage(stage.id as any);
                            saveLeadDraft({ constructionStage: stage.id as any });
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            constructionStage === stage.id
                              ? 'bg-royalemerald border-royalemerald text-white shadow-md'
                              : 'bg-white border-[rgba(184,135,61,0.15)] text-charcoal hover:bg-alabaster'
                          }`}
                        >
                          <span className="text-xs font-bold">{stage.label}</span>
                          <span className={`text-[10px] mt-1 block ${constructionStage === stage.id ? 'text-white/80' : 'text-warmgray'}`}>
                            {stage.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Shaft Access & Sizing */}
                  <div className="bg-alabaster/40 p-4 rounded-2xl border border-[rgba(184,135,61,0.08)] space-y-3.5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-charcoal font-serif">3. Shaft Geometrical Bounds</h4>
                      
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="isShaftInaccessibleCheckbox"
                          checked={isShaftInaccessible}
                          onChange={(e) => {
                            setIsShaftInaccessible(e.target.checked);
                            saveLeadDraft({ isShaftInaccessible: e.target.checked });
                          }}
                          className="w-4 h-4 rounded text-antiquegold focus:ring-antiquegold cursor-pointer"
                        />
                        <label htmlFor="isShaftInaccessibleCheckbox" className="text-[11px] text-[#EF4444] font-extrabold select-none cursor-pointer">
                          Shaft is Inaccessible
                        </label>
                      </div>
                    </div>

                    {isShaftInaccessible ? (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-2 text-xs animate-fadeIn">
                        <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold font-serif">⚠️ Shaft marked as Inaccessible/Unavailable</p>
                          <p className="text-[10px] text-amber-700/90 leading-relaxed mt-0.5">
                            Allowed for early-stage pipeline routing. CRM follow-up cadence will be automatically delayed for 30 days. No manual dimensions required.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3.5 animate-fadeIn">
                        <div>
                          <label className="block text-[11px] font-bold text-charcoal mb-1">Estimated Shaft Width (mm) *</label>
                          <input
                            type="number"
                            value={shaftWidthEstimate}
                            onChange={(e) => {
                              setShaftWidthEstimate(e.target.value);
                              saveLeadDraft({ shaftWidthEstimate: e.target.value });
                            }}
                            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[rgba(184,135,61,0.15)] text-xs text-charcoal font-mono font-bold"
                            placeholder="e.g. 1500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-charcoal mb-1">Estimated Shaft Depth (mm) *</label>
                          <input
                            type="number"
                            value={shaftDepthEstimate}
                            onChange={(e) => {
                              setShaftDepthEstimate(e.target.value);
                              saveLeadDraft({ shaftDepthEstimate: e.target.value });
                            }}
                            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[rgba(184,135,61,0.15)] text-xs text-charcoal font-mono font-bold"
                            placeholder="e.g. 1500"
                          />
                        </div>
                        <p className="col-span-2 text-[10px] text-warmgray font-mono">
                          Dimensions are strictly estimates. Physical millimetric structural drawings will be certified by the engineering civil team prior to manufacturing.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Section 4: smart Passenger Capacity Estimator (Helper) */}
                  <div className="bg-alabaster/40 p-4 rounded-2xl border border-[rgba(184,135,61,0.08)] space-y-3">
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-charcoal font-serif">4. Smart Passenger Load Estimate *</label>
                    <div className="bg-white p-3.5 rounded-xl border border-[rgba(184,135,61,0.15)] flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-antiquegold block">SUGGESTED CAPACITY</span>
                        <span className="text-sm font-serif font-black text-charcoal">{passengerCapacityEstimate} Passengers</span>
                        <span className="text-[9px] text-warmgray block mt-0.5">Based on Annexure-III Pune Municipal Code guidelines</span>
                      </div>

                      {/* Overrider buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const val = Math.max(2, passengerCapacityEstimate - 1);
                            setPassengerCapacityEstimate(val);
                            saveLeadDraft({ passengerCapacityEstimate: val });
                          }}
                          className="w-8 h-8 rounded-lg bg-alabaster border flex items-center justify-center font-bold text-charcoal hover:bg-border/20 cursor-pointer text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-charcoal text-sm">{passengerCapacityEstimate}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const val = Math.min(26, passengerCapacityEstimate + 1);
                            setPassengerCapacityEstimate(val);
                            saveLeadDraft({ passengerCapacityEstimate: val });
                          }}
                          className="w-8 h-8 rounded-lg bg-alabaster border flex items-center justify-center font-bold text-charcoal hover:bg-border/20 cursor-pointer text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Shaft Drawing Sketchpad */}
                  <div className="bg-alabaster/40 p-4 rounded-2xl border border-[rgba(184,135,61,0.08)] space-y-2">
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-charcoal font-serif">5. Shaft blueprint sketch / photo annotation</label>
                    <p className="text-[10px] text-warmgray">
                      Draw on the grid blueprint to flag elevator pocket positions, bracket beams, or physical pit defects.
                    </p>
                    <ShaftSketchpad
                      value={shaftSketchDataUrl}
                      onChange={(val) => {
                        setShaftSketchDataUrl(val);
                        saveLeadDraft({ shaftSketchDataUrl: val });
                      }}
                    />
                  </div>

                  {/* Section 6: Special Structural Notes */}
                  <div className="bg-alabaster/40 p-4 rounded-2xl border border-[rgba(184,135,61,0.08)] space-y-2">
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-charcoal font-serif">6. Special Structural / Site Notes</label>
                    <textarea
                      value={specialNotes}
                      onChange={(e) => {
                        setSpecialNotes(e.target.value);
                        saveLeadDraft({ specialNotes: e.target.value });
                      }}
                      placeholder="e.g. Columns are out of plumb, wall has slight dampness, pocket beams cast at 2200mm intervals."
                      className="w-full px-4 py-2.5 h-16 bg-white rounded-xl border border-[rgba(184,135,61,0.15)] text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold resize-none text-xs"
                    />
                  </div>

                  {/* Step 2 Bottom Navigation buttons */}
                  <div className="pt-4 border-t border-[rgba(184,135,61,0.1)] flex justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureStep(1);
                        saveLeadDraft({ captureStep: 1 });
                      }}
                      className="px-5 py-3 bg-white border border-border hover:bg-alabaster rounded-xl text-xs text-charcoal font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <span>Back</span>
                    </button>
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => {
                        setCaptureStep(3);
                        saveLeadDraft({ captureStep: 3 });
                      }}
                      disabled={(isMixedUse && !mixedCategoryDetail.trim()) || (!isShaftInaccessible && (!shaftWidthEstimate.trim() || !shaftDepthEstimate.trim()))}
                      className="px-6 py-3 font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <span>Lock & Geotag Location</span>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------------
                  STEP 3: GPS LOCK & MAP GROUNDING
                  --------------------------------------------------------- */}
              {captureStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Calibration Center Intro */}
                  <div className="p-4 bg-white border border-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-antiquegold block">CALIBRATION NODE STATUS</span>
                      <p className="font-serif text-sm font-bold text-charcoal">
                        {gpsLoading ? "Synchronizing Satellite Uplink..." : capturedCoords ? "GPS Verified Location Anchored" : "Awaiting Geolocation Verifier"}
                      </p>
                      <p className="text-[11px] text-warmgray">Pune core high-rises often degrade signal reliability. Please anchor live or calibrate below.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={triggerGpsLock}
                      disabled={gpsLoading}
                      className="px-4 py-2 bg-charcoal text-white hover:bg-antiquegold disabled:bg-warmgray/50 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-antiquegold ${gpsLoading ? 'animate-spin' : ''}`} />
                      <span>{gpsLoading ? "Pinning GPS..." : "Trigger Live GPS"}</span>
                    </button>
                  </div>

                  {/* Simulated Signal Degrader (Urban Canyon Interference Simulator) */}
                  <div className="p-4 bg-[#F8F6F1] rounded-2xl border border-[rgba(184,135,61,0.2)] space-y-2.5">
                    <span className="text-[9px] font-mono uppercase text-warmgray block tracking-widest font-extrabold">Pune Concrete Urban Canyon Simulator</span>
                    <p className="text-[11px] text-charcoal">Select simulated environmental signal interference to test anti-fraud and calibration logic:</p>
                    <div className="grid grid-cols-2 gap-2.5 bg-[#e5dfd4]/40 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setGpsAccuracy(3.4);
                          setCapturedCoords({ latitude: 18.5204, longitude: 73.8567 });
                          setAddress("Kothrud Pune, Maharashtra 411038");
                          setManualGpsAdjusted(false);
                          saveLeadDraft({ 
                            gpsAccuracy: 3.4, 
                            capturedCoords: { latitude: 18.5204, longitude: 73.8567 },
                            address: "Kothrud Pune, Maharashtra 411038",
                            manualGpsAdjusted: false
                          });
                        }}
                        className={`py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                          gpsAccuracy <= 10 && !manualGpsAdjusted ? 'bg-royalemerald text-white shadow-xs' : 'bg-transparent text-warmgray hover:text-charcoal'
                        }`}
                      >
                        <Wifi className="w-3.5 h-3.5" />
                        <span>High Accuracy (3.4m)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGpsAccuracy(18.5);
                          setCapturedCoords({ latitude: 18.5245, longitude: 73.8612 });
                          setAddress("Urban Canyon Degraded Coordinates (Pune Central Grid)");
                          setManualGpsAdjusted(false);
                          saveLeadDraft({ 
                            gpsAccuracy: 18.5, 
                            capturedCoords: { latitude: 18.5245, longitude: 73.8612 },
                            address: "Urban Canyon Degraded Coordinates (Pune Central Grid)",
                            manualGpsAdjusted: false
                          });
                        }}
                        className={`py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                          gpsAccuracy > 10 && !manualGpsAdjusted ? 'bg-error text-white shadow-xs' : 'bg-transparent text-warmgray hover:text-charcoal'
                        }`}
                      >
                        <WifiOff className="w-3.5 h-3.5" />
                        <span>Poor Signal (18.5m)</span>
                      </button>
                    </div>
                  </div>

                  {/* Accuracy warning message */}
                  {gpsAccuracy > 10 && !manualGpsAdjusted && !poorAccuracyWarningDismissed && (
                    <div className="p-4 bg-error/10 border border-error/25 text-error rounded-2xl space-y-2">
                      <div className="flex items-start gap-2 text-xs font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-error animate-pulse" />
                        <span>High Uncertainty Warning (Accuracy: ±{gpsAccuracy}m)</span>
                      </div>
                      <p className="text-[11px] text-error/90 leading-relaxed font-sans">
                        Signal blocked by surrounding high-rises or elevator concrete slabs. Commission approval requires precise tracking. <strong>Tap anywhere on the interactive Pune Blueprint Map below to manually drop a calibrated pin</strong>, or click "Force Acknowledge" below if physical presence is verified.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPoorAccuracyWarningDismissed(true)}
                          className="px-3 py-1 bg-error/15 hover:bg-error/25 border border-error/30 text-[10px] font-bold uppercase rounded-lg text-error"
                        >
                          Acknowledge Accuracy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ADDRESS VERIFICATION TEXT FIELD */}
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1.5">Geotagged Stamp Address</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        saveLeadDraft({ address: e.target.value });
                      }}
                      className="w-full px-4 py-2.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold font-mono"
                    />
                  </div>

                  {/* PUNE BLUEPRINT INTERACTIVE GRID MAP */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-charcoal">Interactive Pune Blueprint Map Calibration</label>
                    <div 
                      onClick={handleMapClick}
                      className="h-44 w-full bg-charcoal rounded-2xl relative border border-border/20 overflow-hidden cursor-crosshair group flex items-center justify-center text-center p-4 select-none"
                      style={{
                        backgroundImage: 'radial-gradient(rgba(184, 135, 61, 0.15) 1px, transparent 1px)',
                        backgroundSize: '16px 16px'
                      }}
                    >
                      {/* Grid lines */}
                      <div className="absolute inset-0 border border-antiquegold/10 pointer-events-none" />
                      <div className="absolute h-[1px] w-full bg-antiquegold/10 top-1/2 pointer-events-none" />
                      <div className="absolute w-[1px] h-full bg-antiquegold/10 left-1/2 pointer-events-none" />
                      
                      {/* Region labels */}
                      <span className="absolute bottom-2 left-3 font-mono text-[8px] text-white/40 uppercase tracking-widest pointer-events-none">PUNE CITY SECTOR MATRIX</span>
                      <span className="absolute top-2 right-3 font-mono text-[8px] text-antiquegold font-bold uppercase tracking-widest pointer-events-none">
                        {manualGpsAdjusted ? "📍 PIN CALIBRATED" : "📶 LIVE RECEIVER FEED"}
                      </span>

                      {capturedCoords ? (
                        <div 
                          className="absolute transition-all duration-300"
                          style={{
                            left: `${((capturedCoords.longitude - 73.8567) / 0.03 + 0.5) * 100}%`,
                            top: `${(0.5 - (capturedCoords.latitude - 18.5204) / 0.03) * 100}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          {/* Pulsating validation waves */}
                          <div className={`absolute rounded-full border -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 animate-ping ${
                            gpsAccuracy <= 10 ? 'border-success bg-success/5 w-16 h-16' : 'border-error bg-error/5 w-32 h-32'
                          }`} />
                          <div className={`absolute rounded-full border -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 ${
                            gpsAccuracy <= 10 ? 'border-success bg-success/10 w-8 h-8' : 'border-error bg-error/10 w-24 h-24'
                          }`} />
                          
                          <MapPin className="w-7 h-7 text-antiquegold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] -translate-y-3 shrink-0" />
                        </div>
                      ) : (
                        <div className="space-y-1 text-[#E6DFD4] max-w-xs pointer-events-none">
                          <Compass className="w-7 h-7 text-antiquegold mx-auto animate-spin" />
                          <p className="text-xs font-serif italic">Locking signal... or tap anywhere to drop manual calibrated verification pin</p>
                        </div>
                      )}
                    </div>
                    
                    {capturedCoords && (
                      <div className="flex justify-between items-center text-[10px] text-warmgray font-mono font-bold uppercase bg-alabaster p-2 rounded-xl">
                        <span>Lat: {capturedCoords.latitude.toFixed(6)}° N • Lng: {capturedCoords.longitude.toFixed(6)}° E</span>
                        <span className={gpsAccuracy <= 10 ? 'text-success' : 'text-error animate-pulse'}>
                          ACCURACY: ±{gpsAccuracy.toFixed(1)}m {manualGpsAdjusted && "• CALIBRATED"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Navigation row step 3 */}
                  <div className="pt-4 border-t border-[rgba(184,135,61,0.1)] flex justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureStep(2);
                        saveLeadDraft({ captureStep: 2 });
                      }}
                      className="px-5 py-3 bg-white border border-border hover:bg-alabaster rounded-xl text-xs text-charcoal font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <span>Back</span>
                    </button>
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => {
                        setCaptureStep(4);
                        saveLeadDraft({ captureStep: 4 });
                      }}
                      disabled={!capturedCoords}
                      className="px-6 py-3 font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <span>Go to Photo Checklist</span>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </Button>
                  </div>

                </div>
              )}

              {/* ---------------------------------------------------------
                  STEP 4: MULTI-PHOTO CAPTURE PROMPTS
                  --------------------------------------------------------- */}
              {captureStep === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Photo Checklist Progress */}
                  <div className="p-4 bg-[#F8F6F1] rounded-2xl border border-[rgba(184,135,61,0.25)] flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono uppercase text-antiquegold font-extrabold tracking-widest block">SECURE MEDIA VAULT</span>
                      <p className="font-serif text-sm font-bold text-charcoal">Anti-Fraud Field Survey Media Checklist</p>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-charcoal font-bold bg-white px-3 py-1 rounded-lg border">
                      <span>MEDIA:</span>
                      <span className="text-royalemerald">
                        {Object.keys(sitePhotos).length} / 3 CAPTURED
                      </span>
                    </div>
                  </div>

                  {/* Security options panel */}
                  <div className="p-3.5 bg-alabaster border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <ShieldCheck className="w-4 h-4 text-royalemerald" />
                      <span className="font-extrabold text-charcoal uppercase tracking-wider">Anti-Fraud Protection:</span>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer font-sans select-none">
                      <input
                        type="checkbox"
                        checked={blockGalleryUploads}
                        onChange={(e) => setBlockGalleryUploads(e.target.checked)}
                        className="w-4 h-4 accent-antiquegold rounded cursor-pointer"
                      />
                      <span className="text-charcoal font-semibold">Strictly Enforce Live Camera Shutter</span>
                    </label>
                  </div>

                  {/* The 3 Guided Prompts */}
                  <div className="space-y-3.5">
                    
                    {/* Prompt 1: Building Exterior Front View */}
                    <div className={`p-4 bg-white border rounded-2xl transition-all ${
                      sitePhotos.front ? 'border-royalemerald/35 bg-royalemerald/5' : 'border-border hover:border-antiquegold/35'
                    }`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase font-black text-antiquegold tracking-widest">PROMPT 1 OF 3 • REQUIRED</span>
                          <h4 className="font-serif text-sm font-bold text-charcoal">Exterior Building Structure (Front Facade)</h4>
                          <p className="text-xs text-warmgray">Capture the complete front profile of the physical building from the road level.</p>
                        </div>
                        {sitePhotos.front && (
                          <span className="text-[10px] font-mono font-bold bg-royalemerald/20 text-royalemerald px-2 py-0.5 rounded uppercase tracking-wider shrink-0 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Captured
                          </span>
                        )}
                      </div>

                      {sitePhotos.front ? (
                        <div className="mt-3.5 flex gap-4 items-center">
                          <img src={sitePhotos.front.dataUrl} className="w-32 h-20 object-cover rounded-xl border border-border" alt="Front view watermark draft" />
                          <div className="space-y-1 text-[10px] font-mono text-warmgray">
                            <p className="text-charcoal font-bold flex items-center gap-1">
                              {sitePhotos.front.isLive ? <span className="text-success">🟢 Secure Live Shutter</span> : <span className="text-error">⚠️ Imported Non-Live File</span>}
                            </p>
                            <p className="truncate max-w-[180px]">Stamp: {sitePhotos.front.timestamp}</p>
                            <p className="truncate max-w-[180px]">Coords: {sitePhotos.front.geotag}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setSitePhotos(prev => {
                                  const next = { ...prev };
                                  delete next.front;
                                  saveLeadDraft({ sitePhotos: next });
                                  return next;
                                });
                              }}
                              className="text-error font-bold flex items-center gap-1 pt-1 text-[11px] hover:underline"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Recapture Photo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePhotoPrompt('front');
                              setPhotoSourceMode('live');
                            }}
                            className="flex-1 py-2 bg-charcoal text-white hover:bg-antiquegold text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Live Shutter</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePhotoPrompt('front');
                              setPhotoSourceMode('gallery');
                            }}
                            className="flex-1 py-2 bg-alabaster hover:bg-[#e5dfd4] border border-border text-charcoal text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Upload className="w-3.5 h-3.5 text-antiquegold" />
                            <span>Upload File</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Prompt 2: Elevator Shaft Entrance */}
                    <div className={`p-4 bg-white border rounded-2xl transition-all ${
                      sitePhotos.entrance ? 'border-royalemerald/35 bg-royalemerald/5' : 'border-border hover:border-antiquegold/35'
                    }`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase font-black text-antiquegold tracking-widest">PROMPT 2 OF 3 • REQUIRED</span>
                          <h4 className="font-serif text-sm font-bold text-charcoal">Main Lobby Shaft Concrete Entrance</h4>
                          <p className="text-xs text-warmgray">Capture the raw masonry core landing opening on the ground level where lift car mounts.</p>
                        </div>
                        {sitePhotos.entrance && (
                          <span className="text-[10px] font-mono font-bold bg-royalemerald/20 text-royalemerald px-2 py-0.5 rounded uppercase tracking-wider shrink-0 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Captured
                          </span>
                        )}
                      </div>

                      {sitePhotos.entrance ? (
                        <div className="mt-3.5 flex gap-4 items-center">
                          <img src={sitePhotos.entrance.dataUrl} className="w-32 h-20 object-cover rounded-xl border border-border" alt="Entrance watermarked draft" />
                          <div className="space-y-1 text-[10px] font-mono text-warmgray">
                            <p className="text-charcoal font-bold flex items-center gap-1">
                              {sitePhotos.entrance.isLive ? <span className="text-success">🟢 Secure Live Shutter</span> : <span className="text-error">⚠️ Imported Non-Live File</span>}
                            </p>
                            <p className="truncate max-w-[180px]">Stamp: {sitePhotos.entrance.timestamp}</p>
                            <p className="truncate max-w-[180px]">Coords: {sitePhotos.entrance.geotag}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setSitePhotos(prev => {
                                  const next = { ...prev };
                                  delete next.entrance;
                                  saveLeadDraft({ sitePhotos: next });
                                  return next;
                                });
                              }}
                              className="text-error font-bold flex items-center gap-1 pt-1 text-[11px] hover:underline"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Recapture Photo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePhotoPrompt('entrance');
                              setPhotoSourceMode('live');
                            }}
                            className="flex-1 py-2 bg-charcoal text-white hover:bg-antiquegold text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Live Shutter</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePhotoPrompt('entrance');
                              setPhotoSourceMode('gallery');
                            }}
                            className="flex-1 py-2 bg-alabaster hover:bg-[#e5dfd4] border border-border text-charcoal text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Upload className="w-3.5 h-3.5 text-antiquegold" />
                            <span>Upload File</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Prompt 3: Nearest Landmark */}
                    <div className={`p-4 bg-white border rounded-2xl transition-all ${
                      sitePhotos.landmark ? 'border-royalemerald/35 bg-royalemerald/5' : 'border-border hover:border-antiquegold/35'
                    }`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase font-black text-antiquegold tracking-widest">PROMPT 3 OF 3 • REQUIRED</span>
                          <h4 className="font-serif text-sm font-bold text-charcoal">Nearest Physical Landmark or Street Board</h4>
                          <p className="text-xs text-warmgray">Capture a public monument, store sign, or street sign boards for surveyor orientation.</p>
                        </div>
                        {sitePhotos.landmark && (
                          <span className="text-[10px] font-mono font-bold bg-royalemerald/20 text-royalemerald px-2 py-0.5 rounded uppercase tracking-wider shrink-0 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Captured
                          </span>
                        )}
                      </div>

                      {sitePhotos.landmark ? (
                        <div className="mt-3.5 flex gap-4 items-center">
                          <img src={sitePhotos.landmark.dataUrl} className="w-32 h-20 object-cover rounded-xl border border-border" alt="Landmark watermarked draft" />
                          <div className="space-y-1 text-[10px] font-mono text-warmgray">
                            <p className="text-charcoal font-bold flex items-center gap-1">
                              {sitePhotos.landmark.isLive ? <span className="text-success">🟢 Secure Live Shutter</span> : <span className="text-error">⚠️ Imported Non-Live File</span>}
                            </p>
                            <p className="truncate max-w-[180px]">Stamp: {sitePhotos.landmark.timestamp}</p>
                            <p className="truncate max-w-[180px]">Coords: {sitePhotos.landmark.geotag}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setSitePhotos(prev => {
                                  const next = { ...prev };
                                  delete next.landmark;
                                  saveLeadDraft({ sitePhotos: next });
                                  return next;
                                });
                              }}
                              className="text-error font-bold flex items-center gap-1 pt-1 text-[11px] hover:underline"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Recapture Photo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePhotoPrompt('landmark');
                              setPhotoSourceMode('live');
                            }}
                            className="flex-1 py-2 bg-charcoal text-white hover:bg-antiquegold text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Live Shutter</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePhotoPrompt('landmark');
                              setPhotoSourceMode('gallery');
                            }}
                            className="flex-1 py-2 bg-alabaster hover:bg-[#e5dfd4] border border-border text-charcoal text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Upload className="w-3.5 h-3.5 text-antiquegold" />
                            <span>Upload File</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Navigation row step 4 */}
                  <div className="pt-4 border-t border-[rgba(184,135,61,0.1)] flex justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureStep(3);
                        saveLeadDraft({ captureStep: 3 });
                      }}
                      className="px-5 py-3 bg-white border border-border hover:bg-alabaster rounded-xl text-xs text-charcoal font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <span>Back</span>
                    </button>
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => {
                        setCaptureStep(5);
                        saveLeadDraft({ captureStep: 5 });
                      }}
                      disabled={!sitePhotos.front || !sitePhotos.entrance || !sitePhotos.landmark}
                      className="px-6 py-3 font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <span>Go to Transmission Summary</span>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </Button>
                  </div>

                </div>
              )}

              {/* ---------------------------------------------------------
                  STEP 5: SUMMARY & TRANSMISSION SENDER
                  --------------------------------------------------------- */}
              {captureStep === 5 && (
                <div className="space-y-4 animate-fadeIn text-left">
                  {isTransmitting ? (
                    /* ---------------------------------------------------------
                       TRANSMISSION ANIMATION WITH THE ASCENSION LINE MOTIF
                       --------------------------------------------------------- */
                    <div className="bg-[#1A1613] text-[#FAF8F5] rounded-2xl border border-[rgba(184,135,61,0.35)] p-5 space-y-5 shadow-2xl relative overflow-hidden">
                      {/* Subtle ambient gold glow inside the dark container */}
                      <div className="absolute -right-16 -top-16 w-32 h-32 bg-antiquegold/10 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                        <RefreshCw className="w-5 h-5 text-antiquegold animate-spin shrink-0" />
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-widest text-antiquegold block font-extrabold">SECURE TELEMETRY LINK</span>
                          <h4 className="font-serif text-sm font-bold text-[#E6DFD4]">AI Commission Telemetry Pipe Active</h4>
                        </div>
                      </div>

                      {showCelebration ? (
                        /* Dynamic Celebration Splash Overlay */
                        <div className="text-center py-6 space-y-5 animate-scaleUp">
                          <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 rounded-full border border-antiquegold/30 animate-ping opacity-50" />
                            <div className="absolute inset-1.5 rounded-full border border-royalemerald/30 animate-pulse" />
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-royalemerald to-[#082E25] flex items-center justify-center border-2 border-antiquegold shadow-lg shadow-royalemerald/20">
                              <Check className="w-10 h-10 text-antiquegold stroke-[3]" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-antiquegold uppercase tracking-widest font-extrabold">NODE TRANSMISSION COMPLETE</span>
                            <h3 className="font-serif text-xl font-bold text-white">Lead Node Locked & Transmitted</h3>
                            <p className="text-xs text-[#C5BDB2] max-w-sm mx-auto leading-relaxed">
                              Your field verification node and watermark site photographic proofs have been successfully synchronized with <strong>Mr. Prashant Wable's</strong> core ledger.
                            </p>
                          </div>

                          {/* Instant Commission Notification Box */}
                          <div className="bg-[#241F1B] border border-[rgba(184,135,61,0.3)] rounded-2xl p-4 max-w-md mx-auto space-y-2 text-left">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-antiquegold font-mono uppercase font-black tracking-wide flex items-center gap-1">
                                <Award className="w-4 h-4" /> SECURE COMMISSION LEDGER
                              </span>
                              <span className="text-[10px] font-mono font-bold uppercase bg-royalemerald/20 text-royalemerald px-2 py-0.5 rounded border border-royalemerald/30">
                                NPCI Clear Ready
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1.5 pt-1">
                              <span className="text-2xl font-serif font-bold text-[#FAF8F5]">₹1,500.00</span>
                              <span className="text-[10px] font-sans text-[#C5BDB2]">SBI direct-deposit allocation registered.</span>
                            </div>
                            <p className="text-[10px] text-[#A69C90] leading-relaxed">
                              Base Commission: <strong>₹1,500</strong> credited in pending state. Verification speed-bonus qualification window is open for the technical dispatch team.
                            </p>
                          </div>

                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => handleWizardSubmit()}
                              className="px-8 py-3 bg-royalemerald hover:bg-opacity-95 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-2 border border-royalemerald/30"
                            >
                              <CheckCircle className="w-4 h-4 text-white" />
                              <span>Return to Workbench</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Two-Column Interactive Transmission UI */
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          
                          {/* Column 1: The Elevator Shaft Hoistway (Ascension Line motif) */}
                          <div className="bg-[#110E0C] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-between h-[360px] relative overflow-hidden">
                            {/* Vertical Gold Rail (The Ascension Line) */}
                            <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-[2px] bg-white/10 rounded-full" />
                            <div 
                              className="absolute top-4 left-1/2 -translate-x-1/2 w-[2px] bg-antiquegold rounded-full transition-all duration-300"
                              style={{ height: `${(transmissionStep - 1) * 25}%` }}
                            />

                            {/* Elevator Car Node (motion.div) */}
                            <motion.div 
                              className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-gradient-to-br from-antiquegold to-[#8C6412] border border-antiquegold/50 flex items-center justify-center shadow-lg shadow-antiquegold/20 z-20"
                              style={{
                                bottom: `calc(16px + ${(transmissionStep - 1) * 75}px)`
                              }}
                              animate={{ y: [0, -3, 0], scale: [1, 1.05, 1] }}
                              transition={{ repeat: Infinity, duration: 1.8 }}
                            >
                              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                            </motion.div>

                            {/* Floor Indicators (Stages mapped) */}
                            {[5, 4, 3, 2, 1].map((lvl) => {
                              const isCompleted = transmissionStep > lvl;
                              const isActive = transmissionStep === lvl;
                              
                              return (
                                <div key={lvl} className="flex items-center justify-center w-full relative z-10 select-none">
                                  <div className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold border transition-all ${
                                    isCompleted 
                                      ? 'bg-royalemerald/20 border-royalemerald text-royalemerald shadow-xs' 
                                      : isActive 
                                        ? 'bg-antiquegold text-[#110E0C] border-antiquegold animate-pulse'
                                        : 'bg-white/5 border-white/10 text-[#8E8377]'
                                  }`}>
                                    FL {lvl} : {lvl === 1 && "L-DB"} {lvl === 2 && "GPS"} {lvl === 3 && "MEDIA"} {lvl === 4 && "SYNC"} {lvl === 5 && "NPCI"}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Columns 2 & 3: Progress and Console Logs */}
                          <div className="md:col-span-2 space-y-4">
                            
                            {/* Current Action Progress */}
                            <div className="space-y-1 bg-white/5 p-3.5 rounded-xl border border-white/5">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-[#A69C90] uppercase tracking-wider font-extrabold">Current Pipe Stage Progress:</span>
                                <span className="text-antiquegold font-bold">{transmissionProgressCurrent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-antiquegold transition-all duration-300" style={{ width: `${transmissionProgressCurrent}%` }} />
                              </div>
                              <p className="text-[10px] text-[#C5BDB2] italic">
                                {transmissionStep === 1 && "Sealing offline database drafts..."}
                                {transmissionStep === 2 && "Checking NavIC geofence integrity..."}
                                {transmissionStep === 3 && "Compressing and geotagging site photometrics..."}
                                {transmissionStep === 4 && "Streaming data arrays to CRM ledger..."}
                                {transmissionStep === 5 && "Clearing commission deposit routes..."}
                              </p>
                            </div>

                            {/* Total Telemetry Pipe Progress */}
                            <div className="space-y-1 bg-white/5 p-3.5 rounded-xl border border-white/5">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-[#A69C90] uppercase tracking-wider font-extrabold">Total Transmission Sequence:</span>
                                <span className="text-royalemerald font-bold">{transmissionProgressTotal}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-royalemerald transition-all duration-300" style={{ width: `${transmissionProgressTotal}%` }} />
                              </div>
                            </div>

                            {/* Live Cryptographic Logs console */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono uppercase tracking-widest text-[#A69C90] font-black">Transmission Telemetry Log</span>
                              <div className="bg-[#0B0908] border border-white/10 rounded-xl p-3 h-36 overflow-y-auto font-mono text-[9px] text-[#93C47D] space-y-1.5 scrollbar-thin">
                                {transmissionLogs.map((log, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <span className="text-[#8E8377] shrink-0">[{idx + 1}]</span>
                                    <span className={log.startsWith('✔') ? 'text-royalemerald font-bold' : ''}>{log}</span>
                                  </div>
                                ))}
                                <div className="h-1" />
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ---------------------------------------------------------
                       ORIGINAL SUMMARY AND DETAILED INCENTIVE PREVIEW
                       --------------------------------------------------------- */
                    <div className="space-y-4">
                      
                      {/* Section Title */}
                      <div className="p-4 bg-alabaster border border-[rgba(184,135,61,0.2)] rounded-2xl flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-antiquegold font-extrabold block">SURVEYOR LEDGER CONFIRMATION</span>
                          <h4 className="font-serif text-sm font-bold text-charcoal">Review & Authorize Transmission</h4>
                        </div>
                        <span className="text-[9px] font-mono bg-royalemerald/10 text-royalemerald border border-royalemerald/25 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> SECURE DECK
                        </span>
                      </div>

                      {/* Summary Grid Card */}
                      <div className="p-4 bg-white border border-border rounded-2xl space-y-3.5">
                        <h4 className="text-[10px] uppercase font-mono font-black tracking-wider text-charcoal border-b pb-2 flex justify-between">
                          <span>Verification Blueprint Summary</span>
                          <span className="text-warmgray font-normal lowercase font-sans">double-check details before locking</span>
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                          <div>
                            <span className="text-warmgray block text-[10px] uppercase font-bold">Client / Builder:</span>
                            <span className="font-bold text-charcoal">{clientName}</span>
                          </div>
                          <div>
                            <span className="text-warmgray block text-[10px] uppercase font-bold">Contact Number:</span>
                            <span className="font-mono text-charcoal font-bold">{clientPhone || "In-Person Visit Only"}</span>
                          </div>
                          
                          <div>
                            <span className="text-warmgray block text-[10px] uppercase font-bold">Total Shaft Floors:</span>
                            <span className="font-mono text-charcoal font-bold">{floors} Floors</span>
                          </div>
                          <div>
                            <span className="text-warmgray block text-[10px] uppercase font-bold">Structure Classification:</span>
                            <span className="capitalize text-charcoal font-bold">{propertyType} High-Rise</span>
                          </div>

                          <div>
                            <span className="text-warmgray block text-[10px] uppercase font-bold">Construction Stage:</span>
                            <span className="capitalize text-charcoal font-bold">{constructionStage?.replace('-', ' ') || 'Not Configured'}</span>
                          </div>
                          <div>
                            <span className="text-warmgray block text-[10px] uppercase font-bold">Shaft Dimensions:</span>
                            <span className="font-mono text-charcoal font-bold">
                              {isShaftInaccessible ? 'Inaccessible (30d Follow-up)' : `${shaftWidthEstimate} × ${shaftDepthEstimate} mm`}
                            </span>
                          </div>

                          <div>
                            <span className="text-warmgray block text-[10px] uppercase font-bold">Passenger Capacity:</span>
                            <span className="font-bold text-charcoal">{passengerCapacityEstimate} Passengers</span>
                          </div>
                          <div>
                            <span className="text-warmgray block text-[10px] uppercase font-bold">Mixed-Use Structure:</span>
                            <span className="capitalize text-charcoal font-bold">{isMixedUse ? 'Mixed-Use' : 'No'}</span>
                          </div>

                          {isMixedUse && mixedCategoryDetail && (
                            <div className="col-span-2 bg-[#F8F6F1] p-2 rounded-lg border border-border/10">
                              <span className="text-warmgray block text-[10px] uppercase font-bold">Mixed-Use Category Details:</span>
                              <span className="text-charcoal font-semibold">{mixedCategoryDetail}</span>
                            </div>
                          )}

                          <div className="col-span-2 border-t border-dashed border-border/40 pt-2.5">
                            <span className="text-warmgray block text-[10px] uppercase font-bold">GPS Coordinates Stamp:</span>
                            <span className="font-mono text-antiquegold font-bold">
                              📍 {capturedCoords?.latitude.toFixed(6)}° N, {capturedCoords?.longitude.toFixed(6)}° E (±{gpsAccuracy.toFixed(1)}m Acc {manualGpsAdjusted ? '• Calibrated' : ''})
                            </span>
                          </div>

                          {specialNotes && (
                            <div className="col-span-2 bg-[#F8F6F1] p-2 rounded-lg border border-border/10">
                              <span className="text-warmgray block text-[10px] uppercase font-bold">Special Structural / Site Notes:</span>
                              <span className="text-charcoal italic">"{specialNotes}"</span>
                            </div>
                          )}

                          {landmarkNote && (
                            <div className="col-span-2 bg-[#F8F6F1] p-2 rounded-lg border border-border/10">
                              <span className="text-warmgray block text-[10px] uppercase font-bold">Orienting Landmark Note:</span>
                              <span className="text-charcoal italic">"{landmarkNote}"</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sketchpad Blueprint Thumbnail Preview */}
                      {shaftSketchDataUrl && (
                        <div className="p-3 bg-white border border-border rounded-2xl space-y-2">
                          <span className="text-warmgray block text-[10px] uppercase font-bold">Saved Shaft Blueprint Sketch</span>
                          <div className="border border-[rgba(184,135,61,0.15)] rounded-xl overflow-hidden bg-[#111827] max-h-24 flex items-center justify-center p-1">
                            <img src={shaftSketchDataUrl} className="max-h-20 object-contain mx-auto" alt="Shaft Blueprint Thumbnail" />
                          </div>
                        </div>
                      )}

                      {/* Photos Watermark Stamps Deck */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-charcoal">Watermarked Site Photographic Proofs</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {['front', 'entrance', 'landmark'].map(key => {
                            const photo = (sitePhotos as any)[key];
                            return (
                              <div key={key} className="bg-[#F8F6F1] p-1.5 rounded-xl border border-border text-center flex flex-col justify-between h-28 relative group overflow-hidden">
                                {photo ? (
                                  <>
                                    <img src={photo.dataUrl} className="w-full h-20 object-cover rounded-lg border" alt="Thumbnail proof" />
                                    <span className="text-[8px] font-mono uppercase tracking-wider block font-bold text-charcoal mt-1 truncate">
                                      {key === 'front' ? 'FACADE' : key === 'entrance' ? 'SHAFT LOBBY' : 'LANDMARK'}
                                    </span>
                                  </>
                                ) : (
                                  <div className="h-full flex items-center justify-center text-warmgray text-[10px]">Missing</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ---------------------------------------------------------
                         INCENTIVE & COMMISSION PREVIEW PANEL (Prompt 036)
                         --------------------------------------------------------- */}
                      <div className="p-4 bg-gradient-to-br from-[#FFFDF9] to-white border border-antiquegold/30 rounded-2xl relative overflow-hidden space-y-3 shadow-md">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-antiquegold/5 rounded-full blur-xl pointer-events-none" />
                        <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-royalemerald/5 rounded-full blur-xl pointer-events-none" />
                        
                        <div className="flex items-start justify-between gap-3 border-b border-[rgba(184,135,61,0.1)] pb-2.5">
                          <div>
                            <span className="text-[9px] font-mono text-antiquegold uppercase font-black tracking-widest block">PIPELINE REWARD ENHANCEMENT</span>
                            <h4 className="font-serif text-sm font-bold text-charcoal">Incentive Allocation Preview</h4>
                          </div>
                          <div className="flex items-center gap-1 bg-royalemerald/10 text-royalemerald px-2.5 py-0.5 rounded-lg border border-royalemerald/20 text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                            <span>SBI Direct Link Active</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          
                          {/* Base Commission Card */}
                          <div className="p-3 bg-alabaster border border-border rounded-xl space-y-1">
                            <span className="text-warmgray text-[9px] font-mono uppercase font-bold block">Base Node Capture</span>
                            <span className="font-serif text-lg font-bold text-charcoal">₹1,500</span>
                            <span className="text-[9px] text-success font-bold block">Pending Audit Clear</span>
                          </div>

                          {/* Speed Surveyor Bonus */}
                          <div className="p-3 bg-royalemerald/[0.03] border border-royalemerald/20 rounded-xl space-y-1">
                            <span className="text-royalemerald text-[9px] font-mono uppercase font-black block">Speed-Surveyor Bonus</span>
                            <span className="font-serif text-lg font-bold text-royalemerald">+₹200</span>
                            <span className="text-[9px] text-warmgray block">SOP task clear &lt;24h</span>
                          </div>

                          {/* Cumulative Target Reward */}
                          <div className="p-3 bg-antiquegold/[0.04] border border-antiquegold/25 rounded-xl space-y-1">
                            <span className="text-antiquegold text-[9px] font-mono uppercase font-extrabold block">Weekly Target Bonus</span>
                            <span className="font-serif text-lg font-bold text-antiquegold">₹5,000</span>
                            <span className="text-[9px] text-warmgray block">Unlocks at 6 leads</span>
                          </div>

                        </div>

                        {/* Tracker Progress */}
                        <div className="p-3 bg-[#F8F6F1] rounded-xl border border-border/10 text-[11px] space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-charcoal">Your Campaign Target Milestone:</span>
                            <span className="font-mono font-bold text-antiquegold">{leads.length} of 6 Leads</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#e5dfd4] rounded-full overflow-hidden">
                            <div className="h-full bg-antiquegold transition-all duration-300" style={{ width: `${Math.min(100, Math.round((leads.length / 6) * 100))}%` }} />
                          </div>
                          <p className="text-[9px] text-warmgray leading-relaxed pt-0.5">
                            Each lead captures ₹1,500 instantly in your secure ledger. Securing 6 verified leads in the Pune Sector matrix triggers your executive milestone payout of <strong>₹5,000 extra</strong>!
                          </p>
                        </div>
                      </div>

                      {/* Sync status alert */}
                      {offlineMode ? (
                        <div className="p-3.5 bg-warning/15 border border-warning/35 rounded-2xl space-y-2 text-warning">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            <WifiOff className="w-4 h-4 text-warning" />
                            <span>Offline Caching Mode Active</span>
                          </div>
                          <p className="text-[10px] font-sans leading-relaxed text-warning/90">
                            Pune site cellular signal degraded. This validated node and watermarked photos will be queued securely in your local cache and synchronised automatically on return of internet signal.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-success/10 border border-success/20 rounded-2xl space-y-1 text-royalemerald">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            <Wifi className="w-4 h-4 text-royalemerald" />
                            <span>Direct Cloud Connection Verified</span>
                          </div>
                          <p className="text-[10px] font-sans leading-relaxed text-royalemerald/90">
                            Upon transmission authority, this lead node and watermark images will map immediately to the Pune CRM database, crediting your pending account instantly.
                          </p>
                        </div>
                      )}

                      {/* Toast notification for local draft saves */}
                      {draftSavedToast && (
                        <div className="p-3 bg-royalemerald text-white rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn">
                          <span>✔ Survey draft state preserved in local browser index cache!</span>
                          <button type="button" onClick={() => setDraftSavedToast(false)} className="text-white hover:text-antiquegold">✕</button>
                        </div>
                      )}

                      {/* Navigation row step 5 */}
                      <div className="pt-4 border-t border-[rgba(184,135,61,0.12)] flex flex-col sm:flex-row gap-3 justify-between">
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCaptureStep(4);
                              saveLeadDraft({ captureStep: 4 });
                            }}
                            className="px-4 py-3 bg-white border border-border hover:bg-alabaster rounded-xl text-xs text-charcoal font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                          >
                            <span>Back</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              saveLeadDraft({
                                clientName, clientPhone, companyName, contactRole, noDirectContact, contactConsentFlag,
                                relationshipNote, address, floors, propertyType, capturedCoords, gpsAccuracy, manualGpsAdjusted,
                                constructionStage, isShaftInaccessible, shaftWidthEstimate, shaftDepthEstimate, specialNotes,
                                passengerCapacityEstimate, isMixedUse, mixedCategoryDetail, shaftSketchDataUrl, sitePhotos, landmarkNote
                              });
                              setDraftSavedToast(true);
                              setTimeout(() => setDraftSavedToast(false), 4000);
                            }}
                            className="px-4 py-3 bg-alabaster border border-[rgba(184,135,61,0.2)] hover:bg-[#edeae2] rounded-xl text-xs text-charcoal font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-antiquegold" />
                            <span>Save to Draft</span>
                          </button>
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleTransmissionStart}
                          className="px-6 py-3 bg-royalemerald text-white hover:bg-opacity-95 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md border border-royalemerald/30 font-sans"
                        >
                          <CheckCircle className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                          <span>Transmit & Lock Lead Node</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>

          </Card>
        </div>
      )}

      {/* ---------------------------------------------------------
          FLOATING SHUTTER / GALLERY CAPTURE MODE SCREEN OVERLAY
          --------------------------------------------------------- */}
      {activePhotoPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg">
            
            {/* Gallery Upload Mode with Blocking warning */}
            {photoSourceMode === 'gallery' ? (
              <Card className="p-6 bg-white shadow-2xl relative space-y-4 border border-[rgba(184,135,61,0.25)] text-left">
                <button
                  type="button"
                  onClick={() => setActivePhotoPrompt(null)}
                  className="absolute top-4 right-4 text-warmgray hover:text-charcoal font-bold text-sm"
                >
                  ✕
                </button>
                
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono font-bold uppercase text-antiquegold tracking-widest block">CAMERA ROLL SECURITY CONTROL</span>
                  <h3 className="font-serif text-lg font-black text-charcoal">Gallery Image Selection Blocked</h3>
                </div>

                {blockGalleryUploads ? (
                  <div className="p-4 bg-error/10 border border-error/25 rounded-2xl space-y-3">
                    <div className="flex gap-2 text-error text-xs font-bold uppercase tracking-wider items-center">
                      <AlertTriangle className="w-4.5 h-4.5 text-error shrink-0" />
                      <span>ANTI-FRAUD BAN ACTIVE</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-error/90 font-sans">
                      All India Elevators protocol strictly blocks surveyor gallery imports. All site inspection photos must be captured using the device's live shutter to verify actual presence.
                    </p>
                    <div className="pt-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-charcoal font-semibold text-[10px] select-none uppercase tracking-wide">
                        <input
                          type="checkbox"
                          checked={!blockGalleryUploads}
                          onChange={(e) => setBlockGalleryUploads(!e.target.checked)}
                          className="w-4 h-4 accent-error"
                        />
                        <span>Bypass Anti-Fraud Rule (Developer Override)</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-warning/10 border border-warning/25 rounded-2xl space-y-2 text-warning">
                    <p className="text-xs font-bold uppercase tracking-wider">⚠️ Developer Bypass Active</p>
                    <p className="text-[11px] text-warning/90 font-sans leading-relaxed">
                      Non-live photos will be watermarked with a prominent warning stamp in audit logs, signaling external source.
                    </p>
                  </div>
                )}

                <div className="space-y-3.5">
                  {blockGalleryUploads ? (
                    <button
                      type="button"
                      onClick={() => setPhotoSourceMode('live')}
                      className="w-full py-3 bg-charcoal text-white hover:bg-antiquegold rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4 text-antiquegold" />
                      <span>Switch to Live Shutter</span>
                    </button>
                  ) : (
                    <div>
                      <label className="border-2 border-dashed border-border hover:border-antiquegold bg-alabaster p-8 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2.5">
                        <Upload className="w-7 h-7 text-antiquegold animate-bounce" />
                        <span className="text-xs font-bold text-charcoal">Select Survey Image from Disk</span>
                        <span className="text-[9px] text-warmgray uppercase">JPEG or PNG (Auto-watermarked)</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  const base64 = ev.target.result as string;
                                  const coords = capturedCoords || { latitude: 18.5204, longitude: 73.8567 };
                                  burnWatermark(base64, activePhotoPrompt || 'Site photo', coords, false).then(watermarked => {
                                    setSitePhotos(prev => {
                                      const next = {
                                        ...prev,
                                        [activePhotoPrompt!]: {
                                          dataUrl: watermarked,
                                          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
                                          geotag: `${coords.latitude.toFixed(6)}° N, ${coords.longitude.toFixed(6)}° E`,
                                          isLive: false
                                        }
                                      };
                                      saveLeadDraft({ sitePhotos: next });
                                      return next;
                                    });
                                    setActivePhotoPrompt(null);
                                  });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setActivePhotoPrompt(null)}
                    className="w-full py-2.5 border border-border hover:bg-alabaster rounded-xl text-xs font-bold text-charcoal uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </Card>
            ) : (
              /* Live video capture camera tab */
              <div className="animate-scaleUp">
                <CameraCapture 
                  onCapture={(dataUrl) => {
                    const coords = capturedCoords || { latitude: 18.5204, longitude: 73.8567 };
                    burnWatermark(dataUrl, activePhotoPrompt || 'Site photo', coords, true).then(watermarked => {
                      setSitePhotos(prev => {
                        const next = {
                          ...prev,
                          [activePhotoPrompt!]: {
                            dataUrl: watermarked,
                            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
                            geotag: `${coords.latitude.toFixed(6)}° N, ${coords.longitude.toFixed(6)}° E`,
                            isLive: true
                          }
                        };
                        saveLeadDraft({ sitePhotos: next });
                        return next;
                      });
                      setActivePhotoPrompt(null);
                    });
                  }}
                  onCancel={() => setActivePhotoPrompt(null)}
                />
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

// =========================================================
// 3. TECHNICIAN DASHBOARD
// =========================================================
export const TechnicianDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const refreshData = () => {
    const list = DbManager.getJobs().filter(j => j.technicianId === user.id);
    setJobs(list);
    if (list.length > 0) setSelectedJob(list[0]);
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('aiec_db_update', refreshData);
    return () => window.removeEventListener('aiec_db_update', refreshData);
  }, []);

  const handleToggleSopStep = (stepId: string) => {
    if (!selectedJob) return;

    const updatedSteps = selectedJob.sopSteps.map(step => {
      if (step.id === stepId) {
        const completed = !step.completed;
        return {
          ...step,
          completed,
          verifiedAt: completed ? new Date().toISOString() : undefined
        };
      }
      return step;
    });

    const allDone = updatedSteps.every(s => s.completed);
    const updatedJob: Job = {
      ...selectedJob,
      sopSteps: updatedSteps,
      status: allDone ? 'qc_pending' : 'in_progress',
      completedAt: allDone ? new Date().toISOString() : undefined
    };

    DbManager.updateJob(updatedJob);
    setSelectedJob(updatedJob);
  };

  return (
    <div className="space-y-6">
      {/* Technician Welcome - Styled in Glitter Golden */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#FFF5C6] via-[#D4AF37] to-[#8C6412] text-[#1c1200] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md border border-[#C59B27]/40">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#5c4008]">Safety certified installation engineer</span>
          <h2 className="font-serif text-2xl font-bold mt-1">Hello, Tech Partner {user.name}</h2>
          <p className="text-xs text-[#402e07] font-semibold mt-1">Active Site Deployment Area: {user.region} • ISO safety standard enforced</p>
        </div>
        <div className="bg-white/40 border border-[#B8873D]/20 px-4 py-2 rounded-xl backdrop-blur-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-bold text-[#1c1200]">Technician Status: Dispatch Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: Job details & Ascension Line SOP checklist */}
        {selectedJob ? (
          <Card className="lg:col-span-2 p-6 space-y-6">
            <div className="flex justify-between items-start gap-4 pb-4 border-b border-[rgba(184,135,61,0.12)]">
              <div>
                <span className="text-xs font-bold text-warmgray">Assigned Site Job: {selectedJob.id}</span>
                <h3 className="font-serif text-lg font-bold text-charcoal mt-1">Deshmukh Arcade, Hinjewadi Sector 62</h3>
                <p className="text-xs text-warmgray mt-0.5">8 Floor Traction Installation SOP Sequence</p>
              </div>
              <Badge status={selectedJob.status} />
            </div>

            {/* Visual Ascension Line for installation steps */}
            <div>
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-widest mb-4">SOP Step Progression</h4>
              <div className="p-4 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)]">
                <AscensionLine 
                  steps={selectedJob.sopSteps.map(s => ({
                    id: s.id,
                    label: s.label,
                    completed: s.completed,
                    active: s.completed === false
                  }))} 
                />
              </div>
            </div>

            {/* Checkbox itemized list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-widest">Mark Step Progress</h4>
              <div className="space-y-2">
                {selectedJob.sopSteps.map((step) => (
                  <div 
                    key={step.id} 
                    onClick={() => handleToggleSopStep(step.id)}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                      step.completed 
                        ? 'bg-white border-success/35 text-charcoal shadow-sm' 
                        : 'bg-alabaster border-[rgba(184,135,61,0.1)] text-warmgray hover:border-antiquegold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={step.completed} 
                        onChange={() => {}} // Swallowed as div handles click
                        className="w-4 h-4 rounded text-antiquegold focus:ring-antiquegold cursor-pointer accent-antiquegold" 
                      />
                      <span className={`text-xs font-semibold ${step.completed ? 'line-through text-warmgray' : 'text-charcoal'}`}>
                        {step.label}
                      </span>
                    </div>
                    {step.completed && (
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-success bg-success/10 px-2 py-0.5 rounded">
                        Photo Verified
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-warmgray block">※ Checkoff requires instant field verification photos as per quality checklist guidelines.</span>
            </div>
          </Card>
        ) : (
          <Card className="lg:col-span-2 p-6 flex flex-col items-center justify-center text-center text-warmgray min-h-[300px]">
            <CheckCircle className="w-12 h-12 text-[#dcd9d2] mb-2 animate-pulse" />
            <p className="text-sm font-semibold">No active elevator construction deployment assigned.</p>
          </Card>
        )}

        {/* Right column: Safety & Regulations Lookup via Gemini Maps */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-serif text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span>SOP Safety Norms</span>
            </h3>
            <ul className="text-xs text-warmgray space-y-3 font-sans leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0 mt-1.5" />
                <span>Wear double-harness fall arresters during guide-rail hoisting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0 mt-1.5" />
                <span>Lockout/Tagout (LOTO) active at the main VVVF breaker.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-1.5" />
                <span>Verify clearance of shaft overhead and pit depth constraints.</span>
              </li>
            </ul>
          </Card>

          {/* Secure maps grounding lookup */}
          <GeminiMapsTool />
        </div>
      </div>
    </div>
  );
};

// =========================================================
// 4. CUSTOMER PORTAL
// =========================================================
export const CustomerDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [job, setJob] = useState<Job | null>(null);

  const refreshData = () => {
    // Rohan Deshmukh's active data
    const activeDeal = DbManager.getDeals()[0] || null;
    setDeal(activeDeal);
    if (activeDeal) {
      setPayments(DbManager.getPayments().filter(p => p.dealId === activeDeal.id));
      setJob(DbManager.getJobs().find(j => j.dealId === activeDeal.id) || null);
    }
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('aiec_db_update', refreshData);
    return () => window.removeEventListener('aiec_db_update', refreshData);
  }, []);

  const handlePayInstallment = (payId: string) => {
    const pay = DbManager.getPaymentById(payId);
    if (!pay) return;

    const updatedPay: Payment = {
      ...pay,
      status: 'paid',
      paidAt: new Date().toISOString()
    };

    DbManager.updatePayment(updatedPay);
    refreshData();
  };

  // Determine actual completed construction stages for project tracking
  const projectSteps = [
    { id: '1', label: 'Shaft Inspection Done', completed: true },
    { id: '2', label: 'Quotation Accepted', completed: true },
    { id: '3', label: 'Advance Payment', completed: true },
    { id: '4', label: 'Material Dispatch', completed: job ? job.sopSteps[0].completed : false },
    { id: '5', label: 'Guide Rails Erected', completed: job ? job.sopSteps[1].completed : false },
    { id: '6', label: 'Cabin Mechanicals Set', completed: job ? job.sopSteps[2].completed : false },
    { id: '7', label: 'Handover & QC Clearance', completed: job ? job.status === 'completed' : false },
  ];

  return (
    <div className="space-y-6">
      {/* Customer Header - Styled in Glitter Golden */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#FFF5C6] via-[#D4AF37] to-[#8C6412] text-[#1c1200] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md border border-[#C59B27]/40">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#5c4008]">AIEC Customer Vault</span>
          <h2 className="font-serif text-2xl font-bold mt-1">Welcome back, {user.name}</h2>
          <p className="text-xs text-[#402e07] font-semibold mt-1">Deshmukh Arcade Multi-Floor Project • Real-Time Tracking</p>
        </div>
        <div className="bg-white/40 border border-[#B8873D]/20 px-4 py-3 rounded-xl backdrop-blur-xs flex gap-4 shrink-0 text-center">
          <div>
            <p className="text-[10px] text-[#5c4008] font-extrabold uppercase tracking-wide">Agreed Deal Price</p>
            <p className="font-mono text-sm font-bold text-[#1c1200]">₹12,50,000</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Tracker Card (Ascension Line) */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[rgba(184,135,61,0.1)]">
            <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
              <Compass className="w-5 h-5 text-antiquegold" />
              <span>Project Milestone Tracker</span>
            </h3>
            <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-md">Installation Phase</span>
          </div>

          <div className="p-4 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)]">
            <AscensionLine steps={projectSteps} />
          </div>

          <p className="text-[10px] text-warmgray text-center block">
            ※ Follow the golden Ascension Line as our partners complete on-site SOP checks floor by floor!
          </p>
        </Card>

        {/* Payments list column */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-serif text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-royalemerald" />
              <span>Installment Schedule</span>
            </h3>
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)] flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-charcoal">{p.stage}</h4>
                      <p className="text-[10px] text-warmgray mt-0.5">Due: {p.dueDate}</p>
                    </div>
                    <Badge status={p.status} />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#e6dfd4]">
                    <span className="font-mono text-xs font-bold text-charcoal">₹{p.amount.toLocaleString('en-IN')}</span>
                    {p.status !== 'paid' ? (
                      <Button variant="primary" className="py-1.5 px-3 text-xs" onClick={() => handlePayInstallment(p.id)}>
                        Pay Installment
                      </Button>
                    ) : (
                      <span className="text-[10px] text-success font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Paid & Invoiced</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-royalemerald/5 border border-royalemerald/10 text-royalemerald text-xs rounded-xl flex gap-3">
            <FileText className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Need customization?</p>
              <p className="text-warmgray mt-0.5">Use the settings menu to request custom interior panel layouts or glass cladding details.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// 5. SUPPLIER/MANUFACTURER DASHBOARD
// =========================================================
export const SupplierDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [supplier, setSupplier] = useState<Supplier | null>(null);

  const refreshData = () => {
    const activeSup = DbManager.getSuppliers()[0] || null;
    setSupplier(activeSup);
    if (activeSup) {
      setCatalog(activeSup.catalog);
    }
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('aiec_db_update', refreshData);
    return () => window.removeEventListener('aiec_db_update', refreshData);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome header - Styled in Glitter Golden */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#FFF5C6] via-[#D4AF37] to-[#8C6412] text-[#1c1200] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md border border-[#C59B27]/40">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#5c4008]">AIEC Authorized Supplier Portal</span>
          <h2 className="font-serif text-2xl font-bold mt-1">Hello, {supplier?.name || user.name}</h2>
          <p className="text-xs text-[#402e07] font-semibold mt-1">Region: {supplier?.region || 'Chakan Cluster'} • Direct Manufacturing Dispatch Integration</p>
        </div>
        <div className="bg-white/40 border border-[#B8873D]/20 px-4 py-2.5 rounded-xl backdrop-blur-xs flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#5c4008] shrink-0" />
          <div className="text-left">
            <p className="text-[9px] text-[#5c4008] font-bold">DISPATCH SLA STATUS</p>
            <p className="text-xs font-bold">100% On Time</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catalog Card */}
        <Card className="p-6 space-y-4">
          <h3 className="font-serif text-lg font-bold text-charcoal">Your Machinery & Cabin Catalog</h3>
          <div className="space-y-3">
            {catalog.map((item) => (
              <div key={item.itemId} className="p-3.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)] flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-xs text-charcoal">{item.itemName}</h4>
                  <p className="text-[9px] font-mono font-bold text-warmgray uppercase mt-0.5">Item ID: {item.itemId}</p>
                </div>
                <span className="font-mono text-xs font-bold text-royalemerald">₹{item.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* PO Tracker / Delivery SOP */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-serif text-lg font-bold text-charcoal mb-4">Pending Purchase Orders</h3>
            <div className="p-4 bg-alabaster rounded-xl border border-dashed border-[#e6dfd4] text-center text-xs text-warmgray">
              <FileText className="w-8 h-8 text-[#dcd9d2] mx-auto mb-2" />
              <p className="font-semibold text-charcoal">No outstanding purchase orders pending dispatch.</p>
              <p className="mt-0.5">You will be automatically notified via SMS & WhatsApp sequence when a custom layout is closed won.</p>
            </div>
          </Card>

          {/* Secure GenAI Tools panel on Supplier catalog */}
          <GeminiImageTool />
        </div>
      </div>
    </div>
  );
};
