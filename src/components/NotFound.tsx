/**
 * 404 Not Found page component
 */
export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="bg-linear-to-r from-cyan-400 to-fuchsia-500 bg-clip-text font-extrabold text-9xl text-transparent">
          404
        </h1>
        <h2 className="font-bold text-3xl text-white">Page Not Found</h2>
        <p className="text-gray-400">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="#"
          className="inline-block rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-8 py-3 font-semibold text-white transition-transform hover:scale-105"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
