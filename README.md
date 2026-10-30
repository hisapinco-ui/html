# html

HTML projects.

## Posting to Instagram and Facebook

The **Post to Instagram and Facebook** workflow (`.github/workflows/post-social.yml`) publishes one approved image or video to `@sapinco.quotes` and the Sapinco Page.

1. Push the approved file into the `posts/` folder (JPEG for Instagram, MP4 for video).
2. In GitHub, open **Actions**, choose the workflow, and click **Run workflow**.
3. Enter the file path and caption. Leave **Dry run** ticked the first time: it checks both tokens and the file link and posts nothing.
4. Untick **Dry run** to post for real. The run's summary lists both post links.

Secrets used (repository secrets): `INSTAGRAM_ACCESS_TOKEN`, `FACEBOOK_PAGE_ACCESS_TOKEN`.
Because Instagram fetches the file by link, anything in `posts/` is public in this repo.
