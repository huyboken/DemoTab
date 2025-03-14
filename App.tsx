import React from 'react';
import {StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import BottomTabs from './src/navigator/TabNavigator/BottomTabs';

const App = () => {
  return (
    <View style={{backgroundColor: 'red', flex: 1}}>
      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({});
