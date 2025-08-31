"use client";
import { FormData } from "@/types/form-types";
import { Input, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";

interface PersonalDetailsProps {
  data: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onChange: (key: keyof FormData, value: any) => void;
}

export function PersonalDetails({
  data,
  errors,
  onChange,
}: PersonalDetailsProps) {
  const handleAccessCodeChange = (value: string) => {
    // Convert to uppercase and remove any non-alphanumeric characters except hyphens
    const formattedValue = value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    onChange("access_code", formattedValue);
  };

  const validateAccessCode = (value: string) => {
    if (!value) return "Access code is required";
    if (value.length < 6) return "Access code must be at least 6 characters";
    if (!/^[A-Z0-9-]+$/.test(value))
      return "Access code must contain only uppercase letters, numbers, and hyphens";
    return "";
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <Icon
              icon="heroicons:building-office-2"
              className="h-6 w-6 text-white"
            />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Business Information
          </h2>
        </div>
        <p className="text-default-500 text-lg max-w-md mx-auto">
          Let's start by gathering your essential business details
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6 grid grid-cols-2 gap-6">
        {/* Business Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-default-700 flex items-center gap-2">
            <Icon icon="heroicons:building-storefront" className="h-4 w-4" />
            Business Name
          </label>
          <Input
            isRequired
            isInvalid={!!errors.Name}
            errorMessage={errors.Name}
            placeholder="Enter your business name"
            radius="lg"
            size="lg"
            value={data.Name}
            variant="bordered"
            startContent={
              <Icon
                icon="heroicons:building-storefront"
                className="h-5 w-5 text-default-400"
              />
            }
            classNames={{
              input: "text-lg",
              inputWrapper: [
                "border-2 border-default-200",
                "hover:border-blue-400",
                "focus-within:border-blue-500",
                "focus-within:bg-white",
                "transition-all duration-200",
                "shadow-sm hover:shadow-md",
              ],
            }}
            onValueChange={(value) => onChange("Name", value)}
          />
        </div>

        {/* Server Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-default-700 flex items-center gap-2">
            <Icon icon="heroicons:server" className="h-4 w-4" />
            Server Location
          </label>
          <Select
            selectedKeys={data.server ? [data.server] : []}
            onSelectionChange={(keys) => {
              const selectedValue = Array.from(keys)[0] as string;
              onChange("server", selectedValue);
            }}
            isRequired
            isInvalid={!!errors.server}
            errorMessage={errors.server}
            placeholder="Choose your preferred server"
            radius="lg"
            size="lg"
            variant="bordered"
            startContent={
              <Icon
                icon="heroicons:server"
                className="h-5 w-5 text-default-400"
              />
            }
            classNames={{
              trigger: [
                "border-2 border-default-200",
                "hover:border-green-400",
                "focus:border-green-500",
                "transition-all duration-200",
                "shadow-sm hover:shadow-md",
                "text-lg",
              ],
              value: "text-lg",
              listboxWrapper: "rounded-xl",
            }}
          >
            <SelectItem
              key="audc-infra"
              startContent={
                <Icon
                  icon="heroicons:server-stack"
                  className="h-4 w-4 text-blue-500"
                />
              }
            >
              AUDC - Infrastructure Server
            </SelectItem>
            <SelectItem
              key="audc-lebara"
              startContent={
                <Icon
                  icon="heroicons:signal"
                  className="h-4 w-4 text-purple-500"
                />
              }
            >
              AUDC - Lebara Server
            </SelectItem>
            <SelectItem
              key="audc-uk"
              startContent={
                <Icon icon="heroicons:flag" className="h-4 w-4 text-red-500" />
              }
            >
              AUDC - UK Server
            </SelectItem>
            <SelectItem
              key="audc-usa"
              startContent={
                <Icon icon="heroicons:flag" className="h-4 w-4 text-blue-600" />
              }
            >
              AUDC - USA Server
            </SelectItem>
            <SelectItem
              key="audc-australia"
              startContent={
                <Icon
                  icon="heroicons:flag"
                  className="h-4 w-4 text-green-600"
                />
              }
            >
              AUDC - Australia Server
            </SelectItem>
          </Select>
        </div>

        {/* Access Code Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-default-700 flex items-center gap-2">
            <Icon icon="heroicons:key" className="h-4 w-4" />
            Access Code
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              UPPERCASE ONLY
            </span>
          </label>
          <Input
            isRequired
            isInvalid={
              !!errors.access_code || !!validateAccessCode(data.access_code)
            }
            errorMessage={
              errors.access_code || validateAccessCode(data.access_code)
            }
            placeholder="ENTER-YOUR-ACCESS-CODE"
            radius="lg"
            size="lg"
            value={data.access_code}
            variant="bordered"
            startContent={
              <Icon icon="heroicons:key" className="h-5 w-5 text-default-400" />
            }
            endContent={
              <div className="flex items-center gap-1">
                {data.access_code &&
                  validateAccessCode(data.access_code) === "" && (
                    <Icon
                      icon="heroicons:check-circle"
                      className="h-5 w-5 text-green-500"
                    />
                  )}
                <div className="text-xs text-default-400 bg-default-100 px-2 py-1 rounded-md">
                  {data.access_code.length}/20
                </div>
              </div>
            }
            classNames={{
              input: [
                "tracking-wider",
                "placeholder:text-default-400 placeholder:tracking-wider",
              ],
              inputWrapper: [
                "border-2 border-default-200",
                "hover:border-orange-400",
                "focus-within:border-orange-500",
                "focus-within:bg-white",
                "transition-all duration-200",
                "shadow-sm hover:shadow-md",
              ],
            }}
            onValueChange={handleAccessCodeChange}
          />
          <div className="flex items-center gap-2 text-xs text-default-500">
            <Icon icon="heroicons:information-circle" className="h-4 w-4" />
            <span>
              Access code will be automatically converted to uppercase. Use
              letters, numbers, and hyphens only.
            </span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
          <Icon icon="heroicons:clock" className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-blue-700 font-medium">Step 1 of 3</span>
        </div>
      </div>
    </div>
  );
}
