export default function CatalogLayout({ children }: LayoutProps<'/catalog'>) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="mb-10">
        <p className="label-mono">Wholesale catalogue · 2026</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight">Catalogue.</h1>
        <p className="mt-3 text-lg text-muted italic">Every product, by category.</p>
      </header>
      {children}
    </div>
  );
}
