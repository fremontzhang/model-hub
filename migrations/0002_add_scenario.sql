-- 添加 scenario 字段到 model_switches 表
ALTER TABLE model_switches ADD COLUMN scenario TEXT DEFAULT 'default';
