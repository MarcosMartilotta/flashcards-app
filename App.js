import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, Dimensions } from "react-native";
import { useEffect, useState, useRef } from "react";
import { getCards, addCard, updateCard, toggleArchiveCard, batchUpdateArchive, getTeacherClasses } from "./services/service";
import FlashCard from "./components/FlashCard";
import CardModal from "./components/CardModal";
import ImportModal from "./components/ImportModal";
import RegistrationFlow from "./components/RegistrationFlow";
import Sidebar from "./components/Sidebar";
import CardList from "./components/CardList";
import ClassesView from "./components/ClassesView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme } from "./theme";

const { width } = Dimensions.get("window");

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [teacherClasses, setTeacherClasses] = useState([]);

  // App State
  const [view, setView] = useState("flashcards"); // "flashcards", "list", "classes"
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasPendingChanges = useRef(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false); // false = crear, true = editar
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    loadTheme();
    checkAuth();
  }, []);

  async function loadTheme() {
    const saved = await AsyncStorage.getItem("themeMode");
    if (saved) setIsDarkMode(saved === "dark");
  }

  const toggleTheme = async () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    await AsyncStorage.setItem("themeMode", newVal ? "dark" : "light");
  };

  async function checkAuth() {
    const token = await AsyncStorage.getItem("userToken");
    const userDataStr = await AsyncStorage.getItem("userData");
    if (token && userDataStr) {
      const userData = JSON.parse(userDataStr);
      setIsAuthenticated(true);
      setUser(userData);
      loadInitialData(userData);
    }
    setAuthChecked(true);
  }

  async function loadInitialData(userData) {
    loadCards();
    if (userData?.role === 'teacher') {
      const classes = await getTeacherClasses();
      setTeacherClasses(classes);
    }
  }

  async function loadCards() {
    const data = await getCards();
    if (data.length > 0) {
      setCards(data);
      const activeIndices = data.map((c, i) => (c.is_active === 1 ? i : -1)).filter(i => i !== -1);

      // If current card is missing or inactive, find a new active one
      if (activeIndices.length > 0) {
        const currentIsActive = data[currentCardIndex]?.is_active === 1;
        if (!currentIsActive) {
          const randomActive = activeIndices[Math.floor(Math.random() * activeIndices.length)];
          setCurrentCardIndex(randomActive);
        }
      }
    } else {
      setCards([]);
    }
  }

  const handleNextCard = () => {
    const activeIndices = cards.map((c, i) => (c.is_active === 1 ? i : -1)).filter(i => i !== -1);
    if (activeIndices.length <= 1) return;

    let nextIdx;
    do {
      nextIdx = activeIndices[Math.floor(Math.random() * activeIndices.length)];
    } while (nextIdx === currentCardIndex);

    setCurrentCardIndex(nextIdx);
  };

  const openInsertModal = () => {
    setEditMode(false);
    setEditingCard(null);
    setModalVisible(true);
  };

  const openEditModal = (cardOverride = null) => {
    const targetCard = cardOverride || cards[currentCardIndex];
    setEditMode(true);
    setEditingCard(targetCard);
    setModalVisible(true);
  };

  const handleSave = async (pregunta, respuesta, selectedClase = null) => {
    if (editMode && editingCard) {
      await updateCard(editingCard.id, pregunta, respuesta);
    } else {
      await addCard(pregunta, respuesta, selectedClase);
    }
    setModalVisible(false);
    await loadCards();
  };

  const handleArchiveToggle = async (cardId, isActive) => {
    await toggleArchiveCard(cardId, isActive);
    await loadCards();
  };

  const handleLocalToggle = (cardId, isActive) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, is_active: isActive ? 1 : 0 } : c));
    hasPendingChanges.current = true;
  };

  const syncPendingChanges = async () => {
    if (hasPendingChanges.current) {
      try {
        const updates = cards.map(c => ({ card_id: c.id, is_active: c.is_active }));
        await batchUpdateArchive(updates);
        hasPendingChanges.current = false;
      } catch (e) {
        console.error("Sync failed:", e);
        alert("No se pudo sincronizar el estado. Reintenta al salir de la lista.");
      }
      await loadCards();
    }
  };

  const changeView = async (newView) => {
    if (view === "list" && newView !== "list") {
      await syncPendingChanges();
    }
    setView(newView);
    if (newView === "classes") {
      const classes = await getTeacherClasses();
      setTeacherClasses(classes);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userName");
    await AsyncStorage.removeItem("userData");
    setIsAuthenticated(false);
    setUser(null);
    setSidebarOpen(false);
    setCards([]);
    setView("flashcards");
  };

  if (!authChecked) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <RegistrationFlow onComplete={() => checkAuth()} isDarkMode={isDarkMode} />;
  }

  const activeCards = cards.filter(c => c.is_active === 1);
  const currentCard = cards[currentCardIndex];
  const pageTitle = view === "flashcards" ? "Estudiar" : (view === "list" ? "Mis Tarjetas" : "Mis Clases");

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.mainArea}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />

        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setSidebarOpen(true)}>
            <Text style={[styles.iconText, { color: theme.text }]}>☰</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>{pageTitle}</Text>
            {view === 'flashcards' && activeCards.length > 0 && (
              <Text style={[styles.activeCount, { color: theme.textSecondary }]}>
                {activeCards.length} activas
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
            <Text style={[styles.iconText, { color: theme.text }]}>{isDarkMode ? "☀️" : "🌙"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {view === "flashcards" && (
            <>
              {activeCards.length > 0 && currentCard ? (
                <View style={styles.flashcardContainer}>
                  <FlashCard
                    card={currentCard}
                    onLongPress={() => openEditModal()}
                    onEdit={() => openEditModal()}
                    onArchive={() => handleArchiveToggle(currentCard.id, false)}
                    onNext={handleNextCard}
                    theme={theme}
                  />

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.glassButton, { backgroundColor: theme.primary }]}
                      onPress={handleNextCard}
                    >
                      <Text style={styles.mainBtnText}>Siguiente →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.glassButton, { backgroundColor: theme.secondary }]}
                      onPress={openInsertModal}
                    >
                      <Text style={styles.mainBtnText}>+ Crear</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyPrompt}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tienes tarjetas para estudiar.</Text>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                    onPress={openInsertModal}
                  >
                    <Text style={styles.mainBtnText}>Crear mi primera tarjeta</Text>
                  </TouchableOpacity>
                  {cards.length > 0 && (
                    <TouchableOpacity style={{ marginTop: 25 }} onPress={() => setView("list")}>
                      <Text style={{ color: theme.primary, fontWeight: '600' }}>Ver archivadas</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}

          {view === "list" && (
            <CardList
              cards={cards}
              onEdit={(card) => openEditModal(card)}
              onToggleLocal={handleLocalToggle}
              theme={theme}
            />
          )}

          {view === "classes" && user?.role === 'teacher' && (
            <ClassesView
              onBack={() => setView("flashcards")}
              theme={theme}
              onClassesUpdated={async () => {
                const updatedClasses = await getTeacherClasses();
                setTeacherClasses(updatedClasses);
              }}
            />
          )}
        </View>
      </SafeAreaView>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        onNavigate={changeView}
        onImport={() => setImportModalVisible(true)}
        user={user}
        theme={theme}
      />

      <CardModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        isEditing={editMode}
        initialData={
          editMode && editingCard
            ? { pregunta: editingCard.pregunta, respuesta: editingCard.respuesta }
            : null
        }
        user={user}
        classes={teacherClasses}
        theme={theme}
      />

      <ImportModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onImportSuccess={loadCards}
        classes={teacherClasses}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 25,
  },
  iconButton: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  iconText: {
    fontSize: 24,
  },
  titleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  activeCount: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  flashcardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'center',
    paddingBottom: 40,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 40,
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  glassButton: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 22,
    minWidth: 140,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  mainBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  emptyPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 25,
    textAlign: 'center',
  },
  primaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20,
    elevation: 4,
  }
});
