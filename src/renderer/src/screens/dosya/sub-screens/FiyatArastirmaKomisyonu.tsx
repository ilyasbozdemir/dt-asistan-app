import React, { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { KomisyonAtamaForm } from './MuayeneKabulKomisyonu'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  AlertCircle,
  FileText,
  Users,
  Package,
  Layers,
  Compass,
  FileCheck,
  CreditCard,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Building2,
  Printer,
  TrendingUp,
  UserPlus,
  Copy,
  Upload,
  Eye
} from 'lucide-react'
import { cn } from '../../../utils/cn'
import { Modal } from '../../../components/ui/Modal'

import { SubScreen } from '../SubScreens.screen'

export function FiyatArastirmaKomisyonu(): React.JSX.Element {
  return <KomisyonAtamaForm tur="Fiyat Araştırma" title="Fiyat Araştırma Komisyonu Atama" />
}

// 7. MUAYENE KABUL KOMİSYONU ATAMA SCREEN
