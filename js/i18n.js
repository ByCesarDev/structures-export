const I18N = {
  es: {
    // Header & Badges
    version: "v1.0.0",
    langCode: "ES",
    langName: "Español",

    // Banner
    eyebrow: "MULTIWORLD & BEDROCK",
    title: "WORLD STRUCTURE EXPORTER",
    desc: "Sube tu mundo de Minecraft Bedrock Edition (.mcworld / .zip) para extraer automáticamente las estructuras normales y plantillas de mapas de MultiWorld (/export y /load) guardadas en LevelDB como archivos .mcstructure.",
    searchPlaceholder: "Buscar por nombre...",
    btnDownloadAll: "Descargar Todas (ZIP)",
    btnReset: "Cargar Otro Mundo",
    btnSoloMwOn: "Solo MW: ON",
    btnSoloMwOff: "Solo MW: OFF",
    btnFilters: "Filtros",
    btnClose: "Cerrar",

    // Dragzone
    dropzoneTitle: "Arrastra y suelta tu archivo .mcworld o .zip aquí",
    dropzoneSubtitle: "O haz clic para examinar los archivos de tu equipo",
    dropzoneBtn: "Seleccionar Mundo (.mcworld)",
    processingFile: "Procesando archivo...",

    // Results Header
    structuresFound: "Estructuras Encontradas",

    // Cards
    templatePrefix: "Plantilla:",
    badgeMwTemplate: "MULTIWORLD TEMPLATE",
    revisionPrefix: "REVISIÓN:",
    statChunksLabel: "Trozos de Mapa (Chunks)",
    statChunksValue: "{count} fragmentos",
    statChunksSingleValue: "{count} fragmento",
    statVolumeLabel: "Volumen Acumulado",
    statVolumeSingleLabel: "Volumen Total",
    statVolumeValue: "{volume} bloques",
    statMaxDimLabel: "Dimensión Máx por Trozo",
    statDimSingleLabel: "Dimensiones",
    statMetaDbLabel: "Metadatos en LevelDB",
    statBlockTypesLabel: "Tipos de Bloque",
    statEntitiesLabel: "Entidades",
    statMetaPresent: "Presentes",
    statMetaNotDetected: "No detectados",

    // Action Buttons
    btnDownloadZip: "Descargar Mapa (.zip)",
    btnMcstructure: ".mcstructure",
    btnRawData: "Raw Data ({count})",

    // Raw Data Items
    rawBadgeMeta: "⚙ METADATOS",
    rawBadgeChunk: "🧩 CHUNK",
    rawBadgeMap: "🗺️ ESTRUCTURA",
    rawMetaTitle: "Metadatos del Mapa (LevelDB)",
    rawChunkTitle: "Fragmento de Estructura {coords}",

    // Empty State
    emptyMwTitle: "No se encontraron estructuras de MultiWorld",
    emptyAllTitle: "No se encontraron estructuras guardadas",
    emptyMwDesc: 'Desactiva el filtro "Solo MW" para ver todas las estructuras del mundo.',
    emptyAllDesc: "Asegúrate de haber guardado al menos una estructura con un Bloque de Estructura, /structure save o /export en MultiWorld.",
    btnLogs: "Ver Registro de Diagnóstico",

    // Info Section
    infoEyebrow: "GUÍA Y FUNCIONAMIENTO",
    infoMainTitle: "¿Cómo funciona la extracción para MultiWorld?",
    info1Title: "Integración con MultiWorld",
    info1Desc: "Detecta automáticamente los mapas exportados con el comando /export <nombre> de MultiWorld guardados en LevelDB (prefijos multiworld: y fragmentos de mapa).",
    info2Title: "Vista 2 Columnas & Raw Data",
    info2Desc: "Al activar el modo Solo MW, las estructuras se organizan en un grid de 2 columnas alternando acentos púrpura y cyan con acceso a Raw Data.",
    info3Title: "Exportación e Importación /load",
    info3Desc: "Genera archivos .mcstructure estándar compatibles con el comando /load <mundo> <nombre> de MultiWorld.",

    // Footer & Sidebar
    sidebarExtractor: "Extractor de Mundos",
    sidebarFooterCopy: "Hecho con ❤️ para Minecraft<br/>Bedrock Edition",
    footerText: "MultiWorld Structure Exporter  •  Compatible con Minecraft Bedrock Edition 1.20+"
  },
  en: {
    // Header & Badges
    version: "v1.0.0",
    langCode: "EN",
    langName: "English",

    // Banner
    eyebrow: "MULTIWORLD & BEDROCK",
    title: "WORLD STRUCTURE EXPORTER",
    desc: "Upload your Minecraft Bedrock Edition world (.mcworld / .zip) to automatically extract normal structures and MultiWorld map templates (/export & /load) saved in LevelDB as .mcstructure files.",
    searchPlaceholder: "Search by name...",
    btnDownloadAll: "Download All (ZIP)",
    btnReset: "Load Another World",
    btnSoloMwOn: "Only MW: ON",
    btnSoloMwOff: "Only MW: OFF",
    btnFilters: "Filters",
    btnClose: "Close",

    // Dragzone
    dropzoneTitle: "Drag and drop your .mcworld or .zip file here",
    dropzoneSubtitle: "Or click to browse files on your device",
    dropzoneBtn: "Select World (.mcworld)",
    processingFile: "Processing file...",

    // Results Header
    structuresFound: "Structures Found",

    // Cards
    templatePrefix: "Template:",
    badgeMwTemplate: "MULTIWORLD TEMPLATE",
    revisionPrefix: "REVISION:",
    statChunksLabel: "Map Chunks",
    statChunksValue: "{count} chunks",
    statChunksSingleValue: "{count} chunk",
    statVolumeLabel: "Accumulated Volume",
    statVolumeSingleLabel: "Total Volume",
    statVolumeValue: "{volume} blocks",
    statMaxDimLabel: "Max Chunk Dimension",
    statDimSingleLabel: "Dimensions",
    statMetaDbLabel: "LevelDB Metadata",
    statBlockTypesLabel: "Block Types",
    statEntitiesLabel: "Entities",
    statMetaPresent: "Present",
    statMetaNotDetected: "Not detected",

    // Action Buttons
    btnDownloadZip: "Download Map (.zip)",
    btnMcstructure: ".mcstructure",
    btnRawData: "Raw Data ({count})",

    // Raw Data Items
    rawBadgeMeta: "⚙ METADATA",
    rawBadgeChunk: "🧩 CHUNK",
    rawBadgeMap: "🗺️ STRUCTURE",
    rawMetaTitle: "Map Metadata (LevelDB)",
    rawChunkTitle: "Structure Chunk {coords}",

    // Empty State
    emptyMwTitle: "No MultiWorld structures found",
    emptyAllTitle: "No saved structures found",
    emptyMwDesc: 'Disable the "Only MW" filter to view all world structures.',
    emptyAllDesc: "Make sure you saved at least one structure using a Structure Block, /structure save, or MultiWorld /export.",
    btnLogs: "View Diagnostic Logs",

    // Info Section
    infoEyebrow: "GUIDE & FUNCTIONALITY",
    infoMainTitle: "How does extraction for MultiWorld work?",
    info1Title: "MultiWorld Integration",
    info1Desc: "Automatically detects maps exported with the MultiWorld /export <name> command stored in LevelDB (multiworld: prefixes and map chunks).",
    info2Title: "2 Column View & Raw Data",
    info2Desc: "When Only MW mode is active, structures are organized in a 2-column grid alternating purple and cyan accents with Raw Data access.",
    info3Title: "Export & /load Import",
    info3Desc: "Generates standard .mcstructure files compatible with the MultiWorld /load <world> <name> command.",

    // Footer & Sidebar
    sidebarExtractor: "World Extractor",
    sidebarFooterCopy: "Made with ❤️ for Minecraft<br/>Bedrock Edition",
    footerText: "MultiWorld Structure Exporter  •  Compatible with Minecraft Bedrock Edition 1.20+"
  }
};

