import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Auth from '../screens/1.Auth/auth';
import HomeNasabah from '../screens/2.Home/homeNasabah';
import HomePengurus1 from '../screens/2.Home/homePengurus1';
import HomePengurus2 from '../screens/2.Home/homePengurus2';
import HomeCS from '../screens/2.Home/homeCS';
import Splash from '../screens/0.Splash/splash';

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode={'none'}>
        <Stack.Screen name={'Splash'} component={Splash} />
        <Stack.Screen name={'Auth'} component={Auth} />
        <Stack.Screen name={'Home_Nasabah'} component={HomeNasabah} />
        <Stack.Screen name={'Home_Pengurus1'} component={HomePengurus1} />
        <Stack.Screen name={'Home_Pengurus2'} component={HomePengurus2} />
        <Stack.Screen name={'Home_CS'} component={HomeCS} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
