import { Button } from '@/components/ui/button';
import { ArrowRight, Database, Users, BarChart3 } from 'lucide-react';

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Database className="absolute top-1/4 left-1/4 w-8 h-8 text-blue-400/40 animate-bounce delay-300" />
        <Users className="absolute top-1/3 right-1/4 w-6 h-6 text-purple-400/40 animate-bounce delay-700" />
        <BarChart3 className="absolute bottom-1/3 left-1/3 w-7 h-7 text-indigo-400/40 animate-bounce delay-1000" />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-in slide-in-from-left duration-1000 delay-200">
                Multi-Tenant
              </span>
              <span className="block bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-in slide-in-from-right duration-1000 delay-400">
                AUDC Platform
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-in fade-in duration-1000 delay-600">
              Advanced Automated User Data Collection system with powerful multi-tenant architecture, 
              real-time analytics, and intelligent insights for modern businesses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in duration-1000 delay-800">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              onClick={() => scrollToSection('features')}
            >
              Explore Features
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 text-lg font-semibold rounded-full hover:bg-blue-50 transition-all duration-300"
              onClick={() => scrollToSection('cta')}
            >
              Request Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 animate-in fade-in duration-1000 delay-1000">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Data Collection</h3>
              <p className="text-gray-600">Enterprise-grade security with automated data collection and processing</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Multi-Tenant Architecture</h3>
              <p className="text-gray-600">Scalable infrastructure supporting multiple organizations seamlessly</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">Powerful insights and analytics with real-time data visualization</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}