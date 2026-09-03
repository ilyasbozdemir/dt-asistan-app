import { create } from 'zustand'

export interface GlobalDocumentPreviewState {
  isOpen: boolean
  isBalloon: boolean
  documentId: string | null
  dosyaId: number | null
  documentTitle: string | null
  invitedFirms: any[]
  openDocument: (params: {
    documentId: string
    dosyaId?: number | null
    documentTitle?: string
    invitedFirms?: any[]
    startAsBalloon?: boolean
  }) => void
  closeDocument: () => void
  setIsBalloon: (isBalloon: boolean) => void
  toggleBalloon: () => void
}

export const useGlobalDocumentPreviewStore = create<GlobalDocumentPreviewState>((set) => ({
  isOpen: false,
  isBalloon: false,
  documentId: null,
  dosyaId: null,
  documentTitle: null,
  invitedFirms: [],
  openDocument: ({ documentId, dosyaId, documentTitle, invitedFirms = [], startAsBalloon = false }) =>
    set({
      isOpen: true,
      isBalloon: startAsBalloon,
      documentId,
      dosyaId: dosyaId || null,
      documentTitle: documentTitle || null,
      invitedFirms
    }),
  closeDocument: () =>
    set({
      isOpen: false,
      isBalloon: false,
      documentId: null,
      dosyaId: null,
      documentTitle: null,
      invitedFirms: []
    }),
  setIsBalloon: (isBalloon) => set({ isBalloon }),
  toggleBalloon: () => set((state) => ({ isBalloon: !state.isBalloon }))
}))
