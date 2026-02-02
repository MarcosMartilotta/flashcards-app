import React from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Switch,
} from "react-native";

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

export default function CardList({ cards, onEdit, onToggleLocal, theme, currentUserId, currentUserRole }) {

    const handleExport = async () => {
        try {
            // Prepare data
            const data = cards.map(c => ({
                Pregunta: c.pregunta,
                Respuesta: c.respuesta,
                Activa: c.is_active ? "Sí" : "No",
                Clase: c.clase || "N/A"
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Mis Tarjetas");

            // Write to base64
            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

            // Save to temporary file
            const uri = FileSystem.cacheDirectory + 'mis_flashcards.xlsx';
            await FileSystem.writeAsStringAsync(uri, wbout, {
                encoding: 'base64'
            });

            // Share file
            await Sharing.shareAsync(uri, {
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                dialogTitle: 'Exportar Flashcards'
            });

        } catch (error) {
            console.error("Export error:", error);
            alert("No se pudo exportar el archivo.");
        }
    };

    const renderItem = ({ item }) => (
        <View style={[
            styles.row,
            { backgroundColor: item.is_active === 1 ? theme.card : theme.card + '50', borderColor: theme.glassBorder }
        ]}>
            <View style={[styles.cell, { flex: 2 }]}>
                <Text style={[styles.cellText, { color: theme.text }, item.is_active === 0 && { color: theme.textSecondary, opacity: 0.6 }]} numberOfLines={2}>
                    {item.pregunta}
                </Text>
            </View>
            <View style={[styles.cell, { flex: 2 }]}>
                <Text style={[styles.cellText, { color: theme.text }, item.is_active === 0 && { color: theme.textSecondary, opacity: 0.6 }]} numberOfLines={2}>
                    {item.respuesta}
                </Text>
                <Text style={[styles.claseLabel, { color: theme.primary }]}>
                    {item.clase && item.clase !== '' ? `🏫 ${item.clase}` : '👤 Propia'}
                </Text>
            </View>

            <View style={styles.actions}>
                <Switch
                    value={item.is_active === 1}
                    onValueChange={(val) => onToggleLocal(item.id, val)}
                    trackColor={{ false: "#94a3b8", true: theme.primary + '80' }}
                    thumbColor={item.is_active === 1 ? theme.primary : "#f1f5f9"}
                />
                {/* Edit Button (Propia or Teacher) */}
                {(currentUserRole === 'teacher' || item.teacher_id === currentUserId) && (
                    <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
                        <Text style={styles.editIcon}>✏️</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={[styles.header, { borderBottomColor: theme.glassBorder, backgroundColor: theme.card + '80' }]}>
                <Text style={[styles.headerText, { flex: 2, color: theme.textSecondary }]}>Pregunta</Text>
                <Text style={[styles.headerText, { flex: 2, color: theme.textSecondary }]}>Respuesta</Text>
                <Text style={[styles.headerText, { width: 85, textAlign: "center", color: theme.textSecondary }]}>Activa / Ed</Text>
            </View>
            <FlatList
                data={cards}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No hay tarjetas guardadas aún.</Text>
                    </View>
                }
            />

            {/* Export FAB */}
            <TouchableOpacity
                style={[styles.exportFab, { backgroundColor: theme.success || '#10b981' }]}
                onPress={handleExport}
                activeOpacity={0.8}
            >
                <Text style={styles.fabIcon}>📤</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        borderRadius: 25,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        padding: 18,
        borderBottomWidth: 1,
    },
    headerText: {
        fontWeight: "800",
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: "row",
        padding: 20,
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: "center",
    },
    cell: {
        paddingRight: 10,
    },
    cellText: {
        fontSize: 15,
        fontWeight: "600",
    },
    claseLabel: {
        fontSize: 10,
        fontWeight: "800",
        marginTop: 4,
        textTransform: 'uppercase',
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        width: 85,
        justifyContent: "space-between",
    },
    editBtn: {
        padding: 8,
        backgroundColor: 'rgba(150,150,150,0.1)',
        borderRadius: 12,
    },
    editIcon: {
        fontSize: 16,
    },
    listContent: {
        paddingTop: 10,
        paddingBottom: 80, // Extra padding for FAB
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 17,
        fontWeight: '500',
    },
    exportFab: {
        position: 'absolute',
        bottom: 25,
        left: 25,
        width: 55,
        height: 55,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 100,
    },
    fabIcon: {
        fontSize: 24,
    }
});
