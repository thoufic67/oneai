import {
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { useTheme } from "next-themes";
import { forwardRef, useState } from "react";
import { Search, ChevronDown } from "lucide-react";

interface ModelOption {
  name: string;
  value: string;
}

interface GlowingInputProps {
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

const GlowingInput = forwardRef<HTMLTextAreaElement, GlowingInputProps>(
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

    const selectedModelName =
      modelOptions.find((model) => model.value === selectedModel)?.name ||
      "Select Model";

    return (
      <div className="relative group cursor-pointer bg-transparent">
        <div
          className={`shadow-lg rounded-lg absolute -inset-1 bg-gradient-to-r from-red-600 to-violet-600 backdrop-blur-xl ${
            theme === "dark"
              ? "opacity-30 group-hover:opacity-30 group-focus:opacity-30"
              : "opacity-10 group-hover:opacity-10 group-focus:opacity-10"
          } transition duration-1000 group-hover:duration-200`}
        />
        <div className="relative bg-transparent ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
          <div className="relative w-full">
            <Textarea
              ref={ref}
              classNames={{
                input:
                  "bg-transparent focus:bg-transparent resize-none w-[95%] outline-none focus:outline-none",
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
              variant="faded"
            />

            {/* Search and Model Options */}
            <div className="flex items-center justify-start gap-2 mt-2">
              <button
                onClick={toggleWebSearch}
                className={`flex items-center space-x-1 rounded-full px-3 py-2 text-xs border border-gray-300  ${
                  isWebSearchEnabled
                    ? "bg-violet-600 text-white "
                    : "bdark:border-gray-800 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
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
                      variant="flat"
                      color="secondary"
                      size="sm"
                      radius="full"
                      className="text-xs flex items-center gap-1"
                    >
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

GlowingInput.displayName = "GlowingInput";

export default GlowingInput;
export { GlowingInput };
