/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, Trash2, Printer, FileText, User, Calendar, MapPin, Info, Edit3, Eye, RotateCcw, Check, Bold, Italic, Underline, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Mourner {
  id: string;
  name: string;
  relation: string;
}

interface LelayuData {
  origin: string;
  name: string;
  parentName: string;
  gender: 'Laki-laki' | 'Perempuan';
  age: string;
  deathDay: string;
  deathDate: string;
  deathTime: string;
  deathCause: string;
  funeralDay: string;
  funeralDate: string;
  funeralTime: string;
  funeralLocation: string;
  mourners: Mourner[];
  communityMourner: string;
}

const STORAGE_KEY = 'lelayu_digital_data_v1';
const CUSTOM_PREVIEW_KEY = 'lelayu_custom_preview_html_v1';

function generateLelayuHtml(data: LelayuData): string {
  const deathSection = (data.deathDay || data.deathDate || data.deathTime || data.deathCause) ? `
    <div class="flex gap-4">
      <span class="w-32 text-lg">Sedo rikala</span>
      <span>:</span>
    </div>
    <div class="pl-8 space-y-0.5 text-lg">
      ${data.deathDay ? `<div class="flex gap-4"><span class="w-24">Dinten</span><span>: ${data.deathDay}</span></div>` : ''}
      ${data.deathDate ? `<div class="flex gap-4"><span class="w-24">Tanggal</span><span>: ${formatDate(data.deathDate)}</span></div>` : ''}
      ${data.deathTime ? `<div class="flex gap-4"><span class="w-24">Wanci</span><span>: ${data.deathTime}</span></div>` : ''}
      ${data.deathCause ? `<div class="flex gap-4"><span class="w-24">Jalaran</span><span>: ${data.deathCause}</span></div>` : ''}
    </div>
  ` : '';

  const funeralSection = (data.funeralDay || data.funeralDate || data.funeralTime || data.funeralLocation) ? `
    <div class="flex gap-4 pt-1">
      <span class="text-lg">Layon badhe kasarekaken :</span>
    </div>
    <div class="pl-8 space-y-0.5 text-lg">
      ${data.funeralDay ? `<div class="flex gap-4"><span class="w-24">Dinten</span><span>: ${data.funeralDay}</span></div>` : ''}
      ${data.funeralDate ? `<div class="flex gap-4"><span class="w-24">Tanggal</span><span>: ${formatDate(data.funeralDate)}</span></div>` : ''}
      ${data.funeralTime ? `<div class="flex gap-4"><span class="w-24">Wanci</span><span>: ${data.funeralTime}</span></div>` : ''}
      ${data.funeralLocation ? `<div class="flex gap-4"><span class="w-24">Wonten</span><span>: ${data.funeralLocation}</span></div>` : ''}
    </div>
  ` : '';

  const mournersRows = data.mourners.map((m, i) => `
    <tr class="align-baseline">
      <td class="w-6 pr-2 py-0.5 select-none text-left">${i + 1}.</td>
      <td class="pr-8 py-0.5 text-left whitespace-nowrap">${m.name}</td>
      <td class="py-0.5 text-left whitespace-nowrap">${m.relation ? `(${m.relation})` : ''}</td>
    </tr>
  `).join('');

  const communityRow = data.communityMourner ? `
    <tr class="align-baseline">
      <td class="w-6 pr-2 py-0.5 select-none text-left">${data.mourners.length + 1}.</td>
      <td colspan="2" class="py-0.5 text-left">Keluarga Masyarakat ${data.communityMourner}</td>
    </tr>
  ` : '';

  return `
    <div class="text-center space-y-1 mb-4">
      <h1 class="text-4xl font-bold tracking-[0.2em] mb-1">LELAYU</h1>
      <p class="italic text-xl">Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
      ${data.origin ? `<p class="text-base italic">Saking ${data.origin}</p>` : ''}
    </div>

    <div class="text-center space-y-2">
      <p class="text-2xl font-bold">Innalillahi wa inna ilaihi roji'un</p>
      
      <p class="text-lg">
        Sampun kapundhut wangsul ing ngarsanipun Allah SWT, sedherek/warga kula panjenengan sami:
      </p>

      <div class="space-y-1">
        ${data.name ? `
          <p class="text-3xl font-bold underline decoration-2 underline-offset-4">
            ${data.gender === 'Perempuan' ? 'Almarhumah Ibu' : 'Almarhum Bapak'} ${data.name} ${data.parentName ? `binti ${data.parentName}` : ''}
          </p>
        ` : ''}
        ${data.age ? `<p class="text-xl italic">Umur ${data.age} Tahun</p>` : ''}
      </div>

      <div class="text-left max-w-lg mx-auto space-y-1.5 py-2">
        ${deathSection}
        ${funeralSection}
      </div>

      <p class="text-base text-justify leading-relaxed">
        Pramila saking punika, mbok bilih nalika sugengipun almarhum${data.gender === 'Perempuan' ? 'ah' : ''} kagungan kalepatan dhumateng panjenengan sedaya, kulawarga nyuwunaken agunging pangapunten. Kulawarga ugi nyuwun tambahing pandonga, mugi almarhum${data.gender === 'Perempuan' ? 'ah' : ''} husnul khotimah, dipunapunten sedaya dosa-dosanipun, saha amal ibadahipun katampi ing ngarsanipun Allah SWT. Amin Ya Rabbal 'Alamin.
      </p>

      <div class="text-left pt-4">
        <p class="font-bold mb-1 text-lg">Ingkang nandhang sungkawa:</p>
        <div class="pl-4 text-base">
          <table class="border-collapse">
            <tbody>
              ${mournersRows}
              ${communityRow}
            </tbody>
          </table>
        </div>
      </div>

      <p class="italic text-xl pt-3">Wassalamu'alaikum Warahmatullahi Wabarakatuh</p>

      <div class="flex justify-end pt-4 pr-8">
        <div class="text-center min-w-[200px]">
          <p class="text-lg ${data.mourners.length > 8 ? 'mb-10' : 'mb-14'}">Ketua Pemuda</p>
          <p class="text-lg font-bold">( ............................ )</p>
        </div>
      </div>
    </div>
  `;
}

