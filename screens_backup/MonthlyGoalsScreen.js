import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export default function DailyGoalsScreen() {
  const [goals, setGoals] = useState([
    { id: '1', text: 'Zrób trening', completed: false },
    { id: '2', text: 'Przeczytaj 10 stron', completed: false },
  ]);
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (newGoal.trim() === '') return;
    const newItem = {
      id: Date.now().toString(),
      text: newGoal.trim(),
      completed: false,
    };
    setGoals([...goals, newItem]);
    setNewGoal('');
  };

  const toggleGoal = (id) => {
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const renderRightActions = (id) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteGoal(id)}>
      <Text style={styles.deleteText}>Usuń</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoje cele na ten miesiąc</Text>
      <Text style={styles.subtitle}>Naciśnij, aby oznaczyć cel jako ukończony</Text>

      <TextInput
        placeholder="Wpisz nowy cel"
        style={styles.input}
        value={newGoal}
        onChangeText={setNewGoal}
      />
      <Button title="Dodaj cel" onPress={addGoal} />

      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <TouchableOpacity onPress={() => toggleGoal(item.id)} style={styles.goal}>
              <Text style={item.completed ? styles.completedText : styles.goalText}>
                {item.completed ? '✔ ' : ''}{item.text}
              </Text>
            </TouchableOpacity>
          </Swipeable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  subtitle: { fontSize: 14, color: 'gray', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  goal: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  goalText: { fontSize: 16 },
  completedText: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});