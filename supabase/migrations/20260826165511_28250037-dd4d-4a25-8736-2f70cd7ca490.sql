ALTER TABLE public.dashboards ADD COLUMN IF NOT EXISTS cover_url text;

DROP POLICY IF EXISTS "Covers are readable" ON storage.objects;
CREATE POLICY "Covers are readable" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Admins upload covers" ON storage.objects;
CREATE POLICY "Admins upload covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update covers" ON storage.objects;
CREATE POLICY "Admins update covers" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete covers" ON storage.objects;
CREATE POLICY "Admins delete covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin'));