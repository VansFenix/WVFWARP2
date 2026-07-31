import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-[72px] font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent mb-4">
          404
        </h1>
        <p className="text-[var(--text-muted)] mb-6">Страница не найдена</p>
        <Link href="/" className="text-[var(--accent)] hover:underline">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
