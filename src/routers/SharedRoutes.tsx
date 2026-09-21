import React from 'react';
import { Settings } from 'lucide-react';
import { User } from '../types';
import { Button, Card } from '../components/Common';
import { AdvancePaymentRetentionScreen } from '../components/AdvancePaymentRetentionScreen';
import { ApiIntegrationManagementScreen } from '../components/ApiIntegrationManagementScreen';
import { AppVersionChangelogFeedbackScreen } from '../components/AppVersionChangelogFeedbackScreen';
import { ApplicantDataCollectionScreen } from '../components/ApplicantDataCollectionScreen';
import { ApplicantScreeningScreen } from '../components/ApplicantScreeningScreen';
import { AuditLogAutomatedActionsScreen } from '../components/AuditLogAutomatedActionsScreen';
import { AutoReconciliationScreen } from '../components/AutoReconciliationScreen';
import { AutomatedPayoutDisbursementScreen } from '../components/AutomatedPayoutDisbursementScreen';
import { AutomationTestingSandboxScreen } from '../components/AutomationTestingSandboxScreen';
import { BackgroundVerificationScreen } from '../components/BackgroundVerificationScreen';
import { BackupDataExportScreen } from '../components/BackupDataExportScreen';
import { BadgesMilestonesScreen } from '../components/BadgesMilestonesScreen';
import { CertificationBadgeProgressScreen } from '../components/CertificationBadgeProgressScreen';
import { CommissionRulesEngineScreen } from '../components/CommissionRulesEngineScreen';
import { CompanyProfileBrandingSettingsScreen } from '../components/CompanyProfileBrandingSettingsScreen';
import { ComplianceCertificationScreen } from '../components/ComplianceCertificationScreen';
import { ContestConfigurationScreen } from '../components/ContestConfigurationScreen';
import { CustomerAmcBookingScreen } from '../components/CustomerAmcBookingScreen';
import { CustomerDocumentVaultScreen } from '../components/CustomerDocumentVaultScreen';
import { CustomerFeedbackRatingScreen } from '../components/CustomerFeedbackRatingScreen';
import { CustomerHandoverWalkthroughScreen } from '../components/CustomerHandoverWalkthroughScreen';
import { CustomerHomeDashboardScreen } from '../components/CustomerHomeDashboardScreen';
import { CustomerLiveSupportChatScreen } from '../components/CustomerLiveSupportChatScreen';
import { CustomerNotificationCenterScreen } from '../components/CustomerNotificationCenterScreen';
import { CustomerPaymentInstallmentsScreen } from '../components/CustomerPaymentInstallmentsScreen';
import { CustomerReferralProgramScreen } from '../components/CustomerReferralProgramScreen';
import { CustomerSupportTicketScreen } from '../components/CustomerSupportTicketScreen';
import { DamagedMissingPartsReportScreen } from '../components/DamagedMissingPartsReportScreen';
import { DataPrivacyConsentManagementScreen } from '../components/DataPrivacyConsentManagementScreen';
import { DefectSnagListScreen } from '../components/DefectSnagListScreen';
import { DeliverySchedulingScreen } from '../components/DeliverySchedulingScreen';
import { EscalationMatrixConfigScreen } from '../components/EscalationMatrixConfigScreen';
import { FinalHandoverChecklistScreen } from '../components/FinalHandoverChecklistScreen';
import { HandoverCompletionCertificateScreen } from '../components/HandoverCompletionCertificateScreen';
import { HelpFaqSupportScreen } from '../components/HelpFaqSupportScreen';
import { InstallationProgressTimelineScreen } from '../components/InstallationProgressTimelineScreen';
import { InstallationSopChecklistScreen } from '../components/InstallationSopChecklistScreen';
import { InterviewSchedulingScreen } from '../components/InterviewSchedulingScreen';
import { InvoiceGenerator } from '../components/InvoiceGenerator';
import { IssueBlockerReportingScreen } from '../components/IssueBlockerReportingScreen';
import { JobDetailSiteInfoScreen } from '../components/JobDetailSiteInfoScreen';
import { LegalContractTemplatesRepositoryScreen } from '../components/LegalContractTemplatesRepositoryScreen';
import { LiveShipmentTrackingScreen } from '../components/LiveShipmentTrackingScreen';
import { LoanEmiApplication } from '../components/LoanEmiApplication';
import { ManualOverrideConsoleScreen } from '../components/ManualOverrideConsoleScreen';
import { ManufacturerProductionStatus } from '../components/ManufacturerProductionStatus';
import { MasterAutomationRulesDashboardScreen } from '../components/MasterAutomationRulesDashboardScreen';
import { MaterialReceivedConfirmationScreen } from '../components/MaterialReceivedConfirmationScreen';
import { MaterialUsageLoggingScreen } from '../components/MaterialUsageLoggingScreen';
import { NewPartnerAggregationDashboardScreen } from '../components/NewPartnerAggregationDashboardScreen';
import { NewSopRolloutNotificationScreen } from '../components/NewSopRolloutNotificationScreen';
import { NotificationTemplatesChannelsScreen } from '../components/NotificationTemplatesChannelsScreen';
import { OfferOnboardingAgreementScreen } from '../components/OfferOnboardingAgreementScreen';
import { OnlinePaymentCheckout } from '../components/OnlinePaymentCheckout';
import { PartnerDeactivationExitScreen } from '../components/PartnerDeactivationExitScreen';
import { PartnerDirectoryScreen } from '../components/PartnerDirectoryScreen';
import { PartnerTierCategoryAssignmentScreen } from '../components/PartnerTierCategoryAssignmentScreen';
import { PaymentReceiptHistory } from '../components/PaymentReceiptHistory';
import { PayoutApprovalQueueScreen } from '../components/PayoutApprovalQueueScreen';
import { PayoutDisputeQueryScreen } from '../components/PayoutDisputeQueryScreen';
import { PayoutHistoryStatementsScreen } from '../components/PayoutHistoryStatementsScreen';
import { PhotoVideoEvidenceCaptureScreen } from '../components/PhotoVideoEvidenceCaptureScreen';
import { ProjectStatusTrackerScreen } from '../components/ProjectStatusTrackerScreen';
import { PurchaseOrderGenerator } from '../components/PurchaseOrderGenerator';
import { QcInspectorAssignmentScreen } from '../components/QcInspectorAssignmentScreen';
import { QualityChecklistElectricalScreen } from '../components/QualityChecklistElectricalScreen';
import { QualityChecklistMechanicalScreen } from '../components/QualityChecklistMechanicalScreen';
import { QuizCertificationTestScreen } from '../components/QuizCertificationTestScreen';
import { RecruitmentLandingScreen } from '../components/RecruitmentLandingScreen';
import { RewardsLeaderboardScreen } from '../components/RewardsLeaderboardScreen';
import { ReworkAssignmentScreen } from '../components/ReworkAssignmentScreen';
import { SaaSOpsSubscriptionBillingScreen } from '../components/SaaSOpsSubscriptionBillingScreen';
import { SafetyComplianceChecklistScreen } from '../components/SafetyComplianceChecklistScreen';
import { SecuritySessionManagementScreen } from '../components/SecuritySessionManagementScreen';
import { SinglePersonMonitorControlPanelScreen } from '../components/SinglePersonMonitorControlPanelScreen';
import { SiteDeliveryChecklistScreen } from '../components/SiteDeliveryChecklistScreen';
import { SkillMatrixGapAnalysisScreen } from '../components/SkillMatrixGapAnalysisScreen';
import { SlaTimerBreachAlertScreen } from '../components/SlaTimerBreachAlertScreen';
import { SopDocumentRepositoryScreen } from '../components/SopDocumentRepositoryScreen';
import { StageWisePayoutTrackerScreen } from '../components/StageWisePayoutTrackerScreen';
import { SupplierCatalogPricing } from '../components/SupplierCatalogPricing';
import { SupplierCommunicationThreads } from '../components/SupplierCommunicationThreads';
import { SupplierContractSla } from '../components/SupplierContractSla';
import { SupplierDirectory } from '../components/SupplierDirectory';
import { SupplierDisputeResolutionScreen } from '../components/SupplierDisputeResolutionScreen';
import { SupplierInvoiceMatchingScreen } from '../components/SupplierInvoiceMatchingScreen';
import { SupplierOrderStatusTracking } from '../components/SupplierOrderStatusTracking';
import { SupplierPaymentAnalyticsScreen } from '../components/SupplierPaymentAnalyticsScreen';
import { SupplierPaymentHistoryScreen } from '../components/SupplierPaymentHistoryScreen';
import { SupplierPaymentScheduleScreen } from '../components/SupplierPaymentScheduleScreen';
import { SupplierPaymentTermsConfigScreen } from '../components/SupplierPaymentTermsConfigScreen';
import { SupplierRatingScorecard } from '../components/SupplierRatingScorecard';
import { SystemHealthBotMonitoringScreen } from '../components/SystemHealthBotMonitoringScreen';
import { TaxDeductionStatementScreen } from '../components/TaxDeductionStatementScreen';
import { TaxGstComplianceScreen } from '../components/TaxGstComplianceScreen';
import { TechnicianCheckInCheckOutScreen } from '../components/TechnicianCheckInCheckOutScreen';
import { TechnicianHomeMyJobsScreen } from '../components/TechnicianHomeMyJobsScreen';
import { TechnicianTeamCoordinationScreen } from '../components/TechnicianTeamCoordinationScreen';
import { TrainingComplianceTrackerScreen } from '../components/TrainingComplianceTrackerScreen';
import { TrainingFeedbackScreen } from '../components/TrainingFeedbackScreen';
import { TrainingModuleLibraryScreen } from '../components/TrainingModuleLibraryScreen';
import { UserRolePermissionManagementScreen } from '../components/UserRolePermissionManagementScreen';
import { VideoInteractiveLessonPlayerScreen } from '../components/VideoInteractiveLessonPlayerScreen';
import { WarrantyAmcRegistrationScreen } from '../components/WarrantyAmcRegistrationScreen';
import { WorkflowTriggerBuilderScreen } from '../components/WorkflowTriggerBuilderScreen';

