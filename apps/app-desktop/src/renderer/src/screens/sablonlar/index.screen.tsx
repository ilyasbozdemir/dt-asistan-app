import React, { useState } from 'react'
import { SablonListesi } from './components/SablonListesi'
import { SablonEditor } from './components/SablonEditor'
import { Sablon } from './sablonlar.hooks'

export default function SablonlarScreen(): React.JSX.Element {
  const [editingSablon, setEditingSablon] = useState<Sablon | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = (sablon: Sablon) => {
    setEditingSablon(sablon)
    setIsEditing(true)
  }

  const handleCreate = () => {
    setEditingSablon(null)
    setIsEditing(true)
  }

  const handleBack = () => {
    setEditingSablon(null)
    setIsEditing(false)
  }

  if (isEditing) {
    return <SablonEditor sablon={editingSablon || undefined} onBack={handleBack} />
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex-1 overflow-y-auto">
        <SablonListesi onEdit={handleEdit} onCreate={handleCreate} />
      </div>
    </div>
  )
}
