import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { EllipsisVerticalIcon, QueueListIcon } from 'react-native-heroicons/outline';
import { Swipeable } from 'react-native-gesture-handler';
import { usePlayer } from '../context/PlayerContext';

const TrackListItem = ({ track, onTrackPress, onOptionsPress }) => {
  const { addToQueue, isChangingTrack } = usePlayer();
  const swipeableRef = useRef(null);

  const handleAddToQueue = () => {
    addToQueue(track);
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
  };
  
  const handlePlayPress = () => {
    if (isChangingTrack) return;
    onTrackPress(track);
  };

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={{ width: 80, transform: [{ translateX: trans }] }} className="flex-1">
        <TouchableOpacity
          onPress={handleAddToQueue}
          className="bg-green-600 flex-1 items-center justify-center"
        >
          <QueueListIcon size={28} color="white" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const imageSource = track.imageUrl 
    ? { uri: track.imageUrl } 
    : require('../../assets/single-white.png');

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      containerStyle={{ marginBottom: 16 }}
      onSwipeableOpen={handleAddToQueue}
    >
      <View className="flex-row items-center justify-between w-full bg-transparent">
        <TouchableOpacity onPress={handlePlayPress} className="flex-1 flex-row items-center pr-4" disabled={isChangingTrack}>
          <Image
            source={imageSource}
            className="w-12 h-12 rounded-md bg-gray-800"
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
      </View>
    </Swipeable>
  );
};

export default TrackListItem;