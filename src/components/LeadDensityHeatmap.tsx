import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import {
  Flame, MapPin, TrendingUp, TrendingDown, Info, Calendar, Layers,
  Globe, Sparkles, CheckCircle2, Search, Filter, Database, ArrowRight,
  ChevronRight, RefreshCw, AlertCircle, Activity, LayoutDashboard
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { User, Lead, Deal } from '../types';
import { Card, Button } from './Common';

// Imperative Leaflet heat-layer bridge (leaflet.heat has no native react-leaflet component)
const HeatLayer: React.FC<{ points: [number, number, number][] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const heatLayer = (L as any).heatLayer(points, { radius: 30, blur: 22, maxZoom: 15 }).addTo(map);
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);
  return null;
};

interface HeatmapZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusKm: number; // For geographic area normalization
  color: string;
  monthlyLeadTarget: number;
  periodComparisonPct: number; // e.g. 14 for +14%
  isNew?: boolean; // Brand new, insufficient data state
  coverageStartDate?: string; // For pre-coverage edge case
}

export const LeadDensityHeatmap: React.FC<{
  user: User;
  apiKey?: string;
  hasValidKey?: boolean;
}> = ({ user }) => {
  // Database data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [surveyors, setSurveyors] = useState<User[]>([]);

  // Interactive controls
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>('pune_south');
  const [metricMode, setMetricMode] = useState<'leads' | 'deals'>('leads');
  const [dateRange, setDateRange] = useState<'30_days' | '90_days' | 'ytd' | '5_year'>('30_days');
  const [excludePreCoverage, setExcludePreCoverage] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulated Loading/Caching state for multi-year pre-aggregation
  const [isPreAggregating, setIsPreAggregating] = useState(false);
  const [isRefreshingBatch, setIsRefreshingBatch] = useState(false);
  const [batchSyncedTime, setBatchSyncedTime] = useState<string>('08:00 AM Today');

  // Map settings: 'street' uses free OpenStreetMap tiles (no key/billing needed)
  const [mapMode, setMapMode] = useState<'vector' | 'street'>('street');

  // Vector map panning/zoom state (Pune coordinate space)
  const [zoom, setZoom] = useState(1.1);
  const [pan, setPan] = useState({ x: -20, y: -40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Pune center coordinates
  const mapCenterLat = 18.5204;
  const mapCenterLng = 73.8567;
  const latScale = 9500;
  const lngScale = 9500;

  // Vector map projection helper
  const getVectorCoords = (lat: number, lng: number) => {
    const x = 500 + (lng - mapCenterLng) * lngScale;
    const y = 500 - (lat - mapCenterLat) * latScale;
    return { x, y };
  };

  // Static Defined Zones in Pune region
  const zones: HeatmapZone[] = [
    {
      id: 'pune_south',
      name: 'Pune South (Kothrud / Erandwane)',
      lat: 18.5090,
      lng: 73.8120,
      radiusKm: 2.5,
      color: '#B8873D', // Antique Gold
      monthlyLeadTarget: 40,
      periodComparisonPct: 14,
      coverageStartDate: '2025-01-01'
    },
    {
      id: 'pune_west',
      name: 'Pune West (Hinjewadi / Baner)',
      lat: 18.5850,
      lng: 73.7480,
      radiusKm: 3.2,
      color: '#0E4B3D', // Royal Emerald
      monthlyLeadTarget: 50,
      periodComparisonPct: 28,
      coverageStartDate: '2025-06-15'
    },
    {
      id: 'pune_north',
      name: 'Pune North (Chakan / PCMC)',
      lat: 18.6750,
      lng: 73.8450,
      radiusKm: 4.5,
      color: '#8A64D6', // Purple Accent
      monthlyLeadTarget: 35,
      periodComparisonPct: -6,
      coverageStartDate: '2025-03-10'
    },
    {
      id: 'pune_east',
      name: 'Pune East (Kharadi / Hadapsar)',
      lat: 18.5480,
      lng: 73.9350,
      radiusKm: 3.0,
      color: '#E5A93C', // Vibrant Yellow
      monthlyLeadTarget: 30,
      periodComparisonPct: 8,
      coverageStartDate: '2025-11-20'
    },
    {
      id: 'wagholi_ext',
      name: 'Wagholi Extension (New Zone)',
      lat: 18.5800,
      lng: 74.0150,
      radiusKm: 2.0,
      color: '#3B82F6', // Blue Accent (New territory)
      monthlyLeadTarget: 15,
      periodComparisonPct: 0,
      isNew: true,
      coverageStartDate: '2026-06-01' // Very recent
    }
  ];

  // Drag handlers for SVG Map
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

  // Initialize data
  useEffect(() => {
    loadData();
    // Listen for database updates
    const handleDbUpdate = () => loadData();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, []);

  const loadData = () => {
    setLeads(DbManager.getLeads());
    setDeals(DbManager.getDeals());
    setSurveyors(DbManager.getUsers().filter(u => u.role === 'surveyor'));
  };

  // Calculate Haversine distance between two points (in kilometers)
  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Check if a date lies within selected range
  const isDateInSelectedRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    if (dateRange === '30_days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return date >= thirtyDaysAgo;
    } else if (dateRange === '90_days') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);
      return date >= ninetyDaysAgo;
    } else if (dateRange === 'ytd') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return date >= startOfYear;
    } else if (dateRange === '5_year') {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(now.getFullYear() - 5);
      return date >= fiveYearsAgo;
    }
    return true;
  };

  // Exclude pre-coverage check
  const isEligibleForCoverage = (dateStr: string, zone: HeatmapZone) => {
    if (!excludePreCoverage || !zone.coverageStartDate) return true;
    const date = new Date(dateStr);
    const coverageStart = new Date(zone.coverageStartDate);
    return date >= coverageStart;
  };

  // Filter leads/deals dynamically for a specific zone
  const getZoneRecords = (zone: HeatmapZone) => {
    // Filter leads falling geographically within zone radius
    const zoneLeads = leads.filter(l => {
      const lat = l.buildingInfo.latitude || 0;
      const lng = l.buildingInfo.longitude || 0;
      if (lat === 0 || lng === 0) return false;
      
      const distance = getDistanceKm(zone.lat, zone.lng, lat, lng);
      const isInside = distance <= zone.radiusKm;
      const isWithinDate = isDateInSelectedRange(l.createdAt);
      const isCovered = isEligibleForCoverage(l.createdAt, zone);

      return isInside && isWithinDate && isCovered;
    });

    if (metricMode === 'leads') {
      return zoneLeads;
    } else {
      // Filter deals that correspond to those leads
      const leadIds = zoneLeads.map(l => l.id);
      return deals.filter(d => leadIds.includes(d.leadId));
    }
  };

  // Normalized Density Calculation (Count / Area Size in km2)
  const getZoneDensityMetric = (zone: HeatmapZone) => {
    const records = getZoneRecords(zone);
    const areaSqKm = Math.PI * Math.pow(zone.radiusKm, 2);
    const density = records.length / areaSqKm; // records per sq km
    return {
      count: records.length,
      density: Number(density.toFixed(2)),
      areaSqKm: Number(areaSqKm.toFixed(1))
    };
  };

  // Determine Heat Intensity level based on normalized density
  const getDensityLevel = (density: number, isNew?: boolean) => {
    if (isNew) return 'insufficient';
    if (density === 0) return 'none';
    if (density > 0.45) return 'critical';
    if (density > 0.2) return 'high';
    if (density > 0.05) return 'moderate';
    return 'low';
  };

  // Get Styling values for Heat Intensity
  const getIntensityStyle = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          fill: '#B23B3B', // Red warning
          stroke: '#B23B3B',
          glowColor: 'rgba(178, 59, 59, 0.55)',
          label: 'Critical Peak',
          colorClass: 'text-[#B23B3B]'
        };
      case 'high':
        return {
          fill: '#B8873D', // Antique Gold
          stroke: '#B8873D',
          glowColor: 'rgba(184, 135, 61, 0.45)',
          label: 'High Traction',
          colorClass: 'text-antiquegold'
        };
      case 'moderate':
        return {
          fill: '#E5A93C', // Amber
          stroke: '#E5A93C',
          glowColor: 'rgba(229, 169, 60, 0.3)',
          label: 'Moderate Activity',
          colorClass: 'text-[#E5A93C]'
        };
      case 'low':
        return {
          fill: '#0E4B3D', // Soft Emerald
          stroke: '#0E4B3D',
          glowColor: 'rgba(14, 75, 61, 0.15)',
          label: 'Low Traction',
          colorClass: 'text-royalemerald'
        };
      case 'insufficient':
        return {
          fill: '#3B82F6', // Blue blueprint
          stroke: '#3B82F6',
          glowColor: 'transparent',
          label: 'New Area (Insufficient Data)',
          colorClass: 'text-[#3B82F6]'
        };
      default:
        return {
          fill: '#6B7280',
          stroke: '#6B7280',
          glowColor: 'transparent',
          label: 'No Recorded Activity',
          colorClass: 'text-warmgray'
        };
    }
  };

  // Date picker handler with fake aggregation loader for multi-year
  const handleDateRangeChange = (range: '30_days' | '90_days' | 'ytd' | '5_year') => {
    if (range === '5_year') {
      setIsPreAggregating(true);
      setTimeout(() => {
        setIsPreAggregating(false);
        setDateRange(range);
      }, 1100);
    } else {
      setDateRange(range);
    }
  };

  // Manual Recalculation Trigger for daily batch representation
  const handleRefreshBatch = () => {
    setIsRefreshingBatch(true);
    setTimeout(() => {
      setIsRefreshingBatch(false);
      const now = new Date();
      setBatchSyncedTime(`${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Today`);
      loadData();
    }, 900);
  };

  const selectedZone = zones.find(z => z.id === selectedZoneId);
  const selectedZoneStats = selectedZone ? getZoneDensityMetric(selectedZone) : null;
  const selectedZoneLevel = selectedZone ? getDensityLevel(selectedZoneStats?.density || 0, selectedZone.isNew) : 'none';
  const selectedZoneStyle = getIntensityStyle(selectedZoneLevel);
  const selectedZoneRecords = selectedZone ? getZoneRecords(selectedZone) : [];

  // Filtered Drill List
  const filteredDrillRecords = selectedZoneRecords.filter(r => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    
    // Type checking
    if ('contactInfo' in r) {
      // It's a Lead
      return (
        r.contactInfo.name.toLowerCase().includes(query) ||
        r.buildingInfo.address.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
      );
    } else {
      // It's a Deal (match corresponding lead if possible)
      const linkedLead = leads.find(l => l.id === r.leadId);
      return (
        linkedLead?.contactInfo.name.toLowerCase().includes(query) ||
        linkedLead?.buildingInfo.address.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
      );
    }
  });

  // Real per-lead heat points for the leaflet.heat layer, weighted by recency within the selected range
  const heatPoints: [number, number, number][] = leads
    .filter(l => isDateInSelectedRange(l.createdAt))
    .map(l => [l.buildingInfo.latitude || 18.5204, l.buildingInfo.longitude || 73.8567, 0.6] as [number, number, number]);

  const zoneIcon = (z: HeatmapZone, count: number) => L.divIcon({
    html: `
      <div class="flex flex-col items-center cursor-pointer">
        <div class="px-2 py-0.5 bg-white border border-charcoal/10 rounded-md text-[9px] font-bold shadow-sm whitespace-nowrap">${z.name.split(' ')[0]} (${count})</div>
      </div>
    `,
    className: '',
    iconSize: [90, 20],
    iconAnchor: [45, -6],
  });

  return (
    <div className="space-y-6 flex flex-col h-full relative font-sans">

      {/* 1. TOP HEADER STRIP AND CONTROLLERS */}
      <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-charcoal flex items-center gap-2">
              <Flame className="w-5 h-5 text-antiquegold animate-pulse" />
              <span>Lead Density & Demand Heatmap</span>
            </h2>
            <p className="text-xs text-warmgray mt-0.5">
              Geographic volume normalized by zone size. Analytical system for regional expansion and surveyor dispatch.
            </p>
          </div>

          {/* Metric Toggle */}
          <div className="flex bg-[#F8F6F1] p-1 rounded-xl border border-[rgba(184,135,61,0.1)] shrink-0 self-stretch md:self-auto">
            <button
              onClick={() => setMetricMode('leads')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                metricMode === 'leads' 
                  ? 'bg-royalemerald text-white shadow-xs' 
                  : 'text-warmgray hover:text-charcoal'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Leads Captured</span>
            </button>
            <button
              onClick={() => setMetricMode('deals')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                metricMode === 'deals' 
                  ? 'bg-royalemerald text-white shadow-xs' 
                  : 'text-warmgray hover:text-charcoal'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Deals Closed</span>
            </button>
          </div>
        </div>

        {/* 2. DATE RANGES AND BATCH REFRESH */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-alabaster">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-warmgray tracking-widest flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-antiquegold" />
              Timeframe:
            </span>
            <div className="flex bg-alabaster p-0.5 rounded-lg border border-[rgba(184,135,61,0.08)] text-[11px]">
              {(['30_days', '90_days', 'ytd', '5_year'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${
                    dateRange === range 
                      ? 'bg-white text-charcoal shadow-xs' 
                      : 'text-warmgray hover:text-charcoal'
                  }`}
                >
                  {range === '30_days' && 'Last 30 Days'}
                  {range === '90_days' && 'Last 90 Days'}
                  {range === 'ytd' && 'Year to Date'}
                  {range === '5_year' && '5-Year (Historic)'}
                </button>
              ))}
            </div>

            {/* PRE-COVERAGE EXCLUSION SWITCH */}
            <label className="flex items-center gap-2 cursor-pointer bg-alabaster px-2.5 py-1 rounded-lg border border-[rgba(184,135,61,0.05)] text-[11px] font-bold text-warmgray select-none hover:text-charcoal transition-colors">
              <input
                type="checkbox"
                checked={excludePreCoverage}
                onChange={(e) => setExcludePreCoverage(e.target.value === 'true' || e.target.checked)}
                className="rounded border-warmgray text-royalemerald focus:ring-royalemerald"
              />
              <span>Exclude Pre-Coverage Periods</span>
            </label>
          </div>

          {/* BATCH STATUS */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] uppercase font-bold text-warmgray leading-none">Daily Batch Sync</p>
              <p className="text-[10px] text-royalemerald font-semibold mt-1 flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-royalemerald animate-pulse" />
                <span>Computed: {batchSyncedTime}</span>
              </p>
            </div>
            <button
              onClick={handleRefreshBatch}
              disabled={isRefreshingBatch}
              className="p-2 hover:bg-alabaster rounded-xl border border-[rgba(184,135,61,0.12)] text-warmgray hover:text-charcoal transition-all disabled:opacity-40"
              title="Recalculate Batch Aggregation"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingBatch ? 'animate-spin text-antiquegold' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* MULTI-YEAR PRE-AGGREGATION LOADER OVERLAY */}
      <AnimatePresence>
        {isPreAggregating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#F8F6F1]/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-antiquegold/10 border-t-antiquegold animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-royalemerald/10 border-b-royalemerald animate-spin duration-1000" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-serif text-base font-bold text-charcoal">Pre-aggregating Historic Logs</p>
              <p className="text-xs text-warmgray max-w-xs leading-relaxed">
                Aggregating 5-year spatial metrics across 8,400 elevator operations. Utilizing compiled query buffers for optimal speed.
              </p>
              <span className="inline-block bg-white border border-antiquegold/20 text-antiquegold text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full mt-2">
                ⚡ Cached Aggregation Buffer Active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. DUAL-COLUMN MAP AND ANALYTICS LISTS */}
      <div className="flex flex-col lg:flex-row gap-5 h-auto lg:h-[620px]">
        
        {/* ==========================================
            LEFT PANEL: THE MAP WITH HEAT OVERLAYS
            ========================================== */}
        <div className="flex-1 h-[500px] sm:h-[550px] lg:h-full rounded-2xl overflow-hidden border border-[rgba(184,135,61,0.2)] bg-white relative flex flex-col shadow-inner min-h-[400px]">
          
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

          {/* ZOOM CONTROLS */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 bg-white p-1 rounded-xl shadow-md border border-[rgba(184,135,61,0.12)]">
            <button onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.5))} className="w-8 h-8 rounded-lg hover:bg-alabaster text-charcoal flex items-center justify-center text-sm font-bold border border-transparent hover:border-antiquegold/10">
              +
            </button>
            <button onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.6))} className="w-8 h-8 rounded-lg hover:bg-alabaster text-charcoal flex items-center justify-center text-sm font-bold border border-transparent hover:border-antiquegold/10">
              -
            </button>
            <button onClick={() => { setZoom(1.1); setPan({ x: -20, y: -40 }); }} className="w-8 h-8 rounded-lg hover:bg-alabaster text-charcoal flex items-center justify-center text-xs border border-transparent hover:border-antiquegold/10">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* COLOR LEGEND BLOCK Overlay */}
          <div className="absolute top-4 right-4 z-10 bg-white/95 p-3 rounded-2xl shadow-md border border-[rgba(184,135,61,0.15)] space-y-2 text-[10px] backdrop-blur-xs max-w-[170px]">
            <p className="font-bold text-charcoal uppercase tracking-wide text-[9px] border-b border-alabaster pb-1">Normalized Density</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B23B3B] block shrink-0" />
                <span className="text-charcoal font-medium">Critical Peak (&gt;0.45/km²)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B8873D] block shrink-0" />
                <span className="text-charcoal font-medium">High Traction (0.2-0.45)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93C] block shrink-0" />
                <span className="text-charcoal font-medium">Moderate (0.05-0.2)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0E4B3D] block shrink-0" />
                <span className="text-charcoal font-medium">Low Traction (&lt;0.05)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block shrink-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 4px)' }} />
                <span className="text-charcoal font-medium">New Area (Awaiting)</span>
              </div>
            </div>
          </div>

          {/* MAP ENGINE RENDERERS */}
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

                {/* Real point-density heat layer (leaflet.heat) over actual lead coordinates */}
                <HeatLayer points={heatPoints} />

                {/* Zone selection circles + labels, scaled/colored by density */}
                {zones.map(z => {
                  const stats = getZoneDensityMetric(z);
                  const level = getDensityLevel(stats.density, z.isNew);
                  const style = getIntensityStyle(level);
                  const isSelected = selectedZoneId === z.id;

                  return (
                    <React.Fragment key={`s-zone-${z.id}`}>
                      <Circle
                        center={[z.lat, z.lng]}
                        radius={z.radiusKm * 1000}
                        pathOptions={{
                          color: style.fill,
                          weight: isSelected ? 3 : 1,
                          fillColor: style.fill,
                          fillOpacity: isSelected ? 0.25 : 0.12,
                          dashArray: z.isNew ? '4 4' : undefined,
                        }}
                        eventHandlers={{ click: () => setSelectedZoneId(z.id) }}
                      />
                      <Marker
                        position={[z.lat, z.lng]}
                        icon={zoneIcon(z, stats.count)}
                        eventHandlers={{ click: () => setSelectedZoneId(z.id) }}
                      />
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            </div>
          ) : (
            
            /* =========================================================
                SANDBOX VECTOR CANVAS WITH INTERACTIVE DENSITY RADIALS
                ========================================================= */
            <div 
              ref={mapRef}
              className="w-full flex-1 relative bg-[#FAF9F5] select-none overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
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
                
                {/* Visual Waterway veins */}
                <svg className="absolute inset-0 w-[1200px] h-[1200px] opacity-25 pointer-events-none" style={{ left: -100, top: -100 }}>
                  <path d="M 50,450 Q 200,430 400,500 T 700,520 T 1000,480" fill="none" stroke="#1E88E5" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 400,500 Q 420,650 350,850 T 300,1100" fill="none" stroke="#1E88E5" strokeWidth="20" strokeLinecap="round" />
                </svg>

                {/* Primary Ring Highways (Pune Bypass / Katraj-Dehu bypass) */}
                <svg className="absolute inset-0 w-[1200px] h-[1200px] opacity-15 pointer-events-none" style={{ left: -100, top: -100 }}>
                  <circle cx="500" cy="500" r="320" fill="none" stroke="#2A2723" strokeWidth="8" strokeDasharray="12,12" />
                  <line x1="0" y1="500" x2="1000" y2="500" stroke="#B8873D" strokeWidth="6" />
                  <line x1="500" y1="0" x2="500" y2="1000" stroke="#B8873D" strokeWidth="6" />
                </svg>

                {/* RENDER HEATMAP GLOWS AS RADIAL GRADIENTS */}
                {zones.map(z => {
                  const stats = getZoneDensityMetric(z);
                  const level = getDensityLevel(stats.density, z.isNew);
                  const style = getIntensityStyle(level);
                  const isSelected = selectedZoneId === z.id;
                  const { x, y } = getVectorCoords(z.lat, z.lng);
                  
                  // Radius multiplier to fit vector coordinate space
                  const pixelRadius = z.radiusKm * 28;

                  return (
                    <div 
                      key={`v-heat-glow-${z.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedZoneId(z.id);
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
                      style={{ 
                        left: x, 
                        top: y,
                        width: pixelRadius * 2,
                        height: pixelRadius * 2
                      }}
                    >
                      {/* Smooth SVG radial gradient heat hub */}
                      <svg className="w-full h-full overflow-visible">
                        <defs>
                          <radialGradient id={`grad-${z.id}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={style.fill} stopOpacity={isSelected ? 0.7 : 0.55} />
                            <stop offset="40%" stopColor={style.fill} stopOpacity={isSelected ? 0.45 : 0.3} />
                            <stop offset="100%" stopColor={style.fill} stopOpacity="0" />
                          </radialGradient>

                          {/* Pattern fill for New Zone with Insufficient Data */}
                          <pattern id="diagonal-hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                            <line x1="0" y1="0" x2="0" y2="10" stroke="#3B82F6" strokeWidth="2" strokeOpacity="0.4" />
                          </pattern>
                        </defs>

                        {z.isNew ? (
                          // Hatch pattern circle for new area with warning border
                          <circle 
                            cx={pixelRadius}
                            cy={pixelRadius}
                            r={pixelRadius}
                            fill="url(#diagonal-hatch)"
                            stroke="#3B82F6"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            className="transition-all hover:stroke-opacity-100 stroke-opacity-70"
                          />
                        ) : (
                          // Standard radial heat glow
                          <circle 
                            cx={pixelRadius}
                            cy={pixelRadius}
                            r={pixelRadius}
                            fill={`url(#grad-${z.id})`}
                            stroke={isSelected ? '#2A2723' : style.fill}
                            strokeWidth={isSelected ? 2 : 0}
                            strokeOpacity={0.4}
                          />
                        )}

                        {/* Centered target symbol */}
                        <circle 
                          cx={pixelRadius} 
                          cy={pixelRadius} 
                          r="4" 
                          fill={z.isNew ? '#3B82F6' : '#2A2723'} 
                          stroke="#FFFFFF" 
                          strokeWidth="1.5" 
                        />
                      </svg>

                      {/* Floating Indicator Label */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                        <span className="inline-block bg-white/95 px-2 py-0.5 rounded-lg border border-charcoal/10 font-bold text-[9px] text-charcoal shadow-xs whitespace-nowrap">
                          {z.name.split(' ')[0]} ({stats.count})
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* PLACED LEAD INDIVIDUAL PINS AS TINY METADATA REFERENCE */}
                {leads.map(l => {
                  const lat = l.buildingInfo.latitude || 18.5204;
                  const lng = l.buildingInfo.longitude || 73.8567;
                  const { x, y } = getVectorCoords(lat, lng);
                  return (
                    <div 
                      key={`tiny-lead-${l.id}`}
                      className="absolute w-1.5 h-1.5 rounded-full bg-charcoal border border-white pointer-events-none opacity-20 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: x, top: y }}
                    />
                  );
                })}

              </div>

              {/* FLOATING QUICK MAP TIPS */}
              <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-xl backdrop-blur-md border border-[rgba(184,135,61,0.12)] shadow-xs text-[10px] text-warmgray flex items-center gap-2 pointer-events-none">
                <span>💡</span>
                <span>Click heat zones to inspect local conversion rates & drill down.</span>
              </div>

            </div>
          )}

        </div>

        {/* ==========================================
            RIGHT PANEL: DRILL-DOWN & COMPARISONS
            ========================================== */}
        <div className="w-full lg:w-[410px] flex flex-col gap-4 overflow-y-auto">
          
          {/* ZONE SELECTION SUMMARY CARD */}
          {selectedZone ? (
            <Card className="p-4 border-2 border-antiquegold/25 space-y-4 shadow-xs relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-[0.03] pointer-events-none" style={{ backgroundColor: selectedZone.color }} />
              
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                    selectedZone.isNew 
                      ? 'bg-blue-50/80 border-blue-200 text-blue-600' 
                      : 'bg-alabaster border-antiquegold/25 text-antiquegold'
                  }`}>
                    {selectedZone.isNew ? 'New Coverage Expansion' : 'Active Tracked Zone'}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-charcoal mt-1.5 leading-snug">{selectedZone.name}</h3>
                </div>

                {/* Compare indicator */}
                {!selectedZone.isNew && (
                  <div className={`px-2 py-1 rounded-lg flex items-center gap-1 ${
                    selectedZone.periodComparisonPct >= 0 
                      ? 'bg-[#E6F7ED] text-[#124B2C] border border-[#2E8F5B]/10' 
                      : 'bg-[#FFF5F5] text-error border border-error/10'
                  }`}>
                    {selectedZone.periodComparisonPct >= 0 ? (
                      <TrendingUp className="w-3 h-3 stroke-[2]" />
                    ) : (
                      <TrendingDown className="w-3 h-3 stroke-[2]" />
                    )}
                    <span className="font-mono text-xs font-bold">
                      {selectedZone.periodComparisonPct >= 0 ? '+' : ''}{selectedZone.periodComparisonPct}%
                    </span>
                  </div>
                )}
              </div>

              {/* CORE METRICS ROW */}
              <div className="grid grid-cols-3 gap-2 bg-alabaster p-3 rounded-xl border border-[rgba(184,135,61,0.08)]">
                <div className="text-center border-r border-[#e5dfd4] py-1">
                  <p className="text-[8px] uppercase text-warmgray font-bold">Count ({metricMode})</p>
                  <p className="font-mono text-base font-bold text-charcoal mt-0.5">{selectedZoneStats?.count}</p>
                </div>
                <div className="text-center border-r border-[#e5dfd4] py-1">
                  <p className="text-[8px] uppercase text-warmgray font-bold">Zone Area</p>
                  <p className="font-mono text-xs font-bold text-charcoal mt-1">
                    {selectedZoneStats?.areaSqKm} <span className="text-[9px] font-sans font-normal text-warmgray">km²</span>
                  </p>
                </div>
                <div className="text-center py-1">
                  <p className="text-[8px] uppercase text-warmgray font-bold">Density Ratio</p>
                  <p className={`font-mono text-xs font-bold mt-1 ${selectedZoneStyle.colorClass}`}>
                    {selectedZone.isNew ? 'Awaiting' : `${selectedZoneStats?.density}/km²`}
                  </p>
                </div>
              </div>

              {/* SIGNATURE ELEMENT: "THE ASCENSION LINE" AStraction Milestone */}
              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-warmgray tracking-wider">
                  <span>Traction Ascension Milestone</span>
                  <span className={`font-bold ${selectedZoneStyle.colorClass}`}>{selectedZoneStyle.label}</span>
                </div>

                <div className="flex items-center gap-4 bg-alabaster/40 p-3 rounded-xl border border-[rgba(184,135,61,0.05)]">
                  {/* The Ascension Line elevator motif */}
                  <div className="relative w-2.5 h-20 bg-[#e5dfd4] rounded-full overflow-hidden shrink-0">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ 
                        height: 
                          selectedZoneLevel === 'critical' ? '100%' :
                          selectedZoneLevel === 'high' ? '75%' :
                          selectedZoneLevel === 'moderate' ? '50%' :
                          selectedZoneLevel === 'low' ? '25%' : '0%'
                      }}
                      transition={{ duration: 1 }}
                      className="absolute bottom-0 left-0 right-0 bg-antiquegold shadow-[0_0_10px_rgba(184,135,61,0.8)] rounded-full"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs text-charcoal">
                    <p className="font-semibold text-charcoal">
                      {selectedZoneLevel === 'critical' && '🔥 Extreme High Density: Regional backlog warning.'}
                      {selectedZoneLevel === 'high' && '📈 Steady Traction: Healthy surveyor pipeline.'}
                      {selectedZoneLevel === 'moderate' && '⚖️ Moderate Flow: Normal operations standard.'}
                      {selectedZoneLevel === 'low' && '🌱 Developing Zone: Under-represented demand.'}
                      {selectedZoneLevel === 'insufficient' && '📦 Pre-calibration Stage: Collecting baseline data.'}
                    </p>
                    <p className="text-[10px] text-warmgray leading-relaxed">
                      {selectedZone.isNew 
                        ? 'Recently active since June 2026. Data streams are being aggregated; no conversion metrics are verified.' 
                        : `Target target: ${selectedZone.monthlyLeadTarget} per month. Coverage is monitored starting from ${selectedZone.coverageStartDate}.`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* EDGE CASE BANNERS */}
              {selectedZone.isNew && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-blue-800 text-[11px] flex gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Statistically Limited:</strong> This territory has less than 45 days of live operational footprint. Real density is bypassed to prevent misleading heat colors.
                  </span>
                </div>
              )}

              {excludePreCoverage && selectedZone.coverageStartDate && (
                <div className="p-2.5 bg-alabaster/70 rounded-xl border border-antiquegold/10 text-[9px] text-warmgray flex gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-royalemerald shrink-0 mt-0.5" />
                  <span>
                    Excluded pre-coverage logs (Filters prior to {selectedZone.coverageStartDate} are ignored).
                  </span>
                </div>
              )}

            </Card>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-[rgba(184,135,61,0.15)] text-center text-warmgray py-12 shadow-sm">
              <Layers className="w-8 h-8 text-antiquegold/30 mx-auto" />
              <p className="text-xs font-bold text-charcoal mt-3">No Zone Selected</p>
              <p className="text-[10px] mt-1">Select a hot spot or click on the map boundaries to audit real regional conversion data.</p>
            </div>
          )}

          {/* =========================================================
              TAP-TO-DRILL: ACTIVE UNDERLYING REAL RECORDS
              ========================================================= */}
          <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] space-y-4 shadow-sm flex-1 flex flex-col overflow-hidden min-h-[300px]">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-sm font-bold text-charcoal">
                  Drill Down: {selectedZone ? selectedZone.name.split(' ')[0] : 'Pune'} {metricMode === 'leads' ? 'Leads' : 'Deals'}
                </h3>
                <p className="text-[9px] text-warmgray mt-0.5">
                  Tapping an entry centers location. Verified against central database.
                </p>
              </div>
              <span className="bg-alabaster px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border border-antiquegold/10 text-charcoal">
                {filteredDrillRecords.length} entries
              </span>
            </div>

            {/* SEARCH AND FILTER INPUT */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by client or building address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F8F6F1] border border-[rgba(184,135,61,0.15)] rounded-xl text-xs focus:ring-1 focus:ring-antiquegold focus:border-antiquegold placeholder-warmgray"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-warmgray" />
            </div>

            {/* THE DRILL LIST */}
            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[250px] pr-1">
              {filteredDrillRecords.length === 0 ? (
                <div className="text-center py-8 text-warmgray italic text-[11px]">
                  No records matching the selected timeframe or search criteria.
                </div>
              ) : (
                filteredDrillRecords.map(item => {
                  if ('contactInfo' in item) {
                    // It's a Lead
                    const s = surveyors.find(user => user.id === item.surveyorId);
                    return (
                      <div 
                        key={`drill-lead-${item.id}`}
                        className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)] hover:border-antiquegold/30 hover:bg-white transition-all text-xs flex justify-between items-start cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-royalemerald" />
                            <p className="font-bold text-charcoal leading-none">{item.contactInfo.name}</p>
                          </div>
                          <p className="text-[9px] text-warmgray line-clamp-1">{item.buildingInfo.address}</p>
                          <div className="flex items-center gap-2 pt-1 text-[9px] text-warmgray">
                            <span className="bg-white px-1.5 py-0.5 rounded border leading-none uppercase font-bold text-[8px] text-antiquegold">
                              {item.stage.replace('_', ' ')}
                            </span>
                            <span>Surveyor: {s?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[8px] text-warmgray">{new Date(item.createdAt).toLocaleDateString()}</p>
                          <p className="text-[9px] font-bold text-charcoal mt-1">{item.buildingInfo.floors} Floors</p>
                        </div>
                      </div>
                    );
                  } else {
                    // It's a Deal
                    const linkedLead = leads.find(l => l.id === item.leadId);
                    return (
                      <div 
                        key={`drill-deal-${item.id}`}
                        className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)] hover:border-antiquegold/30 hover:bg-white transition-all text-xs flex justify-between items-start cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-antiquegold" />
                            <p className="font-bold text-charcoal leading-none">{linkedLead?.contactInfo.name || 'Premium Client'}</p>
                          </div>
                          <p className="text-[9px] text-warmgray line-clamp-1">{linkedLead?.buildingInfo.address || 'Address Confirmed'}</p>
                          <div className="flex items-center gap-2 pt-1 text-[9px] text-warmgray">
                            <span className="bg-white px-1.5 py-0.5 rounded border leading-none uppercase font-bold text-[8px] text-royalemerald">
                              {item.status.replace('_', ' ')}
                            </span>
                            <span>Price: ₹{(item.agreedPrice / 100000).toFixed(1)} Lakh</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[8px] text-warmgray">{new Date(item.createdAt).toLocaleDateString()}</p>
                          <p className="text-[9px] font-bold text-charcoal mt-1">{item.specs.driveType}</p>
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
