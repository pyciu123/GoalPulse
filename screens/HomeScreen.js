import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {View, Text, StyleSheet, Button, TouchableOpacity, Modal} from "react-native";
import { Audio } from "expo-av";

export default function HomeScreen ({navigation}) {
	const [userName, setUserName] = useState('');
	const [userId, setUserId] = useState('');
	const [recording, setRecording] = useState(null);
	const [sound, setSound] = useState(null);
	const [recordedURI, setRecordedURI] = useState(null);

	useEffect(function() {
		AsyncStorage.getItem('userId')
			.then(function(id) {
				if (id) {
					setUserId(id);
				}
			});
	}, []);
	useEffect(function() {
		AsyncStorage.getItem('userName')
			.then(function(name) {
				if (name) {
					setUserName(name);
				}
			})
	}, []);
	useEffect(function() {
		async function askPermission() {
			const {status} = await Audio.requestPermissionsAsync();
			if (status !== 'granted')
				alert('Brak uprawnien do mikrofonu');
		}
		askPermission();
	})

	async function startRecording() {
		try {
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			})
			const {recording} = await Audio.Recording.createAsync(
				Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
			);
			setRecording(recording);
		} catch (err) {
			console.error('Blad nagywania:', err);
		}
	}

	async function stopRecording() {
	try {
		await recording.stopAndUnloadAsync();
		const uri = recording.getURI();
		setRecordedURI(uri)
		setRecording(null);
	} catch (err) {
		console.error('blad zatrzymanie:', err);
	}}

	async function playRecording() {
		try {
			if (sound) {
				await sound.unloadAsync();
				setSound(null);
			}
			const {sound: newSound} = await Audio.Sound.createAsync({uri: recordedURI});
			setSound(newSound);
			await newSound.playAsync();
		} catch (err) {
			console.error('blad odtwarzania:', err);
		}
	}

	async function logoutUser() {
		await AsyncStorage.removeItem('userName');
		await AsyncStorage.removeItem('userId');
		navigation.navigate("Welcome")
	}
	function moveTo(screenName) {
		navigation.navigate(screenName);
	}
	return (
		<View style={styles.container}>
			<Text style={styles.welcomeTitle}>Cześć, {userName} 👋</Text>
			<Button
				title="Daily Goals"
				onPress={function () {moveTo("DailyGoals")}}
			/>
			<Button
				title="Weekly Goals"
				onPress={function () {moveTo("WeeklyGoals")}}
			/>
			<Button
				title="Monthly Goals"
				onPress={function () {moveTo("MonthlyGoals")}}
			/>
			<View style={styles.recording}>
				<Text style={styles.voiceNote}>Nagraj notatke głosową i pozwol ai przenalizowac swoj tydzien na podstawie notatek</Text>
				<Button
					title={recording ? "Zatrzymaj nagrywanie" : "Rozpocznij"}
					onPress={recording ? stopRecording : startRecording}
				/>
				{recordedURI && (
					<View style={{marginTop: 10}}>
						<Button
						title='Odtworz nagranie'
						onPress={playRecording}
						/>
					</View>
				)}
				</View>
			<View style={styles.buttonRow}>
				<Button
				title="Wyloguj się"
				onPress={logoutUser}
			/>
			</View>
		</View>
	)
}

const styles=StyleSheet.create ({
	voiceNote: {
		textAlign: 'center',
		fontSize: 14,
		color: '#2563EB',
		marginBottom: 10,
	},
	recording: {
		marginTop: 40,
	},
	container: {
		flex: 1,
		justifyContent: 'center', // srodek w pionie
		alignItems: 'center', // srodek w poziomie
		backgroundColor: '#f3f4f6',
		padding: 16,
	},
	welcomeTitle: {
		fontSize: 32,
		textAlign: 'center',
		marginBottom: 10,
		fontWeight: 'bold',
		letterSpacing: 1,
		color: '#2563EB'
	},
	buttonRow: {
		position: 'absolute',
		bottom: 32,
		alignItems: 'center',
	},
})