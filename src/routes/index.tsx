import { useState } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form-start';
import { createServerFn } from '@tanstack/react-start';
import { authClient } from '../lib/auth-client';
import { auth } from '../lib/auth';
import { generateGroupId } from '../lib/group-id';
import { db } from '../lib/db';
import { group } from '../db/schema';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';

const createGroup = createServerFn({ method: 'POST' })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    const MAX_RETRIES = 3;

    for (let i = 0; i < MAX_RETRIES; i++) {
      const groupId = generateGroupId();
      try {
        const result = await auth().api.signUpEmail({
          body: {
            name: groupId,
            email: `${groupId.toLowerCase()}@group.local`,
            password: data.password,
            username: groupId,
          },
        });

        await db().insert(group).values({ id: result.user.id });

        return { groupId };
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : '';
        if (msg.includes('already taken') && i < MAX_RETRIES - 1) continue;
        throw error;
      }
    }
    throw new Error('Failed to generate unique group ID');
  });

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [mode, setMode] = useState<'login' | 'create'>('login');

  return (
    <div>
      <h1>DND Campaign Tracker</h1>
      <div>
        <Button
          variant={mode === 'login' ? 'primary' : 'secondary'}
          onClick={() => setMode('login')}
        >
          Join Group
        </Button>
        <Button
          variant={mode === 'create' ? 'primary' : 'secondary'}
          onClick={() => setMode('create')}
        >
          Create Group
        </Button>
      </div>

      {mode === 'login' ? <LoginForm /> : <CreateGroupForm />}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { groupId: '', password: '' },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signIn.username({
        username: value.groupId.toUpperCase(),
        password: value.password,
      });
      if (error) {
        setError(error.message ?? 'Invalid group ID or password');
        return;
      }
      router.navigate({ to: '/dashboard' });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <fieldset>
        <legend>Join Existing Group</legend>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form.Field name="groupId">
          {(field) => (
            <TextField
              label="Group Code"
              name="groupId"
              type="text"
              placeholder="e.g. XK7M2P"
              maxLength={6}
              value={field.state.value}
              onChange={(e) =>
                field.handleChange(e.target.value.toUpperCase())
              }
            />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <TextField
              label="Password"
              name="login-password"
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
        <form.Subscribe
          selector={(formState) => [
            formState.canSubmit,
            formState.isSubmitting,
          ]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              Join
            </Button>
          )}
        </form.Subscribe>
      </fieldset>
    </form>
  );
}

function CreateGroupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { password: '' },
    onSubmit: async ({ value }) => {
      try {
        const result = await createGroup({
          data: { password: value.password },
        });
        setCreatedGroupId(result.groupId);
        await authClient.signIn.username({
          username: result.groupId,
          password: value.password,
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to create group');
      }
    },
  });

  if (createdGroupId) {
    return (
      <div>
        <h2>Group Created!</h2>
        <p>
          Your group code is: <strong>{createdGroupId}</strong>
        </p>
        <p>Share this code and password with your party members.</p>
        <Button onClick={() => router.navigate({ to: '/dashboard' })}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <fieldset>
        <legend>Create New Group</legend>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <p>A unique group code will be generated for you.</p>
        <form.Field name="password">
          {(field) => (
            <TextField
              label="Group Password"
              name="create-password"
              type="password"
              placeholder="Choose a password to share with your party"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
        <Button type="submit">Create Group</Button>
      </fieldset>
    </form>
  );
}
