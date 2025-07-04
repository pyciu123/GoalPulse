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
	FlatList,
} from "react-native";
import { ScrollView, Swipeable } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "../config";
import { assertStatusValuesInBounds } from "expo-av/build/AV";

export default function WeeklyGoals ({navigation}) {
	const [userId, setUserId] = useState('');
	const [goals, setGoals] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [newGoal, setNewGoal] = useState('');
	const [goalError, setGoalError] = useState('');
	const [wasTriedAdd, setWasTriedAdd] = useState(false);
	const [weekStartDate, setWeekStartDay] = useState(getStartOfWeek(new Date()));
	const [subgoals, setSubgoals] = useState({});
	const [expandedGoalId, setExpandedGoalId] = useState(null); 
	const [newSubgoalText, setNewSubgoalText] = useState('');
	const [subgoalDate, setSubgoalDate] = useState('');
	const [newSubgoals, setNewSubgoals] = useState({});
	const [modalGoalId, setModalGoalId] = useState(null);
	
	function updateSubgoalField(goalId, field, value) {
		setNewSubgoals(prev => ({
			...prev,
			[goalId]: {
				...prev[goalId],
				[field]: value
			}
		}));
	}

	async function fetchSubgoals(weeklyGoalId) {
		try {
			const res = await fetch(`${API_URL}/get-weekly-goal-subgoals?user_id=${userId}&goal_id=${weeklyGoalId}`);
			const data = await res.json();
			setSubgoals(prev => ({ ...prev, [weeklyGoalId]: data }));
		} catch (err) {
			console.warn("Błąd pobierania subcelów");
		}
	}

	async function addSubgoal(goalId) {
		const subgoalData = newSubgoals[goalId];
		if (!subgoalData?.text || !subgoalData?.date) {
			Alert.alert("Wpisz treść i datę subcelu");
			return;
		}
		try {
			const res = await fetch(`${API_URL}/add-daily-goal`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					user_id: userId,
					weekly_goal_id: goalId,
					content: subgoalData.text,
					date: subgoalData.date,
				}),
			});
			const data = await res.json();
			if (data.success) {
				setNewSubgoals(prev => ({ ...prev, [goalId]: { text: '', date: '' } }));
				await fetchSubgoals(goalId);
			} else {
				Alert.alert("Nie udało się dodać subcelu");
			}
		} catch (err) {
			Alert.alert("Błąd przy dodawaniu subcelu");
		}
	}

	function getDate() {
		const d = new Date();
		const today = d.toISOString().split('T')[0];
		return today;
	}

	function getStartOfWeek(date) {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1);
		return new Date(d.setDate(diff));
 	}

	function getDayList() {
		const arr = [];
		const d = new Date();
		const day = d.getDay();
		let diff = d.getDate() - day + (day === 0 ? -6 : 1);
		const monday = new Date(d.setDate(diff));
		for (let i = 0; i < 7; i++) {
			const nextDay = new Date(monday);
			nextDay.setDate(monday.getDate() + i);
			arr.push(nextDay.toISOString().split('T')[0]);
		}
		return arr;
	}
	const dayList = getDayList();

	function shiftWeeks(days) {
		const candidate = new Date(weekStartDate);
		candidate.setDate(candidate.getDate() + days);
		const monday   = getStartOfWeek(candidate);
		setWeekStartDay(monday);
		fetchGoals(userId, monday);
	}

	function getWeekRangeText(startDate) {
		const endDate = new Date(startDate);
		endDate.setDate(startDate.getDate() + 6);
		const option = {day: '2-digit', month: 'short'};
		const startText = startDate.toLocaleDateString('pl-PL', option);
		const endText = endDate.toLocaleDateString('pl-PL', option);
		return `${startText} - ${endText}`;
	}

	useEffect(function(){
		AsyncStorage.getItem('userId').then(function(id) {
			if (id) {
				setUserId(id);
			}
		})
	}, []);

	async function fetchGoals(id, dateObj = weekStartDate) {
		const date =
		typeof dateObj === 'string'
			? dateObj
			: dateObj.toISOString().split('T')[0];
		try {
			const res = await fetch(`${API_URL}/get-weekly-goals?user_id=${id}&date=${date}`);
			const data = await res.json();
			setGoals(Array.isArray(data) ? data : []);
		} catch (err) {
			setGoals([]);
			Alert.alert("blad pobierania tygodniowych celow");
		}
	}

	useEffect(function (){
		if (userId)
			fetchGoals(userId, weekStartDate);
	}, [userId, weekStartDate]);

	async function addNewGoal() {
		setWasTriedAdd(true);
		if (newGoal.trim().length === 0) {
			setGoalError("Wpisz cel");
			return;
		}
		setGoalError('');
		setWasTriedAdd(false);
		try {
			const res = await fetch(`${API_URL}/add-weekly-goal`, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					user_id: userId,
					week_start_date: getStartOfWeek(weekStartDate).toISOString().split('T')[0],
					content:newGoal,
					deadline_date: ""
				}),
			});
			const data = await res.json();
			if (data.success) {
				setShowModal(false);
				setNewGoal("");
				fetchGoals(userId, getStartOfWeek(weekStartDate));
			} else {
				Alert.alert("Nie udalo sie dodac celu")
			}
		} catch (err) {
			Alert.alert("blad przy dodawaniu celu dzienengo")
		}
	}

	async function handleDeleteGoal(itemId) {
		try {
			const res = await fetch(`${API_URL}/delete-weekly-goal`, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					user_id: userId,
					goal_id: itemId,
				}),
			});
			const data = await res.json();
			if (data.success)
				await fetchGoals(userId, getStartOfWeek(weekStartDate));
			else
				Alert.alert("Nie udalo sie usunac celu");
		} catch (err) {
			Alert.alert("Blad przy usuwaniu celu tygodniowego");
		}
	}

	async function toggleGoalDone(itemId, is_done) {
		let res;
		try {
			if (is_done) {
				res = await fetch(`${API_URL}/uncomplete-weekly-goal`, {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({
						user_id: userId,
						goal_id: itemId,
					})
				})
			}
			else {
				res = await fetch(`${API_URL}/complete-weekly-goal`, {
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
				fetchGoals(userId, getStartOfWeek(weekStartDate));
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
					<View style={styles.weekHeader}>
						<TouchableOpacity onPress={() => shiftWeeks(-7)}>
							<Text style={styles.arrow}>←</Text>
						</TouchableOpacity>
						<Text style={styles.weekText}>{getWeekRangeText(weekStartDate)}</Text>
						<TouchableOpacity onPress={() => shiftWeeks(7)}>
							<Text style={styles.arrow}>→</Text>
						</TouchableOpacity>
					</View>
				)}
				stickyHeaderIndices={[0]}
				data={goals}
				keyExtractor={item => item.id}
				renderItem={({ item }) => (
					<>
					<Swipeable renderRightActions={() => renderRightAction(item.id)} overshootRight={false}>
						<View style={styles.goalRow}>
							<TouchableOpacity
								style={{flex: 1}}
								onPress={() => toggleGoalDone(item.id, item.is_done)}
								activeOpacity={0.1}
							>
							<Text
								style={{
									fontSize: 16,
									color: item.is_done ? "#aaa" : "#222",
										textDecorationLine: item.is_done ? "line-through" : "none",
								}}
							>
								{item.is_done ? '✔ ' : ''}
								{item.content}
							</Text>
							</TouchableOpacity>
								<TouchableOpacity
									onPress={() => {
										if (expandedGoalId === item.id) {
											setExpandedGoalId(null);
										} else {
											setExpandedGoalId(item.id);
											if (!subgoals[item.id]) fetchSubgoals(item.id);
										}
									}}
								>
									<Text style={{ fontSize: 18, marginLeft: 8 }}>
										{expandedGoalId === item.id ? '▲' : '▼'}
									</Text>
								</TouchableOpacity>
						</View>
						</Swipeable>
						{expandedGoalId === item.id && (
						<View style={{ marginLeft: 16, marginTop: 8 }}>
							{subgoals[item.id]?.length > 0 ? (
								subgoals[item.id].map((sub, idx) => (
									<Text key={idx} style={{ fontSize: 14, marginBottom: 2 }}>
										• {sub.content} ({sub.date})
									</Text>
								))
							) : (
								<Text style={{ fontSize: 14, color: '#888' }}>Brak podcelów</Text>
							)}
							<View>
								<TouchableOpacity
								style={{alignItems: 'center'}}
								onPress={() => {
									setModalGoalId(item.id);
									setShowModal(true)
								}}
								>
									<Text style={{fontSize: 32}}>+</Text>
								</TouchableOpacity>
									<Modal
										visible={showModal}
										transparent
										onRequestClose={() => setShowModal(false)}
									>
										<View style={styles.addGoalModal}>
											<View style={styles.addGoalModalText}>
												<Text>Dodaj nowy podcel</Text>
												<TextInput
													style={styles.addNewGoalInpt}
													value={newSubgoals[modalGoalId]?.text || ''}
													onChangeText={text => updateSubgoalField(modalGoalId, 'text', text)}
													placeholder="wpisz podcel"
												>
												</TextInput>
												<Picker
													selectedValue={newSubgoals[modalGoalId]?.date || ''}
													onValueChange={value => updateSubgoalField(modalGoalId, 'date', value)}
												>
													{dayList.map((day, idx) => (
														<Picker.Item
															key={idx}
															label={day}
															value={day}
														/>
													))}
												</Picker>
												<Button
													title="Dodaj subcel"
													onPress={() => addSubgoal(modalGoalId)}
												>
												</Button>
												<Button
													title = "Zamknij"
													onPress = {() => setShowModal(false)}
													>
												</Button>
											</View>
										</View>
									</Modal>
							</View>
							{/* <View style={{ flexDirection: 'row', marginTop: 8 }}>
								<TextInput
									placeholder="Nowy podcel"
									value={newSubgoals[item.id]?.text || ''}
									onChangeText={text => updateSubgoalField(item.id, 'text', text)}
									style={{
										borderWidth: 1,
										borderColor: '#ccc',
										borderRadius: 6,
										padding: 6,
										flex: 1,
										marginRight: 4,
									}}
								/>
								<TextInput
									placeholder="YYYY-MM-DD"
									value={newSubgoals[item.id]?.date || ''}
									onChangeText={date => updateSubgoalField(item.id, 'date', date)}
									style={{
										borderWidth: 1,
										borderColor: '#ccc',
										borderRadius: 6,
										padding: 6,
										width: 100,
										marginRight: 4,
									}}
								/>
								<TouchableOpacity
									onPress={() => addSubgoal(item.id)}
									style={{ backgroundColor: '#2563EB', paddingHorizontal: 10, justifyContent: 'center', borderRadius: 6 }}
								>
									<Text style={{ color: 'white' }}>Dodaj</Text>
								</TouchableOpacity>
							</View> */}
						</View>
					)}
					</>
				)}
				ListEmptyComponent={<Text style={{ marginTop: 20 }}>Brak celów na te tydzień</Text>}
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
	weekHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginVertical: 12,
	},
	weekText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#111',
		marginHorizontal: 16,
	},
	arrow: {
		fontSize: 24,
		color: '#2563EB',
		fontWeight: 'bold',
	},
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
		justifyContent: 'space-between',
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