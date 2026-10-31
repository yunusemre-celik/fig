export interface SiteConfig {
  downloadUrl: string;
  githubRepoUrl: string;
  githubProfileUrl: string;
  websiteUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  contactEmail: string;
}

export const siteConfig: SiteConfig = {
  // Fig project repo & direct GitHub Releases download package (Bypasses Chrome Safe Browsing warnings)
  downloadUrl: "https://github.com/yunusemre-celik/fig/releases/latest/download/Fig-Windows-x64.zip",
  githubRepoUrl: "https://github.com/yunusemre-celik/fig",

  // Personal profiles
  githubProfileUrl: "https://github.com/yunusemre-celik",
  instagramUrl: "https://instagram.com/yunusemrecelik.dev",
  websiteUrl: "https://yunusemrecelik.dev",
  linkedinUrl: "https://www.linkedin.com/in/yunusemrecelik00/",
  twitterUrl: "https://x.com/hirtzirt",
  contactEmail: "mailto:yunusemre.celik@std.antalya.edu.tr",
};
