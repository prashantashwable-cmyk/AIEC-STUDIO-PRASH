import React, { useState } from 'react';
import { 
  Star, ArrowLeft, Send, ThumbsUp, AlertTriangle, ShieldCheck, 
  Sparkles, MessageSquare, Award, CheckCircle2, User, Building
} from 'lucide-react';
import { UserRole, CustomerFeedbackEntry, CustomerProjectSummary } from '../types';
import { DbManager } from '../lib/db';

interface CustomerFeedbackRatingScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const CustomerFeedbackRatingScreen: React.FC<CustomerFeedbackRatingScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  onBack,
  onNavigateTab
}) => {
  const [projects] = useState<CustomerProjectSummary[]>(() => 
    DbManager.getCustomerProjects(currentUserId)
  );
  const [feedbackHistory, setFeedbackHistory] = useState<CustomerFeedbackEntry[]>(() => 
    DbManager.getCustomerFeedbackEntries(currentUserId)
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || 'proj_skyline_002'
  );
  const [interactionContext, setInteractionContext] = useState<CustomerFeedbackEntry['interactionContext']>('post_service_visit');
  
  // Rating States (1 to 5)
  const [overallScore, setOverallScore] = useState<number>(5);
  const [installationQuality, setInstallationQuality] = useState<number>(5);
  const [communication, setCommunication] = useState<number>(5);
  const [timeliness, setTimeliness] = useState<number>(5);
  const [valueForMoney, setValueForMoney] = useState<number>(5);

  const [commentText, setCommentText] = useState<string>('');
  const [flaggedTechName, setFlaggedTechName] = useState<string>('Vikram Shinde');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStarClick = (scoreSetter: (val: number) => void, val: number) => {
    scoreSetter(val);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();

    const requiresOutreach = overallScore <= 2 || installationQuality <= 2;

    const newFeedback: CustomerFeedbackEntry = {
      id: `fb_${Date.now().toString().slice(-4)}`,
      customerId: currentUserId,
      customerName: activeProject ? activeProject.customerName : 'Shri Rajeshwar Patil',
      projectId: selectedProjectId,
      projectName: activeProject ? activeProject.projectName : 'Skyline Commercial Hub Lift #2',
      interactionContext: interactionContext,
      overallScore: overallScore,
      ratings: {
        installationQuality,
        communication,
        timeliness,
        valueForMoney
      },
      commentText: commentText,
      flaggedTechName: flaggedTechName,
      adminOutreachRequired: requiresOutreach,
      createdAt: new Date().toISOString().split('T')[0]
    };

    DbManager.saveCustomerFeedbackEntry(newFeedback);
    setFeedbackHistory(DbManager.getCustomerFeedbackEntries(currentUserId));

    // Reset Form
    setCommentText('');
    
    if (requiresOutreach) {
      triggerToast('Feedback logged. Our Managing Director Mr. Prashant Wable has been notified for personal follow-up.');
    } else {
      triggerToast('Thank you! Your feedback has been credited to our team performance leaderboard.');
    }
  };

  const renderStarRating = (label: string, value: number, setter: (val: number) => void) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
      <span className="text-xs font-bold text-[var(--color-text-primary)]">{label}</span>
      <div className="flex items-center space-x-1.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(setter, star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star 
              className={`w-5 h-5 ${
                star <= value 
                  ? 'text-amber-500 fill-amber-500' 
                  : 'text-[var(--color-text-secondary)]/30'
              }`} 
            />
          </button>
        ))}
        <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)] w-6 text-right">
          {value}/5
        </span>
      </div>
    </div>
  );

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
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center space-x-3">
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
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              {currentLanguage === 'hi' ? 'प्रतिक्रिया एवं रेटिंग' : currentLanguage === 'mr' ? 'अभिप्राय आणि रेटिंग' : 'Customer Feedback & Ratings'}
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {currentLanguage === 'hi' ? 'आपकी प्रतिक्रिया हमारे तकनीशियन और सेवा उत्कृष्टता को संचालित करती है' : 'Your direct rating shapes our technician leaderboards & quality benchmarks'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Feedback Form Column */}
        <form onSubmit={handleSubmitFeedback} className="md:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--color-accent-primary)]" />
            Rate Your Recent AIEC Service Experience
          </h2>

          {/* Select Project & Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">Elevator Project</label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] font-medium"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">Interaction Event</label>
              <select
                value={interactionContext}
                onChange={e => setInteractionContext(e.target.value as any)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] font-medium"
              >
                <option value="post_service_visit">Post-AMC Maintenance Visit</option>
                <option value="post_handover">Final Elevator Handover Ceremony</option>
                <option value="installation_phase">Installation Phase Quality Check</option>
                <option value="amc_periodic">Quarterly Satisfaction Survey</option>
              </select>
            </div>
          </div>

          {/* Overall Experience Score Header */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-accent-primary)]/40 rounded-2xl p-4 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-primary)] block">
              OVERALL SATISFACTION SCORE
            </span>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(setOverallScore, star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= overallScore 
                        ? 'text-amber-500 fill-amber-500' 
                        : 'text-[var(--color-text-secondary)]/30'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-[var(--color-text-primary)] block">
              {overallScore === 5 ? '🌟 Outstanding Excellence' : overallScore >= 4 ? '👍 Satisfactory' : '⚠️ Requires Attention'}
            </span>
          </div>

          {/* Detailed Dimensions Breakdown */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)] block">
              Dimension Rating Breakdown
            </label>

            {renderStarRating('Elevator Ride Smoothness & Build Quality', installationQuality, setInstallationQuality)}
            {renderStarRating('Staff Communication & Politeness', communication, setCommunication)}
            {renderStarRating('Timeliness & Schedule Adherence', timeliness, setTimeliness)}
            {renderStarRating('Value for Money & Transparency', valueForMoney, setValueForMoney)}
          </div>

          {/* Mention Technician Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)]">
              Assigned Field Engineer / Technician Name
            </label>
            <input
              type="text"
              placeholder="e.g. Vikram Shinde"
              value={flaggedTechName}
              onChange={e => setFlaggedTechName(e.target.value)}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] font-medium"
            />
          </div>

          {/* Open Comment Text Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)]">
              Detailed Comments & Suggestion Box
            </label>
            <textarea
              rows={3}
              placeholder="Share specific details regarding your experience..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] font-medium"
            />
          </div>

          {/* Warning Flag Callout for Low Ratings */}
          {overallScore <= 2 && (
            <div className="bg-rose-500/10 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-800 dark:text-rose-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Low rating flagged: This will generate an immediate priority task for Managing Director Mr. Prashant Wable.</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Rating & Review</span>
            </button>
          </div>
        </form>

        {/* Right Side Previous Reviews History */}
        <div className="space-y-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-sm text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--color-accent-primary)]" />
              Your Review History ({feedbackHistory.length})
            </h3>

            {feedbackHistory.length === 0 ? (
              <p className="text-xs text-[var(--color-text-secondary)] py-4 text-center">
                No past feedback records submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {feedbackHistory.map(fb => (
                  <div key={fb.id} className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--color-text-primary)]">{fb.projectName}</span>
                      <div className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span className="ml-1">{fb.overallScore}/5</span>
                      </div>
                    </div>

                    <p className="text-[var(--color-text-secondary)] text-[11px]">
                      "{fb.commentText}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-secondary)] font-mono pt-1">
                      <span>Tech: {fb.flaggedTechName || 'N/A'}</span>
                      <span>{fb.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
