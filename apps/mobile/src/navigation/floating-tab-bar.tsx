import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows } from '../theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<
  string,
  { active: IoniconName; inactive: IoniconName }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Catalog: { active: 'grid', inactive: 'grid-outline' },
  Race: { active: 'trophy', inactive: 'trophy-outline' },
  Reprise: { active: 'refresh-circle', inactive: 'refresh-circle-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Home: 'Accueil',
  Catalog: 'Catalogue',
  Race: 'Race',
  Reprise: 'Reprise',
  Profile: 'Profil',
};

const HIDDEN_TABS = new Set(['Admin']);

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const visibleRoutes = state.routes.filter(
    (route) => !HIDDEN_TABS.has(route.name),
  );

  return (
    <View style={styles.container}>
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
                { color: isFocused ? colors.brandBlue : colors.textSecondary },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
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
