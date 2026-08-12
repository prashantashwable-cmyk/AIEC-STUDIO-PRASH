import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Button, Badge } from './Common';
import { 
  Award, TrendingUp, TrendingDown, AlertTriangle, Search, 
  Compass, Hammer, Sliders, Calendar, UserCheck, Star, 
  X, ShieldAlert, Zap, Trophy, Percent, User, ListFilter, HelpCircle, AlertCircle
} from 'lucide-react';
import { User as UserType } from '../types';

interface WorkerPerformanceLeaderboardProps {
  user: UserType;
  language?: 'en' | 'mr' | 'hi';
}

// Sub-interface for rich worker performance data
interface SurveyorPerformance {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  region: string;
  joinedDate: string;
  isMidPeriod: boolean;
  isFlagged: boolean;
  bio: string;
  // Stats
  leadsCaptured: { week: number; month: number; allTime: number };
  leadsConverted: { week: number; month: number; allTime: number };
  geoAccuracy: number; // 0 to 100%
  commissionEarned: { week: number; month: number; allTime: number }; // in ₹
  history: { date: string; action: string; status: 'completed' | 'flagged' | 'pending' }[];
  unlockedRewards: string[];
}

interface TechnicianPerformance {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  region: string;
  joinedDate: string;
  isMidPeriod: boolean;
  isFlagged: boolean;
  bio: string;
  // Stats
  jobsCompleted: { week: number; month: number; allTime: number };
  onTimeRate: number; // 0 to 100%
  sopVerificationRate: number; // 0 to 100%
  avgRating: number; // 1 to 5
  history: { date: string; action: string; status: 'completed' | 'flagged' | 'pending' }[];
  unlockedRewards: string[];
}

