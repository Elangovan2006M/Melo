import React from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';

const AuthLandingScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-black justify-center items-center p-6">
      <View className="flex-1 justify-center items-center">
        <Image
          source={require('../../assets/single-white.png')}
          className="w-24 h-24 mb-6"
          resizeMode="contain"
        />
        <Text className="text-white text-3xl font-extrabold text-center mb-2">
          Millions of Songs
        </Text>
        <Text className="text-white text-3xl font-extrabold text-center">
          Listen on Melo
        </Text>
      </View>

      <View className="w-full mb-8">
        <TouchableOpacity
          className="bg-red-600 p-4 rounded-full mb-4"
          onPress={() => navigation.navigate('EmailAuth', { type: 'signup' })}
        >
          <Text className="text-white text-lg font-bold text-center">Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('EmailAuth', { type: 'login' })}>
          <Text className="text-white text-lg font-bold text-center">Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AuthLandingScreen;
