import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, Percent, ShieldAlert, FileText, CheckCircle2, 
  HelpCircle, Info, Sparkles, TrendingUp, Hammer, 
  Truck, Clipboard, RefreshCw, AlertTriangle, ChevronRight, Edit2, Check
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

interface QuotationSpec {
  linkedLeadId: string;
  driveType: 'hydraulic' | 'geared_traction' | 'gearless_traction' | 'mrl' | 'vacuum' | 'screw' | 'custom';
  capacityPersons: number;
  capacityKg: number;
  stopsCount: number;
  travelHeight: number;
  cabinFinishTier: 'standard' | 'premium' | 'luxury';
  doorType: 'manual_telescopic' | 'auto_telescopic' | 'auto_center_opening' | 'swing_manual';
  voltageRequirement: 'single_phase_220v' | 'three_phase_415v';
  speedMs: number;
  hasFiremanSwitch: boolean;
  hasArd: boolean;
  notes: string;
}

export const QuotePricing: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Settle pricing configurations
  const [marginPct, setMarginPct] = useState<number>(25); // Default 25% margin
  const [minMarginFloor, setMinMarginFloor] = useState<number>(18); // Enforced 18% floor policy
  const [customCivilCost, setCustomCivilCost] = useState<number>(0);
  const [useCustomCivil, setUseCustomCivil] = useState<boolean>(false);
  const [civilNote, setCivilNote] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Load the active specification from LocalStorage
  const activeSpec: QuotationSpec = useMemo(() => {
    try {
      const stored = localStorage.getItem('aiec_active_quote_spec');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    // Fallback default spec if none active
    return {
      linkedLeadId: "lead_srv_001",
      driveType: "gearless_traction",
      capacityPersons: 6,
      capacityKg: 408,
      stopsCount: 5,
      travelHeight: 15,
      cabinFinishTier: "premium",
      doorType: "auto_telescopic",
      voltageRequirement: "three_phase_415v",
      speedMs: 1.0,
      hasFiremanSwitch: true,
      hasArd: true,
      notes: ""
    };
  }, [isRefreshing]);

  // Translate labels
  const t = useMemo(() => {
    const localizations = {
      en: {
        title: "Cost Breakdown & Margin Calculator",
        subtitle: "Audit structural component rates, civil installation work deltas, margins, and generate client-ready quote proposals instantly.",
        driveCostLabel: "Equipment & Lift Package",
        stopsDeltaLabel: "Incremental Floor Delta Cost",
        stopsDeltaDesc: "Calculated per additional floor stop driver.",
        civilLabel: "Civil Pit & Shaft Work Estimate",
        civilDesc: "Auto-computed pit preparation estimate. Standard structural guidelines apply.",
        laborLabel: "On-Site Installation Labor",
        transportLabel: "Heavy Transport & Logistics",
        subtotalLabel: "Taxable Net Subtotal",
        gstLabel: "Goods & Services Tax (GST 18%)",
        profitMarginLabel: "AIEC Gross Margin Config",
        marginFloorWarning: "WARNING: Proposed pricing violates the mandatory 18% margin floor. Admin lock overrides are required to finalize this quote.",
        discountLabel: "Sales Closing Discount (INR)",
        finalPriceLabel: "Final Customer-Facing Quote Price",
        customCivilToggle: "Enable Site-Specific Civil Modification",
        civilNoteLabel: "Reason for Structural Override (Required)",
        saveBtn: "Commit Pricing & Lock Quote",
        savedSuccess: "Quotation pricing matrix locked successfully and synchronized with lead pipeline ledger.",
        perFloorRate: "Per-Floor Stop Delta Rate",
        recalculateBtn: "Reset Matrices",
        unauthorizedDiscount: "Margin constraint breach: Disallow client-facing generation without Admin override key."
      },
      hi: {
        title: "लागत विवरण और मार्जिन कैलकुलेटर",
        subtitle: "संरचनात्मक घटक दरों, नागरिक स्थापना कार्य डेल्टा, मार्जिन का ऑडिट करें, और तुरंत ग्राहक-तैयार उद्धरण प्रस्ताव उत्पन्न करें।",
        driveCostLabel: "उपकरण और लिफ्ट पैकेज",
        stopsDeltaLabel: "अतिरिक्त मंजिला डेल्टा लागत",
        stopsDeltaDesc: "प्रति अतिरिक्त मंजिल स्टॉप ड्राइवर के अनुसार गणना की गई।",
        civilLabel: "सिविल पिट और शाफ्ट कार्य अनुमान",
        civilDesc: "स्वचालित रूप से गणना की गई गड्ढा तैयार करने का अनुमान।",
        laborLabel: "ऑन-साइट इंस्टॉलेशन श्रम",
        transportLabel: "भारी परिवहन और रसद",
        subtotalLabel: "कर योग्य शुद्ध उप-योग",
        gstLabel: "वस्तु एवं सेवा कर (जीएसटी 18%)",
        profitMarginLabel: "AIEC सकल मार्जिन कॉन्फ़िगरेशन",
        marginFloorWarning: "चेतावनी: प्रस्तावित मूल्य निर्धारण अनिवार्य 18% मार्जिन फ्लोर का उल्लंघन करता है। व्यवस्थापक लॉक ओवरराइड आवश्यक हैं।",
        discountLabel: "बिक्री बंद करने की छूट (INR)",
        finalPriceLabel: "अंतिम ग्राहक-सामना कोटेशन मूल्य",
        customCivilToggle: "साइट-विशिष्ट सिविल संशोधन सक्षम करें",
        civilNoteLabel: "संरचनात्मक ओवरराइड का कारण (आवश्यक)",
        saveBtn: "मूल्य निर्धारण प्रतिबद्ध करें और उद्धरण लॉक करें",
        savedSuccess: "कोटेशन मूल्य निर्धारण मैट्रिक्स सफलतापूर्वक लॉक किया गया और लीड पाइपलाइन बहीखाता के साथ सिंक्रनाइज़ किया गया।",
        perFloorRate: "प्रति मंजिला स्टॉप डेल्टा दर",
        recalculateBtn: "मैट्रिक्स रीसेट करें",
        unauthorizedDiscount: "मार्जिन सीमा उल्लंघन: व्यवस्थापक ओवरराइड कुंजी के बिना ग्राहक-सामना उत्पादन अस्वीकृत है।"
      },
      mr: {
        title: "खर्च वर्गीकरण आणि नफा मार्गदर्शक",
        subtitle: "घटक दर, सिव्हिल इन्स्टॉलेशन कार्य डेल्टा, नफा मार्जिन यांचे ऑडिट करा आणि त्वरित ग्राहक कोटेशन तयार करा.",
        driveCostLabel: "इक्विपमेंट आणि लिफ्ट पॅकेज",
        stopsDeltaLabel: "अतिरिक्त मजला डेल्टा खर्च",
        stopsDeltaDesc: "प्रति अतिरिक्त मजला स्टॉप ड्रायव्हरनुसार मोजलेले.",
        civilLabel: "सिव्हिल खड्डा आणि शाफ्ट कार्य अंदाज",
        civilDesc: "खड्डा तयार करण्याचा स्वयंचलित अंदाज.",
        laborLabel: "प्रत्यक्ष जागेवरील इन्स्टॉलेशन कामगार खर्च",
        transportLabel: "जड वाहतूक आणि लॉजिस्टिक्स",
        subtotalLabel: "करपात्र निव्वळ उपएकूण",
        gstLabel: "वस्तू आणि सेवा कर (GST १८%)",
        profitMarginLabel: "AIEC निव्वळ नफा मार्जिन रचना",
        marginFloorWarning: "सावधानता: प्रस्तावित किंमत अनिवार्य १८% नफा मर्यादेचे उल्लंघन करत आहे. पुढे जाण्यासाठी ॲडमिन मंजुरी आवश्यक आहे.",
        discountLabel: "विक्री सवलत (INR)",
        finalPriceLabel: "अंतिम ग्राहक कोटेशन किंमत",
        customCivilToggle: "विशिष्ट जागा सिव्हिल बदल सक्षम करा",
        civilNoteLabel: "बदलाचे कारण (आवश्यक)",
        saveBtn: "किंमत निश्चित करा आणि कोट लॉक करा",
        savedSuccess: "कोटेशन किंमत मॅट्रिक्स यशस्वीरित्या लॉक केली गेली आहे आणि लीड पाईपलाईनमध्ये नोंदवली आहे.",
        perFloorRate: "प्रति-मजला स्टॉप डेल्टा दर",
        recalculateBtn: "मॅट्रिक्स रीसेट करा",
        unauthorizedDiscount: "नफा मर्यादा भंग: ॲडमिन ओव्हरराइड की शिवाय ग्राहक कोटेशन तयार करता येणार नाही."
      }
    };
    return localizations[language] || localizations.en;
  }, [language]);

  // Precise Pricing Formula based on input specs
  const pricingCalculations = useMemo(() => {
    // 1. Base Equipment cost depends on drive type
    let baseEquipment = 350000; // default standard
    switch (activeSpec.driveType) {
      case 'hydraulic': baseEquipment = 420000; break;
      case 'geared_traction': baseEquipment = 380000; break;
      case 'gearless_traction': baseEquipment = 490000; break;
      case 'mrl': baseEquipment = 550000; break;
      case 'vacuum': baseEquipment = 650000; break;
      case 'screw': baseEquipment = 580000; break;
      case 'custom': baseEquipment = 700000; break;
    }

    // Finish tier multipliers
    let finishMultiplier = 1.0;
    if (activeSpec.cabinFinishTier === 'premium') finishMultiplier = 1.25;
    if (activeSpec.cabinFinishTier === 'luxury') finishMultiplier = 1.6;

    // Capacity multipliers
    const capacityFactor = Math.max(1, activeSpec.capacityKg / 400);
    const calculatedEquipment = Math.round(baseEquipment * finishMultiplier * capacityFactor);

    // 2. Incremental Floor Delta Cost
    const baseStops = 3; // base package includes 3 stops
    const stopDeltaRate = activeSpec.driveType === 'hydraulic' ? 35000 : 45000;
    const additionalStops = Math.max(0, activeSpec.stopsCount - baseStops);
    const stopsDeltaCost = additionalStops * stopDeltaRate;

    // 3. Civil work cost
    const defaultCivilCost = Math.round(75000 + (activeSpec.stopsCount * 8000));
    const activeCivilCost = useCustomCivil ? customCivilCost : defaultCivilCost;

    // 4. Labor Cost (stops driven)
    const laborCost = Math.round(40000 + (activeSpec.stopsCount * 6000));

    // 5. Logistics/Transport
    const transportCost = Math.round(25000 + (activeSpec.stopsCount * 2000));

    // Calculate Taxable Sum
    const subtotalNoTax = calculatedEquipment + stopsDeltaCost + activeCivilCost + laborCost + transportCost;
    
    // Apply profit margin directly
    const rawMarginValue = subtotalNoTax * (marginPct / 100);
    
    // Total taxable amount before discounts and GST
    const taxableTotal = subtotalNoTax + rawMarginValue - discountValue;

    // Enforce 18% GST strictly on taxable amounts
    const gstAmount = Math.round(taxableTotal * 0.18);

    // Final price
    const finalPrice = Math.round(taxableTotal + gstAmount);

    // Accurate retro-calculated gross margin percentage
    const actualMarginValue = rawMarginValue - discountValue;
    const actualMarginPct = subtotalNoTax > 0 ? (actualMarginValue / subtotalNoTax) * 100 : 0;

    return {
      calculatedEquipment,
      stopsDeltaCost,
      stopDeltaRate,
      defaultCivilCost,
      activeCivilCost,
      laborCost,
      transportCost,
      subtotalNoTax,
      rawMarginValue,
      taxableTotal,
      gstAmount,
      finalPrice,
      actualMarginPct
    };
  }, [activeSpec, marginPct, customCivilCost, useCustomCivil, discountValue]);

  // Is floor rule breached?
  const isFloorBreached = pricingCalculations.actualMarginPct < minMarginFloor;

  const handleSave = () => {
    if (isFloorBreached) {
      setToastMsg(t.unauthorizedDiscount);
      setTimeout(() => setToastMsg(''), 4500);
      return;
    }
    if (useCustomCivil && !civilNote) {
      setToastMsg("Please provide a structural override justification.");
      setTimeout(() => setToastMsg(''), 4500);
      return;
    }
    setIsSaved(true);
    setToastMsg(t.savedSuccess);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const handleRecalculate = () => {
    setIsRefreshing(true);
    setMarginPct(25);
    setDiscountValue(0);
    setUseCustomCivil(false);
    setCivilNote('');
    setIsSaved(false);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast alert system */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0E4B3D] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2">
          {isSaved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertTriangle className="w-4 h-4 text-white" />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Dual Progress Bar Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Auto-Quotation Engine Module Progress (Screen 2 of 10)</span>
            <span>20.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '20%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 62 of 200)</span>
            <span>31.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '31%' }} />
          </div>
        </div>
      </div>

      {/* SLA Metric Headroom / Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            PROFIT COCKPIT • MODULE 7 • AUTOMATED COST CALCULATIONS
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2A2723] tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRecalculate}
            variant="secondary"
            className="text-xs font-bold py-2.5 px-4 flex items-center gap-1.5 bg-white border border-[#e5dfd4]"
          >
            <RefreshCw className={`w-4 h-4 text-warmgray ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{t.recalculateBtn}</span>
          </Button>
        </div>
      </div>

      {/* Input specs feedback banner */}
      <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-alabaster border border-[#e5dfd4] flex items-center justify-center text-antiquegold font-bold">
            {activeSpec.stopsCount}
          </div>
          <div>
            <span className="block text-[10px] font-mono font-bold text-warmgray uppercase">LOCKED SPECIFICATIONS</span>
            <span className="block text-xs font-bold text-charcoal">
              {activeSpec.driveType.toUpperCase().replace('_', ' ')} • {activeSpec.capacityPersons} Pax ({activeSpec.capacityKg}kg) • {activeSpec.cabinFinishTier.toUpperCase()}
            </span>
          </div>
        </div>
        <Badge status="quoted" text={`${activeSpec.stopsCount} Stops Active`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Calculations Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 bg-white space-y-6">
            <div className="border-b border-[rgba(184,135,61,0.15)] pb-4 flex justify-between items-center">
              <h3 className="font-serif text-base font-bold text-charcoal">Itemized Cost Structure</h3>
              <span className="text-[10px] font-mono font-bold text-royalemerald">INR (Western Numeral System)</span>
            </div>

            {/* Itemized Rows */}
            <div className="space-y-4">
              
              {/* Row 1: Equipment Pack */}
              <div className="flex justify-between items-start gap-4 p-3 bg-alabaster rounded-xl border border-[#e5dfd4]/50">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-charcoal block">{t.driveCostLabel}</span>
                  <span className="text-[10px] text-warmgray block">Includes {activeSpec.driveType.replace('_', ' ')} drive unit and raw structural steel chassis.</span>
                </div>
                <span className="font-mono text-sm font-black text-charcoal shrink-0">₹{pricingCalculations.calculatedEquipment.toLocaleString()}</span>
              </div>

              {/* Row 2: Stops Incremental */}
              <div className="flex justify-between items-start gap-4 p-3 bg-alabaster rounded-xl border border-[#e5dfd4]/50">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-charcoal block">{t.stopsDeltaLabel}</span>
                  <span className="text-[10px] text-warmgray block">{t.stopsDeltaDesc} (₹{pricingCalculations.stopDeltaRate.toLocaleString()} / stop).</span>
                </div>
                <span className="font-mono text-sm font-black text-charcoal shrink-0">₹{pricingCalculations.stopsDeltaCost.toLocaleString()}</span>
              </div>

              {/* Row 3: Civil Works with Manual Override Override */}
              <div className="p-3 bg-alabaster rounded-xl border border-[#e5dfd4]/50 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-charcoal block">{t.civilLabel}</span>
                    <span className="text-[10px] text-warmgray block">{t.civilDesc}</span>
                  </div>
                  <span className="font-mono text-sm font-black text-charcoal shrink-0">₹{pricingCalculations.activeCivilCost.toLocaleString()}</span>
                </div>

                {/* Civil Custom override form */}
                <div className="border-t border-[#e5dfd4] pt-3 mt-1 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={useCustomCivil}
                      onChange={(e) => setUseCustomCivil(e.target.checked)}
                      className="rounded border-[#e5dfd4] text-royalemerald focus:ring-royalemerald"
                    />
                    <span className="text-[11px] font-bold text-charcoal">{t.customCivilToggle}</span>
                  </label>

                  {useCustomCivil && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-mono font-bold text-warmgray">Manual Civil Estimate (INR)</span>
                        <input 
                          type="number"
                          value={customCivilCost}
                          onChange={(e) => setCustomCivilCost(parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-[#e5dfd4] rounded-lg p-2 text-xs font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-mono font-bold text-warmgray">{t.civilNoteLabel}</span>
                        <input 
                          type="text"
                          placeholder="e.g. Difficult pit excavation / structural slab changes needed"
                          value={civilNote}
                          onChange={(e) => setCivilNote(e.target.value)}
                          className="w-full bg-white border border-[#e5dfd4] rounded-lg p-2 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Labor */}
              <div className="flex justify-between items-start gap-4 p-3 bg-alabaster rounded-xl border border-[#e5dfd4]/50">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-charcoal block">{t.laborLabel}</span>
                  <span className="text-[10px] text-warmgray block">Standard field technician hours for {activeSpec.stopsCount} openings.</span>
                </div>
                <span className="font-mono text-sm font-black text-charcoal shrink-0">₹{pricingCalculations.laborCost.toLocaleString()}</span>
              </div>

              {/* Row 5: Logistics */}
              <div className="flex justify-between items-start gap-4 p-3 bg-alabaster rounded-xl border border-[#e5dfd4]/50">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-charcoal block">{t.transportLabel}</span>
                  <span className="text-[10px] text-warmgray block">Handling machinery delivery and regional freight charges.</span>
                </div>
                <span className="font-mono text-sm font-black text-charcoal shrink-0">₹{pricingCalculations.transportCost.toLocaleString()}</span>
              </div>

            </div>

            {/* Sizable Taxable Subtotal */}
            <div className="border-t border-[rgba(184,135,61,0.15)] pt-4 flex justify-between items-baseline">
              <span className="font-serif text-sm font-bold text-charcoal">{t.subtotalLabel}</span>
              <span className="font-mono text-lg font-black text-royalemerald">₹{pricingCalculations.subtotalNoTax.toLocaleString()}</span>
            </div>

          </Card>
        </div>

        {/* Right Side: Margin Cockpit & Profit Enforcement */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Profit cockpit */}
          <Card className="p-6 bg-white space-y-6 border-2 border-[rgba(184,135,61,0.25)]">
            <div className="border-b border-[rgba(184,135,61,0.15)] pb-3">
              <h3 className="font-serif text-base font-bold text-charcoal">{t.profitMarginLabel}</h3>
              <p className="text-[10px] text-warmgray mt-0.5">Policy limits: Minimum {minMarginFloor}% gross profit margins</p>
            </div>

            {/* Slide margin control */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-charcoal uppercase font-mono">Proposed Target Margin</span>
                <span className={`font-mono text-base ${isFloorBreached ? 'text-[#B23B3B]' : 'text-royalemerald'}`}>
                  {marginPct}%
                </span>
              </div>
              <input 
                type="range"
                min="10"
                max="50"
                value={marginPct}
                onChange={(e) => setMarginPct(parseInt(e.target.value))}
                className="w-full accent-antiquegold bg-alabaster h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-warmgray font-bold">
                <span>10% Low</span>
                <span>{minMarginFloor}% Safe Floor Limit</span>
                <span>50% Luxury Max</span>
              </div>
            </div>

            {/* Discount Control */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                {t.discountLabel}
              </label>
              <div className="relative">
                <input 
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseInt(e.target.value) || 0)}
                  className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-mono font-bold"
                />
                <span className="absolute right-3 top-3.5 text-xs text-warmgray font-mono font-bold">INR</span>
              </div>
            </div>

            {/* Calculations Outcome Indicator */}
            <div className="space-y-2 pt-3 border-t border-[#e5dfd4]/60">
              <div className="flex justify-between text-xs font-semibold text-warmgray">
                <span>Total Net Taxable:</span>
                <span className="font-mono text-charcoal">₹{pricingCalculations.taxableTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-warmgray">
                <span>{t.gstLabel}:</span>
                <span className="font-mono text-charcoal">₹{pricingCalculations.gstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-charcoal">
                <span>Actual Configured Margin:</span>
                <span className={`font-mono ${isFloorBreached ? 'text-[#B23B3B]' : 'text-royalemerald'}`}>
                  {pricingCalculations.actualMarginPct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Floor rule violation alert */}
            {isFloorBreached && (
              <div className="p-3 bg-red-50 border border-[#B23B3B]/20 rounded-xl flex items-start gap-2.5 text-[11px] font-bold text-[#B23B3B] leading-relaxed">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t.marginFloorWarning}</span>
              </div>
            )}

            {/* Massive Customer Facing Price card */}
            <div className="bg-alabaster p-4 rounded-xl border border-antiquegold/20 text-center">
              <span className="block text-[10px] font-mono font-bold text-warmgray uppercase">{t.finalPriceLabel}</span>
              <span className="block font-serif text-2xl font-black text-charcoal mt-1.5">
                ₹{pricingCalculations.finalPrice.toLocaleString()}
              </span>
              <span className="block text-[8px] font-mono text-warmgray mt-1">Includes exact standard 18% GST liability</span>
            </div>

            {/* Commit / lock proposal */}
            <Button
              onClick={handleSave}
              variant="primary"
              className="w-full text-xs font-bold py-3 px-4 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.saveBtn}</span>
            </Button>

          </Card>

          {/* Precision structural rule summary */}
          <Card className="p-4 bg-alabaster border border-[#e5dfd4] rounded-xl space-y-2 text-[11px] leading-relaxed text-warmgray">
            <div className="flex items-center gap-2 text-charcoal font-bold">
              <Clipboard className="w-4 h-4 text-antiquegold" />
              <span>SLA Revenue Audit Guidelines</span>
            </div>
            <p className="font-semibold">
              The calculations above strictly resolve all material requirements. Changing specs instantly cascades updates down to live proposal sheets, preserving accurate tax schedules before customer dispatch.
            </p>
          </Card>

        </div>

      </div>

    </div>
  );
};
