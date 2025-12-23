import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform } from "react-native";
import { useEffect, useState, useRef } from "react";
import { getCards, addCard, updateCard, toggleArchiveCard, batchUpdateArchive } from "./services/service";
import FlashCard from "./components/FlashCard";
import CardModal from "./components/CardModal";
import RegistrationFlow from "./components/RegistrationFlow";
import Sidebar from "./components/Sidebar";
import CardList from "./components/CardList";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userName, setUserName] = useState("");
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // App State
  const [view, setView] = useState("flashcards"); // "flashcards" or "list"
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasPendingChanges = useRef(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false); // false = crear, true = editar
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = await AsyncStorage.getItem("userToken");
    const name = await AsyncStorage.getItem("userName");
    if (token) {
      setIsAuthenticated(true);
      setUserName(name || "");
      loadCards();
    }
    setAuthChecked(true);
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

  const handleSave = async (pregunta, respuesta) => {
    if (editMode && editingCard) {
      await updateCard(editingCard.id, pregunta, respuesta);
    } else {
      await addCard(pregunta, respuesta);
    }
    setModalVisible(false);
    await loadCards();
  };

  const handleArchiveToggle = async (cardId, isActive) => {
    // Immediate API call for study view swipe
    await toggleArchiveCard(cardId, isActive);
    await loadCards();
  };

  const handleLocalToggle = (cardId, isActive) => {
    // Local update for the list view
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
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userName");
    setIsAuthenticated(false);
    setSidebarOpen(false);
    setCards([]);
    setView("flashcards");
  };

  if (!authChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <RegistrationFlow onComplete={() => {
      checkAuth();
    }} />;
  }

  const activeCards = cards.filter(c => c.is_active === 1);
  const currentCard = cards[currentCardIndex];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.mainArea}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setSidebarOpen(true)}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{view === "flashcards" ? "Flashcards AI" : "Mis Tarjetas"}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {view === "flashcards" ? (
            <>
              {activeCards.length > 0 && currentCard ? (
                <>
                  <Text style={styles.subtitle}>Aprende inglés de forma inteligente</Text>
                  <FlashCard
                    card={currentCard}
                    onLongPress={() => openEditModal()}
                    onEdit={() => openEditModal()}
                    onArchive={() => handleArchiveToggle(currentCard.id, false)}
                  />
                  <View style={styles.buttonsRow}>
                    <TouchableOpacity style={styles.insertButton} onPress={openInsertModal}>
                      <Text style={styles.insertButtonText}>+ Agregar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleNextCard}>
                      <Text style={styles.buttonText}>Siguiente</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.emptyPrompt}>
                  <Text style={styles.emptyText}>No tienes tarjetas activas.</Text>
                  <TouchableOpacity style={styles.primaryButton} onPress={openInsertModal}>
                    <Text style={styles.buttonText}>Crear una nueva</Text>
                  </TouchableOpacity>
                  {cards.length > activeCards.length && (
                    <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setView("list")}>
                      <Text style={{ color: "#3b82f6", textDecorationLine: "underline" }}>Ver tarjetas aprendidas</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          ) : (
            <CardList cards={cards} onEdit={(card) => openEditModal(card)} onToggleLocal={handleLocalToggle} />
          )}
        </View>
      </SafeAreaView>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        onNavigate={changeView}
        userName={userName}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  mainArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 28,
    color: "#1e293b",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 40,
    gap: 15,
  },
  insertButton: {
    backgroundColor: "#10b981",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 3,
  },
  insertButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#64748b",
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  }
});
