'use client';

/**
 * Error boundary for the app. When something goes wrong during rendering,
 * this component is shown instead of a blank page or 404.
 * Required by Next.js App Router for proper error handling.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h2>Something went wrong</h2>
      <p style={{ margin: '1rem 0', color: '#666' }}>
        An error occurred while loading this page.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer',
          backgroundColor: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
        }}
      >
        Try again
      </button>
    </div>
  );
}
