# trackwhales

A MapleStory Classic World tracker with local screen recognition, a floating game database, Korean translation, and Catppuccin themes.

**[Open trackwhales](https://r5u.github.io/trackwhales/)** · [Source code](https://github.com/r5u/trackwhales)

## Get started

1. Open the site in desktop Chrome or Edge.
2. Click **Share game window** and choose MapleStory in the browser picker. Audio is not captured.
3. Keep the game HUD visible. Tracking opens **Live view** automatically; **Dashboard** returns to the main layout.
4. Keep the inventory balance visible for meso tracking and pickup notifications visible for automatic drop tracking.
5. Use **Pause** to suspend tracking or **Stop sharing** to end capture. **New session**, immediately before **Live view**, starts a fresh session.

The tracker needs HTTPS or localhost for screen sharing. Recognition can miss covered, small, scaled, or unclear text; check readings and quantities against the game.

## EXP and character tracking

- Character name, level, recognized map, EXP amount, and level progress from the shared HUD.
- Session EXP gained, EXP/hour, recent pace, time to the next level, and estimated level-up time.
- An EXP history graph and recent accepted captures. Recent captures appear while sharing, beside the preview.
- Map EXP comparison across recognized map visits.
- Level-up confetti for 15 seconds, including in Compact view.
- Session readings saved in this browser. Stopping sharing keeps accepted readings; refreshing requires choosing the game window again.
- The Live view timer counts active tracking time and excludes paused/offline time. Its dot is red while inactive and green while tracking.

Uncertain readings are rejected rather than silently replacing an accepted value. OCR estimates are not guaranteed game statistics.

## Layouts and floating windows

- **Dashboard:** session overview, current character, capture controls, and a tool dock.
- **Live view:** character/map summary, progress, run metrics, EXP graph, and shared-game preview. It can open while offline and has **Start sharing**, pause/resume, stop, and dashboard controls. Its panels adapt to browser height.
- **Compact view:** a separate, small read-only pop-out with level, progress, rates, and a compact EXP chart. Keep the main tracker open to supply readings.
- **Floating tools:** Mesos & potion costs, Mob drops & NPC value, Map EXP comparison, Pickup notifications, Quickslot potions, and Database. Drag their title bars, resize them, minimize or close them, then reopen from their buttons.
- Drag tool windows into the dock to latch them into place; drag them out to detach. Session and dock heights resize together. Layout preferences are saved locally.
- Small question-mark controls explain features. Checkboxes, scrollbars, windows, and charts follow the theme.

## Mesos, potions, and drops

### Mesos & potion costs

Recognizes the inventory meso balance while it is visible. Shows the current total, session change, trailing balance change/hour, estimated gross mesos/hour, and separate HP/MP potion costs.

**Adjust manually** opens calibration inside the Mesos window. With sharing active, choose the meso, level, or EXP selector and drag around the corresponding readout in the capture. Use **Done** to close the picker or reset the saved regions to restore automatic detection.

### Quickslot potions

Assign potion types to detected quickslots, enable count tracking, rescan slots, and reset recorded usage. Estimated costs use observed potion-count changes and configured/default unit prices; they are estimates, not a complete transaction ledger.

### Mob drops & NPC value

- **Automatic pickup detection** adds recognized names and quantities from pickup notifications.
- Recognized gold-highlighted inventory stacks provide another detection path. A confirmed first count establishes a baseline; later count increases add drops. Unchanged or decreasing counts do not add drops.
- Automatic/manual mode is optional. Turn automatic detection off to enter item names, quantities, and prices yourself.
- ETC names resolve against the saved MeowDB catalogue, with NPC sell-back values rather than market prices. Uncertain matches stay unpriced.
- Override an item's NPC price; clear the field to restore its automatic price.
- A small **×** beside each item removes its existing tracked quantity and value. Future pickups can still be tracked.
- View collected quantities, total NPC value, hourly value, and pickup history; reset drops independently when needed.

The ETC price catalogue is a November 5, 2026 snapshot. Keep the relevant game areas visible and review automatic results.

## Database

**Database**, beside **Translator**, opens inside the site as a draggable, resizable, minimizable window. It also works from Live view and can dock with the other tools. Minimize/reopen preserves the current database search.

Browse and search these ten categories:

| Category | Available details |
| --- | --- |
| Items | Base stats, class requirements, NPC sell values, effects, scroll bonuses, related quests and recipes |
| Monsters | Level, HP/MP, EXP, defenses, elements, animations, spawn maps, and community drop lookup |
| Skills | Class, requirements, descriptions, and a per-rank slider with rank-specific values |
| Maps | Minimap, full-map image, monsters and spawn points, NPCs, connected maps, portals, and training suggestions |
| Quests | Quest giver, requirements, rewards, reward choices, next quest, and chain links |
| NPCs | Locations and related quests |
| Crafting | Discipline, required rank, output, ingredients, costs, and crafting EXP |
| Cash shop | Named client listings, descriptions, and available client price/duration fields |
| Hair & faces | Named appearance records, gender, and images |
| Quest chains | Ordered links to quests in a chain |

Use category filters, sorting, **Search all**, **Show more**, and linked records to explore. **Ctrl+F** focuses database search. **All client fields** exposes the retained underlying record.

### Find training maps

In **Maps**, enter **Your level** or click **Use tracked level**, then choose **Solo** or **6-person party**. Open a suggestion to inspect its map and monsters; **More suggestions** expands the list.

Rankings estimate suitability from monster level, EXP relative to HP, and client spawn points. Solo favors monsters near or slightly below your level. Party mode assumes six active players of similar level and favors denser maps with somewhat stronger monsters. Towns, bosses, invincible monsters, special instances, and identified unreleased/test areas are excluded from recommendations.

These are **not measured EXP/hour or guaranteed optimal routes**. Class, damage, accuracy, movement, buffs, party bonuses, map layout, and server respawns can change actual results. Spawn points are not a live monster count.

The bundled database snapshot is dated October 29, 2026. Client records do not prove live availability. Server drop tables are not included; the community lookup opens a separate wiki search.

## Korean Translator

**Translator** opens a separate, simple pop-out from Dashboard or Live view.

- **Read Korean:** paste Korean text, or share/reuse the game window, select a chat area, and click **Scan chat**. Optional automatic scanning runs every three seconds without overlapping scans.
- **Write Korean:** enter an English reply, including common game shorthand such as `LF2M KPQ`, translate it, and click **Copy**.
- **Ctrl+Enter** translates the current text. Recent translations stay in this tab until cleared or closed.
- Number, percentage, and currency checks reject translations that change those values.
- Copying is explicit. The translator does not type, paste, or send messages to the game.

Text and capture recognition run locally. First use may download language/OCR models. Supported browsers use their built-in local translator; the browser fallback model is roughly 600 MB. Review translations against the visible original. Model/runtime sources and terms are listed in [translator credits](https://r5u.github.io/trackwhales/translator-credits.html).

## OCR refresh rate

Choose **1, 2, 5, 10, or 20 seconds** from the OCR menu. Faster settings use more CPU; longer intervals reduce load. Busy recognition jobs finish before another starts. Pickup checks use a separate faster cadence, so they do not wait for the full EXP refresh interval.

## Appearance

- Four Catppuccin flavors: **Mocha** (default), Macchiato, Frappé, and Latte.
- Fourteen accents at the bottom of the palette menu: Rosewater, Flamingo, **Pink** (default), Mauve, Red, Maroon, Peach, Yellow, Green, Teal, Sky, Sapphire, Blue, and Lavender.
- Flavor and accent are independent, saved locally, and applied across the tracker, floating Database, Translator, and Compact view.
- Atmosphere menu: off, snow, stars with shooting stars, rain, fireflies, petals, bubbles, embers, and confetti. Each effect has a particle-density slider. Atmosphere settings also work in Compact view.
- Sparkle cursor and themed scrollbars. Reduced-motion preferences are respected by atmosphere effects.

## Header and resources

The header includes local time, a daily-reset countdown using the site's community schedule, and hoverable live/total visit counters. Visitor counters use Meus Online; total visits include repeat visits and are not a unique-user total.

Quick links: ClassicRank, cozy.markets, meso.watch, MeowDB, r/MSClassicWorld, the Classic World-filtered Nexon news feed, and this GitHub repository.

## Hosting and local preview

The published site is static and runs on GitHub Pages from **main / root**. Keep `.nojekyll`, the root scripts/styles, split `db-*.json` snapshot files, and `assets/` together. No translation server or API key is needed.

For a local preview, serve this folder rather than opening `index.html` directly:

```sh
python -m http.server 4173
```

Open `http://localhost:4173/`. The browser must still ask you to select a shared window. Database images, model downloads, resource links, and visitor counters can require internet access.

## Sources

- Tracker foundation: [dwlim/maple-exp-tracker](https://github.com/dwlim/maple-exp-tracker).
- Database: [OSMS Data Explorer / @ohmi](https://osmsdataexplorer.com), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); game content and artwork © Nexon. See [database sources](https://r5u.github.io/trackwhales/database-sources.html) for snapshot verification and recommendation limits.
- ETC NPC sell-back values: [MeowDB ETC catalogue](https://meowdb.com/msclassic/item-db/etc).
- Map-name attribution: [MAP-NAMES-ATTRIBUTION.md](MAP-NAMES-ATTRIBUTION.md).
- OCR runtime/model notices: [assets/ocr/NOTICE.md](assets/ocr/NOTICE.md).
