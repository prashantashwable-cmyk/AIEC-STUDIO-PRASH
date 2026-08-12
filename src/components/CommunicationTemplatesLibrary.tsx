import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, MessageSquare, Phone, Check, AlertTriangle, AlertCircle, Plus,
  Save, RotateCcw, HelpCircle, Shield, Globe, Users, Trash2, Edit2, Sparkles,
  ChevronRight, RefreshCw, Send, Search, Filter, History, Eye, Info, AlertOctagon, ArrowUpRight
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

// Localization labels
const localizations = {
  en: {
    title: "Omni-Channel Communication Templates",
    subtitle: "Centralized governance engine for AIEC Automated Sequences. Edit localized scripts, manage token resolution fallbacks, and audit active templates.",
    searchPlaceholder: "Search templates by stage, code, or content...",
    filterChannel: "Channel Filter",
    allChannels: "All Channels",
    filterStage: "CRM Stage",
    allStages: "All Stages",
    whatsapp: "WhatsApp Message",
    sms: "SMS Text",
    callScript: "IVR / Call Script",
    editTemplate: "Template Workspace",
    previewTitle: "Real-Time Client View Rendering",
    previewDesc: "Simulate exact output rendered with fallback replacements for incomplete lead profiles.",
    tokensTitle: "Governance Merge Tokens",
    tokensDesc: "Click to inject smart tokens. Real values replace these during sequence runs.",
    fallbackTitle: "Fallback Resolution Strategy",
    fallbackDesc: "Define backup text if a lead profile is missing targeted merge details.",
    versionHistory: "Draft Version History",
    revertBtn: "Revert to Draft",
    activeStatus: "Governed & Approved for Sequences",
    saveSuccess: "Template changes saved securely & deployed for future sequences.",
    revertSuccess: "Successfully reverted to selected historical version.",
    characterLimit: "Character Limit Status",
    smsSegments: "SMS segments required",
    whatsappMedia: "WhatsApp Header Media Slot",
    uploadPlaceholder: "Select image, blueprint, or quotation PDF (Max 5MB)",
    noTemplateSelected: "Select a governed template from the catalog to activate the workspace.",
    emptyLibrary: "No communication templates match your active filter settings.",
    createNew: "Add Governed Template",
    totalProgressLabel: "CRM Template Coverage",
    currentProgressLabel: "Total Complete",
    testFallbackToggle: "Simulate Missing Profile Fields",
    voiceSpeed: "Estimated speech duration",
    lastEdited: "Last modified by Admin on",
    langVariantLabel: "Language Variant Pool",
    unresolvedWarning: "Unresolved merge field found! Fallback strategy required before activation."
  },
  hi: {
    title: "ओम्नी-चैनल संचार टेम्प्लेट",
    subtitle: "एआईईसी स्वचालित अनुक्रमों के लिए केंद्रीकृत शासन इंजन। स्थानीयकृत स्क्रिप्ट संपादित करें और टोकन रिज़ॉल्यूशन प्रबंधित करें।",
    searchPlaceholder: "चरण, कोड या सामग्री द्वारा टेम्प्लेट खोजें...",
    filterChannel: "चैनल फ़िल्टर",
    allChannels: "सभी चैनल",
    filterStage: "सीआरएम चरण",
    allStages: "सभी चरण",
    whatsapp: "व्हाट्सएप संदेश",
    sms: "एसएमएस पाठ",
    callScript: "आईवीआर / कॉल स्क्रिप्ट",
    editTemplate: "टेम्प्लेट वर्कस्पेस",
    previewTitle: "रीयल-टाइम क्लाइंट व्यू रेंडरिंग",
    previewDesc: "अपूर्ण लीड प्रोफाइल के लिए बैकअप प्रतिस्थापन के साथ सटीक आउटपुट का अनुकरण करें।",
    tokensTitle: "गवर्नेंस मर्ज टोकन",
    tokensDesc: "स्मार्ट टोकन इंजेक्ट करने के लिए क्लिक करें। वास्तविक मान इन टोकन की जगह लेंगे।",
    fallbackTitle: "फ़ॉलबैक रिज़ॉल्यूशन रणनीति",
    fallbackDesc: "यदि लीड प्रोफ़ाइल में लक्षित विवरण गायब हैं, तो बैकअप टेक्स्ट परिभाषित करें।",
    versionHistory: "ड्राफ्ट संस्करण इतिहास",
    revertBtn: "इस संस्करण पर लौटें",
    activeStatus: "स्वचालित अनुक्रमों के लिए स्वीकृत",
    saveSuccess: "टेम्प्लेट परिवर्तन सुरक्षित रूप से सहेजे गए और तैनात किए गए।",
    revertSuccess: "चयनित ऐतिहासिक संस्करण पर सफलतापूर्वक वापस लौटे।",
    characterLimit: "वर्ण सीमा स्थिति",
    smsSegments: "एसएमएस सेगमेंट आवश्यक",
    whatsappMedia: "व्हाट्सएप हेडर मीडिया स्लॉट",
    uploadPlaceholder: "छवि, ब्लूप्रिंट या उद्धरण पीडीएफ चुनें (अधिकतम 5MB)",
    noTemplateSelected: "वर्कस्पेस को सक्रिय करने के लिए कैटलॉग से एक टेम्प्लेट चुनें।",
    emptyLibrary: "सक्रिय फ़िल्टर के अनुकूल कोई संचार टेम्प्लेट नहीं मिला।",
    createNew: "नया टेम्प्लेट जोड़ें",
    totalProgressLabel: "सीआरएम टेम्प्लेट कवरेज",
    currentProgressLabel: "कुल पूर्ण",
    testFallbackToggle: "गुम प्रोफ़ाइल फ़ील्ड का अनुकरण करें",
    voiceSpeed: "अनुमानित भाषण अवधि",
    lastEdited: "अंतिम संशोधन एडमिन द्वारा",
    langVariantLabel: "भाषा संस्करण पूल",
    unresolvedWarning: "अनसुलझा मर्ज फ़ील्ड मिला! सक्रिय करने से पहले फ़ॉलबैक आवश्यक है।"
  },
  mr: {
    title: "ओम्नी-चॅनेल संप्रेषण टेम्पलेट्स",
    subtitle: "एआयईसी स्वयंचलित अनुक्रमांसाठी केंद्रीकृत नियंत्रण इंजिन. स्थानिक स्क्रिप्ट संपादित करा आणि टोकन रिझोल्यूशन व्यवस्थापित करा.",
    searchPlaceholder: "स्टेज, कोड किंवा मजकुराद्वारे टेम्पलेट्स शोधा...",
    filterChannel: "चॅनेल फिल्टर",
    allChannels: "सर्व चॅनेल",
    filterStage: "सीआरएम टप्पा",
    allStages: "सर्व टप्पे",
    whatsapp: "व्हॉट्सॲप संदेश",
    sms: "एसएमएस मजकूर",
    callScript: "आयव्हीआर / कॉल स्क्रिप्ट",
    editTemplate: "टेम्पलेट वर्कस्पेस",
    previewTitle: "रिअल-टाइम क्लायंट व्ह्यू रेंडरिंग",
    previewDesc: "अपूर्ण लीड प्रोफाइलसाठी पर्यायी शब्दांसह अचूक संदेशाचे अनुकरण करा.",
    tokensTitle: "गव्हर्नन्स मर्ज टोकन्स",
    tokensDesc: "स्मार्ट टोकन समाविष्ट करण्यासाठी क्लिक करा. वास्तविक मूल्यांसह हे बदलले जातील.",
    fallbackTitle: "फॉलबॅक रिझोल्यूशन धोरण",
    fallbackDesc: "लीड प्रोफाइलमध्ये आवश्यक माहिती नसल्यास पर्यायी मजकूर निश्चित करा.",
    versionHistory: "मसुदा आवृत्ती इतिहास",
    revertBtn: "या आवृत्तीवर जा",
    activeStatus: "स्वयंचलित अनुक्रमांसाठी स्वीकृत",
    saveSuccess: "टेम्पलेट बदल यशस्वीरित्या जतन आणि लागू केले गेले आहेत.",
    revertSuccess: "निवडलेल्या ऐतिहासिक आवृत्तीवर यशस्वीरित्या परत गेले.",
    characterLimit: "मजकूर मर्यादा स्थिती",
    smsSegments: "आवश्यक एसएमएस विभाग",
    whatsappMedia: "व्हॉट्सॲप हेडर मीडिया स्लॉट",
    uploadPlaceholder: "प्रतिमा, ब्लूप्रिंट किंवा कोटेशन पीडीएफ निवडा (कमाल ५ एमबी)",
    noTemplateSelected: "वर्कस्पेस सक्रिय करण्यासाठी कॅटलॉग मधून एक टेम्पलेट निवडा.",
    emptyLibrary: "सक्रिय फिल्टरशी जुळणारे संप्रेषण टेम्पलेट सापडले नाही.",
    createNew: "नवीन टेम्पलेट जोडा",
    totalProgressLabel: "सीआरएम टेम्पलेट कव्हरेज",
    currentProgressLabel: "एकूण पूर्ण",
    testFallbackToggle: "अपूर्ण माहितीचे अनुकरण करा",
    voiceSpeed: "अंदाजे बोलण्याचा वेळ",
    lastEdited: "शेवटचा बदल प्रशासकाद्वारे",
    langVariantLabel: "भाषा प्रकार पर्याय",
    unresolvedWarning: "अपूर्ण मर्ज फील्ड आढळले! सक्रिय करण्यापूर्वी फॉलबॅक निश्चित करणे आवश्यक आहे."
  }
};

