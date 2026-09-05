import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { WidgetConfig, DEFAULT_WIDGET_CONFIG, WIDGET_THEMES } from '../services/WidgetService';

export interface TotalBalanceWidgetProps {
  balance?: number;
  walletCount?: number;
  expense?: number;
  expenseCount?: number;
  currency?: string;
  config?: WidgetConfig;
}

export function TotalBalanceWidget({
  balance = 0,
  walletCount = 1,
  expense = 0,
  expenseCount = 0,
  currency = '₱',
  config = DEFAULT_WIDGET_CONFIG,
}: TotalBalanceWidgetProps) {
  const currentConfig = { ...DEFAULT_WIDGET_CONFIG, ...(config || {}) };
  const theme = WIDGET_THEMES.find(t => t.id === currentConfig.themeId) || WIDGET_THEMES[0];
  const curr = currentConfig.currencySymbol || currency || '₱';

  const isHidden = currentConfig.hideBalance;
  const formattedBalance = isHidden
    ? `${curr} ••••••`
    : `${curr} ${balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

  const formattedExpense = isHidden
    ? `${curr} ••••••`
    : `${curr} ${expense.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

  const walletText = walletCount === 1 ? '1 Active Wallet' : `${walletCount} Active Wallets`;
  const cleanTitle = (currentConfig.customTitle || 'LEON').replace(/^[^\w\s]+/, '').trim() || 'LEON';

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 22,
        backgroundGradient: {
          from: theme.gradientFrom,
          to: theme.gradientTo,
          orientation: 'TL_BR',
        },
        borderColor: theme.borderColor,
        borderWidth: 1,
      }}
    >
      {/* Top Header Row */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        {/* App Title & Label */}
        <FlexWidget
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <TextWidget
            text={cleanTitle}
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: theme.accentColor,
              letterSpacing: 1,
            }}
          />
          <TextWidget
            text="TOTAL BALANCE"
            style={{
              fontSize: 8.5,
              fontWeight: '600',
              color: theme.subTextColor,
              letterSpacing: 0.5,
              marginTop: 1,
            }}
          />
        </FlexWidget>

        {/* Right Action: Show / Hide Privacy Toggle Button */}
        <FlexWidget
          style={{
            backgroundColor: theme.pillBgColor,
            borderRadius: 10,
            paddingHorizontal: 9,
            paddingVertical: 3.5,
            borderColor: theme.borderColor,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          clickAction="TOGGLE_PRIVACY"
        >
          <TextWidget
            text={isHidden ? "Show" : "Hide"}
            style={{
              fontSize: 10,
              fontWeight: 'bold',
              color: theme.accentColor,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Center Main Section: Total Balance Display & Active Wallet Count */}
      <FlexWidget
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          marginVertical: 2,
          width: 'match_parent',
        }}
      >
        <TextWidget
          text={formattedBalance}
          style={{
            fontSize: 26,
            fontWeight: 'bold',
            color: '#ffffff',
            adjustsFontSizeToFit: true,
          }}
          maxLines={1}
        />
        {currentConfig.showWalletCount !== false && (
          <TextWidget
            text={walletText}
            style={{
              fontSize: 10.5,
              fontWeight: '500',
              color: theme.subTextColor,
              marginTop: 2,
            }}
          />
        )}
      </FlexWidget>

      {/* Bottom Section: Total Expense Display directly under Active Wallet Count */}
      {currentConfig.showExpense !== false && (
        <FlexWidget
          style={{
            width: 'match_parent',
            backgroundColor: theme.pillBgColor,
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderColor: theme.borderColor,
            borderWidth: 0.8,
            marginTop: 3,
          }}
        >
          <TextWidget
            text="Total Expense"
            style={{
              fontSize: 10,
              fontWeight: '600',
              color: theme.subTextColor,
            }}
          />
          <TextWidget
            text={formattedExpense}
            style={{
              fontSize: 11.5,
              fontWeight: 'bold',
              color: '#ffffff',
            }}
          />
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
