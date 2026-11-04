<template>
  <div class="mobile-frame">
    <!-- Status Bar Smartphone -->
    <div class="phone-status-bar">
      <span>13:45</span>
      <div class="phone-icons">
        <span>📶</span>
        <span>🔋</span>
      </div>
    </div>

    <!-- Header Profil Instansi (Tema Biru Dongker & Emas) -->
    <div class="profile-header">
      <div class="user-profile-row">
        <div class="avatar-circle">SR</div>
        <div class="user-details">
          <h3>{{ activeEmployee ? activeEmployee.nama : 'Silakan Masukkan NIK' }}</h3>
          <p class="nik-text">NIK. {{ inputNik || '----------------' }}</p>
          <p class="instansi-text">FIRMA HUKUM SR LUMIERE</p>
          <p class="divisi-text">{{ activeEmployee ? activeEmployee.divisi : 'Divisi Administrasi & Operasional' }}</p>
        </div>
      </div>
      <div class="date-display-badge">
        📅 {{ currentDate }}
      </div>
    </div>

    <!-- Konten Utama -->
    <main class="app-body">
      
      <!-- MENU 1: BERANDA -->
      <div v-if="currentTab === 'beranda'" class="tab-pane">
        
        <!-- INPUT NIK 16 DIGIT -->
        <div class="input-container-card highlight-card">
          <label class="input-label">🔐 Masukkan NIK Karyawan (16 Digit)</label>
          <div class="input-row-group">
            <input 
              type="text" 
              v-model="inputNik" 
              maxlength="16" 
              placeholder="Contoh: 1995120420260110" 
              class="nik-input-field"
              @input="onNikInput"
            />
          </div>
          <small class="nik-hint" v-if="activeEmployee">✨ Terdeteksi: <strong>{{ activeEmployee.nama }}</strong></small>
          <small class="nik-hint-error" v-else-if="inputNik.length >= 10">❌ NIK tidak terdaftar dalam sistem!</small>
        </div>

        <!-- Info Jam Kerja Profesional -->
        <div class="shift-info-card">
          <span class="shift-title">⏱️ Standar Jam Kerja</span>
          <span class="shift-hours">07:30 - 17:00 WIB</span>
        </div>

        <!-- Jam Utama / Timer Live (Navy & Gold Glow) -->
        <div class="main-clock-display">
          <span class="clock-glow">{{ currentTime }}</span>
          <small class="clock-subtitle">Waktu Indonesia Barat (Real-Time)</small>
        </div>

        <!-- Tombol Masuk & Pulang -->
        <div class="attendance-grid-boxes">
          <div class="attendance-box box-navy" @click="handleAttendance('Masuk')">
            <div class="box-header-row">
              <span>Absen Masuk</span>
              <span class="clock-icon">📥</span>
            </div>
            <div class="box-time-val">{{ lastInTime }}</div>
            <small class="box-hint">Batas 07:30 WIB</small>
          </div>

          <div class="attendance-box box-gold" @click="handleAttendance('Keluar')">
            <div class="box-header-row">
              <span>Absen Pulang</span>
              <span class="clock-icon">📤</span>
            </div>
            <div class="box-time-val">{{ lastOutTime }}</div>
            <small class="box-hint">Standar 17:00 WIB</small>
          </div>
        </div>

        <!-- Notifikasi Status -->
        <div v-if="statusMessage" class="alert-banner animated-alert" :class="statusType">
          {{ statusMessage }}
        </div>

        <!-- 4 Kotak Statistik (Target 27 Hari) -->
        <div class="statistics-four-grid">
          <div class="stat-box">
            <small>Target</small>
            <strong>27 Hari</strong>
          </div>
          <div class="stat-box">
            <small>Hadir</small>
            <strong class="text-navy">{{ currentEmployeeStats.hadir }} Hr</strong>
          </div>
          <div class="stat-box">
            <small>Kehadiran</small>
            <strong class="text-gold">{{ currentEmployeeStats.persentase }}%</strong>
          </div>
          <div class="stat-box">
            <small>Terlambat</small>
            <strong class="text-rose">{{ currentEmployeeStats.terlambat }}x</strong>
          </div>
        </div>
      </div>

      <!-- MENU 2: NOTIFIKASI -->
      <div v-if="currentTab === 'notifikasi'" class="tab-pane">
        <h3 class="section-title">🔔 Pusat Informasi Sistem</h3>
        <div class="list-container">
          <div class="item-card">
            <div class="card-icon-title">🛡️ Sistem Penilaian Otomatis</div>
            <p>Pencatatan menit keterlambatan saat masuk dan deteksi status pulang cepat dihitung secara akurat tanpa pembatasan kunci harian.</p>
            <small>Firma Hukum SR Lumiere</small>
          </div>
        </div>
      </div>

      <!-- MENU 3: LAPORAN & KARTU REKAP HARIAN TERPADU -->
      <div v-if="currentTab === 'laporan'" class="tab-pane">
        <div class="header-action-row">
          <h3 class="section-title">📊 Rekapitulasi Presensi</h3>
          <button class="btn-refresh-sm" @click="fetchLogs">🔄 Muat Ulang</button>
        </div>

        <!-- TABEL SUMMARY 4 KARYAWAN -->
        <div class="table-container">
          <table class="summary-table">
            <thead>
              <tr>
                <th>Nama Karyawan</th>
                <th class="text-center">Hadir</th>
                <th class="text-center">Telat</th>
                <th class="text-center">%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in rekapAllEmployees" :key="emp.nik">
                <td class="emp-name-cell">
                  <strong>{{ emp.nama }}</strong>
                  <small>{{ emp.nik }}</small>
                </td>
                <td class="text-center font-bold text-navy">{{ emp.hadir }}</td>
                <td class="text-center font-bold text-rose">{{ emp.terlambat }}</td>
                <td class="text-center font-bold text-gold">{{ emp.persentase }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- RIWAYAT HARIAN TERPADU -->
        <h4 class="sub-section-title">📋 Log Harian Terpadu</h4>
        <div class="list-container">
          <div v-if="groupedDailyLogs.length === 0" class="empty-state">Belum ada riwayat tercatat.</div>
          
          <div v-for="item in groupedDailyLogs" :key="item.key" class="daily-unified-card">
            <div class="card-top-row">
              <span class="emp-title"><strong>{{ item.nama }}</strong></span>
              <span class="date-tag">📅 {{ item.tanggalFormat }}</span>
            </div>
            
            <div class="attendance-time-split">
              <div class="time-block">
                <small>MASUK</small>
                <span class="time-val text-navy">{{ item.jamMasuk }}</span>
                <span :class="['mini-badge', getStatusClass(item.statusMasuk)]">{{ item.statusMasuk }}</span>
              </div>
              <div class="divider-vertical"></div>
              <div class="time-block">
                <small>PULANG</small>
                <span class="time-val text-gold">{{ item.jamPulang }}</span>
                <span :class="['mini-badge', getStatusClass(item.statusPulang)]">{{ item.statusPulang }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MENU 4: PROFIL -->
      <div v-if="currentTab === 'profil'" class="tab-pane">
        <div class="profile-card-details">
          <div class="profile-big-icon">SR</div>
          <h3>Firma Hukum SR Lumiere</h3>
          <p class="text-muted">Manajemen Karyawan & Operasional</p>
          <hr class="separator" />
          <ul class="specs-list">
            <li v-for="emp in employeeList" :key="emp.nik">
              <span>{{ emp.nama }}</span> <strong>{{ emp.nik }}</strong>
            </li>
          </ul>
        </div>
      </div>

    </main>

    <!-- Navigasi Bawah Modern -->
    <nav class="bottom-navigation-bar">
      <button :class="['nav-item-btn', currentTab === 'beranda' ? 'active' : '']" @click="currentTab = 'beranda'">
        <span class="nav-icon">🏠</span>
        <span>Beranda</span>
      </button>
      
      <button :class="['nav-item-btn', currentTab === 'notifikasi' ? 'active' : '']" @click="currentTab = 'notifikasi'">
        <span class="nav-icon">🔔</span>
        <span>Notif</span>
      </button>

      <div class="center-floating-button" @click="currentTab = 'beranda'">
        <span class="fingerprint-icon">👆</span>
      </div>

      <button :class="['nav-item-btn', currentTab === 'laporan' ? 'active' : '']" @click="currentTab = 'laporan'">
        <span class="nav-icon">📊</span>
        <span>Laporan</span>
      </button>

      <button :class="['nav-item-btn', currentTab === 'profil' ? 'active' : '']" @click="currentTab = 'profil'">
        <span class="nav-icon">👤</span>
        <span>Profil</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from './supabase'

const currentTab = ref('beranda')

const employeeList = ref([
  { nama: 'Bayu Trisaputro', nik: '1995120420260110', divisi: 'Divisi Administrasi & Operasional' },
  { nama: 'Mika Kurniawati', nik: '1998051220260120', divisi: 'Divisi Legal & Dokumen' },
  { nama: 'Sujaka', nik: '1990032020260110', divisi: 'Divisi Litigasi & Hukum' },
  { nama: 'Widya', nik: '1997101520260120', divisi: 'Divisi Hubungan Klien & Publik' }
])

const inputNik = ref('')
const activeEmployee = ref(null)
const currentTime = ref('')
const currentDate = ref('')
const statusMessage = ref('')
const statusType = ref('info')
const logs = ref([])
const lastInTime = ref('--:--:--')
const lastOutTime = ref('--:--:--')
const isSaving = ref(false)
let timer = null

// Gunakan tanggal lokal agar tanggal absensi tidak bergeser karena konversi UTC.
const getLocalDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getLogEmployeeNik = (log) => {
  const match = String(log?.nama || '').match(/NIK:\s*(\d{16})/)
  return match ? match[1] : null
}

const onNikInput = () => {
  inputNik.value = inputNik.value.replace(/\D/g, '').slice(0, 16)
  const found = employeeList.value.find(emp => emp.nik === inputNik.value.trim())

  activeEmployee.value = found || null
  lastInTime.value = '--:--:--'
  lastOutTime.value = '--:--:--'
  statusMessage.value = ''

  if (found) checkTodayAttendance()
}

const groupedDailyLogs = computed(() => {
  const map = {}
  const sorted = [...logs.value].sort((a, b) => new Date(a.waktu) - new Date(b.waktu))

  sorted.forEach(log => {
    if (!log?.waktu || !log?.nama) return

    const dateObj = new Date(log.waktu)
    if (Number.isNaN(dateObj.getTime())) return

    const dateKey = getLocalDateKey(dateObj)
    const uniqueKey = `${log.nama}_${dateKey}`

    if (!map[uniqueKey]) {
      map[uniqueKey] = {
        key: uniqueKey,
        nama: log.nama,
        tanggalKey: dateKey,
        tanggalFormat: dateObj.toLocaleDateString('id-ID', {
          day: 'numeric', month: 'short', year: 'numeric'
        }),
        jamMasuk: '-',
        statusMasuk: 'Belum',
        jamPulang: '-',
        statusPulang: 'Belum'
      }
    }

    const timeStr = dateObj.toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit'
    }) + ' WIB'
    const tipe = String(log.tipe || '').toLowerCase()

    if (tipe.includes('masuk') || tipe.includes('terlambat')) {
      map[uniqueKey].jamMasuk = timeStr
      map[uniqueKey].statusMasuk = log.tipe
    } else if (tipe.includes('pulang') || tipe.includes('keluar') || tipe.includes('cepat')) {
      map[uniqueKey].jamPulang = timeStr
      map[uniqueKey].statusPulang = log.tipe
    }
  })

  return Object.values(map).reverse()
})

