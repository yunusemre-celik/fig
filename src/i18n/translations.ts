import { SupportedLanguage } from "../types";

export interface TranslationDictionary {
  // Brand & Header
  appName: string;
  brandTagline: string;
  quickWheelHint: string;
  activeWheel: string;

  // Tabs
  tabHome: string;
  tabDocuments: string;
  tabStudio: string;
  tabLibrary: string;
  tabSettings: string;

  // Home Screen
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  dropTitle: string;
  dropSubtitle: string;
  openWheelBtn: string;
  quickWebp: string;
  quickPdf: string;
  quickCrop: string;
  quickQr: string;
  quickSub: string;

  // Action Slices
  sliceWebp: string;
  sliceWebpDesc: string;
  slicePng: string;
  slicePngDesc: string;
  sliceJpg: string;
  sliceJpgDesc: string;
  sliceIco: string;
  sliceIcoDesc: string;
  sliceBmp: string;
  sliceBmpDesc: string;
  sliceGif: string;
  sliceGifDesc: string;
  sliceTiff: string;
  sliceTiffDesc: string;

  sliceCrop: string;
  sliceCropDesc: string;
  sliceCensor: string;
  sliceCensorDesc: string;
  sliceCompress: string;
  sliceCompressDesc: string;
  sliceQr: string;
  sliceQrDesc: string;
  sliceInfo: string;
  sliceInfoDesc: string;

  sliceImgPdf: string;
  sliceImgPdfDesc: string;
  sliceDocxPdf: string;
  sliceDocxPdfDesc: string;
  slicePptxPdf: string;
  slicePptxPdfDesc: string;
  sliceXlsxPdf: string;
  sliceXlsxPdfDesc: string;
  sliceTxtPdf: string;
  sliceTxtPdfDesc: string;
  sliceAllPdf: string;

  sliceExtractAudio: string;
  sliceExtractAudioDesc: string;
  sliceVideoGif: string;
  sliceVideoGifDesc: string;
  sliceVideoMp4: string;
  sliceVideoWebm: string;
  sliceAudioWav: string;
  sliceAudioFlac: string;
  sliceAudioAac: string;

  slicePdfExcel: string;
  slicePdfDocx: string;
  slicePdfTxt: string;
  slicePdfImages: string;

  sliceCopyPath: string;
  sliceReveal: string;
  sliceTerminal: string;

  // Profiles
  profileSmart: string;
  profileOffice: string;
  profileOfficeDesc: string;
  profileDesign: string;
  profileDesignDesc: string;
  profileMedia: string;
  profileMediaDesc: string;
  profileDev: string;
  profileDevDesc: string;
  profileCustom: string;
  profileCustomDesc: string;

  // Image Editor Modal
  cropTab: string;
  censorTab: string;
  aspectRatio: string;
  freeAspect: string;
  blurIntensity: string;
  blurLight: string;
  blurNormal: string;
  blurHeavy: string;
  allImageCensor: string;
  allImageSelected: string;
  selectionArea: string;
  saveModeTitle: string;
  saveSeparate: string;
  saveOverwrite: string;
  saveSeparateHint: string;
  saveOverwriteHint: string;
  alwaysRemember: string;
  alwaysRememberNote: string;
  dragToSelectHint: string;
  cancel: string;
  cropAndSave: string;
  censorAndSave: string;
  processing: string;
  cropBoxTag: string;
  censorBoxTag: string;
  imageLoading: string;

  // Floating Bar & Statuses
  conversionDone: string;
  showInFolder: string;
  openFile: string;
  close: string;
  filesSelected: string;
  fileSelected: string;
  pathCopied: string;
  pathsCopied: string;

