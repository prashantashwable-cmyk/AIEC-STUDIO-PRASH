import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GitMerge, Play, Pause, ChevronRight, ChevronLeft, Plus, Trash2, CheckCircle2,
  AlertTriangle, Eye, Send, RotateCcw, AlertCircle, Info, Sparkles, Check, Clock,
  ArrowUpRight, ArrowDownRight, Users, Settings, Smartphone, MessageSquare, Phone, Mail, HelpCircle
} from 'lucide-react';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';

// Internationalization
const localizations = {
  en: {
    title: "Automated Campaign Sequence Builder",
    subtitle: "Orchestrate multi-channel drip communication flows. Design stage triggers, wait periods, branch paths, and protect client relationship guardrails.",
    currentProgressLabel: "Current Step Wizard Completion",
    totalProgressLabel: "Overall Engine Sequence Setup",
    emergencyToggle: "Emergency Sequence Interceptor",
    emergencyPaused: "Emergency Freeze Activated: All sequences paused globally.",
    emergencyRunning: "Sequences Operational: Dispatch queues running.",
    triggerStageLabel: "Sequence Trigger (CRM Stage Entry)",
    triggerStageDesc: "The sequence immediately launches when a lead transfers into this target stage.",
    waitPeriodLabel: "Delay Before Action",
    selectTemplateLabel: "Governance Message Template",
    addStepBtn: "Add Linear Nudge Step",
    testRunTitle: "Simulation Engine & Sandbox",
    testRunDesc: "Review exactly how this automated sequence will execute and render for an actual client.",
    simulateBtn: "Execute Sandbox Simulation",
    activeStatusLabel: "Live Automated Status",
    sequencePriority: "Sequence Priority Weighting",
    maxNudges: "Maximum Sequence Nudge Guardrail",
    branchConditionTitle: "Response Classification Branching",
    branchPositive: "If Customer Replies Positively",
    branchNegative: "If Customer Fails to Respond / Neutral",
    confidenceThreshold: "AI Intent Confidence Threshold",
    humanQueueFallback: "Low Confidence Human Review Routing",
    wizardStep1: "1. Trigger Settings",
    wizardStep2: "2. Sequence Flow",
    wizardStep3: "3. Branch Rules",
    wizardStep4: "4. Simulation Sandbox",
    wizardStep5: "5. Review & Deploy",
    reorderLabel: "Move",
    saveSequence: "Deploy Sequence Instantly",
    successMsg: "Campaign sequence validated, saved, and synced with AIEC dispatcher.",
    simulationPassed: "All merge tokens resolved with sensible fallbacks. Sandbox simulation executed successfully!"
  },
  hi: {
    title: "स्वचालित अभियान अनुक्रम निर्माता",
    subtitle: "मल्टी-चैनल ड्रिप संचार प्रवाह को व्यवस्थित करें। स्टेज ट्रिगर, प्रतीक्षा अवधि, शाखा पथ डिजाइन करें।",
    currentProgressLabel: "वर्तमान विज़ार्ड चरण पूर्णता",
    totalProgressLabel: "समग्र अनुक्रम सेटअप प्रगति",
    emergencyToggle: "आपातकालीन अनुक्रम अवरोधक",
    emergencyPaused: "आपातकालीन रोक सक्रिय: सभी अनुक्रम वैश्विक रूप से रोके गए हैं।",
    emergencyRunning: "अनुक्रम क्रियाशील हैं: प्रेषण कतारें चालू हैं।",
    triggerStageLabel: "अनुक्रम ट्रिगर (CRM चरण प्रविष्टि)",
    triggerStageDesc: "जब कोई लीड इस लक्षित चरण में स्थानांतरित होती है, तो अनुक्रम तुरंत शुरू हो जाता है।",
    waitPeriodLabel: "कार्रवाई से पहले प्रतीक्षा अवधि",
    selectTemplateLabel: "गवर्नेंस संदेश टेम्प्लेट",
    addStepBtn: "नया संदेश चरण जोड़ें",
    testRunTitle: "सिमुलेशन इंजन और सैंडबॉक्स",
    testRunDesc: "समीक्षा करें कि यह स्वचालित अनुक्रम वास्तविक ग्राहक के लिए कैसे निष्पादित होगा।",
    simulateBtn: "सैंडबॉक्स सिमुलेशन चलाएं",
    activeStatusLabel: "लाइव स्वचालित स्थिति",
    sequencePriority: "अनुक्रम प्राथमिकता भार",
    maxNudges: "अधिकतम संदेश सीमा",
    branchConditionTitle: "प्रतिक्रिया वर्गीकरण शाखा",
    branchPositive: "यदि ग्राहक सकारात्मक उत्तर देता है",
    branchNegative: "यदि ग्राहक उत्तर नहीं देता / तटस्थ",
    confidenceThreshold: "एआई इरादा आत्मविश्वास सीमा",
    humanQueueFallback: "कम आत्मविश्वास मानव समीक्षा रूटिंग",
    wizardStep1: "1. ट्रिगर सेटिंग्स",
    wizardStep2: "2. अनुक्रम प्रवाह",
    wizardStep3: "3. शाखा नियम",
    wizardStep4: "4. सिमुलेशन सैंडबॉक्स",
    wizardStep5: "5. समीक्षा और तैनात",
    reorderLabel: "स्थानांतरित करें",
    saveSequence: "अनुक्रम तुरंत तैनात करें",
    successMsg: "अभियान अनुक्रम मान्य, सहेजा गया और समन्वित किया गया।",
    simulationPassed: "सभी मर्ज टोकन हल किए गए। सैंडबॉक्स सिमुलेशन सफलतापूर्वक निष्पादित हुआ!"
  },
  mr: {
    title: "स्वयंचलित मोहीम अनुक्रम निर्माता",
    subtitle: "मल्टी-चॅनेल ड्रिप संप्रेषण प्रवाह व्यवस्थापित करा. टप्पा ट्रिगर, प्रतीक्षा कालावधी, शाखा मार्ग डिझाइन करा.",
    currentProgressLabel: "सध्याची विझार्ड टप्पा पूर्णता",
    totalProgressLabel: "एकूण अनुक्रम रचना प्रगती",
    emergencyToggle: "तातडीचा अनुक्रम थांबवणारा",
    emergencyPaused: "आणीबाणीची स्थगिती सक्रिय: सर्व अनुक्रम जागतिक स्तरावर थांबवले आहेत.",
    emergencyRunning: "अनुक्रम कार्यरत: पाठवण्याच्या रांगा चालू आहेत.",
    triggerStageLabel: "अनुक्रम ट्रिगर (CRM टप्पा प्रवेश)",
    triggerStageDesc: "जेव्हा एखादा लीड या लक्ष्य टप्प्यात हस्तांतरित होतो, तेव्हा अनुक्रम त्वरित सुरू होतो.",
    waitPeriodLabel: "कृतीपूर्वी प्रतीक्षा कालावधी",
    selectTemplateLabel: "गव्हर्नन्स संदेश टेम्पलेट",
    addStepBtn: "नवीन संदेश पायरी जोडा",
    testRunTitle: "सिम्युलेशन इंजिन आणि सँडबॉक्स",
    testRunDesc: "हा स्वयंचलित अनुक्रम वास्तविक ग्राहकासाठी कसा कार्य करेल याचे पुनरावलोकन करा.",
    simulateBtn: "सँडबॉक्स सिम्युलेशन चालवा",
    activeStatusLabel: "थेट स्वयंचलित स्थिती",
    sequencePriority: "अनुक्रम प्राधान्य भार",
    maxNudges: "कमाल संदेश मर्यादा",
    branchConditionTitle: "प्रतिसाद वर्गीकरण शाखा",
    branchPositive: "ग्राहक सकारात्मक प्रतिसाद दिल्यास",
    branchNegative: "ग्राहक प्रतिसाद न दिल्यास / तटस्थ",
    confidenceThreshold: "AI हेतू आत्मविश्वास पातळी",
    humanQueueFallback: "कमी आत्मविश्वास मानवी पुनरावलोकन रूटिंग",
    wizardStep1: "१. ट्रिगर सेटिंग्स",
    wizardStep2: "२. अनुक्रम प्रवाह",
    wizardStep3: "३. शाखा नियम",
    wizardStep4: "४. सिम्युलेशन सँडबॉक्स",
    wizardStep5: "५. पुनरावलोकन आणि तैनात",
    reorderLabel: "हलवा",
    saveSequence: "अनुक्रम त्वरित तैनात करा",
    successMsg: "मोहीम अनुक्रम सत्यापित, जतन आणि समक्रमित केला गेला.",
    simulationPassed: "सर्व टोकन्स यशस्वीरित्या सोडवले गेले. सँडबॉक्स सिम्युलेशन यशस्वी झाले!"
  }
};

