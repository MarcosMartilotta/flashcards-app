const API_URL = "https://backends-node-app-englishcards.ynhtge.easypanel.host";

export async function getCards() {
    try {
        const response = await fetch(`${API_URL}/cards`);
        if (!response.ok) {
            throw new Error(`Error fetching cards: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("getCards error:", error);
        return [];
    }
}

export async function addCard(pregunta, respuesta) {
    try {
        const response = await fetch(`${API_URL}/cards`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ pregunta, respuesta }),
        });
        if (!response.ok) {
            throw new Error(`Error adding card: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("addCard error:", error);
        return null;
    }
}

export async function updateCard(id, pregunta, respuesta) {
    try {
        const response = await fetch(`${API_URL}/cards/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ pregunta, respuesta }),
        });
        if (!response.ok) {
            throw new Error(`Error updating card: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("updateCard error:", error);
        return null;
    }
}
