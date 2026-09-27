# Final Content Workspace Redesign

## Goal
Make Content, Releases, and Results feel like one modern publication workspace: editing happens in context, scheduled months are easy to scan, AI work feels alive, and every result clearly belongs to a publication, month, and campaign.

## Content calendar
- Replace the single-month calendar with a date-range view control so users can switch between one month and ranges such as September–November.
- Render selected months as three clear columns on desktop, inspired by the supplied board layout; stack cleanly on smaller screens.
- Keep scheduled, live, default, and draft campaigns visible inside each month column with strong status and timeframe labels.
- Preserve campaign card channel and Direct/OTA controls while tightening hierarchy, spacing, and visual states.

## Campaign editing and AI assistant
- Change **Edit with AI** in the automated-invite editor so it replaces the existing preview area instead of opening another popup.
- Keep the selected campaign, Direct/OTA audience, and Text/Email channel fixed while switching the right-hand area between Preview and AI editing.
- Add a minimize/restore control: minimized AI becomes a slim persistent side rail within the editor, available while editing other content without covering it.
- Restyle the assistant using the supplied clean assistant references: focused identity, spacious transcript, modern fixed composer, attachment actions, and clear proposal/apply states using Directful blue and neutral tokens.
- Keep manual editing, comparison, insights, and save behavior in the same contextual workspace.

## AI planning and generation
- Upgrade the planner layout and composer to match the visual quality of the references while retaining the existing plan content, file support, and hospitality language.
- Restore a visible campaign-by-campaign generation sequence: each campaign moves from queued to writing to complete, with its Direct/OTA and Email/Text work made explicit.
- Finish generation directly on the release review calendar, where users can review any campaign or publish immediately.

## Releases
- Replace the small sidebar/card arrangement with a publication timeline and expandable version ledger inspired by the supplied publication example.
- Group publications by year and make Live, Scheduled, and Archived states immediately distinguishable.
- Let users choose any publication and inspect its covered months in a three-column range view, then open campaign-level version details without losing publication context.
- Keep the concise AI summary of what changed and likely effect, but improve its visual emphasis and readability.

## Results
- Keep all metrics visibly attached to the selected publication and comparison period.
- Replace the current chart/table presentation with rich monthly result cards matching the supplied example: clicks, engagement/bookings/calls, comparison, and a plain-language insight per month.
- Add the same card-based treatment for campaigns so campaign results are as readable as month results.
- Remove all confidence labels and the Confidence column; use clear period/completeness wording such as “3 days measured” or “Full period” instead.
- Keep publication switching synchronized between Releases and Results.

## Technical details
- Reuse the existing shared mock release data and extend it only where the richer month/campaign cards need values and insight copy.
- Keep the existing Directful navigation, Roboto typography, semantic color tokens, compact controls, and maximum 8px corner radius.
- Update the existing architectural rule so campaign-level AI is contextual and minimizable rather than modal.

## Verification
- Verify Edit with AI swaps the preview area and minimizes/restores without freezing or losing edits.
- Verify one-month and September–November calendar views, scheduled states, and campaign interactions.
- Verify campaign-by-campaign generation reaches the release calendar and Publish remains available without review.
- Verify publication selection, year grouping, month/campaign breakdowns, and cross-page selection persistence.
- Verify desktop and mobile layouts, clean compilation, and no browser console errors.
