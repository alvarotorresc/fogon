-- Fogon curated recipes seed
-- household_id = NULL, created_by = NULL → team/public recipes
-- Idempotent: ON CONFLICT DO NOTHING on all inserts

-- ============================================================
-- RECIPES
-- ============================================================

insert into public.recipes (id, household_id, title, description, prep_time_minutes, is_public, created_by, created_at)
values
  ('a1000000-0000-0000-0000-000000000001', NULL, 'Tortilla de patatas',        'La tortilla española clásica, jugosa por dentro y dorada por fuera.', 30, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000002', NULL, 'Gazpacho andaluz',           'Sopa fría de verano con tomates maduros y verduras frescas.',         20, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000003', NULL, 'Pasta aglio e olio',         'Pasta italiana rápida con ajo dorado, guindilla y perejil.',          15, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000004', NULL, 'Ensalada mediterránea',      'Ensalada fresca con tomate, pepino, aceitunas y queso feta.',          10, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000005', NULL, 'Guacamole casero',           'Guacamole fresco y cremoso con aguacate, tomate y lima.',             10, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000006', NULL, 'Hummus casero',              'Crema de garbanzos suave con tahini, limón y comino.',                15, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000007', NULL, 'Sopa de tomate',             'Sopa cremosa de tomate con albahaca y un toque de nata.',             30, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000008', NULL, 'Lentejas con verduras',      'Guiso nutritivo de lentejas con zanahoria, tomate y especias.',       45, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000009', NULL, 'Curry de garbanzos',         'Curry cremoso de garbanzos con leche de coco, espinacas y especias.', 35, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000010', NULL, 'Revuelto de champiñones',    'Revuelto esponjoso con champiñones salteados y ajo.',                 15, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000011', NULL, 'Tostadas de aguacate',       'Tostadas crujientes de masa madre con aguacate y tomate cherry.',     10, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000012', NULL, 'Arroz con leche',            'Postre tradicional cremoso con canela y piel de limón.',              40, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000013', NULL, 'Crema de calabacín',         'Crema suave de calabacín con caldo de verduras y nata.',              30, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000014', NULL, 'Salmorejo cordobés',         'Crema fría de tomate y pan, más espesa que el gazpacho.',             15, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000015', NULL, 'Pisto manchego',             'Guiso de verduras mediterráneas al estilo manchego.',                 40, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000016', NULL, 'Patatas bravas',             'Patatas fritas crujientes con salsa brava picante.',                  35, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000017', NULL, 'Pasta con pesto',            'Pasta con pesto fresco de albahaca, piñones y parmesano.',            20, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000018', NULL, 'Tortitas americanas',        'Tortitas esponjosas para el desayuno con mantequilla.',               20, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000019', NULL, 'Caldo de verduras',          'Caldo casero nutritivo base para sopas y guisos.',                    45, true, NULL, now()),
  ('a1000000-0000-0000-0000-000000000020', NULL, 'Berenjenas al horno',        'Berenjenas gratinadas con tomate, mozzarella y albahaca.',            40, true, NULL, now())
on conflict (id) do nothing;

-- ============================================================
-- INGREDIENTS
-- ============================================================

