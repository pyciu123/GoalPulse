import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
	View, 
	Text, 
	StyleSheet, 
	Button, 
	TouchableOpacity, 
	Platform, 
	Alert, 
	Modal, 
	TextInput,
	FlatList
} from "react-native";
import { ScrollView, Swipeable } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "../config";

export default function DailyGoals ({navigation}) {
	const [userId, setUserId] = useState('');
	const [goals, setGoals] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [newGoal, setNewGoal] = useState('');
	const [selectedHour, setSelectedHour] = useState('');
	const [goalError, setGoalError] = useState('');
	const [wasTriedAdd, setWasTriedAdd] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());

	const today = new Date().toISOString().split('T')[0];
	const hourOptions = [{label: "Nie dodawaj", value: ""}];
	for (let h = 0; h < 24; h++) {
		for(let m = 0; m < 60; m+= 15) {
			const hour = h.toString().padStart(2, '0');
			const min = m.toString().padStart(2, '0');
			const value = `${hour}:${min}`
			hourOptions.push({label: value, value});
		}
	}
	function getDateArray(centerDate, daysBefore = 3, daysAfter = 5) {
		const arr = []
		for (let i = -daysBefore; i <= daysAfter; i++) {
			const day = new Date(today);
			day.setDate(day.getDate() + i);
			arr.push(new Date(day));
		}
		return arr;
	}
	const dateArray = getDateArray(selectedDate);

	useEffect(function(){
		AsyncStorage.getItem('userId').then(function(id) {
			if (id) {
				setUserId(id);
			}
		})
	}, []);

	async function fetchGoals(id, dateObj = selectedDate) {
		const date =
		typeof dateObj === 'string'
			? dateObj
			: dateObj.toISOString().split('T')[0];
		try {
			const res = await fetch(`${API_URL}/get-daily-goals?user_id=${id}&date=${date}`);
			const data = await res.json();
			setGoals(Array.isArray(data) ? data : []);
		} catch (err) {
			setGoals([]);
			Alert.alert("blad pobierania dziennych celow");
		}
	}

	useEffect(function (){
		if (userId)
			fetchGoals(userId, selectedDate);
	}, [userId]);

	async function addNewGoal() {
		setWasTriedAdd(true);
		if (newGoal.trim().length === 0) {
			setGoalError("Wpisz cel");
			return;
		}
		setGoalError('');
		setWasTriedAdd(false);
		try {
			const res = await fetch(`${API_URL}/add-daily-goal`, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					user_id: userId,
					date: selectedDate.toISOString().split('T')[0],
					content:newGoal,
					deadline_hour: selectedHour
				}),
			});
			const data = await res.json();
			if (data.success) {
				setShowModal(false);
				setNewGoal("");
				setSelectedHour("")
				fetchGoals(userId, selectedDate);
			} else {
				Alert.alert("Nie udalo sie dodac celu")
			}
		} catch (err) {
			Alert.alert("blad przy dodawaniu celu dzienengo")
		}
	}

	async function handleDeleteGoal(itemId) {
		try {
			const res = await fetch(`${API_URL}/delete-daily-goal`, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					user_id: userId,
					goal_id: itemId,
				}),
			});
			const data = await res.json();
			if (data.success)
				fetchGoals(userId)
			else
				Alert.alert("Nie udalo sie usunac celu");
		} catch (err) {
			Alert.alert("Blad przy usuwaniu celu dziennego");
		}
	}

	async function toggleGoalDone(itemId, is_done) {
		let res;
		try {
			if (is_done) {
				res = await fetch(`${API_URL}/uncomplete-daily-goal`, {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({
						user_id: userId,
						goal_id: itemId,
					})
				})
			}
			else {
				res = await fetch(`${API_URL}/complete-daily-goal`, {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({
						user_id: userId,
						goal_id: itemId,
					})
				})
			}
			const data = await res.json();
			if (data.success)
				fetchGoals(userId);
			else
				Alert.alert("nie udalo sie zmienic statusu");
		} catch (err) {
			Alert.alert("blad przy zmianie statusu");
		}
	}

	const renderRightAction = (id) => (
		<TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteGoal(id)}>
			<Text style={styles.deleteText}>Unuń</Text>
		</TouchableOpacity>
	)

	return (
		<View style={styles.container}>
			<FlatList
			ListHeaderComponent={() => (
				<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateBar}>
				{dateArray.map(date => {
				const isActive = date.toDateString() === selectedDate.toDateString();
				const isToday = date.toDateString() === new Date().toDateString();
 				return (
				<TouchableOpacity
					key={date.toISOString()}
					style={[styles.dateButton, isActive && styles.activeDate]}
					onPress={() => {
						setSelectedDate(date);
						fetchGoals(userId, date);
					}}
				>
					<Text style={{color: isActive ? '#fff' : '#222', width: 100, textAlign: 'center', fontSize: 16, fontWeight: isActive ? 'bold' : 'normal'}}>
					{isToday ? "dziś" : date.toLocaleDateString('pl-PL', { year: 'numeric', day: '2-digit', month: '2-digit' })}
					</Text>
				</TouchableOpacity>
				);
			})}
			</ScrollView>
			)}
			stickyHeaderIndices={[0]}
			data={goals}
			keyExtractor={item => item.id}
			renderItem={({ item }) => (
				<Swipeable renderRightActions={() => renderRightAction(item.id)} overshootRight={false}>
					<TouchableOpacity
						style={styles.goalRow}
						onPress={() => toggleGoalDone(item.id, item.is_done)}	
						activeOpacity={0.7}
						>
						<View style={styles.goalRow}>
							<Text
								style={{
								fontSize: 16,
								color: item.is_done ? "#aaa" : "#222",
								textDecorationLine: item.is_done ? "line-through" : "none",
								}}
							>
								{item.content}
								{item.deadline_hour && <Text> (deadline: {item.deadline_hour.slice(0,5)})</Text>}
							</Text>
						</View>
					</TouchableOpacity>
				</Swipeable>
			)}
			ListEmptyComponent={<Text style={{ marginTop: 20 }}>Brak celów na dzisiaj</Text>}
			/>
			<TouchableOpacity
				style={styles.fab}
				onPress={() => {
					setGoalError('');
					setShowModal(true);
					setWasTriedAdd(false)
				}}
				activeOpacity={0.8}
			>
				<Modal
					visible={showModal}
					animationType="slide"
					transparent
					onRequestClose={() => setShowModal(false)}
				>
					<View style={styles.addGoalModal}>
						<View style={styles.addGoalModalText}>
							<Text>Dodaj nowy cel</Text>
							{wasTriedAdd && newGoal.trim().length === 0 && (<Text style={{color: 'red'}}>Wpisz cel</Text>)}
							<TextInput
								style={styles.addNewGoalInpt}
								value={newGoal}
								onChangeText={ text => {
									setNewGoal(text);
									if (goalError)
										setGoalError("");
								}}
								placeholder="Wpisz cel"
							/>
							<Picker
								selectedValue={selectedHour}
								onValueChange={setSelectedHour}
							>
								{hourOptions.map(opt => (
									<Picker.Item label={opt.label} value={opt.value} key={opt.value} />
								))}
							</Picker>
							<Button
								title="Dodaj"
								onPress={addNewGoal}
							/>
							<Button title="Zamknij" onPress={() => setShowModal(false)}/>
						</View>
					</View>
				</Modal>	
				<Text style={styles.fabText}>+</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	dateBar: {
		flexDirection: 'row',
		marginBottom: 10,
		height: 36,
	},
	dateButton: {
		backgroundColor: '#eee',
		borderRadius: 8,
		paddingVertical: 2,
		paddingHorizontal: 8,
		marginHorizontal: 2,
		height: 36,
		justifyContent: 'center',
		alignItems: 'center'
	},
	activeDate: {
		backgroundColor: '#2563EB',
	  },
	deleteButton: {
		backgroundColor: '#EF4444',
		justifyContent: 'center',
		alignItems: 'center',
		width: 80,
		height: 52,
		borderTopRightRadius: 10,
		borderBottomRightRadius: 10,
		marginLeft: -10,
	  },
	  deleteText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
		paddingRight: 4,
	  },
	goalRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		height: 52,
		borderRadius: 10,
		marginBottom: 10,
		paddingHorizontal: 12,
	  },
	addGoalModal: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.1)',
	},
	addGoalModalText: {
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 10,
	},
	addNewGoalInpt: {
		borderColor: '#ccc',
		borderWidth: 1,
		borderRadius: 8,
		padding: 8,
		marginTop: 10,
		width: 200,
	},
	goalStyle: {
		marginTop: 20,
		backgroundColor: '#fff',
		padding: 10,
		borderRadius: 6,
		width: '100%',
	},
	getBackButton: {
		position: 'absolute',
		top: Platform.OS === 'ios' ? 60 : 32,
		left: 16,
		zIndex: 10,
		backgroundColor: '#fff',
		borderRadius: 20,
		paddingVertical: 4,
		paddingHorizontal: 14,
		elevation: 2,
		shadowColor: '#000',
		shadowOpacity: 0.09,
		shadowRadius: 2,
		shadowOffset: { width: 0, height: 1 },
	},
	container: {
		flex: 1, // wypelnia ekran
		backgroundColor: '#f3f4f6',
		padding: 8,
	},
	getBackButtonRow: {
		position: 'absolute',
		top: 32,
		left: 32,
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
})