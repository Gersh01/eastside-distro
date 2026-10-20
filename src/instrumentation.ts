// Runs once when a Next.js server instance starts (see node_modules/next/dist/docs/01-app/02-guides/instrumentation.md).
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runBootTasks } = await import('./instrumentation-node');
    await runBootTasks();
  }
}