  // Settings
  settingsTitle: string;
  settingsDesc: string;
  appearanceSection: string;
  themeLabel: string;
  themeAuto: string;
  themeDark: string;
  themeLight: string;
  languageLabel: string;
  displayModeLabel: string;
  displayCenter: string;
  displayCursor: string;
  savePrefLabel: string;
  autostartLabel: string;
  aboutSection: string;
  version: string;
  madeWith: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  // 1. ENGLISH (Default Global)
  en: {
    appName: "Fig",
    brandTagline: "Apple-inspired minimal file toolkit",
    quickWheelHint: "Quick Wheel at cursor:",
    activeWheel: "Active Wheel:",

    tabHome: "Home",
    tabDocuments: "Documents",
    tabStudio: "Wheel Studio",
    tabLibrary: "History",
    tabSettings: "Settings",

    heroBadge: "Minimalist File Toolkit for Windows",
    heroTitle1: "Your files.",
    heroTitle2: "Simply effortless.",
    heroDesc: "Drop files to convert instantly, or trigger the radial wheel right at your cursor with Ctrl + Space.",
    dropTitle: "Drop files here or click to browse",
    dropSubtitle: "Supports Images, Office documents, PDFs, and Media files",
    openWheelBtn: "Open Radial Wheel",
    quickWebp: "Convert to WebP",
    quickPdf: "Make PDF",
    quickCrop: "Crop & Size",
    quickQr: "QR Code",
    quickSub: "Instant conversion",

    sliceWebp: "WebP",
    sliceWebpDesc: "Fast & modern web format",
    slicePng: "PNG",
    slicePngDesc: "Lossless transparent image",
    sliceJpg: "JPG",
    sliceJpgDesc: "Optimized web photo",
    sliceIco: "ICO Icon",
    sliceIcoDesc: "Windows 256x256 app icon",
    sliceBmp: "BMP",
    sliceBmpDesc: "Standard Windows bitmap",
    sliceGif: "GIF",
    sliceGifDesc: "Image to GIF format",
    sliceTiff: "TIFF",
    sliceTiffDesc: "High-resolution print image",

    sliceCrop: "Crop & Size",
    sliceCropDesc: "Interactive crop with aspect ratios",
    sliceCensor: "Censor / Blur",
    sliceCensorDesc: "Blur sensitive info or faces",
    sliceCompress: "Compress",
    sliceCompressDesc: "Optimize quality & file size",
    sliceQr: "QR Code",
    sliceQrDesc: "Scan or generate QR codes",
    sliceInfo: "File Info",
    sliceInfoDesc: "Dimensions, size & metadata",

    sliceImgPdf: "Image to PDF",
    sliceImgPdfDesc: "Convert images into PDF document",
    sliceDocxPdf: "Word → PDF",
    sliceDocxPdfDesc: "Convert DOCX/DOC to PDF",
    slicePptxPdf: "PPT → PDF",
    slicePptxPdfDesc: "Convert presentation to PDF",
    sliceXlsxPdf: "Excel → PDF",
    sliceXlsxPdfDesc: "Convert spreadsheet to PDF",
    sliceTxtPdf: "Text → PDF",
    sliceTxtPdfDesc: "Convert text or markdown to PDF",
    sliceAllPdf: "Convert All to PDF",

    sliceExtractAudio: "Extract Audio (MP3)",
    sliceExtractAudioDesc: "Extract MP3 track from video",
    sliceVideoGif: "Video to GIF",
    sliceVideoGifDesc: "Create animated GIF from video",
    sliceVideoMp4: "MP4 Video",
    sliceVideoWebm: "WebM Video",
    sliceAudioWav: "WAV Audio",
    sliceAudioFlac: "FLAC Lossless",
    sliceAudioAac: "AAC Audio",

    slicePdfExcel: "PDF → Excel",
    slicePdfDocx: "PDF → Word",
    slicePdfTxt: "PDF → Text",
    slicePdfImages: "Extract Images",

    sliceCopyPath: "Copy Path",
    sliceReveal: "Show in Explorer",
    sliceTerminal: "Open Terminal",

    profileSmart: "Contextual Smart Wheel",
    profileOffice: "Office & Documents",
    profileOfficeDesc: "Word, PowerPoint, Excel and PDF suite",
    profileDesign: "Design & Photo",
    profileDesignDesc: "WebP, PNG, Crop, Censor, and ICO tools",
    profileMedia: "Media & Audio",
    profileMediaDesc: "Video to GIF, audio extraction and formats",
    profileDev: "Developer",
    profileDevDesc: "WebP, QR, Terminal, and file utilities",
    profileCustom: "Custom Profile",
    profileCustomDesc: "Fully customizable action slices",

    cropTab: "Crop",
    censorTab: "Censor / Blur",
    aspectRatio: "Aspect Ratio:",
    freeAspect: "Free",
    blurIntensity: "Blur:",
    blurLight: "Light",
    blurNormal: "Standard",
    blurHeavy: "Strong",
    allImageCensor: "Blur Entire Image",
    allImageSelected: "✓ Entire Image Selected",
    selectionArea: "Selected Area:",
    saveModeTitle: "Save Destination:",
    saveSeparate: "Save as new file",
    saveOverwrite: "Overwrite original file",
    saveSeparateHint: "Original file is preserved, new copy created.",
    saveOverwriteHint: "⚠️ Original file will be overwritten directly.",
    alwaysRemember: "Always save this way",
    alwaysRememberNote: "You can change this preference anytime in Settings.",
    dragToSelectHint: "Click and drag over the image to select the region.",
    cancel: "Cancel",
    cropAndSave: "Crop and Save",
    censorAndSave: "Censor and Save",
    processing: "Processing...",
    cropBoxTag: "Crop Region",
    censorBoxTag: "Censor Region",
    imageLoading: "Loading image preview...",

    conversionDone: "Conversion Complete!",
    showInFolder: "Show in Folder",
    openFile: "Open",
    close: "Close",
    filesSelected: "Files Selected",
    fileSelected: "Selected",
    pathCopied: "Path copied!",
    pathsCopied: "Paths copied!",

    settingsTitle: "Settings & Preferences",
    settingsDesc: "Personalize theme, language, and behavior",
    appearanceSection: "Appearance & Theme",
    themeLabel: "App Theme",
    themeAuto: "System (Automatic)",
    themeDark: "Dark",
    themeLight: "Light",
    languageLabel: "Language",
    displayModeLabel: "Wheel Display Mode",
    displayCenter: "Centered with Frosted Backdrop",
    displayCursor: "Follow Cursor Directly",
    savePrefLabel: "Default Save Mode",
    autostartLabel: "Start on Windows Boot",
    aboutSection: "About Fig",
    version: "Version",
    madeWith: "Crafted with Tauri v2, Rust & React",
  },

