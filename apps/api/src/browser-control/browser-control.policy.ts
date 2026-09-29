import { BadRequestException } from '@nestjs/common';
import { BrowserPolicyDto } from './browser-control.dto';

export const defaultBrowserPolicy = (): BrowserPolicyDto => ({
  mode: 'WATCH',
  dailyMinutes: 30,
  timezone: 'Asia/Ho_Chi_Minh',
  windows: [],
  items: [],
});
export function safeBrowserUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new BadRequestException('Link không hợp lệ');
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.hash ||
    url.port ||
    url.href.length > 500
  ) {
    throw new BadRequestException(
      'Link phải là HTTPS, không chứa mật khẩu, cổng hoặc fragment',
    );
  }
  return url.href;
}
export function validateBrowserPolicy(policy: BrowserPolicyDto) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: policy.timezone }).format();
  } catch {
    throw new BadRequestException('Múi giờ không hợp lệ');
  }
  if (new Set(policy.items.map((i) => i.id)).size !== policy.items.length)
    throw new BadRequestException('ID nội dung bị trùng');
  for (const window of policy.windows)
    if (window.start >= window.end)
      throw new BadRequestException(
        'Giờ kết thúc phải sau giờ bắt đầu; tách lịch qua đêm thành hai khung',
      );
  const urls = new Set<string>();
  for (const item of policy.items) {
    item.url = safeBrowserUrl(item.url);
    if (urls.has(item.url))
      throw new BadRequestException('Link nội dung bị trùng');
    urls.add(item.url);
    if (item.aiUrl) item.aiUrl = safeBrowserUrl(item.aiUrl);
    for (const question of item.questions)
      if (question.answer >= question.options.length)
        throw new BadRequestException('Đáp án không nằm trong lựa chọn');
  }
  if (policy.items.some((item) => item.aiUrl && urls.has(item.aiUrl))) {
    throw new BadRequestException(
      'Link AI không được trùng với link xem nội dung',
    );
  }
  return policy;
}
export function publicBrowserPolicy(
  policy: BrowserPolicyDto,
  webOrigin: string,
) {
  return {
    ...policy,
    items: policy.items.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      minutes: item.minutes,
      aiUrl: item.aiUrl,
      learningUrl: `${webOrigin}/kid-learning?item=${item.id}`,
    })),
  };
}
