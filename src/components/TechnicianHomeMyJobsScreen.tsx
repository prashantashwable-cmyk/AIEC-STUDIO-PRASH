import React, { useState, useEffect } from 'react';
import { User, TechnicianJob, TechnicianProfileSummary } from '../types';
import { DbManager } from '../lib/db';
import { 
  Wrench, Calendar, MapPin, Phone, Clock, AlertTriangle, ShieldAlert, 
  CheckCircle2, ArrowRight, RefreshCw, UserCheck, Star, DollarSign, 
  ChevronRight, Layers, Radio, PhoneCall, Send, Shield
} from 'lucide-react';
import { Card, Button } from './Common';

interface TechnicianHomeMyJobsScreenProps {
  user: User;
  onSelectJob: (jobId: string) => void;
  onOpenSos?: () => void;
}

export const TechnicianHomeMyJobsScreen: React.FC<TechnicianHomeMyJobsScreenProps> = ({
  user,
  onSelectJob,
  onOpenSos
}) => {
  const [jobs, setJobs] = useState<TechnicianJob[]>([]);
  const [profile, setProfile] = useState<TechnicianProfileSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosReason, setSosReason] = useState('site_accident');
  const [sosNote, setSosNote] = useState('');
  const [sosSent, setSosSent] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const allJobs = DbManager.getTechnicianJobs();
      const techProfile = DbManager.getTechnicianProfile(user.id || 'tech_001');
      setJobs(allJobs);
      setProfile(techProfile);
      setIsLoading(false);
    }, 400);
  };

  const handleSendSos = () => {
    setSosSent(true);
    setTimeout(() => {
      setSosModalOpen(false);
      setSosSent(false);
      setSosNote('');
      if (onOpenSos) onOpenSos();
    }, 1500);
  };

  if (isLoading || !profile) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-8 bg-[var(--color-border)] opacity-30 rounded w-1/3"></div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl"></div>
      </div>
    );
  }

  // Today's jobs (scheduled for 2026-08-13 or currently in_progress)
  const todaysJobs = jobs.filter(j => j.scheduledDate === '2026-08-13' || j.status === 'in_progress');
  const upcomingJobs = jobs.filter(j => j.scheduledDate !== '2026-08-13' && j.status !== 'in_progress');

  // Check for time overlap conflict on today's jobs
  const hasConflict = todaysJobs.length > 1 && todaysJobs.some(j => j.status === 'conflict_flagged');

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto pb-24">
      {/* Header & SOS Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent-primary)] uppercase tracking-wider">
            <Wrench className="w-4 h-4" /> Field Technical Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text-primary)] mt-1">
            Welcome back, {user.name || profile.name}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Installation Schedule • Assigned Elevator Jobs & Site Readiness
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            className="flex items-center gap-1.5 text-xs py-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync Schedule
          </Button>

          {/* Prominent SOS Button */}
          <Button
            onClick={() => setSosModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 flex items-center gap-1.5 shadow-md animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" /> Emergency SOS
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3.5 sm:p-4 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl text-center sm:text-left">
          <div className="text-[10px] sm:text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            Completed (Aug)
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold font-mono text-[var(--color-text-primary)] mt-1">
            {profile.monthlyCompletedCount} Lifts
          </div>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
            <CheckCircle2 className="w-3 h-3" /> On Track
          </p>
        </Card>

        <Card className="p-3.5 sm:p-4 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl text-center sm:text-left">
          <div className="text-[10px] sm:text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center justify-center sm:justify-between">
            <span>Quality Score</span>
            <Star className="w-3.5 h-3.5 text-antiquegold hidden sm:inline" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold font-mono text-antiquegold mt-1">
            {profile.currentQualityScore}%
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
            Verified by QC Audit
          </p>
        </Card>

        <Card className="p-3.5 sm:p-4 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl text-center sm:text-left">
          <div className="text-[10px] sm:text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            Pending Payout
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold font-mono text-[var(--color-text-primary)] mt-1">
            ₹{(profile.pendingPayoutINR / 1000).toFixed(1)}k
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
            Milestone Disbursal
          </p>
        </Card>
      </div>

      {/* Conflict Warning Callout */}
      {hasConflict && (
        <Card className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-amber-800 dark:text-amber-300">
              Scheduling Conflict Detected Today
            </h4>
            <p className="text-[var(--color-text-secondary)]">
              Two assigned site visits have overlapping time slots. Please coordinate with Admin or lead technician to adjust shift timing before starting second site.
            </p>
          </div>
        </Card>
      )}

      {/* Today's Assigned Jobs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-antiquegold" /> Today's Assigned Jobs ({todaysJobs.length})
          </h2>
          <span className="text-xs font-mono text-[var(--color-text-secondary)]">
            August 13, 2026
          </span>
        </div>

        {todaysJobs.length === 0 ? (
          <Card className="p-8 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto opacity-80" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              No Installation Jobs Scheduled Today
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
              Your schedule is clear for today. You can review upcoming installations for this week or check tools & safety equipment.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {todaysJobs.map((job) => (
              <Card 
                key={job.id} 
                className="p-5 border border-[var(--color-accent-primary)]/30 bg-[var(--color-surface)] rounded-2xl relative overflow-hidden space-y-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Job Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded bg-black/10 dark:bg-white/10 text-[var(--color-text-primary)]">
                        {job.poNumber}
                      </span>

                      {/* Multi-tech role badge */}
                      {job.userRoleInJob === 'lead_technician' ? (
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Lead Technician
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                          Assistant Installer
                        </span>
                      )}

                      <span className="text-xs text-[var(--color-text-secondary)] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-antiquegold" /> {job.scheduledTimeSlot}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-serif font-bold text-[var(--color-text-primary)] mt-1.5">
                      {job.customerName}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-antiquegold shrink-0" />
                      <span className="line-clamp-1">{job.siteAddress}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-xs text-[var(--color-text-secondary)] font-mono">Est. Payout</div>
                    <div className="text-lg font-serif font-bold font-mono text-emerald-700 dark:text-emerald-400">
                      ₹{job.payoutAmountINR.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* SOP Ascension Line Progress Motif */}
                <div className="space-y-1.5 bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--color-text-secondary)]">Current SOP Installation Stage:</span>
                    <span className="font-bold text-antiquegold font-mono">{job.sopProgressPercent}% Complete</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative w-full h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-antiquegold to-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${job.sopProgressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs font-bold text-[var(--color-text-primary)] mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    {job.sopStage}
                  </div>
                </div>

                {/* Elevator Model Context */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-secondary)] pt-1">
                  <span>Specs: <strong className="text-[var(--color-text-primary)]">{job.elevatorSpec.modelName}</strong></span>
                  <span>Team: <strong className="text-[var(--color-text-primary)]">{job.assignedTeam.length} Members</strong></span>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <Button
                    onClick={() => onSelectJob(job.id)}
                    className="w-full bg-antiquegold text-white hover:bg-antiquegold/90 font-bold text-xs py-2.5 flex items-center justify-center gap-2"
                  >
                    Start / Continue Job SOP <ArrowRight className="w-4 h-4" />
                  </Button>

                  <a 
                    href={`tel:${job.customerPhone}`}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-text-primary)] flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Call Site Contact
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Scheduled Jobs */}
      <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
        <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Layers className="w-4 h-4 text-antiquegold" /> Scheduled Later This Week ({upcomingJobs.length})
        </h2>

        <div className="space-y-3">
          {upcomingJobs.map((job) => (
            <Card key={job.id} className="p-4 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-antiquegold/40 transition-colors">
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-antiquegold font-mono">{job.scheduledDate}</span>
                  <span className="text-[var(--color-text-secondary)]">• {job.scheduledTimeSlot}</span>
                </div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                  {job.customerName}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                  {job.siteAddress}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => onSelectJob(job.id)}
                  className="text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  View Site Specs <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* SOS Modal Dialog */}
      {sosModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-[var(--color-surface)] border border-red-500/40 rounded-2xl space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-3">
              <div className="p-2.5 bg-red-600 rounded-xl text-white">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-red-700 dark:text-red-400">
                  Field Safety Emergency SOS
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Sends high-priority alert & GPS location to AIEC Safety Control Desk
                </p>
              </div>
            </div>

            {sosSent ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  SOS Signal Dispatched Successfully
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Control Desk & Admin Mr. Prashant Wable notified via High Priority Push & SMS.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[var(--color-text-primary)] block mb-1">
                    Emergency Category:
                  </label>
                  <select
                    value={sosReason}
                    onChange={(e) => setSosReason(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="site_accident">Site Safety Hazard / Structural Danger</option>
                    <option value="medical_emergency">Medical Emergency / Personal Injury</option>
                    <option value="aggressive_customer">Hostile / Aggressive Customer Behavior</option>
                    <option value="vehicle_breakdown">Vehicle Breakdown / Stranded Transport</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[var(--color-text-primary)] block mb-1">
                    Quick Details (Optional):
                  </label>
                  <textarea
                    value={sosNote}
                    onChange={(e) => setSosNote(e.target.value)}
                    placeholder="Describe immediate location or situation..."
                    rows={2}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="p-2.5 bg-red-500/10 rounded-xl text-[10px] text-red-700 dark:text-red-300">
                  <span className="font-bold">Live GPS Auto-Attached: </span>
                  Lat 19.0473, Long 73.0699 (Navi Mumbai Site)
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSosModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendSos}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                  >
                    DISPATCH SOS SIGNAL NOW
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
