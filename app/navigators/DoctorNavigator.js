import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../constants/theme';

import HomeScreen from '../screens/HomeScreen';
import DoctorInfoScreen from '../screens/DoctorInfoScreen'
import ChatScreen from '../screens/ChatScreen';
import PatientChatScreen from '../screens/PatientChatScreen';
import ConsultationResultScreen from '../screens/ConsultationResultScreen';
import PreviousConsultationsScreen from '../screens/PreviousConsultationScreen';
import ConsultationForm from '../screens/ConsultFormScreen';
import CallScreen from '../screens/CallScreen';

const Stack = createStackNavigator();

const DoctorNavigator = () => {
    const { theme } = useTheme();
  return (
    <Stack.Navigator>
      <Stack.Screen name="docHome" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="doctor" component={DoctorInfoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="chatDoctor" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="chatPatient" component={PatientChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="conResult" component={ConsultationResultScreen} options={{ headerShown: false }} />
      <Stack.Screen name="previousConsult" component={PreviousConsultationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="consultForm" component={ConsultationForm} options={{ headerShown: false }} />
      <Stack.Screen name="callScreen" component={CallScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default DoctorNavigator