  // 2. TURKISH (Original)
  tr: {
    appName: "Fig",
    brandTagline: "Apple sadeliğinde minimal dosya kiti",
    quickWheelHint: "İmleçte Hızlı Çark:",
    activeWheel: "Aktif Çark:",

    tabHome: "Ana Sayfa",
    tabDocuments: "Belgeler",
    tabStudio: "Çark Stüdyosu",
    tabLibrary: "Geçmiş",
    tabSettings: "Ayarlar",

    heroBadge: "Windows için Minimalist Dosya Araç Kiti",
    heroTitle1: "Dosyaların için",
    heroTitle2: "tatlı bir kolaylık.",
    heroDesc: "Dosyaları bırakıp anında dönüştürün veya fare imlecinizin ucundaki çark ile tek tıkla işleyin.",
    dropTitle: "Dosyaları buraya bırakın veya tıklayın",
    dropSubtitle: "Görseller, Ofis belgeleri, PDF ve Medya dosyaları desteklenir",
    openWheelBtn: "İşlem Çarkını Aç",
    quickWebp: "⚡ WebP'ye Çevir",
    quickPdf: "⚡ PDF Yap",
    quickCrop: "Kırp & Boyutla",
    quickQr: "QR Kod",
    quickSub: "Seçilileri dönüştür",

    sliceWebp: "WebP",
    sliceWebpDesc: "Hızlı & modern web formatı",
    slicePng: "PNG",
    slicePngDesc: "Kayıpsız şeffaf görsel",
    sliceJpg: "JPG",
    sliceJpgDesc: "Optimize web fotoğrafı",
    sliceIco: "ICO İkon",
    sliceIcoDesc: "256x256 Windows simgesi",
    sliceBmp: "BMP",
    sliceBmpDesc: "Ham Windows bitmap",
    sliceGif: "GIF",
    sliceGifDesc: "Görselden GIF formatı",
    sliceTiff: "TIFF",
    sliceTiffDesc: "Yüksek kaliteli baskı formatı",

    sliceCrop: "Kırp & Boyutla",
    sliceCropDesc: "Serbest veya oranlı kırpma",
    sliceCensor: "Sansürle / Blur",
    sliceCensorDesc: "Hassas bilgileri buzla",
    sliceCompress: "Sıkıştır",
    sliceCompressDesc: "Kalite & boyut optimizasyonu",
    sliceQr: "QR Kod",
    sliceQrDesc: "QR oku veya üret",
    sliceInfo: "Dosya Bilgisi",
    sliceInfoDesc: "Boyut ve detaylar",

    sliceImgPdf: "Görselden PDF",
    sliceImgPdfDesc: "Görselleri PDF belgesine dönüştür",
    sliceDocxPdf: "Word → PDF",
    sliceDocxPdfDesc: "Word belgesini PDF yap",
    slicePptxPdf: "PPT → PDF",
    slicePptxPdfDesc: "PowerPoint sunumunu PDF yap",
    sliceXlsxPdf: "Excel → PDF",
    sliceXlsxPdfDesc: "Elektronik tabloyu PDF yap",
    sliceTxtPdf: "Metin → PDF",
    sliceTxtPdfDesc: "Metin dosyasını PDF yap",
    sliceAllPdf: "Tümünü PDF Yap",

    sliceExtractAudio: "Sesi Ayıkla (MP3)",
    sliceExtractAudioDesc: "Videodan ses parçasını MP3 çıkar",
    sliceVideoGif: "Videodan GIF",
    sliceVideoGifDesc: "Videoyu kaliteli GIF yap",
    sliceVideoMp4: "MP4 Video",
    sliceVideoWebm: "WebM Video",
    sliceAudioWav: "WAV Ses",
    sliceAudioFlac: "FLAC Kayıpsız",
    sliceAudioAac: "AAC Ses",

    slicePdfExcel: "PDF → Excel",
    slicePdfDocx: "PDF → Word",
    slicePdfTxt: "PDF → Metin",
    slicePdfImages: "Görsellere Ayır",

    sliceCopyPath: "Yolu Kopyala",
    sliceReveal: "Explorer'da Aç",
    sliceTerminal: "Terminalde Aç",

    profileSmart: "Akıllı Çark",
    profileOffice: "Ofis & Belgeler",
    profileOfficeDesc: "Word, PowerPoint, Excel ve PDF araçları",
    profileDesign: "Tasarım & Fotoğraf",
    profileDesignDesc: "WebP, PNG, Kırpma, Sansür ve İkon araçları",
    profileMedia: "Medya & Ses",
    profileMediaDesc: "Video ve ses dönüştürme araçları",
    profileDev: "Geliştirici",
    profileDevDesc: "WebP, QR, Terminal ve Gezgin",
    profileCustom: "Özel Profil",
    profileCustomDesc: "Kullanıcıya özel dilimler",

    cropTab: "Kırp",
    censorTab: "Sansürle / Blur",
    aspectRatio: "En/Boy Oranı:",
    freeAspect: "Serbest",
    blurIntensity: "Bulanıklık:",
    blurLight: "Hafif",
    blurNormal: "Standart",
    blurHeavy: "Güçlü",
    allImageCensor: "Tüm Görseli Sansürle",
    allImageSelected: "✓ Tüm Görsel Seçili",
    selectionArea: "Seçilen Bölge:",
    saveModeTitle: "Kayıt Şekli:",
    saveSeparate: "Ayrı dosya olarak kaydet",
    saveOverwrite: "Orijinal dosyanın üzerine yaz",
    saveSeparateHint: "Orijinal dosya korunur, yeni kopya üretilir.",
    saveOverwriteHint: "⚠️ Orijinal dosya doğrudan değiştirilecektir.",
    alwaysRemember: "Hep bu şekilde kaydet",
    alwaysRememberNote: "Bu tercihi dilediğiniz zaman Ayarlar bölümünden değiştirebilirsiniz.",
    dragToSelectHint: "Fareyle görsel üzerinde sürükleyerek istediğiniz bölgeyi seçebilirsiniz.",
    cancel: "İptal",
    cropAndSave: "Kırp ve Kaydet",
    censorAndSave: "Sansürle ve Kaydet",
    processing: "İşleniyor...",
    cropBoxTag: "Kırpma Alanı",
    censorBoxTag: "Sansür Bölgesi",
    imageLoading: "Görsel Yükleniyor...",

    conversionDone: "Dönüştürme Tamamlandı!",
    showInFolder: "Klasörde Göster",
    openFile: "Aç",
    close: "Kapat",
    filesSelected: "Dosya Seçili",
    fileSelected: "seçili",
    pathCopied: "Yol Kopyalandı!",
    pathsCopied: "Yol Kopyalandı!",

    settingsTitle: "Ayarlar ve Tercihler",
    settingsDesc: "Tema, dil ve çalışma davranışını özelleştirin",
    appearanceSection: "Görünüm & Tema",
    themeLabel: "Uygulama Teması",
    themeAuto: "Sistem (Otomatik)",
    themeDark: "Koyu",
    themeLight: "Açık",
    languageLabel: "Dil (Language)",
    displayModeLabel: "Çark Gösterim Modu",
    displayCenter: "Ekran Ortasında Flu Zeminle",
    displayCursor: "İmlecin Ucunda Aç",
    savePrefLabel: "Varsayılan Kayıt Modu",
    autostartLabel: "Windows Başlangıcında Çalıştır",
    aboutSection: "Fig Hakkında",
    version: "Sürüm",
    madeWith: "Tauri v2, Rust ve React ile geliştirildi",
  },

