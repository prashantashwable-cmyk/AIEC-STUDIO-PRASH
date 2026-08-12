import React, { useState, useMemo } from 'react';
import { 
  Check, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, HelpCircle, 
  Settings, Layers, Star, Sparkles, Compass, ShieldCheck, Heart, Wrench, 
  Info, Eye, Sliders, ToggleLeft, ToggleRight, XCircle, Plus, Minus
} from 'lucide-react';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';

interface PackageTier {
  id: string;
  nameKey: 'basic' | 'premium' | 'luxury';
  taglineKey: string;
  price: number;
  isRecommended: boolean;
  isVisible: boolean;
  features: {
    cabinFinish: string;
    doorSensors: string;
    speed: string;
    emergencyBackup: string;
    warranty: string;
    amcSupport: string;
  };
}

export const MultiOptionComparison: React.FC<{ 
  user: any;
  onSelectPackage?: (tierId: string, finalPrice: number) => void;
}> = ({ user, onSelectPackage }) => {
  const { language } = useLanguage();
  const [toastMsg, setToastMsg] = useState('');
  const [activeCustomizingTier, setActiveCustomizingTier] = useState<string | null>(null);

  // Default editable price state
  const [basicPrice, setBasicPrice] = useState<number>(845000);
  const [premiumPrice, setPremiumPrice] = useState<number>(1148000);
  const [luxuryPrice, setLuxuryPrice] = useState<number>(1680000);

  // Configuration customization state overrides (hybrid path)
  const [customCabin, setCustomCabin] = useState<'brushed' | 'gold_hairline' | 'glass'>('gold_hairline');
  const [customSafety, setCustomSafety] = useState<'standard' | 'advanced' | 'premium_voice'>('advanced');
  const [customWarranty, setCustomWarranty] = useState<number>(2); // years

  // Tier visibility toggles (Sales can omit a tier if impractical)
  const [showBasic, setShowBasic] = useState(true);
  const [showPremium, setShowPremium] = useState(true);
  const [showLuxury, setShowLuxury] = useState(true);

  // Multi-lingual translations
  const t = useMemo(() => {
    const translations = {
      en: {
        title: "Multi-Option Package Comparison",
        subtitle: "Generate, review, and adjust three package options generated from a single baseline building survey.",
        badgeTitle: "CRM MATCH • MULTI-TIER ENGINE",
        recommendedLabel: "RECOMMENDED FOR VILLAS",
        popularLabel: "Most Popular",
        selectBtn: "Select This Package",
        customizeBtn: "Customize From Here",
        basicName: "Essential Standard Lift",
        basicTagline: "Economical, safe, & highly reliable elevators for budget-focused apartments.",
        premiumName: "Ascension Premium Suite",
        premiumTagline: "Our signature elevator layout with gorgeous accents and high ride-quality VVVF.",
        luxuryName: "Royal Vista Premium Luxury",
        luxuryTagline: "Absolute luxury with custom glass cabin finishes and full redundant safety grids.",
        featureCabin: "Cabin Interior Finish",
        featureDoor: "Door Obstacle Sensor",
        featureSpeed: "Rated Drive Speed",
        featureEmergency: "Emergency Backup Guard",
        featureWarranty: "Warranty Extension",
        featureAmc: "AMC Maintenance Tier",
        pricingLabel: "Lump-Sum Proposal Price",
        pricingDesc: "18% GST fully inclusive. Standard installation labor included.",
        priceGapWarnTitle: "Confusingly Narrow Price Gap Detected",
        priceGapWarnDesc: "The cost difference between your configured tiers is under ₹60,000. Administrators should review safety-margin configurations or adjust discount rules to justify the premium upsell.",
        customizeTitle: "Hybrid Configurator Mode",
        customizeDesc: "Modify single hardware modules of the selected baseline package to fit unique building aesthetic requests.",
        resetBtn: "Reset Configurator",
        applyCustomBtn: "Save Custom Specs",
        loadingState: "Recalculating physical elevator parameters...",
        toastSelected: "Package choice loaded into your active sales proposal queue successfully!",
        toastCustomApplied: "Custom component modifications calculated and applied to Proposal.",
        emptyStateTitle: "All Comparison Tiers Hidden",
        emptyStateDesc: "At least one package tier must remain visible. Toggle any of the visibility cards on the right to restore side-by-side analysis.",
        restoreAllBtn: "Restore All Tiers",
        controlTitle: "Sales Presentation Toggles",
        controlDesc: "Omit specific options that are physically impractical or out of the customer's budget scope."
      },
      hi: {
        title: "मल्टी-ऑप्शन पैकेज तुलना",
        subtitle: "एक ही बेसलाइन बिल्डिंग सर्वे से उत्पन्न तीन पैकेज विकल्पों को जनरेट, समीक्षा और समायोजित करें।",
        badgeTitle: "सीआरएम मैच • मल्टी-टियर इंजन",
        recommendedLabel: "विला के लिए अनुशंसित",
        popularLabel: "सबसे लोकप्रिय",
        selectBtn: "इस पैकेज का चयन करें",
        customizeBtn: "यहाँ से कस्टमाइज़ करें",
        basicName: "आवश्यक मानक लिफ्ट",
        basicTagline: "बजट-केंद्रित अपार्टमेंट के लिए किफायती, सुरक्षित और अत्यधिक विश्वसनीय लिफ्ट।",
        premiumName: "एसेनशन प्रीमियम सुइट",
        premiumTagline: "शानदार सजावट और उच्च सवारी-गुणवत्ता वीवीवीएफ के साथ हमारा सिग्नेचर लेआउट।",
        luxuryName: "रॉयल विस्टा लक्ज़री",
        luxuryTagline: "कस्टम ग्लास केबिन फिनिश और पूर्ण अनावश्यक सुरक्षा ग्रिड के साथ पूर्ण विलासिता।",
        featureCabin: "केबिन इंटीरियर फिनिश",
        featureDoor: "दरवाजा बाधा सेंसर",
        featureSpeed: "मूल्यांकन गति",
        featureEmergency: "आपातकालीन बैकअप सुरक्षा",
        featureWarranty: "वारंटी विस्तार",
        featureAmc: "एएमसी रखरखाव स्तर",
        pricingLabel: "एकमुश्त प्रस्ताव मूल्य",
        pricingDesc: "18% जीएसटी पूरी तरह से शामिल। मानक स्थापना श्रम शामिल।",
        priceGapWarnTitle: "भ्रामक रूप से संकीर्ण मूल्य अंतर का पता चला",
        priceGapWarnDesc: "आपके कॉन्फ़िगर किए गए स्तरों के बीच लागत का अंतर ₹60,000 से कम है। कृपया नियम समायोजित करें।",
        customizeTitle: "हाइब्रिड कॉन्फिगरेटर मोड",
        customizeDesc: "अनोखी इमारत सौंदर्य अनुरोधों को फिट करने के लिए चयनित बेसलाइन पैकेज के एकल हार्डवेयर मॉड्यूल को संशोधित करें।",
        resetBtn: "कॉन्फ़िगरेटर रीसेट करें",
        applyCustomBtn: "कस्टम विनिर्देश सहेजें",
        loadingState: "लिफ्ट मापदंडों की पुनर्गणना की जा रही है...",
        toastSelected: "पैकेज विकल्प को आपके सक्रिय प्रस्ताव कतार में सफलतापूर्वक लोड किया गया!",
        toastCustomApplied: "कस्टम घटक संशोधन प्रस्ताव पर लागू किए गए।",
        emptyStateTitle: "सभी तुलना स्तर छिपे हुए हैं",
        emptyStateDesc: "कम से कम एक पैकेज स्तर दृश्यमान रहना चाहिए। तुलना बहाल करने के लिए दाईं ओर विज़िबिलिटी कार्ड टॉगल करें।",
        restoreAllBtn: "सभी स्तरों को पुनर्स्थापित करें",
        controlTitle: "बिक्री प्रस्तुति टॉगल",
        controlDesc: "उन विशिष्ट विकल्पों को छोड़ दें जो भौतिक रूप से अव्यावहारिक हैं या ग्राहक के बजट से बाहर हैं।"
      },
      mr: {
        title: "मल्टी-ऑप्शन पॅकेज तुलना",
        subtitle: "एकच इमारतीच्या सर्वेक्षणातून तयार केलेल्या तीन वेगवेगळ्या दरांच्या प्रस्तावांची तुलना करा.",
        badgeTitle: "पॅकेज तुलना • मल्टी-टियर इंजिन",
        recommendedLabel: "बंगल्यासाठी शिफारस केलेले",
        popularLabel: "सर्वात लोकप्रिय",
        selectBtn: "हे पॅकेज निवडा",
        customizeBtn: "इथून बदल करा",
        basicName: "प्रमाणित मूलभूत लिफ्ट",
        basicTagline: "बजेट-केंद्रित इमारतींसाठी सुरक्षित आणि विश्वासार्ह लिफ्ट.",
        premiumName: "एसेंशन प्रीमियम सुईट",
        premiumTagline: "उत्कृष्ट डिझाईन आणि आरामदायक प्रवासाचा अनुभव देणारे आमचे मुख्य मॉडेल.",
        luxuryName: "रॉयल व्हिस्टा प्रीमियम लक्झरी",
        luxuryTagline: "काचेचे केबिन आणि सर्वोच्च दर्जाच्या अत्याधुनिक सुरक्षा प्रणालींनी सज्ज.",
        featureCabin: "केबिन इंटीरियर डिझाईन",
        featureDoor: "डोअर ऑब्स्टॅकल सेन्सर",
        featureSpeed: "लिफ्टचा वेग",
        featureEmergency: "आणीबाणी बॅकअप सिस्टीम",
        featureWarranty: "वारंटी कालावधी",
        featureAmc: "AMC मेंटेनन्स टियर",
        pricingLabel: "एकूण प्रस्ताव किंमत",
        pricingDesc: "१८% GST सह. प्रमाणभूत इन्स्टॉलेशन मजुरी समाविष्ट.",
        priceGapWarnTitle: "किमतींमधील फरक खूपच कमी आहे",
        priceGapWarnDesc: "दोन पॅकेजेस मधील किमतीचा फरक ₹६०,००० पेक्षा कमी आहे. कृपया किंमतीचे नियम तपासा किंवा सुधारणा करा.",
        customizeTitle: "हायब्रिड कस्टमायझेशन मोड",
        customizeDesc: "ग्राहकाच्या आवडीनुसार केबिन फिनिश किंवा इतर सुटे भाग स्वतंत्रपणे बदला.",
        resetBtn: "रिसेट करा",
        applyCustomBtn: "बदल जतन करा",
        loadingState: "तांत्रिक बदल मोजत आहे...",
        toastSelected: "निवडलेले पॅकेज आपल्या प्रस्ताव यादीत जतन झाले आहे!",
        toastCustomApplied: "ग्राहकांचे कस्टमायझेशन बदल प्रस्तावात यशस्वीरित्या जोडले गेले आहेत.",
        emptyStateTitle: "सर्व पॅकेजेस लपवली आहेत",
        emptyStateDesc: "तुलना पाहण्यासाठी किमान एक पॅकेज तरी सुरू असणे आवश्यक आहे. उजव्या बाजूचे टॉगल बटण वापरा.",
        restoreAllBtn: "सर्व पॅकेजेस दाखवा",
        controlTitle: "विक्री सादरीकरण टॉगल",
        controlDesc: "ग्राहकाला नको असणारे किंवा बजेट बाहेरील पर्याय लपवण्यासाठी खालील बटने वापरा."
      }
    };
    return translations[language] || translations.en;
  }, [language]);

  // Pricing Gap Validation Check Edge Case
  const hasPriceGapQuirk = useMemo(() => {
    const activeTiersCount = [showBasic, showPremium, showLuxury].filter(Boolean).length;
    if (activeTiersCount < 2) return false;

    const prices = [];
    if (showBasic) prices.push(basicPrice);
    if (showPremium) prices.push(premiumPrice);
    if (showLuxury) prices.push(luxuryPrice);

    prices.sort((a, b) => a - b);
    for (let i = 0; i < prices.length - 1; i++) {
      if (prices[i + 1] - prices[i] < 60000) {
        return true;
      }
    }
    return false;
  }, [basicPrice, premiumPrice, luxuryPrice, showBasic, showPremium, showLuxury]);

  // Packages array
  const packageTiers = useMemo<PackageTier[]>(() => [
    {
      id: 'pkg_basic',
      nameKey: 'basic',
      taglineKey: 'basicTagline',
      price: basicPrice,
      isRecommended: false,
      isVisible: showBasic,
      features: {
        cabinFinish: "Mild Steel Powder Coated (Grey/Ivory)",
        doorSensors: "Infrared 2D Safety Beam Edge",
        speed: "0.8 m/s Standard Speed",
        emergencyBackup: "Standard Battery Backed ARD",
        warranty: "1 Year Standard Coverage",
        amcSupport: "Standard Preventive AMC"
      }
    },
    {
      id: 'pkg_premium',
      nameKey: 'premium',
      taglineKey: 'premiumTagline',
      price: premiumPrice,
      isRecommended: true,
      isVisible: showPremium,
      features: {
        cabinFinish: "Brushed Hairline Stainless Steel #304",
        doorSensors: "Multi-Beam 3D Light Curtain Grid",
        speed: "1.0 m/s High Performance",
        emergencyBackup: "Advanced Voice Assisted Rescue",
        warranty: "2 Years Premium Coverage",
        amcSupport: "Quarterly Scheduled Safety AMC"
      }
    },
    {
      id: 'pkg_luxury',
      nameKey: 'luxury',
      taglineKey: 'luxuryTagline',
      price: luxuryPrice,
      isRecommended: false,
      isVisible: showLuxury,
      features: {
        cabinFinish: "Panoramic Toughened Glass back + Gold Ti-Plating",
        doorSensors: "Premium Multi-Beam with Early Retract Sensors",
        speed: "1.5 m/s Rapid Ascent Glide",
        emergencyBackup: "Full Redundant Backup & Seismic Shutoff",
        warranty: "3 Years Comprehensive Shield",
        amcSupport: "24/7 Priority Express Breakdown Response"
      }
    }
  ], [basicPrice, premiumPrice, luxuryPrice, showBasic, showPremium, showLuxury]);

  // Apply choosing package action
  const handleSelectPackage = (tierId: string, finalPrice: number) => {
    triggerToast(`${t.toastSelected} Selected Package: ${tierId.toUpperCase()}`);
    if (onSelectPackage) {
      onSelectPackage(tierId, finalPrice);
    }
  };

  const handleApplyCustomizations = () => {
    // Modify Premium/Selected prices or configurations in a mock dynamic calculation
    setPremiumPrice(prev => prev + (customCabin === 'glass' ? 120000 : customCabin === 'brushed' ? 0 : -40000) + (customWarranty * 25000));
    setToastMsg(t.toastCustomApplied);
    setActiveCustomizingTier(null);
  };

  const resetCustomizations = () => {
    setBasicPrice(845000);
    setPremiumPrice(1148000);
    setLuxuryPrice(1680000);
    setCustomCabin('gold_hairline');
    setCustomSafety('advanced');
    setCustomWarranty(2);
    triggerToast("Configurations returned to base factory templates.");
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const visibleTiers = useMemo(() => packageTiers.filter(t => t.isVisible), [packageTiers]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast notifier */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0E4B3D] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Dual Progress Bar Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Auto-Quotation Engine Module Progress (Screen 5 of 10)</span>
            <span>50.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '50%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 65 of 200)</span>
            <span>32.5%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '32.5%' }} />
          </div>
        </div>
      </div>

      {/* Screen Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            {t.badgeTitle}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2A2723] tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            onClick={resetCustomizations}
            variant="secondary"
            className="text-xs font-bold py-2.5 px-5 flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-warmgray" />
            <span>{t.resetBtn}</span>
          </Button>
        </div>
      </div>

      {/* Edge Case Warning: Narrow price gap */}
      {hasPriceGapQuirk && (
        <div className="p-4 bg-amber-50 border border-antiquegold/30 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-antiquegold shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">{t.priceGapWarnTitle}</h4>
            <p className="text-[11px] text-warmgray font-semibold leading-relaxed">
              {t.priceGapWarnDesc}
            </p>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Package Comparison Cards & Specifications Matrix */}
        <div className="lg:col-span-9 space-y-6">
          
          {visibleTiers.length === 0 ? (
            /* Explicit Empty State Design */
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-4">
              <XCircle className="w-12 h-12 text-[#B23B3B] mx-auto opacity-80" />
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-serif text-base font-bold text-charcoal">{t.emptyStateTitle}</h3>
                <p className="text-xs text-warmgray font-semibold leading-relaxed">
                  {t.emptyStateDesc}
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowBasic(true);
                  setShowPremium(true);
                  setShowLuxury(true);
                }}
                variant="primary"
                className="text-xs py-2 px-5 font-bold mx-auto"
              >
                {t.restoreAllBtn}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Responsive side-by-side card grid */}
              <div className={`grid grid-cols-1 md:grid-cols-${visibleTiers.length} gap-6`}>
                {visibleTiers.map((tier) => {
                  const isPremium = tier.id === 'pkg_premium';
                  const isLuxury = tier.id === 'pkg_luxury';
                  
                  return (
                    <Card 
                      key={tier.id}
                      className={`relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                        tier.isRecommended 
                          ? 'border-2 border-antiquegold bg-[#FFFFFF] shadow-md ring-2 ring-antiquegold/10' 
                          : 'border border-[rgba(184,135,61,0.15)] bg-white'
                      }`}
                    >
                      {/* Highlighted badges */}
                      {tier.isRecommended && (
                        <div className="absolute top-0 right-0 left-0 bg-antiquegold text-white text-[9px] uppercase font-mono tracking-widest text-center py-1 font-bold">
                          {t.recommendedLabel}
                        </div>
                      )}

                      <div className="p-6 space-y-6 flex-1 pt-8">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-serif text-base font-black text-charcoal">
                              {tier.nameKey === 'basic' ? t.basicName : tier.nameKey === 'premium' ? t.premiumName : t.luxuryName}
                            </h3>
                            {isPremium && (
                              <span className="bg-emerald-50 text-royalemerald border border-royalemerald/10 text-[9px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded-md">
                                {t.popularLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-warmgray font-semibold mt-1 leading-normal">
                            {tier.nameKey === 'basic' ? t.basicTagline : tier.nameKey === 'premium' ? t.premiumTagline : t.luxuryTagline}
                          </p>
                        </div>

                        {/* Price Display */}
                        <div className="bg-alabaster p-4 rounded-xl border border-[#e5dfd4]/40">
                          <span className="text-[8px] uppercase font-mono tracking-wider font-bold text-warmgray block">{t.pricingLabel}</span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-serif text-2xl font-black text-charcoal">
                              ₹{tier.price.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[8px] text-warmgray font-semibold block mt-0.5 leading-none">{t.pricingDesc}</span>
                        </div>

                        {/* Feature Summary bullet points */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-start gap-2 text-xs">
                            <Check className="w-4 h-4 text-royalemerald shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-charcoal block text-[10px] uppercase font-mono">{t.featureCabin}</strong>
                              <span className="text-warmgray font-semibold text-[11px]">{tier.features.cabinFinish}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 text-xs">
                            <Check className="w-4 h-4 text-royalemerald shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-charcoal block text-[10px] uppercase font-mono">{t.featureDoor}</strong>
                              <span className="text-warmgray font-semibold text-[11px]">{tier.features.doorSensors}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 text-xs">
                            <Check className="w-4 h-4 text-royalemerald shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-charcoal block text-[10px] uppercase font-mono">{t.featureSpeed}</strong>
                              <span className="text-warmgray font-semibold text-[11px]">{tier.features.speed}</span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Action buttons inside card */}
                      <div className="p-6 bg-alabaster/40 border-t border-[#e5dfd4]/50 space-y-2">
                        <Button
                          onClick={() => handleSelectPackage(tier.id, tier.price)}
                          variant={tier.isRecommended ? "primary" : "secondary"}
                          className="w-full text-xs font-bold py-2.5"
                        >
                          <span>{t.selectBtn}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>

                        <button
                          onClick={() => setActiveCustomizingTier(tier.id)}
                          className="w-full text-center text-[10px] font-mono font-bold uppercase tracking-wider text-antiquegold hover:underline py-1.5"
                        >
                          {t.customizeBtn}
                        </button>
                      </div>

                    </Card>
                  );
                })}
              </div>

              {/* Complete Detailed Comparison Specs Table */}
              <Card className="p-6 bg-white overflow-hidden">
                <div className="border-b border-[#e5dfd4] pb-4 mb-4">
                  <h3 className="font-serif text-sm font-bold text-charcoal">Feature-by-Feature Comparison Matrix</h3>
                  <p className="text-[10px] text-warmgray font-semibold">Strict apples-to-apples baseline compliance standards across each grade.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#e5dfd4]">
                        <th className="py-3 px-2 font-mono uppercase tracking-wider text-warmgray text-[9px]">Elevator Feature Category</th>
                        {visibleTiers.map(t => (
                          <th key={t.id} className="py-3 px-4 font-serif text-charcoal font-extrabold text-[12px] min-w-[120px]">
                            {t.nameKey === 'basic' ? "Essential" : t.nameKey === 'premium' ? "Premium" : "Luxury"}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-semibold text-charcoal">
                      <tr className="border-b border-[#e5dfd4]/40 hover:bg-alabaster/20">
                        <td className="py-3.5 px-2 font-sans font-black text-charcoal">{t.featureCabin}</td>
                        {visibleTiers.map(t => (
                          <td key={t.id} className="py-3.5 px-4 text-warmgray font-medium text-[11px]">{t.features.cabinFinish}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-[#e5dfd4]/40 hover:bg-alabaster/20">
                        <td className="py-3.5 px-2 font-sans font-black text-charcoal">{t.featureDoor}</td>
                        {visibleTiers.map(t => (
                          <td key={t.id} className="py-3.5 px-4 text-warmgray font-medium text-[11px]">{t.features.doorSensors}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-[#e5dfd4]/40 hover:bg-alabaster/20">
                        <td className="py-3.5 px-2 font-sans font-black text-charcoal">{t.featureSpeed}</td>
                        {visibleTiers.map(t => (
                          <td key={t.id} className="py-3.5 px-4 text-warmgray font-medium text-[11px]">{t.features.speed}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-[#e5dfd4]/40 hover:bg-alabaster/20">
                        <td className="py-3.5 px-2 font-sans font-black text-charcoal">{t.featureEmergency}</td>
                        {visibleTiers.map(t => (
                          <td key={t.id} className="py-3.5 px-4 text-warmgray font-medium text-[11px]">{t.features.emergencyBackup}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-[#e5dfd4]/40 hover:bg-alabaster/20">
                        <td className="py-3.5 px-2 font-sans font-black text-charcoal">{t.featureWarranty}</td>
                        {visibleTiers.map(t => (
                          <td key={t.id} className="py-3.5 px-4 text-warmgray font-medium text-[11px]">{t.features.warranty}</td>
                        ))}
                      </tr>
                      <tr className="hover:bg-alabaster/20">
                        <td className="py-3.5 px-2 font-sans font-black text-charcoal">{t.featureAmc}</td>
                        {visibleTiers.map(t => (
                          <td key={t.id} className="py-3.5 px-4 text-warmgray font-medium text-[11px]">{t.features.amcSupport}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

        </div>

        {/* Right Side Control Panel: Presentation Controls & Price Settings */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Section: Presentation filter toggles */}
          <Card className="p-5 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4] pb-2">
              <h3 className="font-serif text-xs font-bold text-charcoal uppercase tracking-wider">{t.controlTitle}</h3>
              <p className="text-[9px] text-warmgray leading-snug">{t.controlDesc}</p>
            </div>

            <div className="space-y-3 text-xs">
              
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div className="space-y-0.5">
                  <span className="font-bold text-charcoal">Show Standard Tier</span>
                  <span className="text-[9px] text-warmgray block">₹{basicPrice.toLocaleString()} base</span>
                </div>
                <input 
                  type="checkbox"
                  checked={showBasic}
                  onChange={(e) => setShowBasic(e.target.checked)}
                  className="rounded text-royalemerald focus:ring-royalemerald border-[#e5dfd4]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 border-t border-[#e5dfd4]/40 pt-2">
                <div className="space-y-0.5">
                  <span className="font-bold text-charcoal">Show Premium Tier</span>
                  <span className="text-[9px] text-warmgray block">₹{premiumPrice.toLocaleString()} signature</span>
                </div>
                <input 
                  type="checkbox"
                  checked={showPremium}
                  onChange={(e) => setShowPremium(e.target.checked)}
                  className="rounded text-royalemerald focus:ring-royalemerald border-[#e5dfd4]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 border-t border-[#e5dfd4]/40 pt-2">
                <div className="space-y-0.5">
                  <span className="font-bold text-charcoal">Show Luxury Tier</span>
                  <span className="text-[9px] text-warmgray block">₹{luxuryPrice.toLocaleString()} high-end</span>
                </div>
                <input 
                  type="checkbox"
                  checked={showLuxury}
                  onChange={(e) => setShowLuxury(e.target.checked)}
                  className="rounded text-royalemerald focus:ring-royalemerald border-[#e5dfd4]"
                />
              </label>

            </div>
          </Card>

          {/* Section: Quick Interactive Price Tuners */}
          <Card className="p-5 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4] pb-2">
              <h3 className="font-serif text-xs font-bold text-charcoal uppercase tracking-wider">Adjustment Playground</h3>
              <p className="text-[9px] text-warmgray leading-snug">Adjust prices dynamically to simulate custom negotiations or trigger safety margin alerts.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-mono font-bold text-[10px]">
                  <span>STANDARD TIER</span>
                  <span>₹{basicPrice.toLocaleString()}</span>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setBasicPrice(prev => Math.max(700000, prev - 25000))} 
                    className="p-1.5 bg-alabaster border border-[#e5dfd4] rounded hover:bg-neutral-200"
                  >
                    <Minus className="w-3 h-3 text-charcoal" />
                  </button>
                  <button 
                    onClick={() => setBasicPrice(prev => Math.min(1000000, prev + 25000))} 
                    className="p-1.5 bg-alabaster border border-[#e5dfd4] rounded hover:bg-neutral-200"
                  >
                    <Plus className="w-3 h-3 text-charcoal" />
                  </button>
                  <input 
                    type="range" 
                    min="700000" 
                    max="1000000" 
                    step="25000"
                    value={basicPrice} 
                    onChange={(e) => setBasicPrice(parseInt(e.target.value))} 
                    className="w-full accent-antiquegold"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#e5dfd4]/40">
                <div className="flex justify-between font-mono font-bold text-[10px]">
                  <span>PREMIUM TIER</span>
                  <span>₹{premiumPrice.toLocaleString()}</span>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setPremiumPrice(prev => Math.max(1000000, prev - 25000))} 
                    className="p-1.5 bg-alabaster border border-[#e5dfd4] rounded hover:bg-neutral-200"
                  >
                    <Minus className="w-3 h-3 text-charcoal" />
                  </button>
                  <button 
                    onClick={() => setPremiumPrice(prev => Math.min(1400000, prev + 25000))} 
                    className="p-1.5 bg-alabaster border border-[#e5dfd4] rounded hover:bg-neutral-200"
                  >
                    <Plus className="w-3 h-3 text-charcoal" />
                  </button>
                  <input 
                    type="range" 
                    min="1000000" 
                    max="1400000" 
                    step="25000"
                    value={premiumPrice} 
                    onChange={(e) => setPremiumPrice(parseInt(e.target.value))} 
                    className="w-full accent-antiquegold"
                  />
                </div>
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* Hybrid Customization Modal Pane ("Customize from here") */}
      {activeCustomizingTier && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="p-6 bg-white max-w-lg w-full space-y-6 border border-antiquegold/25 shadow-xl">
            <div className="border-b border-[#e5dfd4] pb-3">
              <span className="text-[10px] font-mono font-bold text-antiquegold block uppercase tracking-widest">{t.customizeTitle}</span>
              <h3 className="font-serif text-lg font-black text-charcoal mt-0.5">
                Adjusting Baseline: {activeCustomizingTier === 'pkg_basic' ? "Standard" : activeCustomizingTier === 'pkg_premium' ? "Premium" : "Luxury"}
              </h3>
              <p className="text-[10px] text-warmgray mt-0.5 font-semibold">
                {t.customizeDesc}
              </p>
            </div>

            {/* Customizer controls */}
            <div className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase font-bold text-charcoal">Cabin Wall/Floor Material Polish</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomCabin('brushed')}
                    className={`p-2.5 rounded-lg border text-[10px] font-semibold transition-all ${
                      customCabin === 'brushed' 
                        ? 'bg-charcoal text-white border-charcoal' 
                        : 'bg-alabaster text-warmgray border-[#e5dfd4] hover:bg-neutral-100'
                    }`}
                  >
                    Standard Hairline
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomCabin('gold_hairline')}
                    className={`p-2.5 rounded-lg border text-[10px] font-semibold transition-all ${
                      customCabin === 'gold_hairline' 
                        ? 'bg-charcoal text-white border-charcoal' 
                        : 'bg-alabaster text-warmgray border-[#e5dfd4] hover:bg-neutral-100'
                    }`}
                  >
                    Antique Gold Accent
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomCabin('glass')}
                    className={`p-2.5 rounded-lg border text-[10px] font-semibold transition-all ${
                      customCabin === 'glass' 
                        ? 'bg-charcoal text-white border-charcoal' 
                        : 'bg-alabaster text-warmgray border-[#e5dfd4] hover:bg-neutral-100'
                    }`}
                  >
                    Panoramic Glass Back
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#e5dfd4]/40">
                <label className="font-mono text-[10px] uppercase font-bold text-charcoal">Infrared Door Obstacle Grid Safety</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomSafety('standard')}
                    className={`p-2.5 rounded-lg border text-[10px] font-semibold transition-all ${
                      customSafety === 'standard' 
                        ? 'bg-charcoal text-white border-charcoal' 
                        : 'bg-alabaster text-warmgray border-[#e5dfd4] hover:bg-neutral-100'
                    }`}
                  >
                    Basic 2D Beam
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomSafety('advanced')}
                    className={`p-2.5 rounded-lg border text-[10px] font-semibold transition-all ${
                      customSafety === 'advanced' 
                        ? 'bg-charcoal text-white border-charcoal' 
                        : 'bg-alabaster text-warmgray border-[#e5dfd4] hover:bg-neutral-100'
                    }`}
                  >
                    Advanced 3D curtain
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomSafety('premium_voice')}
                    className={`p-2.5 rounded-lg border text-[10px] font-semibold transition-all ${
                      customSafety === 'premium_voice' 
                        ? 'bg-charcoal text-white border-charcoal' 
                        : 'bg-alabaster text-warmgray border-[#e5dfd4] hover:bg-neutral-100'
                    }`}
                  >
                    Voice assisted ARD
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#e5dfd4]/40">
                <div className="flex justify-between items-baseline font-mono text-[10px] uppercase font-bold text-charcoal">
                  <span>Warranty coverage period</span>
                  <span className="text-royalemerald font-black">{customWarranty} Years</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="5"
                  value={customWarranty}
                  onChange={(e) => setCustomWarranty(parseInt(e.target.value))}
                  className="w-full accent-antiquegold"
                />
              </div>

            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end gap-2 text-xs font-bold pt-2 border-t border-[#e5dfd4]/50">
              <button
                onClick={() => setActiveCustomizingTier(null)}
                className="py-2.5 px-4 rounded-xl bg-alabaster border border-[#e5dfd4] text-warmgray"
              >
                Cancel
              </button>
              <Button
                onClick={handleApplyCustomizations}
                variant="primary"
                className="py-2.5 px-4"
              >
                {t.applyCustomBtn}
              </Button>
            </div>

          </Card>
        </div>
      )}

    </div>
  );
};
