import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Phone, MessageSquare, Plus, Minus, Layers, Users, Sparkles,
  Navigation, Signal, Battery, Compass, Check, CheckCircle2, RefreshCw,
  X, ExternalLink, HelpCircle, Eye, AlertTriangle, Hammer, Building, Map as MapIcon, Globe, Sliders,
  Maximize2, Minimize2
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { User, Lead, Job } from '../types';
import { Card, Button, Badge, AscensionLine } from './Common';
import { 
  MapFiltersLayersControlPanel, 
  MapFilterState, 
  defaultFilters 
} from './MapFiltersLayersControlPanel';

// Leaflet caches its container size at init; toggling fullscreen resizes the container
// via CSS without firing a window resize event, so we must tell the map explicitly.
const MapResizeHandler: React.FC<{ trigger: unknown }> = ({ trigger }) => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 120);
    return () => clearTimeout(t);
  }, [trigger, map]);
  return null;
};

interface LiveStaff {
  id: string;
  name: string;
  role: 'surveyor' | 'technician';
  status: 'idle' | 'traveling' | 'on-site' | 'lost_signal';
  phone: string;
  avatar: string;
  lat: number;
  lng: number;
  lastPing: string;
  lastPingSecondsAgo: number;
  activeTaskId?: string;
  taskName?: string;
  region: string;
  battery: number;
  signalStrength: 'excellent' | 'good' | 'poor' | 'none';
  pathIndex: number;
  path: { lat: number; lng: number }[];
}

// Operational Territories of Pune for AIEC
const TERRITORIES = [
  { id: 't1', name: 'Pune North (Chakan)', center: { lat: 18.7077, lng: 73.8512 }, radius: 4500, color: 'rgba(14, 75, 61, 0.12)', border: '#0E4B3D' },
  { id: 't2', name: 'Pune South (Kothrud/Katraj)', center: { lat: 18.5074, lng: 73.8077 }, radius: 3800, color: 'rgba(184, 135, 61, 0.12)', border: '#B8873D' },
  { id: 't3', name: 'Pune East (Kharadi)', center: { lat: 18.5512, lng: 73.9389 }, radius: 4000, color: 'rgba(14, 75, 61, 0.12)', border: '#0E4B3D' },
  { id: 't4', name: 'Pune West (Hinjewadi)', center: { lat: 18.5913, lng: 73.7389 }, radius: 4200, color: 'rgba(184, 135, 61, 0.12)', border: '#B8873D' }
];

