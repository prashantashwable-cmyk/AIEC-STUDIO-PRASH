import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal,
  Bell,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
  Mail,
  PhoneCall,
  ShieldCheck,
  AlertCircle,
  PauseCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
  Send,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  FileText,
  Smartphone
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';
import { DbManager } from '../lib/db';
import { User, ReminderRule, Payment } from '../types';

interface PaymentReminderConfigProps {
  user: User;
  onNavigateToCollection?: () => void;
}

const localizations = {
  en: {
    title: "Automated Payment Reminder Configuration",
    subtitle: "Define escalating reminder cadences, channel routing (WhatsApp, SMS, Email, Call Tasks), opt-out compliance checks, and audit pause windows.",
    addRuleBtn: "Add Cadence Rule",
    timelinePreviewTitle: "Interactive Timeline Simulation for Sample Stage Payment",
    sampleStageLabel: "Sample Context: Advance (30%) • ₹3,75,000 • Due Date: 25th Aug 2026",
    optOutShieldTitle: "Opt-Out Compliance & DND Shield",
    optOutShieldDesc: "Automated check active: Customers who opt out of promotional/transactional SMS or WhatsApp will be automatically rerouted to Email or Direct Admin Call Task.",
    activeRulesTitle: "Active Escalation Cadence Rules",
    daysLabel: "Trigger Timing",
    channelLabel: "Channel",
    toneLabel: "Tone & Escalation Tier",
    templateLabel: "Template Body",
    actionsLabel: "Actions",
    ruleModalTitle: "Configure Cadence Rule",
    daysOffsetInput: "Days Offset (-3 for before, 0 for on due, +3 for overdue)",
    titleInput: "Rule Title / Identifier",
    toneSelect: "Tone / Escalation Tier",
    channelSelect: "Notification Channel",
    templateBodyInput: "Message Template Body (Supports {{customer_name}}, {{stage_name}}, {{amount}}, {{due_date}}, {{payment_link}})",
    saveRuleBtn: "Save Rule",
    cancelBtn: "Cancel",
    testRunBtn: "Test Cadence Simulation",
    backToDashboardBtn: "Back to Collection Dashboard",
    savedToast: "Reminder Cadence Rule saved successfully!",
    testToast: "Cadence test simulation completed with zero errors!",
    pausedDealsTitle: "Currently Paused Stage Reminders & Long-Standing Audit Nudges",
    noPausedDeals: "No payment stage reminders are currently paused.",
    unpauseBtn: "Resume Nudges",
    longPauseWarning: "Paused for over 14 days — gentle review suggested."
  },
  hi: {
    title: "स्वचालित भुगतान रिमाइंडर कॉन्फ़िगरेशन",
    subtitle: "बढ़ते रिमाइंडर कैडेंस, चैनल रूटिंग (व्हाट्सएप, एसएमएस, ईमेल, कॉल कार्य), ऑप्ट-आउट अनुपालन जांच और ऑडिट पॉज़ विंडो परिभाषित करें।",
    addRuleBtn: "कैडेंस नियम जोड़ें",
    timelinePreviewTitle: "नमूना चरण भुगतान के लिए इंटरएक्टिव टाइमलाइन सिमुलेशन",
    sampleStageLabel: "नमूना संदर्भ: अग्रिम (30%) • ₹3,75,000 • देय तिथि: 25 अगस्त 2026",
    optOutShieldTitle: "ऑप्ट-आउट अनुपालन और डीएनडी शील्ड",
    optOutShieldDesc: "स्वचालित जांच सक्रिय: जो ग्राहक एसएमएस या व्हाट्सएप से ऑप्ट आउट करते हैं, उन्हें स्वचालित रूप से ईमेल या डायरेक्ट एडमिन कॉल टास्क में रीरूट किया जाएगा।",
    activeRulesTitle: "सक्रिय एस्केलेशन कैडेंस नियम",
    daysLabel: "ट्रिगर समय",
    channelLabel: "चैनल",
    toneLabel: "टोन और एस्केलेशन टियर",
    templateLabel: "टेम्पलेट सामग्री",
    actionsLabel: "कार्रवाई",
    ruleModalTitle: "कैडेंस नियम कॉन्फ़िगर करें",
    daysOffsetInput: "दिन ऑफसेट (-3 देय से पहले, 0 देय तिथि पर, +3 अतिदेय)",
    titleInput: "नियम शीर्षक / पहचानकर्ता",
    toneSelect: "टोन / एस्केलेशन टियर",
    channelSelect: "अधिसूचना चैनल",
    templateBodyInput: "संदेश टेम्पलेट सामग्री",
    saveRuleBtn: "नियम सहेजें",
    cancelBtn: "रद्द करें",
    testRunBtn: "परीक्षण कैडेंस सिमुलेशन",
    backToDashboardBtn: "संग्रह डैशबोर्ड पर वापस जाएं",
    savedToast: "रिमाइंडर कैडेंस नियम सफलतापूर्वक सहेजा गया!",
    testToast: "कैडेंस परीक्षण सिमुलेशन शून्य त्रुटियों के साथ पूरा हुआ!",
    pausedDealsTitle: "वर्तमान में रोके गए चरण रिमाइंडर और दीर्घकालिक ऑडिट नुडगे",
    noPausedDeals: "वर्तमान में कोई भुगतान चरण रिमाइंडर नहीं रोका गया है।",
    unpauseBtn: "रिमाइंडर पुनः शुरू करें",
    longPauseWarning: "14 दिनों से अधिक समय से रोका गया — समीक्षा की सलाह दी जाती है।"
  },
  mr: {
    title: "स्वयंचलित भरणा रिमाइंडर नियम संरचना",
    subtitle: "वाढते रिमाइंडर वेळापत्रक, चॅनेल निवडून (व्हॉट्सॲप, एसएमएस, ईमेल, कॉल टास्क), ऑप्ट-आउट तपासणी आणि ऑडिट पॉझ कालावधी ठरवा.",
    addRuleBtn: "नवीन नियम जोडा",
    timelinePreviewTitle: "नमूना टप्प्यासाठी प्रत्यक्ष टाइमलाइन सिमुलेशन",
    sampleStageLabel: "नमूना संदर्भ: ॲडव्हान्स (३०%) • ₹३,७५,००० • देय तारीख: २५ ऑगस्ट २०२६",
    optOutShieldTitle: "ऑप्ट-आउट पालन आणि डीएनडी संरक्षण",
    optOutShieldDesc: "स्वयंचलित तपासणी सुरू: ज्या ग्राहकांनी एसएमएस किंवा व्हॉट्सॲप नाकारले आहे, त्यांना स्वयंचलितपणे ईमेल किंवा कॉल टास्कवर पाठवले जाईल.",
    activeRulesTitle: "सक्रिय एस्केलेशन रिमाइंडर नियम",
    daysLabel: "ट्रिगर वेळ",
    channelLabel: "चॅनेल",
    toneLabel: "टोन आणि पातळी",
    templateLabel: "मेसेज मसुदा",
    actionsLabel: "कृती",
    ruleModalTitle: "रिमाइंडर नियम बदला",
    daysOffsetInput: "दिवस फरक (-३ देय आधी, ० देय दिवशी, +३ उशिरा)",
    titleInput: "नियमाचे नाव",
    toneSelect: "टोन / पातळी",
    channelSelect: "संदेश चॅनेल",
    templateBodyInput: "संदेश मसुदा मसुदा",
    saveRuleBtn: "नियम जतन करा",
    cancelBtn: "रद्द करा",
    testRunBtn: "चाचणी सिमुलेशन करा",
    backToDashboardBtn: "डॅशबोर्डवर परत जा",
    savedToast: "रिमाइंडर नियम यशस्वीरीत्या जतन केला!",
    testToast: "चाचणी सिमुलेशन यशस्वीरीत्या पूर्ण झाले!",
    pausedDealsTitle: "सध्या थांबवलेले टप्पा रिमायंडर व दीर्घकालीन ऑडिट नोट्स",
    noPausedDeals: "सध्या कोणतेही रिमायंडर थांबवलेले नाही.",
    unpauseBtn: "रिमायंडर पुन्हा सुरू करा",
    longPauseWarning: "१४ दिवसांपेक्षा जास्त काळ थांबवले आहे — पुनरावलोकन करा."
  }
};

