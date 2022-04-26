<%
Function GetSession(pAccountSID)
	Dim dSession
	
	Set dSession = Server.CreateObject("doorsapi.Session")
	dSession.LogDir = "C:\Program Files (x86)\Gestar\log\"
	If pAccountSID = "AC47a3e29520495dc61fe3a8c1fbb6a3e7" Then ' Cloudy
		dSession.SetEndpoints "http://dev.cloudycrm.net/wcf/doors", 1, "http://dev.cloudycrm.net/wcf/legacy", 1
	    dSession.Logon "system", "AQ1sw2", "cloudyvision"
	ElseIf pAccountSID = "AC7c5cbff7f55bc06a4418eb7db4a76489" Then ' Tagle
		dSession.SetEndpoints "http://tagle.cloudycrm.net/wcf/doors", 1, "http://tagle.cloudycrm.net/wcf/legacy", 1
	    dSession.Logon "system", "AQ1sw2", "tagle"
	ElseIf pAccountSID = "AC9eab26ba7f2f959a8645cb9331803325" Then ' Alican
		dSession.SetEndpoints "http://alican.cloudycrm.net/wcf/doors", 1, "http://alican.cloudycrm.net/wcf/legacy", 1
	    dSession.Logon "system", "QWer12", "alican"
	Else
		Err.Raise 1, "hook_lib.asp - GetSession", "AccountSid not registered on webhook"
	End If
	
	Set GetSession = dSession
End Function


' Manda pText como respuesta
Sub SendResponse(pText)
	Dim dom, node
	
	Set dom = Server.CreateObject("MSXML2.DOMDocument.4.0")
	dom.setProperty "SelectionLanguage", "XPath"
	dom.setProperty "NewParser", True
	dom.async = False
	dom.loadXml "<Response />"

	Set node = dom.createNode("element", "Message", "")
	node.text = pText
	dom.documentElement.appendChild node

	Response.ContentType = "text/xml"
	'text/xml, application/xml, text/html: Twilio interprets the returned document as a TwiML XML Instruction Set. This is the most commonly used response.
	'text/plain: Twilio returns the content of the text file to the sender in the form of a message.

	dom.Save Response
End Sub

'------------------------------------------------------
' Devuelve todos los parametros recibidos por el hook
'------------------------------------------------------
'https://www.twilio.com/docs/sms/twiml
'MessageSid: A 34 character unique identifier for the message. May be used to later retrieve this message from the REST API.
'AccountSid: The 34 character id of the Account this message is associated with.
'MessagingServiceSid: The 34 character id of the Messaging Service associated with the message.
'From: The phone number or Channel address that sent this message.
'To: The phone number or Channel address of the recipient.
'Body: The text body of the message. Up to 1600 characters long.
'NumMedia: The number of media items associated with your message
'MediaContentType{N}: The ContentTypes for the Media stored at MediaUrl{N}. The order of MediaContentType{N} matches the order of MediaUrl{N}. If more than one media element is indicated by NumMedia than MediaContentType{N} will be used, where N is the zero-based index of the Media (e.g. MediaContentType0)
'MediaUrl{N}: A URL referencing the content of the media received in the Message. If more than one media element is indicated by NumMedia than MediaUrl{N} will be used, where N is the zero-based index of the Media (e.g. MediaUrl0)

Function GetContext()
	Dim ret, par
	
	ret = "Request.Form" & vbCrLf
	For Each par In Request.Form
		ret = ret & par & ": " & Request.Form(par) & vbCrLF
	Next

	ret = ret & vbCrLf & "Request.QueryString" & vbCrLf
	For Each par In Request.QueryString
		ret = ret & par & ": " & Request.QueryString(par) & vbCrLF
	Next
	
	ret = ret & vbCrLf & "ASP" & vbCrLf
	ret = ret & "Session.SessionId: " & Session.SessionId & vbCrLf
	
	GetContext = ret
End Function
%>