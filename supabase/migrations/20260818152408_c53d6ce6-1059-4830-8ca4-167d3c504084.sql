CREATE POLICY "Assets are readable" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Admins upload assets" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update assets" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete assets" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'assets' AND public.has_role(auth.uid(), 'admin'));