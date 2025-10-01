"use client"
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { supabase } from "@/lib/supabase";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// TypeScript interface for tenant data
interface Tenant {
  id: string;
  name: string;
  access_code: string;
  server_id: string;
  product_id: string;
  is_active: boolean;
  created_at: string;
  sub_domain: string | null;
  settings_id: string | null;
  schema: string | null;
  status: string;
  updated_at: string;
  time_zone: string;
  business_reg_number: string | null;
  schema_created: boolean;
}

interface TenantMetrics {
  daysActive: number;
  isRecent: boolean;
  hasCustomDomain: boolean;
  schemaReady: boolean;
  statusCategory: string;
}

export default function TenantChartsPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
  const [similarTenants, setSimilarTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true);

        // Fetch specific tenant data
        const { data: tenantData, error: tenantError } = await supabase
          .schema("shared")
          .from("tenants")
          .select("*")
          .eq("id", tenantId)
          .single();

        if (tenantError) {
          throw tenantError;
        }

        // Fetch similar tenants (same timezone or status)
        const { data: similarData, error: similarError } = await supabase
          .schema("shared")
          .from("tenants")
          .select("*")
          .or(`time_zone.eq.${tenantData.time_zone},status.eq.${tenantData.status}`)
          .neq("id", tenantId)
          .limit(10);

        if (similarError) {
          console.warn("Could not fetch similar tenants:", similarError);
        }

        setTenant(tenantData);
        setSimilarTenants(similarData || []);
        calculateTenantMetrics(tenantData);
      } catch (err) {
        setError("Failed to load tenant data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchTenantData();
    }
  }, [tenantId]);

  const calculateTenantMetrics = (tenantData: Tenant) => {
    const now = new Date();
    const createdAt = new Date(tenantData.created_at);
    const daysActive = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const tenantMetrics: TenantMetrics = {
      daysActive,
      isRecent: createdAt > thirtyDaysAgo,
      hasCustomDomain: !!tenantData.sub_domain,
      schemaReady: tenantData.schema_created,
      statusCategory: tenantData.status || (tenantData.is_active ? 'active' : 'inactive'),
    };

    setMetrics(tenantMetrics);
  };

  // Generate tenant activity simulation over time (based on creation date)
  const getTenantActivityData = () => {
    if (!tenant || !metrics) return null;

    const createdAt = new Date(tenant.created_at);
    const daysSinceCreation = metrics.daysActive;
    
    // Create weekly data points since creation
    const weeks = Math.min(Math.ceil(daysSinceCreation / 7), 12); // Max 12 weeks
    const labels = [];
    const activityData = [];

    for (let i = 0; i < weeks; i++) {
      labels.push(`Week ${i + 1}`);
      
      // Simulate activity based on tenant characteristics
      let baseActivity = tenant.is_active ? 75 : 25;
      if (tenant.schema_created) baseActivity += 20;
      if (tenant.sub_domain) baseActivity += 15;
      
      // Add some realistic variation
      const variation = Math.random() * 30 - 15;
      activityData.push(Math.max(0, Math.min(100, baseActivity + variation)));
    }

    return {
      labels,
      datasets: [
        {
          label: "Activity Score",
          data: activityData,
          borderColor: tenant.is_active ? "rgb(75, 192, 192)" : "rgb(255, 99, 132)",
          backgroundColor: tenant.is_active ? "rgba(75, 192, 192, 0.2)" : "rgba(255, 99, 132, 0.2)",
          tension: 0.1,
        },
      ],
    };
  };

  // Generate tenant configuration status
  const getConfigurationStatusData = () => {
    if (!tenant) return null;

    const configItems = [
      { name: 'Basic Info', completed: true },
      { name: 'Domain Setup', completed: !!tenant.sub_domain },
      { name: 'Schema Created', completed: tenant.schema_created },
      { name: 'Business Reg', completed: !!tenant.business_reg_number },
    ];

    const completed = configItems.filter(item => item.completed).length;
    const pending = configItems.length - completed;

    return {
      labels: ['Completed', 'Pending'],
      datasets: [
        {
          data: [completed, pending],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 159, 64, 0.8)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Generate comparison with similar tenants
  const getSimilarTenantsData = () => {
    if (!similarTenants.length || !tenant) return null;

    const allTenants = [tenant, ...similarTenants.slice(0, 4)]; // Include current + 4 similar
    const labels = allTenants.map(t => t.name.substring(0, 15) + (t.name.length > 15 ? '...' : ''));
    
    const daysActiveData = allTenants.map(t => {
      const days = Math.floor((new Date().getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return days;
    });

    return {
      labels,
      datasets: [
        {
          label: "Days Active",
          data: daysActiveData,
          backgroundColor: allTenants.map((t, i) => 
            i === 0 ? "rgba(54, 162, 235, 0.8)" : "rgba(153, 102, 255, 0.5)"
          ),
          borderColor: allTenants.map((t, i) => 
            i === 0 ? "rgba(54, 162, 235, 1)" : "rgba(153, 102, 255, 1)"
          ),
          borderWidth: allTenants.map((t, i) => i === 0 ? 3 : 1),
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading tenant data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!tenant || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Tenant not found</div>
      </div>
    );
  }

  const activityData = getTenantActivityData();
  const configStatusData = getConfigurationStatusData();
  const comparisonData = getSimilarTenantsData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {tenant.name}
              </h1>
              <p className="text-gray-600 mt-2">
                Individual tenant analytics and insights
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                tenant.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  tenant.is_active ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {metrics.statusCategory.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div>
                <h2 className="text-xl font-semibold">{tenant.name}</h2>
                <p className="text-gray-600 mt-1">Access Code: {tenant.access_code}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Created {metrics.daysActive} days ago • {tenant.time_zone}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Domain</p>
              <p className="font-medium">{tenant.sub_domain || "Not configured"}</p>
              <p className="text-sm text-gray-500 mt-2">Business Reg</p>
              <p className="font-medium">{tenant.business_reg_number || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Days Active</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.daysActive}</p>
            <p className="text-sm text-gray-500 mt-1">
              {metrics.isRecent ? 'Recent signup' : 'Established tenant'}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
            <p className={`text-3xl font-bold mt-2 ${
              metrics.schemaReady ? 'text-green-600' : 'text-orange-600'
            }`}>
              {metrics.schemaReady ? 'Ready' : 'Pending'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Schema status</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Domain Setup</h3>
            <p className={`text-3xl font-bold mt-2 ${
              metrics.hasCustomDomain ? 'text-green-600' : 'text-gray-400'
            }`}>
              {metrics.hasCustomDomain ? 'Yes' : 'No'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Custom domain configured</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Similar Tenants</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{similarTenants.length}</p>
            <p className="text-sm text-gray-500 mt-1">Same timezone/status</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Timeline */}
          {activityData && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>
              <Line
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: "Weekly Activity Since Creation"
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%';
                        }
                      }
                    }
                  }
                }}
                data={activityData}
              />
            </div>
          )}

          {/* Configuration Status */}
          {configStatusData && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Setup Completion</h2>
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom" as const,
                      },
                    },
                  }}
                  data={configStatusData}
                />
              </div>
            </div>
          )}
        </div>

        {/* Comparison with Similar Tenants */}
        {comparisonData && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Comparison with Similar Tenants</h2>
            <Bar
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: "Days Active Comparison (Current tenant highlighted)"
                  }
                }
              }}
              data={comparisonData}
            />
          </div>
        )}

        {/* Detailed Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tenant ID</span>
                <span className="font-mono text-sm text-gray-800">{tenant.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Server ID</span>
                <span className="font-mono text-sm text-gray-800">{tenant.server_id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Product ID</span>
                <span className="font-mono text-sm text-gray-800">{tenant.product_id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Schema Name</span>
                <span className="font-medium text-gray-800">{tenant.schema || 'Not assigned'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium text-gray-800">
                  {new Date(tenant.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium text-gray-800">
                  {new Date(tenant.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age Category</span>
                <span className="font-medium text-gray-800">
                  {metrics.daysActive < 7 ? 'New' : 
                   metrics.daysActive < 30 ? 'Recent' : 
                   metrics.daysActive < 90 ? 'Established' : 'Veteran'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}