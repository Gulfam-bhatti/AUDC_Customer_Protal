"use client";
import React, { useState, useEffect } from "react";
import { Button, Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TenantFormData, Server, Product } from "@/types/customer-portal";
import { supabase } from "@/lib/supabase";
import { TenantInfoStep } from "@/components/customer-portal/tenants/TenantInfoStep";
import { ServerSelectionStep } from "@/components/customer-portal/tenants/ServerSelectionStep";
import { ProductSelectionStep } from "@/components/customer-portal/tenants/ProductSelectionStep";
import toast from "react-hot-toast";
import { createTenantApi, fetchProductsHelper } from "@/lib/api/helper";
import { useRouter, useSearchParams } from "next/navigation";
import { useRemoveSearchParam } from "@/hooks/useRemoveSearchParams";
import DynamicConfigForm from "@/components/customer-portal/tenants/ProductConfigurationStep";
import RowSteps from "@/components/TenantRowStep";

export default function AddTenantPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<TenantFormData>>({});
  const [errors, setErrors] = useState<
    Partial<Record<keyof TenantFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [loadingServers, setLoadingServers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Product configuration data
  const [productConfigData, setProductConfigData] = useState<
    Record<string, any>
  >({});

  // ---- LIFTED validation states (new) ----
  const [accessCodeValid, setAccessCodeValid] = useState<boolean | null>(null);
  const [domainValid, setDomainValid] = useState<boolean | null>(null);
  const [validatingAccessCode, setValidatingAccessCode] = useState(false);
  const [validatingDomain, setValidatingDomain] = useState(false);
  // ----------------------------------------
  const removeParam = useRemoveSearchParam();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);

        const products = await fetchProductsHelper();
        console.log("products:", products);

        if (products) {
          const productList = products;
          setProducts(productList || []);
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const removeParamsOnReload = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("product_id");
      window.history.replaceState({}, "", url.toString());
    };

    removeParamsOnReload();
  }, []);

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
        router.push("/dashboard/tenants");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, router]);

  useEffect(() => {
    if (submitError) {
      const timer = setTimeout(() => {
        setSubmitError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [submitError]);

  const getSteps = () => {
    const steps = [
      { title: "Tenant Information" },
      { title: "Server Selection" },
      { title: "Product Selection" },
      { title: "Product Configuration" },
    ];

    return steps;
  };

  const steps = getSteps();

  const isFormEmpty =
    !data.access_code ||
    !data.subdomain ||
    !data.name ||
    !data.business_reg_number ||
    !data.time_zone;

  useEffect(() => {
    fetchServers();
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

  const onChange = (key: keyof TenantFormData, value: string | string[]) => {
    setData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: Partial<Record<keyof TenantFormData, string>> = {};

    // Validate based on current step
    if (currentStep === 0) {
      if (!data.name?.trim()) {
        newErrors.name = "Tenant name is required";
      }
      if (!data.access_code?.trim()) {
        newErrors.access_code = "Access code is required";
      }
      if (!data.subdomain?.trim()) {
        newErrors.subdomain = "Domain is required";
      }
      if (!data.time_zone?.trim()) {
        newErrors.time_zone = "Time zone is required";
      }
      if (!data.business_reg_number?.trim()) {
        newErrors.business_reg_number =
          "Business registration number is required";
      }

      // If async validation is still running, block proceeding
      if (validatingAccessCode || validatingDomain) {
        return false;
      }

      // backend validation results (lifted from TenantInfoStep)
      if (accessCodeValid === false) {
        newErrors.access_code =
          newErrors.access_code || "Access code is not valid";
        valid = false;
      }
      if (domainValid === false) {
        newErrors.subdomain = newErrors.subdomain || "Domain is not valid";
        valid = false;
      }
    } else if (currentStep === 1) {
      if (!selectedServerId) {
        setSubmitError("Please select a server");
        return false;
      }
    } else if (currentStep === 2) {
      if (!selectedProductId) {
        setSubmitError("Please select a product");
        return false;
      }
    }

    setErrors(newErrors);
    return valid && Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const isValid = validateForm(); // sets errors + returns true/false

    if (!isValid || validatingAccessCode || validatingDomain) {
      return;
    }

    if (currentStep < 3) {
      removeParam("product_id");
    }

    // Example: Add product_id into search params on step 2
    if (currentStep === 2 && selectedProductId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("product_id", selectedProductId);

      // Push same route but with updated query params (no reload)
      router.push(`?${params.toString()}`);
    }

    // If we're at the last step, submit the form
    if (currentStep === steps.length - 1) {
      handleSubmit(new Event("submit") as any);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);

    if (currentStep < 3) {
      removeParam("product_id");
    }

    if (currentStep === 3 && selectedProductId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("product_id", selectedProductId);

      router.push(`?${params.toString()}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tenantData = {
      name: data.name,
      access_code: data.access_code,
      server_id: selectedServerId,
      product_id: selectedProductId,
      subdomain: data.subdomain,
      business_reg_number: data.business_reg_number,
      time_zone: data.time_zone || "UTC",
      config: productConfigData,
      status: "active",
    };
    console.log("Print all Tenant data: ", tenantData);

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await createTenantApi(tenantData);

      // Check if response indicates success
      if (response && response.success) {
        setSubmitSuccess(true);
        setData({});
        setSelectedServerId("");
        setSelectedProductId("");
        setProductConfigData({});
        toast.success("Tenant created successfully!");
      } else {
        setSubmitError(response?.message || "Failed to create tenant");
        toast.error("Failed to create tenant");
      }
    } catch (error: any) {
      console.error("Error creating tenant:", error);
      setSubmitError(error.message || "Failed to create tenant");
      toast.error("Failed to create tenant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <TenantInfoStep
            data={data}
            errors={errors}
            onChange={onChange}
            onValidationChange={(payload) => {
              // payload may contain any subset so guard each
              if (payload.accessCodeValid !== undefined)
                setAccessCodeValid(payload.accessCodeValid);
              if (payload.domainValid !== undefined)
                setDomainValid(payload.domainValid);
              if (payload.validatingAccessCode !== undefined)
                setValidatingAccessCode(payload.validatingAccessCode);
              if (payload.validatingDomain !== undefined)
                setValidatingDomain(payload.validatingDomain);
            }}
          />
        );
      case 1:
        return (
          <ServerSelectionStep
            servers={servers}
            selectedServerId={selectedServerId}
            setSelectedServerId={setSelectedServerId}
            loadingServers={loadingServers}
            setSubmitError={setSubmitError}
          />
        );
      case 2:
        return (
          <ProductSelectionStep
            products={products}
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            loadingProducts={loadingProducts}
            setSubmitError={setSubmitError}
            onNextStep={handleNext}
          />
        );
      case 3:
        return (
          <DynamicConfigForm
            productId={selectedProductId}
            configData={productConfigData}
            setConfigData={setProductConfigData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto">
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

      <RowSteps
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        disableFutureSteps
      />

      {submitSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-in fade-in-90 zoom-in-90">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <Icon
                    icon="heroicons:check-circle"
                    className="h-10 w-10 text-green-600"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Tenant Created Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Your new tenant{" "}
                <span className="font-semibold">{data.name}</span> has been
                created and is now active.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Tenant Name:</span>
                  <span className="font-medium">{data.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Domain:</span>
                  <span className="font-medium">{data.subdomain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>
              <Button
                color="primary"
                className="w-full"
                onClick={() => {
                  setSubmitSuccess(false);
                  router.push("/dashboard/tenants");
                }}
              >
                Go to Tenants Dashboard
              </Button>
            </div>
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

      <Card className="p-6">
        {renderStep()}
        <div className="flex justify-between mt-6">
          <Button
            variant="bordered"
            className={`${currentStep === 0 ? "cursor-not-allowed" : ""} ${currentStep === 0 && "hidden"}`}
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Back
          </Button>

          {/* Only show Next button for steps 0, 1, and 2 */}
          {currentStep < 3 && (
            <Button
              color="primary"
              className={`${isFormEmpty ? "cursor-not-allowed opacity-50 hover:bg-black/55" : ""} ml-auto`}
              onClick={handleNext}
              isLoading={isSubmitting}
              disabled={isSubmitting || isFormEmpty}
            >
              Next
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
