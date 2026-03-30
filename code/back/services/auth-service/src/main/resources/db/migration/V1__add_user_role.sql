-- Migration: adiciona coluna role à tabela users
-- Aplica o valor padrão USER a todos os registros existentes

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';
