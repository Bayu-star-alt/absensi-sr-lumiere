<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// State untuk Login
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const message = ref('')

// State untuk Status Login & Dasbor
const isLoggedIn = ref(false)
const currentTime = ref('')
const currentDate = ref('')
const attendanceStatus = ref('Belum Melakukan Absen Hari Ini')
let timer = null

function login() {
  if (!email.value || !password.value) {
    message.value = 'Email dan password wajib diisi.'
    return
  }

  // Jika terisi, ubah status ke true agar berpindah ke Tampilan Dasbor
  isLoggedIn.value = true
  startClock()
}

function logout() {
  isLoggedIn.value = false
  email.value = ''
  password.value = ''
  message.value = ''
  stopClock()
}

// Fungsi Jam Real-time untuk Dasbor
function startClock() {
  updateClock()
  timer = setInterval(updateClock, 1000)
}

function stopClock() {
  if (timer) clearInterval(timer)
}

function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('id-ID')
  currentDate.value = now.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Fungsi Aksi Tombol Absen
function handleAttendance(type) {
  const timeNow = currentTime.value
  if (type === 'in') {
    attendanceStatus.value = `Hadir - Masuk pada pukul ${timeNow}`
    alert(`Berhasil melakukan Absen Masuk pukul ${timeNow}`)
  } else {
    attendanceStatus.value = `Selesai - Pulang pada pukul ${timeNow}`
    alert(`Berhasil melakukan Absen Pulang pukul ${timeNow}`)
  }
}

onUnmounted(() => {
  stopClock()
})
</script>

<template>
  <!-- KONDISI 1: HALAMAN LOGIN -->
  <main v-if="!isLoggedIn" class="page">
    <section class="login-card">
      <div class="brand">
        <div class="brand-icon">⚖</div>
        <h1>SR <span>LUMIERE</span></h1>
        <p>LAW FIRM & ATTENDANCE SYSTEM</p>
      </div>

      <div class="divider"></div>

      <div class="welcome">
        <p class="eyebrow">EMPLOYEE PORTAL</p>
        <h2>Selamat Datang</h2>
        <p>Silakan masuk untuk melakukan absensi karyawan.</p>
      </div>

      <form @submit.prevent="login">
        <label for="email">Alamat Email</label>
        <div class="input-box">
          <span>✉</span>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Masukkan email Anda"
            autocomplete="username"
          />
        </div>

        <label for="password">Password</label>
        <div class="input-box">
          <span>♙</span>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Masukkan password"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="eye"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? 'Sembunyikan' : 'Lihat' }}
          </button>
        </div>

        <button type="submit" class="login-button">
          MASUK KE APLIKASI
          <span>→</span>
        </button>

        <p v-if="message" class="message">{{ message }}</p>
      </form>

      <div class="footer">
        <span>SR LUMIERE</span>
        <p>Secure Employee Attendance System</p>
        <p>© 2026 SR Lumiere. All Rights Reserved.</p>
      </div>
    </section>
  </main>


  <!-- KONDISI 2: HALAMAN DASBOR (DASHBOARD ABSENSI) -->
  <main v-else class="page">
    <section class="login-card dashboard-card">
      <!-- Header Dasbor -->
      <div class="dashboard-header">
        <div>
          <span class="eyebrow">PORTAL KARYAWAN</span>
          <h2 style="color: white; font-size: 20px; margin: 5px 0;">Halo, {{ email }}</h2>
        </div>
        <button @click="logout" class="logout-btn">Keluar</button>
      </div>

      <div class="divider"></div>

      <!-- Widget Jam & Tanggal -->
      <div class="welcome" style="text-align: center;">
        <p class="eyebrow">{{ currentDate }}</p>
        <div class="clock-display">{{ currentTime }}</div>
      </div>

      <!-- Status Kehadiran -->
      <div class="status-box">
        <p style="margin: 0; color: #a99b7b; font-size: 11px;">Status Kehadiran Hari Ini:</p>
        <p style="margin: 5px 0 0; color: #e5c981; font-weight: bold; font-size: 14px;">{{ attendanceStatus }}</p>
      </div>

      <!-- Tombol Aksi Absen -->
      <div class="attendance-actions">
        <button @click="handleAttendance('in')" class="login-button btn-in">
          ABSEN MASUK
        </button>
        <button @click="handleAttendance('out')" class="login-button btn-out">
          ABSEN PULANG
        </button>
      </div>

      <div class="footer">
        <span>SR LUMIERE</span>
        <p>© 2026 SR Lumiere. All Rights Reserved.</p>
      </div>
    </section>
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

