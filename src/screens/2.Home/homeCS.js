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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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

class HomeCS extends Component {
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
      nas_contacts: [],
      active_contacts: [],
      currContact: {},
      currChat: [],
      chat: '',
    };
  }

  componentDidMount = () => {
    this.getNasContacts();
    this.getActiveContacts();
  };

  mainAddress = () => {
    let home = this.props.user.alamat.filter((v) => {
      return v.status === 1;
    });

    return home[0];
  };

  async getActiveContacts() {
    this.setState({loadChat: true});
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
        this.setState({loadChat: false, active_contacts: resJson.data});
      }
    } catch (err) {
      this.setState({loadChat: false});
      console.log('catch kontak aktif == ', err);
      ToastAndroid.show('Maaf gagal mengambil data kontak aktif!', 2000);
    }
  }

  async getNasContacts() {
    this.setState({loadChat: true});
    console.log('mulai ambil kontak nasabah');

    try {
      let myOptions = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.props.user.token}`,
        },
      };

      let response = await fetch(endpoint.cs_kontak_nasabah, myOptions);

      let resJson = await response.json();

      console.log('ini kontak nasabah == ', resJson);

      if (resJson.status === 'success') {
        this.setState({
          loading: false,
          loadChat: false,
          nas_contacts: resJson.data,
        });
      }
    } catch (err) {
      this.setState({loadChat: false});
      console.log('catch kontak nasabah == ', err);
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
        this.setState({loadChat: false, currChat: resJson.data});
      }
    } catch (err) {
      this.setState({loading: false});
      console.log('catch pesanku == ', err);
      ToastAndroid.show('Maaf gagal mengambil data pesan!', 2000);
    }
  }

  async sendMessages(id) {
    this.setState({loadChat: true});
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
        this.setState({loadChat: false});
        this.getMessages(id);
      }
    } catch (err) {
      this.setState({loadChat: false});
      console.log('catch kirim pesan == ', err);
      ToastAndroid.show('Maaf gagal mengirim data pesan!', 2000);
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

  render() {
    const {avatar, name, no_telpon, email} = this.props.user.data;
    return (
      <View style={styles.mainView}>
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
            <Text numberOfLines={1} style={styles.hi_text}>
              {' '}
              Hi {name}!
            </Text>
          </View>
        </View>
        <View style={styles.chatsCont}>
          <View style={styles.chatHeaderCont}>
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
            {this.state.loadChat ? (
              <ActivityIndicator color={'white'} size={'large'} />
            ) : !this.state.loadChat && this.state.active_contacts.length < 1 ? (
              <Text style={styles.no_message}>Tidak Ada Pesan</Text>
            ) : (
              <View />
            )}
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
        {/* ------Modal untuk Chat------ */}
        <Modal
          transparent={true}
          statusBarTranslucent={true}
          visible={this.state.modalChat}
          animationType={'fade'}
          onRequestClose={() =>
            this.setState({modalChat: false, currChat: [], currContact: {}})
          }>
          <KeyboardAvoidingView behavior={'padding'} style={styles.chatNasCont}>
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
              ) : !this.state.loadChat && this.state.currChat.length < 1 ? (
                <Text style={styles.no_message}>Tidak Ada Pesan</Text>
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

        {/* ------Modal untuk Kontak Semua Nasabah------ */}
        <Modal
          transparent={true}
          statusBarTranslucent={true}
          visible={this.state.modalContacts}
          animationType={'fade'}
          onRequestClose={() =>
            this.setState({modalContacts: false, currChat: []})
          }>
          <View style={styles.nasConCont}>
            <Text style={styles.contactsTitle}>Nasabah</Text>
            <ScrollView
              style={{width: '100%'}}
              contentContainerStyle={styles.contactsScroll}>
              {this.state.nas_contacts.map((v, i) => {
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
              {this.state.loadChat ? (
                <ActivityIndicator color={'white'} size={'large'} />
              ) : !this.state.loadChat && this.state.nas_contacts.length < 1 ? (
                <Text style={styles.no_message}>Tidak Ada Data</Text>
              ) : (
                <View />
              )}
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  no_message: {
    fontSize: 20,
    marginTop: 20,
    fontWeight: 'bold',
  },
  chatNasCont: {
    flex: 1,
    backgroundColor: 'green',
    paddingTop: 30,
  },
  nasConCont: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 30,
    backgroundColor: 'green',
  },
  chatHeaderCont: {
    width: '100%',
    alignItems: 'center',
    elevation: 10,
    justifyContent: 'center',
  },
  chatFooterCont: {
    width: '100%',
    alignItems: 'center',
    elevation: 10,
    justifyContent: 'center',
  },
  chatsCont: {
    alignItems: 'center',
    backgroundColor: 'green',
    flex: 1,
    padding: 5,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
    alignItems: 'center',
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
  mainView: {
    flex: 1,
    backgroundColor: '#2e995594',
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
    width: '80%',
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
    marginVertical: 40,
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

export default connect(mapStateToProps, mapDispatchToProps)(HomeCS);
