import React from "react";
import { YeniDosyaTabProps } from "../types";
import { GenelBilgilerVeIdariAntetSection } from "./components/genel-bilgiler/GenelBilgilerVeIdariAntetSection";
import { MaliAnalizVeButceSection } from "./components/genel-bilgiler/MaliAnalizVeButceSection";
import { IhaleVeTeklifFinansalSection } from "./components/genel-bilgiler/IhaleVeTeklifFinansalSection";
import { SorumlularVeSurecTarihleriSection } from "./components/genel-bilgiler/SorumlularVeSurecTarihleriSection";

export function GenelBilgilerTab(props: YeniDosyaTabProps): React.JSX.Element {
  return (
    <>
      <GenelBilgilerVeIdariAntetSection {...props} />
      <MaliAnalizVeButceSection {...props} />
      <IhaleVeTeklifFinansalSection {...props} />
      <SorumlularVeSurecTarihleriSection {...props} />
    </>
  );
}
