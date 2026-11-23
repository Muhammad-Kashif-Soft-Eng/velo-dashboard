import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, pageCount, onPageChange, label }) {
    return (
        <nav aria-label={`${label} pagination`} className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
            <p className="text-sm text-slate-500" aria-live="polite">
                Page {currentPage} of {pageCount}
            </p>
            <div className="flex items-center gap-2">
                <button
                    aria-label={`Previous ${label} page`}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    type="button"
                >
                    <ChevronLeft size={16} aria-hidden="true" />
                    Previous
                </button>
                <button
                    aria-label={`Next ${label} page`}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentPage >= pageCount}
                    onClick={() => onPageChange(currentPage + 1)}
                    type="button"
                >
                    Next
                    <ChevronRight size={16} aria-hidden="true" />
                </button>
            </div>
        </nav>
    );
}
