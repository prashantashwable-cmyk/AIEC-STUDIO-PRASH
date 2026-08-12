import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, MapPin, Phone, MessageSquare, ShieldAlert, Sparkles, 
  Calendar, Clock, AlertTriangle, ChevronRight, HelpCircle, AlertCircle,
  TrendingUp, RefreshCw, X, ChevronDown, Check, Star, ArrowLeft, ArrowRight,
  Map as MapIcon, Share2, Eye, User, FileText, ChevronUp, Battery, Signal
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { User as UserType } from '../types';
import { Card, Button, Badge } from './Common';

// Interface definitions for route data
interface Visit {
  id: string;
  siteName: string;
  address: string;
  arrivedAt: string;
  departedAt: string;
  durationMinutes: number;
  leadsCaptured: number;
  duplicateFlagged: boolean;
  notes: string;
  isOutlier: boolean; // True if duration is extremely long (e.g. >120 mins) or very short
  outlierReason?: string;
  photoUrl?: string;
  latitude: number;
  longitude: number;
  completed: boolean;
}

interface GPSPing {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number; // in meters (high accuracy vs low accuracy)
  batteryPercent: number;
  isPoorAccuracy: boolean;
}

interface SurveyorRoute {
  surveyorId: string;
  surveyorName: string;
  surveyorPhone: string;
  surveyorAvatar: string;
  joinedDate: string; // To handle "Reviewing date before surveyor joined" edge case
  date: string;
  distanceKm: number;
  leadsCapturedCount: number;
  avgMinutesPerSite: number;
  duplicateVisitsCount: number;
  lastSeenTime: string;
  phoneDiedMidDay: boolean; // Handles surveyor phone died mid-day edge case
  gpsPings: GPSPing[];
  visits: Visit[];
}