interface MergeToken {
  token: string;
  label: string;
  example: string;
  icon: string;
  fallbackDefault: string;
}

const AVAILABLE_TOKENS: MergeToken[] = [
  { token: 'client_name', label: 'Client Name', example: 'Prashant Vasant Wable', icon: '👤', fallbackDefault: 'Respected Customer' },
  { token: 'building_name', label: 'Site Address / Building', example: 'Pratik Heights, Kothrud', icon: '🏢', fallbackDefault: 'your prestigious site' },
  { token: 'quote_amount', label: 'Quotation Amount', example: '₹8,45,000', icon: '💰', fallbackDefault: 'estimated budget' },
  { token: 'elevator_floors', label: 'Total Floors', example: '6 Floors', icon: '🛗', fallbackDefault: 'planned levels' },
  { token: 'surveyor_name', label: 'Surveyor Name', example: 'Amit Sharma', icon: '🧑‍✈️', fallbackDefault: 'AIEC Relationship Desk' },
  { token: 'next_followup_date', label: 'Followup Date', example: '14th July, 2026', icon: '📅', fallbackDefault: 'scheduled time' }
];

interface VersionHistoryItem {
  version: number;
  timestamp: string;
  author: string;
  body: string;
}

interface TemplateLanguageVariant {
  en: string;
  hi: string;
  mr: string;
}

interface CommunicationTemplate {
  id: string;
  code: string;
  stage: string;
  channel: 'whatsapp' | 'sms' | 'call';
  name: string;
  bodies: TemplateLanguageVariant;
  fallbacks: Record<string, string>;
  mediaAttached?: string;
  mediaName?: string;
  isValidated: boolean;
  history: VersionHistoryItem[];
  whatsappButtons?: string[];
}

