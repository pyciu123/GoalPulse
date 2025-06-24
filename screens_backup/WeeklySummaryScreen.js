import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WeeklySummaryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Podsumowanie tygodnia</Text>
      <Text style={styles.text}>
        Tutaj pojawi się Twoje tygodniowe podsumowanie wygenerowane przez AI na podstawie nagrań głosowych i wykonanych celów.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  text: { fontSize: 16, textAlign: 'center' },
});