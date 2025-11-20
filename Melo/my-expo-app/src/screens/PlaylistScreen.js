import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftIcon, Bars3Icon, PlayIcon, SquaresPlusIcon,QueueListIcon,  XMarkIcon } from 'react-native-heroicons/outline';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { usePlayer } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { doc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';
import PlaylistTrackListItem from '../components/PlaylistTrackListItem';




const PlaylistScreen = ({ route, navigation }) => {
  const { type } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const { playSound, addToQueue, addAllToQueue, removeFromFavorites, removeFromLibrary } = usePlayer();
  
  const [tracks, setTracks] = useState([]);
  const [tracksMap, setTracksMap] = useState(null);
  const [songOrder, setSongOrder] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const isFavorites = type === 'favorites';
  const title = isFavorites ? 'Liked Songs' : 'Saved Songs';
  const tracksCollectionName = isFavorites ? 'favorites' : 'libraryTracks';
  const orderDocName = isFavorites ? 'favoritesOrder' : 'libraryOrder';

  useEffect(() => {
    if (!user) return;

    const tracksCol = collection(db, 'users', user.uid, tracksCollectionName);
    const unsubTracks = onSnapshot(tracksCol, (snapshot) => {
      const newTracksMap = new Map();
      snapshot.docs.forEach(doc => {
        newTracksMap.set(doc.id, doc.data());
      });
      setTracksMap(newTracksMap);
    });

    const orderRef = doc(db, 'users', user.uid, orderDocName, 'main');
    const unsubOrder = onSnapshot(orderRef, (doc) => {
      if (doc.exists()) {
        const orderData = doc.data();
        setSongOrder(orderData?.songOrder || []);
      } else {
        setSongOrder([]);
      }
    });

    return () => {
      unsubTracks();
      unsubOrder();
    };
  }, [user, type]);

  useEffect(() => {
    if (songOrder && tracksMap) {
      if (songOrder.length > 0 && tracksMap.size > 0) {
        const orderedTracks = songOrder
          .map(id => tracksMap.get(id))
          .filter(Boolean);
        setTracks(orderedTracks);
      } else {
        setTracks([]);
      }
    }
  }, [songOrder, tracksMap]);

  const handlePlayTrack = (track) => {
    playSound(track, tracks, null);
  };

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    addAllToQueue(tracks);
  };

  const onDragEnd = async ({ data }) => {
    setTracks(data);
    const newSongOrder = data.map(track => track.id.toString());
    const orderRef = doc(db, 'users', user.uid, orderDocName, 'main');
    await updateDoc(orderRef, { songOrder: newSongOrder });
  };

  const handleOptionsPress = (track) => {
    setSelectedTrack(track);
    setModalVisible(true);
  };

  const handleRemove = () => {
    if (!selectedTrack) return;
    if (isFavorites) {
      removeFromFavorites(selectedTrack.id);
    } else {
      removeFromLibrary(selectedTrack.id);
    }
    setModalVisible(false);
  };

  const handleAddToQueue = () => {
    if (!selectedTrack) return;
    addToQueue(selectedTrack);
    setModalVisible(false);
  };

  const renderItem = useCallback(({ item, drag, isActive }) => {
    return (
      <PlaylistTrackListItem
        track={item}
        onTrackPress={handlePlayTrack}
        onOptionsPress={handleOptionsPress}
        drag={drag}
        isActive={isActive}
      />
    );
  }, [handlePlayTrack, handleOptionsPress]);

  const isLoading = tracksMap === null || songOrder === null;

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => navigation.navigate('LibraryHome')} className="p-1">
          <ArrowLeftIcon size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">{title}</Text>
        <TouchableOpacity onPress={handlePlayAll} className="p-1">
          <SquaresPlusIcon size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#DC2626" className="mt-10" />
      ) : (
        <DraggableFlatList
          data={tracks}
          onDragEnd={onDragEnd}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
               <Text className="text-gray-500 text-sm">Melo...</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 180, paddingHorizontal: 16 }}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
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
              <TouchableOpacity onPress={handleRemove} className="flex-row items-center p-4">
                <XMarkIcon size={28} color="white" />
                <Text className="text-white text-lg ml-4">Remove from {title}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default PlaylistScreen;