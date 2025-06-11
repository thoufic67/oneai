import {
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Image,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Spinner,
} from "@heroui/react";
import { useTheme } from "next-themes";
import { forwardRef, useEffect, useState, useRef } from "react";
import {
  Image as ImageIcon,
  ChevronDown,
  Globe,
  Paperclip,
  X,
} from "lucide-react";
import type {
  Message,
  ChatMessage,
  Conversation,
  StreamResponse,
  UploadedImageMeta as BaseUploadedImageMeta,
  ModelType,
} from "@/types";

interface ModelOption {
  name: string;
  value: string;
  logo?: string;
  displayName?: string; // Underlying model display name
}

interface UploadedImageMeta extends BaseUploadedImageMeta {
  attachment_type: string;
  attachment_url: string;
  filePath: string;
  localPreviewUrl: string; // for preview
  loading: boolean;
  error?: string;
}

interface ChatInputProps {
  classNames?: {
    inputWrapper?: string;
    label?: string;
    input?: string;
  };
  variant?: string;
  labelPlacement?: string;
  radius?: string;
  size?: string;
  endContent?: React.ReactNode;
  onValueChange?: (value: string) => void;
  value?: string;
  disabled?: boolean;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onWebSearchToggle?: (enabled: boolean) => void;
  webSearchEnabled?: boolean;
  onImageGenToggle?: (enabled: boolean) => void;
  imageGenEnabled?: boolean;
  modelOptions?: ModelOption[];
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  onImageSelected?: (files: File[]) => void;
  onImageUploadComplete?: (images: UploadedImageMeta[]) => void;
  onImageCleanup?: () => void;
  selectedImages?: File[];
  uploadedImages?: UploadedImageMeta[];
  onUploadingChange?: (uploading: boolean) => void;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  (props, ref) => {
    const { theme } = useTheme();
    const {
      classNames,
      endContent,
      onValueChange,
      value,
      disabled,
      placeholder,
      onKeyDown,
      onWebSearchToggle,
      webSearchEnabled = false,
      onImageGenToggle,
      imageGenEnabled = false,
      modelOptions = [],
      selectedModel,
      onModelChange,
      onImageSelected,
      onImageUploadComplete,
      onImageCleanup,
      selectedImages: controlledSelectedImages,
      uploadedImages: controlledUploadedImages,
      onUploadingChange,
    } = props;

    const [isWebSearchEnabled, setIsWebSearchEnabled] =
      useState(webSearchEnabled);
    const [isImageGenEnabled, setIsImageGenEnabled] = useState(imageGenEnabled);

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const uploadedImages = controlledUploadedImages || [];
    const [loadingImages, setLoadingImages] = useState<UploadedImageMeta[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [openPreviewIdx, setOpenPreviewIdx] = useState<number | undefined>(
      undefined
    );

    useEffect(() => {
      console.log("Images", { imagePreviewUrls, uploadedImages });
    }, [imagePreviewUrls, uploadedImages]);

    useEffect(() => {
      setIsImageGenEnabled(imageGenEnabled);
    }, [imageGenEnabled]);

    useEffect(() => {
      console.log("Images", { controlledSelectedImages });
      if (controlledSelectedImages) {
        imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        setSelectedImages(controlledSelectedImages);
        setImagePreviewUrls(
          controlledSelectedImages.map((file) => URL.createObjectURL(file))
        );
      }
    }, [controlledSelectedImages]);

    useEffect(() => {
      if (onUploadingChange) onUploadingChange(uploading);
    }, [uploading, onUploadingChange]);

    const toggleWebSearch = () => {
      if (isImageGenEnabled) {
        setIsImageGenEnabled(false);
        onImageGenToggle && onImageGenToggle(false);
      }
      const newState = !isWebSearchEnabled;
      setIsWebSearchEnabled(newState);
      if (onWebSearchToggle) {
        onWebSearchToggle(newState);
      }
    };

    const toggleImageGen = () => {
      if (isWebSearchEnabled) {
        setIsWebSearchEnabled(false);
        onWebSearchToggle && onWebSearchToggle(false);
      }
      const newState = !isImageGenEnabled;
      setIsImageGenEnabled(newState);
      if (onImageGenToggle) {
        onImageGenToggle(newState);
      }
    };

    const uploadImage = async (file: File, conversationId?: string) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");
      if (conversationId) formData.append("conversationId", conversationId);
      try {
        const res = await fetch("/api/upload/file", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        return data;
      } catch (err: any) {
        return { error: err.message || "Upload failed" };
      }
    };

    const handleImageChange = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      let newFiles = [...selectedImages, ...files];
      if (newFiles.length > 5) newFiles = newFiles.slice(0, 5);
      setSelectedImages(newFiles);
      setImagePreviewUrls(newFiles.map((file) => URL.createObjectURL(file)));
      onImageSelected && onImageSelected(newFiles);
      // Reset input value so user can re-select the same file if needed
      e.target.value = "";

      // Upload each new file
      setUploading(true);
      const uploads: UploadedImageMeta[] = [];

      // Add loading placeholders
      const loadingPlaceholders = files.map((file) => ({
        url: "",
        name: file.name,
        type: file.type,
        size: file.size,
        width: undefined,
        height: undefined,
        attachment_type: "image" as const,
        attachment_url: "",
        filePath: "",
        localPreviewUrl: URL.createObjectURL(file),
        loading: true,
      }));
      setLoadingImages((prev) => [...prev, ...loadingPlaceholders]);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const localPreviewUrl = loadingPlaceholders[i].localPreviewUrl;
        const data = await uploadImage(file);

        // Update loading image with result
        setLoadingImages((prev) => {
          const idx = prev.findIndex(
            (img) => img.localPreviewUrl === localPreviewUrl && img.loading
          );
          if (idx === -1) return prev;
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            ...data,
            loading: false,
            error: data.error,
          };
          return updated;
        });

        uploads.push({
          ...data,
          localPreviewUrl,
          loading: false,
          error: data.error,
        });
      }
      setUploading(false);

