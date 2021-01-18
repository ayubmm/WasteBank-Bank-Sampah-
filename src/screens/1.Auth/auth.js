import React, {PureComponent} from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {endpoint} from '../../endpoint';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import {kecamatan} from '../../kecamatanBantul';

class Auth extends PureComponent {
  constructor() {
    super();
    this.state = {
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
      address: '',
      phone: '',
      box: 'Masuk',
      passwordSecure: true,
      loading: false,
      wilayah_id: kecamatan[0].nama,
    };
  }

  handleLogin() {
    if (this.state.email && this.state.password) {
      this.login();
    } else {
      ToastAndroid.show(
        'Masukkan Email dan Password anda telebih dahulu !',
        750,
      );
    }
  }

  handleRegister() {
    if (
      this.state.username &&
      this.state.email &&
      this.state.address &&
      this.state.phone &&
      this.state.wilayah_id &&
      this.state.password === this.state.password_confirmation
    ) {
      this.register();
    } else {
      ToastAndroid.show('Isi form pendaftaran anda dengan benar !', 750);
    }
  }

  register() {
    this.setState({loading: true});

    const {
      email,
      password,
      address,
      password_confirmation,
      username,
      phone,
      wilayah_id,
    } = this.state;

    let data = {
      name: username,
      email: email,
      alamat: address,
      no_telpon: phone,
      password: password,
      password_confirmation: password_confirmation,
      wilayah_id: wilayah_id,
    };

    let form = new FormData();

    for (var key in data) {
      form.append(key, data[key]);
    }

    console.log('ini form pendaftaran : ', form);

    fetch(endpoint.register, {
      method: 'POST',
      body: form,
    })
      .then((res) => res.json())
      .then((resJson) => {
        console.log('ini resJson register: ', resJson);
        if (resJson.token) {
          ToastAndroid.show('Pendaftaran berhasil!', 1500);
          this.setState({box: 'Masuk', loading: false});
        } else {
          ToastAndroid.show(JSON.stringify(resJson), 1500);
          this.setState({loading: false});
        }
      })
      .catch((err) => {
        console.log('catch register == ', err);
        ToastAndroid.show('Ada yang salah, silahkan coba lagi', 1500);
        this.setState({loading: false});
      });
  }

  login() {
    this.setState({loading: true});
    const {email, password} = this.state;

    let data = {
      email: email,
      password: password,
    };

    let form = new FormData();

    for (var key in data) {
      form.append(key, data[key]);
    }

    console.log('ini form login : ', form);

    fetch(endpoint.login, {
      method: 'POST',
      body: form,
    })
      .then((res) => res.json())
      .then((resJson) => {
        console.log('ini resJson login : ', resJson);
        if (resJson.token) {
          AsyncStorage.setItem('token', resJson.token, () =>
            this.props.navigation.replace('Splash'),
          ).catch((e) => {
            console.log('error catch async setitem token', e);
            ToastAndroid.show('Maaf, token gagal disimpan', 500);
          });
        } else {
          ToastAndroid.show(JSON.stringify(resJson), 1500);
          this.setState({loading: false});
        }
      })
      .catch((err) => {
        console.log('catch login == ', err);
        ToastAndroid.show('Ada yang salah, silahkan coba lagi', 1500);
        this.setState({loading: false});
      });
  }

  passwordCheck = (a, b) => {
    if (a === b) {
      return {
        color: 'black',
      };
    } else {
      return {
        color: 'red',
      };
    }
  };

