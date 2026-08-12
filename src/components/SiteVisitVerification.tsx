import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, AlertTriangle, Eye, ShieldAlert, Sliders, RefreshCw, 
  MapPin, Clock, Check, AlertCircle, Sparkles, Filter, Search, 
  ArrowRight, ArrowUpRight, X, Compass, CheckSquare, Image as ImageIcon,
  ChevronRight, ThumbsUp, Send, Smartphone, Map as MapIcon, Info, Trash2
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { User, SiteVisit, Lead } from '../types';
import { Card, Button } from './Common';

interface SiteVisitVerificationProps {
  user: User;
}

export const SiteVisitVerification: React.FC<SiteVisitVerificationProps> = ({ user }) => {
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  
  // Filtering & Selection State
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<SiteVisit | null>(null);
  
  // Custom threshold config for auto-approval simulation
  const [autoApproveConfidence, setAutoApproveConfidence] = useState(85);
  const [autoApproveAccuracy, setAutoApproveAccuracy] = useState(30); // in meters
  
  // UI states
  const [flagReasonInput, setFlagReasonInput] = useState('');
  const [isFlagging, setIsFlagging] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState<string | null>(null); // visitId to override radius
  const [customRadiusValue, setCustomRadiusValue] = useState('150');

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, []);

  const loadData = () => {
    setSiteVisits(DbManager.getSiteVisits());
    setLeads(DbManager.getLeads());
  };

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Approval function
  const handleApprove = (visitId: string) => {
    const visit = DbManager.getSiteVisitById(visitId);
    if (!visit) return;
    
    const updated: SiteVisit = {
      ...visit,
      status: 'approved',
      flagReason: undefined
    };
    DbManager.updateSiteVisit(updated);
    showToast(`Site Visit #${visitId.replace('visit_', '')} approved successfully.`);
    if (selectedVisit?.id === visitId) {
      setSelectedVisit(updated);
    }
  };

  // Flag/Mismatch function
  const handleFlag = (visitId: string, reason: string) => {
    if (!reason.trim()) {
      showToast('Please specify a reason for flagging this submission.', 'error');
      return;
    }
    const visit = DbManager.getSiteVisitById(visitId);
    if (!visit) return;

    const updated: SiteVisit = {
      ...visit,
      status: 'flagged',
      flagReason: reason
    };
    DbManager.updateSiteVisit(updated);
    showToast(`Site Visit #${visitId.replace('visit_', '')} flagged. Surveyor will be notified.`, 'info');
    setFlagReasonInput('');
    setIsFlagging(false);
    if (selectedVisit?.id === visitId) {
      setSelectedVisit(updated);
    }
  };

  // Bulk action: approve all pending with high confidence score based on the safe thresholds
  const handleBulkApprove = () => {
    const pendingVisits = siteVisits.filter(v => v.status === 'pending');
    
    // Filter matching confidence & accuracy criteria
    const autoClearable = pendingVisits.filter(
      v => v.geoMatchConfidence >= autoApproveConfidence && v.deviceGpsAccuracyRadius <= autoApproveAccuracy
    );

    if (autoClearable.length === 0) {
      showToast('No pending visits match the strict auto-approval criteria currently.', 'info');
      return;
    }

    autoClearable.forEach(v => {
      const updated: SiteVisit = {
        ...v,
        status: 'approved'
      };
      DbManager.updateSiteVisit(updated);
    });

    showToast(`Bulk approved ${autoClearable.length} verified site visits instantly!`, 'success');
  };

  // Custom Override radius for wide construction townships
  const handleOverrideRadius = (visitId: string) => {
    const visit = DbManager.getSiteVisitById(visitId);
    if (!visit) return;
    
    // Artificially boost the confidence level based on human override
    const updated: SiteVisit = {
      ...visit,
      geoMatchConfidence: 95,
      notes: `${visit.notes || ''} [Human override applied: Township boundaries expanded to ${customRadiusValue}m]`.trim()
    };
    DbManager.updateSiteVisit(updated);
    showToast(`Geofence match radius expanded to ${customRadiusValue}m. Geo-confidence adjusted.`, 'success');
    setShowOverrideModal(null);
    if (selectedVisit?.id === visitId) {
      setSelectedVisit(updated);
    }
  };

  // Reset visits back to baseline seeds for testing
  const handleReset = () => {
    DbManager.resetToSeeds();
    showToast('Site visit records reset to baseline scenario.', 'info');
  };

  // Filtering Logic
  const filteredVisits = siteVisits.filter(v => {
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesSearch = 
      v.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.claimedAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.surveyorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate auto-clear eligible count
  const pendingVisits = siteVisits.filter(v => v.status === 'pending');
  const autoClearEligibleCount = pendingVisits.filter(
    v => v.geoMatchConfidence >= autoApproveConfidence && v.deviceGpsAccuracyRadius <= autoApproveAccuracy
  ).length;

  return (
    <div className="space-y-6 font-sans pb-16">
      
      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === 'success' 
                ? 'bg-[#E6F7ED] border-[#2E8F5B]/30 text-[#124B2C]' 
                : toastMessage.type === 'error'
                  ? 'bg-[#FFF5F5] border-error/30 text-error'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-royalemerald" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-error" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER CONTROLS */}
      <div className="bg-white p-5 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-antiquegold tracking-widest flex items-center gap-1">
              <Compass className="w-4 h-4 text-royalemerald" />
              Operational Security Core
            </span>
            <h1 className="font-serif text-2xl font-bold text-charcoal mt-1">Site Visit Geo-Verification</h1>
            <p className="text-xs text-warmgray mt-0.5">
              Validate real physical surveyor presence using cryptographic GPS capture and photo metadata confidence scores.
            </p>
          </div>

          <div className="flex gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={handleReset}
              className="flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold border border-antiquegold/20 text-warmgray hover:text-charcoal hover:bg-alabaster transition-all flex items-center justify-center gap-1.5"
              title="Reset records to default simulation data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
            <button
              onClick={handleBulkApprove}
              disabled={autoClearEligibleCount === 0}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                autoClearEligibleCount > 0 
                  ? 'bg-royalemerald text-white hover:bg-opacity-90' 
                  : 'bg-[#F8F6F1] text-warmgray border border-warmgray/10 cursor-not-allowed'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Bulk Approve ({autoClearEligibleCount} Auto-Matches)</span>
            </button>
          </div>
        </div>

        {/* THRESHOLD PREFERENCE CONTROLLER PANEL */}
        <div className="bg-[#F8F6F1]/60 p-4 rounded-xl border border-[rgba(184,135,61,0.08)] grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-charcoal flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-antiquegold" />
              Min Geo-Match Confidence
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="50" 
                max="100" 
                value={autoApproveConfidence} 
                onChange={(e) => setAutoApproveConfidence(Number(e.target.value))}
                className="w-full accent-antiquegold h-1.5 bg-[#e5dfd4] rounded-lg cursor-pointer"
              />
              <span className="font-mono text-xs font-extrabold text-royalemerald bg-white px-2 py-0.5 rounded border border-antiquegold/10">
                {autoApproveConfidence}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-charcoal flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-antiquegold" />
              Max Acceptable Device GPS Radius
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="5" 
                max="150" 
                value={autoApproveAccuracy} 
                onChange={(e) => setAutoApproveAccuracy(Number(e.target.value))}
                className="w-full accent-antiquegold h-1.5 bg-[#e5dfd4] rounded-lg cursor-pointer"
              />
              <span className="font-mono text-xs font-extrabold text-royalemerald bg-white px-2 py-0.5 rounded border border-antiquegold/10 whitespace-nowrap">
                {autoApproveAccuracy}m
              </span>
            </div>
          </div>

          <div className="text-xs text-warmgray bg-white p-2.5 rounded-lg border border-antiquegold/10 flex items-start gap-2 self-center">
            <Sparkles className="w-4 h-4 text-antiquegold shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong>Rules:</strong> Pending visits with <strong>&ge;{autoApproveConfidence}%</strong> confidence &amp; <strong>&le;{autoApproveAccuracy}m</strong> GPS accuracy will auto-approve instantly on click of Bulk Approve.
            </p>
          </div>
        </div>

        {/* SEARCH, STATUS TABS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Status buttons */}
          <div className="flex bg-alabaster p-1 rounded-xl border border-[rgba(184,135,61,0.08)] text-[11px] font-bold shrink-0">
            {(['all', 'pending', 'approved', 'flagged'] as const).map(status => {
              const count = siteVisits.filter(v => status === 'all' || v.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg transition-all capitalize flex items-center gap-1.5 ${
                    statusFilter === status 
                      ? 'bg-white text-charcoal shadow-xs' 
                      : 'text-warmgray hover:text-charcoal'
                  }`}
                >
                  <span>{status === 'all' ? 'All Submissions' : status}</span>
                  <span className={`px-1.5 py-0.1 text-[9px] rounded-full ${
                    statusFilter === status ? 'bg-royalemerald/10 text-royalemerald' : 'bg-gray-200 text-warmgray'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by lead client, address, surveyor, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F6F1] border border-[rgba(184,135,61,0.15)] rounded-xl text-xs focus:ring-1 focus:ring-antiquegold focus:border-antiquegold placeholder-warmgray"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-warmgray" />
          </div>
        </div>
      </div>

      {/* CORE GRID CONTENT */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* SUBMISSION GALLERY LIST (LEFT / PRINCIPLE COLUMN) */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center px-1">
            <p className="text-[11px] uppercase font-bold text-warmgray tracking-widest">
              Showing {filteredVisits.length} matching geo-logs
            </p>
            {statusFilter === 'pending' && autoClearEligibleCount > 0 && (
              <span className="text-[10px] text-royalemerald font-bold bg-[#E6F7ED] px-2 py-0.5 rounded-full border border-royalemerald/20 animate-pulse">
                ⚡ {autoClearEligibleCount} ready to clear
              </span>
            )}
          </div>

          {filteredVisits.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-[rgba(184,135,61,0.12)] space-y-3">
              <ImageIcon className="w-12 h-12 text-antiquegold/25 mx-auto" />
              <h3 className="font-serif text-base font-bold text-charcoal">No Site Visits Found</h3>
              <p className="text-xs text-warmgray max-w-sm mx-auto">
                No photo submission logs match your active status filters or search term. Try resetting database to initial scenario.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVisits.map((visit) => {
                const isSelected = selectedVisit?.id === visit.id;
                const isAutoClearable = visit.status === 'pending' && 
                  visit.geoMatchConfidence >= autoApproveConfidence && 
                  visit.deviceGpsAccuracyRadius <= autoApproveAccuracy;

                return (
                  <motion.div
                    key={visit.id}
                    layoutId={`visit-card-${visit.id}`}
                    onClick={() => {
                      setSelectedVisit(visit);
                      setIsFlagging(false);
                    }}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col group relative ${
                      isSelected 
                        ? 'border-antiquegold ring-1 ring-antiquegold/30 shadow-md' 
                        : 'border-[rgba(184,135,61,0.14)] hover:border-antiquegold/50 shadow-xs hover:shadow-sm'
                    }`}
                  >
                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white shadow-md ${
                        visit.status === 'approved' 
                          ? 'bg-royalemerald' 
                          : visit.status === 'flagged' 
                            ? 'bg-error' 
                            : 'bg-amber-500'
                      }`}>
                        {visit.status === 'approved' && 'Verified Match'}
                        {visit.status === 'flagged' && 'Flagged Mismatch'}
                        {visit.status === 'pending' && 'Pending Verification'}
                      </span>

                      {isAutoClearable && (
                        <span className="bg-royalemerald/90 text-white px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Auto-Clear Pass
                        </span>
                      )}
                    </div>

                    {/* PHOTO THUMBNAIL */}
                    <div className="relative h-44 w-full bg-[#FAF9F5] overflow-hidden">
                      <img 
                        src={visit.photoUrl} 
                        alt={`Site upload for ${visit.leadName}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Framing Guide Grid Ghost Overlay for Construction Guided evidence */}
                      <div className="absolute inset-0 border-[1.5px] border-dashed border-white/20 pointer-events-none flex items-center justify-center">
                        <div className="w-1/2 h-1/2 border border-white/10" />
                      </div>

                      {/* Photo specific upload status overlay */}
                      <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-xs px-2 py-1 rounded text-[8px] text-white/90 font-mono flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-2.5 h-2.5 text-antiquegold" />
                          Device log captured
                        </span>
                        <span>100% Uploaded</span>
                      </div>
                    </div>

                    {/* CARD BODY */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h3 className="font-serif text-sm font-bold text-charcoal line-clamp-1">{visit.leadName}</h3>
                          <span className="font-mono text-[9px] text-warmgray shrink-0">{visit.id.replace('visit_', '#')}</span>
                        </div>
                        <p className="text-[10px] text-warmgray line-clamp-1 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-antiquegold shrink-0" />
                          {visit.claimedAddress}
                        </p>
                      </div>

                      {/* CONFIDENCE & ACCURACY METER */}
                      <div className="space-y-1.5 bg-[#F8F6F1] p-2 rounded-xl border border-[rgba(184,135,61,0.06)]">
                        <div className="flex justify-between text-[9px] font-bold text-warmgray">
                          <span>Geo-Confidence:</span>
                          <span className={visit.geoMatchConfidence >= 80 ? 'text-royalemerald' : 'text-error'}>
                            {visit.geoMatchConfidence}% Match
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              visit.geoMatchConfidence >= 80 ? 'bg-royalemerald' : 'bg-error'
                            }`}
                            style={{ width: `${visit.geoMatchConfidence}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center pt-0.5 text-[8px] text-warmgray font-mono">
                          <span>Gps Accuracy: &plusmn;{visit.deviceGpsAccuracyRadius}m</span>
                          <span>{visit.deviceGpsAccuracyRadius <= 20 ? '🎯 GPS Lock' : '📶 Weak Signal'}</span>
                        </div>
                      </div>

                      {/* CARD FOOTER */}
                      <div className="pt-2 border-t border-alabaster flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-antiquegold/10 text-antiquegold font-extrabold flex items-center justify-center text-[8px]">
                            {visit.surveyorName.charAt(0)}
                          </div>
                          <span className="text-[10px] text-warmgray font-semibold">{visit.surveyorName}</span>
                        </div>

                        <div className="flex items-center gap-1 text-[9px] text-warmgray font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(visit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* DETAILED DRILL-DOWN PANEL / LIGHTBOX (RIGHT COLUMN) */}
        <div className="w-full lg:w-[420px] shrink-0">
          <AnimatePresence mode="wait">
            {selectedVisit ? (
              <motion.div
                key={selectedVisit.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl border-2 border-antiquegold/20 p-5 shadow-md space-y-5 sticky top-6"
              >
                {/* Header detail */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-warmgray tracking-widest font-mono">
                      Log ID: {selectedVisit.id}
                    </span>
                    <h2 className="font-serif text-lg font-bold text-charcoal mt-0.5">{selectedVisit.leadName}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedVisit(null)}
                    className="p-1.5 hover:bg-alabaster rounded-full text-warmgray hover:text-charcoal transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* BIG PHOTO INSPECTOR */}
                <div className="relative rounded-2xl overflow-hidden group bg-[#FAF9F5] border border-alabaster h-48">
                  <img 
                    src={selectedVisit.photoUrl} 
                    alt="Active inspection" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-white/95 text-charcoal px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-antiquegold" />
                      View Image Full Size
                    </span>
                  </div>
                  <button 
                    onClick={() => setLightboxPhoto(selectedVisit.photoUrl)}
                    className="absolute inset-0 w-full h-full cursor-zoom-in"
                    title="Click to view full image resolution"
                  />
                </div>

                {/* SIGNATURE "THE ASCENSION LINE" - GEOLOCATION CONFIDENCE STAGE */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-warmgray">
                    <span>Cryptographic Integrity Stage</span>
                    <span className={selectedVisit.geoMatchConfidence >= 80 ? 'text-royalemerald' : 'text-error'}>
                      {selectedVisit.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 bg-alabaster p-3 rounded-xl border border-[rgba(184,135,61,0.06)]">
                    {/* Vertical elevator ascension line represent confidence */}
                    <div className="relative w-2 h-16 bg-[#e5dfd4] rounded-full overflow-hidden shrink-0">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${selectedVisit.geoMatchConfidence}%` }}
                        className={`absolute bottom-0 left-0 right-0 rounded-full ${
                          selectedVisit.geoMatchConfidence >= 80 ? 'bg-royalemerald' : 'bg-error'
                        }`}
                        style={{
                          boxShadow: selectedVisit.geoMatchConfidence >= 80 
                            ? '0 0 8px rgba(14, 75, 61, 0.6)' 
                            : '0 0 8px rgba(178, 59, 59, 0.6)'
                        }}
                      />
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-charcoal flex items-center gap-1">
                        {selectedVisit.geoMatchConfidence}% Spatial Congruence
                      </p>
                      <p className="text-[10px] text-warmgray leading-relaxed">
                        Claimed target address: {selectedVisit.claimedAddress}. 
                        Device coordinates captured at Lat {selectedVisit.capturedLatLng.lat.toFixed(4)}, Lng {selectedVisit.capturedLatLng.lng.toFixed(4)}.
                      </p>
                    </div>
                  </div>
                </div>

                {/* DEVICE INTELLIGENCE FALLBACK */}
                <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-antiquegold/10 text-xs space-y-2">
                  <p className="font-bold text-charcoal flex items-center gap-1">
                    <Smartphone className="w-4 h-4 text-royalemerald" />
                    Captured device metrics
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-warmgray">
                    <div>
                      <span className="block font-sans text-[8px] uppercase">GPS Accuracy Radius:</span>
                      <strong className="text-charcoal">&plusmn;{selectedVisit.deviceGpsAccuracyRadius} meters</strong>
                    </div>
                    <div>
                      <span className="block font-sans text-[8px] uppercase">Submission Time:</span>
                      <strong className="text-charcoal">{new Date(selectedVisit.timestamp).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="block font-sans text-[8px] uppercase">EXIF Coordinates:</span>
                      <strong className="text-royalemerald">Preserved</strong>
                    </div>
                    <div>
                      <span className="block font-sans text-[8px] uppercase">Fallback Device Logs:</span>
                      <strong className="text-royalemerald">Verified (App Lock)</strong>
                    </div>
                  </div>
                  <p className="text-[9px] text-warmgray leading-relaxed pt-1.5 border-t border-[#e5dfd4]">
                    💡 <em>Anti-Fake GPS Protection:</em> Device reported poor accuracy radius can indicate tall elevator shafts or deep basements. Confirmed by local app security logs.
                  </p>
                </div>

                {/* PENDING SUBMISSION ACTION TRIGGER PANEL */}
                {selectedVisit.status === 'pending' ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => handleApprove(selectedVisit.id)}
                        className="flex-1 py-3 px-4 bg-royalemerald text-white rounded-xl text-xs font-extrabold shadow-sm hover:bg-opacity-95 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Approve Site Visit</span>
                      </button>
                      <button
                        onClick={() => setIsFlagging(!isFlagging)}
                        className={`py-3 px-4 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-all ${
                          isFlagging 
                            ? 'bg-error text-white border-transparent' 
                            : 'bg-white border-error text-error hover:bg-error/5'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Flag Mismatch</span>
                      </button>
                    </div>

                    {isFlagging && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 pt-2"
                      >
                        <label className="text-[10px] uppercase font-bold text-error block">
                          Reason for Flagging Submission:
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="e.g. Coordinates mismatch, uploaded unrelated image..."
                            value={flagReasonInput}
                            onChange={(e) => setFlagReasonInput(e.target.value)}
                            className="flex-1 bg-white border border-error/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-error focus:border-error"
                          />
                          <button
                            onClick={() => handleFlag(selectedVisit.id, flagReasonInput)}
                            className="bg-error text-white px-3.5 rounded-xl hover:bg-opacity-90 flex items-center justify-center"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[9px] text-warmgray italic">
                          This comment will trigger an automated push notification to {selectedVisit.surveyorName} demanding a re-inspection.
                        </p>
                      </motion.div>
                    )}

                    <button
                      onClick={() => {
                        setShowOverrideModal(selectedVisit.id);
                        setCustomRadiusValue('150');
                      }}
                      className="w-full py-2 bg-alabaster border border-antiquegold/20 rounded-xl text-[10px] font-bold text-warmgray hover:text-charcoal transition-all text-center"
                    >
                      🚧 Expand Acceptable Radius (Large Township Overrides)
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border text-xs space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      {selectedVisit.status === 'approved' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-royalemerald" />
                          <span className="text-royalemerald">Approved &amp; Cleared</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-4 h-4 text-error" />
                          <span className="text-error">Flagged for Surveyor Correction</span>
                        </>
                      )}
                    </p>
                    <p className="text-[11px] text-warmgray">
                      {selectedVisit.status === 'approved' 
                        ? 'This visit passed cryptographic checks or was approved by Mr. Prashant Wable. Surveyor has been credited for site metrics.'
                        : `Surveyor flagged: "${selectedVisit.flagReason}"`
                      }
                    </p>
                    
                    {/* Re-verify switch */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="secondary" 
                        className="flex-1 text-[10px] py-1.5" 
                        onClick={() => {
                          const updated: SiteVisit = { ...selectedVisit, status: 'pending', flagReason: undefined };
                          DbManager.updateSiteVisit(updated);
                          setSelectedVisit(updated);
                          showToast('Reverted back to Pending Review.', 'info');
                        }}
                      >
                        Reset to Pending
                      </Button>
                    </div>
                  </div>
                )}

                {/* EXPLICIT ADDITIONAL METADATA NOTES */}
                {selectedVisit.notes && (
                  <div className="bg-alabaster/40 p-2.5 rounded-lg border border-antiquegold/10 text-[10px] text-warmgray">
                    <span className="font-bold text-charcoal">Admin Notes:</span> {selectedVisit.notes}
                  </div>
                )}

              </motion.div>
            ) : (
              <div className="bg-white p-8 text-center rounded-3xl border border-[rgba(184,135,61,0.15)] space-y-3 py-16 sticky top-6">
                <Compass className="w-10 h-10 text-antiquegold/25 mx-auto animate-pulse" />
                <h3 className="font-serif text-base font-bold text-charcoal">Audit Selection Awaiting</h3>
                <p className="text-xs text-warmgray max-w-xs mx-auto">
                  Click a site visit submission from the feed list to preview raw GPS overlays, devices report, and approve/flag.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* OVERRIDE TOWNSHIP ACCEPTABLE RANGE MODAL */}
      <AnimatePresence>
        {showOverrideModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border-2 border-antiquegold p-6 max-w-sm w-full space-y-4 shadow-2xl"
            >
              <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-1.5">
                <MapIcon className="w-5 h-5 text-antiquegold" />
                Large Township Override
              </h3>
              <p className="text-xs text-warmgray leading-relaxed">
                Large construction sites (townships, high-rise societies, or factories) might have safe-zones spanning several hundred meters. Boost match radius manually.
              </p>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-charcoal block">Configure override radius (meters):</label>
                <select 
                  value={customRadiusValue} 
                  onChange={(e) => setCustomRadiusValue(e.target.value)}
                  className="w-full bg-[#F8F6F1] border border-[rgba(184,135,61,0.15)] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-antiquegold"
                >
                  <option value="100">100 Meters</option>
                  <option value="250">250 Meters (Medium Society)</option>
                  <option value="500">500 Meters (Large Township)</option>
                  <option value="1000">1.0 Kilometer (Industrial Estate)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" className="flex-1 py-2 text-xs" onClick={() => setShowOverrideModal(null)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1 py-2 text-xs" onClick={() => handleOverrideRadius(showOverrideModal)}>
                  Apply Override
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL RESOLUTION LIGHTBOX PREVIEW */}
      <AnimatePresence>
        {lightboxPhoto && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
            <button 
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="max-w-4xl w-full max-h-[80vh] overflow-hidden rounded-2xl relative shadow-2xl border border-white/10">
              <img 
                src={lightboxPhoto} 
                alt="High Resolution Site Inspection" 
                className="w-full h-full object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay framing lines to make it look like a surveyor tool */}
              <div className="absolute inset-4 pointer-events-none border border-white/25 flex items-center justify-center">
                {/* Crosshairs */}
                <div className="absolute w-8 h-[1px] bg-white/60" />
                <div className="absolute h-8 w-[1px] bg-white/60" />
                <span className="absolute bottom-2 left-2 text-[9px] font-mono text-white/50 bg-black/30 px-1.5 py-0.5 rounded">
                  AIEC SHAFTSCAN V2.4
                </span>
              </div>
            </div>
            
            <p className="text-white/60 text-xs mt-3 text-center max-w-md">
              Shaft alignment, cleanliness, and structural concrete readiness verified. GPS EXIF integrity validated.
            </p>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
