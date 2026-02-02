import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { updateProfile } from "../services/service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import avatars from "../assets/avatares";
import { Image, Modal } from "react-native";

export default function ProfileView({ user, onBack, onUpdate, theme }) {
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [institucion, setInstitucion] = useState(user?.institucion || "");
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "avatar1");
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) {
            setError("Nombre y Email son requeridos.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const result = await updateProfile(email.trim(), name.trim(), institucion.trim(), selectedAvatar);
            await AsyncStorage.setItem("userData", JSON.stringify(result.user));
            await AsyncStorage.setItem("userName", result.user.name);
            setSuccess("Perfil actualizado con éxito.");
            onUpdate(result.user);
            setTimeout(() => onBack(), 1500);
        } catch (err) {
            setError(err.message || "Error al actualizar perfil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={[styles.backText, { color: theme.primary }]}>← Volver</Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Mi Perfil</Text>
                </View>

                <TouchableOpacity
                    style={[styles.avatarContainer, { backgroundColor: theme.primary }]}
                    onPress={() => setShowAvatarPicker(true)}
                >
                    <Image source={avatars[selectedAvatar]} style={styles.avatarImg} />
                    <View style={styles.editBadge}>
                        <Text style={styles.editBadgeText}>✏️</Text>
                    </View>
                </TouchableOpacity>

                {/* Avatar Picker Modal */}
                <Modal visible={showAvatarPicker} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Elige tu Avatar</Text>
                            <ScrollView contentContainerStyle={styles.avatarGrid}>
                                {Object.keys(avatars).map((key) => (
                                    <TouchableOpacity
                                        key={key}
                                        onPress={() => {
                                            setSelectedAvatar(key);
                                            setShowAvatarPicker(false);
                                        }}
                                        style={[
                                            styles.avatarOption,
                                            selectedAvatar === key && { borderColor: theme.primary, borderWidth: 3 }
                                        ]}
                                    >
                                        <Image source={avatars[key]} style={styles.avatarGridImg} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { backgroundColor: theme.error + '20' }]}
                                onPress={() => setShowAvatarPicker(false)}
                            >
                                <Text style={{ color: theme.error, fontWeight: '700' }}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <View style={styles.form}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Nombre Completo</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.glassBorder }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Tu nombre"
                        placeholderTextColor={theme.textSecondary}
                    />

                    <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.glassBorder }]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="tu@email.com"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={[styles.label, { color: theme.textSecondary }]}>Institución</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.glassBorder }]}
                        value={institucion}
                        onChangeText={setInstitucion}
                        placeholder="Escuela / Empresa"
                        placeholderTextColor={theme.textSecondary}
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    {success ? <Text style={styles.successText}>{success}</Text> : null}

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.primary }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Guardar Cambios</Text>}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
    },
    backText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginLeft: 20,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    editBadgeText: { fontSize: 14 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxHeight: '70%',
        borderRadius: 25,
        padding: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
    },
    avatarOption: {
        width: 70,
        height: 70,
        borderRadius: 35,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarGridImg: {
        width: '100%',
        height: '100%',
    },
    cancelBtn: {
        marginTop: 20,
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
    },
    form: {
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        height: 60,
        borderWidth: 1,
        borderRadius: 18,
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 20,
    },
    saveButton: {
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#ef4444',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 10,
    },
    successText: {
        color: '#10b981',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 10,
    }
});
