import React, { useState, useMemo } from 'react';
import { 
  Settings, Sliders, Play, Trash2, Shield, 
  HelpCircle, CheckCircle, AlertTriangle, ArrowRight, 
  User, RefreshCw, Layers, Plus, Power, ToggleLeft, ToggleRight, 
  ArrowUp, ArrowDown, Sparkles, BookOpen, X
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

interface TriggerRule {
  id: string;
  name: string;
  triggerStage: string;
  delayPeriod: string; // e.g., "1 Hour", "2 Days"
  resultingAction: string; // e.g., "Send WhatsApp Catalog", "Auto-dialer Call"
  priority: number; // lower is higher priority
  active: boolean;
  canStack: boolean;
  templateId: string;
}

export const FollowUpStageRules: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();

  const t = useMemo(() => {
    const localizations = {
      en: {
        title: "Follow-Up Stage Trigger Rules",
        subtitle: "Direct the automated communication engine. Establish rules mapping CRM pipeline stage transitions to real-time customer touchpoints.",
        rulesHeader: "Active Stage Trigger Rules Table",
        newRuleBtn: "Create Trigger Rule",
        simulatorHeader: "Lead Lifecycle Trigger Simulator",
        simulatorDesc: "Select hypothetical lead variables to predict exactly which automation flow will execute.",
        ruleName: "Rule Description / Intent",
        triggerCond: "CRM Stage Trigger",
        delayLabel: "Execution Delay",
        actionLabel: "Automation Action Sequence",
        priorityLabel: "Priority",
        activeLabel: "Status",
        simLeadStage: "Hypothetical Lead Stage",
        simLeadDelay: "Time Elapsed in Stage",
        simResultBtn: "Execute Trigger Test",
        toastAdded: "Follow-up trigger rule compiled and added to active pipeline.",
        toastUpdated: "Rule parameters successfully saved.",
        toastDeleted: "Rule deleted. Active sequences updated.",
        deleteConfirm: "Are you sure you want to delete this trigger rule? Deletion will stop active campaigns.",
        simulationMatched: "Simulation Match Success! Trigger rule fired successfully.",
        simulationNoMatch: "Simulation complete. No active rules match this lead state.",
        ruleStackable: "Stack with other matching rules",
        highRiskLabel: "High-Consequence Deactivation",
        highRiskDesc: "Deactivating the primary rule will suspend all automated site-survey bookings.",
        deactivateBtn: "Deactivate Core Trigger Rule"
      },
      hi: {
        title: "फॉलो-अप स्टेज ट्रिगर नियम",
        subtitle: "स्वचालित संचार इंजन को निर्देशित करें। सीआरएम पाइपलाइन स्टेज बदलावों को वास्तविक समय ग्राहक संपर्क से जोड़ने वाले नियम स्थापित करें।",
        rulesHeader: "सक्रिय स्टेज ट्रिगर नियम तालिका",
        newRuleBtn: "नया ट्रिगर नियम बनाएं",
        simulatorHeader: "लीड जीवनचक्र ट्रिगर सिम्युलेटर",
        simulatorDesc: "यह अनुमान लगाने के लिए काल्पनिक लीड चर चुनें कि वास्तव में कौन सा ऑटोमेशन फ्लो चलेगा।",
        ruleName: "नियम विवरण / उद्देश्य",
        triggerCond: "सीआरएम स्टेज ट्रिगर",
        delayLabel: "निष्पादन में देरी",
        actionLabel: "ऑटोमेशन कार्रवाई अनुक्रम",
        priorityLabel: "प्राथमिकता",
        activeLabel: "स्थिति",
        simLeadStage: "काल्पनिक लीड चरण",
        simLeadDelay: "चरण में बीता हुआ समय",
        simResultBtn: "ट्रिगर परीक्षण चलाएं",
        toastAdded: "फॉलो-अप ट्रिगर नियम संकलित और सक्रिय पाइपलाइन में जोड़ा गया।",
        toastUpdated: "नियम पैरामीटर सफलतापूर्वक सहेजे गए।",
        toastDeleted: "नियम हटा दिया गया। सक्रिय अनुक्रम अद्यतन।",
        deleteConfirm: "क्या आप वाकई इस ट्रिगर नियम को हटाना चाहते हैं? हटाने से सक्रिय अभियान रुक जाएंगे।",
        simulationMatched: "सिमुलेशन मैच सफल! ट्रिगर नियम सफलतापूर्वक लागू हुआ।",
        simulationNoMatch: "सिमुलेशन पूरा हुआ। कोई सक्रिय नियम इस लीड स्थिति से मेल नहीं खाता है।",
        ruleStackable: "अन्य मेल खाने वाले नियमों के साथ स्टैक करें",
        highRiskLabel: "उच्च-परिणाम निष्क्रियता चेतावनी",
        highRiskDesc: "प्राथमिक नियम को निष्क्रिय करने से सभी स्वचालित साइट-सर्वेक्षण बुकिंग निलंबित हो जाएगी।",
        deactivateBtn: "कोर ट्रिगर नियम निष्क्रिय करें"
      },
      mr: {
        title: "फॉलो-अप स्टेज ट्रिगर नियम",
        subtitle: "स्वयंचलित संप्रेषण इंजिन निर्देशित करा. CRM पाईपलाईन टप्पा बदलांना थेट ग्राहक संपर्काशी जोडणारे नियम स्थापित करा.",
        rulesHeader: "सक्रिय स्टेज ट्रिगर नियम तालिका",
        newRuleBtn: "नवीन ट्रिगर नियम तयार करा",
        simulatorHeader: "लीड जीवनचक्र ट्रिगर सिम्युलेटर",
        simulatorDesc: "नेमका कोणता ऑटोमेशन फ्लो चालेल याचा अंदाज घेण्यासाठी काल्पनिक लीड व्हेरिएबल्स निवडा.",
        ruleName: "नियम वर्णन / हेतू",
        triggerCond: "CRM स्टेज ट्रिगर",
        delayLabel: "अंमलबजावणी विलंब",
        actionLabel: "ऑटोमेशन कृती अनुक्रम",
        priorityLabel: "प्राधान्य",
        activeLabel: "स्थिती",
        simLeadStage: "काल्पनिक लीड टप्पा",
        simLeadDelay: "टप्प्यात गेलेला वेळ",
        simResultBtn: "ट्रिगर चाचणी चालवा",
        toastAdded: "फॉलो-अप ट्रिगर नियम संकलित आणि सक्रिय पाईपलाईनमध्ये जोडला गेला.",
        toastUpdated: "नियम पॅरामीटर्स यशस्वीरित्या जतन केले.",
        toastDeleted: "नियम हटवला. सक्रिय अनुक्रम अद्यतनित.",
        deleteConfirm: "तुम्हाला नक्की हा ट्रिगर नियम हटवायचा आहे का? हटवल्यास सक्रिय मोहिमा थांबतील.",
        simulationMatched: "सिम्युलेशन मॅच यशस्वी! ट्रिगर नियम यशस्वीरित्या लागू झाला.",
        simulationNoMatch: "सिम्युलेशन पूर्ण झाले. या लीड स्थितीशी कोणताही सक्रिय नियम जुळत नाही.",
        ruleStackable: "इतर जुळणाऱ्या नियमांसह स्टॅक करा",
        highRiskLabel: "उच्च-परिणाम निष्क्रियीकरण चेतावणी",
        highRiskDesc: "प्राथमिक नियम निष्क्रिय केल्याने सर्व स्वयंचलित साइट-सर्वेक्षण बुकिंग निलंबित होईल.",
        deactivateBtn: "मुख्य ट्रिगर नियम निष्क्रिय करा"
      }
    };
    return localizations[language] || localizations.en;
  }, [language]);

  // Pre-seed core rules table
  const [rules, setRules] = useState<TriggerRule[]>(() => {
    const saved = localStorage.getItem('aiec_trigger_rules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "rule_1",
        name: "Onboard New Inbound Lead with Alabaster Series Intro",
        triggerStage: "Lead Capture",
        delayPeriod: "0 Hours (Instant)",
        resultingAction: "Send WhatsApp Alabaster Digital Catalog with video link",
        priority: 1,
        active: true,
        canStack: false,
        templateId: "tpl_whatsapp_catalog"
      },
      {
        id: "rule_2",
        name: "Nudge Lead Following Quotation Dispatch",
        triggerStage: "Quotation Dispatched",
        delayPeriod: "24 Hours",
        resultingAction: "Send Automated SMS asking to schedule layout review",
        priority: 2,
        active: true,
        canStack: false,
        templateId: "tpl_sms_layout_nudge"
      },
      {
        id: "rule_3",
        name: "Follow-up Survey Booking Pending State",
        triggerStage: "Site Survey Scheduled",
        delayPeriod: "2 Hours Before",
        resultingAction: "Send IVR Auto-Dialer Call confirming technician arrival",
        priority: 3,
        active: true,
        canStack: true,
        templateId: "tpl_ivr_survey_confirm"
      },
      {
        id: "rule_4",
        name: "Unresponsive Negotiation Recovery",
        triggerStage: "Negotiation Phase",
        delayPeriod: "3 Days",
        resultingAction: "Send Custom WhatsApp Offer from owner Mr. Prashant",
        priority: 4,
        active: false,
        canStack: false,
        templateId: "tpl_whatsapp_recovery"
      }
    ];
  });

  // State controls
  const [toastMsg, setToastMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New rule form states
  const [ruleName, setRuleName] = useState('');
  const [ruleStage, setRuleStage] = useState('Lead Capture');
  const [ruleDelay, setRuleDelay] = useState('Instant');
  const [ruleAction, setRuleAction] = useState('Send WhatsApp Catalog');
  const [ruleCanStack, setRuleCanStack] = useState(false);

  // Simulation parameters
  const [simStage, setSimStage] = useState('Quotation Dispatched');
  const [simDelay, setSimDelay] = useState('24 Hours');
  const [simResult, setSimResult] = useState<{ matchedRule: TriggerRule | null; evaluated: boolean }>({ matchedRule: null, evaluated: false });

  const saveToStorage = (updated: TriggerRule[]) => {
    setRules(updated);
    localStorage.setItem('aiec_trigger_rules', JSON.stringify(updated));
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Toggle active rule
  const handleToggleRule = (id: string) => {
    const updated = rules.map(r => {
      if (r.id === id) {
        return { ...r, active: !r.active };
      }
      return r;
    });
    saveToStorage(updated);
    triggerToast(t.toastUpdated);
  };

  // Shift Rule Priority
  const handleShiftPriority = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rules.length) return;

    const updated = [...rules];
    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Reassign priority sequential numbers
    const final = updated.map((r, i) => ({ ...r, priority: i + 1 }));
    saveToStorage(final);
    triggerToast(t.toastUpdated);
  };

  // Create rule
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    const newRule: TriggerRule = {
      id: `rule_${Date.now()}`,
      name: ruleName,
      triggerStage: ruleStage,
      delayPeriod: ruleDelay,
      resultingAction: ruleAction,
      priority: rules.length + 1,
      active: true,
      canStack: ruleCanStack,
      templateId: `tpl_gen_${Date.now().toString().slice(-4)}`
    };

    const updated = [...rules, newRule];
    saveToStorage(updated);
    setShowAddModal(false);
    setRuleName('');
    setRuleCanStack(false);
    triggerToast(t.toastAdded);
  };

  // Delete rule Safely
  const handleDeleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id).map((r, i) => ({ ...r, priority: i + 1 }));
    saveToStorage(updated);
    setDeleteConfirmId(null);
    triggerToast(t.toastDeleted);
  };

  // Run lead trigger simulation
  const runSimulation = () => {
    // 1. Filter active rules that match the trigger stage
    const matches = rules.filter(r => r.active && r.triggerStage === simStage);
    
    // 2. Tie-breaker rules: match delay if specified or select the highest priority (lowest priority number)
    if (matches.length > 0) {
      // Sort by priority just in case
      matches.sort((a, b) => a.priority - b.priority);
      setSimResult({ matchedRule: matches[0], evaluated: true });
      triggerToast(t.simulationMatched);
    } else {
      setSimResult({ matchedRule: null, evaluated: true });
      triggerToast(t.simulationNoMatch);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast notifications */}
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
            <span>Automated Communication Engine Module Progress (Screen 9 of 10)</span>
            <span>90.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '90%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 59 of 200)</span>
            <span>29.5%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '29.5%' }} />
          </div>
        </div>
      </div>

      {/* Screen Title & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            CRM ROUTING • MODULE 6 • PIPELINE RULES
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2A2723] tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Ascension Line stylized bar */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] flex flex-col justify-center shadow-xs">
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Stage Trigger Rule Index Coverage</span>
            <span>70% Active</span>
          </div>
          <div className="w-56 h-2 bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-antiquegold to-royalemerald rounded-full transition-all duration-300"
              style={{ width: '70%' }}
            />
          </div>
        </div>
      </div>

      {/* Main Settings Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Active rules and Priority adjustments */}
        <div className="lg:col-span-8 space-y-6">
          
          <Card className="p-6 bg-white space-y-6">
            <div className="flex items-center justify-between border-b border-[rgba(184,135,61,0.15)] pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-antiquegold" />
                <h2 className="font-serif text-lg font-bold text-charcoal">{t.rulesHeader}</h2>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                variant="primary"
                className="text-xs font-bold py-2 px-3.5 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{t.newRuleBtn}</span>
              </Button>
            </div>

            {/* List Row Anatomy matching design system rules */}
            <div className="space-y-4">
              {rules.map((rule, idx) => {
                return (
                  <div 
                    key={rule.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      rule.active 
                        ? 'bg-white border-[rgba(184,135,61,0.15)] hover:shadow-xs' 
                        : 'bg-neutral-50 border-neutral-200 opacity-60'
                    } flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
                  >
                    {/* Left: Priority navigation and details */}
                    <div className="flex items-start gap-3">
                      
                      {/* Priority Shifter control arrows */}
                      <div className="flex flex-col gap-1 items-center shrink-0">
                        <button
                          onClick={() => handleShiftPriority(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded bg-alabaster text-warmgray hover:text-charcoal disabled:opacity-30 transition-all"
                          title="Raise Priority"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-mono font-bold text-charcoal">{rule.priority}</span>
                        <button
                          onClick={() => handleShiftPriority(idx, 'down')}
                          disabled={idx === rules.length - 1}
                          className="p-1 rounded bg-alabaster text-warmgray hover:text-charcoal disabled:opacity-30 transition-all"
                          title="Lower Priority"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Text content details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-sm font-bold text-charcoal">{rule.name}</h4>
                          {rule.canStack && (
                            <Badge className="bg-emerald-50 text-royalemerald text-[8px] font-mono px-1.5 py-0.5 rounded uppercase">
                              Stackable
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-warmgray font-semibold">
                          <span className="bg-alabaster px-2 py-0.5 rounded text-charcoal">{rule.triggerStage}</span>
                          <span className="text-neutral-300">•</span>
                          <span>Delay: <strong className="font-mono text-charcoal">{rule.delayPeriod}</strong></span>
                        </div>

                        <p className="text-xs font-mono font-bold text-antiquegold flex items-center gap-1">
                          <ArrowRight className="w-3.5 h-3.5 inline" />
                          {rule.resultingAction}
                        </p>
                      </div>

                    </div>

                    {/* Right: Toggle controls and actions */}
                    <div className="flex items-center gap-4 shrink-0 justify-end w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                      
                      {/* Toggle status control switch */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-warmgray uppercase tracking-wider">
                          {rule.active ? 'Rule Enabled' : 'Rule Disabled'}
                        </span>
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className="text-antiquegold focus:outline-none transition-all"
                        >
                          {rule.active ? (
                            <ToggleRight className="w-7 h-7 text-royalemerald" />
                          ) : (
                            <ToggleLeft className="w-7 h-7 text-neutral-400" />
                          )}
                        </button>
                      </div>

                      {/* Delete confirmation workflow safety triggers */}
                      {deleteConfirmId === rule.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="bg-[#B23B3B] text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-opacity-90"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[10px] font-bold text-warmgray hover:text-charcoal px-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(rule.id)}
                          className="p-2 text-[#B23B3B]/70 hover:text-[#B23B3B] hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Trigger Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>

            {/* High-Consequence Deactivation Warning box (visual error red treatment) */}
            <div className="p-4 bg-red-50 border border-[#B23B3B]/20 rounded-xl flex items-start justify-between gap-4 mt-6">
              <div className="flex gap-2.5 items-start">
                <AlertTriangle className="w-5 h-5 text-[#B23B3B] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#B23B3B] uppercase tracking-wider font-mono">
                    {t.highRiskLabel}
                  </h4>
                  <p className="text-xs text-[#B23B3B]/80 font-semibold">
                    {t.highRiskDesc}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="text-[10px] bg-white border-[#B23B3B]/30 text-[#B23B3B] hover:bg-red-50 py-1.5 px-3 shrink-0"
                onClick={() => {
                  setRules(prev => prev.map(r => r.id === 'rule_3' ? { ...r, active: false } : r));
                  triggerToast(t.toastUpdated);
                }}
              >
                Deactivate Rule #3
              </Button>
            </div>

          </Card>

        </div>

        {/* Right Side: The Interactive Simulator tool */}
        <div className="lg:col-span-4 space-y-6">
          
          <Card className="p-6 bg-white space-y-6">
            <div className="border-b border-[rgba(184,135,61,0.15)] pb-4">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-royalemerald" />
                <h3 className="font-serif text-lg font-bold text-charcoal">{t.simulatorHeader}</h3>
              </div>
              <p className="text-xs text-warmgray mt-1">
                {t.simulatorDesc}
              </p>
            </div>

            {/* Simulation controls */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-charcoal uppercase tracking-wider font-mono">
                  {t.simLeadStage}
                </label>
                <select
                  value={simStage}
                  onChange={(e) => setSimStage(e.target.value)}
                  className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                >
                  <option value="Lead Capture">Lead Capture (New Sign-Up)</option>
                  <option value="Quotation Dispatched">Quotation Dispatched (Review Phase)</option>
                  <option value="Site Survey Scheduled">Site Survey Scheduled (On-Site Verification)</option>
                  <option value="Negotiation Phase">Negotiation Phase (Discount Discussion)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-charcoal uppercase tracking-wider font-mono">
                  {t.simLeadDelay}
                </label>
                <select
                  value={simDelay}
                  onChange={(e) => setSimDelay(e.target.value)}
                  className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                >
                  <option value="Instant">0 Hours (Instant Dispatch)</option>
                  <option value="24 Hours">24 Hours Elapsed</option>
                  <option value="3 Days">3 Days Unresponsive</option>
                </select>
              </div>

              <Button
                onClick={runSimulation}
                variant="emerald"
                fullWidth
                className="py-3 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4" />
                <span>{t.simResultBtn}</span>
              </Button>
            </div>

            {/* Simulation Result display block */}
            {simResult.evaluated && (
              <div className={`p-4 rounded-xl border ${
                simResult.matchedRule 
                  ? 'bg-emerald-50 border-royalemerald/30 text-royalemerald' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-500'
              } space-y-2.5`}>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                    Evaluation Outcome
                  </span>
                </div>

                {simResult.matchedRule ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-charcoal">
                      Fired: <strong className="font-serif">{simResult.matchedRule.name}</strong>
                    </p>
                    <p className="text-[10px] font-semibold text-warmgray">
                      Priority Rank: #{simResult.matchedRule.priority} • Action: {simResult.matchedRule.resultingAction}
                    </p>
                    <div className="pt-2 text-[10px] text-royalemerald font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 inline" />
                      <span>Rule executed successfully. Message dispatched safely.</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-semibold leading-relaxed">
                    {t.simulationNoMatch}
                  </p>
                )}
              </div>
            )}

          </Card>

        </div>

      </div>

      {/* Add trigger rule Modal form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal bg-opacity-40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.2)] max-w-lg w-full p-6 space-y-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-warmgray hover:text-charcoal transition-all"
            >
              <X className="w-5 h-5 animate-spin-once" />
            </button>

            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal">{t.newRuleBtn}</h3>
              <p className="text-xs text-warmgray mt-0.5">Define CRM transitions and time delay parameters to deploy smart reminders.</p>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                  Rule Name / Description
                </label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Booking confirmation safety notification"
                  className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-antiquegold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                    CRM Trigger Stage
                  </label>
                  <select
                    value={ruleStage}
                    onChange={(e) => setRuleStage(e.target.value)}
                    className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                  >
                    <option value="Lead Capture">Lead Capture</option>
                    <option value="Quotation Dispatched">Quotation Dispatched</option>
                    <option value="Site Survey Scheduled">Site Survey Scheduled</option>
                    <option value="Negotiation Phase">Negotiation Phase</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                    Delay Period
                  </label>
                  <select
                    value={ruleDelay}
                    onChange={(e) => setRuleDelay(e.target.value)}
                    className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                  >
                    <option value="0 Hours (Instant)">0 Hours (Instant)</option>
                    <option value="1 Hour">1 Hour Delay</option>
                    <option value="24 Hours">24 Hours Delay</option>
                    <option value="3 Days">3 Days Delay</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                  Resulting Action Flow
                </label>
                <select
                  value={ruleAction}
                  onChange={(e) => setRuleAction(e.target.value)}
                  className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-bold focus:outline-none"
                >
                  <option value="Send WhatsApp Alabaster Digital Catalog with video link">Send WhatsApp Alabaster Digital Catalog</option>
                  <option value="Send Automated SMS asking to schedule layout review">Send Automated SMS Layout Nudge</option>
                  <option value="Send IVR Auto-Dialer Call confirming technician arrival">Send IVR Auto-Dialer Call Confirm</option>
                  <option value="Send Custom WhatsApp Offer from owner Mr. Prashant">Send Custom WhatsApp Offer</option>
                </select>
              </div>

              <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleCanStack}
                    onChange={(e) => setRuleCanStack(e.target.checked)}
                    className="accent-royalemerald w-4 h-4 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-charcoal block">{t.ruleStackable}</span>
                    <span className="text-[10px] text-warmgray block">Allows this rule to trigger alongside other matched rules.</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="secondary"
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="emerald"
                  type="submit"
                >
                  Create Trigger Rule
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Simple Close Icon mapping
const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
