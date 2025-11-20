import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const getMusicDirector = (details) => {
  if (!details || details === "Not Available") {
    return null;
  }
  
  let match = details.match(/Music:\s*(.*?)\s*Director:/);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  match = details.match(/Music:\s*(.*)/);
  
  if (match && match[1]) {
    return match[1].trim();
  }

  return details.replace('Music:', '').trim();
};

const AlbumCard = ({ item, navigation }) => {
  
  const onItemPress = () => {
    navigation.navigate('AlbumDetails', { 
      albumUrl: item.pageUrl, 
      lang: item.lang 
    });
  };

  const musicDirector = getMusicDirector(item.details);

  return (
    <TouchableOpacity onPress={onItemPress} className="mr-4">
      <View className="w-40 h-40 rounded-lg overflow-hidden">
        <ImageBackground
          source={{ uri: item.imageUrl }}
          className="w-full h-full justify-end"
          resizeMode="cover"
        >

        </ImageBackground>
      </View>
      
      <Text className="text-white text-base font-semibold mt-2 w-40" numberOfLines={1}>
        {item.title}
      </Text>
      
      {musicDirector && (
        <Text className="text-gray-400 text-xs mt-1 w-40" numberOfLines={1}>
          {musicDirector}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default AlbumCard;