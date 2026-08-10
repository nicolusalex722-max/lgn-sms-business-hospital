import { Construction, Clock3, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({
  title = "Coming Soon",
  description = "We're working hard to bring this feature to you. Please check back soon.",
}: ComingSoonProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full rounded-2xl border bg-white dark:bg-slate-900 shadow-lg p-10 text-center">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <Construction className="h-10 w-10 text-blue-600" />
        </div>

        <h1 className="text-3xl font-bold mb-4">
          {title}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {description}
        </p>

        <div className="flex justify-center items-center gap-2 text-blue-600 mb-8">
          <Clock3 className="h-5 w-5" />
          <span>Available in a future update</span>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}