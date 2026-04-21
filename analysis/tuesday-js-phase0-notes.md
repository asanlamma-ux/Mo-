# Tuesday.js Phase 0 Notes

Date: 2026-04-20 UTC

These notes are based on direct reads of the upstream Tuesday.js repository files:
- `tuesday.js`
- `doc_editor.html`
- `example/example_the_last_signal.json`
- repository root listing from GitHub API

## Immediate conclusion

The current Moe plan is directionally right about using Tuesday.js as the runtime target, but its proposed internal schema is not yet faithful to the real engine.

Before any React Native or C++ implementation starts, the project needs a source-accurate schema map for:
- top-level project structure
- block and scene nesting
- dialog element payloads
- variable mutation rules
- preview/save behavior

## Real repository files confirmed

The upstream repository currently includes:
- `tuesday.js`
- `tuesday_visual.html`
- `index.html`
- `doc_editor.html`
- `doc_runetime.html`
- `example/`
- `plugins/`
- `lakit.json`

The repo also has tags through at least `59.0.0`, which matches the version the plan suggested pinning.

## Real project structure observed

Tuesday.js is not modeled primarily as:
- `parameters`
- `characters`
- `scenes`

Instead, real project JSON is closer to:
- `parameters`
- `blocks`
- one top-level property per story block, such as `title_screen` or `scene_1_station`

Example shape:

```json
{
  "parameters": { "...": "..." },
  "blocks": {
    "title_screen": ["50px", "50px", "block", false]
  },
  "title_screen": [
    {
      "dialogs": [
        { "text": "..." },
        { "text": "...", "go_to": "scene_1_station" }
      ],
      "background_color": "#0f0f1a"
    }
  ]
}
```

This matters because the plan currently assumes a cleaner `scenes[]` array with `nodes[]`. That abstraction may still be useful internally, but it is not a direct superset of the native Tuesday.js format yet.

## Runtime model observed in `tuesday.js`

Key runtime globals and flow:
- `story_json` stores the loaded project
- `tue_story` is the active story block id
- `scene` is the scene index inside the active block
- `dialog` is the dialog index inside the active scene
- `creation_scene()` prepares the active scene
- `creation_dialog()` renders the current dialog
- `go_story()` advances the dialog pointer
- `go_to(id)` switches to another story block
- `save_stag()` and `load_stag()` persist progress and variables in `localStorage`

This indicates the engine is block-oriented first, then scene-oriented, then dialog-oriented.

## Real feature shapes found

Observed directly in engine code and docs:
- `parameters.languares`
- `parameters.launch_story`
- `parameters.variables`
- `parameters.buttons`
- `parameters.characters`
- `parameters.sounds`
- `parameters.plugins`
- `parameters.style_file`
- `parameters.resolutions`
- `parameters.text_panel`
- `parameters.name_panel`

Per-scene or per-dialog capabilities seen in code/docs:
- text and `text_add`
- `choice`
- `legacy_choice`
- `variables`
- `timer`
- `video`
- `sound`
- `background_color`
- `go_to`
- `show_if`
- raw `js`
- HTML content support

## Important mismatches against the current Moe plan

1. The plan assumes a normalized VN schema with node types like `dialogue`, `jump`, `showChar`, `wait`, and `codeBlock`.
The real engine uses a looser JSON structure with scene/dialog properties and UI-like elements such as buttons, choices, timers, video, style hooks, and inline JavaScript.

2. The plan assumes a dedicated `characters` array with sprites and positions as a central model.
The real engine does have `parameters.characters`, but presentation is also strongly tied to scene content, text panels, arts, buttons, and editor-managed settings.

3. The plan frames Tuesday.js as a mostly visual-novel node engine.
The actual engine is broader and more UI-driven. It supports quiz, interactive fiction, hidden objects, timers, gamepad, speech, CSS styling, external JS add-ons, and more.

4. The plan assumes export parity is just `story.json + tuesday.js`.
Real project portability also depends on relative working-folder assets and optional CSS, plugin, sound, and font files.

5. The plan proposes Luau as an authoring language that transpiles into a concise node graph.
That is viable only after a stable mapping is defined from Luau to the actual Tuesday.js block/scene/dialog schema, not the simplified schema currently written in the plan.

## Constraints the app design should respect

- Tuesday.js uses relative asset paths and expects the project JSON to live near its working assets.
- Autosave persists variables globally in browser storage and can leak across projects during preview.
- The editor documentation explicitly warns that saves do not include project assets, only JSON plus relative paths.
- Localization is pervasive. Many values can be either a scalar or per-language object.
- Inline JavaScript is already a first-class extension point in Tuesday.js.

## Recommended correction to the Moe architecture

Use a two-layer model instead of assuming the current proposed `StoryDocument` is already correct.

Layer 1:
- `TuesdayProjectJson`
- an exact TypeScript representation of the real upstream schema

Layer 2:
- `MoeStoryDocument`
- an app-friendly normalized model for DnD, variable logic, and Luau authoring

Then implement explicit transforms:
- `TuesdayProjectJson -> MoeStoryDocument`
- `MoeStoryDocument -> TuesdayProjectJson`

Do not make the normalized editor model the only schema until fixture-backed round-tripping proves that nothing important is lost.

## Phase 0 actions that now look mandatory

- Extract the exact top-level JSON contract from real examples and docs
- Build fixture coverage from real example JSON files, not from the plan
- Enumerate all dialog element shapes from `doc_editor.html`
- Enumerate all runtime-affecting fields from `tuesday.js`
- Decide which Tuesday.js features Moe will support in v1 and which will be passthrough-only
- Treat inline JS and plugins as compatibility requirements, not edge cases

## Practical next step

Create `src/types/TuesdayProjectJson.ts` first, before any React Native editor scaffolding.

That file should mirror upstream naming, including current upstream keys like:
- `languares`
- `launch_story`
- `buttons`
- `blocks`

Only after that should the project define a normalized editor-facing model and serializer pair.
