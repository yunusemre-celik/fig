export interface FileInfo {
  name: string;
  path: string;
  size: number;
  formatted_size: string;
  extension: string;
  width?: number;
  height?: number;
  modified: string;
}

export interface LibraryEntry {
  id: string;
  original_name: string;
  original_path: string;
  output_path: string;
  action: string;
  size_before: number;
  size_after: number;
  timestamp: string;
}

export type TabType = "home" | "documents" | "studio" | "library" | "settings";

export type WheelMode = "convert" | "documents" | "tools" | "actions";

export interface WheelItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  category: WheelMode;
}

export type WheelProfileId = "office" | "design" | "media" | "dev" | "custom";

export interface WheelProfile {
  id: WheelProfileId;
  name: string;
  description: string;
  icon: string;
  items: WheelItem[];
}

export type SupportedLanguage = "en" | "tr" | "es" | "de" | "fr";

export type AppTheme = "system" | "dark" | "light";

export interface AppSettings {
  wheel_display_mode: "center" | "cursor";
  save_as_separate: boolean;
  output_destination: "source" | "desktop" | "downloads";
  vibrancy_effect: string;
  language?: SupportedLanguage;
  theme?: AppTheme;
}
