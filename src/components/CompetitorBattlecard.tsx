import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShieldAlert, AlertTriangle, Check, X, ShieldCheck, 
  HelpCircle, ChevronRight, Edit, Plus, Trash2, RefreshCw, 
  Flag, Award, Lock, ExternalLink, Filter, TrendingDown, TrendingUp
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

interface Battlecard {
  id: string;
  competitorName: string;
  category: 'mfg_giant' | 'local_aggregator' | 'boutique';
  pricePositioningSummary: string;
  strengths: string[];
  weaknesses: string[];
  aiecDifferentiation: string[];
  lastReviewedDate: string;
  reviewStatus: 'verified' | 'needs_update';
  marketSharePercentage: number;
}

const initialBattlecards: Battlecard[] = [
  {
    id: "comp-1",
    competitorName: "Otis India / Schindler",
    category: "mfg_giant",
    pricePositioningSummary: "Premium Global Tier (₹12L - ₹22L base installs). Surcharges on safety accessories.",
    strengths: [
      "Extremely high brand recall among luxury villa buyers",
      "Decades of physical safety engineering track record",
      "In-house physical heavy equipment foundries"
    ],
    weaknesses: [
      "Long lead times (often 4-6 months minimum for custom lifts)",
      "Highly rigid civil masonry shaft requirements",
      "Extremely expensive post-warranty annual maintenance contracts"
    ],
    aiecDifferentiation: [
      "AIEC delivers custom designs in under 6 weeks via Pune pre-assembled structural shaft kits",
      "Our asset-light aggregator model is 40% cheaper on initial install without compromising BIS safety",
      "Live remote IoT telemetry & automated response dispatch built-in by default"
    ],
    lastReviewedDate: "2026-06-10",
    reviewStatus: "verified",
    marketSharePercentage: 35
  },
  {
    id: "comp-2",
    competitorName: "Regional Unorganized Fabricators",
    category: "local_aggregator",
    pricePositioningSummary: "Extremely low-cost tier (₹2.5L - ₹4.5L). Often bypasses municipal lift inspections.",
    strengths: [
      "Extremely aggressive initial price positioning",
      "High local relationships and immediate site visit responsiveness",
      "Willing to build inside sub-standard or undersized shafts"
    ],
    weaknesses: [
      "Bypasses critical BIS / IS-14665 safety elevator guidelines",
      "No ARD (Automatic Rescue Device) standard backup battery",
      "Very high rate of breakdown (average 11 unscheduled outages/year)"
    ],
    aiecDifferentiation: [
      "AIEC is fully compliant with state lift inspector codes and BIS norms",
      "Every AIEC quotation guarantees zero hidden material costs and includes standard ARD",
      "Legally verified 3-year warranty backed by a centralized digital records block"
    ],
    lastReviewedDate: "2026-07-01",
    reviewStatus: "verified",
    marketSharePercentage: 45
  },
  {
    id: "comp-3",
    competitorName: "Elite Custom Boutique Designers",
    category: "boutique",
    pricePositioningSummary: "Ultra-luxury custom premium (₹18L - ₹35L). Immersive glass & copper finishes.",
    strengths: [
      "Handcrafted gold, bronze, and panoramic glass aesthetic work",
      "Strong architect-network integration and high referral fees"
    ],
    weaknesses: [
      "No automated remote IoT health monitoring",
      "Very slow maintenance response times due to custom imported components"
    ],
    aiecDifferentiation: [
      "AIEC offers identical premium glass panel layouts at 1/2 of the custom designer pricing",
      "Our supply network sources architectural panels from top-tier Maharashtra design labs",
      "Guaranteed maintenance turnaround inside 4 hours or downtime penalty applies"
    ],
    lastReviewedDate: "2026-05-18",
    reviewStatus: "needs_update",
    marketSharePercentage: 10
  }
];

const categoryLabels = {
  en: {
    mfg_giant: "Global Manufacturing Giants",
    local_aggregator: "Local Fabricators",
    boutique: "Ultra-Luxury Boutique Designers"
  },
  hi: {
    mfg_giant: "वैश्विक विनिर्माण दिग्गज",
    local_aggregator: "स्थानीय असेंबलर्स",
    boutique: "अल्ट्रा-लक्जरी बुटीक डिजाइनर"
  },
  mr: {
    mfg_giant: "ग्लोबल ब्रँड आणि कंपन्या",
    local_aggregator: "स्थानिक फॅब्रिकेटर्स",
    boutique: "अल्ट्रा-लक्झरी डिझायनर्स"
  }
};

