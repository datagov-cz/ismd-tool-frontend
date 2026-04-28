const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/popisujeme';

export default function ApiDocsPage() {
  return (
    <iframe
      src={`${BASE_PATH}/swagger-ui/index.html`}
      title="API documentation"
      style={{
        position: 'fixed',
        inset: 0,
        border: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
      }}
    />
  );
}
