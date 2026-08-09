# TypeScript Type Refactoring & Code Smell Improvements

Bu belge,
[MalzemeEkleModal.tsx](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal.tsx)
ve ilişkili bileşenlerde tespit edilen `any` tip kullanımlarını ve refactoring
(iyileştirme) adımlarını içermektedir.

---

## 📌 Öncelikli İyileştirme Listesi ([MalzemeEkleModal.tsx](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal.tsx))

### 1. 300 - 350 Satırları Arası & Yakınındaki `any` Kullanımları

- **[Satır 285](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal.tsx#L285),
  [Satır 298](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal.tsx#L298)
  &
  [Satır 310](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal.tsx#L310)
  (`setItemMiktarlar` State Updater):**
  - **Mevcut:** `setItemMiktarlar((prev: any) => ...)`
  - **Sorun:** State güncelleyici parametresi `prev` explicit `any` tipindedir.
  - **Çözüm:** `(prev: Record<number, number>) => ...` olarak
    tiplendirilmelidir.

---

### 2. Bileşen Genelindeki Diğer Explicit `any` Kullanımları

- **[Satır 15](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal.tsx#L15)
  (`MalzemeEkleModal` Prop Tipi):**
  - **Mevcut:** `export function MalzemeEkleModal({ state }: { state: any })`
  - **Sorun:** Component prop `state` tamamen `any` olarak tanımlanmış.
  - **Çözüm:**
    [useMalzemeListesi.ts](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/useMalzemeListesi.ts#L3)
    içerisindeki `UseMalzemeListesiReturn` arabirimi (interface)
    kullanılmalıdır.

- **[Satır 61](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal.tsx#L61)
  (`filteredLibraryItems` Filtreleme):**
  - **Mevcut:** `libraryItems.filter((item: any) => ...)`
  - **Çözüm:** `LibraryItem` veya `TeminKalem` arayüzü tanımlanarak
    `(item: LibraryItem)` olarak güncellenmelidir.

- **[Satır 82](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal.tsx#L82)
  (`handleSelectAllFiltered` Döngüsü):**
  - **Mevcut:** `filteredLibraryItems.forEach((i: any) => ...)`
  - **Çözüm:** `(i: LibraryItem)` olarak tanımlanmalıdır.

- **[Satır 208](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal.tsx#L208)
  (`filteredLibraryItems.map` Render Döngüsü):**
  - **Mevcut:** `filteredLibraryItems.map((item: any) => ...)`
  - **Çözüm:** `(item: LibraryItem)` şeklinde tiplendirilmelidir.

- **[Satır 221](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal.tsx#L221)
  (`setSelectedItemIds` State Updater):**
  - **Mevcut:** `setSelectedItemIds((prev: any) => ...)`
  - **Çözüm:** `(prev: Set<number>)` şeklinde tiplendirilmelidir.

- **[Satır 387](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal.tsx#L387)
  (`filteredSuggestions.map` Autocomplete Listesi):**
  - **Mevcut:** `filteredSuggestions.map((item: any) => ...)`
  - **Çözüm:** `(item: LibraryItem)` şeklinde tiplendirilmelidir.

---

## 🛠️ Planlanan Çözüm Adımları

1. [useMalzemeListesi.ts](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/useMalzemeListesi.ts)
   veya ortak bir `types.ts` dosyasında `LibraryItem` interface'ini tanımlamak:
   ```ts
   export interface LibraryItem {
     id: number;
     kalem_adi: string;
     tipi?: string;
     birim?: string;
     kdv_orani?: number;
     tasinir_kodu?: string;
     okas_kodu?: string;
   }
   ```
2. `MalzemeEkleModal` prop tipini `{ state: UseMalzemeListesiReturn }` ile
   değiştirmek.
3. Tüm `(prev: any)` ve `(item: any)` ifadelerini ilgili somut tiplerle
   güncellemek.
