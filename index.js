import { registerRootComponent } from 'expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import App from './App';

function Main() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <App />
        </GestureHandlerRootView>
    );
}

registerRootComponent(Main);
