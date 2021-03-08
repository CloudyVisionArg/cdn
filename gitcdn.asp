<%
' Este asp permite utilizar Github como CDN, con la ventaja que no hace cache (a diferencia de jsDelivr y raw.githubusercontent.com)
' Ej: <script src="http://cloudycrm.net/c/gitcdn.asp?owner=CloudyVisionArg&repo=cdn?branch=master&path=/wapp.js"
' ESTE ASP ES PARA DESARROLLO ya que las API de Github tienen limites de hits, PARA PRODUCCION USAR jsDelivr

owner = Request("owner") & ""
If owner = "" Then owner = "CloudyVisionArg"
repo = Request("repo") & ""
If repo = "" Then repo = "cdn"
path = Request("path") & ""
branch = Request("branch") & ""
If branch = "" Then branch = "master"

Set xhr = CreateObject("MSXML2.XMLHTTP")
URL = "https://api.github.com/repos/" & owner & "/" & repo & "/contents" & path & "?ref=" & branch
xhr.Open "GET", URL, False
xhr.setRequestHeader "Authorization", "token 44483e5cf393cf30ada4f942656a41a8bc9f6d95"
xhr.setRequestHeader "accept", "application/vnd.github.VERSION.raw"
xhr.Send

Response.AddHeader "Pragma", "no-cache"
Response.CacheControl = "no-cache"
Response.Expires = -1

If LCase(Right(path, 3)) = ".js" Then
	Response.ContentType = "text/javascript"
ElseIf LCase(Right(path, 4)) = ".css" Then
	Response.ContentType = "text/css"
Else
	Response.ContentType = "text/plain"
End If

Response.Write xhr.responseText
%>