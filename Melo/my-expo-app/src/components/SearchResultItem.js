import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowUpLeftIcon } from 'react-native-heroicons/outline';

const getMusicDirector = (details) => {
  if (!details || details === "Not Available") {
    return null;
  }
  let match = details.match(/Music:\s*(.*?)\s*Director:/);
  if (match && match[1]) return match[1].trim();
  match = details.match(/Music:\s*(.*)/);
  if (match && match[1]) return match[1].trim();
  return details.replace('Music:', '').trim();
};

const SearchResultItem = ({ item }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('Home', { 
      screen: 'AlbumDetails',
      params: {
        albumUrl: item.pageUrl, 
        lang: item.lang 
      }
    });
  };

  const musicDirector = getMusicDirector(item.details);
  const langTag = item.lang.toUpperCase();

  return (
    <TouchableOpacity onPress={handlePress} className="flex-row items-center w-full mb-4">
      <Image
        source={{ uri: item.imageUrl || 'https://placehold.co/128x128/121212/888888?text=Melo' }}
        className="w-14 h-14 rounded-lg"
      />
      <View className="flex-1 ml-3">
        <Text className="text-white text-base font-medium" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-gray-400 text-sm" numberOfLines={1}>
          <Text className="text-xs text-red-500 font-bold">{langTag}</Text> • {musicDirector || 'Album'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SearchResultItem;