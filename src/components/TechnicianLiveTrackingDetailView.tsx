import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hammer, MapPin, Phone, MessageSquare, AlertTriangle, ShieldAlert,
  Clock, CheckCircle2, ChevronRight, FileText, Calendar, Camera,
  RefreshCw, X, ChevronDown, Check, Play, Award, Zap, HelpCircle,
  Eye, Heart, AlertCircle, Sparkles, Navigation, Signal, Battery, Compass, Info,
  ArrowLeft
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { User as UserType } from '../types';
import { Card, Button, Badge } from './Common';

// SOP Step Interface
interface SOPStep {
  id: string;
  label: string;
  phase: 'pre' | 'core' | 'electrical' | 'testing';
  completed: boolean;
  completedAt?: string;
  verifiedBy?: string;
  isHighRisk: boolean;
  notes?: string;
}

// Technician Check-in/Check-out Log
interface ShiftLog {
  technicianId: string;
  technicianName: string;
  technicianPhone: string;
  technicianAvatar: string;
  roleType: 'lead' | 'assistant';
  checkInTime: string;
  checkOutTime?: string;
  gpsAccuracyMeters: number;
  distanceFromSiteMeters: number; // For configurable radius validation
  isCheckInValid: boolean; // True if within radius
  isSopCompleteAtCheckout: boolean; // Triggers "checkout flagged with incomplete steps"
  currentSopStepId: string;
}

interface EvidencePhoto {
  id: string;
  title: string;
  sopStepId: string;
  uploadedAt: string;
  url: string;
  verifiedStatus: 'approved' | 'rejected' | 'pending';
}

interface TechnicianJobTracker {
  jobId: string;
  siteName: string;
  address: string;
  date: string;
  overallStatus: 'pre-check' | 'in-progress' | 'qc-pending' | 'completed';
  scheduleMatch: boolean; // Handles schedule mismatch edge-case
  assignedTechnicians: ShiftLog[];
  sopSteps: SOPStep[];
  evidencePhotos: EvidencePhoto[];
  gpsOutlierAlert: boolean; // Handles "Left site during high-risk step" edge case
  outlierReason?: string;
}

