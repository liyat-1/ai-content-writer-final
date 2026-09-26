# Roadmap

- [x] Channel strategy: manage mode, selectable cards, floating panel, Apply/Done
- [x] Card edit metadata (who/when) moved to bottom row with tooltip
- [x] Media: folder create/rename/delete, media rename, upload, drag & drop, filters
- [x] Media picker: folder sidebar, search, realistic image/video/document thumbnails
- [x] Email editor: compact Template + Layout cards with a side layout library
- [x] Verified in preview (strategy, folders, layout library) — no console errors
- [x] Add a clear media section to email with image and video support
- [x] Redesign video thumbnails and polish folder-specific upload areas
- [x] Verify media polish in the preview at desktop and narrow widths — no console errors
- [x] Polish all marketing pages with a cohesive professional visual system
- [x] Add varied realistic media assets to the built-in media library
- [x] Show real imagery in template and layout selection, matching the email preview
- [x] Verify all marketing routes at desktop and mobile widths

## Marketing Messages product model and polish

- [x] Reframe campaign pages under Marketing Messages with section navigation, Copy from, and compact complimentary-text banner
- [x] Add global guest-type promotions with campaign-level overrides and a searchable promotion selector
- [x] Add global and campaign-level revert confirmations with the requested scope guarantees
- [x] Rebuild campaign cards around purpose, strategy, per-channel customization, promotion, Test, Edit content, and overflow actions
- [x] Add the contextual Edit automated content confirmation before opening each campaign editor
- [x] Convert the campaign editor to explicit draft/save behavior with unsaved-change protection and active-campaign save confirmation
- [x] Keep Direct/OTA and Text/Email content independent, with channel-level Default/Customized status
- [x] Restrict media attachments to Text and retain searchable folders plus in-editor upload/drop
- [x] Preserve content through layout changes and protect customized content during template changes
- [x] Stage channel-strategy changes in the floating panel, show dynamic strategy groupings, then commit once with Apply
- [x] Polish the centralized Media area, including safe folder deletion and live folder updates in campaign media pickers
- [x] Align Drip Campaign with the three supported channel strategies and Directful Marketing Messages branding
- [x] Verify every marketing page and critical workflow at desktop and mobile widths

## Marketing Messages workflow refinement

- [x] Replace campaign enable text with card toggles and keep the bulk enable/disable action state-aware
- [x] Simplify cards to campaign identity, strategy, updater avatar/date, and primary actions
- [x] Restore the compact channel-strategy panel with Select all and capped invite chips per strategy
- [x] Rebuild promotion management around invite/audience selection plus staged promotion assignment
- [x] Move campaign promotion controls into the Direct/OTA editor sections
- [x] Simplify the edit warning and retain the closable editor overlay with unsaved-change protection
- [x] Keep media Text-only; polish upload, scrolling, sizing, and remove folder filters from the picker
- [x] Expand content-rich template previews and structure-only layout choices without altering content
- [x] Add PPTX, CSV, XLSX, and other representative media samples
- [x] Polish and verify all marketing pages across desktop and mobile preview sizes

## Promotion assignment rework

- [x] Simple promotion badge on campaign cards
- [x] Replace collapsible promotions page with flat list plus Assign/Edit button
- [x] Full overlay: three automated message sections as drop targets, draggable campaign list, Direct/OTA checkboxes
- [x] Fixed hydration mismatch when saved marketing state differs from the seed (deferred localStorage load)
- [x] Verified badge, assign overlay, add/remove and Direct/OTA toggles at desktop and mobile widths — no console errors

## Collapsible tools section and sharp edges

- [x] Wire the collapsible Manage channel strategy / Manage promo / Text media section into the campaign pages (replaces the old media rail and duplicate header buttons)
- [x] Manage promo panel opens the per-segment promo manager (Direct/OTA rows with searchable change)
- [x] Promotion creation form with code type, discount %, minimum nights, tagline, and validity dates
- [x] Promotion cards show code type, discount, minimum nights, and validity
- [x] Square off remaining pill and large-radius shapes across marketing (max 8px, most 3px)
- [x] Remove superseded MediaDock / PromoDropOverlay / StrategyBar components
- [x] Type check passes; verify tools section, promo creation, and rounding at desktop and mobile widths

## Promotion editor overlay and banner templates

- [x] Pop-up overlay for creating and editing promotions: Details section (code beside code type) plus a Banner design section with a live guest preview
- [x] Five banner layout templates (Ribbon, Ticket, Spotlight, Frame, Minimal) with the eight colour themes
- [x] Logo and background photo slots fed from the media library (demo hotel emblem added under a new Logos folder; uploads supported via the picker)
- [x] Editable banner wording: kicker line, property name, and headline with emoji picker
- [x] Edit and Assign separated on promotion cards; cards show scaled live banner thumbnails
- [x] Verified create/save/reopen, edit-existing, template and colour persistence, logo pick, and mobile width — no console errors

## Promotion workflow and content previews

