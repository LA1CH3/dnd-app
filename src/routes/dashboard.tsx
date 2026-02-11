import { createFileRoute, redirect } from '@tanstack/react-router';
import { authClient } from '../lib/auth-client';
import { getSession } from '../lib/auth-session';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: '/' });
    }
    return { session };
  },
  component: Dashboard,
});

function Dashboard() {
  const { session } = Route.useRouteContext();

  return (
    <div>
      <h1>Group: {session.user.username}</h1>
      <p>Welcome to your campaign!</p>
      <button
        onClick={async () => {
          await authClient.signOut();
          window.location.href = '/';
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
