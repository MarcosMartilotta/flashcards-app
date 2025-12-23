import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    TouchableWithoutFeedback,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.7;

export default function Sidebar({ isOpen, onClose, onLogout, onNavigate, userName }) {
    const translateX = useSharedValue(-SIDEBAR_WIDTH);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            translateX.value = withTiming(0, { duration: 300 });
        } else {
            translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 300 }, (finished) => {
                if (finished) {
                    runOnJS(setIsVisible)(false);
                }
            });
        }
    }, [isOpen]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const backdropStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isOpen ? 1 : 0, { duration: 300 }),
        };
    });

    if (!isVisible && !isOpen) return null;

    return (
        <View style={styles.container} pointerEvents={isOpen ? "auto" : "none"}>
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[styles.backdrop, backdropStyle]} />
            </TouchableWithoutFeedback>
            <Animated.View style={[styles.sidebar, animatedStyle]}>
                <View style={styles.header}>
                    <Text style={styles.userIcon}>👤</Text>
                    <Text style={styles.userName}>{userName || "Usuario"}</Text>
                </View>

                <View style={styles.menu}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            onNavigate("flashcards");
                            onClose();
                        }}
                    >
                        <Text style={styles.menuText}>🏠 Inicio</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            onNavigate("list");
                            onClose();
                        }}
                    >
                        <Text style={styles.menuText}>📚 Mis cards</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <Text style={styles.logoutText}>🚪 Cerrar Sesión</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 99999,
        elevation: 99999, // Crucial for Android
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    sidebar: {
        width: SIDEBAR_WIDTH,
        height: "100%",
        backgroundColor: "#fff",
        paddingTop: 60,
        paddingHorizontal: 20,
        elevation: 100,
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        paddingBottom: 20,
    },
    userIcon: {
        fontSize: 50,
        marginBottom: 10,
    },
    userName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1e293b",
    },
    menu: {
        flex: 1,
    },
    menuItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    menuText: {
        fontSize: 16,
        color: "#334155",
        fontWeight: "500",
    },
    logoutButton: {
        marginBottom: 50,
        paddingVertical: 15,
        backgroundColor: "#fee2e2",
        borderRadius: 12,
        alignItems: "center",
    },
    logoutText: {
        color: "#ef4444",
        fontSize: 16,
        fontWeight: "bold",
    },
});
