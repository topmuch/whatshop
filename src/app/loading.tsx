export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-black dark:border-t-white" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">
          Chargement…
        </p>
      </div>
    </div>
  );
}