function getJavaneseDay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return '';
    const target = new Date(Date.UTC(y, m - 1, d));
    // Anchor astronomis & historis: 17 Agustus 1945 = Jumat Legi
    const anchor = new Date(Date.UTC(1945, 7, 17));
    const diffDays = Math.round((target.getTime() - anchor.getTime()) / 86400000);

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const pasarans = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];

    const dayName = days[target.getUTCDay()];
    const pasaranIndex = ((diffDays % 5) + 5) % 5;
    const pasaranName = pasarans[pasaranIndex];

    return `${dayName} ${pasaranName}`;
  } catch {
    return '';
  }
}

const defaultToday = new Date().toISOString().split('T')[0];

const initialData: LelayuData = {
  origin: 'Dukuh Tegalsari RT 01/RW 09, Wonoboyo, Jogonalan, Klaten',
  name: '',
  parentName: '',
  gender: 'Laki-laki',
  age: '',
  deathDay: getJavaneseDay(defaultToday),
  deathDate: defaultToday,
  deathTime: '',
  deathCause: '',
  funeralDay: getJavaneseDay(defaultToday),
  funeralDate: defaultToday,
  funeralTime: '',
  funeralLocation: '',
  mourners: [],
  communityMourner: 'Tegalsari RT 01/RW 09',
};

