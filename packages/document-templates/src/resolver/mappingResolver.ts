import { ProcessMapping, TableColumnMapping } from './types';

/**
 * Resolves official E-DETSIS formatted document number e.g. E-10234521-934.01-0001
 */
export async function resolveEvrakSayisi(
  activeDosyaId: number,
  queryExecutor: (sql: string, params: any[]) => Promise<any[]>
): Promise<string> {
  try {
    let detsisNo = '';

    // 1. Fetch detsis_kodu from TANIM_Kurum
    const kurumRes = await queryExecutor('SELECT detsis_kodu FROM TANIM_Kurum LIMIT 1', []);
    if (kurumRes?.[0]?.detsis_kodu) {
      detsisNo = kurumRes[0].detsis_kodu;
    }

    // 2. Fallback to TANIM_Ayar (detsisKodu / detsis_kodu)
    if (!detsisNo) {
      const ayarRes = await queryExecutor(
        'SELECT deger FROM TANIM_Ayar WHERE anahtar IN ("detsisKodu", "detsis_kodu") LIMIT 1',
        []
      );
      if (ayarRes?.[0]?.deger) {
        detsisNo = ayarRes[0].deger;
      }
    }

    if (!detsisNo) {
      detsisNo = '10234521';
    }

    const dosyaRes = await queryExecutor(
      'SELECT temin_no, alim_turu, tur FROM DATA_TeminDosyasi WHERE id = ? LIMIT 1',
      [activeDosyaId]
    );

    const dosyaSayisi = dosyaRes?.[0]?.temin_no || '';
    const rawTur = (dosyaRes?.[0]?.alim_turu || dosyaRes?.[0]?.tur || 'mal').toLowerCase();

    let sdpAltKodu = '01';
    if (rawTur.includes('hizmet') || rawTur.includes('danismanlik')) {
      sdpAltKodu = '02';
    } else if (rawTur.includes('yapim')) {
      sdpAltKodu = '03';
    } else {
      sdpAltKodu = '01';
    }
    const sdpKodu = `934.${sdpAltKodu}`;

    let formattedEvrakSayisi = 'E-10234521-934.01-0001';
    if (dosyaSayisi) {
      const rawNumberStr = dosyaSayisi.includes('/')
        ? dosyaSayisi.split('/').pop()
        : dosyaSayisi.includes('-')
        ? dosyaSayisi.split('-').pop()
        : dosyaSayisi;
      const cleanSayi = String(rawNumberStr || '').replace(/\D/g, '') || '1';
      const paddedSayi = cleanSayi.padStart(4, '0');

      formattedEvrakSayisi = `E-${detsisNo}-${sdpKodu}-${paddedSayi}`;
    } else {
      formattedEvrakSayisi = `E-${detsisNo}-${sdpKodu}-0001`;
    }

    return formattedEvrakSayisi;
  } catch (err) {
    return 'E-10234521-934.01-0001';
  }
}

/**
 * Resolves institution header lines by combining TANIM_Kurum.kurum_anteti and DATA_TeminDosyasi.antet_ek_satir
 */
