import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-100 via-white to-white opacity-70"></div>
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100 text-xs font-semibold tracking-wide uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              Ecosystem Platform
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Strategic Sector <br className="hidden lg:block" />
              <span className="text-brand-600">Penetration & Growth</span>
            </h1>
            
            <p className="text-base text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              A market-facing, neutral platform connecting Buyers, Sellers, and PEs. 
              Optimizing rentals, ensuring compliance, and driving liquidity in the infrastructure logistics sector.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a 
                href="#join"
                className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-base transition-all shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2"
              >
                Join the Ecosystem <ArrowRight className="w-5 h-5" />
              </a>
              <a 
                href="#modules"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold text-base transition-colors flex items-center justify-center"
              >
                Explore Modules
              </a>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Zero Disputes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Compliance Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Secure Azure Host</span>
              </div>
            </div>
          </div>

          {/* Visual Abstract Illustration */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
             <div className="relative w-full aspect-square lg:aspect-[4/3] bg-gradient-to-br from-slate-100 to-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col p-6">
                {/* Mock UI Header */}
                <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                   <div className="w-3 h-3 rounded-full bg-green-400"></div>
                   <div className="ml-auto px-3 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-500">Aura Dashboard</div>
                </div>
                
                {/* Mock Grid */}
                <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="bg-brand-50/50 rounded-xl p-4 border border-brand-100 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center mb-2">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-800">98%</div>
                            <div className="text-xs text-slate-500">Collection Rate</div>
                        </div>
                    </div>
                    <div className="bg-green-50/50 rounded-xl p-4 border border-green-100 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-2">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-800">-50%</div>
                            <div className="text-xs text-slate-500">Idle Stock</div>
                        </div>
                    </div>
                    <div className="col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-semibold text-slate-700">Real-time Inventory</div>
                            <div className="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded">Live Updates</div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500 w-3/4"></div>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-1/2"></div>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>

                 {/* Decorative floating elements */}
                 <div className="absolute -right-4 top-20 bg-white p-3 rounded-lg shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce duration-[3000ms]">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-medium text-slate-600">PE Certified</span>
                 </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;