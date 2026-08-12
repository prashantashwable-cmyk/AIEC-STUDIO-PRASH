import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud, FileSpreadsheet, Download, RefreshCw, Check, AlertTriangle,
  AlertCircle, ChevronRight, X, User, ArrowDown, HelpCircle, FileText,
  Layers, Settings, Trash2, ArrowUpRight, Shield, ListFilter, Play,
  Plus, CheckCircle, Database, LayoutGrid, RotateCcw
} from 'lucide-react';
import { Lead, LeadStage, User as CRMUser } from '../types';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';
import { DbManager } from '../lib/db';

const localizations = {
  en: {
    title: "Bulk Lead Migration & Export Central",
    subtitle: "Onboard legacy spreadsheets, configure custom schema column-mappings, and download clean filtered offline ledgers.",
    tabImport: "Bulk Spreadsheet Import",
    tabExport: "Filtered CRM Ledger Export",
    tabBatches: "Import Batch Logs & Rollback",
    uploadTitle: "Upload Spreadsheet File (CSV / TSV)",
    uploadDesc: "Drag and drop your CRM spreadsheet or click to select. Supports comma-separated files up to 10MB.",
    loadTemplate: "Load Interactive Sandbox Templates",
    templateLegacy: "Load Unstructured Builder Sheet (6 Rows, Missing Fields & Duplicates)",
    templateClean: "Load Clean Enterprise CRM Sheet (10 Rows, Ready for Migration)",
    mappingTitle: "Inter-Schema Column Mapping Configurator",
    mappingDesc: "Align your source spreadsheet columns with the required AIEC Lead database fields.",
    targetField: "AIEC Target Field",
    sourceHeader: "Your CSV Column Header",
    mappingStatus: "Status",
    required: "Required",
    optional: "Optional",
    validationTitle: "Pre-Migration Integrity Preview & Dup-Detection",
    validationDesc: "The system has validated the rows. Review duplicates and validation warnings before committing to database.",
    validRows: "Clean Rows Ready to Import",
    invalidRows: "Rejected Rows (Malformed or Missing Data)",
    duplicateRows: "Overlap Warnings (Duplicate Contacts in Db)",
    progressTitle: "Progressive Background Batch Migration",
    importingLeads: "Migrating leads securely in small chunks to prevent UI thread blocking...",
    currentProgress: "Current Batch Progress",
    totalProgress: "Total CRM Database Target",
    importSuccessTitle: "Bulk Onboarding Completed Successfully",
    leadsImported: "Total Leads Onboarded",
    duplicatesResolved: "Duplicates Checked",
    batchIdLabel: "Unique Import Batch ID",
    rollbackBtn: "Rollback Selected Batch",
    exportTitle: "Filter & Configure Export Fields",
    exportDesc: "Construct your custom filtered offline ledger. Permissions and privacy filters will be automatically enforced.",
    permissionLock: "Explicit Privilege Toggles",
    commissionToggle: "Include Surveyor Commission Figures",
    commissionToggleDesc: "Enforces Admin-only auditing of surveyor payouts. Forbidden to other roles.",
    phoneMaskToggle: "Mask Sensitive Client Contact Numbers",
    phoneMaskToggleDesc: "Protects consumer privacy by outputting +91 XXXXX XXXXX instead of raw dials.",
    filterStage: "Filter by Lead Stage",
    filterBldType: "Filter by Building Type",
    generateCsv: "Download Clean CSV Ledger",
    noLeadsFound: "No elevator leads found matching the selected export parameters.",
    batchLogsTitle: "Historic CRM Import Batches",
    batchLogsDesc: "View and rollback previous import sessions instantly to maintain append-only data purity.",
    noBatches: "No bulk spreadsheets have been imported during this active user session.",
    sampleDownload: "Download Sample Blank CSV Template",
    stepUpload: "Upload",
    stepMap: "Schema Mapping",
    stepValidate: "Validate & Preview",
    stepProgress: "Onboarding Engine"
  },
  hi: {
    title: "थोक लीड माइग्रेशन और निर्यात केंद्र",
    subtitle: "पुराने स्प्रेडशीट आयात करें, कस्टम कॉलम मैपिंग कॉन्फ़िगर करें, और साफ फ़िल्टर किया हुआ ऑफ़लाइन डेटा डाउनलोड करें।",
    tabImport: "थोक स्प्रेडशीट आयात",
    tabExport: "फ़िल्टर किया हुआ सीआरएम डेटा निर्यात",
    tabBatches: "आयात बैच लॉग और रोलबैक",
    uploadTitle: "स्प्रेडशीट फ़ाइल अपलोड करें (CSV / TSV)",
    uploadDesc: "अपने सीआरएम स्प्रेडशीट को ड्रैग और ड्रॉप करें या चुनने के लिए क्लिक करें। 10MB तक की फ़ाइलों का समर्थन करता है।",
    loadTemplate: "सैंडबॉक्स टेम्प्लेट लोड करें (परीक्षण के लिए)",
    templateLegacy: "अव्यवस्थित बिल्डर शीट लोड करें (6 पंक्तियाँ, त्रुटियाँ और डुप्लिकेट)",
    templateClean: "साफ एंटरप्राइज सीआरएम शीट लोड करें (10 पंक्तियाँ, तैयार)",
    mappingTitle: "कॉलम मैपिंग कॉन्फ़िगरेशन",
    mappingDesc: "अपने स्प्रेडशीट कॉलम को आवश्यक एआईईसी डेटाबेस फ़ील्ड के साथ संरेखित करें।",
    targetField: "एआईईसी लक्षित फ़ील्ड",
    sourceHeader: "आपका स्प्रेडशीट कॉलम",
    mappingStatus: "स्थिति",
    required: "आवश्यक",
    optional: "वैकल्पिक",
    validationTitle: "सत्यापन पूर्वावलोकन और डुप्लिकेट पहचान",
    validationDesc: "सिस्टम ने पंक्तियों का सत्यापन किया है। अंतिम रूप देने से पहले समीक्षा करें।",
    validRows: "आयात के लिए तैयार साफ पंक्तियाँ",
    invalidRows: "अस्वीकृत पंक्तियाँ (अपूर्ण डेटा)",
    duplicateRows: "डुप्लिकेट चेतावनी (डेटाबेस में पहले से मौजूद)",
    progressTitle: "प्रगतिशील पृष्ठभूमि बैच माइग्रेशन",
    importingLeads: "यूआई को सुचारू रखने के लिए लीड्स को छोटे बैचों में सुरक्षित रूप से माइग्रेट किया जा रहा है...",
    currentProgress: "वर्तमान बैच प्रगति",
    totalProgress: "कुल सीआरएम डेटाबेस लक्ष्य",
    importSuccessTitle: "थोक आयात सफलतापूर्वक संपन्न हुआ",
    leadsImported: "कुल आयातित लीड्स",
    duplicatesResolved: "डुप्लिकेट जांचें",
    batchIdLabel: "अद्वितीय आयात बैच आईडी",
    rollbackBtn: "चयनित बैच वापस लें",
    exportTitle: "निर्यात फ़ील्ड फ़िल्टर और कॉन्फ़िगर करें",
    exportDesc: "अपना कस्टम फ़िल्टर किया हुआ ऑफ़लाइन बहीखाता तैयार करें। गोपनीयता फ़िल्टर लागू होंगे।",
    permissionLock: "स्पष्ट विशेषाधिकार सेटिंग्स",
    commissionToggle: "सर्वेक्षक कमीशन राशि शामिल करें",
    commissionToggleDesc: "सर्वेक्षक भुगतान का केवल व्यवस्थापक लेखा-परीक्षण लागू करता है।",
    phoneMaskToggle: "संवेदनशील संपर्क नंबर मास्क करें",
    phoneMaskToggleDesc: "नंबरों को +91 XXXXX XXXXX के रूप में सुरक्षित रूप से निर्यात करें।",
    filterStage: "लीड चरण द्वारा फ़िल्टर करें",
    filterBldType: "भवन प्रकार द्वारा फ़िल्टर करें",
    generateCsv: "साफ CSV बहीखाता डाउनलोड करें",
    noLeadsFound: "चयनित मापदंडों से मेल खाने वाले कोई लीड्स नहीं मिले।",
    batchLogsTitle: "ऐतिहासिक आयात बैच लॉग",
    batchLogsDesc: "डेटा शुद्धता बनाए रखने के लिए पिछले आयात सत्रों को तुरंत वापस लें।",
    noBatches: "सत्र के दौरान कोई थोक स्प्रेडशीट आयात नहीं किया गया है।",
    sampleDownload: "नमूना रिक्त CSV टेम्प्लेट डाउनलोड करें",
    stepUpload: "अपलोड",
    stepMap: "कॉलम मैपिंग",
    stepValidate: "सत्यापन एवं पूर्वावलोकन",
    stepProgress: "माइग्रेशन इंजन"
  },
  mr: {
    title: "थोक लीड स्थलांतर आणि निर्यात केंद्र",
    subtitle: "जुनी स्प्रेडशीट आयात करा, कस्टम कॉलम मॅपिंग कॉन्फिगर करा आणि शुद्ध ऑफलाइन लेजर डाउनलोड करा.",
    tabImport: "थोक स्प्रेडशीट आयात",
    tabExport: "फिल्टर केलेले सीआरएम लेजर निर्यात",
    tabBatches: "आयात बॅच इतिहास आणि रोलबॅक",
    uploadTitle: "स्प्रेडशीट फाइल अपलोड करा (CSV / TSV)",
    uploadDesc: "तुमची सीआरएम स्प्रेडशीट ड्रॅग आणि ड्रॉप करा किंवा निवडण्यासाठी क्लिक करा. १० एमबी पर्यंतच्या फाईल्स समर्थित आहेत.",
    loadTemplate: "सँडबॉक्स नमुना टेम्प्लेट्स लोड करा",
    templateLegacy: "अव्यवस्थित बिल्डर शीट लोड करा (६ ओळी, त्रुटी आणि डुप्लिकेट्स)",
    templateClean: "शुद्ध एंटरप्राइझ सीआरएम शीट लोड करा (१० ओळी, तयार)",
    mappingTitle: "कॉलम मॅपिंग कॉन्फिगरेशन",
    mappingDesc: "तुमचे स्प्रेडशीट कॉलम आवश्यक एआयईसी डेटाबेस फील्डसह जुळवा.",
    targetField: "एआयईसी टार्गेट फील्ड",
    sourceHeader: "तुमचा स्प्रेडशीट कॉलम",
    mappingStatus: "स्थिती",
    required: "आवश्यक",
    optional: "पर्यायी",
    validationTitle: "सत्यापन पूर्वदृश्य आणि डुप्लिकेट तपासणी",
    validationDesc: "सिस्टमने ओळींचे सत्यापन केले आहे. डेटाबेसमध्ये समाविष्ट करण्यापूर्वी त्रुटी तपासा.",
    validRows: "आयातीसाठी तयार शुद्ध ओळी",
    invalidRows: "बाद केलेल्या ओळी (अपूर्ण माहिती)",
    duplicateRows: "डुप्लिकेट चेतावणी (डेटाबेसमध्ये आधीपासून उपलब्ध)",
    progressTitle: "प्रगतीशील पार्श्वभूमी बॅच स्थलांतर",
    importingLeads: "युझर इंटरफेस विना-अडथळा सुरू ठेवण्यासाठी लीड्स टप्प्याटप्प्याने आयात केल्या जात आहेत...",
    currentProgress: "सध्याची बॅच प्रगती",
    totalProgress: "एकूण सीआरएम डेटाबेस टार्गेट",
    importSuccessTitle: "थोक आयात यशस्वीरित्या पूर्ण झाली",
    leadsImported: "एकूण आयात केलेल्या लीड्स",
    duplicatesResolved: "डुप्लिकेट तपासले",
    batchIdLabel: "अद्वितीय आयात बॅच आयडी",
    rollbackBtn: "निवडलेली बॅच रोलबॅक करा",
    exportTitle: "निर्यात फिल्टर आणि कॉन्फिगर करा",
    exportDesc: "तुमचे सानुकूल ऑफलाइन लेजर तयार करा. गोपनीयता नियम स्वयंचलितपणे लागू होतील.",
    permissionLock: "स्पष्ट विशेषाधिकार सेटिंग्ज",
    commissionToggle: "सर्व्हेक्षक कमिशन रक्कम समाविष्ट करा",
    commissionToggleDesc: "सर्व्हेक्षक पेआउटचे फक्त प्रशासक ऑडिट लागू करते.",
    phoneMaskToggle: "संवेदनशील संपर्क क्रमांक मास्क करा",
    phoneMaskToggleDesc: "क्रमांक +91 XXXXX XXXXX म्हणून सुरक्षितपणे निर्यात करा.",
    filterStage: "लीड टप्प्यानुसार फिल्टर करा",
    filterBldType: "इमारत प्रकारानुसार फिल्टर करा",
    generateCsv: "शुद्ध CSV लेजर डाउनलोड करा",
    noLeadsFound: "निवडलेल्या फिल्टरनुसार कोणतीही लीड आढळली नाही.",
    batchLogsTitle: "ऐतिहासिक आयात बॅच इतिहास",
    batchLogsDesc: "डेटाची शुद्धता राखण्यासाठी मागील आयात सत्रे त्वरित काढून टाका.",
    noBatches: "या युझर सत्रामध्ये कोणतीही स्प्रेडशीट आयात केलेली नाही.",
    sampleDownload: "नमुना रिक्त CSV टेम्पलेट डाउनलोड करा",
    stepUpload: "अपलोड",
    stepMap: "कॉलम मॅपिंग",
    stepValidate: "सत्यापन व पूर्वदृश्य",
    stepProgress: "माइग्रेशन इंजिन"
  }
};

