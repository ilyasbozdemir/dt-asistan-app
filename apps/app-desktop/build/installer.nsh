!macro customInstall
  ; --- .dtal Uzantısı (Varsayılan) ---
  WriteRegStr HKCU "Software\Classes\.dtal" "" "HakimPro.Document"
  WriteRegStr HKCU "Software\Classes\.dtal" "Content Type" "application/x-dtal"
  WriteRegStr HKCU "Software\Classes\.dtal\ShellNew" "NullFile" ""
  WriteRegStr HKCU "Software\Classes\.dtal\ShellNew" "ItemName" "HAKİM Pro Proje Dosyası"
  WriteRegStr HKCU "Software\Classes\.dtal\ShellNew" "IconPath" '"$INSTDIR\HAKIMPro.exe",0'

  ; --- .dtm Uzantısı ---
  WriteRegStr HKCU "Software\Classes\.dtm" "" "HakimPro.Document"
  WriteRegStr HKCU "Software\Classes\.dtm" "Content Type" "application/x-dtm"

  ; --- .dta Uzantısı ---
  WriteRegStr HKCU "Software\Classes\.dta" "" "HakimPro.Document"
  WriteRegStr HKCU "Software\Classes\.dta" "Content Type" "application/x-dta"

  ; --- .dte Uzantısı ---
  WriteRegStr HKCU "Software\Classes\.dte" "" "HakimPro.Document"
  WriteRegStr HKCU "Software\Classes\.dte" "Content Type" "application/x-dte"

  ; --- ProgID Tanımı ve Açma Komutu ---
  WriteRegStr HKCU "Software\Classes\HakimPro.Document" "" "HAKİM Pro Çalışma Dosyası"
  WriteRegStr HKCU "Software\Classes\HakimPro.Document\DefaultIcon" "" '"$INSTDIR\HAKIMPro.exe",0'
  WriteRegStr HKCU "Software\Classes\HakimPro.Document\shell\open\command" "" '"$INSTDIR\HAKIMPro.exe" "%1"'

  ; --- Windows Explorer'ı yenile ---
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\.dtal"
  DeleteRegKey HKCU "Software\Classes\.dtm"
  DeleteRegKey HKCU "Software\Classes\.dta"
  DeleteRegKey HKCU "Software\Classes\.dte"
  DeleteRegKey HKCU "Software\Classes\HakimPro.Document"
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend
