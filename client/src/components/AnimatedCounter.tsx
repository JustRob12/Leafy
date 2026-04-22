import React, { useState, useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet, TextStyle } from 'react-native';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  prefix?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  shouldAnimate?: boolean;
}

export default function AnimatedCounter({ 
  value, 
  duration = 1500, 
  style, 
  prefix = '₱',
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
  shouldAnimate = true
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(shouldAnimate ? 0 : value);
  const animatedValue = useRef(new Animated.Value(shouldAnimate ? 0 : value)).current;

  useEffect(() => {
    if (!shouldAnimate) {
        setDisplayValue(value);
        return;
    }

    // Reset to 0 when component mounts to trigger count-up
    animatedValue.setValue(0);
    
    const listenerId = animatedValue.addListener(({ value: currentVal }) => {
      setDisplayValue(currentVal);
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration: duration,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listenerId);
      animatedValue.stopAnimation();
    };
  }, [value, duration, shouldAnimate]);

  const formattedValue = displayValue.toLocaleString('en-PH', {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return (
    <Text style={style}>
      {prefix}{formattedValue}
    </Text>
  );
}
