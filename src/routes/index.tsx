import * as fs from 'node:fs';
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createDatabaseFunction } from '../serverFns/database';
import { users } from '../db/schema';

const filePath = 'count.txt';

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, 'utf-8').catch(() => '0'),
  );
}

const getCount = createDatabaseFunction().handler(async ({ context }) => {
  const usersData = await context.db.select().from(users);

  console.log('usersData', usersData);

  return usersData;
});

const countQuery = queryOptions({
  queryKey: ['count'],
  queryFn: () => getCount(),
});

const updateCount = createServerFn({ method: 'POST' })
  .inputValidator((d: number) => d)
  .handler(async ({ data }) => {
    console.log('hello');
    const count = await readCount();
    await fs.promises.writeFile(filePath, `${count + data}`);
    console.log('done');
  });

export const Route = createFileRoute('/')({
  component: Home,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(countQuery);
  },
});

function Home() {
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(countQuery);

  const { mutate, isPending } = useMutation({
    mutationFn: (amount: number) => updateCount({ data: amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['count'] });
    },
  });

  return data.map((user) => user.name);
}
