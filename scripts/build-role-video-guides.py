from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

from gtts import gTTS
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE_MAIN = ROOT / "output" / "video-guide" / "assets"
SOURCE_SERIES = ROOT / "output" / "video-guide-series" / "assets"
OUTPUT = ROOT / "output" / "video-guide-by-role"
POINTER_ASSETS = OUTPUT / "_pointer-assets"
WIDTH, HEIGHT, FPS = 1280, 720, 24
PURPLE = (105, 77, 246)
INK = (24, 27, 46)


@dataclass(frozen=True)
class Scene:
    heading: str
    narration: str
    image: str | None = None
    target: tuple[int, int] | None = None


@dataclass(frozen=True)
class Guide:
    slug: str
    role: str
    email: str
    scenes: tuple[Scene, ...]


def action(image: str, heading: str, narration: str, target: tuple[int, int]) -> Scene:
    return Scene(heading=heading, narration=narration, image=image, target=target)


GUIDES = (
    Guide("01-hoc-vien", "Học viên", "student@demo.local", (
        Scene("Bắt đầu học đúng lộ trình", "Chào bạn. Đây là hướng dẫn nhanh dành cho học viên trên hệ thống Anh ngữ Minh Hương."),
        action("01-login.png", "Đăng nhập tài khoản học viên", "Nhập email student a còng demo chấm local, mật khẩu Demo a còng một hai ba bốn năm, rồi chọn Đăng nhập. Hệ thống sẽ tự mở đúng không gian học viên.", (960, 675)),
        action("02-student-dashboard.png", "Xem việc học hôm nay", "Tại trang Tổng quan, xem bài tiếp theo và lộ trình hôm nay. Dùng thanh bên trái để chuyển nhanh giữa Bài học, Luyện tập và Trợ lý AI.", (315, 320)),
        action("03-lessons.png", "Chọn video và bắt đầu học", "Trong Bài học, chọn bài ở cột bên phải, sau đó chọn video và bấm Bắt đầu học. Khi video chạy, hệ thống mới ghi nhận thời lượng và tiến độ.", (1160, 760)),
        action("04-practice.png", "Làm và nộp bài luyện tập", "Chuyển sang Luyện tập, chọn đáp án cho từng câu và theo dõi thanh tiến độ. Kiểm tra lại trước khi bấm Nộp bài vì điểm chỉ được tính sau khi nộp.", (1460, 850)),
        action("06-ai-chat.png", "Luyện phản xạ với Trợ lý AI", "Trong Trợ lý AI, nhập một câu tiếng Anh hoặc dùng micro. Gửi câu hoàn chỉnh để nhận phản hồi, câu mẫu và gợi ý luyện tiếp.", (1515, 910)),
        Scene("Hoàn tất", "Bạn đã sẵn sàng học. Hãy bắt đầu từ nhiệm vụ được ưu tiên trên trang Tổng quan."),
    )),
    Guide("02-phu-huynh", "Phụ huynh", "parent@demo.local", (
        Scene("Đồng hành cùng con", "Đây là hướng dẫn nhanh dành cho phụ huynh trên hệ thống Anh ngữ Minh Hương."),
        action("01-login.png", "Đăng nhập cổng phụ huynh", "Nhập email parent a còng demo chấm local, mật khẩu Demo a còng một hai ba bốn năm, rồi chọn Đăng nhập.", (960, 675)),
        action("07-parent-dashboard.png", "Theo dõi và đặt giới hạn học", "Tại trang Học sinh, xem thời gian học trong tuần, thời hạn gói và tiến độ từng hồ sơ. Mở hồ sơ con để bật giới hạn thời gian học mỗi ngày hoặc cấp thêm thời gian khi cần.", (320, 635)),
        action("08-parent-report.png", "Đọc báo cáo học tập", "Mở thẻ Báo cáo, chọn đúng học sinh và khoảng bảy hoặc ba mươi ngày. Theo dõi số ngày có học, video hoàn thành, bài luyện đạt và dòng thời gian chi tiết.", (1030, 425)),
        Scene("Hoàn tất", "Phụ huynh nên kiểm tra báo cáo định kỳ và trao đổi với giáo viên khi hệ thống hiển thị nội dung cần chú ý."),
    )),
    Guide("03-giao-vien", "Giáo viên", "teacher@demo.local", (
        Scene("Quản lý lớp học", "Đây là hướng dẫn nhanh dành cho giáo viên trên hệ thống Anh ngữ Minh Hương."),
        action("01-login.png", "Đăng nhập tài khoản giáo viên", "Nhập email teacher a còng demo chấm local, mật khẩu Demo a còng một hai ba bốn năm, rồi chọn Đăng nhập.", (960, 675)),
        action("09-teacher-dashboard.png", "Ưu tiên việc cần xử lý", "Dashboard giáo viên tổng hợp lớp học, học viên cần hỗ trợ, bài chờ chấm và tỷ lệ hoàn thành. Chọn thẻ ưu tiên để đi thẳng tới danh sách cần xử lý.", (940, 430)),
        action("10-teacher-content.png", "Quản lý bài học của tôi", "Trong Bài học của tôi, lọc theo bản nháp, chờ duyệt hoặc đã xuất bản. Chọn Bài học mới để thêm nội dung, video và bài luyện trước khi gửi duyệt.", (1560, 250)),
        Scene("Hoàn tất", "Hãy bắt đầu mỗi ngày từ học viên cần hỗ trợ và hàng đợi chấm bài trên trang Tổng quan."),
    )),
    Guide("04-bien-tap-noi-dung", "Biên tập nội dung", "content@demo.local", (
        Scene("Chuẩn hóa nội dung học", "Đây là hướng dẫn nhanh dành cho biên tập viên nội dung trên hệ thống Anh ngữ Minh Hương."),
        action("01-login.png", "Đăng nhập tài khoản biên tập", "Nhập email content a còng demo chấm local, mật khẩu Demo a còng một hai ba bốn năm, rồi chọn Đăng nhập.", (960, 675)),
        action("12-content-dashboard.png", "Xem tổng quan biên tập", "Trang Tổng quan cho biết số bản nháp, nội dung chờ duyệt, video đang xử lý và ngân hàng câu hỏi. Chọn đúng thẻ công việc để mở không gian biên tập.", (765, 430)),
        action("13-content-workspace.png", "Tạo và gửi duyệt nội dung", "Trong workspace nội dung, tạo hoặc mở bài học, bổ sung video và câu hỏi, rồi kiểm tra trạng thái trước khi gửi duyệt. Tài khoản biên tập không tự xuất bản nội dung.", (410, 455)),
        Scene("Hoàn tất", "Luôn kiểm tra tên bài, cấp độ, tài nguyên và câu hỏi trước khi chuyển nội dung sang hàng đợi duyệt."),
    )),
    Guide("05-ho-tro", "Hỗ trợ khách hàng", "support@demo.local", (
        Scene("Xử lý yêu cầu hỗ trợ", "Đây là hướng dẫn nhanh dành cho bộ phận hỗ trợ trên hệ thống Anh ngữ Minh Hương."),
        action("01-login.png", "Đăng nhập tài khoản hỗ trợ", "Nhập email support a còng demo chấm local, mật khẩu Demo a còng một hai ba bốn năm, rồi chọn Đăng nhập.", (960, 675)),
        action("14-support-dashboard.png", "Xem hàng đợi ưu tiên", "Trang Tổng quan hiển thị yêu cầu đang mở, vấn đề thanh toán, phản hồi trung bình và mức thực hiện. Mở Tra cứu tài khoản hoặc Danh sách yêu cầu để bắt đầu xử lý.", (780, 430)),
        action("15-support-workspace.png", "Tra cứu và ghi nhận xử lý", "Trong workspace hỗ trợ, tìm tài khoản theo thông tin được cung cấp, kiểm tra lịch sử và ghi nhận kết quả. Chỉ thao tác trong phạm vi quyền được cấp và không chia sẻ dữ liệu nhạy cảm.", (560, 360)),
        Scene("Hoàn tất", "Ưu tiên yêu cầu quá hạn, ghi chú rõ hành động đã làm và chuyển cấp khi vượt thẩm quyền."),
    )),
    Guide("06-giam-doc", "Giám đốc", "director@demo.local", (
        Scene("Theo dõi toàn hệ thống", "Đây là hướng dẫn nhanh dành cho giám đốc trên hệ thống Anh ngữ Minh Hương."),
        action("01-login.png", "Đăng nhập tài khoản giám đốc", "Nhập email director a còng demo chấm local, mật khẩu Demo a còng một hai ba bốn năm, rồi chọn Đăng nhập.", (960, 675)),
        action("16-director-dashboard.png", "Đọc chỉ số điều hành", "Trang Tổng quan giám đốc hiển thị doanh thu, giá trị hoạt động, tỷ lệ chuyển đổi dùng thử và tỷ lệ rời đi. Chọn biểu đồ hoặc báo cáo để xem nguyên nhân phía sau chỉ số.", (560, 255)),
        action("17-director-workspace.png", "Mở báo cáo chuyên sâu", "Trong workspace điều hành, dùng bộ lọc thời gian và đơn vị để so sánh xu hướng. Dữ liệu tài chính và kiểm toán ở chế độ xem theo quyền, không chỉnh sửa trực tiếp tại đây.", (1520, 300)),
        Scene("Hoàn tất", "Đối chiếu chỉ số tổng quan với báo cáo chi tiết trước khi đưa ra quyết định điều hành."),
    )),
    Guide("07-kinh-doanh", "Nhân viên kinh doanh", "sale@demo.local", (
        Scene("Theo dõi cơ hội bán hàng", "Đây là hướng dẫn nhanh dành cho nhân viên kinh doanh trên hệ thống Anh ngữ Minh Hương."),
        action("01-login.png", "Đăng nhập tài khoản kinh doanh", "Nhập email sale a còng demo chấm local, mật khẩu Demo a còng một hai ba bốn năm, rồi chọn Đăng nhập.", (960, 675)),
        action("18-sale-dashboard.png", "Xem mục tiêu hôm nay", "Tổng quan kinh doanh hiển thị đơn đã tạo, đang chờ xử lý, doanh thu đã duyệt và hoa hồng dự kiến. Mở đơn hàng của tôi để tiếp tục các cơ hội đang theo dõi.", (400, 430)),
        action("19-sale-workspace.png", "Tạo và theo dõi đơn hàng", "Trong workspace bán hàng, tạo đơn đúng thông tin khách, chọn gói và kiểm tra trạng thái thanh toán. Theo dõi tiến độ kích hoạt nhưng không tự duyệt các bước thuộc vận hành.", (1540, 305)),
        Scene("Hoàn tất", "Luôn kiểm tra thông tin khách hàng và gói học trước khi gửi đơn sang bước tiếp theo."),
    )),
    Guide("08-dai-ly", "Chủ và quản lý đại lý", "agency@demo.local", (
        Scene("Vận hành đại lý", "Đây là hướng dẫn nhanh dành cho chủ và quản lý đại lý trên hệ thống Anh ngữ Minh Hương."),
        action("01-login.png", "Đăng nhập tài khoản đại lý", "Nhập email agency a còng demo chấm local, mật khẩu Demo a còng một hai ba bốn năm, rồi chọn Đăng nhập.", (960, 675)),
        action("20-agency-dashboard.png", "Xem tổng quan đại lý", "Trang Tổng quan cho biết doanh thu, nhân viên, khoản chờ xử lý và mức giới thiệu. Mở vận hành đại lý hoặc đơn hàng để xem công việc thuộc phạm vi đơn vị của mình.", (400, 430)),
        action("21-agency-workspace.png", "Quản lý đội ngũ và hiệu suất", "Trong workspace đại lý, theo dõi thành viên, đơn hàng và hiệu suất chi trả. Chủ hoặc quản lý chỉ nhìn thấy dữ liệu của đại lý được phân quyền.", (900, 300)),
        Scene("Hoàn tất", "Kiểm tra quyền thành viên định kỳ và đối chiếu đơn hàng trước khi xem báo cáo hiệu suất."),
    )),
    Guide("09-van-hanh", "Vận hành", "operations@demo.local", (
        Scene("Kiểm soát vận hành", "Đây là hướng dẫn nhanh dành cho bộ phận vận hành trên hệ thống Anh ngữ Minh Hương."),
        action("01-login.png", "Đăng nhập tài khoản vận hành", "Nhập email operations a còng demo chấm local, mật khẩu Demo a còng một hai ba bốn năm, rồi chọn Đăng nhập.", (960, 675)),
        action("22-operations-dashboard.png", "Xem việc cần xử lý", "Tổng quan vận hành hiển thị đơn đang đợi, doanh thu đã duyệt, hóa đơn bị lỗi và tài khoản sắp hết hạn. Chọn hàng đợi phù hợp để xử lý theo thứ tự ưu tiên.", (405, 430)),
        action("23-operations-workspace.png", "Duyệt và đối soát", "Trong workspace vận hành, kiểm tra chứng từ, trạng thái thanh toán và thông tin kích hoạt trước khi duyệt. Mọi thay đổi quan trọng đều cần đúng quy trình và có dấu vết kiểm toán.", (740, 360)),
        Scene("Hoàn tất", "Không bỏ qua bước đối soát; khi dữ liệu không khớp, tạm dừng và chuyển yêu cầu sang người có thẩm quyền."),
    )),
    Guide("10-quan-tri-vien", "Quản trị viên", "admin@demo.local", (
        Scene("Quản trị an toàn", "Đây là hướng dẫn nhanh dành cho quản trị viên trên hệ thống Anh ngữ Minh Hương."),
        action("01-login.png", "Đăng nhập tài khoản quản trị", "Nhập email admin a còng demo chấm local, mật khẩu Demo a còng một hai ba bốn năm, rồi chọn Đăng nhập.", (960, 675)),
        action("24-admin-dashboard.png", "Theo dõi trạng thái hệ thống", "Trung tâm quản trị tổng hợp người dùng cần hỗ trợ, nội dung đã xuất bản, thanh toán lỗi và sức khỏe hệ thống. Dùng lối tắt để mở đúng khu vực cần xử lý.", (790, 430)),
        action("25-admin-users.png", "Quản lý người dùng và quyền", "Trong Người dùng, tìm đúng tài khoản, kiểm tra vai trò và trạng thái trước khi thay đổi. Chỉ cấp quyền tối thiểu cần thiết và kiểm tra nhật ký sau thao tác quan trọng.", (1510, 310)),
        Scene("Hoàn tất", "Quản trị viên nên kiểm tra hàng đợi lỗi, quyền truy cập và nhật ký kiểm toán theo lịch vận hành."),
    )),
)


