import React from "react";
import { useGlobalDocumentPreviewStore } from "../../store/globalDocumentPreviewStore";
import { DocumentPreviewModalV2 } from "../../screens/dosya/components/DocumentPreviewModalV2";

export const GlobalDocumentPreviewHost: React.FC = () => {
  const { isOpen, documentId, dosyaId, invitedFirms, closeDocument } =
    useGlobalDocumentPreviewStore();

  if (!isOpen || !documentId) return null;

  return (
    <DocumentPreviewModalV2
      isOpen={isOpen}
      documentId={documentId}
      dosyaId={dosyaId}
      invitedFirms={invitedFirms}
      onClose={closeDocument}
      isModal={true}
    />
  );
};
