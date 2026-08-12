# Bedrock World Structure Exporter

**Bedrock World Structure Exporter** es una herramienta web para **Minecraft Bedrock Edition** diseñada para cargar mundos (`.mcworld` / `.zip`) y extraer automáticamente todas las estructuras guardadas (`.mcstructure`).

## Características Principales

- 💾 **Extracción de LevelDB**: Escanea la base de datos `db/` del mundo buscando claves `structuretemplate_*` guardadas mediante Bloques de Estructuras o el comando `/structure save`.
- 📦 **Extracción de Behavior Packs**: Detecta y exporta todos los archivos `.mcstructure` incluidos en los packs del mundo.
- 📊 **Metadatos NBT Detallados**: Muestra dimensiones ($X \times Y \times Z$), volumen total de bloques, variedad de bloques en paleta y cantidad de entidades.
- ⬇️ **Exportación Flexible**: Descarga archivos `.mcstructure` individualmente o agrupados en un archivo `.zip`.
- 👁️ **Visualizador Integrado**: Integración directa con el **Structure Editor** para previsualizar estructuras antes de exportar.

## Cómo Utilizar

1. Abre `index.html` en cualquier navegador web moderno (o mediante un servidor estático local).
2. Arrastra y suelta tu archivo `.mcworld` o `.zip` en la zona de carga.
3. Examina la lista de estructuras detectadas con sus metadatos.
4. Haz clic en **Descargar .mcstructure** para una estructura individual o en **Descargar Todas (.zip)**.

## Licencia

Creative Commons Attribution-ShareAlike 4.0 International License.
