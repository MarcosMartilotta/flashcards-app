import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

export default function CardModal({
    visible,
    onClose,
    onSave,
    isEditing,
    initialData,
}) {
    const [pregunta, setPregunta] = useState("");
    const [respuesta, setRespuesta] = useState("");

    useEffect(() => {
        if (visible) {
            setPregunta(initialData?.pregunta || "");
            setRespuesta(initialData?.respuesta || "");
        }
    }, [visible, initialData]);

    const handleSave = () => {
        if (!pregunta.trim() || !respuesta.trim()) {
            alert("Por favor, completa ambos campos.");
            return;
        }
        onSave(pregunta.trim(), respuesta.trim());
    };

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                        {isEditing ? "Editar Flashcard" : "Nueva Flashcard"}
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Pregunta"
                        value={pregunta}
                        onChangeText={setPregunta}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Respuesta"
                        value={respuesta}
                        onChangeText={setRespuesta}
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveText}>Guardar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 15,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 18,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    saveButton: {
        backgroundColor: "#3b82f6",
        padding: 12,
        borderRadius: 10,
        flex: 1,
        marginRight: 10,
        alignItems: "center",
    },
    saveText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    cancelButton: {
        backgroundColor: "#ef4444",
        padding: 12,
        borderRadius: 10,
        flex: 1,
        marginLeft: 10,
        alignItems: "center",
    },
    cancelText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});
