-- Replace weak MD5-based invite codes with cryptographically secure generation
-- MD5(random()) is not cryptographically secure; gen_random_bytes uses OS CSPRNG
alter table public.households
  alter column invite_code set default upper(encode(gen_random_bytes(6), 'hex'));
