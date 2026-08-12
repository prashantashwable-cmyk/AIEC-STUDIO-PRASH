import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, User, Bot, Shield, Check, CheckCheck, Clock, Send, 
  AlertTriangle, Play, Pause, Paperclip, MoreVertical, ShieldAlert,
  ArrowRight, UserCheck, CheckCircle2, ChevronRight, RefreshCw, Sparkles,
  Info, ShieldCheck, Undo2, Ban, HelpCircle, FileText
} from 'lucide-react';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';

// Translations for Live Negotiation Thread Screen
const localizations = {
  en: {
    title: "Live Negotiation Terminal",
    subtitle: "Real-time AI bot negotiation thread. Monitor, guide, or seamlessly seize control at any point.",
    headerTitle: "Active Negotiation Thread",
    originalPrice: "Original Baseline Quote",
    currentPrice: "Current Negotiation Price",
    targetFloor: "Configured Price Floor",
    roundsLimit: "Rounds Allowed",
    roundsCount: "Negotiation Round",
    roundsSLA: "Round Limit Progress",
    controlMode: "Active Operator",
    botMode: "Auto Bot Negotiating",
    humanMode: "Staff (Human) Seized Control",
    takeOverBtn: "Take Over (Disengage Bot)",
    handBackBtn: "Hand Back to Auto Mode",
    viewingAs: "Active Persona View:",
    staffRole: "Staff Operator (Admin/Sales)",
    customerRole: "Client / Customer Portal View",
    floorWarning: "Customer requested ₹{price} which is below our floor ₹{floor}. Bot politely countered at ₹{floor}.",
    botAccepted: "Customer requested ₹{price} which is acceptable! Deal finalized automatically.",
    composerPlaceholder: "Type a WhatsApp reply to customer...",
    composerWarning: "Sending a custom message will automatically disengage the bot and transfer control to you.",
    sendBtn: "Send Message",
    quickReplies: "Objection Response Templates",
    simulateCustomerSection: "Customer Reply Simulator",
    simulateDesc: "Interact as the customer to test the bot's concession logic, margin floor constraints, and automatic handoffs.",
    staleBtn: "Simulate Inactivity (24h Alert)",
    staleMsg: "Lead has been inactive. Follow-up automated reminder dispatched.",
    newVersionToast: "New quotation version {ver} created automatically behind the scenes to lock ₹{price}.",
    botTag: "AI Bot Negotiator",
    humanTag: "Staff Representative",
    customerTag: "Client",
    escalatedSLA: "Escalated to Human",
    dealWon: "Deal Secured!",
    dealLost: "Deal Archived",
    toastTakeover: "Bot disengaged successfully. You are now in full manual command.",
    toastHandback: "Bot re-engaged. Reading current human-adjusted state of ₹{price}.",
    toastSent: "Message sent.",
    notVisibleToCustomer: "Visible only to internal staff",
    complianceDND: "All interactions are legally logged for ISO-9001:2015 safety standards."
  },
  hi: {
    title: "लाइव बातचीत टर्मिनल",
    subtitle: "रीयल-टाइम एआई बॉट बातचीत सूत्र। किसी भी बिंदु पर निगरानी करें, मार्गदर्शन करें या निर्बाध रूप से नियंत्रण लें।",
    headerTitle: "सक्रिय बातचीत थ्रेड",
    originalPrice: "मूल आधार मूल्य",
    currentPrice: "वर्तमान बातचीत मूल्य",
    targetFloor: "कॉन्फ़िगर न्यूनतम सीमा",
    roundsLimit: "दौर की सीमा",
    roundsCount: "बातचीत दौर",
    roundsSLA: "दौर सीमा प्रगति",
    controlMode: "सक्रिय ऑपरेटर",
    botMode: "ऑटो बॉट बातचीत कर रहा है",
    humanMode: "कर्मचारी (मानव) नियंत्रण में",
    takeOverBtn: "नियंत्रण लें (बॉट बंद करें)",
    handBackBtn: "वापस बॉट को सौंपें",
    viewingAs: "सक्रिय भूमिका दृश्य:",
    staffRole: "कर्मचारी ऑपरेटर (एडमिन/सेल्स)",
    customerRole: "ग्राहक / क्लाइंट पोर्टल दृश्य",
    floorWarning: "ग्राहक ने ₹{price} का अनुरोध किया जो हमारे न्यूनतम ₹{floor} से कम है। बॉट ने ₹{floor} पर विनम्रता से मुकाबला किया।",
    botAccepted: "ग्राहक ने ₹{price} का अनुरोध किया जो स्वीकार्य है! सौदा स्वचालित रूप से तय हुआ।",
    composerPlaceholder: "ग्राहक को व्हाट्सएप संदेश लिखें...",
    composerWarning: "एक कस्टम संदेश भेजने से बॉट स्वतः अक्षम हो जाएगा और नियंत्रण आपके पास आ जाएगा।",
    sendBtn: "संदेश भेजें",
    quickReplies: "आपत्ति प्रतिक्रिया टेम्पलेट्स",
    simulateCustomerSection: "ग्राहक प्रतिक्रिया सिम्युलेटर",
    simulateDesc: "बॉट की रियायत तर्क और सुरक्षा सीमाओं का परीक्षण करने के लिए ग्राहक के रूप में बातचीत करें।",
    staleBtn: "निष्क्रियता का अनुकरण करें (24h चेतावनी)",
    staleMsg: "लीड निष्क्रिय रही है। स्वचालित अनुवर्ती संदेश भेज दिया गया है।",
    newVersionToast: "₹{price} लॉक करने के लिए नया कोटेशन संस्करण {ver} स्वतः बनाया गया।",
    botTag: "एआई बॉट वार्ताकार",
    humanTag: "स्टाफ प्रतिनिधि",
    customerTag: "ग्राहक",
    escalatedSLA: "मानव को स्थानांतरित",
    dealWon: "सौदा पक्का हुआ!",
    dealLost: "सौदा संग्रहीत",
    toastTakeover: "बॉट को सफलतापूर्वक बंद किया गया। अब आप पूर्ण नियंत्रण में हैं।",
    toastHandback: "बॉट पुनः सक्रिय। वर्तमान मूल्य ₹{price} को आधार माना गया।",
    toastSent: "संदेश भेजा गया।",
    notVisibleToCustomer: "केवल आंतरिक स्टाफ को दिखाई देता है",
    complianceDND: "सभी बातचीत कानूनी रूप से आईएसओ-9001:2015 सुरक्षा मानकों के लिए लॉग की जाती हैं।"
  },
  mr: {
    title: "थेट नेगोशिएशन टर्मिनल",
    subtitle: "रिअल-टाइम एआय बॉट संभाषण सूत्र. देखरेख करा किंवा कोणत्याही क्षणी संभाषणाचा ताबा स्वतःकडे घ्या.",
    headerTitle: "सक्रिय संभाषण थ्रेड",
    originalPrice: "मूळ आधार किंमत",
    currentPrice: "सध्याची बोलणी किंमत",
    targetFloor: "किमान नफा मर्यादा (Floor)",
    roundsLimit: "एकूण फेऱ्या मर्यादा",
    roundsCount: "नेगोशिएशन फेरी",
    roundsSLA: "फेरी मर्यादा प्रगती",
    controlMode: "सक्रिय ऑपरेटर",
    botMode: "एआय बॉट चर्चेत सक्रिय",
    humanMode: "स्टाफ प्रतिनिधी नियंत्रण घेत आहे",
    takeOverBtn: "ताबा घ्या (बॉट थांबवा)",
    handBackBtn: "बॉटकडे पुन्हा सोपवा",
    viewingAs: "सक्रिय भूमिका:",
    staffRole: "स्टाफ ऑपरेटर (ॲडमिन/सेल्स)",
    customerRole: "ग्राहक पोर्टल दृश्य",
    floorWarning: "ग्राहकाने ₹{price} ची मागणी केली जी किमान मर्यादेपेक्षा (₹{floor}) कमी आहे. बॉटने ₹{floor} वर नवीन ऑफर दिली.",
    botAccepted: "ग्राहकाची ₹{price} ची मागणी मान्य झाली! सौदा स्वयंचलितपणे पूर्ण.",
    composerPlaceholder: "ग्राहकाला व्हॉट्सॲप संदेश पाठवा...",
    composerWarning: "वैयक्तिक संदेश पाठवल्यास बॉट तात्काळ बंद होऊन संपूर्ण ताबा तुमच्याकडे येईल.",
    sendBtn: "मेसेज पाठवा",
    quickReplies: "शंकांचे निरसन टेम्पलेट्स",
    simulateCustomerSection: "ग्राहक प्रतिसाद सिम्युलेटर",
    simulateDesc: "बॉटच्या सवलत प्रणालीची आणि नफा सुरक्षा मर्यादांची चाचणी घेण्यासाठी ग्राहक म्हणून मेसेज पाठवा.",
    staleBtn: "निष्क्रियता दर्शवा (२४ तास इशारा)",
    staleMsg: "ग्राहक निष्क्रिय आहे. स्वयंचलित फॉलो-अप मेसेज पाठवला गेला.",
    newVersionToast: "₹{price} लॉक करण्यासाठी नवीन कोटेशन व्हर्जन {ver} स्वयंचलितपणे तयार झाले.",
    botTag: "एआय बॉट प्रतिनिधी",
    humanTag: "स्टाफ प्रतिनिधी",
    customerTag: "ग्राहक",
    escalatedSLA: "मानवी मदत सक्रिय",
    dealWon: "करार निश्चित झाला!",
    dealLost: "करार रद्द",
    toastTakeover: "बॉट थांबवला आहे. आता तुम्ही संभाषणाचे प्रमुख आहात.",
    toastHandback: "बॉट पुन्हा सक्रिय झाला. सध्याच्या ₹{price} किमतीवरून चर्चा सुरू ठेवली जाईल.",
    toastSent: "मेसेज पाठवला.",
    notVisibleToCustomer: "केवळ अंतर्गत कर्मचाऱ्यांनाच दिसते",
    complianceDND: "सर्व संभाषणे कायदेशीररीत्या ISO-9001:2015 सुरक्षा मानकांनुसार जतन केली जातात."
  }
};

