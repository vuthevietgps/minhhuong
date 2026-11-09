"use client";

import { X } from "lucide-react";
import { Field, MFoot, Modal, inputCls, questionTypeLabel } from "./shared";
import type { ContentPageState } from "./use-content-page-state";

export function NewQuestionModal(state: ContentPageState) {
  const {
    answers,
    createQuestion,
    isSaving,
    questionExplanation,
    questionPoints,
    questionPrompt,
    questionType,
    setAnswers,
    setQuestionExplanation,
    setQuestionPoints,
    setQuestionPrompt,
    setQuestionType,
    setShowQuestionModal,
    showQuestionModal,
  } = state;
  if (!showQuestionModal) return null;
  return (
    <Modal
      title={`Thêm câu hỏi — ${showQuestionModal.title}`}
      onClose={() => setShowQuestionModal(null)}
      wide
    >
      <form
        onSubmit={(e) => createQuestion(e, showQuestionModal.id)}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Loại câu hỏi">
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className={inputCls}
            >
              {[
                "SINGLE_CHOICE",
                "MULTIPLE_CHOICE",
                "TEXT_INPUT",
                "ORDERING",
              ].map((t) => (
                <option key={t} value={t}>
                  {questionTypeLabel[t] ?? t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Điểm">
            <input
              type="number"
              min="1"
              max="100"
              value={questionPoints}
              onChange={(e) => setQuestionPoints(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Nội dung câu hỏi">
          <textarea
            required
            rows={3}
            value={questionPrompt}
            onChange={(e) => setQuestionPrompt(e.target.value)}
            className={inputCls}
            placeholder="Ví dụ: Từ tiếng Anh của 'chào' là gì?"
          />
        </Field>
        <Field label="Giải thích (hiển thị sau khi trả lời)">
          <input
            value={questionExplanation}
            onChange={(e) => setQuestionExplanation(e.target.value)}
            className={inputCls}
          />
        </Field>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-700">
              Các lựa chọn trả lời
            </label>
            <button
              type="button"
              onClick={() =>
                setAnswers([...answers, { text: "", isCorrect: false }])
              }
              className="text-xs text-indigo-600 hover:underline"
            >
              + Thêm lựa chọn
            </button>
          </div>
          <div className="space-y-2">
            {answers.map((ans, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type={
                    questionType === "MULTIPLE_CHOICE"
                      ? "checkbox"
                      : "radio"
                  }
                  name="correct"
                  checked={ans.isCorrect}
                  onChange={() =>
                    setAnswers(
                      answers.map((a, j) => ({
                        ...a,
                        isCorrect:
                          questionType === "MULTIPLE_CHOICE"
                            ? j === i
                              ? !a.isCorrect
                              : a.isCorrect
                            : j === i,
                      })),
                    )
                  }
                  className="accent-indigo-600"
                />
                <input
                  value={ans.text}
                  onChange={(e) => {
                    const n = [...answers];
                    n[i] = { ...n[i], text: e.target.value };
                    setAnswers(n);
                  }}
                  className={`${inputCls} flex-1`}
                  placeholder={`Lựa chọn ${i + 1}`}
                />
                {answers.length > 2 && (
                  <button
                    type="button"
                    onClick={() =>
                      setAnswers(answers.filter((_, j) => j !== i))
                    }
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {questionType === "MULTIPLE_CHOICE"
              ? "Chọn tất cả đáp án đúng."
              : "Chọn một đáp án đúng."}
          </p>
        </div>
        <MFoot
          isSaving={isSaving}
          onCancel={() => setShowQuestionModal(null)}
          submitLabel="Thêm câu hỏi"
        />
      </form>
    </Modal>
  );
}

export function EditQuestionModal(state: ContentPageState) {
  const {
    editQAnswers,
    editQExplanation,
    editQPoints,
    editQPrompt,
    editQType,
    editingQuestion,
    isSaving,
    setEditQAnswers,
    setEditQExplanation,
    setEditQPoints,
    setEditQPrompt,
    setEditingQuestion,
    updateQuestion,
  } = state;
  if (!editingQuestion) return null;
  return (
    <Modal
      title="Sửa câu hỏi"
      onClose={() => setEditingQuestion(null)}
      wide
    >
      <form onSubmit={updateQuestion} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Loại câu hỏi">
            <select
              value={editQType}
              disabled
              className={`${inputCls} bg-slate-50 text-slate-400`}
            >
              {[
                "SINGLE_CHOICE",
                "MULTIPLE_CHOICE",
                "TEXT_INPUT",
                "ORDERING",
              ].map((t) => (
                <option key={t} value={t}>
                  {questionTypeLabel[t] ?? t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Điểm">
            <input
              type="number"
              min="1"
              max="100"
              value={editQPoints}
              onChange={(e) => setEditQPoints(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Nội dung câu hỏi">
          <textarea
            required
            rows={3}
            value={editQPrompt}
            onChange={(e) => setEditQPrompt(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Giải thích (hiển thị sau khi trả lời)">
          <input
            value={editQExplanation}
            onChange={(e) => setEditQExplanation(e.target.value)}
            className={inputCls}
          />
        </Field>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-700">
              Các lựa chọn trả lời
            </label>
            <button
              type="button"
              onClick={() =>
                setEditQAnswers([
                  ...editQAnswers,
                  { text: "", isCorrect: false },
                ])
              }
              className="text-xs text-indigo-600 hover:underline"
            >
              + Thêm lựa chọn
            </button>
          </div>
          <div className="space-y-2">
            {editQAnswers.map((ans, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type={
                    editQType === "MULTIPLE_CHOICE" ? "checkbox" : "radio"
                  }
                  name="edit-correct"
                  checked={ans.isCorrect}
                  onChange={() =>
                    setEditQAnswers(
                      editQAnswers.map((a, j) => ({
                        ...a,
                        isCorrect:
                          editQType === "MULTIPLE_CHOICE"
                            ? j === i
                              ? !a.isCorrect
                              : a.isCorrect
                            : j === i,
                      })),
                    )
                  }
                  className="accent-indigo-600"
                />
                <input
                  value={ans.text}
                  onChange={(e) => {
                    const n = [...editQAnswers];
                    n[i] = { ...n[i], text: e.target.value };
                    setEditQAnswers(n);
                  }}
                  className={`${inputCls} flex-1`}
                  placeholder={`Lựa chọn ${i + 1}`}
                />
                {editQAnswers.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditQAnswers(
                        editQAnswers.filter((_, j) => j !== i),
                      )
                    }
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {editQType === "MULTIPLE_CHOICE"
              ? "Chọn tất cả đáp án đúng."
              : "Chọn một đáp án đúng."}
          </p>
        </div>
        <MFoot
          isSaving={isSaving}
          submitLabel="Lưu thay đổi"
          onCancel={() => setEditingQuestion(null)}
        />
      </form>
    </Modal>
  );
}
