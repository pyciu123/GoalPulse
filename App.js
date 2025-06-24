import React from "react"
import HomeScreen from "./screens/HomeScreen"
import WelcomeScreen from "./screens/WelcomeScreen"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { NavigationContainer } from "@react-navigation/native"

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Welcome">
				<Stack.Screen name="Welcome" component={WelcomeScreen} />
				<Stack.Screen name="Home" component={HomeScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	)
}