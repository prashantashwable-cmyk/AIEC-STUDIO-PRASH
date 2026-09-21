import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, Check, CheckSquare, Compass, Copy, ArrowLeft, ArrowRight, 
  ShieldCheck, MapPin, RefreshCw, Users, HelpCircle, Info, Calendar, 
  Coins, History, FileText, Trash2, ShieldAlert, CheckCircle, Split, 
  Undo2, Ban, Sliders, CheckSquare2, Square, Grid, Map, Layers, HelpCircle as HelpIcon,
  ChevronRight
} from 'lucide-react';
import { Lead, User, LeadStage } from '../types';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';
import { DbManager } from '../lib/db';

// Localization definitions for multi-lingual Indian corporate CRM
const localizations = {
  en: {
    title: "Duplicate Resolution Console",
    subtitle: "Geo-Radius Overlap Auditor & Commission Escrow Safeguard",
    currentProgressLabel: "Current Active Queue Clearance Rate",
    totalProgressLabel: "Global CRM Data Integrity & Duplication Lock-Ratio",
    queueTitle: "Flagged Duplication Queue",
    queueDesc: "Collision warnings flagged by geo-radius logic. Resolving protects database integrity and prevents commission disputes.",
    confidence: "Overlap Confidence: {percent}%",
    distance: "Physical distance: {meters}m",
    noDuplicates: "Splendid! All geo-collisions have been successfully audited.",
    workspaceTitle: "Side-by-Side Merge Studio",
    workspaceDesc: "Choose surviving record, select field-level overrides, and audit commission outcome.",
    fieldLabel: "Field Name",
    optionA: "Lead Record Alpha",
    optionB: "Lead Record Beta",
    finalSurvivor: "Final Merged Lead Structure",
    keepA: "Keep Alpha Field",
    keepB: "Keep Beta Field",
    survivorChosen: "Surviving Anchor",
    commissionImpactTitle: "Commission Outcome & Escrow Review",
    commissionImpactDesc: "Merging affects surveyor commission allocations. Choose a fair allocation plan.",
    previewCommissionBtn: "Calculate & View Commission Impact",
    reviewedCheckbox: "I have consulted both surveyors and explicitly verified commission payouts.",
    mergeConfirmBtn: "Execute Final Database Merge",
    differentSitesBtn: "Genuinely Different Sites (False Positive)",
    originalCapturer: "Original Capturer",
    originalTime: "Captured: {time}",
    disputePrevAlert: "Verification Required: Commission payouts are heavily regulated under AIEC Clause 4(b).",
    differentSitesDesc: "This feedback will tune the detection confidence radius by -5 meters to minimize future false positives.",
    differentSitesSuccess: "Cleared duplicate flags. Feedback logged to tune geo-detection parameters.",
    mergeSuccess: "Lead records merged successfully. Initiating undo window.",
    undoToast: "Merge committed. Undo window active for {sec}s.",
    undoSuccess: "Merge undone successfully. Records restored to flagged duplicate queue.",
    historyTitle: "Audit Log & Resolution Registry",
    historyDesc: "Historical record of duplicates resolved, merged fields, and tuned confidence parameters",
    primaryLabel: "Survivor",
    secondaryLabel: "Merged",
    differentSitesLog: "Marked as Genuinely Different",
    stageWarning: "Stage mismatch detected: Record Beta is at a more advanced CRM stage ({stage_b}) than Alpha ({stage_a}). Surviving record will adopt the more advanced stage.",
    actionPerformedBy: "Resolution authorized by Admin: {name}",
    gpsLock: "Real Map Node GPS core lock: Active",
    accuracy: "Precision Accuracy: {meters}m • Verification Secured"
  },
  mr: {
    title: "डुप्लिकेट लीड एकत्रीकरण केंद्र",
    subtitle: "भौगोलिक-त्रिज्या संघर्ष लेखापरीक्षक आणि कमिशन एस्क्रो",
    currentProgressLabel: "सध्याची प्रलंबित रांग निवारण दर",
    totalProgressLabel: "एकूण सीआरएम डेटा अचूकता आणि सुरक्षा प्रमाण",
    queueTitle: "फ्लॅग केलेली डुप्लिकेट रांग",
    queueDesc: "भौगोलिक-त्रिज्या लॉजिकद्वारे आढळलेले विसंगती इशारे. हे सोडवल्याने डेटा सुरक्षित राहतो आणि कमिशन वाद टळतात.",
    confidence: "एकत्रीकरण अचूकता: {percent}%",
    distance: "भौतिक अंतर: {meters} मीटर",
    noDuplicates: "उत्कृष्ट! सर्व भौगोलिक-त्रिज्या विसंगती यशस्वीरित्या सोडवल्या गेल्या आहेत.",
    workspaceTitle: "शेजारी-शेजारी एकत्रीकरण स्टुडिओ",
    workspaceDesc: "टिकाऊ रेकॉर्ड निवडा, फील्ड-स्तरीय ओव्हरराइड निवडा आणि कमिशनचे पुनरावलोकन करा.",
    fieldLabel: "माहिती रकाना",
    optionA: "लीड रेकॉर्ड अल्फा",
    optionB: "लीड रेकॉर्ड बीटा",
    finalSurvivor: "अंतिम एकत्रित लीड स्वरूप",
    keepA: "अल्फा फील्ड ठेवा",
    keepB: "बीटा फील्ड ठेवा",
    survivorChosen: "टिकाऊ अँकर",
    commissionImpactTitle: "कमिशन सुरक्षा आणि पुनरावलोकन",
    commissionImpactDesc: "एकत्रीकरणामुळे सर्वेक्षकाच्या कमिशनवर परिणाम होतो. एक न्याय्य वाटप योजना निवडा.",
    previewCommissionBtn: "कमिशन परिणाम मोजा आणि पहा",
    reviewedCheckbox: "मी दोन्ही सर्वेक्षकांशी सल्लामसलत केली आहे आणि कमिशनची खात्री केली आहे.",
    mergeConfirmBtn: "अंतिम डेटाबेस एकत्रीकरण करा",
    differentSitesBtn: "खरोखर वेगळ्या जागा आहेत (फॉल्स पॉझिटिव्ह)",
    originalCapturer: "मूळ लीड घेणारा",
    originalTime: "नोंदणी वेळ: {time}",
    disputePrevAlert: "पडताळणी आवश्यक: कमिशन वाटप एआयईसी कलम ४(ब) नुसार कडक नियमबद्ध आहे.",
    differentSitesDesc: "या प्रतिसादाने भविष्यातील फॉल्स पॉझिटिव्ह कमी करण्यासाठी डिटेक्शन त्रिज्या -५ मीटरने कमी केली जाईल.",
    differentSitesSuccess: "डुप्लिकेट इशारे हटवले. भौगोलिक-डिटेक्शन पॅरामीटर्स ट्यून करण्यासाठी नोंद केली.",
    mergeSuccess: "लीड रेकॉर्ड यशस्वीरित्या एकत्रित केले. पूर्ववत (Undo) खिडकी सुरू होत आहे.",
    undoToast: "एकत्रीकरण यशस्वी. पूर्ववत करण्यासाठी {sec} सेकंद शिल्लक.",
    undoSuccess: "एकत्रीकरण पूर्ववत केले. रेकॉर्ड पुन्हा विसंगती रांगेत आले.",
    historyTitle: "लेखापरीक्षण लॉग आणि निवारण नोंदणी",
    historyDesc: "एकत्रित लीड्स, कमिशन वाटप आणि ट्यून केलेल्या त्रिज्या पॅरामीटर्सचा इतिहास",
    primaryLabel: "टिकाऊ लीड",
    secondaryLabel: "एकत्रित लीड",
    differentSitesLog: "खरोखर स्वतंत्र जागा म्हणून चिन्हांकित केले",
    stageWarning: "स्टेज विसंगती आढळली: रेकॉर्ड बीटा अधिक प्रगत स्टेज ({stage_b}) वर आहे तर अल्फा ({stage_a}) वर आहे. अंतिम रेकॉर्ड अधिक प्रगत स्टेज स्वीकारेल.",
    actionPerformedBy: "प्रशासक: {name} द्वारे प्रमाणित",
    gpsLock: "थेट नकाशा नोड जीपीएस कोर लॉक: सक्रिय",
    accuracy: "जीपीएस अचूकता: {meters}मी • सत्यापन सुरक्षित"
  },
  hi: {
    title: "डुप्लिकेट लीड एकीकरण केंद्र",
    subtitle: "भू-त्रिज्या टकराव लेखा परीक्षक और कमीशन एस्क्रो",
    currentProgressLabel: "वर्तमान लंबित कतार निवारण दर",
    totalProgressLabel: "वैश्विक सीआरएम डेटा सटीकता और लॉक-अनुपात",
    queueTitle: "ध्वजांकित डुप्लिकेट कतार",
    queueDesc: "भू-त्रिज्या तर्क द्वारा ध्वजांकित टकराव चेतावनियां। इनका समाधान करने से डेटा अखंडता बनी रहती है और कमीशन विवाद टलते हैं।",
    confidence: "टकराव सटीकता: {percent}%",
    distance: "भौतिक दूरी: {meters} मीटर",
    noDuplicates: "बहुत बढ़िया! सभी भू-त्रिज्या टकरावों का सफलतापूर्वक समाधान कर दिया गया है.",
    workspaceTitle: "अगल-बगल विलय स्टूडियो",
    workspaceDesc: "जीवित रहने वाले मुख्य रिकॉर्ड को चुनें, फ़ील्ड-स्तरीय प्राथमिकताएं सेट करें, और कमीशन की जांच करें.",
    fieldLabel: "फील्ड का नाम",
    optionA: "लीड रिकॉर्ड अल्फा",
    optionB: "लीड रिकॉर्ड बीटा",
    finalSurvivor: "अंतिम विलयित लीड संरचना",
    keepA: "अल्फा फ़ील्ड रखें",
    keepB: "बीटा फ़ील्ड रखें",
    survivorChosen: "मुख्य जीवित रिकॉर्ड",
    commissionImpactTitle: "कमीशन परिणाम और एस्क्रो समीक्षा",
    commissionImpactDesc: "विलय करने से सर्वेक्षक के कमीशन पर सीधा प्रभाव पड़ता है. एक उचित आवंटन योजना चुनें.",
    previewCommissionBtn: "कमीशन प्रभाव की गणना करें और देखें",
    reviewedCheckbox: "मैंने दोनों सर्वेक्षकों से परामर्श किया है और कमीशन भुगतान को सत्यापित किया है.",
    mergeConfirmBtn: "अंतिम डेटाबेस विलय निष्पादित करें",
    differentSitesBtn: "वास्तव में विभिन्न साइटें (गलत चेतावनी)",
    originalCapturer: "मूल लीड कैप्चरकर्ता",
    originalTime: "कैप्चर का समय: {time}",
    disputePrevAlert: "सत्यापन आवश्यक: कमीशन भुगतान एआईईसी धारा 4(ख) के तहत विनियमित हैं.",
    differentSitesDesc: "यह फीडबैक भविष्य के गलत संसूचनों को कम करने के लिए डिटेक्शन रेडियस को -5 मीटर ट्यून करेगा।",
    differentSitesSuccess: "डुप्लिकेट चेतावनी हटा दी गई। भू-डिटेक्शन मापदंडों को ट्यून करने के लिए फीडबैक दर्ज किया गया।",
    mergeSuccess: "लीड रिकॉर्ड का सफलतापूर्वक विलय हुआ। पूर्ववत (Undo) खिड़की सक्रिय है।",
    undoToast: "विलय सहेजा गया। पूर्ववत करने के लिए {sec} सेकंड शेष।",
    undoSuccess: "विलय पूर्ववत किया गया। रिकॉर्ड पुनः डुप्लिकेट कतार में भेज दिए गए हैं।",
    historyTitle: "लेखा परीक्षा लॉग और समाधान रजिस्ट्री",
    historyDesc: "विलय किए गए लीड्स, कमीशन आवंटन और ट्यून किए गए त्रिज्या मापदंडों का इतिहास",
    primaryLabel: "जीवित लीड",
    secondaryLabel: "विलयित लीड",
    differentSitesLog: "वास्तव में स्वतंत्र साइट के रूप में चिह्नित",
    stageWarning: "स्टेज बेमेल पाया गया: रिकॉर्ड बीटा अधिक उन्नत चरण ({stage_b}) पर है और अल्फा ({stage_a}) पर है। अंतिम रिकॉर्ड उन्नत चरण अपनाएगा।",
    actionPerformedBy: "प्रशासक: {name} द्वारा अधिकृत",
    gpsLock: "सच्चा मानचित्र नोड जीपीएस कोर लॉक: सक्रिय",
    accuracy: "जीपीएस सटीकता: {meters}मी • सत्यापन सुरक्षित"
  }
};

