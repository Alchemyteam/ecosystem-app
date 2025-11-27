import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-white">
              <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center text-xs font-bold">F</div>
              <span className="font-bold text-xl">[X]</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed mb-6">
              The first ecosystem platform for the formwork sector. 
              Connecting buyers, sellers, and PEs to drive efficiency, compliance, and liquidity.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#modules" className="hover:text-white transition-colors">Core Modules</a></li>
              <li><a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a></li>
              <li><a href="#impact" className="hover:text-white transition-colors">Success Metrics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Singapore HQ</li>
              <li><a href="mailto:partners@formx.com" className="hover:text-white transition-colors">partners@formx.com</a></li>
              <li className="pt-2">
                 <span className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">Regional Hub Initiative</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} [X] Ecosystem. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;