// Target schema configurations for AIEC Lead Fields
interface TargetFieldDef {
  key: string;
  label: string;
  required: boolean;
  type: 'string' | 'number';
  description: string;
}

const TARGET_FIELDS: TargetFieldDef[] = [
  { key: 'name', label: 'Contact Name', required: true, type: 'string', description: 'Full name of the elevator project client/contact person' },
  { key: 'phone', label: 'Contact Phone', required: true, type: 'string', description: 'Primary phone/WhatsApp with country code' },
  { key: 'email', label: 'Email Address', required: false, type: 'string', description: 'Client correspondence email address' },
  { key: 'address', label: 'Project Site Address', required: true, type: 'string', description: 'Complete physical construction site address' },
  { key: 'floors', label: 'Floors Count', required: true, type: 'number', description: 'Total levels/floors designed for elevator shaft' },
  { key: 'building_type', label: 'Building Usage Category', required: true, type: 'string', description: "Must match: residential, commercial, industrial, institutional, mixed-use" },
  { key: 'drive_type', label: 'Drive Selection', required: false, type: 'string', description: "Traction, hydraulic, or machine-room-less" },
  { key: 'capacity_persons', label: 'Passenger Capacity', required: false, type: 'number', description: "Estimated passenger weight/capacity rating" }
];

