import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

export default function FlashCard({ card, onLongPress, onEdit }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const rotation = useSharedValue(0);

    // Reset state when card changes
    useEffect(() => {
        setIsFlipped(false);
        setShowAnswer(false);
        rotation.value = withTiming(0, { duration: 300 });
    }, [card]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotateY: `${rotation.value}deg`,
                },
            ],
        };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotateY: `${-rotation.value}deg`,
                },
            ],
        };
    });

    const flipCard = () => {
        if (isFlipped) {
            rotation.value = withTiming(0, { duration: 400 });
            setTimeout(() => setShowAnswer(false), 200);
        } else {
            rotation.value = withTiming(180, { duration: 400 });
            setTimeout(() => setShowAnswer(true), 200);
        }
        setIsFlipped(!isFlipped);
    };

    return (
        <Animated.View style={[styles.card, animatedStyle]}>
            <TouchableOpacity
                style={styles.cardTouchable}
                activeOpacity={0.8}
                onPress={flipCard}
                onLongPress={onLongPress}
                delayLongPress={2000}
            >
                <Animated.Text style={[styles.cardText, textAnimatedStyle]}>
                    {showAnswer ? card.respuesta : card.pregunta}
                </Animated.Text>

                <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                    <Animated.Text style={[styles.editButtonText, textAnimatedStyle]}>
                        ✏️
                    </Animated.Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        height: 500,
        perspective: 1000,
    },
    cardTouchable: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        elevation: 5,
    },
    cardText: {
        fontSize: 30,
        textAlign: "center",
        color: "#1e293b",
    },
    editButton: {
        position: "absolute",
        top: 15,
        right: 15,
        padding: 5,
        zIndex: 10,
    },
    editButtonText: {
        fontSize: 24,
    },
});
