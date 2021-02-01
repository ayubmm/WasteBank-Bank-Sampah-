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
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {connect} from 'react-redux';
import {Picker} from '@react-native-picker/picker';
import {kecamatan} from '../../kecamatanBantul';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {endpoint} from '../../endpoint';
import {launchImageLibrary} from 'react-native-image-picker';
import Pusher from 'pusher-js/react-native';

// Enable pusher logging - don't include this in production
// Pusher.logToConsole = true;

var pusher = new Pusher('594d7839a80853fb4e7b', {
  cluster: 'ap1',
});

class HomeNasabah extends Component {
  constructor(props) {
    super(props);

    var channel = pusher.subscribe('my-channel');
    channel.bind('my-event', (data) => {
      this.getMessages(data.to);
    });

    const {avatar, name, no_telpon, email} = this.props.user.data;

    this.state = {
      modalProfile: false,
      modalForm: false,
      modalAddress: false,
      modalEditProf: false,
      modalEditAddress: false,
      modalAddAddress: false,
      modalChat: false,
      modalContacts: false,
      modalActiveChat: false,
      keterangan: 'Jemput',
      allAlamat: this.props.user.alamat,
      lokasi: this.mainAddress(),
      loading: false,
      loadChat: true,
      modalChooseMode: false,
      modalBank: false,
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
      allRequest: [],
      modalRequest: false,
      cs_contacts: [],
      active_contacts: [],
      currContact: {},
      currChat: [],
      chat: '',
      savings: [],
    };
  }

  componentDidMount = () => {
    this.getPermintaan();
    this.getCSContacts();
    this.getActiveContacts();
  };

