# Publication-led Releases and Results

## Goal
Make Releases and Results feel like one polished reporting workspace where the selected publication, its live status, timeframe, comparison period, and breakdown are always obvious.

## Releases
- Add an internal publication sidebar grouped by year, with multiple 2026 and 2025 publications and a strong selected state.
- Label the currently active publication clearly and separate it from archived publications.
- Show the selected publication’s date range, source, property adoption, editor activity, and replacement relationship in one concise header.
- Restore a simple AI summary explaining what changed in that publication, why it changed, and the expected effect.
- Add direct month and campaign views; selecting a month reveals its campaigns, and selecting a campaign reveals its version history.

## Results
- Reuse the same year-grouped publication sidebar so results always belong to a named publication.
- State the selected publication and measured date range above every result.
- Show comparison context explicitly, such as the equivalent 2025 publication or the previous live version.
- Present publication KPIs, AI interpretation with evidence, monthly performance, and campaign performance in a clear drill-down.
- Keep early results visibly labeled as partial rather than mixing them with full-period results.

## Visual direction
- Follow the selected editorial-ledger composition while retaining Directful’s current blue, white, and neutral colors.
- Use Roboto throughout; do not introduce the prototype’s serif styling.
- Keep the existing Directful navigation shell, compact controls, restrained shadows, and maximum 8px corner radius.
- Use subtle transitions for publication selection and drill-down changes.

## Data and behavior
- Expand the shared mock release scenario with realistic publication history across 2025 and 2026, plus publication-specific KPIs, monthly values, campaign values, comparisons, and insights.
- Keep Releases and Results synchronized through the same selected publication model.
- Preserve current Content Library behavior and existing release/version rules.

## Verification
- Check Releases and Results at desktop and mobile widths.
- Verify publication selection, year grouping, month drill-down, campaign drill-down, version history, and publication-specific result changes.
- Confirm clean compilation and no browser console errors.
