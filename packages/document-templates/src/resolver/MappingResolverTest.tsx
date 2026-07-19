"use client";

import React, { useState } from 'react';
import { resolveTemplateData } from './mappingResolver';
import { ProcessMapping } from './types';

// Default Mock Data
const INITIAL_MOCK_DATABASE = {
  TANIM_Kurum: [
    {
      id: 1,
      kurum_anteti: JSON.stringify(["T.C.", "SAĞLIK BAKANLIĞI", "Ankara İl Sağlık Müdürlüğü"]),
      detsis_kodu: '95240212',
      makam_adi: 'İl Sağlık Müdürlüğüne',
      adres: 'Mustafa Kemal Mah. No:1 Ankara',
      telefon: '0312 555 44 33',
      faks: '0312 555 44 34',
      web_sitesi: 'www.saglik.gov.tr',
      eposta: 'eposta@saglik.gov.tr',
      kep_adresi: 'kep@hs01.kep.tr'
    }
  ],
  DATA_TeminDosyasi: [
    {
      id: 100,
      butce_yili: '2026',
      temin_no_clean: '123',
      ihtiyac_yeri: 'Poliklinik Hizmetleri',
      isin_aciklamasi: 'Laboratuvar Malzemeleri Alımı'
    }
  ],
  DATA_TeminKalem: [
    {
      id: 1,
      temin_dosya_id: 100,
      tasinir_kodu: 'LAB-001',
      kalem_adi: 'Eldiven',
      aciklama: 'Nitril',
      birim: 'Kutu',
      kdv_orani: 20,
      miktar: 50
    },
    {
      id: 2,
      temin_dosya_id: 100,
      tasinir_kodu: 'LAB-002',
      kalem_adi: 'Maske',
      aciklama: 'N95',
      birim: 'Adet',
      kdv_orani: 10,
      miktar: 200
    }
  ]
};

const INITIAL_MAPPING: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Dosyanın antet satırları'
  },
  dosyaKonusu: { deger: 'İhtiyaç Listesi', aciklama: 'Belge Başlığı / Konusu' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'DETSİS No - Yıl - Dosya No birleşimi'
  },
  sunulacakMakamAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'makam_adi',
    aciklama: 'Sunulacak makam adı'
  },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      kodu: 'tasinir_kodu',
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      kdvOrani: 'kdv_orani',
      miktar: 'miktar'
    },
    aciklama: 'İhtiyaç listesi kalemleri'
  },
  ihtiyacYeri: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'ihtiyac_yeri',
    aciklama: 'İhtiyaç listesi yerleri'
  },
  isinAciklamasi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'İşin Açıklaması'
  },
  olurYazisi: { deger: true, aciklama: 'Olur yazısı oluşturulacak' },
  kurumIci: { deger: true, aciklama: 'Kurum içi mi?' },
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum adresi' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum telefonu' },
  kurumWeb: { tablo: 'TANIM_Kurum', sutun: 'web_sitesi', aciklama: 'Kurum web sitesi' }
};

