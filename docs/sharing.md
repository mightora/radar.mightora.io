# Sharing format

The editor stores share data in the URL fragment so the CSV is not sent to the static host. A link has this shape:

`#/view/<base64url-deflate-payload>`, `#/edit/<base64url-deflate-payload>` or `#/embed/<base64url-deflate-payload>`

Version 1 contains `version`, `csv`, `mode`, an optional `selectedRadarName`, and for `embed` an optional boolean `table` (default `true`). The JSON is UTF-8 encoded, compressed with browser `deflate-raw`, and encoded as unpadded Base64URL.

`embed` opens a read-only page containing only the radar, its legend and, unless `table` is `false`, the technology table. The dialog offers matching `<iframe>` embed code.

Image links are not share payloads: they are self-contained `data:image/svg+xml` or `data:image/png` URLs of the displayed radar, with matching `<img>` embed code. There is no hosted image file, so they work where data URLs are accepted as an image source.

Share links are encoded, not encrypted. Anyone who receives a link can decode and read its radar data. The application does not provide expiry, revocation, access control, or server-side storage.

Links longer than normal messaging or browser limits should be replaced with a downloaded CSV or project file. The decoder rejects unsupported versions and malformed compressed content without placing partial data into the editor.
