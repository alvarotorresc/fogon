import { useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Copy, UserPlus, LogOut } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useHouseholdStore } from '@/store/householdStore';
import { useHouseholdMembers } from '@/features/household/useHouseholdData';
import type { HouseholdMember } from '@fogon/types';

function MemberAvatar({ member }: { member: HouseholdMember }) {
  const initial = member.displayName.charAt(0).toUpperCase();

  return (
    <View
      className="w-10 h-10 rounded-full items-center justify-center"
      style={{ backgroundColor: member.avatarColor }}
      accessibilityLabel={member.displayName}
    >
      <Text className="text-white font-bold text-base">{initial}</Text>
    </View>
  );
}

function MemberRow({ member }: { member: HouseholdMember }) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3 py-3 px-4 border-b border-border-subtle">
      <MemberAvatar member={member} />
      <View className="flex-1">
        <Text className="text-text-primary font-medium text-base">{member.displayName}</Text>
      </View>
      <View
        className={`rounded-full px-2.5 py-1 ${
          member.role === 'owner' ? 'bg-brand-terracota/20' : 'bg-bg-tertiary'
        }`}
      >
        <Text
          className={`text-xs font-medium ${
            member.role === 'owner' ? 'text-brand-terracota' : 'text-text-secondary'
          }`}
        >
          {t(`hogar.${member.role}`)}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { household } = useHouseholdStore();
  const { data: members, isLoading, error, refetch } = useHouseholdMembers();

  const handleCopyCode = useCallback(async () => {
    if (!household?.inviteCode) return;
    try {
      await Share.share({ message: household.inviteCode });
    } catch {
      // User cancelled
    }
  }, [household]);

  const handleInvite = useCallback(async () => {
    if (!household?.inviteCode) return;
    try {
      await Share.share({ message: household.inviteCode });
    } catch {
      // User cancelled
    }
  }, [household]);

  const handleLeave = useCallback(() => {
    Alert.alert(t('hogar.leave'), t('hogar.leave_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('hogar.leave'),
        style: 'destructive',
        onPress: () => {
          // Placeholder: would call API to leave household
        },
      },
    ]);
  }, [t]);

  const renderMember = useCallback(
    ({ item }: { item: HouseholdMember }) => <MemberRow member={item} />,
    [],
  );

  const keyExtractor = useCallback((item: HouseholdMember) => item.id, []);

  if (!household) {
    return (
      <View className="flex-1 bg-bg-primary items-center justify-center">
        <Text className="text-text-secondary text-sm">{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-text-primary font-bold text-2xl">{t('hogar.title')}</Text>
      </View>

      {/* Household info card */}
      <View className="mx-4 mt-2 bg-bg-secondary rounded-xl border border-border p-4 gap-3">
        <Text className="text-text-primary font-semibold text-lg">{household.name}</Text>

        {/* Invite code */}
        <View className="gap-1.5">
          <Text className="text-text-secondary text-xs font-medium">
            {t('household.invite_code')}
          </Text>
          <Pressable
            onPress={handleCopyCode}
            className="flex-row items-center gap-2 bg-bg-tertiary rounded-lg px-3 py-2.5"
            accessibilityLabel={`${t('household.invite_code')}: ${household.inviteCode}`}
            accessibilityRole="button"
            accessibilityHint={t('hogar.copied')}
          >
            {({ pressed }) => (
              <View
                className="flex-row items-center gap-2 flex-1"
                style={{ opacity: pressed ? 0.7 : 1 }}
              >
                <Text className="text-brand-terracota font-mono text-base font-bold flex-1 tracking-widest">
                  {household.inviteCode}
                </Text>
                <Copy size={16} color={COLORS.textSecondary} strokeWidth={1.5} />
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Members section */}
      <View className="mt-6 flex-1">
        <View className="px-4 pb-2">
          <Text className="text-text-primary font-semibold text-lg">
            {t('hogar.members_title')}
            {members && (
              <Text className="text-text-tertiary font-normal"> ({members.length})</Text>
            )}
          </Text>
        </View>

        {isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator color={COLORS.terracota} />
          </View>
        ) : error ? (
          <View className="items-center py-12 gap-3">
            <Text className="text-error text-sm">{t('common.error')}</Text>
            <Pressable onPress={() => refetch()}>
              {({ pressed }) => (
                <Text
                  className="text-brand-blue text-sm font-medium"
                  style={{ opacity: pressed ? 0.7 : 1 }}
                >
                  {t('common.retry')}
                </Text>
              )}
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          />
        )}
      </View>

      {/* Bottom actions */}
      <View
        className="px-4 gap-3 border-t border-border pt-3 bg-bg-primary"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <Pressable
          onPress={handleInvite}
          className="flex-row items-center justify-center gap-2 h-12 rounded-xl bg-brand-blue"
          accessibilityLabel={t('hogar.invite')}
          accessibilityRole="button"
        >
          {({ pressed }) => (
            <View className="flex-row items-center gap-2" style={{ opacity: pressed ? 0.7 : 1 }}>
              <UserPlus size={18} color="white" strokeWidth={1.5} />
              <Text className="text-white font-semibold text-base">{t('hogar.invite')}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={handleLeave}
          className="flex-row items-center justify-center gap-2 h-12 rounded-xl"
          accessibilityLabel={t('hogar.leave')}
          accessibilityRole="button"
        >
          {({ pressed }) => (
            <View className="flex-row items-center gap-2" style={{ opacity: pressed ? 0.7 : 1 }}>
              <LogOut size={18} color={COLORS.error} strokeWidth={1.5} />
              <Text className="text-error font-semibold text-base">{t('hogar.leave')}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
