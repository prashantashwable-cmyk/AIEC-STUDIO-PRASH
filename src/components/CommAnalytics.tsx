import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Clock, ShieldAlert, Zap, 
  MessageSquare, Phone, Send, Info, Award, Calendar, 
  DollarSign, RefreshCw, Layers, CheckCircle2, AlertTriangle, ArrowRight, Sparkles
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

interface TemplatePerformance {
  id: string;
  name: string;
  channel: 'sms' | 'whatsapp' | 'call';
  sent: number;
  opened: number;
  replied: number;
  conversionInfluence: number; // calculated percentage score
  status: 'mature' | 'early_data';
}

export const CommAnalytics: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<'7d' | '30d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('overall');

  // Multi-language translation support
  const t = useMemo(() => {
    const localizations = {
      en: {
        title: "Communication Analytics Dashboard",
        subtitle: "Enterprise performance cockpit. Audit open rates, customer conversion influence, transactional vs. promotional costs, and SLA response rates.",
        overallSla: "SLA Response Compliance",
        overallSlaDesc: "Percentage of customer replies addressed within the target 15-minute window.",
        channelPerf: "Channel Cost & Delivery Summary",
        bestPerformer: "Top Performing Templates",
        worstPerformer: "Templates Requiring Review",
        bestDesc: "High response & conversion. Retain and scale.",
        worstDesc: "Underperforming. Consider revising or retiring.",
        volumeTrend: "Message Volume Trend & Outage Log",
        earlyDataBadge: "Early Data",
        matureBadge: "Mature Stat",
        averageLabel: "Average Rate",
        medianLabel: "Median Rate",
        outageWarning: "WhatsApp API Gateway outage on July 10th (3 hours) has been annotated on trend line.",
        refreshBtn: "Pull to Refresh",
        outlierNotice: "Outlier Detected: Rule #1 campaign exhibits skewed high performance (Median shown to preserve statistical clarity).",
        influenceScore: "Conversion Influence Score",
        whatsappLabel: "WhatsApp Business",
        smsLabel: "SMS Gateway",
        voiceLabel: "IVR Auto-Dialer"
      },
      hi: {
        title: "संचार विश्लेषण डैशबोर्ड",
        subtitle: "एंटरप्राइज प्रदर्शन कॉकपिट। ओपन दरें, ग्राहक रूपांतरण प्रभाव, लेनदेन संबंधी बनाम प्रचारक लागत, और एसएलए प्रतिक्रिया दरों का ऑडिट करें।",
        overallSla: "SLA प्रतिक्रिया अनुपालन",
        overallSlaDesc: "लक्षित 15-मिनट की खिड़की के भीतर दिए गए ग्राहक प्रतिक्रियाओं का प्रतिशत।",
        channelPerf: "चैनल लागत और वितरण सारांश",
        bestPerformer: "सर्वश्रेष्ठ प्रदर्शन करने वाले टेम्पलेट",
        worstPerformer: "समीक्षा की आवश्यकता वाले टेम्पलेट",
        bestDesc: "उच्च प्रतिक्रिया और रूपांतरण। बनाए रखें और स्केल करें।",
        worstDesc: "कमजोर प्रदर्शन। संशोधित करने या हटाने पर विचार करें।",
        volumeTrend: "संदेश मात्रा रुझान और आउटेज लॉग",
        earlyDataBadge: "शुरुआती डेटा",
        matureBadge: "परिपक्व आँकड़ा",
        averageLabel: "औसत दर",
        medianLabel: "मध्यिका दर",
        outageWarning: "10 जुलाई को व्हाट्सएप एपीआई गेटवे आउटेज (3 घंटे) को ट्रेंड लाइन पर चिह्नित किया गया है।",
        refreshBtn: "रिफ्रेश करें",
        outlierNotice: "असाधारण प्रदर्शन का पता चला: नियम #1 अभियान में अत्यधिक उच्च प्रदर्शन (सांख्यिकीय स्पष्टता के लिए मध्यिका दिखाई गई है)।",
        influenceScore: "रूपांतरण प्रभाव स्कोर",
        whatsappLabel: "व्हाट्सएप बिजनेस",
        smsLabel: "एसएमएस गेटवे",
        voiceLabel: "आईवीआर ऑटो-डायलियर"
      },
      mr: {
        title: "संप्रेषण विश्लेषण डॅशबोर्ड",
        subtitle: "एंटरप्राइझ कामगिरी कॉकपिट. ओपन दर, ग्राहक रूपांतरण प्रभाव, व्यवहार आणि जाहिरात खर्च आणि SLA प्रतिसाद दरांचे ऑडिट करा.",
        overallSla: "SLA प्रतिसाद अनुपालन",
        overallSlaDesc: "लक्ष्यित १५ मिनिटांच्या आत दिलेल्या ग्राहक प्रतिसादांची टक्केवारी.",
        channelPerf: "चॅनेल खर्च आणि वितरण सारांश",
        bestPerformer: "सर्वोत्तम कामगिरी करणारे टेम्पलेट्स",
        worstPerformer: "पुनरावलोकनाची आवश्यकता असलेले टेम्पलेट्स",
        bestDesc: "उच्च प्रतिसाद आणि रूपांतरण. टिकवून ठेवा आणि वाढवा.",
        worstDesc: "कमी कामगिरी. सुधारणा करण्याचा किंवा काढून टाकण्याचा विचार करा.",
        volumeTrend: "संदेश प्रमाण कल आणि आउटेज लॉग",
        earlyDataBadge: "सुरुवातीचा डेटा",
        matureBadge: "परिपक्व डेटा",
        averageLabel: "सरासरी दर",
        medianLabel: "मध्यक दर",
        outageWarning: "१० जुलै रोजी व्हॉट्सॲप एपीआय गेटवे आउटेज (३ तास) ट्रेंड लाईनवर नोंदवले गेले आहे.",
        refreshBtn: "रिफ्रेश करा",
        outlierNotice: "अति-कामगिरी आढळली: नियम #१ मोहिमेत प्रचंड यश (सांख्यिकीय अचूकतेसाठी मध्यक दर्शविला आहे).",
        influenceScore: "रूपांतरण प्रभाव स्कोअर",
        whatsappLabel: "व्हॉट्सॲप बिझनेस",
        smsLabel: "एसएमएस गेटवे",
        voiceLabel: "आयव्हीआर ऑटो-डायल"
      }
    };
    return localizations[language] || localizations.en;
  }, [language]);

  // SLA Stats - 15 min response compliance rates
  const slaPercentage = 94.5; // High performance target

  // Cost data
  const costData = [
    { name: 'WhatsApp', Cost: 480, Messages: 4800, color: '#0E4B3D' },
    { name: 'SMS', Cost: 120, Messages: 6000, color: '#B8873D' },
    { name: 'Auto-Dialer', Cost: 340, Messages: 1650, color: '#2A2723' }
  ];

  // Daily Trend volume data with noted outage day (July 10th)
  const volumeTrendData = [
    { date: 'Jul 05', WhatsApp: 650, SMS: 820, Calls: 210, outage: false },
    { date: 'Jul 06', WhatsApp: 710, SMS: 880, Calls: 230, outage: false },
    { date: 'Jul 07', WhatsApp: 690, SMS: 850, Calls: 200, outage: false },
    { date: 'Jul 08', WhatsApp: 810, SMS: 910, Calls: 240, outage: false },
    { date: 'Jul 09', WhatsApp: 880, SMS: 950, Calls: 260, outage: false },
    { date: 'Jul 10', WhatsApp: 120, SMS: 980, Calls: 280, outage: true }, // Annotated outage
    { date: 'Jul 11', WhatsApp: 940, SMS: 1020, Calls: 290, outage: false }
  ];

  // Template List Performance Data including Outlier cases & Early Data cases
  const templates: TemplatePerformance[] = [
    {
      id: "tpl_whatsapp_catalog",
      name: "Rule #1: Alabaster Premium Lift Series Digital Catalog",
      channel: "whatsapp",
      sent: 2400,
      opened: 2280, // 95%
      replied: 1680, // 70% (Outlier success)
      conversionInfluence: 88,
      status: "mature"
    },
    {
      id: "tpl_sms_layout_nudge",
      name: "Rule #2: Survey Layout Plan Multi-floor Nudge",
      channel: "sms",
      sent: 3500,
      opened: 3450, // 98%
      replied: 840,  // 24%
      conversionInfluence: 52,
      status: "mature"
    },
    {
      id: "tpl_ivr_survey_confirm",
      name: "Rule #3: Site Survey Confirmation Automated Call",
      channel: "call",
      sent: 1100,
      opened: 980,  // 89% answered
      replied: 910,  // 82% keypress consent
      conversionInfluence: 78,
      status: "mature"
    },
    {
      id: "tpl_whatsapp_recovery",
      name: "Rule #4: Owner Mr. Prashant Personalized Offer Nudge",
      channel: "whatsapp",
      sent: 14, // Under the 20 messages limit -> Early Data status
      opened: 12,
      replied: 4,
      conversionInfluence: 40,
      status: "early_data"
    },
    {
      id: "tpl_poor_promo",
      name: "Legacy Promotional Discount Broadcast Block",
      channel: "sms",
      sent: 1200,
      opened: 480, // 40%
      replied: 36,  // 3% (Poor performance - suggestion to retire)
      conversionInfluence: 12,
      status: "mature"
    }
  ];

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  // Split templates into Best & Worst
  const bestPerforming = useMemo(() => {
    return [...templates]
      .filter(t => t.status === 'mature' && t.replied / t.sent >= 0.2)
      .sort((a, b) => (b.replied / b.sent) - (a.replied / a.sent));
  }, []);

  const worstPerforming = useMemo(() => {
    return [...templates]
      .filter(t => t.replied / t.sent < 0.2 || t.conversionInfluence < 30)
      .sort((a, b) => (a.replied / a.sent) - (b.replied / b.sent));
  }, []);

  // Compute stats: Average vs Median to handle outlier
  const statsSummary = useMemo(() => {
    const activeRates = templates.map(t => (t.replied / t.sent) * 100);
    const sum = activeRates.reduce((a, b) => a + b, 0);
    const avg = sum / activeRates.length;
    
    const sorted = [...activeRates].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    return {
      averageResponse: avg.toFixed(1),
      medianResponse: median.toFixed(1)
    };
  }, []);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Dual Progress Bar Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Automated Communication Engine Module Progress (Screen 10 of 10)</span>
            <span>100.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 60 of 200)</span>
            <span>30.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '30%' }} />
          </div>
        </div>
      </div>

      {/* SLA Metric Headroom / Screen Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            BULK SCHEDULER ENGINE • MODULE 6 • ANALYTICS
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2A2723] tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Tappable refresh indicator */}
        <div className="flex items-center gap-3">
          <Button
            onClick={refreshData}
            variant="secondary"
            className="text-xs font-bold py-2.5 px-4 flex items-center gap-1.5 bg-white border border-[#e5dfd4] hover:bg-alabaster"
          >
            <RefreshCw className={`w-4 h-4 text-warmgray ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{t.refreshBtn}</span>
          </Button>
        </div>
      </div>

      {/* Main KPI Dashboard Row - single top-left reading position for SLA compliance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Key KPI - Top Left */}
        <Card 
          onClick={() => setSelectedMetric('sla')}
          className={`p-4 bg-white cursor-pointer transition-all border ${
            selectedMetric === 'sla' ? 'border-antiquegold ring-1 ring-antiquegold/30 shadow-md' : 'border-[rgba(184,135,61,0.12)] hover:shadow-xs'
          }`}
        >
          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-warmgray">
            <span>{t.overallSla}</span>
            <Clock className="w-4 h-4 text-antiquegold" />
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-serif font-black text-royalemerald">{slaPercentage}%</span>
            <div className="flex items-center gap-1 text-[10px] text-royalemerald font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+1.2% this week</span>
            </div>
          </div>
          {/* Signature Ascension Line motif vertical rail inside card */}
          <div className="mt-3 h-1.5 w-full bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div className="absolute top-0 bottom-0 left-0 bg-royalemerald rounded-full" style={{ width: `${slaPercentage}%` }} />
          </div>
        </Card>

        <Card 
          onClick={() => setSelectedMetric('whatsapp')}
          className={`p-4 bg-white cursor-pointer transition-all border ${
            selectedMetric === 'whatsapp' ? 'border-antiquegold ring-1 ring-antiquegold/30 shadow-md' : 'border-[rgba(184,135,61,0.12)] hover:shadow-xs'
          }`}
        >
          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-warmgray">
            <span>{t.whatsappLabel} COST</span>
            <DollarSign className="w-4 h-4 text-royalemerald" />
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-mono font-black text-charcoal">₹28,840</span>
            <div className="flex items-center gap-1 text-[10px] text-warmgray font-bold mt-1">
              <span>Average ₹0.48 / message</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div className="absolute top-0 bottom-0 left-0 bg-antiquegold rounded-full" style={{ width: '65%' }} />
          </div>
        </Card>

        <Card 
          onClick={() => setSelectedMetric('sms')}
          className={`p-4 bg-white cursor-pointer transition-all border ${
            selectedMetric === 'sms' ? 'border-antiquegold ring-1 ring-antiquegold/30 shadow-md' : 'border-[rgba(184,135,61,0.12)] hover:shadow-xs'
          }`}
        >
          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-warmgray">
            <span>{t.smsLabel} VOLUME</span>
            <Send className="w-4 h-4 text-antiquegold" />
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-mono font-black text-charcoal">12,450</span>
            <div className="flex items-center gap-1 text-[10px] text-royalemerald font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+8.4% monthly scale</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div className="absolute top-0 bottom-0 left-0 bg-royalemerald rounded-full" style={{ width: '45%' }} />
          </div>
        </Card>

        <Card 
          onClick={() => setSelectedMetric('voice')}
          className={`p-4 bg-white cursor-pointer transition-all border ${
            selectedMetric === 'voice' ? 'border-antiquegold ring-1 ring-antiquegold/30 shadow-md' : 'border-[rgba(184,135,61,0.12)] hover:shadow-xs'
          }`}
        >
          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-warmgray">
            <span>{t.voiceLabel} CONNECTS</span>
            <Phone className="w-4 h-4 text-charcoal" />
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-mono font-black text-charcoal">91.2%</span>
            <div className="flex items-center gap-1 text-[10px] text-[#B23B3B] font-bold mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-0.4% call drop-off</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div className="absolute top-0 bottom-0 left-0 bg-charcoal rounded-full" style={{ width: '91%' }} />
          </div>
        </Card>

      </div>

      {/* Outlier analysis box */}
      <Card className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-antiquegold shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono">
            {t.outlierNotice}
          </h4>
          <div className="flex gap-4 text-xs font-mono font-bold text-amber-700">
            <span>{t.averageLabel}: {statsSummary.averageResponse}%</span>
            <span>{t.medianLabel}: {statsSummary.medianResponse}%</span>
          </div>
        </div>
      </Card>

      {/* Volume Trend Charts and Gateway Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Trend Chart */}
        <Card className="p-6 bg-white lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(184,135,61,0.15)] pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-antiquegold" />
              <h3 className="font-serif text-lg font-bold text-charcoal">{t.volumeTrend}</h3>
            </div>

            <div className="flex bg-alabaster rounded-lg p-1 border border-[#e5dfd4]">
              <button 
                onClick={() => setDateRange('7d')}
                className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${dateRange === '7d' ? 'bg-white text-charcoal shadow-xs' : 'text-warmgray'}`}
              >
                7 Days
              </button>
              <button 
                onClick={() => setDateRange('30d')}
                className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${dateRange === '30d' ? 'bg-white text-charcoal shadow-xs' : 'text-warmgray'}`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Recharts Area Plot */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E4B3D" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0E4B3D" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSMS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B8873D" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#B8873D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1ece3" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'sans-serif' }} />
                <Area type="monotone" dataKey="WhatsApp" stroke="#0E4B3D" fillOpacity={1} fill="url(#colorWA)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="SMS" stroke="#B8873D" fillOpacity={1} fill="url(#colorSMS)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gateway Warning log */}
          <div className="p-3 bg-red-50 border border-[#B23B3B]/20 rounded-xl flex items-center gap-2 text-xs font-semibold text-[#B23B3B]">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{t.outageWarning}</span>
          </div>
        </Card>

        {/* Cost per channel breakdown card */}
        <Card className="p-6 bg-white lg:col-span-4 flex flex-col justify-between">
          <div className="border-b border-[rgba(184,135,61,0.15)] pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-royalemerald" />
              <h3 className="font-serif text-lg font-bold text-charcoal">{t.channelPerf}</h3>
            </div>
            <p className="text-[10px] text-warmgray mt-0.5">Real-time reconciling API costs</p>
          </div>

          <div className="py-6 space-y-4">
            {costData.map((channel, i) => {
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-serif font-bold text-charcoal">{channel.name}</span>
                    <span className="font-mono font-bold text-charcoal">₹{channel.Cost}.00</span>
                  </div>
                  <div className="h-2 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        backgroundColor: channel.color, 
                        width: `${(channel.Cost / 480) * 100}%` 
                      }} 
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-warmgray">
                    <span>{channel.Messages} Dispatched</span>
                    <span>₹{(channel.Cost / channel.Messages).toFixed(2)} Avg</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-alabaster p-3.5 rounded-xl border border-[#e5dfd4] text-center">
            <span className="block text-[10px] font-mono font-bold text-warmgray">TOTAL API BUDGET RECONCILED</span>
            <span className="block font-mono text-xl font-black text-charcoal mt-1">₹940.00</span>
          </div>
        </Card>

      </div>

      {/* Templates performance listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Best Performing Block */}
        <Card className="p-6 bg-white space-y-4">
          <div className="border-b border-[rgba(184,135,61,0.15)] pb-3">
            <div className="flex items-center gap-1.5">
              <Award className="w-5 h-5 text-royalemerald" />
              <h3 className="font-serif text-base font-bold text-charcoal">{t.bestPerformer}</h3>
            </div>
            <p className="text-xs text-warmgray mt-0.5">{t.bestDesc}</p>
          </div>

          <div className="space-y-3">
            {bestPerforming.map((tpl) => {
              const responseRate = ((tpl.replied / tpl.sent) * 100).toFixed(0);
              return (
                <div key={tpl.id} className="p-3 bg-white rounded-xl border border-[rgba(184,135,61,0.12)] flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-serif text-xs font-bold text-charcoal truncate">{tpl.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-warmgray uppercase">{tpl.channel}</span>
                      <span className="text-[9px] font-mono bg-emerald-50 text-royalemerald px-1.5 py-0.5 rounded">
                        {t.matureBadge}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-sm font-mono font-black text-royalemerald">{responseRate}%</span>
                    <span className="block text-[8px] uppercase font-mono text-warmgray">{t.influenceScore} ({tpl.conversionInfluence}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Worst Performing Block */}
        <Card className="p-6 bg-white space-y-4">
          <div className="border-b border-[rgba(184,135,61,0.15)] pb-3">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-[#B23B3B]" />
              <h3 className="font-serif text-base font-bold text-charcoal">{t.worstPerformer}</h3>
            </div>
            <p className="text-xs text-warmgray mt-0.5">{t.worstDesc}</p>
          </div>

          <div className="space-y-3">
            {worstPerforming.map((tpl) => {
              const responseRate = ((tpl.replied / tpl.sent) * 100).toFixed(0);
              const isEarlyData = tpl.status === 'early_data';

              return (
                <div key={tpl.id} className="p-3 bg-white rounded-xl border border-[rgba(184,135,61,0.12)] flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-serif text-xs font-bold text-charcoal truncate">{tpl.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-warmgray uppercase">{tpl.channel}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        isEarlyData ? 'bg-amber-50 text-antiquegold' : 'bg-red-50 text-[#B23B3B]'
                      }`}>
                        {isEarlyData ? t.earlyDataBadge : t.matureBadge}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`block text-sm font-mono font-black ${
                      isEarlyData ? 'text-antiquegold' : 'text-[#B23B3B]'
                    }`}>{responseRate}%</span>
                    <span className="block text-[8px] uppercase font-mono text-warmgray">{t.influenceScore} ({tpl.conversionInfluence}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

    </div>
  );
};
