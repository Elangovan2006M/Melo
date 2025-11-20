import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeartIcon, BookmarkSquareIcon, QueueListIcon } from 'react-native-heroicons/solid';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

const LibraryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const favCol = collection(db, 'users', user.uid, 'favorites');
    const unsubFavs = onSnapshot(favCol, (snapshot) => {
      setFavoritesCount(snapshot.size);
    });

    const libCol = collection(db, 'users', user.uid, 'libraryTracks');
    const unsubLib = onSnapshot(libCol, (snapshot) => {
      setLibraryCount(snapshot.size);
      setLoading(false);
    });

    return () => {
      unsubFavs();
      unsubLib();
    };
  }, [user]);

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-white font-bold text-2xl">My Library</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Queue')} className="p-1">
          <QueueListIcon size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#DC2626" className="mt-10" />
      ) : (
        <View className="p-4">
          <TouchableOpacity 
            className="flex-row items-center p-4"
            onPress={() => navigation.navigate('Playlist', { type: 'favorites' })}
          >
            <View className="w-16 h-16 bg-red-600 rounded-md justify-center items-center">
              <HeartIcon size={32} color="white" />
            </View>
            <View className="ml-4">
              <Text className="text-white text-lg font-bold">Liked Songs</Text>
              <Text className="text-gray-400 text-sm">{favoritesCount} songs</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center p-4 mt-4"
            onPress={() => navigation.navigate('Playlist', { type: 'library' })}
          >
            <View className="w-16 h-16 bg-gray-700 rounded-md justify-center items-center">
              <BookmarkSquareIcon size={32} color="white" />
            </View>
            <View className="ml-4">
              <Text className="text-white text-lg font-bold">Saved Songs</Text>
              <Text className="text-gray-400 text-sm">{libraryCount} songs</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default LibraryScreen;