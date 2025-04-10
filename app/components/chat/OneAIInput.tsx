import {
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Chip,
} from "@heroui/react";
import { useTheme } from "next-themes";
import { forwardRef, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import Image from "next/image";

interface ModelOption {
  name: string;
  value: string;
  logo?: string;
}

interface OneAIInputProps {
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
  modelOptions?: ModelOption[];
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

const OneAIInput = forwardRef<HTMLTextAreaElement, OneAIInputProps>(
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
      modelOptions = [],
      selectedModel,
      onModelChange,
    } = props;

    const [isWebSearchEnabled, setIsWebSearchEnabled] =
      useState(webSearchEnabled);

    const toggleWebSearch = () => {
      const newState = !isWebSearchEnabled;
      setIsWebSearchEnabled(newState);
      if (onWebSearchToggle) {
        onWebSearchToggle(newState);
      }
    };

    const selectedModelData = modelOptions.find(
      (model) => model.value === selectedModel
    );
    const selectedModelName = selectedModelData?.name || "Select Model";
    const selectedModelLogo = selectedModelData?.logo;

    return (
      <div className="relative group cursor-pointer bg-transparent">
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
                input:
                  "bg-transparent focus:bg-transparent resize-none w-[95%] outline-none focus:outline-none text-base",
                inputWrapper:
                  "bg-transparent data-[hover=true]:bg-transparent focus:outline-none",
                ...classNames,
              }}
              value={value}
              onValueChange={onValueChange}
              disabled={disabled}
              placeholder={placeholder}
              onKeyDown={onKeyDown}
              endContent={
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {endContent}
                </div>
              }
              variant="underlined"
            />

            {/* Search and Model Options */}
            <div className="flex items-center justify-start gap-2 mt-2">
              <button
                onClick={toggleWebSearch}
                className={`flex items-center space-x-1 rounded-full px-3 py-[7px] text-xs border border-default-300  ${
                  isWebSearchEnabled
                    ? "bg-primary text-white "
                    : "text-default-500"
                } transition-colors duration-300`}
                type="button"
              >
                <Search className="h-3 w-3" />
                <span>Web search</span>
              </button>

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
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Model Selection"
                    onAction={(key) =>
                      onModelChange && onModelChange(key.toString())
                    }
                  >
                    {modelOptions.map((model) => (
                      <DropdownItem
                        key={model.value}
                        className={
                          selectedModel === model.value ? "text-violet-600" : ""
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
                        {model.name}
                      </DropdownItem>
                    ))}
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

OneAIInput.displayName = "OneAIInput";

export default OneAIInput;
export { OneAIInput };
