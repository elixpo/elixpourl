import Image from 'next/image';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error;
  const errorMsg =
    error === 'access_denied'
      ? 'Access was denied. Please try again.'
      : error === 'invalid_state'
        ? 'Invalid session. Please try again.'
        : error === 'server_error'
          ? 'Something went wrong. Please try again.'
          : '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-page">
      {/* Banner space - add banner image later */}
      <div className="w-full max-w-lg h-48 mb-8 rounded-2xl overflow-hidden flex items-center justify-center">
        {/* Banner image placeholder - replace src when ready */}
      </div>

      <div className="w-full max-w-sm text-center px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <Image
            src="/logo.png"
            alt="ElixpoURL"
            width={48}
            height={48}
            className="rounded-xl"
          />
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-1">
          <span className="text-lime-main">Elixpo</span>URL
        </h1>
        <p className="text-text-muted text-sm mb-8">
          URL shortener for the Elixpo ecosystem
        </p>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl text-sm" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
          }}>
            {errorMsg}
          </div>
        )}

        <a
          href="/api/auth/login"
          className="btn-lime w-full justify-center py-3 text-base rounded-xl no-underline flex items-center gap-3"
        >
          <Image
            src="/logo.png"
            alt=""
            width={20}
            height={20}
            className="rounded"
          />
          Sign in with Elixpo Accounts
        </a>

        <p className="text-text-disabled text-xs mt-8">
          By signing in, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
