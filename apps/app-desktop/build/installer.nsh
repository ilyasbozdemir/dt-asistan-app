!macro customInstall
  ; --- .tmn360 & .hkmp Uzantıları (Temin 360 Varsayılan) ---
  WriteRegStr HKCU "Software\Classes\.tmn360" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.tmn360" "Content Type" "application/x-tmn360"
  WriteRegStr HKCU "Software\Classes\.tmn360\ShellNew" "NullFile" ""
  WriteRegStr HKCU "Software\Classes\.tmn360\ShellNew" "ItemName" "Temin 360 Proje Dosyası"
  WriteRegStr HKCU "Software\Classes\.tmn360\ShellNew" "IconPath" '"$INSTDIR\TEMIN360.exe",0'

  WriteRegStr HKCU "Software\Classes\.hkmp" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.hkmp" "Content Type" "application/x-hkmp"

  ; --- .dtal Uzantısı (Geriye Dönük Uyumluluk) ---
  WriteRegStr HKCU "Software\Classes\.dtal" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.dtal" "Content Type" "application/x-dtal"

  ; --- ProgID Tanımı ve Açma Komutu ---
  WriteRegStr HKCU "Software\Classes\Temin360.Document" "" "Temin 360 Çalışma Dosyası"
  WriteRegStr HKCU "Software\Classes\Temin360.Document\DefaultIcon" "" '"$INSTDIR\TEMIN360.exe",0'
  WriteRegStr HKCU "Software\Classes\Temin360.Document\shell\open\command" "" '"$INSTDIR\TEMIN360.exe" "%1"'

  ; --- Windows Explorer'ı yenile ---
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\.tmn360"
  DeleteRegKey HKCU "Software\Classes\.hkmp"
  DeleteRegKey HKCU "Software\Classes\.dtal"
  DeleteRegKey HKCU "Software\Classes\Temin360.Document"
  DeleteRegKey HKCU "Software\Classes\HakimPro.Document"
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

