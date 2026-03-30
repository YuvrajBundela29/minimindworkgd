
-- Arena challenges table
CREATE TABLE public.arena_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  topic text NOT NULL,
  subject text NOT NULL,
  difficulty text CHECK (difficulty IN ('easy','medium','hard')),
  question text NOT NULL,
  correct_answer text NOT NULL,
  explanation text NOT NULL,
  hint text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.arena_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges" ON public.arena_challenges
  FOR SELECT TO authenticated USING (active = true);

-- Arena submissions table
CREATE TABLE public.arena_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid REFERENCES public.arena_challenges NOT NULL,
  user_answer text NOT NULL,
  score integer DEFAULT 0,
  time_taken_seconds integer,
  used_hint boolean DEFAULT false,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.arena_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own submissions" ON public.arena_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions" ON public.arena_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Arena leaderboard table
CREATE TABLE public.arena_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid REFERENCES public.arena_challenges NOT NULL,
  score integer NOT NULL,
  rank integer,
  display_name text,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE public.arena_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard" ON public.arena_leaderboard
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own leaderboard entry" ON public.arena_leaderboard
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Certificates table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  learning_path_id text NOT NULL,
  learning_path_name text NOT NULL,
  mastery_score integer NOT NULL,
  certificate_code text UNIQUE NOT NULL,
  issued_at timestamptz DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own certificates" ON public.certificates
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certificates" ON public.certificates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can verify certificates by code" ON public.certificates
  FOR SELECT TO anon USING (true);

-- Parent-child links table
CREATE TABLE public.parent_child_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id uuid NOT NULL,
  child_user_id uuid NOT NULL,
  child_nickname text,
  link_code text,
  code_expires_at timestamptz,
  linked_at timestamptz DEFAULT now(),
  UNIQUE(parent_user_id, child_user_id)
);

ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their links" ON public.parent_child_links
  FOR SELECT TO authenticated USING (auth.uid() = parent_user_id);

CREATE POLICY "Children can view their links" ON public.parent_child_links
  FOR SELECT TO authenticated USING (auth.uid() = child_user_id);

CREATE POLICY "Users can insert links" ON public.parent_child_links
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_user_id OR auth.uid() = child_user_id);

CREATE POLICY "Users can update their links" ON public.parent_child_links
  FOR UPDATE TO authenticated USING (auth.uid() = parent_user_id OR auth.uid() = child_user_id);

-- User coins table
CREATE TABLE public.user_coins (
  user_id uuid PRIMARY KEY NOT NULL,
  balance integer DEFAULT 0,
  total_earned integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coins" ON public.user_coins
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coins" ON public.user_coins
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coins" ON public.user_coins
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Coin transactions table
CREATE TABLE public.coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.coin_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.coin_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Shop items table
CREATE TABLE public.shop_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  cost_coins integer NOT NULL,
  item_type text NOT NULL,
  is_active boolean DEFAULT true
);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shop items" ON public.shop_items
  FOR SELECT USING (true);

-- User purchases table
CREATE TABLE public.user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_id text REFERENCES public.shop_items NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases" ON public.user_purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" ON public.user_purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_arena_submissions_user_challenge ON public.arena_submissions(user_id, challenge_id);
CREATE INDEX IF NOT EXISTS idx_arena_leaderboard_challenge_score ON public.arena_leaderboard(challenge_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(certificate_code);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_date ON public.coin_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parent_child_parent ON public.parent_child_links(parent_user_id);
