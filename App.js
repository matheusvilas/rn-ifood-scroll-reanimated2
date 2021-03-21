import React, { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useDerivedValue,
  useAnimatedRef,
  scrollTo,
} from "react-native-reanimated";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar as RNStatusBar,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

import { categories } from "./config";
import { clamp } from "react-native-redash";

export default function AnimatedStyleUpdateExample(props) {
  const tabScrollViewRef = useAnimatedRef();
  const screenScrollViewRef = useAnimatedRef();
  const activeCategoryIndex = useSharedValue(0);
  const headerHeight = useSharedValue(400);
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: ({ contentOffset: { y: value } }) => {
      y.value = value;
    },
  });

  const fixedStyle = useAnimatedStyle(() => {
    if (y.value > headerHeight.value) {
      const TOP_POSITION = y.value - headerHeight.value;
      return {
        top: clamp(TOP_POSITION, TOP_POSITION - 1, TOP_POSITION + 1),
      };
    }
    return {
      top: 0,
    };
  });

  function setCurrentCategoryActive(index) {
    "worklet";
    activeCategoryIndex.value = index;
  }

  useDerivedValue(() => {
    const scrollPosition = activeCategoryIndex.value * 130;

    scrollTo(tabScrollViewRef, scrollPosition, 0, true);
  }, [activeCategoryIndex]);

  return (
    <SafeAreaView
      style={{
        paddingTop: RNStatusBar.currentHeight,
      }}
    >
      <ExpoStatusBar style="dark" />
      <Animated.ScrollView
        ref={screenScrollViewRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={{ position: "relative" }}>
          <View style={{ backgroundColor: "yellow", height: 400 }}></View>
          <Animated.View
            style={[
              fixedStyle,
              {
                height: 70,
                backgroundColor: "cyan",
                width: "100%",
                zIndex: 1000,
              },
            ]}
          >
            <Animated.ScrollView
              ref={tabScrollViewRef}
              showsHorizontalScrollIndicator={false}
              horizontal
              style={{}}
            >
              {categories.map((category) => (
                <View
                  style={{
                    width: 130,
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: "white",
                    borderWidth: 2,
                  }}
                  key={category.id}
                >
                  <Text>{category.name}</Text>
                </View>
              ))}
            </Animated.ScrollView>
          </Animated.View>

          {categories.map((category, index) => (
            <CategoryItem
              key={category.id}
              {...{
                category,
                y,
                index,
                activeCategoryIndex,
                setCurrentCategoryActive,
                screenScrollViewRef,
              }}
            />
          ))}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function CategoryItem({
  id,
  y,
  category,
  setCurrentCategoryActive,
  activeCategoryIndex,
  index,
  screenScrollViewRef,
}) {
  const [anchorPosition, setAnchorPosition] = useState(0);
  const [listHeight, setListHeight] = useState(0);

  useDerivedValue(() => {
    if (y.value > anchorPosition && y.value <= anchorPosition + listHeight) {
      if (activeCategoryIndex.value !== index) setCurrentCategoryActive(index);
    }
  }, [y]);

  function handleScroll() {
    scrollTo(screenScrollViewRef, 0, screenScrollViewRef, true);
  }

  return (
    <View
      onLayout={({
        nativeEvent: {
          layout: { y: anchor, height },
        },
      }) => {
        setAnchorPosition(anchor);
        setListHeight(height);
      }}
      key={id}
      style={{
        backgroundColor: "brown",
        height: 1000,
        borderBottomColor: "red",
        borderBottomWidth: 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TouchableOpacity onPress={handleScroll}>
        <Animated.Text style={{ fontSize: 40, color: "white" }}>
          {anchorPosition} ~ {listHeight}
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
}
