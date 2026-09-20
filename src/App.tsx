import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole, UserStatus } from './types';
import { DbManager } from './lib/db';
import { Card, Button } from './components/Common';
import { 
  AdminDashboard, 
  SurveyorDashboard, 
  TechnicianDashboard, 
  CustomerDashboard, 
  SupplierDashboard 
} from './components/Dashboards';
import { RoleSelectionWizard, AdminRoleManagement } from './components/RoleSelectionWizard';
import { LiveMapDashboard } from './components/LiveMapDashboard';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { SurveyorLiveTrackingDetailView } from './components/SurveyorLiveTrackingDetailView';
import { TechnicianLiveTrackingDetailView } from './components/TechnicianLiveTrackingDetailView';
import { GeofenceTerritoryManagement } from './components/GeofenceTerritoryManagement';
import { LeadDensityHeatmap } from './components/LeadDensityHeatmap';
import { SiteVisitVerification } from './components/SiteVisitVerification';
import { EmergencyEscalationAlert } from './components/EmergencyEscalationAlert';
import { RouteOptimizationSuggestion } from './components/RouteOptimizationSuggestion';
import { SurveyorOnboarding } from './components/SurveyorOnboarding';
import { TechnicianOnboarding } from './components/TechnicianOnboarding';
import { SupplierOnboarding } from './components/SupplierOnboarding';
import { CustomerQuickSignup } from './components/CustomerQuickSignup';
import { ForgotPasswordReset } from './components/ForgotPasswordReset';
import { PermissionsPrimer } from './components/PermissionsPrimer';
import { SalesFunnelAnalytics } from './components/SalesFunnelAnalytics';
import { LeadInbox } from './components/LeadInbox';
import { LeadKanban } from './components/LeadKanban';
import { LeadAssignment } from './components/LeadAssignment';
import { LeadMergeResolution } from './components/LeadMergeResolution';
import { LeadScoring } from './components/LeadScoring';
import { LeadFollowUpScheduler } from './components/LeadFollowUpScheduler';
import { RevenueProfitAnalytics } from './components/RevenueProfitAnalytics';
import { WorkerPerformanceLeaderboard } from './components/WorkerPerformanceLeaderboard';
import { ConversionRateAnalytics } from './components/ConversionRateAnalytics';
import { SupplierPerformanceScorecard } from './components/SupplierPerformanceScorecard';
import { AutomationHealthMonitor } from './components/AutomationHealthMonitor';
import { FinancialCashFlowReceivables } from './components/FinancialCashFlowReceivables';
import { AlertsExceptionsDashboard } from './components/AlertsExceptionsDashboard';
import { CustomReportBuilder } from './components/CustomReportBuilder';
import { LeadSourceAttribution } from './components/LeadSourceAttribution';
import { LostLeadDisqualification } from './components/LostLeadDisqualification';
import { BulkLeadImportExport } from './components/BulkLeadImportExport';
import { CommunicationTemplatesLibrary } from './components/CommunicationTemplatesLibrary';
import { AutomatedSequenceBuilder } from './components/AutomatedSequenceBuilder';
import { WhatsAppBusinessChatConsole } from './components/WhatsAppBusinessChatConsole';
import { CallLogAutoDialer } from './components/CallLogAutoDialer';
import { SMSBroadcastDeliveryReport } from './components/SMSBroadcastDeliveryReport';
import { ConversationAIBotConfig } from './components/ConversationAIBotConfig';
import { CustomerReplyInbox } from './components/CustomerReplyInbox';
import { CommComplianceManager } from './components/CommComplianceManager';
import { FollowUpStageRules } from './components/FollowUpStageRules';
import { CommAnalytics } from './components/CommAnalytics';
import { QuotationInputSpecs } from './components/QuotationInputSpecs';
import { QuotePricing } from './components/QuotePricing';
import { QuotationTemplateBranding } from './components/QuotationTemplateBranding';
import { QuotationPreview } from './components/QuotationPreview';
import { MultiOptionComparison } from './components/MultiOptionComparison';
import { QuotationVersionHistory } from './components/QuotationVersionHistory';
import { DiscountApprovalWorkflow } from './components/DiscountApprovalWorkflow';
import { QuotationSendEDelivery } from './components/QuotationSendEDelivery';
import { QuotationAnalyticsWinLoss } from './components/QuotationAnalyticsWinLoss';
import { PricingRulesMarginConfig } from './components/PricingRulesMarginConfig';
import { AutoNegotiationBotConfig } from './components/AutoNegotiationBotConfig';
import { LiveNegotiationThread } from './components/LiveNegotiationThread';
import { CounterOfferApproval } from './components/CounterOfferApproval';
import { DealTermsFinalization } from './components/DealTermsFinalization';
import { DigitalContractGenerator } from './components/DigitalContractGenerator';
import { ESignatureCapture } from './components/ESignatureCapture';
import { DealClosureConfirmation } from './components/DealClosureConfirmation';
import { CustomerObjectionHandling } from './components/CustomerObjectionHandling';
import { CompetitorBattlecard } from './components/CompetitorBattlecard';
import { DealWonCelebration } from './components/DealWonCelebration';
import { PaymentStageScheduleSetup } from './components/PaymentStageScheduleSetup';
import { PaymentCollectionDashboard } from './components/PaymentCollectionDashboard';
import { PaymentReminderConfig } from './components/PaymentReminderConfig';
import { OnlinePaymentCheckout } from './components/OnlinePaymentCheckout';
import { LoanEmiApplication } from './components/LoanEmiApplication';
import { LoanPartnerIntegration } from './components/LoanPartnerIntegration';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { PaymentReceiptHistory } from './components/PaymentReceiptHistory';
import { OverduePaymentEscalation } from './components/OverduePaymentEscalation';
import { RefundDisputeManagement } from './components/RefundDisputeManagement';
import { SupplierDirectory } from './components/SupplierDirectory';
import { PurchaseOrderGenerator } from './components/PurchaseOrderGenerator';
import { SupplierCatalogPricing } from './components/SupplierCatalogPricing';
import { AutoPoTriggerRules } from './components/AutoPoTriggerRules';
import { SupplierOrderStatusTracking } from './components/SupplierOrderStatusTracking';
import { ManufacturerProductionStatus } from './components/ManufacturerProductionStatus';
import { SupplierRatingScorecard } from './components/SupplierRatingScorecard';
import { SupplierContractSla } from './components/SupplierContractSla';
import { SupplierCommunicationThreads } from './components/SupplierCommunicationThreads';
import { SupplierPaymentTermsConfigScreen } from './components/SupplierPaymentTermsConfigScreen';
import { DeliverySchedulingScreen } from './components/DeliverySchedulingScreen';
import { LiveShipmentTrackingScreen } from './components/LiveShipmentTrackingScreen';
import { SiteDeliveryChecklistScreen } from './components/SiteDeliveryChecklistScreen';
import { MaterialReceivedConfirmationScreen } from './components/MaterialReceivedConfirmationScreen';
import { DeliveryDelayAlertEscalationScreen } from './components/DeliveryDelayAlertEscalationScreen';
import { StockInTransitScreen } from './components/StockInTransitScreen';
import { DeliverySopConfigScreen } from './components/DeliverySopConfigScreen';
import { DamagedMissingPartsReportScreen } from './components/DamagedMissingPartsReportScreen';
import { DeliveryPartnerManagementScreen } from './components/DeliveryPartnerManagementScreen';
import { DeliveryAnalyticsScreen } from './components/DeliveryAnalyticsScreen';
import { SupplierPaymentApprovalScreen } from './components/SupplierPaymentApprovalScreen';
import { MilestonePaymentReleaseScreen } from './components/MilestonePaymentReleaseScreen';
import { SupplierInvoiceMatchingScreen } from './components/SupplierInvoiceMatchingScreen';
import { SupplierPaymentScheduleScreen } from './components/SupplierPaymentScheduleScreen';
import { SupplierPaymentHistoryScreen } from './components/SupplierPaymentHistoryScreen';
import { TaxGstComplianceScreen } from './components/TaxGstComplianceScreen';
import { SupplierDisputeResolutionScreen } from './components/SupplierDisputeResolutionScreen';
import { AdvancePaymentRetentionScreen } from './components/AdvancePaymentRetentionScreen';
import { SupplierPaymentAnalyticsScreen } from './components/SupplierPaymentAnalyticsScreen';
import { AutoReconciliationScreen } from './components/AutoReconciliationScreen';
import { TechnicianHomeMyJobsScreen } from './components/TechnicianHomeMyJobsScreen';
import { JobDetailSiteInfoScreen } from './components/JobDetailSiteInfoScreen';
import { InstallationSopChecklistScreen } from './components/InstallationSopChecklistScreen';
import { PhotoVideoEvidenceCaptureScreen } from './components/PhotoVideoEvidenceCaptureScreen';
import { TechnicianCheckInCheckOutScreen } from './components/TechnicianCheckInCheckOutScreen';
import { SafetyComplianceChecklistScreen } from './components/SafetyComplianceChecklistScreen';
import { IssueBlockerReportingScreen } from './components/IssueBlockerReportingScreen';
import { MaterialUsageLoggingScreen } from './components/MaterialUsageLoggingScreen';
import { QcInspectorAssignmentScreen } from './components/QcInspectorAssignmentScreen';
import { QualityChecklistMechanicalScreen } from './components/QualityChecklistMechanicalScreen';
import { QualityChecklistElectricalScreen } from './components/QualityChecklistElectricalScreen';
import { ComplianceCertificationScreen } from './components/ComplianceCertificationScreen';
import { DefectSnagListScreen } from './components/DefectSnagListScreen';
import { ReworkAssignmentScreen } from './components/ReworkAssignmentScreen';
import { FinalHandoverChecklistScreen } from './components/FinalHandoverChecklistScreen';
import { CustomerHandoverWalkthroughScreen } from './components/CustomerHandoverWalkthroughScreen';
import { WarrantyAmcRegistrationScreen } from './components/WarrantyAmcRegistrationScreen';
import { HandoverCompletionCertificateScreen } from './components/HandoverCompletionCertificateScreen';
import { InstallationProgressTimelineScreen } from './components/InstallationProgressTimelineScreen';
import { TechnicianTeamCoordinationScreen } from './components/TechnicianTeamCoordinationScreen';
import { RecruitmentLandingScreen } from './components/RecruitmentLandingScreen';
import { ApplicantDataCollectionScreen } from './components/ApplicantDataCollectionScreen';
import { ApplicantScreeningScreen } from './components/ApplicantScreeningScreen';
import { InterviewSchedulingScreen } from './components/InterviewSchedulingScreen';
import { BackgroundVerificationScreen } from './components/BackgroundVerificationScreen';
import { OfferOnboardingAgreementScreen } from './components/OfferOnboardingAgreementScreen';
import { NewPartnerAggregationDashboardScreen } from './components/NewPartnerAggregationDashboardScreen';
import { PartnerTierCategoryAssignmentScreen } from './components/PartnerTierCategoryAssignmentScreen';
import { PartnerDirectoryScreen } from './components/PartnerDirectoryScreen';
import { PartnerDeactivationExitScreen } from './components/PartnerDeactivationExitScreen';
import { TrainingModuleLibraryScreen } from './components/TrainingModuleLibraryScreen';
import { VideoInteractiveLessonPlayerScreen } from './components/VideoInteractiveLessonPlayerScreen';
import { SopDocumentRepositoryScreen } from './components/SopDocumentRepositoryScreen';
import { QuizCertificationTestScreen } from './components/QuizCertificationTestScreen';
import { CertificationBadgeProgressScreen } from './components/CertificationBadgeProgressScreen';
import { SkillMatrixGapAnalysisScreen } from './components/SkillMatrixGapAnalysisScreen';
import { TrainingComplianceTrackerScreen } from './components/TrainingComplianceTrackerScreen';
import { NewSopRolloutNotificationScreen } from './components/NewSopRolloutNotificationScreen';
import { TrainingFeedbackScreen } from './components/TrainingFeedbackScreen';
import { CommissionRulesEngineScreen } from './components/CommissionRulesEngineScreen';
import { StageWisePayoutTrackerScreen } from './components/StageWisePayoutTrackerScreen';
import { PayoutApprovalQueueScreen } from './components/PayoutApprovalQueueScreen';
import { AutomatedPayoutDisbursementScreen } from './components/AutomatedPayoutDisbursementScreen';
import { RewardsLeaderboardScreen } from './components/RewardsLeaderboardScreen';
import { BadgesMilestonesScreen } from './components/BadgesMilestonesScreen';
import { ContestConfigurationScreen } from './components/ContestConfigurationScreen';
import { PayoutHistoryStatementsScreen } from './components/PayoutHistoryStatementsScreen';
import { TaxDeductionStatementScreen } from './components/TaxDeductionStatementScreen';
import { PayoutDisputeQueryScreen } from './components/PayoutDisputeQueryScreen';
import { CustomerHomeDashboardScreen } from './components/CustomerHomeDashboardScreen';
import { ProjectStatusTrackerScreen } from './components/ProjectStatusTrackerScreen';
import { CustomerDocumentVaultScreen } from './components/CustomerDocumentVaultScreen';
import { CustomerPaymentInstallmentsScreen } from './components/CustomerPaymentInstallmentsScreen';
import { CustomerSupportTicketScreen } from './components/CustomerSupportTicketScreen';
import { CustomerLiveSupportChatScreen } from './components/CustomerLiveSupportChatScreen';
import { CustomerFeedbackRatingScreen } from './components/CustomerFeedbackRatingScreen';
import { CustomerAmcBookingScreen } from './components/CustomerAmcBookingScreen';
import { CustomerReferralProgramScreen } from './components/CustomerReferralProgramScreen';
import { CustomerNotificationCenterScreen } from './components/CustomerNotificationCenterScreen';
import { MasterAutomationRulesDashboardScreen } from './components/MasterAutomationRulesDashboardScreen';
import { WorkflowTriggerBuilderScreen } from './components/WorkflowTriggerBuilderScreen';
import { NotificationTemplatesChannelsScreen } from './components/NotificationTemplatesChannelsScreen';
import { EscalationMatrixConfigScreen } from './components/EscalationMatrixConfigScreen';
import { SlaTimerBreachAlertScreen } from './components/SlaTimerBreachAlertScreen';
import { SystemHealthBotMonitoringScreen } from './components/SystemHealthBotMonitoringScreen';
import { AuditLogAutomatedActionsScreen } from './components/AuditLogAutomatedActionsScreen';
import { ManualOverrideConsoleScreen } from './components/ManualOverrideConsoleScreen';
import { ApiIntegrationManagementScreen } from './components/ApiIntegrationManagementScreen';
import { AutomationTestingSandboxScreen } from './components/AutomationTestingSandboxScreen';
import { CompanyProfileBrandingSettingsScreen } from './components/CompanyProfileBrandingSettingsScreen';
import { UserRolePermissionManagementScreen } from './components/UserRolePermissionManagementScreen';
import { SinglePersonMonitorControlPanelScreen } from './components/SinglePersonMonitorControlPanelScreen';
import { DataPrivacyConsentManagementScreen } from './components/DataPrivacyConsentManagementScreen';
import { SecuritySessionManagementScreen } from './components/SecuritySessionManagementScreen';
import { BackupDataExportScreen } from './components/BackupDataExportScreen';
import { SaaSOpsSubscriptionBillingScreen } from './components/SaaSOpsSubscriptionBillingScreen';
import { LegalContractTemplatesRepositoryScreen } from './components/LegalContractTemplatesRepositoryScreen';
import { HelpFaqSupportScreen } from './components/HelpFaqSupportScreen';
import { AppVersionChangelogFeedbackScreen } from './components/AppVersionChangelogFeedbackScreen';
import { 
  Building, Phone, Shield, ArrowRight, User as UserIcon, 
  Lock, CheckCircle2, ChevronRight, LogOut, Settings, 
  Layers, Hammer, Truck, Users, LayoutDashboard, Sparkles,
  MapPin, Compass, Award, FileText, AlertTriangle, AlertCircle, Globe, Activity, Flame, TrendingUp, HelpCircle, ShieldCheck,
  LineChart, Grid, Cpu, Landmark, Split, Calendar, FileSpreadsheet, MessageSquare, GitMerge, Send, Bot, Inbox, Tag,
  DollarSign, Palette, Eye, History, Percent, Sliders, CreditCard, SlidersHorizontal, ClipboardCheck, FileCheck, BarChart2, Scale, Wrench, Camera, ClipboardList, Bell, GitCommit, Clock, Zap, Gift, Database, Info
} from 'lucide-react';
import { useLanguage, translations as appTranslations, Language } from './lib/language';
import { useTheme, ThemeMode } from './lib/theme';
import { APIProvider } from '@vis.gl/react-google-maps';
import { auth } from './lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showCarousel, setShowCarousel] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [carouselStep, setCarouselStep] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { language: appLanguage, setLanguage: setAppLanguage, t } = useLanguage(currentUser);
  const { theme: appTheme, setTheme: setAppTheme } = useTheme(currentUser);
  const [loginPhone, setLoginPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedTechJobId, setSelectedTechJobId] = useState<string>('job_2026_101');
  const [selectedApplicantId, setSelectedApplicantId] = useState<string>('app_2026_01');
  const [selectedSopStepId, setSelectedSopStepId] = useState<string | undefined>(undefined);
  const [trackingPoId, setTrackingPoId] = useState<string | undefined>(undefined);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('pay_101');
  const [selectedTrainingModuleId, setSelectedTrainingModuleId] = useState<string>('tm_001');
  const [selectedTrainingLessonId, setSelectedTrainingLessonId] = useState<string>('les_101');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('assess_001');
  const [activeAuthTab, setActiveAuthTab] = useState<'phone' | 'demo'>('demo');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotReset, setShowForgotReset] = useState(false);

  // Google Maps Platform API Key variables
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [hasValidGoogleMapsKey, setHasValidGoogleMapsKey] = useState<boolean>(false);

  useEffect(() => {
    // Attempt to load from build-time config first
    const buildKey = (process.env.GOOGLE_MAPS_PLATFORM_KEY as string) ||
      (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
      (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
      '';
    if (buildKey && buildKey !== 'YOUR_API_KEY') {
      setGoogleMapsApiKey(buildKey);
      setHasValidGoogleMapsKey(true);
    }

    // Always fetch the freshest runtime key from the server with robust retry mechanism
    const fetchWithRetry = async (retries = 3, delay = 1000) => {
      try {
        const res = await fetch('/api/config/maps-key');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.apiKey) {
          setGoogleMapsApiKey(data.apiKey);
          setHasValidGoogleMapsKey(true);
        }
      } catch (err) {
        if (retries > 0) {
          setTimeout(() => {
            fetchWithRetry(retries - 1, delay * 1.5);
          }, delay);
        } else {
          // Log as warning instead of console.error to prevent false positive error indicators
          // in the diagnostics portal, since the app gracefully falls back to offline Vector maps.
          console.warn('Could not fetch dynamic Google Maps key at root, running in offline vector map mode:', err);
        }
      }
    };

    fetchWithRetry();
  }, []);

  useEffect(() => {
    const handleSwitch = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce.detail) {
        setActiveTab(ce.detail);
      }
    };
    window.addEventListener('aiec_switch_tab', handleSwitch);
    return () => {
      window.removeEventListener('aiec_switch_tab', handleSwitch);
    };
  }, []);

  const renderTabContent = () => {
    if (!currentUser) return null;
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {currentUser.role === 'admin' && activeTab === 'Home' && <AdminDashboard user={currentUser} />}
          {currentUser.role === 'customer' && activeTab === 'Home' && (
            <CustomerHomeDashboardScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'LeadInbox' && (
            <LeadInbox user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'LeadPipeline' && (
            <LeadKanban user={currentUser} onBackToInbox={() => setActiveTab('LeadInbox')} />
          )}
          {currentUser.role === 'admin' && activeTab === 'LeadAssignment' && (
            <LeadAssignment user={currentUser} onBack={() => setActiveTab('LeadInbox')} />
          )}
          {currentUser.role === 'admin' && activeTab === 'LeadMerge' && (
            <LeadMergeResolution user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'LeadScoring' && (
            <LeadScoring user={currentUser} onBack={() => setActiveTab('LeadInbox')} />
          )}
          {currentUser.role === 'admin' && activeTab === 'LiveMap' && (
            <LiveMapDashboard user={currentUser} apiKey={googleMapsApiKey} hasValidKey={hasValidGoogleMapsKey} />
          )}
          {currentUser.role === 'admin' && activeTab === 'RouteOpt' && (
            <RouteOptimizationSuggestion user={currentUser} apiKey={googleMapsApiKey} hasValidKey={hasValidGoogleMapsKey} />
          )}
          {currentUser.role === 'admin' && activeTab === 'SOSDesk' && (
            <EmergencyEscalationAlert user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'LiveFeed' && (
            <LiveActivityFeed user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'SurveyorAudit' && (
            <SurveyorLiveTrackingDetailView user={currentUser} onBack={() => setActiveTab('LiveMap')} />
          )}
          {currentUser.role === 'admin' && activeTab === 'TechnicianAudit' && (
            <TechnicianLiveTrackingDetailView user={currentUser} onBack={() => setActiveTab('LiveMap')} />
          )}
          {currentUser.role === 'admin' && activeTab === 'Territories' && (
            <GeofenceTerritoryManagement user={currentUser} apiKey={googleMapsApiKey} hasValidKey={hasValidGoogleMapsKey} />
          )}
          {currentUser.role === 'admin' && activeTab === 'Heatmap' && (
            <LeadDensityHeatmap user={currentUser} apiKey={googleMapsApiKey} hasValidKey={hasValidGoogleMapsKey} />
          )}
          {currentUser.role === 'admin' && activeTab === 'SiteVerify' && (
            <SiteVisitVerification user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'Funnel' && (
            <SalesFunnelAnalytics user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'RevenueProfit' && (
            <RevenueProfitAnalytics user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'FinancialCashFlow' && (
            <FinancialCashFlowReceivables user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'AlertsExceptions' && (
            <AlertsExceptionsDashboard user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'Leaderboard' && (
            <WorkerPerformanceLeaderboard user={currentUser} language={appLanguage} />
          )}
          {currentUser.role === 'admin' && activeTab === 'Conversion' && (
            <ConversionRateAnalytics user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'SupplierScorecard' && (
            <SupplierPerformanceScorecard user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'AutomationHealth' && (
            <AutomationHealthMonitor user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'Partners' && (
            <AdminRoleManagement currentAdmin={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'LeadFollowUp' && (
            <LeadFollowUpScheduler user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'LeadSource' && (
            <LeadSourceAttribution user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'LeadLost' && (
            <LostLeadDisqualification user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'LeadMigrate' && (
            <BulkLeadImportExport user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'CommTemplates' && (
            <CommunicationTemplatesLibrary user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'CommSequences' && (
            <AutomatedSequenceBuilder user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'CommWhatsApp' && (
            <WhatsAppBusinessChatConsole user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'CommCalls' && (
            <CallLogAutoDialer user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'CommSMS' && (
            <SMSBroadcastDeliveryReport user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'CommBot' && (
            <ConversationAIBotConfig user={currentUser} />
          )}
           {currentUser.role === 'admin' && activeTab === 'CommInbox' && (
            <CustomerReplyInbox user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'CommCompliance' && (
            <CommComplianceManager user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'CommRules' && (
            <FollowUpStageRules user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'CommAnalytics' && (
            <CommAnalytics user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteSpecs' && (
            <QuotationInputSpecs 
              user={currentUser} 
              onNavigateToPricing={(specs) => {
                setActiveTab('QuotePricing');
              }} 
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuotePricing' && (
            <QuotePricing user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteBranding' && (
            <QuotationTemplateBranding user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuotePreview' && (
            <QuotationPreview user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteCompare' && (
            <MultiOptionComparison user={currentUser} onSelectPackage={(tierId, finalPrice) => {
              setActiveTab('QuotePreview');
            }} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteHistory' && (
            <QuotationVersionHistory user={currentUser} onSelectActiveVersion={(version) => {
              setActiveTab('QuotePreview');
            }} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteDiscount' && (
            <DiscountApprovalWorkflow user={currentUser} onNavigateToPreview={() => {
              setActiveTab('QuotePreview');
            }} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteDelivery' && (
            <QuotationSendEDelivery user={currentUser} onSendComplete={() => {
              setActiveTab('QuotePreview');
            }} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteAnalytics' && (
            <QuotationAnalyticsWinLoss user={currentUser} onNavigateToQuote={(id) => {
              setActiveTab('QuotePreview');
            }} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuotePricingRules' && (
            <PricingRulesMarginConfig user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteNegotiationBot' && (
            <AutoNegotiationBotConfig 
              user={currentUser} 
              onNavigateToPreview={() => setActiveTab('QuotePreview')}
              onNavigateToThread={() => setActiveTab('QuoteNegotiationThread')}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteNegotiationThread' && (
            <LiveNegotiationThread user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteCounterOfferApproval' && (
            <CounterOfferApproval user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteDealTermsFinalization' && (
            <DealTermsFinalization user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteDigitalContract' && (
            <DigitalContractGenerator user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteESignature' && (
            <ESignatureCapture user={currentUser} onGoToNext={() => setActiveTab('QuoteDealClosure')} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteDealClosure' && (
            <DealClosureConfirmation user={currentUser} onBackToStart={() => setActiveTab('QuoteDigitalContract')} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteObjectionHandling' && (
            <CustomerObjectionHandling user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteCompetitorBattlecard' && (
            <CompetitorBattlecard user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'QuoteDealWonCelebration' && (
            <DealWonCelebration user={currentUser} onBackToStart={() => setActiveTab('QuoteDealClosure')} />
          )}
          {currentUser.role === 'admin' && activeTab === 'PaymentStageScheduleSetup' && (
            <PaymentStageScheduleSetup user={currentUser} />
          )}
          {currentUser.role === 'admin' && activeTab === 'PaymentCollectionDashboard' && (
            <PaymentCollectionDashboard 
              user={currentUser} 
              onNavigateToConfig={() => setActiveTab('PaymentReminderConfig')}
              onNavigateToEscalation={() => setActiveTab('OverduePaymentEscalation')}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'PaymentReminderConfig' && (
            <PaymentReminderConfig 
              user={currentUser} 
              onNavigateToCollection={() => setActiveTab('PaymentCollectionDashboard')}
            />
          )}
          {activeTab === 'OnlinePaymentCheckout' && (
            <OnlinePaymentCheckout 
              user={currentUser}
              onNavigateToLoan={() => setActiveTab('LoanEmiApplication')}
              onSuccess={() => setActiveTab('PaymentReceiptHistory')}
            />
          )}
          {activeTab === 'LoanEmiApplication' && (
            <LoanEmiApplication 
              user={currentUser}
              onNavigateToCheckout={() => setActiveTab('OnlinePaymentCheckout')}
              onNavigateToStatus={() => setActiveTab('LoanPartnerIntegration')}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'LoanPartnerIntegration' && (
            <LoanPartnerIntegration 
              user={currentUser}
              onNavigateToCollection={() => setActiveTab('PaymentCollectionDashboard')}
              onNavigateToEscalation={() => setActiveTab('OverduePaymentEscalation')}
            />
          )}
          {activeTab === 'InvoiceGenerator' && (
            <InvoiceGenerator 
              user={currentUser}
              onNavigateToReceipts={() => setActiveTab('PaymentReceiptHistory')}
            />
          )}
          {activeTab === 'PaymentReceiptHistory' && (
            <PaymentReceiptHistory 
              user={currentUser}
              onNavigateToInvoice={(id) => setActiveTab('InvoiceGenerator')}
              onNavigateToCheckout={() => setActiveTab('OnlinePaymentCheckout')}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'OverduePaymentEscalation' && (
            <OverduePaymentEscalation 
              user={currentUser}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'RefundDisputeManagement' && (
            <RefundDisputeManagement 
              user={currentUser}
              onNavigateToInvoices={() => setActiveTab('InvoiceGenerator')}
            />
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'supplier') && activeTab === 'SupplierDirectory' && (
            <SupplierDirectory 
              user={currentUser}
              onNavigateToPO={(supplierId) => {
                setActiveTab('PurchaseOrderGenerator');
              }}
            />
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'supplier') && activeTab === 'SupplierCatalogPricing' && (
            <SupplierCatalogPricing 
              user={currentUser}
              onNavigateToPO={() => setActiveTab('PurchaseOrderGenerator')}
            />
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'supplier') && activeTab === 'PurchaseOrderGenerator' && (
            <PurchaseOrderGenerator 
              user={currentUser}
              onNavigateToSuppliers={() => {
                setActiveTab('SupplierDirectory');
              }}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'AutoPoTriggerRules' && (
            <AutoPoTriggerRules 
              user={currentUser}
              onNavigateToPOs={() => setActiveTab('PurchaseOrderGenerator')}
            />
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'supplier') && activeTab === 'SupplierOrderStatusTracking' && (
            <SupplierOrderStatusTracking 
              user={currentUser}
              onNavigateToPOGenerator={() => setActiveTab('PurchaseOrderGenerator')}
            />
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'supplier') && activeTab === 'ManufacturerProductionStatus' && (
            <ManufacturerProductionStatus 
              user={currentUser}
              onNavigateToPO={(poId) => setActiveTab('PurchaseOrderGenerator')}
              onNavigateToTracking={() => setActiveTab('SupplierOrderStatusTracking')}
            />
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'supplier') && (activeTab === 'SupplierRatingScorecard' || activeTab === 'SupplierScorecard') && (
            <SupplierRatingScorecard 
              user={currentUser}
              onNavigateToPO={(poId) => setActiveTab('PurchaseOrderGenerator')}
              onNavigateToContracts={() => setActiveTab('SupplierContractSla')}
            />
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'supplier') && activeTab === 'SupplierContractSla' && (
            <SupplierContractSla 
              user={currentUser}
              onNavigateToPOGenerator={() => setActiveTab('PurchaseOrderGenerator')}
              onNavigateToScorecard={() => setActiveTab('SupplierRatingScorecard')}
            />
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'supplier') && activeTab === 'SupplierCommThreads' && (
            <SupplierCommunicationThreads user={currentUser} />
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'supplier') && activeTab === 'SupplierPaymentTerms' && (
            <SupplierPaymentTermsConfigScreen user={currentUser} />
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'supplier') && activeTab === 'DeliveryScheduling' && (
            <DeliverySchedulingScreen 
              user={currentUser} 
              onNavigateToTracking={(poId) => {
                setTrackingPoId(poId);
                setActiveTab('LiveShipmentTracking');
              }}
            />
          )}
          {activeTab === 'LiveShipmentTracking' && (
            <LiveShipmentTrackingScreen 
              user={currentUser} 
              selectedPoId={trackingPoId}
              onBackToSchedules={() => setActiveTab('DeliveryScheduling')}
            />
          )}
          {activeTab === 'SiteDeliveryChecklist' && (
            <SiteDeliveryChecklistScreen 
              user={currentUser} 
              selectedPoId={trackingPoId}
              onNavigateToConfirmation={(poId) => {
                setTrackingPoId(poId);
                setActiveTab('MaterialReceivedConfirmation');
              }}
            />
          )}
          {activeTab === 'MaterialReceivedConfirmation' && (
            <MaterialReceivedConfirmationScreen 
              user={currentUser} 
              selectedPoId={trackingPoId}
              onBackToChecklist={() => setActiveTab('SiteDeliveryChecklist')}
              onNavigateToPayment={() => setActiveTab('OnlinePaymentCheckout')}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'DeliveryDelayAlerts' && (
            <DeliveryDelayAlertEscalationScreen 
              user={currentUser} 
              onNavigateToThread={() => setActiveTab('SupplierCommThreads')}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'StockInTransit' && (
            <StockInTransitScreen 
              user={currentUser} 
              onNavigateToPo={(poId) => {
                setTrackingPoId(poId);
                setActiveTab('PurchaseOrderGenerator');
              }}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'DeliverySopConfig' && (
            <DeliverySopConfigScreen user={currentUser} />
          )}
          {activeTab === 'DamagedMissingPartsReport' && (
            <DamagedMissingPartsReportScreen 
              user={currentUser} 
              selectedPoId={trackingPoId}
              onNavigateToThread={() => setActiveTab('SupplierCommThreads')}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'DeliveryPartnerManagement' && (
            <DeliveryPartnerManagementScreen 
              user={currentUser} 
              onNavigateToPo={(poId) => {
                setTrackingPoId(poId);
                setActiveTab('PurchaseOrderGenerator');
              }}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'DeliveryAnalytics' && (
            <DeliveryAnalyticsScreen 
              user={currentUser} 
              onNavigateToSrm={() => setActiveTab('SupplierScorecard')}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'SupplierPaymentApproval' && (
            <SupplierPaymentApprovalScreen 
              user={currentUser}
              onNavigateToReleaseDetail={(paymentId) => {
                setSelectedPaymentId(paymentId);
                setActiveTab('MilestonePaymentRelease');
              }}
              onNavigateToDiscrepancyReport={(reportId) => {
                setActiveTab('DamagedMissingPartsReport');
              }}
            />
          )}
          {currentUser.role === 'admin' && activeTab === 'MilestonePaymentRelease' && (
            <MilestonePaymentReleaseScreen 
              user={currentUser}
              paymentId={selectedPaymentId}
              onBack={() => setActiveTab('SupplierPaymentApproval')}
              onNavigateToDiscrepancyReport={(reportId) => {
                setActiveTab('DamagedMissingPartsReport');
              }}
            />
          )}
          {activeTab === 'SupplierInvoiceMatching' && (
            <SupplierInvoiceMatchingScreen 
              user={currentUser}
              onNavigateToApprovalQueue={() => setActiveTab('SupplierPaymentApproval')}
            />
          )}
          {activeTab === 'SupplierPaymentSchedule' && (
            <SupplierPaymentScheduleScreen 
              user={currentUser}
              onNavigateToReleaseDetail={(paymentId) => {
                setSelectedPaymentId(paymentId);
                setActiveTab('MilestonePaymentRelease');
              }}
              onNavigateToApprovalQueue={() => setActiveTab('SupplierPaymentApproval')}
            />
          )}
          {activeTab === 'SupplierPaymentHistory' && (
            <SupplierPaymentHistoryScreen 
              user={currentUser}
              onNavigateToInvoiceMatching={() => setActiveTab('SupplierInvoiceMatching')}
              onNavigateToApprovalQueue={() => setActiveTab('SupplierPaymentApproval')}
            />
          )}
          {activeTab === 'TaxGstCompliance' && (
            <TaxGstComplianceScreen 
              user={currentUser}
              onNavigateToInvoiceMatching={() => setActiveTab('SupplierInvoiceMatching')}
              onNavigateToDisputeResolution={() => setActiveTab('SupplierDisputeResolution')}
            />
          )}
          {activeTab === 'SupplierDisputeResolution' && (
            <SupplierDisputeResolutionScreen 
              user={currentUser}
              onNavigateToPaymentApproval={() => setActiveTab('SupplierPaymentApproval')}
              onNavigateToPaymentHistory={() => setActiveTab('SupplierPaymentHistory')}
            />
          )}
          {activeTab === 'AdvancePaymentRetention' && (
            <AdvancePaymentRetentionScreen 
              user={currentUser}
              onNavigateToMilestoneRelease={(poId) => {
                if (poId) setSelectedPaymentId('pay_' + poId);
                setActiveTab('MilestonePaymentRelease');
              }}
              onNavigateToDisputeResolution={() => setActiveTab('SupplierDisputeResolution')}
            />
          )}
          {activeTab === 'SupplierPaymentAnalytics' && (
            <SupplierPaymentAnalyticsScreen 
              user={currentUser}
              onNavigateToDisputeResolution={() => setActiveTab('SupplierDisputeResolution')}
              onNavigateToSupplierDirectory={() => setActiveTab('Partners')}
            />
          )}
          {activeTab === 'AutoReconciliation' && (
            <AutoReconciliationScreen 
              user={currentUser}
              onNavigateToAlertsDashboard={() => setActiveTab('AutomationHealth')}
              onNavigateToPaymentHistory={() => setActiveTab('SupplierPaymentHistory')}
            />
          )}

          {activeTab === 'TechnicianHomeMyJobs' && (
            <TechnicianHomeMyJobsScreen
              user={currentUser}
              onSelectJob={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('JobDetailSiteInfo');
              }}
              onOpenSos={() => {
                setActiveTab('SOSDesk');
              }}
            />
          )}

          {activeTab === 'JobDetailSiteInfo' && (
            <JobDetailSiteInfoScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('TechnicianHomeMyJobs')}
              onStartSopChecklist={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('InstallationSopChecklist');
              }}
            />
          )}

          {activeTab === 'InstallationSopChecklist' && (
            <InstallationSopChecklistScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('JobDetailSiteInfo')}
              onOpenEvidenceCapture={(jId, stepId) => {
                setSelectedTechJobId(jId);
                setSelectedSopStepId(stepId);
                setActiveTab('PhotoVideoEvidenceCapture');
              }}
              onOpenCheckInScreen={(jId) => {
                setSelectedTechJobId(jId);
                setActiveTab('TechnicianCheckInCheckOut');
              }}
            />
          )}

          {activeTab === 'PhotoVideoEvidenceCapture' && (
            <PhotoVideoEvidenceCaptureScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              initialStepId={selectedSopStepId}
              onBack={() => setActiveTab('InstallationSopChecklist')}
            />
          )}

          {activeTab === 'TechnicianCheckInCheckOut' && (
            <TechnicianCheckInCheckOutScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('JobDetailSiteInfo')}
              onNavigateToSopChecklist={(jId) => {
                setSelectedTechJobId(jId);
                setActiveTab('InstallationSopChecklist');
              }}
            />
          )}

          {activeTab === 'SafetyComplianceChecklist' && (
            <SafetyComplianceChecklistScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('InstallationSopChecklist')}
              onOpenEvidenceCapture={(jId, stepId) => {
                setSelectedTechJobId(jId);
                setSelectedSopStepId(stepId);
                setActiveTab('PhotoVideoEvidenceCapture');
              }}
            />
          )}

          {activeTab === 'IssueBlockerReporting' && (
            <IssueBlockerReportingScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('InstallationSopChecklist')}
            />
          )}

          {activeTab === 'MaterialUsageLogging' && (
            <MaterialUsageLoggingScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('InstallationSopChecklist')}
            />
          )}

          {activeTab === 'QcInspectorAssignment' && (
            <QcInspectorAssignmentScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('InstallationSopChecklist')}
              onNavigateToMechanicalQc={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('QualityChecklistMechanical');
              }}
            />
          )}

          {activeTab === 'QualityChecklistMechanical' && (
            <QualityChecklistMechanicalScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('QcInspectorAssignment')}
              onNavigateToRework={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('DefectSnagList');
              }}
              onNavigateToElectricalQc={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('QualityChecklistElectrical');
              }}
            />
          )}

          {activeTab === 'QualityChecklistElectrical' && (
            <QualityChecklistElectricalScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('QualityChecklistMechanical')}
              onNavigateToComplianceCert={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('ComplianceCertification');
              }}
              onNavigateToSnagList={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('DefectSnagList');
              }}
            />
          )}

          {activeTab === 'ComplianceCertification' && (
            <ComplianceCertificationScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('QualityChecklistElectrical')}
              onNavigateToSnagList={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('DefectSnagList');
              }}
              onNavigateToHandover={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('FinalHandoverChecklist');
              }}
            />
          )}

          {activeTab === 'DefectSnagList' && (
            <DefectSnagListScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('QualityChecklistElectrical')}
              onNavigateToRework={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('ReworkAssignment');
              }}
              onNavigateToElectricalQc={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('QualityChecklistElectrical');
              }}
            />
          )}

          {activeTab === 'ReworkAssignment' && (
            <ReworkAssignmentScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('DefectSnagList')}
              onNavigateToSnagList={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('DefectSnagList');
              }}
              onNavigateToPartsRequest={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('IssueBlockerReporting');
              }}
            />
          )}

          {activeTab === 'FinalHandoverChecklist' && (
            <FinalHandoverChecklistScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('ComplianceCertification')}
              onNavigateToWalkthrough={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('CustomerHandoverWalkthrough');
              }}
              onNavigateToSnagList={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('DefectSnagList');
              }}
              onNavigateToComplianceCert={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('ComplianceCertification');
              }}
            />
          )}

          {activeTab === 'CustomerHandoverWalkthrough' && (
            <CustomerHandoverWalkthroughScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('FinalHandoverChecklist')}
              onNavigateToTimeline={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('InstallationProgressTimeline');
              }}
              onNavigateToWarranty={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('WarrantyAmcRegistration');
              }}
            />
          )}

          {activeTab === 'WarrantyAmcRegistration' && (
            <WarrantyAmcRegistrationScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('CustomerHandoverWalkthrough')}
              onNavigateToCertificate={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('HandoverCompletionCertificate');
              }}
              onNavigateToWalkthrough={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('CustomerHandoverWalkthrough');
              }}
            />
          )}

          {activeTab === 'HandoverCompletionCertificate' && (
            <HandoverCompletionCertificateScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('WarrantyAmcRegistration')}
              onNavigateToTimeline={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('InstallationProgressTimeline');
              }}
            />
          )}

          {activeTab === 'InstallationProgressTimeline' && (
            <InstallationProgressTimelineScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('JobDetailSiteInfo')}
              onNavigateToSop={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('InstallationSopChecklist');
              }}
              onNavigateToQcAssignment={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('QcInspectorAssignment');
              }}
            />
          )}

          {activeTab === 'TechnicianTeamCoordination' && (
            <TechnicianTeamCoordinationScreen
              user={currentUser}
              jobId={selectedTechJobId || 'job_2026_101'}
              onBack={() => setActiveTab('JobDetailSiteInfo')}
              onNavigateToSop={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('InstallationSopChecklist');
              }}
            />
          )}

          {activeTab === 'RecruitmentLanding' && (
            <RecruitmentLandingScreen
              user={currentUser}
              onNavigateToDataCollection={(appId) => {
                setSelectedApplicantId(appId);
                setActiveTab('ApplicantDataCollection');
              }}
              onNavigateToScreening={() => setActiveTab('ApplicantScreening')}
              onNavigateToInterview={() => setActiveTab('InterviewScheduling')}
              onNavigateToVerification={() => setActiveTab('BackgroundVerification')}
              onNavigateToOffer={() => setActiveTab('OfferOnboardingAgreement')}
              onNavigateToDashboard={() => setActiveTab('NewPartnerAggregationDashboard')}
              onNavigateToTierAssignment={() => setActiveTab('PartnerTierCategoryAssignment')}
              onNavigateToDirectory={() => setActiveTab('PartnerDirectory')}
              onNavigateToExitScreen={(partnerId) => {
                if (partnerId) setSelectedApplicantId(partnerId);
                setActiveTab('PartnerDeactivationExit');
              }}
              onNavigateToTrainingLibrary={() => setActiveTab('TrainingModuleLibrary')}
              onBack={() => setActiveTab('Home')}
            />
          )}

          {activeTab === 'PartnerDirectory' && (
            <PartnerDirectoryScreen
              user={currentUser}
              onNavigateToExitScreen={(partnerId) => {
                setSelectedApplicantId(partnerId);
                setActiveTab('PartnerDeactivationExit');
              }}
              onNavigateToTierAssignment={(partnerId) => {
                setSelectedApplicantId(partnerId);
                setActiveTab('PartnerTierCategoryAssignment');
              }}
              onBack={() => setActiveTab('RecruitmentLanding')}
            />
          )}

          {activeTab === 'PartnerDeactivationExit' && (
            <PartnerDeactivationExitScreen
              user={currentUser}
              partnerId={selectedApplicantId}
              onNavigateToDirectory={() => setActiveTab('PartnerDirectory')}
              onBack={() => setActiveTab('RecruitmentLanding')}
            />
          )}

          {activeTab === 'TrainingModuleLibrary' && (
            <TrainingModuleLibraryScreen
              user={currentUser}
              onOpenLesson={(modId, lesId) => {
                setSelectedTrainingModuleId(modId);
                setSelectedTrainingLessonId(lesId);
                setActiveTab('VideoInteractiveLessonPlayer');
              }}
              onNavigateToSopRepo={() => setActiveTab('SopDocumentRepository')}
              onNavigateToBadges={() => setActiveTab('CertificationBadgeProgress')}
              onNavigateToSkillMatrix={() => setActiveTab('SkillMatrixGapAnalysis')}
              onNavigateToComplianceTracker={() => setActiveTab('TrainingComplianceTracker')}
              onNavigateToSopRollout={() => setActiveTab('NewSopRolloutNotification')}
              onNavigateToFeedback={() => setActiveTab('TrainingFeedback')}
              onBack={() => setActiveTab('RecruitmentLanding')}
            />
          )}

          {activeTab === 'VideoInteractiveLessonPlayer' && (
            <VideoInteractiveLessonPlayerScreen
              user={currentUser}
              trainingModuleId={selectedTrainingModuleId}
              lessonId={selectedTrainingLessonId}
              onNavigateToLibrary={() => setActiveTab('TrainingModuleLibrary')}
              onLessonCompleted={(nextLessonId) => {
                if (nextLessonId) {
                  setSelectedTrainingLessonId(nextLessonId);
                } else {
                  setActiveTab('TrainingModuleLibrary');
                }
              }}
            />
          )}

          {activeTab === 'SopDocumentRepository' && (
            <SopDocumentRepositoryScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              onNavigateToQuiz={(assessId) => {
                setSelectedAssessmentId(assessId);
                setActiveTab('QuizCertificationTest');
              }}
              onNavigateToTrainingLibrary={() => setActiveTab('TrainingModuleLibrary')}
              onBack={() => setActiveTab('TrainingModuleLibrary')}
            />
          )}

          {activeTab === 'QuizCertificationTest' && (
            <QuizCertificationTestScreen
              assessmentId={selectedAssessmentId}
              partnerId={currentUser.id}
              currentLanguage={appLanguage}
              onNavigateToBadges={() => setActiveTab('CertificationBadgeProgress')}
              onBack={() => setActiveTab('TrainingModuleLibrary')}
            />
          )}

          {activeTab === 'CertificationBadgeProgress' && (
            <CertificationBadgeProgressScreen
              partnerId={currentUser.id}
              partnerName={currentUser.name}
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              onNavigateToQuiz={(assessId) => {
                setSelectedAssessmentId(assessId);
                setActiveTab('QuizCertificationTest');
              }}
              onNavigateToSopRepo={() => setActiveTab('SopDocumentRepository')}
              onBack={() => setActiveTab('TrainingModuleLibrary')}
            />
          )}

          {activeTab === 'SkillMatrixGapAnalysis' && (
            <SkillMatrixGapAnalysisScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              onNavigateToTrainingModule={(modId) => {
                setSelectedTrainingModuleId(modId);
                setActiveTab('TrainingModuleLibrary');
              }}
              onNavigateToComplianceTracker={() => setActiveTab('TrainingComplianceTracker')}
              onNavigateToSopRollout={() => setActiveTab('NewSopRolloutNotification')}
              onBack={() => setActiveTab('TrainingModuleLibrary')}
            />
          )}

          {activeTab === 'TrainingComplianceTracker' && (
            <TrainingComplianceTrackerScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              onNavigateToSkillMatrix={() => setActiveTab('SkillMatrixGapAnalysis')}
              onNavigateToSopRollout={() => setActiveTab('NewSopRolloutNotification')}
              onNavigateToModule={(modId) => {
                setSelectedTrainingModuleId(modId);
                setActiveTab('TrainingModuleLibrary');
              }}
              onBack={() => setActiveTab('TrainingModuleLibrary')}
            />
          )}

          {activeTab === 'NewSopRolloutNotification' && (
            <NewSopRolloutNotificationScreen
              userRole={currentUser.role}
              partnerId={currentUser.id}
              currentLanguage={appLanguage}
              onNavigateToSopRepo={() => setActiveTab('SopDocumentRepository')}
              onNavigateToQuiz={(quizId) => {
                setSelectedAssessmentId(quizId);
                setActiveTab('QuizCertificationTest');
              }}
              onBack={() => setActiveTab('TrainingModuleLibrary')}
            />
          )}

          {activeTab === 'TrainingFeedback' && (
            <TrainingFeedbackScreen
              userRole={currentUser.role}
              partnerId={currentUser.id}
              partnerName={currentUser.name}
              currentLanguage={appLanguage}
              onNavigateToLibrary={() => setActiveTab('TrainingModuleLibrary')}
              onBack={() => setActiveTab('TrainingModuleLibrary')}
            />
          )}

          {activeTab === 'CommissionRulesEngine' && (
            <CommissionRulesEngineScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              onNavigateToPayoutTracker={() => setActiveTab('StageWisePayoutTracker')}
              onBack={() => setActiveTab('RecruitmentLanding')}
            />
          )}

          {activeTab === 'StageWisePayoutTracker' && (
            <StageWisePayoutTrackerScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              onNavigateToRulesEngine={() => setActiveTab('CommissionRulesEngine')}
              onBack={() => setActiveTab('CommissionRulesEngine')}
            />
          )}

          {activeTab === 'PayoutApprovalQueue' && (
            <PayoutApprovalQueueScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              onNavigateToDisbursement={() => setActiveTab('AutomatedPayoutDisbursement')}
              onNavigateToRulesEngine={() => setActiveTab('CommissionRulesEngine')}
              onBack={() => setActiveTab('StageWisePayoutTracker')}
            />
          )}

          {activeTab === 'AutomatedPayoutDisbursement' && (
            <AutomatedPayoutDisbursementScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              onNavigateToApprovalQueue={() => setActiveTab('PayoutApprovalQueue')}
              onBack={() => setActiveTab('PayoutApprovalQueue')}
            />
          )}

          {activeTab === 'RewardsLeaderboard' && (
            <RewardsLeaderboardScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onNavigateToPayoutTracker={() => setActiveTab('StageWisePayoutTracker')}
              onBack={() => setActiveTab('StageWisePayoutTracker')}
            />
          )}

          {activeTab === 'BadgesMilestones' && (
            <BadgesMilestonesScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onNavigateToLeaderboard={() => setActiveTab('RewardsLeaderboard')}
              onNavigateToTraining={() => setActiveTab('TrainingModuleCatalog')}
              onBack={() => setActiveTab('StageWisePayoutTracker')}
            />
          )}

          {activeTab === 'ContestConfiguration' && (
            <ContestConfigurationScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              onNavigateToLeaderboard={() => setActiveTab('RewardsLeaderboard')}
              onBack={() => setActiveTab('CommissionRulesEngine')}
            />
          )}

          {activeTab === 'PayoutHistoryStatements' && (
            <PayoutHistoryStatementsScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onNavigateToDisputeModal={(entryId) => {
                setActiveTab('PayoutDisputeQuery');
              }}
              onNavigateToTdsStatement={() => setActiveTab('TaxDeductionStatement')}
              onNavigateToDisputeQuery={() => setActiveTab('PayoutDisputeQuery')}
              onBack={() => setActiveTab('StageWisePayoutTracker')}
            />
          )}

          {activeTab === 'TaxDeductionStatement' && (
            <TaxDeductionStatementScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('PayoutHistoryStatements')}
            />
          )}

          {activeTab === 'PayoutDisputeQuery' && (
            <PayoutDisputeQueryScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('PayoutHistoryStatements')}
              onNavigateToRulesEngine={() => setActiveTab('CommissionRulesEngine')}
            />
          )}

          {(activeTab === 'CustomerHomeDashboard' || activeTab === 'CustomerHome') && (
            <CustomerHomeDashboardScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'ProjectStatusTracker' || activeTab === 'CustomerProjectStatusTracker') && (
            <ProjectStatusTrackerScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('CustomerHomeDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'CustomerDocumentVault' || activeTab === 'SopDocumentRepository') && (
            <CustomerDocumentVaultScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('CustomerHomeDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'CustomerPaymentInstallments' || activeTab === 'PaymentReceiptHistory') && (
            <CustomerPaymentInstallmentsScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('CustomerHomeDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'CustomerSupportTicket' || activeTab === 'CustomerHandoverWalkthrough') && (
            <CustomerSupportTicketScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('CustomerHomeDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'CustomerLiveSupportChat' || activeTab === 'LiveSupportChat') && (
            <CustomerLiveSupportChatScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('CustomerHomeDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'CustomerFeedbackRating' || activeTab === 'CustomerFeedback') && (
            <CustomerFeedbackRatingScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('CustomerHomeDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'CustomerAmcBooking' || activeTab === 'AmcBooking') && (
            <CustomerAmcBookingScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('CustomerHomeDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'CustomerReferralProgram' || activeTab === 'CustomerReferrals' || activeTab === 'ReferralProgram') && (
            <CustomerReferralProgramScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('CustomerHomeDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'CustomerNotificationCenter' || activeTab === 'CustomerNotifications' || activeTab === 'NotificationCenter') && (
            <CustomerNotificationCenterScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('CustomerHomeDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'MasterAutomationRulesDashboard' || activeTab === 'AutomationRulesDashboard' || activeTab === 'MasterAutomationRules') && (
            <MasterAutomationRulesDashboardScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('ExecutiveDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'WorkflowTriggerBuilder' || activeTab === 'TriggerBuilder' || activeTab === 'WorkflowBuilder') && (
            <WorkflowTriggerBuilderScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('MasterAutomationRulesDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'NotificationTemplatesChannels' || activeTab === 'NotificationChannels' || activeTab === 'InternalNotificationTemplates') && (
            <NotificationTemplatesChannelsScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('MasterAutomationRulesDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'EscalationMatrixConfig' || activeTab === 'EscalationMatrix' || activeTab === 'EscalationConfig') && (
            <EscalationMatrixConfigScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('MasterAutomationRulesDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'SlaTimerBreachAlert' || activeTab === 'SlaTimers' || activeTab === 'SlaBreachAlerts') && (
            <SlaTimerBreachAlertScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('MasterAutomationRulesDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'SystemHealthBotMonitoring' || activeTab === 'SystemHealth' || activeTab === 'TechnicalPlumbing') && (
            <SystemHealthBotMonitoringScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('MasterAutomationRulesDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'AuditLogAutomatedActions' || activeTab === 'AutomatedActionAuditLog' || activeTab === 'AutomationAuditLog') && (
            <AuditLogAutomatedActionsScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('MasterAutomationRulesDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'ManualOverrideConsole' || activeTab === 'ManualOverrideTerm' || activeTab === 'ProcessOverrideConsole') && (
            <ManualOverrideConsoleScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('MasterAutomationRulesDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'ApiIntegrationManagement' || activeTab === 'ApiIntegration' || activeTab === 'IntegrationManagement') && (
            <ApiIntegrationManagementScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('MasterAutomationRulesDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'AutomationTestingSandbox' || activeTab === 'AutomationSandbox' || activeTab === 'RuleSandbox') && (
            <AutomationTestingSandboxScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('MasterAutomationRulesDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'CompanyProfileBrandingSettings' || activeTab === 'CompanyProfile' || activeTab === 'BrandingSettings' || activeTab === 'CompanyProfileSettings') && (
            <CompanyProfileBrandingSettingsScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('SettingsMasterDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'UserRolePermissionManagement' || activeTab === 'UserPermissions' || activeTab === 'RolePermissions' || activeTab === 'PermissionsManagement') && (
            <UserRolePermissionManagementScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('SettingsMasterDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'SinglePersonMonitorControlPanel' || activeTab === 'SinglePersonMonitor' || activeTab === 'SoloCompanyMonitor') && (
            <SinglePersonMonitorControlPanelScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('SettingsMasterDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'DataPrivacyConsentManagement' || activeTab === 'DataPrivacy' || activeTab === 'ConsentManagement' || activeTab === 'GdprPrivacy') && (
            <DataPrivacyConsentManagementScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('SettingsMasterDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'SecuritySessionManagement' || activeTab === 'SecuritySessions' || activeTab === 'SessionManagement' || activeTab === 'SecurityThreats') && (
            <SecuritySessionManagementScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('SettingsMasterDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'BackupDataExport' || activeTab === 'DatabaseBackup' || activeTab === 'DataExport' || activeTab === 'DisasterRecovery') && (
            <BackupDataExportScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('SettingsMasterDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'SaaSOpsSubscriptionBilling' || activeTab === 'SaaSBilling' || activeTab === 'SoftwareSubscriptions' || activeTab === 'SaaSExpenses') && (
            <SaaSOpsSubscriptionBillingScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('SettingsMasterDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'LegalContractTemplatesRepository' || activeTab === 'LegalTemplates' || activeTab === 'ContractTemplates' || activeTab === 'StateLiftActs') && (
            <LegalContractTemplatesRepositoryScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('SettingsMasterDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'HelpFaqSupport' || activeTab === 'HelpFAQ' || activeTab === 'KnowledgeBase' || activeTab === 'SupportDesk') && (
            <HelpFaqSupportScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('SettingsMasterDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'AppVersionChangelogFeedback' || activeTab === 'AppVersion' || activeTab === 'Changelog' || activeTab === 'AppFeedback') && (
            <AppVersionChangelogFeedbackScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onBack={() => setActiveTab('SettingsMasterDashboard')}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
            />
          )}







          {activeTab === 'ApplicantDataCollection' && (
            <ApplicantDataCollectionScreen
              user={currentUser}
              applicantId={selectedApplicantId || 'app_2026_01'}
              onBack={() => setActiveTab('RecruitmentLanding')}
              onComplete={(record) => {
                setSelectedApplicantId(record.id);
                setActiveTab('ApplicantScreening');
              }}
            />
          )}

          {activeTab === 'ApplicantScreening' && (
            <ApplicantScreeningScreen
              user={currentUser}
              onNavigateToInterview={(appId) => {
                setSelectedApplicantId(appId);
                setActiveTab('InterviewScheduling');
              }}
              onNavigateToVerification={(appId) => {
                setSelectedApplicantId(appId);
                setActiveTab('BackgroundVerification');
              }}
              onBack={() => setActiveTab('RecruitmentLanding')}
            />
          )}

          {activeTab === 'InterviewScheduling' && (
            <InterviewSchedulingScreen
              user={currentUser}
              applicantId={selectedApplicantId || 'app_2026_01'}
              onNavigateToVerification={(appId) => {
                setSelectedApplicantId(appId);
                setActiveTab('BackgroundVerification');
              }}
              onBack={() => setActiveTab('RecruitmentLanding')}
            />
          )}

          {activeTab === 'BackgroundVerification' && (
            <BackgroundVerificationScreen
              user={currentUser}
              applicantId={selectedApplicantId || 'app_2026_01'}
              onNavigateToOffer={(appId) => {
                setSelectedApplicantId(appId);
                setActiveTab('OfferOnboardingAgreement');
              }}
              onBack={() => setActiveTab('RecruitmentLanding')}
            />
          )}

          {activeTab === 'OfferOnboardingAgreement' && (
            <OfferOnboardingAgreementScreen
              user={currentUser}
              applicantId={selectedApplicantId || 'app_2026_01'}
              onNavigateToDashboard={() => setActiveTab('NewPartnerAggregationDashboard')}
              onNavigateToTierAssignment={(partnerId) => {
                setSelectedApplicantId(partnerId);
                setActiveTab('PartnerTierCategoryAssignment');
              }}
              onBack={() => setActiveTab('RecruitmentLanding')}
            />
          )}

          {activeTab === 'NewPartnerAggregationDashboard' && (
            <NewPartnerAggregationDashboardScreen
              user={currentUser}
              onNavigateToApplicant={(appId) => {
                setSelectedApplicantId(appId);
                setActiveTab('ApplicantDataCollection');
              }}
              onNavigateToOffer={(appId) => {
                setSelectedApplicantId(appId);
                setActiveTab('OfferOnboardingAgreement');
              }}
              onNavigateToTierAssignment={(partnerId) => {
                setSelectedApplicantId(partnerId);
                setActiveTab('PartnerTierCategoryAssignment');
              }}
              onBack={() => setActiveTab('RecruitmentLanding')}
            />
          )}

          {activeTab === 'PartnerTierCategoryAssignment' && (
            <PartnerTierCategoryAssignmentScreen
              user={currentUser}
              partnerId={selectedApplicantId || 'app_2026_01'}
              onNavigateToDashboard={() => setActiveTab('NewPartnerAggregationDashboard')}
              onBack={() => setActiveTab('RecruitmentLanding')}
            />
          )}


          {currentUser.role === 'admin' && activeTab === 'Settings' && (
            <Card className="p-6 max-w-lg mx-auto text-center space-y-4">
              <Settings className="w-12 h-12 text-antiquegold mx-auto" />
              <h3 className="font-serif text-xl font-bold text-charcoal">Demo Control Center</h3>
              <p className="text-sm text-warmgray">Manage seeded documents and simulation rules in LocalStorage database.</p>
              <div className="pt-2 flex flex-col gap-2">
                <Button variant="primary" onClick={() => {
                  DbManager.resetToSeeds();
                  alert('Database state has been successfully reset to raw seeds!');
                }}>Reset Local DB to Raw Seeds</Button>
                <Button variant="secondary" onClick={handleLogout}>Switch Role / Logout</Button>
              </div>
              {renderPreferencesSection()}
            </Card>
          )}

          {currentUser.role === 'surveyor' && activeTab === 'Home' && <SurveyorDashboard user={currentUser} />}
          {currentUser.role === 'surveyor' && activeTab === 'LeadFollowUp' && (
            <LeadFollowUpScheduler user={currentUser} />
          )}
          {currentUser.role === 'surveyor' && activeTab === 'Incentives' && (
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal mb-1">Historical Commission Audits</h3>
                <p className="text-xs text-warmgray">Commission ledger updated on each deal stage completion automatically.</p>
              </div>

              {currentUser.bankVerifiedStatus !== 'verified' && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-xs flex gap-3 text-left">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-error" />
                  <div className="space-y-1">
                    <p className="font-bold uppercase tracking-wider">Commission Payouts Blocked</p>
                    <p className="text-error/90 leading-relaxed">
                      Your bank account details have not cleared NPCI penny-drop verification. Under AIEC ledger protocols, commission payouts remain locked until verified bank credentials are provided. Please contact Mr. Prashant Wable to update bank parameters.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {DbManager.getLeads().filter(l => l.surveyorId === currentUser.id && l.stage === 'closed_won').map(l => (
                  <div key={l.id} className="p-4 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)] flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-charcoal">{l.contactInfo.name}</h4>
                      <p className="text-xs text-warmgray">{l.buildingInfo.address}</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-success">+₹{l.commissionEarned?.toLocaleString('en-IN') || '25,000'}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {currentUser.role === 'technician' && activeTab === 'Home' && (
            <TechnicianHomeMyJobsScreen
              user={currentUser}
              onSelectJob={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('JobDetailSiteInfo');
              }}
              onOpenSos={() => {
                setActiveTab('SOSDesk');
              }}
            />
          )}

          {currentUser.role === 'customer' && activeTab === 'Home' && <CustomerDashboard user={currentUser} />}
          {currentUser.role === 'customer' && activeTab === 'QuotePreview' && (
            <QuotationPreview user={currentUser} />
          )}
          {currentUser.role === 'customer' && activeTab === 'QuoteNegotiationThread' && (
            <LiveNegotiationThread user={currentUser} />
          )}
          {currentUser.role === 'customer' && activeTab === 'QuoteCompare' && (
            <MultiOptionComparison user={currentUser} onSelectPackage={(tierId, finalPrice) => {
              setActiveTab('QuotePreview');
            }} />
          )}
          {currentUser.role === 'customer' && activeTab === 'QuoteDealTermsFinalization' && (
            <DealTermsFinalization user={currentUser} />
          )}
          {currentUser.role === 'customer' && activeTab === 'QuoteDigitalContract' && (
            <DigitalContractGenerator user={currentUser} />
          )}
          {currentUser.role === 'customer' && activeTab === 'QuoteESignature' && (
            <ESignatureCapture user={currentUser} onGoToNext={() => setActiveTab('QuoteDealClosure')} />
          )}
          {currentUser.role === 'customer' && activeTab === 'QuoteDealClosure' && (
            <DealClosureConfirmation user={currentUser} onBackToStart={() => setActiveTab('QuoteDigitalContract')} />
          )}
          {currentUser.role === 'customer' && activeTab === 'Settings' && (
            <div className="space-y-6 max-w-lg mx-auto">
              <Card className="p-6 text-center space-y-4">
                <Sparkles className="w-12 h-12 text-antiquegold mx-auto animate-pulse" />
                <h3 className="font-serif text-xl font-bold text-charcoal">Design Customizations</h3>
                <p className="text-sm text-warmgray">Customize cabin wall finishes, LED light configurations, and handrails. These specs update the live construction SOP task timeline dynamically.</p>
                <p className="text-xs italic text-antiquegold">Features arriving in next prompt updates...</p>
              </Card>
              <Card className="p-6">
                {renderPreferencesSection()}
              </Card>
            </div>
          )}

          {(currentUser.role === 'surveyor' || currentUser.role === 'technician' || currentUser.role === 'supplier') && activeTab === 'Settings' && (
            <Card className="p-6 max-w-lg mx-auto space-y-4">
              <div className="text-center">
                <Settings className="w-12 h-12 text-antiquegold mx-auto mb-2" />
                <h3 className="font-serif text-xl font-bold text-charcoal">Partner Preferences</h3>
                <p className="text-sm text-warmgray">Set up your localized mobility workbench options.</p>
              </div>
              {renderPreferencesSection()}
              <div className="pt-2">
                <Button variant="secondary" fullWidth onClick={handleLogout}>Log Out / Exit Partner Hub</Button>
              </div>
            </Card>
          )}

          {currentUser.role === 'supplier' && activeTab === 'Home' && <SupplierDashboard user={currentUser} />}
        </motion.div>
      </AnimatePresence>
    );
  };

  // Extended fields for Screen 2 (Login/Demo)
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [otp6Digits, setOtp6Digits] = useState<string[]>(Array(6).fill(''));

  // Extended states for Prompt 003 — OTP Verification Screen
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [otpSentTimestamp, setOtpSentTimestamp] = useState<number>(0);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [simulateSmsToast, setSimulateSmsToast] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  // Local helper to log analytics events
  const logLaunchAnalytics = (role: string) => {
    const deviceId = localStorage.getItem('aiec_device_id') || 'unknown';
    const newEvent = {
      timestamp: new Date().toISOString(),
      deviceId,
      deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
      appVersion: '1.0.1',
      role,
      networkStatus: navigator.onLine ? 'online' : 'offline'
    };
    try {
      const events = JSON.parse(localStorage.getItem('aiec_launch_analytics') || '[]');
      events.push(newEvent);
      localStorage.setItem('aiec_launch_analytics', JSON.stringify(events.slice(-50)));
    } catch (e) {
      localStorage.setItem('aiec_launch_analytics', JSON.stringify([newEvent]));
    }
  };

  // Cold start checks: session recovery, device ID, first launch flag, version checking
  useEffect(() => {
    // 1. Ensure Device ID exists
    let deviceId = localStorage.getItem('aiec_device_id');
    if (!deviceId) {
      deviceId = `aiec_dev_${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('aiec_device_id', deviceId);
    }

    // 2. Background check for active session token
    const savedToken = localStorage.getItem('aiec_session_token');
    let authenticatedUser: User | null = null;

    if (savedToken) {
      if (savedToken.startsWith('session_')) {
        const userId = savedToken.replace('session_', '');
        const foundUser = DbManager.getUsers().find(u => u.id === userId);
        if (foundUser) {
          authenticatedUser = foundUser;
        } else {
          // Silent clear if invalid user association (tampered/deleted)
          localStorage.removeItem('aiec_session_token');
          localStorage.removeItem('aiec_last_role_used');
        }
      } else {
        // Silent clear if corrupted formatting
        localStorage.removeItem('aiec_session_token');
        localStorage.removeItem('aiec_last_role_used');
      }
    }

    // 3. Play splash screen animation and auto-route
    const timer = setTimeout(() => {
      setShowSplash(false);
      
      const isFirstLaunch = localStorage.getItem('aiec_first_launch_flag') !== 'false';

      if (authenticatedUser) {
        // Safe auto-route with zero taps for returning authenticated users
        setCurrentUser(authenticatedUser);
        logLaunchAnalytics(authenticatedUser.role);
        
        // Show What's New afterward if there was a version update
        const lastVersion = localStorage.getItem('aiec_app_version');
        if (lastVersion !== '1.0.1') {
          setShowWhatsNew(true);
        }
      } else {
        // Log guest/anonymous visit
        logLaunchAnalytics('guest');

        if (isFirstLaunch) {
          setShowCarousel(true);
        } else {
          // Version checking for non-first-time guest
          const lastVersion = localStorage.getItem('aiec_app_version');
          if (lastVersion !== '1.0.1') {
            setShowWhatsNew(true);
          }
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Cooldown timer for incorrect OTP attempts
  useEffect(() => {
    if (cooldownTime > 0) {
      const interval = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setOtpAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldownTime]);

  // Resend Countdown, Auto-Expiration Check and simulated SMS retrieval timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent) {
      interval = setInterval(() => {
        // Tick down resend countdown limit
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));

        // Check for 120-second OTP expiration limit
        if (otpSentTimestamp > 0) {
          const secondsElapsed = Math.floor((Date.now() - otpSentTimestamp) / 1000);
          if (secondsElapsed >= 120) {
            setIsExpired(true);
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, otpSentTimestamp]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownTime > 0) {
      setErrorMsg(`Security cooldown active. Please wait ${cooldownTime} seconds.`);
      return;
    }
    if (!loginPhone.trim()) return;

    // Detect international numbers
    const cleaned = loginPhone.replace(/\D/g, '');
    const isIntl = cleaned.length > 10 || loginPhone.startsWith('+');
    
    setOtpSent(true);
    setOtp6Digits(Array(6).fill(''));
    setErrorMsg('');
    setIsExpired(false);
    setResendCountdown(30);
    setOtpSentTimestamp(Date.now());
    setVerificationStatus('idle');

    // Fire simulated incoming SMS Toast
    setSimulateSmsToast(true);
    setTimeout(() => {
      setSimulateSmsToast(false);
    }, 12000); // give 12 seconds for friendly demonstration
  };

  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    if (resendCount >= 5) {
      setErrorMsg('Strict Limit: Maximum of 5 OTP resends allowed per 10 minutes to protect mobility channels.');
      return;
    }
    setResendCount((prev) => prev + 1);
    setResendCountdown(30);
    setOtpSentTimestamp(Date.now());
    setIsExpired(false);
    setOtp6Digits(Array(6).fill(''));
    setErrorMsg('');
    setVerificationStatus('idle');

    // Fire simulated incoming SMS Toast
    setSimulateSmsToast(true);
    setTimeout(() => {
      setSimulateSmsToast(false);
    }, 12000);
  };

  const triggerInstantVerification = (code: string) => {
    if (cooldownTime > 0 || isExpired) return;

    // Format validation: 6-digits, or the '1234' demo bypass code
    const isBypass = code === '1234' || code === '123456';
    const isSixDigit = /^\d{6}$/.test(code);
    if (!isBypass && !isSixDigit) {
      return;
    }

    setVerificationStatus('verifying');
    setErrorMsg('');

    // Simulated secure handshaking with server-side proxy
    setTimeout(() => {
      if (code === '123456' || code === '1234' || code === '888888') {
        setVerificationStatus('success');
        setErrorMsg('');
        setOtpAttempts(0);

        // Instant delay before auto-navigation
        setTimeout(() => {
          const list = DbManager.getUsers();
          let found = list.find((u) => u.phone.includes(loginPhone));

          if (!found) {
            found = {
              id: `real_${Date.now()}`,
              role: 'pending_selection' as any, // default role
              name: `Partner ${countryCode} ${loginPhone}`,
              phone: `${countryCode} ${loginPhone}`,
              status: 'pending', // Pending approval holding state
              avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            };
            DbManager.addUser(found);
          }

          setCurrentUser({ ...found, isDemo: false });

          if (rememberMe) {
            localStorage.setItem('aiec_session_token', `session_${found.id}`);
            localStorage.setItem('aiec_last_role_used', found.role);
          }
          logLaunchAnalytics(found.role);
          setActiveTab('Home');
          setVerificationStatus('idle');
          setOtpSent(false);
          setSimulateSmsToast(false);
        }, 800);
      } else {
        setVerificationStatus('error');
        const nextAttempts = otpAttempts + 1;
        setOtpAttempts(nextAttempts);
        if (nextAttempts >= 3) {
          setCooldownTime(60);
          setErrorMsg('3 incorrect OTP attempts. Security cooldown triggered for 60 seconds.');
        } else {
          setErrorMsg(`Invalid verification PIN. Attempts remaining: ${3 - nextAttempts}`);
        }
      }
    }, 900);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownTime > 0 || isExpired) return;
    const code = otp6Digits.join('');
    triggerInstantVerification(code);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    const emailLower = loginEmail.toLowerCase().trim();
    const list = DbManager.getUsers();
    
    // Seeded email definitions
    const emailToRoleMap: Record<string, { role: UserRole; name: string; phone: string; status: UserStatus }> = {
      'admin@aiec.com': { role: 'admin', name: 'Mr. Prashant Vasant Wable', phone: '+91 98765 43210', status: 'active' },
      'surveyor@aiec.com': { role: 'surveyor', name: 'Amit Sharma', phone: '+91 98765 43211', status: 'active' },
      'technician@aiec.com': { role: 'technician', name: 'Rajesh Patel', phone: '+91 98765 43212', status: 'active' },
      'supplier@aiec.com': { role: 'supplier', name: 'Sun Elevators Manufacturing', phone: '+91 98765 43213', status: 'active' },
      'customer@aiec.com': { role: 'customer', name: 'Rohan Deshmukh', phone: '+91 98765 43214', status: 'active' },
      'pending@aiec.com': { role: 'surveyor', name: 'Rahul Joshi (Pending)', phone: '+91 98765 43299', status: 'pending' },
    };

    if (emailToRoleMap[emailLower] && loginPassword === 'password123') {
      const mapped = emailToRoleMap[emailLower];
      let found = list.find(u => u.phone === mapped.phone);
      if (!found) {
        found = {
          id: `user_${Date.now()}`,
          role: mapped.role,
          name: mapped.name,
          phone: mapped.phone,
          status: mapped.status,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
        };
        DbManager.addUser(found);
      }
      
      setCurrentUser({ ...found, isDemo: false });
      if (rememberMe) {
        localStorage.setItem('aiec_session_token', `session_${found.id}`);
        localStorage.setItem('aiec_last_role_used', found.role);
      }
      logLaunchAnalytics(found.role);
      setActiveTab('Home');
    } else {
      setErrorMsg('Invalid email or password. Use email fallback (e.g. admin@aiec.com / password123)');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    if (!auth) {
      setErrorMsg('Firebase Authentication is not initialized. Please configure/deploy properly.');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      if (!firebaseUser) {
        throw new Error('No user credentials returned from Google Sign-In.');
      }

      const email = firebaseUser.email?.toLowerCase() || '';
      const list = DbManager.getUsers();
      
      // Look for user with this email
      let found = list.find(u => u.email?.toLowerCase() === email);
      
      // Auto-map Prashant Wable (Owner/Founder email) to the pre-seeded admin profile
      if (!found && email === 'prashantashwable@gmail.com') {
        found = list.find(u => u.id === 'admin_prashant');
        if (found) {
          found = { ...found, email };
          DbManager.updateUser(found);
        }
      }

      // If they are not found in the list, create a new user with pending selection role (Step 1-2 onboarding)
      if (!found) {
        found = {
          id: `google_${firebaseUser.uid}`,
          role: 'pending_selection' as any,
          name: firebaseUser.displayName || 'Google User',
          phone: firebaseUser.phoneNumber || '',
          email: email,
          status: 'pending',
          avatarUrl: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        };
        DbManager.addUser(found);
      }

      setCurrentUser({ ...found, isDemo: false });
      if (rememberMe) {
        localStorage.setItem('aiec_session_token', `session_${found.id}`);
        localStorage.setItem('aiec_last_role_used', found.role);
      }
      logLaunchAnalytics(found.role);
      setActiveTab('Home');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code === 'auth/popup-blocked') {
        setErrorMsg('Sign-In popup was blocked by your browser. Please enable popups and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setErrorMsg('This domain is not authorized for Google Sign-In in Firebase Console.');
      } else {
        setErrorMsg(error.message || 'An error occurred during Google Sign-In.');
      }
    }
  };

  const handleDemoBypass = (role: UserRole) => {
    const list = DbManager.getUsers();
    const found = list.find(u => u.role === role) || list[0];
    
    // Create flagged demo session with active status and completed onboarding
    const demoUser: User = {
      ...found,
      status: 'active',
      onboardingCompleted: true,
      primer_shown_flag: true,
      isDemo: true
    };
    setCurrentUser(demoUser);
    setShowCarousel(false);
    localStorage.setItem('aiec_first_launch_flag', 'false');
    
    // Demo mode bypass has no persistent session token saved
    localStorage.setItem('aiec_last_role_used', role);
    logLaunchAnalytics(`${role}_demo`);
    setActiveTab('Home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aiec_session_token');
    localStorage.removeItem('aiec_last_role_used');
    setOtpSent(false);
    setLoginPhone('');
    setOtpCode('');
    setOtp6Digits(Array(6).fill(''));
    setLoginEmail('');
    setLoginPassword('');
    setErrorMsg('');
    setOtpAttempts(0);
    setActiveTab('Home');
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, '').slice(-1);
    const updated = [...otp6Digits];
    updated[index] = sanitized;
    setOtp6Digits(updated);

    // Auto-advance Focus if character was typed
    if (sanitized && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }

    // Auto-verify the instant all 6 digits are filled
    const fullCode = updated.join('');
    if (fullCode.length === 6) {
      triggerInstantVerification(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp6Digits[index] && index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) {
          (prevInput as HTMLInputElement).focus();
          const updated = [...otp6Digits];
          updated[index - 1] = '';
          setOtp6Digits(updated);
        }
      } else {
        const updated = [...otp6Digits];
        updated[index] = '';
        setOtp6Digits(updated);
      }
    }
  };

  const renderPreferencesSection = () => {
    return (
      <div className="space-y-4 text-left border-t border-[rgba(184,135,61,0.15)] pt-4 mt-4">
        <div>
          <h4 className="font-serif text-sm font-bold text-charcoal">App Display Preferences / डिस्प्ले प्राथमिकताएं</h4>
          <p className="text-[10px] text-warmgray">Customize your language and theme modes. Changes save instantly to your secure profile.</p>
        </div>
        
        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-mono font-bold text-antiquegold flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>Preferred Language / भाषा पसंद</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['en', 'hi', 'mr'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setAppLanguage(lang)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                  appLanguage === lang
                    ? 'bg-antiquegold border-antiquegold text-white shadow-xs font-extrabold'
                    : 'bg-white border-[rgba(184,135,61,0.15)] text-charcoal hover:bg-alabaster'
                }`}
              >
                {lang === 'en' ? '🇬🇧 English' : lang === 'hi' ? '🇮🇳 हिंदी' : '🇮🇳 मराठी'}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-mono font-bold text-antiquegold flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            <span>Visual Theme Mode / थीम मोड</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['light', 'snow', 'dark', 'system'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAppTheme(mode)}
                className={`py-2 px-1 text-center text-xs font-bold rounded-xl border cursor-pointer transition-all capitalize ${
                  appTheme === mode
                    ? 'bg-antiquegold border-antiquegold text-white shadow-xs font-extrabold'
                    : 'bg-white border-[rgba(184,135,61,0.15)] text-charcoal hover:bg-alabaster'
                }`}
              >
                {mode === 'light' ? '🎨 Alabaster' : mode === 'snow' ? '⚪ Snow White' : mode === 'dark' ? '🌑 Dark' : '💻 System'}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Sidebar / bottom tab items per role
  const getTabsByRole = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return [
          { id: 'Home', label: 'Overview', icon: LayoutDashboard },
          { id: 'CustomerHomeDashboard', label: 'Customer Portal 🏠', icon: Building },
          { id: 'ProjectStatusTracker', label: 'Project Status Tracker ⏱️', icon: Clock },
          { id: 'LeadInbox', label: 'Lead Inbox 📥', icon: FileText },
          { id: 'LeadPipeline', label: 'Lead Kanban 📋', icon: Layers },
          { id: 'LeadAssignment', label: 'Lead Assignment 📋', icon: Users },
          { id: 'LeadMerge', label: 'Merge Studio ⛓️', icon: Split },
          { id: 'LeadScoring', label: 'Lead Scoring 📈', icon: Award },
          { id: 'LeadFollowUp', label: 'Follow-Ups 📅', icon: Calendar },
          { id: 'LeadSource', label: 'Source & Campaigns 📊', icon: TrendingUp },
          { id: 'LeadLost', label: 'Disqualify Lead 🚨', icon: AlertCircle },
          { id: 'LeadMigrate', label: 'Bulk Import/Export 📊', icon: FileSpreadsheet },
          { id: 'CommTemplates', label: 'Comm Templates 💬', icon: MessageSquare },
          { id: 'CommSequences', label: 'Comm Sequences ⚙️', icon: GitMerge },
          { id: 'CommWhatsApp', label: 'WhatsApp Console 💬', icon: MessageSquare },
          { id: 'CommCalls', label: 'Auto-Dialer & Logs 📞', icon: Phone },
          { id: 'CommSMS', label: 'SMS Broadcast ✉️', icon: Send },
          { id: 'CommBot', label: 'AI Bot Config 🤖', icon: Bot },
          { id: 'CommInbox', label: 'Reply Inbox 📥', icon: Inbox },
          { id: 'CommCompliance', label: 'Compliance & DND 🛡️', icon: Shield },
          { id: 'CommRules', label: 'Stage Trigger Rules ⚙️', icon: Settings },
          { id: 'CommAnalytics', label: 'Comm Analytics 📊', icon: LineChart },
          { id: 'QuoteSpecs', label: 'Quotation Specs ⚙️', icon: FileText },
          { id: 'QuotePricing', label: 'Cost & Profit 💰', icon: DollarSign },
          { id: 'QuoteBranding', label: 'Quote Branding 🎨', icon: Palette },
          { id: 'QuotePreview', label: 'Quote Preview 👁️', icon: Eye },
          { id: 'QuoteCompare', label: 'Quote Compare ⚖️', icon: Split },
          { id: 'QuoteHistory', label: 'Quote History ⏳', icon: History },
          { id: 'QuoteDiscount', label: 'Discount Control 🏷️', icon: Percent },
          { id: 'QuoteDelivery', label: 'E-Delivery Hub 📨', icon: Send },
          { id: 'QuoteAnalytics', label: 'Quote Win/Loss 📈', icon: LineChart },
          { id: 'QuotePricingRules', label: 'Pricing & Margin ⚙️', icon: Sliders },
          { id: 'QuoteNegotiationBot', label: 'Negotiation Bot 🤖', icon: Bot },
          { id: 'QuoteNegotiationThread', label: 'Live Thread 💬', icon: MessageSquare },
          { id: 'QuoteCounterOfferApproval', label: 'Counter Approvals ⚖️', icon: Sliders },
          { id: 'QuoteDealTermsFinalization', label: 'Deal Finalization 🤝', icon: Landmark },
          { id: 'QuoteDigitalContract', label: 'Contract Generator 📄', icon: FileText },
          { id: 'QuoteESignature', label: 'E-Sign Capture ✍️', icon: FileText },
          { id: 'QuoteDealClosure', label: 'Deal Closure 🏆', icon: Award },
          { id: 'QuoteObjectionHandling', label: 'Objection Library 💡', icon: HelpCircle },
          { id: 'QuoteCompetitorBattlecard', label: 'Competitor Battlecards ⚔️', icon: ShieldCheck },
          { id: 'QuoteDealWonCelebration', label: 'Win Celebration 🏆', icon: Award },
          { id: 'PaymentStageScheduleSetup', label: 'Payment Schedule 💳', icon: DollarSign },
          { id: 'PaymentCollectionDashboard', label: 'Payment Collection 💰', icon: CreditCard },
          { id: 'PaymentReminderConfig', label: 'Reminder Rules ⚙️', icon: SlidersHorizontal },
          { id: 'OnlinePaymentCheckout', label: 'Digital Checkout 💳', icon: Lock },
          { id: 'LoanEmiApplication', label: 'Loan & EMI Application 🏦', icon: Landmark },
          { id: 'LoanPartnerIntegration', label: 'Loan Desk & Reconciliation 🤝', icon: Landmark },
          { id: 'InvoiceGenerator', label: 'Invoices & Credit Notes 📄', icon: FileText },
          { id: 'PaymentReceiptHistory', label: 'Payment Ledger & Receipts 🧾', icon: History },
          { id: 'OverduePaymentEscalation', label: 'Overdue Escalations 🚨', icon: AlertTriangle },
          { id: 'RefundDisputeManagement', label: 'Disputes & Refunds 🛡️', icon: ShieldCheck },
          { id: 'LiveMap', label: 'Live Operations', icon: MapPin },
          { id: 'RouteOpt', label: 'Route Match 🗺️', icon: Compass },
          { id: 'SOSDesk', label: 'SOS Desk 🚨', icon: AlertTriangle },
          { id: 'LiveFeed', label: 'Live Feed', icon: Activity },
          { id: 'SurveyorAudit', label: 'Surveyor Audit', icon: Compass },
          { id: 'TechnicianAudit', label: 'Technician Audit', icon: Hammer },
          { id: 'Territories', label: 'Territory Control', icon: Globe },
          { id: 'Heatmap', label: 'Lead Heatmap', icon: Flame },
          { id: 'SiteVerify', label: 'Geo-Verification', icon: Shield },
          { id: 'Funnel', label: 'Sales Funnel', icon: TrendingUp },
          { id: 'RevenueProfit', label: 'Revenue & Profit', icon: LineChart },
          { id: 'FinancialCashFlow', label: 'Cash Flow & Aging 💵', icon: Landmark },
          { id: 'AlertsExceptions', label: 'Exceptions & Alerts ⚠️', icon: AlertTriangle },
          { id: 'CustomReport', label: 'Custom Report Builder 📊', icon: FileText },
          { id: 'Leaderboard', label: 'Worker Leaderboard 🏆', icon: Award },
          { id: 'Conversion', label: 'Region Conversions 📈', icon: Grid },
          { id: 'SupplierScorecard', label: 'Supplier SLA 🏆', icon: Truck },
          { id: 'SupplierDirectory', label: 'Supplier Directory 🏢', icon: Building },
          { id: 'SupplierCatalogPricing', label: 'Supplier Catalog 🏷️', icon: Tag },
          { id: 'PurchaseOrderGenerator', label: 'PO Generator 📦', icon: FileText },
          { id: 'AutoPoTriggerRules', label: 'Auto-PO Rules ⚙️', icon: Sliders },
          { id: 'SupplierOrderStatusTracking', label: 'PO Tracking 🚚', icon: Truck },
          { id: 'ManufacturerProductionStatus', label: 'Production Status 🏭', icon: Hammer },
          { id: 'SupplierRatingScorecard', label: 'Supplier Scorecards 🏆', icon: Award },
          { id: 'SupplierContractSla', label: 'Contract & SLA 📄', icon: Shield },
          { id: 'SupplierCommThreads', label: 'Supplier Threads 💬', icon: MessageSquare },
          { id: 'SupplierPaymentTerms', label: 'Payment Terms Config 💳', icon: DollarSign },
          { id: 'DeliveryScheduling', label: 'Delivery Scheduling 📅', icon: Calendar },
          { id: 'LiveShipmentTracking', label: 'Shipment GPS Tracking 🚚', icon: MapPin },
          { id: 'SiteDeliveryChecklist', label: 'Delivery Checklist 📋', icon: ClipboardCheck },
          { id: 'MaterialReceivedConfirmation', label: 'Material Receipt Sign-off ✍️', icon: FileCheck },
          { id: 'DeliveryDelayAlerts', label: 'Delivery Delay Alerts ⚠️', icon: AlertTriangle },
          { id: 'StockInTransit', label: 'Stock in Transit 📦', icon: Layers },
          { id: 'DeliverySopConfig', label: 'Delivery SOP Config ⚙️', icon: FileText },
          { id: 'DamagedMissingPartsReport', label: 'Damaged/Missing Parts ⚠️', icon: AlertTriangle },
          { id: 'DeliveryPartnerManagement', label: 'Delivery Partners 🚚', icon: Truck },
          { id: 'DeliveryAnalytics', label: 'Delivery Analytics 📊', icon: BarChart2 },
          { id: 'SupplierPaymentApproval', label: 'Supplier Payment Queue 💳', icon: DollarSign },
          { id: 'MilestonePaymentRelease', label: 'Milestone Release Chain ⛓️', icon: Layers },
          { id: 'SupplierInvoiceMatching', label: '3-Way Invoice Matching 📑', icon: FileCheck },
          { id: 'SupplierPaymentSchedule', label: 'Outflow Payment Schedule 📅', icon: Calendar },
          { id: 'SupplierPaymentHistory', label: 'Supplier Payment Ledger 📜', icon: History },
          { id: 'TaxGstCompliance', label: 'Tax/GST Reconciliation 📑', icon: Percent },
          { id: 'SupplierDisputeResolution', label: 'Supplier Dispute Desk ⚖️', icon: Scale },
          { id: 'AdvancePaymentRetention', label: 'Advances & Retentions 🔒', icon: Lock },
          { id: 'SupplierPaymentAnalytics', label: 'Payment Analytics 📊', icon: BarChart2 },
          { id: 'AutoReconciliation', label: 'Bank Auto-Reconciliation 🏦', icon: CheckCircle2 },
          { id: 'TechnicianHomeMyJobs', label: 'Technician Jobs Hub 🧰', icon: Wrench },
          { id: 'JobDetailSiteInfo', label: 'Job Site Specs 🔍', icon: Eye },
          { id: 'InstallationSopChecklist', label: 'Installation SOP Checklist 🔨', icon: Hammer },
          { id: 'PhotoVideoEvidenceCapture', label: 'Media Evidence Gallery 📸', icon: Camera },
          { id: 'TechnicianCheckInCheckOut', label: 'Technician Site GPS Check-In 📍', icon: MapPin },
          { id: 'SafetyComplianceChecklist', label: 'Safety Compliance Checklist 🛡️', icon: ShieldCheck },
          { id: 'IssueBlockerReporting', label: 'Issue & Blocker Reports 🚨', icon: AlertTriangle },
          { id: 'MaterialUsageLogging', label: 'Material Usage Logging 📋', icon: ClipboardList },
          { id: 'AutomationHealth', label: 'Automation Health ⚙️', icon: Cpu },
          { id: 'MasterAutomationRulesDashboard', label: 'Master Automation Rules ⚡', icon: Zap },
          { id: 'WorkflowTriggerBuilder', label: 'Workflow Trigger Builder 🛠️', icon: Sliders },
          { id: 'NotificationTemplatesChannels', label: 'Notification Channels 🔔', icon: Bell },
          { id: 'EscalationMatrixConfig', label: 'Escalation Matrix ⛓️', icon: GitCommit },
          { id: 'SlaTimerBreachAlert', label: 'SLA Timers & Breaches ⏱️', icon: Clock },
          { id: 'SystemHealthBotMonitoring', label: 'System Health & Bots 💻', icon: Cpu },
          { id: 'AuditLogAutomatedActions', label: 'Automation Audit Log 📜', icon: FileText },
          { id: 'ManualOverrideConsole', label: 'Manual Override Console 🎛️', icon: Sliders },
          { id: 'CompanyProfileBrandingSettings', label: 'Company Profile & Branding 🏢', icon: Building },
          { id: 'UserRolePermissionManagement', label: 'User Roles & Permissions 🛡️', icon: Shield },
          { id: 'SinglePersonMonitorControlPanel', label: 'Single-Person Monitor 🎛️', icon: Activity },
          { id: 'DataPrivacyConsentManagement', label: 'Data Privacy & Consent 🔒', icon: Lock },
          { id: 'SecuritySessionManagement', label: 'Security & Active Sessions 🛡️', icon: Shield },
          { id: 'BackupDataExport', label: 'Backup & Data Export 💾', icon: Database },
          { id: 'SaaSOpsSubscriptionBilling', label: 'SaaS Ops & Billing 💳', icon: CreditCard },
          { id: 'LegalContractTemplatesRepository', label: 'Legal Templates Repository ⚖️', icon: Scale },
          { id: 'HelpFaqSupport', label: 'Help & Support Desk ❓', icon: HelpCircle },
          { id: 'AppVersionChangelogFeedback', label: 'App Version & Changelog 📱', icon: Info },
          { id: 'Partners', label: 'Directory', icon: Users },
          { id: 'Settings', label: 'Control Unit', icon: Settings }
        ];
      case 'surveyor':
        return [
          { id: 'Home', label: 'Capture Portal', icon: Building },
          { id: 'LeadFollowUp', label: 'Follow-Ups 📅', icon: Calendar },
          { id: 'Incentives', label: 'History', icon: Users },
          { id: 'Settings', label: 'Settings', icon: Settings }
        ];
      case 'technician':
        return [
          { id: 'TechnicianHomeMyJobs', label: 'My Assigned Jobs 🧰', icon: Wrench },
          { id: 'JobDetailSiteInfo', label: 'Site Specs & Materials 🔍', icon: Eye },
          { id: 'InstallationSopChecklist', label: 'Installation SOP Checklist 🔨', icon: Hammer },
          { id: 'PhotoVideoEvidenceCapture', label: 'Media Evidence Gallery 📸', icon: Camera },
          { id: 'TechnicianCheckInCheckOut', label: 'Site Check-In / Out 📍', icon: MapPin },
          { id: 'SafetyComplianceChecklist', label: 'Safety Compliance Checklist 🛡️', icon: ShieldCheck },
          { id: 'IssueBlockerReporting', label: 'Issue & Blocker Reports 🚨', icon: AlertTriangle },
          { id: 'MaterialUsageLogging', label: 'Material Usage Logging 📋', icon: ClipboardList },
          { id: 'LiveShipmentTracking', label: 'Shipment GPS Tracking 🚚', icon: MapPin },
          { id: 'SiteDeliveryChecklist', label: 'Site Unboxing Checklist 📋', icon: ClipboardCheck },
          { id: 'MaterialReceivedConfirmation', label: 'Material Receipt Sign-off ✍️', icon: FileCheck },
          { id: 'DamagedMissingPartsReport', label: 'Report Damaged/Missing Parts 🚨', icon: AlertTriangle },
          { id: 'Settings', label: 'Settings', icon: Settings }
        ];
      case 'customer':
        return [
          { id: 'CustomerHomeDashboard', label: 'Customer Home 🏠', icon: Building },
          { id: 'ProjectStatusTracker', label: 'Installation Tracker ⏱️', icon: Clock },
          { id: 'CustomerDocumentVault', label: 'Document Vault 📁', icon: FileText },
          { id: 'CustomerPaymentInstallments', label: 'Payments & Installments 💳', icon: CreditCard },
          { id: 'CustomerSupportTicket', label: 'Support Desk & SOS 🧰', icon: Wrench },
          { id: 'CustomerLiveSupportChat', label: 'Live Support Chat 💬', icon: MessageSquare },
          { id: 'CustomerAmcBooking', label: 'AMC & Maintenance Booking 📅', icon: Calendar },
          { id: 'CustomerFeedbackRating', label: 'Ratings & Review ⭐', icon: Award },
          { id: 'CustomerReferralProgram', label: 'Referral & Rewards 🎁', icon: Gift },
          { id: 'CustomerNotificationCenter', label: 'Notification Center 🔔', icon: Bell },
          { id: 'LiveShipmentTracking', label: 'Track My Delivery 🚚', icon: MapPin },
          { id: 'MaterialReceivedConfirmation', label: 'Material Receipt Sign-off ✍️', icon: FileCheck },
          { id: 'OnlinePaymentCheckout', label: 'Digital Checkout 💳', icon: Lock },
          { id: 'InvoiceGenerator', label: 'Tax Invoices 📄', icon: FileText },
          { id: 'QuotePreview', label: 'My Quotation 👁️', icon: Eye },
          { id: 'QuoteNegotiationThread', label: 'Live Negotiation 💬', icon: MessageSquare },
          { id: 'Settings', label: 'Preferences', icon: Settings }
        ];

      case 'supplier':
        return [
          { id: 'Home', label: 'Catalog Engine', icon: Truck },
          { id: 'SupplierDirectory', label: 'Supplier Directory 🏢', icon: Building },
          { id: 'SupplierCatalogPricing', label: 'Catalog & Pricing 🏷️', icon: Tag },
          { id: 'PurchaseOrderGenerator', label: 'Purchase Orders 📦', icon: FileText },
          { id: 'SupplierOrderStatusTracking', label: 'PO Tracking 🚚', icon: Truck },
          { id: 'ManufacturerProductionStatus', label: 'Production Status 🏭', icon: Hammer },
          { id: 'SupplierRatingScorecard', label: 'Quality Scorecard 🏆', icon: Award },
          { id: 'SupplierContractSla', label: 'SLA Agreement 📄', icon: Shield },
          { id: 'SupplierCommThreads', label: 'Supplier Threads 💬', icon: MessageSquare },
          { id: 'SupplierPaymentTerms', label: 'Payment Terms 💳', icon: DollarSign },
          { id: 'SupplierInvoiceMatching', label: 'Upload Tax Invoices 📑', icon: FileCheck },
          { id: 'SupplierPaymentHistory', label: 'My Payment Ledger 📜', icon: History },
          { id: 'SupplierDisputeResolution', label: 'Payment Dispute Desk ⚖️', icon: Scale },
          { id: 'DeliveryScheduling', label: 'Delivery Scheduling 📅', icon: Calendar },
          { id: 'LiveShipmentTracking', label: 'Shipment GPS Tracking 🚚', icon: MapPin },
          { id: 'Settings', label: 'Settings', icon: Settings }
        ];

      default:
        return [{ id: 'Home', label: 'Overview', icon: LayoutDashboard }];
    }
  };

  return (
    <div className="min-h-screen bg-alabaster flex flex-col font-sans select-none selection:bg-antiquegold/30 antialiased relative">
      <AnimatePresence>
        {/* =========================================================
            SPLASH INTRO SCREEN
            ========================================================= */}
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-[#F8F6F1] flex flex-col items-center justify-between p-8 text-charcoal"
          >
            {/* Top Empty Space for vertical rhythm */}
            <div className="h-10" />

            {/* Visual Anchor: Logo & Vertical Ascension Line Anim */}
            <div className="flex flex-col items-center justify-center space-y-8 max-w-sm w-full">
              {/* Animated Ascension Line Motif */}
              <div className="relative h-32 w-1 bg-[#e5dfd4] rounded-full overflow-hidden">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-antiquegold rounded-full"
                  initial={{ height: "0%" }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />
                
                {/* Floating Elevator Cabin indicator node */}
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-royalemerald border border-antiquegold flex items-center justify-center shadow-md"
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: [0, -128], opacity: [0, 1, 1, 1] }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </motion.div>
              </div>

              {/* Wordmark Reveal */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                className="text-center space-y-3"
              >
                <h1 className="font-serif text-3xl font-extrabold tracking-tight text-charcoal flex flex-col leading-none">
                  <span className="text-[10px] uppercase tracking-widest text-antiquegold font-extrabold mb-2 font-sans">ESTABLISHED 1994</span>
                  <span className="font-serif text-3xl tracking-wide font-black text-[#0E4B3D]">ALL INDIA</span>
                  <span className="font-serif text-2xl tracking-widest font-light text-[#B8873D]">ELEVATORS</span>
                </h1>
                <div className="h-[1px] w-16 bg-[#B8873D]/35 mx-auto" />
                <p className="text-xs font-semibold tracking-wider text-warmgray uppercase">Authorized Mobility Aggregator</p>
              </motion.div>
            </div>

            {/* Bottom Credit Line & Tagline (Fades in) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              className="text-center space-y-1.5 pb-8"
            >
              <p className="text-[9px] uppercase tracking-widest font-extrabold text-warmgray">Owner & Director</p>
              <p className="font-serif text-sm font-extrabold text-[#0E4B3D]">Mr. Prashant Vasant Wable, Founder</p>
              <p className="text-[9px] font-mono text-[#B8873D]/80">ISO 9001:2015 Safety Certified • v1.0.1</p>
            </motion.div>
          </motion.div>
        )}

        {/* =========================================================
            MAIN LAYOUT & AUTH SHIELD / ONBOARDING CAROUSEL
            ========================================================= */}
        {!showSplash && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            {showCarousel ? (
              /* =========================================================
                 3-CARD VALUE-PROP ONBOARDING CAROUSEL
                 ========================================================= */
              <div className="flex-1 flex items-center justify-center p-4 bg-[#F8F6F1]">
                <div className="w-full max-w-lg bg-white rounded-3xl border border-[rgba(184,135,61,0.18)] p-6 md:p-8 space-y-6 shadow-diffuse relative overflow-hidden">
                  
                  {/* Background Accents */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-royalemerald/5 rounded-full blur-3xl -z-10" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-antiquegold/5 rounded-full blur-3xl -z-10" />

                  {/* Header Steps */}
                  <div className="flex items-center justify-between border-b border-[#e5dfd4] pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-royalemerald text-white flex items-center justify-center">
                        <Building className="w-4 h-4" />
                      </div>
                      <span className="font-serif text-sm font-bold text-charcoal">AIEC Onboarding</span>
                    </div>
                    <span className="text-xs font-mono text-antiquegold font-semibold">Step {carouselStep + 1} of 3</span>
                  </div>

                  {/* Onboarding Steps Visual Stage */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={carouselStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 py-2"
                    >
                      {carouselStep === 0 && (
                        <div className="space-y-4">
                          <div className="w-14 h-14 bg-royalemerald/10 text-royalemerald rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                            <MapPin className="w-7 h-7" />
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="font-serif text-lg font-bold text-charcoal">1. On-site GPS Lead Capture</h3>
                            <p className="text-xs text-warmgray leading-relaxed max-w-sm mx-auto">
                              Authorized field surveyors map high-rise structures, upload physical lift shaft dimensions, and automatically geo-locate with GPS grounding to protect territory.
                            </p>
                          </div>
                          <div className="p-3.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)] text-center font-mono text-[10px] text-warmgray space-y-1">
                            <div className="flex justify-between text-charcoal font-semibold">
                              <span>GROUNDING INDEX</span>
                              <span className="text-success">CONNECTED</span>
                            </div>
                            <div className="flex justify-between">
                              <span>LATITUDE / LONGITUDE</span>
                              <span>18.5204° N, 73.8567° E (Pune HQ)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {carouselStep === 1 && (
                        <div className="space-y-4">
                          <div className="w-14 h-14 bg-antiquegold/10 text-antiquegold rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                            <Layers className="w-7 h-7" />
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="font-serif text-lg font-bold text-charcoal">2. Premium Cabin Customizer</h3>
                            <p className="text-xs text-warmgray leading-relaxed max-w-sm mx-auto">
                              Let clients specify high-efficiency drives, cabin capacities, and choose premium golden and glass wall finishes. Acceptances sync directly onto the Golden Ascension Line.
                            </p>
                          </div>
                          <div className="p-3.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)] text-center font-mono text-[10px] text-warmgray space-y-1">
                            <div className="flex justify-between text-charcoal font-semibold">
                              <span>DESIGN PRESET</span>
                              <span className="text-antiquegold">EMPEROR GOLD</span>
                            </div>
                            <div className="flex justify-between">
                              <span>WALL PANELING</span>
                              <span>Mirror Finish Gold + Glass Clad</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {carouselStep === 2 && (
                        <div className="space-y-4">
                          <div className="w-14 h-14 bg-success/10 text-success rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                            <Award className="w-7 h-7" />
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="font-serif text-lg font-bold text-charcoal">3. Floor-by-Floor SOP & Payouts</h3>
                            <p className="text-xs text-warmgray leading-relaxed max-w-sm mx-auto">
                              Installation partners check off structural safety milestones. Approved clearances trigger automatic commission releases and direct partner payouts instantly.
                            </p>
                          </div>
                          <div className="p-3.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)] text-center font-mono text-[10px] text-warmgray space-y-1">
                            <div className="flex justify-between text-charcoal font-semibold">
                              <span>QC DISBURSEMENT</span>
                              <span className="text-success">COMPLETED</span>
                            </div>
                            <div className="flex justify-between">
                              <span>COM. RELEASE SCHEDULE</span>
                              <span>₹25,000 Surveyor Ledger Released</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Progress dots & Actions */}
                  <div className="space-y-4 pt-2">
                    {/* Dots indicator */}
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <button
                          key={i}
                          onClick={() => setCarouselStep(i)}
                          className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                            carouselStep === i ? 'bg-antiquegold w-6' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-2">
                      {carouselStep > 0 && (
                        <Button
                          variant="secondary"
                          className="flex-1"
                          onClick={() => setCarouselStep(prev => prev - 1)}
                        >
                          Back
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={() => {
                          if (carouselStep < 2) {
                            setCarouselStep(prev => prev + 1);
                          } else {
                            // Onboarding completed
                            localStorage.setItem('aiec_first_launch_flag', 'false');
                            setShowCarousel(false);
                            // Chain trigger What's New if the version was updated
                            const lastVersion = localStorage.getItem('aiec_app_version');
                            if (lastVersion !== '1.0.1') {
                              setShowWhatsNew(true);
                            }
                          }
                        }}
                      >
                        <span>{carouselStep === 2 ? 'Get Started & Sign In' : 'Continue'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            ) : !currentUser ? (
              /* =========================================================
                 LOGIN SCREEN
                 ========================================================= */
              <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 md:p-8 bg-[#F8F6F1] relative overflow-hidden">
                
                {/* Background decorative patterns */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#0E4B3D]/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#B8873D]/5 rounded-full blur-3xl -z-10" />

                {showForgotReset ? (
                  <ForgotPasswordReset onBackToLogin={() => setShowForgotReset(false)} />
                ) : (
                  <div className="w-full max-w-4xl flex flex-col md:flex-row items-stretch bg-white rounded-3xl border border-[rgba(184,135,61,0.18)] shadow-diffuse overflow-hidden">
                  
                  {/* Left Side: Brand Visual & The Ascension Line Elevator motif */}
                  <div className="w-full md:w-[40%] bg-[#D4AF37] text-[#231700] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5C6] via-[#D4AF37] to-[#8C6412] -z-10" />
                    
                    {/* The Ascension Line Elevator Rail Motif */}
                    <div className="absolute right-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-transparent via-[#231700]/30 to-transparent flex flex-col justify-between items-center py-8">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#231700] ring-2 ring-white/40" />
                      <motion.div 
                        animate={{ y: [0, 160, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        className="w-5 h-5 rounded-full bg-[#231700] ring-4 ring-[#231700]/20 shadow-lg flex items-center justify-center text-[8px] font-mono font-bold text-white"
                      >
                        ↑
                      </motion.div>
                      <div className="w-3.5 h-3.5 rounded-full bg-[#231700] ring-2 ring-white/40" />
                    </div>

                    <div className="space-y-6 max-w-[85%] text-left">
                      <div className="w-10 h-10 bg-[#231700]/10 text-[#231700] rounded-xl flex items-center justify-center border border-[#231700]/20">
                        <Building className="w-5 h-5 text-[#231700] stroke-[1.5]" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="font-serif text-2xl font-bold tracking-tight text-[#231700] leading-tight">
                          {appTranslations[appLanguage].title}
                        </h2>
                        <p className="text-[10px] text-[#533900] uppercase tracking-widest font-mono font-bold">
                          {appTranslations[appLanguage].subtitle}
                        </p>
                      </div>
                      <p className="text-xs text-[#231700]/85 leading-relaxed font-sans">
                        {appTranslations[appLanguage].description}
                      </p>
                    </div>

                    <div className="pt-8 space-y-1 md:block hidden text-left">
                      <p className="text-[8px] uppercase tracking-wider text-[#231700]/60 font-mono">
                        {appTranslations[appLanguage].foundingDirector}
                      </p>
                      <p className="font-serif text-xs font-bold text-[#4E3400]">Mr. Prashant Vasant Wable</p>
                      <p className="text-[9px] text-[#231700]/50 font-mono">{appTranslations[appLanguage].hq}</p>
                    </div>
                  </div>

                  {/* Right Side: Tabbed Interface (Try Demo vs Secure Login) */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white space-y-6 text-left">
                    <div className="space-y-4">
                      
                      {/* Language Switcher Bar - EXTREMELY VISIBLE AT THE VERY TOP */}
                      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 bg-[#F8F6F1] p-3 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-inner">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-extrabold text-[#B8873D]">
                          <Globe className="w-3.5 h-3.5" />
                          <span>{appTranslations[appLanguage].langLabel}</span>
                        </div>
                        <div className="flex gap-1 self-stretch xs:self-auto">
                          <button
                            type="button"
                            onClick={() => setAppLanguage('en')}
                            className={`flex-1 xs:flex-none px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                              appLanguage === 'en'
                                ? 'bg-[#B8873D] text-white font-extrabold shadow-sm'
                                : 'bg-white text-warmgray hover:text-charcoal border border-[rgba(184,135,61,0.1)]'
                            }`}
                          >
                            English
                          </button>
                          <button
                            type="button"
                            onClick={() => setAppLanguage('mr')}
                            className={`flex-1 xs:flex-none px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                              appLanguage === 'mr'
                                ? 'bg-[#B8873D] text-white font-extrabold shadow-sm'
                                : 'bg-white text-warmgray hover:text-charcoal border border-[rgba(184,135,61,0.1)]'
                            }`}
                          >
                            मराठी
                          </button>
                          <button
                            type="button"
                            onClick={() => setAppLanguage('hi')}
                            className={`flex-1 xs:flex-none px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                              appLanguage === 'hi'
                                ? 'bg-[#B8873D] text-white font-extrabold shadow-sm'
                                : 'bg-white text-warmgray hover:text-charcoal border border-[rgba(184,135,61,0.1)]'
                            }`}
                          >
                            हिन्दी
                          </button>
                        </div>
                      </div>

                      {/* Tabs at the Top */}
                      <div className="p-1 flex bg-[#F8F6F1] rounded-2xl border border-[rgba(184,135,61,0.1)]">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAuthTab('demo');
                            setErrorMsg('');
                          }}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                            activeAuthTab === 'demo'
                              ? 'bg-white text-[#B8873D] shadow-xs border border-[rgba(184,135,61,0.12)]'
                              : 'text-warmgray hover:text-charcoal'
                          }`}
                        >
                          {appTranslations[appLanguage].tryDemoMode}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAuthTab('phone');
                            setErrorMsg('');
                          }}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                            activeAuthTab === 'phone'
                              ? 'bg-white text-[#B8873D] shadow-xs border border-[rgba(184,135,61,0.12)]'
                              : 'text-warmgray hover:text-charcoal'
                          }`}
                        >
                          {appTranslations[appLanguage].secureLogin}
                        </button>
                      </div>

                      {/* Display Mode content */}
                      {activeAuthTab === 'demo' ? (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-serif text-lg font-bold text-charcoal">{appTranslations[appLanguage].aggregatorSandboxes}</h3>
                            <p className="text-xs text-warmgray">{appTranslations[appLanguage].sandboxDesc}</p>
                          </div>

                          <div className="grid grid-cols-1 gap-2 max-h-[340px] overflow-y-auto pr-1">
                            <button
                              type="button"
                              onClick={() => {
                                const newDemoPartner: User = {
                                  id: `demo_partner_${Date.now()}`,
                                  role: 'technician',
                                  name: 'Guest Partner (HQ Demo)',
                                  phone: '+91 91111 22222',
                                  status: 'active',
                                  onboardingCompleted: true,
                                  primer_shown_flag: true,
                                  isDemo: true,
                                  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                                };
                                DbManager.addUser(newDemoPartner);
                                setCurrentUser(newDemoPartner);
                                localStorage.setItem('aiec_session_token', `session_${newDemoPartner.id}`);
                                setActiveTab('Home');
                              }}
                              className="w-full p-3 bg-antiquegold/10 hover:bg-antiquegold/20 border border-antiquegold/25 rounded-xl flex items-center justify-between text-left transition-all hover:translate-x-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-antiquegold text-white flex items-center justify-center shrink-0">
                                  <Sparkles className="w-4 h-4 animate-pulse" />
                                </div>
                                <div className="truncate">
                                  <h4 className="font-bold text-xs text-[#B8873D] flex items-center gap-1.5">
                                    <span>{appTranslations[appLanguage].firstTimeOnboarding}</span>
                                    <span className="text-[8px] bg-antiquegold/20 text-[#B8873D] px-1.5 py-0.5 rounded-full font-mono font-bold">PROMPT 004</span>
                                  </h4>
                                  <p className="text-[10px] text-warmgray truncate">{appTranslations[appLanguage].selectRole}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-antiquegold shrink-0" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDemoBypass('admin')}
                              className="w-full p-3 bg-alabaster hover:bg-[#edeae2] border border-[rgba(184,135,61,0.1)] rounded-xl flex items-center justify-between text-left transition-all hover:translate-x-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#0E4B3D]/10 text-[#0E4B3D] flex items-center justify-center shrink-0">
                                  <Shield className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                  <h4 className="font-bold text-xs text-charcoal flex items-center gap-1.5">
                                    <span>{appTranslations[appLanguage].masterAdmin}</span>
                                    <span className="text-[8px] bg-[#0E4B3D]/10 text-[#0E4B3D] px-1.5 py-0.5 rounded-full font-mono font-bold">HQ</span>
                                  </h4>
                                  <p className="text-[10px] text-warmgray truncate">{appTranslations[appLanguage].ownerMonitor}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-warmgray shrink-0" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDemoBypass('surveyor')}
                              className="w-full p-3 bg-alabaster hover:bg-[#edeae2] border border-[rgba(184,135,61,0.1)] rounded-xl flex items-center justify-between text-left transition-all hover:translate-x-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#B8873D]/10 text-[#B8873D] flex items-center justify-center shrink-0">
                                  <MapPin className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                  <h4 className="font-bold text-xs text-charcoal flex items-center gap-1.5">
                                    <span>Amit Sharma</span>
                                    <span className="text-[8px] bg-[#B8873D]/10 text-[#B8873D] px-1.5 py-0.5 rounded-full font-mono font-bold">Surveyor</span>
                                  </h4>
                                  <p className="text-[10px] text-warmgray truncate">Log high-rise shafts, map GPS coordinates</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-warmgray shrink-0" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDemoBypass('technician')}
                              className="w-full p-3 bg-alabaster hover:bg-[#edeae2] border border-[rgba(184,135,61,0.1)] rounded-xl flex items-center justify-between text-left transition-all hover:translate-x-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#0E4B3D]/10 text-[#0E4B3D] flex items-center justify-center shrink-0">
                                  <Hammer className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                  <h4 className="font-bold text-xs text-charcoal flex items-center gap-1.5">
                                    <span>Rajesh Patel</span>
                                    <span className="text-[8px] bg-[#0E4B3D]/10 text-[#0E4B3D] px-1.5 py-0.5 rounded-full font-mono font-bold">Partner</span>
                                  </h4>
                                  <p className="text-[10px] text-warmgray truncate">Floor-by-floor safety checklists & installation</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-warmgray shrink-0" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDemoBypass('customer')}
                              className="w-full p-3 bg-alabaster hover:bg-[#edeae2] border border-[rgba(184,135,61,0.1)] rounded-xl flex items-center justify-between text-left transition-all hover:translate-x-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#2F8F5B]/10 text-[#2F8F5B] flex items-center justify-center shrink-0">
                                  <UserIcon className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                  <h4 className="font-bold text-xs text-charcoal flex items-center gap-1.5">
                                    <span>Rohan Deshmukh</span>
                                    <span className="text-[8px] bg-[#2F8F5B]/10 text-[#2F8F5B] px-1.5 py-0.5 rounded-full font-mono font-bold">Client</span>
                                  </h4>
                                  <p className="text-[10px] text-warmgray truncate">Track progress on Golden Ascension Line</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-warmgray shrink-0" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDemoBypass('supplier')}
                              className="w-full p-3 bg-alabaster hover:bg-[#edeae2] border border-[rgba(184,135,61,0.1)] rounded-xl flex items-center justify-between text-left transition-all hover:translate-x-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0">
                                  <Truck className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                  <h4 className="font-bold text-xs text-charcoal flex items-center gap-1.5">
                                    <span>Sun Manufacturing</span>
                                    <span className="text-[8px] bg-warning/10 text-warning px-1.5 py-0.5 rounded-full font-mono font-bold">Supplier</span>
                                  </h4>
                                  <p className="text-[10px] text-warmgray truncate">Fulfill purchase orders & custom cabins</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-warmgray shrink-0" />
                            </button>
                          </div>
                          
                          <div className="p-3 bg-[#F8F6F1] rounded-xl border border-dashed border-[#e6dfd4] text-[10px] text-warmgray leading-relaxed">
                            💡 <strong>Demo Protection:</strong> Demo Mode triggers a transient sandbox. Irreversible financial actions (releasing real payments or payouts) are completely disabled.
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Secure login sub-tabs */}
                          <div className="flex border-b border-[#e6dfd4]">
                            <button
                              type="button"
                              onClick={() => {
                                setLoginMethod('phone');
                                setErrorMsg('');
                              }}
                              className={`pb-2 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                                loginMethod === 'phone' ? 'border-[#B8873D] text-[#B8873D]' : 'border-transparent text-warmgray hover:text-charcoal'
                              }`}
                            >
                              🇮🇳 Mobile OTP
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setLoginMethod('email');
                                setErrorMsg('');
                              }}
                              className={`pb-2 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                                loginMethod === 'email' ? 'border-[#B8873D] text-[#B8873D]' : 'border-transparent text-warmgray hover:text-charcoal'
                              }`}
                            >
                              ✉️ Email & Password
                            </button>
                          </div>

                          {errorMsg && (
                            <div className="p-3 bg-error/10 border border-error/20 text-error text-xs rounded-xl font-medium leading-tight">
                              {errorMsg}
                            </div>
                          )}

                          {loginMethod === 'phone' ? (
                            /* PHONE OTP FLOW */
                            <div>
                              {/* Simulated Incoming SMS Push Alert */}
                              <AnimatePresence>
                                {simulateSmsToast && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    onClick={() => {
                                      setOtp6Digits(['1', '2', '3', '4', '5', '6']);
                                      triggerInstantVerification('123456');
                                    }}
                                    className="mb-4 p-3 bg-[#0E4B3D]/95 text-white rounded-2xl border border-[#B8873D]/30 shadow-lg cursor-pointer hover:bg-[#0E4B3D] transition-all flex items-start gap-3 text-left"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-[#B8873D] text-white flex items-center justify-center font-mono font-bold text-sm shrink-0">
                                      💬
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-antiquegold uppercase tracking-wider">SMS Gateway Retriever</span>
                                        <span className="text-[9px] text-white/50 font-mono">Just Now</span>
                                      </div>
                                      <p className="text-[11px] leading-tight text-white/90">
                                        Your AIEC mobile access OTP code is <strong className="text-antiquegold font-mono font-extrabold tracking-wider bg-white/10 px-1.5 py-0.5 rounded text-xs">123456</strong>. Valid for 2 mins.
                                      </p>
                                      <span className="text-[9px] text-[#B8873D] font-bold block animate-pulse">⚡ Tap to Auto-Read & Verify Instantly</span>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {!otpSent ? (
                                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                  <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">
                                      {appTranslations[appLanguage].enterMobile}
                                    </label>
                                    <div className="flex gap-2">
                                      {/* Interactive Country Selector */}
                                      <div className="relative shrink-0">
                                        <select
                                          value={countryCode}
                                          onChange={(e) => setCountryCode(e.target.value)}
                                          className="h-full px-3 py-2.5 bg-[#F8F6F1] border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-semibold text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold cursor-pointer"
                                        >
                                          <option value="+91">🇮🇳 +91</option>
                                          <option value="+1">🇺🇸 +1</option>
                                          <option value="+44">🇬🇧 +44</option>
                                          <option value="+971">🇦🇪 +971</option>
                                          <option value="+65">🇸🇬 +65</option>
                                        </select>
                                      </div>

                                      <div className="relative flex-1">
                                        <input
                                          type="tel"
                                          required
                                          placeholder="98765 43210"
                                          value={loginPhone}
                                          onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                                          className="w-full px-4 py-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-sm font-sans focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal font-semibold"
                                        />
                                      </div>
                                    </div>

                                    {/* Country Confirmation / Intl routing */}
                                    {countryCode !== '+91' && (
                                      <p className="text-[10px] font-medium text-[#B8873D] flex items-center gap-1">
                                        🌐 <span>International Route: OTP will route with country code {countryCode}. Standard carrier rates apply.</span>
                                      </p>
                                    )}

                                    <div className="flex justify-between items-start gap-2">
                                      <p className="text-[10px] text-warmgray flex-1">
                                        {appTranslations[appLanguage].enterNumHelp}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => setShowForgotReset(true)}
                                        className="text-[10px] text-antiquegold hover:text-royalemerald font-bold transition-all cursor-pointer hover:underline text-right shrink-0"
                                      >
                                        {appTranslations[appLanguage].accRecovery}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="remember-me"
                                      checked={rememberMe}
                                      onChange={(e) => setRememberMe(e.target.checked)}
                                      className="w-4 h-4 accent-antiquegold rounded cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="text-xs text-warmgray select-none cursor-pointer">
                                      {appTranslations[appLanguage].rememberMe}
                                    </label>
                                  </div>

                                  <Button variant="emerald" type="submit" fullWidth className="py-3 bg-[#0E4B3D] text-white">
                                    <span>{appTranslations[appLanguage].otpButton}</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </Button>
                                </form>
                              ) : (
                                <form onSubmit={handleOtpVerify} className="space-y-4 relative">
                                  {/* Dynamic Verification Overlays */}
                                  {verificationStatus === 'verifying' && (
                                    <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center text-center space-y-3 rounded-2xl">
                                      <div className="w-10 h-10 border-4 border-[#B8873D]/20 border-t-[#B8873D] rounded-full animate-spin" />
                                      <div className="space-y-1">
                                        <p className="text-xs font-bold text-charcoal">Elevating connection safely...</p>
                                        <p className="text-[10px] text-warmgray font-mono">Handshaking AIEC OTP Gateway</p>
                                      </div>
                                    </div>
                                  )}

                                  {verificationStatus === 'success' && (
                                    <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center text-center space-y-2 rounded-2xl">
                                      <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center"
                                      >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </motion.div>
                                      <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-success">🔒 Verification Successful!</p>
                                        <p className="text-[9px] text-warmgray font-mono font-bold uppercase tracking-wider">Connecting Partner Session...</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Header description with Change Number link */}
                                  <div className="p-3 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.12)] space-y-1 text-center">
                                    <p className="text-xs font-semibold text-charcoal">
                                      Verification Code Sent to {countryCode} {loginPhone}
                                    </p>
                                    <p className="text-[10px] text-warmgray">
                                      Not your number?{' '}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOtpSent(false);
                                          setErrorMsg('');
                                          setIsExpired(false);
                                        }}
                                        className="text-[#B8873D] hover:text-[#0E4B3D] underline font-bold cursor-pointer transition-colors"
                                      >
                                        Change number
                                      </button>
                                    </p>
                                  </div>

                                  {/* Expiration warning block */}
                                  {isExpired ? (
                                    <div className="p-3 bg-error/10 border border-error/20 text-error rounded-xl space-y-1 text-left">
                                      <p className="text-xs font-bold">⚠️ Security Token Expired</p>
                                      <p className="text-[10px] leading-tight text-error/80">
                                        The verification code has expired due to session inactivity. Please request a new code.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="text-center">
                                      <p className="text-[10px] text-warmgray">
                                        Use secure bypass PIN <strong>123456</strong> or <strong>1234</strong>
                                      </p>
                                    </div>
                                  )}

                                  <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-center text-charcoal uppercase tracking-wider">
                                      6-Digit Verification OTP
                                    </label>
                                    
                                    {/* 6 Auto-Advancing digit inputs */}
                                    <div className="flex justify-between gap-2 max-w-xs mx-auto">
                                      {otp6Digits.map((digit, idx) => (
                                        <input
                                          key={idx}
                                          id={`otp-input-${idx}`}
                                          type="text"
                                          inputMode="numeric"
                                          pattern="[0-9]*"
                                          maxLength={1}
                                          value={digit}
                                          disabled={cooldownTime > 0 || isExpired || verificationStatus === 'verifying'}
                                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                          className={`w-11 h-11 text-center bg-alabaster border-2 rounded-xl text-lg font-mono font-bold transition-all focus:outline-none focus:ring-1 focus:ring-antiquegold ${
                                            isExpired
                                              ? 'border-error/20 text-error/50 bg-error/5'
                                              : 'border-[rgba(184,135,61,0.15)] text-charcoal focus:border-antiquegold focus:ring-antiquegold'
                                          }`}
                                        />
                                      ))}
                                    </div>

                                    {cooldownTime > 0 && (
                                      <div className="text-center text-xs text-[#B23B3B] font-bold font-mono animate-pulse">
                                        ⏱️ Cooldown: {cooldownTime} seconds remaining
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      variant="secondary"
                                      type="button"
                                      className="flex-1 text-xs"
                                      onClick={() => {
                                        setOtpSent(false);
                                        setErrorMsg('');
                                        setIsExpired(false);
                                      }}
                                    >
                                      Back
                                    </Button>
                                    <Button
                                      variant="primary"
                                      type="submit"
                                      className="flex-1 text-xs"
                                      disabled={cooldownTime > 0 || isExpired || verificationStatus === 'verifying'}
                                    >
                                      Verify OTP
                                    </Button>
                                  </div>

                                  {/* Resend Action block */}
                                  <div className="text-center pt-2 border-t border-[#e6dfd4]">
                                    {resendCountdown > 0 ? (
                                      <p className="text-[11px] text-warmgray font-medium">
                                        Resend code in <span className="font-mono font-bold text-[#B8873D]">{resendCountdown}s</span>
                                      </p>
                                    ) : (
                                      <div className="space-y-1">
                                        <button
                                          type="button"
                                          disabled={resendCount >= 5}
                                          onClick={handleResendOtp}
                                          className={`text-xs font-bold underline transition-colors cursor-pointer ${
                                            resendCount >= 5
                                              ? 'text-warmgray/50 cursor-not-allowed no-underline'
                                              : 'text-[#B8873D] hover:text-[#0E4B3D]'
                                          }`}
                                        >
                                          {resendCount >= 5 ? 'Resend limit reached (5/5)' : 'Resend Verification SMS'}
                                        </button>
                                        <p className="text-[9px] text-warmgray font-mono">
                                          Resend attempts: {resendCount}/5 (capped per 10 mins)
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Debug helper: Simulate app background / expiry */}
                                  <div className="bg-[#F8F6F1] p-2.5 rounded-xl border border-dashed border-[#e6dfd4] flex items-center justify-between text-left">
                                    <span className="text-[9px] text-warmgray font-mono font-bold uppercase">🧪 Sandbox Tools:</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsExpired(true);
                                        setOtp6Digits(Array(6).fill(''));
                                      }}
                                      className="text-[9px] bg-error/10 hover:bg-error/20 text-error font-bold px-2 py-1 rounded transition-all cursor-pointer"
                                    >
                                      Simulate Expiration
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          ) : (
                            /* EMAIL PASSWORD FALLBACK FLOW */
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Authorized Email Address</label>
                                <div className="relative">
                                  <span className="absolute left-4 top-2.5 text-warmgray text-sm">✉️</span>
                                  <input
                                    type="email"
                                    required
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="admin@aiec.com"
                                    className="w-full pl-10 pr-4 py-2 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-sm focus:outline-none text-charcoal font-semibold"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">
                                  {appTranslations[appLanguage].enterPassword}
                                </label>
                                <div className="relative">
                                  <span className="absolute left-4 top-2.5 text-warmgray text-sm">🔒</span>
                                  <input
                                    type="password"
                                    required
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-sm focus:outline-none tracking-widest text-charcoal"
                                  />
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-warmgray">
                                  <span>{appTranslations[appLanguage].defaultFallback} <strong>password123</strong></span>
                                  <button
                                    type="button"
                                    onClick={() => setShowForgotReset(true)}
                                    className="text-antiquegold hover:text-royalemerald font-bold transition-all cursor-pointer hover:underline"
                                  >
                                    {appTranslations[appLanguage].forgotPass}
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="remember-me-email"
                                  checked={rememberMe}
                                  onChange={(e) => setRememberMe(e.target.checked)}
                                  className="w-4 h-4 accent-antiquegold rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me-email" className="text-xs text-warmgray select-none cursor-pointer">
                                  {appTranslations[appLanguage].rememberMe}
                                </label>
                              </div>

                              <Button variant="primary" type="submit" fullWidth className="py-3">
                                <span>{appTranslations[appLanguage].passwordButton}</span>
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </form>
                          )}

                          {/* Social login Google Sign-In divider */}
                          <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-[#e6dfd4]"></div>
                            <span className="flex-shrink mx-4 text-warmgray font-mono text-[9px] uppercase tracking-widest">or sign in with</span>
                            <div className="flex-grow border-t border-[#e6dfd4]"></div>
                          </div>

                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="w-full py-3 bg-white hover:bg-alabaster border border-[#e6dfd4] rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer font-bold text-xs text-charcoal"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Continue with Google</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-center font-mono text-[9px] text-warmgray border-t border-[#e6dfd4] pt-4">
                      ALL INDIA ELEVATORS COMPANY SECURITY ARCHITECTURE • v1.0.1
                    </div>
                  </div>

                </div>
              )}
            </div>
            ) : currentUser.role === ('pending_selection' as any) && !currentUser.isDemo ? (
              /* =========================================================
                 ROLE SELECTION & ONBOARDING WIZARD SCREEN
                 ========================================================= */
              <div className="flex-1 flex items-center justify-center p-4 bg-[#F8F6F1]">
                <RoleSelectionWizard 
                  user={currentUser}
                  onComplete={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    window.dispatchEvent(new Event('aiec_db_update'));
                  }}
                  onSignOut={handleLogout}
                />
              </div>
            ) : (currentUser.role === 'surveyor' || currentUser.role === 'technician' || currentUser.role === 'customer') && !currentUser.primer_shown_flag && !currentUser.isDemo ? (
              /* =========================================================
                 PERMISSIONS PRIMER SCREEN — MOBILE PRIVACY CONJECTURES
                 ========================================================= */
              <div className="flex-1 flex items-center justify-center p-4 bg-[#F8F6F1]">
                <PermissionsPrimer 
                  user={currentUser}
                  onComplete={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    window.dispatchEvent(new Event('aiec_db_update'));
                  }}
                  onSkip={() => {
                    const updatedUser: User = {
                      ...currentUser,
                      primer_shown_flag: true,
                      primer_shown_timestamp: new Date().toISOString()
                    };
                    DbManager.updateUser(updatedUser);
                    setCurrentUser(updatedUser);
                    window.dispatchEvent(new Event('aiec_db_update'));
                  }}
                />
              </div>
            ) : currentUser.role === 'surveyor' && !currentUser.onboardingCompleted && !currentUser.isDemo ? (
              /* =========================================================
                 SURVEYOR ONBOARDING — PROFILE & DOCUMENT UPLOAD SCREEN
                 ========================================================= */
              <div className="flex-1 flex items-center justify-center p-4 bg-[#F8F6F1]">
                <SurveyorOnboarding 
                  user={currentUser}
                  onComplete={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    window.dispatchEvent(new Event('aiec_db_update'));
                  }}
                  onSignOut={handleLogout}
                />
              </div>
            ) : currentUser.role === 'technician' && !currentUser.onboardingCompleted && !currentUser.isDemo ? (
              /* =========================================================
                 TECHNICIAN ONBOARDING — PROFILE & SKILL CERTIFICATION SCREEN
                 ========================================================= */
              <div className="flex-1 flex items-center justify-center p-4 bg-[#F8F6F1]">
                <TechnicianOnboarding 
                  user={currentUser}
                  onComplete={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    window.dispatchEvent(new Event('aiec_db_update'));
                  }}
                  onSignOut={handleLogout}
                />
              </div>
            ) : currentUser.role === 'supplier' && !currentUser.onboardingCompleted && !currentUser.isDemo ? (
              /* =========================================================
                 SUPPLIER ONBOARDING — COMPANY KYC SCREEN
                 ========================================================= */
              <div className="flex-1 flex items-center justify-center p-4 bg-[#F8F6F1]">
                <SupplierOnboarding 
                  user={currentUser}
                  onComplete={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    window.dispatchEvent(new Event('aiec_db_update'));
                  }}
                  onSignOut={handleLogout}
                />
              </div>
            ) : currentUser.role === 'customer' && !currentUser.onboardingCompleted && !currentUser.isDemo ? (
              /* =========================================================
                 CUSTOMER QUICK SIGNUP (lead-conversion auto-created)
                 ========================================================= */
              <div className="flex-1 flex items-center justify-center p-4 bg-[#F8F6F1]">
                <CustomerQuickSignup 
                  user={currentUser}
                  onComplete={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    window.dispatchEvent(new Event('aiec_db_update'));
                  }}
                  onSignOut={handleLogout}
                />
              </div>
            ) : currentUser.status === 'pending' && !currentUser.isDemo ? (
              /* =========================================================
                 PENDING APPROVAL HOLDING SCREEN
                 ========================================================= */
              <div className="flex-1 flex items-center justify-center p-4 bg-[#F8F6F1]">
                <div className="w-full max-w-lg bg-white rounded-3xl border border-[rgba(184,135,61,0.2)] p-6 md:p-8 space-y-6 shadow-diffuse text-center relative overflow-hidden">
                  
                  {/* Decorative Ascension Line behind text on the left */}
                  <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gradient-to-b from-transparent via-[#B8873D]/30 to-transparent flex flex-col justify-between items-center py-4">
                    <div className="w-2 h-2 rounded-full bg-[#B8873D]" />
                    <motion.div 
                      animate={{ y: [0, 100, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="w-2.5 h-2.5 rounded-full bg-[#B8873D] ring-4 ring-[#B8873D]/30 shadow-md"
                    />
                    <div className="w-2 h-2 rounded-full bg-[#B8873D]" />
                  </div>

                  <div className="pl-6 space-y-5">
                    <div className="w-14 h-14 bg-antiquegold/10 text-antiquegold rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                      <Shield className="w-7 h-7 stroke-[1.5] animate-pulse" />
                    </div>

                    <div className="space-y-1 text-center">
                      <span className="text-[9px] font-mono font-bold text-antiquegold uppercase tracking-widest block">HQ SECURE LEDGER PROVISIONING</span>
                      <h3 className="font-serif text-xl font-bold text-charcoal">Onboarding Review Initiated</h3>
                      <p className="text-xs text-warmgray">Your partner profile is logged in and awaiting security credentials.</p>
                    </div>

                    {/* Step Tracker with Ascension Line motif */}
                    <div className="bg-[#F8F6F1] p-4 rounded-2xl border border-[rgba(184,135,61,0.1)] text-left space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#0E4B3D] text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                        <div className="text-xs">
                          <p className="font-bold text-charcoal">Mobile Authentication Verified</p>
                          <p className="text-[10px] text-warmgray">{currentUser.phone} Device Signature Confirmed</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#0E4B3D] text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                        <div className="text-xs">
                          <p className="font-bold text-charcoal">Requested Platform Role Submitted</p>
                          <p className="text-[10px] text-[#B8873D] font-bold uppercase tracking-wider">Role Option: {currentUser.role}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-antiquegold/20 border border-antiquegold text-antiquegold flex items-center justify-center text-[10px] font-bold animate-pulse mt-0.5">⏱</div>
                        <div className="text-xs">
                          <p className="font-bold text-charcoal">Director Security Clearance & Territory Lock</p>
                          <p className="text-[10px] text-warmgray">Mr. Prashant Vasant Wable is reviewing safety telemetry & mapping coordinates.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 font-mono text-[10px] text-warmgray text-left bg-alabaster/40 p-3 rounded-xl border border-dashed border-[#e6dfd4]">
                      <div className="flex justify-between">
                        <span>REGISTERED NAME</span>
                        <span className="text-charcoal font-bold">{currentUser.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>OFFICE ADDRESS</span>
                        <span className="text-charcoal">Kothrud Industrial Area, Pune</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HQ TELEMETRY STATUS</span>
                        <span className="text-success font-semibold">🔒 ENCRYPTED GATES LINK</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const resetUser: User = {
                            ...currentUser,
                            role: 'pending_selection' as any,
                            status: 'pending'
                          };
                          DbManager.updateUser(resetUser);
                          setCurrentUser(resetUser);
                        }}
                        className="flex-1 py-2.5 bg-alabaster hover:bg-[#edeae2] border border-[#e6dfd4] rounded-xl text-xs font-bold text-charcoal cursor-pointer transition-all"
                      >
                        Change Requested Role
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex-1 py-2.5 bg-error/10 hover:bg-error/15 text-error text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Sign Out / Exit
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* =========================================================
                 AUTHENTICATED ROLE-AWARE SHELL
                 ========================================================= */
              <div className="flex-1 flex flex-col md:flex-row relative">
                
                {/* 1. DESKTOP SIDEBAR (Reflow of navigation matching design system guidelines) */}
                <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-white border-r border-[rgba(184,135,61,0.12)] p-6 flex-col justify-between shrink-0 shadow-diffuse">
                  <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                    {/* Header Brand */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-royalemerald text-white flex items-center justify-center">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-extrabold text-charcoal">AIEC Platform</h3>
                        <p className="text-[10px] text-antiquegold uppercase font-extrabold tracking-wider">Aggregator Hub</p>
                      </div>
                    </div>

                    {/* Global Language Selector */}
                    <div className="bg-[#F8F6F1] p-2.5 rounded-xl border border-[rgba(184,135,61,0.12)] space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[8px] font-mono font-extrabold text-[#B8873D]">
                        <Globe className="w-3.5 h-3.5" />
                        <span>{appTranslations[appLanguage].langLabel}</span>
                      </div>
                      <div className="flex gap-1">
                        {(['en', 'mr', 'hi'] as const).map((lng) => (
                          <button
                            key={lng}
                            type="button"
                            onClick={() => setAppLanguage(lng)}
                            className={`flex-1 py-1 text-[9px] font-bold rounded-lg cursor-pointer transition-all ${
                              appLanguage === lng
                                ? 'bg-[#B8873D] text-white font-extrabold shadow-xs'
                                : 'bg-white text-warmgray hover:text-charcoal'
                            }`}
                          >
                            {lng === 'en' ? 'EN' : lng === 'mr' ? 'मराठी' : 'हिंदी'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-1">
                      {getTabsByRole(currentUser.role).map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#0E4B3D]/10 text-royalemerald'
                                : 'text-warmgray hover:text-charcoal hover:bg-alabaster'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-royalemerald' : 'text-warmgray'}`} />
                            <span>{
                              tab.id === 'Home' ? (appLanguage === 'hi' ? 'मुख्य डैशबोर्ड' : appLanguage === 'mr' ? 'मुख्य डॅशबोर्ड' : 'Overview') :
                              tab.id === 'LeadAssignment' ? (appLanguage === 'hi' ? 'लीड असाइनमेंट' : appLanguage === 'mr' ? 'लीड वाटप' : 'Lead Assignment') :
                              tab.id === 'LeadMerge' ? (appLanguage === 'hi' ? 'विलय स्टूडियो ⛓️' : appLanguage === 'mr' ? 'विलीनीकरण स्टुडिओ ⛓️' : 'Merge Studio ⛓️') :
                              tab.id === 'LeadScoring' ? (appLanguage === 'hi' ? 'लीड स्कोरिंग 📈' : appLanguage === 'mr' ? 'लीड स्कोअरिंग 📈' : 'Lead Scoring 📈') :
                              tab.id === 'LeadFollowUp' ? (appLanguage === 'hi' ? 'फॉलो-अप शेड्यूल 📅' : appLanguage === 'mr' ? 'फॉलो-अप नियोजक 📅' : 'Follow-Ups 📅') :
                              tab.id === 'LeadSource' ? (appLanguage === 'hi' ? 'स्रोत व अभियान 📊' : appLanguage === 'mr' ? 'स्त्रोत व मोहीम 📊' : 'Source & Campaigns 📊') :
                              tab.id === 'LeadLost' ? (appLanguage === 'hi' ? 'अयोग्य घोषित 🚨' : appLanguage === 'mr' ? 'अयोग्य नियुक्त 🚨' : 'Disqualify Lead 🚨') :
                              tab.id === 'LeadMigrate' ? (appLanguage === 'hi' ? 'थोक आयात/निर्यात 📊' : appLanguage === 'mr' ? 'थोक आयात/निर्यात 📊' : 'Bulk Import/Export 📊') :
                              tab.id === 'CommTemplates' ? (appLanguage === 'hi' ? 'संचार टेम्प्लेट 💬' : appLanguage === 'mr' ? 'संप्रेषण टेम्पलेट्स 💬' : 'Comm Templates 💬') :
                              tab.id === 'CommSequences' ? (appLanguage === 'hi' ? 'संचार अनुक्रम ⚙️' : appLanguage === 'mr' ? 'संप्रेषण अनुक्रम ⚙️' : 'Comm Sequences ⚙️') :
                              tab.id === 'CommWhatsApp' ? (appLanguage === 'hi' ? 'व्हाट्सएप कंसोल 💬' : appLanguage === 'mr' ? 'व्हॉट्सॲप कन्सोल 💬' : 'WhatsApp Console 💬') :
                              tab.id === 'CommCalls' ? (appLanguage === 'hi' ? 'ऑटो-डायलिर व लॉग्स 📞' : appLanguage === 'mr' ? 'ऑटो-डायल व लॉग्स 📞' : 'Auto-Dialer & Logs 📞') :
                              tab.id === 'CommSMS' ? (appLanguage === 'hi' ? 'एसएमएस प्रसारण ✉️' : appLanguage === 'mr' ? 'एसएमएस ब्रॉडकास्ट ✉️' : 'SMS Broadcast ✉️') :
                              tab.id === 'CommBot' ? (appLanguage === 'hi' ? 'एआई बोट सेटिंग्स 🤖' : appLanguage === 'mr' ? 'एआय बोट सेटिंग्स 🤖' : 'AI Bot Config 🤖') :
                              tab.id === 'CommInbox' ? (appLanguage === 'hi' ? 'उत्तर इनबॉक्स 📥' : appLanguage === 'mr' ? 'उत्तर इनबॉक्स 📥' : 'Reply Inbox 📥') :
                              tab.id === 'CommCompliance' ? (appLanguage === 'hi' ? 'अनुपालन और डीएनडी 🛡️' : appLanguage === 'mr' ? 'अनुपालन आणि डीएनडी 🛡️' : 'Compliance & DND 🛡️') :
                              tab.id === 'QuotePreview' ? (appLanguage === 'hi' ? 'कोट पूर्वावलोकन 👁️' : appLanguage === 'mr' ? 'कोट पूर्वावलोकन 👁️' : 'Quote Preview 👁️') :
                              tab.id === 'QuoteCompare' ? (appLanguage === 'hi' ? 'पैकेज तुलना ⚖️' : appLanguage === 'mr' ? 'पॅकेज तुलना ⚖️' : 'Compare Packages ⚖️') :
                              tab.id === 'QuoteHistory' ? (appLanguage === 'hi' ? 'संस्करण इतिहास ⏳' : appLanguage === 'mr' ? 'आवृत्ती इतिहास ⏳' : 'Quote History ⏳') :
                              tab.id === 'QuoteDiscount' ? (appLanguage === 'hi' ? 'छूट और अनुमोदन 🏷️' : appLanguage === 'mr' ? 'सवलत आणि मंजुरी 🏷️' : 'Discount Approval 🏷️') :
                              tab.id === 'QuoteDelivery' ? (appLanguage === 'hi' ? 'ई-वितरण केंद्र 📨' : appLanguage === 'mr' ? 'ई-वितरण केंद्र 📨' : 'E-Delivery Hub 📨') :
                              tab.id === 'QuoteAnalytics' ? (appLanguage === 'hi' ? 'कोटेशन विश्लेषण 📈' : appLanguage === 'mr' ? 'कोटेशन विश्लेषण 📈' : 'Quote Win/Loss 📈') :
                              tab.id === 'QuotePricingRules' ? (appLanguage === 'hi' ? 'मूल्य और मार्जिन ⚙️' : appLanguage === 'mr' ? 'किंमत आणि नफा ⚙️' : 'Pricing & Margin ⚙️') :
                              tab.id === 'QuoteNegotiationBot' ? (appLanguage === 'hi' ? 'ऑटो-नेगोशिएशन बोट 🤖' : appLanguage === 'mr' ? 'ऑटो-नेगोशिएशन बॉट 🤖' : 'Negotiation Bot 🤖') :
                              tab.id === 'QuoteNegotiationThread' ? (appLanguage === 'hi' ? 'लाइव बातचीत 💬' : appLanguage === 'mr' ? 'थेट संभाषण 💬' : 'Live Negotiation 💬') :
                              tab.id === 'QuoteCounterOfferApproval' ? (appLanguage === 'hi' ? 'काउंटर स्वीकृतियां ⚖️' : appLanguage === 'mr' ? 'काउंटर मंजुरी ⚖️' : 'Counter Approvals ⚖️') :
                              tab.id === 'QuoteDealTermsFinalization' ? (appLanguage === 'hi' ? 'सौदा फाइनल 🤝' : appLanguage === 'mr' ? 'करार निश्चिती 🤝' : 'Deal Finalization 🤝') :
                              tab.id === 'QuoteDigitalContract' ? (appLanguage === 'hi' ? 'अनुबंध जनरेटर 📄' : appLanguage === 'mr' ? 'करारनामा निर्माता 📄' : 'Contract Generator 📄') :
                              tab.id === 'QuoteESignature' ? (appLanguage === 'hi' ? 'ई-हस्ताक्षर कैप्चर ✍️' : appLanguage === 'mr' ? 'ई-स्वाक्षरी रेकॉर्ड ✍️' : 'E-Sign Capture ✍️') :
                              tab.id === 'QuoteDealClosure' ? (appLanguage === 'hi' ? 'सौदा बंद पुष्टिकरण 🏆' : appLanguage === 'mr' ? 'सौदा समाप्ती घोषणा 🏆' : 'Deal Closure 🏆') :
                              tab.id === 'CommRules' ? (appLanguage === 'hi' ? 'स्टेज ट्रिगर नियम ⚙️' : appLanguage === 'mr' ? 'स्टेज ट्रिगर नियम ⚙️' : 'Stage Trigger Rules ⚙️') :
                              tab.id === 'CommAnalytics' ? (appLanguage === 'hi' ? 'संचार विश्लेषण 📊' : appLanguage === 'mr' ? 'संप्रेषण विश्लेषण 📊' : 'Comm Analytics 📊') :
                              tab.id === 'QuoteSpecs' ? (appLanguage === 'hi' ? 'कोटेशन विनिर्देश ⚙️' : appLanguage === 'mr' ? 'कोटेशन तपशील ⚙️' : 'Quotation Specs ⚙️') :
                              tab.id === 'QuotePricing' ? (appLanguage === 'hi' ? 'लागत और लाभ 💰' : appLanguage === 'mr' ? 'खर्च आणि नफा 💰' : 'Cost & Profit 💰') :
                           tab.id === 'QuoteBranding' ? (appLanguage === 'hi' ? 'कोट ब्रांडिंग 🎨' : appLanguage === 'mr' ? 'कोट ब्रँडिंग 🎨' : 'Branding 🎨') :
                           tab.id === 'QuoteBranding' ? (appLanguage === 'hi' ? 'कोट ब्रांडिंग 🎨' : appLanguage === 'mr' ? 'कोट ब्रँडिंग 🎨' : 'Branding 🎨') :
                              tab.id === 'QuoteBranding' ? (appLanguage === 'hi' ? 'कोट ब्रांडिंग 🎨' : appLanguage === 'mr' ? 'कोट ब्रँडिंग 🎨' : 'Quote Branding 🎨') :
                              tab.id === 'LiveMap' ? (appLanguage === 'hi' ? 'लाइव संचालन' : appLanguage === 'mr' ? 'थेट ऑपरेशन्स' : 'Live Operations') :
                              tab.id === 'RouteOpt' ? (appLanguage === 'hi' ? 'रूट मैच 🗺️' : appLanguage === 'mr' ? 'मार्ग जुळणी 🗺️' : 'Route Match 🗺️') :
                              tab.id === 'SOSDesk' ? (appLanguage === 'hi' ? 'आपातकालीन डेस्क 🚨' : appLanguage === 'mr' ? 'तात्काळ डेस्क 🚨' : 'SOS Desk 🚨') :
                              tab.id === 'LiveFeed' ? (appLanguage === 'hi' ? 'लाइव फीड' : appLanguage === 'mr' ? 'थेट फीड' : 'Live Feed') :
                              tab.id === 'SurveyorAudit' ? (appLanguage === 'hi' ? 'सर्वेक्षक ऑडिट' : appLanguage === 'mr' ? 'सर्वेक्षक ऑडिट' : 'Surveyor Audit') :
                              tab.id === 'TechnicianAudit' ? (appLanguage === 'hi' ? 'तकनीशियन ऑडिट' : appLanguage === 'mr' ? 'तंत्रज्ञ ऑडिट' : 'Technician Audit') :
                              tab.id === 'Territories' ? (appLanguage === 'hi' ? 'क्षेत्र नियंत्रण' : appLanguage === 'mr' ? 'प्रदेश नियंत्रण' : 'Territory Control') :
                              tab.id === 'Heatmap' ? (appLanguage === 'hi' ? 'लीड हीटमैप' : appLanguage === 'mr' ? 'लीड हीटमॅप' : 'Lead Heatmap') :
                              tab.id === 'SiteVerify' ? (appLanguage === 'hi' ? 'भू-सत्यापन' : appLanguage === 'mr' ? 'भू-पडताळणी' : 'Geo-Verification') :
                              tab.id === 'Funnel' ? (appLanguage === 'hi' ? 'बिक्री फ़नल' : appLanguage === 'mr' ? 'विक्री फनेल' : 'Sales Funnel') :
                              tab.id === 'RevenueProfit' ? (appLanguage === 'hi' ? 'राजस्व और लाभ' : appLanguage === 'mr' ? 'महसूल आणि नफा' : 'Revenue & Profit') :
                              tab.id === 'FinancialCashFlow' ? (appLanguage === 'hi' ? 'नकदी प्रवाह व येन 💵' : appLanguage === 'mr' ? 'रोख प्रवाह आणि थकीत 💵' : 'Cash Flow & Aging 💵') :
                              tab.id === 'AlertsExceptions' ? (appLanguage === 'hi' ? 'अलर्ट और अपवाद ⚠️' : appLanguage === 'mr' ? 'अलर्ट आणि अपवाद ⚠️' : 'Exceptions & Alerts ⚠️') :
                              tab.id === 'CustomReport' ? (appLanguage === 'hi' ? 'रिपोर्ट निर्माता 📊' : appLanguage === 'mr' ? 'अहवाल निर्माता 📊' : 'Custom Report Builder 📊') :
                              tab.id === 'Leaderboard' ? (appLanguage === 'hi' ? 'प्रदर्शन सूचकांक 🏆' : appLanguage === 'mr' ? 'कामगिरी रँकिंग 🏆' : 'Worker Leaderboard 🏆') :
                              tab.id === 'Conversion' ? (appLanguage === 'hi' ? 'क्षेत्र रूपांतरण 📈' : appLanguage === 'mr' ? 'प्रदेश रूपांतरण 📈' : 'Region Conversions 📈') :
                              tab.id === 'SupplierScorecard' ? (appLanguage === 'hi' ? 'आपूर्तिकर्ता स्कोरकार्ड 🏆' : appLanguage === 'mr' ? 'विक्रेता कामगिरी 🏆' : 'Supplier SLA 🏆') :
                              tab.id === 'AutomationHealth' ? (appLanguage === 'hi' ? 'स्वचालन नियंत्रण ⚙️' : appLanguage === 'mr' ? 'स्वयंचलित प्रणाली ⚙️' : 'Automation Health ⚙️') :
                              tab.id === 'Partners' ? (appLanguage === 'hi' ? 'भागीदार निर्देशिका' : appLanguage === 'mr' ? 'भागीदार निर्देशिका' : 'Directory') :
                              tab.id === 'Settings' ? (appLanguage === 'hi' ? 'नियंत्रण इकाई' : appLanguage === 'mr' ? 'नियंत्रण युनिट' : 'Control Unit') :
                              tab.label
                            }</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Footer profile & logout */}
                  <div className="space-y-4 pt-4 border-t border-dashed border-[#e6dfd4]">
                    <div className="flex items-center gap-3">
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full border border-antiquegold object-cover" />
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-charcoal">{currentUser.name}</h4>
                        <p className="text-[9px] uppercase font-bold text-warmgray">{currentUser.role}</p>
                      </div>
                    </div>
                    <Button variant="danger" fullWidth className="py-2.5 text-xs font-bold" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </Button>
                  </div>
                </aside>

                {/* 2. MOBILE HEADER & NAVIGATION SHELL */}
                <header className="md:hidden bg-white border-b border-[rgba(184,135,61,0.1)] p-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-royalemerald text-white flex items-center justify-center">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-charcoal">AIEC Mobile</h3>
                      <p className="text-[8px] uppercase tracking-wider text-warmgray font-bold">{currentUser.role} mode</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Small mobile switcher */}
                    <div className="flex bg-[#F8F6F1] p-0.5 rounded-lg border border-[rgba(184,135,61,0.1)]">
                      {(['en', 'mr', 'hi'] as const).map((lng) => (
                        <button
                          key={lng}
                          type="button"
                          onClick={() => setAppLanguage(lng)}
                          className={`px-2 py-1 text-[9px] font-bold rounded-md cursor-pointer transition-all ${
                            appLanguage === lng
                              ? 'bg-[#B8873D] text-white font-extrabold shadow-xs'
                              : 'text-warmgray hover:text-charcoal'
                          }`}
                        >
                          {lng === 'en' ? 'EN' : lng === 'mr' ? 'मराठी' : 'हिंदी'}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={handleLogout}
                      className="p-2 rounded-lg bg-error/10 text-error hover:bg-error/15 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </header>

                {/* 3. SCROLLABLE SCREEN STAGE CONTENT AREA */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
                  {hasValidGoogleMapsKey ? (
                    <APIProvider apiKey={googleMapsApiKey} version="weekly">
                      {renderTabContent()}
                    </APIProvider>
                  ) : (
                    renderTabContent()
                  )}
                </main>

                {/* 4. MOBILE BOTTOM TAB NAVIGATION */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[rgba(184,135,61,0.12)] py-2 flex justify-around items-center z-40 shadow-lg">
                  {getTabsByRole(currentUser.role).map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                          isSelected ? 'text-royalemerald scale-110' : 'text-warmgray'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[9px] font-bold">{
                          tab.id === 'Home' ? (appLanguage === 'hi' ? 'मुख्य डैशबोर्ड' : appLanguage === 'mr' ? 'मुख्य डॅशबोर्ड' : 'Overview') :
                          tab.id === 'LeadFollowUp' ? (appLanguage === 'hi' ? 'फॉलो-अप 📅' : appLanguage === 'mr' ? 'फॉलो-अप 📅' : 'Follow-Ups 📅') :
                          tab.id === 'LeadSource' ? (appLanguage === 'hi' ? 'स्रोत व अभियान' : appLanguage === 'mr' ? 'स्त्रोत व मोहीम' : 'Attribution 📊') :
                          tab.id === 'LeadLost' ? (appLanguage === 'hi' ? 'अयोग्य 🚨' : appLanguage === 'mr' ? 'अयोग्य 🚨' : 'Disqualify 🚨') :
                          tab.id === 'LeadMigrate' ? (appLanguage === 'hi' ? 'थोक माइग्रेट 📊' : appLanguage === 'mr' ? 'थोक स्थलांतर 📊' : 'Migration 📊') :
                          tab.id === 'CommTemplates' ? (appLanguage === 'hi' ? 'टेम्प्लेट 💬' : appLanguage === 'mr' ? 'टेम्पलेट्स 💬' : 'Templates 💬') :
                          tab.id === 'CommSequences' ? (appLanguage === 'hi' ? 'अनुक्रम ⚙️' : appLanguage === 'mr' ? 'अनुक्रम ⚙️' : 'Sequences ⚙️') :
                          tab.id === 'CommWhatsApp' ? (appLanguage === 'hi' ? 'व्हाट्सएप 💬' : appLanguage === 'mr' ? 'व्हॉट्सॲप 💬' : 'WhatsApp 💬') :
                          tab.id === 'CommCalls' ? (appLanguage === 'hi' ? 'कॉल लॉग्स 📞' : appLanguage === 'mr' ? 'कॉल लॉग्स 📞' : 'Call Logs 📞') :
                          tab.id === 'CommSMS' ? (appLanguage === 'hi' ? 'एसएमएस ✉️' : appLanguage === 'mr' ? 'एसएमएस ✉️' : 'SMS ✉️') :
                          tab.id === 'CommBot' ? (appLanguage === 'hi' ? 'एआई बोट 🤖' : appLanguage === 'mr' ? 'एआय बोट 🤖' : 'AI Bot 🤖') :
                          tab.id === 'CommInbox' ? (appLanguage === 'hi' ? 'इनबॉक्स 📥' : appLanguage === 'mr' ? 'इनबॉक्स 📥' : 'Inbox 📥') :
                          tab.id === 'CommCompliance' ? (appLanguage === 'hi' ? 'अनुपालन 🛡️' : appLanguage === 'mr' ? 'अनुपालन 🛡️' : 'Compliance 🛡️') :
                          tab.id === 'CommRules' ? (appLanguage === 'hi' ? 'ट्रिगर नियम ⚙️' : appLanguage === 'mr' ? 'ट्रिगर नियम ⚙️' : 'Rules ⚙️') :
                          tab.id === 'CommAnalytics' ? (appLanguage === 'hi' ? 'विश्लेषण 📊' : appLanguage === 'mr' ? 'विश्लेषण 📊' : 'Analytics 📊') :
                          tab.id === 'QuoteSpecs' ? (appLanguage === 'hi' ? 'विनिर्देश ⚙️' : appLanguage === 'mr' ? 'तपशील ⚙️' : 'Specs ⚙️') :
                          tab.id === 'QuotePricing' ? (appLanguage === 'hi' ? 'लागत और लाभ 💰' : appLanguage === 'mr' ? 'खर्च आणि नफा 💰' : 'Cost & Profit 💰') :
                          tab.id === 'QuotePreview' ? (appLanguage === 'hi' ? 'कोट पूर्वावलोकन 👁️' : appLanguage === 'mr' ? 'कोट पूर्वावलोकन 👁️' : 'Quote Preview 👁️') :
                          tab.id === 'QuoteCompare' ? (appLanguage === 'hi' ? 'तुलना ⚖️' : appLanguage === 'mr' ? 'तुलना ⚖️' : 'Compare ⚖️') :
                          tab.id === 'QuoteHistory' ? (appLanguage === 'hi' ? 'इतिहास ⏳' : appLanguage === 'mr' ? 'इतिहास ⏳' : 'History ⏳') :
                          tab.id === 'QuoteDiscount' ? (appLanguage === 'hi' ? 'छूट 🏷️' : appLanguage === 'mr' ? 'सवलत 🏷️' : 'Discount 🏷️') :
                          tab.id === 'QuoteDelivery' ? (appLanguage === 'hi' ? 'ई-वितरण 📨' : appLanguage === 'mr' ? 'ई-वितरण 📨' : 'E-Delivery 📨') :
                          tab.id === 'QuoteAnalytics' ? (appLanguage === 'hi' ? 'विश्लेषण 📈' : appLanguage === 'mr' ? 'विश्लेषण 📈' : 'Analytics 📈') :
                          tab.id === 'QuotePricingRules' ? (appLanguage === 'hi' ? 'मूल्य नियम ⚙️' : appLanguage === 'mr' ? 'किंमत नियम ⚙️' : 'Pricing Rules ⚙️') :
                          tab.id === 'LiveMap' ? (appLanguage === 'hi' ? 'लाइव संचालन' : appLanguage === 'mr' ? 'थेट ऑपरेशन्स' : 'Live Operations') :
                          tab.id === 'RouteOpt' ? (appLanguage === 'hi' ? 'रूट मैच 🗺️' : appLanguage === 'mr' ? 'मार्ग जुळणी 🗺️' : 'Route Match 🗺️') :
                          tab.id === 'SOSDesk' ? (appLanguage === 'hi' ? 'आपातकालीन डेस्क 🚨' : appLanguage === 'mr' ? 'तात्काळ डेस्क 🚨' : 'SOS Desk 🚨') :
                          tab.id === 'LiveFeed' ? (appLanguage === 'hi' ? 'लाइव फीड' : appLanguage === 'mr' ? 'थेट फीड' : 'Live Feed') :
                          tab.id === 'SurveyorAudit' ? (appLanguage === 'hi' ? 'सर्वेक्षक ऑडिट' : appLanguage === 'mr' ? 'सर्वेक्षक ऑडिट' : 'Surveyor Audit') :
                          tab.id === 'TechnicianAudit' ? (appLanguage === 'hi' ? 'तकनीशियन ऑडिट' : appLanguage === 'mr' ? 'तंत्रज्ञ ऑडिट' : 'Technician Audit') :
                          tab.id === 'Territories' ? (appLanguage === 'hi' ? 'क्षेत्र नियंत्रण' : appLanguage === 'mr' ? 'प्रदेश नियंत्रण' : 'Territory Control') :
                          tab.id === 'Heatmap' ? (appLanguage === 'hi' ? 'लीड हीटमैप' : appLanguage === 'mr' ? 'लीड हीटमॅप' : 'Lead Heatmap') :
                          tab.id === 'SiteVerify' ? (appLanguage === 'hi' ? 'भू-सत्यापन' : appLanguage === 'mr' ? 'भू-पडताळणी' : 'Geo-Verification') :
                          tab.id === 'Funnel' ? (appLanguage === 'hi' ? 'बिक्री फ़नल' : appLanguage === 'mr' ? 'विक्री फनेल' : 'Sales Funnel') :
                          tab.id === 'RevenueProfit' ? (appLanguage === 'hi' ? 'राजस्व और लाभ' : appLanguage === 'mr' ? 'महसूल आणि नफा' : 'Revenue & Profit') :
                           tab.id === 'FinancialCashFlow' ? (appLanguage === 'hi' ? 'नकदी प्रवाह 💵' : appLanguage === 'mr' ? 'रोख प्रवाह 💵' : 'Cash Flow 💵') :
                          tab.id === 'Leaderboard' ? (appLanguage === 'hi' ? 'प्रदर्शन सूचकांक' : appLanguage === 'mr' ? 'कामगिरी रँकिंग' : 'Performance') :
                          tab.id === 'Conversion' ? (appLanguage === 'hi' ? 'रूपांतरण 📈' : appLanguage === 'mr' ? 'रूपांतरण 📈' : 'Conversions 📈') :
                          tab.id === 'SupplierScorecard' ? (appLanguage === 'hi' ? 'आपूर्तिकर्ता 🏆' : appLanguage === 'mr' ? 'विक्रेता 🏆' : 'Supplier SLA 🏆') :
                          tab.id === 'AutomationHealth' ? (appLanguage === 'hi' ? 'स्वचालन ⚙️' : appLanguage === 'mr' ? 'ऑटोमेशन ⚙️' : 'Automation ⚙️') :
                          tab.id === 'Partners' ? (appLanguage === 'hi' ? 'भागीदार निर्देशिका' : appLanguage === 'mr' ? 'भागीदार निर्देशिका' : 'Directory') :
                          tab.id === 'Settings' ? (appLanguage === 'hi' ? 'नियंत्रण इकाई' : appLanguage === 'mr' ? 'नियंत्रण युनिट' : 'Control Unit') :
                          tab.label
                        }</span>
                      </button>
                    );
                  })}
                </nav>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          WHAT'S NEW DISMISSIBLE SHEET
          ========================================================= */}
      <AnimatePresence>
        {showWhatsNew && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-lg bg-white rounded-t-3xl md:rounded-3xl border-t border-x md:border border-[rgba(184,135,61,0.2)] p-6 md:p-8 space-y-6 shadow-2xl overflow-hidden relative text-left"
            >
              {/* Gold Top line design element for bottom sheet drag indicator */}
              <div className="w-12 h-1.5 bg-[#e5dfd4] rounded-full mx-auto md:hidden mb-2" />

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-antiquegold/10 text-antiquegold rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <Sparkles className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-charcoal">What's New in v1.0.1</h3>
                  <p className="text-xs text-warmgray uppercase tracking-wider font-mono">Platform Update Released</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-royalemerald/10 text-royalemerald flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-charcoal">Premium Alabaster Theme</h4>
                    <p className="text-[11px] text-warmgray leading-normal">A luxurious, high-contrast, eye-safe design system featuring Royal White base and gold accents.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-royalemerald/10 text-royalemerald flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-charcoal">GPS Grounding & Auto-Verification</h4>
                    <p className="text-[11px] text-warmgray leading-normal">Field surveyors can now geo-tag sites automatically with accurate GPS verification coordinates.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0E4B3D]/10 text-royalemerald flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-charcoal">Real-Time Session Persistence</h4>
                    <p className="text-[11px] text-warmgray leading-normal">Remembers active partner credentials securely. Returning users bypass login screens with zero taps.</p>
                  </div>
                </div>
              </div>

              <Button
                variant="emerald"
                fullWidth
                onClick={() => {
                  localStorage.setItem('aiec_app_version', '1.0.1');
                  setShowWhatsNew(false);
                }}
              >
                <span>Acknowledge & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
