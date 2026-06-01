/**
 * XPBar — Barra de progresso de nível do usuário com animação de preenchimento.
 */

import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { getLevelRange } from "../store/gamificationStore";
import { useResponsiveScale } from "../hooks/useResponsiveScale";

export interface XPBarProps {
  xp: number;
  level: number;
}

export default function XPBar({ xp, level }: XPBarProps) {
  const { rs } = useResponsiveScale();
  const { min, max } = getLevelRange(level);

  const progress =
    level >= 5
      ? 1
      : max > min
        ? Math.min(Math.max((xp - min) / (max - min), 0), 1)
        : 0;

  const [trackWidth, setTrackWidth] = useState(0);
  const fillWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trackWidth <= 0) return;
    Animated.timing(fillWidth, {
      toValue: progress * trackWidth,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, trackWidth, fillWidth]);

  function onTrackLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== trackWidth) {
      setTrackWidth(w);
      fillWidth.setValue(progress * w);
    }
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.track, { height: rs(22), borderRadius: rs(11) }]}
        onLayout={onTrackLayout}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              borderRadius: rs(11),
              width: fillWidth,
            },
          ]}
        />
        <Text style={[styles.xpText, { fontSize: rs(12) }]}>
          {level >= 5 ? `${xp} XP` : `${xp}/${max}`}
        </Text>
      </View>

      <View style={styles.labels}>
        <Text style={[styles.levelLabel, { fontSize: rs(13) }]}>Lvl {level}</Text>
        <Text style={[styles.levelLabel, { fontSize: rs(13) }]}>
          {level >= 5 ? "MAX" : `Lvl ${level + 1}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 6,
  },
  track: {
    width: "100%",
    backgroundColor: "#1B1B1B",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#00DF21",
  },
  xpText: {
    color: Colors.white,
    fontWeight: "700",
    zIndex: 1,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  levelLabel: {
    color: "#00DF21",
    fontWeight: "600",
  },
});
