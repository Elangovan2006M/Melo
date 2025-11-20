import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { PlayIcon, PauseIcon, BackwardIcon, ForwardIcon } from 'react-native-heroicons/solid';
import { HeartIcon, QueueListIcon, PlusCircleIcon } from 'react-native-heroicons/outline';
import { HeartIcon as HeartIconSolid } from 'react-native-heroicons/solid';
import * as Haptics from 'expo-haptics';
import { navigate } from '../navigation/NavigationService';
import Slider from '@react-native-community/slider';

const formatTime = (millis) => {
  if (!millis) return '0:00';
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
};

const MiniPlayerBar = () => {
  const { 
    currentTrack, 
    isPlaying, 
    playbackStatus,
    playPause, 
    isChangingTrack,
    playNext,
    playPrevious,
    currentAlbumContext,
    addToFavorites,
    removeFromFavorites,
    checkIfFavorite,
    saveToLibrary,
    removeFromLibrary,
    checkIfInLibrary,
    seek
  } = usePlayer();

  if (!currentTrack) {
    return null;
  }

  const isFavorite = checkIfFavorite(currentTrack.id);
  const isSaved = checkIfInLibrary ? checkIfInLibrary(currentTrack.id) : false;

  const position = playbackStatus?.positionMillis || 0;
  const duration = playbackStatus?.durationMillis || 0;
  const isPlayingAudio = playbackStatus?.isPlaying || false;
  const imageSource = currentTrack.imageUrl 
    ? { uri: currentTrack.imageUrl } 
    : require('../../assets/single-white.png');

  const handlePlayPause = () => {
    if (isChangingTrack) return;
    playPause();
  };

  const handleNavigate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentAlbumContext) {
      navigate('MainApp', { 
        screen: 'Home',
        params: {
          screen: 'AlbumDetails',
          params: {
            albumUrl: currentAlbumContext.path, 
            lang: currentAlbumContext.lang 
          }
        }
      });
    }
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isFavorite) {
      removeFromFavorites(currentTrack.id);
    } else {
      addToFavorites(currentTrack);
    }
  };

  // --- Handle save/unsave ---
  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSaved) {
      if (removeFromLibrary) {
        removeFromLibrary(currentTrack.id);
      }
    } else {
      if (saveToLibrary) {
        saveToLibrary(currentTrack);
      }
    }
  };
  // --------------------------

  return (
    <View 
      className="bg-[#2a2a2a]"
      style={{
        position: 'absolute',
        bottom: 60,
        left: 8,
        right: 8,
        borderRadius: 8,
      }}
    >
      <View className="p-2">
        {/* --- Top Row: Song Details + Save Button --- */}
        <View className="flex-row items-center w-full mb-2">
          {/* Touchable Area for Navigation */}
          <TouchableOpacity 
            onPress={handleNavigate}
            activeOpacity={0.9}
            className="flex-row items-center flex-1"
          >
            <Image 
              source={imageSource}
              className="w-10 h-10 rounded bg-gray-700"
            />
            <View className="flex-1 mx-3">
              <Text className="text-white font-bold" numberOfLines={1}>{currentTrack.title}</Text>
              <Text className="text-gray-400 text-xs" numberOfLines={1}>{currentTrack.artists}</Text>
            </View>
          </TouchableOpacity>
          
          {/* "Add to Saved" Button */}
          <TouchableOpacity onPress={handleSave} className="p-2 ml-2">
            {isSaved ? (
              <PlusCircleIcon size={24} color="white" />
            ) : (
              <PlusCircleIcon size={24} color="#888888" />
            )}
          </TouchableOpacity>
        </View>

        <View className="px-1">
          <Slider
            style={{ width: '100%', height: 20 }}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={value => seek(value)}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#555555"
            thumbTintColor="#FFFFFF"
            disabled={isChangingTrack}
          />
        </View>

        <View className="flex-row items-center justify-between mt-1">
          <TouchableOpacity onPress={() => navigate('Queue')} className="p-2">
            <QueueListIcon size={24} color="#888888" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={playPrevious} className="p-2" disabled={isChangingTrack}>
            <BackwardIcon size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handlePlayPause} className="p-2" disabled={isChangingTrack}>
            {isPlayingAudio ? (
              <PauseIcon size={32} color="white" />
            ) : (
              <PlayIcon size={32} color="white" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => playNext(false)} className="p-2" disabled={isChangingTrack}>
            <ForwardIcon size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleFavorite} className="p-2">
            {isFavorite ? (
              <HeartIconSolid size={24} color="#DC2626" />
            ) : (
              <HeartIcon size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MiniPlayerBar;