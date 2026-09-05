import { create } from 'zustand'

export interface GlobalDocumentPreviewState {
  isOpen: boolean
  isBalloon: boolean
  documentId: string | null
  dosyaId: number | null
  documentTitle: string | null
  invitedFirms: any[]
  onCloseCallback?: (() => void) | null
  openDocument: (params: {
    documentId: string
    dosyaId?: number | null
    documentTitle?: string
    invitedFirms?: any[]
    startAsBalloon?: boolean
    onClose?: () => void
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
  onCloseCallback: null,
  openDocument: ({
    documentId,
    dosyaId,
    documentTitle,
    invitedFirms = [],
    startAsBalloon = false,
    onClose
  }) =>
    set({
      isOpen: true,
      isBalloon: startAsBalloon,
      documentId,
      dosyaId: dosyaId || null,
      documentTitle: documentTitle || null,
      invitedFirms,
      onCloseCallback: onClose || null
    }),
  closeDocument: () =>
    set((state) => {
      if (state.onCloseCallback) {
        try {
          state.onCloseCallback()
        } catch (e) {
          console.error('Error executing onCloseCallback in globalDocumentPreviewStore', e)
        }
      }
      return {
        isOpen: false,
        isBalloon: false,
        documentId: null,
        dosyaId: null,
        documentTitle: null,
        invitedFirms: [],
        onCloseCallback: null
      }
    }),
  setIsBalloon: (isBalloon) => set({ isBalloon }),
  toggleBalloon: () => set((state) => ({ isBalloon: !state.isBalloon }))
}))
