import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, ShieldCheck, CheckCircle2, ChevronRight, Download, Edit,
  Sparkles, RefreshCw, AlertTriangle, Printer, Key, Landmark, Layers,
  ExternalLink, UserCheck, HelpCircle, ArrowRight, BookOpen, Plus, Trash2, Shield
} from 'lucide-react';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';

// Localization resources
const localizations = {
  en: {
    title: "Digital Contract Builder",
    subtitle: "Generate, preview, and review legally-binding elevator contracts with state-specific Lift Act clauses and plain-language translations.",
    generateBtn: "Generate Legal Contract",
    regenerateBtn: "Regenerate Contract Draft",
    downloadBtn: "Download PDF Draft",
    signHandoffBtn: "Proceed to E-Signature Capture",
    contractDetailsHeader: "Contract Summary",
    draftVersion: "Contract Version Locked",
    linkedDeal: "Linked Deal ID",
    stateRules: "Applied Regulatory Standards",
    plainLanguageSummary: "Plain-Language Safety Guide",
    plainSummaryDesc: "We decode standard legal clauses into transparent human explanations to guarantee our zero-liability engineering model.",
    fullContractText: "Official Certified Contract Text",
    stateTemplateMissing: "⚠️ Note: Site is located in {state}. No state-specific Lift Act template was found. Falling back to BIS Standards IS-14665 & NBC 2016 safety codes.",
    customAddendumLabel: "Attach Custom Procurement Addendum",
    customAddendumPlaceholder: "Add custom client conditions or special delivery clauses for Admin review...",
    customAddendumBtn: "Append Addendum",
    customAddendumAttached: "Custom Admin-reviewed addendum appended successfully.",
    legalDisclaimer: "All contract transactions are fully cryptographically locked under the Maharashtra Elevators Act guidelines.",
    aiecResponsibilities: "AIEC (Supervision & Equipment)",
    techResponsibilities: "Technician (Onsite Civil & Erection)",
    clientResponsibilities: "Client (Site Readiness & Supply)",
    liabilityDisclaimerTitle: "Commercial & Liability Allotments",
    viewingAs: "View Screen As:",
    stateLabel: "Customer Location State",
    gstLabel: "Final Sealed Amount",
    stateMH: "Maharashtra (Maharashtra Lift Act 1956 compliant)",
    stateKA: "Karnataka (Karnataka Lift Act compliant)",
    stateDL: "Delhi (National Building Code 2016 compliant)",
    stateOT: "Goa (Fallback National BIS IS-14665 compliant)",
    regenerateWarning: "Underlying Deal Terms changed. A new contract version is required to synchronize legal liabilities.",
    toastGenerated: "Legal contract successfully drafted and locked. State specific clauses matched.",
    toastRegenerated: "Prior contract superseded. Version {ver} drafted from updated Deal Terms.",
    toastSigned: "E-signature capture initialized."
  },
  hi: {
    title: "डिजिटल अनुबंध निर्माता",
    subtitle: "राज्य-विशिष्ट लिफ्ट अधिनियम खंडों और सरल-भाषा अनुवादों के साथ कानूनी रूप से बाध्यकारी लिफ्ट अनुबंध उत्पन्न करें और समीक्षा करें।",
    generateBtn: "कानूनी अनुबंध तैयार करें",
    regenerateBtn: "अनुबंध का मसौदा फिर से तैयार करें",
    downloadBtn: "पीडीएफ ड्राफ्ट डाउनलोड करें",
    signHandoffBtn: "ई-हस्ताक्षर कैप्चर पर आगे बढ़ें",
    contractDetailsHeader: "अनुबंध सारांश",
    draftVersion: "अनुबंध संस्करण लॉक है",
    linkedDeal: "लिंक्ड डील आईडी",
    stateRules: "लागू नियामक मानक",
    plainLanguageSummary: "सरल-भाषा सुरक्षा गाइड",
    plainSummaryDesc: "हम अपनी शून्य-दायित्व इंजीनियरिंग मॉडल की गारंटी के लिए पारदर्शी स्पष्टीकरण में मानक कानूनी खंडों को डिकोड करते हैं।",
    fullContractText: "आधिकारिक प्रमाणित अनुबंध पाठ",
    stateTemplateMissing: "⚠️ नोट: साइट {state} में स्थित है। कोई राज्य-विशिष्ट लिफ्ट अधिनियम टेम्पलेट नहीं मिला। बीआईएस मानकों आईएस-14665 और एनबीसी 2016 सुरक्षा कोड पर वापस जा रहे हैं।",
    customAddendumLabel: "कस्टम खरीद परिशिष्ट संलग्न करें",
    customAddendumPlaceholder: "व्यवस्थापक समीक्षा के लिए कस्टम ग्राहक शर्तें या विशेष वितरण खंड जोड़ें...",
    customAddendumBtn: "परिशिष्ट जोड़ें",
    customAddendumAttached: "कस्टम व्यवस्थापक-समीक्षित परिशिष्ट सफलतापूर्वक जोड़ा गया।",
    legalDisclaimer: "महाराष्ट्र लिफ्ट अधिनियम दिशानिर्देशों के तहत सभी अनुबंध लेनदेन पूरी तरह से लॉक हैं।",
    aiecResponsibilities: "AIEC (पर्यवेक्षण और उपकरण)",
    techResponsibilities: "तकनीशियन (साइट सिविल और इरेक्शन)",
    clientResponsibilities: "क्लाइंट (साइट तत्परता और बिजली आपूर्ति)",
    liabilityDisclaimerTitle: "वाणिज्यिक और देयता आवंटन",
    viewingAs: "स्क्रीन दृश्य भूमिका:",
    stateLabel: "ग्राहक स्थान राज्य",
    gstLabel: "अंतिम सील राशि",
    stateMH: "महाराष्ट्र (महाराष्ट्र लिफ्ट अधिनियम 1956 के तहत)",
    stateKA: "कर्नाटक (कर्नाटक लिफ्ट अधिनियम के तहत)",
    stateDL: "दिल्ली (राष्ट्रीय भवन कोड 2016 के तहत)",
    stateOT: "गोवा (राष्ट्रीय बीआईएस आईएस-14665 के तहत)",
    regenerateWarning: "अंतर्निहित डील शर्तों में बदलाव हुआ। कानूनी देयताओं को सिंक्रनाइज़ करने के लिए एक नए अनुबंध संस्करण की आवश्यकता है।",
    toastGenerated: "कानूनी अनुबंध सफलतापूर्वक तैयार और लॉक किया गया।",
    toastRegenerated: "पिछला अनुबंध निरस्त। नया संस्करण {ver} तैयार किया गया है।",
    toastSigned: "ई-हस्ताक्षर कैप्चर शुरू किया गया।"
  },
  mr: {
    title: "डिजिटल करारनामा निर्माता",
    subtitle: "राज्य-विशिष्ट लिफ्ट नियम अटी आणि सोप्या भाषेतील सारांश संवादासह लिफ्ट खरेदीचा अंतिम कायदेशीर करारनामा तयार करा.",
    generateBtn: "करारनामा तयार करा",
    regenerateBtn: "करारनामा पुन्हा तयार करा",
    downloadBtn: "पीडीएफ मसुदा डाऊनलोड करा",
    signHandoffBtn: "थेट ई-स्वाक्षरी प्रक्रियेकडे जा",
    contractDetailsHeader: "करारनामा सारांश",
    draftVersion: "करारनामा आवृत्ती लॉक",
    linkedDeal: "निश्चित सौदा (Deal) आयडी",
    stateRules: "लागू असलेले कायदेशीर नियम",
    plainLanguageSummary: "सोप्या भाषेतील ग्राहक सुरक्षा मार्गदर्शक",
    plainSummaryDesc: "कोणताही गैरसमज टाळण्यासाठी आणि जबाबदाऱ्यांची स्पष्ट विभागणी करण्यासाठी आम्ही कायदेशीर कलमांचे सोप्या भाषेत विश्लेषण करतो.",
    fullContractText: "अधिकृत कायदेशीर करारनामा मजकूर",
    stateTemplateMissing: "⚠️ नोंद: साइट {state} मध्ये आहे. या राज्यासाठी विशेष लिफ्ट अधिनियम उपलब्ध नाही. राष्ट्रीय BIS IS-14665 आणि NBC 2016 नियम लागू केले जात आहेत.",
    customAddendumLabel: "विशेष प्रशासकीय पुरवणी पत्र (Addendum) जोडा",
    customAddendumPlaceholder: "ग्राहकाची विशेष मागणी किंवा प्रशासक मंजुरीसाठी अतिरिक्त कायदेशीर अट लिहा...",
    customAddendumBtn: "पुरवणी पत्र जोडा",
    customAddendumAttached: "प्रशासक-मंजूर पुरवणी पत्र यशस्वीरित्या जोडले गेले.",
    legalDisclaimer: "सर्व करार व्यवहार महाराष्ट्र लिफ्ट अधिनियम सुरक्षा मार्गदर्शक तत्त्वांनुसार नोंदवले गेले आहेत.",
    aiecResponsibilities: "AIEC (तांत्रिक देखरेख व साहित्य पुरवठा)",
    techResponsibilities: "टेक्निशियन (जागेची उभारणी आणि यांत्रिक काम)",
    clientResponsibilities: "क्लाइंट (जागेची प्राथमिक तयारी आणि थ्री-फेज वीज पुरवठा)",
    liabilityDisclaimerTitle: "जबाबदारी व व्यावसायिक दायित्व विभागणी",
    viewingAs: "स्क्रीन दृश्य भूमिका:",
    stateLabel: "ग्राहकाचे राज्य",
    gstLabel: "अंतिम स्वाक्षरी रक्कम",
    stateMH: "महाराष्ट्र (महाराष्ट्र लिफ्ट अधिनियम १९५६ सुसंगत)",
    stateKA: "कर्नाटक (कर्नाटक लिफ्ट नियम सुसंगत)",
    stateDL: "दिल्ली (राष्ट्रीय इमारत संहिता २०१६ सुसंगत)",
    stateOT: "गोवा (राष्ट्रीय BIS IS-14665 सुसंगत)",
    regenerateWarning: "करार अटींमध्ये बदल झाला आहे. नवीन कायदेशीर दायित्व जुळवण्यासाठी कराराचा नवीन मसुदा आवश्यक आहे.",
    toastGenerated: "कायदेशीर करारनामा यशस्वीरीत्या तयार करून लॉक केला आहे.",
    toastRegenerated: "जुना करारनामा रद्द करून नवीन आवृत्ती {ver} तयार केली आहे.",
    toastSigned: "ई-स्वाक्षरी प्रक्रिया सक्रिय करण्यात आली."
  }
};