let currentLang = localStorage.getItem("app_lang") || (navigator.language && navigator.language.startsWith("es") ? "es" : "en");

function t(key, params = {}) {
  const dict = I18N[currentLang] || I18N.es;
  let text = dict[key] || I18N.es[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

function setLanguage(lang) {
  if (lang !== "es" && lang !== "en") return;
  currentLang = lang;
  localStorage.setItem("app_lang", lang);
  updateUiTexts();
  if (typeof renderGrid === "function" && typeof currentStructures !== "undefined" && currentStructures) {
    renderGrid(currentStructures);
  }
}

function toggleLanguage() {
  setLanguage(currentLang === "es" ? "en" : "es");
}

function updateUiTexts() {
  document.querySelectorAll("[data-i18n]").forEach(elem => {
    const key = elem.getAttribute("data-i18n");
    const attr = elem.getAttribute("data-i18n-attr");
    const translated = t(key);
    if (attr) {
      elem.setAttribute(attr, translated);
    } else {
      elem.innerHTML = translated;
    }
  });

  // Update Language label
  const langLabel = document.getElementById("langLabel");
  if (langLabel) {
    langLabel.innerText = currentLang.toUpperCase();
  }

  // Update toggle MW button text
  if (typeof onlyMwFilter !== "undefined") {
    const btn = document.getElementById("toggleMwBtn");
    const mobileBtn = document.getElementById("mobileToggleMwBtn");
    const mwText = onlyMwFilter ? t("btnSoloMwOn") : t("btnSoloMwOff");
    const mwSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
    if (btn) btn.innerHTML = `${mwSvg} ${mwText}`;
    if (mobileBtn) mobileBtn.innerHTML = `${mwSvg} ${mwText}`;
  }

  // Update Mobile Filters text
  const showHideText = document.getElementById("showHideText");
  if (showHideText) {
    const isVisible = document.body.classList.contains("mobile-actions-visible");
    showHideText.textContent = isVisible ? t("btnClose") : t("btnFilters");
  }
}
