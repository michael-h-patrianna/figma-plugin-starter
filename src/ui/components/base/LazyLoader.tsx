import { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Spinner } from './Spinner';

interface LazyLoaderProps {
  loader: () => Promise<any>;
  fallback?: ComponentChildren;
  children: (component: any) => ComponentChildren;
}

/**
 * LazyLoader component for dynamic imports with loading states
 */
export function LazyLoader({ loader, fallback, children }: LazyLoaderProps) {
  const [component, setComponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        const module = await loader();

        if (!cancelled) {
          setComponent(module);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load component');
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      cancelled = true;
    };
  }, [loader]);

  if (loading) {
    return fallback || (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <Spinner size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#ff4444'
      }}>
        Error loading component: {error}
      </div>
    );
  }

  return component ? children(component) : null;
}