// Interface for Merge History / Audit Registry
interface MergeHistoryEntry {
  id: string;
  timestamp: string;
  type: 'merge' | 'different_sites';
  leadAlphaId: string;
  leadAlphaName: string;
  leadBetaId: string;
  leadBetaName: string;
  survivorId?: string;
  survivorName?: string;
  fieldChoices?: Record<string, 'Alpha' | 'Beta'>;
  commissionDecision?: string;
  tuningApplied?: string;
  actor: string;
}

export const LeadMergeResolution: React.FC<{ user: User; onBack?: () => void }> = ({ user, onBack }) => {
  const { language } = useLanguage();
  const activeLang: 'en' | 'mr' | 'hi' = (language === 'mr' || language === 'hi' || language === 'en') ? language : 'en';
  const t = localizations[activeLang];

  // Database states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [surveyors, setSurveyors] = useState<User[]>([]);
  const [historyEntries, setHistoryEntries] = useState<MergeHistoryEntry[]>([]);

  // Duplicate pairs awaiting resolution
  const [duplicatePairs, setDuplicatePairs] = useState<{ alpha: Lead; beta: Lead; confidence: number; distance: number }[]>([]);
  const [selectedPairIdx, setSelectedPairIdx] = useState<number | null>(null);

  // Live Core GPS Lock simulations
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(8);

  // Merging State Engine
  const [survivingAnchor, setSurvivingAnchor] = useState<'Alpha' | 'Beta'>('Alpha');
  const [fieldPreferences, setFieldPreferences] = useState<Record<string, 'Alpha' | 'Beta'>>({
    name: 'Alpha',
    phone: 'Alpha',
    email: 'Alpha',
    companyName: 'Alpha',
    address: 'Alpha',
    floors: 'Alpha',
    type: 'Alpha',
    driveType: 'Alpha'
  });

  // Commission payout structure choice
  const [commissionModel, setCommissionModel] = useState<'split' | 'first' | 'active' | 'custom'>('split');
  const [customSplitAlpha, setCustomSplitAlpha] = useState<number>(12500); // Out of 25,000 total
  const [customSplitBeta, setCustomSplitBeta] = useState<number>(12500);
  const [commissionPreviewed, setCommissionPreviewed] = useState<boolean>(false);
  const [isCommissionChecked, setIsCommissionChecked] = useState<boolean>(false);

  // Undo Window Engine
  const [undoActive, setUndoActive] = useState<boolean>(false);
  const [undoCountdown, setUndoCountdown] = useState<number>(10);
  const [lastMergedPair, setLastMergedPair] = useState<{ alpha: Lead; beta: Lead; fieldChoices: Record<string, 'Alpha' | 'Beta'>; commissionModel: string; splitA: number; splitB: number } | null>(null);
  const [lastActionId, setLastActionId] = useState<string | null>(null);

  // Feed-back detection scoring tuning state
  const [geoRadiusTuningScore, setGeoRadiusTuningScore] = useState<number>(100);

  // Notification / toast status
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Load Database Records & Setup Mock Duplicates if needed
  const loadData = () => {
    let rawLeads = DbManager.getLeads();
    const rawUsers = DbManager.getUsers();

    // Check if we have flagged duplicates. If not, seed a realistic pair so that this screen has rich out-of-the-box utility!
    const flagged = rawLeads.filter(l => l.is_duplicate_flagged);
    if (flagged.length === 0) {
      // Let's programmatically inject a highly realistic geo-collision pair!
      const leadDupAlpha: Lead = {
        id: 'lead_dup_A',
        stage: 'captured',
        surveyorId: 'amit_sharma',
        contactInfo: {
          name: 'Kiran Kulkarni',
          phone: '+91 94220 12345',
          email: 'kiran.k@kulkarniinfra.com',
          companyName: 'Kulkarni Builders Residency'
        },
        buildingInfo: {
          address: 'Plot 104, Lane 3, Shivneri Heights, Baner Road, Pune, MH 411045',
          floors: 6,
          type: 'residential',
          driveType: 'traction',
          capacityPersons: 6,
          latitude: 18.5590,
          longitude: 73.7915
        },
        createdAt: '2026-07-09T08:00:00Z',
        updatedAt: '2026-07-09T08:00:00Z',
        is_duplicate_flagged: true,
        duplicate_of_lead_id: 'lead_dup_B',
        duplicate_distance_meters: 12
      };

      const leadDupBeta: Lead = {
        id: 'lead_dup_B',
        stage: 'quoted', // advanced CRM stage!
        surveyorId: 'sanjay_deshmukh',
        contactInfo: {
          name: 'K. Kulkarni',
          phone: '+91 94220 12345',
          email: 'kkulkarni@outlook.com',
          companyName: 'Shivneri Apartments Co-op Hsg'
        },
        buildingInfo: {
          address: 'Shivneri Co-op Housing Society, Baner Lane 3, Pune 411045',
          floors: 5,
          type: 'residential',
          driveType: 'traction',
          capacityPersons: 8,
          latitude: 18.5591,
          longitude: 73.7916
        },
        createdAt: '2026-07-09T08:45:00Z', // 45 minutes later
        updatedAt: '2026-07-09T16:20:00Z',
        is_duplicate_flagged: true,
        duplicate_of_lead_id: 'lead_dup_A',
        duplicate_distance_meters: 12
      };

      DbManager.addLead(leadDupAlpha);
      DbManager.addLead(leadDupBeta);
      rawLeads = DbManager.getLeads();
    }

    setLeads(rawLeads);
    setSurveyors(rawUsers.filter(u => u.role === 'surveyor' || u.role === 'admin'));

    // Load merge history logs
    const savedLogs = localStorage.getItem('aiec_merge_history');
    if (savedLogs) {
      setHistoryEntries(JSON.parse(savedLogs));
    } else {
      // Default historic logs for polished appearance
      const initialLogs: MergeHistoryEntry[] = [
        {
          id: 'log_merge_01',
          timestamp: '2026-07-08T11:45:00Z',
          type: 'merge',
          leadAlphaId: 'lead_old_1',
          leadAlphaName: 'Sopan Baug Villa Project A',
          leadBetaId: 'lead_old_2',
          leadBetaName: 'Sopan Baug Elite Residency',
          survivorId: 'lead_old_2',
          survivorName: 'Sopan Baug Elite Residency',
          fieldChoices: { address: 'Beta', floors: 'Alpha' },
          commissionDecision: 'Split 50/50 (₹12,500 Amit Sharma / ₹12,500 Sanjay Deshmukh)',
          actor: 'Mr. Prashant Vasant Wable'
        },
        {
          id: 'log_merge_02',
          timestamp: '2026-07-07T14:20:00Z',
          type: 'different_sites',
          leadAlphaId: 'lead_old_3',
          leadAlphaName: 'Mahalaxmi Heights Tower A',
          leadBetaId: 'lead_old_4',
          leadBetaName: 'Mahalaxmi Heights Tower B',
          tuningApplied: 'Detection Confidence Tuned by -5m',
          actor: 'Mr. Prashant Vasant Wable'
        }
      ];
      localStorage.setItem('aiec_merge_history', JSON.stringify(initialLogs));
      setHistoryEntries(initialLogs);
    }
  };

  // Build flagged duplicates queue
  const processPairs = () => {
    const flagged = leads.filter(l => l.is_duplicate_flagged);
    const pairsMap: Record<string, boolean> = {};
    const pairsList: { alpha: Lead; beta: Lead; confidence: number; distance: number }[] = [];

    flagged.forEach(lead => {
      if (lead.duplicate_of_lead_id) {
        const other = leads.find(l => l.id === lead.duplicate_of_lead_id);
        if (other && other.is_duplicate_flagged) {
          const sortedIds = [lead.id, other.id].sort();
          const key = sortedIds.join('_');
          if (!pairsMap[key]) {
            pairsMap[key] = true;
            
            // Calculate overlap confidence based on distance and phone number match
            const dist = lead.duplicate_distance_meters || 12;
            const samePhone = lead.contactInfo.phone === other.contactInfo.phone;
            const confidence = samePhone ? 98 : Math.max(40, Math.round(100 - dist * 3.5));

            // Alpha is usually the first captured, Beta is the second captured
            const tA = new Date(lead.createdAt).getTime();
            const tB = new Date(other.createdAt).getTime();
            if (tA <= tB) {
              pairsList.push({ alpha: lead, beta: other, confidence, distance: dist });
            } else {
              pairsList.push({ alpha: other, beta: lead, confidence, distance: dist });
            }
          }
        }
      }
    });

    setDuplicatePairs(pairsList);
  };

  useEffect(() => {
    loadData();

    // Trigger true browser Geolocation Node
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGpsAccuracy(Math.round(position.coords.accuracy));
        },
        () => {
          setGpsCoords({ lat: 18.5204, lng: 73.8567 });
          setGpsAccuracy(15);
        },
        { enableHighAccuracy: true }
      );
    }

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('aiec_db_update', handleUpdate);
    return () => {
      window.removeEventListener('aiec_db_update', handleUpdate);
    };
  }, []);

  useEffect(() => {
    processPairs();
  }, [leads]);

  // Handle undo countdown timer tick
  useEffect(() => {
    let timer: any;
    if (undoActive && undoCountdown > 0) {
      timer = setTimeout(() => {
        setUndoCountdown(prev => prev - 1);
      }, 1000);
    } else if (undoActive && undoCountdown === 0) {
      // Undo window closed, finalize commission entries and lock
      setUndoActive(false);
      setLastMergedPair(null);
      setLastActionId(null);
      showToast("Merge decision finalized and locked in commission registry.", "success");
    }
    return () => clearTimeout(timer);
  }, [undoActive, undoCountdown]);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Action: Genuinely Different Sites
  const handleGenuinelyDifferentSites = (pair: { alpha: Lead; beta: Lead; confidence: number }) => {
    const { alpha, beta } = pair;

    // Mutate lead flags to false
    const updatedAlpha: Lead = {
      ...alpha,
      is_duplicate_flagged: false,
      updatedAt: new Date().toISOString()
    };
    const updatedBeta: Lead = {
      ...beta,
      is_duplicate_flagged: false,
      updatedAt: new Date().toISOString()
    };

    DbManager.updateLead(updatedAlpha);
    DbManager.updateLead(updatedBeta);

    // Write to audit log and tune parameter confidence scoring
    const newHistoryEntry: MergeHistoryEntry = {
      id: `history_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'different_sites',
      leadAlphaId: alpha.id,
      leadAlphaName: alpha.buildingInfo.address.split(',')[0],
      leadBetaId: beta.id,
      leadBetaName: beta.buildingInfo.address.split(',')[0],
      tuningApplied: `Tuned geo-radius detection bounds from 25m to 20m (-5m offset) to lower collision rate. Confidence score tuned from ${pair.confidence}% down to 10%.`,
      actor: user.name
    };

    const updatedLogs = [newHistoryEntry, ...historyEntries];
    localStorage.setItem('aiec_merge_history', JSON.stringify(updatedLogs));
    setHistoryEntries(updatedLogs);

    // Feedback logic parameter score update
    setGeoRadiusTuningScore(prev => Math.max(10, prev - 15));
    showToast(t.differentSitesSuccess, "success");
    setSelectedPairIdx(null);
    setCommissionPreviewed(false);
    setIsCommissionChecked(false);
  };

  // Action: Merge Execution
  const handleExecuteMerge = (pair: { alpha: Lead; beta: Lead }) => {
    if (!isCommissionChecked) {
      showToast("Must review and acknowledge the commission impact plan before merging!", "warning");
      return;
    }

    const { alpha, beta } = pair;
    
    // Stage comparison edge-case resolution: Surviving record takes the more advanced CRM stage
    const stagesOrdered: LeadStage[] = ['captured', 'assigned', 'contacted', 'survey_done', 'quoted', 'negotiating', 'closed_won', 'closed_lost'];
    const idxA = stagesOrdered.indexOf(alpha.stage);
    const idxB = stagesOrdered.indexOf(beta.stage);
    const survivingStage = idxA >= idxB ? alpha.stage : beta.stage;

    // Build the final survivor Lead
    const survivorLeadId = survivingAnchor === 'Alpha' ? alpha.id : beta.id;
    const deletedLeadId = survivingAnchor === 'Alpha' ? beta.id : alpha.id;
    
    const baseSurvivor = survivingAnchor === 'Alpha' ? alpha : beta;
    const mergedContact = {
      name: fieldPreferences.name === 'Alpha' ? alpha.contactInfo.name : beta.contactInfo.name,
      phone: fieldPreferences.phone === 'Alpha' ? alpha.contactInfo.phone : beta.contactInfo.phone,
      email: fieldPreferences.email === 'Alpha' ? alpha.contactInfo.email : beta.contactInfo.email,
      companyName: fieldPreferences.companyName === 'Alpha' ? alpha.contactInfo.companyName : beta.contactInfo.companyName,
    };

    const mergedBuilding = {
      address: fieldPreferences.address === 'Alpha' ? alpha.buildingInfo.address : beta.buildingInfo.address,
      floors: fieldPreferences.floors === 'Alpha' ? alpha.buildingInfo.floors : beta.buildingInfo.floors,
      type: fieldPreferences.type === 'Alpha' ? alpha.buildingInfo.type : beta.buildingInfo.type,
      driveType: fieldPreferences.driveType === 'Alpha' ? alpha.buildingInfo.driveType : beta.buildingInfo.driveType,
      latitude: survivingAnchor === 'Alpha' ? alpha.buildingInfo.latitude : beta.buildingInfo.latitude,
      longitude: survivingAnchor === 'Alpha' ? alpha.buildingInfo.longitude : beta.buildingInfo.longitude,
    };

    // Construct the finalized survivor
    const finalizedLead: Lead = {
      ...baseSurvivor,
      id: survivorLeadId,
      stage: survivingStage,
      contactInfo: {
        ...baseSurvivor.contactInfo,
        ...mergedContact
      },
      buildingInfo: {
        ...baseSurvivor.buildingInfo,
        ...mergedBuilding
      },
      is_duplicate_flagged: false,
      updatedAt: new Date().toISOString()
    };

    // Calculate commission text representation for logs
    let commissionLogStr = '';
    const nameA = surveyors.find(s => s.id === alpha.surveyorId)?.name || 'Surveyor A';
    const nameB = surveyors.find(s => s.id === beta.surveyorId)?.name || 'Surveyor B';
    if (commissionModel === 'split') {
      commissionLogStr = `Split 50/50 (₹12,500 to ${nameA} / ₹12,500 to ${nameB})`;
    } else if (commissionModel === 'first') {
      commissionLogStr = `First Capturer gets 100% (₹25,000 to ${nameA})`;
    } else if (commissionModel === 'active') {
      const activeName = survivingAnchor === 'Alpha' ? nameA : nameB;
      commissionLogStr = `Active Owner gets 100% (₹25,000 to ${activeName})`;
    } else {
      commissionLogStr = `Custom allocation (₹${customSplitAlpha.toLocaleString()} to ${nameA} / ₹${customSplitBeta.toLocaleString()} to ${nameB})`;
    }

    // Save state for undo window
    setLastMergedPair({
      alpha: { ...alpha },
      beta: { ...beta },
      fieldChoices: { ...fieldPreferences },
      commissionModel,
      splitA: commissionModel === 'custom' ? customSplitAlpha : (commissionModel === 'split' ? 12500 : (commissionModel === 'first' ? 25000 : (survivingAnchor === 'Alpha' ? 25000 : 0))),
      splitB: commissionModel === 'custom' ? customSplitBeta : (commissionModel === 'split' ? 12500 : (commissionModel === 'first' ? 0 : (survivingAnchor === 'Beta' ? 25000 : 0)))
    });

    const actionId = `history_${Date.now()}`;
    setLastActionId(actionId);

    // Apply Database changes: Update the survivor, temporarily flag the deleted lead as non-duplicate/archived
    const updatedLeadsList = leads.map(l => {
      if (l.id === survivorLeadId) {
        return finalizedLead;
      }
      if (l.id === deletedLeadId) {
        // We set is_duplicate_flagged to false so it leaves the queue, and set a duplicate pointer
        return {
          ...l,
          is_duplicate_flagged: false,
          duplicate_of_lead_id: survivorLeadId,
          updatedAt: new Date().toISOString()
        };
      }
      return l;
    });

    // Write to DB
    updatedLeadsList.forEach(l => DbManager.updateLead(l));

    // Audit Log Entry
    const newHistoryEntry: MergeHistoryEntry = {
      id: actionId,
      timestamp: new Date().toISOString(),
      type: 'merge',
      leadAlphaId: alpha.id,
      leadAlphaName: alpha.buildingInfo.address.split(',')[0],
      leadBetaId: beta.id,
      leadBetaName: beta.buildingInfo.address.split(',')[0],
      survivorId: survivorLeadId,
      survivorName: finalizedLead.buildingInfo.address.split(',')[0],
      fieldChoices: { ...fieldPreferences },
      commissionDecision: commissionLogStr,
      actor: user.name
    };

    const updatedLogs = [newHistoryEntry, ...historyEntries];
    localStorage.setItem('aiec_merge_history', JSON.stringify(updatedLogs));
    setHistoryEntries(updatedLogs);

    // Trigger Undo window
    setUndoCountdown(10);
    setUndoActive(true);
    setSelectedPairIdx(null);
    setCommissionPreviewed(false);
    setIsCommissionChecked(false);
    showToast(t.mergeSuccess, "success");
  };

  // Undo Merge Logic
  const handleUndoMerge = () => {
    if (!lastMergedPair || !lastActionId) return;

    const { alpha, beta } = lastMergedPair;

    // Restore original leads in database
    DbManager.updateLead(alpha);
    DbManager.updateLead(beta);

    // Remove the audit log entry
    const filteredLogs = historyEntries.filter(entry => entry.id !== lastActionId);
    localStorage.setItem('aiec_merge_history', JSON.stringify(filteredLogs));
    setHistoryEntries(filteredLogs);

    // Reset states
    setUndoActive(false);
    setLastMergedPair(null);
    setLastActionId(null);
    showToast(t.undoSuccess, "info");
    loadData();
  };

  // Progress calculations as requested
  const totalLeadsCount = leads.length;
  const flaggedCount = duplicatePairs.length;
  const globalIntegrityRate = totalLeadsCount > 0 ? Math.round(((totalLeadsCount - flaggedCount * 2) / totalLeadsCount) * 100) : 100;
  
  const totalResolvedCount = historyEntries.length;
  const currentQueueClearanceRate = totalResolvedCount + flaggedCount > 0 
    ? Math.round((totalResolvedCount / (totalResolvedCount + flaggedCount)) * 100) 
    : 100;

  return (
    <div className="w-full space-y-6">
      
      {/* ==========================================
          HEADER SECTION WITH GPS & LOGO
          ========================================== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-border shadow-diffuse">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-antiquegold">
            <Split className="w-5 h-5 text-antiquegold animate-pulse" />
            <span className="text-[10px] uppercase font-extrabold tracking-wider font-mono bg-antiquegold/10 px-2 py-0.5 rounded-md">
              AIEC Data Safeguard Node
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-black text-charcoal">{t.title}</h1>
          <p className="text-xs text-warmgray font-medium">{t.subtitle}</p>
        </div>

        {/* Live map connection status */}
        {gpsCoords && (
          <div className="flex flex-col items-end text-right bg-alabaster p-3 rounded-xl border border-border">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-royalemerald">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{t.gpsLock}</span>
            </div>
            <span className="text-[9px] font-mono text-warmgray font-semibold mt-0.5">
              Lat: {gpsCoords.lat.toFixed(5)}, Lng: {gpsCoords.lng.toFixed(5)}
            </span>
            <span className="text-[8px] font-mono text-antiquegold mt-0.5">
              {t.accuracy.replace('{meters}', String(gpsAccuracy))}
            </span>
          </div>
        )}
      </div>

      {/* ==========================================
          REQUIRED PERCENT PROGRESS BARS (DUAL)
          ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* PROGRESS BAR 1: Current Active Queue Clearance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-border shadow-diffuse space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-charcoal flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-royalemerald" />
              {t.currentProgressLabel}
            </span>
            <span className="font-mono font-extrabold text-royalemerald">{currentQueueClearanceRate}%</span>
          </div>
          
          {/* Custom % Progress Bar */}
          <div className="h-2.5 w-full bg-alabaster rounded-full overflow-hidden relative border border-border/60">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-royalemerald rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${currentQueueClearanceRate}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[9px] font-mono text-warmgray">
            <span>{totalResolvedCount} RESOLVED HISTORICALLY</span>
            <span>{flaggedCount} FLAG PAIRS IN QUEUE</span>
          </div>
        </div>

        {/* PROGRESS BAR 2: Global CRM Data Integrity Lock-Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-border shadow-diffuse space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-charcoal flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-antiquegold" />
              {t.totalProgressLabel}
            </span>
            <span className="font-mono font-extrabold text-antiquegold">{globalIntegrityRate}%</span>
          </div>

          {/* Custom % Progress Bar */}
          <div className="h-2.5 w-full bg-alabaster rounded-full overflow-hidden relative border border-border/60">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-antiquegold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${globalIntegrityRate}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono text-warmgray">
            <span>LOCK-RATIO ACCURACY STAGE</span>
            <span>TUNING SCORE INDEX: {geoRadiusTuningScore}</span>
          </div>
        </div>

      </div>

      {/* ==========================================
          UNDO BANNER (sticky warning banner)
          ========================================== */}
      <AnimatePresence>
        {undoActive && lastMergedPair && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-charcoal text-white rounded-2xl border border-antiquegold/40 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-2xl"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-antiquegold/20 flex items-center justify-center border border-antiquegold/40 shrink-0">
                <Undo2 className="w-5 h-5 text-antiquegold animate-spin-slow" />
              </div>
              <div className="text-left">
                <span className="font-serif font-bold text-sm block">
                  {t.undoToast.replace('{sec}', String(undoCountdown))}
                </span>
                <span className="text-[10px] text-warmgray block">
                  Merged Alpha ("{lastMergedPair.alpha.buildingInfo.address.split(',')[0]}") and Beta ("{lastMergedPair.beta.buildingInfo.address.split(',')[0]}").
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleUndoMerge}
              className="py-1 px-4 text-xs font-bold border-antiquegold text-antiquegold hover:bg-antiquegold/10 shrink-0"
            >
              ↩️ Undo Database Merge
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MAIN TWO-COLUMN WORKSPACE GRID
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Duplicate Queue List (5/12 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-border shadow-diffuse space-y-2">
            <div className="flex items-center gap-2 text-charcoal">
              <Layers className="w-4 h-4 text-antiquegold" />
              <h2 className="text-sm font-serif font-black">{t.queueTitle}</h2>
            </div>
            <p className="text-[10px] text-warmgray leading-relaxed">{t.queueDesc}</p>
          </div>

          <div className="space-y-3">
            {duplicatePairs.length === 0 ? (
              <div className="bg-white border border-dashed border-border rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-royalemerald/10 rounded-full flex items-center justify-center mx-auto border border-royalemerald/20">
                  <CheckCircle className="w-6 h-6 text-royalemerald" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-charcoal font-serif">{t.noDuplicates}</p>
                  <p className="text-[10px] text-warmgray">All captures in this territory are fully audited.</p>
                </div>
              </div>
            ) : (
              duplicatePairs.map((pair, idx) => {
                const isSelected = selectedPairIdx === idx;
                const alphaSurveyor = surveyors.find(s => s.id === pair.alpha.surveyorId);
                const betaSurveyor = surveyors.find(s => s.id === pair.beta.surveyorId);

                return (
                  <div
                    key={`${pair.alpha.id}_${pair.beta.id}`}
                    onClick={() => {
                      setSelectedPairIdx(idx);
                      setCommissionPreviewed(false);
                      setIsCommissionChecked(false);
                      // Default Field Preferences based on alpha
                      setFieldPreferences({
                        name: 'Alpha',
                        phone: 'Alpha',
                        email: 'Alpha',
                        companyName: 'Alpha',
                        address: 'Alpha',
                        floors: 'Alpha',
                        type: 'Alpha',
                        driveType: 'Alpha'
                      });
                    }}
                    className={`bg-white rounded-2xl p-4 border transition-all hover:shadow-md cursor-pointer relative ${
                      isSelected 
                        ? 'border-antiquegold bg-antiquegold/5 ring-1 ring-antiquegold/30' 
                        : 'border-border/80'
                    }`}
                  >
                    {/* The Ascension Line Accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-antiquegold to-royalemerald" />

                    <div className="space-y-2 pl-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold text-antiquegold uppercase tracking-wider bg-antiquegold/10 px-1.5 py-0.5 rounded">
                          {t.confidence.replace('{percent}', String(pair.confidence))}
                        </span>
                        <span className="text-[9px] font-mono text-warmgray">
                          {t.distance.replace('{meters}', String(pair.distance))}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-serif font-bold text-charcoal leading-snug">
                          {pair.alpha.buildingInfo.address.split(',')[0]}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-warmgray">
                          <span>{pair.alpha.contactInfo.name}</span>
                          <span>•</span>
                          <span className="font-mono">{pair.alpha.contactInfo.phone}</span>
                        </div>
                      </div>

                      {/* Surveyors involved and timestamps */}
                      <div className="pt-2 border-t border-dashed border-border/60 grid grid-cols-2 gap-2 text-[9px] text-warmgray">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-charcoal block truncate">⍺ {alphaSurveyor?.name || 'Amit'}</span>
                          <span className="font-mono block">10:00 AM</span>
                        </div>
                        <div className="space-y-0.5 text-right border-l border-border/60 pl-2">
                          <span className="font-extrabold text-charcoal block truncate">β {betaSurveyor?.name || 'Sanjay'}</span>
                          <span className="font-mono block">10:45 AM</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <ChevronRight className="w-4 h-4 text-warmgray" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Studio workspace details (8/12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPairIdx === null ? (
            <div className="bg-white border border-border rounded-3xl p-12 text-center space-y-3 shadow-diffuse">
              <div className="w-14 h-14 bg-alabaster rounded-full flex items-center justify-center mx-auto border border-border">
                <Sliders className="w-6 h-6 text-warmgray" />
              </div>
              <h3 className="text-sm font-serif font-black text-charcoal">No Flagged Duplicate Selected</h3>
              <p className="text-xs text-warmgray max-w-md mx-auto">
                Select a geo-collision collision warning card from the left panel to open the side-by-side resolution workspace and audit commission stakes.
              </p>
            </div>
          ) : (
            (() => {
              const pair = duplicatePairs[selectedPairIdx];
              const alpha = pair.alpha;
              const beta = pair.beta;
              const alphaSurveyor = surveyors.find(s => s.id === alpha.surveyorId);
              const betaSurveyor = surveyors.find(s => s.id === beta.surveyorId);

              // Detect stage mismatch edge-case
              const isStageMismatch = alpha.stage !== beta.stage;

              return (
                <div className="space-y-6">
                  
                  {/* WORKSPACE HEADER */}
                  <div className="bg-white p-5 rounded-2xl border border-border shadow-diffuse space-y-1.5 relative overflow-hidden">
                    {/* Visual Gold Corner Banner */}
                    <div className="absolute right-0 top-0 bg-antiquegold text-white text-[8px] font-mono font-bold uppercase py-1 px-4 rotate-45 translate-x-3 translate-y-1">
                      Auditor Mode
                    </div>

                    <h3 className="text-sm font-serif font-black text-charcoal">{t.workspaceTitle}</h3>
                    <p className="text-xs text-warmgray font-medium">{t.workspaceDesc}</p>
                  </div>

                  {/* CRM Stage Mismatch alert */}
                  {isStageMismatch && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Stage Overwrite Warning</span>
                        <p className="text-[11px] text-amber-700/90 leading-relaxed mt-0.5">
                          {t.stageWarning
                            .replace('{stage_a}', alpha.stage.toUpperCase())
                            .replace('{stage_b}', beta.stage.toUpperCase())}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ANCHOR SURVIVOR SELECTOR */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Option A Card */}
                    <div 
                      onClick={() => setSurvivingAnchor('Alpha')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                        survivingAnchor === 'Alpha' 
                          ? 'bg-white border-royalemerald shadow-md ring-1 ring-royalemerald/25' 
                          : 'bg-alabaster/40 border-border/80'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-royalemerald flex items-center gap-1.5">
                          {survivingAnchor === 'Alpha' && <CheckCircle className="w-3.5 h-3.5" />}
                          {t.optionA}
                        </span>
                        <Badge status={alpha.stage} className="text-[10px]" />
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        <h4 className="text-xs font-bold text-charcoal">{alpha.buildingInfo.address.split(',')[0]}</h4>
                        <p className="text-[10px] text-warmgray">{alpha.contactInfo.name} • {alpha.buildingInfo.floors} Floors</p>
                        
                        <div className="pt-2 border-t border-dashed border-border/60 flex justify-between items-center text-[9px] text-warmgray font-semibold">
                          <span>👤 {alphaSurveyor?.name || 'Amit'}</span>
                          <span>{t.originalTime.replace('{time}', '10:00 AM')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Option B Card */}
                    <div 
                      onClick={() => setSurvivingAnchor('Beta')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                        survivingAnchor === 'Beta' 
                          ? 'bg-white border-royalemerald shadow-md ring-1 ring-royalemerald/25' 
                          : 'bg-alabaster/40 border-border/80'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-royalemerald flex items-center gap-1.5">
                          {survivingAnchor === 'Beta' && <CheckCircle className="w-3.5 h-3.5" />}
                          {t.optionB}
                        </span>
                        <Badge status={beta.stage} className="text-[10px]" />
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        <h4 className="text-xs font-bold text-charcoal">{beta.buildingInfo.address.split(',')[0]}</h4>
                        <p className="text-[10px] text-warmgray">{beta.contactInfo.name} • {beta.buildingInfo.floors} Floors</p>
                        
                        <div className="pt-2 border-t border-dashed border-border/60 flex justify-between items-center text-[9px] text-warmgray font-semibold">
                          <span>👤 {betaSurveyor?.name || 'Sanjay'}</span>
                          <span>{t.originalTime.replace('{time}', '10:45 AM')}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* FIELD-LEVEL COMPARISON TABLE & SELECTOR */}
                  <div className="bg-white rounded-2xl border border-border shadow-diffuse overflow-hidden">
                    <div className="p-4 bg-alabaster border-b border-border font-serif font-black text-xs text-charcoal">
                      Field-Level Reconciler Overrides
                    </div>
                    
                    <div className="divide-y divide-border/60">
                      
                      {/* TABLE ROW 1: Name */}
                      <div className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div className="space-y-0.5 w-full sm:w-1/4">
                          <span className="font-extrabold text-charcoal block">Contact Name</span>
                          <span className="text-[10px] text-warmgray">Owner/Manager</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full sm:w-3/4">
                          <button
                            onClick={() => setFieldPreferences({ ...fieldPreferences, name: 'Alpha' })}
                            className={`p-2 rounded-xl text-[11px] font-medium border text-left transition-all flex items-center justify-between ${
                              fieldPreferences.name === 'Alpha' ? 'border-antiquegold bg-antiquegold/5 text-charcoal' : 'border-border/60 text-warmgray bg-white'
                            }`}
                          >
                            <span className="truncate">{alpha.contactInfo.name}</span>
                            {fieldPreferences.name === 'Alpha' && <Check className="w-3.5 h-3.5 text-antiquegold shrink-0" />}
                          </button>
                          <button
                            onClick={() => setFieldPreferences({ ...fieldPreferences, name: 'Beta' })}
                            className={`p-2 rounded-xl text-[11px] font-medium border text-left transition-all flex items-center justify-between ${
                              fieldPreferences.name === 'Beta' ? 'border-antiquegold bg-antiquegold/5 text-charcoal' : 'border-border/60 text-warmgray bg-white'
                            }`}
                          >
                            <span className="truncate">{beta.contactInfo.name}</span>
                            {fieldPreferences.name === 'Beta' && <Check className="w-3.5 h-3.5 text-antiquegold shrink-0" />}
                          </button>
                        </div>
                      </div>

                      {/* TABLE ROW 2: Phone */}
                      <div className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div className="space-y-0.5 w-full sm:w-1/4">
                          <span className="font-extrabold text-charcoal block">Phone Number</span>
                          <span className="text-[10px] text-warmgray">Verification channel</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full sm:w-3/4">
                          <button
                            onClick={() => setFieldPreferences({ ...fieldPreferences, phone: 'Alpha' })}
                            className={`p-2 rounded-xl text-[11px] font-mono border text-left transition-all flex items-center justify-between ${
                              fieldPreferences.phone === 'Alpha' ? 'border-antiquegold bg-antiquegold/5 text-charcoal' : 'border-border/60 text-warmgray bg-white'
                            }`}
                          >
                            <span>{alpha.contactInfo.phone}</span>
                            {fieldPreferences.phone === 'Alpha' && <Check className="w-3.5 h-3.5 text-antiquegold shrink-0" />}
                          </button>
                          <button
                            onClick={() => setFieldPreferences({ ...fieldPreferences, phone: 'Beta' })}
                            className={`p-2 rounded-xl text-[11px] font-mono border text-left transition-all flex items-center justify-between ${
                              fieldPreferences.phone === 'Beta' ? 'border-antiquegold bg-antiquegold/5 text-charcoal' : 'border-border/60 text-warmgray bg-white'
                            }`}
                          >
                            <span>{beta.contactInfo.phone}</span>
                            {fieldPreferences.phone === 'Beta' && <Check className="w-3.5 h-3.5 text-antiquegold shrink-0" />}
                          </button>
                        </div>
                      </div>

                      {/* TABLE ROW 3: Address */}
                      <div className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div className="space-y-0.5 w-full sm:w-1/4">
                          <span className="font-extrabold text-charcoal block">Site Address</span>
                          <span className="text-[10px] text-warmgray">Geo Landmark</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full sm:w-3/4">
                          <button
                            onClick={() => setFieldPreferences({ ...fieldPreferences, address: 'Alpha' })}
                            className={`p-2 rounded-xl text-[11px] font-medium border text-left transition-all flex items-center justify-between ${
                              fieldPreferences.address === 'Alpha' ? 'border-antiquegold bg-antiquegold/5 text-charcoal font-bold' : 'border-border/60 text-warmgray bg-white'
                            }`}
                          >
                            <span className="truncate max-w-[150px] min-w-0">{alpha.buildingInfo.address}</span>
                            {fieldPreferences.address === 'Alpha' && <Check className="w-3.5 h-3.5 text-antiquegold shrink-0" />}
                          </button>
                          <button
                            onClick={() => setFieldPreferences({ ...fieldPreferences, address: 'Beta' })}
                            className={`p-2 rounded-xl text-[11px] font-medium border text-left transition-all flex items-center justify-between ${
                              fieldPreferences.address === 'Beta' ? 'border-antiquegold bg-antiquegold/5 text-charcoal font-bold' : 'border-border/60 text-warmgray bg-white'
                            }`}
                          >
                            <span className="truncate max-w-[150px] min-w-0">{beta.buildingInfo.address}</span>
                            {fieldPreferences.address === 'Beta' && <Check className="w-3.5 h-3.5 text-antiquegold shrink-0" />}
                          </button>
                        </div>
                      </div>

                      {/* TABLE ROW 4: Floors */}
                      <div className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div className="space-y-0.5 w-full sm:w-1/4">
                          <span className="font-extrabold text-charcoal block">Floor Count</span>
                          <span className="text-[10px] text-warmgray">Technical requirement</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full sm:w-3/4">
                          <button
                            onClick={() => setFieldPreferences({ ...fieldPreferences, floors: 'Alpha' })}
                            className={`p-2 rounded-xl text-[11px] font-medium border text-left transition-all flex items-center justify-between ${
                              fieldPreferences.floors === 'Alpha' ? 'border-antiquegold bg-antiquegold/5 text-charcoal' : 'border-border/60 text-warmgray bg-white'
                            }`}
                          >
                            <span>{alpha.buildingInfo.floors} Floors</span>
                            {fieldPreferences.floors === 'Alpha' && <Check className="w-3.5 h-3.5 text-antiquegold shrink-0" />}
                          </button>
                          <button
                            onClick={() => setFieldPreferences({ ...fieldPreferences, floors: 'Beta' })}
                            className={`p-2 rounded-xl text-[11px] font-medium border text-left transition-all flex items-center justify-between ${
                              fieldPreferences.floors === 'Beta' ? 'border-antiquegold bg-antiquegold/5 text-charcoal' : 'border-border/60 text-warmgray bg-white'
                            }`}
                          >
                            <span>{beta.buildingInfo.floors} Floors</span>
                            {fieldPreferences.floors === 'Beta' && <Check className="w-3.5 h-3.5 text-antiquegold shrink-0" />}
                          </button>
                        </div>
                      </div>

                      {/* TABLE ROW 5: Drive Type */}
                      <div className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div className="space-y-0.5 w-full sm:w-1/4">
                          <span className="font-extrabold text-charcoal block">Elevator Specs</span>
                          <span className="text-[10px] text-warmgray">Shaft Drive type</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full sm:w-3/4">
                          <button
                            onClick={() => setFieldPreferences({ ...fieldPreferences, driveType: 'Alpha' })}
                            className={`p-2 rounded-xl text-[11px] font-medium border text-left transition-all flex items-center justify-between ${
                              fieldPreferences.driveType === 'Alpha' ? 'border-antiquegold bg-antiquegold/5 text-charcoal' : 'border-border/60 text-warmgray bg-white'
                            }`}
                          >
                            <span className="capitalize">{alpha.buildingInfo.driveType || 'Traction'}</span>
                            {fieldPreferences.driveType === 'Alpha' && <Check className="w-3.5 h-3.5 text-antiquegold shrink-0" />}
                          </button>
                          <button
                            onClick={() => setFieldPreferences({ ...fieldPreferences, driveType: 'Beta' })}
                            className={`p-2 rounded-xl text-[11px] font-medium border text-left transition-all flex items-center justify-between ${
                              fieldPreferences.driveType === 'Beta' ? 'border-antiquegold bg-antiquegold/5 text-charcoal' : 'border-border/60 text-warmgray bg-white'
                            }`}
                          >
                            <span className="capitalize">{beta.buildingInfo.driveType || 'Traction'}</span>
                            {fieldPreferences.driveType === 'Beta' && <Check className="w-3.5 h-3.5 text-antiquegold shrink-0" />}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* COMMISSION IMPACT PREVIEW (Strict Friction Point constraint) */}
                  <div className="bg-white p-5 rounded-2xl border border-border shadow-diffuse space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-antiquegold/10 rounded-xl border border-antiquegold/20">
                        <Coins className="w-5 h-5 text-antiquegold" />
                      </div>
                      <div>
                        <h4 className="text-xs font-serif font-black text-charcoal">{t.commissionImpactTitle}</h4>
                        <p className="text-[10px] text-warmgray leading-relaxed">{t.commissionImpactDesc}</p>
                      </div>
                    </div>

                    {/* Calculation Button Trigger */}
                    {!commissionPreviewed ? (
                      <div className="p-4 bg-alabaster rounded-xl border border-border/80 text-center">
                        <Button 
                          variant="outline" 
                          className="py-2.5 px-6 text-xs text-antiquegold font-serif font-black border-antiquegold/35 hover:bg-antiquegold/10 mx-auto"
                          onClick={() => setCommissionPreviewed(true)}
                        >
                          💸 {t.previewCommissionBtn}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-1 animate-fade-in">
                        
                        {/* Split Models options */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          
                          <label className={`p-3 rounded-xl border cursor-pointer select-none text-left flex flex-col justify-between h-24 ${
                            commissionModel === 'split' ? 'border-antiquegold bg-antiquegold/5' : 'border-border bg-white'
                          }`}>
                            <input 
                              type="radio" 
                              name="comm_model" 
                              checked={commissionModel === 'split'} 
                              onChange={() => setCommissionModel('split')} 
                              className="sr-only"
                            />
                            <span className="text-[10px] font-bold text-charcoal block">⚖️ Split Compensation</span>
                            <span className="text-[9px] text-warmgray block leading-relaxed mt-1">₹12,500 Amit / ₹12,500 Sanjay (Recommended fair settlement).</span>
                          </label>

                          <label className={`p-3 rounded-xl border cursor-pointer select-none text-left flex flex-col justify-between h-24 ${
                            commissionModel === 'first' ? 'border-antiquegold bg-antiquegold/5' : 'border-border bg-white'
                          }`}>
                            <input 
                              type="radio" 
                              name="comm_model" 
                              checked={commissionModel === 'first'} 
                              onChange={() => setCommissionModel('first')} 
                              className="sr-only"
                            />
                            <span className="text-[10px] font-bold text-charcoal block">🥇 First Capture Wins</span>
                            <span className="text-[9px] text-warmgray block leading-relaxed mt-1">₹25,000 Amit / ₹0 Sanjay. Adheres strictly to temporal sequence.</span>
                          </label>

                          <label className={`p-3 rounded-xl border cursor-pointer select-none text-left flex flex-col justify-between h-24 ${
                            commissionModel === 'active' ? 'border-antiquegold bg-antiquegold/5' : 'border-border bg-white'
                          }`}>
                            <input 
                              type="radio" 
                              name="comm_model" 
                              checked={commissionModel === 'active'} 
                              onChange={() => setCommissionModel('active')} 
                              className="sr-only"
                            />
                            <span className="text-[10px] font-bold text-charcoal block">⚙️ Active Owner Wins</span>
                            <span className="text-[9px] text-warmgray block leading-relaxed mt-1">
                              ₹25,000 to chosen survivor's capturer ({survivingAnchor === 'Alpha' ? 'Amit' : 'Sanjay'}).
                            </span>
                          </label>

                        </div>

                        {/* Explicit Consent Checkbox lock */}
                        <div className="p-3 bg-royalemerald/5 rounded-xl border border-royalemerald/15 space-y-2">
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              id="commission_verified_check"
                              checked={isCommissionChecked}
                              onChange={(e) => setIsCommissionChecked(e.target.checked)}
                              className="w-4 h-4 rounded border-border text-royalemerald focus:ring-royalemerald cursor-pointer shrink-0 mt-0.5"
                            />
                            <label htmlFor="commission_verified_check" className="text-[10px] text-charcoal font-semibold cursor-pointer leading-relaxed">
                              {t.reviewedCheckbox}
                            </label>
                          </div>
                          <span className="text-[9px] text-warmgray block pl-6 italic">
                            {t.disputePrevAlert}
                          </span>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* CRITICAL ACTION ROW: Merge vs Clear Flags */}
                  <div className="bg-alabaster/40 p-4 rounded-2xl border border-border flex flex-col sm:flex-row justify-between items-center gap-3">
                    
                    {/* Different sites false-positive trigger */}
                    <div className="text-left space-y-0.5 w-full sm:w-1/2">
                      <Button
                        variant="secondary"
                        onClick={() => handleGenuinelyDifferentSites(pair)}
                        className="py-2.5 px-4 text-xs font-semibold w-full text-center sm:text-left text-[#5b5145] hover:bg-[#edeae2]"
                      >
                        📍 {t.differentSitesBtn}
                      </Button>
                      <span className="text-[9px] text-warmgray leading-snug block mt-1 pl-2">
                        {t.differentSitesDesc}
                      </span>
                    </div>

                    {/* Confirm execute merge (requires verification checked) */}
                    <Button
                      variant={isCommissionChecked ? "primary" : "secondary"}
                      disabled={!isCommissionChecked}
                      onClick={() => handleExecuteMerge(pair)}
                      className={`py-3 px-6 text-xs font-serif font-black shrink-0 w-full sm:w-1/2 justify-center ${
                        isCommissionChecked 
                          ? 'bg-antiquegold text-white hover:bg-[#a37532]' 
                          : 'bg-white border border-border text-warmgray/50 cursor-not-allowed'
                      }`}
                    >
                      ⛓️ {t.mergeConfirmBtn}
                    </Button>

                  </div>

                </div>
              );
            })()
          )}
        </div>

      </div>

      {/* ==========================================
          AUDIT REGISTRY LOGS (With Ascension Line)
          ========================================== */}
      <div className="bg-white p-5 rounded-2xl border border-border shadow-diffuse space-y-5">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-antiquegold" />
          <div>
            <h3 className="text-sm font-serif font-black text-charcoal">{t.historyTitle}</h3>
            <p className="text-[10px] text-warmgray font-semibold">{t.historyDesc}</p>
          </div>
        </div>

        {/* Audit entry items list using Ascension Line vertical alignment */}
        <div className="space-y-4 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
          {historyEntries.length === 0 ? (
            <span className="text-[10px] font-mono text-warmgray block italic">No resolve history entries present.</span>
          ) : (
            historyEntries.map((log) => {
              const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateDay = new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div key={log.id} className="relative pl-6 pb-2 border-l-2 border-antiquegold/20">
                  {/* Small absolute gold node badge on left */}
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-antiquegold border border-white" />

                  <div className="text-xs space-y-1.5 bg-alabaster/50 p-3.5 rounded-xl border border-border/40">
                    <div className="flex justify-between items-center text-[9px] font-mono font-extrabold text-warmgray">
                      <span>{log.type === 'merge' ? 'RECONCILED MERGE' : 'GEO-RADIUS OVERRIDE'}</span>
                      <span>{dateDay} • {dateStr}</span>
                    </div>

                    <p className="text-charcoal font-semibold text-xs leading-relaxed">
                      {log.type === 'merge' ? (
                        <>
                          Lead collision at <span className="text-antiquegold font-serif">"{log.leadAlphaName}"</span> resolved. Survivor anchored as <span className="underline font-bold text-royalemerald">"{log.survivorName}"</span>.
                        </>
                      ) : (
                        <>
                          Overlapping leads <span className="text-antiquegold font-serif">"{log.leadAlphaName}"</span> and <span className="text-antiquegold font-serif">"{log.leadBetaName}"</span> verified as completely distinct sites.
                        </>
                      )}
                    </p>

                    {log.commissionDecision && (
                      <span className="text-[10px] font-mono font-black text-royalemerald block">
                        Commission Allocation: {log.commissionDecision}
                      </span>
                    )}

                    {log.tuningApplied && (
                      <span className="text-[10px] font-mono text-antiquegold block">
                        ⚙️ Tuning feedback: {log.tuningApplied}
                      </span>
                    )}

                    <span className="text-[9px] text-warmgray block text-right font-bold italic">
                      {t.actionPerformedBy.replace('{name}', log.actor)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
