import React, { useState } from 'react';
import { 
  Calendar, Clock, ShieldCheck, ArrowLeft, CheckCircle2, User, 
  MapPin, Phone, AlertCircle, Sparkles, Navigation, Plus, ChevronRight, 
  RefreshCw, Wrench, ExternalLink
} from 'lucide-react';
import { UserRole, CustomerAmcBooking, CustomerProjectSummary } from '../types';
import { DbManager } from '../lib/db';

interface CustomerAmcBookingScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const CustomerAmcBookingScreen: React.FC<CustomerAmcBookingScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  onBack,
  onNavigateTab
}) => {
  const [projects] = useState<CustomerProjectSummary[]>(() => 
    DbManager.getCustomerProjects(currentUserId)
  );
  const [bookings, setBookings] = useState<CustomerAmcBooking[]>(() => 
    DbManager.getCustomerAmcBookings(currentUserId)
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || 'proj_skyline_002'
  );
  const [bookingType, setBookingType] = useState<CustomerAmcBooking['bookingType']>('routine_preventive');
  const [preferredDate, setPreferredDate] = useState<string>('2026-08-22');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<string>('10:00 AM - 01:00 PM');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  
  const [activeViewMode, setActiveViewMode] = useState<'calendar' | 'agenda'>('agenda');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const timeSlots = [
    '09:00 AM - 12:00 PM',
    '10:00 AM - 01:00 PM',
    '02:00 PM - 05:00 PM',
    '04:00 PM - 07:00 PM'
  ];

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();

    const newBooking: CustomerAmcBooking = {
      id: `amc_bk_${Date.now().toString().slice(-4)}`,
      customerId: currentUserId,
      customerName: activeProject ? activeProject.customerName : 'Shri Rajeshwar Patil',
      customerPhone: '+91 98220 11223',
      projectId: selectedProjectId,
      projectName: activeProject ? activeProject.projectName : 'Skyline Commercial Hub Lift #2',
      siteAddress: activeProject ? activeProject.siteAddress : 'Plot 42, Skyline Hub, Pune',
      amcPlanName: 'AIEC Gold Shield 24x7 AMC',
      amcCoverageStatus: 'active',
      amcExpiryDate: '2027-03-14',
      bookingType: bookingType,
      preferredDate: preferredDate,
      preferredTimeSlot: preferredTimeSlot,
      status: 'confirmed',
      assignedTechId: 'tech_vikram_01',
      assignedTechName: 'Vikram Shinde (Senior Service Engineer)',
      assignedTechPhone: '+91 98220 44556',
      assignedTechPhoto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
      technicianEtaMinutes: 20,
      specialNotes: specialNotes,
      createdAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    };

    DbManager.saveCustomerAmcBooking(newBooking);
    setBookings(DbManager.getCustomerAmcBookings(currentUserId));
    
    // Reset
    setSpecialNotes('');
    triggerToast(`Service visit confirmed for ${preferredDate}! Technician Vikram Shinde assigned.`);
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
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                <Calendar className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'एएमसी एवं रखरखाव बुकिंग' : currentLanguage === 'mr' ? 'एएमसी सेवा बुकिंग' : 'AMC & Maintenance Booking'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' ? 'नियमित रोकथाम सेवा बुकिंग एवं तकनीशियन ट्रैकिंग' : 'Schedule preventive AMC checkups & track assigned technician'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveViewMode('agenda')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                activeViewMode === 'agenda'
                  ? 'bg-[var(--color-accent-primary)] text-white border-transparent'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
              }`}
            >
              Agenda List
            </button>
            <button
              onClick={() => setActiveViewMode('calendar')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                activeViewMode === 'calendar'
                  ? 'bg-[var(--color-accent-primary)] text-white border-transparent'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
              }`}
            >
              Calendar Schedule
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* AMC Status Banner Header */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/40 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-accent-primary)] block">
                  AMC WARRANTY STATUS: ACTIVE
                </span>
                <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] mt-0.5">
                  AIEC Gold Shield 24x7 AMC • {activeProject?.projectName}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Coverage valid through <strong>March 14, 2027</strong>. Includes 4 quarterly free preventive checkups per year.
                </p>
              </div>
            </div>

            <button
              onClick={() => triggerToast('AMC plan is active with 2 free visits remaining this year.')}
              className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl self-start sm:self-auto flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Full AMC Coverage Active</span>
            </button>
          </div>
        </div>

        {/* Live Technician Arrival Tracking Card (If any confirmed today) */}
        {bookings.some(b => b.status === 'confirmed' || b.status === 'in_transit') && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                  Upcoming AMC Service Visit Assigned
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                ETA: ~15 Mins away
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150"
                  alt="Technician"
                  className="w-12 h-12 rounded-2xl object-cover border border-[var(--color-accent-primary)] shadow-sm"
                />
                <div>
                  <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                    Vikram Shinde
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Senior Elevator Service Specialist • +91 98220 44556
                  </p>
                  <span className="text-[10px] font-mono text-[var(--color-accent-primary)] font-bold">
                    Skill Tag: Gearless Traction & Safety Brake Certified
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <a
                  href="tel:+919822044556"
                  className="px-3.5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Technician</span>
                </a>

                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('LiveShipmentTracking');
                    else triggerToast('Opening live GPS technician arrival tracker...');
                  }}
                  className="px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-bold rounded-xl hover:border-[var(--color-accent-primary)] flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                  <span>Track GPS Live</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Form & Bookings List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Booking Form */}
          <form onSubmit={handleCreateBooking} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Book New AMC Visit Slot
            </h3>

            {/* Site Project */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">Site Project</label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.projectName}</option>
                ))}
              </select>
            </div>

            {/* Visit Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">Visit Type</label>
              <select
                value={bookingType}
                onChange={e => setBookingType(e.target.value as any)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
              >
                <option value="routine_preventive">Quarterly Routine Maintenance (Included in AMC)</option>
                <option value="oil_lubrication_check">Guide Rail & Gearbox Oil Service</option>
                <option value="breakdown_inspection">Ad-hoc Technical Diagnostic Visit</option>
              </select>
            </div>

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text-primary)]">Preferred Date</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={e => setPreferredDate(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text-primary)]">Time Slot</label>
                <select
                  value={preferredTimeSlot}
                  onChange={e => setPreferredTimeSlot(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                >
                  {timeSlots.map((slot, idx) => (
                    <option key={idx} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">Instructions for Technician</label>
              <textarea
                rows={2}
                placeholder="e.g. Contact society watchman upon arrival..."
                value={specialNotes}
                onChange={e => setSpecialNotes(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Confirm Service Booking</span>
            </button>
          </form>

          {/* Bookings Agenda List */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3 flex items-center justify-between">
              <span>Your AMC Bookings History ({bookings.length})</span>
              <span className="text-xs font-mono font-bold text-[var(--color-accent-primary)]">Agenda View</span>
            </h3>

            <div className="space-y-3">
              {bookings.map(bk => (
                <div key={bk.id} className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-[var(--color-text-primary)]">
                      {bk.bookingType === 'routine_preventive' ? 'Quarterly AMC Maintenance' : bk.bookingType}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                      {bk.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[var(--color-text-secondary)]">
                    📅 <strong>{bk.preferredDate}</strong> ({bk.preferredTimeSlot})
                  </p>

                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[var(--color-text-secondary)]">Tech: {bk.assignedTechName || 'Assigned'}</span>
                    <button
                      onClick={() => triggerToast(`Service voucher #${bk.id} ready.`)}
                      className="text-[var(--color-accent-primary)] font-bold hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
