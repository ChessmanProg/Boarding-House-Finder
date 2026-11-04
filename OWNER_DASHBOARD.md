# Owner dashboard

The website's owner dashboard is available at the same site URL with the query parameter `?admin=1`.

The only owner email currently authorized is:

`tneilandre20@gmail.com`

## Sign in for the first time

1. Open the website.
2. Click the account/avatar control in the top-right corner. This opens the owner dashboard.
3. Click **Email me a sign-in link**.
4. Open the message delivered to `tneilandre20@gmail.com` and click the sign-in link in the same browser where the website is open.
5. Once authenticated, the owner dashboard loads the listings.

The first successful magic-link confirmation creates the Supabase Auth user if it does not already exist. No password or service-role key is used in the browser.

## Configure the magic-link redirect

Supabase only redirects sign-in links to URLs allowed by the project's Auth URL Configuration.

If Supabase reports that the redirect URL is not allowed:

1. Open the [Supabase Authentication URL Configuration](https://supabase.com/dashboard/project/plrbafvsxlknsdjwqiak/auth/url-configuration).
2. Under **Redirect URLs**, add the exact Codespaces forwarded-port site URL shown in the browser address bar, with a trailing `/**` path pattern. For example, replace the sample host with the exact host from your browser: `https://YOUR-CODESPACE-5173.app.github.dev/**`.
3. Save the configuration.
4. Return to the website and request a new sign-in link.

Add the production website URL to the same allow-list once the final GitHub Pages or custom-domain URL is known.

## Manage listings

The owner dashboard provides filters for pending, approved, rejected, and all records.

- **Approve & publish** changes status to `approved`; the listing becomes visible to students.
- **Reject** changes status to `rejected`; the listing remains hidden.
- **Remove permanently** deletes the record after a browser confirmation. Deletion cannot be undone.
- **Refresh** reloads the current records.
- **Sign out** ends the Supabase session.

## Access control

The database enforces access through Row Level Security (RLS), not merely through hidden buttons or frontend email checks.

Only a signed-in session with the owner email claim `tneilandre20@gmail.com` can read pending/rejected listings, update a listing's status, or delete a listing. Anonymous users may submit pending listings and read approved listings, but cannot set a status, update, delete, or truncate records.

The browser uses only the Supabase publishable key. Never put a Supabase secret/service-role key in frontend code or Vite environment variables.
