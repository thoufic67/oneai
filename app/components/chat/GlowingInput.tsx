import { Textarea } from "@heroui/react";
import { useTheme } from "next-themes";
import { forwardRef } from "react";

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
    } = props;

    return (
      <div className="relative group cursor-pointer bg-transparent">
        <div
          className={`rounded-lg absolute -inset-1 bg-gradient-to-r from-red-600 to-violet-600 blur ${
            theme === "dark"
              ? "opacity-50 group-hover:opacity-70 group-focus:opacity-70"
              : "opacity-20 group-hover:opacity-30 group-focus:opacity-30"
          } transition duration-1000 group-hover:duration-200`}
        />
        <div className="relative bg-transparent ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
          <div className="relative w-full">
            <Textarea
              ref={ref}
              classNames={{
                input:
                  "bg-transparent focus:bg-transparent resize-none w-[95%]",
                inputWrapper: "bg-transparent data-[hover=true]:bg-transparent",
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
          </div>
        </div>
      </div>
    );
  }
);

GlowingInput.displayName = "GlowingInput";

export default GlowingInput;
export { GlowingInput };
