import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export default function WelcomeScreen({ navigation }) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState('login'); // 'login' lub 'register'

  const fetchAllUsers = async () => {
    const res = await fetch(`${API_URL}/get-all-users`);
    return await res.json();
  };

  const handleLogin = async () => {
    if (!name.trim()) return;
    try {
      const users = await fetchAllUsers();
      const user = users.find(u => u.user_name === name);

      if (!user) {
        Alert.alert('Błąd logowania', 'Taki użytkownik nie istnieje');
        return;
      }

      await AsyncStorage.setItem('userName', user.user_name);
      await AsyncStorage.setItem('user_id', String(user.user_id));
      navigation.replace('Home');
    } catch (err) {
      console.error('Błąd logowania:', err);
      Alert.alert('Błąd', 'Wystąpił problem podczas logowania.');
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) return;
    try {
      const users = await fetchAllUsers();
      const exists = users.find(u => u.user_name === name);

      if (exists) {
        Alert.alert('Rejestracja nieudana', 'Ten nick jest już zajęty');
        return;
      }

      await fetch(`${API_URL}/add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      Alert.alert('Rejestracja zakończona', 'Konto zostało utworzone. Możesz się teraz zalogować.');
      setMode('login');
    } catch (err) {
      console.error('Błąd rejestracji:', err);
      Alert.alert('Błąd', 'Wystąpił problem podczas rejestracji.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Witaj w GoalPulse!</Text>
      <TextInput
        style={styles.input}
        placeholder="Twój nick"
        value={name}
        onChangeText={setName}
      />
      <Button
        title={mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
        onPress={mode === 'login' ? handleLogin : handleRegister}
      />
      <Text style={styles.toggleText}>
        {mode === 'login' ? 'Nie masz konta?' : 'Masz już konto?'}
      </Text>
      <Button
        title={mode === 'login' ? 'Przejdź do rejestracji' : 'Przejdź do logowania'}
        onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
        color="#6B7280"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, gap: 20 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  toggleText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
  },
});