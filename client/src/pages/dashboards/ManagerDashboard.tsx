import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ClipboardCheck,
  Users,
  Clock,
  Boxes,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();

  const operationsQueue = [
    { id: 'REQ-104', title: 'Inventory Requisition - Server Hardware Tier-3', requester: 'Sophia Lin (Staff)', dept: 'Engineering Operations', status: 'Pending Approval', priority: 'High' },
    { id: 'REQ-103', title: 'Shift Reallocation & Coverage Request', requester: 'Marcus Thorne', dept: 'Support & Ops', status: 'Approved', priority: 'Medium' },
    { id: 'REQ-102', title: 'Quality Assurance Protocol Sign-Off', requester: 'David Miller', dept: 'Quality Control', status: 'Pending Review', priority: 'High' },
    { id: 'REQ-101', title: 'Vendor Procurement Clearance - Office Supplies', requester: 'Operations Team', dept: 'Logistics', status: 'Completed', priority: 'Low' }
  ];

  const permittedStaff = [
    { name: 'Sophia Lin', role: 'Staff Associate', module: 'Inventory & Tasks', status: 'On Shift' },
    { name: 'Liam Davies', role: 'Field Technician', module: 'Field Operations', status: 'On Shift' },
    { name: 'Elena Rostova', role: 'Support Specialist', module: 'Customer Support', status: 'Break' },
    { name: 'Carlos Mendez', role: 'Inventory Clerk', module: 'Warehouse Stock', status: 'Off Duty' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Operations Management Portal</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Department Manager
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Logged in as <span className="font-semibold text-white">{user?.name}</span> • Overseeing daily operational queues, task approvals & permitted team members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" iconLeft={FileCheck2}>
            Approve All Pending (2)
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">4 Items</span>
            <span className="text-xs text-amber-600 font-semibold">2 urgent</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Requires manager sign-off</div>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff on Duty</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">8 / 10</span>
            <span className="text-xs text-emerald-600 font-semibold">80% coverage</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Active assigned shift team</div>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Task SLA</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">98.4%</span>
            <span className="text-xs text-emerald-600 font-semibold">On Target</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Across assigned operational modules</div>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Turnover</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">Normal</span>
            <span className="text-xs text-emerald-600 font-semibold">Low backlog</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Warehouse stock healthy</div>
        </Card>
      </div>

      {/* Two Column Layout: Daily Operations Queue & Permitted Staff List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Operations Queue */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Daily Operations Queue & Approvals
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tasks and requisitions requiring manager sign-off
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {operationsQueue.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{item.id}</span>
                      <span className="font-semibold text-slate-800">{item.title}</span>
                      {item.priority === 'High' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                          High
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Submitted by: <span className="font-medium text-slate-700">{item.requester}</span> • {item.dept}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={item.status === 'Approved' || item.status === 'Completed' ? 'success' : 'warning'}>
                      {item.status}
                    </Badge>
                    {item.status.includes('Pending') && (
                      <button className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-[11px] transition-colors cursor-pointer">
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Permitted Employees on Shift */}
        <div>
          <Card className="p-5 border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Permitted Team Members
            </h3>
            <div className="space-y-3">
              {permittedStaff.map((staff, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{staff.name}</div>
                    <div className="text-[11px] text-slate-500">{staff.role} • {staff.module}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${staff.status === 'On Shift' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-700'}`}>
                    {staff.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
