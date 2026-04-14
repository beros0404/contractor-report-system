import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './screens/LoginScreen';
import ContratosScreen from './screens/ContratosScreen';
import ActividadesDetalleScreen from './screens/ActividadesDetalleScreen';
import EvidenciaDetalleScreen from './screens/EvidenciaDetalleScreen';
import DashboardScreen from './screens/DashboardScreen';
import CalendarioScreen from './screens/CalendarioScreen';
import PerfilScreen from './screens/PerfilScreen';
import AporteScreen from './screens/AporteScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'Contratos') {
            iconName = focused ? 'document' : 'document-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Calendario') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Contratos" 
        component={ContratosScreen}
        options={{
          title: 'Contratos',
        }}
      />
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Calendario" 
        component={CalendarioScreen}
        options={{
          title: 'Calendario',
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen}
        options={{
          title: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen 
            name="ActividadesDetalle" 
            component={ActividadesDetalleScreen}
            options={{
              animationEnabled: true,
            }}
          />
          <Stack.Screen 
            name="EvidenciaDetalle" 
            component={EvidenciaDetalleScreen}
            options={{
              animationEnabled: true,
            }}
          />
          <Stack.Screen name="Aporte" component={AporteScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
