import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { TotalBalanceWidget } from './TotalBalanceWidget';
import { getCachedWidgetData } from '../services/WidgetService';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction, renderWidget } = props;

  if (widgetInfo.widgetName === 'TotalBalanceWidget') {
    switch (widgetAction) {
      case 'WIDGET_ADDED':
      case 'WIDGET_UPDATE':
      case 'WIDGET_RESIZED':
      case 'WIDGET_CLICK': {
        const data = await getCachedWidgetData();
        renderWidget(
          <TotalBalanceWidget
            balance={data.balance}
            walletCount={data.walletCount}
            currency={data.config?.currencySymbol || '₱'}
            config={data.config}
          />
        );
        break;
      }
      default:
        break;
    }
  }
}
