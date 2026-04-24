-- Script de Segurança RLS para Tabela Produtos
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar RLS na tabela produtos
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- 2. Política de Leitura (SELECT) - Todos podem ver produtos publicados
CREATE POLICY "Todos podem ver produtos publicados" ON produtos
  FOR SELECT USING (publicado = true);

-- 3. Política de Inserção (INSERT) - Apenas usuários autenticados podem criar produtos
CREATE POLICY "Usuários autenticados podem criar produtos" ON produtos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Política de Edição (UPDATE) - Apenas dono pode editar seus produtos
CREATE POLICY "Dono pode editar produtos" ON produtos
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Política de Exclusão (DELETE) - Apenas dono pode deletar seus produtos
CREATE POLICY "Dono pode deletar produtos" ON produtos
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Política adicional para SuperAdmin (se necessário)
CREATE POLICY "SuperAdmin pode gerenciar todos produtos" ON produtos
  FOR ALL USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.tipo_usuario = 'produtor'
    )
  );

-- 7. Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'produtos';
