import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";

export default function CardModal({
    visible,
    onClose,
    onSave,
    isEditing,
    initialData,
    user,
    classes = [],
    theme
}) {
    const [pregunta, setPregunta] = useState("");
    const [respuesta, setRespuesta] = useState("");
    const [selectedClase, setSelectedClase] = useState(null);

    useEffect(() => {
        if (visible) {
            setPregunta(initialData?.pregunta || "");
            setRespuesta(initialData?.respuesta || "");
            setSelectedClase(null);
        }
    }, [visible, initialData]);

    const handleSave = () => {
        if (!pregunta.trim() || !respuesta.trim()) {
            alert("Por favor, completa ambos campos.");
            return;
        }
        onSave(pregunta.trim(), respuesta.trim(), selectedClase);
    };

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.card, borderColor: theme.glassBorder }]}>
                    <TouchableOpacity style={styles.closeX} onPress={onClose}>
                        <Text style={[styles.closeXText, { color: theme.textSecondary }]}>✕</Text>
                    </TouchableOpacity>

                    <Text style={[styles.modalTitle, { color: theme.text }]}>
                        {isEditing ? "Editar Flashcard" : "Nueva Flashcard"}
                    </Text>

                    <TextInput
                        style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.glassBorder }]}
                        placeholder="Pregunta"
                        placeholderTextColor={theme.textSecondary}
                        value={pregunta}
                        onChangeText={setPregunta}
                        multiline
                    />

                    <TextInput
                        style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.glassBorder }]}
                        placeholder="Respuesta"
                        placeholderTextColor={theme.textSecondary}
                        value={respuesta}
                        onChangeText={setRespuesta}
                        multiline
                    />

                    {user?.role === 'teacher' && !isEditing && (
                        <View style={styles.classSection}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Asignar a:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classScroll}>
                                <TouchableOpacity
                                    style={[styles.classChip, { backgroundColor: theme.background, borderColor: theme.glassBorder }, selectedClase === null && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                    onPress={() => setSelectedClase(null)}
                                >
                                    <Text style={[styles.chipText, { color: theme.textSecondary }, selectedClase === null && { color: "#fff", fontWeight: 'bold' }]}>🏷️ Solo yo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.classChip, { backgroundColor: theme.background, borderColor: theme.glassBorder }, selectedClase === 'TODAS' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                    onPress={() => setSelectedClase('TODAS')}
                                >
                                    <Text style={[styles.chipText, { color: theme.textSecondary }, selectedClase === 'TODAS' && { color: "#fff", fontWeight: 'bold' }]}>🌟 Todas</Text>
                                </TouchableOpacity>

                                {classes.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.classChip, { backgroundColor: theme.background, borderColor: theme.glassBorder }, selectedClase === c && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                        onPress={() => setSelectedClase(c)}
                                    >
                                        <Text style={[styles.chipText, { color: theme.textSecondary }, selectedClase === c && { color: "#fff", fontWeight: 'bold' }]}>🏫 {c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.secondary }]} onPress={handleSave}>
                        <Text style={styles.saveText}>Guardar Tarjeta</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "92%",
        padding: 30,
        borderRadius: 32,
        borderWidth: 1,
        elevation: 10,
    },
    closeX: {
        position: "absolute",
        top: 20,
        right: 20,
        padding: 10,
        zIndex: 10,
    },
    closeXText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: "800",
        marginBottom: 25,
        textAlign: "center",
        letterSpacing: -0.5,
    },
    input: {
        padding: 18,
        borderRadius: 20,
        marginBottom: 15,
        fontSize: 18,
        borderWidth: 1,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    label: {
        fontSize: 14,
        fontWeight: "800",
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    classSection: {
        marginBottom: 30,
    },
    classScroll: {
        flexDirection: "row",
    },
    classChip: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 15,
        marginRight: 10,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 14,
        fontWeight: "600",
    },
    saveButton: {
        padding: 20,
        borderRadius: 22,
        alignItems: "center",
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    saveText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "900",
    },
});
