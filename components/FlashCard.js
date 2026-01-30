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
import * as Speech from 'expo-speech';

const SWIPE_THRESHOLD = 120;
const { width, height } = Dimensions.get("window");

export default function FlashCard({ card, onLongPress, onEdit, onArchive, onNext, theme }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const rotation = useSharedValue(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const exitRotation = useSharedValue(0);
    const opacity = useSharedValue(1);

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
        const borderColor = interpolate(
            translateX.value,
            [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
            [1, 0, 1],
            Extrapolation.CLAMP
        );

        const colorMode = translateX.value > 0
            ? `rgba(16, 185, 129, ${borderColor})` // Green for right
            : `rgba(239, 68, 68, ${borderColor})`; // Red for left

        return {
            opacity: opacity.value,
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotateY: `${rotation.value}deg` },
                { rotate: `${exitRotation.value}deg` },
            ],
            borderWidth: 2,
            borderColor: borderColor > 0 ? colorMode : theme.glassBorder,
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: borderColor * 0.4 + 0.1,
            shadowRadius: 20,
            elevation: borderColor * 10 + 2,
        };
    });

    const badgeStyle = useAnimatedStyle(() => {
        const badgeOpacity = interpolate(
            translateX.value,
            [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
            [0, 0.5, 1],
            Extrapolation.CLAMP
        );
        return {
            opacity: badgeOpacity,
            transform: [
                { scale: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.8, 1.1], Extrapolation.CLAMP) },
                { rotateY: `${-rotation.value}deg` }
            ],
        };
    });

    const practiceBadgeStyle = useAnimatedStyle(() => {
        const badgeOpacity = interpolate(
            translateX.value,
            [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
            [1, 0.5, 0],
            Extrapolation.CLAMP
        );
        return {
            opacity: badgeOpacity,
            transform: [
                { scale: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1.1, 0.8], Extrapolation.CLAMP) },
                { rotateY: `${-rotation.value}deg` }
            ],
        };
    });

    const textAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotateY: `${-rotation.value}deg` }],
    }));

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

    const handleSpeak = () => {
        const textToSpeak = showAnswer ? card.respuesta : card.pregunta;
        Speech.stop();
        Speech.speak(textToSpeak, {
            language: 'en-US',
            rate: 0.8,
        });
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
        })
        .onEnd((event) => {
            if (event.translationX > SWIPE_THRESHOLD) {
                // Swipe Right -> ARCHIVE
                translateX.value = withTiming(width * 1.5, { duration: 400 });
                translateY.value = withTiming(height * 0.5, { duration: 400 });
                exitRotation.value = withTiming(30, { duration: 400 });
                opacity.value = withTiming(0, { duration: 300 }, (finished) => {
                    if (finished) runOnJS(onArchive)();
                });
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                // Swipe Left -> NEXT
                translateX.value = withTiming(-width * 1.5, { duration: 400 });
                translateY.value = withTiming(height * 0.5, { duration: 400 });
                exitRotation.value = withTiming(-30, { duration: 400 });
                opacity.value = withTiming(0, { duration: 300 }, (finished) => {
                    if (finished) runOnJS(onNext)();
                });
            } else {
                translateX.value = withTiming(0, { duration: 200 });
            }
        });

    return (
        <View style={styles.cardWrapper}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[
                    styles.cardContainer,
                    { backgroundColor: theme.card },
                    animatedStyle
                ]}>
                    <TouchableOpacity
                        style={styles.cardTouchable}
                        activeOpacity={1}
                        onPress={flipCard}
                        onLongPress={onLongPress}
                        delayLongPress={2000}
                    >
                        {/* Learned Badge */}
                        <Animated.View style={[styles.learnedBadge, badgeStyle]}>
                            <Text style={styles.learnedText}>¡APRENDIDO!</Text>
                        </Animated.View>

                        {/* Practice Badge */}
                        <Animated.View style={[styles.practiceBadge, practiceBadgeStyle]}>
                            <Text style={styles.learnedText}>SEGUIR PRACTICANDO</Text>
                        </Animated.View>

                        <Animated.Text
                            style={[styles.cardText, { color: theme.text }, textAnimatedStyle]}
                            adjustsFontSizeToFit={true}
                            numberOfLines={12}
                            minimumFontScale={0.5}
                        >
                            {showAnswer ? card.respuesta : card.pregunta}
                        </Animated.Text>

                        <View style={styles.cardFooter}>
                            <Animated.Text style={[styles.tapHint, { color: theme.textSecondary }, textAnimatedStyle]}>
                                Toca para {isFlipped ? "ver pregunta" : "ver respuesta"}
                            </Animated.Text>
                        </View>

                        {/* Speaker Button - Top Left */}
                        <TouchableOpacity style={styles.speakerButton} onPress={handleSpeak}>
                            <Animated.Text style={[styles.speakerButtonText, textAnimatedStyle]}>
                                🔊
                            </Animated.Text>
                        </TouchableOpacity>

                        {/* Edit Button - Top Right */}
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

const HEIGHT_CARD = 480;

const styles = StyleSheet.create({
    cardWrapper: {
        width: width * 0.9,
        height: HEIGHT_CARD,
    },
    cardContainer: {
        flex: 1,
        borderRadius: 32,
        overflow: "hidden",
    },
    cardTouchable: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    learnedBadge: {
        position: "absolute",
        top: "40%",
        alignSelf: "center",
        backgroundColor: "#10b981",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 20,
        zIndex: 50,
        elevation: 8,
    },
    practiceBadge: {
        position: "absolute",
        top: "40%",
        alignSelf: "center",
        backgroundColor: "#ef4444",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 20,
        zIndex: 50,
        elevation: 8,
    },
    learnedText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "900",
        letterSpacing: 1,
        textAlign: 'center',
    },
    cardText: {
        fontSize: 32,
        textAlign: "center",
        fontWeight: "700",
        lineHeight: 40,
    },
    cardFooter: {
        position: 'absolute',
        bottom: 30,
    },
    tapHint: {
        fontSize: 13,
        fontWeight: "600",
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.6,
    },
    speakerButton: {
        position: "absolute",
        top: 25,
        left: 25,
        padding: 10,
        zIndex: 10,
    },
    speakerButtonText: {
        fontSize: 22,
    },
    editButton: {
        position: "absolute",
        top: 25,
        right: 25,
        padding: 10,
        zIndex: 10,
    },
    editButtonText: {
        fontSize: 22,
    },
});
