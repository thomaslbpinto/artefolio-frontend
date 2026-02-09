import { useAuth } from '@/contexts/auth.context';

export default function HomePage() {
  const { signOut } = useAuth();

  return (
    <>
      <h1>Home</h1>
      <button onClick={signOut}>Sign out</button>
    </>
  );
}
