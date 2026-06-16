# Repository Lore — เปลี่ยน GitHub Repository ให้เป็นเรื่องเล่า

[English](README.md) · **ไทย**

วาง **URL ของ public GitHub repository** ใดก็ได้ แล้วอ่านประวัติการพัฒนาของมันกลับมาเป็น
เรื่องเล่าตามไทม์ไลน์ — พร้อมไทม์ไลน์ที่ประกอบขึ้นใหม่, โปรไฟล์ **Repository DNA** 7 ด้าน,
บทบาทผู้พัฒนา, กราฟแบบสด และ **โหมดเล่าเรื่อง 5 แบบ** ที่สลับได้ (สารคดี, แฟนตาซี, ไซไฟ,
รายงานองค์กร, มีม)

> สถิติบอกคุณว่า _อะไร_ เกิดขึ้น Repository Lore บอกคุณถึง _เรื่องราว_ ว่ามันเกิดขึ้นได้อย่างไร

- **Stateless** — ไม่มีฐานข้อมูล ไม่มีบัญชี ไม่ต้องล็อกอิน ไม่เก็บอะไรไว้
- **เรียลไทม์** — ทุกรายงานคำนวณสดจาก GitHub API ตอนที่มีคำขอ
- **เป็นส่วนตัว** — ข้อมูล repository ถูกเก็บไว้แค่ชั่วขณะที่แสดงผลหน้าเว็บเท่านั้น

---

## ✨ ฟีเจอร์

| ส่วน                  | สิ่งที่คุณได้รับ                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **ไทม์ไลน์**          | จุดกำเนิด, รีลีสแรก, เวอร์ชันสำคัญ, ช่วงพัฒนาเข้มข้น, การเติบโตของชุมชน, ปัจจุบัน                |
| **Repository DNA**    | คะแนน 0–100 สำหรับ นวัตกรรม, เสถียรภาพ, ชุมชน, การเติบโต, การดูแล, เอกสาร, การทดสอบ — พร้อมคำอธิบายแต่ละด้าน |
| **เอนจินตำนาน**       | เรื่องราว 5 บทใน 5 สำเนียง เขียนใหม่ทันทีเมื่อคุณสลับโหมด                                       |
| **บทบาทผู้พัฒนา**     | สถาปนิก, นักสร้างฟีเจอร์, นักล่าบั๊ก, ผู้ดูแล, แชมป์เปี้ยนชุมชน — อนุมานพร้อมเหตุผล             |
| **กราฟ**              | กิจกรรม commit, แรงส่งการพัฒนา, ผู้พัฒนาอันดับต้น, จังหวะการรีลีส, สัดส่วนภาษา (Recharts)        |
| **ภาษา**              | UI ครบทั้ง **อังกฤษ & ไทย** สลับได้ทันที; เนื้อหา dynamic แปลฝั่งเซิร์ฟเวอร์                     |
| **ดีไซน์**            | สไตล์ "Codex", ธีมมืด + สว่าง (กระดาษหนัง), responsive, รองรับ reduced-motion                  |

## 🧱 Tech stack

- **Next.js 15** (App Router, React Server Components, Suspense streaming)
- **TypeScript** (strict)
- **Tailwind CSS** + component primitives สไตล์ shadcn
- **Recharts** สำหรับการแสดงผลกราฟ
- **GitHub REST API** เป็นแหล่งข้อมูลเดียว
- พร้อมขึ้น **Vercel**, ใช้ **pnpm**, ESLint + Prettier

## 🚀 เริ่มต้นใช้งาน

```bash
# 1. ติดตั้ง dependencies (แนะนำ pnpm)
pnpm install        # หรือ: npm install

# 2. (ไม่บังคับ) เพิ่ม GitHub rate limit — ดูด้านล่าง
cp .env.example .env
#   จากนั้นแก้ .env แล้วตั้งค่า GITHUB_TOKEN=...

# 3. รัน dev server
pnpm dev            # หรือ: npm run dev
```

เปิด <http://localhost:3000> แล้ววาง repository เช่น `facebook/react`

### Scripts

| Script              | คำอธิบาย                             |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | เริ่ม dev server                     |
| `pnpm build`        | Production build                     |
| `pnpm start`        | รัน production build                 |
| `pnpm lint`         | ESLint                               |
| `pnpm typecheck`    | TypeScript, ไม่ emit                  |
| `pnpm format`       | Prettier write                       |

## 🔑 Environment variables

