import React from 'react';
import { Settings } from 'lucide-react';
import { User } from '../types';
import { DbManager } from '../lib/db';
import { AdminDashboard } from '../components/Dashboards';
import { AdminRoleManagement } from '../components/RoleSelectionWizard';
import { Button, Card } from '../components/Common';
import { AlertsExceptionsDashboard } from '../components/AlertsExceptionsDashboard';
import { AutoNegotiationBotConfig } from '../components/AutoNegotiationBotConfig';
import { AutoPoTriggerRules } from '../components/AutoPoTriggerRules';
import { AutomatedSequenceBuilder } from '../components/AutomatedSequenceBuilder';
import { AutomationHealthMonitor } from '../components/AutomationHealthMonitor';
import { BulkLeadImportExport } from '../components/BulkLeadImportExport';
import { CallLogAutoDialer } from '../components/CallLogAutoDialer';
import { CommAnalytics } from '../components/CommAnalytics';
import { CommComplianceManager } from '../components/CommComplianceManager';
import { CommunicationTemplatesLibrary } from '../components/CommunicationTemplatesLibrary';
import { CompetitorBattlecard } from '../components/CompetitorBattlecard';
import { ConversationAIBotConfig } from '../components/ConversationAIBotConfig';
import { ConversionRateAnalytics } from '../components/ConversionRateAnalytics';
import { CounterOfferApproval } from '../components/CounterOfferApproval';
import { CustomerObjectionHandling } from '../components/CustomerObjectionHandling';
import { CustomerReplyInbox } from '../components/CustomerReplyInbox';
import { DealClosureConfirmation } from '../components/DealClosureConfirmation';
import { DealTermsFinalization } from '../components/DealTermsFinalization';
import { DealWonCelebration } from '../components/DealWonCelebration';
import { DeliveryAnalyticsScreen } from '../components/DeliveryAnalyticsScreen';
import { DeliveryDelayAlertEscalationScreen } from '../components/DeliveryDelayAlertEscalationScreen';
import { DeliveryPartnerManagementScreen } from '../components/DeliveryPartnerManagementScreen';
import { DeliverySopConfigScreen } from '../components/DeliverySopConfigScreen';
import { DigitalContractGenerator } from '../components/DigitalContractGenerator';
import { DiscountApprovalWorkflow } from '../components/DiscountApprovalWorkflow';
import { ESignatureCapture } from '../components/ESignatureCapture';
import { EmergencyEscalationAlert } from '../components/EmergencyEscalationAlert';
import { FinancialCashFlowReceivables } from '../components/FinancialCashFlowReceivables';
import { FollowUpStageRules } from '../components/FollowUpStageRules';
import { GeofenceTerritoryManagement } from '../components/GeofenceTerritoryManagement';
import { LeadAssignment } from '../components/LeadAssignment';
import { LeadDensityHeatmap } from '../components/LeadDensityHeatmap';
import { LeadFollowUpScheduler } from '../components/LeadFollowUpScheduler';
import { LeadInbox } from '../components/LeadInbox';
import { LeadKanban } from '../components/LeadKanban';
import { LeadMergeResolution } from '../components/LeadMergeResolution';
import { LeadScoring } from '../components/LeadScoring';
import { LeadSourceAttribution } from '../components/LeadSourceAttribution';
import { LiveActivityFeed } from '../components/LiveActivityFeed';
import { LiveMapDashboard } from '../components/LiveMapDashboard';
import { LiveNegotiationThread } from '../components/LiveNegotiationThread';
import { LoanPartnerIntegration } from '../components/LoanPartnerIntegration';
import { LostLeadDisqualification } from '../components/LostLeadDisqualification';
import { MilestonePaymentReleaseScreen } from '../components/MilestonePaymentReleaseScreen';
import { MultiOptionComparison } from '../components/MultiOptionComparison';
import { OverduePaymentEscalation } from '../components/OverduePaymentEscalation';
import { PaymentCollectionDashboard } from '../components/PaymentCollectionDashboard';
import { PaymentReminderConfig } from '../components/PaymentReminderConfig';
import { PaymentStageScheduleSetup } from '../components/PaymentStageScheduleSetup';
import { PricingRulesMarginConfig } from '../components/PricingRulesMarginConfig';
import { QuotationAnalyticsWinLoss } from '../components/QuotationAnalyticsWinLoss';
import { QuotationInputSpecs } from '../components/QuotationInputSpecs';
import { QuotationPreview } from '../components/QuotationPreview';
import { QuotationSendEDelivery } from '../components/QuotationSendEDelivery';
import { QuotationTemplateBranding } from '../components/QuotationTemplateBranding';
import { QuotationVersionHistory } from '../components/QuotationVersionHistory';
import { QuotePricing } from '../components/QuotePricing';
import { RefundDisputeManagement } from '../components/RefundDisputeManagement';
import { RevenueProfitAnalytics } from '../components/RevenueProfitAnalytics';
import { RouteOptimizationSuggestion } from '../components/RouteOptimizationSuggestion';
import { SMSBroadcastDeliveryReport } from '../components/SMSBroadcastDeliveryReport';
import { SalesFunnelAnalytics } from '../components/SalesFunnelAnalytics';
import { SiteVisitVerification } from '../components/SiteVisitVerification';
import { StockInTransitScreen } from '../components/StockInTransitScreen';
import { SupplierPaymentApprovalScreen } from '../components/SupplierPaymentApprovalScreen';
import { SupplierPerformanceScorecard } from '../components/SupplierPerformanceScorecard';
import { SurveyorLiveTrackingDetailView } from '../components/SurveyorLiveTrackingDetailView';
import { TechnicianLiveTrackingDetailView } from '../components/TechnicianLiveTrackingDetailView';
import { WhatsAppBusinessChatConsole } from '../components/WhatsAppBusinessChatConsole';
import { WorkerPerformanceLeaderboard } from '../components/WorkerPerformanceLeaderboard';

interface AdminRouterProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appLanguage: string;
  googleMapsApiKey: string;
  hasValidGoogleMapsKey: boolean;
  selectedPaymentId: string;
  setSelectedPaymentId: (id: string) => void;
  setTrackingPoId: (id: string | undefined) => void;
  handleLogout: () => void;
  renderPreferencesSection: () => React.ReactNode;
}

export function AdminRouter({ currentUser, activeTab, setActiveTab, appLanguage, googleMapsApiKey, hasValidGoogleMapsKey, selectedPaymentId, setSelectedPaymentId, setTrackingPoId, handleLogout, renderPreferencesSection }: AdminRouterProps) {
  return (
    <>
          {currentUser.role === 'admin' && activeTab === 'Home' && <AdminDashboard user={currentUser} />}
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
          {currentUser.role === 'admin' && activeTab === 'LoanPartnerIntegration' && (
            <LoanPartnerIntegration 
              user={currentUser}
              onNavigateToCollection={() => setActiveTab('PaymentCollectionDashboard')}
              onNavigateToEscalation={() => setActiveTab('OverduePaymentEscalation')}
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
          {currentUser.role === 'admin' && activeTab === 'AutoPoTriggerRules' && (
            <AutoPoTriggerRules 
              user={currentUser}
              onNavigateToPOs={() => setActiveTab('PurchaseOrderGenerator')}
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
    </>
  );
}
