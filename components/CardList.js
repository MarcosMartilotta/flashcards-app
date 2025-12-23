import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Switch,
} from "react-native";

export default function CardList({ cards, onEdit, onToggleLocal }) {
    // We expect onToggleLocal to update the parent state locally, 
    // and when the user leaves this view, we'll sync with the API.

    const renderItem = ({ item }) => (
        <View style={[styles.row, item.is_active === 0 && styles.rowInactive]}>
            <View style={[styles.cell, { flex: 2 }]}>
                <Text style={[styles.cellText, item.is_active === 0 && styles.textInactive]} numberOfLines={2}>
                    {item.pregunta}
                </Text>
            </View>
            <View style={[styles.cell, { flex: 2 }]}>
                <Text style={[styles.cellText, item.is_active === 0 && styles.textInactive]} numberOfLines={2}>
                    {item.respuesta}
                </Text>
            </View>

            <View style={styles.actions}>
                <Switch
                    value={item.is_active === 1}
                    onValueChange={(val) => onToggleLocal(item.id, val)}
                    trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
                    thumbColor={item.is_active === 1 ? "#3b82f6" : "#f1f5f9"}
                />
                <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
                    <Text style={styles.editBtnText}>✏️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.headerText, { flex: 2 }]}>Pregunta</Text>
                <Text style={[styles.headerText, { flex: 2 }]}>Respuesta</Text>
                <Text style={[styles.headerText, { width: 80, textAlign: "center" }]}>Estado / Edit</Text>
            </View>
            <FlatList
                data={cards}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No hay tarjetas guardadas.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    header: {
        flexDirection: "row",
        backgroundColor: "#f8fafc",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    headerText: {
        fontWeight: "bold",
        color: "#64748b",
        fontSize: 14,
    },
    row: {
        flexDirection: "row",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        alignItems: "center",
    },
    rowInactive: {
        backgroundColor: "#f8fafc",
    },
    cell: {
        paddingRight: 10,
    },
    cellText: {
        color: "#1e293b",
        fontSize: 15,
    },
    textInactive: {
        color: "#94a3b8",
        textDecorationLine: "line-through",
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        width: 80,
        justifyContent: "space-between",
    },
    editBtn: {
        padding: 5,
    },
    editBtnText: {
        fontSize: 18,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 50,
        color: "#64748b",
        fontSize: 16,
    },
});