แอป **ไม่ต้องใช้ environment variable ใดๆ ก็รันได้** มีเพียงตัวแปร _ไม่บังคับ_ เท่านั้น:

| ตัวแปร            | บังคับ | จุดประสงค์                                                                                     |
| ----------------- | ------ | --------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`    | ไม่     | เพิ่ม GitHub API rate limit จาก **60 → 5,000 ครั้ง/ชั่วโมง** ไม่ต้องมี scope อ่านบนเซิร์ฟเวอร์เท่านั้น |
| `OPENAI_API_KEY`  | ไม่     | เปิดปุ่ม **"AI prose"** (ไม่บังคับ) ใช้ได้กับ provider ที่รองรับ OpenAI ทุกตัว อ่านบนเซิร์ฟเวอร์เท่านั้น |
| `OPENAI_BASE_URL` | ไม่     | ชี้ AI prose ไปยัง provider อื่น (Groq, Gemini, OpenRouter, Ollama ในเครื่อง, …) ค่าเริ่มต้น `https://api.openai.com/v1` |
| `OPENAI_MODEL`    | ไม่     | เปลี่ยนโมเดลที่ใช้กับ AI prose (ค่าเริ่มต้น `gpt-4o-mini`)                                       |

#### AI provider ฟรี

AI prose ใช้ OpenAI chat-completions API มาตรฐาน เพราะงั้น provider ที่รองรับตัวไหนก็ใช้ได้ —
รวมถึงตัว **ฟรี** หลายเจ้า ตั้งค่า `OPENAI_BASE_URL` (+ โมเดล + key):

| Provider | ฟรี? | `OPENAI_BASE_URL` | ตัวอย่าง `OPENAI_MODEL` | รับ key จาก |
| --- | --- | --- | --- | --- |
| **Groq** | ✅ ไม่ต้องใช้บัตร | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | <https://console.groq.com/keys> |
| **Google Gemini** | ✅ มี free tier | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` | <https://aistudio.google.com/apikey> |
| **OpenRouter** | ✅ โมเดล `:free` | `https://openrouter.ai/api/v1` | `meta-llama/llama-3.3-70b-instruct:free` | <https://openrouter.ai/keys> |
| **Ollama** (ในเครื่อง) | ✅ 100%, ไม่ต้องมี key | `http://localhost:11434/v1` | `llama3.2` | _ไม่ต้อง — รันบนเครื่องคุณเอง_ |

สร้าง GitHub token ได้ที่ <https://github.com/settings/tokens> (classic token แบบ **ไม่มี scope**
หรือ fine-grained token ที่อ่าน public ได้ ก็เพียงพอ) มันถูกอ่านบนเซิร์ฟเวอร์เท่านั้น
และไม่เคยถูกส่งไปยัง browser

### AI prose (แบบไฮบริด)

เอนจินตำนาน **ทำงานแบบกำหนดได้ (deterministic) โดยปริยาย** และไม่ต้องใช้ AI หากตั้งค่า
`OPENAI_API_KEY` ไว้ แต่ละรายงานจะมีปุ่ม **"AI prose"** เพิ่มขึ้นมา: มันเรียก server route
(`POST /api/lore`) ที่เกลาสำนวนของบทในโหมดที่เลือกให้เข้ากับเสียงเล่านั้น โดยถูกสั่งอย่างเคร่งครัด
ไม่ให้เพิ่มข้อเท็จจริงใดที่ไม่มีอยู่ในข้อมูล หากไม่มี key หรือการเรียกล้มเหลว ระบบจะแสดงข้อความ
แบบ deterministic แทน — ฟีเจอร์นี้ degrade อย่างนุ่มนวล และแอปจะ deploy ได้เสมอแม้ไม่มี key

## 🌐 รองรับหลายภาษา

หน้าตาเว็บมาพร้อม **ภาษาอังกฤษและไทย** (`en`, `th`) ปุ่มสลับภาษาบน header เปลี่ยนได้ทันที
และจดจำตัวเลือกไว้ในคุกกี้/localStorage ที่ชื่อ `lore_lang`

- **ข้อความ UI แบบ static** อยู่ใน `lib/i18n/dictionaries.ts` — ภาษาอังกฤษเป็นต้นฉบับหลัก
  และภาษาไทยต้องมีโครงสร้างตรงกัน
