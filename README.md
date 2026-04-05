# MovieHive

## Teammate Setup: SQL Server TCP Port and .env

Use these steps if backend shows database connection failed.

1. Open Registry Editor:
	- Press `Windows + R`
	- Type `regedit`
	- Press Enter

2. Find SQL instance mapping:
	- Go to `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL`
	- Find `SQLEXPRESS`
	- Note its mapped value (example: `MSSQL17.SQLEXPRESS`)

3. Open TCP settings for that instance:
	- Go to `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Microsoft SQL Server\<mapped-value>\MSSQLServer\SuperSocketNetLib\Tcp\IPAll`

4. Decide which port to use for `DB_PORT`:
	- If `TcpPort` has a value, use `TcpPort`
	- If `TcpPort` is empty, use `TcpDynamicPorts`

5. Update `backend/.env` with local machine values:

```env
DB_SERVER=YOUR-PC-NAME\SQLEXPRESS
DB_NAME=MovieDB
DB_USER=moviehive_app
DB_PASSWORD=your_password
DB_PORT=your_actual_port
PORT=3001
```

6. Start project:

```powershell
npm run dev
```

7. Verify backend health:
	- Open `http://localhost:3001/api/health`
	- `dbConnected` should be `true`

Important:
- Do not assume `1433` for all machines.
- SQL Server Express often uses dynamic ports, so each teammate may have a different `DB_PORT`.