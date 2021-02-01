import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  ToastAndroid,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
import {endpoint} from '../../endpoint';
import clearLogo from '../../assets/logo/clear_logo.png';

class Splash extends Component {
  componentDidMount = () => {
    setTimeout(() => {
      AsyncStorage.getItem('token')
        .then((res) => {
          if (res) {
            console.log('ini token async = ', res);
            this.props.changeUser({token: res});
            this.getNasabah(res);
          } else {
            this.props.navigation.replace('Auth');
          }
        })
        .catch((e) => {
          console.log('Catch dari async get token', e);
          ToastAndroid.show('Maaf Async get token gagal!', 1000);
        });
    }, 1300);
  };

  getNasabah = (token) => {
    fetch(endpoint.profile_home, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((resJson) => {
        console.log('ini resjson getnasabah == ', resJson);
        if (resJson.status === 'success') {
          this.props.changeUser(resJson);
          if (resJson.role === 6) {
            this.props.navigation.replace('Home_Nasabah');
          } else if (resJson.role === 5) {
            this.props.navigation.replace('Home_Pengurus2');
          } else if (resJson.role === 4) {
            this.props.navigation.replace('Home_Pengurus1');
          } else if (resJson.role === 3) {
            this.props.navigation.replace('Home_CS');
          }
        } else {
          AsyncStorage.removeItem('token', () => {
            this.props.navigation.replace('Auth');
          }).catch((e) => console.log('catch async remove ==', e));

          ToastAndroid.show(
            'Maaf gagal mengambil data!\nToken dihapus.Silahkan mulai ulang aplikasi!',
            10000,
          );
        }
      })
      .catch((err) => {
        console.log('catch getNasabah == ', err);
        ToastAndroid.show(
          'Maaf terjadi kesalahan!\nSilahkan mulai ulang aplkasi!',
          10000,
        );
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          translucent
          barStyle={'light-content'}
          backgroundColor={'#ffffff00'}
        />
        <Image style={{width: 200, height: 200}} source={clearLogo} />
        <ActivityIndicator color={'white'} size={40} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e995594',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splash: {
    fontSize: 25,
    fontWeight: 'bold',
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

export default connect(mapStateToProps, mapDispatchToProps)(Splash);
