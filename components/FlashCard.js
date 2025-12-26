import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View, Text, Dimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const SWIPE_THRESHOLD = 120; // Positive for swipe right

const { width, height } = Dimensions.get("window");

export default function FlashCard({ card, onLongPress, onEdit, onArchive }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const rotation = useSharedValue(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const exitRotation = useSharedValue(0);
    const opacity = useSharedValue(1);

    // Reset state when card changes
    useEffect(() => {
        setIsFlipped(false);
        setShowAnswer(false);
        rotation.value = 0;
        translateX.value = 0;
        translateY.value = 0;
        exitRotation.value = 0;
        opacity.value = withTiming(1, { duration: 300 });
    }, [card]);

    const animatedStyle = useAnimatedStyle(() => {
        // Border color interpolation
        const borderColor = interpolate(
            translateX.value,
            [0, SWIPE_THRESHOLD],
            [0, 1],
            Extrapolation.CLAMP
        );

        return {
            opacity: opacity.value,
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotateY: `${rotation.value}deg` },
                { rotate: `${exitRotation.value}deg` },
            ],
            borderWidth: 4,
            borderColor: `rgba(16, 185, 129, ${borderColor})`, // #10b981 (green)
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: borderColor * 0.5,
            shadowRadius: borderColor * 15,
            elevation: borderColor * 10,
        };
    });

    const badgeStyle = useAnimatedStyle(() => {
        const badgeOpacity = interpolate(
            translateX.value,
            [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
            [0, 0.3, 0.6],
            Extrapolation.CLAMP
        );
        return {
            opacity: badgeOpacity,
            transform: [
                { scale: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.5, 1.2], Extrapolation.CLAMP) },
                { rotateY: `${-rotation.value}deg` }
            ],
        };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotateY: `${-rotation.value}deg` }],
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

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationX > 0) { // Only swipe right
                translateX.value = event.translationX;
            }
        })
        .onEnd((event) => {
            if (event.translationX > SWIPE_THRESHOLD) {
                // Exit animation: fall down-right with rotation
                translateX.value = withTiming(width * 1.5, { duration: 500 });
                translateY.value = withTiming(height, { duration: 500 });
                exitRotation.value = withTiming(45, { duration: 500 });
                opacity.value = withTiming(0, { duration: 400 }, (finished) => {
                    if (finished) {
                        runOnJS(onArchive)();
                    }
                });
            } else {
                translateX.value = withTiming(0, { duration: 200 });
            }
        });

    return (
        <View style={styles.card}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.cardContainer, animatedStyle]}>
                    <TouchableOpacity
                        style={styles.cardTouchable}
                        activeOpacity={0.8}
                        onPress={flipCard}
                        onLongPress={onLongPress}
                        delayLongPress={2000}
                    >
                        {/* Learned Badge */}
                        <Animated.View style={[styles.learnedBadge, badgeStyle]}>
                            <Text style={styles.learnedText}>LEARNED!</Text>
                        </Animated.View>

                        <Animated.Text
                            style={[styles.cardText, textAnimatedStyle]}
                            adjustsFontSizeToFit={true}
                            numberOfLines={12}
                            minimumFontScale={0.4}
                        >
                            {showAnswer ? card.respuesta : card.pregunta}
                        </Animated.Text>

                        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                            <Animated.Text style={[styles.editButtonText, textAnimatedStyle]}>
                                ✏️
                            </Animated.Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const HEIGHT_CARD = 500;

const styles = StyleSheet.create({
    card: {
        width: "100%",
        height: HEIGHT_CARD,
    },
    cardContainer: {
        flex: 1,
        borderRadius: 20,
        backgroundColor: "#fff",
        overflow: "hidden", // Important to contain the badge
    },
    cardTouchable: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    learnedBadge: {
        position: "absolute",
        top: "40%",
        alignSelf: "center",
        backgroundColor: "#10b981",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 15,
        zIndex: 20,
    },
    learnedText: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },
    cardText: {
        fontSize: 30,
        textAlign: "center",
        color: "#1e293b",
        fontWeight: "500",
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
