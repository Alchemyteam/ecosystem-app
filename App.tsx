import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Roadmap from './components/Roadmap';
import Metrics from './components/Metrics';
import TechStack from './components/TechStack';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <main>
        <Hero />
        <Features />
        <Roadmap />
        <Metrics />
        <TechStack />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default App;