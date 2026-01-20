import React from 'react';
import { FEATURES } from '../constants';

const Features: React.FC = () => {
  return (
    <section id="modules" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-3">Core Architecture</h2>
          <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl mb-6">
            An Integrated Ecosystem Platform
          </h3>
          <p className="text-base text-slate-600">
            Aura delivers a comprehensive suite of modules designed to digitize the formwork value chain, from compliance to demand generation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {FEATURES.map((feature) => (
            <div 
              key={feature.title} 
              className="group p-8 rounded-2xl border border-slate-100 bg-white hover:border-brand-100 hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color} bg-opacity-50`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                {feature.title}
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;