import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building, Settings, Play, ArrowLeft, ArrowRight, Save, 
  CheckCircle, AlertTriangle, Info, User, HelpCircle, 
  Layers, Hammer, Eye, FileText, Sparkles, ChevronRight, Check
} from 'lucide-react';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';

// Structured Lead representing surveyed buildings
interface SurveyedLead {
  id: string;
  name: string;
  location: string;
  surveyorName: string;
  surveyDate: string;
  surveyFloorCount: number;
  surveyUsageType: 'residential' | 'commercial' | 'hospital' | 'industrial';
  surveyShaftWidth: string; // e.g., "1600mm"
  surveyShaftDepth: string; // e.g., "1600mm"
  surveyTravelHeight: number; // in meters
}

interface QuotationSpec {
  linkedLeadId: string;
  driveType: 'hydraulic' | 'geared_traction' | 'gearless_traction' | 'mrl' | 'vacuum' | 'screw' | 'custom';
  capacityPersons: number;
  capacityKg: number;
  stopsCount: number;
  travelHeight: number;
  cabinFinishTier: 'standard' | 'premium' | 'luxury';
  doorType: 'manual_telescopic' | 'auto_telescopic' | 'auto_center_opening' | 'swing_manual';
  voltageRequirement: 'single_phase_220v' | 'three_phase_415v';
  speedMs: number; // speed in meters per second
  hasFiremanSwitch: boolean;
  hasArd: boolean; // Automatic Rescue Device
  notes: string;
}

