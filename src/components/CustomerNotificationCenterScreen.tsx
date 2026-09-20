import React, { useState } from 'react';
import { 
  Bell, Check, CheckCheck, Filter, ArrowLeft, Settings, 
  Clock, Sparkles, ExternalLink, ShieldCheck, MessageSquare, 
  CreditCard, Wrench, Calendar, Gift, Lock, Smartphone, Mail, PhoneCall
} from 'lucide-react';
import { UserRole, CustomerInAppNotification, CustomerNotificationPreferences } from '../types';
import { DbManager } from '../lib/db';

interface CustomerNotificationCenterScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const CustomerNotificationCenterScreen: React.FC<CustomerNotificationCenterScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  onBack,
  onNavigateTab
}) => {
  const [notifications, setNotifications] = useState<CustomerInAppNotification[]>(() => 
    DbManager.getCustomerNotifications(currentUserId)
  );

  const [prefs, setPrefs] = useState<CustomerNotificationPreferences>(() => 
    DbManager.getCustomerNotificationPreferences(currentUserId)
  );

  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const handleMarkAllRead = () => {
    DbManager.markAllNotificationsAsRead(currentUserId);
    setNotifications(DbManager.getCustomerNotifications(currentUserId));
    triggerToast('All notifications marked as read.');
  };

  const handleNotificationClick = (notif: CustomerInAppNotification) => {
    if (!notif.readStatus) {
      const updatedNotif = { ...notif, readStatus: true };
      DbManager.saveCustomerNotification(updatedNotif);
      setNotifications(DbManager.getCustomerNotifications(currentUserId));
    }

    if (onNavigateTab && notif.relatedScreenDeeplink) {
      onNavigateTab(notif.relatedScreenDeeplink);
    }
  };

  const handleTogglePref = (key: keyof CustomerNotificationPreferences) => {
    if (key === 'allowPaymentReminders') {
      triggerToast('Essential payment due reminders are transactional and cannot be disabled.');
      return;
    }

    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    DbManager.saveCustomerNotificationPreferences(updated);
    triggerToast('Notification preferences updated successfully.');
  };

  const filteredNotifications = notifications.filter(n => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'unread') return !n.readStatus;
    return n.category === categoryFilter;
  });

  const getCategoryIcon = (category: CustomerInAppNotification['category']) => {
    switch (category) {
      case 'milestone_update': return <Clock className="w-4 h-4 text-[var(--color-accent-primary)]" />;
      case 'payment_reminder': return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'amc_renewal': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'support_ticket': return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'promotional': return <Gift className="w-4 h-4 text-purple-600" />;
      default: return <Bell className="w-4 h-4 text-[var(--color-accent-primary)]" />;
    }
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
                <Bell className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'अधिसूचना केंद्र' : currentLanguage === 'mr' ? 'सूचना केंद्र' : 'Customer Notification Center'}
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-primary)] text-white text-[10px] font-mono font-bold">
                    {unreadCount} New
                  </span>
                )}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' ? 'सभी भुगतान अनुस्मारक, मील का पत्थर अपडेट और एएमसी अलर्ट एक ही स्थान पर' : 'Unified log of site updates, payment receipts, & AMC alerts'}
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                activeTab === 'notifications'
                  ? 'bg-[var(--color-accent-primary)] text-white border-transparent'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
              }`}
            >
              Alerts Log
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 ${
                activeTab === 'preferences'
                  ? 'bg-[var(--color-accent-primary)] text-white border-transparent'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Channels</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {activeTab === 'notifications' ? (
          <div className="space-y-4">
            
            {/* Filter & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-sm">
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                {[
                  { id: 'all', label: 'All Alerts' },
                  { id: 'unread', label: `Unread (${unreadCount})` },
                  { id: 'milestone_update', label: 'Milestones' },
                  { id: 'payment_reminder', label: 'Payments' },
                  { id: 'amc_renewal', label: 'AMC' },
                  { id: 'promotional', label: 'Rewards' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setCategoryFilter(f.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                      categoryFilter === f.id
                        ? 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]'
                        : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] text-xs font-bold rounded-xl flex items-center gap-1.5 self-end sm:self-auto"
                >
                  <CheckCheck className="w-4 h-4 text-[var(--color-accent-primary)]" />
                  <span>Mark All Read</span>
                </button>
              )}
            </div>

            {/* Notification Rows List */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Bell className="w-8 h-8 text-[var(--color-text-secondary)] mx-auto opacity-40" />
                  <p className="text-xs font-bold text-[var(--color-text-secondary)]">
                    No notifications found in this category filter.
                  </p>
                </div>
              ) : (
                filteredNotifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                      !notif.readStatus
                        ? 'bg-[var(--color-accent-primary)]/5 border-[var(--color-accent-primary)]/40 shadow-xs'
                        : 'bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/50'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex-shrink-0">
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-xs text-[var(--color-text-primary)] flex items-center gap-1.5">
                          <span>{notif.title}</span>
                          {!notif.readStatus && (
                            <span className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)]" />
                          )}
                        </h4>
                        <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                          {notif.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                        <span className={`px-2 py-0.5 rounded-md ${
                          notif.isTransactional ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300' : 'bg-purple-500/10 text-purple-800 dark:text-purple-300'
                        }`}>
                          {notif.isTransactional ? 'TRANS-ESSENTIAL' : 'OPTIONAL-INFO'}
                        </span>

                        <span className="text-[var(--color-accent-primary)] font-bold flex items-center gap-0.5 hover:underline">
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        ) : (
          /* Preference Settings Panel */
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-[var(--color-border)] pb-4">
              <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[var(--color-accent-primary)]" />
                Notification Channel Preferences
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Control how you receive milestone updates, receipts, and AMC alerts
              </p>
            </div>

            {/* Communication Channels */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[var(--color-text-primary)] block">Delivery Channels</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  onClick={() => handleTogglePref('whatsappEnabled')}
                  className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--color-accent-primary)]"
                >
                  <div className="flex items-center space-x-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <div>
                      <strong className="text-xs text-[var(--color-text-primary)] block">WhatsApp Updates</strong>
                      <span className="text-[10px] text-[var(--color-text-secondary)]">Direct site photos & invoices</span>
                    </div>
                  </div>
                  <input type="checkbox" checked={prefs.whatsappEnabled} readOnly className="accent-[var(--color-accent-primary)]" />
                </div>

                <div 
                  onClick={() => handleTogglePref('pushEnabled')}
                  className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--color-accent-primary)]"
                >
                  <div className="flex items-center space-x-2.5">
                    <Bell className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    <div>
                      <strong className="text-xs text-[var(--color-text-primary)] block">In-App Push Alerts</strong>
                      <span className="text-[10px] text-[var(--color-text-secondary)]">Real-time mobile notifications</span>
                    </div>
                  </div>
                  <input type="checkbox" checked={prefs.pushEnabled} readOnly className="accent-[var(--color-accent-primary)]" />
                </div>

                <div 
                  onClick={() => handleTogglePref('smsEnabled')}
                  className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--color-accent-primary)]"
                >
                  <div className="flex items-center space-x-2.5">
                    <PhoneCall className="w-4 h-4 text-blue-600" />
                    <div>
                      <strong className="text-xs text-[var(--color-text-primary)] block">SMS Notifications</strong>
                      <span className="text-[10px] text-[var(--color-text-secondary)]">Emergency & payment alerts</span>
                    </div>
                  </div>
                  <input type="checkbox" checked={prefs.smsEnabled} readOnly className="accent-[var(--color-accent-primary)]" />
                </div>

                <div 
                  onClick={() => handleTogglePref('emailEnabled')}
                  className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--color-accent-primary)]"
                >
                  <div className="flex items-center space-x-2.5">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <div>
                      <strong className="text-xs text-[var(--color-text-primary)] block">Email Statements</strong>
                      <span className="text-[10px] text-[var(--color-text-secondary)]">Monthly PDF statements & CADs</span>
                    </div>
                  </div>
                  <input type="checkbox" checked={prefs.emailEnabled} readOnly className="accent-[var(--color-accent-primary)]" />
                </div>
              </div>
            </div>

            {/* Category Categories */}
            <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
              <label className="text-xs font-bold text-[var(--color-text-primary)] block">Message Category Controls</label>

              <div className="space-y-2">
                <div className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between opacity-80">
                  <div>
                    <strong className="text-xs text-[var(--color-text-primary)] flex items-center gap-1.5">
                      <span>Essential Payment Reminders</span>
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                    </strong>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">Required transactional account notices (Cannot be disabled)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    LOCKED
                  </span>
                </div>

                <div 
                  onClick={() => handleTogglePref('allowMilestones')}
                  className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--color-accent-primary)]"
                >
                  <div>
                    <strong className="text-xs text-[var(--color-text-primary)] block">Installation Milestone Progress</strong>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">QC reports & stage photo completion alerts</span>
                  </div>
                  <input type="checkbox" checked={prefs.allowMilestones} readOnly className="accent-[var(--color-accent-primary)]" />
                </div>

                <div 
                  onClick={() => handleTogglePref('allowPromotional')}
                  className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--color-accent-primary)]"
                >
                  <div>
                    <strong className="text-xs text-[var(--color-text-primary)] block">Referral Rewards & Offers</strong>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">Loyalty bonuses & promotional offers</span>
                  </div>
                  <input type="checkbox" checked={prefs.allowPromotional} readOnly className="accent-[var(--color-accent-primary)]" />
                </div>
              </div>
            </div>

            {/* Compliance Note */}
            <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-secondary)] flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Preferences automatically update our Automated Communication Engine & TRAI DND Compliance Manager.</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
