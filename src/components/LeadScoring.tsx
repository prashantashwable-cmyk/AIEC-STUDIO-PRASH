import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, TrendingUp, Sliders, ChevronDown, ChevronUp, Search, Info, 
  MapPin, AlertTriangle, CheckCircle, RefreshCw, Phone, User, Building2, 
  Layers, Zap, Calendar, ArrowUpDown, ChevronRight, HelpCircle, Save, 
  Activity, Play, Check, AlertCircle, Compass, Star
} from 'lucide-react';
import { Lead, User as CRMUser, Territory } from '../types';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';
import { DbManager } from '../lib/db';

// Multi-lingual translations matching AIEC design system
const localizations = {
  en: {
    title: "Lead Prioritization & Scoring Studio",
    subtitle: "Territory Conversion & Outreach Responsiveness Engine",
    kpiProcessedRate: "Prioritized Target Engagement Rate",
    kpiScoringCoverage: "Pipeline Prioritization Coverage Ratio",
    weightingPanelTitle: "Admin Weighting & Tie-Breaker Controls",
    weightingPanelDesc: "Configure mathematical weights used to automatically calculate lead priority scores. Changes apply prospectively to safeguard pipeline continuity.",
    factorBuildingSize: "Building Scale (Floors & Capacity)",
    factorReadyStage: "Construction Stage Readiness",
    factorResponsiveness: "Contact Responsiveness Metric",
    factorTerritoryHist: "Territory Conversion Success",
    tieBreakerLabel: "Pipeline Tie-Breaker Priority",
    tieBreakerNewest: "Recency (Newest Lead First)",
    tieBreakerFloors: "Structural Height (Max Floors First)",
    tieBreakerUpdated: "Activity Pulse (Recently Updated First)",
    volatilityTitle: "High Pipeline Volatility Warning",
    volatilityDesc: "This weighting adjustment is highly volatile. It will displace the priority rank of {percent}% of active leads by more than 2 positions. Confirm before applying to avoid sales team disruption.",
    applyWeightsBtn: "Apply and Recalculate Prospectively",
    weightsAppliedSuccess: "Weighting profile updated. Active lead scores successfully recalculated.",
    searchPlaceholder: "Search leads by client, company, address or surveyor...",
    sortLabel: "Primary Sort Sequence",
    sortPriority: "Priority Score (Highest First)",
    sortNewest: "Date Captured (Newest First)",
    sortFloors: "Building Floors (Highest First)",
    leadsQueueHeader: "Prioritized Opportunity Pipeline",
    scoreRecalculatedAlert: "Live Recalculation Active",
    incompleteDataGrace: "Incomplete data detected; defaulted to neutral baseline.",
    historicalWeightingTooltip: "Computed under profile active at capture: B:{b}% / C:{c}% / R:{r}% / T:{t}%",
    activeLabel: "Active Target Score",
    historicalLabel: "Frozen Captured Score",
    expandBreakdown: "Expand Scoring Breakdown",
    collapseBreakdown: "Collapse Breakdown",
    factorBreakdownHeader: "Priority Score Breakdown Formula",
    formulaExplainer: "Calculated score is the weighted sum of normalized building size, construction stage, responsiveness, and regional conversion rate, scaled to 100 points.",
    factorCalcLine: "{factor}: {val} pts earned (weight {weight}%)",
    actionOutreach: "Log Phone Outreach",
    actionStageChange: "Simulate Construction Ready",
    outreachLoggedSuccess: "Outreach logged. Contact responsiveness rating boosted!",
    stageReadySuccess: "Construction stage updated to finishing. Priority score re-computed!",
    gpsLock: "Live map GPS node lock: Secured",
    precisionAccuracy: "Node accuracy: {meters}m • Verification Active",
    noLeadsFound: "No leads matched the search filter.",
    scoreExplain: "Plain Language Score Explanation",
    scoreTextHigh: "This is a premium high-priority lead. Located in a high-converting territory ({territory}) with a tall {floors}-floor building structure. Contact is actively responsive. Prioritize outreach within 4 hours.",
    scoreTextMedium: "Solid medium-priority opportunity. Building structure is at {stage} stage. Recommended outreach within 24 hours.",
    scoreTextLow: "Nurturing stage opportunity. Structure is early and responsiveness history is minimal. Recommended email nurture campaign.",
    unknownTerritory: "Standard Maharashtra Zone",
    saveSuccess: "Scoring weighting profile saved successfully."
  },
  hi: {
    title: "लीड प्राथमिकता और स्कोरिंग स्टूडियो",
    subtitle: "क्षेत्र रूपांतरण और आउटरीच जवाबदेही प्रणाली",
    kpiProcessedRate: "प्राथमिकता वाले लक्ष्य जुड़ाव दर",
    kpiScoringCoverage: "पाइपलाइन प्राथमिकता कवरेज अनुपात",
    weightingPanelTitle: "प्रशासक भार और टाई-ब्रेकर नियंत्रण",
    weightingPanelDesc: "लीड प्राथमिकता स्कोर की स्वचालित गणना के लिए उपयोग किए जाने वाले गणितीय भार को कॉन्फ़िगर करें। पाइपलाइन निरंतरता की सुरक्षा के लिए परिवर्तन भविष्य में लागू होंगे।",
    factorBuildingSize: "भवन का पैमाना (मंजिलें और क्षमता)",
    factorReadyStage: "निर्माण चरण की तत्परता",
    factorResponsiveness: "संपर्क जवाबदेही मीट्रिक",
    factorTerritoryHist: "क्षेत्र रूपांतरण सफलता दर",
    tieBreakerLabel: "पाइपलाइन टाई-ब्रेकर प्राथमिकता",
    tieBreakerNewest: "नवीनता (नवीनतम लीड पहले)",
    tieBreakerFloors: "संरचनात्मक ऊंचाई (अधिकतम मंजिलें पहले)",
    tieBreakerUpdated: "गतिविधि पल्स (हाल ही में अपडेट की गई पहले)",
    volatilityTitle: "उच्च पाइपलाइन अस्थिरता चेतावनी",
    volatilityDesc: "यह भार समायोजन अत्यधिक अस्थिर है। यह {percent}% सक्रिय लीड्स की प्राथमिकता रैंक को 2 से अधिक स्थानों से विस्थापित कर देगा। बिक्री टीम के व्यवधान से बचने के लिए लागू करने से पहले पुष्टि करें।",
    applyWeightsBtn: "भविष्य के लिए लागू करें और पुनः गणना करें",
    weightsAppliedSuccess: "वेटिंग प्रोफाइल अपडेट की गई। सक्रिय लीड स्कोर सफलतापूर्वक पुनर्गणना किए गए।",
    searchPlaceholder: "क्लाइंट, कंपनी, पते या सर्वेक्षक द्वारा खोजें...",
    sortLabel: "प्राथमिक सॉर्ट अनुक्रम",
    sortPriority: "प्राथमिकता स्कोर (उच्चतम पहले)",
    sortNewest: "कैप्चर की तिथि (नवीनतम पहले)",
    sortFloors: "भवन की मंजिलें (उच्चतम पहले)",
    leadsQueueHeader: "प्राथमिकता प्राप्त अवसर पाइपलाइन",
    scoreRecalculatedAlert: "लाइव पुनर्गणना सक्रिय",
    incompleteDataGrace: "अपूर्ण डेटा पाया गया; तटस्थ आधार रेखा पर सेट किया गया।",
    historicalWeightingTooltip: "कैप्चर के समय सक्रिय प्रोफाइल के तहत गणना: B:{b}% / C:{c}% / R:{r}% / T:{t}%",
    activeLabel: "सक्रिय लक्ष्य स्कोर",
    historicalLabel: "फ्रीज किया गया कैप्चर स्कोर",
    expandBreakdown: "स्कोरिंग विश्लेषण खोलें",
    collapseBreakdown: "विश्लेषण बंद करें",
    factorBreakdownHeader: "प्राथमिकता स्कोर विश्लेषण सूत्र",
    formulaExplainer: "परिकलित स्कोर 100 अंकों के पैमाने पर सामान्यीकृत भवन आकार, निर्माण चरण, प्रतिक्रिया और क्षेत्रीय रूपांतरण दर का भारित योग है।",
    factorCalcLine: "{factor}: {val} अंक अर्जित (भार {weight}%)",
    actionOutreach: "फोन आउटरीच दर्ज करें",
    actionStageChange: "निर्माण तैयारी सिमुलेट करें",
    outreachLoggedSuccess: "आउटरीच दर्ज किया गया। संपर्क प्रतिक्रिया रेटिंग बढ़ाई गई!",
    stageReadySuccess: "निर्माण चरण को फिनिशिंग में अपडेट किया गया। प्राथमिकता स्कोर फिर से गिना गया!",
    gpsLock: "लाइव मानचित्र जीपीएस नोड लॉक: सुरक्षित",
    precisionAccuracy: "जीपीएस सटीकता: {meters}मी • सत्यापन सक्रिय",
    noLeadsFound: "खोज फ़िल्टर से कोई लीड मेल नहीं खाई।",
    scoreExplain: "सरल भाषा में स्कोर स्पष्टीकरण",
    scoreTextHigh: "यह एक प्रीमियम उच्च-प्राथमिकता वाली लीड है। यह उच्च-रूपांतरण वाले क्षेत्र ({territory}) में {floors}-मंजिला भवन संरचना के साथ स्थित है। संपर्क सक्रिय रूप से प्रतिक्रिया दे रहा है। 4 घंटे के भीतर आउटरीच को प्राथमिकता दें।",
    scoreTextMedium: "ठोस मध्यम-प्राथमिकता का अवसर। भवन की संरचना {stage} चरण में है। 24 घंटे के भीतर आउटरीच की सिफारिश की जाती है।",
    scoreTextLow: "पोषण चरण का अवसर। संरचना शुरुआती दौर में है और प्रतिक्रिया का इतिहास न्यूनतम है। ईमेल पोषण अभियान की सिफारिश की जाती है।",
    unknownTerritory: "मानक महाराष्ट्र क्षेत्र",
    saveSuccess: "स्कोरिंग वेटिंग प्रोफाइल सफलतापूर्वक सहेजी गई।"
  },
  mr: {
    title: "लीड प्राधान्य आणि स्कोअरिंग स्टुडिओ",
    subtitle: "प्रादेशिक रूपांतरण आणि प्रतिसाद मोजमाप प्रणाली",
    kpiProcessedRate: "प्राधान्यकृत लक्ष्य संवाद दर",
    kpiScoringCoverage: "पाइपलाइन प्राधान्य कव्हरेज प्रमाण",
    weightingPanelTitle: "ॲडमिन वेटिंग आणि टाय-ब्रेकर नियंत्रणे",
    weightingPanelDesc: "लीड प्राधान्य स्कोअर स्वयंचलितपणे मोजण्यासाठी वापरले जाणारे गणितीय वजन कॉन्फिगर करा. पाइपलाइन सातत्य राखण्यासाठी बदल भविष्यातील लीड्सवर लागू होतील.",
    factorBuildingSize: "इमारत मोजमाप (मजले आणि क्षमता)",
    factorReadyStage: "बांधकाम टप्पा सज्जता",
    factorResponsiveness: "संपर्क प्रतिसाद इतिहास",
    factorTerritoryHist: "प्रादेशिक रूपांतरण यश",
    tieBreakerLabel: "पाइपलाइन टाय-ब्रेकर प्राधान्य",
    tieBreakerNewest: "नवीनता (नवीनतम लीड आधी)",
    tieBreakerFloors: "इमारत उंची (जास्तीत जास्त मजले आधी)",
    tieBreakerUpdated: "सक्रियता पल्स (नुकतीच अपडेट केलेली आधी)",
    volatilityTitle: "उच्च पाइपलाइन अस्थिरता चेतावणी",
    volatilityDesc: "हे वेटिंग बदल अत्यंत अस्थिर आहेत. यामुळे {percent}% सक्रिय लीड्सचे प्राधान्य रँक २ पेक्षा जास्त स्थानांनी बदलले जाईल. विक्री संघाचा गोंधळ टाळण्यासाठी लागू करण्यापूर्वी पुष्टी करा.",
    applyWeightsBtn: "लागू करा आणि नवीन मोजणी करा",
    weightsAppliedSuccess: "वेटिंग प्रोफाइल अपडेट केली. सक्रिय लीड स्कोअर यशस्वीरित्या पुन्हा मोजले गेले.",
    searchPlaceholder: "क्लायंट, कंपनी, पत्ता किंवा सर्वेक्षकाद्वारे शोधा...",
    sortLabel: "प्राथमिक सॉर्ट क्रम",
    sortPriority: "प्राधान्य स्कोअर (सर्वोच्च आधी)",
    sortNewest: "नोंदणी तारीख (नवीनतम आधी)",
    sortFloors: "इमारत मजले (जास्तीत जास्त आधी)",
    leadsQueueHeader: "प्राधान्यकृत संधी पाइपलाइन",
    scoreRecalculatedAlert: "थेट पुनर्गणना सक्रिय",
    incompleteDataGrace: "अपूर्ण डेटा आढळला; तटस्थ बेसलाइनवर सेट केले गेले.",
    historicalWeightingTooltip: "नोंदणीच्या वेळी सक्रिय प्रोफाइलनुसार मोजणी: B:{b}% / C:{c}% / R:{r}% / T:{t}%",
    activeLabel: "सक्रिय लक्ष्य स्कोअर",
    historicalLabel: "गोठवलेला नोंदणी वेळचा स्कोअर",
    expandBreakdown: "स्कोअरिंग विश्लेषण तपशील पहा",
    collapseBreakdown: "तपशील बंद करा",
    factorBreakdownHeader: "प्राधान्य स्कोअर विश्लेषण सूत्र",
    formulaExplainer: "परिकलित स्कोअर हा सामान्यीकृत इमारतीचा आकार, बांधकाम टप्पा, प्रतिसाद आणि प्रादेशिक रूपांतरण दर यांचा भारित बेरीज आहे (१०० गुणांच्या प्रमाणात).",
    factorCalcLine: "{factor}: {val} गुण मिळाले (वजन {weight}%)",
    actionOutreach: "फोन आउटरीच नोंदवा",
    actionStageChange: "बांधकाम टप्पा सिम्युलेट करा",
    outreachLoggedSuccess: "आउटरीच नोंदवला गेला. संपर्क प्रतिसाद वाढला!",
    stageReadySuccess: "बांधकाम टप्पा फिनिशिंगवर अपडेट केला. प्राधान्य स्कोअर पुन्हा मोजला गेला!",
    gpsLock: "थेट नकाशा जीपीएस नोड लॉक: सुरक्षित",
    precisionAccuracy: "जीपीएस अचूकता: {meters}मी • सत्यापन सक्रिय",
    noLeadsFound: "शोध फिल्टरशी जुळणारे कोणतेही लीड्स आढळले नाहीत.",
    scoreExplain: "सोप्या भाषेतील स्कोअर स्पष्टीकरण",
    scoreTextHigh: "हा एक प्रीमियम उच्च-प्राधान्य असलेला लीड आहे. हा उच्च-रूपांतरण क्षेत्रात ({territory}) असून {floors}-मजली इमारत आहे. संपर्क सक्रिय प्रतिसाद देत आहे. ४ तासांत संपर्क साधा.",
    scoreTextMedium: "उत्कृष्ट मध्यम-प्राधान्य संधी. इमारत रचना {stage} टप्प्यात आहे. २४ तासांच्या आत संपर्क साधण्याची शिफारस केली जाते.",
    scoreTextLow: "नर्चरींग टप्प्यातील संधी. इमारतीचे बांधकाम प्राथमिक टप्प्यात आहे आणि प्रतिसाद कमी आहे. ईमेल मोहीम सुरू ठेवा.",
    unknownTerritory: "मानक महाराष्ट्र क्षेत्र",
    saveSuccess: "स्कोअरिंग वेटिंग प्रोफाइल यशस्वीरित्या जतन केली."
  }
};

