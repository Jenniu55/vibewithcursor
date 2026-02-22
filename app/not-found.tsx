import Link from 'next/link';

/**
 * Shown when a route doesn't exist (404).
 * Keeps the same style as the rest of the app and links back home.
 */
export default function NotFound() {
  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Page not found</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          color: '#0066cc',
          textDecoration: 'underline',
        }}
      >
        ← Return to piano
      </Link>
    </div>
  );
}
