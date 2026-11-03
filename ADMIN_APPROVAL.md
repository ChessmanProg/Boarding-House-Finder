# Reviewing boarding house listings

New submissions are saved with the status `pending`. They are not visible to students until an administrator approves them.

## Review a submission

1. Open the [Boarding House Finder Supabase project](https://supabase.com/dashboard/project/plrbafvsxlknsdjwqiak).
2. Open **Table Editor** from the left sidebar.
3. Select the `public.listings` table.
4. Review the listing details, especially the boarding house name, location, rent, description, and contact information.
5. In that row, change the `status` field:
   - `approved` — publish the listing on the website.
   - `rejected` — keep the listing hidden.
   - `pending` — leave it awaiting review.

The website only reads rows where `status = approved`. New visitors can submit listing details, but the database does not allow them to set the status, approve, edit, delete, or truncate listings.

## Important

This first version uses the Supabase Dashboard as the administrator review area. It does not yet include an in-app admin panel because the website does not have administrator sign-in and role management yet. Do not add an approval button to the public page without first implementing secure administrator authentication.
