import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {View, Text, StyleSheet, Button, TouchableOpacity, Platform} from "react-native";

export default function WeeklyGoals ({navigation}) {
	return (
		<View style={styles.container}>
			<Text>DailyGoals</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1, // wypelnia ekran
		justifyContent: 'center', // srodek w pionie
		alignItems: 'center', // srodek w poziomie
		backgroundColor: '#f3f4f6',
		padding: 16,
	},
})