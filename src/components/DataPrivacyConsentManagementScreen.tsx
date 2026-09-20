import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, Lock, Users, Clock, AlertTriangle, 
  CheckCircle2, Plus, ArrowLeft, RefreshCw, Eye, Sparkles, 
  Trash2, Scale, Download, ShieldAlert, FileSearch, Send
} from 'lucide-react';
import { UserRole, DataSubjectConsentRecord, DataSubjectRequest, DataRetentionCategoryConfig, PrivacyPolicyVersionRecord } from '../types';
import { DbManager } from '../lib/db';

interface DataPrivacyConsentManagementScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
}

export const DataPrivacyConsentManagementScreen: React.FC<DataPrivacyConsentManagementScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack
}) => {
  const [consentRecords] = useState<DataSubjectConsentRecord[]>(() => 
    DbManager.getDataSubjectConsentRecords()
  );

  const [subjectRequests, setSubjectRequests] = useState<DataSubjectRequest[]>(() => 
    DbManager.getDataSubjectRequests()
  );

  const [retentionConfigs, setRetentionConfigs] = useState<DataRetentionCategoryConfig[]>(() => 
    DbManager.getDataRetentionCategoryConfigs()
  );

  const [privacyVersions, setPrivacyVersions] = useState<PrivacyPolicyVersionRecord[]>(() => 
    DbManager.getPrivacyPolicyVersionRecords()
  );

  const [activeTab, setActiveTab] = useState<'subject_requests' | 'consent_ledger' | 'retention_policies' | 'policy_versions'>('subject_requests');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Request Form State
  const [showNewRequestModal, setShowNewRequestModal] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [newSubjectEmail, setNewSubjectEmail] = useState<string>('');
  const [newRequestType, setNewRequestType] = useState<DataSubjectRequest['requestType']>('data_erasure_deletion');
  const [newRequestDetails, setNewRequestDetails] = useState<string>('');

  // Selected Request Modal State
  const [selectedRequest, setSelectedRequest] = useState<DataSubjectRequest | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<DataSubjectRequest['status']>('completed');
  const [legalExemptionNote, setLegalExemptionNote] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !newSubjectEmail.trim()) {
      triggerToast('Please provide subject name and email.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const req: DataSubjectRequest = {
      requestId: `dsr_${Date.now()}`,
      subjectName: newSubjectName.trim(),
      subjectEmail: newSubjectEmail.trim(),
      subjectPhone: '+91 90000 00000',
      requestType: newRequestType,
      status: 'received',
      requestDetails: newRequestDetails.trim() || 'Data subject formal privacy request submitted.',
      receivedAt: today,
      responseDueDate: dueDate
    };

    DbManager.saveDataSubjectRequest(req);
    setSubjectRequests(DbManager.getDataSubjectRequests());
    setShowNewRequestModal(false);
    setNewSubjectName('');
    setNewSubjectEmail('');
    setNewRequestDetails('');
    triggerToast('Data subject request logged into compliance workflow.');
  };

  const handleResolveRequest = () => {
    if (!selectedRequest) return;

    const updated: DataSubjectRequest = {
      ...selectedRequest,
      status: resolutionStatus,
      legalRetentionExemptionNote: resolutionStatus === 'rejected_legal_retention' ? legalExemptionNote.trim() : undefined,
      resolvedAt: new Date().toISOString().split('T')[0]
    };

    DbManager.saveDataSubjectRequest(updated);
    setSubjectRequests(DbManager.getDataSubjectRequests());
    setSelectedRequest(null);
    triggerToast(`Data subject request status updated to ${resolutionStatus.replace('_', ' ')}.`);
  };

  const handleToggleAutoPurge = (categoryId: string) => {
    const updated = retentionConfigs.map(c => {
      if (c.categoryId === categoryId) {
        const nextState = !c.autoPurgeEnabled;
        const updatedCat = { ...c, autoPurgeEnabled: nextState };
        DbManager.saveDataRetentionCategoryConfig(updatedCat);
        return updatedCat;
      }
      return c;
    });

    setRetentionConfigs(updated);
    triggerToast('Data retention category auto-purge policy updated.');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)] border border-[var(--color-accent-primary)] text-[var(--color-text-primary)] px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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
                <Lock className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'डेटा गोपनीयता और सहमति प्रबंधन' : currentLanguage === 'mr' ? 'डेटा गोपनीयता आणि संमती व्यवस्थापन' : 'Data Privacy & Consent Management'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                DPDP Act 2023 Compliance • Subject Access Requests (SAR) • Data Retention & Purge
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNewRequestModal(true)}
            className="px-4 py-2 bg-[var(--color-accent-primary)] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Privacy Request</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--color-border)] space-x-4 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('subject_requests')}
            className={`pb-3 px-1 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'subject_requests' 
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>Data Subject Requests ({subjectRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('consent_ledger')}
            className={`pb-3 px-1 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'consent_ledger' 
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Consent Registry ({consentRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('retention_policies')}
            className={`pb-3 px-1 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'retention_policies' 
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Data Retention Rules ({retentionConfigs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policy_versions')}
            className={`pb-3 px-1 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'policy_versions' 
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Privacy Policy Versions</span>
          </button>
        </div>

        {/* Tab 1: Data Subject Requests */}
        {activeTab === 'subject_requests' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectRequests.map(req => {
                const isPending = req.status === 'received' || req.status === 'under_review';
                const isRejectedExempt = req.status === 'rejected_legal_retention';

                return (
                  <div
                    key={req.requestId}
                    className={`bg-[var(--color-surface)] border rounded-2xl p-5 shadow-xs space-y-3 ${
                      isPending ? 'border-amber-500/40' : 'border-[var(--color-border)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase bg-[var(--color-bg)] px-2 py-0.5 rounded text-[var(--color-text-secondary)]">
                          {req.requestType.replace(/_/g, ' ')}
                        </span>
                        <h3 className="font-serif font-bold text-sm text-[var(--color-text-primary)] mt-1">
                          {req.subjectName}
                        </h3>
                        <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                          {req.subjectEmail} • {req.subjectPhone}
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono ${
                        req.status === 'completed' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : isRejectedExempt ? 'bg-red-500/15 text-red-700 dark:text-red-300' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      }`}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-primary)] bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)] font-sans">
                      {req.requestDetails}
                    </p>

                    {req.legalRetentionExemptionNote && (
                      <div className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                        <span><strong>Legal Exemption Note:</strong> {req.legalRetentionExemptionNote}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-mono text-[var(--color-text-secondary)]">
                      <span>Received: {req.receivedAt}</span>
                      <span>SLA Due: {req.responseDueDate}</span>
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="text-[var(--color-accent-primary)] font-bold hover:underline"
                      >
                        Process Request &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Consent Registry */}
        {activeTab === 'consent_ledger' && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Centralized Data Subject Consent Registry
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-mono text-[11px]">
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-center">Marketing</th>
                    <th className="py-2.5 px-3 text-center">GPS Tracking</th>
                    <th className="py-2.5 px-3 text-center">Doc Processing</th>
                    <th className="py-2.5 px-3">Timestamp & IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {consentRecords.map(rec => (
                    <tr key={rec.subjectId} className="hover:bg-[var(--color-bg)] transition-colors">
                      <td className="py-3 px-3 font-bold text-[var(--color-text-primary)]">{rec.subjectName}</td>
                      <td className="py-3 px-3 capitalize font-mono text-[11px] text-[var(--color-text-secondary)]">{rec.subjectType}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rec.marketingOptIn ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-gray-500/10 text-gray-500'}`}>
                          {rec.marketingOptIn ? 'Opted In' : 'Opted Out'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rec.gpsTrackingConsent ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-gray-500/10 text-gray-500'}`}>
                          {rec.gpsTrackingConsent ? 'Granted' : 'Denied'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rec.documentProcessingConsent ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-gray-500/10 text-gray-500'}`}>
                          {rec.documentProcessingConsent ? 'Granted' : 'Denied'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[var(--color-text-secondary)]">
                        {rec.consentTimestamp}<br/>
                        <span className="text-[10px] opacity-75">{rec.ipAddress}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Retention Rules */}
        {activeTab === 'retention_policies' && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Statutory Data Retention & Auto-Purge Configurations
            </h3>

            <div className="space-y-3">
              {retentionConfigs.map(cat => (
                <div 
                  key={cat.categoryId}
                  className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">{cat.categoryName}</h4>
                    <p className="text-[11px] text-[var(--color-text-secondary)]"><strong>Legal Basis:</strong> {cat.legalBasis}</p>
                    <p className="text-[11px] font-mono text-[var(--color-accent-primary)] font-bold">
                      Mandatory Retention: {cat.retentionPeriodMonths} Months ({Math.round(cat.retentionPeriodMonths / 12)} Years) • {cat.totalRecordsAffected} active records
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleAutoPurge(cat.categoryId)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                      cat.autoPurgeEnabled 
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {cat.autoPurgeEnabled ? 'Auto-Purge Enabled' : 'Manual Retention Lock'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Privacy Policy Versions */}
        {activeTab === 'policy_versions' && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Published Privacy Policy Documents
            </h3>

            <div className="space-y-3">
              {privacyVersions.map(ver => (
                <div key={ver.versionId} className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[var(--color-text-primary)]">{ver.versionTag}</span>
                    <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">Effective: {ver.effectiveDate}</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">{ver.changesSummary}</p>
                  <div className="text-[10px] font-mono text-[var(--color-accent-primary)] font-bold">
                    Published by {ver.publishedBy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Log Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
              Log Data Subject Request (SAR / Erasure)
            </h3>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--color-text-secondary)] font-bold mb-1">Subject Full Name</label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Ramesh Kadam"
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--color-text-secondary)] font-bold mb-1">Subject Email</label>
                <input
                  type="email"
                  required
                  value={newSubjectEmail}
                  onChange={e => setNewSubjectEmail(e.target.value)}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--color-text-secondary)] font-bold mb-1">Request Type</label>
                <select
                  value={newRequestType}
                  onChange={e => setNewRequestType(e.target.value as any)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                >
                  <option value="data_erasure_deletion">Data Erasure / Right To Be Forgotten</option>
                  <option value="data_access">Subject Access Request (SAR - Copy of Data)</option>
                  <option value="data_rectification">Data Rectification / Correction</option>
                  <option value="consent_withdrawal">Withdrawal of Consent</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--color-text-secondary)] font-bold mb-1">Request Details & Notes</label>
                <textarea
                  rows={3}
                  value={newRequestDetails}
                  onChange={e => setNewRequestDetails(e.target.value)}
                  placeholder="Describe specific records requested or reasons..."
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-accent-primary)] text-white font-bold rounded-xl text-xs shadow-md hover:opacity-90"
                >
                  Log Privacy Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Request Processing Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
              Process Request: {selectedRequest.subjectName}
            </h3>

            <div className="space-y-3 text-xs font-sans">
              <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                <p><strong>Type:</strong> {selectedRequest.requestType.replace(/_/g, ' ')}</p>
                <p><strong>Received:</strong> {selectedRequest.receivedAt}</p>
                <p className="mt-1 text-[var(--color-text-secondary)]">{selectedRequest.requestDetails}</p>
              </div>

              <div>
                <label className="block text-[var(--color-text-secondary)] font-bold mb-1">Update Status</label>
                <select
                  value={resolutionStatus}
                  onChange={e => setResolutionStatus(e.target.value as any)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                >
                  <option value="under_review">Under Review</option>
                  <option value="completed">Completed / Fulfilled</option>
                  <option value="partially_fulfilled">Partially Fulfilled</option>
                  <option value="rejected_legal_retention">Rejected (Statutory Legal Retention Exemption)</option>
                </select>
              </div>

              {resolutionStatus === 'rejected_legal_retention' && (
                <div>
                  <label className="block text-amber-700 dark:text-amber-300 font-bold mb-1">Mandatory Statutory Exemption Reason</label>
                  <textarea
                    rows={3}
                    required
                    value={legalExemptionNote}
                    onChange={e => setLegalExemptionNote(e.target.value)}
                    placeholder="e.g. Invoices and GST tax payment records must be retained for 8 years under GST Act Section 36."
                    className="w-full bg-[var(--color-bg)] border border-amber-500/40 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
                >
                  Close
                </button>
                <button
                  onClick={handleResolveRequest}
                  className="px-4 py-2 bg-[var(--color-accent-primary)] text-white font-bold rounded-xl text-xs shadow-md hover:opacity-90"
                >
                  Save Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
