import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, TechnicianJob, TechnicianCoordinationRecord } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import { 
  Users, UserCheck, ShieldCheck, Wrench, ChevronLeft, HardHat, Phone, 
  CheckCircle2, AlertTriangle, Plus, Send, Check, FileText, UserPlus
} from 'lucide-react';
import { useLanguage } from '../lib/language';

interface TechnicianTeamCoordinationScreenProps {
  user: User;
  jobId?: string;
  onBack?: () => void;
  onNavigateToSop?: (jobId: string) => void;
}

export const TechnicianTeamCoordinationScreen: React.FC<TechnicianTeamCoordinationScreenProps> = ({
  user,
  jobId = 'job_2026_101',
  onBack,
  onNavigateToSop
}) => {
  const { t } = useLanguage();
  const [selectedJobId, setSelectedJobId] = useState<string>(jobId);
  const [activeJob, setActiveJob] = useState<TechnicianJob | undefined>(undefined);
  
  // Team Members
  const [teamMembers, setTeamMembers] = useState<TechnicianCoordinationRecord[]>([
    {
      id: 'coord_101_1',
      jobId: 'job_2026_101',
      memberId: 'tech_001',
      memberName: 'Ramesh Patil',
      memberRole: 'lead_technician',
      phone: '+91 98220 11223',
      isSubcontractor: false,
      safetyBriefingSigned: true,
      checkInStatus: 'onsite_active',
      assignedTaskScope: 'Mechanical Alignment & Traction Machine Mounting'
    },
    {
      id: 'coord_101_2',
      jobId: 'job_2026_101',
      memberId: 'tech_002',
      memberName: 'Anil Gaikwad',
      memberRole: 'electrical_specialist',
      phone: '+91 98221 44332',
      isSubcontractor: false,
      safetyBriefingSigned: true,
      checkInStatus: 'onsite_active',
      assignedTaskScope: 'Control Panel Wiring & Shaft Travelling Cable'
    },
    {
      id: 'coord_101_3',
      jobId: 'job_2026_101',
      memberId: 'sub_001',
      memberName: 'Pune Civil Scaffolding Crew (Contact: Vijay Mane)',
      memberRole: 'subcontractor_scaffolding',
      phone: '+91 97654 32109',
      subcontractorFirmName: 'Mane Steel Works & Scaffolding',
      isSubcontractor: true,
      handoverSignoffCompleted: true,
      safetyBriefingSigned: true,
      checkInStatus: 'completed',
      assignedTaskScope: 'Full 5-Storey Shaft Tubular Scaffolding Erection'
    }
  ]);

  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberPhone, setNewMemberPhone] = useState<string>('');
  const [newMemberRole, setNewMemberRole] = useState<'assistant_technician' | 'subcontractor_scaffolding' | 'civil_contractor'>('assistant_technician');
  const [newMemberScope, setNewMemberScope] = useState<string>('');

  useEffect(() => {
    const job = DbManager.getTechnicianJobById(selectedJobId);
    if (job) setActiveJob(job);
  }, [selectedJobId]);

  const handleAddMember = () => {
    if (!newMemberName) return;

    const newRecord: TechnicianCoordinationRecord = {
      id: `coord_${selectedJobId}_${Date.now()}`,
      jobId: selectedJobId,
      memberId: `mem_${Date.now()}`,
      leadTechnicianId: user.id,
      assistantIds: [],
      scheduledShiftDate: new Date().toISOString(),
      safetyBriefingAcknowledged: false,
      memberName: newMemberName,
      memberRole: newMemberRole,
      phone: newMemberPhone || '+91 90000 00000',
      isSubcontractor: newMemberRole.includes('subcontractor') || newMemberRole.includes('civil'),
      safetyBriefingSigned: false,
      checkInStatus: 'assigned',
      assignedTaskScope: newMemberScope || 'Assigned Subcontractor Task'
    };

    setTeamMembers(prev => [...prev, newRecord]);
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberScope('');
    setShowAddMemberModal(false);
  };

  const toggleSafetyBriefing = (id: string) => {
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, safetyBriefingSigned: !m.safetyBriefingSigned } : m));
  };

  return (
    <div className="min-h-screen bg-alabaster pb-24 text-charcoal">
      {/* Top Header */}
      <div className="bg-white border-b border-[rgba(184,135,61,0.2)] sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-alabaster transition-colors border border-[rgba(184,135,61,0.15)] text-charcoal"
              >
                <ChevronLeft className="w-5 h-5 text-antiquegold" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-royalemerald" />
                <h1 className="font-serif text-lg font-bold text-charcoal">Onsite Team & Subcontractor Coordination</h1>
              </div>
              <p className="text-xs text-warmgray">Role Delegation, Safety Briefings & Handover Management</p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowAddMemberModal(true)}
            className="text-xs px-3 py-2 flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Crew
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        <Card className="p-4 space-y-2">
          <span className="text-[10px] font-mono uppercase text-warmgray">Active Job #{selectedJobId}</span>
          <h2 className="font-serif text-base font-bold text-charcoal">
            {activeJob?.elevatorSpec.buildingName || 'Kothrud Commercial Elevator'}
          </h2>
          <p className="text-xs text-warmgray">
            Lead Technician: Ramesh Patil • Active Crew Count: {teamMembers.length}
          </p>
        </Card>

        {/* Team Members List */}
        <div className="space-y-3">
          <h3 className="font-serif text-sm font-bold text-charcoal px-1">Assigned Deployment Crew</h3>

          {teamMembers.map((member) => (
            <Card key={member.id} className="p-4 space-y-3 border border-[rgba(184,135,61,0.15)]">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2.5">
                  <div className="p-2.5 rounded-xl bg-alabaster border border-[rgba(184,135,61,0.2)] text-antiquegold">
                    <HardHat className="w-5 h-5 text-antiquegold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-charcoal">{member.memberName}</span>
                      {member.isSubcontractor && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-antiquegold/10 text-antiquegold font-bold border border-antiquegold/20">
                          Subcontractor
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-warmgray">{member.phone} • {member.memberRole.replace('_', ' ').toUpperCase()}</p>
                  </div>
                </div>

                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                  member.checkInStatus === 'onsite_active' ? 'bg-royalemerald/10 text-royalemerald' : 'bg-warmgray/10 text-warmgray'
                }`}>
                  {member.checkInStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="p-2.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)] text-xs text-charcoal">
                <span className="font-semibold text-warmgray block text-[10px] uppercase">Assigned Scope</span>
                <span>{member.assignedTaskScope}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[rgba(184,135,61,0.1)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={member.safetyBriefingSigned}
                    onChange={() => toggleSafetyBriefing(member.id)}
                    className="rounded text-antiquegold focus:ring-antiquegold"
                  />
                  <span className="text-warmgray">Safety Briefing Signed</span>
                </label>

                {member.safetyBriefingSigned ? (
                  <span className="text-royalemerald font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Briefed
                  </span>
                ) : (
                  <span className="text-warning font-bold text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Pending Briefing
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 border border-antiquegold shadow-2xl"
            >
              <h3 className="font-serif text-sm font-bold text-charcoal">Add Technician / Subcontractor to Crew</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-warmgray mb-1">Name / Firm Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Suresh Shinde (Assistant Tech)"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full p-2.5 bg-alabaster border border-[rgba(184,135,61,0.25)] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-warmgray mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="w-full p-2.5 bg-alabaster border border-[rgba(184,135,61,0.25)] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-warmgray mb-1">Role / Subcontractor Type</label>
                  <select
                    value={newMemberRole}
                    onChange={(e: any) => setNewMemberRole(e.target.value)}
                    className="w-full p-2.5 bg-alabaster border border-[rgba(184,135,61,0.25)] rounded-xl text-xs"
                  >
                    <option value="assistant_technician">Assistant Technician</option>
                    <option value="subcontractor_scaffolding">Subcontractor — Scaffolding</option>
                    <option value="civil_contractor">Civil Shaft Alignment Contractor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-warmgray mb-1">Assigned Task Scope</label>
                  <input
                    type="text"
                    placeholder="e.g. Shaft bracket drilling & civil wall anchors"
                    value={newMemberScope}
                    onChange={(e) => setNewMemberScope(e.target.value)}
                    className="w-full p-2.5 bg-alabaster border border-[rgba(184,135,61,0.25)] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" onClick={() => setShowAddMemberModal(false)} className="w-1/2 text-xs">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddMember} className="w-1/2 text-xs">
                  Add to Deployment
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