export const SurveyorLiveTrackingDetailView: React.FC<{ 
  user: UserType;
  selectedSurveyorId?: string; 
  onBack?: () => void;
}> = ({ user, selectedSurveyorId = 'anil_kamble', onBack }) => {
  // Calendar states
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-08');
  const [activeSurveyorId, setActiveSurveyorId] = useState<string>(selectedSurveyorId);
  
  // Interface details & loading state
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'route' | 'visits' | 'telemetry'>('route');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [highlightedPingIdx, setHighlightedPingIdx] = useState<number | null>(null);

  // 1. SURVEYOR MASTER DIRECTORY (Simulated databases)
  const surveyors = useMemo(() => [
    {
      id: 'anil_kamble',
      name: 'Anil Kamble',
      phone: '+91 98334 11202',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      joinedDate: '2026-03-01',
      region: 'Pune Central (Shivajinagar)'
    },
    {
      id: 'amit_sharma',
      name: 'Amit Sharma',
      phone: '+91 98765 43211',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      joinedDate: '2026-01-15',
      region: 'Pune North (Chakan)'
    },
    {
      id: 'rahul_deshmukh',
      name: 'Rahul Deshmukh',
      phone: '+91 95450 49122',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      joinedDate: '2026-06-10',
      region: 'Pune South (Hadapsar)'
    }
  ], []);

  // 2. COMPREHENSIVE ROUTE TRACKING DATABASE
  const routesData: Record<string, Record<string, SurveyorRoute>> = useMemo(() => {
    return {
      anil_kamble: {
        '2026-07-08': {
          surveyorId: 'anil_kamble',
          surveyorName: 'Anil Kamble',
          surveyorPhone: '+91 98334 11202',
          surveyorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          joinedDate: '2026-03-01',
          date: '2026-07-08',
          distanceKm: 24.8,
          leadsCapturedCount: 3,
          avgMinutesPerSite: 35,
          duplicateVisitsCount: 1,
          lastSeenTime: '1:45 PM',
          phoneDiedMidDay: true, // Phone died mid-day! Shows honest stops
          gpsPings: [
            { latitude: 18.5204, longitude: 73.8567, timestamp: '09:00 AM', accuracy: 5, batteryPercent: 92, isPoorAccuracy: false },
            { latitude: 18.5245, longitude: 73.8512, timestamp: '09:30 AM', accuracy: 12, batteryPercent: 88, isPoorAccuracy: false },
            { latitude: 18.5312, longitude: 73.8454, timestamp: '10:15 AM', accuracy: 8, batteryPercent: 81, isPoorAccuracy: false },
            { latitude: 18.5410, longitude: 73.8398, timestamp: '11:00 AM', accuracy: 45, batteryPercent: 74, isPoorAccuracy: true }, // Poor GPS accuracy segment
            { latitude: 18.5522, longitude: 73.8410, timestamp: '11:45 AM', accuracy: 120, batteryPercent: 65, isPoorAccuracy: true }, // Poor GPS accuracy segment
            { latitude: 18.5601, longitude: 73.8492, timestamp: '12:30 PM', accuracy: 8, batteryPercent: 52, isPoorAccuracy: false },
            { latitude: 18.5645, longitude: 73.8588, timestamp: '01:15 PM', accuracy: 4, batteryPercent: 12, isPoorAccuracy: false },
            { latitude: 18.5688, longitude: 73.8655, timestamp: '01:45 PM', accuracy: 6, batteryPercent: 1, isPoorAccuracy: false } // Stopped because battery hit 0
          ],
          visits: [
            {
              id: 'v_1',
              siteName: 'Wable Landmark Villa',
              address: 'Senapati Bapat Road, Pune',
              arrivedAt: '09:15 AM',
              departedAt: '09:50 AM',
              durationMinutes: 35,
              leadsCaptured: 1,
              duplicateFlagged: false,
              notes: 'Excellent shaft well dimensions. G+3 Floors. Clear headroom verified at 4200mm.',
              isOutlier: false,
              photoUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300',
              latitude: 18.5245,
              longitude: 73.8512,
              completed: true
            },
            {
              id: 'v_2',
              siteName: 'Aditya Horizon Complex',
              address: 'Model Colony, Pune',
              arrivedAt: '10:30 AM',
              departedAt: '01:30 PM',
              durationMinutes: 180, // Flagged Outlier: Spent 3 hours on site!
              leadsCaptured: 1,
              duplicateFlagged: false,
              notes: 'Severe civil misalignment detected in shaft wall. Spent significant time plotting laser plumb lines and consulting client builder.',
              isOutlier: true,
              outlierReason: 'Excessive Site Duration (180 mins). Outlier flagged.',
              photoUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300',
              latitude: 18.5312,
              longitude: 73.8454,
              completed: true
            },
            {
              id: 'v_3',
              siteName: 'Royal Elite Homes',
              address: 'Senapati Bapat Road, Pune',
              arrivedAt: '01:40 PM',
              departedAt: '01:45 PM',
              durationMinutes: 5, // Duplicate visit / idle ping?
              leadsCaptured: 1,
              duplicateFlagged: true, // Flagged as potential duplicate check
              notes: 'Re-surveyed the same elevator shaft. Flagged automatically to prevent double-quotation processing.',
              isOutlier: false,
              latitude: 18.5688,
              longitude: 73.8655,
              completed: true
            }
          ]
        },
        '2026-07-07': {
          surveyorId: 'anil_kamble',
          surveyorName: 'Anil Kamble',
          surveyorPhone: '+91 98334 11202',
          surveyorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          joinedDate: '2026-03-01',
          date: '2026-07-07',
          distanceKm: 38.5,
          leadsCapturedCount: 5,
          avgMinutesPerSite: 28,
          duplicateVisitsCount: 0,
          lastSeenTime: '5:45 PM',
          phoneDiedMidDay: false,
          gpsPings: [
            { latitude: 18.5204, longitude: 73.8567, timestamp: '09:00 AM', accuracy: 5, batteryPercent: 100, isPoorAccuracy: false },
            { latitude: 18.5122, longitude: 73.8610, timestamp: '11:00 AM', accuracy: 6, batteryPercent: 85, isPoorAccuracy: false },
            { latitude: 18.5080, longitude: 73.8450, timestamp: '01:00 PM', accuracy: 8, batteryPercent: 68, isPoorAccuracy: false },
            { latitude: 18.5140, longitude: 73.8290, timestamp: '03:00 PM', accuracy: 5, batteryPercent: 44, isPoorAccuracy: false },
            { latitude: 18.5222, longitude: 73.8320, timestamp: '05:45 PM', accuracy: 7, batteryPercent: 22, isPoorAccuracy: false }
          ],
          visits: [
            {
              id: 'v_4',
              siteName: 'Gokhale Regency',
              address: 'Erandwane, Pune',
              arrivedAt: '10:45 AM',
              departedAt: '11:25 AM',
              durationMinutes: 40,
              leadsCaptured: 2,
              duplicateFlagged: false,
              notes: 'G+4 Floors hydraulic drive preference. Clear vertical travel path mapped.',
              isOutlier: false,
              photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300',
              latitude: 18.5122,
              longitude: 73.8610,
              completed: true
            },
            {
              id: 'v_5',
              siteName: 'Mittal Heritage Towers',
              address: 'Kothrud, Pune',
              arrivedAt: '02:30 PM',
              departedAt: '03:15 PM',
              durationMinutes: 45,
              leadsCaptured: 3,
              duplicateFlagged: false,
              notes: 'Heavy commercial elevator request. Handrail and emergency exit specs verified.',
              isOutlier: false,
              photoUrl: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=300',
              latitude: 18.5140,
              longitude: 73.8290,
              completed: true
            }
          ]
        }
      },
      amit_sharma: {
        '2026-07-08': {
          surveyorId: 'amit_sharma',
          surveyorName: 'Amit Sharma',
          surveyorPhone: '+91 98765 43211',
          surveyorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          joinedDate: '2026-01-15',
          date: '2026-07-08',
          distanceKm: 42.1,
          leadsCapturedCount: 4,
          avgMinutesPerSite: 25,
          duplicateVisitsCount: 0,
          lastSeenTime: '06:12 PM',
          phoneDiedMidDay: false,
          gpsPings: [
            { latitude: 18.6784, longitude: 73.8012, timestamp: '08:30 AM', accuracy: 4, batteryPercent: 98, isPoorAccuracy: false },
            { latitude: 18.6820, longitude: 73.8150, timestamp: '11:15 AM', accuracy: 5, batteryPercent: 82, isPoorAccuracy: false },
            { latitude: 18.6940, longitude: 73.8320, timestamp: '01:45 PM', accuracy: 6, batteryPercent: 65, isPoorAccuracy: false },
            { latitude: 18.7050, longitude: 73.8490, timestamp: '04:20 PM', accuracy: 150, batteryPercent: 41, isPoorAccuracy: true }, // Lighter style because of poor GPS
            { latitude: 18.7180, longitude: 73.8550, timestamp: '06:12 PM', accuracy: 8, batteryPercent: 25, isPoorAccuracy: false }
          ],
          visits: [
            {
              id: 'v_6',
              siteName: 'Chakan Greens Co-op',
              address: 'Chakan Phase III, Pune',
              arrivedAt: '10:55 AM',
              departedAt: '11:40 AM',
              durationMinutes: 45,
              leadsCaptured: 2,
              duplicateFlagged: false,
              notes: 'MRL traction specifications approved. Builder signed digital site diagram.',
              isOutlier: false,
              photoUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300',
              latitude: 18.6820,
              longitude: 73.8150,
              completed: true
            },
            {
              id: 'v_7',
              siteName: 'Bhandari Logistics Depot',
              address: 'Chakan MIDC Industrial Sector',
              arrivedAt: '01:10 PM',
              departedAt: '01:30 PM',
              durationMinutes: 20,
              leadsCaptured: 2,
              duplicateFlagged: false,
              notes: 'Freight elevator (3-ton capacity) shaft verified. Requires customized wide door slats.',
              isOutlier: false,
              photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300',
              latitude: 18.6940,
              longitude: 73.8320,
              completed: true
            }
          ]
        }
      }
    };
  }, []);

  // Fetch or fall back to mock data
  const routeData: SurveyorRoute | null = useMemo(() => {
    const surveyorRoutes = routesData[activeSurveyorId];
    if (!surveyorRoutes) return null;
    return surveyorRoutes[selectedDate] || null;
  }, [routesData, activeSurveyorId, selectedDate]);

  // Is date selected prior to surveyor joining?
  const isBeforeJoiningDate = useMemo(() => {
    const surveyor = surveyors.find(s => s.id === activeSurveyorId);
    if (!surveyor) return false;
    
    const joinDateObj = new Date(surveyor.joinedDate);
    const selectDateObj = new Date(selectedDate);
    return selectDateObj < joinDateObj;
  }, [surveyors, activeSurveyorId, selectedDate]);

  const activeSurveyorObj = useMemo(() => {
    return surveyors.find(s => s.id === activeSurveyorId) || surveyors[0];
  }, [surveyors, activeSurveyorId]);

  // Simulated GPS smoothing for display
  const smoothedPings = useMemo(() => {
    if (!routeData) return [];
    // Filters pings with heavy GPS noise to construct a "smoothed route line" for display
    return routeData.gpsPings.filter(p => p.accuracy < 100);
  }, [routeData]);

  // Handle manual flagging/safety alert
  const triggerManualAuditAlert = (visitId: string) => {
    alert(`🚨 Audit verification logged. Site ID: ${visitId} has been submitted for secondary desk audit check. Builder notified.`);
  };

  return (
    <div className="space-y-6 flex flex-col font-sans text-charcoal max-w-7xl mx-auto px-1">
      
      {/* 0. ASCENSION PROJECT PROGRESS BAR (Global User Instruction Mandate) */}
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-[rgba(184,135,61,0.18)] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FFF9E6] text-antiquegold flex items-center justify-center">
            <Compass className="w-4 h-4 animate-spin-slow text-antiquegold" />
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
              <span className="text-royalemerald">30%</span>
            </div>
            <div className="w-full h-2 bg-[#F8F6F1] rounded-full overflow-hidden border border-[#e5dfd4]">
              <div className="h-full bg-royalemerald rounded-full transition-all duration-500" style={{ width: '30%' }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono font-bold">
              <span className="text-antiquegold">TOTAL SEQUENTIAL PLATFORM CONSTRUCT</span>
              <span className="text-antiquegold">6.5%</span>
            </div>
            <div className="w-full h-2 bg-[#F8F6F1] rounded-full overflow-hidden border border-[#e5dfd4]">
              <div className="h-full bg-antiquegold rounded-full transition-all duration-500" style={{ width: '6.5%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 1. HERO HEADER & DATE SELECTOR STRIP */}
      <div className="bg-white p-5 rounded-3xl border border-[rgba(184,135,61,0.15)] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
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
              src={activeSurveyorObj.avatar} 
              alt={activeSurveyorObj.name} 
              className="w-14 h-14 rounded-2xl border-2 border-antiquegold object-cover shadow-sm"
            />
            {routeData?.phoneDiedMidDay && (
              <span className="absolute -bottom-1 -right-1 bg-error border-2 border-white text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded-md tracking-wider">
                OFFLINE
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-charcoal">{activeSurveyorObj.name}</h2>
              <span className="px-2 py-0.5 bg-royalemerald/10 border border-royalemerald/20 text-royalemerald text-[9px] font-mono uppercase font-bold rounded">
                Verified Surveyor
              </span>
            </div>
            <p className="text-xs text-warmgray mt-0.5 font-medium">On-Duty Zone: {activeSurveyorObj.region}</p>
            <p className="text-[10px] text-warmgray/75 mt-1 font-mono">Commissioned since: {activeSurveyorObj.joinedDate}</p>
          </div>
        </div>

        {/* Date Selector & Surveyor Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Change surveyor inline dropdown */}
          <div className="relative">
            <select
              value={activeSurveyorId}
              onChange={(e) => {
                setActiveSurveyorId(e.target.value);
                setSelectedVisitId(null);
              }}
              className="pl-3 pr-8 py-2.5 bg-[#F8F6F1] hover:bg-white rounded-xl border border-[#e5dfd4] hover:border-antiquegold text-xs font-bold text-charcoal outline-none cursor-pointer transition-all appearance-none"
            >
              {surveyors.map(s => (
                <option key={s.id} value={s.id}>Auditing: {s.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-warmgray absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Date Picker */}
          <div className="flex items-center gap-2 bg-[#F8F6F1] px-3.5 py-2 rounded-xl border border-[#e5dfd4]">
            <Calendar className="w-4 h-4 text-antiquegold stroke-[1.5]" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedVisitId(null);
              }}
              className="bg-transparent text-xs font-bold text-charcoal outline-none cursor-pointer"
            />
          </div>

        </div>

      </div>

      {/* EDGE CASE RESOLUTION: VIEWING DATE BEFORE JOINED OR MISSING DATA */}
      {isBeforeJoiningDate ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[rgba(184,135,61,0.22)] max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-[#FFF9E6] border border-antiquegold/20 text-antiquegold rounded-full flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8 stroke-[1.2]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal">Pre-Commission Audit Interval</h3>
            <p className="text-xs text-warmgray max-w-sm mx-auto mt-1 leading-relaxed">
              Mr. {activeSurveyorObj.name} was onboarded to the AIEC platform on <strong className="text-charcoal">{activeSurveyorObj.joinedDate}</strong>. Tracking logs are unavailable prior to this date.
            </p>
          </div>
          <Button 
            variant="secondary" 
            className="text-xs px-4" 
            onClick={() => setSelectedDate('2026-07-08')}
          >
            Reset to Current Work Day
          </Button>
        </div>
      ) : !routeData ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[rgba(184,135,61,0.22)] max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-alabaster border border-[#e5dfd4] text-warmgray rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8 stroke-[1.2]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal">No GPS Transit Data Captured</h3>
            <p className="text-xs text-warmgray max-w-sm mx-auto mt-1 leading-relaxed">
              There are no recorded site audits or active telemetry logs for {activeSurveyorObj.name} on {selectedDate}.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <button 
              onClick={() => setSelectedDate('2026-07-08')}
              className="px-4 py-2 bg-royalemerald text-white text-xs font-bold rounded-xl"
            >
              Go to Current Day
            </button>
            <button 
              onClick={() => setSelectedDate('2026-07-07')}
              className="px-4 py-2 bg-white border border-[#e5dfd4] text-xs font-bold rounded-xl"
            >
              Check July 7, 2026
            </button>
          </div>
        </div>
      ) : (
        
        /* FULL MAIN ACTIVE COMPONENT GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 5 COLUMNS: METRICS STRIP & TRANSIT LIST */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* AUDIT SUMMARY STATS STRIP */}
            <div className="bg-white p-4.5 rounded-3xl border border-[rgba(184,135,61,0.14)] shadow-xs grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
              
              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[rgba(184,135,61,0.06)]">
                <p className="text-[9px] uppercase font-bold text-warmgray tracking-widest">Odometer Trace</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-mono text-xl font-bold text-charcoal">{routeData.distanceKm}</span>
                  <span className="text-[10px] text-warmgray font-semibold">km</span>
                </div>
                <div className="w-full h-1 bg-royalemerald/20 rounded-full mt-2 overflow-hidden">
                  <div className="bg-royalemerald h-full w-4/5" />
                </div>
              </div>

              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[rgba(184,135,61,0.06)]">
                <p className="text-[9px] uppercase font-bold text-warmgray tracking-widest">Audits Logged</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-mono text-xl font-bold text-royalemerald">{routeData.leadsCapturedCount}</span>
                  <span className="text-[10px] text-warmgray font-semibold">sites</span>
                </div>
                <div className="w-full h-1 bg-royalemerald/20 rounded-full mt-2 overflow-hidden">
                  <div className="bg-royalemerald h-full w-2/3" />
                </div>
              </div>

              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[rgba(184,135,61,0.06)]">
                <p className="text-[9px] uppercase font-bold text-warmgray tracking-widest">Mean Audit SLA</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-mono text-xl font-bold text-charcoal">{routeData.avgMinutesPerSite}</span>
                  <span className="text-[10px] text-warmgray font-semibold">mins</span>
                </div>
                <p className="text-[8px] text-warmgray font-semibold mt-1">Target range: 30-45m</p>
              </div>

              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[rgba(184,135,61,0.06)]">
                <p className="text-[9px] uppercase font-bold text-warmgray tracking-widest">Duplicity Holds</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`font-mono text-xl font-bold ${routeData.duplicateVisitsCount > 0 ? 'text-[#B23B3B]' : 'text-charcoal'}`}>
                    {routeData.duplicateVisitsCount}
                  </span>
                  <span className="text-[10px] text-warmgray font-semibold">flagged</span>
                </div>
                <p className="text-[8px] text-warmgray font-semibold mt-1">Cross-check active</p>
              </div>

            </div>

            {/* EDGE CASE REMINDER: PHONE DIED MID-DAY WARNING BANNER */}
            {routeData.phoneDiedMidDay && (
              <div className="bg-error/5 border border-error/20 rounded-2xl p-4 flex items-start gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-error/15 text-error flex items-center justify-center shrink-0">
                  <Battery className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#B23B3B] uppercase tracking-wider">Transit Trace Terminated (Telemetry Off)</p>
                  <p className="text-[11px] leading-relaxed text-charcoal/80">
                    Device battery drained to <strong className="text-charcoal">0%</strong> at <strong className="text-charcoal">{routeData.lastSeenTime}</strong>. Last known site and GPS ping are honestly shown below. Offline safety protocol initiated.
                  </p>
                </div>
              </div>
            )}

            {/* INTERACTIVE ROUTE AUDIT TIMELINE (The vertical Ascension Line concept applied to visits) */}
            <div className="bg-white p-5 rounded-3xl border border-[rgba(184,135,61,0.12)] space-y-4 shadow-sm text-left">
              
              <div className="flex justify-between items-center pb-2.5 border-b border-[#F8F6F1]">
                <div>
                  <h3 className="font-serif text-base font-bold text-charcoal">Site Audits Completed</h3>
                  <p className="text-[11px] text-warmgray">Chronological timeline of mapped sites & builders</p>
                </div>
                <Badge variant="success">
                  {routeData.visits.length} / {routeData.visits.length} Sites Verified
                </Badge>
              </div>

              {/* STACKED LIST WITH STYLED VERTICAL RAIL AND PHOTO PREVIEWS */}
              <div className="space-y-5 relative pl-4 border-l border-dashed border-antiquegold/30 ml-2 pt-2 pb-2">
                
                {routeData.visits.map((visit, index) => {
                  const isSelected = selectedVisitId === visit.id;
                  
                  return (
                    <div 
                      key={visit.id}
                      onClick={() => setSelectedVisitId(isSelected ? null : visit.id)}
                      className={`relative group cursor-pointer transition-all ${
                        isSelected ? 'bg-alabaster p-3 rounded-2xl border border-antiquegold/30 shadow-xs' : ''
                      }`}
                    >
                      {/* Left vertical rail bullet marker */}
                      <span className={`absolute -left-[25px] top-1.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-black shadow-sm transition-all ${
                        visit.duplicateFlagged ? 'bg-error border-error text-white' :
                        visit.isOutlier ? 'bg-amber-500 border-amber-500 text-white' :
                        'bg-royalemerald border-royalemerald text-white'
                      }`}>
                        {index + 1}
                      </span>

                      {/* Header metadata row */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-serif text-sm font-bold text-charcoal group-hover:text-antiquegold transition-colors">
                            {visit.siteName}
                          </h4>
                          <p className="text-[11px] text-warmgray mt-0.5 leading-tight">{visit.address}</p>
                        </div>
                        
                        {/* Timestamps */}
                        <span className="text-[10px] font-mono font-bold text-warmgray whitespace-nowrap bg-alabaster px-1.5 py-0.5 rounded border border-[#e5dfd4]">
                          {visit.arrivedAt}
                        </span>
                      </div>

                      {/* Double visual flags for outliers (SLA / Idle alerts) */}
                      {visit.isOutlier && (
                        <div className="mt-2 py-1 px-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{visit.outlierReason}</span>
                        </div>
                      )}

                      {visit.duplicateFlagged && (
                        <div className="mt-2 py-1 px-2.5 bg-error/5 border border-error/15 text-[#B23B3B] rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Possible Duplicate Ping. Audit check requested.</span>
                        </div>
                      )}

                      {/* Inline Expanded Detail content */}
                      <div className={`mt-2.5 space-y-2.5 overflow-hidden transition-all duration-300 ${
                        isSelected ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="bg-white p-3 rounded-xl border border-[rgba(184,135,61,0.06)] text-xs space-y-2">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-warmgray tracking-widest">Duration Profile</span>
                            <p className="text-charcoal font-semibold mt-0.5">{visit.durationMinutes} Minutes on Site</p>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-warmgray tracking-widest">Auditor Field Notes</span>
                            <p className="text-charcoal italic mt-0.5 leading-relaxed bg-alabaster p-2 rounded border border-[#e5dfd4]">
                              &ldquo;{visit.notes}&rdquo;
                            </p>
                          </div>
                        </div>

                        {/* Photo attachment placeholder */}
                        {visit.photoUrl && (
                          <div className="space-y-1.5">
                            <span className="text-[9px] uppercase font-bold text-warmgray tracking-widest">Physical Proof Upload</span>
                            <div className="relative group/img rounded-xl overflow-hidden border border-[#e5dfd4] aspect-video">
                              <img src={visit.photoUrl} alt="elevator shaft blueprint proof" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="bg-white/90 text-charcoal text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                                  <Eye className="w-3.5 h-3.5" />
                                  Inspect Original Upload
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerManualAuditAlert(visit.id);
                            }}
                            className="flex-1 py-1.5 bg-[#FFF9E6] hover:bg-[#FFF5C6] text-[#8C6412] text-[10px] font-bold rounded-lg border border-[#D4AF37]/30 transition-all text-center"
                          >
                            Flag Anomalous Duration
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}

              </div>

            </div>

          </div>

          {/* RIGHT 7 COLUMNS: MAP COMPONENT & SIMULATION TOOLS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* AUDIT VECTOR MINI-MAP COMPONENT */}
            <div className="bg-white rounded-3xl border border-[rgba(184,135,61,0.15)] overflow-hidden shadow-sm">
              
              {/* Map toolbar */}
              <div className="p-4 bg-alabaster border-b border-[rgba(184,135,61,0.1)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-antiquegold" />
                  <span className="text-xs font-bold text-charcoal">Geomapped Polyline Path Traveled</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.75 bg-royalemerald/15 text-royalemerald border border-royalemerald/20 text-[9px] font-bold rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-royalemerald animate-ping" />
                    GPS Smoothing On
                  </span>
                </div>
              </div>

              {/* MOCK VECTOR CANVAS MAP */}
              <div className="bg-[#FAF9F5] aspect-square md:aspect-video relative overflow-hidden p-6 flex flex-col justify-between select-none">
                
                {/* Visual grid styling for vector grid */}
                <div className="absolute inset-0 grid grid-cols-12 gap-0 opacity-10 pointer-events-none">
                  {Array.from({ length: 144 }).map((_, i) => (
                    <div key={i} className="border-r border-b border-charcoal aspect-square" />
                  ))}
                </div>

                {/* Legend Overlay */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs text-left max-w-[200px] space-y-1.5 z-10">
                  <p className="text-[8px] font-mono font-bold text-warmgray uppercase tracking-widest">Audit Vector Legend</p>
                  <div className="space-y-1 text-[10px] font-semibold text-charcoal/80">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-royalemerald inline-block" />
                      <span>Smoothed GPS Track</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-400 inline-block" />
                      <span>Poor Signal/Accuracy Segment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-royalemerald inline-block" />
                      <span>Completed Audit Site</span>
                    </div>
                  </div>
                </div>

                {/* Vector Map Elements Container */}
                <div className="flex-1 w-full relative flex items-center justify-center min-h-[250px] md:min-h-[350px]">
                  
                  {/* Outer Map Contour Mock Paths */}
                  <div className="absolute inset-x-8 inset-y-12 border-2 border-dashed border-[#e5dfd4] rounded-full opacity-30 pointer-events-none" />
                  <div className="absolute left-1/4 top-1/3 w-32 h-20 bg-royalemerald/5 rounded-full filter blur-xl pointer-events-none" />

                  {/* Draw the Route Line on Vector Grid */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 400" preserveAspectRatio="none">
                    
                    {/* Normal Smoothed path */}
                    <path 
                      d="M 50,150 L 150,100 L 250,220" 
                      fill="none" 
                      stroke="#0E4B3D" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />

                    {/* Low Accuracy Segment (Dotted and lighter color) */}
                    <path 
                      d="M 250,220 L 380,310 L 450,190" 
                      fill="none" 
                      stroke="#F59E0B" 
                      strokeWidth="3" 
                      strokeDasharray="6,4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="opacity-75"
                    />

                    {/* Re-entering High accuracy trajectory */}
                    <path 
                      d="M 450,190 L 520,120" 
                      fill="none" 
                      stroke="#0E4B3D" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />

                    {/* Polyline node vectors */}
                    {smoothedPings.map((ping, idx) => {
                      const positions = [
                        { x: 50, y: 150 },
                        { x: 150, y: 100 },
                        { x: 250, y: 220 },
                        { x: 380, y: 310 },
                        { x: 450, y: 190 },
                        { x: 520, y: 120 }
                      ];
                      
                      const pos = positions[idx] || { x: 50 + idx * 75, y: 100 + (idx % 2) * 80 };
                      const isHighlighted = highlightedPingIdx === idx;

                      return (
                        <g 
                          key={idx}
                          onMouseEnter={() => setHighlightedPingIdx(idx)}
                          onMouseLeave={() => setHighlightedPingIdx(null)}
                          className="cursor-pointer"
                        >
                          <circle 
                            cx={pos.x} 
                            cy={pos.y} 
                            r={isHighlighted ? 8 : 4.5} 
                            fill={ping.isPoorAccuracy ? '#F59E0B' : '#0E4B3D'} 
                            className="transition-all duration-150"
                          />
                          {isHighlighted && (
                            <circle 
                              cx={pos.x} 
                              cy={pos.y} 
                              r="14" 
                              fill="none" 
                              stroke={ping.isPoorAccuracy ? '#F59E0B' : '#0E4B3D'} 
                              strokeWidth="1.5" 
                              className="animate-ping"
                            />
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* HTML Pins absolutely positioned over SVG projection */}
                  <div className="absolute left-[50px] top-[150px] -translate-x-1/2 -translate-y-1/2 group">
                    <div className="w-5 h-5 rounded-full bg-[#2A2723] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                      S
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#2A2723] text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Shift Started: 9:00 AM
                    </div>
                  </div>

                  {/* Visit 1 site marker */}
                  <div className="absolute left-[150px] top-[100px] -translate-x-1/2 -translate-y-1/2 group">
                    <div className="w-7 h-7 rounded-xl bg-royalemerald text-white flex items-center justify-center border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white border border-[#e5dfd4] text-charcoal font-bold text-[9px] p-2 rounded-xl whitespace-nowrap shadow-md text-left space-y-0.5">
                      <p className="font-serif">Wable Landmark Villa</p>
                      <p className="text-[8px] text-warmgray font-mono">Lead Captured • G+3</p>
                    </div>
                  </div>

                  {/* Visit 2 site marker - OUTLIER FLAG */}
                  <div className="absolute left-[250px] top-[220px] -translate-x-1/2 -translate-y-1/2 group">
                    <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white border border-amber-300 text-charcoal font-bold text-[9px] p-2 rounded-xl whitespace-nowrap shadow-md text-left space-y-0.5">
                      <p className="font-serif text-amber-800">Aditya Horizon (Outlier)</p>
                      <p className="text-[8px] text-warmgray font-mono">180 Mins Site Duration</p>
                    </div>
                  </div>

                  {/* Last Seen site marker - Phone died here */}
                  {routeData.phoneDiedMidDay && (
                    <div className="absolute left-[520px] top-[120px] -translate-x-1/2 -translate-y-1/2 group">
                      <div className="w-7 h-7 rounded-full bg-error text-white flex items-center justify-center border-2 border-white shadow-md cursor-pointer animate-ping" />
                      <div className="w-7 h-7 rounded-full bg-error text-white flex items-center justify-center border-2 border-white shadow-md cursor-pointer absolute top-0 left-0">
                        ⚡
                      </div>
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white border border-error/30 text-charcoal font-bold text-[9px] p-2 rounded-xl whitespace-nowrap shadow-md text-left space-y-0.5">
                        <p className="text-[#B23B3B]">Device Died Mid-Day</p>
                        <p className="text-[8px] text-warmgray font-mono">Last Seen: {routeData.lastSeenTime}</p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Stats Overlay */}
                <div className="bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-[rgba(184,135,61,0.12)] flex items-center justify-between text-left text-xs">
                  <div>
                    <p className="text-[8px] font-mono font-bold text-warmgray uppercase tracking-widest">Active Device State</p>
                    <p className="font-bold text-charcoal mt-0.5">
                      {routeData.phoneDiedMidDay ? 'Offline - Telemetry Terminated' : 'Streaming Active'}
                    </p>
                  </div>
                  <div className="flex gap-4 font-mono text-[10px] font-bold text-warmgray">
                    <span className="flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-antiquegold" />
                      {routeData.gpsPings[routeData.gpsPings.length - 1]?.batteryPercent || 0}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Signal className="w-3.5 h-3.5 text-royalemerald" />
                      {routeData.phoneDiedMidDay ? 'NONE' : 'HIGH'}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* DIRECT COMMUNICATIONS SHORTCUT BUTTONS */}
            <div className="bg-white p-5 rounded-3xl border border-[rgba(184,135,61,0.15)] space-y-4 shadow-sm text-left">
              <div>
                <h4 className="font-serif text-base font-bold text-charcoal">Secure Team Communications</h4>
                <p className="text-xs text-warmgray">Directly coordinate and audit with {activeSurveyorObj.name} regarding trace anomalies</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a 
                  href={`tel:${activeSurveyorObj.phone}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-royalemerald hover:bg-opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <Phone className="w-4 h-4 stroke-[1.5]" />
                  <span>Call Auditor</span>
                </a>

                <a 
                  href={`https://wa.me/${activeSurveyorObj.phone.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Chat</span>
                </a>

                <button 
                  onClick={() => {
                    alert(`Dispatched manual safety coordinate request to ${activeSurveyorObj.name}'s backup device payload. Pager alert active.`);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-antiquegold hover:bg-alabaster text-antiquegold font-bold text-xs rounded-xl transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Signal Distress Ping</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
