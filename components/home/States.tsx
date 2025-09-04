"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Database, Globe, LucideIcon } from "lucide-react";

interface StatItemProps {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

function StatItem({ icon: Icon, value, suffix, label, color }: StatItemProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
      <CardContent className="p-8 text-center">
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="text-4xl font-bold text-gray-800 mb-2">
          {displayValue.toLocaleString()}
          {suffix}
        </div>
        <div className="text-gray-600 font-medium">{label}</div>
      </CardContent>
    </Card>
  );
}

export default function Stats() {
  const stats = [
    {
      icon: Database,
      value: 50,
      suffix: "B+",
      label: "Data Points Collected",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      value: 10000,
      suffix: "+",
      label: "Active Tenants",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: TrendingUp,
      value: 99.9,
      suffix: "%",
      label: "Uptime Guarantee",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Globe,
      value: 150,
      suffix: "+",
      label: "Countries Served",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section
      id="stats"
      className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Trusted Globally
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform serves millions of users worldwide with
            industry-leading performance, reliability, and scale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="animate-in fade-in slide-in-from-bottom duration-1000"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <StatItem {...stat} />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Enterprise-Grade Performance
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Built to handle massive scale with sub-millisecond response times,
              our platform processes billions of data points daily while
              maintaining the highest standards of security and compliance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
