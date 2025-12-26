"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { TransactionModal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { useCreateCampaign } from "@/hooks/useContract";
import { useRelayer } from "@/hooks/useRelayer";
import { uploadImageToIPFS, validateImageFile } from "@/lib/ipfs_proxy";
import { useAccount } from "wagmi";

type TransactionStatus =
  | "pending"
  | "encrypting"
  | "signing"
  | "confirming"
  | "success"
  | "error";

interface FormData {
  title: string;
  description: string;
  category: string;
  targetAmount: string;
  duration: string;
  shortDescription: string;
  image: File | null;
  imagePreview: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  targetAmount?: string;
  duration?: string;
  shortDescription?: string;
  image?: string;
}

export const CreateCampaignPage: React.FC = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const { createCampaign, isLoading } = useCreateCampaign();
  const relayer = useRelayer();
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Transaction modal state
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>("pending");
  const [txHash, setTxHash] = useState<string | undefined>();
  const [txError, setTxError] = useState<string | undefined>();

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "Technology",
    targetAmount: "",
    duration: "30",
    shortDescription: "",
    image: null,
    imagePreview: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const processImageFile = (file: File) => {
    try {
      validateImageFile(file, 10);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string,
        }));
      };
      reader.onerror = () => {
        setUploadError("Failed to read file");
      };
      reader.readAsDataURL(file);
      setUploadError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid image file";
      setUploadError(errorMessage);
      setFormData((prev) => ({
        ...prev,
        image: null,
        imagePreview: "",
      }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.shortDescription.trim())
        newErrors.shortDescription = "Short description is required";
      if (!formData.category) newErrors.category = "Category is required";
    }

    if (currentStep === 2) {
      if (!formData.targetAmount)
        newErrors.targetAmount = "Target amount is required";
      if (parseFloat(formData.targetAmount) <= 0)
        newErrors.targetAmount = "Amount must be greater than 0";
    }

    if (currentStep === 3) {
      if (!formData.image) {
        newErrors.image = "Campaign image is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    if (!isConnected) {
      setToastMessage("Please connect your wallet first");
      setToastType("error");
      setShowToast(true);
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setTxError(undefined);
    setShowTxModal(true);
    setTxStatus("pending");

    try {
      if (!relayer.isInitialized) {
        throw new Error(
          "FHE relayer not initialized. Please refresh the page."
        );
      }

      let imageIPFSHash = "";

      // Upload image to IPFS
      if (formData.image) {
        try {
          setTxStatus("pending");
          const uploadResult = await uploadImageToIPFS(formData.image);
          imageIPFSHash = uploadResult.hash;
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to upload image";
          throw new Error(errorMessage);
        }
      }

      // Encrypt and create campaign
      setTxStatus("encrypting");

      const result = await createCampaign(
        formData.targetAmount,
        parseInt(formData.duration),
        formData.title,
        formData.description || formData.shortDescription,
        imageIPFSHash,
        formData.category,
        relayer.instance
      );

      setTxStatus("confirming");
      setTxHash(result.txHash);

      // Success
      setTxStatus("success");

      // Reset form after success
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          category: "Technology",
          targetAmount: "",
          duration: "30",
          shortDescription: "",
          image: null,
          imagePreview: "",
        });
        setStep(1);
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create campaign";
      setTxError(errorMessage);
      setTxStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = () => {
    setShowTxModal(false);
    setTxStatus("pending");
    setTxError(undefined);
  };

  const handleTxModalClose = () => {
    setShowTxModal(false);
    if (txStatus === "success") {
      router.push("/my-campaigns");
    }
  };

  // Step indicator component
  const StepIndicator: React.FC<{
    currentStep: number;
    totalSteps: number;
  }> = ({ currentStep, totalSteps }) => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <React.Fragment key={s}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              s < currentStep
                ? "bg-green-500 text-white"
                : s === currentStep
                ? "bg-purple-600 text-white ring-4 ring-purple-200"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {s < currentStep ? "✓" : s}
          </div>
          {s < totalSteps && (
            <div
              className={`w-12 h-1 rounded ${
                s < currentStep ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Your Campaign
          </h1>
          <p className="text-lg text-gray-600">
            {step === 1 && "Tell us about your campaign"}
            {step === 2 && "Set your funding goals"}
            {step === 3 && "Add visuals and details"}
            {step === 4 && "Review and launch"}
          </p>
        </div>

        {/* Wallet Connection Warning */}
        {!isConnected && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm font-medium">
              ⚠️ Please connect your wallet to create a campaign
            </p>
          </div>
        )}

        {/* Step Indicator */}
        <StepIndicator currentStep={step} totalSteps={4} />

        {/* Form */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1 && "Basic Information"}
              {step === 2 && "Goals & Timeline"}
              {step === 3 && "Campaign Image"}
              {step === 4 && "Review & Launch"}
            </h2>
          </CardHeader>

          <CardBody className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <Input
                  label="Campaign Title"
                  placeholder="Enter campaign title (max 100 characters)"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={errors.title}
                  maxLength={100}
                />

                <Textarea
                  label="Short Description"
                  placeholder="Brief description of your campaign (max 500 characters)"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  error={errors.shortDescription}
                  maxLength={500}
                />

                <Select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  error={errors.category}
                  options={[
                    { value: "Technology", label: "Technology" },
                    { value: "Arts", label: "Arts" },
                    { value: "Social Cause", label: "Social Cause" },
                    { value: "Education", label: "Education" },
                    { value: "Health", label: "Health" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              </div>
            )}

            {/* Step 2: Goals & Timeline */}
            {step === 2 && (
              <div className="space-y-6">
                <Input
                  label="Target Funding Amount (fheUSDT)"
                  placeholder="Enter target amount in fheUSDT"
                  name="targetAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  error={errors.targetAmount}
                />

                <Select
                  label="Campaign Duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  options={[
                    { value: "7", label: "7 days" },
                    { value: "14", label: "14 days" },
                    { value: "30", label: "30 days" },
                    { value: "45", label: "45 days" },
                    { value: "60", label: "60 days" },
                  ]}
                />

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">📌 End Date:</span> Your
                    campaign will end {parseInt(formData.duration) || 30} days
                    from launch.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Campaign Image */}
            {step === 3 && (
              <div className="space-y-6">
                <Textarea
                  label="Full Campaign Description"
                  placeholder="Tell your story in detail..."
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Hero Image
                    <span className="text-red-500">*</span>
                  </label>

                  {formData.imagePreview ? (
                    <div className="space-y-4">
                      <div
                        className="relative w-full rounded-lg overflow-hidden bg-gray-100 border-2 border-purple-300"
                        style={{ aspectRatio: "16/9" }}
                      >
                        <Image
                          src={formData.imagePreview}
                          alt="Campaign preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleImageSelect}
                          style={{ display: "none" }}
                          id="image-upload-change"
                        />
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            document
                              .getElementById("image-upload-change")
                              ?.click();
                          }}
                        >
                          Change Image
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              image: null,
                              imagePreview: "",
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageSelect}
                        style={{ display: "none" }}
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer block"
                      >
                        <p className="text-4xl mb-2">🖼️</p>
                        <p className="text-sm text-gray-600">
                          Drag and drop or click to upload
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Max 10MB, PNG, JPG, GIF, WebP
                        </p>
                      </label>
                    </div>
                  )}

                  {(uploadError || errors.image) && (
                    <p className="text-sm text-red-600 mt-2">
                      {uploadError || errors.image}
                    </p>
                  )}

                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-800">
                      <span className="font-semibold">📦 IPFS Storage:</span>{" "}
                      Your image will be uploaded to IPFS for decentralized
                      storage.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Launch */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {formData.imagePreview && (
                    <div
                      className="relative w-full rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <Image
                        src={formData.imagePreview}
                        alt="Campaign preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Title</p>
                      <p className="font-bold text-gray-900">
                        {formData.title}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Category</p>
                      <p className="font-bold text-gray-900">
                        {formData.category}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Target</p>
                      <p className="font-bold text-gray-900">
                        {formData.targetAmount} fheUSDT
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Duration</p>
                      <p className="font-bold text-gray-900">
                        {formData.duration} days
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {formData.description || formData.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex gap-2">
                    <span className="text-lg">🔒</span>
                    <div>
                      <p className="font-semibold text-purple-900">
                        Privacy Guaranteed
                      </p>
                      <p className="text-sm text-purple-700 mt-1">
                        All contributions will be encrypted using FHE.
                      </p>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-purple-600 rounded"
                    disabled={isLoading || isUploading}
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{" "}
                    <a href="#" className="text-purple-600 hover:underline">
                      Terms & Conditions
                    </a>
                  </span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 justify-between pt-6 border-t border-gray-200">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading || isUploading}
                >
                  Back
                </Button>
              )}

              <div className="flex-1" />

              {step < 4 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={isLoading || isUploading}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isLoading || isUploading || !isConnected}
                  isLoading={isUploading}
                  loadingText="Creating..."
                >
                  Launch Campaign
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTxModal}
        onClose={handleTxModalClose}
        status={txStatus}
        title="Create Campaign"
        txHash={txHash}
        errorMessage={txError}
        onRetry={handleRetry}
      />

      {/* Toast */}
      {showToast && (
        <Toast
          title={toastType === "error" ? "Error" : "Info"}
          description={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default CreateCampaignPage;
