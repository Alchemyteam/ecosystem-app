import React from 'react';
import { Server, Lock, Brain, Workflow } from 'lucide-react';

const TechStack: React.FC = () => {
  return (
    <section id="tech" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Enterprise-Grade Architecture</h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Built on robust Microsoft Azure infrastructure to ensure security, scalability, and AI-driven intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">AI / ML Layer</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Azure OpenAI Service</li>
              <li>• Power Platform AI Builder</li>
              <li>• Document Intelligence</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Workflow className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">DevOps & Automation</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• GitHub Enterprise</li>
              <li>• Power Automate</li>
              <li>• Azure DevOps</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Data & Platform</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Microsoft Dataverse</li>
              <li>• Azure API Management</li>
              <li>• Azure App Service</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Security</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Azure Entra ID</li>
              <li>• Azure Key Vault</li>
              <li>• Microsoft Defender</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;