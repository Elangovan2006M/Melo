import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { EllipsisVerticalIcon, Bars3Icon } from 'react-native-heroicons/outline';
import { usePlayer } from '../context/PlayerContext';
import * as Haptics from 'expo-haptics';

const PlaylistTrackListItem = ({ track, onTrackPress, onOptionsPress, drag, isActive }) => {
  const { isChangingTrack } = usePlayer();
  
  const handlePlayPress = () => {
    if (isChangingTrack) return;
    onTrackPress(track);
  };

  const handleDrag = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    drag();
  };

  return (
    <View 
      className={`flex-row items-center justify-between w-full bg-transparent mb-4 ${isActive ? 'bg-gray-700 rounded-lg' : ''}`}
    >
      <TouchableOpacity 
        onPress={handlePlayPress} 
        className="flex-1 flex-row items-center pr-4" 
        disabled={isChangingTrack || isActive}
      >
        <Image
          source={{ uri: track.imageUrl }}
          className="w-12 h-12 rounded-md"
        />
        <View className="flex-1 ml-3">
          <Text className="text-white text-base font-medium" numberOfLines={1}>
            {track.title}
          </Text>
          <Text className="text-gray-400 text-sm" numberOfLines={1}>
            {track.artists}
          </Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onOptionsPress(track)} className="p-2">
        <EllipsisVerticalIcon size={24} color="#888888" />
      </TouchableOpacity>

      <TouchableOpacity onLongPress={handleDrag} className="p-2">
        <Bars3Icon size={24} color="#888888" />
      </TouchableOpacity>
    </View>
  );
};

export default PlaylistTrackListItem;