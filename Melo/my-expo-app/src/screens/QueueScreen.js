import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftIcon, Bars3Icon, XMarkIcon } from 'react-native-heroicons/outline';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { usePlayer } from '../context/PlayerContext';
import * as Haptics from 'expo-haptics';

const QueueScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  // --- Add currentTrack ---
  const { queue, reorderQueue, removeFromQueue, playSound, isChangingTrack, currentTrack } = usePlayer();

  const handlePlay = (track) => {
    if (isChangingTrack) return;
    playSound(track, [], { path: track.albumPageUrl, lang: track.lang });
  }

  const renderItem = ({ item, drag, isActive }) => {
    return (
      <View
        className={`flex-row items-center p-4 ${isActive ? 'bg-gray-700' : 'bg-transparent'}`}
      >
        <TouchableOpacity onPress={() => removeFromQueue(item.id)} className="p-2">
          <XMarkIcon size={20} color="#888888" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handlePlay(item)} className="flex-1 flex-row items-center" disabled={isChangingTrack}>
          <Image
            source={{ uri: item.imageUrl }}
            className="w-12 h-12 rounded-md mx-3"
          />
          <View className="flex-1">
            <Text className="text-white text-base font-medium" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-gray-400 text-sm" numberOfLines={1}>
              {item.artists}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            drag();
          }} 
          className="p-2"
          disabled={isActive}
        >
          <Bars3Icon size={24} color="#888888" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <ArrowLeftIcon size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Queue</Text>
        <View className="w-8" />
      </View>

      <DraggableFlatList
        data={queue}
        onDragEnd={({ data }) => reorderQueue(data)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        // --- Add padding to the bottom of the list ---
        contentContainerStyle={{ paddingBottom: currentTrack ? 180 : 80 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-400 text-lg">Queue is empty</Text>
          </View>
        }
      />
    </View>
  );
};

export default QueueScreen;