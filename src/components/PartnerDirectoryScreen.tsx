import React, { useState, useEffect } from 'react';
import {
  User,
  MasterPartnerDirectoryRecord
} from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import {
  Users,
  Search,
  Filter,
  MapPin,
  Star,
  ShieldCheck,
  Award,
  PhoneCall,
  Mail,
  MoreVertical,
  UserX,
  UserCheck,
  Edit3,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building,
  Wrench,
  Compass,
  Package,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  X
} from 'lucide-react';

interface PartnerDirectoryScreenProps {
  user: User;
  onNavigateToExitScreen?: (partnerId: string) => void;
  onNavigateToTierAssignment?: (partnerId: string) => void;
  onBack?: () => void;
}

export const PartnerDirectoryScreen: React.FC<PartnerDirectoryScreenProps> = ({
  user,
  onNavigateToExitScreen,
  onNavigateToTierAssignment,
  onBack
}) => {
  const [partners, setPartners] = useState<MasterPartnerDirectoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  // Selected Partner Detail Drawer / Modal
  const [selectedPartner, setSelectedPartner] = useState<MasterPartnerDirectoryRecord | null>(null);
  
  // Territory Reassignment Modal State
  const [showTerritoryModal, setShowTerritoryModal] = useState(false);
  const [partnerToReassign, setPartnerToReassign] = useState<MasterPartnerDirectoryRecord | null>(null);
  const [newTerritory, setNewTerritory] = useState('');
  const [newZone, setNewZone] = useState('');

  useEffect(() => {
    loadDirectoryData();
  }, []);

  const loadDirectoryData = () => {
    setLoading(true);
    setTimeout(() => {
      const list = DbManager.getMasterPartners();
      setPartners(list);
      setLoading(false);
    }, 200);
  };

  const handleReassignTerritorySubmit = () => {
    if (!partnerToReassign || !newTerritory) return;

    const updated: MasterPartnerDirectoryRecord = {
      ...partnerToReassign,
      territoryOrSpecialty: newTerritory,
      zone: newZone || partnerToReassign.zone,
      lastActive: new Date().toISOString().split('T')[0]
    };

    DbManager.saveMasterPartner(updated);
    loadDirectoryData();
    setShowTerritoryModal(false);
    setPartnerToReassign(null);
  };

  const handleExportCsv = () => {
    const headers = ['Partner ID', 'Name', 'Phone', 'Primary Role', 'Roles', 'Status', 'Tier', 'Zone', 'Rating', 'Jobs Done'];
    const rows = filteredPartners.map(p => [
      p.id,
      `"${p.partnerName}"`,
      p.partnerPhone,
      p.primaryRole,
      `"${p.roles.join(', ')}"`,
      p.activeStatus,
      p.tier,
      `"${p.zone}"`,
      p.rating,
      p.completedJobsCount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aiec_partner_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Logic
  const filteredPartners = partners.filter(p => {
    // Role filter
    if (selectedRole !== 'all' && !p.roles.includes(selectedRole as any)) {
      return false;
    }
    // Status filter
    if (selectedStatus !== 'all' && p.activeStatus !== selectedStatus) {
      return false;
    }
    // Tier filter
    if (selectedTier !== 'all' && p.tier !== selectedTier) {
      return false;
    }
    // Zone filter
    if (selectedZone !== 'all' && p.zone !== selectedZone) {
      return false;
    }
    // Query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.partnerName.toLowerCase().includes(q);
      const matchPhone = p.partnerPhone.includes(q);
      const matchTerritory = p.territoryOrSpecialty.toLowerCase().includes(q);
      const matchEmail = (p.email || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchTerritory && !matchEmail) {
        return false;
      }
    }
    return true;
  });

  // Unique Zones list for filter dropdown
  const uniqueZones = Array.from(new Set(partners.map(p => p.zone)));

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'technician':
        return <Wrench className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />;
      case 'surveyor':
        return <Compass className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" />;
      case 'supplier':
        return <Package className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'sales_rep':
        return <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Users className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'tier_4_master':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Tier 4 Master</span>;
      case 'tier_3_gold':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-400/10 text-amber-600 border border-amber-400/20">Tier 3 Gold</span>;
      case 'tier_2_silver':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20">Tier 2 Silver</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-800/10 text-amber-800 dark:text-amber-300 border border-amber-800/20">Tier 1 Bronze</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active</span>;
      case 'suspended':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Suspended</span>;
      case 'deactivated':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Deactivated</span>;
      case 'exit_in_progress':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Exit Flow</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-500/10 text-gray-600 border border-gray-500/20">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-20">
      {/* Top Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 mb-2 cursor-pointer"
              >
                ← Back to Recruitment Overview
              </button>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">
                Master Partner Network Directory
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                Unified Network Registry
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Searchable master roster across Technicians, Surveyors, OEM Suppliers & Sales Partners.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportCsv}
              className="px-3.5 py-2 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[var(--color-surface)]"
            >
              <Download className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              <span>Export CSV</span>
            </Button>
            <Button
              onClick={loadDirectoryData}
              className="px-3 py-2 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        
        {/* Sticky Filter & Search Control Panel */}
        <Card className="p-4 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-3 sticky top-2 z-20">
          
          {/* Role Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--color-border)]">
            {[
              { id: 'all', label: 'All Partners', icon: Users, count: partners.length },
              { id: 'technician', label: 'Technicians', icon: Wrench, count: partners.filter(p => p.roles.includes('technician')).length },
              { id: 'surveyor', label: 'Surveyors', icon: Compass, count: partners.filter(p => p.roles.includes('surveyor')).length },
              { id: 'supplier', label: 'OEM Suppliers', icon: Package, count: partners.filter(p => p.roles.includes('supplier')).length },
              { id: 'sales_rep', label: 'Sales Partners', icon: TrendingUp, count: partners.filter(p => p.roles.includes('sales_rep')).length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedRole(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedRole === tab.id
                    ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                    : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${selectedRole === tab.id ? 'bg-white/20 text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar & Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            
            {/* Search Box */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, phone, zone, or specialty..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="sm:col-span-2">
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
                <option value="exit_in_progress">Exit Flow</option>
              </select>
            </div>

            {/* Tier Dropdown */}
            <div className="sm:col-span-2">
              <select
                value={selectedTier}
                onChange={e => setSelectedTier(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              >
                <option value="all">All Tiers</option>
                <option value="tier_4_master">Tier 4 Master</option>
                <option value="tier_3_gold">Tier 3 Gold</option>
                <option value="tier_2_silver">Tier 2 Silver</option>
                <option value="tier_1_bronze">Tier 1 Bronze</option>
              </select>
            </div>

            {/* Zone Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              >
                <option value="all">All Zones / Territories</option>
                {uniqueZones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

          </div>

        </Card>

        {/* Directory List View */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(n => (
              <Card key={n} className="p-4 border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : filteredPartners.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] px-1">
              <span>Showing <strong>{filteredPartners.length}</strong> partners in master roster</span>
              <span>Sorted by Rating & Activity</span>
            </div>

            {filteredPartners.map(p => (
              <Card
                key={p.id}
                className={`p-4 border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent-primary)] transition-all shadow-sm ${
                  p.activeStatus === 'deactivated' ? 'opacity-70 bg-[var(--color-bg)]/50' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Column: Partner Primary Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20 flex items-center justify-center shrink-0">
                      {getRoleIcon(p.primaryRole)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                          {p.partnerName}
                        </h3>
                        {getStatusBadge(p.activeStatus)}
                        {getTierBadge(p.tier)}
                      </div>

                      {/* Multi-role span tags */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-[var(--color-text-secondary)] font-medium">Roles:</span>
                        {p.roles.map(r => (
                          <span
                            key={r}
                            className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] uppercase flex items-center gap-1"
                          >
                            {getRoleIcon(r)}
                            <span>{r}</span>
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-secondary)] pt-1">
                        <span className="flex items-center gap-1">
                          <PhoneCall className="w-3 h-3 text-[var(--color-accent-secondary)]" />
                          <span>{p.partnerPhone}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[var(--color-accent-primary)]" />
                          <span>{p.territoryOrSpecialty}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[var(--color-text-primary)] font-bold">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{p.rating} / 5.0</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Operational Metrics */}
                  <div className="grid grid-cols-3 gap-3 text-center border-t lg:border-t-0 lg:border-l border-[var(--color-border)] pt-3 lg:pt-0 lg:pl-4 shrink-0">
                    <div className="p-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <span className="text-[10px] text-[var(--color-text-secondary)] uppercase block">Completed</span>
                      <span className="text-sm font-serif font-bold text-[var(--color-text-primary)]">{p.completedJobsCount}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <span className="text-[10px] text-[var(--color-text-secondary)] uppercase block">Active Jobs</span>
                      <span className={`text-sm font-serif font-bold ${p.activeJobsCount > 0 ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                        {p.activeJobsCount}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <span className="text-[10px] text-[var(--color-text-secondary)] uppercase block">Verification</span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        <span>KYC ✓</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 border-[var(--color-border)] pt-3 lg:pt-0 shrink-0">
                    
                    <a
                      href={`tel:${p.partnerPhone}`}
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call</span>
                    </a>

                    <Button
                      onClick={() => {
                        setPartnerToReassign(p);
                        setNewTerritory(p.territoryOrSpecialty);
                        setNewZone(p.zone);
                        setShowTerritoryModal(true);
                      }}
                      className="px-2.5 py-1.5 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" />
                      <span>Reassign Zone</span>
                    </Button>

                    {onNavigateToTierAssignment && (
                      <Button
                        onClick={() => onNavigateToTierAssignment(p.id)}
                        className="px-2.5 py-1.5 text-xs bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20 hover:bg-[var(--color-accent-primary)] hover:text-white font-semibold cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Tier</span>
                      </Button>
                    )}

                    {onNavigateToExitScreen && p.activeStatus !== 'deactivated' && (
                      <Button
                        onClick={() => onNavigateToExitScreen(p.id)}
                        className="px-2.5 py-1.5 text-xs bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Offboard / Exit</span>
                      </Button>
                    )}

                    <Button
                      onClick={() => setSelectedPartner(p)}
                      className="px-2.5 py-1.5 text-xs bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>

                  </div>

                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-[var(--color-border)] bg-[var(--color-surface)]">
            <Users className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto mb-2 opacity-50" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">No Partners Found</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Try adjusting search terms, role filters, or status selections.
            </p>
          </Card>
        )}

      </div>

      {/* Partner Full Profile Drawer / Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20 flex items-center justify-center">
                  {getRoleIcon(selectedPartner.primaryRole)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">{selectedPartner.partnerName}</h3>
                  <span className="text-xs text-[var(--color-text-secondary)]">{selectedPartner.id} • Joined: {selectedPartner.joinedDate}</span>
                </div>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                <span className="text-[10px] uppercase text-[var(--color-text-secondary)] font-bold block">Mobile Phone</span>
                <span className="font-semibold text-[var(--color-text-primary)] mt-1 block">{selectedPartner.partnerPhone}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                <span className="text-[10px] uppercase text-[var(--color-text-secondary)] font-bold block">Email Address</span>
                <span className="font-semibold text-[var(--color-text-primary)] mt-1 block">{selectedPartner.email || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                <span className="text-[10px] uppercase text-[var(--color-text-secondary)] font-bold block">Primary Operating Zone</span>
                <span className="font-semibold text-[var(--color-text-primary)] mt-1 block">{selectedPartner.zone}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                <span className="text-[10px] uppercase text-[var(--color-text-secondary)] font-bold block">Assigned Skill Tier</span>
                <div className="mt-1">{getTierBadge(selectedPartner.tier)}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1 text-xs">
              <span className="text-[10px] uppercase text-[var(--color-text-secondary)] font-bold block">Assigned Scope & Specialty</span>
              <p className="text-[var(--color-text-primary)] font-medium">{selectedPartner.territoryOrSpecialty}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase block">Completed</span>
                <span className="text-base font-bold text-[var(--color-text-primary)]">{selectedPartner.completedJobsCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase block">Active Jobs</span>
                <span className="text-base font-bold text-[var(--color-accent-primary)]">{selectedPartner.activeJobsCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase block">Quality Rating</span>
                <span className="text-base font-bold text-amber-500">{selectedPartner.rating} / 5.0</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
              {onNavigateToExitScreen && selectedPartner.activeStatus !== 'deactivated' && (
                <Button
                  onClick={() => {
                    const id = selectedPartner.id;
                    setSelectedPartner(null);
                    onNavigateToExitScreen(id);
                  }}
                  className="px-3.5 py-2 text-xs bg-rose-500/10 text-rose-600 border border-rose-500/20 font-bold"
                >
                  Initiate Exit Flow
                </Button>
              )}
              <Button onClick={() => setSelectedPartner(null)} className="px-4 py-2 text-xs bg-[var(--color-accent-primary)] text-white font-bold">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Territory Reassignment Modal */}
      {showTerritoryModal && partnerToReassign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--color-accent-primary)]" />
                <span>Reassign Territory & Operating Corridor</span>
              </h3>
              <button onClick={() => setShowTerritoryModal(false)} className="text-xs text-[var(--color-text-secondary)]">✕</button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)]">
              Updating territory for <strong>{partnerToReassign.partnerName}</strong>. New dispatches will automatically align with this zone.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Primary Zone Group
              </label>
              <select
                value={newZone}
                onChange={e => setNewZone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              >
                <option value="Pune West">Pune West (Kothrud / Baner / Bavdhan)</option>
                <option value="Chakan">Chakan & Talegaon Industrial Hub</option>
                <option value="PCMC">PCMC / Bhosari / Pimple Saudagar</option>
                <option value="Hadapsar">Hadapsar & Kharadi IT Corridor</option>
                <option value="Pune South">Pune South / Katraj / Kondhwa</option>
                <option value="Maharashtra State">Maharashtra State Delivery Scope</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Territory Scope / Specific Area Note
              </label>
              <input
                type="text"
                value={newTerritory}
                onChange={e => setNewTerritory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setShowTerritoryModal(false)} className="px-4 py-2 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                Cancel
              </Button>
              <Button onClick={handleReassignTerritorySubmit} className="px-4 py-2 text-xs bg-[var(--color-accent-primary)] text-white font-bold">
                Save & Reassign
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
