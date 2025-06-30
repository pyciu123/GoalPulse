import React from "react"
import HomeScreen from "./screens/HomeScreen"
import WelcomeScreen from "./screens/WelcomeScreen"
import DailyGoals from "./screens/DailyGoals"
import WeeklyGoals from "./screens/WeeklyGoals"
import MonthlyGoals from "./screens/MonthlyGoals"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { NavigationContainer } from "@react-navigation/native"
import { GestureHandlerRootView } from "react-native-gesture-handler"

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<GestureHandlerRootView>
			<NavigationContainer>
				<Stack.Navigator initialRouteName="Welcome">
					<Stack.Screen name="Welcome" component={WelcomeScreen} />
					<Stack.Screen name="Home" component={HomeScreen} />
					<Stack.Screen name="DailyGoals" component={DailyGoals} />
					<Stack.Screen name="WeeklyGoals" component={WeeklyGoals} />
					<Stack.Screen name="MonthlyGoals" component={MonthlyGoals} />
				</Stack.Navigator>
			</NavigationContainer>
		</GestureHandlerRootView>
	)
}