interface SharedRoutesProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appLanguage: string;
  handleLogout: () => void;
  renderPreferencesSection: () => React.ReactNode;
  selectedTechJobId: string;
  setSelectedTechJobId: (id: string) => void;
  selectedApplicantId: string;
  setSelectedApplicantId: (id: string) => void;
  selectedSopStepId: string | undefined;
  setSelectedSopStepId: (id: string | undefined) => void;
  trackingPoId: string | undefined;
  setTrackingPoId: (id: string | undefined) => void;
  selectedPaymentId: string;
  setSelectedPaymentId: (id: string) => void;
  selectedTrainingModuleId: string;
  setSelectedTrainingModuleId: (id: string) => void;
  selectedTrainingLessonId: string;
  setSelectedTrainingLessonId: (id: string) => void;
  selectedAssessmentId: string;
  setSelectedAssessmentId: (id: string) => void;
}

export function SharedRoutes({ currentUser, activeTab, setActiveTab, appLanguage, handleLogout, renderPreferencesSection, selectedTechJobId, setSelectedTechJobId, selectedApplicantId, setSelectedApplicantId, selectedSopStepId, setSelectedSopStepId, trackingPoId, setTrackingPoId, selectedPaymentId, setSelectedPaymentId, selectedTrainingModuleId, setSelectedTrainingModuleId, selectedTrainingLessonId, setSelectedTrainingLessonId, selectedAssessmentId, setSelectedAssessmentId }: SharedRoutesProps) {
  return (
    <>
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
          {activeTab === 'DamagedMissingPartsReport' && (
            <DamagedMissingPartsReportScreen 
              user={currentUser} 
              selectedPoId={trackingPoId}
              onNavigateToThread={() => setActiveTab('SupplierCommThreads')}
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
    </>
  );
}
