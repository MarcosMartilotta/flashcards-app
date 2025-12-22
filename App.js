import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { getCards, addCard, updateCard } from "./services/service";
import FlashCard from "./components/FlashCard";
import CardModal from "./components/CardModal";

export default function App() {
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false); // false = crear, true = editar
  const [editingCardId, setEditingCardId] = useState(null);

  // -------------------------------------------------------
  // 1) Cargar tarjetas desde Backend Propio
  // -------------------------------------------------------
  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    const data = await getCards();
    if (data.length > 0) {
      setCards(data);
      setCurrentCardIndex(Math.floor(Math.random() * data.length));
    }
  }

  // -------------------------------------------------------
  // Nueva tarjeta aleatoria
  // -------------------------------------------------------
  const handleNextCard = () => {
    if (cards.length <= 1) return;

    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * cards.length);
    } while (newIndex === currentCardIndex);

    setCurrentCardIndex(newIndex);
  };

  if (cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Cargando tarjetas...</Text>
      </View>
    );
  }

  const currentCard = cards[currentCardIndex];

  // -------------------------------------------------------
  // Abrir modal para insertar NUEVA card
  // -------------------------------------------------------
  const openInsertModal = () => {
    setEditMode(false);
    setEditingCardId(null);
    setModalVisible(true);
  };

  // -------------------------------------------------------
  // Abrir modal para EDITAR card (long press 2s)
  // -------------------------------------------------------
  const openEditModal = () => {
    setEditMode(true);
    setEditingCardId(currentCard.id);
    setModalVisible(true);
  };

  // -------------------------------------------------------
  // Guardar en Backend (insert o update)
  // -------------------------------------------------------
  const handleSave = async (pregunta, respuesta) => {
    if (editMode) {
      await updateCard(editingCardId, pregunta, respuesta);
    } else {
      await addCard(pregunta, respuesta);
    }

    setModalVisible(false);
    await loadCards();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flashcards para aprender Inglés</Text>

      <FlashCard card={currentCard} onLongPress={openEditModal} onEdit={openEditModal} />

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.insertButton} onPress={openInsertModal}>
          <Text style={styles.insertButtonText}>Insertar nueva</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleNextCard}>
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>

      <CardModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        isEditing={editMode}
        initialData={
          editMode
            ? { pregunta: currentCard.pregunta, respuesta: currentCard.respuesta }
            : null
        }
      />

      <StatusBar style="auto" />
    </View>
  );
}

// -------------------------------------------------------
// STYLES
// -------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333",
  },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 40,
    gap: 10,
  },
  insertButton: {
    backgroundColor: "#10b981",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
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
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