      // Clear loading images and notify parent of successful uploads
      setLoadingImages((prev) =>
        prev.filter((img) => img.loading || img.error)
      );
      onImageUploadComplete &&
        onImageUploadComplete(
          [...uploadedImages, ...uploads].filter(
            (img) => !img.error && img.attachment_url
          )
        );
    };

    const handleRemoveImage = (index: number) => {
      const newFiles = selectedImages.filter((_, i) => i !== index);
      const newUrls = imagePreviewUrls.filter((_, i) => i !== index);
      // Revoke the object URL for the image being removed
      if (imagePreviewUrls[index]) {
        URL.revokeObjectURL(imagePreviewUrls[index]);
      }
      setSelectedImages(newFiles);
      setImagePreviewUrls(newUrls);

      // Remove from uploaded images and notify parent
      const updatedUploadedImages = uploadedImages.filter(
        (_, i) => i !== index
      );
      onImageUploadComplete &&
        onImageUploadComplete(
          updatedUploadedImages.filter(
            (img) => !img.error && img.attachment_url
          )
        );

      onImageSelected && onImageSelected(newFiles);
    };

    const handleFileButtonClick = () => {
      if (selectedImages.length < 5 && !disabled) {
        fileInputRef.current?.click();
      }
    };

    const selectedModelData = modelOptions.find(
      (model) => model.value === selectedModel
    );
    const selectedModelName = selectedModelData?.name || "Select Model";
    const selectedModelLogo = selectedModelData?.logo;
    const selectedModelDisplayName = selectedModelData?.displayName;

    // --- Paste image support ---
    const handlePaste = async (e: React.ClipboardEvent<Element>) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length === 0) return;
      e.preventDefault(); // Prevent default paste behavior for images
      // Limit to 5 images total
      let newFiles = [...selectedImages, ...imageFiles];
      if (newFiles.length > 5) newFiles = newFiles.slice(0, 5);
      setSelectedImages(newFiles);
      setImagePreviewUrls(newFiles.map((file) => URL.createObjectURL(file)));
      onImageSelected && onImageSelected(newFiles);
      // Upload each new file (only the pasted ones)
      setUploading(true);
      const uploads: UploadedImageMeta[] = [];

      // Add loading placeholders
      const pasteLoadingPlaceholders = imageFiles.map((file) => ({
        url: "",
        name: file.name,
        type: file.type,
        size: file.size,
        width: undefined,
        height: undefined,
        attachment_type: "image" as const,
        attachment_url: "",
        filePath: "",
        localPreviewUrl: URL.createObjectURL(file),
        loading: true,
      }));
      setLoadingImages((prev) => [...prev, ...pasteLoadingPlaceholders]);

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const localPreviewUrl = pasteLoadingPlaceholders[i].localPreviewUrl;
        const data = await uploadImage(file);

        // Update loading image with result
        setLoadingImages((prev) => {
          const idx = prev.findIndex(
            (img) => img.localPreviewUrl === localPreviewUrl && img.loading
          );
          if (idx === -1) return prev;
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            ...data,
            loading: false,
            error: data.error,
          };
          return updated;
        });

        uploads.push({
          ...data,
          localPreviewUrl,
          loading: false,
          error: data.error,
        });
      }
      setUploading(false);

      // Clear loading images and notify parent of successful uploads
      setLoadingImages((prev) =>
        prev.filter((img) => img.loading || img.error)
      );
      onImageUploadComplete &&
        onImageUploadComplete(
          [...uploadedImages, ...uploads].filter(
            (img) => !img.error && img.attachment_url
          )
        );
    };
    // --- End paste image support ---

    const isInputDisabled = disabled;

    return (
      <div
        className={`relative group  bg-transparent transition-opacity duration-300 ${
          isInputDisabled
            ? "opacity-50 cursor-not-allowed"
            : "opacity-100 cursor-pointer"
        }`}
      >
        {(uploadedImages.length > 0 || loadingImages.length > 0) && (
          <div className="relative left-2 top-2 z-20 flex items-center gap-2">
            {[...uploadedImages, ...loadingImages].map((img, idx) => (
              <div
                key={idx}
                className="relative w-12 h-12 rounded-md overflow-visible border border-default-300 shadow-md"
              >
                <Image
                  src={img.localPreviewUrl}
                  alt={`Preview ${idx + 1}`}
                  className="object-cover w-12 h-12 rounded-md cursor-pointer opacity-90"
                  onClick={() => setOpenPreviewIdx(idx)}
                ></Image>

                {img.loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                    <Spinner size="sm" />
                  </div>
                )}
                {img.error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-100/80">
                    <span className="text-xs text-red-500">{img.error}</span>
                  </div>
                )}
                <Button
                  isIconOnly
                  size="sm"
                  variant="solid"
                  color="default"
                  radius="full"
                  onPress={() => handleRemoveImage(idx)}
                  className="absolute -top-2 -right-2 scale-75 z-10"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4 text-gray-700" />
                </Button>
              </div>
            ))}
            {/* Modal for enlarged image preview */}
            {typeof openPreviewIdx === "number" && openPreviewIdx >= 0 && (
              <Modal
                isOpen={true}
                onOpenChange={() => setOpenPreviewIdx(undefined)}
                backdrop="blur"
                hideCloseButton
                className="flex items-center justify-center shadow-none"
              >
                <ModalContent className="bg-white/30 sm:bg-transparent overflow-visible p-4">
                  <Tooltip content="Close">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="default"
                      className="hidden sm:flex fixed bg-white/50 top-8 right-8 "
                      onPress={() => setOpenPreviewIdx(undefined)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </Tooltip>

                  <ModalBody className="flex items-center justify-center p-0">
                    <img
                      src={imagePreviewUrls[openPreviewIdx]}
                      alt={`Preview ${openPreviewIdx + 1}`}
                      className="rounded-lg min-w-[90dvw] max-w-[95dvw] sm:min-w-[50dvw] sm:max-w-[80dvw] sm:max-h-[80dvh] w-full object-contain "
                      style={{ cursor: "zoom-out" }}
                    />
                  </ModalBody>
                </ModalContent>
              </Modal>
            )}
          </div>
        )}
        <div
          className={`rounded-lg absolute -inset-1 bg-gradient-to-r from-red-600 to-violet-600 backdrop-blur-xl ${
            theme === "dark"
              ? "opacity-30 group-hover:opacity-30 group-focus:opacity-30"
              : "opacity-10 group-hover:opacity-10 group-focus:opacity-10"
          } transition duration-1000 group-hover:duration-200`}
        />
        <div className=" p-2 relative bg-transparent ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
          <div className="relative w-full">
            <Textarea
              ref={ref}
              classNames={{
                input: `bg-transparent focus:bg-transparent resize-none w-[95%] outline-none focus:outline-none  text-sm ${
                  isInputDisabled ? " cursor-not-allowed" : "opacity-100"
                }`,
                inputWrapper: `bg-transparent data-[hover=true]:bg-transparent focus:outline-none ${
                  isInputDisabled ? " cursor-not-allowed" : "opacity-100"
                }`,
                ...classNames,
              }}
              value={value}
              onValueChange={onValueChange}
              placeholder={placeholder}
              onKeyDown={onKeyDown}
              onPaste={handlePaste}
              endContent={
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {endContent}
                </div>
              }
              variant="underlined"
            />

            <div className="flex items-center justify-start gap-2 mt-2">
              <Tooltip content="Upload image(s)">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    className={`flex rounded-full border border-default-300  ${
                      selectedImages.length > 0
                        ? "bg-primary text-white "
                        : "text-default-500"
                    } transition-colors duration-300`}
                    isDisabled={selectedImages.length >= 5 || disabled}
                    onPress={handleFileButtonClick}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
              </Tooltip>

              <Tooltip content="Image generation">
                <div>
                  <Button
                    onPress={toggleImageGen}
                    isIconOnly
                    size="sm"
                    className={`flex rounded-full border border-default-300  ${
                      isImageGenEnabled
                        ? "bg-primary text-white "
                        : "text-default-500"
                    } transition-colors duration-300`}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </Tooltip>

              <Tooltip content="Web Search">
                <Button
                  onPress={toggleWebSearch}
                  isIconOnly
                  size="sm"
                  className={`flex rounded-full border border-default-300  ${
                    isWebSearchEnabled
                      ? "bg-primary text-white "
                      : "text-default-500"
                  } transition-colors duration-300`}
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </Tooltip>

              {modelOptions.length > 0 && (
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="solid"
                      color="primary"
                      size="sm"
                      radius="full"
                      className="text-xs flex items-center gap-1 border border-default-300"
                    >
                      {selectedModelLogo && (
                        <div className="relative w-4 h-4 mr-1">
                          <img
                            src={selectedModelLogo}
                            alt={selectedModelName}
                            width={16}
                            height={16}
                            className="w-full h-full bg-default-300 rounded-full p-[2px]"
                          />
                        </div>
                      )}
                      {selectedModelName}
                      <span className="text-xs text-gray-400 font-normal leading-tight">
                        {selectedModelDisplayName}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Model Selection"
                    onAction={(key) =>
                      onModelChange && onModelChange(key.toString())
                    }
                  >
                    {modelOptions.map((model) => {
                      // Prefer model.displayName, fallback to value lookup
                      let displayName = model.displayName;
                      if (!displayName && typeof window !== "undefined") {
                        try {
                          // Dynamically import getModelByValue only if needed (should be present in modelOptions ideally)
                          const { getModelByValue } = require("@/lib/models");
                          const found = getModelByValue(model.value);
                          displayName = found?.displayName;
                        } catch {}
                      }
                      return (
                        <DropdownItem
                          key={model.value}
                          className={
                            selectedModel === model.value
                              ? "text-violet-600"
                              : ""
                          }
                          startContent={
                            model.logo && (
                              <div className="relative w-4 h-4 bg-white-300">
                                <Image
                                  src={model.logo}
                                  alt={model.name}
                                  width={16}
                                  height={16}
                                  className="w-full h-full"
                                />
                              </div>
                            )
                          }
                        >
                          <div className="flex flex-col items-start">
                            <span>{model.name}</span>
                            {displayName && (
                              <span className="text-xs text-gray-400 font-normal leading-tight">
                                {displayName}
                              </span>
                            )}
                          </div>
                        </DropdownItem>
                      );
                    })}
                  </DropdownMenu>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
export { ChatInput };