export const WorkerPerformanceLeaderboard: React.FC<WorkerPerformanceLeaderboardProps> = ({ 
  user, 
  language = 'en' 
}) => {
  // Local active tabs
  const [activeRole, setActiveRole] = useState<'surveyor' | 'technician'>('surveyor');
  const [period, setPeriod] = useState<'week' | 'month' | 'allTime'>('month');
  const [showRisingStars, setShowRisingStars] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Weights configuration
  const [activityWeight, setActivityWeight] = useState<number>(40);
  const [qualityWeight, setQualityWeight] = useState<number>(40);
  const [speedWeight, setSpeedWeight] = useState<number>(20);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Selected worker details modal state
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  // Local state for flagged users to support flagging real-time
  const [flaggedWorkerIds, setFlaggedWorkerIds] = useState<string[]>(['nitin_kamble']);

  // Translation helpers
  const translations = {
    en: {
      title: "Worker Performance Leaderboard",
      subtitle: "Optimize incentives, reward excellence, and audit surveyor & technician KPIs.",
      surveyors: "Field Surveyors",
      technicians: "Installation Techs",
      thisWeek: "This Week",
      thisMonth: "This Month",
      allTime: "All-Time",
      risingStars: "✨ Rising Stars (Highest Trend Delta)",
      absoluteTop: "🏆 Top Performers (Absolute)",
      configureWeights: "Configure Performance Metric Weights",
      weightsHelp: "Adjust weights to calculate a custom Weighted Performance Index (WPI) for rewards and commissions.",
      activityVol: "Activity Volume",
      qualityAcc: "Quality & Accuracy",
      speedEfficiency: "Speed & Efficiency",
      rank: "Rank",
      name: "Worker / Region",
      primaryMetric: "Primary Metric",
      trend: "7-Day Trend",
      wpiScore: "WPI Score",
      searchPlaceholder: "Search worker name or region...",
      noResults: "No workers matching search filters.",
      flagged: "FLAGGED / UNDER REVIEW",
      newStarter: "Joined Mid-Period (Pro-rated)",
      profileTitle: "Worker Performance Profile",
      bio: "Personal Profile Bio",
      contact: "Contact Number",
      unlockedRewards: "Unlocked Rewards & Badges",
      recentActivityLogs: "Recent Operations & Audits",
      excludeAction: "Flag Worker & Exclude from Ranking",
      excludeAlert: "Suspicious geo-verification or SOP manipulation suspected. Worker will be omitted from active payouts and active leaderboard.",
      unflagAction: "Clear Flags & Restore Ranking",
      closeBtn: "Close Details",
      formula: "WPI Score Formula",
      tiesBrokenBy: "Ties are automatically resolved using",
      geoAccuracyText: "Geo-verification accuracy",
      avgRatingText: "Average customer rating",
      surveyorMetrics: {
        captures: "Leads Captured",
        conversions: "Leads Converted",
        accuracy: "Geo-Accuracy",
        commission: "Commissions"
      },
      technicianMetrics: {
        completions: "Jobs Completed",
        onTime: "On-Time Delivery",
        sopRate: "SOP Quality Checks",
        rating: "Avg Customer Rating"
      }
    },
    mr: {
      title: "कामगार कामगिरी लीडरबोर्ड",
      subtitle: "प्रोत्साहने अनुकूल करा, उत्कृष्टतेचा सन्मान करा आणि कामगारांच्या कामगिरीचे ऑडिट करा.",
      surveyors: "क्षेत्र सर्वेक्षक (Surveyors)",
      technicians: "इन्स्टॉलेशन तंत्रज्ञ (Technicians)",
      thisWeek: "या आठवड्यात",
      thisMonth: "या महिन्यात",
      allTime: "सर्व-वेळ",
      risingStars: "✨ उगवते तारे (Rising Stars)",
      absoluteTop: "🏆 सर्वोत्तम कामगिरी (Absolute)",
      configureWeights: "कामगिरी मेट्रिक वेटिंग सेटिंग्स",
      weightsHelp: "बक्षिसे आणि कमिशनसाठी सानुकूल कामगिरी निर्देशांक (WPI) मोजण्यासाठी भार समायोजित करा.",
      activityVol: "कृतींचे प्रमाण (Volume)",
      qualityAcc: "गुणवत्ता आणि अचूकता",
      speedEfficiency: "वेग आणि कार्यक्षमता",
      rank: "क्रमांक",
      name: "कामगार / क्षेत्र",
      primaryMetric: "मुख्य मेट्रिक",
      trend: "७-दिवसांचा कल (Trend)",
      wpiScore: "WPI गुण",
      searchPlaceholder: "नाव किंवा क्षेत्र शोधा...",
      noResults: "या फिल्टरसह कोणतेही कामगार आढळले नाहीत.",
      flagged: "ध्वजांकित / चौकशी सुरू",
      newStarter: "मध्येच सामील (Pro-rated)",
      profileTitle: "कामगार कामगिरी प्रोफाइल",
      bio: "वैयक्तिक बायो",
      contact: "संपर्क नंबर",
      unlockedRewards: "अनलॉक केलेली बक्षिसे आणि बॅज",
      recentActivityLogs: "अलीकडील ऑपरेशन्स आणि ऑडिट",
      excludeAction: "रँकिंगमधून वगळा (Flag Worker)",
      excludeAlert: "संशयास्पद स्थान क्रेडेंशियल किंवा चुकीच्या नोंदी आढळल्यास कामगाराला तात्पुरते रँकिंगमधून वगळले जाते.",
      unflagAction: "फ्लॅग साफ करा आणि पूर्ववत करा",
      closeBtn: "तपशील बंद करा",
      formula: "WPI गुण सूत्र",
      tiesBrokenBy: "समान गुण असल्यास",
      geoAccuracyText: "भौगोलिक अचूकता वापरून तोडला जातो",
      avgRatingText: "सरासरी ग्राहक रेटिंग वापरून तोडला जातो",
      surveyorMetrics: {
        captures: "लीड्स कॅप्चर केले",
        conversions: "करार जिंकले",
        accuracy: "स्थान अचूकता",
        commission: "कमिशन मिळवले"
      },
      technicianMetrics: {
        completions: "काम पूर्ण केले",
        onTime: "वेळेवर वितरण",
        sopRate: "SOP गुणवत्ता तपासणी",
        rating: "ग्राहक रेटिंग"
      }
    },
    hi: {
      title: "कार्यकर्ता प्रदर्शन लीडरबोर्ड",
      subtitle: "प्रोत्साहन अनुकूल करें, उत्कृष्टता को पुरस्कृत करें, और कार्यकर्ताओं के प्रदर्शन का ऑडिट करें.",
      surveyors: "फील्ड सर्वेक्षक",
      technicians: "तकनीशियन टीम",
      thisWeek: "इस सप्ताह",
      thisMonth: "इस महीने",
      allTime: "कुल मिलाकर",
      risingStars: "✨ उभरते सितारे (Rising Stars)",
      absoluteTop: "🏆 शीर्ष प्रदर्शनकर्ता",
      configureWeights: "प्रदर्शन मेट्रिक भार कॉन्फ़िगर करें",
      weightsHelp: "पुरस्कार और कमीशन की गणना के लिए प्रदर्शन सूचकांक (WPI) समायोजित करें.",
      activityVol: "गतिविधि का स्तर (Volume)",
      qualityAcc: "गुणवत्ता और सटीकता",
      speedEfficiency: "गति और दक्षता",
      rank: "रैंक",
      name: "कार्यकर्ता / क्षेत्र",
      primaryMetric: "मुख्य मेट्रिक",
      trend: "7-दिवसीय रुझान",
      wpiScore: "WPI स्कोर",
      searchPlaceholder: "नाम या क्षेत्र खोजें...",
      noResults: "इस फ़िल्टर से कोई कार्यकर्ता मेल नहीं खाता.",
      flagged: "ध्वजांकित / जांच के अधीन",
      newStarter: "सत्र के बीच शामिल (Pro-rated)",
      profileTitle: "कार्यकर्ता प्रदर्शन प्रोफ़ाइल",
      bio: "व्यक्तिगत प्रोफ़ाइल जीवनी",
      contact: "संपर्क नंबर",
      unlockedRewards: "अनलॉक किए गए पुरस्कार और बैज",
      recentActivityLogs: "हालिया संचालन और ऑडिट",
      excludeAction: "रैंकिंग से बाहर करें (Flag)",
      excludeAlert: "संदिग्ध भू-सत्यापन या एसओपी हेरफेर के संदेह में कार्यकर्ता कोPayouts और रैंकिंग से निलंबित किया जा सकता है.",
      unflagAction: "फ्लैग हटाएं और बहाल करें",
      closeBtn: "विवरण बंद करें",
      formula: "WPI स्कोर फॉर्मूला",
      tiesBrokenBy: "समान अंक होने पर",
      geoAccuracyText: "भू-सत्यापन सटीकता से निर्णय होता है",
      avgRatingText: "औसत ग्राहक रेटिंग से निर्णय होता है",
      surveyorMetrics: {
        captures: "लीड्स कैप्चर किए",
        conversions: "लीड्स कनवर्ट किए",
        accuracy: "भू-सटीकता",
        commission: "कमीशन अर्जित"
      },
      technicianMetrics: {
        completions: "कार्य पूरे किए",
        onTime: "समय पर वितरण",
        sopRate: "SOP गुणवत्ता जांच",
        rating: "ग्राहक रेटिंग"
      }
    }
  };

  const t = translations[language] || translations['en'];

  // Seeded database for surveyors
  const surveyorsData: SurveyorPerformance[] = [
    {
      id: 'amit_sharma',
      name: 'Amit Sharma',
      phone: '+91 98765 43211',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      region: 'Pune North (Chakan)',
      joinedDate: '2025-01-10',
      isMidPeriod: false,
      isFlagged: false,
      bio: 'High-performing regional surveyor. Specialist in major industrial elevator installations and municipal zoning guidelines.',
      leadsCaptured: { week: 6, month: 24, allTime: 184 },
      leadsConverted: { week: 4, month: 18, allTime: 122 },
      geoAccuracy: 98.4,
      commissionEarned: { week: 12000, month: 54000, allTime: 366000 },
      history: [
        { date: '2026-07-08', action: 'Lead Captured - Royal Arcade, Chakan (5 Floors)', status: 'completed' },
        { date: '2026-07-07', action: 'GPS Checkin - Verified elevator shaft dimensions', status: 'completed' },
        { date: '2026-07-05', action: 'Lead Converted - Shaurya Tower, Pune North (12 Floors)', status: 'completed' },
        { date: '2026-07-01', action: 'Assigned Territory Target: 20 leads', status: 'completed' }
      ],
      unlockedRewards: ['🏆 Elite Capture King', '⭐ 95%+ Geo-Precision Badge', '🎖️ Monsoon Target Achiever']
    },
    {
      id: 'sanjay_deshmukh',
      name: 'Sanjay Deshmukh',
      phone: '+91 99887 76655',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      region: 'Pune West (Hinjewadi)',
      joinedDate: '2025-03-15',
      isMidPeriod: false,
      isFlagged: false,
      bio: 'Dedicated real-estate and commercial elevator deployment scout with an excellent conversion ratio.',
      leadsCaptured: { week: 5, month: 19, allTime: 112 },
      leadsConverted: { week: 3, month: 14, allTime: 82 },
      geoAccuracy: 95.8,
      commissionEarned: { week: 9000, month: 42000, allTime: 246000 },
      history: [
        { date: '2026-07-08', action: 'Lead Captured - Hinjewadi Tech Park, Phase 3', status: 'completed' },
        { date: '2026-07-06', action: 'GPS Checkin - Shaft inspection for 8 Pax elevator', status: 'completed' },
        { date: '2026-07-03', action: 'Lead Converted - TechNest Residency (8 Floors)', status: 'completed' }
      ],
      unlockedRewards: ['⭐ 95%+ Geo-Precision Badge', '💼 Corporate Elevator Closer']
    },
    {
      id: 'priya_patil',
      name: 'Priya Patil',
      phone: '+91 98334 11223',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      region: 'Pune South (Kothrud)',
      joinedDate: '2026-06-15', // Mid-period!
      isMidPeriod: true,
      isFlagged: false,
      bio: 'Enthusiastic new surveyor. Highly motivated with a rapid capture speed, currently pro-rated due to mid-period start.',
      leadsCaptured: { week: 7, month: 15, allTime: 15 },
      leadsConverted: { week: 5, month: 12, allTime: 12 },
      geoAccuracy: 91.2,
      commissionEarned: { week: 15000, month: 36000, allTime: 36000 },
      history: [
        { date: '2026-07-09', action: 'Lead Captured - Kothrud Plaza Commercial', status: 'completed' },
        { date: '2026-07-07', action: 'Lead Converted - Shanti Niwas (4 Floors)', status: 'completed' },
        { date: '2026-07-05', action: 'Mid-Period Onboarding On-Duty Approval', status: 'completed' }
      ],
      unlockedRewards: ['🚀 Rocket Starter Award', '✨ Week Performance Spike Leader']
    },
    {
      id: 'vikram_shinde',
      name: 'Vikram Shinde',
      phone: '+91 91234 45566',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      region: 'Pune East (Kharadi)',
      joinedDate: '2025-08-20',
      isMidPeriod: false,
      isFlagged: false,
      bio: 'Experienced land scout specializing in high-density residential high-rises. Strong developer ties.',
      leadsCaptured: { week: 3, month: 12, allTime: 94 },
      leadsConverted: { week: 2, month: 8, allTime: 58 },
      geoAccuracy: 97.2,
      commissionEarned: { week: 6000, month: 24000, allTime: 174000 },
      history: [
        { date: '2026-07-04', action: 'Lead Captured - Kharadi Heights Phase 2', status: 'completed' },
        { date: '2026-06-28', action: 'Lead Converted - Sunshine Residency', status: 'completed' }
      ],
      unlockedRewards: ['🏢 High-Rise Specialist Badge']
    },
    {
      id: 'nitin_kamble',
      name: 'Nitin Kamble',
      phone: '+91 94556 12345',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      region: 'Pune South (Katraj)',
      joinedDate: '2025-11-01',
      isMidPeriod: false,
      isFlagged: true,
      bio: 'Experienced agent. Currently flagged due to geo-accuracy anomalies detected by high HDOP jumps.',
      leadsCaptured: { week: 8, month: 28, allTime: 142 },
      leadsConverted: { week: 2, month: 10, allTime: 79 },
      geoAccuracy: 64.5,
      commissionEarned: { week: 4000, month: 20000, allTime: 158000 },
      history: [
        { date: '2026-07-06', action: 'Flagged Checkin - Fake GPS jump detected (HDOP 8.4)', status: 'flagged' },
        { date: '2026-07-05', action: 'Lead Captured - Katraj Lake View society', status: 'completed' },
        { date: '2026-07-02', action: 'Flagged Checkin - Location out of claimed geofence boundary', status: 'flagged' }
      ],
      unlockedRewards: ['⚠️ Safety/Quality Probation']
    }
  ];

  // Seeded database for technicians
  const techniciansData: TechnicianPerformance[] = [
    {
      id: 'rajesh_patel',
      name: 'Rajesh Patel',
      phone: '+91 98765 43212',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      region: 'Pune South (Dhankawadi)',
      joinedDate: '2025-02-01',
      isMidPeriod: false,
      isFlagged: false,
      bio: 'Senior commissioning master technician. Highly experienced in gearless traction lifts and high-speed safety interlocks.',
      jobsCompleted: { week: 3, month: 12, allTime: 78 },
      onTimeRate: 100.0,
      sopVerificationRate: 99.2,
      avgRating: 4.9,
      history: [
        { date: '2026-07-08', action: 'Job Completed - Dhankawadi Towers Lift B Commissioned', status: 'completed' },
        { date: '2026-07-06', action: 'SOP Verified - Floor 10 Limit switch safety test', status: 'completed' },
        { date: '2026-07-04', action: 'Job Started - Kothrud Plaza Installation Stage 1', status: 'completed' }
      ],
      unlockedRewards: ['🛠️ Master Builder Certificate', '⚡ Zero-Failure Installation Shield', '🏆 customer Choice Champion']
    },
    {
      id: 'kiran_gawde',
      name: 'Kiran Gawde',
      phone: '+91 97665 44332',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      region: 'Pune West (Aundh)',
      joinedDate: '2026-06-20', // Mid-period!
      isMidPeriod: true,
      isFlagged: false,
      bio: 'Enthusiastic mechanical technician with excellent speed and high compliance on structural checklist SOPs.',
      jobsCompleted: { week: 2, month: 10, allTime: 10 },
      onTimeRate: 90.0,
      sopVerificationRate: 96.5,
      avgRating: 4.7,
      history: [
        { date: '2026-07-09', action: 'SOP Step Approved - Steel guide rail alignment', status: 'completed' },
        { date: '2026-07-05', action: 'Job Completed - Aundh Elite Commercial Lift 1', status: 'completed' }
      ],
      unlockedRewards: ['✨ Elite Safety Protocol Compliance', '🚀 Fast Starter Badge']
    },
    {
      id: 'amol_joshi',
      name: 'Amol Joshi',
      phone: '+91 98556 77889',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      region: 'Pune North (Chinchwad)',
      joinedDate: '2025-05-12',
      isMidPeriod: false,
      isFlagged: false,
      bio: 'A highly methodical electronic controls installer. Specializes in VVVF drive configuration and automated car leveling calibration.',
      jobsCompleted: { week: 2, month: 8, allTime: 62 },
      onTimeRate: 95.0,
      sopVerificationRate: 94.2,
      avgRating: 4.8,
      history: [
        { date: '2026-07-07', action: 'VVVF Drive Calibrated - Chinchwad Elite Residency', status: 'completed' },
        { date: '2026-07-03', action: 'Job Completed - Balaji Tower Lift A Handover', status: 'completed' }
      ],
      unlockedRewards: ['🔌 Electronic Calibration Specialist', '🛡️ Safe-SOP Shield']
    },
    {
      id: 'siddharth_mehta',
      name: 'Siddharth Mehta',
      phone: '+91 99345 56789',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      region: 'Pune East (Hadapsar)',
      joinedDate: '2025-09-01',
      isMidPeriod: false,
      isFlagged: false,
      bio: 'Reliable and customer-oriented installer with a strong focus on finishing aesthetic cabin fittings.',
      jobsCompleted: { week: 1, month: 7, allTime: 42 },
      onTimeRate: 85.7,
      sopVerificationRate: 92.0,
      avgRating: 4.4,
      history: [
        { date: '2026-07-04', action: 'Cabin Fitting Complete - Hadapsar Residency', status: 'completed' },
        { date: '2026-06-29', action: 'SOP Verified - Car safety buffer mechanics', status: 'completed' }
      ],
      unlockedRewards: ['🎨 Cabin Craftsman Badge']
    },
    {
      id: 'sachin_kadam',
      name: 'Sachin Kadam',
      phone: '+91 98112 23344',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      region: 'Pune South (Sinhagad)',
      joinedDate: '2025-07-15',
      isMidPeriod: false,
      isFlagged: false,
      bio: 'Experienced field worker, primarily handles hydraulic lift systems and older shaft retrofits.',
      jobsCompleted: { week: 1, month: 5, allTime: 39 },
      onTimeRate: 80.0,
      sopVerificationRate: 88.5,
      avgRating: 4.3,
      history: [
        { date: '2026-07-05', action: 'SOP Verified - Hydraulic cylinder pressure relief check', status: 'completed' },
        { date: '2026-06-28', action: 'Job Completed - Sinhagad Commercial Plaza Lift 1', status: 'completed' }
      ],
      unlockedRewards: ['💧 Hydraulic Systems Badge']
    }
  ];

  // Calculated weighted score for each surveyor
  const processedSurveyors = useMemo(() => {
    return surveyorsData.map(s => {
      // Omit from ranking score if flagged or let them rank but mark flagged status
      const isFlagged = flaggedWorkerIds.includes(s.id);

      // Volume: leads captured (normalize: max in period is 28)
      const capturesVal = s.leadsCaptured[period];
      const maxCaptures = period === 'week' ? 8 : period === 'month' ? 28 : 184;
      const volumeScore = maxCaptures > 0 ? (capturesVal / maxCaptures) * 100 : 0;

      // Quality: Geo-accuracy (0-100)
      const qualityScore = s.geoAccuracy;

      // Speed: conversion rate (leads Converted / leads Captured)
      const captured = s.leadsCaptured[period];
      const converted = s.leadsConverted[period];
      const speedScore = captured > 0 ? (converted / captured) * 100 : 0;

      // Weighted score
      let wpi = (volumeScore * activityWeight + qualityScore * qualityWeight + speedScore * speedWeight) / 100;
      
      // Normalize if joined mid-period to make it fair
      if (s.isMidPeriod && period !== 'allTime') {
        wpi = wpi * 1.3; // Give pro-rated boost so mid-period joiners can rank fairly
      }

      // Rounded
      const wpiRounded = Math.min(100, Math.round(wpi * 10) / 10);

      // Generate trend sparkline data points
      let sparkline = [40, 50, 45, 65, 80];
      if (s.id === 'amit_sharma') sparkline = [82, 85, 90, 95, 98];
      if (s.id === 'sanjay_deshmukh') sparkline = [70, 75, 82, 88, 92];
      if (s.id === 'priya_patil') sparkline = [30, 50, 65, 82, 94]; // Huge upward trend!
      if (s.id === 'vikram_shinde') sparkline = [80, 81, 82, 80, 82];
      if (s.id === 'nitin_kamble') sparkline = [90, 80, 70, 60, 45]; // Downward trend!

      // Trend delta for rising stars (last value minus first value)
      const delta = sparkline[sparkline.length - 1] - sparkline[0];

      return {
        ...s,
        isFlagged,
        wpiScore: isFlagged ? 0 : wpiRounded,
        sparkline,
        trendDelta: delta,
        volumeValue: capturesVal,
        qualityValue: qualityScore,
        speedValue: Math.round(speedScore * 10) / 10
      };
    });
  }, [period, activityWeight, qualityWeight, speedWeight, flaggedWorkerIds]);

  // Calculated weighted score for each technician
  const processedTechnicians = useMemo(() => {
    return techniciansData.map(t => {
      const isFlagged = flaggedWorkerIds.includes(t.id);

      // Volume: jobs completed (normalize: max in period is 12)
      const completionsVal = t.jobsCompleted[period];
      const maxCompletions = period === 'week' ? 3 : period === 'month' ? 12 : 78;
      const volumeScore = maxCompletions > 0 ? (completionsVal / maxCompletions) * 100 : 0;

      // Quality: SOP check verification rate (0-100)
      const qualityScore = t.sopVerificationRate;

      // Speed: on-time rate and average rating (scale 1-5 rating to 0-100)
      const speedScore = (t.onTimeRate * 0.5) + ((t.avgRating / 5) * 100 * 0.5);

      let wpi = (volumeScore * activityWeight + qualityScore * qualityWeight + speedScore * speedWeight) / 100;

      if (t.isMidPeriod && period !== 'allTime') {
        wpi = wpi * 1.3; // Pro-rated boost
      }

      const wpiRounded = Math.min(100, Math.round(wpi * 10) / 10);

      // Generate trend sparklines
      let sparkline = [50, 60, 62, 70, 75];
      if (t.id === 'rajesh_patel') sparkline = [92, 95, 96, 99, 100];
      if (t.id === 'kiran_gawde') sparkline = [40, 60, 72, 85, 95]; // Huge rising trend!
      if (t.id === 'amol_joshi') sparkline = [85, 88, 91, 92, 94];
      if (t.id === 'siddharth_mehta') sparkline = [75, 78, 80, 82, 85];
      if (t.id === 'sachin_kadam') sparkline = [82, 81, 80, 78, 76];

      const delta = sparkline[sparkline.length - 1] - sparkline[0];

      return {
        ...t,
        isFlagged,
        wpiScore: isFlagged ? 0 : wpiRounded,
        sparkline,
        trendDelta: delta,
        volumeValue: completionsVal,
        qualityValue: qualityScore,
        speedValue: t.onTimeRate
      };
    });
  }, [period, activityWeight, qualityWeight, speedWeight, flaggedWorkerIds]);

  // Combined sorted active list
  const currentLeaderboardList = useMemo(() => {
    const rawList = activeRole === 'surveyor' ? processedSurveyors : processedTechnicians;
    
    // Filter by search query
    const filtered = rawList.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.region.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort:
    // If showRisingStars is true, sort by trendDelta descending (biggest improvers first)
    // If false, sort by wpiScore descending.
    // TIES BROKEN BY:
    //   - For surveyors: tie broken by geoAccuracy
    //   - For technicians: tie broken by average rating
    return [...filtered].sort((a, b) => {
      // Flagged items always drop to the very bottom
      if (a.isFlagged && !b.isFlagged) return 1;
      if (!a.isFlagged && b.isFlagged) return -1;

      if (showRisingStars) {
        if (b.trendDelta !== a.trendDelta) {
          return b.trendDelta - a.trendDelta;
        }
      } else {
        if (b.wpiScore !== a.wpiScore) {
          return b.wpiScore - a.wpiScore;
        }
      }

      // Tie breaker!
      if (activeRole === 'surveyor') {
        return (b.geoAccuracy || 0) - (a.geoAccuracy || 0);
      } else {
        return ((b as any).avgRating || 0) - ((a as any).avgRating || 0);
      }
    });
  }, [activeRole, processedSurveyors, processedTechnicians, showRisingStars, searchQuery]);

  // Find the selected worker details for the modal
  const selectedWorker = useMemo(() => {
    if (!selectedWorkerId) return null;
    const s = processedSurveyors.find(w => w.id === selectedWorkerId);
    if (s) return { ...s, type: 'surveyor' as const };
    const t = processedTechnicians.find(w => w.id === selectedWorkerId);
    if (t) return { ...t, type: 'technician' as const };
    return null;
  }, [selectedWorkerId, processedSurveyors, processedTechnicians]);

  // Toggle flag real-time
  const handleToggleFlag = (id: string) => {
    if (flaggedWorkerIds.includes(id)) {
      setFlaggedWorkerIds(flaggedWorkerIds.filter(fId => fId !== id));
    } else {
      setFlaggedWorkerIds([...flaggedWorkerIds, id]);
    }
  };

  // Sparkline SVG generator
  const renderSparkline = (points: number[], isPositive: boolean, isFlagged: boolean) => {
    if (isFlagged) {
      return (
        <span className="text-[10px] text-error font-semibold font-mono tracking-wider flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> STOPPED
        </span>
      );
    }
    const width = 64;
    const height = 24;
    const padding = 2;
    const maxVal = Math.max(...points);
    const minVal = Math.min(...points);
    const range = maxVal - minVal || 1;

    const coords = points.map((p, index) => {
      const x = padding + (index * (width - 2 * padding)) / (points.length - 1);
      const y = height - padding - ((p - minVal) * (height - 2 * padding)) / range;
      return `${x},${y}`;
    }).join(' ');

    const strokeColor = isPositive ? 'var(--color-success)' : 'var(--color-accent-primary)';

    return (
      <div className="flex flex-col items-center">
        <svg width={width} height={height} className="overflow-visible">
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={coords}
          />
          {/* Pulsing dot at last point */}
          {points.length > 0 && (
            <circle
              cx={padding + ((points.length - 1) * (width - 2 * padding)) / (points.length - 1)}
              cy={height - padding - ((points[points.length - 1] - minVal) * (height - 2 * padding)) / range}
              r="2"
              fill={strokeColor}
              className="animate-ping"
            />
          )}
        </svg>
        <span className={`text-[9px] font-mono mt-1 ${isPositive ? 'text-success' : 'text-antiquegold'}`}>
          {isPositive ? '+' : ''}{Math.round(points[points.length - 1] - points[0])}% delta
        </span>
      </div>
    );
  };

  return (
    <div id="worker-performance-dashboard" className="space-y-6 text-left">
      
      {/* HEADER CARD */}
      <Card className="p-6 relative overflow-hidden bg-white">
        {/* Background Decorative Gold Accent Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--color-accent-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-accent-primary) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-antiquegold/10 text-antiquegold rounded-xl">
                <Trophy className="w-5 h-5" />
              </span>
              <h2 className="font-serif text-2xl font-bold text-charcoal tracking-tight">
                {t.title}
              </h2>
            </div>
            <p className="text-xs text-warmgray md:max-w-xl">
              {t.subtitle}
            </p>
          </div>

          {/* Quick Active Contest Tag */}
          <div className="bg-antiquegold/5 border border-antiquegold/20 rounded-2xl p-3 flex items-center gap-3 self-start md:self-auto">
            <Zap className="w-5 h-5 text-antiquegold animate-pulse shrink-0" />
            <div>
              <div className="text-[10px] text-antiquegold font-semibold uppercase tracking-wider font-mono">
                🏆 {language === 'hi' ? 'सक्रिय प्रतियोगिता' : language === 'mr' ? 'सक्रिय स्पर्धा' : 'Active Contest'}
              </div>
              <div className="text-xs font-bold text-charcoal">
                {language === 'hi' ? 'पुणे मानसून धमाका - ₹25,000' : language === 'mr' ? 'पुणे मान्सून धमाका - ₹२५,०००' : 'Pune Monsoon Sprint • ₹25,000 Prize'}
              </div>
            </div>
          </div>
        </div>

        {/* TIME PERIOD & GROUP TOGGLES */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* Role selector (Surveyor / Tech) */}
          <div className="flex bg-alabaster p-1 rounded-xl border border-border w-full sm:w-auto">
            <button
              onClick={() => { setActiveRole('surveyor'); setShowRisingStars(false); }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                activeRole === 'surveyor'
                  ? 'bg-white text-charcoal shadow-sm border border-border'
                  : 'text-warmgray hover:text-charcoal'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              {t.surveyors}
            </button>
            <button
              onClick={() => { setActiveRole('technician'); setShowRisingStars(false); }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                activeRole === 'technician'
                  ? 'bg-white text-charcoal shadow-sm border border-border'
                  : 'text-warmgray hover:text-charcoal'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              {t.technicians}
            </button>
          </div>

          {/* Time period filter */}
          <div className="flex bg-alabaster p-1 rounded-xl border border-border w-full sm:w-auto">
            {(['week', 'month', 'allTime'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 capitalize ${
                  period === p
                    ? 'bg-white text-charcoal shadow-sm border border-border'
                    : 'text-warmgray hover:text-charcoal'
                }`}
              >
                {p === 'week' ? t.thisWeek : p === 'month' ? t.thisMonth : t.allTime}
              </button>
            ))}
          </div>

        </div>
      </Card>

      {/* METRIC CONFIGURATOR BUTTON & SLIDERS */}
      <Card className="p-4 border border-[rgba(184,135,61,0.2)] bg-alabaster/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-antiquegold" />
            <div className="text-xs font-bold text-charcoal">
              {t.configureWeights}
            </div>
            <span className="hidden md:inline-block text-[10px] text-warmgray">
              ({activityWeight}% Vol / {qualityWeight}% Qlty / {speedWeight}% Speed)
            </span>
          </div>
          <Button
            variant="secondary"
            className="!px-3 !py-1.5 !text-xs !rounded-lg border-antiquegold/20"
            onClick={() => setShowConfig(!showConfig)}
          >
            <ListFilter className="w-3.5 h-3.5" />
            {showConfig ? (language === 'hi' ? 'छिपाएं' : language === 'mr' ? 'लपवा' : 'Hide Sliders') : (language === 'hi' ? 'समायोजित करें' : language === 'mr' ? 'बदला' : 'Adjust Weights')}
          </Button>
        </div>

        {/* Real-time Config Formula Explanation */}
        {showConfig && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border space-y-4"
          >
            <p className="text-[11px] text-warmgray">
              {t.weightsHelp}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Activity Volume Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-charcoal">{t.activityVol}</span>
                  <span className="text-antiquegold font-mono">{activityWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={activityWeight} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setActivityWeight(val);
                    // Proportional adjustment of other weights to sum close to 100
                    const remain = 100 - val;
                    setQualityWeight(Math.round(remain * 0.6));
                    setSpeedWeight(Math.round(remain * 0.4));
                  }}
                  className="w-full accent-antiquegold h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-warmgray block">
                  {activeRole === 'surveyor' ? t.surveyorMetrics.captures : t.technicianMetrics.completions}
                </span>
              </div>

              {/* Quality & Accuracy Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-charcoal">{t.qualityAcc}</span>
                  <span className="text-antiquegold font-mono">{qualityWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={qualityWeight} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setQualityWeight(val);
                    const remain = 100 - val;
                    setActivityWeight(Math.round(remain * 0.6));
                    setSpeedWeight(Math.round(remain * 0.4));
                  }}
                  className="w-full accent-antiquegold h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-warmgray block">
                  {activeRole === 'surveyor' ? t.surveyorMetrics.accuracy : t.technicianMetrics.sopRate}
                </span>
              </div>

              {/* Speed & Efficiency Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-charcoal">{t.speedEfficiency}</span>
                  <span className="text-antiquegold font-mono">{speedWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={speedWeight} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSpeedWeight(val);
                    const remain = 100 - val;
                    setActivityWeight(Math.round(remain * 0.6));
                    setQualityWeight(Math.round(remain * 0.4));
                  }}
                  className="w-full accent-antiquegold h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-warmgray block">
                  {activeRole === 'surveyor' ? t.surveyorMetrics.conversions : t.technicianMetrics.onTime}
                </span>
              </div>
            </div>

            <div className="bg-white/70 p-3 rounded-xl text-[10px] text-charcoal border border-border/50 flex flex-col md:flex-row justify-between gap-2">
              <div>
                <strong>{t.formula}:</strong> <code>Score = (Volume × {activityWeight}% + Quality × {qualityWeight}% + Speed × {speedWeight}%)</code>
              </div>
              <div className="text-warmgray flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-antiquegold" />
                {t.tiesBrokenBy}: <strong className="text-charcoal">{activeRole === 'surveyor' ? t.geoAccuracyText : t.avgRatingText}</strong>
              </div>
            </div>
          </motion.div>
        )}
      </Card>

      {/* FILTER SEARCH & ABSOLUTE VS RISING TOGGLE */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:border-antiquegold text-charcoal placeholder:text-warmgray"
          />
        </div>

        {/* Absolute vs Rising Stars Toggle */}
        <div className="flex bg-alabaster p-0.5 rounded-xl border border-border w-full md:w-auto">
          <button
            onClick={() => setShowRisingStars(false)}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !showRisingStars
                ? 'bg-white text-charcoal shadow-xs border border-border'
                : 'text-warmgray hover:text-charcoal'
            }`}
          >
            {t.absoluteTop}
          </button>
          <button
            onClick={() => setShowRisingStars(true)}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showRisingStars
                ? 'bg-white text-charcoal shadow-xs border border-border'
                : 'text-warmgray hover:text-charcoal'
            }`}
          >
            {t.risingStars}
          </button>
        </div>
      </div>

      {/* LEADERBOARD RANK LIST */}
      <div className="space-y-3">
        {currentLeaderboardList.length === 0 ? (
          <Card className="p-8 text-center text-warmgray text-xs">
            {t.noResults}
          </Card>
        ) : (
          currentLeaderboardList.map((worker, index) => {
            const displayRank = index + 1;
            const isTop3 = displayRank <= 3 && !worker.isFlagged;
            const isRisingStar = worker.trendDelta >= 15 && !worker.isFlagged;

            return (
              <motion.div
                key={worker.id}
                layoutId={`row-${worker.id}`}
                onClick={() => setSelectedWorkerId(worker.id)}
                className={`group cursor-pointer bg-white rounded-2xl border transition-all duration-200 p-4 flex items-center justify-between gap-4 hover:shadow-sm ${
                  isTop3 
                    ? 'border-[rgba(184,135,61,0.35)] bg-gradient-to-r from-white via-white to-antiquegold/[0.02]' 
                    : 'border-border hover:border-antiquegold/35'
                }`}
              >
                
                {/* Left Side: Rank, Avatar, Name & Region */}
                <div className="flex items-center gap-3 md:gap-5 min-w-0 flex-1">
                  
                  {/* Rank Display (Fraunces serif display weight) */}
                  <div className="w-8 shrink-0 text-center flex flex-col justify-center">
                    {worker.isFlagged ? (
                      <span className="text-error font-bold flex justify-center">
                        <AlertTriangle className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className={`font-serif text-xl md:text-2xl font-black tabular-nums ${
                        displayRank === 1 
                          ? 'text-antiquegold text-3xl' 
                          : displayRank === 2 
                          ? 'text-gray-500 text-2xl' 
                          : displayRank === 3 
                          ? 'text-amber-700 text-2xl' 
                          : 'text-warmgray font-medium'
                      }`}>
                        #{displayRank}
                      </span>
                    )}
                  </div>

                  {/* Worker Photo */}
                  <div className="relative shrink-0">
                    <img
                      src={worker.avatarUrl}
                      alt={worker.name}
                      referrerPolicy="no-referrer"
                      className={`w-11 h-11 md:w-12 md:h-12 rounded-full object-cover border-2 ${
                        isTop3 ? 'border-antiquegold' : 'border-alabaster'
                      }`}
                    />
                    {isTop3 && (
                      <div className="absolute -top-1 -right-1 bg-antiquegold text-white rounded-full p-0.5 shadow-xs">
                        <Award className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Worker Name / Territory info */}
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-sans text-sm font-bold text-charcoal truncate">
                        {worker.name}
                      </h4>
                      {worker.isMidPeriod && (
                        <span className="text-[9px] bg-antiquegold/10 text-antiquegold border border-antiquegold/20 px-1.5 py-0.5 rounded font-mono">
                          {language === 'en' ? 'NEW' : 'नवीन'}
                        </span>
                      )}
                      {worker.isFlagged && (
                        <span className="text-[9px] bg-error/10 text-error border border-error/20 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                          {language === 'en' ? 'Flagged' : 'ध्वजांकित'}
                        </span>
                      )}
                      {isRisingStar && !worker.isFlagged && (
                        <span className="text-[9px] bg-success/10 text-success border border-success/20 px-1.5 py-0.5 rounded font-mono uppercase font-bold flex items-center gap-0.5">
                          🚀 {language === 'en' ? 'Rising' : 'वेगवान'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-warmgray font-medium truncate">
                      {worker.region}
                    </p>
                  </div>

                </div>

                {/* Right Side: Trend Sparkline & Score (IBM Plex Mono tabular numerals) */}
                <div className="flex items-center gap-5 md:gap-8 shrink-0">
                  
                  {/* Trend Sparkline (Hidden on tiny mobile) */}
                  <div className="hidden sm:block">
                    {renderSparkline(worker.sparkline, worker.trendDelta >= 0, worker.isFlagged)}
                  </div>

                  {/* Primary Metric details */}
                  <div className="text-right min-w-[70px]">
                    {worker.isFlagged ? (
                      <span className="text-xs font-semibold text-error/80 uppercase tracking-wider font-mono">
                        {language === 'hi' ? 'निलंबित' : language === 'mr' ? 'निलंबित' : 'Suspended'}
                      </span>
                    ) : (
                      <>
                        <div className="text-[10px] text-warmgray font-semibold uppercase tracking-wider">
                          {activeRole === 'surveyor' ? t.surveyorMetrics.captures : t.technicianMetrics.completions}
                        </div>
                        <div className="text-sm font-extrabold text-charcoal font-mono">
                          {worker.volumeValue}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Custom Calculated WPI Score (Fraunces / Tabular mono hybrid) */}
                  <div className="text-right bg-alabaster/60 rounded-xl p-2 min-w-[64px] border border-border/50">
                    <div className="text-[8px] text-warmgray font-semibold uppercase tracking-wider">
                      WPI
                    </div>
                    <div className="text-sm font-bold text-royalemerald font-mono">
                      {worker.isFlagged ? '0.0' : worker.wpiScore}
                    </div>
                  </div>

                </div>

              </motion.div>
            );
          })
        )}
      </div>

      {/* DETAILED WORKER PERFORMANCE PROFILE & HISTORY OVERLAY MODAL */}
      <AnimatePresence>
        {selectedWorker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-antiquegold/25 shadow-lg w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
            >
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedWorkerId(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-alabaster transition-colors text-warmgray hover:text-charcoal cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="p-6 pb-4 border-b border-border bg-gradient-to-r from-alabaster to-white flex items-start gap-4">
                <img
                  src={selectedWorker.avatarUrl}
                  alt={selectedWorker.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border-2 border-antiquegold"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-xl font-bold text-charcoal">
                      {selectedWorker.name}
                    </h3>
                    <Badge status={selectedWorker.isFlagged ? 'unpaid' : 'active'} />
                    {selectedWorker.isMidPeriod && (
                      <span className="bg-antiquegold/10 text-antiquegold border border-antiquegold/20 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {t.newStarter}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-warmgray">
                    {selectedWorker.region} • {language === 'hi' ? 'शामिल हुए' : language === 'mr' ? 'सामील झाले' : 'On-Duty Since'}: <span className="font-mono">{selectedWorker.joinedDate}</span>
                  </p>
                  <p className="text-xs text-charcoal font-medium">
                    {t.contact}: <span className="font-mono">{selectedWorker.phone}</span>
                  </p>
                </div>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
                
                {/* Bio Description */}
                <div className="space-y-1.5">
                  <h5 className="font-bold uppercase tracking-wider text-charcoal">
                    📄 {t.bio}
                  </h5>
                  <p className="text-warmgray leading-relaxed italic bg-alabaster/50 p-3 rounded-xl border border-border/50">
                    "{selectedWorker.bio}"
                  </p>
                </div>

                {/* Primary KPIs Metrics Grid */}
                <div className="space-y-2">
                  <h5 className="font-bold uppercase tracking-wider text-charcoal">
                    📈 {language === 'hi' ? 'प्रमुख प्रदर्शन मेट्रिक्स' : language === 'mr' ? 'प्रमुख कामगिरी मेट्रिक्स' : 'Key Performance Metrics'}
                  </h5>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    {selectedWorker.type === 'surveyor' ? (
                      <>
                        <div className="bg-alabaster/40 p-3 rounded-xl border border-border text-center">
                          <span className="text-warmgray text-[10px] block uppercase font-semibold">{t.surveyorMetrics.captures}</span>
                          <strong className="text-base text-charcoal font-mono mt-1 block">{selectedWorker.leadsCaptured[period]}</strong>
                          <span className="text-[9px] text-warmgray block mt-0.5 font-mono">Total: {selectedWorker.leadsCaptured.allTime}</span>
                        </div>

                        <div className="bg-alabaster/40 p-3 rounded-xl border border-border text-center">
                          <span className="text-warmgray text-[10px] block uppercase font-semibold">{t.surveyorMetrics.conversions}</span>
                          <strong className="text-base text-success font-mono mt-1 block">{selectedWorker.leadsConverted[period]}</strong>
                          <span className="text-[9px] text-warmgray block mt-0.5 font-mono">Total: {selectedWorker.leadsConverted.allTime}</span>
                        </div>

                        <div className="bg-alabaster/40 p-3 rounded-xl border border-border text-center">
                          <span className="text-warmgray text-[10px] block uppercase font-semibold">{t.surveyorMetrics.accuracy}</span>
                          <strong className="text-base text-charcoal font-mono mt-1 block flex items-center justify-center gap-0.5">
                            {selectedWorker.geoAccuracy}% <Percent className="w-3.5 h-3.5 text-antiquegold shrink-0" />
                          </strong>
                          <span className="text-[9px] text-warmgray block mt-0.5">GPS Verification</span>
                        </div>

                        <div className="bg-alabaster/40 p-3 rounded-xl border border-border text-center">
                          <span className="text-warmgray text-[10px] block uppercase font-semibold">{t.surveyorMetrics.commission}</span>
                          <strong className="text-base text-royalemerald font-mono mt-1 block">₹{selectedWorker.commissionEarned[period].toLocaleString('en-IN')}</strong>
                          <span className="text-[9px] text-warmgray block mt-0.5 font-mono">Total: ₹{selectedWorker.commissionEarned.allTime.toLocaleString('en-IN')}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-alabaster/40 p-3 rounded-xl border border-border text-center">
                          <span className="text-warmgray text-[10px] block uppercase font-semibold">{t.technicianMetrics.completions}</span>
                          <strong className="text-base text-charcoal font-mono mt-1 block">{(selectedWorker as any).jobsCompleted[period]}</strong>
                          <span className="text-[9px] text-warmgray block mt-0.5 font-mono">Total: {(selectedWorker as any).jobsCompleted.allTime}</span>
                        </div>

                        <div className="bg-alabaster/40 p-3 rounded-xl border border-border text-center">
                          <span className="text-warmgray text-[10px] block uppercase font-semibold">{t.technicianMetrics.onTime}</span>
                          <strong className="text-base text-success font-mono mt-1 block">{(selectedWorker as any).onTimeRate}%</strong>
                          <span className="text-[9px] text-warmgray block mt-0.5">Prompt Delivery</span>
                        </div>

                        <div className="bg-alabaster/40 p-3 rounded-xl border border-border text-center">
                          <span className="text-warmgray text-[10px] block uppercase font-semibold">{t.technicianMetrics.sopRate}</span>
                          <strong className="text-base text-charcoal font-mono mt-1 block">{(selectedWorker as any).sopVerificationRate}%</strong>
                          <span className="text-[9px] text-warmgray block mt-0.5">SOP Compliance</span>
                        </div>

                        <div className="bg-alabaster/40 p-3 rounded-xl border border-border text-center">
                          <span className="text-warmgray text-[10px] block uppercase font-semibold">{t.technicianMetrics.rating}</span>
                          <strong className="text-base text-antiquegold font-mono mt-1 block flex items-center justify-center gap-1">
                            {(selectedWorker as any).avgRating} <Star className="w-4 h-4 fill-antiquegold text-antiquegold shrink-0" />
                          </strong>
                          <span className="text-[9px] text-warmgray block mt-0.5">Verified Reviews</span>
                        </div>
                      </>
                    )}

                  </div>
                </div>

                {/* Unlocked rewards checklist */}
                <div className="space-y-2">
                  <h5 className="font-bold uppercase tracking-wider text-charcoal">
                    🏅 {t.unlockedRewards}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorker.unlockedRewards.map((reward, i) => (
                      <span 
                        key={i} 
                        className="bg-antiquegold/10 text-antiquegold border border-antiquegold/25 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs"
                      >
                        {reward}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Activity log / timeline */}
                <div className="space-y-3">
                  <h5 className="font-bold uppercase tracking-wider text-charcoal">
                    🗓️ {t.recentActivityLogs}
                  </h5>
                  
                  {/* Styled vertical rail progress timeline */}
                  <div className="relative pl-6 space-y-4">
                    {/* The Ascension Line motif */}
                    <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-antiquegold/20" />

                    {selectedWorker.history.map((log, i) => (
                      <div key={i} className="relative flex items-start gap-3">
                        <div className={`absolute -left-[23px] w-2.5 h-2.5 rounded-full border-2 ${
                          log.status === 'flagged' 
                            ? 'bg-error border-error animate-pulse' 
                            : 'bg-antiquegold border-white'
                        }`} />
                        <div>
                          <div className="font-mono text-[10px] text-warmgray">
                            {log.date}
                          </div>
                          <div className={`font-sans text-xs mt-0.5 ${
                            log.status === 'flagged' ? 'text-error font-semibold' : 'text-charcoal'
                          }`}>
                            {log.action}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Administrative Actions Exclude / Flag pending investigation */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="p-3 bg-error/5 border border-error/20 rounded-2xl flex gap-3 text-left">
                    <ShieldAlert className="w-5 h-5 text-error shrink-0 mt-0.5" />
                    <p className="text-[10px] text-error leading-relaxed">
                      <strong>{language === 'hi' ? 'प्रशासकीय सुरक्षा अलर्ट' : language === 'mr' ? 'प्रशासकीय सुरक्षा इशारा' : 'Administrative Security Alert'}:</strong> {t.excludeAlert}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant={selectedWorker.isFlagged ? 'primary' : 'danger'}
                      fullWidth
                      className="!py-2.5 text-xs font-semibold"
                      onClick={() => handleToggleFlag(selectedWorker.id)}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {selectedWorker.isFlagged ? t.unflagAction : t.excludeAction}
                    </Button>
                    <Button 
                      variant="secondary"
                      className="!py-2.5 text-xs font-semibold"
                      onClick={() => setSelectedWorkerId(null)}
                    >
                      {t.closeBtn}
                    </Button>
                  </div>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
