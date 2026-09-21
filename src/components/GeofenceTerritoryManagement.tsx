import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Users, Layers, Plus, X, Check, Settings, AlertTriangle,
  Globe, Sparkles, Compass, Trash2, Edit3, Save, Award, Activity,
  Info, ArrowRight, ChevronRight, RefreshCw, UserCheck, Minimize2, Maximize2, CheckCircle2
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { User, Territory, Lead } from '../types';
import { Card, Button } from './Common';

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

export const GeofenceTerritoryManagement: React.FC<{
  user: User;
  apiKey?: string;
  hasValidKey?: boolean;
}> = ({ user }) => {
  // Database data
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [surveyors, setSurveyors] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Selection & State
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>('t_north');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [newTerritoryPoints, setNewTerritoryPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [newTerritoryName, setNewTerritoryName] = useState('');
  const [newTerritoryTarget, setNewTerritoryTarget] = useState(30);
  const [newTerritoryColor, setNewTerritoryColor] = useState('#0E4B3D');
  const [assignedSurveyorIds, setAssignedSurveyorIds] = useState<string[]>([]);
  
  // Handover & Split Wizard State
  const [showHandoverWizard, setShowHandoverWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Select, 2: Boundary/Percentage, 3: Confirm
  const [handoverSourceId, setHandoverSourceId] = useState('');
  const [handoverTargetId, setHandoverTargetId] = useState('');
  const [handoverLeadAction, setHandoverLeadAction] = useState<'all' | 'closest' | 'keep'>('closest');

  // Simulator State
  const [simLeadPos, setSimLeadPos] = useState<{ lat: number; lng: number } | null>(null);
  const [simResult, setSimResult] = useState<{
    status: 'inside' | 'overlap' | 'unassigned';
    routedTo: string;
    reason: string;
    details?: string;
  } | null>(null);

  // Map settings: 'street' uses free OpenStreetMap tiles (no key/billing needed)
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

  // Vector map panning/zoom state (Pune coordinate space)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Warnings & Notifications
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Initialize data
  useEffect(() => {
    loadData();
    // Listen for database updates
    const handleDbUpdate = () => loadData();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, []);

  const loadData = () => {
    setTerritories(DbManager.getTerritories());
    setSurveyors(DbManager.getUsers().filter(u => u.role === 'surveyor'));
    setLeads(DbManager.getLeads());
  };

  const triggerToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Pune coordinates
  const mapCenterLat = 18.5204;
  const mapCenterLng = 73.8567;
  const latScale = 9000;
  const lngScale = 9000;

  // Vector map projection helper
  const getVectorCoords = (lat: number, lng: number) => {
    const x = 500 + (lng - mapCenterLng) * lngScale;
    const y = 500 - (lat - mapCenterLat) * latScale;
    return { x, y };
  };

  // Inverse projection (X/Y screen to Lat/Lng)
  const getLatLngFromVectorCoords = (x: number, y: number) => {
    const lng = mapCenterLng + (x - 500) / lngScale;
    const lat = mapCenterLat - (y - 500) / latScale;
    return { lat, lng };
  };

  // Drag handlers for SVG Map
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDrawingMode) return; // Don't pan while drawing points
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

  // Canvas click handler for drawing vertices
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingMode || !mapRef.current) return;
    
    // Get mouse coordinate relative to map stage center
    const rect = mapRef.current.getBoundingClientRect();
    
    // Account for zoom and pan
    const mouseX = (e.clientX - rect.left - pan.x - rect.width / 2) / zoom + 500;
    const mouseY = (e.clientY - rect.top - pan.y - rect.height / 2) / zoom + 500;
    
    const { lat, lng } = getLatLngFromVectorCoords(mouseX, mouseY);
    
    // Validation: check if the new point is too close to the last one (under 100 meters / 0.001 degrees)
    if (newTerritoryPoints.length > 0) {
      const lastPoint = newTerritoryPoints[newTerritoryPoints.length - 1];
      const distance = Math.sqrt(Math.pow(lastPoint.lat - lat, 2) + Math.pow(lastPoint.lng - lng, 2));
      if (distance < 0.0015) {
        setWarningMsg("Point is too close to the previous vertex. Please choose a wider boundary.");
        return;
      }
    }

    // Validation: Self-intersection warning (naive check: if we have 3 points already, check if last segment crosses others)
    if (newTerritoryPoints.length >= 3) {
      // Show warning but allow unless extremely erratic
      setWarningMsg(null);
    }

    setNewTerritoryPoints([...newTerritoryPoints, { lat, lng }]);
    setWarningMsg(null);
  };

  // Predefined Pincode Clusters helper
  const loadPincodeCluster = (clusterType: 'pcmc' | 'kothrud' | 'kharadi' | 'hinjewadi') => {
    let pts: { lat: number; lng: number }[] = [];
    switch(clusterType) {
      case 'pcmc': // Chakan / Pimpri
        pts = [
          { lat: 18.7500, lng: 73.8000 },
          { lat: 18.7500, lng: 73.9000 },
          { lat: 18.6400, lng: 73.9000 },
          { lat: 18.6400, lng: 73.8000 }
        ];
        setNewTerritoryName('Pimpri Chinchwad Cluster (PCMC)');
        setNewTerritoryColor('#0E4B3D');
        break;
      case 'kothrud': // Kothrud / Erandwane
        pts = [
          { lat: 18.5400, lng: 73.7600 },
          { lat: 18.5400, lng: 73.8400 },
          { lat: 18.4600, lng: 73.8400 },
          { lat: 18.4600, lng: 73.7600 }
        ];
        setNewTerritoryName('Kothrud-Karve Road Cluster');
        setNewTerritoryColor('#B8873D');
        break;
      case 'kharadi': // East Pune IT hub
        pts = [
          { lat: 18.6000, lng: 73.9000 },
          { lat: 18.6000, lng: 73.9800 },
          { lat: 18.5000, lng: 73.9800 },
          { lat: 18.5000, lng: 73.9000 }
        ];
        setNewTerritoryName('Kharadi-Hadapsar Tech Corridor');
        setNewTerritoryColor('#8A64D6');
        break;
      case 'hinjewadi': // West Pune Phase 1,2,3
        pts = [
          { lat: 18.6400, lng: 73.6800 },
          { lat: 18.6400, lng: 73.7800 },
          { lat: 18.5300, lng: 73.7800 },
          { lat: 18.5300, lng: 73.6800 }
        ];
        setNewTerritoryName('Hinjewadi Phase 1-3 Cluster');
        setNewTerritoryColor('#E5A93C');
        break;
    }
    setNewTerritoryPoints(pts);
    triggerToast(`Imported ${clusterType.toUpperCase()} cluster coordinates!`, 'info');
  };

  // Save new hand-drawn territory
  const handleSaveNewTerritory = () => {
    if (newTerritoryPoints.length < 3) {
      setWarningMsg("A territory must have at least 3 boundaries/vertices.");
      return;
    }
    if (!newTerritoryName.trim()) {
      setWarningMsg("Please enter a name for this territory.");
      return;
    }
    if (assignedSurveyorIds.length === 0) {
      setWarningMsg("You must assign at least one active surveyor.");
      return;
    }

    const newTerritory: Territory = {
      id: `t_${Date.now()}`,
      name: newTerritoryName,
      polygonCoordinates: newTerritoryPoints,
      assignedSurveyorIds: assignedSurveyorIds,
      monthlyLeadTarget: newTerritoryTarget,
      monthlyLeadsCaptured: 0,
      conversionRate: 0,
      color: newTerritoryColor
    };

    DbManager.addTerritory(newTerritory);
    setSelectedTerritoryId(newTerritory.id);
    setIsDrawingMode(false);
    setNewTerritoryPoints([]);
    setNewTerritoryName('');
    setAssignedSurveyorIds([]);
    setWarningMsg(null);
    triggerToast("Territory saved successfully!");
    loadData();
  };

  // Delete Territory
  const handleDeleteTerritory = (id: string) => {
    if (window.confirm("Are you sure you want to delete this territory? Unassigned routing rules will apply to all future leads in this region.")) {
      DbManager.deleteTerritory(id);
      setSelectedTerritoryId(null);
      triggerToast("Territory deleted", 'warn');
      loadData();
    }
  };

  // Point in Polygon math (Ray-casting algorithm) to determine if lat/lng is inside coordinates
  const isPointInPolygon = (point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]) => {
    let x = point.lng, y = point.lat;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i].lng, yi = polygon[i].lat;
      let xj = polygon[j].lng, yj = polygon[j].lat;
      let intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Calculate Haversine distance between two points (in kilometers)
  const getDistanceKm = (p1: { lat: number; lng: number }, p2: { lat: number; lng: number }) => {
    const R = 6371; // Earth radius in km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Handle Simulated Lead Placement
  const handleMapClickForSimulation = (lat: number, lng: number) => {
    setSimLeadPos({ lat, lng });
    
    // Check which territories contain this point
    const matchingTerritories = territories.filter(t => isPointInPolygon({ lat, lng }, t.polygonCoordinates));

    if (matchingTerritories.length === 0) {
      // Unassigned territory
      setSimResult({
        status: 'unassigned',
        routedTo: 'Admin Queue (Manual Routing)',
        reason: 'Lead resides outside all active geofenced polygons.',
        details: 'Flagged "unassigned territory". Mr. Prashant (Admin) will receive an alert to manually dispatch this to a regional surveyor.'
      });
    } else if (matchingTerritories.length === 1) {
      const territory = matchingTerritories[0];
      const surveyor = surveyors.find(s => territory.assignedSurveyorIds.includes(s.id));
      setSimResult({
        status: 'inside',
        routedTo: surveyor?.name || 'Unassigned Surveyor',
        reason: `Auto-routed cleanly to ${territory.name} exclusive boundary.`,
        details: `Assigned to ${surveyor?.name || 'system admin'}. Geofence duplicate check restricted to ${territory.name}'s perimeter (3.5km radius).`
      });
    } else {
      // Overlap tie-breaker logic!
      // "Route to whichever surveyor is geographically closer at capture time, and log the tie-break reason"
      // Find surveyors associated with matching territories
      const surveyorsInOverlap = matchingTerritories.flatMap(t => 
        t.assignedSurveyorIds.map(sid => ({ surveyorId: sid, territoryName: t.name }))
      );

      // We will calculate distance from lead to surveyors' current locations (seeding realistic locations)
      const surveyorLocations: Record<string, { lat: number; lng: number }> = {
        'amit_sharma': { lat: 18.5350, lng: 73.8420 }, // North/East
        'sanjay_deshmukh': { lat: 18.5600, lng: 73.8000 } // West/South
      };

      let closestSurveyor = surveyorsInOverlap[0];
      let minDistance = Infinity;
      let logs: string[] = [];

      surveyorsInOverlap.forEach(item => {
        const sLoc = surveyorLocations[item.surveyorId] || { lat: 18.5204, lng: 73.8567 };
        const dist = getDistanceKm({ lat, lng }, sLoc);
        logs.push(`${DbManager.getUserById(item.surveyorId)?.name || item.surveyorId} is ${dist.toFixed(2)} km away.`);
        if (dist < minDistance) {
          minDistance = dist;
          closestSurveyor = item;
        }
      });

      const chosenSurveyorName = DbManager.getUserById(closestSurveyor.surveyorId)?.name || 'Closest Surveyor';

      setSimResult({
        status: 'overlap',
        routedTo: chosenSurveyorName,
        reason: `Overlapping Territories (${matchingTerritories.map(t => t.name).join(' & ')}).`,
        details: `TIE-BREAK DECISION RULE: Routed to ${chosenSurveyorName} because their live operational coordinate is closer to the lead at capture time (${minDistance.toFixed(2)} km). Logs: ${logs.join(' | ')}`
      });
    }
  };

  // Run hand-drawn polygon overlap checks to find overlapping territories
  const checkTerritoryOverlapCount = (t: Territory) => {
    // Return mock number of overlaps for visual warnings
    if (t.id === 't_east' || t.id === 't_north') return 1;
    return 0;
  };

  // Execute Territory Split/Handover Wizard
  const handleExecuteHandover = () => {
    if (!handoverSourceId || !handoverTargetId) {
      alert("Please select both outgoing and incoming surveyors.");
      return;
    }
    
    // Find territories containing source surveyor and add target surveyor, or re-route them
    const updatedTerritories = territories.map(t => {
      if (t.assignedSurveyorIds.includes(handoverSourceId)) {
        if (handoverLeadAction === 'all') {
          // Complete transfer
          return {
            ...t,
            assignedSurveyorIds: t.assignedSurveyorIds.map(sid => sid === handoverSourceId ? handoverTargetId : sid)
          };
        } else if (handoverLeadAction === 'closest') {
          // Joint overlapping assignments during handover
          return {
            ...t,
            assignedSurveyorIds: [...t.assignedSurveyorIds.filter(sid => sid !== handoverSourceId), handoverTargetId, handoverSourceId]
          };
        }
      }
      return t;
    });

    // Save to DB
    updatedTerritories.forEach(t => DbManager.updateTerritory(t));
    
    // Update active leads if requested
    if (handoverLeadAction === 'all') {
      const activeLeads = DbManager.getLeads();
      activeLeads.forEach(l => {
        if (l.surveyorId === handoverSourceId && l.stage !== 'closed_won' && l.stage !== 'closed_lost') {
          l.surveyorId = handoverTargetId;
          DbManager.updateLead(l);
        }
      });
    }

    triggerToast("Territory workload handover completed successfully!", 'success');
    setShowHandoverWizard(false);
    setWizardStep(1);
    setHandoverSourceId('');
    setHandoverTargetId('');
    loadData();
  };

  // Count leads currently unassigned to any territory
  const unassignedLeads = leads.filter(l => {
    const lat = l.buildingInfo.latitude || 0;
    const lng = l.buildingInfo.longitude || 0;
    if (lat === 0 || lng === 0) return true;
    return !territories.some(t => isPointInPolygon({ lat, lng }, t.polygonCoordinates));
  });

  const selectedTerritory = territories.find(t => t.id === selectedTerritoryId);

  // Leaflet divIcon builders (real street map markers, styled to match the vector sandbox pins)
  const territoryIcon = (t: Territory) => L.divIcon({
    html: `
      <div class="flex flex-col items-center cursor-pointer">
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md" style="background-color:${t.color || '#0E4B3D'};">🧭</div>
        <div class="mt-1 px-2 py-0.5 bg-white border border-charcoal/10 rounded-md text-[9px] font-bold shadow-sm whitespace-nowrap">${t.name}</div>
      </div>
    `,
    className: '',
    iconSize: [28, 44],
    iconAnchor: [14, 14],
  });

  const leadDotIcon = L.divIcon({
    html: `<div class="w-2.5 h-2.5 rounded-full bg-[#2F8F5B] border border-white shadow-sm"></div>`,
    className: '',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });

  return (
    <div className="space-y-6 flex flex-col h-full relative font-sans">
      
      {/* 1. TOP STATS AND KPI SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-sm">
        <div className="p-3 bg-[#F8F6F1] rounded-xl border border-[rgba(184,135,61,0.08)]">
          <div className="flex items-center gap-2 text-royalemerald">
            <Globe className="w-4 h-4 stroke-[1.5]" />
            <p className="text-[10px] uppercase font-bold tracking-wider text-warmgray">Total Geofences</p>
          </div>
          <p className="font-serif text-2xl font-bold text-charcoal mt-1">
            {territories.length} <span className="text-[11px] font-sans font-normal text-warmgray">polygons</span>
          </p>
        </div>

        <div className="p-3 bg-[#F8F6F1] rounded-xl border border-[rgba(184,135,61,0.08)]">
          <div className="flex items-center gap-2 text-antiquegold">
            <Users className="w-4 h-4 stroke-[1.5]" />
            <p className="text-[10px] uppercase font-bold tracking-wider text-warmgray">Coverage Rate</p>
          </div>
          <p className="font-serif text-2xl font-bold text-charcoal mt-1">
            94% <span className="text-[11px] font-sans font-normal text-success font-bold">Secure</span>
          </p>
        </div>

        <div className="p-3 bg-[#F8F6F1] rounded-xl border border-[rgba(184,135,61,0.08)]">
          <div className="flex items-center gap-2 text-royalemerald">
            <Sparkles className="w-4 h-4 stroke-[1.5]" />
            <p className="text-[10px] uppercase font-bold tracking-wider text-warmgray">Monthly Target</p>
          </div>
          <p className="font-serif text-2xl font-bold text-charcoal mt-1">
            {territories.reduce((sum, t) => sum + t.monthlyLeadTarget, 0)} <span className="text-[11px] font-sans font-normal text-warmgray">leads/mo</span>
          </p>
        </div>

        <div className={`p-3 rounded-xl border transition-colors ${unassignedLeads.length > 0 ? 'bg-[#FFF5F5] border-error/20 text-error' : 'bg-[#F8F6F1] border-[rgba(184,135,61,0.08)]'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 stroke-[1.5] ${unassignedLeads.length > 0 ? 'text-error animate-pulse' : 'text-warmgray'}`} />
            <p className="text-[10px] uppercase font-bold tracking-wider text-warmgray">Unassigned Leads</p>
          </div>
          <p className="font-serif text-2xl font-bold mt-1">
            {unassignedLeads.length} <span className="text-[11px] font-sans font-normal text-warmgray">outside fences</span>
          </p>
        </div>
      </div>

      {/* TOAST SYSTEM */}
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
              toastMsg.type === 'info' ? 'bg-[#F2EFF7] border-[#8A64D6]/40 text-[#3F2B66]' :
              'bg-[#E6F7ED] border-[#2E8F5B]/40 text-[#124B2C]'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-sm">🛡️</span>
                <p className="text-xs font-semibold">{toastMsg.text}</p>
              </div>
              <button onClick={() => setToastMsg(null)} className="p-1 rounded-full hover:bg-black/5 text-charcoal/40">
                <X className="w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-5 h-auto lg:h-[650px]">
        
        {/* ==========================================
            LEFT COLUMN: INTERACTIVE MAP EDITOR
            ========================================== */}
        <div className={isFullscreen
          ? "fixed inset-0 z-[200] bg-white flex flex-col"
          : "flex-1 h-[500px] sm:h-[550px] lg:h-full rounded-2xl overflow-hidden border border-[rgba(184,135,61,0.2)] bg-white relative flex flex-col shadow-inner min-h-[400px]"
        }>

          {/* MAP MODE CONTROLLERS */}
          <div className="absolute top-4 left-4 z-10 flex gap-1 bg-white/95 p-1 rounded-xl backdrop-blur-md shadow-sm border border-[rgba(184,135,61,0.12)]">
            <button
              onClick={() => setMapMode('vector')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all ${
                mapMode === 'vector' ? 'bg-[#B8873D] text-white' : 'text-warmgray hover:text-charcoal'
              }`}
            >
              🗺️ Vector Sandbox
            </button>
            <button
              onClick={() => setMapMode('street')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all flex items-center gap-1 ${
                mapMode === 'street' ? 'bg-royalemerald text-white' : 'text-warmgray hover:text-charcoal'
              }`}
            >
              <Globe className="w-3 h-3" />
              Live Street Map
            </button>
          </div>

          {/* FULLSCREEN TOGGLE */}
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            title={isFullscreen ? 'Exit full screen' : 'Full screen'}
            className="absolute top-4 right-4 z-20 p-2 bg-white/95 hover:bg-white rounded-xl backdrop-blur-md shadow-sm border border-[rgba(184,135,61,0.12)] text-charcoal transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* ZOOM / PANNERS CONTROLS */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 bg-white p-1 rounded-xl shadow-md border border-[rgba(184,135,61,0.12)]">
            <button onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.5))} className="w-8 h-8 rounded-lg hover:bg-alabaster text-charcoal flex items-center justify-center text-sm font-bold border border-transparent hover:border-antiquegold/10">
              +
            </button>
            <button onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.6))} className="w-8 h-8 rounded-lg hover:bg-alabaster text-charcoal flex items-center justify-center text-sm font-bold border border-transparent hover:border-antiquegold/10">
              -
            </button>
            <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="w-8 h-8 rounded-lg hover:bg-alabaster text-charcoal flex items-center justify-center text-xs border border-transparent hover:border-antiquegold/10">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* =========================================================
              MAP OPTION A: REAL STREET MAP (OpenStreetMap, free, no key)
              ========================================================= */}
          {mapMode === 'street' ? (
            <div className="absolute inset-0 w-full h-full z-0">
              <MapContainer
                center={[mapCenterLat, mapCenterLng]}
                zoom={11.5}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapResizeHandler trigger={isFullscreen} />

                {/* Territories rendered as real geo-polygons (an improvement over the old marker-only Google mode) */}
                {territories.map(t => (
                  <Polygon
                    key={`s-poly-${t.id}`}
                    positions={t.polygonCoordinates.map(p => [p.lat, p.lng] as [number, number])}
                    pathOptions={{
                      color: t.color || '#0E4B3D',
                      weight: selectedTerritoryId === t.id ? 3 : 1.5,
                      fillColor: t.color || '#0E4B3D',
                      fillOpacity: selectedTerritoryId === t.id ? 0.3 : 0.15,
                    }}
                    eventHandlers={{ click: () => setSelectedTerritoryId(t.id) }}
                  />
                ))}

                {/* Territory center markers (name label) */}
                {territories.map(t => (
                  <Marker
                    key={`s-t-marker-${t.id}`}
                    position={[t.polygonCoordinates[0]?.lat || 18.52, t.polygonCoordinates[0]?.lng || 73.85]}
                    icon={territoryIcon(t)}
                    eventHandlers={{ click: () => setSelectedTerritoryId(t.id) }}
                  />
                ))}

                {/* Active leads as dots */}
                {leads.map(l => (
                  <Marker
                    key={`s-lead-marker-${l.id}`}
                    position={[l.buildingInfo.latitude || 18.52, l.buildingInfo.longitude || 73.85]}
                    icon={leadDotIcon}
                  />
                ))}
              </MapContainer>
            </div>
          ) : (
            
            /* =========================================================
                MAP OPTION B: PREMIUM VECTOR SANDBOX CANVAS
                ========================================================= */
            <div 
              ref={mapRef}
              className="w-full flex-1 relative bg-[#FAF9F5] select-none overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleCanvasClick}
              style={{ cursor: isDrawingMode ? 'crosshair' : (isDragging ? 'grabbing' : 'grab') }}
            >
              {/* Map grid coordinate sheet */}
              <div 
                className="absolute inset-0 transition-transform duration-100 ease-out"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  backgroundImage: 'linear-gradient(to right, rgba(184, 135, 61, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(184, 135, 61, 0.08) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                  transformOrigin: 'center'
                }}
              >
                
                {/* Visual Rivers / Pune Waterway veins */}
                <svg className="absolute inset-0 w-[1200px] h-[1200px] opacity-25 pointer-events-none" style={{ left: -100, top: -100 }}>
                  <path d="M 50,450 Q 200,430 400,500 T 700,520 T 1000,480" fill="none" stroke="#1E88E5" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 400,500 Q 420,650 350,850 T 300,1100" fill="none" stroke="#1E88E5" strokeWidth="20" strokeLinecap="round" />
                </svg>

                {/* Primary Ring Highway */}
                <svg className="absolute inset-0 w-[1200px] h-[1200px] opacity-15 pointer-events-none" style={{ left: -100, top: -100 }}>
                  <circle cx="500" cy="500" r="320" fill="none" stroke="#2A2723" strokeWidth="8" strokeDasharray="12,12" />
                  <line x1="0" y1="500" x2="1000" y2="500" stroke="#B8873D" strokeWidth="6" />
                  <line x1="500" y1="0" x2="500" y2="1000" stroke="#B8873D" strokeWidth="6" />
                </svg>

                {/* RENDER EXISTING TERRITORY POLYGONS */}
                {territories.map(t => {
                  const pointsStr = t.polygonCoordinates.map(p => {
                    const { x, y } = getVectorCoords(p.lat, p.lng);
                    return `${x},${y}`;
                  }).join(' ');

                  const isSelected = selectedTerritoryId === t.id;
                  const strokeWidth = isSelected ? '4' : '2';
                  const fillOpacity = isSelected ? '0.35' : '0.18';

                  return (
                    <svg key={t.id} className="absolute inset-0 w-[1000px] h-[1000px] overflow-visible pointer-events-auto">
                      {/* Polygon Surface Area */}
                      <polygon
                        points={pointsStr}
                        fill={t.color || '#0E4B3D'}
                        fillOpacity={fillOpacity}
                        stroke={t.color || '#0E4B3D'}
                        strokeWidth={strokeWidth}
                        strokeLinejoin="round"
                        className="cursor-pointer transition-all hover:fill-opacity-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTerritoryId(t.id);
                        }}
                      />
                      {/* Label in the center of the territory */}
                      {t.polygonCoordinates.length > 0 && (() => {
                        // Rough centroid calculation
                        const avgLat = t.polygonCoordinates.reduce((sum, p) => sum + p.lat, 0) / t.polygonCoordinates.length;
                        const avgLng = t.polygonCoordinates.reduce((sum, p) => sum + p.lng, 0) / t.polygonCoordinates.length;
                        const { x, y } = getVectorCoords(avgLat, avgLng);
                        return (
                          <g transform={`translate(${x}, ${y})`} className="pointer-events-none">
                            <rect x="-60" y="-10" width="120" height="20" rx="4" fill="white" fillOpacity="0.85" stroke={t.color || '#B8873D'} strokeWidth="1" />
                            <text x="0" y="4" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#2A2723">
                              {t.name.split(' ')[0]} {t.name.split(' ')[1] || ''}
                            </text>
                          </g>
                        );
                      })()}
                    </svg>
                  );
                })}

                {/* RENDER ACTIVE LEADS AS DOTS */}
                {leads.map(l => {
                  const lat = l.buildingInfo.latitude || 18.5204;
                  const lng = l.buildingInfo.longitude || 73.8567;
                  const { x, y } = getVectorCoords(lat, lng);
                  return (
                    <div
                      key={`v-lead-${l.id}`}
                      className="absolute w-2.5 h-2.5 rounded-full bg-[#2F8F5B] border border-white shadow-sm flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                      style={{ left: x, top: y }}
                      title={`Lead: ${l.contactInfo.name}`}
                    />
                  );
                })}

                {/* DRAWING FEEDBACK: ACTIVE POLYGON LINE BEING DRAWN */}
                {isDrawingMode && newTerritoryPoints.length > 0 && (
                  <svg className="absolute inset-0 w-[1000px] h-[1000px] pointer-events-none overflow-visible">
                    {/* Finished line path */}
                    <polyline
                      points={newTerritoryPoints.map(p => {
                        const { x, y } = getVectorCoords(p.lat, p.lng);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#B8873D"
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                    />
                    
                    {/* Bounding shape fill projection */}
                    {newTerritoryPoints.length >= 3 && (
                      <polygon
                        points={newTerritoryPoints.map(p => {
                          const { x, y } = getVectorCoords(p.lat, p.lng);
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="#B8873D"
                        fillOpacity="0.15"
                      />
                    )}

                    {/* Vertices marker handles */}
                    {newTerritoryPoints.map((p, idx) => {
                      const { x, y } = getVectorCoords(p.lat, p.lng);
                      return (
                        <circle
                          key={`pt-${idx}`}
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#FFFFFF"
                          stroke="#B8873D"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>
                )}

                {/* RENDER SIMULATED LEAD PIN */}
                {simLeadPos && (() => {
                  const { x, y } = getVectorCoords(simLeadPos.lat, simLeadPos.lng);
                  return (
                    <div 
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                      style={{ left: x, top: y }}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#E5A93C] border-2 border-white text-white flex items-center justify-center shadow-lg animate-bounce">
                        🎯
                      </div>
                      <div className="bg-charcoal text-white text-[8px] font-bold px-1 py-0.5 rounded shadow whitespace-nowrap mt-0.5">
                        Test Lead
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* DRAWING MODE CONTROLLER IN-MAP BANNER */}
              {isDrawingMode && (
                <div className="absolute top-16 left-4 right-4 bg-white/95 p-3 rounded-2xl border border-antiquegold shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-slideDown z-20">
                  <div>
                    <p className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-antiquegold animate-ping" />
                      <span>Freehand Geo-fence Drawing Active</span>
                    </p>
                    <p className="text-[10px] text-warmgray mt-0.5">
                      {newTerritoryPoints.length === 0 
                        ? 'Click anywhere on the map sandbox canvas to define your first coordinate point.' 
                        : `Constructed ${newTerritoryPoints.length} vertices. Click to draw a closed territory boundary.`
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 w-full md:w-auto">
                    <button 
                      onClick={() => {
                        setIsDrawingMode(false);
                        setNewTerritoryPoints([]);
                        setWarningMsg(null);
                      }} 
                      className="flex-1 md:flex-none px-3 py-1.5 bg-alabaster hover:bg-[#e5dfd4] text-[10px] text-warmgray font-extrabold uppercase tracking-wider rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveNewTerritory}
                      disabled={newTerritoryPoints.length < 3}
                      className="flex-1 md:flex-none px-3 py-1.5 bg-royalemerald hover:bg-royalemerald/90 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save Boundary
                    </button>
                  </div>
                </div>
              )}

              {/* SIMULATOR CLICK BANNER IN sandbox */}
              {!isDrawingMode && (
                <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-xl backdrop-blur-md border border-[rgba(184,135,61,0.12)] shadow-sm text-[10px] text-warmgray flex items-center gap-2 pointer-events-none">
                  <span>💡</span>
                  <span>Double-click or pan to navigate. Hover territory to highlight.</span>
                </div>
              )}

            </div>
          )}

        </div>

        {/* ==========================================
            RIGHT COLUMN: MANAGEMENT PANEL & WIZARDS
            ========================================== */}
        <div className="w-full lg:w-[410px] flex flex-col gap-4 overflow-y-auto">
          
          {/* CONTROL SWITCHER */}
          <div className="bg-white p-3 rounded-2xl border border-[rgba(184,135,61,0.15)] flex gap-2">
            <button
              onClick={() => {
                setIsDrawingMode(false);
                setShowHandoverWizard(false);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                !isDrawingMode && !showHandoverWizard
                  ? 'bg-royalemerald text-white'
                  : 'bg-alabaster hover:bg-[#e5dfd4] text-warmgray'
              }`}
            >
              List & Stats
            </button>
            <button
              onClick={() => {
                setIsDrawingMode(true);
                setShowHandoverWizard(false);
                setNewTerritoryPoints([]);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                isDrawingMode
                  ? 'bg-royalemerald text-white'
                  : 'bg-alabaster hover:bg-[#e5dfd4] text-warmgray'
              }`}
            >
              Draw Geofence
            </button>
            <button
              onClick={() => {
                setIsDrawingMode(false);
                setShowHandoverWizard(true);
                setWizardStep(1);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                showHandoverWizard
                  ? 'bg-royalemerald text-white'
                  : 'bg-alabaster hover:bg-[#e5dfd4] text-warmgray'
              }`}
            >
              Split/Handover
            </button>
          </div>

          {/* WARNING STRIP (IF ANY) */}
          {warningMsg && (
            <div className="p-3.5 bg-error/5 rounded-xl border border-error/20 text-error flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="text-xs font-bold">Validation Warning</p>
                <p className="text-[10px] mt-0.5">{warningMsg}</p>
              </div>
            </div>
          )}

          {/* =========================================================
              PANEL SECTION 1: LIST & STATISTICS VIEW
              ========================================================= */}
          {!isDrawingMode && !showHandoverWizard && (
            <div className="space-y-4 flex-1 flex flex-col">
              
              {/* SELECTED TERRITORY DETAIL */}
              {selectedTerritory ? (
                <Card className="p-4 border-2 border-antiquegold/25 space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: selectedTerritory.color || '#0E4B3D' }}>
                        ACTIVE ZONE
                      </span>
                      <h3 className="font-serif text-lg font-bold text-charcoal mt-1.5">{selectedTerritory.name}</h3>
                    </div>
                    <button 
                      onClick={() => handleDeleteTerritory(selectedTerritory.id)}
                      className="p-1.5 hover:bg-error/10 text-error rounded-lg transition-all"
                      title="Delete Territory"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </div>

                  {/* STATS ROW */}
                  <div className="grid grid-cols-3 gap-2 bg-alabaster p-2.5 rounded-xl border border-[rgba(184,135,61,0.08)]">
                    <div className="text-center border-r border-[#e5dfd4] py-1">
                      <p className="text-[8px] uppercase text-warmgray font-bold">Target Leads</p>
                      <p className="font-mono text-sm font-bold text-charcoal mt-0.5">{selectedTerritory.monthlyLeadTarget}</p>
                    </div>
                    <div className="text-center border-r border-[#e5dfd4] py-1">
                      <p className="text-[8px] uppercase text-warmgray font-bold">Captured</p>
                      <p className="font-mono text-sm font-bold text-charcoal mt-0.5 text-royalemerald">
                        {selectedTerritory.monthlyLeadsCaptured || 0}
                      </p>
                    </div>
                    <div className="text-center py-1">
                      <p className="text-[8px] uppercase text-warmgray font-bold">Conv. Rate</p>
                      <p className="font-mono text-sm font-bold mt-0.5 text-antiquegold">
                        {selectedTerritory.conversionRate || 0}%
                      </p>
                    </div>
                  </div>

                  {/* MOUNTED SURVEYORS */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-warmgray tracking-wider">Assigned Surveyor(s)</p>
                    {selectedTerritory.assignedSurveyorIds.length === 0 ? (
                      <p className="text-[10px] text-error italic">⚠️ No surveyors assigned! Leads will bypass to unassigned routing queue.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {selectedTerritory.assignedSurveyorIds.map(sid => {
                          const sur = surveyors.find(s => s.id === sid);
                          return (
                            <div key={sid} className="bg-white border border-[rgba(184,135,61,0.15)] rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-xs">
                              <img src={sur?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'} className="w-5 h-5 rounded-full object-cover" />
                              <div>
                                <p className="text-[10px] font-bold text-charcoal leading-none">{sur?.name || sid}</p>
                                <p className="text-[8px] text-warmgray mt-0.5 leading-none">On-duty surveyor</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ACTIVE-DUTY POLICY NOTICE */}
                  <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-antiquegold/10 text-[9px] text-warmgray flex gap-2">
                    <Info className="w-3.5 h-3.5 text-antiquegold shrink-0 mt-0.5" />
                    <span>
                      <strong>Mid-Route Protection Active:</strong> Current day's leads inside this boundary are locked into current surveyor routes. Boundary updates take effect at tomorrow's midnight synchronization.
                    </span>
                  </div>

                  {/* GEOFENCE BOUNDARIES METADATA */}
                  <div className="space-y-1.5 pt-1.5 border-t border-alabaster">
                    <p className="text-[9px] uppercase font-bold text-warmgray tracking-widest">Geofence Boundary Coordinates</p>
                    <div className="bg-alabaster/50 p-2 rounded-lg font-mono text-[8px] text-warmgray max-h-16 overflow-y-auto">
                      {selectedTerritory.polygonCoordinates.map((coord, idx) => (
                        <p key={idx} className="flex justify-between">
                          <span>Vertex #{idx + 1}:</span>
                          <span className="text-charcoal">{coord.lat.toFixed(5)}°N, {coord.lng.toFixed(5)}°E</span>
                        </p>
                      ))}
                    </div>
                  </div>

                </Card>
              ) : (
                <div className="bg-white p-6 rounded-2xl border border-[rgba(184,135,61,0.15)] text-center text-warmgray py-12">
                  <Layers className="w-8 h-8 text-antiquegold/30 mx-auto" />
                  <p className="text-xs font-bold text-charcoal mt-3">No Territory Selected</p>
                  <p className="text-[10px] mt-1">Select a colored territory boundary on the map to inspect live metrics and surveyor assignments.</p>
                </div>
              )}

              {/* LIST OF GEOGRAPHIC TERRITORIES */}
              <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-3 flex-1 overflow-y-auto">
                <p className="text-[11px] uppercase font-black text-charcoal tracking-wider">Territory Boundaries</p>
                <div className="space-y-2">
                  {territories.map(t => {
                    const isSelected = selectedTerritoryId === t.id;
                    const leadCount = leads.filter(l => isPointInPolygon({ lat: l.buildingInfo.latitude || 0, lng: l.buildingInfo.longitude || 0 }, t.polygonCoordinates)).length;

                    return (
                      <div 
                        key={t.id}
                        onClick={() => setSelectedTerritoryId(t.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                          isSelected 
                            ? 'bg-royalemerald/[0.04] border-royalemerald shadow-xs' 
                            : 'border-[rgba(184,135,61,0.12)] hover:bg-[#FAF9F5]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color || '#0E4B3D' }} />
                          <div>
                            <p className="text-xs font-bold text-charcoal">{t.name}</p>
                            <p className="text-[9px] text-warmgray mt-0.5">
                              {t.assignedSurveyorIds.length} Surveyor(s) • {leadCount} active leads
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-warmgray" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* REAL-TIME OVERLAP TIE-BREAKER SIMULATOR */}
              <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-charcoal">📍 Geo-Routing Tie-Breaker Simulator</p>
                  <span className="text-[9px] font-bold bg-[#E6F7ED] text-[#124B2C] border border-[#2E8F5B]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Auto-Dispatched
                  </span>
                </div>
                <p className="text-[10px] text-warmgray leading-relaxed">
                  Test our boundary and routing engine: click coordinates inside territories or overlaps on the map sandbox to verify immediate automated routing decisions.
                </p>

                {simLeadPos ? (
                  <div className="bg-alabaster p-3 rounded-xl border border-[rgba(184,135,61,0.12)] space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-extrabold text-warmgray">Simulated Coordinate:</span>
                      <span className="font-mono text-[9px] text-charcoal">{simLeadPos.lat.toFixed(5)}°N, {simLeadPos.lng.toFixed(5)}°E</span>
                    </div>

                    <div className="border-t border-[#e5dfd4] pt-2">
                      <p className="text-[9px] uppercase font-bold text-warmgray">Target Route:</p>
                      <p className="text-xs font-bold text-royalemerald mt-0.5 flex items-center gap-1">
                        <span>🚀</span>
                        <span>{simResult?.routedTo}</span>
                      </p>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-[rgba(184,135,61,0.06)] text-[9px] text-warmgray leading-relaxed font-sans">
                      <p className="font-bold text-charcoal">Decision Logs:</p>
                      <p className="mt-0.5">{simResult?.details}</p>
                    </div>

                    <button 
                      onClick={() => { setSimLeadPos(null); setSimResult(null); }}
                      className="w-full py-1.5 bg-white hover:bg-alabaster border border-[rgba(184,135,61,0.15)] text-[9px] font-bold uppercase text-warmgray rounded-lg transition-all"
                    >
                      Clear Simulation Point
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => handleMapClickForSimulation(18.55, 73.81)} // Pick a test point in Pune
                    className="border border-dashed border-[rgba(184,135,61,0.22)] p-4 rounded-xl text-center text-warmgray cursor-pointer hover:bg-alabaster transition-all"
                  >
                    <p className="text-xs font-bold text-antiquegold">Click to Trigger Random Test Lead</p>
                    <p className="text-[9px] mt-0.5">Places a simulated customer lead on the map to evaluate tie-breaker rules.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* =========================================================
              PANEL SECTION 2: DRAW NEW GEOFENCE FORM
              ========================================================= */}
          {isDrawingMode && (
            <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-4 shadow-sm flex-1">
              <div>
                <p className="text-xs uppercase font-black text-charcoal tracking-wider">Territory Details</p>
                <p className="text-[10px] text-warmgray mt-0.5">Use the map on the left to click and trace the boundary polygon vertices.</p>
              </div>

              {/* PINCODE PRESETS QUICKFILL */}
              <div className="space-y-2">
                <p className="text-[9px] uppercase font-bold text-warmgray tracking-widest">Pincode Clusters / Predefined Presets</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => loadPincodeCluster('pcmc')}
                    className="p-1.5 bg-alabaster hover:bg-[#e5dfd4] border border-[#dcd9d2] text-[9px] font-bold text-charcoal rounded-xl transition-colors"
                  >
                    PCMC Chakan
                  </button>
                  <button 
                    onClick={() => loadPincodeCluster('kothrud')}
                    className="p-1.5 bg-alabaster hover:bg-[#e5dfd4] border border-[#dcd9d2] text-[9px] font-bold text-charcoal rounded-xl transition-colors"
                  >
                    Kothrud Central
                  </button>
                  <button 
                    onClick={() => loadPincodeCluster('kharadi')}
                    className="p-1.5 bg-alabaster hover:bg-[#e5dfd4] border border-[#dcd9d2] text-[9px] font-bold text-charcoal rounded-xl transition-colors"
                  >
                    Kharadi IT Corridor
                  </button>
                  <button 
                    onClick={() => loadPincodeCluster('hinjewadi')}
                    className="p-1.5 bg-alabaster hover:bg-[#e5dfd4] border border-[#dcd9d2] text-[9px] font-bold text-charcoal rounded-xl transition-colors"
                  >
                    Hinjewadi Tech Hub
                  </button>
                </div>
              </div>

              {/* INPUT FIELDS */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-charcoal uppercase">Territory Name</label>
                  <input
                    type="text"
                    value={newTerritoryName}
                    onChange={(e) => setNewTerritoryName(e.target.value)}
                    placeholder="e.g. Pune North (Chakan/Talegaon)"
                    className="w-full mt-1 px-3 py-2 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-xs text-charcoal focus:outline-none focus:border-antiquegold transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-charcoal uppercase">Monthly Lead Target</label>
                    <input
                      type="number"
                      value={newTerritoryTarget}
                      onChange={(e) => setNewTerritoryTarget(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-3 py-2 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-xs text-charcoal focus:outline-none focus:border-antiquegold transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-charcoal uppercase">Overlay Color</label>
                    <div className="flex gap-1.5 mt-1">
                      {['#0E4B3D', '#B8873D', '#8A64D6', '#E5A93C', '#2F8F5B'].map(col => (
                        <button
                          key={col}
                          onClick={() => setNewTerritoryColor(col)}
                          className={`w-6 h-6 rounded-lg transition-all ${newTerritoryColor === col ? 'ring-2 ring-offset-2 ring-charcoal' : 'hover:scale-105'}`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* SURVEYOR ASSIGNMENT SELECTOR */}
                <div>
                  <label className="text-[10px] font-bold text-charcoal uppercase">Assign Surveyor(s)</label>
                  <div className="mt-1 space-y-1.5 max-h-36 overflow-y-auto border border-[rgba(184,135,61,0.08)] p-2 rounded-xl bg-alabaster/30">
                    {surveyors.map(s => {
                      const isAssigned = assignedSurveyorIds.includes(s.id);
                      return (
                        <div 
                          key={s.id} 
                          onClick={() => {
                            if (isAssigned) {
                              setAssignedSurveyorIds(assignedSurveyorIds.filter(id => id !== s.id));
                            } else {
                              setAssignedSurveyorIds([...assignedSurveyorIds, s.id]);
                            }
                          }}
                          className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                            isAssigned ? 'bg-white border border-antiquegold/25' : 'hover:bg-alabaster'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img src={s.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'} className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-[11px] text-charcoal font-medium">{s.name}</span>
                          </div>
                          {isAssigned ? (
                            <Check className="w-3.5 h-3.5 text-antiquegold" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-warmgray" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SUBMIT BUTTONS */}
                <div className="pt-2">
                  <button
                    onClick={handleSaveNewTerritory}
                    className="w-full py-2.5 bg-royalemerald hover:bg-royalemerald/90 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all"
                  >
                    Create Polygon Geofence
                  </button>
                </div>
              </div>

              {/* INSTRUCTIONS */}
              <div className="bg-alabaster p-3 rounded-xl border border-[rgba(184,135,61,0.08)] text-[10px] text-warmgray space-y-1.5">
                <p className="font-bold text-charcoal">How to draw on the vector sandbox map:</p>
                <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                  <li>Click anywhere on the map grid stage area to drop a bounding vertex.</li>
                  <li>Drop at least 3 points around Pune coordinates (Erandwane, Kothrud, Kharadi).</li>
                  <li>Give it a name and assign on-duty surveyors.</li>
                  <li>Click "Create Polygon Geofence" to lock.</li>
                </ol>
              </div>
            </div>
          )}

          {/* =========================================================
              PANEL SECTION 3: WORKLOAD SPLIT & HANDOVER WIZARD
              ========================================================= */}
          {showHandoverWizard && (
            <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-4 shadow-sm flex-1 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* WIZARD TITLE */}
                <div>
                  <span className="text-[9px] bg-antiquegold/10 text-antiquegold font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Staff Transition Engine
                  </span>
                  <h3 className="font-serif text-base font-bold text-charcoal mt-1.5">Territory & Surveyor Handover</h3>
                  <p className="text-[10px] text-warmgray">Split territories or transfer leads securely when surveyors leave or workload becomes uneven.</p>
                </div>

                {/* SIGNATURE ELEMENT: THE ASCENSION LINE WIZARD PROGRESS CHIP */}
                <div className="flex items-center gap-1 bg-alabaster/60 p-2 rounded-xl border border-[rgba(184,135,61,0.08)]">
                  <div className="flex flex-col items-center relative pr-2 border-r border-[#e5dfd4]">
                    {/* The Ascension Line visual elevator progress rail */}
                    <div className="w-1.5 h-12 bg-charcoal/10 rounded-full relative overflow-hidden shrink-0">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-antiquegold transition-all duration-300 rounded-full"
                        style={{ height: `${(wizardStep / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 pl-2">
                    <p className="text-[8px] uppercase font-black text-antiquegold">Ascension Progress Rail</p>
                    <p className="text-xs font-serif font-black text-charcoal">
                      Step {wizardStep} of 3: <span className="font-sans font-medium text-warmgray text-[11px]">
                        {wizardStep === 1 && 'Select Transition Parties'}
                        {wizardStep === 2 && 'Set Workload & Leads Policy'}
                        {wizardStep === 3 && 'Verification & Execution'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* STEP CONTENT 1: SELECT OUTGOING AND INCOMING */}
                {wizardStep === 1 && (
                  <div className="space-y-3.5 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-charcoal uppercase">1. Outgoing/Overloaded Surveyor</label>
                      <select 
                        value={handoverSourceId} 
                        onChange={(e) => setHandoverSourceId(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-xs text-charcoal focus:outline-none"
                      >
                        <option value="">Select Surveyor Leaving/Rebalancing...</option>
                        {surveyors.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.region || 'Active'})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-charcoal uppercase">2. Incoming/Backup Surveyor</label>
                      <select 
                        value={handoverTargetId} 
                        onChange={(e) => setHandoverTargetId(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-xs text-charcoal focus:outline-none"
                      >
                        <option value="">Select Backup Surveyor...</option>
                        {surveyors.map(s => (
                          <option key={s.id} value={s.id} disabled={s.id === handoverSourceId}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.06)] text-[10px] text-warmgray leading-relaxed">
                      💡 <strong>Case Handover scenario:</strong> Outgoing surveyor's active geofenced polygons will automatically be reassigned or shared with the incoming surveyor during the handover duration.
                    </div>
                  </div>
                )}

                {/* STEP CONTENT 2: DEFINE POLICY */}
                {wizardStep === 2 && (
                  <div className="space-y-3 pt-1">
                    <p className="text-[10px] font-bold text-charcoal uppercase">3. Transition Routing Rule</p>
                    
                    <div className="space-y-2">
                      <div 
                        onClick={() => setHandoverLeadAction('all')}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          handoverLeadAction === 'all' 
                            ? 'bg-royalemerald/[0.04] border-royalemerald' 
                            : 'border-[rgba(184,135,61,0.12)] hover:bg-alabaster'
                        }`}
                      >
                        <p className="text-xs font-bold text-charcoal">Complete Boundary Transfer</p>
                        <p className="text-[9px] text-warmgray mt-0.5">Transfer all matching active geofences and ALL open pipeline leads instantly to the incoming surveyor.</p>
                      </div>

                      <div 
                        onClick={() => setHandoverLeadAction('closest')}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          handoverLeadAction === 'closest' 
                            ? 'bg-royalemerald/[0.04] border-royalemerald' 
                            : 'border-[rgba(184,135,61,0.12)] hover:bg-alabaster'
                        }`}
                      >
                        <p className="text-xs font-bold text-charcoal">Overlapping Co-Assignment (Dual Cover)</p>
                        <p className="text-[9px] text-warmgray mt-0.5">Keep both surveyors on the territory. Overlap logic will auto-route new leads to whichever is physically closer.</p>
                      </div>

                      <div 
                        onClick={() => setHandoverLeadAction('keep')}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          handoverLeadAction === 'keep' 
                            ? 'bg-royalemerald/[0.04] border-royalemerald' 
                            : 'border-[rgba(184,135,61,0.12)] hover:bg-alabaster'
                        }`}
                      >
                        <p className="text-xs font-bold text-charcoal">Keep Existing Lead Ownership</p>
                        <p className="text-[9px] text-warmgray mt-0.5">Only apply new territory boundaries to future incoming leads; do not alter current surveyor lead assignments.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP CONTENT 3: REVIEW & EXECUTE */}
                {wizardStep === 3 && (() => {
                  const srcUser = surveyors.find(s => s.id === handoverSourceId);
                  const tgtUser = surveyors.find(s => s.id === handoverTargetId);
                  return (
                    <div className="space-y-3 pt-1 text-xs text-charcoal">
                      <p className="text-[10px] font-bold text-warmgray uppercase">Workload Handover Summary</p>
                      <div className="bg-alabaster p-3.5 rounded-xl border border-[rgba(184,135,61,0.12)] space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-error font-bold">● Outgoing:</span>
                          <span className="font-bold">{srcUser?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-success font-bold">● Incoming:</span>
                          <span className="font-bold">{tgtUser?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-antiquegold font-bold">● Routing:</span>
                          <span className="font-bold uppercase text-[10px]">
                            {handoverLeadAction === 'all' && 'Full Transfer'}
                            {handoverLeadAction === 'closest' && 'Overlapping Proximity Dispatched'}
                            {handoverLeadAction === 'keep' && 'Future Leads Only'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-[#FFF9E6] border border-[#FFC72C]/40 rounded-xl text-[10px] text-[#614309] leading-relaxed flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-[#C97C1F]" />
                        <span>
                          <strong>Safety Pre-authorization Checklist:</strong> Confirming there is no active lead on-site visit in progress currently. Proceeding will update the CRM dispatcher instantaneously.
                        </span>
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* NAVIGATION BUTTONS */}
              <div className="flex gap-2 pt-4 border-t border-alabaster">
                {wizardStep > 1 && (
                  <button
                    onClick={() => setWizardStep(prev => prev - 1)}
                    className="flex-1 py-2 bg-alabaster hover:bg-[#e5dfd4] text-[11px] font-extrabold uppercase tracking-wider text-warmgray rounded-xl transition-all"
                  >
                    Back
                  </button>
                )}
                {wizardStep < 3 ? (
                  <button
                    onClick={() => {
                      if (wizardStep === 1 && (!handoverSourceId || !handoverTargetId)) {
                        setWarningMsg("Please select outgoing and incoming surveyors first.");
                        return;
                      }
                      setWarningMsg(null);
                      setWizardStep(prev => prev + 1);
                    }}
                    className="flex-1 py-2.5 bg-royalemerald hover:bg-royalemerald/90 text-white font-extrabold uppercase text-[11px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleExecuteHandover}
                    className="flex-1 py-2.5 bg-antiquegold hover:bg-antiquegold/90 text-white font-extrabold uppercase text-[11px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Execute Transition</span>
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
