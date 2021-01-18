export const endpoint = {
  login: 'https://waste-bank.herokuapp.com/api/login',

  register: 'https://waste-bank.herokuapp.com/api/register',

  edit_profile: 'https://waste-bank.herokuapp.com/api/edit/profile',

  nasabah_request: 'https://waste-bank.herokuapp.com/api/nasabah/permintaan',

  request_get: 'https://waste-bank.herokuapp.com/api/nasabah/get_permintaan',

  profile_home: 'https://waste-bank.herokuapp.com/api/home',

  forget_password: 'https://waste-bank.herokuapp.com/api/password/email',

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

  // Fitur Pengurus 1

  pengurus1_request:
    'https://waste-bank.herokuapp.com/api/pengurus1/get_permintaan',
  pendataan: 'https://waste-bank.herokuapp.com/api/pengurus1/pendataan/', // + permintaan_id
};
