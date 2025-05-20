import SkeletonSection from './SkeletonSection';

export default function ActivityPageSkeleton() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Gerenciar Sessão
      </h1>
      <SkeletonSection />
    </section>
  );
}
