-- Справочный SQL объёма данных (основной сид: bun run db:seed → scripts/seed.ts).
-- После migrate вставьте users, затем requests (assigned_to → users.id).

INSERT INTO users (name, password, role) VALUES
  ('dispatcher','disp123','dispatcher'),
  ('master1','m1pass','master'),
  ('master2','m2pass','master');

-- Пример: master1.id = 2, master2.id = 3 (если автоинкремент с 1 и dispatcher=1)
-- Заявки см. scripts/seed.ts — там полный набор из 15+ строк с разными статусами.
