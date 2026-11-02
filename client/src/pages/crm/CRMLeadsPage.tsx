import React, { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import crmService from '../../services/crmService';
import {
  ILeadItem,
  IFollowUpItem,
  LeadSourceOption,
  LeadStatusStage,
  FollowUpTypeOption,
  CustomerTypeOption
} from '../../types';
import {
  Layers,
  Search,
  Plus,
  Kanban,
  List,
  Calendar,
  CheckCircle2,
  Clock,
  Building,
  UserCheck,
  DollarSign,
  Trash2,
  Edit2,
  X,
  AlertCircle
} from 'lucide-react';

const STAGES: Array<{ key: LeadStatusStage; label: string; color: string; bgColor: string }> = [
  { key: 'NEW', label: 'New Lead', color: 'border-blue-400', bgColor: 'bg-blue-50/70' },
  { key: 'CONTACTED', label: 'Contacted', color: 'border-amber-400', bgColor: 'bg-amber-50/70' },
  { key: 'QUALIFIED', label: 'Qualified', color: 'border-indigo-400', bgColor: 'bg-indigo-50/70' },
  { key: 'PROPOSAL', label: 'Proposal', color: 'border-purple-400', bgColor: 'bg-purple-50/70' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'border-orange-400', bgColor: 'bg-orange-50/70' },
  { key: 'WON', label: 'Won', color: 'border-emerald-500', bgColor: 'bg-emerald-50/70' },
  { key: 'LOST', label: 'Lost', color: 'border-slate-400', bgColor: 'bg-slate-50/70' }
];

const SOURCES: LeadSourceOption[] = [
  'Website',
  'Social Media',
  'Referral',
  'Advertisement',
  'Direct Contact',
  'Other'
];

export const CRMLeadsPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  // Main Tabs: 'pipeline' | 'followups'
  const [activeTab, setActiveTab] = useState<'pipeline' | 'followups'>('pipeline');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Leads state
  const [leads, setLeads] = useState<ILeadItem[]>([]);
  const [followUps, setFollowUps] = useState<IFollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Modals
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showDeleteLeadModal, setShowDeleteLeadModal] = useState(false);
  const [showAddFollowUpModal, setShowAddFollowUpModal] = useState(false);

  // Selected lead
  const [selectedLead, setSelectedLead] = useState<ILeadItem | null>(null);

  // Form states
  const [leadForm, setLeadForm] = useState({
    leadName: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website' as LeadSourceOption,
    leadValue: 0,
    expectedClosingDate: '',
    notes: '',
    status: 'NEW' as LeadStatusStage
  });

  const [convertForm, setConvertForm] = useState({
    customerType: 'BUSINESS' as CustomerTypeOption
  });

  const [followUpForm, setFollowUpForm] = useState({
    title: '',
    type: 'CALL' as FollowUpTypeOption,
    scheduledDate: '',
    nextFollowUpDate: '',
    notes: '',
    leadId: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLeads = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await crmService.listLeads(businessId, {
        search: searchTerm,
        source: sourceFilter
      });
      setLeads(res || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, [businessId, searchTerm, sourceFilter]);

  const fetchFollowUps = useCallback(async () => {
    if (!businessId) return;
    try {
      const res = await crmService.listFollowUps(businessId);
      setFollowUps(res || []);
    } catch {
      setFollowUps([]);
    }
  }, [businessId]);

  useEffect(() => {
    fetchLeads();
    fetchFollowUps();
  }, [fetchLeads, fetchFollowUps]);

  const resetLeadForm = () => {
    setLeadForm({
      leadName: '',
      email: '',
      phone: '',
      company: '',
      source: 'Website',
      leadValue: 0,
      expectedClosingDate: '',
      notes: '',
      status: 'NEW'
    });
  };

  const handleOpenAddLead = () => {
    resetLeadForm();
    setShowAddLeadModal(true);
  };

  const handleOpenEditLead = (lead: ILeadItem) => {
    setSelectedLead(lead);
    setLeadForm({
      leadName: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || 'Website',
      leadValue: lead.leadValue || 0,
      expectedClosingDate: lead.expectedClosingDate ? lead.expectedClosingDate.split('T')[0] : '',
      notes: lead.notes || '',
      status: lead.status || 'NEW'
    });
    setShowEditLeadModal(true);
  };

  const handleOpenConvert = (lead: ILeadItem) => {
    setSelectedLead(lead);
    setConvertForm({ customerType: 'BUSINESS' });
    setShowConvertModal(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      setActionLoading(true);
      setErrorMsg('');

      if (showEditLeadModal && selectedLead) {
        await crmService.updateLead(businessId, selectedLead._id, leadForm);
        setSuccessMsg('Lead updated successfully.');
        setShowEditLeadModal(false);
      } else {
        await crmService.createLead(businessId, leadForm);
        setSuccessMsg('New sales lead created successfully.');
        setShowAddLeadModal(false);
      }

      fetchLeads();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save lead.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStageChange = async (leadId: string, newStage: LeadStatusStage) => {
    if (!businessId) return;
    try {
      await crmService.updateLeadStatus(businessId, leadId, newStage);
      setSuccessMsg(`Lead stage updated to ${newStage}.`);
      fetchLeads();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to change stage.');
    }
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !selectedLead) return;
    try {
      setActionLoading(true);
      await crmService.convertLead(businessId, selectedLead._id, convertForm);
      setSuccessMsg(`Lead ${selectedLead.name} converted into customer.`);
      setShowConvertModal(false);
      fetchLeads();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Conversion failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLeadConfirm = async () => {
    if (!businessId || !selectedLead) return;
    try {
      setActionLoading(true);
      await crmService.deleteLead(businessId, selectedLead._id);
      setSuccessMsg(`Lead ${selectedLead.name} deleted.`);
      setShowDeleteLeadModal(false);
      fetchLeads();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to delete lead.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      setActionLoading(true);
      await crmService.createFollowUp(businessId, {
        title: followUpForm.title,
        type: followUpForm.type,
        scheduledDate: followUpForm.scheduledDate,
        nextFollowUpDate: followUpForm.nextFollowUpDate || undefined,
        notes: followUpForm.notes,
        leadId: followUpForm.leadId || undefined
      });
      setSuccessMsg('Follow-up scheduled successfully.');
      setShowAddFollowUpModal(false);
      setFollowUpForm({ title: '', type: 'CALL', scheduledDate: '', nextFollowUpDate: '', notes: '', leadId: '' });
      fetchFollowUps();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to schedule follow-up.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkFollowUpComplete = async (fu: IFollowUpItem) => {
    if (!businessId) return;
    try {
      await crmService.updateFollowUp(businessId, fu._id, {
        status: 'COMPLETED',
        outcomeNotes: 'Follow-up marked completed on ' + new Date().toLocaleString()
      });
      setSuccessMsg('Follow-up marked as completed.');
      fetchFollowUps();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to update follow-up: ' + err.message);
    }
  };

  // Pipeline metrics
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.leadValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600" />
            CRM & Sales Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track potential opportunities, manage pipeline stages, and automate follow-up reminders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View toggle */}
          {activeTab === 'pipeline' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                  viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" /> Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                  viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" /> Table
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setFollowUpForm({
                title: '',
                type: 'CALL',
                scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                nextFollowUpDate: '',
                notes: '',
                leadId: ''
              });
              setShowAddFollowUpModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            Schedule Follow-Up
          </button>

          <button
            onClick={handleOpenAddLead}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Sales Lead
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'pipeline'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Kanban className="w-4 h-4" />
          Sales Pipeline ({leads.length} Leads &bull; ${totalPipelineValue.toLocaleString()})
        </button>
        <button
          onClick={() => setActiveTab('followups')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'followups'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          Follow-Up Calendar & Reminders ({followUps.filter((f) => f.status === 'PENDING').length} Pending)
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filter bar for pipeline */}
      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search leads by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Lead Sources</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: PIPELINE VIEW (KANBAN & TABLE)
          ========================================================================= */}
      {activeTab === 'pipeline' && (
        <>
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-r-transparent mb-2"></div>
              <div>Loading sales pipeline...</div>
            </div>
          ) : viewMode === 'kanban' ? (
            <div className="overflow-x-auto pb-4">
              <div className="grid grid-cols-7 gap-4 min-w-[1400px]">
                {STAGES.map((stg) => {
                  const stageLeads = leads.filter((l) => l.status === stg.key);
                  const stageTotalVal = stageLeads.reduce((sum, l) => sum + (l.leadValue || 0), 0);

                  return (
                    <div
                      key={stg.key}
                      className={`rounded-2xl border-t-4 ${stg.color} bg-slate-50 border-x border-b border-slate-200 p-3.5 flex flex-col min-h-[550px] shadow-sm`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{stg.label}</h3>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            ${stageTotalVal.toLocaleString()}
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs">
                          {stageLeads.length}
                        </span>
                      </div>

                      {/* Cards Container */}
                      <div className="mt-3 space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
                        {stageLeads.length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-400">
                            No leads in this stage
                          </div>
                        ) : (
                          stageLeads.map((lead) => (
                            <div
                              key={lead._id}
                              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-2.5 text-xs"
                            >
                              <div className="flex items-start justify-between">
                                <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  {lead.leadId}
                                </span>
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {lead.source}
                                </span>
                              </div>

                              <div>
                                <h4 className="font-bold text-slate-900 text-sm leading-tight">
                                  {lead.name}
                                </h4>
                                {lead.company && (
                                  <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Building className="w-3 h-3 text-slate-400" />
                                    <span className="truncate">{lead.company}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                <div className="font-bold text-slate-900 flex items-center text-sm text-emerald-700">
                                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                  {(lead.leadValue || 0).toLocaleString()}
                                </div>
                                {lead.expectedClosingDate && (
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(lead.expectedClosingDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              {lead.notes && (
                                <p className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded line-clamp-2">
                                  {lead.notes}
                                </p>
                              )}

                              {/* Card Actions */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenEditLead(lead)}
                                    title="Edit Lead"
                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedLead(lead);
                                      setShowDeleteLeadModal(true);
                                    }}
                                    title="Delete Lead"
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {lead.status !== 'WON' ? (
                                  <button
                                    onClick={() => handleOpenConvert(lead)}
                                    title="Convert to Customer"
                                    className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded flex items-center gap-1 transition"
                                  >
                                    <UserCheck className="w-3 h-3" /> Convert
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                    Converted
                                  </span>
                                )}
                              </div>

                              {/* Stage Transition Selector */}
                              <div className="pt-1">
                                <select
                                  value={lead.status}
                                  onChange={(e) => handleStageChange(lead._id, e.target.value as any)}
                                  className="w-full text-[11px] py-1 px-2 bg-slate-50 border border-slate-200 rounded font-medium text-slate-700"
                                >
                                  {STAGES.map((s) => (
                                    <option key={s.key} value={s.key}>
                                      Move to: {s.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Table view of leads */
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                    <th className="px-5 py-3.5">Lead</th>
                    <th className="px-5 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">Source</th>
                    <th className="px-5 py-3.5">Stage</th>
                    <th className="px-5 py-3.5 text-right">Value</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leads.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{l.name}</div>
                        <div className="text-xs text-indigo-600 font-mono">{l.leadId}</div>
                        {l.company && <div className="text-xs text-slate-500">{l.company}</div>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-slate-700">{l.email}</div>
                        {l.phone && <div className="text-xs text-slate-500">{l.phone}</div>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700">{l.source}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={l.status}
                          onChange={(e) => handleStageChange(l._id, e.target.value as any)}
                          className="text-xs py-1 px-2 border border-slate-300 rounded font-semibold text-slate-700"
                        >
                          {STAGES.map((s) => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        ${(l.leadValue || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {l.status !== 'WON' && (
                            <button
                              onClick={() => handleOpenConvert(l)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Convert to Customer"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditLead(l)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLead(l);
                              setShowDeleteLeadModal(true);
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          TAB 2: FOLLOW-UP MANAGEMENT & CALENDAR
          ========================================================================= */}
      {activeTab === 'followups' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Pending Reminders</span>
                <div className="text-2xl font-bold text-indigo-600 mt-1">
                  {followUps.filter((f) => f.status === 'PENDING').length}
                </div>
              </div>
              <Clock className="w-8 h-8 text-indigo-200" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Completed Follow-ups</span>
                <div className="text-2xl font-bold text-emerald-600 mt-1">
                  {followUps.filter((f) => f.status === 'COMPLETED').length}
                </div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-200" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Scheduled</span>
                <div className="text-2xl font-bold text-slate-800 mt-1">{followUps.length}</div>
              </div>
              <Calendar className="w-8 h-8 text-slate-200" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                  <th className="px-5 py-3.5">Activity & Title</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Scheduled Date</th>
                  <th className="px-5 py-3.5">Next Follow-Up</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {followUps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      No follow-ups recorded. Use 'Schedule Follow-Up' above to set reminder notifications.
                    </td>
                  </tr>
                ) : (
                  followUps.map((fu) => (
                    <tr key={fu._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{fu.title}</div>
                        {fu.notes && <div className="text-xs text-slate-500 mt-0.5">{fu.notes}</div>}
                        {fu.outcomeNotes && (
                          <div className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1">
                            {fu.outcomeNotes}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-semibold">
                          {fu.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {new Date(fu.scheduledDate).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {fu.nextFollowUpDate ? new Date(fu.nextFollowUpDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {fu.status === 'COMPLETED' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            COMPLETED
                          </span>
                        ) : fu.status === 'CANCELLED' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                            CANCELLED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {fu.status === 'PENDING' && (
                          <button
                            onClick={() => handleMarkFollowUpComplete(fu)}
                            className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                          >
                            Mark Done
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT LEAD
          ========================================================================= */}
      {(showAddLeadModal || showEditLeadModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                {showEditLeadModal ? 'Edit Sales Opportunity' : 'Create Sales Lead'}
              </h2>
              <button
                onClick={() => {
                  setShowAddLeadModal(false);
                  setShowEditLeadModal(false);
                }}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lead Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={leadForm.leadName}
                    onChange={(e) => setLeadForm({ ...leadForm, leadName: e.target.value })}
                    placeholder="e.g. Acme Tech Solutions"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    placeholder="e.g. Acme Inc"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="contact@lead.com"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="+1 555-0188"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Source</label>
                  <select
                    value={leadForm.source}
                    onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lead Value ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={leadForm.leadValue}
                    onChange={(e) => setLeadForm({ ...leadForm, leadValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Close
                  </label>
                  <input
                    type="date"
                    value={leadForm.expectedClosingDate}
                    onChange={(e) => setLeadForm({ ...leadForm, expectedClosingDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pipeline Stage</label>
                <select
                  value={leadForm.status}
                  onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Scope</label>
                <textarea
                  rows={3}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Client requirements, pain points, budget..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLeadModal(false);
                    setShowEditLeadModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : showEditLeadModal ? 'Update Lead' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONVERT LEAD TO CUSTOMER
          ========================================================================= */}
      {showConvertModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-600 mb-3">
              <UserCheck className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Convert Lead to Customer</h3>
            </div>
            <p className="text-sm text-slate-600">
              Converting lead <strong className="text-slate-900">{selectedLead.name}</strong> will create a permanent
              Customer profile, mark this lead as <span className="font-bold text-emerald-700">WON</span>, and record an activity log.
            </p>

            <form onSubmit={handleConvertSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Type
                </label>
                <select
                  value={convertForm.customerType}
                  onChange={(e) => setConvertForm({ customerType: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="BUSINESS">Business</option>
                  <option value="ENTERPRISE">Enterprise</option>
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="INDIVIDUAL">Individual</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Converting...' : 'Confirm Conversion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DELETE LEAD CONFIRMATION
          ========================================================================= */}
      {showDeleteLeadModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Delete Sales Lead</h3>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete lead <strong className="text-slate-900">{selectedLead.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteLeadModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLeadConfirm}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Lead'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SCHEDULE FOLLOW-UP
          ========================================================================= */}
      {showAddFollowUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Schedule Follow-Up Reminder
              </h3>
              <button onClick={() => setShowAddFollowUpModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title / Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={followUpForm.title}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, title: e.target.value })}
                  placeholder="e.g. Product Demo / Price Review"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-Up Type</label>
                  <select
                    value={followUpForm.type}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CALL">Call</option>
                    <option value="MEETING">Meeting</option>
                    <option value="EMAIL">Email</option>
                    <option value="DEMO">Demo</option>
                    <option value="FOLLOW_UP">Follow-Up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Lead</label>
                  <select
                    value={followUpForm.leadId}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, leadId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">General / None</option>
                    {leads.map((l) => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scheduled Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={followUpForm.scheduledDate}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={followUpForm.notes}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                  placeholder="Key agenda points..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddFollowUpModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Scheduling...' : 'Set Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMLeadsPage;
