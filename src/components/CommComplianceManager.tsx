import React, { useState, useMemo } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, UserPlus, Search, 
  Trash2, Download, AlertCircle, RefreshCw, CheckCircle, 
  X, HelpCircle, Phone, MessageSquare, Mail, Settings, Ban
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

interface OptOutRecord {
  id: string;
  contactName: string;
  phone: string;
  channel: 'sms' | 'whatsapp' | 'call' | 'all';
  reason: string;
  timestamp: string;
  source: 'customer_reply' | 'manual_admin' | 'dnd_gateway' | 'ivr_optout';
  status: 'active' | 'revoked';
}

export const CommComplianceManager: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();

  // Multi-language translation support
  const t = useMemo(() => {
    const localizations = {
      en: {
        title: "Communication Compliance & Opt-Out Manager",
        subtitle: "Enforce TRAI and DND customer safety policies. Safeguard clients from unsolicited notifications across SMS, WhatsApp, and auto-dialer queues.",
        addManualBtn: "Record Manual Opt-Out",
        exportBtn: "Export Compliance Audit Log",
        searchPlaceholder: "Search by customer name or phone...",
        statusActive: "Active Opt-Out",
        statusRevoked: "Re-consented",
        channelAll: "All Channels Blocked",
        channelSMS: "SMS Blocked Only",
        channelWhatsApp: "WhatsApp Blocked Only",
        channelCall: "Calls Blocked Only",
        addModalTitle: "Manual Opt-Out Registry Form",
        contactNameLabel: "Customer Full Name",
        phoneLabel: "Phone Number (with country code)",
        channelLabel: "Prohibited Channel(s)",
        reasonLabel: "Opt-Out Reason / Context",
        sourceLabel: "Request Channel Source",
        saveBtn: "Commit Opt-Out Rule",
        cancelBtn: "Cancel",
        toastAdded: "Opt-out criteria registered successfully and propagated across system broadcasters.",
        toastRevoked: "Re-consent updated. Permission granted for selected channels.",
        toastExport: "Audit log successfully compiled. Ready to download.",
        emptyState: "No active compliance restrictions found.",
        promotionalTitle: "Regulatory Safety Distinctions",
        promotionalBody: "AIEC platform separates promotional alerts (which strictly honor national DND registers) from transactional notices (such as installation downtime or safety alerts, which are permitted to bypass DND with customer consent).",
        totalRestrictions: "Total Restricted Contacts",
        activeDndLabel: "DND Gateway Verified Rate",
        addPlaceholderName: "e.g. Ramesh Patil",
        addPlaceholderPhone: "e.g. +91 98765 43210",
        addPlaceholderReason: "e.g. Requested verbal exclusion during site survey",
      },
      hi: {
        title: "संचार अनुपालन और ऑप्ट-आउट प्रबंधक",
        subtitle: "टीआरएआई और डीएनडी ग्राहक सुरक्षा नीतियों को लागू करें। ग्राहकों को अवांछित एसएमएस, व्हाट्सएप और कॉल से सुरक्षित रखें।",
        addManualBtn: "मैनुअल ऑप्ट-आउट दर्ज करें",
        exportBtn: "अनुपालन ऑडिट लॉग निर्यात करें",
        searchPlaceholder: "ग्राहक का नाम या फोन से खोजें...",
        statusActive: "सक्रिय ऑप्ट-आउट",
        statusRevoked: "पुनः सहमति दी",
        channelAll: "सभी चैनल ब्लॉक",
        channelSMS: "केवल एसएमएस ब्लॉक",
        channelWhatsApp: "केवल व्हाट्सएप ब्लॉक",
        channelCall: "केवल कॉल ब्लॉक",
        addModalTitle: "मैनुअल ऑप्ट-आउट पंजीकरण फॉर्म",
        contactNameLabel: "ग्राहक का पूरा नाम",
        phoneLabel: "फ़ोन नंबर (देश कोड के साथ)",
        channelLabel: "प्रतिबंधित चैनल",
        reasonLabel: "ऑप्ट-आउट का कारण / संदर्भ",
        sourceLabel: "अनुरोध का माध्यम",
        saveBtn: "ऑप्ट-आउट नियम लागू करें",
        cancelBtn: "रद्द करें",
        toastAdded: "ऑप्ट-आउट मानदंड सफलतापूर्वक दर्ज किए गए और सिस्टम में लागू किए गए।",
        toastRevoked: "पुनः सहमति दर्ज की गई। चयनित चैनलों के लिए अनुमति दी गई।",
        toastExport: "ऑडिट लॉग सफलतापूर्वक तैयार किया गया। डाउनलोड के लिए तैयार है।",
        emptyState: "कोई सक्रिय अनुपालन प्रतिबंध नहीं मिला।",
        promotionalTitle: "नियामक सुरक्षा अंतर",
        promotionalBody: "AIEC प्लेटफॉर्म प्रचारक संदेशों (जो DND का सख्ती से पालन करते हैं) को महत्वपूर्ण लेन-देन संबंधी नोटिस (जैसे लिफ्ट स्थापना या सुरक्षा अलर्ट) से अलग रखता है।",
        totalRestrictions: "कुल प्रतिबंधित संपर्क",
        activeDndLabel: "DND गेटवे सत्यापित दर",
        addPlaceholderName: "जैसे: रमेश पाटिल",
        addPlaceholderPhone: "जैसे: +91 98765 43210",
        addPlaceholderReason: "जैसे: साइट सर्वेक्षण के दौरान मौखिक रूप से बाहर रखने का अनुरोध किया",
      },
      mr: {
        title: "संप्रेषण अनुपालन आणि ऑप्ट-आउट व्यवस्थापक",
        subtitle: "TRAI आणि DND ग्राहक सुरक्षा धोरणे लागू करा. ग्राहकांना नको असलेल्या एसएमएस, व्हॉट्सॲप आणि कॉल्सपासून सुरक्षित ठेवा.",
        addManualBtn: "मॅन्युअल ऑप्ट-आउट नोंदवा",
        exportBtn: "अनुपालन ऑडिट लॉग निर्यात करा",
        searchPlaceholder: "ग्राहकाचे नाव किंवा फोनद्वारे शोधा...",
        statusActive: "सक्रिय ऑप्ट-आउट",
        statusRevoked: "पुन्हा संमती दिली",
        channelAll: "सर्व चॅनेल्स ब्लॉक",
        channelSMS: "फक्त एसएमएस ब्लॉक",
        channelWhatsApp: "फक्त व्हॉट्सॲप ब्लॉक",
        channelCall: "फक्त कॉल ब्लॉक",
        addModalTitle: "मॅन्युअल ऑप्ट-आउट नोंदणी फॉर्म",
        contactNameLabel: "ग्राहकाचे पूर्ण नाव",
        phoneLabel: "फोन नंबर (देश कोडसह)",
        channelLabel: "प्रतिबंधित चॅनेल",
        reasonLabel: "ऑप्ट-आउटचे कारण / संदर्भ",
        sourceLabel: "विनंतीचा मार्ग",
        saveBtn: "ऑप्ट-आउट नियम लागू करा",
        cancelBtn: "रद्द करा",
        toastAdded: "ऑप्ट-आऊट निकष यशस्वीरित्या नोंदवले गेले आहेत आणि सिस्टीममध्ये लागू झाले आहेत.",
        toastRevoked: "पुन्हा संमती दिली गेली. निवडलेल्या चॅनेल्ससाठी परवानगी दिली.",
        toastExport: "ऑडिट लॉग यशस्वीरित्या संकलित केला गेला आहे. डाउनलोडसाठी तयार आहे.",
        emptyState: "कोणतेही सक्रिय अनुपालन निर्बंध आढळले नाहीत.",
        promotionalTitle: "नियामक सुरक्षा फरक",
        promotionalBody: "AIEC प्लॅटफॉर्म जाहिरातविषयक अलर्ट (जे DND चे काटेकोरपणे पालन करतात) आणि व्यवहारविषयक नोटिसेस (जसे की लिफ्ट देखभाल किंवा सुरक्षा सूचना) यांच्यामध्ये स्पष्ट फरक करतो.",
        totalRestrictions: "एकूण प्रतिबंधित संपर्क",
        activeDndLabel: "DND गेटवे सत्यापित दर",
        addPlaceholderName: "उदा. रमेश पाटील",
        addPlaceholderPhone: "उदा. +91 98765 43210",
        addPlaceholderReason: "उदा. साइट सर्वे दरम्यान तोंडी नकार दिला",
      }
    };
    return localizations[language] || localizations.en;
  }, [language]);

  // Pre-seed opt-out data
  const [records, setRecords] = useState<OptOutRecord[]>(() => {
    const saved = localStorage.getItem('aiec_opt_out_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "opt_001",
        contactName: "Ganesh Gaikwad",
        phone: "+91 98230 45678",
        channel: "all",
        reason: "Received STOP text reply during discount broadcast Campaign #12",
        timestamp: "2026-07-09T14:32:00Z",
        source: "customer_reply",
        status: "active"
      },
      {
        id: "opt_002",
        contactName: "Suhas Deshpande",
        phone: "+91 97645 11223",
        channel: "call",
        reason: "Requested no automated calls during surveyor onboarding call",
        timestamp: "2026-07-10T09:15:00Z",
        source: "manual_admin",
        status: "active"
      },
      {
        id: "opt_003",
        contactName: "Anjali Kadam",
        phone: "+91 99887 76655",
        channel: "sms",
        reason: "National DND registry entry detected during pre-dispatch sweep",
        timestamp: "2026-07-11T03:40:00Z",
        source: "dnd_gateway",
        status: "active"
      }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Modal form states
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newChannel, setNewChannel] = useState<'sms' | 'whatsapp' | 'call' | 'all'>('all');
  const [newReason, setNewReason] = useState('');
  const [newSource, setNewSource] = useState<'customer_reply' | 'manual_admin' | 'dnd_gateway' | 'ivr_optout'>('manual_admin');

  // Stats calculation
  const totalRestrictedCount = useMemo(() => {
    return records.filter(r => r.status === 'active').length;
  }, [records]);

  const saveToStorage = (updated: OptOutRecord[]) => {
    setRecords(updated);
    localStorage.setItem('aiec_opt_out_records', JSON.stringify(updated));
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAddOptOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newRecord: OptOutRecord = {
      id: `opt_manual_${Date.now()}`,
      contactName: newName,
      phone: newPhone,
      channel: newChannel,
      reason: newReason || t.addPlaceholderReason,
      timestamp: new Date().toISOString(),
      source: newSource,
      status: 'active'
    };

    const updated = [newRecord, ...records];
    saveToStorage(updated);
    setShowAddModal(false);
    
    // Clear form
    setNewName('');
    setNewPhone('');
    setNewChannel('all');
    setNewReason('');
    setNewSource('manual_admin');

    triggerToast(t.toastAdded);
  };

  const handleToggleConsent = (id: string) => {
    const updated = records.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'active' ? 'revoked' : 'active';
        triggerToast(nextStatus === 'active' ? t.toastAdded : t.toastRevoked);
        return { 
          ...r, 
          status: nextStatus as 'active' | 'revoked',
          timestamp: new Date().toISOString()
        };
      }
      return r;
    });
    saveToStorage(updated);
  };

  const handleExportAudit = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Customer Name,Phone,Restricted Channel,Reason,Timestamp,Source,Status"]
      .concat(records.map(r => `"${r.id}","${r.contactName}","${r.phone}","${r.channel}","${r.reason}","${r.timestamp}","${r.source}","${r.status}"`))
      .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AIEC_Compliance_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(t.toastExport);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const q = searchQuery.toLowerCase();
      return r.contactName.toLowerCase().includes(q) || r.phone.includes(q) || r.reason.toLowerCase().includes(q);
    });
  }, [records, searchQuery]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast alert system */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0E4B3D] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Dual Progress Bar Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Automated Communication Engine Module Progress (Screen 8 of 10)</span>
            <span>80.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '80%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 58 of 200)</span>
            <span>29.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '29%' }} />
          </div>
        </div>
      </div>

      {/* SLA Metric Headroom */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            BULK SCHEDULER ENGINE • MODULE 6 • COMPLIANCE
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2A2723] tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Dynamic progress bar / Ascension Line style */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] flex flex-col justify-center shadow-xs">
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>{t.totalRestrictions}: {totalRestrictedCount}</span>
            <span>Total Restrictions Enforced</span>
          </div>
          <div className="w-56 h-2 bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div
              className="absolute top-0 bottom-0 left-0 bg-royalemerald rounded-full transition-all duration-300"
              style={{ width: `${Math.min((totalRestrictedCount / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI stats blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.12)] flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-charcoal mb-1">
            <span>DND GATEWAY CHECKOUT RATE</span>
            <span>100% SECURE</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-serif font-black text-royalemerald">₹0.00</span>
            <span className="text-xs text-warmgray">Regulatory fine risk</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.12)] flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-charcoal mb-1">
            <span>AUTOMATED EXCLUSION CAP</span>
            <span>REAL-TIME</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-serif font-black text-antiquegold">100%</span>
            <span className="text-xs text-warmgray">Opt-outs auto-enforced</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.12)] flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-charcoal mb-1">
            <span>COMPLIANT BROADCAST COVERAGE</span>
            <span>TRAI APPROVED</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-serif font-black text-charcoal">12,450</span>
            <span className="text-xs text-warmgray">Clean deliveries made</span>
          </div>
        </div>
      </div>

      {/* Main compliance rule warning box */}
      <Card className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-antiquegold shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono">
            {t.promotionalTitle}
          </h4>
          <p className="text-xs text-amber-700 font-semibold">
            {t.promotionalBody}
          </p>
        </div>
      </Card>

      {/* Actions and list controls */}
      <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 w-4 h-4 text-warmgray" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-charcoal focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleExportAudit}
            variant="secondary"
            className="text-xs font-bold py-2.5 px-4 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-warmgray" />
            <span>{t.exportBtn}</span>
          </Button>

          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            className="text-xs font-bold py-2.5 px-4 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addManualBtn}</span>
          </Button>
        </div>
      </div>

      {/* Unified List Anatomy */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <Card className="p-16 text-center space-y-4 bg-white border border-[#e5dfd4]/40">
            <ShieldCheck className="w-12 h-12 text-royalemerald mx-auto stroke-1 animate-pulse" />
            <p className="text-sm text-warmgray font-bold">{t.emptyState}</p>
          </Card>
        ) : (
          filteredRecords.map((item) => {
            const isActive = item.status === 'active';
            
            return (
              <Card
                key={item.id}
                className={`p-4 bg-white transition-all border ${
                  isActive ? 'border-[rgba(184,135,61,0.15)]' : 'border-neutral-200 opacity-60'
                } flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                {/* Left side: Avatar and primary information */}
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-amber-50 text-antiquegold' : 'bg-neutral-50 text-neutral-400'
                  }`}>
                    {item.channel === 'all' ? (
                      <Ban className="w-4 h-4" />
                    ) : item.channel === 'sms' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : item.channel === 'whatsapp' ? (
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-sm font-bold text-charcoal">{item.contactName}</h3>
                      <span className="text-[10px] font-mono font-bold text-warmgray">{item.phone}</span>
                      <Badge className={`text-[8px] font-mono px-2 py-0.5 rounded-full uppercase ${
                        item.source === 'dnd_gateway' ? 'bg-red-50 text-[#B23B3B]' : 'bg-amber-50 text-antiquegold'
                      }`}>
                        {item.source}
                      </Badge>
                    </div>
                    <p className="text-xs text-warmgray font-semibold leading-relaxed">
                      {item.reason}
                    </p>
                    <p className="text-[10px] text-warmgray font-mono">
                      Timestamp: {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Right side: restricted status, toggles */}
                <div className="flex items-center gap-3 shrink-0 justify-end">
                  <div className="text-right">
                    <span className={`block text-xs font-bold uppercase tracking-wider font-mono ${
                      isActive ? 'text-[#B23B3B]' : 'text-royalemerald'
                    }`}>
                      {isActive ? t.statusActive : t.statusRevoked}
                    </span>
                    <span className="block text-[10px] text-warmgray">
                      {item.channel === 'all' ? t.channelAll : item.channel === 'sms' ? t.channelSMS : item.channel === 'whatsapp' ? t.channelWhatsApp : t.channelCall}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleConsent(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      isActive 
                        ? 'border-royalemerald/30 text-royalemerald hover:bg-royalemerald/5' 
                        : 'border-[#B23B3B]/30 text-[#B23B3B] hover:bg-[#B23B3B]/5'
                    }`}
                  >
                    {isActive ? 'Grant Consent' : 'Revoke Consent'}
                  </button>
                </div>

              </Card>
            );
          })
        )}
      </div>

      {/* Manual Add Opt-Out Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal bg-opacity-40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.2)] max-w-lg w-full p-6 space-y-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-warmgray hover:text-charcoal transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal">{t.addModalTitle}</h3>
              <p className="text-xs text-warmgray mt-0.5">Enforce legal safety blocks directly to prevent unauthorized broadcasts.</p>
            </div>

            <form onSubmit={handleAddOptOut} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                  {t.contactNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t.addPlaceholderName}
                  className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-antiquegold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                  {t.phoneLabel}
                </label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder={t.addPlaceholderPhone}
                  className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-antiquegold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                    {t.channelLabel}
                  </label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                  >
                    <option value="all">Block All Channels</option>
                    <option value="sms">Block SMS Only</option>
                    <option value="whatsapp">Block WhatsApp Only</option>
                    <option value="call">Block Automated Calls Only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                    {t.sourceLabel}
                  </label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value as any)}
                    className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                  >
                    <option value="manual_admin">Manual Admin Exclusion</option>
                    <option value="customer_reply">Customer Opt-Out SMS/WA</option>
                    <option value="ivr_optout">IVR Phone Dial Key Exclusion</option>
                    <option value="dnd_gateway">National DND Gateway Sweep</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                  {t.reasonLabel}
                </label>
                <textarea
                  rows={2}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder={t.addPlaceholderReason}
                  className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="secondary"
                  type="button"
                >
                  {t.cancelBtn}
                </Button>
                <Button
                  variant="emerald"
                  type="submit"
                >
                  {t.saveBtn}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
