import React from 'react'
import { Minus, Square, X } from 'lucide-react'

export function WindowControls(): React.JSX.Element {
  const handleMinimize = () => window.electron?.ipcRenderer.send('window-minimize')
  const handleMaximize = () => window.electron?.ipcRenderer.send('window-maximize')
  const handleClose = () => window.electron?.ipcRenderer.send('window-close')

  return (
    <div
      className="absolute top-0 right-0 flex items-center h-full"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <button
        onClick={handleMinimize}
        className="h-full w-11 flex items-center justify-center text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-none cursor-pointer"
        title="Simge Durumuna Küçült"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={handleMaximize}
        className="h-full w-11 flex items-center justify-center text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-none cursor-pointer"
        title="Ekranı Kapla"
      >
        <Square className="w-3 h-3" />
      </button>
      <button
        onClick={handleClose}
        className="h-full w-11 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#e81123] transition-none cursor-pointer"
        title="Kapat"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
