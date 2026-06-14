import { useAuth } from "@/_core/hooks/useAuth";

export default function Feed() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Feed</h1>
        <p className="text-slate-600">Coming soon - Social feed with posts from users you follow</p>
      </div>
    </div>
  );
}
