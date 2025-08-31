"use client"
import { ContactInformation } from "@/components/form-steps/contact-information";
import { PersonalDetails } from "@/components/form-steps/personal-details";
import { Review } from "@/components/form-steps/review";
import ServerPlans from "@/components/form-steps/server-plans/main";
import RowSteps from "@/components/row-steps";
import { FormData } from "@/types/form-types";
import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/react";
import React from "react";

const INITIAL_FORM_DATA: FormData = {
  entity_description: "",
  access_code: "",
  entity_full_name: "",
  Name: "",
  entity_email: "",
  server: "",
  entity_website_url: "",
  entity_mission: "",
  entity_short_name: "",
  entity_purpose: "",
  child_entities_term: "",
  employees_term: "",
  members_term: "",
  groups_term: "",
  organization_type: "",
  enabled_features: [],
};

const STEPS = [{title: "Business Info"}, {title: "Organization Info"}, {title: "Server Plan"}, {title: "Review"}];

function App() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [formData, setFormData] = React.useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({});
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const handleChange = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({...prev, [key]: value}));
  };

  const validateStep = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    switch (currentStep) {
      case 0: // Personal Details
        if (!formData.Name) newErrors.Name = "Business Name is required";
        if (!formData.server) newErrors.server = "Server is required";
        if (!formData.access_code) newErrors.access_code = "Access Code is required";
        break;
      case 1: // Contact Information (now Organization Settings)
        if (!formData.organization_type) newErrors.organization_type = "Organization Type is required";
        if (!formData.entity_full_name) newErrors.entity_full_name = "Full Name is required";
        if (!formData.entity_short_name) newErrors.entity_short_name = "Short Name is required"; // Corrected error message
        if (!formData.entity_email) newErrors.entity_email = "Email is required";
        if (formData.entity_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.entity_email)) {
          newErrors.entity_email = "Please enter a valid email address";
        }
        if (!formData.entity_website_url) newErrors.entity_website_url = "Website URL is required";
        if (formData.entity_website_url && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.entity_website_url)) {
          newErrors.entity_website_url = "Please enter a valid website URL";
        }
        if (!formData.entity_purpose) newErrors.entity_purpose = "Purpose is required";
        if (!formData.entity_mission) newErrors.entity_mission = "Mission is required";
        if (!formData.entity_description) newErrors.entity_description = "Organization Description is required"; // Corrected error message

        // Validation for new custom terminology fields
        if (!formData.child_entities_term) newErrors.child_entities_term = "Child Entities term is required";
        if (!formData.employees_term) newErrors.employees_term = "Employees term is required";
        if (!formData.members_term) newErrors.members_term = "Members term is required";
        if (!formData.groups_term) newErrors.groups_term = "Groups term is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      onOpen(); // Open error modal
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    // Here you would typically send the formData to your backend
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PersonalDetails data={formData} errors={errors} onChange={handleChange} />;
      case 1:
        return <ContactInformation data={formData} errors={errors} onChange={handleChange} />;
      case 2:
        return <ServerPlans />;
      case 3:
        return <Review data={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-full space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="flex items-center mr-24 justify-center gap-2 text-4xl font-bold">
            Prob Solutions Enrollment
          </h1>
        </div>

        <div className="space-y-8 rounded-xl bg-white p-6">
          <div className="flex justify-center">
            <RowSteps
              color="primary"
              currentStep={currentStep}
              steps={STEPS}
              onStepChange={setCurrentStep}
            />
          </div>

          <div className="min-h-[400px]">{renderStep()}</div>

          <div className="flex justify-between pt-4">
            <Button
              className="min-w-[120px]"
              isDisabled={currentStep === 0}
              variant="flat"
              onPress={handlePrevious}
            >
              Previous
            </Button>
            {currentStep === STEPS.length - 1 ? (
              <Button className="min-w-[120px]" color="secondary" onPress={handleSubmit}>
                Submit
              </Button>
            ) : (
              <Button className="min-w-[120px]" color="secondary" onPress={handleNext}>
                Next
              </Button>
            )}
          </div>
        </div>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Form Validation Error</ModalHeader>
                <ModalBody>
                  <p>Please fill in all required fields before proceeding to the next step.</p>
                  <ul className="list-disc pl-5">
                    {Object.entries(errors).map(([key, value]) => (
                      <li key={key} className="text-danger">{value}</li>
                    ))}
                  </ul>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}

export default App;