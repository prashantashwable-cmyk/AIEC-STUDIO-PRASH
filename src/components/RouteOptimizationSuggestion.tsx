import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, MapPin, CheckCircle2, AlertTriangle, User, Users, ShieldAlert,
  ArrowRight, Sparkles, Plus, Clock, Search, Filter, Shield, Info, Settings,
  AlertCircle, RefreshCw, Star, Battery, HelpCircle
} from 'lucide-react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker 
} from '@vis.gl/react-google-maps';
import { DbManager } from '../lib/db';
import { User as UserType, Lead, Job } from '../types';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface RouteOptimizationSuggestionProps {
  user: UserType;
  apiKey?: string;
  hasValidKey?: boolean;
}

interface DispatchTask {
  id: string;
  type: 'lead_survey' | 'installation_job';
  title: string;
  location: string;
  lat: number;
  lng: number;
  floors: number;
  driveType?: string;
  customerName: string;
  phone: string;
  createdAt: string;
  assignedToId?: string;
}

interface Candidate {
  id: string;
  name: string;
  role: 'surveyor' | 'technician';
  avatarUrl?: string;
  phone: string;
  lat: number;
  lng: number;
  currentWorkload: number;
  skillTags: string[];
  isOnLeave: boolean;
  isNewOnboard: boolean;
  battery: number;
}

