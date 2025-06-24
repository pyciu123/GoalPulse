import React, {useState} from "react";
import {Text, View, StyleSheet, TextInput, Button, Alert} from 'react-native'
import { API_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WelcomeScreen ({navigation}) {
	const [nick, setNick] = useState('')
	async function handleLogin () {
		if (!nick)
			return;
		try {
			const res = await fetch(`${API_URL}/check-if-user-in-db`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({name: nick})
			});
			const data = await res.json();
			if (data.status == 'success') {
				await AsyncStorage.setItem('userName', nick);
				await AsyncStorage.setItem('userId', String(data.user_id))
				navigation.replace("Home");
			}
			else {
				Alert.alert("Błąd logowania", "Taki urzytkownik nie istnieje")
			}
		} catch (err) {
			return ('Bład')
		}
	}
	return (
		<View style={styles.container}>
			<Text style={styles.welcomeTitle}>Witaj w PulseGoal</Text>
			<TextInput 
				style={styles.input}
				placeholder="Wpisz nick"
				value={nick}
				onChangeText={setNick}
				/>
			<View style={styles.buttonRow}>
				<Button 
					title="Login"
					onPress={handleLogin}
					/>
				<Button
					title="Zarejestruj"
					/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create ({
	container: {
		flex: 1, // wypelnia ekran
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
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		borderRadius: 8,
		marginBottom: 10,
		width: '80%'
	},
	buttonRow: {
		flexDirection: 'row',
		gap: 12,
		justifyContent: 'center'
	}
})