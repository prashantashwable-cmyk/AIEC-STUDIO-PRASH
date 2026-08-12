import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShieldAlert, Clock, Award, HelpCircle, ChevronRight, 
  Plus, Edit, Trash2, CheckCircle, RefreshCw, Star, MapPin, 
  MessageSquare, ThumbsUp, AlertCircle, Sparkles, Send, Filter
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

interface ObjectionScript {
  id: string;
  category: 'safety' | 'brand_recognition' | 'timeline' | 'price' | 'disruption';
  title: string;
  objectionText: string;
  approvedResponse: string;
  effectivenessScore: number; // e.g. 87%
  lastUpdated: string;
  territoryPerformance: { [key: string]: number }; // e.g. { "Pune West": 92, "Mumbai South": 81 }
  version: number;
}

const initialObjections: ObjectionScript[] = [
  {
    id: "obj-1",
    category: "safety",
    title: "Brand Safety & Lesser Known Brand",
    objectionText: "AIEC isn't Otis or Schindler. How can I trust the safety of my family with a regional brand?",
    approvedResponse: "AIEC operates on an premium aggregator model which strictly implements BIS (Bureau of Indian Standards) IS-14665 codes. Every elevator component is sourced from certified tier-1 manufacturers with real-time IoT diagnostic relays. We back this with our Zero-Liability guarantee: if your elevator has unscheduled downtime exceeding 4 hours in the first 12 months, your maintenance for the next 3 years is completely free.",
    effectivenessScore: 94,
    lastUpdated: "2026-06-15",
    territoryPerformance: { "Pune West": 96, "Mumbai South": 92, "Nagpur Central": 94 },
    version: 3
  },
  {
    id: "obj-2",
    category: "disruption",
    title: "Installation Civil Disruption",
    objectionText: "Installing a home elevator will ruin my villa's marble flooring and make living here impossible during civil construction.",
    approvedResponse: "AIEC's advanced shaft pre-engineering eliminates major wet masonry. Our standard structural frames are self-supporting steel columns. Ground level preparation is completed in a single 4-hour slot with dry diamond-core drills to prevent dust spreading. We schedule the heavy shaft assembly on weekend daytime slots while offering a free premium weekend family stay at a nearby luxury resort during the active heavy assembly phase.",
    effectivenessScore: 89,
    lastUpdated: "2026-07-02",
    territoryPerformance: { "Pune West": 91, "Mumbai South": 87, "Nagpur Central": 88 },
    version: 2
  },
  {
    id: "obj-3",
    category: "timeline",
    title: "Fear of Infinite Project Delays",
    objectionText: "Other elevator installers take 6 months instead of the promised 6 weeks. How do I know AIEC is different?",
    approvedResponse: "Our entire supply chain runs on real-time container dispatch logs visible directly from your AIEC app. We pledge ₹5,000 credit penalty per day of delay beyond the locked contract handover date. We handle the structural surveyor, PWD lift license department, and power allocation ourselves so no red tape delays your project.",
    effectivenessScore: 91,
    lastUpdated: "2026-05-10",
    territoryPerformance: { "Pune West": 88, "Mumbai South": 93, "Nagpur Central": 92 },
    version: 4
  },
  {
    id: "obj-4",
    category: "price",
    title: "Comparison to Unorganized Local Assemblers",
    objectionText: "Local operators in Pune are offering to assemble a lift for ₹1.5 Lakhs cheaper than AIEC.",
    approvedResponse: "Local assemblers use unbranded, non-standard electronics without ARD (Automatic Rescue Device) backups, putting you at risk during power outages. AIEC lifts are fully certified under national standards and include our 24/7 automated IoT remote dispatch desk. Over 10 years, a local lift costs 40% more in maintenance; with AIEC, your high resale value is legally preserved on the blockchain-backed maintenance record.",
    effectivenessScore: 86,
    lastUpdated: "2026-07-10",
    territoryPerformance: { "Pune West": 85, "Mumbai South": 88, "Nagpur Central": 85 },
    version: 2
  }
];

