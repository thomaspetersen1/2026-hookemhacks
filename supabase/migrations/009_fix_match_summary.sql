-- Fix write_match_summary: the original migration (003) referenced t.occurred_at
-- from a subquery that never selected it, so the RPC failed with
--   "column t.occurred_at does not exist"
-- at plan time on every call. Rewrite using CTEs so the time bounds and the
-- per-type counts come from clearly separate sources.

create or replace function write_match_summary(p_match_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into match_summaries (
    match_id, player_id, started_at, ended_at, duration_ms, event_totals
  )
  with per_player as (
    select
      match_id,
      player_id,
      min(occurred_at) as started_at,
      max(occurred_at) as ended_at
    from match_events
    where match_id = p_match_id
    group by match_id, player_id
  ),
  per_type as (
    select match_id, player_id, event_type, count(*) as cnt
    from match_events
    where match_id = p_match_id
    group by match_id, player_id, event_type
  ),
  totals as (
    select match_id, player_id, jsonb_object_agg(event_type, cnt) as event_totals
    from per_type
    group by match_id, player_id
  )
  select
    p.match_id,
    p.player_id,
    p.started_at,
    p.ended_at,
    (extract(epoch from (p.ended_at - p.started_at)) * 1000)::integer as duration_ms,
    coalesce(t.event_totals, '{}'::jsonb) as event_totals
  from per_player p
  left join totals t
    on t.match_id = p.match_id and t.player_id = p.player_id
  on conflict (match_id) do update
    set ended_at     = excluded.ended_at,
        duration_ms  = excluded.duration_ms,
        event_totals = excluded.event_totals;
end;
$$;
