import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Button,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  TextInput,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import {Picker} from '@react-native-picker/picker';
import {kecamatan} from '../../kecamatanBantul';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {endpoint} from '../../endpoint';
import {launchImageLibrary} from 'react-native-image-picker';

class HomeNasabah extends Component {
  constructor(props) {
    super(props);

    const {avatar, name, no_telpon, email} = this.props.user.data;

    this.state = {
      modalProfile: false,
      modalForm: false,
      modalAddress: false,
      modalEditProf: false,
      modalEditAddress: false,
      modalAddAddress: false,
      keterangan: 'Jemput',
      allAlamat: this.props.user.alamat,
      lokasi: this.mainAddress(),
      loading: false,
      username: name,
      email: email,
      password: '',
      address: '',
      phone: no_telpon,
      avatar: avatar,
      wilayah_id: this.mainAddress().wilayah_id,
      newAddress: '',
      passwordSecure: true,
      imageFile: {name: 'default', type: 'image/jpeg', uri: avatar},
    };
  }

  getProfile = () => {
    fetch(endpoint.profile_home, {
      headers: {
        Authorization: `Bearer ${this.props.user.token}`,
      },
    })
      .then((res) => res.json())
      .then((resJson) => {
        console.log('ini resjson getnasabah == ', resJson);
        if (resJson.status === 'success') {
          this.props.changeUser(resJson);
          this.setState({allAlamat: resJson.alamat});
        } else {
          this.getNasabah();
        }
      })
      .catch((err) => {
        console.log('catch getNasabah == ', err);
        ToastAndroid.show(
          'Maaf gagal mengambil data!\nSilahkan mulai ulang aplkasi!',
          10000,
        );
      });
  };

  handleSubmit = () => {
    Alert.alert(
      'Apakah anda yakin?',
      'Pastikan data yang anda masukkan benar.',
      [
        {
          text: 'Batal',
        },
        {
          text: 'Lanjutkan',
          onPress: this.makeRequest,
        },
      ],
    );
  };

  handleLogout = () => {
    Alert.alert('Logout', 'Apakah anda yakin untuk logout?', [
      {
        text: 'Batal',
      },
      {
        text: 'Lanjutkan',
        onPress: this.logout,
      },
    ]);
  };

  handleNewAddress = () => {
    if (this.state.newAddress) {
      this.addAddress();
    } else {
      ToastAndroid.show('Masukkan alamat anda dengan benar', 1000);
    }
  };

  handleChangeMainAddress = (id) => {
    Alert.alert(
      'Alamat Utama',
      'Apakah anda yakin merubah alamat utama?.',
      [
        {
          text: 'Batal',
        },
        {
          text: 'Lanjutkan',
          onPress: () => this.changeMainAddress(id),
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  handleDeleteAddress = (id) => {
    Alert.alert('Hapus Alamat', 'Apakah anda yakin menghapus alamat ini?.', [
      {
        text: 'Batal',
      },
      {
        text: 'Lanjutkan',
        onPress: () => this.deleteAddress(id),
      },
    ]);
  };

  handleChoosePhoto = () => {
    let options = {
      includeBase64: false,
    };
    launchImageLibrary(options, (response) => {
      console.log('ini response imagepicker === ', response);
      if (response.fileSize < 1000000) {
        let photo = {
          name: response.fileName,
          type: response.type,
          uri: response.uri,
        };
        this.setState({imageFile: photo});
      } else {
        ToastAndroid.show('File gambar terlalu besar', 1200);
      }
    });
  };

  handleEditProfile = () => {
    Alert.alert('Edit Profil', 'Pastikan data yang anda masukkan sesuai.', [
      {
        text: 'Batal',
      },
      {
        text: 'Lanjutkan',
        onPress: this.editProfile,
      },
    ]);
  };

  editProfile = () => {
    this.setState({loading: true});

    var myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + this.props.user.token);

    var formdata = new FormData();
    formdata.append('name', this.state.username);
    formdata.append('password', this.state.password);
    formdata.append('no_telpon', this.state.phone);
    formdata.append('avatar', this.state.imageFile);
    formdata.append('_method', 'patch');

    console.log('ini form edit profile', formdata);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
    };

    fetch(endpoint.edit_profile, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log('hasil edit profile === ', result);
        if (result.status === 'success') {
          this.getProfile();
          this.setState({loading: false, modalEditProf: false});
          ToastAndroid.show('Profil berhasil diupdate!', 1500);
        } else {
          this.setState({loading: false});
          ToastAndroid.show('Maaf profil gagal diubah!', 1500);
        }
      })
      .catch((error) => {
        console.log('catch error edit profil === ', error);
        this.setState({loading: false});
      });
  };

  deleteAddress = (id) => {
    this.setState({loading: true});
    console.log('hapus alamat');
    var myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + this.props.user.token);

    var requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
    };

