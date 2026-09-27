# Calendar-led Content Library and AI review

## Goal
Turn Content Library into a clear monthly publishing workspace: users immediately see what is live now, what is scheduled next, which version each campaign uses, and where AI-generated work is still awaiting review.

The visual direction will follow the supplied references: bright white workspace, restrained blue accents, centered dates, thin borders, compact controls, strong whitespace, and a polished assistant panel. Directful’s existing blue brand, Space Grotesk headings, and DM Sans body type stay intact.

## What will change

### 1. Published-content calendar
- Replace the current summary strip with a calendar-led header centered on the selected month.
- Show previous/next month controls, Live now or Scheduled status, and the active content version together.
- Add a version selector for each month so September can switch between default, live, and edited versions.
- Update campaign cards immediately when a version changes, including version badge, author/date, source, and matching content snippets.
- Present the choice between using default content and personalizing with AI as a polished overlay over the campaign grid, including September’s live content.
- Rename the header action to **Edit content** and remove Current package, Campaigns, and Availability.

### 2. AI planning workspace
- Rebuild the AI entry experience as a calm assistant workspace over the existing Content Library.
- Start with hospitality-focused copy: “Let’s personalize your guest content” and explain the goal in concise language.
- Keep the composer fixed at the bottom throughout the flow, with a plus menu and attachment previews for documents, spreadsheets/CSV, images, and video.
- Put timeframe selection inside the conversation body with start/end month controls and plain-language input support.
- Show discovered seasonal, hotel, and uploaded context as editable planning material rather than a separate decision toolbar.
- Show the complete plan in the conversation body with Review plan, Adjust, and Approve plan actions; approval begins generation.

### 3. Generated-content review
- After generation, show campaign cards as newly created AI drafts with content snippets and a clear Review action, visually distinct from published cards.
- Add a top-level **Publish all** action for reviewed campaigns.
- Reuse the same review popup and visuals as the manual content editor, with Direct/OTA guest selection and the matching content fields always visible. Keep the selected guest segment in context while the preview area switches dynamically among Preview, Edit with AI, Compare, and Content insight, so every mode operates on exactly the content currently selected in the header without leaving the review.
- Keep manual editing available in the same editor structure used by Automated Invites.
- Limit AI suggestions to five concise actions; remove the oversized personalization dropdown.
- Preserve the existing comparison experience and explain what changed, why it is better, and which performance patterns informed it.
- Show **Save changes** whenever review edits are made, before publishing.

## State and interaction model
- Add month-aware package versions to the in-memory Content Library sample data.
- Keep default, live, scheduled, draft, reviewed, and published states distinct.
- Version selection drives the visible campaign copy instead of changing labels only.
- Uploaded files are represented in the planning conversation and influence the sample plan/generation context; no real external AI or permanent file storage is added in this pass.

## Verification
- Test September live editing, future-month scheduling, version switching, default-content fallback, AI plan approval, attachment input, generated draft review, compare/insight/edit modes, saving, and publishing.
- Check desktop and narrow layouts, keyboard focus, overlays, and close/save behavior.
