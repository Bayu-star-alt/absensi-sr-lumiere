<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './supabase'

const nama = ref('')
const status = ref('Hadir')
const daftarAbsen = ref([])
const loading = ref(false)

const ambilData = async () => {
  const { data, error } = await supabase
    .from('absensi')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (!error) {
    daftarAbsen.value = data
  }
}

const kirimAbsen = async () => {
  if (!nama.value.trim()) {
    alert('Nama tidak boleh kosong!')
    return
  }

  loading.value = true
  const { error } = await supabase
    .from('absensi')
    .insert([{ nama: nama.value, status: status.value }])

  loading.value = false

  if (error) {
    alert('Gagal mengirim absensi: ' + error.message)
  } else {
    nama.value = ''
    ambilData()
  }
}

onMounted(() => {
  ambilData()
})
</script>

<template>
  <main style="max-width: 600px; margin: 40px auto; font-family: Arial, sans-serif; padding: 20px;">
    <h2>Form Absensi SR Lumiere</h2>
    
    <form @submit.prevent="kirimAbsen" style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 5px;">Nama Lengkap:</label>
        <input v-model="nama" type="text" placeholder="Masukkan nama Anda" style="width: 100%; padding: 8px; box-sizing: border-box;" />
      </div>

      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 5px;">Status Kehadiran:</label>
        <select v-model="status" style="width: 100%; padding: 8px;">
          <option value="Hadir">Hadir</option>
          <option value="Izin">Izin</option>
          <option value="Sakit">Sakit</option>
        </select>
      </div>

      <button type="submit" :disabled="loading" style="background: #000; color: #fff; padding: 10px 20px; border: none; cursor: pointer; border-radius: 4px;">
        {{ loading ? 'Mengirim...' : 'Kirim Absen' }}
      </button>
    </form>

    <h3>Riwayat Kehadiran</h3>
    <table border="1" style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead>
        <tr style="background: #eee;">
          <th style="padding: 8px;">Nama</th>
          <th style="padding: 8px;">Status</th>
          <th style="padding: 8px;">Waktu</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in daftarAbsen" :key="item.id">
          <td style="padding: 8px;">{{ item.nama }}</td>
          <td style="padding: 8px;">{{ item.status }}</td>
          <td style="padding: 8px;">{{ new Date(item.created_at).toLocaleString() }}</td>
        </tr>
        <tr v-if="daftarAbsen.length === 0">
          <td colspan="3" style="padding: 12px; text-align: center; color: #777;">Belum ada data absensi.</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>