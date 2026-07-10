alter table vocabulary
add column if not exists romaji text;

update vocabulary
set romaji = case meaning
  when 'Japanese language' then 'nihongo'
  when 'to eat' then 'taberu'
  when 'water' then 'mizu'
  when 'big, large' then 'ookii'
  when 'school' then 'gakkou'
  when 'train' then 'densha'
  when 'friend' then 'tomodachi'
  when 'to drink' then 'nomu'
  when 'small, little' then 'chiisai'
  when 'teacher' then 'sensei'
  else romaji
end
where level_code = 'N5';
