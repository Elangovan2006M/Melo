import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { usePlayer } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { searchApi } from '../api/meloApi';
import { useNavigation } from '@react-navigation/native';
import SearchResultItem from '../components/SearchResultItem';
import { debounce } from 'lodash';

const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { playSound, currentTrack, isChangingTrack } = usePlayer();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState([]);

  const bottomPadding = currentTrack ? 180 : 90;

  const debouncedSearchRef = useRef();

  useEffect(() => {
    if (!user) return;
    
    const historyCol = collection(db, 'users', user.uid, 'history');
    const q = query(historyCol, orderBy('lastHeardAt', 'desc'), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, [user]);

  const performSearch = useCallback(async (query) => {
    if (query.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const [ta, ml, te, hi] = await Promise.all([
        searchApi(query, 'ta'),
        searchApi(query, 'ml'),
        searchApi(query, 'te'),
        searchApi(query, 'hi'),
      ]);
      setResults([...ta, ...ml, ...te, ...hi]);
    } catch (e) {
      console.error('Search failed', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array is fine, setters are stable

  useEffect(() => {
    debouncedSearchRef.current = debounce((query) => {
      performSearch(query);
    }, 500);

    return () => {
      debouncedSearchRef.current.cancel();
    };
  }, [performSearch]);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setResults([]);
      setLoading(false);
      debouncedSearchRef.current.cancel();
    } else {
      debouncedSearchRef.current(text);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setLoading(false);
    debouncedSearchRef.current.cancel();
  };

  const onHistoryTrackPress = (track) => {
    if (isChangingTrack) return;
    playSound(track, history, null);
  };

  const renderHistoryItem = ({ item }) => {
    const imageSource = item.imageUrl 
      ? { uri: item.imageUrl } 
      : require('../../assets/single-white.png');
    
    return (
      <View className="flex-row items-center justify-between w-full mb-4">
        <TouchableOpacity 
          onPress={() => onHistoryTrackPress(item)} 
          className="flex-1 flex-row items-center pr-4" 
          disabled={isChangingTrack}
        >
          <Image
            source={imageSource}
            className="w-12 h-12 rounded-md bg-gray-800"
          />
          <View className="flex-1 ml-3">
            <Text className="text-white text-base font-medium" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-gray-400 text-sm" numberOfLines={1}>
              {item.artists}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSearchItem = ({ item }) => (
    <SearchResultItem item={item} />
  );

  const renderContent = () => {
    if (searchQuery.length > 0) {
      if (loading) {
        return <ActivityIndicator size="large" color="#DC2626" className="mt-10" />;
      }
      return (
        <FlatList
          data={results}
          renderItem={renderSearchItem}
          keyExtractor={(item, index) => item.pageUrl + index}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          ListEmptyComponent={
            <Text className="text-gray-400 text-center mt-10">No results found for "{searchQuery}"</Text>
          }
        />
      );
    }

    if (history.length > 0) {
      return (
        <View>
          <Text className="text-white text-xl font-bold mb-4">Recent Listenings</Text>
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: bottomPadding }}
          />
        </View>
      );
    }

    return (
      <Text className="text-gray-400 text-center mt-10">
        Search for your favorite songs, artists, or albums.
      </Text>
    );
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-3">
        <Text className="text-white font-bold text-2xl mb-4">Search</Text>
        <View className="flex-row items-center rounded-lg px-4"
            style={{ backgroundColor: '#2a2a2a' }}>
          <MagnifyingGlassIcon size={20} color="#CCCCCC" />
          <TextInput
            placeholder="What do you want to listen to?"
            placeholderTextColor="#CCCCCC"
            className="text-white text-md flex-1 p-3"
            value={searchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <XMarkIcon size={20} color="#CCCCCC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-1 p-4">
        {renderContent()}
      </View>
    </View>
  );
};

export default SearchScreen;