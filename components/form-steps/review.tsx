// components/form-steps/review.tsx
import { FormData } from "@/types/form-types";
import { Icon } from "@iconify/react";
import React from "react";

interface ReviewProps {
  data: FormData;
}

export function Review({ data }: ReviewProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
            <Icon
              icon="heroicons:document-check"
              className="h-6 w-6 text-white"
            />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Review Your Information
          </h2>
        </div>
        <p className="text-default-500 text-lg max-w-md mx-auto">
          Please review the details below before submitting.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Personal Details */}
        <div className="space-y-2 rounded-lg border p-4 shadow-sm">
          <h3 className="text-xl font-bold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:user" className="h-5 w-5" /> Business Info
          </h3>
          <p>
            <strong className="text-default-700">Business Name:</strong>{" "}
            {data.Name}
          </p>
          <p>
            <strong className="text-default-700">Server:</strong> {data.server}
          </p>
          <p>
            <strong className="text-default-700">Access Code:</strong>{" "}
            {data.access_code}
          </p>
        </div>

        {/* Organization Settings */}
        <div className="space-y-2 rounded-lg border p-4 shadow-sm">
          <h3 className="text-xl font-bold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:building-office" className="h-5 w-5" />{" "}
            Organization Settings
          </h3>
          <p>
            <strong className="text-default-700">Organization Type:</strong>{" "}
            {data.organization_type}
          </p>
          <p>
            <strong className="text-default-700">Full Name:</strong>{" "}
            {data.entity_full_name}
          </p>
          <p>
            <strong className="text-default-700">Short Name:</strong>{" "}
            {data.entity_short_name}
          </p>
          <p>
            <strong className="text-default-700">Email Address:</strong>{" "}
            {data.entity_email}
          </p>
          <p>
            <strong className="text-default-700">Website URL:</strong>{" "}
            {data.entity_website_url}
          </p>
          <p>
            <strong className="text-default-700">Purpose:</strong>{" "}
            {data.entity_purpose}
          </p>
          <p>
            <strong className="text-default-700">Mission:</strong>{" "}
            {data.entity_mission}
          </p>
        </div>

        {/* Custom Terminology */}
        <div className="space-y-2 rounded-lg border p-4 shadow-sm md:col-span-2">
          <h3 className="text-xl font-bold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:tag" className="h-5 w-5" /> Custom Terminology
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <p>
              <strong className="text-default-700">Child Entities:</strong>{" "}
              {data.child_entities_term}
            </p>
            <p>
              <strong className="text-default-700">Employees:</strong>{" "}
              {data.employees_term}
            </p>
            <p>
              <strong className="text-default-700">Members:</strong>{" "}
              {data.members_term}
            </p>
            <p>
              <strong className="text-default-700">Groups:</strong>{" "}
              {data.groups_term}
            </p>
          </div>
        </div>

        {/* Features & Navigation - NEW SECTION */}
        <div className="space-y-2 rounded-lg border p-4 shadow-sm md:col-span-2">
          <h3 className="text-xl font-bold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:puzzle-piece" className="h-5 w-5" /> Features
            & Navigation
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.enabled_features && data.enabled_features.length > 0 ? (
              data.enabled_features.map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {feature}
                </span>
              ))
            ) : (
              <p className="text-default-500">No features enabled.</p>
            )}
          </div>
        </div>

        {/* Organization Description */}
        <div className="space-y-2 rounded-lg border p-4 shadow-sm md:col-span-2">
          <h3 className="text-xl font-bold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:document-text" className="h-5 w-5" />{" "}
            Organization Description
          </h3>
          <p className="whitespace-pre-wrap">{data.entity_description}</p>
        </div>
      </div>
    </div>
  );
}
