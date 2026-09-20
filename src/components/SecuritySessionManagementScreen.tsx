import React, { useState } from 'react';
import { 
  ShieldAlert, KeyRound, Smartphone, Laptop, AlertTriangle, 
  CheckCircle2, Lock, ArrowLeft, RefreshCw, XCircle, Sparkles, 
  Sliders, UserX, ShieldCheck, Clock, MapPin, Eye
} from 'lucide-react';
import { UserRole, RoleTwoFactorPolicy, ActiveUserSession, SecurityEventLog, PasswordPolicyConfig } from '../types';
import { DbManager } from '../lib/db';

interface SecuritySessionManagementScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
}

export const SecuritySessionManagementScreen: React.FC<SecuritySessionManagementScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack
}) => {
  const [twoFactorPolicies, setTwoFactorPolicies] = useState<RoleTwoFactorPolicy[]>(() => 
    DbManager.getRoleTwoFactorPolicies()
  );

  const [activeSessions, setActiveSessions] = useState<ActiveUserSession[]>(() => 
    DbManager.getActiveUserSessions()
  );

  const [securityLogs, setSecurityLogs] = useState<SecurityEventLog[]>(() => 
    DbManager.getSecurityEventLogs()
  );

  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicyConfig>(() => 
    DbManager.getPasswordPolicyConfig()
  );

  const [activeTab, setActiveTab] = useState<'sessions' | 'two_factor' | 'security_events' | 'password_policy'>('sessions');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Revoke session confirmation state
  const [sessionToRevoke, setSessionToRevoke] = useState<ActiveUserSession | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRevokeSession = () => {
    if (!sessionToRevoke) return;

    DbManager.revokeUserSession(sessionToRevoke.sessionId);
    setActiveSessions(DbManager.getActiveUserSessions());

    // Log security event for revocation
    const newEvt: SecurityEventLog = {
      eventId: `sec_evt_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      userId: sessionToRevoke.userId,
      userName: sessionToRevoke.userName,
      eventType: 'session_revoked',
      severity: 'warning',
      ipAddress: sessionToRevoke.ipAddress,
      details: `Active session on ${sessionToRevoke.deviceModel} was remotely terminated by Admin.`,
      resolvedStatus: 'investigated_cleared'
    };

    DbManager.saveSecurityEventLog(newEvt);
    setSecurityLogs(DbManager.getSecurityEventLogs());
    setSessionToRevoke(null);
    triggerToast('Active session remotely terminated immediately.');
  };

  const handleToggleTwoFactorEnforcement = (roleId: string) => {
    const updated = twoFactorPolicies.map(pol => {
      if (pol.roleId === roleId) {
        const nextMode: RoleTwoFactorPolicy['enforcementMode'] = 
          pol.enforcementMode === 'mandatory' ? 'optional' : pol.enforcementMode === 'optional' ? 'disabled' : 'mandatory';
        
        const updatedPol = { ...pol, enforcementMode: nextMode };
        DbManager.saveRoleTwoFactorPolicy(updatedPol);
        return updatedPol;
      }
      return pol;
    });

    setTwoFactorPolicies(updated);
    triggerToast('Role 2FA policy updated.');
  };

  const handleSavePasswordPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    DbManager.savePasswordPolicyConfig(passwordPolicy);
    triggerToast('Password & authentication policy saved.');
  };

  const handleClearSecurityEvent = (eventId: string) => {
    const updated = securityLogs.map(log => {
      if (log.eventId === eventId) {
        const updatedLog = { ...log, resolvedStatus: 'investigated_cleared' as const };
        DbManager.saveSecurityEventLog(updatedLog);
        return updatedLog;
      }
      return log;
    });

    setSecurityLogs(updated);
    triggerToast('Security alert marked as investigated & cleared.');
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
                <ShieldAlert className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'सुरक्षा और सत्र प्रबंधन' : currentLanguage === 'mr' ? 'सुरक्षा आणि सत्र व्यवस्थापन' : 'Security & Session Management'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                2FA Enforcement • Active Device Revocation • Threat Monitoring & Password Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Tab Controls */}
        <div className="flex border-b border-[var(--color-border)] space-x-4 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-3 px-1 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sessions' 
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Active Sessions ({activeSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('two_factor')}
            className={`pb-3 px-1 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'two_factor' 
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>2FA Policy per Role</span>
          </button>

          <button
            onClick={() => setActiveTab('security_events')}
            className={`pb-3 px-1 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'security_events' 
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Security Threat Events ({securityLogs.filter(l => l.resolvedStatus === 'unresolved').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('password_policy')}
            className={`pb-3 px-1 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'password_policy' 
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Password Rules</span>
          </button>
        </div>

        {/* Tab 1: Active User Sessions */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSessions.map(sess => (
                <div
                  key={sess.sessionId}
                  className={`bg-[var(--color-surface)] border rounded-2xl p-5 shadow-xs space-y-3 ${
                    sess.isSuspiciousLocation ? 'border-red-500/50 bg-red-500/5' : 'border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">{sess.userName}</h3>
                        <span className="text-[10px] font-mono bg-[var(--color-bg)] px-2 py-0.5 rounded text-[var(--color-text-secondary)] capitalize">
                          {sess.userRole}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[var(--color-text-secondary)] mt-0.5">
                        {sess.deviceModel} • {sess.browserOs}
                      </p>
                    </div>

                    {sess.isCurrentSession ? (
                      <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-xl text-[10px] font-bold font-mono">
                        This Device
                      </span>
                    ) : (
                      <button
                        onClick={() => setSessionToRevoke(sess)}
                        className="px-3 py-1.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>

                  <div className="text-xs font-mono space-y-1 bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                    <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                        {sess.locationCity}
                      </span>
                      <span>IP: {sess.ipAddress}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-secondary)] pt-1 border-t border-[var(--color-border)]">
                      <span>Logged in: {sess.loginTimestamp}</span>
                      <span>Active: {sess.lastActiveTimestamp}</span>
                    </div>
                  </div>

                  {sess.isSuspiciousLocation && (
                    <div className="text-[11px] text-red-700 dark:text-red-300 font-bold bg-red-500/10 p-2.5 rounded-xl border border-red-500/30 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>Flagged: Foreign VPN / Proxy login location detected!</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: 2FA Policy per Role */}
        {activeTab === 'two_factor' && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Two-Factor Authentication Enforcement Rules
            </h3>

            <div className="space-y-3">
              {twoFactorPolicies.map(pol => (
                <div key={pol.roleId} className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">{pol.roleName}</h4>
                    <p className="text-[11px] text-[var(--color-text-secondary)] font-mono mt-0.5">
                      Method: {pol.method.replace('_', ' ')} • Compliance: {pol.compliantUserCount}/{pol.userCount} active users
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleTwoFactorEnforcement(pol.roleId)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                      pol.enforcementMode === 'mandatory'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : pol.enforcementMode === 'optional'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                        : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                    }`}
                  >
                    Enforcement: {pol.enforcementMode.toUpperCase()}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Security Threat Events */}
        {activeTab === 'security_events' && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Security & Authentication Threat Event Audit Trail
            </h3>

            <div className="space-y-3">
              {securityLogs.map(log => {
                const isUnresolved = log.resolvedStatus === 'unresolved';

                return (
                  <div 
                    key={log.eventId}
                    className={`p-4 rounded-xl border space-y-2 text-xs font-mono ${
                      isUnresolved ? 'bg-red-500/5 border-red-500/40' : 'bg-[var(--color-bg)] border-[var(--color-border)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isUnresolved ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="font-bold text-[var(--color-text-primary)]">{log.userName}</span>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">({log.eventType.replace('_', ' ')})</span>
                      </div>

                      <span className="text-[11px] text-[var(--color-text-secondary)]">{log.timestamp}</span>
                    </div>

                    <p className="text-[11px] font-sans text-[var(--color-text-primary)]">{log.details}</p>

                    <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[10px]">
                      <span>IP Address: {log.ipAddress}</span>
                      {isUnresolved ? (
                        <button
                          onClick={() => handleClearSecurityEvent(log.eventId)}
                          className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Mark Investigated & Cleared
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold">Investigated & Cleared</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Password Policy Rules */}
        {activeTab === 'password_policy' && (
          <form onSubmit={handleSavePasswordPolicy} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Password Complexity & Lockout Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[var(--color-text-secondary)] font-bold mb-1">Minimum Password Length</label>
                <input
                  type="number"
                  min={8}
                  max={32}
                  value={passwordPolicy.minLength}
                  onChange={e => setPasswordPolicy({ ...passwordPolicy, minLength: Number(e.target.value) })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)] font-mono"
                />
              </div>

              <div>
                <label className="block text-[var(--color-text-secondary)] font-bold mb-1">Max Failed Attempts Before Lockout</label>
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={passwordPolicy.maxFailedAttemptsBeforeLockout}
                  onChange={e => setPasswordPolicy({ ...passwordPolicy, maxFailedAttemptsBeforeLockout: Number(e.target.value) })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)] font-mono"
                />
              </div>

              <div>
                <label className="block text-[var(--color-text-secondary)] font-bold mb-1">Mandatory Rotation Cadence (Days)</label>
                <input
                  type="number"
                  min={30}
                  max={365}
                  value={passwordPolicy.mandatoryRotationDays}
                  onChange={e => setPasswordPolicy({ ...passwordPolicy, mandatoryRotationDays: Number(e.target.value) })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)] font-mono"
                />
              </div>

              <div className="flex flex-col justify-center space-y-2 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passwordPolicy.requireUppercase}
                    onChange={e => setPasswordPolicy({ ...passwordPolicy, requireUppercase: e.target.checked })}
                    className="rounded text-[var(--color-accent-primary)]"
                  />
                  <span>Require Uppercase & Special Characters</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--color-border)] flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[var(--color-accent-primary)] text-white font-bold rounded-xl text-xs shadow-md hover:opacity-90 transition-all"
              >
                Save Password Policy
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Revoke Session Confirmation Modal */}
      {sessionToRevoke && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)]">
                Revoke Device Session?
              </h3>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)]">
              This will immediately terminate the session for <strong>{sessionToRevoke.userName}</strong> on <strong>{sessionToRevoke.deviceModel}</strong> ({sessionToRevoke.ipAddress}). The user will be required to re-authenticate.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setSessionToRevoke(null)}
                className="px-4 py-2 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeSession}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs shadow-md hover:opacity-90"
              >
                Confirm Remote Revocation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