def ffmpeg_path() -> str:
    found = shutil.which("ffmpeg")
    if found:
        return found
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def ffprobe_path(ffmpeg: str) -> str:
    probe = Path(ffmpeg).with_name("ffprobe.exe")
    return str(probe) if probe.exists() else "ffprobe"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "seguisb.ttf" if bold else "segoeui.ttf"
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / name), size)


def create_pointer_assets() -> tuple[Path, Path]:
    """Create a large pointer that stays legible on both light and dark UI."""
    POINTER_ASSETS.mkdir(parents=True, exist_ok=True)
    cursor_path = POINTER_ASSETS / "cursor-high-contrast.png"
    ring_path = POINTER_ASSETS / "click-ring-high-contrast.png"

    cursor = Image.new("RGBA", (112, 132), (0, 0, 0, 0))
    cursor_draw = ImageDraw.Draw(cursor)
    arrow = [(5, 4), (8, 102), (34, 79), (53, 124), (76, 113), (57, 72), (93, 69)]
    cursor_draw.polygon(arrow, fill=(255, 205, 24, 255), outline=(255, 255, 255, 255), width=14)
    cursor_draw.line(arrow + [arrow[0]], fill=(20, 22, 31, 255), width=7, joint="curve")
    cursor_draw.polygon(arrow, fill=(255, 205, 24, 255), outline=(20, 22, 31, 255), width=5)
    cursor.save(cursor_path)

    ring = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ring_draw = ImageDraw.Draw(ring)
    ring_draw.ellipse((8, 8, 152, 152), fill=(255, 190, 24, 45), outline=(255, 255, 255, 245), width=13)
    ring_draw.ellipse((21, 21, 139, 139), outline=(255, 132, 24, 255), width=12)
    ring_draw.ellipse((48, 48, 112, 112), fill=(255, 205, 24, 80), outline=(26, 28, 40, 245), width=7)
    ring.save(ring_path)
    return cursor_path, ring_path