export default function App() {
  const [data, setData] = useState<LelayuData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialData, ...parsed };
      }
    } catch (e) {
      console.error('Error loading saved lelayu data', e);
    }
    return initialData;
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [hasManualEdits, setHasManualEdits] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem(CUSTOM_PREVIEW_KEY);
    } catch {
      return false;
    }
  });
  const manualHtmlRef = useRef<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      manualHtmlRef.current = localStorage.getItem(CUSTOM_PREVIEW_KEY);
    } catch {
      manualHtmlRef.current = null;
    }
  }, []);

  // Sinkronkan lembar pratinjau ketika beralih tab atau data form berubah (jika belum ada editan manual)
  useEffect(() => {
    if (activeTab === 'preview' && previewRef.current) {
      if (hasManualEdits && manualHtmlRef.current) {
        previewRef.current.innerHTML = manualHtmlRef.current;
      } else {
        previewRef.current.innerHTML = generateLelayuHtml(data);
      }
    }
  }, [activeTab, data, hasManualEdits]);

  // Simpan otomatis ke localStorage setiap kali ada perubahan data form
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setIsSaved(true);
    } catch (e) {
      console.error('Error saving lelayu data to localStorage', e);
    }
  }, [data]);

  const handlePreviewInput = () => {
    if (previewRef.current) {
      manualHtmlRef.current = previewRef.current.innerHTML;
      setHasManualEdits(true);
      try {
        localStorage.setItem(CUSTOM_PREVIEW_KEY, previewRef.current.innerHTML);
      } catch (e) {
        console.error('Error saving manual preview', e);
      }
    }
  };

  const handleSyncFromForm = () => {
    if (previewRef.current) {
      const freshHtml = generateLelayuHtml(data);
      previewRef.current.innerHTML = freshHtml;
      manualHtmlRef.current = null;
      setHasManualEdits(false);
      try {
        localStorage.removeItem(CUSTOM_PREVIEW_KEY);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const executeFormat = (cmd: string) => {
    document.execCommand(cmd, false);
    if (previewRef.current) {
      handlePreviewInput();
    }
  };

  const handleReset = () => {
    setData(initialData);
    manualHtmlRef.current = null;
    setHasManualEdits(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CUSTOM_PREVIEW_KEY);
    } catch (e) {
      console.error(e);
    }
    if (previewRef.current) {
      previewRef.current.innerHTML = generateLelayuHtml(initialData);
    }
    setShowResetConfirm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'deathDate') {
      const autoDay = getJavaneseDay(value);
      setData((prev) => ({
        ...prev,
        deathDate: value,
        deathDay: autoDay || prev.deathDay,
      }));
      return;
    }
    if (name === 'funeralDate') {
      const autoDay = getJavaneseDay(value);
      setData((prev) => ({
        ...prev,
        funeralDate: value,
        funeralDay: autoDay || prev.funeralDay,
      }));
      return;
    }
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMournerChange = (id: string, field: keyof Mourner, value: string) => {
    setData((prev) => ({
      ...prev,
      mourners: prev.mourners.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));
  };

  const addMourner = () => {
    const newId = Date.now().toString();
    setLastAddedId(newId);
    setData((prev) => ({
      ...prev,
      mourners: [...prev.mourners, { id: newId, name: '', relation: '' }],
    }));
  };

  const removeMourner = (id: string) => {
    setData((prev) => ({
      ...prev,
      mourners: prev.mourners.filter((m) => m.id !== id),
    }));
  };

  const generatePDF = async () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setIsGenerating(true);

    const wasInEdit = activeTab === 'edit';
    if (wasInEdit) setActiveTab('preview');

    setTimeout(async () => {
      if (!previewRef.current) {
        setIsGenerating(false);
        return;
      }

      if (wasInEdit && !previewRef.current.innerHTML) {
        previewRef.current.innerHTML = (hasManualEdits && manualHtmlRef.current) ? manualHtmlRef.current : generateLelayuHtml(data);
      }

      try {
        const element = previewRef.current;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
        });

        const imgData = canvas.toDataURL('image/png');
        
        // Ukuran standar kertas F4 / Folio (Indonesia): 215 mm x 330 mm
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [215, 330],
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;

        // Hitung skala agar pas sempurna di 1 lembar F4 tanpa terpotong
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        const renderWidth = imgWidth * ratio;
        const renderHeight = imgHeight * ratio;

        // Posisikan presisi di tengah
        const xOffset = (pageWidth - renderWidth) / 2;
        const yOffset = 0;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight);
        pdf.save(`Lelayu_${data.name ? data.name.replace(/\s+/g, '_') : 'Tanpa_Nama'}_F4.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsGenerating(false);
        if (wasInEdit) setActiveTab('edit');
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-stone-900 p-1.5 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight hidden sm:block">Lelayu Digital</h1>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-stone-100 p-1 rounded-full border border-stone-200">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'edit' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'preview' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-save status indicator */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-500 bg-stone-50 px-2.5 py-1 rounded-full border border-stone-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Tersimpan otomatis</span>
            </div>

            {/* Tombol Reset / Buat Baru */}
            {showResetConfirm ? (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-xs px-2.5 py-1 rounded-full">
                <span className="text-red-700 font-medium">Reset form?</span>
                <button
                  onClick={handleReset}
                  className="text-red-600 hover:text-red-800 font-bold underline px-1"
                >
                  Ya
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="text-stone-500 hover:text-stone-700 px-1"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                title="Kosongkan form untuk membuat baru"
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-full transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Form</span>
              </button>
            )}

            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white px-4 py-2 rounded-full transition-all text-sm font-medium"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Simpan PDF (F4)</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' ? (
            <motion.div
              key="edit-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {/* Form Sections */}
              <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-stone-500" />
                  <h2 className="font-semibold text-stone-700">Informasi Dasar</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Asal / Alamat</label>
                    <input
                      type="text"
                      name="origin"
                      value={data.origin}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                      placeholder="Saking Dukuh..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Nama Almarhum/ah</label>
                      <input
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                        placeholder="Contoh: Supriyati"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Bin / Binti</label>
                      <input
                        type="text"
                        name="parentName"
                        value={data.parentName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                        placeholder="Contoh: Soekarno"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Jenis Kelamin</label>
                      <select
                        name="gender"
                        value={data.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                      >
                        <option value="Laki-laki">Laki-laki (Almarhum Bapak)</option>
                        <option value="Perempuan">Perempuan (Almarhumah Ibu)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Umur (Tahun)</label>
                      <input
                        type="text"
                        name="age"
                        value={data.age}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                        placeholder="Contoh: 50"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <h2 className="font-semibold text-stone-700">Waktu Meninggal (Sedo)</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Tanggal</label>
                    <input
                      type="date"
                      name="deathDate"
                      value={data.deathDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all font-medium text-stone-900"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider">Hari & Pasaran Jawa</label>
                      <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Otomatis</span>
                    </div>
                    <input
                      type="text"
                      name="deathDay"
                      value={data.deathDay}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all font-medium text-stone-800"
                      placeholder="Contoh: Rebo Wage"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Waktu (Wanci)</label>
                    <input
                      type="text"
                      name="deathTime"
                      value={data.deathTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                      placeholder="Contoh: 15.00 WIB"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Penyebab (Jalaran)</label>
                    <input
                      type="text"
                      name="deathCause"
                      value={data.deathCause}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                      placeholder="Contoh: Gerah sakwetawis"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-stone-500" />
                  <h2 className="font-semibold text-stone-700">Waktu Pemakaman (Kasarekaken)</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Tanggal</label>
                    <input
                      type="date"
                      name="funeralDate"
                      value={data.funeralDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all font-medium text-stone-900"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider">Hari & Pasaran Jawa</label>
                      <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Otomatis</span>
                    </div>
                    <input
                      type="text"
                      name="funeralDay"
                      value={data.funeralDay}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all font-medium text-stone-800"
                      placeholder="Contoh: Kamis Kliwon"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Waktu</label>
                    <input
                      type="text"
                      name="funeralTime"
                      value={data.funeralTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                      placeholder="Contoh: 10.00 WIB"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Lokasi (Wonten)</label>
                    <input
                      type="text"
                      name="funeralLocation"
                      value={data.funeralLocation}
                      onChange={handleChange}
                      list="location-suggestions"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                      placeholder="Contoh: Sasonoloyo Dukuh..."
                    />
                    <datalist id="location-suggestions">
                      <option value="Nolojayan, Somopuro, Jogonalan" />
                      <option value="Wonoboyo, Wonoboyo, Jogonalan" />
                      <option value="Cucukan, Wonoboyo, Jogonalan" />
                    </datalist>
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-500" />
                    <h2 className="font-semibold text-stone-700">Keluarga (Nandhang Sungkawa)</h2>
                  </div>
                  <button
                    onClick={addMourner}
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {data.mourners.length === 0 && (
                    <p className="text-sm text-stone-400 italic text-center py-4">Belum ada daftar keluarga. Klik ikon tambah untuk menambahkan.</p>
                  )}
                  <AnimatePresence>
                    {data.mourners.map((mourner, index) => (
                      <motion.div
                        key={mourner.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-xs font-mono text-stone-400 w-4">{index + 1}.</span>
                        <input
                          type="text"
                          value={mourner.name}
                          autoFocus={mourner.id === lastAddedId}
                          onChange={(e) => handleMournerChange(mourner.id, 'name', e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                          placeholder="Nama"
                        />
                        <input
                          type="text"
                          value={mourner.relation}
                          onChange={(e) => handleMournerChange(mourner.id, 'relation', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addMourner();
                            }
                          }}
                          list="relation-suggestions"
                          className="w-32 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                          placeholder="Hubungan"
                        />
                        <datalist id="relation-suggestions">
                          <option value="suami" />
                          <option value="istri" />
                          <option value="anak/menantu" />
                          <option value="anak" />
                          <option value="adik" />
                          <option value="kakak" />
                          <option value="kakek" />
                          <option value="nenek" />
                        </datalist>
                        <button
                          onClick={() => removeMourner(mourner.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <div className="pt-4 border-t border-stone-100">
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Keluarga Masyarakat (Default)</label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-stone-400 w-4">{data.mourners.length + 1}.</span>
                      <div className="flex-1 flex items-center bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-sm">
                        <span className="text-stone-500 mr-1">Keluarga Masyarakat</span>
                        <input
                          type="text"
                          name="communityMourner"
                          value={data.communityMourner}
                          onChange={handleChange}
                          className="flex-1 bg-transparent focus:outline-none"
                          placeholder="Tegalsari RT 01/RW 09"
                        />
                      </div>
                      <div className="w-32"></div>
                      <div className="w-7"></div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="preview-tab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col items-center"
            >
              {/* Preview Action Bar / Toolbar */}
              <div className="w-full max-w-[215mm] mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium bg-stone-100 px-3 py-1.5 rounded-full">
                    <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                    <span>Mode Edit Manual Aktif</span>
                  </div>
                  {hasManualEdits ? (
                    <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">
                      Teks Diedit Manual
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-500 hidden sm:inline">
                      (Klik teks mana saja pada kertas untuk mengedit langsung)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Formatting Buttons */}
                  <div className="flex items-center border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                    <button
                      type="button"
                      onClick={() => executeFormat('bold')}
                      title="Tebal (Ctrl+B)"
                      className="p-1.5 hover:bg-white hover:shadow-xs rounded text-stone-700 transition-colors"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeFormat('italic')}
                      title="Miring (Ctrl+I)"
                      className="p-1.5 hover:bg-white hover:shadow-xs rounded text-stone-700 transition-colors"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeFormat('underline')}
                      title="Garis Bawah (Ctrl+U)"
                      className="p-1.5 hover:bg-white hover:shadow-xs rounded text-stone-700 transition-colors"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Sync from Form */}
                  <button
                    type="button"
                    onClick={handleSyncFromForm}
                    title="Kembalikan teks sesuai isian tab Edit"
                    className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sinkronkan Ulang dari Form</span>
                  </button>
                </div>
              </div>

              {/* F4 (Folio) Paper Container */}
              <div className="bg-stone-200 p-4 sm:p-8 rounded-lg shadow-inner overflow-auto max-w-full">
                <div
                  ref={previewRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handlePreviewInput}
                  className="bg-white shadow-2xl mx-auto focus:outline-none cursor-text select-text"
                  style={{
                    width: '215mm',
                    minHeight: '330mm',
                    padding: '12mm 15mm',
                    boxSizing: 'border-box',
                    fontFamily: '"Times New Roman", Times, serif',
                    color: '#000',
                    lineHeight: data.mourners.length > 15 ? '1.25' : data.mourners.length > 8 ? '1.35' : '1.4',
                    fontSize: data.mourners.length > 20 ? '0.8rem' : data.mourners.length > 15 ? '0.88rem' : data.mourners.length > 8 ? '0.95rem' : '1.02rem',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
