import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Animated, ActivityIndicator, Share, TextInput, Modal, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeftIcon, MagnifyingGlassIcon, QueueListIcon } from 'react-native-heroicons/solid';
import { HeartIcon, PlusCircleIcon, ArrowDownTrayIcon, XMarkIcon, MinusCircleIcon } from 'react-native-heroicons/outline';
import { HeartIcon as HeartIconSolid } from 'react-native-heroicons/solid';
import TrackListItem from '../components/TrackListItem';
import { getAlbumDetails } from '../api/meloApi';
import { AuthContext } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { downloadAsync, cacheDirectory, deleteAsync } from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import Toast from 'react-native-toast-message';

const AlbumDetailsScreen = ({ route, navigation }) => {
  const { albumUrl, lang } = route.params;
  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTracks, setFilteredTracks] = useState([]);
  const { user } = useContext(AuthContext);
  const { 
    addToQueue, 
    playSound, 
    addToFavorites, 
    removeFromFavorites, 
    checkIfFavorite,
    saveToLibrary,
    removeFromLibrary,
    checkIfInLibrary
  } = usePlayer();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      const data = await getAlbumDetails(albumUrl, lang);
      setAlbumData(data);
      if (data?.tracks) {
        setFilteredTracks(data.tracks);
      }
      setLoading(false);
    };
    fetchAlbum();
  }, [albumUrl, lang]);

  useEffect(() => {
    if (!albumData?.tracks) return;
    if (searchQuery === '') {
      setFilteredTracks(albumData.tracks);
    } else {
      setFilteredTracks(
        albumData.tracks.filter(track =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artists.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, albumData]);

  const albumTitle = albumData?.breadcrumbs[albumData.breadcrumbs.length - 1] || 'Album';
  const artists = albumData?.tracks[0]?.artists || '';
  const albumImageSource = albumData?.image 
    ? { uri: albumData.image } 
    : require('../../assets/single-white.png');

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150, 250],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 150, 250],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const handleOptionsPress = (track) => {
    setSelectedTrack(track);
    setModalVisible(true);
  };


  const handleAddToFavorites = () => {
    if (!user || !selectedTrack) return;
    addToFavorites(selectedTrack);
    setModalVisible(false);
  };

  const handleRemoveFromFavorites = () => {
    if (!user || !selectedTrack) return;
    removeFromFavorites(selectedTrack.id);
    setModalVisible(false);
  };

  const handleSaveToLibrary = () => {
    if (!user || !selectedTrack) return;
    saveToLibrary(selectedTrack);
    setModalVisible(false);
  };

  const handleRemoveFromLibrary = () => {
    if (!user || !selectedTrack) return;
    removeFromLibrary(selectedTrack.id);
    setModalVisible(false);
  };
  
  const handleAddToQueue = () => {
    if (!selectedTrack) return;
    addToQueue(selectedTrack);
    setModalVisible(false);
  };

  const onTrackPress = (track) => {
    const albumInfo = { path: track.albumPageUrl, lang: track.lang };
    playSound(track, filteredTracks, albumInfo);
  };


  const isFavorite = selectedTrack ? checkIfFavorite(selectedTrack.id) : false;
  const isInLibrary = selectedTrack ? checkIfInLibrary(selectedTrack.id) : false;

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={['#404040', '#121212', '#121212']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        className="absolute top-0 left-0 right-0 h-full"
      />

      <View style={{ paddingTop: insets.top }}>
        <Animated.View
          className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-4 py-3"
          style={{ paddingTop: insets.top }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
            <ArrowLeftIcon size={24} color="white" />
          </TouchableOpacity>
          
          <Animated.View style={{ opacity: headerOpacity }} className="flex-1 items-center">
            <Text className="text-white font-bold text-base" numberOfLines={1}>{albumTitle}</Text>
          </Animated.View>
          
          <TouchableOpacity onPress={() => navigation.navigate('Queue')} className="p-1">
            <QueueListIcon size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        <View className="flex-row items-center bg-black/30 rounded-lg mx-4 mt-16 p-2">
          <MagnifyingGlassIcon size={24} color="#888888" />
          <TextInput
            placeholder="Find in album"
            placeholderTextColor="#888888"
            className="text-white text-base ml-2 flex-1"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <XMarkIcon size={20} color="#888888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 8 }}
      >
        <Animated.View style={{ opacity: imageOpacity }} className="items-center px-12 mb-4">
          <Image
            source={albumImageSource}
            className="w-64 h-64 rounded-lg shadow-lg"
          />
          <Text className="text-white text-2xl font-bold mt-4 text-center" numberOfLines={2}>
            {albumTitle}
          </Text>
          <Text className="text-gray-300 text-sm font-medium mt-1" numberOfLines={1}>
            {artists}
          </Text>
        </Animated.View>

        <View className="p-4">
          {filteredTracks.map((track) => (
            <TrackListItem
              key={track.id}
              track={track}
              onTrackPress={onTrackPress}
              onOptionsPress={handleOptionsPress}
            />
          ))}
        </View>
        
        <View style={{ height: 180 }} />
      </Animated.ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(!isModalVisible);
        }}
      >
        <Pressable 
          className="flex-1 justify-end" 
          onPress={() => setModalVisible(false)}
        >
          <Pressable 
            className="bg-[#282828] rounded-t-2xl pt-2" 
            style={{ paddingBottom: insets.bottom + 16 }}
            onPress={() => {}}
          >
            <View className="w-10 h-1 bg-gray-500 rounded-full self-center mb-4" />
            
            {selectedTrack && (
              <View className="flex-row items-center px-4 pb-4 border-b border-gray-600">
                <Image source={{ uri: selectedTrack.imageUrl }} className="w-12 h-12 rounded-md" />
                <View className="flex-1 ml-3">
                  <Text className="text-white text-base font-medium" numberOfLines={1}>{selectedTrack.title}</Text>
                  <Text className="text-gray-400 text-sm" numberOfLines={1}>{selectedTrack.artists}</Text>
                </View>
              </View>
            )}

            <View className="mt-4">
              <TouchableOpacity onPress={handleAddToQueue} className="flex-row items-center p-4">
                <QueueListIcon size={28} color="white" />
                <Text className="text-white text-lg ml-4">Add to Queue</Text>
              </TouchableOpacity>

              {isFavorite ? (
                <TouchableOpacity onPress={handleRemoveFromFavorites} className="flex-row items-center p-4">
                  <HeartIconSolid size={28} color="#DC2626" />
                  <Text className="text-white text-lg ml-4">Remove from Liked Songs</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleAddToFavorites} className="flex-row items-center p-4">
                  <HeartIcon size={28} color="white" />
                  <Text className="text-white text-lg ml-4">Add to Liked Songs</Text>
                </TouchableOpacity>
              )}
              
              {isInLibrary ? (
                <TouchableOpacity onPress={handleRemoveFromLibrary} className="flex-row items-center p-4">
                  <MinusCircleIcon size={28} color="white" />
                  <Text className="text-white text-lg ml-4">Remove from Library</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleSaveToLibrary} className="flex-row items-center p-4">
                  <PlusCircleIcon size={28} color="white" />
                  <Text className="text-white text-lg ml-4">Save to Library</Text>
                </TouchableOpacity>
              )}
              
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default AlbumDetailsScreen;