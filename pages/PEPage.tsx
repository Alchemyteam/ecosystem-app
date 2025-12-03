import React from 'react';
import Header from '../components/Header';
import { Shield, FileCheck, CheckCircle2, Clock, AlertCircle, Award, ClipboardList, Users } from 'lucide-react';

const PEPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">PE Portal</h1>
                <p className="text-slate-600">Professional Engineer certification and compliance management</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <FileCheck className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Certify Products</h3>
                  <p className="text-sm text-slate-600">Review and approve</p>
                </div>
              </div>
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition-colors">
                New Certification
              </button>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center">
                  <ClipboardList className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Pending Reviews</h3>
                  <p className="text-sm text-slate-600">Items awaiting approval</p>
                </div>
              </div>
              <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 rounded-lg transition-colors">
                View Queue
              </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Award className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Certification History</h3>
                  <p className="text-sm text-slate-600">View all certifications</p>
                </div>
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">
                View History
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="text-green-600" size={20} />
                <h3 className="text-sm font-medium text-slate-600">Certified</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">342</p>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-amber-600" size={20} />
                <h3 className="text-sm font-medium text-slate-600">Pending</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">28</p>
              <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="text-red-600" size={20} />
                <h3 className="text-sm font-medium text-slate-600">Rejected</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">12</p>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-blue-600" size={20} />
                <h3 className="text-sm font-medium text-slate-600">Active Clients</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">156</p>
              <p className="text-xs text-slate-500 mt-1">Registered companies</p>
            </div>
          </div>

          {/* Pending Certifications */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Pending Certifications</h2>
              <button className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {[
                { id: '#CERT-001', company: 'ABC Construction Co.', product: 'Steel Formwork System', submitted: '2 days ago', priority: 'High' },
                { id: '#CERT-002', company: 'XYZ Builders Ltd.', product: 'Aluminum Scaffolding', submitted: '3 days ago', priority: 'Medium' },
                { id: '#CERT-003', company: 'Metro Engineering', product: 'Concrete Formwork', submitted: '5 days ago', priority: 'High' },
              ].map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{cert.id}</p>
                        <p className="text-sm text-slate-600">{cert.company}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{cert.product}</p>
                        <p className="text-xs text-slate-500">Submitted {cert.submitted}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cert.priority === 'High' ? 'bg-red-100 text-red-700' :
                      cert.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {cert.priority}
                    </span>
                    <button className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Certifications */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Recent Certifications</h2>
              <button className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {[
                { id: '#CERT-098', company: 'Global Builders', product: 'Modular Formwork', status: 'Approved', date: '1 day ago' },
                { id: '#CERT-097', company: 'Prime Construction', product: 'Reusable Formwork', status: 'Approved', date: '2 days ago' },
                { id: '#CERT-096', company: 'Elite Engineering', product: 'Plastic Formwork', status: 'Rejected', date: '3 days ago' },
              ].map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{cert.id}</p>
                        <p className="text-sm text-slate-600">{cert.company}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{cert.product}</p>
                        <p className="text-xs text-slate-500">{cert.date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cert.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {cert.status}
                    </span>
                    <button className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PEPage;

