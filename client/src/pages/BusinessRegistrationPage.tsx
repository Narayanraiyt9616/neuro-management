import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  FileText,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Layers,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { clientBusinessRegistrationSchema } from '../validators/businessSchemas';
import adminService from '../services/adminService';
import { IBusiness } from '../types';

export const BusinessRegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    businessEmail: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    category: 'Technology & SaaS',
    registrationNumber: '',
    gstin: '',
    website: '',
    description: '',
    ownerName: '',
    ownerEmail: '',
    planCode: 'STARTER' as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [registeredBusiness, setRegisteredBusiness] = useState<IBusiness | null>(null);

  const categories = [
    'Technology & SaaS',
    'Financial Services & FinTech',
    'Supply Chain & Logistics',
    'Healthcare & Life Sciences',
    'Manufacturing & Industrial',
    'Retail & E-Commerce',
    'Consulting & Professional Services',
    'Education & EdTech',
    'Other Enterprise'
  ];

  const plans = [
    { code: 'FREE', name: 'Free Tier', badge: 'Evaluator', desc: 'Core platform evaluation & small projects' },
    { code: 'STARTER', name: 'Starter', badge: 'Growing Business', desc: 'Up to 15 team members & multi-module tracking' },
    { code: 'PROFESSIONAL', name: 'Professional', badge: 'Most Popular', desc: 'Up to 50 members, workflow automation & analytics' },
    { code: 'ENTERPRISE', name: 'Enterprise', badge: 'Full Platform', desc: 'Unlimited teams, dedicated SLA & priority support' }
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate using Zod schema
    const validation = clientBusinessRegistrationSchema.safeParse(formData);
    if (!validation.success) {
      const issues = validation.error.issues;
      const mapped: Record<string, string> = {};
      issues.forEach((issue) => {
        const key = issue.path[0] ? String(issue.path[0]) : 'general';
        if (!mapped[key]) mapped[key] = issue.message;
      });
      setFieldErrors(mapped);
      setError(issues[0]?.message || 'Please fill in all required business information.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        logo: formData.logo.trim() || null,
        businessEmail: formData.businessEmail.trim(),
        phone: formData.phone.trim(),
        category: formData.category,
        registrationNumber: formData.registrationNumber.trim(),
        gstin: formData.gstin.trim() || undefined,
        website: formData.website.trim() || undefined,
        description: formData.description.trim(),
        ownerName: formData.ownerName.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        planCode: formData.planCode,
        address: {
          street: formData.street.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          postalCode: formData.postalCode.trim() || undefined,
          country: formData.country.trim() || 'US'
        }
      };

      const result = await adminService.registerBusiness(payload);
      setRegisteredBusiness(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Business registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (registeredBusiness) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <Card className="p-8 sm:p-10 border-slate-200 shadow-xl bg-white text-center">
            <div className="w-16 h-16 bg-amber-50 border-2 border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Clock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-4 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Status: PENDING SUPER ADMIN APPROVAL
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Registration Application Received!
            </h1>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              Your business application for <span className="font-semibold text-slate-900">{registeredBusiness.name}</span> has been securely submitted and logged in our system.
            </p>

            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-5 text-left space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Business Name</span>
                <span className="font-semibold text-slate-900">{registeredBusiness.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Official Email</span>
                <span className="font-semibold text-slate-900">{registeredBusiness.businessEmail || registeredBusiness.contactEmail}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Owner Contact</span>
                <span className="font-semibold text-slate-900">{registeredBusiness.ownerName} ({registeredBusiness.ownerEmail})</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-slate-900">{registeredBusiness.category || registeredBusiness.industry}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Subscription Tier</span>
                <span className="font-semibold text-blue-600 uppercase">{registeredBusiness.plan || 'STARTER'}</span>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 space-y-1">
                <p className="font-semibold text-blue-900">Next Steps & Activation Workflow:</p>
                <p>1. Our platform Super Administrator reviews all business credentials, GSTIN, and corporate filings.</p>
                <p>2. Once verified, an approval confirmation email will be dispatched to <span className="font-medium underline">{registeredBusiness.ownerEmail}</span>.</p>
                <p>3. Your dedicated tenant environment will automatically activate upon approval.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('/login')}
                iconRight={ArrowRight}
                className="w-full sm:w-auto"
              >
                Proceed to Login
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full sm:w-auto"
              >
                Return to Homepage
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Platform Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Already registered?</span>
            <Link to="/login" className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline">
              Sign In
            </Link>
          </div>
        </div>

        {/* Hero Title Card */}
        <div className="bg-slate-900 rounded-2xl p-8 text-white border border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Enterprise Multi-Tenant Onboarding
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Register Your Business on BizNexus
              </h1>
              <p className="text-sm text-slate-300 max-w-xl">
                Set up your multi-tenant corporate environment. All registrations undergo verification by the Super Administrator before platform activation.
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 text-right">
              <span className="text-xs font-medium text-slate-400">Governance Policy</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5" /> Strict Tenant Isolation
              </span>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold">Registration Alert: </span>
              {error}
            </div>
          </div>
        )}

        {/* Main Multi-Section Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Business Identity & Overview */}
          <Card className="p-6 sm:p-8 border-slate-200 shadow-sm bg-white">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">1. Business Profile & Identity</h2>
                <p className="text-xs text-slate-500">Official business name, classification and brand imagery</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Apex Global Logistics Inc."
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-none ${
                      fieldErrors.name
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
                {fieldErrors.name && <p className="text-[11px] text-rose-500 font-medium">{fieldErrors.name}</p>}
              </div>

              {/* Business Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Business Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Business Logo URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Business Logo URL <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Website URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Official Website <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.apexlogistics.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Description (Full span) */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Business Description & Operations <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a brief summary of your core services, operations, and organizational structure..."
                  className={`w-full p-3.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-none resize-none ${
                    fieldErrors.description
                      ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
                {fieldErrors.description && (
                  <p className="text-[11px] text-rose-500 font-medium">{fieldErrors.description}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Section 2: Legal & Statutory Information */}
          <Card className="p-6 sm:p-8 border-slate-200 shadow-sm bg-white">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">2. Statutory & Contact Details</h2>
                <p className="text-xs text-slate-500">Corporate registration IDs, GSTIN, and official contact lines</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Registration Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Corporate Registration Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="registrationNumber"
                    required
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g. U72200MH2024PTC123456"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-none ${
                      fieldErrors.registrationNumber
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
                {fieldErrors.registrationNumber && (
                  <p className="text-[11px] text-rose-500 font-medium">{fieldErrors.registrationNumber}</p>
                )}
              </div>

              {/* GSTIN / Tax ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  GSTIN / Tax Identification <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Business Official Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Business Official Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    name="businessEmail"
                    required
                    value={formData.businessEmail}
                    onChange={handleChange}
                    placeholder="contact@apexlogistics.com"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-none ${
                      fieldErrors.businessEmail
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
                {fieldErrors.businessEmail && (
                  <p className="text-[11px] text-rose-500 font-medium">{fieldErrors.businessEmail}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 234-5678"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-none ${
                      fieldErrors.phone
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
                {fieldErrors.phone && <p className="text-[11px] text-rose-500 font-medium">{fieldErrors.phone}</p>}
              </div>
            </div>

            {/* Address Sub-grid */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Headquarters & Registered Address
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="100 Enterprise Blvd, Suite 400"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Austin"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Texas"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="78701"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="United States"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Owner / Primary Contact Information */}
          <Card className="p-6 sm:p-8 border-slate-200 shadow-sm bg-white">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">3. Business Owner / Primary Executive</h2>
                <p className="text-xs text-slate-500">Authorized representative accountable for platform operations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Owner Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Owner Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="ownerName"
                    required
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="e.g. Eleanor Vance"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-none ${
                      fieldErrors.ownerName
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
                {fieldErrors.ownerName && (
                  <p className="text-[11px] text-rose-500 font-medium">{fieldErrors.ownerName}</p>
                )}
              </div>

              {/* Owner Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Owner Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    name="ownerEmail"
                    required
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    placeholder="eleanor.vance@apexlogistics.com"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-none ${
                      fieldErrors.ownerEmail
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
                {fieldErrors.ownerEmail && (
                  <p className="text-[11px] text-rose-500 font-medium">{fieldErrors.ownerEmail}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Section 4: Desired Subscription Plan */}
          <Card className="p-6 sm:p-8 border-slate-200 shadow-sm bg-white">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">4. Select Initial Subscription Tier</h2>
                <p className="text-xs text-slate-500">Tier is provisioned upon Super Admin approval (no immediate payment required during evaluation)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {plans.map((p) => {
                const isSelected = formData.planCode === p.code;
                return (
                  <div
                    key={p.code}
                    onClick={() => setFormData((prev) => ({ ...prev, planCode: p.code as any }))}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900">{p.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Final Submission Card */}
          <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800 shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Ready for Verification Review</h3>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                By submitting this form, you confirm that all provided details and statutory registrations are authentic. The Super Admin team will verify your application within 24 hours.
              </p>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              iconRight={ArrowRight}
              className="shrink-0 font-bold px-8 shadow-lg shadow-blue-500/25"
            >
              Submit Business Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessRegistrationPage;
