# PKM Center - Open Recruitment Website

Website resmi Open Recruitment PKM Center 2025. Dibangun dengan Next.js 15, TypeScript, Tailwind CSS v4, Supabase, dan Vercel.

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Database** | Supabase (PostgreSQL) |
| **Forms** | React Hook Form + Zod |
| **Icons** | Lucide React |
| **Deployment** | Vercel |
| **Email** | Resend (optional) |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/register/route.ts    # API endpoint for form submission
│   ├── globals.css              # Global styles + Tailwind config
│   ├── layout.tsx               # Root layout with metadata
│   └── page.tsx                 # Main landing page
├── components/
│   ├── Header.tsx               # Navigation header
│   ├── Hero.tsx                 # Hero section with stats
│   ├── Features.tsx             # Program cards
│   ├── About.tsx                # About section with timeline
│   ├── Divisions.tsx            # 6 Divisions detail
│   ├── RegistrationForm.tsx     # Form with validation
│   └── Footer.tsx               # Footer with links
├── lib/
│   └── supabase.ts              # Supabase client + helpers
└── types/
    └── registration.ts          # Zod schema + types
supabase/
└── migrations/
    └── 001_create_registrations.sql
```

## 🛠️ Setup Local Development

### 1. Clone & Install
```bash
cd /mnt/c/Users/USER/oprec-pkm-center
npm install
```

### 2. Setup Supabase
1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → jalankan isi `supabase/migrations/001_create_registrations.sql`
3. Ambil **Project URL** & **Anon Key** dari **Settings > API**

### 3. Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local dengan kredensial Supabase kamu
```

### 4. Run Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000)

## 📝 Form Validation Rules

| Field | Validation |
|-------|------------|
| `full_name` | Min 2 karakter |
| `email` | Format email + harus `@student.univ.ac.id` |
| `phone` | Format Indonesia: `08xxxxxxxxxx` atau `+628xxxxxxxxx` |
| `student_id` | 8-15 digit |
| `major` | Pilih dari dropdown |
| `batch` | Pilih angkatan (2021-2026) |
| `motivation` | 100-1000 karakter |
| `division_preference` | Pilih 1 dari 6 divisi |
| `instagram` | Username tanpa `@`, 3-30 karakter alfanumerik + `_` `.` |
| `linkedin` | URL valid (opsional) |
| `portfolio` | URL valid (opsional) |

## 🚀 Deploy ke Vercel

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit: PKM Center Open Recruitment"
git branch -M main
git remote add origin https://github.com/username/oprec-pkm-center.git
git push -u origin main
```

### 2. Import di Vercel
1. Buka [vercel.com/new](https://vercel.com/new)
2. Import repository GitHub
3. Tambah Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### 3. Custom Domain (Optional)
- Settings > Domains > Add domain
- Vercel otomatis handle SSL & CDN global

## 📧 Email Notifications (Optional)

Setup Resend untuk notifikasi email otomatis:

1. Daftar di [resend.com](https://resend.com) → dapatkan API Key
2. Verify domain `pkmcenter.id` (atau pakai domain Vercel gratis)
3. Tambah `RESEND_API_KEY` & `EMAIL_FROM` ke Vercel Environment Variables
4. Update `src/app/api/register/route.ts` untuk kirim email

## 🎨 Customization

### Warna Brand
Edit `src/app/globals.css` → `@theme` section:
```css
--color-primary-500: #6366f1;  /* Indigo */
--color-primary-600: #4f46e5;
```

### Konten Halaman
- **Hero stats**: Edit `src/components/Hero.tsx`
- **Program cards**: Edit `src/components/Features.tsx`
- **Divisi detail**: Edit `src/components/Divisions.tsx`
- **Timeline**: Edit `src/components/About.tsx`

### Form Fields
- Schema validasi: `src/types/registration.ts`
- UI Form: `src/components/RegistrationForm.tsx`

## 📱 Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Tablet portrait |
| `md` | 768px | Tablet landscape |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |

## ♿ Accessibility

- Semantic HTML5 (`header`, `main`, `section`, `footer`, `nav`, `article`)
- ARIA labels & roles pada elemen interaktif
- Focus visible states
- Color contrast WCAG AA
- Keyboard navigable
- Screen reader friendly

## 🔒 Security

- RLS (Row Level Security) di Supabase
- Validasi client-side (Zod) + server-side (API route)
- Environment variables untuk secrets
- HTTPS enforced by Vercel
- No sensitive data di client bundle

## 📊 Performance

- Next.js Image Optimization (untuk gambar nanti)
- Font optimization dengan `next/font`
- Code splitting otomatis per route
- Static generation untuk halaman utama
- Edge Network via Vercel CDN

## 🐛 Troubleshooting

### "Module not found" error
```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase connection failed
- Cek `NEXT_PUBLIC_SUPABASE_URL` format: `https://xxx.supabase.co`
- Cek Anon Key benar (bukan Service Role Key)
- Cek RLS policies di Supabase

### Form tidak submit
- Buka DevTools Network tab → cek `/api/register` response
- Cek console untuk error JavaScript
- Pastikan Supabase table `registrations` ada

## 📅 Timeline 3 Hari

| Hari | Target |
|------|--------|
| **Hari 1** | ✅ Setup project, landing page, form UI, deploy Vercel |
| **Hari 2** | Supabase DB, API route, email notif, testing |
| **Hari 3** | Polish UI, custom domain, SEO, launch! |

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Vercel Deployment](https://vercel.com/docs)

## 🤝 Contributing

1. Fork repository
2. Buat branch: `git checkout -b feature/nama-fitur`
3. Commit: `git commit -m "Add: nama fitur"`
4. Push: `git push origin feature/nama-fitur`
5. Buat Pull Request

## 📄 License

MIT License - bebas digunakan untuk keperluan organisasi kampus.

---

**Dibangun dengan ❤️ untuk PKM Center**  
*Platform percepatan riset, pengabdian masyarakat, & kompetisi ilmiah*