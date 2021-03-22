import React, { createRef, useEffect, useRef, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useDerivedValue,
  useAnimatedRef,
  scrollTo,
  measure,
  runOnJS,
  runOnUI,
} from "react-native-reanimated";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  Button,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

import { categories } from "./config";

export default function AnimatedStyleUpdateExample(props) {
  const tabScrollViewRef = useAnimatedRef();
  const screenScrollViewRef = useAnimatedRef();
  const activeCategoryIndex = useSharedValue(0);
  const activeCategoryWidth = useSharedValue([]);
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
        top: TOP_POSITION,
      };
    }
    return {
      top: 0,
    };
  });

  const setCurrentCategoryActive = (index) => {
    "worklet";

    activeCategoryIndex.value = index;
  };

  const setCurrentWidthCategory = (width) => {
    "worklet";

    activeCategoryWidth.value.push(width);
  };

  useDerivedValue(() => {
    const activeIndex = activeCategoryIndex.value;
    const categoriesWidths = activeCategoryWidth.value;
    let scrollWidth = 0;

    if (activeIndex > 0)
      scrollWidth = categoriesWidths
        .filter((item) => item.index < activeIndex)
        .reduce((acc, cara) => (acc = acc + cara.width), 0);

    const scrollPosition = scrollWidth;

    scrollTo(tabScrollViewRef, scrollPosition, 0, true);
  }, [activeCategoryIndex, activeCategoryWidth]);

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
            >
              {categories.map((category, index) => {
                return (
                  <CategoryTab
                    key={category.id}
                    {...{
                      category,
                      index,
                      y,
                      setCurrentWidthCategory,
                    }}
                  />
                );
              })}
            </Animated.ScrollView>
          </Animated.View>

          {categories.map((category, index) => {
            return (
              <CategoryItem
                key={category.id}
                {...{
                  category,
                  y,
                  index,
                  activeCategoryIndex,
                  screenScrollViewRef,
                  setCurrentCategoryActive,
                }}
              />
            );
          })}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function CategoryTab({ category, setCurrentWidthCategory, index, y }) {
  const categoryItemRef = useAnimatedRef();

  useDerivedValue(() => {
    try {
      const itemMeasurement = measure(categoryItemRef);
      setCurrentWidthCategory({ width: itemMeasurement.width, index });
    } catch (error) {}
  }, [y]);

  return (
    <Animated.View
      ref={categoryItemRef}
      style={{
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        borderColor: "white",
        borderWidth: 2,
      }}
      key={category.id}
    >
      <Text>{category.name}</Text>
    </Animated.View>
  );
}

function CategoryItem({
  id,
  y,
  setCurrentCategoryActive,
  activeCategoryIndex,
  index,
  category,
}) {
  const categoryItemRef = useAnimatedRef();

  useDerivedValue(() => {
    try {
      const itemMeasurement = measure(categoryItemRef);

      if (
        y.value > itemMeasurement.pageY &&
        y.value <= itemMeasurement.pageY + itemMeasurement.height &&
        activeCategoryIndex.value !== index
      ) {
        setCurrentCategoryActive(index);
      }
    } catch (error) {}
  }, [y]);

  return (
    <Animated.View
      ref={categoryItemRef}
      key={id}
      style={{
        backgroundColor: "brown",
        borderBottomColor: "red",
        borderBottomWidth: 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {category.products.map(({ id, name }) => (
        <TouchableOpacity
          style={{
            padding: 40,
            borderBottomColor: "white",
            borderBottomWidth: 3,
          }}
          key={id}
        >
          <Text style={{ fontSize: 40, color: "white" }}>
            {name} - {index}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}
