// app/components/settings/SettingsTab.tsx
// Settings tab for the settings page: shows voice and language settings (UI only for now).
import { Button } from "@heroui/button";
import React from "react";

const SettingsTab: React.FC = () => {
  return (
    <section
      key="settings"
      className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 mb-8 animate-blur-in-down-x"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Voice</h3>
        <div className="flex items-center gap-4">
          <Button
            className="transition-all duration-200 hover:scale-110"
            size="sm"
            variant="ghost"
          >
            Play
          </Button>
          <Button
            className="transition-all duration-200 hover:scale-110"
            size="sm"
            variant="bordered"
          >
            Sol
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Main Language</span>
        <Button
          className="transition-all duration-200 hover:scale-110"
          size="sm"
          variant="bordered"
        >
          Auto-Detect
        </Button>
      </div>
      <p className="text-gray-500 text-sm mt-2">
        For best results, select the language you mainly speak. If it&apos;s not
        listed, it may still be supported via auto-detection.
      </p>
    </section>
  );
};

export default SettingsTab;
