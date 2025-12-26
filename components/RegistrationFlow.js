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
    ActivityIndicator,
    StatusBar,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { register, login } from "../services/service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme } from "../theme";

const { width, height } = Dimensions.get("window");

export default function RegistrationFlow({ onComplete, isDarkMode }) {
    const theme = isDarkMode ? darkTheme : lightTheme;

    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [institucion, setInstitucion] = useState("");
    const [selectedRole, setSelectedRole] = useState("student");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const translateX = useSharedValue(0);

    const goToStep = (targetStep) => {
        setError("");
        setStep(targetStep);
        translateX.value = withTiming(-targetStep * width, { duration: 500 });
    };

    const handleNextRegister = () => {
        setError("");
        if (step === 2) {
            if (!email.includes("@")) return setError("Ingresa un email válido");
            goToStep(3);
        } else if (step === 3) {
            if (name.trim().length < 3) return setError("Ingresa tu nombre completo");
            goToStep(4);
        } else if (step === 4) {
            if (password.length < 8) return setError("Mínimo 8 caracteres");
            if (password !== confirmPassword) return setError("Las contraseñas no coinciden");
            executeRegister();
        }
    };

    async function executeRegister() {
        setLoading(true);
        try {
            const result = await register(email, name, password, selectedRole, institucion);
            await AsyncStorage.setItem("userToken", result.token);
            await AsyncStorage.setItem("userData", JSON.stringify(result.user));
            await AsyncStorage.setItem("userName", result.user.name);
            goToStep(5);
            setTimeout(() => onComplete(), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function executeLogin() {
        setLoading(true);
        setError("");
        try {
            const result = await login(email, password);
            await AsyncStorage.setItem("userToken", result.token);
            await AsyncStorage.setItem("userData", JSON.stringify(result.user));
            await AsyncStorage.setItem("userName", result.user.name);
            onComplete();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const renderInput = (placeholder, value, onChange, secure = false, keyboard = "default") => (
        <TextInput
            style={[styles.input, {
                backgroundColor: theme.card,
                borderColor: theme.glassBorder,
                color: theme.text
            }]}
            placeholder={placeholder}
            placeholderTextColor={theme.textSecondary}
            value={value}
            onChangeText={onChange}
            secureTextEntry={secure}
            keyboardType={keyboard}
            autoCapitalize="none"
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            {/* Background elements for depth */}
            <View style={[styles.blob, { top: -50, right: -50, backgroundColor: theme.primary, opacity: 0.15 }]} />
            <View style={[styles.blob, { bottom: -100, left: -50, backgroundColor: theme.accent, opacity: 0.15 }]} />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <Animated.View style={[styles.flowWrapper, animatedStyle]}>

                    {/* Step 0: Welcome */}
                    <View style={styles.stepContainer}>
                        <View style={styles.heroContent}>
                            <Text style={[styles.brand, { color: theme.text }]}>Flashcards AI</Text>
                            <Text style={[styles.tagline, { color: theme.textSecondary }]}>Domina el inglés con un sistema inteligente.</Text>
                        </View>
                        <View style={styles.btnStack}>
                            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.primary }]} onPress={() => goToStep(1)}>
                                <Text style={styles.mainBtnText}>Entrar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.ghostBtn, { borderColor: theme.primary }]} onPress={() => goToStep(2)}>
                                <Text style={[styles.ghostBtnText, { color: theme.primary }]}>Crear cuenta gratis</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Step 1: Login */}
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>¡Qué bueno verte!</Text>
                        <View style={styles.form}>
                            {renderInput("Email", email, setEmail, false, "email-address")}
                            {renderInput("Contraseña", password, setPassword, true)}
                            {error ? <Text style={styles.error}>{error}</Text> : null}
                            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.primary }]} onPress={executeLogin} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Iniciar Sesión</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => goToStep(0)}>
                                <Text style={[styles.backBtn, { color: theme.textSecondary }]}>Volver al inicio</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Step 2: Register - Email */}
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Regístrate</Text>
                        <Text style={[styles.stepSub, { color: theme.textSecondary }]}>¿A qué email te enviamos el progreso?</Text>
                        <View style={styles.form}>
                            {renderInput("tu@email.com", email, setEmail, false, "email-address")}
                            {error ? <Text style={styles.error}>{error}</Text> : null}
                            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.primary }]} onPress={handleNextRegister}>
                                <Text style={styles.mainBtnText}>Siguiente</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => goToStep(0)}>
                                <Text style={[styles.backBtn, { color: theme.textSecondary }]}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Step 3: Register - Profile */}
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Tu Perfil</Text>
                        <View style={styles.roleContainer}>
                            <TouchableOpacity
                                style={[styles.roleBtn, { backgroundColor: theme.card, borderColor: theme.glassBorder }, selectedRole === "student" && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                onPress={() => setSelectedRole("student")}
                            >
                                <Text style={[styles.roleBtnText, { color: theme.textSecondary }, selectedRole === "student" && { color: "#fff" }]}>Alumno</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.roleBtn, { backgroundColor: theme.card, borderColor: theme.glassBorder }, selectedRole === "teacher" && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                onPress={() => setSelectedRole("teacher")}
                            >
                                <Text style={[styles.roleBtnText, { color: theme.textSecondary }, selectedRole === "teacher" && { color: "#fff" }]}>Profesor</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.form}>
                            {renderInput("Tu nombre completo", name, setName)}
                            {renderInput("Institución (opcional)", institucion, setInstitucion)}
                            {error ? <Text style={styles.error}>{error}</Text> : null}
                            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.primary }]} onPress={handleNextRegister}>
                                <Text style={styles.mainBtnText}>Continuar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Step 4: Register - Pass */}
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Seguridad</Text>
                        <View style={styles.form}>
                            {renderInput("Crea una contraseña", password, setPassword, true)}
                            {renderInput("Confirma contraseña", confirmPassword, setConfirmPassword, true)}
                            {error ? <Text style={styles.error}>{error}</Text> : null}
                            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.secondary }]} onPress={handleNextRegister} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Finalizar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Step 5: Success */}
                    <View style={styles.stepContainer}>
                        <View style={[styles.successBadge, { backgroundColor: theme.secondary }]}>
                            <Text style={styles.check}>✓</Text>
                        </View>
                        <Text style={[styles.successTitle, { color: theme.text }]}>¡Todo listo!</Text>
                        <Text style={[styles.successSub, { color: theme.textSecondary }]}>Preparando tu panel de estudio...</Text>
                    </View>

                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, overflow: "hidden" },
    blob: { position: "absolute", width: 300, height: 300, borderRadius: 150 },
    flowWrapper: { flexDirection: "row", width: width * 6, flex: 1 },
    stepContainer: { width, flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
    heroContent: { alignItems: 'center', marginBottom: 60 },
    brand: { fontSize: 46, fontWeight: "900", letterSpacing: -1.5 },
    tagline: { fontSize: 18, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
    btnStack: { width: '100%', gap: 15, alignItems: 'center' },
    stepTitle: { fontSize: 32, fontWeight: "800", marginBottom: 30, letterSpacing: -0.5 },
    stepSub: { fontSize: 16, marginBottom: 20, textAlign: "center" },
    form: { width: '100%', alignItems: 'center' },
    input: {
        width: width - 60,
        borderRadius: 22,
        padding: 20,
        fontSize: 18,
        borderWidth: 1.5,
        marginBottom: 15,
        height: 65,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 1,
    },
    roleContainer: { flexDirection: "row", width: width - 60, marginBottom: 20, gap: 12 },
    roleBtn: { flex: 1, padding: 18, alignItems: "center", borderWidth: 1.5, borderRadius: 20 },
    roleBtnText: { fontSize: 16, fontWeight: "700" },
    mainBtn: { width: width - 60, padding: 20, borderRadius: 22, alignItems: "center", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    mainBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    ghostBtn: { width: width - 60, padding: 18, borderRadius: 22, borderWidth: 2, alignItems: "center" },
    ghostBtnText: { fontSize: 18, fontWeight: "bold" },
    backBtn: { marginTop: 25, fontSize: 15, fontWeight: "600", textDecorationLine: "underline" },
    error: { color: "#ef4444", marginBottom: 20, fontWeight: "600", textAlign: "center" },
    successBadge: { width: 120, height: 120, borderRadius: 60, justifyContent: "center", alignItems: "center", marginBottom: 25, elevation: 10 },
    check: { color: "#fff", fontSize: 60, fontWeight: "bold" },
    successTitle: { fontSize: 30, fontWeight: "bold", marginBottom: 10 },
    successSub: { fontSize: 18, textAlign: "center" }
});