  // 3. SPANISH (Español)
  es: {
    appName: "Fig",
    brandTagline: "Caja de herramientas de archivos minimalista estilo Apple",
    quickWheelHint: "Rueda rápida en el cursor:",
    activeWheel: "Rueda activa:",

    tabHome: "Inicio",
    tabDocuments: "Documentos",
    tabStudio: "Estudio",
    tabLibrary: "Historial",
    tabSettings: "Ajustes",

    heroBadge: "Caja de herramientas de archivos para Windows",
    heroTitle1: "Tus archivos.",
    heroTitle2: "Simplemente sin esfuerzo.",
    heroDesc: "Arrastra archivos para convertirlos al instante, o abre la rueda en tu cursor con Ctrl + Espacio.",
    dropTitle: "Suelta archivos aquí o haz clic para buscar",
    dropSubtitle: "Compatible con imágenes, documentos de Office, PDF y medios",
    openWheelBtn: "Abrir rueda radial",
    quickWebp: "Convertir a WebP",
    quickPdf: "Crear PDF",
    quickCrop: "Recortar imagen",
    quickQr: "Código QR",
    quickSub: "Conversión instantánea",

    sliceWebp: "WebP",
    sliceWebpDesc: "Formato web rápido y moderno",
    slicePng: "PNG",
    slicePngDesc: "Imagen transparente sin pérdidas",
    sliceJpg: "JPG",
    sliceJpgDesc: "Foto web optimizada",
    sliceIco: "Icono ICO",
    sliceIcoDesc: "Icono de aplicación Windows 256x256",
    sliceBmp: "BMP",
    sliceBmpDesc: "Mapa de bits estándar",
    sliceGif: "GIF",
    sliceGifDesc: "Formato GIF animado",
    sliceTiff: "TIFF",
    sliceTiffDesc: "Imagen de alta resolución",

    sliceCrop: "Recortar y Redimensionar",
    sliceCropDesc: "Recorte interactivo con proporciones",
    sliceCensor: "Censurar / Difuminar",
    sliceCensorDesc: "Oculta datos sensibles o caras",
    sliceCompress: "Comprimir",
    sliceCompressDesc: "Optimiza calidad y tamaño",
    sliceQr: "Código QR",
    sliceQrDesc: "Lee o genera códigos QR",
    sliceInfo: "Información",
    sliceInfoDesc: "Dimensiones, peso y metadatos",

    sliceImgPdf: "Imagen a PDF",
    sliceImgPdfDesc: "Convierte imágenes en PDF",
    sliceDocxPdf: "Word → PDF",
    sliceDocxPdfDesc: "Convierte DOCX/DOC a PDF",
    slicePptxPdf: "PPT → PDF",
    slicePptxPdfDesc: "Convierte presentaciones a PDF",
    sliceXlsxPdf: "Excel → PDF",
    sliceXlsxPdfDesc: "Convierte hojas de cálculo a PDF",
    sliceTxtPdf: "Texto → PDF",
    sliceTxtPdfDesc: "Convierte texto plano a PDF",
    sliceAllPdf: "Convertir todo a PDF",

    sliceExtractAudio: "Extraer audio (MP3)",
    sliceExtractAudioDesc: "Extrae pista MP3 de vídeo",
    sliceVideoGif: "Vídeo a GIF",
    sliceVideoGifDesc: "Crea GIF animado desde vídeo",
    sliceVideoMp4: "Vídeo MP4",
    sliceVideoWebm: "Vídeo WebM",
    sliceAudioWav: "Audio WAV",
    sliceAudioFlac: "FLAC sin pérdidas",
    sliceAudioAac: "Audio AAC",

    slicePdfExcel: "PDF → Excel",
    slicePdfDocx: "PDF → Word",
    slicePdfTxt: "PDF → Texto",
    slicePdfImages: "Extraer imágenes",

    sliceCopyPath: "Copiar ruta",
    sliceReveal: "Mostrar en explorador",
    sliceTerminal: "Abrir terminal",

    profileSmart: "Rueda contextual inteligente",
    profileOffice: "Oficina y Documentos",
    profileOfficeDesc: "Herramientas de Word, Excel, PPT y PDF",
    profileDesign: "Diseño y Foto",
    profileDesignDesc: "WebP, PNG, Recorte, Censura e Iconos",
    profileMedia: "Medios y Audio",
    profileMediaDesc: "Vídeo a GIF y extracción de audio",
    profileDev: "Desarrollador",
    profileDevDesc: "WebP, QR, Terminal y utilidades",
    profileCustom: "Perfil personalizado",
    profileCustomDesc: "Rueda de acciones a tu medida",

    cropTab: "Recortar",
    censorTab: "Censurar / Difuminar",
    aspectRatio: "Proporción:",
    freeAspect: "Libre",
    blurIntensity: "Intensidad:",
    blurLight: "Ligera",
    blurNormal: "Estándar",
    blurHeavy: "Fuerte",
    allImageCensor: "Difuminar toda la imagen",
    allImageSelected: "✓ Toda la imagen seleccionada",
    selectionArea: "Área seleccionada:",
    saveModeTitle: "Destino de guardado:",
    saveSeparate: "Guardar como archivo nuevo",
    saveOverwrite: "Sobrescribir archivo original",
    saveSeparateHint: "El original se conserva y se crea una copia.",
    saveOverwriteHint: "⚠️ El archivo original se reemplazará directamente.",
    alwaysRemember: "Guardar siempre de esta forma",
    alwaysRememberNote: "Puedes cambiar esta preferencia en Ajustes en cualquier momento.",
    dragToSelectHint: "Haz clic y arrastra sobre la imagen para seleccionar.",
    cancel: "Cancelar",
    cropAndSave: "Recortar y Guardar",
    censorAndSave: "Censurar y Guardar",
    processing: "Procesando...",
    cropBoxTag: "Zona de recorte",
    censorBoxTag: "Zona censurada",
    imageLoading: "Cargando vista previa...",

    conversionDone: "¡Conversión completada!",
    showInFolder: "Mostrar en carpeta",
    openFile: "Abrir",
    close: "Cerrar",
    filesSelected: "Archivos seleccionados",
    fileSelected: "seleccionado",
    pathCopied: "¡Ruta copiada!",
    pathsCopied: "¡Rutas copiadas!",

    settingsTitle: "Ajustes y Preferencias",
    settingsDesc: "Personaliza tema, idioma y comportamiento",
    appearanceSection: "Apariencia y Tema",
    themeLabel: "Tema de la aplicación",
    themeAuto: "Sistema (Automático)",
    themeDark: "Oscuro",
    themeLight: "Claro",
    languageLabel: "Idioma (Language)",
    displayModeLabel: "Modo de visualización de rueda",
    displayCenter: "Centrado con fondo difuminado",
    displayCursor: "Seguir directamente el cursor",
    savePrefLabel: "Modo de guardado predeterminado",
    autostartLabel: "Iniciar con Windows",
    aboutSection: "Acerca de Fig",
    version: "Versión",
    madeWith: "Creado con Tauri v2, Rust y React",
  },

