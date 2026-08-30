!macro customInstall
  ; --- .hkmp Uzantısı (HAKİM Pro Varsayılan) ---
  WriteRegStr HKCU "Software\Classes\.hkmp" "" "HakimPro.Document"
  WriteRegStr HKCU "Software\Classes\.hkmp" "Content Type" "application/x-hkmp"
  WriteRegStr HKCU "Software\Classes\.hkmp\ShellNew" "NullFile" ""
  WriteRegStr HKCU "Software\Classes\.hkmp\ShellNew" "ItemName" "HAKİM Pro Proje Dosyası"
  WriteRegStr HKCU "Software\Classes\.hkmp\ShellNew" "IconPath" '"$INSTDIR\HAKIMPro.exe",0'

  ; --- .dtal Uzantısı (Geriye Dönük Uyumluluk) ---
  WriteRegStr HKCU "Software\Classes\.dtal" "" "HakimPro.Document"
  WriteRegStr HKCU "Software\Classes\.dtal" "Content Type" "application/x-dtal"

  ; --- ProgID Tanımı ve Açma Komutu ---
  WriteRegStr HKCU "Software\Classes\HakimPro.Document" "" "HAKİM Pro Çalışma Dosyası"
  WriteRegStr HKCU "Software\Classes\HakimPro.Document\DefaultIcon" "" '"$INSTDIR\HAKIMPro.exe",0'
  WriteRegStr HKCU "Software\Classes\HakimPro.Document\shell\open\command" "" '"$INSTDIR\HAKIMPro.exe" "%1"'

  ; --- Windows Explorer'ı yenile ---
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\.hkmp"
  DeleteRegKey HKCU "Software\Classes\.dtal"
  DeleteRegKey HKCU "Software\Classes\HakimPro.Document"
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend
