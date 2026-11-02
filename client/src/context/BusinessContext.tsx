import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { IBusiness, IBusinessContextType } from '../types';
import businessService from '../services/businessService';
import { useAuth } from './AuthContext';

const BusinessContext = createContext<IBusinessContextType | null>(null);

const DEFAULT_BUSINESSES: IBusiness[] = [
  {
    id: '60d0fe4f5311236168a109ca',
    _id: '60d0fe4f5311236168a109ca',
    name: 'Nexus Technologies Inc.',
    slug: 'nexus-technologies',
    industry: 'Enterprise Software & Cloud Platforms',
    category: 'Information Technology',
    plan: 'Enterprise Scale',
    currency: 'USD',
    role: 'Owner',
    membersCount: 24,
    status: 'ACTIVE',
    businessEmail: 'contact@nexuscorp.com',
    ownerName: 'Julian Vance',
    ownerEmail: 'owner@nexuscorp.com'
  },
  {
    id: '60d0fe4f5311236168a109cc',
    _id: '60d0fe4f5311236168a109cc',
    name: 'Vanguard Aerospace Dynamics',
    slug: 'vanguard-aerospace',
    industry: 'Aerospace Engineering',
    category: 'Manufacturing',
    plan: 'Starter Tier',
    currency: 'USD',
    role: 'Owner',
    membersCount: 6,
    status: 'PENDING',
    businessEmail: 'apply@vanguard-aero.com',
    ownerName: 'Julian Vance',
    ownerEmail: 'owner@nexuscorp.com'
  }
];

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [businesses, setBusinesses] = useState<IBusiness[]>(DEFAULT_BUSINESSES);
  const [activeBusinessId, setActiveBusinessId] = useState<string>(() => {
    return localStorage.getItem('biznexus_active_business_id') || '60d0fe4f5311236168a109ca';
  });

  const refreshBusinesses = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;
    try {
      const serverBusinesses = await businessService.getMyBusinesses();
      if (serverBusinesses && serverBusinesses.length > 0) {
        const formatted: IBusiness[] = serverBusinesses.map((b) => ({
          ...b,
          id: b._id || b.id
        }));
        setBusinesses(formatted);

        // Keep active business if still in the list, else set to first or user's bound business
        setActiveBusinessId((currentId) => {
          const match = formatted.find((b) => b.id === currentId || b._id === currentId);
          if (match) return match.id || (match._id as string);
          if (user?.businessId) {
            const userBiz = formatted.find((b) => b.id === user.businessId || b._id === user.businessId);
            if (userBiz) return userBiz.id || (userBiz._id as string);
          }
          return formatted[0].id || (formatted[0]._id as string);
        });
      }
    } catch {
      // Fallback to existing businesses if offline
    }
  }, [isAuthenticated, user?.businessId]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshBusinesses();
    }
  }, [isAuthenticated, refreshBusinesses]);

  const activeBusiness =
    businesses.find((b) => b.id === activeBusinessId || b._id === activeBusinessId) || businesses[0];

  const switchBusiness = (businessId: string): void => {
    const exists = businesses.find((b) => b.id === businessId || b._id === businessId);
    if (exists) {
      const idToSet = exists.id || (exists._id as string);
      setActiveBusinessId(idToSet);
      localStorage.setItem('biznexus_active_business_id', idToSet);
    }
  };

  const addBusiness = (newBiz: Partial<IBusiness> & { name: string; slug: string }): IBusiness => {
    const created: IBusiness = {
      id: `biz_${Date.now().toString(36)}`,
      role: 'Owner',
      plan: 'Starter Tier',
      currency: 'USD',
      membersCount: 1,
      industry: 'General Enterprise',
      status: 'ACTIVE',
      ...newBiz
    };
    setBusinesses((prev) => [created, ...prev]);
    setActiveBusinessId(created.id);
    localStorage.setItem('biznexus_active_business_id', created.id);
    return created;
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        activeBusiness,
        switchBusiness,
        addBusiness,
        refreshBusinesses
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = (): IBusinessContextType => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export default BusinessContext;
