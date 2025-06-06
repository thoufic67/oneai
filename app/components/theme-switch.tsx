import { useTheme } from "next-themes";
import { Button } from "@heroui/button";
import { MoonIcon } from "lucide-react";
import { SunIcon } from "lucide-react";
import { Tooltip } from "@heroui/react";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <Tooltip content={theme === "light" ? "Dark Mode" : "Light Mode"}>
      <Button
        size="sm"
        isIconOnly
        variant="ghost"
        aria-label="Toggle theme"
        radius="full"
        onPress={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
      </Button>
    </Tooltip>
  );
}
