import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import XLSX from 'xlsx';
import { bulkCreateCards } from '../services/service';

export default function ImportModal({ visible, onClose, onImportSuccess, classes, theme }) {
    const [selectedClase, setSelectedClase] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState(null);

    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-excel"
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setFileName(file.name);
            processExcel(file.uri);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo seleccionar el archivo.");
        }
    };

    const processExcel = async (uri) => {
        setIsLoading(true);
        try {
            const fileContent = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });

            const workbook = XLSX.read(fileContent, { type: 'base64' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Read as array of arrays, ignoring headers logic
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Remove header row (first row)
            if (jsonData.length > 0) jsonData.shift();

            // Filter empty rows and map by index
            // Row[0] -> Pregunta
            // Row[1] -> Respuesta
            // Ignore extra columns if present
            const cards = jsonData
                .filter(row => Array.isArray(row) && row[0] != null && row[1] != null)
                .map(row => ({
                    pregunta: String(row[0]).trim(),
                    respuesta: String(row[1]).trim()
                }))
                .filter(c => c.pregunta && c.respuesta); // Ensure not empty strings after trim

            if (cards.length === 0) {
                Alert.alert("Error", "No se encontraron datos válidos (filas con Pregunta y Respuesta) a partir de la fila 2.");
                setIsLoading(false);
                setFileName(null);
                return;
            }

            // Send to backend
            await bulkCreateCards(cards, selectedClase);

            Alert.alert("Éxito", `Se importaron ${cards.length} tarjetas correctamente.`);
            onImportSuccess();
            onCloseInternal();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Falló la importación del archivo. Asegúrate que tenga 2 columnas.");
        } finally {
            setIsLoading(false);
        }
    };

    const onCloseInternal = () => {
        setFileName(null);
        setSelectedClase(null);
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.card, borderColor: theme.glassBorder }]}>
                    <TouchableOpacity style={styles.closeX} onPress={onCloseInternal}>
                        <Text style={[styles.closeXText, { color: theme.textSecondary }]}>✕</Text>
                    </TouchableOpacity>

                    <Text style={[styles.modalTitle, { color: theme.text }]}>Importar desde Excel</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        El archivo debe tener columnas "Pregunta" y "Respuesta".
                    </Text>

                    {/* Class Selection */}
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

                    {/* File Picker Button */}
                    <TouchableOpacity
                        style={[styles.importButton, { backgroundColor: theme.secondary }]}
                        onPress={handlePickFile}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {fileName ? `Procesando: ${fileName}...` : "📂 Seleccionar Excel"}
                            </Text>
                        )}
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
        width: "90%",
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
        fontSize: 24,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 25,
        opacity: 0.8,
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
    importButton: {
        padding: 20,
        borderRadius: 22,
        alignItems: "center",
        elevation: 4,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "900",
    },
});
