-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('events', 'events', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-posts', 'blog-posts', true);

-- Create storage policies for events bucket
CREATE POLICY "Anyone can view event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');

CREATE POLICY "Admins can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'events' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'events' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'events' AND public.has_role(auth.uid(), 'admin'));

-- Create storage policies for blog-posts bucket
CREATE POLICY "Anyone can view blog post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-posts');

CREATE POLICY "Admins can upload blog post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-posts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-posts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-posts' AND public.has_role(auth.uid(), 'admin'));