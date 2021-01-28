import React, {Component} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ToastAndroid,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  StatusBar,
  Image,
  Button,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import {endpoint} from '../../endpoint';
import IonIcon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import {Picker} from '@react-native-picker/picker';

class HomeCS extends Component {
  constructor(props) {
    super(props);
    const {avatar, name, email, no_telpon} = this.props.user.data;

    this.state = {
      loading: false,
      modalDataInput: false,
      allRequest: [],
      request_id: null,
      modalProfile: false,
      modalForm: false,
      modalAddress: false,
      modalEditProf: false,
      modalEditAddress: false,
      modalAddAddress: false,
      input: 1,
      allAlamat: this.props.user.alamat,
      lokasi: this.mainAddress(),
      modalChooseMode: false,
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
      modalEditing: false,
      address_id: null,
      modalRequest: false,
      inputData: [],
      jenisSampah: this.getChoices(),
      weight: '0',
      weightInput: '',
    };
  }

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

  handleEditProfile = () => {
    if (
      this.state.password &&
      this.state.username &&
      this.state.imageFile.uri &&
      this.state.phone
    ) {
      Alert.alert('Edit Profil', 'Pastikan data yang anda masukkan sesuai!', [
        {
          text: 'Batal',
        },
        {
          text: 'Lanjutkan',
          onPress: this.editProfile,
        },
      ]);
    } else {
      ToastAndroid.show('Masukkan data anda dengan benar', 1200);
    }
  };

  editProfile = () => {
    this.setState({loading: true});

    var myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + this.props.user.token);