// Initial seed templates for AIEC CRM Sequences
const INITIAL_TEMPLATES: CommunicationTemplate[] = [
  {
    id: 'temp_001',
    code: 'AIEC_LEAD_WELCOME_WA',
    stage: 'captured',
    channel: 'whatsapp',
    name: 'New Lead Welcome Elevator Brochure',
    bodies: {
      en: "Hello {{client_name}}! 🛗 Thank you for contacting All India Elevators Company for your project at {{building_name}}. We have registered your request for an elevator system with {{elevator_floors}} floors. Our certified surveyor, {{surveyor_name}}, will contact you shortly. Rest assured, Ascension begins here!",
      hi: "नमस्ते {{client_name}}! 🛗 {{building_name}} पर आपके प्रोजेक्ट के लिए ऑल इंडिया एलिवेटर्स कंपनी से संपर्क करने के लिए धन्यवाद। हमने {{elevator_floors}} मंजिलों के एलिवेटर सिस्टम के लिए आपका अनुरोध दर्ज कर लिया है। हमारे प्रमाणित सर्वेक्षक, {{surveyor_name}}, जल्द ही आपसे संपर्क करेंगे।",
      mr: "नमस्कार {{client_name}}! 🛗 {{building_name}} येथील तुमच्या प्रोजेक्टसाठी ऑल इंडिया एलिव्हेटर्स कंपनीशी संपर्क साधल्याबद्दल धन्यवाद. आम्ही {{elevator_floors}} मजल्यांच्या एलिव्हेटर सिस्टमसाठी तुमची विनंती नोंदवून घेतली आहे. आमचे प्रमाणित सर्व्हेक्षक, {{surveyor_name}}, लवकरच तुमच्याशी संपर्क साधतील."
    },
    fallbacks: {
      client_name: 'Respected Patron',
      building_name: 'your prestigious project site',
      elevator_floors: 'multiple planned',
      surveyor_name: 'our relationships officer'
    },
    mediaAttached: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80',
    mediaName: 'AIEC_Premium_Elevator_Brochure_2026.pdf',
    isValidated: true,
    whatsappButtons: ['Download Brochure 📑', 'Talk to Engineer 📞'],
    history: [
      { version: 3, timestamp: '2026-07-10T14:30:00Z', author: 'Prashant Wable (Admin)', body: "Hello {{client_name}}! 🛗 Thank you for contacting All India Elevators Company for your project at {{building_name}}. We have registered your request for an elevator system with {{elevator_floors}} floors. Our certified surveyor, {{surveyor_name}}, will contact you shortly. Rest assured, Ascension begins here!" },
      { version: 2, timestamp: '2026-07-01T10:15:00Z', author: 'Amit Sharma (Surveyor Head)', body: "Hello {{client_name}}, we received your inquiry for elevator design at {{building_name}}. Our engineer will call you." },
      { version: 1, timestamp: '2026-06-15T09:00:00Z', author: 'System Bootstrap', body: "Welcome {{client_name}} to AIEC." }
    ]
  },
  {
    id: 'temp_002',
    code: 'AIEC_QUOTE_SEND_SMS',
    stage: 'negotiation',
    channel: 'sms',
    name: 'Quotation Budget Summary & Action link',
    bodies: {
      en: "Dear {{client_name}}, custom elevation drawings & quote for {{building_name}} has been finalized. Total project estimate is {{quote_amount}} for {{elevator_floors}} floors. Review details and secure your slot here: https://aiec.in/q/9823 - AIEC Team",
      hi: "प्रिय {{client_name}}, {{building_name}} के लिए एलिवेटर ड्राइंग और कोटेशन तैयार हो गया है। {{elevator_floors}} मंजिलों के लिए कुल अनुमानित बजट {{quote_amount}} है। विवरण देखें: https://aiec.in/q/9823",
      mr: "प्रिय {{client_name}}, {{building_name}} साठी तुमचे एलिव्हेटर रेखाचित्र आणि कोटेशन तयार आहे. {{elevator_floors}} मजल्यांचे एकूण बजेट {{quote_amount}} आहे. सविस्तर तपशील पाहा: https://aiec.in/q/9823"
    },
    fallbacks: {
      client_name: 'Customer',
      building_name: 'your Pune site',
      quote_amount: 'custom pricing',
      elevator_floors: 'designed'
    },
    isValidated: true,
    history: [
      { version: 1, timestamp: '2026-06-20T11:00:00Z', author: 'Prashant Wable (Admin)', body: "Dear {{client_name}}, custom elevation drawings & quote for {{building_name}} has been finalized. Total project estimate is {{quote_amount}} for {{elevator_floors}} floors. Review details and secure your slot here: https://aiec.in/q/9823 - AIEC Team" }
    ]
  },
  {
    id: 'temp_003',
    code: 'AIEC_PAYMENT_DUE_WA',
    stage: 'site_ready',
    channel: 'whatsapp',
    name: 'Material Dispatch Stage-2 Payment Due Alert',
    bodies: {
      en: "Urgent Payment Notice: Dear {{client_name}}, material dispatch for your elevator shaft at {{building_name}} is pending Stage-2 Advance of {{quote_amount}}. Please clear payment to prevent installation delivery hold. Secure payment portal: https://aiec.in/pay/302",
      hi: "भुगतान सूचना: प्रिय {{client_name}}, {{building_name}} पर लिफ्ट स्थापना के लिए सामग्री प्रेषण {{quote_amount}} के भुगतान के कारण लंबित है। कृपया देरी से बचने के लिए भुगतान करें।",
      mr: "पेमेंट सूचना: प्रिय {{client_name}}, {{building_name}} वर लिफ्ट उभारणीसाठी आवश्यक साहित्य पाठवणे {{quote_amount}} च्या पेमेंट अभावी प्रलंबित आहे. कृपया वेळेत पेमेंट पूर्ण करा."
    },
    fallbacks: {
      client_name: 'Valued Partner',
      building_name: 'your elevator shaft',
      quote_amount: 'due installment'
    },
    isValidated: true,
    whatsappButtons: ['Pay Now Online 💳', 'Share Receipt 🧾'],
    history: [
      { version: 2, timestamp: '2026-07-05T08:44:00Z', author: 'Nikhil K. (Finance Desk)', body: "Urgent Payment Notice: Dear {{client_name}}, material dispatch for your elevator shaft at {{building_name}} is pending Stage-2 Advance of {{quote_amount}}. Please clear payment to prevent installation delivery hold. Secure payment portal: https://aiec.in/pay/302" },
      { version: 1, timestamp: '2026-06-25T14:30:00Z', author: 'System Bootstrap', body: "Payment required for {{building_name}}." }
    ]
  },
  {
    id: 'temp_004',
    code: 'AIEC_SOP_COMPLETION_CALL',
    stage: 'site_ready',
    channel: 'call',
    name: 'Auto-IVR Call script: Installation Safety Handover',
    bodies: {
      en: "[IVR Synthesizer Voice] Namaskar {{client_name}}. All India Elevators is proud to report that structural installation at your site {{building_name}} is complete. Our QC Engineer has certified all safety checks for your {{elevator_floors}} floors elevator. Press 1 to schedule direct handover trial.",
      hi: "[आईवीआर संश्लेषक आवाज] नमस्कार {{client_name}}। ऑल इंडिया एलिवेटर्स को यह बताते हुए गर्व हो रहा है कि आपके स्थान {{building_name}} पर लिफ्ट की स्थापना पूरी हो गई है। हैंडओवर ट्रायल शेड्यूल करने के लिए 1 दबाएं।",
      mr: "[आयव्हीआर आवाज] नमस्कार {{client_name}}. ऑल इंडिया एलिव्हेटर्स ला कळवताना आनंद होत आहे की तुमच्या {{building_name}} येथील लिफ्ट बसवण्याचे काम पूर्ण झाले आहे. चाचणी घेण्यासाठी १ दाबा."
    },
    fallbacks: {
      client_name: 'Respected Patron',
      building_name: 'your building',
      elevator_floors: 'elevator'
    },
    isValidated: true,
    history: [
      { version: 1, timestamp: '2026-06-18T16:00:00Z', author: 'Amit Sharma (Surveyor Head)', body: "[IVR Synthesizer Voice] Namaskar {{client_name}}. All India Elevators is proud to report that structural installation at your site {{building_name}} is complete. Our QC Engineer has certified all safety checks for your {{elevator_floors}} floors elevator. Press 1 to schedule direct handover trial." }
    ]
  }
];

