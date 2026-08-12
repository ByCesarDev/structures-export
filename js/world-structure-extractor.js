/**
 * World Structure Extractor for Minecraft Bedrock Edition (.mcworld / .zip)
 * Extracts saved structures from LevelDB database (structuretemplate_*) and Behavior Packs.
 */

class WorldStructureExtractor {
  constructor() {
    this.structures = [];
    this.debugLogs = [];
  }

  logDebug(msg) {
    console.log("[Extractor]", msg);
    this.debugLogs.push(msg);
  }

  /**
   * Process a .mcworld or .zip file buffer
   */
  async processWorldFile(file, onProgress = () => {}) {
    this.structures = [];
    this.debugLogs = [];
    this.logDebug("=================================================");
    this.logDebug("🚀 Iniciando procesamiento de archivo del mundo...");
    this.logDebug("=================================================");
    onProgress("Cargando archivo del mundo (.mcworld / .zip)...", 5);

    let zip;
    try {
      zip = await JSZip.loadAsync(file);
    } catch (err) {
      this.logDebug("❌ Error fatal al descompresionar zip: " + err.message);
      throw new Error("El archivo no es un archivo .mcworld o .zip válido: " + err.message);
    }

    const filePaths = Object.keys(zip.files);
    this.logDebug(`📦 Se encontraron ${filePaths.length} archivos dentro del paquete .zip`);
    filePaths.slice(0, 15).forEach(p => this.logDebug(`   📄 Archivo en zip: ${p}`));
    if (filePaths.length > 15) this.logDebug(`   ...y ${filePaths.length - 15} archivos más.`);

    onProgress(`Analizando ${filePaths.length} archivos en el paquete del mundo...`, 15);

    const structureMap = new Map(); // name -> structure object

    // 1. Scan for .mcstructure files anywhere in the zip (behavior packs, structures/ folder, etc.)
    const structureFiles = filePaths.filter(path => {
      const p = path.toLowerCase();
      if (zip.files[path].dir) return false;
      return p.endsWith(".mcstructure") || p.includes("/structures/") || p.startsWith("structures/");
    });

    this.logDebug(`📂 Archivos de estructura directos en carpetas: ${structureFiles.length}`);

    let countProcessed = 0;
    for (const path of structureFiles) {
      countProcessed++;
      const progressPercent = 15 + Math.floor((countProcessed / Math.max(1, structureFiles.length)) * 25);
      const filename = path.split("/").pop();
      if (!filename) continue;
      const rawName = filename.replace(/\.mcstructure$/i, "");
      onProgress(`Procesando archivo: ${filename}...`, progressPercent);

      try {
        const u8Data = await zip.files[path].async("uint8array");
        const metaResult = await this.parseNbtMetadata(u8Data);
        if (metaResult && metaResult.size && metaResult.size.some(d => d > 0)) {
          const structObj = {
            id: 'file_' + rawName + '_' + Math.random().toString(36).substr(2, 6),
            name: rawName,
            filename: rawName.endsWith(".mcstructure") ? rawName : rawName + ".mcstructure",
            source: path.includes("behavior_packs") ? "Behavior Pack" : "Carpeta de Estructuras del Mundo",
            sourcePath: path,
            buffer: metaResult.decompressedBuffer || u8Data,
            metadata: metaResult
          };
          structureMap.set("file:" + rawName.toLowerCase(), structObj);
          this.logDebug(`✅ Estructura cargada desde archivo: ${rawName} (${metaResult.size.join("x")})`);
        }
      } catch (e) {
        this.logDebug(`⚠️ Error leyendo archivo de estructura ${path}: ${e.message}`);
      }
    }

    // 2. Scan LevelDB database files inside db/ using Mojang LevelDB SSTable Block Parser
    const dbFiles = filePaths.filter(path => {
      const p = path.toLowerCase();
      return (p.includes("/db/") || p.startsWith("db/")) && 
             (p.endsWith(".ldb") || p.endsWith(".log"));
    });

    this.logDebug(`💾 Archivos de base de datos LevelDB (db/) encontrados: ${dbFiles.length}`);
    dbFiles.forEach(f => this.logDebug(`   🗃️ DB File: ${f}`));

    onProgress(`Escaneando base de datos LevelDB (${dbFiles.length} archivos)...`, 40);

    let dbCount = 0;
    for (const path of dbFiles) {
      dbCount++;
      const progressPercent = 40 + Math.floor((dbCount / Math.max(1, dbFiles.length)) * 50);
      onProgress(`Escaneando base de datos LevelDB: ${path.split('/').pop()}...`, progressPercent);

      try {
        const u8Data = await zip.files[path].async("uint8array");
        this.logDebug(`🔍 Escaneando ${path} (${u8Data.length} bytes)...`);
        const extractedFromDb = await this.scanBedrockLevelDbSstable(u8Data, path);
        this.logDebug(`   ✨ Se extrajeron ${extractedFromDb.length} estructuras de ${path}`);
        for (const item of extractedFromDb) {
          const key = "db:" + item.name.toLowerCase();
          if (!structureMap.has(key)) {
            structureMap.set(key, item);
            this.logDebug(`🎉 ¡ESTRUCTURA EXTRAÍDA!: ${item.name} (${item.metadata.size.join("x")}, ${item.buffer.length} bytes)`);
          }
        }
      } catch (e) {
        this.logDebug(`⚠️ Error escaneando LevelDB ${path}: ${e.message}\n${e.stack}`);
      }
    }

    onProgress("Finalizando metadatos de estructuras...", 95);
    this.structures = Array.from(structureMap.values());
    this.logDebug(`=================================================`);
    this.logDebug(`🏆 TOTAL FINAL DE ESTRUCTURAS EXTRAÍDAS: ${this.structures.length}`);
    this.logDebug(`=================================================`);
    onProgress(`¡Proceso completado! Se encontraron ${this.structures.length} estructura(s).`, 100);

    return this.structures;
  }

