<!-- #include file="hook_lib.asp"-->
<%
' Este hook recibe actualizaciones de estado de los mensajes

Dim dSession, fldId, fldWapp, fldMsg
Dim rcs, sql

Set dSession = GetSession(Request.Form("AccountSid"))

' Actualizo por UPDATE xq da mucho "el doc ha sido modificado..."
' sobre todo cdo llegan casi juntas la notif de entrega y lectura

fldId = dSession.Settings("WHATSAPP_CONNECTOR_FOLDER")
If fldId & "" <> "" Then
	Set fldWapp = dSession.FoldersGetFromId(CLng(fldId))
	Set fldMsg = fldWapp.Folders("Messages")
	Set rcs = dSession.Db.OpenRecordset("select DOC_ID from SYS_FIELDS_" & fldMsg.Form.Id & " where MESSAGESID = " & _
		dSession.Db.SqlEncode(Request.Form("MessageSid"), 1) & " and STATUS not in ('read', 'undelivered')")
	If Not rcs.EOF Then
		docId = rcs("DOC_ID").Value
		dSession.Db.Execute "update SYS_FIELDS_" & fldMsg.Form.Id & " set STATUS = " & _
			dSession.Db.SqlEncode(Request.Form("MessageStatus"), 1) & " where DOC_ID = " & docId & _
			" and STATUS not in ('read', 'undelivered')" & vbCrLf & _
			"update SYS_DOCUMENTS set MODIFIED = getdate() where DOC_ID = " & docId
	End If
	rcs.Close
	'todo: ver si sirven estos otros datos que vienen:
	'From: whatsapp:+5493517697156
	'ChannelToAddress: +54351528XXXX
	'StructuredMessage: true
	'To: whatsapp:+543515284577
	'ChannelInstallSid: XE13ed08c80401d9e2ccb4ff0b8b621c1c
	'ChannelPrefix: whatsapp
	'ApiVersion: 2010-04-01
End If

dSession.Logoff
%>