const localizations = {
  en: {
    title: "Competitor Battlecards Reference",
    subtitle: "Internal-only fact sheets comparing AIEC with global giants and local fabricators. Use these to frame constructive comparisons.",
    warningBanner: "INTERNAL SALES CONFIDENTIAL • NOT FOR CUSTOMER DISTRIBUTION",
    priceTier: "Price Positioning Range",
    competitorStrengths: "Competitor Typical Strengths",
    competitorWeaknesses: "Competitor Main Weaknesses",
    aiecAdvantage: "AIEC Core Strategic Differentiators",
    flagStaleBtn: "Flag Stale Data",
    addBtn: "Add Competitor Battlecard",
    searchPlaceholder: "Search competitors or positioning keywords...",
    addModalTitle: "Add New Competitor Profile",
    saveProfileBtn: "Commit Competitor Battlecard",
    toastFlagged: "Competitor profile flagged for Admin review. Thank you.",
    toastAdded: "New competitor battlecard added to internal registry successfully.",
    marketShare: "Estimated Market Share",
    lastReviewed: "Last Reviewed",
    verifiedBadge: "Verified Fact-Grounded",
    staleBadge: "Needs Review"
  },
  hi: {
    title: "प्रतिस्पर्धी बैटलकार्ड संदर्भ",
    subtitle: "केवल आंतरिक उपयोग के लिए तथ्य पत्रक जो AIEC की तुलना वैश्विक दिग्गजों और स्थानीय ऑपरेटरों से करते हैं।",
    warningBanner: "आंतरिक बिक्री गोपनीय • ग्राहकों को वितरित करने के लिए नहीं है",
    priceTier: "मूल्य निर्धारण श्रेणी",
    competitorStrengths: "प्रतिस्पर्धी की मुख्य ताकतें",
    competitorWeaknesses: "प्रतिस्पर्धी की मुख्य कमजोरियां",
    aiecAdvantage: "AIEC मुख्य रणनीतिक लाभ",
    flagStaleBtn: "समीक्षा के लिए चिह्नित करें",
    addBtn: "नया बैटलकार्ड जोड़ें",
    searchPlaceholder: "प्रतिस्पर्धी या मूल्य निर्धारण खोजें...",
    addModalTitle: "नया प्रतिस्पर्धी प्रोफाइल जोड़ें",
    saveProfileBtn: "बैटलकार्ड प्रोफाइल सहेजें",
    toastFlagged: "प्रतिस्पर्धी प्रोफाइल को एडमिन समीक्षा के लिए चिह्नित किया गया।",
    toastAdded: "नया प्रतिस्पर्धी बैटलकार्ड आंतरिक रजिस्ट्री में जोड़ा गया।",
    marketShare: "अनुमानित बाजार हिस्सेदारी",
    lastReviewed: "अंतिम समीक्षा",
    verifiedBadge: "सत्यापित तथ्य",
    staleBadge: "समीक्षा आवश्यक"
  },
  mr: {
    title: "स्पर्धक तुलना बॅटलकार्ड्स",
    subtitle: "AIEC आणि इतर स्पर्धक कंपन्यांमधील तुलनात्मक माहितीपत्रक (केवळ सेल्स आणि स्टाफच्या अंतर्गत वापरासाठी).",
    warningBanner: "केवळ अंतर्गत माहिती • ग्राहकांना दाखवण्यासाठी किंवा पाठवण्यासाठी नाही",
    priceTier: "किंमत श्रेणी",
    competitorStrengths: "स्पर्धकांचे बलस्थान",
    competitorWeaknesses: "स्पर्धकांचे उणिवा",
    aiecAdvantage: "AIEC चे मुख्य फायदे आणि मूल्य",
    flagStaleBtn: "माहिती अद्ययावत करा",
    addBtn: "नवीन स्पर्धक जोडा",
    searchPlaceholder: "स्पर्धकांचे नाव किंवा किमतीनुसार शोधा...",
    addModalTitle: "नवीन स्पर्धक समाविष्ट करा",
    saveProfileBtn: "स्पर्धक प्रोफाइल जतन करा",
    toastFlagged: "स्पर्धकाची माहिती एडमिनकडे पुनरावलोकनासाठी पाठवली आहे.",
    toastAdded: "नवीन स्पर्धक तुलना बॅटलकार्ड यशस्वीरीत्या जतन केले गेले.",
    marketShare: "अंदाजित मार्केट शेअर",
    lastReviewed: "अंतिम पडताळणी",
    verifiedBadge: "सत्यता पडताळणी पूर्ण",
    staleBadge: "बदलाव आवश्यक"
  }
};

