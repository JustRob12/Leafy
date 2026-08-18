import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { WidgetConfig, DEFAULT_WIDGET_CONFIG, WIDGET_THEMES } from '../services/WidgetService';

export interface TotalBalanceWidgetProps {
  balance?: number;
  walletCount?: number;
  currency?: string;
  config?: WidgetConfig;
}

export function TotalBalanceWidget({
  balance = 0,
  walletCount = 1,
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

  const walletText = walletCount === 1 ? '1 Active Wallet' : `${walletCount} Active Wallets`;
  const cleanTitle = (currentConfig.customTitle || 'LEAPON').replace(/^[^\w\s]+/, '').trim() || 'LEAPON';

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 24,
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
        {/* App Title & Label (Stacked: Leapon with TOTAL BALANCE below) */}
        <FlexWidget
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: 'leapon://home' }}
        >
          <TextWidget
            text={cleanTitle}
            style={{
              fontSize: 13,
              fontWeight: 'bold',
              color: theme.accentColor,
              letterSpacing: 1,
            }}
          />
          <TextWidget
            text="TOTAL BALANCE"
            style={{
              fontSize: 9,
              fontWeight: '600',
              color: theme.subTextColor,
              letterSpacing: 0.5,
              marginTop: 1,
            }}
          />
        </FlexWidget>

        {/* Right Action: Eye / Hide Button (Replaces Synced) */}
        <FlexWidget
          style={{
            backgroundColor: theme.pillBgColor,
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderColor: theme.borderColor,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          clickAction="TOGGLE_PRIVACY"
        >
          <TextWidget
            text={isHidden ? "👁 Show" : "👁 Hide"}
            style={{
              fontSize: 11,
              fontWeight: 'bold',
              color: theme.accentColor,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Center Main Section: Big Total Balance */}
      <FlexWidget
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          marginVertical: 6,
          width: 'match_parent',
        }}
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'leapon://home' }}
      >
        <TextWidget
          text={formattedBalance}
          style={{
            fontSize: 30,
            fontWeight: 'bold',
            color: '#ffffff',
            adjustsFontSizeToFit: true,
          }}
          maxLines={1}
        />
        {currentConfig.showWalletCount && (
          <TextWidget
            text={walletText}
            style={{
              fontSize: 12,
              color: '#94a3b8',
              marginTop: 4,
            }}
          />
        )}
      </FlexWidget>

      {/* Subtle Bottom Accent Indicator */}
      <FlexWidget
        style={{
          width: 'match_parent',
          height: 3,
          backgroundColor: theme.pillBgColor,
          borderRadius: 2,
        }}
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'leapon://home' }}
      />
    </FlexWidget>
  );
}
