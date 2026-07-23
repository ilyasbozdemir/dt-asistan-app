import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Info,
  Printer,
  Sparkles,
  User,
} from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useDosyalarHooks } from "../dosyalar/dosyalar.hooks";
import { useCiktiMerkeziData } from "../dosya/CiktiMerkezi.hooks";
import { useNavigate } from "@tanstack/react-router";
import { APP_ROUTES } from "../../constants/routeConstants";

interface Step {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  route?: string;
  status: "completed" | "current" | "pending";
  details: string;
  requiredDocs?: string[];
}

export default function SurecAkisiScreen(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore();
  const { dosyalar } = useDosyalarHooks();
  const navigate = useNavigate();

  const activeDosya = dosyalar.find((d) => d.id === activeDosyaId);
  const { dosyaContext } = useCiktiMerkeziData(activeDosyaId);

  // Simulation state
  const [currentStep, setCurrentStep] = useState<number>(3); // default active step in detail panel
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2]);
  const [formInputs, setFormInputs] = useState({
    teslimEden: dosyaContext?.hazirlayanPersonelAdi || "",
    teslimAlan: dosyaContext?.onaylayanPersonelAdi || "",
    faturaNo: "",
    faturaTarihi: new Date().toISOString().split("T")[0],
    faturaTutari: dosyaContext?.yaklasikMaliyetTutar || "",
    iban: "",
    tasinirFisNo: "",
  });
  const [isSaved, setIsSaved] = useState<string | null>(null);

  const steps: Step[] = [
    {
      id: 1,
      title: "İhtiyaç Oluştu",
      subtitle: "Dosya ve İş Tanımlama",
      description:
        "İhtiyaç duyulan mal, hizmet veya yapım işi belirlenerek sisteme kaydedilir, iş adı ve dosya numarası atanır.",
      status: completedSteps.includes(1)
        ? "completed"
        : currentStep === 1
        ? "current"
        : "pending",
      details:
        "Doğrudan temin sürecinin ilk halkasıdır. İlgili birimlerin talepleri doğrultusunda dosya konusu, alım türü ve yaklaşık bütçe tanımlanarak iş başlatılır.",
      route: APP_ROUTES.HAZIRLIK_VE_IHTIYAC,
    },
    {
      id: 2,
      title: "Doğrudan Temin Onayı Alındı",
      subtitle: "Onay Belgesi & Olurlar",
      description:
        "Harcama yetkilisinden (en üst amir) işin başlatılması ve bütçe kullanımı için resmi olur yazısı ve onay alınır.",
      status: completedSteps.includes(2)
        ? "completed"
        : currentStep === 2
        ? "current"
        : "pending",
      details:
        "4734 Sayılı Kanun'un ilgili maddelerine (22/d vb.) göre hazırlanan doğrudan temin onay belgesi harcama yetkilisine sunulur ve imzalatılır.",
      route: APP_ROUTES.HAZIRLIK_VE_IHTIYAC,
      requiredDocs: ["Doğrudan Temin Onay Belgesi (Onay Belgesi)"],
    },
    {
      id: 3,
      title: "Piyasa Fiyat Araştırması Yapıldı",
      subtitle: "Teklifler & Piyasa Fiyat Araştırma Tutanağı",
      description:
        "En az 3 firmadan veya piyasadan fiyat teklifleri toplanarak Piyasa Fiyat Araştırma Tutanağı (PFAT) düzenlenir.",
      status: completedSteps.includes(3)
        ? "completed"
        : currentStep === 3
        ? "current"
        : "pending",
      details:
        "Fiyat komisyonu üyeleri tarafından piyasadan alınan teklifler değerlendirilir. Eşzamanlı olarak yaklaşık maliyet cetveli de netleştirilmiş olur.",
      route: APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI,
      requiredDocs: [
        "Piyasa Fiyat Araştırması Tutanağı",
        "Yaklaşık Maliyet Cetveli",
      ],
    },
    {
      id: 4,
      title: "Yüklenici Belirlendi",
      subtitle: "En Düşük / En Uygun Teklif Sahibi",
      description:
        "Gelen teklifler arasından en uygun fiyatı sunan istekli belirlenerek üzerine ihale (doğrudan temin alımı) bırakılır.",
      status: completedSteps.includes(4)
        ? "completed"
        : currentStep === 4
        ? "current"
        : "pending",
      details:
        "Tutanakta belirtilen en avantajlı teklifi veren firma yüklenici (kazanan istekli) olarak seçilir ve sipariş aşamasına geçilir.",
      route: APP_ROUTES.SIPARIS_VE_SOZLESME,
    },
    {
      id: 5,
      title: "Mal/Hizmet Teslim Edildi",
      subtitle: "Fiili Teslimat ve İrsaliye",
      description:
        "Yüklenici firma, siparişe konu olan malı veya hizmeti kuruma belirlenen süre içinde teslim eder.",
      status: completedSteps.includes(5)
        ? "completed"
        : currentStep === 5
        ? "current"
        : "pending",
      details:
        "Teslimat sırasında irsaliye veya fatura ile fiziksel kontrol yapılır, teslimat süreci resmileştirilir.",
      route: APP_ROUTES.FATURA_VE_IRSALIYE,
    },
    {
      id: 6,
      title: "Teslim Tesellüm Tutanağı",
      subtitle: "Teslim Eden & Teslim Alan İmzaları",
      description:
        "Malın yüklenici tarafından sorunsuz teslim edildiğini, kurum adına kimlerin teslim aldığını gösteren kanıt tutanağıdır.",
      status: completedSteps.includes(6)
        ? "completed"
        : currentStep === 6
        ? "current"
        : "pending",
      details:
        "Tutanakta teslim eden (firma temsilcisi) ve teslim alan (kurum görevlileri) bilgileri, imzaları yer alır.",
      requiredDocs: ["Teslim Tesellüm Tutanağı"],
    },
    {
      id: 7,
      title: "Muayene ve Kabul Tutanağı",
      subtitle: "Komisyon İncelemesi ve Kabulü",
      description:
        "Muayene ve Kabul Komisyonu üyeleri teslim edilen mal/hizmetin teknik şartnameye uygunluğunu inceleyerek kabul tutanağını imzalar.",
      status: completedSteps.includes(7)
        ? "completed"
        : currentStep === 7
        ? "current"
        : "pending",
      details:
        'Komisyon üyeleri toplanarak kontrol yapar. Malzemelerin kalitesi, özellikleri incelenir ve uygunsa "Kabul Edilmiştir" kararı verilir.',
      requiredDocs: ["Muayene ve Kabul Komisyonu Tutanağı"],
    },
    {
      id: 8,
      title: "Fatura Düzenlendi",
      subtitle: "Fatura Girişi ve Kontrolleri",
      description:
        "Fatura yüklenici firma tarafından düzenlenir, KDV oranları ve birim fiyatlar doğrulanır.",
      status: completedSteps.includes(8)
        ? "completed"
        : currentStep === 8
        ? "current"
        : "pending",
      details:
        "Faturadaki KDV oranları, birim fiyatlar ve toplam tutar ile yaklaşık maliyet/piyasa tutanaklarındaki tutarlar tam uyumlu olmalıdır.",
      route: APP_ROUTES.FATURA_VE_IRSALIYE,
    },
    {
      id: 9,
      title: "Ödeme Talep Dilekçesi",
      subtitle: "Yüklenici Ödeme Başvurusu",
      description:
        "Yüklenici firmanın alacağının kendi banka hesabına (IBAN) ödenmesi için harcama birimine sunduğu talep dilekçesidir.",
      status: completedSteps.includes(9)
        ? "completed"
        : currentStep === 9
        ? "current"
        : "pending",
      details:
        "Resmi dilekçede firmanın unvanı, fatura bilgileri ve ödemenin yapılacağı IBAN adresi yer alır.",
      requiredDocs: ["Ödeme Talep Dilekçesi"],
    },
    {
      id: 10,
      title: "Taşınır İşlem Fişi (Varsa)",
      subtitle: "Malzemelerin Envantere Girişi",
      description:
        "Alınan malzemeler demirbaş veya tüketim malzemesi ise Taşınır Mal Yönetmeliği gereği envantere (TİF) kaydedilir.",
      status: completedSteps.includes(10)
        ? "completed"
        : currentStep === 10
        ? "current"
        : "pending",
      details:
        "TİF belgesi taşınır kayıt yetkilisi tarafından düzenlenir ve ödeme emri belgesinin ekine konulması yasal olarak zorunludur (Mal alımlarında).",
    },
    {
      id: 11,
      title: "Ödeme Emri Belgesi (ÖEB)",
      subtitle: "Muhasebe Ödeme İşlemi",
      description:
        "Gerçekleştirme görevlisi ve harcama yetkilisinin imzasıyla hazırlanan ÖEB muhasebe birimine gönderilir ve ödeme tamamlanır.",
      status: completedSteps.includes(11)
        ? "completed"
        : currentStep === 11
        ? "current"
        : "pending",
      details:
        "Tüm evrakların tam olduğu muhasebe yetkilisince onaylandıktan sonra, bütçe tertibinden yüklenicinin IBAN hesabına tutar EFT/Havale ile gönderilir ve dosya kapanır.",
      requiredDocs: ["Ödeme Emri Belgesi (MYS ÖEB)"],
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleStepComplete = (stepId: number) => {
    if (completedSteps.includes(stepId)) {
      setCompletedSteps(completedSteps.filter((id) => id !== stepId));
    } else {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleSaveStepData = (stepTitle: string) => {
    setIsSaved(stepTitle);
    setTimeout(() => setIsSaved(null), 3000);
  };

  const activeStepObj = steps.find((s) => s.id === currentStep) || steps[0];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/60 overflow-hidden animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex-none p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-850 dark:text-slate-100 flex items-center gap-2">
                Dosya Yönetim Paneli
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">
                  Beta
                </span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                Aktif dosyanızın ihtiyaç tespiti, muayene kabul, fatura ve ödeme
                gibi tüm işlemlerini tek ekrandan yönetin.
              </p>
            </div>
          </div>

          {activeDosya && (
            <div className="bg-slate-50 dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs">
              <Building className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                  {activeDosya.konu}
                </div>
                <div className="text-[10px] text-slate-500">
                  Dosya No: {activeDosya.temin_no || "Belirsiz"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Process Pipeline */}
        <div className="w-[480px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-y-auto p-4 custom-scrollbar">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 px-2">
            Adım Adım Süreç Adımları ({completedSteps.length} / 11 Tamamlandı)
          </h2>
          <div className="space-y-2">
            {steps.map((step) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = currentStep === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full flex items-start gap-4 p-3 rounded-xl border text-left transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/60 shadow-sm"
                      : isCompleted
                      ? "bg-slate-50/50 border-slate-100 dark:bg-slate-900/10 dark:border-slate-850 hover:bg-slate-100"
                      : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/40"
                  }`}
                >
                  {/* Circle Indicator */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/10"
                          : isActive
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 ring-4 ring-indigo-500/10"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    {step.id !== 11 && (
                      <div className="w-[1.5px] h-10 bg-slate-200 dark:bg-slate-800 mt-2" />
                    )}
                  </div>

                  {/* Title & Info */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-xs font-bold truncate ${
                          isActive
                            ? "text-indigo-700 dark:text-indigo-400"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {step.title}
                      </h3>
                      {isCompleted && (
                        <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-955/35 px-1.5 py-0.2 rounded uppercase">
                          Tamamlandı
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {step.subtitle}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 leading-normal font-normal">
                      {step.description}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 mt-2 shrink-0 transition-transform ${
                      isActive ? "translate-x-1 text-indigo-500" : ""
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side - Interactive Details Panel */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <div className="space-y-6">
            {/* Step Header Card */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">
                    ADIM #{activeStepObj.id}
                  </div>
                  <h2 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
                    {activeStepObj.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {activeStepObj.subtitle}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleStepComplete(activeStepObj.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    completedSteps.includes(activeStepObj.id)
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                      : "bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border-slate-250 dark:border-slate-800"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {completedSteps.includes(activeStepObj.id)
                      ? "Tamamlandı"
                      : "Tamamlandı Olarak İşaretle"}
                  </span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-900 pt-4 text-xs text-slate-600 dark:text-slate-355 leading-relaxed font-normal">
                {activeStepObj.details}
              </div>

              {activeStepObj.requiredDocs && (
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />{" "}
                    Gereken Belgeler / Çıktılar
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    {activeStepObj.requiredDocs.map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Interactive Section depending on Step ID */}
            {activeStepObj.id === 6 && (
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500" />{" "}
                  Teslim Tesellüm Bilgileri Girişi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Teslim Eden (Yüklenici Temsilcisi)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="teslimEden"
                        value={formInputs.teslimEden}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Örn: Ahmet Yılmaz"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Teslim Alan (Kurum Görevlisi)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="teslimAlan"
                        value={formInputs.teslimAlan}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Örn: Mehmet Demir"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleSaveStepData("teslim")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    Bilgileri Kaydet
                  </button>
                </div>
              </div>
            )}

            {activeStepObj.id === 8 && (
              <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500" />{" "}
                  Fatura Detayları Girişi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Fatura No
                    </label>
                    <input
                      type="text"
                      name="faturaNo"
                      value={formInputs.faturaNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Örn: GIB2026000018"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Fatura Tarihi
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        name="faturaTarihi"
                        value={formInputs.faturaTarihi}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Fatura Tutarı (TL)
                    </label>
                    <input
                      type="text"
                      name="faturaTutari"
                      value={formInputs.faturaTutari}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Örn: 24.500,00"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleSaveStepData("fatura")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    Fatura Bilgilerini Kaydet
                  </button>
                </div>
              </div>
            )}

            {activeStepObj.id === 9 && (
              <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500" />{" "}
                  Ödeme Talep ve IBAN Bilgisi
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Ödemenin Yapılacağı Banka IBAN Numarası
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="iban"
                        value={formInputs.iban}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleSaveStepData("iban")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    IBAN Bilgisini Kaydet
                  </button>
                </div>
              </div>
            )}

            {activeStepObj.id === 10 && (
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-indigo-500" />{" "}
                  Taşınır İşlem Fişi (TİF) Takibi
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Taşınır Fiş Numarası (TİF No)
                    </label>
                    <input
                      type="text"
                      name="tasinirFisNo"
                      value={formInputs.tasinirFisNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Örn: 2026/458"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleSaveStepData("tif")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    TİF Numarasını Kaydet
                  </button>
                </div>
              </div>
            )}

            {isSaved && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 text-green-800 dark:text-green-300 p-3.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-300">
                <Check className="w-4 h-4 text-green-500" />
                <span>
                  İlgili aşama bilgileri başarıyla yerel taslağa kaydedildi.
                </span>
              </div>
            )}
          </div>

          {/* Action Footer for Selected Step */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4" />
              <span>
                {activeStepObj.route
                  ? "Bu aşamaya özel işlemler ve veri giriş ekranı mevcuttur."
                  : "Bu aşama genel takip listesine dahildir."}
              </span>
            </div>

            <div className="flex gap-2">
              {activeStepObj.route && (
                <button
                  onClick={() => navigate({ to: activeStepObj.route as any })}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  İşlem Ekranına Git
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {activeStepObj.requiredDocs && (
                <button
                  onClick={() =>
                    navigate({ to: APP_ROUTES.DOSYA_CIKTI_MERKEZI as any })}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-md shadow-indigo-500/25 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Belgeleri Yazdır
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
