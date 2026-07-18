import React from 'react';
import { AlertCircle } from 'lucide-react';
import { TeklifMatrisi } from './TeklifMatrisi';

interface PiyasaFiyatArastirmasiMatrixTabProps {
  invitedFirms: any[];
  items: any[];
  bids: any;
  getEstimatedCostTotal: () => number;
  getLowestBidInfo: (itemId: number) => any;
  getAverageBid: (itemId: number) => number;
  handlePriceChange: (
    kalemId: number,
    teminFirmaId: number,
    priceStr: string,
  ) => Promise<void>;
}

export function PiyasaFiyatArastirmasiMatrixTab({
  invitedFirms,
  items,
  bids,
  getEstimatedCostTotal,
  getLowestBidInfo,
  getAverageBid,
  handlePriceChange,
}: PiyasaFiyatArastirmasiMatrixTabProps): React.JSX.Element {
  return (
    <div className="animate-in fade-in duration-200">
      {invitedFirms.length > 0 && items.length > 0 ? (
        <TeklifMatrisi
          invitedFirms={invitedFirms}
          items={items}
          bids={bids}
          getEstimatedCostTotal={getEstimatedCostTotal}
          getLowestBidInfo={getLowestBidInfo}
          getAverageBid={getAverageBid}
          handlePriceChange={handlePriceChange}
        />
      ) : invitedFirms.length > 0 && items.length === 0 ? (
        <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 text-left flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400">
              İhtiyaç Kalemi Bulunamadı
            </h4>
            <p className="text-xs text-amber-600 dark:text-amber-500/90 mt-1">
              Teklif fiyat giriş tablosunu görüntülemek için bu dosyaya ait ihtiyaç
              kalemlerinin girilmiş olması gerekir. Lütfen ilgili adımda ihtiyaç
              listesini tanımlayın.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 text-left flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400">
              Davet Edilen İstekli Firma Yok
            </h4>
            <p className="text-xs text-amber-600 dark:text-amber-550 mt-1">
              Fiyat girişi yapabilmek için lütfen önce{' '}
              <strong>İstekli Firmalar</strong> sekmesinden en az 1 firma seçin
              veya ekleyin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
