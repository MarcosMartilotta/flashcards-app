import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import avatars from "../assets/avatares";
import { Image } from "react-native";

const { width, height } = Dimensions.get("window");

export default function Sidebar({ isOpen, onClose, onLogout, onNavigate, onImport, user, theme }) {
    const translateX = useSharedValue(-width * 0.85);

    useEffect(() => {
        translateX.value = withTiming(isOpen ? 0 : -width * 0.85, {
            duration: 400,
        });
    }, [isOpen]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isOpen ? 1 : 0, { duration: 400 }),
    }));

    const MenuItem = ({ icon, label, onPress }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIconContainer, { backgroundColor: theme.primary + '15' }]}>
                <Text style={styles.menuIcon}>{icon}</Text>
            </View>
            <Text style={[styles.menuText, { color: theme.text }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, !isOpen && { pointerEvents: "none" }]}>
            <Animated.View style={[styles.overlay, overlayStyle]}>
                <TouchableOpacity style={styles.flex1} onPress={onClose} activeOpacity={1} />
            </Animated.View>

            <Animated.View style={[styles.drawer, { backgroundColor: theme.card, borderColor: theme.glassBorder }, animatedStyle]}>
                <TouchableOpacity style={styles.header} onPress={() => { onNavigate("profile"); onClose(); }}>
                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                        {user?.avatar ? (
                            <Image source={avatars[user.avatar]} style={styles.avatarImg} />
                        ) : (
                            <Text style={styles.avatarText}>{user?.name?.charAt(0) || "U"}</Text>
                        )}
                        <View style={styles.editBadge}>
                            <Text style={styles.editBadgeText}>✏️</Text>
                        </View>
                    </View>
                    <Text style={[styles.userName, { color: theme.text }]}>{user?.name || "Usuario"}</Text>
                    <View style={[styles.roleLabel, { backgroundColor: theme.primary + '20' }]}>
                        <Text style={[styles.userRole, { color: theme.primary }]}>
                            {user?.role === 'teacher' ? 'PROFESOR' : 'ALUMNO'}
                        </Text>
                    </View>
                    {user?.institucion && (
                        <Text style={[styles.instText, { color: theme.textSecondary }]}>
                            🏢 {user.institucion}
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={styles.menu}>
                    <MenuItem
                        icon="🔥"
                        label="Estudio Diario"
                        onPress={() => { onNavigate("flashcards"); onClose(); }}
                    />
                    <MenuItem
                        icon="📂"
                        label="Mi Colección"
                        onPress={() => { onNavigate("list"); onClose(); }}
                    />
                    {user?.role === 'teacher' && (
                        <MenuItem
                            icon="🎓"
                            label="Mis Clases"
                            onPress={() => { onNavigate("classes"); onClose(); }}
                        />
                    )}
                    {user?.role === 'teacher' && (
                        <MenuItem
                            icon="📥"
                            label="Importar Excel"
                            onPress={() => { onImport && onImport(); onClose(); }}
                        />
                    )}
                </View>

                <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.error + '15' }]} onPress={onLogout}>
                    <Text style={[styles.logoutText, { color: theme.error }]}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { ...StyleSheet.absoluteFillObject, zIndex: 1000 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
    flex1: { flex: 1 },
    drawer: {
        width: width * 0.85,
        height: "100%",
        padding: 25,
        paddingTop: 70,
        borderRightWidth: 1,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(150,150,150,0.1)',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    avatarText: { fontSize: 42, color: "#fff", fontWeight: "900" },
    avatarImg: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    editBadgeText: { fontSize: 14 },
    userName: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
    roleLabel: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 12,
        marginBottom: 10,
    },
    userRole: { fontSize: 12, fontWeight: "800", letterSpacing: 1 },
    instText: { fontSize: 14, fontWeight: "500" },
    menu: { flex: 1, gap: 10 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 18,
    },
    menuIconContainer: {
        width: 45,
        height: 45,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuIcon: { fontSize: 20 },
    menuText: { fontSize: 17, fontWeight: "700" },
    logoutButton: {
        marginTop: "auto",
        marginBottom: 30,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: "center",
    },
    logoutText: { fontSize: 16, fontWeight: "800" },
});
