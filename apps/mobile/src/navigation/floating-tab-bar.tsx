import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../features/auth/context/auth-context';
import { colors, radius, shadows } from '../theme';
import type { RootStackParamList } from './types';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<
  string,
  { active: IoniconName; inactive: IoniconName }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Catalog: { active: 'grid', inactive: 'grid-outline' },
  Race: { active: 'trophy', inactive: 'trophy-outline' },
  Challenge: { active: 'ribbon', inactive: 'ribbon-outline' },
  Comparateur: { active: 'analytics', inactive: 'analytics-outline' },
  Reprise: { active: 'refresh-circle', inactive: 'refresh-circle-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Home: 'Accueil',
  Catalog: 'Catalogue',
  Race: 'Race',
  Challenge: 'Challenge',
  Comparateur: 'Comparer',
  Reprise: 'Reprise',
};

const HIDDEN_TABS = new Set(['Admin', 'Profile']);

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const { token, user, stravaPhotoUrl } = useAuth();
  const rootNav = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter(
    (route) => !HIDDEN_TABS.has(route.name),
  );

  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`
      .toUpperCase()
      .trim() || null;

  function handleProfilePress() {
    if (token) {
      navigation.navigate('Profile');
    } else {
      rootNav.navigate('Auth');
    }
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFillObject}>
      {/* Profile button — top-right */}
      <Pressable
        style={[styles.profileBtn, { top: insets.top + 10 }]}
        onPress={handleProfilePress}
        accessibilityRole="button"
        accessibilityLabel={token ? 'Mon profil' : 'Se connecter'}
      >
        {token && stravaPhotoUrl ? (
          <Image source={{ uri: stravaPhotoUrl }} style={styles.profilePhoto} />
        ) : token && initials ? (
          <Text style={styles.profileInitials}>{initials}</Text>
        ) : (
          <Ionicons
            name="person-outline"
            size={20}
            color={colors.textPrimary}
          />
        )}
      </Pressable>

      {/* Tab bar pill — bottom */}
      <View style={[styles.container, { bottom: Math.max(insets.bottom, 16) }]}>
        {visibleRoutes.map((route) => {
          const isFocused = state.routes[state.index]?.name === route.name;
          const icons = TAB_ICONS[route.name];
          const label = TAB_LABELS[route.name] ?? route.name;
          const iconName = icons
            ? isFocused
              ? icons.active
              : icons.inactive
            : 'ellipse-outline';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              style={styles.tab}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={label}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? colors.brandBlue : colors.textSecondary}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? colors.brandBlue : colors.textSecondary,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileBtn: {
    position: 'absolute',
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceDefault,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  profilePhoto: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  profileInitials: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceDefault,
    ...shadows.medium,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
