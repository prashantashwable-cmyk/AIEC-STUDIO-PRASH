import React from 'react';
import { Sparkles } from 'lucide-react';
import { User } from '../types';
import { Card } from '../components/Common';
import { CustomerDashboard } from '../components/Dashboards';
import { CustomerHomeDashboardScreen } from '../components/CustomerHomeDashboardScreen';
import { DealClosureConfirmation } from '../components/DealClosureConfirmation';
import { DealTermsFinalization } from '../components/DealTermsFinalization';
import { DigitalContractGenerator } from '../components/DigitalContractGenerator';
import { ESignatureCapture } from '../components/ESignatureCapture';
import { LiveNegotiationThread } from '../components/LiveNegotiationThread';
import { MultiOptionComparison } from '../components/MultiOptionComparison';
import { QuotationPreview } from '../components/QuotationPreview';

interface CustomerRouterProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appLanguage: string;
  renderPreferencesSection: () => React.ReactNode;
}

export function CustomerRouter({ currentUser, activeTab, setActiveTab, appLanguage, renderPreferencesSection }: CustomerRouterProps) {
  return (
    <>
          {currentUser.role === 'customer' && activeTab === 'Home' && (
            <CustomerHomeDashboardScreen
              userRole={currentUser.role}
              currentLanguage={appLanguage}
              currentUserId={currentUser.id}
              onNavigateTab={(tab, params) => setActiveTab(tab)}
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
    </>
  );
}
