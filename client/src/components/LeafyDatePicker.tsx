import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated, TouchableWithoutFeedback } from 'react-native';
import { theme } from '../theme';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';

interface LeafyDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate?: Date;
  title?: string;
}

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 80) / 7;

export default function LeafyDatePicker({ visible, onClose, onSelect, initialDate, title = "Select Date" }: LeafyDatePickerProps) {
  const { colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const daysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderDays = () => {
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);
    const days = [];

    // Empty spots for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      const isToday = d === new Date().getDate() && 
                      month === new Date().getMonth() && 
                      year === new Date().getFullYear();
      
      const isSelected = initialDate && 
                         d === initialDate.getDate() && 
                         month === initialDate.getMonth() && 
                         year === initialDate.getFullYear();

      days.push(
        <TouchableOpacity 
          key={d} 
          style={styles.dayCell}
          onPress={() => {
            const selectedDate = new Date(year, month, d);
            onSelect(selectedDate);
            onClose();
          }}
        >
          <View style={[
            styles.dayCircle,
            isToday && styles.todayCircle,
            isSelected && styles.selectedCircle,
          ]}>
            <Text style={[
              styles.dayText,
              isToday && styles.todayText,
              isSelected && styles.selectedText
            ]}>{d}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.titleText}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                  <ChevronLeft size={20} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.monthInfo}>
                  <Text style={styles.monthText}>{monthNames[month]}</Text>
                  <Text style={styles.yearText}>{year}</Text>
                </View>
                <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                  <ChevronRight size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.weekRow}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <View key={i} style={styles.dayHeader}>
                    <Text style={styles.dayHeaderText}>{d}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {renderDays()}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
    borderRadius: 16,
    padding: 10,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  yearText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayHeader: {
    width: COLUMN_WIDTH,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  todayText: {
    color: colors.primary,
    fontFamily: theme.fonts.bold,
  },
  selectedCircle: {
    backgroundColor: colors.primary,
  },
  selectedText: {
    color: '#ffffff',
    fontFamily: theme.fonts.bold,
  },
});
