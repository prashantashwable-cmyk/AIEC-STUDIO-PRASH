import React, { useState, useEffect } from 'react';
import { 
  Inbox, MessageSquare, Phone, Send, Search, CheckCircle, 
  User, UserPlus, AlertCircle, Clock, Check, RefreshCw, 
  Shield, HelpCircle, ChevronRight, BarChart2, Filter, 
  Calendar, PhoneCall, ExternalLink, Sparkles, MessageCircle, AlertTriangle, ArrowRight
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

interface CustomerReplyInboxProps {
  user: any;
}

// Unified Inbox Item Type
interface InboxItem {
  id: string;
  leadId: string;
  customerName: string;
  phone: string;
  channels: ('whatsapp' | 'sms' | 'call')[];
  lastChannel: 'whatsapp' | 'sms' | 'call';
  lastMessage: string;
  receivedAt: string; // ISO String
  slaMinutesLimit: number;
  status: 'pending_human' | 'bot_resolved' | 'handled';
  assignedTo?: string;
  botConfidence?: number;
  escalationReason?: string;
  dealStage: string;
  dealValue?: number;
  conversationHistory: {
    sender: 'customer' | 'bot' | 'agent';
    text: string;
    channel: 'whatsapp' | 'sms' | 'call';
    timestamp: string;
  }[];
}

export const CustomerReplyInbox: React.FC<CustomerReplyInboxProps> = ({ user }) => {
  const { language: appLanguage } = useLanguage(user);

  // Translations
  const t = {
    en: {
      title: 'Unified Customer Reply Inbox',
      subtitle: 'Real-time multi-channel reply engine for SMS, WhatsApp, and call-back requests.',
      moduleProgress: 'Module 6 Progress: Automated Communication Engine',
      currentProgress: 'Current Screen Progress: 70%',
      totalProgress: 'Total Module Progress: 70%',
      tabPending: 'Needs Action (Human)',
      tabBotResolved: 'Bot Handled (Auto)',
      tabHandled: 'Resolved',
      searchPlaceholder: 'Search replies, names or phone numbers...',
      channelAll: 'All Channels',
      channelWhatsApp: 'WhatsApp 💬',
      channelSMS: 'SMS ✉️',
      channelCall: 'Missed Calls 📞',
      unassigned: 'Unassigned',
      assignToMe: 'Assign to Me',
      assignedToLabel: 'Assigned To',
      markHandled: 'Mark Resolved',
      slaStatus: 'SLA Status',
      slaBreached: 'SLA Overdue',
      slaHealthy: 'SLA Healthy',
      slaBusinessHoursNote: 'SLA pauses outside business hours (9:00 AM - 6:00 PM).',
      linkedChannels: 'Linked Contacts',
      quickReply: 'Quick Compliance Reply',
      emptyStateTitle: 'Clean Inbox, Great Job!',
      emptyStateDesc: 'All customer replies have been answered or resolved by the AI Negotiation Bot.',
      backToList: 'Back to List',
      quoteDetails: 'Deal Status',
      leadStageLabel: 'Stage:',
      escalatedReason: 'Escalation Alert',
    },
    hi: {
      title: 'एकीकृत ग्राहक उत्तर इनबॉक्स',
      subtitle: 'एसएमएस, व्हाट्सएप और मिस्ड-कॉल अनुरोधों के लिए वास्तविक समय बहु-चैनल इनबॉक्स।',
      moduleProgress: 'मॉड्यूल 6 प्रगति: स्वचालित संचार इंजन',
      currentProgress: 'वर्तमान स्क्रीन प्रगति: 70%',
      totalProgress: 'कुल मॉड्यूल प्रगति: 70%',
      tabPending: 'कार्रवाई आवश्यक (मानव)',
      tabBotResolved: 'बोट द्वारा हल (स्वचालित)',
      tabHandled: 'सुलझाए गए',
      searchPlaceholder: 'उत्तर, नाम या फोन नंबर खोजें...',
      channelAll: 'सभी चैनल',
      channelWhatsApp: 'व्हाट्सएप 💬',
      channelSMS: 'एसएमएस ✉️',
      channelCall: 'मिस्ड कॉल 📞',
      unassigned: 'असाइन नहीं किया',
      assignToMe: 'मुझे असाइन करें',
      assignedToLabel: 'सौंपा गया:',
      markHandled: 'हल चिह्नित करें',
      slaStatus: 'SLA स्थिति',
      slaBreached: 'SLA विलंबित',
      slaHealthy: 'SLA सुरक्षित',
      slaBusinessHoursNote: 'काम के घंटों (9:00 AM - 6:00 PM) के बाहर SLA रोका जाता है।',
      linkedChannels: 'संबद्ध संपर्क',
      quickReply: 'त्वरित अनुपालन उत्तर',
      emptyStateTitle: 'इनबॉक्स साफ है, बहुत बढ़िया!',
      emptyStateDesc: 'सभी ग्राहक उत्तरों का उत्तर दिया जा चुका है या एआई बोट द्वारा हल किया गया है।',
      backToList: 'सूची पर वापस जाएं',
      quoteDetails: 'डील स्थिति',
      leadStageLabel: 'चरण:',
      escalatedReason: 'एस्केलेशन अलर्ट',
    },
    mr: {
      title: 'एकीकृत ग्राहक उत्तर इनबॉक्स',
      subtitle: 'एसएमएस, व्हॉट्सॲप आणि मिस्ड-कॉल विनंत्यांसाठी रिअल-टाइम मल्टी-चॅनेल इनबॉक्स.',
      moduleProgress: 'मॉड्यूल 6 प्रगती: स्वयंचलित संप्रेषण इंजिन',
      currentProgress: 'चालू स्क्रीन प्रगती: 70%',
      totalProgress: 'एकूण मॉड्यूल प्रगती: 70%',
      tabPending: 'कृती आवश्यक (मानवी)',
      tabBotResolved: 'बोट हाताळलेले (स्वयं)',
      tabHandled: 'निकाली काढलेले',
      searchPlaceholder: 'उत्तरे, नाव किंवा फोन नंबर शोधा...',
      channelAll: 'सर्व चॅनेल',
      channelWhatsApp: 'व्हॉट्सॲप 💬',
      channelSMS: 'एसएमएस ✉️',
      channelCall: 'मिस्ड कॉल्स 📞',
      unassigned: 'नियुक्त नाही',
      assignToMe: 'माझ्याकडे नियुक्त करा',
      assignedToLabel: 'नियुक्त व्यक्ती:',
      markHandled: 'निकाली घोषित करा',
      slaStatus: 'SLA स्थिती',
      slaBreached: 'SLA उल्लंघन',
      slaHealthy: 'SLA निरोगी',
      slaBusinessHoursNote: 'कार्यालयीन वेळेबाहेर (9:00 AM - 6:00 PM) SLA थांबवला जातो.',
      linkedChannels: 'लिंक केलेले संपर्क',
      quickReply: 'त्वरित अनुपालन उत्तर',
      emptyStateTitle: 'इनबॉक्स पूर्णपणे रिकामा आहे!',
      emptyStateDesc: 'सर्व ग्राहकांच्या उत्तरांचे निरसन झाले आहे किंवा एआय निगोशिएशन बोटने यशस्वीरित्या सोडवले आहे.',
      backToList: 'सूचीवर परत जा',
      quoteDetails: 'डील प्रगती',
      leadStageLabel: 'टप्पा:',
      escalatedReason: 'हस्तांतरण अलर्ट',
    }
  };

  const currentLang = (appLanguage === 'hi' || appLanguage === 'mr') ? appLanguage : 'en';
  const labels = t[currentLang];

  // Dummy staff for assignment
  const staffMembers = [
    { name: 'Mr. Prashant Vasant Wable (Owner)', role: 'admin' },
    { name: 'Rajesh Patel', role: 'sales' },
    { name: 'Vikram Shinde', role: 'sales' },
    { name: 'Priya Sharma', role: 'sales' }
  ];

  // Base customer replies data with multi-channel link representation
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([
    {
      id: 'rep-1',
      leadId: 'lead-101',
      customerName: 'Anil Deshmukh (Swaraj Builders)',
      phone: '+91 98230 11223',
      channels: ['whatsapp', 'sms'],
      lastChannel: 'whatsapp',
      lastMessage: 'Safety brakes must conform to EN81. What certificates does your Alabaster Lift have?',
      receivedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
      slaMinutesLimit: 30,
      status: 'pending_human',
      botConfidence: 55,
      escalationReason: 'Safety validation trigger matched',
      dealStage: 'Proposal Phase',
      dealValue: 1450000,
      conversationHistory: [
        { sender: 'customer', text: 'Hi, I received your elevator quotation. Looks interesting.', channel: 'whatsapp', timestamp: '10:15 AM' },
        { sender: 'bot', text: 'Thank you for reviewing Swaraj Builders proposal. Our traction series complies with Maharashtra Lift Rules 2015. How can we configure the cabin spec?', channel: 'whatsapp', timestamp: '10:16 AM' },
        { sender: 'customer', text: 'Safety brakes must conform to EN81. What certificates does your Alabaster Lift have?', channel: 'whatsapp', timestamp: '10:30 AM' }
      ]
    },
    {
      id: 'rep-2',
      leadId: 'lead-102',
      customerName: 'Meera Kulkarni (Vighnaharta Residency)',
      phone: '+91 97654 88321',
      channels: ['whatsapp', 'sms', 'call'],
      lastChannel: 'call',
      lastMessage: 'Requested callback after missed call regarding custom gold-glass cabin finishes.',
      receivedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(), // 50 mins ago (breached)
      slaMinutesLimit: 40,
      status: 'pending_human',
      escalationReason: 'Manual callback requested via IVR',
      dealStage: 'Closed Won (Installation Phase)',
      dealValue: 2400000,
      conversationHistory: [
        { sender: 'customer', text: 'Missed Call recorded from customer.', channel: 'call', timestamp: '09:45 AM' },
        { sender: 'bot', text: 'Automated SMS sent: "We noticed your missed call. Would you like a callback regarding your installation scheduling?"', channel: 'sms', timestamp: '09:46 AM' },
        { sender: 'customer', text: 'Yes, please call back soon. Need to discuss the gold-glass cabin finishes.', channel: 'sms', timestamp: '09:50 AM' }
      ]
    },
    {
      id: 'rep-3',
      leadId: 'lead-103',
      customerName: 'Sanjay Shinde (Elite Heights)',
      phone: '+91 91234 56789',
      channels: ['whatsapp'],
      lastChannel: 'whatsapp',
      lastMessage: 'Is it possible to lock in a 10% discount? I am ready to pay the advance of 5 Lakhs today.',
      receivedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
      slaMinutesLimit: 30,
      status: 'bot_resolved',
      botConfidence: 91,
      dealStage: 'Negotiation Round 2',
      dealValue: 1850000,
      conversationHistory: [
        { sender: 'customer', text: 'Can we get more discount? Your pricing is high.', channel: 'whatsapp', timestamp: '11:00 AM' },
        { sender: 'bot', text: 'Under our configured helpful tone, our pre-approved maximum discount is 10%. We would be glad to secure your order at this tier.', channel: 'whatsapp', timestamp: '11:01 AM' },
        { sender: 'customer', text: 'Is it possible to lock in a 10% discount? I am ready to pay the advance of 5 Lakhs today.', channel: 'whatsapp', timestamp: '11:05 AM' },
        { sender: 'bot', text: 'Excellent choice. I have pre-applied the 10% loyalty discount. We will prepare the formal contract right away.', channel: 'whatsapp', timestamp: '11:06 AM' }
      ]
    },
    {
      id: 'rep-4',
      leadId: 'lead-104',
      customerName: 'Prakash Patil (Lokhandwala Estate)',
      phone: '+91 98900 12345',
      channels: ['sms'],
      lastChannel: 'sms',
      lastMessage: 'The proposal looks fine. Let us meet tomorrow at 11 AM.',
      receivedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      slaMinutesLimit: 60,
      status: 'handled',
      assignedTo: 'Vikram Shinde',
      dealStage: 'Site Survey Complete',
      dealValue: 1200000,
      conversationHistory: [
        { sender: 'customer', text: 'Let us meet tomorrow at 11 AM.', channel: 'sms', timestamp: '09:10 AM' },
        { sender: 'agent', text: 'Sure Prakash ji, Vikram from AIEC will reach your site by 11 AM tomorrow with lift layout blueprints.', channel: 'sms', timestamp: '09:20 AM' }
      ]
    }
  ]);

  // SLA Calculation Rule (Business Hours 9:00 AM to 6:00 PM)
  const calculateRemainingSLA = (receivedAt: string, limitMinutes: number) => {
    const received = new Date(receivedAt);
    const now = new Date();

    // Simplify calculation: count elapsed minutes, ignoring non-business hours (e.g. between 18:00 and 09:00)
    let elapsedMinutes = 0;
    let temp = new Date(received);

    while (temp < now) {
      const hours = temp.getHours();
      // Check if within business hours (9 AM - 6 PM)
      if (hours >= 9 && hours < 18) {
        elapsedMinutes += 1;
      }
      temp.setMinutes(temp.getMinutes() + 1);
    }

    const remaining = limitMinutes - elapsedMinutes;
    return remaining;
  };

  // State managers
  const [activeTab, setActiveTab] = useState<'pending' | 'bot_resolved' | 'handled'>('pending');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<'all' | 'whatsapp' | 'sms' | 'call'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(inboxItems[0]);
  const [replyText, setReplyText] = useState('');
  const [assignee, setAssignee] = useState('');

  // Auto-refresh simulations to simulate live incoming replies
  useEffect(() => {
    const timer = setInterval(() => {
      // Force status update/seconds change for SLA indicators
      setInboxItems(prev => [...prev]);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Filter & Search logic
  const filteredItems = inboxItems.filter(item => {
    // 1. Status Filter
    if (item.status !== activeTab) return false;

    // 2. Channel Filter
    if (selectedChannelFilter !== 'all' && !item.channels.includes(selectedChannelFilter)) return false;

    // 3. Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.customerName.toLowerCase().includes(query) ||
        item.phone.includes(query) ||
        item.lastMessage.toLowerCase().includes(query) ||
        item.dealStage.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Safe Assign to Staff workflow
  const handleAssign = (id: string, staffName: string) => {
    setInboxItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, assignedTo: staffName };
      }
      return item;
    }));
    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, assignedTo: staffName } : null);
    }
  };

  // Safe Mark as Handled / Resolved
  const handleMarkResolved = (id: string) => {
    setInboxItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'handled' };
      }
      return item;
    }));
    setActiveTab('handled');
    const updated = inboxItems.find(i => i.id === id);
    if (updated) {
      setSelectedItem({ ...updated, status: 'handled' });
    }
  };

  // Reply submission
  const sendReply = () => {
    if (!replyText.trim() || !selectedItem) return;

    const newReply = {
      sender: 'agent' as const,
      text: replyText,
      channel: selectedItem.lastChannel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setInboxItems(prev => prev.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          status: 'handled', // Replied automatically satisfies action needed
          lastMessage: replyText,
          conversationHistory: [...item.conversationHistory, newReply]
        };
      }
      return item;
    }));

    // Auto update selected state
    setSelectedItem(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'handled',
        lastMessage: replyText,
        conversationHistory: [...prev.conversationHistory, newReply]
      };
    });

    setReplyText('');
  };

  // Swipe-action triggers on mobile simulator
  const handleSwipeCall = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-8 px-4 sm:px-6 lg:px-8 font-sans text-[#2A2723]">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Progress Tracker Header */}
        <Card className="p-4 bg-white border border-[rgba(184,135,61,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#B8873D]/10 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-antiquegold" />
            </div>
            <div>
              <p className="text-xs font-bold text-warmgray uppercase tracking-wider">{labels.moduleProgress}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-[#2A2723]">{labels.currentProgress}</span>
                <span className="text-xs text-warmgray">•</span>
                <span className="text-sm font-bold text-[#B8873D]">{labels.totalProgress}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 max-w-md bg-alabaster h-3 rounded-full overflow-hidden relative border border-[rgba(184,135,61,0.1)]">
            <div 
              className="bg-gradient-to-r from-antiquegold to-royalemerald h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: '70%' }}
            />
          </div>
        </Card>

        {/* Hero Title Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2A2723] flex items-center gap-2">
              {labels.title}
            </h1>
            <p className="text-sm text-warmgray mt-1 max-w-3xl">
              {labels.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-white border border-[rgba(184,135,61,0.15)] px-3.5 py-2 rounded-xl text-warmgray">
            <Clock className="w-4 h-4 text-antiquegold" />
            {labels.slaBusinessHoursNote}
          </div>
        </div>

        {/* Sticky Filters & Inbox Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Navigation and List Panel (7 columns) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* View / Status tabs */}
            <div className="bg-white p-1 rounded-xl border border-[rgba(184,135,61,0.15)] grid grid-cols-3 gap-1">
              {[
                { id: 'pending', label: labels.tabPending, badge: inboxItems.filter(i => i.status === 'pending').length },
                { id: 'bot_resolved', label: labels.tabBotResolved, badge: inboxItems.filter(i => i.status === 'bot_resolved').length },
                { id: 'handled', label: labels.tabHandled, badge: inboxItems.filter(i => i.status === 'handled').length }
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      // Set first filtered item as selected
                      const found = inboxItems.find(i => i.status === tab.id);
                      setSelectedItem(found || null);
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                      isSelected 
                        ? 'bg-[#0E4B3D] text-white' 
                        : 'text-warmgray hover:text-charcoal hover:bg-alabaster'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Channel & Search Controls */}
            <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-3">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-warmgray" />
                <input
                  type="text"
                  placeholder={labels.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-antiquegold text-[#2A2723]"
                />
              </div>

              {/* Channel Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: labels.channelAll },
                  { id: 'whatsapp', label: labels.channelWhatsApp },
                  { id: 'sms', label: labels.channelSMS },
                  { id: 'call', label: labels.channelCall }
                ].map((chip) => {
                  const isSelected = selectedChannelFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => setSelectedChannelFilter(chip.id as any)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                        isSelected 
                          ? 'bg-alabaster border-antiquegold text-antiquegold border' 
                          : 'bg-white border border-[rgba(184,135,61,0.1)] text-warmgray hover:bg-alabaster'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Row List of conversations */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredItems.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-3">
                  <Inbox className="w-10 h-10 text-warmgray mx-auto" />
                  <h3 className="font-serif text-base font-bold text-[#2A2723]">{labels.emptyStateTitle}</h3>
                  <p className="text-xs text-warmgray max-w-xs mx-auto">{labels.emptyStateDesc}</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const remainingSLA = calculateRemainingSLA(item.receivedAt, item.slaMinutesLimit);
                  const isBreached = remainingSLA <= 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all bg-white relative ${
                        isSelected
                          ? 'border-antiquegold ring-2 ring-antiquegold/10 shadow-xs'
                          : 'border-[rgba(184,135,61,0.1)] hover:border-antiquegold/30 hover:shadow-xs'
                      }`}
                    >
                      
                      {/* Swipe / Quick Actions (Call, Handled) */}
                      <div className="absolute top-4 right-4 flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwipeCall(item.phone);
                          }}
                          className="p-1.5 rounded-lg bg-alabaster text-royalemerald hover:bg-royalemerald hover:text-white transition-all"
                          title="Quick Call back"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        {item.status !== 'handled' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkResolved(item.id);
                            }}
                            className="p-1.5 rounded-lg bg-alabaster text-antiquegold hover:bg-antiquegold hover:text-white transition-all"
                            title="Mark Handled"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Header row details */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-alabaster flex items-center justify-center text-antiquegold">
                          {item.lastChannel === 'whatsapp' ? (
                            <MessageSquare className="w-4 h-4 text-royalemerald" />
                          ) : item.lastChannel === 'sms' ? (
                            <Send className="w-4 h-4 text-antiquegold" />
                          ) : (
                            <Phone className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="pr-12">
                          <h4 className="text-xs font-bold text-[#2A2723] truncate">{item.customerName}</h4>
                          <span className="text-[10px] text-warmgray font-mono">{item.phone}</span>
                        </div>
                      </div>

                      {/* Message preview */}
                      <p className="text-xs text-[#2A2723] mt-2.5 line-clamp-2 bg-alabaster/50 p-2 rounded-lg leading-relaxed">
                        {item.lastMessage}
                      </p>

                      {/* SLA and assignment badges */}
                      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[rgba(184,135,61,0.1)]">
                        
                        {/* SLA Indicator */}
                        {item.status !== 'handled' ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${isBreached ? 'text-[#B23B3B]' : 'text-royalemerald'}`} />
                            <span className={`text-[10px] font-mono font-bold ${
                              isBreached ? 'text-[#B23B3B] bg-red-50 px-2 py-0.5 rounded' : 'text-royalemerald bg-emerald-50 px-2 py-0.5 rounded'
                            }`}>
                              {isBreached 
                                ? `${labels.slaBreached}` 
                                : `${labels.slaHealthy}: ${remainingSLA}m left`
                              }
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-royalemerald flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Resolved
                          </span>
                        )}

                        {/* Assignee Badge */}
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-warmgray" />
                          <span className="text-[10px] font-bold text-warmgray">
                            {item.assignedTo ? item.assignedTo : labels.unassigned}
                          </span>
                        </div>

                      </div>

                      {/* Bot Confidence warning context */}
                      {item.botConfidence !== undefined && item.botConfidence < 65 && (
                        <div className="mt-2 text-[10px] bg-amber-50 text-warning-dark border border-yellow-200 p-1.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-warning" />
                          <span>AI escalation: low confidence ({item.botConfidence}%)</span>
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Detail Pane - The Interactive Conversation & Handoff Screen (7 columns) */}
          <div className="lg:col-span-7">
            {selectedItem ? (
              <Card className="p-6 h-full flex flex-col justify-between bg-white space-y-6">
                
                {/* Contact metadata and assign area */}
                <div>
                  
                  {/* Metadata Header */}
                  <div className="border-b border-[rgba(184,135,61,0.15)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-xl font-bold text-[#2A2723]">{selectedItem.customerName}</h2>
                        {selectedItem.escalationReason && (
                          <span className="bg-[#B23B3B]/10 text-[#B23B3B] text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                            Escalated
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-warmgray font-mono">{selectedItem.phone}</span>
                        <span className="text-xs text-warmgray">•</span>
                        <span className="text-xs text-royalemerald font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          {selectedItem.dealStage}
                        </span>
                        {selectedItem.dealValue && (
                          <span className="text-xs font-mono font-bold text-antiquegold">
                            ₹{(selectedItem.dealValue / 100000).toFixed(1)} Lakhs
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Linked Channels Badge */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-warmgray uppercase tracking-wider block">{labels.linkedChannels}:</span>
                      <div className="flex gap-1">
                        {selectedItem.channels.map(ch => (
                          <span key={ch} className="bg-alabaster p-1.5 rounded text-xs" title={ch}>
                            {ch === 'whatsapp' ? '💬' : ch === 'sms' ? '✉️' : '📞'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Handoff assignment row */}
                  <div className="py-4 bg-alabaster/60 rounded-xl p-4 border border-[rgba(184,135,61,0.1)] mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Handoff selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-warmgray uppercase tracking-wider flex items-center gap-1">
                        <UserPlus className="w-3 h-3 text-antiquegold" />
                        {labels.assignedToLabel}
                      </label>
                      <select
                        value={selectedItem.assignedTo || ''}
                        onChange={(e) => handleAssign(selectedItem.id, e.target.value)}
                        className="w-full bg-white border border-[rgba(184,135,61,0.15)] rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-antiquegold text-[#2A2723]"
                      >
                        <option value="">{labels.unassigned}</option>
                        {staffMembers.map((staff, sIdx) => (
                          <option key={sIdx} value={staff.name}>{staff.name} ({staff.role})</option>
                        ))}
                      </select>
                    </div>

                    {/* Manual handoff button */}
                    <div className="flex items-end gap-2">
                      <Button 
                        variant="secondary" 
                        fullWidth 
                        onClick={() => handleAssign(selectedItem.id, 'Mr. Prashant Vasant Wable (Owner)')}
                      >
                        Assign to Owner (Wable)
                      </Button>
                      {selectedItem.status !== 'handled' && (
                        <Button 
                          variant="emerald" 
                          onClick={() => handleMarkResolved(selectedItem.id)}
                        >
                          {labels.markHandled}
                        </Button>
                      )}
                    </div>

                  </div>

                  {/* High priority escalation reason banner */}
                  {selectedItem.escalationReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-[#B23B3B]/20 rounded-xl flex items-start gap-2 text-xs text-[#B23B3B]">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>{labels.escalatedReason}:</strong> {selectedItem.escalationReason}
                      </div>
                    </div>
                  )}

                  {/* High-fidelity feed representation */}
                  <div className="space-y-4 my-6 max-h-80 overflow-y-auto bg-alabaster/40 p-4 rounded-xl border border-[rgba(184,135,61,0.05)]">
                    {selectedItem.conversationHistory.map((history, hIdx) => {
                      const isCustomer = history.sender === 'customer';
                      const isBot = history.sender === 'bot';

                      return (
                        <div key={hIdx} className={`flex gap-2.5 ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                          
                          {/* Avatar icon */}
                          {isCustomer && (
                            <div className="w-7 h-7 rounded-full bg-charcoal bg-opacity-10 flex items-center justify-center flex-shrink-0 text-charcoal">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          )}

                          <div className={`max-w-[80%] space-y-1`}>
                            <div className={`p-3 rounded-2xl text-xs shadow-xs relative ${
                              isCustomer 
                                ? 'bg-white border border-[rgba(184,135,61,0.15)] text-[#2A2723] rounded-tl-none' 
                                : isBot
                                  ? 'bg-amber-50 border border-amber-200 text-charcoal rounded-tr-none'
                                  : 'bg-[#0E4B3D] text-white rounded-tr-none'
                            }`}>
                              <p className="leading-relaxed">{history.text}</p>
                              
                              {/* Metadata tags */}
                              <div className="mt-2 pt-1.5 border-t border-[rgba(184,135,61,0.05)] flex items-center justify-between gap-2 text-[9px] text-warmgray">
                                <span className="font-mono">Channel: {history.channel.toUpperCase()}</span>
                                {isBot && (
                                  <span className="font-bold text-amber-700 bg-amber-100/50 px-1 rounded uppercase tracking-wider text-[8px]">
                                    🤖 AI Autopilot
                                  </span>
                                )}
                              </div>

                            </div>
                            <span className="text-[9px] text-warmgray block text-right">
                              {history.timestamp}
                            </span>
                          </div>

                          {!isCustomer && (
                            <div className="w-7 h-7 rounded-full bg-[#0E4B3D]/10 flex items-center justify-center flex-shrink-0 text-[#0E4B3D]">
                              {isBot ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Response area */}
                <div className="space-y-3 pt-4 border-t border-[rgba(184,135,61,0.15)]">
                  
                  {/* Quick compliance reply triggers */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-warmgray uppercase tracking-wider block">
                      {labels.quickReply}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Standard Alabaster Specification PDF sent.',
                        'Our technician is scheduled to visit tomorrow.',
                        'Authorized discount validated, let us draft contract.',
                        'Call requested. Dialing phone number now...'
                      ].map((tmpl, tIdx) => (
                        <button
                          key={tIdx}
                          onClick={() => setReplyText(tmpl)}
                          className="text-[11px] bg-alabaster hover:bg-white border border-[rgba(184,135,61,0.1)] hover:border-antiquegold text-[#2A2723] px-2.5 py-1 rounded-lg transition-all text-left"
                        >
                          {tmpl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive field */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type custom compliance response..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                      className="flex-1 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-antiquegold text-[#2A2723]"
                    />
                    <Button variant="emerald" onClick={sendReply}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                </div>

              </Card>
            ) : (
              <div className="h-full flex items-center justify-center p-8 bg-white rounded-2xl border border-[rgba(184,135,61,0.15)]">
                <p className="text-xs text-warmgray">Select a conversation or reply from the left panel to begin reviewing.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