export const CommunicationTemplatesLibrary: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const t = localizations[language] || localizations.en;

  // DB templates management
  const [templates, setTemplates] = useState<CommunicationTemplate[]>(() => {
    const saved = localStorage.getItem('aiec_comm_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  // State controls
  const [selectedId, setSelectedId] = useState<string>('temp_001');
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>('all');
  const [activeStageFilter, setActiveStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEditLang, setActiveEditLang] = useState<'en' | 'hi' | 'mr'>('en');

  // Interactive Playground values (For live output rendering simulation)
  const [testClientName, setTestClientName] = useState<string>('Prashant Vasant Wable');
  const [testBuildingName, setTestBuildingName] = useState<string>('Wable Industrial Arcade, Hadapsar');
  const [testQuoteAmount, setTestQuoteAmount] = useState<string>('₹9,80,000');
  const [testFloors, setTestFloors] = useState<string>('6 Floors');
  const [testSurveyor, setTestSurveyor] = useState<string>('Amit Sharma (Senior Surveyor)');
  const [testFollowupDate, setTestFollowupDate] = useState<string>('15th July, 2026');

  // Trigger fallback simulator mode
  const [simulateMissingName, setSimulateMissingName] = useState<boolean>(false);
  const [simulateMissingBuilding, setSimulateMissingBuilding] = useState<boolean>(false);
  const [simulateMissingQuote, setSimulateMissingQuote] = useState<boolean>(false);
  const [simulateMissingFloors, setSimulateMissingFloors] = useState<boolean>(false);
  const [simulateMissingSurveyor, setSimulateMissingSurveyor] = useState<boolean>(false);

  // Success alert states
  const [toastMessage, setToastMessage] = useState<string>('');

  // Active Selected Template Data
  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedId);
  }, [templates, selectedId]);

  // Handle template body updates
  const [editBodyText, setEditBodyText] = useState<string>('');
  const [editFallbacks, setEditFallbacks] = useState<Record<string, string>>({});
  const [whatsappButtons, setWhatsappButtons] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);

  // Synchronize workspace variables upon selecting a different template
  useEffect(() => {
    if (selectedTemplate) {
      setEditBodyText(selectedTemplate.bodies[activeEditLang] || '');
      setEditFallbacks(selectedTemplate.fallbacks || {});
      setWhatsappButtons(selectedTemplate.whatsappButtons || []);
    }
  }, [selectedTemplate, activeEditLang]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Insert merge-field token chip into cursor position in editor text area
  const insertToken = (tokenKey: string) => {
    const formattedToken = `{{${tokenKey}}}`;
    setEditBodyText(prev => prev + ' ' + formattedToken + ' ');

    // Initialize fallback if missing
    if (!editFallbacks[tokenKey]) {
      const tokenDef = AVAILABLE_TOKENS.find(tk => tk.token === tokenKey);
      setEditFallbacks(prev => ({
        ...prev,
        [tokenKey]: tokenDef ? tokenDef.fallbackDefault : 'Information'
      }));
    }
  };

  // Media upload simulation helper
  const handleUploadMedia = () => {
    setUploadProgress(true);
    setTimeout(() => {
      setUploadProgress(false);
      triggerToast("PDF document validated and pinned to WhatsApp Template Header Slot.");
    }, 1200);
  };

  // Save current changes to Draft & Deployed state
  const handleSaveWorkspace = () => {
    if (!selectedTemplate) return;

    // Validate that all merge tokens in text have fallbacks configured
    const regex = /\{\{(\w+)\}\}/g;
    let match;
    const tokensInText: string[] = [];
    while ((match = regex.exec(editBodyText)) !== null) {
      tokensInText.push(match[1]);
    }

    const missingFallbacks = tokensInText.filter(tok => !editFallbacks[tok] || editFallbacks[tok].trim() === '');
    
    // Add default fallbacks if somehow missing to prevent breakage
    const verifiedFallbacks = { ...editFallbacks };
    missingFallbacks.forEach(tok => {
      const matchedTk = AVAILABLE_TOKENS.find(t => t.token === tok);
      verifiedFallbacks[tok] = matchedTk ? matchedTk.fallbackDefault : 'value';
    });

    // Create a new historic snapshot version item
    const newVersionNum = (selectedTemplate.history[0]?.version || 0) + 1;
    const historyItem: VersionHistoryItem = {
      version: newVersionNum,
      timestamp: new Date().toISOString(),
      author: `${user?.name || 'Administrator'} (Admin)`,
      body: editBodyText
    };

    const updatedTemplates = templates.map(t => {
      if (t.id === selectedId) {
        // Build updated language bodies
        const updatedBodies = { ...t.bodies, [activeEditLang]: editBodyText };
        return {
          ...t,
          bodies: updatedBodies,
          fallbacks: verifiedFallbacks,
          whatsappButtons: whatsappButtons,
          history: [historyItem, ...t.history],
          isValidated: true
        };
      }
      return t;
    });

    setTemplates(updatedTemplates);
    localStorage.setItem('aiec_comm_templates', JSON.stringify(updatedTemplates));
    triggerToast(t.saveSuccess);
  };

  // Restore previous drafted version
  const handleRevertVersion = (historicText: string) => {
    setEditBodyText(historicText);
    triggerToast(t.revertSuccess);
  };

  // Generate dynamic UI previews of template
  const compiledPreviewText = useMemo(() => {
    if (!selectedTemplate) return "";
    let baseText = editBodyText;

    // Token replacements
    const tokenReplacements: Record<string, string> = {
      client_name: simulateMissingName ? (editFallbacks['client_name'] || 'Customer') : testClientName,
      building_name: simulateMissingBuilding ? (editFallbacks['building_name'] || 'your site') : testBuildingName,
      quote_amount: simulateMissingQuote ? (editFallbacks['quote_amount'] || 'custom estimate') : testQuoteAmount,
      elevator_floors: simulateMissingFloors ? (editFallbacks['elevator_floors'] || 'multiple') : testFloors,
      surveyor_name: simulateMissingSurveyor ? (editFallbacks['surveyor_name'] || 'our relationships team') : testSurveyor,
      next_followup_date: testFollowupDate
    };

    Object.entries(tokenReplacements).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      baseText = baseText.split(placeholder).join(value);
    });

    return baseText;
  }, [
    editBodyText,
    testClientName, testBuildingName, testQuoteAmount, testFloors, testSurveyor, testFollowupDate,
    simulateMissingName, simulateMissingBuilding, simulateMissingQuote, simulateMissingFloors, simulateMissingSurveyor,
    editFallbacks, selectedTemplate
  ]);

  // Character calculations & warning criteria
  const charStats = useMemo(() => {
    const textLen = editBodyText.length;
    let smsSegmentsCount = 1;
    if (textLen > 160) {
      smsSegmentsCount = Math.ceil(textLen / 153); // GSM user data header division size
    }
    const estimatedSpeechSeconds = Math.round(editBodyText.split(' ').length * 0.4);

    return {
      length: textLen,
      segments: smsSegmentsCount,
      speechSeconds: estimatedSpeechSeconds
    };
  }, [editBodyText]);

  // Search & filter matching logic
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesChannel = activeChannelFilter === 'all' || t.channel === activeChannelFilter;
      const matchesStage = activeStageFilter === 'all' || t.stage === activeStageFilter;
      const matchesSearch = searchQuery === '' || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(t.bodies).some(body => typeof body === 'string' && body.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesChannel && matchesStage && matchesSearch;
    });
  }, [templates, activeChannelFilter, activeStageFilter, searchQuery]);

  // Overall database progress calculation (Templates coverage percentage across crucial business stages)
  const templatesProgress = useMemo(() => {
    const requiredStages = ['captured', 'contacted', 'negotiation', 'site_ready'];
    const totalRequiredCount = requiredStages.length * 3; // WhatsApp, SMS, Call per stage
    const currentCompletedCount = templates.length;
    const pct = Math.round((currentCompletedCount / 12) * 100);
    return Math.min(pct, 100);
  }, [templates]);

  // Handle creation of a new dynamic template
  const handleAddNewTemplate = () => {
    const newId = `temp_new_${Date.now()}`;
    const newCode = `AIEC_CUSTOM_${templates.length + 1}`;
    const newTemp: CommunicationTemplate = {
      id: newId,
      code: newCode,
      stage: 'captured',
      channel: 'whatsapp',
      name: `Custom Automated Sequence Notification ${templates.length + 1}`,
      bodies: {
        en: "Hello {{client_name}}! This is All India Elevators notifying you about your project.",
        hi: "नमस्ते {{client_name}}! ऑल इंडिया एलिवेटर्स आपको आपके प्रोजेक्ट के बारे में सूचित कर रहा है।",
        mr: "नमस्कार {{client_name}}! ऑल इंडिया एलिव्हेटर्स तुम्हाला तुमच्या प्रोजेक्टबद्दल सूचित करत आहे."
      },
      fallbacks: {
        client_name: 'Customer'
      },
      isValidated: true,
      whatsappButtons: ['Accept Call 📞'],
      history: [
        { version: 1, timestamp: new Date().toISOString(), author: 'Prashant Wable (Admin)', body: "Hello {{client_name}}! This is All India Elevators notifying you about your project." }
      ]
    };

    const updated = [...templates, newTemp];
    setTemplates(updated);
    localStorage.setItem('aiec_comm_templates', JSON.stringify(updated));
    setSelectedId(newId);
    triggerToast("Created new custom template draft.");
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* HEADER WITH OMNI-CHANNEL PERCENTAGE METRIC BARS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            CRM AUTOMATION ENGINE • MODULE 6
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Dynamic progress bar requested by guidelines */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] flex flex-col justify-center shadow-xs">
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>{t.totalProgressLabel}: {templatesProgress}%</span>
            <span>12 CRM Sequences</span>
          </div>
          <div className="w-56 h-2 bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div
              className="absolute top-0 bottom-0 left-0 bg-antiquegold rounded-full transition-all duration-300"
              style={{ width: `${templatesProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* TOAST SUCCESS PANEL */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-royalemerald text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH AND FILTER BAR */}
      <Card className="p-4 bg-white shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* SEARCH INPUT */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-warmgray" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-alabaster border border-[#e5dfd4] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold"
            />
          </div>

          {/* CHANNEL FILTER */}
          <div className="md:col-span-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-antiquegold shrink-0" />
            <select
              value={activeChannelFilter}
              onChange={(e) => setActiveChannelFilter(e.target.value)}
              className="w-full bg-alabaster border border-[#e5dfd4] rounded-lg py-2 px-3 text-xs font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
            >
              <option value="all">📱 All Channels</option>
              <option value="whatsapp">💬 WhatsApp Only</option>
              <option value="sms">✉️ SMS Texts</option>
              <option value="call">📞 IVR Scripts</option>
            </select>
          </div>

          {/* STAGE FILTER */}
          <div className="md:col-span-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-royalemerald shrink-0" />
            <select
              value={activeStageFilter}
              onChange={(e) => setActiveStageFilter(e.target.value)}
              className="w-full bg-alabaster border border-[#e5dfd4] rounded-lg py-2 px-3 text-xs font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
            >
              <option value="all">📍 All CRM Stages</option>
              <option value="captured">Captured (New Leads)</option>
              <option value="contacted">Contacted (Scheduled)</option>
              <option value="negotiation">Negotiation (Quotations)</option>
              <option value="site_ready">Site Ready (Installs)</option>
            </select>
          </div>

          {/* ADD NEW BUTTON */}
          <div className="md:col-span-2 text-right">
            <Button
              onClick={handleAddNewTemplate}
              variant="outline"
              className="w-full py-2 font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 border-royalemerald text-royalemerald hover:bg-royalemerald/5"
            >
              <Plus className="w-4 h-4" />
              <span>{t.createNew}</span>
            </Button>
          </div>

        </div>
      </Card>

      {/* MAIN TWO-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE GOVERNED CATALOG (5 SPAN) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs uppercase font-mono font-black text-charcoal tracking-wider">
              Governed Catalog ({filteredTemplates.length} matches)
            </span>
            <span className="text-[10px] font-mono font-bold text-warmgray">Admin Managed</span>
          </div>

          {filteredTemplates.length === 0 ? (
            <Card className="p-10 text-center space-y-3 bg-white">
              <AlertTriangle className="w-8 h-8 text-[#B8873D] mx-auto" />
              <p className="text-xs text-warmgray font-bold">{t.emptyLibrary}</p>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {filteredTemplates.map((item) => {
                const isSelected = item.id === selectedId;
                
                // Identify channel style properties
                let channelIcon = <MessageSquare className="w-4 h-4" />;
                let channelColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                let channelLabel = "WhatsApp";
                
                if (item.channel === 'sms') {
                  channelIcon = <FileText className="w-4 h-4" />;
                  channelColor = "bg-blue-50 text-blue-700 border-blue-200";
                  channelLabel = "SMS Alert";
                } else if (item.channel === 'call') {
                  channelIcon = <Phone className="w-4 h-4" />;
                  channelColor = "bg-amber-50 text-amber-700 border-amber-200";
                  channelLabel = "IVR Script";
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-antiquegold ring-2 ring-antiquegold/10 shadow-sm translate-x-1'
                        : 'border-[#e5dfd4]/60 hover:border-warmgray hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-mono font-black text-antiquegold tracking-widest bg-antiquegold/5 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                        <h4 className="font-serif text-sm font-bold text-charcoal mt-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-warmgray line-clamp-2 font-medium">
                          {item.bodies.en}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <Badge className={`text-[9px] font-mono px-2 py-0.5 font-bold uppercase rounded-full ${channelColor}`}>
                          <span className="flex items-center gap-1">
                            {channelIcon}
                            <span>{channelLabel}</span>
                          </span>
                        </Badge>
                        <span className="text-[9px] uppercase font-mono font-extrabold text-charcoal bg-[#F8F6F1] px-2 py-0.5 rounded border border-[#e5dfd4]">
                          {item.stage}
                        </span>
                      </div>
                    </div>

                    {/* Quick Swipe/Touch indicator actions */}
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#e5dfd4]/30 text-[9px] font-mono text-warmgray">
                      <span>👤 {AVAILABLE_TOKENS.filter(t => item.bodies.en.includes(`{{${t.token}}}`)).length} Merge Tokens</span>
                      <span className="text-royalemerald font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3 text-royalemerald" /> Active Sequence
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DYNAMIC SIGNATURE ELEMENT: ASCENSION LINE */}
          <Card className="p-4 bg-alabaster/40 border border-[#e5dfd4]/60">
            <div className="flex items-start gap-3">
              {/* Vertical line segment (The Ascension Line Motif) */}
              <div className="w-1 bg-antiquegold h-14 rounded shrink-0 relative">
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-royalemerald ring-2 ring-white" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-black uppercase text-antiquegold tracking-wider">
                  Automated Queue Safeguards
                </span>
                <p className="text-[10px] text-warmgray font-semibold leading-relaxed">
                  These templates undergo real-time syntax checking. The AIEC scheduler blocks any automated dispatch if a token is unresolved and lacks a designated fallback strategy.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: WORKSPACE EDITOR (7 SPAN) */}
        <div className="lg:col-span-7 space-y-6">
          {!selectedTemplate ? (
            <Card className="p-16 text-center space-y-4 bg-white">
              <FileText className="w-12 h-12 text-antiquegold mx-auto stroke-1" />
              <h3 className="font-serif text-lg font-bold text-charcoal">{t.noTemplateSelected}</h3>
            </Card>
          ) : (
            <div className="space-y-6">
              
              {/* WORKSPACE CARD */}
              <Card className="p-6 space-y-6 bg-white shadow-xs">
                
                {/* WORKSPACE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#e5dfd4]/40 pb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-mono font-black text-royalemerald bg-royalemerald/10 px-2 py-0.5 rounded">
                        {selectedTemplate.code}
                      </span>
                      <span className="text-xs text-warmgray font-bold">Workspace</span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-charcoal mt-1">
                      {selectedTemplate.name}
                    </h3>
                  </div>

                  {/* Language variants selection */}
                  <div className="bg-[#F8F6F1] p-1 rounded-xl border border-[#e5dfd4] flex gap-1">
                    <button
                      onClick={() => setActiveEditLang('en')}
                      className={`px-3 py-1 text-[10px] uppercase font-mono font-black rounded-lg transition-all ${
                        activeEditLang === 'en' ? 'bg-antiquegold text-white shadow-xs' : 'text-warmgray'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setActiveEditLang('hi')}
                      className={`px-3 py-1 text-[10px] uppercase font-mono font-black rounded-lg transition-all ${
                        activeEditLang === 'hi' ? 'bg-antiquegold text-white shadow-xs' : 'text-warmgray'
                      }`}
                    >
                      हिन्दी
                    </button>
                    <button
                      onClick={() => setActiveEditLang('mr')}
                      className={`px-3 py-1 text-[10px] uppercase font-mono font-black rounded-lg transition-all ${
                        activeEditLang === 'mr' ? 'bg-antiquegold text-white shadow-xs' : 'text-warmgray'
                      }`}
                    >
                      मराठी
                    </button>
                  </div>
                </div>

                {/* VISIBLE TOKENS PALETTE CONTAINER */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-charcoal flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-antiquegold" />
                      <span>{t.tokensTitle}</span>
                    </label>
                    <span className="text-[10px] text-warmgray font-bold">{t.tokensDesc}</span>
                  </div>

                  {/* Token injection palette */}
                  <div className="flex flex-wrap gap-2 p-3 bg-alabaster border border-[#e5dfd4] rounded-2xl">
                    {AVAILABLE_TOKENS.map((token) => (
                      <button
                        key={token.token}
                        onClick={() => insertToken(token.token)}
                        className="px-2.5 py-1.5 bg-white border border-[#e5dfd4] hover:border-antiquegold hover:shadow-xs rounded-xl text-[11px] font-bold text-charcoal transition-all flex items-center gap-1"
                      >
                        <span className="text-xs">{token.icon}</span>
                        <span className="font-mono text-antiquegold font-extrabold">{`{{${token.token}}}`}</span>
                        <span className="text-[10px] text-warmgray">({token.label})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TEMPLATE BODY WRITER */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                      Message Content Editor ({activeEditLang.toUpperCase()})
                    </label>
                    <Badge className="bg-alabaster text-charcoal border-[#e5dfd4] text-[10px] font-mono">
                      {charStats.length} characters
                    </Badge>
                  </div>

                  <textarea
                    rows={5}
                    value={editBodyText}
                    onChange={(e) => setEditBodyText(e.target.value)}
                    className="w-full p-4 border border-[#e5dfd4] rounded-2xl text-sm font-medium text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold leading-relaxed"
                    placeholder="Enter template body. Inject tokens from the palette above to dynamically customize variables..."
                  />

                  {/* Channel specific warning triggers */}
                  <div className="flex flex-col md:flex-row gap-3 pt-1">
                    {selectedTemplate.channel === 'sms' && (
                      <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-800 font-semibold w-full">
                        <AlertTriangle className="w-4 h-4 text-[#B8873D]" />
                        <span>
                          {t.characterLimit}: <strong>{charStats.length} / 160</strong> chars. SMS splits into <strong>{charStats.segments}</strong> payloads. Try limiting text to prevent carriage overhead.
                        </span>
                      </div>
                    )}

                    {selectedTemplate.channel === 'call' && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-xl border border-blue-200 text-[10px] text-blue-800 font-semibold w-full">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span>
                          {t.voiceSpeed}: Approximately <strong>~{charStats.speechSeconds} seconds</strong> of IVR reading speed. Optimal range for structural Elevator handover calls is 30-45s.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* WHATSAPP SPECIFIC MEDIA & BUTTONS FIELDS */}
                {selectedTemplate.channel === 'whatsapp' && (
                  <div className="p-4 bg-alabaster/60 border border-[#e5dfd4] rounded-2xl space-y-4">
                    <span className="text-[10px] uppercase font-mono font-black text-charcoal block">
                      WhatsApp Business Custom Settings (Governed Sandbox)
                    </span>

                    {/* Attachment slot */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-warmgray block">
                          {t.whatsappMedia}
                        </label>
                        <div className="border border-dashed border-[#e5dfd4] bg-white p-3 rounded-xl flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-antiquegold" />
                            <div className="truncate">
                              <span className="text-[10px] font-bold text-charcoal block truncate">
                                {selectedTemplate.mediaName || "No pdf attached"}
                              </span>
                              <span className="text-[9px] text-warmgray block">Attachment verified</span>
                            </div>
                          </div>

                          <button
                            onClick={handleUploadMedia}
                            className="text-[9px] font-mono font-extrabold text-royalemerald hover:underline shrink-0"
                          >
                            {uploadProgress ? "Uploading..." : "Upload PDF"}
                          </button>
                        </div>
                      </div>

                      {/* Button quick replies */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-warmgray block">
                          Interactions Button Templates
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {whatsappButtons.map((btn, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-white border border-[#e5dfd4] px-2.5 py-1 rounded-lg text-[10px] font-bold text-charcoal">
                              <span>{btn}</span>
                              <button
                                onClick={() => setWhatsappButtons(prev => prev.filter((_, i) => i !== idx))}
                                className="text-[#B23B3B] hover:text-red-700 font-extrabold ml-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const bName = prompt("Enter WhatsApp button title:");
                              if (bName) setWhatsappButtons(prev => [...prev, bName]);
                            }}
                            className="px-2.5 py-1 bg-royalemerald/10 text-royalemerald border border-royalemerald/20 rounded-lg text-[10px] font-black hover:bg-royalemerald/20 transition-all"
                          >
                            + Add Button
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FALLBACK STRATEGY WORKSPACE */}
                <div className="space-y-3 pt-4 border-t border-[#e5dfd4]/40">
                  <div>
                    <h4 className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#B23B3B]" />
                      <span>{t.fallbackTitle}</span>
                    </h4>
                    <p className="text-[11px] text-warmgray font-semibold mt-0.5">{t.fallbackDesc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AVAILABLE_TOKENS.filter(token => editBodyText.includes(`{{${token.token}}}`)).map((token) => (
                      <div key={token.token} className="bg-alabaster p-3 border border-[#e5dfd4] rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-black text-antiquegold">{`{{${token.token}}}`}</span>
                          <span className="text-[9px] text-warmgray font-bold">Fallback text</span>
                        </div>
                        <input
                          type="text"
                          value={editFallbacks[token.token] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditFallbacks(prev => ({ ...prev, [token.token]: val }));
                          }}
                          placeholder={token.fallbackDefault}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#e5dfd4] rounded-lg text-[11px] font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                        />
                      </div>
                    ))}

                    {AVAILABLE_TOKENS.filter(token => editBodyText.includes(`{{${token.token}}}`)).length === 0 && (
                      <div className="md:col-span-2 text-center py-4 text-[10px] text-warmgray font-bold">
                        No merge tokens currently placed in this text body. No fallbacks needed.
                      </div>
                    )}
                  </div>
                </div>

                {/* WORKSPACE ACTIONS */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-mono text-warmgray font-bold">
                    🛡️ Governing: AIEC-V26-Engine
                  </span>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveWorkspace}
                      variant="primary"
                      className="py-2 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Deploy Template</span>
                    </Button>
                  </div>
                </div>

              </Card>

              {/* LIVE SIMULATED PREVIEW PLAYGROUND */}
              <Card className="p-6 space-y-4 bg-white shadow-xs border border-royalemerald/15">
                <div className="border-b border-[#e5dfd4]/40 pb-3 flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-charcoal flex items-center gap-1.5">
                      <Eye className="w-4.5 h-4.5 text-royalemerald" />
                      <span>{t.previewTitle}</span>
                    </h3>
                    <p className="text-[11px] text-warmgray font-semibold mt-0.5">{t.previewDesc}</p>
                  </div>

                  <Badge className="bg-royalemerald/10 text-royalemerald border-royalemerald/20 text-[10px] font-mono">
                    PROD SANDBOX
                  </Badge>
                </div>

                {/* Simulated profiles controls */}
                <div className="bg-[#F8F6F1] p-4 rounded-2xl border border-[#e5dfd4]/60 space-y-4">
                  <span className="text-[10px] font-mono font-black text-charcoal uppercase tracking-wider block">
                    {t.testFallbackToggle}
                  </span>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <button
                      onClick={() => setSimulateMissingName(!simulateMissingName)}
                      className={`px-2 py-1.5 rounded-xl border text-[9px] font-mono font-bold transition-all ${
                        simulateMissingName
                          ? 'bg-[#B23B3B] text-white border-[#B23B3B]'
                          : 'bg-white text-charcoal border-[#e5dfd4] hover:border-antiquegold'
                      }`}
                    >
                      👤 Client Name: {simulateMissingName ? "EMPTY" : "OK"}
                    </button>

                    <button
                      onClick={() => setSimulateMissingBuilding(!simulateMissingBuilding)}
                      className={`px-2 py-1.5 rounded-xl border text-[9px] font-mono font-bold transition-all ${
                        simulateMissingBuilding
                          ? 'bg-[#B23B3B] text-white border-[#B23B3B]'
                          : 'bg-white text-charcoal border-[#e5dfd4] hover:border-antiquegold'
                      }`}
                    >
                      🏢 Building: {simulateMissingBuilding ? "EMPTY" : "OK"}
                    </button>

                    <button
                      onClick={() => setSimulateMissingQuote(!simulateMissingQuote)}
                      className={`px-2 py-1.5 rounded-xl border text-[9px] font-mono font-bold transition-all ${
                        simulateMissingQuote
                          ? 'bg-[#B23B3B] text-white border-[#B23B3B]'
                          : 'bg-white text-charcoal border-[#e5dfd4] hover:border-antiquegold'
                      }`}
                    >
                      💰 Quote Amount: {simulateMissingQuote ? "EMPTY" : "OK"}
                    </button>

                    <button
                      onClick={() => setSimulateMissingFloors(!simulateMissingFloors)}
                      className={`px-2 py-1.5 rounded-xl border text-[9px] font-mono font-bold transition-all ${
                        simulateMissingFloors
                          ? 'bg-[#B23B3B] text-white border-[#B23B3B]'
                          : 'bg-white text-charcoal border-[#e5dfd4] hover:border-antiquegold'
                      }`}
                    >
                      🛗 Floors: {simulateMissingFloors ? "EMPTY" : "OK"}
                    </button>

                    <button
                      onClick={() => setSimulateMissingSurveyor(!simulateMissingSurveyor)}
                      className={`px-2 py-1.5 rounded-xl border text-[9px] font-mono font-bold transition-all ${
                        simulateMissingSurveyor
                          ? 'bg-[#B23B3B] text-white border-[#B23B3B]'
                          : 'bg-white text-charcoal border-[#e5dfd4] hover:border-antiquegold'
                      }`}
                    >
                      🧑‍✈️ Surveyor: {simulateMissingSurveyor ? "EMPTY" : "OK"}
                    </button>
                  </div>
                </div>

                {/* PHONE PREVIEW WRAPPER */}
                <div className="bg-charcoal text-white rounded-3xl p-4 shadow-md max-w-sm mx-auto space-y-3 relative overflow-hidden">
                  {/* Phone Header status bar */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-warmgray/70 px-1">
                    <span>9:41 🌐</span>
                    <span>AIEC WhatsApp Gateway</span>
                  </div>

                  {/* Message body block */}
                  <div className="bg-zinc-800 p-3.5 rounded-2xl rounded-tl-none border border-zinc-700 text-xs leading-relaxed font-semibold relative space-y-2">
                    
                    {/* Attach media if exists in WhatsApp channel */}
                    {selectedTemplate.channel === 'whatsapp' && selectedTemplate.mediaAttached && (
                      <div className="rounded-xl overflow-hidden mb-2 bg-black/40 border border-zinc-700 p-2 flex items-center gap-2">
                        <FileText className="w-7 h-7 text-antiquegold" />
                        <div className="truncate">
                          <span className="text-[10px] font-mono font-bold text-zinc-100 block truncate">
                            {selectedTemplate.mediaName}
                          </span>
                          <span className="text-[8px] text-zinc-400 block">PDF Document</span>
                        </div>
                      </div>
                    )}

                    <p className="whitespace-pre-line">{compiledPreviewText}</p>

                    <span className="text-[8px] text-zinc-400 block text-right mt-1">
                      Just now • Delivered
                    </span>
                  </div>

                  {/* Interactive Button quick replies preview */}
                  {selectedTemplate.channel === 'whatsapp' && whatsappButtons.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {whatsappButtons.map((btn, index) => (
                        <div
                          key={index}
                          className="w-full bg-zinc-800 text-center py-2 text-xs font-bold text-cyan-400 rounded-xl hover:bg-zinc-700 transition-all cursor-pointer border border-zinc-700/60"
                        >
                          {btn}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </Card>

              {/* VERSION HISTORY WORKSPACE */}
              <Card className="p-6 space-y-4 bg-white shadow-xs">
                <div className="border-b border-[#e5dfd4]/40 pb-3">
                  <h3 className="font-serif text-sm font-bold text-charcoal flex items-center gap-1.5">
                    <History className="w-4.5 h-4.5 text-antiquegold" />
                    <span>{t.versionHistory}</span>
                  </h3>
                </div>

                <div className="space-y-3.5">
                  {selectedTemplate.history.map((hist, index) => (
                    <div
                      key={index}
                      className="p-3 bg-alabaster rounded-xl border border-[#e5dfd4]/60 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-mono font-black text-white bg-charcoal px-2 py-0.5 rounded">
                            Draft #{hist.version}
                          </span>
                          <span className="text-[10px] text-warmgray font-bold">
                            {new Date(hist.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-charcoal line-clamp-2 font-medium italic">
                          "{hist.body}"
                        </p>
                        <span className="text-[9px] text-warmgray font-bold block">
                          Modified by: {hist.author}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRevertVersion(hist.body)}
                        disabled={hist.body === editBodyText}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase shrink-0 border transition-all ${
                          hist.body === editBodyText
                            ? 'bg-[#F8F6F1] text-warmgray border-[#e5dfd4]/40 cursor-not-allowed'
                            : 'bg-white text-antiquegold border-antiquegold hover:bg-antiquegold/5'
                        }`}
                      >
                        {hist.body === editBodyText ? "Current" : t.revertBtn}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