// Responsibilities structure mapping "no-liability" model
const liabilityResponsibilityData = [
  {
    role: "AIEC Supervision & Design",
    expl: "AIEC is solely responsible for supplying certified BIS (IS 14665) components, structural design clearance, and supervisory safety validation of the lift shaft erection. AIEC holds zero physical liability for structural building collapse or improper local masonry work.",
    color: "border-royalemerald/25 bg-royalemerald/5 text-[#0E4B3D]"
  },
  {
    role: "Technician & Erector Site Security",
    expl: "The authorized third-party installation engineer handles mechanical erection, bracket anchoring, safety gear tests, and wire rope tensioning. Any physical installation accident or tool injury onsite is the sole direct insurance liability of the technician/installer.",
    color: "border-indigo-200 bg-indigo-50/45 text-indigo-800"
  },
  {
    role: "Client Civil Preparedness",
    expl: "The client must deliver a plumb-line dry concrete shaft cavity, complete 3-phase power supply, hoist hook, and water protection. Any site delay, scaffolding collapse, or water leakage into pit is the exclusive commercial responsibility of the client.",
    color: "border-antiquegold/25 bg-antiquegold/5 text-[#B8873D]"
  }
];

export const DigitalContractGenerator: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const [activePersona, setActivePersona] = useState<'staff' | 'customer'>('staff');
  const [toastMsg, setToastMsg] = useState('');
  
  // Contract configuration parameters
  const [currentState, setCurrentState] = useState<'MH' | 'KA' | 'DL' | 'OT'>('MH');
  const [customAddendumText, setCustomAddendumText] = useState('');
  const [hasCustomAddendum, setHasCustomAddendum] = useState(false);
  const [isGenerated, setIsGenerated] = useState(true);
  const [contractVersion, setContractVersion] = useState(1);
  const [isTermsAmended, setIsTermsAmended] = useState(false);

  // Active translations
  const t = useMemo(() => {
    return localizations[language as 'en' | 'hi' | 'mr'] || localizations.en;
  }, [language]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // State-specific clauses selection
  const stateLiftActDetails = useMemo(() => {
    switch (currentState) {
      case 'MH':
        return {
          actTitle: "Maharashtra Lifts, Escalators and Moving Walks Act",
          secSection: "Section 11 (Inspections & Safety Clearance Certification)",
          complianceCode: "IS 14665:2000 & IS 15259 guidelines",
          clauses: [
            "AIEC shall facilitate submission of Form 'A' to the Public Works Department (Lifts Inspectorate) for the license setup.",
            "The concrete structure of the hoistway must comply with the physical specifications of the Maharashtra Municipal Corporation regulations.",
            "Mandatory dual-safety brakes and Automatic Rescue Device (ARD) must be certified by an approved national testing agency prior to final passenger commissioning."
          ]
        };
      case 'KA':
        return {
          actTitle: "Karnataka Lifts, Escalators and Passenger Conveyors Act",
          secSection: "Section 8 (SOP for Erection and Maintenance Operations)",
          complianceCode: "IS 14665:2018 Standards Compliance",
          clauses: [
            "Contractor must apply for preliminary installation permission with the Electrical Inspectorate before beginning mechanical layout anchoring.",
            "Full earthing layout specifications must comply with the Karnataka State Grid voltage regulations.",
            "Technician must hold a Class 'A' electrical lift contractor certification issued by the Government of Karnataka."
          ]
        };
      case 'DL':
        return {
          actTitle: "Delhi Lift Rules Compliance (National Building Code Part 8)",
          secSection: "Clause 3.4 (Emergency Evacuation & Fireman Override Protection)",
          complianceCode: "National Building Code (NBC) 2016 Compliant",
          clauses: [
            "The control system must hold a dedicated 'Fireman Switch' at the ground landing floor for automatic safety recall override.",
            "Double-insulated mechanical cables and flame-retardant wiring are mandatory for all structural components.",
            "Emergency ARD backup system must deploy and align cabin level with doors open within 15 seconds of power failure."
          ]
        };
      default:
        return null; // Fallback
    }
  }, [currentState]);

  // Handle building standard contract clauses text
  const standardAgreementContractText = useMemo(() => {
    const actName = stateLiftActDetails?.actTitle || "Bureau of Indian Standards (BIS) Lift Codes";
    const sectionName = stateLiftActDetails?.secSection || "General BIS IS 14665 Standards";
    return `ALL INDIA ELEVATORS CONTRACT AGREEMENT (REF: AIEC-CTR-${2000 + contractVersion})

1. COMMERCIAL SCOPE & PRICE CLEARANCE
This contract locks the transaction price of ₹11,20,000 (Eleven Lakhs Twenty Thousand Rupees only) for the manufacture, supervision, and final safety handover of the Aura Premium Gold Lift (VVVF stops: G+4). This price is bounded as per the verified Deal Terms (AIEC-DL-9081-V3) and cannot be manually modified by either party without creating a formal signed addendum.

2. STATE COMPLIANCE & SAFETY STANDARDS
Erection and technical design parameters strictly adhere to the guidelines of the ${actName}. As per the regulatory mandate under ${sectionName}, All India Elevators Company shall provide equipment satisfying structural BIS parameters, but the client must register civil lift shaft designs with regional public safety inspectorates.

3. WORKFLOW LIABILITY & "NO-LIABILITY" ALLOTMENT
- AIEC serves strictly as structural equipment providers and safety engineering supervisors. AIEC holds no commercial or civil liability for scaffolding safety, site civil concrete masonry errors, or non-AIEC technician site incidents.
- Erection mechanics are executed by certified technical erectors who bear individual onsite occupational insurance liability.
- Client is liable to provide the dry, waterproof elevator pit, three-phase power connectivity (415V, 50Hz), and a structural plumb-line hoistway conforming to approved technical sketches.

4. WARRANTY AND SERVICE GUARANTEES
Equipment is covered by a 24-Month Comprehensive Shield Warranty beginning from the date of final government license hand-over. Free quarterly service is included under the V3 discount AMC voucher scheme.`;
  }, [stateLiftActDetails, contractVersion]);

  // Simple plain-language translation of the legalese
  const plainLanguageTranslations = useMemo(() => {
    return [
      {
        heading: "Commercial Pricing Guarantee",
        legaleseRef: "Clause 1 (Commercial Scope)",
        humanTranslation: "The price is locked at ₹11,20,000. No surprise charges, no unexpected price inflation. Any change requires a completely new approved version."
      },
      {
        heading: "Local Safety Law Compliance",
        legaleseRef: "Clause 2 (State Compliance)",
        humanTranslation: currentState === 'OT' 
          ? "Your state has no custom local Lift Act yet, so we apply the rigorous National Building Code 2016 and Bureau of Indian Standards IS-14665 codes."
          : `We apply the specific laws of ${currentState === 'MH' ? 'Maharashtra' : currentState === 'KA' ? 'Karnataka' : 'Delhi'}. We prepare form drawings for you, and you must file them with the state electrical inspector.`,
      },
      {
        heading: "The Three-Party Responsibility Model",
        legaleseRef: "Clause 3 (Worksite Liability)",
        humanTranslation: "Responsibilities are strictly divided: AIEC provides high-quality certified machinery, the technician guarantees installation precision, and you provide a dry, secure shaft with three-phase power."
      }
    ];
  }, [currentState]);

  // Action: Generating fresh contract draft
  const handleGenerateContract = () => {
    setIsGenerated(true);
    setIsTermsAmended(false);
    triggerToast(t.toastGenerated);
  };

  // Action: Regenerating after an amendment
  const handleRegenerateContract = () => {
    setContractVersion(prev => prev + 1);
    setIsTermsAmended(false);
    setIsGenerated(true);
    triggerToast(t.toastRegenerated.replace('{ver}', `V${contractVersion + 1}`));
  };

  // Action: Simulate upstream deal terms changes
  const handleSimulateDealAmendment = () => {
    setIsTermsAmended(true);
    triggerToast("Alert: Deal terms were amended. Contract generation draft is out-of-sync!");
  };

  // Action: Adding Custom addendum
  const handleAddCustomAddendum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddendumText.trim()) return;
    setHasCustomAddendum(true);
    triggerToast(t.customAddendumAttached);
  };

  // Action: Clear Addendum
  const handleClearAddendum = () => {
    setCustomAddendumText('');
    setHasCustomAddendum(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast notifications */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-royalemerald text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/25 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress header strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Negotiation & Closing Progress (Screen 5 of 10)</span>
            <span>50.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '50%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 75 of 200)</span>
            <span>37.5%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '37.5%' }} />
          </div>
        </div>
      </div>

      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            MODULE 8 • DIGITAL LAW COMPLIANCE
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1 flex items-center gap-2">
            <FileText className="w-7 h-7 text-antiquegold" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Persona toggle */}
        <div className="bg-white p-1 rounded-xl border border-border flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-mono font-bold text-warmgray px-2 uppercase">{t.viewingAs}</span>
          <button
            onClick={() => setActivePersona('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePersona === 'staff' 
                ? 'bg-royalemerald text-white' 
                : 'text-charcoal hover:bg-alabaster'
            }`}
          >
            {language === 'hi' ? 'स्टाफ' : language === 'mr' ? 'प्रशासक' : 'Staff'}
          </button>
          <button
            onClick={() => setActivePersona('customer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePersona === 'customer' 
                ? 'bg-antiquegold text-white' 
                : 'text-charcoal hover:bg-alabaster'
            }`}
          >
            {language === 'hi' ? 'ग्राहक' : language === 'mr' ? 'ग्राहक' : 'Customer'}
          </button>
        </div>
      </div>

      {/* Hero Record Header */}
      <div className="bg-white rounded-2xl border border-border shadow-diffuse overflow-hidden text-left">
        <div className="bg-alabaster/40 p-5 border-b border-[#e5dfd4]/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-antiquegold font-extrabold uppercase bg-antiquegold/10 px-2 py-0.5 rounded">
                DEAL REFERENCE: AIEC-DL-9081
              </span>
              <Badge status={isGenerated ? "success" : "quoted"} className="text-[9px] uppercase">
                {isGenerated ? `${t.draftVersion} V${contractVersion}` : "Draft Missing"}
              </Badge>
            </div>
            <strong className="text-charcoal font-serif text-xl block">Karan Malhotra (Penthouse)</strong>
            <span className="text-xs text-warmgray font-bold block">Pratik Heights, Kothrud, Pune</span>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <span className="text-[9px] font-mono text-warmgray uppercase font-bold">{t.gstLabel}</span>
            <span className="text-2xl font-serif font-black text-royalemerald">
              ₹11,20,000
            </span>
            <span className="text-[9px] font-mono text-warmgray font-bold">Standard V3 Negotiated Price</span>
          </div>
        </div>

        {/* Dynamic Warning if deal terms changed downstream */}
        {isTermsAmended && (
          <div className="p-4 bg-red-50 text-[#B23B3B] text-xs font-bold border-t border-red-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{t.regenerateWarning}</p>
            </div>
            <button
              onClick={handleRegenerateContract}
              className="px-3 py-1.5 bg-[#B23B3B] hover:bg-red-700 text-white rounded-lg text-[10px] uppercase font-mono font-bold tracking-wider transition-all"
            >
              {t.regenerateBtn}
            </button>
          </div>
        )}
      </div>

      {/* Main interactive split work panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Regulatory Options, Plain-Language summary and Responsibilities */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* State regulatory selector (simulates location-based matching) */}
          <Card className="p-5 bg-white space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">
                {t.stateLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCurrentState('MH');
                    triggerToast("Matched Maharashtra Elevators Act 1956 regulations.");
                  }}
                  className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all ${
                    currentState === 'MH'
                      ? 'border-royalemerald bg-royalemerald/5 text-royalemerald ring-1 ring-royalemerald/25'
                      : 'border-neutral-100 bg-alabaster text-charcoal hover:bg-[#edeae2]'
                  }`}
                >
                  <span className="block font-serif">Maharashtra</span>
                  <span className="block text-[8px] font-mono text-warmgray font-medium">Act compliant</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentState('KA');
                    triggerToast("Matched Karnataka State Electrical Inspectorate templates.");
                  }}
                  className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all ${
                    currentState === 'KA'
                      ? 'border-royalemerald bg-royalemerald/5 text-royalemerald ring-1 ring-royalemerald/25'
                      : 'border-neutral-100 bg-alabaster text-charcoal hover:bg-[#edeae2]'
                  }`}
                >
                  <span className="block font-serif">Karnataka</span>
                  <span className="block text-[8px] font-mono text-warmgray font-medium">Act compliant</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentState('DL');
                    triggerToast("Matched National Building Code Fire recall requirements.");
                  }}
                  className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all ${
                    currentState === 'DL'
                      ? 'border-royalemerald bg-royalemerald/5 text-royalemerald ring-1 ring-royalemerald/25'
                      : 'border-neutral-100 bg-alabaster text-charcoal hover:bg-[#edeae2]'
                  }`}
                >
                  <span className="block font-serif">Delhi (NCR)</span>
                  <span className="block text-[8px] font-mono text-warmgray font-medium">NBC compliant</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentState('OT');
                    triggerToast("Triggered BIS Fallback Safety Protocol.");
                  }}
                  className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all ${
                    currentState === 'OT'
                      ? 'border-royalemerald bg-royalemerald/5 text-royalemerald ring-1 ring-royalemerald/25'
                      : 'border-neutral-100 bg-alabaster text-charcoal hover:bg-[#edeae2]'
                  }`}
                >
                  <span className="block font-serif">Other (Goa)</span>
                  <span className="block text-[8px] font-mono text-warmgray font-medium">BIS fallback rules</span>
                </button>
              </div>
            </div>

            {/* Display templates fallback message */}
            {currentState === 'OT' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] text-[#B23B3B] font-semibold leading-normal flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{t.stateTemplateMissing.replace('{state}', 'Goa')}</p>
              </div>
            )}
          </Card>

          {/* Plain-Language summary column (to simplify legalese) */}
          <Card className="p-5 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4]/40 pb-2">
              <h3 className="font-serif text-sm font-black text-charcoal flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-antiquegold" />
                <span>{t.plainLanguageSummary}</span>
              </h3>
              <p className="text-[10px] text-warmgray font-semibold leading-relaxed mt-0.5">
                {t.plainSummaryDesc}
              </p>
            </div>

            <div className="space-y-4">
              {plainLanguageTranslations.map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between text-[9px] font-mono font-bold text-antiquegold uppercase">
                    <span>{item.heading}</span>
                    <span>{item.legaleseRef}</span>
                  </div>
                  <p className="p-3 bg-alabaster border border-[#e5dfd4]/40 rounded-xl text-charcoal leading-relaxed font-semibold">
                    {item.humanTranslation}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Core Zero Liability Division allocations */}
          <Card className="p-5 bg-white space-y-4">
            <h3 className="font-serif text-sm font-black text-charcoal border-b border-[#e5dfd4]/40 pb-2">
              {t.liabilityDisclaimerTitle}
            </h3>

            <div className="space-y-3">
              {liabilityResponsibilityData.map((data, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-xs font-semibold leading-relaxed ${data.color}`}>
                  <strong className="block font-serif text-xs font-black mb-1">{data.role}</strong>
                  <p className="opacity-90">{data.expl}</p>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Right Side: Contract Full Text Preview & Custom Procurement Addendums */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Full certified contract text widget */}
          <Card className="p-5 bg-white space-y-4 flex flex-col h-[520px]">
            <div className="border-b border-[#e5dfd4]/40 pb-3 flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-warmgray font-bold uppercase">{t.draftVersion}</span>
                <h3 className="font-serif text-base font-black text-charcoal flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-royalemerald" />
                  <span>{t.fullContractText}</span>
                </h3>
              </div>

              {/* Utility print & download icons */}
              <div className="flex gap-1">
                <button 
                  onClick={() => triggerToast("Dispatching print command to localized network spool...")}
                  className="p-2 bg-alabaster border border-[#e5dfd4] hover:bg-[#edeae2] text-charcoal rounded-xl transition-all"
                  title="Print Document"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => triggerToast("Generating secure signed PDF file container...")}
                  className="p-2 bg-alabaster border border-[#e5dfd4] hover:bg-[#edeae2] text-charcoal rounded-xl transition-all"
                  title={t.downloadBtn}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document display viewport */}
            <div className="flex-1 p-4 bg-alabaster border border-[#e5dfd4]/60 rounded-xl overflow-y-auto font-mono text-[11px] leading-relaxed text-neutral-700 whitespace-pre-wrap select-all">
              {standardAgreementContractText}

              {/* Append custom addendum if attached */}
              {hasCustomAddendum && (
                <div className="mt-6 pt-4 border-t-2 border-dashed border-antiquegold/30 text-charcoal">
                  <p className="text-[11px] font-extrabold uppercase text-antiquegold">APPENDIX A: RECIPIENT AD-HOC CUSTOM COVENANT ADDENDUM</p>
                  <p className="italic mt-1">"{customAddendumText}"</p>
                  <p className="text-[9px] text-warmgray font-bold mt-2">SECURED AND APPROVED BY AIEC CHIEF ENGINEERING SUPERVISOR.</p>
                </div>
              )}
            </div>

            {/* Action Bottom Section */}
            <div className="pt-3 border-t border-[#e5dfd4]/40 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-[9px] text-warmgray font-semibold max-w-sm">
                *Contract was cryptographically version-locked based on active deal parameters. Direct edits inside text preview are legally restricted.
              </span>

              {/* Proceed E-Signature capture trigger */}
              <Button
                variant="emerald"
                onClick={() => triggerToast(t.toastSigned)}
                className="w-full sm:w-auto py-2.5 px-6 text-xs font-bold shrink-0"
              >
                <span>{t.signHandoffBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Custom procurement addendum editor */}
          <Card className="p-5 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4]/40 pb-2">
              <h4 className="font-serif text-sm font-black text-charcoal flex items-center gap-2">
                <Plus className="w-4 h-4 text-antiquegold" />
                <span>{t.customAddendumLabel}</span>
              </h4>
            </div>

            <form onSubmit={handleAddCustomAddendum} className="space-y-4 text-xs font-semibold">
              <textarea
                value={customAddendumText}
                onChange={(e) => setCustomAddendumText(e.target.value)}
                placeholder={t.customAddendumPlaceholder}
                disabled={hasCustomAddendum}
                rows={3}
                className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl text-charcoal text-xs leading-relaxed focus:outline-none focus:border-antiquegold"
              />

              <div className="flex justify-between items-center">
                {hasCustomAddendum ? (
                  <div className="flex items-center gap-2 text-royalemerald font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.customAddendumAttached}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-warmgray leading-normal">
                    This addendum is attached as a legally certified extension to avoid rewriting standard codes.
                  </span>
                )}

                <div className="flex gap-2">
                  {hasCustomAddendum && (
                    <button
                      type="button"
                      onClick={handleClearAddendum}
                      className="px-3 py-2 bg-red-50 text-[#B23B3B] hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  )}
                  
                  {!hasCustomAddendum && (
                    <Button
                      type="submit"
                      variant="outline"
                      className="py-2 px-4 text-xs font-bold"
                    >
                      <span>{t.customAddendumBtn}</span>
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Card>

          {/* Dev testing tools */}
          {activePersona === 'staff' && (
            <Card className="p-4 bg-amber-50/20 border border-antiquegold/15 space-y-2 text-left">
              <strong className="text-[10px] font-mono text-antiquegold uppercase block font-bold">
                🛠️ Staff Developer Testing Sandbox
              </strong>
              <p className="text-[10px] text-warmgray font-semibold leading-normal">
                Simulate the upstream scenario where the customer changes their configuration or negotiates a revised price after contract drafts exist.
              </p>
              <div className="pt-1">
                <button
                  onClick={handleSimulateDealAmendment}
                  className="px-3 py-1.5 bg-white text-antiquegold hover:bg-amber-50 border border-antiquegold/30 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Simulate Deal Revision Event
                </button>
              </div>
            </Card>
          )}

        </div>

      </div>

      {/* ISO compliance legal footer disclaimer */}
      <div className="p-4 bg-alabaster rounded-2xl border border-border text-center text-[10px] font-mono text-warmgray font-bold">
        🛡️ {t.legalDisclaimer}
      </div>

    </div>
  );
};
