import React, { useState } from 'react';
import { 
  CreditCard, Server, MessageSquare, Smartphone, DollarSign, Sparkles, 
  AlertTriangle, CheckCircle2, Clock, ShieldAlert, ArrowLeft, RefreshCw, 
  FileText, ExternalLink, Zap, PieChart, Layers, Download, Check
} from 'lucide-react';
import { 
  SaaSUsageServiceConfig, 
  SaaSBillingInvoiceRecord 
} from '../types';
import { 
  initialSaaSUsageServices, 
  initialSaaSBillingInvoices 
} from '../lib/db';

interface SaaSOpsSubscriptionBillingScreenProps {
  userRole?: string;
  currentLanguage?: 'en' | 'mr' | 'hi';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const SaaSOpsSubscriptionBillingScreen: React.FC<SaaSOpsSubscriptionBillingScreenProps> = ({
  userRole = 'admin',
  currentLanguage = 'en',
  currentUserId = 'admin_prashant',
  onBack,
  onNavigateTab
}) => {
  // State
  const [services, setServices] = useState<SaaSUsageServiceConfig[]>(initialSaaSUsageServices);
  const [invoices, setInvoices] = useState<SaaSBillingInvoiceRecord[]>(initialSaaSBillingInvoices);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Translations
  const t = {
    en: {
      title: "SaaS Ops & Software Infrastructure Billing",
      subtitle: "Consolidated operational technology costs, API usage quotas, and payment card safety",
      totalMonthlyRunRate: "Estimated Monthly Software Cost",
      activeServicesCount: "Core Billed Services",
      cardExpiringAlert: "Critical Billing Alert: WhatsApp Meta API Payment Card Expiring",
      cardExpiringDesc: "Card expires in 14 days. Update card details now to prevent service interruption for customer quotation dispatches.",
      updateCardBtn: "Update Payment Method",
      servicesTab: "Active Software Services & Quotas",
      invoicesTab: "GST Tax Invoices & Billing History",
      
      serviceTier: "Current Tier",
      monthlyUsage: "Monthly Quota Usage",
      renewalDate: "Next Billing Date",
      optimizationAdvice: "AI Cost Optimization Insights",
      statusActive: "Auto-Debit Active",
      statusExpiring: "Payment Card Expiring",
      statusFailed: "Billing Action Required",
      
      invoicePeriod: "Billing Period",
      invoiceAmount: "Amount (Incl. GST)",
      invoiceGst: "Vendor GSTIN",
      downloadPdf: "Download Tax Invoice",
      
      backToMaster: "Back to Settings Master"
    },
    mr: {
      title: "SaaS आणि सॉफ्टवेअर इन्फ्रास्ट्रक्चर बिलिंग",
      subtitle: "सॉफ्टवेअर खर्च, API वापर कोटा आणि पेमेंट कार्ड सुरक्षेची माहिती",
      totalMonthlyRunRate: "एकूण अंदाजे मासिक सॉफ्टवेअर खर्च",
      activeServicesCount: "सक्रिय सॉफ्टवेअर सेवा",
      cardExpiringAlert: "महत्त्वाची बिलिंग सूचना: व्हॉट्सॲप मेटा कार्ड मुदत संपत आहे",
      cardExpiringDesc: "कार्डची मुदत १४ दिवसांत संपत आहे. कोटेशन पाठवण्यात अडथळा टाळण्यासाठी कार्ड अपडेट करा.",
      updateCardBtn: "पेमेंट पद्धत अपडेट करा",
      servicesTab: "सॉफ्टवेअर सेवा आणि कोटे",
      invoicesTab: "जीएसटी टॅक्स इनव्हॉइस व इतिहास",
      
      serviceTier: "सध्याचा प्लॅन",
      monthlyUsage: "मासिक कोटा वापर",
      renewalDate: "पुढील बिलिंग तारीख",
      optimizationAdvice: "खर्च बचत सल्ला",
      statusActive: "ऑटो-डेबिट सुरू",
      statusExpiring: "कार्ड मुदत संपणार",
      statusFailed: "पेमेंट आवश्यक",
      
      invoicePeriod: "बिलिंग कालावधी",
      invoiceAmount: "रक्कम (जीएसटीसह)",
      invoiceGst: "व्हेंडर GSTIN",
      downloadPdf: "टॅक्स इनव्हॉइस डाउनलोड करा",
      
      backToMaster: "मुख्य सेटिंग्जवर जा"
    },
    hi: {
      title: "SaaS एवं सॉफ्टवेयर इंफ्रास्ट्रक्चर बिलिंग",
      subtitle: "सॉफ्टवेयर लागत, एपीआई कोटा उपयोग और भुगतान कार्ड सुरक्षा विवरण",
      totalMonthlyRunRate: "अनुमानित कुल मासिक सॉफ्टवेयर खर्च",
      activeServicesCount: "सक्रिय सॉफ्टवेयर सेवाएं",
      cardExpiringAlert: "महत्वपूर्ण बिलिंग अलर्ट: व्हाट्सएप मेटा कार्ड एक्सपायर हो रहा है",
      cardExpiringDesc: "कार्ड 14 दिनों में समाप्त हो रहा है। ग्राहक कोटेशन प्रेषण में बाधा रोकने हेतु कार्ड अपडेट करें।",
      updateCardBtn: "भुगतान विधि अपडेट करें",
      servicesTab: "सॉफ्टवेयर सेवाएं एवं कोटा",
      invoicesTab: "जीएसटी टैक्स इनवॉइस एवं इतिहास",
      
      serviceTier: "वर्तमान प्लान/टियर",
      monthlyUsage: "मासिक कोटा उपयोग",
      renewalDate: "अगली बिलिंग तिथि",
      optimizationAdvice: "लागत बचत परामर्श",
      statusActive: "ऑटो-डेबिट सक्रिय",
      statusExpiring: "कार्ड एक्सपायर होने वाला है",
      statusFailed: "भुगतान कार्रवाई आवश्यक",
      
      invoicePeriod: "बिलिंग अवधि",
      invoiceAmount: "राशि (जीएसटी सहित)",
      invoiceGst: "विक्रेता GSTIN",
      downloadPdf: "टैक्स इनवॉइस डाउनलोड करें",
      
      backToMaster: "मुख्य सेटिंग्स पर लौटें"
    }
  }[currentLanguage] || {
    title: "SaaS Ops & Software Infrastructure Billing",
    subtitle: "Consolidated operational technology costs, API usage quotas, and payment card safety",
    totalMonthlyRunRate: "Estimated Monthly Software Cost",
    activeServicesCount: "Core Billed Services",
    cardExpiringAlert: "Critical Billing Alert: WhatsApp Meta API Payment Card Expiring",
    cardExpiringDesc: "Card expires in 14 days. Update card details now to prevent service interruption for customer quotation dispatches.",
    updateCardBtn: "Update Payment Method",
    servicesTab: "Active Software Services & Quotas",
    invoicesTab: "GST Tax Invoices & Billing History",
    serviceTier: "Current Tier",
    monthlyUsage: "Monthly Quota Usage",
    renewalDate: "Next Billing Date",
    optimizationAdvice: "AI Cost Optimization Insights",
    statusActive: "Auto-Debit Active",
    statusExpiring: "Payment Card Expiring",
    statusFailed: "Billing Action Required",
    invoicePeriod: "Billing Period",
    invoiceAmount: "Amount (Incl. GST)",
    invoiceGst: "Vendor GSTIN",
    downloadPdf: "Download Tax Invoice",
    backToMaster: "Back to Settings Master"
  };

  const totalMonthlySpend = services.reduce((acc, s) => acc + s.monthlyCostInr, 0);

  const handleUpdatePaymentCard = () => {
    setIsUpdatingCard(true);
    setTimeout(() => {
      setServices(prev => prev.map(s => s.serviceId === 'srv_meta_whatsapp' ? {
        ...s,
        paymentStatus: 'active_auto_debit'
      } : s));
      setIsUpdatingCard(false);
      setSuccessNotice(currentLanguage === 'mr' ? 'व्हॉट्सॲप मेटा API साठी पेमेंट कार्ड यशस्वीरीत्या अपडेट झाले!' : currentLanguage === 'hi' ? 'व्हाट्सएप मेटा API के लिए भुगतान कार्ड सफलतापूर्वक अपडेट हुआ!' : 'Payment card updated & verified for WhatsApp Business API!');
      setTimeout(() => setSuccessNotice(null), 5000);
    }, 1000);
  };

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen pb-24 text-[var(--color-text-primary)] bg-[var(--color-bg)] transition-colors duration-200">
      {/* Top Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-[var(--color-bg)]/90 border-b border-[var(--color-border)] px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] transition-colors"
                title={t.backToMaster}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                  {t.title}
                </h1>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-mono font-bold text-[var(--color-accent-primary)] hidden sm:inline">
              GST Input Credit Ready
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Success Alert Banner */}
        {successNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-start space-x-3 text-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="font-medium">{successNotice}</span>
          </div>
        )}

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/20 shadow-sm relative overflow-hidden">
            <span className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider block font-semibold">{t.totalMonthlyRunRate}</span>
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[var(--color-accent-primary)] mt-1 block">
              ₹{totalMonthlySpend.toLocaleString('en-IN')} / mo
            </span>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
              Calculated across 5 core technology service dependencies
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <span className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider block font-semibold">{t.activeServicesCount}</span>
            <span className="font-mono text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              5 Services Active
            </span>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
              Google Cloud, WhatsApp Meta, Textlocal, Razorpay & Gemini AI
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <span className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider block font-semibold">Cost Optimization Index</span>
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mt-1 block">
              94% Efficient
            </span>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              No unused capacity or idle provisioned servers
            </p>
          </div>
        </div>