export const TechnicianLiveTrackingDetailView: React.FC<{
  user: UserType;
  selectedTechnicianId?: string;
  onBack?: () => void;
}> = ({ user, selectedTechnicianId = 'rajesh_patel', onBack }) => {
  // Calendar and Switching state
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-08');
  const [activeTechId, setActiveTechId] = useState<string>(selectedTechnicianId);
  const [activeTab, setActiveTab] = useState<'sop' | 'evidence' | 'telemetry'>('sop');
  
  // Interactive UI states
  const [selectedPhoto, setSelectedPhoto] = useState<EvidencePhoto | null>(null);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationSeverity, setEscalationSeverity] = useState<'amber' | 'critical'>('critical');
  const [escalationNotes, setEscalationNotes] = useState('');
  const [escalationSubmitted, setEscalationSubmitted] = useState(false);

  // 1. TECHNICIAN MASTER DIRECTORY
  const techniciansList = useMemo(() => [
    {
      id: 'rajesh_patel',
      name: 'Rajesh Patel',
      phone: '+91 97654 32100',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      joinedDate: '2025-08-10',
      grade: 'Senior Installation Expert (Level 3)'
    },
    {
      id: 'vinay_kadam',
      name: 'Vinay Kadam',
      phone: '+91 99870 12345',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      joinedDate: '2026-02-15',
      grade: 'Assistant Technician (Level 1)'
    },
    {
      id: 'amit_desai',
      name: 'Amit Desai',
      phone: '+91 95450 88221',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      joinedDate: '2026-05-20',
      grade: 'Mechanical Safety Auditor'
    }
  ], []);

  // 2. MOCK DATA FOR JOB TRACKERS (Includes complex edge cases)
  const installationJobs: Record<string, Record<string, TechnicianJobTracker>> = useMemo(() => {
    return {
      rajesh_patel: {
        '2026-07-08': {
          jobId: 'job_deshmukh_01',
          siteName: 'Deshmukh Arcade (G+5 Traction)',
          address: 'Erandwane, Near Deccan Gymkhana, Pune',
          date: '2026-07-08',
          overallStatus: 'in-progress',
          scheduleMatch: true, // Matching schedule
          gpsOutlierAlert: true, // Left site during a high-risk step!
          outlierReason: 'ALERT: GPS coordinates indicate technician is 180m away while Safety-Critical High Voltage testing step is in-progress.',
          assignedTechnicians: [
            {
              technicianId: 'rajesh_patel',
              technicianName: 'Rajesh Patel',
              technicianPhone: '+91 97654 32100',
              technicianAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
              roleType: 'lead',
              checkInTime: '08:45 AM',
              gpsAccuracyMeters: 8,
              distanceFromSiteMeters: 12, // within valid configurable radius (e.g., 30m)
              isCheckInValid: true,
              isSopCompleteAtCheckout: false,
              currentSopStepId: 'sop_step_4'
            },
            {
              technicianId: 'vinay_kadam',
              technicianName: 'Vinay Kadam',
              technicianPhone: '+91 99870 12345',
              technicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
              roleType: 'assistant',
              checkInTime: '08:50 AM',
              gpsAccuracyMeters: 15,
              distanceFromSiteMeters: 22, // within valid radius
              isCheckInValid: true,
              isSopCompleteAtCheckout: false,
              currentSopStepId: 'sop_step_4'
            }
          ],
          sopSteps: [
            { id: 'sop_step_1', label: 'Shaft Civil Well Ready & Vertical Align Checked', phase: 'pre', completed: true, completedAt: '09:30 AM', verifiedBy: 'Rajesh Patel', isHighRisk: false },
            { id: 'sop_step_2', label: 'Plumb-line Laser Target & Guide Rails Anchored', phase: 'core', completed: true, completedAt: '11:15 AM', verifiedBy: 'Rajesh Patel', isHighRisk: false },
            { id: 'sop_step_3', label: 'Traction Motor Rigging & Overhead Pulley Anchored', phase: 'core', completed: true, completedAt: '01:45 PM', verifiedBy: 'Rajesh Patel', isHighRisk: true, notes: 'Anchor tests loaded with 1.5x rating factor' },
            { id: 'sop_step_4', label: 'Over-speed Governor & Brake Pad Integration', phase: 'core', completed: false, isHighRisk: true, notes: 'Requires dual lock pin confirmation' },
            { id: 'sop_step_5', label: 'Traction Rope tension check & Handover Safety Run', phase: 'testing', completed: false, isHighRisk: true }
          ],
          evidencePhotos: [
            { id: 'img_01', title: 'Guide Rails Level Laser Verification', sopStepId: 'sop_step_2', uploadedAt: '11:10 AM', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', verifiedStatus: 'approved' },
            { id: 'img_02', title: 'Traction Drive Rigging Point', sopStepId: 'sop_step_3', uploadedAt: '01:30 PM', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', verifiedStatus: 'pending' }
          ]
        },
        '2026-07-07': {
          jobId: 'job_deshmukh_01',
          siteName: 'Deshmukh Arcade (G+5 Traction)',
          address: 'Erandwane, Near Deccan Gymkhana, Pune',
          date: '2026-07-07',
          overallStatus: 'completed',
          scheduleMatch: true,
          gpsOutlierAlert: false,
          assignedTechnicians: [
            {
              technicianId: 'rajesh_patel',
              technicianName: 'Rajesh Patel',
              technicianPhone: '+91 97654 32100',
              technicianAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
              roleType: 'lead',
              checkInTime: '09:00 AM',
              checkOutTime: '04:30 PM',
              gpsAccuracyMeters: 6,
              distanceFromSiteMeters: 5,
              isCheckInValid: true,
              isSopCompleteAtCheckout: true,
              currentSopStepId: 'sop_step_5'
            }
          ],
          sopSteps: [
            { id: 'sop_step_1', label: 'Shaft Civil Well Ready & Vertical Align Checked', phase: 'pre', completed: true, completedAt: '10:00 AM', verifiedBy: 'Rajesh Patel', isHighRisk: false },
            { id: 'sop_step_2', label: 'Plumb-line Laser Target & Guide Rails Anchored', phase: 'core', completed: true, completedAt: '11:30 AM', verifiedBy: 'Rajesh Patel', isHighRisk: false },
            { id: 'sop_step_3', label: 'Traction Motor Rigging & Overhead Pulley Anchored', phase: 'core', completed: true, completedAt: '01:00 PM', verifiedBy: 'Rajesh Patel', isHighRisk: true },
            { id: 'sop_step_4', label: 'Over-speed Governor & Brake Pad Integration', phase: 'core', completed: true, completedAt: '03:00 PM', verifiedBy: 'Rajesh Patel', isHighRisk: true },
            { id: 'sop_step_5', label: 'Traction Rope tension check & Handover Safety Run', phase: 'testing', completed: true, completedAt: '04:15 PM', verifiedBy: 'Rajesh Patel', isHighRisk: true }
          ],
          evidencePhotos: [
            { id: 'img_03', title: 'Shaft Bottom Pit Clearances', sopStepId: 'sop_step_1', uploadedAt: '09:55 AM', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', verifiedStatus: 'approved' }
          ]
        }
      },
      vinay_kadam: {
        '2026-07-08': {
          jobId: 'job_deshmukh_01', // Same combined multi-technician job view!
          siteName: 'Deshmukh Arcade (G+5 Traction)',
          address: 'Erandwane, Near Deccan Gymkhana, Pune',
          date: '2026-07-08',
          overallStatus: 'in-progress',
          scheduleMatch: true,
          gpsOutlierAlert: true,
          outlierReason: 'ALERT: GPS coordinates indicate technician is 180m away while Safety-Critical High Voltage testing step is in-progress.',
          assignedTechnicians: [
            {
              technicianId: 'rajesh_patel',
              technicianName: 'Rajesh Patel',
              technicianPhone: '+91 97654 32100',
              technicianAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
              roleType: 'lead',
              checkInTime: '08:45 AM',
              gpsAccuracyMeters: 8,
              distanceFromSiteMeters: 12,
              isCheckInValid: true,
              isSopCompleteAtCheckout: false,
              currentSopStepId: 'sop_step_4'
            },
            {
              technicianId: 'vinay_kadam',
              technicianName: 'Vinay Kadam',
              technicianPhone: '+91 99870 12345',
              technicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
              roleType: 'assistant',
              checkInTime: '08:50 AM',
              gpsAccuracyMeters: 15,
              distanceFromSiteMeters: 22,
              isCheckInValid: true,
              isSopCompleteAtCheckout: false,
              currentSopStepId: 'sop_step_4'
            }
          ],
          sopSteps: [
            { id: 'sop_step_1', label: 'Shaft Civil Well Ready & Vertical Align Checked', phase: 'pre', completed: true, completedAt: '09:30 AM', verifiedBy: 'Rajesh Patel', isHighRisk: false },
            { id: 'sop_step_2', label: 'Plumb-line Laser Target & Guide Rails Anchored', phase: 'core', completed: true, completedAt: '11:15 AM', verifiedBy: 'Rajesh Patel', isHighRisk: false },
            { id: 'sop_step_3', label: 'Traction Motor Rigging & Overhead Pulley Anchored', phase: 'core', completed: true, completedAt: '01:45 PM', verifiedBy: 'Rajesh Patel', isHighRisk: true, notes: 'Anchor tests loaded with 1.5x rating factor' },
            { id: 'sop_step_4', label: 'Over-speed Governor & Brake Pad Integration', phase: 'core', completed: false, isHighRisk: true, notes: 'Requires dual lock pin confirmation' },
            { id: 'sop_step_5', label: 'Traction Rope tension check & Handover Safety Run', phase: 'testing', completed: false, isHighRisk: true }
          ],
          evidencePhotos: [
            { id: 'img_01', title: 'Guide Rails Level Laser Verification', sopStepId: 'sop_step_2', uploadedAt: '11:10 AM', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', verifiedStatus: 'approved' },
            { id: 'img_02', title: 'Traction Drive Rigging Point', sopStepId: 'sop_step_3', uploadedAt: '01:30 PM', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', verifiedStatus: 'pending' }
          ]
        }
      },
      amit_desai: {
        '2026-07-08': {
          jobId: 'job_mismatch_99',
          siteName: 'Wable Landmark Villa',
          address: 'Senapati Bapat Road, Pune',
          date: '2026-07-08',
          overallStatus: 'pre-check',
          scheduleMatch: false, // SCHEDULE MISMATCH! Audits an unscheduled check-in
          gpsOutlierAlert: false,
          assignedTechnicians: [
            {
              technicianId: 'amit_desai',
              technicianName: 'Amit Desai',
              technicianPhone: '+91 95450 88221',
              technicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
              roleType: 'lead',
              checkInTime: '10:15 AM',
              gpsAccuracyMeters: 45,
              distanceFromSiteMeters: 140, // EXCEEDS configurable radius! Shows invalid check-in
              isCheckInValid: false,
              isSopCompleteAtCheckout: false,
              currentSopStepId: 'sop_step_a'
            }
          ],
          sopSteps: [
            { id: 'sop_step_a', label: 'Audit Pre-Check Verification', phase: 'pre', completed: false, isHighRisk: true }
          ],
          evidencePhotos: []
        }
      }
    };
  }, []);

  const activeTechObj = useMemo(() => {
    return techniciansList.find(t => t.id === activeTechId) || techniciansList[0];
  }, [techniciansList, activeTechId]);

  const activeJobData = useMemo(() => {
    const techJobs = installationJobs[activeTechId];
    if (!techJobs) return null;
    return techJobs[selectedDate] || null;
  }, [installationJobs, activeTechId, selectedDate]);

  const isBeforeJoiningDate = useMemo(() => {
    const selectDateObj = new Date(selectedDate);
    const joinDateObj = new Date(activeTechObj.joinedDate);
    return selectDateObj < joinDateObj;
  }, [selectedDate, activeTechObj]);

  // Handle Photo Verification Toggle
  const handlePhotoApprove = (photoId: string, status: 'approved' | 'rejected') => {
    if (activeJobData) {
      activeJobData.evidencePhotos = activeJobData.evidencePhotos.map(p => {
        if (p.id === photoId) return { ...p, verifiedStatus: status };
        return p;
      });
      alert(`Success: Evidence photo was marked as ${status.toUpperCase()} in the central installation record.`);
      setSelectedPhoto(null);
    }
  };

  // Submit Escalation Ticket
  const handleEscalationSubmit = () => {
    setEscalationSubmitted(true);
    setTimeout(() => {
      setShowEscalationModal(false);
      setEscalationSubmitted(false);
      alert(`🚨 CRITICAL EMERGENCY TICKET RAISED: High-priority dispatch and site suspension alerts triggered for Mr. Prashant Wable & local emergency team.`);
    }, 1200);
  };

  return (
    <div className="space-y-6 flex flex-col font-sans text-charcoal max-w-7xl mx-auto px-1">
      
      {/* 0. ASCENSION PROJECT PROGRESS BAR (Global User Instruction Mandate) */}
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-[rgba(184,135,61,0.18)] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FFF9E6] text-antiquegold flex items-center justify-center">
            <Hammer className="w-4 h-4 text-antiquegold animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-warmgray uppercase tracking-wider">PROJECT PROGRESS MONITOR</p>
            <p className="text-xs font-bold text-charcoal">AIEC sequential build tracker</p>
          </div>
        </div>
        
        {/* Progress bars matching instruction */}
        <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono font-bold">
              <span className="text-royalemerald">CURRENT MODULE COMPILATION</span>
              <span className="text-royalemerald">40%</span>
            </div>
            <div className="w-full h-2 bg-[#F8F6F1] rounded-full overflow-hidden border border-[#e5dfd4]">
              <div className="h-full bg-royalemerald rounded-full transition-all duration-500" style={{ width: '40%' }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono font-bold">
              <span className="text-antiquegold">TOTAL SEQUENTIAL PLATFORM CONSTRUCT</span>
              <span className="text-antiquegold">7%</span>
            </div>
            <div className="w-full h-2 bg-[#F8F6F1] rounded-full overflow-hidden border border-[#e5dfd4]">
              <div className="h-full bg-antiquegold rounded-full transition-all duration-500" style={{ width: '7%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 1. HERO HEADER WITH IDENTIFIER & DATE SWITCHERS */}
      <div className="bg-white p-5 rounded-3xl border border-[rgba(184,135,61,0.15)] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4 text-left">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2.5 bg-[#F8F6F1] hover:bg-white border border-[#e5dfd4] rounded-xl hover:border-antiquegold transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-charcoal" />
            </button>
          )}

          <div className="relative">
            <img 
              src={activeTechObj.avatar} 
              alt={activeTechObj.name} 
              className="w-14 h-14 rounded-2xl border-2 border-antiquegold object-cover shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success border-2 border-white rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-charcoal">{activeTechObj.name}</h2>
              <span className="px-2 py-0.5 bg-antiquegold/10 border border-antiquegold/20 text-antiquegold text-[9px] font-mono uppercase font-bold rounded">
                Lead Installer
              </span>
            </div>
            <p className="text-xs text-warmgray mt-0.5 font-medium">{activeTechObj.grade}</p>
            <p className="text-[10px] text-warmgray/75 mt-1 font-mono">Commissioned since: {activeTechObj.joinedDate}</p>
          </div>
        </div>

        {/* Dynamic Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Switch Active Technician */}
          <div className="relative">
            <select
              value={activeTechId}
              onChange={(e) => setActiveTechId(e.target.value)}
              className="pl-3 pr-8 py-2.5 bg-[#F8F6F1] hover:bg-white rounded-xl border border-[#e5dfd4] hover:border-antiquegold text-xs font-bold text-charcoal outline-none cursor-pointer transition-all appearance-none"
            >
              {techniciansList.map(t => (
                <option key={t.id} value={t.id}>Auditing: {t.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-warmgray absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-[#F8F6F1] px-3.5 py-2 rounded-xl border border-[#e5dfd4]">
            <Calendar className="w-4 h-4 text-antiquegold stroke-[1.5]" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-charcoal outline-none cursor-pointer"
            />
          </div>

        </div>

      </div>

      {/* ERROR / EDGE CASE VIEWER: Pre-Joining Date */}
      {isBeforeJoiningDate ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[rgba(184,135,61,0.22)] max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-[#FFF9E6] border border-antiquegold/20 text-antiquegold rounded-full flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8 stroke-[1.2]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal">Pre-Commission Work Interval</h3>
            <p className="text-xs text-warmgray max-w-sm mx-auto mt-1 leading-relaxed">
              Mr. {activeTechObj.name} was onboarded to the AIEC system on <strong className="text-charcoal">{activeTechObj.joinedDate}</strong>. Operational telemetry records are not tracked before this interval.
            </p>
          </div>
          <Button 
            variant="secondary" 
            className="text-xs px-4" 
            onClick={() => setSelectedDate('2026-07-08')}
          >
            Reset to Active Work Day
          </Button>
        </div>
      ) : !activeJobData ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[rgba(184,135,61,0.22)] max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-alabaster border border-[#e5dfd4] text-warmgray rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8 stroke-[1.2]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal">No Shift Telemetry Captured</h3>
            <p className="text-xs text-warmgray max-w-sm mx-auto mt-1 leading-relaxed">
              There are no recorded site check-ins, SOP logs, or progress submissions for {activeTechObj.name} on {selectedDate}.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <button 
              onClick={() => setSelectedDate('2026-07-08')}
              className="px-4 py-2 bg-royalemerald text-white text-xs font-bold rounded-xl"
            >
              Check Current Shift (July 8)
            </button>
            <button 
              onClick={() => setSelectedDate('2026-07-07')}
              className="px-4 py-2 bg-white border border-[#e5dfd4] text-xs font-bold rounded-xl"
            >
              Verify July 7, 2026
            </button>
          </div>
        </div>
      ) : (
        
        /* 2. ACTIVE JOB WORKSPACE GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 5 COLUMNS: SITE CONTEXT & SHIFT LOGS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* SITE WORK DETAILS CARD */}
            <div className="bg-white p-5 rounded-3xl border border-[rgba(184,135,61,0.15)] shadow-sm text-left space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-antiquegold uppercase tracking-widest">
                  Installation Job Record
                </span>
                <h3 className="font-serif text-lg font-bold text-charcoal mt-1">
                  {activeJobData.siteName}
                </h3>
                <p className="text-xs text-warmgray flex items-center gap-1.5 mt-1 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-royalemerald shrink-0" />
                  {activeJobData.address}
                </p>
              </div>

              {/* EDGE CASE: SCHEDULE MISMATCH WARNING BANNER */}
              {!activeJobData.scheduleMatch && (
                <div className="bg-error/5 border border-error/25 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#B23B3B] uppercase tracking-wider">Schedule Mismatch Detected</p>
                    <p className="text-[11px] leading-relaxed text-charcoal/80">
                      The technician check-in is logged on this site, but there is <strong className="text-charcoal">no scheduled elevator installation</strong> registered for this date in the core CRM planner. Manual supervisor approval recommended.
                    </p>
                  </div>
                </div>
              )}

              {/* EDGE CASE: GPS OUTLIER HIGH-RISK WARNING BANNER */}
              {activeJobData.gpsOutlierAlert && (
                <div className="bg-error/5 border border-error/25 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-error shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#B23B3B] uppercase tracking-wider">SAFETY VIOLATION ALERT</p>
                    <p className="text-[11px] leading-relaxed text-charcoal/80">
                      {activeJobData.outlierReason} Left-site trace flagged. Active safety brakes must be manually secured before continuing.
                    </p>
                    <button
                      onClick={() => {
                        setEscalationSeverity('critical');
                        setEscalationNotes('Safety alert: Technician has left the premises while elevator machine room testing was in-progress.');
                        setShowEscalationModal(true);
                      }}
                      className="text-[10px] font-bold text-[#B23B3B] underline hover:text-[#913030] mt-1.5 block text-left"
                    >
                      Trigger Emergency Escalation Protocol →
                    </button>
                  </div>
                </div>
              )}

              {/* COMPREHENSIVE MULTI-TECHNICIAN SHIFT LOGGER */}
              <div className="space-y-3.5 pt-3 border-t border-[#F8F6F1]">
                <h4 className="text-[10px] uppercase font-mono font-bold text-warmgray tracking-widest flex items-center justify-between">
                  <span>DEPLOYED SHIFT AUDITS</span>
                  <Badge variant="captured">Multi-Team Onsite</Badge>
                </h4>

                <div className="space-y-3">
                  {activeJobData.assignedTechnicians.map((log, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#FAF9F5] p-3 rounded-2xl border border-[rgba(184,135,61,0.06)] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img src={log.technicianAvatar} alt={log.technicianName} className="w-8 h-8 rounded-xl object-cover border border-[#e5dfd4]" />
                          <div>
                            <p className="text-xs font-bold text-charcoal">{log.technicianName}</p>
                            <p className="text-[9px] uppercase text-warmgray font-semibold font-mono">{log.roleType === 'lead' ? 'Lead Installer' : 'Assistant / Helper'}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-royalemerald bg-[#E6F7ED] px-2 py-0.5 rounded border border-[#2E8F5B]/15">
                          Check-in: {log.checkInTime}
                        </span>
                      </div>

                      {/* GPS Radius Check Status */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-[#e5dfd4]/45 pt-2">
                        <div>
                          <span className="text-warmgray text-[8px] uppercase font-bold block">GPS Site Offset</span>
                          <span className={`font-mono font-bold ${log.distanceFromSiteMeters > 30 ? 'text-[#B23B3B]' : 'text-royalemerald'}`}>
                            {log.distanceFromSiteMeters} meters
                          </span>
                        </div>
                        <div>
                          <span className="text-warmgray text-[8px] uppercase font-bold block">Check-in Accuracy</span>
                          <span className="font-mono text-charcoal font-semibold">
                            ±{log.gpsAccuracyMeters}m radius
                          </span>
                        </div>
                      </div>

                      {/* GPS LOCK VALIDATOR STATUS */}
                      <div className={`p-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5 ${
                        log.isCheckInValid 
                          ? 'bg-[#E6F7ED] text-[#124B2C] border border-[#2E8F5B]/10' 
                          : 'bg-error/5 text-[#B23B3B] border border-error/15 animate-pulse'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${log.isCheckInValid ? 'bg-success' : 'bg-error animate-ping'}`} />
                        <span>
                          {log.isCheckInValid 
                            ? 'GPS Verified within 30m Site Perimeter' 
                            : 'GPS OUTLIER VERIFICATION FAILED! Outside site perimeter check'
                          }
                        </span>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* DIRECT COMMS AND SHIFT AUDIT */}
            <div className="bg-white p-5 rounded-3xl border border-[rgba(184,135,61,0.15)] space-y-4 shadow-sm text-left">
              <div>
                <h4 className="font-serif text-base font-bold text-charcoal">Escalate & Coordinate</h4>
                <p className="text-xs text-warmgray">Directly dial or trigger panic/delay state override for {activeTechObj.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a 
                  href={`tel:${activeTechObj.phone}`}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 bg-royalemerald hover:bg-opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Lead</span>
                </a>

                <button 
                  onClick={() => {
                    setEscalationSeverity('critical');
                    setEscalationNotes(`Manual panic dispatch triggered by Admin for ${activeTechObj.name} at ${activeJobData.siteName}.`);
                    setShowEscalationModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 bg-error hover:bg-[#a13232] text-white font-bold text-xs rounded-xl transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Escalate Alert</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT 7 COLUMNS: SOP SECTOR & TIMELINE VISUALIZER */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SOP PROGRESS / EVIDENCE GRID TAB TOGGLE */}
            <div className="bg-white rounded-3xl border border-[rgba(184,135,61,0.15)] shadow-sm overflow-hidden text-left">
              
              {/* Tab Header bar */}
              <div className="flex border-b border-[#F8F6F1] bg-alabaster p-1">
                <button
                  onClick={() => setActiveTab('sop')}
                  className={`flex-1 py-3 px-4 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'sop' 
                      ? 'bg-white text-antiquegold border border-[rgba(184,135,61,0.12)] shadow-xs' 
                      : 'text-warmgray hover:text-charcoal'
                  }`}
                >
                  <Hammer className="w-4 h-4 stroke-[1.5]" />
                  <span>SOP Steps Audit</span>
                </button>

                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`flex-1 py-3 px-4 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'evidence' 
                      ? 'bg-white text-antiquegold border border-[rgba(184,135,61,0.12)] shadow-xs' 
                      : 'text-warmgray hover:text-charcoal'
                  }`}
                >
                  <Camera className="w-4 h-4 stroke-[1.5]" />
                  <span>Evidence Files ({activeJobData.evidencePhotos.length})</span>
                </button>
              </div>

              {/* TAB CONTENT 1: SOP STEP ACCORDIANS WITH THE ASCENSION LINE */}
              {activeTab === 'sop' && (
                <div className="p-5 space-y-5">
                  <div className="flex justify-between items-center bg-[#FFF9E6] p-3.5 rounded-2xl border border-[#D4AF37]/15">
                    <div className="flex items-center gap-2 text-xs">
                      <Sparkles className="w-4.5 h-4.5 text-antiquegold" />
                      <div>
                        <p className="font-extrabold text-[#8C6412]">Ascension Line SOP Mode</p>
                        <p className="text-[11px] text-warmgray">Real-time checklist of site clearance milestones</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold bg-white text-antiquegold px-2.5 py-1 rounded-xl border border-antiquegold/25">
                      Completed: 3/5 Steps
                    </span>
                  </div>

                  {/* SOP Milestone Timeline vertical Ascension line style */}
                  <div className="space-y-5 relative pl-5 border-l-2 border-antiquegold/35 ml-2 pt-2">
                    {activeJobData.sopSteps.map((step, index) => {
                      return (
                        <div key={step.id} className="relative text-left space-y-1.5">
                          
                          {/* Circle bullet index indicator */}
                          <span className={`absolute -left-[28px] top-1 w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-sm ${
                            step.completed ? 'bg-success border-success text-white' :
                            step.isHighRisk ? 'bg-[#FFF9E6] border-antiquegold text-antiquegold animate-pulse' :
                            'bg-white border-[#e5dfd4] text-warmgray'
                          }`}>
                            {step.completed ? '✓' : index + 1}
                          </span>

                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-serif text-sm font-bold text-charcoal">
                                {step.label}
                              </h4>
                              
                              <p className="text-[11px] text-warmgray font-medium">
                                Phase: <span className="uppercase text-[9px] font-extrabold">{step.phase}</span>
                              </p>
                            </div>

                            {/* Tags / Badges */}
                            <div className="flex gap-1.5">
                              {step.isHighRisk && (
                                <span className="px-1.5 py-0.5 bg-error/5 border border-error/10 text-error text-[8px] font-extrabold rounded-md uppercase tracking-wider">
                                  SAFETY CRITICAL
                                </span>
                              )}
                              
                              <span className={`text-[10px] font-bold ${step.completed ? 'text-success' : 'text-antiquegold'}`}>
                                {step.completed ? 'Approved' : 'In-Progress'}
                              </span>
                            </div>
                          </div>

                          {/* Extra internal logs if completed */}
                          {step.completed && (
                            <div className="text-[11px] text-warmgray flex items-center gap-1.5 bg-[#F8F6F1] px-2.5 py-1.5 rounded-lg border border-[#e5dfd4]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                              <span>Verified at {step.completedAt} by {step.verifiedBy}</span>
                            </div>
                          )}

                          {/* Warn of incomplete checkout while steps are remaining */}
                          {!step.completed && index === 3 && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs space-y-1">
                              <p className="font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Incomplete Checkout Alert Active
                              </p>
                              <p className="text-[11px] leading-relaxed opacity-90">
                                This step is high-risk. If checkout is attempted before completing this step, the system will prevent automatic closure and lock out the partner payment link until manual supervisor audit.
                              </p>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB CONTENT 2: PHYSICAL PHOTO EVIDENCE FILE GALLERY */}
              {activeTab === 'evidence' && (
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-charcoal">Uploaded Evidence Audits</h4>
                      <p className="text-xs text-warmgray">Approve/Reject field photos to release payment milestones</p>
                    </div>
                  </div>

                  {activeJobData.evidencePhotos.length === 0 ? (
                    <div className="p-12 text-center bg-alabaster rounded-2xl border border-dashed border-[#e5dfd4] text-warmgray">
                      No files uploaded yet for this shift.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeJobData.evidencePhotos.map(photo => (
                        <div 
                          key={photo.id}
                          className="border border-[#e5dfd4] rounded-2xl bg-white overflow-hidden p-3 space-y-3 shadow-xs hover:border-antiquegold transition-all cursor-pointer"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-alabaster">
                            <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                            <span className={`absolute top-2 right-2 px-2 py-0.5 text-[8px] font-extrabold uppercase rounded-md tracking-wider border ${
                              photo.verifiedStatus === 'approved' ? 'bg-[#E6F7ED] border-[#2E8F5B]/30 text-[#124B2C]' :
                              photo.verifiedStatus === 'rejected' ? 'bg-error/5 border-error/10 text-[#B23B3B]' :
                              'bg-[#FFF9E6] border-[#D4AF37]/30 text-[#8C6412]'
                            }`}>
                              {photo.verifiedStatus}
                            </span>
                          </div>

                          <div className="space-y-1 text-left">
                            <h5 className="font-serif text-xs font-bold text-charcoal truncate">{photo.title}</h5>
                            <div className="flex justify-between text-[10px] text-warmgray font-mono">
                              <span>Uploaded: {photo.uploadedAt}</span>
                              <span className="text-royalemerald font-semibold">SOP Step Ref</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* SIMULATED DEVICE GPS TELEMETRY AUDIT LOG */}
            <div className="bg-white p-5 rounded-3xl border border-[rgba(184,135,61,0.15)] shadow-sm text-left space-y-4">
              <div>
                <h4 className="font-serif text-base font-bold text-charcoal">Real-time Device Telemetry Trace</h4>
                <p className="text-xs text-warmgray">Audit sensor pings, high-risk flags, and system handshakes</p>
              </div>

              <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[rgba(184,135,61,0.06)] font-mono text-[11px] space-y-2.5 text-charcoal/85">
                <div className="flex justify-between border-b pb-1.5 border-[#e5dfd4]/40">
                  <span className="text-warmgray">TIMESTAMP</span>
                  <span className="text-warmgray">SENSORS HANDSHAKE</span>
                  <span className="text-warmgray">STATUS</span>
                </div>
                <div className="flex justify-between">
                  <span>02:30 PM</span>
                  <span>Sensor: Laser Calibration Lock</span>
                  <span className="text-success font-bold">READY</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>02:15 PM</span>
                  <span>GPS Precision Alert (±45m)</span>
                  <span className="font-bold">LOW_PRECISION</span>
                </div>
                <div className="flex justify-between">
                  <span>01:45 PM</span>
                  <span>SOP Step 3 Complete: Motor Anchored</span>
                  <span className="text-success font-bold">COMMITTED</span>
                </div>
                <div className="flex justify-between">
                  <span>08:45 AM</span>
                  <span>Initial Geo-Fence Handshake</span>
                  <span className="text-success font-bold">VERIFIED_SITE</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================
          3. FULL SCREEN PORTAL: EVIDENCE INSPECTOR MODAL
          ========================================================= */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#F8F6F1] max-w-lg w-full rounded-3xl border border-[rgba(184,135,61,0.22)] shadow-2xl p-6 relative text-left space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#e5dfd4]">
                <div>
                  <span className="text-[9px] font-mono font-extrabold uppercase text-antiquegold tracking-widest">
                    Milestone Quality Inspection
                  </span>
                  <h3 className="font-serif text-base font-bold text-charcoal">
                    {selectedPhoto.title}
                  </h3>
                </div>
                <button onClick={() => setSelectedPhoto(null)} className="p-1.5 hover:bg-white rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Real Photo view */}
              <div className="rounded-xl overflow-hidden border border-[#e5dfd4] aspect-video bg-black flex items-center justify-center relative">
                <img src={selectedPhoto.url} alt={selectedPhoto.title} className="max-w-full max-h-full object-contain" />
              </div>

              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[rgba(184,135,61,0.06)] text-xs">
                <div className="flex justify-between">
                  <span className="text-warmgray">Milestone Ref:</span>
                  <span className="font-bold text-charcoal">{selectedPhoto.sopStepId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warmgray">Upload Interval:</span>
                  <span className="font-mono text-charcoal">{selectedPhoto.uploadedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warmgray">Current Status:</span>
                  <span className="font-mono font-bold text-antiquegold uppercase">{selectedPhoto.verifiedStatus}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handlePhotoApprove(selectedPhoto.id, 'approved')}
                  className="flex-1 py-2.5 bg-royalemerald hover:bg-opacity-95 text-white font-bold text-xs rounded-xl"
                >
                  Approve & Release Milestone
                </button>
                <button
                  onClick={() => handlePhotoApprove(selectedPhoto.id, 'rejected')}
                  className="flex-1 py-2.5 bg-error hover:bg-[#a53232] text-white font-bold text-xs rounded-xl"
                >
                  Reject Photo & Require Retake
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          4. EMERGENCY ESCALATION PROTOCOL TICKET MODAL
          ========================================================= */}
      <AnimatePresence>
        {showEscalationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#F8F6F1] max-w-lg w-full rounded-3xl border border-[rgba(184,135,61,0.22)] shadow-2xl p-6 relative text-left space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#e5dfd4]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-error animate-pulse" />
                  <div>
                    <span className="text-[9px] font-mono font-extrabold uppercase text-[#B23B3B] tracking-widest">
                      CRITICAL DISPATCH HUB
                    </span>
                    <h3 className="font-serif text-lg font-bold text-charcoal">
                      Escalate Security / Delay Event
                    </h3>
                  </div>
                </div>
                <button onClick={() => setShowEscalationModal(false)} className="p-1.5 hover:bg-white rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Escalation input form */}
              <div className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-warmgray tracking-widest block">
                    Escalation Severity Class
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEscalationSeverity('amber')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        escalationSeverity === 'amber'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-700 font-extrabold'
                          : 'bg-white border-[#e5dfd4] text-warmgray'
                      }`}
                    >
                      Class B: Log Delay / Minor Risk
                    </button>
                    <button
                      type="button"
                      onClick={() => setEscalationSeverity('critical')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        escalationSeverity === 'critical'
                          ? 'bg-error/10 border-error text-[#B23B3B] font-extrabold'
                          : 'bg-white border-[#e5dfd4] text-warmgray'
                      }`}
                    >
                      Class A: Core Safety / Crash Panic
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-warmgray tracking-widest block">
                    Pre-filled System Context
                  </label>
                  <div className="bg-white p-3 rounded-xl border text-[11px] space-y-1 text-charcoal/80">
                    <p><strong>Lead Technician:</strong> {activeTechObj.name}</p>
                    <p><strong>Active Site:</strong> {activeJobData.siteName}</p>
                    <p><strong>GPS Radius Lock Status:</strong> {activeJobData.gpsOutlierAlert ? 'OUTLIER FAULT' : 'VERIFIED PERIMETER'}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-warmgray tracking-widest block">
                    Additional Supervisor Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe specific fault codes, physical injuries, structural failures, or client builder communications..."
                    value={escalationNotes}
                    onChange={(e) => setEscalationNotes(e.target.value)}
                    className="w-full p-3 bg-white rounded-xl border border-[#e5dfd4] text-xs outline-none focus:border-antiquegold font-sans"
                  />
                </div>

              </div>

              {/* Form Footer action */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="primary" 
                  fullWidth
                  onClick={handleEscalationSubmit}
                  disabled={escalationSubmitted}
                >
                  {escalationSubmitted ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Broadcasting Emergency Signal...</span>
                    </>
                  ) : (
                    <span>Raise Global Panic Alarm & Suspend Site</span>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowEscalationModal(false)}
                >
                  Cancel
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