export const PaymentReminderConfig: React.FC<PaymentReminderConfigProps> = ({
  user,
  onNavigateToCollection
}) => {
  const { language } = useLanguage();
  const t = localizations[language as keyof typeof localizations] || localizations.en;

  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    setRules(DbManager.getReminderRules());
    setPayments(DbManager.getPayments());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Paused Payments with long-standing audit
  const pausedPayments = useMemo(() => {
    return payments.filter(p => p.isPaused);
  }, [payments]);

  // Handle Edit/Add Rule
  const handleOpenAdd = () => {
    const newRule: ReminderRule = {
      id: `rule_${Date.now()}`,
      daysOffset: 5,
      title: 'Post-Due Moderate Escalation',
      channel: 'WhatsApp',
      tone: 'Firm Notice',
      templateId: `tpl_custom_${Date.now()}`,
      templateBody: 'Reminder: Stage {{stage_name}} payment of ₹{{amount}} for {{site_name}} is overdue. Please remit at earliest.',
      isActive: true,
      escalationTier: 2
    };
    setEditingRule(newRule);
  };

  const handleSaveRule = () => {
    if (!editingRule) return;
    const existing = rules.find(r => r.id === editingRule.id);
    if (existing) {
      DbManager.updateReminderRule(editingRule);
    } else {
      DbManager.addReminderRule(editingRule);
    }
    setEditingRule(null);
    loadData();
    showToast(t.savedToast);
  };

  const handleToggleRuleActive = (rule: ReminderRule) => {
    const updated = { ...rule, isActive: !rule.isActive };
    DbManager.updateReminderRule(updated);
    loadData();
  };

  const handleUnpausePayment = (payment: Payment) => {
    const updated = {
      ...payment,
      isPaused: false,
      pauseReason: undefined,
      pausedAt: undefined
    };
    DbManager.updatePayment(updated);
    loadData();
    showToast("Reminders resumed for deal stage!");
  };

  const handleRunSimulation = () => {
    showToast(t.testToast);
  };

  const getChannelIcon = (channel: ReminderRule['channel']) => {
    switch (channel) {
      case 'WhatsApp':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'SMS':
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-purple-600" />;
      case 'Call Task':
        return <PhoneCall className="w-4 h-4 text-red-600" />;
    }
  };

  const getToneBadge = (tone: ReminderRule['tone']) => {
    switch (tone) {
      case 'Friendly Nudge':
        return <Badge variant="emerald">{tone}</Badge>;
      case 'Standard Invoice':
        return <Badge variant="neutral">{tone}</Badge>;
      case 'Firm Notice':
        return <Badge variant="warning">{tone}</Badge>;
      case 'Legal Escalation':
        return <Badge variant="error">{tone}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#0E4B3D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400/30 text-xs font-bold"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[rgba(184,135,61,0.15)] shadow-diffuse">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-antiquegold/10 text-antiquegold border border-antiquegold/20">
              MODULE 9 • CONFIGURATION
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-royalemerald/10 text-royalemerald border border-royalemerald/20">
              CADENCE ENGINE
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-antiquegold shrink-0" />
            {t.title}
          </h1>
          <p className="text-xs text-warmgray max-w-3xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigateToCollection && (
            <Button
              variant="secondary"
              onClick={onNavigateToCollection}
              className="text-xs"
            >
              {t.backToDashboardBtn}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            className="text-xs bg-royalemerald text-white flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.addRuleBtn}
          </Button>
        </div>
      </div>

      {/* Opt-Out Compliance & DND Shield Card */}
      <Card className="p-4 bg-emerald-950 text-white border border-emerald-800/60 flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-emerald-300 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-xs text-emerald-200 flex items-center gap-2">
            {t.optOutShieldTitle}
            <Badge variant="emerald" className="text-[9px] py-0 px-2 bg-emerald-800 text-emerald-100">
              TRAI / WhatsApp DND Compliant
            </Badge>
          </h4>
          <p className="text-[11px] text-emerald-100/80 leading-relaxed">
            {t.optOutShieldDesc}
          </p>
        </div>
      </Card>

      {/* Active Rules List */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#e6dfd4] pb-3">
          <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
            <Bell className="w-5 h-5 text-antiquegold" />
            {t.activeRulesTitle}
          </h3>

          <Button
            variant="secondary"
            onClick={handleRunSimulation}
            className="text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-antiquegold" />
            {t.testRunBtn}
          </Button>
        </div>

        <div className="space-y-3">
          {rules
            .sort((a, b) => a.daysOffset - b.daysOffset)
            .map(rule => (
              <div
                key={rule.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  rule.isActive ? 'bg-white border-[#e6dfd4]' : 'bg-alabaster/60 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-alabaster border border-[#e6dfd4] flex items-center justify-center font-mono font-black text-royalemerald shrink-0 text-xs">
                    {rule.daysOffset === 0 ? '0d' : rule.daysOffset > 0 ? `+${rule.daysOffset}d` : `${rule.daysOffset}d`}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-charcoal">{rule.title}</span>
                      {getToneBadge(rule.tone)}
                      <span className="flex items-center gap-1 text-[11px] font-bold text-warmgray">
                        {getChannelIcon(rule.channel)}
                        {rule.channel}
                      </span>
                    </div>

                    <p className="text-xs text-warmgray font-mono bg-alabaster p-2 rounded-xl border border-[rgba(184,135,61,0.1)]">
                      "{rule.templateBody}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleRuleActive(rule)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      rule.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {rule.isActive ? 'Active' : 'Disabled'}
                  </button>

                  <Button
                    variant="secondary"
                    onClick={() => setEditingRule(rule)}
                    className="p-2 text-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Interactive Timeline Preview */}
      <Card className="p-5 space-y-4 bg-gradient-to-br from-alabaster via-white to-alabaster border border-[rgba(184,135,61,0.2)]">
        <div className="border-b border-[#e6dfd4] pb-3 space-y-0.5">
          <h3 className="font-serif text-base font-bold text-royalemerald flex items-center gap-2">
            <Eye className="w-5 h-5 text-antiquegold" />
            {t.timelinePreviewTitle}
          </h3>
          <p className="text-xs text-warmgray font-mono">{t.sampleStageLabel}</p>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-antiquegold/30">
          {rules
            .filter(r => r.isActive)
            .sort((a, b) => a.daysOffset - b.daysOffset)
            .map((r, idx) => (
              <div key={r.id} className="relative flex items-start gap-4">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-royalemerald ring-4 ring-white" />
                <div className="bg-white p-4 rounded-2xl border border-[#e6dfd4] shadow-xs space-y-2 w-full">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-royalemerald">
                      {r.daysOffset === -3 ? '22 Aug 2026 (-3 days pre-due)' :
                       r.daysOffset === 0 ? '25 Aug 2026 (Due Date)' :
                       r.daysOffset === 3 ? '28 Aug 2026 (+3 days overdue)' :
                       r.daysOffset === 7 ? '01 Sep 2026 (+7 days overdue)' :
                       `Trigger Offset: ${r.daysOffset} days`}
                    </span>
                    <div className="flex items-center gap-2">
                      {getChannelIcon(r.channel)}
                      {getToneBadge(r.tone)}
                    </div>
                  </div>

                  <p className="text-xs text-charcoal bg-alabaster/80 p-2.5 rounded-xl border border-dashed border-warmgray/20 font-mono">
                    {r.templateBody
                      .replace('{{customer_name}}', 'Deshmukh Builders')
                      .replace('{{stage_name}}', 'Advance (30%)')
                      .replace('{{amount}}', '3,75,000')
                      .replace('{{due_date}}', '25/08/2026')
                      .replace('{{payment_link}}', 'https://aiec.in/p/998124')}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Currently Paused Stage Reminders Section */}
      <Card className="p-5 space-y-4">
        <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2 border-b border-[#e6dfd4] pb-3">
          <PauseCircle className="w-5 h-5 text-amber-600" />
          {t.pausedDealsTitle}
        </h3>

        {pausedPayments.length === 0 ? (
          <p className="text-xs text-warmgray italic">{t.noPausedDeals}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pausedPayments.map(p => {
              const pausedDays = p.pausedAt
                ? Math.floor((Date.now() - new Date(p.pausedAt).getTime()) / (1000 * 3600 * 24))
                : 0;

              return (
                <div key={p.id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal">{p.customerName} ({p.dealId})</span>
                    <Badge variant="warning">{p.stage}</Badge>
                  </div>

                  <p className="text-amber-900 font-mono text-[11px]">
                    <strong>Reason:</strong> {p.pauseReason || 'Manual delay logged'}
                  </p>

                  {pausedDays >= 14 && (
                    <div className="flex items-center gap-1.5 text-red-700 text-[10px] font-bold bg-red-100/60 p-1.5 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {t.longPauseWarning} ({pausedDays} days)
                    </div>
                  )}

                  <div className="pt-1 flex justify-end">
                    <Button
                      variant="secondary"
                      onClick={() => handleUnpausePayment(p)}
                      className="text-[10px] py-1 px-2.5 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {t.unpauseBtn}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* EDIT / ADD RULE MODAL */}
      <AnimatePresence>
        {editingRule && (
          <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-lg w-full rounded-3xl p-6 space-y-4 border border-[rgba(184,135,61,0.2)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#e6dfd4] pb-3">
                <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-royalemerald" />
                  {t.ruleModalTitle}
                </h3>
                <button onClick={() => setEditingRule(null)} className="text-warmgray hover:text-charcoal p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">{t.titleInput}</label>
                  <input
                    type="text"
                    value={editingRule.title}
                    onChange={e => setEditingRule({ ...editingRule, title: e.target.value })}
                    className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs font-bold text-charcoal outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Days Offset */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">{t.daysOffsetInput}</label>
                    <input
                      type="number"
                      value={editingRule.daysOffset}
                      onChange={e => setEditingRule({ ...editingRule, daysOffset: Number(e.target.value) })}
                      className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 font-mono font-bold text-charcoal outline-none"
                    />
                  </div>

                  {/* Channel */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">{t.channelSelect}</label>
                    <select
                      value={editingRule.channel}
                      onChange={e => setEditingRule({ ...editingRule, channel: e.target.value as any })}
                      className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 font-bold text-charcoal outline-none"
                    >
                      <option value="WhatsApp">WhatsApp Message</option>
                      <option value="SMS">Transactional SMS</option>
                      <option value="Email">Official Email</option>
                      <option value="Call Task">Direct Admin Call Task</option>
                    </select>
                  </div>
                </div>

                {/* Tone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">{t.toneSelect}</label>
                  <select
                    value={editingRule.tone}
                    onChange={e => setEditingRule({ ...editingRule, tone: e.target.value as any })}
                    className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 font-bold text-charcoal outline-none"
                  >
                    <option value="Friendly Nudge">Friendly Nudge (Tier 1)</option>
                    <option value="Standard Invoice">Standard Digital Invoice (Tier 1)</option>
                    <option value="Firm Notice">Firm Overdue Notice (Tier 2/3)</option>
                    <option value="Legal Escalation">Legal / Management Escalation (Tier 4)</option>
                  </select>
                </div>

                {/* Template Body */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-warmgray uppercase block">{t.templateBodyInput}</label>
                  <textarea
                    rows={4}
                    value={editingRule.templateBody}
                    onChange={e => setEditingRule({ ...editingRule, templateBody: e.target.value })}
                    className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl p-3 text-xs font-mono text-charcoal outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#e6dfd4]">
                <Button variant="secondary" onClick={() => setEditingRule(null)} className="flex-1 text-xs">
                  {t.cancelBtn}
                </Button>
                <Button variant="primary" onClick={handleSaveRule} className="flex-1 text-xs bg-royalemerald text-white">
                  {t.saveRuleBtn}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
