-- Persist match outcome + wire career records to match-end.
-- Adds matches.winner_id so /api/matches/end can record who won, and an
-- atomic RPC that bumps player_records for a single player.

alter table matches
  add column if not exists winner_id text;

create index if not exists matches_winner_idx
  on matches (winner_id)
  where winner_id is not null;

-- Upsert a player's career record by one match. Callers pass p_won to pick
-- which counter increments. matches_played and last_played_at always bump.
create or replace function bump_player_record(p_player_id text, p_won boolean)
returns void language plpgsql security definer as $$
begin
  insert into player_records (player_id, wins, losses, matches_played, last_played_at)
  values (
    p_player_id,
    case when p_won then 1 else 0 end,
    case when p_won then 0 else 1 end,
    1,
    now()
  )
  on conflict (player_id) do update
    set wins           = player_records.wins   + case when p_won then 1 else 0 end,
        losses         = player_records.losses + case when p_won then 0 else 1 end,
        matches_played = player_records.matches_played + 1,
        last_played_at = now(),
        updated_at     = now();
end;
$$;