    fetch(endpoint.delete_alamat + id, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log('hasil hapus alamat === ', result);
        if (result.status === 'success') {
          this.setState({loading: false});
          this.getProfile();
          ToastAndroid.show('Alamat dihapus!', 1500);
        } else {
          this.setState({loading: false});
          ToastAndroid.show('Maaf alamat gagal dihapus!', 1500);
        }
      })
      .catch((error) => {
        this.setState({loading: false});
        console.log('catch error delete address === ', error);
      });
  };

  addAddress = () => {
    this.setState({loading: true});

    var myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + this.props.user.token);

    var formdata = new FormData();
    formdata.append('wilayah_id', this.state.wilayah_id);
    formdata.append('alamat', this.state.newAddress);

    console.log('ini form tambah alamat', formdata);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
    };

    fetch(endpoint.new_address, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log('hasil tambah alamat === ', result);
        if (result.status === 'success') {
          this.getProfile();
          this.setState({loading: false, modalAddAddress: false});
          ToastAndroid.show('Alamat berhasil ditambahkan!', 1500);
        } else {
          this.setState({loading: false});
          ToastAndroid.show('Maaf alamat gagal ditambahkan!', 1500);
        }
      })
      .catch((error) => {
        console.log('catch error makeRequest === ', error);
        this.setState({loading: false});
      });
  };

  mainAddress = () => {
    let home = this.props.user.alamat.filter((v) => {
      return v.status === 1;
    });

    return home[0];
  };

  changeMainAddress = (id_alamat) => {
    this.setState({loading: true});
    console.log('ubah alamat utama');
    var myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + this.props.user.token);

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
    };

    fetch(endpoint.change_main_address + id_alamat, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log('hasil tambah alamat === ', result);
        if (result.status === 'success') {
          this.setState({loading: false});
          this.getProfile();
          ToastAndroid.show('Alamat utama berhasil diubah!', 1500);
        } else {
          this.setState({loading: false});
          ToastAndroid.show('Maaf alamat utama gagal diubah!', 1500);
        }
      })
      .catch((error) => {
        this.setState({loading: false});
        console.log('catch error change main address === ', error);
      });
  };

  makeRequest = () => {
    this.setState({loading: true});

    var myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + this.props.user.token);

    var formdata = new FormData();
    formdata.append('keterangan', this.state.keterangan);
    formdata.append('alamat_id', this.state.lokasi.id);

    console.log('ini form request', formdata);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };

    fetch(
      'https://waste-bank.herokuapp.com/api/nasabah/permintaan',
      requestOptions,
    )
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        this.setState({loading: false, modalForm: false});
        ToastAndroid.show('Permintaan berhasil dibuat!', 1500);
      })
      .catch((error) => {
        console.log('catch error makeRequest === ', error);
        this.setState({loading: false});
      });
  };

  logout = () => {
    console.log('logout....');
    AsyncStorage.removeItem('token', () => {
      this.setState({modalProfile: false});
      this.props.navigation.navigate('Auth');
    }).catch((e) => console.log('catch error async logout', e));
  };

  render() {
    const {avatar, name, no_telpon, email} = this.props.user.data;
    return (
      <ScrollView contentContainerStyle={styles.scrollview}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.setState({modalProfile: true})}
            activeOpacity={0.8}
            style={styles.s_profile}>
            <Image source={{uri: avatar}} style={styles.s_profile} />
          </TouchableOpacity>
          <Text style={styles.hi_text}> Hi {name}!</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.setState({modalForm: true})}>
          <IonIcon name={'trash'} color={'green'} size={55} />
          <Text style={styles.requestButton}>Jual Sampah</Text>
        </TouchableOpacity>

        {/* ------Modal untuk Form request------ */}

        <Modal
          transparent={true}
          visible={this.state.modalForm}
          animationType={'fade'}
          onRequestClose={() => this.setState({modalForm: false})}>
          <TouchableOpacity
            onPress={() => this.setState({modalForm: false})}
            activeOpacity={1}
            style={styles.formContainer}>
            <TouchableOpacity activeOpacity={1} style={styles.form}>
              <Text style={styles.addressListTitle}>Form Permintaan</Text>
              <View style={styles.formTextCont}>
                <Text style={styles.formTextLeft}>Nama</Text>
                <Text style={styles.formTextMid}>:</Text>
                <Text style={styles.formTextRight}>{name}</Text>
              </View>
              <View style={styles.formTextCont}>
                <Text style={styles.formTextLeft}>No Telpon</Text>
                <Text style={styles.formTextMid}>:</Text>
                <Text style={styles.formTextRight}>{no_telpon}</Text>
              </View>
              <View style={styles.formTextCont}>
                <Text style={styles.formTextLeft}>Mode Pengantaran</Text>
                <Text style={styles.formTextMid}>:</Text>
                <Picker
                  selectedValue={this.state.keterangan}
                  style={styles.picker}
                  prompt={'Pilih Kecamatan'}
                  onValueChange={(itemValue) =>
                    this.setState({keterangan: itemValue})
                  }>
                  <Picker.Item label={'Dijemput'} value={'Dijemput'} />
                  <Picker.Item label={'Datang'} value={'Datang'} />
                </Picker>
              </View>
              <View style={styles.addressCont}>
                <View style={styles.formTextCont}>
                  <Text style={styles.formTextLeft}>Alamat</Text>
                  <Text style={styles.formTextMid}>:</Text>
                </View>
                <View style={styles.input}>
                  <Text>{this.state.lokasi.alamat}</Text>
                  <View style={styles.addressButton}>
                    <Button
                      title={'Ubah'}
                      color={'green'}
                      onPress={() => this.setState({modalAddress: true})}
                    />
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={this.handleSubmit}
                style={styles.submitButton}>
                {this.state.loading ? (
                  <ActivityIndicator color={'white'} />
                ) : (
                  <Text style={styles.submitButtonText}>Kirim</Text>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* ------Modal untuk alamat------ */}
        <Modal
          transparent={true}
          visible={this.state.modalAddress}
          animationType={'fade'}
          onRequestClose={() => this.setState({modalAddress: false})}>
          <View style={styles.addressScrollCont}>
            <ScrollView contentContainerStyle={styles.addressScroll}>
              <Text style={styles.addressListTitle}>Pilih Alamat Utama</Text>
              {this.props.user.alamat.map((v, i) => {
                return (
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({lokasi: v, modalAddress: false})
                    }
                    activeOpacity={0.8}
                    style={styles.addressList}
                    key={i}>
                    <Text style={styles.addressListNumber}>
                      Alamat {(i + 1).toString()}
                    </Text>
                    <Text>{v.alamat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Modal>

        {/* ------Modal untuk profile------ */}
        <Modal
          transparent={true}
          visible={this.state.modalProfile}
          animationType={'fade'}
          onRequestClose={() => this.setState({modalProfile: false})}>
          <TouchableOpacity
            onPress={() => this.setState({modalProfile: false})}
            activeOpacity={1}
            style={styles.formContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.profileScrollCont}>
              <ScrollView contentContainerStyle={styles.addressScroll}>
                <Text style={styles.addressListTitle}>Profil</Text>
                <View style={styles.b_profileCont}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => this.setState({modalEditProf: true})}
                    style={styles.b_profile}>
                    <Image source={{uri: avatar}} style={styles.b_profile} />
                  </TouchableOpacity>
                  <IonIcon
                    onPress={() => this.setState({modalEditProf: true})}
                    name={'pencil'}
                    size={25}
                    style={styles.editIcon}
                  />
                </View>
                <View style={styles.formTextCont}>
                  <Text style={styles.formTextLeft}>Nama</Text>
                  <Text style={styles.formTextMid}>:</Text>
                  <Text style={styles.formTextRight}>{name}</Text>
                </View>
                <View style={styles.formTextCont}>
                  <Text style={styles.formTextLeft}>Email</Text>
                  <Text style={styles.formTextMid}>:</Text>
                  <Text style={styles.formTextRight}>{email}</Text>
                </View>
                <View style={styles.formTextCont}>
                  <Text style={styles.formTextLeft}>No Telpon</Text>
                  <Text style={styles.formTextMid}>:</Text>
                  <Text style={styles.formTextRight}>{no_telpon}</Text>
                </View>
                <View style={styles.addressCont}>
                  <View style={styles.formTextCont}>
                    <Text style={styles.formTextLeft}>Alamat Utama</Text>
                    <Text style={styles.formTextMid}>:</Text>
                  </View>
                  <View style={styles.input}>
                    <Text>{this.mainAddress().alamat}</Text>
                    <View style={styles.addressButton}>
                      <Button
                        title={'Ubah & Tambah'}
                        color={'green'}
                        onPress={() => this.setState({modalEditAddress: true})}
                      />
                    </View>
                  </View>
                </View>
                <Button
                  title={'Logout'}
                  color={'red'}
                  onPress={this.handleLogout}
                />
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* ------Modal untuk edit profile------ */}

        <Modal
          transparent={true}
          visible={this.state.modalEditProf}
          animationType={'fade'}
          onRequestClose={() => this.setState({modalEditProf: false})}>
          <TouchableOpacity
            onPress={() => this.setState({modalEditProf: false})}
            activeOpacity={1}
            style={styles.formContainer}>
            <ScrollView contentContainerStyle={styles.editScrollview}>
              <View style={styles.editBox}>
                <Text style={styles.boxTitle}>Edit Profile</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={this.handleChoosePhoto}
                  style={styles.b_profile}>
                  <Image
                    source={{uri: this.state.imageFile.uri}}
                    style={styles.b_profile}
                  />
                </TouchableOpacity>
                <TextInput
                  style={styles.editInput}
                  placeholder={'Nama'}
                  autoCapitalize={'words'}
                  value={this.state.username}
                  underlineColorAndroid={'#12a548'}
                  onChangeText={(text) => this.setState({username: text})}
                />
                <TextInput
                  style={styles.editInput}
                  placeholder={'No Telpon'}
                  keyboardType={'decimal-pad'}
                  value={this.state.phone}
                  underlineColorAndroid={'#12a548'}
                  onChangeText={(text) => this.setState({phone: text})}
                />
                <View style={styles.passwordCont}>
                  <TextInput
                    style={[styles.editInput, styles.inputPass]}
                    autoCompleteType={'password'}
                    autoCapitalize={'none'}
                    placeholder={'Password'}
                    value={this.state.password}
                    secureTextEntry={this.state.passwordSecure}
                    underlineColorAndroid={'#12a548'}
                    onChangeText={(text) => this.setState({password: text})}
                  />
                  <IonIcon
                    style={styles.eyeIcon}
                    name={this.state.passwordSecure ? 'eye-off' : 'eye'}
                    size={32}
                    color={'gray'}
                    onPress={() =>
                      this.setState({
                        passwordSecure: !this.state.passwordSecure,
                      })
                    }
                  />
                </View>
                <TouchableOpacity
                  onPress={this.handleEditProfile}
                  style={styles.signInButton}>
                  {this.state.loading ? (
                    <ActivityIndicator size={20} color={'white'} />
                  ) : (
                    <Text style={styles.buttonText}>Edit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </Modal>

        {/* ------Modal untuk list alamat------ */}
        <Modal
          transparent={true}
          visible={this.state.modalEditAddress}
          animationType={'fade'}
          onRequestClose={() => this.setState({modalEditAddress: false})}>
          <TouchableOpacity
            onPress={() => this.setState({modalEditAddress: false})}
            activeOpacity={1}
            style={styles.formContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.addressScrollCont}>
              <ScrollView contentContainerStyle={styles.addressScroll}>
                <Text style={styles.addressListTitle}>Alamat Anda</Text>
                {this.state.allAlamat.map((v, i) => {
                  return (
                    <TouchableOpacity
                      onPress={() => this.handleChangeMainAddress(v.id)}
                      activeOpacity={0.8}
                      style={styles.addressList}
                      key={i}>
                      <View style={styles.addressListHead}>
                        <Text style={styles.addressListNumber}>
                          Alamat {(i + 1).toString()}
                        </Text>
                        {v.status === 1 && (
                          <IonIcon name={'home'} color={'green'} size={25} />
                        )}
                      </View>
                      <Text>{v.alamat}</Text>
                      <IonIcon
                        style={styles.trashIcon}
                        name={'trash'}
                        color={'red'}
                        size={25}
                        onPress={() => this.handleDeleteAddress(v.id)}
                      />
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  onPress={() => {
                    this.setState({modalAddAddress: true});
                  }}
                  style={[styles.addressList, styles.newAddress]}>
                  <Text>Tambah Alamat Baru</Text>
                  <IonIcon name={'add-circle'} size={25} color={'green'} />
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* ------Modal untuk tambah alamat------ */}
        <Modal
          transparent={true}
          visible={this.state.modalAddAddress}
          animationType={'fade'}
          onRequestClose={() => this.setState({modalAddAddress: false})}>
          <View style={styles.addressScrollCont}>
            <ScrollView contentContainerStyle={styles.addressScroll}>
              <Text style={styles.addressListTitle}>Masukkan Alamat Baru</Text>
              <View style={styles.pickerCont}>
                <Text style={styles.pickerAddress}>Kab. Bantul Kec.</Text>
                <Picker
                  selectedValue={this.state.wilayah_id}
                  style={styles.picker}
                  mode={'dropdown'}
                  onValueChange={(itemValue) =>
                    this.setState({wilayah_id: itemValue})
                  }>
                  {kecamatan.map((v, i) => {
                    return <Picker.Item key={i} label={v.nama} value={v.id} />;
                  })}
                </Picker>
              </View>
              <TextInput
                value={this.state.newAddress}
                onChangeText={(text) => this.setState({newAddress: text})}
                style={styles.input}
                placeholder={'Tulis Alamat Lengkap'}
                multiline
              />
              <TouchableOpacity
                onPress={this.handleNewAddress}
                style={styles.submitButton}>
                {this.state.loading ? (
                  <ActivityIndicator color={'white'} />
                ) : (
                  <Text style={styles.submitButtonText}>Tambah</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollview: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#2e995594',
  },
  header: {
    width: '100%',
    padding: 5,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  s_profile: {
    width: 65,
    height: 65,
    borderRadius: 35,
  },
  b_profileCont: {
    paddingHorizontal: 30,
  },
  b_profile: {
    width: 85,
    height: 85,
    borderRadius: 85,
  },
  editIcon: {
    position: 'absolute',
    right: 15,
    bottom: 6,
  },
  hi_text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  button: {
    backgroundColor: 'white',
    padding: 4,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  requestButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4d4d4d',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#000000b5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 25,
  },
  form: {
    padding: 10,
    backgroundColor: '#eee',
    justifyContent: 'space-evenly',
    borderRadius: 10,
    width: '80%',
  },
  formTextCont: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  formTextMid: {
    width: 10,
    fontSize: 17,
  },
  formTextLeft: {
    fontSize: 17,
    width: 120,
  },
  formTextRight: {
    marginLeft: 10,
    fontSize: 17,
  },
  input: {
    backgroundColor: 'white',
    width: '100%',
    minHeight: 100,
    maxHeight: 300,
    borderRadius: 5,
    padding: 10,
  },
  addressCont: {
    width: '100%',
    marginVertical: 5,
  },
  picker: {
    // height: 40,
    // width: 150,
    // margin: 10,
    flex: 1,
  },
  addressScrollCont: {
    height: 600,
    marginHorizontal: 50,
    marginVertical: 70,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  addressScroll: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  addressList: {
    width: '100%',
    padding: 15,
    backgroundColor: '#c2c2c2',
    borderRadius: 10,
    marginVertical: 5,
    elevation: 4,
  },
  addressListNumber: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addressListTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 25,
    color: 'green',
    textAlign: 'center',
  },
  addressButton: {
    position: 'absolute',
    right: 3,
    bottom: 2,
  },
  submitButton: {
    marginVertical: 10,
    alignSelf: 'center',
    backgroundColor: 'green',
    width: 75,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
  },
  profileScrollCont: {
    height: 600,
    marginHorizontal: 30,
    marginVertical: 70,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  editScrollview: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  boxTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    position: 'absolute',
    top: 20,
    color: '#2e995594',
  },
  editBox: {
    width: '90%',
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 70,
  },
  editInput: {
    width: '100%',
    marginVertical: 5,
  },
  pickerCont: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerAddress: {
    fontSize: 16,
    alignSelf: 'center',
  },
  inputPass: {
    paddingRight: 75,
  },
  passwordCont: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 5,
  },
  newAddress: {
    backgroundColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressListHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trashIcon: {
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  signInButton: {
    padding: 10,
    backgroundColor: '#2e995594',
    borderRadius: 5,
    marginTop: 35,
    width: 80,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = (state) => {
  return {
    user: state,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeUser: (data) => dispatch({type: 'CHANGE/USER', payload: data}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeNasabah);
