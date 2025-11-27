import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    if (email) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setEmail('');
    }
  };

  return (
    <section id="join" className="py-24 bg-brand-900 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Ready to Transform Your Formwork Logistics?
        </h2>
        <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
          Join the first ecosystem platform anchored in Singapore setting global standards. 
          Secure your spot for Phase 1 MVP access today.
        </p>

        {submitted ? (
          <div className="bg-green-500/20 text-green-200 p-4 rounded-xl border border-green-500/30 inline-block">
            <p className="font-semibold">Thanks! We'll be in touch shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email"
              className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-white text-brand-900 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              Request Access <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}
        
        <p className="mt-6 text-sm text-blue-300">
          Limited spots available for early adopters. Priority given to regional infrastructure players.
        </p>
      </div>
    </section>
  );
};

export default CTASection;