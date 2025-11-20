import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { useAuth } from './AuthContext';
import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, deleteDoc, collection, onSnapshot, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTracklist, setCurrentTracklist] = useState([]);
  const [currentAlbumContext, setCurrentAlbumContext] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [isChangingTrack, setIsChangingTrack] = useState(false);
  
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [libraryIds, setLibraryIds] = useState([]);
  
  const soundRef = useRef(new Audio.Sound());
  const { user } = useAuth();

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    
    soundRef.current.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

    return () => {
      soundRef.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (user) {
      const favCol = collection(db, 'users', user.uid, 'favorites');
      const unsubFavs = onSnapshot(favCol, (snapshot) => {
        setFavoriteIds(snapshot.docs.map(doc => doc.id));
      });

      const libCol = collection(db, 'users', user.uid, 'libraryTracks');
      const unsubLib = onSnapshot(libCol, (snapshot) => {
        setLibraryIds(snapshot.docs.map(doc => doc.id));
      });
      
      return () => {
        unsubFavs();
        unsubLib();
      };
    } else {
      // --- FIX: User logged out, stop and clear the player ---
      if (soundRef.current) {
        soundRef.current.unloadAsync(); // Stop and unload the sound
      }
      setCurrentTrack(null);
      setQueue([]);
      setCurrentTracklist([]);
      setCurrentAlbumContext(null);
      setIsPlaying(false);
      setPlaybackStatus(null);
      // --- End of fix ---

      setFavoriteIds([]);
      setLibraryIds([]);
    }
  }, [user]);

  const onPlaybackStatusUpdate = (status) => {
    setPlaybackStatus(status);
  };

  const saveToHistory = async (track) => {
    if (!user || !track) return;
    try {
      const historyRef = doc(db, 'users', user.uid, 'history', track.id.toString());
      await setDoc(historyRef, {
        ...track,
        lastHeardAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to save to history", e);
    }
  };

  const playSound = useCallback(async (track, tracklist = [], albumInfo = null) => {
    if (!track || isChangingTrack) return;
    setIsChangingTrack(true);
    
    try {
      await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      
      setCurrentTrack(track);

      if (tracklist.length > 0) {
        setCurrentTracklist(tracklist);
      } else {
        setCurrentTracklist([]);
      }

      if (albumInfo) {
        setCurrentAlbumContext(albumInfo);
      } else if (track.albumPageUrl && track.lang) {
        setCurrentAlbumContext({ path: track.albumPageUrl, lang: track.lang });
      } else {
        setCurrentAlbumContext(null);
      }
      
      setIsPlaying(true);
      saveToHistory(track);
    } catch (e) {
      console.error('Failed to load sound', e);
      Toast.show({
        type: 'error',
        text1: 'Error Playing Song',
        text2: e.message,
      });
    } finally {
      setIsChangingTrack(false);
    }
  }, [isChangingTrack, user]);

  const playPause = useCallback(async () => {
    if (!currentTrack || isChangingTrack) return;
    try {
      if (playbackStatus?.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error('Play/pause error', e);
    }
  }, [currentTrack, isChangingTrack, playbackStatus]);

  const seek = useCallback(async (millis) => {
    if (!currentTrack || isChangingTrack) return;
    try {
      await soundRef.current.setPositionAsync(millis);
    } catch (e) {
      console.error('Seek error', e);
    }
  }, [currentTrack, isChangingTrack]);

  const playNext = useCallback((songDidFinish = false) => {
    if (isChangingTrack) return;

    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(prevQueue => prevQueue.slice(1));
      playSound(nextTrack, [], { path: nextTrack.albumPageUrl, lang: nextTrack.lang });
      return;
    }

    if (currentTracklist.length > 0 && currentTrack) {
      const currentIndex = currentTracklist.findIndex(t => t.id === currentTrack.id);
      const nextIndex = currentIndex + 1;

      if (nextIndex < currentTracklist.length) {
        const nextTrack = currentTracklist[nextIndex];
        playSound(nextTrack, currentTracklist, { path: nextTrack.albumPageUrl, lang: nextTrack.lang });
      } else if (songDidFinish) {
        setIsPlaying(false);
        setCurrentTrack(null);
        setCurrentTracklist([]);
        setCurrentAlbumContext(null);
      }
    }
  }, [isChangingTrack, queue, currentTrack, currentTracklist, playSound]);

  const playPrevious = useCallback(() => {
    if (isChangingTrack || !currentTrack) return;

    if (currentTracklist.length > 0) {
      const currentIndex = currentTracklist.findIndex(t => t.id === currentTrack.id);
      const prevIndex = currentIndex - 1;
      
      if (prevIndex >= 0) {
        const prevTrack = currentTracklist[prevIndex];
        playSound(prevTrack, currentTracklist, { path: prevTrack.albumPageUrl, lang: prevTrack.lang });
      }
    }
  }, [isChangingTrack, currentTrack, currentTracklist, playSound]);

  useEffect(() => {
    if (playbackStatus?.didJustFinish) {
      playNext(true); 
    }
  }, [playbackStatus, playNext]);

  const addToQueue = (track) => {
    setQueue(prevQueue => {
      const trackExists = prevQueue.find(item => item.id === track.id);
      if (trackExists) {
        Toast.show({
          type: 'info',
          text1: 'Already in Queue',
          text2: track.title,
        });
        return prevQueue;
      }
      Toast.show({
        type: 'success',
        text1: 'Added to Queue',
        text2: track.title,
      });
      return [...prevQueue, track];
    });
  };

  const addAllToQueue = (tracksToAdd) => {
    setQueue(prevQueue => {
      const newTracks = tracksToAdd.filter(track => 
        !prevQueue.find(item => item.id === track.id)
      );
      
      if (newTracks.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'All songs already in queue',
        });
        return prevQueue;
      }

      Toast.show({
        type: 'success',
        text1: `Added ${newTracks.length} songs to queue`,
      });
      return [...prevQueue, ...newTracks];
    });
  };
  
  const addToFavorites = async (track) => {
    if (!user || !track) return;
    const trackIdStr = track.id.toString();
    
    const favRef = doc(db, 'users', user.uid, 'favorites', trackIdStr);
    await setDoc(favRef, track);
    
    const orderRef = doc(db, 'users', user.uid, 'favoritesOrder', 'main');
    await setDoc(orderRef, {
      songOrder: arrayUnion(trackIdStr)
    }, { merge: true });
    
    Toast.show({
      type: 'success',
      text1: 'Added to Liked Songs',
      text2: track.title,
    });
  };
  
  const removeFromFavorites = async (trackId) => {
    if (!user || !trackId) return;
    const trackIdStr = trackId.toString();
    
    const favRef = doc(db, 'users', user.uid, 'favorites', trackIdStr);
    await deleteDoc(favRef);
    
    const orderRef = doc(db, 'users', user.uid, 'favoritesOrder', 'main');
    await setDoc(orderRef, {
      songOrder: arrayRemove(trackIdStr)
    }, { merge: true });
    
    Toast.show({
      type: 'info',
      text1: 'Removed from Liked Songs',
    });
  };

  const saveToLibrary = async (track) => {
    if (!user || !track) return;
    const trackIdStr = track.id.toString();
    
    const trackRef = doc(db, 'users', user.uid, 'libraryTracks', trackIdStr);
    await setDoc(trackRef, track);
    
    const orderRef = doc(db, 'users', user.uid, 'libraryOrder', 'main');
    await setDoc(orderRef, {
      songOrder: arrayUnion(trackIdStr)
    }, { merge: true });

    Toast.show({
      type: 'success',
      text1: 'Saved to Library',
      text2: track.title,
    });
  };

  const removeFromLibrary = async (trackId) => {
    if (!user || !trackId) return;
    const trackIdStr = trackId.toString();
    
    const trackRef = doc(db, 'users', user.uid, 'libraryTracks', trackIdStr);
    await deleteDoc(trackRef);
    
    const orderRef = doc(db, 'users', user.uid, 'libraryOrder', 'main');
    await setDoc(orderRef, {
      songOrder: arrayRemove(trackIdStr)
    }, { merge: true });

    Toast.show({
      type: 'info',
      text1: 'Removed from Library',
    });
  };

  const checkIfFavorite = (trackId) => {
    return favoriteIds.includes(trackId.toString());
  };

  const checkIfInLibrary = (trackId) => {
    return libraryIds.includes(trackId.toString());
  };

  const removeFromQueue = (trackId) => {
    setQueue(prevQueue => prevQueue.filter(track => track.id !== trackId));
  };

  const reorderQueue = (data) => {
    setQueue(data);
  };

  return (
    <PlayerContext.Provider
      value={{
        queue,
        addToQueue,
        addAllToQueue,
        removeFromQueue,
        reorderQueue,
        currentTrack,
        currentAlbumContext,
        isPlaying,
        playbackStatus,
        isChangingTrack,
        playSound,
        playPause,
        seek,
        playNext,
        playPrevious,
        addToFavorites,
        removeFromFavorites,
        checkIfFavorite,
        saveToLibrary,
        removeFromLibrary,
        checkIfInLibrary,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};