const categoryLabels = {
  en: {
    safety: "Safety & Compliance",
    brand_recognition: "Brand Safety",
    timeline: "Timeline & Delays",
    price: "Price & Value",
    disruption: "Construction Disruption"
  },
  hi: {
    safety: "सुरक्षा और अनुपालन",
    brand_recognition: "ब्रांड सुरक्षा",
    timeline: "समय सीमा और देरी",
    price: "कीमत और मूल्य",
    disruption: "निर्माण व्यवधान"
  },
  mr: {
    safety: "सुरक्षा आणि कायदेशीर नियम",
    brand_recognition: "ब्रँड सुरक्षा",
    timeline: "वेळ आणि विलंब",
    price: "किंमत आणि मूल्य",
    disruption: "कामकाजातील अडथळे"
  }
};

const localizations = {
  en: {
    title: "Customer Objection Handling Scripts",
    subtitle: "Quick-reference approved talking points and objection-handling scripts for human sales and bot negotiators.",
    searchPlaceholder: "Search objections by keywords or category...",
    effectiveness: "Success Rate",
    lastUpdated: "Last Reviewed",
    categoryLabel: "Objection Category",
    approvedScript: "Approved Response Script (Fact-Grounded)",
    territoryPerf: "Regional Effectiveness Performance",
    suggestBtn: "Suggest New Script Entry",
    addModalTitle: "Propose New Objection Script",
    objectionTextLabel: "Detected Objection Pattern",
    approvedResponseLabel: "Proposed Approved Script",
    saveBtn: "Commit Proposed Script",
    syncSuccess: "Objection-handling library updated and synced with AI Auto-Negotiator bot logic.",
    emptyTitle: "No scripts found",
    emptyDesc: "Try adjusting your search keywords or filter settings.",
    versionLabel: "Script Version"
  },
  hi: {
    title: "ग्राहक आपत्ति निवारण स्क्रिप्ट",
    subtitle: "मानव बिक्री और बॉट वार्ताकारों के लिए स्वीकृत बातचीत बिंदु और आपत्ति-निवारण स्क्रिप्ट पुस्तकालय।",
    searchPlaceholder: "कीवर्ड या श्रेणी द्वारा आपत्ति खोजें...",
    effectiveness: "सफलता दर",
    lastUpdated: "अंतिम समीक्षा",
    categoryLabel: "आपत्ति श्रेणी",
    approvedScript: "स्वीकृत प्रतिक्रिया स्क्रिप्ट (तथ्य-आधारित)",
    territoryPerf: "क्षेत्रीय प्रभावशीलता प्रदर्शन",
    suggestBtn: "नई स्क्रिप्ट का सुझाव दें",
    addModalTitle: "नई आपत्ति स्क्रिप्ट का प्रस्ताव करें",
    objectionTextLabel: "पहचाना गया आपत्ति पैटर्न",
    approvedResponseLabel: "प्रस्तावित स्वीकृत स्क्रिप्ट",
    saveBtn: "प्रस्तावित स्क्रिप्ट सहेजें",
    syncSuccess: "आपत्ति-निवारण पुस्तकालय अद्यतन और एआई ऑटो-नेगोशिएटर बॉट लॉजिक के साथ सिंक किया गया।",
    emptyTitle: "कोई स्क्रिप्ट नहीं मिली",
    emptyDesc: "अपने खोज कीवर्ड या फ़िल्टर सेटिंग्स को समायोजित करने का प्रयास करें।",
    versionLabel: "स्क्रिप्ट संस्करण"
  },
  mr: {
    title: "ग्राहक आक्षेप निवारण स्क्रिप्ट",
    subtitle: "सेल्स प्रतिनिधी आणि ऑटो-नेगोशिएटर बॉटसाठी मान्यताप्राप्त संभाषण स्क्रिप्ट्स.",
    searchPlaceholder: "आक्षेप आणि कॅटेगरीनुसार शोधा...",
    effectiveness: "यशस्वी दर",
    lastUpdated: "अंतिम पडताळणी",
    categoryLabel: "आक्षेप प्रकार",
    approvedScript: "मान्यताप्राप्त आक्षेप निवारण स्क्रिप्ट (सत्यता पडताळणीसह)",
    territoryPerf: "क्षेत्रीय यश आणि परिणामकारकता",
    suggestBtn: "नवीन स्क्रिप्ट सुचवा",
    addModalTitle: "नवीन आक्षेप सुचवा",
    objectionTextLabel: "ग्राहक आक्षेप नमुना",
    approvedResponseLabel: "प्रस्तावित आक्षेप निवारण उत्तर",
    saveBtn: "नवीन आक्षेप समाविष्ट करा",
    syncSuccess: "आक्षेप निवारण लायब्ररी यशस्वीरीत्या अपडेट करून ऑटो-नेगोशिएटर बॉट सोबत जोडली गेली आहे.",
    emptyTitle: "आक्षेप आढळले नाहीत",
    emptyDesc: "कृपया तुमचे शोध पर्याय बदला.",
    versionLabel: "आवृत्ती"
  }
};

