import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {View, Text, StyleSheet} from "react-native";

export default function HomeScreen () {
	const [userName, setUserName] = useState('');
	const [userId, setUserId] = useState('');

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
	return (
		<View style={styles.container}>
			<Text style={styles.welcomeTitle}>Cześć, </Text>
		</View>
	)
}

const styles=StyleSheet.create ({
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
})