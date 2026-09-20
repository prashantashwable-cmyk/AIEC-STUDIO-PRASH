import React, { useState } from 'react';
import { 
  ArrowLeft, MessageSquare, Star, AlertTriangle, Shield, CheckCircle2, 
  HelpCircle, Eye, EyeOff, Filter, Send, RefreshCw, AlertCircle, Sparkles,
  Search, Lock, UserCheck, Check, Clock, XCircle, Info
} from 'lucide-react';
import { Card, Button } from './Common';
import { DbManager } from '../lib/db';
import { 
  TrainingModuleFeedback, 
  TrainingFeedbackSummary, 
  TrainingModule, 
  UserRole 
} from '../types';

interface TrainingFeedbackScreenProps {
  onBack: () => void;
  userRole?: UserRole;
  currentLanguage?: 'en' | 'hi' | 'mr';
}

export const TrainingFeedbackScreen: React.FC<TrainingFeedbackScreenProps> = ({
  onBack,
  userRole = 'admin',
  currentLanguage = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'feed' | 'submit'>('analytics');
  
  // Data State
  const [summaries, setSummaries] = useState<TrainingFeedbackSummary[]>(() => DbManager.getTrainingFeedbackSummaries());
  const [feedbackList, setFeedbackList] = useState<TrainingModuleFeedback[]>(() => DbManager.getTrainingFeedbackList());
  const [modules] = useState<TrainingModule[]>(() => DbManager.getTrainingModules());
  
  // Filters for Feedback Feed
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [onlyCriticalFilter, setOnlyCriticalFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form State for Feedback Submission
  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0]?.id || 'tm_001');
  const [clarityRating, setClarityRating] = useState<number>(5);
  const [relevanceRating, setRelevanceRating] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isCriticalSafetyIssue, setIsCriticalSafetyIssue] = useState<boolean>(false);
  const [disputedQuestionText, setDisputedQuestionText] = useState<string>('');

  // UI Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Refresh All Data
  const refreshData = () => {
    setSummaries(DbManager.getTrainingFeedbackSummaries());
    setFeedbackList(DbManager.getTrainingFeedbackList());
  };

  // Handle Submission
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      showToast('Please enter your feedback comments before submitting.');
      return;
    }

    const selectedMod = modules.find(m => m.id === selectedModuleId);
    
    DbManager.submitTrainingFeedback({
      trainingModuleId: selectedModuleId,
      trainingModuleTitle: selectedMod ? selectedMod.moduleTitle : 'SOP Training Module',
      partnerId: isAnonymous ? `anon_${Date.now()}` : 'p_001',
      partnerName: isAnonymous ? 'Anonymous Field Partner' : 'Sanjay Tukaram Deshmukh',
      partnerRole: (userRole === 'admin' ? 'technician' : userRole) as UserRole,
      isAnonymous,
      clarityRating,
      relevanceRating,
      commentText,
      isCriticalSafetyIssue,
      disputedQuestionText: disputedQuestionText.trim() ? disputedQuestionText : undefined
    });

    refreshData();
    showToast(isCriticalSafetyIssue 
      ? 'Critical safety issue submitted with high urgency for L&D team review!' 
      : 'Feedback submitted successfully. Thank you for helping improve AIEC SOPs!'
    );

    // Reset Form
    setCommentText('');
    setDisputedQuestionText('');
    setIsCriticalSafetyIssue(false);
    setActiveTab('feed');
  };

  // Handle Admin Status Update
  const handleUpdateStatus = (feedbackId: string, newStatus: TrainingModuleFeedback['status']) => {
    DbManager.updateFeedbackStatus(feedbackId, newStatus);
    refreshData();
    showToast(`Feedback status updated to ${newStatus.replace('_', ' ')}.`);
  };

  // Handle Admin Moderation Toggle
  const handleToggleModeration = (feedbackId: string) => {
    DbManager.toggleFeedbackModeration(feedbackId);
    refreshData();
    showToast('Feedback visibility toggled.');
  };

  // Filtered Feedback Feed
  const filteredFeedbacks = feedbackList.filter(f => {
    if (selectedModuleFilter !== 'all' && f.trainingModuleId !== selectedModuleFilter) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (onlyCriticalFilter && !f.isCriticalSafetyIssue) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchComment = f.commentText.toLowerCase().includes(q);
      const matchModule = f.trainingModuleTitle.toLowerCase().includes(q);
      const matchPartner = f.partnerName.toLowerCase().includes(q);
      if (!matchComment && !matchModule && !matchPartner) return false;
    }
    return true;
  });

  const criticalIssuesCount = feedbackList.filter(f => f.isCriticalSafetyIssue && f.status !== 'addressed_in_revision' && f.status !== 'dismissed').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in border border-slate-700">
          <Info className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Training & SOP Library
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Training Feedback & Quality Improvement
                  </h1>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Field learner clarity, relevance ratings, quiz disputes & critical content safety review
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {criticalIssuesCount > 0 && (
                <div className="flex items-center gap-2 bg-red-950/60 border border-red-700/80 px-3 py-1.5 rounded-lg text-red-300 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                  <span>{criticalIssuesCount} Urgent Safety/Content Errors</span>
                </div>
              )}
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={refreshData}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 mt-6 space-x-6">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'border-amber-500 text-amber-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Quality Analytics & Summaries
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'feed'
                  ? 'border-amber-500 text-amber-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Feedback Feed ({filteredFeedbacks.length})
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'submit'
                  ? 'border-amber-500 text-amber-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-4 h-4" />
              Submit Module Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: ANALYTICS & QUALITY SUMMARIES */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="bg-white p-5 border border-slate-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Feedbacks</span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">{feedbackList.length}</div>
                <p className="text-xs text-slate-500 mt-1">Across {modules.length} active training modules</p>
              </Card>

              <Card className="bg-white p-5 border border-slate-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Clarity Score</span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">4.4 / 5.0</div>
                <p className="text-xs text-emerald-600 font-medium mt-1">↑ 0.2 increase post-SOP v3.1</p>
              </Card>

              <Card className="bg-white p-5 border border-slate-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Relevance Score</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">4.7 / 5.0</div>
                <p className="text-xs text-slate-500 mt-1">High practical applicability in field</p>
              </Card>

              <Card className="bg-white p-5 border border-slate-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Safety Alerts</span>
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600 mt-2">{criticalIssuesCount}</div>
                <p className="text-xs text-slate-500 mt-1">Elevated urgency for L&D review</p>
              </Card>
            </div>

            {/* Quality Summary Grid per Module */}
            <Card className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">Module Quality & Satisfaction Scorecard</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Aggregated rating signals and response rate context across field roles</p>
                </div>
                <span className="text-xs font-medium text-slate-600 bg-slate-200 px-2.5 py-1 rounded-full">
                  L&D Audit Mode
                </span>
              </div>

              <div className="divide-y divide-slate-200">
                {summaries.map(s => {
                  const isCritical = s.qualityStatus === 'critical_review_required';
                  const isNeedsRevision = s.qualityStatus === 'needs_revision';

                  return (
                    <div key={s.trainingModuleId} className="p-6 hover:bg-slate-50/80 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-slate-900 text-base">{s.trainingModuleTitle}</h4>
                            
                            {isCritical && (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-200">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                Critical Review Required
                              </span>
                            )}
                            {isNeedsRevision && (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Needs Revision
                              </span>
                            )}
                            {!isCritical && !isNeedsRevision && (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                High Quality Standard
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-xs text-slate-600">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-700">Clarity:</span>
                              <div className="flex items-center text-amber-500 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                                {s.averageClarityRating.toFixed(1)} / 5.0
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-700">Relevance:</span>
                              <div className="flex items-center text-emerald-600 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-emerald-500 mr-0.5" />
                                {s.averageRelevanceRating.toFixed(1)} / 5.0
                              </div>
                            </div>

                            <div>
                              <span className="font-semibold text-slate-700">Total Submissions:</span> {s.totalFeedbackCount}
                            </div>

                            <div>
                              <span className="font-semibold text-slate-700">Response Rate Context:</span> {s.responseRatePercent}% ({s.totalFeedbackCount} / {s.totalLearnersCompleted} completed learners)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedModuleFilter(s.trainingModuleId);
                              setActiveTab('feed');
                            }}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                          >
                            View Comments ({s.totalFeedbackCount})
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: FEEDBACK FEED & MODERATION */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <Card className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Search Keywords</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search comments, modules..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Module Selector Filter */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Module</label>
                  <select
                    value={selectedModuleFilter}
                    onChange={(e) => setSelectedModuleFilter(e.target.value)}
                    className="w-full py-1.5 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="all">All Training Modules</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.moduleTitle}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Resolution Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full py-1.5 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under L&D Review</option>
                    <option value="addressed_in_revision">Addressed in SOP Revision</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>

                {/* Critical Issues Checkbox Filter */}
                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input 
                      type="checkbox"
                      checked={onlyCriticalFilter}
                      onChange={(e) => setOnlyCriticalFilter(e.target.checked)}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-red-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      Only Urgent Safety Errors
                    </span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Feedback Feed List */}
            <div className="space-y-4">
              {filteredFeedbacks.length === 0 ? (
                <Card className="p-8 text-center bg-white border border-slate-200 rounded-xl">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-800">No feedbacks found</h3>
                  <p className="text-sm text-slate-500 mt-1">Try resetting filters or changing your search criteria.</p>
                </Card>
              ) : (
                filteredFeedbacks.map(fb => {
                  const isHidden = fb.moderationFlag === 'hidden';

                  return (
                    <Card key={fb.id} className={`bg-white border rounded-xl overflow-hidden p-6 transition-all shadow-sm ${
                      fb.isCriticalSafetyIssue ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                    }`}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Header Line */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                              {fb.trainingModuleTitle}
                            </span>

                            {fb.isAnonymous ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded">
                                <Lock className="w-3 h-3 text-slate-500" />
                                Anonymous Partner
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-700">
                                {fb.partnerName} ({fb.partnerRole})
                              </span>
                            )}

                            {fb.isCriticalSafetyIssue && (
                              <span className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-white" />
                                Critical Safety Error
                              </span>
                            )}

                            <span className="text-xs text-slate-400 ml-auto">
                              {new Date(fb.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Ratings */}
                          <div className="flex items-center gap-6 my-3">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-slate-500 font-medium">Clarity:</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`w-3.5 h-3.5 ${
                                      star <= fb.clarityRating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-slate-500 font-medium">Relevance:</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`w-3.5 h-3.5 ${
                                      star <= fb.relevanceRating ? 'fill-emerald-500 text-emerald-600' : 'text-slate-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Disputed Question Link */}
                          {fb.disputedQuestionText && (
                            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 mb-3 flex items-start gap-2">
                              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold">Linked Quiz Question Dispute:</span> {fb.disputedQuestionText}
                              </div>
                            </div>
                          )}

                          {/* Comment Body */}
                          <p className={`text-sm text-slate-800 leading-relaxed ${isHidden ? 'italic text-slate-400 line-through' : ''}`}>
                            "{fb.commentText}"
                          </p>
                        </div>

                        {/* Admin Action Panel */}
                        <div className="flex flex-col items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
                          <div className="text-xs font-semibold text-slate-500 mb-1">Resolution Status</div>
                          
                          <select
                            value={fb.status}
                            onChange={(e) => handleUpdateStatus(fb.id, e.target.value as TrainingModuleFeedback['status'])}
                            className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="addressed_in_revision">Addressed in Revision</option>
                            <option value="dismissed">Dismissed</option>
                          </select>

                          {userRole === 'admin' && (
                            <button
                              onClick={() => handleToggleModeration(fb.id)}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mt-2"
                              title="Toggle public visibility moderation"
                            >
                              {isHidden ? (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-blue-600 font-medium">Unhide Comment</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Hide Comment</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SUBMIT MODULE FEEDBACK FORM */}
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <h3 className="text-lg font-bold text-slate-900">Submit Training Module Feedback</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Share ratings, point out content inaccuracies, or report safety issues directly to L&D authors
                </p>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                {/* Module Selector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Select Training Module
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.moduleTitle} ({m.version})</option>
                    ))}
                  </select>
                </div>

                {/* Rating Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {/* Clarity Rating */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Content Clarity Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setClarityRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${
                            star <= clarityRating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                          }`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">{clarityRating} / 5</span>
                    </div>
                  </div>

                  {/* Practical Relevance Rating */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Practical Relevance on Site
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRelevanceRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${
                            star <= relevanceRating ? 'fill-emerald-500 text-emerald-600' : 'text-slate-300'
                          }`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">{relevanceRating} / 5</span>
                    </div>
                  </div>
                </div>

                {/* Linked Quiz Question Dispute (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Linked Quiz Question Dispute (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Question 2 regarding 415V zero-voltage testing procedure..."
                    value={disputedQuestionText}
                    onChange={(e) => setDisputedQuestionText(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">If disputing a quiz answer or explanation, specify the question here.</p>
                </div>

                {/* Feedback Comment Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Feedback Comments & Detailed Observations <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what was helpful or what requires clarification/correction..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {/* Anonymous Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        Submit Anonymously
                      </span>
                      <p className="text-xs text-slate-500">Your name and partner ID will be hidden from public logs.</p>
                    </div>
                  </label>

                  <div className="border-t border-slate-200 pt-3">
                    {/* Critical Safety Issue Toggle */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCriticalSafetyIssue}
                        onChange={(e) => setIsCriticalSafetyIssue(e.target.checked)}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          Flag as Serious Content / Safety Error
                        </span>
                        <p className="text-xs text-red-600/80">
                          Raises elevated priority notification for immediate L&D Admin review.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-3"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};
