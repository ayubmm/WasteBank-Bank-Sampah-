export const endpoint = {
  login: 'https://waste-bank.herokuapp.com/api/login',

  register: 'https://waste-bank.herokuapp.com/api/register',

  edit_profile: 'https://waste-bank.herokuapp.com/api/edit/profile',

  nasabah_request: 'https://waste-bank.herokuapp.com/api/nasabah/permintaan',

  request_get: 'https://waste-bank.herokuapp.com/api/nasabah/get_permintaan',

  profile_home: 'https://waste-bank.herokuapp.com/api/home',

  forget_password: 'https://waste-bank.herokuapp.com/api/password/email',
  //email (akan dikirimkan notif ke email tersebut, pastikan email nyata bukan asal)

  new_address: 'https://waste-bank.herokuapp.com/api/tambah/alamat', //post
  // wilayah_id
  // alamat
  edit_address: 'https://waste-bank.herokuapp.com/api/edit/alamat/', //{id}        patch
  // wilayah_id
  // alamat
  delete_alamat: 'https://waste-bank.herokuapp.com/api/hapus/alamat/', //{id}        delete

  change_main_address:
    'https://waste-bank.herokuapp.com/api/ubah/alamat/utama/', //{id}    get
  // tombol

  kontak_chats: 'https://waste-bank.herokuapp.com/api/kontak', //get
  // ini buat dapetin kontak yang pernah saya chat

  tambah_cs: 'https://waste-bank.herokuapp.com/api/nasabah/kontak/add', //get
  // ini buat nambah chat baru

  pesan_ku: 'https://waste-bank.herokuapp.com/api/message/', //{id}, //get
  // ini dapetin pesannya

  pesan_kirim: 'https://waste-bank.herokuapp.com/api/message/', //{id}                //post
  //  ini yang dikirim messagenya aja nah idnya di dapet dari kontak

  tabungan: 'https://waste-bank.herokuapp.com/api/nasabah/tabungan', //get

  // Fitur Pengurus 1

  pengurus1_request:
    'https://waste-bank.herokuapp.com/api/pengurus1/get_permintaan',

  pengurus1_getSampah:
    'https://waste-bank.herokuapp.com/api/pengurus1/get_sampah',

  pengurus1_pendataan:
    'https://waste-bank.herokuapp.com/api/pengurus1/pendataan/', // + permintaan_id
  //sampah[0][sampah_id]:1
  // sampah[0][berat]:2.4

  //   Role
  // Admin            admin@gmail.com
  // Bendahara        bendahara@gmail.com
  // Costumer service    cs_kretek@gmail.com
  // pengurus1        pengurus1@gmail.com
  // pengurus2        pengurus2@gmail.com
  // nasabah        adian281r@gmail.com
  //     Passwordnya semuanya = admin123

  // chat hanya bisa ke costumer service

  // Pengurus 2

  pengurus2_penjualan:
    'https://waste-bank.herokuapp.com/api/pengurus2/penjualan', //post
  // pembeli
  // gudang_id
  // berat
  // Nb:sistemnya masukin datanya kaya pengurus1/pendataan

  pengurus2_riwayat_jual:
    // ini data yang berhasil dijualnya
    'https://waste-bank.herokuapp.com/api/pengurus2/get_penjualan', //get

  // ini data gudangnya
  pengurus2_gudang:
    'https://waste-bank.herokuapp.com/api/pengurus2/get_gudang ', //get

  cs_kontak_nasabah: 'https://waste-bank.herokuapp.com/api/cs/kontak/add', //get
  // ini buat nambah chat baru buat cs
};