export function RouteOptimizationSuggestion({ user, apiKey, hasValidKey }: RouteOptimizationSuggestionProps) {
  // 1. Dispatch State
  const [tasks, setTasks] = useState<DispatchTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [maxRadius, setMaxRadius] = useState<number>(30); // km threshold
  const [simulateCollision, setSimulateCollision] = useState<boolean>(false);
  const [collisionTargetId, setCollisionTargetId] = useState<string | null>(null);

  // Search/Filter for tasks
  const [taskSearch, setTaskSearch] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState<'all' | 'lead_survey' | 'installation_job'>('all');

  // Map settings (Default to google)
  const [mapMode, setMapMode] = useState<'google' | 'vector'>(hasValidKey ? 'google' : 'vector');
  const [showKeyInfo, setShowKeyInfo] = useState(false);

  useEffect(() => {
    if (hasValidKey) {
      setMapMode('google');
    } else {
      setMapMode('vector');
    }
  }, [hasValidKey]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Custom toast list
  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'success' | 'info' | 'error' }[]>([]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToasts(prev => [...prev, { id: `toast_${Date.now()}_${Math.random()}`, text, type }]);
  };

  // 2. Initialize Seed Dispatch Tasks & Candidates
  useEffect(() => {
    // Seed unassigned tasks and custom staff properties if needed
    const leads = DbManager.getLeads();
    const jobs = DbManager.getJobs();
    
    // Construct uniform dispatch tasks list
    const unassignedTasks: DispatchTask[] = [];

    // Leads with stage 'captured' or unassigned
    leads.forEach(lead => {
      const isUnassigned = !lead.surveyorId || lead.stage === 'captured';
      unassignedTasks.push({
        id: lead.id,
        type: 'lead_survey',
        title: `Site Survey: ${lead.buildingInfo.type.toUpperCase()} Elevator Shaft`,
        location: lead.buildingInfo.address,
        lat: lead.buildingInfo.latitude || 18.5112,
        lng: lead.buildingInfo.longitude || 73.8344,
        floors: lead.buildingInfo.floors,
        driveType: lead.buildingInfo.driveType || 'traction',
        customerName: lead.contactInfo.name,
        phone: lead.contactInfo.phone,
        createdAt: lead.createdAt,
        assignedToId: lead.surveyorId
      });
    });

    // Jobs with pending state
    jobs.forEach(job => {
      const lead = leads.find(l => l.id === job.dealId || l.id === 'lead_1');
      const isUnassigned = !job.technicianId || job.status === 'pending';
      unassignedTasks.push({
        id: job.id,
        type: 'installation_job',
        title: `Installation Job: ${lead?.buildingInfo.type.toUpperCase() || 'RESIDENTIAL'} Elevator Setup`,
        location: lead?.buildingInfo.address || 'Chakan Industrial Estate, Pune',
        lat: lead?.buildingInfo.latitude || 18.5913,
        lng: lead?.buildingInfo.longitude || 73.7389,
        floors: lead?.buildingInfo.floors || 6,
        driveType: lead?.buildingInfo.driveType || 'traction',
        customerName: lead?.contactInfo.name || 'Industrial Plant',
        phone: lead?.contactInfo.phone || '+91 95000 11000',
        createdAt: job.startedAt || new Date().toISOString(),
        assignedToId: job.technicianId
      });
    });

    // Add extra unassigned ones specifically to showcase routing beautifully if none
    if (unassignedTasks.filter(t => !t.assignedToId).length === 0) {
      unassignedTasks.push({
        id: 'lead_sim_1',
        type: 'lead_survey',
        title: 'Site Survey: Deshmukh Tower Lift Refit',
        location: 'Saras Baug Road, Sadashiv Peth, Pune',
        lat: 18.5020,
        lng: 73.8500,
        floors: 6,
        driveType: 'traction',
        customerName: 'Prakash Deshmukh',
        phone: '+91 98333 44455',
        createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
      });
      unassignedTasks.push({
        id: 'job_sim_2',
        type: 'installation_job',
        title: 'Installation: Chinchwad Commercial Glass Elevator',
        location: 'Thergaon Road, Chinchwad, Pune',
        lat: 18.6250,
        lng: 73.7800,
        floors: 9,
        driveType: 'hydraulic',
        customerName: 'Wable Commercials Ltd',
        phone: '+91 99222 11100',
        createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
      });
    }

    setTasks(unassignedTasks);

    // Initial selected task if none
    const firstUnassigned = unassignedTasks.find(t => !t.assignedToId);
    if (firstUnassigned && !selectedTaskId) {
      setSelectedTaskId(firstUnassigned.id);
    }

    // Seed Candidates (Surveyors & Technicians with diverse attributes)
    const initialCandidates: Candidate[] = [
      {
        id: 'amit_sharma',
        name: 'Amit Sharma',
        role: 'surveyor',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        phone: '+91 98765 43211',
        lat: 18.5112,
        lng: 73.8344,
        currentWorkload: 1,
        skillTags: ['traction', 'residential'],
        isOnLeave: false,
        isNewOnboard: false,
        battery: 89,
      },
      {
        id: 'sanjay_deshmukh',
        name: 'Sanjay Deshmukh',
        role: 'surveyor',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: '+91 99887 76655',
        lat: 18.5074,
        lng: 73.8077,
        currentWorkload: 3,
        skillTags: ['hydraulic', 'commercial'],
        isOnLeave: false,
        isNewOnboard: false,
        battery: 58,
      },
      {
        id: 'rajesh_patel',
        name: 'Rajesh Patel',
        role: 'technician',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        phone: '+91 98765 43212',
        lat: 18.5600,
        lng: 73.8000,
        currentWorkload: 1,
        skillTags: ['traction', 'commercial', 'machine-room-less'],
        isOnLeave: false,
        isNewOnboard: false,
        battery: 92,
      },
      {
        id: 'anil_kamble',
        name: 'Anil Kamble',
        role: 'technician',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        phone: '+91 91234 56780',
        lat: 18.7100,
        lng: 73.8600,
        currentWorkload: 5, // High Workload
        skillTags: ['traction', 'industrial'],
        isOnLeave: false,
        isNewOnboard: false,
        battery: 15,
      },
      {
        id: 'kiran_shinde',
        name: 'Kiran Shinde',
        role: 'technician',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        phone: '+91 97766 55443',
        lat: 18.5512,
        lng: 73.9389,
        currentWorkload: 2,
        skillTags: ['hydraulic', 'traction'],
        isOnLeave: false,
        isNewOnboard: false,
        battery: 74,
      },
      {
        id: 'rohit_more',
        name: 'Rohit More',
        role: 'technician',
        avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150',
        phone: '+91 91555 88990',
        lat: 18.5204,
        lng: 73.8567,
        currentWorkload: 0,
        skillTags: ['traction', 'hydraulic', 'residential'],
        isOnLeave: false,
        isNewOnboard: true, // Newly Onboarded! Fairly ranked
        battery: 100,
      },
      {
        id: 'gopal_mankar',
        name: 'Gopal Mankar (On Approved Leave)',
        role: 'technician',
        avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150',
        phone: '+91 98111 22233',
        lat: 18.5300,
        lng: 73.8400,
        currentWorkload: 0,
        skillTags: ['traction'],
        isOnLeave: true, // ON LEAVE! Automatically excluded
        isNewOnboard: false,
        battery: 95,
      }
    ];

    setCandidates(initialCandidates);
  }, [selectedTaskId]);

  // Coordinate mapping for the map overlay
  const mapCenterLat = 18.5204;
  const mapCenterLng = 73.8567;
  const latScale = 12000; // slightly higher scale for zoom detail
  const lngScale = 12000;

  const getVectorCoords = (lat: number, lng: number) => {
    const x = 500 + (lng - mapCenterLng) * lngScale;
    const y = 500 - (lat - mapCenterLat) * latScale;
    return { x, y };
  };

  // Vector map panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Distance computation (Haversine Formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
  };

  const activeTask = tasks.find(t => t.id === selectedTaskId);

  // Advanced scoring logic combining Proximity, Workload, and Skill Match
  const getRankedCandidates = () => {
    if (!activeTask) return [];

    const matchedRole = activeTask.type === 'lead_survey' ? 'surveyor' : 'technician';

    return candidates
      .filter(c => c.role === matchedRole)
      // rule: exclude if on approved leave
      .filter(c => !c.isOnLeave)
      .map(candidate => {
        const distance = calculateDistance(activeTask.lat, activeTask.lng, candidate.lat, candidate.lng);
        
        // Calculate ETA: roughly 2.5 mins per km + traffic buffer
        const eta = Math.round(distance * 2.5 + 4);

        // Scoring: 
        // 1. Proximity score (0 to 40 points): max points for 0km, scaling down to 0 points at maxRadius
        const proximityScore = Math.max(0, 40 - (distance / maxRadius) * 40);

        // 2. Workload score (0 to 30 points): less workload gets higher points
        // Workload points = 30 - (workload * 6), capped at 0
        const workloadScore = Math.max(0, 30 - (candidate.currentWorkload * 6));

        // 3. Skill & Drive match score (0 to 30 points):
        let skillScore = 15; // default baseline
        if (activeTask.driveType && candidate.skillTags.includes(activeTask.driveType.toLowerCase())) {
          skillScore += 15;
        }

        // Newly onboarded bonus: rank fairly, don't penalize for no track record, add fair rank boost
        let newStaffBonus = 0;
        if (candidate.isNewOnboard) {
          newStaffBonus = 12; // rank boost for new hires to distribute tasks
        }

        const totalScore = Math.min(100, Math.round(proximityScore + workloadScore + skillScore + newStaffBonus));

        return {
          ...candidate,
          distance,
          eta,
          totalScore,
          breakdown: { proximityScore, workloadScore, skillScore, newStaffBonus }
        };
      })
      // sort by score descending
      .sort((a, b) => b.totalScore - a.totalScore);
  };

  const rankedCandidates = getRankedCandidates();

  // Filter candidates that are within the selected radius
  const eligibleCandidates = rankedCandidates.filter(c => c.distance <= maxRadius);

  // 3. One-Tap Assign action (with double-assignment collision simulation)
  const handleAssignTask = (candidateId: string) => {
    if (!activeTask) return;

    // Simulated collision block
    if (simulateCollision) {
      setCollisionTargetId(activeTask.id);
      showToast(`⚠️ Conflict Detected! Double-Assignment Collision Blocked.`, 'error');
      return;
    }

    // Standard assignment flow
    const updatedTasks = tasks.map(t => {
      if (t.id === activeTask.id) {
        return { ...t, assignedToId: candidateId };
      }
      return t;
    });

    setTasks(updatedTasks);
    
    // Increment the assigned candidate's workload in local list
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        return { ...c, currentWorkload: c.currentWorkload + 1 };
      }
      return c;
    }));

    // Update the real database (Lead surveyor or Job technician)
    if (activeTask.type === 'lead_survey') {
      const lead = DbManager.getLeadById(activeTask.id);
      if (lead) {
        DbManager.updateLead({
          ...lead,
          surveyorId: candidateId,
          stage: 'assigned'
        });
      }
    } else {
      const job = DbManager.getJobById(activeTask.id);
      if (job) {
        DbManager.updateJob({
          ...job,
          technicianId: candidateId,
          status: 'in_progress'
        });
      }
    }

    showToast(`✓ Task assigned to ${candidates.find(c => c.id === candidateId)?.name}. Field notification dispatched!`, 'success');
  };

  // Progress Bar Calculations (Show each time current % progress bar & total % progress bar)
  // Current efficiency (Percentage of tasks in current queue that are assigned)
  const assignedCount = tasks.filter(t => t.assignedToId).length;
  const currentDispatchProgress = tasks.length > 0
    ? Math.round((assignedCount / tasks.length) * 100)
    : 100;

  // Total system efficiency (Utilization index: staff members under optimal load (< 4 current tasks))
  const optimalStaffCount = candidates.filter(c => c.currentWorkload < 4 && !c.isOnLeave).length;
  const totalStaffProgress = candidates.filter(c => !c.isOnLeave).length > 0
    ? Math.round((optimalStaffCount / candidates.filter(c => !c.isOnLeave).length) * 100)
    : 100;

  const handleResetCollision = () => {
    setCollisionTargetId(null);
    setSimulateCollision(false);
  };

  // Task list filtering
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.location.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.customerName.toLowerCase().includes(taskSearch.toLowerCase());

    const matchesType = 
      taskTypeFilter === 'all' ? true :
      taskTypeFilter === t.type;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. TOP EFFICIENCY STRIP & PROGRESS BARS (Satisfying progress bar requirements) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CURRENT DISPATCH PROGRESS BAR */}
        <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.15)] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-royalemerald/10 text-royalemerald">
                <Compass className="w-4 h-4" />
              </span>
              <h4 className="font-serif text-sm font-bold text-charcoal">Current Dispatch Index</h4>
            </div>
            <span className="font-mono text-xs font-bold text-royalemerald">{currentDispatchProgress}%</span>
          </div>
          
          <div className="w-full bg-[#F8F6F1] h-2.5 rounded-full overflow-hidden border border-[rgba(184,135,61,0.08)]">
            <div 
              className="bg-royalemerald h-full transition-all duration-700 ease-out rounded-full"
              style={{ width: `${currentDispatchProgress}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] text-warmgray">Assigned vs Unassigned current tasks</span>
            <span className="font-mono text-[10px] font-semibold text-charcoal">
              {assignedCount}/{tasks.length} Dispatched
            </span>
          </div>
        </div>

        {/* TOTAL SYSTEM HEALTH PROGRESS BAR */}
        <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.15)] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-antiquegold/10 text-[#B8873D]">
                <Star className="w-4 h-4" />
              </span>
              <h4 className="font-serif text-sm font-bold text-charcoal">Total Fleet Load Balancing Index</h4>
            </div>
            <span className="font-mono text-xs font-bold text-[#B8873D]">{totalStaffProgress}%</span>
          </div>
          
          <div className="w-full bg-[#F8F6F1] h-2.5 rounded-full overflow-hidden border border-[rgba(184,135,61,0.08)]">
            <div 
              className="bg-antiquegold h-full transition-all duration-700 ease-out rounded-full"
              style={{ width: `${totalStaffProgress}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] text-warmgray">Proportion of fleet in optimal workload thresholds</span>
            <span className="font-mono text-[10px] font-semibold text-charcoal">
              {optimalStaffCount}/{candidates.filter(c => !c.isOnLeave).length} Balanced
            </span>
          </div>
        </div>

      </div>

      {/* 2. DYNAMIC WORKSPACE WITH MAP BASE AND COLLAPSIBLE DISPATCH SHEETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Unassigned Dispatch Queue (5 Columns) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.15)] p-4 shadow-sm text-left flex flex-col flex-1">
            <div className="border-b border-[#e5dfd4] pb-3 mb-3">
              <h3 className="font-serif text-base font-bold text-charcoal">Dispatch Pending Desk</h3>
              <p className="text-[11px] text-warmgray">Select a pending field visit to locate and match optimized agents.</p>
            </div>

            {/* Task Controls */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warmgray" />
                <input
                  type="text"
                  placeholder="Search location, customer..."
                  value={taskSearch}
                  onChange={e => setTaskSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-alabaster border border-[rgba(184,135,61,0.12)] rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => setTaskTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    taskTypeFilter === 'all' ? 'bg-[#B8873D]/10 text-[#B8873D] border border-antiquegold/25' : 'bg-alabaster text-warmgray hover:text-charcoal'
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setTaskTypeFilter('lead_survey')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    taskTypeFilter === 'lead_survey' ? 'bg-[#0E4B3D]/10 text-[#0E4B3D] border border-[#0E4B3D]/25' : 'bg-alabaster text-warmgray hover:text-charcoal'
                  }`}
                >
                  Surveys
                </button>
                <button
                  onClick={() => setTaskTypeFilter('installation_job')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    taskTypeFilter === 'installation_job' ? 'bg-[#B23B3B]/10 text-[#B23B3B] border border-[#B23B3B]/25' : 'bg-alabaster text-warmgray hover:text-charcoal'
                  }`}
                >
                  Installs
                </button>
              </div>
            </div>

            {/* Scrolling Queue */}
            <div className="space-y-2.5 overflow-y-auto max-h-[420px] flex-1 pr-1">
              {filteredTasks.length === 0 ? (
                <div className="py-12 text-center text-warmgray">
                  <Compass className="w-8 h-8 mx-auto text-warmgray/40 mb-2" />
                  <p className="text-xs font-bold">No Pending Tasks</p>
                  <p className="text-[10px]">All assignments are matched or complete.</p>
                </div>
              ) : (
                filteredTasks.map(t => {
                  const isSelected = selectedTaskId === t.id;
                  const isAssigned = !!t.assignedToId;

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTaskId(t.id);
                        if (collisionTargetId) handleResetCollision();
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden ${
                        isSelected 
                          ? 'bg-[#FAF9F5] border-[#B8873D] ring-1 ring-[#B8873D]/20 shadow-xs' 
                          : 'bg-white border-[rgba(184,135,61,0.1)] hover:border-antiquegold/35'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          t.type === 'lead_survey' ? 'bg-[#0E4B3D]/10 text-[#0E4B3D]' : 'bg-[#B23B3B]/10 text-[#B23B3B]'
                        }`}>
                          {t.type === 'lead_survey' ? 'SITE SURVEY' : 'INSTALLATION'}
                        </span>
                        
                        {isAssigned ? (
                          <span className="text-[9px] font-bold text-royalemerald flex items-center gap-1 bg-royalemerald/10 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Matched</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-orange-500 animate-pulse">Pending</span>
                        )}
                      </div>

                      <h4 className="font-serif font-bold text-xs text-charcoal mt-1.5 leading-snug">{t.title}</h4>
                      
                      <div className="flex items-center gap-1 text-[10px] text-warmgray mt-1.5">
                        <MapPin className="w-3 h-3 text-antiquegold shrink-0" />
                        <span className="truncate">{t.location}</span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-dashed border-[#e5dfd4] flex justify-between items-center text-[9px] text-warmgray">
                        <span>Client: {t.customerName}</span>
                        <span className="font-mono font-semibold text-charcoal">{t.floors} Floors</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Middle/Right: Full-Bleed Map & Dynamic Suggestion Drawer (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* MAP CANVAS GRID */}
          <div className="bg-white rounded-3xl border border-[rgba(184,135,61,0.15)] h-[320px] relative overflow-hidden shadow-xs flex flex-col">
            
            {/* MAP MODE CHIP CONTROLLERS */}
            <div className="absolute top-4 left-4 z-30 flex gap-1 bg-white/95 p-1 rounded-xl backdrop-blur-md shadow-sm border border-[rgba(184,135,61,0.12)]">
              <button
                onClick={() => setMapMode('vector')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                  mapMode === 'vector' 
                    ? 'bg-[#B8873D] text-white font-bold' 
                    : 'text-warmgray hover:text-charcoal'
                }`}
              >
                👑 Vector Sandbox
              </button>
              <button
                onClick={() => {
                  if (!hasValidKey) {
                    setShowKeyInfo(true);
                  } else {
                    setMapMode('google');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all flex items-center gap-1 ${
                  mapMode === 'google' 
                    ? 'bg-royalemerald text-white font-bold' 
                    : 'text-warmgray hover:text-charcoal'
                }`}
              >
                <span>🛰️ Live Satellite (Google Maps)</span>
                {!hasValidKey && <span className="text-[8px] bg-red-100 text-red-600 px-1 py-0.25 rounded font-black">API KEY REQUIRED</span>}
              </button>
            </div>

            {/* KEY SETTING MODAL POPUP IF DEMANDED SATELLITE MAP WITHOUT KEY */}
            {showKeyInfo && (
              <div className="absolute inset-0 z-40 bg-charcoal/80 backdrop-blur-md flex items-center justify-center p-6 transition-all duration-300">
                <div className="bg-[#FAF9F5] border border-antiquegold/40 p-5 rounded-2xl max-w-sm text-left shadow-2xl relative space-y-4">
                  <div className="flex gap-2 text-[#B8873D]">
                    <HelpCircle className="w-5 h-5 shrink-0" />
                    <h3 className="font-serif font-bold text-sm text-charcoal">GCP Maps API Key Setup</h3>
                  </div>
                  <div className="text-[11px] leading-relaxed text-charcoal/80 space-y-2">
                    <p>To use live satellite mapping and professional geofencing layers here:</p>
                    <p className="font-bold text-charcoal">1. Provision or obtain a Maps API Key.</p>
                    <p className="font-bold text-charcoal">2. Enter in Settings Secrets:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Top-right gear icon ⚙️ → Secrets</li>
                      <li>Key name: <code className="bg-white px-1 py-0.5 rounded border">GOOGLE_MAPS_PLATFORM_KEY</code></li>
                      <li>Value: your real GCP map credential</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowKeyInfo(false)} 
                      className="flex-1 py-2 bg-warmgray/10 hover:bg-warmgray/20 text-charcoal font-bold text-xs rounded-xl border border-warmgray/25 transition-all text-center cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        setShowKeyInfo(false);
                        setMapMode('vector');
                      }} 
                      className="flex-1 py-2 bg-[#B8873D] hover:bg-[#a6742d] text-white font-bold text-xs rounded-xl shadow-md transition-all text-center cursor-pointer"
                    >
                      Simulated Mode
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mapMode === 'google' ? (
              <div className="absolute inset-0 w-full h-full z-0">
                {!apiKey ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF9F5] space-y-4">
                    <div className="w-8 h-8 border-4 border-royalemerald border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-warmgray font-medium tracking-wide">Initializing satellite terrain engine...</p>
                  </div>
                ) : (
                  <Map
                    defaultCenter={{ lat: mapCenterLat, lng: mapCenterLng }}
                    defaultZoom={12}
                    mapId="AIEC_ROUTE_OPTIMIZATION_MAP"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                  {/* Active Task Location Pin */}
                  {activeTask && (
                    <AdvancedMarker
                      position={{ lat: activeTask.lat, lng: activeTask.lng }}
                    >
                      <div className="relative">
                        <span className="absolute -inset-2 bg-amber-500/30 rounded-full animate-ping" />
                        <div className="w-8 h-8 rounded-full bg-[#B8873D] border-2 border-white flex items-center justify-center text-white shadow-md">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[9px] font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-xs pointer-events-none">
                          TARGET: {activeTask.id.toUpperCase()}
                        </div>
                      </div>
                    </AdvancedMarker>
                  )}

                  {/* Eligible Candidate Pins */}
                  {eligibleCandidates.map((cand, idx) => {
                    const isTopMatch = idx === 0;
                    return (
                      <AdvancedMarker
                        key={`g-pin-${cand.id}`}
                        position={{ lat: cand.lat, lng: cand.lng }}
                      >
                        <div className="relative flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-xs ${
                            isTopMatch ? 'bg-[#0E4B3D] border-[#B8873D]' : 'bg-white border-[#e5dfd4]'
                          }`}>
                            <User className={`w-3.5 h-3.5 ${isTopMatch ? 'text-white' : 'text-charcoal'}`} />
                          </div>
                          <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center ${
                            isTopMatch ? 'bg-[#B8873D]' : 'bg-warmgray'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="mt-1 px-1.5 py-0.5 bg-white border border-[#e5dfd4] rounded-md text-[9px] font-bold text-charcoal shadow-sm flex items-center gap-1 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                            {cand.name.split(' ')[0]} ({cand.distance}km)
                          </div>
                        </div>
                      </AdvancedMarker>
                    );
                  })}
                </Map>
                )}
              </div>
            ) : (
              /* Base interactive vector map layer */
              <div 
                className="w-full flex-1 relative cursor-grab active:cursor-grabbing bg-[#FAF9F5]"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div 
                  className="absolute inset-0 transition-transform duration-100 ease-out"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    backgroundImage: 'linear-gradient(to right, rgba(184, 135, 61, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(184, 135, 61, 0.08) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    transformOrigin: 'center'
                  }}
                >
                  {/* Simulated Roads/Transit system */}
                  <svg className="absolute inset-0 w-[1200px] h-[1200px] opacity-15 pointer-events-none" style={{ left: -100, top: -100 }}>
                    <line x1="0" y1="500" x2="1000" y2="500" stroke="#B8873D" strokeWidth="4" />
                    <line x1="500" y1="0" x2="500" y2="1000" stroke="#B8873D" strokeWidth="4" />
                    <circle cx="500" cy="500" r="280" fill="none" stroke="#0E4B3D" strokeWidth="3" strokeDasharray="10,6" />
                    <circle cx="500" cy="500" r="140" fill="none" stroke="#2A2723" strokeWidth="1.5" />
                  </svg>

                  {/* Draw Optimal Route Linkages if task selected */}
                  {activeTask && eligibleCandidates.slice(0, 3).map((cand, idx) => {
                    const taskCoords = getVectorCoords(activeTask.lat, activeTask.lng);
                    const candCoords = getVectorCoords(cand.lat, cand.lng);
                    
                    // Color based on rank (Gold, Emerald, and Brown)
                    const strokeColor = 
                      idx === 0 ? '#B8873D' :
                      idx === 1 ? '#0E4B3D' :
                      '#B23B3B';

                    return (
                      <svg key={`route-${cand.id}`} className="absolute inset-0 w-[1200px] h-[1200px] pointer-events-none" style={{ left: -100, top: -100 }}>
                        <defs>
                          <marker id={`arrow-${cand.id}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                            <path d="M0,0 L6,3 L0,6 Z" fill={strokeColor} />
                          </marker>
                        </defs>
                        <line 
                          x1={candCoords.x} 
                          y1={candCoords.y} 
                          x2={taskCoords.x} 
                          y2={taskCoords.y} 
                          stroke={strokeColor} 
                          strokeWidth="2" 
                          strokeDasharray="4,4"
                          className="animate-pulse"
                        />
                      </svg>
                    );
                  })}

                  {/* TASK LOCATION PIN */}
                  {activeTask && (() => {
                    const coords = getVectorCoords(activeTask.lat, activeTask.lng);
                    return (
                      <div 
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                        style={{ left: coords.x, top: coords.y }}
                      >
                        <div className="relative">
                          <span className="absolute -inset-2 bg-amber-500/30 rounded-full animate-ping" />
                          <div className="w-8 h-8 rounded-full bg-[#B8873D] border-2 border-white flex items-center justify-center text-white shadow-md">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[9px] font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-xs pointer-events-none">
                            TARGET: {activeTask.id.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* CANDIDATE LOCATION PINS */}
                  {eligibleCandidates.map((cand, idx) => {
                    const coords = getVectorCoords(cand.lat, cand.lng);
                    const isTopMatch = idx === 0;

                    return (
                      <div 
                        key={`pin-${cand.id}`}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{ left: coords.x, top: coords.y }}
                      >
                        <div className="relative">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-xs ${
                            isTopMatch ? 'bg-[#0E4B3D] border-[#B8873D]' : 'bg-white border-[#e5dfd4]'
                          }`}>
                            <User className={`w-3.5 h-3.5 ${isTopMatch ? 'text-white' : 'text-charcoal'}`} />
                          </div>
                          <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center ${
                            isTopMatch ? 'bg-[#B8873D]' : 'bg-warmgray'
                          }`}>
                            {idx + 1}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>
            )}

            {/* MAP FLOATING CONTROLS */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs border border-[rgba(184,135,61,0.15)] px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 bg-[#B8873D] rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider font-mono">Pune GIS Operations Map</span>
            </div>

            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
              <button 
                onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
                className="w-8 h-8 rounded-lg bg-white border border-[rgba(184,135,61,0.15)] font-bold text-xs text-charcoal hover:bg-[#F8F6F1] flex items-center justify-center cursor-pointer"
              >
                +
              </button>
              <button 
                onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
                className="w-8 h-8 rounded-lg bg-white border border-[rgba(184,135,61,0.15)] font-bold text-xs text-charcoal hover:bg-[#F8F6F1] flex items-center justify-center cursor-pointer"
              >
                -
              </button>
            </div>

            {/* DYNAMIC LEADERBOARD RADIUS THRESHOLD */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs border border-[rgba(184,135,61,0.15)] p-2 rounded-xl flex items-center gap-2 shadow-xs">
              <span className="text-[10px] font-bold text-warmgray">Matching Range:</span>
              <input 
                type="range" 
                min="10" 
                max="50" 
                value={maxRadius} 
                onChange={e => setMaxRadius(parseInt(e.target.value))}
                className="w-20 accent-[#B8873D] h-1"
              />
              <span className="text-[10px] font-mono font-bold text-charcoal">{maxRadius}km</span>
            </div>
          </div>

          {/* SUGGESTION / COLLAPSIBLE DRAWER IN THE GRID */}
          <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.15)] p-4 shadow-sm text-left flex-1 space-y-4">
            
            {/* Target Header */}
            {activeTask ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5dfd4] pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif text-sm font-bold text-charcoal">
                      Matching Recommendation for Task {activeTask.id.toUpperCase()}
                    </h3>
                    <span className="text-[10px] bg-amber-100 text-[#B8873D] px-1.5 py-0.5 rounded font-bold font-mono">
                      {activeTask.driveType?.toUpperCase()} Setup
                    </span>
                  </div>
                  <p className="text-[10px] text-warmgray mt-0.5">Weighs proximity, current workload balance, and relevant elevator experience tags.</p>
                </div>

                {/* Double Assignment Simulator Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-warmgray">Simulate Admin Collision</span>
                  <button
                    onClick={() => setSimulateCollision(!simulateCollision)}
                    className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                      simulateCollision ? 'bg-[#B23B3B] text-white' : 'bg-alabaster text-warmgray border border-gray-200'
                    }`}
                  >
                    {simulateCollision ? 'Collision Active ⚠️' : 'Off'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-warmgray">Select a task from the list to view route optimizations.</p>
            )}

            {/* Collision Notice */}
            {collisionTargetId === activeTask?.id && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-[#B23B3B]/10 border border-[#B23B3B]/30 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B23B3B]" />
                  <span className="text-[11px] font-bold text-[#B23B3B]">
                    CONFLICT BLOCKED: This task was already assigned to Rajesh Patel by Admin Vasant Wable.
                  </span>
                </div>
                <button 
                  onClick={handleResetCollision}
                  className="text-xs text-warmgray hover:text-charcoal font-bold underline"
                >
                  Dismiss
                </button>
              </motion.div>
            )}

            {/* Candidate matching listings */}
            <div className="space-y-3">
              {eligibleCandidates.length === 0 ? (
                <div className="p-8 bg-alabaster rounded-xl border border-dashed border-[#e5dfd4] text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-orange-400 mx-auto" />
                  <h4 className="font-serif text-sm font-bold text-charcoal">No Eligible Candidates in Radius</h4>
                  <p className="text-xs text-warmgray max-w-md mx-auto">
                    All matched {activeTask?.type === 'lead_survey' ? 'surveyors' : 'technicians'} are currently outside your configured {maxRadius}km threshold. Increase the matching range slider below the map to match.
                  </p>
                </div>
              ) : (
                eligibleCandidates.map((cand, idx) => {
                  const isTopMatch = idx === 0;
                  const isAssignedToThis = activeTask?.assignedToId === cand.id;

                  return (
                    <div 
                      key={cand.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden ${
                        isAssignedToThis 
                          ? 'bg-[#0E4B3D]/5 border-royalemerald border-2' 
                          : isTopMatch 
                          ? 'bg-white border-[#B8873D] shadow-xs' 
                          : 'bg-white border-[rgba(184,135,61,0.12)] hover:border-antiquegold/30'
                      }`}
                    >
                      {/* Top Match recommendation badge */}
                      {isTopMatch && (
                        <div className="absolute top-0 right-0 bg-[#B8873D] text-white text-[8px] font-bold uppercase px-2.5 py-0.5 rounded-bl-lg tracking-wider">
                          Optimized Pick
                        </div>
                      )}

                      {/* Left: Avatar, Name, Workload, Proximity */}
                      <div className="flex gap-3 items-center">
                        <img 
                          src={cand.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                          alt={cand.name}
                          className="w-10 h-10 rounded-full object-cover border border-antiquegold/30 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-serif text-xs font-bold text-charcoal">{cand.name}</h4>
                            
                            {cand.isNewOnboard && (
                              <span className="text-[8px] font-mono font-bold bg-[#B8873D]/10 text-[#B8873D] border border-[#B8873D]/20 px-1 py-0.5 rounded">
                                New Hires fair-match boost
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-warmgray">
                            <span className="font-mono text-charcoal font-semibold">{cand.distance} km away</span>
                            <span>•</span>
                            <span className="font-mono text-royalemerald font-semibold">{cand.eta} mins ETA</span>
                            <span>•</span>
                            <span className={`font-mono font-bold ${cand.currentWorkload >= 4 ? 'text-orange-500' : 'text-charcoal'}`}>
                              {cand.currentWorkload} open tasks
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Center Element: THE SIGNATURE "THE ASCENSION LINE" FOR SCORE BREAKDOWN */}
                      <div className="hidden md:flex flex-col items-center justify-center w-36 shrink-0 border-l border-r border-[#e5dfd4] px-4">
                        <div className="flex justify-between items-center w-full text-[9px] text-warmgray">
                          <span>Match Score</span>
                          <span className="font-mono font-bold text-charcoal">{cand.totalScore}%</span>
                        </div>
                        
                        {/* The horizontal elevator Ascension line */}
                        <div className="w-full bg-alabaster h-1.5 rounded-full overflow-hidden mt-1 border border-gray-200">
                          <div 
                            className={`h-full transition-all duration-500 rounded-full ${
                              isTopMatch ? 'bg-[#B8873D]' : 'bg-[#0E4B3D]'
                            }`}
                            style={{ width: `${cand.totalScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Right Side: Primary Dispatch Trigger */}
                      <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                        {isAssignedToThis ? (
                          <span className="px-3.5 py-2 text-xs font-bold text-royalemerald bg-[#0E4B3D]/10 border border-[#0E4B3D]/30 rounded-xl flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Job Assigned</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAssignTask(cand.id)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                              isTopMatch 
                                ? 'bg-[#0E4B3D] hover:bg-[#0A382E] text-white shadow-xs' 
                                : 'bg-[#F8F6F1] text-charcoal hover:bg-antiquegold hover:text-white border border-[rgba(184,135,61,0.15)]'
                            }`}
                          >
                            <span>Assign</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom help guide regarding leave policy */}
            <div className="bg-[#FAF9F5] rounded-xl border border-[rgba(184,135,61,0.12)] p-3 text-left flex items-start gap-2">
              <Info className="w-4 h-4 text-antiquegold shrink-0 mt-0.5" />
              <p className="text-[10px] text-warmgray leading-relaxed">
                <span className="font-bold text-charcoal">Leave & Capacity Exclusions:</span> Active safety routing system automatically excludes operators on approved leave today (such as <span className="font-bold text-charcoal">Gopal Mankar</span>). Load balancing prioritizes unburdened technicians to ensure elevator safety SLA compliance.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. CONCISE APP TOAST NOTIFICATIONS */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-xl border text-xs font-bold text-white shadow-md flex items-center gap-2 pointer-events-auto ${
              t.type === 'success' ? 'bg-[#0E4B3D] border-[#0E4B3D]/30' :
              t.type === 'error' ? 'bg-[#B23B3B] border-[#B23B3B]/30' :
              'bg-charcoal text-white'
            }`}
          >
            <span>{t.text}</span>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