- [x] Stack campaign tools vertically on desktop and mobile
- [x] Separate promotion maintenance and assignment into tabs
- [x] Add duplicate and safe delete actions for promotions
- [x] Move promotion preview to the bottom of the promotion editor
- [x] Move campaign promotion controls below content with a Change action
- [x] Show attached promotions in text and email previews
- [x] Verify promotion workflows at desktop and mobile widths


## Promotion presentation polish

- [x] Add direct promotion removal inside campaign content editing
- [x] Restyle the edit-content warning with clear warning hierarchy
- [x] Add modern promotion banner templates
- [x] Place promotions naturally before email buttons
- [x] Replace unclear starter promotion wording
- [x] Verify updated workflows and previews

## Promotion banner and editor cleanup

- [x] Convert campaign content editing from a full-screen takeover to a large popup
- [x] Fix promotion chooser layering and restore interaction after selecting, cancelling, or removing
- [x] Show the short offer description across all banner templates
- [x] Add Upgrade card, Schedule card, and Included perks image-led templates
- [x] Add matching template previews to the promotion editor
- [x] Verify the editor and chooser at desktop and mobile widths

## Campaign management and content editor redesign

- [x] Replace the collapsible strategy panel with one launcher button plus direct promo/media buttons with status counts
- [x] Show strategy explanations beneath each drop column with a "What does this mean?" help control in the popup
- [x] Rebuild promo assignment around four user-chosen offer areas with a "Choose promotion" picker
- [x] List campaigns as a draggable horizontal row below the offer areas
- [x] Add Direct/OTA checkboxes on each campaign/offer relationship with conflict notes
- [x] Add All/Direct/OTA global media targets and per-campaign per-audience drops and removals
- [x] Make media helpers audience-scoped while keeping combined campaign summaries
- [x] Replace editor tabs with Direct/OTA audience sections driving the persistent preview
- [x] Move media/promotion (text) and promotion (email) into expandable Advanced settings
- [x] Keep template/layout secondary in email editing; copy fields first
- [x] Add History, Help and Spam check panels to each audience section
- [x] Refresh the phone frame and iMessage preview with frosted-glass chrome
- [x] Verified overlays, drag model, editor panels, and email/text previews via Playwright — no console errors; typecheck clean

## Promotion, media, and editor follow-up

- [x] Add a No promotion assignment column and move unassigned campaigns there
- [x] Replace the separate campaign row with drag-and-drop between assignment columns
- [x] Add assigned-media thumbnails and global bulk removal
- [x] Separate media assignment into Text and Email tabs with Direct and OTA targets
- [x] Move Text and Email to top-level editor tabs with Direct and OTA sections inside
- [x] Rename advanced controls to channel-specific professional wording
- [x] Add emoji insertion to Text and Email content fields
- [x] Match the phone preview more closely to the supplied iPhone 17 Pro Max references
- [x] Verify all updated workflows at desktop and mobile widths
- [x] Mouse-drag verified across offer columns (No promotion → offer 1 → offer 2) with no errors
- [x] Phone-width pass on promo manager and content editor — previews and offer banner render correctly

## Config details, media board, phone polish

- [x] Offer columns show a single "See config details" panel (code type, code, discount, minimum nights, validity, per-guest duration, description) with Change/Clear inside
- [x] Media assignment rebuilt on the promo model: fixed campaign column, file columns with Change file / Browse library, Direct/OTA checkboxes
- [x] Both boards are horizontally scrollable with Add offer / Add file, so the count is not fixed at three
- [x] iPhone preview: composer pinned outside the scroll area, frosted glass, larger; content no longer overflows the frame

## Carried over from the credit pause

- [x] Fix the content editor freezing when closing (X) or saving (confirm dialogs sat behind the editor overlay; raised them above)
- [x] Move Change/Clear out of "See config details" onto the promo side; config shows promo details only; media columns get Change file / Clear column directly
- [x] Verify content editor workflows at desktop and mobile widths
- [x] Open and verify the Directful AI Content page (create, generate, review, approve, publish, tabs, Ask panel, mobile)

## Content Library + AI creative workspace

- [x] Content Library side menu: Create, Published, Performance, A/B Tests, History, Settings
- [x] Create workspace: 12 campaign cards with content preview, search, filters, Create manually / Create with Directful AI
- [x] Immersive AI creation: timeframe first, discoveries, direction chat, plan, live generation, "Your content is ready"
- [x] Three-column review editor with segment switch, Edit with AI, intelligence panel, checklist, approve, publish
- [x] Put "Edit with AI" inside the existing Marketing campaign editor too

## AI Content library refinement

- [x] Replace the attached right-side AI editor with a centered, floating workspace over a softened editor backdrop
- [x] Remove search, filter tabs, and manual-create controls from the Content Library; show campaigns directly
- [x] Add card-level Email/Text and Direct/OTA preview controls, limited to each campaign's actual channels
- [x] Keep all primary actions blue and make AI-authored campaign cards visibly distinct
- [x] Reuse the existing campaign editor structure for Content Library editing and remove the review checklist
