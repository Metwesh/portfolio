/**
 * Loading screen component shown while app is initializing
 */
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center">
        <div className="relative mx-auto mb-6 h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-cyan-500"></div>
        </div>
        <p className="animate-pulse bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-xl font-semibold text-transparent">
          Loading...
        </p>
      </div>
    </div>
  );
}
