import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/colors';
import type { PantryItem as PantryItemType } from '@fogon/types';
import type { StockLevel } from '@fogon/types';

interface PantryItemProps {
  item: PantryItemType;
  onCycleStock: (id: string, nextLevel: StockLevel) => void;
}

const STOCK_CONFIG: Record<StockLevel, { color: string; bgClass: string; textClass: string }> = {
  ok: { color: COLORS.success, bgClass: 'bg-success-bg', textClass: 'text-success' },
  low: { color: COLORS.warning, bgClass: 'bg-warning-bg', textClass: 'text-warning' },
  empty: { color: COLORS.error, bgClass: 'bg-bg-tertiary', textClass: 'text-error' },
};

const STOCK_CYCLE: Record<StockLevel, StockLevel> = {
  ok: 'low',
  low: 'empty',
  empty: 'ok',
};

export function PantryItem({ item, onCycleStock }: PantryItemProps) {
  const { t } = useTranslation();
  const config = STOCK_CONFIG[item.stockLevel];

  return (
    <Pressable
      onPress={() => onCycleStock(item.id, STOCK_CYCLE[item.stockLevel])}
      className="flex-1 m-1.5"
    >
      {({ pressed }) => (
        <View
          className={`bg-bg-secondary border border-border rounded-xl p-3 ${pressed ? 'opacity-70' : ''}`}
        >
          <Text className="text-text-primary text-base font-medium" numberOfLines={1}>
            {item.name}
          </Text>

          {item.quantity && (
            <Text className="text-text-tertiary text-xs mt-1">{item.quantity}</Text>
          )}

          <View className={`self-start mt-2 px-2 py-0.5 rounded-md ${config.bgClass}`}>
            <Text className={`text-xs font-semibold ${config.textClass}`}>
              {t(`pantry.stock.${item.stockLevel}`)}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