- **เนื้อหา dynamic ที่ดึงจาก GitHub** (ตัวเรื่องเล่า, insights, คำอธิบาย DNA) ถูกสร้างเป็น
  ภาษาอังกฤษก่อน แล้วแปลเป็นไทย **ฝั่งเซิร์ฟเวอร์** ตอน render ผ่าน `lib/ai/translate.ts`
  ขั้นตอนนี้ใช้ AI provider (ไม่บังคับ) เพราะงั้นหากไม่มี `OPENAI_API_KEY` เนื้อหา dynamic
  จะยังเป็นภาษาอังกฤษ ส่วน UI ที่เหลือยังเป็นไทยครบ

## 🧩 API

มี JSON endpoint แบบไร้สถานะรองรับ (และสะท้อน) UI:

```
GET /api/analyze?repo=facebook/react
GET /api/analyze?repo=https://github.com/vercel/next.js
```

คืนค่า `RepoAnalysis` เต็มเมื่อสำเร็จ หรือ error ที่มี type ชัดเจน
(`invalid_url`, `not_found`, `rate_limited`, `empty_repository`, `network_error`, `server_error`)

## 🗂 โครงสร้างโปรเจกต์

```
app/
  layout.tsx            # ฟอนต์, theme provider, header/footer
  page.tsx              # หน้า landing
  analyze/page.tsx      # route รายงาน (Suspense + streaming)
  api/analyze/route.ts  # JSON API ไร้สถานะ
  error.tsx, not-found.tsx
components/
  ui/                   # primitives สไตล์ shadcn (button, card, tabs, …)
  landing/              # hero, features, how-it-works, examples, faq
  analyze/              # overview, dna, timeline, contributors, lore reader
  analyze/charts/       # มุมมอง Recharts
features/
  analysis/             # เอนจินวิเคราะห์ (dna, timeline, contributors, charts)
  lore/                 # เอนจินเล่าเรื่อง (facts + 5 โหมด)
services/
  github.ts             # GitHub REST client + การจัดการ error
  analyze.ts            # ไปป์ไลน์ parse → fetch → analyze
lib/                    # utils, formatting, parsing, examples
types/                  # github + analysis domain types
```

## 🧠 การวิเคราะห์ทำงานอย่างไร

1. **Parse** input ให้เป็น `owner/repo` (รองรับทั้ง URL, `owner/repo`, SSH, `.git`)
2. **Fetch** repository, ภาษา, ผู้พัฒนา, commit ล่าสุด, รีลีส, PR และ issue
   พร้อมกันแบบขนานจาก GitHub REST API (แคชที่ edge 10 นาที)
3. **Analyze** — จำแนก commit, ให้คะแนน DNA, ตรวจหาหมุดหมาย, กำหนดบทบาทผู้พัฒนา,
   ประเมินวุฒิภาวะ และสร้างชุดข้อมูลกราฟ
4. **Narrate** — เอนจินตำนาน (แบบ isomorphic) จับคู่ข้อเท็จจริงเหล่านั้นกับเทมเพลตเรื่อง 5 แบบ
   เพราะงั้นการสลับโหมดจึงเกิดทันทีและทำงานบน client ทั้งหมด

> เรื่องเล่าเป็นแบบ **deterministic** ไม่ได้สร้างจาก AI: มันไม่เคยมั่วข้อเท็จจริงที่ไม่มีในข้อมูล
> และไม่มีเนื้อหา repository ใดถูกส่งไปยังบริการของบุคคลที่สาม

### หมายเหตุเรื่องความแม่นยำ

metadata, ผู้พัฒนา, รีลีส และภาษา แม่นยำตามจริง ส่วนข้อมูลเชิง commit ใช้หน้าต่างล่าสุดที่
REST API เปิดให้ (สูงสุด 100 commit) เพราะงั้นความเร็วและบทบาทจึงสะท้อนกิจกรรม _ล่าสุด_
ตำแหน่งบางจุดบนไทม์ไลน์ (เช่นการเติบโตของชุมชน) ระบุชัดว่าเป็น **ค่าโดยประมาณ**

## ▲ Deploy ขึ้น Vercel

1. push repository นี้ขึ้น GitHub
2. import ที่ <https://vercel.com/new> (ตรวจจับ framework เป็น Next.js อัตโนมัติ)
3. _ไม่บังคับ:_ เพิ่ม `GITHUB_TOKEN` ที่ **Project → Settings → Environment Variables**
4. Deploy ไม่ต้องใช้ฐานข้อมูลหรือบริการอื่นใด

## 📄 License

[MIT](LICENSE) © 2026 Gman
