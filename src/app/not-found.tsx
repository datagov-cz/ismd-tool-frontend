export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-white text-black dark:bg-diagram-canvas dark:text-gray-100">
      <div className="flex items-center">
        <h1 className="mr-5 border-r border-gray-300 pr-5 text-2xl font-medium dark:border-diagram-border-subtle">
          404
        </h1>
        <p className="text-sm">This page could not be found.</p>
      </div>
    </main>
  );
}
