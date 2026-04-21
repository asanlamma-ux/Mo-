import React, {useEffect, useRef} from 'react'
import {Animated, Easing, ViewStyle} from 'react-native'

import {moeTheme} from '@/theme/moeTheme'

interface RevealViewProps {
  children: React.ReactNode
  delay?: number
  style?: ViewStyle
}

export function RevealView({
  children,
  delay = 0,
  style,
}: RevealViewProps): React.JSX.Element {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(18)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: moeTheme.motion.normal,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: moeTheme.motion.normal,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start()
  }, [delay, opacity, translateY])

  return (
    <Animated.View style={[style, {opacity, transform: [{translateY}]}]}>
      {children}
    </Animated.View>
  )
}
