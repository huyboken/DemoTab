import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  I18nManager,
  StyleSheet,
  Text,
  TextStyle,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {TabsType} from './TabBar';
import {useTabbarStore} from '../../zustand/useTabbarStore';
let {width} = Dimensions.get('window');
var prevIndex = -1;

interface Props {
  value: Animated.AnimatedValue;
  tabs: Array<TabsType>;
  onTabChange?: (tab: TabsType) => void;
  labelStyle?: TextStyle;
  activeTabBackground?: string;
  Hvalue?: number;
  containerWidth?: number;
  defaultActiveTabIndex?: number;
  transitionSpeed?: number;
}

const StaticTabbar: React.FC<Props> = ({
  value,
  tabs,
  onTabChange,
  labelStyle,
  activeTabBackground,
  containerWidth,
  defaultActiveTabIndex,
  transitionSpeed,
}) => {
  const transitionDuration = transitionSpeed || 0;
  const activeTabIndex = defaultActiveTabIndex
    ? defaultActiveTabIndex > tabs.length
      ? 0
      : defaultActiveTabIndex
    : 0;

  const values = useRef(
    tabs.map(
      (tab, index) => new Animated.Value(index === activeTabIndex ? 1 : 0),
    ),
  ).current;

  const bounceValues = useRef(tabs.map(() => new Animated.Value(0))).current;

  const changeBottomTab = useTabbarStore(state => state.changeBottomTab);
  useEffect(() => {
    onPress(activeTabIndex, true);
  }, []);

  useEffect(() => {
    if (changeBottomTab) {
      onPress(changeBottomTab?.index, false);
    }
  }, [changeBottomTab]);

  const range = (start: number, end: number) => {
    var len = end - start;
    var a = new Array(len);
    for (let i = 0; i < len; i++) a[i] = start + i;
    return a;
  };

  const onPress = (index: number, noAnimation: boolean = false) => {
    if (prevIndex !== index) {
      let customWidth = containerWidth ? containerWidth : width;
      const tabWidth = customWidth / tabs.length;
      let rangeNumber = range(0, tabs.length).reverse();

      bounceValues.forEach((bv, idx) => {
        if (idx !== index) {
          bv.setValue(0);
        }
      });

      Animated.sequence([
        Animated.parallel(
          values.map((v: Animated.AnimatedValue | Animated.AnimatedValueXY) =>
            Animated.timing(v, {
              toValue: 0,
              useNativeDriver: true,
              duration: noAnimation ? 0 : 50,
            }),
          ),
        ),
        Animated.timing(value, {
          toValue: I18nManager.isRTL
            ? customWidth + tabWidth * rangeNumber[index]
            : tabWidth * index,
          useNativeDriver: true,
          duration: noAnimation ? 0 : transitionDuration,
        }),
        Animated.timing(values[index], {
          toValue: 1,
          useNativeDriver: true,
          // duration: 750,
          duration: 0,
        }),
        // Add bounce down animation for the active tab
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceValues[index], {
              toValue: 1,
              useNativeDriver: true,
              duration: 150,
            }),
            Animated.timing(bounceValues[index], {
              toValue: 0,
              useNativeDriver: true,
              duration: 150,
            }),
          ]),
          {iterations: 1},
        ),
      ]).start();
      prevIndex = index;
    }
  };

  let customWidth = containerWidth ? containerWidth : width;
  let mergeLabelStyle = {...styles.labelStyle, ...labelStyle};
  let newActiveIcon = [
    styles.activeIcon,
    {backgroundColor: activeTabBackground ? activeTabBackground : '#fff'},
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab, key) => {
        const tabWidth = customWidth / tabs.length;
        let rangeNumber = range(0, tabs.length).reverse();
        const cursor = I18nManager.isRTL
          ? customWidth + tabWidth * rangeNumber[key]
          : tabWidth * key;

        const opacity = value?.interpolate({
          inputRange: [cursor - tabWidth, cursor, cursor + tabWidth],
          outputRange: [1, 0, 1],
          extrapolate: 'clamp',
        });

        const opacity1 = values[key].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });

        const bounce = bounceValues[key].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 10],
          extrapolate: 'clamp',
        });

        return (
          <React.Fragment key={key}>
            <TouchableWithoutFeedback
              onPress={() => {
                onPress(key);
                onTabChange && onTabChange(tab);
              }}>
              <Animated.View
                style={[styles.tab, {opacity: opacity, zIndex: 100}]}>
                {tab.inactiveIcon}
                <Text style={mergeLabelStyle}>{tab.title ?? tab.name} </Text>
              </Animated.View>
            </TouchableWithoutFeedback>
            <Animated.View
              style={{
                position: 'absolute',
                top: -8,
                left: tabWidth * key,
                width: tabWidth,
                height: 64,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: opacity1,
                zIndex: 50,
                transform: [
                  {
                    translateY: bounce,
                  },
                ],
              }}>
              <View
                style={[
                  newActiveIcon,
                  {
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 0,
                    zIndex: 1,
                  },
                ]}>
                {tab.activeIcon}
              </View>
              {/* <Text style={mergeLabelStyle}>{tab.name} </Text> */}
            </Animated.View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 64,
  },
  activeIcon: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelStyle: {
    fontSize: 11,
    fontWeight: '600',
    // marginTop: 3,
    color: '#000',
  },
});

export default StaticTabbar;