export const CustomerObjectionHandling: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [objections, setObjections] = useState<ObjectionScript[]>(initialObjections);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form states for adding new objection proposal
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'safety' | 'brand_recognition' | 'timeline' | 'price' | 'disruption'>('safety');
  const [newObjection, setNewObjection] = useState('');
  const [newResponse, setNewResponse] = useState('');

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

  // Filter objects based on search and active category
  const filteredObjections = useMemo(() => {
    return objections.filter(obj => {
      const matchesCategory = activeCategory === 'all' || obj.category === activeCategory;
      const matchesSearch = 
        obj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.objectionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.approvedResponse.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [objections, activeCategory, searchQuery]);

  const handleCreateObjection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newObjection || !newResponse) {
      triggerToast("Please fill all mandatory fields.");
      return;
    }

    const script: ObjectionScript = {
      id: `obj-${Date.now()}`,
      category: newCategory,
      title: newTitle,
      objectionText: newObjection,
      approvedResponse: newResponse,
      effectivenessScore: 85, // start default
      lastUpdated: new Date().toISOString().split('T')[0],
      territoryPerformance: { "Pune West": 85, "Mumbai South": 82 },
      version: 1
    };

    setObjections([script, ...objections]);
    setShowAddModal(false);
    
    // Clear inputs
    setNewTitle('');
    setNewObjection('');
    setNewResponse('');

    triggerToast(t.syncSuccess);
  };

  const handleIncrementEffectiveness = (id: string) => {
    setObjections(prev => prev.map(obj => {
      if (obj.id === id) {
        const nextScore = Math.min(obj.effectivenessScore + 1, 100);
        triggerToast(`Effectiveness score up-voted to ${nextScore}%`);
        return { ...obj, effectivenessScore: nextScore };
      }
      return obj;
    }));
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
            <CheckCircle className="w-4 h-4 text-white" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Module 8: Negotiation Scripting (Screen 8 of 10)</span>
            <span>80.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '80%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 78 of 200)</span>
            <span>39.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '39%' }} />
          </div>
        </div>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            INTERNAL SALES ENABLEMENT • OBJECTION ENGINE
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1 flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-antiquegold" />
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
          <span>{t.suggestBtn}</span>
        </Button>
      </div>

      {/* Sticky search/filter bar pinned above */}
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

        {/* Categories filters list */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
              activeCategory === 'all' 
                ? 'bg-royalemerald text-white' 
                : 'bg-alabaster text-charcoal hover:bg-[#edeae2]'
            }`}
          >
            All Categories
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

      {/* Main objections list view */}
      {filteredObjections.length === 0 ? (
        <Card className="p-12 text-center bg-white space-y-4">
          <AlertCircle className="w-12 h-12 text-antiquegold mx-auto opacity-55" />
          <h3 className="font-serif text-base font-black text-charcoal">{t.emptyTitle}</h3>
          <p className="text-xs text-warmgray font-semibold max-w-sm mx-auto">
            {t.emptyDesc}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="mx-auto text-xs"
          >
            Clear Search Filter
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredObjections.map((obj) => (
            <Card key={obj.id} className="p-6 bg-white space-y-4 text-left border-l-4 border-l-royalemerald shadow-diffuse relative overflow-hidden flex flex-col justify-between">
              
              <div className="space-y-3.5">
                {/* Heading tag block */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[8px] font-mono font-extrabold uppercase bg-royalemerald/10 text-royalemerald px-2 py-0.5 rounded mr-2">
                      {catT[obj.category as keyof typeof catT]}
                    </span>
                    <span className="text-[8px] font-mono font-extrabold uppercase bg-antiquegold/10 text-antiquegold px-2 py-0.5 rounded">
                      {t.versionLabel}: v{obj.version}
                    </span>
                  </div>
                  
                  {/* Performance metric badge */}
                  <div className="flex items-center gap-1 bg-alabaster px-2 py-0.5 rounded-lg border border-neutral-200 font-mono text-[10px] text-charcoal font-bold">
                    <Star className="w-3 h-3 text-antiquegold fill-antiquegold" />
                    <span>{obj.effectivenessScore}% Success</span>
                  </div>
                </div>

                <h3 className="font-serif text-sm font-black text-charcoal tracking-tight">
                  {obj.title}
                </h3>

                {/* Objection voice quote */}
                <div className="p-3 bg-red-50/20 border-l-2 border-l-error text-xs italic text-charcoal/80 font-medium">
                  "{obj.objectionText}"
                </div>

                {/* Approved fact-grounded response speech */}
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-warmgray uppercase block font-bold">
                    {t.approvedScript}
                  </span>
                  <div className="p-3.5 bg-alabaster rounded-xl border border-border text-xs leading-relaxed text-charcoal font-semibold">
                    {obj.approvedResponse}
                  </div>
                </div>

                {/* Regional performance stats */}
                <div className="pt-2 border-t border-dashed border-[#e5dfd4]">
                  <span className="text-[8px] font-mono text-warmgray uppercase block font-bold mb-1.5">
                    {t.territoryPerf}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(obj.territoryPerformance).map(([region, score]) => (
                      <div key={region} className="bg-alabaster/50 p-2 rounded-lg border border-neutral-100 text-[10px] leading-tight">
                        <span className="text-warmgray block truncate font-bold">{region}</span>
                        <strong className="text-royalemerald font-mono font-bold">{score}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer interaction tools */}
              <div className="pt-4 border-t border-neutral-100 flex justify-between items-center mt-3">
                <span className="text-[8px] font-mono text-warmgray">Last updated: {obj.lastUpdated}</span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleIncrementEffectiveness(obj.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-royalemerald/10 text-royalemerald hover:bg-royalemerald hover:text-white rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Upvote Script</span>
                  </button>
                </div>
              </div>

            </Card>
          ))}
        </div>
      )}

      {/* Add suggestion dialog popup */}
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

            <form onSubmit={handleCreateObjection} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">Script Headline Title</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. BIS Compliance Proof for Custom Elevators"
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
                  <option value="safety">Safety & Compliance</option>
                  <option value="brand_recognition">Brand Safety / Trust</option>
                  <option value="timeline">Timeline & Delays</option>
                  <option value="price">Price & Value Competition</option>
                  <option value="disruption">Construction Disruption</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">{t.objectionTextLabel}</label>
                <textarea
                  value={newObjection}
                  onChange={(e) => setNewObjection(e.target.value)}
                  placeholder="Enter the typical customer concern quote exactly..."
                  rows={2}
                  className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl focus:outline-none focus:border-antiquegold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">{t.approvedResponseLabel}</label>
                <textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Write the approved response based on AIEC core values and standards..."
                  rows={4}
                  className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl focus:outline-none focus:border-antiquegold"
                  required
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
                  <span>{t.saveBtn}</span>
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
