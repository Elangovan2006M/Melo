import './global.css';
import React, { useContext } from 'react';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { PlayerProvider } from './src/context/PlayerContext';
import { ActivityIndicator, View } from 'react-native';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import QueueScreen from './src/screens/QueueScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { navigationRef } from './src/navigation/NavigationService';
import Toast from 'react-native-toast-message';

const RootStack = createNativeStackNavigator();

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <RootStack.Screen name="MainApp" component={AppNavigator} />
            <RootStack.Screen 
              name="Queue" 
              component={QueueScreen} 
              options={{ presentation: 'modal' }}
            />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};


export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PlayerProvider>
          <AppContent />
          <Toast />
        </PlayerProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}