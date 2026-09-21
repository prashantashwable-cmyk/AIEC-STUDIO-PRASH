import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, Phone, Shield, Check, CheckCircle2, Clock, User as UserIcon, MapPin, 
  X, AlertCircle, Radio, FileText, Send, ArrowRight, Search, Filter, 
  Volume2, VolumeX, ShieldAlert, History, HelpCircle, PhoneCall
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { EmergencyAlert, User, EscalationStatus } from '../types';

interface EmergencyEscalationAlertProps {
  user: User;
}

export function EmergencyEscalationAlert({ user }: EmergencyEscalationAlertProps) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'site_accident' | 'safety_concern' | 'aggressive_customer' | 'vehicle_breakdown'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'acknowledged' | 'resolved' | 'cancelled'>('all');
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  
  // Resolution Modal State
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [resolutionError, setResolutionError] = useState('');

  // Audio/Siren Alarm sound simulation state
  const [isSirenMuted, setIsSirenMuted] = useState(false);

  // Field SOS Simulator State
  const [simStaffId, setSimStaffId] = useState('amit_sharma');
  const [simAlertType, setSimAlertType] = useState<'site_accident' | 'safety_concern' | 'aggressive_customer' | 'vehicle_breakdown'>('site_accident');
  const [simLocation, setSimLocation] = useState('Deshmukh Plaza, Erandwane, Pune');
  const [simLat, setSimLat] = useState(18.5115);
  const [simLng, setSimLng] = useState(73.8340);
  
  // Local active countdowns for simulated SOS attempts (accident cancel window of 10s)
  const [simActiveCountdowns, setSimActiveCountdowns] = useState<{
    id: string;
    staffName: string;
    alertType: string;
    timeLeft: number;
  }[]>([]);

  // Configurable unacknowledged escalation timeout (seconds)
  const [unacknowledgedTimeout, setUnacknowledgedTimeout] = useState(15);

  // Toast notifications for the alert logs
  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'success' | 'info' | 'error' }[]>([]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToasts(prev => [...prev, { id: `toast_${Date.now()}_${Math.random()}`, text, type }]);
  };

  // Synchronize alerts with database
  const loadAlerts = () => {
    setAlerts(DbManager.getEmergencyAlerts());
  };

  useEffect(() => {
    loadAlerts();
    const handleDbUpdate = () => loadAlerts();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, []);

  // Timers: 1. Accident cancel countdown ticks, 2. Backup escalation timeouts
  useEffect(() => {
    const interval = setInterval(() => {
      // Tick 10-second cancel countdowns
      setSimActiveCountdowns(prev => {
        const updated = prev.map(c => ({ ...c, timeLeft: c.timeLeft - 1 }));
        
        // Find those that just completed (reached 0) and trigger the full alert
        const completed = updated.filter(c => c.timeLeft <= 0);
        completed.forEach(c => {
          // Fully commit the alert in DB
          const newId = c.id;
          const staffObj = DbManager.getUsers().find(u => u.id === simStaffId) || {
            name: c.staffName,
            phone: '+91 99000 11222',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            role: 'surveyor'
          };

          const fullAlert: EmergencyAlert = {
            id: newId,
            staffId: simStaffId,
            staffName: staffObj.name,
            staffRole: (staffObj.role === 'technician' ? 'technician' : 'surveyor'),
            staffPhone: staffObj.phone,
            staffAvatarUrl: staffObj.avatarUrl,
            alertType: c.alertType as any,
            alertLocation: simLocation,
            lat: simLat,
            lng: simLng,
            escalationStatus: 'received',
            receivedAt: new Date().toISOString(),
            isArchived: false,
          };

          DbManager.addEmergencyAlert(fullAlert);
          showToast(`🚨 SOS CONFIRMED: ${staffObj.name} is reporting a ${c.alertType.replace('_', ' ')}!`, 'error');
          
          // Auto select it so admin sees it front & center
          setSelectedAlert(fullAlert);
        });

        return updated.filter(c => c.timeLeft > 0);
      });

      // Check active alerts for unacknowledged timeout
      setAlerts(currentAlerts => {
        let changed = false;
        const nextAlerts = currentAlerts.map(a => {
          if (a.escalationStatus === 'received' && !a.escalatedToBackupAt) {
            const secsElapsed = Math.floor((Date.now() - new Date(a.receivedAt).getTime()) / 1000);
            if (secsElapsed >= unacknowledgedTimeout) {
              changed = true;
              showToast(`⚠️ Backup Escalation: Alert ${a.id} unacknowledged. SMS dispatched to backup director!`, 'info');
              return {
                ...a,
                escalatedToBackupAt: new Date().toISOString()
              };
            }
          }
          return a;
        });

        if (changed) {
          // Update in DB
          nextAlerts.forEach(a => {
            const original = DbManager.getEmergencyAlertById(a.id);
            if (original && original.escalationStatus === 'received' && !original.escalatedToBackupAt) {
              DbManager.updateEmergencyAlert(a);
            }
          });
          return nextAlerts;
        }
        return currentAlerts;
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [simStaffId, simLocation, simLat, simLng, unacknowledgedTimeout]);

  // Handle manual SOS simulation trigger
  const handleTriggerSimulatedSOS = () => {
    const staff = DbManager.getUsers().find(u => u.id === simStaffId) || { name: 'Field Operator', role: 'surveyor' };
    const tempId = `sim_alert_${Date.now()}`;
    
    // Add to cancel countdowns first (accidental cancel window)
    setSimActiveCountdowns(prev => [
      ...prev,
      {
        id: tempId,
        staffName: staff.name,
        alertType: simAlertType,
        timeLeft: 10
      }
    ]);

    showToast(`⏳ Accident Prevention Window: 10s for ${staff.name} to cancel accidental trigger...`, 'info');
  };

  // Simulate staff member cancelling SOS on their end
  const handleSimulateStaffCancel = (id: string, staffName: string) => {
    setSimActiveCountdowns(prev => prev.filter(c => c.id !== id));
    
    // Log attempt anyway for audit
    const loggedAttempt: EmergencyAlert = {
      id: `cancelled_${id}`,
      staffId: simStaffId,
      staffName: staffName,
      staffRole: 'surveyor',
      staffPhone: '+91 98765 43211',
      alertType: simAlertType,
      alertLocation: simLocation,
      lat: simLat,
      lng: simLng,
      escalationStatus: 'resolved',
      receivedAt: new Date().toISOString(),
      cancelledAt: new Date().toISOString(),
      resolutionNote: 'SYSTEM LOG: SOS triggered accidentally. Cancelled by field staff within the 10-second safety window.',
      isArchived: true,
    };
    
    DbManager.addEmergencyAlert(loggedAttempt);
    showToast(`✓ SOS Cancelled by ${staffName}. Incident archived & logged as accidental.`, 'success');
  };

  // Acknowledge Alert
  const handleAcknowledgeAlert = (alert: EmergencyAlert) => {
    const updated: EmergencyAlert = {
      ...alert,
      escalationStatus: 'acknowledged',
      acknowledgedAt: new Date().toISOString()
    };
    DbManager.updateEmergencyAlert(updated);
    setSelectedAlert(updated);
    showToast(`✓ Alert ${alert.id} Acknowledged. Dispatching emergency response protocols.`, 'success');
  };

  // Resolve Alert (Requires note)
  const handleOpenResolveModal = (alert: EmergencyAlert) => {
    setSelectedAlert(alert);
    setResolutionText('');
    setResolutionError('');
    setShowResolutionModal(true);
  };

  const handleResolveAlertSubmit = () => {
    if (!selectedAlert) return;
    if (resolutionText.trim().length < 10) {
      setResolutionError('An explicit resolution note is required (min 10 characters).');
      return;
    }

    const updated: EmergencyAlert = {
      ...selectedAlert,
      escalationStatus: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolutionNote: resolutionText,
      isArchived: true
    };

    DbManager.updateEmergencyAlert(updated);
    setSelectedAlert(updated);
    setShowResolutionModal(false);
    showToast(`✓ Incident ${selectedAlert.id} successfully resolved and archived permanent log.`, 'success');
  };

  // Check for clusters (Multiple SOS signals fire from the same small area simultaneously)
  const findClusters = () => {
    const activeAlerts = alerts.filter(a => a.escalationStatus !== 'resolved');
    const clusters: { name: string; alerts: EmergencyAlert[]; lat: number; lng: number }[] = [];

    activeAlerts.forEach(alert => {
      // Find if there is a cluster nearby (within ~5km distance threshold)
      const threshold = 0.05; 
      const existingCluster = clusters.find(c => {
        const latDiff = Math.abs(c.lat - alert.lat);
        const lngDiff = Math.abs(c.lng - alert.lng);
        return latDiff < threshold && lngDiff < threshold;
      });

      if (existingCluster) {
        existingCluster.alerts.push(alert);
      } else {
        clusters.push({
          name: alert.alertLocation.split(',').slice(0, 2).join(','),
          lat: alert.lat,
          lng: alert.lng,
          alerts: [alert]
        });
      }
    });

    return clusters.filter(c => c.alerts.length >= 2);
  };

  const activeClusters = findClusters();

  // Progress Bar Calculation (Requirement: Show each time current % progress bar & total % progress bar)
  // Current Active Alert Resolution progress (Acknowledged or Resolved divided by total Active)
  const activeAlertsCount = alerts.filter(a => !a.isArchived).length;
  const activeAcknowledgedCount = alerts.filter(a => !a.isArchived && a.escalationStatus === 'acknowledged').length;
  const currentResolutionProgress = activeAlertsCount > 0 
    ? Math.round((activeAcknowledgedCount / activeAlertsCount) * 100) 
    : 100;

  // Total Historical Safety Index (Total Resolved/Archived alerts divided by all alerts logged)
  const totalAlertsCount = alerts.length;
  const totalResolvedCount = alerts.filter(a => a.escalationStatus === 'resolved').length;
  const totalSystemProgress = totalAlertsCount > 0 
    ? Math.round((totalResolvedCount / totalAlertsCount) * 100) 
    : 100;

  // Search & Filter Alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.alertLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || alert.alertType === typeFilter;
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'cancelled' ? alert.cancelledAt !== undefined :
      statusFilter === 'resolved' ? alert.escalationStatus === 'resolved' && !alert.cancelledAt :
      alert.escalationStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'site_accident':
        return <ShieldAlert className="w-5 h-5 text-[#B23B3B]" />;
      case 'safety_concern':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'aggressive_customer':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'vehicle_breakdown':
        return <AlertCircle className="w-5 h-5 text-[#B8873D]" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'site_accident':
        return 'bg-[#B23B3B]/10 text-[#B23B3B] border-[#B23B3B]/20';
      case 'safety_concern':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'aggressive_customer':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'vehicle_breakdown':
        return 'bg-antiquegold/10 text-[#B8873D] border-antiquegold/20';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP METRIC STRIP & PROGRESS BARS (Satisfying progress bar requirements) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CURRENT INCIDENT RESOLUTION PROGRESS BAR */}
        <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.15)] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#B23B3B]/10 text-[#B23B3B]">
                <Radio className="w-4 h-4 animate-pulse" />
              </span>
              <h4 className="font-serif text-sm font-bold text-charcoal">Current Dispatch & Acknowledge Index</h4>
            </div>
            <span className="font-mono text-xs font-bold text-[#B8873D]">{currentResolutionProgress}%</span>
          </div>
          
          {/* Progress Bar Graphic */}
          <div className="w-full bg-[#F8F6F1] h-2.5 rounded-full overflow-hidden border border-[rgba(184,135,61,0.08)]">
            <div 
              className="bg-[#B23B3B] h-full transition-all duration-700 ease-out rounded-full"
              style={{ width: `${currentResolutionProgress}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] text-warmgray">Active SOS Under Active Response Logs</span>
            <span className="font-mono text-[10px] font-semibold text-charcoal">
              {activeAcknowledgedCount}/{activeAlertsCount} Acked
            </span>
          </div>
        </div>

        {/* TOTAL SYSTEM SAFETY RESOLUTION INDEX */}
        <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.15)] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-royalemerald/10 text-royalemerald">
                <Shield className="w-4 h-4" />
              </span>
              <h4 className="font-serif text-sm font-bold text-charcoal">Total System Safety SOP Index</h4>
            </div>
            <span className="font-mono text-xs font-bold text-[#0E4B3D]">{totalSystemProgress}%</span>
          </div>
          
          {/* Progress Bar Graphic */}
          <div className="w-full bg-[#F8F6F1] h-2.5 rounded-full overflow-hidden border border-[rgba(184,135,61,0.08)]">
            <div 
              className="bg-[#0E4B3D] h-full transition-all duration-700 ease-out rounded-full"
              style={{ width: `${totalSystemProgress}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] text-warmgray">Historical permanent resolution audit logs</span>
            <span className="font-mono text-[10px] font-semibold text-charcoal">
              {totalResolvedCount}/{totalAlertsCount} Closed
            </span>
          </div>
        </div>

      </div>

      {/* 2. MAJOR DISASTER CLUSTERS WARNING BLOCK */}
      {activeClusters.length > 0 && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 bg-[#B23B3B]/10 border-2 border-dashed border-[#B23B3B]/50 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          <div className="flex gap-3">
            <div className="p-3 bg-[#B23B3B]/20 text-[#B23B3B] rounded-xl animate-bounce">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-[#B23B3B] flex items-center gap-2">
                CRITICAL HAZARD: Multi-SOS Proximity Cluster Detected
              </h3>
              <p className="text-xs text-charcoal leading-relaxed max-w-2xl">
                Multiple field agents have fired active distress calls from the same geographic area (<span className="font-bold">{activeClusters[0].name}</span>). This indicates a possible site-wide emergency, power grid compromise, or collective elevator accident. Deploy mass emergency transport protocols immediately.
              </p>
            </div>
          </div>
          <div className="font-mono text-xs bg-white text-[#B23B3B] border border-[#B23B3B]/20 px-3 py-1.5 rounded-xl font-bold">
            {activeClusters[0].alerts.length} ACTIVE PERSONNEL CALLS
          </div>
        </motion.div>
      )}

      {/* 3. SIMULATOR PANEL & INTERACTIVE ACCIDENT DELAY LOG */}
      <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.15)] p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5dfd4] pb-3">
          <div>
            <h3 className="font-serif text-sm font-bold text-charcoal flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-antiquegold animate-pulse" />
              <span>Field SOS Dispatch Simulator (Demonstrate Emergency Pipeline)</span>
            </h3>
            <p className="text-[11px] text-warmgray">Simulate field staff reporting site crises and demonstrate the 10s accident mitigation delay.</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-warmgray">Backup Timeout:</span>
            <input 
              type="number" 
              value={unacknowledgedTimeout} 
              onChange={e => setUnacknowledgedTimeout(Math.max(5, parseInt(e.target.value) || 15))}
              className="w-12 p-1 border border-[rgba(184,135,61,0.2)] rounded text-center bg-alabaster font-bold text-charcoal"
              title="Time in seconds before SMS escalates to backup number"
            />
            <span className="text-warmgray">secs</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-warmgray uppercase mb-1">Select Field Staff</label>
            <select 
              value={simStaffId}
              onChange={e => {
                setSimStaffId(e.target.value);
                // Assign matching lat/lng coords based on selected staff member
                if (e.target.value === 'amit_sharma') {
                  setSimLat(18.5112); setSimLng(73.8344);
                  setSimLocation('Shanti Niwas, Erandwane, Pune');
                } else if (e.target.value === 'sanjay_deshmukh') {
                  setSimLat(18.5074); setSimLng(73.8077);
                  setSimLocation('Plot 45, Deshmukh Arcade, Kothrud, Pune');
                } else {
                  setSimLat(18.5913); setSimLng(73.7389);
                  setSimLocation('Survey No. 62, Hinjewadi Phase 1, Pune');
                }
              }}
              className="w-full text-xs p-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-charcoal focus:outline-none focus:border-antiquegold font-medium"
            >
              <option value="amit_sharma">Amit Sharma (Surveyor - Pune West)</option>
              <option value="sanjay_deshmukh">Sanjay Deshmukh (Surveyor - Pune South)</option>
              <option value="rajesh_patel">Rajesh Patel (Technician - Hinjewadi)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-warmgray uppercase mb-1">SOS Alert Category</label>
            <select 
              value={simAlertType}
              onChange={e => setSimAlertType(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-charcoal focus:outline-none focus:border-antiquegold font-medium"
            >
              <option value="site_accident">🚨 Site Shaft Accident</option>
              <option value="safety_concern">⚠️ High Risk Structural Concern</option>
              <option value="aggressive_customer">😤 Client Conflict / Threat</option>
              <option value="vehicle_breakdown">🚚 Logistics / Vehicle Breakdown</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-warmgray uppercase mb-1">Current Geolocation Node</label>
            <input 
              type="text" 
              value={simLocation}
              onChange={e => setSimLocation(e.target.value)}
              className="w-full text-xs p-2.5 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-charcoal focus:outline-none font-medium"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTriggerSimulatedSOS}
              className="w-full py-2.5 bg-[#B23B3B] hover:bg-[#922A2A] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-ping" />
              <span>Broadcast SOS Signal</span>
            </button>
          </div>
        </div>

        {/* ACTIVE TIMERS / ACCIDENTAL CANCEL WINDOWS */}
        {simActiveCountdowns.length > 0 && (
          <div className="bg-[#F8F6F1] border border-[rgba(184,135,61,0.15)] p-3 rounded-xl space-y-2 text-left">
            <h4 className="text-xs font-bold text-[#B8873D] flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Accidental SOS Cancel Buffer Area (Active 10-Second Windows)</span>
            </h4>
            <div className="space-y-2">
              {simActiveCountdowns.map(c => (
                <div key={c.id} className="bg-white p-3 rounded-lg border border-[rgba(184,135,61,0.1)] flex items-center justify-between gap-3 shadow-xs">
                  <div>
                    <p className="text-xs font-bold text-charcoal">
                      {c.staffName} is triggering SOS: <span className="text-[#B23B3B] font-serif uppercase text-[10px] border border-[#B23B3B]/20 bg-[#B23B3B]/5 px-1.5 py-0.5 rounded ml-1">{c.alertType.replace('_', ' ')}</span>
                    </p>
                    <p className="text-[10px] text-warmgray mt-0.5">Allowing 10s for accidental double-tap cancellation before broadcasting to Admin Command Center.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs bg-[#B23B3B] text-white px-2.5 py-1 rounded font-black animate-pulse">
                      {c.timeLeft}s
                    </span>
                    <button
                      onClick={() => handleSimulateStaffCancel(c.id, c.staffName)}
                      className="px-2.5 py-1 text-[10px] font-bold text-royalemerald hover:bg-royalemerald/10 border border-royalemerald/25 rounded-lg transition-colors cursor-pointer"
                    >
                      Dismiss Accidental
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. TABS, SEARCH, AND FILTERING BAR */}
      <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.12)] p-4 shadow-xs text-left space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 bg-[#F8F6F1] p-1 rounded-xl border border-[rgba(184,135,61,0.08)]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-charcoal shadow-xs' : 'text-warmgray hover:text-charcoal'
              }`}
            >
              All Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setStatusFilter('received')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                statusFilter === 'received' ? 'bg-[#B23B3B] text-white shadow-xs' : 'text-warmgray hover:text-charcoal'
              }`}
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              <span>Unacknowledged ({alerts.filter(a => a.escalationStatus === 'received').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('acknowledged')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'acknowledged' ? 'bg-antiquegold text-white shadow-xs' : 'text-warmgray hover:text-charcoal'
              }`}
            >
              Acknowledged ({alerts.filter(a => a.escalationStatus === 'acknowledged').length})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'resolved' ? 'bg-royalemerald text-white shadow-xs' : 'text-warmgray hover:text-charcoal'
              }`}
            >
              Resolved ({alerts.filter(a => a.escalationStatus === 'resolved' && !a.cancelledAt).length})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'cancelled' ? 'bg-gray-300 text-charcoal shadow-xs' : 'text-warmgray hover:text-charcoal'
              }`}
            >
              Accidental ({alerts.filter(a => a.cancelledAt).length})
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsSirenMuted(!isSirenMuted)}
              className={`p-2 rounded-xl border border-[rgba(184,135,61,0.15)] flex items-center justify-center cursor-pointer transition-all ${
                isSirenMuted ? 'bg-[#B23B3B]/10 text-[#B23B3B]' : 'bg-alabaster text-warmgray'
              }`}
              title={isSirenMuted ? "Alarm siren muted" : "Alarm siren enabled"}
            >
              {isSirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#B23B3B] animate-pulse" />}
            </button>
          </div>

        </div>

        {/* Search Input and Type Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray" />
            <input
              type="text"
              placeholder="Search alert ID, staff name, or building location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-[#F8F6F1] border border-[rgba(184,135,61,0.12)] rounded-xl focus:outline-none focus:border-antiquegold text-charcoal"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-[#F8F6F1] border border-[rgba(184,135,61,0.12)] rounded-xl text-charcoal focus:outline-none focus:border-antiquegold font-medium"
            >
              <option value="all">All Alert Types</option>
              <option value="site_accident">🚨 Site Shaft Accident</option>
              <option value="safety_concern">⚠️ Safety Concern</option>
              <option value="aggressive_customer">😤 Aggressive Customer</option>
              <option value="vehicle_breakdown">🚚 Vehicle Breakdown</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. MAIN CONTENT SPLIT LIST / DETAIL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Escalation List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.12)] p-8 text-center space-y-3">
              <Shield className="w-10 h-10 text-royalemerald/40 mx-auto" />
              <div>
                <h4 className="font-serif text-sm font-bold text-charcoal">All Channels Quiet</h4>
                <p className="text-xs text-warmgray">There are currently no elevator safety alarms matching your criteria. Outstanding safety status: 100% stable.</p>
              </div>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isSelected = selectedAlert?.id === alert.id;
              const isUnacknowledged = alert.escalationStatus === 'received';
              
              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 rounded-2xl border transition-all text-left cursor-pointer relative overflow-hidden ${
                    isSelected 
                      ? 'bg-white border-[#B8873D] shadow-sm ring-1 ring-antiquegold/30' 
                      : 'bg-white border-[rgba(184,135,61,0.12)] hover:border-[rgba(184,135,61,0.3)] shadow-xs'
                  }`}
                >
                  {/* Flashing danger bar for unacknowledged alerts */}
                  {isUnacknowledged && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#B23B3B] animate-pulse" />
                  )}

                  <div className="flex gap-3 justify-between items-start">
                    <div className="flex gap-2.5 items-center">
                      <img 
                        src={alert.staffAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                        alt={alert.staffName} 
                        className="w-9 h-9 rounded-full object-cover border border-antiquegold/30 shrink-0" 
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-charcoal">{alert.staffName}</h4>
                          <span className="text-[8px] uppercase tracking-wider font-mono bg-alabaster px-1.5 py-0.5 rounded text-warmgray border border-gray-200">
                            {alert.staffRole}
                          </span>
                        </div>
                        <p className="text-[10px] text-warmgray mt-0.5">{alert.staffPhone}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${getAlertBadgeColor(alert.alertType)}`}>
                        {alert.alertType.replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="text-[9px] text-warmgray mt-1 font-mono">{new Date(alert.receivedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {/* Geolocation line */}
                  <div className="mt-3 flex items-start gap-1.5 text-[11px] text-charcoal">
                    <MapPin className="w-3.5 h-3.5 text-antiquegold shrink-0 mt-0.5" />
                    <span className="line-clamp-1 font-medium">{alert.alertLocation}</span>
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-3.5 pt-2.5 border-t border-dashed border-[#e5dfd4] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {alert.escalationStatus === 'received' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#B23B3B] animate-pulse">
                          <Radio className="w-3 h-3" />
                          <span>Distress Fired (Pending Admin Ack)</span>
                        </span>
                      )}
                      {alert.escalationStatus === 'acknowledged' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#B8873D]">
                          <Clock className="w-3 h-3" />
                          <span>Response Forces Mobilized</span>
                        </span>
                      )}
                      {alert.escalationStatus === 'resolved' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-royalemerald">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SOP Audit Resolved</span>
                        </span>
                      )}
                    </div>

                    {/* Secondary Channel Flag */}
                    {alert.escalatedToBackupAt && (
                      <span className="text-[8px] font-mono font-bold bg-[#B23B3B]/10 text-[#B23B3B] px-1.5 py-0.5 rounded border border-[#B23B3B]/20">
                        SMS ESCALATED
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Incident Workspace & The Ascension Line Tracker */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <div className="bg-white rounded-3xl border border-[rgba(184,135,61,0.15)] p-6 shadow-sm text-left space-y-6 relative overflow-hidden">
              
              {/* Alert Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5dfd4] pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-2xl text-[#B23B3B] shrink-0">
                    {getAlertIcon(selectedAlert.alertType)}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-charcoal">
                      Distress Call: <span className="text-[#B23B3B] font-mono text-sm">#{selectedAlert.id}</span>
                    </h3>
                    <p className="text-xs text-warmgray mt-0.5">
                      Dispatched on <span className="font-mono">{new Date(selectedAlert.receivedAt).toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <a 
                    href={`tel:${selectedAlert.staffPhone}`}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-royalemerald hover:bg-[#0A382E] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 animate-bounce" />
                    <span>Call Live: {selectedAlert.staffPhone}</span>
                  </a>
                </div>
              </div>

              {/* Distressed Staff Detail Profile */}
              <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.1)] grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 md:col-span-2">
                  <img 
                    src={selectedAlert.staffAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                    alt={selectedAlert.staffName} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-antiquegold/30 shrink-0" 
                  />
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">{selectedAlert.staffName}</h4>
                    <p className="text-xs text-warmgray mt-0.5">Role: <span className="text-[#B8873D] font-bold uppercase">{selectedAlert.staffRole}</span></p>
                    <p className="text-xs text-charcoal font-mono mt-0.5">{selectedAlert.staffPhone}</p>
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-dashed border-[#e5dfd4] pt-3 md:pt-0 md:pl-4 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-warmgray uppercase">Active Location Node</span>
                  <p className="text-xs font-bold text-charcoal truncate mt-0.5">{selectedAlert.alertLocation}</p>
                  <p className="text-[10px] text-warmgray font-mono mt-0.5">Lat: {selectedAlert.lat}, Lng: {selectedAlert.lng}</p>
                </div>
              </div>

              {/* THE SIGNATURE ELEMENT: "THE ASCENSION LINE" STATUS TRACKER */}
              <div className="space-y-4">
                <h4 className="font-serif text-sm font-bold text-charcoal flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-antiquegold" />
                  <span>The Ascension Line: Emergency Escalation Pipeline</span>
                </h4>

                <div className="relative pl-8 py-2">
                  {/* The Ascension vertical gold rail rail filler */}
                  <div className="absolute left-[11px] top-4 bottom-4 w-1 bg-[#e5dfd4] rounded-full overflow-hidden">
                    <div 
                      className="bg-antiquegold rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        height: 
                          selectedAlert.escalationStatus === 'received' ? '15%' :
                          selectedAlert.escalationStatus === 'acknowledged' ? '60%' :
                          '100%' 
                      }}
                    />
                  </div>

                  {/* Step 1: Distress Received */}
                  <div className="relative mb-6">
                    <div className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedAlert.escalationStatus !== 'cancelled'
                        ? 'bg-red-500 border-red-200 text-white shadow'
                        : 'bg-white border-gray-200 text-gray-400'
                    }`}>
                      <Radio className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <div className="flex justify-between items-start">
                        <h5 className="text-xs font-bold text-charcoal">Distress Signal Received at HQ</h5>
                        <span className="font-mono text-[10px] text-warmgray">{new Date(selectedAlert.receivedAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[11px] text-warmgray mt-1">
                        Device GPS grounded and transmission channel validated. Emergency siren pushed to Admin current layout.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Admin Acknowledged */}
                  <div className="relative mb-6">
                    <div className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedAlert.escalationStatus === 'acknowledged' || selectedAlert.escalationStatus === 'resolved'
                        ? 'bg-antiquegold border-yellow-200 text-white shadow'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {selectedAlert.escalationStatus === 'acknowledged' || selectedAlert.escalationStatus === 'resolved' ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="text-[9px] font-bold">2</span>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="flex justify-between items-start">
                        <h5 className="text-xs font-bold text-charcoal">Admin Acknowledged & Response Forces Dispatched</h5>
                        {selectedAlert.acknowledgedAt && (
                          <span className="font-mono text-[10px] text-warmgray">
                            {new Date(selectedAlert.acknowledgedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-warmgray mt-1">
                        {selectedAlert.acknowledgedAt ? (
                          "Emergency response team, site supervisor, and backup transport mobilized. Backup escalation timer stopped."
                        ) : (
                          "Pending manual acknowledgement. Once confirmed, secondary channel backup triggers will be deactivated."
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: SOP Resolution Audit */}
                  <div className="relative">
                    <div className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedAlert.escalationStatus === 'resolved'
                        ? 'bg-royalemerald border-green-200 text-white shadow'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {selectedAlert.escalationStatus === 'resolved' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-[9px] font-bold">3</span>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="flex justify-between items-start">
                        <h5 className="text-xs font-bold text-charcoal">SOP Resolution Clear Audit File</h5>
                        {selectedAlert.resolvedAt && (
                          <span className="font-mono text-[10px] text-warmgray">
                            {new Date(selectedAlert.resolvedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-warmgray mt-1">
                        {selectedAlert.resolvedAt ? (
                          `Permanent post-incident review completed. Incident resolved and safely archived.`
                        ) : (
                          "Requires final inspection, post-incident feedback, and an explicit resolution note to close."
                        )}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Escalation Status Text for Accident Logs / Resolution Notes */}
              {selectedAlert.resolutionNote && (
                <div className="p-3.5 bg-royalemerald/5 rounded-xl border border-royalemerald/20 text-left">
                  <h5 className="text-xs font-bold text-[#0E4B3D] flex items-center gap-1.5 mb-1">
                    <FileText className="w-4 h-4" />
                    <span>Permanent SOP Resolution Log File</span>
                  </h5>
                  <p className="text-xs text-charcoal leading-relaxed">{selectedAlert.resolutionNote}</p>
                </div>
              )}

              {/* Action Board (Acknowledge, Resolve Buttons) */}
              <div className="pt-4 border-t border-[#e5dfd4] flex gap-3">
                {selectedAlert.escalationStatus === 'received' && (
                  <button
                    onClick={() => handleAcknowledgeAlert(selectedAlert)}
                    className="flex-1 py-3 bg-antiquegold hover:bg-[#875b1a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Acknowledge Distress Call</span>
                  </button>
                )}

                {selectedAlert.escalationStatus === 'acknowledged' && (
                  <button
                    onClick={() => handleOpenResolveModal(selectedAlert)}
                    className="flex-1 py-3 bg-royalemerald hover:bg-[#0A382E] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Final Resolution Audit Clear</span>
                  </button>
                )}

                {selectedAlert.escalationStatus === 'resolved' && (
                  <div className="flex-1 py-2.5 bg-[#F8F6F1] border border-gray-200 text-warmgray text-xs font-bold rounded-xl text-center cursor-not-allowed">
                    🔒 Incident Resolved & Log Archival Permanent
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[rgba(184,135,61,0.12)] p-12 text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-antiquegold/30 mx-auto animate-pulse" />
              <div>
                <h3 className="font-serif text-base font-bold text-charcoal">Safety Signal Dispatch Screen</h3>
                <p className="text-xs text-warmgray max-w-md mx-auto">
                  Select an active distress call or simulated event from the list to initiate live operations, trace staff location, execute response forces, and clear safety audits.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 6. MODAL INTERRUPT ALERT (PATH ALLOWED TO INTERRUPT ADMIN SCREEN) */}
      <AnimatePresence>
        {alerts.some(a => a.escalationStatus === 'received') && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border-2 border-[#B23B3B] max-w-lg w-full p-6 shadow-2xl space-y-6 text-left relative overflow-hidden"
            >
              {/* Pulsing Alarm BG */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#B23B3B]/10 rounded-full blur-2xl animate-pulse" />

              <div className="flex items-center gap-3 border-b border-[#e5dfd4] pb-4">
                <div className="p-3 bg-[#B23B3B]/20 text-[#B23B3B] rounded-2xl shrink-0 animate-ping">
                  <AlertTriangle className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#B23B3B] uppercase tracking-wide">
                    CRITICAL: Active Distress SOS Fired!
                  </h3>
                  <p className="text-xs text-warmgray">This emergency bypass demands immediate director command action.</p>
                </div>
              </div>

              {/* Distressed details inside modal */}
              {(() => {
                const activeAlertObj = alerts.find(a => a.escalationStatus === 'received');
                if (!activeAlertObj) return null;

                return (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#F8F6F1] rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={activeAlertObj.staffAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                            alt={activeAlertObj.staffName} 
                            className="w-10 h-10 rounded-full object-cover border border-antiquegold" 
                          />
                          <div>
                            <h4 className="font-bold text-xs text-charcoal">{activeAlertObj.staffName}</h4>
                            <p className="text-[10px] text-[#B8873D] uppercase tracking-wider font-bold">{activeAlertObj.staffRole}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold bg-[#B23B3B] text-white px-2 py-0.5 rounded uppercase">
                          {activeAlertObj.alertType.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-charcoal space-y-1">
                        <div className="flex justify-between gap-2">
                          <span className="text-warmgray shrink-0">Distress Site:</span>
                          <span className="font-bold truncate max-w-[200px] min-w-0">{activeAlertObj.alertLocation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-warmgray">Staff Phone:</span>
                          <span className="font-mono font-bold">{activeAlertObj.staffPhone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-warmgray">Dispatched:</span>
                          <span className="font-mono">{new Date(activeAlertObj.receivedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a 
                        href={`tel:${activeAlertObj.staffPhone}`}
                        className="flex-1 py-3 bg-[#B23B3B] hover:bg-[#922A2A] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <PhoneCall className="w-4 h-4 animate-bounce" />
                        <span>Call Agent: {activeAlertObj.staffPhone}</span>
                      </a>

                      <button
                        onClick={() => {
                          handleAcknowledgeAlert(activeAlertObj);
                        }}
                        className="flex-1 py-3 bg-royalemerald hover:bg-[#0A382E] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Acknowledge Distress</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. RESOLUTION CLEAR DIALOG MODAL */}
      <AnimatePresence>
        {showResolutionModal && selectedAlert && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-[rgba(184,135,61,0.2)] max-w-md w-full p-6 shadow-xl space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-[#e5dfd4] pb-3">
                <h3 className="font-serif text-sm font-bold text-charcoal">
                  Resolve Distress SOP: #{selectedAlert.id}
                </h3>
                <button 
                  onClick={() => setShowResolutionModal(false)}
                  className="p-1 rounded-lg hover:bg-alabaster text-warmgray hover:text-charcoal cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-warmgray">
                  To permanently resolve distress record, write an explicit resolution action plan file. Describe safety outcomes, backup dispatch clearance, and SOP de-escalation:
                </p>

                <textarea
                  value={resolutionText}
                  onChange={e => {
                    setResolutionText(e.target.value);
                    if (e.target.value.trim().length >= 10) setResolutionError('');
                  }}
                  rows={4}
                  placeholder="e.g. Ambulance arrived at site. Mechanical supervisor cleared lift shaft elevator safety brackets. Partner amit_sharma released from site."
                  className="w-full text-xs p-3 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl text-charcoal focus:outline-none focus:border-antiquegold focus:ring-1 focus:ring-antiquegold/30 resize-none font-medium"
                />

                {resolutionError && (
                  <p className="text-[11px] text-[#B23B3B] font-bold">{resolutionError}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowResolutionModal(false)}
                  className="flex-1 py-2.5 bg-alabaster hover:bg-gray-100 text-charcoal text-xs font-bold rounded-xl border border-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveAlertSubmit}
                  className="flex-1 py-2.5 bg-royalemerald hover:bg-[#0A382E] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Confirm Permanent Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM POPUPS */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              onAnimationComplete={() => {
                setTimeout(() => {
                  setToasts(prev => prev.filter(p => p.id !== t.id));
                }, 4000);
              }}
              className={`p-3.5 rounded-xl border shadow-lg text-xs font-semibold pointer-events-auto flex items-start gap-2.5 ${
                t.type === 'error' ? 'bg-[#B23B3B]/95 text-white border-red-500' :
                t.type === 'success' ? 'bg-royalemerald/95 text-white border-emerald-600' :
                'bg-white text-charcoal border-[rgba(184,135,61,0.2)]'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
