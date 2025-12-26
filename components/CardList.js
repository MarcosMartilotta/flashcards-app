import React from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Switch,
} from "react-native";

export default function CardList({ cards, onEdit, onToggleLocal, theme }) {

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
            </View>

            <View style={styles.actions}>
                <Switch
                    value={item.is_active === 1}
                    onValueChange={(val) => onToggleLocal(item.id, val)}
                    trackColor={{ false: "#94a3b8", true: theme.primary + '80' }}
                    thumbColor={item.is_active === 1 ? theme.primary : "#f1f5f9"}
                />
                <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
                    <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
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
        fontSize: 16,
        fontWeight: "600",
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
        paddingBottom: 30,
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 17,
        fontWeight: '500',
    },
});
