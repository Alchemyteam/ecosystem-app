import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { SUCCESS_METRICS, METRICS_DATA } from '../constants';

const Metrics: React.FC = () => {
  return (
    <section id="impact" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="flex-1 w-full">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Defining Success</h2>
            <p className="text-lg text-slate-600 mb-10">
              Our platform is engineered to deliver tangible financial and operational improvements from Day 1.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {SUCCESS_METRICS.map((metric) => (
                <div key={metric.label} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="bg-white p-3 rounded-lg shadow-sm text-brand-600">
                    <metric.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                    <div className="text-sm font-medium text-slate-700">{metric.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{metric.subtext}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full bg-slate-900 rounded-2xl p-8 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full filter blur-[100px] opacity-20"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold mb-2">Impact Projection</h3>
              <p className="text-slate-400 text-sm mb-8">Projected reduction in Idle Stock & Dispute Resolution over 6 months</p>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={METRICS_DATA}>
                    <defs>
                      <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDisputes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="collections" 
                      name="On-time Collections (%)" 
                      stroke="#0ea5e9" 
                      fillOpacity={1} 
                      fill="url(#colorCollections)" 
                      strokeWidth={3}
                    />
                     <Area 
                      type="monotone" 
                      dataKey="idleStock" 
                      name="Idle Stock Index" 
                      stroke="#10b981" 
                      fillOpacity={0} 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-500 rounded-full"></div>
                  <span>Collections</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span>Stock Efficiency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Metrics;