interface Message {
  id: string;
  senderType: 'client' | 'bot' | 'human' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  quoteVersion?: string;
  adjustedPrice?: number;
}

interface NegotiationThread {
  id: string;
  quoteId: string;
  customerName: string;
  buildingName: string;
  originalPrice: number;
  currentOfferPrice: number;
  priceFloor: number;
  roundNumber: number;
  maxRounds: number;
  controlMode: 'bot' | 'human';
  status: 'bot_active' | 'human_escalated' | 'completed_won' | 'completed_lost';
  messages: Message[];
}

export const LiveNegotiationThread: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const [toastMsg, setToastMsg] = useState('');
  const [activePersona, setActivePersona] = useState<'staff' | 'customer'>('staff');
  
  // Multilingual localization resolver
  const t = useMemo(() => {
    return localizations[language as 'en' | 'hi' | 'mr'] || localizations.en;
  }, [language]);

  // Initial negotiation data (synced with the configurations in AutoNegotiationBotConfig)
  const [negotiation, setNegotiation] = useState<NegotiationThread>({
    id: 'neg-1',
    quoteId: 'AIEC-QT-1092',
    customerName: 'Karan Malhotra (Penthouse)',
    buildingName: 'Pratik Heights, Kothrud',
    originalPrice: 1250000,
    currentOfferPrice: 1120000,
    priceFloor: 1110000, // Absolute bottom limit (margin floor calculated at ~18%)
    roundNumber: 2,
    maxRounds: 4,
    controlMode: 'bot',
    status: 'bot_active',
    messages: [
      {
        id: 'msg-1',
        senderType: 'system',
        senderName: 'SYSTEM PROTOCOL',
        text: 'Initial Quotation AIEC-QT-1092-V1 issued at baseline price ₹12,50,000.',
        timestamp: '09:00 AM'
      },
      {
        id: 'msg-2',
        senderType: 'client',
        senderName: 'Karan Malhotra',
        text: 'Hello, our society has reviewed the proposal. The layout looks perfect but we are talking to local fabricators who are quoting almost 18% less. Can we get a discount?',
        timestamp: '10:15 AM',
        status: 'read'
      },
      {
        id: 'msg-3',
        senderType: 'bot',
        senderName: 'AI Bot Negotiator',
        text: 'Hello Karan. We understand your budget concerns. At All India Elevators, our pricing is grounded in 100% genuine safety brakes, certified components, and a 2-year warranty shielding you from future maintenance costs. To help with the budget, I can apply a special regional discount to bring the price to ₹11,80,000.',
        timestamp: '10:16 AM',
        quoteVersion: 'V2',
        adjustedPrice: 1180000
      },
      {
        id: 'msg-4',
        senderType: 'client',
        senderName: 'Karan Malhotra',
        text: 'That is better, but still over our budget. If you can do ₹11,00,000 inclusive of GST, we are ready to sign the order booking form today. Please let me know.',
        timestamp: '10:30 AM',
        status: 'read'
      },
      {
        id: 'msg-5',
        senderType: 'bot',
        senderName: 'AI Bot Negotiator',
        text: 'Analyzing the request. We cannot accept ₹11,00,000 as it falls below our strict quality and safety margin limit. However, I can offer our final best price of ₹11,20,000, and as a gesture of partnership, we will bundle an AMC (Annual Maintenance Contract) premium upgrade voucher worth ₹42,000 for free!',
        timestamp: '10:31 AM',
        quoteVersion: 'V3',
        adjustedPrice: 1120000
      }
    ]
  });

  // Composer fields
  const [composerText, setComposerText] = useState('');
  
  // Simulated customer entry
  const [customerOfferInput, setCustomerOfferInput] = useState('');
  const [customerMessageInput, setCustomerMessageInput] = useState('');

  // Auto-scroll chat window
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [negotiation.messages]);

  // Notification Toast Helper
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Staff action: Take Over control
  const handleTakeOverControl = () => {
    setNegotiation(prev => ({
      ...prev,
      controlMode: 'human',
      status: 'human_escalated',
      messages: [
        ...prev.messages,
        {
          id: `msg-sys-${Date.now()}`,
          senderType: 'system',
          senderName: 'SYSTEM DEVIATION',
          text: 'Operator Amit Sharma took over. Automated AI negotiation bot is permanently disengaged.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }));
    triggerToast(t.toastTakeover);
  };

  // Staff action: Hand back to Auto mode
  const handleHandBackToAuto = () => {
    setNegotiation(prev => ({
      ...prev,
      controlMode: 'bot',
      status: 'bot_active',
      messages: [
        ...prev.messages,
        {
          id: `msg-sys-${Date.now()}`,
          senderType: 'system',
          senderName: 'SYSTEM RE-ENGAGEMENT',
          text: `Automated AI bot re-engaged. Re-reading current human-adjusted price target: ₹${prev.currentOfferPrice.toLocaleString()}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }));
    triggerToast(t.toastHandback.replace('{price}', negotiation.currentOfferPrice.toLocaleString()));
  };

  // Staff action: Send Message
  const handleStaffSendMessage = (textToSend?: string) => {
    const finalMsg = textToSend || composerText;
    if (!finalMsg.trim()) return;

    const isBotPreviouslyActive = negotiation.controlMode === 'bot';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setNegotiation(prev => {
      const updatedMessages = [...prev.messages];

      // If bot was active, we append a system log that human is seizing control
      if (isBotPreviouslyActive) {
        updatedMessages.push({
          id: `msg-sys-${Date.now()}-1`,
          senderType: 'system',
          senderName: 'SYSTEM DEVIATION',
          text: 'Operator initiated reply. AI Bot has been auto-disengaged permanently.',
          timestamp
        });
      }

      // Add actual human message
      updatedMessages.push({
        id: `msg-staff-${Date.now()}`,
        senderType: 'human',
        senderName: 'Amit Sharma (Sales)',
        text: finalMsg,
        timestamp
      });

      return {
        ...prev,
        controlMode: 'human',
        status: 'human_escalated',
        messages: updatedMessages
      };
    });

    if (isBotPreviouslyActive) {
      triggerToast(t.toastTakeover);
    } else {
      triggerToast(t.toastSent);
    }
    
    if (!textToSend) {
      setComposerText('');
    }
  };

  // Simulate Customer sending a message / proposal
  const handleSimulateCustomerSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMessageInput.trim() && !customerOfferInput.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const proposedPriceValue = customerOfferInput ? parseInt(customerOfferInput.replace(/[^0-9]/g, '')) : null;
    const finalCustomerText = customerMessageInput || (proposedPriceValue 
      ? `Can you do ₹${proposedPriceValue.toLocaleString()} including our local taxes? This is our final word.`
      : "We are waiting for your revised draft."
    );

    // 1. Append client message
    const clientMessage: Message = {
      id: `msg-client-${Date.now()}`,
      senderType: 'client',
      senderName: negotiation.customerName.split(' ')[0],
      text: finalCustomerText,
      timestamp,
      status: 'read'
    };

    setNegotiation(prev => {
      let updatedMessages = [...prev.messages, clientMessage];
      let updatedRound = prev.roundNumber;
      let nextPrice = prev.currentOfferPrice;
      let nextStatus = prev.status;
      let nextControl = prev.controlMode;

      // Check if negotiation bot is active and we have a price suggestion
      if (prev.controlMode === 'bot') {
        updatedRound += 1;
        
        if (proposedPriceValue) {
          // Check if proposed price is below the floor
          if (proposedPriceValue < prev.priceFloor) {
            // Price is below the floor. Bot declines and proposes floor with free AMC voucher!
            nextPrice = prev.priceFloor;
            const nextVer = `V${updatedRound + 1}`;
            
            updatedMessages.push({
              id: `msg-sys-v-${Date.now()}`,
              senderType: 'system',
              senderName: 'VERSION LATCH',
              text: `Quotation updated to version ${prev.quoteId}-${nextVer} at price limit ₹${nextPrice.toLocaleString()}`,
              timestamp
            });

            updatedMessages.push({
              id: `msg-bot-reply-${Date.now()}`,
              senderType: 'bot',
              senderName: 'AI Bot Negotiator',
              text: `We appreciate your offer of ₹${proposedPriceValue.toLocaleString()}. However, we cannot drop below ₹${prev.priceFloor.toLocaleString()} as we construct our elevators strictly to national safety certifications (IS-14665). Let's finalize on ₹${prev.priceFloor.toLocaleString()} and we will include a 24-month warranty extension at no extra charge!`,
              timestamp,
              quoteVersion: nextVer,
              adjustedPrice: nextPrice
            });

            // If we reached the maximum rounds allowed, hand off to human
            if (updatedRound >= prev.maxRounds) {
              nextStatus = 'human_escalated';
              nextControl = 'human';
              updatedMessages.push({
                id: `msg-sys-limit-${Date.now()}`,
                senderType: 'system',
                senderName: 'ROUNDS CEILING REACHED',
                text: 'Negotiation round ceiling hit. Bot fully disengaged. Control escalated to sales staff operator.',
                timestamp
              });
            }

          } else {
            // Price is acceptable (>= floor price)
            nextPrice = proposedPriceValue;
            const nextVer = `V${updatedRound + 1}`;

            updatedMessages.push({
              id: `msg-sys-v-${Date.now()}`,
              senderType: 'system',
              senderName: 'VERSION LATCH',
              text: `Quotation updated to version ${prev.quoteId}-${nextVer} at accepted price ₹${nextPrice.toLocaleString()}`,
              timestamp
            });

            updatedMessages.push({
              id: `msg-bot-reply-${Date.now()}`,
              senderType: 'bot',
              senderName: 'AI Bot Negotiator',
              text: `Excellent news! We accept your proposal of ₹${nextPrice.toLocaleString()}. I have locked this in and drafted our standard digital contract. You can sign it directly inside your Client Portal. Welcome to the AIEC family!`,
              timestamp,
              quoteVersion: nextVer,
              adjustedPrice: nextPrice
            });

            nextStatus = 'completed_won';
          }
        } else {
          // Text-only customer message. Bot responds using a conversational reassurance template.
          updatedMessages.push({
            id: `msg-bot-reply-${Date.now()}`,
            senderType: 'bot',
            senderName: 'AI Bot Negotiator',
            text: `Thank you for your message. We want to make sure your lift has supreme safety and smooth rides. If the baseline price of ₹${prev.currentOfferPrice.toLocaleString()} is comfortable, let us know and I will prepare the legal order booking documents.`,
            timestamp
          });
        }
      }

      return {
        ...prev,
        roundNumber: updatedRound,
        currentOfferPrice: nextPrice,
        status: nextStatus,
        controlMode: nextControl,
        messages: updatedMessages
      };
    });

    // Reset inputs
    setCustomerOfferInput('');
    setCustomerMessageInput('');
  };

  // Simulate customer going silent
  const handleSimulateInactivity = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setNegotiation(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: `msg-sys-stale-${Date.now()}`,
          senderType: 'system',
          senderName: 'FOLLOW-UP TRIGGER',
          text: '⚠️ Stale Thread Detected: Client unresponsive for 24h. Stage-based re-engagement flow triggered automatically. Dispatching WhatsApp reminder...',
          timestamp
        },
        {
          id: `msg-bot-followup-${Date.now()}`,
          senderType: 'bot',
          senderName: 'AI Bot Negotiator',
          text: 'Hi Karan! Just checking in on our discussion for Pratik Heights. Our pricing lock on the complimentary AMC upgrades expires shortly. Let me know if you would like me to assist you with the booking.',
          timestamp
        }
      ]
    }));
    triggerToast(t.staleMsg);
  };

  // Quick Reply chips for staff
  const QUICK_REPLIES = [
    "Our offer matches Pune HQ high-safety requirements with certified VVVF drives.",
    "We can include a free first-year AMC upgrade worth ₹42,000 to offset the cost.",
    "This quote is backed by a 2-year comprehensive shield warranty.",
    "Please send your approved civil architecture sketch of the shaft."
  ];

  // Round Progress steps for internal staff
  const internalRoundsSteps = useMemo(() => {
    const steps = [];
    for (let i = 1; i <= negotiation.maxRounds; i++) {
      steps.push({
        id: `r-${i}`,
        label: `Round ${i}`,
        completed: negotiation.roundNumber >= i,
        active: negotiation.roundNumber === i - 1
      });
    }
    return steps;
  }, [negotiation.roundNumber, negotiation.maxRounds]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-royalemerald text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/25 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Header Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Negotiation & Closing Progress (Screen 2 of 10)</span>
            <span>20.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '20%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 72 of 200)</span>
            <span>36.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '36.0%' }} />
          </div>
        </div>
      </div>

      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            MODULE 8 • LIVE NEGOTIATION THREAD
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-antiquegold" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Persona Toggler */}
        <div className="bg-white p-1 rounded-xl border border-border flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-mono font-bold text-warmgray px-2 uppercase">{t.viewingAs}</span>
          <button
            onClick={() => setActivePersona('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePersona === 'staff' 
                ? 'bg-royalemerald text-white' 
                : 'text-charcoal hover:bg-alabaster'
            }`}
          >
            {language === 'hi' ? 'स्टाफ ऑपरेटर' : language === 'mr' ? 'कर्मचारी' : 'Staff'}
          </button>
          <button
            onClick={() => setActivePersona('customer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePersona === 'customer' 
                ? 'bg-antiquegold text-white' 
                : 'text-charcoal hover:bg-alabaster'
            }`}
          >
            {language === 'hi' ? 'ग्राहक (पोर्टल)' : language === 'mr' ? 'ग्राहक' : 'Customer'}
          </button>
        </div>
      </div>

      {/* Persistent Price & Mode Header Strip */}
      <div className="bg-white rounded-2xl border border-border shadow-diffuse overflow-hidden text-left">
        <div className="bg-alabaster/40 p-4 border-b border-[#e5dfd4]/40 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Target details */}
          <div className="md:col-span-4 space-y-1">
            <span className="text-[10px] font-mono text-antiquegold font-bold uppercase block">
              {negotiation.quoteId} • {negotiation.buildingName}
            </span>
            <strong className="text-charcoal font-serif text-lg block">{negotiation.customerName}</strong>
          </div>

          {/* Pricing figures */}
          <div className="md:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-center md:text-left">
            <div className="p-2 bg-white rounded-xl border border-[#e5dfd4]/30">
              <span className="text-[8px] font-mono text-warmgray block uppercase">{t.originalPrice}</span>
              <span className="text-charcoal font-mono font-bold text-xs">₹{negotiation.originalPrice.toLocaleString()}</span>
            </div>
            <div className="p-2 bg-royalemerald/5 rounded-xl border border-royalemerald/15">
              <span className="text-[8px] font-mono text-royalemerald block uppercase font-bold">{t.currentPrice}</span>
              <span className="text-royalemerald font-mono font-extrabold text-xs">₹{negotiation.currentOfferPrice.toLocaleString()}</span>
            </div>

            {/* Price Floor & Info (Staff view only) */}
            {activePersona === 'staff' ? (
              <div className="p-2 bg-amber-50 rounded-xl border border-antiquegold/20">
                <span className="text-[8px] font-mono text-antiquegold block uppercase font-bold">{t.targetFloor}</span>
                <span className="text-antiquegold font-mono font-bold text-xs">₹{negotiation.priceFloor.toLocaleString()}</span>
              </div>
            ) : (
              <div className="p-2 bg-white rounded-xl border border-[#e5dfd4]/30 flex items-center justify-center">
                <Badge status="quoted" className="text-[9px] uppercase" />
              </div>
            )}
          </div>

          {/* Mode Badge & Transition Trigger */}
          <div className="md:col-span-3 flex flex-col sm:flex-row md:flex-col justify-center items-end gap-2">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${negotiation.controlMode === 'bot' ? 'bg-success animate-pulse' : 'bg-warning animate-pulse'}`} />
              <span className="text-[10px] font-mono font-bold text-charcoal uppercase">
                {negotiation.controlMode === 'bot' ? t.botMode : t.humanMode}
              </span>
            </div>

            {/* Operator Buttons */}
            {activePersona === 'staff' && (
              negotiation.controlMode === 'bot' ? (
                <button
                  onClick={handleTakeOverControl}
                  className="w-full sm:w-auto px-3 py-1.5 bg-red-50 text-[#B23B3B] hover:bg-red-100 border border-red-200 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{t.takeOverBtn}</span>
                </button>
              ) : (
                <button
                  onClick={handleHandBackToAuto}
                  className="w-full sm:w-auto px-3 py-1.5 bg-emerald-50 text-royalemerald hover:bg-emerald-100 border border-royalemerald/20 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>{t.handBackBtn}</span>
                </button>
              )
            )}
          </div>

        </div>

        {/* Round Counter / SLA Banner (Visible to Staff only) */}
        {activePersona === 'staff' && (
          <div className="p-4 bg-white border-b border-[#e5dfd4]/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="w-4 h-4 text-antiquegold" />
              <span className="text-charcoal font-bold uppercase tracking-wide text-[10px] font-mono bg-alabaster px-2 py-0.5 rounded">
                {t.roundsCount}: {negotiation.roundNumber} / {negotiation.maxRounds}
              </span>
              <span className="text-warmgray">({t.notVisibleToCustomer})</span>
            </div>

            {/* Golden Ascension Line Motif for rounds tracking */}
            <div className="flex-1 max-w-sm">
              <div className="flex justify-between text-[9px] font-mono text-warmgray uppercase mb-1 font-bold">
                <span>{t.roundsSLA}</span>
                <span className={negotiation.roundNumber >= negotiation.maxRounds ? 'text-error font-extrabold' : 'text-antiquegold'}>
                  {negotiation.roundNumber} of {negotiation.maxRounds} Limits
                </span>
              </div>
              <div className="h-1.5 bg-alabaster rounded-full overflow-hidden border border-neutral-100">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${negotiation.roundNumber >= negotiation.maxRounds ? 'bg-error' : 'bg-antiquegold'}`}
                  style={{ width: `${(negotiation.roundNumber / negotiation.maxRounds) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main split work area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chat Thread Container */}
        <div className="lg:col-span-8 flex flex-col h-[520px] bg-white rounded-2xl border border-border shadow-diffuse overflow-hidden">
          
          {/* Top Chat status block */}
          <div className="p-3 bg-alabaster border-b border-border flex items-center justify-between text-[10px] font-mono text-warmgray font-bold">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-royalemerald" />
              <span>{t.complianceDND}</span>
            </div>
            <div>
              <span>SLA RESPONSE TIME: &lt; 2 MIN</span>
            </div>
          </div>

          {/* Messages Timeline */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-alabaster/30">
            {negotiation.messages.map((msg) => {
              const isClient = msg.senderType === 'client';
              const isBot = msg.senderType === 'bot';
              const isStaff = msg.senderType === 'human';
              const isSystem = msg.senderType === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="bg-neutral-100 border border-neutral-200/60 px-4 py-1.5 rounded-full text-center max-w-md">
                      <p className="text-[9px] font-mono font-bold text-neutral-600 uppercase tracking-wider">
                        {msg.senderName}
                      </p>
                      <p className="text-[10px] text-neutral-600 font-semibold">{msg.text}</p>
                      <span className="text-[8px] font-mono text-neutral-400 block mt-0.5">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isClient ? 'justify-start' : 'justify-end'} gap-2.5 max-w-[85%] ${
                    isClient ? 'mr-auto' : 'ml-auto'
                  }`}
                >
                  {/* Left-side Profile avatar indicator */}
                  {isClient && (
                    <div className="w-8 h-8 rounded-full bg-antiquegold/10 text-antiquegold border border-antiquegold/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}

                  <div className="space-y-1 text-left">
                    {/* Sender tag */}
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[9px] font-mono font-bold text-charcoal">
                        {msg.senderName}
                      </span>
                      <span className={`text-[8px] font-mono px-1 py-0.2 rounded-sm font-extrabold uppercase ${
                        isClient 
                          ? 'bg-antiquegold/10 text-antiquegold' 
                          : isBot 
                            ? 'bg-emerald-100 text-[#0E4B3D]' 
                            : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {isClient ? t.customerTag : isBot ? t.botTag : t.humanTag}
                      </span>
                    </div>

                    {/* Bubble content */}
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-semibold ${
                      isClient 
                        ? 'bg-white text-charcoal border border-border shadow-xs rounded-tl-none' 
                        : isBot 
                          ? 'bg-royalemerald text-white rounded-tr-none'
                          : 'bg-[#edeae2] text-charcoal border border-[#e5dfd4] rounded-tr-none'
                    }`}>
                      <p>{msg.text}</p>

                      {/* Display Quotation adjustments linked */}
                      {msg.quoteVersion && (
                        <div className={`mt-2 p-2 rounded-lg text-[10px] flex items-center gap-1.5 ${
                          isBot ? 'bg-black/15 text-white' : 'bg-white/50 text-charcoal'
                        }`}>
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <div>
                            <span className="font-bold">LOCK VERSION:</span> {negotiation.quoteId}-{msg.quoteVersion}
                            <span className="block font-mono font-extrabold">PRICE: ₹{msg.adjustedPrice?.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      {/* Time and read receipts status */}
                      <div className="flex justify-end items-center gap-1 mt-1 text-[8px] opacity-75 font-mono">
                        <span>{msg.timestamp}</span>
                        {isClient && msg.status === 'read' && (
                          <CheckCheck className="w-3.5 h-3.5 text-royalemerald shrink-0" />
                        )}
                        {isClient && msg.status === 'delivered' && (
                          <Check className="w-3.5 h-3.5 text-warmgray shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right-side Bot/Staff avatar indicator */}
                  {!isClient && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                      isBot 
                        ? 'bg-royalemerald/10 text-royalemerald border-royalemerald/25' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                  )}

                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Composer Container */}
          <div className="p-3.5 bg-white border-t border-border space-y-2">
            
            {/* Warning indicator if bot is active and staff starts typing */}
            {activePersona === 'staff' && negotiation.controlMode === 'bot' && composerText.trim() && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[10px] text-[#B23B3B] font-semibold flex items-start gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{t.composerWarning}</p>
              </div>
            )}

            {/* Quick reply templates */}
            {activePersona === 'staff' && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                {QUICK_REPLIES.map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStaffSendMessage(text)}
                    className="px-2.5 py-1 bg-alabaster border border-[#e5dfd4] hover:bg-[#edeae2] text-charcoal rounded-full text-[9px] font-semibold tracking-wide whitespace-nowrap transition-all"
                  >
                    💡 {text.slice(0, 42)}...
                  </button>
                ))}
              </div>
            )}

            {/* Typing bar */}
            <div className="flex items-center gap-2">
              <button 
                className="p-2 hover:bg-alabaster rounded-xl text-warmgray border border-transparent hover:border-border"
                title="Attach Document/PDF"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              
              <input
                type="text"
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (activePersona === 'staff') {
                      handleStaffSendMessage();
                    } else {
                      // Trigger customer simulation
                      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      setNegotiation(prev => ({
                        ...prev,
                        messages: [
                          ...prev.messages,
                          {
                            id: `msg-sim-${Date.now()}`,
                            senderType: 'client',
                            senderName: 'Karan',
                            text: composerText,
                            timestamp,
                            status: 'read'
                          }
                        ]
                      }));
                      setComposerText('');
                    }
                  }
                }}
                placeholder={activePersona === 'staff' ? t.composerPlaceholder : "Reply as Customer..."}
                className="flex-1 p-2.5 rounded-xl bg-alabaster border border-[#e5dfd4] text-xs text-charcoal focus:outline-none focus:border-antiquegold transition-all"
              />

              <Button
                variant={activePersona === 'staff' ? 'emerald' : 'primary'}
                onClick={() => {
                  if (activePersona === 'staff') {
                    handleStaffSendMessage();
                  } else {
                    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    setNegotiation(prev => ({
                      ...prev,
                      messages: [
                        ...prev.messages,
                        {
                          id: `msg-sim-${Date.now()}`,
                          senderType: 'client',
                          senderName: 'Karan',
                          text: composerText,
                          timestamp,
                          status: 'read'
                        }
                      ]
                    }));
                    setComposerText('');
                  }
                }}
                className="py-2.5 px-4 text-xs font-bold"
              >
                <span>{t.sendBtn}</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

        </div>

        {/* Sidebar: Interactive Simulator Control Panel */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Customer simulator widget */}
          <Card className="p-5 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4] pb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-antiquegold" />
              <h3 className="font-serif text-base font-black text-charcoal">{t.simulateCustomerSection}</h3>
            </div>

            <p className="text-[10px] text-warmgray font-semibold leading-relaxed">
              {t.simulateDesc}
            </p>

            <form onSubmit={handleSimulateCustomerSend} className="space-y-4 text-xs font-semibold">
              
              {/* Option A: Customer Proposes a Price */}
              <div className="p-3.5 bg-alabaster rounded-xl border border-[#e5dfd4]/40 space-y-2">
                <label className="text-[9px] font-mono text-warmgray uppercase block font-bold">
                  Propose Counter-Offer (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-mono text-warmgray text-xs">₹</span>
                  <input 
                    type="text"
                    value={customerOfferInput}
                    onChange={(e) => setCustomerOfferInput(e.target.value)}
                    placeholder="e.g. 1100000"
                    className="w-full pl-6 p-2.5 bg-white border border-[#e5dfd4] rounded-lg text-charcoal font-mono text-xs"
                  />
                </div>
                <span className="text-[8px] text-warmgray font-medium leading-normal block mt-1">
                  💡 Below floor ₹{negotiation.priceFloor.toLocaleString()} will cause the bot to politely counter with free AMC. At or above, the bot accepts!
                </span>
              </div>

              {/* Option B: Customer Messages text */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-warmgray uppercase block font-bold">
                  Or Simulate Conversational Reply
                </label>
                <textarea
                  value={customerMessageInput}
                  onChange={(e) => setCustomerMessageInput(e.target.value)}
                  placeholder="e.g., Is delivery and structural site AMC free?"
                  rows={2}
                  className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl text-charcoal text-xs"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="py-2.5 text-xs font-bold"
              >
                <span>Simulate Customer Reply</span>
              </Button>
            </form>

            <div className="border-t border-[#e5dfd4]/40 pt-4">
              <Button
                onClick={handleSimulateInactivity}
                variant="outline"
                fullWidth
                className="py-2.5 text-xs font-bold"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t.staleBtn}</span>
              </Button>
            </div>
          </Card>

          {/* Educational Safeguard guidelines */}
          <Card className="p-5 bg-white space-y-3.5">
            <h4 className="font-serif text-sm font-black text-charcoal border-b border-[#e5dfd4]/30 pb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-royalemerald" />
              <span>AIEC Guardrail Governance</span>
            </h4>
            
            <ul className="space-y-2 text-[10px] text-warmgray font-semibold leading-relaxed">
              <li className="flex gap-2 items-start">
                <span className="text-royalemerald font-black mt-0.5">•</span>
                <span>
                  <strong>Strict Price Locks:</strong> No offer below ₹{negotiation.priceFloor.toLocaleString()} can be validated as approved by the automated system under any prompt bypass technique.
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-royalemerald font-black mt-0.5">•</span>
                <span>
                  <strong>Quotation Versions:</strong> Every simulated offer generates sequential database versions synced with the <strong>Version History</strong> module automatically.
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-royalemerald font-black mt-0.5">•</span>
                <span>
                  <strong>Permanent Seizure:</strong> Manual Operator takeover permanently freezes bot responses to ensure 0% response collision with prospects.
                </span>
              </li>
            </ul>
          </Card>

        </div>

      </div>

    </div>
  );
};
