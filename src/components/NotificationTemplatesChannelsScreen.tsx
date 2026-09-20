import React, { useState } from 'react';
import { 
  BellRing, Send, AlertTriangle, Shield, Smartphone, Mail, MessageSquare, 
  CheckCircle2, ArrowLeft, RefreshCw, Sparkles, Filter, Edit3, Save, 
  Layers, Users, Sliders, Play
} from 'lucide-react';
import { UserRole, InternalNotificationTemplate } from '../types';
import { DbManager } from '../lib/db';

interface NotificationTemplatesChannelsScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const NotificationTemplatesChannelsScreen: React.FC<NotificationTemplatesChannelsScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack,
  onNavigateTab
}) => {
  const [templates, setTemplates] = useState<InternalNotificationTemplate[]>(() => 
    DbManager.getInternalNotificationTemplates()
  );

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<InternalNotificationTemplate | null>(null);
  const [testSendModalTemplate, setTestSendModalTemplate] = useState<InternalNotificationTemplate | null>(null);

  // Test Send state
  const [testChannel, setTestChannel] = useState<'inAppPush' | 'sms' | 'email' | 'whatsapp'>('inAppPush');
  const [testTargetContact, setTestTargetContact] = useState<string>('+91 98765 43210');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleChannel = (templateId: string, channelKey: keyof InternalNotificationTemplate['channels']) => {
    const updated = templates.map(t => {
      if (t.id === templateId) {
        const nextChannels = {
          ...t.channels,
          [channelKey]: !t.channels[channelKey]
        };
        const nextTpl = { ...t, channels: nextChannels };
        DbManager.saveInternalNotificationTemplate(nextTpl);
        return nextTpl;
      }
      return t;
    });
    setTemplates(updated);
    triggerToast('Channel configuration updated & saved.');
  };

  const handleToggleActive = (templateId: string) => {
    const updated = templates.map(t => {
      if (t.id === templateId) {
        const nextTpl = { ...t, isActive: !t.isActive };
        DbManager.saveInternalNotificationTemplate(nextTpl);
        return nextTpl;
      }
      return t;
    });
    setTemplates(updated);
    triggerToast('Notification status updated.');
  };

  const handleSaveEditTemplate = () => {
    if (!selectedTemplateForEdit) return;
    DbManager.saveInternalNotificationTemplate(selectedTemplateForEdit);
    setTemplates(DbManager.getInternalNotificationTemplates());
    triggerToast(`Template "${selectedTemplateForEdit.title}" saved successfully!`);
    setSelectedTemplateForEdit(null);
  };

  const handleExecuteTestSend = () => {
    if (!testSendModalTemplate) return;
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      triggerToast(`Test notification successfully rendered & sent via ${testChannel.toUpperCase()} to ${testTargetContact}!`);
      setTestSendModalTemplate(null);
    }, 800);
  };

  const filteredTemplates = templates.filter(t => {
    if (categoryFilter === 'all') return true;
    return t.category === categoryFilter;
  });

  const getUrgencyBadge = (urgency: InternalNotificationTemplate['urgencyTag']) => {
    switch (urgency) {
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20">CRITICAL (All Channels)</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">HIGH URGENCY</span>;
      case 'normal':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">NORMAL ROUTINE</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20">LOW PRIORITY</span>;
    }
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

      {/* Navigation Header */}
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
                <BellRing className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'आंतरिक अधिसूचना टेम्प्लेट व चैनल' : currentLanguage === 'mr' ? 'अंतर्गत सूचना टम्प्लेट्स आणि चॅनेल्स' : 'Internal Notification Templates & Channels'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Staff & Admin operational alerts configuration • Structurally separated from customer marketing library
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Informational Callout */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm flex items-start space-x-3 text-xs text-[var(--color-text-secondary)]">
          <Shield className="w-5 h-5 text-[var(--color-accent-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--color-text-primary)] block font-serif text-sm mb-0.5">
              Strict Governance Boundary
            </strong>
            Internal operational notifications (SOS, payout failures, delivery halts) are kept isolated from external customer drip marketing. Critical urgency items automatically broadcast through multi-channel redundancy.
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-bold text-[var(--color-text-primary)]">
            <Filter className="w-4 h-4 text-[var(--color-accent-primary)]" />
            <span>Category Filter:</span>
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
            {['all', 'sos_alert', 'payout_failure', 'delivery_delay', 'new_lead', 'site_issue'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-[var(--color-accent-primary)] text-white border-transparent shadow-xs'
                    : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                }`}
              >
                {cat === 'all' ? 'All Alerts' : cat.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Templates Grid */}
        <div className="space-y-4">
          {filteredTemplates.map(tpl => (
            <div 
              key={tpl.id}
              className={`bg-[var(--color-surface)] border rounded-2xl p-5 shadow-sm space-y-4 transition-all ${
                tpl.isActive ? 'border-[var(--color-border)]' : 'border-gray-500/30 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {getUrgencyBadge(tpl.urgencyTag)}
                    <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
                      {tpl.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                    Type ID: <strong className="text-[var(--color-accent-primary)]">{tpl.notificationTypeId}</strong> • Target Roles: {tpl.recipientRoles.join(', ').toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTestSendModalTemplate(tpl)}
                    className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-xs font-bold text-[var(--color-accent-primary)] rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Test Send</span>
                  </button>

                  <button
                    onClick={() => setSelectedTemplateForEdit(tpl)}
                    className="p-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-xl transition-all"
                    title="Edit Template"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleActive(tpl.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      tpl.isActive 
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
                        : 'bg-gray-500/10 text-gray-600 border-gray-500/30'
                    }`}
                  >
                    {tpl.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Template Content Preview */}
              <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs font-mono text-[var(--color-text-primary)] leading-relaxed">
                {tpl.templateContent}
              </div>

              {/* Channels Configuration Matrix & Frequency Warning */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-[var(--color-text-secondary)]">Dispatched Via:</span>

                  <button
                    onClick={() => handleToggleChannel(tpl.id, 'inAppPush')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      tpl.channels.inAppPush 
                        ? 'bg-[var(--color-accent-primary)] text-white border-transparent' 
                        : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>In-App Push</span>
                  </button>

                  <button
                    onClick={() => handleToggleChannel(tpl.id, 'sms')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      tpl.channels.sms 
                        ? 'bg-[var(--color-accent-primary)] text-white border-transparent' 
                        : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>SMS</span>
                  </button>

                  <button
                    onClick={() => handleToggleChannel(tpl.id, 'email')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      tpl.channels.email 
                        ? 'bg-[var(--color-accent-primary)] text-white border-transparent' 
                        : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>

                  <button
                    onClick={() => handleToggleChannel(tpl.id, 'whatsapp')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      tpl.channels.whatsapp 
                        ? 'bg-emerald-600 text-white border-transparent' 
                        : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                <div className="text-right text-[10px] font-mono text-[var(--color-text-secondary)] flex items-center gap-2 justify-end">
                  <span>Trigger Frequency: <strong>{tpl.monthlyTriggerCount} / month</strong></span>
                  {tpl.monthlyTriggerCount > 50 && tpl.urgencyTag === 'critical' && (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> High Frequency Fatigue Risk
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Edit Template Modal */}
      {selectedTemplateForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
              Edit Notification Template
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Notification Title</label>
                <input
                  type="text"
                  value={selectedTemplateForEdit.title}
                  onChange={e => setSelectedTemplateForEdit({ ...selectedTemplateForEdit, title: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Urgency Level</label>
                <select
                  value={selectedTemplateForEdit.urgencyTag}
                  onChange={e => setSelectedTemplateForEdit({ ...selectedTemplateForEdit, urgencyTag: e.target.value as any })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                >
                  <option value="critical">CRITICAL (Multi-Channel Redundant Broadcast)</option>
                  <option value="high">HIGH URGENCY</option>
                  <option value="normal">NORMAL ROUTINE</option>
                  <option value="low">LOW PRIORITY</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Template Content Syntax</label>
                <textarea
                  rows={4}
                  value={selectedTemplateForEdit.templateContent}
                  onChange={e => setSelectedTemplateForEdit({ ...selectedTemplateForEdit, templateContent: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[var(--color-border)]">
              <button
                onClick={() => setSelectedTemplateForEdit(null)}
                className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditTemplate}
                className="px-5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Send Modal */}
      {testSendModalTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
              <Send className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Dispatch Dry-Run Test Notification
            </h3>

            <p className="text-xs text-[var(--color-text-secondary)]">
              Testing template: <strong className="text-[var(--color-text-primary)]">{testSendModalTemplate.title}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Target Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['inAppPush', 'sms', 'email', 'whatsapp'] as const).map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setTestChannel(ch)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        testChannel === ch
                          ? 'bg-[var(--color-accent-primary)] text-white border-transparent'
                          : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                      }`}
                    >
                      {ch.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Target Contact (Phone / Email)</label>
                <input
                  type="text"
                  value={testTargetContact}
                  onChange={e => setTestTargetContact(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[var(--color-border)]">
              <button
                onClick={() => setTestSendModalTemplate(null)}
                className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteTestSend}
                disabled={isSendingTest}
                className="px-5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                {isSendingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Send Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
