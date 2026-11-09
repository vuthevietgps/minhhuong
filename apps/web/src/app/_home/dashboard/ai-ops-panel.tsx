"use client";

import {
  Bot,
  Mic,
  PenTool,
  Send,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { apiBaseUrl } from "../lib/api";
import type { Role, Session } from "../types";
import { roleHomeCopy } from "./roles";

type VoiceRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type VoiceRecognitionConstructor = new () => VoiceRecognition;

type BuddyPet = "mimi" | "bo" | "pipi" | "kiki" | "nova";

const buddyPets: Array<{
  id: BuddyPet;
  name: string;
  animal: string;
  emoji: string;
}> = [
  { id: "mimi", name: "Mimi", animal: "Thỏ tinh nghịch", emoji: "🐰" },
  { id: "bo", name: "Bo", animal: "Gấu ấm áp", emoji: "🐻" },
  { id: "pipi", name: "Pipi", animal: "Chim cánh cụt", emoji: "🐧" },
  { id: "kiki", name: "Kiki", animal: "Mèo lanh lợi", emoji: "🐱" },
  { id: "nova", name: "Nova", animal: "Siêu nhân nhí", emoji: "🦸" },
];

export function AiOrOpsPanel({
  childProfileId,
  onOpenProtected,
  role,
  session,
}: {
  childProfileId: string;
  onOpenProtected: () => void;
  role: Role;
  session: Session;
}) {
  const isStudent = role === "STUDENT";
  const isParent = role === "PARENT";
  const staffPanelTitles: Record<Role, string> = {
    STUDENT: "Trợ lý AI",
    PARENT: "Gợi ý đồng hành",
    TEACHER: "Ghi chú giảng dạy",
    CONTENT_EDITOR: "Lưu ý xuất bản",
    ADMIN: "Nguyên tắc kiểm soát",
    DIRECTOR: "Góc nhìn quyết định",
    SUPPORT: "Cam kết hỗ trợ",
    SALE: "Nhịp theo dõi khách hàng",
    AGENCY_OWNER: "Điểm kiểm soát đại lý",
    AGENCY_MANAGER: "Lưu ý điều phối",
    OPERATIONS: "Nguyên tắc phê duyệt",
  };
  const staffNotes: Record<Role, string> = {
    STUDENT: "",
    PARENT: "",
    TEACHER:
      "Ưu tiên phản hồi có bằng chứng và hoàn tất vòng hỗ trợ trước khi đóng việc.",
    CONTENT_EDITOR:
      "Chỉ xuất bản khi video, câu hỏi, thẻ và trạng thái duyệt đã nhất quán.",
    ADMIN:
      "Mọi thay đổi quyền và dữ liệu quan trọng cần có lý do cùng dấu vết kiểm toán.",
    DIRECTOR:
      "Đi từ tín hiệu đến tác động và quyết định; không xử lý chi tiết vận hành tại đây.",
    SUPPORT:
      "Giữ người dùng được cập nhật, chuyển cấp đúng hạn và xác nhận kết quả sau xử lý.",
    SALE: "Mỗi đơn cần đủ thông tin khách hàng, chứng từ và bước tiếp theo rõ ràng.",
    AGENCY_OWNER:
      "Theo dõi theo phạm vi đại lý và đối soát trước khi xác nhận chi trả.",
    AGENCY_MANAGER:
      "Chỉ thao tác trong phạm vi thành viên và đơn hàng được phân công.",
    OPERATIONS:
      "Không kích hoạt quyền học khi chứng từ hoặc trạng thái phê duyệt chưa hợp lệ.",
  };
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatSessionId, setChatSessionId] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [chatStatus, setChatStatus] = useState("");
  const [chatMode, setChatMode] = useState<"LIVE" | "MOCK_DEV_ONLY" | "">("");
  const [chatBusy, setChatBusy] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isBuddySpeaking, setIsBuddySpeaking] = useState(false);
  const [buddyPet, setBuddyPet] = useState<BuddyPet>("mimi");
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const voiceTranscriptRef = useRef("");
  const voiceHadErrorRef = useRef(false);
  const buddyMood = chatBusy
    ? "thinking"
    : isListening
      ? "listening"
      : chatReply
        ? "celebrating"
        : "ready";
  const buddyCopy = isBuddySpeaking
    ? "Mình đang đọc câu trả lời cho con nghe nhé!"
    : {
        ready: "Con muốn luyện câu tiếng Anh nào?",
        listening: "Mình đang ghé tai lắng nghe con nói...",
        thinking: "Buddy đang nghĩ về câu con vừa nói...",
        celebrating: "Con làm tốt lắm! Cùng nghe Buddy nhé.",
      }[buddyMood];

  useEffect(() => {
    const browserWindow = window as typeof window & {
      SpeechRecognition?: VoiceRecognitionConstructor;
      webkitSpeechRecognition?: VoiceRecognitionConstructor;
    };
    setVoiceSupported(
      Boolean(
        browserWindow.SpeechRecognition ??
        browserWindow.webkitSpeechRecognition,
      ),
    );

    return () => {
      voiceHadErrorRef.current = true;
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const savedPet = window.localStorage.getItem(
      `minhhuong:ai-buddy-pet:${childProfileId}`,
    );
    if (buddyPets.some((pet) => pet.id === savedPet)) {
      setBuddyPet(savedPet as BuddyPet);
    }
  }, [childProfileId]);

  function chooseBuddyPet(pet: BuddyPet) {
    window.speechSynthesis?.cancel();
    setIsBuddySpeaking(false);
    setBuddyPet(pet);
    window.localStorage.setItem(
      `minhhuong:ai-buddy-pet:${childProfileId}`,
      pet,
    );
  }

  function closeBuddyDialog() {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    voiceHadErrorRef.current = true;
    recognition?.abort();
    window.speechSynthesis?.cancel();
    setIsListening(false);
    setIsBuddySpeaking(false);
    setChatOpen(false);
  }

  useEffect(() => {
    if (!chatOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBuddyDialog();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [chatOpen]);

  function startVoicePractice() {
    const browserWindow = window as typeof window & {
      SpeechRecognition?: VoiceRecognitionConstructor;
      webkitSpeechRecognition?: VoiceRecognitionConstructor;
    };
    const Recognition =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setChatStatus(
        "Trình duyệt này chưa hỗ trợ nhận dạng giọng nói. Con vẫn có thể nhập câu tiếng Anh.",
      );
      return;
    }

    recognitionRef.current?.abort();
    voiceTranscriptRef.current = "";
    voiceHadErrorRef.current = false;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result?.[0]?.transcript.trim();
      if (transcript) {
        voiceTranscriptRef.current = transcript;
        setChatInput(transcript);
        setChatStatus("Buddy đã nghe xong. Đang chuẩn bị phản hồi cho con...");
      }
    };
    recognition.onerror = (event) => {
      voiceHadErrorRef.current = true;
      setChatStatus(
        event.error === "not-allowed"
          ? "Hãy cho phép dùng micro để luyện nói."
          : "Chưa nghe rõ. Con hãy thử nói chậm và gần micro hơn nhé.",
      );
    };
    recognition.onend = () => {
      setIsListening(false);
      if (recognitionRef.current !== recognition) {
        return;
      }
      const transcript = voiceTranscriptRef.current.trim();
      if (transcript && !voiceHadErrorRef.current) {
        void submitPracticeMessage(transcript);
      }
    };
    recognitionRef.current = recognition;
    setChatStatus("AI đang lắng nghe. Con hãy nói bằng tiếng Anh.");
    setIsListening(true);
    recognition.start();
  }

  function speakAiReply() {
    if (!chatReply || !window.speechSynthesis) {
      setChatStatus("Trình duyệt này chưa hỗ trợ đọc phản hồi bằng giọng nói.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(chatReply);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.onstart = () => setIsBuddySpeaking(true);
    utterance.onend = () => setIsBuddySpeaking(false);
    utterance.onerror = () => setIsBuddySpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  async function submitPracticeMessage(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message) {
      setChatStatus("Hãy nhập câu hoặc chủ đề con muốn luyện.");
      return;
    }
    if (!childProfileId) {
      setChatStatus("Chưa tải được hồ sơ học sinh. Hãy thử tải lại trang.");
      return;
    }

    setChatBusy(true);
    setChatStatus("Buddy đang nghĩ về câu con vừa nói...");
    try {
      const response = await fetch(`${apiBaseUrl}/v1/ai-chat/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          childProfileId,
          message,
          ...(chatSessionId ? { sessionId: chatSessionId } : {}),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        assistantMessage?: string;
        message?: string | string[];
        sessionId?: string;
        mode?: "LIVE" | "MOCK_DEV_ONLY";
      };
      if (!response.ok) {
        const errorMessage = Array.isArray(payload.message)
          ? payload.message.join(" ")
          : payload.message;
        throw new Error(errorMessage ?? "Không thể gửi tin nhắn.");
      }

      setChatSessionId(payload.sessionId ?? chatSessionId);
      setChatReply(payload.assistantMessage ?? "Trợ lý đã nhận được câu hỏi.");
      setChatMode(payload.mode ?? "");
      setChatInput("");
    } catch (error) {
      setChatStatus(
        error instanceof Error ? error.message : "Không thể gửi tin nhắn.",
      );
    } finally {
      setChatBusy(false);
    }
  }

  async function sendChatMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitPracticeMessage(chatInput);
  }

  return (
    <section
      className="scroll-mt-4 rounded-lg border border-slate-200 bg-white p-4"
      id="dashboard-ai-panel"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {isStudent
            ? "Trợ lý AI"
            : isParent
              ? "Gợi ý đồng hành"
              : staffPanelTitles[role]}
        </h2>
        {isStudent ? (
          <Sparkles className="text-violet-600" size={18} />
        ) : (
          <PenTool size={18} />
        )}
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <p className="rounded-lg bg-slate-100 p-3 text-slate-700">
          {isStudent
            ? "Xem bài xong, con có thể nói với AI để luyện phản xạ tiếng Anh."
            : isParent
              ? "Chọn đúng hồ sơ con trước khi mở bài học và báo cáo tiến độ."
              : roleHomeCopy[role]}
        </p>
        <p className="rounded-lg bg-violet-50 p-3 text-violet-950">
          {isStudent
            ? "AI sẽ sửa nhẹ nhàng, cho câu mẫu và hỏi một câu tiếp theo để con trả lời."
            : isParent
              ? "Các giới hạn học và thiết bị được quản lý trong hồ sơ gia đình."
              : staffNotes[role]}
        </p>
      </div>

      {isStudent ? (
        <>
          <button
            aria-expanded={chatOpen}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-700 px-3 text-sm font-medium text-white"
            onClick={() => setChatOpen(true)}
            type="button"
          >
            <Bot size={18} />
            Luyện nói cùng AI
          </button>
          {chatOpen &&
            createPortal(
              <div
                className="ai-buddy-modal-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    closeBuddyDialog();
                  }
                }}
              >
                <div
                  aria-labelledby="ai-buddy-dialog-title"
                  aria-modal="true"
                  className="ai-buddy-dialog"
                  role="dialog"
                >
                  <header className="ai-buddy-dialog-header">
                    <div className="ai-buddy-dialog-title">
                      <span aria-hidden="true">✨</span>
                      <div>
                        <h2 id="ai-buddy-dialog-title">AI English Buddy</h2>
                        <p>Nói tiếng Anh cùng người bạn con yêu thích</p>
                      </div>
                    </div>
                    <button
                      aria-label="Đóng AI English Buddy"
                      className="ai-buddy-dialog-close"
                      onClick={closeBuddyDialog}
                      type="button"
                    >
                      <X size={22} />
                    </button>
                  </header>
                  <form
                    className="ai-buddy-dialog-form space-y-3"
                    onSubmit={sendChatMessage}
                  >
                    <fieldset className="ai-buddy-pet-picker">
                      <legend>Chọn pet đồng hành</legend>
                      <div className="ai-buddy-pet-options">
                        {buddyPets.map((pet) => {
                          const isSelected = buddyPet === pet.id;
                          return (
                            <button
                              aria-pressed={isSelected}
                              className={`ai-buddy-pet-option${
                                isSelected ? " is-selected" : ""
                              }`}
                              key={pet.id}
                              onClick={() => chooseBuddyPet(pet.id)}
                              type="button"
                            >
                              <span
                                aria-hidden="true"
                                className="ai-buddy-pet-emoji"
                              >
                                {pet.emoji}
                              </span>
                              <span className="ai-buddy-pet-copy">
                                <strong>{pet.name}</strong>
                                <small>{pet.animal}</small>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                    <div
                      aria-live="polite"
                      className={`ai-buddy-stage ai-buddy-stage--${buddyMood}`}
                    >
                      <div
                        aria-hidden="true"
                        className="ai-buddy-mascot"
                        data-pet={buddyPet}
                        data-speaking={isBuddySpeaking ? "true" : "false"}
                      >
                        <span className="ai-buddy-cape" />
                        <span className="ai-buddy-ear ai-buddy-ear--left" />
                        <span className="ai-buddy-ear ai-buddy-ear--right" />
                        <span className="ai-buddy-face">
                          <i className="ai-buddy-hero-mask" />
                          <i className="ai-buddy-eye ai-buddy-eye--left" />
                          <i className="ai-buddy-eye ai-buddy-eye--right" />
                          <i className="ai-buddy-cheek ai-buddy-cheek--left" />
                          <i className="ai-buddy-cheek ai-buddy-cheek--right" />
                          <i className="ai-buddy-nose" />
                          <i className="ai-buddy-smile" />
                        </span>
                        <span className="ai-buddy-pet-beak" />
                        <span className="ai-buddy-pet-belly" />
                        <span className="ai-buddy-pet-tail" />
                        <span className="ai-buddy-hero-emblem">★</span>
                        <span className="ai-buddy-hand ai-buddy-hand--ear" />
                        <span className="ai-buddy-hand ai-buddy-hand--drum" />
                        <span className="ai-buddy-drum">
                          <i />
                          <i />
                        </span>
                        <span className="ai-buddy-spark ai-buddy-spark--one">
                          ✦
                        </span>
                        <span className="ai-buddy-spark ai-buddy-spark--two">
                          ✦
                        </span>
                      </div>
                      <div className="ai-buddy-speech">
                        <span className="ai-buddy-name">
                          {buddyPets.find((pet) => pet.id === buddyPet)?.name} ·
                          AI English Buddy
                        </span>
                        <p>{buddyCopy}</p>
                        {buddyMood === "thinking" && (
                          <span aria-hidden="true" className="ai-buddy-dots">
                            <i />
                            <i />
                            <i />
                          </span>
                        )}
                        {buddyMood === "listening" && (
                          <span
                            aria-hidden="true"
                            className="ai-buddy-sound-bars"
                          >
                            <i />
                            <i />
                            <i />
                          </span>
                        )}
                      </div>
                    </div>
                    {chatReply && (
                      <div className="rounded-2xl bg-violet-50 p-3 text-sm leading-6 text-violet-950">
                        <p>{chatReply}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <button
                            className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-200"
                            onClick={speakAiReply}
                            type="button"
                          >
                            <Volume2 size={14} />
                            {isBuddySpeaking
                              ? "Buddy đang đọc..."
                              : "Nghe AI đọc"}
                          </button>
                          {chatMode && (
                            <span className="text-[11px] text-violet-700">
                              {chatMode === "LIVE"
                                ? "AI đang hoạt động"
                                : "Chế độ luyện thử"}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <textarea
                      aria-label="Tin nhắn cho trợ lý AI"
                      className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none"
                      onChange={(event) => setChatInput(event.target.value)}
                      placeholder="Ví dụ: Hello, my name is Lan. I like cats."
                      value={chatInput}
                    />
                    {voiceSupported && (
                      <button
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-3 text-sm font-semibold text-violet-800 disabled:opacity-50"
                        disabled={chatBusy}
                        onClick={() =>
                          isListening
                            ? recognitionRef.current?.stop()
                            : startVoicePractice()
                        }
                        type="button"
                      >
                        <Mic size={16} />
                        {isListening
                          ? "Dừng nghe và gửi câu"
                          : "Bấm micro để nói"}
                      </button>
                    )}
                    {chatStatus && (
                      <p className="text-xs font-medium text-violet-700">
                        {chatStatus}
                      </p>
                    )}
                    <p className="text-center text-[11px] leading-4 text-slate-500">
                      Buddy chỉ gửi câu hoàn chỉnh sau khi con dừng nói, không
                      gửi âm thanh hoặc lời nói dở dang lên AI.
                    </p>
                    <button
                      className="kid-primary-button flex h-10 w-full items-center justify-center gap-2 text-sm disabled:opacity-50"
                      disabled={chatBusy}
                      type="submit"
                    >
                      <Send size={16} />
                      {chatBusy ? "Đang gửi..." : "Gửi cho trợ lý"}
                    </button>
                  </form>
                </div>
              </div>,
              document.body,
            )}
        </>
      ) : (
        <button
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-700 px-3 text-sm font-medium text-white"
          onClick={onOpenProtected}
          type="button"
        >
          <ShieldCheck size={18} />
          {isParent ? "Xem quyền gia đình" : "Mở workspace chuyên trách"}
        </button>
      )}
    </section>
  );
}
