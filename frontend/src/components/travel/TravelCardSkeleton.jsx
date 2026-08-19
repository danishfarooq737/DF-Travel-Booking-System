export default function TravelCardSkeleton() {
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="h-44 w-full animate-pulse bg-navy-100" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-navy-100" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-navy-100" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-navy-100" />
        <div className="mt-auto flex justify-between pt-4">
          <div className="h-5 w-16 animate-pulse rounded bg-navy-100" />
          <div className="h-4 w-16 animate-pulse rounded bg-navy-100" />
        </div>
      </div>
    </div>
  );
}
