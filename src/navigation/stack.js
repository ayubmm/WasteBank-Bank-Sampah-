import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Auth from '../screens/1.Auth/auth';
import HomeNasabah from '../screens/2.Home/homeNasabah';
import Splash from '../screens/0.Splash/splash';

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode={'none'}>
        <Stack.Screen name={'Splash'} component={Splash} />
        <Stack.Screen name={'Auth'} component={Auth} />
        <Stack.Screen name={'Home_Nasabah'} component={HomeNasabah} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