  // 4. GERMAN (Deutsch)
  de: {
    appName: "Fig",
    brandTagline: "Minimalistisches Datei-Toolkit im Apple-Stil",
    quickWheelHint: "Schnellrad am Zeiger:",
    activeWheel: "Aktives Rad:",

    tabHome: "Start",
    tabDocuments: "Dokumente",
    tabStudio: "Rad-Studio",
    tabLibrary: "Verlauf",
    tabSettings: "Einstellungen",

    heroBadge: "Minimalistisches Datei-Toolkit für Windows",
    heroTitle1: "Ihre Dateien.",
    heroTitle2: "Ganz mühelos.",
    heroDesc: "Dateien ablegen und sofort konvertieren oder das Radialrad direkt am Mauszeiger mit Strg + Leertaste öffnen.",
    dropTitle: "Dateien hier ablegen oder klicken",
    dropSubtitle: "Unterstützt Bilder, Office-Dokumente, PDFs und Mediendateien",
    openWheelBtn: "Aktionsrad öffnen",
    quickWebp: "In WebP konvertieren",
    quickPdf: "PDF erstellen",
    quickCrop: "Zuschneiden",
    quickQr: "QR-Code",
    quickSub: "Sofortige Konvertierung",

    sliceWebp: "WebP",
    sliceWebpDesc: "Schnelles, modernes Webformat",
    slicePng: "PNG",
    slicePngDesc: "Verlustfreies transparentes Bild",
    sliceJpg: "JPG",
    sliceJpgDesc: "Optimiertes Webfoto",
    sliceIco: "ICO-Symbol",
    sliceIcoDesc: "Windows-App-Symbol (256x256)",
    sliceBmp: "BMP",
    sliceBmpDesc: "Standard-Windows-Bitmap",
    sliceGif: "GIF",
    sliceGifDesc: "Bild in GIF-Format",
    sliceTiff: "TIFF",
    sliceTiffDesc: "Hochauflösendes Druckbild",

    sliceCrop: "Zuschneiden & Skalieren",
    sliceCropDesc: "Interaktives Zuschneiden mit Seitenverhältnissen",
    sliceCensor: "Zensieren / Weichzeichnen",
    sliceCensorDesc: "Sensible Daten oder Gesichter verpixeln",
    sliceCompress: "Komprimieren",
    sliceCompressDesc: "Qualität und Dateigröße optimieren",
    sliceQr: "QR-Code",
    sliceQrDesc: "QR-Codes lesen oder generieren",
    sliceInfo: "Datei-Info",
    sliceInfoDesc: "Abmessungen, Größe & Metadaten",

    sliceImgPdf: "Bild zu PDF",
    sliceImgPdfDesc: "Bilder in PDF-Dokument umwandeln",
    sliceDocxPdf: "Word → PDF",
    sliceDocxPdfDesc: "DOCX/DOC in PDF umwandeln",
    slicePptxPdf: "PPT → PDF",
    slicePptxPdfDesc: "Präsentation in PDF umwandeln",
    sliceXlsxPdf: "Excel → PDF",
    sliceXlsxPdfDesc: "Tabelle in PDF umwandeln",
    sliceTxtPdf: "Text → PDF",
    sliceTxtPdfDesc: "Textdatei in PDF umwandeln",
    sliceAllPdf: "Alle in PDF umwandeln",

    sliceExtractAudio: "Audio extrahieren (MP3)",
    sliceExtractAudioDesc: "MP3-Spur aus Video extrahieren",
    sliceVideoGif: "Video zu GIF",
    sliceVideoGifDesc: "Animiertes GIF aus Video erstellen",
    sliceVideoMp4: "MP4-Video",
    sliceVideoWebm: "WebM-Video",
    sliceAudioWav: "WAV-Audio",
    sliceAudioFlac: "FLAC Verlustfrei",
    sliceAudioAac: "AAC-Audio",

    slicePdfExcel: "PDF → Excel",
    slicePdfDocx: "PDF → Word",
    slicePdfTxt: "PDF → Text",
    slicePdfImages: "Bilder extrahieren",

    sliceCopyPath: "Pfad kopieren",
    sliceReveal: "Im Explorer anzeigen",
    sliceTerminal: "Terminal öffnen",

    profileSmart: "Kontextuelles Aktionsrad",
    profileOffice: "Büro & Dokumente",
    profileOfficeDesc: "Word, Excel, PPT und PDF-Suite",
    profileDesign: "Design & Foto",
    profileDesignDesc: "WebP, PNG, Zuschnitt, Zensur und Icons",
    profileMedia: "Medien & Audio",
    profileMediaDesc: "Video zu GIF und Audioextraktion",
    profileDev: "Entwickler",
    profileDevDesc: "WebP, QR, Terminal und Werkzeuge",
    profileCustom: "Benutzerdefiniert",
    profileCustomDesc: "Individuell angepasste Aktionen",

    cropTab: "Zuschneiden",
    censorTab: "Zensieren / Blur",
    aspectRatio: "Seitenverhältnis:",
    freeAspect: "Frei",
    blurIntensity: "Stärke:",
    blurLight: "Leicht",
    blurNormal: "Standard",
    blurHeavy: "Stark",
    allImageCensor: "Gesamtes Bild verwischen",
    allImageSelected: "✓ Gesamtes Bild ausgewählt",
    selectionArea: "Ausgewählter Bereich:",
    saveModeTitle: "Speicherort:",
    saveSeparate: "Als neue Datei speichern",
    saveOverwrite: "Originaldatei überschreiben",
    saveSeparateHint: "Original bleibt erhalten, Kopie wird erstellt.",
    saveOverwriteHint: "⚠️ Originaldatei wird direkt überschrieben.",
    alwaysRemember: "Immer so speichern",
    alwaysRememberNote: "Sie können diese Einstellung jederzeit in den Einstellungen ändern.",
    dragToSelectHint: "Klicken und ziehen, um den Bereich auszuwählen.",
    cancel: "Abbrechen",
    cropAndSave: "Zuschneiden und Speichern",
    censorAndSave: "Zensieren und Speichern",
    processing: "Wird verarbeitet...",
    cropBoxTag: "Zuschnittbereich",
    censorBoxTag: "Zensierter Bereich",
    imageLoading: "Bildvorschau wird geladen...",

    conversionDone: "Konvertierung abgeschlossen!",
    showInFolder: "Im Ordner anzeigen",
    openFile: "Öffnen",
    close: "Schließen",
    filesSelected: "Dateien ausgewählt",
    fileSelected: "ausgewählt",
    pathCopied: "Pfad kopiert!",
    pathsCopied: "Pfade kopiert!",

    settingsTitle: "Einstellungen & Optionen",
    settingsDesc: "Design, Sprache und Verhalten anpassen",
    appearanceSection: "Erscheinungsbild & Design",
    themeLabel: "App-Design",
    themeAuto: "System (Automatisch)",
    themeDark: "Dunkel",
    themeLight: "Hell",
    languageLabel: "Sprache (Language)",
    displayModeLabel: "Rad-Anzeigemodus",
    displayCenter: "Zentriert mit Weichzeichnung",
    displayCursor: "Direkt am Mauszeiger",
    savePrefLabel: "Standard-Speichermodus",
    autostartLabel: "Mit Windows starten",
    aboutSection: "Über Fig",
    version: "Version",
    madeWith: "Entwickelt mit Tauri v2, Rust & React",
  },

