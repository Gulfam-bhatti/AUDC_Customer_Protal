"use client";
import React, { useState, useEffect } from "react";
import { Input, Textarea, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TenantFormData, TenantFormPageProps } from "@/types/customer-portal";

export default function TenantFormPage({ tenantId }: TenantFormPageProps) {
  const [data, setData] = useState<Partial<TenantFormData>>({});
  const [errors, setErrors] = useState<
    Partial<Record<keyof TenantFormData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchTenantData = async () => {
    setIsLoading(true);
    const mockTenantData: TenantFormData = {
      id: tenantId,
      Name: "Acme Corp",
      abn: "12345678901",
      domain_url: "acme.com",
      server: "Server 1",
      access_code: "Axcevgh454",
      organization_type: "organization",
      entity_full_name: "Acme Corporation",
      entity_short_name: "ACME",
      entity_email: "contact@acme.com",
      entity_website_url: "https://www.acme.com",
      entity_purpose: "To provide quality products and services.",
      entity_mission: "Building a better tomorrow, today.",
      child_entities_term: "Divisions",
      employees_term: "Staff",
      members_term: "Employees",
      groups_term: "Teams",
      enabled_features: ["Home", "Members", "Events", "Profile"],
      entity_description:
        "Acme Corp is a leading organization in the technology sector, dedicated to innovation and excellence.",
    };
    setTimeout(() => {
      setData(mockTenantData);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchTenantData();
  }, [tenantId]);

  const onChange = (key: keyof TenantFormData, value: string | string[]) => {
    setData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon
          icon="heroicons:arrow-path-solid"
          className="h-8 w-8 animate-spin text-default-500"
        />
        <span className="ml-2 text-default-600">Loading tenant data...</span>
      </div>
    );
  }

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
            Tenants
          </h2>
        </div>
        <p className="text-default-500 text-lg max-w-md mx-auto">
          Update the settings and details for this tenant organization.
        </p>
      </div>
      <hr className="my-4 border-t border-default-200" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-default-700 flex items-center gap-2">
            <Icon icon="heroicons:identification" className="h-4 w-4" />
            Full Name
          </label>
          <Input
            isRequired
            isInvalid={!!errors.entity_full_name}
            errorMessage={errors.entity_full_name}
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
          <label className="text-sm font-medium text-default-700 flex items-center gap-2">
            <Icon icon="heroicons:hashtag" className="h-4 w-4" />
            Short Name
          </label>
          <Input
            isRequired
            isInvalid={!!errors.entity_short_name}
            errorMessage={errors.entity_short_name}
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
          <label className="text-sm font-medium text-default-700 flex items-center gap-2">
            <Icon icon="heroicons:key" className="h-4 w-4" />
            ABN
          </label>
          <Input
            isRequired
            isInvalid={!!errors.abn}
            errorMessage={errors.abn}
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
          <label className="text-sm font-medium text-default-700 flex items-center gap-2">
            <Icon icon="heroicons:link" className="h-4 w-4" />
            Domain URL
          </label>
          <Input
            isRequired
            isInvalid={!!errors.domain_url}
            errorMessage={errors.domain_url}
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
          <label className="text-sm font-medium text-default-700 flex items-center gap-2">
            <Icon icon="heroicons:envelope" className="h-4 w-4" />
            Email Address
          </label>
          <Input
            isRequired
            isInvalid={!!errors.entity_email}
            errorMessage={errors.entity_email}
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
          <label className="text-sm font-medium text-default-700 flex items-center gap-2">
            <Icon icon="heroicons:globe-alt" className="h-4 w-4" />
            Website URL
          </label>
          <Input
            isRequired
            isInvalid={!!errors.entity_website_url}
            errorMessage={errors.entity_website_url}
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
          <label className="text-sm font-medium text-default-700 flex items-center gap-2">
            <Icon icon="heroicons:target" className="h-4 w-4" />
            Purpose
          </label>
          <Input
            isRequired
            isInvalid={!!errors.entity_purpose}
            errorMessage={errors.entity_purpose}
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
          <label className="text-sm font-medium text-default-700 flex items-center gap-2">
            <Icon icon="heroicons:rocket-launch" className="h-4 w-4" />
            Mission
          </label>
          <Input
            isRequired
            isInvalid={!!errors.entity_mission}
            errorMessage={errors.entity_mission}
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
            <label className="text-sm font-medium text-default-700 flex items-center gap-2">
              <Icon icon="heroicons:cube" className="h-4 w-4" />
              Child Entities
            </label>
            <Input
              isRequired
              isInvalid={!!errors.child_entities_term}
              errorMessage={errors.child_entities_term}
              placeholder="e.g., Communities"
              radius="lg"
              size="lg"
              type="text"
              value={data.child_entities_term || ""}
              variant="bordered"
              onChange={(e) => onChange("child_entities_term", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-default-700 flex items-center gap-2">
              <Icon icon="heroicons:users" className="h-4 w-4" />
              Employees
            </label>
            <Input
              isRequired
              isInvalid={!!errors.employees_term}
              errorMessage={errors.employees_term}
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
            <label className="text-sm font-medium text-default-700 flex items-center gap-2">
              <Icon icon="heroicons:user-group" className="h-4 w-4" />
              Members
            </label>
            <Input
              isRequired
              isInvalid={!!errors.members_term}
              errorMessage={errors.members_term}
              placeholder="e.g., Members"
              radius="lg"
              size="lg"
              type="text"
              value={data.members_term || ""}
              variant="bordered"
              onChange={(e) => onChange("members_term", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-default-700 flex items-center gap-2">
              <Icon icon="heroicons:folder" className="h-4 w-4" />
              Groups
            </label>
            <Input
              isRequired
              isInvalid={!!errors.groups_term}
              errorMessage={errors.groups_term}
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
      </div>
      <hr className="my-4 border-t border-default-200" />
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
          <label className="text-sm font-medium text-default-700 flex items-center gap-2">
            Select Features to Enable
          </label>
          <div className="flex flex-wrap gap-3">
            {availableFeatures.map((feature) => (
              <Chip
                key={feature}
                variant="flat"
                color={
                  data.enabled_features?.includes(feature)
                    ? "success"
                    : "default"
                }
                onClick={() => handleFeatureToggle(feature)}
                className="cursor-pointer transition-all duration-200 ease-in-out hover:scale-105"
                startContent={
                  data.enabled_features?.includes(feature) && (
                    <Icon icon="heroicons:check" className="h-4 w-4" />
                  )
                }
              >
                {feature}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      <hr className="my-4 border-t border-default-200" />
      <div className="space-y-2">
        <label className="text-sm font-medium text-default-700 flex items-center gap-2">
          <Icon icon="heroicons:document-text" className="h-4 w-4" />
          Organization Description
        </label>
        <Textarea
          isRequired
          isInvalid={!!errors.entity_description}
          errorMessage={errors.entity_description}
          placeholder="Provide a detailed description of your organization, its activities, and goals..."
          radius="lg"
          value={data.entity_description || ""}
          variant="bordered"
          minRows={4}
          maxRows={8}
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
    </div>
  );
}
