import React, { useState } from 'react';
import { 
  Gift, Share2, Copy, Check, Users, ArrowLeft, Sparkles, 
  DollarSign, CheckCircle2, Clock, Send, ShieldCheck, ChevronRight, 
  Building, UserPlus, Info, ExternalLink
} from 'lucide-react';
import { UserRole, CustomerReferralEntry } from '../types';
import { DbManager } from '../lib/db';

interface CustomerReferralProgramScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const CustomerReferralProgramScreen: React.FC<CustomerReferralProgramScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  onBack,
  onNavigateTab
}) => {
  const [referrals, setReferrals] = useState<CustomerReferralEntry[]>(() => 
    DbManager.getCustomerReferrals(currentUserId)
  );
  
  const referralCode = 'AIEC-RAJESHWAR-108';
  const referralLink = `https://aiec-elevators.in/referral?code=${referralCode}`;

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  
  // New Referral Form
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [newReferredName, setNewReferredName] = useState<string>('');
  const [newReferredPhone, setNewReferredPhone] = useState<string>('');
  const [newReferredCity, setNewReferredCity] = useState<string>('Pune');
  const [newReferredProject, setNewReferredProject] = useState<string>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalEarned = referrals.reduce((sum, r) => sum + r.paidCommissionReward, 0);
  const totalPending = referrals.reduce((sum, r) => sum + (r.status !== 'reward_issued' && r.status !== 'converted' ? r.estimatedCommissionReward : 0), 0);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    triggerToast('Referral Code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    triggerToast('Referral Link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Namaste! I strongly recommend AIEC Elevators for quality German-tech elevator installations. Use my personal customer referral code *${referralCode}* to get ₹10,000 off on your elevator contract. Claim here: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleAddReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReferredName || !newReferredPhone) return;

    const newRef: CustomerReferralEntry = {
      id: `ref_${Date.now().toString().slice(-4)}`,
      customerId: currentUserId,
      customerName: 'Shri Rajeshwar Patil',
      referralCode: referralCode,
      referredName: newReferredName,
      referredPhone: newReferredPhone,
      referredCity: newReferredCity,
      referredProjectName: newReferredProject || `${newReferredName}'s Site`,
      status: 'invited',
      estimatedCommissionReward: 10000,
      paidCommissionReward: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    DbManager.saveCustomerReferral(newRef);
    setReferrals(DbManager.getCustomerReferrals(currentUserId));

    setShowInviteModal(false);
    setNewReferredName('');
    setNewReferredPhone('');
    setNewReferredProject('');

    triggerToast(`Referral invitation sent to ${newReferredName}! Added to CRM pipeline with source 'Referral/Repeat'.`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)] border border-[var(--color-accent-primary)] text-[var(--color-text-primary)] px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-serif text-xl font-bold flex items-center gap-2">
                <Gift className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'रेफरल एवं रिवार्ड कार्यक्रम' : currentLanguage === 'mr' ? 'रेफरल आणि बक्षीस योजना' : 'Customer Referral Rewards'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' ? 'अपने मित्रों को रेफर करें और प्रत्येक एलिवेटर बुकिंग पर नकद पुरस्कार पाएं' : 'Share AIEC trust with friends & earn up to ₹25,000 per elevator contract'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Refer a Friend</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Hero Card & Code Box */}
        <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg)] border border-[var(--color-accent-primary)]/40 rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 px-2.5 py-1 rounded-lg inline-block">
                EXCLUSIVITY LOYALTY CLUB
              </span>
              <h2 className="font-serif font-bold text-2xl text-[var(--color-text-primary)]">
                Give ₹10,000 Discount • Earn Up to ₹25,000 Cash Reward
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                When your referred builder or home owner books an elevator with AIEC, they receive an instant ₹10,000 contract discount, and you earn an automated cash reward processed directly by our Commission Engine.
              </p>
            </div>

            {/* KPI Reward Counters */}
            <div className="grid grid-cols-2 gap-3 min-w-[240px]">
              <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-center space-y-1">
                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase block">Total Earned</span>
                <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{totalEarned.toLocaleString()}</span>
              </div>
              <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-center space-y-1">
                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase block">Pending Rewards</span>
                <span className="text-lg font-mono font-bold text-[var(--color-accent-primary)]">₹{totalPending.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Code Sharing Bar */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-[var(--color-text-secondary)] block uppercase">Your Personal Referral Code</span>
              <span className="font-mono text-base font-bold text-[var(--color-accent-primary)] tracking-widest">{referralCode}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--color-accent-primary)]" />}
                <span>{copiedCode ? 'Copied Code' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ascension Line Pipeline Tracking List */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
                Tracked Referrals & Conversion Progress ({referrals.length})
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Real-time CRM lead tracking synchronized with AIEC Sales Pipeline
              </p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-xs font-bold rounded-xl flex items-center gap-1 text-[var(--color-text-primary)]"
            >
              <UserPlus className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              <span>+ Add Lead</span>
            </button>
          </div>

          <div className="space-y-6">
            {referrals.map((ref, idx) => {
              const stages = [
                { key: 'invited', label: 'Invite Sent' },
                { key: 'survey_completed', label: 'Site Surveyed' },
                { key: 'converted', label: 'Contract Signed' },
                { key: 'reward_issued', label: 'Reward Paid' }
              ];

              const currentStageIndex = ref.status === 'reward_issued' ? 3 : ref.status === 'converted' ? 2 : ref.status === 'survey_completed' ? 1 : 0;

              return (
                <div key={ref.id} className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                        <span>{ref.referredName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--color-surface)] rounded-md border text-[var(--color-text-secondary)]">
                          {ref.referredCity}
                        </span>
                      </h4>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Site: {ref.referredProjectName} • Contact: {ref.referredPhone}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[var(--color-accent-primary)] block">
                        Est. Reward: ₹{ref.estimatedCommissionReward.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-secondary)]">
                        Invited on {ref.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Ascension Line Progress Rail Motif */}
                  <div className="pt-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block mb-2">
                      Ascension Pipeline Stage
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {stages.map((stg, sIdx) => {
                        const isDone = sIdx <= currentStageIndex;
                        const isCurrent = sIdx === currentStageIndex;

                        return (
                          <div key={stg.key} className="space-y-1.5">
                            <div className={`h-2 rounded-full transition-all ${
                              isDone ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-border)]'
                            }`} />
                            <span className={`text-[10px] block font-medium ${
                              isCurrent ? 'text-[var(--color-accent-primary)] font-bold' : isDone ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                            }`}>
                              {stg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integration Callout Box */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm flex items-start space-x-3 text-xs text-[var(--color-text-secondary)]">
          <ShieldCheck className="w-5 h-5 text-[var(--color-accent-primary)] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-[var(--color-text-primary)] block">Automated Commission Engine Rules Integration</strong>
            <p>
              Referred leads are automatically tagged with source <strong>Referral/Repeat</strong> in the AIEC CRM. Duplicate protection is actively enforced. Upon contract conversion, your referral bonus is disbursed directly via automated bank transfer.
            </p>
          </div>
        </div>

      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
                Refer a Friend or Builder
              </h3>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReferralSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Deshmukh"
                  value={newReferredName}
                  onChange={e => setNewReferredName(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Phone Number *</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98901 22334"
                  value={newReferredPhone}
                  onChange={e => setNewReferredPhone(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Pune, PCMC, Satara"
                  value={newReferredCity}
                  onChange={e => setNewReferredCity(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Project or Site Details</label>
                <input
                  type="text"
                  placeholder="e.g. 4-Story Commercial Building"
                  value={newReferredProject}
                  onChange={e => setNewReferredProject(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95"
                >
                  Submit Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
