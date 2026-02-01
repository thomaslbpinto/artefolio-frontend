import { useAuth } from '@/contexts/auth.context';

export default function HomePage() {
  const { logout } = useAuth();

  return (
    <>
      <h1>Home</h1>
      <button onClick={logout}>Logout</button>
    </>
  );
}
