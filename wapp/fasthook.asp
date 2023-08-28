<%
Dim cvCnn, masterCnn, instCnn

twSid = Request.Form("AccountSid")
msgSid = Request.Form("MessageSid")
msgStat = Request.Form("MessageStatus")

' Datos de prueba, comentar en produccion
'twSid = "ACc6d716adbda50f1c23dcb6612d1e8b96" ' GNI
'msgSid = "MM65d6e6253390baff1aad7b58972a56df"
'msgStat = "read"

errSource = "twilio_webhook"

On Error Resume Next
tryCatch()
vErr = Array(Err.Number, Err.Source, Err.Description)

' Cierro todas las conexiones
instCnn.Close
masterCnn.Close
cvCnn.Close

On Error Goto 0

If vErr(0) <> 0 Then
	' Aca deberiamos ver si no tenemos que mandarlo por mail o algo asi
	' El errRaise no se si aparece en la consola de Twilio
	Err.Raise vErr(0), vErr(1), vErr(2)
End If


Sub tryCatch()
	' Conexion a Cloudy para leer Dispenser
	Set cvCnn = CreateObject("ADODB.Connection")
	cvCnn.Open "Provider=SQLOLEDB.1;Password=CloudyVision2016$;Persist Security Info=True;User ID=dbCloudyVision;Initial Catalog=CloudyVision;Data Source=10.21.31.14,28214"

	' Instances
	sql = "select f.INSTANCE, f.SERVER from SYS_FIELDS_478 f inner join SYS_DOCUMENTS d " & _
		"on f.DOC_ID = d.DOC_ID where d.FLD_ID = 5236 and TWILIO_SID = " & sqlEnc(twSid)
	Set rcs = openRec(sql, cvCnn)
	If rcs.RecordCount > 0 Then
		instance = rcs("INSTANCE").Value
		serverName = rcs("SERVER").Value
	Else
		Err.Raise 1, errSource, "Twilio SID not found"
	End If
	rcs.Close

	' Servers
	sql = "select DBCONNECTION from SYS_FIELDS_477 f inner join SYS_DOCUMENTS d " & _
		"on f.DOC_ID = d.DOC_ID where d.FLD_ID = 5235 and NAME = " & sqlEnc(serverName)
	Set rcs = openRec(sql, cvCnn)
	If rcs.RecordCount > 0 Then
		masterCnnString = rcs("DBCONNECTION").Value
	Else
		Err.Raise 1, errSource, "Server not found"
	End If
	rcs.Close

	' Conexion a la master
	Set masterCnn = CreateObject("ADODB.Connection")
	masterCnn.Open masterCnnString

	' Busca la instancia
	sql = "select CONNECTIONSTRING from SYS_INSTANCES where NAME = " & sqlEnc(instance)
	Set rcs = openRec(sql, masterCnn)
	If rcs.RecordCount > 0 Then
		instCnnString = rcs("CONNECTIONSTRING").Value
	Else
		Err.Raise 1, errSource, "Instance not found"
	End If
	rcs.Close

	' Conexion a la instancia
	Set instCnn = CreateObject("ADODB.Connection")
	instCnn.Open instCnnString

	' Busca la carpeta Messages
	sql = "select VALUE from SYS_SETTINGS where SETTING = 'WHATSAPP_CONNECTOR_FOLDER'"
	Set rcs = openRec(sql, instCnn)
	If rcs.RecordCount > 0 Then
		wappFld = rcs("VALUE").Value
	Else
		Err.Raise 1, errSource, "WHATSAPP_CONNECTOR_FOLDER setting missing"
	End If
	rcs.Close

	sql = "select FLD_ID, FRM_ID from SYS_FOLDERS where NAME = 'messages' and PARENT_FOLDER = " & wappFld
	Set rcs = openRec(sql, instCnn)
	If rcs.RecordCount > 0 Then
		msgFld = rcs("FLD_ID").Value
		msgFrm = rcs("FRM_ID").Value
	Else
		Err.Raise 1, errSource, "MESSAGES folder not found"
	End If
	rcs.Close

	' Busca el message
	sql = "select f.DOC_ID from SYS_FIELDS_" & msgFrm & " f inner join SYS_DOCUMENTS d " & _
		"on f.DOC_ID = d.DOC_ID where d.FLD_ID = " & msgFld & " and MESSAGESID = " & sqlEnc(msgSid)
	' Agregar este filtro si llegan a venir los status delivered despues de read
	' sql = sql & " and STATUS not in ('read', 'undelivered')"
	Set rcs = openRec(sql, instCnn)

	If rcs.RecordCount > 0 Then
		' Actualiza
		docId = rcs("DOC_ID").Value
		
		sql = "update SYS_FIELDS_" & msgFrm & " set STATUS = " & sqlEnc(msgStat) & " where DOC_ID = " & docId & vbCrLf & _
			"update SYS_DOCUMENTS set MODIFIED = getdate() where DOC_ID = " & docId
		instCnn.Execute sql
	Else
		Err.Raise 1, errSource, "MESSAGE not found"
	End If
	rcs.Close
End Sub

Function sqlEnc(value)
	sqlEnc = "'" & Replace(value, "'", "''") & "'"
End Function

Function openRec(sql, cnn)
    Set oRcs = CreateObject("ADODB.Recordset")
    oRcs.CursorLocation = 3 ' adUseClient
    oRcs.CursorType = 3 ' adOpenStatic
    oRcs.LockType = 4 ' adLockBatchOptimistic
    oRcs.MaxRecords = 100

    oRcs.Open sql, cnn
    
    Set oRcs.ActiveConnection = Nothing
    Set openRec = oRcs
End Function
%>