# Flashcards AI 🧠✨

¡Bienvenido a **Flashcards AI**! La plataforma definitiva para dominar el inglés de forma inteligente, conectando a profesores y alumnos a través de una experiencia móvil premium y moderna.

---

## 🚀 Propósito del Proyecto

El objetivo de **Flashcards AI** es revolucionar la forma en que los estudiantes de idiomas interactúan con el vocabulario y los conceptos nuevos. A diferencia de las aplicaciones de tarjetas tradicionales, nuestra plataforma integra una **jerarquía educativa completa**:

1.  **Aprendizaje Inteligente**: Los alumnos pueden estudiar mediante un sistema de flashcards con gestos táctiles fluidos (swipe & flip).
2.  **Gestión Académica**: Los profesores pueden crear clases, gestionar alumnos de instituciones específicas y distribuir contenido educativo de manera instantánea.
3.  **Aislamiento Institucional**: El sistema está diseñado para que cada profesor trabaje dentro del marco de su propia escuela o instituto, visualizando solo a sus alumnos y clases correspondientes.

---

## ✨ Características Destacadas

### 👩‍🎓 Para el Alumno
- **Gestos Intuitivos**: Toca la tarjeta para ver la respuesta, desliza a la derecha para marcar como aprendida.
- **Modos de Visualización**: Estudia con cartas dinámicas o revisa tu colección completa en una lista organizada.
- **Progreso Personalizado**: El sistema de archivado permite enfocarse solo en lo que falta aprender.

### 👨‍🏫 Para el Profesor
- **Control de Clases**: Crea aulas virtuales personalizadas (ej. "Inglés Avanzado", "Business English").
- **Asignación de Alumnos**: Busca alumnos por email y agrégalos a tus grupos de estudio.
- **Distribución de Tarjetas**: Crea una tarjeta y decide si es para ti, para una clase específica o para todos tus alumnos a la vez.

### 🎨 Diseño y Experiencia (UI/UX)
- **Glassmorphism Style**: Una interfaz futurista basada en transparencias, desenfoques y sombras suaves.
- **Tema Dual**: Soporte completo para **Modo Oscuro** y **Modo Claro** con guardado persistente.
- **Animaciones Premium**: Transiciones impulsadas por *React Native Reanimated* para una experiencia de usuario de 60fps.

---

## 🛠️ Resumen Técnico

La aplicación utiliza un stack moderno y escalable para garantizar rendimiento y seguridad:

### **Mobile App (Frontend)**
- **React Native & Expo**: Desarrollo de aplicación nativa para iOS y Android.
- **Reanimated + Gesture Handler**: Manejo de gestos complejos y animaciones fluidas sin sacrificar rendimiento.
- **AsyncStorage**: Gestión de sesión y preferencias de tema de forma local.
- **Theme System**: Paleta de colores dinámica inyectada en todos los componentes.

### **Backend & API**
- **Node.js + Express**: Servidor de alta velocidad para la lógica de negocio.
- **MySQL**: Base de datos relacional para el manejo de usuarios, relaciones profesor-alumno y tarjetas.
- **JWT (JSON Web Tokens)**: Autenticación robusta y segura para proteger los datos de los usuarios.
- **Bcrypt**: Encriptación avanzada de contraseñas.

### **Infraestructura**
- **Arquitectura Multitenant**: Filtrado de base de datos basado en `institución` y `role` para garantizar la privacidad de los datos entre diferentes usuarios y escuelas.
- **RESTful API**: Endpoints optimizados para minimizar la transferencia de datos móviles.

---
*Desarrollado con pasión para elevar el estándar de la educación digital.*
