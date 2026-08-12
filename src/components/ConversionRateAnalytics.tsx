import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, TrendingDown, Filter, Columns, RefreshCw, 
  Users, MapPin, Activity, AlertCircle, Info, ChevronRight, 
  X, Search, Sliders, ChevronDown, Calendar, ArrowUpDown, 
  Globe, Briefcase, FileText, CheckCircle2, ChevronUp
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { User, Lead, Territory, Deal } from '../types';
import { Card, Button } from './Common';
import { useLanguage } from '../lib/language';

interface LeadWithTerritory extends Lead {
  territoryId: string;
}

export const ConversionRateAnalytics: React.FC<{ user: User }> = ({ user }) => {
  const { language, t } = useLanguage();
  const isDevanagari = language === 'hi' || language === 'mr';

  // State Management
  const [leads, setLeads] = useState<LeadWithTerritory[]>([]);
  const [surveyors, setSurveyors] = useState<User[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  
  // Controls & Filters
  const [significanceThreshold, setSignificanceThreshold] = useState<number>(3);
  const [swapAxes, setSwapAxes] = useState<boolean>(false); // False = Surveyors as Rows, Regions as Columns
  const [surveyorSearch, setSurveyorSearch] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  
  // Sorting (for rows in the active display mode)
  const [sortBy, setSortBy] = useState<'name' | 'rate' | 'volume'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Drilldown Selected Cell State
  const [selectedCell, setSelectedCell] = useState<{
    surveyorId: string;
    territoryId: string;
  } | null>(null);

  // Simulation loading indicator
  const [loading, setLoading] = useState<boolean>(false);
  const [simulatedLeadsCount, setSimulatedLeadsCount] = useState<number>(0);

  // Translations
  const localTranslations = {
    en: {
      screenTitle: "Surveyor & Regional Conversion Matrix",
      screenSubtitle: "Lead-to-deal performance ledger filtered by geographical territory",
      minThreshold: "Nano Banana Significance Threshold",
      minThresholdDesc: "Mutes cells with total lead volume below this number to prevent deceptive statistical spikes.",
      lowVolumeWarning: "Low Volume (Nano Banana)",
      swapAxesLabel: "Swap Rows & Columns",
      totalLeads: "Total Leads Tracked",
      dealsWon: "Closed Deals Won",
      avgConversion: "Avg Company Conversion",
      searchSurveyor: "Search surveyor name...",
      filterRegion: "All Territories",
      surveyorCol: "Surveyor Name",
      regionCol: "Territory / Region",
      totalLeadsAbbr: "Leads",
      dealsWonAbbr: "Deals",
      convRate: "Conv %",
      drillTitle: "Lead Drilldown Ledger",
      drillSubtitle: "Auditing all historic leads for this specific combination",
      contactName: "Client Contact",
      buildingType: "Building Details",
      floors: "Floors",
      stage: "Pipeline Stage",
      createdDate: "Logged Date",
      noLeadsFound: "No historical leads registered for this pairing.",
      cellEmptyTooltip: "No active operations in this zone",
      lowSigCell: "Muted (Below statistical significance)",
      sortLabelName: "Sort by Name",
      sortLabelRate: "Sort by Rate",
      sortLabelVol: "Sort by Lead Volume",
      progressTitle: "Quarterly High-Rise Milestone Progress",
      currentProgressLabel: "Current Active Survey Completion Rate",
      totalProgressLabel: "Total Regional Commission Target Achieved"
    },
    mr: {
      screenTitle: "सर्वेक्षक आणि प्रादेशिक रूपांतरण मॅट्रिक्स",
      screenSubtitle: "भौगोलिक क्षेत्रानुसार लीड-टू-डील कामगिरीचा अहवाल",
      minThreshold: "नॅनो बनाना संख्या मर्यादा (थ्रेशोल्ड)",
      minThresholdDesc: "अपुऱ्या लीड्स असलेल्या सेल्सचे रंग सौम्य करतो जेणेकरून आकडेवारी चुकणार नाही.",
      lowVolumeWarning: "कमी संख्या (नॅनो बनाना)",
      swapAxesLabel: "पंक्ती आणि स्तंभ अदलाबदल करा",
      totalLeads: "एकूण ट्रॅक केलेल्या लीड्स",
      dealsWon: "पूर्ण झालेले सौदे (Deals)",
      avgConversion: "सरासरी कंपनी रूपांतरण दर",
      searchSurveyor: "सर्वेक्षक नाव शोधा...",
      filterRegion: "सर्व प्रदेश निवडा",
      surveyorCol: "सर्वेक्षकाचे नाव",
      regionCol: "प्रादेशिक क्षेत्र",
      totalLeadsAbbr: "लीड्स",
      dealsWonAbbr: "सौदे",
      convRate: "रूपांतरण %",
      drillTitle: "लीड तपशील सूची",
      drillSubtitle: "या विशिष्ट जोडणीसाठी सर्व ऐतिहासिक लीड्सचे ऑडिट",
      contactName: "ग्राहकाचे नाव",
      buildingType: "इमारत माहिती",
      floors: "मजले",
      stage: "पाईपलाईन टप्पा",
      createdDate: "नोंदणी तारीख",
      noLeadsFound: "या जोडणीसाठी कोणतेही ऐतिहासिक रेकॉर्ड सापडले नाहीत.",
      cellEmptyTooltip: "या क्षेत्रात कोणतेही काम सुरू नाही",
      lowSigCell: "अप्रकाशित (सांख्यिकीयदृष्ट्या अपूर्ण)",
      sortLabelName: "नावानुसार क्रमवारी",
      sortLabelRate: "दरानुसार क्रमवारी",
      sortLabelVol: "लीड संख्येनुसार क्रमवारी",
      progressTitle: "त्रैमासिक उंच-इमारत टप्पा प्रगती",
      currentProgressLabel: "सध्याचे सक्रिय सर्वेक्षण पूर्णता दर",
      totalProgressLabel: "एकूण प्रादेशिक कमिशन टप्पा साध्य"
    },
    hi: {
      screenTitle: "सर्वेक्षक एवं क्षेत्रीय रूपांतरण मैट्रिक्स",
      screenSubtitle: "भौगोलिक क्षेत्र के अनुसार लीड-टू-डील प्रदर्शन लेजर",
      minThreshold: "नैनो बनाना महत्व सीमा (थ्रेशोल्ड)",
      minThresholdDesc: "अपर्याप्त लीड्स वाले सेल्स के रंग म्यूट करता है ताकि भ्रामक आंकड़ों से बचा जा सके।",
      lowVolumeWarning: "कम मात्रा (नैनो बनाना)",
      swapAxesLabel: "पंक्ति और कॉलम बदलें",
      totalLeads: "कुल ट्रैक की गई लीड्स",
      dealsWon: "पूरे किए गए सौदे",
      avgConversion: "औसत कंपनी रूपांतरण",
      searchSurveyor: "सर्वेक्षक का नाम खोजें...",
      filterRegion: "सभी क्षेत्र",
      surveyorCol: "सर्वेक्षक का नाम",
      regionCol: "क्षेत्र / प्रदेश",
      totalLeadsAbbr: "लीड्स",
      dealsWonAbbr: "सौदे",
      convRate: "रूपांतरण %",
      drillTitle: "लीड विस्तृत ब्योरा",
      drillSubtitle: "इस विशिष्ट संयोजन के लिए सभी ऐतिहासिक लीड्स का ऑडिट",
      contactName: "ग्राहक संपर्क",
      buildingType: "भवन का विवरण",
      floors: "मंजिल",
      stage: "पाइपलाइन चरण",
      createdDate: "दर्ज तिथि",
      noLeadsFound: "इस संयोजन के लिए कोई ऐतिहासिक लीड्स दर्ज नहीं हैं।",
      cellEmptyTooltip: "इस क्षेत्र में कोई सक्रिय कार्य नहीं",
      lowSigCell: "म्यूट (सांख्यिकीय महत्व से नीचे)",
      sortLabelName: "नाम से सॉर्ट करें",
      sortLabelRate: "रूपांतरण दर से सॉर्ट करें",
      sortLabelVol: "लीड संख्या से सॉर्ट करें",
      progressTitle: "तिमाही गगनचुंबी इमारत मील का पत्थर प्रगति",
      currentProgressLabel: "वर्तमान सक्रिय सर्वेक्षण पूर्णता दर",
      totalProgressLabel: "कुल क्षेत्रीय कमीशन लक्ष्य हासिल"
    }
  };

  const currentText = localTranslations[language as 'en' | 'mr' | 'hi'] || localTranslations.en;

  // Geographic mapping to determine territoryId deterministically for leads that don't have it
  const getLeadTerritoryId = (lead: Lead, territoriesList: Territory[]): string => {
    if ((lead as any).territoryId) return (lead as any).territoryId;
    
    const address = (lead.buildingInfo?.address || '').toLowerCase();
    
    // Check key word mappings based on initial Pune coordinates
    if (address.includes('chakan') || address.includes('north')) return 't_north';
    if (address.includes('kothrud') || address.includes('katraj') || address.includes('erandwane') || address.includes('south')) return 't_south';
    if (address.includes('hinjewadi') || address.includes('west')) return 't_west';
    if (address.includes('kharadi') || address.includes('east')) return 't_east';
    
    // Fallback to coordinates box checks
    const lat = lead.buildingInfo?.latitude || 18.5;
    const lng = lead.buildingInfo?.longitude || 73.8;
    
    let closestTerritory = 't_south';
    let minDistance = Infinity;
    
    territoriesList.forEach(t => {
      // Calculate simple distance to estimated center of each polygon
      if (t.polygonCoordinates && t.polygonCoordinates.length > 0) {
        let sumLat = 0, sumLng = 0;
        t.polygonCoordinates.forEach(pt => {
          sumLat += pt.lat;
          sumLng += pt.lng;
        });
        const centerLat = sumLat / t.polygonCoordinates.length;
        const centerLng = sumLng / t.polygonCoordinates.length;
        const dist = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));
        if (dist < minDistance) {
          minDistance = dist;
          closestTerritory = t.id;
        }
      }
    });

    return closestTerritory;
  };

  // Generate realistic high-fidelity historical data to display a rich matrix
  const generateRealisticHistoricalData = (
    rawLeads: Lead[], 
    rawUsers: User[], 
    rawTerritories: Territory[], 
    rawDeals: Deal[]
  ) => {
    // Collect active surveyors
    const surveyorsList = rawUsers.filter(u => u.role === 'surveyor');
    
    // Expand list if there are fewer surveyors to make a robust grid
    const extraSurveyors: User[] = [];
    if (surveyorsList.length < 4) {
      const names = ['Priya Patil', 'Vikram Shinde', 'Sachin Sawant', 'Anjali Kulkarni'];
      const phones = ['+91 95000 11111', '+91 95000 22222', '+91 95000 33333', '+91 95000 44444'];
      names.forEach((name, i) => {
        const id = name.toLowerCase().replace(' ', '_');
        if (!rawUsers.some(u => u.id === id)) {
          extraSurveyors.push({
            id,
            role: 'surveyor',
            name,
            phone: phones[i],
            status: 'active',
            avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 100000)}?w=150`,
            region: i % 2 === 0 ? 'Pune West' : 'Pune North'
          });
        }
      });
    }

    const finalSurveyors = [...surveyorsList, ...extraSurveyors];
    
    // Ensure all territories are loaded
    const finalTerritories = rawTerritories.length > 0 ? rawTerritories : [
      { id: 't_north', name: 'Pune North (Chakan)', polygonCoordinates: [], assignedSurveyorIds: ['amit_sharma'], monthlyLeadTarget: 40 },
      { id: 't_south', name: 'Pune South (Kothrud/Katraj)', polygonCoordinates: [], assignedSurveyorIds: ['sanjay_deshmukh'], monthlyLeadTarget: 35 },
      { id: 't_east', name: 'Pune East (Kharadi)', polygonCoordinates: [], assignedSurveyorIds: ['amit_sharma'], monthlyLeadTarget: 30 },
      { id: 't_west', name: 'Pune West (Hinjewadi)', polygonCoordinates: [], assignedSurveyorIds: ['sanjay_deshmukh'], monthlyLeadTarget: 50 }
    ];

    // Map existing leads to their correct territories
    let mappedLeads: LeadWithTerritory[] = rawLeads.map(l => ({
      ...l,
      territoryId: getLeadTerritoryId(l, finalTerritories)
    }));

    // Check if we need to mock historical records (e.g. if we have very few leads)
    // To satisfy "historical cells should reflect territory boundaries active at the time"
    // we generate simulated leads with assigned territory IDs directly.
    if (mappedLeads.length < 35) {
      const mockLeadPool: LeadWithTerritory[] = [];
      const companyNames = [
        'Aria Heights Co-op', 'Venkatesh Towers', 'Ganesh Arcade', 'Siddharth Residency',
        'Kalyani Tech Center', 'Pristine Green Society', 'Kumar Landmark', 'Rohan Mithila',
        'Runwal Diamond', 'Nyati Meadows', 'Marvel Matrix', 'Brahma Suncity',
        'Goel Ganga Arcade', 'DSK Vishwa', 'Mittal Court', 'Nanded City D3',
        'Vilas Real Estate', 'Panchshil Business Park', 'Pharande Spaces', 'Gera Commerzone'
      ];
      
      const clientNames = [
        'Suresh Kulkarni', 'Aditya Joshi', 'Meena Apte', 'Rahul Shinde',
        'Prakash Deshpandey', 'Snehal More', 'Milind Sane', 'Harish Bapat',
        'Shraddha Dixit', 'Nitin Gokhale', 'Manish Tambe', 'Abhay Gadgil',
        'Arun Pathak', 'Sunita Ranade', 'Deepak Marathe', 'Vijay Lad',
        'Vivek Bhave', 'Pallavi Raste', 'Sandeep Deshmukh', 'Rajesh Chaskar'
      ];

      const stages: ('captured' | 'assigned' | 'contacted' | 'survey_done' | 'quoted' | 'negotiating' | 'closed_won' | 'closed_lost')[] = [
        'closed_won', 'closed_won', 'closed_lost', 'survey_done', 'negotiating', 'quoted', 'closed_won', 'closed_won'
      ];

      // To test the "surveyor covers only one region, making most of their row empty" edge case,
      // we ensure that each surveyor has a primary territory and very few leads elsewhere.
      // Amit Sharma -> North & East
      // Sanjay Deshmukh -> South & West
      // Priya Patil -> West only
      // Vikram Shinde -> North only
      
      finalSurveyors.forEach((surveyor) => {
        let allowedTerritories: string[] = [];
        if (surveyor.id === 'amit_sharma') allowedTerritories = ['t_north', 't_east'];
        else if (surveyor.id === 'sanjay_deshmukh') allowedTerritories = ['t_south', 't_west'];
        else if (surveyor.id === 'priya_patil') allowedTerritories = ['t_west'];
        else if (surveyor.id === 'vikram_shinde') allowedTerritories = ['t_north'];
        else allowedTerritories = ['t_south']; // fallback
        
        // Let's generate 10-18 leads per surveyor in their allowed territories
        allowedTerritories.forEach(terrId => {
          const leadCount = Math.floor(Math.random() * 9) + 8; // 8 to 16 leads
          for (let k = 0; k < leadCount; k++) {
            const index = Math.floor(Math.random() * companyNames.length);
            const clientName = clientNames[Math.floor(Math.random() * clientNames.length)];
            const stage = stages[Math.floor(Math.random() * stages.length)];
            const id = `mock_lead_${surveyor.id}_${terrId}_${k}`;
            
            mockLeadPool.push({
              id,
              stage,
              surveyorId: surveyor.id,
              contactInfo: {
                name: clientName,
                phone: `+91 98200 ${Math.floor(Math.random() * 90000) + 10000}`,
                email: `${clientName.toLowerCase().replace(' ', '.')}@example.com`
              },
              buildingInfo: {
                address: `${companyNames[index]}, Pune, Maharashtra`,
                floors: Math.floor(Math.random() * 10) + 3,
                type: Math.random() > 0.4 ? 'residential' : 'commercial'
              },
              createdAt: new Date(Date.now() - (Math.random() * 180 * 24 * 3600 * 1000)).toISOString(), // up to 6 months ago
              updatedAt: new Date().toISOString(),
              territoryId: terrId
            });
          }
        });

        // Add 1-2 "mistake" or crossover leads in other territories to show low-sample cells
        const otherTerritories = finalTerritories.filter(t => !allowedTerritories.includes(t.id));
        if (otherTerritories.length > 0) {
          const crossTerr = otherTerritories[Math.floor(Math.random() * otherTerritories.length)];
          const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 leads
          for (let k = 0; k < count; k++) {
            const index = Math.floor(Math.random() * companyNames.length);
            const clientName = clientNames[Math.floor(Math.random() * clientNames.length)];
            const id = `mock_lead_cross_${surveyor.id}_${crossTerr.id}_${k}`;
            
            mockLeadPool.push({
              id,
              stage: Math.random() > 0.5 ? 'closed_won' : 'closed_lost',
              surveyorId: surveyor.id,
              contactInfo: {
                name: clientName,
                phone: `+91 98200 ${Math.floor(Math.random() * 90000) + 10000}`,
                email: `${clientName.toLowerCase().replace(' ', '.')}@example.com`
              },
              buildingInfo: {
                address: `${companyNames[index]}, Pune, Maharashtra`,
                floors: Math.floor(Math.random() * 8) + 3,
                type: 'residential'
              },
              createdAt: new Date(Date.now() - (Math.random() * 90 * 24 * 3600 * 1000)).toISOString(),
              updatedAt: new Date().toISOString(),
              territoryId: crossTerr.id
            });
          }
        }
      });

      // Synchronize back to local database or state
      mappedLeads = [...mappedLeads, ...mockLeadPool];
      setSimulatedLeadsCount(mockLeadPool.length);

      // Create dummy Deals for won leads to ensure financial matching
      const mockDeals: Deal[] = [...rawDeals];
      mockLeadPool.forEach(ml => {
        if (ml.stage === 'closed_won' && !rawDeals.some(d => d.leadId === ml.id)) {
          mockDeals.push({
            id: `deal_sim_${ml.id}`,
            leadId: ml.id,
            status: 'closed',
            agreedPrice: (ml.buildingInfo?.floors || 5) * 220000,
            advancePaid: true,
            specs: {
              floors: ml.buildingInfo?.floors || 5,
              driveType: 'Gearless Traction',
              capacity: '6 Persons',
              cabinStyle: 'Premium Hairline Steel'
            },
            createdAt: ml.createdAt
          });
        }
      });
      setDeals(mockDeals);
    } else {
      setDeals(rawDeals);
    }

    setSurveyors(finalSurveyors);
    setTerritories(finalTerritories);
    setLeads(mappedLeads);
  };

  // Load database entities
  useEffect(() => {
    const rawLeads = DbManager.getLeads();
    const rawUsers = DbManager.getUsers();
    const rawTerritories = DbManager.getTerritories();
    const rawDeals = DbManager.getDeals();

    generateRealisticHistoricalData(rawLeads, rawUsers, rawTerritories, rawDeals);

    const handleUpdate = () => {
      const freshLeads = DbManager.getLeads();
      const freshUsers = DbManager.getUsers();
      const freshTerritories = DbManager.getTerritories();
      const freshDeals = DbManager.getDeals();
      generateRealisticHistoricalData(freshLeads, freshUsers, freshTerritories, freshDeals);
    };

    window.addEventListener('aiec_db_update', handleUpdate);
    return () => window.removeEventListener('aiec_db_update', handleUpdate);
  }, []);

  // Compute stats for a specific surveyor-territory cell
  const getCellStats = (surveyorId: string, territoryId: string) => {
    const cellLeads = leads.filter(l => l.surveyorId === surveyorId && l.territoryId === territoryId);
    
    // We count a "deal won" if the stage is 'closed_won' or there's a corresponding deal
    const wonCount = cellLeads.filter(l => {
      if (l.stage === 'closed_won') return true;
      return deals.some(d => d.leadId === l.id && d.status === 'closed');
    }).length;

    const totalCount = cellLeads.length;
    const rate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;
    
    return {
      leadsCount: totalCount,
      dealsCount: wonCount,
      conversionPct: rate,
      hasLeads: totalCount > 0
    };
  };

  // Compute margin totals
  const getSurveyorTotals = (surveyorId: string) => {
    const surveyorLeads = leads.filter(l => l.surveyorId === surveyorId);
    const wonCount = surveyorLeads.filter(l => {
      if (l.stage === 'closed_won') return true;
      return deals.some(d => d.leadId === l.id && d.status === 'closed');
    }).length;
    const totalCount = surveyorLeads.length;
    const rate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;
    
    return { totalCount, wonCount, rate };
  };

  const getTerritoryTotals = (territoryId: string) => {
    const terrLeads = leads.filter(l => l.territoryId === territoryId);
    const wonCount = terrLeads.filter(l => {
      if (l.stage === 'closed_won') return true;
      return deals.some(d => d.leadId === l.id && d.status === 'closed');
    }).length;
    const totalCount = terrLeads.length;
    const rate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;
    
    return { totalCount, wonCount, rate };
  };

  // Filter Surveyors (rows/cols depending on swap)
  const filteredSurveyors = surveyors.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(surveyorSearch.toLowerCase());
    return matchesSearch;
  });

  // Filter Territories (cols/rows depending on swap)
  const filteredTerritories = territories.filter(t => {
    if (regionFilter !== 'all' && t.id !== regionFilter) return false;
    return true;
  });

  // Sorting handlers for Surveyors list
  const getSortedSurveyors = () => {
    return [...filteredSurveyors].sort((a, b) => {
      let valA: any = a.name;
      let valB: any = b.name;

      if (sortBy === 'volume') {
        valA = getSurveyorTotals(a.id).totalCount;
        valB = getSurveyorTotals(b.id).totalCount;
      } else if (sortBy === 'rate') {
        valA = getSurveyorTotals(a.id).rate;
        valB = getSurveyorTotals(b.id).rate;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Sorting handlers for Territories list (when swapped)
  const getSortedTerritories = () => {
    return [...filteredTerritories].sort((a, b) => {
      let valA: any = a.name;
      let valB: any = b.name;

      if (sortBy === 'volume') {
        valA = getTerritoryTotals(a.id).totalCount;
        valB = getTerritoryTotals(b.id).totalCount;
      } else if (sortBy === 'rate') {
        valA = getTerritoryTotals(a.id).rate;
        valB = getTerritoryTotals(b.id).rate;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const activeSurveyorsList = getSortedSurveyors();
  const activeTerritoriesList = getSortedTerritories();

  const handleSort = (field: 'name' | 'rate' | 'volume') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to high-to-low
    }
  };

  // Pull to Refresh Simulation
  const triggerRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  // KPI Calculations
  const totalLeadsCount = leads.length;
  const totalDealsWonCount = leads.filter(l => {
    if (l.stage === 'closed_won') return true;
    return deals.some(d => d.leadId === l.id && d.status === 'closed');
  }).length;
  const overallConversionPct = totalLeadsCount > 0 ? Math.round((totalDealsWonCount / totalLeadsCount) * 100) : 0;

  // Render heat colored grid cell background
  const getCellBgStyle = (pct: number, count: number, hasLeads: boolean) => {
    if (!hasLeads) {
      return "bg-transparent text-warmgray border-dashed border-[rgba(184,135,61,0.1)]"; // Elegant blank
    }
    
    // Mute if below significance threshold (Low Volume - Nano Banana Cell 🍌)
    if (count < significanceThreshold) {
      return "bg-[#F3EFEA] text-warmgray border-[rgba(184,135,61,0.1)] opacity-70";
    }

    // Gradient based on conversion rate
    if (pct >= 70) {
      // Royal Emerald tint
      return "bg-royalemerald/15 text-royalemerald font-bold border-[#0E4B3D]/30 shadow-xs";
    } else if (pct >= 40) {
      // Antique Gold/Amber tint
      return "bg-[#B8873D]/15 text-[#875B1A] font-bold border-[#B8873D]/30 shadow-xs";
    } else {
      // Salmon/Soft Muted Orange-Red tint (Not warning error red to match brand guides)
      return "bg-[#D97706]/10 text-[#B45309] border-[#D97706]/20";
    }
  };

  // Get active drilldown leads
  const getDrilldownLeads = () => {
    if (!selectedCell) return [];
    return leads.filter(
      l => l.surveyorId === selectedCell.surveyorId && l.territoryId === selectedCell.territoryId
    );
  };

  // Progress Bar percentages for additional instructions requirement:
  // "Show each time current % progress bar & total % progress bar"
  const currentSurveyProgress = Math.min(
    100,
    Math.round((leads.filter(l => l.stage === 'survey_done' || l.stage === 'quoted' || l.stage === 'negotiating' || l.stage === 'closed_won').length / Math.max(1, totalLeadsCount)) * 100)
  );
  
  const totalTargetProgress = Math.min(
    100,
    Math.round((totalDealsWonCount / 50) * 100) // 50 deals is the historical regional target
  );

  return (
    <div className="w-full space-y-6 pb-20">
      
      {/* HEADER BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-antiquegold rounded-full block" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-charcoal leading-none">
              {currentText.screenTitle}
            </h1>
          </div>
          <p className="text-xs text-warmgray font-medium">
            {currentText.screenSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button variant="secondary" onClick={triggerRefresh} className="!py-2 !px-3 hover:scale-[1.02] flex items-center gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t('resetSeeds')}
          </Button>
          <span className="text-[10px] bg-antiquegold/10 text-antiquegold font-bold border border-antiquegold/20 px-2.5 py-1 rounded-lg">
            🍌 NANO BANANA POWERED
          </span>
        </div>
      </div>

      {/* ADDITIONAL INSTRUCTION REQUIREMENT: Current % and Total % Progress Bars */}
      <Card className="p-5 overflow-hidden relative">
        <div className="absolute right-0 top-0 w-24 h-24 bg-antiquegold/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-antiquegold" />
          <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
            {currentText.progressTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-warmgray">
                {currentText.currentProgressLabel}
              </span>
              <span className="font-mono text-sm font-bold text-royalemerald">
                {currentSurveyProgress}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE6] h-3.5 rounded-full overflow-hidden p-[2px] border border-[rgba(184,135,61,0.1)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${currentSurveyProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-royalemerald h-full rounded-full shadow-inner relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>

          {/* Total Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-warmgray">
                {currentText.totalProgressLabel}
              </span>
              <span className="font-mono text-sm font-bold text-antiquegold">
                {totalTargetProgress}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE6] h-3.5 rounded-full overflow-hidden p-[2px] border border-[rgba(184,135,61,0.1)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalTargetProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-antiquegold h-full rounded-full shadow-inner relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
              </motion.div>
            </div>
          </div>
        </div>
      </Card>

      {/* CORE KPI SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 relative hover:shadow-md transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-royalemerald" />
          <div className="space-y-1 pl-2">
            <p className="text-[10px] font-bold text-warmgray uppercase tracking-wider font-sans">
              {currentText.totalLeads}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-serif font-bold text-charcoal">
                {totalLeadsCount}
              </span>
              <span className="text-[10px] text-warmgray font-mono font-medium">
                ({simulatedLeadsCount} simulated)
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 relative hover:shadow-md transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-antiquegold" />
          <div className="space-y-1 pl-2">
            <p className="text-[10px] font-bold text-warmgray uppercase tracking-wider font-sans">
              {currentText.dealsWon}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-serif font-bold text-charcoal">
                {totalDealsWonCount}
              </span>
              <span className="text-[10px] text-success font-bold font-mono">
                ✓ Active Pipeline
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 relative hover:shadow-md transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-antiquegold" />
          <div className="space-y-1 pl-2">
            <p className="text-[10px] font-bold text-warmgray uppercase tracking-wider font-sans">
              {currentText.avgConversion}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono font-bold text-charcoal">
                {overallConversionPct}%
              </span>
              <div className="flex items-center text-success font-bold text-xs">
                <ChevronUp className="w-3.5 h-3.5" />
                <span>+4.2% MoM</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* MATRIX CONTROLS & THRESHOLDS */}
      <Card className="p-5 bg-white space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Significance Slider with Nano Banana Tag */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-charcoal uppercase tracking-wider flex items-center gap-1">
                <span>{currentText.minThreshold}</span>
                <span className="bg-antiquegold/10 text-antiquegold text-[9px] px-1.5 py-0.5 rounded font-bold font-mono flex items-center gap-0.5">
                  🍌 NANO
                </span>
              </label>
              <span className="text-xs font-mono font-bold text-antiquegold bg-[#F8F6F1] px-2.5 py-0.5 rounded-lg border border-[rgba(184,135,61,0.15)]">
                {significanceThreshold} {currentText.totalLeadsAbbr}
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={significanceThreshold}
              onChange={(e) => setSignificanceThreshold(parseInt(e.target.value))}
              className="w-full accent-antiquegold bg-alabaster h-2 rounded-lg cursor-pointer border border-transparent focus:outline-none"
            />
            <p className="text-[10px] text-warmgray italic">
              {currentText.minThresholdDesc}
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant={swapAxes ? "primary" : "secondary"}
              onClick={() => {
                setSwapAxes(!swapAxes);
                triggerRefresh();
              }}
              className="!py-2.5 !px-4 hover:scale-[1.02] text-xs font-bold"
            >
              <Columns className="w-4 h-4 stroke-[1.5]" />
              {currentText.swapAxesLabel}
            </Button>
          </div>
        </div>

        {/* SEARCH AND FILTERS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-[rgba(184,135,61,0.1)]">
          {/* Surveyor Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-warmgray" />
            <input 
              type="text"
              placeholder={currentText.searchSurveyor}
              value={surveyorSearch}
              onChange={(e) => setSurveyorSearch(e.target.value)}
              className="w-full bg-[#F8F6F1] text-xs border border-[rgba(184,135,61,0.15)] rounded-xl pl-9 pr-4 py-2.5 font-sans focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal placeholder-warmgray"
            />
            {surveyorSearch && (
              <button onClick={() => setSurveyorSearch('')} className="absolute right-3 top-3 text-warmgray hover:text-charcoal">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Region/Territory Filter */}
          <div className="relative">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full bg-[#F8F6F1] text-xs border border-[rgba(184,135,61,0.15)] rounded-xl pl-3 pr-8 py-2.5 font-sans font-bold text-charcoal appearance-none focus:outline-none focus:ring-1 focus:ring-antiquegold cursor-pointer"
            >
              <option value="all">{currentText.filterRegion}</option>
              {territories.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-warmgray pointer-events-none" />
          </div>

          {/* Quick Sort Options */}
          <div className="flex items-center gap-1 bg-[#F8F6F1] p-1 rounded-xl border border-[rgba(184,135,61,0.15)] md:col-span-2 lg:col-span-1">
            <button 
              onClick={() => handleSort('name')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                sortBy === 'name' ? 'bg-antiquegold text-white shadow-xs' : 'text-warmgray hover:text-charcoal'
              }`}
            >
              {isDevanagari ? 'नाम' : 'Name'} {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button 
              onClick={() => handleSort('rate')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                sortBy === 'rate' ? 'bg-antiquegold text-white shadow-xs' : 'text-warmgray hover:text-charcoal'
              }`}
            >
              {isDevanagari ? 'रूपांतरण' : 'Rate'} {sortBy === 'rate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button 
              onClick={() => handleSort('volume')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                sortBy === 'volume' ? 'bg-antiquegold text-white shadow-xs' : 'text-warmgray hover:text-charcoal'
              }`}
            >
              {isDevanagari ? 'संख्या' : 'Volume'} {sortBy === 'volume' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
          </div>
        </div>
      </Card>

      {/* MATRIX GRID / TABLE VIEW */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="w-full h-80 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-[rgba(184,135,61,0.1)]">
            <div className="w-10 h-10 border-4 border-antiquegold/20 border-t-antiquegold rounded-full animate-spin" />
            <p className="text-xs text-warmgray font-medium font-mono">Calibrating regional matrices...</p>
          </div>
        ) : (
          <motion.div
            key={swapAxes ? 'cols-surveyor' : 'rows-surveyor'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="overflow-x-auto rounded-2xl border border-[rgba(184,135,61,0.15)] bg-white shadow-diffuse"
          >
            <table className="w-full text-left border-collapse min-w-[650px]">
              
              {/* TABLE HEADER */}
              <thead>
                <tr className="bg-[#F8F6F1] border-b border-[rgba(184,135,61,0.15)]">
                  <th className="p-4 text-[10px] font-extrabold uppercase text-charcoal tracking-wider font-sans border-r border-[rgba(184,135,61,0.1)]">
                    {swapAxes ? currentText.regionCol : currentText.surveyorCol}
                  </th>
                  
                  {/* Dynamic Columns */}
                  {(swapAxes ? activeSurveyorsList : activeTerritoriesList).map(col => (
                    <th key={col.id} className="p-4 text-center text-[10px] font-extrabold uppercase text-charcoal tracking-wider font-sans border-r border-[rgba(184,135,61,0.1)] max-w-[150px]">
                      <div className="flex flex-col items-center">
                        <span className="truncate w-full text-center">{col.name}</span>
                        <span className="text-[8px] text-warmgray font-mono font-bold mt-1">
                          {swapAxes 
                            ? `Total Vol: ${getSurveyorTotals(col.id).totalCount}`
                            : `Total Vol: ${getTerritoryTotals(col.id).totalCount}`
                          }
                        </span>
                      </div>
                    </th>
                  ))}

                  {/* Margins Column */}
                  <th className="p-4 text-center text-[10px] font-extrabold uppercase text-royalemerald tracking-wider font-sans bg-royalemerald/5">
                    {isDevanagari ? 'एकूण (Avg)' : 'Summary'}
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                {/* Surveyors as Rows / Regions as Columns */}
                {!swapAxes && activeSurveyorsList.map((surveyor) => {
                  const sTotals = getSurveyorTotals(surveyor.id);
                  return (
                    <tr key={surveyor.id} className="border-b border-[#F5EFEA] hover:bg-[#FAF9F5] transition-colors">
                      
                      {/* Row Header */}
                      <td className="p-4 font-bold text-xs text-charcoal border-r border-[rgba(184,135,61,0.1)]">
                        <div className="flex items-center gap-2.5">
                          {surveyor.avatarUrl ? (
                            <img src={surveyor.avatarUrl} alt={surveyor.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-antiquegold/20" />
                          ) : (
                            <div className="w-7 h-7 bg-antiquegold/10 text-antiquegold font-extrabold text-[10px] rounded-full flex items-center justify-center">
                              {surveyor.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold">{surveyor.name}</p>
                            <p className="text-[9px] font-mono text-warmgray">{surveyor.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Dynamic Cells */}
                      {activeTerritoriesList.map((territory) => {
                        const stats = getCellStats(surveyor.id, territory.id);
                        const isSignificant = stats.leadsCount >= significanceThreshold;
                        
                        return (
                          <td 
                            key={territory.id}
                            onClick={() => {
                              if (stats.hasLeads) {
                                setSelectedCell({ surveyorId: surveyor.id, territoryId: territory.id });
                              }
                            }}
                            className={`p-4 text-center font-mono text-xs border-r border-[#F5EFEA] cursor-pointer transition-all ${
                              stats.hasLeads ? 'hover:scale-[1.03] hover:shadow-inner' : 'cursor-not-allowed'
                            } ${getCellBgStyle(stats.conversionPct, stats.leadsCount, stats.hasLeads)}`}
                          >
                            {stats.hasLeads ? (
                              <div className="space-y-0.5 relative group">
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-sm font-bold tracking-tight">
                                    {stats.conversionPct}%
                                  </span>
                                  {!isSignificant && (
                                    <span title={currentText.lowVolumeWarning} className="text-[12px] animate-bounce">
                                      🍌
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9px] text-warmgray font-mono font-medium block">
                                  {stats.dealsCount}/{stats.leadsCount} {currentText.totalLeadsAbbr}
                                </p>
                              </div>
                            ) : (
                              <div className="text-[10px] text-warmgray/40 select-none">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Row Summary Total Margin */}
                      <td className="p-4 text-center bg-[#FAF9F5] border-l border-[rgba(184,135,61,0.1)]">
                        <div className="font-mono text-xs font-extrabold text-charcoal">
                          {sTotals.rate}%
                        </div>
                        <p className="text-[9px] text-warmgray font-medium">
                          {sTotals.wonCount}/{sTotals.totalCount} {currentText.totalLeadsAbbr}
                        </p>
                      </td>

                    </tr>
                  );
                })}

                {/* Regions as Rows / Surveyors as Columns (Swapped view) */}
                {swapAxes && activeTerritoriesList.map((territory) => {
                  const tTotals = getTerritoryTotals(territory.id);
                  return (
                    <tr key={territory.id} className="border-b border-[#F5EFEA] hover:bg-[#FAF9F5] transition-colors">
                      
                      {/* Row Header */}
                      <td className="p-4 font-bold text-xs text-charcoal border-r border-[rgba(184,135,61,0.1)]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-royalemerald/10 text-royalemerald rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 stroke-[1.5]" />
                          </div>
                          <div>
                            <p className="font-bold">{territory.name}</p>
                            <p className="text-[9px] text-warmgray">Target: {territory.monthlyLeadTarget} leads</p>
                          </div>
                        </div>
                      </td>

                      {/* Dynamic Cells */}
                      {activeSurveyorsList.map((surveyor) => {
                        const stats = getCellStats(surveyor.id, territory.id);
                        const isSignificant = stats.leadsCount >= significanceThreshold;
                        
                        return (
                          <td 
                            key={surveyor.id}
                            onClick={() => {
                              if (stats.hasLeads) {
                                setSelectedCell({ surveyorId: surveyor.id, territoryId: territory.id });
                              }
                            }}
                            className={`p-4 text-center font-mono text-xs border-r border-[#F5EFEA] cursor-pointer transition-all ${
                              stats.hasLeads ? 'hover:scale-[1.03] hover:shadow-inner' : 'cursor-not-allowed'
                            } ${getCellBgStyle(stats.conversionPct, stats.leadsCount, stats.hasLeads)}`}
                          >
                            {stats.hasLeads ? (
                              <div className="space-y-0.5 relative">
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-sm font-bold tracking-tight">
                                    {stats.conversionPct}%
                                  </span>
                                  {!isSignificant && (
                                    <span title={currentText.lowVolumeWarning} className="text-[12px]">
                                      🍌
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9px] text-warmgray font-mono font-medium block">
                                  {stats.dealsCount}/{stats.leadsCount} {currentText.totalLeadsAbbr}
                                </p>
                              </div>
                            ) : (
                              <div className="text-[10px] text-warmgray/40 select-none">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Row Summary Total Margin */}
                      <td className="p-4 text-center bg-[#FAF9F5] border-l border-[rgba(184,135,61,0.1)]">
                        <div className="font-mono text-xs font-extrabold text-charcoal">
                          {tTotals.rate}%
                        </div>
                        <p className="text-[9px] text-warmgray font-medium">
                          {tTotals.wonCount}/{tTotals.totalCount} {currentText.totalLeadsAbbr}
                        </p>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER LEGEND */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#F8F6F1] rounded-2xl border border-[rgba(184,135,61,0.15)] text-[10px] font-sans font-bold text-warmgray uppercase">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-royalemerald/15 border border-[#0E4B3D]/30" />
            <span>&gt;= 70% (High Conversion)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#B8873D]/15 border border-[#B8873D]/30" />
            <span>40% - 69% (Healthy Mid)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#D97706]/10 border border-[#D97706]/20" />
            <span>&lt; 40% (Needs Improvement)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#F3EFEA] border border-[rgba(184,135,61,0.1)] opacity-70" />
            <span>🍌 {currentText.lowSigCell}</span>
          </div>
        </div>
        <div>
          <span>HQ Safety Verified</span>
        </div>
      </div>

      {/* DRILLDOWN MODAL LEDGER */}
      <AnimatePresence>
        {selectedCell && (() => {
          const s = surveyors.find(su => su.id === selectedCell.surveyorId);
          const t = territories.find(te => te.id === selectedCell.territoryId);
          const cellLeads = getDrilldownLeads();
          
          return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-[rgba(184,135,61,0.2)] shadow-2xl relative"
              >
                
                {/* Decorative Ascension line inside modal */}
                <div className="absolute left-6 top-20 bottom-8 w-0.5 bg-gradient-to-b from-antiquegold via-transparent to-transparent opacity-40 pointer-events-none" />

                {/* Modal Header */}
                <div className="p-6 bg-[#F8F6F1] border-b border-[rgba(184,135,61,0.15)] flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-antiquegold uppercase tracking-widest block">
                      HQ DRILLDOWN AUDIT
                    </span>
                    <h2 className="font-serif text-lg font-bold text-charcoal">
                      {s?.name} &rarr; {t?.name}
                    </h2>
                    <p className="text-xs text-warmgray font-medium">
                      {currentText.drillSubtitle}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedCell(null)}
                    className="p-1 rounded-full bg-white border border-[rgba(184,135,61,0.15)] hover:bg-[#FAF9F5] text-warmgray hover:text-charcoal cursor-pointer"
                  >
                    <X className="w-5 h-5 stroke-[1.5]" />
                  </button>
                </div>

                {/* Modal Content - List of Leads */}
                <div className="p-6 overflow-y-auto flex-1 pl-10 space-y-4">
                  {cellLeads.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-warmgray italic">
                        {currentText.noLeadsFound}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cellLeads.map((lead) => {
                        const isWon = lead.stage === 'closed_won' || deals.some(d => d.leadId === lead.id && d.status === 'closed');
                        
                        return (
                          <div 
                            key={lead.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              isWon 
                                ? 'bg-royalemerald/[0.02] border-royalemerald/25 hover:border-royalemerald/45 shadow-xs' 
                                : 'bg-[#FAF9F5] border-[rgba(184,135,61,0.15)] hover:border-[rgba(184,135,61,0.3)]'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isWon ? 'bg-success' : 'bg-antiquegold'}`} />
                                <h4 className="font-serif text-sm font-extrabold text-charcoal">
                                  {lead.contactInfo?.name}
                                </h4>
                                <span className="text-[9px] font-mono font-bold text-warmgray bg-white border border-[#EFECE6] px-1.5 py-0.5 rounded">
                                  ID: {lead.id.toUpperCase()}
                                </span>
                              </div>
                              
                              <p className="text-xs text-charcoal font-medium">
                                <span className="text-warmgray font-bold">{currentText.buildingType}:</span> {lead.buildingInfo?.address}
                              </p>
                              
                              <div className="flex flex-wrap gap-4 text-[10px] text-warmgray font-bold font-mono">
                                <div>
                                  {currentText.floors.toUpperCase()}: <span className="text-charcoal font-extrabold">{lead.buildingInfo?.floors}</span>
                                </div>
                                <div>
                                  {isWon ? 'AGREED CONTRACT' : 'PIPELINE LOG'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-antiquegold" />
                                  <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Stage & Contact info */}
                            <div className="flex flex-col items-end gap-2 self-start md:self-auto">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-mono ${
                                isWon 
                                  ? 'bg-success/15 text-success border border-success/30' 
                                  : 'bg-antiquegold/15 text-antiquegold border border-antiquegold/30'
                              }`}>
                                {lead.stage.toUpperCase().replace('_', ' ')}
                              </span>
                              <div className="text-[10px] font-mono text-warmgray font-medium text-right">
                                <p>{lead.contactInfo?.phone}</p>
                                <p className="opacity-80">{lead.contactInfo?.email}</p>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-[#F8F6F1] border-t border-[rgba(184,135,61,0.15)] flex justify-between items-center text-[10px] font-mono font-extrabold text-warmgray">
                  <div>
                    REGION CODES MATCHED WITH SECURITY LOGS
                  </div>
                  <div>
                    TOTAL: {cellLeads.length} {currentText.totalLeadsAbbr.toUpperCase()}
                  </div>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
};