// Seed raw import simulation datasets for sandbox play
const LEGACY_BUILDER_ROWS = [
  ["Customer Name", "Contact Mobile", "Site Address", "Floors", "Use Category", "Drive Selection", "Sensitive Mail"],
  ["Nitin Gokhale", "+91 98230 11223", "Shaniwar Peth, Pune", "4", "residential", "traction", "nitin@gokhale.com"],
  ["Rohan Deshmukh", "+91 98765 43214", "Plot 45, Kothrud, Pune", "5", "commercial", "traction", ""], // DUPLICATE PHONE
  ["Builder Amit Pathak", "+91 99700 88990", "Pradhikaran, PCMC", "abc", "residential", "hydraulic", "amit@pathak.com"], // MALFORMED FLOOR (abc)
  ["", "+91 88888 77777", "Katraj Road, Pune", "3", "commercial", "", "unknown@mail.com"], // MISSING REQUIRED NAME
  ["Vikas Mehta", "+91 95555 66666", "Survey No. 62, Hinjewadi", "8", "commercial", "traction", ""], // DUPLICATE PHONE
  ["Kiran Shinde", "+91 91223 34455", "Hadapsar Industrial Area", "6", "industrial", "machine-room-less", "kiran@shinde.com"] // CLEAN ROW
];

const CLEAN_ENTERPRISE_ROWS = [
  ["Client", "Telephone", "Site Postal Address", "Total Floors", "Building Class", "Elevator Type", "Email Address"],
  ["Anil Kulkarni", "+91 98900 12345", "Senapati Bapat Road, Shivajinagar", "6", "commercial", "traction", "anil.k@SBRArcade.com"],
  ["Savita Deshpande", "+91 94220 56789", "Sahakar Nagar, Pune", "3", "residential", "hydraulic", "savita@deshpandehomes.in"],
  ["Rahul Chawla", "+91 91580 44332", "Kharadi Bypass, Pune", "12", "mixed-use", "traction", "rchawla@aerospace.in"],
  ["Vidyut Cooperatives", "+91 90110 33445", "Sadashiv Peth, Pune", "4", "residential", "", "vidyut.coop@gmail.com"],
  ["Aurobindo Pharma Lab", "+91 88050 66778", "Kurkumbh MIDC Site 4", "4", "industrial", "hydraulic", "logistics@aurobindolabs.com"],
  ["Deccan Education Society", "+91 98224 88990", "Deccan Gymkhana, Pune", "5", "institutional", "machine-room-less", "contact@deccanedu.org"],
  ["Prashant Wable Jr.", "+91 98765 43210", "Mukund Nagar, Pune", "4", "residential", "traction", "prashant@aiec.in"],
  ["Gajanan Mangal Karyalaya", "+91 94210 11221", "Alandi Road, Pune", "3", "commercial", "hydraulic", "info@gajananmangal.com"],
  ["Phoenix Marketcity Tower", "+91 20 66084000", "Viman Nagar, Pune", "10", "commercial", "traction", "leasing@phoenixmarketcity.co.in"],
  ["Symbiosis Hostel Site", "+91 98233 44556", "Lavale Hill Base, Pune", "6", "institutional", "traction", "estate@symbiosishostels.org"]
];

interface ParsedCSVRow {
  index: number;
  raw: string[];
  mappedValues: Record<string, string>;
  validationStatus: 'clean' | 'malformed' | 'duplicate';
  validationErrors: string[];
}

interface ImportBatchRecord {
  id: string;
  timestamp: string;
  fileName: string;
  importedCount: number;
  duplicateResolvedCount: number;
  leadIds: string[];
}

