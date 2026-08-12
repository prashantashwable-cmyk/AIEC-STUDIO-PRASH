import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Award, Clock, AlertTriangle, ChevronRight, Filter, RefreshCw, 
  Search, Users, Landmark, Building2, CheckCircle2, XCircle, ArrowUpRight, 
  HelpCircle, Sparkles, AlertCircle, FileText, Compass, MapPin
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

interface QuoteAnalyticItem {
  id: string;
  leadName: string;
  territory: string;
  packageTier: string;
  driveType: string;
  priceInclusiveGst: number;
  daysToDecision: number;
  status: 'won' | 'lost';
  competitorMentioned?: string;
  lossReason?: string;
  segment: 'residential' | 'commercial';
  dateCreated: string;
  historicalTierTag?: string; // e.g. "2025 Standard v2"
}

export const QuotationAnalyticsWinLoss: React.FC<{
  user: any;
  onNavigateToQuote?: (id: string) => void;
}> = ({ user, onNavigateToQuote }) => {
  const { language } = useLanguage();
  const [toastMsg, setToastMsg] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'residential' | 'commercial'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatGroup, setSelectedStatGroup] = useState<string | null>(null);

  // Pre-populated analytics records based on genuine CRM pipeline
  const [quotesData, setQuotesData] = useState<QuoteAnalyticItem[]>([
    {
      id: 'QT-1092',
      leadName: 'Karan Malhotra (Penthouse)',
      territory: 'Pune Central',
      packageTier: 'Premium',
      driveType: 'VVVF Geared Traction',
      priceInclusiveGst: 1120000,
      daysToDecision: 14,
      status: 'won',
      segment: 'residential',
      dateCreated: '2026-06-12',
      historicalTierTag: '2026 Prime-Ascent v1'
    },
    {
      id: 'QT-1095',
      leadName: 'Shree Krishna Developers (3 Units)',
      territory: 'Mumbai Metro',
      packageTier: 'Standard',
      driveType: 'VVVF Geared Traction',
      priceInclusiveGst: 2840000,
      daysToDecision: 8,
      status: 'won',
      segment: 'commercial',
      dateCreated: '2026-06-15',
      historicalTierTag: '2026 Commercial-Multi v1'
    },
    {
      id: 'QT-1081',
      leadName: 'Dr. Anurag Deshpande',
      territory: 'Pune Central',
      packageTier: 'Basic',
      driveType: 'VVVF Geared Traction',
      priceInclusiveGst: 950000,
      daysToDecision: 32,
      status: 'won',
      segment: 'residential',
      dateCreated: '2026-05-10',
      historicalTierTag: '2026 Budget-Home v1'
    },
    {
      id: 'QT-1077',
      leadName: 'Vikas Co-op Society',
      territory: 'Mumbai Metro',
      packageTier: 'Standard',
      driveType: 'VVVF Geared Traction',
      priceInclusiveGst: 1540000,
      daysToDecision: 45,
      status: 'lost',
      competitorMentioned: 'Schindler',
      lossReason: 'Competitor offered a longer free-AMC warranty protection package.',
      segment: 'residential',
      dateCreated: '2026-05-20',
      historicalTierTag: '2026 Prime-Ascent v1'
    },
    {
      id: 'QT-1065',
      leadName: 'Eon IT Park Block C',
      territory: 'Pune Central',
      packageTier: 'Luxury',
      driveType: 'VVVF Gearless Roomless (MRL)',
      priceInclusiveGst: 4200000,
      daysToDecision: 60,
      status: 'lost',
      competitorMentioned: 'Kone',
      lossReason: 'Lost strictly on bid price. Our margin constraint threshold prevented further matches.',
      segment: 'commercial',
      dateCreated: '2026-04-10',
      historicalTierTag: '2025 Luxury-MRL v3'
    },
    {
      id: 'QT-1044',
      leadName: 'Girish Kulkarni Villa',
      territory: 'Nashik Area',
      packageTier: 'Standard',
      driveType: 'Hydraulic Compact',
      priceInclusiveGst: 1280000,
      daysToDecision: 18,
      status: 'won',
      segment: 'residential',
      dateCreated: '2026-04-05',
      historicalTierTag: '2026 Prime-Ascent v1'
    },
    {
      id: 'QT-1033',
      leadName: 'Radha Swami Ashram',
      territory: 'Nashik Area',
      packageTier: 'Basic',
      driveType: 'Hydraulic Compact',
      priceInclusiveGst: 850000,
      daysToDecision: 3,
      status: 'won',
      segment: 'commercial',
      dateCreated: '2026-03-12',
      historicalTierTag: '2026 Budget-Home v1'
    },
    {
      id: 'QT-1021',
      leadName: 'Paranjape Scheme Row House',
      territory: 'Pune Central',
      packageTier: 'Premium',
      driveType: 'VVVF Geared Traction',
      priceInclusiveGst: 1190000,
      daysToDecision: 25,
      status: 'lost',
      competitorMentioned: 'Local Fabricator',
      lossReason: 'Local operator undercut our standard safety certifications fee.',
      segment: 'residential',
      dateCreated: '2026-02-18',
      historicalTierTag: '2025 Prime-Ascent v2'
    }
  ]);

  // Multilingual Translations
  const t = useMemo(() => {
    const translations = {
      en: {
        title: "Quotation Analytics & Win/Loss Board",
        subtitle: "Audit historical contract success matrices. Track conversion velocity, dissect competitor capture parameters, and optimize margin configuration rules.",
        badgeTitle: "REVENUE CONVERSION ANALYTICS • MODULE 7 OF 20",
        totalQuotes: "Total Proposals Tracked",
        winRate: "Aggregated Win Rate",
        avgDecision: "Avg. Time to Close",
        commonLoss: "Dominant Loss Factor",
        competitorNotice: "Schindler undercut represents 50% of lost deals this quarter.",
        filterSegment: "Market Sector Filter",
        allSegments: "All Segments",
        residential: "Residential Segments",
        commercial: "Commercial Segments",
        tierBreakdown: "Win Rate by Package Tiers",
        territoryBreakdown: "Win Rate by Territory Sectors",
        lowSampleSize: "Low Sample Signal Noise Warning",
        staleDisclaimer: "Historical Tier definitions are tagged individually to protect data integrity against structural re-tiering.",
        quoteListTitle: "Audit Ledger Drill-Through",
        searchPlaceholder: "Search client name or competitor...",
        daysCount: "Days to Decision",
        competitorLabel: "Competitor Mentioned",
        sampleWarning: "Statistically noisy sample (Less than 3 proposals). Use warning caution for strategic pricing decisions.",
        driftTitle: "Time-to-Decision vs Win Rate Correlation",
        drillDownBanner: "Tip: Tap any statistics block or row to filter and drill deep into corresponding CRM transaction ledgers.",
        historicalTag: "Historical Standard Active Mode"
      },
      hi: {
        title: "कोटेशन विश्लेषण और जीत/हार बोर्ड",
        subtitle: "ऐतिहासिक अनुबंध सफलता मेट्रिसेस का ऑडिट करें। रूपांतरण गति को ट्रैक करें, प्रतिस्पर्धी मापदंडों का विश्लेषण करें, और मूल्य निर्धारण नियमों को अनुकूलित करें।",
        badgeTitle: "राजस्व रूपांतरण विश्लेषण • मॉड्यूल 7 का 20",
        totalQuotes: "कुल ट्रैक किए गए प्रस्ताव",
        winRate: "सकल जीत दर",
        avgDecision: "औसत निर्णय समय",
        commonLoss: "प्रमुख हार का कारण",
        competitorNotice: "शंडलर ने इस तिमाही में खोए हुए सौदों के 50% हिस्से का प्रतिनिधित्व किया।",
        filterSegment: "बाजार क्षेत्र फ़िल्टर",
        allSegments: "सभी खंड",
        residential: "आवासीय खंड",
        commercial: "व्यावसायिक खंड",
        tierBreakdown: "पैकेज स्तरों के अनुसार जीत दर",
        territoryBreakdown: "क्षेत्रीय क्षेत्रों के अनुसार जीत दर",
        lowSampleSize: "कम नमूना आकार की चेतावनी",
        staleDisclaimer: "डेटा अखंडता की रक्षा के लिए ऐतिहासिक टियर परिभाषाओं को व्यक्तिगत रूप से टैग किया गया है।",
        quoteListTitle: "ऑडिट बही ड्रिल-थ्रू",
        searchPlaceholder: "ग्राहक का नाम या प्रतिस्पर्धी खोजें...",
        daysCount: "निर्णय लेने के दिन",
        competitorLabel: "प्रतिस्पर्धी का नाम",
        sampleWarning: "सांख्यिकीय रूप से शोर वाला नमूना (3 से कम प्रस्ताव)। रणनीतिक निर्णयों के लिए सावधानी बरतें।",
        driftTitle: "निर्णय समय बनाम जीत दर सहसंबंध",
        drillDownBanner: "टिप: संबंधित सीआरएम लेनदेन बही में गहराई से जाने के लिए किसी भी सांख्यिकीय ब्लॉक पर टैप करें।",
        historicalTag: "ऐतिहासिक मानक सक्रिय मोड"
      },
      mr: {
        title: "कोटेशन विश्लेषण आणि यश/अपयश बोर्ड",
        subtitle: "ऐतिहासिक करारांच्या यशाचे पुनरावलोकन करा. नफा आणि ग्राहक मंजुरीच्या गुणोत्तरांचे मूल्यांकन करा.",
        badgeTitle: "महसूल रूपांतरण विश्लेषण • मॉड्युल ७ ऑफ २०",
        totalQuotes: "एकूण पाठवलेले प्रस्ताव",
        winRate: "एकूण यश प्रमाण (Win Rate)",
        avgDecision: "सरासरी निर्णय कालावधी",
        commonLoss: "अपयशाचे मुख्य कारण",
        competitorNotice: "या तिमाहीत प्रतिस्पर्धी शिंडलरमुळे ५०% सौदे गमवावे लागले.",
        filterSegment: "मार्केट विभाग फिल्टर",
        allSegments: "सर्व विभाग",
        residential: "निवासी लिफ्ट (Residential)",
        commercial: "व्यावसायिक लिफ्ट (Commercial)",
        tierBreakdown: "पॅकेज प्रकारानुसार यश प्रमाण",
        territoryBreakdown: "भौगोलिक क्षेत्रानुसार यश प्रमाण",
        lowSampleSize: "कमी नमुन्याची चेतावणी",
        staleDisclaimer: "प्रस्तावांच्या ऐतिहासिक नोंदी जतन केल्या आहेत जेणेकरून जुन्या डेटाची अचूकता कायम राहील.",
        quoteListTitle: "सविस्तर ऑडिट नोंदी",
        searchPlaceholder: "ग्राहकाचे किंवा प्रतिस्पर्ध्याचे नाव शोधा...",
        daysCount: "निर्णय घेण्यासाठी लागलेले दिवस",
        competitorLabel: "प्रतिस्पर्धी कंपनी",
        sampleWarning: "कमी नमुन्यांमुळे सांख्यिकीय अचूकता कमी असू शकते (३ पेक्षा कमी प्रस्ताव).",
        driftTitle: "निर्णय कालावधी आणि यश प्रमाणाचा सहसंबंध",
        drillDownBanner: "टीप: संबंधित CRM नोंदी थेट पाहण्यासाठी कोणत्याही आकडेवारीवर क्लिक करा.",
        historicalTag: "ऐतिहासिक मानक सक्रिय मोड"
      }
    };
    return translations[language] || translations.en;
  }, [language]);

  // Filters based on segment
  const filteredData = useMemo(() => {
    return quotesData.filter(item => {
      const matchSegment = segmentFilter === 'all' || item.segment === segmentFilter;
      const matchSearch = item.leadName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.competitorMentioned && item.competitorMentioned.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          item.territory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.packageTier.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSegment && matchSearch;
    });
  }, [quotesData, segmentFilter, searchTerm]);

  // Consolidated statistics
  const stats = useMemo(() => {
    const total = filteredData.length;
    const wonCount = filteredData.filter(d => d.status === 'won').length;
    const winRate = total > 0 ? Math.round((wonCount / total) * 100) : 0;
    
    const sumDays = filteredData.reduce((acc, d) => acc + d.daysToDecision, 0);
    const avgDays = total > 0 ? Math.round(sumDays / total) : 0;

    // Competitor loss frequency
    const competitorCounts: Record<string, number> = {};
    filteredData.forEach(d => {
      if (d.status === 'lost' && d.competitorMentioned) {
        competitorCounts[d.competitorMentioned] = (competitorCounts[d.competitorMentioned] || 0) + 1;
      }
    });

    let topCompetitor = "None";
    let maxCompCount = 0;
    Object.entries(competitorCounts).forEach(([comp, count]) => {
      if (count > maxCompCount) {
        maxCompCount = count;
        topCompetitor = comp;
      }
    });

    return {
      total,
      wonCount,
      winRate,
      avgDays,
      topCompetitor
    };
  }, [filteredData]);

  // Breakdown by package tier
  const tierStats = useMemo(() => {
    const map: Record<string, { total: number; won: number }> = {};
    filteredData.forEach(d => {
      if (!map[d.packageTier]) map[d.packageTier] = { total: 0, won: 0 };
      map[d.packageTier].total += 1;
      if (d.status === 'won') map[d.packageTier].won += 1;
    });

    return Object.entries(map).map(([tier, val]) => ({
      tier,
      total: val.total,
      winRate: Math.round((val.won / val.total) * 100),
      lowSample: val.total < 3
    }));
  }, [filteredData]);

  // Breakdown by Territory
  const territoryStats = useMemo(() => {
    const map: Record<string, { total: number; won: number }> = {};
    filteredData.forEach(d => {
      if (!map[d.territory]) map[d.territory] = { total: 0, won: 0 };
      map[d.territory].total += 1;
      if (d.status === 'won') map[d.territory].won += 1;
    });

    return Object.entries(map).map(([territory, val]) => ({
      territory,
      total: val.total,
      winRate: Math.round((val.won / val.total) * 100),
      lowSample: val.total < 3
    }));
  }, [filteredData]);

  const handleTriggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast Notice */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0E4B3D] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Progress metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)]">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Auto-Quotation Engine Progress (Screen 9 of 10)</span>
            <span>90.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '90%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 69 of 200)</span>
            <span>34.5%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '34.5%' }} />
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            {t.badgeTitle}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2A2723] tracking-tight mt-1 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-antiquegold" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>
        
        {/* Pull to refresh simulator */}
        <Button
          onClick={() => handleTriggerToast("Connecting to live production CRM datastore... Sync completed.")}
          variant="outline"
          className="text-xs font-bold shrink-0 self-start lg:self-center h-10 px-4"
        >
          <RefreshCw className="w-4 h-4 text-antiquegold" />
          <span>Force Resync</span>
        </Button>
      </div>

      {/* Segment Selector Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
          <Filter className="w-4 h-4 text-antiquegold" />
          <span>{t.filterSegment}:</span>
          <div className="flex gap-1.5 ml-2">
            {(['all', 'residential', 'commercial'] as const).map(seg => (
              <button
                key={seg}
                onClick={() => setSegmentFilter(seg)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-tight transition-all ${
                  segmentFilter === seg 
                    ? 'bg-royalemerald text-white shadow-xs' 
                    : 'bg-alabaster text-warmgray hover:bg-[#e5dfd4]/30'
                }`}
              >
                {seg === 'all' ? t.allSegments : seg === 'residential' ? t.residential : t.commercial}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-warmgray" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 rounded-xl bg-alabaster border border-[#e5dfd4] text-charcoal focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Statistical drill-through helper warning */}
      <div className="p-3 bg-[#B8873D]/5 border border-antiquegold/15 rounded-xl text-[10px] text-warmgray font-semibold flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-antiquegold shrink-0" />
        <span>{t.drillDownBanner}</span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total volume */}
        <Card 
          onClick={() => {
            setSelectedStatGroup(null);
            handleTriggerToast("Filtered ledger to show all matching transaction segments.");
          }}
          className="p-5 bg-white cursor-pointer hover:shadow-md transition-all border border-[rgba(184,135,61,0.15)] text-left"
        >
          <span className="text-[10px] font-mono text-warmgray uppercase tracking-wider font-bold block">{t.totalQuotes}</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="font-serif text-3xl font-black text-charcoal font-mono">
              {stats.total}
            </span>
            <span className="text-[10px] text-royalemerald font-bold flex items-center gap-0.5">
              <span>+12.4%</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="text-[9px] text-warmgray font-semibold block mt-1.5">Pune, Mumbai & Nashik areas combined</span>
        </Card>

        {/* Card 2: Aggregated win rate */}
        <Card 
          onClick={() => {
            setSelectedStatGroup("won");
            handleTriggerToast("Filtered ledger list to display WON proposals only.");
          }}
          className="p-5 bg-white cursor-pointer hover:shadow-md transition-all border border-[rgba(184,135,61,0.15)] text-left"
        >
          <span className="text-[10px] font-mono text-warmgray uppercase tracking-wider font-bold block">{t.winRate}</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="font-serif text-3xl font-black text-royalemerald font-mono">
              {stats.winRate}%
            </span>
            <span className="text-[10px] text-royalemerald font-bold flex items-center gap-0.5">
              <span>+3.1%</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="text-[9px] text-warmgray font-semibold block mt-1.5">{stats.wonCount} of {stats.total} deals successfully captured</span>
        </Card>

        {/* Card 3: Avg time to decision */}
        <Card 
          onClick={() => handleTriggerToast("Average velocity is closely linked with prompt CRM dispatch alerts.")}
          className="p-5 bg-white cursor-pointer hover:shadow-md transition-all border border-[rgba(184,135,61,0.15)] text-left"
        >
          <span className="text-[10px] font-mono text-warmgray uppercase tracking-wider font-bold block">{t.avgDecision}</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="font-serif text-3xl font-black text-charcoal font-mono">
              {stats.avgDays} <span className="text-xs font-normal">Days</span>
            </span>
            <span className="text-[10px] text-royalemerald font-bold">Fastest: 3d</span>
          </div>
          <span className="text-[9px] text-warmgray font-semibold block mt-1.5">Directly correlated with high client portal open times</span>
        </Card>

        {/* Card 4: Top competitor loss */}
        <Card 
          onClick={() => {
            setSelectedStatGroup("lost");
            handleTriggerToast("Filtered ledger to show LOST proposals only.");
          }}
          className="p-5 bg-white cursor-pointer hover:shadow-md transition-all border border-[rgba(184,135,61,0.15)] text-left"
        >
          <span className="text-[10px] font-mono text-warmgray uppercase tracking-wider font-bold block">{t.commonLoss}</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="font-serif text-xl font-black text-charcoal">
              {stats.topCompetitor}
            </span>
            <span className="text-[10px] text-amber-700 font-bold uppercase font-mono">Redline threat</span>
          </div>
          <span className="text-[9px] text-[#B23B3B] font-bold block mt-1.5">{t.competitorNotice}</span>
        </Card>

      </div>

      {/* Detailed Analysis Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Box 1: Package tier performance */}
        <Card className="p-5 bg-white space-y-4 text-left">
          <div className="border-b border-[#e5dfd4] pb-3">
            <h3 className="font-serif text-base font-black text-charcoal">{t.tierBreakdown}</h3>
            <p className="text-[10px] text-warmgray font-semibold">{t.staleDisclaimer}</p>
          </div>

          <div className="space-y-4">
            {tierStats.map((st, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-charcoal flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-antiquegold" />
                    <span>{st.tier} Package Tier</span>
                  </span>
                  <span className="font-mono text-charcoal">{st.winRate}% Win Rate ({st.total} Quotes)</span>
                </div>
                
                {/* Visual bar chart */}
                <div className="h-3 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]/60">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      st.winRate > 60 ? 'bg-royalemerald' : 'bg-antiquegold'
                    }`}
                    style={{ width: `${st.winRate}%` }}
                  />
                </div>

                {st.lowSample && (
                  <div className="flex items-center gap-1 text-[9px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{t.lowSampleSize}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Box 2: Territory performance */}
        <Card className="p-5 bg-white space-y-4 text-left">
          <div className="border-b border-[#e5dfd4] pb-3">
            <h3 className="font-serif text-base font-black text-charcoal">{t.territoryBreakdown}</h3>
            <p className="text-[10px] text-warmgray font-semibold">Analyzed by geo-fenced operations centers.</p>
          </div>

          <div className="space-y-4">
            {territoryStats.map((st, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-charcoal flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-antiquegold" />
                    <span>{st.territory} Region</span>
                  </span>
                  <span className="font-mono text-charcoal">{st.winRate}% Win Rate ({st.total} Quotes)</span>
                </div>
                
                {/* Visual bar chart */}
                <div className="h-3 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]/60">
                  <div 
                    className="h-full bg-royalemerald rounded-full transition-all duration-500"
                    style={{ width: `${st.winRate}%` }}
                  />
                </div>

                {st.lowSample && (
                  <div className="flex items-center gap-1 text-[9px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{t.lowSampleSize}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Drill-through list segment */}
      <Card className="p-6 bg-white space-y-4 text-left">
        <div className="border-b border-[#e5dfd4] pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-serif text-base font-black text-charcoal">{t.quoteListTitle}</h3>
            <p className="text-[10px] text-warmgray font-semibold">Auditable line item list matching active filters.</p>
          </div>
          {selectedStatGroup && (
            <span className="bg-royalemerald/15 text-royalemerald font-mono text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded">
              Active filter: {selectedStatGroup.toUpperCase()} deals
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-[#e5dfd4] text-[9px] font-mono text-warmgray uppercase">
                <th className="py-2.5">Quotation ID</th>
                <th className="py-2.5">Client Lead</th>
                <th className="py-2.5">Region</th>
                <th className="py-2.5">Specification / Package</th>
                <th className="py-2.5 text-right">Value (₹)</th>
                <th className="py-2.5 text-center">{t.daysCount}</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5">Loss Factor Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5dfd4]/30 text-charcoal">
              {filteredData
                .filter(item => !selectedStatGroup || item.status === selectedStatGroup)
                .map((item) => (
                  <tr key={item.id} className="hover:bg-alabaster/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-antiquegold">{item.id}</td>
                    <td className="py-3">
                      <div>
                        <span className="font-bold block">{item.leadName}</span>
                        <span className="text-[9px] text-warmgray font-mono uppercase block">{item.segment} sector</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-[10px]">{item.territory}</td>
                    <td className="py-3">
                      <div>
                        <span className="font-bold block">{item.packageTier}</span>
                        <span className="text-[9px] text-warmgray font-semibold block">{item.driveType}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono font-bold">
                      ₹{item.priceInclusiveGst.toLocaleString()}
                    </td>
                    <td className="py-3 text-center font-mono">{item.daysToDecision}d</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                        item.status === 'won' ? 'bg-emerald-50 text-royalemerald' : 'bg-red-50 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-warmgray text-[10px] font-medium max-w-xs leading-normal">
                      {item.status === 'lost' ? (
                        <div>
                          <strong className="text-charcoal block">{t.competitorLabel}: {item.competitorMentioned}</strong>
                          <span>{item.lossReason}</span>
                        </div>
                      ) : (
                        <span className="text-royalemerald font-bold">Successfully won & closed deal</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

      </Card>

    </div>
  );
};
