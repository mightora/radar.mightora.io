# Sharing format

The editor stores share data in the URL fragment so the CSV is not sent to the static host. A link has this shape:

`#/view/<base64url-deflate-payload>` or `#/edit/<base64url-deflate-payload>`

Version 1 contains `version`, `csv`, `mode`, and an optional `selectedRadarName`. The JSON is UTF-8 encoded, compressed with browser `deflate-raw`, and encoded as unpadded Base64URL.

Share links are encoded, not encrypted. Anyone who receives a link can decode and read its radar data. The application does not provide expiry, revocation, access control, or server-side storage.

Links longer than normal messaging or browser limits should be replaced with a downloaded CSV or project file. The decoder rejects unsupported versions and malformed compressed content without placing partial data into the editor.
