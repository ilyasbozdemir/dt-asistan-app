import { ProcessMapping, TableColumnMapping } from './types';

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
        
        if (rule.iliskili_id) {
          query = `SELECT ${rule.sutun} FROM ${rule.tablo} WHERE ${rule.iliskili_id} = ? LIMIT 1`;
          params = [activeDosyaId];
        } else {
          query = `SELECT ${rule.sutun} FROM ${rule.tablo} LIMIT 1`;
        }

        const res = await queryExecutor(query, params);
        const rawValue = res?.[0]?.[rule.sutun];
        
        // Handle stringified JSON arrays (like antetSatirlari)
        if (typeof rawValue === 'string' && (rawValue.trim().startsWith('[') || rawValue.trim().startsWith('{'))) {
          try {
            resolvedPayload[sablonDegiskeni] = JSON.parse(rawValue);
          } catch (e) {
            resolvedPayload[sablonDegiskeni] = rawValue;
          }
        } else {
          resolvedPayload[sablonDegiskeni] = rawValue !== undefined && rawValue !== null 
            ? rawValue 
            : (rule.varsayilan ?? '');
        }
      } catch (err) {
        resolvedPayload[sablonDegiskeni] = rule.varsayilan ?? '';
      }
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