    var formdata = new FormData();
    formdata.append('name', this.state.username);
    formdata.append('password_confirmation', this.state.password);
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
        ToastAndroid.show('Maaf profil gagal diubah!', 1500);
      });
  };

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
          this.setState({
            allAlamat: resJson.alamat,
            lokasi: this.mainAddress(),
          });
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

  logout = () => {
    console.log('logout....');
    AsyncStorage.removeItem('token', () => {
      this.setState({modalProfile: false});
      this.props.navigation.navigate('Auth');
    }).catch((e) => console.log('catch error async logout', e));
  };

  mainAddress = () => {
    let home = this.props.user.alamat.filter((v) => {
      return v.status === 1;
    });

    return home[0];
  };

  getChoices() {
    return [
      {
        created_at: null,
        harga_nasabah: 3000,
        harga_pengepul: 3300,
        id: 1,
        nama: 'Plastik',
        updated_at: null,
      },
      {
        created_at: null,
        harga_nasabah: 7000,
        harga_pengepul: 7700,
        id: 2,
        nama: 'Besi',
        updated_at: null,
      },
      {
        created_at: null,
        harga_nasabah: 4000,
        harga_pengepul: 4400,
        id: 3,
        nama: 'Kaleng',
        updated_at: null,
      },
      {
        created_at: null,
        harga_nasabah: 6000,
        harga_pengepul: 6600,
        id: 4,
        nama: 'Kertas',
        updated_at: null,
      },
    ];
  }

  componentDidMount = () => {
    this.getPermintaan();
  };

  async getPermintaan() {
    this.setState({loading: true});
    try {
      let myOptions = {
        headers: {
          Authorization: `Bearer ${this.props.user.token}`,
        },
      };

      let response = await fetch(endpoint.pengurus1_request, myOptions);

      let resJson = await response.json();

      console.log('ini resjson get permintaan pengurus 1 == ', resJson);

      if (resJson.status === 'success') {
        this.setState({allRequest: resJson.data, loading: false});
      }
    } catch (err) {
      this.setState({loading: false});
      console.log('catch get permintaan == ', err);
      ToastAndroid.show('Maaf gagal mengambil data permintaan!!', 2000);
    }
  }

  newItem = (id) => {
    let result = this.state.jenisSampah.filter((v) => {
      return v.id === id;
    });

    return {...result[0], berat: this.state.weightInput};
  };

  addData = () => {
    const {input, weightInput} = this.state;
    console.log('panjang weight input == ', weightInput.split('.').length);
    if (
      input &&
      weightInput &&
      weightInput[0] !== '.' &&
      weightInput.split('.').length < 3 &&
      (weightInput[0] !== '0' ||
        (weightInput[1] === '.' && weightInput.length > 2))
    ) {
      let newData = this.newItem(this.state.input);

      this.setState(
        (prevState) => {
          let currData = prevState.jenisSampah.filter(
            (v) => v.id !== this.state.input,
          );

          return {
            jenisSampah: currData,
            inputData: [...prevState.inputData, newData],
          };
        },
        () =>
          this.setState((prevState) => {
            if (prevState.jenisSampah.length > 0) {
              return {input: this.state.jenisSampah[0].id, weightInput: ''};
            }
            return {weightInput: ''};
          }),
      );
    } else {
      ToastAndroid.show('Masukkan berat dengan benar!', 1000);
    }
  };

  handleDeleteData = (index, item) => {
    this.setState((prevState) => {
      console.log('indexnya == ', index);
      console.log('itemnya == ', item);
      console.log('mulai hapus');
      let arr = Array.from(prevState.inputData);

      arr.splice(index, 1);
      let arr1 = prevState.jenisSampah.concat(item);
      console.log('state input data ==', prevState.inputData);

      return {inputData: arr, jenisSampah: arr1};
    });
  };

  handleSendData = () => {
    if (this.state.inputData.length > 0) {
      Alert.alert('Kirim Laporan', 'Pastikan data yang anda masukkan sesuai!', [
        {
          text: 'Batal',
        },
        {
          text: 'Lanjutkan',
          onPress: this.sendData,
        },
      ]);
    } else {
      ToastAndroid.show('Masukkan data anda dengan benar', 1200);
    }
  };

  sendData = () => {
    console.log('mulai kirim pendataan');

    let form = new FormData();

    this.state.inputData.forEach((element, index) => {
      form.append(`sampah[${index}][sampah_id]`, element.id);
      form.append(`sampah[${index}][berat]`, element.berat);
    });

    console.log('ini form pendataan == ', form);

    fetch(endpoint.pengurus1_pendataan + this.state.request_id, {
      method: 'POST',
      body: form,
      headers: {
        Authorization: 'Bearer ' + this.props.user.token,
      },
    })
      .then((res) => res.json())
      .then((resJson) => {
        console.log('ini resjson dari senddata', resJson);
        if (resJson.status === 'success') {
          this.setState({modalDataInput: false, inputData: []});
          this.getPermintaan();
          ToastAndroid.show('Data berhasil dikirim!', 1500);
        }
      })
      .catch((e) => {
        console.log('catch sendData', e);
        ToastAndroid.show('Maaf, kirim data gagal', 1500);
      });
  };

  totalPrice = () => {
    let init = 0;

    if (this.state.inputData.length > 0) {
      this.state.inputData.forEach((v) => {
        let hasil = v.berat * v.harga_nasabah;
        init += hasil;
      });
      console.log('check reduce == ', init);
    }

    return init;
  };

  render() {
    const {avatar, name, email, no_telpon} = this.props.user.data;
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor={'#ffffff00'} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.setState({modalProfile: true})}
            activeOpacity={0.8}
            style={styles.s_profile}>
            <Image source={{uri: avatar}} style={styles.s_profile} />
          </TouchableOpacity>
          <Text style={styles.hi_text}> Hi {name}!</Text>
        </View>
        <View style={styles.scrollViewCont}>
          <ScrollView contentContainerStyle={styles.addressScroll}>
            {this.state.allRequest.map((v, i) => {
              return (
                <TouchableOpacity
                  activeOpacity={0.95}
                  style={styles.addressList}
                  key={i}>
                  <View style={styles.addressListHead}>
                    <Text style={styles.addressListNumber}>
                      Permintaan {(i + 1).toString()}
                    </Text>
                    <AntDesign
                      name={
                        v.status === 1 ? 'exclamationcircle' : 'checkcircle'
                      }
                      color={v.status === 1 ? '#ff6c0a' : 'green'}
                      size={25}
                      onPress={() => {}}
                    />
                  </View>
                  <Text>{v.tanggal}</Text>
                  <Text>{v.nama}</Text>
                  <Text>{v.no_telpon}</Text>
                  <Text>{v.lokasi}</Text>
                  <Text>{v.keterangan}</Text>
                  <View style={styles.iconsCont}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        this.setState({modalDataInput: true, request_id: v.id})
                      }
                      style={styles.dataButton}>
                      <Text style={styles.dataText}> Pendataan </Text>
                      <IonIcon
                        style={styles.pencilIcon}
                        name={'pencil'}
                        color={'#e8e8e8'}
                        size={19}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        {/* ------Modal Pendataan------ */}
        <Modal
          transparent={true}
          visible={this.state.modalDataInput}
          statusBarTranslucent={true}
          animationType={'fade'}
          onRequestClose={() =>
            this.setState({
              modalDataInput: false,
              inputData: [],
              jenisSampah: this.getChoices(),
            })
          }>
          <KeyboardAvoidingView
            behavior={'padding'}
            style={styles.dataScrollViewCont}>
            <Text style={styles.addressListTitle}>Pendataan</Text>
            <View style={styles.dataHeader}>
              <Button
                title={'Batal'}
                color={'red'}
                onPress={() =>
                  this.setState({
                    modalDataInput: false,
                    inputData: [],
                    jenisSampah: this.getChoices(),
                  })
                }
              />
              <Button
                title={'Kirim'}
                color={'blue'}
                onPress={this.handleSendData}
              />
            </View>
            <Text style={styles.totalPrice}>
              Total : Rp.{this.totalPrice()}
            </Text>
            <View style={styles.dataListCont}>
              <ScrollView contentContainerStyle={styles.dataScroll}>
                {this.state.inputData.map((v, i) => {
                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.addressList}
                      key={i}>
                      <View style={styles.addressListHead}>
                        <Text style={styles.addressListNumber}>
                          Data {(i + 1).toString()}
                        </Text>
                      </View>
                      <Text>Jenis : {v.nama}</Text>
                      <Text>Berat : {v.berat} kg</Text>
                      <View style={styles.iconsCont}>
                        <IonIcon
                          style={styles.pencilIcon}
                          name={'trash'}
                          color={'red'}
                          size={24}
                          onPress={() => this.handleDeleteData(i, v)}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
            <View style={styles.dataInputs}>
              <View style={styles.dataInputDetailsCont}>
                <View style={styles.dataWeight}>
                  <Text style={styles.DataTextLeft}>Jenis :</Text>
                  <Picker
                    selectedValue={this.state.input}
                    style={styles.pickerTrash}
                    onValueChange={(itemValue) =>
                      this.setState({input: itemValue})
                    }>
                    {this.state.jenisSampah.map((v, i) => (
                      <Picker.Item key={i} label={v.nama} value={v.id} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.dataWeight}>
                  <Text style={styles.DataTextLeft}>Berat :</Text>
                  <TextInput
                    value={this.state.weightInput}
                    keyboardType={'number-pad'}
                    onChangeText={(text) => this.setState({weightInput: text})}
                    placeholder={'0'}
                    style={styles.pickerWeight}
                  />
                  <Text>kg</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={this.addData}
                style={styles.addDataButton}>
                <Text style={styles.addDataButtonText}> Tambah </Text>
                <IonIcon name={'add-circle'} size={25} color={'green'} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
        {/* ------Modal untuk profile------ */}
        <Modal
          transparent={true}
          visible={this.state.modalProfile}
          statusBarTranslucent={true}
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
                <Text style={styles.profilTitle}>Profil</Text>
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
          statusBarTranslucent={true}
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
        {/* ------Modal untuk edit profile------ */}
        <Modal
          transparent={true}
          visible={this.state.loading}
          statusBarTranslucent={true}
          animationType={'fade'}
          onRequestClose={() => {}}>
          <View style={styles.modalLoadingCont}>
            <ActivityIndicator size={35} color={'green'} />
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  profilTitle: {
    fontSize: 23,
    color: 'green',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#2e995594',
    alignItems: 'center',
    paddingTop: 35,
  },
  header: {
    width: '100%',
    padding: 5,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalLoadingCont: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000c7',
  },
  s_profile: {
    width: 65,
    height: 65,
    borderRadius: 35,
  },
  scrollViewCont: {
    flex: 1,
    width: '100%',
  },
  dataScrollViewCont: {
    flex: 1,
    paddingTop: 25,
    width: '100%',
    backgroundColor: '#029739',
  },
  button: {
    backgroundColor: 'white',
    padding: 4,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    width: '47%',
  },
  requestButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4d4d4d',
  },
  addressScroll: {
    flexGrow: 1,
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
  },
  scrollview: {
    flexGrow: 1,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    flexDirection: 'row',
    padding: 15,
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
    right: 5,
    bottom: 20,
  },
  hi_text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
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
    marginVertical: 2,
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
    maxWidth: 150,
    height: 25,
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
  pickerTrash: {
    width: 125,
  },
  pickerWeight: {
    width: 60,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'lightgreen',
    marginHorizontal: 5,
    textAlign: 'center',
  },
  addressList: {
    width: '100%',
    padding: 10,
    backgroundColor: '#ededed',
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
    color: 'white',
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
    alignSelf: 'center',
  },
  addressListHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pencilIcon: {},
  iconsCont: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
  },
  signInButton: {
    padding: 10,
    backgroundColor: '#2e995594',
    borderRadius: 5,
    marginTop: 35,
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  requestScrollCont: {
    minHeight: 600,
    marginHorizontal: 5,
    marginVertical: 40,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  dataButton: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green',
  },
  dataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e8e8e8',
  },
  addDataButton: {
    flexDirection: 'row',
    padding: 3,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    elevation: 5,
    borderWidth: 1,
    borderColor: 'lightgreen',
  },
  addDataButtonText: {
    fontWeight: 'bold',
    color: 'green',
  },
  dataWeight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataInputDetailsCont: {
    flex: 1,
  },
  inputWeight: {
    fontSize: 20,
  },
  DataTextLeft: {
    fontSize: 16,
  },
  dataScroll: {
    flexGrow: 1,
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
  },
  dataListCont: {
    flex: 1,
  },
  dataInputs: {
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  totalPrice: {
    fontSize: 24,
    textAlign: 'center',
    color: '#eee',
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

export default connect(mapStateToProps, mapDispatchToProps)(HomeCS);
