import React, { useState, useEffect } from 'react';
import { User, Supplier, SupplierCatalogItem, PriceHistoryEntry } from '../types';
import { DbManager } from '../lib/db';
import { Card } from './Common';
import { 
  Building, Search, Filter, Plus, Edit2, History, Upload, CheckCircle2, 
  XCircle, AlertTriangle, Shield, Clock, FileText, ArrowRight, RefreshCw, 
  Tag, ChevronDown, Check, Ban, AlertCircle, Trash2, ArrowUpRight, DollarSign
} from 'lucide-react';

interface SupplierCatalogPricingProps {
  user: User;
  onNavigateToPO?: () => void;
}

const CATEGORY_TAXONOMY = [
  'All Categories',
  'Traction Drives',
  'VVVF Controllers',
  'Cabins',
  'Steel Guide Rails',
  'Cabin Frames & Slings',
  'Counterweights',
  'Safety Gears',
  'Hydraulic Cylinders',
  'Vacuum Pneumatic Systems',
  'Accessibility Lifts (IS 14671)',
  'Door Operators',
  'COP & LOP Touch Panels'
];

export const SupplierCatalogPricing: React.FC<SupplierCatalogPricingProps> = ({ user, onNavigateToPO }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDiscontinued, setShowDiscontinued] = useState<boolean>(false);

  // Modals & Drawers
  const [editingItem, setEditingItem] = useState<SupplierCatalogItem | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState<boolean>(false);
  const [historyItem, setHistoryItem] = useState<SupplierCatalogItem | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>('');
  const [bulkValidationErrors, setBulkValidationErrors] = useState<string[]>([]);
  const [bulkParsedItems, setBulkParsedItems] = useState<Partial<SupplierCatalogItem>[]>([]);

  // Item form states
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Traction Drives');
  const [itemPrice, setItemPrice] = useState('');
  const [itemLeadTimeDays, setItemLeadTimeDays] = useState('14');
  const [itemSpec, setItemSpec] = useState('');
  const [changeReason, setChangeReason] = useState('');

  // Approval Threshold (% change required for Admin Review if modified by Supplier)
  const PRICE_THRESHOLD_PERCENT = 5;

  useEffect(() => {
    loadSuppliers();
    const handleDbUpdate = () => loadSuppliers();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, []);

  const loadSuppliers = () => {
    const data = DbManager.getSuppliers();
    setSuppliers(data);
    if (!selectedSupplierId && data.length > 0) {
      if (user.role === 'supplier') {
        const mySup = data.find(s => s.id === user.supplierId) || data[0];
        setSelectedSupplierId(mySup.id);
      } else {
        setSelectedSupplierId(data[0].id);
      }
    }
  };

  const activeSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

  const filteredCatalog = (activeSupplier?.catalog || []).filter(item => {
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.specification && item.specification.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDiscontinued = showDiscontinued ? true : !item.isDiscontinued;
    return matchesCategory && matchesSearch && matchesDiscontinued;
  });

  const handleOpenEditModal = (item: SupplierCatalogItem) => {
    setEditingItem(item);
    setItemName(item.itemName);
    setItemCategory(item.category || 'Traction Drives');
    setItemPrice(item.price.toString());
    setItemLeadTimeDays((item.leadTimeDays || 14).toString());
    setItemSpec(item.specification || '');
    setChangeReason('');
  };

  const handleOpenNewModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemCategory('Traction Drives');
    setItemPrice('');
    setItemLeadTimeDays('14');
    setItemSpec('');
    setChangeReason('');
    setIsNewItemModalOpen(true);
  };

  const handleSaveCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupplier || !itemName || !itemPrice) return;

    const newPriceNum = parseFloat(itemPrice);
    if (isNaN(newPriceNum) || newPriceNum <= 0) {
      alert('Please enter a valid positive price.');
      return;
    }

    const updatedCatalog = [...activeSupplier.catalog];

    if (editingItem) {
      // Editing existing item
      const itemIdx = updatedCatalog.findIndex(i => i.itemId === editingItem.itemId);
      if (itemIdx >= 0) {
        const oldItem = updatedCatalog[itemIdx];
        const oldPrice = oldItem.price;
        const percentChange = Math.abs((newPriceNum - oldPrice) / oldPrice) * 100;

        let needsAdminApproval = user.role === 'supplier' && percentChange > PRICE_THRESHOLD_PERCENT;

        const historyEntry: PriceHistoryEntry = {
          timestamp: new Date().toISOString(),
          oldPrice: oldPrice,
          newPrice: newPriceNum,
          changedBy: `${user.name} (${user.role.toUpperCase()})`,
          status: needsAdminApproval ? 'Pending Admin Review' : 'Approved',
          reason: changeReason || 'Routine Catalog Update'
        };

        const existingHistory = oldItem.priceHistory || [];

        if (needsAdminApproval) {
          // Keep old price, store in pendingPrice
          updatedCatalog[itemIdx] = {
            ...oldItem,
            itemName,
            category: itemCategory,
            leadTimeDays: parseInt(itemLeadTimeDays) || 14,
            specification: itemSpec,
            pendingPrice: newPriceNum,
            pendingPriceReason: changeReason || 'Price modification submitted',
            priceHistory: [historyEntry, ...existingHistory],
            lastUpdated: new Date().toISOString()
          };
        } else {
          // Direct update or Admin approved
          updatedCatalog[itemIdx] = {
            ...oldItem,
            itemName,
            category: itemCategory,
            price: newPriceNum,
            pendingPrice: undefined,
            pendingPriceReason: undefined,
            leadTimeDays: parseInt(itemLeadTimeDays) || 14,
            specification: itemSpec,
            priceHistory: [historyEntry, ...existingHistory],
            lastUpdated: new Date().toISOString()
          };
        }
      }
    } else {
      // Creating brand new item
      const newItem: SupplierCatalogItem = {
        itemId: `cat_${Date.now()}`,
        itemName,
        category: itemCategory,
        price: newPriceNum,
        leadTimeDays: parseInt(itemLeadTimeDays) || 14,
        specification: itemSpec,
        isDiscontinued: false,
        priceHistory: [{
          timestamp: new Date().toISOString(),
          oldPrice: 0,
          newPrice: newPriceNum,
          changedBy: `${user.name} (${user.role.toUpperCase()})`,
          status: 'Approved',
          reason: 'Initial Catalog Item Creation'
        }],
        lastUpdated: new Date().toISOString()
      };
      updatedCatalog.push(newItem);
    }

    const updatedSupplier: Supplier = {
      ...activeSupplier,
      catalog: updatedCatalog
    };

    DbManager.updateSupplier(updatedSupplier);
    setEditingItem(null);
    setIsNewItemModalOpen(false);
  };

  const handleApprovePendingPrice = (item: SupplierCatalogItem) => {
    if (!activeSupplier || !item.pendingPrice) return;

    const updatedCatalog = activeSupplier.catalog.map(i => {
      if (i.itemId === item.itemId) {
        const approvedHistory: PriceHistoryEntry[] = (i.priceHistory || []).map((h, idx) => {
          if (idx === 0 && h.status === 'Pending Admin Review') {
            return { ...h, status: 'Approved' as const };
          }
          return h;
        });

        return {
          ...i,
          price: i.pendingPrice,
          pendingPrice: undefined,
          pendingPriceReason: undefined,
          priceHistory: approvedHistory,
          lastUpdated: new Date().toISOString()
        };
      }
      return i;
    });

    DbManager.updateSupplier({
      ...activeSupplier,
      catalog: updatedCatalog
    });
  };

  const handleRejectPendingPrice = (item: SupplierCatalogItem) => {
    if (!activeSupplier) return;

    const updatedCatalog = activeSupplier.catalog.map(i => {
      if (i.itemId === item.itemId) {
        return {
          ...i,
          pendingPrice: undefined,
          pendingPriceReason: undefined,
          lastUpdated: new Date().toISOString()
        };
      }
      return i;
    });

    DbManager.updateSupplier({
      ...activeSupplier,
      catalog: updatedCatalog
    });
  };

  const handleToggleDiscontinued = (item: SupplierCatalogItem) => {
    if (!activeSupplier) return;

    const updatedCatalog = activeSupplier.catalog.map(i => {
      if (i.itemId === item.itemId) {
        return {
          ...i,
          isDiscontinued: !i.isDiscontinued,
          lastUpdated: new Date().toISOString()
        };
      }
      return i;
    });

    DbManager.updateSupplier({
      ...activeSupplier,
      catalog: updatedCatalog
    });
  };

  // Bulk Upload Parsing and Sanity Validation
  const handleParseBulkData = () => {
    setBulkValidationErrors([]);
    setBulkParsedItems([]);

    if (!bulkText.trim()) {
      setBulkValidationErrors(['Bulk input area is empty. Please enter CSV or tabular catalog lines.']);
      return;
    }

    const lines = bulkText.split('\n').filter(l => l.trim().length > 0);
    const errors: string[] = [];
    const parsed: Partial<SupplierCatalogItem>[] = [];

    lines.forEach((line, idx) => {
      // Expected format: Name, Price, Category, LeadTimeDays, Specification
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 2) {
        errors.push(`Row ${idx + 1}: Insufficient columns. Minimum required: Item Name, Price.`);
        return;
      }

      const name = parts[0];
      const priceVal = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
      const cat = parts[2] || 'Traction Drives';
      const leadTime = parseInt(parts[3]) || 14;
      const spec = parts[4] || '';

      if (!name) {
        errors.push(`Row ${idx + 1}: Missing item name.`);
      }
      if (isNaN(priceVal) || priceVal <= 0) {
        errors.push(`Row ${idx + 1}: Price '${parts[1]}' is invalid or zero (Sanity failure).`);
      } else if (priceVal > 10000000) {
        errors.push(`Row ${idx + 1}: Price ₹${priceVal.toLocaleString('en-IN')} exceeds sanity safety threshold (Max ₹1 Cr).`);
      }

      if (name && !isNaN(priceVal) && priceVal > 0 && priceVal <= 10000000) {
        parsed.push({
          itemName: name,
          price: priceVal,
          category: cat,
          leadTimeDays: leadTime,
          specification: spec
        });
      }
    });

    setBulkValidationErrors(errors);
    setBulkParsedItems(parsed);
  };

  const handleCommitBulkUpload = () => {
    if (!activeSupplier || bulkParsedItems.length === 0) return;

    const newItems: SupplierCatalogItem[] = bulkParsedItems.map((p, idx) => ({
      itemId: `cat_bulk_${Date.now()}_${idx}`,
      itemName: p.itemName || 'Bulk Item',
      price: p.price || 100000,
      category: p.category || 'Traction Drives',
      leadTimeDays: p.leadTimeDays || 14,
      specification: p.specification || 'Bulk Imported Specification',
      isDiscontinued: false,
      priceHistory: [{
        timestamp: new Date().toISOString(),
        oldPrice: 0,
        newPrice: p.price || 100000,
        changedBy: `${user.name} (Bulk Import)`,
        status: 'Approved',
        reason: 'Bulk CSV Catalog Import'
      }],
      lastUpdated: new Date().toISOString()
    }));

    const updatedSupplier: Supplier = {
      ...activeSupplier,
      catalog: [...activeSupplier.catalog, ...newItems]
    };

    DbManager.updateSupplier(updatedSupplier);
    setIsBulkModalOpen(false);
    setBulkText('');
    setBulkParsedItems([]);
    setBulkValidationErrors([]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header */}
      <div className="bg-surface p-6 rounded-2xl border border-gold/15 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-antiquegold bg-antiquegold/10 px-2.5 py-1 rounded-full border border-antiquegold/20">
              Module 10 • Screen 3
            </span>
            {activeSupplier?.kycStatus === 'Verified' ? (
              <span className="text-xs font-semibold text-royalemerald bg-royalemerald/10 px-2.5 py-1 rounded-full border border-royalemerald/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Sourcing Partner
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                {activeSupplier?.kycStatus} Status
              </span>
            )}
          </div>
          <h1 className="text-2xl font-serif font-bold text-charcoal mt-2">
            Supplier Catalog & Parts Pricing Engine
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Real-time parts specifications, lead times, and price controls directly feeding PO auto-matching and Quotation rules.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-gold/30 bg-surface hover:bg-gold/10 text-charcoal text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-antiquegold" />
            Bulk CSV Import
          </button>
          <button
            onClick={handleOpenNewModal}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-antiquegold hover:bg-antiquegold/90 text-white text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Catalog Item
          </button>
        </div>
      </div>

      {/* Supplier Selector (For Admin) & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface border-gold/15 flex flex-col justify-between">
          <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wide">
            Selected Sourcing Vendor
          </label>
          <div className="relative mt-2">
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full bg-background border border-gold/20 rounded-xl px-3 py-2 text-sm font-semibold text-charcoal pr-8 focus:outline-none focus:border-antiquegold"
            >
              {suppliers.map(sup => (
                <option key={sup.id} value={sup.id}>
                  {sup.name} ({sup.kycStatus})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-charcoal/50 absolute right-3 top-2.5 pointer-events-none" />
          </div>
          <div className="mt-2 text-xs text-charcoal/60 flex items-center justify-between">
            <span>GSTIN: {activeSupplier?.gstin || 'N/A'}</span>
            <span className="font-mono text-royalemerald font-semibold">★ {activeSupplier?.performanceScore}/100</span>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-gold/15 flex flex-col justify-between">
          <span className="text-xs font-medium text-charcoal/60 uppercase tracking-wide">Total Active Models</span>
          <div className="text-2xl font-mono font-bold text-charcoal mt-1">
            {(activeSupplier?.catalog || []).filter(i => !i.isDiscontinued).length}
          </div>
          <span className="text-xs text-charcoal/60 mt-1">
            Across {new Set((activeSupplier?.catalog || []).map(i => i.category)).size} categories
          </span>
        </Card>

        <Card className="p-4 bg-surface border-gold/15 flex flex-col justify-between">
          <span className="text-xs font-medium text-charcoal/60 uppercase tracking-wide">Pending Price Reviews</span>
          <div className="text-2xl font-mono font-bold text-amber-700 mt-1">
            {(activeSupplier?.catalog || []).filter(i => i.pendingPrice !== undefined).length}
          </div>
          <span className="text-xs text-amber-700/80 mt-1 font-medium">
            Requires Admin verification &gt;{PRICE_THRESHOLD_PERCENT}%
          </span>
        </Card>

        <Card className="p-4 bg-surface border-gold/15 flex flex-col justify-between">
          <span className="text-xs font-medium text-charcoal/60 uppercase tracking-wide">Discontinued / Legacy</span>
          <div className="text-2xl font-mono font-bold text-charcoal/50 mt-1">
            {(activeSupplier?.catalog || []).filter(i => i.isDiscontinued).length}
          </div>
          <span className="text-xs text-charcoal/60 mt-1">
            Excluded from future PO drafts
          </span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-surface border-gold/15 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by part name, model number, or technical spec..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-gold/20 rounded-xl pl-9 pr-4 py-2 text-sm text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-antiquegold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 border border-gold/20 bg-background rounded-xl px-3 py-1.5 text-xs text-charcoal">
              <Filter className="w-3.5 h-3.5 text-antiquegold" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent focus:outline-none text-xs font-medium text-charcoal"
              >
                {CATEGORY_TAXONOMY.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-charcoal/80 cursor-pointer bg-background border border-gold/20 px-3 py-2 rounded-xl">
              <input
                type="checkbox"
                checked={showDiscontinued}
                onChange={(e) => setShowDiscontinued(e.target.checked)}
                className="rounded text-antiquegold focus:ring-antiquegold accent-antiquegold"
              />
              Show Discontinued Items
            </label>
          </div>
        </div>
      </Card>

      {/* Catalog Items Table / List */}
      <div className="space-y-3">
        {filteredCatalog.length === 0 ? (
          <Card className="p-12 text-center bg-surface border-gold/15 space-y-3">
            <div className="w-12 h-12 rounded-full bg-antiquegold/10 text-antiquegold flex items-center justify-center mx-auto">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-charcoal">No Catalog Items Found</h3>
            <p className="text-sm text-charcoal/60 max-w-md mx-auto">
              No parts match your current filter and search criteria for {activeSupplier?.name}. Add new parts or adjust your search filter.
            </p>
            <button
              onClick={handleOpenNewModal}
              className="px-4 py-2 bg-antiquegold text-white text-sm font-semibold rounded-xl hover:bg-antiquegold/90 transition"
            >
              Add First Item
            </button>
          </Card>
        ) : (
          filteredCatalog.map((item) => {
            const hasPending = item.pendingPrice !== undefined;
            const isDiscontinued = item.isDiscontinued;

            return (
              <Card 
                key={item.itemId} 
                className={`p-4 bg-surface border transition-all ${
                  hasPending 
                    ? 'border-amber-500/40 shadow-sm bg-amber-500/5' 
                    : isDiscontinued 
                      ? 'border-gray-200 opacity-60 bg-gray-50/50' 
                      : 'border-gold/15 hover:border-gold/30'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Left Column: Details & Taxonomy */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-antiquegold/10 text-antiquegold border border-antiquegold/20">
                        {item.category || 'General Equipment'}
                      </span>
                      {hasPending && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> Price Approval Pending
                        </span>
                      )}
                      {isDiscontinued && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-700">
                          Discontinued / Legacy
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                      {item.itemName}
                      <span className="text-xs font-mono text-charcoal/40 font-normal">({item.itemId})</span>
                    </h3>

                    <p className="text-xs text-charcoal/70 line-clamp-2 max-w-2xl font-mono">
                      <span className="font-sans text-charcoal/50 font-semibold">SPEC: </span>
                      {item.specification || 'Standard manufacturing tolerance compliance.'}
                    </p>
                  </div>

                  {/* Middle Column: Lead Time & Price */}
                  <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-gold/15 pt-3 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <div className="text-xs text-charcoal/50 font-medium">Lead Time</div>
                      <div className="text-sm font-semibold text-charcoal flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-royalemerald" />
                        {item.leadTimeDays || 14} Days
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-charcoal/50 font-medium">Published Unit Price</div>
                      <div className="text-lg font-mono font-bold text-royalemerald">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                      {hasPending && (
                        <div className="text-xs font-mono font-semibold text-amber-700 flex items-center gap-1 justify-end">
                          <span>Requested: ₹{item.pendingPrice?.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-gold/15 pt-3 md:pt-0">
                    {hasPending && (user.role === 'admin' || user.role === 'owner') && (
                      <div className="flex items-center gap-1 bg-amber-500/10 p-1 rounded-xl border border-amber-500/30">
                        <button
                          onClick={() => handleApprovePendingPrice(item)}
                          title="Approve Price Change"
                          className="px-2.5 py-1 bg-royalemerald text-white text-xs font-semibold rounded-lg hover:bg-royalemerald/90 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectPendingPrice(item)}
                          title="Reject Price Change"
                          className="px-2.5 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setHistoryItem(item)}
                      title="View Price Change History"
                      className="p-2 rounded-xl border border-gold/20 hover:bg-gold/10 text-charcoal/70 hover:text-charcoal transition"
                    >
                      <History className="w-4 h-4 text-antiquegold" />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(item)}
                      title="Edit Item Details"
                      className="p-2 rounded-xl border border-gold/20 hover:bg-gold/10 text-charcoal/70 hover:text-charcoal transition"
                    >
                      <Edit2 className="w-4 h-4 text-charcoal" />
                    </button>

                    <button
                      onClick={() => handleToggleDiscontinued(item)}
                      title={isDiscontinued ? 'Re-activate Item' : 'Deactivate / Discontinue Item'}
                      className={`p-2 rounded-xl border transition ${
                        isDiscontinued 
                          ? 'border-royalemerald/30 bg-royalemerald/10 text-royalemerald' 
                          : 'border-red-500/20 hover:bg-red-50 text-red-600'
                      }`}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pending Reason Banner */}
                {hasPending && (
                  <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <strong>Supplier Reason:</strong> {item.pendingPriceReason || 'Price adjustment submitted.'}
                    </span>
                    <span className="text-[11px] text-amber-700 font-mono">
                      Delta: {(((item.pendingPrice! - item.price) / item.price) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Item Create / Edit Modal */}
      {(editingItem !== null || isNewItemModalOpen) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="p-6 max-w-lg w-full bg-surface border-gold/30 shadow-xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-gold/15 pb-3">
              <h3 className="text-lg font-serif font-bold text-charcoal">
                {editingItem ? `Edit Catalog Item (${editingItem.itemName})` : 'Add New Catalog Item'}
              </h3>
              <button 
                onClick={() => { setEditingItem(null); setIsNewItemModalOpen(false); }}
                className="text-charcoal/50 hover:text-charcoal p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCatalogItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Part / Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gearless Traction Motor 1.6m/s 630kg"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal/80 mb-1">Category Taxonomy *</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full bg-background border border-gold/20 rounded-xl px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-antiquegold"
                  >
                    {CATEGORY_TAXONOMY.filter(c => c !== 'All Categories').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal/80 mb-1">Lead Time (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    required
                    value={itemLeadTimeDays}
                    onChange={(e) => setItemLeadTimeDays(e.target.value)}
                    className="w-full bg-background border border-gold/20 rounded-xl px-3 py-2 text-sm text-charcoal font-mono focus:outline-none focus:border-antiquegold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Unit Price (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 250000"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl px-3 py-2 text-sm text-charcoal font-mono font-bold focus:outline-none focus:border-antiquegold"
                />
                {user.role === 'supplier' && editingItem && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    * Modifying price by &gt;{PRICE_THRESHOLD_PERCENT}% will trigger Admin verification before taking effect.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Technical Specifications / Drive Parameters</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Duty S1, 380V 3-Phase, IP54 Enclosure Rating, IS 14671 Compliance..."
                  value={itemSpec}
                  onChange={(e) => setItemSpec(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl p-3 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>

              {editingItem && (
                <div>
                  <label className="block font-semibold text-charcoal/80 mb-1">Reason for Price / Spec Adjustment</label>
                  <input
                    type="text"
                    placeholder="e.g. Raw material cost increase or design revision"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    className="w-full bg-background border border-gold/20 rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => { setEditingItem(null); setIsNewItemModalOpen(false); }}
                  className="px-4 py-2 rounded-xl border border-gold/20 text-charcoal/70 hover:bg-gold/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-antiquegold hover:bg-antiquegold/90 text-white font-semibold shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Price History Drawer Modal */}
      {historyItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-xl w-full bg-surface border-gold/30 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gold/15 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-charcoal">Price Audit Log</h3>
                <p className="text-xs text-charcoal/60">{historyItem.itemName} ({historyItem.itemId})</p>
              </div>
              <button onClick={() => setHistoryItem(null)} className="text-charcoal/50 hover:text-charcoal p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {(!historyItem.priceHistory || historyItem.priceHistory.length === 0) ? (
                <p className="text-xs text-charcoal/50 text-center py-6">No historical price changes recorded for this item.</p>
              ) : (
                historyItem.priceHistory.map((hist, idx) => (
                  <div key={idx} className="p-3 bg-background rounded-xl border border-gold/15 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-charcoal">{hist.changedBy}</span>
                      <span className="font-mono text-charcoal/50 text-[11px]">{new Date(hist.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono font-semibold">
                      <span className="text-charcoal/50 line-through">₹{hist.oldPrice.toLocaleString('en-IN')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-antiquegold" />
                      <span className="text-royalemerald text-sm">₹{hist.newPrice.toLocaleString('en-IN')}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ml-auto font-sans font-bold ${
                        hist.status === 'Approved' ? 'bg-royalemerald/10 text-royalemerald' : 'bg-amber-500/10 text-amber-700'
                      }`}>
                        {hist.status}
                      </span>
                    </div>
                    {hist.reason && (
                      <p className="text-charcoal/70 text-[11px] italic mt-1">Note: "{hist.reason}"</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="text-right pt-2 border-t border-gold/15">
              <button
                onClick={() => setHistoryItem(null)}
                className="px-4 py-2 bg-antiquegold text-white text-xs font-semibold rounded-xl"
              >
                Close Audit Log
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-2xl w-full bg-surface border-gold/30 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gold/15 pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-charcoal">Bulk Catalog Import</h3>
                <p className="text-xs text-charcoal/60">Import parts for {activeSupplier?.name} via CSV/Tabular text.</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-charcoal/50 hover:text-charcoal p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-antiquegold/10 border border-antiquegold/20 rounded-xl p-3 text-charcoal/80 space-y-1">
                <p className="font-semibold text-antiquegold">CSV Format Requirement:</p>
                <p className="font-mono text-[11px]">Item Name, Unit Price, Category, LeadTimeDays, Specifications</p>
                <p className="text-[11px] text-charcoal/60">Example: <code className="bg-background px-1 rounded">MRL Traction Motor 1.0m/s, 240000, Traction Drives, 14, 380V PMSM Motor</code></p>
              </div>

              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Paste CSV / Catalog Lines</label>
                <textarea
                  rows={6}
                  placeholder="Paste your CSV catalog data here..."
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl p-3 font-mono text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>

              {/* Sanity Validation Failures */}
              {bulkValidationErrors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 space-y-1 text-red-700">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Validation & Sanity Issues Flagged ({bulkValidationErrors.length}):
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] max-h-28 overflow-y-auto">
                    {bulkValidationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Parsed Items Preview */}
              {bulkParsedItems.length > 0 && (
                <div className="bg-royalemerald/10 border border-royalemerald/20 rounded-xl p-3 space-y-1 text-royalemerald">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-royalemerald" />
                    {bulkParsedItems.length} Valid Row(s) Ready for Commit:
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono text-charcoal">
                    {bulkParsedItems.map((p, idx) => (
                      <div key={idx} className="flex justify-between border-b border-royalemerald/10 pb-0.5">
                        <span>{p.itemName} ({p.category})</span>
                        <span className="font-bold">₹{p.price?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gold/15">
              <button
                type="button"
                onClick={handleParseBulkData}
                className="px-4 py-2 rounded-xl bg-background border border-gold/30 text-charcoal text-xs font-semibold hover:bg-gold/10"
              >
                Validate & Parse CSV
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gold/20 text-charcoal/70 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={bulkParsedItems.length === 0}
                  onClick={handleCommitBulkUpload}
                  className="px-5 py-2 rounded-xl bg-antiquegold text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Commit {bulkParsedItems.length} Items
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
