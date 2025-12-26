import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { register, login } from "../services/service";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function AuthFlow({ onComplete }) {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const translateX = useSharedValue(0);

    const goToStep = (targetStep, duration = 500) => {
        setError("");
        setStep(targetStep);
        translateX.value = withTiming(-targetStep * width, { duration });
    };


    const nextRegisterStep = () => {
        if (step === 2 && !email.includes("@")) {
            setError("Email inválido");
            return;
        }
        if (step === 3 && name.length < 3) {
            setError("Nombre demasiado corto");
            return;
        }
        if (step === 4) {
            if (password.length < 8) {
                setError("La contraseña debe tener al menos 8 caracteres");
                return;
            }
            if (password !== confirmPassword) {
                setError("Las contraseñas no coinciden");
                return;
            }
            handleFinalRegister();
            return;
        }

        setError("");
        goToStep(step + 1);
    };

    const handleFinalRegister = async () => {
        setLoading(true);
        try {
            const result = await register(email, name, password);
            await AsyncStorage.setItem("userToken", result.token);
            await AsyncStorage.setItem("userName", result.user.name);
            goToStep(5);
            setTimeout(() => onComplete(), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await login(email, password);
            await AsyncStorage.setItem("userToken", result.token);
            await AsyncStorage.setItem("userName", result.user.name);
            onComplete();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <Animated.View style={[styles.flowWrapper, animatedStyle]}>
                <View style={styles.stepContainer}>
                    <Text style={styles.welcomeTitle}>Flashcards AI</Text>
                    <Text style={styles.welcomeSub}>Aprende inglés de forma inteligente</Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => goToStep(1)}>
                        <Text style={styles.buttonText}>Ingresar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => goToStep(2)}>
                        <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.stepContainer}>
                    <Text style={styles.label}>Bienvenido de nuevo</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <TouchableOpacity
                        style={[styles.primaryButton, loading && { opacity: 0.7 }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? "Ingresando..." : "Ingresar"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => goToStep(0)}>
                        <Text style={styles.backLink}>Volver</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.stepContainer}>
                    <Text style={styles.label}>Para empezar, ¿cuál es tu email?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="email@ejemplo.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <TouchableOpacity style={styles.button} onPress={nextRegisterStep}>
                        <Text style={styles.buttonText}>Siguiente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => goToStep(0)}>
                        <Text style={styles.backLink}>Volver</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.stepContainer}>
                    <Text style={styles.label}>¿Cómo te llamas?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre completo"
                        value={name}
                        onChangeText={setName}
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <TouchableOpacity style={styles.button} onPress={nextRegisterStep}>
                        <Text style={styles.buttonText}>Siguiente</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.stepContainer}>
                    <Text style={styles.label}>Crea tu contraseña</Text>
                    <Text style={styles.subLabel}>(Mínimo 8 caracteres)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <TouchableOpacity
                        style={[styles.button, loading && { opacity: 0.7 }]}
                        onPress={nextRegisterStep}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? "Registrando..." : "Finalizar"}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.stepContainer}>
                    <View style={styles.successCircle}>
                        <Text style={styles.checkIcon}>✓</Text>
                    </View>
                    <Text style={styles.successText}>¡Registro completado!</Text>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f4f8",
        overflow: "hidden",
    },
    flowWrapper: {
        flexDirection: "row",
        width: width * 6,
        flex: 1,
    },
    stepContainer: {
        width: width,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },
    welcomeTitle: {
        fontSize: 40,
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: 10,
    },
    welcomeSub: {
        fontSize: 18,
        color: "#64748b",
        marginBottom: 50,
        textAlign: "center",
    },
    label: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
        color: "#1e293b",
    },
    subLabel: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 20,
    },
    input: {
        width: width - 60,
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        fontSize: 18,
        elevation: 2,
        marginBottom: 20,
        height: 65,
        color: "#000",
    },
    primaryButton: {
        backgroundColor: "#3b82f6",
        paddingVertical: 18,
        width: width - 80,
        borderRadius: 30,
        elevation: 3,
        alignItems: "center",
        marginBottom: 15,
    },
    secondaryButton: {
        backgroundColor: "transparent",
        paddingVertical: 18,
        width: width - 80,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: "#3b82f6",
        alignItems: "center",
    },
    secondaryButtonText: {
        color: "#3b82f6",
        fontSize: 18,
        fontWeight: "bold",
    },
    button: {
        backgroundColor: "#3b82f6",
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 30,
        elevation: 3,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    errorText: {
        color: "#ef4444",
        marginBottom: 15,
        fontWeight: "500",
        textAlign: "center",
    },
    backLink: {
        marginTop: 20,
        color: "#64748b",
        fontSize: 16,
        textDecorationLine: "underline",
    },
    successCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#10b981",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        elevation: 10,
    },
    checkIcon: {
        fontSize: 60,
        color: "#fff",
        fontWeight: "bold",
    },
    successText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1e293b",
        textAlign: "center",
    },
});