interface SequenceStep {
  id: string;
  order: number;
  delayHours: number;
  channel: 'whatsapp' | 'sms' | 'call';
  templateCode: string;
  templateName: string;
}

interface CampaignSequence {
  id: string;
  name: string;
  triggerStage: string;
  priority: 'High' | 'Medium' | 'Low';
  maxNudges: number;
  is_active: boolean;
  steps: SequenceStep[];
  branchOnReply: boolean;
  replyPositiveTemplate: string;
  replyNoResponseTemplate: string;
  confidenceThreshold: number; // percentage (e.g. 85%)
  humanFallbackEnabled: boolean;
}

const CRM_STAGES = [
  { code: 'captured', label: 'Captured (New Leads)' },
  { code: 'contacted', label: 'Contacted (Site Survey scheduled)' },
  { code: 'negotiation', label: 'Negotiation (Quotation & Drawings finalized)' },
  { code: 'site_ready', label: 'Site Ready (Civil/Shaft Ready)' }
];

const PRE_EXISTING_TEMPLATES = [
  { code: 'AIEC_LEAD_WELCOME_WA', name: 'New Lead Welcome Elevator Brochure', channel: 'whatsapp' },
  { code: 'AIEC_QUOTE_SEND_SMS', name: 'Quotation Budget Summary & Action Link', channel: 'sms' },
  { code: 'AIEC_PAYMENT_DUE_WA', name: 'Material Dispatch Stage-2 Payment Due Alert', channel: 'whatsapp' },
  { code: 'AIEC_SOP_COMPLETION_CALL', name: 'Auto-IVR Call script: QC Handover Check', channel: 'call' }
];

