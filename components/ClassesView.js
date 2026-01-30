import React, { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    ActivityIndicator,
    ScrollView,
    Alert,
} from "react-native";
import {
    getTeacherClasses,
    searchStudents,
    assignStudentsToClass,
    getClassStudents,
    removeStudentFromClass,
    translateTexts
} from "../services/service";

export default function ClassesView({ theme, onClassesUpdated }) {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newClassName, setNewClassName] = useState("");
    const [studentSearch, setStudentSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isTranslatingClassName, setIsTranslatingClassName] = useState(false);
    const searchTimer = useRef(null);

    // Detail state
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classStudents, setClassStudents] = useState([]);

    useEffect(() => {
        loadClasses();
    }, []);

    async function loadClasses() {
        setLoading(true);
        const data = await getTeacherClasses();
        setClasses(data);
        setLoading(false);
    }

    const handleSearch = async (text) => {
        setStudentSearch(text);
        if (searchTimer.current) clearTimeout(searchTimer.current);

        if (text.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        searchTimer.current = setTimeout(async () => {
            const results = await searchStudents(text);
            const filtered = results.filter(r =>
                !selectedStudents.find(s => s.id === r.id) &&
                !classStudents.find(s => s.id === r.id)
            );
            setSearchResults(filtered);
            setIsSearching(false);
        }, 500);
    };

    const addStudent = (student) => {
        setSelectedStudents([...selectedStudents, student]);
        setStudentSearch("");
        setSearchResults([]);
    };

    const removeSelectedStudent = (id) => {
        setSelectedStudents(selectedStudents.filter(s => s.id !== id));
    };

    const handleSaveClass = async () => {
        const nameToUse = isEditing ? selectedClass : newClassName.trim();
        if (!nameToUse || selectedStudents.length === 0) {
            Alert.alert("Error", "Debes ingresar un nombre de clase y al menos un alumno.");
            return;
        }

        try {
            await assignStudentsToClass(nameToUse, selectedStudents.map(s => s.id));
            setModalVisible(false);
            setNewClassName("");
            setSelectedStudents([]);
            setIsEditing(false);
            if (isEditing) openClassDetail(selectedClass);
            await loadClasses();
            if (onClassesUpdated) onClassesUpdated();
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    const openClassDetail = async (className) => {
        setSelectedClass(className);
        const students = await getClassStudents(className);
        setClassStudents(students);
        setDetailVisible(true);
    };

    const handleDeleteStudent = async (studentId) => {
        try {
            await removeStudentFromClass(selectedClass, studentId);
            const updated = classStudents.filter(s => s.id !== studentId);
            setClassStudents(updated);
            if (updated.length === 0) {
                setDetailVisible(false);
                loadClasses();
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    const openAddMoreStudents = () => {
        setIsEditing(true);
        setStudentSearch("");
        setSelectedStudents([]);
        setModalVisible(true);
    };

    const handleTranslateClassName = async () => {
        if (!newClassName.trim()) return;

        setIsTranslatingClassName(true);
        try {
            // First attempt: translate to English
            let translations = await translateTexts([newClassName], "en");
            if (translations && translations.length === 1) {
                const det = translations[0].detectedSourceLanguage;

                // If it was already English, translate to Spanish instead
                if (det === 'en') {
                    translations = await translateTexts([newClassName], "es");
                }

                if (translations && translations.length === 1) {
                    setNewClassName(translations[0].translatedText);
                }
            }
        } catch (error) {
            console.error("Translation error:", error);
            Alert.alert("Error", "Error al traducir.");
        } finally {
            setIsTranslatingClassName(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={classes}
                keyExtractor={(item) => item}
                numColumns={2}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.classCard, { backgroundColor: theme.card, borderColor: theme.glassBorder }]}
                        onPress={() => openClassDetail(item)}
                    >
                        <View style={[styles.classIcon, { backgroundColor: theme.primary + '20' }]}>
                            <Text style={styles.classIconText}>🎓</Text>
                        </View>
                        <Text style={[styles.className, { color: theme.text }]}>{item}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No existen clases creadas.</Text>
                    </View>
                }
            />

            <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => { setIsEditing(false); setModalVisible(true); }}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            {/* Create/Edit Class Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.glassBorder }]}>
                        <TouchableOpacity
                            style={styles.closeModalX}
                            onPress={() => {
                                setModalVisible(false);
                                setNewClassName("");
                                setSelectedStudents([]);
                                setIsEditing(false);
                            }}
                        >
                            <Text style={[styles.closeModalXText, { color: theme.textSecondary }]}>✕</Text>
                        </TouchableOpacity>

                        <Text style={[styles.modalTitle, { color: theme.text }]}>{isEditing ? `Sumar a ${selectedClass}` : "Nueva Clase"}</Text>

                        {!isEditing && (
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.glassBorder }]}
                                    placeholder="Nombre de la clase"
                                    value={newClassName}
                                    onChangeText={setNewClassName}
                                    placeholderTextColor={theme.textSecondary}
                                />
                                <TouchableOpacity
                                    style={styles.inlineTranslateBtn}
                                    onPress={handleTranslateClassName}
                                    disabled={isTranslatingClassName}
                                >
                                    {isTranslatingClassName ? (
                                        <ActivityIndicator size="small" color={theme.primary} />
                                    ) : (
                                        <Text style={[styles.translateBtnText, { color: theme.primary }]}>🌐 Traducir nombre</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        <Text style={[styles.label, { color: theme.textSecondary }]}>Buscar alumnos:</Text>
                        <View style={[styles.searchContainer, { backgroundColor: theme.background, borderColor: theme.primary }]}>
                            <TextInput
                                style={[styles.searchInput, { color: theme.text }]}
                                placeholder="Email del alumno..."
                                value={studentSearch}
                                onChangeText={handleSearch}
                                autoCapitalize="none"
                                placeholderTextColor={theme.textSecondary}
                            />
                            {isSearching && <ActivityIndicator style={styles.searchLoader} />}
                        </View>

                        {searchResults.length > 0 && (
                            <View style={[styles.resultsBox, { backgroundColor: theme.card, borderColor: theme.glassBorder }]}>
                                {searchResults.slice(0, 3).map(item => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.resultItem, { borderBottomColor: theme.glassBorder }]}
                                        onPress={() => addStudent(item)}
                                    >
                                        <Text style={[styles.resultText, { color: theme.text }]}>{item.email}</Text>
                                        <Text style={[styles.resultSubText, { color: theme.textSecondary }]}>{item.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={styles.selectedContainer}>
                            {selectedStudents.map(s => (
                                <View key={s.id} style={[styles.chip, { backgroundColor: theme.primary }]}>
                                    <Text style={styles.chipText}>{s.name || s.email}</Text>
                                    <TouchableOpacity onPress={() => removeSelectedStudent(s.id)}>
                                        <Text style={styles.chipClose}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.secondary }]} onPress={handleSaveClass}>
                            <Text style={styles.saveButtonText}>{isEditing ? "Agregar Alumnos" : "Crear Clase"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Class Detail Modal */}
            <Modal visible={detailVisible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContentDetail, { backgroundColor: theme.card, borderColor: theme.glassBorder }]}>
                        <TouchableOpacity style={styles.closeModalX} onPress={() => setDetailVisible(false)}>
                            <Text style={[styles.closeModalXText, { color: theme.textSecondary }]}>✕</Text>
                        </TouchableOpacity>

                        <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedClass}</Text>

                        <View style={styles.detailHeader}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Alumnos:</Text>
                            <TouchableOpacity style={[styles.addSmallBtn, { backgroundColor: theme.primary }]} onPress={openAddMoreStudents}>
                                <Text style={styles.addSmallBtnText}>+ Sumar</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.studentList}>
                            {classStudents.map(s => (
                                <View key={s.id} style={[styles.studentItem, { borderBottomColor: theme.glassBorder }]}>
                                    <View>
                                        <Text style={[styles.studentName, { color: theme.text }]}>{s.name}</Text>
                                        <Text style={[styles.studentEmail, { color: theme.textSecondary }]}>{s.email}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.removeBtn, { backgroundColor: theme.error + '20' }]}
                                        onPress={() => handleDeleteStudent(s.id)}
                                    >
                                        <Text style={[styles.removeBtnText, { color: theme.error }]}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.closeBtn, { backgroundColor: theme.primary }]}
                            onPress={() => {
                                setDetailVisible(false);
                                loadClasses();
                            }}
                        >
                            <Text style={styles.closeBtnText}>Volver</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, width: "100%" },
    loader: { flex: 1, justifyContent: "center" },
    list: { padding: 15, paddingBottom: 100 },
    classCard: {
        flex: 1,
        margin: 8,
        padding: 25,
        borderRadius: 25,
        alignItems: "center",
        borderWidth: 1,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    classIcon: { width: 70, height: 70, borderRadius: 35, justifyContent: "center", alignItems: "center", marginBottom: 15 },
    classIconText: { fontSize: 32 },
    className: { fontSize: 17, fontWeight: "800", textAlign: "center" },
    fab: { position: "absolute", right: 25, bottom: 30, width: 65, height: 65, borderRadius: 32, justifyContent: "center", alignItems: "center", elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
    fabIcon: { fontSize: 36, color: "#fff", fontWeight: "bold" },
    emptyContainer: { marginTop: 120, alignItems: "center" },
    emptyText: { fontSize: 18, fontWeight: "500" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
    modalContent: { width: "92%", padding: 25, borderRadius: 32, maxHeight: "85%", borderWidth: 1 },
    modalContentDetail: { width: "92%", padding: 25, borderRadius: 32, maxHeight: "85%", borderWidth: 1 },
    closeModalX: { position: "absolute", top: 20, right: 20, padding: 10, zIndex: 100 },
    closeModalXText: { fontSize: 24, fontWeight: "bold" },
    modalTitle: { fontSize: 26, fontWeight: "800", marginBottom: 25, textAlign: "center", paddingHorizontal: 30 },
    detailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    addSmallBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15 },
    addSmallBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
    inputWrapper: { marginBottom: 20, width: '100%' },
    input: { padding: 18, borderRadius: 18, fontSize: 17, borderWidth: 1, marginBottom: 12 },
    inlineTranslateBtn: {
        alignSelf: 'flex-end',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginTop: -10,
        marginBottom: 5,
    },
    translateBtnText: {
        fontSize: 13,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    label: { fontSize: 15, fontWeight: "800", marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
    searchContainer: { flexDirection: "row", alignItems: "center", borderRadius: 18, borderWidth: 1.5 },
    searchInput: { flex: 1, padding: 18, fontSize: 17 },
    searchLoader: { paddingRight: 15 },
    resultsBox: { borderRadius: 18, marginTop: 10, elevation: 15, maxHeight: 220, borderWidth: 1, zIndex: 50 },
    resultItem: { padding: 15, borderBottomWidth: 1 },
    resultText: { fontSize: 17, fontWeight: "700" },
    resultSubText: { fontSize: 13, marginTop: 2 },
    selectedContainer: { flexDirection: "row", flexWrap: "wrap", marginVertical: 15, minHeight: 10 },
    chip: { flexDirection: "row", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, margin: 5, alignItems: "center" },
    chipText: { color: "#fff", fontSize: 14, fontWeight: "700", marginRight: 8 },
    chipClose: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    saveButton: { padding: 20, borderRadius: 22, alignItems: "center", elevation: 4, marginTop: 10 },
    saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "900" },
    studentList: { maxHeight: 350 },
    studentItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1 },
    studentName: { fontSize: 17, fontWeight: "700" },
    studentEmail: { fontSize: 14, marginTop: 2 },
    removeBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    removeBtnText: { fontSize: 13, fontWeight: "800" },
    closeBtn: { marginTop: 20, padding: 18, borderRadius: 20, alignItems: "center" },
    closeBtnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
});
