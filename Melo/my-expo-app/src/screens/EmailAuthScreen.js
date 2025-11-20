import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useNavigation, useRoute } from '@react-navigation/native';

const EmailAuthScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { type } = route.params; // 'login' or 'signup'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = type === 'login';
  const title = isLogin ? 'Log In' : 'Sign Up';
  const buttonText = isLogin ? 'Log In' : 'Sign Up';
  const slogan = isLogin ? 'To continue to Melo' : 'Create your Melo account';

  const handleAuth = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      Alert.alert(`${title} Failed`, error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-center p-6">
        <Text className="text-white text-3xl font-bold text-center mb-4">
          {title}
        </Text>
        <Text className="text-gray-400 text-lg text-center mb-10">
          {slogan}
        </Text>
        
        <TextInput
          className="bg-gray-800 text-white p-4 rounded-lg text-lg mb-4"
          placeholder="Email address"
          placeholderTextColor="#777"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          className="bg-gray-800 text-white p-4 rounded-lg text-lg mb-6"
          placeholder="Password"
          placeholderTextColor="#777"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          className="bg-red-600 p-4 rounded-full "
          onPress={handleAuth}
          disabled={loading}
        >
          <Text className="text-white text-lg font-bold text-center">
            {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : buttonText}
          </Text>
        </TouchableOpacity>

        {isLogin && (
          <TouchableOpacity
            className="mt-6"
            onPress={() => Alert.alert('Forgot Password', 'Not implemented yet!')} // Placeholder
          >
            <Text className="text-gray-400 text-base text-center font-bold">Forgot your password?</Text>
          </TouchableOpacity>
        )}

        <View className="absolute bottom-6 left-0 right-0 p-6 flex-row justify-center items-center">
          <Text className="text-gray-400 text-base text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EmailAuth', { type: isLogin ? 'signup' : 'login' })}
          >
            <Text className="text-red-500 font-bold text-base ">
              {isLogin ? 'Sign up' : 'Log in'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EmailAuthScreen;