  // 5. FRENCH (Français)
  fr: {
    appName: "Fig",
    brandTagline: "Boîte à outils de fichiers minimaliste façon Apple",
    quickWheelHint: "Roue rapide au curseur :",
    activeWheel: "Roue active :",

    tabHome: "Accueil",
    tabDocuments: "Documents",
    tabStudio: "Studio",
    tabLibrary: "Historique",
    tabSettings: "Paramètres",

    heroBadge: "Boîte à outils de fichiers minimaliste pour Windows",
    heroTitle1: "Vos fichiers.",
    heroTitle2: "Tout simplement sans effort.",
    heroDesc: "Déposez vos fichiers pour les convertir instantanément ou déclenchez la roue radiale directement au curseur avec Ctrl + Espace.",
    dropTitle: "Déposez les fichiers ici ou cliquez",
    dropSubtitle: "Prend en charge images, documents Office, PDF et fichiers multimédias",
    openWheelBtn: "Ouvrir la roue d'actions",
    quickWebp: "Convertir en WebP",
    quickPdf: "Créer un PDF",
    quickCrop: "Rogner l'image",
    quickQr: "Code QR",
    quickSub: "Conversion instantanée",

    sliceWebp: "WebP",
    sliceWebpDesc: "Format web rapide et moderne",
    slicePng: "PNG",
    slicePngDesc: "Image transparente sans perte",
    sliceJpg: "JPG",
    sliceJpgDesc: "Photo web optimisée",
    sliceIco: "Icône ICO",
    sliceIcoDesc: "Icône d'application Windows 256x256",
    sliceBmp: "BMP",
    sliceBmpDesc: "Bitmap Windows standard",
    sliceGif: "GIF",
    sliceGifDesc: "Format d'image GIF",
    sliceTiff: "TIFF",
    sliceTiffDesc: "Image haute résolution pour impression",

    sliceCrop: "Rogner & Redimensionner",
    sliceCropDesc: "Rognage interactif avec proportions",
    sliceCensor: "Flouter / Censurer",
    sliceCensorDesc: "Masquez données sensibles ou visages",
    sliceCompress: "Compresser",
    sliceCompressDesc: "Optimisez la qualité et la taille",
    sliceQr: "Code QR",
    sliceQrDesc: "Lisez ou créez des codes QR",
    sliceInfo: "Informations",
    sliceInfoDesc: "Dimensions, poids et métadonnées",

    sliceImgPdf: "Image en PDF",
    sliceImgPdfDesc: "Convertissez les images en document PDF",
    sliceDocxPdf: "Word → PDF",
    sliceDocxPdfDesc: "Convertissez DOCX/DOC en PDF",
    slicePptxPdf: "PPT → PDF",
    slicePptxPdfDesc: "Convertissez présentations en PDF",
    sliceXlsxPdf: "Excel → PDF",
    sliceXlsxPdfDesc: "Convertissez feuilles de calcul en PDF",
    sliceTxtPdf: "Texte → PDF",
    sliceTxtPdfDesc: "Convertissez texte brut en PDF",
    sliceAllPdf: "Tout convertir en PDF",

    sliceExtractAudio: "Extraire l'audio (MP3)",
    sliceExtractAudioDesc: "Extrayez la piste audio MP3 d'une vidéo",
    sliceVideoGif: "Vidéo en GIF",
    sliceVideoGifDesc: "Créez un GIF animé à partir d'une vidéo",
    sliceVideoMp4: "Vidéo MP4",
    sliceVideoWebm: "Vidéo WebM",
    sliceAudioWav: "Audio WAV",
    sliceAudioFlac: "FLAC sans perte",
    sliceAudioAac: "Audio AAC",

    slicePdfExcel: "PDF → Excel",
    slicePdfDocx: "PDF → Word",
    slicePdfTxt: "PDF → Texte",
    slicePdfImages: "Extraire les images",

    sliceCopyPath: "Copier le chemin",
    sliceReveal: "Afficher dans l'Explorateur",
    sliceTerminal: "Ouvrir le terminal",

    profileSmart: "Roue contextuelle intelligente",
    profileOffice: "Bureautique & Documents",
    profileOfficeDesc: "Outils Word, Excel, PPT et PDF",
    profileDesign: "Design & Photo",
    profileDesignDesc: "WebP, PNG, Rognage, Floutage et Icônes",
    profileMedia: "Médias & Audio",
    profileMediaDesc: "Vidéo en GIF et extraction audio",
    profileDev: "Développeur",
    profileDevDesc: "WebP, QR, Terminal et utilitaires",
    profileCustom: "Profil personnalisé",
    profileCustomDesc: "Roue d'actions sur mesure",

    cropTab: "Rogner",
    censorTab: "Flouter / Censurer",
    aspectRatio: "Proportions :",
    freeAspect: "Libre",
    blurIntensity: "Intensité :",
    blurLight: "Léger",
    blurNormal: "Standard",
    blurHeavy: "Fort",
    allImageCensor: "Flouter toute l'image",
    allImageSelected: "✓ Toute l'image sélectionnée",
    selectionArea: "Zone sélectionnée :",
    saveModeTitle: "Enregistrement :",
    saveSeparate: "Enregistrer sous un nouveau fichier",
    saveOverwrite: "Écraser le fichier d'origine",
    saveSeparateHint: "Le fichier original est conservé, une copie est créée.",
    saveOverwriteHint: "⚠️ Le fichier original sera directement remplacé.",
    alwaysRemember: "Toujours enregistrer de cette façon",
    alwaysRememberNote: "Vous pouvez modifier cette préférence à tout moment dans les Paramètres.",
    dragToSelectHint: "Cliquez et glissez sur l'image pour sélectionner la zone.",
    cancel: "Annuler",
    cropAndSave: "Rogner et Enregistrer",
    censorAndSave: "Flouter et Enregistrer",
    processing: "Traitement en cours...",
    cropBoxTag: "Zone de rognage",
    censorBoxTag: "Zone floutée",
    imageLoading: "Chargement de l'aperçu...",

    conversionDone: "Conversion terminée !",
    showInFolder: "Afficher dans le dossier",
    openFile: "Ouvrir",
    close: "Fermer",
    filesSelected: "fichiers sélectionnés",
    fileSelected: "sélectionné",
    pathCopied: "Chemin copié !",
    pathsCopied: "Chemins copiés !",

    settingsTitle: "Paramètres & Préférences",
    settingsDesc: "Personnalisez thème, langue et comportement",
    appearanceSection: "Apparence & Thème",
    themeLabel: "Thème de l'application",
    themeAuto: "Système (Automatique)",
    themeDark: "Sombre",
    themeLight: "Clair",
    languageLabel: "Langue (Language)",
    displayModeLabel: "Mode d'affichage de la roue",
    displayCenter: "Centré avec arrière-plan flouté",
    displayCursor: "Suivre directement le curseur",
    savePrefLabel: "Mode d'enregistrement par défaut",
    autostartLabel: "Démarrer avec Windows",
    aboutSection: "À propos de Fig",
    version: "Version",
    madeWith: "Conçu avec Tauri v2, Rust & React",
  },
};
