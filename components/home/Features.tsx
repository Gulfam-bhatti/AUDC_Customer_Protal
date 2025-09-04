import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Zap, 
  Globe, 
  BarChart3, 
  Users, 
  Database,
  Lock,
  Cpu,
  Cloud
} from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and security protocols to protect sensitive user data across all tenants.",
      badge: "Security",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Multi-Tenant Isolation",
      description: "Complete data isolation between tenants with customizable access controls and permissions.",
      badge: "Architecture",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Lightning-fast data collection and processing with sub-second response times.",
      badge: "Performance",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive analytics dashboard with customizable reports and data visualization.",
      badge: "Analytics",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Global Scalability",
      description: "Distributed infrastructure that scales automatically based on demand across regions.",
      badge: "Scalability",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Database,
      title: "Smart Data Management",
      description: "Intelligent data lifecycle management with automated backup and recovery systems.",
      badge: "Data Management",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Lock,
      title: "Compliance Ready",
      description: "Built-in compliance for GDPR, CCPA, HIPAA, and other regulatory requirements.",
      badge: "Compliance",
      color: "from-gray-600 to-gray-800"
    },
    {
      icon: Cpu,
      title: "AI-Powered Insights",
      description: "Machine learning algorithms provide predictive analytics and intelligent recommendations.",
      badge: "AI/ML",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: Cloud,
      title: "Cloud Native",
      description: "Built for the cloud with containerized architecture and microservices design.",
      badge: "Infrastructure",
      color: "from-sky-500 to-blue-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the comprehensive suite of features that make our AUDC platform 
            the perfect choice for enterprise-level data collection and analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-full">
            <span className="text-sm font-medium text-gray-700">
              ✨ And many more features to explore
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}