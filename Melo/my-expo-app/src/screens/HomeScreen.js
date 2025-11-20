import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHomeFeed } from '../api/meloApi';
import { useAuth } from '../context/AuthContext';
import AlbumCard from '../components/AlbumCard';
import { useNetInfo } from '@react-native-community/netinfo';
import { WifiSlashIcon, ArrowRightOnRectangleIcon } from 'react-native-heroicons/outline';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const netInfo = useNetInfo();

  const userEmailInitial = user?.email ? user.email.charAt(0).toUpperCase() : '?';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const data = await getHomeFeed();
    if (data) {
      setHomeData(data);
    } else {
      setError("Failed to load data.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    setLogoutModalVisible(false);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center mt-20">
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      );
    }

    if (error) {
      if (netInfo.isConnected === false) {
        return (
          <View className="flex-1 justify-center items-center mt-20 p-4">
            <WifiSlashIcon size={48} color="#888888" />
            <Text className="text-white text-xl font-bold mt-4">No Internet Connection</Text>
            <Text className="text-gray-400 text-base text-center mt-2">
              Please check your connection and try again.
            </Text>
            <TouchableOpacity onPress={fetchData} className="bg-red-600 px-6 py-3 rounded-full mt-6">
              <Text className="text-white font-bold">Try Again</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
         <View className="flex-1 justify-center items-center mt-20 p-4">
            <Text className="text-white text-xl font-bold mt-4">Something went wrong</Text>
            <Text className="text-gray-400 text-base text-center mt-2">
              We couldn't load this content.
            </Text>
            <TouchableOpacity onPress={fetchData} className="bg-red-600 px-6 py-3 rounded-full mt-6">
              <Text className="text-white font-bold">Try Again</Text>
            </TouchableOpacity>
          </View>
      );
    }

    return (
      <View className="px-4">
        {homeData?.tamil?.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold mb-3">Latest Tamil</Text>
            <FlatList
              horizontal
              data={homeData.tamil}
              renderItem={({ item }) => <AlbumCard item={item} navigation={navigation} />}
              keyExtractor={(item, index) => item.pageUrl + index}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {homeData?.malayalam?.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold mb-3">Latest Malayalam</Text>
            <FlatList
              horizontal
              data={homeData.malayalam}
              renderItem={({ item }) => <AlbumCard item={item} navigation={navigation} />}
              keyExtractor={(item, index) => item.pageUrl + index}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {homeData?.telugu?.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold mb-3">Latest Telugu</Text>
            <FlatList
              horizontal
              data={homeData.telugu}
              renderItem={({ item }) => <AlbumCard item={item} navigation={navigation} />}
              keyExtractor={(item, index) => item.pageUrl + index}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {homeData?.hindi?.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold mb-3">Latest Hindi</Text>
            <FlatList
              horizontal
              data={homeData.hindi}
              renderItem={({ item }) => <AlbumCard item={item} navigation={navigation} />}
              keyExtractor={(item, index) => item.pageUrl + index}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <View className="flex-row justify-between items-center px-4 pb-4">
        <TouchableOpacity onPress={() => setLogoutModalVisible(true)} className="w-10 h-10 rounded-full bg-red-600 justify-center items-center">
          <Text className="text-white text-lg font-bold">{userEmailInitial}</Text>
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-x-2">
          <Image
            source={require('../../assets/single-white.png')}
            className="w-8 h-8"
            resizeMode="contain"
          />
          <Text className="text-white text-3xl font-bold">
            Mel<Text className="text-red-600">o</Text>
          </Text>
        </View>

        <TouchableOpacity className="w-10 h-10 rounded-full justify-center items-center">
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {renderContent()}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isLogoutModalVisible}
        onRequestClose={() => {
          setLogoutModalVisible(!isLogoutModalVisible);
        }}
      >
        <Pressable 
          className="flex-1 justify-center items-center bg-black/60" 
          onPress={() => setLogoutModalVisible(false)}
        >
          <Pressable 
            className="bg-[#282828] rounded-2xl p-6 w-11/12 max-w-sm"
            onPress={() => {}}
          >
            <View className="flex-row items-center">
              <ArrowRightOnRectangleIcon size={24} color="#DC2626" />
              <Text className="text-white text-xl font-bold ml-3">Log Out</Text>
            </View>
            <Text className="text-gray-300 text-base my-4">
              Are you sure you want to log out of Melo?
            </Text>
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                onPress={() => setLogoutModalVisible(false)}
                className="px-4 py-2"
              >
                <Text className="text-white text-base font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-600 px-4 py-2 rounded-full ml-4"
              >
                <Text className="text-white text-base font-bold">Log Out</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;