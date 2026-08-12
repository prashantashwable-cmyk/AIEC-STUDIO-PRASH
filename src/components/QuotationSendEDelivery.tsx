import React, { useState, useMemo, useEffect } from 'react';
import { 
  Send, Mail, MessageSquare, Calendar, Clock, AlertTriangle, CheckCircle2, 
  ArrowRight, FileText, Check, HelpCircle, Edit3, ShieldAlert, AlertCircle, 
  RefreshCw, X, ChevronRight, Eye, Trash2, Smartphone, Sparkles
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

interface CustomerContact {
  name: string;
  phone: string;
  email: string;
  whatsappOptIn: boolean;
  emailOptIn: boolean;
  crmStage: string;
}

interface ScheduledSend {
  id: string;
  quoteId: string;
  customerName: string;
  channels: ('whatsapp' | 'email')[];
  sendTime: string;
  coverMessage: string;
  versionNumber: number;
  isStale: boolean; // if superseded by a newer version
}

export const QuotationSendEDelivery: React.FC<{
  user: any;
  onSendComplete?: (quoteId: string, channels: string[]) => void;
}> = ({ user, onSendComplete }) => {
  const { language } = useLanguage();
  const [toastMsg, setToastMsg] = useState('');
  
  // Active Quote parameters
  const quoteId = "AIEC-QT-1092";
  const activeVersion = 4;
  const quoteValue = 1120000;

  // Lead contact information ( Pune Villa Project )
  const [contact, setContact] = useState<CustomerContact>({
    name: "Karan Malhotra",
    phone: "+91 98230 12345",
    email: "karan.malhotra@malhotragroup.in",
    whatsappOptIn: true,
    emailOptIn: true,
    crmStage: "Negotiation"
  });

  // Delivery channels selected
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);

  // Template message variables
  const defaultTemplates = {
    en: `Dear Mr. Karan Malhotra,

Please find enclosed the official quote (Version 4) from All India Elevators Company for your Pune Villa Project.

Summary of Layout:
- Model: Ascension Premium VVVF Geared Suite
- Floors: 4 Floors (Ground + 3)
- Inclusive Pricing: ₹11,20,000 (Fully inclusive of 18% GST and standard installation)
- Warranty: 2 Years comprehensive shield protection

You can preview the interactive document, request modifications, or complete secure instant authorization directly in your customer portal.

Warm regards,
Prashant Vasant Wable
All India Elevators Company (AIEC)`,
    hi: `प्रिय श्री करन मल्होत्रा,

कृपया अपने पुणे विला प्रोजेक्ट के लिए ऑल इंडिया एलिवेटर्स कंपनी से आधिकारिक उद्धरण (संस्करण 4) संलग्न पाएं।

लेआउट का सारांश:
- मॉडल: एसेंशन प्रीमियम वीवीवीएफ गियर्ड सुइट
- मंजिलें: 4 मंजिलें (भूतल + 3)
- मूल्य निर्धारण: ₹11,20,000 (18% जीएसटी और मानक स्थापना सहित)
- वारंटी: 2 साल

सादर,
प्रशांत वसंत वाबले
ऑल इंडिया एलिवेटर्स कंपनी (AIEC)`,
    mr: `प्रिय श्री. करण मल्होत्रा,

कृपया आपल्या पुणे व्हिला प्रकल्पासाठी ऑल इंडिया एलिव्हेटर्स कंपनीकडून अधिकृत कोटेशन (आवृत्ती ४) सोबत जोडलेले पहा.

तांत्रिक माहिती:
- मॉडेल: एसेंशन प्रीमियम व्हीव्हीव्हीएफ गियर्ड सुईट
- मजले: ४ मजले
- एकूण किंमत: ₹११,२०,००० (१८% जीएसटी आणि इंस्टॉलेशनसह)
- वॉरंटी: २ वर्षे सर्वसमावेशक संरक्षण

आपण आपल्या कस्टमर पोर्टलमध्ये थेट कोटेशन पाहू शकता किंवा बदल सुचवू शकता.

आपला नम्र,
प्रशांत वसंत वाबळे
ऑल इंडिया एलिव्हेटर्स कंपनी (AIEC)`
  };

  const [coverMessage, setCoverMessage] = useState(defaultTemplates[language] || defaultTemplates.en);

  // Scheduling options
  const [sendLater, setSendLater] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('2026-07-12');
  const [scheduleTime, setScheduleTime] = useState('10:00');

  // Delivery confirmations timeline log
  const [sendHistory, setSendHistory] = useState([
    {
      id: 'h-1',
      date: '2026-03-10 11:20',
      version: 1,
      channels: ['email'],
      status: 'Delivered',
      tracking: 'Opened 👁️'
    },
    {
      id: 'h-2',
      date: '2026-04-12 14:05',
      version: 2,
      channels: ['whatsapp', 'email'],
      status: 'Delivered',
      tracking: 'Opened 👁️'
    },
    {
      id: 'h-3',
      date: '2026-06-15 09:30',
      version: 3,
      channels: ['whatsapp'],
      status: 'WhatsApp Failed (No account), Fallback Email Sent',
      tracking: 'Opened via Fallback Email 👁️'
    }
  ]);

  // Scheduled Send Queue
  const [scheduledQueue, setScheduledQueue] = useState<ScheduledSend[]>([
    {
      id: 'sch-1',
      quoteId: quoteId,
      customerName: "Karan Malhotra",
      channels: ['whatsapp', 'email'],
      sendTime: '2026-07-15 09:00',
      coverMessage: "Reminder for the custom layout option...",
      versionNumber: 3, // This is older than current active version (4)
      isStale: true // Marked as superseded!
    }
  ]);

  // Mixed success status simulation state
  const [mixedStatusAlert, setMixedStatusAlert] = useState<string | null>(null);

  // Trigger Language changes to templates
  useEffect(() => {
    setCoverMessage(defaultTemplates[language] || defaultTemplates.en);
  }, [language]);

  const t = useMemo(() => {
    const translations = {
      en: {
        title: "Quotation Send & E-Delivery",
        subtitle: "Dispatch finalized immutable quote contracts securely over WhatsApp & Email instantly. Track real-time delivery handshakes and automate CRM stages.",
        badgeTitle: "OMNICHANNEL ROUTING HUB • MODULE 7 OF 20",
        channelSection: "Select Delivery Channels",
        whatsappLabel: "WhatsApp Rich Message Preview",
        emailLabel: "Branded PDF Document Email",
        optOutWarning: "Attention: This client has requested DND / Opt-Out for outbound SMS marketing. Core transactional quotations remain authorized.",
        coverTitle: "Personalized Digital Cover Message",
        messageTemplate: "Editable Quotation Announcement Message",
        scheduleTitle: "Delivery Scheduling Controls",
        sendImmediate: "Send Immediately",
        sendLater: "Schedule for Future Dispatch",
        dateLabel: "Dispatch Date",
        timeLabel: "Target Local Time",
        btnSend: "Confirm & Dispatch Quotation Document",
        btnSchedule: "Lock Scheduled Delivery",
        statusTitle: "Omnichannel Delivery Ledger & Tracking",
        crmAlert: "CRM Automation: Completing this send will automatically advance Karan Malhotra's sales stage from 'Negotiation' to 'Quoted'.",
        edgeBounced: "WhatsApp Channel Bounce Event Handled",
        edgeBouncedDesc: "The system detected +91 98230 12345 is unregistered on WhatsApp. Outbound fallback router automatically dispatched the quotation package as a secure PDF via karan.malhotra@malhotragroup.in instead.",
        edgeSuperseded: "Superseded Queue Prevention Active",
        edgeSupersededDesc: "The system has automatically cancelled scheduled dispatch 'sch-1' because a newer Version 4 was finalized by Sales after Version 3 was scheduled.",
        edgeMixed: "Mixed Channel Status Notification",
        edgeMixedDesc: "Notice: Delivered securely to Customer via WhatsApp API, but the companion corporate email bounced because corporate inbox mx records were temporarily unresponsive.",
        placeholderPhone: "Enter recipient phone number...",
        placeholderEmail: "Enter recipient email...",
        toastSuccess: "Quotation dispatched! Lead CRM stage successfully upgraded to 'Quoted' layout.",
        toastScheduled: "OMNICHANNEL DISPATCH TASK LOCKED successfully. Stale versions monitored."
      },
      hi: {
        title: "कोटेशन भेजें और ई-वितरण",
        subtitle: "व्हाट्सएप और ईमेल पर तुरंत अंतिम रूप दिए गए कोट अनुबंध सुरक्षित रूप से भेजें। वास्तविक समय में वितरण को ट्रैक करें।",
        badgeTitle: "ओम्नीचैनल रूटिंग हब • मॉड्यूल 7 का 20",
        channelSection: "वितरण चैनल चुनें",
        whatsappLabel: "व्हाट्सएप रिच संदेश पूर्वावलोकन",
        emailLabel: "ब्रांडेड पीडीएफ दस्तावेज ईमेल",
        optOutWarning: "ध्यान दें: इस ग्राहक ने आउटबाउंड एसएमएस के लिए ऑप्ट-आउट का अनुरोध किया है। हालांकि कोटेशन भेजना अधिकृत है।",
        coverTitle: "व्यक्तिगत डिजिटल कवर संदेश",
        messageTemplate: "संपादन योग्य कोटेशन संदेश",
        scheduleTitle: "वितरण शेड्यूलिंग नियंत्रण",
        sendImmediate: "तुरंत भेजें",
        sendLater: "भविष्य के लिए शेड्यूल करें",
        dateLabel: "भेजने की तारीख",
        timeLabel: "लक्ष्य स्थानीय समय",
        btnSend: "कोटेशन दस्तावेज की पुष्टि करें और भेजें",
        btnSchedule: "शेड्यूल वितरण लॉक करें",
        statusTitle: "ओम्नीचैनल डिलीवरी लेजर और ट्रैकिंग",
        crmAlert: "सीआरएम स्वचालन: इसे भेजने पर करन मल्होत्रा ​​का सेल्स चरण 'वार्ता' से बदलकर 'कोटेड' हो जाएगा।",
        edgeBounced: "व्हाट्सएप चैनल बाउंस इवेंट हैंडल किया गया",
        edgeBouncedDesc: "सिस्टम ने पता लगाया कि नंबर व्हाट्सएप पर पंजीकृत नहीं है। आउटबाउंड फ़ालबैक राउटर ने सुरक्षा के लिए पीडीएफ ईमेल द्वारा भेज दी है।",
        edgeSuperseded: "प्रतिस्थापित कतार सुरक्षा सक्रिय",
        edgeSupersededDesc: "सिस्टम ने अनुसूचित प्रेषण 'sch-1' को स्वतः रद्द कर दिया है क्योंकि नया संस्करण 4 अंतिम रूप दिया गया था।",
        edgeMixed: "मिश्रित चैनल स्थिति अधिसूचना",
        edgeMixedDesc: "सूचना: व्हाट्सएप के माध्यम से सफलतापूर्वक वितरित किया गया, लेकिन ईमेल बाउंस हो गया क्योंकि कॉर्पोरेट एमएक्स रिकॉर्ड अस्थायी रूप से अनुत्तरदायी थे।",
        placeholderPhone: "प्राप्तकर्ता का फोन नंबर दर्ज करें...",
        placeholderEmail: "प्राप्तकर्ता का ईमेल दर्ज करें...",
        toastSuccess: "कोटेशन भेज दिया गया! लीड सीआरएम चरण सफलतापूर्वक 'कोटेड' में उन्नत किया गया।",
        toastScheduled: "ओम्नीचैनल प्रेषण कार्य सफलतापूर्वक लॉक किया गया।"
      },
      mr: {
        title: "कोटेशन पाठवा आणि ई-डिलिव्हरी",
        subtitle: "व्हाट्सएप आणि ईमेल द्वारे थेट अधिकृत कोटेशन पाठवा. वितरणाची अचूक स्थिती ट्रॅक करा.",
        badgeTitle: "ओम्नीचॅनल रूटिंग हब • मॉड्युल ७ ऑफ २०",
        channelSection: "वितरण चॅनेल निवडा",
        whatsappLabel: "व्हॉट्सअ‍ॅप मेसेज प्रिव्ह्यू",
        emailLabel: "ब्रँडेड पीडीएफ डॉक्युमेंट ईमेल",
        optOutWarning: "लक्षात ठेवा: या ग्राहकाने एसएमएस मार्केटिंग नको असल्याचे कळवले आहे. परंतु महत्त्वाचे कोटेशन पाठवणे अधिकृत आहे.",
        coverTitle: "वैयक्तिक डिजिटल कव्हर संदेश",
        messageTemplate: "बदलण्याजोगा कोटेशन संदेश",
        scheduleTitle: "वेळापत्रक नियंत्रण (शेड्यूल)",
        sendImmediate: "त्वरित पाठवा",
        sendLater: "भविष्यासाठी वेळ निश्चित करा",
        dateLabel: "पाठवण्याची तारीख",
        timeLabel: "निश्चित वेळ",
        btnSend: "कोटेशन पाठवण्याची खात्री करा",
        btnSchedule: "वेळापत्रक जतन करा",
        statusTitle: "वितरण इतिहास आणि ट्रॅकिंग नोंदी",
        crmAlert: "CRM ऑटोमेशन: कोटेशन यशस्वीरित्या पाठवल्यास ग्राहकाची सेल्स स्टेज स्वयंचलितपणे बदलून 'कोटेड' होईल.",
        edgeBounced: "व्हॉट्सअ‍ॅप डिलिव्हरी बाऊन्स स्वयंचलित दुरुस्ती",
        edgeBouncedDesc: "मोबाईल नंबर व्हॉट्सअ‍ॅपवर उपलब्ध नसल्याने कोटेशन स्वयंचलितपणे पीडीएफ स्वरूपात ईमेल आयडीवर सुरक्षित पाठवले गेले आहे.",
        edgeSuperseded: "जुने कोटेशन स्वयंचलितपणे रद्द",
        edgeSupersededDesc: "नवीन आवृत्ती ४ आल्यामुळे प्रलंबित असलेली जुनी आवृत्ती ३ ची पाठवण्याची वेळ स्वयंचलितपणे रद्द करण्यात आली आहे.",
        edgeMixed: "मिश्रित चॅनेल स्थिती नोंदणी",
        edgeMixedDesc: "सूचना: कोटेशन व्हॉट्सअ‍ॅपवर यशस्वीरित्या पोहोचले आहे, परंतु ग्राहकाच्या ईमेल सर्व्हरमधील त्रुटीमुळे ईमेल पोहोचू शकला नाही.",
        placeholderPhone: "फोन नंबर लिहा...",
        placeholderEmail: "ईमेल पत्ता लिहा...",
        toastSuccess: "कोटेशन पाठवले गेले! ग्राहकाची सेल्स स्टेज यशस्वीरित्या बदलली आहे.",
        toastScheduled: "कोटेशन पाठवण्याचे वेळापत्रक यशस्वीरित्या लॉक केले गेले."
      }
    };
    return translations[language] || translations.en;
  }, [language]);

  const handleSendInstant = () => {
    if (!sendWhatsApp && !sendEmail) {
      triggerToast("Please select at least one delivery channel.");
      return;
    }

    // Trigger mixed success state as an edge case visualization on the dashboard if both channels are checked
    if (sendWhatsApp && sendEmail) {
      setMixedStatusAlert(t.edgeMixedDesc);
    } else {
      setMixedStatusAlert(null);
    }

    // Advanced CRM stage automatically
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const chosenChannels = [];
    if (sendWhatsApp) chosenChannels.push('whatsapp');
    if (sendEmail) chosenChannels.push('email');

    const newLog = {
      id: `h-${sendHistory.length + 1}`,
      date: timestamp,
      version: activeVersion,
      channels: chosenChannels,
      status: 'Delivered',
      tracking: 'Delivered (Awaiting open notification) 📩'
    };

    setSendHistory(prev => [newLog, ...prev]);
    setContact(prev => ({ ...prev, crmStage: "Quoted" }));
    triggerToast(t.toastSuccess);

    if (onSendComplete) {
      onSendComplete(quoteId, chosenChannels);
    }
  };

  const handleScheduleSend = () => {
    const newSch: ScheduledSend = {
      id: `sch-${scheduledQueue.length + 1}`,
      quoteId: quoteId,
      customerName: contact.name,
      channels: (sendWhatsApp ? ['whatsapp'] : []).concat(sendEmail ? ['email'] : []) as any,
      sendTime: `${scheduleDate} ${scheduleTime}`,
      coverMessage: coverMessage,
      versionNumber: activeVersion,
      isStale: false
    };

    setScheduledQueue(prev => [...prev, newSch]);
    triggerToast(t.toastScheduled);
  };

  const handleCancelScheduled = (id: string) => {
    setScheduledQueue(prev => prev.filter(q => q.id !== id));
    triggerToast("Scheduled dispatch cancelled successfully.");
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast Notice Banner */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0E4B3D] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Dual Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Auto-Quotation Engine Module Progress (Screen 8 of 10)</span>
            <span>80.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '80%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 68 of 200)</span>
            <span>34.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '34.0%' }} />
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            {t.badgeTitle}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2A2723] tracking-tight mt-1 flex items-center gap-2">
            <Send className="w-7 h-7 text-antiquegold" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* CRM Stage Sync Status banner info */}
      <div className="p-4 bg-emerald-50 border border-royalemerald/10 rounded-2xl flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-royalemerald shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-[#0E4B3D] uppercase tracking-wider font-mono">AUTOMATED WORKFLOW SYNC TRIGGER</h4>
          <p className="text-[11px] text-warmgray font-semibold leading-relaxed">
            {t.crmAlert} <strong className="text-charcoal">(Current CRM State: {contact.crmStage})</strong>
          </p>
        </div>
      </div>

      {/* Main Send Portal Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Sender Config & Templates */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Channel picker & opt-in validation */}
          <Card className="p-6 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4] pb-2">
              <h3 className="font-serif text-base font-black text-charcoal">{t.channelSection}</h3>
              <p className="text-[10px] text-warmgray font-semibold">Verify client permissions and communication channels.</p>
            </div>

            <div className="space-y-4">
              
              {/* WhatsApp Toggle */}
              <div className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                sendWhatsApp ? 'bg-emerald-50/20 border-royalemerald/30' : 'bg-alabaster/30 border-[#e5dfd4]'
              }`}>
                <div className="flex gap-3">
                  <div className="p-2 bg-royalemerald/10 text-royalemerald rounded-lg">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-charcoal block cursor-pointer" htmlFor="whatsappToggle">
                      {t.whatsappLabel}
                    </label>
                    <span className="text-[10px] text-warmgray font-semibold block mt-0.5">Sends active PDF URL link and interactive click action back-link</span>
                    <input 
                      type="text"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      className="mt-2 bg-white border border-[#e5dfd4] text-[11px] font-mono p-1.5 rounded-lg w-full max-w-xs"
                      placeholder={t.placeholderPhone}
                    />
                  </div>
                </div>
                <input 
                  type="checkbox"
                  id="whatsappToggle"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="rounded text-royalemerald focus:ring-royalemerald border-[#e5dfd4] mt-1"
                />
              </div>

              {/* Email Toggle */}
              <div className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                sendEmail ? 'bg-emerald-50/20 border-royalemerald/30' : 'bg-alabaster/30 border-[#e5dfd4]'
              }`}>
                <div className="flex gap-3">
                  <div className="p-2 bg-royalemerald/10 text-royalemerald rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-charcoal block cursor-pointer" htmlFor="emailToggle">
                      {t.emailLabel}
                    </label>
                    <span className="text-[10px] text-warmgray font-semibold block mt-0.5">Sends high resolution customized vector PDF proposal attachment</span>
                    <input 
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="mt-2 bg-white border border-[#e5dfd4] text-[11px] font-mono p-1.5 rounded-lg w-full max-w-xs"
                      placeholder={t.placeholderEmail}
                    />
                  </div>
                </div>
                <input 
                  type="checkbox"
                  id="emailToggle"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded text-royalemerald focus:ring-royalemerald border-[#e5dfd4] mt-1"
                />
              </div>

            </div>

            {/* Compliance notification warnings */}
            <div className="p-3.5 bg-red-50/30 border border-[#B23B3B]/10 rounded-xl flex items-start gap-2.5 text-[10px]">
              <ShieldAlert className="w-4 h-4 text-[#B23B3B] shrink-0 mt-0.5" />
              <p className="text-warmgray font-semibold leading-relaxed">
                {t.optOutWarning}
              </p>
            </div>
          </Card>

          {/* Card 2: Cover message template editor */}
          <Card className="p-6 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4] pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-serif text-base font-black text-charcoal">{t.coverTitle}</h3>
                <p className="text-[10px] text-warmgray font-semibold">Modify cover template to personal customer relationship standards.</p>
              </div>
              <span className="bg-alabaster text-antiquegold text-[9px] uppercase font-mono px-2 py-0.5 rounded font-black">
                V4 Branded Config
              </span>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[9px] uppercase text-warmgray font-bold block">{t.messageTemplate}</label>
              <textarea
                rows={9}
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                className="w-full bg-alabaster border border-[#e5dfd4] p-3 rounded-xl text-xs font-sans text-charcoal leading-relaxed font-semibold focus:bg-white"
              />
            </div>
          </Card>

          {/* Card 3: Dispatch timing controls */}
          <Card className="p-6 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4] pb-2">
              <h3 className="font-serif text-base font-black text-charcoal">{t.scheduleTitle}</h3>
              <p className="text-[10px] text-warmgray font-semibold">Deliver immediately or schedule strategic dispatch during client working hours.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              
              <button 
                type="button"
                onClick={() => setSendLater(false)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  !sendLater 
                    ? 'border-antiquegold bg-alabaster/40 shadow-xs' 
                    : 'border-[#e5dfd4] bg-white hover:bg-neutral-50'
                }`}
              >
                <span className="font-bold text-charcoal block">{t.sendImmediate}</span>
                <span className="text-[9px] text-warmgray font-medium mt-1">Dispatches proposal immediately upon clicking button below.</span>
              </button>

              <button 
                type="button"
                onClick={() => setSendLater(true)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  sendLater 
                    ? 'border-antiquegold bg-alabaster/40 shadow-xs' 
                    : 'border-[#e5dfd4] bg-white hover:bg-neutral-50'
                }`}
              >
                <span className="font-bold text-charcoal block">{t.sendLater}</span>
                <span className="text-[9px] text-warmgray font-medium mt-1">Queue for background cron dispatch engine.</span>
              </button>

            </div>

            {sendLater && (
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold p-4 bg-alabaster rounded-xl border border-[#e5dfd4]/40">
                <div className="space-y-1">
                  <label className="text-warmgray font-mono text-[9px] uppercase">{t.dateLabel}</label>
                  <input 
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-white border border-[#e5dfd4] p-2.5 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-warmgray font-mono text-[9px] uppercase">{t.timeLabel}</label>
                  <input 
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-white border border-[#e5dfd4] p-2.5 rounded-lg"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={sendLater ? handleScheduleSend : handleSendInstant}
              variant="primary"
              fullWidth
              className="text-xs font-bold py-3.5 mt-2"
            >
              <Send className="w-4 h-4 text-white animate-pulse" />
              <span>{sendLater ? t.btnSchedule : t.btnSend}</span>
            </Button>

          </Card>

        </div>

        {/* Right Side: Tracking Logs & Edge cases diagnostics */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section: Scheduled Dispatch queue */}
          <Card className="p-5 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4] pb-2">
              <h3 className="font-serif text-sm font-bold text-charcoal">Scheduled Dispatch Queue</h3>
              <p className="text-[9px] text-warmgray font-semibold">Active tasks registered in All India Elevators background dispatch ledger.</p>
            </div>

            {scheduledQueue.length === 0 ? (
              <p className="text-xs text-warmgray italic py-2">No future automated dispatches pending.</p>
            ) : (
              <div className="space-y-3">
                {scheduledQueue.map((sch) => (
                  <div 
                    key={sch.id}
                    className={`p-3.5 rounded-xl border relative overflow-hidden text-xs font-semibold ${
                      sch.isStale ? 'bg-red-50/50 border-red-200' : 'bg-alabaster/30 border-[#e5dfd4]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-charcoal block">To: {sch.customerName}</strong>
                        <span className="text-[9px] text-warmgray block mt-0.5">Version {sch.versionNumber} • Scheduled for {sch.sendTime}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleCancelScheduled(sch.id)}
                        className="p-1 hover:bg-neutral-100 rounded text-warmgray hover:text-charcoal"
                        title="Cancel task"
                      >
                        <Trash2 className="w-4 h-4 text-[#B23B3B]/70" />
                      </button>
                    </div>

                    {/* Edge case 2 Alert: Scheduled superseded by V4 */}
                    {sch.isStale && (
                      <div className="mt-2.5 p-2 bg-red-100/40 border border-red-200 rounded-lg text-[10px] space-y-1">
                        <div className="flex items-center gap-1 text-red-700 font-bold uppercase tracking-wider">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{t.edgeSuperseded}</span>
                        </div>
                        <p className="text-warmgray leading-snug">{t.edgeSupersededDesc}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Mixed status channel successes edge case indicator */}
          {mixedStatusAlert && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#B23B3B] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">{t.edgeMixed}</h4>
                <p className="text-[11px] text-warmgray font-semibold leading-relaxed">
                  {mixedStatusAlert}
                </p>
              </div>
            </div>
          )}

          {/* Diagnostic Handled Edge Cases Ledger */}
          <Card className="p-5 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4] pb-2">
              <h3 className="font-serif text-sm font-bold text-charcoal flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-antiquegold" />
                <span>Failover & Fallback Diagnostics</span>
              </h3>
              <p className="text-[9px] text-warmgray font-semibold">Simulated platform resiliency logs for Prashant Wable's peace of mind.</p>
            </div>

            <div className="space-y-4 text-xs font-semibold leading-relaxed">
              
              {/* WhatsApp bounce fallback simulated event */}
              <div className="p-3 bg-alabaster rounded-xl border border-[#e5dfd4]/40 space-y-1">
                <div className="flex items-center gap-1.5 text-royalemerald font-bold font-mono text-[9px] uppercase">
                  <Smartphone className="w-3.5 h-3.5 text-royalemerald" />
                  <span>{t.edgeBounced}</span>
                </div>
                <p className="text-[10px] text-warmgray">
                  {t.edgeBouncedDesc}
                </p>
              </div>

            </div>
          </Card>

          {/* E-Delivery History list (Status tracker) */}
          <Card className="p-5 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4] pb-2">
              <h3 className="font-serif text-sm font-bold text-charcoal">{t.statusTitle}</h3>
              <p className="text-[9px] text-warmgray font-semibold">Real-time status handshakes linked with active client portal metrics.</p>
            </div>

            <div className="space-y-3">
              {sendHistory.map((h) => (
                <div key={h.id} className="p-3.5 bg-alabaster/40 border border-[#e5dfd4]/30 rounded-xl text-xs font-semibold space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] font-bold text-charcoal uppercase">QUOTE VERSION {h.version}</span>
                    <span className="text-[9px] text-warmgray font-mono">{h.date}</span>
                  </div>

                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-warmgray block">
                      Dispatched over: <strong className="text-charcoal uppercase text-[10px] font-mono">{h.channels.join(' & ')}</strong>
                    </span>
                    <span className="text-royalemerald font-bold text-[11px]">{h.tracking}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
