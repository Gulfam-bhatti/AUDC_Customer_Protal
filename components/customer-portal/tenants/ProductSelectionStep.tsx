"use client";
import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Product } from "@/types/customer-portal";

interface Props {
  products: Product[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  loadingProducts: boolean;
  setSubmitError: (err: string | null) => void;
  onNextStep: () => void;
}

export const ProductSelectionStep: React.FC<Props> = ({
  products,
  selectedProductId,
  setSelectedProductId,
  loadingProducts,
}) => {
  if (loadingProducts) {
    return <p>Loading products...</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-red-500">No products available</p>;
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-default-700 flex items-center gap-2">
          <Icon className="h-4 w-4" icon="heroicons:shopping-bag" />
          Select Product
        </label>
        <p className="text-sm text-default-500">
          Choose a subscription plan for your tenant
        </p>
      </div>

      {loadingProducts ? (
        // Loading State
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-default-500">
              Loading available products...
            </p>
          </div>
        </div>
      ) : (
        // Products Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              isPressable
              className={`transition-all duration-200 ${
                selectedProductId === product.id
                  ? "border-2 border-emerald-500 shadow-lg"
                  : "border border-default-200 hover:border-emerald-300 hover:shadow-md"
              }`}
              onPress={() => setSelectedProductId(product.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-left">
                      {product.name}
                    </h3>
                    <p className="text-sm text-default-500 mt-1 capitalize">
                      {product.billing_cycle} billing
                    </p>
                  </div>
                  {selectedProductId === product.id && (
                    <div className="bg-emerald-500 rounded-full p-1 -ml-12">
                      <Icon
                        icon="heroicons:check"
                        className="h-4 w-4 text-white"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardBody className="pt-0">
                <div className="space-y-3">
                  {/* Price */}
                  <div className="text-2xl font-bold text-emerald-600">
                    {product.currency}{" "}
                    {product.billing_cycle === "monthly"
                      ? product.monthly_price
                      : product.annual_price}
                    <span className="text-sm font-medium text-default-500 ml-1">
                      /{product.billing_cycle}
                    </span>
                  </div>

                  {/* Max Users */}
                  <div className="flex items-center gap-2 text-sm text-default-600">
                    <Icon icon="heroicons:user-group" className="h-4 w-4" />
                    Up to {product.max_users} users
                  </div>

                  <ul className="space-y-1 text-xs text-default-600">
                    {product.features.map((f: any, i: number) => (
                      <li key={i} className="flex flex-col gap-1">
                        <div className="flex flex-row items-center">
                          <Icon
                            icon="heroicons:check-circle"
                            className="h-5 w-5 text-emerald-500"
                          />
                          <h1 className="ms-1 font-bold text-black">
                            {f.name || f.description}
                          </h1>
                        </div>

                        {/* ✅ wrap nested <li> inside <ul> */}
                        <ul className="ms-6 space-y-1">
                          {Object.entries(f.quota || {}).map(
                            ([key, value], j) => (
                              <li key={j} className="flex items-center gap-1">
                                <Icon
                                  icon="heroicons:check-circle"
                                  className="h-4 w-4 text-emerald-500"
                                />
                                <span className="font-medium text-[12px] text-gray-500">
                                  {toPascalCase(
                                    key
                                      .replaceAll("max_", "")
                                      .replaceAll("_", " ")
                                  )}
                                  :
                                </span>
                                <span>{String(value)}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {products.length === 0 && !loadingProducts && (
        <div className="text-center py-8">
          <Icon
            icon="heroicons:shopping-bag"
            className="h-12 w-12 text-default-300 mx-auto"
          />
          <h3 className="mt-4 text-lg font-medium">No products available</h3>
          <p className="mt-2 text-sm text-default-500">
            There are no subscription plans available at the moment. Please
            contact your administrator.
          </p>
        </div>
      )}
    </div>
  );
};

function toPascalCase(str: string): string {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) =>
      word.length > 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : ""
    )
    .join(" ");
}
