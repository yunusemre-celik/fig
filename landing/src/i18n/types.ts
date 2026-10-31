export type SupportedLanguage = 'tr' | 'en' | 'es' | 'de' | 'fr';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
}

export interface LandingTranslations {
  nav: {
    github: string;
    home: string;
    contact: string;
    language: string;
  };
  sectionHome: {
    titlePart1: string;
    titlePart2: string;
    ctaDownload: string;
    portableTag: string;
    smartScreenTip: string;
    subtextPrefix: string;
    subtextWavy: string;
    subtextPill: string;
    cardFig: string;
    cardMenu: {
      title: string;
      item1: string;
      item2: string;
      item3: string;
    };
    cardDetails: string;
    cardWatch: string;
    cardW11: {
      badge: string;
      title: string;
      subtitle: string;
    };
  };
  sectionTwo: {
    titlePrefix: string;
    titleHighlight: string;
    description: string;
    shortcutHint: string;
    noteTitle: string;
    notePill: string;
    noteBody: string;
    tagOffline: string;
    tagPrivacy: string;
  };
  sectionThree: {
    titlePart1: string;
    titleHighlight: string;
    titlePart2: string;
    description: string;
    slides: {
      slide1: {
        title: string;
        sub: string;
        actionTitle: string;
        features: string[];
      };
      slide2: {
        title: string;
        sub: string;
        actionTitle: string;
        features: string[];
      };
      slide3: {
        title: string;
        sub: string;
        actionTitle: string;
        features: string[];
      };
    };
    formats: {
      images: string;
      docs: string;
      media: string;
      compress: string;
      system: string;
    };
  };
  sectionFour: {
    desktopFiles: {
      explore: string;
      culture: string;
      exam: string;
      city: string;
      coffee: string;
      assignment: string;
      figShortcut: string;
    };
    noteTitle: string;
    noteHighlight: string;
    noteDescription: string;
    pillOffline: string;
    pillBatch: string;
  };
  sectionFive: {
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    description1: string;
    description2: string;
    viewCardTag: string;
    checklistTitle: string;
    checklistSubtitle: string;
    items: string[];
  };
  sectionSix: {
    ctaDownload: string;
    portableTag: string;
    smartScreenTip: string;
    badgeOpenSource: string;
    creatorTag: string;
    creatorBio: string;
    socialTitles: {
      website: string;
      github: string;
      linkedin: string;
      instagram: string;
      twitter: string;
    };
    footerNote: string;
  };
  appleNote: {
    share: string;
    more: string;
  };
  dots: {
    section0: string;
    section1: string;
    section2: string;
    section3: string;
    section4: string;
    section5: string;
  };
}