export const LiveMapDashboard: React.FC<{
  user: User;
  apiKey?: string;
  hasValidKey?: boolean;
}> = ({ user }) => {
  // Layer Toggles and Advanced Filters Configuration
  const [filters, setFilters] = useState<MapFilterState>(() => {
    const storedViews = localStorage.getItem('aiec_map_saved_views');
    if (storedViews) {
      try {
        const parsed = JSON.parse(storedViews);
        const def = parsed.find((v: any) => v.isDefault);
        if (def) return { ...defaultFilters, ...def.config };
      } catch (e) {}
    }
    return defaultFilters;
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const showSurveyors = filters.showSurveyors;
  const showTechnicians = filters.showTechnicians;
  const showActiveLeads = filters.showActiveLeads;
  const showActiveInstallations = filters.showActiveInstallations;
  const showTerritories = filters.showTerritories;

  // Map Mode Control: 'street' uses free OpenStreetMap tiles (no key/billing needed),
  // 'vector' is the stylized in-house sandbox rendering.
  const [mapMode, setMapMode] = useState<'street' | 'vector'>('street');

  // Fullscreen map view (CSS-based overlay, works even where the browser Fullscreen API is blocked, e.g. in an iframe)
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  // Vector zoom & panning state (Pune center coordinate map space)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // DB Data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Simulation Alert
  const [alerts, setAlerts] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<{ id: string; text: string; type: 'info' | 'warn' | 'success' } | null>(null);

  // Selection
  const [selectedPin, setSelectedPin] = useState<{
    type: 'staff' | 'lead' | 'job' | 'cluster';
    data: any;
    id: string;
  } | null>(null);

  // Staff simulation state
  const [staffList, setStaffList] = useState<LiveStaff[]>([]);

  // Stagger path for Amit Sharma (Surveyor, Pune West to Pune North)
  const amitPath = [
    { lat: 18.5350, lng: 73.8420 },
    { lat: 18.5550, lng: 73.8350 },
    { lat: 18.5800, lng: 73.8200 },
    { lat: 18.6100, lng: 73.8150 },
    { lat: 18.6400, lng: 73.8250 },
    { lat: 18.6800, lng: 73.8350 },
    { lat: 18.7077, lng: 73.8512 }
  ];

  // Stagger path for Kiran Shinde (Technician, Pune East to Central)
  const kiranPath = [
    { lat: 18.5512, lng: 73.9389 },
    { lat: 18.5450, lng: 73.9100 },
    { lat: 18.5350, lng: 73.8800 },
    { lat: 18.5204, lng: 73.8567 }, // Will reach Central and cluster with Prakash!
    { lat: 18.5204, lng: 73.8567 },
    { lat: 18.5204, lng: 73.8567 }
  ];

  // Initial staff seed
  useEffect(() => {
    setLeads(DbManager.getLeads());
    setJobs(DbManager.getJobs());

    setStaffList([
      {
        id: 'amit_sharma',
        name: 'Amit Sharma',
        role: 'surveyor',
        status: 'traveling',
        phone: '+91 98765 43211',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        lat: 18.5350,
        lng: 73.8420,
        lastPing: 'Just Now',
        lastPingSecondsAgo: 3,
        activeTaskId: 'lead_2',
        taskName: 'Verify Shaft Specs at Shanti Niwas',
        region: 'Pune North',
        battery: 92,
        signalStrength: 'excellent',
        pathIndex: 0,
        path: amitPath
      },
      {
        id: 'rajesh_patel',
        name: 'Rajesh Patel',
        role: 'technician',
        status: 'on-site',
        phone: '+91 98765 43212',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        lat: 18.5074,
        lng: 73.8077, // Deshmukh Arcade
        lastPing: '2m ago',
        lastPingSecondsAgo: 120,
        activeTaskId: 'job_1',
        taskName: 'Cabin Frame & Guide Rail Installation',
        region: 'Pune South',
        battery: 81,
        signalStrength: 'good',
        pathIndex: 0,
        path: []
      },
      {
        id: 'sanjay_deshmukh',
        name: 'Sanjay Deshmukh',
        role: 'surveyor',
        status: 'idle',
        phone: '+91 99887 76655',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        lat: 18.5600,
        lng: 73.8000,
        lastPing: '5m ago',
        lastPingSecondsAgo: 300,
        region: 'Pune West',
        battery: 64,
        signalStrength: 'good',
        pathIndex: 0,
        path: []
      },
      {
        id: 'anil_kamble',
        name: 'Anil Kamble',
        role: 'technician',
        status: 'lost_signal', // Visual lost signal check
        phone: '+91 91234 56780',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        lat: 18.7100,
        lng: 73.8600,
        lastPing: '24m ago',
        lastPingSecondsAgo: 1440, // Over 20 mins!
        activeTaskId: 'job_2',
        taskName: 'Material Delivery Check at Sun Elevators',
        region: 'Pune North (Chakan)',
        battery: 12,
        signalStrength: 'none',
        pathIndex: 0,
        path: []
      },
      {
        id: 'prakash_jadav',
        name: 'Prakash Jadav',
        role: 'technician',
        status: 'traveling',
        phone: '+91 90909 80808',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        lat: 18.5204,
        lng: 73.8567, // Shared Vehicle location
        lastPing: 'Just Now',
        lastPingSecondsAgo: 5,
        region: 'Pune East',
        battery: 77,
        signalStrength: 'excellent',
        pathIndex: 0,
        path: []
      },
      {
        id: 'kiran_shinde',
        name: 'Kiran Shinde',
        role: 'technician',
        status: 'traveling',
        phone: '+91 97766 55443',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        lat: 18.5512,
        lng: 73.9389,
        lastPing: 'Just Now',
        lastPingSecondsAgo: 8,
        region: 'Pune East',
        battery: 89,
        signalStrength: 'good',
        pathIndex: 0,
        path: kiranPath
      }
    ]);
  }, []);

  // Set up live simulation update interval (under 15 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setStaffList(prev => {
        return prev.map(staff => {
          let nextLat = staff.lat;
          let nextLng = staff.lng;
          let nextIdx = staff.pathIndex;
          let nextSecondsAgo = staff.lastPingSecondsAgo + 3;
          let nextStatus = staff.status;

          // 1. Driving simulation for "traveling" staff with paths
          if (staff.status === 'traveling' && staff.path.length > 0) {
            const path = staff.path;
            // Advance along the route points
            nextIdx = (staff.pathIndex + 1) % path.length;
            const targetPoint = path[nextIdx];

            // SMOOTH PATH INTERPOLATION / GPS LERP
            // Lerp 60% of the way to the next point to prevent jumping
            nextLat = staff.lat + (targetPoint.lat - staff.lat) * 0.55;
            nextLng = staff.lng + (targetPoint.lng - staff.lng) * 0.55;
            nextSecondsAgo = 2; // Fresh ping!
          }

          // 2. Random slight drift for active people on-site to simulate walking around site
          if (staff.status === 'on-site' && Math.random() > 0.6) {
            nextLat += (Math.random() - 0.5) * 0.00015;
            nextLng += (Math.random() - 0.5) * 0.00015;
            nextSecondsAgo = Math.floor(Math.random() * 20) + 1;
          }

          // 3. Lost signal status trigger
          if (nextSecondsAgo > 1200) {
            nextStatus = 'lost_signal';
          }

          // Format readable relative time string
          let pingStr = 'Just Now';
          if (nextSecondsAgo > 60) {
            pingStr = `${Math.floor(nextSecondsAgo / 60)}m ago`;
          } else if (nextSecondsAgo > 10) {
            pingStr = `${nextSecondsAgo}s ago`;
          }

          return {
            ...staff,
            lat: nextLat,
            lng: nextLng,
            pathIndex: nextIdx,
            lastPingSecondsAgo: nextSecondsAgo,
            lastPing: pingStr,
            status: nextStatus
          };
        });
      });

      // Periodic random events like GPS anomalies or route clearances
      if (Math.random() > 0.85) {
        triggerSimulatedGpSAnomaly();
      }
    }, 3500); // Fast interval updates

    return () => clearInterval(timer);
  }, []);

  // Trigger simulated GPS jump and activate our custom path interpolation engine
  const triggerSimulatedGpSAnomaly = () => {
    setStaffList(prev => {
      const amit = prev.find(s => s.id === 'amit_sharma');
      if (amit) {
        // Mock a massive impossible GPS jump (bad signal)
        const anomalyLat = amit.lat + 0.095; // Jump far away
        const anomalyLng = amit.lng - 0.082;
        
        // Push alert
        setToastMsg({
          id: `gps_anomaly_${Date.now()}`,
          text: `⚠️ High HDOP jump detected on Amit Sharma's GPS. AIEC path-smoothing filter active.`,
          type: 'warn'
        });

        // Add to active log list
        setAlerts(prevA => [`${new Date().toLocaleTimeString()} - Filtered GPS drift on Amit Sharma`, ...prevA.slice(0, 4)]);

        // Interpolate over next intervals. The smooth update loop will naturally pull him back!
      }
      return prev;
    });
  };

  // Trigger manual simulated signal repair
  const repairSignal = (id: string) => {
    setStaffList(prev => {
      return prev.map(s => {
        if (s.id === id) {
          setToastMsg({
            id: `repair_${Date.now()}`,
            text: `🔒 Restored operations link for ${s.name}. Syncing latest telemetry.`,
            type: 'success'
          });
          return {
            ...s,
            status: 'idle',
            lastPing: 'Just Now',
            lastPingSecondsAgo: 2,
            signalStrength: 'excellent',
            battery: 98
          };
        }
        return s;
      });
    });
    // Clear selected
    setSelectedPin(null);
  };

  // Helper to check if two staff are at exact coordinates (Shared Vehicle check)
  // We check if rounded coordinates are identical
  const getClusteredPins = () => {
    const list: { key: string; lat: number; lng: number; members: LiveStaff[] }[] = [];
    const threshold = 0.001; // cluster threshold for relative coordinate checks

    const activeStaff = staffList.filter(s => {
      if (s.role === 'surveyor') {
        if (!showSurveyors) return false;
        if (filters.staffRoleFilter !== 'all' && filters.staffRoleFilter !== 'surveyor') return false;
      }
      if (s.role === 'technician') {
        if (!showTechnicians) return false;
        if (filters.staffRoleFilter !== 'all' && filters.staffRoleFilter !== 'technician') return false;
      }
      if (filters.staffStatusFilter !== 'all' && s.status !== filters.staffStatusFilter) return false;
      if (filters.staffBatteryAlert && s.battery > 35) return false;
      if (filters.staffSignalAlert && s.status !== 'lost_signal' && s.signalStrength !== 'poor') return false;
      return true;
    });

    activeStaff.forEach(staff => {
      let found = false;
      for (let cluster of list) {
        const dLat = Math.abs(cluster.lat - staff.lat);
        const dLng = Math.abs(cluster.lng - staff.lng);
        if (dLat < threshold && dLng < threshold) {
          cluster.members.push(staff);
          found = true;
          break;
        }
      }
      if (!found) {
        list.push({
          key: staff.id,
          lat: staff.lat,
          lng: staff.lng,
          members: [staff]
        });
      }
    });

    return list;
  };

  const clusters = getClusteredPins();
  const lostSignalCount = staffList.filter(s => s.status === 'lost_signal').length;

  // Leaflet divIcon builders (real street map markers, styled to match the vector sandbox pins)
  const clusterIcon = (count: number) => L.divIcon({
    html: `
      <div class="relative flex flex-col items-center">
        <div class="w-10 h-10 rounded-full bg-royalemerald border-2 border-white flex items-center justify-center text-white font-mono text-xs font-black shadow-lg">${count}</div>
        <div class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-antiquegold flex items-center justify-center border border-white text-[9px] text-white font-bold">⚡</div>
      </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  const staffIcon = (staff: LiveStaff) => {
    const markerColor = staff.role === 'surveyor' ? 'bg-[#0E4B3D]' : 'bg-[#B8873D]';
    const badge = staff.status === 'lost_signal'
      ? `<div class="absolute -top-1.5 -right-1.5 bg-[#B23B3B] text-white w-4 h-4 rounded-full border border-white flex items-center justify-center text-[8px] font-bold">🚫</div>`
      : staff.status === 'traveling'
      ? `<div class="absolute -bottom-1 -right-1 bg-royalemerald text-white w-4 h-4 rounded-full border border-white flex items-center justify-center text-[8px]">🚗</div>`
      : '';
    return L.divIcon({
      html: `
        <div class="relative flex flex-col items-center">
          <div class="w-9 h-9 rounded-2xl ${markerColor} border-2 border-white p-0.5 shadow-md flex items-center justify-center relative">
            <img src="${staff.avatar}" class="w-full h-full rounded-xl object-cover" />
            ${badge}
          </div>
          <div class="mt-1.5 px-2 py-0.5 bg-white/95 border border-[rgba(184,135,61,0.15)] rounded-md text-[9px] font-bold text-charcoal shadow-sm flex items-center gap-1 whitespace-nowrap">
            <span class="w-1.5 h-1.5 rounded-full ${staff.status === 'lost_signal' ? 'bg-[#B23B3B]' : 'bg-success'}"></span>
            ${staff.name.split(' ')[0]}
          </div>
        </div>
      `,
      className: '',
      iconSize: [40, 56],
      iconAnchor: [20, 20],
    });
  };

  const leadIcon = L.divIcon({
    html: `
      <div class="flex flex-col items-center">
        <div class="w-7 h-7 rounded-xl bg-success/20 border-2 border-success flex items-center justify-center text-success shadow-md backdrop-blur-xs">🏢</div>
        <div class="mt-1 px-1.5 py-0.5 bg-white/90 border border-success/30 rounded text-[8px] font-extrabold uppercase text-success tracking-wider shadow-sm whitespace-nowrap">Lead</div>
      </div>
    `,
    className: '',
    iconSize: [28, 44],
    iconAnchor: [14, 14],
  });

  const jobIcon = L.divIcon({
    html: `
      <div class="flex flex-col items-center">
        <div class="w-7 h-7 rounded-xl bg-antiquegold border-2 border-white flex items-center justify-center text-white shadow-md">🔨</div>
        <div class="mt-1 px-1.5 py-0.5 bg-white/90 border border-antiquegold/30 rounded text-[8px] font-extrabold uppercase text-[#785115] tracking-wider shadow-sm whitespace-nowrap">SOP Hub</div>
      </div>
    `,
    className: '',
    iconSize: [28, 44],
    iconAnchor: [14, 14],
  });

  // Render HTML5 Interactive Vector Map of Pune
  // Coordinates mapping formula from (Lat, Lng) to (X, Y) percent positions on a 1000x1000 map space
  // Pune center is roughly 18.52, 73.85
  const mapCenterLat = 18.5204;
  const mapCenterLng = 73.8567;
  const latScale = 9000; // scaling factor
  const lngScale = 9000;

  const getVectorCoords = (lat: number, lng: number) => {
    // Offset relative to center, scaled and translated to positive pixel values
    const x = 500 + (lng - mapCenterLng) * lngScale;
    const y = 500 - (lat - mapCenterLat) * latScale; // invert Y for map screen space
    return { x, y };
  };

  // Vector Panning Drag Handlers
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

  // Get active items to draw
  const activeLeadsPins = showActiveLeads 
    ? leads.filter(l => {
        if (filters.leadStageFilter !== 'all' && l.stage !== filters.leadStageFilter) return false;
        if (filters.leadFloorsFilter !== 'all') {
          const floors = l.buildingInfo.floors;
          if (filters.leadFloorsFilter === 'low' && floors > 4) return false;
          if (filters.leadFloorsFilter === 'medium' && (floors < 5 || floors > 9)) return false;
          if (filters.leadFloorsFilter === 'high' && floors < 10) return false;
        }
        
        // Territory check: filter by selected sectors
        const addr = l.buildingInfo.address.toLowerCase();
        let terrKey = '';
        if (addr.includes('chakan')) terrKey = 't1';
        else if (addr.includes('kothrud') || addr.includes('ambegaon')) terrKey = 't2';
        else if (addr.includes('kharadi') || addr.includes('estate')) terrKey = 't3';
        else if (addr.includes('hinjewadi') || addr.includes('shanti')) terrKey = 't4';
        
        if (terrKey && !(filters.territorySelect as any)[terrKey]) return false;
        
        return true;
      })
    : [];

  const activeJobsPins = showActiveInstallations
    ? jobs.filter(j => {
        if (filters.jobStatusFilter !== 'all' && j.status !== filters.jobStatusFilter) return false;
        return true;
      })
    : [];

  return (
    <div className="space-y-6 flex flex-col h-full relative font-sans">
      
      {/* 1. RUNNING COUNTER STRIP (TOP BAR) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-sm">
        <div className="p-3 bg-[#F8F6F1] rounded-xl border border-[rgba(184,135,61,0.08)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-royalemerald/10 text-royalemerald flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-warmgray tracking-wider">Staff On-Duty</p>
            <p className="font-serif text-lg font-bold text-charcoal">
              {staffList.filter(s => s.status !== 'lost_signal').length} <span className="text-[10px] text-warmgray font-sans font-normal">/ {staffList.length}</span>
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#F8F6F1] rounded-xl border border-[rgba(184,135,61,0.08)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FFF5C6] text-[#B8873D] flex items-center justify-center shrink-0 border border-[#B8873D]/20">
            <Sparkles className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-warmgray tracking-wider">Leads Today</p>
            <p className="font-serif text-lg font-bold text-charcoal">
              {leads.length} <span className="text-[10px] text-success font-sans font-bold uppercase">+{leads.filter(l => l.stage === 'captured').length} new</span>
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#F8F6F1] rounded-xl border border-[rgba(184,135,61,0.08)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-royalemerald/10 text-royalemerald flex items-center justify-center shrink-0">
            <Hammer className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-warmgray tracking-wider">Jobs In-Progress</p>
            <p className="font-serif text-lg font-bold text-charcoal">
              {jobs.filter(j => j.status === 'in_progress').length} <span className="text-[10px] text-warmgray font-sans font-normal">Active</span>
            </p>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${lostSignalCount > 0 ? 'bg-error/5 border-error/20 text-error' : 'bg-[#F8F6F1] border-[rgba(184,135,61,0.08)]'}`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${lostSignalCount > 0 ? 'bg-error/10 text-error' : 'bg-warmgray/10 text-warmgray'}`}>
            <AlertTriangle className={`w-5 h-5 stroke-[1.5] ${lostSignalCount > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-warmgray tracking-wider">Alerts (Offline)</p>
            <p className={`font-serif text-lg font-bold ${lostSignalCount > 0 ? 'text-error' : 'text-charcoal'}`}>
              {lostSignalCount} <span className="text-[10px] font-sans font-normal">Lost signal</span>
            </p>
          </div>
        </div>
      </div>

      {/* TOAST PANEL FOR TELEMETRY ALERTS */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-18 left-4 right-4 z-40"
          >
            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-lg ${
              toastMsg.type === 'warn' ? 'bg-[#FFF9E6] border-[#FFC72C]/40 text-[#614309]' : 
              toastMsg.type === 'success' ? 'bg-[#E6F7ED] border-[#2E8F5B]/40 text-[#124B2C]' :
              'bg-[#F2EFF7] border-[#8A64D6]/40 text-[#3F2B66]'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="text-sm">⚡</span>
                <p className="text-xs font-semibold">{toastMsg.text}</p>
              </div>
              <button 
                onClick={() => setToastMsg(null)}
                className="p-1 hover:bg-black/5 rounded-full transition-colors text-charcoal/40"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. LAYER CONTROLS AND TOGGLES (Sticky Float Left Side) */}
      <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[650px] relative">
        
        {/* MAP STAGE CONTAINER */}
        <div className={isFullscreen
          ? "fixed inset-0 z-[200] bg-white flex flex-col"
          : "flex-1 h-[500px] sm:h-[550px] lg:h-full rounded-2xl overflow-hidden border border-[rgba(184,135,61,0.2)] bg-white relative shadow-inner min-h-[400px] flex flex-col"
        }>

          {/* MAP MODE CHIP CONTROLLERS */}
          <div className="absolute top-4 left-4 z-10 flex gap-1 bg-white/90 p-1 rounded-xl backdrop-blur-md shadow-sm border border-[rgba(184,135,61,0.12)]">
            <button
              onClick={() => setMapMode('vector')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                mapMode === 'vector'
                  ? 'bg-[#B8873D] text-white'
                  : 'text-warmgray hover:text-charcoal'
              }`}
            >
              👑 Vector Sandbox
            </button>
            <button
              onClick={() => setMapMode('street')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                mapMode === 'street'
                  ? 'bg-royalemerald text-white'
                  : 'text-warmgray hover:text-charcoal'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Live Street Map
            </button>
          </div>

          {/* FULLSCREEN TOGGLE */}
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            title={isFullscreen ? 'Exit full screen' : 'Full screen'}
            className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white rounded-xl backdrop-blur-md shadow-sm border border-[rgba(184,135,61,0.12)] text-charcoal transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* =========================================================
              RENDER OPTION A: REAL STREET MAP (OpenStreetMap, free, no key)
              ========================================================= */}
          {mapMode === 'street' ? (
            <div className="absolute inset-0 w-full h-full z-0">
              <MapContainer
                center={[mapCenterLat, mapCenterLng]}
                zoom={12}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapResizeHandler trigger={isFullscreen} />

                {/* Operational territory zones as real geo-circles */}
                {showTerritories && TERRITORIES.map(t => (
                  <Circle
                    key={t.id}
                    center={[t.center.lat, t.center.lng]}
                    radius={t.radius}
                    pathOptions={{ color: t.border, weight: 1.5, dashArray: '6 6', fillColor: t.border, fillOpacity: 0.08 }}
                  />
                ))}

                {/* Clustered staff / single-staff pins */}
                {clusters.map(cluster => {
                  const count = cluster.members.length;
                  const isCluster = count > 1;

                  if (isCluster) {
                    return (
                      <Marker
                        key={`s-cluster-${cluster.key}`}
                        position={[cluster.lat, cluster.lng]}
                        icon={clusterIcon(count)}
                        eventHandlers={{ click: () => setSelectedPin({ type: 'cluster', data: cluster.members, id: cluster.key }) }}
                      />
                    );
                  }

                  const staff = cluster.members[0];
                  return (
                    <Marker
                      key={`s-staff-${staff.id}`}
                      position={[staff.lat, staff.lng]}
                      icon={staffIcon(staff)}
                      eventHandlers={{ click: () => setSelectedPin({ type: 'staff', data: staff, id: staff.id }) }}
                    />
                  );
                })}

                {/* Active leads shown as pins */}
                {showActiveLeads && activeLeadsPins.map(lead => (
                  <Marker
                    key={`s-lead-${lead.id}`}
                    position={[lead.buildingInfo.latitude || 18.52, lead.buildingInfo.longitude || 73.85]}
                    icon={leadIcon}
                    eventHandlers={{ click: () => setSelectedPin({ type: 'lead', data: lead, id: lead.id }) }}
                  />
                ))}

                {/* Active jobs shown as pins */}
                {showActiveInstallations && activeJobsPins.map(job => {
                  const lead = leads.find(l => l.id === job.dealId || l.id === 'lead_1'); // Map fallback
                  const lat = lead?.buildingInfo.latitude || 18.51;
                  const lng = lead?.buildingInfo.longitude || 73.81;

                  return (
                    <Marker
                      key={`s-job-${job.id}`}
                      position={[lat, lng]}
                      icon={jobIcon}
                      eventHandlers={{ click: () => setSelectedPin({ type: 'job', data: { job, lead }, id: job.id }) }}
                    />
                  );
                })}
              </MapContainer>
            </div>
          ) : (
            
            /* =========================================================
                RENDER OPTION B: PREMIUM STYLIZED INTERACTIVE VECTOR MAP
                ========================================================= */
            <div 
              className="w-full flex-1 relative select-none cursor-grab active:cursor-grabbing overflow-hidden bg-[#FAF9F5]"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Interactive background Grid / Grid Coordinates paper effect */}
              <div 
                className="absolute inset-0 transition-transform duration-100 ease-out"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  backgroundImage: 'linear-gradient(to right, rgba(184, 135, 61, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(184, 135, 61, 0.08) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                  transformOrigin: 'center'
                }}
              >
                {/* 1. Rivers / Water veins vector lines for Pune feel (Mula-Mutha river) */}
                <svg className="absolute inset-0 w-[1200px] h-[1200px] opacity-25 pointer-events-none" style={{ left: -100, top: -100 }}>
                  <path 
                    d="M 50,450 Q 200,430 400,500 T 700,520 T 1000,480" 
                    fill="none" 
                    stroke="#1E88E5" 
                    strokeWidth="32" 
                    strokeLinecap="round"
                    strokeLinejoin="round" 
                  />
                  <path 
                    d="M 400,500 Q 420,650 350,850 T 300,1100" 
                    fill="none" 
                    stroke="#1E88E5" 
                    strokeWidth="20" 
                    strokeLinecap="round" 
                  />
                </svg>

                {/* 2. Primary Highways / Transit arterials */}
                <svg className="absolute inset-0 w-[1200px] h-[1200px] opacity-15 pointer-events-none" style={{ left: -100, top: -100 }}>
                  {/* Outer Ring Road Pune */}
                  <circle cx="500" cy="500" r="320" fill="none" stroke="#2A2723" strokeWidth="8" strokeDasharray="12,12" />
                  {/* Highways */}
                  <line x1="0" y1="500" x2="1000" y2="500" stroke="#B8873D" strokeWidth="6" />
                  <line x1="500" y1="0" x2="500" y2="1000" stroke="#B8873D" strokeWidth="6" />
                  {/* Western Express */}
                  <line x1="150" y1="150" x2="850" y2="850" stroke="#0E4B3D" strokeWidth="4" />
                </svg>

                {/* 3. Operational Territories polygons (Gold & Emerald tinted areas) */}
                {showTerritories && TERRITORIES.map(t => {
                  const coords = getVectorCoords(t.center.lat, t.center.lng);
                  return (
                    <div 
                      key={t.id}
                      className="absolute rounded-full border border-dashed flex items-center justify-center transition-all duration-300"
                      style={{
                        left: coords.x - 90,
                        top: coords.y - 90,
                        width: 180,
                        height: 180,
                        backgroundColor: t.color,
                        borderColor: t.border,
                        boxShadow: `0 0 16px ${t.border}15`
                      }}
                    >
                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-charcoal/40 text-center select-none font-sans px-2 pointer-events-none">
                        {t.name.split(' ')[1]}
                      </span>
                    </div>
                  );
                })}

                {/* 3.5. Demand Density Heatmap Layer */}
                {filters.showHeatmap && leads.map(lead => {
                  const coords = getVectorCoords(lead.buildingInfo.latitude || 18.52, lead.buildingInfo.longitude || 73.85);
                  const gradientColor = 
                    filters.heatmapIntensity === 'gold' ? 'rgba(184, 135, 61, 0.28)' :
                    filters.heatmapIntensity === 'emerald' ? 'rgba(14, 75, 61, 0.28)' :
                    filters.heatmapIntensity === 'sapphire' ? 'rgba(30, 136, 229, 0.28)' :
                    'rgba(229, 57, 53, 0.28)';
                  
                  const glowSize = 
                    filters.heatmapRadius === 'small' ? 80 :
                    filters.heatmapRadius === 'medium' ? 140 :
                    210;

                  return (
                    <div 
                      key={`heatmap-${lead.id}`}
                      className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-500 blur-xl mix-blend-multiply"
                      style={{
                        left: coords.x,
                        top: coords.y,
                        width: glowSize,
                        height: glowSize,
                        background: `radial-gradient(circle, ${gradientColor} 0%, transparent 70%)`
                      }}
                    />
                  );
                })}

                {/* 3.6. Geofences Circle Layer */}
                {filters.showGeofences && activeJobsPins.map(job => {
                  const lead = leads.find(l => l.id === job.dealId || l.id === 'lead_1');
                  const lat = lead?.buildingInfo.latitude || 18.51;
                  const lng = lead?.buildingInfo.longitude || 73.81;
                  const coords = getVectorCoords(lat, lng);
                  
                  const geoRadius = filters.geofenceAccuracyRadius * 2;

                  return (
                    <div 
                      key={`geofence-job-${job.id}`}
                      className="absolute rounded-full border border-dashed border-orange-500/50 bg-orange-500/5 pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse"
                      style={{
                        left: coords.x,
                        top: coords.y,
                        width: geoRadius * 2,
                        height: geoRadius * 2
                      }}
                    >
                      <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[7px] font-mono font-bold text-orange-600 bg-white/90 border border-orange-200 px-1 py-0.5 rounded shadow-xs select-none whitespace-nowrap">
                        LOCK CLAMP {filters.geofenceMinConfidence}%
                      </span>
                    </div>
                  );
                })}

                {/* 4. Active Leads map pins */}
                {showActiveLeads && activeLeadsPins.map(lead => {
                  const coords = getVectorCoords(lead.buildingInfo.latitude || 18.52, lead.buildingInfo.longitude || 73.85);
                  return (
                    <button
                      key={`v-lead-${lead.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPin({ type: 'lead', data: lead, id: lead.id });
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer focus:outline-none transition-transform hover:scale-110 active:scale-95 z-10"
                      style={{ left: coords.x, top: coords.y }}
                    >
                      <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-success/30 flex items-center justify-center text-success shadow-md">
                        <Building className="w-3.5 h-3.5 stroke-[2]" />
                      </div>
                      <div className="mt-1 px-1 py-0.5 bg-white border border-[#e5dfd4] rounded shadow-xs text-[7px] font-extrabold text-success uppercase tracking-wider">
                        {lead.contactInfo.name.split(' ')[0]}
                      </div>
                    </button>
                  );
                })}

                {/* 5. Active Jobs Installation SOP hubs */}
                {showActiveInstallations && activeJobsPins.map(job => {
                  const lead = leads.find(l => l.id === job.dealId || l.id === 'lead_1');
                  const lat = lead?.buildingInfo.latitude || 18.51;
                  const lng = lead?.buildingInfo.longitude || 73.81;
                  const coords = getVectorCoords(lat, lng);

                  return (
                    <button
                      key={`v-job-${job.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPin({ type: 'job', data: { job, lead }, id: job.id });
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer focus:outline-none transition-transform hover:scale-110 active:scale-95 z-10"
                      style={{ left: coords.x, top: coords.y }}
                    >
                      <div className="w-7 h-7 rounded-xl bg-[#FFF9E6] border border-antiquegold/30 flex items-center justify-center text-antiquegold shadow-md">
                        <Hammer className="w-3.5 h-3.5 stroke-[2]" />
                      </div>
                      <div className="mt-1 px-1 py-0.5 bg-white border border-[#e5dfd4] rounded shadow-xs text-[7px] font-extrabold text-[#785115] uppercase tracking-wider">
                        Install
                      </div>
                    </button>
                  );
                })}

                {/* 6. Clustered staff moving pins with same-vehicle count support */}
                {clusters.map(cluster => {
                  const coords = getVectorCoords(cluster.lat, cluster.lng);
                  const count = cluster.members.length;
                  const isCluster = count > 1;

                  if (isCluster) {
                    return (
                      <button
                        key={`v-cluster-${cluster.key}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPin({ type: 'cluster', data: cluster.members, id: cluster.key });
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer focus:outline-none z-20"
                        style={{ left: coords.x, top: coords.y }}
                      >
                        <div className="relative">
                          {/* Inner pulsing layer */}
                          <span className="absolute inset-0 rounded-full bg-royalemerald/30 animate-ping" />
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0E4B3D] to-[#125e4c] border-2 border-white flex items-center justify-center text-white text-xs font-black shadow-xl relative">
                            {count}
                          </div>
                          <span className="absolute -top-1 -right-1 bg-antiquegold text-white w-4.5 h-4.5 rounded-full border border-white flex items-center justify-center text-[8px] font-bold shadow animate-bounce">
                            🚗
                          </span>
                        </div>
                        <div className="mt-1.5 px-2 py-0.5 bg-royalemerald text-white rounded-md text-[8px] font-extrabold uppercase tracking-wider shadow-sm">
                          Shared Vehicle
                        </div>
                      </button>
                    );
                  }

                  const staff = cluster.members[0];
                  const markerColor = staff.role === 'surveyor' ? 'bg-[#0E4B3D]' : 'bg-[#B8873D]';
                  const glowColor = staff.role === 'surveyor' ? 'shadow-[0_0_12px_rgba(14,75,61,0.4)]' : 'shadow-[0_0_12px_rgba(184,135,61,0.4)]';

                  return (
                    <button
                      key={`v-staff-${staff.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPin({ type: 'staff', data: staff, id: staff.id });
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer focus:outline-none z-20"
                      style={{ left: coords.x, top: coords.y }}
                    >
                      <div className="relative">
                        {/* Ping radar ring for moving traveling staff */}
                        {staff.status === 'traveling' && (
                          <span className={`absolute -inset-2 rounded-full border border-dashed border-antiquegold/60 animate-spin`} />
                        )}

                        <div className={`w-9 h-9 rounded-2xl ${markerColor} ${glowColor} border-2 border-white p-0.5 shadow-md flex items-center justify-center relative transition-transform hover:scale-110 active:scale-95`}>
                          <img src={staff.avatar} alt={staff.name} className="w-full h-full rounded-xl object-cover" />
                          
                          {/* Top right status chips */}
                          {staff.status === 'lost_signal' && (
                            <span className="absolute -top-1.5 -right-1.5 bg-[#B23B3B] text-white w-4 h-4 rounded-full border border-white flex items-center justify-center text-[8px] font-black animate-pulse">
                              !
                            </span>
                          )}
                          {staff.status === 'traveling' && (
                            <span className="absolute -bottom-1 -right-1 bg-royalemerald text-white w-4 h-4 rounded-full border border-white flex items-center justify-center text-[7px]">
                              🚗
                            </span>
                          )}
                          {staff.status === 'on-site' && (
                            <span className="absolute -bottom-1 -right-1 bg-success text-white w-4 h-4 rounded-full border border-white flex items-center justify-center text-[7px]">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-1.5 px-2 py-0.5 bg-white/95 border border-[rgba(184,135,61,0.15)] rounded-md text-[9px] font-bold text-charcoal shadow-sm flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'lost_signal' ? 'bg-[#B23B3B]' : 'bg-success'}`} />
                        {staff.name.split(' ')[0]}
                      </div>
                    </button>
                  );
                })}

                {/* 7. Central HQ core anchor */}
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                  style={{ left: 500, top: 500 }}
                >
                  <div className="w-4 h-4 bg-royalemerald border-2 border-white rounded-full shadow-lg relative flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-antiquegold rounded-full" />
                    <span className="absolute -inset-2 rounded-full border-2 border-royalemerald/20 animate-ping" />
                  </div>
                  <span className="mt-1 text-[8px] font-extrabold uppercase tracking-wider text-charcoal/50 font-mono">
                    AIEC HQ
                  </span>
                </div>
              </div>

              {/* VECTOR ZOOM CONTROL SLIDER CONTROLLER */}
              <div className="absolute bottom-4 right-4 z-10 flex flex-col bg-white rounded-xl shadow-md border border-[rgba(184,135,61,0.12)] p-1 gap-1">
                <button
                  onClick={() => setZoom(prev => Math.min(prev + 0.15, 2.5))}
                  className="w-8 h-8 rounded-lg hover:bg-alabaster flex items-center justify-center text-charcoal/70 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-alabaster flex items-center justify-center text-charcoal/70 text-[10px] font-bold transition-colors"
                >
                  RST
                </button>
                <button
                  onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.65))}
                  className="w-8 h-8 rounded-lg hover:bg-alabaster flex items-center justify-center text-charcoal/70 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              {/* GEOGRAPHIC GRID REFERENCE INDEX COMPASS */}
              <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 bg-white/95 p-2 rounded-xl shadow-sm border border-[rgba(184,135,61,0.1)] text-charcoal/65">
                <Compass className="w-4 h-4 text-antiquegold animate-spin" style={{ animationDuration: '24s' }} />
                <div className="text-[9px] font-mono leading-none">
                  <p className="font-bold text-charcoal">GRID: SECURE-TRACKER</p>
                  <p className="text-[8px] mt-0.5">18.5204° N, 73.8567° E • PUNE</p>
                </div>
              </div>

              {/* WATERMARK LABEL */}
              <div className="absolute top-15 right-4 z-10 pointer-events-none bg-white/30 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-dashed border-[#B8873D]/10">
                <span className="text-[8px] font-mono font-bold tracking-widest text-charcoal/50">SANDBOX SIMULATION ENVIRONMENT</span>
              </div>
            </div>
          )}

          {/* =========================================================
              FLOATING BOTTOM/SLIDE-UP SHEET DETAILED OVERLAY (Leaves Map Context visible)
              ========================================================= */}
          <AnimatePresence>
            {selectedPin && (
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute bottom-0 left-0 right-0 z-30 p-4 md:p-6 bg-white rounded-t-3xl border-t border-[rgba(184,135,61,0.22)] shadow-[0_-8px_32px_rgba(0,0,0,0.08)] max-h-[85%] overflow-y-auto text-left"
              >
                {/* Drag Indicator handle */}
                <div className="w-12 h-1.5 bg-[#e5dfd4] rounded-full mx-auto mb-4" />

                {/* 1. CLUSTER SELECTED LIST SCREEN */}
                {selectedPin.type === 'cluster' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-[#e5dfd4]">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-antiquegold uppercase tracking-widest">CO-LOCATED FIELD OPERATIONS</span>
                        <h4 className="font-serif text-lg font-bold text-charcoal">Shared Dispatch Vehicle detected</h4>
                      </div>
                      <button 
                        onClick={() => setSelectedPin(null)}
                        className="p-1.5 hover:bg-alabaster rounded-full transition-colors text-warmgray"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-xs text-warmgray">
                      Two active partners are recorded at matching GPS coordinates. This generally implies transit dispatch via the company shuttle route.
                    </p>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {selectedPin.data.map((staff: LiveStaff) => (
                        <div 
                          key={staff.id} 
                          className="p-3 bg-alabaster hover:bg-white border border-[rgba(184,135,61,0.1)] rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                          onClick={() => setSelectedPin({ type: 'staff', data: staff, id: staff.id })}
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={staff.avatar} alt={staff.name} className="w-8 h-8 rounded-full border border-antiquegold object-cover" />
                            <div>
                              <p className="text-xs font-bold text-charcoal">{staff.name}</p>
                              <p className="text-[10px] text-warmgray font-mono uppercase font-semibold">{staff.role} • {staff.status}</p>
                            </div>
                          </div>
                          <ChevronRightIcon className="w-4 h-4 text-warmgray" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. SINGLE STAFF DETAILED CONTROLLER AND THE ASCENSION LINE */}
                {selectedPin.type === 'staff' && (() => {
                  const staff = selectedPin.data as LiveStaff;
                  const isOffline = staff.status === 'lost_signal';

                  // Dynamic Ascension Line layout representing current job routing stage
                  const staffSteps = [
                    { id: '1', label: 'HQ Dispatch Received', completed: true },
                    { id: '2', label: 'In Transit / Route Tracking', completed: staff.status === 'traveling' || staff.status === 'on-site' },
                    { id: '3', label: 'On-site Execution', completed: staff.status === 'on-site', active: staff.status === 'on-site' },
                    { id: '4', label: 'HQ Safety Approval', completed: false }
                  ];

                  return (
                    <div className="space-y-4">
                      {/* Card Header Info */}
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="relative">
                            <img src={staff.avatar} alt={staff.name} className="w-14 h-14 rounded-2xl border-2 border-antiquegold object-cover" />
                            <span className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white ${isOffline ? 'bg-[#B23B3B]' : 'bg-success font-black'}`}>
                              {isOffline ? '!' : '✓'}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-serif text-base font-bold text-charcoal">{staff.name}</h4>
                              <Badge status={staff.role === 'surveyor' ? 'captured' : 'qc_pending'} className="text-[9px] py-0 px-2 leading-none" />
                            </div>
                            <p className="text-[10px] text-warmgray font-mono uppercase font-bold tracking-wider mt-0.5">{staff.region} • On-Duty Sector</p>
                            
                            {/* Device telemetry strip */}
                            <div className="flex gap-3 text-[10px] text-warmgray font-mono font-semibold mt-1">
                              <span className="flex items-center gap-1">
                                <Battery className="w-3.5 h-3.5 text-antiquegold" />
                                {staff.battery}%
                              </span>
                              <span className="flex items-center gap-1">
                                <Signal className="w-3.5 h-3.5 text-royalemerald" />
                                {staff.signalStrength.toUpperCase()}
                              </span>
                              <span className="flex items-center gap-1">
                                📶 {staff.lastPing}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => setSelectedPin(null)}
                            className="p-1.5 hover:bg-alabaster rounded-full transition-colors text-warmgray"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* CONDITIONAL ACTION NEEDED BAR FOR OFFLINE SIGNALS */}
                      {isOffline ? (
                        <div className="p-3 bg-error/10 border border-error/20 rounded-xl space-y-2">
                          <div className="flex items-start gap-2 text-error text-xs text-left">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-bold uppercase tracking-wider">Field Signal Disrupted (&gt; 20 minutes)</p>
                              <p className="text-[11px] leading-relaxed opacity-90">
                                This device has not committed coordinates to the secure ledger in over 20 minutes. Please confirm manual safety protocols.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => repairSignal(staff.id)}
                              className="flex-1 py-1.5 bg-error text-white font-bold text-[10px] uppercase rounded-lg shadow cursor-pointer transition-colors hover:bg-error/90"
                            >
                              Simulate Remote Ping Restored
                            </button>
                            <a
                              href={`tel:${staff.phone}`}
                              className="px-3 py-1.5 bg-white border border-error/30 text-error rounded-lg flex items-center justify-center"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        /* Current Active Task Info card */
                        <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)] text-left space-y-1.5">
                          <span className="text-[8px] font-mono font-bold text-antiquegold uppercase tracking-widest block">TELEMETRY TASK MONITORING</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success animate-ping" />
                            <p className="text-xs font-bold text-charcoal">{staff.taskName || 'Awaiting Next Active Job'}</p>
                          </div>
                          <p className="text-[11px] text-warmgray">
                            Device coordinates are streaming in under 15-second latency intervals. Safety clearance tracking active.
                          </p>
                        </div>
                      )}

                      {/* THE GOLDEN ASCENSION LINE PROGRESS BAR INTEGRATION */}
                      <div className="py-2 border-t border-b border-dashed border-[#e5dfd4]">
                        <p className="text-[9px] font-mono font-bold text-antiquegold uppercase tracking-widest mb-3">Ascension Line Route Progress</p>
                        <AscensionLine steps={staffSteps} orientation="horizontal" className="px-2" />
                      </div>

                      {/* Active Action shortcuts */}
                      <div className="flex gap-2 pt-2">
                        <a 
                          href={`tel:${staff.phone}`}
                          className="flex-1 py-3 bg-royalemerald hover:bg-royalemerald/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow"
                        >
                          <Phone className="w-4 h-4 stroke-[1.5]" />
                          <span>Call {staff.name.split(' ')[0]}</span>
                        </a>

                        <a 
                          href={`https://wa.me/${staff.phone.replace(/\s+/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-3 bg-[#25D366] hover:bg-[#20ba56] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>WhatsApp Portal</span>
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. ACTIVE LEAD DETAILS SHEET */}
                {selectedPin.type === 'lead' && (() => {
                  const lead = selectedPin.data as Lead;
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
                            <Building className="w-6 h-6 stroke-[1.5]" />
                          </div>
                          <div>
                            <span className="text-[8px] font-mono font-bold text-success uppercase tracking-widest bg-success/10 px-2 py-0.5 rounded-full">ACTIVE UNVERIFIED LEAD</span>
                            <h4 className="font-serif text-lg font-bold text-charcoal mt-1">{lead.contactInfo.name}</h4>
                            <p className="text-xs text-warmgray mt-0.5">{lead.buildingInfo.address}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedPin(null)}
                          className="p-1.5 hover:bg-alabaster rounded-full transition-colors text-warmgray"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)] font-mono text-[10px] text-warmgray">
                        <div>
                          <p className="text-[8px] font-sans uppercase font-bold text-warmgray">Building Heights</p>
                          <p className="text-charcoal font-bold">{lead.buildingInfo.floors} Floors High</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-sans uppercase font-bold text-warmgray">Shaft Drive Preference</p>
                          <p className="text-charcoal font-bold uppercase">{lead.buildingInfo.driveType || 'Traction'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-sans uppercase font-bold text-warmgray">Owner Mobile</p>
                          <p className="text-charcoal font-bold">{lead.contactInfo.phone}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-sans uppercase font-bold text-warmgray">Lead Stage Status</p>
                          <p className="text-antiquegold font-bold uppercase tracking-wider">{lead.stage}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={`tel:${lead.contactInfo.phone}`}
                          className="flex-1 py-2.5 bg-royalemerald hover:bg-royalemerald/90 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Contact Client</span>
                        </a>
                        <button
                          onClick={() => {
                            setToastMsg({
                              id: `lead_assign_${Date.now()}`,
                              text: `📋 Lead assigned to Amit Sharma. Auto-notifying device.`,
                              type: 'success'
                            });
                            setSelectedPin(null);
                          }}
                          className="flex-1 py-2.5 bg-antiquegold hover:bg-[#a37532] text-white rounded-xl text-xs font-bold text-center shadow"
                        >
                          Dispatch Surveyor
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. ACTIVE INSTALLATION SOP DETAILS SHEET */}
                {selectedPin.type === 'job' && (() => {
                  const { job, lead } = selectedPin.data as { job: Job; lead: Lead };
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-xl bg-antiquegold/10 text-antiquegold flex items-center justify-center">
                            <Hammer className="w-6 h-6 stroke-[1.5]" />
                          </div>
                          <div>
                            <span className="text-[8px] font-mono font-bold text-antiquegold uppercase tracking-widest bg-antiquegold/10 px-2 py-0.5 rounded-full">ACTIVE INSTALLATION JOB</span>
                            <h4 className="font-serif text-lg font-bold text-charcoal mt-1">SOP Pipeline Tracker</h4>
                            <p className="text-xs text-warmgray mt-0.5">{lead?.buildingInfo.address || 'Kothrud, Pune'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedPin(null)}
                          className="p-1.5 hover:bg-alabaster rounded-full transition-colors text-warmgray"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Display current active SOP step */}
                      <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)]">
                        <span className="text-[8px] font-mono font-bold text-antiquegold uppercase tracking-widest block mb-2">CURRENT ACTIVE MILESTONE</span>
                        {job.sopSteps ? (
                          <div className="space-y-2">
                            {job.sopSteps.slice(0, 3).map(step => (
                              <div key={step.id} className="flex items-center gap-2.5 text-xs">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step.completed ? 'bg-success text-white' : 'bg-white border border-dashed border-antiquegold text-antiquegold animate-pulse'}`}>
                                  {step.completed ? '✓' : '⏱'}
                                </div>
                                <span className={step.completed ? 'text-warmgray/75 line-through' : 'text-charcoal font-bold'}>
                                  {step.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-warmgray">Assembly and structural diagnostics in progress.</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setToastMsg({
                              id: `qc_verify_${Date.now()}`,
                              text: `👑 Golden Ascension clearance submitted for dispatch QC verification.`,
                              type: 'success'
                            });
                            setSelectedPin(null);
                          }}
                          className="w-full py-3 bg-royalemerald hover:bg-royalemerald/90 text-white rounded-xl text-xs font-bold shadow"
                        >
                          Verify SOP Milestone Status
                        </button>
                      </div>
                    </div>
                  );
                })()}

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* 3. LAYER CONTROL SIDEBAR */}
        <aside className="w-full lg:w-72 bg-white rounded-2xl border border-[rgba(184,135,61,0.15)] p-4 flex flex-col justify-between shrink-0 shadow-sm text-left gap-4">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-serif text-base font-bold text-charcoal">Map Layers</h4>
                <p className="text-[11px] text-warmgray">Toggle GIS overlays to filter Pune GPS feeds</p>
              </div>
              <button 
                onClick={() => setIsFiltersOpen(true)}
                className="p-1.5 bg-[#F8F6F1] border border-[rgba(184,135,61,0.15)] text-antiquegold hover:text-[#875b1a] rounded-lg hover:shadow-xs transition-all relative"
                title="Configure advanced sub-filters"
              >
                <Sliders className="w-4 h-4" />
                {(filters.staffRoleFilter !== 'all' || filters.staffStatusFilter !== 'all' || filters.staffBatteryAlert || filters.leadStageFilter !== 'all' || filters.leadFloorsFilter !== 'all' || filters.jobStatusFilter !== 'all' || filters.showHeatmap || filters.showGeofences) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full border border-white" />
                )}
              </button>
            </div>

            {/* QUICK TOGGLE SWITCHES */}
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 hover:bg-alabaster rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[#e5dfd4]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-[#0E4B3D] border border-white flex items-center justify-center text-white text-[8px]">✓</div>
                  <span className="text-xs font-semibold text-charcoal">Field Surveyors</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={showSurveyors}
                  onChange={(e) => setFilters(prev => ({ ...prev, showSurveyors: e.target.checked }))}
                  className="w-4 h-4 accent-antiquegold rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 hover:bg-alabaster rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[#e5dfd4]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-[#B8873D] border border-white flex items-center justify-center text-white text-[8px]">✓</div>
                  <span className="text-xs font-semibold text-charcoal">Installation Techs</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={showTechnicians}
                  onChange={(e) => setFilters(prev => ({ ...prev, showTechnicians: e.target.checked }))}
                  className="w-4 h-4 accent-antiquegold rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 hover:bg-alabaster rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[#e5dfd4]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-[#2E8F5B]/20 border border-success flex items-center justify-center text-success text-[8px]">★</div>
                  <span className="text-xs font-semibold text-charcoal">Active Lead Pins</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={showActiveLeads}
                  onChange={(e) => setFilters(prev => ({ ...prev, showActiveLeads: e.target.checked }))}
                  className="w-4 h-4 accent-antiquegold rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 hover:bg-alabaster rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[#e5dfd4]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-[#FFF5C6] border border-antiquegold flex items-center justify-center text-[#B8873D] text-[8px]">⚙</div>
                  <span className="text-xs font-semibold text-charcoal">Install SOP Hubs</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={showActiveInstallations}
                  onChange={(e) => setFilters(prev => ({ ...prev, showActiveInstallations: e.target.checked }))}
                  className="w-4 h-4 accent-antiquegold rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 hover:bg-alabaster rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[#e5dfd4]">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs">🗺️</span>
                  <span className="text-xs font-semibold text-charcoal">Territory Zones</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={showTerritories}
                  onChange={(e) => setFilters(prev => ({ ...prev, showTerritories: e.target.checked }))}
                  className="w-4 h-4 accent-antiquegold rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 hover:bg-alabaster rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[#e5dfd4]">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs">🔥</span>
                  <span className="text-xs font-semibold text-charcoal">Demand Heatmap</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={filters.showHeatmap}
                  onChange={(e) => setFilters(prev => ({ ...prev, showHeatmap: e.target.checked }))}
                  className="w-4 h-4 accent-antiquegold rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 hover:bg-alabaster rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[#e5dfd4]">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs">🛡️</span>
                  <span className="text-xs font-semibold text-charcoal">Geofences Lock</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={filters.showGeofences}
                  onChange={(e) => setFilters(prev => ({ ...prev, showGeofences: e.target.checked }))}
                  className="w-4 h-4 accent-antiquegold rounded cursor-pointer"
                />
              </label>
            </div>

            {/* FULL CONTROL CTA BUTTON */}
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="w-full py-2.5 bg-antiquegold/10 text-[#B8873D] hover:bg-antiquegold hover:text-white text-[11px] font-bold rounded-xl border border-antiquegold/20 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configure Advanced Filters</span>
            </button>
          </div>

          {/* TELEMETRY FEED / ALERT LOGS */}
          <div className="space-y-3 pt-3 border-t border-dashed border-[#e5dfd4] flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[8px] font-mono font-bold text-antiquegold uppercase tracking-widest block">Live Security Telemetry Feed</span>
              <div className="mt-2 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <p className="text-[10px] text-warmgray italic">Listening to GPS broadcast frequencies... No disruptions logged.</p>
                ) : (
                  alerts.map((a, i) => (
                    <div key={i} className="text-[9px] font-mono bg-alabaster p-1.5 rounded border border-[#e5dfd4] text-charcoal leading-normal">
                      {a}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sandbox triggers to demonstrate bad signals / edge cases easily */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[8px] font-mono font-bold text-charcoal/40 uppercase tracking-widest block">Simulation Triggers</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={triggerSimulatedGpSAnomaly}
                  className="py-1.5 px-2 bg-antiquegold/10 text-[#B8873D] text-[9px] font-bold uppercase rounded-lg border border-antiquegold/20 hover:bg-antiquegold/15 cursor-pointer text-center"
                >
                  Jump GPS (Drift)
                </button>
                <button
                  onClick={() => {
                    setStaffList(prev => {
                      return prev.map(s => {
                        if (s.id === 'anil_kamble') {
                          return {
                            ...s,
                            status: 'lost_signal',
                            lastPingSecondsAgo: 1450,
                            lastPing: '24m ago',
                            signalStrength: 'none'
                          };
                        }
                        return s;
                      });
                    });
                    setToastMsg({
                      id: `lost_signal_trig_${Date.now()}`,
                      text: `⚠️ Remote device 'Anil Kamble' telemetry ping timed out. Lost signal logged.`,
                      type: 'warn'
                    });
                  }}
                  className="py-1.5 px-2 bg-error/10 text-error text-[9px] font-bold uppercase rounded-lg border border-error/20 hover:bg-error/15 cursor-pointer text-center"
                >
                  Drop Link
                </button>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* Advanced Filters & Layers Control Slide-out Panel */}
      <MapFiltersLayersControlPanel
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onChangeFilters={setFilters}
        userId={user.id}
        onShowAlert={(text, type) => {
          setToastMsg({
            id: `toast_filter_${Date.now()}`,
            text,
            type
          });
        }}
      />
    </div>
  );
};

// Simple proxy element for lucide since ChevronRight might be required as ChevronRightIcon in compilation depending on naming
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
};
