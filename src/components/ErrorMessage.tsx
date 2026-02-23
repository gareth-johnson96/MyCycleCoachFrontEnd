interface Props {
  message: string;
}

export default function ErrorMessage({ message }: Props) {
  return (
    <div
      style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        fontSize: '0.9rem',
      }}
    >
      {message}
    </div>
  );
}
