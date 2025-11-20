import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigationState } from '@react-navigation/native';
import { HomeIcon, MagnifyingGlassIcon, BookmarkSquareIcon } from 'react-native-heroicons/outline';
import { Platform, View } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import AlbumDetailsScreen from '../screens/AlbumDetailsScreen';
import MiniPlayerBar from '../components/MiniPlayerBar';
import { usePlayer } from '../context/PlayerContext';
import LibraryScreen from '../screens/LibraryScreen';
import PlaylistScreen from '../screens/PlaylistScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="AlbumDetails" component={AlbumDetailsScreen} />
    </Stack.Navigator>
  );
};

const LibraryStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryHome" component={LibraryScreen} />
      <Stack.Screen name="Playlist" component={PlaylistScreen} />
    </Stack.Navigator>
  );
};

const ConditionalMiniPlayer = () => {
  const { currentTrack } = usePlayer();
  const navigationState = useNavigationState(state => state);

  if (!currentTrack) {
    return null;
  }

  const currentRoute = navigationState?.routes[navigationState.index];
  
  if (currentRoute?.name === 'Home') {
    const homeState = currentRoute.state;
    if (homeState) {
      const homeRouteName = homeState.routes[homeState.index].name;
      if (homeRouteName === 'AlbumDetails') {
        return null;
      }
    }
  }
  
  if (currentRoute?.name === 'Library') {
    const libraryState = currentRoute.state;
    if (libraryState) {
      const libraryRouteName = libraryState.routes[libraryState.index].name;
      if (libraryRouteName === 'Playlist') {
        return null;
      }
    }
  }

  return <MiniPlayerBar />;
};

const AppNavigator = () => {
  return (
    <View className="flex-1">
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#888888',
          tabBarStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderTopWidth: 0,
            paddingBottom: Platform.OS === 'ios' ? 20 : 5,
            height: 60,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') {
              return <HomeIcon color={color} size={size} />;
            } else if (route.name === 'Search') {
              return <MagnifyingGlassIcon color={color} size={size} />;
            } else if (route.name === 'Library') {
              return <BookmarkSquareIcon color={color} size={size} />;
            }
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Library" component={LibraryStack} />
      </Tab.Navigator>
      <ConditionalMiniPlayer />
    </View>
  );
};

export default AppNavigator;