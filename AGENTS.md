<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Content Library cards own their channel and audience preview state so each card only exposes channels that campaign actually sends.
- Campaign-level Directful AI editing replaces the live preview in context and can minimize to a persistent rail without covering or resetting the editor.
- The package-level AI content planner renders inline above the calendar; campaign-level AI editing remains inside the review workspace's dynamic panel so context never disappears.
- Content release data lives in src/lib/releases.ts as one mock source for Content, Releases and Results.
- Releases and Results use one selected publication and its matching prior-period comparison; avoid unrelated analytics hierarchies.