  async getSaving() {
    this.setState({loadChat: true});
    console.log('mulai ambil tabungan');

    try {
      let myOptions = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.props.user.token}`,
        },
      };

      let response = await fetch(endpoint.tabungan, myOptions);

      let resJson = await response.json();

      console.log('ini tabungannya == ', resJson);

      if (resJson.status === 'success') {
        this.setState({loadChat: false, savings: resJson.data});
      }
    } catch (err) {
      this.setState({loadChat: false});
      console.log('catch tabungan cs == ', err);
      ToastAndroid.show('Maaf gagal mengambil data tabungan!!', 2000);
    }
  }

  async getActiveContacts() {
    console.log('mulai ambil kontak yang aktif');

    try {
      let myOptions = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.props.user.token}`,
        },
      };

      let response = await fetch(endpoint.kontak_chats, myOptions);

      let resJson = await response.json();

      console.log('ini kontak aktifnya == ', resJson);

      if (resJson.status === 'success') {
        this.setState({loading: false, active_contacts: resJson.data});
      }
    } catch (err) {
      this.setState({loading: false});
      console.log('catch kontak aktif == ', err);
      ToastAndroid.show('Maaf gagal mengambil data kontak aktif!', 2000);
    }
  }

  async getCSContacts() {
    console.log('mulai ambil kontak CS');

    try {
      let myOptions = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.props.user.token}`,
        },
      };

      let response = await fetch(endpoint.tambah_cs, myOptions);

      let resJson = await response.json();

      console.log('ini kontak cs == ', resJson);

      if (resJson.status === 'success') {
        this.setState({loading: false, cs_contacts: resJson.data});
      }
    } catch (err) {
      this.setState({loading: false});
      console.log('catch kontak cs == ', err);
      ToastAndroid.show('Maaf gagal mengambil data kontak!!', 2000);
    }
  }

  async getMessages(id) {
    this.setState({loadChat: true});
    console.log('mulai ambil pesan2');

    try {
      let myOptions = {
        headers: {
          Authorization: `Bearer ${this.props.user.token}`,
        },
      };

      let response = await fetch(endpoint.pesan_ku + id, myOptions);

      let resJson = await response.json();

      console.log('ini resjson pesan2 ku == ', resJson);

      if (resJson.status === 'success') {
        let sorted = resJson.data.sort((a, b) => a.id - b.id);
        this.setState({loadChat: false, currChat: sorted});
      }
    } catch (err) {
      this.setState({loadChat: false});
      console.log('catch pesanku == ', err);
      ToastAndroid.show('Maaf gagal mengambil data pesan!', 2000);
    }
  }

  async sendMessages(id) {
    console.log('mulai kirim pesan');

    try {
      let form = new FormData();

      form.append('message', this.state.chat);

      this.setState({chat: ''});

      let myOptions = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.props.user.token}`,
        },
        body: form,
      };

      let response = await fetch(endpoint.pesan_ku + id, myOptions);

      let resJson = await response.json();

      console.log('ini resjson kirim pesan == ', resJson);

      if (resJson.status === 'success') {
        this.setState({loading: false});
      }
    } catch (err) {
      this.setState({loading: false});
      console.log('catch kirim pesan == ', err);
      ToastAndroid.show('Maaf gagal mengirim data pesan!', 2000);
    }
  }

  async getPermintaan() {
    this.setState({loading: true});
    try {
      let myOptions = {
        headers: {
          Authorization: `Bearer ${this.props.user.token}`,
        },
      };

      let response = await fetch(endpoint.request_get, myOptions);

      let resJson = await response.json();

      console.log('ini resjson get permintaan == ', resJson);

      if (resJson.status === 'success') {
        this.setState({allRequest: resJson.data, loading: false});
      }
    } catch (err) {
      this.setState({loading: false});
      console.log('catch get permintaan == ', err);
      ToastAndroid.show('Maaf gagal mengambil data permintaan!!', 2000);
    }
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
          this.setState({
            allAlamat: resJson.alamat,
            lokasi: this.mainAddress(),
          });
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

  handleDeleteAddress = (id, status) => {
    if (status !== 1) {
      Alert.alert('Hapus Alamat', 'Apakah anda yakin menghapus alamat ini?.', [
        {
          text: 'Batal',
        },
        {
          text: 'Lanjutkan',
          onPress: () => this.deleteAddress(id),
        },
      ]);
    } else {
      ToastAndroid.show(
        'Ubah alamat utama anda terlebih dahulu sebelum menghapus alamat ini!',
        2200,
      );
    }
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

  handleEditAddress = (id) => {
    if (this.state.newAddress) {
      Alert.alert('Edit Alamat', 'Pastikan data yang anda masukkan sesuai!', [
        {
          text: 'Batal',
        },
        {
          text: 'Lanjutkan',
          onPress: () => this.editAddress(id),
        },
      ]);
    } else {
      ToastAndroid.show('Masukkan data anda dengan benar', 1200);
    }
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

  editAddress = (id) => {
    this.setState({loading: true});

    var myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + this.props.user.token);

    var formdata = new FormData();
    formdata.append('alamat', this.state.newAddress);
    formdata.append('wilayah_id', this.state.wilayah_id);
    formdata.append('_method', 'patch');

    console.log('ini form edit alamat', formdata);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
    };

    fetch(endpoint.edit_address + id, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log('hasil edit alamat === ', result);
        if (result.status === 'success') {
          this.getProfile();
          this.setState({loading: false, modalAddAddress: false});
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
      .then((response) => response.text())
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
        console.log('hasil ubah alamat === ', result);
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
    };

    fetch(
      'https://waste-bank.herokuapp.com/api/nasabah/permintaan',
      requestOptions,
    )
      .then((response) => response.json())
      .then((result) => {
        console.log('ini result buat permintaan == ', result);
        if (result.status === 'success') {
          this.setState({loading: false, modalForm: false});
          this.getPermintaan();
          ToastAndroid.show('Permintaan berhasil dibuat!', 1500);
        } else {
          ToastAndroid.show('Maaf permintaan gagal dibuat!', 1500);
        }
      })
      .catch((error) => {
        console.log('catch error makeRequest === ', error);
        this.setState({loading: false});
        ToastAndroid.show('Maaf permintaan gagal dibuat!', 1500);
      });
  };

  logout = () => {
    console.log('logout....');
    AsyncStorage.removeItem('token', () => {
      this.setState({modalProfile: false});
      this.props.navigation.navigate('Auth');
    }).catch((e) => console.log('catch error async logout', e));
  };

  openChat = (user) => {
    console.log('ini user openchat', user);
    this.setState(
      {
        currContact: user,
      },
      () => {
        this.setState({modalChat: true});
        this.getMessages(this.state.currContact.id);
      },
    );
  };

  activeCS = () => {
    let contact = '';

    if (this.state.currContact.name) {
      contact = this.state.currContact.name;
    }
    return contact;
  };

  moneyCol(status) {
    if (status > 0) {
      return {color: 'green'};
    } else if (status > 0) {
      return {color: 'red'};
    }
  }

  render() {
    const {avatar, name, no_telpon, email} = this.props.user.data;
    return (
      <ScrollView contentContainerStyle={styles.scrollview}>
        <StatusBar
          translucent
          barStyle={'light-content'}
          backgroundColor={'#ffffff00'}
        />
        <View style={styles.header}>
          <View style={styles.headerProf}>
            <TouchableOpacity
              onPress={() => this.setState({modalProfile: true})}
              activeOpacity={0.8}
              style={styles.s_profile}>
              <Image source={{uri: avatar}} style={styles.s_profile} />
            </TouchableOpacity>
            <Text style={styles.hi_text}> Hi {name}!</Text>
          </View>
          <IonIcon
            onPress={() => this.setState({modalActiveChat: true})}
            name={'chatbubble-ellipses-outline'}
            size={45}
          />
        </View>
        <View style={styles.balanceCont}>
          <Text style={styles.balanceTitle}>Saldo anda</Text>
          <Text numberOfLines={1} style={styles.balance}>
            Rp.{this.props.user.saldo.saldo}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={() => this.setState({modalForm: true})}>
          <IonIcon name={'trash'} color={'green'} size={55} />
          <Text style={styles.requestButton}>Jual Sampah</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={() => this.setState({modalRequest: true})}>
          <MaterialCommunityIcons
            name={'dump-truck'}
            color={'green'}
            size={55}
          />
          <Text style={styles.requestButton}>Permintaan Sampah</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={() => {
            this.setState({modalBank: true});
            this.getSaving();
          }}>
          <AntDesign name={'book'} color={'green'} size={55} />
          <Text style={styles.requestButton}>Riwayat</Text>
        </TouchableOpacity>
        {/* ------Modal untuk Chat------ */}
        <Modal
          transparent={true}
          statusBarTranslucent={true}
          visible={this.state.modalChat}
          animationType={'fade'}
          onRequestClose={() =>
            this.setState({modalChat: false, currChat: [], currContact: {}})
          }>
          <KeyboardAvoidingView behavior={'padding'} style={styles.chatCont}>
            <ScrollView
              ref={(ref) => {
                this.scrollView = ref;
              }}
              onContentSizeChange={() =>
                this.scrollView.scrollToEnd({animated: true})
              }
              contentContainerStyle={styles.contactsScroll}>
              <Text style={styles.contactsTitle}>{this.activeCS()}</Text>
              {this.state.currChat.map((v, i) => {
                let pos =
                  // eslint-disable-next-line eqeqeq
                  v.from == this.props.user.data.id
                    ? {alignItems: 'flex-end'}
                    : {alignItems: 'flex-start'};

                return (
                  <View key={i} style={[styles.chatBubCont, pos]}>
                    <TouchableOpacity
                      onPress={() => {}}
                      activeOpacity={0.95}
                      style={styles.chatList}>
                      <Text style={styles.addressListNumber}>{v.message}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              {this.state.loadChat ? (
                <ActivityIndicator color={'white'} size={'large'} />
              ) : (
                <View />
              )}
            </ScrollView>
            <View style={styles.chatInputCont}>
              <TextInput
                multiline
                value={this.state.chat}
                onChangeText={(text) => this.setState({chat: text})}
                style={styles.chatInput}
              />
              <TouchableOpacity
                onPress={() => this.sendMessages(this.state.currContact.id)}
                activeOpacity={0.9}
                style={styles.sendButton}>
                <Text style={styles.sendButtonText}>SEND</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
        {/* ------Modal untuk Kontak Semua CS------ */}
        <Modal
          transparent={true}
          statusBarTranslucent={true}
          visible={this.state.modalContacts}
          animationType={'fade'}
          onRequestClose={() =>
            this.setState({modalContacts: false, currChat: []})
          }>
          <View style={styles.chatsCont}>
            <ScrollView
              style={{width: '100%'}}
              contentContainerStyle={styles.contactsScroll}>
              <Text style={styles.contactsTitle}>Customer Service</Text>
              {this.state.cs_contacts.map((v, i) => {
                return (
                  <TouchableOpacity
                    onPress={() => this.openChat(v.user)}
                    activeOpacity={0.95}
                    style={styles.addressList}
                    key={i}>
                    <View style={styles.contactRow}>
                      <View>
                        <Text style={styles.addressListNumber}>
                          Kontak {(i + 1).toString()}
                        </Text>
                        <Image
                          source={{uri: v.user.avatar}}
                          style={styles.s_profile}
                        />
                        <Text>{v.user.name}</Text>
                      </View>
                      <IonIcon name={'chevron-forward'} size={55} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
        {/* ------Modal untuk Kontak Chat aktif------ */}
        <Modal
          transparent={true}
          statusBarTranslucent={true}
          visible={this.state.modalActiveChat}
          animationType={'fade'}
          onRequestClose={() => this.setState({modalActiveChat: false})}>
          <View style={styles.chatsCont}>
            <View style={styles.chatFooterCont}>
              <Text style={styles.contactsTitle}>Chat Aktif</Text>
            </View>
            <ScrollView
              style={{width: '100%'}}
              contentContainerStyle={styles.contactsScroll}>
              {this.state.active_contacts.map((v, i) => {
                return (
                  <TouchableOpacity
                    onPress={() => this.openChat(v)}
                    activeOpacity={0.95}
                    style={styles.addressList}
                    key={i}>
                    <View style={styles.contactRow}>
                      <View>
                        <Text style={styles.addressListNumber}>
                          Kontak {(i + 1).toString()}
                        </Text>
                        <Image
                          source={{uri: v.avatar}}
                          style={styles.s_profile}
                        />
                        <Text>{v.name}</Text>
                      </View>
                      <IonIcon name={'chevron-forward'} size={55} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.chatFooterCont}>
              <TouchableOpacity
                onPress={() => this.setState({modalContacts: true})}
                activeOpacity={0.9}
                style={styles.newChatCont}>
                <Text style={styles.newChatText}>Buat Chat Baru</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* ------Modal untuk Form request------ */}
        <Modal
          transparent={true}
          visible={this.state.modalForm}
          statusBarTranslucent={true}
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
          statusBarTranslucent={true}
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
        {/* ------Modal untuk list alamat------ */}
        <Modal
          transparent={true}
          visible={this.state.modalEditAddress}
          statusBarTranslucent={true}
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
                      activeOpacity={0.8}
                      style={styles.addressList}
                      key={i}>
                      <View style={styles.addressListHead}>
                        <Text style={styles.addressListNumber}>
                          Alamat {(i + 1).toString()}
                        </Text>
                        <IonIcon
                          name={'home'}
                          color={v.status === 1 ? 'green' : 'gray'}
                          size={25}
                          onPress={() => this.handleChangeMainAddress(v.id)}
                        />
                      </View>
                      <Text>{v.alamat}</Text>
                      <View style={styles.iconsCont}>
                        <IonIcon
                          style={styles.trashIcon}
                          name={'trash'}
                          color={'red'}
                          size={25}
                          onPress={() =>
                            this.handleDeleteAddress(v.id, v.status)
                          }
                        />
                        <IonIcon
                          style={styles.pencilIcon}
                          name={'pencil'}
                          color={'black'}
                          size={25}
                          onPress={() => {
                            this.setState({
                              modalAddAddress: true,
                              wilayah_id: v.wilayah_id,
                              newAddress: v.alamat,
                              modalEditing: true,
                              address_id: v.id,
                            });
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    modalAddAddress: true,
                    modalEditing: false,
                    newAddress: '',
                  });
                }}
                style={[styles.addressList, styles.newAddress]}>
                <Text>Tambah Alamat Baru</Text>
                <IonIcon name={'add-circle'} size={25} color={'green'} />
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
        {/* ------Modal untuk tambah alamat------ */}
        <Modal
          transparent={true}
          visible={this.state.modalAddAddress}
          statusBarTranslucent={true}
          animationType={'fade'}
          onRequestClose={() => this.setState({modalAddAddress: false})}>
          <View style={styles.addressScrollCont}>
            <ScrollView contentContainerStyle={styles.addressScroll}>
              <Text style={styles.addressListTitle}>
                {this.state.modalEditing
                  ? 'Edit Alamat'
                  : 'Masukkan Alamat Baru'}
              </Text>
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
                onPress={() =>
                  this.state.modalEditing
                    ? this.handleEditAddress(this.state.address_id)
                    : this.handleNewAddress()
                }
                style={styles.submitButton}>
                {this.state.loading ? (
                  <ActivityIndicator color={'white'} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {this.state.modalEditing ? 'Edit' : 'Tambah'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
        {/* ------Modal untuk list permintaan------ */}
        <Modal
          transparent={true}
          visible={this.state.modalRequest}
          statusBarTranslucent={true}
          animationType={'fade'}
          onRequestClose={() => this.setState({modalRequest: false})}>
          <TouchableOpacity
            onPress={() => this.setState({modalRequest: false})}
            activeOpacity={1}
            style={styles.formContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.requestScrollCont}>
              <ScrollView contentContainerStyle={styles.addressScroll}>
                <Text style={styles.addressListTitle}>Permintaan Anda</Text>
                {this.state.allRequest.map((v, i) => {
                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.requestList}
                      key={i}>
                      <View style={styles.addressListHead}>
                        <Text style={styles.addressListNumber}>
                          Permintaan {(i + 1).toString()}
                        </Text>
                        <IonIcon
                          name={
                            v.status === 1
                              ? 'checkmark-done-circle-outline'
                              : 'checkmark-done-circle-sharp'
                          }
                          color={v.status !== 1 ? 'green' : 'gray'}
                          size={25}
                          onPress={() => {}}
                        />
                      </View>
                      <View style={styles.formTextCont}>
                        <Text style={styles.formTextLeft}>Nama</Text>
                        <Text style={styles.formTextMid}>:</Text>
                        <Text style={styles.formTextRight}>{v.nama}</Text>
                      </View>
                      <View style={styles.formTextCont}>
                        <Text style={styles.formTextLeft}>No Telpon</Text>
                        <Text style={styles.formTextMid}>:</Text>
                        <Text style={styles.formTextRight}>{v.no_telpon}</Text>
                      </View>
                      <View style={styles.formTextCont}>
                        <Text style={styles.formTextLeft}>Keterangan</Text>
                        <Text style={styles.formTextMid}>:</Text>
                        <Text style={styles.formTextRight}>{v.keterangan}</Text>
                      </View>
                      <View style={styles.formTextCont}>
                        <Text style={styles.formTextLeft}>Alamat</Text>
                        <Text style={styles.formTextMid}>:</Text>
                        <Text style={styles.formTextRight}>{v.lokasi}</Text>
                      </View>
                      <View style={styles.formTextCont}>
                        <Text style={styles.formTextLeft}>Tanggal</Text>
                        <Text style={styles.formTextMid}>:</Text>
                        <Text style={styles.formTextRight}>{v.tanggal}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
        {/* ------Modal untuk tabungan------ */}
        <Modal
          transparent={true}
          visible={this.state.modalBank}
          statusBarTranslucent={true}
          animationType={'fade'}
          onRequestClose={() => this.setState({modalBank: false})}>
          <TouchableOpacity
            onPress={() => this.setState({modalBank: false})}
            activeOpacity={1}
            style={styles.formContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.requestScrollCont}>
              <Text style={styles.addressListTitle}>Transaksi</Text>
              <ScrollView contentContainerStyle={styles.addressScroll}>
                {this.state.savings.map((v, i) => {
                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.requestList}
                      key={i}>
                      <View style={styles.addressListHead}>
                        <Text
                          style={[
                            styles.addressListNumber,
                            this.moneyCol(v.debit),
                          ]}>
                          Transaksi {v.id.toString()}
                        </Text>
                        <MaterialIcons
                          name={v.debit > 0 ? 'attach-money' : 'money-off'}
                          color={v.debit > 0 ? 'green' : 'red'}
                          size={25}
                          onPress={() => {}}
                        />
                      </View>
                      <View style={styles.formTextCont}>
                        <Text style={styles.formTextLeft}>
                          {v.keterangan.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.formTextCont}>
                        <Text style={styles.formTextLeft}>Jumlah</Text>
                        <Text style={styles.formTextMid}>:</Text>
                        <Text
                          style={[
                            styles.formTextRight,
                            this.moneyCol(v.debit),
                          ]}>
                          Rp.
                          {v.debit > 0
                            ? v.debit.toString()
                            : v.kredit.toString()}
                        </Text>
                      </View>
                      <View style={styles.formTextCont}>
                        <Text style={styles.formTextLeft}>Tanggal</Text>
                        <Text style={styles.formTextMid}>:</Text>
                        <Text style={styles.formTextRight}>{v.created_at}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {this.state.loadChat ? (
                  <ActivityIndicator color={'green'} size={'large'} />
                ) : !this.state.loadChat &&
                  this.state.active_contacts.length < 1 ? (
                  <Text style={styles.no_message}>Tidak Ada Data</Text>
                ) : (
                  <View />
                )}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  no_message: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatFooterCont: {
    width: '100%',
    alignItems: 'center',
  },
  chatsCont: {
    alignItems: 'center',
    backgroundColor: 'green',
    flex: 1,
    paddingTop: 35,
  },
  newChatCont: {
    padding: 10,
    backgroundColor: '#eee',
    bottom: 5,
    borderRadius: 5,
    elevation: 5,
  },
  newChatText: {
    fontSize: 20,
    color: 'green',
  },
  chatList: {
    width: '80%',
    padding: 15,
    backgroundColor: '#c2c2c2',
    borderRadius: 10,
    marginVertical: 5,
    elevation: 4,
  },
  requestList: {
    padding: 5,
    margin: 10,
    backgroundColor: '#efefef',
    borderRadius: 5,
  },
  headerProf: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatCont: {
    flex: 1,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sendButton: {
    marginLeft: 5,
    height: 50,
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatInputCont: {
    width: '100%',
    maxHeight: 200,
    padding: 5,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  chatInput: {
    borderWidth: 1,
    borderColor: 'green',
    flex: 1,
    borderRadius: 5,
  },
  chatBubCont: {
    width: '100%',
    marginVertical: 5,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactsTitle: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  contactsScroll: {
    flexGrow: 1,
    padding: 5,
    paddingTop: 35,
    alignItems: 'center',
    backgroundColor: 'green',
  },
  balanceTitle: {
    color: '#333333',
    fontSize: 16,
  },
  balance: {
    fontSize: 27,
    fontWeight: 'bold',
    width: '80%',
  },
  balanceCont: {
    width: '100%',
    padding: 5,
    marginBottom: 10,
    justifyContent: 'center',
  },
  scrollview: {
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: '#2e995594',
    flexWrap: 'wrap',
    flexDirection: 'row',
    padding: 15,
  },
  header: {
    width: '100%',
    padding: 5,
    marginBottom: 5,
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    right: 10,
    bottom: 0,
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
    width: '47%',
    marginVertical: 10,
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
    paddingBottom: 100,
    alignItems: 'center',
    borderRadius: 10,
    flexGrow: 1,
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
    position: 'absolute',
    bottom: 0,
    width: '70%',
    alignSelf: 'center',
  },
  addressListHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trashIcon: {
    marginTop: 15,
  },
  pencilIcon: {
    marginTop: 15,
  },
  iconsCont: {
    flexDirection: 'row',
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
    alignItems: 'center',
    justifyContent: 'center',
  },

  requestScrollCont: {
    minHeight: 600,
    marginHorizontal: 5,
    paddingVertical: 10,
    marginVertical: 35,
    borderRadius: 10,
    backgroundColor: 'white',
    width: '90%',
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
