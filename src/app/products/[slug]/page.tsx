import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ProductSkeleton, ProductView } from '@/features/catalog/components/product-view';
import { getProduct } from '@/features/catalog/queries';

export async function generateMetadata({
  params,
}: PageProps<'/products/[slug]'>): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return product
    ? { title: product.name, description: product.tagline }
    : { title: 'Product not found' };
}

export default function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent params={params} />
      </Suspense>
    </div>
  );
}

async function ProductContent({ params }: Pick<PageProps<'/products/[slug]'>, 'params'>) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  return <ProductView product={product} />;
}
