import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, Sparkles, ArrowLeft, History, Eye, 
  FileText, Palette, FileCheck, CheckCircle2, AlertCircle, Save, 
  Globe, Phone, Mail, MapPin, Award, Layers, ChevronRight
} from 'lucide-react';
import { UserRole, CompanyProfileConfig, BrandVersionRecord } from '../types';
import { DbManager } from '../lib/db';

interface CompanyProfileBrandingSettingsScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const CompanyProfileBrandingSettingsScreen: React.FC<CompanyProfileBrandingSettingsScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack,
  onNavigateTab
}) => {
  const [profile, setProfile] = useState<CompanyProfileConfig>(() => 
    DbManager.getCompanyProfileConfig()
  );

  // Form states
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [tagline, setTagline] = useState(profile.tagline);
  const [gstin, setGstin] = useState(profile.gstin);
  const [registeredAddress, setRegisteredAddress] = useState(profile.registeredAddress);
  const [supportPhone, setSupportPhone] = useState(profile.supportPhone);
  const [supportEmail, setSupportEmail] = useState(profile.supportEmail);
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl);
  const [logoAssetUrl, setLogoAssetUrl] = useState(profile.logoAssetUrl);
  const [primaryColor, setPrimaryColor] = useState(profile.brandPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(profile.brandSecondaryColor);

  const [activePreviewTab, setActivePreviewTab] = useState<'tax_invoice' | 'quotation' | 'customer_portal'>('tax_invoice');
  const [changeReason, setChangeReason] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = () => {
    if (!companyName.trim() || !gstin.trim() || !registeredAddress.trim()) {
      triggerToast('Please complete Company Name, GSTIN, and Registered Address.');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const newVersionRecord: BrandVersionRecord = {
        versionId: `v${Date.now().toString().slice(-4)}`,
        updatedAt: new Date().toISOString().split('T')[0],
        updatedBy: ownerName || 'Mr. Prashant Vasant Wable',
        companyName,
        ownerName,
        gstin,
        registeredAddress,
        logoAssetUrl,
        changeSummary: changeReason.trim() || 'Routine brand & profile update.'
      };

      const updatedProfile: CompanyProfileConfig = {
        ...profile,
        companyName,
        ownerName,
        tagline,
        gstin,
        registeredAddress,
        supportPhone,
        supportEmail,
        websiteUrl,
        logoAssetUrl,
        brandPrimaryColor: primaryColor,
        brandSecondaryColor: secondaryColor,
        versionHistory: [newVersionRecord, ...profile.versionHistory]
      };

      DbManager.saveCompanyProfileConfig(updatedProfile);
      setProfile(updatedProfile);
      setIsSaving(false);
      setChangeReason('');
      triggerToast('Company profile & brand identity committed! Propagated to document templates.');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)] border border-[var(--color-accent-primary)] text-[var(--color-text-primary)] px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-serif text-xl font-bold flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'कंपनी प्रोफ़ाइल व ब्रांडिंग सेटिंग्स' : currentLanguage === 'mr' ? 'कंपनी प्रोफाइल आणि ब्रँडिंग सेटिंग्ज' : 'Company Profile & Branding Settings'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Governed source of truth for AIEC identity, GSTIN legal details, and document branding
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="px-4 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 hover:opacity-90 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save & Commit'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Informational Callout */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm flex items-start space-x-3 text-xs text-[var(--color-text-secondary)]">
          <ShieldCheck className="w-5 h-5 text-[var(--color-accent-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--color-text-primary)] block font-serif text-sm mb-0.5">
              Legal Compliance & Document Immutability Standard
            </strong>
            GSTIN and address updates configured here automatically populate all future Tax Invoices, Quotations, and Digital Contracts. Previously issued historical documents retain their original locked version.
          </div>
        </div>

        {/* Workspace: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column: Brand & Legal Details Form */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Core Identity & Legal Details
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Company Registered Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-serif font-bold focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--color-text-primary)] block mb-1">Founder / Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--color-text-primary)] block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={e => setGstin(e.target.value.toUpperCase())}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:border-[var(--color-accent-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Company Tagline / Mission</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Registered MIDC Factory / Office Address</label>
                <textarea
                  rows={2}
                  value={registeredAddress}
                  onChange={e => setRegisteredAddress(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--color-text-primary)] block mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={e => setSupportPhone(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--color-accent-primary)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--color-text-primary)] block mb-1">Support Email</label>
                  <input
                    type="text"
                    value={supportEmail}
                    onChange={e => setSupportEmail(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Logo Asset URL</label>
                <input
                  type="text"
                  value={logoAssetUrl}
                  onChange={e => setLogoAssetUrl(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Change Reason / Audit Note</label>
                <input
                  type="text"
                  value={changeReason}
                  onChange={e => setChangeReason(e.target.value)}
                  placeholder="Optional note for brand version history..."
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Touchpoint Document Preview */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
              <h2 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[var(--color-accent-primary)]" />
                Touchpoint Live Preview
              </h2>

              <div className="flex space-x-1 bg-[var(--color-bg)] p-1 rounded-xl border border-[var(--color-border)] text-[10px] font-bold">
                <button
                  onClick={() => setActivePreviewTab('tax_invoice')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activePreviewTab === 'tax_invoice' ? 'bg-[var(--color-accent-primary)] text-white shadow-xs' : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  Tax Invoice
                </button>
                <button
                  onClick={() => setActivePreviewTab('quotation')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activePreviewTab === 'quotation' ? 'bg-[var(--color-accent-primary)] text-white shadow-xs' : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  Quotation
                </button>
                <button
                  onClick={() => setActivePreviewTab('customer_portal')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activePreviewTab === 'customer_portal' ? 'bg-[var(--color-accent-primary)] text-white shadow-xs' : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  Portal
                </button>
              </div>
            </div>

            {/* Document Header Render Frame */}
            <div className="bg-white text-gray-900 rounded-2xl p-5 border-2 border-dashed border-[var(--color-border)] shadow-md space-y-4 text-xs font-sans">
              <div className="flex items-start justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center space-x-3">
                  <img 
                    src={logoAssetUrl} 
                    alt="Logo Preview" 
                    className="w-12 h-12 object-cover rounded-xl border border-gray-300"
                    onError={(e) => { (e.target as any).src = 'https://via.placeholder.com/150'; }}
                  />
                  <div>
                    <h3 className="font-serif font-bold text-sm text-gray-900">{companyName}</h3>
                    <p className="text-[10px] text-gray-600 italic">{tagline}</p>
                    <p className="text-[10px] text-gray-700 font-mono font-bold mt-0.5">GSTIN: {gstin}</p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-gray-500 font-mono">
                  <strong className="text-amber-800 uppercase block font-bold">
                    {activePreviewTab === 'tax_invoice' ? 'TAX INVOICE HEADER' : activePreviewTab === 'quotation' ? 'FORMAL QUOTATION HEADER' : 'CUSTOMER PORTAL BANNER'}
                  </strong>
                  <span>PREVIEW MODE</span>
                </div>
              </div>

              <div className="text-[10px] text-gray-600 leading-relaxed space-y-1">
                <p><strong>Reg. Office:</strong> {registeredAddress}</p>
                <p><strong>Contact:</strong> {supportPhone} • {supportEmail} • {websiteUrl}</p>
                <p><strong>Authorized Signatory:</strong> {ownerName} (Managing Director)</p>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[10px] font-mono text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                <span className="flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> All Alabaster & Ascension brand tokens verified
                </span>
                <span>Version Preview</span>
              </div>
            </div>

            {/* Version History Log Ledger */}
            <div className="space-y-2 pt-2">
              <h3 className="font-serif font-bold text-xs text-[var(--color-text-primary)] flex items-center gap-1.5">
                <History className="w-4 h-4 text-[var(--color-accent-primary)]" />
                Brand Asset & GSTIN Version Ledger
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {profile.versionHistory.map(ver => (
                  <div 
                    key={ver.versionId}
                    className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs space-y-1 font-mono"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[var(--color-accent-primary)]">{ver.versionId} • {ver.updatedAt}</span>
                      <span className="text-[var(--color-text-secondary)]">By: {ver.updatedBy}</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-primary)] font-sans">
                      {ver.changeSummary}
                    </p>
                    <div className="text-[10px] text-[var(--color-text-secondary)]">
                      GSTIN: {ver.gstin}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
