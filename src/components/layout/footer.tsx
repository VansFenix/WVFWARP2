export function Footer() {
  return (
    <footer className="text-center py-7 text-[11px] text-[var(--text-dim)]">
      <span className="footer-mark">WVF<span>WARP</span></span>
      <span className="mx-2 opacity-40">·</span>
      {new Date().getFullYear()}
    </footer>
  );
}
