import React from 'react';
import { User } from '../types';
import { TechnicianHomeMyJobsScreen } from '../components/TechnicianHomeMyJobsScreen';

interface TechnicianRouterProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setSelectedTechJobId: (id: string) => void;
}

export function TechnicianRouter({ currentUser, activeTab, setActiveTab, setSelectedTechJobId }: TechnicianRouterProps) {
  return (
    <>
          {currentUser.role === 'technician' && activeTab === 'Home' && (
            <TechnicianHomeMyJobsScreen
              user={currentUser}
              onSelectJob={(jobId) => {
                setSelectedTechJobId(jobId);
                setActiveTab('JobDetailSiteInfo');
              }}
              onOpenSos={() => {
                setActiveTab('SOSDesk');
              }}
            />
          )}
    </>
  );
}
