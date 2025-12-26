import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://backends-node-app-englishcards.ynhtge.easypanel.host";

async function getAuthHeaders() {
    try {
        const token = await AsyncStorage.getItem("userToken");
        const headers = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
    } catch (e) {
        console.error("Error getting auth headers:", e);
        return { "Content-Type": "application/json" };
    }
}

export async function register(email, name, password, role, institucion) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name, password, role, institucion }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error en el registro");
        return data;
    } catch (error) {
        console.error("Register error:", error);
        throw error;
    }
}

export async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error en el login");
        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

export async function getCards() {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cards`, { headers });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error fetching cards: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("getCards error:", error.message);
        return [];
    }
}

export async function addCard(pregunta, respuesta, selectedClase = null) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cards`, {
            method: "POST",
            headers,
            body: JSON.stringify({ pregunta, respuesta, selectedClase }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error adding card: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("addCard error:", error.message);
        return null;
    }
}

export async function updateCard(id, pregunta, respuesta) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cards/${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ pregunta, respuesta }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error updating card: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("updateCard error:", error.message);
        return null;
    }
}

export async function toggleArchiveCard(id, isActive) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cards/${id}/toggle-archive`, {
            method: "POST",
            headers,
            body: JSON.stringify({ is_active: isActive ? 1 : 0 }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error toggling archive: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("toggleArchiveCard error:", error.message);
        return null;
    }
}

export async function batchUpdateArchive(updates) {
    if (!updates || updates.length === 0) return { success: true, count: 0 };
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cards/batch-archive`, {
            method: "POST",
            headers,
            body: JSON.stringify({ updates }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error in batch update: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("batchUpdateArchive error:", error.message);
        throw error;
    }
}

// --- TEACHER SERVICES ---

export async function searchStudents(query) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/teachers/students/search?q=${encodeURIComponent(query)}`, { headers });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("searchStudents error:", error);
        return [];
    }
}

export async function getTeacherClasses() {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/teachers/classes`, { headers });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("getTeacherClasses error:", error);
        return [];
    }
}

export async function getClassStudents(className) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/teachers/classes/${encodeURIComponent(className)}/students`, { headers });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("getClassStudents error:", error);
        return [];
    }
}

export async function assignStudentsToClass(className, studentIds) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/teachers/classes`, {
            method: "POST",
            headers,
            body: JSON.stringify({ className, studentIds }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error al asignar alumnos");
        return data;
    } catch (error) {
        console.error("assignStudentsToClass error:", error);
        throw error;
    }
}

export async function removeStudentFromClass(className, studentId) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/teachers/classes/${encodeURIComponent(className)}/students/${studentId}`, {
            method: "DELETE",
            headers,
        });
        if (!response.ok) throw new Error("Error al eliminar alumno");
        return await response.json();
    } catch (error) {
        console.error("removeStudentFromClass error:", error);
        throw error;
    }
}