export const CompetitorBattlecard: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [battlecards, setBattlecards] = useState<Battlecard[]>(initialBattlecards);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // New competitor form states
  const [newCompName, setNewCompName] = useState('');
  const [newCategory, setNewCategory] = useState<'mfg_giant' | 'local_aggregator' | 'boutique'>('mfg_giant');
  const [newPrice, setNewPrice] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  const [newAdvantage, setNewAdvantage] = useState('');

  const t = useMemo(() => {
    return localizations[language as 'en' | 'hi' | 'mr'] || localizations.en;
  }, [language]);

  const catT = useMemo(() => {
    return categoryLabels[language as 'en' | 'hi' | 'mr'] || categoryLabels.en;
  }, [language]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const filteredCards = useMemo(() => {
    return battlecards.filter(card => {
      const matchesCategory = activeCategory === 'all' || card.category === activeCategory;
      const matchesSearch = 
        card.competitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.pricePositioningSummary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [battlecards, activeCategory, searchQuery]);

  const handleFlagStale = (id: string) => {
    setBattlecards(prev => prev.map(card => {
      if (card.id === id) {
        triggerToast(t.toastFlagged);
        return { ...card, reviewStatus: 'needs_update' };
      }
      return card;
    }));
  };

  const handleCreateBattlecard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName || !newPrice) {
      triggerToast("Please fill the mandatory competitor fields.");
      return;
    }

    const newCard: Battlecard = {
      id: `comp-${Date.now()}`,
      competitorName: newCompName,
      category: newCategory,
      pricePositioningSummary: newPrice,
      strengths: newStrength ? newStrength.split('\n').filter(Boolean) : ["Regional relationships"],
      weaknesses: newWeakness ? newWeakness.split('\n').filter(Boolean) : ["Unregulated pricing structures"],
      aiecDifferentiation: newAdvantage ? newAdvantage.split('\n').filter(Boolean) : ["Guaranteed installation timeline on contract"],
      lastReviewedDate: new Date().toISOString().split('T')[0],
      reviewStatus: 'verified',
      marketSharePercentage: 5
    };

    setBattlecards([newCard, ...battlecards]);
    setShowAddModal(false);

    // Clear form
    setNewCompName('');
    setNewPrice('');
    setNewStrength('');
    setNewWeakness('');
    setNewAdvantage('');

    triggerToast(t.toastAdded);
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-royalemerald text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/25 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Module 8: Competitor Analysis (Screen 9 of 10)</span>
            <span>90.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '90%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 79 of 200)</span>
            <span>39.5%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '39.5%' }} />
          </div>
        </div>
      </div>

      {/* Red Confidential Warning Banner */}
      <div className="p-3 bg-red-50 text-error rounded-xl border border-red-200/50 flex items-center gap-2.5 text-[10px] font-mono font-extrabold tracking-wider">
        <Lock className="w-4 h-4 text-error shrink-0" />
        <span>⚠️ {t.warningBanner}</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            INTERNAL INTELLIGENCE SYSTEM
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-royalemerald" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="py-2.5 text-xs font-bold shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addBtn}</span>
        </Button>
      </div>

      {/* Filters and Search panel */}
      <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 bg-alabaster border border-[#e5dfd4] rounded-xl text-xs text-charcoal font-semibold focus:outline-none focus:border-antiquegold transition-all"
          />
        </div>

        {/* Categories list */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
              activeCategory === 'all' 
                ? 'bg-royalemerald text-white' 
                : 'bg-alabaster text-charcoal hover:bg-[#edeae2]'
            }`}
          >
            All Competitors
          </button>
          {Object.keys(catT).map((catKey) => (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                activeCategory === catKey 
                  ? 'bg-royalemerald text-white' 
                  : 'bg-alabaster text-charcoal hover:bg-[#edeae2]'
              }`}
            >
              {catT[catKey as keyof typeof catT]}
            </button>
          ))}
        </div>
      </div>

      {/* Battlecards list layout */}
      {filteredCards.length === 0 ? (
        <Card className="p-12 text-center bg-white space-y-4">
          <AlertTriangle className="w-12 h-12 text-antiquegold mx-auto opacity-55" />
          <h3 className="font-serif text-base font-black text-charcoal">No competitors match query</h3>
          <p className="text-xs text-warmgray font-semibold max-w-sm mx-auto">
            Try adjusting search terms. Do not leak internal competitive analysis to public view.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredCards.map((card) => (
            <Card key={card.id} className="p-6 bg-white space-y-6 text-left border-t-4 border-t-antiquegold shadow-diffuse relative overflow-hidden">
              
              {/* Card top details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-black text-charcoal">{card.competitorName}</h3>
                    <span className="text-[8px] font-mono font-extrabold uppercase bg-antiquegold/10 text-antiquegold px-2 py-0.5 rounded">
                      {catT[card.category as keyof typeof catT]}
                    </span>
                  </div>
                  <p className="text-xs text-warmgray font-semibold mt-0.5">
                    {t.priceTier}: <strong className="text-charcoal font-semibold">{card.pricePositioningSummary}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[8px] font-mono text-warmgray uppercase block">{t.marketShare}</span>
                    <strong className="text-xs font-mono text-charcoal">{card.marketSharePercentage}% India Region</strong>
                  </div>

                  <div className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase border ${
                    card.reviewStatus === 'verified' 
                      ? 'bg-emerald-50 text-royalemerald border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                  }`}>
                    {card.reviewStatus === 'verified' ? t.verifiedBadge : t.staleBadge}
                  </div>
                </div>
              </div>

              {/* Side-by-side strengths, weaknesses, and differentiation details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Competitor strengths column */}
                <div className="space-y-3 p-4 bg-alabaster/40 rounded-xl border border-neutral-100">
                  <h4 className="text-[10px] font-mono text-warmgray uppercase font-black tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-royalemerald" />
                    <span>{t.competitorStrengths}</span>
                  </h4>
                  <ul className="space-y-2 text-xs font-semibold text-charcoal/90">
                    {card.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-royalemerald shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Competitor weaknesses column */}
                <div className="space-y-3 p-4 bg-alabaster/40 rounded-xl border border-neutral-100">
                  <h4 className="text-[10px] font-mono text-warmgray uppercase font-black tracking-wider flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-error" />
                    <span>{t.competitorWeaknesses}</span>
                  </h4>
                  <ul className="space-y-2 text-xs font-semibold text-charcoal/90">
                    {card.weaknesses.map((weak, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <X className="w-4 h-4 text-error shrink-0 mt-0.5" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AIEC differentiation edge column */}
                <div className="space-y-3 p-4 bg-emerald-50/10 rounded-xl border border-emerald-200/40">
                  <h4 className="text-[10px] font-mono text-royalemerald uppercase font-black tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-antiquegold" />
                    <span>{t.aiecAdvantage}</span>
                  </h4>
                  <ul className="space-y-2 text-xs font-semibold text-royalemerald font-medium">
                    {card.aiecDifferentiation.map((diff, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-antiquegold shrink-0 mt-0.5">★</span>
                        <span>{diff}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Card Footer review flag actions */}
              <div className="pt-4 border-t border-neutral-100 flex justify-between items-center text-[10px] text-warmgray">
                <span>{t.lastReviewed}: {card.lastReviewedDate}</span>

                <button
                  onClick={() => handleFlagStale(card.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-alabaster hover:bg-neutral-100 rounded-lg text-[9px] font-bold uppercase text-charcoal border border-neutral-200 cursor-pointer"
                >
                  <Flag className="w-3 h-3 text-amber-700" />
                  <span>{t.flagStaleBtn}</span>
                </button>
              </div>

            </Card>
          ))}
        </div>
      )}

      {/* Add Competitor Battlecard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg border border-antiquegold shadow-2xl space-y-4 text-left"
          >
            <div className="flex justify-between items-start pb-2 border-b border-border">
              <h3 className="font-serif text-base font-black text-charcoal">
                {t.addModalTitle}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-warmgray hover:text-charcoal font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBattlecard} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">Competitor Name</label>
                <input 
                  type="text"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  placeholder="e.g. Kone Elevators India"
                  className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl focus:outline-none focus:border-antiquegold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl focus:outline-none focus:border-antiquegold"
                >
                  <option value="mfg_giant">Global Manufacturing Giant</option>
                  <option value="local_aggregator">Local Aggregator / Fabricator</option>
                  <option value="boutique">Elite Boutique / Custom Designer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">Price Positioning Summary</label>
                <input 
                  type="text"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="e.g. ₹10L - ₹15L base installs with rigid masonry specs."
                  className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl focus:outline-none focus:border-antiquegold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">Strengths (one per line)</label>
                <textarea
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  placeholder="Strong physical manufacturing networks..."
                  rows={2}
                  className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">Weaknesses (one per line)</label>
                <textarea
                  value={newWeakness}
                  onChange={(e) => setNewWeakness(e.target.value)}
                  placeholder="Slow response cycles on custom cabin parts..."
                  rows={2}
                  className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">AIEC Core Advantage points (one per line)</label>
                <textarea
                  value={newAdvantage}
                  onChange={(e) => setNewAdvantage(e.target.value)}
                  placeholder="We deliver identical custom glass panel styles at 1/2 of their custom boutique cost..."
                  rows={2}
                  className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-alabaster hover:bg-[#edeae2] border border-[#e5dfd4] rounded-xl text-charcoal font-bold"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  <span>{t.saveProfileBtn}</span>
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
