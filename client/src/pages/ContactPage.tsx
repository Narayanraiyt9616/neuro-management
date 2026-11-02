import React, { useState, ChangeEvent, FormEvent } from 'react';
import { contactService } from '../services/contactService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { HealthIndicatorBadge } from '../components/common/HealthIndicatorBadge';
import { IContactFormData, IInquiryTicket, IApiError } from '../types';
import {
  Mail,
  Building,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<IContactFormData>({
    name: '',
    email: '',
    businessName: '',
    teamSize: '1-10',
    subject: 'General Enterprise Inquiry',
    message: ''
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<IInquiryTicket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMessage(null);

    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Please provide your name';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email is required';
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = 'Please provide a message with at least 10 characters';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const response = await contactService.submitInquiry(formData);
      setSuccessResult(response.data);
      setFormData({
        name: '',
        email: '',
        businessName: '',
        teamSize: '1-10',
        subject: 'General Enterprise Inquiry',
        message: ''
      });
    } catch (err: unknown) {
      const apiErr = err as IApiError;
      setErrorMessage(
        apiErr.message || 'Unable to submit inquiry at this moment. Please check backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge color="blue" size="sm" className="mb-4">
            Direct Communication
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
            Connect With Our Solution Architects
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Have questions about multi-entity licensing, compliance requirements, or custom integrations? We respond directly within one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Contact Details & SLA Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>Enterprise Headquarters</span>
              </h2>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Technical Sales & Licensing:</strong>
                    <span>enterprise@biznexus.io</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Direct Concierge Line:</strong>
                    <span>+1 (800) 555-BIZNEXUS</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Response Time SLA:</strong>
                    <span>Within 4 business hours for Growth & Enterprise inquiries</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Live Node Status</h3>
              <p className="text-xs text-slate-500 mb-4">
                Inquiries are routed directly to our Express.js backend API gateway.
              </p>
              <HealthIndicatorBadge showDetails />
            </Card>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2">
            <Card className="p-8 sm:p-10">
              {successResult ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Inquiry Received Successfully</h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-slate-900">{successResult.sender?.name}</strong>. Your ticket has been logged with reference ID:
                  </p>
                  <div className="inline-block px-4 py-2 bg-slate-100 rounded-lg font-mono text-sm font-bold text-blue-700 border border-slate-200">
                    {successResult.referenceId}
                  </div>
                  <div className="pt-6">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setSuccessResult(null)}
                    >
                      Send Another Inquiry
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Send Inquiry Message</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Our team connects via secure API submission to review your organization requirements.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Alex Vance"
                        className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:border-blue-600 text-slate-900 ${
                          validationErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                        }`}
                      />
                      {validationErrors.name && (
                        <p className="text-[11px] text-rose-600 mt-1">{validationErrors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Work Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="alex@nexuscorp.io"
                        className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:border-blue-600 text-slate-900 ${
                          validationErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                        }`}
                      />
                      {validationErrors.email && (
                        <p className="text-[11px] text-rose-600 mt-1">{validationErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Business Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Business / Company Entity
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Nexus Tech Labs Ltd"
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 text-slate-900"
                      />
                    </div>

                    {/* Team Size */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Team Size
                      </label>
                      <select
                        name="teamSize"
                        value={formData.teamSize}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 text-slate-900 cursor-pointer"
                      >
                        <option value="1-5">1 - 5 Team Members</option>
                        <option value="6-20">6 - 20 Team Members</option>
                        <option value="21-100">21 - 100 Team Members</option>
                        <option value="100+">100+ Enterprise Scale</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Inquiry Topic
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 text-slate-900 cursor-pointer"
                    >
                      <option value="General Enterprise Inquiry">General Enterprise Inquiry</option>
                      <option value="Pilot Cohort Application">Pilot Cohort Application</option>
                      <option value="Multi-Tenant Architectural Consulting">Multi-Tenant Architectural Consulting</option>
                      <option value="Custom API & Webhook Integrations">Custom API & Webhook Integrations</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Message & Requirements <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please outline the number of business entities you manage, key workflows, and any specific requirements..."
                      className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:border-blue-600 text-slate-900 ${
                        validationErrors.message ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                    />
                    {validationErrors.message && (
                      <p className="text-[11px] text-rose-600 mt-1">{validationErrors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    iconRight={Send}
                    className="w-full sm:w-auto"
                  >
                    Submit Secure Inquiry
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

