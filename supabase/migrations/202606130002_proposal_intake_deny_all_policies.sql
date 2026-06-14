create policy proposal_intake_drafts_server_only
  on public.proposal_intake_drafts
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy proposal_intake_documents_server_only
  on public.proposal_intake_documents
  for all
  to anon, authenticated
  using (false)
  with check (false);
