import React, { useState, useMemo } from 'react';
import { 
  Settings, Image, FileText, Calendar, CheckCircle2, AlertTriangle, 
  RefreshCw, Palette, Shield, Info, HelpCircle, Eye, Sliders, MapPin, Sparkles, Check
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

interface TemplateVariant {
  id: string;
  name: string;
  category: 'residential' | 'premium' | 'commercial';
  description: string;
  defaultValidityDays: number;
}

export const QuotationTemplateBranding: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const [toastMsg, setToastMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial templates seed
  const templateVariants: TemplateVariant[] = useMemo(() => [
    {
      id: 'tpl_res_std',
      name: 'Residential Standard Layout',
      category: 'residential',
      description: 'Elegant layout for 4-8 pax residential villas and low-rise apartments.',
      defaultValidityDays: 30
    },
    {
      id: 'tpl_luxury_gold',
      name: 'Ascension Premium & Luxury Suite',
      category: 'premium',
      description: 'Bespoke design featuring Antique Gold visual highlights and deep detail specifications.',
      defaultValidityDays: 15
    },
    {
      id: 'tpl_comm_bulk',
      name: 'Commercial Bulk & Heavy Freight',
      category: 'commercial',
      description: 'Structured grid formatting optimized for multi-car installations and corporate RFPs.',
      defaultValidityDays: 45
    }
  ], []);

  // Form State
  const [selectedVariantId, setSelectedVariantId] = useState<string>('tpl_luxury_gold');
  const [validityDays, setValidityDays] = useState<number>(15);
  const [tagline, setTagline] = useState<string>('Elevating Craftsmanship, Guaranteeing Absolute Passenger Safety.');
  const [logoPosition, setLogoPosition] = useState<'left' | 'center' | 'right'>('left');
  const [nationalBoilerplate, setNationalBoilerplate] = useState<string>(
    "1. This quotation is subject to the terms and specifications listed herein.\n2. All structural shaft clearances must be handed over in finished plastered conditions.\n3. The company holds zero liability for power supply delays or civil force majeure events."
  );
  
  // State specific Lift Act override block
  const [stateOverrideAct, setStateOverrideAct] = useState<string>('Maharashtra Lift Act 2018 (Section 4 Compliance Rules applies)');
  const [hasStateOverride, setHasStateOverride] = useState<boolean>(true);

  // Logo Resolution check state
  const [logoUrl, setLogoUrl] = useState<string>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60');
  const [logoResolutionWarn, setLogoResolutionWarn] = useState<boolean>(false);

  // Handle fake logo link changes and warn if low-res mock image url
  const handleLogoUrlChange = (url: string) => {
    setLogoUrl(url);
    if (url.includes('small') || url.length < 50) {
      setLogoResolutionWarn(true);
    } else {
      setLogoResolutionWarn(false);
    }
  };

  const handleSave = () => {
    const config = {
      selectedVariantId,
      validityDays,
      tagline,
      logoPosition,
      nationalBoilerplate,
      stateOverrideAct,
      hasStateOverride,
      logoUrl
    };
    localStorage.setItem('aiec_global_quote_branding', JSON.stringify(config));
    triggerToast(t.toastSaved);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const selectedVariant = useMemo(() => {
    return templateVariants.find(t => t.id === selectedVariantId) || templateVariants[1];
  }, [selectedVariantId, templateVariants]);

  // Multilingual localization
  const t = useMemo(() => {
    const localizations = {
      en: {
        title: "Quotation Template & Branding",
        subtitle: "Global visual style & compliance controller. Enforce legal disclaimers, brand taglines, and validities across all sales quotation outputs.",
        variantSection: "Template Variant Settings",
        variantDesc: "Select standard or premium layouts configured specifically for different elevator categories.",
        brandingSection: "Corporate Branding Elements",
        brandingDesc: "Configure logo placement, taglines, and aesthetic colors matching Alabaster & Ascension guidelines.",
        legalSection: "Legal Boilerplate & Disclaimers",
        legalDesc: "Manage validity expirations and national/state-specific lift code regulations.",
        previewLabel: "Live Customer-Facing Proposal Preview",
        previewSubtitle: "Exact print/PDF layout representing the chosen theme configuration.",
        saveBtn: "Save Branding Configuration",
        logoWarn: "Low Resolution Warning: This logo file has sub-optimal resolution and may print blurry. We recommend a high-resolution transparent PNG (min 300 DPI).",
        jurisdictionToggle: "Enable State-Specific Lift Act Override",
        jurisdictionLabel: "State Lift Act Reference Clauses",
        validityLabel: "Quotation Expiration Window (Days)",
        taglineLabel: "Company Brand Tagline Footer",
        logoPosLabel: "Logo Header Alignment",
        toastSaved: "Global Branding Config successfully deployed! Future quotation requests will inherit these properties.",
        taglinePlaceholder: "Enter brand tagline...",
        boilerplateLabel: "National Terms and Conditions Boilerplate",
        sampleQuoteNo: "Quote Proposal: #AIEC-2026-9042",
        sampleDate: "Dated: July 11, 2026",
        sampleLead: "Ramesh Patil's Royal Palace Complex",
        sampleTotal: "Est. Proposal Total: ₹1,148,000"
      },
      hi: {
        title: "कोटेशन टेम्पलेट और ब्रांडिंग",
        subtitle: "वैश्विक दृश्य शैली और अनुपालन नियंत्रक। सभी बिक्री उद्धरणों में कानूनी अस्वीकरण, ब्रांड टैगलाइन और वैधता लागू करें।",
        variantSection: "टेम्पलेट संस्करण सेटिंग्स",
        variantDesc: "विभिन्न लिफ्ट श्रेणियों के लिए विशेष रूप से कॉन्फ़िगर किए गए मानक या प्रीमियम लेआउट का चयन करें।",
        brandingSection: "कॉर्पोरेट ब्रांडिंग तत्व",
        brandingDesc: "अलाबास्टर और एसेंशन दिशानिर्देशों से मेल खाने वाले लोगो प्लेसमेंट, टैगलाइन और सौंदर्यपूर्ण रंगों को कॉन्फ़िगर करें।",
        legalSection: "कानूनी बॉयलरप्लेट और अस्वीकरण",
        legalDesc: "वैधता समाप्ति और राष्ट्रीय/राज्य-विशिष्ट लिफ्ट कोड विनियमों का प्रबंधन करें।",
        previewLabel: "लाइव ग्राहक-सामना प्रस्ताव पूर्वावलोकन",
        previewSubtitle: "चुने गए थीम कॉन्फ़िगरेशन का सटीक प्रिंट/पीडीएफ लेआउट।",
        saveBtn: "ब्रांडिंग कॉन्फ़िगरेशन सहेजें",
        logoWarn: "कम रिज़ॉल्यूशन चेतावनी: यह लोगो फ़ाइल धुंधली हो सकती है। हम उच्च रिज़ॉल्यूशन पारदर्शी पीएनजी (न्यूनतम 300 डीपीआई) की अनुशंसा करते हैं।",
        jurisdictionToggle: "राज्य-विशिष्ट लिफ्ट अधिनियम ओवरराइड सक्षम करें",
        jurisdictionLabel: "राज्य लिफ्ट अधिनियम संदर्भ खंड",
        validityLabel: "कोटेशन समाप्ति विंडो (दिन)",
        taglineLabel: "कंपनी ब्रांड टैगलाइन फ़ुटर",
        logoPosLabel: "लोगो हेडर संरेखण",
        toastSaved: "वैश्विक ब्रांडिंग कॉन्फ़िगरेशन सफलतापूर्वक लागू किया गया! भविष्य के कोटेशन को ये गुण विरासत में मिलेंगे।",
        taglinePlaceholder: "ब्रांड टैगलाइन दर्ज करें...",
        boilerplateLabel: "राष्ट्रीय नियम और शर्तें बॉयलरप्लेट",
        sampleQuoteNo: "कोट प्रस्ताव: #AIEC-2026-9042",
        sampleDate: "दिनांक: 11 जुलाई, 2026",
        sampleLead: "रमेश पाटिल का रॉयल पैलेस कॉम्प्लेक्स",
        sampleTotal: "अनुमानित प्रस्ताव कुल: ₹1,148,000"
      },
      mr: {
        title: "कोटेशन टेम्पलेट आणि ब्रँडिंग",
        subtitle: "वैश्विक डिझाईन आणि कायदेशीर अनुपालन नियंत्रण. सर्व विक्री कोटेशनसाठी कायदेशीर अटी, ब्रीदवाक्य आणि मुदत लागू करा.",
        variantSection: "टेम्पलेटचे प्रकार",
        variantDesc: "वेगवेगळ्या लिफ्ट प्रकारांनुसार डिझाइन केलेले लेआउट निवडा.",
        brandingSection: "ब्रँडिंग घटक",
        brandingDesc: "ब्रँड मार्गदर्शक तत्त्वांनुसार लोगो जागा, घोषवाक्य आणि रंग निश्चित करा.",
        legalSection: "कायदेशीर अटी आणि नियमावली",
        legalDesc: "मुदतीची मर्यादा आणि राष्ट्रीय/राज्य लिफ्ट नियमावलींचे नियंत्रण करा.",
        previewLabel: "थेट ग्राहक कोटेशन पूर्वावलोकन",
        previewSubtitle: "ग्राहकाला दिसणाऱ्या अंतिम कोटेशनचे डिझाईन.",
        saveBtn: "ब्रँडिंग कॉन्फिगरेशन जतन करा",
        logoWarn: "कमी रिझॉल्यूशन इशारा: हा लोगो अस्पष्ट दिसू शकतो. चांगल्या प्रिंटिंगसाठी पारदर्शक PNG (३०० DPI) वापरा.",
        jurisdictionToggle: "राज्य-विशिष्ट लिफ्ट नियमावली ओव्हरराइड सक्षम करा",
        jurisdictionLabel: "राज्य लिफ्ट नियमावली संदर्भ",
        validityLabel: "कोटेशन मुदत मर्यादा (दिवस)",
        taglineLabel: "कंपनीचे घोषवाक्य (फूटर)",
        logoPosLabel: "लोगो अलाइनमेंट",
        toastSaved: "ग्लोबल ब्रँडिंग कॉन्फिगरेशन यशस्वीरित्या जतन झाले आहे!",
        taglinePlaceholder: "घोषवाक्य प्रविष्ट करा...",
        boilerplateLabel: "राष्ट्रीय नियम आणि अटी",
        sampleQuoteNo: "कोटेशन प्रस्ताव: #AIEC-2026-9042",
        sampleDate: "दिनांक: ११ जुलै, २०२६",
        sampleLead: "रमेश पाटील यांचे रॉयल पॅलेस",
        sampleTotal: "अंदाजित एकूण किंमत: ₹१,१४८,०००"
      }
    };
    return localizations[language] || localizations.en;
  }, [language]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast notifications */}
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
            <span>Auto-Quotation Engine Module Progress (Screen 3 of 10)</span>
            <span>30.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '30%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 63 of 200)</span>
            <span>31.5%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '31.5%' }} />
          </div>
        </div>
      </div>

      {/* SLA Metric Headroom / Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            GLOBAL DESIGN SYSTEM • MODULE 7 • COMPLIANCE LAYOUTS
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
            onClick={handleSave}
            variant="primary"
            className="text-xs font-bold py-2.5 px-5 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{t.saveBtn}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Interactive controls panel - settings layout pattern */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Section: Variant picker */}
          <Card className="p-6 bg-white space-y-4">
            <div className="border-b border-[rgba(184,135,61,0.15)] pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4.5 h-4.5 text-antiquegold" />
                <h3 className="font-serif text-sm font-bold text-charcoal">{t.variantSection}</h3>
              </div>
              <p className="text-[10px] text-warmgray mt-0.5">{t.variantDesc}</p>
            </div>

            <div className="space-y-3">
              {templateVariants.map((variant) => {
                const isSelected = selectedVariantId === variant.id;
                return (
                  <div
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setValidityDays(variant.defaultValidityDays);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-alabaster border-antiquegold ring-1 ring-antiquegold/30' 
                        : 'bg-white border-[#e5dfd4] hover:bg-alabaster/40'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-charcoal">{variant.name}</span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-royalemerald text-white flex items-center justify-center text-[8px]">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-warmgray mt-1 font-medium">{variant.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Section: Corporate Branding elements */}
          <Card className="p-6 bg-white space-y-4">
            <div className="border-b border-[rgba(184,135,61,0.15)] pb-3">
              <div className="flex items-center gap-2">
                <Image className="w-4.5 h-4.5 text-antiquegold" />
                <h3 className="font-serif text-sm font-bold text-charcoal">{t.brandingSection}</h3>
              </div>
              <p className="text-[10px] text-warmgray mt-0.5">{t.brandingDesc}</p>
            </div>

            {/* Logo link control */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                Company Brand Logo URL
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => handleLogoUrlChange(e.target.value)}
                className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-mono font-bold text-charcoal focus:outline-none"
              />
            </div>

            {/* Logo low-res warn edge case */}
            {logoResolutionWarn && (
              <div className="p-3 bg-red-50 border border-[#B23B3B]/20 rounded-xl flex items-start gap-2 text-[10px] font-bold text-[#B23B3B]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t.logoWarn}</span>
              </div>
            )}

            {/* Logo alignment toggle layout */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                {t.logoPosLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['left', 'center', 'right'] as const).map((pos) => {
                  const isSelected = logoPosition === pos;
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setLogoPosition(pos)}
                      className={`py-2 px-3 text-[10px] font-mono uppercase font-black rounded-lg border capitalize transition-all ${
                        isSelected 
                          ? 'bg-charcoal text-white border-charcoal' 
                          : 'bg-white text-warmgray border-[#e5dfd4] hover:bg-alabaster'
                      }`}
                    >
                      {pos}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tagline input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                {t.taglineLabel}
              </label>
              <input
                type="text"
                placeholder={t.taglinePlaceholder}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-semibold text-charcoal focus:outline-none"
              />
            </div>

          </Card>

          {/* Section: Legal terms & boilerplate control */}
          <Card className="p-6 bg-white space-y-4">
            <div className="border-b border-[rgba(184,135,61,0.15)] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4.5 h-4.5 text-antiquegold" />
                <h3 className="font-serif text-sm font-bold text-charcoal">{t.legalSection}</h3>
              </div>
              <p className="text-[10px] text-warmgray mt-0.5">{t.legalDesc}</p>
            </div>

            {/* Validity period slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-charcoal uppercase font-mono">{t.validityLabel}</span>
                <span className="text-royalemerald font-mono">{validityDays} Days</span>
              </div>
              <input 
                type="range"
                min="5"
                max="90"
                value={validityDays}
                onChange={(e) => setValidityDays(parseInt(e.target.value))}
                className="w-full accent-antiquegold bg-alabaster h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* National terms and conditions textbox */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                {t.boilerplateLabel}
              </label>
              <textarea
                rows={3}
                value={nationalBoilerplate}
                onChange={(e) => setNationalBoilerplate(e.target.value)}
                className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-semibold text-charcoal focus:outline-none"
              />
            </div>

            {/* State jurisdiction checkbox toggle and input */}
            <div className="space-y-3 pt-1 border-t border-[#e5dfd4]/60">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-charcoal">{t.jurisdictionToggle}</span>
                <input 
                  type="checkbox"
                  checked={hasStateOverride}
                  onChange={(e) => setHasStateOverride(e.target.checked)}
                  className="rounded border-[#e5dfd4] text-royalemerald focus:ring-royalemerald"
                />
              </label>

              {hasStateOverride && (
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-mono font-bold text-warmgray">{t.jurisdictionLabel}</label>
                  <input
                    type="text"
                    value={stateOverrideAct}
                    onChange={(e) => setStateOverrideAct(e.target.value)}
                    className="w-full bg-white border border-[#e5dfd4] rounded-lg p-2 text-xs font-semibold text-charcoal focus:outline-none"
                  />
                </div>
              )}
            </div>

          </Card>

        </div>

        {/* Right Preview Side: Real customer proposal rendered dynamically */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-royalemerald" />
              <h4 className="font-serif text-sm font-bold text-charcoal">{t.previewLabel}</h4>
            </div>
            <span className="text-[10px] font-mono font-bold text-warmgray uppercase">{t.previewSubtitle}</span>
          </div>

          {/* Dynamic Quote Paper Sheet */}
          <div className="bg-[#FFFFFF] border border-[rgba(184,135,61,0.25)] rounded-2xl shadow-md overflow-hidden relative min-h-[600px] flex flex-col justify-between">
            
            {/* Structural visual theme bars */}
            <div className="h-2 bg-antiquegold w-full" />

            <div className="p-8 flex-1 space-y-6">
              
              {/* Header block logo position alignment */}
              <div className={`flex ${
                logoPosition === 'left' ? 'justify-start' : logoPosition === 'center' ? 'justify-center' : 'justify-end'
              }`}>
                <div className="space-y-2">
                  <img 
                    src={logoUrl} 
                    alt="Company Brand Logo" 
                    className="h-10 object-contain mx-auto" 
                    onError={(e) => {
                      // Fallback logo placeholder if low-res unsplash fails
                      e.currentTarget.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60";
                    }}
                  />
                  <span className="block text-[10px] tracking-widest font-mono text-center font-black uppercase text-antiquegold">
                    ALL INDIA ELEVATORS CO.
                  </span>
                </div>
              </div>

              {/* Proposal core addresses */}
              <div className="grid grid-cols-2 gap-4 border-y border-[#e5dfd4]/40 py-4 text-xs font-sans">
                <div className="space-y-1">
                  <span className="text-[8px] uppercase font-mono text-warmgray font-bold block">Quotation Issued For:</span>
                  <span className="font-serif font-black text-charcoal block">{t.sampleLead}</span>
                  <span className="text-warmgray block">Kothrud, Pune</span>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[8px] uppercase font-mono text-warmgray font-bold block">Validity Meta:</span>
                  <span className="font-mono font-bold text-charcoal block">{t.sampleQuoteNo}</span>
                  <span className="text-royalemerald font-mono block font-bold">{t.sampleDate}</span>
                  <span className="text-[#B23B3B] font-mono font-bold block">Expires in: {validityDays} Days</span>
                </div>
              </div>

              {/* Specs & prices table */}
              <div className="space-y-3">
                <div className="bg-alabaster p-3.5 rounded-xl border border-[#e5dfd4]/50 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-xs font-serif font-bold text-charcoal">Bespoke 6-Passenger Gearless Machine Package</span>
                    <span className="text-[9px] text-warmgray block">Premium Cabin Polish, 5 Stop automatic doors (3 Phase Standard)</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-charcoal">₹1,148,000</span>
                </div>

                {/* Subtotal & taxes */}
                <div className="space-y-1.5 text-right text-xs">
                  <div className="flex justify-between max-w-xs ml-auto">
                    <span className="text-warmgray font-semibold">Taxable Subtotal:</span>
                    <span className="font-mono font-bold text-charcoal">₹972,881</span>
                  </div>
                  <div className="flex justify-between max-w-xs ml-auto">
                    <span className="text-warmgray font-semibold">Goods & Services Tax (GST 18%):</span>
                    <span className="font-mono font-bold text-charcoal">₹175,119</span>
                  </div>
                  <div className="flex justify-between max-w-xs ml-auto border-t border-[#e5dfd4]/80 pt-2 font-serif text-sm font-black text-charcoal">
                    <span>{t.sampleTotal}</span>
                  </div>
                </div>
              </div>

              {/* Technical disclaimer terms boilerplate */}
              <div className="border-t border-[#e5dfd4]/40 pt-4 space-y-2">
                <span className="text-[9px] uppercase font-mono text-warmgray font-bold block">Terms, Boilerplate & Jurisdiction Standards</span>
                <div className="text-[9px] text-warmgray font-medium leading-relaxed whitespace-pre-line">
                  {nationalBoilerplate}
                </div>

                {/* State acts if active */}
                {hasStateOverride && stateOverrideAct && (
                  <div className="mt-3 p-2 bg-emerald-50/40 border border-royalemerald/10 rounded-lg text-[9px] font-mono text-royalemerald leading-normal">
                    <strong className="block uppercase text-[8px] tracking-wider mb-0.5">Regional Statutory Code Compliance:</strong>
                    {stateOverrideAct}
                  </div>
                )}
              </div>

            </div>

            {/* Tagline footer section */}
            <div className="bg-alabaster p-4 border-t border-[#e5dfd4] text-center space-y-1">
              <p className="text-[9px] font-serif font-bold italic text-charcoal">
                "{tagline}"
              </p>
              <span className="block text-[8px] font-mono text-warmgray uppercase">ALL INDIA ELEVATORS CO. • OFFICIAL SYSTEM NOTIFICATION NODES</span>
            </div>

          </div>

          {/* Prompt 063 Done checkpoint reminder alert */}
          <div className="p-4 bg-emerald-50 border border-royalemerald/20 rounded-xl space-y-1 text-xs text-royalemerald">
            <span className="font-bold block uppercase tracking-wider font-mono">Module 7 Branding Guardrails</span>
            <p className="font-semibold leading-relaxed">
              Global variables updated here dynamically affect all future quotation templates. In-flight sent documents retain initial snapshots to ensure no retroactive disputes arise with prospective owners.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
