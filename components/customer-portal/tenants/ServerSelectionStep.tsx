import React from "react";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Server } from "@/types/customer-portal";

interface ServerSelectionStepProps {
  servers: Server[];
  selectedServerId: string;
  setSelectedServerId: (id: string) => void;
  loadingServers: boolean;
  setSubmitError: (error: string | null) => void;
}

export function ServerSelectionStep({
  servers,
  selectedServerId,
  setSelectedServerId,
  loadingServers,
  setSubmitError,
}: ServerSelectionStepProps) {
  const handleSelectServer = (serverId: string) => {
    setSelectedServerId(serverId);
    setSubmitError(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "heroicons:check-circle";
      case "inactive":
        return "heroicons:x-circle";
      case "maintenance":
        return "heroicons:wrench-screwdriver";
      case "error":
        return "heroicons:exclamation-circle";
      default:
        return "heroicons:question-mark-circle";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-default-700 flex items-center gap-2">
          <Icon className="h-4 w-4" icon="heroicons:server" />
          Select Server
        </label>
        <p className="text-sm text-default-500">
          Choose a server to host your tenant instance
        </p>
      </div>

      {loadingServers ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-default-500">
              Loading available servers...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((server) => (
            <Card
              key={server.id}
              isPressable
              className={`transition-all duration-200 ${
                selectedServerId === server.id
                  ? "border-2 border-blue-500 shadow-lg"
                  : "border border-default-200 hover:border-blue-300 hover:shadow-md"
              }`}
              onPress={() => handleSelectServer(server.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{server.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(server.status)}`}
                      >
                        <Icon
                          icon={getStatusIcon(server.status)}
                          className="h-3 w-3 inline mr-1"
                        />
                        {server.status.charAt(0).toUpperCase() +
                          server.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {selectedServerId === server.id && (
                    <div className="bg-blue-500 rounded-full p-1">
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
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="heroicons:cloud"
                      className="h-4 w-4 text-default-500"
                    />
                    <span className="text-sm">{server.provider}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon
                      icon="heroicons:map-pin"
                      className="h-4 w-4 text-default-500"
                    />
                    <span className="text-sm">{server.region}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon
                      icon="heroicons:globe-alt"
                      className="h-4 w-4 text-default-500"
                    />
                    <span className="text-sm">{server.domain}</span>
                  </div>

                  <div className="pt-2 border-t border-default-100">
                    <h4 className="text-xs font-medium text-default-500 mb-2">
                      Resources
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {server.no_of_cpu_cores}
                        </div>
                        <div className="text-xs text-default-500">
                          CPU Cores
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {server.ram / 1024}GB
                        </div>
                        <div className="text-xs text-default-500">RAM</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {server.storage_capacity}GB
                        </div>
                        <div className="text-xs text-default-500">Storage</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {servers.length === 0 && !loadingServers && (
        <div className="text-center py-8">
          <Icon
            icon="heroicons:server-stack"
            className="h-12 w-12 text-default-300 mx-auto"
          />
          <h3 className="mt-4 text-lg font-medium">No servers available</h3>
          <p className="mt-2 text-sm text-default-500">
            There are no servers available at the moment. Please contact your
            administrator.
          </p>
        </div>
      )}
    </div>
  );
}
