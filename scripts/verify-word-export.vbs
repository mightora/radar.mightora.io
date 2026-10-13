' Run the focused word-export.spec.js first, then cscript //nologo //T:180 scripts/verify-word-export.vbs.
' Uses only the local fixture and saves test-results/word-roundtrip.docx; no user documents.
Option Explicit
On Error Resume Next
Dim app, doc, group, shape, objects, edited, filename, destination
filename = CreateObject("Scripting.FileSystemObject").GetAbsolutePathName("test-results/editable-radar.docx")
destination = CreateObject("Scripting.FileSystemObject").GetAbsolutePathName("test-results/word-roundtrip.docx")
Set app = CreateObject("Word.Application")
If Err.Number <> 0 Then Fail "Word unavailable: " & Err.Description
app.Visible = False
app.DisplayAlerts = 0
Set doc = app.Documents.Open(filename, False, False, False)
If Err.Number <> 0 Then Fail "Open failed: " & Err.Description
WScript.Echo "Opened in Word " & app.Version & "; inline drawings=" & doc.InlineShapes.Count & "; floating drawings=" & doc.Shapes.Count
If doc.InlineShapes.Count = 1 Then
 Set group = doc.InlineShapes(1).ConvertToShape
ElseIf doc.Shapes.Count = 1 Then
 Set group = doc.Shapes(1)
Else
 Fail "Expected one native radar group."
End If
If Err.Number <> 0 Then Fail "Convert group failed: " & Err.Description
WScript.Echo "Group type=" & group.Type & "; wrap=" & group.WrapFormat.Type & "; child objects=" & group.GroupItems.Count
If group.GroupItems.Count < 15 Then Fail "Missing separate objects."
group.GroupItems(1).Fill.ForeColor.RGB = RGB(200, 220, 240)
group.GroupItems(1).Left = group.GroupItems(1).Left + 1
If Err.Number <> 0 Then Fail "Shape edit failed: " & Err.Description
edited = False
For Each shape In group.GroupItems
 Err.Clear
 If shape.TextFrame.HasText <> 0 Then
  If Err.Number = 0 Then
   shape.TextFrame.TextRange.Text = "Word edit verified"
   If Err.Number = 0 Then
    edited = True
    Exit For
   End If
  End If
 End If
Next
If Not edited Then Fail "No editable native text box found."
Err.Clear
Set objects = group.Ungroup
If Err.Number <> 0 Then Fail "Ungroup failed: " & Err.Description
WScript.Echo "Ungrouped objects=" & objects.Count & "; text and shape edits succeeded"
doc.SaveAs2 destination, 16
If Err.Number <> 0 Then Fail "Save failed: " & Err.Description
doc.Close 0
app.Quit 0
WScript.Echo "Word round-trip saved: " & destination
WScript.Quit 0
Sub Fail(message)
 WScript.Echo message
 If IsObject(doc) Then doc.Close 0
 If IsObject(app) Then app.Quit 0
 WScript.Quit 1
End Sub
