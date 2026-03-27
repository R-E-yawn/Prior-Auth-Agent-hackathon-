"use client";

interface QuestionPanelProps {
  questions: string[];
  answers: Record<number, string>;
  onAnswer: (index: number, answer: string) => void;
}

export function QuestionPanel({
  questions,
  answers,
  onAnswer,
}: QuestionPanelProps) {
  if (questions.length === 0) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">💬</span>
          <h3 className="font-semibold text-slate-900 text-sm">
            Clarifying Questions
          </h3>
        </div>
        <div className="text-sm text-slate-400 italic text-center py-8">
          Questions will appear here as the agent analyzes the request…
        </div>
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter((a) => a.trim()).length;

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className="font-semibold text-slate-900 text-sm">
            Clarifying Questions
          </h3>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Answer these to strengthen the prior authorization. Skip any that
        don&apos;t apply.
      </p>

      <div className="flex flex-col gap-4">
        {questions.map((q, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-700">
              <span className="text-indigo-500 font-semibold mr-1">
                Q{i + 1}.
              </span>
              {q}
            </label>
            <textarea
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 placeholder:text-slate-400 transition-all"
              rows={2}
              placeholder="Optional — answer or skip…"
              value={answers[i] ?? ""}
              onChange={(e) => onAnswer(i, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
