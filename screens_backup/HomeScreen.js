import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [recordedURI, setRecordedURI] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (!status.granted) {
        alert('Brak uprawnień do mikrofonu');
      }

      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
    })();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Błąd nagrywania:', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedURI(uri);
      setRecording(null);
    } catch (err) {
      console.error('Błąd zatrzymania:', err);
    }
  };

  const playRecording = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordedURI });
      setSound(newSound);
      await newSound.playAsync();
    } catch (err) {
      console.error('Błąd odtwarzania:', err);
    }
  };

  // Dodaj funkcję wylogowania
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userName');
    await AsyncStorage.removeItem('user_id');
    navigation.replace('Welcome');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GoalPulse</Text>
      <Text style={styles.greeting}>Cześć, {userName} 👋</Text>

      <Button title="Daily Goals" onPress={() => navigation.navigate('DailyGoals')} />
      <Button title="Weekly Goals" onPress={() => navigation.navigate('WeeklyGoals')} />
      <Button title="Monthly Goals" onPress={() => navigation.navigate('MonthlyGoals')} />

      <View style={styles.recordingSection}>
        <Text style={styles.description}>
          Podziel się swoim dniem, a AI na koniec tygodnia przeanalizuje Twój tydzień.
        </Text>

        <Button
          title={recording ? 'Zatrzymaj nagrywanie' : 'Rozpocznij nagrywanie'}
          onPress={recording ? stopRecording : startRecording}
        />

        {recordedURI && (
          <View style={styles.spaced}>
            <Button title="Odtwórz nagranie" onPress={playRecording} />
          </View>
        )}
        <Button title="Weekly Summary" onPress={() => navigation.navigate('WeeklySummary')} />
      </View>

      <View style={{ marginTop: 30 }}>
        <Text style={{ textAlign: 'center', fontSize: 16 }}>
          Wykonano 3 z 5 celów w tym tygodniu
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 16 }}>
          Średnia dzienna realizacja: 60%
        </Text>
      </View>

      {/* Przycisk wylogowania na dole */}
      <View style={{ marginTop: 40 }}>
        <Button
          title="Wyloguj się"
          color="#EF4444"
          onPress={() =>
            Alert.alert(
              "Wylogowanie",
              "Czy na pewno chcesz się wylogować?",
              [
                { text: "Anuluj", style: "cancel" },
                { text: "Wyloguj się", style: "destructive", onPress: handleLogout }
              ]
            )
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, gap: 20 },
  title: { fontSize: 32, textAlign: 'center', marginBottom: 10 },
  greeting: { fontSize: 20, textAlign: 'center', marginBottom: 20 },
  description: {
    fontSize: 16,
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  spaced: {
    marginTop: 20,
    gap: 10,
  },
  recordingSection: {
    marginTop: 40,
  },
});