def fit_screen(source: Image.Image) -> Image.Image:
    source = source.convert("RGB")
    scale = max(WIDTH / source.width, HEIGHT / source.height)
    resized = source.resize((round(source.width * scale), round(source.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - WIDTH) // 2
    top = (resized.height - HEIGHT) // 2
    return resized.crop((left, top, left + WIDTH, top + HEIGHT))


def source_path(name: str) -> Path:
    first = SOURCE_MAIN / name
    return first if first.exists() else SOURCE_SERIES / name


def action_frame(guide: Guide, scene: Scene, number: int, out: Path) -> tuple[int, int]:
    src = Image.open(source_path(scene.image or ""))
    frame = fit_screen(src)
    veil = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(veil)
    draw.rounded_rectangle((24, 22, 430, 82), 18, fill=(24, 27, 46, 225))
    draw.text((45, 38), f"{guide.role}  •  BƯỚC {number}", font=font(23, True), fill="white")
    draw.rounded_rectangle((54, 614, 1226, 694), 20, fill=(24, 27, 46, 225), outline=(139, 116, 255, 255), width=2)
    draw.text((83, 635), scene.heading, font=font(28, True), fill="white")
    frame = Image.alpha_composite(frame.convert("RGBA"), veil).convert("RGB")
    frame.save(out, quality=95)
    tx, ty = scene.target or (WIDTH // 2, HEIGHT // 2)
    return round(tx * WIDTH / 1920), round(ty * HEIGHT / 1080)


def title_frame(guide: Guide, scene: Scene, final: bool, out: Path) -> None:
    bg = fit_screen(Image.open(source_path("01-login.png"))).filter(ImageFilter.GaussianBlur(13))
    bg = ImageEnhance.Brightness(bg).enhance(0.38)
    overlay = Image.new("RGBA", bg.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.ellipse((870, -180, 1370, 320), fill=(105, 77, 246, 75))
    draw.ellipse((-140, 500, 250, 890), fill=(35, 200, 176, 60))
    draw.rounded_rectangle((105, 105, 1175, 615), 38, fill=(255, 255, 255, 238))
    draw.rounded_rectangle((155, 155, 405, 202), 22, fill=PURPLE + (255,))
    draw.text((182, 166), "MINH HƯƠNG ENGLISH", font=font(20, True), fill="white")
    headline = "HOÀN TẤT HƯỚNG DẪN" if final else "VIDEO HƯỚNG DẪN SỬ DỤNG"
    draw.text((155, 255), headline, font=font(28, True), fill=PURPLE)
    draw.text((155, 310), guide.role, font=font(54, True), fill=INK)
    draw.text((155, 390), scene.heading, font=font(30), fill=(75, 79, 100))
    if not final:
        draw.text((155, 485), guide.email, font=font(24), fill=(75, 79, 100))
        draw.text((155, 530), "Rõ thao tác  •  Có con trỏ  •  Có phụ đề", font=font(21, True), fill=(35, 164, 145))
    else:
        draw.text((155, 500), "Anh ngữ Minh Hương", font=font(23, True), fill=(35, 164, 145))
    Image.alpha_composite(bg.convert("RGBA"), overlay).convert("RGB").save(out, quality=95)


def audio_duration(probe: str, path: Path) -> float:
    result = subprocess.run([probe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)], capture_output=True, text=True, check=True)
    return float(result.stdout.strip())


def srt_time(seconds: float) -> str:
    millis = round(seconds * 1000)
    h, millis = divmod(millis, 3_600_000)
    m, millis = divmod(millis, 60_000)
    s, ms = divmod(millis, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def render_clip(ffmpeg: str, frame: Path, audio: Path, clip: Path, duration: float, target: tuple[int, int] | None) -> None:
    inputs = ["-loop", "1", "-framerate", str(FPS), "-i", str(frame)]
    filters = []
    if target:
        cursor_asset, ring_asset = create_pointer_assets()
        inputs += ["-loop", "1", "-framerate", str(FPS), "-i", str(cursor_asset), "-loop", "1", "-framerate", str(FPS), "-i", str(ring_asset)]
        tx, ty = target
        sx, sy = 1120, 115
        move = min(2.2, max(1.2, duration * 0.28))
        click_from = max(move + 0.4, duration - 1.45)
        click_to = min(duration - 0.25, click_from + 0.7)
        filters = [
            "[0:v]format=rgba[bg]",
            "[1:v]scale=68:-1[cur]",
            "[2:v]scale=124:-1[ring]",
            f"[bg][ring]overlay=x={tx}-62:y={ty}-62:enable='between(t,{click_from:.3f},{click_to:.3f})'[clicked]",
            f"[clicked][cur]overlay=x='{sx}+({tx}-{sx})*min(t/{move:.3f},1)':y='{sy}+({ty}-{sy})*min(t/{move:.3f},1)':shortest=1[outv]",
        ]
    else:
        filters = ["[0:v]format=yuv420p[outv]"]
    inputs += ["-i", str(audio)]
    audio_index = 3 if target else 1
    command = [ffmpeg, "-y", "-hide_banner", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filters), "-map", "[outv]", "-map", f"{audio_index}:a", "-t", f"{duration:.3f}", "-r", str(FPS), "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2", "-movflags", "+faststart", str(clip)]
    run(command)


def build_guide(guide: Guide, ffmpeg: str, probe: str, refresh_tts: bool) -> dict[str, object]:
    role_dir = OUTPUT / guide.slug
    audio_dir, frame_dir, clip_dir = role_dir / "audio", role_dir / "frames", role_dir / "clips"
    for directory in (audio_dir, frame_dir, clip_dir):
        directory.mkdir(parents=True, exist_ok=True)
    subtitles = []
    cursor = 0.0
    clip_paths = []
    for index, scene in enumerate(guide.scenes, 1):
        stem = f"{index:02}"
        audio = audio_dir / f"{stem}.mp3"
        if refresh_tts or not audio.exists() or audio.stat().st_size == 0:
            gTTS(scene.narration, lang="vi", slow=False).save(str(audio))
        duration = audio_duration(probe, audio) + 0.65
        frame = frame_dir / f"{stem}.png"
        is_final = index == len(guide.scenes)
        target = None
        if scene.image:
            target = action_frame(guide, scene, index - 1, frame)
        else:
            title_frame(guide, scene, is_final, frame)
        clip = clip_dir / f"{stem}.mp4"
        render_clip(ffmpeg, frame, audio, clip, duration, target)
        clip_paths.append(clip)
        subtitles.append(f"{index}\n{srt_time(cursor)} --> {srt_time(cursor + duration - 0.2)}\n{scene.narration}\n")
        cursor += duration
    concat = role_dir / "concat.txt"
    concat.write_text("".join(f"file '{p.as_posix()}'\n" for p in clip_paths), encoding="utf-8")
    final = OUTPUT / f"{guide.slug}.mp4"
    run([ffmpeg, "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", "-movflags", "+faststart", str(final)])
    srt = OUTPUT / f"{guide.slug}.srt"
    srt.write_text("\n".join(subtitles), encoding="utf-8-sig")
    return {"file": final.name, "subtitle": srt.name, "role": guide.role, "email": guide.email, "durationSeconds": round(cursor, 1), "sizeBytes": final.stat().st_size}


def main() -> None:
    parser = argparse.ArgumentParser(description="Dựng bộ video hướng dẫn theo vai trò cho Minh Hương English.")
    parser.add_argument("--refresh-tts", action="store_true", help="Tạo lại toàn bộ giọng đọc gTTS.")
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    create_pointer_assets()
    ffmpeg = ffmpeg_path()
    probe = ffprobe_path(ffmpeg)
    manifest = []
    for guide in GUIDES:
        print(f"Building {guide.slug}...", flush=True)
        manifest.append(build_guide(guide, ffmpeg, probe, args.refresh_tts))
    (OUTPUT / "manifest.json").write_text(json.dumps({"resolution": f"{WIDTH}x{HEIGHT}", "fps": FPS, "guides": manifest}, ensure_ascii=False, indent=2), encoding="utf-8")
    rows = "\n".join(f"| {item['role']} | `{item['file']}` | `{item['subtitle']}` | {item['durationSeconds']} giây |" for item in manifest)
    readme = f"""# Bộ video hướng dẫn Minh Hương English theo vai trò

Video MP4 chuẩn H.264, độ phân giải {WIDTH}×{HEIGHT}, {FPS} fps, giọng đọc tiếng Việt, con trỏ chuyển động và vòng nhấn tại thao tác chính.

| Đối tượng | Video | Phụ đề | Thời lượng |
|---|---|---|---:|
{rows}

Tài khoản xuất hiện trong video là tài khoản demo; mật khẩu demo chung là `Demo@12345`.

Để dựng lại: `py scripts/build-role-video-guides.py --refresh-tts`.
"""
    (OUTPUT / "README.md").write_text(readme, encoding="utf-8-sig")
    print(f"Completed {len(manifest)} guides in {OUTPUT}")


if __name__ == "__main__":
    main()
