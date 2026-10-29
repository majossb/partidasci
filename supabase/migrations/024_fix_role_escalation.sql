-- 024_fix_role_escalation.sql
-- Elimina el fallback a user_metadata que permite escalación de privilegios.
-- El rol SOLO debe leerse de app_metadata (escritura reservada al service role).
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT LOWER(
    COALESCE(
      auth.jwt() -> 'app_metadata' ->> 'role',
      (
        SELECT raw_app_meta_data ->> 'role'
        FROM auth.users
        WHERE id = auth.uid()
      )
    )
  );
$$ LANGUAGE sql SECURITY DEFINER;
