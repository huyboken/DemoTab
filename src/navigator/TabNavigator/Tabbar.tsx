import * as shape from 'd3-shape';
import React from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';

import StaticTabbar from './StaticTabbar';
import {useTabbarStore} from '../../zustand/useTabbarStore';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
let {width, height: screenHeight} = Dimensions.get('window');
const tabHeight = 65;

const getPath = (tabWidth: number, width: number, totalTab: number) => {
  const tab = shape
    .line<{x: number; y: number}>()
    .x(d => d.x)
    .y(d => d.y)
    .curve(shape.curveBasis)([
    {x: width + tabWidth / 2 - 100, y: 0},
    {x: width + tabWidth / 2 - 65 + -35, y: 0},
    {x: width + tabWidth / 2 - 50 + 10, y: -6},
    {x: width + tabWidth / 2 - 50 + 15, y: tabHeight - 14},
    {x: width + tabWidth / 2 + 50 - 15, y: tabHeight - 14},
    {x: width + tabWidth / 2 + 50 - 10, y: -6},
    {x: width + tabWidth / 2 + 65 - -35, y: 0},
    {x: width + tabWidth / 2 + 100, y: 0},
  ]);

  return ` ${tab} `;
};

const getRemainingPath = (tabPath: string, width: number, height: number) => {
  const pathData = `
    M0,0
    H${width * 2}
    V${height}
    H0
    Z
    ${tabPath}
  `;
  return pathData;
};

export interface TabsType {
  name: string;
  title?: string;
  activeIcon: React.ReactElement;
  inactiveIcon: React.ReactElement;
}

interface Props {
  tabs: Array<TabsType>;
  tabBarContainerBackground?: string;
  containerWidth?: number;
  activeTabBackground?: string;
  labelStyle?: TextStyle;
  onTabChange?: (tab: TabsType) => void;
  defaultActiveTabIndex?: number;
  transitionSpeed?: number;
}

const Tabbar: React.FC<Props> = ({
  tabs,
  tabBarContainerBackground,
  containerWidth,
  activeTabBackground,
  labelStyle,
  onTabChange,
  defaultActiveTabIndex,
  transitionSpeed,
}) => {
  const {translateX} = useTabbarStore();

  let CustomWidth = containerWidth ? containerWidth : width;
  const interpolatedTranslateX = translateX.interpolate({
    inputRange: [0, CustomWidth],
    outputRange: [-CustomWidth, 0],
  });

  const tabWidth =
    tabs.length > 0
      ? CustomWidth / tabs.length
      : console.error('please add tab data');

  let remainingPath;
  if (typeof tabWidth === 'number') {
    const d = getPath(tabWidth, CustomWidth, tabs.length);
    remainingPath = getRemainingPath(d, CustomWidth, screenHeight);
  }

  if (tabs.length > 0) {
    return (
      <>
        <AnimatedSvg
          width={CustomWidth * 2}
          height={tabHeight + 20}
          style={{
            transform: [{translateX: interpolatedTranslateX}],
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 9,
          }}>
          <Path fill={tabBarContainerBackground ?? 'white'} d={remainingPath} />
        </AnimatedSvg>

        <View
          style={[
            {
              position: 'absolute',
              bottom: 20,
              left: 0,
              right: 0,
              height: tabHeight,
            },
          ]}>
          <StaticTabbar
            tabs={tabs}
            value={translateX}
            onTabChange={onTabChange}
            activeTabBackground={activeTabBackground}
            labelStyle={labelStyle}
            defaultActiveTabIndex={defaultActiveTabIndex}
            transitionSpeed={transitionSpeed}
          />
        </View>
      </>
    );
  } else {
    return (
      <View style={styles.emptyContainer}>
        <Text>Please add tab data</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    width: width,
  },
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});

export default Tabbar;
