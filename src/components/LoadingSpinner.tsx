export default function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div
        style={{
          width: '2rem',
          height: '2rem',
          border: '3px solid #e5e7eb',
          borderTopColor: '#1a56db',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
