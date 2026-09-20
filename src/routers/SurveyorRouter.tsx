import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { User } from '../types';
import { DbManager } from '../lib/db';
import { Card } from '../components/Common';
import { SurveyorDashboard } from '../components/Dashboards';
import { LeadFollowUpScheduler } from '../components/LeadFollowUpScheduler';

interface SurveyorRouterProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function SurveyorRouter({ currentUser, activeTab, setActiveTab }: SurveyorRouterProps) {
  return (
    <>
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
    </>
  );
}
