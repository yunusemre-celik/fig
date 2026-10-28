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

export type TabType = "home" | "library" | "settings";

export type WheelMode = "convert" | "tools" | "actions";

export interface WheelItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  category: WheelMode;
}