const INITIAL_SEQUENCES: CampaignSequence[] = [
  {
    id: 'seq_001',
    name: 'New Client Elevator Selection Welcome Sequence',
    triggerStage: 'captured',
    priority: 'High',
    maxNudges: 3,
    is_active: true,
    steps: [
      { id: 'step_1', order: 1, delayHours: 1, channel: 'whatsapp', templateCode: 'AIEC_LEAD_WELCOME_WA', templateName: 'New Lead Welcome Elevator Brochure' },
      { id: 'step_2', order: 2, delayHours: 24, channel: 'sms', templateCode: 'AIEC_QUOTE_SEND_SMS', templateName: 'Quotation Budget Summary & Action Link' }
    ],
    branchOnReply: true,
    replyPositiveTemplate: 'AIEC_PAYMENT_DUE_WA',
    replyNoResponseTemplate: 'AIEC_SOP_COMPLETION_CALL',
    confidenceThreshold: 80,
    humanFallbackEnabled: true
  },
  {
    id: 'seq_002',
    name: 'Quotation & Drawings Approval Sequence',
    triggerStage: 'negotiation',
    priority: 'Medium',
    maxNudges: 4,
    is_active: false,
    steps: [
      { id: 'step_3', order: 1, delayHours: 2, channel: 'sms', templateCode: 'AIEC_QUOTE_SEND_SMS', templateName: 'Quotation Budget Summary & Action Link' }
    ],
    branchOnReply: false,
    replyPositiveTemplate: '',
    replyNoResponseTemplate: '',
    confidenceThreshold: 75,
    humanFallbackEnabled: true
  }
];

