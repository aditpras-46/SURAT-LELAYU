/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Download, Plus, Trash2, Printer, FileText, User, Calendar, MapPin, Info, Edit3, Eye } from 'lucide-react';
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

const initialData: LelayuData = {
  origin: 'Dukuh Tegalsari RT 01/RW 09, Wonoboyo, Jogonalan, Klaten',
  name: '',
  parentName: '',
  gender: 'Laki-laki',
  age: '',
  deathDay: '',
  deathDate: new Date().toISOString().split('T')[0],
  deathTime: '',
  deathCause: '',
  funeralDay: '',
  funeralDate: new Date().toISOString().split('T')[0],
  funeralTime: '',
  funeralLocation: '',
  mourners: [],
  communityMourner: 'Tegalsari RT 01/RW 09',
};

export default function App() {
  const [data, setData] = useState<LelayuData>(initialData);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
    // We need to make sure the preview is rendered even if the tab is 'edit'
    // For simplicity, we'll switch to preview tab briefly or ensure it's in the DOM
    setIsGenerating(true);

    // If we are in edit mode, we might need a hidden preview or switch briefly
    const wasInEdit = activeTab === 'edit';
    if (wasInEdit) setActiveTab('preview');

    // Wait for state update and render
    setTimeout(async () => {
      if (!previewRef.current) {
        setIsGenerating(false);
        return;
      }

      try {
        const canvas = await html2canvas(previewRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Lelayu_${data.name || 'Tanpa_Nama'}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsGenerating(false);
        if (wasInEdit) setActiveTab('edit');
      }
    }, 100);
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
            <span className="hidden sm:inline">Simpan PDF</span>
          </button>
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
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Hari (Jawa/Nasional)</label>
                    <input
                      type="text"
                      name="deathDay"
                      value={data.deathDay}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                      placeholder="Contoh: Rebo Wage"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Tanggal</label>
                    <input
                      type="date"
                      name="deathDate"
                      value={data.deathDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
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
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Hari</label>
                    <input
                      type="text"
                      name="funeralDay"
                      value={data.funeralDay}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                      placeholder="Contoh: Kamis Kliwon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Tanggal</label>
                    <input
                      type="date"
                      name="funeralDate"
                      value={data.funeralDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
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
              className="flex justify-center"
            >
              {/* A4 Paper Container */}
              <div className="bg-stone-200 p-4 sm:p-8 rounded-lg shadow-inner overflow-auto max-w-full">
                <div
                  ref={previewRef}
                  className="bg-white shadow-2xl mx-auto"
                  style={{
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '10mm 15mm',
                    boxSizing: 'border-box',
                    fontFamily: '"Times New Roman", Times, serif',
                    color: '#000',
                    lineHeight: data.mourners.length > 15 ? '1.3' : '1.4',
                    fontSize: data.mourners.length > 20 ? '0.75rem' : data.mourners.length > 15 ? '0.85rem' : data.mourners.length > 10 ? '0.95rem' : '1rem'
                  }}
                >
                  <div className="text-center space-y-1 mb-4">
                    <h1 className="text-4xl font-bold tracking-[0.2em] mb-1">LELAYU</h1>
                    <p className="italic text-xl">Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
                    {data.origin && (
                      <p className="text-base italic">Saking {data.origin}</p>
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-2xl font-bold">Innalillahi wa inna ilaihi roji'un</p>
                    
                    <p className="text-lg">
                      Sampun kapundhut wangsul ing ngarsanipun Allah SWT, sedherek/warga kula panjenengan sami:
                    </p>

                    <div className="space-y-1">
                      {data.name && (
                        <p className="text-3xl font-bold underline decoration-2 underline-offset-4">
                          {data.gender === 'Perempuan' ? 'Almarhumah Ibu' : 'Almarhum Bapak'} {data.name} {data.parentName ? `binti ${data.parentName}` : ''}
                        </p>
                      )}
                      {data.age && (
                        <p className="text-xl italic">Umur {data.age} Tahun</p>
                      )}
                    </div>

                    <div className="text-left max-w-lg mx-auto space-y-1.5 py-2">
                      {(data.deathDay || data.deathDate || data.deathTime || data.deathCause) && (
                        <>
                          <div className="flex gap-4">
                            <span className="w-32 text-lg">Sedo rikala</span>
                            <span>:</span>
                          </div>
                          <div className="pl-8 space-y-0.5 text-lg">
                            {data.deathDay && (
                              <div className="flex gap-4">
                                <span className="w-24">Dinten</span>
                                <span>: {data.deathDay}</span>
                              </div>
                            )}
                            {data.deathDate && (
                              <div className="flex gap-4">
                                <span className="w-24">Tanggal</span>
                                <span>: {formatDate(data.deathDate)}</span>
                              </div>
                            )}
                            {data.deathTime && (
                              <div className="flex gap-4">
                                <span className="w-24">Wanci</span>
                                <span>: {data.deathTime}</span>
                              </div>
                            )}
                            {data.deathCause && (
                              <div className="flex gap-4">
                                <span className="w-24">Jalaran</span>
                                <span>: {data.deathCause}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {(data.funeralDay || data.funeralDate || data.funeralTime || data.funeralLocation) && (
                        <>
                          <div className="flex gap-4 pt-1">
                            <span className="text-lg">Layon badhe kasarekaken :</span>
                          </div>
                          <div className="pl-8 space-y-0.5 text-lg">
                            {data.funeralDay && (
                              <div className="flex gap-4">
                                <span className="w-24">Dinten</span>
                                <span>: {data.funeralDay}</span>
                              </div>
                            )}
                            {data.funeralDate && (
                              <div className="flex gap-4">
                                <span className="w-24">Tanggal</span>
                                <span>: {formatDate(data.funeralDate)}</span>
                              </div>
                            )}
                            {data.funeralTime && (
                              <div className="flex gap-4">
                                <span className="w-24">Wanci</span>
                                <span>: {data.funeralTime}</span>
                              </div>
                            )}
                            {data.funeralLocation && (
                              <div className="flex gap-4">
                                <span className="w-24">Wonten</span>
                                <span>: {data.funeralLocation}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <p className="text-base text-justify leading-relaxed">
                      Pramila saking punika, mbok bilih nalika sugengipun almarhum{data.gender === 'Perempuan' ? 'ah' : ''} kagungan kalepatan dhumateng panjenengan sedaya, kulawarga nyuwunaken agunging pangapunten. Kulawarga ugi nyuwun tambahing pandonga, mugi almarhum{data.gender === 'Perempuan' ? 'ah' : ''} husnul khotimah, dipunapunten sedaya dosa-dosanipun, saha amal ibadahipun katampi ing ngarsanipun Allah SWT. Amin Ya Rabbal 'Alamin.
                    </p>

                    <p className="italic text-xl pt-1">Wassalamu'alaikum Warahmatullahi Wabarakatuh</p>

                    <div className="flex justify-between items-start pt-12">
                      <div className="text-left">
                        <p className="font-bold mb-1 text-lg">Ingkang nandhang sungkawa:</p>
                        <div className="space-y-0.5 pl-4 text-base">
                          {data.mourners.map((m, i) => (
                            <div key={m.id} className="flex gap-4">
                              <span className="w-4">{i + 1}.</span>
                              <span className="flex-1">{m.name}</span>
                              <span className="w-32">{m.relation ? `(${m.relation})` : ''}</span>
                            </div>
                          ))}
                          {data.communityMourner && (
                            <div className="flex gap-4">
                              <span className="w-4">{data.mourners.length + 1}.</span>
                              <span className="flex-1">Keluarga Masyarakat {data.communityMourner}</span>
                              <span className="w-32"></span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center pt-32 pr-8">
                        <p className="text-lg mb-24">Ketua Pemuda</p>
                        <p className="text-lg font-bold">( ............................ )</p>
                      </div>
                    </div>
                  </div>
                </div>
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
