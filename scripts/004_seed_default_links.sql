-- Seed default sidebar links
INSERT INTO sidebar_links (text, url, classrooms, years) VALUES
  ('ALTERAÇÃO DE SENHA', '#', ARRAY[]::text[], ARRAY[]::int[]),
  ('ACESSO AO E-MAIL', '#', ARRAY[]::text[], ARRAY[]::int[]),
  ('ACESSO AO CANVA', '#', ARRAY[]::text[], ARRAY[]::int[]),
  ('ACESSO AO PADLET', '#', ARRAY[]::text[], ARRAY[]::int[]),
  ('DOWNLOAD DO TEAMS', '#', ARRAY[]::text[], ARRAY[]::int[]),
  ('DOWNLOAD DO INSIGHT', '#', ARRAY[]::text[], ARRAY[]::int[]),
  ('ACERVO DE ÁUDIOS INTEF - YOUTUBE', '#', ARRAY[]::text[], ARRAY[]::int[]),
  ('ACERVO DE IMAGENS INTEF - PIXABAY', '#', ARRAY[]::text[], ARRAY[]::int[]),
  ('ACESSO AO MATIFIC', '#', ARRAY[]::text[], ARRAY[]::int[])
ON CONFLICT DO NOTHING;
