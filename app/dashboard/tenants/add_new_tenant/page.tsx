"use client";
import React, { useState, useEffect } from "react";
import {
  Input,
  Textarea,
  Chip,
  Button,
  Select,
  SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { TenantFormData } from "@/types/customer-portal";
import { supabase } from "@/lib/supabase";

interface Server {
  id: string;
  name: string;
  description: string | null;
  provider: string;
  status: string;
  domain: string;
  region: string | null;
  no_of_cpu_cores: number | null;
  ram: number;
  storage_capacity: number;
}

interface Product {
  product_id: string;
  product_name: string;
  plan_name: string;
  max_users: number;
  monthly_price: number;
  annual_price: number;
  currency: string;
  is_active: boolean;
}

export default function AddTenantPage() {
  const [data, setData] = useState<Partial<TenantFormData>>({});
  const [errors, setErrors] = useState<
    Partial<Record<keyof TenantFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingServers, setLoadingServers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const availableFeatures = [
    "Home",
    "Members",
    "Events",
    "Committees",
    "Profile",
    "Notifications",
    "App Settings",
    "Support",
    "Families",
  ];

  // Fetch servers and products on component mount
  useEffect(() => {
    fetchServers();
    fetchProducts();
  }, []);

  const fetchServers = async () => {
    try {
      const { data: serversData, error } = await supabase
        .schema("multi_tenant_admin")
        .from("servers")
        .select(
          "id, name, description, provider, status, domain, region, no_of_cpu_cores, ram, storage_capacity"
        )
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setServers(serversData || []);
    } catch (error) {
      console.error("Error fetching servers:", error);
      setSubmitError("Failed to load servers");
    } finally {
      setLoadingServers(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data: productsData, error } = await supabase
        .schema("shared")
        .from("products")
        .select(
          "product_id, product_name, plan_name, max_users, monthly_price, annual_price, currency, is_active"
        )
        .eq("is_active", true)
        .order("plan_name");

      if (error) throw error;
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setSubmitError("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const onChange = (key: keyof TenantFormData, value: string | string[]) => {
    setData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = data.enabled_features || [];
    if (currentFeatures.includes(feature)) {
      onChange(
        "enabled_features",
        currentFeatures.filter((f) => f !== feature)
      );
    } else {
      onChange("enabled_features", [...currentFeatures, feature]);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof TenantFormData, string>> = {};

    if (!data.entity_full_name?.trim()) {
      newErrors.entity_full_name = "Full name is required";
    }
    if (!data.entity_short_name?.trim()) {
      newErrors.entity_short_name = "Short name is required";
    }
    if (!data.abn?.trim()) {
      newErrors.abn = "ABN is required";
    }
    if (!data.domain_url?.trim()) {
      newErrors.domain_url = "Domain URL is required";
    }
    if (!data.entity_email?.trim()) {
      newErrors.entity_email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(data.entity_email)) {
      newErrors.entity_email = "Invalid email format";
    }
    if (!data.entity_purpose?.trim()) {
      newErrors.entity_purpose = "Purpose is required";
    }
    if (!data.entity_mission?.trim()) {
      newErrors.entity_mission = "Mission is required";
    }
    if (!data.entity_description?.trim()) {
      newErrors.entity_description = "Description is required";
    }
    if (!selectedServerId) {
      setSubmitError("Please select a server");
      return false;
    }
    if (!selectedProductId) {
      setSubmitError("Please select a product plan");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateAccessCode = () => {
    return (
      Math.random().toString(36).substring(2, 10) +
      Math.random().toString(36).substring(2, 10)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const accessCode = generateAccessCode();

      // Insert only the columns that exist in the tenants table
      const tenantData = {
        name: data.entity_full_name,
        access_code: accessCode,
        server_id: selectedServerId,
        product_id: selectedProductId,
        domain: data.domain_url,
        business_reg_number: data.abn,
        time_zone: data.time_zone || "UTC",
        // settings_id: null, // You can set this if you have a separate settings table
        // schema: null, // You can set this if you want to specify a schema
        // status: 'active', // This defaults to 'active' in the table
        // logo: null, // You can add logo upload functionality later
      };

      // Insert tenant into Supabase
      const { data: insertedData, error } = await supabase
        .schema("shared")
        .from("tenants")
        .insert([tenantData])
        .select();

      if (error) {
        throw error;
      }

      setSubmitSuccess(true);
      setData({}); // Reset form
      setSelectedServerId("");
      setSelectedProductId("");
    } catch (error: any) {
      console.error("Error creating tenant:", error);
      setSubmitError(error.message || "Failed to create tenant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-4xl mx-auto">
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600">
            <Icon
              icon="heroicons:building-office"
              className="h-6 w-6 text-white"
            />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Add New Tenant
          </h2>
        </div>
        <p className="text-default-500 text-lg max-w-md mx-auto">
          Create a new tenant organization with the settings below.
        </p>
      </div>

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <Icon icon="heroicons:check-circle" className="h-5 w-5 mr-2" />
            <span>Tenant created successfully!</span>
          </div>
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <Icon icon="heroicons:x-circle" className="h-5 w-5 mr-2" />
            <span>{submitError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Server and Product Selection Section */}
        <div className="mb-8 space-y-6">
          <h3 className="text-xl font-bold text-default-800 flex items-center gap-2">
            <Icon
              icon="heroicons:server"
              className="h-6 w-6 text-default-600"
            />
            Server & Product Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-default-700 flex items-center gap-2"
                htmlFor="server-select"
              >
                <Icon className="h-4 w-4" icon="heroicons:server" />
                Select Server
              </label>
              <Select
                id="server-select"
                placeholder="Choose a server"
                isLoading={loadingServers}
                isRequired
                radius="lg"
                size="lg"
                variant="bordered"
                selectedKeys={selectedServerId ? [selectedServerId] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setSelectedServerId(selectedKey || "");
                  setSubmitError(null);
                }}
              >
                {servers.map((server) => (
                  <SelectItem
                    key={server.id}
                    textValue={server.name}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{server.name}</span>
                      <span className="text-xs text-default-500">
                        {server.provider} • {server.region} • {server.ram}MB RAM
                        • {server.storage_capacity}GB
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-default-700 flex items-center gap-2"
                htmlFor="product-select"
              >
                <Icon className="h-4 w-4" icon="heroicons:credit-card" />
                Select Product Plan
              </label>
              <Select
                id="product-select"
                placeholder="Choose a product plan"
                isLoading={loadingProducts}
                isRequired
                radius="lg"
                size="lg"
                variant="bordered"
                selectedKeys={selectedProductId ? [selectedProductId] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setSelectedProductId(selectedKey || "");
                  setSubmitError(null);
                }}
              >
                {products.map((product) => (
                  <SelectItem
                    key={product.product_id}
                    textValue={product.plan_name}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{product.plan_name}</span>
                      <span className="text-xs text-default-500">
                        {product.max_users} users • {product.currency}{" "}
                        {product.monthly_price}/month
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <hr className="my-4 border-t border-default-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information Section */}
          <div className="space-y-2">
            <label
              htmlFor="entity_full_name"
              className="text-sm font-medium text-default-700 flex items-center gap-2"
            >
              <Icon icon="heroicons:identification" className="h-4 w-4" />
              Full Name
            </label>
            <Input
              id="entity_full_name"
              isRequired
              errorMessage={errors.entity_full_name}
              isInvalid={!!errors.entity_full_name}
              placeholder="Enter your full organization name"
              radius="lg"
              size="lg"
              type="text"
              value={data.entity_full_name || ""}
              variant="bordered"
              onChange={(e) => onChange("entity_full_name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="entity_short_name"
              className="text-sm font-medium text-default-700 flex items-center gap-2"
            >
              <Icon icon="heroicons:hashtag" className="h-4 w-4" />
              Short Name
            </label>
            <Input
              id="entity_short_name"
              isRequired
              errorMessage={errors.entity_short_name}
              isInvalid={!!errors.entity_short_name}
              placeholder="Enter short name or acronym"
              radius="lg"
              size="lg"
              type="text"
              value={data.entity_short_name || ""}
              variant="bordered"
              onChange={(e) => onChange("entity_short_name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="abn-input"
              className="text-sm font-medium text-default-700 flex items-center gap-2"
            >
              <Icon icon="heroicons:key" className="h-4 w-4" />
              ABN
            </label>
            <Input
              id="abn-input"
              isRequired
              errorMessage={errors.abn}
              isInvalid={!!errors.abn}
              placeholder="Enter the ABN"
              radius="lg"
              size="lg"
              type="text"
              value={data.abn || ""}
              variant="bordered"
              onChange={(e) => onChange("abn", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-default-700 flex items-center gap-2"
              htmlFor="domain-url-input"
            >
              <Icon className="h-4 w-4" icon="heroicons:link" />
              Domain URL
            </label>
            <Input
              isRequired
              errorMessage={errors.domain_url}
              id="domain-url-input"
              isInvalid={!!errors.domain_url}
              placeholder="Enter the domain URL"
              radius="lg"
              size="lg"
              type="url"
              value={data.domain_url || ""}
              variant="bordered"
              onChange={(e) => onChange("domain_url", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-default-700 flex items-center gap-2"
              htmlFor="email-input"
            >
              <Icon className="h-4 w-4" icon="heroicons:envelope" />
              Email Address
            </label>
            <Input
              isRequired
              errorMessage={errors.entity_email}
              id="email-input"
              isInvalid={!!errors.entity_email}
              placeholder="contact@yourorganization.com"
              radius="lg"
              size="lg"
              type="email"
              value={data.entity_email || ""}
              variant="bordered"
              onChange={(e) => onChange("entity_email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-default-700 flex items-center gap-2"
              htmlFor="website-input"
            >
              <Icon className="h-4 w-4" icon="heroicons:globe-alt" />
              Website URL
            </label>
            <Input
              errorMessage={errors.entity_website_url}
              id="website-input"
              isInvalid={!!errors.entity_website_url}
              placeholder="www.yourorganization.com"
              radius="lg"
              size="lg"
              type="url"
              value={data.entity_website_url || ""}
              variant="bordered"
              onChange={(e) => onChange("entity_website_url", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-default-700 flex items-center gap-2"
              htmlFor="purpose-input"
            >
              <Icon className="h-4 w-4" icon="heroicons:target" />
              Purpose
            </label>
            <Input
              isRequired
              errorMessage={errors.entity_purpose}
              id="purpose-input"
              isInvalid={!!errors.entity_purpose}
              placeholder="What is your organization's main purpose?"
              radius="lg"
              size="lg"
              type="text"
              value={data.entity_purpose || ""}
              variant="bordered"
              onChange={(e) => onChange("entity_purpose", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-default-700 flex items-center gap-2"
              htmlFor="mission-input"
            >
              <Icon className="h-4 w-4" icon="heroicons:rocket-launch" />
              Mission
            </label>
            <Input
              isRequired
              errorMessage={errors.entity_mission}
              id="mission-input"
              isInvalid={!!errors.entity_mission}
              placeholder="Describe your organization's mission"
              radius="lg"
              size="lg"
              type="text"
              value={data.entity_mission || ""}
              variant="bordered"
              onChange={(e) => onChange("entity_mission", e.target.value)}
            />
          </div>
        </div>

        <hr className="my-4 border-t border-default-200" />

        {/* Custom Terminology Section */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-bold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:tag" className="h-6 w-6 text-default-600" />
            Custom Terminology
          </h3>
          <p className="text-default-500 text-sm">
            Customize how different roles and groups are referred to in your
            organization.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="employees-term"
                className="text-sm font-medium text-default-700 flex items-center gap-2"
              >
                <Icon icon="heroicons:users" className="h-4 w-4" />
                Employees
              </label>
              <Input
                id="employees-term"
                errorMessage={errors.employees_term}
                isInvalid={!!errors.employees_term}
                placeholder="e.g., Volunteers"
                radius="lg"
                size="lg"
                type="text"
                value={data.employees_term || ""}
                variant="bordered"
                onChange={(e) => onChange("employees_term", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-default-700 flex items-center gap-2"
                htmlFor="members-term"
              >
                <Icon className="h-4 w-4" icon="heroicons:user-group" />
                Members
              </label>
              <Input
                errorMessage={errors.members_term}
                id="members-term"
                isInvalid={!!errors.members_term}
                placeholder="e.g., Members"
                radius="lg"
                size="lg"
                type="text"
                value={data.members_term || ""}
                variant="bordered"
                onChange={(e) => onChange("members_term", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-default-700 flex items-center gap-2"
              htmlFor="groups-term"
            >
              <Icon className="h-4 w-4" icon="heroicons:folder" />
              Groups
            </label>
            <Input
              errorMessage={errors.groups_term}
              id="groups-term"
              isInvalid={!!errors.groups_term}
              placeholder="e.g., Families"
              radius="lg"
              size="lg"
              type="text"
              value={data.groups_term || ""}
              variant="bordered"
              onChange={(e) => onChange("groups_term", e.target.value)}
            />
          </div>
        </div>

        <hr className="my-4 border-t border-default-200" />

        {/* Features Section */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-bold text-default-800 flex items-center gap-2">
            <Icon
              icon="heroicons:puzzle-piece"
              className="h-6 w-6 text-default-600"
            />
            Features & Navigation
          </h3>
          <p className="text-default-500 text-sm">
            Configure enabled features, labels, and display order
          </p>
          <div className="space-y-4">
            <label
              className="text-sm font-medium text-default-700 flex items-center gap-2"
              htmlFor="features-select"
            >
              Select Features to Enable
            </label>
            <div className="flex flex-wrap gap-3" id="features-select">
              {availableFeatures.map((feature) => (
                <Chip
                  key={feature}
                  className="cursor-pointer transition-all duration-200 ease-in-out hover:scale-105"
                  color={
                    data.enabled_features?.includes(feature)
                      ? "success"
                      : "default"
                  }
                  startContent={
                    data.enabled_features?.includes(feature) && (
                      <Icon className="h-4 w-4" icon="heroicons:check" />
                    )
                  }
                  variant="flat"
                  onClick={() => handleFeatureToggle(feature)}
                >
                  {feature}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-4 border-t border-default-200" />

        {/* Description Section */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-default-700 flex items-center gap-2"
            htmlFor="org-description"
          >
            <Icon className="h-4 w-4" icon="heroicons:document-text" />
            Organization Description
          </label>
          <Textarea
            isRequired
            errorMessage={errors.entity_description}
            id="org-description"
            isInvalid={!!errors.entity_description}
            maxRows={8}
            minRows={4}
            placeholder="Provide a detailed description of your organization, its activities, and goals..."
            radius="lg"
            value={data.entity_description || ""}
            variant="bordered"
            onChange={(e) => onChange("entity_description", e.target.value)}
          />
          <div className="flex items-center justify-between text-xs text-default-500">
            <div className="flex items-center gap-1">
              <Icon icon="heroicons:information-circle" className="h-4 w-4" />
              <span>Provide comprehensive details about your organization</span>
            </div>
            <span>{data.entity_description?.length || 0}/500</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="bordered"
            onClick={() => {
              setData({});
              setSelectedServerId("");
              setSelectedProductId("");
            }}
            disabled={isSubmitting}
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Tenant..." : "Create Tenant"}
          </Button>
        </div>
      </form>
    </div>
  );
}