export async function resolveAntetSatirlari(
  activeDosyaId: number,
  queryExecutor: (sql: string, params: any[]) => Promise<any[]>
): Promise<string[]> {
  try {
    let result: string[] = [];

    // 1. Fetch kurum_anteti or individual institution columns from TANIM_Kurum
    const kurumRes = await queryExecutor(
      'SELECT kurum_anteti, ust_kurum_adi, kurum_adi, birim_adi FROM TANIM_Kurum LIMIT 1',
      []
    );

    if (kurumRes && kurumRes.length > 0) {
      const row = kurumRes[0];
      if (row.kurum_anteti) {
        try {
          const parsed = JSON.parse(row.kurum_anteti);
          if (Array.isArray(parsed) && parsed.filter(Boolean).length > 0) {
            result = parsed.filter((s: string) => s && s.trim() !== '');
          }
        } catch {
          if (typeof row.kurum_anteti === 'string' && row.kurum_anteti.trim()) {
            result = row.kurum_anteti.split('\n').map((s: string) => s.trim()).filter(Boolean);
          }
        }
      }

      // If kurum_anteti column was empty or array of empty strings, build from row fields
      if (result.length === 0) {
        const built: string[] = ['T.C.'];
        if (row.ust_kurum_adi && row.ust_kurum_adi.trim()) built.push(row.ust_kurum_adi.toUpperCase());
        if (row.kurum_adi && row.kurum_adi.trim()) built.push(row.kurum_adi.toUpperCase());
        if (row.birim_adi && row.birim_adi.trim()) built.push(row.birim_adi);

        if (built.length > 1) {
          result = built;
        }
      }
    }

    // 2. Fallback to TANIM_Ayar (institutionLetterhead or institutionName) if TANIM_Kurum has no antet
    if (result.length === 0) {
      try {
        const ayarRes = await queryExecutor(
          'SELECT anahtar, deger FROM TANIM_Ayar WHERE anahtar IN ("institutionLetterhead", "institutionName", "parentInstitution")',
          []
        );
        if (ayarRes && Array.isArray(ayarRes)) {
          const ayarMap: Record<string, string> = {};
          ayarRes.forEach((item: any) => {
            ayarMap[item.anahtar] = item.deger;
          });

          if (ayarMap.institutionLetterhead) {
            try {
              const parsed = JSON.parse(ayarMap.institutionLetterhead);
              if (Array.isArray(parsed) && parsed.filter(Boolean).length > 0) {
                result = parsed.filter((s: string) => s && s.trim() !== '');
              }
            } catch {}
          }

          if (result.length === 0) {
            const built: string[] = ['T.C.'];
            if (ayarMap.parentInstitution && ayarMap.parentInstitution.trim()) built.push(ayarMap.parentInstitution.toUpperCase());
            if (ayarMap.institutionName && ayarMap.institutionName.trim()) built.push(ayarMap.institutionName.toUpperCase());
            if (built.length > 1) result = built;
          }
        }
      } catch (e) {}
    }

    // 3. Fallback to clean T.C. if TANIM_Kurum and TANIM_Ayar had no header lines
    if (result.length === 0) {
      result = ['T.C.'];
    }

    // 4. Fetch antet_ek_satir from DATA_TeminDosyasi for active file if set
    if (activeDosyaId) {
      const dosyaRes = await queryExecutor(
        'SELECT antet_ek_satir FROM DATA_TeminDosyasi WHERE id = ? LIMIT 1',
        [activeDosyaId]
      );
      if (dosyaRes && dosyaRes.length > 0 && dosyaRes[0].antet_ek_satir) {
        const ekSatir = String(dosyaRes[0].antet_ek_satir).trim();
        if (ekSatir) {
          result.push(ekSatir);
        }
      }
    }

    return result;
  } catch (err) {
    console.error('Antet satırları çözümlenirken hata:', err);
  }
  return ['T.C.'];
}

/**
 * Formats any date string (ISO or YYYY-MM-DD) into Turkish DD.MM.YYYY format
 */