.page {
  min-height: 100vh;
  padding: 30px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top, #35302a, transparent 45%),
    #111111;
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 42px 38px;
  background: #1c1c1c;
  border: 1px solid #80683c;
  border-radius: 15px;
  box-shadow: 0 20px 60px #00000080;
}

.brand {
  text-align: center;
}

.brand-icon {
  width: 65px;
  height: 65px;
  margin: auto;
  display: grid;
  place-items: center;
  color: #d9b76b;
  border: 1px solid #b99a59;
  border-radius: 50%;
  font-size: 34px;
}

.brand h1 {
  color: #ffffff;
  font-size: 27px;
  letter-spacing: 4px;
  margin: 17px 0 7px;
}

.brand h1 span {
  color: #d8b66e;
}

.brand p {
  color: #a99b7b;
  font-size: 9px;
  letter-spacing: 3px;
}

.divider {
  height: 1px;
  background: #625033;
  margin: 25px 0;
}

.welcome .eyebrow {
  color: #d8b66e;
  font-size: 10px;
  letter-spacing: 3px;
  font-weight: bold;
}

.welcome h2 {
  color: #ffffff;
  font-size: 27px;
  margin: 12px 0;
}

.welcome > p:last-child {
  color: #aaa;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 20px;
}

form label {
  display: block;
  color: #e5d6b7;
  font-size: 12px;
  margin: 18px 0 9px;
}

.input-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #292929;
  border: 1px solid #49423a;
  border-radius: 7px;
  padding: 0 13px;
  height: 49px;
}

.input-box > span {
  color: #d8b66e;
}

.input-box input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 13px;
}

.input-box input::placeholder {
  color: #858585;
}

.eye {
  border: none;
  background: none;
  color: #d8b66e;
  font-size: 10px;
  cursor: pointer;
}

.login-button {
  width: 100%;
  margin-top: 20px;
  height: 49px;
  background: linear-gradient(100deg, #b18a45, #e4c77f);
  border: none;
  border-radius: 7px;
  color: #17130c;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
}

.login-button span {
  margin-left: 10px;
  font-size: 17px;
}

.login-button:hover {
  filter: brightness(1.1);
}

.message {
  color: #e5c981;
  font-size: 12px;
  line-height: 1.6;
  margin-top: 16px;
}

.footer {
  text-align: center;
  border-top: 1px solid #403a30;
  margin-top: 30px;
  padding-top: 20px;
}

.footer span {
  color: #d8b66e;
  font-size: 11px;
  letter-spacing: 3px;
}

.footer p {
  color: #777;
  font-size: 10px;
  margin: 6px 0;
}

/* Styling Tambahan untuk Dasbor */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logout-btn {
  background: transparent;
  border: 1px solid #a83232;
  color: #ff6b6b;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
}

.logout-btn:hover {
  background: rgba(168, 50, 50, 0.2);
}

.clock-display {
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  margin: 10px 0 20px;
  letter-spacing: 2px;
}

.status-box {
  background: #252525;
  border: 1px solid #49423a;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 15px;
  text-align: center;
}

.attendance-actions {
  display: flex;
  gap: 10px;
}

.btn-in {
  margin-top: 5px;
  background: linear-gradient(100deg, #2e7d32, #66bb6a);
  color: #fff;
}

.btn-out {
  margin-top: 5px;
  background: linear-gradient(100deg, #c62828, #ef5350);
  color: #fff;
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 23px;
  }

  .welcome h2 {
    font-size: 24px;
  }
}
</style>