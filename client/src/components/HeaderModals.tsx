import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Modal, Image, FlatList } from 'react-native';
import { Settings, LogOut, ChevronRight, X, User, Bell, Egg, Sprout, TreeDeciduous } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { theme } from '../theme';
import { rf } from '../utils/responsive';
import { HeaderAlertItem } from '../hooks/useHeaderAlerts';

interface ProfileMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onSettings: () => void;
  onLogout: () => void;
  alignLeft?: boolean;
}

export function ProfileMenuModal({ visible, onClose, onSettings, onLogout, alignLeft }: ProfileMenuModalProps) {
  const { username, userImage, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={[
            styles.modalOverlay,
            alignLeft && {
              alignItems: 'flex-start',
              paddingLeft: 24,
              paddingRight: 0,
            },
          ]}
        >
          <TouchableWithoutFeedback>
            <View style={styles.dropdownMenu}>
              <View style={styles.dropdownHeader}>
                <View style={styles.dropdownProfileCircle}>
                  {userImage ? (
                    <Image source={{ uri: userImage }} style={styles.dropdownProfileImage} />
                  ) : (
                    <User size={24} color={colors.primary} />
                  )}
                </View>
                <View>
                  <Text style={styles.dropdownUsername}>{username || 'User'}</Text>
                  <Text style={styles.dropdownUserRole}>Leon Member</Text>
                </View>
              </View>

              <View style={styles.dropdownDivider} />

              <TouchableOpacity style={styles.dropdownItem} onPress={onSettings}>
                <View style={styles.dropdownItemLeft}>
                  <Settings size={18} color={colors.textMuted} />
                  <Text style={styles.dropdownItemText}>Settings</Text>
                </View>
                <ChevronRight size={16} color={colors.border} />
              </TouchableOpacity>

              <View style={styles.dropdownDivider} />

              <TouchableOpacity
                style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                onPress={onLogout}
              >
                <View style={styles.dropdownItemLeft}>
                  <LogOut size={18} color={colors.danger} />
                  <Text style={[styles.dropdownItemText, { color: colors.danger }]}>Log Out</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: HeaderAlertItem[];
  onMarkAllAsRead: () => void;
  onNavigate: (screen: string) => void;
}

export function NotificationModal({
  visible,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNavigate,
}: NotificationModalProps) {
  const { colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.notificationOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.notificationDropdown}>
              <View style={styles.notifDropdownHeader}>
                <Text style={styles.dropdownTitle}>Notifications</Text>
                {notifications.length > 0 && (
                  <TouchableOpacity onPress={onMarkAllAsRead}>
                    <Text style={styles.markReadText}>Mark all as read</Text>
                  </TouchableOpacity>
                )}
              </View>

              {notifications.length > 0 ? (
                <FlatList
                  data={notifications}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={notifications.length > 4}
                  style={{ maxHeight: 350 }}
                  renderItem={({ item }) => {
                    const IconComp = item.icon;
                    return (
                      <TouchableOpacity
                        style={styles.notifDropdownItem}
                        onPress={() => {
                          onClose();
                          onNavigate(item.screen);
                        }}
                      >
                        <View style={[styles.notifIconCircle, { backgroundColor: item.color + '15' }]}>
                          <IconComp size={16} color={item.color} />
                        </View>
                        <View style={styles.notifTextContent}>
                          <Text style={styles.notifItemTitle} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.notifItemMessage} numberOfLines={2}>{item.message}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              ) : (
                <View style={styles.notifEmptyDropdown}>
                  <Bell size={24} color={colors.textMuted} />
                  <Text style={styles.notifEmptyText}>No new notifications</Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

interface StreakModalProps {
  visible: boolean;
  onClose: () => void;
  streakCount: number;
  transactionDates: string[];
}

export function StreakModal({
  visible,
  onClose,
  streakCount,
  transactionDates,
}: StreakModalProps) {
  const { colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlayCenter}>
          <TouchableWithoutFeedback>
            <View style={styles.streakModal}>
              <View style={styles.streakModalHeader}>
                <Text style={styles.streakModalTitle}>Your Growth Journey</Text>
                <TouchableOpacity onPress={onClose}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.streakStatsRow}>
                <View style={styles.streakStatItem}>
                  <Text style={styles.streakStatValue}>{streakCount}</Text>
                  <Text style={styles.streakStatLabel}>Growth Days</Text>
                </View>
                <View style={styles.streakStatDivider} />
                <View style={styles.streakStatItem}>
                  <Text style={styles.streakStatValue}>
                    {streakCount >= 8 ? 'Tree' : streakCount >= 3 ? 'Sapling' : 'Seed'}
                  </Text>
                  <Text style={styles.streakStatLabel}>Tree Stage</Text>
                </View>
              </View>

              <View style={styles.stepperContainer}>
                <View style={styles.stepperLine} />
                <View style={styles.daysRow}>
                  {(() => {
                    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                    const today = new Date();
                    const currentDayIdx = today.getDay();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - currentDayIdx);

                    return days.map((day, idx) => {
                      const date = new Date(startOfWeek);
                      date.setDate(startOfWeek.getDate() + idx);
                      const dateStr = date.toISOString().split('T')[0];
                      const isCompleted = transactionDates.includes(dateStr);
                      const isToday = idx === currentDayIdx;

                      return (
                        <View key={idx} style={styles.dayStep}>
                          <View style={[
                            styles.dayCircle,
                            isCompleted && styles.dayCircleCompleted,
                            isToday && styles.dayCircleToday
                          ]}>
                            <Text style={[
                              styles.dayText,
                              isCompleted && styles.dayTextCompleted,
                              isToday && styles.dayTextToday
                            ]}>{day}</Text>
                          </View>
                        </View>
                      );
                    });
                  })()}
                </View>
              </View>

              <View style={styles.guideContainer}>
                <Text style={styles.guideTitle}>How Your Forest Grows</Text>

                <View style={styles.guideRow}>
                  <View style={styles.guideItem}>
                    <View style={[styles.guideIconCircle, { backgroundColor: isDarkMode ? 'rgba(146, 64, 14, 0.1)' : '#fffbeb' }]}>
                      <View style={{ transform: [{ rotate: '-20deg' }] }}>
                        <Egg size={20} color="#92400e" fill="#92400e" />
                      </View>
                    </View>
                    <Text style={styles.guideStageName}>Seed</Text>
                    <Text style={styles.guideStageDesc}>Day 1-2</Text>
                  </View>

                  <View style={styles.guideConnector} />

                  <View style={styles.guideItem}>
                    <View style={[styles.guideIconCircle, { backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4' }]}>
                      <Sprout size={20} color="#22c55e" fill="#22c55e" />
                    </View>
                    <Text style={styles.guideStageName}>Sapling</Text>
                    <Text style={styles.guideStageDesc}>Day 3-7</Text>
                  </View>

                  <View style={styles.guideConnector} />

                  <View style={styles.guideItem}>
                    <View style={[styles.guideIconCircle, { backgroundColor: colors.primary + '15' }]}>
                      <TreeDeciduous size={20} color={colors.primary} fill={colors.primary} />
                    </View>
                    <Text style={styles.guideStageName}>Tree</Text>
                    <Text style={styles.guideStageDesc}>Day 8+</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeStreakBtn}
                onPress={onClose}
              >
                <Text style={styles.closeStreakBtnText}>Keep Growing</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 16,
  },
  dropdownMenu: {
    width: 220,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDarkMode ? 0.4 : 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    gap: 10,
  },
  dropdownProfileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dropdownProfileImage: {
    width: '100%',
    height: '100%',
  },
  dropdownUsername: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
    color: colors.text,
  },
  dropdownUserRole: {
    fontFamily: theme.fonts.regular,
    fontSize: rf(11),
    color: colors.textMuted,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownItemText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(13),
    color: colors.text,
  },
  notificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  notificationDropdown: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDarkMode ? 0.4 : 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
    color: colors.text,
  },
  markReadText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
    color: colors.primary,
  },
  notifDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '60',
  },
  notifIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifTextContent: {
    flex: 1,
  },
  notifItemTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(13),
    color: colors.text,
    marginBottom: 2,
  },
  notifItemMessage: {
    fontFamily: theme.fonts.regular,
    fontSize: rf(11),
    color: colors.textMuted,
    lineHeight: 15,
  },
  notifEmptyDropdown: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  notifEmptyText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(13),
    color: colors.textMuted,
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  streakModal: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDarkMode ? 0.4 : 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakModalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
    color: colors.text,
  },
  streakStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  streakStatItem: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(22),
    color: colors.primary,
  },
  streakStatLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
    color: colors.textMuted,
    marginTop: 2,
  },
  streakStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  stepperContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  stepperLine: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: colors.border,
    zIndex: 0,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  dayStep: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayCircleToday: {
    borderColor: colors.primary,
  },
  dayText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(11),
    color: colors.textMuted,
  },
  dayTextCompleted: {
    color: '#ffffff',
  },
  dayTextToday: {
    color: colors.primary,
  },
  guideContainer: {
    marginBottom: 20,
  },
  guideTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(13),
    color: colors.text,
    marginBottom: 12,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guideItem: {
    alignItems: 'center',
    flex: 1,
  },
  guideIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  guideStageName: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(12),
    color: colors.text,
  },
  guideStageDesc: {
    fontFamily: theme.fonts.regular,
    fontSize: rf(10),
    color: colors.textMuted,
    marginTop: 2,
  },
  guideConnector: {
    width: 20,
    height: 2,
    backgroundColor: colors.border,
    marginTop: -16,
  },
  closeStreakBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeStreakBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
    color: '#ffffff',
  },
});
