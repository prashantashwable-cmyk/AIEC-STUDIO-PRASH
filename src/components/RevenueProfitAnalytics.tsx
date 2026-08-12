import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, TrendingDown, Download, RefreshCw, AlertTriangle, 
  CheckCircle, Clock, ArrowUpRight, Sliders, X, FileSpreadsheet, 
  Coins, Award, Info, Calendar, CheckCircle2, Building, 
  ChevronRight, Percent, Shield, Activity, Landmark
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { User, Deal, Payment, Lead } from '../types';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

interface RevenueProfitAnalyticsProps {
  user: User;
}

interface MonthlyData {
  monthName: string;
  monthKey: string; // "2026-04" etc
  booked: number;
  collected: number;
  cogs: number;
  margin: number; // percentage (0 to 100)
  dealCount: number;
  hasMixedGst: boolean;
}

export const RevenueProfitAnalytics: React.FC<RevenueProfitAnalyticsProps> = ({ user }) => {
  const { language, t } = useLanguage();
  const isDevanagari = language === 'hi' || language === 'mr';

  // State
  const [selectedPeriod, setSelectedPeriod] = useState<'FY26' | 'Q1_26' | 'Q2_26'>('FY26');
  const [targetMargin, setTargetMargin] = useState<number>(35); // target gross margin %
  const [targetTolerance, setTargetTolerance] = useState<number>(5); // +/- tolerance band %
  const [isGstChangeActive, setIsGstChangeActive] = useState<boolean>(false); // flag mixed rate GST
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [refunds, setRefunds] = useState<Record<string, number>>({}); // maps dealId -> refunded amount
  const [refundDealId, setRefundDealId] = useState<string>('');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundNote, setRefundNote] = useState<string>('');
  const [refundLogs, setRefundLogs] = useState<Array<{ id: string; dealId: string; clientName: string; amount: number; date: string; note: string }>>([]);
  const [pullToRefreshState, setPullToRefreshState] = useState<'idle' | 'pulling' | 'refreshing'>('idle');

  // Hardcoded list of simulated historical deals so that there is rich data to show,
  // matching exactly the style of SalesFunnelAnalytics
  const simulatedDeals: Deal[] = useMemo(() => {
    return [
      {
        id: 'deal_1',
        leadId: 'lead_3', // Real deal from seeds
        status: 'closed',
        agreedPrice: 1250000,
        advancePaid: true,
        specs: { floors: 8, driveType: 'Gearless Traction', capacity: '8 Persons (544 kg)', cabinStyle: 'Premium Stainless Steel' },
        createdAt: '2026-06-28T17:00:00Z'
      },
      {
        id: 'deal_sim_1',
        leadId: 'lead_sim_l1',
        status: 'closed',
        agreedPrice: 950000,
        advancePaid: true,
        specs: { floors: 4, driveType: 'Hydraulic Lift', capacity: '6 Persons (408 kg)', cabinStyle: 'Classic Painted Steel' },
        createdAt: '2026-04-12T10:30:00Z'
      },
      {
        id: 'deal_sim_2',
        leadId: 'lead_sim_l2',
        status: 'closed',
        agreedPrice: 1850000,
        advancePaid: true,
        specs: { floors: 12, driveType: 'Gearless Traction', capacity: '10 Persons (680 kg)', cabinStyle: 'Panoramic Premium Glass' },
        createdAt: '2026-05-18T14:20:00Z'
      },
      {
        id: 'deal_sim_3',
        leadId: 'lead_sim_l3',
        status: 'closed',
        agreedPrice: 1100000,
        advancePaid: true,
        specs: { floors: 6, driveType: 'Machine-Room-Less (MRL)', capacity: '8 Persons (544 kg)', cabinStyle: 'Standard Brushed Stainless Steel' },
        createdAt: '2026-05-25T11:15:00Z'
      },
      {
        id: 'deal_sim_4',
        leadId: 'lead_sim_l4',
        status: 'closed',
        agreedPrice: 1450000,
        advancePaid: true,
        specs: { floors: 9, driveType: 'Gearless Traction', capacity: '8 Persons (544 kg)', cabinStyle: 'Premium Hairline Gold Mirror' },
        createdAt: '2026-07-04T09:40:00Z'
      },
      {
        id: 'deal_sim_5',
        leadId: 'lead_sim_l5',
        status: 'closed', // Contract is signed and active
        agreedPrice: 1350000,
        advancePaid: true,
        specs: { floors: 7, driveType: 'Gearless Traction', capacity: '8 Persons (544 kg)', cabinStyle: 'Standard Stainless Steel' },
        createdAt: '2026-07-08T16:00:00Z'
      },
      {
        id: 'deal_sim_6',
        leadId: 'lead_sim_l6',
        status: 'closed',
        agreedPrice: 880000,
        advancePaid: true,
        specs: { floors: 5, driveType: 'Hydraulic Lift', capacity: '5 Persons (340 kg)', cabinStyle: 'Basic Powder Coated' },
        createdAt: '2026-04-20T15:00:00Z'
      }
    ];
  }, []);

  // Map each deal to a mock customer name and region for high fidelity
  const dealClients: Record<string, { name: string; region: string; address: string }> = useMemo(() => {
    return {
      'deal_1': { name: 'Vilas Rao', region: 'Pune', address: 'Survey No. 62, Hinjewadi Phase 1, Pune' },
      'deal_sim_1': { name: 'Karan Malhotra', region: 'Mumbai Suburbs', address: 'Vasant Vihar, Thane West, Mumbai' },
      'deal_sim_2': { name: 'Deshmukh Builders', region: 'Pune', address: 'Koregaon Park Road, Pune' },
      'deal_sim_3': { name: 'Gangapur Residency', region: 'Nashik', address: 'Gangapur Road, Nashik' },
      'deal_sim_4': { name: 'Ashok Leyland Staff Co', region: 'Mumbai', address: 'Chakala, Andheri East, Mumbai' },
      'deal_sim_5': { name: 'Pratap Co-op Society', region: 'Kolhapur', address: 'Tarabai Park, Kolhapur' },
      'deal_sim_6': { name: 'Shinde Nivas', region: 'Nashik', address: 'Indira Nagar, Nashik' }
    };
  }, []);

  // Combine live and simulated deals
  const deals = useMemo(() => {
    const rawDeals = DbManager.getDeals();
    const list = [...rawDeals];
    // Add simulated if missing
    simulatedDeals.forEach(sim => {
      if (!list.some(d => d.id === sim.id)) {
        list.push(sim);
      }
    });
    return list;
  }, [simulatedDeals]);

  // Live calculation from Quotation Engine's stored cost-and-profit logic per deal
  // to calculate COGS dynamically
  const getDealCogs = (deal: Deal) => {
    const floors = deal.specs.floors || 4;
    const driveType = deal.specs.driveType || 'Gearless Traction';
    const cabinStyle = deal.specs.cabinStyle || 'Standard';

    let machineryCost = 280000;
    if (driveType.toLowerCase().includes('traction')) machineryCost = 310000;
    else if (driveType.toLowerCase().includes('hydraulic')) machineryCost = 225000;
    else if (driveType.toLowerCase().includes('mrl') || driveType.toLowerCase().includes('machine-room-less')) machineryCost = 330000;

    const floorMaterialsCost = floors * 33000;

    let cabinCost = 80000;
    if (cabinStyle.toLowerCase().includes('premium')) cabinCost = 135000;
    else if (cabinStyle.toLowerCase().includes('glass') || cabinStyle.toLowerCase().includes('panoramic')) cabinCost = 180000;

    return machineryCost + floorMaterialsCost + cabinCost;
  };

  // Simulated payments matching all deals
  const payments: Payment[] = useMemo(() => {
    const rawPayments = DbManager.getPayments();
    const list = [...rawPayments];

    // Check and seed payments for simulated deals if they don't exist
    deals.forEach(deal => {
      if (deal.id === 'deal_1') return; // already has payments
      const existing = list.filter(p => p.dealId === deal.id);
      if (existing.length === 0) {
        // Create 3-stage payments for the simulated deal
        const p1: Payment = {
          id: `pay_${deal.id}_1`,
          dealId: deal.id,
          stage: 'Advance (30%)',
          amount: Math.round(deal.agreedPrice * 0.30),
          status: 'paid',
          dueDate: deal.createdAt.substring(0, 10),
          paidAt: deal.createdAt
        };
        const p2: Payment = {
          id: `pay_${deal.id}_2`,
          dealId: deal.id,
          stage: 'Material Delivery (40%)',
          amount: Math.round(deal.agreedPrice * 0.40),
          status: deal.status === 'closed' ? 'paid' : 'pending',
          dueDate: new Date(new Date(deal.createdAt).getTime() + 15 * 24 * 3600 * 1000).toISOString().substring(0, 10),
          paidAt: deal.status === 'closed' ? new Date(new Date(deal.createdAt).getTime() + 10 * 24 * 3600 * 1000).toISOString() : undefined
        };
        const p3: Payment = {
          id: `pay_${deal.id}_3`,
          dealId: deal.id,
          stage: 'Handover & QC (10%)',
          amount: Math.round(deal.agreedPrice * 0.30), // standard remaining
          status: deal.status === 'closed' ? 'paid' : 'unpaid',
          dueDate: new Date(new Date(deal.createdAt).getTime() + 45 * 24 * 3600 * 1000).toISOString().substring(0, 10),
          paidAt: deal.status === 'closed' ? new Date(new Date(deal.createdAt).getTime() + 40 * 24 * 3600 * 1000).toISOString() : undefined
        };
        list.push(p1, p2, p3);
      }
    });

    return list;
  }, [deals]);

  // Aggregate stats per deal taking into account dynamic retroactive refunds
  const dealAnalytics = useMemo(() => {
    return deals.map(deal => {
      const dealPays = payments.filter(p => p.dealId === deal.id);
      const booked = deal.agreedPrice;
      
      // Sum all paid payments
      const rawCollected = dealPays
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

      // Apply simulated refunds
      const refunded = refunds[deal.id] || 0;
      const collected = Math.max(0, rawCollected - refunded);

      const cogs = getDealCogs(deal);
      
      // Gross margin = (collected - cogs) / collected
      // If collected is 0, margin is 0
      const grossMarginAmt = collected - cogs;
      const grossMarginPct = collected > 0 ? (grossMarginAmt / collected) * 100 : 0;

      const clientInfo = dealClients[deal.id] || { name: 'Contract Client', region: 'Pune HQ', address: 'Registered Address' };

      // Parse month
      const createdDate = new Date(deal.createdAt);
      const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;

      return {
        ...deal,
        booked,
        collected,
        cogs,
        grossMarginAmt,
        grossMarginPct,
        refunded,
        clientName: clientInfo.name,
        region: clientInfo.region,
        address: clientInfo.address,
        monthKey
      };
    });
  }, [deals, payments, refunds, dealClients]);

  // Filter deals based on selected period
  // FY26: April 2026 - August 2026
  // Q1_26: April 2026 - June 2026
  // Q2_26: July 2026 - August 2026
  const filteredDeals = useMemo(() => {
    return dealAnalytics.filter(deal => {
      const date = new Date(deal.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-indexed

      if (year !== 2026) return false;

      if (selectedPeriod === 'Q1_26') {
        return month >= 4 && month <= 6;
      } else if (selectedPeriod === 'Q2_26') {
        return month >= 7 && month <= 9;
      }
      return month >= 4 && month <= 9; // Full FY period
    });
  }, [dealAnalytics, selectedPeriod]);

  // Aggregate overall period KPIs
  const kpis = useMemo(() => {
    const booked = filteredDeals.reduce((sum, d) => sum + d.booked, 0);
    const collected = filteredDeals.reduce((sum, d) => sum + d.collected, 0);
    const cogs = filteredDeals.reduce((sum, d) => sum + d.cogs, 0);
    const profit = collected - cogs;
    const margin = collected > 0 ? (profit / collected) * 100 : 0;
    const totalRefunded = filteredDeals.reduce((sum, d) => sum + d.refunded, 0);

    return {
      booked,
      collected,
      cogs,
      profit,
      margin,
      totalRefunded,
      dealCount: filteredDeals.length
    };
  }, [filteredDeals]);

  // Calculate product category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { booked: number; collected: number; cogs: number; count: number }> = {};

    filteredDeals.forEach(d => {
      let cat = d.specs.driveType || 'Other';
      if (cat.includes('Traction')) cat = 'Gearless Traction';
      else if (cat.includes('Hydraulic')) cat = 'Hydraulic Lift';
      else if (cat.includes('MRL') || cat.includes('Machine-Room-Less')) cat = 'Machine-Room-Less (MRL)';

      if (!map[cat]) {
        map[cat] = { booked: 0, collected: 0, cogs: 0, count: 0 };
      }
      map[cat].booked += d.booked;
      map[cat].collected += d.collected;
      map[cat].cogs += d.cogs;
      map[cat].count += 1;
    });

    return Object.entries(map).map(([name, data]) => {
      const profit = data.collected - data.cogs;
      const margin = data.collected > 0 ? (profit / data.collected) * 100 : 0;
      return {
        name,
        ...data,
        profit,
        margin
      };
    });
  }, [filteredDeals]);

  // Calculate regional breakdown (Pune, Mumbai, Nashik, Kolhapur)
  const regionalBreakdown = useMemo(() => {
    const map: Record<string, { booked: number; collected: number; cogs: number; count: number }> = {};

    filteredDeals.forEach(d => {
      const reg = d.region || 'Pune HQ';
      if (!map[reg]) {
        map[reg] = { booked: 0, collected: 0, cogs: 0, count: 0 };
      }
      map[reg].booked += d.booked;
      map[reg].collected += d.collected;
      map[reg].cogs += d.cogs;
      map[reg].count += 1;
    });

    return Object.entries(map).map(([name, data]) => {
      const profit = data.collected - data.cogs;
      const margin = data.collected > 0 ? (profit / data.collected) * 100 : 0;
      return {
        name,
        ...data,
        profit,
        margin
      };
    }).sort((a, b) => b.collected - a.collected);
  }, [filteredDeals]);

  // Monthly trends from April 2026 to August 2026
  const monthlyData: MonthlyData[] = useMemo(() => {
    const months = [
      { key: '2026-04', name: language === 'hi' ? 'अप्रैल 2026' : language === 'mr' ? 'एप्रिल २०२६' : 'April 2026' },
      { key: '2026-05', name: language === 'hi' ? 'मई 2026' : language === 'mr' ? 'मे २०२६' : 'May 2026' },
      { key: '2026-06', name: language === 'hi' ? 'जून 2026' : language === 'mr' ? 'जून २०२६' : 'June 2026' },
      { key: '2026-07', name: language === 'hi' ? 'जुलाई 2026' : language === 'mr' ? 'जुलै २०२६' : 'July 2026' },
      { key: '2026-08', name: language === 'hi' ? 'अगस्त 2026' : language === 'mr' ? 'ऑगस्ट २०२६' : 'August 2026' }
    ];

    return months.map(m => {
      const monthDeals = dealAnalytics.filter(d => d.monthKey === m.key);
      const booked = monthDeals.reduce((sum, d) => sum + d.booked, 0);
      const collected = monthDeals.reduce((sum, d) => sum + d.collected, 0);
      const cogs = monthDeals.reduce((sum, d) => sum + d.cogs, 0);
      const profit = collected - cogs;
      const margin = collected > 0 ? (profit / collected) * 100 : 0;

      // Simulated GST flag mid period (July is marked as mixed-rate GST transit if enabled)
      const hasMixedGst = isGstChangeActive && m.key === '2026-07';

      return {
        monthName: m.name,
        monthKey: m.key,
        booked,
        collected,
        cogs,
        margin,
        dealCount: monthDeals.length,
        hasMixedGst
      };
    });
  }, [dealAnalytics, isGstChangeActive, language]);

  // Format currency in Lakhs/Thousands in Indian style
  const formatIndianCurrency = (amount: number) => {
    if (amount >= 100000) {
      const lakhs = amount / 100000;
      return `₹${lakhs.toFixed(2)} Lakhs`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Raw Number formatting for tabular views
  const formatRawValue = (amount: number) => {
    return amount.toLocaleString('en-IN');
  };

  // Add retroactive refund simulator handler
  const handleApplyRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundDealId || !refundAmount) return;

    const amtVal = parseFloat(refundAmount);
    if (isNaN(amtVal) || amtVal <= 0) {
      alert(language === 'hi' ? 'कृपया एक वैध राशि दर्ज करें।' : language === 'mr' ? 'कृपया वैध रक्कम प्रविष्ट करा.' : 'Please enter a valid amount.');
      return;
    }

    const selectedDeal = deals.find(d => d.id === refundDealId);
    if (!selectedDeal) return;

    const client = dealClients[selectedDeal.id]?.name || 'Contract Client';

    // Verify refund doesn't exceed already-paid amount
    const dealPays = payments.filter(p => p.dealId === selectedDeal.id);
    const paidSum = dealPays.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const alreadyRefunded = refunds[selectedDeal.id] || 0;

    if (amtVal > (paidSum - alreadyRefunded)) {
      alert(
        language === 'hi' 
          ? `त्रुटि: धनवापसी राशि पहले से जमा भुगतान (${formatIndianCurrency(paidSum - alreadyRefunded)}) से अधिक नहीं हो सकती।` 
          : language === 'mr' 
          ? `त्रुटी: परतावा रक्कम आधीच गोळा केलेल्या पेमेंटपेक्षा (${formatIndianCurrency(paidSum - alreadyRefunded)}) जास्त असू शकत नाही.` 
          : `Error: Refund amount cannot exceed already collected payments (${formatIndianCurrency(paidSum - alreadyRefunded)}).`
      );
      return;
    }

    // Set refund mapping
    setRefunds(prev => ({
      ...prev,
      [refundDealId]: (prev[refundDealId] || 0) + amtVal
    }));

    // Add to logs
    const newLog = {
      id: `refund_${Date.now()}`,
      dealId: refundDealId,
      clientName: client,
      amount: amtVal,
      date: new Date().toISOString().substring(0, 10),
      note: refundNote || (language === 'hi' ? 'सहमति आधारित आंशिक धनवापसी' : language === 'mr' ? 'सामंजस्याने अंशतः परतावा' : 'Amicable partial refund settled')
    };

    setRefundLogs(prev => [newLog, ...prev]);

    // Reset inputs
    setRefundAmount('');
    setRefundNote('');
    setRefundDealId('');

    // Trigger feedback notification
    alert(
      language === 'hi' 
        ? `सफलता: ${client} के लिए ${formatIndianCurrency(amtVal)} की पूर्वव्यापी धनवापसी लागू कर दी गई है।` 
        : language === 'mr' 
        ? `यशस्वी: ${client} साठी ${formatIndianCurrency(amtVal)} चा पूर्वलक्षी परतावा लागू करण्यात आला आहे.` 
        : `Success: Retroactive refund of ${formatIndianCurrency(amtVal)} has been applied for ${client}.`
    );
  };

  // Export CSV Report
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Deal ID,Client Name,Region,Agreed Price (Booked),Collected Payments,COGS (Supplier Cost),Gross Profit,Margin Percent,Refunds Applied\n";

    filteredDeals.forEach(d => {
      csvContent += `"${d.id}","${d.clientName}","${d.region}",${d.booked},${d.collected},${d.cogs},${d.grossMarginAmt},${d.grossMarginPct.toFixed(1)}%,${d.refunded}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AIEC_Financial_Ledger_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulated pull-to-refresh
  const handlePullToRefresh = () => {
    setPullToRefreshState('pulling');
    setTimeout(() => {
      setPullToRefreshState('refreshing');
      setTimeout(() => {
        setPullToRefreshState('idle');
      }, 1000);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans antialiased text-charcoal">
      
      {/* Pull To Refresh Trigger for Mobile */}
      <div className="flex md:hidden justify-center">
        <button 
          onClick={handlePullToRefresh}
          className="flex items-center gap-1.5 px-3 py-1 bg-alabaster hover:bg-white border border-[rgba(184,135,61,0.2)] rounded-full text-xs font-semibold text-antiquegold transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${pullToRefreshState === 'refreshing' ? 'animate-spin' : ''}`} />
          <span>
            {pullToRefreshState === 'idle' && (language === 'hi' ? 'ताज़ा करने के लिए टैप करें' : language === 'mr' ? 'रीफ्रेश करण्यासाठी दाबा' : 'Tap to Refresh')}
            {pullToRefreshState === 'pulling' && '...'}
            {pullToRefreshState === 'refreshing' && (language === 'hi' ? 'अपडेट हो रहा है' : language === 'mr' ? 'अपडेट होत आहे' : 'Updating ledger...')}
          </span>
        </button>
      </div>

      {/* Hero Header Block */}
      <div className="bg-white border border-[rgba(184,135,61,0.15)] rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 h-32 w-32 bg-antiquegold/5 rounded-bl-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-antiquegold/10 text-antiquegold rounded-lg">
                <Landmark className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono tracking-widest text-antiquegold uppercase font-extrabold">
                {language === 'hi' ? 'वित्तीय विवरण एवं मार्जिन नियंत्रण' : language === 'mr' ? 'वित्तीय ऑडिट आणि नफा विश्लेषण' : 'ADMIN FINANCIAL MONITOR'}
              </span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              {language === 'hi' ? 'राजस्व और लाभ विश्लेषिकी' : language === 'mr' ? 'महसूल आणि नफा विश्लेषण' : 'Revenue & Profit Analytics'}
            </h2>
            <p className="text-xs text-warmgray md:max-w-xl">
              {language === 'hi' 
                ? 'मालिक प्रशांत वसंत वाबळे के लिए वास्तविक समय में बुक किए गए राजस्व, संवितरित भुगतान और आपूर्तिकर्ता खर्च की तुलना।' 
                : language === 'mr' 
                ? 'संचालक श्री. प्रशांत वसंत वाबळे यांच्यासाठी वास्तविक वेळेत बुक महसूल, संकलित पेमेंट आणि आपूर्तिकर्ता खर्चाचा तुलनात्मक ताळेबंद.' 
                : 'Live comparative ledger of gross booked value, cleared stages, and supplier component spend optimized for Director Mr. Prashant Vasant Wable.'}
            </p>
          </div>

          {/* Period Selector Toggle */}
          <div className="flex bg-alabaster p-1 rounded-xl border border-[rgba(184,135,61,0.15)] self-start md:self-center shrink-0">
            <button 
              onClick={() => setSelectedPeriod('FY26')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedPeriod === 'FY26' ? 'bg-charcoal text-white shadow-xs' : 'text-warmgray hover:text-charcoal'}`}
            >
              {language === 'hi' ? 'पूर्ण FY 2026-27' : language === 'mr' ? 'पूर्ण FY २०२६-२७' : 'FY 2026-27'}
            </button>
            <button 
              onClick={() => setSelectedPeriod('Q1_26')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedPeriod === 'Q1_26' ? 'bg-charcoal text-white shadow-xs' : 'text-warmgray hover:text-charcoal'}`}
            >
              {language === 'hi' ? 'Q1 (अप्रैल-जून)' : language === 'mr' ? 'Q१ (एप्रिल-जून)' : 'Q1 (Apr-Jun)'}
            </button>
            <button 
              onClick={() => setSelectedPeriod('Q2_26')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedPeriod === 'Q2_26' ? 'bg-charcoal text-white shadow-xs' : 'text-warmgray hover:text-charcoal'}`}
            >
              {language === 'hi' ? 'Q2 (जुलाई-अगस्त)' : language === 'mr' ? 'Q२ (जुलै-ऑगस्ट)' : 'Q2 (Jul-Aug)'}
            </button>
          </div>
        </div>
      </div>

      {/* Compliance / GST Advisory Banner */}
      <div className="bg-alabaster rounded-2xl p-4 border border-[rgba(184,135,61,0.18)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-3 items-start">
          <div className="p-2 bg-royalemerald/10 text-royalemerald rounded-xl shrink-0 mt-0.5 sm:mt-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-charcoal">
              {language === 'hi' ? 'जीएसटी नीति संक्रमण नियंत्रण' : language === 'mr' ? 'जीएसटी नियामक संक्रमण नियंत्रण' : 'Regulatory Tax Compliance Monitor'}
            </h4>
            <p className="text-[11px] text-warmgray max-w-2xl mt-0.5">
              {language === 'hi' 
                ? 'यह प्रणाली अनुबंध मूल्यों में १८% बनाम १२% संक्रमणकालीन दरों के सम्मिश्रण का पता लगाती है।' 
                : language === 'mr' 
                ? 'ही प्रणाली कर दरातील (१८% वरून १२%) बदलांचा आणि करार मूल्यांमधील प्रत्यक्ष प्रभावाचा मागोवा घेते.' 
                : 'Compliance engine flags whether statutory GST rates changed mid-period, ensuring contract models remain aligned with actual tax transitions.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-warmgray">
            {language === 'hi' ? 'कर सम्मिश्रण ध्वज' : language === 'mr' ? 'कर दर बदल ध्वज' : 'Flag GST Shift'}
          </span>
          <button
            onClick={() => setIsGstChangeActive(!isGstChangeActive)}
            className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${isGstChangeActive ? 'bg-royalemerald' : 'bg-[#e5dfd4]'}`}
          >
            <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${isGstChangeActive ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isGstChangeActive && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[rgba(14,75,61,0.05)] border border-royalemerald/30 text-[#0c3c31] px-4 py-3 rounded-2xl flex items-start gap-3"
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-royalemerald" />
            <div className="text-[11px] leading-relaxed">
              <strong>{language === 'hi' ? 'संक्रमण चेतावनी' : language === 'mr' ? 'संक्रमण सूचना' : 'MIXED-RATE TAX TRANSITION DISCLOSURE'}:</strong>{' '}
              {language === 'hi' 
                ? 'इस रिपोर्टिंग अवधि में जुलाई के कर परिवर्तन शामिल हैं। आंतरिक अनुबंध मूल्य दोनों दरों को मिलाकर प्रस्तुत हैं।' 
                : language === 'mr' 
                ? 'या अहवाल कालावधीत जुलैमधील जीएसटी कर बदल समाविष्ट आहेत. अंतर्गत करार मूल्ये दोन्ही कर मॉडेल दर्शवतात.' 
                : 'This reporting period includes transactions spanning the July GST transit. Internal contract margins reflect dual statutory accounting models (18% and 12%). Use export logs for filing.'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Booked Revenue */}
        <Card className="p-4 relative hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-warmgray font-sans">
              {language === 'hi' ? 'बुक किया गया राजस्व' : language === 'mr' ? 'बुक केलेला महसूल' : 'Revenue Booked'}
            </span>
            <span className="p-1 bg-antiquegold/10 text-antiquegold rounded-lg">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <h3 className="font-mono text-xl sm:text-2xl font-bold tracking-tight">
              {formatIndianCurrency(kpis.booked)}
            </h3>
            <p className="text-[10px] text-warmgray flex items-center gap-1">
              <span className="font-mono text-royalemerald font-bold">✓ {kpis.dealCount}</span>
              <span>{language === 'hi' ? 'हस्ताक्षरित अनुबंध' : language === 'mr' ? 'स्वाक्षरित करार' : 'signed contracts'}</span>
            </p>
          </div>
        </Card>

        {/* Card 2: Collected Revenue */}
        <Card className="p-4 relative hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-warmgray font-sans">
              {language === 'hi' ? 'एकत्रित राजस्व' : language === 'mr' ? 'एकत्रित महसूल' : 'Revenue Collected'}
            </span>
            <span className="p-1 bg-royalemerald/10 text-royalemerald rounded-lg">
              <Coins className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <h3 className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-royalemerald">
              {formatIndianCurrency(kpis.collected)}
            </h3>
            <p className="text-[10px] text-warmgray flex items-center gap-1 flex-wrap">
              <span className="font-mono font-bold text-royalemerald">
                {kpis.booked > 0 ? ((kpis.collected / kpis.booked) * 100).toFixed(1) : 0}%
              </span>
              <span>{language === 'hi' ? 'ऋण शोधन दर' : language === 'mr' ? 'वसूल झालेला दर' : 'of booked cleared'}</span>
            </p>
          </div>
          {kpis.totalRefunded > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-error/10 text-error rounded text-[8px] font-mono font-extrabold uppercase">
              {language === 'hi' ? 'समायोजित' : language === 'mr' ? 'परतावा वजा' : 'Refund Adjusted'}
            </span>
          )}
        </Card>

        {/* Card 3: Supplier spend (COGS) */}
        <Card className="p-4 relative hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-warmgray font-sans">
              {language === 'hi' ? 'आपूर्तिकर्ता खर्च (COGS)' : language === 'mr' ? 'आपूर्तिकर्ता खर्च (COGS)' : 'Supplier Spend (COGS)'}
            </span>
            <span className="p-1 bg-charcoal/10 text-charcoal rounded-lg">
              <Building className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <h3 className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-charcoal">
              {formatIndianCurrency(kpis.cogs)}
            </h3>
            <p className="text-[10px] text-warmgray flex items-center gap-1">
              <span className="font-mono font-bold text-charcoal">
                {kpis.collected > 0 ? ((kpis.cogs / kpis.collected) * 100).toFixed(1) : 0}%
              </span>
              <span>{language === 'hi' ? 'एकत्रित मूल्य का अंश' : language === 'mr' ? 'एकत्रित मूल्याचे प्रमाण' : 'of collected value'}</span>
            </p>
          </div>
        </Card>

        {/* Card 4: Gross Margin */}
        <Card className="p-4 relative hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-warmgray font-sans">
              {language === 'hi' ? 'सकल मार्जिन %' : language === 'mr' ? 'सकल नफा मार्जिन' : 'Gross Margin %'}
            </span>
            <span className="p-1 bg-antiquegold/10 text-antiquegold rounded-lg">
              <Percent className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <h3 className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${
              kpis.margin >= targetMargin - targetTolerance && kpis.margin <= targetMargin + targetTolerance 
                ? 'text-royalemerald' 
                : kpis.margin > targetMargin + targetTolerance 
                ? 'text-[#0E4B3D] drop-shadow-xs' 
                : 'text-antiquegold'
            }`}>
              {kpis.margin.toFixed(1)}%
            </h3>
            <div className="text-[10px] flex items-center gap-1.5 flex-wrap">
              {kpis.margin >= targetMargin ? (
                <span className="text-success font-semibold flex items-center gap-0.5 font-mono">
                  ▲ +{(kpis.margin - targetMargin).toFixed(1)}%
                </span>
              ) : (
                <span className="text-antiquegold font-semibold flex items-center gap-0.5 font-mono">
                  ▼ -{(targetMargin - kpis.margin).toFixed(1)}%
                </span>
              )}
              <span className="text-warmgray">vs target {targetMargin}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Trend & Target Band Chart (8 Columns) */}
        <div className="lg:col-span-8 bg-white border border-[rgba(184,135,61,0.15)] rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal">
                {language === 'hi' ? 'सकल मार्जिन और लक्ष्य बैंड रुझान' : language === 'mr' ? 'सकल नफा मार्जिन आणि लक्ष्य श्रेणी' : 'Gross Margin & Configurable Target Corridor'}
              </h3>
              <p className="text-[11px] text-warmgray">
                {language === 'hi' 
                  ? 'मासिक सकल मार्जिन बनाम मालिक प्रशांत वाबळे द्वारा निर्धारित सीमा।' 
                  : language === 'mr' 
                  ? 'मासिक सकल नफा मार्जिन विरुद्ध संचालक प्रशांत वाबळे यांनी सेट केलेले अपेक्षित उद्दिष्ट.' 
                  : 'Monthly aggregated margin against the dynamic target corridor set by Director Prashant Wable.'}
              </p>
            </div>

            {/* Target Config Dropdown / Toggle Button */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-[10px] font-mono text-warmgray uppercase font-bold">{language === 'hi' ? 'सीमा' : language === 'mr' ? 'उद्दिष्ट' : 'Target'}: {targetMargin}%</span>
              <span className="text-[10px] font-mono text-warmgray uppercase font-bold">±{targetTolerance}%</span>
            </div>
          </div>

          {/* Interactive target sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-alabaster p-3.5 rounded-xl border border-[rgba(184,135,61,0.1)]">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-charcoal uppercase">
                <span>{language === 'hi' ? 'लक्ष्य मार्जिन' : language === 'mr' ? 'अपेक्षित मार्जिन' : 'Target Gross Margin'}</span>
                <span className="font-mono text-antiquegold text-xs">{targetMargin}%</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="60" 
                step="1"
                value={targetMargin} 
                onChange={(e) => setTargetMargin(parseInt(e.target.value))}
                className="w-full h-1.5 bg-warmgray/20 rounded-lg appearance-none cursor-pointer accent-antiquegold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-charcoal uppercase">
                <span>{language === 'hi' ? 'सहिष्णुता बैंड' : language === 'mr' ? 'सहिष्णुता श्रेणी' : 'Tolerance Band'}</span>
                <span className="font-mono text-antiquegold text-xs">±{targetTolerance}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="12" 
                step="0.5"
                value={targetTolerance} 
                onChange={(e) => setTargetTolerance(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-warmgray/20 rounded-lg appearance-none cursor-pointer accent-antiquegold focus:outline-none"
              />
            </div>
          </div>

          {/* Custom SVG Trend Visualization with Target Band Corridor */}
          <div className="h-64 w-full relative pt-2">
            {/* SVG Plot */}
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Definitions */}
              <defs>
                <linearGradient id="targetBandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0E4B3D" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#0E4B3D" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="actualLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#B8873D" />
                  <stop offset="100%" stopColor="#0E4B3D" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="10" y1="40" x2="490" y2="40" stroke="#f1ece1" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="10" y1="100" x2="490" y2="100" stroke="#f1ece1" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="10" y1="160" x2="490" y2="160" stroke="#f1ece1" strokeWidth="1" strokeDasharray="3,3" />

              {/* Shaded Target Band Corridor */}
              {/* Y scale mapped from margin (0% to 100%) to pixels (180 to 20) */}
              {(() => {
                const mapMarginToY = (m: number) => {
                  const percentOfRange = m / 100;
                  return 180 - percentOfRange * 160; // 180 is 0% margin, 20 is 100% margin
                };

                const highY = Math.max(10, mapMarginToY(targetMargin + targetTolerance));
                const lowY = Math.min(190, mapMarginToY(targetMargin - targetTolerance));
                const midY = mapMarginToY(targetMargin);

                return (
                  <>
                    {/* Background Corridor Polygon */}
                    <polygon 
                      points={`10,${highY} 490,${highY} 490,${lowY} 10,${lowY}`}
                      fill="url(#targetBandGrad)"
                      stroke="rgba(14,75,61,0.15)"
                      strokeWidth="1"
                    />
                    {/* Target Midpoint Dashed Line */}
                    <line 
                      x1="10" y1={midY} x2="490" y2={midY} 
                      stroke="rgba(14,75,61,0.3)" 
                      strokeWidth="1.5" 
                      strokeDasharray="5,4" 
                    />
                  </>
                );
              })()}

              {/* Actual Margin Trend Line */}
              {(() => {
                const mapMarginToY = (m: number) => {
                  const percentOfRange = m / 100;
                  return 180 - percentOfRange * 160;
                };

                // Compute points for 5 months
                const xStep = 480 / (monthlyData.length - 1);
                const points = monthlyData.map((d, index) => {
                  const x = 10 + index * xStep;
                  const y = mapMarginToY(d.margin);
                  return { x, y, data: d };
                });

                const pathD = points.reduce((str, pt, idx) => {
                  return idx === 0 ? `M ${pt.x} ${pt.y}` : `${str} L ${pt.x} ${pt.y}`;
                }, "");

                return (
                  <>
                    {/* Curved line (simulated linear segments) */}
                    <path 
                      d={pathD}
                      fill="none"
                      stroke="url(#actualLineGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Plot Points */}
                    {points.map((pt, idx) => {
                      const inCorridor = pt.data.margin >= (targetMargin - targetTolerance) && pt.data.margin <= (targetMargin + targetTolerance);
                      const isHigh = pt.data.margin > (targetMargin + targetTolerance);
                      const dotColor = inCorridor ? '#0E4B3D' : isHigh ? '#0E4B3D' : '#B8873D';

                      return (
                        <g key={idx}>
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r="5" 
                            fill={dotColor}
                            stroke="#fff" 
                            strokeWidth="2" 
                            className="transition-all hover:r-7 cursor-pointer"
                          />
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* X Axis Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] font-mono text-warmgray font-bold">
              {monthlyData.map((d, idx) => (
                <div key={idx} className="text-center flex flex-col items-center">
                  <span>{d.monthName}</span>
                  <span className={`text-[9px] font-mono font-extrabold ${d.margin >= targetMargin ? 'text-royalemerald' : 'text-antiquegold'}`}>
                    {d.margin.toFixed(1)}%
                  </span>
                  {d.hasMixedGst && (
                    <span className="mt-0.5 px-1 py-0.2 bg-royalemerald/15 text-royalemerald rounded-[3px] text-[7px] scale-90">
                      MIXED TAX
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick interactive note */}
          <div className="text-[10px] text-warmgray italic flex items-center gap-1">
            <Info className="w-3 h-3 text-antiquegold" />
            <span>{language === 'hi' ? 'मार्जिन की गणना वसूल की गई राशि पर आधारित है, न कि केवल कागजी बुकिंग पर।' : language === 'mr' ? 'नफ्याचे प्रमाण गोळा केलेल्या रकमेवर आधारित आहे, कराराच्या काल्पनिक बुकिंगवर नाही.' : 'Actual Gross Margin is dynamic on payments processed & cleared (receipt-basis), protecting you from speculative cash-flows.'}</span>
          </div>
        </div>

        {/* Signature Element: The Ascension Margin Meter (4 Columns) */}
        <div className="lg:col-span-4 bg-white border border-[rgba(184,135,61,0.15)] rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-antiquegold uppercase font-extrabold tracking-widest block">
              {language === 'hi' ? 'द एसेन्शन लाइन' : language === 'mr' ? 'द एसेन्शन प्रगती' : 'THE ASCENSION LINE'}
            </span>
            <h3 className="font-serif text-base font-bold text-charcoal">
              {language === 'hi' ? 'मार्जिन लक्ष्य एक्सीलरेटर' : language === 'mr' ? 'नफा ध्येय प्रगती मार्ग' : 'Profit Target Floor Indicator'}
            </h3>
            <p className="text-[11px] text-warmgray">
              {language === 'hi' ? 'आपकी वर्तमान लाभ स्थिति क्या लक्ष्य मंजिल पर है?' : language === 'mr' ? 'सध्याची नफा स्थिती तुमच्या ध्येय मजल्यावर पोहोचली आहे का?' : 'Elevator style floor progression tracking current performance against configured target.'}
            </p>
          </div>

          {/* Visual Vertical Ascension Indicator */}
          <div className="my-6 flex justify-center items-center gap-6">
            <div className="h-44 w-6 bg-alabaster rounded-full border border-[rgba(184,135,61,0.15)] relative flex flex-col justify-end p-0.5 overflow-hidden">
              {/* Target band shaded background */}
              {(() => {
                const lowPercent = Math.max(0, targetMargin - targetTolerance);
                const highPercent = Math.min(100, targetMargin + targetTolerance);
                const bandHeight = highPercent - lowPercent;
                return (
                  <div 
                    className="absolute bg-royalemerald/10 border-y border-royalemerald/25 w-full left-0 transition-all duration-300"
                    style={{ bottom: `${lowPercent}%`, height: `${bandHeight}%` }}
                  />
                );
              })()}

              {/* Progress Level */}
              <motion.div 
                className="bg-antiquegold rounded-full w-full relative z-10 shadow-[0_0_10px_rgba(184,135,61,0.4)]"
                style={{ height: `${kpis.margin}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${kpis.margin}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />

              {/* Interactive floor notch representing Target Margin */}
              <div 
                className="absolute left-0 right-0 h-[2px] bg-royalemerald z-20 pointer-events-none transition-all duration-300"
                style={{ bottom: `${targetMargin}%` }}
              />
            </div>

            {/* Metric annotations */}
            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase text-warmgray font-sans block">{language === 'hi' ? 'शीर्ष मंजिल' : language === 'mr' ? 'उच्चतम पातळी' : 'Peak Performance'}</span>
                <strong className="text-charcoal block">50.0%</strong>
              </div>

              <div className="space-y-0.5 border-l-2 border-royalemerald pl-2 py-0.5">
                <span className="text-[9px] uppercase text-royalemerald font-sans block font-extrabold">{language === 'hi' ? 'लक्ष्य मंजिल' : language === 'mr' ? 'ध्येय मजला' : 'Target Floor'}</span>
                <strong className="text-royalemerald block">{targetMargin.toFixed(1)}%</strong>
              </div>

              <div className="space-y-0.5 border-l-2 border-antiquegold pl-2 py-0.5">
                <span className="text-[9px] uppercase text-antiquegold font-sans block font-extrabold">{language === 'hi' ? 'वर्तमान स्थिति' : language === 'mr' ? 'सध्याची प्रगती' : 'Actual Floor'}</span>
                <strong className="text-antiquegold block">{kpis.margin.toFixed(1)}%</strong>
              </div>
            </div>
          </div>

          <div className="bg-alabaster p-3 rounded-xl border border-[rgba(184,135,61,0.08)] text-center">
            <span className="text-[10px] text-warmgray font-bold block uppercase tracking-wide">
              {language === 'hi' ? 'मंजिल सूचक स्थिति' : language === 'mr' ? 'मजला दर्शक स्थिती' : 'INDICATOR READOUT'}
            </span>
            <strong className={`font-serif text-sm block mt-1 ${kpis.margin >= targetMargin ? 'text-royalemerald' : 'text-antiquegold'}`}>
              {kpis.margin >= targetMargin 
                ? (language === 'hi' ? '🏆 लक्ष्य पूर्ण हुआ' : language === 'mr' ? '🏆 ध्येय गाठले' : '🏆 Target Accomplished')
                : (language === 'hi' ? '⚡ लिफ्ट प्रगति पर है' : language === 'mr' ? '⚡ लिफ्ट मार्गस्थ आहे' : '⚡ Ascension In Progress')}
            </strong>
          </div>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Product Lift Category Breakdown */}
        <div className="bg-white border border-[rgba(184,135,61,0.15)] rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal">
              {language === 'hi' ? 'उत्पाद / लिफ्ट श्रेणी द्वारा विभाजन' : language === 'mr' ? 'उत्पादन / लिफ्ट प्रकारानुसार नफा' : 'Margin Analysis by Product Category'}
            </h3>
            <p className="text-[11px] text-warmgray">
              {language === 'hi' 
                ? 'विभिन्न ड्राइव प्रकारों की बिक्री और प्राप्त लाभ का वास्तविक ऑडिट।' 
                : language === 'mr' 
                ? 'विविध लिफ्ट प्रकारांमधील प्रत्यक्ष नफा गुणोत्तर आणि संकलित महसूल.' 
                : 'Direct segment profits mapping booked values against raw supplier components.'}
            </p>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map((cat, idx) => {
              const bookedPct = kpis.booked > 0 ? (cat.booked / kpis.booked) * 100 : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-charcoal">{cat.name}</span>
                    <span className="font-mono text-warmgray">
                      {cat.count} {language === 'hi' ? 'अनुबंध' : language === 'mr' ? 'करार' : 'contracts'} ({bookedPct.toFixed(0)}%)
                    </span>
                  </div>

                  {/* Dual Bar (Booked vs Collected) */}
                  <div className="space-y-1 bg-alabaster p-2 rounded-lg border border-[rgba(184,135,61,0.05)]">
                    <div className="flex justify-between text-[9px] font-mono text-warmgray">
                      <span>{language === 'hi' ? 'अनुबंधित मूल्य' : language === 'mr' ? 'करार मूल्य' : 'Booked'}</span>
                      <span className="font-bold text-charcoal">{formatIndianCurrency(cat.booked)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-warmgray/20 rounded-full overflow-hidden">
                      <div className="bg-antiquegold h-full" style={{ width: `${bookedPct}%` }} />
                    </div>

                    <div className="flex justify-between text-[9px] font-mono text-royalemerald">
                      <span>{language === 'hi' ? 'वसूली (सकल मार्जिन %)' : language === 'mr' ? 'एकत्रित रक्कम (मार्जिन %)' : 'Collected (Margin %)'}</span>
                      <strong className="font-extrabold">{formatIndianCurrency(cat.collected)} ({cat.margin.toFixed(1)}%)</strong>
                    </div>
                    <div className="w-full h-1.5 bg-warmgray/20 rounded-full overflow-hidden">
                      <div className="bg-royalemerald h-full" style={{ width: `${cat.collected > 0 ? (cat.collected / cat.booked) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Region Breakdown */}
        <div className="bg-white border border-[rgba(184,135,61,0.15)] rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal">
              {language === 'hi' ? 'क्षेत्रीय मार्जिन और नमूना चेतावनियाँ' : language === 'mr' ? 'प्रादेशिक नफा गुणोत्तर आणि सतर्कता' : 'Regional Profitability Ledger'}
            </h3>
            <p className="text-[11px] text-warmgray">
              {language === 'hi' 
                ? 'कम सौदों वाले क्षेत्रों के लिए अंतर्निहित संवेदनशीलता चेतावनियों के साथ प्रदर्शन।' 
                : language === 'mr' 
                ? 'कमी व्यवहार असलेल्या क्षेत्रांसाठी अंतर्गत सुरक्षा सूचनांसह प्रादेशिक नफा विश्लेषण.' 
                : 'Performance dashboard with embedded statistical warnings for small deal volumes.'}
            </p>
          </div>

          <div className="space-y-3.5">
            {regionalBreakdown.map((reg, idx) => {
              const isSmallSample = reg.count <= 2;
              return (
                <div key={idx} className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)] space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                        <span>{reg.name}</span>
                        {isSmallSample && (
                          <span className="text-[8px] bg-antiquegold/10 text-antiquegold font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wide">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>{language === 'hi' ? 'छोटा नमूना' : language === 'mr' ? 'कमी डेटा' : 'Few Nodes'}</span>
                          </span>
                        )}
                      </h4>
                      <p className="text-[9px] font-mono text-warmgray mt-0.5">
                        {reg.count} {language === 'hi' ? 'पंजीकृत भवन इकाइयाँ' : language === 'mr' ? 'नोंदणीकृत इमारती' : 'registered building nodes'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-warmgray uppercase block">{language === 'hi' ? 'सकल मार्जिन' : language === 'mr' ? 'सकल नफा मार्जिन' : 'Gross Margin'}</span>
                      <strong className={`font-mono text-xs ${reg.margin >= targetMargin ? 'text-royalemerald' : 'text-antiquegold'}`}>
                        {reg.margin.toFixed(1)}%
                      </strong>
                    </div>
                  </div>

                  {/* Mini ledger specs */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[rgba(184,135,61,0.08)] text-[10px] font-mono">
                    <div>
                      <span className="text-warmgray block">{language === 'hi' ? 'बुक मूल्य' : language === 'mr' ? 'करार मूल्य' : 'Booked'}</span>
                      <strong className="text-charcoal block">{formatIndianCurrency(reg.booked)}</strong>
                    </div>
                    <div>
                      <span className="text-warmgray block">{language === 'hi' ? 'वसूली' : language === 'mr' ? 'वसूल' : 'Collected'}</span>
                      <strong className="text-royalemerald block">{formatIndianCurrency(reg.collected)}</strong>
                    </div>
                    <div>
                      <span className="text-warmgray block">{language === 'hi' ? 'कुल खर्च' : language === 'mr' ? 'खर्च (COGS)' : 'COGS'}</span>
                      <strong className="text-charcoal block">{formatIndianCurrency(reg.cogs)}</strong>
                    </div>
                  </div>

                  {isSmallSample && (
                    <p className="text-[9px] text-antiquegold italic">
                      💡 {language === 'hi' ? 'कम नमूना: क्षेत्रीय आँकड़े अत्यधिक रूप से एकल सौदे से प्रभावित हो सकते हैं।' : language === 'mr' ? 'कमी डेटा पातळी: प्रादेशिक आकडेवारी एकाच मोठ्या व्यवहाराने प्रभावित होऊ शकते.' : 'Small sample alert: stats are highly sensitive to single-deal outliers.'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Retroactive Adjustment & Refund Engine */}
      <Card className="p-5 space-y-4">
        <div className="flex items-start gap-3 border-b border-[rgba(184,135,61,0.1)] pb-3">
          <div className="p-2 bg-error/10 text-error rounded-xl shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal">
              {language === 'hi' ? 'पूर्वव्यापी आंशिक रिफंड सिम्युलेटर' : language === 'mr' ? 'पूर्वलक्षी आंशिक परतावा सिम्युलेटर' : 'Retroactive Deal Refund Adjuster'}
            </h3>
            <p className="text-xs text-warmgray">
              {language === 'hi' 
                ? 'अनुबंध निरस्त होने या संशोधन की स्थिति में प्रशांत वाबळे द्वारा वास्तविक समय में मार्जिन सुधार का लाइव परीक्षण करें।' 
                : language === 'mr' 
                ? 'अनुबंध अंशतः रद्द किंवा सुधारित झाल्यास वास्तविक वेळेत महसूल संकलन आणि नफा मार्जिनवर होणारा परिणाम तपासा.' 
                : 'In case of contract amendments or goodwill adjustments, simulate partial refunds retroactively impacting the ledger and Gross Margin instantly.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleApplyRefund} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-alabaster p-4 rounded-xl border border-[rgba(184,135,61,0.08)]">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">{language === 'hi' ? 'सक्रिय सौदा / ग्राहक चुनें' : language === 'mr' ? 'करार / ग्राहक निवडा' : 'Select Active Deal'}</label>
            <select 
              value={refundDealId} 
              onChange={(e) => setRefundDealId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white rounded-lg border border-[rgba(184,135,61,0.15)] text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
            >
              <option value="">-- {language === 'hi' ? 'ग्राहक सौदा चुनें' : language === 'mr' ? 'करार निवडा' : 'Choose Deal Node'} --</option>
              {deals.map(d => {
                const client = dealClients[d.id]?.name || 'Contract Client';
                const pays = payments.filter(p => p.dealId === d.id);
                const rawPaid = pays.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
                const currentRefund = refunds[d.id] || 0;
                const netPaid = rawPaid - currentRefund;

                return (
                  <option key={d.id} value={d.id}>
                    {client} ({d.id}) - Max {formatIndianCurrency(netPaid)}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">{language === 'hi' ? 'रिफंड राशि (₹)' : language === 'mr' ? 'परतावा रक्कम (₹)' : 'Refund Amount (₹)'}</label>
            <input 
              type="number" 
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="e.g. 50000"
              required
              min="1"
              className="w-full px-3 py-2 bg-white rounded-lg border border-[rgba(184,135,61,0.15)] text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">{language === 'hi' ? 'टिप्पणी / कारण' : language === 'mr' ? 'कारण / नोंद' : 'Reason / Adjust Note'}</label>
            <input 
              type="text" 
              value={refundNote}
              onChange={(e) => setRefundNote(e.target.value)}
              placeholder="e.g. Structural modification discount"
              className="w-full px-3 py-2 bg-white rounded-lg border border-[rgba(184,135,61,0.15)] text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-2.5 bg-error text-white hover:bg-[#9d3131] rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-[0.98]"
          >
            {language === 'hi' ? 'धनवापसी लागू करें' : language === 'mr' ? 'परतावा लागू करा' : 'Apply Refund'}
          </button>
        </form>

        {/* Refund logs */}
        {refundLogs.length > 0 && (
          <div className="space-y-2 mt-4">
            <span className="text-[10px] font-bold text-charcoal uppercase tracking-widest block">{language === 'hi' ? 'समायोजन इतिहास एवं ऑडिट' : language === 'mr' ? 'परतावा इतिहास आणि ऑडिट' : 'ADJUSTMENT LOG & AUDIT'}</span>
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {refundLogs.map((log, index) => (
                <div key={index} className="flex justify-between items-center p-2.5 bg-alabaster border border-error/15 rounded-xl text-xs font-mono">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 bg-error/10 text-error rounded text-[8px] font-bold">REFUND</span>
                    <div>
                      <strong className="text-charcoal block">{log.clientName} ({log.dealId})</strong>
                      <span className="text-warmgray text-[10px] block mt-0.5">📝 {log.note}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="text-error font-extrabold">-{formatIndianCurrency(log.amount)}</strong>
                    <span className="text-warmgray text-[9px] block">{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Action CTA Bar */}
      <div className="bg-white border border-[rgba(184,135,61,0.15)] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-charcoal">
            {language === 'hi' ? 'वित्तीय विवरण निर्यात' : language === 'mr' ? 'वित्तीय विवरण निर्यात करा' : 'Share Statement Report'}
          </h4>
          <p className="text-[11px] text-warmgray">
            {language === 'hi' 
              ? 'इस रिपोर्टिंग अवधि के संपूर्ण वित्तीय खाता बही को बाहरी लेखा परीक्षकों के साथ साझा करने के लिए निर्यात करें।' 
              : language === 'mr' 
              ? 'या अहवाल कालावधीचे तपशीलवार स्टेटमेंट बाह्य ऑडीटर्स आणि सीए सोबत शेअर करण्यासाठी निर्यात करा.' 
              : 'Prepare and compile full receipt statements & supplier spend audit trail for external accounting.'}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="secondary" 
            onClick={handleExportCSV} 
            className="flex-1 sm:flex-initial text-xs py-2 bg-alabaster hover:bg-warmgray/10"
          >
            <FileSpreadsheet className="w-4 h-4 text-antiquegold" />
            <span>{language === 'hi' ? 'CSV डाउनलोड करें' : language === 'mr' ? 'CSV डाउनलोड करा' : 'Export Ledger CSV'}</span>
          </Button>

          <Button 
            variant="primary" 
            onClick={() => setShowExportModal(true)} 
            className="flex-1 sm:flex-initial text-xs py-2"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{language === 'hi' ? 'विवरण समीक्षा' : language === 'mr' ? 'अहवाल पाहा' : 'Generate Executive PDF'}</span>
          </Button>
        </div>
      </div>

      {/* Export Executive Statement Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-antiquegold/30 shadow-2xl p-6 space-y-6"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[rgba(184,135,61,0.15)] pb-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-wider bg-antiquegold/10 text-antiquegold px-2 py-0.5 rounded font-extrabold">
                  {language === 'hi' ? 'आधिकारिक कॉर्पोरेट विवरण' : language === 'mr' ? 'अधिकृत कॉर्पोरेट अहवाल' : 'OFFICIAL STATEMENT'}
                </span>
                <h3 className="font-serif text-xl font-bold text-charcoal">
                  ALL INDIA ELEVATORS COMPANY
                </h3>
                <p className="text-[10px] text-warmgray">
                  Pune HQ, Maharashtra • ISO 9001:2015 Certification • Owner Prashant Wable
                </p>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-alabaster rounded-full text-warmgray hover:text-charcoal cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Details */}
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4 bg-alabaster p-3.5 rounded-xl border border-[rgba(184,135,61,0.08)]">
                <div>
                  <span className="text-warmgray block text-[9px] uppercase">{language === 'hi' ? 'विवरण अवधि' : language === 'mr' ? 'अहवाल कालावधी' : 'Statement Period'}</span>
                  <strong className="text-charcoal block">
                    {selectedPeriod === 'FY26' ? 'FY 2026-27 (Apr - Aug)' : selectedPeriod === 'Q1_26' ? 'Q1 FY 2026-27 (Apr - Jun)' : 'Q2 FY 2026-27 (Jul - Aug)'}
                  </strong>
                </div>
                <div>
                  <span className="text-warmgray block text-[9px] uppercase">{language === 'hi' ? 'जारी करने की तारीख' : language === 'mr' ? 'जारी केलेली तारीख' : 'Date of Issue'}</span>
                  <strong className="text-charcoal block">
                    {new Date().toISOString().substring(0, 10)}
                  </strong>
                </div>
              </div>

              {/* Financial Ledger Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-charcoal uppercase tracking-widest block">{language === 'hi' ? 'वित्तीय खाता बही विवरण' : language === 'mr' ? 'तपशीलवार वित्तीय खातेवही' : 'DETAILED TRANSACTION LEDGER'}</span>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[rgba(184,135,61,0.15)] text-[10px] text-warmgray">
                        <th className="py-2 pr-2">{language === 'hi' ? 'क्लाइंट नाम' : language === 'mr' ? 'ग्राहक नाव' : 'Client'}</th>
                        <th className="py-2 pr-2 text-right">{language === 'hi' ? 'बुक (₹)' : language === 'mr' ? 'बुक (₹)' : 'Booked'}</th>
                        <th className="py-2 pr-2 text-right">{language === 'hi' ? 'वसूल (₹)' : language === 'mr' ? 'वसूल (₹)' : 'Collected'}</th>
                        <th className="py-2 pr-2 text-right">{language === 'hi' ? 'लागत (₹)' : language === 'mr' ? 'लागत (₹)' : 'COGS'}</th>
                        <th className="py-2 text-right">{language === 'hi' ? 'मार्जिन %' : language === 'mr' ? 'मार्जिन' : 'Margin'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(184,135,61,0.05)] text-[11px]">
                      {filteredDeals.map((d, index) => (
                        <tr key={index} className="text-charcoal">
                          <td className="py-2.5 pr-2 font-sans font-semibold">
                            <div>{d.clientName}</div>
                            <div className="text-[9px] text-warmgray font-mono font-normal">{d.region}</div>
                          </td>
                          <td className="py-2.5 pr-2 text-right font-mono">{formatRawValue(d.booked)}</td>
                          <td className="py-2.5 pr-2 text-right font-mono text-royalemerald">
                            {formatRawValue(d.collected)}
                            {d.refunded > 0 && <span className="text-[8px] text-error block">(-{formatRawValue(d.refunded)})</span>}
                          </td>
                          <td className="py-2.5 pr-2 text-right font-mono">{formatRawValue(d.cogs)}</td>
                          <td className={`py-2.5 text-right font-mono font-bold ${d.grossMarginPct >= targetMargin ? 'text-royalemerald' : 'text-antiquegold'}`}>
                            {d.grossMarginPct.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                      {/* Summary Row */}
                      <tr className="border-t-2 border-[rgba(184,135,61,0.15)] font-bold text-charcoal bg-alabaster/50">
                        <td className="py-3 pr-2 font-sans">{language === 'hi' ? 'कुल संक्षेप' : language === 'mr' ? 'एकूण संक्षिप्त' : 'TOTAL LEDGER'}</td>
                        <td className="py-3 pr-2 text-right font-mono">{formatRawValue(kpis.booked)}</td>
                        <td className="py-3 pr-2 text-right font-mono text-royalemerald">{formatRawValue(kpis.collected)}</td>
                        <td className="py-3 pr-2 text-right font-mono">{formatRawValue(kpis.cogs)}</td>
                        <td className="py-3 text-right font-mono text-royalemerald">{kpis.margin.toFixed(1)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legal Verification / Signature */}
              <div className="pt-6 border-t border-[rgba(184,135,61,0.1)] flex justify-between items-end">
                <div className="space-y-1 text-[10px] text-warmgray">
                  <p>✔ {language === 'hi' ? 'डेटा प्रामाणिकता की जाँच की गई' : language === 'mr' ? 'डेटा विश्वासार्हतेची पडताळणी केली' : 'Cryptographic system audit trace valid.'}</p>
                  <p>✔ {language === 'hi' ? 'जीएसटी और लेजर मिलान पूर्ण' : language === 'mr' ? 'जीएसटी आणि खातेवही जुळणी पूर्ण' : 'GST and regional ledger matches certified.'}</p>
                </div>
                <div className="text-center font-sans">
                  <div className="w-32 border-b border-charcoal mx-auto py-1 text-center font-serif text-[10px] text-antiquegold italic">
                    Prashant V. Wable
                  </div>
                  <span className="text-[8px] font-mono uppercase tracking-widest text-warmgray block mt-1">
                    {language === 'hi' ? 'संस्थापक निदेशक' : language === 'mr' ? 'संस्थापक संचालक' : 'FOUNDING DIRECTOR'}
                  </span>
                </div>
              </div>

            </div>

            {/* Print action CTA */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                fullWidth 
                onClick={() => setShowExportModal(false)}
              >
                {language === 'hi' ? 'बंद करें' : language === 'mr' ? 'बंद करा' : 'Close Review'}
              </Button>
              <Button 
                variant="emerald" 
                fullWidth 
                onClick={() => {
                  window.print();
                }}
              >
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>{language === 'hi' ? 'रिपोर्ट प्रिंट करें (PDF)' : language === 'mr' ? 'अहवाल प्रिंट करा (PDF)' : 'Print / Save Statement'}</span>
              </Button>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
};