const rekapAllEmployees = computed(() => {
  return employeeList.value.map(emp => {
    const empDaily = groupedDailyLogs.value.filter(item => {
      const log = logs.value.find(row => row.nama === item.nama)
      return item.nama.includes(emp.nama) || getLogEmployeeNik(log || {}) === emp.nik
    })
    const hadir = empDaily.filter(item => item.jamMasuk !== '-').length
    const terlambat = empDaily.filter(item =>
      String(item.statusMasuk).toLowerCase().includes('terlambat')
    ).length
    const persentase = Math.min(Math.round((hadir / 27) * 100), 100)

    return { nama: emp.nama, nik: emp.nik, hadir, terlambat, persentase }
  })
})

const currentEmployeeStats = computed(() => {
  if (!activeEmployee.value) return { hadir: 0, terlambat: 0, persentase: 0 }
  return rekapAllEmployees.value.find(emp => emp.nik === activeEmployee.value.nik)
    || { hadir: 0, terlambat: 0, persentase: 0 }
})

const checkTodayAttendance = () => {
  if (!activeEmployee.value) return

  const todayStr = getLocalDateKey(new Date())
  const foundToday = groupedDailyLogs.value.find(item =>
    item.tanggalKey === todayStr &&
    (item.nama.includes(activeEmployee.value.nama) ||
      logs.value.some(log => getLogEmployeeNik(log) === activeEmployee.value.nik &&
        log.nama === item.nama))
  )

  lastInTime.value = foundToday?.jamMasuk || '--:--:--'
  lastOutTime.value = foundToday?.jamPulang || '--:--:--'
}