export const QuotationInputSpecs: React.FC<{ user: any; onNavigateToPricing?: (specs: QuotationSpec) => void }> = ({ user, onNavigateToPricing }) => {
  const { language } = useLanguage();

  // Multi-language translation support
  const t = useMemo(() => {
    const localizations = {
      en: {
        title: "Quotation Specification Builder",
        subtitle: "Convert validated elevator shaft parameters into dynamic production estimates. Integrated with actual steel, gearless drive, and local GST tariffs.",
        selectLeadLabel: "Step 1: Link Validated Site Survey Lead",
        selectLeadDesc: "Import dimensions and architectural profiles directly captured by on-site technicians.",
        configSpecsLabel: "Step 2: Configuration & Technology Select",
        configSpecsDesc: "Configure drive technology, load capacity profiles, and cab aesthetic finishes.",
        auxiliaryLabel: "Step 3: Power & Safety Auxiliaries",
        auxiliaryDesc: "Select battery backup rescue systems, automatic doors, and power supplies.",
        reviewSubmitLabel: "Step 4: Compilation Review",
        reviewSubmitDesc: "Analyze final parameters and proceed to automated profit margin engineering.",
        
        surveySourcedBadge: "Survey Sourced",
        editedBadge: "Custom Override Active",
        manualConfigBtn: "Enable Specialized Configuration Review",
        highFloorWarning: "High-Rise Precaution: Buildings exceeding 20 stops require manual structural review. The automated calculator will flag this for engineering approval.",
        generateBtn: "Compile Costs & Review Profit Margins",
        saveDraftBtn: "Save Spec Draft",
        leadSearchPlaceholder: "Search surveyed leads...",
        driveTypeLabel: "Drive & Machine Type Selection",
        capacityLabel: "Load Capacity Specification",
        stopsLabel: "Total Stops / Openings",
        heightLabel: "Est. Travel Height (Meters)",
        finishLabel: "Cabin Interior Finish Tier",
        doorTypeLabel: "Landing / Cabin Door System",
        voltageLabel: "Electrical Power Source",
        speedLabel: "Configured Car Speed (m/s)",
        ardLabel: "Emergency Automatic Rescue Device (ARD)",
        firemanLabel: "Phase-II Fireman Safety Switch override",
        notesLabel: "Special Manufacturing Instructions",

        toastDraftSaved: "Draft configuration parameters saved safely to cloud synchronization nodes.",
        toastValidationFailed: "Please specify both machine drive type and cabin capacity weight before compiling.",
        toastOverrideActive: "Surveyor's floor specification overridden with custom sales values.",
        customRouteTitle: "Non-Standard Custom Manufacturing Path Required",
        customRouteDesc: "Selected criteria represents specialized hospital or high-capacity heavy freight. System will route to custom head-office design queue.",

        step1: "Link Survey",
        step2: "Lift Config",
        step3: "Auxiliaries",
        step4: "Review Spec",
        
        residential: "Residential Complex",
        commercial: "Commercial Office Block",
        hospital: "Hospital / Stretcher Lift",
        industrial: "Industrial / Freight Lift",

        hydraulic: "Hydraulic System (Low Rise, Smooth)",
        geared_traction: "Geared Traction (Moderate Speed)",
        gearless_traction: "Gearless Traction (High Efficiency)",
        mrl: "MRL - Machine Room-Less Traction",
        vacuum: "Vacuum / Pneumatic Residential Lift",
        screw: "Screw-Driven Platform Elevator",
        custom: "Specialized Bespoke Engineering"
      },
      hi: {
        title: "कोटेशन विशिष्टता निर्माता",
        subtitle: "सत्यापित लिफ्ट शाफ्ट मापदंडों को गतिशील उत्पादन अनुमानों में बदलें। वास्तविक स्टील, गियरलेस ड्राइव और स्थानीय जीएसटी टैरिफ के साथ एकीकृत।",
        selectLeadLabel: "चरण 1: सत्यापित साइट सर्वेक्षण लीड लिंक करें",
        selectLeadDesc: "तकनीशियनों द्वारा सीधे दर्ज की गई आयामों और वास्तुशिल्प प्रोफाइल को आयात करें।",
        configSpecsLabel: "चरण 2: विन्यास और प्रौद्योगिकी चयन",
        configSpecsDesc: "ड्राइव तकनीक, लोड क्षमता प्रोफाइल और केबिन सौंदर्य फिनिश कॉन्फ़िगर करें।",
        auxiliaryLabel: "चरण 3: पावर और सुरक्षा सहायक उपकरण",
        auxiliaryDesc: "बैटरी बैकअप बचाव प्रणाली, स्वचालित दरवाजे और बिजली की आपूर्ति चुनें।",
        reviewSubmitLabel: "चरण 4: संकलन समीक्षा",
        reviewSubmitDesc: "अंतिम मापदंडों का विश्लेषण करें और स्वचालित लाभ मार्जिन इंजीनियरिंग के लिए आगे बढ़ें।",
        
        surveySourcedBadge: "सर्वेक्षण से प्राप्त",
        editedBadge: "कस्टम ओवरराइड सक्रिय",
        manualConfigBtn: "विशेष विन्यास समीक्षा सक्षम करें",
        highFloorWarning: "उच्च मंजिला सावधानी: 20 से अधिक स्टॉप वाली इमारतों के लिए मैन्युअल संरचनात्मक समीक्षा की आवश्यकता होती है।",
        generateBtn: "लागत संकलित करें और लाभ मार्जिन की समीक्षा करें",
        saveDraftBtn: "विशिष्टता का ड्राफ्ट सहेजें",
        leadSearchPlaceholder: "सर्वेक्षण की गई लीड खोजें...",
        driveTypeLabel: "ड्राइव और मशीन प्रकार का चयन",
        capacityLabel: "लोड क्षमता विशिष्टता",
        stopsLabel: "कुल स्टॉप / उद्घाटन",
        heightLabel: "अनुमानित यात्रा ऊंचाई (मीटर)",
        finishLabel: "केबिन इंटीरियर फिनिश टियर",
        doorTypeLabel: "लैंडिंग / केबिन दरवाजा प्रणाली",
        voltageLabel: "विद्युत बिजली स्रोत",
        speedLabel: "कॉन्फ़िगर कार गति (मीटर/सेकंड)",
        ardLabel: "आपातकालीन स्वचालित बचाव उपकरण (ARD)",
        firemanLabel: "फेज-II फायरमैन सुरक्षा स्विच ओवरराइड",
        notesLabel: "विशेष निर्माण निर्देश",

        toastDraftSaved: "ड्राफ्ट विन्यास पैरामीटर क्लाउड सिंक्रोनाइज़ेशन नोड्स में सुरक्षित रूप से सहेजे गए।",
        toastValidationFailed: "संकलित करने से पहले मशीन ड्राइव प्रकार और केबिन क्षमता वजन दोनों निर्दिष्ट करें।",
        toastOverrideActive: "सर्वेक्षक की मंजिला विशिष्टता को कस्टम बिक्री मानों के साथ ओवरराइड किया गया।",
        customRouteTitle: "गैर-मानक कस्टम विनिर्माण पथ आवश्यक",
        customRouteDesc: "चयनित मानदंड विशिष्ट अस्पताल या भारी माल ढुलाई लिफ्ट का प्रतिनिधित्व करते हैं। मुख्यालय टीम इसकी मैन्युअल समीक्षा करेगी।",

        step1: "सर्वे लिंक",
        step2: "लिफ्ट कॉन्फ़िगरेशन",
        step3: "सहायक उपकरण",
        step4: "विशिष्टता समीक्षा",
        
        residential: "आवासीय परिसर",
        commercial: "वाणिज्यिक कार्यालय ब्लॉक",
        hospital: "अस्पताल / स्ट्रेचर लिफ्ट",
        industrial: "औद्योगिक / माल ढुलाई लिफ्ट",

        hydraulic: "हाइड्रोलिक प्रणाली (कम ऊंचाई, सुचारू)",
        geared_traction: "गियर्ड ट्रैक्शन (मध्यम गति)",
        gearless_traction: "गियरलेस ट्रैक्शन (उच्च दक्षता)",
        mrl: "MRL - मशीन रूम-रहित ट्रैक्शन",
        vacuum: "वैक्यूम / वायवीय आवासीय लिफ्ट",
        screw: "स्क्रू-ड्रिवेन प्लेटफॉर्म लिफ्ट",
        custom: "विशेषीकृत बेस्पोक इंजीनियरिंग"
      },
      mr: {
        title: "कोटेशन तपशील निर्माता",
        subtitle: "सत्यापित लिफ्ट शाफ्ट पॅरामीटर्सना डायनॅमिक उत्पादन अंदाजपत्रकामध्ये रूपांतरित करा. थेट स्टील, गिअरलेस ड्राइव्ह आणि जीएसटी दरांशी जोडलेले.",
        selectLeadLabel: "टप्पा १: सत्यापित साइट सर्व्हे लीड लिंक करा",
        selectLeadDesc: "तंत्रज्ञांनी प्रत्यक्ष जागेवर मोजलेले परिमाण आणि इमारतीचे तपशील आयात करा.",
        configSpecsLabel: "टप्पा २: कॉन्फिगरेशन आणि तंत्रज्ञान निवडा",
        configSpecsDesc: "ड्राइव्ह तंत्रज्ञान, भार क्षमता प्रोफाईल आणि केबिनचे सौंदर्य डिझाईन निश्चित करा.",
        auxiliaryLabel: "टप्पा ३: पॉवर आणि सुरक्षा सहाय्यक साधने",
        auxiliaryDesc: "बॅटरी बॅकअप सुरक्षा प्रणाली, स्वयंचलित दरवाजे आणि मुख्य वीज पुरवठा निवडा.",
        reviewSubmitLabel: "टप्पा ४: अंतिम पडताळणी",
        reviewSubmitDesc: "अंतिम पॅरामीटर्सचे विश्लेषण करा आणि स्वयंचलित नफा मार्जिन व्यवस्थापनासाठी पुढे जा.",
        
        surveySourcedBadge: "सर्व्हेमधून आलेले",
        editedBadge: "कस्टम बदल सक्रिय",
        manualConfigBtn: "विशेष कॉन्फिगरेशन पुनरावलोकन सक्षम करा",
        highFloorWarning: "उंच इमारतीची खबरदारी: २० मजल्यांपेक्षा जास्त असलेल्या इमारतींसाठी मॅन्युअल स्ट्रक्चरल पुनरावलोकन आवश्यक आहे.",
        generateBtn: "खर्च संकलित करा आणि नफा मार्गदर्शक तपासा",
        saveDraftBtn: "तपशील मसुदा जतन करा",
        leadSearchPlaceholder: "सर्व्हे केलेल्या लीड्स शोधा...",
        driveTypeLabel: "ड्राइव्ह आणि मशीन प्रकार निवडा",
        capacityLabel: "वजन क्षमता तपशील",
        stopsLabel: "एकूण थांबे / मजले",
        heightLabel: "अंदाजित उंची (मीटर)",
        finishLabel: "केबिन अंतर्गत सौंदर्य डिझाईन",
        doorTypeLabel: "स्वयंचलित/मॅन्युअल दरवाजा यंत्रणा",
        voltageLabel: "विद्युत पुरवठा स्त्रोत",
        speedLabel: "लिफ्टचा वेग (मीटर/सेकंद)",
        ardLabel: "आपत्कालीन स्वयंचलित बचाव यंत्रणा (ARD)",
        firemanLabel: "फेज-II फायरमन सुरक्षा स्विच ओव्हरराइड",
        notesLabel: "विशेष मॅन्युफॅक्चरिंग सूचना",

        toastDraftSaved: "मसुदा कॉन्फिगरेशन पॅरामीटर्स सुरक्षितपणे जतन केले गेले आहेत.",
        toastValidationFailed: "खर्च संकलित करण्यापूर्वी कृपया ड्राइव्ह प्रकार आणि केबिन क्षमता दोन्ही निवडा.",
        toastOverrideActive: "सर्व्हे मधील मजले आणि मोजमाप कस्टम सेल्स मूल्यांसह बदलले गेले आहेत.",
        customRouteTitle: "विशेष मॅन्युफॅक्चरिंग मार्ग आवश्यक",
        customRouteDesc: "निवडलेले निकष रुग्णालय किंवा जड माल वाहतूक दर्शवतात. मुख्यालय डिझाईन टीम मॅन्युअल कोट तयार करेल.",

        step1: "सर्व्हे लिंक",
        step2: "लिफ्ट कॉन्फिगरेशन",
        step3: "सुरक्षा/पॉवर",
        step4: "तपशील पुनरावलोकन",
        
        residential: "निवासी इमारत",
        commercial: "व्यावसायिक कार्यालय",
        hospital: "रुग्णालय / स्ट्रेचर लिफ्ट",
        industrial: "औद्योगिक / माल वाहतूक लिफ्ट",

        hydraulic: "हायड्रॉलिक सिस्टीम (कमी उंची, गुळगुळीत)",
        geared_traction: "गिअर्ड ट्रॅक्शन (मध्यम वेग)",
        gearless_traction: "गिअरलेस ट्रॅक्शन (उच्च कार्यक्षमता)",
        mrl: "MRL - मशिन रूम-रहित ट्रॅक्शन",
        vacuum: "व्हॅक्यूम / न्यूमॅटिक निवासी लिफ्ट",
        screw: "स्क्रू-ड्रिव्हन प्लॅटफॉर्म लिफ्ट",
        custom: "विशेषीकृत बेस्पोक इंजिनिअरिंग"
      }
    };
    return localizations[language] || localizations.en;
  }, [language]);

  // Pre-seed Surveyed Leads database
  const surveyedLeads: SurveyedLead[] = useMemo(() => [
    {
      id: "lead_srv_001",
      name: "Ramesh Patil's Royal Palace Complex",
      location: "Kothrud, Pune",
      surveyorName: "Vikram Rathi",
      surveyDate: "2026-07-08",
      surveyFloorCount: 5,
      surveyUsageType: 'residential',
      surveyShaftWidth: "1600mm",
      surveyShaftDepth: "1600mm",
      surveyTravelHeight: 15
    },
    {
      id: "lead_srv_002",
      name: "Deshmukh IT Hub Building B",
      location: "Kharadi Tech Park, Pune",
      surveyorName: "Sanjay Mane",
      surveyDate: "2026-07-09",
      surveyFloorCount: 12,
      surveyUsageType: 'commercial',
      surveyShaftWidth: "2100mm",
      surveyShaftDepth: "1900mm",
      surveyTravelHeight: 38
    },
    {
      id: "lead_srv_003",
      name: "Noble Multi-Specialty Hospital Wing D",
      location: "Hadapsar, Pune",
      surveyorName: "Vijay Shinde",
      surveyDate: "2026-07-10",
      surveyFloorCount: 8,
      surveyUsageType: 'hospital',
      surveyShaftWidth: "1800mm",
      surveyShaftDepth: "2600mm",
      surveyTravelHeight: 25
    },
    {
      id: "lead_srv_004",
      name: "Skyview Heights Co-Op Society",
      location: "Baner Highway, Pune",
      surveyorName: "Sanjay Mane",
      surveyDate: "2026-07-11",
      surveyFloorCount: 22, // High floor count edge case!
      surveyUsageType: 'residential',
      surveyShaftWidth: "1700mm",
      surveyShaftDepth: "1700mm",
      surveyTravelHeight: 68
    }
  ], []);

  // Wizard active step node (1 to 4)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('lead_srv_001');
  const [toastMsg, setToastMsg] = useState<string>('');

  // Form Specs State
  const [driveType, setDriveType] = useState<QuotationSpec['driveType']>('gearless_traction');
  const [capacityPersons, setCapacityPersons] = useState<number>(6);
  const [capacityKg, setCapacityKg] = useState<number>(408);
  const [stopsCount, setStopsCount] = useState<number>(5);
  const [travelHeight, setTravelHeight] = useState<number>(15);
  const [cabinFinishTier, setCabinFinishTier] = useState<QuotationSpec['cabinFinishTier']>('premium');
  const [doorType, setDoorType] = useState<QuotationSpec['doorType']>('auto_telescopic');
  const [voltageRequirement, setVoltageRequirement] = useState<QuotationSpec['voltageRequirement']>('three_phase_415v');
  const [speedMs, setSpeedMs] = useState<number>(1.0);
  const [hasFiremanSwitch, setHasFiremanSwitch] = useState<boolean>(true);
  const [hasArd, setHasArd] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // Track overrides from the base surveyor specs
  const [isFloorOverridden, setIsFloorOverridden] = useState<boolean>(false);
  const [isHeightOverridden, setIsHeightOverridden] = useState<boolean>(false);

  // Load selected lead data on change
  const selectedLead = useMemo(() => {
    return surveyedLeads.find(l => l.id === selectedLeadId) || surveyedLeads[0];
  }, [selectedLeadId, surveyedLeads]);

  // Set default configurations whenever selected lead changes
  useEffect(() => {
    if (selectedLead) {
      setStopsCount(selectedLead.surveyFloorCount);
      setTravelHeight(selectedLead.surveyTravelHeight);
      setIsFloorOverridden(false);
      setIsHeightOverridden(false);

      // Intelligent configuration pre-fill matching elevator technology standards:
      if (selectedLead.surveyUsageType === 'residential') {
        setDriveType('geared_traction');
        setCapacityPersons(6);
        setCapacityKg(408);
        setCabinFinishTier('standard');
        setDoorType('manual_telescopic');
        setVoltageRequirement('three_phase_415v');
        setSpeedMs(1.0);
      } else if (selectedLead.surveyUsageType === 'commercial') {
        setDriveType('gearless_traction');
        setCapacityPersons(10);
        setCapacityKg(680);
        setCabinFinishTier('premium');
        setDoorType('auto_center_opening');
        setVoltageRequirement('three_phase_415v');
        setSpeedMs(1.5);
      } else if (selectedLead.surveyUsageType === 'hospital') {
        setDriveType('mrl');
        setCapacityPersons(15);
        setCapacityKg(1020);
        setCabinFinishTier('premium');
        setDoorType('auto_telescopic');
        setVoltageRequirement('three_phase_415v');
        setSpeedMs(1.0);
      } else {
        setDriveType('hydraulic');
        setCapacityPersons(20);
        setCapacityKg(1360);
        setCabinFinishTier('standard');
        setDoorType('swing_manual');
        setVoltageRequirement('three_phase_415v');
        setSpeedMs(0.5);
      }
    }
  }, [selectedLeadId, selectedLead]);

  // Save drafts locally
  const saveDraft = () => {
    const draft: QuotationSpec = {
      linkedLeadId: selectedLeadId,
      driveType,
      capacityPersons,
      capacityKg,
      stopsCount,
      travelHeight,
      cabinFinishTier,
      doorType,
      voltageRequirement,
      speedMs,
      hasFiremanSwitch,
      hasArd,
      notes
    };
    localStorage.setItem('aiec_last_quotation_draft', JSON.stringify(draft));
    triggerToast(t.toastDraftSaved);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Adjust Persons and link the standard capacity in kg (68kg per standard person rule)
  const handlePersonsChange = (p: number) => {
    setCapacityPersons(p);
    setCapacityKg(p * 68);
  };

  const handleNextStep = () => {
    if (activeStep < 4) {
      setActiveStep(activeStep + 1);
    } else {
      handleFinalCompilation();
    }
  };

  const handleBackStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleFinalCompilation = () => {
    if (!driveType || !capacityPersons) {
      triggerToast(t.toastValidationFailed);
      return;
    }

    const compiledSpec: QuotationSpec = {
      linkedLeadId: selectedLeadId,
      driveType,
      capacityPersons,
      capacityKg,
      stopsCount,
      travelHeight,
      cabinFinishTier,
      doorType,
      voltageRequirement,
      speedMs,
      hasFiremanSwitch,
      hasArd,
      notes
    };

    localStorage.setItem('aiec_active_quote_spec', JSON.stringify(compiledSpec));
    
    // Call navigations if defined, otherwise trigger complete alert
    if (onNavigateToPricing) {
      onNavigateToPricing(compiledSpec);
    } else {
      triggerToast(`Success! Spec Compiled. Redirecting to Pricing Engine downstream... Drive Type: ${driveType.toUpperCase()}`);
    }
  };

  // Filter leads
  const filteredLeads = useMemo(() => {
    return surveyedLeads.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.surveyorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [surveyedLeads, searchQuery]);

  // Ascension Steps Mapping
  const wizardSteps = [
    { id: '1', label: t.step1, completed: activeStep > 1, active: activeStep === 1 },
    { id: '2', label: t.step2, completed: activeStep > 2, active: activeStep === 2 },
    { id: '3', label: t.step3, completed: activeStep > 3, active: activeStep === 3 },
    { id: '4', label: t.step4, completed: activeStep > 4, active: activeStep === 4 }
  ];

  // Helper flags for edge cases
  const isHighRise = stopsCount >= 20;
  const isSpecializedLift = selectedLead.surveyUsageType === 'hospital' || capacityKg > 1500;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast alert system */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0E4B3D] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Dual Progress Bar Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Auto-Quotation Engine Module Progress (Screen 1 of 10)</span>
            <span>10.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '10%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 61 of 200)</span>
            <span>30.5%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '30.5%' }} />
          </div>
        </div>
      </div>

      {/* Header section with brand context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            AUTO-QUOTATION ENGINE • MODULE 7 • SCREEN 1
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2A2723] tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={saveDraft}
            variant="secondary"
            className="text-xs font-bold py-2.5 px-4 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{t.saveDraftBtn}</span>
          </Button>
        </div>
      </div>

      {/* Horizontal Ascension Line Node Steps */}
      <div className="bg-white p-6 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <AscensionLine steps={wizardSteps} orientation="horizontal" className="max-w-4xl mx-auto" />
      </div>

      {/* Main Form/Selector Steps Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main interactive form card left side */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: Link survey lead */}
          {activeStep === 1 && (
            <Card className="p-6 bg-white space-y-6">
              <div className="border-b border-[rgba(184,135,61,0.15)] pb-4">
                <h3 className="font-serif text-lg font-bold text-charcoal">{t.selectLeadLabel}</h3>
                <p className="text-xs text-warmgray mt-1">{t.selectLeadDesc}</p>
              </div>

              {/* Lead searching input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.leadSearchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl pl-4 pr-12 py-3 text-xs font-bold text-charcoal focus:outline-none"
                />
              </div>

              {/* Grid lists of leads with survey stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLeadId === lead.id;
                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${
                        isSelected 
                          ? 'bg-alabaster border-antiquegold ring-1 ring-antiquegold/30' 
                          : 'bg-white border-[rgba(184,135,61,0.12)] hover:bg-alabaster/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif text-xs font-bold text-charcoal line-clamp-1">{lead.name}</h4>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded shrink-0 uppercase ${
                            lead.surveyUsageType === 'hospital' ? 'bg-red-50 text-error' : 'bg-emerald-50 text-royalemerald'
                          }`}>
                            {t[lead.surveyUsageType] || lead.surveyUsageType}
                          </span>
                        </div>
                        <p className="text-[10px] text-warmgray font-semibold">{lead.location}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border-t border-[#e5dfd4]/40 pt-2 text-[10px] font-mono">
                        <div>
                          <span className="block text-warmgray text-[8px] uppercase">Floors</span>
                          <span className="block text-charcoal font-black">{lead.surveyFloorCount} stops</span>
                        </div>
                        <div>
                          <span className="block text-warmgray text-[8px] uppercase">Shaft</span>
                          <span className="block text-charcoal font-black">{lead.surveyShaftWidth} x {lead.surveyShaftDepth}</span>
                        </div>
                        <div>
                          <span className="block text-warmgray text-[8px] uppercase">Travel</span>
                          <span className="block text-charcoal font-black">{lead.surveyTravelHeight} m</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-[#e5dfd4]/40 pt-2 text-[8px] font-mono text-warmgray">
                        <span>Surveyor: {lead.surveyorName}</span>
                        <span>{lead.surveyDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Linked parameters preview indicators */}
              {selectedLead && (
                <div className="p-4 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                    <CheckCircle className="w-4 h-4 text-royalemerald" />
                    <span>Lead data linked successfully: {selectedLead.name}</span>
                  </div>
                  <p className="text-xs text-warmgray leading-relaxed font-medium">
                    The Auto-Quotation system has automatically locked down structural constraints based on the shaft dimension survey. The matching drive type, doors, and capacity estimates have been computed dynamically.
                  </p>
                </div>
              )}

            </Card>
          )}

          {/* STEP 2: Lift Configuration Picker */}
          {activeStep === 2 && (
            <Card className="p-6 bg-white space-y-6">
              <div className="border-b border-[rgba(184,135,61,0.15)] pb-4">
                <h3 className="font-serif text-lg font-bold text-charcoal">{t.configSpecsLabel}</h3>
                <p className="text-xs text-warmgray mt-1">{t.configSpecsDesc}</p>
              </div>

              {/* Configuration select drive technology */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono flex justify-between">
                  <span>{t.driveTypeLabel}</span>
                  <Badge status="quoted" className="text-[9px] font-mono" />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['geared_traction', 'gearless_traction', 'mrl', 'hydraulic', 'vacuum', 'screw', 'custom'] as const).map((type) => {
                    const isSelected = driveType === type;
                    return (
                      <div
                        key={type}
                        onClick={() => setDriveType(type)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'bg-alabaster border-antiquegold ring-1 ring-antiquegold/30' 
                            : 'bg-white border-[#e5dfd4] hover:bg-alabaster/40'
                        }`}
                      >
                        <span className="text-xs font-bold text-charcoal">{t[type]}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-antiquegold bg-antiquegold text-white' : 'border-neutral-300'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Capacity select (Persons & KG) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                    {t.capacityLabel} (Persons)
                  </label>
                  <select
                    value={capacityPersons}
                    onChange={(e) => handlePersonsChange(parseInt(e.target.value))}
                    className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                  >
                    {[4, 6, 8, 10, 13, 15, 20].map(p => (
                      <option key={p} value={p}>{p} Persons</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                    Total Load Capacity (Kilograms)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={capacityKg}
                      onChange={(e) => setCapacityKg(parseInt(e.target.value))}
                      className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                    />
                    <span className="absolute right-3 top-3.5 text-xs text-warmgray font-mono font-bold">KG</span>
                  </div>
                </div>
              </div>

              {/* Stops and Travel height fields with Survey link indicator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                      {t.stopsLabel}
                    </label>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                      isFloorOverridden ? 'bg-amber-100 text-antiquegold font-extrabold' : 'bg-emerald-50 text-royalemerald'
                    }`}>
                      {isFloorOverridden ? t.editedBadge : t.surveySourcedBadge}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={stopsCount}
                    onChange={(e) => {
                      setStopsCount(parseInt(e.target.value));
                      setIsFloorOverridden(true);
                    }}
                    className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                      {t.heightLabel}
                    </label>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                      isHeightOverridden ? 'bg-amber-100 text-antiquegold font-extrabold' : 'bg-emerald-50 text-royalemerald'
                    }`}>
                      {isHeightOverridden ? t.editedBadge : t.surveySourcedBadge}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={travelHeight}
                      onChange={(e) => {
                        setTravelHeight(parseInt(e.target.value));
                        setIsHeightOverridden(true);
                      }}
                      className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                    />
                    <span className="absolute right-3 top-3.5 text-xs text-warmgray font-mono font-bold">METERS</span>
                  </div>
                </div>
              </div>

              {/* Cabin interior finish tier */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                  {t.finishLabel}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['standard', 'premium', 'luxury'] as const).map((tier) => {
                    const isSelected = cabinFinishTier === tier;
                    return (
                      <div
                        key={tier}
                        onClick={() => setCabinFinishTier(tier)}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all capitalize font-bold text-xs ${
                          isSelected 
                            ? 'bg-alabaster border-antiquegold text-charcoal ring-1 ring-antiquegold/30' 
                            : 'bg-white border-[#e5dfd4] text-warmgray hover:bg-alabaster/40'
                        }`}
                      >
                        {tier}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Warn on override if user did custom value */}
              {(isFloorOverridden || isHeightOverridden) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-amber-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{t.toastOverrideActive}</span>
                </div>
              )}

            </Card>
          )}

          {/* STEP 3: Auxiliary & Safety */}
          {activeStep === 3 && (
            <Card className="p-6 bg-white space-y-6">
              <div className="border-b border-[rgba(184,135,61,0.15)] pb-4">
                <h3 className="font-serif text-lg font-bold text-charcoal">{t.auxiliaryLabel}</h3>
                <p className="text-xs text-warmgray mt-1">{t.auxiliaryDesc}</p>
              </div>

              {/* Door Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                  {t.doorTypeLabel}
                </label>
                <select
                  value={doorType}
                  onChange={(e) => setDoorType(e.target.value as any)}
                  className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                >
                  <option value="auto_telescopic">Automatic Side-Opening Telescopic Doors</option>
                  <option value="auto_center_opening">Automatic Center-Opening Premium Doors</option>
                  <option value="manual_telescopic">Manual Telescopic Gate System</option>
                  <option value="swing_manual">Bespoke Manual Swing Door</option>
                </select>
              </div>

              {/* Voltage & Speed Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                    {t.voltageLabel}
                  </label>
                  <select
                    value={voltageRequirement}
                    onChange={(e) => setVoltageRequirement(e.target.value as any)}
                    className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                  >
                    <option value="three_phase_415v">3-Phase 415V Power (Recommended)</option>
                    <option value="single_phase_220v">Single-Phase 220V (Low-capacity systems only)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                    {t.speedLabel}
                  </label>
                  <select
                    value={speedMs}
                    onChange={(e) => setSpeedMs(parseFloat(e.target.value))}
                    className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                  >
                    <option value="0.5">0.5 m/s (Low speed/Hydraulic)</option>
                    <option value="1.0">1.0 m/s (Standard residential)</option>
                    <option value="1.5">1.5 m/s (High-efficiency passenger)</option>
                    <option value="2.0">2.0 m/s (High rise/Express)</option>
                  </select>
                </div>
              </div>

              {/* Toggles for ARD and Fireman Switches */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-alabaster rounded-xl border border-[#e5dfd4]/60">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-charcoal block">{t.ardLabel}</span>
                    <span className="text-[10px] text-warmgray block">Ensures automatic elevator alignment to nearest floor during power loss.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={hasArd} 
                      onChange={(e) => setHasArd(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#e5dfd4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royalemerald"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-alabaster rounded-xl border border-[#e5dfd4]/60">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-charcoal block">{t.firemanLabel}</span>
                    <span className="text-[10px] text-warmgray block">Enables firefighter override key control inside the cabin ground panel.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={hasFiremanSwitch} 
                      onChange={(e) => setHasFiremanSwitch(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#e5dfd4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royalemerald"></div>
                  </label>
                </div>
              </div>

            </Card>
          )}

          {/* STEP 4: Review Summary Spec */}
          {activeStep === 4 && (
            <Card className="p-6 bg-white space-y-6">
              <div className="border-b border-[rgba(184,135,61,0.15)] pb-4">
                <h3 className="font-serif text-lg font-bold text-charcoal">{t.reviewSubmitLabel}</h3>
                <p className="text-xs text-warmgray mt-1">{t.reviewSubmitDesc}</p>
              </div>

              {/* Review summary specs details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-alabaster p-4 rounded-xl border border-[#e5dfd4]/50">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-mono text-warmgray">Linked Building Lead</span>
                    <span className="text-xs font-serif font-bold text-charcoal block">{selectedLead.name}</span>
                    <span className="text-[10px] text-warmgray block">{selectedLead.location}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-mono text-warmgray">Drive System Selected</span>
                    <span className="text-xs font-bold text-charcoal block capitalize">{driveType.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-[#e5dfd4]/40 py-4 text-center">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-warmgray block">Stops / Openings</span>
                    <span className="text-base font-serif font-black text-charcoal">{stopsCount} stops</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-warmgray block">Cabin Capacity</span>
                    <span className="text-base font-serif font-black text-charcoal">{capacityPersons} Pax ({capacityKg} kg)</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-warmgray block">Travel Height</span>
                    <span className="text-base font-serif font-black text-charcoal">{travelHeight} meters</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-warmgray">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-warmgray block mb-0.5">Interior finish tier</span>
                    <span className="text-charcoal capitalize">{cabinFinishTier} cab style</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-warmgray block mb-0.5">Car Speed</span>
                    <span className="text-charcoal">{speedMs} meters / second</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-warmgray block mb-0.5">Automatic doors</span>
                    <span className="text-charcoal capitalize">{doorType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-warmgray block mb-0.5">Voltage source</span>
                    <span className="text-charcoal capitalize">{voltageRequirement.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Manufacturing notes text area */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                    {t.notesLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Include gold finish cabin handrails, standard glass ceiling model"
                    className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold"
                  />
                </div>
              </div>

            </Card>
          )}

          {/* Navigation Action Buttons footer */}
          <div className="flex items-center justify-between pt-2">
            <Button
              onClick={handleBackStep}
              variant="secondary"
              className={`text-xs font-bold py-2.5 px-4 flex items-center gap-1.5 ${
                activeStep === 1 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              disabled={activeStep === 1}
            >
              <ArrowLeft className="w-4 h-4 text-warmgray" />
              <span>Back</span>
            </Button>

            <Button
              onClick={handleNextStep}
              variant={activeStep === 4 ? 'emerald' : 'primary'}
              className="text-xs font-bold py-2.5 px-5 flex items-center gap-1.5"
            >
              <span>{activeStep === 4 ? t.generateBtn : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </div>

        {/* Right sidebar details & edge case alerts */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick specs helper / Shaft parameters validator */}
          <Card className="p-6 bg-white space-y-4">
            <div className="border-b border-[rgba(184,135,61,0.15)] pb-3">
              <div className="flex items-center gap-1.5">
                <Building className="w-5 h-5 text-antiquegold" />
                <h4 className="font-serif text-sm font-bold text-charcoal">Structural Verification</h4>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-warmgray">
              <div>
                <span className="text-[9px] uppercase font-mono block">Surveyed usage type</span>
                <span className="text-charcoal capitalize block">{selectedLead.surveyUsageType} elevator standard</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] uppercase font-mono block">Shaft Width</span>
                  <span className="text-charcoal block font-mono">{selectedLead.surveyShaftWidth}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono block">Shaft Depth</span>
                  <span className="text-charcoal block font-mono">{selectedLead.surveyShaftDepth}</span>
                </div>
              </div>
              <div>
                <span className="text-[9px] uppercase font-mono block">Recommended machine</span>
                <span className="text-royalemerald block">
                  {selectedLead.surveyUsageType === 'residential' 
                    ? 'Geared / Compact MRL System' 
                    : 'Heavy Duty PMSM Gearless Machine'}
                </span>
              </div>
            </div>
          </Card>

          {/* Edge cases triggers - High floor count warnings */}
          {isHighRise && (
            <div className="p-4 bg-red-50 border border-[#B23B3B]/20 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#B23B3B] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#B23B3B] uppercase tracking-wider font-mono">
                  High-Rise Safety Warning
                </h4>
                <p className="text-xs text-[#B23B3B]/80 font-semibold leading-relaxed">
                  {t.highFloorWarning}
                </p>
              </div>
            </div>
          )}

          {/* Specialized bespoke configurations */}
          {isSpecializedLift && (
            <div className="p-4 bg-amber-50 border border-antiquegold/20 rounded-xl flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-antiquegold shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono">
                    {t.customRouteTitle}
                  </h4>
                  <p className="text-xs text-amber-700 font-semibold">
                    {t.customRouteDesc}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setDriveType('custom');
                  triggerToast("Custom bespoke design mode enabled.");
                }}
                className="text-[10px] bg-white border-antiquegold/20 text-antiquegold hover:bg-amber-50 py-1.5 px-3"
              >
                {t.manualConfigBtn}
              </Button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
