<!-- #include file="hook_lib.asp"-->
<%
' Este hook recibe nuevos mensajes

Session.CodePage = 65001

On Error Resume Next
TryCatch
errN = Err.Number
errD = Err.Description
On Error Goto 0
If errN <> 0 Then SendResponse "Disculpas, estamos con problemas" & vbLf & "Error: " & errD & " (" & errN & ")"


Sub TryCatch()
	Dim dSession, fldId, fldWapp, fldMsg, docMsg, i, media
	
	Set dSession = GetSession(Request.Form("AccountSid"))
	
	fldId = dSession.Settings("WHATSAPP_CONNECTOR_FOLDER")
	If fldId & "" = "" Then dSession.ErrRaise "WHATSAPP_CONNECTOR_FOLDER setting missing"
	
	Set fldWapp = dSession.FoldersGetFromId(CLng(fldId))
	Set fldMsg = fldWapp.Folders("Messages")
	Set docMsg = fldMsg.DocumentsNew
	
	docMsg("AccountSid").Value = Request.Form("AccountSid")
	docMsg("MessageSid").Value = Request.Form("MessageSid")
	docMsg("From").Value = Request.Form("From")
	docMsg("To").Value = Request.Form("To")
	docMsg("Body").Value = Request.Form("Body")
	docMsg("Direction").Value = "inbound"
	docMsg("NumMedia").Value = Request.Form("NumMedia")
	docMsg("Latitude").Value = Request.Form("Latitude")
	docMsg("Longitude").Value = Request.Form("Longitude")
	
	media = ""
	For i = 1 To Request.Form("NumMedia")
    	media = ", {""Url"": """ & Request.Form("MediaUrl" & i - 1) & """, ""ContentType"": """ & Request.Form("MediaContentType" & i - 1) & """}"
    Next
    If media <> "" Then media = "[" & Mid(media, 3) & "]"
    docMsg("Media").Value = media

	docMsg.Save
	
	arr = Split(dSession.Version, ".")
	ver = Right("000" & arr(0), 3) & Right("000" & arr(1), 3) & Right("000" & arr(2), 3) & Right("000" & arr(3), 3)
	
	If ver < "007004035002" Then ' 7.4.35.2
		' Baja el BODY en Unicode a la base
		dSession.Db.Execute "update SYS_FIELDS_" & fldMsg.Form.Id & " set BODY = N'" & _
			Replace(Request.Form("Body"), "'", "''") & "' where MESSAGESID = '" & Request.Form("MessageSid") & "'"
	End If
	
	'SendResponse GetContext() ' Para depurar, responde con todo lo recibido
	
	dSession.LogOff
End Sub
%>