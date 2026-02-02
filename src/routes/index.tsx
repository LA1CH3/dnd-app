import * as fs from 'node:fs';
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const filePath = 'count.txt';

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, 'utf-8').catch(() => '0'),
  );
}

const getCount = createServerFn({
  method: 'GET',
}).handler(() => {
  return readCount();
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

  return (
    <button
      type="button"
      onClick={() => {
        mutate(1);
      }}
      disabled={isPending}
    >
      Add 1 to {data}
    </button>
  );
}
