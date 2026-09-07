# Duck App

Personal life tracker — streak/duck growth, daily checklist, food recommendations,
bodyweight training, work/pin-up deadlines, and budget — built from the
`Duck App.dc.html` design (see `../README.md` and `../chats/chat1.md` for the
original design brief).

## Run it locally

```bash
npm install
npm run dev
```

Works with zero configuration — it runs in **guest mode** (data saved to your
browser only, The Flock and MONEY sync disabled) until you add the credentials
below.

## Connecting the real integrations

Copy `.env.example` to `.env.local` and fill in what you set up below.

### 1. Firebase (accounts, cross-device sync, The Flock)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. Build → **Authentication** → Sign-in method → enable **Google**.
3. Build → **Firestore Database** → Create database (production mode, any region near you — `asia-southeast1` is closest to Bangkok).
4. Build → **Storage** → Get started (for taste-feed and daily photo uploads).
5. Project settings (gear icon) → General → "Your apps" → Add app → Web. Copy the `firebaseConfig` values into `VITE_FIREBASE_*` in `.env.local`.
6. Deploy the included security rules so only you (and flock members, for the leaderboard) can read/write your data:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore storage   # point at the existing firestore.rules / storage.rules in this folder
   firebase deploy --only firestore:rules,storage:rules
   ```

Without this, the app still works fully for one person on one device — it just
uses `localStorage` instead of Firestore, and The Flock has nowhere to sync to.

### 2. Google Places (live FOOD tab)

1. In the [Google Cloud console](https://console.cloud.google.com), create/select a project **with billing enabled** (Places API isn't free past a small monthly credit, but normal personal use stays inside it).
2. Enable **Places API (New)**.
3. Create an API key, then restrict it: Application restriction → "Websites" → add the domain you'll deploy to (and `localhost` for dev). API restriction → limit to "Places API (New)".
4. Put it in `VITE_GOOGLE_MAPS_API_KEY`.

Without this, FOOD shows five real Siam Square places (Jeh O Chula, Somtum Der,
etc.) as a static starter list instead of live results near you.

### 3. Google Sheets (live MONEY tab)

MONEY reads directly from George's existing **Income and Expenses Tracker**
template — no restructuring needed, just get it into Google Sheets:

1. In the same Cloud project, enable **Google Sheets API**.
2. Either reuse the same API key (add "Google Sheets API" to its restrictions) or make a second one, and set `VITE_GOOGLE_API_KEY`.
3. Open [sheets.google.com](https://sheets.google.com) → File → Import → Upload → pick the `.xlsx` tracker. Import as "a new spreadsheet" (this keeps the `Transactions`, `Monthly Overview`, `Setup` etc. tabs and their formulas intact — Google Sheets understands the SUMIFS/COUNTIFS the template uses).
4. Share it → **Anyone with the link → Viewer** (the app only ever reads it).
5. In the `Monthly Overview` tab, keep the `Month:` / `Year:` cells (`C7`/`C8`) set to whichever month you want MONEY to show — the app reads whatever that sheet currently has selected, live.
6. Copy the sheet ID from its URL (`docs.google.com/spreadsheets/d/THIS_PART/edit`) into the MONEY tab's "paste Sheet ID" field the first time you open it — it's saved after that.
7. Keep logging transactions in the `Transactions` tab as you already do (date, type, category, amount) — the Monthly Overview categories the app reads (`E15:F40` income, `H15:I40` expense) update themselves from that.

The template has no "necessary vs. want" flag on categories, so the app
starts with a reasonable guess per category (Food, Shopping, To TrueMoney,
Pay friends = wants; everything else = needed) and you can flip any line
with the **⇄** button — that choice is saved in the app, not written back
into your sheet, so your tracker file stays untouched.

Without this, MONEY shows a "not connected" state instead of numbers — there
are no fake placeholder figures anymore now that it reads your real sheet.

## Deploying as an installable PWA

`npm run build` outputs a static site in `dist/` with a web manifest and
service worker already wired up (`vite-plugin-pwa`) — host it anywhere static
(Firebase Hosting pairs naturally with the Firestore project above:
`firebase init hosting`, point it at `dist`, `firebase deploy`). Once deployed
over HTTPS, opening it on a phone offers "Add to Home Screen".

## What's real vs. estimated

- **Streak / midnight rule**: real. A background check (every minute, plus on
  load) resolves any Bangkok day that ended without you tapping "Close the
  day" — the streak survives at half if every P1 deliverable was marked done
  or flagged as a slip in WORK, and breaks to zero otherwise.
- **Pin-up countdown, class schedule, train/rest week**: real dates computed
  in Asia/Bangkok time from `src/data.ts` (edit `CLASS_SCHEDULE` there if your
  timetable changes next semester).
- **FOOD delivery ETA**: Google Places doesn't expose Grab/LINE MAN dispatch
  times, so it's estimated from straight-line distance — marked with a `*`
  and a footnote whenever live data is showing.
- **FOOD kcal**: Places has no calorie data either, so live results simply
  omit it rather than making a number up; the five starter places keep their
  original estimates.
