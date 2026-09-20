import React from 'react';
import { User } from '../types';
import { SupplierDashboard } from '../components/Dashboards';

interface SupplierRouterProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function SupplierRouter({ currentUser, activeTab, setActiveTab }: SupplierRouterProps) {
  return (
    <>
          {currentUser.role === 'supplier' && activeTab === 'Home' && <SupplierDashboard user={currentUser} />}
    </>
  );
}
