import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ToastKind = 'success' | 'error' | 'info' | 'warning';
type Toast = { id: number; kind: ToastKind; message: string };

type ToastContextValue = {
  show: (message: string, kind?: ToastKind) => void;
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
  warning: (m: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const KIND_STYLES: Record<ToastKind, { bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { bg: 'bg-success', icon: 'checkmark-circle' },
  error: { bg: 'bg-danger', icon: 'alert-circle' },
  warning: { bg: 'bg-warning', icon: 'warning' },
  info: { bg: 'bg-secondary', icon: 'information-circle' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = ++idRef.current;
      setToasts((curr) => [...curr, { id, kind, message }]);
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
    warning: (m) => show(m, 'warning'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <SafeAreaView
        edges={['top']}
        pointerEvents="box-none"
        className="absolute top-0 left-0 right-0">
        <View className="px-4 pt-2 gap-2" pointerEvents="box-none">
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </View>
      </SafeAreaView>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  const s = KIND_STYLES[toast.kind];
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        onPress={onDismiss}
        className={`${s.bg} rounded-xl px-4 py-3 flex-row items-center gap-3 shadow`}>
        <Ionicons name={s.icon} size={20} color="#fff" />
        <Text className="flex-1 text-white text-sm font-medium">{toast.message}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
