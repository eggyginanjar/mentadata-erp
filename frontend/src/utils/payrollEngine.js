/**
 * file: frontend/src/utils/payrollEngine.js
 * Mesin Kalkulasi Lembur & Payroll (Sesuai PP No. 35 Tahun 2021)
 */

export const calculateLembur = (upahSebulan, jamLembur, isHariLibur = false, skemaHariKerja = 6) => {
  // 1. Hitung Upah per Jam (Sesuai UU: 1/173 * Upah Sebulan)
  const upahPerJam = upahSebulan / 173;
  
  let totalUpahLembur = 0;
  let rincian = [];
  let sisaJam = Number(jamLembur); // Pastikan format angka (mendukung desimal misal 2.5 jam)

  if (!isHariLibur) {
    // ==========================================
    // A. LEMBUR HARI KERJA BIASA
    // ==========================================
    
    // Jam Pertama (1.5x)
    if (sisaJam > 0) {
      const jamHitung = Math.min(sisaJam, 1);
      const nilai = jamHitung * 1.5 * upahPerJam;
      totalUpahLembur += nilai;
      rincian.push(`Jam ke-1 (1.5x): Rp ${Math.round(nilai).toLocaleString('id-ID')}`);
      sisaJam -= jamHitung;
    }
    
    // Jam Kedua dan seterusnya (2x)
    if (sisaJam > 0) {
      const nilai = sisaJam * 2 * upahPerJam;
      totalUpahLembur += nilai;
      rincian.push(`Jam ke-2 dst (${sisaJam} jam x 2x): Rp ${Math.round(nilai).toLocaleString('id-ID')}`);
    }
    
  } else {
    // ==========================================
    // B. LEMBUR HARI LIBUR / ISTIRAHAT MINGGUAN
    // ==========================================
    
    if (skemaHariKerja === 6) {
      // Skema 6 Hari Kerja (Maks 40 Jam/Minggu)
      // Jam 1 s.d 7: 2x
      if (sisaJam > 0) {
        const jamHitung = Math.min(sisaJam, 7);
        const nilai = jamHitung * 2 * upahPerJam;
        totalUpahLembur += nilai;
        rincian.push(`Jam 1-7 (${jamHitung} jam x 2x): Rp ${Math.round(nilai).toLocaleString('id-ID')}`);
        sisaJam -= jamHitung;
      }
      // Jam ke-8: 3x
      if (sisaJam > 0) {
        const jamHitung = Math.min(sisaJam, 1);
        const nilai = jamHitung * 3 * upahPerJam;
        totalUpahLembur += nilai;
        rincian.push(`Jam ke-8 (1 jam x 3x): Rp ${Math.round(nilai).toLocaleString('id-ID')}`);
        sisaJam -= jamHitung;
      }
      // Jam ke-9 dan seterusnya: 4x
      if (sisaJam > 0) {
        const nilai = sisaJam * 4 * upahPerJam;
        totalUpahLembur += nilai;
        rincian.push(`Jam ke-9 dst (${sisaJam} jam x 4x): Rp ${Math.round(nilai).toLocaleString('id-ID')}`);
      }

    } else if (skemaHariKerja === 5) {
      // Skema 5 Hari Kerja (Maks 40 Jam/Minggu)
      // Jam 1 s.d 8: 2x
      if (sisaJam > 0) {
        const jamHitung = Math.min(sisaJam, 8);
        const nilai = jamHitung * 2 * upahPerJam;
        totalUpahLembur += nilai;
        rincian.push(`Jam 1-8 (${jamHitung} jam x 2x): Rp ${Math.round(nilai).toLocaleString('id-ID')}`);
        sisaJam -= jamHitung;
      }
      // Jam ke-9: 3x
      if (sisaJam > 0) {
        const jamHitung = Math.min(sisaJam, 1);
        const nilai = jamHitung * 3 * upahPerJam;
        totalUpahLembur += nilai;
        rincian.push(`Jam ke-9 (1 jam x 3x): Rp ${Math.round(nilai).toLocaleString('id-ID')}`);
        sisaJam -= jamHitung;
      }
      // Jam ke-10 dan seterusnya: 4x
      if (sisaJam > 0) {
        const nilai = sisaJam * 4 * upahPerJam;
        totalUpahLembur += nilai;
        rincian.push(`Jam ke-10 dst (${sisaJam} jam x 4x): Rp ${Math.round(nilai).toLocaleString('id-ID')}`);
      }
    }
  }

  // Cek Hak Penunjang Makanan (> 4 jam) sesuai Pasal 33 PP 35/2021
  const wajibMakanMinum = jamLembur >= 4;

  // Kembalikan objek data yang matang dan dibulatkan (agar rapi saat masuk ke slip gaji)
  return {
    upahPerJam: Math.round(upahPerJam),
    totalJamLembur: jamLembur,
    isHariLibur,
    totalUpahLembur: Math.round(totalUpahLembur),
    wajibMakanMinum,
    rincianKalkulasi: rincian
  };
}