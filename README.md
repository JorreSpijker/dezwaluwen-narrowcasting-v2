# Zwaluwen Narrowcasting

Een narrowcasting systeem voor korfbalvereniging Zwaluwen, gebouwd met Next.js en Tailwind CSS.

## Functionaliteiten

- **Standen**: Actuele competitiestanden per poule via de Korfbal Nederland API
- **Programma**: Uitslagen en aankomende wedstrijden (toont huidige/volgende week)
- **Nieuws**: Beheer van nieuwsitems via Supabase database
- **Instellingen**: Configuratie van club code, club naam, logo upload en thema kleuren
- **Logo beheer**: Upload en beheer van club logo via Supabase Storage
- **Thema kleuren**: Aanpasbare kleuren voor branding en personalisatie
- **Thuisteam detectie**: Automatische herkenning van eigen teams o.b.v. clubnaam
- **Caching**: Automatische caching van API data (1 uur)

## Technische Stack

- **Frontend**: Next.js 15 met App Router
- **Styling**: Tailwind CSS met Headless UI componenten
- **Database**: Supabase
- **API**: Korfbal Nederland API
- **Icons**: Heroicons

## Setup

### 1. Installatie

```bash
npm install
```

### 2. Environment Variables

Maak een `.env.local` bestand aan in de root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Korfbal API
NEXT_PUBLIC_KORFBAL_API_BASE_URL=https://api-mijn.korfbal.nl/api/v2

# Default club code (can be overridden in settings)
NEXT_PUBLIC_DEFAULT_CLUB_CODE=NCX35M2
```

### 3. Supabase Database Setup

Maak de volgende tabellen aan in je Supabase database:

#### Settings Table
```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  club_code TEXT NOT NULL,
  club_name TEXT NOT NULL,
  logo_url TEXT,
  theme_color TEXT DEFAULT '#FF6600',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### News Table
```sql
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Storage Bucket Setup

Voor logo upload functionaliteit, maak een Storage bucket aan in je Supabase dashboard:

1. Ga naar Storage in je Supabase dashboard
2. Maak een nieuwe bucket aan met naam: `club-logos`
3. Zet de bucket op 'Public' 
4. Configureer file size limit: 5MB
5. Toegestane MIME types: `image/jpeg, image/png, image/svg+xml, image/webp`

Of voer deze SQL queries uit in je Supabase SQL Editor:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('club-logos', 'club-logos', true);

-- Set up policies
CREATE POLICY "Anyone can upload club logos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'club-logos');

CREATE POLICY "Anyone can view club logos" ON storage.objects
FOR SELECT USING (bucket_id = 'club-logos');

CREATE POLICY "Anyone can update club logos" ON storage.objects
FOR UPDATE USING (bucket_id = 'club-logos');

CREATE POLICY "Anyone can delete club logos" ON storage.objects
FOR DELETE USING (bucket_id = 'club-logos');
```

### 4. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## API Endpoints

- `/api/pools/[clubCode]` - Poule codes voor een club
- `/api/program/[clubCode]` - Programma en uitslagen voor een club
- `/api/standings/[poolId]` - Standen voor een specifieke poule
- `/api/revalidate` - Cache invalidatie endpoint

Alle endpoints hebben automatische caching van 1 uur met cache tags voor selectieve invalidatie.

### Cache Management

Het systeem gebruikt Next.js cache tags voor intelligente cache invalidatie:
- Wanneer club instellingen worden gewijzigd, wordt automatisch alle relevante cache gewist
- Cache tags: `pools`, `program`, `standings` + club-specifieke tags
- De cache wordt automatisch vernieuwd wanneer instellingen worden opgeslagen

### Thema Kleuren

Het systeem ondersteunt volledig aanpasbare thema kleuren:
- **Dynamische kleuren**: Alle UI componenten passen zich automatisch aan op basis van de gekozen thema kleur
- **Live preview**: Direct zichtbare wijzigingen zonder herlaad van de pagina
- **Kleur picker**: Intuïtieve interface met voorgedefinieerde kleuren en custom hex input
- **CSS variabelen**: Gebruikt moderne CSS custom properties voor real-time updates
- **Consistent branding**: Één kleur bepaalt het volledige kleurenschema van het systeem

## Deployment

Het project kan eenvoudig gedeployed worden op Vercel:

1. Push je code naar GitHub
2. Verbind je repository met Vercel
3. Voeg je environment variables toe in de Vercel dashboard
4. Deploy!

## Toekomstige Uitbreidingen

- Push notificaties voor nieuwe wedstrijden
- Responsive design voor verschillende schermformaten  
- Admin panel voor nieuws beheer
- Live scores tijdens wedstrijden
- Historische standen en statistieken
- Export functionaliteit voor standen en programma

## Ondersteuning

Voor vragen over de Korfbal Nederland API, zie: https://api-mijn.korfbal.nl
