import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { translateTexts } from "../services/service";

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
            setSelectedClase(initialData?.clase || null);
        }
    }, [visible, initialData]);

    const [isTranslatingP, setIsTranslatingP] = useState(false);
    const [isTranslatingR, setIsTranslatingR] = useState(false);

    const handleTranslate = async (sourceField, targetField = null) => {
        const text = sourceField === 'pregunta' ? pregunta : respuesta;
        const finalTargetField = targetField || sourceField;
        if (!text.trim()) return;

        if (sourceField === 'pregunta') setIsTranslatingP(true);
        else setIsTranslatingR(true);

        try {
            // First attempt: translate to English
            let translations = await translateTexts([text], "en");
            if (translations && translations.length === 1) {
                const det = translations[0].detectedSourceLanguage;

                // If it was already English, translate to Spanish instead
                if (det === 'en') {
                    translations = await translateTexts([text], "es");
                }

                if (translations && translations.length === 1) {
                    if (finalTargetField === 'pregunta') setPregunta(translations[0].translatedText);
                    else setRespuesta(translations[0].translatedText);
                }
            }
        } catch (error) {
            console.error("Translation error:", error);
            alert("Error al traducir.");
        } finally {
            setIsTranslatingP(false);
            setIsTranslatingR(false);
        }
    };

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

                    <View style={styles.headerRow}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            {isEditing ? "Editar Flashcard" : "Nueva Flashcard"}
                        </Text>
                    </View>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.glassBorder }]}
                            placeholder="Pregunta"
                            placeholderTextColor={theme.textSecondary}
                            value={pregunta}
                            onChangeText={setPregunta}
                            multiline
                        />
                        <View style={styles.translateRow}>
                            <TouchableOpacity
                                style={[styles.inlineTranslateBtn]}
                                onPress={() => handleTranslate('pregunta', 'respuesta')}
                                disabled={isTranslatingP}
                            >
                                <Text style={[styles.translateBtnText, { color: theme.primary }]}>📝 Traducir debajo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.inlineTranslateBtn]}
                                onPress={() => handleTranslate('pregunta', 'pregunta')}
                                disabled={isTranslatingP}
                            >
                                {isTranslatingP ? (
                                    <ActivityIndicator size="small" color={theme.primary} />
                                ) : (
                                    <Text style={[styles.translateBtnText, { color: theme.primary }]}>🌐 Traducir aquí</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.glassBorder }]}
                            placeholder="Respuesta"
                            placeholderTextColor={theme.textSecondary}
                            value={respuesta}
                            onChangeText={setRespuesta}
                            multiline
                        />
                        <View style={styles.translateRow}>
                            <TouchableOpacity
                                style={[styles.inlineTranslateBtn]}
                                onPress={() => handleTranslate('respuesta', 'pregunta')}
                                disabled={isTranslatingR}
                            >
                                <Text style={[styles.translateBtnText, { color: theme.primary }]}>📝 Traducir arriba</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.inlineTranslateBtn]}
                                onPress={() => handleTranslate('respuesta', 'respuesta')}
                                disabled={isTranslatingR}
                            >
                                {isTranslatingR ? (
                                    <ActivityIndicator size="small" color={theme.primary} />
                                ) : (
                                    <Text style={[styles.translateBtnText, { color: theme.primary }]}>🌐 Traducir aquí</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {user?.role === 'teacher' && (
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
        marginBottom: 0,
    },
    headerRow: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    translateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: -10,
        marginBottom: 5,
    },
    inlineTranslateBtn: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    translateBtnText: {
        fontSize: 13,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    input: {
        padding: 18,
        borderRadius: 20,
        marginBottom: 12,
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
