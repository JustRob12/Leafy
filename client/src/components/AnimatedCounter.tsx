import React, { useState, useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet, TextStyle } from 'react-native';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  prefix?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export default function AnimatedCounter({ 
  value, 
  duration = 1500, 
  style, 
  prefix = '₱',
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset to 0 when component mounts to trigger count-up
    animatedValue.setValue(0);
    
    const listenerId = animatedValue.addListener(({ value: currentVal }) => {
      setDisplayValue(currentVal);
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration: duration,
      useNativeDriver: false, // Must be false for text/non-style animations using listeners
      // Premium easing: Starts fast and slows down
    }).start();

    return () => {
      animatedValue.removeListener(listenerId);
      animatedValue.stopAnimation();
    };
  }, [value, duration]);

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
