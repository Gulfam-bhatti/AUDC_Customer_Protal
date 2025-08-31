"use client";
import { FormData } from "@/types/form-types";
import { Input, Textarea, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";
import { Chip } from "@heroui/react"; // Assuming Chip component from @heroui/react or similar

interface ContactInformationProps {
  data: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onChange: (key: keyof FormData, value: string | string[]) => void; // Update onChange type to accept string[] for features
}

export function ContactInformation({
  data,
  errors,
  onChange,
}: ContactInformationProps) {
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleEmailChange = (value: string) => {
    onChange("entity_email", value.toLowerCase().trim());
  };

  const handleUrlChange = (value: string) => {
    let formattedUrl = value.trim();
    if (
      formattedUrl &&
      !formattedUrl.startsWith("http://") &&
      !formattedUrl.startsWith("https://")
    ) {
      formattedUrl = "https://" + formattedUrl;
    }
    onChange("entity_website_url", formattedUrl);
  };

  // Define available features as seen in your image
  const availableFeatures = [
    "Home",
    "Members",
    "Events",
    "Committees",
    "Profile",
    "Notifications",
    "App Settings",
    "Support",
    "Families", // This one is separate in the image, but logically part of features
  ];

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = data.enabled_features || [];
    if (currentFeatures.includes(feature)) {
      // Feature is currently enabled, so disable it
      onChange(
        "enabled_features",
        currentFeatures.filter((f) => f !== feature)
      );
    } else {
      // Feature is currently disabled, so enable it
      onChange("enabled_features", [...currentFeatures, feature]);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600">
            <Icon
              icon="heroicons:building-office"
              className="h-6 w-6 text-white"
            />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Organization Settings
          </h2>
        </div>
        <p className="text-default-500 text-lg max-w-md mx-auto">
          Define your organization type and terminology
        </p>
      </div>

      {/* Organization Type Selector */}
      <div className="space-y-2">
        <label
          htmlFor="organization_type"
          className="text-sm font-medium text-default-700 flex items-center gap-2"
        >
          <Icon icon="heroicons:building-office-2" className="h-4 w-4" />
          Organization Type
        </label>
        <Select
          id="organization_type"
          isRequired
          isInvalid={!!errors.organization_type}
          errorMessage={errors.organization_type}
          placeholder="Select your organization type"
          radius="lg"
          size="lg"
          variant="bordered"
          selectedKeys={data.organization_type ? [data.organization_type] : []}
          onSelectionChange={(keys) =>
            onChange("organization_type", Array.from(keys).join(""))
          }
          startContent={
            <Icon
              icon="heroicons:building-office-2"
              className="h-5 w-5 text-default-400"
            />
          }
          classNames={{
            trigger: [
              "border-2 border-default-200",
              "hover:border-green-400",
              "focus-within:border-green-500",
              "focus-within:bg-white",
              "transition-all duration-200",
              "shadow-sm hover:shadow-md",
            ],
            value: "text-lg",
          }}
        >
          {/* Options based on typical organization types */}
          <SelectItem key="organization">Organization</SelectItem>
          <SelectItem key="non-profit">Non-Profit</SelectItem>
          <SelectItem key="educational">Educational Institution</SelectItem>
          <SelectItem key="government">Government Agency</SelectItem>
          <SelectItem key="other">Other</SelectItem>
        </Select>
      </div>

      {/* Form Fields Grid - Full Name, Short Name, Email, Website, Purpose, Mission */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Full Name */}
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
            isInvalid={!!errors.entity_full_name}
            errorMessage={errors.entity_full_name}
            placeholder="Enter your full organization name"
            radius="lg"
            size="lg"
            type="text"
            value={data.entity_full_name}
            variant="bordered"
            startContent={
              <Icon
                icon="heroicons:identification"
                className="h-5 w-5 text-default-400"
              />
            }
            classNames={{
              input: [
                "text-lg",
                "placeholder:font-light placeholder:text-default-400",
              ],
              inputWrapper: [
                "border-2 border-default-200",
                "hover:border-blue-400",
                "focus-within:border-blue-500",
                "focus-within:bg-white",
                "transition-all duration-200",
                "shadow-sm hover:shadow-md",
              ],
            }}
            onValueChange={(value) => onChange("entity_full_name", value)}
          />
        </div>

        {/* Short Name */}
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
            isInvalid={!!errors.entity_short_name}
            errorMessage={errors.entity_short_name}
            placeholder="Enter short name or acronym"
            radius="lg"
            size="lg"
            type="text"
            value={data.entity_short_name}
            variant="bordered"
            startContent={
              <Icon
                icon="heroicons:hashtag"
                className="h-5 w-5 text-default-400"
              />
            }
            classNames={{
              input: [
                "text-lg",
                "placeholder:font-light placeholder:text-default-400",
              ],
              inputWrapper: [
                "border-2 border-default-200",
                "hover:border-purple-400",
                "focus-within:border-purple-500",
                "focus-within:bg-white",
                "transition-all duration-200",
                "shadow-sm hover:shadow-md",
              ],
            }}
            onValueChange={(value) => onChange("entity_short_name", value)}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="entity_email"
            className="text-sm font-medium text-default-700 flex items-center gap-2"
          >
            <Icon icon="heroicons:envelope" className="h-4 w-4" />
            Email Address
          </label>
          <Input
            id="entity_email"
            isRequired
            isInvalid={
              !!errors.entity_email ||
              (data.entity_email !== undefined &&
                data.entity_email !== "" &&
                !validateEmail(data.entity_email))
            }
            errorMessage={
              errors.entity_email ||
              (data.entity_email !== undefined &&
              data.entity_email !== "" &&
              !validateEmail(data.entity_email)
                ? "Please enter a valid email address"
                : undefined)
            }
            placeholder="contact@yourorganization.com"
            radius="lg"
            size="lg"
            type="email"
            value={data.entity_email}
            variant="bordered"
            startContent={
              <Icon
                icon="heroicons:envelope"
                className="h-5 w-5 text-default-400"
              />
            }
            endContent={
              data.entity_email &&
              validateEmail(data.entity_email) && (
                <Icon
                  icon="heroicons:check-circle"
                  className="h-5 w-5 text-green-500"
                />
              )
            }
            classNames={{
              input: [
                "text-lg",
                "placeholder:font-light placeholder:text-default-400",
              ],
              inputWrapper: [
                "border-2 border-default-200",
                "hover:border-rose-400",
                "focus-within:border-rose-500",
                "focus-within:bg-white",
                "transition-all duration-200",
                "shadow-sm hover:shadow-md",
              ],
            }}
            onValueChange={handleEmailChange}
          />
        </div>

        {/* Website URL */}
        <div className="space-y-2">
          <label
            htmlFor="entity_website_url"
            className="text-sm font-medium text-default-700 flex items-center gap-2"
          >
            <Icon icon="heroicons:globe-alt" className="h-4 w-4" />
            Website URL
          </label>
          <Input
            id="entity_website_url"
            isRequired
            isInvalid={
              !!errors.entity_website_url ||
              (data.entity_website_url !== undefined &&
                data.entity_website_url !== "" &&
                !validateUrl(data.entity_website_url))
            }
            errorMessage={
              errors.entity_website_url ||
              (data.entity_website_url !== undefined &&
              data.entity_website_url !== "" &&
              !validateUrl(data.entity_website_url)
                ? "Please enter a valid website URL"
                : undefined)
            }
            placeholder="www.yourorganization.com"
            radius="lg"
            size="lg"
            type="url"
            value={data.entity_website_url}
            variant="bordered"
            startContent={
              <Icon
                icon="heroicons:globe-alt"
                className="h-5 w-5 text-default-400"
              />
            }
            endContent={
              data.entity_website_url &&
              validateUrl(data.entity_website_url) && (
                <Icon
                  icon="heroicons:check-circle"
                  className="h-5 w-5 text-green-500"
                />
              )
            }
            classNames={{
              input: [
                "text-lg",
                "placeholder:font-light placeholder:text-default-400",
              ],
              inputWrapper: [
                "border-2 border-default-200",
                "hover:border-teal-400",
                "focus-within:border-teal-500",
                "focus-within:bg-white",
                "transition-all duration-200",
                "shadow-sm hover:shadow-md",
              ],
            }}
            onValueChange={handleUrlChange}
          />
        </div>

        {/* Purpose */}
        <div className="space-y-2">
          <label
            htmlFor="entity_purpose"
            className="text-sm font-medium text-default-700 flex items-center gap-2"
          >
            <Icon icon="heroicons:target" className="h-4 w-4" />
            Purpose
          </label>
          <Input
            id="entity_purpose"
            isRequired
            isInvalid={!!errors.entity_purpose}
            errorMessage={errors.entity_purpose}
            placeholder="What is your organization's main purpose?"
            radius="lg"
            size="lg"
            type="text"
            value={data.entity_purpose}
            variant="bordered"
            startContent={
              <Icon
                icon="heroicons:target"
                className="h-5 w-5 text-default-400"
              />
            }
            classNames={{
              input: [
                "text-lg",
                "placeholder:font-light placeholder:text-default-400",
              ],
              inputWrapper: [
                "border-2 border-default-200",
                "hover:border-amber-400",
                "focus-within:border-amber-500",
                "focus-within:bg-white",
                "transition-all duration-200",
                "shadow-sm hover:shadow-md",
              ],
            }}
            onValueChange={(value) => onChange("entity_purpose", value)}
          />
        </div>

        {/* Mission */}
        <div className="space-y-2">
          <label
            htmlFor="entity_mission"
            className="text-sm font-medium text-default-700 flex items-center gap-2"
          >
            <Icon icon="heroicons:rocket-launch" className="h-4 w-4" />
            Mission
          </label>
          <Input
            id="entity_mission"
            isRequired
            isInvalid={!!errors.entity_mission}
            errorMessage={errors.entity_mission}
            placeholder="Describe your organization's mission"
            radius="lg"
            size="lg"
            type="text"
            value={data.entity_mission}
            variant="bordered"
            startContent={
              <Icon
                icon="heroicons:rocket-launch"
                className="h-5 w-5 text-default-400"
              />
            }
            classNames={{
              input: [
                "text-lg",
                "placeholder:font-light placeholder:text-default-400",
              ],
              inputWrapper: [
                "border-2 border-default-200",
                "hover:border-violet-400",
                "focus-within:border-violet-500",
                "focus-within:bg-white",
                "transition-all duration-200",
                "shadow-sm hover:shadow-md",
              ],
            }}
            onValueChange={(value) => onChange("entity_mission", value)}
          />
        </div>
      </div>

      {/* Custom Terminology Section */}
      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-bold text-default-800 flex items-center gap-2">
          <Icon icon="heroicons:tag" className="h-6 w-6 text-default-600" />
          Custom Terminology
        </h3>
        <p className="text-default-500 text-sm">
          Customize how different roles and groups are referred to in your
          organization
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Child Entities */}
          <div className="space-y-2">
            <label
              htmlFor="child_entities_term"
              className="text-sm font-medium text-default-700 flex items-center gap-2"
            >
              <Icon icon="heroicons:cube" className="h-4 w-4" />
              Child Entities
            </label>
            <Input
              id="child_entities_term"
              isRequired
              isInvalid={!!errors.child_entities_term}
              errorMessage={errors.child_entities_term}
              placeholder="e.g., Communities"
              radius="lg"
              size="lg"
              type="text"
              value={data.child_entities_term}
              variant="bordered"
              startContent={
                <Icon
                  icon="heroicons:squares-2x2"
                  className="h-5 w-5 text-default-400"
                />
              }
              classNames={{
                input: [
                  "text-lg",
                  "placeholder:font-light placeholder:text-default-400",
                ],
                inputWrapper: [
                  "border-2 border-default-200",
                  "hover:border-emerald-400",
                  "focus-within:border-emerald-500",
                  "focus-within:bg-white",
                  "transition-all duration-200",
                  "shadow-sm hover:shadow-md",
                ],
              }}
              onValueChange={(value) => onChange("child_entities_term", value)}
            />
          </div>

          {/* Employees */}
          <div className="space-y-2">
            <label
              htmlFor="employees_term"
              className="text-sm font-medium text-default-700 flex items-center gap-2"
            >
              <Icon icon="heroicons:users" className="h-4 w-4" />
              Employees
            </label>
            <Input
              id="employees_term"
              isRequired
              isInvalid={!!errors.employees_term}
              errorMessage={errors.employees_term}
              placeholder="e.g., Volunteers"
              radius="lg"
              size="lg"
              type="text"
              value={data.employees_term}
              variant="bordered"
              startContent={
                <Icon
                  icon="heroicons:briefcase"
                  className="h-5 w-5 text-default-400"
                />
              }
              classNames={{
                input: [
                  "text-lg",
                  "placeholder:font-light placeholder:text-default-400",
                ],
                inputWrapper: [
                  "border-2 border-default-200",
                  "hover:border-indigo-400",
                  "focus-within:border-indigo-500",
                  "focus-within:bg-white",
                  "transition-all duration-200",
                  "shadow-sm hover:shadow-md",
                ],
              }}
              onValueChange={(value) => onChange("employees_term", value)}
            />
          </div>

          {/* Members */}
          <div className="space-y-2">
            <label
              htmlFor="members_term"
              className="text-sm font-medium text-default-700 flex items-center gap-2"
            >
              <Icon icon="heroicons:user-group" className="h-4 w-4" />
              Members
            </label>
            <Input
              id="members_term"
              isRequired
              isInvalid={!!errors.members_term}
              errorMessage={errors.members_term}
              placeholder="e.g., Members"
              radius="lg"
              size="lg"
              type="text"
              value={data.members_term}
              variant="bordered"
              startContent={
                <Icon
                  icon="heroicons:user-group"
                  className="h-5 w-5 text-default-400"
                />
              }
              classNames={{
                input: [
                  "text-lg",
                  "placeholder:font-light placeholder:text-default-400",
                ],
                inputWrapper: [
                  "border-2 border-default-200",
                  "hover:border-red-400",
                  "focus-within:border-red-500",
                  "focus-within:bg-white",
                  "transition-all duration-200",
                  "shadow-sm hover:shadow-md",
                ],
              }}
              onValueChange={(value) => onChange("members_term", value)}
            />
          </div>

          {/* Groups */}
          <div className="space-y-2">
            <label
              htmlFor="groups_term"
              className="text-sm font-medium text-default-700 flex items-center gap-2"
            >
              <Icon icon="heroicons:folder" className="h-4 w-4" />
              Groups
            </label>
            <Input
              id="groups_term"
              isRequired
              isInvalid={!!errors.groups_term}
              errorMessage={errors.groups_term}
              placeholder="e.g., Families"
              radius="lg"
              size="lg"
              type="text"
              value={data.groups_term}
              variant="bordered"
              startContent={
                <Icon
                  icon="heroicons:tag"
                  className="h-5 w-5 text-default-400"
                />
              }
              classNames={{
                input: [
                  "text-lg",
                  "placeholder:font-light placeholder:text-default-400",
                ],
                inputWrapper: [
                  "border-2 border-default-200",
                  "hover:border-purple-400",
                  "focus-within:border-purple-500",
                  "focus-within:bg-white",
                  "transition-all duration-200",
                  "shadow-sm hover:shadow-md",
                ],
              }}
              onValueChange={(value) => onChange("groups_term", value)}
            />
          </div>
        </div>
      </div>

      {/* Features & Navigation Section */}
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
            htmlFor="features-select"
            className="text-sm font-medium text-default-700 flex items-center gap-2"
          >
            Select Features to Enable
          </label>
          <div 
            id="features-select"
            role="group"
            aria-label="Available features"
            className="flex flex-wrap gap-3">
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

        {/* You can add the "Customize Feature Labels" section here if needed */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-default-700">
            <Icon icon="heroicons:pencil" className="h-4 w-4" />
            <span className="text-sm font-medium">
              Customize Feature Labels
            </span>
            {/* You can add an expand/collapse icon here if it's a collapsible section */}
          </div>
          {/* Add inputs for customizing labels here if you implement that functionality */}
        </div>
      </div>

      {/* Description Textarea */}
      <div className="space-y-2">
        <label
          htmlFor="entity_description"
          className="text-sm font-medium text-default-700 flex items-center gap-2"
        >
          <Icon icon="heroicons:document-text" className="h-4 w-4" />
          Organization Description
        </label>
        <Textarea
          id="entity_description"
          isRequired
          isInvalid={!!errors.entity_description}
          errorMessage={errors.entity_description}
          placeholder="Provide a detailed description of your organization, its activities, and goals..."
          radius="lg"
          value={data.entity_description}
          variant="bordered"
          minRows={4}
          maxRows={8}
          startContent={
            <Icon
              icon="heroicons:document-text"
              className="h-5 w-5 text-default-400 mt-1"
            />
          }
          classNames={{
            input: [
              "text-lg",
              "placeholder:font-light placeholder:text-default-400",
            ],
            inputWrapper: [
              "border-2 border-default-200",
              "hover:border-emerald-400",
              "focus-within:border-emerald-500",
              "focus-within:bg-white",
              "transition-all duration-200",
              "shadow-sm hover:shadow-md",
              "min-h-[120px]",
            ],
          }}
          onValueChange={(value) => onChange("entity_description", value)}
        />
        <div className="flex items-center justify-between text-xs text-default-500">
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:information-circle" className="h-4 w-4" />
            <span>Provide comprehensive details about your organization</span>
          </div>
          <span>{data.entity_description.length}/500</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
          <Icon icon="heroicons:clock" className="h-4 w-4 text-emerald-500" />
          <span className="text-sm text-emerald-700 font-medium">
            Step 2 of 3
          </span>
        </div>
      </div>
    </div>
  );
}