  /**
   * Parse Mojang LevelDB SSTable (.ldb) / Log (.log) buffer for structuretemplate keys and values
   */
  async scanBedrockLevelDbSstable(buffer, filePath) {
    const results = [];
    if (buffer.length < 48) {
      this.logDebug(`   ⚠️ Archivo ${filePath} muy pequeño (<48 bytes).`);
      return results;
    }

    const isLdb = filePath.toLowerCase().endsWith(".ldb");

    if (isLdb) {
      try {
        const sstableResults = await this.parseSstableBlocks(buffer, filePath);
        results.push(...sstableResults);
      } catch (e) {
        this.logDebug(`⚠️ Aviso al parsear SSTable ${filePath}: ${e.message}`);
      }
    }

    if (results.length === 0) {
      this.logDebug(`   🔎 Ejecutando escaneo raw fallback en ${filePath}...`);
      const rawResults = await this.scanRawNeedleFallback(buffer, filePath);
      results.push(...rawResults);
    }

    return results;
  }

  /**
   * LevelDB SSTable Block Parser for Mojang Zlib (Type 4/2) & Snappy (Type 1)
   */
  async parseSstableBlocks(buffer, filePath) {
    const results = [];
    const footer = buffer.subarray(buffer.length - 48);

    // Verify LevelDB magic footer: 57 fb 80 8b 24 75 47 db
    const magic = [0x57, 0xfb, 0x80, 0x8b, 0x24, 0x75, 0x47, 0xdb];
    for (let m = 0; m < 8; m++) {
      if (footer[40 + m] !== magic[m]) {
        this.logDebug(`   ⚠️ Footer magic no coincide en ${filePath}. No es un SSTable válido.`);
        return results;
      }
    }

    let p = 0;
    const metaIndexOffset = this.readVarint(footer, p); p = metaIndexOffset.nextOffset;
    const metaIndexSize = this.readVarint(footer, p); p = metaIndexSize.nextOffset;
    const indexOffset = this.readVarint(footer, p); p = indexOffset.nextOffset;
    const indexSize = this.readVarint(footer, p); p = indexSize.nextOffset;

    if (indexOffset.value + indexSize.value > buffer.length) {
      this.logDebug(`   ⚠️ Offset de índice inválido en ${filePath}`);
      return results;
    }

    const indexBlockComp = buffer.subarray(indexOffset.value, indexOffset.value + indexSize.value);
    const indexCompType = buffer[indexOffset.value + indexSize.value];
    this.logDebug(`   📊 Index Block offset: ${indexOffset.value}, size: ${indexSize.value}, compType: ${indexCompType}`);

    const indexData = await this.decompressBlockAsync(indexBlockComp, indexCompType);

    if (!indexData) {
      this.logDebug(`   ❌ No se pudo descompresionar el Index Block de ${filePath}`);
      return results;
    }

    this.logDebug(`   🔓 Index Block descompreso: ${indexData.length} bytes`);

    let idx = 0;
    let lastKey = new Uint8Array(0);
    const dataBlocks = [];

    while (idx < indexData.length - 4) {
      const shared = this.readVarint(indexData, idx); idx = shared.nextOffset;
      const unshared = this.readVarint(indexData, idx); idx = unshared.nextOffset;
      const valLen = this.readVarint(indexData, idx); idx = valLen.nextOffset;

      if (idx + unshared.value > indexData.length) break;
      const keyDelta = indexData.subarray(idx, idx + unshared.value); idx += unshared.value;
      const fullKey = new Uint8Array(shared.value + unshared.value);
      fullKey.set(lastKey.subarray(0, shared.value), 0);
      fullKey.set(keyDelta, shared.value);
      lastKey = fullKey;

      if (idx + valLen.value > indexData.length) break;
      const handleBuf = indexData.subarray(idx, idx + valLen.value); idx += valLen.value;

      let hp = 0;
      const blkOff = this.readVarint(handleBuf, hp); hp = blkOff.nextOffset;
      const blkSz = this.readVarint(handleBuf, hp); hp = blkSz.nextOffset;
      dataBlocks.push({ offset: blkOff.value, size: blkSz.value });
    }

    this.logDebug(`   📦 Se encontraron ${dataBlocks.length} Data Blocks en el índice de ${filePath}`);

    for (let bIdx = 0; bIdx < dataBlocks.length; bIdx++) {
      const blockInfo = dataBlocks[bIdx];
      if (blockInfo.offset + blockInfo.size > buffer.length) continue;

      const blkComp = buffer.subarray(blockInfo.offset, blockInfo.offset + blockInfo.size);
      const compType = buffer[blockInfo.offset + blockInfo.size];
      const blkData = await this.decompressBlockAsync(blkComp, compType);

      if (!blkData) continue;

      let bPos = 0;
      let bLastKey = new Uint8Array(0);

      while (bPos < blkData.length - 4) {
        const shared = this.readVarint(blkData, bPos); bPos = shared.nextOffset;
        const unshared = this.readVarint(blkData, bPos); bPos = unshared.nextOffset;
        const valLen = this.readVarint(blkData, bPos); bPos = valLen.nextOffset;

        if (bPos + unshared.value > blkData.length) break;
        const keyDelta = blkData.subarray(bPos, bPos + unshared.value); bPos += unshared.value;

        const fullKey = new Uint8Array(shared.value + unshared.value);
        fullKey.set(bLastKey.subarray(0, shared.value), 0);
        fullKey.set(keyDelta, shared.value);
        bLastKey = fullKey;

        if (bPos + valLen.value > blkData.length) break;
        const valBuf = blkData.subarray(bPos, bPos + valLen.value); bPos += valLen.value;

        const keyStr = new TextDecoder('latin1').decode(fullKey);

        if (keyStr.includes("structuretemplate_")) {
          this.logDebug(`   🎯 Clave detectada en LevelDB: "${keyStr.substring(0, 80)}" (valLen: ${valBuf.length})`);
          const match = keyStr.match(/structuretemplate_([a-zA-Z0-9_\-\:\.]+)/);
          if (match && valBuf.length > 20) {
            const rawStructName = match[1];
            const metaResult = await this.parseNbtMetadata(valBuf);
            if (metaResult && metaResult.size && metaResult.size.some(d => d > 0)) {
              const sanitizedName = rawStructName.replace(/^(mystructure:|structure:)/i, "").replace(/[^a-zA-Z0-9_\-]/g, "_");
              results.push({
                id: 'db_' + sanitizedName + '_' + Math.random().toString(36).substr(2, 6),
                name: rawStructName,
                filename: sanitizedName + ".mcstructure",
                source: "LevelDB (Mundo)",
                sourcePath: filePath,
                buffer: metaResult.decompressedBuffer || new Uint8Array(valBuf),
                metadata: metaResult
              });
              this.logDebug(`   ✨ ¡Estructura parseada con éxito!: ${rawStructName} [${metaResult.size.join("x")}]`);
            } else {
              this.logDebug(`   ⚠️ No se pudieron obtener metadatos de "${rawStructName}"`);
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Fallback raw needle scanner
   */
  async scanRawNeedleFallback(buffer, filePath) {
    const results = [];
    const len = buffer.length;
    const sig = new TextEncoder().encode("structuretemplate_");
    const sigLen = sig.length;

    for (let i = 0; i <= len - sigLen - 10; i++) {
      let match = true;
      for (let s = 0; s < sigLen; s++) {
        if (buffer[i + s] !== sig[s]) { match = false; break; }
      }

      if (match) {
        const keyStart = i + sigLen;
        let keyEnd = keyStart;
        while (keyEnd < len && keyEnd - keyStart < 128) {
          const b = buffer[keyEnd];
          if (b < 32 || b > 126) break;
          keyEnd++;
        }

        if (keyEnd > keyStart) {
          const rawStructName = new TextDecoder().decode(buffer.subarray(keyStart, keyEnd)).trim();
          if (rawStructName.length > 0 && /^[a-zA-Z0-9_\-\:\.]+$/.test(rawStructName)) {
            for (let searchOffset = keyEnd; searchOffset < Math.min(len - 10, keyEnd + 512); searchOffset++) {
              const b0 = buffer[searchOffset];
              const b1 = buffer[searchOffset + 1];
              if (b0 === 0x0A || (b0 === 0x78 && (b1 === 0x9C || b1 === 0x01 || b1 === 0xDA)) || (b0 === 0x1F && b1 === 0x8B)) {
                const candidateSubarray = buffer.subarray(searchOffset, Math.min(len, searchOffset + 15 * 1024 * 1024));
                const metaResult = await this.parseNbtMetadata(candidateSubarray);
                if (metaResult && metaResult.size && metaResult.size.some(d => d > 0)) {
                  const sanitizedName = rawStructName.replace(/^(mystructure:|structure:)/i, "").replace(/[^a-zA-Z0-9_\-]/g, "_");
                  results.push({
                    id: 'db_raw_' + sanitizedName + '_' + Math.random().toString(36).substr(2, 6),
                    name: rawStructName,
                    filename: sanitizedName + ".mcstructure",
                    source: "LevelDB (Escaneo Directo)",
                    sourcePath: filePath,
                    buffer: metaResult.decompressedBuffer || candidateSubarray,
                    metadata: metaResult
                  });
                  i = searchOffset + 50;
                  break;
                }
              }
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Async Universal Decompressor (Mojang Zlib Type 4/2, Snappy Type 1, Web API DecompressionStream)
   */
  async decompressBlockAsync(compressed, compType) {
    if (!compressed || compressed.length === 0) return compressed;
    if (compType === 0) return compressed;

    // Type 4 or Type 2: Mojang Zlib / Deflate Raw
    if (compType === 4 || compType === 2) {
      // 1. Try Browserify zlib module (module ID 51 or 'zlib')
      try {
        if (window.require) {
          let zmod = null;
          try { zmod = window.require(51); } catch (e) {}
          if (!zmod) { try { zmod = window.require('zlib'); } catch (e) {} }
          if (zmod && zmod.inflateRawSync) {
            const NodeBuf = window.require('buffer').Buffer;
            return new Uint8Array(zmod.inflateRawSync(NodeBuf.from(compressed)));
          }
        }
      } catch (e) {}

      // 2. Try Native Browser DecompressionStream API ('deflate-raw' / 'deflate')
      if (typeof DecompressionStream !== 'undefined') {
        for (const format of ['deflate-raw', 'deflate']) {
          try {
            const ds = new DecompressionStream(format);
            const writer = ds.writable.getWriter();
            writer.write(compressed);
            writer.close();
            const response = new Response(ds.readable);
            const arrayBuffer = await response.arrayBuffer();
            if (arrayBuffer && arrayBuffer.byteLength > 0) {
              return new Uint8Array(arrayBuffer);
            }
          } catch (e) {}
        }
      }

      // 3. Try gzipjs fallback
      try {
        if (window.gzipjs && window.gzipjs.inflate) {
          return new Uint8Array(window.gzipjs.inflate(compressed));
        }
      } catch (e) {}
    }

    // Type 1: Snappy
    if (compType === 1) {
      return this.decompressSnappy(compressed);
    }

    return compressed;
  }

  /**
   * Varint Reader
   */
  readVarint(buf, offset) {
    let res = 0; let shift = 0; let p = offset;
    while (p < buf.length) {
      const b = buf[p++];
      res |= (b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7;
    }
    return { value: res, nextOffset: p };
  }

  /**
   * Pure JS Snappy Decompressor
   */
  decompressSnappy(compressed) {
    let pos = 0;
    let uncompressedLen = 0;
    let shift = 0;
    while (pos < compressed.length) {
      const b = compressed[pos++];
      uncompressedLen |= (b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7;
    }

    const out = new Uint8Array(uncompressedLen);
    let outPos = 0;

    while (pos < compressed.length && outPos < uncompressedLen) {
      const tag = compressed[pos++];
      const mode = tag & 0x03;

      if (mode === 0) {
        let len = (tag >> 2) + 1;
        if (len > 60) {
          const extraBytes = len - 60;
          len = 0;
          for (let i = 0; i < extraBytes; i++) {
            len |= (compressed[pos++] << (i * 8));
          }
          len += 1;
        }
        for (let i = 0; i < len && pos < compressed.length && outPos < uncompressedLen; i++) {
          out[outPos++] = compressed[pos++];
        }
      } else if (mode === 1) {
        const len = ((tag >> 2) & 0x07) + 4;
        const offset = ((tag & 0xe0) << 3) | compressed[pos++];
        let copyFrom = outPos - offset;
        for (let i = 0; i < len && outPos < uncompressedLen; i++) {
          out[outPos++] = out[copyFrom++];
        }
      } else if (mode === 2) {
        const len = (tag >> 2) + 1;
        const offset = compressed[pos++] | (compressed[pos++] << 8);
        let copyFrom = outPos - offset;
        for (let i = 0; i < len && outPos < uncompressedLen; i++) {
          out[outPos++] = out[copyFrom++];
        }
      } else if (mode === 3) {
        const len = (tag >> 2) + 1;
        const offset = compressed[pos++] | (compressed[pos++] << 8) | (compressed[pos++] << 16) | (compressed[pos++] << 24);
        let copyFrom = outPos - offset;
        for (let i = 0; i < len && outPos < uncompressedLen; i++) {
          out[outPos++] = out[copyFrom++];
        }
      }
    }

    return out;
  }

  /**
   * Parse NBT metadata using prismarine-nbt (pnbt.js) with binary NBT header fallback & async Zlib decompression
   */
  async parseNbtMetadata(uint8Array) {
    const cleanBytes = new Uint8Array(uint8Array);
    let bufferToParse = cleanBytes;

    // Decompress Zlib (0x78) if compressed
    if (cleanBytes[0] === 0x78) {
      const decompressed = await this.decompressBlockAsync(cleanBytes, 4);
      if (decompressed) {
        bufferToParse = decompressed;
      }
    }

    // 1. Direct Binary Header Parser (Fast, Robust & Failproof)
    if (bufferToParse.length >= 48 && bufferToParse[0] === 0x0A && bufferToParse[1] === 0x00 && bufferToParse[2] === 0x00) {
      try {
        const dv = new DataView(bufferToParse.buffer, bufferToParse.byteOffset, bufferToParse.byteLength);
        const sizeX = dv.getInt32(36, true);
        const sizeY = dv.getInt32(40, true);
        const sizeZ = dv.getInt32(44, true);

        if (sizeX > 0 && sizeY > 0 && sizeZ > 0 && sizeX <= 512 && sizeY <= 512 && sizeZ <= 512) {
          const volume = sizeX * sizeY * sizeZ;
          return {
            formatVersion: 1,
            size: [sizeX, sizeY, sizeZ],
            volume,
            blockPaletteCount: 0,
            entityCount: 0,
            decompressedBuffer: bufferToParse
          };
        }
      } catch (e) {
        // Fallback
      }
    }

    // 2. Prismarine-nbt full parse
    try {
      const nbt = window.require ? window.require('prismarine-nbt') : (window.nbt || null);
      const { Buffer: NodeBuffer } = window.require ? window.require('buffer') : { Buffer: { from: (arr) => arr } };
      if (!nbt) return null;

      const parsedData = await nbt.parse(NodeBuffer.from(bufferToParse));
      const value = parsedData.parsed ? parsedData.parsed.value : null;

      if (!value) return null;

      if (!value.format_version && !value.size && !value.structure) return null;

      const formatVersion = value.format_version ? value.format_version.value : 1;
      let size = [0, 0, 0];

      if (value.size && value.size.value && value.size.value.value) {
        size = Array.from(value.size.value.value);
      }

      const volume = size[0] * size[1] * size[2];
      let blockPaletteCount = 0;
      let entityCount = 0;

      try {
        if (value.structure && value.structure.value) {
          const innerStruct = value.structure.value;

          if (innerStruct.palette && innerStruct.palette.value && innerStruct.palette.value.default && innerStruct.palette.value.default.value) {
            const blockPalette = innerStruct.palette.value.default.value.block_palette;
            if (blockPalette && blockPalette.value && blockPalette.value.value) {
              blockPaletteCount = blockPalette.value.value.length;
            }
          }

          if (innerStruct.entities && innerStruct.entities.value && innerStruct.entities.value.value) {
            entityCount = innerStruct.entities.value.value.length;
          }
        }
      } catch (e) {}

      return {
        formatVersion,
        size,
        volume,
        blockPaletteCount,
        entityCount,
        decompressedBuffer: bufferToParse
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Export single structure to .mcstructure
   */
  exportSingleStructure(structure) {
    const blob = new Blob([structure.buffer], { type: "application/octet-stream" });
    if (window.saveAs) {
      window.saveAs(blob, structure.filename);
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = structure.filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  }

  /**
   * Export all structures to a single .zip file
   */
  async exportAllAsZip(structures = this.structures, zipName = "estructuras_extraidas.zip") {
    if (!structures || structures.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("structures");

    for (const struct of structures) {
      folder.file(struct.filename, struct.buffer);
    }

    const content = await zip.generateAsync({ type: "blob" });
    if (window.saveAs) {
      window.saveAs(content, zipName);
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = zipName;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  }
}

window.WorldStructureExtractor = WorldStructureExtractor;
