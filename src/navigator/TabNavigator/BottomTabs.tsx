import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  useFocusEffect,
  useNavigation,
  useNavigationState,
} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

import Tabbar, {TabsType} from './Tabbar';

import HomeScreen from '../../screen/HomeScreen';
import TransactionScreen from '../../screen/TransactionScreen';
import ReportScreen from '../../screen/ReportScreen';
import NotificationScreen from '../../screen/NotificationScreen';
import AccountScreen from '../../screen/AccountScreen';
import {useTabbarStore} from '../../zustand/useTabbarStore';

const {width, height} = Dimensions.get('window');

const getVisibleItemCount = (itemHeight: number) => {
  ``;
  return Math.ceil(height / itemHeight);
};

const Tab = createBottomTabNavigator();

const iconPaths: Record<string, any> = {
  Home: require('../../assets/lotties/home.json'),
  Report: require('../../assets/lotties/chart.json'),
  Transaction: require('../../assets/lotties/calender.json'),
  Notification: require('../../assets/lotties/notification.json'),
  Account: require('../../assets/lotties/account.json'),
};

const widths: Record<string, number> = {
  Home: 36,
  Notification: 40,
  Report: 60,
  Transaction: 100,
  Account: 60,
};

const colors: Record<string, string> = {
  Home: 'white',
  Report: 'white',
  Transaction: 'white',
  Notification: 'white',
  Account: 'white',
};

interface IconProps {
  name: string;
  isPlay: boolean;
}

const Icon: React.FC<IconProps> = React.memo(({name, isPlay}) => {
  const width = widths[name] || 60;
  return (
    <LottieView
      source={iconPaths[name]}
      autoPlay={isPlay}
      loop={false}
      style={{width, height: width}}
      resizeMode="contain"
    />
  );
});

const tabData = [
  {name: 'Home', title: 'Tổng quan'},
  {name: 'Transaction', title: 'Sổ giao dịch'},
  {name: 'Report', title: 'Báo cáo'},
  {name: 'Notification', title: 'Thông báo'},
  {name: 'Account', title: 'Tài khoản'},
].map(item => ({
  name: item.name,
  title: item.title,
  activeIcon: <Icon name={item.name} isPlay={true} />,
  inactiveIcon: <Icon name={item.name} isPlay={false} />,
}));

const BottomTabs: React.FC = () => {
  const navigation = useNavigation<any>();

  const changeBottomTab = useTabbarStore(state => state.changeBottomTab);
  const setChangeBottomTab = useTabbarStore(state => state.setChangeBottomTab);
  const wallets = useTabbarStore(state => state.wallets);
  const setWallets = useTabbarStore(state => state.setWallets);
  const budgets = useTabbarStore(state => state.budgets);
  const setBudgets = useTabbarStore(state => state.setBudgets);

  const [tabs, setTabs] = useState(tabData);

  const getCurrentRouteName = (state: any): string => {
    const route = state?.routes[state?.index];

    if (route?.state) {
      return getCurrentRouteName(route?.state);
    }

    return route?.name;
  };

  const currentRoute =
    useNavigationState(state => getCurrentRouteName(state)) ?? 'Home';

  const isShowBottomTab =
    tabs.some(tab => tab.name === currentRoute) ||
    ['HomeScreen', 'TransactionScreen'].includes(currentRoute);

  // Animated value for bottom tab visibility
  const animation = useRef(new Animated.Value(isShowBottomTab ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isShowBottomTab ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isShowBottomTab]);

  useEffect(() => {
    getInitData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        BackHandler.exitApp(); // Thoát ứng dụng trên Android
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, []),
  );

  const getInitData = () => {
    if (!wallets.length) {
      setWallets([]);
    }
    if (!budgets.length) {
      setBudgets([]);
    }
  };

  const onTabChange = useCallback(
    (item: TabsType) => {
      const index = tabs.findIndex(value => value.name === item.name);
      if ((changeBottomTab?.index ?? 0) === index) return;
      setChangeBottomTab(index, colors.Transaction);

      setTabs(
        tabs.map(tab => ({
          ...tab,
          activeIcon: <Icon name={tab.name} isPlay={tab.name === item.name} />,
        })),
      );
      navigation.navigate(item.name);
    },
    [tabs, changeBottomTab],
  );

  const tabbarOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'red',
          },
        }}
        tabBar={(props: BottomTabBarProps) => (
          <>
            {isShowBottomTab && (
              <Animated.View
                style={[styles.tabbarContainer, {opacity: tabbarOpacity}]}>
                <Tabbar
                  tabs={tabs}
                  tabBarContainerBackground={'white'}
                  labelStyle={styles.label}
                  onTabChange={onTabChange}
                  defaultActiveTabIndex={changeBottomTab.index ?? 0}
                  transitionSpeed={150}
                />
              </Animated.View>
            )}
          </>
        )}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Transaction" component={TransactionScreen} />
        <Tab.Screen name="Report" component={ReportScreen} />
        <Tab.Screen name="Notification" component={NotificationScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
      </Tab.Navigator>
    </View>
  );
};

export default BottomTabs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    color: '#4d4d4d',
    fontWeight: '600',
    fontSize: 11,
    position: 'absolute',
    bottom: 0,
  },
  tabbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