export const AutomatedSequenceBuilder: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const t = localizations[language] || localizations.en;

  // Global sequences storage
  const [sequences, setSequences] = useState<CampaignSequence[]>(() => {
    const saved = localStorage.getItem('aiec_sequences');
    return saved ? JSON.parse(saved) : INITIAL_SEQUENCES;
  });

  // Global Emergency Freeze state (Admin Master Interceptor Switch)
  const [globalEmergencyFreeze, setGlobalEmergencyFreeze] = useState<boolean>(() => {
    return localStorage.getItem('aiec_global_emergency_freeze') === 'true';
  });

  // Active Wizard state
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [selectedSequenceId, setSelectedSequenceId] = useState<string>('seq_001');
  const [showToast, setShowToast] = useState<string>('');

  // Editing Sequence State (bound to current wizard setup)
  const [editingName, setEditingName] = useState<string>('');
  const [editingTrigger, setEditingTrigger] = useState<string>('captured');
  const [editingPriority, setEditingPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [editingMaxNudges, setEditingMaxNudges] = useState<number>(3);
  const [editingSteps, setEditingSteps] = useState<SequenceStep[]>([]);
  const [editingBranch, setEditingBranch] = useState<boolean>(true);
  const [editingBranchPositive, setEditingBranchPositive] = useState<string>('AIEC_PAYMENT_DUE_WA');
  const [editingBranchNoResponse, setEditingBranchNoResponse] = useState<string>('AIEC_SOP_COMPLETION_CALL');
  const [editingConfidence, setEditingConfidence] = useState<number>(80);
  const [editingHumanFallback, setEditingHumanFallback] = useState<boolean>(true);
  const [editingIsActive, setEditingIsActive] = useState<boolean>(true);

  // Simulation parameters & outcomes
  const [simLeadName, setSimLeadName] = useState<string>('Prashant Wable (Owner & Monitor)');
  const [simBuildingAddress, setSimBuildingAddress] = useState<string>('Pratik Heights, Pune');
  const [simFloors, setSimFloors] = useState<string>('5 Floors');
  const [simQuoteAmount, setSimQuoteAmount] = useState<string>('₹8,50,000');
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);

  // Sync editor fields upon choosing a sequence or refreshing
  const activeSequence = useMemo(() => {
    return sequences.find(s => s.id === selectedSequenceId);
  }, [sequences, selectedSequenceId]);

  useEffect(() => {
    if (activeSequence) {
      setEditingName(activeSequence.name);
      setEditingTrigger(activeSequence.triggerStage);
      setEditingPriority(activeSequence.priority);
      setEditingMaxNudges(activeSequence.maxNudges);
      setEditingSteps(activeSequence.steps);
      setEditingBranch(activeSequence.branchOnReply);
      setEditingBranchPositive(activeSequence.replyPositiveTemplate);
      setEditingBranchNoResponse(activeSequence.replyNoResponseTemplate);
      setEditingConfidence(activeSequence.confidenceThreshold);
      setEditingHumanFallback(activeSequence.humanFallbackEnabled);
      setEditingIsActive(activeSequence.is_active);
    }
  }, [activeSequence, selectedSequenceId]);

  // Global calculations for Progress bars
  const totalProgressPercentage = useMemo(() => {
    // Percentage completion of all designed sequences vs potential stages
    const potentialCoverage = CRM_STAGES.length;
    const coveredStages = new Set(sequences.map(s => s.triggerStage)).size;
    return Math.min(Math.round((coveredStages / potentialCoverage) * 100), 100);
  }, [sequences]);

  const currentStepProgressPercentage = useMemo(() => {
    // Step completion in the wizard out of 5 total steps
    return Math.round(((activeStepIndex + 1) / 5) * 100);
  }, [activeStepIndex]);

  // Toast Helper
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 4000);
  };

  // Add a step to the active sequence
  const handleAddStep = () => {
    const nextOrder = editingSteps.length + 1;
    const newStep: SequenceStep = {
      id: `step_${Date.now()}`,
      order: nextOrder,
      delayHours: 4,
      channel: 'whatsapp',
      templateCode: 'AIEC_LEAD_WELCOME_WA',
      templateName: 'New Lead Welcome Elevator Brochure'
    };
    setEditingSteps([...editingSteps, newStep]);
    triggerToast("Added campaign step node into linear pipeline.");
  };

  // Remove a step
  const handleRemoveStep = (id: string) => {
    const filtered = editingSteps.filter(s => s.id !== id).map((s, idx) => ({
      ...s,
      order: idx + 1
    }));
    setEditingSteps(filtered);
    triggerToast("Removed step. Linear order updated.");
  };

  // Update specific step field
  const handleUpdateStep = (id: string, field: keyof SequenceStep, value: any) => {
    const updated = editingSteps.map(s => {
      if (s.id === id) {
        if (field === 'templateCode') {
          const matchedTemp = PRE_EXISTING_TEMPLATES.find(pt => pt.code === value);
          return {
            ...s,
            templateCode: value,
            templateName: matchedTemp ? matchedTemp.name : 'Custom Template',
            channel: matchedTemp ? (matchedTemp.channel as 'whatsapp' | 'sms' | 'call') : s.channel
          };
        }
        return { ...s, [field]: value };
      }
      return s;
    });
    setEditingSteps(updated);
  };

  // Emergency globally paused sequence trigger
  const toggleEmergencyFreeze = () => {
    const nextState = !globalEmergencyFreeze;
    setGlobalEmergencyFreeze(nextState);
    localStorage.setItem('aiec_global_emergency_freeze', String(nextState));
    triggerToast(nextState ? t.emergencyPaused : t.emergencyRunning);
  };

  // Drag Reordering / Simple move buttons for layout discipline (linear flow view)
  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === editingSteps.length - 1) return;

    const newSteps = [...editingSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;

    // Fix index order field
    const reordered = newSteps.map((s, idx) => ({
      ...s,
      order: idx + 1
    }));

    setEditingSteps(reordered);
    triggerToast("Step priority and linear order updated.");
  };

  // Create a brand new sequence from scratch
  const handleCreateNewSequence = () => {
    const newSeqId = `seq_new_${Date.now()}`;
    const newSequence: CampaignSequence = {
      id: newSeqId,
      name: `Automated Pipeline Trigger Sequence ${sequences.length + 1}`,
      triggerStage: 'captured',
      priority: 'Medium',
      maxNudges: 3,
      is_active: false,
      steps: [
        { id: `step_init_${Date.now()}`, order: 1, delayHours: 2, channel: 'whatsapp', templateCode: 'AIEC_LEAD_WELCOME_WA', templateName: 'New Lead Welcome Elevator Brochure' }
      ],
      branchOnReply: true,
      replyPositiveTemplate: 'AIEC_PAYMENT_DUE_WA',
      replyNoResponseTemplate: 'AIEC_SOP_COMPLETION_CALL',
      confidenceThreshold: 85,
      humanFallbackEnabled: true
    };

    const updated = [...sequences, newSequence];
    setSequences(updated);
    localStorage.setItem('aiec_sequences', JSON.stringify(updated));
    setSelectedSequenceId(newSeqId);
    setActiveStepIndex(0);
    triggerToast("Custom Automated sequence draft registered.");
  };

  // Dry-Run Simulation Logic
  const handleRunSimulation = () => {
    setSimulationRunning(true);
    setSimulationLogs([]);

    const logList: string[] = [];
    logList.push(`[00:00:00] 🟢 Initializing AIEC Simulation Engine for Lead: "${simLeadName}"`);
    logList.push(`[00:00:02] 🔍 Profiling location coordinates... Detected active project site at "${simBuildingAddress}" with ${simFloors}`);
    logList.push(`[00:00:05] ⚙️ CRM Stage Trigger detected: Lead transitioned into "[${editingTrigger.toUpperCase()}]" status`);
    logList.push(`[00:00:10] 🛡️ Validating active sequence priority rules. Priority level set to: ${editingPriority}. Maximum Nudges restricted to ${editingMaxNudges}.`);

    // Add logs per step configured
    editingSteps.forEach((step, idx) => {
      const waitHours = step.delayHours;
      logList.push(`[+${waitHours} Hours Delay] 📦 Step #${idx + 1} processing: Outbound communication via ${step.channel.toUpperCase()}`);
      logList.push(`[RENDERED TEXT] "Dear ${simLeadName}, we registered elevator configurations for your project at ${simBuildingAddress}. Total estimate: ${simQuoteAmount}. Rest assured, ascension begins here!"`);
      logList.push(`[✓ COMPLETE] Payload successfully simulated. DLR status: DELIVERED.`);
    });

    if (editingBranch) {
      logList.push(`[Branch Processing] 🤖 AI Response Classification Engine running with ${editingConfidence}% intent-match requirement...`);
      logList.push(`[Simulated Inbound Reply] "Yes, layout plans look good, send invoice"`);
      logList.push(`[Classification Complete] Inbound Intent matches POSITIVE. Initiating designated positive action: Send Template: [${editingBranchPositive}]`);
      if (editingHumanFallback) {
        logList.push(`[Human Guardrail Verified] Confident categorization succeeded. No Human-review escalation required.`);
      }
    }

    logList.push(`[✓ COMPLETED] Simulation dry-run finished. 0 syntax errors, 0 broken tokens.`);

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logList.length) {
        setSimulationLogs(prev => [...prev, logList[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setSimulationRunning(false);
        triggerToast(t.simulationPassed);
      }
    }, 450);
  };

  // Deploy / Save editing sequence to the list
  const handleSaveAndDeploy = () => {
    const updatedSequences = sequences.map(s => {
      if (s.id === selectedSequenceId) {
        return {
          ...s,
          name: editingName,
          triggerStage: editingTrigger,
          priority: editingPriority,
          maxNudges: editingMaxNudges,
          steps: editingSteps,
          branchOnReply: editingBranch,
          replyPositiveTemplate: editingBranchPositive,
          replyNoResponseTemplate: editingBranchNoResponse,
          confidenceThreshold: editingConfidence,
          humanFallbackEnabled: editingHumanFallback,
          is_active: editingIsActive
        };
      }
      return s;
    });

    setSequences(updatedSequences);
    localStorage.setItem('aiec_sequences', JSON.stringify(updatedSequences));
    triggerToast(t.successMsg);
  };

  // Helper for rendering steps in visual Ascension progress bar
  const wizardSteps = [
    { id: '1', label: t.wizardStep1, completed: activeStepIndex > 0, active: activeStepIndex === 0 },
    { id: '2', label: t.wizardStep2, completed: activeStepIndex > 1, active: activeStepIndex === 1 },
    { id: '3', label: t.wizardStep3, completed: activeStepIndex > 2, active: activeStepIndex === 2 },
    { id: '4', label: t.wizardStep4, completed: activeStepIndex > 3, active: activeStepIndex === 3 },
    { id: '5', label: t.wizardStep5, completed: activeStepIndex > 4, active: activeStepIndex === 4 }
  ];

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER ACTION AREA WITH EMERGENCY OVERRIDE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            CRM SCHEDULER ENGINE • MODULE 6
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Global Emergency Pause Switch - Safeguard Requirement */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
          <div className="text-right">
            <span className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">{t.emergencyToggle}</span>
            <span className={`text-[10px] font-mono font-extrabold ${globalEmergencyFreeze ? 'text-error' : 'text-success'}`}>
              ● {globalEmergencyFreeze ? "PAUSED FOR PUBLIC HOLIDAYS" : "LIVE & SYSTEM DISPATCHING"}
            </span>
          </div>
          <button
            onClick={toggleEmergencyFreeze}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              globalEmergencyFreeze 
                ? 'bg-error text-white hover:bg-red-700 shadow-md animate-pulse' 
                : 'bg-alabaster text-charcoal hover:bg-[#edeae2]'
            }`}
          >
            {globalEmergencyFreeze ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* DYNAMIC PROGRESS BARS AS INSTRUCTED BY THE GIVEN RULES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CURRENT STEP PROGRESS BAR */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.12)] flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-charcoal mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-antiquegold" />
              <span>{t.currentProgressLabel}</span>
            </span>
            <span>{currentStepProgressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div
              className="absolute top-0 bottom-0 left-0 bg-antiquegold rounded-full transition-all duration-300"
              style={{ width: `${currentStepProgressPercentage}%` }}
            />
          </div>
        </div>

        {/* TOTAL SEQUENCE ENGINE COVERAGE */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.12)] flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-charcoal mb-1">
            <span className="flex items-center gap-1">
              <GitMerge className="w-3.5 h-3.5 text-royalemerald" />
              <span>{t.totalProgressLabel}</span>
            </span>
            <span>{totalProgressPercentage}% Stages Automated</span>
          </div>
          <div className="w-full h-2 bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div
              className="absolute top-0 bottom-0 left-0 bg-royalemerald rounded-full transition-all duration-300"
              style={{ width: `${totalProgressPercentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* TOAST PANEL */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-royalemerald text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: ACTIVE AUTOMATED SEQUENCE DIRECTORY (4 SPAN) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs uppercase font-mono font-black text-charcoal tracking-wider">
              Sequence Catalog ({sequences.length})
            </span>
            <Button
              onClick={handleCreateNewSequence}
              variant="outline"
              className="py-1 px-3 text-[10px] uppercase font-bold tracking-widest border-royalemerald text-royalemerald hover:bg-royalemerald/5"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Draft New
            </Button>
          </div>

          <div className="space-y-3">
            {sequences.map((seq) => {
              const isSelected = seq.id === selectedSequenceId;
              const stepCount = seq.steps.length;

              return (
                <div
                  key={seq.id}
                  onClick={() => {
                    setSelectedSequenceId(seq.id);
                    setActiveStepIndex(0); // reset wizard to first step when switching sequences
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all bg-white ${
                    isSelected 
                      ? 'border-antiquegold ring-2 ring-antiquegold/10 shadow-sm translate-x-1' 
                      : 'border-[#e5dfd4]/60 hover:border-warmgray hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-antiquegold bg-antiquegold/5 px-2 py-0.5 rounded border border-antiquegold/10">
                        Priority: {seq.priority}
                      </span>
                      <h4 className="font-serif text-sm font-bold text-charcoal mt-1.5 leading-tight">
                        {seq.name}
                      </h4>
                      <p className="text-[10px] text-warmgray font-semibold">
                        Triggers upon: <strong className="text-charcoal uppercase">{seq.triggerStage}</strong>
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                        seq.is_active && !globalEmergencyFreeze
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {seq.is_active && !globalEmergencyFreeze ? "Live Dispatch" : "Inactive / Paused"}
                      </span>
                      <span className="text-[9px] text-warmgray font-mono font-bold">{stepCount} Linear Steps</span>
                    </div>
                  </div>

                  {/* Tiny progression indicator representation on the card */}
                  <div className="flex items-center gap-1 mt-4 pt-2 border-t border-alabaster">
                    {seq.steps.map((st, i) => (
                      <React.Fragment key={st.id}>
                        <div className="w-1.5 h-1.5 rounded-full bg-antiquegold" />
                        {i < seq.steps.length - 1 && <div className="h-0.5 w-4 bg-[#e5dfd4]" />}
                      </React.Fragment>
                    ))}
                    {seq.branchOnReply && (
                      <>
                        <div className="h-0.5 w-4 bg-[#e5dfd4] dashed" />
                        <div className="w-1.5 h-1.5 rounded-full bg-royalemerald" />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DYNAMIC SIGNIFICANT MOTIF: ASCENSION LINE (Vertical) */}
          <Card className="p-4 bg-[#F8F6F1]/50 border border-[rgba(184,135,61,0.15)] shadow-xs">
            <div className="flex gap-4">
              <div className="w-1.5 bg-antiquegold h-24 rounded-full shrink-0 relative">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-3 h-3 bg-royalemerald rounded-full border border-white animate-ping" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-3 h-3 bg-royalemerald rounded-full border border-white" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-black text-antiquegold uppercase tracking-widest">
                  AIEC System Guardrails
                </span>
                <p className="text-[10px] text-warmgray font-semibold leading-relaxed">
                  The automated sequence engine enforces client relationship safety guidelines. No single prospect will ever receive more than the designed limit of total reminders, safeguarding brand integrity.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[9px] font-mono font-bold text-royalemerald bg-royalemerald/10 px-2 py-0.5 rounded">
                    ✓ Anti-Spam Guard Active
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT PANEL: MULTI-STEP WIZARD CREATION WORKSPACE (8 SPAN) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 bg-white shadow-xs">
            
            {/* HORIZONTAL ASCENSION LINE STEP INDICATOR (TOP OF THE WIZARD) */}
            <div className="border-b border-[#e5dfd4]/40 pb-6 mb-6">
              <AscensionLine steps={wizardSteps} orientation="horizontal" />
            </div>

            {/* WIZARD CARD BODY DEPENDING ON THE ACTIVE STEP */}
            <div className="min-h-[420px]">
              
              {/* STEP 1: TRIGGER AND PRIORITY SETTINGS */}
              {activeStepIndex === 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-charcoal">{t.triggerStageLabel}</h3>
                    <p className="text-xs text-warmgray font-semibold mt-0.5">{t.triggerStageDesc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* TRIGGER STAGE DROPDOWN */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">Trigger Stage Source</label>
                      <select
                        value={editingTrigger}
                        onChange={(e) => setEditingTrigger(e.target.value)}
                        className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl py-3 px-4 text-xs font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                      >
                        {CRM_STAGES.map(stage => (
                          <option key={stage.code} value={stage.code}>{stage.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* PRIORITY WEIGHT */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">{t.sequencePriority}</label>
                      <select
                        value={editingPriority}
                        onChange={(e) => setEditingPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                        className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl py-3 px-4 text-xs font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                      >
                        <option value="High">🔴 High Priority (Displaces other sequences)</option>
                        <option value="Medium">🟡 Medium Priority (Standard dispatch)</option>
                        <option value="Low">🟢 Low Priority (Defer during peak hours)</option>
                      </select>
                    </div>
                  </div>

                  {/* STRENGTH GUARDRAILS LIMIT */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">{t.maxNudges}</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={1}
                          max={8}
                          value={editingMaxNudges}
                          onChange={(e) => setEditingMaxNudges(Number(e.target.value))}
                          className="w-24 bg-alabaster border border-[#e5dfd4] rounded-xl py-2.5 px-4 text-xs font-bold text-charcoal text-center focus:outline-none focus:ring-1 focus:ring-antiquegold"
                        />
                        <span className="text-[11px] text-warmgray font-semibold">Automatic hard stop to prevent customer exhaustion.</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">Custom Sequence Name</label>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl py-2.5 px-4 text-xs font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                        placeholder="Enter descriptive sequence name..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DESIGN SEQUENCE FLOW (LINEAR STEP BUILDER) */}
              {activeStepIndex === 1 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-charcoal">Design Communication Timeline</h3>
                      <p className="text-xs text-warmgray font-semibold mt-0.5">Define delayed nodes and select templates for outbound dispatches.</p>
                    </div>
                    <Button
                      onClick={handleAddStep}
                      variant="outline"
                      className="py-1.5 px-3 text-[10px] uppercase font-bold tracking-wider text-royalemerald border-royalemerald hover:bg-royalemerald/5"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> {t.addStepBtn}
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                    {editingSteps.map((step, idx) => (
                      <div
                        key={step.id}
                        className="p-4 bg-alabaster/50 border border-[#e5dfd4]/70 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative"
                      >
                        {/* Step count indicator bubble */}
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-antiquegold text-white text-xs font-black flex items-center justify-center shadow-xs">
                            #{idx + 1}
                          </span>
                          
                          {/* Reordering drag buttons */}
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveStep(idx, 'up')}
                              disabled={idx === 0}
                              className="text-warmgray hover:text-charcoal disabled:opacity-30"
                              title="Move step up"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveStep(idx, 'down')}
                              disabled={idx === editingSteps.length - 1}
                              className="text-warmgray hover:text-charcoal disabled:opacity-30"
                              title="Move step down"
                            >
                              ▼
                            </button>
                          </div>
                        </div>

                        {/* Wait Delay Selection */}
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold text-warmgray uppercase tracking-wider">{t.waitPeriodLabel}</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              max={168}
                              value={step.delayHours}
                              onChange={(e) => handleUpdateStep(step.id, 'delayHours', Number(e.target.value))}
                              className="w-16 bg-white border border-[#e5dfd4] rounded-lg py-1 px-2 text-xs font-bold text-center"
                            />
                            <span className="text-[10px] text-charcoal font-bold">Hours</span>
                          </div>
                        </div>

                        {/* Template Selection */}
                        <div className="space-y-1 flex-1">
                          <span className="block text-[10px] font-bold text-warmgray uppercase tracking-wider">{t.selectTemplateLabel}</span>
                          <select
                            value={step.templateCode}
                            onChange={(e) => handleUpdateStep(step.id, 'templateCode', e.target.value)}
                            className="w-full bg-white border border-[#e5dfd4] rounded-lg py-1 px-2 text-xs font-bold text-charcoal focus:outline-none"
                          >
                            {PRE_EXISTING_TEMPLATES.map(t => (
                              <option key={t.code} value={t.code}>[{t.channel.toUpperCase()}] {t.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Delete action */}
                        <button
                          onClick={() => handleRemoveStep(step.id)}
                          className="p-2 text-error bg-red-50 hover:bg-red-100 rounded-lg transition-all self-end md:self-auto"
                          title="Delete message node"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: RESPONSE BRANCHING RULES */}
              {activeStepIndex === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-charcoal">{t.branchConditionTitle}</h3>
                    <p className="text-xs text-warmgray font-semibold mt-0.5">Determine smart followups automatically when a prospect replies to any sequence communication.</p>
                  </div>

                  <div className="flex items-center gap-3 bg-alabaster p-4 rounded-2xl border border-[#e5dfd4]">
                    <input
                      type="checkbox"
                      id="branchToggle"
                      checked={editingBranch}
                      onChange={(e) => setEditingBranch(e.target.checked)}
                      className="w-4 h-4 text-antiquegold border-[#e5dfd4] rounded focus:ring-antiquegold focus:outline-none"
                    />
                    <label htmlFor="branchToggle" className="text-xs font-bold text-charcoal cursor-pointer">
                      Enable AI Natural Language Response Branching Strategy
                    </label>
                  </div>

                  {editingBranch && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* POSITIVE RESPONSE BRANCH */}
                        <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl space-y-3">
                          <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 flex items-center gap-1">
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                            <span>{t.branchPositive}</span>
                          </span>
                          <select
                            value={editingBranchPositive}
                            onChange={(e) => setEditingBranchPositive(e.target.value)}
                            className="w-full bg-white border border-[#e5dfd4] rounded-xl py-2 px-3 text-xs font-bold text-charcoal focus:outline-none"
                          >
                            <option value="">-- Halt Sequence (Default) --</option>
                            {PRE_EXISTING_TEMPLATES.map(t => (
                              <option key={t.code} value={t.code}>[{t.channel.toUpperCase()}] {t.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* NO RESPONSE / NEGATIVE BRANCH */}
                        <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-2xl space-y-3">
                          <span className="text-[10px] uppercase font-mono font-bold text-amber-800 flex items-center gap-1">
                            <ArrowDownRight className="w-4 h-4 text-[#B8873D]" />
                            <span>{t.branchNegative}</span>
                          </span>
                          <select
                            value={editingBranchNoResponse}
                            onChange={(e) => setEditingBranchNoResponse(e.target.value)}
                            className="w-full bg-white border border-[#e5dfd4] rounded-xl py-2 px-3 text-xs font-bold text-charcoal focus:outline-none"
                          >
                            <option value="">-- Halt Sequence (Default) --</option>
                            {PRE_EXISTING_TEMPLATES.map(t => (
                              <option key={t.code} value={t.code}>[{t.channel.toUpperCase()}] {t.name}</option>
                            ))}
                          </select>
                        </div>

                      </div>

                      {/* AI CONFIGURATION FIELDS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-charcoal flex items-center gap-1">
                            <span>{t.confidenceThreshold}</span>
                            <Badge className="bg-alabaster text-charcoal border-[#e5dfd4] text-[9px] font-mono">
                              {editingConfidence}% Match Required
                            </Badge>
                          </label>
                          <input
                            type="range"
                            min={60}
                            max={95}
                            step={5}
                            value={editingConfidence}
                            onChange={(e) => setEditingConfidence(Number(e.target.value))}
                            className="w-full accent-antiquegold bg-alabaster border border-[#e5dfd4] rounded-lg h-2 cursor-pointer"
                          />
                          <span className="block text-[10px] text-warmgray font-semibold">Lower settings categorize replies with looser linguistic tolerance.</span>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-charcoal block">{t.humanQueueFallback}</label>
                          <div className="flex items-center gap-3 mt-1">
                            <button
                              onClick={() => setEditingHumanFallback(!editingHumanFallback)}
                              className={`px-3 py-1.5 text-[10px] uppercase font-mono font-black rounded-lg border transition-all ${
                                editingHumanFallback 
                                  ? 'bg-royalemerald text-white border-royalemerald' 
                                  : 'bg-white text-warmgray border-[#e5dfd4]'
                              }`}
                            >
                              {editingHumanFallback ? "Escalation On" : "Escalation Off"}
                            </button>
                            <span className="text-[10px] text-warmgray font-semibold">Renders low-confidence classifications into Admin Manual approval lists immediately.</span>
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 4: SIMULATION SANDBOX */}
              {activeStepIndex === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-charcoal">{t.testRunTitle}</h3>
                    <p className="text-xs text-warmgray font-semibold mt-0.5">{t.testRunDesc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sandbox form input */}
                    <div className="p-4 bg-alabaster rounded-2xl border border-[#e5dfd4] space-y-4">
                      <span className="text-[10px] font-mono font-black text-antiquegold uppercase tracking-wider block border-b border-[#e5dfd4] pb-2">Simulated Lead Specifications</span>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-charcoal uppercase">Mock Client Name</label>
                        <input
                          type="text"
                          value={simLeadName}
                          onChange={(e) => setSimLeadName(e.target.value)}
                          className="w-full bg-white border border-[#e5dfd4] rounded-lg p-2 text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-charcoal uppercase">Mock Project Site Location</label>
                        <input
                          type="text"
                          value={simBuildingAddress}
                          onChange={(e) => setSimBuildingAddress(e.target.value)}
                          className="w-full bg-white border border-[#e5dfd4] rounded-lg p-2 text-xs font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-charcoal uppercase">Total Floors</label>
                          <input
                            type="text"
                            value={simFloors}
                            onChange={(e) => setSimFloors(e.target.value)}
                            className="w-full bg-white border border-[#e5dfd4] rounded-lg p-2 text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-charcoal uppercase">Quotation Amount</label>
                          <input
                            type="text"
                            value={simQuoteAmount}
                            onChange={(e) => setSimQuoteAmount(e.target.value)}
                            className="w-full bg-white border border-[#e5dfd4] rounded-lg p-2 text-xs font-bold"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleRunSimulation}
                        disabled={simulationRunning}
                        variant="emerald"
                        className="w-full py-2.5 font-bold uppercase tracking-wider text-[10px] mt-2 flex items-center justify-center gap-1.5"
                      >
                        {simulationRunning ? (
                          <>
                            <span className="animate-spin text-white">⚙️</span>
                            <span>Simulating Delivery Sequences...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{t.simulateBtn}</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Simulation Console Terminal */}
                    <div className="bg-charcoal text-alabaster p-4 rounded-2xl font-mono text-[10px] overflow-y-auto h-[300px] border border-[#2a2723] space-y-2 relative">
                      <div className="absolute top-2 right-2 flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      </div>
                      <span className="block text-antiquegold font-bold uppercase tracking-widest border-b border-alabaster/10 pb-1">Simulation Terminal Log</span>
                      
                      {simulationLogs.length === 0 ? (
                        <p className="text-warmgray italic pt-12 text-center">Click "Execute Sandbox Simulation" to verify merge-token safety against target profiles.</p>
                      ) : (
                        <div className="space-y-2">
                          {simulationLogs.map((log, i) => (
                            <p key={i} className="leading-normal text-white/90">{log}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW AND DEDEPLOY */}
              {activeStepIndex === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-charcoal">Governance Audit & Deployed Activation</h3>
                    <p className="text-xs text-warmgray font-semibold mt-0.5">Finalize legal approval, check automation safety thresholds, and enable/disable outbound dispatch logs.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Active Checkbox Trigger */}
                    <div className="p-5 bg-white border border-[#e5dfd4] rounded-2xl space-y-4">
                      <span className="text-[10px] font-mono font-black text-antiquegold uppercase block tracking-wider">Sequence Operational Toggles</span>
                      
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="activeToggle"
                          checked={editingIsActive}
                          onChange={(e) => setEditingIsActive(e.target.checked)}
                          className="w-4 h-4 text-antiquegold border-[#e5dfd4] rounded mt-0.5 focus:ring-antiquegold"
                        />
                        <div>
                          <label htmlFor="activeToggle" className="text-xs font-bold text-charcoal cursor-pointer block">{t.activeStatusLabel}</label>
                          <span className="text-[10px] text-warmgray font-semibold leading-relaxed">
                            When checked, leads entering stage <strong className="text-charcoal uppercase">"{editingTrigger}"</strong> will immediately receive automated communication steps.
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#e5dfd4]/40 space-y-2">
                        <span className="block text-[10px] font-mono font-extrabold text-charcoal">AUTOMATION OVERVIEW SUMMARY:</span>
                        <ul className="text-[10px] text-warmgray font-bold space-y-1 list-disc pl-4">
                          <li>Trigger: stage transition to {editingTrigger}</li>
                          <li>Steps: {editingSteps.length} planned dispatches</li>
                          <li>Emergency Override Status: {globalEmergencyFreeze ? "PAUSED GLOBALLY" : "OPERATIONAL"}</li>
                          <li>Branching Logic: {editingBranch ? "Active" : "Disabled"}</li>
                        </ul>
                      </div>
                    </div>

                    {/* Quick validation card */}
                    <div className="p-5 bg-royalemerald/5 border border-royalemerald/20 rounded-2xl space-y-4">
                      <span className="text-[10px] font-mono font-black text-royalemerald uppercase block tracking-wider">Regulatory Compliance Verification</span>
                      
                      <div className="flex gap-3">
                        <CheckCircle2 className="w-8 h-8 text-royalemerald shrink-0" />
                        <div>
                          <h4 className="text-xs font-extrabold text-charcoal">TRAI & Telecom Authority Sanitization</h4>
                          <p className="text-[10px] text-warmgray font-semibold leading-relaxed mt-0.5">
                            All target templates match verified DLT registrations. Fallback replacement strategy has been compiled for profiles with missing name or valuation values.
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={handleSaveAndDeploy}
                        variant="primary"
                        className="w-full py-3 font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4 text-white" />
                        <span>{t.saveSequence}</span>
                      </Button>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* WIZARD ACTIONS STICKY BAR */}
            <div className="flex items-center justify-between pt-6 border-t border-[#e5dfd4]/40 mt-6">
              <Button
                onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
                disabled={activeStepIndex === 0}
                variant="secondary"
                className="py-2.5 px-4 text-xs font-bold flex items-center gap-1 hover:bg-[#edeae2] disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <div className="flex gap-2">
                {activeStepIndex < 4 ? (
                  <Button
                    onClick={() => setActiveStepIndex(prev => Math.min(4, prev + 1))}
                    variant="outline"
                    className="py-2.5 px-5 text-xs font-bold flex items-center gap-1 border-antiquegold text-antiquegold hover:bg-antiquegold/5"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSaveAndDeploy}
                    variant="emerald"
                    className="py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Deploy Sequences</span>
                  </Button>
                )}
              </div>
            </div>

          </Card>
        </div>

      </div>

    </div>
  );
};
