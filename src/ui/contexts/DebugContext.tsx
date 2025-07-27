import { sendToMain } from '@ui/messaging';
import { createContext } from 'preact';
import { useContext, useState } from 'preact/hooks';

/**
 * Debug context interface
 */
interface DebugContextValue {
  debugMode: boolean;
  setDebugMode: (enabled: boolean) => void;
}

/**
 * Debug context
 */
const DebugContext = createContext<DebugContextValue>({
  debugMode: false,
  setDebugMode: () => { }
});

/**
 * Debug provider component
 */
export function DebugProvider({ children }: { children: any }) {
  const [debugMode, setDebugModeState] = useState(false);

  const handleSetDebugMode = (enabled: boolean) => {
    setDebugModeState(enabled);
    // Send message to main thread
    sendToMain('SET_DEBUG_MODE', { enabled });
  };

  const contextValue: DebugContextValue = {
    debugMode,
    setDebugMode: handleSetDebugMode
  };

  return (
    <DebugContext.Provider value={contextValue}>
      {children}
    </DebugContext.Provider>
  );
}

/**
 * Hook to use debug context
 */
export function useDebug(): DebugContextValue {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}
