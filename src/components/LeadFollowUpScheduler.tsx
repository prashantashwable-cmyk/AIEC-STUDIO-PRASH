import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, Clock, User, CheckSquare, Plus, AlertCircle,
  TrendingUp, UserCheck, ArrowRight, Check, X, RefreshCw, ChevronLeft, 
  ChevronRight, CalendarRange, Filter, Search, Edit2, CheckCircle2,
  AlertTriangle, Users, Trash2, ShieldAlert, CheckCircle, Save, Info,
  ExternalLink, Layers, Volume2, PhoneCall, Sparkles, Sliders
} from 'lucide-react';
import { Lead, User as CRMUser } from '../types';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';
import { DbManager } from '../lib/db';

// Multi-lingual translations matching AIEC design system
const localizations = {
  en: {
    title: "Follow-Up Task Scheduler",
    subtitle: "Stage-Based Automation & Human Follow-Up Synchronizer",
    kpiCompletedRate: "Today's Task Completion Progress",
    kpiCoverage: "Total CRM Follow-Up Resolution Coverage",
    overdueWarning: "{count} Follow-up tasks are overdue! Act immediately to prevent lead attrition.",
    reassignAlert: "Staff Member On-Leave Notice: {count} tasks need immediate re-assignment.",
    autoTaskLabel: "System Rule Triggered",
    manualTaskLabel: "Manual Task",
    rescheduleReasonTitle: "Log Reschedule Reason",
    rescheduleReasonPlaceholder: "Select or type reason (e.g. 'Customer Not Reachable', 'Site Dimensions Unready')...",
    bulkActionsTitle: "Bulk Pipeline Operations",
    bulkRescheduleBtn: "Bulk Shift Days (+3 Days)",
    bulkReassignBtn: "Bulk Assign Selected",
    allResolvedSuccess: "Tasks completed successfully! Synchronized lead pipeline stages updated.",
    reassignedSuccess: "Assigned staff member updated.",
    rescheduledSuccess: "Rescheduled task. Reason logged to territory bottleneck audit trail.",
    overdueHeader: "Overdue Follow-Ups 🚨",
    todayHeader: "Today's Scheduled Tasks 📅",
    upcomingHeader: "Future Scheduled Tasks 🔮",
    resolvedHeader: "Completed & Auto-Resolved Tasks ✅",
    agendaView: "Agenda View",
    weekView: "Week View",
    monthView: "Month View",
    noTasksText: "No follow-up tasks scheduled for this period.",
    createTaskTitle: "Schedule New Follow-Up Task",
    taskSubjectLabel: "Task Action / Subject",
    taskSubjectPlaceholder: "e.g. Call to clarify elevator door style selection...",
    relatedLeadLabel: "Select Related Lead Opportunity",
    dueDateLabel: "Follow-Up Due Date",
    assignToLabel: "Assign to Field Surveyor / Officer",
    createTaskBtn: "Schedule Follow-Up Task",
    leaveStatusLabel: "Field Staff Attendance Status",
    markOnLeave: "Mark On-Leave",
    markAvailable: "Mark Active",
    bottlenecksTitle: "Territory Reschedule Bottleneck Analytics",
    syncText: "Completing this task will automatically advance this lead's stage to synchronize CRM automations.",
    leadStageLockedText: "Lead closed won or lost. Related task was automatically resolved to prevent ghost communication.",
    reasonCustomerNotReachable: "Customer not reachable / Switched off",
    reasonSiteNotReady: "Site structure unready for shaft measurements",
    reasonPriceReconsideration: "Client requested delay for budget review",
    reasonBusyFestival: "Busy due to regional festival / holiday",
    leadNameLabel: "Client Name",
    overdueBadge: "OVERDUE",
    completeAction: "Quick Complete",
    rescheduleAction: "Reschedule",
    changeAssignee: "Reassign",
    successAlert: "Action processed successfully!"
  },
  hi: {
    title: "फ़ॉलो-अप कार्य अनुसूचक",
    subtitle: "चरण-आधारित स्वचालन और मानव फ़ॉलो-अप सिंक्रोनाइज़र",
    kpiCompletedRate: "आज का कार्य पूरा होने की प्रगति दर",
    kpiCoverage: "कुल सीआरएम फ़ॉलो-अप समाधान कवरेज दर",
    overdueWarning: "{count} फ़ॉलो-अप कार्य अतिदेय हैं! लीड एट्रिशन को रोकने के लिए तुरंत कार्रवाई करें।",
    reassignAlert: "कर्मचारी छुट्टी पर सूचना: {count} कार्यों को तत्काल पुन: आवंटन की आवश्यकता है।",
    autoTaskLabel: "सिस्टम नियम सक्रिय",
    manualTaskLabel: "मैनुअल कार्य",
    rescheduleReasonTitle: "पुनर्निर्धारण कारण दर्ज करें",
    rescheduleReasonPlaceholder: "कारण चुनें या टाइप करें (जैसे 'ग्राहक संपर्क योग्य नहीं', 'साइट माप अनुपलब्ध')...",
    bulkActionsTitle: "थोक पाइपलाइन संचालन",
    bulkRescheduleBtn: "थोक तिथि बढ़ाएं (+3 दिन)",
    bulkReassignBtn: "थोक में अधिकारी को सौंपें",
    allResolvedSuccess: "कार्य सफलतापूर्वक पूरे हुए! सिंक्रनाइज़ किए गए लीड चरण अपडेट हो गए हैं।",
    reassignedSuccess: "असाइन किए गए स्टाफ सदस्य को अपडेट किया गया।",
    rescheduledSuccess: "कार्य पुनर्निर्धारित किया गया। कारण क्षेत्र बाधा ऑडिट ट्रेल में दर्ज किया गया।",
    overdueHeader: "अतिदेय फ़ॉलो-अप 🚨",
    todayHeader: "आज के निर्धारित कार्य 📅",
    upcomingHeader: "भविष्य के निर्धारित कार्य 🔮",
    resolvedHeader: "पूर्ण और स्वतः-समाधानित कार्य ✅",
    agendaView: "एजेंडा दृश्य",
    weekView: "सप्ताह दृश्य",
    monthView: "माह दृश्य",
    noTasksText: "इस अवधि के लिए कोई फ़ॉलो-अप कार्य निर्धारित नहीं हैं।",
    createTaskTitle: "नया फ़ॉलो-अप कार्य निर्धारित करें",
    taskSubjectLabel: "कार्य विषय / विवरण",
    taskSubjectPlaceholder: "उदा. लिफ्ट के दरवाजे की शैली स्पष्ट करने के लिए कॉल करें...",
    relatedLeadLabel: "संबंधित लीड अवसर का चयन करें",
    dueDateLabel: "कार्य पूरा करने की तिथि",
    assignToLabel: "क्षेत्र सर्वेक्षक / अधिकारी को सौंपें",
    createTaskBtn: "फ़ॉलो-अप कार्य सहेजें",
    leaveStatusLabel: "फील्ड स्टाफ उपस्थिति स्थिति",
    markOnLeave: "छुट्टी पर चिह्नित करें",
    markAvailable: "सक्रिय चिह्नित करें",
    bottlenecksTitle: "क्षेत्रीय पुनर्निर्धारण बाधा विश्लेषण",
    syncText: "इस कार्य को पूरा करने से सीआरएम स्वचालन को सिंक्रनाइज़ करने के लिए स्वचालित रूप से इस लीड का चरण आगे बढ़ जाएगा।",
    leadStageLockedText: "लीड बंद हो गई (जीत/हार)। अवांछित संचार को रोकने के लिए संबंधित कार्य स्वतः हल हो गया।",
    reasonCustomerNotReachable: "ग्राहक संपर्क योग्य नहीं है / फोन बंद है",
    reasonSiteNotReady: "साइट की संरचना शाफ्ट माप के लिए तैयार नहीं है",
    reasonPriceReconsideration: "ग्राहक ने बजट समीक्षा के लिए देरी का अनुरोध किया",
    reasonBusyFestival: "क्षेत्रीय त्योहार / छुट्टी के कारण व्यस्त",
    leadNameLabel: "ग्राहक का नाम",
    overdueBadge: "अतिदेय",
    completeAction: "तुरंत पूर्ण करें",
    rescheduleAction: "पुनर्निर्धारित करें",
    changeAssignee: "पुनः आवंटित करें",
    successAlert: "कार्रवाई सफलतापूर्वक संसाधित हुई!"
  },
  mr: {
    title: "फॉलो-अप कार्य नियोजक",
    subtitle: "टप्पा-आधारित स्वयंचलित व मानवी फॉलो-अप समन्वय प्रणाली",
    kpiCompletedRate: "आजचे कार्य पूर्णतेचे प्रमाण",
    kpiCoverage: "एकूण सीआरएम फॉलो-अप कव्हरेज प्रमाण",
    overdueWarning: "{count} फॉलो-अप कार्ये थकीत आहेत! लीडचे नुकसान टाळण्यासाठी त्वरित कारवाई करा.",
    reassignAlert: "कर्मचारी रजेवर सूचना: {count} कामांना त्वरित नवीन अधिकारी नेमणे आवश्यक आहे.",
    autoTaskLabel: "प्रणाली नियम ट्रिगर",
    manualTaskLabel: "मॅन्युअल कार्य",
    rescheduleReasonTitle: "पुनर्नियोजनाचे कारण नोंदवा",
    rescheduleReasonPlaceholder: "कारण निवडा किंवा लिहा (उदा. 'ग्राहकाशी संपर्क होत नाही', 'जागा तयार नाही')...",
    bulkActionsTitle: "थोक पाइपलाइन ऑपरेशन्स",
    bulkRescheduleBtn: "थोक तारीख बदला (+३ दिवस)",
    bulkReassignBtn: "निवडलेले कार्य थोकमध्ये नियुक्त करा",
    allResolvedSuccess: "कार्ये यशस्वीरित्या पूर्ण झाली! समन्वयित लीड टप्पे अद्ययावत केले गेले.",
    reassignedSuccess: "नेमलेले अधिकारी बदलण्यात आले.",
    rescheduledSuccess: "कार्य पुनर्नियोजित केले. कारण प्रादेशिक अडथळा ऑडिट ट्रेलमध्ये नोंदवले गेले.",
    overdueHeader: "थकीत फॉलो-अप 🚨",
    todayHeader: "आजची नियोजित कार्ये 📅",
    upcomingHeader: "भविष्यातील नियोजित कार्ये 🔮",
    resolvedHeader: "पूर्ण झालेली आणि स्वयंचलितपणे सोडवलेली कार्ये ✅",
    agendaView: "अजेंडा व्ह्यू",
    weekView: "आठवडा व्ह्यू",
    monthView: "महिना व्ह्यू",
    noTasksText: "या कालावधीसाठी कोणतीही फॉलो-अप कार्ये नियोजित नाहीत.",
    createTaskTitle: "नवीन फॉलो-अप कार्य नियोजित करा",
    taskSubjectLabel: "कार्याचा विषय / तपशील",
    taskSubjectPlaceholder: "उदा. लिफ्टच्या दरवाजाची स्टाईल निश्चित करण्यासाठी कॉल करणे...",
    relatedLeadLabel: "संबंधित लीड संधी निवडा",
    dueDateLabel: "फॉलो-अप तारीख",
    assignToLabel: "फील्ड सर्वेक्षक / अधिकाऱ्यास नियुक्त करा",
    createTaskBtn: "फॉलो-अप कार्य जोडा",
    leaveStatusLabel: "फील्ड स्टाफ उपस्थिती सद्यस्थिती",
    markOnLeave: "रजेवर नोंदवा",
    markAvailable: "सक्रिय करा",
    bottlenecksTitle: "प्रादेशिक पुनर्नियोजन अडथळे विश्लेषण",
    syncText: "हे कार्य पूर्ण केल्याने सीआरएम स्वयंचलिततेचा ताळमेळ ठेवण्यासाठी या लीडचा टप्पा स्वयंचलितपणे पुढे जाईल.",
    leadStageLockedText: "लीड बंद झाली आहे (विजय/तोटा). निरर्थक संवाद टाळण्यासाठी संबंधित काम स्वयंचलितपणे सोडवले गेले.",
    reasonCustomerNotReachable: "ग्राहकाशी संपर्क होत नाही / फोन बंद आहे",
    reasonSiteNotReady: "शाफ्ट मोजमापासाठी साइटची जागा सज्ज नाही",
    reasonPriceReconsideration: "ग्राहकाने बजेट पुनरावलोकनासाठी वेळ मागितला",
    reasonBusyFestival: "प्रादेशिक सण किंवा सुट्टीमुळे व्यस्त",
    leadNameLabel: "ग्राहकाचे नाव",
    overdueBadge: "थकीत",
    completeAction: "पूर्ण करा",
    rescheduleAction: "वेळ बदला",
    changeAssignee: "पुनर्नियुक्त करा",
    successAlert: "कारवाई यशस्वीरित्या पूर्ण झाली!"
  }
};