        {/* Critical Billing Alert Card (Card Expiring) */}
        {services.some(s => s.paymentStatus === 'card_expiring_soon') && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-base font-bold text-amber-950 dark:text-amber-100">
                  {t.cardExpiringAlert}
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                  {t.cardExpiringDesc}
                </p>
              </div>
            </div>

            <button
              onClick={handleUpdatePaymentCard}
              disabled={isUpdatingCard}
              className="px-4 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow hover:bg-amber-700 transition-colors shrink-0"
            >
              {isUpdatingCard ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              <span>{isUpdatingCard ? 'Verifying Card...' : t.updateCardBtn}</span>
            </button>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Billed Services' },
            { id: 'cloud_hosting', label: 'Cloud Hosting' },
            { id: 'messaging_api', label: 'Messaging & OTP' },
            { id: 'payment_gateway', label: 'Payment Gateway' },
            { id: 'ai_studio_gemini', label: 'AI Gemini API' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services List */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
            {t.servicesTab}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {filteredServices.map(srv => (
              <div 
                key={srv.serviceId}
                className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40 transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-accent-primary)]">
                      {srv.category === 'cloud_hosting' ? <Server className="w-5 h-5" /> : srv.category === 'messaging_api' ? <MessageSquare className="w-5 h-5" /> : srv.category === 'payment_gateway' ? <DollarSign className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-[var(--color-text-primary)]">
                        {srv.serviceName}
                      </h4>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {t.serviceTier}: <strong className="text-[var(--color-text-primary)]">{srv.currentTier}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-[var(--color-border)]">
                    <div className="text-right">
                      <span className="font-mono text-lg font-bold text-[var(--color-accent-primary)] block">
                        ₹{srv.monthlyCostInr.toLocaleString('en-IN')} <span className="text-xs font-normal text-[var(--color-text-secondary)]">/mo</span>
                      </span>
                      <span className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                        {t.renewalDate}: {srv.renewalDate}
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      srv.paymentStatus === 'active_auto_debit'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : srv.paymentStatus === 'card_expiring_soon'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-600 border border-red-500/20'
                    }`}>
                      {srv.paymentStatus === 'active_auto_debit' ? t.statusActive : srv.paymentStatus === 'card_expiring_soon' ? t.statusExpiring : t.statusFailed}
                    </span>
                  </div>
                </div>

                {/* Quota Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
                  <div className="flex justify-between text-xs font-mono text-[var(--color-text-secondary)]">
                    <span>{t.monthlyUsage}: <strong className="text-[var(--color-text-primary)]">{srv.monthlyUsageMetric}</strong></span>
                    <span>{srv.usagePercent}%</span>
                  </div>
                  <div className="w-full bg-[var(--color-bg)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        srv.usagePercent > 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]'
                      }`}
                      style={{ width: `${srv.usagePercent}%` }}
                    />
                  </div>
                </div>

                {/* AI Cost Optimization Insight Card */}
                <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] flex items-start space-x-2.5">
                  <Zap className="w-4 h-4 text-[var(--color-accent-primary)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[var(--color-text-primary)] block mb-0.5">
                      {t.optimizationAdvice}
                    </span>
                    <p className="leading-relaxed">
                      {srv.costOptimizationAdvice}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GST Tax Invoices Section */}
        <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
              {t.invoicesTab}
            </h3>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">
              Auto-Archived for Audit
            </span>
          </div>

          <div className="space-y-3">
            {invoices.map(inv => (
              <div 
                key={inv.invoiceId}
                className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-[var(--color-text-primary)]">
                      {inv.serviceName}
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                      Period: {inv.billingPeriod} • Vendor GSTIN: {inv.gstinNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--color-border)]">
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-[var(--color-accent-primary)] block">
                      ₹{inv.amountInr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold uppercase">
                      Paid: {inv.paidAt}
                    </span>
                  </div>

                  <a
                    href={inv.taxInvoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] transition-colors text-xs flex items-center space-x-1"
                    title={t.downloadPdf}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tax Invoice</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