-- 1. Tortilla de patatas
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0001-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'patatas',      '500', 'g',          0),
  ('b1000000-0001-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'huevos',       '4',   'unidades',   1),
  ('b1000000-0001-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'cebolla',      '1',   'unidad',     2),
  ('b1000000-0001-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'aceite de oliva', NULL, 'al gusto',  3),
  ('b1000000-0001-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'sal',          NULL,  'al gusto',   4)
on conflict (id) do nothing;

-- 2. Gazpacho andaluz
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0002-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'tomates maduros',  '1000', 'g',       0),
  ('b1000000-0002-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'pepino',           '1',    'unidad',  1),
  ('b1000000-0002-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'pimiento rojo',    '½',    'unidad',  2),
  ('b1000000-0002-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'diente de ajo',    '1',    'unidad',  3),
  ('b1000000-0002-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'aceite de oliva',  '80',   'ml',      4),
  ('b1000000-0002-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'vinagre',          '30',   'ml',      5),
  ('b1000000-0002-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 'sal',              NULL,   'al gusto',6)
on conflict (id) do nothing;

-- 3. Pasta aglio e olio
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0003-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'espaguetis',       '400', 'g',       0),
  ('b1000000-0003-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'ajo',              '6',   'dientes', 1),
  ('b1000000-0003-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'guindilla seca',   '1',   'unidad',  2),
  ('b1000000-0003-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'aceite de oliva',  '80',  'ml',      3),
  ('b1000000-0003-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'perejil fresco',   NULL,  'al gusto',4),
  ('b1000000-0003-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'sal',              NULL,  'al gusto',5)
on conflict (id) do nothing;

-- 4. Ensalada mediterránea
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0004-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'tomates',          '3',   'unidades', 0),
  ('b1000000-0004-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 'pepino',           '1',   'unidad',   1),
  ('b1000000-0004-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'aceitunas negras', '100', 'g',        2),
  ('b1000000-0004-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'queso feta',       '150', 'g',        3),
  ('b1000000-0004-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004', 'cebolla morada',   '½',   'unidad',   4),
  ('b1000000-0004-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000004', 'aceite de oliva',  NULL,  'al gusto', 5),
  ('b1000000-0004-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 'orégano',          NULL,  'al gusto', 6)
on conflict (id) do nothing;

-- 5. Guacamole casero
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0005-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'aguacates',        '2',   'unidades', 0),
  ('b1000000-0005-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'tomate',           '1',   'unidad',   1),
  ('b1000000-0005-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 'cebolla',          '¼',   'unidad',   2),
  ('b1000000-0005-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 'cilantro',         NULL,  'al gusto', 3),
  ('b1000000-0005-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'lima',             '1',   'unidad',   4),
  ('b1000000-0005-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000005', 'sal',              NULL,  'al gusto', 5)
on conflict (id) do nothing;

-- 6. Hummus casero
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0006-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006', 'garbanzos cocidos','400', 'g',        0),
  ('b1000000-0006-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', 'tahini',           '3',   'cucharadas',1),
  ('b1000000-0006-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006', 'limón',            '1',   'unidad',   2),
  ('b1000000-0006-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006', 'ajo',              '1',   'diente',   3),
  ('b1000000-0006-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006', 'aceite de oliva',  NULL,  'al gusto', 4),
  ('b1000000-0006-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'comino',           NULL,  'al gusto', 5),
  ('b1000000-0006-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000006', 'sal',              NULL,  'al gusto', 6)
on conflict (id) do nothing;

-- 7. Sopa de tomate
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0007-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000007', 'tomates',             '800', 'g',   0),
  ('b1000000-0007-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000007', 'cebolla',             '1',   'unidad',1),
  ('b1000000-0007-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000007', 'ajo',                 '2',   'dientes',2),
  ('b1000000-0007-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000007', 'caldo de verduras',   '500', 'ml',  3),
  ('b1000000-0007-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000007', 'nata',                '100', 'ml',  4),
  ('b1000000-0007-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000007', 'albahaca',            NULL,  'al gusto',5)
on conflict (id) do nothing;

-- 8. Lentejas con verduras
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0008-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000008', 'lentejas',          '300', 'g',       0),
  ('b1000000-0008-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000008', 'zanahoria',         '2',   'unidades',1),
  ('b1000000-0008-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000008', 'cebolla',           '1',   'unidad',  2),
  ('b1000000-0008-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000008', 'ajo',               '2',   'dientes', 3),
  ('b1000000-0008-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000008', 'tomate triturado',  '200', 'g',       4),
  ('b1000000-0008-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000008', 'pimentón',          NULL,  'al gusto',5),
  ('b1000000-0008-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000008', 'comino',            NULL,  'al gusto',6),
  ('b1000000-0008-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000008', 'sal',               NULL,  'al gusto',7)
on conflict (id) do nothing;

-- 9. Curry de garbanzos
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0009-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000009', 'garbanzos cocidos', '400', 'g',       0),
  ('b1000000-0009-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000009', 'leche de coco',     '400', 'ml',      1),
  ('b1000000-0009-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000009', 'espinacas',         '200', 'g',       2),
  ('b1000000-0009-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000009', 'cebolla',           '1',   'unidad',  3),
  ('b1000000-0009-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000009', 'ajo',               '3',   'dientes', 4),
  ('b1000000-0009-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000009', 'curry en polvo',    '2',   'cucharadas',5),
  ('b1000000-0009-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000009', 'comino',            '1',   'cucharadita',6),
  ('b1000000-0009-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000009', 'sal',               NULL,  'al gusto',7)
on conflict (id) do nothing;

-- 10. Revuelto de champiñones
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0010-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000010', 'champiñones',       '300', 'g',     0),
  ('b1000000-0010-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000010', 'huevos',            '3',   'unidades',1),
  ('b1000000-0010-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000010', 'ajo',               '2',   'dientes',2),
  ('b1000000-0010-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000010', 'perejil',           NULL,  'al gusto',3),
  ('b1000000-0010-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000010', 'aceite de oliva',   NULL,  'al gusto',4),
  ('b1000000-0010-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000010', 'sal',               NULL,  'al gusto',5)
on conflict (id) do nothing;

-- 11. Tostadas de aguacate
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0011-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000011', 'pan de masa madre', '2',   'rebanadas',0),
  ('b1000000-0011-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000011', 'aguacate',          '1',   'unidad',   1),
  ('b1000000-0011-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000011', 'tomate cherry',     '6',   'unidades', 2),
  ('b1000000-0011-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000011', 'rúcula',            NULL,  'al gusto', 3),
  ('b1000000-0011-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000011', 'sal en escamas',    NULL,  'al gusto', 4),
  ('b1000000-0011-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000011', 'aceite de oliva',   NULL,  'al gusto', 5)
on conflict (id) do nothing;

-- 12. Arroz con leche
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0012-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000012', 'arroz redondo',     '150', 'g',     0),
  ('b1000000-0012-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000012', 'leche',             '1',   'l',     1),
  ('b1000000-0012-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000012', 'azúcar',            '100', 'g',     2),
  ('b1000000-0012-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000012', 'canela en rama',    '1',   'unidad', 3),
  ('b1000000-0012-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000012', 'piel de limón',     '1',   'unidad', 4)
on conflict (id) do nothing;

-- 13. Crema de calabacín
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0013-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000013', 'calabacines',       '3',   'unidades',0),
  ('b1000000-0013-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000013', 'cebolla',           '1',   'unidad',  1),
  ('b1000000-0013-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000013', 'patata',            '1',   'unidad',  2),
  ('b1000000-0013-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000013', 'caldo de verduras', '500', 'ml',      3),
  ('b1000000-0013-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000013', 'nata',              '50',  'ml',      4),
  ('b1000000-0013-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000013', 'sal',               NULL,  'al gusto',5),
  ('b1000000-0013-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000013', 'pimienta',          NULL,  'al gusto',6)
on conflict (id) do nothing;

-- 14. Salmorejo cordobés
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0014-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000014', 'tomates maduros',   '800', 'g',   0),
  ('b1000000-0014-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000014', 'pan del día anterior','150','g', 1),
  ('b1000000-0014-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000014', 'ajo',               '1',   'diente',2),
  ('b1000000-0014-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000014', 'aceite de oliva',   '100', 'ml',  3),
  ('b1000000-0014-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000014', 'vinagre',           '20',  'ml',  4),
  ('b1000000-0014-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000014', 'sal',               NULL,  'al gusto',5)
on conflict (id) do nothing;

-- 15. Pisto manchego
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0015-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000015', 'calabacín',         '2',   'unidades',0),
  ('b1000000-0015-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000015', 'berenjena',         '1',   'unidad',  1),
  ('b1000000-0015-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000015', 'pimiento rojo',     '1',   'unidad',  2),
  ('b1000000-0015-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000015', 'tomates',           '3',   'unidades',3),
  ('b1000000-0015-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000015', 'cebolla',           '1',   'unidad',  4),
  ('b1000000-0015-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000015', 'ajo',               '2',   'dientes', 5),
  ('b1000000-0015-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000015', 'aceite de oliva',   NULL,  'al gusto',6),
  ('b1000000-0015-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000015', 'sal',               NULL,  'al gusto',7)
on conflict (id) do nothing;

-- 16. Patatas bravas
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0016-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000016', 'patatas',           '600', 'g',   0),
  ('b1000000-0016-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000016', 'aceite de oliva',   NULL,  'para freír',1),
  ('b1000000-0016-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000016', 'tomate triturado',  NULL,  'al gusto',2),
  ('b1000000-0016-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000016', 'pimentón picante',  NULL,  'al gusto',3),
  ('b1000000-0016-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000016', 'ajo',               '2',   'dientes', 4)
on conflict (id) do nothing;

-- 17. Pasta con pesto
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0017-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000017', 'pasta',             '400', 'g',   0),
  ('b1000000-0017-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000017', 'albahaca fresca',   '50',  'g',   1),
  ('b1000000-0017-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000017', 'piñones',           '30',  'g',   2),
  ('b1000000-0017-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000017', 'queso parmesano',   '50',  'g',   3),
  ('b1000000-0017-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000017', 'ajo',               '1',   'diente',4),
  ('b1000000-0017-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000017', 'aceite de oliva',   '80',  'ml',  5),
  ('b1000000-0017-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000017', 'sal',               NULL,  'al gusto',6)
on conflict (id) do nothing;

-- 18. Tortitas americanas
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0018-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000018', 'harina',            '200', 'g',          0),
  ('b1000000-0018-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000018', 'huevos',            '2',   'unidades',   1),
  ('b1000000-0018-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000018', 'leche',             '250', 'ml',         2),
  ('b1000000-0018-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000018', 'azúcar',            '2',   'cucharadas', 3),
  ('b1000000-0018-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000018', 'levadura',          '1',   'cucharadita',4),
  ('b1000000-0018-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000018', 'mantequilla',       NULL,  'al gusto',   5),
  ('b1000000-0018-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000018', 'sal',               NULL,  'al gusto',   6)
on conflict (id) do nothing;

-- 19. Caldo de verduras
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0019-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000019', 'zanahoria',         '2',   'unidades',  0),
  ('b1000000-0019-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000019', 'apio',              '2',   'tallos',    1),
  ('b1000000-0019-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000019', 'cebolla',           '1',   'unidad',    2),
  ('b1000000-0019-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000019', 'puerro',            '1',   'unidad',    3),
  ('b1000000-0019-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000019', 'tomate',            '1',   'unidad',    4),
  ('b1000000-0019-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000019', 'perejil',           NULL,  'al gusto',  5),
  ('b1000000-0019-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000019', 'pimienta en grano', NULL,  'al gusto',  6),
  ('b1000000-0019-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000019', 'sal',               NULL,  'al gusto',  7)
on conflict (id) do nothing;

-- 20. Berenjenas al horno
insert into public.recipe_ingredients (id, recipe_id, name, quantity, unit, position)
values
  ('b1000000-0020-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000020', 'berenjenas',        '2',   'unidades',  0),
  ('b1000000-0020-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000020', 'tomate',            '2',   'unidades',  1),
  ('b1000000-0020-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000020', 'mozzarella',        '150', 'g',         2),
  ('b1000000-0020-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000020', 'albahaca',          NULL,  'al gusto',  3),
  ('b1000000-0020-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000020', 'aceite de oliva',   NULL,  'al gusto',  4),
  ('b1000000-0020-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000020', 'sal',               NULL,  'al gusto',  5),
  ('b1000000-0020-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000020', 'pimienta',          NULL,  'al gusto',  6)
on conflict (id) do nothing;

-- ============================================================
-- STEPS
-- ============================================================

-- 1. Tortilla de patatas
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0001-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 1, 'Pelar y cortar las patatas en láminas finas. Picar la cebolla en juliana.'),
  ('c1000000-0001-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 2, 'Pochar las patatas y la cebolla en abundante aceite de oliva a fuego medio durante 20 minutos.'),
  ('c1000000-0001-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 3, 'Batir los huevos con sal, añadir las patatas escurridas y mezclar bien.'),
  ('c1000000-0001-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 4, 'Cuajar la tortilla en una sartén con un poco de aceite a fuego medio, dar la vuelta con un plato y cocinar 2-3 minutos más.')
on conflict (id) do nothing;

-- 2. Gazpacho andaluz
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0002-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 1, 'Lavar y trocear los tomates, el pepino pelado y el pimiento. Pelar el ajo.'),
  ('c1000000-0002-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 2, 'Triturar todos los ingredientes juntos con la batidora hasta obtener una crema fina.'),
  ('c1000000-0002-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 3, 'Añadir el aceite, el vinagre y la sal. Rectificar al gusto.'),
  ('c1000000-0002-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 4, 'Colar por un chino para eliminar pieles y pepitas. Refrigerar al menos 1 hora antes de servir.')
on conflict (id) do nothing;

-- 3. Pasta aglio e olio
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0003-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 1, 'Cocer la pasta en agua con abundante sal según las instrucciones del paquete. Reservar un vaso de agua de cocción.'),
  ('c1000000-0003-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 2, 'Laminar los ajos finamente y dorarlos en el aceite a fuego medio-bajo con la guindilla troceada. Retirar cuando estén dorados (no quemados).'),
  ('c1000000-0003-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 3, 'Añadir la pasta escurrida a la sartén con el aceite de ajo. Agregar agua de cocción poco a poco y remover hasta ligar.'),
  ('c1000000-0003-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 4, 'Servir con perejil fresco picado por encima.')
on conflict (id) do nothing;

-- 4. Ensalada mediterránea
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0004-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 1, 'Lavar y cortar los tomates en gajos. Pelar y cortar el pepino en rodajas.'),
  ('c1000000-0004-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 2, 'Cortar la cebolla morada en aros finos. Desmenuzar el queso feta en trozos.'),
  ('c1000000-0004-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 3, 'Disponer todos los ingredientes en un plato o bol. Añadir las aceitunas.'),
  ('c1000000-0004-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 4, 'Aliñar con aceite de oliva virgen extra y orégano. Servir fresca.')
on conflict (id) do nothing;

-- 5. Guacamole casero
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0005-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 1, 'Partir los aguacates por la mitad, retirar el hueso y extraer la pulpa con una cuchara.'),
  ('c1000000-0005-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 2, 'Machacar la pulpa con un tenedor hasta obtener la textura deseada.'),
  ('c1000000-0005-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 3, 'Añadir el tomate picado sin semillas, la cebolla picada finamente, el cilantro y el zumo de lima.'),
  ('c1000000-0005-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 4, 'Salar al gusto y mezclar. Servir inmediatamente o cubrir con film a ras para evitar la oxidación.')
on conflict (id) do nothing;

-- 6. Hummus casero
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0006-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006', 1, 'Escurrir y enjuagar los garbanzos. Reservar un poco del líquido de cocción.'),
  ('c1000000-0006-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', 2, 'Triturar los garbanzos con el tahini, el zumo de limón, el ajo y el comino hasta obtener una pasta fina.'),
  ('c1000000-0006-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006', 3, 'Añadir el aceite de oliva en hilo mientras se sigue triturando. Ajustar la textura con el líquido reservado.'),
  ('c1000000-0006-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006', 4, 'Salar al gusto. Servir con un chorrito de aceite, pimentón y un poco de comino por encima.')
on conflict (id) do nothing;

-- 7. Sopa de tomate
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0007-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000007', 1, 'Sofreír la cebolla picada en aceite de oliva durante 5 minutos. Añadir el ajo laminado y cocinar 2 minutos más.'),
  ('c1000000-0007-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000007', 2, 'Incorporar los tomates troceados y cocinar a fuego medio 15 minutos removiendo de vez en cuando.'),
  ('c1000000-0007-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000007', 3, 'Añadir el caldo de verduras y llevar a ebullición. Cocinar 10 minutos más.'),
  ('c1000000-0007-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000007', 4, 'Triturar hasta obtener una crema fina. Añadir la nata, rectificar de sal y servir con albahaca fresca.')
on conflict (id) do nothing;

-- 8. Lentejas con verduras
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0008-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000008', 1, 'Enjuagar las lentejas. Sofreír la cebolla y el ajo picados en aceite hasta que estén blandos.'),
  ('c1000000-0008-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000008', 2, 'Incorporar la zanahoria en rodajas y cocinar 3 minutos.'),
  ('c1000000-0008-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000008', 3, 'Agregar el tomate triturado, el pimentón y el comino. Cocinar 5 minutos. Añadir las lentejas y cubrir con agua.'),
  ('c1000000-0008-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000008', 4, 'Cocinar a fuego medio-bajo durante 30-35 minutos hasta que las lentejas estén tiernas. Rectificar de sal.')
on conflict (id) do nothing;

-- 9. Curry de garbanzos
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0009-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000009', 1, 'Sofreír la cebolla picada en aceite hasta que esté transparente. Añadir el ajo picado y cocinar 1 minuto.'),
  ('c1000000-0009-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000009', 2, 'Añadir el curry en polvo y el comino. Tostar las especias 1 minuto removiendo.'),
  ('c1000000-0009-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000009', 3, 'Incorporar los garbanzos escurridos y la leche de coco. Cocinar a fuego medio 15 minutos.'),
  ('c1000000-0009-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000009', 4, 'Añadir las espinacas y cocinar 3-5 minutos hasta que se marchiten. Salar al gusto y servir con arroz.')
on conflict (id) do nothing;

-- 10. Revuelto de champiñones
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0010-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000010', 1, 'Limpiar y laminar los champiñones. Picar el ajo finamente.'),
  ('c1000000-0010-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000010', 2, 'Saltear el ajo en aceite de oliva 1 minuto. Añadir los champiñones a fuego alto hasta que suelten el agua y se doren.'),
  ('c1000000-0010-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000010', 3, 'Bajar el fuego, añadir los huevos batidos con sal y remover suavemente hasta que cuajen a gusto.'),
  ('c1000000-0010-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000010', 4, 'Espolvorear con perejil fresco picado y servir inmediatamente.')
on conflict (id) do nothing;

-- 11. Tostadas de aguacate
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0011-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000011', 1, 'Tostar las rebanadas de pan de masa madre en tostadora o plancha hasta que estén doradas y crujientes.'),
  ('c1000000-0011-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000011', 2, 'Machacar el aguacate con un tenedor y extenderlo sobre las tostadas.'),
  ('c1000000-0011-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000011', 3, 'Cortar los tomates cherry por la mitad y disponer sobre el aguacate junto con un puñado de rúcula.'),
  ('c1000000-0011-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000011', 4, 'Terminar con sal en escamas y un chorrito de aceite de oliva virgen extra.')
on conflict (id) do nothing;

-- 12. Arroz con leche
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0012-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000012', 1, 'Calentar la leche con la canela en rama y la piel de limón a fuego suave hasta que casi hierva.'),
  ('c1000000-0012-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000012', 2, 'Añadir el arroz lavado y cocinar a fuego muy bajo removiendo frecuentemente durante 30 minutos.'),
  ('c1000000-0012-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000012', 3, 'Incorporar el azúcar y cocinar 10 minutos más hasta obtener la cremosidad deseada.'),
  ('c1000000-0012-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000012', 4, 'Retirar la canela y la piel de limón. Servir en cuencos y espolvorear con canela molida.')
on conflict (id) do nothing;

-- 13. Crema de calabacín
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0013-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000013', 1, 'Pochar la cebolla picada en aceite a fuego medio. Añadir los calabacines y la patata troceados.'),
  ('c1000000-0013-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000013', 2, 'Cubrir con el caldo de verduras caliente y cocinar 20 minutos hasta que las verduras estén tiernas.'),
  ('c1000000-0013-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000013', 3, 'Triturar hasta obtener una crema fina. Añadir la nata y rectificar de sal y pimienta.'),
  ('c1000000-0013-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000013', 4, 'Servir caliente con un chorrito de aceite de oliva y opcional un poco de queso rallado.')
on conflict (id) do nothing;

-- 14. Salmorejo cordobés
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0014-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000014', 1, 'Trocear los tomates maduros. Remojar el pan del día anterior en agua fría 10 minutos y escurrir.'),
  ('c1000000-0014-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000014', 2, 'Triturar los tomates con el pan, el ajo y la sal hasta obtener una crema homogénea.'),
  ('c1000000-0014-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000014', 3, 'Con la batidora en marcha, añadir el aceite en hilo fino para emulsionar. Añadir el vinagre.'),
  ('c1000000-0014-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000014', 4, 'Colar si se desea una textura muy fina. Refrigerar mínimo 1 hora. Servir con huevo duro y jamón.')
on conflict (id) do nothing;

-- 15. Pisto manchego
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0015-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000015', 1, 'Cortar todas las verduras en dados medianos. Sofreír la cebolla y el ajo en aceite 5 minutos.'),
  ('c1000000-0015-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000015', 2, 'Añadir el pimiento rojo y cocinar 5 minutos. Incorporar la berenjena y el calabacín.'),
  ('c1000000-0015-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000015', 3, 'Cocinar a fuego medio 15 minutos removiendo ocasionalmente. Agregar los tomates troceados.'),
  ('c1000000-0015-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000015', 4, 'Cocinar 15 minutos más hasta que todas las verduras estén tiernas y el guiso se haya reducido. Salar.')
on conflict (id) do nothing;

-- 16. Patatas bravas
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0016-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000016', 1, 'Pelar y cortar las patatas en dados irregulares de unos 3 cm. Secar bien con papel de cocina.'),
  ('c1000000-0016-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000016', 2, 'Freír las patatas en aceite abundante a 180°C hasta que estén doradas y crujientes. Escurrir y salar.'),
  ('c1000000-0016-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000016', 3, 'Para la salsa: sofreír el ajo, añadir el tomate triturado y el pimentón picante. Cocinar 10 minutos.'),
  ('c1000000-0016-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000016', 4, 'Triturar la salsa hasta que quede fina. Verter sobre las patatas calientes y servir de inmediato.')
on conflict (id) do nothing;

-- 17. Pasta con pesto
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0017-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000017', 1, 'Cocer la pasta en agua con abundante sal según las instrucciones. Reservar un vaso de agua de cocción.'),
  ('c1000000-0017-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000017', 2, 'Triturar la albahaca, los piñones, el ajo y el parmesano en el procesador de alimentos.'),
  ('c1000000-0017-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000017', 3, 'Con el motor en marcha, añadir el aceite en hilo hasta obtener una salsa homogénea. Salar.'),
  ('c1000000-0017-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000017', 4, 'Mezclar la pasta escurrida con el pesto, añadiendo agua de cocción si fuera necesario para ligar la salsa.')
on conflict (id) do nothing;

-- 18. Tortitas americanas
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0018-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000018', 1, 'Mezclar la harina, el azúcar, la levadura y la sal en un bol. Hacer un hueco en el centro.'),
  ('c1000000-0018-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000018', 2, 'Batir los huevos con la leche y añadir al centro de la mezcla seca. Mezclar justo hasta integrar, sin batir en exceso.'),
  ('c1000000-0018-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000018', 3, 'Calentar una sartén a fuego medio con un poco de mantequilla. Verter un cucharón de masa por tortita.'),
  ('c1000000-0018-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000018', 4, 'Cocinar hasta que aparezcan burbujas en la superficie (2-3 min), dar la vuelta y cocinar 1 minuto más.')
on conflict (id) do nothing;

-- 19. Caldo de verduras
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0019-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000019', 1, 'Lavar y trocear todas las verduras en piezas grandes. No es necesario pelarlas si están bien limpias.'),
  ('c1000000-0019-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000019', 2, 'Colocar todas las verduras en una olla grande con 2 litros de agua fría, la pimienta en grano y la sal.'),
  ('c1000000-0019-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000019', 3, 'Llevar a ebullición, espumar si es necesario y reducir el fuego. Cocinar a fuego suave 35-40 minutos.'),
  ('c1000000-0019-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000019', 4, 'Colar el caldo descartando las verduras. Usar inmediatamente o conservar en nevera hasta 5 días.')
on conflict (id) do nothing;

-- 20. Berenjenas al horno
insert into public.recipe_steps (id, recipe_id, step_number, description)
values
  ('c1000000-0020-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000020', 1, 'Precalentar el horno a 200°C. Cortar las berenjenas en rodajas de 1 cm. Salar y dejar reposar 15 minutos para eliminar el amargor.'),
  ('c1000000-0020-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000020', 2, 'Secar las rodajas con papel de cocina. Disponer en una bandeja de horno, pincelar con aceite y hornear 15 minutos.'),
  ('c1000000-0020-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000020', 3, 'Cubrir cada rodaja con una rodaja de tomate y un trozo de mozzarella. Salpimentar.'),
  ('c1000000-0020-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000020', 4, 'Hornear 15-20 minutos más hasta que la mozzarella se funda y dore. Servir con albahaca fresca.')
on conflict (id) do nothing;