const updateClock = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

const fetchLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('absensi')
      .select('*')
      .order('id', { ascending: false })
      .limit(150)

    if (error) throw error
    logs.value = Array.isArray(data) ? data : []
    if (activeEmployee.value) checkTodayAttendance()
  } catch (err) {
    console.error('Gagal mengambil data absensi:', err)
    statusMessage.value = 'Gagal memuat riwayat absensi. Periksa koneksi Supabase.'
    statusType.value = 'error'
  }
}

const getStatusClass = (status) => {
  const s = String(status || '').toLowerCase()
  if (s.includes('terlambat')) return 'pill-rose'
  if (s.includes('tepat') || s.includes('masuk') || s.includes('jadwal')) return 'pill-navy-dark'
  if (s.includes('cepat') || s.includes('pulang') || s.includes('keluar')) return 'pill-gold'
  return 'pill-gray'
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
  fetchLogs()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const handleAttendance = async (type) => {
  if (!activeEmployee.value) {
    statusMessage.value = 'Masukkan NIK 16 digit yang terdaftar terlebih dahulu.'
    statusType.value = 'error'
    return
  }

  if (isSaving.value) return

  // Cegah absen masuk/pulang ganda pada hari yang sama di perangkat ini.
  const todayKey = getLocalDateKey(new Date())
  const todayLogs = logs.value.filter(log =>
    getLogEmployeeNik(log) === activeEmployee.value.nik &&
    log.waktu && getLocalDateKey(new Date(log.waktu)) === todayKey
  )
  const hasCheckedIn = todayLogs.some(log =>
    String(log.tipe || '').toLowerCase().includes('masuk') ||
    String(log.tipe || '').toLowerCase().includes('terlambat')
  )
  const hasCheckedOut = todayLogs.some(log => {
    const tipe = String(log.tipe || '').toLowerCase()
    return tipe.includes('pulang') || tipe.includes('keluar') || tipe.includes('cepat')
  })

  if (type === 'Masuk' && hasCheckedIn) {
    statusMessage.value = 'Absensi masuk hari ini sudah tercatat.'
    statusType.value = 'info'
    return
  }
  if (type === 'Keluar' && !hasCheckedIn) {
    statusMessage.value = 'Silakan lakukan absen masuk terlebih dahulu.'
    statusType.value = 'error'
    return
  }
  if (type === 'Keluar' && hasCheckedOut) {
    statusMessage.value = 'Absensi pulang hari ini sudah tercatat.'
    statusType.value = 'info'
    return
  }

  isSaving.value = true
  const now = new Date()
  const totalMinutes = now.getHours() * 60 + now.getMinutes()
  let statusAbsen = type

  if (type === 'Masuk') {
    const batasMasukMinutes = 7 * 60 + 30
    statusAbsen = totalMinutes > batasMasukMinutes
      ? `Terlambat ${totalMinutes - batasMasukMinutes} Menit`
      : 'Masuk Tepat Waktu'
  } else if (type === 'Keluar') {
    statusAbsen = totalMinutes < 17 * 60
      ? 'Pulang Cepat'
      : 'Pulang Sesuai Jadwal'
  }

  statusMessage.value = 'Menyimpan absensi ke cloud...'
  statusType.value = 'info'

  try {
    const formatDataAbsen = `${activeEmployee.value.nama} (NIK: ${activeEmployee.value.nik})`
    const { error } = await supabase.from('absensi').insert([{
      nama: formatDataAbsen,
      tipe: statusAbsen,
      waktu: now.toISOString()
    }])

    if (error) throw error

    statusMessage.value = `Berhasil: ${statusAbsen}.`
    statusType.value = statusAbsen.toLowerCase().includes('terlambat') ||
      statusAbsen.toLowerCase().includes('cepat') ? 'error' : 'success'

    await fetchLogs()
    checkTodayAttendance()
  } catch (err) {
    console.error('Gagal menyimpan absensi:', err)
    statusMessage.value = 'Gagal menyimpan absensi: ' + (err?.message || 'Terjadi kesalahan.')
    statusType.value = 'error'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.mobile-frame {
  max-width: 420px;
  height: 92vh;
  margin: 15px auto;
  background: #f8fafc;
  border-radius: 36px;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.25);
  border: 3px solid #94a3b8; /* Border luar tetap abu-abu tipis sesuai preferensi */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  font-family: system-ui, -apple-system, sans-serif;
}

.phone-status-bar {
  background: #0f172a;
  color: #e2e8f0;
  padding: 6px 20px;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 600;
}

.profile-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  color: white;
  padding: 16px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: 0 4px 15px rgba(15, 23, 42, 0.3);
}

.user-profile-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.avatar-circle {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  color: #0f172a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(234, 179, 8, 0.4);
}

.user-details h3 { font-size: 0.95rem; margin: 0; font-weight: 700; color: #fef08a; }
.nik-text { font-size: 0.7rem; color: #93c5fd; margin: 1px 0; font-weight: 600; }
.instansi-text { font-size: 0.65rem; color: #fef08a; margin: 0; font-weight: bold; letter-spacing: 0.5px; }
.divisi-text { font-size: 0.6rem; color: #cbd5e1; margin: 0; }

.date-display-badge {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(234, 179, 8, 0.3);
  padding: 5px 12px;
  border-radius: 16px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 500;
  color: #fef08a;
  letter-spacing: 0.3px;
}

.app-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.highlight-card {
  background: #ffffff;
  border: 1px solid #1e3a8a;
  box-shadow: 0 3px 12px rgba(30, 58, 138, 0.12);
}

.input-container-card {
  background: white;
  padding: 12px;
  border-radius: 12px;
}
.input-label { display: block; font-size: 0.75rem; font-weight: bold; color: #1e3a8a; margin-bottom: 6px; }

.nik-input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  outline: none;
  background: #f8fafc;
  color: #0f172a;
  letter-spacing: 1px;
}
.nik-input-field:focus { border-color: #1e3a8a; background: #fff; box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.15); }
.nik-hint { display: block; font-size: 0.65rem; color: #1e3a8a; margin-top: 5px; }
.nik-hint-error { display: block; font-size: 0.65rem; color: #e11d48; margin-top: 5px; }

.shift-info-card {
  background: white;
  padding: 8px 12px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #1e3a8a;
  font-weight: bold;
  border: 1px solid #e2e8f0;
}

.main-clock-display {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  color: white;
  padding: 14px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(234, 179, 8, 0.4);
  box-shadow: 0 4px 15px rgba(15, 23, 42, 0.25);
}
.clock-glow { font-size: 1.7rem; font-weight: bold; display: block; letter-spacing: 1px; color: #fef08a; }
.clock-subtitle { font-size: 0.6rem; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.5px; }

.attendance-grid-boxes {
  display: flex;
  gap: 10px;
}

.attendance-box {
  flex: 1;
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
  cursor: pointer;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}
.attendance-box:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(30, 58, 138, 0.12); }
.attendance-box:active { transform: scale(0.97); }

.box-navy { border-top: 4px solid #1e3a8a; }
.box-gold { border-top: 4px solid #ca8a04; }

.box-header-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 4px;
}

.box-time-val {
  font-size: 1.05rem;
  font-weight: bold;
  color: #0f172a;
}
.box-hint { font-size: 0.55rem; color: #94a3b8; display: block; margin-top: 2px; }

.alert-banner {
  padding: 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  text-align: center;
  font-weight: 600;
}
.alert-banner.info { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
.alert-banner.success { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
.alert-banner.error { background: #fee2e2; color: #b91c1c; }

.statistics-four-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.stat-box {
  background: white;
  padding: 8px 4px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.stat-box small { display: block; font-size: 0.55rem; color: #64748b; margin-bottom: 2px; font-weight: 600; }
.stat-box strong { font-size: 0.75rem; color: #0f172a; }
.text-navy { color: #1e3a8a; }
.text-gold { color: #ca8a04; }
.text-rose { color: #e11d48; }

.section-title { font-size: 0.9rem; color: #0f172a; margin: 0; font-weight: bold; }
.sub-section-title { font-size: 0.75rem; color: #475569; margin: 12px 0 6px 0; font-weight: bold; }

.table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7rem;
}

.summary-table th {
  background: #f1f5f9;
  color: #1e3a8a;
  padding: 8px 6px;
  text-align: left;
  font-weight: 700;
  border-bottom: 1px solid #cbd5e1;
}

.summary-table td {
  padding: 8px 6px;
  border-bottom: 1px solid #f1f5f9;
  color: #0f172a;
}

.emp-name-cell strong { display: block; font-size: 0.7rem; color: #0f172a; }
.emp-name-cell small { font-size: 0.55rem; color: #64748b; }

.text-center { text-align: center; }
.font-bold { font-weight: bold; }

.list-container { display: flex; flex-direction: column; gap: 8px; }

.daily-unified-card {
  background: white;
  padding: 10px 12px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
  border: 1px solid #e2e8f0;
  border-left: 4px solid #1e3a8a;
}

.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 6px;
}

.emp-title { font-size: 0.75rem; color: #0f172a; }
.date-tag { font-size: 0.65rem; color: #64748b; font-weight: 600; }

.attendance-time-split {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time-block {
  flex: 1;
  text-align: center;
}

.time-block small { display: block; font-size: 0.55rem; color: #64748b; font-weight: bold; letter-spacing: 0.5px; }
.time-val { display: block; font-size: 0.85rem; font-weight: bold; margin: 2px 0; }

.divider-vertical {
  width: 1px;
  height: 36px;
  background: #e2e8f0;
  margin: 0 8px;
}

.mini-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.55rem;
  font-weight: bold;
}

.pill-navy-dark { background: #dbeafe; color: #1e3a8a; }
.pill-gold { background: #fef9c3; color: #854d0e; }
.pill-rose { background: #fee2e2; color: #b91c1c; }
.pill-gray { background: #f1f5f9; color: #64748b; }

.header-action-row { display: flex; justify-content: space-between; align-items: center; }
.btn-refresh-sm { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 6px; font-size: 0.65rem; cursor: pointer; font-weight: bold; color: #1e3a8a; }
.btn-refresh-sm:hover { background: #e2e8f0; }

.profile-card-details {
  background: white;
  padding: 16px 12px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}
.profile-big-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  color: #fef08a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 auto 8px auto;
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.25);
}
.separator { border: 0; border-top: 1px solid #e2e8f0; margin: 12px 0; }
.specs-list { list-style: none; padding: 0; margin: 0; text-align: left; font-size: 0.7rem; color: #334155; }
.specs-list li { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f8fafc; }

/* Navigasi Bawah Modern */
.bottom-navigation-bar {
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 4px;
  height: 58px;
  position: relative;
  box-shadow: 0 -4px 10px rgba(0,0,0,0.03);
}

.nav-item-btn {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.6rem;
  color: #64748b;
  cursor: pointer;
  flex: 1;
  transition: color 0.2s;
}

.nav-icon { font-size: 1.1rem; margin-bottom: 1px; }
.nav-item-btn.active { color: #1e3a8a; font-weight: bold; }

.center-floating-button {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #1e3a8a 0%, #ca8a04 100%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
  cursor: pointer;
  border: 3px solid white;
  transition: transform 0.2s;
}
.center-floating-button:hover { transform: translateX(-50%) scale(1.05); }
.fingerprint-icon { font-size: 1.2rem; }

.empty-state { text-align: center; color: #94a3b8; font-size: 0.75rem; padding: 20px; }
</style>