export const BulkLeadImportExport: React.FC<{ user: CRMUser }> = ({ user }) => {
  const { language } = useLanguage();
  const t = localizations[language] || localizations.en;

  // Active Tab: import, export, batch logs
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'batches'>('import');

  // Import flow state machine
  // 1: Upload, 2: Map Columns, 3: Preview/Validate, 4: Importing/Progress, 5: Finished Summary
  const [importStep, setImportStep] = useState<number>(1);

  // Raw file details
  const [fileName, setFileName] = useState<string>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);

  // Column mapper config (Target Field Key -> CSV Column Index as string)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Validation output
  const [parsedRows, setParsedRows] = useState<ParsedCSVRow[]>([]);
  const [duplicateResolutionAction, setDuplicateResolutionAction] = useState<'override' | 'skip'>('override');

  // Async Progressive Background Progress Engine
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentImportIndex, setCurrentImportIndex] = useState<number>(0);
  const [importedLeadsCount, setImportedLeadsCount] = useState<number>(0);
  const [duplicatesCount, setDuplicatesCount] = useState<number>(0);
  const [activeBatchId, setActiveBatchId] = useState<string>('');
  const [newlyCreatedLeadIds, setNewlyCreatedLeadIds] = useState<string[]>([]);

  // Local state batches tracking for Undo / Rollback demo
  const [importedBatches, setImportedBatches] = useState<ImportBatchRecord[]>(() => {
    const saved = localStorage.getItem('aiec_import_batches');
    return saved ? JSON.parse(saved) : [];
  });

  // Global leads reference for duplicate checks
  const [allExistingLeads, setAllExistingLeads] = useState<Lead[]>([]);

  // Export parameter states
  const [exportStageFilter, setExportStageFilter] = useState<string>('all');
  const [exportBldTypeFilter, setExportBldTypeFilter] = useState<string>('all');
  const [includeCommissions, setIncludeCommissions] = useState<boolean>(false);
  const [maskPhoneNumbers, setMaskPhoneNumbers] = useState<boolean>(true);
  const [maskEmails, setMaskEmails] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Triggering visual state update on DB modification
  const syncExistingLeads = () => {
    setAllExistingLeads(DbManager.getLeads());
  };

  useEffect(() => {
    syncExistingLeads();
    window.addEventListener('aiec_db_update', syncExistingLeads);
    return () => window.removeEventListener('aiec_db_update', syncExistingLeads);
  }, []);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4500);
  };

  // Preset spreadsheet loader (Sandbox Playground helper)
  const handleLoadTemplate = (type: 'legacy' | 'clean') => {
    const rows = type === 'legacy' ? LEGACY_BUILDER_ROWS : CLEAN_ENTERPRISE_ROWS;
    setFileName(type === 'legacy' ? "Legacy_Builder_Opportunities.csv" : "Enterprise_Clean_Leads.csv");
    setCsvHeaders(rows[0]);
    setCsvRows(rows.slice(1));
    
    // Auto-initialize column mapping guesses based on similarity
    const initialMap: Record<string, string> = {};
    const headers = rows[0];

    TARGET_FIELDS.forEach((target) => {
      // Find matching column header indexes
      const matchingIdx = headers.findIndex((h) => {
        const hClean = h.toLowerCase();
        const tClean = target.key.toLowerCase();
        const labelClean = target.label.toLowerCase();
        return (
          hClean.includes(tClean) || 
          tClean.includes(hClean) ||
          hClean.includes(labelClean) ||
          labelClean.includes(hClean) ||
          (target.key === 'phone' && hClean.includes('mobile')) ||
          (target.key === 'address' && hClean.includes('site')) ||
          (target.key === 'building_type' && hClean.includes('use')) ||
          (target.key === 'building_type' && hClean.includes('class')) ||
          (target.key === 'drive_type' && hClean.includes('elevator')) ||
          (target.key === 'floors' && hClean.includes('floor'))
        );
      });
      if (matchingIdx !== -1) {
        initialMap[target.key] = matchingIdx.toString();
      }
    });

    setColumnMapping(initialMap);
    setImportStep(2); // Progress to Column mapping step automatically
    triggerToast(`Sandbox loaded: ${rows.length - 1} spreadsheet records parsed.`);
  };

  // Native CSV text parser (without external library dependencies, fully resilient)
  const parseCSVText = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
    const dataRows = lines.slice(1).map(line => {
      // Match comma separation keeping quotes intact
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      return matches.map(cell => cell.replace(/^["']|["']$/g, '').trim());
    });

    setFileName("Imported_User_Sheet.csv");
    setCsvHeaders(headers);
    setCsvRows(dataRows);
    setImportStep(2);
  };

  // Native HTML File drop & select logic
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSVText(text);
    };
    reader.readAsText(file);
  };

  // Handle Dynamic Column Selection Update
  const updateColumnMap = (targetKey: string, csvColIdx: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [targetKey]: csvColIdx
    }));
  };

  // Check if mapping satisfies all required target fields
  const isMappingValid = useMemo(() => {
    return TARGET_FIELDS.filter(f => f.required).every(f => columnMapping[f.key] !== undefined && columnMapping[f.key] !== "");
  }, [columnMapping]);

  // Execute Pre-Migration Validations on mapped rows
  const handleRunValidation = () => {
    if (!isMappingValid) return;

    const results: ParsedCSVRow[] = csvRows.map((rawRow, idx) => {
      const mappedValues: Record<string, string> = {};
      const validationErrors: string[] = [];
      let status: 'clean' | 'malformed' | 'duplicate' = 'clean';

      // Map values
      TARGET_FIELDS.forEach(field => {
        const csvIdx = columnMapping[field.key];
        if (csvIdx !== undefined && csvIdx !== "") {
          mappedValues[field.key] = rawRow[parseInt(csvIdx)] || '';
        } else {
          mappedValues[field.key] = '';
        }
      });

      // 1. Required fields presence checks
      TARGET_FIELDS.filter(f => f.required).forEach(reqField => {
        const val = mappedValues[reqField.key];
        if (!val || val.trim() === '') {
          validationErrors.push(`Required field '${reqField.label}' cannot be empty.`);
          status = 'malformed';
        }
      });

      // 2. Numerical format checks
      const floorsVal = mappedValues['floors'];
      if (floorsVal && isNaN(Number(floorsVal))) {
        validationErrors.push(`Floors Count must be a valid number, got '${floorsVal}'.`);
        status = 'malformed';
      }

      // 3. Category matching check
      const bldTypeVal = mappedValues['building_type']?.toLowerCase().trim();
      const validCategories = ['residential', 'commercial', 'industrial', 'institutional', 'mixed-use'];
      if (bldTypeVal && !validCategories.includes(bldTypeVal)) {
        validationErrors.push(`Building usage '${bldTypeVal}' invalid. Remapping to 'commercial' automatically.`);
        mappedValues['building_type'] = 'commercial';
      }

      // 4. Duplicate checks (matching phone number against DbManager)
      const phoneVal = mappedValues['phone']?.trim().replace(/\s+/g, '');
      if (status !== 'malformed' && phoneVal) {
        const hasMatch = allExistingLeads.some(ex => {
          const exPhone = ex.contactInfo.phone?.trim().replace(/\s+/g, '');
          return exPhone === phoneVal;
        });
        if (hasMatch) {
          status = 'duplicate';
          validationErrors.push(`Duplicate: Contact number matches an existing lead/customer in AIEC database.`);
        }
      }

      return {
        index: idx,
        raw: rawRow,
        mappedValues,
        validationStatus: status,
        validationErrors
      };
    });

    setParsedRows(results);
    setImportStep(3);
  };

  // Breakdown of validation types
  const validatedCleanRows = useMemo(() => parsedRows.filter(r => r.validationStatus === 'clean'), [parsedRows]);
  const validatedDuplicateRows = useMemo(() => parsedRows.filter(r => r.validationStatus === 'duplicate'), [parsedRows]);
  const validatedMalformedRows = useMemo(() => parsedRows.filter(r => r.validationStatus === 'malformed'), [parsedRows]);

  // Execute Background Onboarding Engine (simulating chunking process)
  const handleStartImport = () => {
    setIsProcessing(true);
    setImportStep(4);
    setCurrentImportIndex(0);
    setImportedLeadsCount(0);
    setDuplicatesCount(0);
    setNewlyCreatedLeadIds([]);

    const batchId = `BATCH_MIGRATE_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveBatchId(batchId);

    // Filter rows to import based on validation
    // Malformed rows are strictly ignored
    // Duplicate rows are imported ONLY if duplicateResolutionAction is override
    const eligibleRows = parsedRows.filter(r => {
      if (r.validationStatus === 'malformed') return false;
      if (r.validationStatus === 'duplicate' && duplicateResolutionAction === 'skip') return false;
      return true;
    });

    if (eligibleRows.length === 0) {
      setIsProcessing(false);
      setImportStep(5);
      triggerToast("No eligible rows selected for import.");
      return;
    }

    let currentIndex = 0;
    const addedIds: string[] = [];

    const interval = setInterval(() => {
      if (currentIndex >= eligibleRows.length) {
        clearInterval(interval);
        setIsProcessing(false);
        setImportStep(5);

        // Record Batch Log
        const newBatchRecord: ImportBatchRecord = {
          id: batchId,
          timestamp: new Date().toISOString(),
          fileName: fileName,
          importedCount: addedIds.length,
          duplicateResolvedCount: eligibleRows.filter(r => r.validationStatus === 'duplicate').length,
          leadIds: addedIds
        };

        const updatedBatches = [newBatchRecord, ...importedBatches];
        setImportedBatches(updatedBatches);
        localStorage.setItem('aiec_import_batches', JSON.stringify(updatedBatches));

        triggerToast(`Onboarding complete! ${addedIds.length} pre-existing leads added securely.`);
        return;
      }

      // Process 1 lead at a time
      const row = eligibleRows[currentIndex];
      const vals = row.mappedValues;

      // Construct a valid Lead entity adhering to requirements
      const newLead: Lead = {
        id: `imported_lead_${Date.now()}_${currentIndex}`,
        stage: 'captured', // Initial captured phase
        surveyorId: 'amit_sharma', // Assign default HQ manager surveyor
        contactInfo: {
          name: vals.name,
          phone: vals.phone,
          email: vals.email || undefined,
          role: (vals.building_type === 'residential' ? 'owner' : 'facility_manager') as any,
          companyName: vals.building_type === 'commercial' ? 'Migrated Enterprise' : undefined,
          consentGiven: true
        },
        buildingInfo: {
          address: vals.address,
          floors: parseInt(vals.floors) || 3,
          type: (vals.building_type || 'commercial') as any,
          driveType: (vals.drive_type || 'traction') as any,
          capacityPersons: parseInt(vals.capacity_persons) || 6,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Custom property tag for grouping & safety rollback
      (newLead as any).import_batch_id = batchId;

      // Write to Database
      DbManager.addLead(newLead);
      addedIds.push(newLead.id);

      // Update counters
      setNewlyCreatedLeadIds(prev => [...prev, newLead.id]);
      setImportedLeadsCount(prev => prev + 1);
      if (row.validationStatus === 'duplicate') {
        setDuplicatesCount(prev => prev + 1);
      }

      currentIndex++;
      setCurrentImportIndex(currentIndex);
    }, 200); // 200ms sleep chunking to showcase smooth progressive UI
  };

  // Rollback Batch Function
  const handleRollback = (batchId: string) => {
    const targetBatch = importedBatches.find(b => b.id === batchId);
    if (!targetBatch) return;

    // Remove leads that match the leadIds
    const currentLeads = DbManager.getLeads();
    const cleanLeads = currentLeads.filter(l => !targetBatch.leadIds.includes(l.id));
    
    // Save to Database
    localStorage.setItem('aiec_leads', JSON.stringify(cleanLeads));
    window.dispatchEvent(new Event('aiec_db_update'));

    // Remove batch from logs
    const remainingBatches = importedBatches.filter(b => b.id !== batchId);
    setImportedBatches(remainingBatches);
    localStorage.setItem('aiec_import_batches', JSON.stringify(remainingBatches));

    triggerToast(`Rollback complete. Removed ${targetBatch.importedCount} leads assigned to batch.`);
  };

  // EXPORT PROCESSOR (CSV Downloader)
  const handleExportCSV = () => {
    // Apply Filters
    let filteredList = allExistingLeads;

    if (exportStageFilter !== 'all') {
      filteredList = filteredList.filter(l => l.stage === exportStageFilter);
    }
    if (exportBldTypeFilter !== 'all') {
      filteredList = filteredList.filter(l => l.buildingInfo.type === exportBldTypeFilter);
    }

    if (filteredList.length === 0) {
      triggerToast(t.noLeadsFound);
      return;
    }

    // Build CSV Headers based on permissions toggle
    const headers = [
      "Lead_ID", "Contact_Name", "Phone", "Email", "Site_Address", "Floors", "Building_Type", "Drive_Type"
    ];

    // Explicit Admin audit rule check (Include surveyor commission only if checked & authorized)
    if (includeCommissions && user.role === 'admin') {
      headers.push("Surveyor_Commission_Payout");
    }

    const csvContent = [
      headers.join(','),
      ...filteredList.map(lead => {
        // Enforce consumer privacy filters
        let phoneStr = lead.contactInfo.phone;
        if (maskPhoneNumbers) {
          phoneStr = phoneStr.replace(/(\+\d{2}\s*)?\d{5}(\d{5})/, "+91 XXXXX $2");
        }

        let emailStr = lead.contactInfo.email || '';
        if (maskEmails && emailStr) {
          emailStr = "confidential@aiec.com";
        }

        const cols = [
          `"${lead.id}"`,
          `"${lead.contactInfo.name}"`,
          `"${phoneStr}"`,
          `"${emailStr}"`,
          `"${lead.buildingInfo.address.replace(/"/g, '""')}"`,
          lead.buildingInfo.floors,
          `"${lead.buildingInfo.type}"`,
          `"${lead.buildingInfo.driveType || 'traction'}"`
        ];

        if (includeCommissions && user.role === 'admin') {
          cols.push(lead.commissionEarned || 0);
        }

        return cols.join(',');
      })
    ].join('\n');

    // Web Browser Blob download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AIEC_CRM_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`Downloaded CRM Export Ledger (${filteredList.length} leads).`);
  };

  // Ascension Line timeline indicators for import steps
  const stepsList = [
    { num: 1, label: t.stepUpload },
    { num: 2, label: t.stepMap },
    { num: 3, label: t.stepValidate },
    { num: 4, label: t.stepProgress }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER WITH PROGRESS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            AIEC CRM MODULE 5 • SCREEN 10
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5">
            {t.subtitle}
          </p>
        </div>

        {/* Dynamic progress bar requested by user guidelines */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] flex flex-col justify-center shadow-xs">
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Current Batch Progress: {isProcessing ? Math.round((currentImportIndex / csvRows.length) * 100) : 0}%</span>
            <span>Total CRM Database Achievement: {allExistingLeads.length} Leads</span>
          </div>
          <div className="w-56 h-2 bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div
              className="absolute top-0 bottom-0 left-0 bg-antiquegold rounded-full transition-all duration-300"
              style={{ width: `${isProcessing ? (currentImportIndex / csvRows.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* TOAST SUCCESS NOTIFICATIONS */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-royalemerald text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRIMARY NAVIGATION TABS */}
      <div className="flex border-b border-[#e5dfd4]/60 gap-4">
        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 text-xs uppercase tracking-wider font-mono font-black border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'import'
              ? 'border-antiquegold text-charcoal'
              : 'border-transparent text-warmgray hover:text-charcoal'
          }`}
        >
          <FileSpreadsheet className="w-4.5 h-4.5" />
          <span>{t.tabImport}</span>
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`pb-3 text-xs uppercase tracking-wider font-mono font-black border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'export'
              ? 'border-antiquegold text-charcoal'
              : 'border-transparent text-warmgray hover:text-charcoal'
          }`}
        >
          <Download className="w-4.5 h-4.5" />
          <span>{t.tabExport}</span>
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 text-xs uppercase tracking-wider font-mono font-black border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'batches'
              ? 'border-antiquegold text-charcoal'
              : 'border-transparent text-warmgray hover:text-charcoal'
          }`}
        >
          <Database className="w-4.5 h-4.5" />
          <span>{t.tabBatches} ({importedBatches.length})</span>
        </button>
      </div>

      {/* TAB 1: SHEET IMPORT WIZARD */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* THE ASCENSION LINE STEP INDICATOR (3 SPAN) */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-5 space-y-4">
              <span className="text-[10px] uppercase font-mono font-black text-warmgray tracking-widest block">
                MIGRATION JOURNEY
              </span>
              
              <div className="relative pl-6 space-y-6">
                {/* Vertical elevator rail (The Ascension Line Motif) */}
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#e5dfd4]">
                  <div
                    className="absolute top-0 w-full bg-antiquegold transition-all duration-500"
                    style={{ height: `${((importStep - 1) / (stepsList.length - 1)) * 100}%` }}
                  />
                </div>

                {stepsList.map((step) => {
                  const isActive = importStep === step.num;
                  const isCompleted = importStep > step.num;

                  return (
                    <div key={step.num} className="relative flex items-center gap-3">
                      {/* Interactive Floor Indicator bullet */}
                      <div className={`absolute -left-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-white border-antiquegold ring-4 ring-antiquegold/10 z-10 scale-110'
                          : isCompleted
                          ? 'bg-royalemerald border-royalemerald text-white z-10'
                          : 'bg-[#F8F6F1] border-[#e5dfd4] text-warmgray'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-3 h-3 text-white" />
                        ) : (
                          <span className="text-[9px] font-mono font-bold">{step.num}</span>
                        )}
                      </div>

                      <div className="pl-4">
                        <span className={`text-[10px] font-mono uppercase tracking-wider block leading-none font-bold ${
                          isActive ? 'text-antiquegold font-extrabold' : 'text-warmgray'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {importStep > 1 && (
                <div className="pt-4 border-t border-[#e5dfd4]/40">
                  <button
                    onClick={() => {
                      setImportStep(1);
                      setFileName('');
                      setCsvRows([]);
                      setCsvHeaders([]);
                    }}
                    className="text-[10px] uppercase font-mono font-black text-[#B23B3B] hover:underline flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel and Start Over</span>
                  </button>
                </div>
              )}
            </Card>

            {/* SANDBOX TEST SPREADSHEETS LOAD CARD */}
            {importStep === 1 && (
              <Card className="p-5 space-y-4 border border-dashed border-antiquegold/40">
                <span className="text-[10px] uppercase font-mono font-bold text-antiquegold tracking-wider block">
                  {t.loadTemplate}
                </span>
                <p className="text-[10px] text-warmgray font-semibold leading-relaxed">
                  No CSV ready? Load our pre-configured simulator sheets to preview column mappings, malformed rows, duplicate warnings, and the chunked progressive import engine!
                </p>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handleLoadTemplate('legacy')}
                    className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-lg text-[10px] font-bold text-charcoal hover:border-antiquegold transition-all text-left flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#B8873D] shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-black">{t.templateLegacy}</span>
                      <span className="text-[9px] text-warmgray font-normal">Ideal for testing data-mapping errors & duplicate warning handlers.</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLoadTemplate('clean')}
                    className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-lg text-[10px] font-bold text-charcoal hover:border-royalemerald transition-all text-left flex items-start gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-royalemerald shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-black">{t.templateClean}</span>
                      <span className="text-[9px] text-warmgray font-normal">Clean dataset to witness 10 flawless leads imported cleanly.</span>
                    </div>
                  </button>
                </div>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: MAIN CONTENT (9 SPAN) */}
          <div className="lg:col-span-9 space-y-6">

            {/* STEP 1: FILE UPLOAD CONTAINER */}
            {importStep === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card className="p-10 border-2 border-dashed border-[#e5dfd4] rounded-3xl bg-white hover:border-antiquegold transition-all duration-300">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-antiquegold/10 flex items-center justify-center text-antiquegold">
                      <UploadCloud className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold text-charcoal">{t.uploadTitle}</h3>
                      <p className="text-xs text-warmgray font-semibold max-w-md mx-auto">{t.uploadDesc}</p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".csv, .txt"
                      className="hidden"
                    />

                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="primary"
                      className="py-2.5 px-6 font-bold uppercase tracking-wider text-xs flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Browse Files</span>
                    </Button>
                  </div>
                </Card>

                {/* TEMPLATE SCHEMATICS COMPLIANCE ADVISORY */}
                <Card className="p-6 space-y-4">
                  <h4 className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                    <Shield className="w-4.5 h-4.5 text-royalemerald" />
                    <span>Dynamic Compliance Schematics</span>
                  </h4>
                  <p className="text-[11px] text-warmgray leading-relaxed font-semibold">
                    The AIEC custom CRM automatically reads header names and maps them recursively. For smooth migration, ensure that your rows contain at least <strong>Name</strong>, <strong>Phone Number</strong>, <strong>Project Address</strong>, and <strong>Floors Count</strong>.
                  </p>
                </Card>
              </motion.div>
            )}

            {/* STEP 2: SCHEMA COLUMN MAPPING */}
            {importStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <Card className="p-6 space-y-4">
                  <div className="border-b border-[#e5dfd4]/40 pb-3">
                    <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                      <Layers className="w-4.5 h-4.5 text-antiquegold" />
                      <span>{t.mappingTitle}</span>
                    </h3>
                    <p className="text-xs text-warmgray mt-0.5">{t.mappingDesc}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 text-[10px] uppercase font-mono font-extrabold text-warmgray border-b border-[#e5dfd4]/40 pb-2">
                      <div className="col-span-4">{t.targetField}</div>
                      <div className="col-span-5">{t.sourceHeader}</div>
                      <div className="col-span-3 text-right">{t.mappingStatus}</div>
                    </div>

                    {TARGET_FIELDS.map((target) => {
                      const currentMappedIdx = columnMapping[target.key];
                      const isMapped = currentMappedIdx !== undefined && currentMappedIdx !== "";

                      return (
                        <div
                          key={target.key}
                          className="grid grid-cols-12 gap-4 items-center border-b border-[#e5dfd4]/20 pb-3"
                        >
                          {/* Target AIEC database field details */}
                          <div className="col-span-4 space-y-0.5">
                            <span className="text-xs font-bold text-charcoal block">{target.label}</span>
                            <span className="text-[9px] text-warmgray font-mono block leading-tight">{target.description}</span>
                          </div>

                          {/* Matching spreadsheet header selection */}
                          <div className="col-span-5">
                            <select
                              value={currentMappedIdx || ''}
                              onChange={(e) => updateColumnMap(target.key, e.target.value)}
                              className="w-full bg-alabaster border border-[#e5dfd4] rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-antiquegold text-charcoal"
                            >
                              <option value="">-- Skip Field --</option>
                              {csvHeaders.map((hdr, idx) => (
                                <option key={idx} value={idx.toString()}>{hdr}</option>
                              ))}
                            </select>
                          </div>

                          {/* Compliance state indicator badge */}
                          <div className="col-span-3 text-right">
                            {isMapped ? (
                              <Badge variant="success" className="text-[9px]">Mapped</Badge>
                            ) : target.required ? (
                              <Badge variant="error" className="text-[9px]">Required Mapping</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px]">Optional</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* FORM TRIGGER ACTIONS */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#e5dfd4]/40">
                    <button
                      onClick={() => setImportStep(1)}
                      className="text-xs uppercase font-mono font-black text-warmgray hover:text-charcoal"
                    >
                      Back to upload
                    </button>

                    <Button
                      onClick={handleRunValidation}
                      disabled={!isMappingValid}
                      variant={isMappingValid ? 'primary' : 'secondary'}
                      className="py-2.5 px-6 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5"
                    >
                      <span>{t.stepValidate}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* STEP 3: INTEGRITY PREVIEW & DUP-RESOLUTION */}
            {importStep === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* DUP RESOLUTION RULE BOX */}
                <Card className="p-6 space-y-4">
                  <div className="border-b border-[#e5dfd4]/40 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                        <AlertCircle className="w-4.5 h-4.5 text-antiquegold" />
                        <span>{t.validationTitle}</span>
                      </h3>
                      <p className="text-xs text-warmgray mt-0.5">{t.validationDesc}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono bg-antiquegold/10 text-antiquegold px-2 py-1 rounded-sm">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{parsedRows.length} Total Rows</span>
                    </div>
                  </div>

                  {/* DUPLICATE HANDLING AUTOMATION CONTROLS */}
                  <div className="p-4 bg-alabaster rounded-xl border border-[#e5dfd4] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <h4 className="text-xs font-bold text-charcoal">Duplicate Resolution System Rule</h4>
                      <p className="text-[10px] text-warmgray mt-0.5 font-semibold">How should AIEC handle spreadsheet contact numbers that already exist?</p>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setDuplicateResolutionAction('override')}
                        className={`px-3 py-1.5 text-[10px] uppercase font-mono font-black rounded-lg border transition-all ${
                          duplicateResolutionAction === 'override'
                            ? 'bg-antiquegold border-antiquegold text-white'
                            : 'bg-white border-[#e5dfd4] text-charcoal hover:bg-alabaster'
                        }`}
                      >
                        Import duplicates regardless
                      </button>

                      <button
                        onClick={() => setDuplicateResolutionAction('skip')}
                        className={`px-3 py-1.5 text-[10px] uppercase font-mono font-black rounded-lg border transition-all ${
                          duplicateResolutionAction === 'skip'
                            ? 'bg-[#B23B3B] border-[#B23B3B] text-white'
                            : 'bg-white border-[#e5dfd4] text-charcoal hover:bg-alabaster'
                        }`}
                      >
                        Skip duplicate rows
                      </button>
                    </div>
                  </div>

                  {/* INTEGRITY VALIDATION SCORE CARD STATS */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-royalemerald/5 border border-royalemerald/10 rounded-xl text-center">
                      <span className="text-lg font-serif font-black text-royalemerald block">{validatedCleanRows.length}</span>
                      <span className="text-[10px] font-mono font-bold text-warmgray">{t.validRows}</span>
                    </div>

                    <div className="p-3 bg-[#B23B3B]/5 border border-[#B23B3B]/10 rounded-xl text-center">
                      <span className="text-lg font-serif font-black text-[#B23B3B] block">{validatedMalformedRows.length}</span>
                      <span className="text-[10px] font-mono font-bold text-warmgray">{t.invalidRows}</span>
                    </div>

                    <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-center">
                      <span className="text-lg font-serif font-black text-yellow-600 block">{validatedDuplicateRows.length}</span>
                      <span className="text-[10px] font-mono font-bold text-warmgray">{t.duplicateRows}</span>
                    </div>
                  </div>

                  {/* DETAILED LEDGER GRID */}
                  <div className="overflow-x-auto max-h-72 border border-[#e5dfd4]/40 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-alabaster font-mono font-extrabold text-warmgray border-b border-[#e5dfd4]/60 text-[9px] uppercase">
                          <th className="p-2.5 pl-4">Row</th>
                          <th className="p-2.5">Mapped Name</th>
                          <th className="p-2.5">Mapped Phone</th>
                          <th className="p-2.5">Project Address</th>
                          <th className="p-2.5">Floors</th>
                          <th className="p-2.5 text-right pr-4">Validation Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5dfd4]/30">
                        {parsedRows.map((row) => {
                          const status = row.validationStatus;
                          return (
                            <React.Fragment key={row.index}>
                              <tr className={`${status === 'malformed' ? 'bg-[#B23B3B]/5' : status === 'duplicate' ? 'bg-yellow-500/5' : ''}`}>
                                <td className="p-2.5 pl-4 font-mono font-bold text-warmgray text-[10px]">{row.index + 1}</td>
                                <td className="p-2.5 font-bold text-charcoal">{row.mappedValues.name || <span className="text-[#B23B3B]">Empty</span>}</td>
                                <td className="p-2.5 font-semibold text-charcoal">{row.mappedValues.phone || <span className="text-[#B23B3B]">Empty</span>}</td>
                                <td className="p-2.5 font-mono text-[10px] text-warmgray truncate max-w-xs">{row.mappedValues.address || <span className="text-[#B23B3B]">Empty</span>}</td>
                                <td className="p-2.5 font-mono text-[11px] font-bold text-charcoal">{row.mappedValues.floors || <span className="text-[#B23B3B]">Empty</span>}</td>
                                <td className="p-2.5 text-right pr-4">
                                  {status === 'clean' ? (
                                    <Badge variant="success" className="text-[8px]">Flawless</Badge>
                                  ) : status === 'duplicate' ? (
                                    <Badge variant="outline" className="text-[8px] text-yellow-600 border-yellow-600">Duplicate Check</Badge>
                                  ) : (
                                    <Badge variant="error" className="text-[8px]">Rejected</Badge>
                                  )}
                                </td>
                              </tr>
                              {row.validationErrors.length > 0 && (
                                <tr className="bg-alabaster/40">
                                  <td colSpan={6} className="p-2 pl-8 pb-3 text-[10px] text-[#B23B3B] font-bold">
                                    {row.validationErrors.map((err, errIdx) => (
                                      <div key={errIdx} className="flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{err}</span>
                                      </div>
                                    ))}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* EXECUTE COMMITTAL FORM ACTIONS */}
                  <div className="flex justify-between pt-4 border-t border-[#e5dfd4]/40">
                    <button
                      onClick={() => setImportStep(2)}
                      className="text-xs uppercase font-mono font-black text-warmgray hover:text-charcoal"
                    >
                      Back to mapping
                    </button>

                    <Button
                      onClick={handleStartImport}
                      variant="success"
                      className="py-2.5 px-6 font-bold uppercase tracking-wider text-xs text-white bg-royalemerald hover:bg-[#07362a]"
                    >
                      <span>Commit Leads to CRM Database</span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* STEP 4: PROGRESSIVE CHUNK PROCESSING */}
            {importStep === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="p-8 text-center space-y-6">
                  <div className="w-12 h-12 bg-antiquegold/10 text-antiquegold rounded-full flex items-center justify-center mx-auto animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-charcoal">{t.progressTitle}</h3>
                    <p className="text-xs text-warmgray font-semibold max-w-md mx-auto">{t.importingLeads}</p>
                  </div>

                  {/* PROGRESS BAR FEEDBACK (REQUIRED) */}
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="flex justify-between text-[11px] font-mono font-bold text-charcoal">
                      <span>Row {currentImportIndex} of {csvRows.length}</span>
                      <span>{Math.round((currentImportIndex / csvRows.length) * 100)}%</span>
                    </div>

                    <div className="w-full h-3 bg-[#e5dfd4]/40 rounded-full overflow-hidden relative border border-[#e5dfd4]/60">
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-royalemerald rounded-full transition-all duration-200"
                        style={{ width: `${(currentImportIndex / csvRows.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* STEP 5: SUCCESS & STATISTICS SUMMARY */}
            {importStep === 5 && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="p-8 text-center space-y-6 border border-royalemerald/30 shadow-sm">
                  <div className="w-14 h-14 bg-royalemerald/10 text-royalemerald rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-serif text-xl font-bold text-charcoal">{t.importSuccessTitle}</h3>
                    <p className="text-xs text-warmgray font-semibold max-w-sm mx-auto">Spreadsheet rows successfully processed and integrated into append-only records.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
                    <div className="p-4 bg-alabaster rounded-2xl border border-[#e5dfd4]/50">
                      <span className="text-2xl font-serif font-black text-charcoal block leading-none">{importedLeadsCount}</span>
                      <span className="text-[9px] uppercase font-mono font-extrabold text-warmgray block mt-2">{t.leadsImported}</span>
                    </div>

                    <div className="p-4 bg-alabaster rounded-2xl border border-[#e5dfd4]/50">
                      <span className="text-2xl font-serif font-black text-charcoal block leading-none">{duplicatesCount}</span>
                      <span className="text-[9px] uppercase font-mono font-extrabold text-warmgray block mt-2">{t.duplicatesResolved}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-alabaster rounded-xl border border-[#e5dfd4]/60 max-w-sm mx-auto flex items-center justify-between text-[10px] font-mono font-bold text-charcoal">
                    <span>{t.batchIdLabel}:</span>
                    <span className="text-antiquegold">{activeBatchId}</span>
                  </div>

                  <div className="pt-4 flex gap-4 justify-center">
                    <Button
                      onClick={() => {
                        setImportStep(1);
                        setFileName('');
                        setCsvRows([]);
                        setCsvHeaders([]);
                      }}
                      variant="outline"
                      className="py-2 px-5 text-xs font-bold uppercase tracking-wider text-charcoal border-[#e5dfd4]"
                    >
                      Import Another Sheet
                    </Button>

                    <Button
                      onClick={() => setActiveTab('batches')}
                      variant="primary"
                      className="py-2 px-5 text-xs font-bold uppercase tracking-wider text-white"
                    >
                      Review Import Batches
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

          </div>
        </div>
      )}

      {/* TAB 2: CRM LEDGER EXPORT */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: CONTROLS & PARAMS (8 SPAN) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 space-y-6">
              
              <div className="border-b border-[#e5dfd4]/40 pb-3">
                <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                  <Download className="w-4.5 h-4.5 text-royalemerald" />
                  <span>{t.exportTitle}</span>
                </h3>
                <p className="text-xs text-warmgray mt-0.5">{t.exportDesc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* STAGE FILTER SELECTOR */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-bold text-charcoal block">{t.filterStage}</label>
                  <select
                    value={exportStageFilter}
                    onChange={(e) => setExportStageFilter(e.target.value)}
                    className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl px-3 py-2.5 text-xs font-semibold text-charcoal focus:outline-none focus:border-antiquegold"
                  >
                    <option value="all">All Stages</option>
                    <option value="captured">Captured</option>
                    <option value="assigned">Assigned</option>
                    <option value="contacted">Contacted</option>
                    <option value="survey_done">Survey Done</option>
                    <option value="quoted">Quoted</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>

                {/* BUILDING TYPE FILTER SELECTOR */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-bold text-charcoal block">{t.filterBldType}</label>
                  <select
                    value={exportBldTypeFilter}
                    onChange={(e) => setExportBldTypeFilter(e.target.value)}
                    className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl px-3 py-2.5 text-xs font-semibold text-charcoal focus:outline-none focus:border-antiquegold"
                  >
                    <option value="all">All Usage Categories</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="institutional">Institutional</option>
                    <option value="mixed-use">Mixed-Use</option>
                  </select>
                </div>

              </div>

              {/* PRIVACY & COMMISSION PERMISSIONS TOGGLES */}
              <div className="space-y-4 pt-4 border-t border-[#e5dfd4]/40">
                <h4 className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-antiquegold" />
                  <span>{t.permissionLock}</span>
                </h4>

                <div className="space-y-3.5">
                  
                  {/* SURVEYOR COMMISSION CONTROL */}
                  <div className="flex items-start justify-between p-3.5 bg-alabaster rounded-xl border border-[#e5dfd4]/40">
                    <div className="space-y-0.5 max-w-lg">
                      <span className="text-xs font-bold text-charcoal block">{t.commissionToggle}</span>
                      <span className="text-[10px] text-warmgray font-semibold block leading-relaxed">{t.phoneMaskToggleDesc}</span>
                    </div>

                    <div className="relative inline-flex items-center cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={includeCommissions}
                        disabled={user.role !== 'admin'}
                        onChange={(e) => setIncludeCommissions(e.target.checked)}
                        className="sr-only peer"
                        id="commission-toggle"
                      />
                      <div className="w-10 h-5.5 bg-[#e5dfd4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-royalemerald"></div>
                    </div>
                  </div>

                  {/* CUSTOMER PHONE MASK CONTROL */}
                  <div className="flex items-start justify-between p-3.5 bg-alabaster rounded-xl border border-[#e5dfd4]/40">
                    <div className="space-y-0.5 max-w-lg">
                      <span className="text-xs font-bold text-charcoal block">{t.phoneMaskToggle}</span>
                      <span className="text-[10px] text-warmgray font-semibold block leading-relaxed">{t.phoneMaskToggleDesc}</span>
                    </div>

                    <div className="relative inline-flex items-center cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={maskPhoneNumbers}
                        onChange={(e) => setMaskPhoneNumbers(e.target.checked)}
                        className="sr-only peer"
                        id="phone-mask-toggle"
                      />
                      <div className="w-10 h-5.5 bg-[#e5dfd4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-royalemerald"></div>
                    </div>
                  </div>

                  {/* CUSTOMER EMAIL MASK CONTROL */}
                  <div className="flex items-start justify-between p-3.5 bg-alabaster rounded-xl border border-[#e5dfd4]/40">
                    <div className="space-y-0.5 max-w-lg">
                      <span className="text-xs font-bold text-charcoal block">Mask Sensitive Client Correspondence Emails</span>
                      <span className="text-[10px] text-warmgray font-semibold block leading-relaxed">Protects corporate privacy by masking primary email addresses in CSV ledger dumps.</span>
                    </div>

                    <div className="relative inline-flex items-center cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={maskEmails}
                        onChange={(e) => setMaskEmails(e.target.checked)}
                        className="sr-only peer"
                        id="email-mask-toggle"
                      />
                      <div className="w-10 h-5.5 bg-[#e5dfd4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-royalemerald"></div>
                    </div>
                  </div>

                </div>
              </div>

              {/* ACTION BTN STICKY */}
              <div className="pt-2">
                <Button
                  onClick={handleExportCSV}
                  variant="primary"
                  className="w-full py-3.5 font-bold uppercase tracking-wider text-xs justify-center text-white bg-royalemerald hover:bg-[#07362a] flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>{t.generateCsv}</span>
                </Button>
              </div>

            </Card>
          </div>

          {/* RIGHT SIDE: SAMPLE EXPORT HEADER PREVIEW (4 SPAN) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 space-y-4">
              <span className="text-[10px] uppercase font-mono font-black text-antiquegold tracking-widest block">
                EXPORT SCHEMA LEDGER PREVIEW
              </span>
              <p className="text-[11px] text-warmgray font-semibold leading-relaxed">
                Here is a conceptual mapping preview of your exported columns based on active visibility privileges:
              </p>

              <div className="space-y-2 border-t border-[#e5dfd4]/40 pt-3">
                {[
                  { col: "Lead_ID", visible: true, type: "alphanumeric (Primary key)" },
                  { col: "Contact_Name", visible: true, type: "text string" },
                  { col: "Phone", visible: true, type: maskPhoneNumbers ? "masked format" : "raw dial" },
                  { col: "Email", visible: true, type: maskEmails ? "masked format" : "raw string" },
                  { col: "Site_Address", visible: true, type: "text block" },
                  { col: "Floors", visible: true, type: "numeric integer" },
                  { col: "Building_Type", visible: true, type: "taxonomy category" },
                  { col: "Surveyor_Commission_Payout", visible: includeCommissions && user.role === 'admin', type: "numerical currency" }
                ].map((colPreview, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] py-1 border-b border-[#e5dfd4]/10">
                    <span className="font-mono font-bold text-charcoal">{colPreview.col}</span>
                    {colPreview.visible ? (
                      <span className="text-royalemerald font-semibold bg-royalemerald/5 px-2 py-0.5 rounded-sm">{colPreview.type}</span>
                    ) : (
                      <span className="text-[#B23B3B] font-semibold bg-[#B23B3B]/5 px-2 py-0.5 rounded-sm">Disabled</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* TAB 3: HISTORIC BATCH LOGS & ROLLBACK */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="border-b border-[#e5dfd4]/40 pb-3">
              <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                <Database className="w-4.5 h-4.5 text-[#0E4B3D]" />
                <span>{t.batchLogsTitle}</span>
              </h3>
              <p className="text-xs text-warmgray mt-0.5">{t.batchLogsDesc}</p>
            </div>

            {importedBatches.length > 0 ? (
              <div className="space-y-4">
                {importedBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="p-4 bg-alabaster rounded-2xl border border-[#e5dfd4]/50 flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all hover:border-antiquegold/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-charcoal">{batch.id}</span>
                        <span className="text-[10px] font-semibold text-warmgray bg-white border border-[#e5dfd4]/40 px-2 py-0.5 rounded-md">{batch.fileName}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[10px] text-warmgray font-semibold">
                        <span>Timestamp: {new Date(batch.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span className="text-royalemerald">{batch.importedCount} leads successfully imported</span>
                        <span>•</span>
                        <span className="text-yellow-600">{batch.duplicateResolvedCount} duplicates mapped</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex gap-2">
                      <Button
                        onClick={() => handleRollback(batch.id)}
                        variant="primary"
                        className="py-1.5 px-3.5 text-[10px] font-bold uppercase tracking-wider text-white bg-[#B23B3B] hover:bg-[#912d2d] flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-white" />
                        <span>{t.rollbackBtn}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-warmgray font-semibold text-xs space-y-2 bg-white rounded-2xl border border-dashed border-[#e5dfd4]/50">
                <Database className="w-10 h-10 text-warmgray/40 mx-auto" />
                <p>{t.noBatches}</p>
              </div>
            )}
          </Card>
        </div>
      )}

    </div>
  );
};
