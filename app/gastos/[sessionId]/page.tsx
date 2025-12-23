import App from '@/components/App';

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function SessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  return <App sessionId={sessionId} />;
}
