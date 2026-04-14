// navigation/TabNavigator.tsx
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from '@expo/vector-icons/Ionicons'
import DashboardScreen from '../screens/DashboardScreen'
import ActividadesScreen from '../screens/ActividadesDetalleScreen'
import CalendarioScreen from '../screens/CalendarioScreen'
import PerfilScreen from '../screens/PerfilScreen'

const Tab = createBottomTabNavigator()

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Icon.glyphMap = 'home-outline'
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline'
          } else if (route.name === 'Actividades') {
            iconName = focused ? 'list' : 'list-outline'
          } else if (route.name === 'Calendario') {
            iconName = focused ? 'calendar' : 'calendar-outline'
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline'
          }
          
          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#4f6ef7',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#111827',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Actividades" 
        component={ActividadesScreen} 
        options={{ title: 'Actividades' }}
      />
      <Tab.Screen 
        name="Calendario" 
        component={CalendarioScreen} 
        options={{ title: 'Calendario' }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen} 
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  )
}