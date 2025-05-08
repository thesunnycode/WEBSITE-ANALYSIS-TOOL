import { format } from "date-fns";
import { Eye, RefreshCw, Trash2, X } from "lucide-react";
import { Analysis, AnalysisStatus } from "@/types/analysis";

export const HealthScoreBadge = ({ score }: { score: number | null }) => {
  if (score === null) return null;

  let color = "";
  if (score >= 90) color = "bg-green-500";
  else if (score >= 70) color = "bg-yellow-500";
  else color = "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-2 py-1 rounded-full ${color} text-white text-sm font-medium`}
      >
        {score}
      </span>
      {score >= 90 && <span className="text-xs text-green-500">🟢</span>}
      {score >= 70 && score < 90 && (
        <span className="text-xs text-yellow-500">🟡</span>
      )}
      {score < 70 && <span className="text-xs text-red-500">🟥</span>}
    </div>
  );
};

export const StatusBadge = ({
  status,
  error,
}: {
  status: AnalysisStatus;
  error?: string;
}) => {
  const statusConfig = {
    completed: { icon: "✅", text: "Completed", className: "text-green-500" },
    "in-progress": {
      icon: "⏳",
      text: "In Progress",
      className: "text-yellow-500",
    },
    failed: { icon: "❌", text: error || "Failed", className: "text-red-500" },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-1 ${config.className}`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </div>
  );
};

export const ActionButtons = ({
  analysis,
  onView,
  onReanalyze,
  onDelete,
  onCancel,
}: {
  analysis: Analysis;
  onView: (id: string) => void;
  onReanalyze: (id: string) => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
}) => {
  if (analysis.status === "completed") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(analysis.id)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="View Report"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onReanalyze(analysis.id)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Re-analyze"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(analysis.id)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (analysis.status === "in-progress") {
    return (
      <button
        onClick={() => onCancel(analysis.id)}
        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        title="Cancel Analysis"
      >
        <X className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={() => onReanalyze(analysis.id)}
      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
      title="Retry Analysis"
    >
      <RefreshCw className="w-4 h-4" />
    </button>
  );
};

export const DateCell = ({ date }: { date: Date }) => (
  <span className="text-gray-400">{format(date, "MMMM d, yyyy")}</span>
);

export const TagList = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {tags.map((tag, index) => (
      <span
        key={index}
        className="px-2 py-1 text-xs rounded-full bg-white/10 text-white"
        title={tag}
      >
        {tag}
      </span>
    ))}
  </div>
);
