import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    TouchableOpacity,
    Button,
    Image
} from 'react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from
    'react-native-confirmation-code-field';
// import { Button } from '../../../components';
import { styles } from '../constants/style';
import { lightTheme } from '../constants/theme';
import { useTheme } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { getUserInfo, loginSuccess } from '../store/actions';
import { addUser, getUser } from '../config/firebaseConfig';
import Toast from 'react-native-toast-message';

const CELL_COUNT = 6;
const RESEND_OTP_TIME_LIMIT = 90;

export default function () {
    let resendOtpTimerInterval = 5000;
    const route = useRoute()
    const [loading, setLoading] = useState(false);
    const [verificationWrong, setVerificationWrong] = useState(false);
    const { theme } = useTheme()
    const { confirmationResult } = route.params;
    const dispatch = useDispatch()

    const [resendButtonDisabledTime, setResendButtonDisabledTime] = useState(
        RESEND_OTP_TIME_LIMIT,
    );

    const verifyCode = async (code) => {
        setLoading(true);
        console.log(confirmationResult);
        if (confirmationResult) {
            try {
                const userCredential = await confirmationResult.confirm(code);
                setLoading(true);
                if (userCredential) {
                    // const creds = { id: userCredential.uid, _id: userCredential.uid, phoneNumber: userCredential.phoneNumber, type: "patient" }
                    // addUser(creds)
                    dispatch(loginSuccess(userCredential));
                }
                setLoading(false)
                Toast.show({
                    text1: 'Phone verified, setting up...',
                    type: 'success', // Can be 'success', 'info', 'warning', or 'error'
                    position: 'top', // Can be 'top', 'center', or 'bottom'
                    duration: 30000, // Duration in milliseconds
                });
            } catch (error) {
                setVerificationWrong(true);
            } finally {
                setLoading(false);
            }
        } else {
            // Handle the case where confirmationResult is not available
            setLoading(false);
        }
    };


    //to start resent otp option
    const startResendOtpTimer = () => {
        if (resendOtpTimerInterval) {
            clearInterval(resendOtpTimerInterval);
        }
        resendOtpTimerInterval = setInterval(() => {
            if (resendButtonDisabledTime <= 0) {
                clearInterval(resendOtpTimerInterval);
            } else {
                setResendButtonDisabledTime(resendButtonDisabledTime - 1);
            }
        }, 1000);
    };

    //on click of resend button
    const onResendOtpButtonPress = () => {
        //clear input field
        setValue('')
        setResendButtonDisabledTime(RESEND_OTP_TIME_LIMIT);
        startResendOtpTimer();

        // resend OTP Api call
        // todo
        console.log('todo: Resend OTP');
    };

    //declarations for input field
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    //start timer on screen on launch
    useEffect(() => {
        startResendOtpTimer();
        return () => {
            if (resendOtpTimerInterval) {
                clearInterval(resendOtpTimerInterval);
            }
        };
    }, [resendButtonDisabledTime]);

    return (
        <SafeAreaView style={styles.root}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    alignItems: "center"
                }}
            >
                <View
                    style={[styles.iconContainer]}
                >
                    <Image
                        source={require('../../assets/icon.png')}
                        style={{
                            width: 60,
                            height: 60,
                        }}
                    />
                    <Text style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: theme.colors.Primary
                    }}>Smile<Text
                        style={{
                            color: theme.colors.tabActive,
                        }}
                    >Dom</Text></Text>
                </View>
                <Text
                    style={[
                        styles.intro,
                        { color: theme.colors.Primary }]}
                >
                    Verify your number
                </Text>
            </View>
            {/* <Text style={styles.title}>Verify the Authorisation Code</Text> */}
            <Text style={styles.subTitle}>Waiting to automatically detect an SMS sent to </Text>
            <Text style={styles.subTitle}>+237 679 68 26 26</Text>
            <CodeField
                ref={ref}
                {...props}
                value={value}
                onChangeText={setValue}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={({ index, symbol, isFocused }) => (
                    <View
                        onLayout={getCellOnLayoutHandler(index)}
                        key={index}
                        style={[styles.cellRoot, isFocused && styles.focusCell]}>
                        <Text style={styles.cellText}>
                            {symbol || (isFocused ? <Cursor /> : null)}
                        </Text>
                    </View>
                )}
            />
            {/* View for resend otp  */}
            {resendButtonDisabledTime > 0 ? (
                <Text style={styles.resendCodeText}>Resend Authorisation Code in {resendButtonDisabledTime} sec</Text>
            ) : (
                <TouchableOpacity
                    onPress={onResendOtpButtonPress}>
                    <View style={styles.resendCodeContainer}>
                        <Text style={styles.resendCode} > Resend Authorisation Code</Text>
                        <Text style={{ marginTop: 40 }}> in {resendButtonDisabledTime} sec</Text>
                    </View>
                </TouchableOpacity >
            )
            }
            <View style={styles.button}>
                <Button
                    onPress={() => verifyCode(value)}
                    title='Verify'
                    color={lightTheme.colors.Primary}
                    disabled={loading}
                />
            </View>
            {verificationWrong && <Text style={{ color: "red" }}>Wrong code</Text>}
        </SafeAreaView >
    );
}