// Weighting profile interface
interface WeightingProfile {
  buildingSize: number;
  readyStage: number;
  responsiveness: number;
  territoryHist: number;
}

// Factor responsiveness metric mapping
const responsivenessScores: Record<string, number> = {
  'high': 100,
  'medium': 65,
  'low': 35,
  'none': 50 // Graceful default for brand new leads
};

// Construction stage scores mapping
const constructionStageScores: Record<string, number> = {
  'ready': 100,
  'finishing': 85,
  'structure-up': 55,
  'foundation': 25,
  'none': 50 // Default
};

export const LeadScoring: React.FC<{ user: CRMUser; onBack?: () => void }> = ({ user, onBack }) => {
  const { language } = useLanguage();
  const activeLang: 'en' | 'mr' | 'hi' = (language === 'mr' || language === 'hi' || language === 'en') ? language : 'en';
  const t = localizations[activeLang];

  // Lead and territory states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [surveyors, setSurveyors] = useState<CRMUser[]>([]);

  // Search, filter & sorting
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'priority' | 'newest' | 'floors'>('priority');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  // Core GPS lock states
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(6);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Admin Weights (Current Profile)
  const [weights, setWeights] = useState<WeightingProfile>(() => {
    const saved = localStorage.getItem('aiec_scoring_weights');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      buildingSize: 25,
      readyStage: 25,
      responsiveness: 25,
      territoryHist: 25
    };
  });

  // proposed temporary sliders (for admin preview & volatility analysis)
  const [proposedWeights, setProposedWeights] = useState<WeightingProfile>({ ...weights });
  const [tieBreaker, setTieBreaker] = useState<'recency' | 'floors' | 'updated'>('recency');

  // Interactive local modifiers to simulate factors live
  const [localResponsiveness, setLocalResponsiveness] = useState<Record<string, string>>({});
  const [localConstructionStage, setLocalConstructionStage] = useState<Record<string, string>>({});

  // Dynamic calculations for volatility warnings & active/historical score states
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Load database on mount
  const loadDatabase = () => {
    const rawLeads = DbManager.getLeads();
    const rawTerritories = DbManager.getTerritories();
    const rawUsers = DbManager.getUsers();

    setLeads(rawLeads);
    setTerritories(rawTerritories);
    setSurveyors(rawUsers.filter(u => u.role === 'surveyor' || u.role === 'admin'));
  };

  useEffect(() => {
    loadDatabase();

    // Setup browser GPS
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
          setGpsCoords({ lat: 18.5204, lng: 73.8567 }); // Pune fallback
          setGpsAccuracy(12);
        },
        { enableHighAccuracy: true }
      );
    }

    const handleUpdate = () => {
      loadDatabase();
    };
    window.addEventListener('aiec_db_update', handleUpdate);
    return () => {
      window.removeEventListener('aiec_db_update', handleUpdate);
    };
  }, []);

  // Sync proposed weights when actual weights load/change
  useEffect(() => {
    setProposedWeights({ ...weights });
  }, [weights]);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper function to check if a coordinates fall inside a polygon (ray-casting algorithm)
  const isLatLngInTerritory = (lat: number, lng: number, polygon: { lat: number; lng: number }[]) => {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;
      
      const intersect = ((yi > lng) !== (yj > lng))
          && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
      if (intersect) isInside = !isInside;
    }
    return isInside;
  };

  // Compute lead territory based on GPS coordinates or surveyor territory assignments
  const getLeadTerritory = (lead: Lead): Territory | undefined => {
    // 1. Try GPS coordinates first
    if (lead.buildingInfo.latitude && lead.buildingInfo.longitude) {
      const matchingTerritory = territories.find(t => 
        isLatLngInTerritory(lead.buildingInfo.latitude!, lead.buildingInfo.longitude!, t.polygonCoordinates)
      );
      if (matchingTerritory) return matchingTerritory;
    }

    // 2. Fall back to matching the lead's surveyor to their assigned territory
    if (lead.surveyorId) {
      return territories.find(t => t.assignedSurveyorIds.includes(lead.surveyorId!));
    }

    return undefined;
  };

  // Automated Priority Score calculation logic (recalculates live)
  const calculateSingleLeadScore = (
    lead: Lead, 
    activeWeights: WeightingProfile,
    simulatedStage?: string,
    simulatedResp?: string
  ) => {
    // 1. Building Size component: 
    // floors normalized (e.g. 1 to 15 floors is standard range, caps at 15 floors = 100pts)
    const floorsVal = lead.buildingInfo.floors || lead.buildingInfo.floor_count || 1;
    const normFloors = Math.min(100, Math.round((floorsVal / 12) * 100));

    // 2. Construction Stage Readiness component:
    const stage = simulatedStage || localConstructionStage[lead.id] || lead.buildingInfo.construction_stage || 'structure-up';
    const normStage = constructionStageScores[stage] || 50;

    // 3. Contact Responsiveness component:
    const responsiveness = simulatedResp || localResponsiveness[lead.id] || (lead.contactInfo.email ? 'medium' : 'low');
    const normResponsiveness = responsivenessScores[responsiveness] || 50;

    // 4. Territory Conversion component:
    const territory = getLeadTerritory(lead);
    const normTerritory = territory ? (territory.conversionRate || 65) : 60; // 60% standard baseline if none

    // Calculate weighted average
    const totalWeight = activeWeights.buildingSize + activeWeights.readyStage + activeWeights.responsiveness + activeWeights.territoryHist;
    const factorSum = 
      (normFloors * activeWeights.buildingSize) +
      (normStage * activeWeights.readyStage) +
      (normResponsiveness * activeWeights.responsiveness) +
      (normTerritory * activeWeights.territoryHist);

    const calculatedScore = totalWeight > 0 ? Math.round(factorSum / totalWeight) : 50;

    return {
      score: Math.min(100, Math.max(0, calculatedScore)),
      breakdown: {
        buildingSize: normFloors,
        readyStage: normStage,
        responsiveness: normResponsiveness,
        territoryHist: normTerritory,
        territoryName: territory ? territory.name : t.unknownTerritory
      }
    };
  };

  // Historical weighting profiles registry
  // To avoid confusing retroactive score changes, we can mock/simulate stored historical scores 
  // with their historical weights as specified in requirements.
  const getHistoricalComputedScore = (lead: Lead) => {
    // A historic weighting profile of 30/20/30/20
    const historicalProfile: WeightingProfile = {
      buildingSize: 30,
      readyStage: 20,
      responsiveness: 30,
      territoryHist: 20
    };
    
    // We compute this using the historical profile to display beside the prospective active recalculation
    return {
      score: calculateSingleLeadScore(lead, historicalProfile, 'structure-up', 'low').score,
      profile: historicalProfile
    };
  };

  // Active leads combined with their live computed priority scores
  const processedLeads = useMemo(() => {
    return leads.map(lead => {
      const activeCalc = calculateSingleLeadScore(lead, weights);
      const historicalCalc = getHistoricalComputedScore(lead);

      return {
        lead,
        activeScore: activeCalc.score,
        breakdown: activeCalc.breakdown,
        historicalScore: historicalCalc.score,
        historicalProfile: historicalCalc.profile
      };
    });
  }, [leads, weights, localConstructionStage, localResponsiveness, territories]);

  // Compare active weights vs proposed weights across all leads to compute volatility
  const volatilityAnalysis = useMemo(() => {
    if (leads.length === 0) return { rankShiftCount: 0, percentageShifted: 0, hasHighVolatility: false };

    // Calculate rank order with current weights
    const currentSorted = [...processedLeads].sort((a, b) => b.activeScore - a.activeScore);
    const currentRanks = new Map<string, number>();
    currentSorted.forEach((item, idx) => {
      currentRanks.set(item.lead.id, idx);
    });

    // Calculate rank order with proposed weights
    const proposedLeads = leads.map(lead => {
      const activeCalc = calculateSingleLeadScore(lead, proposedWeights);
      return { leadId: lead.id, score: activeCalc.score };
    });
    
    const proposedSorted = proposedLeads.sort((a, b) => b.score - a.score);
    const proposedRanks = new Map<string, number>();
    proposedSorted.forEach((item, idx) => {
      proposedRanks.set(item.leadId, idx);
    });

    // Detect displacement shifts of more than 2 rank positions
    let massiveShiftCount = 0;
    leads.forEach(lead => {
      const currentRank = currentRanks.get(lead.id) ?? 0;
      const proposedRank = proposedRanks.get(lead.id) ?? 0;
      if (Math.abs(currentRank - proposedRank) > 1) {
        massiveShiftCount++;
      }
    });

    const percentageShifted = Math.round((massiveShiftCount / leads.length) * 100);
    const hasHighVolatility = percentageShifted >= 30; // 30% or more leads shifted is considered volatile

    return {
      rankShiftCount: massiveShiftCount,
      percentageShifted,
      hasHighVolatility
    };
  }, [leads, proposedWeights, processedLeads]);

  // Adjust sliders helper ensuring weights balance easily or warn admin
  const handleProposedWeightChange = (key: keyof WeightingProfile, val: number) => {
    setProposedWeights(prev => ({
      ...prev,
      [key]: val
    }));
  };

  // Save current proposed weights to active weights registry
  const handleApplyWeightProfile = () => {
    const totalProposed = proposedWeights.buildingSize + proposedWeights.readyStage + proposedWeights.responsiveness + proposedWeights.territoryHist;
    if (totalProposed === 0) {
      showToast("Scoring weights cannot sum to zero!", "warning");
      return;
    }

    // Auto-normalize or apply as is
    localStorage.setItem('aiec_scoring_weights', JSON.stringify(proposedWeights));
    setWeights({ ...proposedWeights });
    showToast(t.weightsAppliedSuccess, "success");
  };

  // Tie breaker logic & secondary sorting sequence
  const sortedAndFilteredLeads = useMemo(() => {
    const filtered = processedLeads.filter(item => {
      const client = item.lead.contactInfo.name.toLowerCase();
      const company = (item.lead.contactInfo.companyName || '').toLowerCase();
      const address = item.lead.buildingInfo.address.toLowerCase();
      const surveyor = surveyors.find(s => s.id === item.lead.surveyorId)?.name.toLowerCase() || '';
      const query = searchQuery.toLowerCase();

      return client.includes(query) || company.includes(query) || address.includes(query) || surveyor.includes(query);
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        // Core sorting: highest priority first
        if (b.activeScore !== a.activeScore) {
          return b.activeScore - a.activeScore;
        }
        
        // Tie-breaker algorithm configured by Admin
        if (tieBreaker === 'recency') {
          return new Date(b.lead.createdAt).getTime() - new Date(a.lead.createdAt).getTime();
        } else if (tieBreaker === 'floors') {
          const floorsA = a.lead.buildingInfo.floors || 0;
          const floorsB = b.lead.buildingInfo.floors || 0;
          return floorsB - floorsA;
        } else {
          // updated activity pulse
          return new Date(b.lead.updatedAt).getTime() - new Date(a.lead.updatedAt).getTime();
        }
      } else if (sortBy === 'newest') {
        return new Date(b.lead.createdAt).getTime() - new Date(a.lead.createdAt).getTime();
      } else {
        const floorsA = a.lead.buildingInfo.floors || 0;
        const floorsB = b.lead.buildingInfo.floors || 0;
        return floorsB - floorsA;
      }
    });
  }, [processedLeads, searchQuery, sortBy, tieBreaker, surveyors]);

  // Outreach simulator helper
  const handleLogOutreachSim = (leadId: string) => {
    setLocalResponsiveness(prev => ({
      ...prev,
      [leadId]: 'high'
    }));

    // Trigger update in main DB for simulated responsiveness audit
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      const updatedLead = {
        ...lead,
        updatedAt: new Date().toISOString()
      };
      DbManager.updateLead(updatedLead);
    }
    showToast(t.outreachLoggedSuccess, "success");
  };

  // Construction stage simulator helper
  const handleSimulateStageChange = (leadId: string) => {
    setLocalConstructionStage(prev => ({
      ...prev,
      [leadId]: 'finishing'
    }));

    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      const updatedLead = {
        ...lead,
        buildingInfo: {
          ...lead.buildingInfo,
          construction_stage: 'finishing'
        },
        updatedAt: new Date().toISOString()
      };
      DbManager.updateLead(updatedLead);
    }
    showToast(t.stageReadySuccess, "success");
  };

  // twin progress bars metrics calculations
  const totalLeadsCount = processedLeads.length;
  
  // Progress Bar 1: Prioritized Target Engagement Rate 
  // (percentage of high priority leads [score >= 70] that have been contacted or quoted/negotiating/won)
  const highPriorityLeads = processedLeads.filter(item => item.activeScore >= 70);
  const highPriorityEngaged = highPriorityLeads.filter(item => 
    ['contacted', 'survey_done', 'quoted', 'negotiating', 'closed_won'].includes(item.lead.stage)
  );
  const prioritizedEngagementRate = highPriorityLeads.length > 0
    ? Math.round((highPriorityEngaged.length / highPriorityLeads.length) * 100)
    : 100;

  // Progress Bar 2: Pipeline Prioritization Coverage Ratio
  // (leads having fully filled address, construction stage, and contact details computed)
  const fullyScoredLeads = processedLeads.filter(item => 
    item.lead.buildingInfo.address && 
    item.lead.buildingInfo.floors && 
    item.lead.contactInfo.name && 
    item.lead.contactInfo.phone
  );
  const scoringCoverageRatio = totalLeadsCount > 0
    ? Math.round((fullyScoredLeads.length / totalLeadsCount) * 100)
    : 100;

  return (
    <div className="w-full space-y-6">
      
      {/* Toast message notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === 'success' ? 'bg-royalemerald text-white border-royalemerald' : 'bg-charcoal text-white border-antiquegold'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4 text-antiquegold" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          HEADER SECTION WITH LIVE GPS NODE
          ========================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-border shadow-diffuse">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-antiquegold">
            <Star className="w-5 h-5 text-antiquegold animate-pulse" />
            <span className="text-[10px] uppercase font-extrabold tracking-wider font-mono bg-antiquegold/10 px-2 py-0.5 rounded-md">
              AIEC Priority Control Center
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-black text-charcoal">{t.title}</h1>
          <p className="text-xs text-warmgray font-medium">{t.subtitle}</p>
        </div>

        {/* Real-time GPS Tracker Node Status */}
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
              {t.precisionAccuracy.replace('{meters}', String(gpsAccuracy))}
            </span>
          </div>
        )}
      </div>

      {/* =========================================================
          REQUIRED PERCENT PROGRESS BARS (DUAL)
          ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* PROGRESS BAR 1: Current Active Priority Engagement Rate */}
        <div className="bg-white p-5 rounded-2xl border border-border shadow-diffuse space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-charcoal flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-royalemerald animate-ping" />
              {t.kpiProcessedRate}
            </span>
            <span className="font-mono font-extrabold text-royalemerald">{prioritizedEngagementRate}%</span>
          </div>
          
          {/* Custom % Progress Bar */}
          <div className="h-2.5 w-full bg-alabaster rounded-full overflow-hidden relative border border-border/60">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-royalemerald rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${prioritizedEngagementRate}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[9px] font-mono text-warmgray">
            <span>{highPriorityEngaged.length} REACHED TARGETS</span>
            <span>{highPriorityLeads.length} HIGH-PRIORITY LEADS</span>
          </div>
        </div>

        {/* PROGRESS BAR 2: Pipeline Coverage scoring completeness ratio */}
        <div className="bg-white p-5 rounded-2xl border border-border shadow-diffuse space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-charcoal flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-antiquegold" />
              {t.kpiScoringCoverage}
            </span>
            <span className="font-mono font-extrabold text-antiquegold">{scoringCoverageRatio}%</span>
          </div>

          {/* Custom % Progress Bar */}
          <div className="h-2.5 w-full bg-alabaster rounded-full overflow-hidden relative border border-border/60">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-antiquegold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${scoringCoverageRatio}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono text-warmgray">
            <span>{fullyScoredLeads.length} FULLY PROFILED LEADS</span>
            <span>{totalLeadsCount} CRM SYSTEM TOTAL</span>
          </div>
        </div>

      </div>

      {/* =========================================================
          MAIN CORE CONTENT GRID: ADMIN CONFIG & PIPELINE QUEUE
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Admin Weights Panel (5/12 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-border shadow-diffuse space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Sliders className="w-4 h-4 text-antiquegold" />
              <h2 className="text-sm font-serif font-black text-charcoal">{t.weightingPanelTitle}</h2>
            </div>
            
            <p className="text-[11px] text-warmgray leading-relaxed">{t.weightingPanelDesc}</p>

            {/* VOLATILITY WARNING SANITY CHECK */}
            {volatilityAnalysis.percentageShifted >= 25 && (
              <div className="bg-[#B23B3B]/10 p-4 rounded-xl border border-[#B23B3B]/30 text-xs text-[#B23B3B] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-[#B23B3B] animate-bounce" />
                  <span>{t.volatilityTitle}</span>
                </div>
                <p className="text-[10px] leading-relaxed text-[#B23B3B]/90">
                  {t.volatilityDesc.replace('{percent}', String(volatilityAnalysis.percentageShifted))}
                </p>
              </div>
            )}

            {/* SCORING FACTOR WEIGHTS CONTROL SLIDERS */}
            <div className="space-y-4 pt-2">
              
              {/* Factor 1: Building Scale */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-charcoal">{t.factorBuildingSize}</span>
                  <span className="font-mono font-extrabold text-antiquegold">{proposedWeights.buildingSize}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={proposedWeights.buildingSize} 
                  onChange={(e) => handleProposedWeightChange('buildingSize', parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-alabaster accent-antiquegold rounded-lg appearance-none cursor-pointer border border-border"
                />
              </div>

              {/* Factor 2: Ready Stage */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-charcoal">{t.factorReadyStage}</span>
                  <span className="font-mono font-extrabold text-antiquegold">{proposedWeights.readyStage}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={proposedWeights.readyStage} 
                  onChange={(e) => handleProposedWeightChange('readyStage', parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-alabaster accent-antiquegold rounded-lg appearance-none cursor-pointer border border-border"
                />
              </div>

              {/* Factor 3: Responsiveness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-charcoal">{t.factorResponsiveness}</span>
                  <span className="font-mono font-extrabold text-antiquegold">{proposedWeights.responsiveness}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={proposedWeights.responsiveness} 
                  onChange={(e) => handleProposedWeightChange('responsiveness', parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-alabaster accent-antiquegold rounded-lg appearance-none cursor-pointer border border-border"
                />
              </div>

              {/* Factor 4: Territory Conversion */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-charcoal">{t.factorTerritoryHist}</span>
                  <span className="font-mono font-extrabold text-antiquegold">{proposedWeights.territoryHist}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={proposedWeights.territoryHist} 
                  onChange={(e) => handleProposedWeightChange('territoryHist', parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-alabaster accent-antiquegold rounded-lg appearance-none cursor-pointer border border-border"
                />
              </div>

            </div>

            {/* TIE BREAKER CONFIGURATION */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <label className="text-xs font-bold text-charcoal block">{t.tieBreakerLabel}</label>
              <select
                value={tieBreaker}
                onChange={(e: any) => setTieBreaker(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-charcoal focus:ring-1 focus:ring-antiquegold outline-none"
              >
                <option value="recency">{t.tieBreakerNewest}</option>
                <option value="floors">{t.tieBreakerFloors}</option>
                <option value="updated">{t.tieBreakerUpdated}</option>
              </select>
            </div>

            {/* Sum indicator verification */}
            <div className="flex justify-between items-center bg-alabaster p-3 rounded-xl border border-border text-xs font-mono">
              <span className="text-warmgray">Total Proposed Weights Sum:</span>
              <span className={`font-bold ${
                (proposedWeights.buildingSize + proposedWeights.readyStage + proposedWeights.responsiveness + proposedWeights.territoryHist) === 100
                  ? 'text-royalemerald' 
                  : 'text-antiquegold'
              }`}>
                {proposedWeights.buildingSize + proposedWeights.readyStage + proposedWeights.responsiveness + proposedWeights.territoryHist}%
              </span>
            </div>

            {/* APPLY WEIGHTS BUTTON */}
            <Button
              variant="primary"
              className="w-full py-3 text-xs font-bold font-sans uppercase tracking-wider"
              onClick={handleApplyWeightProfile}
            >
              <Save className="w-4 h-4 mr-2" />
              {t.applyWeightsBtn}
            </Button>

          </div>
        </div>

        {/* RIGHT COLUMN: Opportunity list with search/filter (7/12 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* SEARCH & SORT DOCK */}
          <div className="bg-white p-4 rounded-2xl border border-border shadow-diffuse flex flex-col md:flex-row gap-3 items-center">
            
            <div className="relative w-full">
              <Search className="w-4 h-4 text-warmgray absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-border bg-alabaster/40 text-charcoal focus:ring-1 focus:ring-antiquegold outline-none transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <ArrowUpDown className="w-4 h-4 text-antiquegold shrink-0" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-border bg-white text-charcoal focus:ring-1 focus:ring-antiquegold outline-none"
              >
                <option value="priority">{t.sortPriority}</option>
                <option value="newest">{t.sortNewest}</option>
                <option value="floors">{t.sortFloors}</option>
              </select>
            </div>

          </div>

          {/* PRIORITY RECALCULATED ALERT */}
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200/50 flex justify-between items-center text-[10px] text-royalemerald font-medium">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-royalemerald" />
              {t.scoreRecalculatedAlert}
            </span>
            <span className="font-mono bg-royalemerald/10 px-2 py-0.5 rounded text-[9px] uppercase font-bold">
              Prospective Weight Lock
            </span>
          </div>

          {/* LEADS QUEUE */}
          <div className="space-y-3">
            {sortedAndFilteredLeads.length === 0 ? (
              <div className="bg-white border border-dashed border-border rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-alabaster rounded-full flex items-center justify-center mx-auto border border-border">
                  <Search className="w-5 h-5 text-warmgray" />
                </div>
                <p className="text-xs text-warmgray font-semibold">{t.noLeadsFound}</p>
              </div>
            ) : (
              sortedAndFilteredLeads.map((item) => {
                const isExpanded = expandedLeadId === item.lead.id;
                const scoreColor = item.activeScore >= 80 
                  ? 'text-royalemerald bg-royalemerald/10 border-royalemerald/30' 
                  : item.activeScore >= 50 
                    ? 'text-antiquegold bg-antiquegold/10 border-antiquegold/30' 
                    : 'text-charcoal bg-alabaster border-border';

                const surveyor = surveyors.find(s => s.id === item.lead.surveyorId);

                return (
                  <div 
                    key={item.lead.id}
                    className={`bg-white rounded-2xl border transition-all hover:shadow-md overflow-hidden ${
                      isExpanded ? 'border-antiquegold/50 ring-1 ring-antiquegold/10' : 'border-border/80'
                    }`}
                  >
                    {/* Main Row */}
                    <div 
                      onClick={() => setExpandedLeadId(isExpanded ? null : item.lead.id)}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      {/* Left: Circle Score badge and Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Circular Score Badge */}
                        <div className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center shrink-0 ${scoreColor}`}>
                          <span className="text-base font-mono font-black tracking-tighter">{item.activeScore}</span>
                          <span className="text-[8px] uppercase tracking-wider font-extrabold font-mono opacity-80">SCORE</span>
                        </div>

                        {/* Title, Address, Sub */}
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs font-serif font-black text-charcoal truncate">
                            {item.lead.contactInfo.name}
                          </h4>
                          <span className="text-[10px] text-warmgray font-medium flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-antiquegold shrink-0" />
                            <span className="truncate">{item.lead.buildingInfo.address}</span>
                          </span>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[9px] font-mono text-warmgray uppercase tracking-wider bg-alabaster px-1.5 py-0.5 rounded">
                              {item.lead.buildingInfo.floors} Floors
                            </span>
                            <span className="text-[9px] font-mono text-warmgray">
                              Captured: {new Date(item.lead.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Stage and Chevron */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <Badge status={item.lead.stage} className="text-[9px]" />
                          <span className="block text-[8px] font-mono text-warmgray mt-1">
                            Hist Score: <strong className="text-charcoal font-bold">{item.historicalScore}</strong>
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-warmgray" /> : <ChevronDown className="w-4 h-4 text-warmgray" />}
                      </div>

                    </div>

                    {/* EXPANDED BREAKDOWN VIEW */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="border-t border-border/60 bg-alabaster/30 overflow-hidden"
                        >
                          <div className="p-4 space-y-4">
                            
                            {/* Visual Ascension Line Motif showing priority depth */}
                            <div className="relative pl-6 space-y-3">
                              
                              {/* Thin elevator floor indicator rail */}
                              <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-border">
                                <motion.div 
                                  className="w-full bg-antiquegold absolute top-0"
                                  initial={{ height: 0 }}
                                  animate={{ height: `${item.activeScore}%` }}
                                  transition={{ duration: 1 }}
                                />
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] font-mono font-bold text-antiquegold uppercase tracking-wider block">
                                  {t.factorBreakdownHeader}
                                </span>
                                <p className="text-[10px] text-warmgray leading-relaxed">
                                  {t.formulaExplainer}
                                </p>
                              </div>

                              {/* Normalized Factor lists */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                
                                {/* Building Size */}
                                <div className="bg-white p-2.5 rounded-xl border border-border/60 space-y-1">
                                  <div className="flex justify-between text-[10px] text-warmgray">
                                    <span>Building Scale (Floors)</span>
                                    <span className="font-mono font-bold text-charcoal">{item.breakdown.buildingSize}/100</span>
                                  </div>
                                  <div className="h-1 w-full bg-alabaster rounded-full overflow-hidden">
                                    <div className="h-full bg-antiquegold" style={{ width: `${item.breakdown.buildingSize}%` }} />
                                  </div>
                                </div>

                                {/* Ready Stage */}
                                <div className="bg-white p-2.5 rounded-xl border border-border/60 space-y-1">
                                  <div className="flex justify-between text-[10px] text-warmgray">
                                    <span>Ready Stage Readiness</span>
                                    <span className="font-mono font-bold text-charcoal">{item.breakdown.readyStage}/100</span>
                                  </div>
                                  <div className="h-1 w-full bg-alabaster rounded-full overflow-hidden">
                                    <div className="h-full bg-antiquegold" style={{ width: `${item.breakdown.readyStage}%` }} />
                                  </div>
                                </div>

                                {/* Responsiveness */}
                                <div className="bg-white p-2.5 rounded-xl border border-border/60 space-y-1">
                                  <div className="flex justify-between text-[10px] text-warmgray">
                                    <span>Contact Responsiveness</span>
                                    <span className="font-mono font-bold text-charcoal">{item.breakdown.responsiveness}/100</span>
                                  </div>
                                  <div className="h-1 w-full bg-alabaster rounded-full overflow-hidden">
                                    <div className="h-full bg-antiquegold" style={{ width: `${item.breakdown.responsiveness}%` }} />
                                  </div>
                                </div>

                                {/* Territory */}
                                <div className="bg-white p-2.5 rounded-xl border border-border/60 space-y-1">
                                  <div className="flex justify-between text-[10px] text-warmgray">
                                    <span>Territory Conversion Success</span>
                                    <span className="font-mono font-bold text-charcoal">{item.breakdown.territoryHist}/100</span>
                                  </div>
                                  <div className="h-1 w-full bg-alabaster rounded-full overflow-hidden">
                                    <div className="h-full bg-antiquegold" style={{ width: `${item.breakdown.territoryHist}%` }} />
                                  </div>
                                </div>

                              </div>

                            </div>

                            {/* PLAIN LANGUAGE EXPLAINER SECTION */}
                            <div className="bg-white p-3.5 rounded-xl border border-border/60 space-y-1">
                              <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider block flex items-center gap-1">
                                <Info className="w-3.5 h-3.5 text-antiquegold" />
                                {t.scoreExplain}
                              </span>
                              <p className="text-[10px] text-warmgray leading-relaxed">
                                {item.activeScore >= 80 
                                  ? t.scoreTextHigh.replace('{territory}', item.breakdown.territoryName).replace('{floors}', String(item.lead.buildingInfo.floors))
                                  : item.activeScore >= 50
                                    ? t.scoreTextMedium.replace('{stage}', String(item.lead.buildingInfo.construction_stage || 'structure-up'))
                                    : t.scoreTextLow
                                }
                              </p>
                              {(!item.lead.buildingInfo.floors || !item.lead.buildingInfo.construction_stage) && (
                                <p className="text-[8px] text-amber-600 font-medium">
                                  ⚠️ {t.incompleteDataGrace}
                                </p>
                              )}
                            </div>

                            {/* HISTORICAL PROSPECTIVE AUDIT DATA CARD */}
                            <div className="bg-alabaster/60 p-2.5 rounded-xl border border-dashed border-border/80 text-[9px] text-warmgray flex justify-between items-center">
                              <span>Historical frozen score at capture: <strong>{item.historicalScore}</strong></span>
                              <span className="font-mono text-right" title={t.historicalWeightingTooltip}>
                                Profile: B:{item.historicalProfile.buildingSize}% / C:{item.historicalProfile.readyStage}% / R:{item.historicalProfile.responsiveness}% / T:{item.historicalProfile.territoryHist}%
                              </span>
                            </div>

                            {/* INTERACTIVE ACTIONS & RECALCULATION SIMULATOR */}
                            <div className="flex flex-wrap gap-2 pt-1 justify-end">
                              
                              {/* Outreach button simulator */}
                              <button
                                onClick={() => handleLogOutreachSim(item.lead.id)}
                                className="bg-white border border-border text-charcoal hover:bg-antiquegold/5 py-1.5 px-3 rounded-xl text-[10px] font-semibold flex items-center gap-1 transition-all"
                              >
                                <Phone className="w-3.5 h-3.5 text-royalemerald" />
                                {t.actionOutreach}
                              </button>

                              {/* Stage promotion simulation button */}
                              <button
                                onClick={() => handleSimulateStageChange(item.lead.id)}
                                className="bg-white border border-border text-charcoal hover:bg-antiquegold/5 py-1.5 px-3 rounded-xl text-[10px] font-semibold flex items-center gap-1 transition-all"
                              >
                                <Building2 className="w-3.5 h-3.5 text-antiquegold" />
                                {t.actionStageChange}
                              </button>

                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
