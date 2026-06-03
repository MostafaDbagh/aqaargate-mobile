import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { FloatingTabBar } from '@/components/floating-tab-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <IconSymbol size={size} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="property-list"
        options={{
          title: t('tabs.buy'),
          tabBarIcon: ({ color, size }) => <IconSymbol size={size} name="tag.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="rent"
        options={{
          title: t('tabs.rent'),
          tabBarIcon: ({ color, size }) => <IconSymbol size={size} name="key.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vip"
        options={{
          title: t('tabs.vip'),
          tabBarIcon: ({ color, size }) => <IconSymbol size={size} name="star.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="agents"
        options={{
          title: t('tabs.agents'),
          tabBarIcon: ({ color, size }) => <IconSymbol size={size} name="person.2.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
