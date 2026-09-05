import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { WidgetConfig, DEFAULT_WIDGET_CONFIG } from '../services/WidgetService';

export interface TotalExpenseWidgetProps {
  expense?: number;
  expenseCount?: number;
  currency?: string;
  config?: WidgetConfig;
}

export function TotalExpenseWidget({
  expense = 0,
  expenseCount = 0,
  currency = '₱',
  config = DEFAULT_WIDGET_CONFIG,
}: TotalExpenseWidgetProps) {
  const currentConfig = { ...DEFAULT_WIDGET_CONFIG, ...(config || {}) };
  const curr = currentConfig.currencySymbol || currency || '₱';

  const isHidden = currentConfig.hideBalance;
  const formattedExpense = isHidden
    ? `${curr} ••••••`
    : `${curr} ${expense.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

  const expenseText =
    expenseCount === 1 ? '1 Expense' : `${expenseCount} Expenses`;
  const cleanTitle =
    (currentConfig.customTitle || 'LEON').replace(/^[^\w\s]+/, '').trim() || 'LEON';

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 9,
        borderRadius: 16,
        backgroundGradient: {
          from: '#ef4444',
          to: '#881337',
          orientation: 'TL_BR',
        },
        borderColor: '#fca5a5',
        borderWidth: 1,
      }}
    >
      {/* Top Compact Header Row */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <TextWidget
            text={cleanTitle}
            style={{
              fontSize: 10,
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: 0.6,
            }}
          />
          <TextWidget
            text=" • EXPENSE"
            style={{
              fontSize: 8,
              fontWeight: '600',
              color: '#fecdd3',
              letterSpacing: 0.4,
            }}
          />
        </FlexWidget>

        {/* Privacy Toggle */}
        <FlexWidget
          style={{
            backgroundColor: '#9f1239',
            borderRadius: 8,
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderColor: '#fca5a5',
            borderWidth: 0.8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          clickAction="TOGGLE_PRIVACY"
        >
          <TextWidget
            text={isHidden ? 'Show' : 'Hide'}
            style={{
              fontSize: 9,
              fontWeight: 'bold',
              color: '#ffffff',
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Main Expense Value Section */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: 'match_parent',
          marginTop: 2,
        }}
      >
        <TextWidget
          text={formattedExpense}
          style={{
            fontSize: 19,
            fontWeight: 'bold',
            color: '#ffffff',
            adjustsFontSizeToFit: true,
          }}
          maxLines={1}
        />
        <TextWidget
          text={expenseText}
          style={{
            fontSize: 9,
            fontWeight: '500',
            color: '#fecdd3',
            marginBottom: 2,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
