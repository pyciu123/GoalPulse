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
  const options = [{ label: "Nie dodawaj", value: "" }];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, '0');
      const min = m.toString().padStart(2, '0');
      options.push({ label: `${hour}:${min}`, value: `${hour}:${min}` });
    }
  }
  return options;
}

export default function WeeklyGoalsScreen() {
  const [goals, setGoals] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedGoalId, setEditedGoalId] = useState(null);
  const [editedDate, setEditedDate] = useState('');
  const [editedHour, setEditedHour] = useState('');

  // Generowanie listy dat do niedzieli + "Nie dodawaj"
  function getDateOptions() {
    const options = [{ label: "Nie dodawaj", value: "" }];
    const today = new Date();
    const thisSunday = new Date(today);
    thisSunday.setDate(today.getDate() + (7 - today.getDay()));
    let d = new Date(today);
    while (d <= thisSunday) {
      const ds = d.toISOString().split('T')[0];
      options.push({ label: ds, value: ds });
      d.setDate(d.getDate() + 1);
    }
    return options;
  }
  const hourOptions = generateHourOptions();
  const dateOptions = getDateOptions();

  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (id) {
        setUserId(Number(id));
        fetchGoals(Number(id));
      }
    };
    init();
    setSelectedDate('');
    setSelectedHour('');
  }, []);

  const fetchGoals = async (id) => {
    try {
      const res = await fetch(`${API_URL}/get-weekly-goals?user_id=${id}&date=${new Date().toISOString().split('T')[0]}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const parsed = data.map(goal => ({
          id: goal.id.toString(),
          text: goal.content,
          completed: Boolean(goal.is_done),
          deadlineDate: goal.deadline_date ? goal.deadline_date : "",
        }));
        setGoals(parsed);
      }
    } catch (err) {
      console.error('Błąd pobierania celów:', err);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    let deadline_date = '';
    if (selectedDate && selectedHour)
      deadline_date = `${selectedDate} ${selectedHour}`;
    else if (selectedDate)
      deadline_date = selectedDate;
    else if (selectedHour)
      deadline_date = selectedHour; // (nie powinno się zdarzyć, ale zabezpieczenie)
    try {
      const res = await fetch(`${API_URL}/add-weekly-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          content: newGoal,
          deadline_hour: deadline_date,
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
            deadlineDate: deadline_date,
          }
        ]);
        setShowModal(false);
        setNewGoal('');
        setSelectedDate('');
        setSelectedHour('');
      }
    } catch (err) {
      console.error('Błąd dodawania celu:', err);
    }
  };

  const toggleGoal = async (id, completed) => {
    try {
      const endpoint = completed ? 'uncomplete-weekly-goal' : 'complete-weekly-goal';
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
      await fetch(`${API_URL}/delete-weekly-goal`, {
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

  // Edycja deadline (data+godzina)
  const openEditModal = (goalId, currentDeadline) => {
    let datePart = '';
    let hourPart = '';
    if (currentDeadline && currentDeadline.length >= 16) {
      datePart = currentDeadline.slice(0, 10);
      hourPart = currentDeadline.slice(11, 16);
    }
    setEditedGoalId(goalId);
    setEditedDate(datePart);
    setEditedHour(hourPart);
    setEditModalVisible(true);
  };
  const saveDeadline = async () => {
    let deadline_date = '';
    if (editedDate && editedHour)
      deadline_date = `${editedDate} ${editedHour}`;
    else if (editedDate)
      deadline_date = editedDate;
    else if (editedHour)
      deadline_date = editedHour;
    try {
      await fetch(`${API_URL}/set-or-change-deadline-hour-for-weekly-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          goal_id: Number(editedGoalId),
          deadline_hour: deadline_date
        }),
      });
      setGoals(goals.map(goal =>
        goal.id === editedGoalId
          ? { ...goal, deadlineDate: deadline_date }
          : goal
      ));
    } catch (err) {
      console.error('Błąd zmiany deadline:', err);
    }
    setEditModalVisible(false);
    setEditedGoalId(null);
    setEditedDate('');
    setEditedHour('');
  };

  const renderRightActions = (id) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteGoal(id)}>
      <Text style={styles.deleteText}>Usuń</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Cele tygodniowe</Text>
        <Text style={styles.subtitle}>Możesz edytować deadline tylko do niedzieli tego tygodnia</Text>
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
                    {item.deadlineDate ? ` (do ${item.deadlineDate})` : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(item.id, item.deadlineDate)}
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
            <Text style={{ fontSize: 18, marginBottom: 16 }}>Nowy cel tygodniowy</Text>
            <TextInput
              style={styles.input}
              value={newGoal}
              onChangeText={setNewGoal}
              placeholder="Nazwa celu"
              autoFocus
            />
            <View style={{ marginTop: 10, marginBottom: 8 }}>
              <Text style={{ marginBottom: 8 }}>Wybierz datę do niedzieli:</Text>
              <Picker
                selectedValue={selectedDate}
                onValueChange={setSelectedDate}
                style={Platform.OS === 'ios' ? { height: 100, width: '100%' } : { height: 40 }}
              >
                {dateOptions.map(opt => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>
            <View style={{ marginTop: 18, marginBottom: 8 }}>
              <Text style={{ marginBottom: 8 }}>Wybierz godzinę:</Text>
              <Picker
                selectedValue={selectedHour}
                onValueChange={setSelectedHour}
                style={Platform.OS === 'ios' ? { height: 100, width: '100%' } : { height: 40 }}
                itemStyle={Platform.OS === 'ios' ? { height: 40 } : {}}
              >
                {hourOptions.map(opt => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
              <Button title="Anuluj" onPress={() => setShowModal(false)} />
              <Button title="Dodaj" onPress={addGoal} disabled={!newGoal.trim()} />
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
            <Picker
              selectedValue={editedDate}
              onValueChange={setEditedDate}
              style={Platform.OS === 'ios' ? { height: 90, width: '100%' } : { height: 40 }}
            >
              {dateOptions.map(opt => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
            <View style={{ height: 20 }} />
            <Picker
              selectedValue={editedHour}
              onValueChange={setEditedHour}
              style={Platform.OS === 'ios' ? { height: 100, width: '100%' } : { height: 40 }}
              itemStyle={Platform.OS === 'ios' ? { height: 40 } : {}}
            >
              {hourOptions.map(opt => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
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
    minHeight: 450,
    padding: 25,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 5,
    justifyContent: 'center',
  },
});