export function MappingResolverTest() {
  const [dbState, setDbState] = useState<Record<string, any[]>>(INITIAL_MOCK_DATABASE);
  const [mappingString, setMappingString] = useState<string>(JSON.stringify(INITIAL_MAPPING, null, 2));
  const [activeDosyaId, setActiveDosyaId] = useState<number>(100);
  const [resolvedOutput, setResolvedOutput] = useState<any>(null);
  const [executedQueries, setExecutedQueries] = useState<{ sql: string; params: any[]; result: any[] }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mini SQL Query Engine simulator
  const queryExecutor = async (sql: string, params: any[]): Promise<any[]> => {
    // Matches patterns:
    // 1. SELECT <columns> FROM <table> WHERE <filterCol> = ? LIMIT 1
    // 2. SELECT <columns> FROM <table> WHERE <filterCol> = ?
    // 3. SELECT <columns> FROM <table> LIMIT 1
    // 4. SELECT <columns> FROM <table>
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    
    const matchSelect = cleanSql.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(\w+)\s*=\s*\?)?(?:\s+LIMIT\s+\d+)?/i);
    
    let result: any[] = [];
    if (matchSelect) {
      const columns = matchSelect[1].trim();
      const table = matchSelect[2].trim();
      const filterCol = matchSelect[3]?.trim();

      const tableRows = dbState[table] || [];
      let filtered = [...tableRows];

      if (filterCol && params.length > 0) {
        filtered = tableRows.filter(row => String(row[filterCol]) === String(params[0]));
      }

      if (columns === '*') {
        result = filtered;
      } else {
        result = filtered.map(row => ({ [columns]: row[columns] }));
      }
    }

    setExecutedQueries(prev => [...prev, { sql, params, result }]);
    return result;
  };

  const handleResolve = async () => {
    setErrorMsg(null);
    setExecutedQueries([]);
    try {
      const parsedMapping = JSON.parse(mappingString) as ProcessMapping;
      const result = await resolveTemplateData(parsedMapping, activeDosyaId, queryExecutor);
      setResolvedOutput(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Geçersiz Mapping JSON formatı.');
    }
  };

  const handleDbChange = (tableName: string, value: string) => {
    try {
      const parsedRows = JSON.parse(value);
      if (Array.isArray(parsedRows)) {
        setDbState(prev => ({
          ...prev,
          [tableName]: parsedRows
        }));
      }
    } catch (e) {
      // Allow user to keep typing invalid JSON temporarily
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '24px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#f3f4f6',
      backgroundColor: '#0f172a',
      borderRadius: '12px',
      minHeight: '600px'
    }}>
      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#6366f1' }}>
          Database Mapping Resolver Playground
        </h2>
        <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
          Şablon değişken eşleştirmelerini dinamik Mock SQLite veritabanı üzerinde test edin.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Side: Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#cbd5e1' }}>
              Aktif Dosya ID:
            </label>
            <input
              type="number"
              value={activeDosyaId}
              onChange={(e) => setActiveDosyaId(Number(e.target.value))}
              style={{
                width: '100px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #334155',
                backgroundColor: '#1e293b',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#cbd5e1' }}>
              Process Mapping (JSON):
            </label>
            <textarea
              value={mappingString}
              onChange={(e) => setMappingString(e.target.value)}
              rows={15}
              style={{
                width: '100%',
                fontFamily: 'Courier New, monospace',
                fontSize: '13px',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #334155',
                backgroundColor: '#1e293b',
                color: '#e2e8f0',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#cbd5e1' }}>
              Mock Veritabanı Tabloları (JSON Satırları):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(dbState).map((tableName) => (
                <div key={tableName} style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '6px' }}>
                    {tableName}
                  </span>
                  <textarea
                    defaultValue={JSON.stringify(dbState[tableName], null, 2)}
                    onChange={(e) => handleDbChange(tableName, e.target.value)}
                    rows={5}
                    style={{
                      width: '100%',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '12px',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#e2e8f0'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleResolve}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#6366f1',
              color: '#fff',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              alignSelf: 'flex-start'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6366f1')}
          >
            Eşleştirmeyi Çözümle
          </button>
        </div>

        {/* Right Side: Output & Query Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: '#991b1b', color: '#fca5a5', borderRadius: '6px', fontSize: '14px' }}>
              ⚠️ Hata: {errorMsg}
            </div>
          )}

          <div>
            <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#cbd5e1' }}>
              Çözümlenmiş Payload (Şablon Değişkenleri):
            </span>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '16px',
              borderRadius: '8px',
              minHeight: '200px',
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #334155'
            }}>
              {resolvedOutput ? (
                <pre style={{ margin: 0, fontFamily: 'Courier New, monospace', fontSize: '13px', color: '#4ade80' }}>
                  {JSON.stringify(resolvedOutput, null, 2)}
                </pre>
              ) : (
                <span style={{ color: '#64748b', fontSize: '14px' }}>Çözümleme sonucunu görmek için sol taraftan tetikleyin.</span>
              )}
            </div>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#cbd5e1' }}>
              Çalıştırılan SQL Sorguları & Çıktıları:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
              {executedQueries.length > 0 ? (
                executedQueries.map((q, idx) => (
                  <div key={idx} style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #6366f1' }}>
                    <div style={{ fontSize: '12px', fontFamily: 'Courier New, monospace', color: '#cbd5e1', marginBottom: '4px' }}>
                      <strong>SQL:</strong> {q.sql}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                      <strong>Parametreler:</strong> {JSON.stringify(q.params)}
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'Courier New, monospace', color: '#38bdf8' }}>
                      <strong>Sonuç:</strong> {JSON.stringify(q.result)}
                    </div>
                  </div>
                ))
              ) : (
                <span style={{ color: '#64748b', fontSize: '14px' }}>Henüz bir sorgu tetiklenmedi.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