// CRM Task Interface Definition
interface CRMTask {
  id: string;
  relatedLeadId: string;
  subject: string;
  dueDate: string;
  assignedToId: string;
  status: 'pending' | 'completed' | 'rescheduled' | 'cancelled';
  isAutoGenerated: boolean;
  autoTriggerRuleName?: string;
  rescheduleReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const LeadFollowUpScheduler: React.FC<{ user: CRMUser; onBack?: () => void }> = ({ user, onBack }) => {
  const { language } = useLanguage();
  const activeLang: 'en' | 'mr' | 'hi' = (language === 'mr' || language === 'hi' || language === 'en') ? language : 'en';
  const t = localizations[activeLang];

  // Store lists
  const [leads, setLeads] = useState<Lead[]>([]);
  const [staff, setStaff] = useState<CRMUser[]>([]);
  const [tasks, setTasks] = useState<CRMTask[]>([]);

  // Navigation / Filter / Search states
  const [activeView, setActiveView] = useState<'agenda' | 'week' | 'month'>('agenda');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // default to today's date in YYYY-MM-DD
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'auto' | 'manual'>('all');

  // Staff availability (Leave Status tracking)
  const [staffLeaveStatus, setStaffLeaveStatus] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('aiec_staff_leave_status');
    return saved ? JSON.parse(saved) : {
      'amit_sharma': false,
      'sanjay_deshmukh': false,
      'rajesh_patel': true // Sanjay is active, Rajesh is technician, amit is active
    };
  });

  // Selected tasks for bulk actions
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Modal / Interaction states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [rescheduleTaskId, setRescheduleTaskId] = useState<string | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [customRescheduleReason, setCustomRescheduleReason] = useState<string>('');
  const [reassignTaskId, setReassignTaskId] = useState<string | null>(null);
  const [reassignTargetStaffId, setReassignTargetStaffId] = useState<string>('');

  // Form input states for creating manual tasks
  const [newSubject, setNewSubject] = useState<string>('');
  const [newLeadId, setNewLeadId] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newAssignedTo, setNewAssignedTo] = useState<string>('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Trigger Toast Alert helper
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Seeding follow-up tasks if none exist in localStorage
  const loadDatabaseAndTasks = () => {
    const rawLeads = DbManager.getLeads();
    const rawUsers = DbManager.getUsers();
    setLeads(rawLeads);
    // Field officers (surveyors)
    setStaff(rawUsers.filter(u => u.role === 'surveyor' || u.role === 'admin'));

    // Retrieve tasks
    const savedTasks = localStorage.getItem('aiec_follow_up_tasks');
    let currentTasks: CRMTask[] = [];

    if (savedTasks) {
      try {
        currentTasks = JSON.parse(savedTasks);
      } catch (e) {
        console.error("Error parsing tasks", e);
      }
    } else {
      // Seed initial tasks matching requirements
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 172800000).toISOString().split('T')[0];

      currentTasks = [
        {
          id: 'task_1',
          relatedLeadId: 'lead_2', // Suresh Patil (stage: captured)
          subject: "Call client regarding elevator dimensions: No response in 5 days on 'Captured' stage.",
          dueDate: yesterday, // Overdue!
          assignedToId: 'amit_sharma',
          status: 'pending',
          isAutoGenerated: true,
          autoTriggerRuleName: "Cold Lead Engagement Rule",
          createdAt: yesterday,
          updatedAt: yesterday
        },
        {
          id: 'task_2',
          relatedLeadId: 'lead_1', // Rohan Deshmukh (stage: quoted)
          subject: "Follow-up phone outreach: Negotiate price of VVVF Gearless Traction unit.",
          dueDate: today,
          assignedToId: 'amit_sharma',
          status: 'pending',
          isAutoGenerated: false,
          createdAt: yesterday,
          updatedAt: yesterday
        },
        {
          id: 'task_3',
          relatedLeadId: 'lead_3', // Vikas Mehta (stage: closed_won!)
          subject: "Handover check and final site photo report verification",
          dueDate: tomorrow,
          assignedToId: 'sanjay_deshmukh',
          status: 'pending', // This will trigger auto-cancel/resolve validation because lead is won!
          isAutoGenerated: true,
          autoTriggerRuleName: "SOP Handover Sync Engine",
          createdAt: yesterday,
          updatedAt: yesterday
        },
        {
          id: 'task_4',
          relatedLeadId: 'lead_2',
          subject: "Schedule regional safety manager joint site survey.",
          dueDate: futureDate,
          assignedToId: 'sanjay_deshmukh',
          status: 'completed',
          isAutoGenerated: false,
          createdAt: yesterday,
          updatedAt: today
        }
      ];
      localStorage.setItem('aiec_follow_up_tasks', JSON.stringify(currentTasks));
    }

    // EDGE CASE HANDLE: Related lead won or lost before task completion.
    // If associated lead stage is 'closed_won' or 'closed_lost', auto-resolve/cancel the task to avoid dangling items.
    let updatedTasks = false;
    const verifiedTasks = currentTasks.map(task => {
      const lead = rawLeads.find(l => l.id === task.relatedLeadId);
      if (lead && (lead.stage === 'closed_won' || lead.stage === 'closed_lost') && task.status === 'pending') {
        updatedTasks = true;
        return {
          ...task,
          status: 'completed',
          rescheduleReason: "Auto-Resolved: Related lead opportunity moved to final won/lost stage.",
          updatedAt: new Date().toISOString()
        } as CRMTask;
      }
      return task;
    });

    if (updatedTasks) {
      localStorage.setItem('aiec_follow_up_tasks', JSON.stringify(verifiedTasks));
      setTasks(verifiedTasks);
    } else {
      setTasks(currentTasks);
    }
  };

  useEffect(() => {
    loadDatabaseAndTasks();

    const handleUpdate = () => {
      loadDatabaseAndTasks();
    };
    window.addEventListener('aiec_db_update', handleUpdate);
    return () => {
      window.removeEventListener('aiec_db_update', handleUpdate);
    };
  }, []);

  const saveTasksList = (updatedTasksList: CRMTask[]) => {
    localStorage.setItem('aiec_follow_up_tasks', JSON.stringify(updatedTasksList));
    setTasks(updatedTasksList);
    window.dispatchEvent(new Event('aiec_db_update'));
  };

  // Staff availability toggling helper
  const handleToggleLeave = (staffId: string) => {
    const updatedStatus = {
      ...staffLeaveStatus,
      [staffId]: !staffLeaveStatus[staffId]
    };
    localStorage.setItem('aiec_staff_leave_status', JSON.stringify(updatedStatus));
    setStaffLeaveStatus(updatedStatus);
    showToast(t.successAlert);
  };

  // Create Manual Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newLeadId || !newDueDate || !newAssignedTo) {
      showToast("Please fill all fields!");
      return;
    }

    const newTask: CRMTask = {
      id: `task_${Date.now()}`,
      relatedLeadId: newLeadId,
      subject: newSubject,
      dueDate: newDueDate,
      assignedToId: newAssignedTo,
      status: 'pending',
      isAutoGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newTask, ...tasks];
    saveTasksList(updated);
    setShowCreateModal(false);
    setNewSubject('');
    setNewLeadId('');
    setNewDueDate('');
    setNewAssignedTo('');
    showToast("New follow-up task scheduled!");
  };

  // Complete task & optionally trigger stage progression or sync with auto-sequences
  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: 'completed' as const, updatedAt: new Date().toISOString() };
      }
      return t;
    });

    // Optionally auto-transition the lead's stage for sync
    const lead = leads.find(l => l.id === task.relatedLeadId);
    if (lead) {
      let nextStage = lead.stage;
      // sync logic transitions
      if (lead.stage === 'captured') {
        nextStage = 'assigned';
      } else if (lead.stage === 'assigned') {
        nextStage = 'contacted';
      } else if (lead.stage === 'contacted') {
        nextStage = 'survey_done';
      }

      if (nextStage !== lead.stage) {
        const updatedLead = {
          ...lead,
          stage: nextStage,
          updatedAt: new Date().toISOString()
        };
        DbManager.updateLead(updatedLead);
      }
    }

    saveTasksList(updated);
    showToast(t.allResolvedSuccess);
  };

  // Reschedule Task with Reason Logged to trace systemic bottlenecks
  const handleRescheduleSubmit = () => {
    if (!rescheduleTaskId) return;
    const finalReason = rescheduleReason === 'custom' ? customRescheduleReason : rescheduleReason;
    if (!finalReason.trim()) {
      showToast("Please select or write a reschedule reason!");
      return;
    }

    const updated = tasks.map(t => {
      if (t.id === rescheduleTaskId) {
        return {
          ...t,
          status: 'rescheduled' as const,
          rescheduleReason: finalReason,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    saveTasksList(updated);
    setRescheduleTaskId(null);
    setRescheduleReason('');
    setCustomRescheduleReason('');
    showToast(t.rescheduledSuccess);
  };

  // Re-assign specific task due to leave or triage
  const handleReassignSubmit = () => {
    if (!reassignTaskId || !reassignTargetStaffId) return;

    const updated = tasks.map(t => {
      if (t.id === reassignTaskId) {
        return {
          ...t,
          assignedToId: reassignTargetStaffId,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    saveTasksList(updated);
    setReassignTaskId(null);
    setReassignTargetStaffId('');
    showToast(t.reassignedSuccess);
  };

  // BULK ACTIONS: reschedule or reassign selected tasks
  const handleBulkReschedule = () => {
    if (selectedTaskIds.length === 0) {
      showToast("No tasks selected!");
      return;
    }

    const updated = tasks.map(t => {
      if (selectedTaskIds.includes(t.id)) {
        // Shift due date by +3 days
        const originalDate = new Date(t.dueDate);
        originalDate.setDate(originalDate.getDate() + 3);
        const newD = originalDate.toISOString().split('T')[0];

        return {
          ...t,
          dueDate: newD,
          status: 'rescheduled' as const,
          rescheduleReason: "Bulk delayed by 3 days during growth spurt",
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    saveTasksList(updated);
    setSelectedTaskIds([]);
    showToast("Bulk rescheduled successfully!");
  };

  const handleBulkReassign = (targetStaffId: string) => {
    if (!targetStaffId) return;
    if (selectedTaskIds.length === 0) {
      showToast("No tasks selected!");
      return;
    }

    const updated = tasks.map(t => {
      if (selectedTaskIds.includes(t.id)) {
        return {
          ...t,
          assignedToId: targetStaffId,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    saveTasksList(updated);
    setSelectedTaskIds([]);
    showToast("Bulk reassigned successfully!");
  };

  const handleToggleSelectTask = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Date lists generator for calendars
  const currentMonthDays = useMemo(() => {
    // Generate dates for July 2026 (the operational timeframe)
    const year = 2026;
    const month = 6; // July is index 6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const dates = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = d < 10 ? `0${d}` : `${d}`;
      dates.push(`2026-07-${dayStr}`);
    }
    return dates;
  }, []);

  const currentWeekDays = useMemo(() => {
    // Generate 7 days centered around selected date or today
    const current = new Date(selectedDate);
    const dayOfWeek = current.getDay(); // 0 is Sunday
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - dayOfWeek);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d.toISOString().split('T')[0]);
    }
    return week;
  }, [selectedDate]);

  // Aggregate leave warnings & tasks requiring reassignment
  const onLeaveStaffIds = useMemo(() => {
    return Object.keys(staffLeaveStatus).filter(id => staffLeaveStatus[id] === true);
  }, [staffLeaveStatus]);

  const tasksNeedingReassignmentCount = useMemo(() => {
    return tasks.filter(t => t.status === 'pending' && onLeaveStaffIds.includes(t.assignedToId)).length;
  }, [tasks, onLeaveStaffIds]);

  // Filtered and partitioned tasks
  const processedTasks = useMemo(() => {
    // Apply filters first
    return tasks.filter(task => {
      const lead = leads.find(l => l.id === task.relatedLeadId);
      const clientName = lead ? lead.contactInfo.name.toLowerCase() : '';
      const subject = task.subject.toLowerCase();
      const staffName = staff.find(s => s.id === task.assignedToId)?.name.toLowerCase() || '';

      const matchesSearch = clientName.includes(searchQuery.toLowerCase()) || 
                            subject.includes(searchQuery.toLowerCase()) || 
                            staffName.includes(searchQuery.toLowerCase());

      const matchesStaff = staffFilter === 'all' || task.assignedToId === staffFilter;
      const matchesType = typeFilter === 'all' || 
                          (typeFilter === 'auto' && task.isAutoGenerated) || 
                          (typeFilter === 'manual' && !task.isAutoGenerated);

      return matchesSearch && matchesStaff && matchesType;
    });
  }, [tasks, leads, staff, searchQuery, staffFilter, typeFilter]);

  // Partition processed tasks into Overdue, Today, Upcoming, and Resolved
  const todayStr = new Date().toISOString().split('T')[0];

  const partitionedTasks = useMemo(() => {
    const overdue: CRMTask[] = [];
    const todayTasks: CRMTask[] = [];
    const upcoming: CRMTask[] = [];
    const resolved: CRMTask[] = [];

    processedTasks.forEach(task => {
      if (task.status === 'completed' || task.status === 'cancelled') {
        resolved.push(task);
      } else {
        // Pending or rescheduled
        if (task.dueDate < todayStr) {
          overdue.push(task);
        } else if (task.dueDate === todayStr) {
          todayTasks.push(task);
        } else {
          upcoming.push(task);
        }
      }
    });

    // Sort sequences to put newest first or nearest first
    const sortByDateAsc = (a: CRMTask, b: CRMTask) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    const sortByDateDesc = (a: CRMTask, b: CRMTask) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();

    return {
      overdue: overdue.sort(sortByDateAsc), // nearest overdue first
      today: todayTasks,
      upcoming: upcoming.sort(sortByDateAsc),
      resolved: resolved.sort(sortByDateDesc) // newest finished first
    };
  }, [processedTasks, todayStr]);

  // Dynamic calculations for Bottlenecks audit analysis (Systemic territorial issues)
  const rescheduleBottlenecks = useMemo(() => {
    const reasonsMap: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.status === 'rescheduled' && t.rescheduleReason) {
        reasonsMap[t.rescheduleReason] = (reasonsMap[t.rescheduleReason] || 0) + 1;
      }
    });

    return Object.entries(reasonsMap).map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
  }, [tasks]);

  // PROGRESS BARS CALCULATIONS (DUAL PROGRESS MANDATED)
  // Progress Bar 1: Current Active Day Tasks Completion Progress
  const activeDayTasks = processedTasks.filter(t => t.dueDate === selectedDate);
  const activeDayCompleted = activeDayTasks.filter(t => t.status === 'completed');
  const currentProgress = activeDayTasks.length > 0 
    ? Math.round((activeDayCompleted.length / activeDayTasks.length) * 100) 
    : 100; // If no tasks scheduled for selected date, default to 100% completed/ready

  // Progress Bar 2: Total CRM Follow-up Resolution Coverage Rate
  const totalTasksCount = tasks.length;
  const completedOrCancelledTasksCount = tasks.filter(t => t.status === 'completed' || t.status === 'cancelled').length;
  const totalProgress = totalTasksCount > 0 
    ? Math.round((completedOrCancelledTasksCount / totalTasksCount) * 100) 
    : 100;

  return (
    <div className="w-full space-y-6">
      
      {/* Toast alert system notification banner */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-royalemerald text-white px-4 py-3 rounded-xl shadow-lg border border-royalemerald flex items-center gap-2 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-antiquegold" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          HEADER SECTION & UNEXPECTED LEAVE WARNING ALERTS
          ========================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-diffuse">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-antiquegold">
            <CalendarIcon className="w-5 h-5" />
            <span className="text-[10px] uppercase font-mono font-black tracking-wider bg-antiquegold/10 px-2 py-0.5 rounded-md">
              AIEC Operational Sync Node
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-black text-charcoal">{t.title}</h1>
          <p className="text-xs text-warmgray font-medium">{t.subtitle}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="py-2.5 px-4 text-xs font-bold"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Schedule Follow-Up
          </Button>

          {onBack && (
            <Button
              variant="ghost"
              className="py-2.5 px-4 text-xs"
              onClick={onBack}
            >
              Back to Inbox
            </Button>
          )}
        </div>
      </div>

      {/* ATTENDANCE AND LEAVE WARNING BANNER FOR ADMINS */}
      {user.role === 'admin' && tasksNeedingReassignmentCount > 0 && (
        <div className="bg-[#B23B3B]/10 p-4 rounded-xl border border-[#B23B3B]/30 text-xs text-[#B23B3B] space-y-2">
          <div className="flex items-center gap-2 font-black">
            <AlertTriangle className="w-4 h-4 text-[#B23B3B] animate-bounce" />
            <span>{t.reassignAlert.replace('{count}', String(tasksNeedingReassignmentCount))}</span>
          </div>
          <p className="text-[10px] text-charcoal leading-relaxed">
            Amit Sharma or Sanjay Deshmukh is currently registered on leave. Their pending tasks risk customer attrition. Use the reassign action or bulk reassign to keep operations on schedule.
          </p>
        </div>
      )}

      {/* OVERDUE PIPELINE TASKS NOTICE BANNER */}
      {partitionedTasks.overdue.length > 0 && (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/50 flex justify-between items-center gap-3">
          <div className="flex items-center gap-2.5 text-amber-800 text-xs">
            <ShieldAlert className="w-5 h-5 text-[#B8873D] animate-pulse shrink-0" />
            <div>
              <p className="font-bold">{t.overdueWarning.replace('{count}', String(partitionedTasks.overdue.length))}</p>
            </div>
          </div>
          <Badge status="pending" className="text-[10px] font-mono font-black" />
        </div>
      )}

      {/* =========================================================
          REQUIRED PROGRESS BARS (DUAL: CURRENT & TOTAL)
          ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* PROGRESS BAR 1: Current Day Scheduled Tasks Resolution Rate */}
        <div className="bg-white p-5 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-diffuse space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-charcoal flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-royalemerald animate-ping" />
              {t.kpiCompletedRate} ({selectedDate})
            </span>
            <span className="font-mono font-extrabold text-royalemerald">{currentProgress}%</span>
          </div>
          
          <div className="h-2.5 w-full bg-alabaster rounded-full overflow-hidden relative border border-border">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-royalemerald rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${currentProgress}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[9px] font-mono text-warmgray">
            <span>{activeDayCompleted.length} COMPLETED</span>
            <span>{activeDayTasks.length} TOTAL SCHEDULED FOR DATE</span>
          </div>
        </div>

        {/* PROGRESS BAR 2: Total CRM resolution Coverage */}
        <div className="bg-white p-5 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-diffuse space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-charcoal flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-antiquegold" />
              {t.kpiCoverage}
            </span>
            <span className="font-mono font-extrabold text-antiquegold">{totalProgress}%</span>
          </div>

          <div className="h-2.5 w-full bg-alabaster rounded-full overflow-hidden relative border border-border">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-antiquegold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono text-warmgray">
            <span>{completedOrCancelledTasksCount} RESOLVED OR CANCELLED</span>
            <span>{totalTasksCount} GRAND TOTAL CREATED</span>
          </div>
        </div>

      </div>

      {/* =========================================================
          CALENDAR NAVIGATION TABS (MONTH / WEEK / AGENDA)
          ========================================================= */}
      <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-diffuse flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Toggle selectors */}
        <div className="flex bg-alabaster p-1 rounded-xl border border-border/80 w-full sm:w-auto">
          <button
            onClick={() => setActiveView('agenda')}
            className={`flex-1 sm:flex-initial text-xs py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeView === 'agenda' 
                ? 'bg-white text-charcoal shadow-xs' 
                : 'text-warmgray hover:text-charcoal'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            {t.agendaView}
          </button>
          <button
            onClick={() => setActiveView('week')}
            className={`flex-1 sm:flex-initial text-xs py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeView === 'week' 
                ? 'bg-white text-charcoal shadow-xs' 
                : 'text-warmgray hover:text-charcoal'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {t.weekView}
          </button>
          <button
            onClick={() => setActiveView('month')}
            className={`flex-1 sm:flex-initial text-xs py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeView === 'month' 
                ? 'bg-white text-charcoal shadow-xs' 
                : 'text-warmgray hover:text-charcoal'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            {t.monthView}
          </button>
        </div>

        {/* Selected date range indicator */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const current = new Date(selectedDate);
              current.setDate(current.getDate() - 1);
              setSelectedDate(current.toISOString().split('T')[0]);
            }}
            className="p-2 rounded-lg border border-border hover:bg-alabaster text-charcoal cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-mono font-extrabold bg-alabaster py-2 px-4 rounded-xl border border-border text-charcoal">
            {selectedDate}
          </span>

          <button 
            onClick={() => {
              const current = new Date(selectedDate);
              current.setDate(current.getDate() + 1);
              setSelectedDate(current.toISOString().split('T')[0]);
            }}
            className="p-2 rounded-lg border border-border hover:bg-alabaster text-charcoal cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* MONTH / WEEK / GRID DISPLAY MODULES */}
      {activeView === 'month' && (
        <div className="bg-white p-5 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-diffuse space-y-4">
          <div className="flex justify-between items-center border-b border-border/80 pb-3">
            <h3 className="text-xs font-extrabold uppercase font-mono text-charcoal flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-antiquegold" />
              July 2026 Pipeline Overview Grid
            </h3>
            <span className="text-[10px] font-mono text-warmgray">Click date to examine day's follow-up agenda</span>
          </div>

          {/* Month Calendar Grid (31 Days) */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center font-bold text-[10px] text-warmgray uppercase py-1">
                {d}
              </div>
            ))}
            
            {/* Pad July 2026 starts on Wednesday */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`pad-${i}`} className="bg-alabaster/20 rounded-xl h-14 border border-border/20" />
            ))}

            {currentMonthDays.map((dateStr) => {
              const isSelected = dateStr === selectedDate;
              const dateObj = new Date(dateStr);
              const dayNum = dateObj.getDate();

              // count pending and resolved tasks for this day
              const dayTasks = tasks.filter(t => t.dueDate === dateStr);
              const pendingCount = dayTasks.filter(t => t.status === 'pending').length;
              const completedCount = dayTasks.filter(t => t.status === 'completed').length;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-16 rounded-xl border p-1.5 flex flex-col justify-between text-left transition-all ${
                    isSelected 
                      ? 'bg-antiquegold border-antiquegold text-white shadow-md' 
                      : 'bg-white border-border hover:bg-alabaster text-charcoal'
                  }`}
                >
                  <span className="text-xs font-mono font-black">{dayNum}</span>
                  
                  {/* Indicators for tasks */}
                  <div className="flex gap-1 mt-1">
                    {pendingCount > 0 && (
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-antiquegold'}`} title={`${pendingCount} Pending`} />
                    )}
                    {completedCount > 0 && (
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-royalemerald'}`} title={`${completedCount} Completed`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeView === 'week' && (
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-diffuse space-y-3">
          <div className="flex justify-between items-center border-b border-border/80 pb-2">
            <h3 className="text-xs font-extrabold uppercase font-mono text-charcoal flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-antiquegold" />
              Rolling Weekly Scheduler Strip
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {currentWeekDays.map((dateStr) => {
              const isSelected = dateStr === selectedDate;
              const dateObj = new Date(dateStr);
              
              // Get day name and date
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = dateObj.getDate();

              const dayTasks = tasks.filter(t => t.dueDate === dateStr);
              const pendingCount = dayTasks.filter(t => t.status === 'pending').length;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all ${
                    isSelected 
                      ? 'bg-royalemerald border-royalemerald text-white shadow-md' 
                      : 'bg-white border-border hover:bg-alabaster text-charcoal'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider">{dayName}</span>
                  <span className="text-lg font-serif font-black">{dayNum}</span>
                  {pendingCount > 0 && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white text-royalemerald' : 'bg-antiquegold/10 text-antiquegold'
                    } font-extrabold`}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          FILTERS DOCK & SEARCH
          ========================================================= */}
      <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-diffuse flex flex-col md:flex-row gap-3 items-center">
        
        {/* Text Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-warmgray absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search tasks by subject, surveyor name or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-border bg-alabaster/40 text-charcoal focus:ring-1 focus:ring-antiquegold outline-none"
          />
        </div>

        {/* Staff Filter */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <Filter className="w-4 h-4 text-antiquegold shrink-0" />
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border border-border bg-white text-charcoal focus:ring-1 focus:ring-antiquegold outline-none"
          >
            <option value="all">All Assigned Staff</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <Sliders className="w-4 h-4 text-antiquegold shrink-0" />
          <select
            value={typeFilter}
            onChange={(e: any) => setTypeFilter(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border border-border bg-white text-charcoal focus:ring-1 focus:ring-antiquegold outline-none"
          >
            <option value="all">All Task Rules</option>
            <option value="auto">System Automated Triggers</option>
            <option value="manual">Manual Sales Actions</option>
          </select>
        </div>

      </div>

      {/* =========================================================
          MAIN TASK LIST TIMELINE PANEL
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ACTIVE AGENDA LIST (8/12 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* BULK OPERATIONS TOOLBAR */}
          {selectedTaskIds.length > 0 && (
            <div className="bg-alabaster p-4 rounded-xl border border-antiquegold/30 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs font-mono font-bold text-charcoal">
                ⛓️ {selectedTaskIds.length} Tasks Selected for Bulk Actions
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="py-1.5 px-3 text-xs flex-1"
                  onClick={handleBulkReschedule}
                >
                  {t.bulkRescheduleBtn}
                </Button>
                <select
                  onChange={(e) => {
                    handleBulkReassign(e.target.value);
                    e.target.value = '';
                  }}
                  className="text-xs p-1.5 rounded-xl border border-border bg-white text-charcoal outline-none flex-1"
                >
                  <option value="">Bulk Assign to...</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* OVERDUE TASKS QUEUE (Always surfaced at very top of screen list as mandated) */}
          {partitionedTasks.overdue.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#B23B3B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B23B3B] animate-ping" />
                <h2 className="text-sm font-serif font-black uppercase tracking-wider">{t.overdueHeader}</h2>
              </div>

              {partitionedTasks.overdue.map(task => (
                <TaskRowCard 
                  key={task.id} 
                  task={task}
                  leads={leads}
                  staff={staff}
                  staffLeaveStatus={staffLeaveStatus}
                  onToggleSelect={handleToggleSelectTask}
                  isSelected={selectedTaskIds.includes(task.id)}
                  onComplete={handleCompleteTask}
                  onReschedule={(id) => setRescheduleTaskId(id)}
                  onReassign={(id) => {
                    setReassignTaskId(id);
                    setReassignTargetStaffId(task.assignedToId);
                  }}
                  isOverdue={true}
                  t={t}
                />
              ))}
            </div>
          )}

          {/* TODAY'S TASKS QUEUE */}
          <div className="space-y-3">
            <h2 className="text-sm font-serif font-black text-charcoal uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-antiquegold" />
              {t.todayHeader} ({selectedDate === todayStr ? 'Today' : selectedDate})
            </h2>

            {partitionedTasks.today.length === 0 && (
              <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-border text-xs text-warmgray">
                {t.noTasksText}
              </div>
            )}

            {partitionedTasks.today.map(task => (
              <TaskRowCard 
                key={task.id} 
                task={task}
                leads={leads}
                staff={staff}
                staffLeaveStatus={staffLeaveStatus}
                onToggleSelect={handleToggleSelectTask}
                isSelected={selectedTaskIds.includes(task.id)}
                onComplete={handleCompleteTask}
                onReschedule={(id) => setRescheduleTaskId(id)}
                onReassign={(id) => {
                  setReassignTaskId(id);
                  setReassignTargetStaffId(task.assignedToId);
                }}
                isOverdue={false}
                t={t}
              />
            ))}
          </div>

          {/* UPCOMING FUTURE TASKS QUEUE */}
          {partitionedTasks.upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-serif font-black text-warmgray uppercase tracking-wider">
                {t.upcomingHeader}
              </h2>

              {partitionedTasks.upcoming.map(task => (
                <TaskRowCard 
                  key={task.id} 
                  task={task}
                  leads={leads}
                  staff={staff}
                  staffLeaveStatus={staffLeaveStatus}
                  onToggleSelect={handleToggleSelectTask}
                  isSelected={selectedTaskIds.includes(task.id)}
                  onComplete={handleCompleteTask}
                  onReschedule={(id) => setRescheduleTaskId(id)}
                  onReassign={(id) => {
                    setReassignTaskId(id);
                    setReassignTargetStaffId(task.assignedToId);
                  }}
                  isOverdue={false}
                  t={t}
                />
              ))}
            </div>
          )}

          {/* RESOLVED / COMPLETED TASKS QUEUE */}
          {partitionedTasks.resolved.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-serif font-black text-royalemerald uppercase tracking-wider">
                {t.resolvedHeader}
              </h2>

              {partitionedTasks.resolved.map(task => (
                <TaskRowCard 
                  key={task.id} 
                  task={task}
                  leads={leads}
                  staff={staff}
                  staffLeaveStatus={staffLeaveStatus}
                  onToggleSelect={handleToggleSelectTask}
                  isSelected={selectedTaskIds.includes(task.id)}
                  onComplete={handleCompleteTask}
                  onReschedule={(id) => setRescheduleTaskId(id)}
                  onReassign={(id) => {
                    setReassignTaskId(id);
                    setReassignTargetStaffId(task.assignedToId);
                  }}
                  isOverdue={false}
                  t={t}
                />
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: BOTTLENECKS DIAGNOSTIC & STAFF AVAILABILITY (4/12 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* FIELD STAFF LEAVE AND DUTY MANAGERS LIST */}
          <div className="bg-white p-5 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-diffuse space-y-4">
            <h3 className="text-sm font-serif font-black text-charcoal border-b border-border/80 pb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-antiquegold" />
              {t.leaveStatusLabel}
            </h3>

            <div className="space-y-3">
              {staff.map(member => {
                const isOnLeave = staffLeaveStatus[member.id] || false;
                const assignedCount = tasks.filter(t => t.status === 'pending' && t.assignedToId === member.id).length;

                return (
                  <div key={member.id} className="flex justify-between items-center p-3 rounded-xl border border-border/60 bg-alabaster/40">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img 
                          src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                          alt={member.name}
                          className="w-8 h-8 rounded-full border border-border shrink-0 object-cover"
                        />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                          isOnLeave ? 'bg-[#B23B3B]' : 'bg-royalemerald'
                        }`} />
                      </div>
                      
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-charcoal truncate">{member.name}</p>
                        <p className="text-[10px] font-mono text-warmgray">{assignedCount} Active tasks</p>
                      </div>
                    </div>

                    <Button
                      variant={isOnLeave ? 'secondary' : 'outline'}
                      className="py-1 px-2.5 text-[10px] h-auto rounded-lg"
                      onClick={() => handleToggleLeave(member.id)}
                    >
                      {isOnLeave ? t.markAvailable : t.markOnLeave}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SYSTEMIC BOTTLENECKS REPORT */}
          <div className="bg-white p-5 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-diffuse space-y-4">
            <h3 className="text-sm font-serif font-black text-charcoal border-b border-border/80 pb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-antiquegold" />
              {t.bottlenecksTitle}
            </h3>

            <div className="space-y-3">
              {rescheduleBottlenecks.length === 0 ? (
                <p className="text-[11px] text-warmgray italic">No reschedule bottlenecks logged yet. Clean pipeline active.</p>
              ) : (
                rescheduleBottlenecks.map(({ reason, count }) => {
                  const percentage = Math.round((count / tasks.filter(t => t.status === 'rescheduled').length) * 100);

                  return (
                    <div key={reason} className="space-y-1">
                      <div className="flex justify-between gap-2 text-xs text-charcoal">
                        <span className="font-semibold truncate max-w-[200px] min-w-0">{reason}</span>
                        <span className="font-mono font-black shrink-0">{count} logs ({percentage}%)</span>
                      </div>
                      
                      <div className="h-1.5 w-full bg-alabaster rounded-full overflow-hidden">
                        <div className="h-full bg-antiquegold" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* =========================================================
          MODALS & OVERLAYS: CREATE & ACTION CONTEXTS
          ========================================================= */}
      
      {/* 1. Schedule Task Modal Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-border shadow-2xl p-6 w-full max-w-lg space-y-4"
          >
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-lg font-serif font-black text-charcoal">{t.createTaskTitle}</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-warmgray hover:bg-alabaster hover:text-charcoal cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-left">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal block">{t.taskSubjectLabel}</label>
                <input 
                  type="text" 
                  placeholder={t.taskSubjectPlaceholder}
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-alabaster/20 text-charcoal outline-none focus:ring-1 focus:ring-antiquegold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal block">{t.relatedLeadLabel}</label>
                <select
                  value={newLeadId}
                  onChange={(e) => setNewLeadId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-charcoal outline-none focus:ring-1 focus:ring-antiquegold"
                  required
                >
                  <option value="">Choose Lead...</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.contactInfo.name} - {lead.buildingInfo.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal block">{t.dueDateLabel}</label>
                  <input 
                    type="date" 
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-charcoal outline-none focus:ring-1 focus:ring-antiquegold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal block">{t.assignToLabel}</label>
                  <select
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-charcoal outline-none focus:ring-1 focus:ring-antiquegold"
                    required
                  >
                    <option value="">Choose Officer...</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-full py-3 text-xs uppercase tracking-wider"
              >
                {t.createTaskBtn}
              </Button>

            </form>
          </motion.div>
        </div>
      )}

      {/* 2. Reschedule Dialog reason picker */}
      {rescheduleTaskId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-border shadow-2xl p-6 w-full max-w-md space-y-4"
          >
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-sm font-serif font-black text-charcoal">{t.rescheduleReasonTitle}</h2>
              <button 
                onClick={() => setRescheduleTaskId(null)}
                className="p-1 rounded-full text-warmgray hover:bg-alabaster hover:text-charcoal cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-xs text-warmgray block">{t.rescheduleReasonPlaceholder}</label>
                <select
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-charcoal outline-none focus:ring-1 focus:ring-antiquegold"
                >
                  <option value="">Choose Option...</option>
                  <option value={t.reasonCustomerNotReachable}>{t.reasonCustomerNotReachable}</option>
                  <option value={t.reasonSiteNotReady}>{t.reasonSiteNotReady}</option>
                  <option value={t.reasonPriceReconsideration}>{t.reasonPriceReconsideration}</option>
                  <option value={t.reasonBusyFestival}>{t.reasonBusyFestival}</option>
                  <option value="custom">Other / Custom reason...</option>
                </select>
              </div>

              {rescheduleReason === 'custom' && (
                <div className="space-y-1">
                  <textarea
                    placeholder="Enter custom reason..."
                    value={customRescheduleReason}
                    onChange={(e) => setCustomRescheduleReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-charcoal outline-none focus:ring-1 focus:ring-antiquegold h-20"
                  />
                </div>
              )}

              <Button
                variant="primary"
                className="w-full py-2.5 text-xs font-bold"
                onClick={handleRescheduleSubmit}
              >
                Reschedule and Log Bottleneck
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. Re-assign Dialog staff selector */}
      {reassignTaskId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-border shadow-2xl p-6 w-full max-w-md space-y-4"
          >
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-sm font-serif font-black text-charcoal">Reassign Officer</h2>
              <button 
                onClick={() => setReassignTaskId(null)}
                className="p-1 rounded-full text-warmgray hover:bg-alabaster hover:text-charcoal cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-xs text-warmgray block">Choose field staff member:</label>
                <select
                  value={reassignTargetStaffId}
                  onChange={(e) => setReassignTargetStaffId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-charcoal outline-none focus:ring-1 focus:ring-antiquegold"
                >
                  <option value="">Select Officer...</option>
                  {staff.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role}) {staffLeaveStatus[member.id] ? " - [ON LEAVE]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="primary"
                className="w-full py-2.5 text-xs font-bold"
                onClick={handleReassignSubmit}
              >
                Confirm Re-assignment
              </Button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

// =========================================================
// REUSABLE SUB-COMPONENT FOR A SINGLE TASK ROW
// =========================================================
interface TaskRowCardProps {
  task: CRMTask;
  leads: Lead[];
  staff: CRMUser[];
  staffLeaveStatus: Record<string, boolean>;
  onToggleSelect: (id: string) => void;
  isSelected: boolean;
  onComplete: (id: string) => void;
  onReschedule: (id: string) => void;
  onReassign: (id: string) => void;
  isOverdue: boolean;
  t: any;
}

const TaskRowCard: React.FC<TaskRowCardProps> = ({
  task, leads, staff, staffLeaveStatus, onToggleSelect, isSelected,
  onComplete, onReschedule, onReassign, isOverdue, t
}) => {
  const relatedLead = leads.find(l => l.id === task.relatedLeadId);
  const assignee = staff.find(s => s.id === task.assignedToId);
  const isAssigneeOnLeave = assignee ? staffLeaveStatus[assignee.id] || false : false;

  const isCompleted = task.status === 'completed';

  return (
    <Card className={`relative overflow-hidden border-l-4 p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:translate-x-0.5 ${
      isCompleted 
        ? 'border-l-royalemerald bg-alabaster/30 opacity-70' 
        : isOverdue 
          ? 'border-l-[#B23B3B] bg-[#B23B3B]/5' 
          : 'border-l-antiquegold bg-white hover:border-l-antiquegold/80'
    }`}>
      
      <div className="flex items-start gap-3 w-full md:w-auto">
        
        {/* Bulk select checkbox */}
        {!isCompleted && (
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onToggleSelect(task.id)}
            className="mt-1 mr-1 accent-antiquegold cursor-pointer w-4 h-4"
          />
        )}

        <div className="space-y-1.5 text-left w-full">
          
          {/* Header tags row */}
          <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono font-bold">
            {task.isAutoGenerated ? (
              <span className="bg-royalemerald/10 text-royalemerald px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {t.autoTaskLabel}
              </span>
            ) : (
              <span className="bg-alabaster text-warmgray px-2 py-0.5 rounded border border-border">
                {t.manualTaskLabel}
              </span>
            )}

            {isOverdue && (
              <span className="bg-[#B23B3B] text-white px-2 py-0.5 rounded">
                {t.overdueBadge}
              </span>
            )}

            <span className="bg-alabaster text-charcoal border border-border px-2 py-0.5 rounded">
              Due: {task.dueDate}
            </span>

            {isAssigneeOnLeave && !isCompleted && (
              <span className="bg-[#B23B3B]/10 text-[#B23B3B] px-2 py-0.5 rounded animate-pulse">
                ASSIGNEE ON LEAVE ⚠️
              </span>
            )}
          </div>

          {/* Task Subject */}
          <h3 className={`text-xs md:text-sm font-bold text-charcoal leading-relaxed ${isCompleted ? 'line-through text-warmgray' : ''}`}>
            {task.subject}
          </h3>

          {/* Lead Information with the Ascension Line progress motif */}
          {relatedLead && (
            <div className="flex items-center gap-2 text-[10px] text-warmgray font-semibold bg-alabaster p-1.5 rounded-lg border border-border/40">
              
              {/* Vertical mini Ascension Line representing lead's stage progress */}
              <div className="h-4 w-1 bg-border rounded relative">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-antiquegold rounded" 
                  style={{ 
                    height: relatedLead.stage === 'captured' ? '25%' :
                            relatedLead.stage === 'assigned' ? '50%' :
                            relatedLead.stage === 'contacted' ? '75%' : '100%'
                  }}
                />
              </div>

              <span>{t.leadNameLabel}: {relatedLead.contactInfo.name}</span>
              <span className="text-antiquegold font-mono">• {relatedLead.buildingInfo.address} ({relatedLead.buildingInfo.floors} Floors)</span>
            </div>
          )}

          {/* Bottleneck reason indicator if rescheduled */}
          {task.status === 'rescheduled' && task.rescheduleReason && (
            <div className="text-[9px] font-mono text-antiquegold bg-antiquegold/5 p-1.5 rounded border border-antiquegold/10 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Rescheduled Log: "{task.rescheduleReason}"</span>
            </div>
          )}
        </div>
      </div>

      {/* ACTION CONTROLS */}
      {!isCompleted && (
        <div className="flex flex-wrap md:flex-nowrap gap-2 items-center w-full md:w-auto border-t border-border/40 md:border-t-0 pt-3 md:pt-0 shrink-0">
          
          {/* Assignee label or change link */}
          {assignee && (
            <div className="text-[10px] font-semibold text-charcoal mr-2 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-antiquegold" />
              <span>{assignee.name}</span>
            </div>
          )}

          <Button
            variant="emerald"
            className="py-1.5 px-3 text-[10px] h-auto font-bold flex-1 md:flex-initial"
            onClick={() => onComplete(task.id)}
          >
            <Check className="w-3 h-3 mr-1" />
            {t.completeAction}
          </Button>

          <Button
            variant="secondary"
            className="py-1.5 px-3 text-[10px] h-auto flex-1 md:flex-initial"
            onClick={() => onReschedule(task.id)}
          >
            <Clock className="w-3 h-3 mr-1" />
            {t.rescheduleAction}
          </Button>

          <Button
            variant="ghost"
            className="py-1.5 px-3 text-[10px] h-auto flex-1 md:flex-initial"
            onClick={() => onReassign(task.id)}
          >
            <UserCheck className="w-3 h-3 mr-1" />
            {t.changeAssignee}
          </Button>

        </div>
      )}

      {isCompleted && (
        <div className="flex items-center gap-1.5 text-royalemerald text-xs font-bold shrink-0">
          <CheckCircle className="w-4 h-4 text-royalemerald" />
          <span>Resolved</span>
        </div>
      )}

    </Card>
  );
};
