import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { TotalBalanceWidget } from './TotalBalanceWidget';
import { getCachedWidgetData, saveWidgetConfig } from '../services/WidgetService';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction, clickAction, renderWidget } = props;

  if (widgetInfo.widgetName === 'TotalBalanceWidget') {
    switch (widgetAction) {
      case 'WIDGET_ADDED':
      case 'WIDGET_UPDATE':
      case 'WIDGET_RESIZED': {
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
      case 'WIDGET_CLICK': {
        if (clickAction === 'TOGGLE_PRIVACY') {
          const data = await getCachedWidgetData();
          const nextConfig = {
            ...data.config,
            hideBalance: !data.config.hideBalance,
          };
          await saveWidgetConfig(nextConfig);
          renderWidget(
            <TotalBalanceWidget
              balance={data.balance}
              walletCount={data.walletCount}
              currency={nextConfig.currencySymbol || '₱'}
              config={nextConfig}
            />
          );
          break;
        }

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
