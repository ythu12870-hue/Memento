# Reference Analysis — `Love.html`

## Source inspected

- Source file: `Love.html` supplied by the project owner.
- Document language: `my` (Myanmar).
- Character encoding and viewport metadata are present.
- External assets: Google Fonts (DM Sans, Dancing Script, Great Vibes, Noto Sans Myanmar) and one remotely hosted MP3; six remote photo URLs are declared, with repeated URLs in the source.
- This analysis describes the supplied source, not a claim that the remote media URLs remain available.

## Observed structure and behavior

1. **Opening scenes:** four full-screen `.scene` sections (`s1`–`s4`) with a small English kicker, emoji, Myanmar text, gradient button, and footer. Inline `onclick` handlers move from one scene to the next.
2. **Countdown:** `startCount()` displays 3, 2, 1 and a heart before `openFinal()` reveals the presentation.
3. **Photo presentation:** `setupPhotos()` creates images from the `PHOTOS` array. CSS opacity transitions crossfade the active photo. The current source repeats its third photo URL for several entries.
4. **Music and timeline:** an `<audio>` element points to a remote MP3. `LYRICS` has nine message timestamps at 0, 4, 10, 15, 20, 25, 27, 29 and 33 seconds. `loop()` compares `audio.currentTime` to these timestamps and changes the message; photo changes are distributed over the audio duration. A progress bar and elapsed-time label are shown.
5. **Autoplay fallback:** `tryPlay()` catches a rejected `play()` promise and displays a manual play button.
6. **Final screen:** when audio ends, a final overlay appears with a Myanmar closing message and a replay action that reloads the whole document.
7. **Visual system:** ice blue, pastel lavender and soft purple gradients; dark blue-violet text; translucent glass panels; rounded borders; blur and soft shadows; floating hearts; animated card and message transitions.
8. **Responsive and motion preferences:** a `max-width:560px` breakpoint adjusts the layout; `prefers-reduced-motion:reduce` substantially reduces animation and transition duration.
9. **Typography:** Noto Sans Myanmar and Myanmar Text fallbacks are specified for Myanmar content, alongside DM Sans and decorative Latin fonts.

## Preserve / Refactor / Extend

### Preserve
- The recognizable ice-blue/lavender glassmorphism identity for the romantic flagship template.
- Sequential opening scenes and the optional countdown reveal.
- Full-screen photo presentation, message cards, audio timeline, progress/time indicator, and a final replayable reveal.
- Distinct exported motion per template: romantic slow zoom/fade, birthday drop-in, friendship flying-photo/polaroid, family gentle dissolve, and motivation upward reveal.
- Keep Pause/Resume, Restart music, manual Play fallback, and Replay controls; do not show Skip countdown or Finish controls in the exported HTML.
- Floating hearts, soft animated background, rounded gradient actions, and Myanmar-friendly typography.

### Refactor
- Replace inline event handlers with registered listeners and keep user-generated content out of `innerHTML`.
- Replace the continuously scheduled `requestAnimationFrame` loop with media events (`timeupdate`, `seeked`, `loadedmetadata`, `ended`) so playback pause/seek states are more predictable and avoid unnecessary frame work.
- Make countdown/replay cleanup explicit and prevent repeated clicks from creating overlapping timers.
- Handle missing/failed audio and image assets visibly.
- Provide accessible button focus, live announcement of message changes, reduced-motion support, and manual playback.
- Avoid unnecessary duplicate image requests and lazy-load noninitial photos where practical.

### Extend
- Make creator/recipient names, forms of address, scene text, message list, theme, media, and countdown configurable in the creator wizard.
- Add configurable timeline events and photo/message synchronization.
- Add preview, standalone export, and later hosted publishing, project persistence, access controls, revocation, administration, and premium entitlements.

## Current implementation status

The starter creator supports five experience categories, editable creator/recipient/opening/closing text, three editable message cards, up to 12 selected photos, optional audio up to 12 MB, three visual themes, a countdown toggle, and a standalone HTML download. The generated experience follows the scene → optional countdown → photo/message presentation → ending/replay pattern. Each of the five template categories has its own photo/card transition style. The exported countdown has no skip button, and the presentation has no manual Finish button; the ending appears when audio or the no-audio slideshow completes. Audio-backed messages and photos follow the media playback position; without audio, messages and photos advance on a short automatic slideshow. User text is written through `textContent` in the generated experience and HTML-sensitive characters in the serialized configuration are escaped before embedding.

## Known limitations

- This remains a front-end prototype: drafts are not persisted beyond the current browser session.
- There is no database, authentication, hosted publishing, revocation, admin dashboard, subscription billing, or private-key activation.
- Google Fonts are optional external requests; the generated experience has system font fallbacks, but an offline environment may not load the web fonts.
- Photos and audio are embedded as data URLs in the exported HTML. Large media can produce very large files; the current creator caps photos at 12 and audio at 12 MB but does not yet enforce a total export-size limit.
- Timeline positions are currently distributed evenly across the audio duration; a visual timeline editor and per-message timestamp fields remain future work.
- Automated tests and production deployment checks must be run before treating this as production-ready.


## Current category and music update

The template picker is organized into five categories (Relationship, Friendship, Family, Celebration, Personal Growth), with five templates in each category. The anniversary surprise asks for an anniversary date, and the exported experience shows the date and days together. Each template has a folder under `public/music/<template-id>/` with five track filename slots (`track-1.mp3` to `track-5.mp3`). Add licensed audio files there. The app embeds a chosen library track into the standalone HTML at export. This project does not bundle commercial/trending songs.