  MasukBox = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollview}>
        <View style={styles.loginbox}>
          <Text style={styles.boxTitle}>Halo</Text>
          <TextInput
            style={styles.input}
            keyboardType={'email-address'}
            autoCapitalize={'none'}
            autoCompleteType={'email'}
            placeholder={'Email'}
            value={this.state.email}
            underlineColorAndroid={'#12a548'}
            onChangeText={(text) => this.setState({email: text})}
          />
          <View style={styles.passwordCont}>
            <TextInput
              style={[styles.input, styles.inputPass]}
              autoCapitalize={'none'}
              autoCompleteType={'password'}
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
                this.setState({passwordSecure: !this.state.passwordSecure})
              }
            />
          </View>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => this.handleLogin()}>
            {this.state.loading ? (
              <ActivityIndicator size={20} color={'white'} />
            ) : (
              <Text style={styles.buttonText}>Masuk</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.questionText}>
            Tidak punya akun? Silahkan{' '}
            <Text
              onPress={() => this.setState({box: 'Daftar'})}
              style={styles.daftarText}>
              daftar
            </Text>
          </Text>
        </View>
      </ScrollView>
    );
  };

  DaftarBox = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollview}>
        <View style={styles.loginbox}>
          <Text style={styles.boxTitle}>Pendaftaran</Text>
          <TextInput
            style={styles.input}
            placeholder={'Nama'}
            autoCapitalize={'words'}
            value={this.state.username}
            underlineColorAndroid={'#12a548'}
            onChangeText={(text) => this.setState({username: text})}
          />
          <TextInput
            style={styles.input}
            placeholder={'No Telpon'}
            keyboardType={'decimal-pad'}
            value={this.state.phone}
            underlineColorAndroid={'#12a548'}
            onChangeText={(text) => this.setState({phone: text})}
          />
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
            style={styles.input}
            autoCapitalize={'words'}
            placeholder={'Alamat Lengkap Anda'}
            value={this.state.address}
            underlineColorAndroid={'#12a548'}
            onChangeText={(text) => this.setState({address: text})}
          />
          <TextInput
            style={styles.input}
            keyboardType={'email-address'}
            autoCapitalize={'none'}
            autoCompleteType={'email'}
            placeholder={'Email'}
            value={this.state.email}
            underlineColorAndroid={'#12a548'}
            onChangeText={(text) => this.setState({email: text})}
          />
          <View style={styles.passwordCont}>
            <TextInput
              style={[styles.input, styles.inputPass]}
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
                this.setState({passwordSecure: !this.state.passwordSecure})
              }
            />
          </View>
          <View style={styles.passwordCont}>
            <TextInput
              style={[
                styles.input,
                styles.inputPass,
                this.passwordCheck(
                  this.state.password,
                  this.state.password_confirmation,
                ),
              ]}
              autoCapitalize={'none'}
              autoCompleteType={'password'}
              placeholder={'Konfirmasi Password'}
              value={this.state.password_confirmation}
              secureTextEntry={this.state.passwordSecure}
              underlineColorAndroid={'#12a548'}
              onChangeText={(text) =>
                this.setState({password_confirmation: text})
              }
            />
            <IonIcon
              style={styles.eyeIcon}
              name={this.state.passwordSecure ? 'eye-off' : 'eye'}
              size={32}
              color={'gray'}
              onPress={() =>
                this.setState({passwordSecure: !this.state.passwordSecure})
              }
            />
          </View>
          <TouchableOpacity
            onPress={() => this.handleRegister()}
            style={styles.signInButton}>
            {this.state.loading ? (
              <ActivityIndicator size={20} color={'white'} />
            ) : (
              <Text style={styles.buttonText}>Daftar</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.questionText}>
            Sudah punya akun? Silahkan{' '}
            <Text
              onPress={() => this.setState({box: 'Masuk'})}
              style={styles.daftarText}>
              masuk
            </Text>
          </Text>
        </View>
      </ScrollView>
    );
  };

  render() {
    if (this.state.box === 'Masuk') {
      return <this.MasukBox />;
    } else if (this.state.box === 'Daftar') {
      return <this.DaftarBox />;
    }
  }
}

export default Auth;

const styles = StyleSheet.create({
  scrollview: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e995594',
  },
  loginbox: {
    width: '90%',
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 70,
  },
  boxTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    position: 'absolute',
    top: 20,
    color: '#2e995594',
  },
  input: {
    width: '100%',
    marginVertical: 5,
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
  buttonText: {
    fontSize: 17,
    color: 'white',
  },
  questionText: {
    position: 'absolute',
    bottom: 25,
  },
  daftarText: {
    color: '#2e995594',
    fontWeight: 'bold',
  },
  picker: {
    // width: 100,
    flex: 1,
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
});
