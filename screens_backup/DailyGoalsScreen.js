import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Button,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { Picker } from '@react-native-picker/picker';

function generateHourOptions() {
  const options = [{ label: 'Nie dodawaj', value: '' }];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, '0');
      const min = m.toString().padStart(2, '0');
      options.push({ label: `${hour}:${min}`, value: `${hour}:${min}` });
    }
  }
  return options;
}
const hourOptions = generateHourOptions();

export default function DailyGoalsScreen() {
  const [goals, setGoals] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [selectedHour, setSelectedHour] = useState(hourOptions[0].value);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedGoalId, setEditedGoalId] = useState(null);
  const [editedDeadline, setEditedDeadline] = useState(hourOptions[0].value);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (id) {
        setUserId(Number(id));
        fetchGoals(Number(id));
      }
    };
    init();
  }, []);

  const fetchGoals = async (id) => {
    try {
      const res = await fetch(`${API_URL}/get-daily-goals?user_id=${id}&date=${today}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const parsed = data.map(goal => ({
          id: goal.id.toString(),
          text: goal.content,
          completed: Boolean(goal.is_done),
          deadlineHour: goal.deadline_hour,
        }));
        setGoals(parsed);
      }
    } catch (err) {
      console.error('Błąd pobierania celów:', err);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    try {
      const res = await fetch(`${API_URL}/add-daily-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          date: today,
          content: newGoal,
          deadline_hour: selectedHour, // pusty string jeśli „Nie dodawaj”
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGoals([
          ...goals,
          {
            id: data.goal_id.toString(),
            text: newGoal,
            completed: false,
            deadlineHour: selectedHour,
          }
        ]);
        setShowModal(false);
        setNewGoal('');
        setSelectedHour(hourOptions[0].value);
      }
    } catch (err) {
      console.error('Błąd dodawania celu:', err);
    }
  };

  const toggleGoal = async (id, completed) => {
    try {
      const endpoint = completed ? 'uncomplete-daily-goal' : 'complete-daily-goal';
      await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          goal_id: Number(id)
        })
      });
      setGoals(goals.map(goal =>
        goal.id === id ? { ...goal, completed: !completed } : goal
      ));
    } catch (err) {
      console.error('Błąd zmiany statusu celu:', err);
    }
  };

  const deleteGoal = async (id) => {
    try {
      await fetch(`${API_URL}/delete-daily-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          goal_id: Number(id),
        })
      });
      setGoals(goals.filter(goal => goal.id !== id));
    } catch (err) {
      console.error('Błąd usuwania celu:', err);
    }
  };

  const openEditModal = (goalId, currentDeadline) => {
    setEditedGoalId(goalId);
    setEditedDeadline(currentDeadline ?? hourOptions[0].value);
    setEditModalVisible(true);
  };

  const saveDeadline = async () => {
    try {
      await fetch(`${API_URL}/set-or-change-deadline-hour-for-daily-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          goal_id: Number(editedGoalId),
          deadline_hour: editedDeadline, // pusty string jeśli „Nie dodawaj”
        }),
      });
      setGoals(goals.map(goal =>
        goal.id === editedGoalId
          ? { ...goal, deadlineHour: editedDeadline }
          : goal
      ));
    } catch (err) {
      console.error('Błąd zmiany deadline:', err);
    }
    setEditModalVisible(false);
    setEditedGoalId(null);
    setEditedDeadline(hourOptions[0].value);
  };

  const renderRightActions = (id) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteGoal(id)}>
      <Text style={styles.deleteText}>Usuń</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Twoje cele na dziś</Text>
        <Text style={styles.subtitle}>Naciśnij, aby oznaczyć cel jako ukończony</Text>

        <FlatList
          data={goals}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item.id)}>
              <View style={styles.goalRow}>
                <TouchableOpacity
                  style={styles.goal}
                  onPress={() => toggleGoal(item.id, item.completed)}
                >
                  <Text style={item.completed ? styles.completedText : styles.goalText}>
                    {item.completed ? '✔ ' : ''}{item.text}
                    {/* Pokazuj deadline tylko jeśli nie jest pusty */}
                    {item.deadlineHour ? ` (do ${item.deadlineHour})` : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(item.id, item.deadlineHour)}
                >
                  <Text style={styles.editText}>Edytuj deadline</Text>
                </TouchableOpacity>
              </View>
            </Swipeable>
          )}
        />
      </View>
      {/* Dodaj cel - floating button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal do dodawania celu */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Nowy cel</Text>
            <TextInput
              style={styles.input}
              value={newGoal}
              onChangeText={setNewGoal}
              placeholder="Nazwa celu"
              autoFocus
            />
            <Text style={{ marginVertical: 8 }}>Wybierz godzinę zakończenia:</Text>
            <View style={Platform.OS === 'ios' ? {} : { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }}>
              <Picker
                selectedValue={selectedHour}
                onValueChange={setSelectedHour}
                style={Platform.OS === 'ios' ? { height: 150, width: '100%' } : { height: 40 }}
                itemStyle={Platform.OS === 'ios' ? { height: 40 } : {}}
              >
                {hourOptions.map(opt => (
                  <Picker.Item label={opt.label} value={opt.value} key={opt.value} />
                ))}
              </Picker>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <Button title="Anuluj" onPress={() => setShowModal(false)} />
              <Button title="Dodaj" onPress={addGoal} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal do edycji deadline */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Zmień deadline</Text>
            <View style={Platform.OS === 'ios' ? {} : { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }}>
              <Picker
                selectedValue={editedDeadline}
                onValueChange={setEditedDeadline}
                style={Platform.OS === 'ios' ? { height: 150, width: '100%' } : { height: 40 }}
                itemStyle={Platform.OS === 'ios' ? { height: 40 } : {}}
              >
                {hourOptions.map(opt => (
                  <Picker.Item label={opt.label} value={opt.value} key={opt.value} />
                ))}
              </Picker>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <Button title="Anuluj" onPress={() => setEditModalVisible(false)} />
              <Button title="Zapisz" onPress={saveDeadline} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10, paddingBottom: 80 },
  title: { fontSize: 24, marginBottom: 10 },
  subtitle: { fontSize: 14, color: 'gray', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  goal: {
    flex: 1,
    padding: 8,
  },
  goalText: { fontSize: 16 },
  completedText: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  editButton: {
    backgroundColor: '#E0E7EF',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginLeft: 10,
  },
  editText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: 'bold',
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
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#2563EB',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30,30,30,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 320,
    padding: 25,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 5,
  },
});