export function formatDateTR(dateVal: any): string {
  if (!dateVal) return '';
  const str = String(dateVal).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.split('T')[0].split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}.${m}.${y}`;
    }
  }

  if (/^\d{2}\.\d{2}\.\d{4}/.test(str)) {
    return str;
  }

  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    }
  } catch {
    // Ignore
  }

  return str;
}

/**
 * Resolves all variables in a ProcessMapping using database query execution.
 */
export async function resolveTemplateData(
  mapping: ProcessMapping,
  activeDosyaId: number,
  queryExecutor: (sql: string, params: any[]) => Promise<any[]>
): Promise<Record<string, any>> {
  const resolvedPayload: Record<string, any> = {};

  for (const [sablonDegiskeni, rule] of Object.entries(mapping)) {
    // 0. Automatic official evrakSayisi formatting
    if (sablonDegiskeni === 'evrakSayisi' && !rule.formul && rule.deger === undefined) {
      resolvedPayload['evrakSayisi'] = await resolveEvrakSayisi(activeDosyaId, queryExecutor);
      continue;
    }

    // 0.b Automatic institution antet lines formatting
    if (sablonDegiskeni === 'antetSatirlari' && !rule.deger) {
      resolvedPayload['antetSatirlari'] = await resolveAntetSatirlari(activeDosyaId, queryExecutor);
      continue;
    }
    // 1. Static value
    if (rule.deger !== undefined) {
      resolvedPayload[sablonDegiskeni] = rule.deger;
      continue;
    }

    // 2. Formula value
    if (rule.formul) {
      resolvedPayload[sablonDegiskeni] = await resolveFormula(rule.formul, activeDosyaId, queryExecutor);
      continue;
    }

    // 3. Array of objects (e.g. ihtiyacKalemleri)
    if (rule.tablo && rule.sutun === '*' && rule.altEslestirme && rule.iliskili_id) {
      try {
        const query = `SELECT * FROM ${rule.tablo} WHERE ${rule.iliskili_id} = ?`;
        const rows = await queryExecutor(query, [activeDosyaId]);
        
        resolvedPayload[sablonDegiskeni] = rows.map((row: any, idx: number) => {
          const item: Record<string, any> = { siraNo: idx + 1 };
          for (const [templateKey, dbColumn] of Object.entries(rule.altEslestirme!)) {
            item[templateKey] = row[dbColumn] ?? '';
          }
          return item;
        });
      } catch (err) {
        resolvedPayload[sablonDegiskeni] = [];
      }
      continue;
    }

    // 4. Single table columns or JSON array of strings
    if (rule.tablo && rule.sutun && rule.sutun !== '*') {
      try {
        let query = '';
        let params: any[] = [];
        
        if (rule.iliskiliTablo && rule.iliskiliSutun) {
          query = `SELECT p.${rule.iliskiliSutun} AS res_val FROM ${rule.tablo} d LEFT JOIN ${rule.iliskiliTablo} p ON d.${rule.sutun} = p.id WHERE d.id = ? LIMIT 1`;
          params = [activeDosyaId];
        } else if (rule.iliskili_id) {
          query = `SELECT ${rule.sutun} AS res_val FROM ${rule.tablo} WHERE ${rule.iliskili_id} = ? LIMIT 1`;
          params = [activeDosyaId];
        } else if (rule.tablo.toLowerCase().startsWith('data_')) {
          query = `SELECT ${rule.sutun} AS res_val FROM ${rule.tablo} WHERE id = ? LIMIT 1`;
          params = [activeDosyaId];
        } else {
          query = `SELECT ${rule.sutun} AS res_val FROM ${rule.tablo} LIMIT 1`;
        }

        const res = await queryExecutor(query, params);
        let rawValue = res?.[0]?.res_val;

        // Personnel signature auto-fallback if no specific personnel is selected on active file
        if (rule.iliskiliTablo === 'TANIM_Personel' && (!rawValue || String(rawValue).trim() === '')) {
          try {
            let pQuery = '';
            if (sablonDegiskeni.toLowerCase().includes('onay') || sablonDegiskeni.toLowerCase().includes('yetkili')) {
              pQuery = `SELECT ${rule.iliskiliSutun} AS res_val FROM TANIM_Personel WHERE (unvan LIKE '%Harcama Yetkilisi%' OR unvan LIKE '%Müdür%' OR unvan LIKE '%Başkan%' OR varsayilan = 1) AND (aktif_mi = 1 OR aktif_mi IS NULL) ORDER BY id ASC LIMIT 1`;
            } else {
              pQuery = `SELECT ${rule.iliskiliSutun} AS res_val FROM TANIM_Personel WHERE (varsayilan = 1 OR aktif_mi = 1 OR aktif_mi IS NULL) ORDER BY id ASC LIMIT 1`;
            }
            const pRes = await queryExecutor(pQuery, []);
            if (pRes?.[0]?.res_val) {
              rawValue = pRes[0].res_val;
            }
          } catch (e) {}
        }

        // Dynamic fallback for sunulacakMakamAdi from TANIM_Kurum
        if (sablonDegiskeni === 'sunulacakMakamAdi') {
          try {
            const kRes = await queryExecutor('SELECT kurum_adi, ust_kurum_adi, makam_adi FROM TANIM_Kurum LIMIT 1', []);
            if (kRes?.[0]) {
              const kRow = kRes[0];
              if (kRow.makam_adi && kRow.makam_adi.trim()) {
                rawValue = kRow.makam_adi.trim();
              } else if (kRow.kurum_adi && kRow.kurum_adi.trim()) {
                const kName = kRow.kurum_adi.trim();
                rawValue = kName.toUpperCase().endsWith('BAŞKANLIĞI')
                  ? `${kName.toUpperCase()}NA`
                  : `${kName.toUpperCase()} BAŞKANLIĞINA`;
              } else if (kRow.ust_kurum_adi && kRow.ust_kurum_adi.trim()) {
                rawValue = `${kRow.ust_kurum_adi.trim().toUpperCase()} BAŞKANLIĞINA`;
              }
            }
          } catch (e) {}
        }
        
        // Handle stringified JSON arrays (like antetSatirlari)
        if (typeof rawValue === 'string' && (rawValue.trim().startsWith('[') || rawValue.trim().startsWith('{'))) {
          try {
            resolvedPayload[sablonDegiskeni] = JSON.parse(rawValue);
          } catch (e) {
            resolvedPayload[sablonDegiskeni] = rawValue;
          }
        } else {
          resolvedPayload[sablonDegiskeni] = rawValue !== undefined && rawValue !== null && String(rawValue).trim() !== ''
            ? rawValue 
            : (rule.varsayilan ?? '');
        }
      } catch (err) {
        resolvedPayload[sablonDegiskeni] = rule.varsayilan ?? '';
      }
    }
  }

  // Automatic solLogo and sagLogo fallback from TANIM_Kurum or TANIM_Ayar
  if (!resolvedPayload['solLogo']) {
    try {
      const res = await queryExecutor('SELECT sol_logo FROM TANIM_Kurum LIMIT 1', []);
      if (res?.[0]?.sol_logo) {
        resolvedPayload['solLogo'] = res[0].sol_logo;
      } else {
        const ayarRes = await queryExecutor('SELECT deger FROM TANIM_Ayar WHERE anahtar IN ("logoLeft", "sol_logo") LIMIT 1', []);
        if (ayarRes?.[0]?.deger) resolvedPayload['solLogo'] = ayarRes[0].deger;
      }
    } catch (e) {}
  }
  if (!resolvedPayload['sagLogo']) {
    try {
      const res = await queryExecutor('SELECT sag_logo FROM TANIM_Kurum LIMIT 1', []);
      if (res?.[0]?.sag_logo) {
        resolvedPayload['sagLogo'] = res[0].sag_logo;
      } else {
        const ayarRes = await queryExecutor('SELECT deger FROM TANIM_Ayar WHERE anahtar IN ("logoRight", "sag_logo") LIMIT 1', []);
        if (ayarRes?.[0]?.deger) resolvedPayload['sagLogo'] = ayarRes[0].deger;
      }
    } catch (e) {}
  }

  // Format all date variables into Turkish GG.AA.YYYY format
  for (const key of Object.keys(resolvedPayload)) {
    const val = resolvedPayload[key];
    if (
      typeof val === 'string' &&
      (/^\d{4}-\d{2}-\d{2}/.test(val) || key.toLowerCase().includes('tarih'))
    ) {
      resolvedPayload[key] = formatDateTR(val);
    }
  }

  return resolvedPayload;
}

/**
 * Parses and resolves tokenized formula strings e.g. {{TANIM_Kurum.detsis_kodu}}
 */
async function resolveFormula(
  formul: string,
  activeDosyaId: number,
  queryExecutor: (sql: string, params: any[]) => Promise<any[]>
): Promise<string> {
  const tokenRegex = /\{\{([^}]+)\}\}/g;
  let resolved = formul;
  
  const matches = [...formul.matchAll(tokenRegex)];
  
  for (const m of matches) {
    const fullToken = m[0];
    const path = m[1].trim();
    const parts = path.split('.');
    
    if (parts.length === 2) {
      const [table, column] = parts;
      try {
        let query = `SELECT ${column} FROM ${table} LIMIT 1`;
        let params: any[] = [];
        
        if (table.toLowerCase().startsWith('data_')) {
          query = `SELECT ${column} FROM ${table} WHERE id = ? LIMIT 1`;
          params = [activeDosyaId];
        }
        
        const res = await queryExecutor(query, params);
        const val = res?.[0]?.[column] ?? '';
        resolved = resolved.replace(fullToken, String(val));
      } catch (err) {
        resolved = resolved.replace(fullToken, '');
      }
    }
  }
  return resolved;
}
