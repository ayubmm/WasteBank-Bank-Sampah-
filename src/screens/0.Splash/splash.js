import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import {connect} from 'react-redux';
import {endpoint} from '../../endpoint';

class Splash extends Component {
  componentDidMount = () => {
    setTimeout(() => {
      AsyncStorage.getItem('token')
        .then((res) => {
          if (res) {
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
    }, 600);
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
          }
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

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.splash}> Splash </Text>
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